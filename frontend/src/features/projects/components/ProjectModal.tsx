import React, { useState } from 'react';
import { X, FolderGit2, Save } from 'lucide-react';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (projectData: any) => Promise<void>;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    nameEn: '',
    projectCode: '',
    wardNumber: 1,
    sector: 'road',
    status: 'ongoing',
    budget: 2500000,
    paidAmount: 1000000,
    progressPercentage: 40,
    fiscalYear: '२०८०/०८१',
    fundingSource: 'गाउँपालिका आन्तरिक स्रोत',
    contractor: 'उपभोक्ता समिति',
    description: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      setErrorMsg('योजनाको नाम अनिवार्य छ।');
      return;
    }
    try {
      setIsSubmitting(true);
      setErrorMsg('');
      const autoCode = formData.projectCode || `PPK-W0${formData.wardNumber}-${formData.sector.substring(0, 2).toUpperCase()}-2081-${Math.floor(100 + Math.random() * 900)}`;
      await onSave({ ...formData, projectCode: autoCode });
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || 'योजना सुरक्षित गर्न सकिएन।');
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
          maxWidth: '640px',
          maxHeight: '90vh',
          overflowY: 'auto',
          backgroundColor: '#fff',
          borderRadius: '12px',
          padding: '1.5rem',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FolderGit2 className="text-primary" size={24} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
              नयाँ विकास आयोजना / पूर्वाधार दर्ता
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                आयोजनाको नाम *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="उदा: खहरे-चाैकी सडक स्तरउन्नति"
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                आयोजनाको नाम (English)
              </label>
              <input
                type="text"
                value={formData.nameEn}
                onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                placeholder="e.g. Khahare-Chauki Road Upgrading"
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                विषयगत क्षेत्र (Sector)
              </label>
              <select
                value={formData.sector}
                onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              >
                <option value="road">सडक तथा यातायात (Road)</option>
                <option value="water">खानेपानी तथा सरसफाइ (Water)</option>
                <option value="education">शिक्षा तथा विद्यालय भवन (Education)</option>
                <option value="health">स्वास्थ्य चौकी / अस्पताल (Health)</option>
                <option value="bridge">झोलुङ्गे तथा पक्की पुल (Bridge)</option>
                <option value="tourism">पर्यटन पूर्वाधार (Tourism)</option>
                <option value="agriculture">कृषि तथा सिँचाइ (Agriculture)</option>
                <option value="internet">सूचना तथा सञ्चार (IT)</option>
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
                कुल विनियोजित बजेट (NPR) *
              </label>
              <input
                type="number"
                required
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                हालसम्मको भुक्तानी/खर्च (NPR)
              </label>
              <input
                type="number"
                value={formData.paidAmount}
                onChange={(e) => setFormData({ ...formData, paidAmount: Number(e.target.value) })}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                भौतिक प्रगति (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.progressPercentage}
                onChange={(e) => setFormData({ ...formData, progressPercentage: Number(e.target.value) })}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                आयोजना स्थिति
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              >
                <option value="ongoing">सञ्चालनमा (Ongoing)</option>
                <option value="completed">सम्पन्न (Completed)</option>
                <option value="planned">योजना चरण (Planned)</option>
                <option value="procurement">खरिद/टेन्डर प्रक्रिया (Procurement)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                निर्माणकर्ता / समिति
              </label>
              <input
                type="text"
                value={formData.contractor}
                onChange={(e) => setFormData({ ...formData, contractor: e.target.value })}
                placeholder="उपभोक्ता समिति वा निर्माण व्यवसायी"
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
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
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              आयोजनाको संक्षिप्त विवरण
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="आयोजनाको लक्ष्य, लाभान्वित जनसंख्या वा निर्माण विवरण..."
              style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
            />
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
              {isSubmitting ? 'सुरक्षित हुँदैछ...' : 'आयोजना सुरक्षित गर्नुहोस्'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
