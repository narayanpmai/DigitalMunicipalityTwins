import React, { useState, useEffect } from 'react';
import { X, Building2, ShieldCheck, HeartPulse } from 'lucide-react';
import type { IpdAdmission } from '../../../types/health';
import { getHealthDoctors, getHealthIpdWards } from '../healthSettingsStorage';

interface IpdAdmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedBed?: string;
  admissions: IpdAdmission[];
  onSubmit: (admissionData: Partial<IpdAdmission>) => Promise<any>;
}

export const IpdAdmissionModal: React.FC<IpdAdmissionModalProps> = ({
  isOpen,
  onClose,
  preSelectedBed,
  admissions,
  onSubmit,
}) => {
  const [doctorsList, setDoctorsList] = useState(() => getHealthDoctors().filter(d => d.isActive));
  const [ipdWardsList, setIpdWardsList] = useState(() => getHealthIpdWards());
  const defaultDocName = doctorsList[0] ? `${doctorsList[0].nameNepali} (${doctorsList[0].designation})` : 'डा. सुजन खनाल (MDGP)';

  useEffect(() => {
    const handleSettingsChange = () => {
      setDoctorsList(getHealthDoctors().filter(d => d.isActive));
      setIpdWardsList(getHealthIpdWards());
    };
    window.addEventListener('p5-health-settings-changed', handleSettingsChange);
    return () => window.removeEventListener('p5-health-settings-changed', handleSettingsChange);
  }, []);

  const [bedNumber, setBedNumber] = useState(preSelectedBed || 'Bed-01');
  const [patientName, setPatientName] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [gender, setGender] = useState('महिला');
  const [phone, setPhone] = useState('');
  const [wardNumber, setWardNumber] = useState<number>(3);
  const [admittingDoctor, setAdmittingDoctor] = useState(defaultDocName);
  const [diagnosis, setDiagnosis] = useState('');
  const [hasInsurance, setHasInsurance] = useState(false);
  const [insuranceNo, setInsuranceNo] = useState('');
  const [admissionDate, setAdmissionDate] = useState('२०८१/०५/१५');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync preSelectedBed if provided
  React.useEffect(() => {
    if (preSelectedBed) {
      setBedNumber(preSelectedBed);
    }
  }, [preSelectedBed]);

  if (!isOpen) return null;

  // Derive department ward from bed number using configured Master Wards
  const getWardNameForBed = (bed: string) => {
    const num = parseInt(bed.replace(/[^0-9]/g, ''), 10) || 1;
    let accumulated = 0;
    for (const w of ipdWardsList) {
      accumulated += w.totalBeds;
      if (num <= accumulated) return w.wardName;
    }
    return ipdWardsList[ipdWardsList.length - 1]?.wardName || 'अन्तरङ्ग वार्ड';
  };

  const occupiedBedNumbers = new Set(
    admissions
      .filter((a) => a.status === 'admitted')
      .map((a) => a.bedNumber)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim() || !age) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        patientName: patientName.trim(),
        age: Number(age),
        gender,
        phone: phone.trim(),
        wardNumber,
        bedNumber,
        departmentWard: getWardNameForBed(bedNumber),
        admissionDate,
        admittingDoctor,
        diagnosis: diagnosis.trim() || 'Acute Condition',
        status: 'admitted',
        hasInsurance,
        insuranceNo: hasInsurance ? insuranceNo.trim() : undefined,
      });
      onClose();
    } catch (err) {
      console.error('Failed to admit patient', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9998,
        padding: '1rem',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '640px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '92vh',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 24px',
            backgroundColor: '#0284c7',
            color: '#ffffff',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Building2 size={22} />
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>
                अन्तरङ्ग (IPD) शैय्या भर्ना (15-Bed Admission)
              </h2>
              <p style={{ fontSize: '0.78rem', margin: 0, opacity: 0.9 }}>
                पाँचपोखरी प्राथमिक आधारभूत अस्पताल - १५ शैय्या व्यवस्थापन
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '20px 24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Bed Allocation Selection */}
          <div style={{ backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '10px', padding: '12px 14px' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0369a1', marginBottom: '8px' }}>
              १. शैय्या छनोट (Select Bed 01 to 15)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px', marginBottom: '8px' }}>
              {Array.from({ length: 15 }, (_, i) => {
                const bId = `Bed-${String(i + 1).padStart(2, '0')}`;
                const isOccupied = occupiedBedNumbers.has(bId);
                const isSelected = bedNumber === bId;

                return (
                  <button
                    key={bId}
                    type="button"
                    disabled={isOccupied}
                    onClick={() => setBedNumber(bId)}
                    style={{
                      padding: '8px 4px',
                      borderRadius: '8px',
                      border: isSelected ? '2px solid #0284c7' : '1px solid #cbd5e1',
                      backgroundColor: isOccupied ? '#fee2e2' : isSelected ? '#e0f2fe' : '#ffffff',
                      color: isOccupied ? '#dc2626' : isSelected ? '#0369a1' : '#334155',
                      fontWeight: 700,
                      fontSize: '0.78rem',
                      cursor: isOccupied ? 'not-allowed' : 'pointer',
                      textAlign: 'center',
                    }}
                  >
                    <div>{bId}</div>
                    <div style={{ fontSize: '0.65rem', fontWeight: 500 }}>
                      {isOccupied ? 'भरिएको' : 'खाली'}
                    </div>
                  </button>
                );
              })}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#0369a1', fontWeight: 600 }}>
              छानिएको शैय्या: <strong>{bedNumber}</strong> — {getWardNameForBed(bedNumber)}
            </div>
          </div>

          {/* Patient Details */}
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>
              २. भर्ना हुने बिरामीको विवरण (Patient Information)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '10px', marginBottom: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                  बिरामीको पूरा नाम *
                </label>
                <input
                  type="text"
                  required
                  placeholder="उदा: हरिकृष्ण श्रेष्ठ"
                  className="dt-input"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                  उमेर *
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  max={125}
                  placeholder="52"
                  className="dt-input"
                  value={age}
                  onChange={(e) => setAge(e.target.value ? Number(e.target.value) : '')}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                  लिङ्ग
                </label>
                <select
                  className="dt-input"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                >
                  <option value="पुरुष">पुरुष (Male)</option>
                  <option value="महिला">महिला (Female)</option>
                  <option value="अन्य">अन्य (Other)</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                  सम्पर्क फोन
                </label>
                <input
                  type="tel"
                  placeholder="९८xxxxxxxx"
                  className="dt-input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                  वडा नं.
                </label>
                <select
                  className="dt-input"
                  value={wardNumber}
                  onChange={(e) => setWardNumber(Number(e.target.value))}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((w) => (
                    <option key={w} value={w}>
                      वडा नं. {w}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Clinical Details */}
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>
              ३. उपचार तथा भर्ना विवरण (Clinical Details)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                  भर्ना गर्ने चिकित्सक (Admitting Doctor) *
                </label>
                <select
                  className="dt-input"
                  value={admittingDoctor}
                  onChange={(e) => setAdmittingDoctor(e.target.value)}
                >
                  {doctorsList.length > 0 ? (
                    doctorsList.map((doc) => {
                      const val = `${doc.nameNepali} (${doc.designation}${doc.nmcNumber ? ` - NMC ${doc.nmcNumber}` : ''})`;
                      return (
                        <option key={doc.id} value={val}>
                          {doc.nameNepali} ({doc.designation})
                        </option>
                      );
                    })
                  ) : (
                    <option value="डा. सुजन खनाल (MDGP)">डा. सुजन खनाल (MDGP)</option>
                  )}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                  भर्ना मिति (Admission Date)
                </label>
                <input
                  type="text"
                  placeholder="२०८१/०५/१५"
                  className="dt-input"
                  value={admissionDate}
                  onChange={(e) => setAdmissionDate(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                रोग निदान / भर्नाको कारण (Provisional Diagnosis) *
              </label>
              <input
                type="text"
                required
                placeholder="उदा: Acute Gastroenteritis with severe dehydration, Pneumonia"
                className="dt-input"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
              />
            </div>
          </div>

          {/* Insurance */}
          <div style={{ backgroundColor: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>
              <input
                type="checkbox"
                checked={hasInsurance}
                onChange={(e) => setHasInsurance(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: '#16a34a' }}
              />
              <ShieldCheck size={16} color={hasInsurance ? '#16a34a' : '#64748b'} />
              <span>स्वास्थ्य बीमा अन्तर्गत IPD शैय्या निशुल्क सुविधा</span>
            </label>
            {hasInsurance && (
              <div style={{ marginTop: '8px' }}>
                <input
                  type="text"
                  placeholder="बीमा कार्ड नं: HIB-03-99421"
                  className="dt-input"
                  value={insuranceNo}
                  onChange={(e) => setInsuranceNo(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '8px', borderTop: '1px solid #e2e8f0' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#475569',
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
                padding: '8px 20px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#0284c7',
                color: '#ffffff',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {isSubmitting ? 'भर्ना गरिँदैछ...' : '✓ शैय्यामा भर्ना सुरक्षित गर्नुहोस्'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface IpdDischargeModalProps {
  admission: IpdAdmission | null;
  onClose: () => void;
  onSubmit: (id: string, dischargeData: { dischargeDate?: string; treatmentSummary?: string }) => Promise<any>;
}

export const IpdDischargeModal: React.FC<IpdDischargeModalProps> = ({ admission, onClose, onSubmit }) => {
  const [dischargeDate, setDischargeDate] = useState('२०८१/०५/१८');
  const [treatmentSummary, setTreatmentSummary] = useState('उपचार पश्चात स्वास्थ्य स्थिति सामान्य, आवश्यक औषधि सहित घर पठाइएको ।');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!admission) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(admission.id, { dischargeDate, treatmentSummary });
      onClose();
    } catch (err) {
      console.error('Failed to discharge patient', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1rem',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '520px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            backgroundColor: '#0f172a',
            color: '#ffffff',
          }}
        >
          <div style={{ fontWeight: 800, fontSize: '1rem' }}>
            शैय्या डिस्चार्ज प्रक्रिया ({admission.bedNumber})
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ backgroundColor: '#f1f5f9', padding: '10px 14px', borderRadius: '8px', fontSize: '0.84rem' }}>
            <div>भर्ना नं: <strong style={{ fontFamily: 'monospace' }}>{admission.admissionNo}</strong></div>
            <div>बिरामी: <strong>{admission.patientName}</strong> ({admission.age} वर्ष)</div>
            <div>शैय्या: <strong>{admission.bedNumber}</strong> — {admission.departmentWard}</div>
            <div>रोग निदान: <strong>{admission.diagnosis}</strong></div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
              डिस्चार्ज मिति (Discharge Date) *
            </label>
            <input
              type="text"
              required
              className="dt-input"
              value={dischargeDate}
              onChange={(e) => setDischargeDate(e.target.value)}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
              उपचार सारांश तथा डिस्चार्ज सल्लाह (Discharge Summary & Advice) *
            </label>
            <textarea
              required
              rows={3}
              className="dt-input"
              value={treatmentSummary}
              onChange={(e) => setTreatmentSummary(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '8px', borderTop: '1px solid #e2e8f0' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#475569',
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
                padding: '8px 20px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#dc2626',
                color: '#ffffff',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {isSubmitting ? 'डिस्चार्ज गरिँदैछ...' : '✓ डिस्चार्ज प्रमाणित गर्नुहोस्'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

