import React, { useState } from 'react';
import {
  Landmark,
  Search,
  Sparkles,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Layers,
  ChevronRight,
  ExternalLink,
  Info,
  Clock,
  MapPin,
  ShieldCheck,
  Tag,
  Box,
  Eye,
  X,
  BookOpen,
} from 'lucide-react';
import {
  MOCK_MUSEUM_ARTIFACTS,
  MuseumArtifact,
} from '../../data/mockMuseumAndTourismData';

interface CulturalMuseumProps {
  onBackToHome?: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const CulturalMuseum: React.FC<CulturalMuseumProps> = ({
  onBackToHome,
  onNavigateTab,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedArtifact, setSelectedArtifact] = useState<MuseumArtifact | null>(null);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'सबै सम्पदा' },
    { id: 'ऐतिहासिक कलाकृति', label: 'ऐतिहासिक कलाकृति' },
    { id: 'धार्मिक ग्रन्थ', label: 'धार्मिक पाण्डुलिपि' },
    { id: 'संगीत तथा वाद्यवादन', label: 'परम्परागत बाजा' },
    { id: 'परम्परागत पोशाक', label: 'भेषभूषा तथा गहना' },
    { id: 'दैनिक घरेलु औजार', label: 'घरेलु औजार' },
    { id: 'हस्तकला', label: 'थाङ्का तथा हस्तकला' },
  ];

  const filteredArtifacts = MOCK_MUSEUM_ARTIFACTS.filter((art) => {
    const matchCat = selectedCategory === 'all' || art.category === selectedCategory;
    const matchQ =
      !searchQuery ||
      art.nameNp.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.era.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.material.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchQ;
  });

  const toggleAudio = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (playingAudioId === id) {
      setPlayingAudioId(null);
    } else {
      setPlayingAudioId(id);
    }
  };

  const handleOpenWebMuseum = (url: string = 'http://localhost:8080/app/museum') => {
    window.open(url, '_blank');
  };

  return (
    <div style={{ paddingBottom: '90px' }}>
      {/* ─── 1. TOP MUSEUM HERO BANNER ─── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #7C1D4A 0%, #991B1B 50%, #450A0A 100%)',
          color: '#ffffff',
          borderRadius: '20px',
          padding: '1.25rem',
          marginBottom: '1rem',
          boxShadow: '0 8px 24px rgba(153, 27, 27, 0.25)',
          position: 'relative',
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.15)',
        }}
      >
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: 800,
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: '#FDE047',
                padding: '3px 10px',
                borderRadius: '12px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <Landmark size={12} />
              <span>ह्योल्मो तथा तामाङ सांस्कृतिक सङ्ग्रहालय</span>
            </span>

            <button
              type="button"
              onClick={() => handleOpenWebMuseum('http://localhost:8080/app/museum')}
              style={{
                backgroundColor: '#ffffff',
                color: '#991B1B',
                border: 'none',
                padding: '4px 10px',
                borderRadius: '20px',
                fontSize: '0.68rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
              }}
            >
              <span>सङ्ग्रहालय पोर्टल (८०८०)</span>
              <ExternalLink size={12} />
            </button>
          </div>

          <h2 style={{ fontSize: '1.18rem', fontWeight: 900, margin: '0 0 6px 0', lineHeight: 1.3 }}>
            सांस्कृतिक सङ्ग्रहालय डिजिटल आर्काइभ
          </h2>
          <p style={{ fontSize: '0.76rem', opacity: 0.9, margin: 0, lineHeight: 1.45 }}>
            पाँचपोखरी थाङपालका प्राचीन गुम्बा, ऐतिहासिक अष्टधातु मूर्ति, सुनौलो प्रज्ञापारमिता ग्रन्थ, परम्परागत वाद्यवादन र ह्योल्मो भेषभूषाको डिजिटल सङ्ग्रह।
          </p>

          {/* Quick Metrics */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '8px',
              marginTop: '12px',
              backgroundColor: 'rgba(0, 0, 0, 0.22)',
              borderRadius: '12px',
              padding: '8px',
              textAlign: 'center',
            }}
          >
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 900, color: '#FDE047' }}>१,२००+ वर्ष</div>
              <div style={{ fontSize: '0.6rem', opacity: 0.85 }}>प्राचीन इतिहास</div>
            </div>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 900, color: '#67E8F9' }}>८ विधा</div>
              <div style={{ fontSize: '0.6rem', opacity: 0.85 }}>कलाकृति वर्गीकरण</div>
            </div>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 900, color: '#A7F3D0' }}>३D & अडियो</div>
              <div style={{ fontSize: '0.6rem', opacity: 0.85 }}>भर्चुअल अवलोकन</div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 2. SEARCH BAR ─── */}
      <div style={{ position: 'relative', marginBottom: '0.85rem' }}>
        <input
          type="text"
          placeholder="कलाकृति, ग्रन्थ वा बाजा खोज्नुहोस्..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 14px 10px 38px',
            borderRadius: '14px',
            border: '1px solid #CBD5E1',
            backgroundColor: '#ffffff',
            fontSize: '0.8rem',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
        <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            style={{
              position: 'absolute',
              right: '10px',
              top: '10px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#94A3B8',
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* ─── 3. CATEGORY PILLS ─── */}
      <div
        style={{
          display: 'flex',
          gap: '6px',
          overflowX: 'auto',
          paddingBottom: '8px',
          marginBottom: '1rem',
          scrollbarWidth: 'none',
        }}
      >
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setSelectedCategory(c.id)}
            style={{
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '0.72rem',
              fontWeight: 800,
              whiteSpace: 'nowrap',
              border: selectedCategory === c.id ? 'none' : '1px solid #E2E8F0',
              backgroundColor: selectedCategory === c.id ? '#991B1B' : '#ffffff',
              color: selectedCategory === c.id ? '#ffffff' : '#475569',
              cursor: 'pointer',
              boxShadow: selectedCategory === c.id ? '0 2px 6px rgba(153, 27, 27, 0.25)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* ─── 4. ARTIFACTS 2-COLUMN GRID (digi SMARTPALIKA STYLE) ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.85rem' }}>
        {filteredArtifacts.map((art) => (
          <div
            key={art.id}
            onClick={() => setSelectedArtifact(art)}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              overflow: 'hidden',
              boxShadow: '0 3px 10px rgba(0,0,0,0.04)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 3px 10px rgba(0,0,0,0.04)';
            }}
          >
            {/* Image Thumbnail with Badges */}
            <div style={{ position: 'relative', height: '115px', backgroundColor: '#F1F5F9' }}>
              <img
                src={art.imageUrl}
                alt={art.nameNp}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.55) 100%)' }} />

              {/* 3D Model Badge */}
              {art.has3DModel && (
                <span
                  style={{
                    position: 'absolute',
                    top: '8px',
                    left: '8px',
                    backgroundColor: '#0F4C81',
                    color: '#ffffff',
                    fontSize: '0.58rem',
                    fontWeight: 800,
                    padding: '2px 6px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px',
                  }}
                >
                  <Box size={10} />
                  <span>३D भ्यू</span>
                </span>
              )}

              {/* Era Chip */}
              <span
                style={{
                  position: 'absolute',
                  bottom: '6px',
                  left: '8px',
                  color: '#FDE047',
                  fontSize: '0.62rem',
                  fontWeight: 700,
                  textShadow: '0 1px 2px rgba(0,0,0,0.8)',
                }}
              >
                {art.era}
              </span>
            </div>

            {/* Info Section */}
            <div style={{ padding: '0.75rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <span
                  style={{
                    fontSize: '0.58rem',
                    fontWeight: 700,
                    backgroundColor: '#FEF2F2',
                    color: '#991B1B',
                    padding: '1px 6px',
                    borderRadius: '6px',
                    display: 'inline-block',
                    marginBottom: '4px',
                  }}
                >
                  {art.category}
                </span>

                <h4 style={{ fontSize: '0.8rem', fontWeight: 800, color: '#1E293B', margin: '0 0 3px 0', lineHeight: 1.25 }}>
                  {art.nameNp}
                </h4>

                <p style={{ fontSize: '0.66rem', color: '#64748B', margin: 0, lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {art.description}
                </p>
              </div>

              {/* Audio and Details Footer */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: '8px',
                  borderTop: '1px solid #F1F5F9',
                  paddingTop: '6px',
                }}
              >
                {art.audioDuration ? (
                  <button
                    type="button"
                    onClick={(e) => toggleAudio(art.id, e)}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      color: playingAudioId === art.id ? '#DC2626' : '#64748B',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                    }}
                  >
                    {playingAudioId === art.id ? <Pause size={12} color="#DC2626" /> : <Volume2 size={12} />}
                    <span>{playingAudioId === art.id ? 'बज्दैछ' : art.audioDuration}</span>
                  </button>
                ) : (
                  <span style={{ fontSize: '0.62rem', color: '#94A3B8' }}>{art.location.split(',')[0]}</span>
                )}

                <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#0F4C81' }}>
                  हेर्नुहोस् →
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ─── 5. ARTIFACT DETAIL MODAL ─── */}
      {selectedArtifact && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.65)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              maxWidth: '460px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            }}
          >
            {/* Modal Header Banner */}
            <div style={{ position: 'relative', height: '175px' }}>
              <img
                src={selectedArtifact.imageUrl}
                alt={selectedArtifact.nameNp}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.7) 100%)' }} />

              <button
                type="button"
                onClick={() => setSelectedArtifact(null)}
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: 'rgba(0,0,0,0.5)',
                  border: 'none',
                  color: '#ffffff',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                }}
              >
                ✕
              </button>

              <div style={{ position: 'absolute', bottom: '12px', left: '16px', right: '16px', color: '#ffffff' }}>
                <span style={{ fontSize: '0.62rem', backgroundColor: '#991B1B', color: '#ffffff', fontWeight: 800, padding: '2px 8px', borderRadius: '6px' }}>
                  {selectedArtifact.assetId}
                </span>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 900, margin: '4px 0 0 0', lineHeight: 1.25 }}>
                  {selectedArtifact.nameNp}
                </h3>
                <div style={{ fontSize: '0.7rem', opacity: 0.9 }}>{selectedArtifact.nameEn}</div>
              </div>
            </div>

            {/* Modal Info Content */}
            <div style={{ padding: '1.15rem' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '8px',
                  backgroundColor: '#F8FAFC',
                  borderRadius: '12px',
                  padding: '10px',
                  marginBottom: '1rem',
                  border: '1px solid #E2E8F0',
                  fontSize: '0.72rem',
                }}
              >
                <div>
                  <div style={{ color: '#64748B' }}>कालखण्ड:</div>
                  <strong style={{ color: '#1E293B' }}>{selectedArtifact.era}</strong>
                </div>
                <div>
                  <div style={{ color: '#64748B' }}>संरचना/सामग्री:</div>
                  <strong style={{ color: '#1E293B' }}>{selectedArtifact.material}</strong>
                </div>
                <div>
                  <div style={{ color: '#64748B' }}>सङ्ग्रह स्थान:</div>
                  <strong style={{ color: '#1E293B' }}>{selectedArtifact.location}</strong>
                </div>
                <div>
                  <div style={{ color: '#64748B' }}>अवस्था:</div>
                  <strong style={{ color: '#16A34A' }}>{selectedArtifact.condition}</strong>
                </div>
              </div>

              <div style={{ marginBottom: '0.85rem' }}>
                <h4 style={{ fontSize: '0.8rem', fontWeight: 800, color: '#1E293B', marginBottom: '3px' }}>
                  ऐतिहासिक विवरण
                </h4>
                <p style={{ fontSize: '0.76rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>
                  {selectedArtifact.description}
                </p>
              </div>

              <div style={{ marginBottom: '1.15rem' }}>
                <h4 style={{ fontSize: '0.8rem', fontWeight: 800, color: '#1E293B', marginBottom: '3px' }}>
                  धार्मिक तथा सांस्कृतिक महत्व
                </h4>
                <p style={{ fontSize: '0.76rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>
                  {selectedArtifact.significance}
                </p>
              </div>

              {/* Direct Web Museum Link Button */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => handleOpenWebMuseum('http://localhost:8080/app/museum')}
                  style={{
                    backgroundColor: '#991B1B',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '11px',
                    fontWeight: 800,
                    fontSize: '0.84rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxShadow: '0 3px 10px rgba(153, 27, 27, 0.25)',
                  }}
                >
                  <Landmark size={16} color="#FDE047" />
                  <span>सङ्ग्रहालय पोर्टलमा पूर्ण ३D भ्यू हेर्नुहोस् (localhost:8080)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedArtifact(null)}
                  style={{
                    backgroundColor: '#F1F5F9',
                    color: '#64748B',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '9px',
                    fontWeight: 700,
                    fontSize: '0.8rem',
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
