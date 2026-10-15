import React, { useState, useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import type { DisasterEvent } from '../../../api/disaster';

interface DisasterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<DisasterEvent>) => void;
  initialData?: DisasterEvent | null;
  isLoading?: boolean;
}

export const DisasterModal: React.FC<DisasterModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<Partial<DisasterEvent>>({
    title: '',
    type: 'landslide',
    wardNumber: 1,
    severity: 'medium',
    status: 'active',
    description: '',
    tolsSettlement: '',
    affectedHouseholds: 0,
    humanCasualties: 0,
    missingPersons: 0,
    injuredCount: 0,
    livestockLossCount: 0,
    fullyDamagedHouses: 0,
    partiallyDamagedHouses: 0,
    estimatedLossNPR: 0,
    reliefStatus: 'निगरानी तथा समन्वय',
    reliefMaterials: '',
    reliefDisbursedNPR: 0,
    rescueTeam: '',
    reporterName: '',
    reporterPhone: '',
    incidentDateBs: '२०८१-०५-०१',
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        title: '',
        type: 'landslide',
        wardNumber: 1,
        severity: 'medium',
        status: 'active',
        description: '',
        tolsSettlement: '',
        affectedHouseholds: 0,
        humanCasualties: 0,
        missingPersons: 0,
        injuredCount: 0,
        livestockLossCount: 0,
        fullyDamagedHouses: 0,
        partiallyDamagedHouses: 0,
        estimatedLossNPR: 0,
        reliefStatus: 'निगरानी तथा समन्वय',
        reliefMaterials: '',
        reliefDisbursedNPR: 0,
        rescueTeam: '',
        reporterName: '',
        reporterPhone: '',
        incidentDateBs: '२०८१-०५-०१',
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(4px)',
        padding: '1rem',
      }}
    >
      <div
        className="dt-card"
        style={{
          width: '100%',
          maxWidth: '680px',
          maxHeight: '90vh',
          overflowY: 'auto',
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid #e2e8f0',
            paddingBottom: '1rem',
            marginBottom: '1rem',
          }}
        >
          <h2
            style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              color: '#991b1b',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <AlertTriangle size={22} color="#dc2626" />
            {initialData ? 'विपद् घटना सम्पादन गर्नुहोस्' : 'नयाँ विपद् घटना / अलर्ट दर्ता'}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#64748b',
            }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>
              विपद् घटना / चेतावनीको शीर्षक *
            </label>
            <input
              type="text"
              required
              placeholder="उदा. मेलम्ची खोला बाढी सतर्कता वा मानेखर्क पहिरो"
              className="dt-input"
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                विपद् प्रकार *
              </label>
              <select
                className="dt-input"
                value={formData.type || 'landslide'}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as DisasterEvent['type'] })}
                style={{ width: '100%' }}
              >
                <option value="landslide">पहिरो (Landslide)</option>
                <option value="flood">बाढी तथा कटान (Flood)</option>
                <option value="fire">आगलागी / डढेलो (Fire)</option>
                <option value="earthquake">भूकम्प कम्पन (Earthquake)</option>
                <option value="accident">सडक दुर्घटना (Accident)</option>
                <option value="other">भारी हिमपात / अन्य (Other)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                सम्बन्धित वडा नं. *
              </label>
              <select
                className="dt-input"
                value={formData.wardNumber || 1}
                onChange={(e) => setFormData({ ...formData, wardNumber: Number(e.target.value) })}
                style={{ width: '100%' }}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((w) => (
                  <option key={w} value={w}>
                    वडा नं. {w}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                जोखिम स्तर (Severity) *
              </label>
              <select
                className="dt-input"
                value={formData.severity || 'medium'}
                onChange={(e) => setFormData({ ...formData, severity: e.target.value as DisasterEvent['severity'] })}
                style={{ width: '100%' }}
              >
                <option value="low">सामान्य (Low)</option>
                <option value="medium">मध्यम जोखिम (Medium)</option>
                <option value="high">उच्च सतर्कता (High)</option>
                <option value="critical">अति संवेदनशील (Critical)</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                घटना स्थिति (Status) *
              </label>
              <select
                className="dt-input"
                value={formData.status || 'active'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as DisasterEvent['status'] })}
                style={{ width: '100%' }}
              >
                <option value="active">सक्रिय (Active / Monitoring)</option>
                <option value="resolved">नियन्त्रित / समाधान भएको (Resolved)</option>
                <option value="cancelled">रद्द / सूचना समाप्त (Cancelled)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                घटना मिति (B.S.)
              </label>
              <input
                type="text"
                placeholder="२०८१-०५-०१"
                className="dt-input"
                value={formData.incidentDateBs || ''}
                onChange={(e) => setFormData({ ...formData, incidentDateBs: e.target.value })}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>
              घटनाको विस्तृत विवरण
            </label>
            <textarea
              rows={3}
              placeholder="घटनाको प्रकृति, भौगोलिक अवस्था, बाटो अवरोध वा जोखिम स्थिति..."
              className="dt-input"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                प्रभावित बस्ती / टोल
              </label>
              <input
                type="text"
                placeholder="उदा. मानेखर्क, तिम्बु, भोताङ माथिल्लो टोल"
                className="dt-input"
                value={formData.tolsSettlement || ''}
                onChange={(e) => setFormData({ ...formData, tolsSettlement: e.target.value })}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                प्रभावित घरधुरी
              </label>
              <input
                type="number"
                className="dt-input"
                value={formData.affectedHouseholds ?? 0}
                onChange={(e) => setFormData({ ...formData, affectedHouseholds: Number(e.target.value) })}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          {/* Municipal Damage & Loss Assessment (मानवीय तथा भौतिक क्षति विवरण) */}
          <div style={{ backgroundColor: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '8px', padding: '0.85rem' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#9f1239', marginBottom: '0.6rem' }}>
              ⚠️ मानवीय, पशुधन तथा संरचनागत क्षति मूल्याङ्कन
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.65rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: 600, color: '#9f1239', marginBottom: '0.2rem' }}>
                  मृतक संख्या
                </label>
                <input
                  type="number"
                  className="dt-input"
                  value={formData.humanCasualties ?? 0}
                  onChange={(e) => setFormData({ ...formData, humanCasualties: Number(e.target.value) })}
                  style={{ width: '100%', borderColor: '#fca5a5' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: 600, color: '#9f1239', marginBottom: '0.2rem' }}>
                  बेपत्ता संख्या
                </label>
                <input
                  type="number"
                  className="dt-input"
                  value={formData.missingPersons ?? 0}
                  onChange={(e) => setFormData({ ...formData, missingPersons: Number(e.target.value) })}
                  style={{ width: '100%', borderColor: '#fca5a5' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: 600, color: '#9f1239', marginBottom: '0.2rem' }}>
                  घाइते संख्या
                </label>
                <input
                  type="number"
                  className="dt-input"
                  value={formData.injuredCount ?? 0}
                  onChange={(e) => setFormData({ ...formData, injuredCount: Number(e.target.value) })}
                  style={{ width: '100%', borderColor: '#fca5a5' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: 600, color: '#9f1239', marginBottom: '0.2rem' }}>
                  पशुधन क्षति
                </label>
                <input
                  type="number"
                  className="dt-input"
                  placeholder="चौपाया"
                  value={formData.livestockLossCount ?? 0}
                  onChange={(e) => setFormData({ ...formData, livestockLossCount: Number(e.target.value) })}
                  style={{ width: '100%', borderColor: '#fca5a5' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: 600, color: '#9f1239', marginBottom: '0.2rem' }}>
                  पूर्ण क्षति घर
                </label>
                <input
                  type="number"
                  className="dt-input"
                  value={formData.fullyDamagedHouses ?? 0}
                  onChange={(e) => setFormData({ ...formData, fullyDamagedHouses: Number(e.target.value) })}
                  style={{ width: '100%', borderColor: '#fca5a5' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: 600, color: '#9f1239', marginBottom: '0.2rem' }}>
                  आंशिक क्षति घर
                </label>
                <input
                  type="number"
                  className="dt-input"
                  value={formData.partiallyDamagedHouses ?? 0}
                  onChange={(e) => setFormData({ ...formData, partiallyDamagedHouses: Number(e.target.value) })}
                  style={{ width: '100%', borderColor: '#fca5a5' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.65rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: 600, color: '#9f1239', marginBottom: '0.2rem' }}>
                  अनुमानित भौतिक क्षति (रु.)
                </label>
                <input
                  type="number"
                  className="dt-input"
                  value={formData.estimatedLossNPR ?? 0}
                  onChange={(e) => setFormData({ ...formData, estimatedLossNPR: Number(e.target.value) })}
                  style={{ width: '100%', borderColor: '#fca5a5' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: 600, color: '#9f1239', marginBottom: '0.2rem' }}>
                  पालिका कोषबाट निकासा राहत (रु.)
                </label>
                <input
                  type="number"
                  placeholder="उदा. ५००००"
                  className="dt-input"
                  value={formData.reliefDisbursedNPR ?? 0}
                  onChange={(e) => setFormData({ ...formData, reliefDisbursedNPR: Number(e.target.value) })}
                  style={{ width: '100%', borderColor: '#fca5a5' }}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                राहत तथा प्रतिकार्य स्थिति
              </label>
              <input
                type="text"
                placeholder="उदा. सुरक्षित स्थानान्तरण / राहत वितरण जारी"
                className="dt-input"
                value={formData.reliefStatus || ''}
                onChange={(e) => setFormData({ ...formData, reliefStatus: e.target.value })}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                परिचालित उद्धार टोली
              </label>
              <input
                type="text"
                placeholder="उदा. नेपाल प्रहरी, रेडक्रस, स्थानीय स्वयंसेवक"
                className="dt-input"
                value={formData.rescueTeam || ''}
                onChange={(e) => setFormData({ ...formData, rescueTeam: e.target.value })}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                सूचना संकलनकर्ता / रिपोर्टर
              </label>
              <input
                type="text"
                placeholder="नाम"
                className="dt-input"
                value={formData.reporterName || ''}
                onChange={(e) => setFormData({ ...formData, reporterName: e.target.value })}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                सम्पर्क फोन नम्बर
              </label>
              <input
                type="text"
                placeholder="९८४१******"
                className="dt-input"
                value={formData.reporterPhone || ''}
                onChange={(e) => setFormData({ ...formData, reporterPhone: e.target.value })}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '0.5rem',
              marginTop: '1rem',
              borderTop: '1px solid #e2e8f0',
              paddingTop: '1rem',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              className="dt-btn"
              style={{ backgroundColor: '#f1f5f9', color: '#475569' }}
            >
              रद्द गर्नुहोस्
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="dt-btn"
              style={{ backgroundColor: '#dc2626', color: '#ffffff' }}
            >
              {isLoading ? 'प्रक्रियामा...' : initialData ? 'अपडेट गर्नुहोस्' : 'दर्ता गर्नुहोस्'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
