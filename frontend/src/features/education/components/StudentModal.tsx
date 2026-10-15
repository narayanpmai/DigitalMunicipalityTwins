import React, { useState } from 'react';
import { X, GraduationCap, Save } from 'lucide-react';
import type { School, Student } from '../../../types/education';

interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (studentData: Partial<Student>) => Promise<void>;
  schools: School[];
}

export const StudentModal: React.FC<StudentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  schools,
}) => {
  const [formData, setFormData] = useState<Partial<Student>>({
    fullName: '',
    admissionNo: '',
    schoolId: schools[0]?.id || '',
    classGrade: 'कक्षा १',
    rollNumber: 1,
    gender: 'छात्र',
    casteCategory: 'तामाङ/जनजाति',
    scholarshipType: 'छैन',
    parentName: '',
    contactPhone: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName) {
      setErrorMsg('विद्यार्थीको पूरा नाम अनिवार्य छ।');
      return;
    }
    try {
      setIsSubmitting(true);
      setErrorMsg('');
      await onSave(formData);
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || 'विद्यार्थी दर्ता गर्न सकिएन।');
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
            <GraduationCap className="text-primary" size={24} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
              नयाँ विद्यार्थी भर्ना (IEMIS Enrollment)
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
                विद्यार्थीको नाम *
              </label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="उदा: दावा तामाङ"
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                विद्यालय *
              </label>
              <select
                value={formData.schoolId}
                onChange={(e) => setFormData({ ...formData, schoolId: e.target.value })}
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
                कक्षा
              </label>
              <select
                value={formData.classGrade}
                onChange={(e) => setFormData({ ...formData, classGrade: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              >
                {['शिशु / ECD', 'कक्षा १', 'कक्षा २', 'कक्षा ३', 'कक्षा ४', 'कक्षा ५', 'कक्षा ६', 'कक्षा ७', 'कक्षा ८', 'कक्षा ९', 'कक्षा १०', 'कक्षा ११', 'कक्षा १२'].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                रोल नम्बर
              </label>
              <input
                type="number"
                value={formData.rollNumber || 1}
                onChange={(e) => setFormData({ ...formData, rollNumber: Number(e.target.value) })}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                लिङ्ग
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              >
                <option value="छात्र">छात्र (Boy)</option>
                <option value="छात्रा">छात्रा (Girl)</option>
                <option value="अन्य">अन्य (Other)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                जातीय समूह
              </label>
              <select
                value={formData.casteCategory}
                onChange={(e) => setFormData({ ...formData, casteCategory: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              >
                <option value="तामाङ/जनजाति">तामाङ / ह्योल्मो (जनजाति)</option>
                <option value="दलित">दलित</option>
                <option value="क्षेत्री/ब्राह्मण">क्षेत्री / ब्राह्मण</option>
                <option value="अन्य">अन्य</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                अभिभावकको नाम
              </label>
              <input
                type="text"
                value={formData.parentName || ''}
                onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                placeholder="उदा: पासाङ तामाङ"
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
                छात्रवृत्ति विवरण
              </label>
              <select
                value={formData.scholarshipType}
                onChange={(e) => setFormData({ ...formData, scholarshipType: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              >
                <option value="छैन">छैन (None)</option>
                <option value="छात्रा छात्रवृत्ति">छात्रा छात्रवृत्ति (Girls Scholarship)</option>
                <option value="दलित छात्रवृत्ति">दलित छात्रवृत्ति</option>
                <option value="अपाङ्गता छात्रवृत्ति">अपाङ्गता छात्रवृत्ति</option>
                <option value="जेहेन्दार छात्रवृत्ति">जेहेन्दार छात्रवृत्ति</option>
              </select>
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
              {isSubmitting ? 'भर्ना दर्ता हुँदैछ...' : 'भर्ना दर्ता गर्नुहोस्'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
