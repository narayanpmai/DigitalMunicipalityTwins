import React from 'react';
import { Briefcase, Factory, Users, TrendingUp } from 'lucide-react';

export const Enterprise: React.FC = () => (
  <div style={{ padding: '2rem' }}>
    <div style={{ marginBottom: '2rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#0d1f3c', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Briefcase size={32} color="#d97706" /> उद्यम तथा उद्योग
      </h1>
      <p style={{ color: '#64748b' }}>पालिकामा सञ्चालित साना तथा मझौला उद्यमहरूको विवरण</p>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
      {[
        { label: 'जम्मा उद्यम', value: '१३४', color: '#d97706', icon: <Factory size={28} color="#d97706" /> },
        { label: 'रोजगारी', value: '५२०+', color: '#0284c7', icon: <Users size={28} color="#0284c7" /> },
        { label: 'महिला उद्यमी', value: '४२%', color: '#e11d48', icon: <TrendingUp size={28} color="#e11d48" /> },
      ].map(s => (
        <div key={s.label} style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>{s.icon}</div>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, color: s.color, margin: '0 0 0.25rem 0' }}>{s.value}</h2>
          <p style={{ color: '#64748b', margin: 0 }}>{s.label}</p>
        </div>
      ))}
    </div>
    <div style={{ backgroundColor: '#ffffff', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
      <h4 style={{ color: '#0d1f3c', marginBottom: '1.5rem' }}>उद्यम वर्गीकरण</h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {[
          { type: 'खाद्य तथा पेय पदार्थ', count: 45 },
          { type: 'हस्तकला तथा कुटिर उद्योग', count: 38 },
          { type: 'होटल तथा आतिथ्य', count: 28 },
          { type: 'निर्माण सामग्री', count: 23 },
        ].map(u => (
          <div key={u.type} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 1rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
            <span style={{ color: '#334155', fontWeight: 500 }}>{u.type}</span>
            <span style={{ color: '#d97706', fontWeight: 700 }}>{u.count} वटा</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);
