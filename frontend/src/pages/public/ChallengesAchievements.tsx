import React from 'react';
import { Trophy, TrendingUp, AlertCircle, Star } from 'lucide-react';

export const ChallengesAchievements: React.FC = () => (
  <div style={{ padding: '2rem' }}>
    <div style={{ marginBottom: '2rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#0d1f3c', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Trophy size={32} color="#d97706" /> चुनौती तथा उपलब्धिहरू
      </h1>
      <p style={{ color: '#64748b' }}>पालिकाले सामना गरेका प्रमुख चुनौती र हासिल उपलब्धिहरूको विवरण</p>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
      <div style={{ backgroundColor: '#ffffff', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#d97706', marginBottom: '1.5rem' }}>
          <Trophy size={22} /> प्रमुख उपलब्धिहरू
        </h4>
        {['पाँचपोखरी संरक्षण क्षेत्रको GIS म्यापिङ सम्पन्न','१००% खोप लक्ष्य हासिल','डिजिटल ट्विन प्रणाली सफलतापूर्वक लागू','विद्यालयहरूमा ICT ल्याब स्थापना'].map((a, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '1rem' }}>
            <Star size={18} color="#d97706" style={{ marginTop: '2px', flexShrink: 0 }} />
            <span style={{ color: '#334155' }}>{a}</span>
          </div>
        ))}
      </div>
      <div style={{ backgroundColor: '#ffffff', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#dc2626', marginBottom: '1.5rem' }}>
          <AlertCircle size={22} /> प्रमुख चुनौतीहरू
        </h4>
        {['दुर्गम क्षेत्रमा सडक पहुँचको अभाव','युवा जनशक्तिको वैदेशिक पलायन','हिमाली जलवायु परिवर्तनको प्रभाव','वित्तीय स्रोतको सीमितता'].map((c, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '1rem' }}>
            <TrendingUp size={18} color="#dc2626" style={{ marginTop: '2px', flexShrink: 0 }} />
            <span style={{ color: '#334155' }}>{c}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);
