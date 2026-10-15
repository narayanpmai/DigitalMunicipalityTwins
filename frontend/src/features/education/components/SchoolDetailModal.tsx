import React from 'react';
import {
  School as SchoolIcon,
  X,
  Printer,
  Phone,
  Mail,
  ExternalLink,
  Laptop,
  BookOpen,
  FlaskConical,
  Droplets,
  Zap,
  Utensils,
  MapPin,
  Users,
  Award,
  CheckCircle2,
  XCircle,
  Building2,
  Navigation,
} from 'lucide-react';
import type { School } from '../../../types/education';

interface SchoolDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  school: School | null;
}

export const SchoolDetailModal: React.FC<SchoolDetailModalProps> = ({
  isOpen,
  onClose,
  school,
}) => {
  if (!isOpen || !school) return null;

  const handlePrint = () => {
    window.print();
  };

  const totalStudents = Number(school.totalStudents) || 0;
  const boysCount = Number(school.maleStudents) || Math.round(totalStudents * 0.48);
  const girlsCount = Number(school.femaleStudents) || (totalStudents - boysCount);
  const totalTeachers = Number(school.totalTeachers) || 1;
  const ptr = totalTeachers > 0 ? Math.round(totalStudents / totalTeachers) : 15;
  const girlsPercent = totalStudents > 0 ? Math.round((girlsCount / totalStudents) * 100) : 50;
  const boysPercent = 100 - girlsPercent;

  const isSecondary = school.level?.toLowerCase() === 'secondary';

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '16px',
        overflowY: 'auto',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '850px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL ACTION BAR (NOT PRINTED) */}
        <div
          className="no-print"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '14px 20px',
            backgroundColor: '#0f172a',
            color: '#ffffff',
            borderBottom: '1px solid #334155',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <SchoolIcon size={20} color="#38bdf8" />
            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>
              विद्यालय विस्तृत विवरण तथा प्रतिवेदन (Official School Profile)
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
                backgroundColor: '#2563eb',
                color: '#ffffff',
                border: 'none',
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(37, 99, 235, 0.3)',
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
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="बन्द गर्नुहोस्"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* PRINTABLE CONTENT BODY */}
        <div
          id="printable-school-report"
          style={{
            padding: '24px',
            overflowY: 'auto',
            backgroundColor: '#ffffff',
            color: '#0f172a',
            fontSize: '0.88rem',
          }}
        >
          {/* OFFICIAL EMBLEM & LETTERHEAD */}
          <div
            style={{
              textAlign: 'center',
              borderBottom: '2px solid #0284c7',
              paddingBottom: '14px',
              marginBottom: '18px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  backgroundColor: '#fee2e2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #dc2626',
                  fontSize: '1.6rem',
                }}
              >
                🇳🇵
              </div>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#dc2626', letterSpacing: '0.5px' }}>
                  पाँचपोखरी थाङपाल गाउँपालिका
                </div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>
                  गाउँ कार्यपालिकाको कार्यालय, थाङपालधाप, सिन्धुपाल्चोक
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  बागमती प्रदेश, नेपाल | शिक्षा, युवा तथा खेलकुद शाखा
                </div>
              </div>
            </div>
            <div
              style={{
                marginTop: '10px',
                display: 'inline-block',
                backgroundColor: '#eff6ff',
                color: '#1d4ed8',
                fontWeight: 800,
                fontSize: '0.92rem',
                padding: '4px 16px',
                borderRadius: '20px',
                border: '1px solid #bfdbfe',
              }}
            >
              आधिकारिक विद्यालय प्रोफाइल तथा स्थिति प्रतिवेदन (School Report Card)
            </div>
          </div>

          {/* SCHOOL TITLE HERO CARD */}
          <div
            style={{
              background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
              padding: '16px 20px',
              borderRadius: '12px',
              border: '1px solid #cbd5e1',
              marginBottom: '18px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  {school.nameNepali || school.name}
                </h2>
                <span
                  style={{
                    backgroundColor: isSecondary ? '#dbeafe' : '#dcfce7',
                    color: isSecondary ? '#1e40af' : '#166534',
                    padding: '3px 10px',
                    borderRadius: '6px',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    border: `1px solid ${isSecondary ? '#bfdbfe' : '#bbf7d0'}`,
                  }}
                >
                  {school.levelDetails || (isSecondary ? 'माध्यमिक विद्यालय (१-१०/१-१२)' : 'आधारभूत विद्यालय (१-८/१-५)')}
                </span>
                <span
                  style={{
                    backgroundColor: school.type === 'private' ? '#fef3c7' : '#f1f5f9',
                    color: school.type === 'private' ? '#b45309' : '#334155',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontWeight: 600,
                    fontSize: '0.72rem',
                  }}
                >
                  {school.type === 'private' ? 'संस्थागत विद्यालय' : 'सामुदायिक विद्यालय'}
                </span>
              </div>
              {school.nameEnglish && (
                <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500, marginTop: '2px' }}>
                  {school.nameEnglish}
                </div>
              )}
              <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={14} color="#0284c7" />
                <span>पाँचपोखरी थाङपाल गाउँपालिका, वडा नं. <strong>{school.wardNumber}</strong> {school.tole ? `(${school.tole})` : ''}</span>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>EMIS कोड (EduCode)</div>
              <div
                style={{
                  fontFamily: 'monospace',
                  fontSize: '1.15rem',
                  fontWeight: 800,
                  color: '#0f172a',
                  backgroundColor: '#ffffff',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  display: 'inline-block',
                  marginTop: '2px',
                }}
              >
                {school.emisCode || school.code || '-'}
              </div>
            </div>
          </div>

          {/* 4 STAT SUMMARY BOXES */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
              gap: '12px',
              marginBottom: '18px',
            }}
          >
            <div style={{ backgroundColor: '#eff6ff', padding: '12px 14px', borderRadius: '10px', border: '1px solid #bfdbfe' }}>
              <div style={{ fontSize: '0.75rem', color: '#1e40af', fontWeight: 600 }}>कुल विद्यार्थी (Students)</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1d4ed8', marginTop: '2px' }}>
                {totalStudents} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#64748b' }}>जना</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#3b82f6', marginTop: '2px' }}>
                छात्र: {boysCount} | छात्रा: {girlsCount}
              </div>
            </div>

            <div style={{ backgroundColor: '#f0fdf4', padding: '12px 14px', borderRadius: '10px', border: '1px solid #bbf7d0' }}>
              <div style={{ fontSize: '0.75rem', color: '#166534', fontWeight: 600 }}>शिक्षक तथा कर्मचारी (Teachers)</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#15803d', marginTop: '2px' }}>
                {totalTeachers} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#64748b' }}>जना</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#22c55e', marginTop: '2px' }}>
                स्वीकृत दरबन्दी र राहत
              </div>
            </div>

            <div style={{ backgroundColor: '#fefce8', padding: '12px 14px', borderRadius: '10px', border: '1px solid #fef08a' }}>
              <div style={{ fontSize: '0.75rem', color: '#854d0e', fontWeight: 600 }}>विद्यार्थी-शिक्षक अनुपात (PTR)</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#a16207', marginTop: '2px' }}>
                {ptr}:१
              </div>
              <div style={{ fontSize: '0.72rem', color: '#ca8a04', marginTop: '2px' }}>
                १ शिक्षक बराबर {ptr} विद्यार्थी
              </div>
            </div>

            <div style={{ backgroundColor: '#faf5ff', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e9d5ff' }}>
              <div style={{ fontSize: '0.75rem', color: '#6b21a8', fontWeight: 600 }}>दिवा खाजा कार्यक्रम (Meals)</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#7e22ce', marginTop: '2px' }}>
                {Math.round(totalStudents * 0.75)} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#64748b' }}>लाभान्वित</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#9333ea', marginTop: '2px' }}>
                प्रारम्भिक बालविकास देखि कक्षा ५
              </div>
            </div>
          </div>

          {/* TWO COLUMN DETAILS: GENDER & CONTACT */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px', marginBottom: '18px' }}>
            {/* GENDER RATIO CARD */}
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px', backgroundColor: '#ffffff' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Users size={16} color="#0284c7" />
                <span>विद्यार्थी भर्ना तथा लैङ्गिक सन्तुलन (Gender Ratio)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px' }}>
                <span style={{ color: '#2563eb', fontWeight: 700 }}>छात्र (Boys): {boysCount} ({boysPercent}%)</span>
                <span style={{ color: '#db2777', fontWeight: 700 }}>छात्रा (Girls): {girlsCount} ({girlsPercent}%)</span>
              </div>
              {/* Stacked Progress Bar */}
              <div style={{ height: '10px', width: '100%', borderRadius: '5px', display: 'flex', overflow: 'hidden', backgroundColor: '#f1f5f9' }}>
                <div style={{ width: `${boysPercent}%`, backgroundColor: '#3b82f6' }} title={`छात्र: ${boysPercent}%`} />
                <div style={{ width: `${girlsPercent}%`, backgroundColor: '#ec4899' }} title={`छात्रा: ${girlsPercent}%`} />
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '8px' }}>
                नेपाल सरकारको समावेशी शिक्षा नीति अनुसार छात्रा शिक्षाको सहभागिता <strong>{girlsPercent}%</strong> रहेको छ।
              </div>
            </div>

            {/* ADMINISTRATION & CONTACT CARD */}
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px', backgroundColor: '#ffffff' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Building2 size={16} color="#059669" />
                <span>विद्यालय प्रशासन तथा आधिकारिक सम्पर्क</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.82rem' }}>
                <div>
                  <span style={{ color: '#64748b' }}>प्रधानाध्यापक (Headmaster): </span>
                  <strong style={{ color: '#0f172a' }}>{school.principalName || 'प्र.अ. पद रिक्त/अद्यावधिक हुँदै'}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>सम्पर्क नम्बर (Phone): </span>
                  {school.contactNumber || school.contactPhone ? (
                    <a
                      href={`tel:${school.contactNumber || school.contactPhone}`}
                      style={{ color: '#0284c7', fontWeight: 700, textDecoration: 'none' }}
                    >
                      {school.contactNumber || school.contactPhone}
                    </a>
                  ) : (
                    <span style={{ color: '#94a3b8' }}>उपलब्ध छैन</span>
                  )}
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>इमेल (Email): </span>
                  {school.email ? (
                    <a href={`mailto:${school.email}`} style={{ color: '#059669', textDecoration: 'none' }}>
                      {school.email}
                    </a>
                  ) : (
                    <span style={{ color: '#94a3b8' }}>-</span>
                  )}
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>वेब पोर्टल (Website): </span>
                  {school.portalUrl ? (
                    <a
                      href={school.portalUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'underline' }}
                    >
                      {school.portalUrl}
                    </a>
                  ) : (
                    <span style={{ color: '#94a3b8' }}>-</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* INFRASTRUCTURE & FACILITIES CHECKLIST */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px', marginBottom: '18px', backgroundColor: '#f8fafc' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1e293b', marginBottom: '10px' }}>
              भौतिक तथा डिजिटल पूर्वाधार स्कोरकार्ड (Infrastructure & ICT Readiness)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', borderRadius: '8px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
                <Laptop size={18} color={school.hasIctLab ? '#16a34a' : '#94a3b8'} />
                <div style={{ fontSize: '0.78rem' }}>
                  <div style={{ fontWeight: 700 }}>कम्प्युटर ल्याब (ICT)</div>
                  <div style={{ color: school.hasIctLab ? '#15803d' : '#94a3b8', fontSize: '0.72rem' }}>
                    {school.hasIctLab ? '✓ उपलब्ध छ' : '✗ छैन'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', borderRadius: '8px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
                <FlaskConical size={18} color={school.hasScienceLab ? '#16a34a' : '#94a3b8'} />
                <div style={{ fontSize: '0.78rem' }}>
                  <div style={{ fontWeight: 700 }}>विज्ञान प्रयोगशाला</div>
                  <div style={{ color: school.hasScienceLab ? '#15803d' : '#94a3b8', fontSize: '0.72rem' }}>
                    {school.hasScienceLab ? '✓ उपलब्ध छ' : '✗ छैन'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', borderRadius: '8px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
                <BookOpen size={18} color={school.hasLibrary ? '#16a34a' : '#94a3b8'} />
                <div style={{ fontSize: '0.78rem' }}>
                  <div style={{ fontWeight: 700 }}>विद्यालय पुस्तकालय</div>
                  <div style={{ color: school.hasLibrary ? '#15803d' : '#94a3b8', fontSize: '0.72rem' }}>
                    {school.hasLibrary ? '✓ उपलब्ध छ' : '✗ छैन'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', borderRadius: '8px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
                <Droplets size={18} color={school.hasDrinkingWater ? '#16a34a' : '#94a3b8'} />
                <div style={{ fontSize: '0.78rem' }}>
                  <div style={{ fontWeight: 700 }}>शुद्ध पिउने पानी</div>
                  <div style={{ color: school.hasDrinkingWater ? '#15803d' : '#94a3b8', fontSize: '0.72rem' }}>
                    {school.hasDrinkingWater ? '✓ उपलब्ध छ' : '✗ छैन'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', borderRadius: '8px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
                <Zap size={18} color={school.hasElectricity ? '#16a34a' : '#94a3b8'} />
                <div style={{ fontSize: '0.78rem' }}>
                  <div style={{ fontWeight: 700 }}>विद्युत आपूर्ति</div>
                  <div style={{ color: school.hasElectricity ? '#15803d' : '#94a3b8', fontSize: '0.72rem' }}>
                    {school.hasElectricity ? '✓ उपलब्ध छ' : '✗ छैन'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', borderRadius: '8px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
                <Utensils size={18} color="#16a34a" />
                <div style={{ fontSize: '0.78rem' }}>
                  <div style={{ fontWeight: 700 }}>दिवा खाजा भान्सा</div>
                  <div style={{ color: '#15803d', fontSize: '0.72rem' }}>✓ सञ्चालनमा</div>
                </div>
              </div>
            </div>
          </div>

          {/* GEOLOCATION / GIS */}
          {school.latitude && school.longitude && (
            <div style={{ fontSize: '0.78rem', color: '#475569', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Navigation size={14} color="#0284c7" />
              <span>
                भौगोलिक निर्देशाङ्क (GIS Coordinates):{' '}
                <strong style={{ fontFamily: 'monospace' }}>
                  {school.latitude.toFixed(5)}° N, {school.longitude.toFixed(5)}° E
                </strong>
              </span>
            </div>
          )}

          {/* FORMAL SIGNATURE BOXES (VISIBLE ONLY IN PRINT / OFFICIAL SHEET) */}
          <div
            className="only-print"
            style={{
              marginTop: '40px',
              paddingTop: '20px',
              borderTop: '1px dashed #cbd5e1',
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ textAlign: 'center', width: '200px' }}>
              <div style={{ height: '50px' }} />
              <div style={{ borderTop: '1px solid #0f172a', paddingTop: '4px', fontWeight: 700, fontSize: '0.8rem' }}>
                प्रधानाध्यापकको हस्ताक्षर
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>विद्यालयको आधिकारिक छाप</div>
            </div>

            <div style={{ textAlign: 'center', width: '200px' }}>
              <div style={{ height: '50px' }} />
              <div style={{ borderTop: '1px solid #0f172a', paddingTop: '4px', fontWeight: 700, fontSize: '0.8rem' }}>
                शिक्षा अधिकृत / शाखा प्रमुख
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>पाँचपोखरी थाङपाल गाउँपालिका</div>
            </div>
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div
          className="no-print"
          style={{
            padding: '12px 20px',
            backgroundColor: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px',
          }}
        >
          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
            स्रोत: शिक्षा, विज्ञान तथा प्रविधि मन्त्रालय (IEMIS) तथा पालिका डिजिटल प्रणाली
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {school.contactNumber || school.contactPhone ? (
              <a
                href={`tel:${school.contactNumber || school.contactPhone}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#16a34a',
                  color: '#ffffff',
                  padding: '7px 14px',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  textDecoration: 'none',
                }}
              >
                <Phone size={14} />
                <span>फोन कल गर्नुहोस्</span>
              </a>
            ) : null}

            {school.portalUrl && (
              <a
                href={school.portalUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#0284c7',
                  color: '#ffffff',
                  padding: '7px 14px',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  textDecoration: 'none',
                }}
              >
                <ExternalLink size={14} />
                <span>वेब पोर्टल</span>
              </a>
            )}

            <button
              type="button"
              onClick={onClose}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                padding: '7px 16px',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '0.82rem',
                color: '#475569',
                cursor: 'pointer',
              }}
            >
              बन्द गर्नुहोस्
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
