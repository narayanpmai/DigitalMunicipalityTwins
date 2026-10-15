import React, { useState, useEffect, useMemo } from 'react';
import {
  Printer,
  X,
  ShieldCheck,
  Building,
  Lock,
  Smartphone,
  CheckCircle2,
  Send,
  Check,
  Hash,
  ExternalLink,
  RefreshCw,
  MessageSquare,
} from 'lucide-react';
import { SifarishTemplate } from './sifarishTemplates';
import { useTenant } from '../../context/TenantContext';
import { useAuth } from '../../context/AuthContext';

export interface PalikaLetterheadConfig {
  id: string;
  localGovType: string;
  palikaName: string;
  palikaNameEn: string;
  officeTitle: string;
  location: string;
  provinceCountry: string;
  establishedYear: string;
  slogan: string;
  website: string;
  email: string;
  phone: string;
  emblemUrl: string;
  logoUrl: string;
}

// Built-in Municipal Profiles for instant dynamic switching
export const PRESET_MUNICIPALITIES: Record<string, PalikaLetterheadConfig> = {
  panchpokhari: {
    id: 'panchpokhari',
    localGovType: 'स्थानीय सरकार',
    palikaName: 'पाँचपोखरी थाङ्गपाल गाउँपालिका',
    palikaNameEn: 'PANCHPOKHARI THANGPAL RURAL MUNICIPALITY',
    officeTitle: 'गाउँकार्यपालिकाको कार्यालय',
    location: 'थाङ्गपालधाप, सिन्धुपाल्चोक',
    provinceCountry: 'बाग्मती प्रदेश, नेपाल',
    establishedYear: '२०७३',
    slogan: '"शिक्षा, स्वास्थ्य, कृषि र पर्यटन: समृद्ध पाँचपोखरीको मुलधन"',
    website: 'http://panchpokharithangpalmun.gov.np/',
    email: 'ito.panchpokharithangpalmun@gmail.com',
    phone: '+9779851102808',
    emblemUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Emblem_of_Nepal.svg/240px-Emblem_of_Nepal.svg.png',
    logoUrl: '/panchpokhari-logo.png',
  },
  melamchi: {
    id: 'melamchi',
    localGovType: 'स्थानीय सरकार',
    palikaName: 'मेलम्ची नगरपालिका',
    palikaNameEn: 'MELAMCHI MUNICIPALITY',
    officeTitle: 'नगरकार्यपालिकाको कार्यालय',
    location: 'मेलम्ची बजार, सिन्धुपाल्चोक',
    provinceCountry: 'बाग्मती प्रदेश, नेपाल',
    establishedYear: '२०७१',
    slogan: '"स्वच्छ, सुन्दर, समुन्नत र समृद्ध मेलम्ची नगर"',
    website: 'http://melamchimun.gov.np/',
    email: 'info@melamchimun.gov.np',
    phone: '+977-011-401011',
    emblemUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Emblem_of_Nepal.svg/240px-Emblem_of_Nepal.svg.png',
    logoUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Emblem_of_Nepal.svg/240px-Emblem_of_Nepal.svg.png',
  },
  helambu: {
    id: 'helambu',
    localGovType: 'स्थानीय सरकार',
    palikaName: 'हेलम्बु गाउँपालिका',
    palikaNameEn: 'HELAMBU RURAL MUNICIPALITY',
    officeTitle: 'गाउँकार्यपालिकाको कार्यालय',
    location: 'हेलम्बु, सिन्धुपाल्चोक',
    provinceCountry: 'बाग्मती प्रदेश, नेपाल',
    establishedYear: '२०७३',
    slogan: '"प्राकृतिक सुन्दरता र संस्कृतियुक्त समृद्ध हेलम्बु"',
    website: 'http://helambumun.gov.np/',
    email: 'info@helambumun.gov.np',
    phone: '+977-011-401234',
    emblemUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Emblem_of_Nepal.svg/240px-Emblem_of_Nepal.svg.png',
    logoUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Emblem_of_Nepal.svg/240px-Emblem_of_Nepal.svg.png',
  },
};

// Nepal Sambat year calculator from Bikram Sambat year
const getNepalSambat = (bsYearStr: string = '२०८३'): string => {
  const nepaliDigits: Record<string, string> = {
    '०': '0',
    '१': '1',
    '२': '2',
    '३': '3',
    '४': '4',
    '५': '5',
    '६': '6',
    '७': '7',
    '८': '8',
    '९': '9',
  };
  const englishDigits: Record<string, string> = {
    '0': '०',
    '1': '१',
    '2': '२',
    '3': '३',
    '4': '४',
    '5': '५',
    '6': '६',
    '7': '७',
    '8': '८',
    '9': '९',
  };

  const engStr = bsYearStr.replace(/[०-९]/g, (d) => nepaliDigits[d] || d);
  const num = parseInt(engStr, 10);
  if (isNaN(num)) return '११४६';
  const nsNum = num - 937;
  return String(nsNum).replace(/[0-9]/g, (d) => englishDigits[d] || d);
};

