import React, { useState } from 'react';
import {
  Search,
  ArrowRight,
  ArrowLeft,
  FileCheck2,
  CheckCircle2,
  Clock,
  ChevronRight,
  Sparkles,
  Phone,
  FileText,
  Building2,
  Filter,
} from 'lucide-react';
import { SifarishTemplate } from '../../types';
import { MOCK_SIFARISH_TEMPLATES } from '../../data/mockData';

interface SifarishCategoryHubProps {
  onSelectTemplate: (template: SifarishTemplate) => void;
  trackingNoInput: string;
  setTrackingNoInput: (val: string) => void;
  trackedResult: any;
  setTrackedResult: (val: any) => void;
}

export const SifarishCategoryHub: React.FC<SifarishCategoryHubProps> = ({
  onSelectTemplate,
  trackingNoInput,
  setTrackingNoInput,
  trackedResult,
  setTrackedResult,
}) => {
  // View mode: 'grid' (the 6-card visual view from screenshot) or 'list' (all templates / filtered)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('सबै');
  const [searchQuery, setSearchQuery] = useState('');

  // 6 Main Categories from the reference design
  const CATEGORIES = [
    {
      id: 'citizenship',
      title: 'नागरिकता सिफारिस',
      count: 4,
      bgTint: '#eff6ff',
      borderColor: '#bfdbfe',
      iconSvg: (
        <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="6" y="10" width="44" height="34" rx="6" fill="#FFFFFF" stroke="#0F4C81" strokeWidth="2.5" />
          <rect x="6" y="10" width="44" height="10" rx="4" fill="#0F4C81" />
          <circle cx="18" cy="28" r="6" fill="#38BDF8" />
          <rect x="28" y="24" width="16" height="3" rx="1.5" fill="#94A3B8" />
          <rect x="28" y="30" width="12" height="3" rx="1.5" fill="#CBD5E1" />
          <rect x="28" y="36" width="14" height="2.5" rx="1.25" fill="#E2E8F0" />
        </svg>
      ),
    },
    {
      id: 'property',
      title: 'घर/जग्गा/बाटो सिफारिस',
      count: 4,
      bgTint: '#f0fdf4',
      borderColor: '#bbf7d0',
      iconSvg: (
        <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Green Land base */}
          <path d="M4 42C12 36 24 38 34 35C44 32 50 36 52 38V44H4V42Z" fill="#86EFAC" />
          <path d="M8 44C18 39 30 40 40 38C46 36 50 40 52 42V45H8V44Z" fill="#22C55E" />
          {/* House */}
          <path d="M18 24L28 16L38 24V38H18V24Z" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="2" />
          {/* Red Roof */}
          <path d="M15 25L28 14L41 25" stroke="#E65100" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          {/* Door & Window */}
          <rect x="25" y="28" width="6" height="10" rx="1" fill="#0F4C81" />
          <rect x="31" y="23" width="5" height="5" rx="1" fill="#F59E0B" />
        </svg>
      ),
    },
    {
      id: 'consumer',
      title: 'उपभोक्ता सिफारिस',
      count: 3,
      bgTint: '#fff1f2',
      borderColor: '#fecdd3',
      iconSvg: (
        <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Center Leader with Nepali Dhaka Topi */}
          <circle cx="28" cy="22" r="6" fill="#FBCFE8" />
          <path d="M22 17L28 11L34 17H22Z" fill="#991B1B" />
          <path d="M23 15L28 11L33 15" stroke="#FDE047" strokeWidth="1" />
          <path d="M18 40C18 33 22 30 28 30C34 30 38 33 38 40" fill="#E11D48" />
          {/* Left Citizen */}
          <circle cx="15" cy="25" r="4.5" fill="#FDE68A" />
          <path d="M8 42C8 36 11 34 15 34C19 34 22 36 22 42" fill="#0F4C81" />
          {/* Right Citizen with Topi */}
          <circle cx="41" cy="25" r="4.5" fill="#FDE68A" />
          <path d="M37 21L41 17L45 21H37Z" fill="#1E293B" />
          <path d="M34 42C34 36 37 34 41 34C45 34 48 36 48 42" fill="#0284C7" />
        </svg>
      ),
    },
    {
      id: 'registration',
      title: 'पञ्जीकरण सिफारिस',
      count: 4,
      bgTint: '#f0fdfa',
      borderColor: '#99f6e4',
      iconSvg: (
        <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Document Base */}
          <rect x="12" y="10" width="32" height="38" rx="4" fill="#FFFFFF" stroke="#0F4C81" strokeWidth="2.5" />
          {/* Header Strip */}
          <rect x="16" y="15" width="24" height="4" rx="2" fill="#38BDF8" />
          {/* Photo Box */}
          <rect x="16" y="23" width="10" height="12" rx="2" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="1.5" />
          <circle cx="21" cy="27" r="2.5" fill="#94A3B8" />
          {/* Lines */}
          <rect x="29" y="24" width="11" height="2.5" rx="1.25" fill="#94A3B8" />
          <rect x="29" y="29" width="9" height="2.5" rx="1.25" fill="#CBD5E1" />
          <rect x="29" y="34" width="11" height="2.5" rx="1.25" fill="#CBD5E1" />
          {/* Verified Official Seal */}
          <circle cx="36" cy="40" r="5" fill="#10B981" />
          <path d="M34 40L35.5 41.5L38.5 38.5" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      id: 'tax',
      title: 'कर सिफारिस',
      count: 4,
      bgTint: '#fffbeb',
      borderColor: '#fde68a',
      iconSvg: (
        <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Paper Bill */}
          <rect x="16" y="10" width="28" height="34" rx="4" fill="#FFFFFF" stroke="#0F4C81" strokeWidth="2.5" />
          <text x="22" y="22" fill="#0F4C81" fontSize="8" fontWeight="900" fontFamily="sans-serif">TAX</text>
          <rect x="20" y="26" width="18" height="2.5" rx="1" fill="#94A3B8" />
          <rect x="20" y="31" width="14" height="2.5" rx="1" fill="#CBD5E1" />
          {/* Currency Note */}
          <rect x="8" y="32" width="26" height="15" rx="3" fill="#86EFAC" stroke="#16A34A" strokeWidth="2" />
          <circle cx="21" cy="39.5" r="3.5" fill="#16A34A" />
          {/* Tax % Badge */}
          <circle cx="38" cy="20" r="6" fill="#E65100" />
          <text x="35" y="23" fill="#FFFFFF" fontSize="8" fontWeight="900">%</text>
        </svg>
      ),
    },
    {
      id: 'other',
      title: 'अन्य सिफारिस',
      count: 4,
      bgTint: '#f8fafc',
      borderColor: '#e2e8f0',
      iconSvg: (
        <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Clipboard Board */}
          <rect x="14" y="12" width="30" height="36" rx="4" fill="#F1F5F9" stroke="#0F4C81" strokeWidth="2.5" />
          {/* Clip Top */}
          <rect x="22" y="9" width="14" height="5" rx="2" fill="#F59E0B" />
          {/* Checks on Paper */}
          <rect x="17" y="16" width="24" height="28" rx="2" fill="#FFFFFF" />
          <circle cx="22" cy="23" r="2.5" fill="#10B981" />
          <rect x="27" y="22" width="11" height="2" rx="1" fill="#64748B" />
          <circle cx="22" cy="30" r="2.5" fill="#10B981" />
          <rect x="27" y="29" width="9" height="2" rx="1" fill="#64748B" />
          <circle cx="22" cy="37" r="2.5" fill="#10B981" />
          <rect x="27" y="36" width="11" height="2" rx="1" fill="#64748B" />
        </svg>
      ),
    },
  ];

  // Filter templates
  const filteredTemplates = MOCK_SIFARISH_TEMPLATES.filter((tpl) => {
    const matchCat = selectedCategory === 'सबै' || tpl.category.includes(selectedCategory);
    const q = searchQuery.toLowerCase();
    const matchQ = !q || tpl.name.toLowerCase().includes(q) || tpl.department.toLowerCase().includes(q);
    return matchCat && matchQ;
  });

  return (
    <div>
      {/* ─── SCREEN HEADER BANNER (EXACTLY MATCHING USER'S SCREENSHOT) ─── */}
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
                ई-सिफारिस
              </h2>
            </div>

            <p style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.45, margin: 0, maxWidth: '280px' }}>
              पाँचपोखरी थाङपाल गाउँपालिका र यस भित्रका वडाहरुलाई पेपरलेस बनाउने हाम्रो अभियान हो।
            </p>
          </div>

          {/* Right Header Illustration Badge */}
          <div
            style={{
              width: '68px',
              height: '68px',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="68" height="68" viewBox="0 0 68 68" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Document in background */}
              <rect x="22" y="8" width="38" height="48" rx="5" fill="#FFFFFF" stroke="#0F4C81" strokeWidth="2.5" />
              <rect x="28" y="14" width="16" height="3" rx="1.5" fill="#0F4C81" />
              <circle cx="34" cy="25" r="4.5" fill="#F59E0B" />
              <rect x="28" y="33" width="24" height="2.5" rx="1" fill="#94A3B8" />
              <rect x="28" y="38" width="20" height="2.5" rx="1" fill="#CBD5E1" />
              <rect x="28" y="43" width="24" height="2.5" rx="1" fill="#CBD5E1" />
              {/* Smartphone in foreground */}
              <rect x="8" y="18" width="26" height="42" rx="4" fill="#0F4C81" stroke="#FFFFFF" strokeWidth="2" />
              <rect x="11" y="24" width="20" height="28" rx="2" fill="#E65100" />
              <circle cx="21" cy="55" r="2" fill="#FFFFFF" />
            </svg>
          </div>
        </div>
      </div>

      {/* ─── VIEW 1: THE 2-COLUMN CATEGORY CARDS GRID (FROM SCREENSHOT) ─── */}
      {viewMode === 'grid' && (
        <div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '0.85rem',
              marginBottom: '1.25rem',
            }}
          >
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat.title);
                  setViewMode('list');
                }}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '18px',
                  padding: '1.25rem 0.75rem',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 15px rgba(15, 76, 129, 0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(15, 76, 129, 0.12)';
                  e.currentTarget.style.borderColor = '#0F4C81';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(15, 76, 129, 0.05)';
                  e.currentTarget.style.borderColor = '#e2e8f0';
                }}
              >
                {/* 3D Illustrated Icon */}
                <div style={{ marginBottom: '0.65rem' }}>
                  {cat.iconSvg}
                </div>

                {/* Category Title */}
                <span
                  style={{
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    color: '#334155',
                    lineHeight: 1.3,
                  }}
                >
                  {cat.title}
                </span>

                <span style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '3px' }}>
                  {cat.count} वटा सेवाहरू
                </span>
              </button>
            ))}
          </div>

          {/* ─── BOTTOM FULL-WIDTH WARM CTA BUTTON (EXACTLY MATCHING IMAGE) ─── */}
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
              padding: '12px 18px',
              borderRadius: '26px',
              fontSize: '0.92rem',
              fontWeight: 900,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 6px 20px rgba(230, 138, 72, 0.35)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <span>सबै ई-सिफारिसहरु हेर्नुहोस्</span>
            <ArrowRight size={18} />
          </button>
        </div>
      )}

      {/* ─── VIEW 2: TEMPLATES LIST & TRACKING (WHEN EXPANDED) ─── */}
      {viewMode === 'list' && (
        <div>
          {/* Back & Active Category Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
            <button
              type="button"
              onClick={() => {
                setViewMode('grid');
                setSelectedCategory('सबै');
              }}
              style={{
                backgroundColor: '#f1f5f9',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '0.75rem',
                fontWeight: 800,
                color: '#0F4C81',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <ArrowLeft size={14} />
              <span>६ वर्गहरूमा फर्कनुहोस्</span>
            </button>

            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#E65100' }}>
              {selectedCategory} ({filteredTemplates.length})
            </span>
          </div>

          {/* Quick Search */}
          <div style={{ position: 'relative', marginBottom: '0.75rem' }}>
            <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="सिफारिसको नामबाट खोज्नुहोस्..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                height: '40px',
                paddingLeft: '34px',
                paddingRight: '12px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                fontSize: '0.8rem',
                backgroundColor: '#ffffff',
              }}
            />
          </div>

          {/* Application Tracker Box */}
          <div
            style={{
              backgroundColor: '#EBF3FA',
              borderRadius: '12px',
              padding: '0.85rem 1rem',
              marginBottom: '1rem',
              border: '1px solid #BCD5EB',
            }}
          >
            <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0F4C81', marginBottom: '0.35rem' }}>
              🔍 दरखास्त अवस्था ट्र्याक गर्नुहोस्:
            </div>
            <div style={{ display: 'flex', gap: '0.45rem' }}>
              <input
                type="text"
                value={trackingNoInput}
                onChange={(e) => setTrackingNoInput(e.target.value)}
                placeholder="उदा. PPK-SIF-3-4215"
                style={{
                  flex: 1,
                  height: '36px',
                  padding: '0 10px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.78rem',
                  backgroundColor: '#fff',
                }}
              />
              <button
                type="button"
                onClick={() => {
                  if (!trackingNoInput.trim()) return;
                  setTrackedResult({
                    appNo: trackingNoInput,
                    name: 'राम बहादुर श्रेष्ठ',
                    service: 'नागरिकता प्रमाणपत्र सिफारिस',
                    ward: 3,
                    status: 'कारबाहीमा (वडा अध्यक्ष तोक आदेश)',
                    date: '२०८१/०६/१२',
                  });
                }}
                style={{
                  backgroundColor: '#0F4C81',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0 14px',
                  fontWeight: 800,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                }}
              >
                जाँच
              </button>
            </div>

            {trackedResult && (
              <div style={{ marginTop: '0.65rem', backgroundColor: '#fff', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #bae6fd' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0F4C81' }}>
                  आवेदन नं: {trackedResult.appNo}
                </div>
                <div style={{ fontSize: '0.74rem', color: '#475569', marginTop: '2px' }}>
                  आवेदक: <strong>{trackedResult.name}</strong> (वडा नं. {trackedResult.ward})
                </div>
                <div style={{ fontSize: '0.74rem', color: '#475569' }}>
                  सेवा: {trackedResult.service}
                </div>
                <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#16a34a', marginTop: '3px' }}>
                  स्थिति: {trackedResult.status}
                </div>
              </div>
            )}
          </div>

          {/* Template Cards List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {filteredTemplates.map((tpl) => (
              <div
                key={tpl.id}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  padding: '0.85rem 1rem',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 6px rgba(15, 76, 129, 0.03)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div style={{ flex: 1, paddingRight: '0.75rem' }}>
                  <div style={{ fontSize: '0.68rem', color: '#E65100', fontWeight: 700 }}>
                    {tpl.category}
                  </div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0F172A', marginTop: '1px' }}>
                    {tpl.name}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '2px' }}>
                    दस्तुर: <strong style={{ color: '#D97706' }}>रु. {tpl.fee}</strong> • समय: {tpl.timeDays} दिन • {tpl.department}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectTemplate(tpl)}
                  style={{
                    backgroundColor: '#0F4C81',
                    color: '#ffffff',
                    border: 'none',
                    padding: '7px 14px',
                    borderRadius: '8px',
                    fontWeight: 800,
                    fontSize: '0.76rem',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 2px 6px rgba(15, 76, 129, 0.25)',
                  }}
                >
                  फारम भर्नुहोस्
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
