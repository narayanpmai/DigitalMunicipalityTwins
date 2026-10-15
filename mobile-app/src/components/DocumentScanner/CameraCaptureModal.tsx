import React, { useRef, useState, useEffect } from 'react';
import { Camera, Image as ImageIcon, X, RefreshCw, Sparkles, Check } from 'lucide-react';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageDataUrl: string) => void;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({ isOpen, onClose, onCapture }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const startCamera = async () => {
    try {
      setCameraError(null);
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play();
        }
      } else {
        setCameraError('क्यामेरा समर्थन उपलब्ध छैन। कृपया ग्यालरीबाट फोटो छान्नुहोस्।');
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setCameraError('क्यामेरा सुरु हुन सकेन। कृपया ग्यालरीबाट फोटो अपलोड गर्नुहोस्।');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    stopCamera();
    onCapture(dataUrl);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        stopCamera();
        onCapture(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#090d16',
        zIndex: 2000,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1rem',
          color: '#fff',
          zIndex: 10,
        }}
      >
        <button
          type="button"
          onClick={() => {
            stopCamera();
            onClose();
          }}
          style={{
            background: 'rgba(255,255,255,0.15)',
            border: 'none',
            color: '#fff',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <X size={22} />
        </button>

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.95rem', fontWeight: 800 }}>स्मार्ट क्यामेरा स्क्यानर</div>
          <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>कागजातलाई घेराभित्र मिलाउनुहोस्</div>
        </div>

        <button
          type="button"
          onClick={() => setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'))}
          style={{
            background: 'rgba(255,255,255,0.15)',
            border: 'none',
            color: '#fff',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
          title="क्यामेरा परिवर्तन गर्नुहोस्"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      {/* Viewport Area */}
      <div
        style={{
          flex: 1,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          backgroundColor: '#020617',
        }}
      >
        {cameraError ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#cbd5e1' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📷</div>
            <div style={{ fontSize: '0.9rem', marginBottom: '1rem', color: '#f87171' }}>{cameraError}</div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={{
                backgroundColor: '#0284c7',
                color: '#fff',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              ग्यालरी वा फाइलबाट छान्नुहोस्
            </button>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              playsInline
              muted
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />

            {/* Document Guide Frame Overlay */}
            <div
              style={{
                position: 'absolute',
                width: '84%',
                height: '76%',
                border: '2px solid rgba(220, 38, 38, 0.8)',
                borderRadius: '12px',
                boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.45)',
                pointerEvents: 'none',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '12px',
              }}
            >
              {/* Corner Accents */}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ width: '24px', height: '24px', borderTop: '4px solid #DC2626', borderLeft: '4px solid #DC2626' }} />
                <div style={{ width: '24px', height: '24px', borderTop: '4px solid #DC2626', borderRight: '4px solid #DC2626' }} />
              </div>

              <div
                style={{
                  alignSelf: 'center',
                  backgroundColor: 'rgba(15, 23, 42, 0.8)',
                  backdropFilter: 'blur(4px)',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  color: '#e0f2fe',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Sparkles size={14} color="#DC2626" />
                <span>Auto Edge & Contrast Detection Active</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ width: '24px', height: '24px', borderBottom: '4px solid #DC2626', borderLeft: '4px solid #DC2626' }} />
                <div style={{ width: '24px', height: '24px', borderBottom: '4px solid #DC2626', borderRight: '4px solid #DC2626' }} />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Bottom Controls */}
      <div
        style={{
          padding: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          backgroundColor: '#0f172a',
          zIndex: 10,
        }}
      >
        {/* Upload / Gallery Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          style={{
            background: 'none',
            border: 'none',
            color: '#cbd5e1',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            cursor: 'pointer',
            gap: '4px',
          }}
        >
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ImageIcon size={22} color="#38bdf8" />
          </div>
          <span style={{ fontSize: '0.7rem' }}>ग्यालरी</span>
        </button>

        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          capture="environment"
          onChange={handleFileUpload}
          style={{ display: 'none' }}
        />

        {/* Shutter Capture Button */}
        <button
          type="button"
          onClick={capturePhoto}
          style={{
            width: '74px',
            height: '74px',
            borderRadius: '50%',
            backgroundColor: '#ffffff',
            border: '5px solid #0284c7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 0 25px rgba(2, 132, 199, 0.6)',
            transition: 'transform 0.1s ease',
          }}
          title="फोटो खिच्नुहोस्"
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: '#0284c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Camera size={26} color="#fff" />
          </div>
        </button>

        {/* Close Button / Cancel */}
        <button
          type="button"
          onClick={() => {
            stopCamera();
            onClose();
          }}
          style={{
            background: 'none',
            border: 'none',
            color: '#cbd5e1',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            cursor: 'pointer',
            gap: '4px',
          }}
        >
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={20} color="#f87171" />
          </div>
          <span style={{ fontSize: '0.7rem' }}>रद्द</span>
        </button>
      </div>
    </div>
  );
};
