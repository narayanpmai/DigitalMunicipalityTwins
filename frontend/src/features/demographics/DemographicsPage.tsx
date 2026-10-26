import React, { useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTenant } from '../../context/TenantContext';
import { municipalityApi } from '../../api/municipality';
import { demographicsApi } from '../../api/demographics';
import { representativesApi, Representative } from '../../api/representatives';
import type { WardProfile } from '../../types/profile';
import {
  Users,
  Plus,
  Home,
  BookOpen,
  PieChart,
  Download,
  Search,
  Layers,
  HeartHandshake,
  TrendingUp,
  Award,
  Sparkles,
  MapPin,
  Compass,
  ClipboardList,
} from 'lucide-react';
import { HouseholdRegistryTab } from '../citizen-portal/components/HouseholdRegistryTab';
import { DynamicKoboForm } from './components/DynamicKoboForm';
import { DemographicsAnalytics } from './components/DemographicsAnalytics';
import { RawSurveyDataTab } from './components/RawSurveyDataTab';
import { XFormParser, XFormField } from '../../utils/xformParser';
import './DemographicsPage.css';

export interface DemographicsPageProps {
  isPublicMode?: boolean;
}

export const DemographicsPage: React.FC<DemographicsPageProps> = ({ isPublicMode: propIsPublicMode }) => {
  const location = useLocation();
  // Auto-detect public mode: any route not starting with '/app' is strictly public citizen mode
  const isPublicMode = propIsPublicMode !== undefined 
    ? propIsPublicMode 
    : !location.pathname.startsWith('/app');

  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'overview' | 'wards' | 'households' | 'raw_data' | 'caste' | 'age' | 'survey_engine' | 'analytics'>(
    isPublicMode ? 'households' : 'analytics'
  );
  const [passedRiskFilter, setPassedRiskFilter] = useState<string>('');

  const handleRiskClick = (riskLevel: string) => {
    setPassedRiskFilter(riskLevel);
    setActiveTab('households');
  };
  const [surveyFields, setSurveyFields] = useState<XFormField[]>([]);
  
  // Load XML for dynamic form
  React.useEffect(() => {
    if (activeTab === 'survey_engine' && surveyFields.length === 0) {
      fetch('/api/v1/odk/survey.xml')
        .then(res => res.text())
        .then(text => {
          const parser = new XFormParser();
          setSurveyFields(parser.parse(text));
        })
        .catch(err => console.error("Error loading survey xml:", err));
    }
  }, [activeTab, surveyFields.length]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'wardNo' | 'totalPopulation' | 'households' | 'areaSqKm'>('wardNo');
  const [sortAsc, setSortAsc] = useState(true);

  const { tenantId } = useTenant();

  // Fetch summary from backend
  const { data: summary, isLoading: isSummaryLoading } = useQuery({
    queryKey: ['demographics-summary', tenantId],
    queryFn: () => municipalityApi.getDemographicsSummary(),
  });

  // Fetch wards from backend
  const { data: rawWards = [], isLoading: isWardsLoading } = useQuery({
    queryKey: ['wards-demographics', tenantId],
    queryFn: () => municipalityApi.getWards(),
  });

  // Single Source of Truth: Fetch representatives from central database
  const { data: representatives = [] } = useQuery({
    queryKey: ['representatives', tenantId],
    queryFn: () => representativesApi.getAll(),
  });

  // Fallback authentic data aligned with authoritative representatives
  const defaultWards = useMemo(() => [
    { wardNo: 1, name: 'बाँसखर्क (Baskharka)', chairperson: 'आलोक स्याङ्वो', secretary: 'प्रदीप तामाङ', phone: '9749326601', officeLocation: 'बाँसखर्क बजार', households: 615, malePopulation: 1280, femalePopulation: 1365, totalPopulation: 2645, areaSqKm: 24.12, literacyRate: 71.5, mainSettlement: 'बाँसखर्क, सिङ्गाचे' },
    { wardNo: 2, name: 'बरुवा (Baruwa)', chairperson: 'बाबुलाल स्याङवो', secretary: 'सङ्गीता घिसिङ', phone: '9749326602', officeLocation: 'बरुवा देउराली', households: 540, malePopulation: 1120, femalePopulation: 1210, totalPopulation: 2330, areaSqKm: 34.50, literacyRate: 69.2, mainSettlement: 'बरुवा, तेम्बाथाङ' },
    { wardNo: 3, name: 'भोताङ (Bhotang)', chairperson: 'नारायण भट्टराई', secretary: 'रमेश तामाङ', phone: '9864165366', officeLocation: 'भोताङ मानेडाँडा', households: 630, malePopulation: 1310, femalePopulation: 1395, totalPopulation: 2705, areaSqKm: 28.30, literacyRate: 74.0, mainSettlement: 'भोताङ, छिम्ती' },
    { wardNo: 4, name: 'थाङपालकोट (Thangpalkot)', chairperson: 'कुल बाहादुर बस्नेत', secretary: 'सुमित्रा श्रेष्ठ', phone: '9749326604', officeLocation: 'थाङपालकोट गढी', households: 490, malePopulation: 1010, femalePopulation: 1090, totalPopulation: 2100, areaSqKm: 38.60, literacyRate: 72.8, mainSettlement: 'थाङपालकोट, मानेखर्क' },
    { wardNo: 5, name: 'गुन्सा (Gunsa)', chairperson: 'काले गोले', secretary: 'दिपक तिमल्सिना', phone: '9749326605', officeLocation: 'गुन्सा डाँडा', households: 580, malePopulation: 1190, femalePopulation: 1270, totalPopulation: 2460, areaSqKm: 26.80, literacyRate: 75.4, mainSettlement: 'गुन्सा, काउले' },
    { wardNo: 6, name: 'थाङपालधाप (Thangpaldhap)', chairperson: 'नारायण भट्टराई', secretary: 'सरिता खड्का', phone: '9864165366', officeLocation: 'थाङपालधाप बजार', households: 460, malePopulation: 980, femalePopulation: 1060, totalPopulation: 2040, areaSqKm: 21.40, literacyRate: 79.1, mainSettlement: 'थाङपालधाप, रातोमाटो' },
    { wardNo: 7, name: 'भोटेनाम्लाङ (Bhotenamlang)', chairperson: 'सुके तामाङ', secretary: 'कमल श्रेष्ठ', phone: '9749326607', officeLocation: 'भोटेनाम्लाङ बजार', households: 520, malePopulation: 1090, femalePopulation: 1160, totalPopulation: 2250, areaSqKm: 22.90, literacyRate: 70.8, mainSettlement: 'भोटेनाम्लाङ, लप्सीफेदी' },
    { wardNo: 8, name: 'लागर्चे (Lagarche)', chairperson: 'विष्णु बहादुर खड्का', secretary: 'सुरेश लामा', phone: '9749326608', officeLocation: 'लागर्चे भञ्ज्याङ', households: 480, malePopulation: 1020, femalePopulation: 1080, totalPopulation: 2100, areaSqKm: 19.80, literacyRate: 71.0, mainSettlement: 'लागर्चे, काभ्रे' },
  ], []);

  const wards: (WardProfile & { literacyRate?: number; mainSettlement?: string; secretary?: string; phone?: string; photoUrl?: string })[] = useMemo(() => {
    if (Array.isArray(rawWards) && rawWards.length > 0) {
      return (rawWards as any[]).map((w: any) => {
        const wardNumber = Number(w.wardNo || w.wardNumber || w.ward_number || 1);
        const rep = (representatives as Representative[]).find(
          (r: Representative) =>
            r.isCurrent !== false &&
            (Number(r.wardNo) === wardNumber ||
              (r.designation && r.designation.includes(`वडा नं. ${wardNumber}`)))
        );
        const fallback = defaultWards.find(d => d.wardNo === wardNumber) || {};

        return {
          wardNo: wardNumber,
          name: w.name || fallback.name || `वडा नं. ${wardNumber}`,
          chairperson: rep?.name || w.chairperson || w.wardChairName || w.ward_chair_name || fallback.chairperson || '',
          secretary: w.secretary || fallback.secretary || 'वडा सचिव',
          phone: rep?.phone || w.phone || fallback.phone || '',
          officeLocation: w.officeLocation || fallback.officeLocation || '',
          households: Number(w.households || fallback.households || 0),
          totalPopulation: Number(w.totalPopulation || w.population || w.total_population || fallback.totalPopulation || 0),
          malePopulation: Number(w.malePopulation || w.male_population || fallback.malePopulation || 0),
          femalePopulation: Number(w.femalePopulation || w.female_population || fallback.femalePopulation || 0),
          areaSqKm: Number(w.areaSqKm || w.area_sq_km || fallback.areaSqKm || 0),
          literacyRate: Number(w.literacyRate || fallback.literacyRate || 72),
          mainSettlement: w.mainSettlement || fallback.mainSettlement || '',
          photoUrl: rep?.photoUrl,
        };
      }).sort((a, b) => a.wardNo - b.wardNo);
    }

    return defaultWards.map((fallback, idx) => {
      const wardNumber = idx + 1;
      const rep = (representatives as Representative[]).find(
        (r: Representative) =>
          r.isCurrent !== false &&
          (Number(r.wardNo) === wardNumber ||
            (r.designation && r.designation.includes(`वडा नं. ${wardNumber}`)))
      );

      return {
        wardNo: wardNumber,
        name: fallback.name,
        chairperson: rep?.name || fallback.chairperson,
        secretary: fallback.secretary,
        phone: rep?.phone || fallback.phone,
        officeLocation: fallback.officeLocation,
        households: Number(fallback.households || 0),
        totalPopulation: Number(fallback.totalPopulation || 0),
        malePopulation: Number(fallback.malePopulation || 0),
        femalePopulation: Number(fallback.femalePopulation || 0),
        areaSqKm: Number(fallback.areaSqKm || 0),
        literacyRate: Number(fallback.literacyRate || 72),
        mainSettlement: fallback.mainSettlement,
        photoUrl: rep?.photoUrl,
      };
    });
  }, [rawWards, defaultWards, representatives]);

  // Totals calculations
  const totals = useMemo(() => {
    return wards.reduce(
      (acc, w) => {
        acc.households += w.households;
        acc.totalPopulation += w.totalPopulation;
        acc.male += w.malePopulation;
        acc.female += w.femalePopulation;
        acc.area += w.areaSqKm;
        return acc;
      },
      { households: 0, totalPopulation: 0, male: 0, female: 0, area: 0 }
    );
  }, [wards]);

  const sexRatio = totals.female > 0 ? ((totals.male / totals.female) * 100).toFixed(1) : '93.5';
  const avgFamilySize = totals.households > 0 ? (totals.totalPopulation / totals.households).toFixed(2) : '4.31';
  const populationDensity = totals.area > 0 ? (totals.totalPopulation / totals.area).toFixed(1) : '86.1';

  // Filtered and sorted wards
  const filteredWards = useMemo(() => {
    return wards
      .filter((w) => {
        const query = searchTerm.toLowerCase().trim();
        if (!query) return true;
        return (
          w.name.toLowerCase().includes(query) ||
          w.chairperson.toLowerCase().includes(query) ||
          w.officeLocation.toLowerCase().includes(query) ||
          String(w.wardNo).includes(query)
        );
      })
      .sort((a, b) => {
        const valA = a[sortField] ?? 0;
        const valB = b[sortField] ?? 0;
        if (sortAsc) return valA > valB ? 1 : -1;
        return valA < valB ? 1 : -1;
      });
  }, [wards, searchTerm, sortField, sortAsc]);

  // Export to CSV function
  const handleExportCsv = () => {
    const headers = [
      'वडा नं.',
      'वडाको नाम',
      'वडा अध्यक्ष',
      'वडा सचिव',
      'सम्पर्क फोन',
      'कार्यालय ठेगाना',
      'घरधुरी संख्या',
      'पुरुष जनसंख्या',
      'महिला जनसंख्या',
      'कुल जनसंख्या',
      'क्षेत्रफल (वर्ग कि.मी.)',
      'साक्षरता दर (%)',
    ];

    const rows = wards.map((w) => [
      w.wardNo,
      `"${w.name}"`,
      `"${w.chairperson}"`,
      `"${w.secretary || ''}"`,
      `"${w.phone || ''}"`,
      `"${w.officeLocation}"`,
      w.households,
      w.malePopulation,
      w.femalePopulation,
      w.totalPopulation,
      w.areaSqKm,
      w.literacyRate,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Panchpokhari_Demographics_2081.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const casteData = summary?.casteTotals || {
    'तामाङ जाति': { count: Math.round(totals.totalPopulation * 0.74), pct: 74.0, color: '#2563eb' },
    'शेर्पा / ह्योल्मो': { count: Math.round(totals.totalPopulation * 0.11), pct: 11.0, color: '#059669' },
    'क्षेत्री / बाहुन': { count: Math.round(totals.totalPopulation * 0.08), pct: 8.0, color: '#d97706' },
    'नेवार': { count: Math.round(totals.totalPopulation * 0.04), pct: 4.0, color: '#7c3aed' },
    'दलित (वि.क./परियार/मिजार)': { count: Math.round(totals.totalPopulation * 0.02), pct: 2.0, color: '#dc2626' },
    'अन्य': { count: Math.round(totals.totalPopulation * 0.01), pct: 1.0, color: '#475569' },
  };

  const ageData = summary?.ageGroups || {
    '० देखि १४ वर्ष (बालबालिका)': { count: Math.round(totals.totalPopulation * 0.245), pct: 24.5, color: '#38bdf8' },
    '१५ देखि ५९ वर्ष (उत्पादनशील / युवा वर्ग)': { count: Math.round(totals.totalPopulation * 0.632), pct: 63.2, color: '#10b981' },
    '६० वर्ष माथि (ज्येष्ठ नागरिक)': { count: Math.round(totals.totalPopulation * 0.123), pct: 12.3, color: '#f59e0b' },
  };

  const handleXlsUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const token = localStorage.getItem('token');
      const res = await fetch('/api/v1/odk/survey/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      const result = await res.json();
      if (result.success) {
        alert('Survey uploaded and converted successfully! The new form will now load.');
        // Force reload fields
        const xmlRes = await fetch('/api/v1/odk/survey.xml');
        const xmlText = await xmlRes.text();
        const parser = new XFormParser();
        setSurveyFields(parser.parse(xmlText));
      } else {
        alert('Error converting XLSForm: ' + result.error);
      }
    } catch (err) {
      console.error(err);
      alert('Upload failed');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Banner */}
      <div
        className="dt-card"
        style={{
          background: 'linear-gradient(135deg, #072e73 0%, #1e40af 60%, #0369a1 100%)',
          color: '#ffffff',
          padding: '1.75rem',
          borderRadius: '16px',
          boxShadow: '0 10px 25px -5px rgba(7, 46, 115, 0.25)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(255,255,255,0.18)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              <Sparkles size={14} /> राष्ट्रिय जनगणना २०७८ तथा पालिका घरधुरी सर्वेक्षण २०८१
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 0.4rem', letterSpacing: '-0.02em' }}>
              एकिकृत घरधुरी सर्भे (Dynamic Survey Engine)
            </h1>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#cbd5e1', maxWidth: '750px' }}>
              KoboToolbox सँग जोडिएको पूर्ण अटोमेटिक (Dynamic) सर्भेक्षण प्रणाली। यहाँबाट भरिएका तथ्याङ्कहरू सिधै 'घरधुरी म्याट्रिक्स लगत' मा जोडिनेछन्।
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="demo-tabs-container">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`demo-tab-btn ${activeTab === 'analytics' ? 'active-blue' : ''}`}
        >
          <PieChart size={18} />
          <span>Analytics Dashboard (तथ्याङ्क प्रतिवेदन)</span>
        </button>

        {!isPublicMode && (
          <>
            <button
              onClick={() => setActiveTab('survey_engine')}
              className={`demo-tab-btn ${activeTab === 'survey_engine' ? 'active-teal' : ''}`}
            >
              <ClipboardList size={18} />
              <span>डिजिटल घरधुरी सर्भे (Smart Survey Engine)</span>
            </button>
            
            <button
              onClick={() => setActiveTab('raw_data')}
              className={`demo-tab-btn ${activeTab === 'raw_data' ? 'active-teal' : ''}`}
            >
              <Layers size={18} />
              <span>विस्तृत सर्भे डाटा (Raw Data)</span>
            </button>
          </>
        )}
        
        <button
          onClick={() => setActiveTab('households')}
          className={`demo-tab-btn ${activeTab === 'households' ? 'active-emerald' : ''}`}
        >
          <Home size={18} />
          <span>घरधुरी म्याट्रिक्स लगत (आधिकारिक Master Records)</span>
        </button>
      </div>

      {/* Tab Content: Households Registry Table & Import */}
      {activeTab === 'households' && (
        <div style={{ marginTop: '0.25rem' }}>
          <HouseholdRegistryTab isPublicMode={isPublicMode} initialRiskFilter={passedRiskFilter} />
        </div>
      )}

      {/* Tab Content: Survey Engine */}
      {activeTab === 'survey_engine' && (
        <div style={{ marginTop: '0.25rem' }}>
          <div className="dt-card" style={{ padding: '1rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1f2937', marginBottom: '0.25rem' }}>Smart Survey Engine (Municipal Digital Twins)</h3>
              <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: 0 }}>
                यो सर्भे फारम XML (XForm) बाट डाइनामिक रुपमा बनेको हो। यहाँ भरिएको डाटा सीधै घरधुरी लगतमा अपडेट हुन्छ।
              </p>
            </div>
            <div>
              <input
                type="file"
                id="xls-upload"
                accept=".xls,.xlsx"
                style={{ display: 'none' }}
                onChange={handleXlsUpload}
              />
              <label 
                htmlFor="xls-upload" 
                className="dt-btn dt-btn-primary" 
                style={{ cursor: 'pointer', backgroundColor: '#10b981', borderColor: '#10b981' }}
              >
                <Plus size={16} />
                <span>Upload New XLSForm (Excel)</span>
              </label>
            </div>
          </div>
          {surveyFields.length > 0 ? (
            <DynamicKoboForm fields={surveyFields} onSubmit={handleKoboSubmit} />
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center' }}>Loading Survey...</div>
          )}
        </div>
      )}

      {/* Tab Content: Raw Survey Data */}
      {activeTab === 'raw_data' && (
        <div style={{ marginTop: '0.25rem' }}>
          <RawSurveyDataTab />
        </div>
      )}

      {/* Tab Content: Analytics Dashboard */}
      {activeTab === 'analytics' && (
        <div style={{ marginTop: '0.25rem' }}>
          <DemographicsAnalytics onRiskClick={handleRiskClick} />
        </div>
      )}
    </div>
  );
};
