import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Layers, AlertTriangle, Crosshair, Loader2 } from 'lucide-react';
import './MunicipalGISMap.css';

// Fix for default marker icon in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// A component to handle map clicks
const MapClickHandler = ({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

export const MunicipalGISMap: React.FC = () => {
  const [clickedPos, setClickedPos] = useState<{lat: number, lng: number} | null>(null);
  const [bufferData, setBufferData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [riskData, setRiskData] = useState<any>(null);
  const [activeTool, setActiveTool] = useState<'buffer' | 'risk'>('buffer');

  // Center of Narayan Municipality (approximate)
  const mapCenter: [number, number] = [28.7667, 81.6500];

  const handleMapClick = async (lat: number, lng: number) => {
    if (activeTool !== 'buffer') return;
    
    setClickedPos({lat, lng});
    setIsLoading(true);
    setBufferData(null);

    try {
      const response = await fetch('/api/v1/gis/buffer-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat, lng, buffer_meters: 500.0 })
      });
      const data = await response.json();
      setBufferData(data.geojson);
    } catch (error) {
      console.error("GIS Buffer Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeRisk = async (wardNo: number) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/v1/gis/risk-zoning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ward_no: wardNo, hazard_type: 'flood' })
      });
      const data = await response.json();
      setRiskData(data);
    } catch (error) {
      console.error("GIS Risk Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="gis-dashboard-container">
      {/* Left Control Panel */}
      <div className="gis-control-panel glass-panel">
        <div className="gis-header">
          <h2 className="gis-title"><Layers size={20} /> GIS स्थानिक विश्लेषण</h2>
          <p className="gis-subtitle">नक्सामा क्लिक गरेर Buffer Analysis वा Flood Risk Zoning हेर्नुहोस्।</p>
        </div>

        <div>
          <p className="gis-section-label">विश्लेषण उपकरण</p>
          <div className="gis-tools">
            <button
              className={`gis-btn ${activeTool === 'buffer' ? 'active' : ''}`}
              onClick={() => setActiveTool('buffer')}
            >
              <Crosshair size={16} /> Buffer Analysis (५०० मिटर)
            </button>
            <button
              className={`gis-btn ${activeTool === 'risk' ? 'active' : ''}`}
              onClick={() => {
                setActiveTool('risk');
                analyzeRisk(4);
              }}
            >
              <AlertTriangle size={16} /> बाढी जोखिम क्षेत्र (वडा ४)
            </button>
          </div>
        </div>

        {isLoading && (
          <div className="gis-loading">
            <Loader2 className="spin" size={16} /> स्थानिक तथ्यांक विश्लेषण गर्दैछ...
          </div>
        )}

        {/* Risk Info Panel */}
        {activeTool === 'risk' && riskData && (
          <div className={`risk-info-card risk-${riskData.risk_level}`}>
            <h4>वडा {riskData.ward_no} — {riskData.hazard_type === 'flood' ? 'बाढी' : riskData.hazard_type} जोखिम</h4>
            <p><strong>जोखिम स्तर:</strong> {riskData.risk_level === 'high' ? 'उच्च 🔴' : riskData.risk_level === 'medium' ? 'मध्यम 🟡' : 'न्यून 🟢'}</p>
            <p><strong>सुरक्षित क्षेत्र संख्या:</strong> {riskData.safe_zones_count}</p>
            <p><strong>निकासी केन्द्र:</strong> {riskData.evacuation_center}</p>
            <div className="risk-action">{riskData.recommended_action}</div>
          </div>
        )}

        {/* Buffer Info Panel */}
        {activeTool === 'buffer' && bufferData && (
          <div className="buffer-info-card">
            <h4>✅ Buffer क्षेत्र तयार भयो</h4>
            <p>५०० मिटरको प्रभाव क्षेत्र नक्सामा देखाइएको छ।</p>
            <p>यसबाट प्रभावित घरधुरी र पूर्वाधारको अनुमान गर्न सकिन्छ।</p>
          </div>
        )}
      </div>

      {/* Map Container */}
      <div className="map-wrapper">
        <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
          />
          <MapClickHandler onMapClick={handleMapClick} />
          
          {clickedPos && (
            <Marker position={[clickedPos.lat, clickedPos.lng]}>
              <Popup>Selected Point: <br/>{clickedPos.lat.toFixed(4)}, {clickedPos.lng.toFixed(4)}</Popup>
            </Marker>
          )}

          {bufferData && (
            <GeoJSON 
              data={bufferData} 
              style={{
                color: '#3b82f6',
                weight: 2,
                opacity: 0.8,
                fillColor: '#60a5fa',
                fillOpacity: 0.3
              }}
            />
          )}
        </MapContainer>
        
        <div className="map-instructions">
          {activeTool === 'buffer'
            ? '🖱️ नक्सामा क्लिक गर्नुहोस् — ५०० मिटर Buffer क्षेत्र देखाइनेछ।'
            : '⚠️ बाढी जोखिम क्षेत्र हेर्दैछ। (वडा ४ रङ्गीन नक्सा यहाँ देखिनेछ।)'}
        </div>
      </div>
    </div>
  );
};
