import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  CloudRain,
  Thermometer,
  Wind,
  Droplets,
  AlertTriangle,
  Sun,
  Cloud,
  CloudLightning,
  MapPin,
  RefreshCw,
  Info
} from 'lucide-react';
import apiClient from '../../services/api';

interface WeatherStation {
  id: string;
  name: string;
  temp: number;
  rainfall24h: number;
  rainfall1h: number;
  humidity: number;
  status: 'Normal' | 'Warning' | 'Danger';
  forecast: string;
  lastUpdated: string;
}

const DUMMY_STATIONS: WeatherStation[] = [
  // Keeping dummy stations as fallback
  {
    id: 'stn-gobre',
    name: 'गोब्रे वर्षामापन केन्द्र',
    temp: 18,
    rainfall24h: 12.5,
    rainfall1h: 2.1,
    humidity: 65,
    status: 'Normal',
    forecast: 'हल्का वर्षाको सम्भावना',
    lastUpdated: '१० मिनेट अगाडि',
  }
];

export const WeatherDashboard: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [stations, setStations] = useState<WeatherStation[]>(DUMMY_STATIONS);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchWeatherData = async () => {
    try {
      setIsRefreshing(true);
      const response = await apiClient.get('/weather/current');
      if (response.data && response.data.length > 0) {
        // Map the backend 'last_updated' to 'lastUpdated' expected by frontend
        const mappedData = response.data.map((stn: any) => ({
          ...stn,
          lastUpdated: 'भर्खरै अपडेट गरिएको'
        }));
        setStations(mappedData);
      }
    } catch (error) {
      console.error('Error fetching weather data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWeatherData();
  }, []);

  const handleRefresh = () => {
    fetchWeatherData();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Normal': return { bg: '#DCFCE7', text: '#16A34A', border: '#86EFAC', label: 'सामान्य' };
      case 'Warning': return { bg: '#FEF08A', text: '#CA8A04', border: '#FDE047', label: 'सतर्कता' };
      case 'Danger': return { bg: '#FEE2E2', text: '#DC2626', border: '#FCA5A5', label: 'खतरा (Red Alert)' };
      default: return { bg: '#F1F5F9', text: '#64748B', border: '#CBD5E1', label: 'अज्ञात' };
    }
  };

  const getWeatherIcon = (forecast: string) => {
    if (forecast.includes('भारी वर्षा') || forecast.includes('निरन्तर वर्षा')) return <CloudLightning size={40} color="#DC2626" />;
    if (forecast.includes('वर्षा')) return <CloudRain size={40} color="#38BDF8" />;
    if (forecast.includes('सफा') || forecast.includes('घाम')) return <Sun size={40} color="#F59E0B" />;
    return <Cloud size={40} color="#94A3B8" />;
  };

  return (
    <div style={{ backgroundColor: '#F8FAFC', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#0F4C81',
        padding: '1.2rem 1rem',
        paddingTop: '2.5rem',
        color: 'white',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        borderBottomLeftRadius: '24px',
        borderBottomRightRadius: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button onClick={onBack} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', padding: '0.2rem' }}>
              <ChevronLeft size={24} />
            </button>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>मौसम तथा वर्षा जानकारी</h2>
              <span style={{ fontSize: '0.75rem', opacity: 0.85 }}>पाँचपोखरी थाङपाल गाउँपालिका</span>
            </div>
          </div>
          <button 
            onClick={handleRefresh}
            style={{ 
              background: 'rgba(255, 255, 255, 0.15)', 
              border: 'none', 
              color: 'white', 
              borderRadius: '50%', 
              padding: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} style={isRefreshing ? { animation: 'spin 1s linear infinite' } : {}} />
          </button>
        </div>
      </div>

      <style>
        {`
          @keyframes spin { 100% { transform: rotate(360deg); } }
        `}
      </style>

      {/* Main Content */}
      <div style={{ padding: '1.25rem 1rem', flex: 1, overflowY: 'auto', paddingBottom: '6rem' }}>
        
        {/* Info Banner */}
        <div style={{ 
          backgroundColor: '#E0F2FE', 
          border: '1px solid #BAE6FD', 
          borderRadius: '12px', 
          padding: '0.85rem', 
          display: 'flex', 
          gap: '0.75rem',
          marginBottom: '1.25rem'
        }}>
          <Info size={20} color="#0284C7" style={{ flexShrink: 0, marginTop: '2px' }} />
          <p style={{ margin: 0, fontSize: '0.75rem', color: '#0369A1', lineHeight: 1.4, fontWeight: 600 }}>
            यो प्रणाली हाल परीक्षण (Demo) चरणमा छ। पछि जल तथा मौसम विज्ञान विभाग (DHM) को API सँग प्रत्यक्ष जोडिनेछ।
          </p>
        </div>

        {/* Station Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
          {stations.map(station => {
            const statusColor = getStatusColor(station.status);
            return (
              <div key={station.id} style={{ 
                backgroundColor: 'white', 
                borderRadius: '16px', 
                border: '1px solid #E2E8F0',
                boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                overflow: 'hidden'
              }}>
                {/* Card Header */}
                <div style={{ 
                  padding: '1rem 1rem 0.5rem', 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'flex-start'
                }}>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <div style={{ 
                      width: '40px', 
                      height: '40px', 
                      borderRadius: '10px', 
                      backgroundColor: '#F1F5F9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <MapPin size={20} color="#64748B" />
                    </div>
                    <div>
                      <h3 style={{ margin: '0 0 2px 0', fontSize: '0.95rem', fontWeight: 800, color: '#1E293B' }}>
                        {station.name}
                      </h3>
                      <span style={{ fontSize: '0.65rem', color: '#94A3B8', fontWeight: 600 }}>
                        पछिल्लो अपडेट: {station.lastUpdated}
                      </span>
                    </div>
                  </div>
                  
                  {/* Status Badge */}
                  <div style={{ 
                    backgroundColor: statusColor.bg, 
                    color: statusColor.text, 
                    border: `1px solid ${statusColor.border}`,
                    padding: '0.2rem 0.6rem',
                    borderRadius: '20px',
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    {station.status === 'Danger' && <AlertTriangle size={10} />}
                    {statusColor.label}
                  </div>
                </div>

                {/* Weather Data Grid */}
                <div style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Thermometer size={16} color="#EF4444" />
                      <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#1E293B' }}>{station.temp}°C</span>
                      <span style={{ fontSize: '0.7rem', color: '#64748B' }}>तापक्रम</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Droplets size={16} color="#38BDF8" />
                      <span style={{ fontSize: '1rem', fontWeight: 800, color: '#1E293B' }}>{station.rainfall24h} mm</span>
                      <span style={{ fontSize: '0.7rem', color: '#64748B' }}>(२४ घन्टा)</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                    {getWeatherIcon(station.forecast)}
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#475569', textAlign: 'center', maxWidth: '100px' }}>
                      {station.forecast}
                    </span>
                  </div>
                </div>

                {/* Footer Metrics */}
                <div style={{ 
                  backgroundColor: '#F8FAFC', 
                  padding: '0.6rem 1rem', 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr', 
                  gap: '1rem',
                  borderTop: '1px solid #F1F5F9' 
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CloudRain size={14} color="#6366F1" />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.6rem', color: '#94A3B8', fontWeight: 600 }}>१ घण्टाको वर्षा</span>
                      <span style={{ fontSize: '0.75rem', color: '#1E293B', fontWeight: 800 }}>{station.rainfall1h} mm</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Wind size={14} color="#14B8A6" />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.6rem', color: '#94A3B8', fontWeight: 600 }}>आर्द्रता (Humidity)</span>
                      <span style={{ fontSize: '0.75rem', color: '#1E293B', fontWeight: 800 }}>{station.humidity}%</span>
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
