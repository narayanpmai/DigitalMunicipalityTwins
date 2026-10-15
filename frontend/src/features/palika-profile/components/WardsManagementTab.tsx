import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { municipalityApi } from '../../../api/municipality';
import { representativesApi, Representative } from '../../../api/representatives';
import { WardProfile } from '../../../types/profile';
import {
  Building2,
  Phone,
  MapPin,
  Users,
  Home,
  BookOpen,
  Edit2,
  Plus,
  Search,
  CheckCircle2,
  Layers,
  Map,
  X,
  Compass,
  FileText,
  ExternalLink,
  ShieldCheck,
  Mail
} from 'lucide-react';

const DEFAULT_WARDS = [
  {
    wardNo: 1,
    name: 'बाँसखर्क (Baskharka)',
    chairperson: 'आलोक स्याङ्वो',
    secretary: 'प्रदीप तामाङ',
    phone: '९७४९३२६६०१',
    email: 'panchpokharimun1@gmail.com',
    officeLocation: 'बाँसखर्क बजार',
    households: 615,
    malePopulation: 1280,
    femalePopulation: 1365,
    totalPopulation: 2645,
    areaSqKm: 24.12,
    literacyRate: 71.5,
    mainSettlement: 'बाँसखर्क, सिङ्गाचे, डाँडाटोल, भन्ज्याङ',
    healthFacilities: '१ स्वास्थ्य चौकी',
    schools: '५ सामुदायिक विद्यालय'
  },
  {
    wardNo: 2,
    name: 'बरुवा (Baruwa)',
    chairperson: 'बाबुलाल स्याङवो',
    secretary: 'सङ्गीता घिसिङ',
    phone: '९७४९३२६६०२',
    email: 'panchpokharimun2@gmail.com',
    officeLocation: 'बरुवा देउराली',
    households: 540,
    malePopulation: 1120,
    femalePopulation: 1210,
    totalPopulation: 2330,
    areaSqKm: 34.50,
    literacyRate: 69.2,
    mainSettlement: 'बरुवा, तेम्बाथाङ, याङ्ग्री',
    healthFacilities: '१ स्वास्थ्य चौकी',
    schools: '४ सामुदायिक विद्यालय'
  },
  {
    wardNo: 3,
    name: 'भोताङ (Bhotang)',
    chairperson: 'नारायण भट्टराई',
    secretary: 'रमेश तामाङ',
    phone: '९८६४१६५३६६',
    email: 'ward3@panchpokhari.gov.np',
    officeLocation: 'भोताङ मानेडाँडा',
    households: 630,
    malePopulation: 1310,
    femalePopulation: 1395,
    totalPopulation: 2705,
    areaSqKm: 28.30,
    literacyRate: 74.0,
    mainSettlement: 'भोताङ, छिम्ती, नोथाङ, पोखरीटोल',
    healthFacilities: '१ स्वास्थ्य चौकी, १ आधारभूत अस्पताल',
    schools: '५ सामुदायिक विद्यालय'
  },
  {
    wardNo: 4,
    name: 'थाङपालकोट (Thangpalkot)',
    chairperson: 'कुल बाहादुर बस्नेत',
    secretary: 'सुमित्रा श्रेष्ठ',
    phone: '९७४९३२६६०४',
    email: 'panchpokharimun4@gmail.com',
    officeLocation: 'थाङपालकोट गढी',
    households: 490,
    malePopulation: 1010,
    femalePopulation: 1090,
    totalPopulation: 2100,
    areaSqKm: 38.60,
    literacyRate: 72.8,
    mainSettlement: 'थाङपालकोट, मानेखर्क, गढीटोल',
    healthFacilities: '१ स्वास्थ्य चौकी',
    schools: '४ सामुदायिक विद्यालय'
  },
  {
    wardNo: 5,
    name: 'गुन्सा (Gunsa)',
    chairperson: 'काले गोले',
    secretary: 'दिपक तिमल्सिना',
    phone: '९७४९३२६६०५',
    email: 'panchpokharimun5@gmail.com',
    officeLocation: 'गुन्सा डाँडा',
    households: 580,
    malePopulation: 1190,
    femalePopulation: 1270,
    totalPopulation: 2460,
    areaSqKm: 26.80,
    literacyRate: 75.4,
    mainSettlement: 'गुन्सा, काउले, डाँडागाउँ, सिम्ले',
    healthFacilities: '१ स्वास्थ्य चौकी',
    schools: '४ सामुदायिक विद्यालय'
  },
  {
    wardNo: 6,
    name: 'थाङपालधाप (Thangpaldhap)',
    chairperson: 'नारायण भट्टराई',
    secretary: 'सरिता खड्का',
    phone: '९८६४१६५३६६',
    email: 'panchpokharimun6@gmail.com',
    officeLocation: 'थाङपालधाप बजार (पालिका केन्द्र)',
    households: 460,
    malePopulation: 980,
    femalePopulation: 1060,
    totalPopulation: 2040,
    areaSqKm: 21.40,
    literacyRate: 79.1,
    mainSettlement: 'थाङपालधाप बजार, रातोमाटो, बेसीटोल',
    healthFacilities: '१ प्राथमिक स्वास्थ्य केन्द्र',
    schools: '३ सामुदायिक विद्यालय, १ क्याम्पस'
  },
  {
    wardNo: 7,
    name: 'भोटेनाम्लाङ (Bhotenamlang)',
    chairperson: 'सुके तामाङ',
    secretary: 'कमल श्रेष्ठ',
    phone: '९७४९३२६६०७',
    email: 'panchpokharimun7@gmail.com',
    officeLocation: 'भोटेनाम्लाङ बजार',
    households: 520,
    malePopulation: 1090,
    femalePopulation: 1160,
    totalPopulation: 2250,
    areaSqKm: 22.90,
    literacyRate: 70.8,
    mainSettlement: 'भोटेनाम्लाङ, लप्सीफेदी, चिलाउने',
    healthFacilities: '१ स्वास्थ्य चौकी',
    schools: '४ सामुदायिक विद्यालय'
  },
  {
    wardNo: 8,
    name: 'लागर्चे (Lagarche)',
    chairperson: 'विष्णु बहादुर खड्का',
    secretary: 'सुरेश लामा',
    phone: '९७४९३२६६०८',
    email: 'panchpokharimun8@gmail.com',
    officeLocation: 'लागर्चे भञ्ज्याङ',
    households: 480,
    malePopulation: 1020,
    femalePopulation: 1080,
    totalPopulation: 2100,
    areaSqKm: 19.80,
    literacyRate: 71.0,
    mainSettlement: 'लागर्चे, काभ्रे, गैरीगाउँ',
    healthFacilities: '१ स्वास्थ्य चौकी',
    schools: '३ सामुदायिक विद्यालय'
  }
];

