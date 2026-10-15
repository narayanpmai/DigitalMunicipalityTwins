import React from 'react';
import { Star, Award, ThumbsUp, Lightbulb } from 'lucide-react';

export const GoodPractices: React.FC = () => (
  <div style={{ padding: '2rem' }}>
    <div style={{ marginBottom: '2rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#0d1f3c', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Award size={32} color="#d97706" /> असल अभ्यासहरू
      </h1>
      <p style={{ color: '#64748b' }}>पालिकाले अवलम्बन गरेका उत्कृष्ट र अनुकरणीय अभ्यासहरू</p>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {[
        {
          title: 'डिजिटल ट्विन प्रणाली',
          category: 'प्रविधि',
          desc: 'नेपालमै पहिलोपटक GIS आधारित म्युनिसिपल डिजिटल ट्विन प्रणाली लागू गरी नागरिकलाई रियल-टाइम तथ्याङ्क उपलब्ध गराइयो।',
          award: 'राष्ट्रिय उत्कृष्ट पालिका पुरस्कार २०७९',
          color: '#0284c7',
        },
        {
          title: 'पाँचपोखरी संरक्षण अभियान',
          category: 'वातावरण',
          desc: 'समुदाय सहभागितामा हिमाली सिमसार क्षेत्रको संरक्षण गरी पर्यावरणीय पर्यटनको विकास गरिएको।',
          award: 'हरित पालिका पुरस्कार २०८०',
          color: '#16a34a',
        },
        {
          title: '१००% खोप अभियान',
          category: 'स्वास्थ्य',
          desc: 'सम्पूर्ण वडामा स्वयंसेवकहरू परिचालन गरी दुर्गम क्षेत्रमा पनि खोप पुर्याउन सफलता हासिल।',
          award: 'स्वास्थ्य उत्कृष्टता पुरस्कार २०८०',
          color: '#e11d48',
        },
      ].map(p => (
        <div key={p.title} style={{ backgroundColor: '#ffffff', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', borderLeft: `5px solid ${p.color}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <h4 style={{ margin: 0, color: '#0f172a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Lightbulb size={20} color={p.color} /> {p.title}
            </h4>
            <span style={{ padding: '4px 12px', backgroundColor: `${p.color}20`, color: p.color, borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>{p.category}</span>
          </div>
          <p style={{ color: '#334155', lineHeight: '1.7', margin: '0 0 1rem 0' }}>{p.desc}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#d97706' }}>
            <Star size={16} fill="#d97706" />
            <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{p.award}</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);
