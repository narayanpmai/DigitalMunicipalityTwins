import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../api/client';
import { useTenant } from '../../context/TenantContext';
import { HardHat, Search, Mail, Phone, ExternalLink, MapPin, CheckCircle, Clock } from 'lucide-react';

interface EngineerProfile {
  id: string;
  fullName: string;
  licenseNo: string;
  consultancyName: string;
  specialization: string;
  contactPhone: string;
  email: string;
  photoUrl: string;
  status: string;
}

export const EngineersDirectoryPage: React.FC = () => {
  const tenantCtx = useTenant();
  const tenantSettings = tenantCtx?.settings;

  const { data: engineers, isLoading, isError } = useQuery<EngineerProfile[]>({
    queryKey: ['engineers'],
    queryFn: async () => {
      const data = await api.get<EngineerProfile[]>('/engineers');
      return data;
    },
  });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Dynamic Header based on TenantContext */}
      <header style={{ 
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', 
        padding: '3rem 2rem', 
        color: '#ffffff', 
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative background circles */}
        <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 70%)' }}></div>
        <div style={{ position: 'absolute', bottom: '-20%', right: '5%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0) 70%)' }}></div>
        
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', padding: '0.75rem', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '50%', marginBottom: '1.5rem', backdropFilter: 'blur(8px)' }}>
            <HardHat size={48} color="#e2e8f0" />
          </div>
          <h1 style={{ fontSize: '2.75rem', fontWeight: 800, margin: '0 0 1rem 0', letterSpacing: '-0.5px' }}>
            इजाजतप्राप्त इन्जिनियर/डिजाइनर रोस्टर
          </h1>
          <p style={{ fontSize: '1.25rem', color: '#94a3b8', margin: 0, lineHeight: 1.6 }}>
            {tenantSettings?.palika_name || 'स्थानीय तह'} मा भवन निर्माण तथा नक्सा पास (e-BPS) को लागि आधिकारिक रूपमा सूचीकृत इन्जिनियर तथा कन्सल्टेन्सीहरूको विवरण
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ width: '100%', padding: '3rem 2rem' }}>
        
        {/* Search & Filter Bar */}
        <div style={{ 
          display: 'flex', 
          gap: '1.5rem', 
          marginBottom: '3rem', 
          backgroundColor: '#ffffff', 
          padding: '1rem', 
          borderRadius: '16px', 
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          <div style={{ flex: '1 1 300px', position: 'relative' }}>
            <Search size={20} color="#94a3b8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="इन्जिनियरको नाम वा कन्सल्टेन्सी खोज्नुहोस्..." 
              style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', borderRadius: '12px', border: '1.5px solid #e2e8f0', fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s' }} 
            />
          </div>
          <div style={{ flex: '0 0 auto', display: 'flex', gap: '0.75rem' }}>
            <span style={{ padding: '0.5rem 1rem', background: '#eff6ff', color: '#2563eb', borderRadius: '20px', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>सबै (All)</span>
            <span style={{ padding: '0.5rem 1rem', background: '#f8fafc', color: '#64748b', borderRadius: '20px', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', border: '1px solid #e2e8f0' }}>Civil</span>
            <span style={{ padding: '0.5rem 1rem', background: '#f8fafc', color: '#64748b', borderRadius: '20px', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', border: '1px solid #e2e8f0' }}>Architecture</span>
          </div>
        </div>

        {/* Directory Grid */}
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>लोड हुँदैछ...</div>
        ) : isError ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#ef4444' }}>विवरण ल्याउन समस्या भयो।</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
            {engineers?.map((engineer) => (
              <div key={engineer.id} style={{ 
                backgroundColor: '#ffffff', 
                borderRadius: '20px', 
                padding: '2rem',
                boxShadow: '0 10px 30px rgba(0,0,0,0.03)',
                transition: 'transform 0.2s, boxShadow 0.2s',
                border: '1px solid #f1f5f9',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.06)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.03)';
              }}
              >
                {/* Status Badge */}
                <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem', background: engineer.status === 'active' ? '#dcfce7' : '#fef3c7', color: engineer.status === 'active' ? '#16a34a' : '#d97706', padding: '0.35rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>
                  {engineer.status === 'active' ? <CheckCircle size={14} /> : <Clock size={14} />}
                  {engineer.status === 'active' ? 'Active' : 'Inactive'}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem' }}>
                  <div style={{ width: '70px', height: '70px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '2px solid #e2e8f0' }}>
                    {engineer.photoUrl ? (
                      <img src={engineer.photoUrl} alt={engineer.fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <HardHat size={32} color="#94a3b8" />
                    )}
                  </div>
                  <div>
                    <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.25rem', fontWeight: 800, color: '#1e293b' }}>{engineer.fullName}</h3>
                    <div style={{ display: 'inline-block', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569', fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '6px', fontWeight: 600 }}>
                      {engineer.licenseNo}
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.95rem', color: '#475569' }}>
                    <MapPin size={18} color="#94a3b8" style={{ marginTop: '2px', flexShrink: 0 }} />
                    <span style={{ fontWeight: 600 }}>{engineer.consultancyName || 'स्वतन्त्र (Freelance)'}</span>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.95rem', color: '#475569' }}>
                    <ExternalLink size={18} color="#94a3b8" style={{ flexShrink: 0 }} />
                    <span>{engineer.specialization}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.95rem', color: '#475569' }}>
                    <Phone size={18} color="#94a3b8" style={{ flexShrink: 0 }} />
                    <a href={`tel:${engineer.contactPhone}`} style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 500 }}>{engineer.contactPhone}</a>
                  </div>

                  {engineer.email && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.95rem', color: '#475569' }}>
                      <Mail size={18} color="#94a3b8" style={{ flexShrink: 0 }} />
                      <a href={`mailto:${engineer.email}`} style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 500 }}>{engineer.email}</a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default EngineersDirectoryPage;
