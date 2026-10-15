import React, { useState, useEffect, useMemo } from 'react';
import { X, Printer, ShieldCheck, Tag, Sparkles, Check, QrCode, Barcode, Layers, TestTube, CheckCircle2 } from 'lucide-react';
import QRCode from 'qrcode';
import type { PatientRecord, LabTestRecord } from '../../../types/health';

export interface PatientStickerModalProps {
  patient?: PatientRecord | null;
  labTest?: LabTestRecord | null;
  onClose: () => void;
  initialSize?: '30x20' | '50x30' | '75x50';
}

export const PatientStickerModal: React.FC<PatientStickerModalProps> = ({
  patient,
  labTest,
  onClose,
  initialSize,
}) => {
  // Determine default sticker size: If labTest is provided, default to '30x20' (Tube size)
  const defaultSize = initialSize || (labTest ? '30x20' : '50x30');
  const [stickerSize, setStickerSize] = useState<'30x20' | '50x30' | '75x50'>(defaultSize);
  const [codeType, setCodeType] = useState<'barcode' | 'qrcode' | 'both'>('barcode');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  if (!patient && !labTest) return null;

  // Normalized display values
  const patientName = labTest ? labTest.patientName : (patient?.fullName || '');
  const patientNameEn = patient?.fullNameEn || '';
  const age = labTest ? labTest.age : (patient?.age || '-');
  const genderRaw = labTest ? labTest.gender : (patient?.gender || 'other');
  const genderShort =
    genderRaw === 'female' || genderRaw === 'महिला'
      ? 'F'
      : genderRaw === 'male' || genderRaw === 'पुरुष'
      ? 'M'
      : 'O';
  const bloodGroup = patient?.bloodGroup || '';
  const department = labTest ? labTest.testCategory : (patient?.department || 'General OPD');
  const facilityName = patient?.healthFacilityName || 'पाँचपोखरी आधारभूत अस्पताल';
  const wardNumber = patient?.wardNumber || 3;
  const phone = patient?.phone || '-';
  const hasHealthInsurance = patient?.hasHealthInsurance || labTest?.isCoveredByInsurance || false;
  const insuranceNumber = patient?.insuranceNumber || '';
  const sampleOrPatientNo = labTest ? labTest.testOrderNo : (patient?.patientNo || 'MRN-0000');
  const labTestName = labTest?.testName || '';
  const labSampleType = labTest?.sampleType || '';

  // Phlebotomy Tube Cap Color & Specimen Determination
  const tubeIndicator = useMemo(() => {
    const combined = `${labSampleType} ${labTestName}`.toLowerCase();
    if (combined.includes('edta') || combined.includes('cbc') || combined.includes('हेमाटोलोजी')) {
      return {
        name: 'EDTA (रगत)',
        color: '#7c3aed',
        bg: '#f5f3ff',
        border: '#c4b5fd',
        tube: 'Lavender / Purple Cap',
        dot: '🟣',
      };
    }
    if (combined.includes('fluoride') || combined.includes('sugar') || combined.includes('rbs') || combined.includes('fbs')) {
      return {
        name: 'Fluoride (सुगर)',
        color: '#334155',
        bg: '#f1f5f9',
        border: '#cbd5e1',
        tube: 'Grey Cap',
        dot: '⚪',
      };
    }
    if (combined.includes('citrate') || combined.includes('pt/inr') || combined.includes('coagulation')) {
      return {
        name: 'Citrate (जम्ने)',
        color: '#0284c7',
        bg: '#f0f9ff',
        border: '#7dd3fc',
        tube: 'Light Blue Cap',
        dot: '🔵',
      };
    }
    if (combined.includes('urine') || combined.includes('पिसाब')) {
      return {
        name: 'Urine (पिसाब)',
        color: '#b45309',
        bg: '#fffbeb',
        border: '#fde68a',
        tube: 'Yellow Cup',
        dot: '🟡',
      };
    }
    if (combined.includes('sputum') || combined.includes('खकार') || combined.includes('afb')) {
      return {
        name: 'Sputum (खकार)',
        color: '#047857',
        bg: '#ecfdf5',
        border: '#a7f3d0',
        tube: 'Green / Sterile Cup',
        dot: '🟢',
      };
    }
    return {
      name: 'Serum (सेरम)',
      color: '#b91c1c',
      bg: '#fef2f2',
      border: '#fecaca',
      tube: 'Red / Gold Cap',
      dot: '🔴',
    };
  }, [labSampleType, labTestName]);

  // QR Code Payload Generation
  const qrPayload = useMemo(() => {
    if (labTest) {
      return JSON.stringify({
        type: 'LAB_SAMPLE',
        orderNo: labTest.testOrderNo,
        patient: labTest.patientName,
        age: labTest.age,
        gender: genderShort,
        test: labTest.testName,
        sample: labTest.sampleType,
        facility: facilityName,
      });
    }
    return JSON.stringify({
      type: 'PATIENT_MRN',
      mrn: patient?.patientNo,
      name: patient?.fullName,
      age: patient?.age,
      gender: genderShort,
      dept: patient?.department,
      phone: patient?.phone,
      insurance: patient?.insuranceNumber || null,
      facility: facilityName,
    });
  }, [patient, labTest, genderShort, facilityName]);

  // Generate QR Code data URL whenever payload or view changes
  useEffect(() => {
    QRCode.toDataURL(qrPayload, {
      width: stickerSize === '30x20' ? 160 : 256,
      margin: 1,
      color: { dark: '#000000', light: '#ffffff' },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Failed to generate sticker QR code:', err));
  }, [qrPayload, stickerSize]);

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
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
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
      {/* ── PRINT STYLES FOR THERMAL LABEL PRINTERS ── */}
      <style>{`
        @media print {
          @page {
            size: ${
              stickerSize === '30x20'
                ? '30mm 20mm'
                : stickerSize === '50x30'
                ? '50mm 30mm'
                : '75mm 50mm'
            };
            margin: 0mm;
          }
          body * {
            visibility: hidden !important;
          }
          #printable-patient-sticker, #printable-patient-sticker * {
            visibility: visible !important;
          }
          #printable-patient-sticker {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: ${
              stickerSize === '30x20'
                ? '30mm'
                : stickerSize === '50x30'
                ? '50mm'
                : '75mm'
            } !important;
            height: ${
              stickerSize === '30x20'
                ? '20mm'
                : stickerSize === '50x30'
                ? '30mm'
                : '50mm'
            } !important;
            padding: ${stickerSize === '30x20' ? '1mm' : '2mm'} !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
            background: #ffffff !important;
            color: #000000 !important;
            overflow: hidden !important;
            box-sizing: border-box !important;
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
          maxHeight: '94vh',
        }}
      >
        {/* Modal Header */}
        <div
          className="no-print"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 20px',
            backgroundColor: '#0f172a',
            color: '#ffffff',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {labTest ? <TestTube size={19} color="#38bdf8" /> : <Tag size={19} color="#38bdf8" />}
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>
                {labTest ? 'ल्याब नमुना ट्युब स्टिकर प्रिन्ट (Lab Phlebotomy Tube Sticker)' : 'विरामी दर्ता थर्मल स्टिकर प्रिन्ट (Patient Label Sticker)'}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                थर्मल बारकोड र २D QR कोड प्रिन्ट (५०x३०मिमी / ३०x२०मिमी / ७५x५०मिमी)
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#94a3b8',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Controls Toolbar */}
        <div
          className="no-print"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 20px',
            backgroundColor: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
            flexWrap: 'wrap',
            gap: '10px',
          }}
        >
          {/* Size Selectors */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>साइज:</span>
            <button
              type="button"
              onClick={() => setStickerSize('30x20')}
              style={{
                padding: '4px 8px',
                borderRadius: '6px',
                border: '1px solid',
                borderColor: stickerSize === '30x20' ? '#7c3aed' : '#cbd5e1',
                backgroundColor: stickerSize === '30x20' ? '#ede9fe' : '#ffffff',
                color: stickerSize === '30x20' ? '#6d28d9' : '#475569',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <TestTube size={12} />
              ३०x२० मिमी (ल्याब ट्युब)
            </button>
            <button
              type="button"
              onClick={() => setStickerSize('50x30')}
              style={{
                padding: '4px 8px',
                borderRadius: '6px',
                border: '1px solid',
                borderColor: stickerSize === '50x30' ? '#0284c7' : '#cbd5e1',
                backgroundColor: stickerSize === '50x30' ? '#e0f2fe' : '#ffffff',
                color: stickerSize === '50x30' ? '#0369a1' : '#475569',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              ५०x३० मिमी (मानक)
            </button>
            <button
              type="button"
              onClick={() => setStickerSize('75x50')}
              style={{
                padding: '4px 8px',
                borderRadius: '6px',
                border: '1px solid',
                borderColor: stickerSize === '75x50' ? '#0284c7' : '#cbd5e1',
                backgroundColor: stickerSize === '75x50' ? '#e0f2fe' : '#ffffff',
                color: stickerSize === '75x50' ? '#0369a1' : '#475569',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              ७५x५० मिमी (पुर्जी)
            </button>
          </div>

          {/* Code Type Selector (Barcode vs QR vs Both) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>कोड:</span>
            <button
              type="button"
              onClick={() => setCodeType('barcode')}
              style={{
                padding: '4px 8px',
                borderRadius: '5px',
                border: '1px solid',
                borderColor: codeType === 'barcode' ? '#0f172a' : '#cbd5e1',
                backgroundColor: codeType === 'barcode' ? '#0f172a' : '#ffffff',
                color: codeType === 'barcode' ? '#ffffff' : '#475569',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Barcode size={13} />
              १D बारकोड
            </button>
            <button
              type="button"
              onClick={() => setCodeType('qrcode')}
              style={{
                padding: '4px 8px',
                borderRadius: '5px',
                border: '1px solid',
                borderColor: codeType === 'qrcode' ? '#0f172a' : '#cbd5e1',
                backgroundColor: codeType === 'qrcode' ? '#0f172a' : '#ffffff',
                color: codeType === 'qrcode' ? '#ffffff' : '#475569',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <QrCode size={13} />
              २D QR कोड
            </button>
            <button
              type="button"
              onClick={() => setCodeType('both')}
              style={{
                padding: '4px 8px',
                borderRadius: '5px',
                border: '1px solid',
                borderColor: codeType === 'both' ? '#0f172a' : '#cbd5e1',
                backgroundColor: codeType === 'both' ? '#0f172a' : '#ffffff',
                color: codeType === 'both' ? '#ffffff' : '#475569',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              दुबै (Both)
            </button>
          </div>

          {/* Thermal Print Button */}
          <button
            type="button"
            onClick={handlePrint}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#0284c7',
              color: '#ffffff',
              border: 'none',
              padding: '6px 14px',
              borderRadius: '6px',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(2, 132, 199, 0.25)',
            }}
          >
            <Printer size={15} />
            <span>थर्मल प्रिन्ट गर्नुहोस्</span>
          </button>
        </div>

        {/* ── PREVIEW CONTAINER ── */}
        <div
          style={{
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            backgroundColor: '#f1f5f9',
            overflowY: 'auto',
            maxHeight: 'calc(94vh - 180px)',
          }}
        >
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '8px', fontWeight: 700 }}>
            प्रिन्ट प्रिभ्यू (
            {stickerSize === '30x20'
              ? '३०मिमी x २०मिमी (ल्याब टेस्ट ट्युब)'
              : stickerSize === '50x30'
              ? '५०मिमी x ३०मिमी (मानक फार्मेसी/फाइल)'
              : '७५मिमी x ५०मिमी (ओपीडी पुर्जी)'}
            ) — {codeType === 'barcode' ? 'Code128' : codeType === 'qrcode' ? '2D QR Code' : 'बारकोड + QR'}
          </div>

          {/* ═════════════════════════════════════════════════════════════
              STICKER DESIGN 1: 30mm x 20mm (PHLEBOTOMY LAB TUBE LABEL)
             ═════════════════════════════════════════════════════════════ */}
          {stickerSize === '30x20' && (
            <div
              id="printable-patient-sticker"
              style={{
                width: '270px',
                height: '180px',
                backgroundColor: '#ffffff',
                border: '1px dashed #7c3aed',
                borderRadius: '6px',
                padding: '6px 8px',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                color: '#000000',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxSizing: 'border-box',
                position: 'relative',
              }}
            >
              {/* Header: Facility Mini + Tube Color Tag */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #000', paddingBottom: '2px' }}>
                <span style={{ fontSize: '0.62rem', fontWeight: 800, textTransform: 'uppercase' }}>
                  {facilityName.length > 20 ? facilityName.slice(0, 20) + '..' : facilityName}
                </span>
                <span
                  style={{
                    fontSize: '0.6rem',
                    fontWeight: 800,
                    padding: '1px 4px',
                    borderRadius: '3px',
                    backgroundColor: tubeIndicator.bg,
                    color: tubeIndicator.color,
                    border: `1px solid ${tubeIndicator.border}`,
                    lineHeight: 1,
                  }}
                >
                  {tubeIndicator.dot} {tubeIndicator.name}
                </span>
              </div>

              {/* Patient Name & Age/Sex */}
              <div style={{ marginTop: '2px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 900, lineHeight: 1.1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>
                    {patientName}
                  </div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800 }}>
                    {age}Y/{genderShort}
                  </div>
                </div>

                {/* Test Name if lab test */}
                {labTestName && (
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    जाँच: <strong>{labTestName}</strong>
                  </div>
                )}
              </div>

              {/* Barcode / QR Code Body */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', margin: '2px 0' }}>
                {/* QR Code */}
                {(codeType === 'qrcode' || codeType === 'both') && qrDataUrl && (
                  <img
                    src={qrDataUrl}
                    alt="2D QR Code"
                    style={{
                      width: codeType === 'both' ? '38px' : '48px',
                      height: codeType === 'both' ? '38px' : '48px',
                      objectFit: 'contain',
                      borderRadius: '2px',
                    }}
                  />
                )}

                {/* 1D Barcode & Sample ID */}
                {(codeType === 'barcode' || codeType === 'both') && (
                  <div style={{ flex: 1, textAlign: 'center' }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'flex-end',
                        height: codeType === 'both' ? '18px' : '24px',
                        gap: '1px',
                        margin: '0 auto',
                        maxWidth: '96%',
                      }}
                    >
                      {[2, 1, 3, 1, 2, 4, 1, 2, 3, 1, 4, 2, 1, 3, 2, 1, 4, 2, 3, 1, 2, 4, 1, 3, 2, 4].map(
                        (weight, idx) => (
                          <div
                            key={idx}
                            style={{
                              width: `${(weight % 3) + 1}px`,
                              height: '100%',
                              backgroundColor: '#000000',
                            }}
                          />
                        ),
                      )}
                    </div>
                    <div
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 900,
                        letterSpacing: '1px',
                        fontFamily: 'monospace',
                        marginTop: '1px',
                      }}
                    >
                      *{sampleOrPatientNo}*
                    </div>
                  </div>
                )}

                {/* If Only QR Code, show Sample ID prominently */}
                {codeType === 'qrcode' && (
                  <div style={{ flex: 1, textAlign: 'left', paddingLeft: '4px' }}>
                    <div style={{ fontSize: '0.62rem', color: '#64748b', fontWeight: 600 }}>नमूना / अर्डर नं:</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 900, fontFamily: 'monospace' }}>
                      {sampleOrPatientNo}
                    </div>
                    <div style={{ fontSize: '0.6rem', color: '#334155' }}>
                      {tubeIndicator.tube}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer: Date / Time */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.55rem', borderTop: '0.5px solid #94a3b8', paddingTop: '1px' }}>
                <span>संकलन: {currentDateBS}</span>
                <span>{currentTime}</span>
              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════
              STICKER DESIGN 2: 50mm x 30mm (STANDARD PHARMACY/FILE)
             ═════════════════════════════════════════════════════════════ */}
          {stickerSize === '50x30' && (
            <div
              id="printable-patient-sticker"
              style={{
                width: '330px',
                minHeight: '200px',
                backgroundColor: '#ffffff',
                border: '1px dashed #0284c7',
                borderRadius: '8px',
                padding: '10px 12px',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                color: '#000000',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxSizing: 'border-box',
              }}
            >
              {/* Sticker Top Header */}
              <div style={{ borderBottom: '1px solid #000', paddingBottom: '3px', marginBottom: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase' }}>
                    {facilityName}
                  </div>
                  <div style={{ fontSize: '0.64rem', fontWeight: 700 }}>
                    वडा नं. {wardNumber}
                  </div>
                </div>
              </div>

              {/* Patient Name & Details */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: 900 }}>
                    {patientName}
                  </div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800 }}>
                    {age}Y/{genderShort} {bloodGroup ? `(${bloodGroup})` : ''}
                  </div>
                </div>

                {patientNameEn && (
                  <div style={{ fontSize: '0.68rem', color: '#334155', fontWeight: 600, marginTop: '-2px' }}>
                    {patientNameEn}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', marginTop: '3px' }}>
                  <span>विभाग: <strong>{department}</strong></span>
                  <span>सम्पर्क: <strong>{phone}</strong></span>
                </div>
              </div>

              {/* Health Insurance Banner if Insured */}
              {hasHealthInsurance && (
                <div
                  style={{
                    border: '1px solid #000',
                    borderRadius: '3px',
                    padding: '1px 4px',
                    marginTop: '2px',
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>🛡️ HIB INSURED (बीमित)</span>
                  <span>कार्ड: {insuranceNumber || 'N/A'}</span>
                </div>
              )}

              {/* Codes Display: Barcode, QR, or Both */}
              <div style={{ marginTop: '5px', borderTop: '1px solid #000', paddingTop: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                {(codeType === 'qrcode' || codeType === 'both') && qrDataUrl && (
                  <img
                    src={qrDataUrl}
                    alt="QR Code"
                    style={{ width: '48px', height: '48px', objectFit: 'contain' }}
                  />
                )}

                {(codeType === 'barcode' || codeType === 'both') && (
                  <div style={{ flex: 1, textAlign: 'center' }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'flex-end',
                        height: '24px',
                        gap: '1.5px',
                        margin: '0 auto',
                        maxWidth: '90%',
                      }}
                    >
                      {[3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 3, 1, 2, 3, 4, 1, 2, 4, 3, 1, 2, 4, 1, 3, 2, 4, 1, 3, 2, 1, 4, 2, 3, 1, 4].map(
                        (weight, idx) => (
                          <div
                            key={idx}
                            style={{
                              width: `${(weight % 3) + 1}px`,
                              height: '100%',
                              backgroundColor: '#000000',
                            }}
                          />
                        ),
                      )}
                    </div>
                    <div
                      style={{
                        fontSize: '0.78rem',
                        fontWeight: 900,
                        letterSpacing: '1.5px',
                        fontFamily: 'monospace',
                        marginTop: '2px',
                      }}
                    >
                      *{sampleOrPatientNo}*
                    </div>
                  </div>
                )}

                {codeType === 'qrcode' && (
                  <div style={{ textAlign: 'left', flex: 1, paddingLeft: '6px' }}>
                    <div style={{ fontSize: '0.62rem', color: '#64748b' }}>दर्ता नम्बर (MRN):</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 900, fontFamily: 'monospace' }}>
                      {sampleOrPatientNo}
                    </div>
                    <div style={{ fontSize: '0.62rem', color: '#059669', fontWeight: 700 }}>
                      ✓ २D स्क्यानर योग्य
                    </div>
                  </div>
                )}
              </div>

              {/* Date & User footer */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.58rem',
                  color: '#334155',
                  borderTop: '0.5px solid #cbd5e1',
                  paddingTop: '2px',
                  marginTop: '3px',
                }}
              >
                <span>दर्ता मिति: {currentDateBS}</span>
                <span>समय: {currentTime}</span>
              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════
              STICKER DESIGN 3: 75mm x 50mm (LARGE OPD TICKET STICKER)
             ═════════════════════════════════════════════════════════════ */}
          {stickerSize === '75x50' && (
            <div
              id="printable-patient-sticker"
              style={{
                width: '450px',
                minHeight: '290px',
                backgroundColor: '#ffffff',
                border: '1px dashed #0f172a',
                borderRadius: '8px',
                padding: '12px 16px',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                color: '#000000',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxSizing: 'border-box',
              }}
            >
              <div style={{ borderBottom: '1.5px solid #000', paddingBottom: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 900, textTransform: 'uppercase' }}>
                      {facilityName}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: '#334155' }}>
                      पाँचपोखरी थाङपाल गाउँपालिका, सिन्धुपाल्चोक — वडा नं. {wardNumber}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 800 }}>ओपिडी टिकट / लेबल</div>
                    <div style={{ fontSize: '0.62rem', color: '#64748b' }}>{currentDateBS}</div>
                  </div>
                </div>
              </div>

              <div style={{ margin: '8px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 900 }}>
                    {patientName}
                  </div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 800 }}>
                    {age} वर्ष / {genderShort} {bloodGroup ? `[${bloodGroup}]` : ''}
                  </div>
                </div>

                {patientNameEn && (
                  <div style={{ fontSize: '0.75rem', color: '#334155', fontWeight: 600 }}>
                    {patientNameEn}
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', fontSize: '0.72rem', marginTop: '4px' }}>
                  <div>विभाग: <strong>{department}</strong></div>
                  <div>सम्पर्क: <strong>{phone}</strong></div>
                  {labTestName && <div>जाँच: <strong>{labTestName}</strong></div>}
                  {labSampleType && <div>नमूना: <strong>{labSampleType}</strong></div>}
                </div>
              </div>

              {hasHealthInsurance && (
                <div
                  style={{
                    border: '1px solid #000',
                    borderRadius: '4px',
                    padding: '2px 8px',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    display: 'flex',
                    justifyContent: 'space-between',
                    backgroundColor: '#f8fafc',
                  }}
                >
                  <span>🛡️ स्वास्थ्य बीमा बोर्ड (HIB INSURED)</span>
                  <span>कार्ड नं: {insuranceNumber || 'N/A'}</span>
                </div>
              )}

              {/* Bottom Codes */}
              <div style={{ marginTop: '8px', borderTop: '1px solid #000', paddingTop: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                {qrDataUrl && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <img
                      src={qrDataUrl}
                      alt="QR"
                      style={{ width: '56px', height: '56px', objectFit: 'contain' }}
                    />
                    <div style={{ fontSize: '0.62rem', color: '#475569' }}>
                      <strong>२D QR Code</strong><br />स्मार्टफोन स्क्यान
                    </div>
                  </div>
                )}

                <div style={{ flex: 1, textAlign: 'center' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'flex-end',
                      height: '32px',
                      gap: '2px',
                      margin: '0 auto',
                      maxWidth: '90%',
                    }}
                  >
                    {[3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 3, 1, 2, 3, 4, 1, 2, 4, 3, 1, 2, 4, 1, 3, 2, 4, 1, 3, 2, 1, 4, 2, 3, 1, 4].map(
                      (weight, idx) => (
                        <div
                          key={idx}
                          style={{
                            width: `${(weight % 3) + 1}px`,
                            height: '100%',
                            backgroundColor: '#000000',
                          }}
                        />
                      ),
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: 900,
                      letterSpacing: '2px',
                      fontFamily: 'monospace',
                      marginTop: '2px',
                    }}
                  >
                    *{sampleOrPatientNo}*
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', color: '#64748b', borderTop: '0.5px solid #cbd5e1', paddingTop: '3px', marginTop: '4px' }}>
                <span>मुद्रण: {currentDateBS} {currentTime}</span>
                <span>पाँचपोखरी डिजिटल ट्विन HMIS</span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          className="no-print"
          style={{
            padding: '12px 20px',
            backgroundColor: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            fontSize: '0.78rem',
            color: '#64748b',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={14} color="#0284c7" />
            <span>
              {stickerSize === '30x20'
                ? '💡 ३०x२० मिमी स्टिकर रक्त/पिसाब नमुना ट्युब (Phlebotomy Tube) का लागि उत्तम हुन्छ।'
                : '💡 ५०x३० मिमी स्टिकर ओपिडी फाइल, फार्मेसी औषधि बट्टा र पुर्जीका लागि उत्तम हुन्छ।'}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#334155',
              fontWeight: 600,
              fontSize: '0.8rem',
              cursor: 'pointer',
            }}
          >
            बन्द गर्नुहोस्
          </button>
        </div>
      </div>
    </div>
  );
};
