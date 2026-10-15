import React, { useState } from 'react';
import { X, Users, Save } from 'lucide-react';
import type { School, Teacher } from '../../../types/education';

interface TeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (teacherData: Partial<Teacher>) => Promise<void>;
  schools: School[];
}

export const TeacherModal: React.FC<TeacherModalProps> = ({
  isOpen,
  onClose,
  onSave,
  schools,
}) => {
  const [formData, setFormData] = useState<Partial<Teacher>>({
    fullName: '',
    schoolId: schools[0]?.id || '',
    schoolName: schools[0]?.nameNepali || schools[0]?.name || '',
    designation: 'मावि शिक्षक',
    serviceType: 'स्थायी',
    mainSubject: 'अनिवार्य गणित',
    qualification: 'स्नातकोत्तर (M.Ed/M.A.)',
    contactPhone: '',
    email: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName) {
      setErrorMsg('शिक्षकको नाम अनिवार्य छ।');
      return;
    }
    try {
      setIsSubmitting(true);
      setErrorMsg('');
      await onSave(formData);
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || 'शिक्षक विवरण सुरक्षित गर्न सकिएन।');
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
          maxWidth: '560px',
          backgroundColor: '#fff',
          borderRadius: '12px',
          padding: '1.5rem',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users className="text-primary" size={24} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
              शिक्षक तथा कर्मचारी दर्ता
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                शिक्षकको पूरा नाम *
              </label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="उदा: राम बहादुर श्रेष्ठ"
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                विद्यालय *
              </label>
              <select
                value={formData.schoolId}
                onChange={(e) => {
                  const s = schools.find((x) => x.id === e.target.value);
                  setFormData({
                    ...formData,
                    schoolId: e.target.value,
                    schoolName: s ? (s.nameNepali || s.name || '') : '',
                  });
                }}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              >
                {schools.map((sch) => (
                  <option key={sch.id} value={sch.id}>
                    {sch.nameNepali || sch.name} (वडा {sch.wardNumber})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                पद / तह
              </label>
              <select
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              >
                <option value="मावि शिक्षक">मावि शिक्षक (Secondary Teacher)</option>
                <option value="निमावि शिक्षक">निमावि शिक्षक (Lower Secondary)</option>
                <option value="प्रावि शिक्षक">प्रावि शिक्षक (Primary Teacher)</option>
                <option value="प्रधानाध्यापक">प्रधानाध्यापक (Headmaster / Principal)</option>
                <option value="ईसीडी सहजकर्ता">ईसीडी सहजकर्ता (ECD Facilitator)</option>
                <option value="लेखापाल / कर्मचारी">लेखापाल / कर्मचारी (Accountant/Staff)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                सेवाको प्रकार
              </label>
              <select
                value={formData.serviceType}
                onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              >
                <option value="स्थायी">स्थायी (Permanent)</option>
                <option value="राहत दरबन्दी">राहत दरबन्दी (Relief)</option>
                <option value="पालिका अनुदान">पालिका अनुदान (Municipal Grant)</option>
                <option value="करार">करार (Contract)</option>
                <option value="निजी स्रोत">निजी स्रोत (Private/PTA)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                मुख्य अध्यापन विषय
              </label>
              <input
                type="text"
                value={formData.mainSubject || ''}
                onChange={(e) => setFormData({ ...formData, mainSubject: e.target.value })}
                placeholder="उदा: विज्ञान, गणित, नेपाली, अंग्रेजी"
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                शैक्षिक योग्यता
              </label>
              <input
                type="text"
                value={formData.qualification || ''}
                onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                placeholder="उदा: B.Ed, M.Sc, M.A."
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
                placeholder="९८..."
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                इमेल
              </label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="teacher@example.com"
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
              {isSubmitting ? 'दर्ता हुँदैछ...' : 'शिक्षक दर्ता गर्नुहोस्'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
