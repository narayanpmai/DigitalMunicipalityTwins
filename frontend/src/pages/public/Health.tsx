import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { sectoralApi } from '../../api/sectoral';
import type { HealthFacility, AmbulanceContact } from '../../types/health';
import './Health.css';
import {
  HeartPulse,
  Stethoscope,
  Truck,
  PhoneCall,
  MapPin,
  ShieldCheck,
  AlertTriangle,
  Activity,
  Calendar,
  CalendarCheck,
  Pill,
  Baby,
  FileText,
  CheckCircle2,
  Clock,
  Search,
  Building2,
  Droplet,
  Bell,
  ExternalLink,
  ShieldAlert,
  Info,
  ChevronRight,
  User,
} from 'lucide-react';

export const Health: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'facilities' | 'ambulances' | 'notices' | 'medicines' | 'indicators'>('facilities');
  const [selectedWard, setSelectedWard] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [medicineSearch, setMedicineSearch] = useState<string>('');
  const [selectedMedWard, setSelectedMedWard] = useState<string>('all');
  const [selectedMedCategory, setSelectedMedCategory] = useState<string>('all');

  // ── FETCH LIVE HEALTH DATA ──────────────────────────────────────────
  const { data: facilities = [], isLoading: isFacilitiesLoading } = useQuery<HealthFacility[]>({
    queryKey: ['public-health-facilities'],
    queryFn: () => sectoralApi.getHealthFacilities(),
    staleTime: 60000,
  });

  const { data: ambulances = [], isLoading: isAmbulancesLoading } = useQuery<AmbulanceContact[]>({
    queryKey: ['public-health-ambulances'],
    queryFn: () => sectoralApi.getAmbulanceContacts(),
    staleTime: 30000,
  });

  const { data: liveMedicines = [], isLoading: isMedicinesLoading } = useQuery({
    queryKey: ['public-health-medicines', selectedMedWard],
    queryFn: () => sectoralApi.getMedicineStock({
      ward: selectedMedWard !== 'all' ? Number(selectedMedWard) : undefined,
    }),
    staleTime: 45000,
  });

  const { data: dhis2Summary } = useQuery({
    queryKey: ['public-dhis2-summary'],
    queryFn: () => sectoralApi.getDhis2Summary(),
    staleTime: 60000,
  });

  // ── FILTERED FACILITIES ─────────────────────────────────────────────
  const filteredFacilities = useMemo(() => {
    return facilities.filter((f) => {
      const matchWard = selectedWard === 'all' || Number(f.wardNumber) === Number(selectedWard);
      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        (f.nameNepali && f.nameNepali.toLowerCase().includes(q)) ||
        (f.nameEnglish && f.nameEnglish.toLowerCase().includes(q)) ||
        (f.location && f.location.toLowerCase().includes(q)) ||
        (f.chiefName && f.chiefName.toLowerCase().includes(q));
      return matchWard && matchSearch;
    });
  }, [facilities, selectedWard, searchQuery]);

  // ── FILTERED MEDICINES ──────────────────────────────────────────────
  const essentialMedicines = [
    { nameNep: 'सिटामोल (Paracetamol 500mg)', generic: 'Paracetamol', category: 'ज्वरो तथा दुखाइ', indication: 'ज्वरो, टाउको दुखाइ, शरीर दुखाइ' },
    { nameNep: 'जीवन जल (ORS - Jeevan Jal)', generic: 'Oral Rehydration Salts', category: 'झाडापखाला र जलवियोजन', indication: 'झाडापखाला, बान्ता, डिहाइड्रेसन' },
    { nameNep: 'एमोक्सिसिलिन (Amoxicillin 500mg)', generic: 'Amoxicillin Trihydrate', category: 'एन्टिबायोटिक', indication: 'श्वासप्रश्वास, छाला तथा कानको संक्रमण' },
    { nameNep: 'सिट्रिजिन (Cetirizine 10mg)', generic: 'Cetirizine Hydrochloride', category: 'एलर्जी र रुघाखोकी', indication: 'एलर्जी, रुघा, चिलाउने समस्या' },
    { nameNep: 'आइरन तथा फोलिक एसिड', generic: 'Iron + Folic Acid', category: 'मातृ सुरक्षा / रक्तअल्पता', indication: 'गर्भवती महिला, रक्तअल्पता (Anemia) रोकथाम' },
    { nameNep: 'क्याल्सियम तथा भिटामिन डी३', generic: 'Calcium 500mg + Vit D3', category: 'मातृ पोषण', indication: 'गर्भवती तथा सुत्केरी महिलाहरूको हड्डी मजबुती' },
    { nameNep: 'एम्लोडिपिन (Amlodipine 5mg)', generic: 'Amlodipine Besylate', category: 'दीर्घरोग (रक्तचाप)', indication: 'उच्च रक्तचाप (High BP) नियन्त्रण' },
    { nameNep: 'मेटफर्मिन (Metformin 500mg)', generic: 'Metformin Hydrochloride', category: 'दीर्घरोग (मधुमेह)', indication: 'टाइप-२ मधुमेह (Diabetes / Sugar)' },
    { nameNep: 'ओमेप्राजोल (Omeprazole 20mg)', generic: 'Omeprazole Capsules', category: 'ग्यास्ट्रिक तथा एसिडिटी', indication: 'ग्यास्ट्राइटिस, पेट पोल्ने, अल्सर रोकथाम' },
    { nameNep: 'अल्बेन्डाजोल (Albendazole 400mg)', generic: 'Albendazole Chewable', category: 'जुकाको औषधि', indication: 'पेटको जुका तथा परजीवी नियन्त्रण' },
    { nameNep: 'जिंक चक्की (Zinc Sulfate 20mg)', generic: 'Zinc Dispersible', category: 'बाल स्वास्थ्य', indication: 'बालबालिकाको झाडापखाला व्यवस्थापन' },
    { nameNep: 'कोट्रिमक्साजोल (Cotrimoxazole)', generic: 'Sulfamethoxazole + Trimethoprim', category: 'एन्टिबायोटिक', indication: 'पिसाब तथा छातीको संक्रमण' },
    { nameNep: 'आइबुप्रोफेन (Ibuprofen 400mg)', generic: 'Ibuprofen Tablet', category: 'दुखाइ निवारक', indication: 'हाडजोर्नी दुखाइ तथा सुन्निने समस्या' },
    { nameNep: 'पोभिडोन आयोडिन (Povidone Iodine)', generic: 'Betadine Ointment 5%', category: 'घाउ ड्रेसिङ', indication: 'घाउचोट सफा गर्न र संक्रमणबाट जोगाउन' },
  ];

  const filteredMedicines = useMemo(() => {
    const q = medicineSearch.trim().toLowerCase();
    if (!q) return essentialMedicines;
    return essentialMedicines.filter(
      (m) =>
        m.nameNep.toLowerCase().includes(q) ||
        m.generic.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q) ||
        m.indication.toLowerCase().includes(q)
    );
  }, [medicineSearch]);

  const filteredLiveMedicines = useMemo(() => {
    if (!liveMedicines || !Array.isArray(liveMedicines)) return [];
    return liveMedicines.filter((m: any) => {
      const q = medicineSearch.trim().toLowerCase();
      const matchSearch =
        !q ||
        (m.medicineName && m.medicineName.toLowerCase().includes(q)) ||
        (m.genericName && m.genericName.toLowerCase().includes(q)) ||
        (m.category && m.category.toLowerCase().includes(q)) ||
        (m.healthFacilityName && m.healthFacilityName.toLowerCase().includes(q));
      const matchCategory =
        selectedMedCategory === 'all' || m.category === selectedMedCategory;
      return matchSearch && matchCategory;
    });
  }, [liveMedicines, medicineSearch, selectedMedCategory]);

  return (
    <div className="public-health-container">
      {/* ── 1. TOP EMERGENCY HOTLINE STRIP ───────────────────────────── */}
      <div className="emergency-hotline-strip">
        <div className="hotline-title-group">
          <span className="hotline-pulsing-badge">
            <ShieldAlert size={14} />
            २४/७ आकस्मिक हटलाइन
          </span>
          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>आकस्मिक स्वास्थ्य तथा एम्बुलेन्स सेवा:</span>
        </div>

        <div className="hotline-items">
          <a href="tel:102" className="hotline-pill-link" title="एम्बुलेन्स सेवा कल गर्नुहोस्">
            <Truck size={15} />
            <span>एम्बुलेन्स: १०२</span>
          </a>
          <a href="tel:9841556677" className="hotline-pill-link" title="गाउँपालिका एम्बुलेन्स चालक">
            <PhoneCall size={15} />
            <span>गाउँपालिका एम्बुलेन्स: ९८४१५५६६७७</span>
          </a>
          <a href="tel:011460112" className="hotline-pill-link" title="थाङपालधाप अस्पताल आकस्मिक कक्ष">
            <Stethoscope size={15} />
            <span>अस्पताल इमर्जेन्सी: ०११-४६०११२</span>
          </a>
          <a href="tel:9864165353" className="hotline-pill-link" title="स्वास्थ्य शाखा प्रमुख">
            <User size={15} />
            <span>स्वास्थ्य शाखा: ९८६४१६५३५३</span>
          </a>
        </div>
      </div>

      {/* ── 2. HERO HEADER SECTION ───────────────────────────────────── */}
      <div className="health-hero-card">
        <div>
          <h1 className="hero-main-title">
            <HeartPulse size={36} color="#e11d48" />
            सार्वजनिक स्वास्थ्य सेवा तथा नागरिक पोर्टल
          </h1>
          <p className="hero-tagline">
            पाँचपोखरी थाङपाल गाउँपालिका — नागरिकको सहजताका लागि निःशुल्क स्वास्थ्य सेवा, स्वास्थ्य संस्था निर्देशिका, २४ सै घण्टा एम्बुलेन्स, खोप तालिका र सार्वजनिक स्वास्थ्य सूचकहरू।
          </p>
          <div className="hero-badges-row">
            <span className="hero-sub-badge">🏛️ नेपाल सरकार स्वास्थ्य मन्त्रालय HMIS आबद्ध</span>
            <span className="hero-sub-badge">🏥 १५-शय्या थाङपालधाप प्राथमिक अस्पताल</span>
            <span className="hero-sub-badge">👶 १००% पूर्ण खोप सुनिश्चित पालिका</span>
            <span className="hero-sub-badge">🛡️ स्वास्थ्य बीमा बोर्ड (HIB) सेवा केन्द्र</span>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#dcfce7', color: '#15803d', padding: '0.4rem 0.85rem', borderRadius: '9999px', fontWeight: 700, fontSize: '0.85rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#16a34a', display: 'inline-block' }} />
            अनलाइन स्वास्थ्य सेवा सक्रिय
          </div>
          <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.78rem', color: '#94a3b8' }}>
            अद्यावधिक मिति: वि.सं. २०८१ फागुन
          </p>
        </div>
      </div>

      {/* ── 3. KPI METRIC CARDS (MoHP / HMIS Benchmarks) ─────────────── */}
      <div className="health-kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon-wrap" style={{ backgroundColor: '#ffe4e6', color: '#e11d48' }}>
            <Activity size={26} />
          </div>
          <div>
            <div className="kpi-label">कुल ओपीडी सेवाग्राही</div>
            <h3 className="kpi-value">{(dhis2Summary?.totalOpd || 1317).toLocaleString('ne-NP')}</h3>
            <div className="kpi-note">✓ नियमित बहिरङ्ग उपचार सेवा</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap" style={{ backgroundColor: '#e0f2fe', color: '#0284c7' }}>
            <Baby size={26} />
          </div>
          <div>
            <div className="kpi-label">संस्थागत सुरक्षित सुत्केरी</div>
            <h3 className="kpi-value">{(dhis2Summary?.totalDeliveries || 38).toLocaleString('ne-NP')}</h3>
            <div className="kpi-note" style={{ color: '#0284c7' }}>✓ १००% सुरक्षित बर्थिङ सेन्टर</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap" style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}>
            <CheckCircle2 size={26} />
          </div>
          <div>
            <div className="kpi-label">पूर्ण खोप पाएका बालबालिका</div>
            <h3 className="kpi-value">{(dhis2Summary?.totalImmunized || 111).toLocaleString('ne-NP')}</h3>
            <div className="kpi-note">✓ १००% पूर्ण खोप गाउँपालिका</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
            <Building2 size={26} />
          </div>
          <div>
            <div className="kpi-label">स्वास्थ्य संस्थाहरू</div>
            <h3 className="kpi-value">{facilities.length > 0 ? facilities.length.toLocaleString('ne-NP') : '११'}</h3>
            <div className="kpi-note" style={{ color: '#d97706' }}>✓ ८ वटै वडामा स्वास्थ्य पहुँच</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap" style={{ backgroundColor: '#f3e8ff', color: '#9333ea' }}>
            <Truck size={26} />
          </div>
          <div>
            <div className="kpi-label">आकस्मिक एम्बुलेन्स सेवा</div>
            <h3 className="kpi-value">{ambulances.length > 0 ? ambulances.length.toLocaleString('ne-NP') : '३'}</h3>
            <div className="kpi-note" style={{ color: '#9333ea' }}>✓ चौबीसै घण्टा तयारी अवस्था</div>
          </div>
        </div>
      </div>

      {/* ── 4. TABS NAVIGATION ────────────────────────────────────────── */}
      <div className="health-tabs-container">
        <div className="health-tabs-header">
          <div className="tabs-pills-row">
            <button
              className={`tab-pill-btn ${activeTab === 'facilities' ? 'active' : ''}`}
              onClick={() => setActiveTab('facilities')}
            >
              <Building2 size={18} />
              <span>स्वास्थ्य संस्थाहरू (Facilities)</span>
              <span className="tab-pill-count">{filteredFacilities.length}</span>
            </button>

            <button
              className={`tab-pill-btn ${activeTab === 'ambulances' ? 'active' : ''}`}
              onClick={() => setActiveTab('ambulances')}
            >
              <Truck size={18} />
              <span>आपतकालीन एम्बुलेन्स (Ambulance)</span>
              <span className="tab-pill-count">{ambulances.length}</span>
            </button>

            <button
              className={`tab-pill-btn ${activeTab === 'notices' ? 'active' : ''}`}
              onClick={() => setActiveTab('notices')}
            >
              <Bell size={18} />
              <span>सूचना तथा खोप क्यालेन्डर</span>
              <span className="tab-pill-count">४</span>
            </button>

            <button
              className={`tab-pill-btn ${activeTab === 'medicines' ? 'active' : ''}`}
              onClick={() => setActiveTab('medicines')}
            >
              <Pill size={18} />
              <span>निःशुल्क अत्यावश्यक औषधिहरू</span>
              <span className="tab-pill-count">{essentialMedicines.length}</span>
            </button>

            <button
              className={`tab-pill-btn ${activeTab === 'indicators' ? 'active' : ''}`}
              onClick={() => setActiveTab('indicators')}
            >
              <FileText size={18} />
              <span>स्वास्थ्य सूचक तथा नागरिक बडापत्र</span>
            </button>
          </div>
        </div>

        {/* ── TAB 1: FACILITIES ─────────────────────────────────────── */}
        {activeTab === 'facilities' && (
          <div>
            <div className="facilities-filter-bar">
              <div className="search-input-wrap">
                <Search size={16} className="search-icon" />
                <input
                  type="text"
                  placeholder="स्वास्थ्य संस्थाको नाम, स्थान वा इन्चार्ज खोज्नुहोस्..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <select
                className="ward-filter-select"
                value={selectedWard}
                onChange={(e) => setSelectedWard(e.target.value)}
              >
                <option value="all">सबै वडाहरू (All Wards)</option>
                <option value="1">वडा नं. १ (बासखर्क)</option>
                <option value="2">वडा नं. २ (बरुवा)</option>
                <option value="3">वडा नं. ३ (भोताङ)</option>
                <option value="4">वडा नं. ४ (थाङपालकोट)</option>
                <option value="5">वडा नं. ५ (गुन्सा)</option>
                <option value="6">वडा नं. ६ (थाङपालधाप)</option>
                <option value="7">वडा नं. ७ (भोटेनाम्लाङ)</option>
                <option value="8">वडा नं. ८ (लाँगर्चे)</option>
              </select>
            </div>

            <div className="cards-grid-body">
              {isFacilitiesLoading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                  स्वास्थ्य संस्थाहरू लोड हुँदैछ...
                </div>
              ) : filteredFacilities.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                  कुनै स्वास्थ्य संस्था फेला परेन।
                </div>
              ) : (
                <div className="facilities-cards-grid">
                  {filteredFacilities.map((fac) => {
                    const isHospital = fac.nameNepali.includes('अस्पताल') || fac.nameEnglish?.includes('Hospital');
                    const isCommunity = fac.categoryNepali?.includes('सामुदायिक') || fac.nameNepali.includes('ईकाइ');
                    const pillClass = isHospital ? 'hospital' : isCommunity ? 'community' : 'health_post';
                    const pillLabel = isHospital ? 'प्राथमिक अस्पताल' : isCommunity ? 'सामुदायिक स्वास्थ्य इकाई' : 'स्वास्थ्य चौकी';

                    return (
                      <div key={fac.id} className="facility-card">
                        <div>
                          <div className="facility-header">
                            <div>
                              <h3 className="facility-name">{fac.nameNepali || fac.nameEnglish}</h3>
                              <p className="facility-location-sub">
                                <MapPin size={14} color="#0284c7" />
                                वडा नं. {fac.wardNumber}, {fac.location || 'पाँचपोखरी थाङपाल'}
                              </p>
                            </div>
                            <span className={`facility-type-pill ${pillClass}`}>{pillLabel}</span>
                          </div>

                          <div className="facility-details-list">
                            <div className="detail-row">
                              <span className="label">इन्चार्ज / सम्पर्क व्यक्ति:</span>
                              <span className="value">{fac.chiefName || 'स्वास्थ्यकर्मी'}</span>
                            </div>
                            <div className="detail-row">
                              <span className="label">आधिकारिक फोन:</span>
                              <span className="value">{fac.phone || 'उपलब्ध छैन'}</span>
                            </div>
                            <div className="detail-row">
                              <span className="label">सेवा समय:</span>
                              <span className="value">
                                {isHospital ? '२४/७ आकस्मिक / ओपीडी १०-५' : 'बिहान १०:०० - ५:०० (प्रसूति २४/७)'}
                              </span>
                            </div>
                          </div>

                          <div className="facility-services-tags">
                            <span className="service-tag">✓ ओपीडी सेवा</span>
                            <span className="service-tag">✓ निःशुल्क औषधि</span>
                            <span className="service-tag">✓ बाल खोप तथा पोषण</span>
                            {isHospital && <span className="service-tag" style={{ background: '#ffe4e6', color: '#be123c', fontWeight: 600 }}>✓ १५-शय्या भर्ना (IPD)</span>}
                            <span className="service-tag">✓ सुरक्षित प्रसूति सेवा</span>
                          </div>
                        </div>

                        <div className="facility-card-actions">
                          {fac.phone ? (
                            <a href={`tel:${fac.phone}`} className="call-now-btn">
                              <PhoneCall size={15} />
                              <span>फोन गर्नुहोस् ({fac.phone})</span>
                            </a>
                          ) : (
                            <button disabled className="call-now-btn" style={{ opacity: 0.5, cursor: 'not-allowed' }}>
                              फोन नम्बर छैन
                            </button>
                          )}

                          <a
                            href={`/gis-map?filter=health&ward=${fac.wardNumber}`}
                            className="map-link-btn"
                            style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }}
                            title="डिजिटल ट्विन २D/३D नक्सामा हेर्नुहोस्"
                          >
                            <Activity size={15} />
                            <span>डिजिटल ट्विन</span>
                          </a>

                          {fac.latitude && fac.longitude && (
                            <a
                              href={`https://www.google.com/maps?q=${fac.latitude},${fac.longitude}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="map-link-btn"
                              title="गुगल म्यापमा नक्सा हेर्नुहोस्"
                            >
                              <MapPin size={15} />
                              <span>नक्सा</span>
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB 2: AMBULANCES ─────────────────────────────────────── */}
        {activeTab === 'ambulances' && (
          <div className="cards-grid-body">
            <div style={{ marginBottom: '1.5rem', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '1rem 1.25rem', borderRadius: '12px', color: '#166534', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <ShieldCheck size={24} color="#16a34a" />
              <div>
                <strong>२४/७ नागरिक आकस्मिक सेवा प्रत्याभूति:</strong> पाँचपोखरी थाङपाल गाउँपालिकाका कुनै पनि स्थानबाट आकस्मिक बिरामी, गर्भवती वा घाइते उद्धारको लागि तलका एम्बुलेन्स चालकहरूलाई सिधै सम्पर्क गर्न सक्नुहुन्छ।
              </div>
            </div>

            {isAmbulancesLoading ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                एम्बुलेन्स विवरण लोड हुँदैछ...
              </div>
            ) : (
              <div className="ambulances-grid">
                {ambulances.map((amb: any) => {
                  const statusClass = amb.isAvailable ? 'available' : 'on-duty';
                  const statusLabel = amb.isAvailable ? 'तत्काल उपलब्ध (Available)' : 'बिरामी सेवामा / सेवारत';

                  return (
                    <div key={amb.id} className={`ambulance-card ${statusClass}`}>
                      <div>
                        <div className="ambulance-top-row">
                          <span className={`ambulance-badge-status ${statusClass}`}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: amb.isAvailable ? '#16a34a' : '#f59e0b', display: 'inline-block' }} />
                            {statusLabel}
                          </span>
                          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
                            वडा नं. {amb.wardNumber}
                          </span>
                        </div>

                        <h3 className="ambulance-vehicle-no">{amb.vehicleNumber}</h3>
                        
                        {amb.ambulanceType && (
                          <div style={{ marginBottom: '0.5rem' }}>
                            <span style={{ background: '#e0f2fe', color: '#0369a1', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '9999px', fontWeight: 700 }}>
                              🚑 {amb.ambulanceType}
                            </span>
                          </div>
                        )}

                        <p className="ambulance-station">
                          <MapPin size={15} color="#0284c7" />
                          स्टेसन: <strong>{amb.stationLocation}</strong>
                        </p>

                        <div className="driver-info-box">
                          <div className="driver-info-row">
                            <span style={{ color: '#64748b' }}>चालकको नाम:</span>
                            <strong style={{ color: '#0f172a' }}>{amb.driverName}</strong>
                          </div>
                          <div className="driver-info-row">
                            <span style={{ color: '#64748b' }}>सम्पर्क नम्बर:</span>
                            <strong style={{ color: '#0284c7' }}>{amb.contactNumber}</strong>
                          </div>
                          {amb.notes && (
                            <div className="driver-info-row">
                              <span style={{ color: '#64748b' }}>कैफियत:</span>
                              <span style={{ color: '#475569' }}>{amb.notes}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
                        <a href={`tel:${amb.contactNumber}`} className="ambulance-big-call-btn">
                          <PhoneCall size={18} />
                          <span>चालकलाई तुरुन्त कल गर्नुहोस् ({amb.contactNumber})</span>
                        </a>

                        <a
                          href={`/gis-map?filter=ambulance&ward=${amb.wardNumber}`}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            padding: '0.55rem',
                            background: '#f8fafc',
                            border: '1.5px solid #cbd5e1',
                            borderRadius: '8px',
                            color: '#0f172a',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            textDecoration: 'none',
                            transition: 'all 0.2s',
                          }}
                        >
                          <Activity size={16} color="#0284c7" />
                          <span>डिजिटल ट्विन नक्सामा ट्र्याक गर्नुहोस्</span>
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Ambulance Usage Guidelines */}
            <div style={{ marginTop: '2.5rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.5rem' }}>
              <h4 style={{ margin: '0 0 0.75rem 0', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Info size={18} color="#0284c7" />
                एम्बुलेन्स सेवा लिँदा ध्यान दिनुपर्ने कुराहरू:
              </h4>
              <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#475569', fontSize: '0.9rem', lineHeight: '1.7' }}>
                <li>फोन गर्दा बिरामीको अवस्था, उमेर र हालको स्थान (घर, टोल, नजिकैको मुख्य चोक वा स्कुल) स्पष्ट खुलाउनुहोस्।</li>
                <li>प्रसूति व्यथा लागेका आमाहरूका लागि पालिकाले निःशुल्क एम्बुलेन्स सेवा तथा यातायात प्रोत्साहन खर्च उपलब्ध गराउँछ।</li>
                <li>यदि चालक व्यस्त भएमा तुरुन्त नजिकैको स्वास्थ्य चौकी वा हटलाइन <strong>१०२</strong> मा सम्पर्क गर्नुहोस्।</li>
              </ul>
            </div>
          </div>
        )}

        {/* ── TAB 3: NOTICES & IMMUNIZATION ─────────────────────────── */}
        {activeTab === 'notices' && (
          <div className="cards-grid-body">
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bell size={20} color="#0284c7" />
              आधिकारिक जनस्वास्थ्य सूचनाहरू (Health Notices)
            </h3>

            <div className="notices-container" style={{ marginBottom: '2.5rem' }}>
              <div className="notice-card urgent">
                <div className="notice-icon-box">
                  <AlertTriangle size={24} />
                </div>
                <div className="notice-content">
                  <div className="notice-header-row">
                    <h4 className="notice-title">मौसमी सरुवा रोग तथा डेंगु नियन्त्रण सम्बन्धी अत्यन्त जरुरी सूचना</h4>
                    <span className="notice-date-badge">२०८१/११/२५</span>
                  </div>
                  <p className="notice-body-text">
                    मनसुन तथा मौसम परिवर्तनको समयमा पानी जम्ने भाँडाकुँडा, टायर र कुलरहरूमा लामखुट्टेले फुल पार्ने भएकाले 'खोज र नष्ट गर' अभियानमा सहभागी बनौं। उच्च ज्वरो, आँखाको गेडी दुखाइ, जोर्नी दुखाइ भएमा तुरुन्त नजिकैको स्वास्थ्य चौकीमा निःशुल्क जाँच गराउनुहोला।
                  </p>
                  <div className="notice-footer-meta">
                    <span>📌 जारी गर्ने: स्वास्थ्य तथा जनसंख्या महाशाखा, पाँचपोखरी थाङपाल गाउँपालिका</span>
                  </div>
                </div>
              </div>

              <div className="notice-card campaign">
                <div className="notice-icon-box">
                  <CalendarCheck size={24} />
                </div>
                <div className="notice-content">
                  <div className="notice-header-row">
                    <h4 className="notice-title">मासिक नियमित बाल खोप कार्यक्रम सञ्चालन सम्बन्धी</h4>
                    <span className="notice-date-badge">२०८१/११/०१</span>
                  </div>
                  <p className="notice-body-text">
                    प्रत्येक महिनाको ८ र २२ गते पालिकाभित्रका २४ वटै खोप केन्द्रहरूमा १५ महिनासम्मका सम्पूर्ण बालबालिकाहरूका लागि नेपाल सरकारद्वारा तोकिएका १३ प्रकारका रोग विरुद्धको खोप निःशुल्क सञ्चालन भइरहेको छ। आफ्ना बालबालिकालाई नछुटाई खोप लगाउनुहोला।
                  </p>
                  <div className="notice-footer-meta">
                    <span>📌 लक्षित समूह: ० देखि १५ महिनासम्मका बालबालिकाहरू</span>
                  </div>
                </div>
              </div>

              <div className="notice-card">
                <div className="notice-icon-box">
                  <HeartPulse size={24} />
                </div>
                <div className="notice-content">
                  <div className="notice-header-row">
                    <h4 className="notice-title">गर्भवती महिलाहरूको लागि ४ पटक गर्भजाँच (ANC) र निःशुल्क पोषण वितरण</h4>
                    <span className="notice-date-badge">नियमित कार्यक्रम</span>
                  </div>
                  <p className="notice-body-text">
                    गर्भ रहेको ४, ६, ८ र ९ महिनामा नजिकैको स्वास्थ्य संस्थामा गई अनिवार्य रूपमा भिडियो एक्सरे र ल्याब परीक्षण गराउनुहोला। गर्भजाँच पूरा गर्ने आमाहरूलाई सरकारको प्रोटोकल अनुसार निःशुल्क आइरन-फोलिक चक्की, क्याल्सियम, र न्यानो झोला उपहार उपलब्ध गराइन्छ।
                  </p>
                  <div className="notice-footer-meta">
                    <span>📌 सेवा केन्द्र: सबै स्वास्थ्य चौकी तथा थाङपालधाप अस्पताल</span>
                  </div>
                </div>
              </div>

              <div className="notice-card">
                <div className="notice-icon-box">
                  <Droplet size={24} />
                </div>
                <div className="notice-content">
                  <div className="notice-header-row">
                    <h4 className="notice-title">आकस्मिक रक्तदाता समन्वय सञ्जाल (Emergency Blood Donors)</h4>
                    <span className="notice-date-badge">२४/७ सेवा</span>
                  </div>
                  <p className="notice-body-text">
                    शल्यक्रिया वा दुर्घटनाका घाइतेका लागि आकस्मिक रगत आवश्यक परेमा नेपाल रेडक्रस सोसाइटी पाँचपोखरी उपशाखा तथा स्वास्थ्य शाखाको हटलाइनमा सम्पर्क गरी रक्तदाता समन्वय गर्न सकिनेछ।
                  </p>
                  <div className="notice-footer-meta">
                    <span>📞 आकस्मिक सम्पर्क: ९८५११००२२२ / ०११-४६०२२२</span>
                  </div>
                </div>
              </div>
            </div>

            {/* National Immunization Schedule Table */}
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Baby size={20} color="#16a34a" />
              नेपाल सरकारको राष्ट्रिय बाल खोप तालिका (National Immunization Schedule)
            </h3>

            <div className="immunization-table-wrap">
              <table className="immunization-table">
                <thead>
                  <tr>
                    <th>उमेर (Age)</th>
                    <th>खोपको नाम (Vaccine)</th>
                    <th>रोकथाम हुने रोगहरू (Diseases Prevented)</th>
                    <th>मात्रा र विधि</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><span className="age-badge">जन्मनासाथ</span></td>
                    <td><strong>BCG (बिसिजी)</strong></td>
                    <td>क्षयरोग (Tuberculosis)</td>
                    <td>१ मात्रा (छालाभित्र)</td>
                  </tr>
                  <tr>
                    <td><span className="age-badge">६ हप्ता (१.५ महिना)</span></td>
                    <td><strong>रोटा-१, पेन्टा-१, एफपिभी-१, पिपिभी-१</strong></td>
                    <td>रोटा भाइरस झाडापखाला, धनुष्टङ्कार, लहरेखोकी, भ्यागुतेरोग, हेपाटाइटिस बी, हिब, निमोनिया</td>
                    <td>मुखबाट थोपा + पाखुरा/तिघ्रामा सुई</td>
                  </tr>
                  <tr>
                    <td><span className="age-badge">१० हप्ता (२.५ महिना)</span></td>
                    <td><strong>रोटा-२, पेन्टा-२, पिपिभी-२</strong></td>
                    <td>दोस्रो मात्रा निरन्तरता (सुरक्षा कभरेज वृद्धि)</td>
                    <td>मुखबाट + सुई</td>
                  </tr>
                  <tr>
                    <td><span className="age-badge">१४ हप्ता (३.५ महिना)</span></td>
                    <td><strong>पेन्टा-३, एफपिभी-२, ओपिभी (OPV)</strong></td>
                    <td>धनुष्टङ्कार, लहरेखोकी, भ्यागुतेरोग, पोलियोमाइलाइटिस</td>
                    <td>मुखबाट थोपा + सुई</td>
                  </tr>
                  <tr>
                    <td><span className="age-badge">९ महिना</span></td>
                    <td><strong>दादुरा-रुबेला (MR-1), टाइफाइड (TCV)</strong></td>
                    <td>दादुरा, रुबेला र टाइफाइड ज्वरो</td>
                    <td>सुई (दायाँ पाखुरा)</td>
                  </tr>
                  <tr>
                    <td><span className="age-badge">१५ महिना</span></td>
                    <td><strong>दादुरा-रुबेला (MR-2)</strong></td>
                    <td>दादुरा तथा रुबेला पूर्ण सुरक्षा (बूस्टर मात्रा)</td>
                    <td>सुई (बायाँ पाखुरा)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TAB 4: ESSENTIAL FREE MEDICINES & E-LMIS ─────────────── */}
        {activeTab === 'medicines' && (
          <div className="cards-grid-body">
            <div style={{ marginBottom: '1.5rem', background: '#eff6ff', border: '1px solid #bfdbfe', padding: '1rem 1.25rem', borderRadius: '12px', color: '#1e40af', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <strong>💊 e-LMIS डिजिटल औषधि व्यवस्थापन तथा निःशुल्क स्वास्थ्य हक:</strong> पालिकाका सबै स्वास्थ्य संस्था र अस्पतालमा उपलब्ध अत्यावश्यक औषधिहरूको लाइभ मौज्दात, ब्याच नम्बर र म्याद यहाँबाट प्रत्यक्ष हेर्न सकिन्छ।
              </div>
              <a
                href="/health"
                style={{
                  background: '#2563eb',
                  color: 'white',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                स्वास्थ्य शाखा लगइन ➔
              </a>
            </div>

            {/* Filter and Search Strip */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <div className="search-input-wrap" style={{ background: '#fff', border: '1.5px solid #cbd5e1', borderRadius: '8px', padding: '0.5rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Search size={16} color="#64748b" />
                <input
                  type="text"
                  placeholder="औषधि, जेनेरिक नाम वा रोग खोजी (उदा: Paracetamol)..."
                  value={medicineSearch}
                  onChange={(e) => setMedicineSearch(e.target.value)}
                  style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fff', border: '1.5px solid #cbd5e1', borderRadius: '8px', padding: '0.4rem 0.75rem' }}>
                <span style={{ fontSize: '0.85rem', color: '#64748b', whiteSpace: 'nowrap' }}>वडा:</span>
                <select
                  value={selectedMedWard}
                  onChange={(e) => setSelectedMedWard(e.target.value)}
                  style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.85rem', fontWeight: 600, color: '#0f172a', background: 'transparent' }}
                >
                  <option value="all">पालिकाभरका सबै स्वास्थ्य संस्था</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((w) => (
                    <option key={w} value={w}>वडा नं. {w}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fff', border: '1.5px solid #cbd5e1', borderRadius: '8px', padding: '0.4rem 0.75rem' }}>
                <span style={{ fontSize: '0.85rem', color: '#64748b', whiteSpace: 'nowrap' }}>वर्ग:</span>
                <select
                  value={selectedMedCategory}
                  onChange={(e) => setSelectedMedCategory(e.target.value)}
                  style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.85rem', fontWeight: 600, color: '#0f172a', background: 'transparent' }}
                >
                  <option value="all">सबै वर्ग (All Categories)</option>
                  <option value="essential">अत्यावश्यक (Essential)</option>
                  <option value="antibiotic">एन्टिबायोटिक (Antibiotic)</option>
                  <option value="mch">मातृ तथा बाल स्वास्थ्य (MCH)</option>
                  <option value="chronic">दीर्घरोग (NCD / Chronic)</option>
                </select>
              </div>
            </div>

            {/* Live e-LMIS Medicine Cards */}
            {isMedicinesLoading ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                औषधि मौज्दात विवरण लोड हुँदैछ...
              </div>
            ) : filteredLiveMedicines.length > 0 ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h4 style={{ margin: 0, fontSize: '1rem', color: '#0f172a', fontWeight: 700 }}>
                    e-LMIS प्रत्यक्ष मौज्दात ({filteredLiveMedicines.length} औषधिहरू उपलब्ध)
                  </h4>
                  <span style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: 600 }}>● अनलाइन अद्यावधिक</span>
                </div>

                <div className="medicines-cards-grid">
                  {filteredLiveMedicines.map((med: any) => {
                    const isSufficient = med.status === 'sufficient' || Number(med.stockQuantity) > (Number(med.minimumRequiredStock) || 0);
                    const isOut = med.status === 'out_of_stock' || Number(med.stockQuantity) <= 0;
                    const statusBadge = isOut ? (
                      <span style={{ background: '#fee2e2', color: '#b91c1c', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                        🔴 सकिएको
                      </span>
                    ) : isSufficient ? (
                      <span style={{ background: '#dcfce7', color: '#15803d', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                        🟢 पर्याप्त मौज्दात
                      </span>
                    ) : (
                      <span style={{ background: '#fef3c7', color: '#b45309', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                        🟡 न्यून मौज्दात
                      </span>
                    );

                    return (
                      <div key={med.id} className="medicine-item-card" style={{ borderTop: isOut ? '3px solid #ef4444' : '3px solid #10b981' }}>
                        <div>
                          <div className="med-header">
                            <h4 className="med-nameNep">{med.medicineName}</h4>
                            {statusBadge}
                          </div>
                          <p className="med-generic">जेनेरिक: {med.genericName || med.medicineName}</p>
                          
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', background: '#f8fafc', padding: '6px 10px', borderRadius: '6px', fontSize: '0.85rem' }}>
                            <span style={{ color: '#64748b' }}>स्वास्थ्य संस्था:</span>
                            <strong style={{ color: '#0f172a' }}>{med.healthFacilityName || `वडा नं. ${med.wardNumber}`}</strong>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.5rem', fontSize: '0.8rem' }}>
                            <div style={{ background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px' }}>
                              <span style={{ color: '#64748b' }}>मौज्दात: </span>
                              <strong style={{ color: '#0f172a' }}>{Number(med.stockQuantity || 0).toLocaleString('ne-NP')} {med.unit || 'थान'}</strong>
                            </div>
                            <div style={{ background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px' }}>
                              <span style={{ color: '#64748b' }}>ब्याच: </span>
                              <strong style={{ color: '#0f172a' }}>{med.batchNo || 'N/A'}</strong>
                            </div>
                          </div>

                          {med.expiryDate && (
                            <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.4rem' }}>
                              म्याद: <strong style={{ color: '#334155' }}>{med.expiryDate}</strong>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div>
                <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ margin: 0, fontSize: '1rem', color: '#0f172a', fontWeight: 700 }}>
                    नेपाल सरकार राष्ट्रिय निःशुल्क औषधि निर्देशिका
                  </h4>
                </div>

                <div className="medicines-cards-grid">
                  {filteredMedicines.map((med, idx) => (
                    <div key={idx} className="medicine-item-card">
                      <div>
                        <div className="med-header">
                          <h4 className="med-nameNep">{med.nameNep}</h4>
                          <span className="med-free-badge">निःशुल्क (FREE)</span>
                        </div>
                        <p className="med-generic">जेनेरिक: {med.generic}</p>
                        <div style={{ fontSize: '0.8rem', color: '#0284c7', fontWeight: 600 }}>
                          वर्ग: {med.category}
                        </div>
                      </div>

                      <div className="med-indication">
                        <strong>प्रयोग:</strong> {med.indication}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ marginTop: '2rem', padding: '1rem', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', color: '#92400e', fontSize: '0.88rem' }}>
              ⚠️ <strong>नागरिक ध्यानाकर्षण:</strong> कुनै पनि औषधि स्वास्थ्यकर्मी वा चिकित्सकको सल्लाह र प्रेस्क्रिप्सन बिना सेवन नगर्नुहोला। यदि कुनै स्वास्थ्य चौकीमा यी अत्यावश्यक औषधि अभाव भएको खण्डमा तुरुन्त पालिकाको स्वास्थ्य शाखामा जानकारी गराउनुहोला।
            </div>
          </div>
        )}

        {/* ── TAB 5: INDICATORS & CITIZEN CHARTER ────────────────────── */}
        {activeTab === 'indicators' && (
          <div className="cards-grid-body">
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.25rem' }}>
              📊 पालिका स्वास्थ्य प्रगति सूचकहरू (Health Benchmarks & Targets)
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
              <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontWeight: 700 }}>
                  <span>पूर्ण खोप कभरेज दर</span>
                  <span style={{ color: '#16a34a' }}>१००% (लक्ष्य हासिल)</span>
                </div>
                <div style={{ width: '100%', height: '10px', background: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
                  <div style={{ width: '100%', height: '100%', background: '#16a34a', borderRadius: '9999px' }} />
                </div>
                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                  पालिकाभित्रका सबै वडाका ९ महिनादेखि १५ महिनासम्मका बालबालिकालाई पूर्ण खोप सुनिश्चित।
                </p>
              </div>

              <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontWeight: 700 }}>
                  <span>संस्थागत प्रसूति दर (Safe Delivery)</span>
                  <span style={{ color: '#0284c7' }}>९६.४%</span>
                </div>
                <div style={{ width: '100%', height: '10px', background: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
                  <div style={{ width: '96.4%', height: '100%', background: '#0284c7', borderRadius: '9999px' }} />
                </div>
                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                  घरमा हुने असुरक्षित सुत्केरी अन्त्य गरी स्वास्थ्य संस्थामा प्रसूति गराउने लक्ष्य उन्मुख।
                </p>
              </div>

              <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontWeight: 700 }}>
                  <span>अत्यावश्यक औषधि उपलब्धता दर</span>
                  <span style={{ color: '#d97706' }}>९२.०%</span>
                </div>
                <div style={{ width: '100%', height: '10px', background: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
                  <div style={{ width: '92%', height: '100%', background: '#d97706', borderRadius: '9999px' }} />
                </div>
                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                  e-LMIS अनलाइन मौज्दात व्यवस्थापन मार्फत स्वास्थ्य चौकीहरूमा नियमित औषधि आपूर्ति।
                </p>
              </div>
            </div>

            {/* Citizen Charter Table */}
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={20} color="#0284c7" />
              नागरिक बडापत्र: स्वास्थ्य सेवा (Citizen Charter)
            </h3>

            <div className="immunization-table-wrap">
              <table className="immunization-table">
                <thead>
                  <tr>
                    <th>क्र.सं.</th>
                    <th>सेवाको प्रकार</th>
                    <th>लाग्ने दस्तुर</th>
                    <th>लाग्ने समय</th>
                    <th>आवश्यक कागजात</th>
                    <th>जिम्मेवार अधिकारी</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>१</td>
                    <td><strong>ओपीडी स्वास्थ्य परीक्षण</strong></td>
                    <td><span style={{ color: '#16a34a', fontWeight: 700 }}>निःशुल्क</span></td>
                    <td>१० - १५ मिनेट</td>
                    <td>ओपीडी टिकट वा पुरानो पुर्जी</td>
                    <td>स्वास्थ्यकर्मी / डाक्टर</td>
                  </tr>
                  <tr>
                    <td>२</td>
                    <td><strong>सुरक्षित प्रसूति तथा नवजात शिशु स्याहार</strong></td>
                    <td><span style={{ color: '#16a34a', fontWeight: 700 }}>निःशुल्क + यातायात खर्च</span></td>
                    <td>तत्काल (२४ घण्टा)</td>
                    <td>मातृ सुरक्षा कार्ड</td>
                    <td>SBA नर्स / अनमी</td>
                  </tr>
                  <tr>
                    <td>३</td>
                    <td><strong>आधारभूत औषधि वितरण (९८ प्रकार)</strong></td>
                    <td><span style={{ color: '#16a34a', fontWeight: 700 }}>निःशुल्क</span></td>
                    <td>तत्काल</td>
                    <td>चिकित्सकको प्रेस्क्रिप्सन</td>
                    <td>फार्मेसी इन्चार्ज / अ.हे.ब.</td>
                  </tr>
                  <tr>
                    <td>४</td>
                    <td><strong>बाल खोप तथा वृद्धि अनुगमन</strong></td>
                    <td><span style={{ color: '#16a34a', fontWeight: 700 }}>निःशुल्क</span></td>
                    <td>१० मिनेट</td>
                    <td>बाल खोप कार्ड</td>
                    <td>खोप सुपरभाइजर / स्वास्थ्यकर्मी</td>
                  </tr>
                  <tr>
                    <td>५</td>
                    <td><strong>स्वास्थ्य बीमा प्रथम विन्दु सेवा (OPD/IPD)</strong></td>
                    <td>१०% सह-भुक्तानी (Co-pay)</td>
                    <td>नियमित</td>
                    <td>बीमा परिचयपत्र</td>
                    <td>बीमा सम्पर्क व्यक्ति / अस्पताल</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ── 5. PRIVACY & SECURITY DECLARATION ──────────────────────────── */}
      <div className="privacy-assurance-card">
        <div className="privacy-icon-box">
          <ShieldCheck size={28} />
        </div>
        <div>
          <h4 className="privacy-title">🔒 नागरिक व्यक्तिगत स्वास्थ्य डेटा गोपनीयता तथा सुरक्षाको सुनिश्चितता</h4>
          <p className="privacy-text">
            यस सार्वजनिक स्वास्थ्य पोर्टलमा प्रदर्शित विवरणहरू केवल पालिकाको समष्टिगत प्रतिवेदन, संस्थागत निर्देशिका तथा नागरिक सूचनाका लागि मात्र हो। बिरामीहरूको व्यक्तिगत नाम, रोगको अवस्था, व्यक्तिगत प्रेस्क्रिप्सन तथा ल्याब रिपोर्टहरू राष्ट्रिय स्वास्थ्य सूचना गोपनीयता नीति (Health Data Privacy Regulations) अनुसार पूर्ण रूपमा गोप्य र सुरक्षित राखिएको छ।
          </p>
        </div>
      </div>
    </div>
  );
};
export default Health;
