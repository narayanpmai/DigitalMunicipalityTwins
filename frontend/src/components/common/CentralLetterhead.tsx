import React, { useMemo, useState, useEffect } from 'react';
import { useTenant } from '../../context/TenantContext';
import { Printer, X, ZoomIn, ZoomOut, RotateCcw, Download, CheckCircle2 } from 'lucide-react';
import { toNepaliDigits, toEnglishDigits, bsToAd, adToBs } from '../../utils/nepaliCalendar';
import QRCode from 'qrcode';
import './CentralLetterhead.css';

export interface LetterheadConfigProps {
  palikaName?: string;
  palikaNameEn?: string;
  localGovType?: string;
  officeTitle?: string;
  location?: string;
  address?: string;
  provinceCountry?: string;
  establishedYear?: string;
  activeFiscalYear?: string;
  patraSankhya?: string;
  chalaniNo?: string;
  slogan?: string;
  website?: string;
  email?: string;
  phone?: string;
  logoUrl?: string;
  emblemUrl?: string;
  primaryColor?: string;
  alignment?: 'center' | 'left';
  fontFamily?: string;
  showNepalSambat?: boolean;
  showFooterQr?: boolean;
  dateBs?: string;
  dateAd?: string;
  dateLabel?: string;
  branchTitle?: string;
  branchPlacement?: 'left' | 'below-title';
  documentTitle?: string;
  lang?: 'np' | 'en';
}

// Nepal Sambat year calculator from Bikram Sambat year (e.g. २०८३ -> ११४७)
export const computeNepalSambat = (bsYearStr: string = '२०८३'): string => {
  const nepaliDigits: Record<string, string> = {
    '०': '0', '१': '1', '२': '2', '३': '3', '४': '4',
    '५': '5', '६': '6', '७': '7', '८': '8', '९': '9',
  };
  const engDigits: Record<string, string> = {
    '0': '०', '1': '१', '2': '२', '3': '३', '4': '४',
    '5': '५', '6': '६', '7': '७', '8': '८', '9': '९',
  };

  const western = bsYearStr.replace(/[०-९]/g, (d) => nepaliDigits[d] || d);
  const match = western.match(/\d{4}/);
  if (!match) return 'नेपाल संवत ११४७';
  const bsYear = parseInt(match[0], 10);
  const nsYear = bsYear - 936;
  const nsStr = String(nsYear).replace(/[0-9]/g, (d) => engDigits[d] || d);
  return `नेपाल संवत ${nsStr}`;
};

