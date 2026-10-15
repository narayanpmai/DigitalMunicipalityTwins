import React, { useState, useEffect } from 'react';
import { X, School as SchoolIcon, Save, MapPin } from 'lucide-react';
import type { School } from '../../../types/education';

interface SchoolModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (schoolData: Partial<School>) => Promise<void>;
  initialData?: Partial<School> | null;
}

// Approximate ward center points in Panchpokhari Thangpal
const WARD_DEFAULT_COORDS: Record<number, { lat: number; lng: number; label: string }> = {
  1: { lat: 27.9430, lng: 85.6090, label: 'बाँसखर्क' },
  2: { lat: 27.9870, lng: 85.6300, label: 'बरुवा' },
  3: { lat: 27.9790, lng: 85.6130, label: 'भोताङ' },
  4: { lat: 27.9660, lng: 85.6025, label: 'मानेखर्क / थाङपालकोट' },
  5: { lat: 27.9240, lng: 85.5815, label: 'गुन्सा' },
  6: { lat: 27.9405, lng: 85.5935, label: 'थाङपालधाप' },
  7: { lat: 27.9125, lng: 85.5705, label: 'भोटेनाम्लाङ / तिपेनी' },
  8: { lat: 27.9095, lng: 85.5755, label: 'लाँगर्चे' },
};

