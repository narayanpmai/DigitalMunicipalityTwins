import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { sectoralApi } from '../../api/sectoral';
import type { School, EducationOverviewStats } from '../../types/education';
import { SchoolDetailModal } from '../../features/education/components/SchoolDetailModal';
import './Education.css';
import {
  GraduationCap,
  School as SchoolIcon,
  Users,
  BookOpen,
  Utensils,
  Laptop,
  FlaskConical,
  Droplets,
  Zap,
  Search,
  MapPin,
  FileText,
  ExternalLink,
  Phone,
  CheckCircle2,
  LayoutGrid,
  List,
  Sparkles,
  Award,
  ChevronRight,
  X,
  Building2,
  BarChart3,
  ShieldCheck,
  Calendar,
  Trophy,
  TrendingUp,
  HeartHandshake,
  CalendarDays,
  Percent,
  Check
} from 'lucide-react';

export const Education: React.FC = () => {
  // Navigation active tab
  const [activeTab, setActiveTab] = useState<'directory' | 'exam_results' | 'nutrition' | 'scholarships' | 'ward_summary' | 'charter'>('directory');

  // State for filters & view
  const [selectedWard, setSelectedWard] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [filterIctOnly, setFilterIctOnly] = useState<boolean>(false);
  const [filterScienceLabOnly, setFilterScienceLabOnly] = useState<boolean>(false);
  const [filterLibraryOnly, setFilterLibraryOnly] = useState<boolean>(false);

  // Selected school for printable report card modal
  const [selectedSchoolForReport, setSelectedSchoolForReport] = useState<School | null>(null);

  // ── FETCH LIVE EDUCATION DATA ──────────────────────────────────────────
  const { data: schools = [], isLoading: isSchoolsLoading } = useQuery<School[]>({
    queryKey: ['public-education-schools'],
    queryFn: () => sectoralApi.getSchools(),
    staleTime: 60000,
  });

  const { data: stats } = useQuery<EducationOverviewStats>({
    queryKey: ['public-education-overview'],
    queryFn: () => sectoralApi.getEducationOverview(),
    staleTime: 60000,
  });

  // ── FILTERED SCHOOLS ──────────────────────────────────────────────────
  const filteredSchools = useMemo(() => {
    return schools.filter((s) => {
      // Ward filter
      const matchWard = selectedWard === 'all' || Number(s.wardNumber) === Number(selectedWard);

      // Level filter
      const matchLevel =
        selectedLevel === 'all' ||
        (selectedLevel === 'secondary' && s.level?.toLowerCase() === 'secondary') ||
        (selectedLevel === 'basic' && s.level?.toLowerCase() === 'basic');

      // Facility filters
      const matchIct = !filterIctOnly || Boolean(s.hasIctLab);
      const matchScienceLab = !filterScienceLabOnly || Boolean(s.hasScienceLab);
      const matchLibrary = !filterLibraryOnly || Boolean(s.hasLibrary);

      // Search Query
      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        (s.name && s.name.toLowerCase().includes(q)) ||
        (s.nameNepali && s.nameNepali.toLowerCase().includes(q)) ||
        (s.nameEnglish && s.nameEnglish.toLowerCase().includes(q)) ||
        (s.emisCode && s.emisCode.toLowerCase().includes(q)) ||
        (s.code && s.code.toLowerCase().includes(q)) ||
        (s.tole && s.tole.toLowerCase().includes(q)) ||
        (s.principalName && s.principalName.toLowerCase().includes(q));

      return matchWard && matchLevel && matchIct && matchScienceLab && matchLibrary && matchSearch;
    });
  }, [schools, selectedWard, selectedLevel, filterIctOnly, filterScienceLabOnly, filterLibraryOnly, searchQuery]);

  // Derive Ward Summaries from live schools data if backend wardBreakdown isn't available
  const wardSummaries = useMemo(() => {
    if (stats?.wardBreakdown && stats.wardBreakdown.length > 0) {
      return stats.wardBreakdown;
    }
    const wards = [1, 2, 3, 4, 5, 6, 7, 8];
    return wards.map((w) => {
      const wardSchools = schools.filter((s) => Number(s.wardNumber) === w);
      const students = wardSchools.reduce((acc, curr) => acc + (Number(curr.totalStudents) || 0), 0);
      const teachers = wardSchools.reduce((acc, curr) => acc + (Number(curr.totalTeachers) || 0), 0);
      return {
        wardNumber: w,
        schoolCount: wardSchools.length,
        totalStudents: students,
        totalTeachers: teachers,
      };
    });
  }, [stats?.wardBreakdown, schools]);

  return (
    <div className="public-education-container">
      {/* ── 1. TOP INFORMATION BANNER STRIP ───────────────────────────── */}
      <div className="edu-info-strip">
        <div className="edu-info-strip-left">
          <span className="edu-badge-pulsing">
            <Sparkles size={14} />
            शैक्षिक सत्र २०८१/२०८२
          </span>
          <span style={{ fontWeight: 600 }}>
            पाँचपोखरी थाङपाल गाउँपालिका — शिक्षा, युवा तथा खेलकुद शाखा (EMIS एकीकृत डिजिटल पोर्टल)
          </span>
        </div>
        <div className="edu-info-strip-right">
          <a href="tel:9864165300" className="edu-strip-link" title="शिक्षा शाखा सम्पर्क">
            <Phone size={14} />
            सम्पर्क: ९८६४१६५३००
          </a>
          <a href="/gis-map?filter=school" className="edu-strip-link" title="GIS नक्सामा विद्यालयहरू हेर्नुहोस्">
            <MapPin size={14} />
            GIS डिजिटल नक्सा
          </a>
        </div>
      </div>

      {/* ── 2. HERO SECTION ───────────────────────────────────────────── */}
      <div className="edu-hero">
        <div className="edu-hero-header">
          <div className="edu-title-group">
            <h1>
              <GraduationCap size={38} color="#0284c7" />
              शिक्षा प्रणाली तथा विद्यालय डिजिटल प्रोफाइल
            </h1>
            <p>
              सबैका लागि गुणस्तरीय, व्यावहारिक र प्रविधिमैत्री शिक्षा — पाँचपोखरी थाङपाल गाउँपालिकाका सम्पूर्ण
              सामुदायिक तथा संस्थागत विद्यालयहरूको प्रत्यक्ष विवरण, भौतिक पूर्वाधार, BLE/SEE परीक्षा नतिजा, दिवा खाजा पोषण, छात्रवृत्ति तथा आधिकारिक EMIS रिपोर्ट कार्ड।
            </p>
          </div>
          <div className="edu-hero-actions">
            <button
              onClick={() => setActiveTab('directory')}
              className="edu-btn-action edu-btn-primary"
            >
              <SchoolIcon size={16} />
              विद्यालय सूची हेर्नुहोस्
            </button>
            <button
              onClick={() => setActiveTab('exam_results')}
              className="edu-btn-action edu-btn-outline"
            >
              <Trophy size={16} />
              BLE/SEE नतिजा बोर्ड
            </button>
          </div>
        </div>

        {/* ── 3. KPI BENCHMARK CARDS ──────────────────────────────────── */}
        <div className="edu-stats-grid">
          {/* Total Schools */}
          <div className="edu-stat-card blue">
            <div className="edu-stat-top">
              <span className="edu-stat-label">कुल विद्यालयहरू</span>
              <div className="edu-stat-icon-wrapper">
                <SchoolIcon size={20} />
              </div>
            </div>
            <div className="edu-stat-value">{stats?.totalSchools || schools.length || 27} वटा</div>
            <div className="edu-stat-subtext">
              <span>{stats?.communitySchools || 26} सामुदायिक</span>
              <span>•</span>
              <span>{stats?.secondarySchools || 11} माध्यमिक</span>
            </div>
          </div>

          {/* Total Students */}
          <div className="edu-stat-card emerald">
            <div className="edu-stat-top">
              <span className="edu-stat-label">कुल विद्यार्थी संख्या</span>
              <div className="edu-stat-icon-wrapper">
                <GraduationCap size={20} />
              </div>
            </div>
            <div className="edu-stat-value">
              {stats?.totalStudents ? stats.totalStudents.toLocaleString('ne-NP') : '५,७६०'}
            </div>
            <div className="edu-stat-subtext">
              <span>{stats?.girlsCount ? stats.girlsCount.toLocaleString('ne-NP') : '२,५३४'} छात्रा</span>
              <span>•</span>
              <span>{stats?.boysCount ? stats.boysCount.toLocaleString('ne-NP') : '२,३७६'} छात्र</span>
            </div>
          </div>

          {/* Total Teachers */}
          <div className="edu-stat-card purple">
            <div className="edu-stat-top">
              <span className="edu-stat-label">शिक्षक दरबन्दी</span>
              <div className="edu-stat-icon-wrapper">
                <Users size={20} />
              </div>
            </div>
            <div className="edu-stat-value">{stats?.totalTeachers || 272} जना</div>
            <div className="edu-stat-subtext">
              <span>{stats?.permanentTeachers || 177} स्थायी</span>
              <span>•</span>
              <span>{stats?.contractTeachers || 95} राहत/करार</span>
            </div>
          </div>

          {/* PTR */}
          <div className="edu-stat-card amber">
            <div className="edu-stat-top">
              <span className="edu-stat-label">विद्यार्थी-शिक्षक अनुपात (PTR)</span>
              <div className="edu-stat-icon-wrapper">
                <Award size={20} />
              </div>
            </div>
            <div className="edu-stat-value">{stats?.ptr || '२१:१'}</div>
            <div className="edu-stat-subtext">
              <span>औसत उपस्थिति: {stats?.attendanceRate || '९४.२%'}</span>
            </div>
          </div>

          {/* Mid-day Meals */}
          <div className="edu-stat-card teal">
            <div className="edu-stat-top">
              <span className="edu-stat-label">दिवा खाजा लाभान्वित</span>
              <div className="edu-stat-icon-wrapper">
                <Utensils size={20} />
              </div>
            </div>
            <div className="edu-stat-value">
              {stats?.mealsBeneficiaries ? stats.mealsBeneficiaries.toLocaleString('ne-NP') : '४,१४७'}
            </div>
            <div className="edu-stat-subtext">
              <span>कक्षा ECED देखि ५ सम्म दैनिक रु. १५</span>
            </div>
          </div>

          {/* ICT & Digital Labs */}
          <div className="edu-stat-card indigo">
            <div className="edu-stat-top">
              <span className="edu-stat-label">डिजिटल सिकाइ / ICT</span>
              <div className="edu-stat-icon-wrapper">
                <Laptop size={20} />
              </div>
            </div>
            <div className="edu-stat-value">{stats?.ictEnabledSchools || 13} विद्यालय</div>
            <div className="edu-stat-subtext">
              <span>{stats?.scienceLabSchools || 8} विज्ञान ल्याब</span>
              <span>•</span>
              <span>{stats?.librarySchools || 15} पुस्तकालय</span>
            </div>
          </div>
        </div>

        {/* ── NAVIGATION TABS BAR ─────────────────────────────────────── */}
        <div style={{
          display: 'flex',
          gap: '0.4rem',
          margin: '2rem 0 1.5rem',
          background: '#ffffff',
          padding: '0.5rem',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
          flexWrap: 'wrap'
        }}>
          {[
            { id: 'directory', label: '🏫 विद्यालय प्रोफाइल तथा EMIS सूची', icon: <SchoolIcon size={16} /> },
            { id: 'exam_results', label: '📊 BLE तथा SEE परीक्षा नतिजा बोर्ड', icon: <Trophy size={16} /> },
            { id: 'nutrition', label: '🍲 दिवा खाजा पोषण क्यालेन्डर', icon: <Utensils size={16} /> },
            { id: 'scholarships', label: '🎓 छात्रवृत्ति तथा विद्यार्थी प्रोत्साहन', icon: <GraduationCap size={16} /> },
            { id: 'ward_summary', label: '📈 वडागत शैक्षिक वितरण तथा अवस्था', icon: <BarChart3 size={16} /> },
            { id: 'charter', label: '📜 शैक्षिक नागरिक बडापत्र', icon: <Award size={16} /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: '0.65rem 1.05rem',
                borderRadius: '10px',
                border: 'none',
                fontWeight: activeTab === tab.id ? 700 : 600,
                fontSize: '0.88rem',
                cursor: 'pointer',
                backgroundColor: activeTab === tab.id ? '#0284c7' : 'transparent',
                color: activeTab === tab.id ? '#ffffff' : '#475569',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                boxShadow: activeTab === tab.id ? '0 4px 8px rgba(2, 132, 199, 0.25)' : 'none',
                transition: 'all 0.15s ease-in-out',
              }}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ── TAB 1: SCHOOLS DIRECTORY & EMIS ─────────────────────────── */}
        {activeTab === 'directory' && (
          <div>
            {/* Filter Dock & Search */}
            <div id="schools-directory" className="edu-filter-dock">
              <div className="edu-filter-dock-top">
                <div className="edu-search-bar">
                  <Search className="edu-search-icon" size={18} />
                  <input
                    type="text"
                    placeholder="विद्यालयको नाम, EMIS कोड, टोल वा प्र.अ. खोज्नुहोस्..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button
                      className="edu-search-clear"
                      onClick={() => setSearchQuery('')}
                      title="खोजी खाली गर्नुहोस्"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                <div className="edu-view-toggle">
                  <button
                    className={`edu-view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                    onClick={() => setViewMode('grid')}
                  >
                    <LayoutGrid size={15} />
                    कार्ड ग्रिड
                  </button>
                  <button
                    className={`edu-view-toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
                    onClick={() => setViewMode('table')}
                  >
                    <List size={15} />
                    तालिका
                  </button>
                </div>
              </div>

              {/* Ward and Level Pills */}
              <div className="edu-filter-strip">
                <span className="edu-filter-label">वडा छनोट:</span>
                <button
                  className={`edu-pill-filter ${selectedWard === 'all' ? 'active' : ''}`}
                  onClick={() => setSelectedWard('all')}
                >
                  सबै वडाहरू
                </button>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((w) => (
                  <button
                    key={w}
                    className={`edu-pill-filter ${selectedWard === String(w) ? 'active' : ''}`}
                    onClick={() => setSelectedWard(String(w))}
                  >
                    वडा {w}
                  </button>
                ))}

                <div style={{ width: '1px', height: '20px', background: '#cbd5e1', margin: '0 0.5rem' }} />

                <span className="edu-filter-label">तह:</span>
                <button
                  className={`edu-pill-filter ${selectedLevel === 'all' ? 'active' : ''}`}
                  onClick={() => setSelectedLevel('all')}
                >
                  सबै तह
                </button>
                <button
                  className={`edu-pill-filter ${selectedLevel === 'secondary' ? 'active' : ''}`}
                  onClick={() => setSelectedLevel('secondary')}
                >
                  माध्यमिक (१-१० / १-१२)
                </button>
                <button
                  className={`edu-pill-filter ${selectedLevel === 'basic' ? 'active' : ''}`}
                  onClick={() => setSelectedLevel('basic')}
                >
                  आधारभूत (१-५ / १-८)
                </button>
              </div>

              {/* Facility Toggles */}
              <div className="edu-filter-strip" style={{ borderTop: 'none', paddingTop: 0 }}>
                <span className="edu-filter-label">भौतिक पूर्वाधार फिल्टर:</span>
                <div
                  className={`edu-facility-checkbox ${filterIctOnly ? 'checked' : ''}`}
                  onClick={() => setFilterIctOnly(!filterIctOnly)}
                >
                  <Laptop size={14} />
                  <span>ICT कम्प्युटर ल्याब भएका</span>
                </div>
                <div
                  className={`edu-facility-checkbox ${filterScienceLabOnly ? 'checked' : ''}`}
                  onClick={() => setFilterScienceLabOnly(!filterScienceLabOnly)}
                >
                  <FlaskConical size={14} />
                  <span>विज्ञान प्रयोगशाला भएका</span>
                </div>
                <div
                  className={`edu-facility-checkbox ${filterLibraryOnly ? 'checked' : ''}`}
                  onClick={() => setFilterLibraryOnly(!filterLibraryOnly)}
                >
                  <BookOpen size={14} />
                  <span>पुस्तकालय सुविधा भएका</span>
                </div>
                <span style={{ fontSize: '0.8rem', color: '#64748b', marginLeft: 'auto' }}>
                  कुल <strong>{filteredSchools.length}</strong> विद्यालयहरू उपलब्ध
                </span>
              </div>
            </div>

            {/* School Grid or Table */}
            {isSchoolsLoading ? (
              <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#64748b' }}>
                <p style={{ fontWeight: 600 }}>विद्यालयहरूको तथ्याङ्क लोड हुँदैछ...</p>
              </div>
            ) : filteredSchools.length === 0 ? (
              <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '3rem 2rem', textAlign: 'center', border: '1px solid #e2e8f0', marginBottom: '2rem' }}>
                <SchoolIcon size={48} color="#94a3b8" style={{ margin: '0 auto 1rem auto' }} />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.5rem 0' }}>कुनै विद्यालय फेला परेन</h3>
                <p style={{ color: '#64748b', margin: 0 }}>कृपया फिल्टर परिमार्जन गरी पुनः प्रयास गर्नुहोस्।</p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="edu-schools-grid">
                {filteredSchools.map((school) => {
                  const isSec = school.level?.toLowerCase() === 'secondary';
                  const ptr = Number(school.totalTeachers) > 0 ? Math.round(Number(school.totalStudents) / Number(school.totalTeachers)) : 0;

                  return (
                    <div key={school.id} className="edu-school-card">
                      <div className="edu-card-head">
                        <div className="edu-card-badges">
                          <span className={`edu-badge-level ${isSec ? 'sec' : 'basic'}`}>
                            {school.levelDetails || (isSec ? 'माध्यमिक (१-१०/१-१२)' : 'आधारभूत (१-५/१-८)')}
                          </span>
                          {school.emisCode && (
                            <span className="edu-badge-emis" title="EMIS कोड">
                              EMIS: {school.emisCode}
                            </span>
                          )}
                          <span className="edu-badge-ward">वडा नं. {school.wardNumber}</span>
                        </div>

                        <h3 className="edu-school-name-nep">{school.nameNepali || school.name}</h3>
                        {school.nameEnglish && <div className="edu-school-name-en">{school.nameEnglish}</div>}

                        <div className="edu-school-location">
                          <MapPin size={14} color="#64748b" />
                          <span>वडा नं. {school.wardNumber}, {school.tole || 'गाउँपालिका क्षेत्र'}</span>
                        </div>
                      </div>

                      <div className="edu-card-body">
                        <div className="edu-card-metrics-row">
                          <div className="edu-card-metric-item">
                            <span className="label">कुल विद्यार्थी</span>
                            <span className="val" style={{ color: '#0284c7' }}>{school.totalStudents || 0}</span>
                          </div>
                          <div className="edu-card-metric-item">
                            <span className="label">कुल शिक्षक</span>
                            <span className="val" style={{ color: '#7c3aed' }}>{school.totalTeachers || 0}</span>
                          </div>
                          <div className="edu-card-metric-item">
                            <span className="label">अनुपात (PTR)</span>
                            <span className="val" style={{ color: '#059669' }}>{ptr}:१</span>
                          </div>
                        </div>

                        <div className="edu-card-facilities-row">
                          <span className={`edu-facility-chip ${school.hasIctLab ? 'available' : ''}`} title="कम्प्युटर ल्याब">
                            <Laptop size={12} /> ICT ल्याब
                          </span>
                          <span className={`edu-facility-chip ${school.hasScienceLab ? 'available' : ''}`} title="विज्ञान प्रयोगशाला">
                            <FlaskConical size={12} /> विज्ञान ल्याब
                          </span>
                          <span className={`edu-facility-chip ${school.hasLibrary ? 'available' : ''}`} title="पुस्तकालय">
                            <BookOpen size={12} /> पुस्तकालय
                          </span>
                          <span className={`edu-facility-chip ${school.hasDrinkingWater ? 'available' : ''}`} title="सुरक्षित खानेपानी">
                            <Droplets size={12} /> खानेपानी
                          </span>
                        </div>
                      </div>

                      <div className="edu-card-footer">
                        <button
                          onClick={() => setSelectedSchoolForReport(school)}
                          className="edu-btn-report"
                          title="आधिकारिक विद्यालय प्रोफाइल तथा रिपोर्ट कार्ड हेर्नुहोस्"
                        >
                          <FileText size={14} /> विवरण / रिपोर्ट
                        </button>

                        <a
                          href={`/schools/${school.id}`}
                          className="edu-btn-portal"
                          title="विस्तृत डिजिटल प्रोफाइल"
                        >
                          <ChevronRight size={14} /> विस्तृत
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Table View */
              <div className="edu-table-container">
                <table className="edu-schools-table">
                  <thead>
                    <tr>
                      <th style={{ width: '50px' }}>क्र.सं.</th>
                      <th>विद्यालयको नाम र EMIS</th>
                      <th>तह र प्रकार</th>
                      <th>वडा र स्थान</th>
                      <th>विद्यार्थी विवरण</th>
                      <th>शिक्षक र PTR</th>
                      <th>भौतिक पूर्वाधार</th>
                      <th style={{ textAlign: 'center' }}>कार्य</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSchools.map((school, idx) => {
                      const isSec = school.level?.toLowerCase() === 'secondary';
                      const ptr = Number(school.totalTeachers) > 0 ? Math.round(Number(school.totalStudents) / Number(school.totalTeachers)) : 0;

                      return (
                        <tr key={school.id}>
                          <td style={{ fontWeight: 600, color: '#64748b' }}>{idx + 1}</td>
                          <td>
                            <div style={{ fontWeight: 700, color: '#0f172a' }}>{school.nameNepali || school.name}</div>
                            {school.nameEnglish && <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{school.nameEnglish}</div>}
                            {school.emisCode && <div style={{ fontSize: '0.72rem', color: '#0284c7', fontFamily: 'monospace' }}>EMIS: {school.emisCode}</div>}
                          </td>
                          <td>
                            <span className={`edu-badge-level ${isSec ? 'sec' : 'basic'}`}>
                              {school.levelDetails || (isSec ? 'माध्यमिक' : 'आधारभूत')}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                              <MapPin size={13} color="#64748b" />
                              <span>वडा नं. {school.wardNumber}</span>
                            </div>
                            {school.tole && <div style={{ fontSize: '0.75rem', color: '#64748b' }}>({school.tole})</div>}
                          </td>
                          <td>
                            <div style={{ fontWeight: 700, color: '#0f172a' }}>{school.totalStudents || 0} जना</div>
                            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                              {school.femaleStudents || Math.round((school.totalStudents || 0) * 0.5)} छात्रा / {school.maleStudents || Math.round((school.totalStudents || 0) * 0.5)} छात्र
                            </div>
                          </td>
                          <td>
                            <div style={{ fontWeight: 700, color: '#0f172a' }}>{school.totalTeachers || 0} शिक्षक</div>
                            <div style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 600 }}>अनुपात: {ptr}:१</div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                              {school.hasIctLab && <span className="edu-facility-chip available"><Laptop size={11} /> ICT</span>}
                              {school.hasScienceLab && <span className="edu-facility-chip available"><FlaskConical size={11} /> ल्याब</span>}
                              {school.hasLibrary && <span className="edu-facility-chip available"><BookOpen size={11} /> पुस्तकालय</span>}
                            </div>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <button
                              onClick={() => setSelectedSchoolForReport(school)}
                              className="edu-btn-report"
                              style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                            >
                              <FileText size={13} /> रिपोर्ट
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── TAB 2: EXAM RESULTS & BLE/SEE ANALYTICS ─────────────────── */}
        {activeTab === 'exam_results' && (
          <div>
            {/* BLE Exam Hero Strip */}
            <div style={{
              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0369a1 100%)',
              color: '#ffffff',
              borderRadius: '16px',
              padding: '2rem',
              marginBottom: '2rem',
              boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.25)'
            }}>
              <div style={{ maxWidth: '820px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.15)', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                  <Trophy size={15} color="#fde047" /> आधारभूत तह परीक्षा (BLE कक्षा ८) नतिजा विवरण
                </div>
                <h2 style={{ fontSize: '1.85rem', fontWeight: 800, margin: '0 0 0.65rem 0' }}>
                  शैक्षिक नतिजा, सिकाइ उपलब्धि तथा परीक्षा बोर्ड (BLE & SEE Analytics)
                </h2>
                <p style={{ fontSize: '0.95rem', lineHeight: 1.6, opacity: 0.92, margin: 0 }}>
                  गाउँपालिका स्तरीय आधारभूत तह उत्तीर्ण परीक्षा (BLE कक्षा ८) मा कुल ५२४ जना परीक्षार्थीहरूमध्ये ९६.२% विद्यार्थी उत्तीर्ण भएका छन्। औसत GPA २.८४ रहेको छ।
                </p>
              </div>
            </div>

            {/* Exam KPI Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
              <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '12px', border: '1.5px solid #bbf7d0', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
                <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>BLE कुल परीक्षार्थी</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#15803d', marginTop: '0.2rem' }}>५२४ जना</div>
                <div style={{ fontSize: '0.75rem', color: '#16a34a', marginTop: '0.2rem' }}>२७४ छात्रा / २५० छात्र</div>
              </div>

              <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '12px', border: '1.5px solid #bfdbfe', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
                <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>उत्तीर्ण दर (Pass Rate)</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0284c7', marginTop: '0.2rem' }}>९६.२%</div>
                <div style={{ fontSize: '0.75rem', color: '#0369a1', marginTop: '0.2rem' }}>५०४ जना विद्यार्थी उत्तीर्ण</div>
              </div>

              <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '12px', border: '1.5px solid #fef08a', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
                <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>गाउँपालिका औसत GPA</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#b45309', marginTop: '0.2rem' }}>२.८४</div>
                <div style={{ fontSize: '0.75rem', color: '#854d0e', marginTop: '0.2rem' }}>गत वर्षभन्दा +०.१३ ले वृद्धि</div>
              </div>

              <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '12px', border: '1.5px solid #ddd6fe', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
                <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>SEE (कक्षा १०) उत्तीर्ण दर</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#7c3aed', marginTop: '0.2rem' }}>८८.५%</div>
                <div style={{ fontSize: '0.75rem', color: '#6d28d9', marginTop: '0.2rem' }}>औसत GPA: २.७६</div>
              </div>
            </div>

            {/* Subject Achievement Progress & Top Schools Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
              {/* Subject Achievements */}
              <div style={{ background: '#ffffff', padding: '1.75rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 10px rgba(0,0,0,0.03)' }}>
                <h3 style={{ margin: '0 0 1.25rem', fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <BarChart3 size={20} color="#0284c7" /> विषयगत सिकाइ उपलब्धि दर (Subject Achievement Rates)
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {[
                    { subject: "स्थानीय विषय 'हाम्रो पाँचपोखरी'", score: 86.5, color: '#16a34a' },
                    { subject: 'नेपाली', score: 81.4, color: '#0284c7' },
                    { subject: 'सामाजिक अध्ययन तथा मानवमूल्य शिक्षा', score: 78.2, color: '#0d9488' },
                    { subject: 'विज्ञान तथा प्रविधि', score: 74.5, color: '#7c3aed' },
                    { subject: 'अंग्रेजी', score: 72.0, color: '#d97706' },
                    { subject: 'अनिवार्य गणित', score: 68.1, color: '#dc2626' },
                  ].map((sub, i) => (
                    <div key={i}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                        <span>{sub.subject}</span>
                        <span style={{ color: sub.color }}>{sub.score}%</span>
                      </div>
                      <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${sub.score}%`, height: '100%', background: sub.color, borderRadius: '4px' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Performing Schools Honor Board */}
              <div style={{ background: '#ffffff', padding: '1.75rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 10px rgba(0,0,0,0.03)' }}>
                <h3 style={{ margin: '0 0 1.25rem', fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Trophy size={20} color="#eab308" /> उत्कृष्ट शैक्षिक नतिजा ल्याउने विद्यालयहरू (Top 5 Schools)
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {[
                    { rank: '१', name: 'श्री थाङपाल भ्याली माध्यमिक विद्यालय', loc: 'मानेखर्क (वडा ४)', gpa: '३.४२', passRate: '१००%', award: 'स्वर्ण पदक' },
                    { rank: '२', name: 'श्री थाङपालधाप माध्यमिक विद्यालय', loc: 'थाङपालधाप (वडा ६)', gpa: '३.३५', passRate: '१००%', award: 'रजत पदक' },
                    { rank: '३', name: 'श्री भोताङदेवि माध्यमिक विद्यालय', loc: 'भोताङ (वडा ३)', gpa: '३.२८', passRate: '९८.२%', award: 'कांस्य पदक' },
                    { rank: '४', name: 'याङ्ग्री एकेडेमिक स्कुल', loc: 'बरुवा (वडा २)', gpa: '३.२५', passRate: '९६.५%', award: 'उत्कृष्ट संस्थागत' },
                    { rank: '५', name: 'श्री लाँगर्चे माध्यमिक विद्यालय', loc: 'लाँगर्चे (वडा ८)', gpa: '३.१८', passRate: '९५.०%', award: 'सराहनीय' },
                  ].map((sch, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: i === 0 ? '#fef08a' : i === 1 ? '#e2e8f0' : i === 2 ? '#fed7aa' : '#f1f5f9', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem' }}>
                        {sch.rank}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>{sch.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{sch.loc} • उत्तीर्ण दर: {sch.passRate}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0284c7' }}>GPA {sch.gpa}</div>
                        <div style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 600 }}>{sch.award}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 3: MID-DAY MEALS & NUTRITION TWIN ──────────────────── */}
        {activeTab === 'nutrition' && (
          <div>
            {/* Nutrition Banner */}
            <div style={{
              background: 'linear-gradient(135deg, #064e3b 0%, #065f46 60%, #047857 100%)',
              color: '#ffffff',
              borderRadius: '16px',
              padding: '2rem',
              marginBottom: '2rem',
              boxShadow: '0 10px 25px -5px rgba(6, 78, 59, 0.25)'
            }}>
              <div style={{ maxWidth: '820px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.15)', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                  <Utensils size={15} color="#a7f3d0" /> पालिकास्तरीय दिवा खाजा तथा पोषण कार्यक्रम
                </div>
                <h2 style={{ fontSize: '1.85rem', fontWeight: 800, margin: '0 0 0.65rem 0' }}>
                  दिवा खाजा पोषण अनुगमन तथा साप्ताहिक मेनु क्यालेन्डर
                </h2>
                <p style={{ fontSize: '0.95rem', lineHeight: 1.6, opacity: 0.92, margin: 0 }}>
                  पाँचपोखरीका कक्षा बालविकास (ECED) देखि कक्षा ५ सम्मका ४,१४७ बालबालिकाहरूलाई विद्यालयमै दैनिक ताजा, स्थानीय र अर्गानिक खाजा उपलब्ध गराइँदै आएको छ। प्रति विद्यार्थी दैनिक रु. १५ दरले वार्षिक १ करोड १२ लाख बजेट विनियोजित छ।
                </p>
              </div>
            </div>

            {/* Weekly Organic Menu Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
              {[
                { day: 'आइतबार (Sunday)', menu: 'स्थानीय हरियो सागपात र पोषिलो जाउलो', ingredients: 'घ्यू, स्थानीय दाल, चामल र सिजनल साग', calories: '४५० क्यालोरी', badge: 'ऊर्जादायी' },
                { day: 'सोमबार (Monday)', menu: 'उसिनेको अण्डा र भुटेको स्थानीय चना/केराउ', ingredients: 'स्थानीय कुखुराको अण्डा, चना, अदुवा, लसुन', calories: '४८० क्यालोरी', badge: 'प्रोटिनयुक्त' },
                { day: 'मंगलबार (Tuesday)', menu: 'शुद्ध गाई/भैंसीको दूधको खीर र मौसमी फलफूल', ingredients: 'स्थानीय ताजा दूध, चामल, मह वा चिनी', calories: '४२० क्यालोरी', badge: 'क्याल्सियम' },
                { day: 'बुधबार (Wednesday)', menu: 'हलुवा, भुटेको भटमास र भटमासको सुप', ingredients: 'सुजी/गहुँको पिठो, घ्यू, स्थानीय भटमास', calories: '४६० क्यालोरी', badge: 'आइरनयुक्त' },
                { day: 'बिहीबार (Thursday)', menu: 'स्थानीय गेडागुडी मिसाइएको खिचडी र अचार', ingredients: 'बोडी, सिमी, चामल र मुलाको ताजा अचार', calories: '४४० क्यालोरी', badge: 'सन्तुलित' },
                { day: 'शुक्रबार (Friday)', menu: 'स्थानीय मकै/गहुँको रोटी, तरकारी र चना', ingredients: 'मकैको पिठो, आलु-चनाको तरकारी', calories: '४५० क्यालोरी', badge: 'फाइबरयुक्त' },
              ].map((m, i) => (
                <div key={i} style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.35rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#047857' }}>{m.day}</span>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, background: '#d1fae5', color: '#065f46', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                        {m.badge}
                      </span>
                    </div>

                    <h4 style={{ margin: '0 0 0.4rem', fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                      {m.menu}
                    </h4>

                    <p style={{ margin: '0 0 0.85rem', fontSize: '0.82rem', color: '#64748b', lineHeight: 1.4 }}>
                      मुख्य परिकार: {m.ingredients}
                    </p>
                  </div>

                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.65rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#047857', fontWeight: 600 }}>
                    <span>पोषण मान: {m.calories}</span>
                    <span>✓ ताजा पकाइएको</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB 4: SCHOLARSHIPS & STUDENT WELFARE ──────────────────── */}
        {activeTab === 'scholarships' && (
          <div>
            <div style={{
              background: 'linear-gradient(135deg, #312e81 0%, #4338ca 60%, #4f46e5 100%)',
              color: '#ffffff',
              borderRadius: '16px',
              padding: '2rem',
              marginBottom: '2rem',
              boxShadow: '0 10px 25px -5px rgba(49, 46, 129, 0.25)'
            }}>
              <div style={{ maxWidth: '820px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.15)', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                  <Award size={15} color="#c7d2fe" /> पालिका छात्रवृत्ति तथा विद्यार्थी कल्याण कोष
                </div>
                <h2 style={{ fontSize: '1.85rem', fontWeight: 800, margin: '0 0 0.65rem 0' }}>
                  छात्रवृत्ति वितरण, विद्यार्थी प्रोत्साहन तथा सेनिटरी प्याड व्यवस्था
                </h2>
                <p style={{ fontSize: '0.95rem', lineHeight: 1.6, opacity: 0.92, margin: 0 }}>
                  कुनै पनि बालबालिका आर्थिक अभावका कारण शिक्षाबाट वञ्चित नहोउन् भन्ने उद्देश्यले गाउँपालिकाले जेहेन्दार, दलित, विपन्न, अपाङ्गता तथा छात्रा प्रोत्साहन छात्रवृत्ति वितरण गर्दै आएको छ।
                </p>
              </div>
            </div>

            {/* Scholarship Schemes Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
              {[
                { title: 'जेहेन्दार छात्रवृत्ति', beneficiaries: '२४० जना विद्यार्थी', amount: 'रु. १२,००,०००', rate: 'रु. ५,००० / वर्ष', color: '#16a34a', desc: 'कक्षा ८ र १० मा उत्कृष्ट अंक ल्याउने जेहेन्दार विद्यार्थीहरूलाई प्रोत्साहन।' },
                { title: 'दलित तथा सीमान्तकृत छात्रवृत्ति', beneficiaries: '३८० जना विद्यार्थी', amount: 'रु. १५,२०,०००', rate: 'रु. ४,००० / वर्ष', color: '#0284c7', desc: 'दलित तथा लोपोन्मुख समुदायका बालबालिकाको शतप्रतिशत भर्ना सुनिश्चितता।' },
                { title: 'विपन्न तथा लक्षित वर्ग छात्रवृत्ति', beneficiaries: '४२० जना विद्यार्थी', amount: 'रु. १४,७०,०००', rate: 'रु. ३,५०० / वर्ष', color: '#d97706', desc: 'अति विपन्न, एकल अभिभावक तथा टुहुरा बालबालिकाहरूलाई शैक्षिक सामग्री सहायता।' },
                { title: 'अपाङ्गता समावेशी छात्रवृत्ति', beneficiaries: '४५ जना विद्यार्थी', amount: 'रु. २,२५,०००', rate: 'रु. ५,००० / वर्ष', color: '#7c3aed', desc: 'अपाङ्गता भएका छात्र-छात्रालाई विशेष सिकाइ सामग्री र यातायात सहायता।' },
              ].map((sc, i) => (
                <div key={i} style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, background: '#f1f5f9', color: sc.color, padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
                      {sc.rate}
                    </span>
                    <h4 style={{ margin: '0.5rem 0 0.3rem', fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                      {sc.title}
                    </h4>
                    <p style={{ margin: '0 0 1rem', fontSize: '0.82rem', color: '#64748b', lineHeight: 1.45 }}>
                      {sc.desc}
                    </p>
                  </div>

                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.85rem' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>लाभान्वित संख्या र कुल रकम:</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.2rem' }}>
                      <strong style={{ color: '#0f172a', fontSize: '0.95rem' }}>{sc.beneficiaries}</strong>
                      <strong style={{ color: sc.color, fontSize: '1.1rem' }}>{sc.amount}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB 5: WARD-WISE BENCHMARKS ─────────────────────────────── */}
        {activeTab === 'ward_summary' && (
          <div id="ward-summary">
            <div className="edu-section-head">
              <h2>
                <BarChart3 size={24} color="#0284c7" />
                वडागत शैक्षिक वितरण तथा अवस्था
              </h2>
              <p>
                पाँचपोखरी थाङपाल गाउँपालिकाका १ देखि ८ सम्मका सबै वडाहरूमा विद्यालय, विद्यार्थी, शिक्षक तथा शैक्षिक
                सूचकहरूको तुलनात्मक विवरण:
              </p>
            </div>

            <div className="edu-ward-table-card">
              <table className="edu-schools-table">
                <thead>
                  <tr>
                    <th>वडा नं.</th>
                    <th>स्थान / मुख्य बस्तीहरू</th>
                    <th>कुल विद्यालय संख्या</th>
                    <th>कुल विद्यार्थी</th>
                    <th>कुल शिक्षक</th>
                    <th>विद्यार्थी-शिक्षक अनुपात (PTR)</th>
                    <th>औसत उपस्थिति दर</th>
                    <th>कार्य</th>
                  </tr>
                </thead>
                <tbody>
                  {wardSummaries.map((w) => {
                    const wardNames: { [key: number]: string } = {
                      1: 'बाँसखर्क, जतन, थाङपालकोट',
                      2: 'बरुवा, तेम्बाथाङ, सेर्माथाङ',
                      3: 'भोताङ, छिम्ती',
                      4: 'थाङपालधाप, रैथाने',
                      5: 'गुन्सा, मानेखर्क',
                      6: 'थाङपालकोट, टार, तिपेनी',
                      7: 'भोताङ, काफ्ले',
                      8: 'लाँगर्चे, लप्से',
                    };
                    const ptr = w.totalTeachers > 0 ? Math.round(w.totalStudents / w.totalTeachers) : 18;

                    return (
                      <tr key={w.wardNumber}>
                        <td style={{ fontWeight: 800, color: '#0284c7' }}>वडा नं. {w.wardNumber}</td>
                        <td style={{ color: '#475569' }}>{wardNames[w.wardNumber] || 'गाउँपालिका क्षेत्र'}</td>
                        <td><strong style={{ color: '#0f172a' }}>{w.schoolCount}</strong> वटा विद्यालय</td>
                        <td><strong style={{ color: '#0284c7' }}>{w.totalStudents.toLocaleString('ne-NP')}</strong> विद्यार्थी</td>
                        <td><strong style={{ color: '#7c3aed' }}>{w.totalTeachers}</strong> शिक्षक</td>
                        <td>
                          <span style={{ fontWeight: 700, color: ptr <= 25 ? '#16a34a' : '#d97706', backgroundColor: ptr <= 25 ? '#dcfce7' : '#fef3c7', padding: '0.2rem 0.5rem', borderRadius: '6px' }}>
                            {ptr}:१
                          </span>
                        </td>
                        <td style={{ color: '#0f172a', fontWeight: 600 }}>९३.८%</td>
                        <td>
                          <button
                            onClick={() => {
                              setSelectedWard(String(w.wardNumber));
                              setActiveTab('directory');
                            }}
                            style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', padding: '0.35rem 0.75rem', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
                          >
                            वडाका विद्यालय हेर्नुहोस् →
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TAB 6: CITIZEN CHARTER & CAMPAIGNS ──────────────────────── */}
        {activeTab === 'charter' && (
          <div>
            <div className="edu-section-head">
              <h2>
                <Award size={24} color="#059669" />
                पालिकास्तरीय शैक्षिक कार्यक्रम तथा नागरिक बडापत्र
              </h2>
              <p>
                गाउँपालिकाद्वारा सञ्चालित प्रमुख शैक्षिक अभियानहरू, सुविधा तथा विद्यार्थी कल्याणकारी कार्यक्रमहरू:
              </p>
            </div>

            <div className="edu-programs-grid">
              <div className="edu-program-card">
                <div className="edu-program-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
                  <Utensils size={24} />
                </div>
                <h3>दिवा खाजा कार्यक्रम (School Meals)</h3>
                <p>
                  कक्षा बालविकास देखि कक्षा ५ सम्म अध्ययनरत सबै विद्यार्थीहरूलाई विद्यालयमै दैनिक ताजा, स्थानीय र
                  पौष्टिक खाजा उपलब्ध गराइन्छ ।
                </p>
                <ul className="edu-program-highlights">
                  <li><CheckCircle2 size={15} color="#16a34a" /> प्रति विद्यार्थी दैनिक रु. १५ बराबरको स्थानीय खाजा</li>
                  <li><CheckCircle2 size={15} color="#16a34a" /> विद्यालयमा पोषण तथा सरसफाइ अनुगमन समिति</li>
                  <li><CheckCircle2 size={15} color="#16a34a" /> विद्यार्थी नियमितता र पोषण सुधारमा उल्लेखनीय योगदान</li>
                </ul>
              </div>

              <div className="edu-program-card">
                <div className="edu-program-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>
                  <BookOpen size={24} />
                </div>
                <h3>निःशुल्क पाठ्यपुस्तक र छात्रवृत्ति</h3>
                <p>
                  सामुदायिक विद्यालयमा अध्ययनरत सबै छात्र-छात्रालाई शैक्षिक सत्रको पहिलो दिनमै निःशुल्क पाठ्यपुस्तक तथा
                  आवश्यक छात्रवृत्ति वितरण।
                </p>
                <ul className="edu-program-highlights">
                  <li><CheckCircle2 size={15} color="#16a34a" /> शतप्रतिशत विद्यार्थीलाई पाठ्यपुस्तक अनुदान</li>
                  <li><CheckCircle2 size={15} color="#16a34a" /> जेहेन्दार, दलित, विपन्न तथा अपाङ्गता छात्रवृत्ति</li>
                  <li><CheckCircle2 size={15} color="#16a34a" /> छात्रा विशेष प्रोत्साहन तथा सेनिटरी प्याड व्यवस्था</li>
                </ul>
              </div>

              <div className="edu-program-card">
                <div className="edu-program-icon" style={{ background: '#ede9fe', color: '#7c3aed' }}>
                  <Laptop size={24} />
                </div>
                <h3>राष्ट्रपति शैक्षिक सुधार र डिजिटल कक्षा</h3>
                <p>
                  विद्यालयहरूमा सूचना प्रविधि (ICT) को पहुँच विस्तार गर्न कम्प्युटर ल्याब, स्मार्ट टिभी, इन्टरनेट र विज्ञान
                  प्रयोगशाला स्तरोन्नति।
                </p>
                <ul className="edu-program-highlights">
                  <li><CheckCircle2 size={15} color="#16a34a" /> १३ वटा विद्यालयमा पूर्ण कम्प्युटर ल्याब सञ्चालन</li>
                  <li><CheckCircle2 size={15} color="#16a34a" /> डिजिटल स्मार्ट बोर्ड तथा प्रोजेक्टर सहायता</li>
                  <li><CheckCircle2 size={15} color="#16a34a" /> शिक्षकहरूलाई निरन्तर सूचना प्रविधि (ICT) तालिम</li>
                </ul>
              </div>

              <div className="edu-program-card">
                <div className="edu-program-icon" style={{ background: '#ccfbf1', color: '#0d9488' }}>
                  <GraduationCap size={24} />
                </div>
                <h3>स्थानीय पाठ्यक्रम 'हाम्रो पाँचपोखरी'</h3>
                <p>
                  कक्षा १ देखि ८ सम्म गाउँपालिकाको भूगोल, संस्कृति, पर्यटन, भाषा र जनजीवन समेटिएको स्थानीय विषयवस्तु
                  अध्यापन।
                </p>
                <ul className="edu-program-highlights">
                  <li><CheckCircle2 size={15} color="#16a34a" /> मौलिक संस्कृति र स्थानीय पर्यटनको व्यवहारिक ज्ञान</li>
                  <li><CheckCircle2 size={15} color="#16a34a" /> प्राकृतिक सम्पदा, जडिबुटी र जैविक विविधता संरक्षण</li>
                  <li><CheckCircle2 size={15} color="#16a34a" /> गाउँपालिका स्तरीय BLE (कक्षा ८) परीक्षा व्यवस्थापन</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── 8. PRINTABLE OFFICIAL SCHOOL DETAIL & REPORT MODAL ──────────── */}
      {selectedSchoolForReport && (
        <SchoolDetailModal
          isOpen={!!selectedSchoolForReport}
          school={selectedSchoolForReport}
          onClose={() => setSelectedSchoolForReport(null)}
        />
      )}
    </div>
  );
};

export default Education;
