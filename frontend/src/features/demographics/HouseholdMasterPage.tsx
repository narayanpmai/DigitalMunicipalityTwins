import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { HouseholdRegistryTab } from '../citizen-portal/components/HouseholdRegistryTab';
import { SurveyIndicatorsTab } from '../citizen-portal/components/SurveyIndicatorsTab';
import { Building, BarChart3, Info } from 'lucide-react';
import { useTenant } from '../../context/TenantContext';

export const HouseholdMasterPage: React.FC = () => {
  const location = useLocation();
  const isPublicMode = !location.pathname.startsWith('/app');
  const { settings } = useTenant();
  const palikaName = settings?.palika_name || 'पालिका';
  const [activeTab, setActiveTab] = useState<'households' | 'survey'>('households');

  return (
    <div className="page-container" style={{ padding: '1.5rem', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      {/* HEADER SECTION */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <span style={{ padding: '0.25rem 0.75rem', backgroundColor: '#2563eb', color: '#ffffff', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>
                तथ्याङ्क व्यवस्थापन (Data Management)
              </span>
              <span style={{ padding: '0.25rem 0.75rem', backgroundColor: '#10b981', color: '#ffffff', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>
                मास्टर हब
              </span>
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Building size={28} color="#2563eb" />
              घरधुरी म्याट्रिक्स तथा सर्वेक्षण सूचक
            </h1>
            <p style={{ color: '#64748b', margin: 0, fontSize: '0.9rem', maxWidth: '800px', lineHeight: 1.5 }}>
              {palikaName} — सम्पूर्ण आधिकारिक घरधुरीको एकीकृत लगत, ९४ वटा सर्वेक्षण सूचक र डिजिटल पार्श्वचित्र तथ्याङ्क व्यवस्थापन प्रणाली।
            </p>
          </div>
        </div>

        {/* Info Alert */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', backgroundColor: '#eff6ff', padding: '1rem', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
          <Info size={20} color="#3b82f6" style={{ marginTop: '2px', flexShrink: 0 }} />
          <div style={{ fontSize: '0.85rem', color: '#1e3a8a', lineHeight: 1.5 }}>
            <strong>जानकारी:</strong> यो मोड्युल तथ्याङ्क संकलन र विश्लेषणको लागि मात्र हो। व्यक्तिगत नागरिक दर्ता र सेवा प्रवाहको लागि <strong>नागरिक पोर्टल</strong> प्रयोग गर्नुहोस्।
          </div>
        </div>
      </div>

      {/* TAB NAVIGATOR */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveTab('households')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.625rem',
            padding: '0.75rem 1.5rem',
            borderRadius: '12px',
            border: activeTab === 'households' ? '2px solid #10b981' : '1px solid #e2e8f0',
            backgroundColor: activeTab === 'households' ? '#065f46' : '#ffffff',
            color: activeTab === 'households' ? '#ffffff' : '#334155',
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: '0.95rem',
            boxShadow: activeTab === 'households' ? '0 4px 12px rgba(16, 185, 129, 0.25)' : 'none',
            transition: 'all 0.2s ease',
          }}
        >
          <Building size={20} color={activeTab === 'households' ? '#34d399' : '#64748b'} />
          <span>१. घरधुरी म्याट्रिक्स लगत (Household Master)</span>
          <span style={{ backgroundColor: activeTab === 'households' ? 'rgba(255,255,255,0.2)' : '#f1f5f9', color: activeTab === 'households' ? '#ffffff' : '#475569', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 800 }}>
            Master Hub
          </span>
        </button>

        <button
          onClick={() => setActiveTab('survey')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.625rem',
            padding: '0.75rem 1.5rem',
            borderRadius: '12px',
            border: activeTab === 'survey' ? '2px solid #0ea5e9' : '1px solid #e2e8f0',
            backgroundColor: activeTab === 'survey' ? '#075985' : '#ffffff',
            color: activeTab === 'survey' ? '#ffffff' : '#334155',
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: '0.95rem',
            boxShadow: activeTab === 'survey' ? '0 4px 12px rgba(14, 165, 233, 0.25)' : 'none',
            transition: 'all 0.2s ease',
          }}
        >
          <BarChart3 size={20} color={activeTab === 'survey' ? '#7dd3fc' : '#64748b'} />
          <span>२. डिजिटल पार्श्वचित्र तथा सर्वेक्षण सूचक</span>
          <span style={{ backgroundColor: activeTab === 'survey' ? 'rgba(255,255,255,0.2)' : '#f1f5f9', color: activeTab === 'survey' ? '#ffffff' : '#475569', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 800 }}>
            ९४ सूचक
          </span>
        </button>
      </div>

      {/* TAB CONTENT */}
      <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
        {activeTab === 'households' && <HouseholdRegistryTab isPublicMode={isPublicMode} />}
        {activeTab === 'survey' && <SurveyIndicatorsTab />}
      </div>
    </div>
  );
};