export const WardsManagementTab: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedWardNo, setSelectedWardNo] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingWard, setEditingWard] = useState<any>(null);

  // Fetch wards from backend
  const { data: dbWards = [] } = useQuery({
    queryKey: ['wards-profile'],
    queryFn: () => municipalityApi.getWards(),
  });

  // Single Source of Truth: Fetch authoritative elected representatives
  const { data: representatives = [] } = useQuery({
    queryKey: ['representatives'],
    queryFn: () => representativesApi.getAll(),
  });

  const wards = useMemo(() => {
    return DEFAULT_WARDS.map((def) => {
      const dbMatch = (dbWards as any[]).find((w: any) => w.wardNo === def.wardNo || w.wardNumber === def.wardNo);
      const repMatch = (representatives as Representative[]).find(
        (r: Representative) =>
          r.isCurrent !== false &&
          (Number(r.wardNo) === def.wardNo ||
            (r.designation && r.designation.includes(`वडा नं. ${def.wardNo}`)))
      );

      return {
        ...def,
        ...(dbMatch || {}),
        id: dbMatch?.id,
        wardNo: def.wardNo,
        // Single Source of Truth: representative overrides or dbMatch or fallback
        chairperson: repMatch?.name || dbMatch?.chairperson || dbMatch?.wardChairName || def.chairperson,
        secretary: dbMatch?.secretary || def.secretary,
        phone: repMatch?.phone || dbMatch?.phone || def.phone,
        email: repMatch?.email || dbMatch?.email || def.email,
        officeLocation: dbMatch?.officeLocation || def.officeLocation,
        totalPopulation: dbMatch?.totalPopulation || dbMatch?.population || def.totalPopulation,
        households: dbMatch?.households || def.households,
        areaSqKm: dbMatch?.areaSqKm || def.areaSqKm,
        repPhotoUrl: repMatch?.photoUrl,
        repParty: repMatch?.politicalParty,
        repId: repMatch?.id,
      };
    });
  }, [dbWards, representatives]);

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      let res;
      if (data.id) {
        res = await municipalityApi.updateWard(data.id, data);
      } else {
        res = await municipalityApi.createWard(data);
      }
      // Two-way sync: update representative record if chair name or phone was changed
      if (data.repId && (data.chairperson || data.phone)) {
        try {
          await representativesApi.update(data.repId, {
            name: data.chairperson,
            phone: data.phone,
          });
        } catch (e) {
          console.error('Failed to sync representative', e);
        }
      }
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wards-profile'] });
      queryClient.invalidateQueries({ queryKey: ['wards'] });
      queryClient.invalidateQueries({ queryKey: ['representatives'] });
      setIsEditModalOpen(false);
      setEditingWard(null);
    }
  });

  const activeWard = wards.find((w) => w.wardNo === selectedWardNo) || wards[0];

  const filteredWards = wards.filter(
    (w) =>
      !searchTerm ||
      w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.chairperson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.mainSettlement.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* WARD SELECTION STRIP */}
      <div className="palika-glass-card" style={{ padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h4 style={{ margin: 0, fontWeight: 900, fontSize: '1rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Building2 size={18} className="text-blue-600" />
              पाँचपोखरी थाङपालका ८ वटै वडाहरू (Wards 1 - 8)
            </h4>
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>वडा चयन गरी विस्तृत प्रोफाइल, नक्सा र सम्पर्क विवरण हेर्नुहोस्</span>
          </div>

          <div style={{ position: 'relative', width: '220px' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="वडा वा बस्ती खोज्नुहोस्..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.38rem 0.65rem 0.38rem 2rem',
                borderRadius: '8px',
                border: '1.5px solid #cbd5e1',
                fontSize: '0.82rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>

        <div className="palika-ward-chip-track">
          {wards.map((w) => {
            const isSelected = selectedWardNo === w.wardNo;
            return (
              <button
                key={w.wardNo}
                type="button"
                onClick={() => setSelectedWardNo(w.wardNo)}
                className={`palika-ward-chip ${isSelected ? 'active' : ''}`}
              >
                <span>वडा नं. {w.wardNo}</span>
                <span style={{ fontSize: '0.75rem', opacity: isSelected ? 0.9 : 0.7 }}>({w.name.split(' ')[0]})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ACTIVE WARD SPOTLIGHT HERO CARD */}
      <div className="palika-glass-card" style={{ padding: '1.75rem', borderLeft: '5px solid #0f4c81' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1.25rem', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <span style={{ padding: '3px 10px', borderRadius: '6px', backgroundColor: '#0f4c81', color: '#ffffff', fontWeight: 800, fontSize: '0.82rem' }}>
                वडा नं. {activeWard.wardNo}
              </span>
              <span style={{ fontSize: '0.82rem', color: '#047857', fontWeight: 700, backgroundColor: '#ecfdf5', padding: '2px 8px', borderRadius: '4px' }}>
                क्षेत्रफल: {activeWard.areaSqKm} व.कि.मि.
              </span>
            </div>
            <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 900, color: '#0f172a' }}>
              {activeWard.name}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.4rem', fontSize: '0.86rem', color: '#475569', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={15} color="#0284c7" />
                कार्यालय स्थान: <strong>{activeWard.officeLocation}</strong>
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Phone size={15} color="#059669" />
                सम्पर्क: <strong>{activeWard.phone}</strong>
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setEditingWard(activeWard);
              setIsEditModalOpen(true);
            }}
            className="gov-btn gov-btn-outline"
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              border: '1.5px solid #cbd5e1',
              backgroundColor: '#ffffff'
            }}
          >
            <Edit2 size={14} />
            वडा विवरण सम्पादन गर्नुहोस्
          </button>
        </div>

        {/* 4 Metrics Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ padding: '1rem', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>कुल जनसंख्या</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', margin: '4px 0 2px' }}>
              {activeWard.totalPopulation.toLocaleString()}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
              पुरुष: {activeWard.malePopulation} | महिला: {activeWard.femalePopulation}
            </div>
          </div>

          <div style={{ padding: '1rem', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>कुल घरधुरी</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0284c7', margin: '4px 0 2px' }}>
              {activeWard.households} घर
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
              औसत परिवार: {(activeWard.totalPopulation / activeWard.households).toFixed(2)} जना/घर
            </div>
          </div>

          <div style={{ padding: '1rem', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>साक्षरता दर</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#047857', margin: '4px 0 2px' }}>
              {activeWard.literacyRate}%
            </div>
            <div style={{ fontSize: '0.75rem', color: '#047857', fontWeight: 600 }}>
              पालिका औसतभन्दा उच्च
            </div>
          </div>

          <div style={{ padding: '1rem', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>जनघनत्व</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#b45309', margin: '4px 0 2px' }}>
              {(activeWard.totalPopulation / activeWard.areaSqKm).toFixed(1)} <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>जना/व.कि.मि.</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
              भूगोल: {activeWard.areaSqKm} sq.km
            </div>
          </div>
        </div>

        {/* Administration & Settlements */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          <div style={{ padding: '1rem', borderRadius: '12px', background: '#eff6ff', border: '1.5px solid #bfdbfe', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <strong style={{ color: '#1e40af', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={16} color="#2563eb" />
                👤 वडा नेतृत्व तथा कर्मचारी:
              </strong>
              <Link
                to="/app/representatives"
                title="जनप्रतिनिधि व्यवस्थापनमा जानुहोस् (Single Source of Truth)"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: '#0284c7',
                  background: '#ffffff',
                  border: '1px solid #bae6fd',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                }}
              >
                <CheckCircle2 size={12} color="#059669" />
                जनप्रतिनिधिसँग एकीकृत
              </Link>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginTop: '6px' }}>
              {activeWard.repPhotoUrl ? (
                <img
                  src={activeWard.repPhotoUrl}
                  alt={activeWard.chairperson}
                  style={{ width: '52px', height: '52px', borderRadius: '50%', objectFit: 'cover', border: '2.5px solid #3b82f6', flexShrink: 0, boxShadow: '0 2px 6px rgba(59,130,246,0.25)' }}
                />
              ) : (
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#dbeafe', color: '#1e40af', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.95rem', flexShrink: 0, border: '2px solid #bfdbfe' }}>
                  {activeWard.chairperson ? activeWard.chairperson.substring(0, 2) : 'वअ'}
                </div>
              )}
              <div style={{ fontSize: '0.84rem', color: '#334155', lineHeight: 1.6, flex: 1 }}>
                <div>
                  • वडा अध्यक्ष: <strong style={{ color: '#0f172a', fontSize: '0.96rem' }}>{activeWard.chairperson}</strong>
                  {activeWard.repParty && (
                    <span style={{ marginLeft: '6px', fontSize: '0.72rem', background: '#e0f2fe', color: '#0369a1', padding: '1px 7px', borderRadius: '4px', fontWeight: 600 }}>
                      {activeWard.repParty}
                    </span>
                  )}
                </div>
                <div>• वडा सचिव: <strong>{activeWard.secretary}</strong></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                  <Phone size={13} color="#059669" />
                  सिधा सम्पर्क: <strong style={{ color: '#047857' }}>{activeWard.phone}</strong>
                </div>
                {activeWard.email && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px', fontSize: '0.78rem' }}>
                    <Mail size={13} color="#0284c7" />
                    इमेल: <a href={`mailto:${activeWard.email}`} style={{ color: '#0284c7', textDecoration: 'none', fontWeight: 600 }}>{activeWard.email}</a>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div style={{ padding: '1rem', borderRadius: '12px', background: '#ecfdf5', border: '1px solid #a7f3d0' }}>
            <strong style={{ color: '#065f46', fontSize: '0.88rem', display: 'block', marginBottom: '6px' }}>
              🏡 मुख्य बस्ती तथा टोलहरू:
            </strong>
            <div style={{ fontSize: '0.84rem', color: '#334155', lineHeight: 1.6 }}>
              {activeWard.mainSettlement}
            </div>
          </div>

          <div style={{ padding: '1rem', borderRadius: '12px', background: '#fef3c7', border: '1px solid #fde68a' }}>
            <strong style={{ color: '#92400e', fontSize: '0.88rem', display: 'block', marginBottom: '6px' }}>
              🏥 प्रमुख पूर्वाधार तथा सेवा:
            </strong>
            <div style={{ fontSize: '0.84rem', color: '#334155', lineHeight: 1.6 }}>
              • स्वास्थ्य: {activeWard.healthFacilities}<br />
              • शिक्षा: {activeWard.schools}
            </div>
          </div>
        </div>
      </div>

      {/* ALL WARDS COMPARATIVE TABLE */}
      <div className="palika-glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.4rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: '#0f172a' }}>
              ८ वटै वडाहरूको एकीकृत तुलनात्मक तालिका (Wards Comparative Matrix)
            </h4>
            <span style={{ fontSize: '0.76rem', color: '#64748b' }}>
              वडा अध्यक्ष र सम्पर्क विवरण सिधै 'जनप्रतिनिधि व्यवस्थापन' मार्फत एकीकृत गरिएको छ।
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link
              to="/app/representatives"
              style={{
                fontSize: '0.76rem',
                color: '#0f4c81',
                fontWeight: 700,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                background: '#f0f9ff',
                padding: '4px 10px',
                borderRadius: '6px',
                border: '1px solid #bae6fd'
              }}
            >
              <Users size={13} />
              जनप्रतिनिधि व्यवस्थापन
            </Link>
            <span className="agri-badge agri-badge-success">{wards.length} वडाहरू</span>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="agri-pro-table">
            <thead>
              <tr>
                <th style={{ padding: '0.85rem 1.2rem' }}>वडा नं.</th>
                <th>वडाको नाम</th>
                <th>वडा अध्यक्ष (जनप्रतिनिधि)</th>
                <th>कार्यालय स्थान</th>
                <th style={{ textAlign: 'right' }}>घरधुरी</th>
                <th style={{ textAlign: 'right' }}>कुल जनसंख्या</th>
                <th style={{ textAlign: 'right' }}>क्षेत्रफल (sq.km)</th>
                <th style={{ textAlign: 'center' }}>साक्षरता दर</th>
                <th style={{ textAlign: 'center' }}>कार्य</th>
              </tr>
            </thead>
            <tbody>
              {filteredWards.map((w) => (
                <tr key={w.wardNo} style={{ backgroundColor: selectedWardNo === w.wardNo ? '#f0f9ff' : 'transparent' }}>
                  <td style={{ padding: '0.85rem 1.2rem', fontWeight: 800, color: '#0f4c81' }}>
                    वडा {w.wardNo}
                  </td>
                  <td style={{ fontWeight: 800, color: '#0f172a' }}>{w.name}</td>
                  <td style={{ color: '#0f172a' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {w.repPhotoUrl ? (
                        <img
                          src={w.repPhotoUrl}
                          alt=""
                          style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #cbd5e1' }}
                        />
                      ) : (
                        <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#e0e7ff', color: '#3730a3', fontSize: '0.72rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {w.chairperson ? w.chairperson.substring(0, 1) : 'व'}
                        </div>
                      )}
                      <div>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{w.chairperson}</div>
                        <div style={{ fontSize: '0.74rem', color: '#059669', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Phone size={10} />
                          {w.phone}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ color: '#64748b', fontSize: '0.82rem' }}>{w.officeLocation}</td>
                  <td style={{ textAlign: 'right', fontWeight: 700 }}>{w.households}</td>
                  <td style={{ textAlign: 'right', fontWeight: 800, color: '#047857' }}>{w.totalPopulation.toLocaleString()}</td>
                  <td style={{ textAlign: 'right', color: '#64748b' }}>{w.areaSqKm}</td>
                  <td style={{ textAlign: 'center' }}>
                    <span style={{ padding: '2px 8px', borderRadius: '4px', background: '#ecfdf5', color: '#047857', fontWeight: 700, fontSize: '0.78rem' }}>
                      {w.literacyRate}%
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      type="button"
                      onClick={() => setSelectedWardNo(w.wardNo)}
                      style={{ padding: '3px 9px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#0f4c81', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                      विवरण हेर्नुहोस्
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* EDIT WARD MODAL */}
      {isEditModalOpen && editingWard && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '1rem' }}>
          <div className="palika-glass-card" style={{ maxWidth: '520px', width: '100%', background: '#ffffff', boxShadow: '0 25px 50px rgba(0,0,0,0.25)' }}>
            <div style={{ padding: '1.25rem 1.4rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
              <h4 style={{ margin: 0, fontWeight: 900, fontSize: '1.1rem', color: '#0f172a' }}>
                वडा नं. {editingWard.wardNo} विवरण अद्यावधिक
              </h4>
              <button onClick={() => setIsEditModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                saveMutation.mutate(editingWard);
              }}
              style={{ padding: '1.4rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}
            >
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '3px' }}>वडाको नाम</label>
                <input
                  type="text"
                  required
                  value={editingWard.name || ''}
                  onChange={(e) => setEditingWard({ ...editingWard, name: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.88rem', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '3px' }}>वडा अध्यक्ष</label>
                  <input
                    type="text"
                    required
                    value={editingWard.chairperson || ''}
                    onChange={(e) => setEditingWard({ ...editingWard, chairperson: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.88rem', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '3px' }}>सम्पर्क फोन</label>
                  <input
                    type="text"
                    value={editingWard.phone || ''}
                    onChange={(e) => setEditingWard({ ...editingWard, phone: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.88rem', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '3px' }}>कार्यालय स्थान</label>
                <input
                  type="text"
                  value={editingWard.officeLocation || ''}
                  onChange={(e) => setEditingWard({ ...editingWard, officeLocation: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.88rem', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.65rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '3px' }}>घरधुरी संख्या</label>
                  <input
                    type="number"
                    value={editingWard.households || ''}
                    onChange={(e) => setEditingWard({ ...editingWard, households: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.88rem', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '3px' }}>कुल जनसंख्या</label>
                  <input
                    type="number"
                    value={editingWard.totalPopulation || ''}
                    onChange={(e) => setEditingWard({ ...editingWard, totalPopulation: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.88rem', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '3px' }}>क्षेत्रफल (sq.km)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingWard.areaSqKm || ''}
                    onChange={(e) => setEditingWard({ ...editingWard, areaSqKm: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.88rem', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', marginTop: '0.75rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                <button type="button" onClick={() => setIsEditModalOpen(false)} style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#475569', fontWeight: 700, cursor: 'pointer' }}>
                  रद्द
                </button>
                <button type="submit" disabled={saveMutation.isPending} style={{ padding: '0.5rem 1.25rem', borderRadius: '8px', background: '#0f4c81', color: '#ffffff', border: 'none', fontWeight: 800, cursor: 'pointer' }}>
                  {saveMutation.isPending ? 'सुरक्षित हुँदैछ...' : 'परिवर्तन सुरक्षित गर्नुहोस्'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
