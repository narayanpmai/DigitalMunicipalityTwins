import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sectoralApi } from '../../api/sectoral';
import {
  GraduationCap,
  Users,
  School as SchoolIcon,
  Laptop,
  BookOpen,
  Utensils,
  Search,
  MapPin,
  Phone,
  Plus,
  Download,
  Award,
  CheckCircle2,
  ExternalLink,
  Edit,
  Sparkles,
  BarChart3,
  BookCheck,
  FileSpreadsheet,
} from 'lucide-react';
import { SchoolModal } from './components/SchoolModal';
import { StudentModal } from './components/StudentModal';
import { TeacherModal } from './components/TeacherModal';
import { EducationExcelImportModal } from './components/EducationExcelImportModal';
import { SchoolDetailModal } from './components/SchoolDetailModal';
import { AssessmentsTab } from './components/AssessmentsTab';
import type { School, Student, Teacher } from '../../types/education';

export const EducationPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'schools' | 'students' | 'teachers' | 'nutrition' | 'analytics' | 'assessments'>('schools');
  const [selectedWard, setSelectedWard] = useState<number>(0);
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [isSchoolModalOpen, setIsSchoolModalOpen] = useState(false);
  const [editingSchool, setEditingSchool] = useState<Partial<School> | null>(null);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [isEducationExcelModalOpen, setIsEducationExcelModalOpen] = useState(false);
  const [educationExcelInitialTab, setEducationExcelInitialTab] = useState<'schools' | 'students' | 'teachers'>('schools');
  const [selectedReportSchool, setSelectedReportSchool] = useState<School | null>(null);

  // Queries
  const { data: schools = [], isLoading: isSchoolsLoading } = useQuery({
    queryKey: ['education-schools', selectedWard],
    queryFn: () => sectoralApi.getSchools(selectedWard),
  });

  const { data: stats } = useQuery({
    queryKey: ['education-overview'],
    queryFn: () => sectoralApi.getEducationOverview(),
  });

  const { data: students = [], isLoading: isStudentsLoading } = useQuery({
    queryKey: ['education-students'],
    queryFn: () => sectoralApi.getStudents(),
  });

  const { data: teachers = [], isLoading: isTeachersLoading } = useQuery({
    queryKey: ['education-teachers'],
    queryFn: () => sectoralApi.getTeachers(),
  });

  // Mutations
  const createSchoolMutation = useMutation({
    mutationFn: (data: Partial<School>) => sectoralApi.createSchool(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['education-schools'] });
      queryClient.invalidateQueries({ queryKey: ['education-overview'] });
      queryClient.invalidateQueries({ queryKey: ['gis-facilities'] });
    },
  });

  const updateSchoolMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<School> }) => sectoralApi.updateSchool(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['education-schools'] });
      queryClient.invalidateQueries({ queryKey: ['education-overview'] });
      queryClient.invalidateQueries({ queryKey: ['gis-facilities'] });
    },
  });

  const createStudentMutation = useMutation({
    mutationFn: (data: Partial<Student>) => sectoralApi.createStudent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['education-students'] });
      queryClient.invalidateQueries({ queryKey: ['education-overview'] });
    },
  });

  const createTeacherMutation = useMutation({
    mutationFn: (data: Partial<Teacher>) => sectoralApi.createTeacher(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['education-teachers'] });
      queryClient.invalidateQueries({ queryKey: ['education-overview'] });
    },
  });

  const safeSchools = Array.isArray(schools) ? schools : [];
  const filteredSchools = safeSchools.filter((s) => {
    const term = (searchTerm || '').toLowerCase();
    const nameNep = (s.nameNepali || s.name || '').toLowerCase();
    const loc = (s.location || s.tole || '').toLowerCase();
    const principal = (s.principalName || '').toLowerCase();
    const emis = (s.code || s.emisCode || '').toLowerCase();

    const matchesSearch =
      !term ||
      nameNep.includes(term) ||
      loc.includes(term) ||
      principal.includes(term) ||
      emis.includes(term);

    const matchesLevel = selectedLevel === 'all' || s.level === selectedLevel;

    return matchesSearch && matchesLevel;
  });

  // Export to CSV
  const handleExportSchools = () => {
    const headers = ['EMIS कोड,विद्यालयको नाम,वडा,टोल,तह,प्रकार,प्रधानाध्यापक,सम्पर्क,विद्यार्थी संख्या,शिक्षक संख्या,ICT ल्याब,पुस्तकालय'];
    const rows = filteredSchools.map((s) =>
      `"${s.emisCode || s.code}","${s.nameNepali || s.name}","${s.wardNumber}","${s.tole || s.location || ''}","${s.level}","${s.type || 'सामुदायिक'}","${s.principalName || ''}","${s.contactNumber || s.contactPhone || ''}","${s.totalStudents}","${s.totalTeachers}","${s.hasIctLab ? 'छ' : 'छैन'}","${s.hasLibrary ? 'छ' : 'छैन'}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Panchpokhari_Schools_W${selectedWard || 'All'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
              शिक्षा सूचना व्यवस्थापन प्रणाली (MunSMS)
            </h1>
            <span
              style={{
                fontSize: '0.75rem',
                backgroundColor: '#dbeafe',
                color: '#1e40af',
                padding: '0.2rem 0.5rem',
                borderRadius: '9999px',
                fontWeight: 600,
              }}
            >
              EduQSMS Integrated
            </span>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>
            पाँचपोखरी थाङपालका २५ वटै सामुदायिक तथा संस्थागत विद्यालयहरू, विद्यार्थी भर्ना, शिक्षक दरबन्दी र दिवा खाजा कार्यक्रम
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => window.open('/gis-map?filter=education', '_blank')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              fontSize: '0.85rem',
              backgroundColor: '#0f172a',
              color: '#ffffff',
              padding: '0.55rem 1rem',
              borderRadius: '8px',
              border: 'none',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(15, 23, 42, 0.25)',
            }}
          >
            🗺️ GIS नक्सामा विद्यालयहरू
          </button>
          <button
            type="button"
            onClick={() => {
              setEducationExcelInitialTab(activeTab === 'students' ? 'students' : activeTab === 'teachers' ? 'teachers' : 'schools');
              setIsEducationExcelModalOpen(true);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              fontSize: '0.85rem',
              backgroundColor: '#16a34a',
              color: '#ffffff',
              padding: '0.55rem 1rem',
              borderRadius: '8px',
              border: 'none',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(22, 163, 74, 0.25)',
            }}
            title="शिक्षा प्रणाली Excel / CSV एकमुष्ट डेटा अपलोड"
          >
            <FileSpreadsheet size={16} /> Excel फाइल अपलोड
          </button>
          <button
            onClick={() => {
              setEditingSchool(null);
              setIsSchoolModalOpen(true);
            }}
            className="dt-btn dt-btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
          >
            <Plus size={16} /> नयाँ विद्यालय दर्ता
          </button>
          <button
            onClick={() => setIsStudentModalOpen(true)}
            className="dt-btn dt-btn-outline"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
          >
            <GraduationCap size={16} /> विद्यार्थी भर्ना
          </button>
          <button
            onClick={() => setIsTeacherModalOpen(true)}
            className="dt-btn dt-btn-outline"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
          >
            <Users size={16} /> शिक्षक दर्ता
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div className="dt-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: '10px', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#2563eb' }}>
            <SchoolIcon size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>कुल विद्यालयहरू</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>{stats?.totalSchools || 25} वटा</div>
            <div style={{ fontSize: '0.7rem', color: '#16a34a' }}>२४ सामुदायिक / १ संस्थागत</div>
          </div>
        </div>

        <div className="dt-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: '10px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
            <GraduationCap size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>कुल विद्यार्थी</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>{stats?.totalStudents || 5420} जना</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>२,६८० छात्र / २,७४० छात्रा</div>
          </div>
        </div>

        <div className="dt-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: '10px', backgroundColor: 'rgba(139, 92, 246, 0.1)', color: '#7c3aed' }}>
            <Users size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>शिक्षक दरबन्दी</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>{stats?.totalTeachers || 335} जना</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>अनुपात {stats?.ptr || '16:1'}</div>
          </div>
        </div>

        <div className="dt-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: '10px', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#d97706' }}>
            <Utensils size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>दिवा खाजा लाभान्वित</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>{stats?.mealsBeneficiaries || 3850} बालबालिका</div>
            <div style={{ fontSize: '0.7rem', color: '#16a34a' }}>दैनिक ताजा पौष्टिक खाजा</div>
          </div>
        </div>
      </div>

      {/* Modern Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
        <button
          onClick={() => setActiveTab('schools')}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: activeTab === 'schools' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'schools' ? '#fff' : 'var(--text-muted)',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.875rem',
          }}
        >
          <SchoolIcon size={16} /> विद्यालय निर्देशिका (Schools)
        </button>

        <button
          onClick={() => setActiveTab('students')}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: activeTab === 'students' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'students' ? '#fff' : 'var(--text-muted)',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.875rem',
          }}
        >
          <GraduationCap size={16} /> विद्यार्थी तथा IEMIS (Students)
        </button>

        <button
          onClick={() => setActiveTab('teachers')}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: activeTab === 'teachers' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'teachers' ? '#fff' : 'var(--text-muted)',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.875rem',
          }}
        >
          <Users size={16} /> शिक्षक तथा कर्मचारी (Teachers)
        </button>

        <button
          onClick={() => setActiveTab('nutrition')}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: activeTab === 'nutrition' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'nutrition' ? '#fff' : 'var(--text-muted)',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.875rem',
          }}
        >
          <Utensils size={16} /> दिवा खाजा अनुगमन (Meals)
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: activeTab === 'analytics' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'analytics' ? '#fff' : 'var(--text-muted)',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.875rem',
          }}
        >
          <BarChart3 size={16} /> शैक्षिक नतिजा र पूर्वाधार (Analytics)
        </button>

        <button
          onClick={() => setActiveTab('assessments')}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: activeTab === 'assessments' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'assessments' ? '#fff' : 'var(--text-muted)',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.875rem',
          }}
        >
          <Award size={16} /> परीक्षा मूल्याङ्कन तथा लब्धाङ्क (Assessments)
        </button>
      </div>

      {/* Tab Content: Schools Directory */}
      {activeTab === 'schools' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Filter Bar */}
          <div
            className="dt-card"
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1rem',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.75rem 1rem',
            }}
          >
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <select
                value={selectedWard}
                onChange={(e) => setSelectedWard(Number(e.target.value))}
                style={{
                  padding: '0.45rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  fontSize: '0.875rem',
                  backgroundColor: 'white',
                }}
              >
                <option value={0}>सबै वडाहरू (All Wards)</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((w) => (
                  <option key={w} value={w}>
                    वडा नं. {w}
                  </option>
                ))}
              </select>

              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                style={{
                  padding: '0.45rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  fontSize: '0.875rem',
                  backgroundColor: 'white',
                }}
              >
                <option value="all">सबै तहहरू (All Levels)</option>
                <option value="secondary">माध्यमिक (१-१० / १-१२)</option>
                <option value="basic">आधारभूत (१-८)</option>
              </select>

              <button
                onClick={handleExportSchools}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.45rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  backgroundColor: 'white',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  fontWeight: 500,
                }}
              >
                <Download size={15} /> CSV डाउनलोड
              </button>
            </div>

            <div style={{ position: 'relative' }}>
              <Search
                size={16}
                style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
              />
              <input
                type="text"
                placeholder="विद्यालय वा EMIS कोड खोज्नुहोस्..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  padding: '0.45rem 0.75rem 0.45rem 2rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  fontSize: '0.875rem',
                  outline: 'none',
                  minWidth: '240px',
                }}
              />
            </div>
          </div>

          {/* School Directory Table */}
          <div className="dt-card">
            {isSchoolsLoading ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>तथ्याङ्क लोड हुँदैछ...</div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <div className="dt-responsive-table-wrapper">
<table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '0.75rem' }}>EMIS / कोड</th>
                      <th style={{ padding: '0.75rem' }}>विद्यालयको नाम</th>
                      <th style={{ padding: '0.75rem' }}>तह तथा प्रकार</th>
                      <th style={{ padding: '0.75rem' }}>वडा / स्थान</th>
                      <th style={{ padding: '0.75rem' }}>प्रधानाध्यापक</th>
                      <th style={{ padding: '0.75rem' }}>विद्यार्थी / शिक्षक</th>
                      <th style={{ padding: '0.75rem' }}>भौतिक पूर्वाधार</th>
                      <th style={{ padding: '0.75rem' }}>सम्पर्क / पोर्टल</th>
                      <th style={{ padding: '0.75rem' }}>कार्य</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSchools.map((s) => (
                      <tr key={s.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '0.75rem' }}>
                          <span
                            style={{
                              fontFamily: 'monospace',
                              backgroundColor: '#f1f5f9',
                              padding: '0.2rem 0.4rem',
                              borderRadius: '4px',
                              fontSize: '0.8rem',
                            }}
                          >
                            {s.emisCode || s.code}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem', fontWeight: 600, color: 'var(--text-main)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <SchoolIcon size={16} color="var(--primary)" />
                            <span>{s.nameNepali || s.name}</span>
                          </div>
                          {s.nameEnglish && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                              {s.nameEnglish}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            <span
                              style={{
                                padding: '0.15rem 0.45rem',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                display: 'inline-block',
                                width: 'fit-content',
                                backgroundColor:
                                  s.level === 'secondary'
                                    ? 'rgba(37, 99, 235, 0.1)'
                                    : 'rgba(16, 185, 129, 0.1)',
                                color:
                                  s.level === 'secondary'
                                    ? '#2563eb'
                                    : '#10b981',
                              }}
                            >
                              {s.levelDetails || (s.level === 'secondary' ? 'माध्यमिक' : 'आधारभूत')}
                            </span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                              {s.type === 'private' ? 'संस्थागत (Private)' : 'सामुदायिक (Community)'}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <MapPin size={14} color="var(--text-muted)" />
                            <span>वडा {s.wardNumber} {s.tole ? `(${s.tole})` : ''}</span>
                          </div>
                          {s.latitude && s.longitude && (
                            <span style={{ fontSize: '0.7rem', color: '#0284c7', fontFamily: 'monospace', display: 'block', marginTop: '0.15rem' }}>
                              📍 {s.latitude.toFixed(4)}, {s.longitude.toFixed(4)}
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '0.75rem' }}>{s.principalName || 'प्र.अ.'}</td>
                        <td style={{ padding: '0.75rem' }}>
                          <div>
                            <strong>{s.totalStudents}</strong> विद्यार्थी
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
                              ({s.femaleStudents || Math.round(s.totalStudents * 0.5)} छात्रा / {s.totalTeachers} शिक्षक)
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                            <span
                              title={s.hasIctLab ? 'कम्प्युटर ल्याब उपलब्ध' : 'कम्प्युटर ल्याब छैन'}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.2rem',
                                padding: '0.15rem 0.35rem',
                                borderRadius: '4px',
                                fontSize: '0.7rem',
                                backgroundColor: s.hasIctLab ? '#dcfce7' : '#f1f5f9',
                                color: s.hasIctLab ? '#166534' : '#94a3b8',
                              }}
                            >
                              <Laptop size={12} /> ICT
                            </span>
                            <span
                              title={s.hasLibrary ? 'पुस्तकालय उपलब्ध' : 'पुस्तकालय छैन'}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.2rem',
                                padding: '0.15rem 0.35rem',
                                borderRadius: '4px',
                                fontSize: '0.7rem',
                                backgroundColor: s.hasLibrary ? '#dcfce7' : '#f1f5f9',
                                color: s.hasLibrary ? '#166534' : '#94a3b8',
                              }}
                            >
                              <BookOpen size={12} /> Library
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            <a
                              href={`tel:${s.contactNumber || s.contactPhone}`}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                color: 'var(--primary)',
                                textDecoration: 'none',
                                fontSize: '0.8rem',
                                fontWeight: 500,
                              }}
                            >
                              <Phone size={12} />
                              <span>{s.contactNumber || s.contactPhone || '९८...'}</span>
                            </a>
                            {s.portalUrl && (
                              <a
                                href={s.portalUrl}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.25rem',
                                  color: '#059669',
                                  textDecoration: 'none',
                                  fontSize: '0.75rem',
                                }}
                              >
                                <ExternalLink size={11} /> पोर्टल
                              </a>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: '0.75rem', display: 'flex', gap: '6px' }}>
                          <button
                            onClick={() => setSelectedReportSchool(s)}
                            title="आधिकारिक विद्यालय रिपोर्ट कार्ड हेर्नुहोस् र प्रिन्ट गर्नुहोस्"
                            style={{
                              background: '#ecfdf5',
                              border: '1px solid #a7f3d0',
                              borderRadius: '4px',
                              padding: '0.25rem 0.5rem',
                              cursor: 'pointer',
                              color: '#065f46',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                            }}
                          >
                            📄 रिपोर्ट / विवरण
                          </button>
                          <button
                            onClick={() => window.open(`/schools/${s.id || s.emisCode}`, '_blank')}
                            title="विस्तृत प्रोफाइल / SMEPMS"
                            style={{
                              background: '#e0e7ff',
                              border: '1px solid #c7d2fe',
                              borderRadius: '4px',
                              padding: '0.25rem 0.5rem',
                              cursor: 'pointer',
                              color: '#4338ca',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              display: 'inline-flex',
                              alignItems: 'center',
                            }}
                          >
                            🌐 विस्तृत प्रोफाइल / SMEPMS
                          </button>
                          <button
                            onClick={() => {
                              setEditingSchool(s);
                              setIsSchoolModalOpen(true);
                            }}
                            title="सम्पादन गर्नुहोस्"
                            style={{
                              background: 'none',
                              border: '1px solid #cbd5e1',
                              borderRadius: '4px',
                              padding: '0.25rem 0.4rem',
                              cursor: 'pointer',
                              color: 'var(--text-muted)',
                            }}
                          >
                            <Edit size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab Content: Students & IEMIS */}
      {activeTab === 'students' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="dt-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>विद्यार्थी भर्ना विवरण तथा IEMIS रेकर्ड</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                गाउँपालिका स्तरिय विद्यार्थी दर्ता, रोल नं, छात्रवृत्ति र अभिभावक सम्पर्क
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => {
                  setEducationExcelInitialTab('students');
                  setIsEducationExcelModalOpen(true);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.82rem',
                  backgroundColor: '#16a34a',
                  color: '#ffffff',
                  padding: '0.5rem 0.9rem',
                  borderRadius: '6px',
                  border: 'none',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(22, 163, 74, 0.2)',
                }}
              >
                <FileSpreadsheet size={15} /> Excel बाट विद्यार्थी भर्ना
              </button>
              <button
                onClick={() => setIsStudentModalOpen(true)}
                className="dt-btn dt-btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
              >
                <Plus size={16} /> नयाँ विद्यार्थी भर्ना
              </button>
            </div>
          </div>

          <div className="dt-card">
            {isStudentsLoading ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>विद्यार्थी विवरण लोड हुँदैछ...</div>
            ) : students.length === 0 ? (
              <div style={{ padding: '3rem 1rem', textAlign: 'center' }}>
                <GraduationCap size={48} style={{ color: '#cbd5e1', margin: '0 auto 1rem' }} />
                <h4 style={{ margin: '0 0 0.5rem', color: 'var(--text-main)' }}>कुनै विद्यार्थी विवरण भेटिएन</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                  नयाँ शैक्षिक सत्रको विद्यार्थी भर्ना सुरु गर्न 'नयाँ विद्यार्थी भर्ना' बटन थिच्नुहोस्।
                </p>
                <button onClick={() => setIsStudentModalOpen(true)} className="dt-btn dt-btn-primary">
                  <Plus size={16} /> पहिलो विद्यार्थी भर्ना गर्नुहोस्
                </button>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <div className="dt-responsive-table-wrapper">
<table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '0.75rem' }}>रोल / भर्ना नं</th>
                      <th style={{ padding: '0.75rem' }}>विद्यार्थीको नाम</th>
                      <th style={{ padding: '0.75rem' }}>कक्षा</th>
                      <th style={{ padding: '0.75rem' }}>लिङ्ग</th>
                      <th style={{ padding: '0.75rem' }}>जातीय समूह</th>
                      <th style={{ padding: '0.75rem' }}>छात्रवृत्ति</th>
                      <th style={{ padding: '0.75rem' }}>अभिभावक</th>
                      <th style={{ padding: '0.75rem' }}>सम्पर्क</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((st) => (
                      <tr key={st.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '0.75rem', fontFamily: 'monospace' }}>#{st.rollNumber}</td>
                        <td style={{ padding: '0.75rem', fontWeight: 600 }}>{st.fullName}</td>
                        <td style={{ padding: '0.75rem' }}>
                          <span style={{ backgroundColor: '#e0f2fe', color: '#0369a1', padding: '0.15rem 0.4rem', borderRadius: '4px', fontSize: '0.75rem' }}>
                            {st.classGrade || 'कक्षा १'}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem' }}>{st.gender}</td>
                        <td style={{ padding: '0.75rem' }}>{st.casteCategory}</td>
                        <td style={{ padding: '0.75rem' }}>
                          {st.scholarshipType && st.scholarshipType !== 'छैन' ? (
                            <span style={{ backgroundColor: '#dcfce7', color: '#15803d', padding: '0.15rem 0.4rem', borderRadius: '4px', fontSize: '0.75rem' }}>
                              {st.scholarshipType}
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)' }}>-</span>
                          )}
                        </td>
                        <td style={{ padding: '0.75rem' }}>{st.parentName || '-'}</td>
                        <td style={{ padding: '0.75rem' }}>{st.contactPhone || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab Content: Teachers & Staff */}
      {activeTab === 'teachers' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="dt-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>शिक्षक तथा विद्यालय कर्मचारी निर्देशिका</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                स्थायी, राहत, पालिका अनुदान र करार दरबन्दी विवरण
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => {
                  setEducationExcelInitialTab('teachers');
                  setIsEducationExcelModalOpen(true);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.82rem',
                  backgroundColor: '#16a34a',
                  color: '#ffffff',
                  padding: '0.5rem 0.9rem',
                  borderRadius: '6px',
                  border: 'none',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(22, 163, 74, 0.2)',
                }}
              >
                <FileSpreadsheet size={15} /> Excel बाट शिक्षक दर्ता
              </button>
              <button
                onClick={() => setIsTeacherModalOpen(true)}
                className="dt-btn dt-btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
              >
                <Plus size={16} /> नयाँ शिक्षक दर्ता
              </button>
            </div>
          </div>

          <div className="dt-card">
            {isTeachersLoading ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>शिक्षक विवरण लोड हुँदैछ...</div>
            ) : teachers.length === 0 ? (
              <div style={{ padding: '3rem 1rem', textAlign: 'center' }}>
                <Users size={48} style={{ color: '#cbd5e1', margin: '0 auto 1rem' }} />
                <h4 style={{ margin: '0 0 0.5rem', color: 'var(--text-main)' }}>कुनै शिक्षक विवरण भेटिएन</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                  विद्यालयका शिक्षक तथा कर्मचारी विवरण थप्न 'नयाँ शिक्षक दर्ता' गर्नुहोस्।
                </p>
                <button onClick={() => setIsTeacherModalOpen(true)} className="dt-btn dt-btn-primary">
                  <Plus size={16} /> पहिलो शिक्षक दर्ता गर्नुहोस्
                </button>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <div className="dt-responsive-table-wrapper">
<table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '0.75rem' }}>शिक्षकको नाम</th>
                      <th style={{ padding: '0.75rem' }}>विद्यालय</th>
                      <th style={{ padding: '0.75rem' }}>पद</th>
                      <th style={{ padding: '0.75rem' }}>दरबन्दी प्रकार</th>
                      <th style={{ padding: '0.75rem' }}>मुख्य विषय</th>
                      <th style={{ padding: '0.75rem' }}>योग्यता</th>
                      <th style={{ padding: '0.75rem' }}>सम्पर्क</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teachers.map((t) => (
                      <tr key={t.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '0.75rem', fontWeight: 600 }}>{t.fullName}</td>
                        <td style={{ padding: '0.75rem' }}>{t.schoolName || 'विद्यालय'}</td>
                        <td style={{ padding: '0.75rem' }}>{t.designation}</td>
                        <td style={{ padding: '0.75rem' }}>
                          <span style={{ backgroundColor: '#fef3c7', color: '#92400e', padding: '0.15rem 0.4rem', borderRadius: '4px', fontSize: '0.75rem' }}>
                            {t.serviceType || 'स्थायी'}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem' }}>{t.mainSubject || t.subject || '-'}</td>
                        <td style={{ padding: '0.75rem' }}>{t.qualification || '-'}</td>
                        <td style={{ padding: '0.75rem' }}>{t.contactPhone || t.contactNumber || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab Content: Nutrition & Mid-day Meals */}
      {activeTab === 'nutrition' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="dt-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <Utensils size={24} color="#d97706" />
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 600, margin: 0 }}>दिवा खाजा कार्यक्रम (Daily Nutritious Meal Tracker)</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                  आधारभूत तहका (कक्षा १-५ र बालविकास) ३,८५०+ बालबालिकालाई दैनिक १५ रुपैयाँ दरले पौष्टिक स्थानीय परिकार
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ padding: '1rem', backgroundColor: '#fef3c7', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.8rem', color: '#92400e' }}>दैनिक लाभान्वित संख्या</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#78350f' }}>३,८५० बालबालिका</div>
              </div>
              <div style={{ padding: '1rem', backgroundColor: '#dcfce7', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.8rem', color: '#166534' }}>स्थानीय उत्पादन उपयोग</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#14532d' }}>८५% स्थानीय खाद्यान्न</div>
              </div>
              <div style={{ padding: '1rem', backgroundColor: '#e0f2fe', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.8rem', color: '#0369a1' }}>वार्षिक अनुदान रकम</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#0c4a6e' }}>रु. १ करोड १५ लाख</div>
              </div>
            </div>

            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem' }}>
              पालिका स्वीकृत साप्ताहिक दिवा खाजा मेनु (Standard Nutritious Menu):
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
              <div style={{ border: '1px solid var(--border)', borderRadius: '6px', padding: '0.75rem' }}>
                <div style={{ fontWeight: 600, color: 'var(--primary)', fontSize: '0.85rem' }}>आइतबार</div>
                <div style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>जाउलो / खिचडी (दाल, चामल, स्थानीय तरकारी)</div>
              </div>
              <div style={{ border: '1px solid var(--border)', borderRadius: '6px', padding: '0.75rem' }}>
                <div style={{ fontWeight: 600, color: 'var(--primary)', fontSize: '0.85rem' }}>सोमबार</div>
                <div style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>चना-अण्डा वा सिमीको तरकारी र चिउरा</div>
              </div>
              <div style={{ border: '1px solid var(--border)', borderRadius: '6px', padding: '0.75rem' }}>
                <div style={{ fontWeight: 600, color: 'var(--primary)', fontSize: '0.85rem' }}>मंगलबार</div>
                <div style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>हलुवा (सुजी/मकैको पीठो, दूध, घ्यू)</div>
              </div>
              <div style={{ border: '1px solid var(--border)', borderRadius: '6px', padding: '0.75rem' }}>
                <div style={{ fontWeight: 600, color: 'var(--primary)', fontSize: '0.85rem' }}>बुधबार</div>
                <div style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>क्वार्टी / गेडागुडीको झोल र रोटी</div>
              </div>
              <div style={{ border: '1px solid var(--border)', borderRadius: '6px', padding: '0.75rem' }}>
                <div style={{ fontWeight: 600, color: 'var(--primary)', fontSize: '0.85rem' }}>बिहीबार</div>
                <div style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>स्थानीय मकै, भटमास, आलुको परिकार</div>
              </div>
              <div style={{ border: '1px solid var(--border)', borderRadius: '6px', padding: '0.75rem' }}>
                <div style={{ fontWeight: 600, color: 'var(--primary)', fontSize: '0.85rem' }}>शुक्रबार</div>
                <div style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>मौसम अनुसारको फलफूल र उमालेको अण्डा</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: Analytics & Facilities */}
      {activeTab === 'analytics' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
          <div className="dt-card">
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Laptop size={18} color="#2563eb" /> ICT ल्याब तथा डिजिटल कक्षा पूर्वाधार
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                  <span>कम्प्युटर ल्याब सम्पन्न विद्यालयहरू</span>
                  <strong>१२ / २५ विद्यालय (४८%)</strong>
                </div>
                <div style={{ height: '8px', backgroundColor: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
                  <div style={{ width: '48%', height: '100%', backgroundColor: '#2563eb' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                  <span>इन्टरनेट तथा डिजिटल स्मार्ट बोर्ड</span>
                  <strong>१० / २५ विद्यालय (४०%)</strong>
                </div>
                <div style={{ height: '8px', backgroundColor: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
                  <div style={{ width: '40%', height: '100%', backgroundColor: '#10b981' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                  <span>पुस्तकालय (Library) सम्पन्न</span>
                  <strong>१५ / २५ विद्यालय (६०%)</strong>
                </div>
                <div style={{ height: '8px', backgroundColor: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
                  <div style={{ width: '60%', height: '100%', backgroundColor: '#f59e0b' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                  <span>विज्ञान प्रयोगशाला (Science Lab)</span>
                  <strong>७ / २५ विद्यालय (२८%)</strong>
                </div>
                <div style={{ height: '8px', backgroundColor: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
                  <div style={{ width: '28%', height: '100%', backgroundColor: '#8b5cf6' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="dt-card">
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Award size={18} color="#16a34a" /> शैक्षिक उपलब्धि तथा SEE नतिजा (२०८०/२०८१)
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>SEE उत्तीर्ण दर (Pass Rate)</span>
                <strong style={{ color: '#16a34a', fontSize: '1.1rem' }}>६८.४%</strong>
              </div>
              <div style={{ padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>कक्षा ८ (BLE) उत्तीर्ण दर</span>
                <strong style={{ color: '#2563eb', fontSize: '1.1rem' }}>८२.६%</strong>
              </div>
              <div style={{ padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>कक्षा छाड्ने दर (Dropout Rate)</span>
                <strong style={{ color: '#dc2626', fontSize: '1.1rem' }}>२.१%</strong>
              </div>
              <div style={{ padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>छात्रा सहभागिता अनुपात</span>
                <strong style={{ color: '#7c3aed', fontSize: '1.1rem' }}>५०.५%</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: Student Exam Assessments */}
      {activeTab === 'assessments' && (
        <AssessmentsTab schools={safeSchools} />
      )}

      {/* Modals */}
      <SchoolModal
        isOpen={isSchoolModalOpen}
        onClose={() => {
          setIsSchoolModalOpen(false);
          setEditingSchool(null);
        }}
        initialData={editingSchool}
        onSave={async (schoolData) => {
          if (editingSchool?.id) {
            await updateSchoolMutation.mutateAsync({ id: editingSchool.id, data: schoolData });
          } else {
            await createSchoolMutation.mutateAsync(schoolData);
          }
        }}
      />

      <StudentModal
        isOpen={isStudentModalOpen}
        onClose={() => setIsStudentModalOpen(false)}
        schools={safeSchools}
        onSave={async (studentData) => {
          await createStudentMutation.mutateAsync(studentData);
        }}
      />

      <TeacherModal
        isOpen={isTeacherModalOpen}
        onClose={() => setIsTeacherModalOpen(false)}
        schools={safeSchools}
        onSave={async (teacherData) => {
          await createTeacherMutation.mutateAsync(teacherData);
        }}
      />

      {/* Education Excel Bulk Import Modal */}
      <EducationExcelImportModal
        isOpen={isEducationExcelModalOpen}
        onClose={() => setIsEducationExcelModalOpen(false)}
        initialTab={educationExcelInitialTab}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['education-schools'] });
          queryClient.invalidateQueries({ queryKey: ['education-students'] });
          queryClient.invalidateQueries({ queryKey: ['education-teachers'] });
          queryClient.invalidateQueries({ queryKey: ['education-overview'] });
        }}
      />

      {/* Official School Report & Profile Modal */}
      {selectedReportSchool && (
        <SchoolDetailModal
          isOpen={!!selectedReportSchool}
          school={selectedReportSchool}
          onClose={() => setSelectedReportSchool(null)}
        />
      )}
    </div>
  );
};

export default EducationPage;
