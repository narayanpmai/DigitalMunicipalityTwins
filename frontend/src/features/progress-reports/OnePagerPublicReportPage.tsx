import React, { useState } from 'react';
import {
  Printer,
  Share2,
  Download,
  ExternalLink,
  MapPin,
  CheckCircle2,
  Users,
  Home,
  Zap,
  Droplets,
  Wifi,
  DollarSign,
  TrendingUp,
  Star,
  Layers,
  ArrowUpRight,
  Sparkles,
  Phone,
  Mail,
  Globe,
    Filter,
  Calendar,
} from 'lucide-react';
import { useTenant } from '../../context/TenantContext';

export type ReportDurationType = '10_year' | '5_year' | '1_year';

export const DURATION_REPORT_CONFIGS: Record<
  ReportDurationType,
  {
    title: string;
    badgeYear: string;
    badgeDesc: string;
    kpiBudget: string;
    kpiCompletedProjects: string;
    tableTitle: string;
    tableColStart: string;
    tableColEnd: string;
    tableColChange: string;
    sectorTitle: string;
    tableRows: Array<{
      name: string;
      b: string;
      c: string;
      diff: string;
    }>;
    financialBars: Array<{
      fy: string;
      val: number;
      pct: number;
    }>;
    financialSummaryText: string;
    financialSpentText: string;
  }
> = {
  '10_year': {
    title: '१० वर्षे प्रगति प्रतिवेदन',
    badgeYear: '२०७४-२०८४ (१० वर्षे)',
    badgeDesc: 'डाटा, प्रविधि र पारदर्शितामार्फत समृद्ध गाउँपालिका',
    kpiBudget: 'रु. १.६२ अर्ब',
    kpiCompletedProjects: '१,२८४',
    tableTitle: '१० वर्षको समग्र प्रगति (२०७४-२०८४)',
    tableColStart: '२०७४ (आधार)',
    tableColEnd: '२०८४ (हाल)',
    tableColChange: 'वृद्धि / सुधार',
    sectorTitle: 'क्षेत्रगत प्रगति (१० वर्षमा)',
    tableRows: [
      { name: 'सडक पहुँच', b: '३५%', c: '८५%', diff: '+५०%' },
      { name: 'खानेपानी पहुँच', b: '५०%', c: '९०%', diff: '+४०%' },
      { name: 'इन्टरनेट पहुँच', b: '१०%', c: '७५%', diff: '+६५%' },
      { name: 'विद्युतीकरण', b: '६०%', c: '९५%', diff: '+३५%' },
      { name: 'स्वास्थ्य पहुँच', b: '४५%', c: '८५%', diff: '+४०%' },
      { name: 'विद्यालय भर्नादर', b: '७२%', c: '९६%', diff: '+२४%' },
      { name: 'कृषि उत्पादन', b: '-', c: '+६४%', diff: '+६४%' },
      { name: 'पर्यटक संख्या', b: '१,२५०', c: '१२,४५०', diff: '+८९६%' },
      { name: 'डिजिटल सेवा', b: '२ सेवा', c: '३२ सेवा', diff: '+१५००%' },
      { name: 'नागरिक सन्तुष्टि', b: '५४%', c: '८४%', diff: '+३०%' },
    ],
    financialBars: [
      { fy: '२०७४/७५', val: 1850, pct: 28 },
      { fy: '२०७५/७६', val: 2150, pct: 33 },
      { fy: '२०७६/७७', val: 2480, pct: 38 },
      { fy: '२०७७/७८', val: 2950, pct: 45 },
      { fy: '२०७८/७९', val: 3420, pct: 52 },
      { fy: '२०७९/८०', val: 3980, pct: 61 },
      { fy: '२०८०/८१', val: 4650, pct: 71 },
      { fy: '२०८१/८२', val: 5220, pct: 80 },
      { fy: '२०८२/८३', val: 5980, pct: 90 },
      { fy: '२०८३/८४', val: 6500, pct: 100 },
    ],
    financialSummaryText: 'कुल १० वर्ष बजेट: रु. ३९.५४ अर्ब',
    financialSpentText: 'कुल खर्च: रु. ३१.९५ अर्ब (बजेट उपयोग: ८०.६७%)',
  },
  '5_year': {
    title: '५ वर्षे प्रगति प्रतिवेदन',
    badgeYear: '२०७९-२०८४ (५ वर्षे आवधिक)',
    badgeDesc: '५ वर्षे आवधिक योजना: दिगो विकास र समृद्धिको यात्रा',
    kpiBudget: 'रु. ८२.४० करोड',
    kpiCompletedProjects: '६८५',
    tableTitle: '५ वर्षको आवधिक प्रगति (२०७९-२०८४)',
    tableColStart: '२०७९ (सुरुवात)',
    tableColEnd: '२०८४ (हाल)',
    tableColChange: '५ वर्षे वृद्धि',
    sectorTitle: 'क्षेत्रगत प्रगति (५ वर्षमा)',
    tableRows: [
      { name: 'सडक पहुँच', b: '६५%', c: '८५%', diff: '+२०%' },
      { name: 'खानेपानी पहुँच', b: '७२%', c: '९०%', diff: '+१८%' },
      { name: 'इन्टरनेट पहुँच', b: '४५%', c: '७५%', diff: '+३०%' },
      { name: 'विद्युतीकरण', b: '८२%', c: '९५%', diff: '+१३%' },
      { name: 'स्वास्थ्य पहुँच', b: '६८%', c: '८५%', diff: '+१७%' },
      { name: 'विद्यालय भर्नादर', b: '८८%', c: '९६%', diff: '+८%' },
      { name: 'कृषि उत्पादन', b: '४२%', c: '६४%', diff: '+२२%' },
      { name: 'पर्यटक संख्या', b: '५,४००', c: '१२,४५०', diff: '+१३०%' },
      { name: 'डिजिटल सेवा', b: '१२ सेवा', c: '३२ सेवा', diff: '+१६६%' },
      { name: 'नागरिक सन्तुष्टि', b: '७१%', c: '८४%', diff: '+१३%' },
    ],
    financialBars: [
      { fy: '२०७९/८०', val: 3980, pct: 61 },
      { fy: '२०८०/८१', val: 4650, pct: 71 },
      { fy: '२०८१/८२', val: 5220, pct: 80 },
      { fy: '२०८२/८३', val: 5980, pct: 90 },
      { fy: '२०८३/८४', val: 6500, pct: 100 },
    ],
    financialSummaryText: 'कुल ५ वर्ष बजेट: रु. २६.३३ अर्ब',
    financialSpentText: 'कुल खर्च: रु. २२.२४ अर्ब (बजेट उपयोग: ८४.४६%)',
  },
  '1_year': {
    title: 'एक वर्षे प्रगति प्रतिवेदन',
    badgeYear: '२०८०-२०८१ (वार्षिक प्रतिवेदन)',
    badgeDesc: 'आर्थिक वर्ष २०८०/०८१ को वार्षिक विकास र सुशासन उपलब्धि',
    kpiBudget: 'रु. ६५.०० करोड',
    kpiCompletedProjects: '१४२',
    tableTitle: 'वार्षिक लक्ष्य र प्रगति (आ.व. २०८०/०८१)',
    tableColStart: 'वार्षिक लक्ष्य',
    tableColEnd: 'प्रगति (सम्पन्न)',
    tableColChange: 'प्रगति %',
    sectorTitle: 'क्षेत्रगत प्रगति (चालु आ.व.)',
    tableRows: [
      { name: 'कालोपत्रे सडक', b: '२५ कि.मि.', c: '२२.५ कि.मि.', diff: '९०%' },
      { name: 'खानेपानी धारा', b: '४५० धारा', c: '४१२ धारा', diff: '९१.५%' },
      { name: 'इन्टरनेट विस्तार', b: '१५ संस्था', c: '१५ संस्था', diff: '१००%' },
      { name: 'कृषि अनुदान वितरण', b: '५०० किसान', c: '४८२ किसान', diff: '९६.४%' },
      { name: 'विद्यालय ICT Lab', b: '६ वटा', c: '६ वटा', diff: '१००%' },
      { name: 'स्वास्थ्य शिविर', b: '१२ पटक', c: '१४ पटक', diff: '११६.६%' },
      { name: 'पर्यटकीय पदमार्ग', b: '१८ कि.मि.', c: '१६ कि.मि.', diff: '८८.८%' },
      { name: 'महिला उद्यम तालिम', b: '२५० जना', c: '२६५ जना', diff: '१०६%' },
      { name: 'वृक्षारोपण', b: '२०,०००', c: '२२,०००', diff: '११०%' },
      { name: 'राजस्व संकलन', b: 'रु. ३.२ करोड', c: 'रु. ३.४५ करोड', diff: '१०७.८%' },
    ],
    financialBars: [
      { fy: 'प्रथम चौमासिक', val: 1120, pct: 45 },
      { fy: 'दोस्रो चौमासिक', val: 1850, pct: 62 },
      { fy: 'तेस्रो चौमासिक', val: 2980, pct: 78 },
      { fy: 'चौथो चौमासिक', val: 4650, pct: 95 },
    ],
    financialSummaryText: 'वार्षिक कुल बजेट: रु. ६५.०० करोड',
    financialSpentText: 'वार्षिक कुल खर्च: रु. ५५.५१ करोड (खर्च प्रगति: ८५.४०%)',
  },
};

