import React from 'react';
import { Map, Mountain, Sunrise, LocateFixed } from 'lucide-react';

export const Geography: React.FC = () => {
  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#0d1f3c', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Map size={32} color="#16a34a" />
          भौगोलिक तथा प्राकृतिक अवस्था
        </h1>
        <p style={{ color: '#64748b' }}>पाँचपोखरी थाङपालको भौगोलिक बनोट र प्राकृतिक विशेषताहरू</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem', marginBottom: '2rem' }}>
        <div style={{ backgroundColor: '#ffffff', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: '#0d1f3c' }}>
            <Mountain size={24} color="#16a34a" />
            भौगोलिक बनोट
          </h4>
          <p style={{ color: '#334155', lineHeight: '1.8', fontSize: '1.05rem', marginBottom: '1.5rem' }}>
            पाँचपोखरी थाङपाल गाउँपालिका हिमाली र पहाडी भू-भागले भरिपूर्ण छ। यहाँको उचाई समुन्द्र सतहबाट करिब १,१०० मिटरदेखि ५,५०० मिटरसम्म रहेको छ। गाउँपालिकाको उत्तरमा मनोरम हिमश्रृंखलाहरू र दक्षिणमा पहाडी टारहरू पर्दछन्।
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', marginBottom: '0.25rem' }}>
                <Sunrise size={18} />
                <span>हावापानी</span>
              </div>
              <h5 style={{ margin: 0, fontWeight: 700, color: '#0f172a' }}>समशीतोष्ण र लेकाली</h5>
            </div>
            <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', marginBottom: '0.25rem' }}>
                <LocateFixed size={18} />
                <span>न्यूनतम उचाई</span>
              </div>
              <h5 style={{ margin: 0, fontWeight: 700, color: '#0f172a' }}>१,१०० मिटर</h5>
            </div>
            <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', marginBottom: '0.25rem' }}>
                <LocateFixed size={18} />
                <span>अधिकतम उचाई</span>
              </div>
              <h5 style={{ margin: 0, fontWeight: 700, color: '#0f172a' }}>५,५०० मिटर (हिमाल)</h5>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
