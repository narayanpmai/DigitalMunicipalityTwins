import React, { useState, useEffect } from 'react';
import {
  RotateCw,
  Sparkles,
  Sliders,
  Check,
  X,
  Crop as CropIcon,
  PlusCircle,
  Sun,
  Contrast,
  Layers,
} from 'lucide-react';
import { DocumentFilterType } from '../../types';
import { processScannedImage } from '../../utils/scannerUtils';

interface CropFilterModalProps {
  isOpen: boolean;
  rawImage: string;
  onClose: () => void;
  onSavePage: (processedImage: string, filter: DocumentFilterType, brightness: number, contrast: number, rotation: number, addAnother: boolean) => void;
}

export const CropFilterModal: React.FC<CropFilterModalProps> = ({
  isOpen,
  rawImage,
  onClose,
  onSavePage,
}) => {
  const [filter, setFilter] = useState<DocumentFilterType>('magic');
  const [rotation, setRotation] = useState<number>(0);
  const [brightness, setBrightness] = useState<number>(0);
  const [contrast, setContrast] = useState<number>(10);
  const [processedPreview, setProcessedPreview] = useState<string>(rawImage);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [showSliders, setShowSliders] = useState<boolean>(false);
  const [isAutoEdgeOn, setIsAutoEdgeOn] = useState<boolean>(true);

  // Re-run filter processing on options change
  useEffect(() => {
    if (!isOpen || !rawImage) return;

    let isCancelled = false;
    const run = async () => {
      setIsProcessing(true);
      try {
        const out = await processScannedImage(rawImage, {
          filter,
          brightness,
          contrast,
          rotation,
        });
        if (!isCancelled) {
          setProcessedPreview(out);
        }
      } catch (err) {
        console.error('Filter preview error:', err);
      } finally {
        if (!isCancelled) setIsProcessing(false);
      }
    };

    const timeout = setTimeout(run, 100);
    return () => {
      isCancelled = true;
      clearTimeout(timeout);
    };
  }, [isOpen, rawImage, filter, rotation, brightness, contrast]);

  if (!isOpen) return null;

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleFinish = (addAnother: boolean) => {
    onSavePage(processedPreview, filter, brightness, contrast, rotation, addAnother);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#090d16',
        zIndex: 2100,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0.85rem 1rem',
          backgroundColor: '#0f172a',
          color: '#fff',
          borderBottom: '1px solid #1e293b',
        }}
      >
        <button
          type="button"
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#cbd5e1',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.82rem',
            cursor: 'pointer',
          }}
        >
          <X size={18} />
          <span>रद्द</span>
        </button>

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 800 }}>कागजात सम्पादन तथा फिल्टर</div>
          <div style={{ fontSize: '0.68rem', color: '#38bdf8' }}>किनारा, रंग र कन्ट्रास्ट मिलाउनुहोस्</div>
        </div>

        <button
          type="button"
          onClick={handleRotate}
          style={{
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            color: '#fff',
            borderRadius: '6px',
            padding: '6px 10px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.78rem',
            cursor: 'pointer',
          }}
        >
          <RotateCw size={15} />
          <span>९०° घुमाउनुहोस्</span>
        </button>
      </div>

      {/* Main Image Preview Area */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: '#020617',
        }}
      >
        <div
          style={{
            position: 'relative',
            maxHeight: '100%',
            maxWidth: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <img
            src={processedPreview}
            alt="Scanned Preview"
            style={{
              maxHeight: '62vh',
              maxWidth: '92vw',
              borderRadius: '8px',
              objectFit: 'contain',
              boxShadow: '0 8px 30px rgba(0,0,0,0.6)',
              opacity: isProcessing ? 0.7 : 1,
              transition: 'opacity 0.15s ease',
            }}
          />

          {/* Auto Crop Visual Border overlay */}
          {isAutoEdgeOn && (
            <div
              style={{
                position: 'absolute',
                inset: '3%',
                border: '2px dashed rgba(56, 189, 248, 0.9)',
                borderRadius: '6px',
                pointerEvents: 'none',
              }}
            >
              <div style={{ position: 'absolute', top: -6, left: -6, width: 12, height: 12, backgroundColor: '#38bdf8', borderRadius: '50%' }} />
              <div style={{ position: 'absolute', top: -6, right: -6, width: 12, height: 12, backgroundColor: '#38bdf8', borderRadius: '50%' }} />
              <div style={{ position: 'absolute', bottom: -6, left: -6, width: 12, height: 12, backgroundColor: '#38bdf8', borderRadius: '50%' }} />
              <div style={{ position: 'absolute', bottom: -6, right: -6, width: 12, height: 12, backgroundColor: '#38bdf8', borderRadius: '50%' }} />
            </div>
          )}
        </div>

        {/* Floating Auto-Edge toggle */}
        <button
          type="button"
          onClick={() => setIsAutoEdgeOn(!isAutoEdgeOn)}
          style={{
            position: 'absolute',
            bottom: '12px',
            right: '16px',
            backgroundColor: isAutoEdgeOn ? '#0284c7' : 'rgba(30, 41, 59, 0.8)',
            color: '#fff',
            border: 'none',
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '0.72rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            backdropFilter: 'blur(6px)',
          }}
        >
          <CropIcon size={14} />
          <span>किनारा पहिचान (Auto Edge): {isAutoEdgeOn ? 'सक्रिय' : 'बन्द'}</span>
        </button>
      </div>

      {/* Sliders drawer if opened */}
      {showSliders && (
        <div
          style={{
            backgroundColor: '#0f172a',
            padding: '0.75rem 1rem',
            borderTop: '1px solid #1e293b',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.75rem', color: '#cbd5e1' }}>
            <Sun size={16} color="#facc15" />
            <span style={{ width: '60px' }}>उज्यालो:</span>
            <input
              type="range"
              min={-50}
              max={50}
              value={brightness}
              onChange={(e) => setBrightness(Number(e.target.value))}
              style={{ flex: 1, accentColor: '#38bdf8' }}
            />
            <span style={{ width: '30px', textAlign: 'right' }}>{brightness}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.75rem', color: '#cbd5e1' }}>
            <Contrast size={16} color="#38bdf8" />
            <span style={{ width: '60px' }}>कन्ट्रास्ट:</span>
            <input
              type="range"
              min={-50}
              max={50}
              value={contrast}
              onChange={(e) => setContrast(Number(e.target.value))}
              style={{ flex: 1, accentColor: '#38bdf8' }}
            />
            <span style={{ width: '30px', textAlign: 'right' }}>{contrast}</span>
          </div>
        </div>
      )}

      {/* Filter Presets Toolbar */}
      <div
        style={{
          backgroundColor: '#0b1120',
          padding: '0.75rem 1rem',
          borderTop: '1px solid #1e293b',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700 }}>फिल्टर छान्नुहोस्:</span>
          <button
            type="button"
            onClick={() => setShowSliders(!showSliders)}
            style={{
              background: 'none',
              border: 'none',
              color: showSliders ? '#38bdf8' : '#94a3b8',
              fontSize: '0.72rem',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
            }}
          >
            <Sliders size={13} />
            <span>उज्यालो/कन्ट्रास्ट मिलाउनुहोस्</span>
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
          {[
            { id: 'magic', label: 'म्याजिक कलर', desc: 'सफा र चहकिलो', icon: <Sparkles size={14} /> },
            { id: 'bw', label: 'कालो-सेतो', desc: 'पत्र तथा छाप', icon: <Layers size={14} /> },
            { id: 'grayscale', label: 'ग्रेस्केल', desc: 'कागज प्रतिलिपि', icon: <Contrast size={14} /> },
            { id: 'original', label: 'सक्कली', desc: 'क्यामेरा फोटो', icon: <CropIcon size={14} /> },
          ].map((item) => {
            const isSelected = filter === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setFilter(item.id as DocumentFilterType)}
                style={{
                  backgroundColor: isSelected ? 'rgba(2, 132, 199, 0.25)' : '#1e293b',
                  border: isSelected ? '2px solid #38bdf8' : '1px solid #334155',
                  borderRadius: '8px',
                  padding: '6px 4px',
                  color: isSelected ? '#38bdf8' : '#e2e8f0',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ marginBottom: '2px' }}>{item.icon}</div>
                <div style={{ fontSize: '0.72rem', fontWeight: 800 }}>{item.label}</div>
                <div style={{ fontSize: '0.6rem', color: '#94a3b8' }}>{item.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Action Buttons */}
      <div
        style={{
          padding: '0.85rem 1rem',
          backgroundColor: '#0f172a',
          borderTop: '1px solid #1e293b',
          display: 'flex',
          gap: '0.75rem',
        }}
      >
        {/* Add Another Page */}
        <button
          type="button"
          onClick={() => handleFinish(true)}
          style={{
            flex: 1,
            backgroundColor: '#1e293b',
            color: '#e2e8f0',
            border: '1px solid #334155',
            padding: '10px',
            borderRadius: '10px',
            fontWeight: 700,
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            cursor: 'pointer',
          }}
        >
          <PlusCircle size={16} color="#38bdf8" />
          <span>+ अर्को पृष्ठ थप्नुहोस्</span>
        </button>

        {/* Save & Continue */}
        <button
          type="button"
          onClick={() => handleFinish(false)}
          style={{
            flex: 1.2,
            backgroundColor: '#0284c7',
            color: '#ffffff',
            border: 'none',
            padding: '10px',
            borderRadius: '10px',
            fontWeight: 800,
            fontSize: '0.82rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(2, 132, 199, 0.4)',
          }}
        >
          <Check size={16} />
          <span>पृष्ठ सुरक्षित गर्नुहोस्</span>
        </button>
      </div>
    </div>
  );
};
