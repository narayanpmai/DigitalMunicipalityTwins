import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Building2,
  Compass,
  Mountain,
  Users,
  TrendingUp,
  X,
  Save,
  CheckCircle2,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  Link2
} from 'lucide-react';
import { municipalityApi } from '../../../api/municipality';
import { MunicipalityProfile } from '../../../types/profile';

interface PalikaProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: MunicipalityProfile;
}

export const PalikaProfileEditModal: React.FC<PalikaProfileEditModalProps> = ({
  isOpen,
  onClose,
  initialData
}) => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'admin' | 'boundaries' | 'heritage' | 'leadership' | 'stats'>('admin');

  const [formData, setFormData] = useState({
    nameNp: 'पाँचपोखरी थाङपाल गाउँपालिका',
    nameEn: 'Panchpokhari Thangpal Rural Municipality',
    district: 'सिन्धुपाल्चोक',
    province: 'बागमती प्रदेश',
    headquarters: 'थाङपालधाप',
    areaSqKm: 187.29,
    wardCount: 8,
    elevationMeters: '१,१०० - ४,१०० मी.',
    introduction: 'पाँचपोखरी थाङपाल गाउँपालिका नेपालको बागमती प्रदेश अन्तर्गत सिन्धुपाल्चोक जिल्लाको उत्तर-पश्चिम भेगमा अवस्थित उच्च हिमाली तथा पहाडी भू-भाग ओगटेको एक प्राकृतिक, पर्यटकीय तथा सांस्कृतिक सम्पदाले भरिपूर्ण पालिका हो। यसको केन्द्र थाङपालधापमा अवस्थित छ।',
    eastBoundary: 'जुगल गाउँपालिका',
    westBoundary: 'हेलम्बु गाउँपालिका',
    northBoundary: 'रसुवा जिल्ला तथा चीनको तिब्बत स्वायत्त क्षेत्र',
    southBoundary: 'मेलम्ची नगरपालिका',
    // Heritage 1: Lake
    lakeTitle: 'पवित्र पाँचपोखरी कुण्ड (४,१०० मी.)',
    lakeDesc: 'विश्वकै ९औँ उच्च स्थानमा रहेको रामसार सिमसार क्षेत्र, जहाँ जनैपूर्णिमाका दिन विशाल धार्मिक मेला लाग्दछ।',
    // Heritage 2: Culture
    cultureTitle: 'आमा याङ्ग्री तथा ह्योल्मो संस्कृति',
    cultureDesc: 'ह्योल्मो, तामाङ र नेवार जातिको मौलिक संस्कृति, परम्परागत गुम्बा, माने र पदमार्ग पर्यटनको केन्द्रबिन्दु।',
    // Heritage 3: Agri
    agriTitle: 'अर्गानिक कृषि तथा ट्राउट मत्स्य',
    agriDesc: 'हिमाली रातो आलु, किवी फल, अर्गानिक अलैंची, रेन्बो ट्राउट र चौँरी घ्यूको प्रसिद्ध उद्गम स्थल।',
    // Leadership
    mayorName: 'टासी लामा ह्योल्मो',
    mayorPhone: '९८५११२३४५०',
    mayorEmail: 'chairperson@panchpokharimun.gov.np',
    deputyMayorName: 'सुनिता अधिकारी',
    deputyMayorPhone: '९८५११२३४५१',
    deputyMayorEmail: 'vicechair@panchpokharimun.gov.np',
    caoName: 'कृष्णप्रसाद सापकोटा',
    caoPhone: '९८५११२३४५२',
    caoEmail: 'cao@panchpokharimun.gov.np',
    spokespersonName: 'निमा दोर्जे तामाङ',
    spokespersonRole: 'प्रवक्ता तथा वडा अध्यक्ष (वडा ३)',
    spokespersonPhone: '९८४१००११०३',
    spokespersonEmail: 'spokesperson@panchpokharimun.gov.np',
    // Stats
    totalPopulation: 20540,
    totalHouseholds: 5805,
    annualBudget: 'रु. ५८.४५ करोड',
    internalRevenue: 'रु. २.८ करोड',
  });

  useEffect(() => {
    if (isOpen && initialData) {
      const b = initialData.boundaries || {} as any;
      const ci = initialData.culturalIdentity || [];
      const l = initialData.leadership || {} as any;
      const leaders = initialData.leaders || [];

      setFormData({
        nameNp: initialData.nameNp || initialData.name || 'पाँचपोखरी थाङपाल गाउँपालिका',
        nameEn: initialData.nameEn || 'Panchpokhari Thangpal Rural Municipality',
        district: initialData.district || 'सिन्धुपाल्चोक',
        province: initialData.province || 'बागमती प्रदेश',
        headquarters: initialData.headquarters || 'थाङपालधाप',
        areaSqKm: Number(initialData.totalAreaSqKm) || 187.29,
        wardCount: Number(initialData.totalWards) || 8,
        elevationMeters: initialData.elevationMeters || '१,१०० - ४,१०० मी.',
        introduction: initialData.introduction || '',
        eastBoundary: b.east || 'जुगल गाउँपालिका',
        westBoundary: b.west || 'हेलम्बु गाउँपालिका',
        northBoundary: b.north || 'रसुवा जिल्ला तथा चीनको तिब्बत स्वायत्त क्षेत्र',
        southBoundary: b.south || 'मेलम्ची नगरपालिका',
        lakeTitle: ci[0]?.title || 'पवित्र पाँचपोखरी कुण्ड (४,१०० मी.)',
        lakeDesc: ci[0]?.desc || '',
        cultureTitle: ci[1]?.title || 'आमा याङ्ग्री तथा ह्योल्मो संस्कृति',
        cultureDesc: ci[1]?.desc || '',
        agriTitle: ci[2]?.title || 'अर्गानिक कृषि तथा ट्राउट मत्स्य',
        agriDesc: ci[2]?.desc || '',
        // Leadership from leadership object or leaders array
        mayorName: l.mayor?.name || leaders[0]?.name || 'टासी लामा ह्योल्मो',
        mayorPhone: l.mayor?.phone || leaders[0]?.phone || '९८५११०२८३७',
        mayorEmail: l.mayor?.email || leaders[0]?.email || 'chairperson@panchpokharimun.gov.np',
        deputyMayorName: l.deputyMayor?.name || leaders[1]?.name || 'सुनिता अधिकारी',
        deputyMayorPhone: l.deputyMayor?.phone || leaders[1]?.phone || '९७४९३२६६२७',
        deputyMayorEmail: l.deputyMayor?.email || leaders[1]?.email || 'vicechair@panchpokharimun.gov.np',
        caoName: l.chiefOfficer?.name || leaders[2]?.name || 'लक्ष्मण कुईकेल',
        caoPhone: l.chiefOfficer?.phone || leaders[2]?.phone || '९७४९३२६६१९',
        caoEmail: l.chiefOfficer?.email || leaders[2]?.email || 'cao@panchpokharimun.gov.np',
        spokespersonName: l.spokesperson?.name || leaders[3]?.name || 'निमा दोर्जे तामाङ',
        spokespersonRole: l.spokesperson?.designation || leaders[3]?.role || 'प्रवक्ता तथा वडा अध्यक्ष (वडा ३)',
        spokespersonPhone: l.spokesperson?.phone || leaders[3]?.phone || '९८४१००११०३',
        spokespersonEmail: l.spokesperson?.email || leaders[3]?.email || 'spokesperson@panchpokharimun.gov.np',
        totalPopulation: initialData.demographics?.totalPopulation || 20540,
        totalHouseholds: initialData.demographics?.households || 5805,
        annualBudget: initialData.financials?.annualBudget || initialData.annualBudget || 'रु. ५८.४५ करोड',
        internalRevenue: initialData.financials?.internalRevenue || initialData.internalRevenue || 'रु. २.८ करोड',
      });
    }
  }, [initialData, isOpen]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        nameNp: formData.nameNp,
        nameEn: formData.nameEn,
        district: formData.district,
        province: formData.province,
        headquarters: formData.headquarters,
        areaSqKm: Number(formData.areaSqKm),
        wardCount: Number(formData.wardCount),
        elevationMeters: formData.elevationMeters,
        introduction: formData.introduction,
        boundaries: {
          east: formData.eastBoundary,
          west: formData.westBoundary,
          north: formData.northBoundary,
          south: formData.southBoundary,
        },
        culturalIdentity: [
          {
            title: formData.lakeTitle,
            desc: formData.lakeDesc,
            icon: 'waves',
            color: '#059669',
          },
          {
            title: formData.cultureTitle,
            desc: formData.cultureDesc,
            icon: 'mountain',
            color: '#1e40af',
          },
          {
            title: formData.agriTitle,
            desc: formData.agriDesc,
            icon: 'apple',
            color: '#9d174d',
          },
        ],
        leadership: {
          mayor: {
            name: formData.mayorName,
            phone: formData.mayorPhone,
            email: formData.mayorEmail,
            designation: 'गाउँपालिका अध्यक्ष',
          },
          deputyMayor: {
            name: formData.deputyMayorName,
            phone: formData.deputyMayorPhone,
            email: formData.deputyMayorEmail,
            designation: 'गाउँपालिका उपाध्यक्ष',
          },
          chiefOfficer: {
            name: formData.caoName,
            phone: formData.caoPhone,
            email: formData.caoEmail,
            designation: 'प्रमुख प्रशासकीय अधिकृत',
          },
          spokesperson: {
            name: formData.spokespersonName,
            designation: formData.spokespersonRole,
            phone: formData.spokespersonPhone,
            email: formData.spokespersonEmail,
          },
        },
        totalPopulation: Number(formData.totalPopulation),
        totalHouseholds: Number(formData.totalHouseholds),
        annualBudget: formData.annualBudget,
        internalRevenue: formData.internalRevenue,
      };

      return municipalityApi.updateProfile(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['municipality-profile'] });
      queryClient.invalidateQueries({ queryKey: ['representatives'] });
      queryClient.invalidateQueries({ queryKey: ['wards-profile'] });
      alert('सफलतापूर्वक पालिका डिजिटल प्रोफाइल तथा जनप्रतिनिधि विवरण अद्यावधिक (Sync) भयो!');
      onClose();
    },
    onError: (err: any) => {
      alert(`प्रोफाइल अद्यावधिक असफल भयो: ${err.message || 'त्रुटि'}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate();
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        style={{
          backgroundColor: '#0f172a',
          border: '1.5px solid #334155',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '860px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.65)',
          overflow: 'hidden',
          color: '#f8fafc',
        }}
      >
        {/* HEADER */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #1e293b',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'linear-gradient(90deg, #0f2b48 0%, #134074 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: 'rgba(2, 132, 199, 0.25)',
                border: '1px solid #38bdf8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#38bdf8',
              }}
            >
              <Building2 size={22} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>
                पालिका डिजिटल प्रोफाइल तथा केन्द्रीय विवरण सम्पादन
              </h2>
              <span style={{ fontSize: '0.78rem', color: '#93c5fd' }}>
                भौगोलिक, सिमाना, पहिचान, कार्यपालिका नेतृत्व तथा एकीकृत तथ्याङ्क व्यवस्थापन
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '8px',
              padding: '0.45rem',
              color: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* TAB SWITCHER */}
        <div
          style={{
            display: 'flex',
            gap: '0.4rem',
            padding: '0.65rem 1.25rem',
            backgroundColor: '#090d16',
            borderBottom: '1px solid #1e293b',
            overflowX: 'auto',
          }}
        >
          {[
            { id: 'admin', label: '१. चिनारी तथा अवस्थिति', icon: <Building2 size={15} /> },
            { id: 'boundaries', label: '२. चार किल्ला सिमाना', icon: <Compass size={15} /> },
            { id: 'heritage', label: '३. प्राकृतिक तथा सांस्कृतिक पहिचान', icon: <Mountain size={15} /> },
            { id: 'leadership', label: '४. कार्यपालिका नेतृत्व (Sync)', icon: <Users size={15} /> },
            { id: 'stats', label: '५. जनसांख्यिकी र बजेट', icon: <TrendingUp size={15} /> },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.45rem 0.85rem',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: isActive ? '1px solid #0284c7' : '1px solid transparent',
                  backgroundColor: isActive ? '#0284c7' : 'transparent',
                  color: isActive ? '#ffffff' : '#94a3b8',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s',
                }}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* FORM CONTENT */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          <div style={{ padding: '1.35rem 1.5rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* TAB 1: ADMINISTRATIVE & GEOGRAPHIC */}
            {activeTab === 'admin' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ fontSize: '0.85rem', color: '#38bdf8', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Building2 size={16} /> भौगोलिक तथा प्रशासनिक अवस्थिति विवरण
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.9rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.3rem', fontWeight: 600 }}>
                      पालिकाको नाम (नेपाली) *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.nameNp}
                      onChange={(e) => setFormData({ ...formData, nameNp: e.target.value })}
                      style={{ width: '100%', padding: '0.55rem', backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '6px', color: '#ffffff' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.3rem', fontWeight: 600 }}>
                      पालिकाको नाम (English)
                    </label>
                    <input
                      type="text"
                      value={formData.nameEn}
                      onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                      style={{ width: '100%', padding: '0.55rem', backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '6px', color: '#ffffff' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.3rem', fontWeight: 600 }}>
                      जिल्ला *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                      style={{ width: '100%', padding: '0.55rem', backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '6px', color: '#ffffff' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.3rem', fontWeight: 600 }}>
                      प्रदेश *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.province}
                      onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                      style={{ width: '100%', padding: '0.55rem', backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '6px', color: '#ffffff' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: '#38bdf8', marginBottom: '0.3rem', fontWeight: 600 }}>
                      केन्द्र कार्यालय (Headquarters) *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.headquarters}
                      onChange={(e) => setFormData({ ...formData, headquarters: e.target.value })}
                      style={{ width: '100%', padding: '0.55rem', backgroundColor: '#1e293b', border: '1.5px solid #0284c7', borderRadius: '6px', color: '#ffffff', fontWeight: 600 }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.3rem', fontWeight: 600 }}>
                      कुल क्षेत्रफल (वर्ग कि.मि.) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.areaSqKm}
                      onChange={(e) => setFormData({ ...formData, areaSqKm: parseFloat(e.target.value) || 0 })}
                      style={{ width: '100%', padding: '0.55rem', backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '6px', color: '#ffffff' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.3rem', fontWeight: 600 }}>
                      उचाइ सीमा (समुन्द्री सतहबाट)
                    </label>
                    <input
                      type="text"
                      value={formData.elevationMeters}
                      onChange={(e) => setFormData({ ...formData, elevationMeters: e.target.value })}
                      style={{ width: '100%', padding: '0.55rem', backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '6px', color: '#ffffff' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.3rem', fontWeight: 600 }}>
                      वडा संख्या (Wards Count)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="35"
                      value={formData.wardCount}
                      onChange={(e) => setFormData({ ...formData, wardCount: parseInt(e.target.value) || 8 })}
                      style={{ width: '100%', padding: '0.55rem', backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '6px', color: '#ffffff' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.3rem', fontWeight: 600 }}>
                    संक्षिप्त चिनारी तथा परिचय (Introduction Paragraph)
                  </label>
                  <textarea
                    rows={4}
                    value={formData.introduction}
                    onChange={(e) => setFormData({ ...formData, introduction: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem', backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '6px', color: '#ffffff', fontSize: '0.85rem', lineHeight: 1.6 }}
                  />
                </div>
              </div>
            )}

            {/* TAB 2: BOUNDARIES */}
            {activeTab === 'boundaries' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ fontSize: '0.85rem', color: '#fbbf24', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Compass size={16} /> चार किल्ला सिमाना (Geographic Boundaries)
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                  <div style={{ backgroundColor: '#1e293b', padding: '1rem', borderRadius: '10px', border: '1px solid #334155' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#38bdf8', fontWeight: 700, marginBottom: '0.4rem' }}>
                      👉 पूर्व सिमाना (East)
                    </label>
                    <input
                      type="text"
                      value={formData.eastBoundary}
                      onChange={(e) => setFormData({ ...formData, eastBoundary: e.target.value })}
                      style={{ width: '100%', padding: '0.55rem', backgroundColor: '#0f172a', border: '1px solid #475569', borderRadius: '6px', color: '#ffffff' }}
                    />
                    <small style={{ color: '#94a3b8', fontSize: '0.72rem', display: 'block', marginTop: '4px' }}>उदा. जुगल गाउँपालिका / सिन्धुपाल्चोक</small>
                  </div>

                  <div style={{ backgroundColor: '#1e293b', padding: '1rem', borderRadius: '10px', border: '1px solid #334155' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#10b981', fontWeight: 700, marginBottom: '0.4rem' }}>
                      👈 पश्चिम सिमाना (West)
                    </label>
                    <input
                      type="text"
                      value={formData.westBoundary}
                      onChange={(e) => setFormData({ ...formData, westBoundary: e.target.value })}
                      style={{ width: '100%', padding: '0.55rem', backgroundColor: '#0f172a', border: '1px solid #475569', borderRadius: '6px', color: '#ffffff' }}
                    />
                    <small style={{ color: '#94a3b8', fontSize: '0.72rem', display: 'block', marginTop: '4px' }}>उदा. हेलम्बु गाउँपालिका</small>
                  </div>

                  <div style={{ backgroundColor: '#1e293b', padding: '1rem', borderRadius: '10px', border: '1px solid #334155' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#a78bfa', fontWeight: 700, marginBottom: '0.4rem' }}>
                      👆 उत्तर सिमाना (North)
                    </label>
                    <input
                      type="text"
                      value={formData.northBoundary}
                      onChange={(e) => setFormData({ ...formData, northBoundary: e.target.value })}
                      style={{ width: '100%', padding: '0.55rem', backgroundColor: '#0f172a', border: '1px solid #475569', borderRadius: '6px', color: '#ffffff' }}
                    />
                    <small style={{ color: '#94a3b8', fontSize: '0.72rem', display: 'block', marginTop: '4px' }}>उदा. रसुवा जिल्ला तथा चीनको तिब्बत स्वायत्त क्षेत्र</small>
                  </div>

                  <div style={{ backgroundColor: '#1e293b', padding: '1rem', borderRadius: '10px', border: '1px solid #334155' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#f97316', fontWeight: 700, marginBottom: '0.4rem' }}>
                      👇 दक्षिण सिमाना (South)
                    </label>
                    <input
                      type="text"
                      value={formData.southBoundary}
                      onChange={(e) => setFormData({ ...formData, southBoundary: e.target.value })}
                      style={{ width: '100%', padding: '0.55rem', backgroundColor: '#0f172a', border: '1px solid #475569', borderRadius: '6px', color: '#ffffff' }}
                    />
                    <small style={{ color: '#94a3b8', fontSize: '0.72rem', display: 'block', marginTop: '4px' }}>उदा. मेलम्ची नगरपालिका</small>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: HERITAGE & IDENTITY */}
            {activeTab === 'heritage' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Mountain size={16} /> प्राकृतिक, ऐतिहासिक तथा सांस्कृतिक पहिचान
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {/* Item 1 */}
                  <div style={{ backgroundColor: '#1e293b', padding: '1rem', borderRadius: '10px', border: '1px solid #059669' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#6ee7b7', fontWeight: 700, marginBottom: '0.3rem' }}>
                      🌊 १. प्रमुख धार्मिक कुण्ड तथा सिमसार क्षेत्र
                    </label>
                    <input
                      type="text"
                      value={formData.lakeTitle}
                      onChange={(e) => setFormData({ ...formData, lakeTitle: e.target.value })}
                      style={{ width: '100%', padding: '0.45rem 0.6rem', backgroundColor: '#0f172a', border: '1px solid #475569', borderRadius: '6px', color: '#ffffff', marginBottom: '0.5rem', fontWeight: 600 }}
                    />
                    <textarea
                      rows={2}
                      value={formData.lakeDesc}
                      onChange={(e) => setFormData({ ...formData, lakeDesc: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem 0.6rem', backgroundColor: '#0f172a', border: '1px solid #475569', borderRadius: '6px', color: '#ffffff', fontSize: '0.82rem' }}
                    />
                  </div>

                  {/* Item 2 */}
                  <div style={{ backgroundColor: '#1e293b', padding: '1rem', borderRadius: '10px', border: '1px solid #2563eb' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#93c5fd', fontWeight: 700, marginBottom: '0.3rem' }}>
                      🏔️ २. मौलिक संस्कृति तथा पर्यटन धरोहर
                    </label>
                    <input
                      type="text"
                      value={formData.cultureTitle}
                      onChange={(e) => setFormData({ ...formData, cultureTitle: e.target.value })}
                      style={{ width: '100%', padding: '0.45rem 0.6rem', backgroundColor: '#0f172a', border: '1px solid #475569', borderRadius: '6px', color: '#ffffff', marginBottom: '0.5rem', fontWeight: 600 }}
                    />
                    <textarea
                      rows={2}
                      value={formData.cultureDesc}
                      onChange={(e) => setFormData({ ...formData, cultureDesc: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem 0.6rem', backgroundColor: '#0f172a', border: '1px solid #475569', borderRadius: '6px', color: '#ffffff', fontSize: '0.82rem' }}
                    />
                  </div>

                  {/* Item 3 */}
                  <div style={{ backgroundColor: '#1e293b', padding: '1rem', borderRadius: '10px', border: '1px solid #db2777' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#f472b6', fontWeight: 700, marginBottom: '0.3rem' }}>
                      🍎 ३. अर्गानिक कृषि तथा स्थानीय उत्पादन पहिचान
                    </label>
                    <input
                      type="text"
                      value={formData.agriTitle}
                      onChange={(e) => setFormData({ ...formData, agriTitle: e.target.value })}
                      style={{ width: '100%', padding: '0.45rem 0.6rem', backgroundColor: '#0f172a', border: '1px solid #475569', borderRadius: '6px', color: '#ffffff', marginBottom: '0.5rem', fontWeight: 600 }}
                    />
                    <textarea
                      rows={2}
                      value={formData.agriDesc}
                      onChange={(e) => setFormData({ ...formData, agriDesc: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem 0.6rem', backgroundColor: '#0f172a', border: '1px solid #475569', borderRadius: '6px', color: '#ffffff', fontSize: '0.82rem' }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: LEADERSHIP MATRIX (SYNCED TO REPRESENTATIVES) */}
            {activeTab === 'leadership' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div
                  style={{
                    padding: '0.75rem 1rem',
                    backgroundColor: 'rgba(14, 165, 233, 0.15)',
                    border: '1px solid #0284c7',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    fontSize: '0.8rem',
                    color: '#bae6fd',
                  }}
                >
                  <Link2 size={20} color="#38bdf8" style={{ flexShrink: 0 }} />
                  <div>
                    <strong>🔗 एकीकृत तथ्याङ्क सिङ्क (Single Source of Truth):</strong> यहाँ कार्यपालिका नेतृत्वको नाम, फोन वा इमेल सम्पादन गर्दा <strong>"जनप्रतिनिधि व्यवस्थापन"</strong> तालिकामा पनि विवरण स्वतः अद्यावधिक हुन्छ।
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                  {/* Leader 1: Mayor */}
                  <div style={{ backgroundColor: '#1e293b', border: '1px solid #0f4c81', borderRadius: '10px', padding: '1rem' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', background: '#0f4c81', color: '#ffffff' }}>
                      कार्यकारी प्रमुख • गाउँपालिका अध्यक्ष
                    </span>
                    <div style={{ marginTop: '0.6rem' }}>
                      <label style={{ display: 'block', fontSize: '0.74rem', color: '#94a3b8', marginBottom: '0.2rem' }}>अध्यक्षको नाम *</label>
                      <input
                        type="text"
                        required
                        value={formData.mayorName}
                        onChange={(e) => setFormData({ ...formData, mayorName: e.target.value })}
                        style={{ width: '100%', padding: '0.45rem', backgroundColor: '#0f172a', border: '1px solid #475569', borderRadius: '6px', color: '#ffffff', fontWeight: 700 }}
                      />
                    </div>
                    <div style={{ marginTop: '0.5rem' }}>
                      <label style={{ display: 'block', fontSize: '0.74rem', color: '#94a3b8', marginBottom: '0.2rem' }}>सम्पर्क फोन</label>
                      <input
                        type="text"
                        value={formData.mayorPhone}
                        onChange={(e) => setFormData({ ...formData, mayorPhone: e.target.value })}
                        style={{ width: '100%', padding: '0.45rem', backgroundColor: '#0f172a', border: '1px solid #475569', borderRadius: '6px', color: '#ffffff' }}
                      />
                    </div>
                    <div style={{ marginTop: '0.5rem' }}>
                      <label style={{ display: 'block', fontSize: '0.74rem', color: '#94a3b8', marginBottom: '0.2rem' }}>इमेल ठेगाना</label>
                      <input
                        type="email"
                        value={formData.mayorEmail}
                        onChange={(e) => setFormData({ ...formData, mayorEmail: e.target.value })}
                        style={{ width: '100%', padding: '0.45rem', backgroundColor: '#0f172a', border: '1px solid #475569', borderRadius: '6px', color: '#ffffff' }}
                      />
                    </div>
                  </div>

                  {/* Leader 2: Deputy Mayor */}
                  <div style={{ backgroundColor: '#1e293b', border: '1px solid #047857', borderRadius: '10px', padding: '1rem' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', background: '#047857', color: '#ffffff' }}>
                      न्यायिक समिति संयोजक • उपाध्यक्ष
                    </span>
                    <div style={{ marginTop: '0.6rem' }}>
                      <label style={{ display: 'block', fontSize: '0.74rem', color: '#94a3b8', marginBottom: '0.2rem' }}>उपाध्यक्षको नाम *</label>
                      <input
                        type="text"
                        required
                        value={formData.deputyMayorName}
                        onChange={(e) => setFormData({ ...formData, deputyMayorName: e.target.value })}
                        style={{ width: '100%', padding: '0.45rem', backgroundColor: '#0f172a', border: '1px solid #475569', borderRadius: '6px', color: '#ffffff', fontWeight: 700 }}
                      />
                    </div>
                    <div style={{ marginTop: '0.5rem' }}>
                      <label style={{ display: 'block', fontSize: '0.74rem', color: '#94a3b8', marginBottom: '0.2rem' }}>सम्पर्क फोन</label>
                      <input
                        type="text"
                        value={formData.deputyMayorPhone}
                        onChange={(e) => setFormData({ ...formData, deputyMayorPhone: e.target.value })}
                        style={{ width: '100%', padding: '0.45rem', backgroundColor: '#0f172a', border: '1px solid #475569', borderRadius: '6px', color: '#ffffff' }}
                      />
                    </div>
                    <div style={{ marginTop: '0.5rem' }}>
                      <label style={{ display: 'block', fontSize: '0.74rem', color: '#94a3b8', marginBottom: '0.2rem' }}>इमेल ठेगाना</label>
                      <input
                        type="email"
                        value={formData.deputyMayorEmail}
                        onChange={(e) => setFormData({ ...formData, deputyMayorEmail: e.target.value })}
                        style={{ width: '100%', padding: '0.45rem', backgroundColor: '#0f172a', border: '1px solid #475569', borderRadius: '6px', color: '#ffffff' }}
                      />
                    </div>
                  </div>

                  {/* Leader 3: CAO */}
                  <div style={{ backgroundColor: '#1e293b', border: '1px solid #b45309', borderRadius: '10px', padding: '1rem' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', background: '#b45309', color: '#ffffff' }}>
                      प्रशासनिक प्रमुख • प्रमुख प्रशासकीय अधिकृत
                    </span>
                    <div style={{ marginTop: '0.6rem' }}>
                      <label style={{ display: 'block', fontSize: '0.74rem', color: '#94a3b8', marginBottom: '0.2rem' }}>अधिकृतको नाम *</label>
                      <input
                        type="text"
                        required
                        value={formData.caoName}
                        onChange={(e) => setFormData({ ...formData, caoName: e.target.value })}
                        style={{ width: '100%', padding: '0.45rem', backgroundColor: '#0f172a', border: '1px solid #475569', borderRadius: '6px', color: '#ffffff', fontWeight: 700 }}
                      />
                    </div>
                    <div style={{ marginTop: '0.5rem' }}>
                      <label style={{ display: 'block', fontSize: '0.74rem', color: '#94a3b8', marginBottom: '0.2rem' }}>सम्पर्क फोन</label>
                      <input
                        type="text"
                        value={formData.caoPhone}
                        onChange={(e) => setFormData({ ...formData, caoPhone: e.target.value })}
                        style={{ width: '100%', padding: '0.45rem', backgroundColor: '#0f172a', border: '1px solid #475569', borderRadius: '6px', color: '#ffffff' }}
                      />
                    </div>
                    <div style={{ marginTop: '0.5rem' }}>
                      <label style={{ display: 'block', fontSize: '0.74rem', color: '#94a3b8', marginBottom: '0.2rem' }}>इमेल ठेगाना</label>
                      <input
                        type="email"
                        value={formData.caoEmail}
                        onChange={(e) => setFormData({ ...formData, caoEmail: e.target.value })}
                        style={{ width: '100%', padding: '0.45rem', backgroundColor: '#0f172a', border: '1px solid #475569', borderRadius: '6px', color: '#ffffff' }}
                      />
                    </div>
                  </div>

                  {/* Leader 4: Spokesperson */}
                  <div style={{ backgroundColor: '#1e293b', border: '1px solid #6d28d9', borderRadius: '10px', padding: '1rem' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', background: '#6d28d9', color: '#ffffff' }}>
                      सञ्चार तथा समन्वय • पालिका प्रवक्ता
                    </span>
                    <div style={{ marginTop: '0.6rem' }}>
                      <label style={{ display: 'block', fontSize: '0.74rem', color: '#94a3b8', marginBottom: '0.2rem' }}>प्रवक्ताको नाम *</label>
                      <input
                        type="text"
                        required
                        value={formData.spokespersonName}
                        onChange={(e) => setFormData({ ...formData, spokespersonName: e.target.value })}
                        style={{ width: '100%', padding: '0.45rem', backgroundColor: '#0f172a', border: '1px solid #475569', borderRadius: '6px', color: '#ffffff', fontWeight: 700 }}
                      />
                    </div>
                    <div style={{ marginTop: '0.5rem' }}>
                      <label style={{ display: 'block', fontSize: '0.74rem', color: '#94a3b8', marginBottom: '0.2rem' }}>पद / भूमिका</label>
                      <input
                        type="text"
                        value={formData.spokespersonRole}
                        onChange={(e) => setFormData({ ...formData, spokespersonRole: e.target.value })}
                        style={{ width: '100%', padding: '0.45rem', backgroundColor: '#0f172a', border: '1px solid #475569', borderRadius: '6px', color: '#ffffff' }}
                      />
                    </div>
                    <div style={{ marginTop: '0.5rem' }}>
                      <label style={{ display: 'block', fontSize: '0.74rem', color: '#94a3b8', marginBottom: '0.2rem' }}>सम्पर्क फोन</label>
                      <input
                        type="text"
                        value={formData.spokespersonPhone}
                        onChange={(e) => setFormData({ ...formData, spokespersonPhone: e.target.value })}
                        style={{ width: '100%', padding: '0.45rem', backgroundColor: '#0f172a', border: '1px solid #475569', borderRadius: '6px', color: '#ffffff' }}
                      />
                    </div>
                    <div style={{ marginTop: '0.5rem' }}>
                      <label style={{ display: 'block', fontSize: '0.74rem', color: '#94a3b8', marginBottom: '0.2rem' }}>इमेल ठेगाना</label>
                      <input
                        type="email"
                        value={formData.spokespersonEmail}
                        onChange={(e) => setFormData({ ...formData, spokespersonEmail: e.target.value })}
                        style={{ width: '100%', padding: '0.45rem', backgroundColor: '#0f172a', border: '1px solid #475569', borderRadius: '6px', color: '#ffffff' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: STATS & BUDGET */}
            {activeTab === 'stats' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ fontSize: '0.85rem', color: '#f59e0b', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <TrendingUp size={16} /> एकीकृत मुख्य तथ्याङ्क तथा वार्षिक बजेट
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                  <div style={{ backgroundColor: '#1e293b', padding: '1rem', borderRadius: '10px', border: '1px solid #334155' }}>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: '#38bdf8', fontWeight: 700, marginBottom: '0.3rem' }}>
                      कुल जनसंख्या (नागरिक संख्या)
                    </label>
                    <input
                      type="number"
                      value={formData.totalPopulation}
                      onChange={(e) => setFormData({ ...formData, totalPopulation: parseInt(e.target.value) || 0 })}
                      style={{ width: '100%', padding: '0.55rem', backgroundColor: '#0f172a', border: '1px solid #475569', borderRadius: '6px', color: '#ffffff', fontWeight: 700 }}
                    />
                    <small style={{ color: '#94a3b8', fontSize: '0.72rem', display: 'block', marginTop: '4px' }}>राष्ट्रिय जनगणना २०७८ अनुसार</small>
                  </div>

                  <div style={{ backgroundColor: '#1e293b', padding: '1rem', borderRadius: '10px', border: '1px solid #334155' }}>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: '#34d399', fontWeight: 700, marginBottom: '0.3rem' }}>
                      कुल घरधुरी संख्या (Households)
                    </label>
                    <input
                      type="number"
                      value={formData.totalHouseholds}
                      onChange={(e) => setFormData({ ...formData, totalHouseholds: parseInt(e.target.value) || 0 })}
                      style={{ width: '100%', padding: '0.55rem', backgroundColor: '#0f172a', border: '1px solid #475569', borderRadius: '6px', color: '#ffffff', fontWeight: 700 }}
                    />
                    <small style={{ color: '#94a3b8', fontSize: '0.72rem', display: 'block', marginTop: '4px' }}>डिजिटल ट्विन लगत म्याट्रिक्स अनुसार</small>
                  </div>

                  <div style={{ backgroundColor: '#1e293b', padding: '1rem', borderRadius: '10px', border: '1px solid #334155' }}>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: '#fbbf24', fontWeight: 700, marginBottom: '0.3rem' }}>
                      वार्षिक बजेट (चालु आ.व.)
                    </label>
                    <input
                      type="text"
                      value={formData.annualBudget}
                      onChange={(e) => setFormData({ ...formData, annualBudget: e.target.value })}
                      style={{ width: '100%', padding: '0.55rem', backgroundColor: '#0f172a', border: '1px solid #475569', borderRadius: '6px', color: '#ffffff', fontWeight: 700 }}
                    />
                    <small style={{ color: '#94a3b8', fontSize: '0.72rem', display: 'block', marginTop: '4px' }}>उदा. रु. ५८.४५ करोड</small>
                  </div>

                  <div style={{ backgroundColor: '#1e293b', padding: '1rem', borderRadius: '10px', border: '1px solid #334155' }}>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: '#f87171', fontWeight: 700, marginBottom: '0.3rem' }}>
                      आन्तरिक राजस्व लक्ष्य/संकलन
                    </label>
                    <input
                      type="text"
                      value={formData.internalRevenue}
                      onChange={(e) => setFormData({ ...formData, internalRevenue: e.target.value })}
                      style={{ width: '100%', padding: '0.55rem', backgroundColor: '#0f172a', border: '1px solid #475569', borderRadius: '6px', color: '#ffffff', fontWeight: 700 }}
                    />
                    <small style={{ color: '#94a3b8', fontSize: '0.72rem', display: 'block', marginTop: '4px' }}>उदा. रु. २.८ करोड</small>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* FOOTER ACTIONS */}
          <div
            style={{
              padding: '1rem 1.5rem',
              backgroundColor: '#090d16',
              borderTop: '1px solid #1e293b',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.75rem',
            }}
          >
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Sparkles size={14} color="#38bdf8" />
              <span>सेभ गर्दा सबै परिवर्तनहरू केन्द्रीय प्रणाली तथा जनप्रतिनिधि तालिकामा स्वतः लिङ्क हुनेछन्।</span>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '0.55rem 1.25rem',
                  backgroundColor: '#334155',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                }}
              >
                रद्द गर्नुहोस्
              </button>

              <button
                type="submit"
                disabled={updateMutation.isPending}
                style={{
                  padding: '0.55rem 1.5rem',
                  backgroundColor: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: updateMutation.isPending ? 'wait' : 'pointer',
                  fontWeight: 700,
                  fontSize: '0.86rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 14px rgba(2, 132, 199, 0.4)',
                }}
              >
                <Save size={16} />
                <span>{updateMutation.isPending ? 'सुरक्षित गरिँदैछ...' : '💾 सम्पूर्ण पालिका विवरण सुरक्षित गर्नुहोस्'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
