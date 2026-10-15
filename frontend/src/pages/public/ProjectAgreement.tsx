import React from 'react';
import { FileSignature, Calendar, Building, ArrowRight } from 'lucide-react';

export const ProjectAgreement: React.FC = () => (
  <div style={{ padding: '2rem' }}>
    <div style={{ marginBottom: '2rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#0d1f3c', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <FileSignature size={32} color="#0284c7" /> परियोजना सम्झौता विवरण
      </h1>
      <p style={{ color: '#64748b' }}>पालिकाले विभिन्न संस्थाहरूसँग गरेका विकास परियोजना सम्झौताहरूको विवरण</p>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {[
        { project: 'भोताङ-थाङपालधाप सडक स्तरोन्नति', contractor: 'हिमालय निर्माण सेवा', amount: 'रु. ४ करोड', date: '२०८०-०४-१५', status: 'जारी' },
        { project: 'पाँचपोखरी पर्यटन पूर्वाधार विकास', contractor: 'माउन्टेन डेभलपर्स', amount: 'रु. २.५ करोड', date: '२०८०-०२-२०', status: 'जारी' },
        { project: 'थाङपालधाप बहुउद्देश्यीय भवन निर्माण', contractor: 'राष्ट्रिय निर्माण कम्पनी', amount: 'रु. ३.२ करोड', date: '२०७९-०९-०५', status: 'सम्पन्न' },
        { project: 'खानेपानी आयोजना विस्तार (वडा ४,५)', contractor: 'जल आपूर्ति ठेकेदार', amount: 'रु. १.८ करोड', date: '२०८०-०६-०१', status: 'जारी' },
      ].map(a => (
        <div key={a.project} style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <h5 style={{ margin: 0, color: '#0f172a', fontWeight: 700 }}>{a.project}</h5>
            <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600, backgroundColor: a.status === 'सम्पन्न' ? '#dcfce7' : '#dbeafe', color: a.status === 'सम्पन्न' ? '#166534' : '#1d4ed8' }}>{a.status}</span>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', color: '#64748b', fontSize: '0.875rem' }}>
            <span><Building size={14} style={{ display: 'inline', marginRight: '4px' }} />{a.contractor}</span>
            <span><ArrowRight size={14} style={{ display: 'inline', marginRight: '4px' }} />{a.amount}</span>
            <span><Calendar size={14} style={{ display: 'inline', marginRight: '4px' }} />सम्झौता: {a.date}</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);
