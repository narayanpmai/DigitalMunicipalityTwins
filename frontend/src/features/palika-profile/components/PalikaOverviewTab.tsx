import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Building2,
  MapPin,
  Compass,
  Phone,
  Mail,
  Users,
  Award,
  Mountain,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
  ExternalLink,
  Shield,
  FileText,
  Edit3,
  Link2,
  RefreshCw,
  Home,
  ScrollText
} from 'lucide-react';
import { useTenant } from '../../../context/TenantContext';
import { municipalityApi } from '../../../api/municipality';
import { representativesApi, Representative } from '../../../api/representatives';
import { PalikaProfileEditModal } from './PalikaProfileEditModal';

export const PalikaOverviewTab: React.FC = () => {
  const { settings } = useTenant();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Fetch central profile from database
  const { data: profile, isLoading, refetch } = useQuery({
    queryKey: ['municipality-profile'],
    queryFn: () => municipalityApi.getProfile(),
  });

  // Single Source of Truth: Fetch representatives from central database
  const { data: representatives = [] } = useQuery({
    queryKey: ['representatives'],
    queryFn: () => representativesApi.getAll(),
  });

  const palikaName = profile?.nameNp || profile?.name || settings?.palika_name || 'पाँचपोखरी थाङपाल गाउँपालिका';
  const district = profile?.district || settings?.district || 'सिन्धुपाल्चोक';
  const province = profile?.province || settings?.province || 'बागमती प्रदेश';
  const headquarters = profile?.headquarters || 'थाङपालधाप';
  const areaSqKm = profile?.totalAreaSqKm || 187.29;
  const wardCount = profile?.totalWards || 8;
  const elevationMeters = profile?.elevationMeters || '१,१०० - ४,१०० मी.';
  const introduction = profile?.introduction || `${palikaName} नेपालको बागमती प्रदेश अन्तर्गत सिन्धुपाल्चोक जिल्लाको उत्तर-पश्चिम भेगमा अवस्थित उच्च हिमाली तथा पहाडी भू-भाग ओगटेको एक प्राकृतिक, पर्यटकीय तथा सांस्कृतिक सम्पदाले भरिपूर्ण पालिका हो। यसको केन्द्र थाङपालधापमा अवस्थित छ।`;

  const boundaries = profile?.boundaries || {
    east: 'जुगल गाउँपालिका',
    west: 'हेलम्बु गाउँपालिका',
    north: 'रसुवा जिल्ला तथा चीनको तिब्बत स्वायत्त क्षेत्र',
    south: 'मेलम्ची नगरपालिका',
  };

  const culturalIdentity = profile?.culturalIdentity || [
    {
      title: 'पवित्र पाँचपोखरी कुण्ड (४,१०० मी.)',
      desc: 'विश्वकै ९औँ उच्च स्थानमा रहेको रामसार सिमसार क्षेत्र, जहाँ जनैपूर्णिमाका दिन विशाल धार्मिक मेला लाग्दछ।',
      color: '#059669',
      bg: '#ecfdf5',
      border: '#a7f3d0',
      icon: '🌊'
    },
    {
      title: 'आमा याङ्ग्री तथा ह्योल्मो संस्कृति',
      desc: 'ह्योल्मो, तामाङ र नेवार जातिको मौलिक संस्कृति, परम्परागत गुम्बा, माने र पदमार्ग पर्यटनको केन्द्रबिन्दु।',
      color: '#1e40af',
      bg: '#eff6ff',
      border: '#bfdbfe',
      icon: '🏔️'
    },
    {
      title: 'अर्गानिक कृषि तथा ट्राउट मत्स्य',
      desc: 'हिमाली रातो आलु, किवी फल, अर्गानिक अलैंची, रेन्बो ट्राउट र चौँरी घ्यूको प्रसिद्ध उद्गम स्थल।',
      color: '#9d174d',
      bg: '#fdf2f8',
      border: '#fbcfe8',
      icon: '🍎'
    }
  ];

  // Derive leaders dynamically from the authoritative representatives table
  const leaders = React.useMemo(() => {
    if (representatives && representatives.length > 0) {
      const repChair = representatives.find((r: Representative) =>
        r.isCurrent !== false &&
        (r.designation === 'अध्यक्ष' || r.designation === 'गाउँपालिका अध्यक्ष' || (r.designation?.includes('अध्यक्ष') && !r.designation?.includes('वडा') && !r.designation?.includes('उपाध्यक्ष')))
      );

      const repVice = representatives.find((r: Representative) =>
        r.isCurrent !== false &&
        (r.designation === 'उपाध्यक्ष' || r.designation?.includes('उपाध्यक्ष'))
      );

      const repCao = representatives.find((r: Representative) =>
        r.isCurrent !== false &&
        (r.designation === 'प्रमुख प्रशासकीय अधिकृत' || r.designation?.includes('प्रशासकीय'))
      );

      const repSpokesperson = representatives.find((r: Representative) =>
        r.isCurrent !== false &&
        (r.designation?.includes('प्रवक्ता') || r.wardNo === 3)
      );

      return [
        {
          name: repChair?.name || 'टासी लामा',
          role: repChair?.designation || 'गाउँपालिका अध्यक्ष',
          phone: repChair?.phone || '९८५११०२८३७',
          email: repChair?.email || 'chairperson@panchpokhari.gov.np',
          badge: 'कार्यकारी प्रमुख',
          color: '#0f4c81',
          initials: repChair?.name?.slice(0, 2) || 'TL',
          photoUrl: repChair?.photoUrl,
        },
        {
          name: repVice?.name || 'सुनिता अधिकारी',
          role: repVice?.designation || 'गाउँपालिका उपाध्यक्ष',
          phone: repVice?.phone || '९७४९३२६६२७',
          email: repVice?.email || 'vicechair@panchpokhari.gov.np',
          badge: 'न्यायिक समिति संयोजक',
          color: '#047857',
          initials: repVice?.name?.slice(0, 2) || 'SA',
          photoUrl: repVice?.photoUrl,
        },
        {
          name: repCao?.name || 'लक्ष्मण कुईकेल',
          role: repCao?.designation || 'प्रमुख प्रशासकीय अधिकृत',
          phone: repCao?.phone || '९७४९३२६६१९',
          email: repCao?.email || 'cao@panchpokhari.gov.np',
          badge: 'प्रशासनिक प्रमुख',
          color: '#b45309',
          initials: repCao?.name?.slice(0, 2) || 'LK',
          photoUrl: repCao?.photoUrl,
        },
        {
          name: repSpokesperson?.name || 'नारायण भट्टराई',
          role: repSpokesperson?.designation || 'प्रवक्ता तथा वडा अध्यक्ष (वडा ३)',
          phone: repSpokesperson?.phone || '९८६४१६५३६६',
          email: repSpokesperson?.email || 'ward3@panchpokhari.gov.np',
          badge: 'सञ्चार तथा समन्वय',
          color: '#6d28d9',
          initials: repSpokesperson?.name?.slice(0, 2) || 'NB',
          photoUrl: repSpokesperson?.photoUrl,
        },
      ];
    }

    return profile?.leaders || [
      {
        name: 'टासी लामा',
        role: 'गाउँपालिका अध्यक्ष',
        phone: '९८५११०२८३७',
        email: 'chairperson@panchpokhari.gov.np',
        badge: 'कार्यकारी प्रमुख',
        color: '#0f4c81',
        initials: 'TL'
      },
      {
        name: 'सुनिता अधिकारी',
        role: 'गाउँपालिका उपाध्यक्ष',
        phone: '९७४९३२६६२७',
        email: 'vicechair@panchpokhari.gov.np',
        badge: 'न्यायिक समिति संयोजक',
        color: '#047857',
        initials: 'SA'
      },
      {
        name: 'लक्ष्मण कुईकेल',
        role: 'प्रमुख प्रशासकीय अधिकृत',
        phone: '९७४९३२६६१९',
        email: 'cao@panchpokhari.gov.np',
        badge: 'प्रशासनिक प्रमुख',
        color: '#b45309',
        initials: 'LK'
      },
      {
        name: 'नारायण भट्टराई',
        role: 'प्रवक्ता तथा वडा अध्यक्ष (वडा ३)',
        phone: '९८६४१६५३६६',
        email: 'ward3@panchpokhari.gov.np',
        badge: 'सञ्चार तथा समन्वय',
        color: '#6d28d9',
        initials: 'NB'
      },
    ];
  }, [representatives, profile?.leaders]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.35rem' }}>
      
      {/* ── TOP CONTROL & CROSS-MODULE SYNC RIBBON ──────────────────────────── */}
      <div
        className="palika-glass-card"
        style={{
          padding: '0.85rem 1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
          background: 'linear-gradient(90deg, #ffffff 0%, #f0f9ff 100%)',
          borderLeft: '4px solid #0284c7',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '0.25rem 0.65rem',
              borderRadius: '9999px',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              color: '#047857',
              border: '1px solid #10b981',
            }}
          >
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#10b981' }}></span>
            केन्द्रीय सिङ्क प्रणाली (Single Source of Truth) सक्रिय
          </span>
          <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
            अन्तिम अद्यावधिक: आज • सम्पूर्ण मोड्युलहरूसँग प्रत्यक्ष आबद्ध
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', flexWrap: 'wrap' }}>
          {/* Linked Modules Quick Buttons */}
          <Link
            to="/app/representatives"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.45rem 0.8rem',
              borderRadius: '8px',
              backgroundColor: '#f8fafc',
              border: '1px solid #cbd5e1',
              color: '#0f172a',
              fontSize: '0.78rem',
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'all 0.15s',
            }}
            title="जनप्रतिनिधि व्यवस्थापन सूची हेर्नुहोस्"
          >
            <Users size={14} color="#0284c7" />
            <span>जनप्रतिनिधि व्यवस्थापन</span>
          </Link>

          <Link
            to="/app/demographics"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.45rem 0.8rem',
              borderRadius: '8px',
              backgroundColor: '#f8fafc',
              border: '1px solid #cbd5e1',
              color: '#0f172a',
              fontSize: '0.78rem',
              fontWeight: 600,
              textDecoration: 'none',
            }}
            title="घरधुरी प्रणालीमा जानुहोस्"
          >
            <Home size={14} color="#059669" />
            <span>घरधुरी लगत</span>
          </Link>

          <a
            href="/badapatra.html"
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.45rem 0.8rem',
              borderRadius: '8px',
              backgroundColor: '#f8fafc',
              border: '1px solid #cbd5e1',
              color: '#0f172a',
              fontSize: '0.78rem',
              fontWeight: 600,
              textDecoration: 'none',
            }}
            title="डिजिटल बडापत्र खोल्नुहोस्"
          >
            <ScrollText size={14} color="#d97706" />
            <span>डिजिटल बडापत्र</span>
          </a>

          {/* EDIT BUTTON (PRIMARY ACTION) */}
          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.5rem 1.15rem',
              borderRadius: '8px',
              backgroundColor: '#0284c7',
              color: '#ffffff',
              border: 'none',
              fontWeight: 800,
              fontSize: '0.84rem',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(2, 132, 199, 0.35)',
              transition: 'all 0.2s',
            }}
          >
            <Edit3 size={15} />
            <span>✏️ पालिका विवरण सम्पादन गर्नुहोस्</span>
          </button>
        </div>
      </div>

      {/* ── 1. GEOGRAPHIC & ADMINISTRATIVE PROFILE CARDS ────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        
        {/* Card 1: चिनारी तथा अवस्थिति */}
        <div className="palika-glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.65rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '9px', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Building2 size={20} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>भौगोलिक तथा प्रशासनिक अवस्थिति</h3>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{district} जिल्ला, {province}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsEditModalOpen(true)}
              title="यो विवरण सम्पादन गर्नुहोस्"
              style={{
                background: 'none',
                border: 'none',
                color: '#0284c7',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '6px',
              }}
            >
              <Edit3 size={16} />
            </button>
          </div>

          <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.7, margin: '0 0 1.25rem' }}>
            {introduction}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
            <div style={{ padding: '0.75rem', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>कुल क्षेत्रफल</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f172a', marginTop: '2px' }}>
                {areaSqKm} <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>व.कि.मि.</span>
              </div>
            </div>
            <div style={{ padding: '0.75rem', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>उचाइ सीमा</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0284c7', marginTop: '2px' }}>
                {elevationMeters}
              </div>
            </div>
            <div style={{ padding: '0.75rem', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>केन्द्र कार्यालय</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#047857', marginTop: '2px' }}>
                {headquarters}
              </div>
            </div>
            <div style={{ padding: '0.75rem', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>वडा संख्या</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#b45309', marginTop: '2px' }}>
                {wardCount} वटा वडाहरू
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: भौगोलिक चौहद्दी (Boundaries) */}
        <div className="palika-glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.65rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '9px', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Compass size={20} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>चार किल्ला सिमाना (Boundaries)</h3>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>आधिकारिक भौगोलिक चौहद्दी विवरण</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsEditModalOpen(true)}
              title="सिमाना सम्पादन गर्नुहोस्"
              style={{
                background: 'none',
                border: 'none',
                color: '#d97706',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '6px',
              }}
            >
              <Edit3 size={16} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
            {[
              { dir: 'पूर्व (East)', target: boundaries.east || 'जुगल गाउँपालिका', badge: 'हिमाली सिमाना', color: '#0284c7' },
              { dir: 'पश्चिम (West)', target: boundaries.west || 'हेलम्बु गाउँपालिका', badge: 'ह्योल्मो सांस्कृतिक क्षेत्र', color: '#059669' },
              { dir: 'उत्तर (North)', target: boundaries.north || 'रसुवा जिल्ला तथा चीनको तिब्बत स्वायत्त क्षेत्र', badge: 'अन्तर्राष्ट्रिय/लाङटाङ सिमाना', color: '#7c3aed' },
              { dir: 'दक्षिण (South)', target: boundaries.south || 'मेलम्ची नगरपालिका', badge: 'सडक तथा बजार पहुँच', color: '#ea580c' },
            ].map((b, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0.95rem', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                  <CheckCircle2 size={16} color={b.color} />
                  <div>
                    <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#64748b' }}>{b.dir}:</span>
                    <strong style={{ display: 'block', fontSize: '0.88rem', color: '#0f172a' }}>{b.target}</strong>
                  </div>
                </div>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#334155' }}>
                  {b.badge}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Card 3: प्राकृतिक तथा सांस्कृतिक धरोहर */}
        <div className="palika-glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.65rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '9px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Mountain size={20} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>प्राकृतिक तथा ऐतिहासिक पहिचान</h3>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>विश्व प्रसिद्ध पाँचपोखरी कुण्ड तथा सम्पदा</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsEditModalOpen(true)}
              title="पहिचान सम्पादन गर्नुहोस्"
              style={{
                background: 'none',
                border: 'none',
                color: '#059669',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '6px',
              }}
            >
              <Edit3 size={16} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.86rem', color: '#475569', lineHeight: 1.6 }}>
            {culturalIdentity.map((item: any, idx: number) => {
              const colors = [
                { bg: '#ecfdf5', border: '#a7f3d0', text: '#065f46', icon: '🌊' },
                { bg: '#eff6ff', border: '#bfdbfe', text: '#1e40af', icon: '🏔️' },
                { bg: '#fdf2f8', border: '#fbcfe8', text: '#9d174d', icon: '🍎' },
              ];
              const c = colors[idx % 3];
              return (
                <div key={idx} style={{ padding: '0.85rem', borderRadius: '10px', background: c.bg, border: `1px solid ${c.border}` }}>
                  <strong style={{ color: c.text, display: 'block', marginBottom: '2px' }}>
                    {item.icon || c.icon} {item.title}:
                  </strong>
                  {item.desc}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── 2. LEADERSHIP & EXECUTIVE MATRIX (LINKED TO REPRESENTATIVES) ───── */}
      <div className="palika-glass-card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={20} className="text-blue-600" />
              गाउँ कार्यपालिका नेतृत्व तथा सम्पर्क म्याट्रिक्स
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
              पालिकाका जनप्रतिनिधि तथा प्रमुख प्रशासनिक पदाधिकारीहरू (जनप्रतिनिधि व्यवस्थापनसँग सिधै आबद्ध)
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Link
              to="/app/representatives"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                backgroundColor: 'rgba(2, 132, 199, 0.1)',
                color: '#0284c7',
                border: '1px solid rgba(2, 132, 199, 0.3)',
                borderRadius: '6px',
                padding: '0.35rem 0.75rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              <Link2 size={13} />
              <span>जनप्रतिनिधि हब खोल्नुहोस्</span>
            </Link>

            <button
              type="button"
              onClick={() => setIsEditModalOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                backgroundColor: '#0f172a',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                padding: '0.35rem 0.85rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <Edit3 size={13} />
              <span>नेतृत्व सम्पादन</span>
            </button>

            <span className="agri-badge agri-badge-success">कार्यकाल: २०७९ - २०८४</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
          {leaders.map((leader: any, idx: number) => (
            <div key={idx} className="palika-leader-card">
              {leader.photoUrl ? (
                <img
                  src={leader.photoUrl}
                  alt={leader.name}
                  className="palika-leader-avatar"
                  style={{ objectFit: 'cover', borderColor: `${leader.color || '#0284c7'}80`, padding: 0 }}
                />
              ) : (
                <div className="palika-leader-avatar" style={{ backgroundColor: `${leader.color || '#0284c7'}15`, color: leader.color || '#0284c7', borderColor: `${leader.color || '#0284c7'}40` }}>
                  {leader.initials || leader.name.slice(0, 2)}
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'inline-block', fontSize: '0.68rem', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', background: `${leader.color || '#0284c7'}15`, color: leader.color || '#0284c7', marginBottom: '2px' }}>
                  {leader.badge || leader.role}
                </div>
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 900, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {leader.name}
                </h4>
                <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '1px' }}>{leader.role || leader.designation}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '6px', fontSize: '0.75rem', color: '#334155' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Phone size={12} color="#64748b" /> {leader.phone || 'उपलब्ध छैन'}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    <Mail size={12} color="#64748b" /> {leader.email || 'उपलब्ध छैन'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: '1.25rem',
            padding: '0.65rem 1rem',
            backgroundColor: '#f8fafc',
            border: '1px dashed #cbd5e1',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.78rem',
            color: '#64748b',
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Link2 size={15} color="#0284c7" />
            <span>
              💡 <strong>एकीकृत तथ्याङ्क नोट:</strong> यहाँ गरिएका कुनै पनि नेतृत्व तथा सम्पर्क परिवर्तनहरू <strong>जनप्रतिनिधि व्यवस्थापन (`/app/representatives`)</strong> प्रणालीमा स्वतः लिङ्क र अद्यावधिक हुन्छन्।
            </span>
          </div>

          <Link
            to="/app/representatives"
            style={{ color: '#0284c7', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
          >
            <span>८ वटै वडाका सम्पूर्ण प्रतिनिधि हेर्नुहोस्</span>
            <ExternalLink size={12} />
          </Link>
        </div>
      </div>

      {/* ── EDIT MODAL ──────────────────────────────────────────────────────── */}
      <PalikaProfileEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialData={profile}
      />
    </div>
  );
};

export default PalikaOverviewTab;
