import React, { useState } from 'react';
import { X, PhoneCall } from 'lucide-react';
import type { EmergencyContact } from '../../../api/disaster';

interface EmergencyContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<EmergencyContact>) => void;
  isLoading?: boolean;
}

export const EmergencyContactModal: React.FC<EmergencyContactModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<Partial<EmergencyContact>>({
    name: '',
    role: '',
    phone: '',
    wardNumber: 1,
    department: 'विपद् व्यवस्थापन',
  });

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
          maxWidth: '500px',
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
              fontSize: '1.2rem',
              fontWeight: 700,
              color: '#9f1239',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <PhoneCall size={20} color="#e11d48" />
            नयाँ आपतकालीन सम्पर्क नम्बर थप्नुहोस्
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
              सम्पर्क व्यक्ति / संस्थाको नाम *
            </label>
            <input
              type="text"
              required
              placeholder="उदा. इलाका प्रहरी कार्यालय वा सुनिता तामाङ"
              className="dt-input"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>
              पद वा भूमिका *
            </label>
            <input
              type="text"
              required
              placeholder="उदा. विपद् फोकल पर्सन वा एम्बुलेन्स चालक"
              className="dt-input"
              value={formData.role || ''}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                सम्पर्क फोन नम्बर *
              </label>
              <input
                type="text"
                required
                placeholder="९८४१****** वा ०११-४६०१२३"
                className="dt-input"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                सम्बन्धित वडा नं.
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
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>
              निकाय / शाखा (Department)
            </label>
            <input
              type="text"
              placeholder="उदा. नेपाल प्रहरी / स्वास्थ्य शाखा / रेडक्रस"
              className="dt-input"
              value={formData.department || ''}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              style={{ width: '100%' }}
            />
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
              style={{ backgroundColor: '#e11d48', color: '#ffffff' }}
            >
              {isLoading ? 'थप्दैछ...' : 'सुरक्षित गर्नुहोस्'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
