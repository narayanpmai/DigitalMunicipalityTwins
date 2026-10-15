import React from 'react';
import { Compass, Target, Flag, ArrowRight } from 'lucide-react';

export const StrategicPriorities: React.FC = () => (
  <div style={{ padding: '2rem' }}>
    <div style={{ marginBottom: '2rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#0d1f3c', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Compass size={32} color="#0284c7" /> रणनीतिक प्राथमिकताहरू
      </h1>
      <p style={{ color: '#64748b' }}>पालिकाको प्रमुख रणनीतिक लक्ष्य र विकासका प्राथमिकता क्षेत्रहरू</p>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
      {[
        {
          priority: '१. पूर्वाधार विकास',
          color: '#0284c7',
          items: ['सबै वडामा कालोपत्रे सडक','पिउने पानी आयोजना विस्तार','विद्युत् आपूर्ति सुनिश्चितता'],
        },
        {
          priority: '२. आर्थिक समृद्धि',
          color: '#16a34a',
          items: ['कृषि व्यापारीकरण','पर्यटन उद्योग विकास','युवा उद्यमशीलता प्रवर्द्धन'],
        },
        {
          priority: '३. सामाजिक न्याय',
          color: '#e11d48',
          items: ['महिला सशक्तिकरण','दलित तथा अल्पसंख्यक समावेश','अपाङ्गमैत्री सेवाहरू'],
        },
        {
          priority: '४. वातावरण संरक्षण',
          color: '#16a34a',
          items: ['पाँचपोखरी सिमसार संरक्षण','वन क्षेत्र विस्तार','जलवायु अनुकूलन योजना'],
        },
        {
          priority: '५. सुशासन',
          color: '#7c3aed',
          items: ['डिजिटल सेवा विस्तार','पारदर्शी बजेट व्यवस्थापन','नागरिक सहभागिता'],
        },
      ].map(p => (
        <div key={p.priority} style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', borderTop: `4px solid ${p.color}` }}>
          <h5 style={{ color: p.color, fontWeight: 700, marginBottom: '1rem' }}>{p.priority}</h5>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {p.items.map(item => (
              <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0', color: '#334155', borderBottom: '1px solid #f1f5f9' }}>
                <ArrowRight size={16} color={p.color} /> {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  </div>
);