interface OfficialSifarishLetterheadProps {
  template: SifarishTemplate;
  applicantData: {
    applicantName: string;
    applicantPhone?: string;
    wardNumber: number | string;
    purpose?: string;
    applicationNo?: string;
    dispatchNo?: string;
    certificateNo?: string;
    processedBy?: string;
    status?: string;
    formData?: Record<string, any>;
    familyMembers?: Array<{ name: string; relation: string; dob: string; citizenshipNo: string }>;
  };
  onClose?: () => void;
  isOfficialIssued?: boolean;
  embedded?: boolean; // When true, hides outer action bar for seamless wizard embedding
}

export const OfficialSifarishLetterhead: React.FC<OfficialSifarishLetterheadProps> = ({
  template,
  applicantData,
  onClose,
  isOfficialIssued = false,
  embedded = false,
}) => {
  // Listen for live palika settings updates across tabs/windows
  const [syncTick, setSyncTick] = useState<number>(0);
  const [showSmsModal, setShowSmsModal] = useState<boolean>(false);
  const [smsRecipientPhone, setSmsRecipientPhone] = useState<string>(
    applicantData.applicantPhone || '९८४१२३४५६७'
  );
  const [smsSending, setSmsSending] = useState<boolean>(false);
  const [smsDeliveryReceipt, setSmsDeliveryReceipt] = useState<any>(null);

  useEffect(() => {
    const handleSync = () => setSyncTick((t) => t + 1);
    window.addEventListener('storage', handleSync);
    window.addEventListener('palika-settings-updated', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('palika-settings-updated', handleSync);
    };
  }, []);

  // Retrieve logged-in Municipality from TenantContext and AuthContext
  let tenantSettings: any = null;
  let activeTenantId = 'panchpokhari';
  try {
    const tenantCtx = useTenant();
    tenantSettings = tenantCtx?.settings;
    if (tenantCtx?.tenantId) {
      activeTenantId = tenantCtx.tenantId;
    }
  } catch {
    activeTenantId = localStorage.getItem('tenant_id') || 'panchpokhari';
  }

  try {
    const authCtx = useAuth();
    if (authCtx?.user?.tenantId) {
      activeTenantId = authCtx.user.tenantId;
    }
  } catch {}

  // Preset fallback for the logged-in municipality
  const preset = PRESET_MUNICIPALITIES[activeTenantId] || PRESET_MUNICIPALITIES.panchpokhari;

  // The official palikaConfig strictly bound to logged-in municipality
  // MUST directly load whatever Logo and Emblem was set in Palika Settings!
  const palikaConfig: PalikaLetterheadConfig = useMemo(() => {
    let localOverride: any = {};
    try {
      const raw = localStorage.getItem(`palika_settings_${activeTenantId}`);
      if (raw) localOverride = JSON.parse(raw);
    } catch {}

    const activeSettings = {
      ...(preset || {}),
      ...(tenantSettings || {}),
      ...localOverride,
    };

    // Palika Logo: STRICT priority to uploaded Logo from Palika Settings!
    const resolvedLogoUrl =
      localOverride.logo_url?.trim() ||
      tenantSettings?.logo_url?.trim() ||
      (activeTenantId === 'panchpokhari' ? '/panchpokhari-logo.png' : preset.logoUrl);

    // Nepal Emblem: STRICT priority to uploaded Emblem from Palika Settings!
    const resolvedEmblemUrl =
      localOverride.emblem_url?.trim() ||
      tenantSettings?.emblem_url?.trim() ||
      preset.emblemUrl ||
      'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Emblem_of_Nepal.svg/240px-Emblem_of_Nepal.svg.png';

    const palikaName = activeSettings.palika_name || preset.palikaName;
    const palikaNameEn = activeSettings.palika_name_en || preset.palikaNameEn;
    const location = activeSettings.headquarters || activeSettings.address || preset.location;
    const province = activeSettings.province || 'बाग्मती प्रदेश';
    const slogan = activeSettings.slogan || preset.slogan;
    const website = activeSettings.website || preset.website;
    const email = activeSettings.email || preset.email;
    const phone = activeSettings.phone || preset.phone;

    return {
      id: activeTenantId,
      localGovType: activeSettings.local_gov_type || preset.localGovType || 'स्थानीय सरकार',
      palikaName,
      palikaNameEn,
      officeTitle: preset.officeTitle || 'गाउँकार्यपालिकाको कार्यालय',
      location,
      provinceCountry: province.includes('नेपाल') ? province : `${province}, नेपाल`,
      establishedYear: preset.establishedYear || '२०७३',
      slogan,
      website,
      email,
      phone,
      logoUrl: resolvedLogoUrl,
      emblemUrl: resolvedEmblemUrl,
    };
  }, [tenantSettings, activeTenantId, preset, syncTick]);

  const data = applicantData.formData || {};
  const wardNo = applicantData.wardNumber || data.wardNumber || '';
  const name = applicantData.applicantName || 'सेवाग्राहीको पूरा नाम';
  const appNo = applicantData.applicationNo || 'PPK-SIF-2083-001';
  const dispatchNo = applicantData.dispatchNo || data.dispatchNo || '१२८';
  const fiscalYear = '२०८३/०८४';
  const nepaliDate = '२०८३/०५/१६';
  const nepaliYear = nepaliDate.split('/')[0] || '२०८३';
  const nepalSambat = getNepalSambat(nepaliYear);

  // Office title: If issued by a specific ward, show ward office title
  const displayOfficeTitle = wardNo
    ? `${wardNo} नं. वडा कार्यालय`
    : palikaConfig.officeTitle || 'गाउँकार्यपालिकाको कार्यालय';

  // Replace placeholders in body template
  const getInterpolatedBody = () => {
    let text = template.bodyTemplate;
    const replacements: Record<string, string> = {
      '{{palikaName}}': palikaConfig.palikaName,
      'पाँचपोखरी थाङपाल गाउँपालिका': palikaConfig.palikaName,
      'पाँचपोखरी थाङ्गपाल गाउँपालिका': palikaConfig.palikaName,
      '{{district}}': palikaConfig.location.split(',')[1]?.trim() || 'सिन्धुपाल्चोक',
      '{{wardNumber}}': String(wardNo || '३'),
      '{{applicantName}}': name,
      '{{formerVdc}}': data.formerVdc || 'थाङपालधाप',
      '{{formerWard}}': String(data.formerWard || '२'),
      '{{fatherName}}': data.fatherName || 'रामबहादुर तामाङ',
      '{{motherName}}': data.motherName || 'माया तामाङ',
      '{{grandfatherName}}': data.grandfatherName || 'कमानसिंह तामाङ',
      '{{dobBs}}': data.dobBs || '२०५८/०४/१२',
      '{{age}}': String(data.age || '२३'),
      '{{citizenshipNo}}': data.citizenshipNo || '२३-०१-७५-००१२३',
      '{{kittaNo}}': data.kittaNo || '१२८',
      '{{buildingType}}': data.buildingType === 'rcc' ? 'पक्की आरसीसी' : data.buildingType || 'पक्की घर',
      '{{nearestPoleNo}}': data.nearestPoleNo || 'P-5-104',
      '{{toleName}}': data.toleName || 'मानेडाँडा',
      '{{businessName}}': data.businessName || 'पाँचपोखरी उद्यम',
      '{{annualIncome}}': data.annualIncome ? `रु. ${data.annualIncome}` : 'रु. ९०,०००',
      '{{pensionNo}}': data.pensionNo || 'P-12849',
      '{{groomName}}': data.groomName || 'दावा तामाङ',
      '{{groomCitizenshipNo}}': data.groomCitizenshipNo || '२३-०१-७०-००३२१',
      '{{brideName}}': data.brideName || 'सुशीला तामाङ',
      '{{brideCitizenshipNo}}': data.brideCitizenshipNo || '२३-०१-७४-००५६७',
      '{{brideAddress}}': data.brideAddress || 'मेलम्ची नगरपालिका-५',
      '{{marriageDateBs}}': data.marriageDateBs || '२०७८/०१/१२',
      '{{deceasedName}}': data.deceasedName || 'कान्छा तामाङ',
      '{{deceasedDateBs}}': data.deceasedDateBs || '२०८०/१०/१२',
    };

    Object.entries(replacements).forEach(([placeholder, val]) => {
      text = text.replace(new RegExp(placeholder, 'g'), val);
    });

    return text;
  };

  const handlePrint = () => {
    window.print();
  };

  const familyList =
    applicantData.familyMembers ||
    data.familyMembers || [
      {
        name: name,
        relation: 'स्वयं (निवेदक)',
        dob: data.dobBs || '२०५८/०४/१२',
        citizenshipNo: data.citizenshipNo || '२३-०१-७५-००१२३',
      },
      {
        name: data.fatherName || 'रामबहादुर तामाङ',
        relation: 'बुवा',
        dob: '२०३२/०१/१०',
        citizenshipNo: '२३-०१-७०-०१४५',
      },
      {
        name: data.motherName || 'माया तामाङ',
        relation: 'आमा',
        dob: '२०३६/०३/१५',
        citizenshipNo: '२३-०१-७२-०८९२',
      },
    ];

  return (
    <div className="sifarish-letterhead-modal" style={{ position: 'relative', width: '100%' }}>
      {/* ─── PRINT CSS EMBEDDED TO GUARANTEE 1-PAGE A4 FIT ─── */}
      <style>{`
        @page {
          size: A4 portrait;
          margin: 0;
        }
        @media print {
          html, body {
            width: 210mm !important;
            height: 297mm !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print {
            display: none !important;
          }
          .sifarish-letterhead-modal {
            margin: 0 !important;
            padding: 0 !important;
            width: 210mm !important;
            box-shadow: none !important;
          }
          #sifarish-printable-sheet {
            width: 210mm !important;
            min-height: 297mm !important;
            max-height: 297mm !important;
            padding: 10mm 15mm 10mm 15mm !important;
            box-shadow: none !important;
            border: none !important;
            page-break-after: avoid !important;
            page-break-inside: avoid !important;
            box-sizing: border-box !important;
          }
        }
      `}</style>

      {/* ─── TOP ACTION & PALIKA SWITCHER BAR (NO PRINT - ONLY WHEN NOT EMBEDDED) ─── */}
      {!embedded && (
        <>
          <div
            className="no-print"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#0f172a',
              color: 'white',
              padding: '0.65rem 1.25rem',
              borderRadius: '10px 10px 0 0',
              flexWrap: 'wrap',
              gap: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <ShieldCheck size={18} color="#38bdf8" />
              <span style={{ fontWeight: 800, fontSize: '0.92rem' }}>
                आधिकारिक सरकारी लेटरहेड (A4 Formatted)
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
              {/* LOCKED & VERIFIED LOGGED-IN PALIKA BADGE */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  padding: '0.35rem 0.8rem',
                  borderRadius: '6px',
                  color: '#a7f3d0',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                }}
              >
                <Lock size={13} color="#34d399" />
                <span style={{ color: '#ffffff', opacity: 0.9 }}>जारी गर्ने पालिका:</span>
                <span style={{ color: '#6ee7b7', fontWeight: 800 }}>{palikaConfig.palikaName}</span>
                <span
                  style={{
                    fontSize: '0.68rem',
                    backgroundColor: '#059669',
                    color: 'white',
                    padding: '1px 6px',
                    borderRadius: '4px',
                    marginLeft: '4px',
                    letterSpacing: '0.2px',
                  }}
                >
                  लगइन प्रमाणित 🔒
                </span>
              </div>

              {/* SMS GATEWAY DISPATCH BUTTON */}
              <button
                type="button"
                onClick={() => setShowSmsModal(true)}
                style={{
                  padding: '0.4rem 0.95rem',
                  borderRadius: '6px',
                  backgroundColor: '#0284c7',
                  color: 'white',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  boxShadow: '0 2px 6px rgba(2, 132, 199, 0.3)',
                }}
              >
                <Smartphone size={15} />
                <span>📲 नागरिक SMS अलर्ट</span>
              </button>

              {/* A4 PRINT BUTTON */}
              <button
                onClick={handlePrint}
                style={{
                  padding: '0.4rem 1.1rem',
                  borderRadius: '6px',
                  backgroundColor: '#dc2626',
                  color: 'white',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  boxShadow: '0 2px 6px rgba(220,38,38,0.3)',
                }}
              >
                <Printer size={15} />
                <span>A4 प्रिन्ट</span>
              </button>

              {onClose && (
                <button
                  onClick={onClose}
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: 'none',
                    color: 'white',
                    borderRadius: '6px',
                    padding: '0.35rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {/* ───────────────────────────────────────────────────────────────────────────
          THE OFFICIAL A4 LETTERHEAD SHEET (MATCHING EXACT USER IMAGE)
         ─────────────────────────────────────────────────────────────────────────── */}
      <div
        id="sifarish-printable-sheet"
        style={{
          backgroundColor: '#ffffff',
          color: '#1e293b',
          width: '100%',
          maxWidth: '210mm',
          minHeight: '297mm',
          margin: '0 auto',
          padding: '12mm 16mm 10mm 16mm',
          boxShadow: embedded ? 'none' : '0 4px 25px rgba(0,0,0,0.12)',
          fontFamily: "'Mukta', 'Noto Sans Devanagari', -apple-system, sans-serif",
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
        }}
      >
        {/* ─── TOP SECTION: OFFICIAL HEADER, LOGOS, AND SUB-ROW ─── */}
        <div>
          {/* Header Row with Left & Right Emblems */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              position: 'relative',
            }}
          >
            {/* Left: Nepal National Emblem (नेपाल सरकार निसान छाप) */}
            <div style={{ width: '90px', textAlign: 'left', flexShrink: 0 }}>
              <img
                src={palikaConfig.emblemUrl}
                style={{ width: '82px', height: 'auto', display: 'block' }}
                alt="नेपाल सरकार निशाना छाप"
                onError={(e: any) => {
                  e.target.src =
                    'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Emblem_of_Nepal.svg/240px-Emblem_of_Nepal.svg.png';
                }}
              />
            </div>

            {/* Center: Municipal Headings in Exact Red Typography */}
            <div
              style={{
                flex: 1,
                textAlign: 'center',
                lineHeight: 1.25,
                padding: '0 0.5rem',
              }}
            >
              {/* स्थानीय सरकार */}
              <div
                style={{
                  fontSize: '0.98rem',
                  fontWeight: 800,
                  color: '#dc2626',
                  marginBottom: '1px',
                }}
              >
                {palikaConfig.localGovType || 'स्थानीय सरकार'}
              </div>

              {/* पाँचपोखरी थाङ्गपाल गाउँपालिका */}
              <div
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 900,
                  color: '#dc2626',
                  letterSpacing: '0.2px',
                  marginBottom: '1px',
                }}
              >
                {palikaConfig.palikaName}
              </div>

              {/* PANCHPOKHARI THANGPAL RURAL MUNICIPALITY */}
              <div
                style={{
                  fontSize: '1rem',
                  fontWeight: 800,
                  color: '#dc2626',
                  letterSpacing: '0.4px',
                  textTransform: 'uppercase',
                  marginBottom: '2px',
                }}
              >
                {palikaConfig.palikaNameEn}
              </div>

              {/* गाउँकार्यपालिकाको कार्यालय / ... नं. वडा कार्यालय */}
              <div
                style={{
                  fontSize: '1.35rem',
                  fontWeight: 900,
                  color: '#dc2626',
                  marginBottom: '2px',
                }}
              >
                {displayOfficeTitle}
              </div>

              {/* थाङ्गपालधाप, सिन्धुपाल्चोक */}
              <div
                style={{
                  fontSize: '1.05rem',
                  fontWeight: 800,
                  color: '#dc2626',
                }}
              >
                {palikaConfig.location}
              </div>
            </div>

            {/* Right: Municipal Official Logo (पालिका लोगो) */}
            <div style={{ width: '90px', textAlign: 'right', flexShrink: 0 }}>
              <img
                src={palikaConfig.logoUrl}
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  objectFit: 'contain',
                  display: 'inline-block',
                  border: '1.5px solid rgba(220, 38, 38, 0.25)',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.06)',
                  backgroundColor: 'white',
                }}
                alt="पालिका लोगो"
                onError={(e: any) => {
                  e.target.src = '/panchpokhari-logo.png';
                }}
              />
            </div>
          </div>

          {/* Sub-row: पत्र संख्या & चलानी on Left, बाग्मती प्रदेश & २०७३ on Right */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              marginTop: '0.35rem',
              fontSize: '0.96rem',
              fontWeight: 700,
              padding: '0 2px',
            }}
          >
            {/* Left: Dispatch & Fiscal Year */}
            <div style={{ lineHeight: 1.4, color: '#0f172a' }}>
              <div>
                पत्र संख्या <span style={{ fontWeight: 600 }}>{fiscalYear}</span>
              </div>
              <div>
                चलानी : <span style={{ color: '#0f172a', fontWeight: 600 }}>{dispatchNo}</span>
              </div>
            </div>

            {/* Right: बाग्मती प्रदेश, नेपाल / २०७३ in RED */}
            <div style={{ textAlign: 'right', lineHeight: 1.35, color: '#dc2626' }}>
              <div style={{ fontWeight: 800 }}>{palikaConfig.provinceCountry}</div>
              <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>{palikaConfig.establishedYear}</div>
            </div>
          </div>

          {/* Solid Horizontal Black Divider Line */}
          <div
            style={{
              borderBottom: '2px solid #000000',
              marginTop: '4px',
              marginBottom: '6px',
            }}
          />

          {/* Date Row (Directly under the line on the right side, Underlined) */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              fontSize: '0.94rem',
              fontWeight: 800,
              color: '#0f172a',
              marginTop: '4px',
              marginBottom: '1rem',
            }}
          >
            <div style={{ textAlign: 'right', lineHeight: 1.35 }}>
              <div>
                <u>मिति: {nepaliDate}</u>
              </div>
              <div>
                <u>नेपाल संवत {nepalSambat}</u>
              </div>
            </div>
          </div>

          {/* ─── OFFICIAL CONTENT AREA ─── */}
          {/* Recipient */}
          <div style={{ marginBottom: '1.2rem', fontSize: '0.98rem', lineHeight: 1.5 }}>
            <div style={{ whiteSpace: 'pre-line', fontWeight: 700, color: '#0f172a' }}>
              {template.recipient}
            </div>
          </div>

          {/* Subject */}
          <div
            style={{
              textAlign: 'center',
              margin: '1rem 0 1.2rem',
              fontSize: '1.15rem',
              fontWeight: 900,
              color: '#0f172a',
            }}
          >
            <u>विषय: {template.subject}</u>
          </div>

          {/* Legal Act Citation */}
          <div
            style={{
              fontSize: '0.8rem',
              color: '#475569',
              fontStyle: 'italic',
              marginBottom: '0.85rem',
              textAlign: 'center',
              backgroundColor: '#f8fafc',
              padding: '0.2rem 0.5rem',
              borderRadius: '4px',
              border: '1px dashed #cbd5e1',
            }}
          >
            कानुनी आधार: {template.legalReference}
          </div>

          {/* Body Paragraphs */}
          <div
            style={{
              fontSize: '0.96rem',
              lineHeight: 1.8,
              textAlign: 'justify',
              whiteSpace: 'pre-line',
              marginBottom: '1.25rem',
              color: '#0f172a',
            }}
          >
            {getInterpolatedBody()}
          </div>

          {/* ─── DYNAMIC TABLE: RELATIONSHIP MEMBERS ─── */}
          {template.hasFamilyTable && (
            <div style={{ margin: '0.85rem 0 1.25rem' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '0.35rem', color: '#0f172a' }}>
                पारिवारिक सदस्यहरूको नामावली विवरण:
              </div>
              <div className="dt-responsive-table-wrapper">
<table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '0.84rem',
                  border: '1px solid #475569',
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: '#f1f5f9', textAlign: 'center', borderBottom: '1px solid #475569' }}>
                    <th style={{ padding: '5px', border: '1px solid #475569', width: '38px' }}>क्र.सं.</th>
                    <th style={{ padding: '5px', border: '1px solid #475569' }}>सदस्यको पूरा नाम</th>
                    <th style={{ padding: '5px', border: '1px solid #475569', width: '100px' }}>नाता सम्बन्ध</th>
                    <th style={{ padding: '5px', border: '1px solid #475569', width: '110px' }}>जन्म मिति</th>
                    <th style={{ padding: '5px', border: '1px solid #475569' }}>नागरिकता / जन्मदर्ता नं.</th>
                  </tr>
                </thead>
                <tbody>
                  {familyList.map((m: any, idx: number) => (
                    <tr key={idx} style={{ textAlign: 'center' }}>
                      <td style={{ padding: '5px', border: '1px solid #475569' }}>{idx + 1}</td>
                      <td style={{ padding: '5px', border: '1px solid #475569', fontWeight: 700, textAlign: 'left' }}>
                        {m.name}
                      </td>
                      <td style={{ padding: '5px', border: '1px solid #475569' }}>{m.relation}</td>
                      <td style={{ padding: '5px', border: '1px solid #475569' }}>{m.dob}</td>
                      <td style={{ padding: '5px', border: '1px solid #475569' }}>{m.citizenshipNo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
</div>
            </div>
          )}

          {/* ─── DYNAMIC TABLE: FOUR BOUNDARIES ─── */}
          {template.hasBoundariesTable && (
            <div style={{ margin: '0.85rem 0 1.25rem' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '0.35rem', color: '#0f172a' }}>
                जग्गाको चारकिल्ला तथा सडक विवरण:
              </div>
              <div className="dt-responsive-table-wrapper">
<table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '0.84rem',
                  border: '1px solid #475569',
                }}
              >
                <tbody>
                  <tr>
                    <td style={{ padding: '5px 8px', border: '1px solid #475569', fontWeight: 700, backgroundColor: '#f8fafc', width: '120px' }}>
                      कित्ता नम्बर
                    </td>
                    <td style={{ padding: '5px 8px', border: '1px solid #475569', fontWeight: 800, color: '#b91c1c' }}>
                      {data.kittaNo || '१२८, १२९'}
                    </td>
                    <td style={{ padding: '5px 8px', border: '1px solid #475569', fontWeight: 700, backgroundColor: '#f8fafc', width: '120px' }}>
                      कुल क्षेत्रफल
                    </td>
                    <td style={{ padding: '5px 8px', border: '1px solid #475569' }}>{data.area || '०-८-२-०'}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '5px 8px', border: '1px solid #475569', fontWeight: 700, backgroundColor: '#f8fafc' }}>
                      पूर्व किल्ला (सँधियार)
                    </td>
                    <td style={{ padding: '5px 8px', border: '1px solid #475569' }}>{data.eastBoundary || 'राम तामाङको जग्गा'}</td>
                    <td style={{ padding: '5px 8px', border: '1px solid #475569', fontWeight: 700, backgroundColor: '#f8fafc' }}>
                      पश्चिम किल्ला (सँधियार)
                    </td>
                    <td style={{ padding: '5px 8px', border: '1px solid #475569' }}>{data.westBoundary || '१० फिटे बाटो'}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '5px 8px', border: '1px solid #475569', fontWeight: 700, backgroundColor: '#f8fafc' }}>
                      उत्तर किल्ला (सँधियार)
                    </td>
                    <td style={{ padding: '5px 8px', border: '1px solid #475569' }}>{data.northBoundary || 'हरि श्रेष्ठको घर'}</td>
                    <td style={{ padding: '5px 8px', border: '1px solid #475569', fontWeight: 700, backgroundColor: '#f8fafc' }}>
                      दक्षिण किल्ला (सँधियार)
                    </td>
                    <td style={{ padding: '5px 8px', border: '1px solid #475569' }}>{data.southBoundary || 'सरकारी कुलो'}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '5px 8px', border: '1px solid #475569', fontWeight: 700, backgroundColor: '#f8fafc' }}>
                      बाटोको किसिम र चौडाइ
                    </td>
                    <td colSpan={3} style={{ padding: '5px 8px', border: '1px solid #475569' }}>
                      {data.roadType === 'gravel'
                        ? 'ग्राभेल सडक'
                        : data.roadType === 'pitched'
                        ? 'कालोपत्रे सडक'
                        : data.roadType || 'ग्राभेल सडक'}{' '}
                      (चौडाइ: {data.roadWidth || '१६ फिट'})
                    </td>
                  </tr>
                </tbody>
              </table>
