import React from 'react';
import { Store, FileText, CheckCircle, Clock } from 'lucide-react';

export const BusinessRegistration: React.FC = () => (
  <div style={{ padding: '2rem' }}>
    <div style={{ marginBottom: '2rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#0d1f3c', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Store size={32} color="#16a34a" /> व्यापार दर्ता तथा नवीकरण
      </h1>
      <p style={{ color: '#64748b' }}>गाउँपालिका क्षेत्रभित्रका व्यावसायिक प्रतिष्ठानहरूको दर्ता र नवीकरण विवरण</p>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
      {[
        { label: 'दर्ता भएका व्यवसाय', value: '३४५', color: '#0284c7', icon: <Store size={28} color="#0284c7" /> },
        { label: 'यस वर्ष नवीकरण', value: '२१२', color: '#16a34a', icon: <CheckCircle size={28} color="#16a34a" /> },
        { label: 'म्याद नाघेका', value: '१३', color: '#dc2626', icon: <Clock size={28} color="#dc2626" /> },
      ].map(s => (
        <div key={s.label} style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>{s.icon}</div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 700, color: s.color, margin: 0 }}>{s.value}</h2>
          <p style={{ color: '#64748b', margin: 0 }}>{s.label}</p>
        </div>
      ))}
    </div>
    <div style={{ backgroundColor: '#f0fdf4', padding: '1.5rem', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
      <h5 style={{ color: '#166534', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 0.5rem 0' }}>
        <FileText size={20} /> व्यापार दर्ताको लागि आवश्यक कागजातहरू
      </h5>
      <ul style={{ color: '#166534', margin: 0, paddingLeft: '1.5rem' }}>
        <li>नागरिकता प्रमाणपत्रको प्रतिलिपि</li>
        <li>घर-जग्गा सम्बन्धी कागजात</li>
        <li>व्यवसाय सञ्चालन हुने स्थानको नक्शा</li>
        <li>पासपोर्ट साइजको फोटो</li>
      </ul>
    </div>
  </div>
);
