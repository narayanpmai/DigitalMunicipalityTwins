import React, { useState, useEffect } from 'react';
import { useTenant } from '../../context/TenantContext';
import {
  Building2,
  Settings,
  Image as ImageIcon,
  Save,
  CheckCircle2,
  Phone,
  Mail,
  Globe,
  MapPin,
  Calendar,
  AlertTriangle,
  Upload,
  RefreshCw,
  ShieldCheck,
  Building,
  Layers,
  HeartPulse,
  Flame,
  Shield,
  LifeBuoy,
} from 'lucide-react';
import { toNepaliDigits } from '../../utils/nepaliCalendar';

export const PalikaSettingsPage: React.FC = () => {
  const { settings, updateSettings, reloadSettings } = useTenant();
  const [activeTab, setActiveTab] = useState<'branding' | 'contact' | 'emergency' | 'system'>('branding');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Form State initialized from TenantContext settings
  const [form, setForm] = useState({
    palika_name: '',
    palika_name_en: '',
    slogan: '',
    logo_url: '',
    emblem_url: '',
    province: '',
    district: '',
    headquarters: '',
    total_wards: '8',
    address: '',
    phone: '',
    fax: '',
    email: '',
    website: '',
    active_fiscal_year: '२०८१/०८२',
    chief_officer_title: 'प्रमुख प्रशासकीय अधिकृत',
    emergency_ambulance: '',
    emergency_police: '',
    emergency_fire: '',
    emergency_disaster: '',
    panoramaUrl: '',
  });

  useEffect(() => {
    if (settings) {
      setForm({
        palika_name: settings.palika_name || 'पाँचपोखरी थाङपाल गाउँपालिका',
        palika_name_en: (settings.palika_name_en as string) || 'Panchpokhari Thangpal Rural Municipality',
        slogan: settings.slogan || 'आधुनिक, सुशासनयुक्त र समृद्ध पालिका',
        logo_url: settings.logo_url || 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Emblem_of_Nepal.svg/240px-Emblem_of_Nepal.svg.png',
        emblem_url: (settings.emblem_url as string) || 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Emblem_of_Nepal.svg/240px-Emblem_of_Nepal.svg.png',
        province: settings.province || 'बागमती प्रदेश',
        district: settings.district || 'सिन्धुपाल्चोक',
        headquarters: (settings.headquarters as string) || 'थाङपालधाप, मानेखर्क',
        total_wards: String(settings.total_wards || 8),
        address: settings.address || 'गाउँ कार्यपालिकाको कार्यालय, थाङपालधाप, सिन्धुपाल्चोक',
        phone: settings.phone || '०११-६९०१२३',
        fax: (settings.fax as string) || '०११-६९०१२४',
        email: settings.email || 'info@panchpokharimun.gov.np',
        website: settings.website || 'https://panchpokharimun.gov.np',
        active_fiscal_year: (settings.active_fiscal_year as string) || '२०८१/०८२',
        chief_officer_title: (settings.chief_officer_title as string) || 'प्रमुख प्रशासकीय अधिकृत',
        emergency_ambulance: (settings.emergency_ambulance as string) || '१०२ / ९८५११००१०२',
        emergency_police: (settings.emergency_police as string) || '१०० / ९८५११००१००',
        emergency_fire: (settings.emergency_fire as string) || '१०१',
        emergency_disaster: (settings.emergency_disaster as string) || '११४४',
        panoramaUrl: (settings.panoramaUrl as string) || '',
      });
    }
  }, [settings]);

  // Handle Local File Upload to Base64
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'logo_url' | 'emblem_url') => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('फाइलको आकार २ MB भन्दा कम हुनुपर्छ।');
        e.target.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm((prev) => ({ ...prev, [field]: reader.result as string }));
        e.target.value = '';
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError('');
    setSaveSuccess(false);

    try {
      const updates: Record<string, string> = {
        palika_name: form.palika_name.trim(),
        palika_name_en: form.palika_name_en.trim(),
        slogan: form.slogan.trim(),
        logo_url: form.logo_url.trim(),
        emblem_url: form.emblem_url.trim(),
        province: form.province.trim(),
        district: form.district.trim(),
        headquarters: form.headquarters.trim(),
        total_wards: form.total_wards.trim(),
        address: form.address.trim(),
        phone: form.phone.trim(),
        fax: form.fax.trim(),
        email: form.email.trim(),
        website: form.website.trim(),
        active_fiscal_year: form.active_fiscal_year.trim(),
        chief_officer_title: form.chief_officer_title.trim(),
        emergency_ambulance: form.emergency_ambulance.trim(),
        emergency_police: form.emergency_police.trim(),
        emergency_fire: form.emergency_fire.trim(),
        emergency_disaster: form.emergency_disaster.trim(),
        panoramaUrl: form.panoramaUrl.trim(),
      };

      const success = await updateSettings(updates);
      if (success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
      } else {
        setSaveError('सेटिङ सुरक्षित गर्न सकिएन। कृपया पुनः प्रयास गर्नुहोस्।');
      }
    } catch {
      setSaveError('प्रणालीमा समस्या देखा पर्यो।');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', paddingBottom: '3rem' }}>
      {/* ─── PAGE HEADER & BRANDING SUMMARY ─── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #065f46 0%, #059669 60%, #10b981 100%)',
          borderRadius: '20px',
          padding: '2rem 2.25rem',
          color: '#ffffff',
          boxShadow: '0 10px 25px -5px rgba(5, 150, 105, 0.25)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          {/* Active Logo Avatar */}
          <div
            style={{
              width: '68px',
              height: '68px',
              borderRadius: '16px',
              backgroundColor: '#ffffff',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
              flexShrink: 0,
            }}
          >
            {form.logo_url ? (
              <img src={form.logo_url} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            ) : (
              <Building2 size={36} color="#059669" />
            )}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ backgroundColor: 'rgba(255,255,255,0.22)', padding: '2px 10px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 800 }}>
                🇳🇵 नेपाल सरकार स्थानीय तह प्रणाली
              </span>
              <span style={{ backgroundColor: 'rgba(255,255,255,0.22)', padding: '2px 10px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 700 }}>
                चालू आ.व.: {toNepaliDigits(form.active_fiscal_year)}
              </span>
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 900, margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>
              {form.palika_name || 'पालिका सेटिङ तथा लोगो व्यवस्थापन'}
            </h1>
            <p style={{ fontSize: '0.88rem', opacity: 0.92, margin: 0 }}>
              {form.slogan || 'पालिकाको सम्पूर्ण पहिचान, आधिकारिक लोगो, सम्पर्क विवरण र प्रणाली कन्फिगरेसन'}
            </p>
          </div>
        </div>

        {/* Action Button Header */}
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            type="button"
            onClick={reloadSettings}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.65rem 1.15rem',
              borderRadius: '10px',
              backgroundColor: 'rgba(255,255,255,0.18)',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.85rem',
              border: '1px solid rgba(255,255,255,0.3)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            title="रिफ्रेस गर्नुहोस्"
          >
            <RefreshCw size={15} />
            <span>रिफ्रेस</span>
          </button>
        </div>
      </div>

      {/* ─── SUCCESS / ERROR ALERTS ─── */}
      {saveSuccess && (
        <div
          style={{
            backgroundColor: '#f0fdf4',
            border: '1.5px solid #86efac',
            color: '#166534',
            padding: '1rem 1.25rem',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.92rem',
            fontWeight: 700,
            boxShadow: '0 4px 12px rgba(22, 163, 74, 0.1)',
          }}
        >
          <CheckCircle2 size={20} color="#16a34a" />
          <span>पालिकाको सेटिङ तथा लोगो सफलतापूर्वक सुरक्षित गरियो! माथिल्लो हेडर र लेटरहेडमा नयाँ विवरण अद्यावधिक भइसकेको छ।</span>
        </div>
      )}

      {saveError && (
        <div
          style={{
            backgroundColor: '#fef2f2',
            border: '1.5px solid #fca5a5',
            color: '#991b1b',
            padding: '1rem 1.25rem',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.92rem',
            fontWeight: 700,
          }}
        >
          <AlertTriangle size={20} color="#dc2626" />
          <span>{saveError}</span>
        </div>
      )}

      {/* ─── FORM CONTAINER ─── */}
      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* ─── 4 EXECUTIVE NAVIGATION TABS (Responsive Card Grid) ─── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '0.85rem',
            marginBottom: '0.25rem',
          }}
        >
          {[
            {
              id: 'branding',
              title: '१. पहिचान तथा लोगो',
              subtitle: 'पालिका नाम, निशाना छाप र आधिकारिक लोगो',
              icon: <ImageIcon size={20} />,
              badge: 'Letterhead & Logo',
            },
            {
              id: 'contact',
              title: '२. सम्पर्क तथा ठेगाना',
              subtitle: 'कार्यालय ठेगाना, फोन, फ्याक्स र इमेल',
              icon: <Building size={20} />,
              badge: 'Office Info',
            },
            {
              id: 'emergency',
              title: '३. आपतकालीन निर्देशिका',
              subtitle: 'प्रहरी, अस्पताल, एम्बुलेन्स र दमकल',
              icon: <LifeBuoy size={20} />,
              badge: 'SOS Directory',
            },
            {
              id: 'system',
              title: '४. आर्थिक वर्ष तथा प्राथमिकता',
              subtitle: 'सक्रिय आ.व., वडा संख्या र सार्वजनिक पोर्टल',
              icon: <Calendar size={20} />,
              badge: 'Fiscal & Portal',
            },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  padding: '0.85rem 1.15rem',
                  borderRadius: '14px',
                  border: isActive ? '1.5px solid #059669' : '1.5px solid #e2e8f0',
                  background: isActive
                    ? 'linear-gradient(135deg, #065f46 0%, #059669 100%)'
                    : '#ffffff',
                  color: isActive ? '#ffffff' : '#1e293b',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.85rem',
                  boxShadow: isActive
                    ? '0 6px 20px -4px rgba(5, 150, 105, 0.35)'
                    : '0 2px 6px rgba(0,0,0,0.03)',
                  transition: 'all 0.18s ease',
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: isActive ? 'rgba(255,255,255,0.2)' : '#ecfdf5',
                    color: isActive ? '#ffffff' : '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {tab.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.4rem' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {tab.title}
                    </div>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        padding: '2px 7px',
                        borderRadius: '10px',
                        background: isActive ? 'rgba(255,255,255,0.25)' : '#d1fae5',
                        color: isActive ? '#ffffff' : '#065f46',
                        flexShrink: 0,
                      }}
                    >
                      {tab.badge}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.73rem', opacity: isActive ? 0.9 : 0.65, marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {tab.subtitle}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* ─── TAB 1: BRANDING & LOGO ─── */}
        {activeTab === 'branding' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
            {/* Left Box: Basic Branding Inputs */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem', boxShadow: '0 4px 15px rgba(15, 23, 42, 0.04)' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1e293b', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building2 size={18} color="#059669" />
                <span>पालिका आधारभूत विवरण तथा पहिचान</span>
              </h3>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  पालिकाको आधिकारिक नाम (नेपाली) *
                </label>
                <input
                  className="dt-input"
                  value={form.palika_name}
                  onChange={(e) => setForm({ ...form, palika_name: e.target.value })}
                  required
                  style={{ height: '38px', fontSize: '0.92rem', fontWeight: 700 }}
                  placeholder="उदा. पाँचपोखरी थाङपाल गाउँपालिका"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  पालिकाको नाम (अङ्ग्रेजी - English Name)
                </label>
                <input
                  className="dt-input"
                  value={form.palika_name_en}
                  onChange={(e) => setForm({ ...form, palika_name_en: e.target.value })}
                  style={{ height: '38px', fontSize: '0.88rem' }}
                  placeholder="e.g. Panchpokhari Thangpal Rural Municipality"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  आदर्श वाक्य / नारा (Slogan)
                </label>
                <input
                  className="dt-input"
                  value={form.slogan}
                  onChange={(e) => setForm({ ...form, slogan: e.target.value })}
                  style={{ height: '38px', fontSize: '0.88rem' }}
                  placeholder="उदा. आधुनिक, सुशासनयुक्त र समृद्ध पालिका"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    प्रदेश (Province)
                  </label>
                  <input
                    className="dt-input"
                    value={form.province}
                    onChange={(e) => setForm({ ...form, province: e.target.value })}
                    style={{ height: '36px', fontSize: '0.86rem' }}
                    placeholder="उदा. बागमती प्रदेश"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    जिल्ला (District)
                  </label>
                  <input
                    className="dt-input"
                    value={form.district}
                    onChange={(e) => setForm({ ...form, district: e.target.value })}
                    style={{ height: '36px', fontSize: '0.86rem' }}
                    placeholder="उदा. सिन्धुपाल्चोक"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    केन्द्र / सदरमुकाम (Headquarters)
                  </label>
                  <input
                    className="dt-input"
                    value={form.headquarters}
                    onChange={(e) => setForm({ ...form, headquarters: e.target.value })}
                    style={{ height: '36px', fontSize: '0.86rem' }}
                    placeholder="उदा. थाङपालधाप, मानेखर्क"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    कुल वडा संख्या
                  </label>
                  <input
                    type="text"
                    className="dt-input"
                    value={form.total_wards}
                    onChange={(e) => setForm({ ...form, total_wards: toNepaliDigits(e.target.value) })}
                    style={{ height: '36px', fontSize: '0.86rem', textAlign: 'center', fontWeight: 700 }}
                    placeholder="८"
                  />
                </div>
              </div>
            </div>

            {/* Right Box: Logo & Emblem Upload & Live Preview */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Card 1: Official Logo */}
              <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.5rem', boxShadow: '0 4px 15px rgba(15, 23, 42, 0.04)' }}>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ImageIcon size={18} color="#2563eb" />
                  <span>पालिकाको आधिकारिक लोगो (Palika Logo)</span>
                </div>

                <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', marginBottom: '1rem' }}>
                  <div
                    style={{
                      width: '84px',
                      height: '84px',
                      borderRadius: '16px',
                      border: '2px dashed #cbd5e1',
                      padding: '6px',
                      backgroundColor: '#f8fafc',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {form.logo_url ? (
                      <img src={form.logo_url} alt="Logo Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    ) : (
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8', textAlign: 'center' }}>लोगो छैन</span>
                    )}
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label
                      htmlFor="palika-logo-upload"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        backgroundColor: '#eff6ff',
                        color: '#1d4ed8',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        border: '1px solid #bfdbfe',
                        cursor: 'pointer',
                        width: 'fit-content',
                      }}
                    >
                      <Upload size={14} />
                      <span>कम्प्युटरबाट नयाँ लोगो अपलोड गर्नुहोस्</span>
                      <input
                        id="palika-logo-upload"
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleLogoUpload(e, 'logo_url')}
                        style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 }}
                      />
                    </label>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                      PNG, JPG, वा WebP ढाँचा (अधिकतम २ MB)
                    </span>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '3px' }}>
                    वा लोगोको वेब लिङ्क (Image URL):
                  </label>
                  <input
                    className="dt-input"
                    value={form.logo_url.startsWith('data:image/') ? `[Base64 Image Data - ${Math.round(form.logo_url.length / 1024)} KB]` : form.logo_url}
                    onChange={(e) => {
                      if (e.target.value.startsWith('[Base64 Image Data')) {
                        setForm({ ...form, logo_url: '' });
                      } else {
                        setForm({ ...form, logo_url: e.target.value });
                      }
                    }}
                    style={{ height: '34px', fontSize: '0.82rem' }}
                    placeholder="https://.../logo.png"
                  />
                </div>
              </div>

              {/* Card 2: Government Emblem */}
              <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.5rem', boxShadow: '0 4px 15px rgba(15, 23, 42, 0.04)' }}>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={18} color="#b91c1c" />
                  <span>नेपाल सरकारको निशाना छाप (Government Emblem)</span>
                </div>

                <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', marginBottom: '1rem' }}>
                  <div
                    style={{
                      width: '74px',
                      height: '74px',
                      borderRadius: '14px',
                      border: '2px dashed #cbd5e1',
                      padding: '4px',
                      backgroundColor: '#f8fafc',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {form.emblem_url ? (
                      <img src={form.emblem_url} alt="Emblem Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    ) : (
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>छाप छैन</span>
                    )}
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label
                      htmlFor="palika-emblem-upload"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        backgroundColor: '#fef2f2',
                        color: '#b91c1c',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        border: '1px solid #fecaca',
                        cursor: 'pointer',
                        width: 'fit-content',
                      }}
                    >
                      <Upload size={14} />
                      <span>निशाना छाप अपलोड गर्नुहोस्</span>
                      <input
                        id="palika-emblem-upload"
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleLogoUpload(e, 'emblem_url')}
                        style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 }}
                      />
                    </label>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                      आधिकारिक लेटरहेड तथा पावतीमा प्रयोग हुने छाप
                    </span>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '3px' }}>
                    निशाना छापको वेब लिङ्क (Image URL):
                  </label>
                  <input
                    className="dt-input"
                    value={form.emblem_url.startsWith('data:image/') ? `[Base64 Image Data - ${Math.round(form.emblem_url.length / 1024)} KB]` : form.emblem_url}
                    onChange={(e) => {
                      if (e.target.value.startsWith('[Base64 Image Data')) {
                        setForm({ ...form, emblem_url: '' });
                      } else {
                        setForm({ ...form, emblem_url: e.target.value });
                      }
                    }}
                    style={{ height: '34px', fontSize: '0.82rem' }}
                    placeholder="https://.../emblem.png"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 2: CONTACT & OFFICE DETAILS ─── */}
        {activeTab === 'contact' && (
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.75rem', boxShadow: '0 4px 15px rgba(15, 23, 42, 0.04)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building size={18} color="#059669" />
              <span>कार्यालय सम्पर्क, ठेगाना तथा डिजिटल पोर्टल विवरण</span>
            </h3>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                मुख्य कार्यालयको पूर्ण ठेगाना (Office Address) *
              </label>
              <input
                className="dt-input"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                required
                style={{ height: '38px', fontSize: '0.9rem' }}
                placeholder="उदा. गाउँ कार्यपालिकाको कार्यालय, थाङपालधाप, सिन्धुपाल्चोक"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  आधिकारिक टेलिफोन नं. (Phone) *
                </label>
                <input
                  className="dt-input"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  required
                  style={{ height: '38px', fontSize: '0.88rem' }}
                  placeholder="०११-६९०१२३"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  फ्याक्स नं. (Fax)
                </label>
                <input
                  className="dt-input"
                  value={form.fax}
                  onChange={(e) => setForm({ ...form, fax: e.target.value })}
                  style={{ height: '38px', fontSize: '0.88rem' }}
                  placeholder="०११-६९०१२४"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  आधिकारिक ईमेल ठेगाना (Official Email) *
                </label>
                <input
                  type="email"
                  className="dt-input"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  style={{ height: '38px', fontSize: '0.88rem' }}
                  placeholder="info@panchpokharimun.gov.np"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  आधिकारिक वेबसाइट URL (Website)
                </label>
                <input
                  type="url"
                  className="dt-input"
                  value={form.website}
                  onChange={(e) => setForm({ ...form, website: e.target.value })}
                  style={{ height: '38px', fontSize: '0.88rem' }}
                  placeholder="https://panchpokharimun.gov.np"
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                प्रशासकीय भवनको ३६० डिग्री भ्यु लिङ्क (360° Panorama URL)
              </label>
              <input
                className="dt-input"
                value={form.panoramaUrl}
                onChange={(e) => setForm({ ...form, panoramaUrl: e.target.value })}
                style={{ height: '38px', fontSize: '0.88rem' }}
                placeholder="उदा. https://kuula.co/share/..."
              />
              <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px', display: 'block' }}>
                यो लिङ्क पालिकाको पब्लिक प्रोफाइलमा प्रशासकीय भवनको ३६० डिग्री भ्यु देखाउन प्रयोग हुन्छ।
              </span>
            </div>
          </div>
        )}

        {/* ─── TAB 3: EMERGENCY DIRECTORY ─── */}
        {activeTab === 'emergency' && (
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.75rem', boxShadow: '0 4px 15px rgba(15, 23, 42, 0.04)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1e293b', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <LifeBuoy size={18} color="#b91c1c" />
                <span>पालिका आकस्मिक सेवा निर्देशिका (Emergency Helplines)</span>
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>
                नागरिक पोर्टल, बडापत्र र सार्वजनिक सूचनाहरूमा तत्काल उपलब्ध हुने हटलाइन नम्बरहरू
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  <HeartPulse size={15} color="#dc2626" />
                  <span>एम्बुलेन्स सेवा (Ambulance Helpline)</span>
                </label>
                <input
                  className="dt-input"
                  value={form.emergency_ambulance}
                  onChange={(e) => setForm({ ...form, emergency_ambulance: e.target.value })}
                  style={{ height: '38px', fontSize: '0.88rem' }}
                  placeholder="उदा. १०२ / ९८५११००१०२"
                />
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  <Shield size={15} color="#2563eb" />
                  <span>नेपाल प्रहरी / नगर प्रहरी (Police Helpline)</span>
                </label>
                <input
                  className="dt-input"
                  value={form.emergency_police}
                  onChange={(e) => setForm({ ...form, emergency_police: e.target.value })}
                  style={{ height: '38px', fontSize: '0.88rem' }}
                  placeholder="उदा. १०० / ९८५११००१००"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  <Flame size={15} color="#d97706" />
                  <span>दमकल / वारुण यन्त्र (Fire Brigade)</span>
                </label>
                <input
                  className="dt-input"
                  value={form.emergency_fire}
                  onChange={(e) => setForm({ ...form, emergency_fire: e.target.value })}
                  style={{ height: '38px', fontSize: '0.88rem' }}
                  placeholder="उदा. १०१"
                />
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  <AlertTriangle size={15} color="#b45309" />
                  <span>विपद् व्यवस्थापन नियन्त्रण कक्ष (Disaster Control Room)</span>
                </label>
                <input
                  className="dt-input"
                  value={form.emergency_disaster}
                  onChange={(e) => setForm({ ...form, emergency_disaster: e.target.value })}
                  style={{ height: '38px', fontSize: '0.88rem' }}
                  placeholder="उदा. ११४४"
                />
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 4: FISCAL YEAR & PREFERENCES ─── */}
        {activeTab === 'system' && (
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.75rem', boxShadow: '0 4px 15px rgba(15, 23, 42, 0.04)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={18} color="#059669" />
              <span>आर्थिक वर्ष तथा प्रशासनिक प्राथमिकता सेटिङ</span>
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  चालू सक्रिय आर्थिक वर्ष (Active Fiscal Year) *
                </label>
                <select
                  className="dt-select"
                  value={form.active_fiscal_year}
                  onChange={(e) => setForm({ ...form, active_fiscal_year: e.target.value })}
                  style={{ height: '38px', fontSize: '0.9rem', fontWeight: 700 }}
                >
                  <option value="२०८०/०८१">२०८०/०८१</option>
                  <option value="२०८१/०८२">२०८१/०८२ (हाल सक्रिय)</option>
                  <option value="२०८२/०८३">२०८२/०८३</option>
                  <option value="२०८३/०८४">२०८३/०८४</option>
                </select>
                <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px', display: 'block' }}>
                  दर्ता, चलानी र योजना कार्यक्रमहरूमा यही आर्थिक वर्ष स्वतः प्रयोग हुनेछ।
                </span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  पावती तथा पत्रमा मुख्य हस्ताक्षरकर्ता पद *
                </label>
                <input
                  className="dt-input"
                  value={form.chief_officer_title}
                  onChange={(e) => setForm({ ...form, chief_officer_title: e.target.value })}
                  style={{ height: '38px', fontSize: '0.88rem' }}
                  placeholder="उदा. प्रमुख प्रशासकीय अधिकृत"
                />
              </div>
            </div>
          </div>
        )}

        {/* ─── BOTTOM SAVE ACTION BAR ─── */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '14px',
            padding: '1rem 1.5rem',
            border: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 4px 15px rgba(15, 23, 42, 0.04)',
          }}
        >
          <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
            परिवर्तनहरू सुरक्षित गरेपछि सम्पूर्ण पोर्टलमा तुरुन्त नयाँ लोगो र नाम प्रतिबिम्बित हुनेछ।
          </div>

          <button
            type="submit"
            disabled={isSaving}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '0.75rem 2rem',
              borderRadius: '10px',
              backgroundColor: '#059669',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '0.95rem',
              border: 'none',
              cursor: isSaving ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 14px rgba(5, 150, 105, 0.3)',
              transition: 'all 0.2s ease',
            }}
          >
            <Save size={18} />
            <span>{isSaving ? 'सुरक्षित गरिँदैछ...' : 'परिवर्तन सुरक्षित गर्नुहोस् (Save Settings)'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default PalikaSettingsPage;
