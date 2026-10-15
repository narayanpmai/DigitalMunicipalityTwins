import React from 'react';
import { Heart, Baby, UserCheck, HandHeart } from 'lucide-react';

export const SocialDev: React.FC = () => (
  <div style={{ padding: '2rem' }}>
    <div style={{ marginBottom: '2rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#0d1f3c', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <HandHeart size={32} color="#e11d48" /> सामाजिक विकास
      </h1>
      <p style={{ color: '#64748b' }}>सामाजिक सुरक्षा, गरिबी न्यूनीकरण र सामुदायिक विकास कार्यक्रमहरू</p>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
      {[
        { label: 'सामाजिक सुरक्षा लाभार्थी', value: '१,२४०', color: '#e11d48', icon: <Heart size={28} color="#e11d48" /> },
        { label: 'बृद्ध भत्ता', value: '४२०', color: '#d97706', icon: <UserCheck size={28} color="#d97706" /> },
        { label: 'बाल विकास केन्द्र', value: '१४', color: '#0284c7', icon: <Baby size={28} color="#0284c7" /> },
        { label: 'छात्रवृत्ति प्राप्तकर्ता', value: '१५०', color: '#16a34a', icon: <HandHeart size={28} color="#16a34a" /> },
      ].map(s => (
        <div key={s.label} style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>{s.icon}</div>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, color: s.color, margin: '0 0 0.25rem 0' }}>{s.value}</h2>
          <p style={{ color: '#64748b', margin: 0, fontSize: '0.875rem' }}>{s.label}</p>
        </div>
      ))}
    </div>
    <div style={{ backgroundColor: '#ffffff', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
      <h4 style={{ color: '#0d1f3c', marginBottom: '1.5rem' }}>सामाजिक सुरक्षा भत्ताका प्रकारहरू</h4>
      {[
        { type: 'जेष्ठ नागरिक भत्ता (७० वर्ष+)', amount: 'रु. ४,०००/महिना' },
        { type: 'एकल महिला भत्ता', amount: 'रु. ३,०००/महिना' },
        { type: 'अपाङ्गता भत्ता', amount: 'रु. ३,०००/महिना' },
        { type: 'बाल पोषण भत्ता', amount: 'रु. ७००/महिना' },
      ].map(b => (
        <div key={b.type} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 1rem', backgroundColor: '#f8fafc', borderRadius: '8px', marginBottom: '0.75rem' }}>
          <span style={{ color: '#334155', fontWeight: 500 }}>{b.type}</span>
          <span style={{ color: '#16a34a', fontWeight: 700 }}>{b.amount}</span>
        </div>
      ))}
    </div>
  </div>
);
