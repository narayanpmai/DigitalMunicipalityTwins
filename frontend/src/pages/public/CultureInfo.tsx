import React from 'react';
import { Music, Palette, Calendar, Heart } from 'lucide-react';

export const CultureInfo: React.FC = () => (
  <div style={{ padding: '2rem' }}>
    <div style={{ marginBottom: '2rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#0d1f3c', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Palette size={32} color="#7c3aed" /> संस्कृति, धर्म तथा परम्परा
      </h1>
      <p style={{ color: '#64748b' }}>पाँचपोखरी थाङपालको विविध सांस्कृतिक सम्पदा र परम्पराहरू</p>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
      {[
        { title: 'प्रमुख जातजाति', items: ['तामाङ', 'शेर्पा', 'नेवार', 'ब्राह्मण', 'क्षेत्री'], color: '#7c3aed' },
        { title: 'प्रमुख भाषाहरू', items: ['तामाङ', 'नेपाली', 'शेर्पा', 'नेवारी'], color: '#0284c7' },
        { title: 'धर्म', items: ['हिन्दू', 'बौद्ध', 'किराँत'], color: '#d97706' },
      ].map(c => (
        <div key={c.title} style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', borderTop: `4px solid ${c.color}` }}>
          <h5 style={{ color: c.color, marginBottom: '1rem', fontWeight: 700 }}>{c.title}</h5>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {c.items.map(item => (
              <li key={item} style={{ padding: '0.4rem 0', borderBottom: '1px solid #f1f5f9', color: '#334155', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Heart size={14} color={c.color} /> {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
    <div style={{ backgroundColor: '#ffffff', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
      <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0d1f3c', marginBottom: '1.5rem' }}>
        <Calendar size={24} color="#7c3aed" /> प्रमुख पर्वहरू
      </h4>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        {['पाँचपोखरी मेला (जनैपूर्णिमा)', 'तामाङ लोसार', 'ल्होसार', 'देउसी-भैलो', 'इन्द्रजात्रा'].map(f => (
          <div key={f} style={{ padding: '0.75rem 1rem', backgroundColor: '#f5f3ff', borderRadius: '8px', color: '#4c1d95', fontWeight: 500, fontSize: '0.9rem' }}>
            🎉 {f}
          </div>
        ))}
      </div>
    </div>
  </div>
);
