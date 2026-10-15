import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { tourismApi } from '../../api/tourism';
import { 
  Mountain, 
  Home, 
  Map, 
  CalendarCheck, 
  ShoppingBag, 
  UserPlus,
  Tent,
  CheckCircle,
  Users
} from 'lucide-react';
import { DestinationsTab } from './components/DestinationsTab';
import { HotelsTab } from './components/HotelsTab';
import { PackagesTab } from './components/PackagesTab';
import { ReservationsTab } from './components/ReservationsTab';
import { LocalProductsTab } from './components/LocalProductsTab';
import { TouristLogTab } from './components/TouristLogTab';

export const TourismPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'destinations' | 'hotels' | 'packages' | 'reservations' | 'products' | 'tourists'>('destinations');

  const { data: stats } = useQuery({
    queryKey: ['tourism-stats'],
    queryFn: () => tourismApi.getStats(),
  });

  const toNepali = (num: number | undefined, fallback: string) => {
    if (num === undefined || num === null) return fallback;
    return String(num).replace(/[0-9]/g, d => '०१२३४५६७८९'[parseInt(d)]);
  };

  return (
    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header Banner */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        padding: '1.5rem',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        color: '#fff',
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '2px 8px', borderRadius: '6px', backgroundColor: 'rgba(59, 130, 246, 0.25)', border: '1px solid rgba(59, 130, 246, 0.4)', fontSize: '0.72rem', fontWeight: 700, color: '#93c5fd', marginBottom: '6px' }}>
            <span>LGOA २०७४ अनुसूची ८ • पर्यटन प्रवर्द्धन, पदमार्ग तथा होमस्टे नियमन</span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>
            पर्यटन, सम्पदा तथा उद्यमशीलता व्यवस्थापन प्रणाली
          </h1>
          <p style={{ margin: '0.25rem 0 0', opacity: 0.9, fontSize: '0.9rem' }}>
            पाँचपोखरी थाङपालका विश्वप्रसिद्ध तीर्थस्थल, हिमशिखर, होटल/होमस्टे तथा स्थानीय उत्पादनको एकीकृत पोर्टल
          </p>
        </div>
        <button
          onClick={() => window.open('/gis-map?filter=tourism', '_blank')}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.6rem 1.25rem', background: '#3b82f6', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontWeight: 600,
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}
        >
          🗺️ GIS नक्सामा पर्यटकीय गन्तव्यहरू
        </button>
      </div>

      {/* Dynamic KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1rem'
      }}>
        <div style={{ background: '#fff', padding: '1.25rem', borderRadius: '10px', border: '1.5px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>कुल पर्यटकीय गन्तव्य</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1e293b', marginTop: '0.25rem' }}>
              {toNepali(stats?.totalDestinations, '१५')}
            </div>
          </div>
          <div style={{ background: '#f1f5f9', color: '#475569', padding: '0.75rem', borderRadius: '8px' }}><Mountain size={24} /></div>
        </div>
        <div style={{ background: '#fff', padding: '1.25rem', borderRadius: '10px', border: '1.5px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>होटल तथा होमस्टे</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0ea5e9', marginTop: '0.25rem' }}>
              {toNepali(stats?.totalHotels, '३२')}
            </div>
          </div>
          <div style={{ background: '#e0f2fe', color: '#0284c7', padding: '0.75rem', borderRadius: '8px' }}><Home size={24} /></div>
        </div>
        <div style={{ background: '#fff', padding: '1.25rem', borderRadius: '10px', border: '1.5px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>बुकिङ तथा आरक्षण</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#10b981', marginTop: '0.25rem' }}>
              {toNepali(stats?.totalReservations, '३')}
            </div>
          </div>
          <div style={{ background: '#dcfce7', color: '#16a34a', padding: '0.75rem', borderRadius: '8px' }}><CheckCircle size={24} /></div>
        </div>
        <div style={{ background: '#fff', padding: '1.25rem', borderRadius: '10px', border: '1.5px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>दर्ता पर्यटक आगमन</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f59e0b', marginTop: '0.25rem' }}>
              {toNepali(stats?.totalTourists, '८५०')}
            </div>
          </div>
          <div style={{ background: '#fef3c7', color: '#d97706', padding: '0.75rem', borderRadius: '8px' }}><Users size={24} /></div>
        </div>
      </div>

      {/* ── Ultra-Premium Segmented Tab Navigation ─────────────────── */}
      <div
        style={{
          background: '#f8fafc',
          borderRadius: '20px',
          border: '1px solid #e2e8f0',
          padding: '12px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.02)',
        }}
      >
        {[
          { id: 'destinations', label: 'गन्तव्य तथा सम्पदा', desc: 'Destinations', icon: <Mountain size={20} /> },
          { id: 'hotels', label: 'होटल तथा होमस्टे', desc: 'Accommodations', icon: <Home size={20} /> },
          { id: 'packages', label: 'टुर प्याकेज', desc: 'Tour Packages', icon: <Map size={20} /> },
          { id: 'reservations', label: 'बुकिङ तथा आरक्षण', desc: 'Bookings', icon: <CalendarCheck size={20} /> },
          { id: 'products', label: 'स्थानीय उत्पादन', desc: 'Local Products', icon: <ShoppingBag size={20} /> },
          { id: 'tourists', label: 'पर्यटक दर्ता लग', desc: 'Tourist Logs', icon: <UserPlus size={20} /> },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                flex: '1 1 200px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                gap: '12px',
                padding: '12px 18px',
                borderRadius: '14px',
                border: isActive ? '1.5px solid rgba(59, 130, 246, 0.4)' : '1.5px solid transparent',
                background: isActive 
                  ? 'linear-gradient(145deg, #ffffff 0%, #f0f9ff 100%)' 
                  : '#ffffff',
                color: isActive ? '#1e40af' : '#475569',
                fontWeight: isActive ? 700 : 500,
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: isActive
                  ? '0 6px 16px rgba(59, 130, 246, 0.12), 0 2px 4px rgba(59, 130, 246, 0.04)'
                  : '0 2px 6px rgba(0,0,0,0.03)',
                outline: 'none',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.06)';
                  e.currentTarget.style.color = '#0f172a';
                  e.currentTarget.style.borderColor = '#e2e8f0';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.03)';
                  e.currentTarget.style.color = '#475569';
                  e.currentTarget.style.borderColor = 'transparent';
                }
              }}
            >
              {isActive && (
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', background: '#3b82f6', borderRadius: '4px 0 0 4px' }} />
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', zIndex: 1, width: '100%' }}>
                <span style={{ 
                  color: isActive ? '#2563eb' : '#64748b', 
                  display: 'flex', 
                  alignItems: 'center',
                  background: isActive ? '#dbeafe' : '#f1f5f9',
                  padding: '8px',
                  borderRadius: '10px',
                  transition: 'all 0.3s'
                }}>
                  {tab.icon}
                </span>
                <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '14px', fontWeight: isActive ? 700 : 600 }}>{tab.label}</span>
                  <span style={{ fontSize: '11px', color: isActive ? '#3b82f6' : '#94a3b8', fontWeight: 500, marginTop: '2px' }}>
                    {tab.desc}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div style={{ marginTop: '0.5rem' }}>
        {activeTab === 'destinations' && <DestinationsTab />}
        {activeTab === 'hotels' && <HotelsTab />}
        {activeTab === 'packages' && <PackagesTab />}
        {activeTab === 'reservations' && <ReservationsTab />}
        {activeTab === 'products' && <LocalProductsTab />}
        {activeTab === 'tourists' && <TouristLogTab />}
      </div>

    </div>
  );
};

export default TourismPage;