export const OnePagerPublicReportPage: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const { settings: tenantSettings } = useTenant();
  const palikaName = tenantSettings?.palika_name || 'पाँचपोखरी थाङपाल गाउँपालिका';
  const logoUrl = tenantSettings?.logo_url || 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Emblem_of_Nepal.svg/240px-Emblem_of_Nepal.svg.png';
  const province = tenantSettings?.province || 'बागमती प्रदेश';
  const district = tenantSettings?.district || 'सिन्धुपाल्चोक';
  const address = tenantSettings?.address || 'गाउँ कार्यपालिकाको कार्यालय, सिन्धुपाल्चोक, बागमती प्रदेश';
  const phone = tenantSettings?.phone || '०११-३०१२७';
  const email = tenantSettings?.email || 'info@municipality.gov.np';
  const website = tenantSettings?.website || 'www.municipality.gov.np';
  const [reportDuration, setReportDuration] = useState<ReportDurationType>(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get('type') as ReportDurationType;
    return ['10_year', '5_year', '1_year'].includes(t) ? t : '10_year';
  });

  const config = DURATION_REPORT_CONFIGS[reportDuration];

  const handleDurationChange = (type: ReportDurationType) => {
    setReportDuration(type);
    const url = new URL(window.location.href);
    url.searchParams.set('type', type);
    window.history.replaceState({}, '', url.toString());
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      style={{
        backgroundColor: '#e2e8f0',
        minHeight: '100vh',
        padding: '1.5rem 1rem 3rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        fontFamily: '"Noto Sans Devanagari", Inter, sans-serif',
      }}
    >
      {/* Top Floating Public Header Toolbar (Hidden when printing) */}
      <div
        className="no-print"
        style={{
          width: '100%',
          backgroundColor: '#0F4C81',
          color: '#ffffff',
          borderRadius: '12px',
          padding: '0.75rem 1.5rem',
          marginBottom: '1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.75rem', backgroundColor: '#10B981', color: '#ffffff', padding: '0.2rem 0.6rem', borderRadius: '20px', fontWeight: 800 }}>
            सार्वजनिक खुला प्रतिवेदन (Public Access)
          </span>
          <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>
            {palikaName} — {config.title} One Pager
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <a
            href="/index.html"
            style={{
              padding: '0.45rem 0.9rem',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.3)',
              backgroundColor: 'rgba(255,255,255,0.15)',
              color: '#ffffff',
              fontSize: '0.8rem',
              fontWeight: 700,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'background 0.2s',
            }}
          >
            <Globe size={14} />
            <span>नागरिक पोर्टल (गृहपृष्ठ)</span>
          </a>

          <button
            onClick={handleCopyLink}
            style={{
              padding: '0.45rem 0.9rem',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.3)',
              backgroundColor: 'rgba(255,255,255,0.1)',
              color: '#ffffff',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <Share2 size={14} />
            <span>{copied ? 'लिङ्क कपी भयो!' : 'लिङ्क सेयर गर्नुहोस्'}</span>
          </button>

          <button
            onClick={handlePrint}
            style={{
              padding: '0.45rem 1.1rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#E65100',
              color: '#ffffff',
              fontSize: '0.85rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              boxShadow: '0 2px 8px rgba(230,81,0,0.4)',
            }}
          >
            <Printer size={16} />
            <span>प्रिन्ट / PDF सेभ गर्नुहोस्</span>
          </button>

          {/* ── DROPDOWN FILTER: १ वर्षे, ५ वर्षे र १० वर्षे प्रगति प्रतिवेदन ── */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              backgroundColor: 'rgba(255,255,255,0.18)',
              padding: '0.25rem 0.6rem',
              borderRadius: '8px',
              border: '2px solid #FCD34D',
              boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
            }}
          >
            <Filter size={15} style={{ color: '#FCD34D' }} />
            <label
              htmlFor="reportDurationSelect"
              style={{
                fontSize: '0.78rem',
                fontWeight: 800,
                color: '#FCD34D',
                whiteSpace: 'nowrap',
                cursor: 'pointer',
              }}
            >
              प्रतिवेदन शिर्षक Filter:
            </label>
            <select
              id="reportDurationSelect"
              value={reportDuration}
              onChange={(e) => handleDurationChange(e.target.value as ReportDurationType)}
              style={{
                backgroundColor: '#ffffff',
                color: '#0F4C81',
                fontWeight: 900,
                fontSize: '0.85rem',
                padding: '0.35rem 0.75rem',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                outline: 'none',
                boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
              }}
            >
              <option value="10_year">१० वर्षे प्रगति प्रतिवेदन (२०७४–२०८४)</option>
              <option value="5_year">५ वर्षे प्रगति प्रतिवेदन (२०७९–२०८४)</option>
              <option value="1_year">एक वर्षे प्रगति प्रतिवेदन (२०८०–२०८१)</option>
            </select>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* THE OFFICIAL ONE PAGER POSTER (EXACT MATCH OF PHOTO)                 */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <div
        id="one-pager-poster"
        style={{
          width: '100%',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 10px 40px rgba(0,0,0,0.18)',
          border: '2px solid #0F4C81',
          display: 'flex',
          flexDirection: 'column',
          color: '#1e293b',
          fontSize: '0.85rem',
        }}
      >
        {/* ── TOP BANNER HEADER ───────────────────────────────────────────── */}
        <div
          style={{
            position: 'relative',
            backgroundImage: 'linear-gradient(rgba(10, 42, 84, 0.88), rgba(15, 76, 129, 0.94)), url("https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1600")',
            backgroundSize: 'cover',
            backgroundPosition: 'center 30%',
            color: '#ffffff',
            padding: '1.25rem 2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '4px solid #E65100',
          }}
        >
          {/* Top Left: Palika Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <img
              src={logoUrl}
              alt={palikaName}
              style={{ width: '85px', height: '85px', objectFit: 'contain', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}
              onError={(e) => {
                e.currentTarget.src = 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Emblem_of_Nepal.svg/300px-Emblem_of_Nepal.svg.png';
              }}
            />
          </div>

          {/* Center: Main Title & Badges */}
          <div style={{ textAlign: 'center', flex: 1, padding: '0 1rem' }}>
            <h1
              style={{
                fontSize: '2.5rem',
                fontWeight: 900,
                letterSpacing: '0.02em',
                margin: 0,
                color: '#ffffff',
                textShadow: '0 3px 10px rgba(0,0,0,0.5)',
              }}
            >
              {config.title}
            </h1>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', margin: '0.4rem 0' }}>
              <span
                style={{
                  backgroundColor: '#0F766E',
                  color: '#ffffff',
                  padding: '0.25rem 1.25rem',
                  borderRadius: '25px',
                  fontWeight: 800,
                  fontSize: '1rem',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                }}
              >
                {config.badgeYear}
              </span>

              <span
                style={{
                  backgroundColor: '#B91C1C',
                  color: '#ffffff',
                  padding: '0.25rem 1.5rem',
                  borderRadius: '25px',
                  fontWeight: 900,
                  fontSize: '1.05rem',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                }}
              >
                {palikaName}
              </span>
            </div>

            <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#E0F2FE', letterSpacing: '0.03em' }}>
              {config.badgeDesc}
            </div>
          </div>

          {/* Top Right: Citizen QR Code Box */}
          <div
            style={{
              backgroundColor: '#0A2540',
              border: '2px solid rgba(255,255,255,0.4)',
              borderRadius: '12px',
              padding: '0.5rem 0.75rem',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            }}
          >
            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#FCD34D' }}>नागरिकलाई जानकारी</div>
            <div style={{ fontSize: '0.6rem', color: '#E2E8F0', marginBottom: '0.25rem' }}>
              QR Code स्क्यान गरी डिजिटल प्रगति हेर्नुहोस्
            </div>
            {/* Real functional QR code generated via qrserver */}
            <img
              src="https://api.qrserver.com/v1/create-qr-code/?size=68x68&data=https://panchpokharithangpal.gov.np"
              alt="Portal QR"
              style={{ width: '64px', height: '64px', borderRadius: '4px', backgroundColor: '#ffffff', padding: '2px' }}
            />
          </div>
        </div>

        {/* ── TOP KPI CIRCLES ROW (8 CIRCLES) ────────────────────────────── */}
        <div
          style={{
            backgroundColor: '#F8FAFC',
            borderBottom: '2px solid #CBD5E1',
            padding: '1rem 1.5rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(8, 1fr)',
            gap: '0.75rem',
            textAlign: 'center',
          }}
        >
          {/* 1. कुल जनसंख्या */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '46px', height: '46px', borderRadius: '50%', backgroundColor: '#0F766E', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.35rem', boxShadow: '0 3px 8px rgba(15,118,110,0.3)' }}>
              <Users size={22} />
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>कुल जनसंख्या</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A' }}>24,563</div>
          </div>

          {/* 2. कुल घरधुरी */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '46px', height: '46px', borderRadius: '50%', backgroundColor: '#1D4ED8', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.35rem', boxShadow: '0 3px 8px rgba(29,78,216,0.3)' }}>
              <Home size={22} />
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>कुल घरधुरी</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A' }}>5,236</div>
          </div>

          {/* 3. सडक पहुँच */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '46px', height: '46px', borderRadius: '50%', backgroundColor: '#7C3AED', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.35rem', boxShadow: '0 3px 8px rgba(124,58,237,0.3)' }}>
              <MapPin size={22} />
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>सडक पहुँच</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#059669' }}>85%</div>
          </div>

          {/* 4. खानेपानी पहुँच */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '46px', height: '46px', borderRadius: '50%', backgroundColor: '#0284C7', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.35rem', boxShadow: '0 3px 8px rgba(2,132,199,0.3)' }}>
              <Droplets size={22} />
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>खानेपानी पहुँच</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#059669' }}>90%</div>
          </div>

          {/* 5. विद्युतीकरण */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '46px', height: '46px', borderRadius: '50%', backgroundColor: '#D97706', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.35rem', boxShadow: '0 3px 8px rgba(217,119,6,0.3)' }}>
              <Zap size={22} />
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>विद्युतीकरण</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#059669' }}>95%</div>
          </div>

          {/* 6. इन्टरनेट पहुँच */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '46px', height: '46px', borderRadius: '50%', backgroundColor: '#059669', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.35rem', boxShadow: '0 3px 8px rgba(5,150,105,0.3)' }}>
              <Wifi size={22} />
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>इन्टरनेट पहुँच</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#059669' }}>75%</div>
          </div>

          {/* 7. कुल बजेट */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '46px', height: '46px', borderRadius: '50%', backgroundColor: '#DC2626', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.35rem', boxShadow: '0 3px 8px rgba(220,38,38,0.3)' }}>
              <DollarSign size={22} />
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>कुल बजेट</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#DC2626' }}>{config.kpiBudget}</div>
          </div>

          {/* 8. सम्पन्न योजना */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '46px', height: '46px', borderRadius: '50%', backgroundColor: '#DB2777', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.35rem', boxShadow: '0 3px 8px rgba(219,39,119,0.3)' }}>
              <CheckCircle2 size={22} />
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>सम्पन्न योजना</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A' }}>{config.kpiCompletedProjects}</div>
          </div>
        </div>

        {/* ── 3-COLUMN MID SECTION: COMPARISON, MAP, SECTORAL BARS ───────── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.15fr 1.1fr 1fr',
            borderBottom: '2px solid #CBD5E1',
            backgroundColor: '#ffffff',
          }}
        >
          {/* Column 1: १० वर्षको समग्र प्रगति Table */}
          <div style={{ padding: '1rem', borderRight: '1px solid #CBD5E1' }}>
            <div style={{ backgroundColor: '#0F4C81', color: '#ffffff', padding: '0.4rem 0.75rem', borderRadius: '6px', fontWeight: 800, fontSize: '0.85rem', textAlign: 'center', marginBottom: '0.6rem' }}>
              {config.tableTitle}
            </div>

            <div className="dt-responsive-table-wrapper">
<table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#F1F5F9', borderBottom: '2px solid #CBD5E1', textAlign: 'left' }}>
                  <th style={{ padding: '0.35rem 0.5rem' }}>सूचक</th>
                  <th style={{ padding: '0.35rem 0.5rem', textAlign: 'center' }}>{config.tableColStart}</th>
                  <th style={{ padding: '0.35rem 0.5rem', textAlign: 'center' }}>{config.tableColEnd}</th>
                  <th style={{ padding: '0.35rem 0.5rem', textAlign: 'right' }}>{config.tableColChange}</th>
                </tr>
              </thead>
              <tbody>
                {config.tableRows.map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #E2E8F0', backgroundColor: idx % 2 === 0 ? '#ffffff' : '#F8FAFC' }}>
                    <td style={{ padding: '0.3rem 0.5rem', fontWeight: 700, color: '#1E293B' }}>{row.name}</td>
                    <td style={{ padding: '0.3rem 0.5rem', textAlign: 'center', color: '#64748B' }}>{row.b}</td>
                    <td style={{ padding: '0.3rem 0.5rem', textAlign: 'center', fontWeight: 800, color: '#0F4C81' }}>{row.c}</td>
                    <td style={{ padding: '0.3rem 0.5rem', textAlign: 'right', fontWeight: 800, color: '#059669' }}>
                      🟢 {row.diff}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
</div>
          </div>

          {/* Column 2: GIS आधारित विकास नक्सा */}
          <div style={{ padding: '1rem', borderRight: '1px solid #CBD5E1', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ backgroundColor: '#0F4C81', color: '#ffffff', padding: '0.4rem 0.75rem', borderRadius: '6px', fontWeight: 800, fontSize: '0.85rem', textAlign: 'center', marginBottom: '0.6rem' }}>
              GIS आधारित विकास नक्सा
            </div>

            {/* Simulated Vector / Topo GIS Map with Pins */}
            <div
              style={{
                height: '190px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                backgroundImage: 'url("https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'relative',
                display: 'flex',
                overflow: 'hidden',
              }}
            >
              <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.45)' }} />

              {/* Map Pins */}
              <div style={{ position: 'absolute', top: '25%', left: '30%', color: '#EF4444', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }} title="विद्यालय"><MapPin size={20} fill="#EF4444" color="#FFFFFF" /></div>
              <div style={{ position: 'absolute', top: '45%', left: '48%', color: '#10B981', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }} title="स्वास्थ्य"><MapPin size={20} fill="#10B981" color="#FFFFFF" /></div>
              <div style={{ position: 'absolute', top: '65%', left: '35%', color: '#F59E0B', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }} title="पुल/सडक"><MapPin size={20} fill="#F59E0B" color="#FFFFFF" /></div>
              <div style={{ position: 'absolute', top: '35%', left: '60%', color: '#3B82F6', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }} title="खानेपानी"><MapPin size={20} fill="#3B82F6" color="#FFFFFF" /></div>
              <div style={{ position: 'absolute', top: '75%', left: '65%', color: '#8B5CF6', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }} title="सामुदायिक भवन"><MapPin size={20} fill="#8B5CF6" color="#FFFFFF" /></div>

              {/* Map Legend Overlay */}
              <div
                style={{
                  position: 'absolute',
                  right: '6px',
                  top: '6px',
                  bottom: '6px',
                  backgroundColor: 'rgba(255,255,255,0.92)',
                  borderRadius: '6px',
                  padding: '0.4rem 0.6rem',
                  fontSize: '0.65rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.2rem',
                  color: '#0F172A',
                  fontWeight: 700,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                }}
              >
                <div>🔴 विद्यालय</div>
                <div>🟢 स्वास्थ्य संस्था</div>
                <div>🟡 सडक / पुल</div>
                <div>🔵 खानेपानी योजना</div>
                <div>🟣 सामुदायिक भवन</div>
                <div>🟠 पर्यटकीय स्थल</div>
                <div>🔵 विद्युत विस्तार</div>
                <div>🟡 बोरिङ/पम्प</div>
              </div>
            </div>

            {/* Map Statistics Footer Bar */}
            <div
              style={{
                marginTop: '0.6rem',
                backgroundColor: '#F1F5F9',
                border: '1px solid #CBD5E1',
                borderRadius: '6px',
                padding: '0.4rem 0.5rem',
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                textAlign: 'center',
                fontSize: '0.7rem',
              }}
            >
              <div>
                <div style={{ color: '#64748B' }}>कुल योजना</div>
                <strong style={{ fontSize: '0.85rem' }}>1,284</strong>
              </div>
              <div>
                <div style={{ color: '#64748B' }}>GIS दर्ता</div>
                <strong style={{ fontSize: '0.85rem', color: '#0F4C81' }}>1,148</strong>
              </div>
              <div>
                <div style={{ color: '#64748B' }}>सम्पन्न</div>
                <strong style={{ fontSize: '0.85rem', color: '#059669' }}>892</strong>
              </div>
              <div>
                <div style={{ color: '#64748B' }}>सञ्चालनमा</div>
                <strong style={{ fontSize: '0.85rem', color: '#D97706' }}>210</strong>
              </div>
              <div>
                <div style={{ color: '#64748B' }}>कभरेज</div>
                <strong style={{ fontSize: '0.85rem', color: '#059669' }}>100%</strong>
              </div>
            </div>
          </div>

          {/* Column 3: क्षेत्रगत प्रगति Bar Progress List */}
          <div style={{ padding: '1rem' }}>
            <div style={{ backgroundColor: '#0F4C81', color: '#ffffff', padding: '0.4rem 0.75rem', borderRadius: '6px', fontWeight: 800, fontSize: '0.85rem', textAlign: 'center', marginBottom: '0.6rem' }}>
              {config.sectorTitle}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.72rem' }}>
              {[
                { label: 'शिक्षा', pct: 95, color: '#DC2626' },
                { label: 'स्वास्थ्य', pct: 88, color: '#0284C7' },
                { label: 'कृषि', pct: 82, color: '#059669' },
                { label: 'पशुपालन', pct: 76, color: '#D97706' },
                { label: 'पर्यटन', pct: 81, color: '#9333EA' },
                { label: 'पूर्वाधार', pct: 89, color: '#0F4C81' },
                { label: 'खानेपानी', pct: 90, color: '#0284C7' },
                { label: 'बिजुली / सञ्चार', pct: 95, color: '#16A34A' },
                { label: 'वातावरण', pct: 79, color: '#059669' },
                { label: 'डिजिटल सुशासन', pct: 92, color: '#4F46E5' },
              ].map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ width: '85px', fontWeight: 700, color: '#1E293B', whiteSpace: 'nowrap' }}>
                    {item.label}
                  </span>
                  <div style={{ flex: 1, height: '11px', backgroundColor: '#E2E8F0', borderRadius: '6px', overflow: 'hidden' }}>
                    <div style={{ width: `${item.pct}%`, height: '100%', backgroundColor: item.color, borderRadius: '6px' }} />
                  </div>
                  <span style={{ width: '28px', textAlign: 'right', fontWeight: 800, color: '#0F172A' }}>
                    {item.pct}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── ASSET CONDITION & MAINTENANCE HEALTH STATUS (🟢🟡🔴) ── */}
        <div
          style={{
            backgroundColor: '#F8FAFC',
            borderBottom: '2px solid #CBD5E1',
            padding: '0.85rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 900, color: '#0F4C81' }}>
                पूर्वाधार सम्पत्ति स्वास्थ्य तथा मर्मत अवस्था सूचक (Asset Health Index):
              </span>
              <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                कुल २६७ कि.मि. सडक, ५२ पुल, ११२ खानेपानी र ४२ भवनहरूको स्थलगत अवस्था
              </span>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.75rem', fontWeight: 800 }}>
              <span style={{ color: '#15803D', backgroundColor: '#DCFCE7', padding: '0.2rem 0.6rem', borderRadius: '12px', border: '1px solid #86EFAC' }}>
                🟢 चालु / राम्रो: ७४.६% (१८२ योजना)
              </span>
              <span style={{ color: '#B45309', backgroundColor: '#FEF3C7', padding: '0.2rem 0.6rem', borderRadius: '12px', border: '1px solid #FCD34D' }}>
                🟡 सामान्य मर्मत: १८.९% (४६ योजना)
              </span>
              <span style={{ color: '#B91C1C', backgroundColor: '#FEE2E2', padding: '0.2rem 0.6rem', borderRadius: '12px', border: '1px solid #FCA5A5' }}>
                🔴 तत्काल पुनर्निर्माण: ६.५% (१६ योजना)
              </span>
            </div>
          </div>

          {/* Tri-color Segmented Bar */}
          <div
            style={{
              height: '10px',
              width: '100%',
              borderRadius: '6px',
              overflow: 'hidden',
              display: 'flex',
              backgroundColor: '#E2E8F0',
            }}
          >
            <div style={{ width: '74.6%', backgroundColor: '#10B981' }} title="🟢 चालु तथा सुचारु (74.6%)" />
            <div style={{ width: '18.9%', backgroundColor: '#F59E0B' }} title="🟡 सामान्य मर्मत आवश्यक (18.9%)" />
            <div style={{ width: '6.5%', backgroundColor: '#EF4444' }} title="🔴 तुरुन्त मर्मत वा पुनर्निर्माण (6.5%)" />
          </div>
        </div>

        {/* ── MAJOR ACHIEVEMENTS (10 PHOTO CARDS GRID) ───────────────────── */}
        <div style={{ padding: '1rem 1.5rem', backgroundColor: '#ffffff', borderBottom: '2px solid #CBD5E1' }}>
          <div style={{ backgroundColor: '#0A2540', color: '#ffffff', padding: '0.45rem', borderRadius: '6px', textAlign: 'center', fontWeight: 800, fontSize: '0.95rem', letterSpacing: '0.05em', marginBottom: '0.85rem' }}>
            प्रमुख उपलब्धिहरू
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.65rem' }}>
            {/* 1. सडक तथा पुल */}
            <div style={{ border: '1px solid #CBD5E1', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#ffffff' }}>
              <div style={{ backgroundColor: '#0F4C81', color: '#ffffff', fontSize: '0.75rem', fontWeight: 800, padding: '0.25rem', textAlign: 'center' }}>सडक तथा पुल</div>
              <img src="https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=400" alt="सडक तथा पुल" style={{ width: '100%', height: '70px', objectFit: 'cover' }} />
              <div style={{ padding: '0.4rem 0.5rem', fontSize: '0.68rem', lineHeight: '1.4', color: '#1E293B' }}>
                <div>• कुल सडक: <strong>267 कि.मि.</strong></div>
                <div>• पक्की सडक: <strong>152 कि.मि.</strong></div>
                <div>• नयाँ मोटरेबल पुल: <strong>14</strong></div>
                <div>• झोलुङ्गे पुल: <strong>38</strong></div>
              </div>
            </div>

            {/* 2. शिक्षा */}
            <div style={{ border: '1px solid #CBD5E1', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#ffffff' }}>
              <div style={{ backgroundColor: '#0F4C81', color: '#ffffff', fontSize: '0.75rem', fontWeight: 800, padding: '0.25rem', textAlign: 'center' }}>शिक्षा</div>
              <img src="https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400" alt="शिक्षा" style={{ width: '100%', height: '70px', objectFit: 'cover' }} />
              <div style={{ padding: '0.4rem 0.5rem', fontSize: '0.68rem', lineHeight: '1.4', color: '#1E293B' }}>
                <div>• विद्यालय संख्या: <strong>42</strong></div>
                <div>• ICT Lab: <strong>28</strong></div>
                <div>• Smart Classroom: <strong>36</strong></div>
                <div>• SEE उत्तीर्ण: <strong>78% बाट 92%</strong></div>
              </div>
            </div>

            {/* 3. स्वास्थ्य */}
            <div style={{ border: '1px solid #CBD5E1', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#ffffff' }}>
              <div style={{ backgroundColor: '#0F4C81', color: '#ffffff', fontSize: '0.75rem', fontWeight: 800, padding: '0.25rem', textAlign: 'center' }}>स्वास्थ्य</div>
              <img src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400" alt="स्वास्थ्य" style={{ width: '100%', height: '70px', objectFit: 'cover' }} />
              <div style={{ padding: '0.4rem 0.5rem', fontSize: '0.68rem', lineHeight: '1.4', color: '#1E293B' }}>
                <div>• संस्था: <strong>1 अस्पताल, 8 चौंकी</strong></div>
                <div>• प्रसूति दर: <strong>32% बाट 86%</strong></div>
                <div>• खोप दर: <strong>65% बाट 96%</strong></div>
                <div>• टेलिमेडिसिन: <strong>पूर्ण सञ्चालन</strong></div>
              </div>
            </div>

            {/* 4. कृषि */}
            <div style={{ border: '1px solid #CBD5E1', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#ffffff' }}>
              <div style={{ backgroundColor: '#0F4C81', color: '#ffffff', fontSize: '0.75rem', fontWeight: 800, padding: '0.25rem', textAlign: 'center' }}>कृषि</div>
              <img src="https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=400" alt="कृषि" style={{ width: '100%', height: '70px', objectFit: 'cover' }} />
              <div style={{ padding: '0.4rem 0.5rem', fontSize: '0.68rem', lineHeight: '1.4', color: '#1E293B' }}>
                <div>• सिँचाइ: <strong>2,150 हेक्टर</strong></div>
                <div>• सिँचाइ कुलो: <strong>76 कि.मि.</strong></div>
                <div>• उत्पादन वृद्धि: <strong>68%</strong></div>
                <div>• कृषक संख्या: <strong>3,842</strong></div>
              </div>
            </div>

            {/* 5. खानेपानी */}
            <div style={{ border: '1px solid #CBD5E1', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#ffffff' }}>
              <div style={{ backgroundColor: '#0F4C81', color: '#ffffff', fontSize: '0.75rem', fontWeight: 800, padding: '0.25rem', textAlign: 'center' }}>खानेपानी</div>
              <img src="https://images.unsplash.com/photo-1541888946425-d0fbb186156a?w=400" alt="खानेपानी" style={{ width: '100%', height: '70px', objectFit: 'cover' }} />
              <div style={{ padding: '0.4rem 0.5rem', fontSize: '0.68rem', lineHeight: '1.4', color: '#1E293B' }}>
                <div>• योजना संख्या: <strong>112</strong></div>
                <div>• धारा संख्या: <strong>2,816</strong></div>
                <div>• लाभान्वित घर: <strong>4,712</strong></div>
                <div>• पहुँच प्रतिशत: <strong>90%</strong></div>
              </div>
            </div>

            {/* 6. विद्युतीकरण तथा सञ्चार */}
            <div style={{ border: '1px solid #CBD5E1', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#ffffff' }}>
              <div style={{ backgroundColor: '#0F4C81', color: '#ffffff', fontSize: '0.75rem', fontWeight: 800, padding: '0.25rem', textAlign: 'center' }}>विद्युतीकरण तथा सञ्चार</div>
              <img src="https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400" alt="विद्युतीकरण" style={{ width: '100%', height: '70px', objectFit: 'cover' }} />
              <div style={{ padding: '0.4rem 0.5rem', fontSize: '0.68rem', lineHeight: '1.4', color: '#1E293B' }}>
                <div>• विद्युतीकरण: <strong>95%</strong></div>
                <div>• लाइन विस्तार: <strong>186 कि.मि.</strong></div>
                <div>• ट्रान्सफर्मर: <strong>73</strong></div>
                <div>• इन्टरनेट पहुँच: <strong>75%</strong></div>
              </div>
            </div>

            {/* 7. पर्यटन */}
            <div style={{ border: '1px solid #CBD5E1', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#ffffff' }}>
              <div style={{ backgroundColor: '#0F4C81', color: '#ffffff', fontSize: '0.75rem', fontWeight: 800, padding: '0.25rem', textAlign: 'center' }}>पर्यटन</div>
              <img src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400" alt="पर्यटन" style={{ width: '100%', height: '70px', objectFit: 'cover' }} />
              <div style={{ padding: '0.4rem 0.5rem', fontSize: '0.68rem', lineHeight: '1.4', color: '#1E293B' }}>
                <div>• स्थल: <strong>48 वटा</strong></div>
                <div>• पर्यटक: <strong>1,250 बाट 12,450</strong></div>
                <div>• होमस्टे: <strong>126</strong></div>
                <div>• पर्यटन आय: <strong>8 गुणा वृद्धि</strong></div>
              </div>
            </div>

            {/* 8. सामाजिक समावेशीकरण तथा श्रम बैंक */}
            <div style={{ border: '1px solid #CBD5E1', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#ffffff' }}>
              <div style={{ backgroundColor: '#0F4C81', color: '#ffffff', fontSize: '0.75rem', fontWeight: 800, padding: '0.25rem', textAlign: 'center' }}>सामाजिक सुरक्षा र श्रम बैंक</div>
              <img src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400" alt="समावेशीकरण" style={{ width: '100%', height: '70px', objectFit: 'cover' }} />
              <div style={{ padding: '0.4rem 0.5rem', fontSize: '0.68rem', lineHeight: '1.4', color: '#1E293B' }}>
                <div>• सामाजिक सुरक्षा (SSIS): <strong>1,680+</strong></div>
                <div>• श्रम बैंक (PMEP): <strong>१०० दिन ग्यारेन्टी</strong></div>
                <div>• भत्ता भुक्तानी: <strong>100% DBT बैंक</strong></div>
                <div>• विपद् राहत (DMIS): <strong>२४/७ EOC</strong></div>
              </div>
            </div>

            {/* 9. वातावरण तथा जलवायु */}
            <div style={{ border: '1px solid #CBD5E1', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#ffffff' }}>
              <div style={{ backgroundColor: '#0F4C81', color: '#ffffff', fontSize: '0.75rem', fontWeight: 800, padding: '0.25rem', textAlign: 'center' }}>वातावरण तथा जलवायु</div>
              <img src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400" alt="वातावरण" style={{ width: '100%', height: '70px', objectFit: 'cover' }} />
              <div style={{ padding: '0.4rem 0.5rem', fontSize: '0.68rem', lineHeight: '1.4', color: '#1E293B' }}>
                <div>• वृक्षारोपण: <strong>1,25,000 बोट</strong></div>
                <div>• जलाधार संरक्षण: <strong>32 स्थान</strong></div>
                <div>• फोहोर व्यवस्थापन: <strong>68%</strong></div>
                <div>• प्लास्टिक मुक्त वडा: <strong>6</strong></div>
              </div>
            </div>

            {/* 10. डिजिटल सुशासन */}
            <div style={{ border: '1px solid #CBD5E1', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#ffffff' }}>
              <div style={{ backgroundColor: '#0F4C81', color: '#ffffff', fontSize: '0.75rem', fontWeight: 800, padding: '0.25rem', textAlign: 'center' }}>डिजिटल सुशासन (Gov SaaS)</div>
              <img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400" alt="डिजिटल सुशासन" style={{ width: '100%', height: '70px', objectFit: 'cover' }} />
              <div style={{ padding: '0.4rem 0.5rem', fontSize: '0.68rem', lineHeight: '1.4', color: '#1E293B' }}>
                <div>• e-BPS / PAMS / e-Tax: <strong>सञ्चालन</strong></div>
                <div>• दर्ता चलानी / इजलास: <strong>डिजिटल</strong></div>
                <div>• किसान लगत / माटो कार्ड: <strong>जारी</strong></div>
                <div>• अनलाइन नागरिक सेवा: <strong>32+</strong></div>
              </div>
            </div>
          </div>
        </div>

        {/* ── PUBLIC ASSETS (14 ICONS GRID) ──────────────────────────────── */}
        <div style={{ padding: '0.75rem 1.5rem', backgroundColor: '#F8FAFC', borderBottom: '2px solid #CBD5E1' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0F4C81', textAlign: 'center', marginBottom: '0.5rem' }}>
            सार्वजनिक सम्पत्ति (Assets) — मुख्य पूर्वाधार सूची
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '0.4rem', textAlign: 'center' }}>
            <div style={{ padding: '0.35rem', backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #CBD5E1' }}>
              <div style={{ fontSize: '0.68rem', color: '#64748B' }}>झोलुङ्गे पुल</div>
              <strong style={{ fontSize: '1.05rem', color: '#0F4C81' }}>38</strong>
            </div>
            <div style={{ padding: '0.35rem', backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #CBD5E1' }}>
              <div style={{ fontSize: '0.68rem', color: '#64748B' }}>मोटरेबल पुल</div>
              <strong style={{ fontSize: '1.05rem', color: '#0F4C81' }}>14</strong>
            </div>
            <div style={{ padding: '0.35rem', backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #CBD5E1' }}>
              <div style={{ fontSize: '0.68rem', color: '#64748B' }}>सामुदायिक भवन</div>
              <strong style={{ fontSize: '1.05rem', color: '#0F4C81' }}>112</strong>
            </div>
            <div style={{ padding: '0.35rem', backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #CBD5E1' }}>
              <div style={{ fontSize: '0.68rem', color: '#64748B' }}>धार्मिक सम्पदा</div>
              <strong style={{ fontSize: '1.05rem', color: '#0F4C81' }}>68</strong>
            </div>
            <div style={{ padding: '0.35rem', backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #CBD5E1' }}>
              <div style={{ fontSize: '0.68rem', color: '#64748B' }}>प्रतिक्षालय</div>
              <strong style={{ fontSize: '1.05rem', color: '#0F4C81' }}>56</strong>
            </div>
            <div style={{ padding: '0.35rem', backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #CBD5E1' }}>
              <div style={{ fontSize: '0.68rem', color: '#64748B' }}>पार्क</div>
              <strong style={{ fontSize: '1.05rem', color: '#0F4C81' }}>18</strong>
            </div>
            <div style={{ padding: '0.35rem', backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #CBD5E1' }}>
              <div style={{ fontSize: '0.68rem', color: '#64748B' }}>सिँचाइ कुलो</div>
              <strong style={{ fontSize: '1rem', color: '#0F4C81' }}>76 कि.मि.</strong>
            </div>
            <div style={{ padding: '0.35rem', backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #CBD5E1' }}>
              <div style={{ fontSize: '0.68rem', color: '#64748B' }}>विद्युत कालो तार</div>
              <strong style={{ fontSize: '1rem', color: '#0F4C81' }}>186 कि.मि.</strong>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.4rem', textAlign: 'center', marginTop: '0.4rem' }}>
            <div style={{ padding: '0.35rem', backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #CBD5E1' }}>
              <div style={{ fontSize: '0.68rem', color: '#64748B' }}>ताल/पोखरी संरक्षण</div>
              <strong style={{ fontSize: '1.05rem', color: '#0F766E' }}>32</strong>
            </div>
            <div style={{ padding: '0.35rem', backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #CBD5E1' }}>
              <div style={{ fontSize: '0.68rem', color: '#64748B' }}>झरना संरक्षण</div>
              <strong style={{ fontSize: '1.05rem', color: '#0F766E' }}>15</strong>
            </div>
            <div style={{ padding: '0.35rem', backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #CBD5E1' }}>
              <div style={{ fontSize: '0.68rem', color: '#64748B' }}>चिया बगान</div>
              <strong style={{ fontSize: '1.05rem', color: '#0F766E' }}>9</strong>
            </div>
            <div style={{ padding: '0.35rem', backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #CBD5E1' }}>
              <div style={{ fontSize: '0.68rem', color: '#64748B' }}>कोसेली घर</div>
              <strong style={{ fontSize: '1.05rem', color: '#0F766E' }}>26</strong>
            </div>
            <div style={{ padding: '0.35rem', backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #CBD5E1' }}>
              <div style={{ fontSize: '0.68rem', color: '#64748B' }}>माछा फार्म</div>
              <strong style={{ fontSize: '1.05rem', color: '#0F766E' }}>18</strong>
            </div>
            <div style={{ padding: '0.35rem', backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #CBD5E1' }}>
              <div style={{ fontSize: '0.68rem', color: '#64748B' }}>वडा भवन</div>
              <strong style={{ fontSize: '1.05rem', color: '#0F766E' }}>9</strong>
            </div>
          </div>
        </div>

        {/* ── BOTTOM ROW: 3 COLUMNS (FINANCIAL, CITIZEN SURVEY, DISASTER/OPEN DATA) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 1fr 1.15fr', backgroundColor: '#ffffff' }}>
          {/* Column 1: वित्तीय प्रगति (रु. लाखमा) */}
          <div style={{ padding: '1rem', borderRight: '1px solid #CBD5E1' }}>
            <div style={{ backgroundColor: '#0A2540', color: '#ffffff', padding: '0.35rem', borderRadius: '4px', textAlign: 'center', fontWeight: 800, fontSize: '0.8rem', marginBottom: '0.5rem' }}>
              वित्तीय प्रगति (रु. लाखमा)
            </div>

            {/* Dynamic Horizontal Bar Progression */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', fontSize: '0.66rem' }}>
              {config.financialBars.map((b, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <span style={{ width: '68px', color: '#64748B', fontWeight: 600 }}>{b.fy}</span>
                  <div style={{ flex: 1, height: '8px', backgroundColor: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${b.pct}%`, height: '100%', backgroundColor: '#0F766E', borderRadius: '4px' }} />
                  </div>
                  <span style={{ width: '38px', textAlign: 'right', fontWeight: 700, color: '#1E293B' }}>{b.val.toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '0.5rem', paddingTop: '0.4rem', borderTop: '1px dashed #CBD5E1', fontSize: '0.72rem', lineHeight: '1.4' }}>
              <div><strong>{config.financialSummaryText}</strong></div>
              <div style={{ color: '#059669' }}><strong>{config.financialSpentText}</strong></div>
            </div>
          </div>

          {/* Column 2: नागरिक सन्तुष्टि सूचकाङ्क (Survey) */}
          <div style={{ padding: '1rem', borderRight: '1px solid #CBD5E1', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ backgroundColor: '#0A2540', color: '#ffffff', padding: '0.35rem', borderRadius: '4px', width: '100%', fontWeight: 800, fontSize: '0.8rem', marginBottom: '0.5rem' }}>
              नागरिक सन्तुष्टि सूचकाङ्क (Survey)
            </div>

            {/* Donut Score Visual */}
            <div style={{ position: 'relative', width: '90px', height: '90px', borderRadius: '50%', background: 'conic-gradient(#059669 0% 88%, #EF4444 88% 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0.25rem 0' }}>
              <div style={{ width: '65px', height: '65px', borderRadius: '50%', backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontSize: '0.65rem', color: '#64748B' }}>सन्तुष्टि</div>
                <strong style={{ fontSize: '1.1rem', color: '#059669', lineHeight: 1 }}>88%</strong>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.25rem', fontSize: '0.68rem', width: '100%', margin: '0.3rem 0', textAlign: 'left' }}>
              <div>🟢 अति सन्तुष्ट: <strong>48%</strong></div>
              <div>🔵 सन्तुष्ट: <strong>40%</strong></div>
              <div>🟡 सामान्य: <strong>8%</strong></div>
              <div>🔴 असन्तुष्ट: <strong>4%</strong></div>
            </div>

            {/* जनप्रतिनिधि कार्यसम्पादन सूचकाङ्क */}
            <div style={{ borderTop: '1px dashed #CBD5E1', paddingTop: '0.4rem', width: '100%', fontSize: '0.68rem', textAlign: 'left', lineHeight: '1.4' }}>
              <div style={{ fontWeight: 800, color: '#0F4C81', textAlign: 'center', marginBottom: '0.2rem' }}>
                जनप्रतिनिधि कार्यसम्पादन सूचकाङ्क
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>बजेट/योजना पारदर्शी:</span> <strong>90%</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>सेवा प्रवाह तथा सुशासन:</span> <strong>86%</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>समग्र स्कोर:</span> <strong style={{ color: '#059669' }}>89%</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', color: '#EAB308', marginTop: '0.2rem' }}>
                <Star size={14} fill="#EAB308" />
                <Star size={14} fill="#EAB308" />
                <Star size={14} fill="#EAB308" />
                <Star size={14} fill="#EAB308" />
                <Star size={14} fill="#EAB308" />
              </div>
            </div>
          </div>

          {/* Column 3: विपद् जोखिम नक्सा & खुला तथ्याङ्क */}
          <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ backgroundColor: '#0A2540', color: '#ffffff', padding: '0.35rem', borderRadius: '4px', textAlign: 'center', fontWeight: 800, fontSize: '0.8rem', marginBottom: '0.4rem' }}>
              विपद् जोखिम नक्सा (Risk Mapping)
            </div>

            {/* 3 mini hazard maps */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.3rem', textAlign: 'center', fontSize: '0.65rem' }}>
              <div style={{ border: '1px solid #CBD5E1', borderRadius: '4px', padding: '0.2rem', backgroundColor: '#FEF2F2' }}>
                <div style={{ fontWeight: 700, color: '#DC2626' }}>पहिरो जोखिम</div>
                <div style={{ height: '35px', backgroundColor: '#FCA5A5', borderRadius: '2px', margin: '0.2rem 0' }} />
                <span>उच्च जोखिम</span>
              </div>

              <div style={{ border: '1px solid #CBD5E1', borderRadius: '4px', padding: '0.2rem', backgroundColor: '#EFF6FF' }}>
                <div style={{ fontWeight: 700, color: '#2563EB' }}>बाढी जोखिम</div>
                <div style={{ height: '35px', backgroundColor: '#93C5FD', borderRadius: '2px', margin: '0.2rem 0' }} />
                <span>नदी किनार</span>
              </div>

              <div style={{ border: '1px solid #CBD5E1', borderRadius: '4px', padding: '0.2rem', backgroundColor: '#FFFBEB' }}>
                <div style={{ fontWeight: 700, color: '#D97706' }}>आगलागी जोखिम</div>
                <div style={{ height: '35px', backgroundColor: '#FDE68A', borderRadius: '2px', margin: '0.2rem 0' }} />
                <span>वन क्षेत्र</span>
              </div>
            </div>

            {/* खुला तथ्याङ्क Portal Bar */}
            <div style={{ marginTop: '0.4rem', borderTop: '1px dashed #CBD5E1', paddingTop: '0.3rem' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#0F4C81', marginBottom: '0.2rem' }}>
                खुला तथ्याङ्क (Open Data Portal)
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.62rem', color: '#64748B' }}>
                <span>📥 डेटा डाउनलोड</span>
                <span>🗺️ GIS नक्सा</span>
                <span>📋 योजना विवरण</span>
                <span>📊 बजेट</span>
              </div>
            </div>

            {/* डिजिटल प्रतिवेदनका माध्यम */}
            <div style={{ borderTop: '1px solid #CBD5E1', paddingTop: '0.3rem' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#0F4C81', marginBottom: '0.2rem' }}>
                डिजिटल प्रतिवेदनका माध्यम
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.62rem', color: '#1E293B', fontWeight: 600 }}>
                <span>🌐 वेब पोर्टल</span>
                <span>📱 मोबाइल एप</span>
                <span>📄 PDF</span>
                <span>📖 E-Book</span>
                <span>🎬 भिडियो</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── OFFICIAL FOOTER BAR ────────────────────────────────────────── */}
        <div
          style={{
            backgroundColor: '#0A2540',
            color: '#ffffff',
            padding: '1rem 1.75rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            borderTop: '3px solid #E65100',
            fontSize: '0.75rem',
          }}
        >
          {/* Municipal Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <img
              src={logoUrl}
              alt={palikaName}
              style={{ width: '38px', height: '38px', objectFit: 'contain', filter: 'brightness(1.5)' }}
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#ffffff' }}>
                {palikaName}
              </div>
              <div style={{ color: '#94A3B8', fontSize: '0.72rem' }}>
                {address}, {province}, नेपाल
              </div>
            </div>
          </div>

          {/* Contact & Web */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem', color: '#CBD5E1', fontSize: '0.72rem' }}>
            <div>📞 ०११-४००००३, ९८xxxxxxxx • ✉️ info@pthangpalmun.gov.np</div>
            <div>🌐 www.pokharithangpalmun.gov.np • 📘 /pokharithangpalmun</div>
          </div>

          {/* Slogan */}
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 900, fontSize: '0.95rem', color: '#FCD34D' }}>
              समृद्ध {palikaName}
            </div>
            <div style={{ color: '#E2E8F0', fontSize: '0.75rem', fontStyle: 'italic' }}>
              हाम्रो समृद्धि, हाम्रो पालिका
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnePagerPublicReportPage;
