import React from 'react';
import { MunicipalGISMap } from '../../components/maps/MunicipalGISMap';
import { MunicipalAIAssistant } from '../../components/chat/MunicipalAIAssistant';
import { PredictiveAnalytics } from '../../components/analytics/PredictiveAnalytics';

export const AIDemoPage: React.FC = () => {
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {/* Full screen GIS Map */}
      <div style={{ height: '70vh' }}>
        <MunicipalGISMap />
      </div>

      {/* Analytics Dashboard Below Map */}
      <PredictiveAnalytics />
      
      {/* Floating AI Chat Assistant */}
      <MunicipalAIAssistant />
    </div>
  );
};
