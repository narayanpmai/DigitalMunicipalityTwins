import React, { useState } from 'react';
import {
  Compass,
  MapPin,
  Sparkles,
  Mountain,
  Headphones,
  ExternalLink,
  Layers,
  ChevronRight,
  Eye,
  Info,
  Clock,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Navigation,
  Share2,
  Calendar,
  X,
} from 'lucide-react';
import {
  MOCK_HERITAGE_DESTINATIONS,
  HeritageDestination,
} from '../../data/mockMuseumAndTourismData';
import { MobileTrekExplorer } from './MobileTrekExplorer';
import { MobileAccommodationsHub } from './MobileAccommodationsHub';

interface TourismHeritageTwinProps {
  onBackToHome?: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const TourismHeritageTwin: React.FC<TourismHeritageTwinProps> = ({
  onBackToHome,
  onNavigateTab,
}) => {
  const [viewMode, setViewMode] = useState<'trek_map' | 'accommodations' | 'heritage_cards'>('trek_map');
  const [selectedTrekRoute, setSelectedTrekRoute] = useState<'panchpokhari' | 'ama_yangri'>('panchpokhari');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDestination, setSelectedDestination] = useState<HeritageDestination | null>(null);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'सबै गन्तव्य' },
    { id: 'धार्मिक तथा प्राकृतिक', label: 'धार्मिक/हिमताल' },
    { id: 'साहसिक तथा भ्यू पोइन्ट', label: 'भ्यू पोइन्ट/शिखर' },
    { id: 'सांस्कृतिक सम्पदा', label: 'गुम्बा/सम्पदा' },
    { id: 'ऐतिहासिक गढी', label: 'ऐतिहासिक गढी' },
  ];

  const filteredDestinations = MOCK_HERITAGE_DESTINATIONS.filter((d) => {
    if (selectedCategory === 'all') return true;
    return d.category === selectedCategory;
  });

  const toggleAudio = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (playingAudioId === id) {
      setPlayingAudioId(null);
    } else {
      setPlayingAudioId(id);
    }
  };

  const handleOpenWebTwin = (url: string = 'http://localhost:8080/app/library') => {
    window.open(url, '_blank');
  };

  return (
    <div style={{ paddingBottom: '90px' }}>
      {/* ─── 1. TOP SPOTLIGHT HERO BANNER ─── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0F4C81 0%, #1E3A8A 50%, #0F2342 100%)',
          color: '#ffffff',
          borderRadius: '20px',
          padding: '1.25rem',
          marginBottom: '1rem',
          boxShadow: '0 8px 24px rgba(15, 76, 129, 0.25)',
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
                backgroundColor: 'rgba(245, 158, 11, 0.22)',
                color: '#FDE047',
                padding: '3px 10px',
                borderRadius: '12px',
                border: '1px solid rgba(245, 158, 11, 0.4)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <Sparkles size={12} />
              <span>Municipal Digital Twin • ३D GIS</span>
            </span>

            <button
              type="button"
              onClick={() => handleOpenWebTwin('http://localhost:8080/app/gis-map')}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.35)',
                padding: '4px 10px',
                borderRadius: '20px',
                fontSize: '0.68rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                backdropFilter: 'blur(6px)',
              }}
            >
              <span>३D GIS म्याप खोल्नुहोस्</span>
              <ExternalLink size={12} />
            </button>
          </div>

          <h2 style={{ fontSize: '1.18rem', fontWeight: 900, margin: '0 0 6px 0', lineHeight: 1.3 }}>
            पर्यटन तथा सम्पदा डिजिटल ट्विन
          </h2>
          <p style={{ fontSize: '0.76rem', opacity: 0.9, margin: 0, lineHeight: 1.45 }}>
            पाँचपोखरीका पावन ५ कुण्डहरू, आमायाङ्ग्री, ऐतिहासिक तार्केघ्याङ गुम्बा र प्राचीन सम्पदाहरूको प्रत्यक्ष ३D भू-धरातल तथा अडियो गाइड।
          </p>

          {/* Quick Metrics Bar */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '8px',
              marginTop: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '8px',
              backdropFilter: 'blur(8px)',
              textAlign: 'center',
            }}
          >
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 900, color: '#FDE047' }}>४,१०० मि.</div>
              <div style={{ fontSize: '0.6rem', opacity: 0.85 }}>पाँचपोखरी उचाइ</div>
            </div>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 900, color: '#67E8F9' }}>८ वटै वडा</div>
              <div style={{ fontSize: '0.6rem', opacity: 0.85 }}>डिजिटल कभरेज</div>
            </div>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 900, color: '#A7F3D0' }}>३६०° भ्यू</div>
              <div style={{ fontSize: '0.6rem', opacity: 0.85 }}>आमायाङ्ग्री दृश्य</div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 1B. VIEW MODE SELECTOR (Live GIS Map vs Accommodations vs Heritage List) ─── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          backgroundColor: '#E2E8F0',
          padding: '4px',
          borderRadius: '16px',
          marginBottom: '1rem',
          gap: '4px',
        }}
      >
        <button
          type="button"
          onClick={() => setViewMode('trek_map')}
          style={{
            padding: '9px 4px',
            borderRadius: '12px',
            border: 'none',
            backgroundColor: viewMode === 'trek_map' ? '#0F4C81' : 'transparent',
            color: viewMode === 'trek_map' ? '#ffffff' : '#334155',
            fontWeight: 800,
            fontSize: '0.72rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            boxShadow: viewMode === 'trek_map' ? '0 3px 10px rgba(15,76,129,0.3)' : 'none',
            transition: 'all 0.15s ease',
          }}
        >
          <Sparkles size={13} color={viewMode === 'trek_map' ? '#FDE047' : '#0F4C81'} />
          <span>🗺️ पदमार्ग नक्सा</span>
        </button>

        <button
          type="button"
          onClick={() => setViewMode('accommodations')}
          style={{
            padding: '9px 4px',
            borderRadius: '12px',
            border: 'none',
            backgroundColor: viewMode === 'accommodations' ? '#047857' : 'transparent',
            color: viewMode === 'accommodations' ? '#ffffff' : '#334155',
            fontWeight: 800,
            fontSize: '0.72rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            boxShadow: viewMode === 'accommodations' ? '0 3px 10px rgba(4,120,87,0.3)' : 'none',
            transition: 'all 0.15s ease',
          }}
        >
          <span>🏡 होटल/होमस्टे</span>
        </button>

        <button
          type="button"
          onClick={() => setViewMode('heritage_cards')}
          style={{
            padding: '9px 4px',
            borderRadius: '12px',
            border: 'none',
            backgroundColor: viewMode === 'heritage_cards' ? '#0F4C81' : 'transparent',
            color: viewMode === 'heritage_cards' ? '#ffffff' : '#334155',
            fontWeight: 800,
            fontSize: '0.72rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            boxShadow: viewMode === 'heritage_cards' ? '0 3px 10px rgba(15,76,129,0.3)' : 'none',
            transition: 'all 0.15s ease',
          }}
        >
          <Layers size={13} />
          <span>🏛️ सम्पदा सूची</span>
        </button>
      </div>

      {/* ─── VIEW 1: LIVE TREK & 5 LAKES SATELLITE GIS MAP ─── */}
      {viewMode === 'trek_map' && (
        <MobileTrekExplorer
          initialRoute={selectedTrekRoute}
          onBackToHeritage={() => setViewMode('heritage_cards')}
        />
      )}

      {/* ─── VIEW 2: REGISTERED HOTELS & HOMESTAYS (MATCHING WEB PORTAL) ─── */}
      {viewMode === 'accommodations' && (
        <MobileAccommodationsHub
          onSelectOnMap={(lat, lng, name) => {
            setViewMode('trek_map');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}

      {/* ─── VIEW 3: HERITAGE DESTINATION CARDS & AUDIO ─── */}
      {viewMode === 'heritage_cards' && (
        <>
          {/* ─── 2. CATEGORY PILLS FILTER ─── */}
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
                  backgroundColor: selectedCategory === c.id ? '#0F4C81' : '#ffffff',
                  color: selectedCategory === c.id ? '#ffffff' : '#475569',
                  cursor: 'pointer',
                  boxShadow: selectedCategory === c.id ? '0 2px 6px rgba(15, 76, 129, 0.25)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* ─── 3. DESTINATIONS LIST (CARD GRID) ─── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {filteredDestinations.map((dest) => (
              <div
                key={dest.id}
                onClick={() => setSelectedDestination(dest)}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '18px',
                  border: '1px solid #E2E8F0',
                  overflow: 'hidden',
                  boxShadow: '0 4px 14px rgba(15, 76, 129, 0.05)',
                  cursor: 'pointer',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 18px rgba(15, 76, 129, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 14px rgba(15, 76, 129, 0.05)';
                }}
              >
                {/* Card Image Banner */}
                <div style={{ position: 'relative', height: '145px', overflow: 'hidden' }}>
                  <img
                    src={dest.imageUrl}
                    alt={dest.nameNp}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.65) 100%)',
                    }}
                  />

                  {/* Altitude Badge */}
                  <span
                    style={{
                      position: 'absolute',
                      top: '10px',
                      left: '10px',
                      backgroundColor: 'rgba(15, 23, 42, 0.85)',
                      color: '#FDE047',
                      fontSize: '0.66rem',
                      fontWeight: 800,
                      padding: '3px 8px',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      backdropFilter: 'blur(4px)',
                    }}
                  >
                    <Mountain size={11} />
                    <span>{dest.altitudeMeters.toLocaleString('ne-NP')} मी.</span>
                  </span>

                  {/* Ward Badge */}
                  <span
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      backgroundColor: '#0F4C81',
                      color: '#ffffff',
                      fontSize: '0.64rem',
                      fontWeight: 800,
                      padding: '3px 8px',
                      borderRadius: '10px',
                    }}
                  >
                    वडा नं. {dest.wardNo.toLocaleString('ne-NP')}
                  </span>

                  {/* Destination Title on Image */}
                  <div style={{ position: 'absolute', bottom: '8px', left: '12px', right: '12px', color: '#ffffff' }}>
                    <div style={{ fontSize: '0.92rem', fontWeight: 900, lineHeight: 1.25, textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
                      {dest.nameNp}
                    </div>
                    <div style={{ fontSize: '0.68rem', opacity: 0.9, marginTop: '2px' }}>
                      {dest.category} • पदयात्रा: {dest.trekDuration}
                    </div>
                  </div>
                </div>

                {/* Card Content & Action Bar */}
                <div style={{ padding: '0.85rem 1rem' }}>
                  <p style={{ fontSize: '0.76rem', color: '#475569', margin: '0 0 8px 0', lineHeight: 1.45 }}>
                    {dest.description}
                  </p>

                  {/* Highlights Chips */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '10px' }}>
                    {dest.highlights.slice(0, 3).map((hl, i) => (
                      <span
                        key={i}
                        style={{
                          fontSize: '0.62rem',
                          fontWeight: 600,
                          backgroundColor: '#F1F5F9',
                          color: '#0F4C81',
                          padding: '2px 7px',
                          borderRadius: '8px',
                        }}
                      >
                        ✓ {hl}
                      </span>
                    ))}
                  </div>

                  {/* Actions Footer */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderTop: '1px solid #F1F5F9',
                      paddingTop: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (dest.id === 'dest-02') {
                            setSelectedTrekRoute('ama_yangri');
                          } else {
                            setSelectedTrekRoute('panchpokhari');
                          }
                          setViewMode('trek_map');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        style={{
                          background: '#EFF6FF',
                          border: '1.5px solid #BFDBFE',
                          color: '#1D4ED8',
                          padding: '4px 9px',
                          borderRadius: '16px',
                          fontSize: '0.66rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px',
                          boxShadow: '0 1px 4px rgba(29,78,216,0.15)',
                        }}
                      >
                        <Navigation size={11} color="#1D4ED8" />
                        <span>नक्सा</span>
                      </button>

                      {/* Audio Guide Button */}
                      {dest.audioGuideAvailable ? (
                        <button
                          type="button"
                          onClick={(e) => toggleAudio(dest.id, e)}
                          style={{
                            background: playingAudioId === dest.id ? '#EFF6FF' : '#F8FAFC',
                            border: '1px solid',
                            borderColor: playingAudioId === dest.id ? '#38BDF8' : '#CBD5E1',
                            color: playingAudioId === dest.id ? '#0284C7' : '#475569',
                            padding: '4px 10px',
                            borderRadius: '16px',
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          {playingAudioId === dest.id ? (
                            <>
                              <Pause size={12} color="#0284C7" />
                              <span>अडियो बज्दैछ...</span>
                            </>
                          ) : (
                            <>
                              <Volume2 size={12} />
                              <span>अडियो</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.65rem', color: '#94A3B8' }}>अडियो: चाँडै</span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', fontWeight: 800, color: '#0F4C81' }}>
                      <span>विस्तृत विवरण</span>
                      <ChevronRight size={14} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ─── 4. DESTINATION DETAIL MODAL ─── */}
      {selectedDestination && (
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
              maxWidth: '480px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            }}
          >
            {/* Modal Image Header */}
            <div style={{ position: 'relative', height: '180px' }}>
              <img
                src={selectedDestination.imageUrl}
                alt={selectedDestination.nameNp}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.7) 100%)' }} />

              <button
                type="button"
                onClick={() => setSelectedDestination(null)}
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
                <span style={{ fontSize: '0.65rem', backgroundColor: '#F59E0B', color: '#0F172A', fontWeight: 800, padding: '2px 8px', borderRadius: '8px' }}>
                  {selectedDestination.code}
                </span>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 900, margin: '4px 0 0 0', lineHeight: 1.25 }}>
                  {selectedDestination.nameNp}
                </h3>
              </div>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '1.25rem' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '8px',
                  backgroundColor: '#F8FAFC',
                  borderRadius: '12px',
                  padding: '10px',
                  marginBottom: '1rem',
                  border: '1px solid #E2E8F0',
                  textAlign: 'center',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.62rem', color: '#64748B' }}>उचाइ</div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0F4C81' }}>{selectedDestination.altitudeMeters} मी.</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.62rem', color: '#64748B' }}>उत्कृष्ट मौसम</div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#16A34A' }}>{selectedDestination.bestSeason}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.62rem', color: '#64748B' }}>अवधि</div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#D97706' }}>{selectedDestination.trekDuration}</div>
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <h4 style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1E293B', marginBottom: '4px' }}>
                  परिचय तथा महत्व
                </h4>
                <p style={{ fontSize: '0.78rem', color: '#475569', lineHeight: 1.55, margin: 0 }}>
                  {selectedDestination.intro}
                </p>
              </div>

              <div style={{ marginBottom: '1.15rem' }}>
                <h4 style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1E293B', marginBottom: '6px' }}>
                  प्रमुख आकर्षणहरू (Highlights)
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {selectedDestination.highlights.map((h, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#334155' }}>
                      <span style={{ color: '#16A34A', fontWeight: 900 }}>•</span>
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Direct In-App & Web Twin Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => {
                    if (selectedDestination.id === 'dest-02') {
                      setSelectedTrekRoute('ama_yangri');
                    } else {
                      setSelectedTrekRoute('panchpokhari');
                    }
                    setSelectedDestination(null);
                    setViewMode('trek_map');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  style={{
                    backgroundColor: '#047857',
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
                    boxShadow: '0 3px 10px rgba(4, 120, 87, 0.25)',
                  }}
                >
                  <Sparkles size={16} color="#FDE047" />
                  <span>🗺️ मोबाइलमै प्रत्यक्ष ५ कुण्ड तथा पदमार्ग नक्सा खोल्नुहोस्</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenWebTwin(selectedDestination.gisMapUrl || 'http://localhost:8080/app/gis-map')}
                  style={{
                    backgroundColor: '#0F4C81',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '11px',
                    fontWeight: 800,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxShadow: '0 3px 10px rgba(15, 76, 129, 0.25)',
                  }}
                >
                  <Sparkles size={16} color="#FDE047" />
                  <span>३D GIS पदमार्ग, कुण्ड तथा होटल म्याप</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenWebTwin('http://localhost:8080/pwa?tab=tourism')}
                  style={{
                    backgroundColor: '#059669',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '10px',
                    fontWeight: 800,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxShadow: '0 3px 10px rgba(5, 150, 105, 0.25)',
                  }}
                >
                  <Navigation size={14} color="#A7F3D0" />
                  <span>📱 मोबाइल PWA ट्रेकिङ गाइड (लाइभ GPS र होटल सम्पर्क)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedDestination(null)}
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
