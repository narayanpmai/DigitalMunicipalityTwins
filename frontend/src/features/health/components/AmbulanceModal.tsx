import React, { useState, useEffect } from 'react';
import { Truck, X, Save, AlertCircle, Phone, MapPin, User, CheckCircle2 } from 'lucide-react';
import { AmbulanceContact } from '../../../types/health';
import { sectoralApi } from '../../../api/sectoral';

interface AmbulanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  ambulanceToEdit?: AmbulanceContact | null;
  onSuccess: () => void;
}

export const AmbulanceModal: React.FC<AmbulanceModalProps> = ({
  isOpen,
  onClose,
  ambulanceToEdit,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    vehicleNumber: '',
    driverName: '',
    contactNumber: '',
    stationLocation: '',
    wardNumber: 1,
    isAvailable: true,
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (ambulanceToEdit) {
      setFormData({
        vehicleNumber: ambulanceToEdit.vehicleNumber || '',
        driverName: ambulanceToEdit.driverName || '',
        contactNumber: ambulanceToEdit.contactNumber || '',
        stationLocation: ambulanceToEdit.stationLocation || '',
        wardNumber: ambulanceToEdit.wardNumber || 1,
        isAvailable: ambulanceToEdit.isAvailable !== undefined ? ambulanceToEdit.isAvailable : true,
        notes: ambulanceToEdit.notes || '',
      });
    } else {
      setFormData({
        vehicleNumber: '',
        driverName: '',
        contactNumber: '',
        stationLocation: '',
        wardNumber: 1,
        isAvailable: true,
        notes: '',
      });
    }
    setErrorMsg('');
  }, [ambulanceToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.vehicleNumber.trim()) {
      setErrorMsg('कृपया सवारी/एम्बुलेन्स नम्बर प्रविष्ट गर्नुहोस्।');
      return;
    }
    if (!formData.driverName.trim()) {
      setErrorMsg('कृपया चालकको नाम प्रविष्ट गर्नुहोस्।');
      return;
    }
    if (!formData.contactNumber.trim()) {
      setErrorMsg('कृपया सम्पर्क/मोबाइल नम्बर प्रविष्ट गर्नुहोस्।');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      if (ambulanceToEdit?.id) {
        await sectoralApi.updateAmbulanceContact(ambulanceToEdit.id, formData);
      } else {
        await sectoralApi.createAmbulanceContact(formData);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'विवरण सुरक्षित गर्दा त्रुटि भयो।');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        padding: '1rem',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '540px',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.2)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
        }}
      >
        {/* Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            color: '#ffffff',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Truck size={22} color="#ffffff" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>
                {ambulanceToEdit ? 'एम्बुलेन्स विवरण सच्याउनुहोस्' : 'नयाँ एम्बुलेन्स थप्नुहोस्'}
              </h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#bae6fd' }}>
                पाँचपोखरी थाङपाल स्वास्थ्य शाखा आकस्मिक सेवा व्यवस्थापन
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="बन्द गर्नुहोस्"
          >
            <X size={20} />
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div
            style={{
              margin: '14px 20px 0 20px',
              padding: '10px 14px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              color: '#dc2626',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Vehicle Number */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
              सवारी / एम्बुलेन्स नम्बर तथा पहिचान <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <Truck size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                required
                value={formData.vehicleNumber}
                onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                placeholder="जस्तै: बा २ झ ५४२१ (गाउँपालिका एम्बुलेन्स)"
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 34px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.85rem',
                  boxSizing: 'border-box',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Driver Name & Phone */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                चालकको नाम <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="text"
                  required
                  value={formData.driverName}
                  onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                  placeholder="जस्तै: दावा लामा"
                  style={{
                    width: '100%',
                    padding: '9px 12px 9px 34px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem',
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                सम्पर्क / फोन नम्बर <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Phone size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="tel"
                  required
                  value={formData.contactNumber}
                  onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                  placeholder="जस्तै: 9841556677"
                  style={{
                    width: '100%',
                    padding: '9px 12px 9px 34px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem',
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Station Location & Ward Number */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                स्टेशन स्थान (स्वास्थ्य संस्था / बस्ने ठाउँ) <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <MapPin size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="text"
                  required
                  value={formData.stationLocation}
                  onChange={(e) => setFormData({ ...formData, stationLocation: e.target.value })}
                  placeholder="जस्तै: थाङपालधाप अस्पताल"
                  style={{
                    width: '100%',
                    padding: '9px 12px 9px 34px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem',
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                वडा नं.
              </label>
              <select
                value={formData.wardNumber}
                onChange={(e) => setFormData({ ...formData, wardNumber: Number(e.target.value) })}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.85rem',
                  backgroundColor: '#ffffff',
                  boxSizing: 'border-box',
                  outline: 'none',
                }}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((w) => (
                  <option key={w} value={w}>
                    वडा नं. {w}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Status (isAvailable) */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
              एम्बुलेन्स सेवा अवस्था (Availability Status)
            </label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <label
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: `2px solid ${formData.isAvailable ? '#16a34a' : '#e2e8f0'}`,
                  backgroundColor: formData.isAvailable ? '#f0fdf4' : '#ffffff',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <input
                  type="radio"
                  name="isAvailable"
                  checked={formData.isAvailable === true}
                  onChange={() => setFormData({ ...formData, isAvailable: true })}
                  style={{ accentColor: '#16a34a' }}
                />
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#166534' }}>सञ्चालनमा (Available)</div>
                  <div style={{ fontSize: '0.7rem', color: '#15803d' }}>तुरुन्त सेवा दिन तयार</div>
                </div>
              </label>

              <label
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: `2px solid ${!formData.isAvailable ? '#dc2626' : '#e2e8f0'}`,
                  backgroundColor: !formData.isAvailable ? '#fef2f2' : '#ffffff',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <input
                  type="radio"
                  name="isAvailable"
                  checked={formData.isAvailable === false}
                  onChange={() => setFormData({ ...formData, isAvailable: false })}
                  style={{ accentColor: '#dc2626' }}
                />
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#991b1b' }}>व्यस्त / मर्मत (Unavailable)</div>
                  <div style={{ fontSize: '0.7rem', color: '#b91c1c' }}>हाल उपलब्ध नभएको वा मर्मतमा</div>
                </div>
              </label>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
              थप विवरण वा कैफियत (Notes)
            </label>
            <input
              type="text"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="जस्तै: २४/७ सेवा उपलब्ध, अक्सिजन सिलिन्डर जडित"
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.85rem',
                boxSizing: 'border-box',
                outline: 'none',
              }}
            />
          </div>

          {/* Footer Actions */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px',
              borderTop: '1px solid #e2e8f0',
              paddingTop: '14px',
              marginTop: '6px',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#f8fafc',
                color: '#475569',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              रद्द गर्नुहोस्
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: '8px 18px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#0284c7',
                color: '#ffffff',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 6px rgba(2, 132, 199, 0.3)',
              }}
            >
              <Save size={16} />
              <span>{isSubmitting ? 'सुरक्षित हुँदैछ...' : ambulanceToEdit ? 'सच्याउनुहोस्' : 'सुरक्षित गर्नुहोस्'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
