import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Pill, CheckCircle2, Sparkles, FileText } from 'lucide-react';
import type { HealthPrescription, PrescribedMedicine, MedicineStockItem, PatientRecord } from '../../../types/health';
import { getHealthDoctors, getHealthDepartments } from '../healthSettingsStorage';

interface PrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient?: PatientRecord | null;
  availableMedicines: MedicineStockItem[];
  onSubmit: (rxData: Partial<HealthPrescription>) => Promise<any>;
}

const COMMON_FREQUENCIES = [
  '१-०-१ (बिहान र बेलुका खानापछि)',
  '१-०-० (बिहान १ पटक खाली पेटमा)',
  '०-०-१ (राति सुत्ने बेला)',
  '१-१-१ (बिहान, दिउँसो र बेलुका)',
  'आवश्यक परेको बेला (SOS)',
  '१-०-० (बिहान १ पटक खानापछि)',
];

export const PrescriptionModal: React.FC<PrescriptionModalProps> = ({
  isOpen,
  onClose,
  patient,
  availableMedicines,
  onSubmit,
}) => {
  const [doctorsList, setDoctorsList] = useState(() => getHealthDoctors().filter((d) => d.isActive));
  const [departmentsList, setDepartmentsList] = useState(() => getHealthDepartments());
  const defaultDoc = doctorsList[0] ? `${doctorsList[0].nameNepali || doctorsList[0].name} (${doctorsList[0].designation})` : 'डा. प्रशान्त श्रेष्ठ (MBBS, MDGP)';
  const defaultDept = departmentsList[0]?.name || 'सामान्य चिकित्सा (General OPD)';

  useEffect(() => {
    const handleSettingsChange = () => {
      setDoctorsList(getHealthDoctors().filter((d) => d.isActive));
      setDepartmentsList(getHealthDepartments());
    };
    window.addEventListener('p5-health-settings-changed', handleSettingsChange);
    return () => window.removeEventListener('p5-health-settings-changed', handleSettingsChange);
  }, []);

  const [patientName, setPatientName] = useState('');
  const [patientNo, setPatientNo] = useState('');
  const [patientAge, setPatientAge] = useState<number | ''>('');
  const [patientGender, setPatientGender] = useState('महिला');
  const [wardNumber, setWardNumber] = useState<number>(3);
  const [doctorName, setDoctorName] = useState(defaultDoc);
  const [department, setDepartment] = useState(defaultDept);
  const [diagnosis, setDiagnosis] = useState('');
  const [isInsured, setIsInsured] = useState(false);
  const [insuranceNumber, setInsuranceNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [medicines, setMedicines] = useState<PrescribedMedicine[]>([
    {
      medicineName: '',
      dosage: '1 चक्की (Tablet)',
      frequency: '१-०-१ (बिहान र बेलुका खानापछि)',
      durationDays: 5,
      quantity: 10,
      instructions: 'खाना खाएपछि प्रशस्त पानीसँग खाने',
    },
  ]);

  useEffect(() => {
    if (patient) {
      setPatientName(patient.fullName || `${patient.firstName} ${patient.lastName}`);
      setPatientNo(patient.patientNo || '');
      setPatientAge(patient.age || '');
      setPatientGender(patient.gender === 'male' ? 'पुरुष' : patient.gender === 'female' ? 'महिला' : 'अन्य');
      setWardNumber(patient.wardNumber || 3);
      if (patient.department) setDepartment(patient.department);
      if (patient.attendingDoctor) setDoctorName(patient.attendingDoctor);
      if (patient.provisionalDiagnosis) setDiagnosis(patient.provisionalDiagnosis);
      setIsInsured(Boolean(patient.hasHealthInsurance));
      setInsuranceNumber(patient.insuranceNumber || '');
    } else {
      setPatientName('');
      setPatientNo(`PT-2081-${Math.floor(1000 + Math.random() * 9000)}`);
      setPatientAge('');
      setPatientGender('महिला');
      setWardNumber(3);
      setDiagnosis('');
      setIsInsured(false);
      setInsuranceNumber('');
    }
  }, [patient, isOpen]);

  if (!isOpen) return null;

  const handleAddMedicineRow = () => {
    setMedicines((prev) => [
      ...prev,
      {
        medicineName: '',
        dosage: '1 चक्की (Tablet)',
        frequency: '१-०-१ (बिहान र बेलुका खानापछि)',
        durationDays: 5,
        quantity: 10,
        instructions: 'खानापछि खाने',
      },
    ]);
  };

  const handleRemoveMedicineRow = (index: number) => {
    if (medicines.length <= 1) return;
    setMedicines((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleMedicineChange = (index: number, field: keyof PrescribedMedicine, value: any) => {
    setMedicines((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };

      if (field === 'durationDays' || field === 'frequency') {
        const days = field === 'durationDays' ? Number(value) || 1 : Number(updated[index].durationDays) || 1;
        const freqStr = field === 'frequency' ? value : updated[index].frequency;
        let perDay = 2;
        if (freqStr.includes('१-१-१')) perDay = 3;
        else if (freqStr.includes('१-०-०') || freqStr.includes('०-०-१')) perDay = 1;
        else if (freqStr.includes('SOS')) perDay = 1;
        updated[index].quantity = days * perDay;
      }

      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim()) {
      alert('कृपया बिरामीको नाम लेख्नुहोस्');
      return;
    }
    const validMeds = medicines.filter((m) => m.medicineName.trim().length > 0);
    if (validMeds.length === 0) {
      alert('कृपया कम्तीमा १ वटा औषधि थप्नुहोस्');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        patientNo,
        patientName: patientName.trim(),
        patientAge: Number(patientAge) || 30,
        patientGender,
        wardNumber,
        doctorName,
        department,
        diagnosis: diagnosis.trim() || 'General Consultation',
        medicines: validMeds,
        isInsured,
        insuranceNumber: isInsured ? insuranceNumber : undefined,
        notes,
      });
      onClose();
    } catch (err) {
      console.error('Failed to create prescription', err);
      alert('प्रेस्क्रिप्सन सुरक्षित गर्न सकिएन।');
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
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '1rem',
          maxWidth: '960px',
          width: '100%',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            background: 'linear-gradient(135deg, #065f46 0%, #047857 100%)',
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
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, letterSpacing: '-0.025em' }}>
                चिकित्सक विद्युतीय प्रेस्क्रिप्सन (Doctor's E-Prescription Slip)
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#a7f3d0', margin: '2px 0 0 0' }}>
                पाँचपोखरी आधारभूत अस्पताल (१५ शय्या) • प्राथमिक स्वास्थ्य ई-औषधि वितरण प्रणाली
              </p>
            </div>
          </div>
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

        {/* Modal Body */}
        <form onSubmit={handleSubmit} style={{ overflowY: 'auto', flex: 1, padding: '1.5rem' }}>
          {/* Patient Quick Info Banner */}
          <div
            style={{
              padding: '1rem',
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '0.75rem',
              marginBottom: '1.25rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '1rem',
            }}
          >
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#166534', display: 'block' }}>बिरामीको नाम *</label>
              <input
                type="text"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="बिरामीको नाम थर"
                required
                style={{
                  width: '100%',
                  marginTop: '4px',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.875rem',
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#166534', display: 'block' }}>MRN / दर्ता नं.</label>
              <input
                type="text"
                value={patientNo}
                onChange={(e) => setPatientNo(e.target.value)}
                style={{
                  width: '100%',
                  marginTop: '4px',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.875rem',
                  fontFamily: 'monospace',
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#166534', display: 'block' }}>उमेर र लिङ्ग</label>
              <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                <input
                  type="number"
                  value={patientAge}
                  onChange={(e) => setPatientAge(e.target.value ? Number(e.target.value) : '')}
                  placeholder="उमेर"
                  style={{
                    width: '70px',
                    padding: '6px 8px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.875rem',
                  }}
                />
                <select
                  value={patientGender}
                  onChange={(e) => setPatientGender(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '6px 8px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.875rem',
                  }}
                >
                  <option value="महिला">महिला</option>
                  <option value="पुरुष">पुरुष</option>
                  <option value="अन्य">अन्य</option>
                </select>
              </div>
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#166534', display: 'block' }}>वडा नं.</label>
              <select
                value={wardNumber}
                onChange={(e) => setWardNumber(Number(e.target.value))}
                style={{
                  width: '100%',
                  marginTop: '4px',
                  padding: '6px 8px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.875rem',
                }}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((w) => (
                  <option key={w} value={w}>वडा नं. {w}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Clinical Details */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1rem',
              marginBottom: '1.25rem',
            }}
          >
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block' }}>जाँच गर्ने चिकित्सक (Attending Doctor)</label>
              <input
                type="text"
                list="rx-doctors-list"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                style={{
                  width: '100%',
                  marginTop: '4px',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.875rem',
                }}
              />
              <datalist id="rx-doctors-list">
                {doctorsList.map((d) => (
                  <option key={d.id} value={`${d.nameNepali || d.name} (${d.designation})`} />
                ))}
              </datalist>
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block' }}>विभाग / सेवा (Department)</label>
              <input
                type="text"
                list="rx-depts-list"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                style={{
                  width: '100%',
                  marginTop: '4px',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.875rem',
                }}
              />
              <datalist id="rx-depts-list">
                {departmentsList.map((d) => (
                  <option key={d.id} value={d.name} />
                ))}
              </datalist>
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block' }}>रोगको पहिचान / निदान (Provisional Diagnosis) *</label>
              <input
                type="text"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="जस्तै: Acute URTI, Essential Hypertension, Gastritis..."
                required
                style={{
                  width: '100%',
                  marginTop: '4px',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.875rem',
                }}
              />
            </div>
          </div>

          {/* Insurance Checkbox */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1.5rem',
              padding: '0.75rem 1rem',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '0.5rem',
              marginBottom: '1.5rem',
            }}
          >
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, color: '#0f172a' }}>
              <input
                type="checkbox"
                checked={isInsured}
                onChange={(e) => setIsInsured(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: '#059669' }}
              />
              स्वास्थ्य बीमा बोर्ड (HIB) बीमित बिरामी
            </label>
            {isInsured && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>बीमा परिचयपत्र नं:</span>
                <input
                  type="text"
                  value={insuranceNumber}
                  onChange={(e) => setInsuranceNumber(e.target.value)}
                  placeholder="HIB-SIN-XXXXX"
                  style={{
                    padding: '4px 8px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.875rem',
                    fontFamily: 'monospace',
                  }}
                />
              </div>
            )}
          </div>

          {/* Prescribed Medicines Builder */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Pill size={20} color="#059669" />
                <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                  औषधि सूची (Rx Prescribed Medicines)
                </h3>
                <span style={{ fontSize: '0.75rem', backgroundColor: '#e0e7ff', color: '#3730a3', padding: '2px 8px', borderRadius: '9999px', fontWeight: 600 }}>
                  e-LMIS स्टक सिन्क
                </span>
              </div>
              <button
                type="button"
                onClick={handleAddMedicineRow}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '6px 12px',
                  backgroundColor: '#ecfdf5',
                  color: '#059669',
                  border: '1px solid #a7f3d0',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Plus size={16} /> अर्को औषधि थप्नुहोस्
              </button>
            </div>

            {/* Datalist for available medicines in stock */}
            <datalist id="availableMedsList">
              {availableMedicines.map((m) => (
                <option key={m.id} value={m.medicineName}>
                  {m.genericName ? `(${m.genericName})` : ''} - मौज्दात: {m.stockQuantity} {m.unit}
                </option>
              ))}
            </datalist>

            {/* Table / Row list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {medicines.map((med, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.5rem',
                    padding: '0.75rem 1rem',
                    display: 'grid',
                    gridTemplateColumns: '2fr 1.2fr 1.5fr 70px 70px 2fr 36px',
                    gap: '0.5rem',
                    alignItems: 'center',
                  }}
                >
                  {/* Medicine Name */}
                  <div>
                    <label style={{ fontSize: '0.7rem', color: '#64748b', display: 'block', marginBottom: '2px' }}>
                      #{idx + 1} औषधिको नाम (e-LMIS)
                    </label>
                    <input
                      type="text"
                      list="availableMedsList"
                      value={med.medicineName}
                      onChange={(e) => handleMedicineChange(idx, 'medicineName', e.target.value)}
                      placeholder="औषधि खोज्नुहोस् वा लेख्नुहोस्..."
                      required
                      style={{
                        width: '100%',
                        padding: '6px 8px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                      }}
                    />
                  </div>

                  {/* Dosage */}
                  <div>
                    <label style={{ fontSize: '0.7rem', color: '#64748b', display: 'block', marginBottom: '2px' }}>मात्रा (Dosage)</label>
                    <input
                      type="text"
                      value={med.dosage}
                      onChange={(e) => handleMedicineChange(idx, 'dosage', e.target.value)}
                      placeholder="1 चक्की"
                      style={{
                        width: '100%',
                        padding: '6px 8px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.8rem',
                      }}
                    />
                  </div>

                  {/* Frequency */}
                  <div>
                    <label style={{ fontSize: '0.7rem', color: '#64748b', display: 'block', marginBottom: '2px' }}>प्रयोग तालिका (Frequency)</label>
                    <select
                      value={med.frequency}
                      onChange={(e) => handleMedicineChange(idx, 'frequency', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '6px 8px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.8rem',
                      }}
                    >
                      {COMMON_FREQUENCIES.map((f, fIdx) => (
                        <option key={fIdx} value={f}>{f}</option>
                      ))}
                    </select>
                  </div>

                  {/* Days */}
                  <div>
                    <label style={{ fontSize: '0.7rem', color: '#64748b', display: 'block', marginBottom: '2px' }}>दिन (Days)</label>
                    <input
                      type="number"
                      min={1}
                      value={med.durationDays}
                      onChange={(e) => handleMedicineChange(idx, 'durationDays', Number(e.target.value))}
                      style={{
                        width: '100%',
                        padding: '6px 4px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.8rem',
                        textAlign: 'center',
                      }}
                    />
                  </div>

                  {/* Quantity */}
                  <div>
                    <label style={{ fontSize: '0.7rem', color: '#64748b', display: 'block', marginBottom: '2px' }}>संख्या (Qty)</label>
                    <input
                      type="number"
                      min={1}
                      value={med.quantity}
                      onChange={(e) => handleMedicineChange(idx, 'quantity', Number(e.target.value))}
                      style={{
                        width: '100%',
                        padding: '6px 4px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.8rem',
                        textAlign: 'center',
                        fontWeight: 700,
                        color: '#059669',
                      }}
                    />
                  </div>

                  {/* Instructions */}
                  <div>
                    <label style={{ fontSize: '0.7rem', color: '#64748b', display: 'block', marginBottom: '2px' }}>विशेष निर्देशन</label>
                    <input
                      type="text"
                      value={med.instructions}
                      onChange={(e) => handleMedicineChange(idx, 'instructions', e.target.value)}
                      placeholder="जस्तै: खानापछि, पानी धेरै पिउने"
                      style={{
                        width: '100%',
                        padding: '6px 8px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.8rem',
                      }}
                    />
                  </div>

                  {/* Delete Button */}
                  <div style={{ paddingTop: '16px' }}>
                    <button
                      type="button"
                      onClick={() => handleRemoveMedicineRow(idx)}
                      disabled={medicines.length <= 1}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: medicines.length <= 1 ? '#cbd5e1' : '#ef4444',
                        cursor: medicines.length <= 1 ? 'not-allowed' : 'pointer',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Doctor Advice / Notes */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
              डाक्टरको थप सल्लाह / परहेज (Doctor's General Advice & Notes)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="जस्तै: चिल्लो पिरो नखाने, ७ दिनपछि पुनः स्वास्थ्य परीक्षण गराउने, दैनिक १० मिनेट हिँड्ने..."
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '0.875rem',
                resize: 'vertical',
              }}
            />
          </div>

          {/* Action Buttons */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: '1rem',
              borderTop: '1px solid #e2e8f0',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#059669' }}>
              <CheckCircle2 size={16} />
              सुरक्षित गरेपछि यो प्रेस्क्रिप्सन स्वतः फार्मेसी काउन्टरको डिस्पेंसिङ सूचीमा प्रविष्ट हुनेछ।
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
                  backgroundColor: '#059669',
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
                {isSubmitting ? 'जारी गर्दै...' : 'प्रेस्क्रिप्सन जारी गर्नुहोस् (Save & Send to Pharmacy)'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
