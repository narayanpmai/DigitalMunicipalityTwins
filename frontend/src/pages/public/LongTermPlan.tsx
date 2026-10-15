import React from 'react';
import { Target, Calendar, CheckCircle2, Clock } from 'lucide-react';

export const LongTermPlan: React.FC = () => (
  <div style={{ padding: '2rem' }}>
    <div style={{ marginBottom: '2rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#0d1f3c', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Target size={32} color="#0284c7" /> दीर्घकालीन योजना (२०७५–२०९०)
      </h1>
      <p style={{ color: '#64748b' }}>पाँचपोखरी थाङपालको १५ वर्षे दिर्घकालीन विकास योजना</p>
    </div>
    <div style={{ backgroundColor: '#ffffff', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginBottom: '2rem' }}>
      <h4 style={{ color: '#0d1f3c', marginBottom: '1.5rem' }}>दृष्टिकोण (Vision)</h4>
      <p style={{ color: '#334155', lineHeight: '1.8', fontSize: '1.05rem', fontStyle: 'italic', borderLeft: '4px solid #0284c7', paddingLeft: '1rem' }}>
        "सम्पन्न, हरित, र समावेशी पाँचपोखरी थाङपाल – जहाँ प्रत्येक नागरिकको जीवनस्तर उच्च र प्राकृतिक सम्पदा सुरक्षित छ।"
      </p>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {[
        { phase: 'प्रथम चरण (२०७५-२०८०)', status: 'completed', goals: ['आधारभूत पूर्वाधार विकास', 'डिजिटल प्रणाली स्थापना', 'स्वास्थ्य सेवा विस्तार'] },
        { phase: 'द्वितीय चरण (२०८०-२०८५)', status: 'ongoing', goals: ['पर्यटन विकास', 'कृषि आधुनिकीकरण', 'शिक्षामा ICT'] },
        { phase: 'तृतीय चरण (२०८५-२०९०)', status: 'upcoming', goals: ['हरित अर्थतन्त्र', 'पूर्ण डिजिटल पालिका', 'स्वावलम्बी आर्थिक विकास'] },
      ].map(ph => (
        <div key={ph.phase} style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', borderLeft: `5px solid ${ph.status === 'completed' ? '#16a34a' : ph.status === 'ongoing' ? '#0284c7' : '#94a3b8'}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h5 style={{ margin: 0, fontWeight: 700, color: '#0f172a' }}>{ph.phase}</h5>
            <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600, backgroundColor: ph.status === 'completed' ? '#dcfce7' : ph.status === 'ongoing' ? '#dbeafe' : '#f1f5f9', color: ph.status === 'completed' ? '#166534' : ph.status === 'ongoing' ? '#1d4ed8' : '#475569' }}>
              {ph.status === 'completed' ? '✓ सम्पन्न' : ph.status === 'ongoing' ? '⚡ जारी' : '⏳ आगामी'}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {ph.goals.map(g => (
              <span key={g} style={{ padding: '4px 12px', backgroundColor: '#f8fafc', borderRadius: '6px', color: '#334155', fontSize: '0.875rem', border: '1px solid #e2e8f0' }}>{g}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);
