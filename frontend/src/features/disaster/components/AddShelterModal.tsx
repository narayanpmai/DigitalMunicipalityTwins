import React, { useState, useEffect } from 'react';
import { X, Tent, MapPin, Phone, Users, Droplets, Zap } from 'lucide-react';
import type { Shelter } from '../../../api/disaster';

interface AddShelterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Shelter>) => void;
  initialData?: Shelter | null;
  isLoading?: boolean;
}

export const AddShelterModal: React.FC<AddShelterModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<Partial<Shelter>>({
    name: '',
    wardNumber: 4,
    location: '',
    capacity: 200,
    hasWater: true,
    hasPowerBackup: true,
    contactPerson: '',
    contactPhone: '',
    lat: 27.9785,
    lng: 85.7325,
    status: 'active',
    facilitiesDescription: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        name: '',
        wardNumber: 4,
        location: '',
        capacity: 200,
        hasWater: true,
        hasPowerBackup: true,
        contactPerson: '',
        contactPhone: '',
        lat: 27.9785,
        lng: 85.7325,
        status: 'active',
        facilitiesDescription: '',
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
          maxWidth: '560px',
          maxHeight: '90vh',
          overflowY: 'auto',
          backgroundColor: '#ffffff',
          borderRadius: '14px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          padding: '1.5rem',
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
              color: '#15803d',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              margin: 0,
            }}
          >
            <Tent size={22} color="#16a34a" />
            {initialData ? 'सुरक्षित आश्रयस्थल सम्पादन गर्नुहोस्' : 'नयाँ सुरक्षित आश्रयस्थल दर्ता गर्नुहोस्'}
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
              आश्रयस्थलको नाम *
            </label>
            <input
              type="text"
              required
              placeholder="उदा. थाङपाल भ्याली मा.वि. सुरक्षित आश्रयस्थल"
              className="dt-input"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                वडा नं. *
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
                स्थान / टोल *
              </label>
              <input
                type="text"
                required
                placeholder="उदा. मानेखर्क बजार"
                className="dt-input"
                value={formData.location || ''}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                क्षमता (जना) *
              </label>
              <input
                type="number"
                required
                min={10}
                placeholder="उदा. २५०"
                className="dt-input"
                value={formData.capacity || ''}
                onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                सञ्चालन अवस्था (Status)
              </label>
              <select
                className="dt-input"
                value={formData.status || 'active'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                style={{ width: '100%' }}
              >
                <option value="active">सक्रिय (Active)</option>
                <option value="standby">तयारी अवस्था (Standby)</option>
                <option value="full">भरिएको (Full)</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                सम्पर्क व्यक्ति (Focal Person)
              </label>
              <input
                type="text"
                placeholder="उदा. ङावाङ दावा लामा"
                className="dt-input"
                value={formData.contactPerson || ''}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                सम्पर्क फोन नम्बर
              </label>
              <input
                type="text"
                placeholder="९८५११*****"
                className="dt-input"
                value={formData.contactPhone || ''}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                अक्षांश (Latitude - GIS)
              </label>
              <input
                type="number"
                step="any"
                placeholder="२७.९७८५"
                className="dt-input"
                value={formData.lat ?? ''}
                onChange={(e) => setFormData({ ...formData, lat: parseFloat(e.target.value) || undefined })}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                देशान्तर (Longitude - GIS)
              </label>
              <input
                type="number"
                step="any"
                placeholder="८५.७३२५"
                className="dt-input"
                value={formData.lng ?? ''}
                onChange={(e) => setFormData({ ...formData, lng: parseFloat(e.target.value) || undefined })}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', padding: '0.5rem 0' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={!!formData.hasWater}
                onChange={(e) => setFormData({ ...formData, hasWater: e.target.checked })}
              />
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Droplets size={16} color="#0284c7" /> खानेपानी सुविधा उपलब्ध
              </span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={!!formData.hasPowerBackup}
                onChange={(e) => setFormData({ ...formData, hasPowerBackup: e.target.checked })}
              />
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Zap size={16} color="#eab308" /> बत्ती / सोलार ब्याकअप उपलब्ध
              </span>
            </label>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>
              उपलब्ध अन्य सुविधाहरू तथा थप विवरण
            </label>
            <textarea
              className="dt-input"
              rows={2}
              placeholder="उदा. ४ वटा पक्की हल, ५००० लिटर ट्याङ्की, प्राथमिक उपचार किट..."
              value={formData.facilitiesDescription || ''}
              onChange={(e) => setFormData({ ...formData, facilitiesDescription: e.target.value })}
              style={{ width: '100%' }}
            />
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '0.5rem',
              marginTop: '0.75rem',
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
              style={{ backgroundColor: '#16a34a', color: '#ffffff', fontWeight: 600 }}
            >
              {isLoading ? 'सुरक्षित हुँदैछ...' : initialData ? 'अद्यावधिक गर्नुहोस्' : 'आश्रयस्थल सुरक्षित गर्नुहोस्'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
