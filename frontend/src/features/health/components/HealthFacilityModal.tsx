import React, { useState, useEffect } from 'react';
import {
  X,
  Building2,
  MapPin,
  Compass,
  Save,
  Edit3,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';
import type { HealthFacility } from '../../../types/health';

interface HealthFacilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (facility: Partial<HealthFacility>) => void;
  facilityToEdit?: HealthFacility | null;
  isSubmitting?: boolean;
}

export const WARD_COORDINATES: Record<number, { lat: number; lng: number; name: string }> = {
  1: { lat: 27.9450, lng: 85.6130, name: 'बासखर्क' },
  2: { lat: 27.9880, lng: 85.6310, name: 'बरुवा' },
  3: { lat: 27.9789, lng: 85.6123, name: 'भोताङ' },
  4: { lat: 27.9610, lng: 85.5980, name: 'थाङपाल / मानेखर्क' },
  5: { lat: 27.9234, lng: 85.5801, name: 'गुन्सा' },
  6: { lat: 27.9398, lng: 85.5921, name: 'थाङपालधाप' },
  7: { lat: 27.9117, lng: 85.5692, name: 'भोटेनाम्लाङ / तिपेनी' },
  8: { lat: 27.9087, lng: 85.5745, name: 'लाँगर्चे' },
  9: { lat: 27.9090, lng: 85.5750, name: 'लाँगर्चे' },
};

