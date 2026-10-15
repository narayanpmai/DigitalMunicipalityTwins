import React, { useState, useEffect } from 'react';
import {
  X,
  HeartHandshake,
  Baby,
  Smile,
  Accessibility,
  Coins,
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
import type { SocialInclusionRecord, SocialInclusionCategory } from '../../../types/social-inclusion';

interface SocialInclusionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: Partial<SocialInclusionRecord>) => void;
  recordToEdit?: SocialInclusionRecord | null;
  defaultCategory?: SocialInclusionCategory;
  isSubmitting?: boolean;
}

const WARD_COORDINATES: Record<number, { lat: number; lng: number; name: string }> = {
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

const CATEGORY_NAMES: Record<SocialInclusionCategory, { label: string; icon: any; color: string; bg: string }> = {
  women_children: { label: 'महिला तथा बालबालिका', icon: Baby, color: '#ec4899', bg: '#fdf2f8' },
  senior: { label: 'ज्येष्ठ नागरिक सुरक्षा', icon: Smile, color: '#2563eb', bg: '#eff6ff' },
  disability: { label: 'अपाङ्गता सशक्तीकरण', icon: Accessibility, color: '#16a34a', bg: '#f0fdf4' },
  economic: { label: 'आर्थिक तथा सीप विकास', icon: Coins, color: '#d97706', bg: '#fffbeb' },
  marginalized: { label: 'दलित, जनजाति तथा लक्षित वर्ग', icon: HeartHandshake, color: '#7c3aed', bg: '#f5f3ff' },
};

export const SocialInclusionModal: React.FC<SocialInclusionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  recordToEdit,
  defaultCategory = 'women_children',
  isSubmitting = false,
}) => {
  const [formData, setFormData] = useState<Partial<SocialInclusionRecord>>({
    category: defaultCategory,
    wardNumber: 1,
    fiscalYear: '२०८१/०८२',
    title: '',
    serviceType: '',
    subCategory: '',
    beneficiariesCount: 0,
    femaleBeneficiaries: 0,
    maleBeneficiaries: 0,
    disabilityCardType: 'none',
    budgetAllocated: 0,
    budgetSpent: 0,
    coordinatorName: '',
    coordinatorPhone: '',
    location: '',
    address: 'पाँचपोखरी थाङपाल गा.पा.',
    status: 'regular',
    remarks: '',
  });

  const [latStr, setLatStr] = useState<string>('27.9450');
  const [lngStr, setLngStr] = useState<string>('85.6130');
  const [pasteInput, setPasteInput] = useState<string>('');
  const [showPasteHelper, setShowPasteHelper] = useState<boolean>(false);
  const [pasteSuccess, setPasteSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (recordToEdit) {
      setFormData({
        ...recordToEdit,
        wardNumber: recordToEdit.wardNumber || 1,
        fiscalYear: recordToEdit.fiscalYear || '२०८१/०८२',
        status: recordToEdit.status || 'regular',
      });

      const initialLat = recordToEdit.latitude !== undefined && recordToEdit.latitude !== null
        ? String(recordToEdit.latitude)
        : (WARD_COORDINATES[recordToEdit.wardNumber || 1]?.lat ? String(WARD_COORDINATES[recordToEdit.wardNumber || 1].lat) : '27.9450');
      
      const initialLng = recordToEdit.longitude !== undefined && recordToEdit.longitude !== null
        ? String(recordToEdit.longitude)
        : (WARD_COORDINATES[recordToEdit.wardNumber || 1]?.lng ? String(WARD_COORDINATES[recordToEdit.wardNumber || 1].lng) : '85.6130');

      setLatStr(initialLat);
      setLngStr(initialLng);
    } else {
      const initWard = 1;
      setFormData({
        category: defaultCategory,
        wardNumber: initWard,
        fiscalYear: '२०८१/०८२',
        title: '',
        serviceType: defaultCategory === 'women_children' ? 'महिला समूह तथा उद्यम' : defaultCategory === 'senior' ? 'सामाजिक सुरक्षा भत्ता' : defaultCategory === 'disability' ? 'क वर्ग (रातो कार्ड)' : '१०० दिने रोजगारी (PMEP)',
        subCategory: '',
        beneficiariesCount: 20,
        femaleBeneficiaries: 10,
        maleBeneficiaries: 10,
        disabilityCardType: defaultCategory === 'disability' ? 'ka' : 'none',
        budgetAllocated: 100000,
        budgetSpent: 80000,
        coordinatorName: '',
        coordinatorPhone: '',
        location: WARD_COORDINATES[initWard].name,
        address: 'पाँचपोखरी थाङपाल गा.पा.',
        status: 'regular',
        remarks: '',
      });
      setLatStr(String(WARD_COORDINATES[initWard].lat));
      setLngStr(String(WARD_COORDINATES[initWard].lng));
    }
    setPasteInput('');
    setShowPasteHelper(false);
    setPasteSuccess(false);
  }, [recordToEdit, defaultCategory, isOpen]);

  if (!isOpen) return null;

  const activeCategory = (formData.category || defaultCategory) as SocialInclusionCategory;
  const catConfig = CATEGORY_NAMES[activeCategory] || CATEGORY_NAMES.women_children;
  const CategoryIcon = catConfig.icon;

  const handleWardChange = (ward: number) => {
    const coords = WARD_COORDINATES[ward];
    setFormData((prev) => ({
      ...prev,
      wardNumber: ward,
      location: prev.location || (coords ? coords.name : ''),
    }));
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
    if (!formData.title?.trim()) {
      alert('कृपया कार्यक्रम / संस्था / समूहको नाम भर्नुहोस्');
      return;
    }

    const payload: Partial<SocialInclusionRecord> = {
      ...formData,
      title: formData.title.trim(),
      latitude: !isNaN(numLat) ? numLat : undefined,
      longitude: !isNaN(numLng) ? numLng : undefined,
      wardNumber: formData.wardNumber ? Number(formData.wardNumber) : 1,
      beneficiariesCount: formData.beneficiariesCount ? Number(formData.beneficiariesCount) : 0,
      femaleBeneficiaries: formData.femaleBeneficiaries ? Number(formData.femaleBeneficiaries) : 0,
      maleBeneficiaries: formData.maleBeneficiaries ? Number(formData.maleBeneficiaries) : 0,
      budgetAllocated: formData.budgetAllocated ? Number(formData.budgetAllocated) : 0,
      budgetSpent: formData.budgetSpent ? Number(formData.budgetSpent) : 0,
    };

    onSave(payload);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.72)',
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
          maxWidth: '760px',
          maxHeight: '94vh',
          overflowY: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
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
            padding: '1.2rem 1.75rem',
            borderBottom: '1px solid #e2e8f0',
            backgroundColor: catConfig.bg,
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
                backgroundColor: '#ffffff',
                color: catConfig.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
              }}
            >
              {recordToEdit ? <Edit3 size={22} /> : <CategoryIcon size={22} />}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  {recordToEdit ? `${catConfig.label} विवरण सम्पादन` : `${catConfig.label} नयाँ प्रविष्टि`}
                </h2>
                <span
                  style={{
                    fontSize: '0.72rem',
                    padding: '2px 8px',
                    borderRadius: '10px',
                    backgroundColor: catConfig.color,
                    color: '#ffffff',
                    fontWeight: 700,
                  }}
                >
                  {catConfig.label}
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '3px 0 0 0' }}>
                पाँचपोखरी थाङपाल गाउँपालिका सामाजिक विकास तथा लक्षित वर्ग तथ्याङ्क प्रविष्टि
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              border: 'none',
              background: '#ffffff',
              color: '#64748b',
              cursor: 'pointer',
              padding: '7px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
            title="बन्द गर्नुहोस्"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem 1.75rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          
          {/* Row 1: क्षेत्र (Category) & वडा नं. & आ.व. */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                क्षेत्र (Category) *
              </label>
              <select
                value={formData.category || defaultCategory}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as SocialInclusionCategory })}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.88rem',
                  backgroundColor: '#ffffff',
                  boxSizing: 'border-box',
                  fontWeight: 700,
                  color: catConfig.color,
                }}
              >
                <option value="women_children">महिला तथा बालबालिका</option>
                <option value="senior">ज्येष्ठ नागरिक सुरक्षा</option>
                <option value="disability">अपाङ्गता सशक्तीकरण</option>
                <option value="economic">आर्थिक तथा सीप विकास</option>
                <option value="marginalized">दलित, जनजाति तथा लक्षित वर्ग</option>
              </select>
            </div>

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
                आर्थिक वर्ष *
              </label>
              <select
                value={formData.fiscalYear || '२०८१/०८२'}
                onChange={(e) => setFormData({ ...formData, fiscalYear: e.target.value })}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.88rem',
                  backgroundColor: '#ffffff',
                  boxSizing: 'border-box',
                }}
              >
                <option value="२०८१/०८२">२०८१/०८२</option>
                <option value="२०८०/०८१">२०८०/०८१</option>
                <option value="२०७९/०८०">२०७९/०८०</option>
              </select>
            </div>
          </div>

          {/* Row 2: कार्यक्रम / संस्थाको नाम & सेवाको प्रकार */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1.2fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                कार्यक्रम / समूह / संस्थाको नाम *
              </label>
              <input
                type="text"
                required
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder={
                  activeCategory === 'women_children'
                    ? 'उदा: बासखर्क जनहित महिला बचत तथा ऋण समूह'
                    : activeCategory === 'senior'
                    ? 'उदा: ज्येष्ठ नागरिक सम्मान तथा सामाजिक सुरक्षा भत्ता'
                    : activeCategory === 'disability'
                    ? "उदा: 'क' वर्ग (रातो कार्ड) पूर्ण अशक्त अपाङ्गता भत्ता"
                    : activeCategory === 'marginalized'
                    ? 'उदा: ह्योल्मो/तामाङ संस्कृति संरक्षण वा दलित आरन सुधार'
                    : 'उदा: प्रधानमन्त्री रोजगार कार्यक्रम (१०० दिने रोजगारी)'
                }
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
                सेवा प्रकार / शीर्षक *
              </label>
              <input
                type="text"
                value={formData.serviceType || ''}
                onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                placeholder="उदा: पोषण, परिचयपत्र, तालिम, भत्ता..."
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

          {/* Category-Specific Row (e.g. Disability Card Type) */}
          {activeCategory === 'disability' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', backgroundColor: '#f0fdf4', padding: '0.8rem 1rem', borderRadius: '10px', border: '1px solid #bbf7d0' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#166534', marginBottom: '4px' }}>
                  अपाङ्गता परिचयपत्र वर्ग *
                </label>
                <select
                  value={formData.disabilityCardType || 'ka'}
                  onChange={(e) => setFormData({ ...formData, disabilityCardType: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: '1px solid #86efac',
                    fontSize: '0.85rem',
                    backgroundColor: '#ffffff',
                    fontWeight: 700,
                  }}
                >
                  <option value="ka">'क' वर्ग - रातो कार्ड (पूर्ण अशक्त अपाङ्गता)</option>
                  <option value="kha">'ख' वर्ग - नीलो कार्ड (अति अशक्त अपाङ्गता)</option>
                  <option value="ga">'ग' वर्ग - पहेँलो कार्ड (मध्यम अपाङ्गता)</option>
                  <option value="gha">'घ' वर्ग - सेतो कार्ड (सामान्य अपाङ्गता)</option>
                  <option value="none">अन्य / सहायक सामग्री</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#166534', marginBottom: '4px' }}>
                  सहायक सामग्री / सेवा विवरण
                </label>
                <input
                  type="text"
                  value={formData.subCategory || ''}
                  onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                  placeholder="उदा: ह्विलचेयर, सेतो छडी, श्रवणयन्त्र, मासिक भत्ता..."
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: '1px solid #86efac',
                    fontSize: '0.85rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>
          )}

          {/* Row 3: लाभान्वित संख्या (कुल, महिला, पुरुष) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', backgroundColor: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.80rem', fontWeight: 700, color: '#475569', marginBottom: '3px' }}>
                कुल लाभान्वित संख्या (Total) *
              </label>
              <input
                type="number"
                min="0"
                value={formData.beneficiariesCount ?? 0}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10) || 0;
                  setFormData({
                    ...formData,
                    beneficiariesCount: val,
                    femaleBeneficiaries: Math.round(val / 2),
                    maleBeneficiaries: val - Math.round(val / 2),
                  });
                }}
                style={{
                  width: '100%',
                  padding: '7px 10px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.86rem',
                  fontWeight: 700,
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.80rem', fontWeight: 700, color: '#475569', marginBottom: '3px' }}>
                महिला संख्या
              </label>
              <input
                type="number"
                min="0"
                value={formData.femaleBeneficiaries ?? 0}
                onChange={(e) => setFormData({ ...formData, femaleBeneficiaries: parseInt(e.target.value, 10) || 0 })}
                style={{
                  width: '100%',
                  padding: '7px 10px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.86rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.80rem', fontWeight: 700, color: '#475569', marginBottom: '3px' }}>
                पुरुष संख्या
              </label>
              <input
                type="number"
                min="0"
                value={formData.maleBeneficiaries ?? 0}
                onChange={(e) => setFormData({ ...formData, maleBeneficiaries: parseInt(e.target.value, 10) || 0 })}
                style={{
                  width: '100%',
                  padding: '7px 10px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.86rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* Row 4: विनियोजित बजेट & खर्च रकम */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                विनियोजित बजेट (रु.)
              </label>
              <input
                type="number"
                min="0"
                value={formData.budgetAllocated ?? 0}
                onChange={(e) => setFormData({ ...formData, budgetAllocated: parseFloat(e.target.value) || 0 })}
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
                खर्च रकम (रु.)
              </label>
              <input
                type="number"
                min="0"
                value={formData.budgetSpent ?? 0}
                onChange={(e) => setFormData({ ...formData, budgetSpent: parseFloat(e.target.value) || 0 })}
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

          {/* Row 5: सम्पर्क व्यक्ति & फोन & स्थान */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                संयोजक / सम्पर्क व्यक्ति
              </label>
              <input
                type="text"
                value={formData.coordinatorName || ''}
                onChange={(e) => setFormData({ ...formData, coordinatorName: e.target.value })}
                placeholder="उदा: सरिता तामाङ"
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
                सम्पर्क मोबाइल नं.
              </label>
              <input
                type="text"
                value={formData.coordinatorPhone || ''}
                onChange={(e) => setFormData({ ...formData, coordinatorPhone: e.target.value })}
                placeholder="९८४१२२३३४४"
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
                स्थान (टोल / बस्ती) *
              </label>
              <input
                type="text"
                required
                value={formData.location || ''}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="उदा: बासखर्क, मानेखर्क, भोताङ..."
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

          {/* Row 6: स्थिति (Status) & कैफियत (Remarks) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                स्थिति (Status)
              </label>
              <select
                value={formData.status || 'regular'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
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
                <option value="regular">नियमित (Regular)</option>
                <option value="ongoing">सञ्चालित (Ongoing)</option>
                <option value="completed">सम्पन्न (Completed)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                कैफियत / प्रगति विवरण
              </label>
              <input
                type="text"
                value={formData.remarks || ''}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                placeholder="उदा: स्थानीय अग्र्यानिक उत्पादन प्रवर्द्धन..."
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

          {/* ── ROW 7: DEDICATED GIS GPS COORDINATES SECTION (Latitude & Longitude) ── */}
          <div
            style={{
              padding: '1.1rem 1.25rem',
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
                  <h3 style={{ fontSize: '0.90rem', fontWeight: 800, color: '#14532d', margin: 0 }}>
                    GIS भौगोलिक निर्देशांक (GPS Latitude & Longitude)
                  </h3>
                  <p style={{ fontSize: '0.74rem', color: '#166534', margin: '2px 0 0 0' }}>
                    नक्सामा कार्यक्रम/संस्थाको स्थान देखाउन अक्षांश र देशान्तर भर्नुहोस्
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
                  padding: '8px 10px',
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
              marginTop: '0.4rem',
            }}
          >
            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
              {recordToEdit ? (
                <span>सम्पादन भइरहेको: <strong>{recordToEdit.title}</strong></span>
              ) : (
                <span>सबै * चिन्ह भएका फिल्डहरू अनिवार्य छन्</span>
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
                  backgroundColor: catConfig.color,
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.86rem',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting ? 0.7 : 1,
                  boxShadow: `0 2px 6px ${catConfig.color}40`,
                }}
              >
                <Save size={16} />
                <span>
                  {isSubmitting
                    ? 'सुरक्षित हुँदैछ...'
                    : recordToEdit
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
