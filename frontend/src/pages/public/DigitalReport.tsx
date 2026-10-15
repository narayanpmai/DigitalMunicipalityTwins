import React from 'react';
import { BarChart3, PieChart, TrendingUp, FileDown } from 'lucide-react';

export const DigitalReport: React.FC = () => (
  <div style={{ padding: '2rem' }}>
    <div style={{ marginBottom: '2rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#0d1f3c', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <BarChart3 size={32} color="#0284c7" /> डिजिटल प्रतिवेदन
      </h1>
      <p style={{ color: '#64748b' }}>सूचना प्रविधि तथा डिजिटल रूपान्तरण सम्बन्धी तथ्याङ्क र प्रतिवेदनहरू</p>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
      {[
        { title: 'ICT अवस्था प्रतिवेदन २०८०', icon: <PieChart size={24} color="#0284c7" />, year: '२०८०', size: '2.1 MB' },
        { title: 'डिजिटल सेवा उपभोग रिपोर्ट', icon: <TrendingUp size={24} color="#16a34a" />, year: '२०७९', size: '1.8 MB' },
        { title: 'नेटवर्क कनेक्टिभिटी अध्ययन', icon: <BarChart3 size={24} color="#d97706" />, year: '२०७८', size: '3.2 MB' },
      ].map(r => (
        <div key={r.title} style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            {r.icon}
            <h5 style={{ margin: 0, fontWeight: 600, color: '#0f172a', fontSize: '0.95rem' }}>{r.title}</h5>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#64748b', fontSize: '0.875rem' }}>आ.व. {r.year} • PDF {r.size}</span>
            <button style={{ backgroundColor: '#0284c7', color: 'white', border: 'none', padding: '0.4rem 0.75rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem' }}>
              <FileDown size={14} /> डाउनलोड
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
);
