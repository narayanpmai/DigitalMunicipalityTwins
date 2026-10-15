import React from 'react';
import { Wifi, Monitor, Smartphone, Globe } from 'lucide-react';

export const DigitalGovernance: React.FC = () => (
  <div style={{ padding: '2rem' }}>
    <div style={{ marginBottom: '2rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#0d1f3c', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Globe size={32} color="#0284c7" /> डिजिटल सुशासन
      </h1>
      <p style={{ color: '#64748b' }}>प्रविधिमार्फत सुशासन: पाँचपोखरी थाङपालको डिजिटल रूपान्तरण यात्रा</p>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
      {[
        { icon: <Monitor size={32} color="#0284c7" />, label: 'डिजिटल सेवा केन्द्र', value: '३', color: '#0284c7' },
        { icon: <Wifi size={32} color="#16a34a" />, label: 'इन्टरनेट जडान (वडा)', value: '८/८', color: '#16a34a' },
        { icon: <Smartphone size={32} color="#d97706" />, label: 'मोबाइल एप प्रयोगकर्ता', value: '२,४५०+', color: '#d97706' },
      ].map(s => (
        <div key={s.label} style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>{s.icon}</div>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, color: s.color, margin: 0 }}>{s.value}</h2>
          <p style={{ color: '#64748b', margin: 0 }}>{s.label}</p>
        </div>
      ))}
    </div>
    <div style={{ backgroundColor: '#ffffff', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
      <h4 style={{ color: '#0d1f3c', marginBottom: '1.5rem' }}>डिजिटल पहलहरू</h4>
      {[
        { title: 'म्युनिसिपल डिजिटल ट्विन', desc: 'GIS आधारित भू-सूचना प्रणाली तथा रियल-टाइम डाटा ड्यासबोर्ड' },
        { title: 'अनलाइन सेवा पोर्टल', desc: 'घरबाटै सरकारी सेवाको लागि अनलाइन आवेदन र स्थिति जाँच' },
        { title: 'नागरिक सूचना प्रणाली', desc: 'SMS र मोबाइल एपमार्फत नागरिकहरूलाई सूचना पठाउने व्यवस्था' },
      ].map((p, i) => (
        <div key={i} style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', marginBottom: '1rem', borderLeft: '4px solid #0284c7' }}>
          <h6 style={{ fontWeight: 700, margin: '0 0 0.25rem 0', color: '#0f172a' }}>{p.title}</h6>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>{p.desc}</p>
        </div>
      ))}
    </div>
  </div>
);
