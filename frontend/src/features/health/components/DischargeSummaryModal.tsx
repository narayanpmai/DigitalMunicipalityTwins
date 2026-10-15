import React, { useState, useEffect } from 'react';
import { X, Building2, HeartPulse, Printer, CheckCircle2, ShieldCheck, FileText, Sparkles } from 'lucide-react';
import type { IpdAdmission, HealthDischargeSummary } from '../../../types/health';

interface DischargeSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  admission?: IpdAdmission | null;
  existingSummary?: HealthDischargeSummary | null;
  onSubmit?: (summaryData: Partial<HealthDischargeSummary>) => Promise<any>;
}

export const DischargeSummaryModal: React.FC<DischargeSummaryModalProps> = ({
  isOpen,
  onClose,
  admission,
  existingSummary,
  onSubmit,
}) => {
  const [dischargeNo, setDischargeNo] = useState('');
  const [patientName, setPatientName] = useState('');
  const [patientNo, setPatientNo] = useState('');
  const [patientAge, setPatientAge] = useState<number | ''>('');
  const [patientGender, setPatientGender] = useState('महिला');
  const [bedNumber, setBedNumber] = useState('');
  const [departmentWard, setDepartmentWard] = useState('');
  const [admissionDate, setAdmissionDate] = useState('');
  const [dischargeDate, setDischargeDate] = useState('२०८१/०५/१५');
  const [attendingDoctor, setAttendingDoctor] = useState('डा. प्रशान्त श्रेष्ठ (MDGP)');
  const [provisionalDiagnosis, setProvisionalDiagnosis] = useState('');
  const [finalDiagnosis, setFinalDiagnosis] = useState('');
  const [treatmentGiven, setTreatmentGiven] = useState('');
  const [conditionAtDischarge, setConditionAtDischarge] = useState<'cured' | 'improved' | 'referred' | 'lama' | 'deceased'>('improved');
  const [dischargeMedications, setDischargeMedications] = useState('');
  const [followUpDate, setFollowUpDate] = useState('७ दिनपछि (२०८१/०५/२२)');
  const [doctorAdvice, setDoctorAdvice] = useState('नियमित औषधि सेवन गर्ने, पोषिलो खाना खाने, चिसोबाट बच्ने र समस्या देखिए तत्काल आकस्मिक कक्षमा सम्पर्क गर्ने।');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPrintMode, setIsPrintMode] = useState(false);

  useEffect(() => {
    if (existingSummary) {
      setDischargeNo(existingSummary.dischargeNo);
      setPatientName(existingSummary.patientName);
      setPatientNo(existingSummary.patientNo);
      setPatientAge(existingSummary.patientAge);
      setPatientGender(existingSummary.patientGender);
      setBedNumber(existingSummary.bedNumber);
      setDepartmentWard(existingSummary.departmentWard);
      setAdmissionDate(existingSummary.admissionDate);
      setDischargeDate(existingSummary.dischargeDate);
      setAttendingDoctor(existingSummary.attendingDoctor);
      setProvisionalDiagnosis(existingSummary.provisionalDiagnosis || '');
      setFinalDiagnosis(existingSummary.finalDiagnosis);
      setTreatmentGiven(existingSummary.treatmentGiven);
      setConditionAtDischarge(existingSummary.conditionAtDischarge as any || 'improved');
      setDischargeMedications(existingSummary.dischargeMedications || '');
      setFollowUpDate(existingSummary.followUpDate || '');
      setDoctorAdvice(existingSummary.doctorAdvice || '');
      setIsPrintMode(true);
    } else if (admission) {
      setDischargeNo(`DS-2081-${Math.floor(1000 + Math.random() * 9000)}`);
      setPatientName(admission.patientName);
      setPatientNo(admission.patientId || `PT-2081-${Math.floor(1000 + Math.random() * 9000)}`);
      setPatientAge(admission.age);
      setPatientGender(admission.gender);
      setBedNumber(admission.bedNumber);
      setDepartmentWard(admission.departmentWard);
      setAdmissionDate(admission.admissionDate);
      setDischargeDate(new Date().toISOString().split('T')[0]);
      if (admission.admittingDoctor) setAttendingDoctor(admission.admittingDoctor);
      if (admission.diagnosis) {
        setProvisionalDiagnosis(admission.diagnosis);
        setFinalDiagnosis(admission.diagnosis);
      }
      if (admission.treatmentSummary) setTreatmentGiven(admission.treatmentSummary);
      setConditionAtDischarge('improved');
      setIsPrintMode(false);
    }
  }, [admission, existingSummary, isOpen]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!finalDiagnosis.trim()) {
      alert('कृपया अन्तिम निदान (Final Diagnosis) प्रविष्ट गर्नुहोस्');
      return;
    }
    if (!onSubmit) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        dischargeNo,
        admissionId: admission?.id,
        admissionNo: admission?.admissionNo || '',
        patientNo,
        patientName,
        patientAge: Number(patientAge) || 30,
        patientGender,
        bedNumber,
        departmentWard,
        admissionDate,
        dischargeDate,
        attendingDoctor,
        provisionalDiagnosis,
        finalDiagnosis: finalDiagnosis.trim(),
        treatmentGiven: treatmentGiven.trim() || 'औषधोपचार तथा बेड रेस्ट',
        conditionAtDischarge,
        dischargeMedications,
        followUpDate,
        doctorAdvice,
      });
      setIsPrintMode(true);
    } catch (err) {
      console.error('Failed to create discharge summary', err);
      alert('डिस्चार्ज सारांश सुरक्षित गर्न सकिएन।');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
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
        id="printableDischargeSlip"
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '1rem',
          maxWidth: '850px',
          width: '100%',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
        }}
      >
        {/* Header (Screen View) */}
        <div
          className="no-print"
          style={{
            padding: '1.25rem 1.5rem',
            background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FileText size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
                १५ शय्या अस्पताल डिस्चार्ज सारांश (Clinical Discharge Slip)
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#bfdbfe', margin: '2px 0 0 0' }}>
                पाँचपोखरी आधारभूत अस्पताल • इन-पेसेन्ट (IPD) क्लिनिकल डिस्चार्ज रिपोर्ट
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {isPrintMode && (
              <button
                type="button"
                onClick={handlePrint}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  backgroundColor: '#ffffff',
                  color: '#1d4ed8',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Printer size={16} /> प्रिन्ट गर्नुहोस्
              </button>
            )}
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
                opacity: 0.8,
              }}
            >
              <X size={22} />
            </button>
          </div>
        </div>

        {/* Printable Official Slip Format */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '1.5rem' }}>
          {/* Official Letterhead */}
          <div
            style={{
              textAlign: 'center',
              borderBottom: '2px double #1e3a8a',
              paddingBottom: '1rem',
              marginBottom: '1.5rem',
            }}
          >
            <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>नेपाल सरकार • बागमती प्रदेश • सिन्धुपाल्चोक</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1e3a8a', marginTop: '2px' }}>
              पाँचपोखरी थाङपाल गाउँपालिका
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
              पाँचपोखरी १५ शय्या आधारभूत अस्पताल
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
              भोताङ / मेलम्चीघ्याङ, सिन्धुपाल्चोक • MoHP / DHIS2 OrgUnit: NP_BAG_SIN_P01
            </div>
            <div
              style={{
                display: 'inline-block',
                marginTop: '8px',
                padding: '4px 16px',
                backgroundColor: '#eff6ff',
                color: '#1e3a8a',
                border: '1px solid #bfdbfe',
                borderRadius: '9999px',
                fontWeight: 700,
                fontSize: '0.85rem',
              }}
            >
              बिरामी डिस्चार्ज सारांश तथा सल्लाह पत्र (DISCHARGE SUMMARY SLIP)
            </div>
          </div>

          {isPrintMode ? (
            /* PRINT / READ-ONLY SUMMARY VIEW */
            <div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '0.75rem',
                  backgroundColor: '#f8fafc',
                  padding: '1rem',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  marginBottom: '1.25rem',
                  fontSize: '0.875rem',
                }}
              >
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>डिस्चार्ज नं:</span>
                  <strong>{dischargeNo}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>बिरामीको नाम:</span>
                  <strong>{patientName}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>उमेर / लिङ्ग:</span>
                  <strong>{patientAge} वर्ष / {patientGender}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>शय्या / वार्ड:</span>
                  <strong>{bedNumber} ({departmentWard})</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>भर्ना मिति:</span>
                  <span>{admissionDate}</span>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>डिस्चार्ज मिति:</span>
                  <span>{dischargeDate}</span>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>उपचारमा संलग्न चिकित्सक:</span>
                  <span>{attendingDoctor}</span>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>डिस्चार्ज अवस्था:</span>
                  <span style={{ color: '#059669', fontWeight: 700 }}>
                    {conditionAtDischarge === 'cured'
                      ? 'पूर्ण निको (Cured)'
                      : conditionAtDischarge === 'improved'
                      ? 'सुधार भएको (Improved)'
                      : conditionAtDischarge === 'referred'
                      ? 'अन्यत्र सिफारिस (Referred)'
                      : conditionAtDischarge}
                  </span>
                </div>
              </div>

              {/* Diagnoses */}
              <div style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>अन्तिम रोग पहिचान (Final Diagnosis):</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#1e3a8a', marginTop: '4px' }}>
                  {finalDiagnosis}
                </div>
                {provisionalDiagnosis && provisionalDiagnosis !== finalDiagnosis && (
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
                    भर्ना हुँदाको सम्भावित निदान: {provisionalDiagnosis}
                  </div>
                )}
              </div>

              {/* Treatment Given */}
              <div style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>भर्ना अवधिमा दिइएको उपचार (Treatment Given in Hospital):</div>
                <div style={{ fontSize: '0.9rem', color: '#334155', marginTop: '4px', whiteSpace: 'pre-wrap' }}>
                  {treatmentGiven}
                </div>
              </div>

              {/* Discharge Medications */}
              <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.85rem', color: '#166534', fontWeight: 700 }}>घरमा खाने औषधिहरू (Discharge Medications):</div>
                <div style={{ fontSize: '0.9rem', color: '#14532d', marginTop: '4px', whiteSpace: 'pre-wrap' }}>
                  {dischargeMedications || 'कुनै विशेष औषधि छैन'}
                </div>
              </div>

              {/* Doctor Advice & Follow-up */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>चिकित्सकको विशेष सल्लाह र परहेज:</div>
                  <div style={{ fontSize: '0.9rem', color: '#334155', marginTop: '4px' }}>{doctorAdvice}</div>
                </div>
                <div style={{ padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: '#fffbeb' }}>
                  <div style={{ fontSize: '0.85rem', color: '#92400e', fontWeight: 700 }}>पुनः स्वास्थ्य परीक्षण मिति (Follow-up Date):</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#b45309', marginTop: '4px' }}>{followUpDate}</div>
                </div>
              </div>

              {/* Doctor Signature Block */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: '2.5rem', marginTop: '2rem', borderTop: '1px solid #e2e8f0' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: '180px', borderBottom: '1px solid #94a3b8', marginBottom: '4px' }}></div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>बिरामी / अभिभावकको हस्ताक्षर</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e3a8a' }}>{attendingDoctor}</div>
                  <div style={{ width: '180px', borderBottom: '1px solid #94a3b8', marginBottom: '4px' }}></div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>उपचारमा संलग्न चिकित्सकको हस्ताक्षर र कोड</div>
                </div>
              </div>
            </div>
          ) : (
            /* DISCHARGE FORM FILLING VIEW */
            <form onSubmit={handleSubmit}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1rem',
                  marginBottom: '1rem',
                  padding: '1rem',
                  backgroundColor: '#f8fafc',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                }}
              >
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>बिरामीको नाम</label>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>{patientName}</div>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>शय्या / कक्ष</label>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>{bedNumber} ({departmentWard})</div>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>भर्ना मिति</label>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#334155' }}>{admissionDate}</div>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#1e3a8a' }}>डिस्चार्ज मिति *</label>
                  <input
                    type="text"
                    value={dischargeDate}
                    onChange={(e) => setDischargeDate(e.target.value)}
                    required
                    style={{ width: '100%', padding: '4px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                    अन्तिम रोग पहिचान (Final Diagnosis) *
                  </label>
                  <input
                    type="text"
                    value={finalDiagnosis}
                    onChange={(e) => setFinalDiagnosis(e.target.value)}
                    placeholder="जस्तै: Pneumonia Resolved, Uneventful Post-op Day 5"
                    required
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                    डिस्चार्ज हुँदाको अवस्था (Condition at Discharge)
                  </label>
                  <select
                    value={conditionAtDischarge}
                    onChange={(e) => setConditionAtDischarge(e.target.value as any)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                  >
                    <option value="improved">सुधार भएको (Improved)</option>
                    <option value="cured">पूर्ण निको (Cured)</option>
                    <option value="referred">उच्च तहको अस्पतालमा सिफारिस (Referred)</option>
                    <option value="lama">आफ्नै खुशीले डिस्चार्ज (LAMA)</option>
                    <option value="deceased">मृत्यु (Deceased)</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  भर्ना अवधिमा दिइएको उपचार सारांश (Treatment Given During Hospital Stay)
                </label>
                <textarea
                  rows={2}
                  value={treatmentGiven}
                  onChange={(e) => setTreatmentGiven(e.target.value)}
                  placeholder="जस्तै: IV Ceftriaxone 1g BD x 3 days, Nebulization, Oxygen therapy, Chest physiotherapy..."
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  घरमा सेवन गर्नुपर्ने औषधिहरू (Take Home Discharge Medications)
                </label>
                <textarea
                  rows={2}
                  value={dischargeMedications}
                  onChange={(e) => setDischargeMedications(e.target.value)}
                  placeholder="जस्तै: Cefixime 200mg 1 tab BD x 5 days, Paracetamol 500mg SOS..."
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                    पुनः फलो-अप जाँच मिति (Follow-up Date)
                  </label>
                  <input
                    type="text"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    placeholder="जस्तै: ७ दिनपछि वा २०८१/०५/२२"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                    उपचारमा संलग्न चिकित्सक (Doctor Name)
                  </label>
                  <input
                    type="text"
                    value={attendingDoctor}
                    onChange={(e) => setAttendingDoctor(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  चिकित्सकको विशेष सल्लाह / घरको स्याहार निर्देशन (Doctor's Advice & Discharge Instructions)
                </label>
                <textarea
                  rows={2}
                  value={doctorAdvice}
                  onChange={(e) => setDoctorAdvice(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '1rem',
                  borderTop: '1px solid #e2e8f0',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#1d4ed8' }}>
                  <CheckCircle2 size={16} />
                  यो डिस्चार्ज सारांश सुरक्षित गरेपछि अस्पतालको शय्या (Bed) स्वतः खाली (Discharged) हुनेछ।
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={onClose}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#f1f5f9',
                      color: '#475569',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
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
                      backgroundColor: '#1d4ed8',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      cursor: isSubmitting ? 'not-allowed' : 'pointer',
                      opacity: isSubmitting ? 0.7 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <Sparkles size={16} />
                    {isSubmitting ? 'डिस्चार्ज गर्दै...' : 'डिस्चार्ज गर्नुहोस् र रिपोर्ट बनाउनुहोस्'}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
