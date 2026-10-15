import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NEPAL_ADMIN_STRUCTURE } from '../../utils/nepalAdministrativeData';
import { Building2, AlertCircle, CheckCircle2 } from 'lucide-react';

export const RegistrationPage: React.FC = () => {
  const navigate = useNavigate();
  const [province, setProvince] = useState('');
  const [district, setDistrict] = useState('');
  const [localLevel, setLocalLevel] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const provinces = NEPAL_ADMIN_STRUCTURE.map(p => p.name);
  const selectedProv = NEPAL_ADMIN_STRUCTURE.find(p => p.name === province);
  const districts = selectedProv ? selectedProv.districts.map(d => d.name) : [];
  const selectedDist = selectedProv?.districts.find(d => d.name === district);
  const localLevels = selectedDist ? selectedDist.palikas.map(p => p.name) : [];

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const payload = {
      nameNp: localLevel,
      nameEn: localLevel,
      subdomain,
      adminEmail,
      adminPassword,
    };

    try {
      const res = await fetch('/api/v1/tenants/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Error occurred');
      
      setSuccess(true);
      setTimeout(() => {
        window.location.href = '/super-admin';
      }, 1500);
    } catch (err: any) {
      setError('त्रुटि: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', backgroundColor: '#f8fafc', padding: '2rem'
    }}>
      <div style={{
        width: '100%', maxWidth: '600px', backgroundColor: 'white',
        borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', overflow: 'hidden'
      }}>
        <div style={{ backgroundColor: '#2563eb', padding: '1.5rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Building2 size={24} />
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>नयाँ पालिका दर्ता (New Tenant)</h2>
        </div>

        <div style={{ padding: '2rem' }}>
          {error && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              backgroundColor: '#fef2f2', color: '#991b1b', padding: '1rem',
              borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem'
            }}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              backgroundColor: '#f0fdf4', color: '#166534', padding: '1rem',
              borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem'
            }}>
              <CheckCircle2 size={18} />
              <span>सफलतापूर्वक दर्ता भयो! Redirecting...</span>
            </div>
          )}

          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>प्रदेश</label>
                <select
                  required
                  value={province}
                  onChange={(e) => {
                    setProvince(e.target.value);
                    setDistrict('');
                    setLocalLevel('');
                  }}
                  className="dt-select"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                >
                  <option value="">-- प्रदेश छान्नुहोस् --</option>
                  {provinces.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>जिल्ला</label>
                <select
                  required
                  disabled={!province}
                  value={district}
                  onChange={(e) => {
                    setDistrict(e.target.value);
                    setLocalLevel('');
                  }}
                  className="dt-select"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                >
                  <option value="">-- जिल्ला छान्नुहोस् --</option>
                  {districts.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>स्थानीय तह (पालिका)</label>
              <select
                required
                disabled={!district}
                value={localLevel}
                onChange={(e) => setLocalLevel(e.target.value)}
                className="dt-select"
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              >
                <option value="">-- स्थानीय तह छान्नुहोस् --</option>
                {localLevels.map(ll => <option key={ll} value={ll}>{ll}</option>)}
              </select>
            </div>

            <hr style={{ margin: '0.5rem 0', borderColor: '#e2e8f0' }} />

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>Subdomain (e.g. kathmandu)</label>
              <input
                type="text"
                required
                value={subdomain}
                onChange={(e) => setSubdomain(e.target.value)}
                placeholder="kathmandu"
                className="dt-input"
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>सुपर एडमिन इमेल</label>
              <input
                type="email"
                required
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="admin@kathmandu.gov.np"
                className="dt-input"
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>पासवर्ड</label>
              <input
                type="password"
                required
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="••••••••"
                className="dt-input"
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
              <button
                type="button"
                onClick={() => navigate(-1)}
                style={{ padding: '0.75rem 1.5rem', backgroundColor: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
              >
                पछाडि
              </button>
              <button
                type="submit"
                disabled={isLoading}
                style={{ padding: '0.75rem 1.5rem', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', opacity: isLoading ? 0.7 : 1 }}
              >
                {isLoading ? 'दर्ता हुँदैछ...' : 'दर्ता गर्नुहोस्'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
