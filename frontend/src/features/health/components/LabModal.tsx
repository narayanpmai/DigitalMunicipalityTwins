import React, { useState, useEffect } from 'react';
import { X, Activity, ShieldCheck, CheckCircle2 } from 'lucide-react';
import type { LabTestRecord } from '../../../types/health';
import { getHealthLabTests, getHealthDoctors } from '../healthSettingsStorage';

interface LabOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (testData: Partial<LabTestRecord>) => Promise<any>;
}

export const LabOrderModal: React.FC<LabOrderModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [labCatalog, setLabCatalog] = useState(() => getHealthLabTests().filter(t => t.isActive));
  const [doctorsList, setDoctorsList] = useState(() => getHealthDoctors().filter(d => d.isActive));

  useEffect(() => {
    const handleSettingsChange = () => {
      setLabCatalog(getHealthLabTests().filter(t => t.isActive));
      setDoctorsList(getHealthDoctors().filter(d => d.isActive));
    };
    window.addEventListener('p5-health-settings-changed', handleSettingsChange);
    return () => window.removeEventListener('p5-health-settings-changed', handleSettingsChange);
  }, []);

  const firstTest = labCatalog[0];
  const firstDoc = doctorsList[0];

  const [patientName, setPatientName] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [gender, setGender] = useState('महिला');
  const [testCategory, setTestCategory] = useState(firstTest ? firstTest.category : 'हेमाटोलोजी (Hematology)');
  const [testName, setTestName] = useState(firstTest ? firstTest.testName : 'Complete Blood Count (CBC)');
  const [sampleType, setSampleType] = useState(firstTest ? firstTest.sampleType : 'रगत (Whole Blood EDTA)');
  const [orderedBy, setOrderedBy] = useState(firstDoc ? `${firstDoc.nameNepali || firstDoc.name} (${firstDoc.designation})` : 'डा. सुजन खनाल (MDGP)');
  const [fee, setFee] = useState<number>(firstTest?.rate ?? firstTest?.price ?? 350);
  const [isCoveredByInsurance, setIsCoveredByInsurance] = useState<boolean>(firstTest ? Boolean(firstTest.isCoveredByInsurance ?? firstTest.isInsuranceCovered) : true);
  const [normalRange, setNormalRange] = useState(firstTest ? firstTest.normalRange : 'Hb: 12-16 g/dL, WBC: 4000-11000 /cumm, Plt: 1.5-4.5 Lakh');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const testCatalog: Record<string, { category: string; sample: string; fee: number; normal: string }> = {
    'Complete Blood Count (CBC)': {
      category: 'हेमाटोलोजी (Hematology)',
      sample: 'रगत (Whole Blood EDTA)',
      fee: 350,
      normal: 'Hb: 12-16 g/dL, WBC: 4000-11000 /cumm, Plt: 1.5-4.5 Lakh',
    },
    'Random Blood Sugar (RBS)': {
      category: 'बायोकेमिस्ट्री (Biochemistry)',
      sample: 'रगत (Fluoride / Serum)',
      fee: 80,
      normal: '70 - 140 mg/dL',
    },
    'Urine Routine & Microscopic (R/E)': {
      category: 'क्लिनिकल प्याथोलोजी (Clinical Pathology)',
      sample: 'पिसाब (Clean Catch Urine)',
      fee: 100,
      normal: 'Color: Pale yellow, Pus cells: 1-2 /hpf, Albumin: Nil, Sugar: Nil',
    },
    'Dengue NS1 Antigen & IgM/IgG': {
      category: 'सेरोलोजी (Serology)',
      sample: 'रगत (Serum)',
      fee: 500,
      normal: 'Negative / Non-reactive',
    },
    'Widal Test (Typhoid Serology)': {
      category: 'सेरोलोजी (Serology)',
      sample: 'रगत (Serum)',
      fee: 200,
      normal: 'Titre < 1:80 (Negative)',
    },
    'Liver Function Test (LFT)': {
      category: 'बायोकेमिस्ट्री (Biochemistry)',
      sample: 'रगत (Serum)',
      fee: 650,
      normal: 'Bilirubin: 0.2-1.0 mg/dL, SGPT: 5-40 U/L, SGOT: 5-40 U/L',
    },
    'Renal Function Test (RFT / Urea, Cr)': {
      category: 'बायोकेमिस्ट्री (Biochemistry)',
      sample: 'रगत (Serum)',
      fee: 450,
      normal: 'Urea: 15-40 mg/dL, Creatinine: 0.6-1.2 mg/dL',
    },
    'Sputum for AFB (क्षयरोग परीक्षण)': {
      category: 'माइक्रोबायोलोजी (Microbiology)',
      sample: 'खकार (Early Morning Sputum)',
      fee: 0,
      normal: 'No Acid Fast Bacilli seen (Negative - निशुल्क)',
    },
  };

  const handleTestChange = (selected: string) => {
    setTestName(selected);
    const catalogItem = labCatalog.find((t) => t.testName === selected);
    if (catalogItem) {
      setTestCategory(catalogItem.category);
      setSampleType(catalogItem.sampleType);
      setFee(catalogItem.rate ?? catalogItem.price ?? 0);
      setNormalRange(catalogItem.normalRange);
      setIsCoveredByInsurance(Boolean(catalogItem.isCoveredByInsurance ?? catalogItem.isInsuranceCovered));
    } else {
      const item = testCatalog[selected];
      if (item) {
        setTestCategory(item.category);
        setSampleType(item.sample);
        setFee(item.fee);
        setNormalRange(item.normal);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim() || !age) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        patientName: patientName.trim(),
        age: Number(age),
        gender,
        testCategory,
        testName,
        sampleType,
        orderedBy,
        fee: isCoveredByInsurance ? 0 : fee,
        isCoveredByInsurance,
        normalRange,
        status: 'pending',
      });
      onClose();
    } catch (err) {
      console.error('Failed to order lab test', err);
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
          maxWidth: '620px',
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
            backgroundColor: '#059669',
            color: '#ffffff',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Activity size={22} />
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>
                नयाँ प्रयोगशाला परीक्षण अर्डर (Laboratory Test Order)
              </h2>
              <p style={{ fontSize: '0.78rem', margin: 0, opacity: 0.9 }}>
                पाँचपोखरी प्राथमिक आधारभूत अस्पताल - रोग निदान प्रयोगशाला
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
          {/* Patient Details */}
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>
              १. बिरामीको विवरण (Patient Information)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                  बिरामीको नाम *
                </label>
                <input
                  type="text"
                  required
                  placeholder="उदा: सीता कुमारी तामाङ"
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
                  placeholder="34"
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
                  <option value="महिला">महिला (Female)</option>
                  <option value="पुरुष">पुरुष (Male)</option>
                  <option value="अन्य">अन्य (Other)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Test Selection */}
          <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '12px 14px' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#166534', marginBottom: '8px' }}>
              २. प्रयोगशाला परीक्षण छनोट (Select Test)
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#166534', marginBottom: '4px' }}>
                परीक्षणको नाम (Test Name) *
              </label>
              <select
                className="dt-input"
                value={testName}
                onChange={(e) => handleTestChange(e.target.value)}
              >
                {labCatalog.length > 0
                  ? labCatalog.map((t) => (
                      <option key={t.id} value={t.testName}>
                        {t.testName} — {t.category} (रु {t.rate ?? t.price})
                      </option>
                    ))
                  : Object.keys(testCatalog).map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.82rem' }}>
              <div>
                <span style={{ color: '#64748b' }}>वर्ग (Category): </span>
                <strong style={{ color: '#0f172a' }}>{testCategory}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>नमुना (Sample): </span>
                <strong style={{ color: '#0f172a' }}>{sampleType}</strong>
              </div>
            </div>
            <div style={{ marginTop: '6px', fontSize: '0.78rem', color: '#475569' }}>
              सामान्य दायरा (Normal Range): <em>{normalRange}</em>
            </div>
          </div>

          {/* Ordering Doctor & Insurance */}
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>
              ३. सिफारिस तथा शुल्क (Doctor & Insurance)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                  सिफारिस गर्ने चिकित्सक (Doctor)
                </label>
                <select
                  className="dt-input"
                  value={orderedBy}
                  onChange={(e) => setOrderedBy(e.target.value)}
                >
                  {doctorsList.length > 0 ? (
                    doctorsList.map((doc) => {
                      const docName = doc.nameNepali || doc.name;
                      const val = `${docName} (${doc.designation})`;
                      return (
                        <option key={doc.id} value={val}>
                          {docName} ({doc.designation})
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
                  सरकारी ल्याब शुल्क
                </label>
                <input
                  type="number"
                  className="dt-input"
                  value={fee}
                  onChange={(e) => setFee(Number(e.target.value))}
                />
              </div>
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>
                <input
                  type="checkbox"
                  checked={isCoveredByInsurance}
                  onChange={(e) => setIsCoveredByInsurance(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: '#16a34a' }}
                />
                <ShieldCheck size={16} color={isCoveredByInsurance ? '#16a34a' : '#64748b'} />
                <span>स्वास्थ्य बीमा कार्यक्रममा आवद्ध (ल्याब शुल्क १००% निशुल्क)</span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>
              लाग्ने शुल्क:{' '}
              <span style={{ color: isCoveredByInsurance ? '#16a34a' : '#dc2626' }}>
                {isCoveredByInsurance ? 'रु. ०/- (बीमा अन्तर्गत निशुल्क)' : `रु. ${fee}/-`}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
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
                  backgroundColor: '#059669',
                  color: '#ffffff',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {isSubmitting ? 'अर्डर हुँदैछ...' : '✓ ल्याब परीक्षण अर्डर गर्नुहोस्'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

interface LabResultModalProps {
  test: LabTestRecord | null;
  onClose: () => void;
  onSubmit: (id: string, updateData: Partial<LabTestRecord>) => Promise<any>;
}

export const LabResultModal: React.FC<LabResultModalProps> = ({ test, onClose, onSubmit }) => {
  const [findings, setFindings] = useState(test?.results?.findings || '');
  const [remarks, setRemarks] = useState(test?.remarks || 'परीक्षण नतिजा सामान्य सीमा भित्र रहेको ।');
  const [technician, setTechnician] = useState('ल्याब टेक्निसियन - प्रकाश तामाङ');
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (test) {
      setFindings(test?.results?.findings || '');
      setRemarks(test?.remarks || 'परीक्षण नतिजा सामान्य सीमा भित्र रहेको ।');
    }
  }, [test]);

  if (!test) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(test.id, {
        status: 'completed',
        results: {
          findings,
          reportedBy: technician,
          reportedAt: '२०८१/०५/१५',
        },
        remarks,
      });
      onClose();
    } catch (err) {
      console.error('Failed to update lab results', err);
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
          maxWidth: '560px',
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
            backgroundColor: '#059669',
            color: '#ffffff',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={20} />
            <span style={{ fontWeight: 800, fontSize: '1rem' }}>
              प्रयोगशाला नतिजा प्रविष्टि (Lab Result Entry)
            </span>
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
          <div style={{ backgroundColor: '#f0fdf4', padding: '10px 14px', borderRadius: '8px', fontSize: '0.84rem' }}>
            <div>अर्डर नं: <strong style={{ fontFamily: 'monospace' }}>{test.testOrderNo}</strong></div>
            <div>बिरामी: <strong>{test.patientName}</strong> ({test.age} वर्ष, {test.gender})</div>
            <div>परीक्षण: <strong style={{ color: '#059669' }}>{test.testName}</strong> ({test.testCategory})</div>
            <div style={{ color: '#64748b', fontSize: '0.78rem' }}>सामान्य सीमा: {test.normalRange}</div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
              परीक्षण नतिजा / मापन (Findings / Values) *
            </label>
            <textarea
              required
              rows={3}
              placeholder="उदा: Hb: 13.8 g/dL, TLC: 7,200 /cumm, Platelets: 2.8 Lakh /cumm, Neutrophil: 65%, Lymphocyte: 30%"
              className="dt-input"
              value={findings}
              onChange={(e) => setFindings(e.target.value)}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
              प्राविधिक कैफियत (Remarks)
            </label>
            <input
              type="text"
              className="dt-input"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
              परीक्षण गर्ने ल्याब प्राविधिक (Technologist)
            </label>
            <input
              type="text"
              className="dt-input"
              value={technician}
              onChange={(e) => setTechnician(e.target.value)}
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
                backgroundColor: '#059669',
                color: '#ffffff',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {isSubmitting ? 'प्रविष्टि हुँदैछ...' : '✓ नतिजा प्रमाणित गरि सम्पन्न गर्नुहोस्'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
