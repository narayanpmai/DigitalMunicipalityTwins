import React, { useState, useEffect } from 'react';
import { X, MapPin, Camera, Sparkles, CheckCircle2 } from 'lucide-react';
import { THEMATIC_MODULE_SCHEMAS, type ThematicModuleDef } from '../thematicModuleSchemas';

interface ThematicDynamicFormModalProps {
  initialModuleKey: number;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (recordData: any) => void;
  isPending: boolean;
}

export const ThematicDynamicFormModal: React.FC<ThematicDynamicFormModalProps> = ({
  initialModuleKey,
  isOpen,
  onClose,
  onSubmit,
  isPending,
}) => {
  const [selectedModuleKey, setSelectedModuleKey] = useState<number>(initialModuleKey || 20);

  // Universal Mandatory Fields State
  const [universalData, setUniversalData] = useState({
    assetUniqueId: '',
    planCode: '',
    fiscalYear: '२०८०/०८१',
    wardNumber: 3,
    toleBasti: '',
    startDate: '२०८०/०१/१५',
    completionDate: '२०८०/११/२०',
    contractorOrCommittee: 'स्थानीय उपभोक्ता समिति',
    constructionCost: 4500000,
    expenditureAmount: 4350000,
    physicalProgressPercent: 100,
    beneficiaryHouseholds: 350,
    beneficiaryPopulation: 1600,
    condition: 'excellent',
    lastMaintenanceDate: '२०८१/०२/१०',
    responsibleAgency: 'पाँचपोखरी थाङपाल गाउँ कार्यपालिकाको कार्यालय',
    lat: 27.9745,
    lng: 85.7489,
    gpsAccuracy: 1.5,
    elevationMeters: 1680,
    geomType: 'point',
    beforePhotoUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156a?w=800',
    afterPhotoUrl: 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=800',
    videoUrl: '',
    dronePhotoUrl: '',
    digitalSignature: 'योजना शाखा प्रमुख / प्राविधिक अधिकृत',
  });

  // Dynamic Thematic Specific Fields State
  const [thematicValues, setThematicValues] = useState<Record<string, any>>({});
  const [assetName, setAssetName] = useState('');

  const currentModuleDef: ThematicModuleDef =
    THEMATIC_MODULE_SCHEMAS.find((m) => m.key === selectedModuleKey) || THEMATIC_MODULE_SCHEMAS[0];

  // Initialize or update fields when module changes
  useEffect(() => {
    if (initialModuleKey) {
      setSelectedModuleKey(initialModuleKey);
    }
  }, [initialModuleKey]);

  useEffect(() => {
    const defaults: Record<string, any> = {};
    currentModuleDef.fields.forEach((f) => {
      defaults[f.id] = f.defaultValue !== undefined ? f.defaultValue : f.type === 'boolean' ? true : '';
    });
    setThematicValues(defaults);

    // Default asset name template
    if (!assetName || assetName.includes('पुल') || assetName.includes('विद्यालय') || assetName.includes('योजना')) {
      setAssetName(`${currentModuleDef.title} - वडा नं. ${universalData.wardNumber}`);
    }

    // Default Unique ID template
    setUniversalData((prev) => ({
      ...prev,
      assetUniqueId: `P5-M${currentModuleDef.key}-W${prev.wardNumber}-${Date.now().toString().slice(-4)}`,
      planCode: `P5-W${prev.wardNumber}-PLN-${currentModuleDef.key}`,
    }));
  }, [selectedModuleKey]);

  if (!isOpen) return null;

  const handleFieldChange = (fieldId: string, value: any) => {
    setThematicValues((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleUniversalChange = (field: string, value: any) => {
    setUniversalData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetName.trim()) {
      alert('कृपया सम्पत्ति / योजनाको नाम अनिवार्य रूपमा लेख्नुहोस्!');
      return;
    }

    const payload = {
      ...universalData,
      assetName,
      moduleKey: currentModuleDef.key,
      moduleTitleNepali: currentModuleDef.title,
      thematicData: thematicValues,
      constructionCost: Number(universalData.constructionCost),
      expenditureAmount: Number(universalData.expenditureAmount),
      physicalProgressPercent: Number(universalData.physicalProgressPercent),
      beneficiaryHouseholds: Number(universalData.beneficiaryHouseholds),
      beneficiaryPopulation: Number(universalData.beneficiaryPopulation),
      lat: Number(universalData.lat),
      lng: Number(universalData.lng),
      gpsAccuracy: Number(universalData.gpsAccuracy),
      elevationMeters: Number(universalData.elevationMeters),
    };

    onSubmit(payload);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1200,
        padding: '1rem',
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          maxWidth: '920px',
          width: '100%',
          maxHeight: '92vh',
          overflowY: 'auto',
          boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '1.25rem 1.75rem',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#0F4C81',
            color: '#ffffff',
            borderTopLeftRadius: '16px',
            borderTopRightRadius: '16px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
              <span style={{ fontSize: '0.75rem', backgroundColor: 'rgba(255,255,255,0.2)', padding: '0.15rem 0.6rem', borderRadius: '12px', fontWeight: 700 }}>
                मोड्युल नं. {currentModuleDef.key} • {currentModuleDef.category}
              </span>
              <span style={{ fontSize: '0.75rem', opacity: 0.9 }}>
                डाटामा आधारित राजनीति र प्रमाणमा आधारित विकास
              </span>
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
              {currentModuleDef.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ffffff', opacity: 0.8 }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Module Switcher Dropdown */}
          <div style={{ backgroundColor: '#F8FAFC', padding: '1rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0F4C81', display: 'block', marginBottom: '0.4rem' }}>
              विषयगत मोड्युल परिवर्तन गर्नुहोस् (Change Module)
            </label>
            <select
              value={selectedModuleKey}
              onChange={(e) => setSelectedModuleKey(Number(e.target.value))}
              style={{
                width: '100%',
                padding: '0.55rem 0.85rem',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                fontSize: '0.875rem',
                fontWeight: 600,
                backgroundColor: '#ffffff',
              }}
            >
              {THEMATIC_MODULE_SCHEMAS.map((m) => (
                <option key={m.key} value={m.key}>
                  {m.key}. {m.title} [{m.category}]
                </option>
              ))}
            </select>
          </div>

          {/* ══════════════════════════════════════════════════════════════ */}
          {/* खण्ड १: अनिवार्य साझा विवरणहरू (UNIVERSAL MANDATORY FIELDS)   */}
          {/* ══════════════════════════════════════════════════════════════ */}
          <div style={{ border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1.25rem', backgroundColor: '#ffffff' }}>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F4C81', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={18} color="#0F4C81" />
              <span>खण्ड १: अनिवार्य सम्पत्ति तथा आयोजना विवरण (Universal Mandatory Fields)</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: '0.25rem' }}>
                  सम्पत्ति / योजनाको नाम*
                </label>
                <input
                  type="text"
                  required
                  placeholder="उदा: याङरी खोला झोलुङ्गे पुल निर्माण"
                  value={assetName}
                  onChange={(e) => setAssetName(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: '0.25rem' }}>
                  सम्पत्तिको Unique ID*
                </label>
                <input
                  type="text"
                  required
                  value={universalData.assetUniqueId}
                  onChange={(e) => handleUniversalChange('assetUniqueId', e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.85rem', fontFamily: 'monospace', fontWeight: 700 }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: '0.25rem' }}>
                  योजना कोड (Plan Code)
                </label>
                <input
                  type="text"
                  value={universalData.planCode}
                  onChange={(e) => handleUniversalChange('planCode', e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: '0.25rem' }}>
                  आर्थिक वर्ष*
                </label>
                <select
                  value={universalData.fiscalYear}
                  onChange={(e) => handleUniversalChange('fiscalYear', e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.85rem' }}
                >
                  <option value="२०८०/०८१">आ.व. २०८०/०८१</option>
                  <option value="२०८१/०८२">आ.व. २०८१/०८२</option>
                  <option value="२०७९/०८०">आ.व. २०७९/०८०</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: '0.25rem' }}>
                  वडा नं.*
                </label>
                <select
                  value={universalData.wardNumber}
                  onChange={(e) => handleUniversalChange('wardNumber', Number(e.target.value))}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.85rem' }}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((w) => (
                    <option key={w} value={w}>वडा नं. {w}</option>
                  ))}
                  <option value={0}>पालिकास्तर</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: '0.25rem' }}>
                  टोल / बस्ती (Tole/Basti)
                </label>
                <input
                  type="text"
                  placeholder="उदा: याङरी बजार"
                  value={universalData.toleBasti}
                  onChange={(e) => handleUniversalChange('toleBasti', e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: '0.25rem' }}>
                  निर्माण लागत (रु)*
                </label>
                <input
                  type="number"
                  value={universalData.constructionCost}
                  onChange={(e) => handleUniversalChange('constructionCost', e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: '0.25rem' }}>
                  हालसम्मको खर्च (रु)*
                </label>
                <input
                  type="number"
                  value={universalData.expenditureAmount}
                  onChange={(e) => handleUniversalChange('expenditureAmount', e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: '0.25rem' }}>
                  कार्य सम्पन्न प्रतिशत (%)*
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={universalData.physicalProgressPercent}
                  onChange={(e) => handleUniversalChange('physicalProgressPercent', e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: '0.25rem' }}>
                  हालको अवस्था (Condition)*
                </label>
                <select
                  value={universalData.condition}
                  onChange={(e) => handleUniversalChange('condition', e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.85rem' }}
                >
                  <option value="excellent">उत्कृष्ट (Excellent)</option>
                  <option value="good">राम्रो (Good)</option>
                  <option value="fair">सामान्य (Fair)</option>
                  <option value="needs_repair">मर्मत आवश्यक (Needs Repair)</option>
                  <option value="abandoned">प्रयोगविहीन (Abandoned)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: '0.25rem' }}>
                  लाभान्वित घरधुरी संख्या
                </label>
                <input
                  type="number"
                  value={universalData.beneficiaryHouseholds}
                  onChange={(e) => handleUniversalChange('beneficiaryHouseholds', e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: '0.25rem' }}>
                  लाभान्वित जनसंख्या (व्यक्ति)
                </label>
                <input
                  type="number"
                  value={universalData.beneficiaryPopulation}
                  onChange={(e) => handleUniversalChange('beneficiaryPopulation', e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.85rem' }}
                />
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════════ */}
          {/* खण्ड २: विषयगत विशिष्ट विवरणहरू (DYNAMIC THEMATIC FIELDS)      */}
          {/* ══════════════════════════════════════════════════════════════ */}
          <div style={{ border: '1px solid #BCD5EB', borderRadius: '12px', padding: '1.25rem', backgroundColor: '#F0F7FD' }}>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F4C81', borderBottom: '1px solid #BCD5EB', paddingBottom: '0.5rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={18} color="#0F4C81" />
                <span>खण्ड २: {currentModuleDef.title} का विशिष्ट सूचक तथा विवरणहरू</span>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#0F4C81', fontWeight: 600 }}>
                {currentModuleDef.fields.length} वटा विशिष्ट फिल्डहरू
              </span>
            </div>

            {/* Render Every Field of the Selected Module Dynamically! */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              {currentModuleDef.fields.map((f) => (
                <div key={f.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1F2937' }}>
                    {f.label} {f.unit ? `(${f.unit})` : ''} {f.required ? '*' : ''}
                  </label>

                  {f.type === 'text' && (
                    <input
                      type="text"
                      required={f.required}
                      placeholder={f.placeholder || f.label}
                      value={thematicValues[f.id] || ''}
                      onChange={(e) => handleFieldChange(f.id, e.target.value)}
                      style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', backgroundColor: '#ffffff' }}
                    />
                  )}

                  {f.type === 'number' && (
                    <div style={{ position: 'relative' }}>
                      <input
                        type="number"
                        step="any"
                        required={f.required}
                        placeholder={f.placeholder || '0'}
                        value={thematicValues[f.id] !== undefined ? thematicValues[f.id] : ''}
                        onChange={(e) => handleFieldChange(f.id, e.target.value === '' ? '' : Number(e.target.value))}
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', backgroundColor: '#ffffff' }}
                      />
                      {f.unit && (
                        <span style={{ position: 'absolute', right: '10px', top: '8px', fontSize: '0.75rem', color: '#6B7280', fontWeight: 600 }}>
                          {f.unit}
                        </span>
                      )}
                    </div>
                  )}

                  {f.type === 'select' && (
                    <select
                      value={thematicValues[f.id] || f.options?.[0]?.value}
                      onChange={(e) => handleFieldChange(f.id, e.target.value)}
                      style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', backgroundColor: '#ffffff' }}
                    >
                      {f.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  )}

                  {f.type === 'boolean' && (
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.2rem' }}>
                      <button
                        type="button"
                        onClick={() => handleFieldChange(f.id, true)}
                        style={{
                          padding: '0.35rem 0.85rem',
                          borderRadius: '6px',
                          border: `1px solid ${thematicValues[f.id] === true ? '#10B981' : '#CBD5E1'}`,
                          backgroundColor: thematicValues[f.id] === true ? '#ECFDF5' : '#ffffff',
                          color: thematicValues[f.id] === true ? '#065F46' : '#6B7280',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                        }}
                      >
                        ✓ छ / हो (Yes)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleFieldChange(f.id, false)}
                        style={{
                          padding: '0.35rem 0.85rem',
                          borderRadius: '6px',
                          border: `1px solid ${thematicValues[f.id] === false ? '#EF4444' : '#CBD5E1'}`,
                          backgroundColor: thematicValues[f.id] === false ? '#FEF2F2' : '#ffffff',
                          color: thematicValues[f.id] === false ? '#991B1B' : '#6B7280',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                        }}
                      >
                        ✗ छैन / होइन (No)
                      </button>
                    </div>
                  )}

                  {f.type === 'textarea' && (
                    <textarea
                      rows={2}
                      placeholder={f.placeholder || f.label}
                      value={thematicValues[f.id] || ''}
                      onChange={(e) => handleFieldChange(f.id, e.target.value)}
                      style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', backgroundColor: '#ffffff' }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════════ */}
          {/* खण्ड ३: GIS/GPS तथा मिडिया प्रमाण (GIS/MEDIA EVIDENCE)       */}
          {/* ══════════════════════════════════════════════════════════════ */}
          <div style={{ border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1.25rem', backgroundColor: '#ffffff' }}>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F4C81', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Camera size={18} color="#0F4C81" />
              <span>खण्ड ३: GIS/GPS अवस्थिति तथा फोटो/भिडियो प्रमाण (Media Evidence)</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: '0.25rem' }}>
                  GPS Latitude (अक्षांश)
                </label>
                <input
                  type="number"
                  step="any"
                  value={universalData.lat}
                  onChange={(e) => handleUniversalChange('lat', e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: '0.25rem' }}>
                  GPS Longitude (देशान्तर)
                </label>
                <input
                  type="number"
                  step="any"
                  value={universalData.lng}
                  onChange={(e) => handleUniversalChange('lng', e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: '0.25rem' }}>
                  उचाइ Elevation (मिटर)
                </label>
                <input
                  type="number"
                  value={universalData.elevationMeters}
                  onChange={(e) => handleUniversalChange('elevationMeters', e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: '0.25rem' }}>
                  ज्यामिति प्रकार
                </label>
                <select
                  value={universalData.geomType}
                  onChange={(e) => handleUniversalChange('geomType', e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.85rem' }}
                >
                  <option value="point">बिन्दु (Point)</option>
                  <option value="line">रेखा (Line Track)</option>
                  <option value="polygon">क्षेत्रफल (Polygon)</option>
                </select>
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: '0.25rem' }}>
                  Before Photo URL (पहिलेको अवस्थाको फोटो)*
                </label>
                <input
                  type="url"
                  value={universalData.beforePhotoUrl}
                  onChange={(e) => handleUniversalChange('beforePhotoUrl', e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: '0.25rem' }}>
                  After Photo URL (सम्पन्न पछिको फोटो)*
                </label>
                <input
                  type="url"
                  value={universalData.afterPhotoUrl}
                  onChange={(e) => handleUniversalChange('afterPhotoUrl', e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: '0.25rem' }}>
                  भिडियो लिङ्क (Video URL)
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={universalData.videoUrl}
                  onChange={(e) => handleUniversalChange('videoUrl', e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: '0.25rem' }}>
                  डिजिटल हस्ताक्षर / प्रमाणितकर्ता
                </label>
                <input
                  type="text"
                  value={universalData.digitalSignature}
                  onChange={(e) => handleUniversalChange('digitalSignature', e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.85rem' }}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.65rem 1.5rem',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                backgroundColor: '#ffffff',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: 'pointer',
              }}
            >
              रद्द गर्नुहोस्
            </button>

            <button
              type="submit"
              disabled={isPending}
              style={{
                padding: '0.65rem 1.85rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#0F4C81',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(15, 76, 129, 0.3)',
              }}
            >
              {isPending ? 'सेभ हुँदैछ...' : `फाराम सुरक्षित गर्नुहोस् (${currentModuleDef.title})`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