// Universal helper to print a DOM element cleanly without blank pages (Supports A4 and A5)
export const printElement = (elementId: string, pageSize: 'A4' | 'A5' = 'A4') => {
  const element = document.getElementById(elementId);
  if (!element) {
    window.print();
    return;
  }

  const isA5 = pageSize === 'A5' || element.classList.contains('page-a5');

  // Inject a temporary print-focused iframe to completely isolate print CSS and guarantee no blank pages
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const pri = iframe.contentWindow || (iframe as any).contentDocument;
  const doc = iframe.contentDocument || (iframe.contentWindow ? iframe.contentWindow.document : null);

  if (!doc || !pri) {
    window.print();
    return;
  }

  // Collect all stylesheets from the current document
  let stylesHtml = '';
  document.querySelectorAll('link[rel="stylesheet"], style').forEach((node) => {
    stylesHtml += node.outerHTML;
  });

  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html lang="ne">
      <head>
        <meta charset="utf-8" />
        <title>प्रिन्ट दस्तावेज (${isA5 ? 'A5' : 'A4'} Print Document)</title>
        ${stylesHtml}
        <style>
          @page {
            size: ${isA5 ? 'A5 portrait' : 'A4 portrait'};
            margin: ${isA5 ? '5mm 6mm' : '8mm 10mm'};
          }
          body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #000000 !important;
            font-family: 'Mukta', 'Noto Sans Devanagari', -apple-system, BlinkMacSystemFont, sans-serif !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .central-doc-sheet, #printable-admit-card, #modal-preview-admit-card, #printable-receipt {
            box-shadow: none !important;
            border: none !important;
            width: 100% !important;
            max-width: ${isA5 ? '148mm' : '210mm'} !important;
            margin: 0 auto !important;
            padding: ${isA5 ? '3mm 5mm' : '6mm 10mm'} !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .no-print, button, .rec-btn {
            display: none !important;
          }
        </style>
      </head>
      <body>
        ${element.outerHTML}
      </body>
    </html>
  `);
  doc.close();

  setTimeout(() => {
    try {
      pri.focus();
      pri.print();
    } catch (e) {
      console.warn('Iframe print error, falling back to window.print():', e);
      window.print();
    } finally {
      setTimeout(() => {
        try {
          document.body.removeChild(iframe);
        } catch {}
      }, 2000);
    }
  }, 350);
};

// ─── HOOK: EXTRACT CENTRALIZED LETTERHEAD CONFIG ───
export const useLetterheadConfig = (overrides?: Partial<LetterheadConfigProps>) => {
  const { settings } = useTenant();

  return useMemo(() => {
    const s = settings || {};
    return {
      palikaName: overrides?.palikaName || s.palika_name || 'पाँचपोखरी थाङपाल गाउँपालिका',
      palikaNameEn: overrides?.palikaNameEn || s.palika_name_en || 'PANCHPOKHARI THANGPAL RURAL MUNICIPALITY',
      localGovType: overrides?.localGovType || s.local_gov_type || 'स्थानीय सरकार',
      officeTitle: overrides?.officeTitle || s.office_title || 'गाउँकार्यपालिकाको कार्यालय',
      location: overrides?.location || s.location || s.headquarters || 'थाङ्पालधाप, सिन्धुपाल्चोक',
      address: overrides?.address || s.address || 'गाउँ कार्यपालिकाको कार्यालय, थाङ्पालधाप, सिन्धुपाल्चोक',
      provinceCountry: overrides?.provinceCountry || s.province_country || 'वाग्मती प्रदेश, नेपाल',
      establishedYear: overrides?.establishedYear || s.established_year || '२०७३',
      activeFiscalYear: overrides?.activeFiscalYear || s.active_fiscal_year || '२०८३/०८४',
      patraSankhya: overrides?.patraSankhya || s.active_fiscal_year || '२०८३/०८४',
      chalaniNo: overrides?.chalaniNo !== undefined ? overrides.chalaniNo : (s.chalani_no || ''),
      slogan: overrides?.slogan || s.slogan || '“शिक्षा, स्वास्थ्य, कृषि र पर्यटन: समृद्ध पाँचपोखरीको मूलधन”',
      website: overrides?.website || s.website || 'http://panchpokharithangpalmun.gov.np/',
      email: overrides?.email || s.email || 'ito.panchpokharithangpalmun@gmail.com',
      phone: overrides?.phone || s.phone || '+9779851109808',
      logoUrl: overrides?.logoUrl || s.logo_url || '/panchpokhari-logo.png',
      emblemUrl: overrides?.emblemUrl || s.emblem_url || '/emblem-of-nepal.png',
      primaryColor: overrides?.primaryColor || s.letterhead_primary_color || '#dc2626',
      alignment: overrides?.alignment || (s.letterhead_alignment as any) || 'center',
      fontFamily: overrides?.fontFamily || s.letterhead_font_family || 'Mukta',
      showNepalSambat: overrides?.showNepalSambat !== undefined ? overrides.showNepalSambat : (s.letterhead_show_nepal_sambat !== 'false'),
      showFooterQr: overrides?.showFooterQr !== undefined ? overrides.showFooterQr : (s.letterhead_show_qr !== 'false'),
      dateBs: overrides?.dateBs || (() => {
        try {
          const today = new Date().toISOString().split('T')[0];
          const bs = adToBs(today);
          return bs ? toNepaliDigits(bs.replace(/-/g, '/')) : '२०८३/०८/११';
        } catch {
          return '२०८३/०८/११';
        }
      })(),
      dateAd: overrides?.dateAd || new Date().toISOString().split('T')[0],
      dateLabel: overrides?.dateLabel || '',
      branchTitle: overrides?.branchTitle || '',
      branchPlacement: overrides?.branchPlacement || 'left',
      documentTitle: overrides?.documentTitle || '',
      lang: overrides?.lang || 'np',
    };
  }, [settings, overrides]);
};

// ─── COMPONENT 1: CENTRAL LETTERHEAD HEADER ───
export const CentralLetterheadHeader: React.FC<LetterheadConfigProps> = (props) => {
  const config = useLetterheadConfig(props);
  const color = config.primaryColor;
  const nepalSambat = computeNepalSambat(config.activeFiscalYear);

  return (
    <div className="central-lh-header">
      {/* Top Row: Nepal Emblem (Left), Titles (Center), Palika Logo (Right) */}
      <div className="central-lh-top-row">
        {/* Left: Government Emblem */}
        <div className="central-lh-emblem-left">
          <img
            src={config.emblemUrl}
            alt="नेपालको निशाना छाप"
            className="central-lh-emblem-img"
            onError={(e: any) => {
              e.currentTarget.src = '/emblem-of-nepal.png';
            }}
          />
        </div>

        {/* Center: Municipal Headings in Exact Red Typography */}
        <div className="central-lh-titles-center" style={{ textAlign: config.alignment }}>
          <div className="central-lh-local-gov" style={{ color }}>
            {config.localGovType}
          </div>
          <div className="central-lh-palika-name-np" style={{ color }}>
            {config.palikaName}
          </div>
          <div className="central-lh-palika-name-en" style={{ color }}>
            {config.palikaNameEn}
          </div>
          <div className="central-lh-office-title" style={{ color }}>
            {config.officeTitle}
          </div>
          <div className="central-lh-location" style={{ color }}>
            {config.location}
          </div>
        </div>

        {/* Right: Palika Logo */}
        <div className="central-lh-logo-right">
          <img
            src={config.logoUrl}
            alt="गाउँपालिकाको लोगो"
            className="central-lh-logo-img"
            onError={(e: any) => {
              e.currentTarget.src = '/panchpokhari-logo.png';
            }}
          />
        </div>
      </div>

      {/* Sub Row: पत्र संख्या & चलानी (Left), प्रदेश & स्थापना वर्ष (Right) */}
      <div className="central-lh-sub-row">
        <div className="central-lh-sub-left">
          <div>
            पत्र संख्या : <span style={{ fontWeight: 600 }}>{config.patraSankhya || config.activeFiscalYear}</span>
          </div>
          <div>
            चलानी : <span style={{ fontWeight: 600 }}>{config.chalaniNo || ''}</span>
          </div>
        </div>

        <div className="central-lh-sub-right">
          <div>{config.provinceCountry}</div>
          <div>{config.establishedYear}</div>
        </div>
      </div>

      {/* Solid Black Horizontal Divider */}
      <div className="central-lh-divider" />

      {/* Date & Nepal Sambat Row */}
      <div className="central-lh-date-row">
        <div className="central-lh-date-left">
          {config.branchTitle && config.branchPlacement === 'left' && (
            <span style={{ fontWeight: 700, color: '#1e3a8a' }}>{config.branchTitle}</span>
          )}
        </div>
        <div className="central-lh-date-right">
          <div>
            {config.dateLabel ? <span style={{ fontWeight: 700 }}>{config.dateLabel}: </span> : 'मिति: '}
            <span style={{ fontWeight: 800 }}>{config.dateBs}</span>
            {config.dateAd && <span style={{ fontSize: '0.8rem', color: '#64748b', marginLeft: '4px' }}>({config.dateAd})</span>}
          </div>
          {config.showNepalSambat && (
            <div style={{ fontSize: '0.82rem', color: '#334155', fontWeight: 600 }}>
              {nepalSambat}
            </div>
          )}
        </div>
      </div>

      {/* Optional Document Ribbon/Badge and Centered Committee/Branch Title */}
      {config.documentTitle && (
        <div style={{ textAlign: 'center', width: '100%', margin: '0.2rem auto 0.45rem auto' }}>
          <div className="central-lh-ribbon">{config.documentTitle}</div>
          {config.branchTitle && config.branchPlacement === 'below-title' && (
            <div className="central-lh-branch-center">
              {config.branchTitle}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── COMPONENT 2: CENTRAL LETTERHEAD FOOTER (CENTERED WITH CLIENT QR) ───
export const CentralLetterheadFooter: React.FC<LetterheadConfigProps> = (props) => {
  const config = useLetterheadConfig(props);
  const color = config.primaryColor;
  const [footerQrDataUrl, setFooterQrDataUrl] = useState<string>('');

  useEffect(() => {
    if (config.showFooterQr) {
      const qrData = `Website: ${config.website}\nEmail: ${config.email}\nTel: ${config.phone}`;
      QRCode.toDataURL(qrData, {
        width: 140,
        margin: 1,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      })
        .then((url) => setFooterQrDataUrl(url))
        .catch((err) => console.error('Footer QR generation error:', err));
    }
  }, [config.showFooterQr, config.website, config.email, config.phone]);

  return (
    <div className="central-doc-footer">
      <div className="central-lh-footer-container">
        {/* Left balance spacer so center content is perfectly centered across width */}
        <div className="central-lh-footer-spacer" />

        {/* Center content: Slogan in Bold Red + Centered Contact Info */}
        <div className="central-lh-footer-center">
          <div className="central-lh-slogan" style={{ color }}>
            {config.slogan}
          </div>
          <div className="central-lh-contact-info">
            <span style={{ color, fontWeight: 700 }}>Website: </span>
            <a href={config.website} target="_blank" rel="noopener noreferrer">
              {config.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
            </a>
            <span className="central-lh-sep">|</span>
            <span style={{ color, fontWeight: 700 }}>Email: </span>
            <a href={`mailto:${config.email}`}>{config.email}</a>
            <span className="central-lh-sep">|</span>
            <span style={{ color, fontWeight: 700 }}>Tel: </span>
            <span style={{ color: '#0f172a', fontWeight: 700 }}>{config.phone}</span>
          </div>
        </div>

        {/* Right: Client-generated Dynamic Contact QR */}
        {config.showFooterQr && (
          <div className="central-lh-qr-box" title={`Website: ${config.website}\nEmail: ${config.email}\nTel: ${config.phone}`}>
            {footerQrDataUrl ? (
              <img src={footerQrDataUrl} alt="Contact QR" />
            ) : (
              <div style={{ fontSize: '0.55rem', color: '#94a3b8' }}>QR</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── COMPONENT 3: CENTRAL DOCUMENT SHEET (A4 / A5 WRAPPER) ───
export interface CentralDocumentSheetProps extends LetterheadConfigProps {
  id?: string;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
  showWatermark?: boolean;
  embedded?: boolean;
  paperSize?: 'A4' | 'A5';
}

export const CentralDocumentSheet: React.FC<CentralDocumentSheetProps> = ({
  id = 'central-printable-document',
  className = '',
  style,
  children,
  showHeader = true,
  showFooter = true,
  showWatermark = true,
  embedded = false,
  paperSize = 'A4',
  ...headerProps
}) => {
  const config = useLetterheadConfig(headerProps);
  const isA5 = paperSize === 'A5' || className.includes('page-a5');

  return (
    <div
      id={id}
      className={`central-doc-sheet ${isA5 ? 'page-a5' : ''} ${embedded ? 'embedded' : ''} ${className}`}
      style={{
        fontFamily: config.fontFamily === 'Noto Sans Devanagari' ? "'Noto Sans Devanagari', sans-serif" : "'Mukta', sans-serif",
        ...style,
      }}
    >
      {/* Watermark in Center */}
      {showWatermark && (
        <div className="central-doc-watermark">
          <img
            src={config.logoUrl}
            alt="Watermark"
            onError={(e: any) => {
              e.currentTarget.src = '/panchpokhari-logo.png';
            }}
          />
        </div>
      )}

      {/* Official Header */}
      {showHeader && <CentralLetterheadHeader {...headerProps} />}

      {/* Body Content */}
      <div className="central-doc-body">{children}</div>

      {/* Official Footer */}
      {showFooter && <CentralLetterheadFooter {...headerProps} />}
    </div>
  );
};

// ─── COMPONENT 4: CENTRAL PRINT PREVIEW MODAL ───
export interface CentralPrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  targetElementId?: string;
  children: React.ReactNode;
  onPrint?: () => void;
  paperFormat?: 'A4' | 'A5';
}

export const CentralPrintPreviewModal: React.FC<CentralPrintPreviewModalProps> = ({
  isOpen,
  onClose,
  title = 'दस्तावेज प्रिन्ट पूर्वावलोकन (Print Preview)',
  targetElementId,
  children,
  onPrint,
  paperFormat = 'A4',
}) => {
  const [zoom, setZoom] = useState<number>(0.95);

  if (!isOpen) return null;

  const isA5 = paperFormat === 'A5' || (title && title.includes('A5'));

  const handlePrintClick = () => {
    if (onPrint) {
      onPrint();
    } else if (targetElementId) {
      printElement(targetElementId, isA5 ? 'A5' : 'A4');
    } else {
      window.print();
    }
  };

  return (
    <div className="central-print-modal-overlay" onClick={onClose}>
      <div className="central-print-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="central-print-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Printer size={20} color="#38bdf8" />
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>{title}</h3>
            <span
              style={{
                fontSize: '0.72rem',
                background: isA5 ? '#16a34a' : '#0369a1',
                color: '#ffffff',
                padding: '0.15rem 0.5rem',
                borderRadius: '4px',
                fontWeight: 700,
              }}
            >
              {isA5 ? 'A5 PORTRAIT' : 'A4 PORTRAIT'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {/* Zoom Controls */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: '#334155',
                borderRadius: '8px',
                padding: '2px 6px',
                gap: '4px',
              }}
            >
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(0.6, z - 0.1))}
                style={{ background: 'transparent', border: 'none', color: '#e2e8f0', cursor: 'pointer', padding: '4px' }}
                title="Zoom Out"
              >
                <ZoomOut size={16} />
              </button>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f8fafc', minWidth: '40px', textAlign: 'center' }}>
                {Math.round(zoom * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(1.4, z + 0.1))}
                style={{ background: 'transparent', border: 'none', color: '#e2e8f0', cursor: 'pointer', padding: '4px' }}
                title="Zoom In"
              >
                <ZoomIn size={16} />
              </button>
              <button
                type="button"
                onClick={() => setZoom(0.95)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
                title="Reset Zoom"
              >
                <RotateCcw size={14} />
              </button>
            </div>

            {/* Print Action Button */}
            <button
              type="button"
              onClick={handlePrintClick}
              style={{
                background: '#059669',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '0.45rem 1rem',
                fontWeight: 800,
                fontSize: '0.82rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                cursor: 'pointer',
              }}
            >
              <Printer size={16} />
              प्रिन्ट गर्नुहोस् (Print)
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '4px',
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="central-print-modal-body">
          <div
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: 'top center',
              transition: 'transform 0.15s ease',
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
