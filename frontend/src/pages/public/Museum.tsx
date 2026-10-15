import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Landmark,
  Search,
  QrCode,
  Eye,
  Printer,
  Download,
  Copy,
  Check,
  X,
  Sparkles,
  MapPin,
  Calendar,
  Layers,
  ShieldCheck,
  Headphones,
  Video,
  Compass,
  ExternalLink,
  Share2,
  Tag,
  Clock,
  Box,
  Volume2,
  RefreshCw,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import QRCode from 'qrcode';
import { sectoralApi } from '../../api/sectoral';
import './Museum.css';

export interface PublicMuseumAsset {
  id: string;
  assetId: string;
  nameNp: string;
  nameEn?: string;
  category: string;
  subCategory?: string;
  history?: string;
  usage?: string;
  origin?: string;
  estimatedPeriod?: string;
  material?: string;
  condition?: string;
  museumLocation?: string;
  latitude?: number;
  longitude?: number;
  photoUrl?: string;
  videoUrl?: string;
  audioUrl?: string;
  model3dUrl?: string;
  verificationStatus: string;
  createdAt?: string;
}

const CATEGORY_OPTIONS = [
  'सबै सामग्री',
  'ऐतिहासिक कलाकृति',
  'पुरातत्व र मूर्ति',
  'धार्मिक तथा पूजा सामग्री',
  'परम्परागत पोशाक तथा गरगहना',
  'दस्तावेज, पाण्डुलिपि र अभिलेख',
  'हस्तकला र काष्ठकला',
  'कृषि तथा घरायसी प्राचीन औजार',
  'हातहतियार र सुरक्षा उपकरण',
  'सिक्का तथा मुद्रा',
];

const getYouTubeEmbedUrl = (url?: string): string | null => {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match && match[1] ? `https://www.youtube.com/embed/${match[1]}` : null;
};

