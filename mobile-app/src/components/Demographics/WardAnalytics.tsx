import React, { useState, useEffect } from 'react';
import { ArrowLeft, PieChart, Users, Home, TrendingUp, AlertCircle, BarChart3 } from 'lucide-react';
import apiClient from '../../services/api';

interface WardStat {
  ward_number: string | number;
  total_population: number;
  total_households: number;
  male_count?: number;
  female_count?: number;
  vulnerable_households?: number;
  bank_access_households?: number;
  health_insurance_households?: number;
}

export const WardAnalytics: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [wardData, setWardData] = useState<WardStat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWardStats = async () => {
      try {
        const response = await apiClient.get('/demographics/ward-analytics');
        // Handle different possible response structures
        if (response.data && Array.isArray(response.data)) {
          setWardData(response.data);
        } else if (response.data && Array.isArray(response.data.data)) {
          setWardData(response.data.data);
        } else {
          setWardData([]);
        }
      } catch (err) {
        console.error('Failed to fetch ward analytics:', err);
        setError('वडागत तथ्यांक लोड गर्न सकिएन। कृपया इन्टरनेट जडान जाँच गर्नुहोस्।');
      } finally {
        setIsLoading(false);
      }
    };
    fetchWardStats();
  }, []);

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#F8FAFC',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '1.25rem 1.25rem 1rem 1.25rem',
          backgroundColor: '#0F4C81',
          color: '#ffffff',
          borderBottomLeftRadius: '24px',
          borderBottomRightRadius: '24px',
          boxShadow: '0 4px 12px rgba(15, 76, 129, 0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          paddingTop: 'calc(1.25rem + env(safe-area-inset-top))',
        }}
      >
        <button
          onClick={onBack}
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            border: 'none',
            color: '#fff',
            width: '36px',
            height: '36px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 900, margin: 0, lineHeight: 1.2 }}>वडागत तथ्यांक</h2>
          <span style={{ fontSize: '0.75rem', opacity: 0.9 }}>Ward Analytics</span>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '1.25rem', overflowY: 'auto', flex: 1, paddingBottom: 'calc(1.25rem + env(safe-area-inset-bottom))' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem', backgroundColor: '#EFF6FF', padding: '12px', borderRadius: '12px', color: '#0F4C81' }}>
          <PieChart size={24} />
          <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>प्रत्येक वडाको घरधुरी तथा जनसंख्या विवरण</div>
        </div>

        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem', color: '#64748B' }}>
            <TrendingUp size={24} className="animate-spin" />
            <span style={{ marginLeft: '8px' }}>तथ्यांक लोड हुँदैछ...</span>
          </div>
        ) : error ? (
          <div style={{ backgroundColor: '#FEF2F2', padding: '1rem', borderRadius: '12px', color: '#DC2626', fontSize: '0.85rem', textAlign: 'center', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
            <AlertCircle size={18} />
            {error}
          </div>
        ) : wardData.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#64748B' }}>
            <BarChart3 size={48} style={{ margin: '0 auto', opacity: 0.2, marginBottom: '1rem' }} />
            <p>कुनै तथ्यांक फेला परेन।</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {wardData.map((ward, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  padding: '1.1rem',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                  border: '1px solid #E2E8F0',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                {/* Main Stats Row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {/* Ward Badge */}
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '14px',
                    backgroundColor: '#F1F5F9',
                    border: '1.5px solid #CBD5E1',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>वडा नं</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0F4C81', lineHeight: 1 }}>{ward.ward_number}</div>
                  </div>

                  {/* Population and Households */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#475569', fontWeight: 700 }}>
                        <Users size={16} color="#0F4C81" />
                        कुल जनसंख्या
                      </div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#1E293B' }}>
                        {ward.total_population?.toLocaleString() || 0}
                      </div>
                    </div>
                    
                    <div style={{ width: '100%', height: '1px', backgroundColor: '#F1F5F9' }}></div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#475569', fontWeight: 700 }}>
                        <Home size={16} color="#E65100" />
                        कुल घरधुरी
                      </div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#1E293B' }}>
                        {ward.total_households?.toLocaleString() || 0}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Integrated Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '4px' }}>
                   <div style={{ backgroundColor: '#F8FAFC', padding: '8px 10px', borderRadius: '10px' }}>
                      <div style={{ fontSize: '0.65rem', color: '#64748B', marginBottom: '2px' }}>पुरुष / महिला अनुपात</div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0F4C81' }}>{ward.male_count || 0} / {ward.female_count || 0}</div>
                   </div>
                   <div style={{ backgroundColor: '#FEF2F2', padding: '8px 10px', borderRadius: '10px' }}>
                      <div style={{ fontSize: '0.65rem', color: '#64748B', marginBottom: '2px' }}>जोखिमयुक्त घरधुरी</div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#DC2626' }}>{ward.vulnerable_households || 0}</div>
                   </div>
                   <div style={{ backgroundColor: '#F0FDF4', padding: '8px 10px', borderRadius: '10px' }}>
                      <div style={{ fontSize: '0.65rem', color: '#64748B', marginBottom: '2px' }}>बैंक पहुँच भएका</div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#16A34A' }}>{ward.bank_access_households || 0} घर</div>
                   </div>
                   <div style={{ backgroundColor: '#EFF6FF', padding: '8px 10px', borderRadius: '10px' }}>
                      <div style={{ fontSize: '0.65rem', color: '#64748B', marginBottom: '2px' }}>स्वास्थ्य बीमा भएका</div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#2563EB' }}>{ward.health_insurance_households || 0} घर</div>
                   </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
