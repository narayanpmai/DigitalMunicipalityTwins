import React from 'react';
import { GraduationCap, Users, BookOpen, Award } from 'lucide-react';

export const MTED: React.FC = () => (
  <div style={{ padding: '2rem' }}>
    <div style={{ marginBottom: '2rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#0d1f3c', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <GraduationCap size={32} color="#0284c7" /> मदन भण्डारी प्राविधिक शिक्षा (MTED)
      </h1>
      <p style={{ color: '#64748b' }}>प्राविधिक तथा व्यावसायिक सीप विकास कार्यक्रमहरूको विवरण</p>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
      {[
        { label: 'प्रशिक्षण कार्यक्रम', value: '१२', color: '#0284c7' },
        { label: 'लाभान्वित युवा', value: '३४५', color: '#16a34a' },
        { label: 'सफल उद्यमी', value: '१२०', color: '#d97706' },
        { label: 'महिला सहभागिता', value: '५५%', color: '#e11d48' },
      ].map(s => (
        <div key={s.label} style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', textAlign: 'center', borderTop: `4px solid ${s.color}` }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 700, color: s.color, margin: '0 0 0.5rem 0' }}>{s.value}</h2>
          <p style={{ color: '#64748b', margin: 0 }}>{s.label}</p>
        </div>
      ))}
    </div>
    <div style={{ backgroundColor: '#ffffff', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
      <h4 style={{ color: '#0d1f3c', marginBottom: '1.5rem' }}>प्रमुख प्रशिक्षण कार्यक्रमहरू</h4>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
        {['कम्प्युटर तथा IT सीप', 'पर्यटन तथा होटल व्यवस्थापन', 'खाद्य प्रशोधन तथा पकाउने कला', 'भवन निर्माण तथा प्लम्बिङ', 'कृषि व्यवसाय व्यवस्थापन', 'हस्तकला तथा बुनाई'].map(c => (
          <div key={c} style={{ padding: '1rem', backgroundColor: '#eff6ff', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <BookOpen size={18} color="#0284c7" />
            <span style={{ color: '#1e40af', fontWeight: 500 }}>{c}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);
