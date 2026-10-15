import React from 'react';
import { Beef, Milk, Egg, TrendingUp } from 'lucide-react';

export const Livestock: React.FC = () => (
  <div style={{ padding: '2rem' }}>
    <div style={{ marginBottom: '2rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#0d1f3c', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Beef size={32} color="#d97706" /> पशुपन्छी तथा डेरी विकास
      </h1>
      <p style={{ color: '#64748b' }}>पालिकाको पशुपन्छी पालन, उत्पादन र बजारीकरणको अवस्था</p>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
      {[
        { label: 'गाई/भैंसी', value: '३,२५०', emoji: '🐄', color: '#d97706' },
        { label: 'भेडा/बाख्रा', value: '५,१२०', emoji: '🐑', color: '#16a34a' },
        { label: 'याक/चौंरी', value: '८७०', emoji: '🐂', color: '#0284c7' },
        { label: 'कुखुरा', value: '१२,४५०', emoji: '🐔', color: '#e11d48' },
      ].map(s => (
        <div key={s.label} style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', textAlign: 'center', borderTop: `4px solid ${s.color}` }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{s.emoji}</div>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, color: s.color, margin: 0 }}>{s.value}</h2>
          <p style={{ color: '#64748b', margin: 0 }}>{s.label}</p>
        </div>
      ))}
    </div>
    <div style={{ backgroundColor: '#ffffff', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
      <h4 style={{ color: '#0d1f3c', marginBottom: '1.5rem' }}>उत्पादन विवरण (वार्षिक)</h4>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        {[
          { label: 'दूध उत्पादन', value: '४.५ लाख लिटर', icon: <Milk size={24} color="#0284c7" /> },
          { label: 'अण्डा उत्पादन', value: '३.२ लाख थान', icon: <Egg size={24} color="#d97706" /> },
          { label: 'मासु उत्पादन', value: '१२ मे.टन', icon: <TrendingUp size={24} color="#16a34a" /> },
        ].map(p => (
          <div key={p.label} style={{ padding: '1.25rem', backgroundColor: '#f8fafc', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {p.icon}
            <div>
              <h5 style={{ margin: 0, fontWeight: 700, color: '#0f172a' }}>{p.value}</h5>
              <span style={{ color: '#64748b', fontSize: '0.875rem' }}>{p.label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);
