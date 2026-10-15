import React, { useState } from 'react';
import { BadapatraPage } from '../../features/badapatra/BadapatraPage';
import { CitizenServicesPage } from '../../features/citizen-services/CitizenServicesPage';
import { FileText, Award, Layers, Sparkles, CheckCircle2 } from 'lucide-react';
import { DynamicServiceForm } from '../../components/common/DynamicServiceForm';
import './CitizenServices.css';

export const CitizenServices: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'sifarish' | 'badapatra' | 'dynamic'>('dynamic');

  return (
    <div className="citizen-services-wrapper">
      {/* Page Title & Intro */}
      <div className="citizen-services-header">
        <h1>
          <span>नागरिक सेवा तथा डिजिटल बडापत्र केन्द्र</span>
        </h1>
        <p>
          एकीकृत अनलाइन सेवा प्रणाली, डिजिटल सिफारिस र बडापत्रमार्फत पालिकाका सम्पूर्ण सार्वजनिक सेवाहरू एकै थलोबाट।
        </p>
      </div>

      {/* Top Navigation Tabs - 3-Column Balanced Grid */}
      <div className="citizen-tabs-nav-container">
        <div className="citizen-tabs-grid">
          {/* Tab 1: e-Sifarish */}
          <button
            type="button"
            className={`citizen-tab-btn ${activeSection === 'sifarish' ? 'active' : ''}`}
            onClick={() => setActiveSection('sifarish')}
          >
            <div className="citizen-tab-icon-wrap">
              <FileText size={22} />
            </div>
            <div className="citizen-tab-content">
              <div className="citizen-tab-top-row">
                <span className="citizen-tab-title">नागरिक ई-सिफारिस</span>
                <span className="citizen-tab-badge">२४+ सेवा</span>
              </div>
              <div className="citizen-tab-desc">
                नागरिक ई-सेवा तथा अनलाइन सिफारिस (e-Sifarish)
              </div>
            </div>
          </button>

          {/* Tab 2: Badapatra / Citizen Charter */}
          <button
            type="button"
            className={`citizen-tab-btn ${activeSection === 'badapatra' ? 'active' : ''}`}
            onClick={() => setActiveSection('badapatra')}
          >
            <div className="citizen-tab-icon-wrap">
              <Award size={22} />
            </div>
            <div className="citizen-tab-content">
              <div className="citizen-tab-top-row">
                <span className="citizen-tab-title">डिजिटल नागरिक बडापत्र</span>
                <span className="citizen-tab-badge">११० सेवा</span>
              </div>
              <div className="citizen-tab-desc">
                दस्तुर, समय र आवश्यक कागजात (Citizen Charter)
              </div>
            </div>
          </button>

          {/* Tab 3: Dynamic Services */}
          <button
            type="button"
            className={`citizen-tab-btn ${activeSection === 'dynamic' ? 'active' : ''}`}
            onClick={() => setActiveSection('dynamic')}
          >
            <div className="citizen-tab-icon-wrap">
              <Layers size={22} />
            </div>
            <div className="citizen-tab-content">
              <div className="citizen-tab-top-row">
                <span className="citizen-tab-title">एकीकृत सेवा प्रणाली</span>
                <span className="citizen-tab-badge">द्रुत अनलाइन</span>
              </div>
              <div className="citizen-tab-desc">
                एकीकृत सेवा प्रणाली (Dynamic Services)
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Contextual Status Banner */}
      {activeSection === 'dynamic' && (
        <div className="citizen-section-banner dynamic-theme">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Sparkles size={18} />
            <span><strong>हाल खुला:</strong> एकीकृत सेवा प्रणाली — कृषि, स्वास्थ्य, ई-सिफारिस र व्यवसाय दर्ताको एकीकृत अनलाइन आवेदन।</span>
          </div>
          <span style={{ fontSize: '0.8rem', opacity: 0.85 }}>५-चरणको द्रुत विगार्ड फारम</span>
        </div>
      )}

      {activeSection === 'badapatra' && (
        <div className="citizen-section-banner badapatra-theme">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <CheckCircle2 size={18} />
            <span><strong>हाल खुला:</strong> डिजिटल नागरिक बडापत्र — पालिका केन्द्र तथा १ देखि ८ वटै वडाका सम्पूर्ण ११० सेवाहरूको विवरण।</span>
          </div>
          <span style={{ fontSize: '0.8rem', opacity: 0.85 }}>सार्वजनिक बडापत्र अभिलेख</span>
        </div>
      )}

      {activeSection === 'sifarish' && (
        <div className="citizen-section-banner sifarish-theme">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <FileText size={18} />
            <span><strong>हाल खुला:</strong> नागरिक ई-सिफारिस — नाता प्रमाणित, नागरिकता सिफारिस तथा घरबाटो सिफारिस व्यवस्थापन।</span>
          </div>
          <span style={{ fontSize: '0.8rem', opacity: 0.85 }}>अनलाइन ई-सिफारिस पोर्टल</span>
        </div>
      )}

      {/* Tab Panel Views */}
      <div className="citizen-tab-panel" key={activeSection}>
        {activeSection === 'dynamic' && <DynamicServiceForm />}
        {activeSection === 'sifarish' && <CitizenServicesPage />}
        {activeSection === 'badapatra' && <BadapatraPage readOnly={true} />}
      </div>
    </div>
  );
};

export default CitizenServices;
