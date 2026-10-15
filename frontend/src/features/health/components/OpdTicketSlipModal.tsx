import React from 'react';
import { X, Printer, ShieldCheck, HeartPulse, User } from 'lucide-react';
import type { PatientRecord } from '../../../types/health';

interface OpdTicketSlipModalProps {
  patient: PatientRecord | null;
  onClose: () => void;
}

export const OpdTicketSlipModal: React.FC<OpdTicketSlipModalProps> = ({ patient, onClose }) => {
  if (!patient) return null;

  const handlePrint = () => {
    window.print();
  };

  const currentDateBS = '२०८१/०५/१५';
  const currentTime = new Date().toLocaleTimeString('ne-NP', { hour: '2-digit', minute: '2-digit' });

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
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-opd-ticket, #printable-opd-ticket * {
            visibility: visible !important;
          }
          #printable-opd-ticket {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            padding: 24px !important;
            margin: 0 !important;
            box-shadow: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
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
          maxHeight: '92vh',
        }}
      >
        {/* Modal Toolbar (hidden during print) */}
        <div
          className="no-print"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 20px',
            backgroundColor: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Printer size={18} color="#0284c7" />
            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1e293b' }}>
              ओपिडी टिकट / पुर्जी (OPD Ticket Slip)
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={handlePrint}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#dc2626',
                color: '#ffffff',
                border: 'none',
                padding: '6px 14px',
                borderRadius: '6px',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(220, 38, 38, 0.2)',
              }}
            >
              <Printer size={15} />
              <span>प्रिन्ट गर्नुहोस्</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: '#64748b',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* ── PRINTABLE TICKET CONTAINER ── */}
        <div
          id="printable-opd-ticket"
          style={{
            padding: '24px 28px',
            overflowY: 'auto',
            backgroundColor: '#ffffff',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            color: '#0f172a',
          }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', borderBottom: '2px solid #0f172a', paddingBottom: '12px', marginBottom: '14px' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#475569', letterSpacing: '0.5px' }}>
              नेपाल सरकार | बागमती प्रदेश सरकार
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#dc2626', margin: '2px 0' }}>
              पाँचपोखरी थाङपाल गाउँपालिका
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f172a' }}>
              {patient.healthFacilityName || 'पाँचपोखरी प्राथमिक आधारभूत अस्पताल'}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
              थाङपालधाप, सिन्धुपाल्चोक | फोन: ०११-४९०१११ / ०११-४९०११२
            </div>
            <div
              style={{
                display: 'inline-block',
                marginTop: '8px',
                padding: '3px 14px',
                borderRadius: '20px',
                backgroundColor: '#0f172a',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.82rem',
                letterSpacing: '0.5px',
              }}
            >
              बहिरङ्ग सेवा (OPD) दर्ता पुर्जी
            </div>
          </div>

          {/* Ticket Meta / Barcode Bar */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#f1f5f9',
              padding: '8px 12px',
              borderRadius: '8px',
              marginBottom: '12px',
              fontSize: '0.85rem',
            }}
          >
            <div>
              <span style={{ color: '#64748b', fontSize: '0.75rem' }}>EHR दर्ता नं (MRN): </span>
              <strong style={{ fontSize: '0.95rem', color: '#dc2626', fontFamily: 'monospace' }}>
                {patient.patientNo}
              </strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {patient.triagePriority && (
                <span
                  style={{
                    backgroundColor:
                      patient.triagePriority === 'emergency' ? '#fef2f2' : patient.triagePriority === 'urgent' ? '#fefce8' : '#f0fdf4',
                    color:
                      patient.triagePriority === 'emergency' ? '#dc2626' : patient.triagePriority === 'urgent' ? '#ca8a04' : '#16a34a',
                    border: `1px solid ${patient.triagePriority === 'emergency' ? '#fca5a5' : patient.triagePriority === 'urgent' ? '#fde047' : '#86efac'}`,
                    padding: '2px 8px',
                    borderRadius: '6px',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                  }}
                >
                  {patient.triagePriority === 'emergency' ? '🔴 EMERGENCY' : patient.triagePriority === 'urgent' ? '🟡 URGENT' : '🟢 ROUTINE'}
                </span>
              )}
              <div>
                <span style={{ color: '#64748b', fontSize: '0.75rem' }}>मिति / समय: </span>
                <strong>{currentDateBS} {currentTime}</strong>
              </div>
            </div>
          </div>

          {/* CRITICAL ALLERGY ALERT BANNER ON TICKET (EHR Safety Standard) */}
          {patient.knownAllergies && (
            <div
              style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                padding: '6px 10px',
                borderRadius: '6px',
                marginBottom: '12px',
                color: '#991b1b',
                fontSize: '0.78rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>⚠️ ALLERGY WARNING:</span>
              <span style={{ textDecoration: 'underline' }}>{patient.knownAllergies}</span>
            </div>
          )}

          {/* Patient Demographics */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '8px 16px', fontSize: '0.85rem', marginBottom: '12px' }}>
            <div>
              <span style={{ color: '#64748b', fontSize: '0.72rem' }}>बिरामीको पूरा नाम (Patient Name):</span>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>
                {patient.fullName}
              </div>
              {patient.fullNameEn && (
                <div style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 600 }}>
                  {patient.fullNameEn}
                </div>
              )}
            </div>
            <div>
              <span style={{ color: '#64748b', fontSize: '0.72rem' }}>उमेर / लिङ्ग / रक्त समूह:</span>
              <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>{patient.age} वर्ष / {patient.gender === 'female' ? 'महिला' : patient.gender === 'male' ? 'पुरुष' : 'अन्य'}</span>
                {patient.bloodGroup && (
                  <span style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '1px 6px', borderRadius: '4px', fontSize: '0.75rem' }}>
                    {patient.bloodGroup}
                  </span>
                )}
              </div>
              {patient.citizenshipOrNin && (
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  NID/नागरिकता: {patient.citizenshipOrNin}
                </div>
              )}
            </div>
            <div>
              <span style={{ color: '#64748b', fontSize: '0.72rem' }}>सम्पर्क फोन / मोबाइल:</span>
              <div style={{ fontWeight: 600 }}>{patient.phone || 'उपलब्ध नभएको'}</div>
            </div>
            <div>
              <span style={{ color: '#64748b', fontSize: '0.72rem' }}>ठेगाना:</span>
              <div style={{ fontWeight: 600 }}>वडा नं. {patient.wardNumber}, {patient.address || 'पाँचपोखरी थाङपाल'}</div>
            </div>
            {patient.emergencyContactName && (
              <div style={{ gridColumn: 'span 2', fontSize: '0.78rem', color: '#334155', backgroundColor: '#f8fafc', padding: '4px 8px', borderRadius: '4px' }}>
                <span style={{ color: '#64748b' }}>आपतकालीन सम्पर्क (Kin): </span>
                <strong>{patient.emergencyContactName}</strong> ({patient.emergencyContactRelation || 'हकवाला'}) - फोन: <strong>{patient.emergencyContactPhone || '-'}</strong>
              </div>
            )}
          </div>

          {/* Insurance Status Callout */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 12px',
              borderRadius: '8px',
              backgroundColor: patient.hasHealthInsurance ? '#f0fdf4' : '#fffbeb',
              border: `1px solid ${patient.hasHealthInsurance ? '#bbf7d0' : '#fde68a'}`,
              marginBottom: '12px',
              fontSize: '0.82rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={18} color={patient.hasHealthInsurance ? '#16a34a' : '#d97706'} />
              <div>
                <strong>{patient.hasHealthInsurance ? 'नेपाल सरकार स्वास्थ्य बीमा आवद्ध (बीमित सेवाग्राही)' : 'गैर-बीमित (सामान्य नागरिक)'}</strong>
                {patient.insuranceNumber && (
                  <div style={{ fontSize: '0.75rem', color: '#15803d', fontFamily: 'monospace' }}>
                    कार्ड नं: {patient.insuranceNumber}
                  </div>
                )}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>टिकट दस्तुर</div>
              <strong style={{ fontSize: '0.95rem', color: patient.hasHealthInsurance ? '#16a34a' : '#0f172a' }}>
                {patient.ticketFee === 0 ? 'निशुल्क (रु. ०/-)' : `रु. ${patient.ticketFee}/-`}
              </strong>
            </div>
          </div>

          {/* Department & Attending Doctor */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.2fr 1fr',
              gap: '10px',
              padding: '8px 12px',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              border: '1px dashed #cbd5e1',
              marginBottom: '12px',
              fontSize: '0.82rem',
            }}
          >
            <div>
              <span style={{ color: '#64748b', fontSize: '0.72rem' }}>सेवा विभाग (OPD Department):</span>
              <div style={{ fontWeight: 800, color: '#0284c7' }}>{patient.department}</div>
              {patient.roomNumber && <small style={{ color: '#475569', fontWeight: 600 }}>{patient.roomNumber}</small>}
            </div>
            <div>
              <span style={{ color: '#64748b', fontSize: '0.72rem' }}>परामर्शदाता चिकित्सक / विशेषज्ञ:</span>
              <div style={{ fontWeight: 700, color: '#334155' }}>{patient.attendingDoctor || 'डा. सुजन खनाल (MDGP)'}</div>
            </div>
          </div>

          {/* Vitals Recorded Box */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                सुरुवाती शारीरिक जाँच (Triage / Vitals):
              </span>
              {patient.bmi && (
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0369a1' }}>
                  BMI: {patient.bmi} kg/m² ({patient.bmiCategory || 'Normal'})
                </span>
              )}
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(6, 1fr)',
                gap: '4px',
                textAlign: 'center',
                backgroundColor: '#f1f5f9',
                padding: '6px 4px',
                borderRadius: '8px',
                fontSize: '0.75rem',
              }}
            >
              <div>
                <div style={{ color: '#64748b', fontSize: '0.68rem' }}>रक्तचाप (BP)</div>
                <div style={{ fontWeight: 800, color: '#0f172a' }}>{patient.bloodPressure || '१२०/८०'}</div>
              </div>
              <div>
                <div style={{ color: '#64748b', fontSize: '0.68rem' }}>नाडी (Pulse)</div>
                <div style={{ fontWeight: 800, color: '#0f172a' }}>{patient.pulseRate ? `${patient.pulseRate} bpm` : '७६ bpm'}</div>
              </div>
              <div>
                <div style={{ color: '#64748b', fontSize: '0.68rem' }}>तापक्रम (Temp)</div>
                <div style={{ fontWeight: 800, color: '#0f172a' }}>{patient.temperatureF ? `${patient.temperatureF}°F` : '९८.६°F'}</div>
              </div>
              <div>
                <div style={{ color: '#64748b', fontSize: '0.68rem' }}>SpO2</div>
                <div style={{ fontWeight: 800, color: '#0f172a' }}>{patient.spo2Percent ? `${patient.spo2Percent}%` : '९८%'}</div>
              </div>
              <div>
                <div style={{ color: '#64748b', fontSize: '0.68rem' }}>उचाइ/तौल</div>
                <div style={{ fontWeight: 800, color: '#0f172a' }}>
                  {patient.heightCm ? `${patient.heightCm}cm` : '-'}/{patient.weightKg ? `${patient.weightKg}kg` : '-'}
                </div>
              </div>
              <div>
                <div style={{ color: '#64748b', fontSize: '0.68rem' }}>श्वास (RR)</div>
                <div style={{ fontWeight: 800, color: '#0f172a' }}>{patient.respiratoryRate ? `${patient.respiratoryRate}/m` : '१८/m'}</div>
              </div>
            </div>
          </div>

          {/* Chief Complaints / Diagnosis if any */}
          {(patient.chiefComplaints || patient.provisionalDiagnosis) && (
            <div style={{ fontSize: '0.8rem', marginBottom: '14px', padding: '6px 10px', backgroundColor: '#fafaf9', borderRadius: '6px' }}>
              {patient.chiefComplaints && (
                <div>
                  <strong style={{ color: '#44403c' }}>समस्या (Complaints): </strong>
                  <span>{patient.chiefComplaints}</span>
                </div>
              )}
              {patient.provisionalDiagnosis && (
                <div style={{ marginTop: '2px' }}>
                  <strong style={{ color: '#44403c' }}>सुरुवाती निदान (Diagnosis): </strong>
                  <span style={{ color: '#b91c1c', fontWeight: 600 }}>{patient.provisionalDiagnosis}</span>
                </div>
              )}
            </div>
          )}

          {/* Doctor Consultation / Rx Space */}
          <div
            style={{
              border: '1px dashed #94a3b8',
              borderRadius: '8px',
              minHeight: '120px',
              padding: '8px 12px',
              position: 'relative',
              marginBottom: '16px',
            }}
          >
            <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0284c7', fontFamily: 'serif' }}>
              ℞ <span style={{ fontSize: '0.72rem', color: '#64748b', fontFamily: 'sans-serif' }}>औषधि तथा परामर्श (Doctor's Prescription):</span>
            </div>
            <div style={{ borderBottom: '1px dotted #cbd5e1', height: '24px' }}></div>
            <div style={{ borderBottom: '1px dotted #cbd5e1', height: '24px' }}></div>
            <div style={{ borderBottom: '1px dotted #cbd5e1', height: '24px' }}></div>
          </div>

          {/* Footer with Signatures */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '18px', paddingTop: '10px', borderTop: '1px solid #e2e8f0', fontSize: '0.75rem', color: '#64748b' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ borderTop: '1px solid #94a3b8', width: '130px', margin: '0 auto 4px auto' }}></div>
              <div>काउन्टर अधिकृतको हस्ताक्षर</div>
            </div>
            <div style={{ textAlign: 'center', fontSize: '0.7rem', color: '#94a3b8' }}>
              कृपया यो पुर्जी परीक्षण तथा औषधि लिँदा अनिवार्य साथमा राख्नुहोला ।
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ borderTop: '1px solid #94a3b8', width: '130px', margin: '0 auto 4px auto' }}></div>
              <div>चिकित्सकको हस्ताक्षर / सिल</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
