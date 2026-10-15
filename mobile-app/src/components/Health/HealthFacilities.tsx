import React, { useState, useEffect } from 'react';
import { ArrowLeft, Stethoscope, Phone, MapPin, Activity, ShieldCheck } from 'lucide-react';
import apiClient from '../../services/api';

interface HealthFacility {
  id: string;
  name: string;
  type: string;
  ward_number?: string;
  contact_number?: string;
  services?: string[];
  is_active?: boolean;
}

export const HealthFacilities: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [facilities, setFacilities] = useState<HealthFacility[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        const response = await apiClient.get('/health/facilities');
        if (response.data && Array.isArray(response.data)) {
          setFacilities(response.data);
        } else if (response.data && response.data.facilities) {
          setFacilities(response.data.facilities);
        } else {
          // If the backend returns something else or nothing
          setFacilities([]);
        }
      } catch (err) {
        console.error('Failed to fetch health facilities:', err);
        setError('स्वास्थ्य संस्थाहरू लोड गर्न सकिएन। कृपया इन्टरनेट जडान जाँच गर्नुहोस्।');
      } finally {
        setIsLoading(false);
      }
    };
    fetchFacilities();
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
          <h2 style={{ fontSize: '1.1rem', fontWeight: 900, margin: 0, lineHeight: 1.2 }}>स्वास्थ्य संस्थाहरू</h2>
          <span style={{ fontSize: '0.75rem', opacity: 0.9 }}>Health Facilities (API)</span>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '1.25rem', overflowY: 'auto', flex: 1, paddingBottom: 'calc(1.25rem + env(safe-area-inset-bottom))' }}>
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem', color: '#64748B' }}>
            <Activity size={24} className="animate-spin" />
            <span style={{ marginLeft: '8px' }}>लोड हुँदैछ...</span>
          </div>
        ) : error ? (
          <div style={{ backgroundColor: '#FEF2F2', padding: '1rem', borderRadius: '12px', color: '#DC2626', fontSize: '0.85rem', textAlign: 'center' }}>
            {error}
          </div>
        ) : facilities.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#64748B' }}>
            <Stethoscope size={48} style={{ margin: '0 auto', opacity: 0.2, marginBottom: '1rem' }} />
            <p>कुनै स्वास्थ्य संस्था फेला परेन।</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {facilities.map((fac) => (
              <div
                key={fac.id}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  padding: '1rem',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
                  border: '1px solid #E2E8F0',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        backgroundColor: '#EFF6FF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Stethoscope size={22} color="#0F4C81" />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1E293B', margin: '0 0 2px 0' }}>
                        {fac.name}
                      </h3>
                      <div style={{ fontSize: '0.75rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <ShieldCheck size={12} color="#16A34A" /> {fac.type}
                      </div>
                    </div>
                  </div>
                  {fac.is_active && (
                    <span style={{ fontSize: '0.6rem', backgroundColor: '#DCFCE7', color: '#16A34A', padding: '2px 6px', borderRadius: '8px', fontWeight: 800 }}>
                      Active
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '1rem' }}>
                  {fac.ward_number && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#475569' }}>
                      <MapPin size={14} color="#64748B" />
                      वडा नं. {fac.ward_number}
                    </div>
                  )}
                  {fac.contact_number && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#475569' }}>
                      <Phone size={14} color="#64748B" />
                      {fac.contact_number}
                    </div>
                  )}
                </div>

                {fac.services && fac.services.length > 0 && (
                  <div style={{ marginTop: '0.85rem', paddingTop: '0.85rem', borderTop: '1px dashed #E2E8F0' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#1E293B', marginBottom: '6px' }}>उपलब्ध सेवाहरू:</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {fac.services.map((srv, idx) => (
                        <span key={idx} style={{ fontSize: '0.65rem', backgroundColor: '#F1F5F9', color: '#475569', padding: '3px 8px', borderRadius: '12px' }}>
                          {srv}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
