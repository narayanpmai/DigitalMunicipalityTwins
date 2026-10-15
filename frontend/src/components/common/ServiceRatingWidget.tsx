import React, { useState } from 'react';
import { Star, Send, X, CheckCircle2, ThumbsUp, MessageSquare } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════════════════
   ServiceRatingWidget — Reusable post-service feedback component
   Usage: <ServiceRatingWidget serviceName="नागरिकता सिफारिस" onClose={() => setShowRating(false)} />
   ═══════════════════════════════════════════════════════════════════════════ */

interface ServiceRatingWidgetProps {
  serviceName: string;           // e.g. "नागरिकता सिफारिस"
  referenceNo?: string;          // optional — complaint no, cert no etc.
  onClose: () => void;
  onSubmit?: (rating: number, feedback: string) => void;
  mode?: 'modal' | 'inline';    // modal = floating, inline = embedded
}

const EMOJI_MAP: Record<number, { emoji: string; label: string; color: string }> = {
  1: { emoji: '😞', label: 'अत्यन्त खराब',  color: '#DC2626' },
  2: { emoji: '😕', label: 'खराब',           color: '#F59E0B' },
  3: { emoji: '😐', label: 'ठीकै छ',         color: '#6366F1' },
  4: { emoji: '😊', label: 'राम्रो',          color: '#10B981' },
  5: { emoji: '🤩', label: 'उत्कृष्ट!',      color: '#0F4C81' },
};

const QUICK_TAGS = [
  'छिटो सेवा', 'कर्मचारी सहयोगी', 'अनलाइन सजिलो', 'पारदर्शी', 'कागजात स्पष्ट'
];