export const Museum: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const directAssetId = searchParams.get('assetId');

  // Filters & State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('सबै सामग्री');
  const [selectedCondition, setSelectedCondition] = useState<string>('all');

  // Modals
  const [detailItem, setDetailItem] = useState<PublicMuseumAsset | null>(null);
  const [qrModalItem, setQrModalItem] = useState<PublicMuseumAsset | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Fetch Museum Assets
  const { data: rawAssets = [], isLoading, isError } = useQuery({
    queryKey: ['publicMuseumAssets'],
    queryFn: () => sectoralApi.getMuseumAssets(),
  });

  // Normalize Data
  const catalogList: PublicMuseumAsset[] = useMemo(() => {
    if (!Array.isArray(rawAssets)) return [];
    return rawAssets.map((item: any, idx: number) => ({
      id: item.id || `mus-${idx}`,
      assetId: item.assetId || item.code || `MUS-${String(idx + 1).padStart(4, '0')}`,
      nameNp: item.nameNp || item.titleNepali || item.name || 'सांस्कृतिक सामग्री',
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
    }));
  }, [rawAssets]);

  // Deep linking: auto-open item if ?assetId=MUS-XXXX is present
  useEffect(() => {
    if (directAssetId && catalogList.length > 0) {
      const match = catalogList.find(
        (x) => x.assetId.toLowerCase() === directAssetId.toLowerCase() || x.id === directAssetId
      );
      if (match) {
        setDetailItem(match);
      }
    }
  }, [directAssetId, catalogList]);

  // Generate QR Data URL whenever qrModalItem or detailItem opens
  useEffect(() => {
    const activeItem = qrModalItem || detailItem;
    if (activeItem) {
      const publicUrl = `${window.location.origin}/museum?assetId=${encodeURIComponent(activeItem.assetId)}`;
      QRCode.toDataURL(publicUrl, {
        width: 320,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('Error generating QR code:', err));
    } else {
      setQrDataUrl('');
      setCopiedLink(false);
    }
  }, [qrModalItem, detailItem]);

  // Summary Metrics
  const stats = useMemo(() => {
    const total = catalogList.length;
    const sculptures = catalogList.filter((x) =>
      (x.category || '').includes('मूर्ति') || (x.category || '').includes('कलाकृति')
    ).length;
    const mediaGuides = catalogList.filter((x) => x.audioUrl || x.videoUrl || x.model3dUrl).length;
    const preservedGood = catalogList.filter(
      (x) => (x.condition || '').includes('राम्रो') || (x.condition || '').includes('उत्कृष्ट')
    ).length;

    return { total, sculptures, mediaGuides, preservedGood };
  }, [catalogList]);

  // Filtered Assets
  const filteredCatalog = useMemo(() => {
    return catalogList.filter((item) => {
      // Search
      const q = searchTerm.toLowerCase().trim();
      if (q) {
        const matches =
          item.nameNp.toLowerCase().includes(q) ||
          (item.nameEn && item.nameEn.toLowerCase().includes(q)) ||
          item.assetId.toLowerCase().includes(q) ||
          (item.estimatedPeriod && item.estimatedPeriod.toLowerCase().includes(q)) ||
          (item.material && item.material.toLowerCase().includes(q)) ||
          (item.museumLocation && item.museumLocation.toLowerCase().includes(q)) ||
          (item.origin && item.origin.toLowerCase().includes(q));
        if (!matches) return false;
      }

      // Category
      if (selectedCategory !== 'सबै सामग्री') {
        if (item.category !== selectedCategory) return false;
      }

      // Condition
      if (selectedCondition !== 'all') {
        if (item.condition !== selectedCondition) return false;
      }

      return true;
    });
  }, [catalogList, searchTerm, selectedCategory, selectedCondition]);

  // Copy Public Link or Share
  const handleCopyLink = (assetId: string) => {
    const url = `${window.location.origin}/museum?assetId=${encodeURIComponent(assetId)}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleShare = async (item: PublicMuseumAsset) => {
    const url = `${window.location.origin}/museum?assetId=${encodeURIComponent(item.assetId)}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${item.nameNp} (${item.assetId}) - पाँचपोखरी थाङपाल सङ्ग्रहालय`,
          text: item.history || item.usage || item.nameNp,
          url,
        });
        return;
      } catch {
        // Fallback to copy link
      }
    }
    handleCopyLink(item.assetId);
  };

  // Download QR Code PNG
  const handleDownloadQr = (assetId: string, nameNp: string) => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `QR-${assetId}-${nameNp}.png`;
    link.click();
  };

  const isFilterActive = searchTerm !== '' || selectedCategory !== 'सबै सामग्री' || selectedCondition !== 'all';

  return (
    <div className="pub-museum-container">
      {/* ═════════════════════════════════════════════════════════════════
          HERO BANNER & STATS
          ═════════════════════════════════════════════════════════════════ */}
      <section className="pub-museum-hero">
        <div className="pub-museum-hero-content">
          <div className="pub-museum-badge-top">
            <Sparkles size={15} />
            <span>पाँचपोखरी थाङपाल गाउँपालिका • डिजिटल सङ्ग्रहालय पोर्टल</span>
          </div>

          <h1 className="pub-museum-hero-title">
            <Landmark size={32} color="#fde68a" />
            <span>सांस्कृतिक तथा ऐतिहासिक सङ्ग्रहालय क्याटलग</span>
          </h1>

          <p className="pub-museum-hero-sub">
            पाँचपोखरी थाङपालका प्राचीन मूर्ति, थाङ्का, हस्तलिखित पाण्डुलिपि, परम्परागत वेशभूषा तथा ऐतिहासिक
            सम्पदाहरूको प्रमाणीकृत डिजिटल अभिलेख। प्रत्येक सामग्रीको व्यक्तिगत QR कोड स्क्यान गरी डिजिटल
            अडियो-भिडियो गाइड तथा इतिहास अवलोकन गर्नुहोस्।
          </p>

          <div className="pub-museum-kpi-grid">
            <div className="pub-museum-kpi-card">
              <div className="pub-museum-kpi-icon">
                <Landmark size={22} />
              </div>
              <div>
                <div className="pub-museum-kpi-num">{stats.total}</div>
                <div className="pub-museum-kpi-label">सङ्ग्रहित सम्पदा सूची</div>
              </div>
            </div>

            <div className="pub-museum-kpi-card">
              <div className="pub-museum-kpi-icon" style={{ color: '#86efac' }}>
                <ShieldCheck size={22} />
              </div>
              <div>
                <div className="pub-museum-kpi-num">{stats.sculptures}</div>
                <div className="pub-museum-kpi-label">मूर्ति तथा कलाकृति</div>
              </div>
            </div>

            <div className="pub-museum-kpi-card">
              <div className="pub-museum-kpi-icon" style={{ color: '#93c5fd' }}>
                <Headphones size={22} />
              </div>
              <div>
                <div className="pub-museum-kpi-num">{stats.mediaGuides}</div>
                <div className="pub-museum-kpi-label">अडियो / भिडियो गाइड</div>
              </div>
            </div>

            <div className="pub-museum-kpi-card">
              <div className="pub-museum-kpi-icon" style={{ color: '#fbcfe8' }}>
                <QrCode size={22} />
              </div>
              <div>
                <div className="pub-museum-kpi-num">{stats.total}</div>
                <div className="pub-museum-kpi-label">QR कोड प्रमाणीकरण</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════════
          SEARCH, CATEGORY PILLS & TOOLBAR
          ═════════════════════════════════════════════════════════════════ */}
      <section className="pub-museum-toolbar">
        <div className="pub-museum-search-row">
          <div className="pub-museum-search-box">
            <Search size={18} className="pub-museum-search-icon" />
            <input
              type="text"
              className="pub-museum-search-input"
              placeholder="सम्पदाको नाम, Asset ID (उदा: MUS-0010), कालखण्ड वा शोकेस खोज्नुहोस्..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                type="button"
                className="pub-museum-search-clear"
                onClick={() => setSearchTerm('')}
                title="खोज खाली गर्नुहोस्"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <select
            className="pub-museum-select"
            value={selectedCondition}
            onChange={(e) => setSelectedCondition(e.target.value)}
          >
            <option value="all">सबै संरक्षण अवस्था</option>
            <option value="उत्कृष्ट">उत्कृष्ट (Excellent)</option>
            <option value="सामान्य राम्रो">सामान्य राम्रो (Good)</option>
            <option value="मर्मत/संरक्षण आवश्यक">मर्मत आवश्यक (Restoration)</option>
          </select>
        </div>

        {/* Category Pills & Reset Button */}
        <div className="pub-museum-categories">
          <span className="pub-museum-category-label">विधा:</span>
          {CATEGORY_OPTIONS.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`pub-museum-cat-pill ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}

          {isFilterActive && (
            <button
              type="button"
              className="pub-museum-btn-reset"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('सबै सामग्री');
                setSelectedCondition('all');
              }}
              title="सबै फिल्टरहरू हटाउनुहोस्"
            >
              <X size={13} />
              <span>फिल्टर रिसेट</span>
            </button>
          )}
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════════
          CATALOG GRID (READ-ONLY)
          ═════════════════════════════════════════════════════════════════ */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '8px' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Landmark size={20} color="#4338ca" />
            <span>डिजिटल क्याटलग प्रदर्शनी सूची ({filteredCatalog.length})</span>
          </h2>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
            🔒 आधिकारिक सार्वजनिक अभिलेख (Read-Only)
          </span>
        </div>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: '#64748b' }}>
            <div className="dt-spin" style={{ display: 'inline-block', marginBottom: '0.75rem' }}>
              <Landmark size={36} color="#4338ca" />
            </div>
            <p style={{ fontWeight: 700, fontSize: '0.95rem' }}>सङ्ग्रहालय क्याटलग लोड हुँदैछ...</p>
          </div>
        ) : filteredCatalog.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '3.5rem 1.5rem',
              backgroundColor: '#f8fafc',
              borderRadius: '16px',
              border: '2px dashed #cbd5e1',
            }}
          >
            <Landmark size={44} color="#94a3b8" style={{ marginBottom: '0.75rem' }} />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#334155', margin: '0 0 0.5rem 0' }}>
              कुनै सम्पदा भेटिएन
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0 }}>
              कृपया अर्को खोज शब्द वा विधा छनोट गर्नुहोस्।
            </p>
          </div>
        ) : (
          <div className="pub-museum-grid">
            {filteredCatalog.map((item) => (
              <div key={item.id} className="pub-museum-card" id={`card-${item.assetId}`}>
                {/* Image Section */}
                <div className="pub-museum-img-box">
                  {/* Top Badges */}
                  <span className="pub-museum-badge-asset-id">{item.assetId}</span>
                  <span className="pub-museum-badge-status">Published</span>

                  {item.photoUrl ? (
                    <img
                      src={item.photoUrl}
                      alt={item.nameNp}
                      className="pub-museum-img"
                      loading="lazy"
                      onError={(e: any) => {
                        e.target.style.display = 'none';
                        const parent = e.target.parentElement;
                        if (parent) {
                          const fallback = parent.querySelector('.pub-museum-placeholder-img');
                          if (fallback) fallback.style.display = 'flex';
                        }
                      }}
                    />
                  ) : null}

                  <div
                    className="pub-museum-placeholder-img"
                    style={{ display: item.photoUrl ? 'none' : 'flex' }}
                  >
                    <Landmark size={36} color="#94a3b8" />
                    <span>तस्बिर उपलब्ध छैन</span>
                  </div>

                  {/* Media Badges (Bottom Left) */}
                  <div className="pub-museum-media-badges">
                    {item.audioUrl && (
                      <span className="pub-museum-media-badge" title="अडियो गाइड उपलब्ध">
                        <Headphones size={11} /> अडियो
                      </span>
                    )}
                    {item.videoUrl && (
                      <span className="pub-museum-media-badge" title="भिडियो डकुमेन्ट्री उपलब्ध">
                        <Video size={11} /> भिडियो
                      </span>
                    )}
                    {item.model3dUrl && (
                      <span className="pub-museum-media-badge" title="3D डिजिटल ट्वीन उपलब्ध">
                        <Box size={11} /> 3D
                      </span>
                    )}
                  </div>

                  {/* Era / Period Overlay Badge (matches user screenshot) */}
                  {item.estimatedPeriod && (
                    <span className="pub-museum-era-tag" title={item.estimatedPeriod}>
                      {item.estimatedPeriod}
                    </span>
                  )}
                </div>

                {/* Card Body */}
                <div className="pub-museum-card-body">
                  <div className="pub-museum-cat-row">
                    <span className="pub-museum-category">{item.category}</span>
                    <span
                      className="pub-museum-condition"
                      style={{
                        color:
                          (item.condition || '').includes('उत्कृष्ट')
                            ? '#15803d'
                            : (item.condition || '').includes('राम्रो')
                            ? '#0369a1'
                            : '#b45309',
                      }}
                    >
                      • {item.condition || 'सामान्य राम्रो'}
                    </span>
                  </div>

                  <h3 className="pub-museum-title-np">{item.nameNp}</h3>
                  {item.nameEn && <div className="pub-museum-title-en">{item.nameEn}</div>}

                  <p className="pub-museum-desc">
                    {item.history || item.usage || 'ऐतिहासिक तथा सांस्कृतिक महत्त्व बोकेको सामग्री।'}
                  </p>

                  <div className="pub-museum-location-badge">
                    <MapPin size={14} />
                    <span>{item.museumLocation || 'मुख्य सङ्ग्रह कक्ष'} ({item.origin || 'पाँचपोखरी'})</span>
                  </div>

                  {/* Read-Only Card Actions */}
                  <div className="pub-museum-card-actions">
                    <button
                      type="button"
                      className="pub-museum-btn-details"
                      onClick={() => setDetailItem(item)}
                    >
                      <Eye size={15} />
                      <span>विवरण हेर्नुहोस्</span>
                    </button>

                    <button
                      type="button"
                      className="pub-museum-btn-qr"
                      title="शोकेस QR कोड हेर्नुहोस्"
                      onClick={() => setQrModalItem(item)}
                    >
                      <QrCode size={16} />
                      <span>QR कोड</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ═════════════════════════════════════════════════════════════════
          MODAL 1: OFFICIAL SCANNABLE EXHIBIT LABEL TAG (QR CODE MODAL)
          ═════════════════════════════════════════════════════════════════ */}
      {qrModalItem && (
        <div
          className="pub-museum-modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setQrModalItem(null);
          }}
        >
          <div className="pub-museum-tag-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <QrCode size={20} color="#92400e" />
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                  सङ्ग्रहालय डिजिटल शोकेस ट्याग (Exhibit Label)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setQrModalItem(null)}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
                title="बन्द गर्नुहोस्"
              >
                <X size={20} />
              </button>
            </div>

            {/* Printable Exhibit Card */}
            <div id="pubMuseumExhibitTag" className="pub-museum-tag-card">
              <div className="pub-museum-tag-header">
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#78350f', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                  पाँचपोखरी थाङपाल गाउँपालिका
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#92400e', marginTop: '2px' }}>
                  सांस्कृतिक तथा ऐतिहासिक सङ्ग्रहालय
                </div>
                <div style={{ fontSize: '0.68rem', color: '#64748b', letterSpacing: '0.2px' }}>
                  Panchpokhari Thangpal Heritage Museum • Digital Catalog
                </div>
              </div>

              <div className="pub-museum-tag-content">
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#1d4ed8', fontFamily: 'monospace' }}>
                    {qrModalItem.assetId}
                  </div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f172a', margin: '3px 0' }}>
                    {qrModalItem.nameNp}
                  </div>
                  {qrModalItem.nameEn && (
                    <div style={{ fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic', marginBottom: '8px' }}>
                      {qrModalItem.nameEn}
                    </div>
                  )}

                  <div style={{ fontSize: '0.76rem', color: '#334155', lineHeight: 1.5 }}>
                    <div><strong>कालखण्ड:</strong> {qrModalItem.estimatedPeriod || 'प्राचीन'}</div>
                    <div><strong>निर्माण सामग्री:</strong> {qrModalItem.material || 'परम्परागत'}</div>
                    <div><strong>उत्पत्ति:</strong> {qrModalItem.origin || 'पाँचपोखरी थाङपाल'}</div>
                    <div><strong>सङ्ग्रह स्थान:</strong> {qrModalItem.museumLocation || 'मुख्य सङ्ग्रह कक्ष'}</div>
                  </div>
                </div>

                {/* Scannable QR Code */}
                <div style={{ textAlign: 'center' }}>
                  <div className="pub-museum-qr-box">
                    {qrDataUrl ? (
                      <img src={qrDataUrl} alt={`QR Code for ${qrModalItem.assetId}`} />
                    ) : (
                      <QrCode size={78} color="#0f172a" />
                    )}
                  </div>
                  <span style={{ fontSize: '0.64rem', color: '#78350f', fontWeight: 700, display: 'block', marginTop: '4px' }}>
                    स्क्यान गरी सुन्नुहोस् / हेर्नुहोस्
                  </span>
                </div>
              </div>

              <div style={{ borderTop: '1.5px dashed #d97706', marginTop: '1rem', paddingTop: '0.5rem', textAlign: 'center', fontSize: '0.68rem', color: '#94a3b8' }}>
                Municipal Digital Twin Platform • संवत् २०८१ • आधिकारिक डिजिटल क्याटलग
              </div>
            </div>

            {/* Tag Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem', gap: '0.5rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => handleShare(qrModalItem)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '7px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#475569',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                  title="साझा गर्नुहोस् वा लिङ्क कपी गर्नुहोस्"
                >
                  <Share2 size={14} />
                  <span>साझा</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCopyLink(qrModalItem.assetId)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '7px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#475569',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {copiedLink ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                  <span>{copiedLink ? 'लिङ्क कपी भयो!' : 'लिङ्क कपी'}</span>
                </button>
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => handleDownloadQr(qrModalItem.assetId, qrModalItem.nameNp)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '7px 14px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#0f172a',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  <Download size={14} />
                  <span>QR डाउनलोड</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '7px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#92400e',
                    color: '#ffffff',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  <Printer size={15} />
                  <span>ट्याग प्रिन्ट गर्नुहोस्</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════
          MODAL 2: FULL READ-ONLY EXHIBIT DETAILS MODAL
          ═════════════════════════════════════════════════════════════════ */}
      {detailItem && (
        <div
          className="pub-museum-modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setDetailItem(null);
          }}
        >
          <div className="pub-museum-detail-panel">
            {/* Header with Photo */}
            <div className="pub-museum-detail-header">
              <button
                type="button"
                className="pub-museum-detail-close"
                onClick={() => setDetailItem(null)}
                title="बन्द गर्नुहोस्"
              >
                <X size={20} />
              </button>

              {detailItem.photoUrl ? (
                <img src={detailItem.photoUrl} alt={detailItem.nameNp} />
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
                  }}
                >
                  <Landmark size={54} color="#fde68a" />
                  <span style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#c7d2fe' }}>
                    तस्बिर संलग्न गरिएको छैन
                  </span>
                </div>
              )}

              <div
                style={{
                  position: 'absolute',
                  bottom: '16px',
                  left: '20px',
                  right: '20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-end',
                  zIndex: 2,
                }}
              >
                <div style={{ background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(8px)', padding: '8px 14px', borderRadius: '10px' }}>
                  <div style={{ color: '#fde68a', fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: 800 }}>
                    {detailItem.assetId} • {detailItem.category}
                  </div>
                  <h2 style={{ color: '#ffffff', margin: 0, fontSize: '1.4rem', fontWeight: 900 }}>
                    {detailItem.nameNp}
                  </h2>
                  {detailItem.nameEn && (
                    <div style={{ color: '#cbd5e1', fontSize: '0.85rem', fontStyle: 'italic' }}>
                      {detailItem.nameEn}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setQrModalItem(detailItem);
                  }}
                  style={{
                    background: '#ffffff',
                    color: '#92400e',
                    border: 'none',
                    padding: '8px 14px',
                    borderRadius: '10px',
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                  }}
                >
                  <QrCode size={16} />
                  <span>QR ट्याग</span>
                </button>
              </div>
            </div>

            {/* Detail Body */}
            <div className="pub-museum-detail-body">
              {/* Metadata Grid */}
              <div className="pub-museum-meta-grid">
                <div className="pub-museum-meta-item">
                  <div className="pub-museum-meta-label">ऐतिहासिक कालखण्ड</div>
                  <div className="pub-museum-meta-value">{detailItem.estimatedPeriod || 'प्राचीन काल'}</div>
                </div>

                <div className="pub-museum-meta-item">
                  <div className="pub-museum-meta-label">निर्माण सामग्री</div>
                  <div className="pub-museum-meta-value">{detailItem.material || 'परम्परागत'}</div>
                </div>

                <div className="pub-museum-meta-item">
                  <div className="pub-museum-meta-label">सङ्ग्रह कक्ष / शोकेस</div>
                  <div className="pub-museum-meta-value">{detailItem.museumLocation || 'मुख्य ग्यालरी'}</div>
                </div>

                <div className="pub-museum-meta-item">
                  <div className="pub-museum-meta-label">प्राप्ति स्थल / उत्पत्ति</div>
                  <div className="pub-museum-meta-value">{detailItem.origin || 'पाँचपोखरी थाङपाल'}</div>
                </div>

                <div className="pub-museum-meta-item">
                  <div className="pub-museum-meta-label">संरक्षण अवस्था</div>
                  <div className="pub-museum-meta-value" style={{ color: '#15803d' }}>
                    {detailItem.condition || 'सामान्य राम्रो'}
                  </div>
                </div>

                <div className="pub-museum-meta-item">
                  <div className="pub-museum-meta-label">डिजिटल प्रमाणिकरण</div>
                  <div className="pub-museum-meta-value" style={{ color: '#1d4ed8' }}>
                    सार्वजनिक प्रदर्शनमा (Published)
                  </div>
                </div>
              </div>

              {/* Multimedia Player Sections if available */}
              {detailItem.audioUrl && (
                <div style={{ marginBottom: '1.5rem', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '12px', padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#065f46', fontWeight: 800, fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                    <Headphones size={18} />
                    <span>अडियो गाइड टुर (Listen to Audio Guide)</span>
                  </div>
                  <audio controls style={{ width: '100%', height: '40px' }} src={detailItem.audioUrl}>
                    तपाईंको ब्राउजरले अडियो सपोर्ट गर्दैन।
                  </audio>
                </div>
              )}

              {detailItem.videoUrl && (
                <div style={{ marginBottom: '1.5rem', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1e40af', fontWeight: 800, fontSize: '0.9rem', marginBottom: '0.65rem' }}>
                    <Video size={18} />
                    <span>भिडियो डकुमेन्ट्री (Video Documentary)</span>
                  </div>
                  <div className="pub-museum-video-container">
                    {getYouTubeEmbedUrl(detailItem.videoUrl) ? (
                      <iframe
                        src={getYouTubeEmbedUrl(detailItem.videoUrl)!}
                        title={detailItem.nameNp}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <video controls src={detailItem.videoUrl}>
                        तपाईंको ब्राउजरले भिडियो सपोर्ट गर्दैन।
                      </video>
                    )}
                  </div>
                </div>
              )}

              {/* History & Context */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px', margin: '0 0 0.5rem 0' }}>
                  <Landmark size={17} color="#4338ca" />
                  <span>ऐतिहासिक पृष्ठभूमि तथा विवरण</span>
                </h4>
                <div style={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.7, whiteSpace: 'pre-line', background: '#ffffff', padding: '0.75rem 0' }}>
                  {detailItem.history || 'यस सांस्कृतिक सामग्रीको थप ऐतिहासिक विवरण अभिलेखीकरणको चरणमा रहेको छ।'}
                </div>
              </div>

              {/* Usage & Significance */}
              {detailItem.usage && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px', margin: '0 0 0.5rem 0' }}>
                    <Sparkles size={17} color="#d97706" />
                    <span>धार्मिक, सांस्कृतिक तथा परम्परागत उपयोग</span>
                  </h4>
                  <div style={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                    {detailItem.usage}
                  </div>
                </div>
              )}

              {/* Mini QR Verification Footer Card inside Details */}
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', padding: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                <div style={{ width: '70px', height: '70px', background: '#ffffff', padding: '3px', borderRadius: '8px', border: '1px solid #d97706', flexShrink: 0 }}>
                  {qrDataUrl ? (
                    <img src={qrDataUrl} alt="QR Code" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  ) : (
                    <QrCode size={60} color="#78350f" />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#78350f' }}>
                    डिजिटल प्रमाणीकरण क्युआर कोड (Digital Verification QR)
                  </div>
                  <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '2px' }}>
                    कुनै पनि मोबाइल स्क्यानर मार्फत सिधै यो सामग्रीको प्रत्यक्ष लिङ्क खोल्न सकिन्छ।
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setQrModalItem(detailItem)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: '1px solid #d97706',
                    background: '#ffffff',
                    color: '#78350f',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  ट्याग हेर्नुहोस्
                </button>
              </div>

              {/* Bottom Close */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.75rem' }}>
                <button
                  type="button"
                  onClick={() => setDetailItem(null)}
                  style={{
                    padding: '9px 24px',
                    borderRadius: '10px',
                    border: 'none',
                    background: '#0f172a',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  बन्द गर्नुहोस्
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Museum;
