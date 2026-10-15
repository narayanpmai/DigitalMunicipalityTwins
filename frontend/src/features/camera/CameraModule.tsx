import React from 'react';
import { Camera, RefreshCw, Info, Video, Wifi, WifiOff, Send, Maximize, MapPin } from 'lucide-react';

export const CameraModule: React.FC = () => {
  return (
    <div style={{ padding: '2rem', width: '100%', fontFamily: "'Outfit', 'Noto Sans Devanagari', sans-serif" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#0f172a', margin: 0 }}>
          <Video size={32} color="var(--primary)" />
          लाइभ क्यामेरा सर्भिलेन्स (Live Camera Surveillance)
        </h2>
        <button className="dt-btn dt-btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '50px' }}>
          <RefreshCw size={16} />
          <span>रिफ्रेस (Refresh)</span>
        </button>
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', gap: '1rem',
        backgroundColor: '#fffbeb', borderLeft: '5px solid #d97706',
        padding: '1rem 1.5rem', borderRadius: '12px', marginBottom: '2rem',
        boxShadow: '0 4px 6px rgba(0,0,0,0.02)'
      }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#fde68a', color: '#b45309',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
        }}>
          <Info size={20} />
        </div>
        <div style={{ flex: 1 }}>
          <h6 style={{ fontWeight: 700, color: '#0f172a', margin: '0 0 0.25rem 0', fontSize: '1.05rem' }}>सिमुलेसन तथा डेमो मोड (Live RTSP क्यामेरा जडान बाँकी)</h6>
          <p style={{ margin: 0, color: '#475569', fontSize: '0.9rem' }}>
            पालिकाका विभिन्न स्थानमा भौतिक IP/RTSP क्यामेरा वा ड्रोन गेटवे कन्फिगर भएपछि स्वचालित रूपमा प्रत्यक्ष भिडिओ प्रसारण हुनेछ।
          </p>
        </div>
        <span style={{ backgroundColor: '#f59e0b', color: '#fff', padding: '0.4rem 1rem', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 700 }}>
          Demo Mode
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {[
          { icon: <Camera size={36} color="var(--primary)" />, count: '१२', label: 'जम्मा CCTV' },
          { icon: <Wifi size={36} color="#16a34a" />, count: '१०', label: 'सक्रिय (Online)' },
          { icon: <WifiOff size={36} color="#dc2626" />, count: '२', label: 'निष्क्रिय (Offline)' },
          { icon: <Send size={36} color="#0284c7" style={{ transform: 'rotate(-45deg)' }} />, count: '१', label: 'सक्रिय ड्रोन (Drone)' },
        ].map((stat, idx) => (
          <div key={idx} style={{
            backgroundColor: '#ffffff', borderRadius: '16px', padding: '1.5rem',
            textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.03)'
          }}>
            <div style={{ marginBottom: '1rem' }}>{stat.icon}</div>
            <h3 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem 0' }}>{stat.count}</h3>
            <p style={{ color: '#64748b', margin: 0, fontSize: '0.9rem', fontWeight: 500 }}>{stat.label}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {[
          { title: 'गाउँपालिका चोक (CCTV-1)', location: 'थाङपालधाप' },
          { title: 'पर्यटक सूचना केन्द्र (CCTV-2)', location: 'भोताङ' }
        ].map((cam, idx) => (
          <div key={idx} style={{
            backgroundColor: '#ffffff', borderRadius: '16px', overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
          }}>
            <div style={{
              height: '350px', backgroundColor: '#0f172a', position: 'relative',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
            }}>
              <div style={{
                position: 'absolute', top: '1rem', left: '1rem',
                backgroundColor: '#dc2626', color: 'white', padding: '0.3rem 0.8rem',
                borderRadius: '50px', fontSize: '0.8rem', fontWeight: 700,
                display: 'flex', alignItems: 'center', gap: '0.4rem'
              }}>
                <div style={{ width: '8px', height: '8px', backgroundColor: '#fff', borderRadius: '50%', animation: 'pulse 1.5s infinite' }} />
                LIVE
              </div>
              <Camera size={64} color="#334155" style={{ marginBottom: '1rem' }} />
              <p style={{ color: '#64748b', fontSize: '1rem' }}>लाइभ भिडिओ फिड प्राप्त हुँदै...</p>
            </div>
            <div style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h5 style={{ margin: '0 0 0.25rem 0', fontWeight: 700, fontSize: '1.1rem', color: '#0f172a' }}>{cam.title}</h5>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <MapPin size={14} />
                  {cam.location}
                </p>
              </div>
              <button style={{
                border: 'none', background: '#f1f5f9', color: '#475569',
                width: '40px', height: '40px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
              }}>
                <Maximize size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.3; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};
