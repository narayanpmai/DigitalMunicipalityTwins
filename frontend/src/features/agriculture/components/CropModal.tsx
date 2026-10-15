import React, { useState } from 'react';
import { X, Sprout, Save } from 'lucide-react';

interface CropModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (cropData: any) => Promise<void>;
}

export const CropModal: React.FC<CropModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    cropName: '',
    cropType: 'vegetable',
    wardNumber: 3,
    areaHectares: 10,
    productionMt: 120,
    fiscalYear: '2080/081',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.cropName) {
      setErrorMsg('बालीको नाम अनिवार्य छ।');
      return;
    }
    try {
      setIsSubmitting(true);
      setErrorMsg('');
      await onSave(formData);
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || 'कृषि विवरण सुरक्षित गर्न सकिएन।');
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
          maxWidth: '520px',
          backgroundColor: '#fff',
          borderRadius: '12px',
          padding: '1.5rem',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sprout className="text-success" size={24} color="#16a34a" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
              नयाँ कृषि बाली तथा उत्पादन दर्ता
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
          <div className="agri-grid-auto" style={{ marginBottom: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                बालीको नाम *
              </label>
              <input
                type="text"
                required
                value={formData.cropName}
                onChange={(e) => setFormData({ ...formData, cropName: e.target.value })}
                placeholder="उदा: किबी, स्याउ, आलु, अलैंची"
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                बाली वर्ग (Category)
              </label>
              <select
                value={formData.cropType}
                onChange={(e) => setFormData({ ...formData, cropType: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              >
                <option value="vegetable">तरकारी बाली (Vegetable)</option>
                <option value="fruit">फलफूल (Fruit)</option>
                <option value="cash_crop">नगदे बाली (Cash Crop)</option>
                <option value="cereal">खाद्यान्न / अन्नबाली (Cereal)</option>
              </select>
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
                आर्थिक वर्ष
              </label>
              <input
                type="text"
                value={formData.fiscalYear}
                onChange={(e) => setFormData({ ...formData, fiscalYear: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                खेती क्षेत्रफल (हेक्टरमा)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.areaHectares}
                onChange={(e) => setFormData({ ...formData, areaHectares: Number(e.target.value) })}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                वार्षिक उत्पादन (मे.टन)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.productionMt}
                onChange={(e) => setFormData({ ...formData, productionMt: Number(e.target.value) })}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
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
                backgroundColor: '#16a34a',
                color: '#fff',
                cursor: 'pointer',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <Save size={16} />
              {isSubmitting ? 'सुरक्षित हुँदैछ...' : 'रेकर्ड सुरक्षित गर्नुहोस्'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
