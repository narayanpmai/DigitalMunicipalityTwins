import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { municipalityApi } from '../../api/municipality';
import { representativesApi } from '../../api/representatives';
import { useTenant } from '../../context/TenantContext';
import {
  MapPin,
  Compass,
  Mountain,
  Maximize2,
  Users,
  Award,
  Phone,
  Plus,
  Building2,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { settings } = useTenant();
  const navigate = useNavigate();
  
  const { data: profile, isLoading, isError, refetch } = useQuery({
    queryKey: ['municipality-profile'],
    queryFn: () => municipalityApi.getProfile(),
  });

  const { data: representatives = [] } = useQuery({
    queryKey: ['representatives', 'current'],
    queryFn: () => representativesApi.getAll({ isCurrent: true }),
  });

  const { data: wards = [], isLoading: isWardsLoading } = useQuery({
    queryKey: ['wards-profile'],
    queryFn: () => municipalityApi.getWards(),
  });

  if (isLoading) {
    return (
      <div className="dt-card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
        पालिका प्रोफाइल लोड हुँदैछ...
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="dt-card" style={{ textAlign: 'center', padding: '3rem', color: '#ef4444' }}>
        प्रणालीमा जडान हुन सकेन। कृपया पुनः प्रयास गर्नुहोस्। 
        <br/><br/>
        <button onClick={() => refetch()} className="dt-btn dt-btn-primary">पुनः लोड गर्नुहोस्</button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>
          {profile.name} — चिनारी तथा भौगोलिक परिचय
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          {profile.province}, {profile.district} जिल्लाको उच्च हिमाली तथा जैविक विविधतायुक्त गाउँपालिका
        </p>
      </div>

      {/* Key Geographical Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <div className="dt-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: '10px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
            <Maximize2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>कुल क्षेत्रफल</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>{profile.totalAreaSqKm} वर्ग कि.मी.</div>
          </div>
        </div>

        <div className="dt-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: '10px', backgroundColor: 'var(--success-light)', color: '#065f46' }}>
            <Mountain size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>भौगोलिक उचाइ</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>{profile.elevationMeters}</div>
          </div>
        </div>

        <div className="dt-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: '10px', backgroundColor: '#eff6ff', color: '#1d4ed8' }}>
            <MapPin size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>केन्द्र (सदरमुकाम)</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>{profile.headquarters}</div>
          </div>
        </div>

        <div className="dt-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: '10px', backgroundColor: 'var(--warning-light)', color: '#92400e' }}>
            <Users size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>कुल जनसंख्या</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>{profile.demographics.totalPopulation.toLocaleString()} जना</div>
          </div>
        </div>
      </div>

      {/* Boundaries & Geographical Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        <div className="dt-card">
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Compass size={20} color="var(--primary)" /> चार किल्ला तथा सिमानाहरू
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0.8rem', background: '#f8fafc', borderRadius: '6px' }}>
              <span style={{ fontWeight: 600 }}>पूर्व (East):</span>
              <span style={{ color: 'var(--text-muted)' }}>{profile.boundaries.east}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0.8rem', background: '#f8fafc', borderRadius: '6px' }}>
              <span style={{ fontWeight: 600 }}>पश्चिम (West):</span>
              <span style={{ color: 'var(--text-muted)' }}>{profile.boundaries.west}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0.8rem', background: '#f8fafc', borderRadius: '6px' }}>
              <span style={{ fontWeight: 600 }}>उत्तर (North):</span>
              <span style={{ color: 'var(--text-muted)' }}>{profile.boundaries.north}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0.8rem', background: '#f8fafc', borderRadius: '6px' }}>
              <span style={{ fontWeight: 600 }}>दक्षिण (South):</span>
              <span style={{ color: 'var(--text-muted)' }}>{profile.boundaries.south}</span>
            </div>
          </div>
        </div>

        <div className="dt-card">
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Mountain size={20} color="var(--primary)" /> भौगोलिक तथा वातावरणीय विशेषता
          </h2>
          <p style={{ fontSize: '0.875rem', lineHeight: 1.6, color: 'var(--text-main)', marginBottom: '0.75rem' }}>
            पाँचपोखरी थाङपाल गाउँपालिका सिन्धुपाल्चोक जिल्लाको उत्तर-पश्चिम भेगमा अवस्थित हिमाली तथा पहाडी गाउँपालिका हो। यहाँ पाँचपोखरी, आमा याङ्ग्री जस्ता विश्वप्रसिद्ध धार्मिक तथा पर्यटकीय स्थलहरू रहेका छन्।
          </p>
          <p style={{ fontSize: '0.875rem', lineHeight: 1.6, color: 'var(--text-muted)' }}>
            ह्योल्मो र तामाङ संस्कृतिको बाहुल्यता रहेको यस पालिकामा स्याउ, आलु, किबी, ट्राउट माछा तथा जडीबुटी खेतीको उच्च सम्भावना रहेको छ।
          </p>
        </div>
      </div>

      {/* Leadership Section */}
      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-main)' }}>
          कार्यपालिका नेतृत्व वर्ग
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          <div className="dt-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Award size={28} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{profile.leadership.mayor.name}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>{profile.leadership.mayor.designation}</div>
              {profile.leadership.mayor.phone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  <Phone size={12} /> {profile.leadership.mayor.phone}
                </div>
              )}
            </div>
          </div>

          <div className="dt-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'var(--success-light)', color: '#065f46', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Award size={28} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{profile.leadership.deputyMayor.name}</div>
              <div style={{ fontSize: '0.8rem', color: '#065f46', fontWeight: 600 }}>{profile.leadership.deputyMayor.designation}</div>
              {profile.leadership.deputyMayor.phone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  <Phone size={12} /> {profile.leadership.deputyMayor.phone}
                </div>
              )}
            </div>
          </div>

          <div className="dt-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#eff6ff', color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Award size={28} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{profile.leadership.chiefOfficer.name}</div>
              <div style={{ fontSize: '0.8rem', color: '#1d4ed8', fontWeight: 600 }}>{profile.leadership.chiefOfficer.designation}</div>
              {profile.leadership.chiefOfficer.phone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  <Phone size={12} /> {profile.leadership.chiefOfficer.phone}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 360 Degree View Section */}
      {Boolean(settings?.panoramaUrl) && (
        <div className="dt-card" style={{ padding: '1.5rem', marginTop: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Compass size={24} color="var(--primary)" />
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

      {/* Dynamic Representatives Section */}
      <div style={{ marginTop: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            <Users size={24} color="var(--primary)" />
            हाम्रा जनप्रतिनिधिहरू
          </h2>
          <button onClick={() => navigate('/app/representatives')} style={{ backgroundColor: 'var(--primary)', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
            <Plus size={16} /> नयाँ प्रतिनिधि थप्नुहोस्
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.5rem', paddingBottom: '1rem' }}>
          {representatives.filter(rep => !rep.wardNo).map(rep => (
            <div key={rep.id} className="dt-card" style={{ padding: '1.5rem', textAlign: 'center', transition: 'transform 0.2s', cursor: 'pointer' }}
                 onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                 onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{ width: '80px', height: '80px', margin: '0 auto 1rem', borderRadius: '50%', backgroundColor: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '3px solid #e0f2fe' }}>
                {rep.photoUrl ? <img src={rep.photoUrl} alt={rep.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Users size={32} color="var(--primary)" />}
              </div>
              <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>{rep.name}</h3>
              <div style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.5rem' }}>{rep.designation}</div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
                {rep.phone && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <Phone size={12} /> {rep.phone}
                  </div>
                )}
              </div>
            </div>
          ))}
          {representatives.filter(rep => !rep.wardNo).length === 0 && (
            <div style={{ gridColumn: '1 / -1', color: 'var(--text-muted)', fontStyle: 'italic', padding: '1rem 0' }}>कुनै पनि जनप्रतिनिधिको विवरण उपलब्ध छैन।</div>
          )}
        </div>
      </div>

      {/* Ward Profiles Grid */}
      <div style={{ marginTop: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            <Building2 size={24} color="#10b981" />
            वडा प्रोफाइल
          </h2>
          <button onClick={() => navigate('/app/wards')} style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, boxShadow: '0 4px 6px rgba(16, 185, 129, 0.2)' }}>
            <Plus size={16} /> नयाँ वडा थप्नुहोस्
          </button>
        </div>

        {isWardsLoading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>वडा विवरण लोड हुँदैछ...</div>
        ) : wards.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {wards.map((ward: any) => (
              <div key={ward.wardNo} className="dt-card" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ backgroundColor: '#10b981', color: '#ffffff', padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Building2 size={18} /> वडा नं. {ward.wardNo}
                  </h3>
                </div>
                <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <div style={{ color: 'var(--text-muted)' }}><Users size={18} /></div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.1rem' }}>वडा अध्यक्ष</div>
                      <div style={{ color: 'var(--text-main)', fontWeight: 600, fontSize: '1rem' }}>{ward.chairperson || '-'}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <div style={{ color: 'var(--text-muted)' }}><MapPin size={18} /></div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.1rem' }}>कार्यालय स्थान</div>
                      <div style={{ color: 'var(--text-main)', fontWeight: 500, fontSize: '0.9rem' }}>{ward.officeLocation || '-'}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <div style={{ color: 'var(--text-muted)' }}><Phone size={18} /></div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.1rem' }}>सम्पर्क नम्बर</div>
                      <div style={{ color: 'var(--text-main)', fontWeight: 500, fontSize: '0.9rem' }}>{ward.phone || '-'}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="dt-card" style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: '1.1rem', color: 'var(--text-main)', fontWeight: 600 }}>वडा विवरणहरू अपडेट हुन बाँकी छ।</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>'नयाँ वडा थप्नुहोस्' बटन थिचेर वडा प्रोफाइल थप्नुहोस्।</div>
          </div>
        )}
      </div>
    </div>
  );
};
