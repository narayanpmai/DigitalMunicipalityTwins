import React from 'react';
import { Building2, Users, MapPin, Phone, Mail, Award, CheckCircle2 } from 'lucide-react';

export const AdminInfoPage: React.FC = () => {
  const officials = [
    { name: 'टासी लामा', role: 'अध्यक्ष', phone: '९८४१२३४५६७', email: 'chairman@panchpokhari.gov.np', isHead: true },
    { name: 'सुनिता अधिकारी', role: 'उपाध्यक्ष', phone: '९८४१२३४५६८', email: 'vicechair@panchpokhari.gov.np', isHead: false },
    { name: 'कृष्णबहादुर खत्री', role: 'प्रमुख प्रशासकीय अधिकृत', phone: '९८४१२३४५६९', email: 'cao@panchpokhari.gov.np', isHead: false },
  ];

  return (
    <div style={{ padding: '2rem', width: '100%', fontFamily: "'Outfit', 'Noto Sans Devanagari', sans-serif" }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Building2 size={32} color="var(--primary)" />
          प्रशासनिक अवस्था
        </h1>
        <p style={{ color: '#64748b', fontSize: '1rem' }}>गाउँपालिकाको प्रशासनिक विवरण तथा जनप्रतिनिधिहरूको जानकारी</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '1.5rem', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', borderTop: '4px solid #0284c7' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 800, color: '#0284c7', margin: '0 0 0.5rem 0' }}>८</h1>
          <h5 style={{ color: '#64748b', margin: 0, fontWeight: 500 }}>जम्मा वडाहरू</h5>
        </div>
        
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '1.5rem', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', borderTop: '4px solid #16a34a' }}>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#16a34a', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            थाङपालधाप
          </h1>
          <h5 style={{ color: '#64748b', margin: 0, fontWeight: 500 }}>गाउँपालिका केन्द्र</h5>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '1.5rem', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', borderTop: '4px solid #d97706' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 800, color: '#d97706', margin: '0 0 0.5rem 0' }}>२०७३</h1>
          <h5 style={{ color: '#64748b', margin: 0, fontWeight: 500 }}>स्थापना वर्ष</h5>
        </div>
      </div>

      <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Users size={24} color="var(--primary)" />
          <h4 style={{ margin: 0, fontWeight: 700, color: '#0f172a' }}>जनप्रतिनिधि विवरण</h4>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <div className="dt-responsive-table-wrapper">
<table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ backgroundColor: '#f8fafc' }}>
              <tr>
                <th style={{ padding: '1rem 1.5rem', color: '#475569', fontWeight: 600, fontSize: '0.9rem', borderBottom: '1px solid #e2e8f0' }}>नाम</th>
                <th style={{ padding: '1rem 1.5rem', color: '#475569', fontWeight: 600, fontSize: '0.9rem', borderBottom: '1px solid #e2e8f0' }}>पद</th>
                <th style={{ padding: '1rem 1.5rem', color: '#475569', fontWeight: 600, fontSize: '0.9rem', borderBottom: '1px solid #e2e8f0' }}>सम्पर्क नम्बर</th>
                <th style={{ padding: '1rem 1.5rem', color: '#475569', fontWeight: 600, fontSize: '0.9rem', borderBottom: '1px solid #e2e8f0' }}>इमेल</th>
              </tr>
            </thead>
            <tbody>
              {officials.map((official, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.2s' }}>
                  <td style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: official.isHead ? '#e0f2fe' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: official.isHead ? '#0284c7' : '#64748b' }}>
                      {official.isHead ? <Award size={20} /> : <CheckCircle2 size={20} />}
                    </div>
                    <span style={{ fontWeight: 600, color: '#0f172a' }}>{official.name}</span>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <span style={{ 
                      padding: '0.25rem 0.75rem', borderRadius: '50px', fontSize: '0.85rem', fontWeight: 600,
                      backgroundColor: official.isHead ? '#0ea5e9' : '#64748b', color: 'white'
                    }}>
                      {official.role}
                    </span>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem', color: '#475569' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Phone size={16} />
                      {official.phone}
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem', color: '#475569' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Mail size={16} />
                      {official.email}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
</div>
        </div>
      </div>
    </div>
  );
};
