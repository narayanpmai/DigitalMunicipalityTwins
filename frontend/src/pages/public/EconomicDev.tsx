import React from 'react';
import { TrendingUp, Banknote, Factory, BarChart2 } from 'lucide-react';

export const EconomicDev: React.FC = () => (
  <div style={{ padding: '2rem' }}>
    <div style={{ marginBottom: '2rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#0d1f3c', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <TrendingUp size={32} color="#16a34a" /> आर्थिक विकास
      </h1>
      <p style={{ color: '#64748b' }}>पालिकाको आर्थिक अवस्था, आम्दानी-खर्च र विकासका प्रमुख क्षेत्रहरू</p>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
      {[
        { label: 'वार्षिक बजेट', value: 'रु. ३२ करोड', color: '#0284c7', icon: <Banknote size={28} color="#0284c7" /> },
        { label: 'राजस्व संकलन', value: 'रु. ४.५ करोड', color: '#16a34a', icon: <TrendingUp size={28} color="#16a34a" /> },
        { label: 'पूँजीगत खर्च', value: '७२%', color: '#d97706', icon: <BarChart2 size={28} color="#d97706" /> },
        { label: 'उद्योग संख्या', value: '२३', color: '#7c3aed', icon: <Factory size={28} color="#7c3aed" /> },
      ].map(s => (
        <div key={s.label} style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>{s.icon}</div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: s.color, margin: '0 0 0.25rem 0' }}>{s.value}</h3>
          <p style={{ color: '#64748b', margin: 0, fontSize: '0.875rem' }}>{s.label}</p>
        </div>
      ))}
    </div>
    <div style={{ backgroundColor: '#ffffff', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
      <h4 style={{ color: '#0d1f3c', marginBottom: '1.5rem' }}>प्रमुख आर्थिक क्षेत्रहरू</h4>
      {[
        { name: 'कृषि तथा पशुपन्छी', pct: 72 },
        { name: 'पर्यटन तथा होटल व्यवसाय', pct: 15 },
        { name: 'व्यापार तथा सेवा', pct: 10 },
        { name: 'उद्योग', pct: 3 },
      ].map(s => (
        <div key={s.name} style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
            <span style={{ color: '#334155', fontWeight: 500 }}>{s.name}</span>
            <span style={{ color: '#0284c7', fontWeight: 700 }}>{s.pct}%</span>
          </div>
          <div style={{ height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px' }}>
            <div style={{ height: '100%', width: `${s.pct}%`, backgroundColor: '#0284c7', borderRadius: '4px', transition: 'width 0.5s ease' }} />
          </div>
        </div>
      ))}
    </div>
  </div>
);
