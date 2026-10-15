import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  X,
  User,
  HeartPulse,
  Pill,
  TestTube2,
  Building2,
  Calendar,
  ShieldCheck,
  Printer,
  Clock,
  Activity,
  CheckCircle2,
  AlertTriangle,
  FileText,
} from 'lucide-react';
import { sectoralApi } from '../../../api/sectoral';
import type { PatientFullEhrHistory } from '../../../types/health';

interface PatientEhrTimelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientNo: string;
}

export const PatientEhrTimelineModal: React.FC<PatientEhrTimelineModalProps> = ({
  isOpen,
  onClose,
  patientNo,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'opd' | 'prescriptions' | 'lab' | 'ipd'>('all');

  const { data: ehrData, isLoading, error } = useQuery<PatientFullEhrHistory>({
    queryKey: ['patient-ehr-full', patientNo],
    queryFn: () => sectoralApi.getPatientFullHistory(patientNo),
    enabled: isOpen && Boolean(patientNo),
  });

  if (!isOpen) return null;

  const patient = ehrData?.patient;
  const visits = ehrData?.visits || [];
  const prescriptions = ehrData?.prescriptions || [];
  const labTests = ehrData?.labTests || [];
  const admissions = ehrData?.admissions || [];

  const handlePrint = () => {
    window.print();
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
        id="printableEhrSlip"
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '1rem',
          maxWidth: '1020px',
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
          className="no-print"
          style={{
            padding: '1.25rem 1.5rem',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
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
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Activity size={24} color="#38bdf8" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
                  एकीकृत विद्युतीय स्वास्थ्य अभिलेख (Unified Patient EHR History)
                </h2>
                <span
                  style={{
                    fontSize: '0.75rem',
                    backgroundColor: '#0284c7',
                    color: '#ffffff',
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    fontWeight: 600,
                  }}
                >
                  MRN: {patientNo}
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '2px 0 0 0' }}>
                पाँचपोखरी आधारभूत अस्पताल • सम्पूर्ण OPD, IPD, ल्याब तथा ई-प्रेस्क्रिप्सन टाइमलाइन
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              type="button"
              onClick={handlePrint}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                backgroundColor: '#ffffff',
                color: '#0f172a',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Printer size={16} /> पूर्ण EHR प्रिन्ट
            </button>
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

        {/* Modal Body */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '1.5rem' }}>
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
              <div style={{ fontSize: '1rem', fontWeight: 600 }}>बिरामीको एकीकृत EHR अभिलेख लोड हुँदैछ...</div>
            </div>
          ) : error || !patient ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#ef4444' }}>
              <AlertTriangle size={36} style={{ margin: '0 auto 1rem' }} />
              <div style={{ fontSize: '1rem', fontWeight: 600 }}>बिरामीको रेकर्ड भेटिएन (MRN: {patientNo})</div>
            </div>
          ) : (
            <div>
              {/* Patient Profile Card */}
              <div
                style={{
                  padding: '1.25rem',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.75rem',
                  marginBottom: '1.25rem',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1rem',
                }}
              >
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>बिरामीको नाम:</span>
                  <strong style={{ fontSize: '1.1rem', color: '#0f172a' }}>{patient.fullName}</strong>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    {patient.gender === 'male' ? 'पुरुष' : patient.gender === 'female' ? 'महिला' : 'अन्य'}, {patient.age} वर्ष
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>ठेगाना तथा सम्पर्क:</span>
                  <div style={{ fontSize: '0.875rem', color: '#334155' }}>
                    पाँचपोखरी थाङपाल-{patient.wardNumber}, {patient.address || 'सिन्धुपाल्चोक'}
                  </div>
                  {patient.phone && <div style={{ fontSize: '0.8rem', color: '#64748b' }}>सम्पर्क: {patient.phone}</div>}
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>स्वास्थ्य बीमा (HIB):</span>
                  {patient.hasHealthInsurance ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#059669', fontWeight: 600, fontSize: '0.85rem', marginTop: '2px' }}>
                      <ShieldCheck size={16} /> बीमित ({patient.insuranceNumber || 'HIB दर्ता'})
                    </div>
                  ) : (
                    <div style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '2px' }}>बीमा नभएको (General)</div>
                  )}
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>शारीरिक मापन तथा एलर्जी:</span>
                  <div style={{ fontSize: '0.85rem', color: '#334155' }}>
                    रक्त समूह: <strong>{patient.bloodGroup || 'नखुलेको'}</strong>
                  </div>
                  {patient.knownAllergies && (
                    <div style={{ fontSize: '0.75rem', color: '#dc2626', fontWeight: 600, marginTop: '2px' }}>
                      एलर्जी: {patient.knownAllergies}
                    </div>
                  )}
                </div>
              </div>

              {/* Statistics Badges */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '0.75rem',
                  marginBottom: '1.25rem',
                }}
              >
                <div style={{ padding: '0.75rem', backgroundColor: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: '#1d4ed8', fontWeight: 600 }}>कुल OPD जाँच</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1e40af' }}>{visits.length} पटक</div>
                </div>
                <div style={{ padding: '0.75rem', backgroundColor: '#ecfdf5', borderRadius: '8px', border: '1px solid #a7f3d0', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: '#047857', fontWeight: 600 }}>जारी प्रेस्क्रिप्सन</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#065f46' }}>{prescriptions.length} वटा</div>
                </div>
                <div style={{ padding: '0.75rem', backgroundColor: '#fdf4ff', borderRadius: '8px', border: '1px solid #f0abfc', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: '#a21caf', fontWeight: 600 }}>ल्याब परीक्षण</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#86198f' }}>{labTests.length} पटक</div>
                </div>
                <div style={{ padding: '0.75rem', backgroundColor: '#fff7ed', borderRadius: '8px', border: '1px solid #fed7aa', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: '#c2410c', fontWeight: 600 }}>IPD अस्पताल भर्ना</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#9a3412' }}>{admissions.length} पटक</div>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div
                className="no-print"
                style={{
                  display: 'flex',
                  gap: '0.5rem',
                  borderBottom: '1px solid #e2e8f0',
                  marginBottom: '1.25rem',
                }}
              >
                {[
                  { id: 'all', label: `सम्पूर्ण टाइमलाइन (${visits.length + prescriptions.length + labTests.length + admissions.length})` },
                  { id: 'opd', label: `OPD जाँच (${visits.length})` },
                  { id: 'prescriptions', label: `ई-प्रेस्क्रिप्सन (${prescriptions.length})` },
                  { id: 'lab', label: `ल्याब रिपोर्ट (${labTests.length})` },
                  { id: 'ipd', label: `IPD भर्ना (${admissions.length})` },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as any)}
                    style={{
                      padding: '8px 14px',
                      fontSize: '0.85rem',
                      fontWeight: activeTab === tab.id ? 700 : 500,
                      color: activeTab === tab.id ? '#0284c7' : '#64748b',
                      borderBottom: activeTab === tab.id ? '2px solid #0284c7' : '2px solid transparent',
                      background: 'transparent',
                      border: 'none',
                      borderBottomWidth: '2px',
                      borderBottomStyle: 'solid',
                      cursor: 'pointer',
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* TIMELINE VIEW */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* 1. Prescriptions */}
                {(activeTab === 'all' || activeTab === 'prescriptions') && prescriptions.length > 0 && (
                  <div>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#065f46', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.5rem' }}>
                      <Pill size={16} /> चिकित्सकका प्रेस्क्रिप्सनहरू (E-Prescriptions)
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {prescriptions.map((rx) => (
                        <div
                          key={rx.id}
                          style={{
                            padding: '1rem',
                            backgroundColor: '#ffffff',
                            border: '1px solid #bbf7d0',
                            borderRadius: '8px',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <div>
                              <strong style={{ color: '#065f46', fontSize: '0.95rem' }}>{rx.rxNumber}</strong>
                              <span style={{ fontSize: '0.75rem', color: '#64748b', marginLeft: '8px' }}>
                                मिति: {rx.createdAt ? new Date(rx.createdAt).toLocaleDateString('ne-NP') : 'हालसालै'}
                              </span>
                              <span style={{ fontSize: '0.8rem', color: '#334155', marginLeft: '12px' }}>
                                डाक्टर: <strong>{rx.doctorName}</strong> ({rx.department})
                              </span>
                            </div>
                            <span
                              style={{
                                fontSize: '0.75rem',
                                padding: '2px 8px',
                                borderRadius: '9999px',
                                fontWeight: 600,
                                backgroundColor: rx.dispenseStatus === 'dispensed' ? '#dcfce7' : '#fef3c7',
                                color: rx.dispenseStatus === 'dispensed' ? '#166534' : '#92400e',
                              }}
                            >
                              {rx.dispenseStatus === 'dispensed' ? 'औषधि वितरण भइसकेको' : 'फार्मेसीमा बाँकी'}
                            </span>
                          </div>

                          <div style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '0.5rem' }}>
                            रोग पहिचान: <strong>{rx.diagnosis}</strong>
                          </div>

                          {/* Medicines list */}
                          <div style={{ backgroundColor: '#f0fdf4', padding: '0.75rem', borderRadius: '6px', fontSize: '0.8rem' }}>
                            <div style={{ fontWeight: 700, color: '#166534', marginBottom: '4px' }}>सिफारिस गरिएका औषधिहरू:</div>
                            <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#14532d' }}>
                              {Array.isArray(rx.medicines) &&
                                rx.medicines.map((m, mIdx) => (
                                  <li key={mIdx} style={{ marginBottom: '2px' }}>
                                    <strong>{m.medicineName}</strong> — {m.dosage} • {m.frequency} • {m.durationDays} दिन ({m.quantity} थान)
                                    {m.instructions ? ` [${m.instructions}]` : ''}
                                  </li>
                                ))}
                            </ul>
                          </div>

                          {rx.dispensedBy && (
                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '6px' }}>
                              वितरण गर्ने फार्मेसी अधिकृत: {rx.dispensedBy}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. OPD Visits & Vitals */}
                {(activeTab === 'all' || activeTab === 'opd') && visits.length > 0 && (
                  <div>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e40af', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.5rem' }}>
                      <HeartPulse size={16} /> OPD परामर्श तथा भाइटल साइन अभिलेख
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {visits.map((v) => (
                        <div
                          key={v.id}
                          style={{
                            padding: '1rem',
                            backgroundColor: '#ffffff',
                            border: '1px solid #bfdbfe',
                            borderRadius: '8px',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <div>
                              <strong style={{ color: '#1e40af' }}>{v.department}</strong>
                              <span style={{ fontSize: '0.75rem', color: '#64748b', marginLeft: '8px' }}>
                                टिकट स्थिति: {v.ticketStatus === 'completed' ? 'परामर्श सम्पन्न' : 'सक्रिय'}
                              </span>
                            </div>
                            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                              {v.createdAt ? new Date(v.createdAt).toLocaleDateString('ne-NP') : 'रेकर्ड गरिएको'}
                            </span>
                          </div>

                          <div style={{ fontSize: '0.85rem', color: '#334155', marginBottom: '4px' }}>
                            मुख्य समस्या: <strong>{v.chiefComplaint || v.chiefComplaints || 'सामान्य जाँच'}</strong>
                          </div>

                          {v.provisionalDiagnosis && (
                            <div style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '6px' }}>
                              निदान: {v.provisionalDiagnosis}
                            </div>
                          )}

                          {/* Vitals summary badges */}
                          {(v.bloodPressure || v.pulseRate || v.temperatureF || v.spo2Percent) && (
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '6px' }}>
                              {v.bloodPressure && (
                                <span style={{ padding: '2px 8px', backgroundColor: '#eff6ff', color: '#1d4ed8', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                                  BP: {v.bloodPressure} mmHg
                                </span>
                              )}
                              {v.pulseRate && (
                                <span style={{ padding: '2px 8px', backgroundColor: '#fef2f2', color: '#b91c1c', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                                  Pulse: {v.pulseRate} bpm
                                </span>
                              )}
                              {v.spo2Percent && (
                                <span style={{ padding: '2px 8px', backgroundColor: '#f0fdf4', color: '#15803d', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                                  SpO2: {v.spo2Percent}%
                                </span>
                              )}
                              {v.temperatureF && (
                                <span style={{ padding: '2px 8px', backgroundColor: '#fffbeb', color: '#b45309', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                                  Temp: {v.temperatureF}°F
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Lab Investigations */}
                {(activeTab === 'all' || activeTab === 'lab') && labTests.length > 0 && (
                  <div>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#86198f', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.5rem' }}>
                      <TestTube2 size={16} /> प्रयोगशाला परीक्षणहरू (Laboratory Investigations)
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {labTests.map((lab) => (
                        <div
                          key={lab.id}
                          style={{
                            padding: '1rem',
                            backgroundColor: '#ffffff',
                            border: '1px solid #f0abfc',
                            borderRadius: '8px',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                            <div>
                              <strong style={{ color: '#86198f' }}>{lab.testName}</strong>
                              <span style={{ fontSize: '0.75rem', color: '#64748b', marginLeft: '8px' }}>({lab.testCategory})</span>
                              <span style={{ fontSize: '0.75rem', color: '#64748b', marginLeft: '6px' }}>अर्डर नं: {lab.testOrderNo}</span>
                            </div>
                            <span
                              style={{
                                fontSize: '0.75rem',
                                padding: '2px 8px',
                                borderRadius: '9999px',
                                fontWeight: 600,
                                backgroundColor: lab.status === 'completed' ? '#dcfce7' : '#fef3c7',
                                color: lab.status === 'completed' ? '#166534' : '#92400e',
                              }}
                            >
                              {lab.status === 'completed' ? 'नतिजा उपलब्ध' : 'प्रक्रियामा'}
                            </span>
                          </div>

                          {lab.remarks && (
                            <div style={{ fontSize: '0.85rem', color: '#334155', marginTop: '4px' }}>
                              नतिजा / कैफियत: <strong>{lab.remarks}</strong>
                            </div>
                          )}
                          {lab.normalRange && (
                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                              सामान्य दायरा (Normal Range): {lab.normalRange}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. IPD Admissions */}
                {(activeTab === 'all' || activeTab === 'ipd') && admissions.length > 0 && (
                  <div>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#9a3412', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.5rem' }}>
                      <Building2 size={16} /> १५ शय्या अस्पताल भर्ना अभिलेख (IPD Inpatient Records)
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {admissions.map((adm) => (
                        <div
                          key={adm.id}
                          style={{
                            padding: '1rem',
                            backgroundColor: '#ffffff',
                            border: '1px solid #fed7aa',
                            borderRadius: '8px',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                            <div>
                              <strong style={{ color: '#9a3412' }}>शय्या: {adm.bedNumber}</strong>
                              <span style={{ fontSize: '0.8rem', color: '#475569', marginLeft: '8px' }}>({adm.departmentWard})</span>
                            </div>
                            <span
                              style={{
                                fontSize: '0.75rem',
                                padding: '2px 8px',
                                borderRadius: '9999px',
                                fontWeight: 600,
                                backgroundColor: adm.status === 'discharged' ? '#f1f5f9' : '#dbeafe',
                                color: adm.status === 'discharged' ? '#475569' : '#1e40af',
                              }}
                            >
                              {adm.status === 'discharged' ? 'डिस्चार्ज सम्पन्न' : 'हाल भर्ना रहेको'}
                            </span>
                          </div>

                          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                            भर्ना मिति: {adm.admissionDate} {adm.dischargeDate ? `• डिस्चार्ज मिति: ${adm.dischargeDate}` : ''}
                          </div>
                          <div style={{ fontSize: '0.85rem', color: '#334155', marginTop: '4px' }}>
                            निदान: <strong>{adm.diagnosis}</strong>
                          </div>
                          {adm.treatmentSummary && (
                            <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '2px' }}>
                              उपचार सारांश: {adm.treatmentSummary}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
