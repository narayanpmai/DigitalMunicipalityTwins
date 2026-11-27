import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import QRCode from 'qrcode';
import {
  X,
  Printer,
  QrCode,
  Download,
  Building,
  Calendar,
  DollarSign,
  Phone,
  Users,
  ShieldCheck,
  CheckCircle,
  Eye,
  Layers,
  MapPin,
  AlertTriangle,
} from 'lucide-react';
import type { Project } from '../../../types/sectoral';
import { useTenant } from '../../../context/TenantContext';
import { municipalityApi } from '../../../api/municipality';
import { representativesApi } from '../../../api/representatives';

export interface ProjectHoardingBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
}

const toNepaliNum = (num: number | string): string => {
  const nepaliDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  return String(num).replace(/\d/g, (d) => nepaliDigits[parseInt(d, 10)]);
};

export const ProjectHoardingBoardModal: React.FC<ProjectHoardingBoardModalProps> = ({
  isOpen,
  onClose,
  project,
}) => {
  let tenantSettings: any = null;
  try {
    const tenantCtx = useTenant();
    tenantSettings = tenantCtx?.settings;
  } catch {}

  const [orientation, setOrientation] = useState<'landscape' | 'portrait'>('landscape');
  const [boardTheme, setBoardTheme] = useState<'blue' | 'green' | 'bw'>('blue');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [tollFreeNumber, setTollFreeNumber] = useState<string>('०११-४०००५० / ९८५११०२८३७');
  const [customContactEmail, setCustomContactEmail] = useState<string>('info@panchpokharimun.gov.np');

  const { data: palikaProfile } = useQuery({
    queryKey: ['municipality-profile'],
    queryFn: () => municipalityApi.getProfile(),
    staleTime: 60000,
    enabled: isOpen,
  });

  const { data: representatives = [] } = useQuery<any[]>({
    queryKey: ['representatives-roster'],
    queryFn: () => representativesApi.getAll({ isCurrent: true }),
    staleTime: 60000,
    enabled: isOpen,
  });

  // Generate QR Code
  useEffect(() => {
    if (!isOpen || !project) return;
    const projectUrl = `https://digitaltwin.smartptrm.com/public-report.html?code=${project.projectCode}`;
    const qrPayload = `पाँचपोखरी थाङपाल गाउँपालिका\nआयोजना: ${project.name}\nकोड: ${project.projectCode}\nस्वीकृत लागत: रु. ${project.officeCost || project.budget || 0}\nसम्झौता मिति: ${project.agreementDateBs || '-'}\nवेब लिङ्क: ${projectUrl}`;

    QRCode.toDataURL(qrPayload, {
      width: 220,
      margin: 1,
      color: {
        dark: boardTheme === 'bw' ? '#000000' : '#0f2744',
        light: '#ffffff',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('QR code generation failed', err));
  }, [isOpen, project, boardTheme]);

  if (!isOpen || !project) return null;

  const pCost = Number(project.officeCost || project.budget || 0);
  const cCost = Number(project.committeeCost || 0);
  const totalCost = pCost + cCost;
  const maintAmt = Math.round(totalCost * 0.03);
  const contAmt = Math.round(totalCost * 0.03);

  const wardChair = representatives.find(
    (r) => Number(r.wardNo) === Number(project.wardNumber) && String(r.designation || '').includes('अध्यक्ष'),
  );

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `QR_${project.projectCode || 'project'}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Color theme definitions
  const themeStyles = {
    blue: {
      outerBorder: '#034694',
      headerBg: 'linear-gradient(135deg, #022b5c 0%, #034694 100%)',
      headerText: '#ffffff',
      accentColor: '#034694',
      badgeBg: '#e0f2fe',
      badgeText: '#0369a1',
      boxBg: '#f8fafc',
      boxBorder: '#cbd5e1',
      warningBg: '#fffbeb',
      warningBorder: '#fcd34d',
      warningText: '#92400e',
      footerBg: '#0f172a',
      footerText: '#ffffff',
    },
    green: {
      outerBorder: '#065f46',
      headerBg: 'linear-gradient(135deg, #064e3b 0%, #047857 100%)',
      headerText: '#ffffff',
      accentColor: '#047857',
      badgeBg: '#d1fae5',
      badgeText: '#065f46',
      boxBg: '#f0fdf4',
      boxBorder: '#a7f3d0',
      warningBg: '#fffbeb',
      warningBorder: '#fcd34d',
      warningText: '#92400e',
      footerBg: '#064e3b',
      footerText: '#ffffff',
    },
    bw: {
      outerBorder: '#000000',
      headerBg: '#000000',
      headerText: '#ffffff',
      accentColor: '#000000',
      badgeBg: '#f1f5f9',
      badgeText: '#0f172a',
      boxBg: '#ffffff',
      boxBorder: '#000000',
      warningBg: '#ffffff',
      warningBorder: '#000000',
      warningText: '#000000',
      footerBg: '#000000',
      footerText: '#ffffff',
    },
  }[boardTheme];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(5px)',
        WebkitBackdropFilter: 'blur(5px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: orientation === 'landscape' ? '1120px' : '880px',
          maxHeight: '94vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          overflow: 'hidden',
          border: '1px solid #cbd5e1',
          margin: 'auto',
        }}
      >
        {/* Top Control Bar (Screen only, hidden on print) */}
        <div
          className="print:hidden"
          style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            color: '#ffffff',
            padding: '1rem 1.5rem',
            borderBottom: '1px solid #334155',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: '#0284c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
              }}
            >
              <QrCode size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: '#38bdf8' }}>
                नागरिक सूचना पाटी (Project Hoarding Board) अटो-जेनेरेटर
              </h2>
              <p style={{ fontSize: '0.78rem', color: '#cbd5e1', margin: '2px 0 0 0' }}>
                {project.name} | कोड: {project.projectCode} | वडा नं. {toNepaliNum(project.wardNumber)}
              </p>
            </div>
          </div>

          {/* Options & Action Buttons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.6rem' }}>
            {/* Orientation */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', backgroundColor: '#334155', padding: '3px 6px', borderRadius: '6px', fontSize: '0.75rem' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.72rem' }}>ढाँचा:</span>
              <button
                type="button"
                onClick={() => setOrientation('landscape')}
                style={{
                  padding: '3px 8px',
                  borderRadius: '4px',
                  border: 'none',
                  backgroundColor: orientation === 'landscape' ? '#0284c7' : 'transparent',
                  color: '#ffffff',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '0.72rem',
                }}
              >
                ल्याण्डस्केप (४:३)
              </button>
              <button
                type="button"
                onClick={() => setOrientation('portrait')}
                style={{
                  padding: '3px 8px',
                  borderRadius: '4px',
                  border: 'none',
                  backgroundColor: orientation === 'portrait' ? '#0284c7' : 'transparent',
                  color: '#ffffff',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '0.72rem',
                }}
              >
                पोर्ट्रेट (A3/A4)
              </button>
            </div>

            {/* Theme Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', backgroundColor: '#334155', padding: '3px 6px', borderRadius: '6px', fontSize: '0.75rem' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.72rem' }}>रङ:</span>
              <button
                type="button"
                onClick={() => setBoardTheme('blue')}
                style={{
                  padding: '3px 6px',
                  borderRadius: '4px',
                  border: 'none',
                  backgroundColor: boardTheme === 'blue' ? '#034694' : 'transparent',
                  color: '#ffffff',
                  cursor: 'pointer',
                  fontSize: '0.72rem',
                }}
              >
                निलो
              </button>
              <button
                type="button"
                onClick={() => setBoardTheme('green')}
                style={{
                  padding: '3px 6px',
                  borderRadius: '4px',
                  border: 'none',
                  backgroundColor: boardTheme === 'green' ? '#047857' : 'transparent',
                  color: '#ffffff',
                  cursor: 'pointer',
                  fontSize: '0.72rem',
                }}
              >
                हरियो
              </button>
              <button
                type="button"
                onClick={() => setBoardTheme('bw')}
                style={{
                  padding: '3px 6px',
                  borderRadius: '4px',
                  border: 'none',
                  backgroundColor: boardTheme === 'bw' ? '#000000' : 'transparent',
                  color: '#ffffff',
                  cursor: 'pointer',
                  fontSize: '0.72rem',
                }}
              >
                B/W
              </button>
            </div>

            {/* QR Download */}
            <button
              type="button"
              onClick={handleDownloadQr}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.45rem 0.75rem',
                backgroundColor: '#0f766e',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
              title="QR कोड छुट्टै डाउनलोड गर्नुहोस्"
            >
              <Download size={14} />
              <span>QR छवि</span>
            </button>

            {/* Print Button */}
            <button
              type="button"
              onClick={handlePrint}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 0.9rem',
                backgroundColor: '#0284c7',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              }}
            >
              <Printer size={15} />
              <span>सूचना पाटी प्रिन्ट / PDF</span>
            </button>

            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '0.4rem',
                borderRadius: '6px',
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Quick Grievance Bar (Screen only) */}
        <div
          className="print:hidden"
          style={{
            backgroundColor: '#f1f5f9',
            padding: '0.5rem 1.5rem',
            borderBottom: '1px solid #cbd5e1',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            fontSize: '0.75rem',
            color: '#475569',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontWeight: 600 }}>गुनासो / हटलाइन नं.:</span>
            <input
              type="text"
              value={tollFreeNumber}
              onChange={(e) => setTollFreeNumber(e.target.value)}
              style={{
                padding: '2px 6px',
                borderRadius: '4px',
                border: '1px solid #cbd5e1',
                fontSize: '0.75rem',
                width: '170px',
                backgroundColor: '#ffffff',
              }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontWeight: 600 }}>आधिकारिक इमेल:</span>
            <input
              type="text"
              value={customContactEmail}
              onChange={(e) => setCustomContactEmail(e.target.value)}
              style={{
                padding: '2px 6px',
                borderRadius: '4px',
                border: '1px solid #cbd5e1',
                fontSize: '0.75rem',
                width: '210px',
                backgroundColor: '#ffffff',
              }}
            />
          </div>
          <div style={{ fontSize: '0.72rem', color: '#0369a1', fontWeight: 600 }}>
            ℹ️ कार्यस्थलमा अनिवार्य रूपमा कम्तीमा ४x३ फिट वा ६x४ फिट साइजको फ्लेक्स/बोर्डमा टाँस्नुपर्नेछ।
          </div>
        </div>

        {/* Printable Hoarding Board Sheet */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1.5rem',
            backgroundColor: '#f8fafc',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          {/* Main Board Container */}
          <div
            id="hoarding-board-printable"
            style={{
              backgroundColor: '#ffffff',
              width: '100%',
              maxWidth: orientation === 'landscape' ? '1040px' : '780px',
              border: `6px solid ${themeStyles.outerBorder}`,
              borderRadius: '8px',
              boxShadow: '0 10px 25px -5px rgba(0,0,0,0.15)',
              overflow: 'hidden',
              fontFamily: '"Mukta", "Kalimati", "Kokila", sans-serif',
              color: '#0f172a',
            }}
          >
            {/* Header with Emblems & Municipality Identification */}
            <div
              style={{
                background: themeStyles.headerBg,
                color: themeStyles.headerText,
                padding: '1.25rem 1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: `4px solid ${boardTheme === 'bw' ? '#000000' : '#eab308'}`,
                textAlign: 'center',
              }}
            >
              {/* Nepal Emblem */}
              <div style={{ width: '75px', display: 'flex', justifyContent: 'center' }}>
                <img
                  src={tenantSettings?.emblem_url || "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Emblem_of_Nepal.svg/240px-Emblem_of_Nepal.svg.png"}
                  alt="Nepal Emblem"
                  style={{ width: '65px', height: '65px', objectFit: 'contain' }}
                />
              </div>

              {/* Title Prose */}
              <div style={{ flex: 1, padding: '0 1rem' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fef08a', letterSpacing: '0.5px' }}>
                  स्थानीय सरकार सञ्चालन ऐन, २०७४ तथा सुशासन (व्यवस्थापन तथा सञ्चालन) ऐन, २०६४ बमोजिम
                </div>
                <h1 style={{ fontSize: '1.65rem', fontWeight: 900, margin: '2px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {tenantSettings?.palika_name || 'पाँचपोखरी थाङपाल गाउँपालिका'}
                </h1>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, opacity: 0.95 }}>
                  {tenantSettings?.office_title || 'गाउँ कार्यपालिकाको कार्यालय'}
                </h2>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, opacity: 0.85, marginTop: '2px' }}>
                  {tenantSettings?.headquarters || 'थाङपालधाप, सिन्धुपाल्चोक'}, {tenantSettings?.province || 'बागमती प्रदेश'}, नेपाल
                </div>
                <div
                  style={{
                    display: 'inline-block',
                    backgroundColor: '#eab308',
                    color: '#0f172a',
                    fontWeight: 900,
                    fontSize: '1rem',
                    padding: '3px 18px',
                    borderRadius: '20px',
                    marginTop: '8px',
                    letterSpacing: '1px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  }}
                >
                  📢 नागरिक सूचना पाटी (Project Information Board)
                </div>
              </div>

              {/* Municipality Logo & FY */}
              <div style={{ width: '75px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <img
                  src={tenantSettings?.logo_url || '/panchpokhari-logo.png'}
                  alt="Palika Logo"
                  style={{
                    width: '65px',
                    height: '65px',
                    objectFit: 'contain',
                    backgroundColor: '#ffffff',
                    borderRadius: '50%',
                    padding: '2px',
                  }}
                  onError={(e: any) => {
                    e.target.src = '/panchpokhari-logo.png';
                  }}
                />
                <span style={{ fontSize: '0.7rem', color: '#fef08a', fontWeight: 700, marginTop: '4px' }}>
                  आ.व. {toNepaliNum(project.fiscalYear || '')}
                </span>
              </div>
            </div>

            {/* Project Name Banner */}
            <div
              style={{
                backgroundColor: themeStyles.badgeBg,
                borderBottom: `2px solid ${themeStyles.boxBorder}`,
                padding: '0.85rem 1.5rem',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.75rem',
              }}
            >
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  आयोजनाको नाम:
                </span>
                <div style={{ fontSize: '1.35rem', fontWeight: 900, color: themeStyles.outerBorder, lineHeight: 1.25 }}>
                  {project.name}
                </div>
                {project.subProjectName && (
                  <div style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>
                    ({project.subProjectName})
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
                <span style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700 }}>
                  आयोजना कोड: <strong>{project.projectCode}</strong>
                </span>
                {project.budgetSubHead && (
                  <span style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700 }}>
                    बजेट उप-शीर्षक: <strong>{toNepaliNum(project.budgetSubHead)}</strong>
                  </span>
                )}
                <span style={{ backgroundColor: themeStyles.accentColor, color: '#ffffff', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700 }}>
                  वडा नं. {toNepaliNum(project.wardNumber)}
                </span>
              </div>
            </div>

            {/* Core Details Grid */}
            <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Section 1: Financial & Cost Sharing Breakdown */}
              <div
                style={{
                  border: `2px solid ${themeStyles.outerBorder}`,
                  borderRadius: '8px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    backgroundColor: themeStyles.accentColor,
                    color: '#ffffff',
                    padding: '0.45rem 1rem',
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <DollarSign size={16} />
                  <span>१. लागत तथा वित्तीय साझेदारी विवरण (Financial & Cost Sharing Breakdown)</span>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
                    backgroundColor: '#ffffff',
                    divideX: '1px solid #e2e8f0',
                  }}
                >
                  <div style={{ padding: '0.75rem 1rem', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>गाउँपालिका कार्यालयबाट विनियोजित रकम:</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0369a1', marginTop: '2px' }}>
                      रु. {toNepaliNum(pCost.toLocaleString('en-IN', { minimumFractionDigits: 2 }))}
                    </div>
                    <small style={{ fontSize: '0.68rem', color: '#64748b' }}>स्रोत: {project.budgetSource || 'आन्तरिक/समानीकरण'}</small>
                  </div>

                  <div style={{ padding: '0.75rem 1rem', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>उपभोक्ता समिति / समुदाय लागत:</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f766e', marginTop: '2px' }}>
                      रु. {toNepaliNum(cCost.toLocaleString('en-IN', { minimumFractionDigits: 2 }))}
                    </div>
                    <small style={{ fontSize: '0.68rem', color: '#64748b' }}>
                      {project.laborContribution ? `श्रमदान: ${project.laborContribution}` : 'जनसहभागिता नगद/श्रमदान'}
                    </small>
                  </div>

                  <div style={{ padding: '0.75rem 1rem', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f0fdf4' }}>
                    <div style={{ fontSize: '0.72rem', color: '#166534', fontWeight: 700 }}>कुल सम्झौता रकम (Total Cost):</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#15803d', marginTop: '2px' }}>
                      रु. {toNepaliNum(totalCost.toLocaleString('en-IN', { minimumFractionDigits: 2 }))}
                    </div>
                    <small style={{ fontSize: '0.68rem', color: '#166534' }}>कार्यालय + समुदाय साझेदारी</small>
                  </div>

                  <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>नियमानुसार कट्टी कोषहरू (३% + ३%):</div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginTop: '4px' }}>
                      • मर्मत सम्भार कोष (३%): <strong>रु. {toNepaliNum(maintAmt.toLocaleString('en-IN'))}</strong><br />
                      • कन्टिन्जेन्सी कट्टी (३%): <strong>रु. {toNepaliNum(contAmt.toLocaleString('en-IN'))}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Timelines & Implementation Metadata */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: orientation === 'landscape' ? '1fr 1fr' : '1fr',
                  gap: '1rem',
                }}
              >
                {/* 2A: Timelines & Scope */}
                <div style={{ border: `1.5px solid ${themeStyles.boxBorder}`, borderRadius: '8px', overflow: 'hidden' }}>
                  <div style={{ backgroundColor: themeStyles.boxBg, padding: '0.4rem 0.8rem', borderBottom: `1px solid ${themeStyles.boxBorder}`, fontWeight: 800, fontSize: '0.85rem', color: themeStyles.accentColor, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Calendar size={15} />
                    <span>२. कार्य तालिका तथा कार्यान्वयन विवरण</span>
                  </div>
                  <div style={{ padding: '0.75rem 1rem', fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                    <div><strong>योजना सम्झौता मिति:</strong> वि.सं. {toNepaliNum(project.agreementDateBs || 'उपलब्ध छैन')}</div>
                    <div><strong>कार्य सुरु भएको मिति:</strong> वि.सं. {toNepaliNum(project.startDateBs || 'उपलब्ध छैन')}</div>
                    <div><strong>कार्य सम्पन्न गर्नुपर्ने मिति:</strong> <span style={{ color: '#b91c1c', fontWeight: 800 }}>वि.सं. {toNepaliNum(project.completionDateBs || 'उपलब्ध छैन')}</span></div>
                    <div><strong>कार्यान्वयन विधि / मार्फत:</strong> {project.marfat || 'उपभोक्ता समिति'}</div>
                    <div><strong>आयोजना स्थल:</strong> {project.location || `वडा नं. ${toNepaliNum(project.wardNumber)}`}, पाँचपोखरी थाङपाल</div>
                    {project.objective && (
                      <div><strong>लक्ष्य / परिणाम:</strong> {project.objective}</div>
                    )}
                  </div>
                </div>

                {/* 2B: Committee & Key Contacts */}
                <div style={{ border: `1.5px solid ${themeStyles.boxBorder}`, borderRadius: '8px', overflow: 'hidden' }}>
                  <div style={{ backgroundColor: themeStyles.boxBg, padding: '0.4rem 0.8rem', borderBottom: `1px solid ${themeStyles.boxBorder}`, fontWeight: 800, fontSize: '0.85rem', color: themeStyles.accentColor, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Users size={15} />
                    <span>३. उपभोक्ता समिति तथा जिम्मेवार पदाधिकारीहरू</span>
                  </div>
                  <div style={{ padding: '0.75rem 1rem', fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                    <div>
                      <strong>समितिको नाम:</strong> {project.committeeName || `${project.name} उपभोक्ता समिति`}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                      <div>
                        <strong>अध्यक्ष:</strong> {project.committeeChair || '-'}
                        {project.committeePhone && <span style={{ display: 'block', fontSize: '0.72rem', color: '#64748b' }}>📞 {toNepaliNum(project.committeePhone)}</span>}
                      </div>
                      <div>
                        <strong>सचिव:</strong> {project.committeeSecretary || '-'}
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                      <div>
                        <strong>कोषाध्यक्ष:</strong> {project.committeeTreasurer || '-'}
                      </div>
                      <div>
                        <strong>अनुगमन संयोजक:</strong> {wardChair?.name ? `${wardChair.name} (वडा अध्यक्ष)` : 'वडा अनुगमन समिति'}
                      </div>
                    </div>
                    <div>
                      <strong>जिम्मेवार प्राविधिक:</strong> {project.responsibleEngineer || 'पूर्वाधार तथा प्राविधिक शाखा'}
                    </div>
                    {project.beneficiaryHouseholds && (
                      <div style={{ fontSize: '0.75rem', color: '#0f766e', fontWeight: 600 }}>
                        👥 लाभान्वित: {toNepaliNum(project.beneficiaryHouseholds)} घरधुरी (महिला: {toNepaliNum(project.beneficiaryFemale || '-')}, पुरुष: {toNepaliNum(project.beneficiaryMale || '-')})
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Section 3: Bottom Citizen Accountability Banner with QR Code */}
              <div
                style={{
                  backgroundColor: themeStyles.warningBg,
                  border: `2px dashed ${themeStyles.warningBorder}`,
                  borderRadius: '8px',
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1.25rem',
                }}
              >
                {/* Left: Grievance & Legal Notice */}
                <div style={{ flex: 1, minWidth: '280px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: themeStyles.warningText, fontWeight: 800, fontSize: '0.95rem', marginBottom: '0.4rem' }}>
                    <AlertTriangle size={18} />
                    <span>सार्वजनिक गुनासो, अनुगमन तथा पारदर्शिता सूचना:</span>
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.78rem', color: '#78350f', lineHeight: 1.5 }}>
                    <li>यस योजनामा कुनै अनियमितता, ढिलासुस्ती वा गुणस्तरहीन कार्य भएमा तुरुन्त गाउँपालिकामा उजुरी दिनुहोला।</li>
                    <li>
                      <strong>हटलाइन / टोल फ्री नं.:</strong> {toNepaliNum(tollFreeNumber)} | <strong>इमेल:</strong> {customContactEmail}
                    </li>
                    <li>दोस्रो किस्ता निकासा अघि र कार्य सम्पन्न भएपछि सार्वजनिक स्थलमा <strong>सामाजिक परीक्षण (Social Audit)</strong> अनिवार्य सम्पन्न गर्नुपर्नेछ।</li>
                    <li>योजना सम्बन्धी सम्पूर्ण बिल-भरपाई र प्राविधिक नापी किताब जोसुकै नागरिकले अध्ययन गर्न पाउनेछन्।</li>
                  </ul>
                </div>

                {/* Right: QR Code Box */}
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    border: '2px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '0.5rem 0.75rem',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
                  }}
                >
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt="Project Transparency QR"
                      style={{ width: '100px', height: '100px', objectFit: 'contain' }}
                    />
                  ) : (
                    <div style={{ width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <QrCode size={40} color="#94a3b8" />
                    </div>
                  )}
                  <span style={{ fontSize: '0.68rem', fontWeight: 800, color: themeStyles.accentColor, marginTop: '2px' }}>
                    📱 स्क्यान गरी विवरण हेर्नुहोस्
                  </span>
                  <span style={{ fontSize: '0.6rem', color: '#64748b' }}>
                    डिजिटल ट्विन पारदर्शिता प्रणाली
                  </span>
                </div>
              </div>

              {/* Bottom Copyright & Footer Line */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.68rem',
                  color: '#64748b',
                  borderTop: '1px solid #cbd5e1',
                  paddingTop: '0.5rem',
                }}
              >
                <span>पाँचपोखरी थाङपाल गाउँपालिका - डिजिटल योजना व्यवस्थापन प्रणाली</span>
                <span>प्रमाणीकरण कोड: <strong>{project.projectCode}</strong> | सूचना पाटी स्थलगत प्रमाणीकरण मिति: {project.agreementDateBs || '-'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