export const HealthFacilityModal: React.FC<HealthFacilityModalProps> = ({
  isOpen,
  onClose,
  onSave,
  facilityToEdit,
  isSubmitting = false,
}) => {
  const [formData, setFormData] = useState<Partial<HealthFacility>>({
    orderNo: 1,
    address: 'पाँचपोखरी थाङपाल गा.पा.',
    wardNumber: 1,
    location: '',
    nameNepali: '',
    nameEnglish: '',
    categoryNepali: 'स्वास्थ्य चौकी',
    type: 'health_post',
    designation: '',
    chiefName: '',
    phone: '',
    totalBeds: 4,
    hasAmbulance: false,
  });

  // String states for Lat/Lng to ensure 100% smooth decimal typing without cursor jumping
  const [latStr, setLatStr] = useState<string>('27.9450');
  const [lngStr, setLngStr] = useState<string>('85.6130');
  const [pasteInput, setPasteInput] = useState<string>('');
  const [showPasteHelper, setShowPasteHelper] = useState<boolean>(false);
  const [pasteSuccess, setPasteSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (facilityToEdit) {
      setFormData({
        ...facilityToEdit,
        nameNepali: facilityToEdit.nameNepali || facilityToEdit.name || '',
        nameEnglish: facilityToEdit.nameEn || facilityToEdit.nameEnglish || '',
        chiefName: facilityToEdit.chiefName || facilityToEdit.inChargeName || '',
        phone: facilityToEdit.phone || facilityToEdit.contactNumber || '',
        address: facilityToEdit.address || 'पाँचपोखरी थाङपाल गा.पा.',
        categoryNepali: facilityToEdit.categoryNepali || (facilityToEdit.type === 'hospital' ? 'आधारभूत अस्पताल' : 'स्वास्थ्य चौकी'),
        location: facilityToEdit.location || '',
        designation: facilityToEdit.designation || '',
        orderNo: facilityToEdit.orderNo !== undefined ? facilityToEdit.orderNo : 1,
        wardNumber: facilityToEdit.wardNumber || 1,
        totalBeds: facilityToEdit.totalBeds ?? 4,
        hasAmbulance: facilityToEdit.hasAmbulance ?? false,
      });

      const initialLat = facilityToEdit.latitude !== undefined && facilityToEdit.latitude !== null
        ? String(facilityToEdit.latitude)
        : (WARD_COORDINATES[facilityToEdit.wardNumber || 1]?.lat ? String(WARD_COORDINATES[facilityToEdit.wardNumber || 1].lat) : '27.9450');
      
      const initialLng = facilityToEdit.longitude !== undefined && facilityToEdit.longitude !== null
        ? String(facilityToEdit.longitude)
        : (WARD_COORDINATES[facilityToEdit.wardNumber || 1]?.lng ? String(WARD_COORDINATES[facilityToEdit.wardNumber || 1].lng) : '85.6130');

      setLatStr(initialLat);
      setLngStr(initialLng);
    } else {
      setFormData({
        orderNo: undefined,
        address: 'पाँचपोखरी थाङपाल गा.पा.',
        wardNumber: 1,
        location: '',
        nameNepali: '',
        nameEnglish: '',
        categoryNepali: 'स्वास्थ्य चौकी',
        type: 'health_post',
        designation: '',
        chiefName: '',
        phone: '',
        totalBeds: 4,
        hasAmbulance: false,
      });
      setLatStr(String(WARD_COORDINATES[1].lat));
      setLngStr(String(WARD_COORDINATES[1].lng));
    }
    setPasteInput('');
    setShowPasteHelper(false);
    setPasteSuccess(false);
  }, [facilityToEdit, isOpen]);

  if (!isOpen) return null;

  const handleWardChange = (ward: number) => {
    const coords = WARD_COORDINATES[ward];
    setFormData((prev) => ({
      ...prev,
      wardNumber: ward,
      location: prev.location || (coords ? coords.name : ''),
    }));
    // If lat/lng was empty or matches old ward coords, update to new ward centroid
    if (coords && (!latStr || !lngStr)) {
      setLatStr(String(coords.lat));
      setLngStr(String(coords.lng));
    }
  };

  const handleAutofillCoordinates = (wardNo?: number) => {
    const ward = wardNo || formData.wardNumber || 1;
    const coords = WARD_COORDINATES[ward];
    if (coords) {
      setLatStr(String(coords.lat));
      setLngStr(String(coords.lng));
      if (!formData.location) {
        setFormData((prev) => ({ ...prev, location: coords.name }));
      }
    }
  };

  const handleParsePastedCoords = () => {
    if (!pasteInput.trim()) return;
    // Handle formats like: "27.9450, 85.6130" or "27.9450 85.6130" or "27.9450,85.6130"
    const cleaned = pasteInput.trim().replace(/[^\d.,\s-]/g, '');
    const parts = cleaned.split(/[\s,]+/).filter(Boolean);
    if (parts.length >= 2) {
      const pLat = parseFloat(parts[0]);
      const pLng = parseFloat(parts[1]);
      if (!isNaN(pLat) && !isNaN(pLng)) {
        setLatStr(String(pLat));
        setLngStr(String(pLng));
        setPasteSuccess(true);
        setTimeout(() => {
          setPasteSuccess(false);
          setShowPasteHelper(false);
          setPasteInput('');
        }, 1200);
      } else {
        alert('कृपया मान्य कोर्डिनेट प्रविष्ट गर्नुहोस् (उदा: 27.9450, 85.6130)');
      }
    } else {
      alert('कोर्डिनेट छुट्याउन सकिएन। ढाँचा: 27.9450, 85.6130');
    }
  };

  const numLat = parseFloat(latStr);
  const numLng = parseFloat(lngStr);
  const isValidCoordinates = !isNaN(numLat) && !isNaN(numLng) && numLat > 26 && numLat < 31 && numLng > 80 && numLng < 89;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nameNepali?.trim()) {
      alert('कृपया स्वास्थ्य संस्थाको नाम भर्नुहोस्');
      return;
    }

    const payload: Partial<HealthFacility> = {
      ...formData,
      name: formData.nameNepali.trim(),
      nameNepali: formData.nameNepali.trim(),
      nameEn: formData.nameEnglish?.trim() || undefined,
      chiefName: formData.chiefName?.trim() || undefined,
      inChargeName: formData.chiefName?.trim() || undefined,
      phone: formData.phone?.trim() || undefined,
      contactNumber: formData.phone?.trim() || undefined,
      latitude: !isNaN(numLat) ? numLat : undefined,
      longitude: !isNaN(numLng) ? numLng : undefined,
      orderNo: formData.orderNo ? Number(formData.orderNo) : undefined,
      wardNumber: formData.wardNumber ? Number(formData.wardNumber) : 1,
      totalBeds: formData.totalBeds !== undefined ? Number(formData.totalBeds) : 0,
      hasAmbulance: Boolean(formData.hasAmbulance),
    };

    onSave(payload);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1rem',
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '740px',
          maxHeight: '94vh',
          overflowY: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
          border: '1px solid #cbd5e1',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.25rem 1.75rem',
            borderBottom: '1px solid #e2e8f0',
            backgroundColor: facilityToEdit ? '#f0fdf4' : '#f8fafc',
            borderTopLeftRadius: '16px',
            borderTopRightRadius: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                backgroundColor: facilityToEdit ? '#dcfce7' : '#fee2e2',
                color: facilityToEdit ? '#16a34a' : '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 5px rgba(0,0,0,0.06)',
              }}
            >
              {facilityToEdit ? <Edit3 size={22} /> : <Building2 size={22} />}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  {facilityToEdit ? 'स्वास्थ्य संस्था विवरण सम्पादन (Edit)' : 'नयाँ स्वास्थ्य संस्था प्रविष्टि'}
                </h2>
                {facilityToEdit && (
                  <span
                    style={{
                      fontSize: '0.72rem',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      backgroundColor: '#16a34a',
                      color: '#ffffff',
                      fontWeight: 700,
                    }}
                  >
                    सम्पादन मोड
                  </span>
                )}
              </div>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '3px 0 0 0' }}>
                पाँचपोखरी थाङपाल गाउँपालिका अन्तर्गत स्वास्थ्य चौकी विवरण तथा GPS निर्देशांक व्यवस्थापन
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              border: 'none',
              background: '#f1f5f9',
              color: '#64748b',
              cursor: 'pointer',
              padding: '7px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease',
            }}
            title="बन्द गर्नुहोस्"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem 1.75rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          
          {/* Row 1: सि. नं. & ठेगाना */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2.5fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                सि. (क्रम सङ्ख्या)
              </label>
              <input
                type="number"
                value={formData.orderNo !== undefined ? formData.orderNo : ''}
                onChange={(e) => setFormData({ ...formData, orderNo: e.target.value ? parseInt(e.target.value, 10) : undefined })}
                placeholder="१, २, ३..."
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.88rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                ठेगाना *
              </label>
              <input
                type="text"
                required
                value={formData.address || 'पाँचपोखरी थाङपाल गा.पा.'}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.88rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* Row 2: वडा नं. & स्थान (टोल/बस्ती) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2.5fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                वडा नं. *
              </label>
              <select
                value={formData.wardNumber || 1}
                onChange={(e) => handleWardChange(parseInt(e.target.value, 10))}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.88rem',
                  backgroundColor: '#ffffff',
                  boxSizing: 'border-box',
                  fontWeight: 600,
                }}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((w) => (
                  <option key={w} value={w}>
                    वडा नं. {w}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                स्थान (टोल / बस्ती) *
              </label>
              <input
                type="text"
                required
                value={formData.location || ''}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="उदा: बासखर्क, बरुवा, भोताङ, मानेखर्क, गुन्सा..."
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.88rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* Row 3: संस्थाको नाम & अंग्रेजी नाम */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                स्वास्थ्य संस्थाको नाम (नेपाली) *
              </label>
              <input
                type="text"
                required
                value={formData.nameNepali || ''}
                onChange={(e) => setFormData({ ...formData, nameNepali: e.target.value })}
                placeholder="उदा: बासखर्क स्वास्थ्य चौकी"
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                नाम (अंग्रेजीमा - ऐच्छिक)
              </label>
              <input
                type="text"
                value={formData.nameEnglish || ''}
                onChange={(e) => setFormData({ ...formData, nameEnglish: e.target.value })}
                placeholder="e.g. Baskharka Health Post"
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.88rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* Row 4: प्रकार, दर्जा, प्रमुखको नामथर, मोबाइल नं. */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr 1.3fr 1.2fr', gap: '0.8rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                प्रकार *
              </label>
              <select
                value={formData.categoryNepali || 'स्वास्थ्य चौकी'}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData({
                    ...formData,
                    categoryNepali: val,
                    type: val.includes('अस्पताल') ? 'hospital' : 'health_post',
                  });
                }}
                style={{
                  width: '100%',
                  padding: '9px 10px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.85rem',
                  backgroundColor: '#ffffff',
                  boxSizing: 'border-box',
                }}
              >
                <option value="स्वास्थ्य चौकी">स्वास्थ्य चौकी</option>
                <option value="सामुदायिक स्वास्थ्य ईकाइ">सामुदायिक स्वास्थ्य ईकाइ</option>
                <option value="आधारभूत अस्पताल">आधारभूत अस्पताल</option>
                <option value="प्राथमिक स्वास्थ्य केन्द्र">प्राथमिक स्वास्थ्य केन्द्र</option>
                <option value="सहरी स्वास्थ्य केन्द्र">सहरी स्वास्थ्य केन्द्र</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                दर्जा
              </label>
              <input
                type="text"
                value={formData.designation || ''}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                placeholder="सिनियर अहेव"
                style={{
                  width: '100%',
                  padding: '9px 10px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.85rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                प्रमुखको नामथर
              </label>
              <input
                type="text"
                value={formData.chiefName || ''}
                onChange={(e) => setFormData({ ...formData, chiefName: e.target.value })}
                placeholder="उदा: सागर आचार्य"
                style={{
                  width: '100%',
                  padding: '9px 10px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.85rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                मोबाइल नं.
              </label>
              <input
                type="text"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="९८६४१६५३५३"
                style={{
                  width: '100%',
                  padding: '9px 10px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.85rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* Row 5: शय्या सङ्ख्या र एम्बुलेन्स सेवा */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', backgroundColor: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.80rem', fontWeight: 700, color: '#475569', marginBottom: '3px' }}>
                कुल शय्या (Beds)
              </label>
              <input
                type="number"
                min="0"
                value={formData.totalBeds ?? 0}
                onChange={(e) => setFormData({ ...formData, totalBeds: parseInt(e.target.value, 10) || 0 })}
                style={{
                  width: '100%',
                  padding: '7px 10px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.85rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', marginTop: '18px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.84rem', fontWeight: 700, color: '#334155' }}>
                <input
                  type="checkbox"
                  checked={formData.hasAmbulance || false}
                  onChange={(e) => setFormData({ ...formData, hasAmbulance: e.target.checked })}
                  style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#dc2626' }}
                />
                <span>एम्बुलेन्स सेवा उपलब्ध छ</span>
              </label>
            </div>
          </div>

          {/* ── ROW 6: DEDICATED GIS GPS COORDINATES SECTION (Latitude & Longitude) ── */}
          <div
            style={{
              padding: '1.25rem',
              borderRadius: '12px',
              backgroundColor: '#f0fdf4',
              border: '1.5px solid #86efac',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ backgroundColor: '#22c55e', color: '#ffffff', padding: '5px', borderRadius: '8px', display: 'flex' }}>
                  <MapPin size={17} />
                </div>
                <div>
                  <h3 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#14532d', margin: 0 }}>
                    GIS भौगोलिक निर्देशांक (GPS Latitude & Longitude)
                  </h3>
                  <p style={{ fontSize: '0.74rem', color: '#166534', margin: '2px 0 0 0' }}>
                    नक्सामा ठ्याक्कै स्थान देखाउन अक्षांश (Lat) र देशान्तर (Lng) भर्नुहोस्
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => setShowPasteHelper(!showPasteHelper)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '5px 9px',
                    borderRadius: '6px',
                    border: '1px solid #bbf7d0',
                    backgroundColor: '#ffffff',
                    color: '#15803d',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                  title="GPS कोर्डिनेट पेस्ट गर्नुहोस्"
                >
                  <Copy size={13} />
                  <span>GPS पेस्ट गर्नुहोस्</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAutofillCoordinates()}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '5px 9px',
                    borderRadius: '6px',
                    border: '1px solid #0284c7',
                    backgroundColor: '#0284c7',
                    color: '#ffffff',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                  title="हाल छानिएको वडाको आधिकारिक कोर्डिनेट भर्नुहोस्"
                >
                  <Compass size={13} />
                  <span>वडा {formData.wardNumber || 1} अटो-फिल</span>
                </button>
              </div>
            </div>

            {/* Quick Paste Helper Box */}
            {showPasteHelper && (
              <div
                style={{
                  padding: '10px',
                  backgroundColor: '#ffffff',
                  borderRadius: '8px',
                  border: '1px dashed #22c55e',
                  display: 'flex',
                  gap: '8px',
                  alignItems: 'center',
                }}
              >
                <input
                  type="text"
                  value={pasteInput}
                  onChange={(e) => setPasteInput(e.target.value)}
                  placeholder="उदा: 27.9450, 85.6130 (Google Maps बाट पेस्ट गर्नुहोस्)"
                  style={{
                    flex: 1,
                    padding: '7px 10px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.82rem',
                  }}
                />
                <button
                  type="button"
                  onClick={handleParsePastedCoords}
                  style={{
                    padding: '7px 12px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: pasteSuccess ? '#16a34a' : '#15803d',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  {pasteSuccess ? <Check size={14} /> : null}
                  <span>{pasteSuccess ? 'भरियो!' : 'लागु गर्नुहोस्'}</span>
                </button>
              </div>
            )}

            {/* Inputs Grid: Latitude & Longitude */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.80rem', fontWeight: 700, color: '#166534', marginBottom: '3px' }}>
                  Latitude (अक्षांश) *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    required
                    value={latStr}
                    onChange={(e) => setLatStr(e.target.value)}
                    placeholder="27.9450"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #86efac',
                      fontSize: '0.88rem',
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      backgroundColor: '#ffffff',
                      boxSizing: 'border-box',
                      color: '#0f172a',
                    }}
                  />
                  <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.70rem', color: '#64748b', fontWeight: 600 }}>
                    °N
                  </span>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.80rem', fontWeight: 700, color: '#166534', marginBottom: '3px' }}>
                  Longitude (देशान्तर) *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    required
                    value={lngStr}
                    onChange={(e) => setLngStr(e.target.value)}
                    placeholder="85.6130"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #86efac',
                      fontSize: '0.88rem',
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      backgroundColor: '#ffffff',
                      boxSizing: 'border-box',
                      color: '#0f172a',
                    }}
                  />
                  <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.70rem', color: '#64748b', fontWeight: 600 }}>
                    °E
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Ward Centroids Bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '2px' }}>
              <span style={{ fontSize: '0.72rem', color: '#166534', fontWeight: 700 }}>वडा अनुसार तत्काल राख्नुहोस्:</span>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((w) => {
                const info = WARD_COORDINATES[w];
                const isSelected = formData.wardNumber === w;
                return (
                  <button
                    key={w}
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, wardNumber: w, location: prev.location || info.name }));
                      handleAutofillCoordinates(w);
                    }}
                    style={{
                      padding: '2px 7px',
                      borderRadius: '5px',
                      border: isSelected ? '1px solid #16a34a' : '1px solid #d1fae5',
                      backgroundColor: isSelected ? '#dcfce7' : '#ffffff',
                      color: isSelected ? '#15803d' : '#334155',
                      fontSize: '0.70rem',
                      fontWeight: isSelected ? 800 : 600,
                      cursor: 'pointer',
                    }}
                  >
                    वडा {w} ({info.name})
                  </button>
                );
              })}
            </div>

            {/* Validation and Google Maps Live Preview Button */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                {isValidCoordinates ? (
                  <span style={{ fontSize: '0.74rem', color: '#16a34a', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle2 size={13} />
                    <span>मान्य निर्देशांक: {numLat.toFixed(5)}, {numLng.toFixed(5)}</span>
                  </span>
                ) : (
                  <span style={{ fontSize: '0.74rem', color: '#ea580c', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <AlertCircle size={13} />
                    <span>कृपया सही अक्षांश (२६°-३०°) र देशान्तर (८०°-८९°) भर्नुहोस्</span>
                  </span>
                )}
              </div>

              {isValidCoordinates && (
                <a
                  href={`https://www.google.com/maps?q=${numLat},${numLng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    color: '#0284c7',
                    textDecoration: 'none',
                    backgroundColor: '#ffffff',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                  }}
                  title="Google Satellite नक्सामा हेर्नुहोस्"
                >
                  <ExternalLink size={12} />
                  <span>Google Maps मा हेर्नुहोस्</span>
                </a>
              )}
            </div>
          </div>

          {/* Modal Footer */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: '0.8rem',
              borderTop: '1px solid #e2e8f0',
              marginTop: '0.5rem',
            }}
          >
            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
              {facilityToEdit ? (
                <span>सम्पादन भइरहेको: <strong>{facilityToEdit.nameNepali || facilityToEdit.name}</strong></span>
              ) : (
                <span>सबै * चिन्ह भएका विवरण अनिवार्य छन्</span>
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                style={{
                  padding: '9px 18px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#475569',
                  fontWeight: 600,
                  fontSize: '0.86rem',
                  cursor: 'pointer',
                }}
              >
                रद्द गर्नुहोस्
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 22px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: facilityToEdit ? '#16a34a' : '#dc2626',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.86rem',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting ? 0.7 : 1,
                  boxShadow: facilityToEdit ? '0 2px 6px rgba(22, 163, 74, 0.3)' : '0 2px 6px rgba(220, 38, 38, 0.3)',
                }}
              >
                <Save size={16} />
                <span>
                  {isSubmitting
                    ? 'सुरक्षित हुँदैछ...'
                    : facilityToEdit
                    ? 'अपडेट गर्नुहोस् (Save Edit)'
                    : 'सुरक्षित गर्नुहोस्'}
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
