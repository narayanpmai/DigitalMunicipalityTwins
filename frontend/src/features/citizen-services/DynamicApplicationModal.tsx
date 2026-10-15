import React, { useState } from 'react';
import {
  X,
  FileText,
  User,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Send,
  Loader2,
  Printer,
  Eye,
  Check,
  Sparkles,
} from 'lucide-react';
import { SifarishTemplate } from './sifarishTemplates';
import { OfficialSifarishLetterhead } from './OfficialSifarishLetterhead';
import { useTenant } from '../../context/TenantContext';

interface DynamicApplicationModalProps {
  template: SifarishTemplate;
  onClose: () => void;
  onSuccess: (result: any) => void;
}

export const DynamicApplicationModal: React.FC<DynamicApplicationModalProps> = ({
  template,
  onClose,
  onSuccess,
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Retrieve logged-in Municipality from TenantContext
  let tenantSettings: any = null;
  try {
    const tenantCtx = useTenant();
    tenantSettings = tenantCtx?.settings;
  } catch {}
  const activePalikaName = tenantSettings?.palika_name || 'पाँचपोखरी थाङपाल गाउँपालिका';
  const totalWards = tenantSettings?.total_wards || 8;

  // Step 1: Applicant Details
  const [applicantName, setApplicantName] = useState('');
  const [applicantPhone, setApplicantPhone] = useState('');
  const [applicantCitizenshipNo, setApplicantCitizenshipNo] = useState('');
  const [wardNumber, setWardNumber] = useState('3');
  const [currentAddress, setCurrentAddress] = useState('');
  const [purpose, setPurpose] = useState(`सम्बन्धित निकायमा ${template.title} पेश गर्न।`);

  // Step 2: Dynamic Template Fields
  const [formData, setFormData] = useState<Record<string, any>>({});

  // Dynamic Family Table for Relationship Certificate
  const [familyMembers, setFamilyMembers] = useState<
    Array<{ name: string; relation: string; dob: string; citizenshipNo: string }>
  >([
    { name: '', relation: 'स्वयं (निवेदक)', dob: '', citizenshipNo: '' },
    { name: '', relation: 'बुवा', dob: '', citizenshipNo: '' },
    { name: '', relation: 'आमा', dob: '', citizenshipNo: '' },
  ]);

  // Step 3: Uploaded Documents Checklist
  const [uploadedDocs, setUploadedDocs] = useState<
    Record<string, { fileName: string; size: string; uploadedAt: string }>
  >({});

  // Submission States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleFieldChange = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleAddFamilyMember = () => {
    setFamilyMembers((prev) => [
      ...prev,
      { name: '', relation: 'छोरा/छोरी', dob: '', citizenshipNo: '' },
    ]);
  };

  const handleRemoveFamilyMember = (index: number) => {
    setFamilyMembers((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateFamilyMember = (index: number, key: string, value: string) => {
    setFamilyMembers((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [key]: value };
      return copy;
    });
  };

  const handleSimulateFileUpload = (docName: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedDocs((prev) => ({
        ...prev,
        [docName]: {
          fileName: file.name,
          size: `${(file.size / 1024).toFixed(1)} KB`,
          uploadedAt: new Date().toLocaleTimeString('ne-NP'),
        },
      }));
    }
  };

  const handleSubmit = async () => {
    if (!applicantName.trim() || !applicantPhone.trim()) {
      setErrorMessage('कृपया निवेदकको पूरा नाम र सम्पर्क नम्बर अनिवार्य भर्नुहोस्।');
      setCurrentStep(1);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const payload = {
        applicantName,
        applicantPhone,
        wardNumber: Number(wardNumber),
        serviceType: template.serviceType,
        purpose,
        fee: template.feeNpr === 'free' ? 0 : template.feeNpr,
        remarks: `${template.title} का लागि अनलाइन आवेदन पेश भएको।`,
        formData: {
          ...formData,
          citizenshipNo: applicantCitizenshipNo,
          currentAddress,
          wardNumber,
          formatId: template.id,
          formatCode: template.code,
          familyMembers: template.hasFamilyTable ? familyMembers : undefined,
        },
        documents: Object.entries(uploadedDocs).map(([docType, info]) => ({
          type: docType,
          fileName: info.fileName,
          size: info.size,
          uploadedAt: info.uploadedAt,
        })),
      };

      const res = await fetch('/api/v1/citizen-services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error('आवेदन दर्ता गर्न सकिएन। कृपया पुनः प्रयास गर्नुहोस्।');
      }

      const result = await res.json();
      setSubmittedData(result);
      onSuccess(result);
    } catch (err: any) {
      setErrorMessage(err.message || 'आवेदन पेश गर्दा समस्या आयो।');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAutoFillDemo = () => {
    setApplicantName('सुनिता तामाङ');
    setApplicantPhone('९८४१२३४५६७');
    setApplicantCitizenshipNo('२३-०१-७५-००१२३');
    setWardNumber('३');
    setCurrentAddress('थाङपालधाप-३, मानेडाँडा');
    setPurpose(`सम्बन्धित निकायमा ${template.title} पेश गर्नका लागि।`);

    const demoFields: Record<string, any> = {
      fatherName: 'रामबहादुर तामाङ',
      fatherCitizenshipNo: '२३-०१-७०-०१४५',
      motherName: 'माया तामाङ',
      motherCitizenshipNo: '२३-०१-७२-०८९२',
      grandfatherName: 'कमानसिंह तामाङ',
      dobBs: '२०५८/०४/१२',
      formerVdc: 'थाङपालधाप',
      formerWard: 3,
      citizenshipType: 'descent',
      birthPlace: 'थाङपालधाप-३, सिन्धुपाल्चोक',
      kittaNo: '१२८, १२९',
      area: '०-८-२-०',
      eastBoundary: 'राम तामाङको जग्गा',
      westBoundary: '१० फिटे ग्राभेल बाटो',
      northBoundary: 'हरि श्रेष्ठको घर',
      southBoundary: 'सरकारी कुलो',
      roadType: 'gravel',
      roadWidth: '१६ फिट',
      buildingType: 'rcc',
      nearestPoleNo: 'P-5-104',
      requiredLoad: '15A',
      toleName: 'मानेडाँडा',
      businessName: 'पाँचपोखरी अर्गानिक कृषि तथा होमस्टे',
      businessType: 'tourism',
      capital: 500000,
      annualIncome: 90000,
      institutionName: 'पाँचपोखरी माध्यमिक विद्यालय',
      studyLevel: 'कक्षा १२',
      age: 23,
      pensionNo: 'P-239482',
      pensionType: 'civil',
      heirNames: '१. सुनिता तामाङ (छोरी), २. पासाङ तामाङ (छोरा)',
      deceasedName: 'कान्छा तामाङ',
      deceasedDateBs: '२०८०/१०/१२',
    };
    setFormData(demoFields);

    if (template.hasFamilyTable) {
      setFamilyMembers([
        { name: 'सुनिता तामाङ', relation: 'स्वयं (निवेदक)', dob: '२०५८/०४/१२', citizenshipNo: '२३-०१-७५-००१२३' },
        { name: 'रामबहादुर तामाङ', relation: 'बुवा', dob: '२०३२/०१/१०', citizenshipNo: '२३-०१-७०-०१४५' },
        { name: 'माया तामाङ', relation: 'आमा', dob: '२०३६/०३/१५', citizenshipNo: '२३-०१-७२-०८९२' },
      ]);
    }

    const demoDocs: any = {};
    template.requiredDocs.forEach((d) => {
      demoDocs[d] = {
        fileName: `${d.replace(/[\s\/\(\)]/g, '_')}_pramanit.pdf`,
        size: '220 KB',
        uploadedAt: new Date().toLocaleTimeString('ne-NP'),
      };
    });
    setUploadedDocs(demoDocs);
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
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          maxWidth: currentStep === 4 && !submittedData ? '960px' : '800px',
          width: '100%',
          maxHeight: '94vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)',
          overflow: 'hidden',
          fontFamily: "'Mukta', 'Noto Sans Devanagari', sans-serif",
          transition: 'max-width 0.2s ease',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            backgroundColor: '#1e3a8a',
            color: 'white',
            padding: '1rem 1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '2px solid #3b82f6',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={20} color="#93c5fd" />
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>
                {template.title}
              </h3>
            </div>
            <div style={{ fontSize: '0.78rem', color: '#bfdbfe', marginTop: '2px' }}>
              {template.legalReference} | दस्तुर: {template.feeNpr === 'free' ? 'निःशुल्क' : `रु. ${template.feeNpr}`}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              borderRadius: '8px',
              padding: '0.4rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* ─── MODERN 4-STEP PROGRESS HEADER (NO CLIPPING, AMPLE LINE-HEIGHT) ─── */}
        {!submittedData && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              backgroundColor: '#f8fafc',
              borderBottom: '1px solid #cbd5e1',
              padding: '0.65rem 1rem',
              gap: '0.6rem',
            }}
          >
            {[
              { num: 1, label: 'निवेदक विवरण', icon: <User size={14} /> },
              { num: 2, label: 'ढाँचा विवरण', icon: <FileText size={14} /> },
              { num: 3, label: 'कागजात अपलोड', icon: <UploadCloud size={14} /> },
              { num: 4, label: 'लेटरहेड पूर्वावलोकन', icon: <Eye size={14} /> },
            ].map((step) => {
              const isActive = currentStep === step.num;
              const isPassed = currentStep > step.num;
              return (
                <button
                  key={step.num}
                  type="button"
                  onClick={() => setCurrentStep(step.num as any)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.45rem',
                    padding: '0.55rem 0.65rem',
                    minHeight: '42px',
                    borderRadius: '8px',
                    border: isActive ? '1.5px solid #2563eb' : '1px solid #e2e8f0',
                    backgroundColor: isActive ? '#ffffff' : isPassed ? '#eff6ff' : 'transparent',
                    color: isActive ? '#1d4ed8' : isPassed ? '#1e40af' : '#64748b',
                    fontWeight: isActive ? 800 : 600,
                    fontSize: '0.84rem',
                    lineHeight: 1.4,
                    cursor: 'pointer',
                    boxShadow: isActive ? '0 2px 8px rgba(37,99,235,0.16)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span
                    style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      backgroundColor: isActive ? '#2563eb' : isPassed ? '#16a34a' : '#cbd5e1',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      flexShrink: 0,
                    }}
                  >
                    {isPassed ? '✓' : step.num}
                  </span>
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {step.label}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div style={{ padding: '1.25rem 1.5rem', overflowY: 'auto', flex: 1 }}>
          {errorMessage && (
            <div
              style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#dc2626',
                padding: '0.65rem 1rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1rem',
              }}
            >
              <AlertCircle size={16} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* ─── SUCCESS SCREEN: APPLICATION ACKNOWLEDGMENT SLIP (दर्ता निस्सा) ─── */}
          {submittedData ? (
            <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
              <CheckCircle2 size={54} color="#16a34a" style={{ margin: '0 auto 0.5rem' }} />
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.3rem' }}>
                आवेदन सफलतापूर्वक दर्ता भयो!
              </h3>
              <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '1rem' }}>
                तपाईंको अनलाइन सिफारिस दरखास्त पाँचपोखरी थाङपाल गाउँपालिका वडा नं. {wardNumber} को प्रणालीमा दर्ता भएको छ।
              </p>

              {/* Printable Official Slip */}
              <div
                id="application-slip-print"
                style={{
                  backgroundColor: '#f8fafc',
                  border: '2px dashed #93c5fd',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  textAlign: 'left',
                  margin: '0 auto 1.5rem',
                  maxWidth: '560px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #cbd5e1', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#b91c1c' }}>पाँचपोखरी थाङपाल गाउँपालिका</div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#1e3a8a' }}>अनलाइन आवेदन दर्ता निस्सा (Receipt)</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>वडा नं. {wardNumber} कार्यालय, सिन्धुपाल्चोक</div>
                  </div>
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=${encodeURIComponent(
                      `${window.location.origin}/app/citizen-services?track=${submittedData.applicationNo}`
                    )}`}
                    style={{ width: '65px', height: '65px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                    alt="QR"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', fontSize: '0.86rem' }}>
                  <div>
                    <span style={{ color: '#64748b' }}>टोकन / आवेदन नं:</span>
                    <div style={{ fontWeight: 800, color: '#1d4ed8', fontSize: '1rem' }}>
                      {submittedData.applicationNo}
                    </div>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>दर्ता मिति:</span>
                    <div style={{ fontWeight: 600 }}>{new Date().toLocaleDateString('ne-NP')}</div>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>सेवाको नाम:</span>
                    <div style={{ fontWeight: 700 }}>{template.title}</div>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>निवेदकको नाम:</span>
                    <div style={{ fontWeight: 700 }}>{submittedData.applicantName}</div>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>सम्पर्क नम्बर:</span>
                    <div>{submittedData.applicantPhone}</div>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>राजस्व दस्तुर:</span>
                    <div style={{ fontWeight: 700, color: '#16a34a' }}>
                      {template.feeNpr === 'free' ? 'निःशुल्क' : `रु. ${template.feeNpr}`}
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '0.75rem', padding: '0.6rem', backgroundColor: '#e0f2fe', borderRadius: '6px', fontSize: '0.78rem', color: '#0369a1' }}>
                  ℹ️ <strong>नागरिकलाई जानकारी:</strong> यो निस्सा सुरक्षित राख्नुहोला वा प्रिन्ट गर्नुहोस्। माथिको टोकन नम्बर वा QR कोड स्क्यान गरी कुनै पनि समय आवेदनको प्रत्यक्ष प्रगति ट्र्याक गर्न सकिनेछ।
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
                <button
                  onClick={() => window.print()}
                  style={{
                    padding: '0.6rem 1.25rem',
                    borderRadius: '8px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #cbd5e1',
                    color: '#334155',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  <Printer size={16} />
                  <span>निस्सा प्रिन्ट गर्नुहोस्</span>
                </button>
                <button
                  onClick={onClose}
                  style={{
                    padding: '0.6rem 1.5rem',
                    borderRadius: '8px',
                    backgroundColor: '#2563eb',
                    border: 'none',
                    color: 'white',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  बन्द गर्नुहोस् (Close)
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* ─── STEP 1: APPLICANT BIO ─── */}
              {currentStep === 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      backgroundColor: '#eff6ff',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid #bfdbfe',
                      flexWrap: 'wrap',
                      gap: '0.5rem',
                    }}
                  >
                    <span style={{ fontSize: '0.85rem', color: '#1e40af', fontWeight: 700 }}>
                      👤 निवेदकको व्यक्तिगत विवरण प्रविष्ट गर्नुहोस्:
                    </span>
                    <button
                      type="button"
                      onClick={handleAutoFillDemo}
                      style={{
                        backgroundColor: '#2563eb',
                        color: 'white',
                        border: 'none',
                        padding: '0.35rem 0.75rem',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        boxShadow: '0 2px 4px rgba(37,99,235,0.2)',
                      }}
                    >
                      <Sparkles size={13} />
                      <span>⚡ नमुना भर्नुहोस् (Auto-fill)</span>
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem', color: '#334155' }}>
                        निवेदकको पूरा नाम *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="उदा: सुनिता तामाङ"
                        value={applicantName}
                        onChange={(e) => setApplicantName(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.6rem',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.9rem',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem', color: '#334155' }}>
                        सम्पर्क मोबाइल नं. *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="९८४१००००००"
                        value={applicantPhone}
                        onChange={(e) => setApplicantPhone(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.6rem',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.9rem',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem', color: '#334155' }}>
                        नागरिकता नं. / राष्ट्रिय परिचयपत्र नं.
                      </label>
                      <input
                        type="text"
                        placeholder="उदा: २३-०१-७५-००१२३"
                        value={applicantCitizenshipNo}
                        onChange={(e) => {
                          setApplicantCitizenshipNo(e.target.value);
                          handleFieldChange('citizenshipNo', e.target.value);
                        }}
                        style={{
                          width: '100%',
                          padding: '0.6rem',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.9rem',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem', color: '#334155' }}>
                        सम्बन्धित वडा नं. *
                      </label>
                      <select
                        value={wardNumber}
                        onChange={(e) => {
                          setWardNumber(e.target.value);
                          handleFieldChange('wardNumber', e.target.value);
                        }}
                        style={{
                          width: '100%',
                          padding: '0.6rem',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.9rem',
                          boxSizing: 'border-box',
                        }}
                      >
                        {Array.from({ length: totalWards }, (_, i) => i + 1).map((w) => (
                          <option key={w} value={w}>
                            वडा नं. {w} ({activePalikaName})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem', color: '#334155' }}>
                      हाल बसोबास रहेको ठेगाना / टोल
                    </label>
                    <input
                      type="text"
                      placeholder="उदा: थाङपालधाप-३, मानेडाँडा"
                      value={currentAddress}
                      onChange={(e) => {
                        setCurrentAddress(e.target.value);
                        handleFieldChange('currentAddress', e.target.value);
                      }}
                      style={{
                        width: '100%',
                        padding: '0.6rem',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.9rem',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem', color: '#334155' }}>
                      सिफारिस / सेवाको मुख्य प्रयोजन
                    </label>
                    <textarea
                      rows={2}
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.6rem',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.88rem',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>
              )}

              {/* ─── STEP 2: DYNAMIC SPECIFIC FIELDS ─── */}
              {currentStep === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div
                    style={{
                      backgroundColor: '#eff6ff',
                      border: '1px solid #bfdbfe',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      color: '#1e40af',
                    }}
                  >
                    📝 <strong>{template.title}</strong> का लागि आवश्यक सरकारी विवरण भर्नुहोस्:
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.85rem' }}>
                    {template.specificFields.map((field) => (
                      <div key={field.key} style={{ gridColumn: field.type === 'textarea' ? '1 / -1' : undefined }}>
                        <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, marginBottom: '0.3rem', color: '#334155' }}>
                          {field.label}
                        </label>
                        {field.type === 'select' ? (
                          <select
                            value={formData[field.key] || ''}
                            onChange={(e) => handleFieldChange(field.key, e.target.value)}
                            style={{
                              width: '100%',
                              padding: '0.55rem',
                              borderRadius: '6px',
                              border: '1px solid #cbd5e1',
                              fontSize: '0.88rem',
                              boxSizing: 'border-box',
                            }}
                          >
                            <option value="">-- छनोट गर्नुहोस् --</option>
                            {field.options?.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        ) : field.type === 'textarea' ? (
                          <textarea
                            rows={2}
                            placeholder={field.placeholder}
                            value={formData[field.key] || ''}
                            onChange={(e) => handleFieldChange(field.key, e.target.value)}
                            style={{
                              width: '100%',
                              padding: '0.55rem',
                              borderRadius: '6px',
                              border: '1px solid #cbd5e1',
                              fontSize: '0.88rem',
                              boxSizing: 'border-box',
                            }}
                          />
                        ) : (
                          <input
                            type={field.type}
                            placeholder={field.placeholder}
                            value={formData[field.key] || ''}
                            onChange={(e) => handleFieldChange(field.key, e.target.value)}
                            style={{
                              width: '100%',
                              padding: '0.55rem',
                              borderRadius: '6px',
                              border: '1px solid #cbd5e1',
                              fontSize: '0.88rem',
                              boxSizing: 'border-box',
                            }}
                          />
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Relationship Family Member Table */}
                  {template.hasFamilyTable && (
                    <div style={{ marginTop: '1rem', backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                        <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>
                          पारिवारिक सदस्यहरूको नामावली (Family Members)
                        </strong>
                        <button
                          type="button"
                          onClick={handleAddFamilyMember}
                          style={{
                            padding: '0.35rem 0.75rem',
                            borderRadius: '6px',
                            backgroundColor: '#2563eb',
                            color: 'white',
                            border: 'none',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                          }}
                        >
                          <Plus size={14} />
                          <span>सदस्य थप्नुहोस्</span>
                        </button>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {familyMembers.map((member, idx) => (
                          <div
                            key={idx}
                            style={{
                              display: 'grid',
                              gridTemplateColumns: '2fr 1.2fr 1.2fr 1.5fr auto',
                              gap: '0.5rem',
                              alignItems: 'center',
                              backgroundColor: 'white',
                              padding: '0.5rem',
                              borderRadius: '6px',
                              border: '1px solid #cbd5e1',
                            }}
                          >
                            <input
                              type="text"
                              placeholder="सदस्यको पूरा नाम"
                              value={member.name}
                              onChange={(e) => handleUpdateFamilyMember(idx, 'name', e.target.value)}
                              style={{ padding: '0.45rem', fontSize: '0.82rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                            />
                            <input
                              type="text"
                              placeholder="नाता सम्बन्ध"
                              value={member.relation}
                              onChange={(e) => handleUpdateFamilyMember(idx, 'relation', e.target.value)}
                              style={{ padding: '0.45rem', fontSize: '0.82rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                            />
                            <input
                              type="text"
                              placeholder="जन्म मिति (वि.सं.)"
                              value={member.dob}
                              onChange={(e) => handleUpdateFamilyMember(idx, 'dob', e.target.value)}
                              style={{ padding: '0.45rem', fontSize: '0.82rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                            />
                            <input
                              type="text"
                              placeholder="नागरिकता / जन्मदर्ता नं."
                              value={member.citizenshipNo}
                              onChange={(e) => handleUpdateFamilyMember(idx, 'citizenshipNo', e.target.value)}
                              style={{ padding: '0.45rem', fontSize: '0.82rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                            />
                            {familyMembers.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveFamilyMember(idx)}
                                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ─── STEP 3: DOCUMENT UPLOAD CHECKLIST ─── */}
              {currentStep === 3 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div
                    style={{
                      backgroundColor: '#f0fdf4',
                      border: '1px solid #bbf7d0',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      color: '#166534',
                    }}
                  >
                    📎 <strong>{template.title}</strong> का लागि आवश्यक प्रमाण तथा कागजातहरू अनलाइन संलग्न गर्नुहोस्:
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {template.requiredDocs.map((doc, idx) => {
                      const uploaded = uploadedDocs[doc];
                      return (
                        <div
                          key={idx}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '0.75rem 1rem',
                            borderRadius: '8px',
                            border: uploaded ? '1px solid #86efac' : '1px dashed #cbd5e1',
                            backgroundColor: uploaded ? '#f0fdf4' : '#ffffff',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            {uploaded ? (
                              <CheckCircle2 size={18} color="#16a34a" />
                            ) : (
                              <span
                                style={{
                                  width: '20px',
                                  height: '20px',
                                  borderRadius: '50%',
                                  backgroundColor: '#e2e8f0',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '0.72rem',
                                  fontWeight: 700,
                                  color: '#64748b',
                                }}
                              >
                                {idx + 1}
                              </span>
                            )}
                            <div>
                              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
                                {doc}
                              </div>
                              {uploaded && (
                                <div style={{ fontSize: '0.74rem', color: '#16a34a', fontWeight: 500 }}>
                                  ✓ संलग्न भयो: {uploaded.fileName} ({uploaded.size})
                                </div>
                              )}
                            </div>
                          </div>

                          <label
                            style={{
                              padding: '0.4rem 0.8rem',
                              borderRadius: '6px',
                              backgroundColor: uploaded ? '#dcfce7' : '#f1f5f9',
                              color: uploaded ? '#15803d' : '#475569',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              border: '1px solid #cbd5e1',
                            }}
                          >
                            <UploadCloud size={14} />
                            <span>{uploaded ? 'परिवर्तन गर्नुहोस्' : 'फाइल छान्नुहोस्'}</span>
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              style={{ display: 'none' }}
                              onChange={(e) => handleSimulateFileUpload(doc, e)}
                            />
                          </label>
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ fontSize: '0.78rem', color: '#64748b', backgroundColor: '#f8fafc', padding: '0.5rem', borderRadius: '6px' }}>
                    * स्वीकृत ढाँचाहरू: PDF, JPEG, PNG (अधिकतम ५ MB प्रति फाइल)।
                  </div>
                </div>
              )}

              {/* ─── STEP 4: LIVE LETTERHEAD PREVIEW ─── */}
              {currentStep === 4 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div
                    style={{
                      backgroundColor: '#f0fdf4',
                      border: '1px solid #bbf7d0',
                      padding: '0.65rem 1rem',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      color: '#166534',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '0.5rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <Eye size={17} color="#16a34a" />
                      <span>
                        <strong>आधिकारिक सिफारिस मस्यौदा (Official Draft Preview):</strong> तपाईंले भरेको विवरण अनुसार तयार भएको पत्र तल हेर्नुहोस्।
                      </span>
                    </div>
                    <span style={{ fontSize: '0.76rem', color: '#15803d', fontWeight: 700, backgroundColor: '#dcfce7', padding: '0.2rem 0.55rem', borderRadius: '4px' }}>
                      ✓ A4 Format Fit
                    </span>
                  </div>

                  {/* Document Desk Container */}
                  <div
                    style={{
                      backgroundColor: '#f1f5f9',
                      border: '1px solid #cbd5e1',
                      borderRadius: '10px',
                      padding: '1rem',
                      maxHeight: '560px',
                      overflowY: 'auto',
                      display: 'flex',
                      justifyContent: 'center',
                    }}
                  >
                    <div
                      style={{
                        backgroundColor: '#ffffff',
                        boxShadow: '0 6px 20px rgba(0,0,0,0.12)',
                        borderRadius: '4px',
                        width: '100%',
                        maxWidth: '210mm',
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      <OfficialSifarishLetterhead
                        template={template}
                        embedded={true}
                        applicantData={{
                          applicantName: applicantName || 'सुनिता तामाङ',
                          applicantPhone,
                          wardNumber,
                          purpose,
                          formData: {
                            ...formData,
                            citizenshipNo: applicantCitizenshipNo,
                            currentAddress,
                            wardNumber,
                          },
                          familyMembers: template.hasFamilyTable ? familyMembers : undefined,
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer Controls */}
        {!submittedData && (
          <div
            style={{
              padding: '1rem 1.5rem',
              borderTop: '1px solid #e2e8f0',
              backgroundColor: '#f8fafc',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep((prev) => (prev - 1) as any)}
                  style={{
                    padding: '0.55rem 1.1rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: 'white',
                    color: '#475569',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  <ArrowLeft size={16} />
                  <span>अघिल्लो चरण</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    padding: '0.55rem 1.1rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: 'white',
                    color: '#64748b',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                  }}
                >
                  रद्द गर्नुहोस्
                </button>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={() => {
                    if (currentStep === 1 && (!applicantName.trim() || !applicantPhone.trim())) {
                      setErrorMessage('कृपया नाम र सम्पर्क नम्बर अनिवार्य भर्नुहोस्।');
                      return;
                    }
                    setErrorMessage('');
                    setCurrentStep((prev) => (prev + 1) as any);
                  }}
                  style={{
                    padding: '0.55rem 1.25rem',
                    borderRadius: '8px',
                    backgroundColor: '#2563eb',
                    border: 'none',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  <span>अर्को चरण</span>
                  <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleSubmit}
                  style={{
                    padding: '0.6rem 1.6rem',
                    borderRadius: '8px',
                    backgroundColor: '#16a34a',
                    border: 'none',
                    color: 'white',
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    boxShadow: '0 2px 8px rgba(22,163,74,0.3)',
                  }}
                >
                  {isSubmitting ? <Loader2 size={16} className="spinner" /> : <Send size={16} />}
                  <span>दरखास्त पेश गर्नुहोस् (Submit)</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DynamicApplicationModal;