export const ServiceRatingWidget: React.FC<ServiceRatingWidgetProps> = ({
  serviceName,
  referenceNo,
  onClose,
  onSubmit,
  mode = 'modal',
}) => {
  const [hoveredStar, setHoveredStar] = useState(0);
  const [selectedStar, setSelectedStar] = useState(0);
  const [feedback, setFeedback]       = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [submitted, setSubmitted]     = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedStar) return;
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((r) => setTimeout(r, 800));
    onSubmit?.(selectedStar, [feedback, ...selectedTags].filter(Boolean).join(' | '));
    setSubmitted(true);
    setIsSubmitting(false);

    // Auto-close after 2.5s
    setTimeout(onClose, 2500);
  };

  const toggleTag = (tag: string) =>
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );

  const activeStar = hoveredStar || selectedStar;
  const activeInfo = activeStar ? EMOJI_MAP[activeStar] : null;

  const containerStyle: React.CSSProperties =
    mode === 'modal'
      ? {
          position: 'fixed', bottom: '90px', right: '24px', zIndex: 99998,
          width: '340px', animation: 'slideUpFade 0.3s ease-out',
        }
      : { width: '100%' };

  return (
    <>
      <style>{`
        @keyframes slideUpFade {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes successPop {
          0%   { transform: scale(0.8); opacity: 0; }
          60%  { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>

      <div style={containerStyle}>
        <div style={{
          background: '#fff',
          borderRadius: '16px',
          boxShadow: '0 12px 40px rgba(15,23,42,0.18)',
          border: '1.5px solid var(--gov-border,#E2E8F0)',
          overflow: 'hidden',
          fontFamily: "'Noto Sans Devanagari','Outfit','Inter',sans-serif",
        }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #0F4C81 0%, #1565C0 100%)',
            padding: '14px 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessageSquare size={18} color="#90CAF9" />
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff' }}>सेवा मूल्याङ्कन</div>
                {referenceNo && (
                  <div style={{ fontSize: '0.68rem', color: '#90CAF9' }}>Ref: {referenceNo}</div>
                )}
              </div>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#90CAF9', cursor: 'pointer', padding: '4px' }}>
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          {submitted ? (
            <div style={{ padding: '32px 20px', textAlign: 'center' }}>
              <div style={{ animation: 'successPop 0.4s ease-out', marginBottom: '12px' }}>
                <CheckCircle2 size={48} color="#10B981" />
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>
                धन्यवाद! 🙏
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
                तपाईंको प्रतिक्रिया प्राप्त भयो। हामी सेवालाई अझ राम्रो बनाउने प्रयास गर्नेछौं।
              </div>
            </div>
          ) : (
            <div style={{ padding: '16px' }}>
              {/* Service Name */}
              <p style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0F172A', margin: '0 0 12px 0', textAlign: 'center' }}>
                "{serviceName}" सेवा कस्तो लाग्यो?
              </p>

              {/* Stars */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: '10px' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(0)}
                    onClick={() => setSelectedStar(star)}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer', padding: '2px',
                      transition: 'transform 0.1s',
                      transform: star <= activeStar ? 'scale(1.15)' : 'scale(1)',
                    }}
                  >
                    <Star
                      size={32}
                      fill={star <= activeStar ? '#F59E0B' : 'none'}
                      color={star <= activeStar ? '#F59E0B' : '#CBD5E1'}
                      strokeWidth={1.5}
                    />
                  </button>
                ))}
              </div>

              {/* Emoji Feedback */}
              {activeInfo && (
                <div style={{ textAlign: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '1.6rem' }}>{activeInfo.emoji}</span>
                  <span style={{
                    display: 'block', fontSize: '0.75rem', fontWeight: 700,
                    color: activeInfo.color, marginTop: '2px',
                  }}>
                    {activeInfo.label}
                  </span>
                </div>
              )}

              {/* Quick Tags */}
              {selectedStar >= 4 && (
                <div style={{ marginBottom: '10px' }}>
                  <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 600, marginBottom: '6px' }}>
                    के राम्रो लाग्यो? (छान्नुहोस्)
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                    {QUICK_TAGS.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        style={{
                          padding: '4px 9px', fontSize: '0.68rem', fontWeight: 600,
                          borderRadius: '9999px', cursor: 'pointer', fontFamily: 'inherit',
                          background: selectedTags.includes(tag) ? '#0F4C81' : '#EBF3FA',
                          color:      selectedTags.includes(tag) ? '#fff' : '#0F4C81',
                          border:     '1px solid ' + (selectedTags.includes(tag) ? '#0F4C81' : '#BCD5EB'),
                          transition: 'all 0.15s',
                        }}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Text Feedback */}
              <textarea
                rows={2}
                placeholder="थप सुझाव वा प्रतिक्रिया (ऐच्छिक)..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                style={{
                  width: '100%', padding: '8px 10px', fontSize: '0.78rem',
                  border: '1.5px solid #E2E8F0', borderRadius: '8px', outline: 'none',
                  resize: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
                  background: '#F8FAFC', color: '#0F172A',
                }}
              />

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={!selectedStar || isSubmitting}
                style={{
                  width: '100%', marginTop: '10px', padding: '10px',
                  background: selectedStar ? 'linear-gradient(135deg,#0F4C81,#1565C0)' : '#E2E8F0',
                  color: selectedStar ? '#fff' : '#94A3B8',
                  border: 'none', borderRadius: '8px', fontSize: '0.85rem',
                  fontWeight: 700, cursor: selectedStar ? 'pointer' : 'not-allowed',
                  fontFamily: 'inherit', transition: 'all 0.15s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
                }}
              >
                {isSubmitting ? (
                  <span>पठाउँदैछ...</span>
                ) : (
                  <><Send size={15} /> प्रतिक्रिया पठाउनुहोस्</>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

/* ── Demo trigger button (for testing on any page) ─────────────────────── */
export const ServiceRatingTrigger: React.FC<{ serviceName: string; referenceNo?: string }> = ({
  serviceName, referenceNo,
}) => {
  const [show, setShow] = useState(false);
  return (
    <>
      <button
        onClick={() => setShow(true)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          padding: '8px 16px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700,
          background: '#FFF9C4', color: '#92400E', border: '1px solid #FDE68A',
          cursor: 'pointer', fontFamily: 'inherit',
        }}
      >
        <ThumbsUp size={14} /> सेवाको मूल्याङ्कन गर्नुहोस्
      </button>
      {show && (
        <ServiceRatingWidget
          serviceName={serviceName}
          referenceNo={referenceNo}
          onClose={() => setShow(false)}
        />
      )}
    </>
  );
};

export default ServiceRatingWidget;