export const SchoolModal: React.FC<SchoolModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [formData, setFormData] = useState<Partial<School>>({
    name: initialData?.name || initialData?.nameNepali || '',
    nameEn: initialData?.nameEn || initialData?.nameEnglish || '',
    emisCode: initialData?.emisCode || initialData?.code || '',
    wardNumber: initialData?.wardNumber || 1,
    tole: initialData?.tole || '',
    type: initialData?.type || 'community',
    level: initialData?.level || 'secondary',
    levelDetails: initialData?.levelDetails || 'माध्यमिक (१-१०)',
    totalStudents: initialData?.totalStudents || 100,
    maleStudents: initialData?.maleStudents || 50,
    femaleStudents: initialData?.femaleStudents || 50,
    totalTeachers: initialData?.totalTeachers || 8,
    principalName: initialData?.principalName || '',
    contactPhone: initialData?.contactPhone || initialData?.contactNumber || '',
    portalUrl: initialData?.portalUrl || '',
    latitude: initialData?.latitude ?? undefined,
    longitude: initialData?.longitude ?? undefined,
    hasIctLab: initialData?.hasIctLab ?? false,
    hasLibrary: initialData?.hasLibrary ?? true,
    hasScienceLab: initialData?.hasScienceLab ?? false,
    hasDrinkingWater: initialData?.hasDrinkingWater ?? true,
    hasElectricity: initialData?.hasElectricity ?? true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Synchronize formData with incoming initialData
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || initialData.nameNepali || '',
        nameEn: initialData.nameEn || initialData.nameEnglish || '',
        emisCode: initialData.emisCode || initialData.code || '',
        wardNumber: initialData.wardNumber || 1,
        tole: initialData.tole || '',
        type: initialData.type || 'community',
        level: initialData.level || 'secondary',
        levelDetails: initialData.levelDetails || 'माध्यमिक (१-१०)',
        totalStudents: initialData.totalStudents || 100,
        maleStudents: initialData.maleStudents || 50,
        femaleStudents: initialData.femaleStudents || 50,
        totalTeachers: initialData.totalTeachers || 8,
        principalName: initialData.principalName || '',
        contactPhone: initialData.contactPhone || initialData.contactNumber || '',
        portalUrl: initialData.portalUrl || '',
        latitude: initialData.latitude !== undefined && initialData.latitude !== null ? initialData.latitude : undefined,
        longitude: initialData.longitude !== undefined && initialData.longitude !== null ? initialData.longitude : undefined,
        hasIctLab: initialData.hasIctLab ?? false,
        hasLibrary: initialData.hasLibrary ?? true,
        hasScienceLab: initialData.hasScienceLab ?? false,
        hasDrinkingWater: initialData.hasDrinkingWater ?? true,
        hasElectricity: initialData.hasElectricity ?? true,
      });
    } else {
      setFormData({
        name: '',
        nameEn: '',
        emisCode: '',
        wardNumber: 1,
        tole: '',
        type: 'community',
        level: 'secondary',
        levelDetails: 'माध्यमिक (१-१०)',
        totalStudents: 100,
        maleStudents: 50,
        femaleStudents: 50,
        totalTeachers: 8,
        principalName: '',
        contactPhone: '',
        portalUrl: '',
        latitude: undefined,
        longitude: undefined,
        hasIctLab: false,
        hasLibrary: true,
        hasScienceLab: false,
        hasDrinkingWater: true,
        hasElectricity: true,
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      setErrorMsg('कृपया विद्यालयको नाम प्रविष्ट गर्नुहोस्।');
      return;
    }
    try {
      setIsSubmitting(true);
      setErrorMsg('');
      const payload: Partial<School> = {
        ...formData,
        latitude:
          formData.latitude !== undefined && formData.latitude !== null && (formData.latitude as any) !== ''
            ? Number(formData.latitude)
            : undefined,
        longitude:
          formData.longitude !== undefined && formData.longitude !== null && (formData.longitude as any) !== ''
            ? Number(formData.longitude)
            : undefined,
      };
      await onSave(payload);
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || 'विद्यालय सुरक्षित गर्न सकिएन।');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem',
      }}
    >
      <div
        className="dt-card"
        style={{
          width: '100%',
          maxWidth: '720px',
          maxHeight: '92vh',
          overflowY: 'auto',
          backgroundColor: '#fff',
          borderRadius: '12px',
          padding: '1.5rem',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <SchoolIcon className="text-primary" size={24} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
              {initialData?.id ? 'विद्यालय विवरण सम्पादन' : 'नयाँ विद्यालय दर्ता (IEMIS)'}
            </h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {errorMsg && (
          <div style={{ padding: '0.75rem', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.875rem' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                विद्यालयको नाम (नेपाली) *
              </label>
              <input
                type="text"
                required
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="उदा: श्री थाङपालधाप माध्यमिक विद्यालय"
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                विद्यालयको नाम (English)
              </label>
              <input
                type="text"
                value={formData.nameEn || ''}
                onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                placeholder="e.g. Shree Thangpaldhap Sec School"
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                EMIS कोड
              </label>
              <input
                type="text"
                value={formData.emisCode || ''}
                onChange={(e) => setFormData({ ...formData, emisCode: e.target.value })}
                placeholder="उदा: 230720004"
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                वडा नम्बर *
              </label>
              <select
                value={formData.wardNumber}
                onChange={(e) => setFormData({ ...formData, wardNumber: Number(e.target.value) })}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((w) => (
                  <option key={w} value={w}>वडा नं. {w}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                टोल / स्थान
              </label>
              <input
                type="text"
                value={formData.tole || ''}
                onChange={(e) => setFormData({ ...formData, tole: e.target.value })}
                placeholder="उदा: थाङपालधाप, टार, भोताङ"
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                विद्यालयको प्रकार
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              >
                <option value="community">सामुदायिक विद्यालय (Community)</option>
                <option value="private">संस्थागत विद्यालय (Private)</option>
                <option value="public">सार्वजनिक / धार्मिक (Public)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                शैक्षिक तह
              </label>
              <select
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              >
                <option value="secondary">माध्यमिक (१-१० / १-१२)</option>
                <option value="basic">आधारभूत (१-८)</option>
                <option value="higher">उच्च माध्यमिक (११-१२)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                प्रधानाध्यापकको नाम
              </label>
              <input
                type="text"
                value={formData.principalName || ''}
                onChange={(e) => setFormData({ ...formData, principalName: e.target.value })}
                placeholder="प्रधानाध्यापकको नाम"
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                सम्पर्क नम्बर
              </label>
              <input
                type="text"
                value={formData.contactPhone || ''}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                placeholder="उदा: ९८६४१६५३७०"
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                EduQSMS / पोर्टल वेबसाइट
              </label>
              <input
                type="url"
                value={formData.portalUrl || ''}
                onChange={(e) => setFormData({ ...formData, portalUrl: e.target.value })}
                placeholder="https://thangpaldhapss.edu.np"
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                कुल विद्यार्थी संख्या
              </label>
              <input
                type="number"
                value={formData.totalStudents || 0}
                onChange={(e) => setFormData({ ...formData, totalStudents: Number(e.target.value) })}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                शिक्षक तथा कर्मचारी संख्या
              </label>
              <input
                type="number"
                value={formData.totalTeachers || 0}
                onChange={(e) => setFormData({ ...formData, totalTeachers: Number(e.target.value) })}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>
          </div>

          {/* Dedicated GPS Coordinates Section */}
          <div
            style={{
              backgroundColor: '#f0f9ff',
              border: '1px solid #bae6fd',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#0369a1', fontWeight: 700, fontSize: '0.9rem' }}>
                <MapPin size={18} />
                <span>नक्सा GPS अवस्थिति (Geographic Coordinates / GIS Point)</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  const ward = formData.wardNumber || 1;
                  const coord = WARD_DEFAULT_COORDS[ward] || WARD_DEFAULT_COORDS[1];
                  setFormData((prev) => ({
                    ...prev,
                    latitude: coord.lat,
                    longitude: coord.lng,
                  }));
                }}
                style={{
                  background: '#e0f2fe',
                  border: '1px solid #7dd3fc',
                  color: '#0369a1',
                  borderRadius: '6px',
                  padding: '0.25rem 0.65rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                }}
              >
                <span>📍 वडा नं. {formData.wardNumber || 1} को GPS स्वतः भर्नुहोस्</span>
              </button>
            </div>

            <p style={{ fontSize: '0.78rem', color: '#475569', margin: '0 0 0.75rem 0' }}>
              यहाँ प्रविष्ट गरिएको अक्षांश (Latitude) र देशान्तर (Longitude) अनुसार यो विद्यालय डिजिटल नक्सा (GIS Map) मा स्वचालित रूपमा प्रदर्शित हुनेछ।
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem', color: '#0f172a' }}>
                  GPS अक्षांश (Latitude)
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="number"
                    step="any"
                    value={formData.latitude !== undefined && formData.latitude !== null ? formData.latitude : ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        latitude: e.target.value === '' ? undefined : parseFloat(e.target.value),
                      })
                    }
                    placeholder="उदा: 27.9736"
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.5rem 0.5rem 2rem',
                      borderRadius: '6px',
                      border: '1px solid #93c5fd',
                      backgroundColor: '#ffffff',
                      fontFamily: 'monospace',
                      fontSize: '0.9rem',
                    }}
                  />
                  <span style={{ position: 'absolute', left: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: '#0284c7', fontSize: '0.8rem', fontWeight: 700 }}>
                    N
                  </span>
                </div>
                <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.2rem', display: 'block' }}>
                  मानक दायरा: 27.8000 - 28.1500 (पाँचपोखरी क्षेत्र)
                </span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem', color: '#0f172a' }}>
                  GPS देशान्तर (Longitude)
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="number"
                    step="any"
                    value={formData.longitude !== undefined && formData.longitude !== null ? formData.longitude : ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        longitude: e.target.value === '' ? undefined : parseFloat(e.target.value),
                      })
                    }
                    placeholder="उदा: 85.6425"
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.5rem 0.5rem 2rem',
                      borderRadius: '6px',
                      border: '1px solid #93c5fd',
                      backgroundColor: '#ffffff',
                      fontFamily: 'monospace',
                      fontSize: '0.9rem',
                    }}
                  />
                  <span style={{ position: 'absolute', left: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: '#0284c7', fontSize: '0.8rem', fontWeight: 700 }}>
                    E
                  </span>
                </div>
                <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.2rem', display: 'block' }}>
                  मानक दायरा: 85.5000 - 85.7500 (पाँचपोखरी क्षेत्र)
                </span>
              </div>
            </div>
          </div>

          {/* Facilities Checkboxes */}
          <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: '#1e293b' }}>
              भौतिक पूर्वाधार तथा सुविधाहरू
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.hasIctLab}
                  onChange={(e) => setFormData({ ...formData, hasIctLab: e.target.checked })}
                />
                कम्प्युटर / ICT ल्याब
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.hasLibrary}
                  onChange={(e) => setFormData({ ...formData, hasLibrary: e.target.checked })}
                />
                पुस्तकालय (Library)
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.hasScienceLab}
                  onChange={(e) => setFormData({ ...formData, hasScienceLab: e.target.checked })}
                />
                विज्ञान प्रयोगशाला
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.hasDrinkingWater}
                  onChange={(e) => setFormData({ ...formData, hasDrinkingWater: e.target.checked })}
                />
                स्वच्छ खानेपानी
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.hasElectricity}
                  onChange={(e) => setFormData({ ...formData, hasElectricity: e.target.checked })}
                />
                विद्युत् आपूर्ति
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.5rem 1.25rem',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#fff',
                cursor: 'pointer',
                fontWeight: 500,
              }}
            >
              रद्द गर्नुहोस्
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: '0.5rem 1.25rem',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: '#2563eb',
                color: '#fff',
                cursor: 'pointer',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <Save size={16} />
              {isSubmitting ? 'सुरक्षित हुँदैछ...' : 'सुरक्षित गर्नुहोस्'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SchoolModal;