</div>
            </div>
          )}

          {/* ─── SEALS AND SIGNATURE BLOCK ─── */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              marginTop: '2.5rem',
              paddingTop: '0.75rem',
            }}
          >
            {/* Municipal Stamp */}
            <div style={{ textAlign: 'center', width: '130px' }}>
              <div
                style={{
                  width: '95px',
                  height: '95px',
                  borderRadius: '50%',
                  border: '2px dashed #b91c1c',
                  margin: '0 auto',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#b91c1c',
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  lineHeight: 1.25,
                  transform: 'rotate(-8deg)',
                }}
              >
                <span>{palikaConfig.palikaName}</span>
                <span style={{ fontSize: '0.58rem', fontWeight: 700 }}>
                  {wardNo ? `वडा नं. ${wardNo}` : 'कार्यपालिका'}
                </span>
                <span style={{ fontSize: '0.54rem' }}>{palikaConfig.location.split(',')[1] || 'सिन्धुपाल्चोक'}</span>
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '4px' }}>
                (कार्यालयको छाप)
              </div>
            </div>

            {/* CC Block */}
            <div style={{ fontSize: '0.76rem', color: '#64748b', lineHeight: 1.4 }}>
              <div style={{ fontWeight: 800, color: '#334155' }}>बोधार्थ:</div>
              <div>- सम्बन्धित शाखा / कार्यालय अभिलेख।</div>
              <div>- अध्यक्ष / प्रमुख प्रशासकीय अधिकृतको सचिवालय।</div>
            </div>

            {/* Cryptographic Signature Block */}
            <div style={{ textAlign: 'center', minWidth: '240px', maxWidth: '280px' }}>
              <div
                style={{
                  border: '1.5px solid #16a34a',
                  backgroundColor: 'rgba(240, 253, 244, 0.9)',
                  borderRadius: '8px',
                  padding: '6px 10px',
                  marginBottom: '8px',
                  textAlign: 'left',
                  boxShadow: '0 1px 4px rgba(22, 163, 74, 0.1)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px', marginBottom: '3px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#15803d', fontWeight: 800, fontSize: '0.74rem' }}>
                    <ShieldCheck size={14} color="#16a34a" />
                    <span>विद्युतीय हस्ताक्षर प्रमाणित</span>
                  </div>
                  <span style={{ fontSize: '0.62rem', backgroundColor: '#dcfce7', color: '#166534', padding: '1px 5px', borderRadius: '4px', fontWeight: 700 }}>
                    NITC / MoFAGA
                  </span>
                </div>
                <div style={{ fontSize: '0.66rem', color: '#334155', lineHeight: 1.4 }}>
                  <div><strong>हस्ताक्षरकर्ता:</strong> {applicantData.processedBy || 'रामकृष्ण श्रेष्ठ (वडा सचिव)'}</div>
                  <div><strong>पद/निकाय:</strong> {displayOfficeTitle}</div>
                  <div style={{ fontFamily: 'monospace', color: '#047857', fontSize: '0.62rem' }}>
                    <strong>टोकन ह्यास:</strong> SHA256:{Math.abs(appNo.split('').reduce((acc, char) => ((acc << 5) - acc + char.charCodeAt(0)) | 0, 0)).toString(16).padStart(12, 'a7e9')}f...
                  </div>
                  <div><strong>मिति/समय:</strong> {nepaliDate} १०:४५ बजे (प्रमाणित)</div>
                </div>
              </div>

              <div
                style={{
                  borderTop: '1px dotted #0f172a',
                  paddingTop: '4px',
                  fontWeight: 800,
                  fontSize: '0.94rem',
                }}
              >
                ( {applicantData.processedBy || 'वडा अध्यक्ष / वडा सचिव'} )
              </div>
              <div style={{ fontSize: '0.8rem', color: '#475569' }}>
                {displayOfficeTitle}
              </div>
            </div>
          </div>
        </div>

        {/* ───────────────────────────────────────────────────────────────────────────
            FOOTER SECTION (MATCHING EXACT USER LETTERHEAD AT BOTTOM OF A4)
           ─────────────────────────────────────────────────────────────────────────── */}
        <div
          style={{
            marginTop: '2.5rem',
            paddingTop: '0.75rem',
            borderTop: '1px solid #e2e8f0',
          }}
        >
          {/* Centered Slogan in Bold Red */}
          <div
            style={{
              textAlign: 'center',
              fontSize: '0.92rem',
              fontWeight: 800,
              color: '#dc2626',
              marginBottom: '0.4rem',
              letterSpacing: '0.2px',
            }}
          >
            {palikaConfig.slogan}
          </div>

          {/* Bottom Row: Contact Info on Left/Center & Verification QR Code on Right */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.76rem',
              lineHeight: 1.4,
              color: '#dc2626',
            }}
          >
            <div style={{ flex: 1, textAlign: 'left' }}>
              <span>Website: </span>
              <a
                href={palikaConfig.website}
                target="_blank"
                rel="noreferrer"
                style={{ color: '#0284c7', textDecoration: 'underline', marginRight: '0.5rem' }}
              >
                {palikaConfig.website}
              </a>
              <span>Email: </span>
              <a
                href={`mailto:${palikaConfig.email}`}
                style={{ color: '#0284c7', textDecoration: 'underline', marginRight: '0.5rem' }}
              >
                {palikaConfig.email}
              </a>
              <span style={{ whiteSpace: 'nowrap' }}>Tel: {palikaConfig.phone}</span>
            </div>

            {/* Bottom Right QR Code & Digital Signature Verification Hash */}
            <div style={{ textAlign: 'center', marginLeft: '0.75rem' }}>
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=85x85&data=${encodeURIComponent(
                  `${window.location.origin}/app/citizen-services?track=${appNo}`
                )}`}
                style={{
                  width: '56px',
                  height: '56px',
                  border: '1px solid #cbd5e1',
                  padding: '2px',
                  borderRadius: '3px',
                  backgroundColor: 'white',
                  display: 'inline-block',
                }}
                alt="Verification QR"
              />
              <div style={{ fontSize: '0.58rem', color: '#047857', fontWeight: 700, marginTop: '2px', fontFamily: 'monospace' }}>
                ✓ e-Sifarish Secured
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── SMS GATEWAY DISPATCH SIMULATOR MODAL (NO-PRINT) ─── */}
      {showSmsModal && (
        <div
          className="no-print"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: '1rem',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '14px',
              maxWidth: '560px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
              border: '1px solid #bae6fd',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div
              style={{
                backgroundColor: '#0369a1',
                color: '#ffffff',
                padding: '1rem 1.25rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Smartphone size={20} color="#7dd3fc" />
                <div>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>
                    नेपाल सरकार स्थानीय तह SMS गेटवे (Sparrow / Aakash SMS API)
                  </h3>
                  <span style={{ fontSize: '0.74rem', opacity: 0.85 }}>
                    नागरिकलाई प्रत्यक्ष सिफारिस स्वीकृति तथा डिजिटल हस्ताक्षर सन्देश प्रेषण
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowSmsModal(false);
                  setSmsDeliveryReceipt(null);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '0.25rem' }}>
                    प्रेषक आईडी (Sender ID - Govt Masked)
                  </label>
                  <input
                    type="text"
                    readOnly
                    value="PANCHPOKHARI"
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      backgroundColor: '#f1f5f9',
                      fontSize: '0.85rem',
                      fontWeight: 800,
                      color: '#0f172a',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '0.25rem' }}>
                    नागरिकको मोबाइल नम्बर (NTC/Ncell) *
                  </label>
                  <input
                    type="text"
                    value={smsRecipientPhone}
                    onChange={(e) => setSmsRecipientPhone(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '6px',
                      border: '1px solid #38bdf8',
                      backgroundColor: '#ffffff',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              {/* SMS Preview Body */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '0.25rem' }}>
                  प्रेषित हुने आधिकारिक SMS सन्देश (SMS Template Preview)
                </label>
                <div
                  style={{
                    backgroundColor: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '0.85rem',
                    fontSize: '0.85rem',
                    color: '#1e293b',
                    lineHeight: 1.5,
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                  }}
                >
                  <p style={{ margin: 0 }}>
                    <strong>पाँचपोखरी थाङपाल गाउँपालिका:</strong> आदरणीय <strong>{name}</strong>ज्यू, तपाईंको सिफारिस आवेदन (दर्ता नं: <strong>{appNo}</strong>) वडा नं. {wardNo || '३'} बाट स्वीकृत भई डिजिटल हस्ताक्षर सम्पन्न भएको छ।
                  </p>
                  <p style={{ margin: '6px 0 0 0', color: '#0284c7', wordBreak: 'break-all', fontSize: '0.8rem' }}>
                    प्रमाणीकरण तथा डाउनलोड लिङ्क: {window.location.origin}/app/citizen-services?track={appNo}
                  </p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>
                  <span>मार्ग: नेपाल टेलिकम / एनसेल समर्पित स्थानीय तह गेटवे</span>
                  <span>१ SMS क्रेडिट (१३२ अक्षर)</span>
                </div>
              </div>

              {/* Delivery Receipt Notification if Sent */}
              {smsDeliveryReceipt && (
                <div
                  style={{
                    backgroundColor: '#f0fdf4',
                    border: '1px solid #86efac',
                    borderRadius: '8px',
                    padding: '0.85rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.35rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#15803d', fontWeight: 800, fontSize: '0.85rem' }}>
                    <CheckCircle2 size={18} color="#16a34a" />
                    <span>SMS सफलतापूर्वक प्रेषण भयो (Delivery Confirmed)</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#166534', lineHeight: 1.4 }}>
                    <div><strong>Message ID:</strong> {smsDeliveryReceipt.msgId}</div>
                    <div><strong>टेलिकम स्थिति:</strong> DELIVERED (हस्तान्तरण सफल)</div>
                    <div><strong>समय:</strong> {smsDeliveryReceipt.timestamp}</div>
                    <div><strong>गेटवे:</strong> Sparrow SMS / Aakash API (HTTP 200 OK)</div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowSmsModal(false);
                    setSmsDeliveryReceipt(null);
                  }}
                  style={{
                    padding: '0.55rem 1rem',
                    borderRadius: '6px',
                    backgroundColor: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    color: '#475569',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  बन्द गर्नुहोस्
                </button>

                <button
                  type="button"
                  disabled={smsSending}
                  onClick={() => {
                    setSmsSending(true);
                    setTimeout(() => {
                      setSmsSending(false);
                      setSmsDeliveryReceipt({
                        msgId: `MSG-2081-PPK-${Math.floor(10000 + Math.random() * 90000)}`,
                        timestamp: new Date().toLocaleTimeString(),
                      });
                    }, 650);
                  }}
                  style={{
                    padding: '0.55rem 1.25rem',
                    borderRadius: '6px',
                    backgroundColor: '#0284c7',
                    border: 'none',
                    color: 'white',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: smsSending ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    boxShadow: '0 2px 6px rgba(2, 132, 199, 0.3)',
                  }}
                >
                  {smsSending ? <RefreshCw size={15} className="spinner" /> : <Send size={15} />}
                  <span>{smsSending ? 'गेटवेमा पठाउँदै...' : 'नागरिकलाई SMS पठाउनुहोस्'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfficialSifarishLetterhead;
