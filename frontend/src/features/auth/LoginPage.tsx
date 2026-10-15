import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authApi } from '../../api/auth';
import { useTenant } from '../../context/TenantContext';
import { useAuth } from '../../context/AuthContext';
import { AlertCircle } from 'lucide-react';

const DEFAULT_TENANTS = [
  { subdomain: 'all', nameNp: 'केन्द्रीय प्रशासन (Central Admin)' },
  { subdomain: 'panchpokhari', nameNp: 'पाँचपोखरी थाङपाल गाउँपालिका' },
  { subdomain: 'helambu', nameNp: 'हेलम्बु गाउँपालिका' },
  { subdomain: 'melamchi', nameNp: 'मेलम्ची नगरपालिका' }
];

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { tenantId, setTenantId } = useTenant();
  const { isAuthenticated, login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [tenantList, setTenantList] = useState<any[]>(DEFAULT_TENANTS);

  const from = (location.state as any)?.from?.pathname || '/app';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  useEffect(() => {
    // Fetch live tenants
    const fetchTenants = async () => {
      try {
        const res = await fetch('/api/v1/tenants');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setTenantList(prev => {
              const seen = new Set();
              const merged = [...data, ...prev].filter(t => {
                const sub = (t.subdomain || t.id || '').toLowerCase();
                if (!sub || seen.has(sub)) return false;
                seen.add(sub);
                return true;
              });
              return merged;
            });
          }
        }
      } catch (e) {
        console.warn('Failed to load live tenants:', e);
      }
    };
    fetchTenants();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const res = await authApi.login(email, password, tenantId);
      
      // ✅ Use server-resolved tenantSubdomain (from user's actual account)
      // Falls back to the manually selected tenantId from the dropdown
      const effectiveTenant = res.tenantSubdomain || (tenantId && tenantId !== 'all' ? tenantId : null);
      if (effectiveTenant) {
        setTenantId(effectiveTenant); // Updates TenantContext + localStorage immediately
      }
      
      login(res.user, res.accessToken);
      
      const userRole = res.user.role;
      if (userRole === 'super_admin' || userRole === 'it_admin') {
         window.location.href = '/super-admin.html';
      } else if (userRole.startsWith('public_') && from === '/app') {
         navigate('/citizen-services', { replace: true });
      } else {
         navigate(from, { replace: true });
      }
    } catch (err: any) {
      if (err?.response?.data?.message && err.response.data.message.includes('प्रमाणीकरणको क्रममा छ')) {
        setError(err.response.data.message);
      } else {
        setError('इमेल वा पासवर्ड मिलेन। कृपया पुन: जाँच गर्नुहोस्।');
      }
    } finally {
      setIsLoading(false);
    }
  };


  const handleFillDemo = (demoEmail: string, demoPass: string, demoTenant: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setTenantId(demoTenant);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%', fontFamily: "'Outfit', 'Noto Sans Devanagari', sans-serif", backgroundColor: '#f8fafc' }}>
      {/* Left Panel */}
      <div className="login-left" style={{
        flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '4rem', color: 'white',
        background: "url('https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&q=80&w=1920') no-repeat center center",
        backgroundSize: 'cover'
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, rgba(15,23,42,0.85) 0%, rgba(30,58,138,0.92) 100%)',
          backdropFilter: 'blur(4px)', zIndex: 1
        }}></div>
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '600px', margin: '0 auto', textAlign: 'left' }}>
          <h1 style={{ fontSize: '3.5rem', fontWeight: 800, lineHeight: 1.1, marginBottom: '1.5rem' }}>
            Municipal<br/>Digital Twins
          </h1>
          <p style={{ fontSize: '1.1rem', lineHeight: 1.6, opacity: 0.85 }}>
            एकीकृत डिजिटल प्रणालीमार्फत सुशासन, सेवा प्रवाह र पारदर्शीता प्रवर्द्धन गर्दै डिजिटल स्थानीय तह निर्माणको अभियान।
          </p>
        </div>
      </div>
      
      {/* Right Panel */}
      <div className="login-right" style={{
        width: '100%', maxWidth: '520px', background: 'white',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '3rem 4rem', boxShadow: '-10px 0 30px rgba(0,0,0,0.05)', zIndex: 2
      }}>
        <div style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}>
          <div style={{
            width: '56px', height: '56px',
            background: 'linear-gradient(135deg, #2563eb, #1e40af)',
            borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '20px', fontWeight: 800, color: 'white',
            marginBottom: '2rem', boxShadow: '0 8px 24px rgba(37,99,235,0.3)'
          }}>P5</div>
          
          <h2 style={{ fontWeight: 'bold', marginBottom: '0.25rem', fontSize: '1.5rem', color: '#0f172a' }}>
            प्रशासनिक लगइन
          </h2>
          <p style={{ color: '#64748b', marginBottom: '2rem', fontSize: '0.9rem' }}>
            आफ्नो आधिकारिक इमेल र पासवर्ड राख्नुहोस्
          </p>

          {error && (
            <div style={{
              background: '#fef2f2', border: '1px solid #fca5a5',
              borderRadius: '12px', padding: '12px 16px', marginBottom: '1.5rem',
              color: '#991b1b', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem'
            }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Hidden Demo Credentials */}
          <div style={{ display: 'none' }}>
             <button type="button" onClick={() => handleFillDemo('cao@panchpokhari.gov.np', 'DemoUser@2024!', 'panchpokhari')}>CAO</button>
             <button type="button" onClick={() => handleFillDemo('super_admin@p5digital.local', 'Admin@P5Digital2024!', 'all')}>Super Admin</button>
          </div>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '1rem', textAlign: 'left' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '6px', display: 'block' }}>
                पालिका / निकाय छान्नुहोस्
              </label>
              <select
                className="dt-select"
                value={tenantId}
                onChange={(e) => setTenantId(e.target.value)}
                style={{
                  borderRadius: '12px', padding: '12px 16px', border: '1px solid #cbd5e1',
                  backgroundColor: '#f8fafc', fontSize: '0.95rem', color: '#1e293b', width: '100%',
                  outline: 'none', transition: 'border-color 0.2s'
                }}
              >
                <option value="">-- छान्नुहोस् --</option>
                {tenantList.map(t => (
                  <option key={t.subdomain || t.id} value={(t.subdomain || t.id || '').toLowerCase()}>
                    {t.nameNp || t.nameEn || t.subdomain}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '1rem', textAlign: 'left' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '6px', display: 'block' }}>
                इमेल ठेगाना
              </label>
              <input
                type="email"
                required
                placeholder="user@example.gov.np"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  borderRadius: '12px', padding: '12px 16px', border: '1px solid #cbd5e1',
                  backgroundColor: '#f8fafc', fontSize: '0.95rem', color: '#1e293b', width: '100%',
                  boxSizing: 'border-box', outline: 'none', transition: 'border-color 0.2s'
                }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', margin: 0 }}>
                  पासवर्ड
                </label>
                <a href="#" style={{ fontSize: '0.8rem', fontWeight: 400, color: '#3b82f6', textDecoration: 'none' }}>
                  पासवर्ड बिर्सनुभयो?
                </a>
              </div>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  borderRadius: '12px', padding: '12px 16px', border: '1px solid #cbd5e1',
                  backgroundColor: '#f8fafc', fontSize: '0.95rem', color: '#1e293b', width: '100%',
                  boxSizing: 'border-box', outline: 'none', transition: 'border-color 0.2s'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                border: 'none', padding: '14px', borderRadius: '12px',
                fontWeight: 600, fontSize: '1rem', color: 'white', width: '100%', cursor: 'pointer',
                marginBottom: '1.5rem',
                opacity: isLoading ? 0.7 : 1, transition: 'transform 0.2s'
              }}
            >
              {isLoading ? 'प्रमाणिकरण हुँदैछ...' : 'साइन-इन गर्नुहोस्'}
            </button>
            
            <div style={{ textAlign: 'center' }}>
              <a href="/index.html" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 500 }}>
                ← सार्वजनिक पेजमा फर्कनुहोस्
              </a>
            </div>
          </form>
        </div>
      </div>
      
      {/* Mobile override via style tag */}
      <style>{`
        @media (max-width: 900px) {
          .login-left { display: none !important; }
          .login-right { max-width: 100% !important; padding: 2rem !important; }
        }
      `}</style>
    </div>
  );
};
