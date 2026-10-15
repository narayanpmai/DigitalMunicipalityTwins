import React, { useState } from 'react';
import {
  Search,
  ArrowRight,
  ArrowLeft,
  Clock,
  ChevronRight,
  Building2,
  FileText,
  Sparkles,
  CheckCircle2,
  X,
  MapPin,
  UserCheck,
} from 'lucide-react';
import { BadapatraService } from '../../types';
import { MOCK_SERVICES } from '../../data/mockData';

interface CitizenCharterHubProps {
  onSelectService: (service: BadapatraService) => void;
  charterSearch: string;
  setCharterSearch: (val: string) => void;
}

export const CitizenCharterHub: React.FC<CitizenCharterHubProps> = ({
  onSelectService,
  charterSearch,
  setCharterSearch,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('सबै');

  // 6 Main Categories matching E-Sifarish 2-column aesthetic
  const CHARTER_CATEGORIES = [
    {
      id: 'admin',
      categoryKey: 'प्रशासन तथा पञ्जीकरण',
      title: 'प्रशासन तथा पञ्जीकरण',
      subtitle: 'नागरिकता, जन्म, मृत्यु, नाता',
      count: 4,
      bgTint: '#eff6ff',
      borderColor: '#bfdbfe',
      iconSvg: (
        <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Identity Document / Government Emblem Card */}
          <rect x="7" y="9" width="42" height="36" rx="6" fill="#FFFFFF" stroke="#0F4C81" strokeWidth="2.5" />
          <rect x="7" y="9" width="42" height="10" rx="4" fill="#0F4C81" />
          {/* Emblem Sun/Moon symbol */}
          <circle cx="28" cy="14" r="2.5" fill="#FDE047" />
          {/* Photo */}
          <rect x="12" y="24" width="11" height="13" rx="2" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="1.5" />
          <circle cx="17.5" cy="28.5" r="2.5" fill="#0284C7" />
          {/* Text lines */}
          <rect x="26" y="24" width="18" height="3" rx="1.5" fill="#0F4C81" />
          <rect x="26" y="30" width="14" height="2.5" rx="1.25" fill="#94A3B8" />
          <rect x="26" y="35" width="10" height="2" rx="1" fill="#CBD5E1" />
          {/* Official Stamp */}
          <circle cx="41" cy="38" r="4.5" fill="#DC2626" />
          <path d="M39.5 38L40.5 39L42.5 37" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      id: 'property',
      categoryKey: 'घर, जग्गा तथा बाटो',
      title: 'घर, जग्गा तथा बाटो',
      subtitle: 'घरबाटो, चारकिल्ला, नक्सापास',
      count: 3,
      bgTint: '#f0fdf4',
      borderColor: '#bbf7d0',
      iconSvg: (
        <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Green Land base */}
          <path d="M4 42C12 36 24 38 34 35C44 32 50 36 52 38V44H4V42Z" fill="#86EFAC" />
          <path d="M8 44C18 39 30 40 40 38C46 36 50 40 52 42V45H8V44Z" fill="#22C55E" />
          {/* Road curving into landscape */}
          <path d="M22 45L26 34L30 34L34 45Z" fill="#CBD5E1" />
          <line x1="28" y1="36" x2="28" y2="43" stroke="#FFFFFF" strokeWidth="1.5" strokeDasharray="2 2" />
          {/* House */}
          <path d="M18 24L28 16L38 24V36H18V24Z" fill="#F8FAFC" stroke="#0F4C81" strokeWidth="2" />
          {/* Roof */}
          <path d="M15 25L28 14L41 25" stroke="#E65100" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          {/* Door & Window */}
          <rect x="25" y="27" width="6" height="9" rx="1" fill="#0F4C81" />
          <rect x="31" y="22" width="4.5" height="4.5" rx="1" fill="#F59E0B" />
        </svg>
      ),
    },
    {
      id: 'revenue',
      categoryKey: 'राजस्व तथा उद्योग',
      title: 'राजस्व तथा उद्योग',
      subtitle: 'व्यवसाय, सम्पत्ति कर, नवीकरण',
      count: 3,
      bgTint: '#fffbeb',
      borderColor: '#fde68a',
      iconSvg: (
        <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Shop / Building */}
          <rect x="11" y="20" width="34" height="26" rx="3" fill="#FFFFFF" stroke="#0F4C81" strokeWidth="2.5" />
          {/* Striped Canopy / Awning */}
          <path d="M9 20L13 12H43L47 20H9Z" fill="#E65100" />
          <path d="M16 12L17 20H23L22 12H16Z" fill="#FFFFFF" opacity="0.9" />
          <path d="M30 12L31 20H37L36 12H30Z" fill="#FFFFFF" opacity="0.9" />
          {/* Shop Door & Window */}
          <rect x="23" y="30" width="10" height="16" fill="#0F4C81" />
          <rect x="14" y="28" width="6" height="7" rx="1" fill="#E0F2FE" stroke="#0284C7" strokeWidth="1" />
          <rect x="36" y="28" width="6" height="7" rx="1" fill="#E0F2FE" stroke="#0284C7" strokeWidth="1" />
          {/* Gold Coin Floating */}
          <circle cx="43" cy="14" r="7.5" fill="#F59E0B" stroke="#D97706" strokeWidth="1.5" />
          <text x="40.5" y="17.5" fill="#FFFFFF" fontSize="9" fontWeight="900" fontFamily="sans-serif">रु</text>
        </svg>
      ),
    },
    {
      id: 'health',
      categoryKey: 'स्वास्थ्य तथा पोषण',
      title: 'स्वास्थ्य तथा पोषण',
      subtitle: 'खोप, अपाङ्गता, सामाजिक सुरक्षा',
      count: 3,
      bgTint: '#fff1f2',
      borderColor: '#fecdd3',
      iconSvg: (
        <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Heart Container */}
          <path
            d="M28 44C28 44 10 32 10 20C10 13.5 15 9 21 9C24.5 9 27 10.8 28 12.5C29 10.8 31.5 9 35 9C41 9 46 13.5 46 20C46 32 28 44 28 44Z"
            fill="#FFE4E6"
            stroke="#E11D48"
            strokeWidth="2.5"
          />
          {/* Medical Cross in center */}
          <rect x="25" y="19" width="6" height="14" rx="2" fill="#E11D48" />
          <rect x="21" y="23" width="14" height="6" rx="2" fill="#E11D48" />
          {/* Sparkle */}
          <circle cx="39" cy="16" r="3.5" fill="#F59E0B" />
        </svg>
      ),
    },
    {
      id: 'agri',
      categoryKey: 'कृषि तथा पशुसेवा',
      title: 'कृषि तथा पशुसेवा',
      subtitle: 'मलखाद, बीउबिजन, पशु स्वास्थ्य',
      count: 2,
      bgTint: '#ecfdf5',
      borderColor: '#a7f3d0',
      iconSvg: (
        <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Plant Sprout Ground */}
          <ellipse cx="28" cy="42" rx="18" ry="4" fill="#BBF7D0" />
          {/* Wheat / Crop Stem */}
          <path d="M28 42V18" stroke="#16A34A" strokeWidth="3" strokeLinecap="round" />
          {/* Left Grain Leaves */}
          <path d="M28 34C21 33 19 28 20 25C24 25 27 30 28 34Z" fill="#22C55E" />
          <path d="M28 25C22 24 21 19 22 16C26 16 28 21 28 25Z" fill="#16A34A" />
          {/* Right Grain Leaves */}
          <path d="M28 34C35 33 37 28 36 25C32 25 29 30 28 34Z" fill="#22C55E" />
          <path d="M28 25C34 24 35 19 34 16C30 16 28 21 28 25Z" fill="#16A34A" />
          {/* Top Grain Sprout */}
          <ellipse cx="28" cy="14" rx="3.5" ry="5.5" fill="#F59E0B" />
        </svg>
      ),
    },
    {
      id: 'disaster',
      categoryKey: 'विपद् तथा राहत',
      title: 'विपद् तथा राहत',
      subtitle: 'राहत कोष, न्यायिक उजुरी',
      count: 2,
      bgTint: '#fff7ed',
      borderColor: '#fed7aa',
      iconSvg: (
        <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Protective Shield */}
          <path
            d="M28 8L44 14V28C44 38 37 45 28 48C19 45 12 38 12 28V14L28 8Z"
            fill="#FFFFFF"
            stroke="#0F4C81"
            strokeWidth="2.5"
          />
          {/* Shield Infill */}
          <path
            d="M28 11L41 16V27C41 35.5 35 42 28 44.5C21 42 15 35.5 15 27V16L28 11Z"
            fill="#FFEDD5"
          />
          {/* Emergency Alert Symbol inside Shield */}
          <path d="M28 18V29" stroke="#E65100" strokeWidth="3" strokeLinecap="round" />
          <circle cx="28" cy="35" r="2.5" fill="#E65100" />
          {/* Lifebuoy Ring Accent */}
          <circle cx="41" cy="40" r="5" fill="#F59E0B" stroke="#0F4C81" strokeWidth="1.5" />
        </svg>
      ),
    },
  ];

  // Filter services
  const filteredServices = MOCK_SERVICES.filter((srv) => {
    const matchCat = selectedCategory === 'सबै' || srv.category === selectedCategory;
    const q = charterSearch.toLowerCase();
    const matchQ =
      !q ||
      srv.title.toLowerCase().includes(q) ||
      srv.document.toLowerCase().includes(q) ||
      srv.provider.toLowerCase().includes(q);
    return matchCat && matchQ;
  });

  return (
    <div>
      {/* ─── SCREEN HEADER BANNER (MATCHING E-SIFARISH AESTHETICS) ─── */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '1.15rem 1.25rem',
          border: '1px solid #e2e8f0',
          marginBottom: '1rem',
          boxShadow: '0 4px 14px rgba(15, 76, 129, 0.05)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              {viewMode === 'list' && (
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('grid');
                    setSelectedCategory('सबै');
                  }}
                  style={{
                    background: '#f1f5f9',
                    border: 'none',
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#0F4C81',
                  }}
                  title="वर्गहरूमा फर्कनुहोस्"
                >
                  <ArrowLeft size={16} />
                </button>
              )}
              <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F4C81', margin: 0 }}>
                नागरिक बडापत्र
              </h2>
            </div>

            <p style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.45, margin: 0, maxWidth: '280px' }}>
              पाँचपोखरी थाङपाल गाउँपालिका र वडाबाट प्रवाह हुने सम्पूर्ण सेवा, आवश्यक कागजात र दस्तुरको पारदर्शी विवरण।
            </p>
          </div>

          {/* Right Vector Illustration Badge */}
          <div
            style={{
              width: '58px',
              height: '58px',
              borderRadius: '50%',
              backgroundColor: '#EBF3FA',
              border: '2px solid #F59E0B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 4px 10px rgba(15, 76, 129, 0.12)',
            }}
          >
            <Building2 size={30} color="#0F4C81" />
          </div>
        </div>

        {/* Decorative subtle ribbon */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: 'linear-gradient(90deg, #0F4C81 0%, #E65100 50%, #F59E0B 100%)',
          }}
        />
      </div>

      {/* ─── SEARCH INPUT BAR ─── */}
      <div style={{ position: 'relative', marginBottom: '0.85rem' }}>
        <Search
          size={18}
          style={{
            position: 'absolute',
            left: '14px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#64748b',
          }}
        />
        <input
          type="text"
          value={charterSearch}
          onChange={(e) => {
            setCharterSearch(e.target.value);
            if (e.target.value && viewMode === 'grid') {
              setViewMode('list');
            }
          }}
          placeholder="बडापत्र सेवा वा आवश्यक कागजात खोज्नुहोस्..."
          style={{
            width: '100%',
            height: '46px',
            paddingLeft: '44px',
            paddingRight: charterSearch ? '40px' : '14px',
            borderRadius: '14px',
            border: '1.5px solid #cbd5e1',
            backgroundColor: '#ffffff',
            fontSize: '0.88rem',
            outline: 'none',
            color: '#0F172A',
            boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
            transition: 'border-color 0.2s',
          }}
          onFocus={(e) => (e.target.style.borderColor = '#0F4C81')}
          onBlur={(e) => (e.target.style.borderColor = '#cbd5e1')}
        />
        {charterSearch && (
          <button
            type="button"
            onClick={() => setCharterSearch('')}
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: '#e2e8f0',
              border: 'none',
              borderRadius: '50%',
              width: '22px',
              height: '22px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#475569',
            }}
          >
            <X size={13} />
          </button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: 6-CARD GRID (EXACTLY MATCHING E-SIFARISH SPECIFICATION)           */}
      {/* ========================================================================= */}
      {viewMode === 'grid' && (
        <div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '0.85rem',
              marginBottom: '1rem',
            }}
          >
            {CHARTER_CATEGORIES.map((cat) => (
              <div
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.categoryKey);
                  setViewMode('list');
                }}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  border: `1.5px solid ${cat.borderColor}`,
                  padding: '1.2rem 0.85rem 1rem 0.85rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(15, 76, 129, 0.04)',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 8px 18px rgba(15, 76, 129, 0.1)';
                  e.currentTarget.style.borderColor = '#0F4C81';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(15, 76, 129, 0.04)';
                  e.currentTarget.style.borderColor = cat.borderColor;
                }}
              >
                {/* Custom SVG Icon Container */}
                <div
                  style={{
                    width: '68px',
                    height: '68px',
                    borderRadius: '50%',
                    backgroundColor: cat.bgTint,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '0.65rem',
                  }}
                >
                  {cat.iconSvg}
                </div>

                {/* Title */}
                <h3
                  style={{
                    fontSize: '0.86rem',
                    fontWeight: 800,
                    color: '#0F4C81',
                    margin: '0 0 4px 0',
                    lineHeight: 1.3,
                  }}
                >
                  {cat.title}
                </h3>

                {/* Subtitle description */}
                <span
                  style={{
                    fontSize: '0.68rem',
                    color: '#64748b',
                    marginBottom: '8px',
                    lineHeight: 1.2,
                  }}
                >
                  {cat.subtitle}
                </span>

                {/* Badge count */}
                <span
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    backgroundColor: '#F8FAFC',
                    color: '#E65100',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                  }}
                >
                  {cat.count} सेवाहरू उपलब्ध
                </span>
              </div>
            ))}
          </div>

          {/* ─── FULL-WIDTH WARM PEACH/ORANGE CTA BUTTON ─── */}
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('सबै');
              setViewMode('list');
            }}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #E9A873 0%, #E68A48 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '14px',
              padding: '14px 18px',
              fontSize: '0.94rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(230, 138, 72, 0.35)',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              marginBottom: '1rem',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            <span>सबै नागरिक बडापत्र सेवाहरू हेर्नुहोस्</span>
            <ArrowRight size={18} />
          </button>

          {/* Quick Info Box */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              padding: '0.85rem 1rem',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '0.78rem',
              color: '#475569',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: '#EBF3FA',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Sparkles size={18} color="#0F4C81" />
            </div>
            <div>
              <div style={{ fontWeight: 800, color: '#0F4C81' }}>अफलाइन डिजिटल नागरिक बडापत्र</div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                इन्टरनेट नहुँदा पनि सम्पूर्ण दस्तुर, कागजात र प्रक्रिया हेर्न सकिन्छ।
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: DETAILED SERVICE LIST & CATEGORY FILTER PILLS                     */}
      {/* ========================================================================= */}
      {viewMode === 'list' && (
        <div>
          {/* Horizontal Category Filter Pills */}
          <div
            style={{
              display: 'flex',
              gap: '0.45rem',
              overflowX: 'auto',
              paddingBottom: '8px',
              scrollbarWidth: 'none',
              marginBottom: '0.85rem',
            }}
          >
            {[
              'सबै',
              'प्रशासन तथा पञ्जीकरण',
              'घर, जग्गा तथा बाटो',
              'राजस्व तथा उद्योग',
              'स्वास्थ्य तथा पोषण',
              'कृषि तथा पशुसेवा',
              'विपद् तथा राहत',
            ].map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    backgroundColor: isActive ? '#0F4C81' : '#ffffff',
                    color: isActive ? '#ffffff' : '#334155',
                    border: isActive ? '1.5px solid #0F4C81' : '1px solid #cbd5e1',
                    borderRadius: '24px',
                    padding: '6px 12px',
                    fontSize: '0.74rem',
                    fontWeight: isActive ? 800 : 600,
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    flexShrink: 0,
                    boxShadow: isActive ? '0 3px 8px rgba(15, 76, 129, 0.25)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Results count banner */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.75rem',
              fontSize: '0.76rem',
              color: '#64748b',
            }}
          >
            <span>
              <strong>{filteredServices.length}</strong> वटा सेवाहरू फेला परे
            </span>
            <button
              type="button"
              onClick={() => {
                setViewMode('grid');
                setSelectedCategory('सबै');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#0F4C81',
                fontWeight: 700,
                fontSize: '0.74rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
              }}
            >
              <span>६ मुख्य वर्गहरू हेर्नुहोस्</span>
              <ChevronRight size={14} />
            </button>
          </div>

          {/* List of service cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {filteredServices.map((srv) => (
              <div
                key={srv.id}
                onClick={() => onSelectService(srv)}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '14px',
                  padding: '0.95rem 1.1rem',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 6px rgba(15, 76, 129, 0.04)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.borderColor = '#0F4C81';
                  e.currentTarget.style.boxShadow = '0 6px 14px rgba(15, 76, 129, 0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.boxShadow = '0 2px 6px rgba(15, 76, 129, 0.04)';
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '0.4rem',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      backgroundColor: srv.type === 'ward' ? '#ecfdf5' : '#EBF3FA',
                      color: srv.type === 'ward' ? '#059669' : '#0F4C81',
                      padding: '2px 8px',
                      borderRadius: '8px',
                    }}
                  >
                    {srv.category} • {srv.type === 'ward' ? 'वडा कार्यालय' : 'गाउँपालिका'}
                  </span>
                  <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#E65100' }}>
                    {srv.price}
                  </span>
                </div>

                <h3
                  style={{
                    fontSize: '0.92rem',
                    fontWeight: 800,
                    color: '#0F172A',
                    margin: '0 0 0.4rem 0',
                    lineHeight: 1.35,
                  }}
                >
                  {srv.title}
                </h3>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.72rem',
                    color: '#64748b',
                    borderTop: '1px solid #f1f5f9',
                    paddingTop: '0.45rem',
                    marginTop: '0.45rem',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={13} color="#64748b" />
                    समय: <strong>{srv.serviceTime}</strong>
                  </span>
                  <span
                    style={{
                      color: '#0F4C81',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2px',
                    }}
                  >
                    विवरण हेर्नुहोस् <ChevronRight size={14} />
                  </span>
                </div>
              </div>
            ))}

            {filteredServices.length === 0 && (
              <div
                style={{
                  backgroundColor: '#ffffff',
                  padding: '2rem 1rem',
                  borderRadius: '12px',
                  textAlign: 'center',
                  border: '1px solid #e2e8f0',
                }}
              >
                <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>🔍</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0F172A' }}>
                  कुनै सेवा फेला परेन
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                  फरक खोज शब्द प्रयोग गर्नुहोस् वा वर्ग परिवर्तन गर्नुहोस्।
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
