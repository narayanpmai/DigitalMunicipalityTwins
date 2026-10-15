import React from 'react';
import { Building2, Info, Map, CheckCircle2, Phone, MapPin, Users, PhoneCall, Mail, Plus } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTenant } from '../../context/TenantContext';
import { useQuery } from '@tanstack/react-query';
import { municipalityApi } from '../../api/municipality';
import { representativesApi } from '../../api/representatives';

export const Profile: React.FC = () => {
  const { settings } = useTenant();
  const palikaName = settings?.palika_name || 'हाम्रो गाउँपालिका/नगरपालिका';
  const district = settings?.district || '';
  const province = settings?.province || '';
  const totalWards = settings?.total_wards || 8;
  const hq = settings?.headquarters || '';
  const location = useLocation();
  const navigate = useNavigate();
  const isAdmin = location.pathname.startsWith('/app');

  const { data: wards = [], isLoading } = useQuery({
    queryKey: ['wards-profile'],
    queryFn: () => municipalityApi.getWards(),
  });

  const { data: representatives = [] } = useQuery({
    queryKey: ['representatives', 'current'],
    queryFn: () => representativesApi.getAll({ isCurrent: true }),
  });

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', padding: '1.5rem 0.5rem' }}>
      <div style={{ width: '100%', maxWidth: '100%', margin: '0' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ display: 'inline-flex', justifyContent: 'center', padding: '1rem', backgroundColor: '#e0f2fe', borderRadius: '50%', marginBottom: '1rem' }}>
            <Building2 size={40} color="#0284c7" />
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem' }}>
            पालिका परिचय
          </h1>
          <p style={{ color: '#64748b', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
            {palikaName}को ऐतिहासिक, प्रशासनिक विवरण तथा वडा कार्यालयहरूको सम्पर्क सूची
          </p>
        </div>

        {/* 1. Introduction Section */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
          
          <div style={{ backgroundColor: '#ffffff', padding: '2.5rem', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', color: '#0f172a', fontSize: '1.25rem', fontWeight: 700 }}>
              <Info size={24} color="#0284c7" />
              संक्षिप्त चिनारी
            </h4>
            <p style={{ color: '#475569', lineHeight: '1.8', fontSize: '1.05rem', margin: '0 0 2rem' }}>
              {palikaName} {province}को {district} जिल्लामा अवस्थित एक सुन्दर र विकासोन्मुख पालिका हो। प्राकृतिक, सांस्कृतिक र पर्यटकीय सम्भावना बोकेको यस पालिकाले नागरिकको सेवा र समृद्धिलाई मुख्य प्राथमिकतामा राखेको छ।
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
              <div style={{ padding: '1.25rem', backgroundColor: '#f8fafc', borderRadius: '12px', borderLeft: '4px solid #10b981' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                  <MapPin size={14} /> केन्द्र
                </div>
                <h4 style={{ margin: 0, color: '#0f172a', fontSize: '1.1rem' }}>{hq || 'तोकिएको छैन'}</h4>
              </div>
              <div style={{ padding: '1.25rem', backgroundColor: '#f8fafc', borderRadius: '12px', borderLeft: '4px solid #0284c7' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                  <Map size={14} /> वडा संख्या
                </div>
                <h4 style={{ margin: 0, color: '#0f172a', fontSize: '1.1rem' }}>{totalWards} वटा</h4>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: '#ffffff', padding: '2.5rem', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', color: '#0f172a', fontSize: '1.25rem', fontWeight: 700 }}>
              <Map size={24} color="#ef4444" />
              भौगोलिक सिमाना
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { label: 'पूर्व', desc: 'समीपवर्ती पालिका/जिल्ला' },
                { label: 'पश्चिम', desc: 'समीपवर्ती पालिका/जिल्ला' },
                { label: 'उत्तर', desc: 'समीपवर्ती पालिका/जिल्ला' },
                { label: 'दक्षिण', desc: 'समीपवर्ती पालिका/जिल्ला' },
              ].map((boundary, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem', backgroundColor: '#f8fafc', borderRadius: '12px', transition: 'all 0.2s' }}>
                  <CheckCircle2 size={20} color="#0284c7" />
                  <div>
                    <strong style={{ color: '#0f172a', marginRight: '0.5rem' }}>{boundary.label}:</strong> 
                    <span style={{ color: '#64748b' }}>{boundary.desc}</span>
                  </div>
                </li>
              ))}
            </ul>
            <div style={{ marginTop: '1.5rem', fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic', textAlign: 'center' }}>
              (नोट: वास्तविक सिमाना विवरण पालिकाको आधिकारिक दस्ताबेजमा आधारित हुन्छ।)
            </div>
          </div>
        </div>

        {/* 360 Degree View Section */}
        {Boolean(settings?.panoramaUrl) && (
          <div style={{ marginBottom: '3rem', backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Map size={24} color="#0284c7" />
              प्रशासकीय भवन (360° View)
            </h2>
            <div style={{ width: '100%', height: '400px', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#e2e8f0' }}>
              <iframe 
                width="100%" 
                height="100%" 
                frameBorder="0" 
                allow="xr-spatial-tracking; gyroscope; accelerometer" 
                allowFullScreen 
                scrolling="no" 
                src={String(settings?.panoramaUrl || '')}
                title="360 Degree View"
              ></iframe>
            </div>
          </div>
        )}

        {/* Representatives Section (Elected Representatives List) */}
        <div style={{ marginBottom: '4rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem' }}>
                जनप्रतिनिधि विवरण
              </h2>
              <div style={{ width: '60px', height: '4px', backgroundColor: '#0284c7', margin: '0 auto' }}></div>
            </div>
            {isAdmin && (
              <button onClick={() => navigate('/representatives')} style={{ backgroundColor: '#0284c7', color: 'white', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, boxShadow: '0 4px 6px rgba(2, 132, 199, 0.2)' }}>
                <Plus size={18} /> नयाँ प्रतिनिधि थप्नुहोस्
              </button>
            )}
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '2rem' }}>
            {representatives.filter(rep => !rep.wardNo).map(rep => (
              <div key={rep.id} style={{ backgroundColor: '#fff', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05), 0 4px 6px -2px rgba(0,0,0,0.02)', transition: 'transform 0.3s, box-shadow 0.3s', cursor: 'pointer' }}
                   onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)'; }}
                   onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.05), 0 4px 6px -2px rgba(0,0,0,0.02)'; }}>
                <div style={{ height: '80px', backgroundColor: '#f1f5f9', position: 'relative' }}>
                  <div style={{ width: '100px', height: '100px', borderRadius: '50%', border: '4px solid #fff', backgroundColor: '#e0f2fe', position: 'absolute', bottom: '-50px', left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    {rep.photoUrl ? <img src={rep.photoUrl} alt={rep.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Users size={40} color="#0284c7" />}
                  </div>
                </div>
                <div style={{ padding: '4rem 1.5rem 1.5rem', textAlign: 'center' }}>
                  <h3 style={{ margin: '0 0 0.25rem', fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>{rep.name}</h3>
                  <div style={{ color: '#0284c7', fontWeight: 600, fontSize: '0.9rem', marginBottom: '1rem' }}>{rep.designation}</div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                    {rep.phone && (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.9rem' }}>
                        <Phone size={14} /> <span>{rep.phone}</span>
                      </div>
                    )}
                    {rep.email && (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.9rem' }}>
                        <Mail size={14} /> <span>{rep.email}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {representatives.filter(rep => !rep.wardNo).length === 0 && (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', backgroundColor: '#f8fafc', borderRadius: '12px', color: '#64748b', fontStyle: 'italic' }}>
                कुनै पनि जनप्रतिनिधिको विवरण उपलब्ध छैन।
              </div>
            )}
          </div>
        </div>

        {/* 2. Ward Profiles Grid (Like list-all-ward) */}
        <div style={{ marginBottom: '4rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem' }}>
                वडा प्रोफाइल
              </h2>
              <div style={{ width: '60px', height: '4px', backgroundColor: '#10b981', margin: '0 auto' }}></div>
              <p style={{ color: '#64748b', marginTop: '1rem' }}>पालिकाका सबै वडाहरूको संक्षिप्त विवरण</p>
            </div>
            {isAdmin && (
              <button onClick={() => navigate('/profile?tab=wards')} style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, boxShadow: '0 4px 6px rgba(16, 185, 129, 0.2)' }}>
                <Plus size={18} /> नयाँ वडा थप्नुहोस्
              </button>
            )}
          </div>

          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>वडा विवरण लोड हुँदैछ...</div>
          ) : wards.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
              {wards.map((ward: any) => (
                <div key={ward.wardNo} style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ backgroundColor: '#0284c7', color: '#ffffff', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Building2 size={20} /> वडा नं. {ward.wardNo}
                    </h3>
                  </div>
                  <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', flex: 1 }}>
                    
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                      <div style={{ padding: '0.5rem', backgroundColor: '#f1f5f9', borderRadius: '8px', color: '#475569' }}>
                        <Users size={20} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.2rem' }}>वडा अध्यक्ष</div>
                        <div style={{ color: '#0f172a', fontWeight: 600, fontSize: '1.1rem' }}>{ward.chairperson || 'विवरण उपलब्ध छैन'}</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                      <div style={{ padding: '0.5rem', backgroundColor: '#f1f5f9', borderRadius: '8px', color: '#475569' }}>
                        <MapPin size={20} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.2rem' }}>कार्यालय स्थान</div>
                        <div style={{ color: '#0f172a', fontWeight: 500 }}>{ward.officeLocation || 'विवरण उपलब्ध छैन'}</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                      <div style={{ padding: '0.5rem', backgroundColor: '#f1f5f9', borderRadius: '8px', color: '#475569' }}>
                        <Phone size={20} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.2rem' }}>सम्पर्क नम्बर</div>
                        <div style={{ color: '#0f172a', fontWeight: 500 }}>{ward.phone || 'विवरण उपलब्ध छैन'}</div>
                      </div>
                    </div>
                    
                  </div>
                  <div style={{ padding: '1rem 1.5rem', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
                    <a href={`/facilities/ward/${ward.id}`} style={{ display: 'inline-block', color: '#0284c7', fontWeight: 600, textDecoration: 'none', padding: '0.5rem 1rem', borderRadius: '6px', transition: 'background-color 0.2s' }}
                       onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e0f2fe'}
                       onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                      थप विवरण हेर्नुहोस् &rarr;
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '4rem', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
              <Info size={40} color="#94a3b8" style={{ margin: '0 auto 1rem' }} />
              <div style={{ fontSize: '1.1rem', color: '#475569', fontWeight: 500 }}>वडा विवरणहरू अपडेट हुन बाँकी छ।</div>
              <div style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.5rem' }}>एडमिन प्यानलबाट वडा प्रोफाइल थपेपछि यहाँ देखिनेछन्।</div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Profile;
