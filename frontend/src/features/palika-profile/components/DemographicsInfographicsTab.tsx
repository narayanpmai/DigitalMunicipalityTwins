import React from 'react';
import {
  Users,
  PieChart,
  BookOpen,
  Award,
  HeartHandshake,
  TrendingUp,
  Activity,
  Layers,
  Sparkles,
  ExternalLink,
  Building,
  Home,
  CheckCircle2
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { municipalityApi } from '../../../api/municipality';
import { demographicsApi } from '../../../api/demographics';
import { MunicipalityProfile } from '../../../types/profile';
import { useTenant } from '../../../context/TenantContext';
import { toNepaliDigits } from '../../../utils/nepaliCalendar';

// ── COLOR PALETTES FOR CHARTS ──
const WARD_PALETTE = [
  '#0284c7', '#06b6d4', '#10b981', '#6366f1', '#8b5cf6',
  '#ec4899', '#f59e0b', '#14b8a6', '#f97316', '#3b82f6',
  '#84cc16', '#d946ef'
];

const CASTE_PALETTE = [
  '#0284c7', '#10b981', '#f59e0b', '#8b5cf6', '#6366f1',
  '#ef4444', '#14b8a6', '#f97316', '#ec4899', '#06b6d4', '#64748b'
];

const RELIGION_PALETTE = [
  '#f59e0b', '#ef4444', '#3b82f6', '#10b981', '#8b5cf6', '#64748b'
];

const AGE_BRACKETS = [
  { age: '८०+ वर्ष', mPct: 1.0, fPct: 1.4 },
  { age: '७०-७९ वर्ष', mPct: 3.2, fPct: 3.6 },
  { age: '६०-६९ वर्ष', mPct: 6.8, fPct: 7.3 },
  { age: '५०-५९ वर्ष', mPct: 10.5, fPct: 11.0 },
  { age: '४०-४९ वर्ष', mPct: 13.7, fPct: 14.3 },
  { age: '३०-३९ वर्ष', mPct: 16.2, fPct: 16.8 },
  { age: '२०-२९ वर्ष', mPct: 18.7, fPct: 18.9 },
  { age: '१०-१९ वर्ष', mPct: 16.3, fPct: 15.9 },
  { age: '०-९ वर्ष', mPct: 13.6, fPct: 10.8 },
];

interface DemographicsInfographicsTabProps {
  profile?: MunicipalityProfile;
}

export const DemographicsInfographicsTab: React.FC<DemographicsInfographicsTabProps> = ({ profile: propProfile }) => {
  const { tenantId } = useTenant();
  const { data: fetchedProfile } = useQuery({
    queryKey: ['municipality-profile', tenantId],
    queryFn: () => municipalityApi.getProfile(),
    enabled: !propProfile,
  });

  const profile = propProfile || fetchedProfile;
  const demo = profile?.demographics;

  // Fetch official NSO Nepal Census 2021 dataset (multi-tenant aware via X-Tenant-Id header)
  const { data: censusData } = useQuery({
    queryKey: ['census-2021', tenantId, profile?.name_np],
    queryFn: () => demographicsApi.getCensus2021(),
  });

  const palikaName = censusData?.overview?.municipality_name_np || profile?.name_np || 'गाउँपालिका';
  const totalPop = censusData?.overview?.total_population ?? profile?.total_population ?? demo?.totalPopulation ?? 20997;
  const malePop = censusData?.overview?.male_population ?? demo?.male ?? 10614;
  const femalePop = censusData?.overview?.female_population ?? demo?.female ?? 10383;
  const malePct = censusData?.overview?.male_percent ?? (totalPop ? Math.round((malePop / totalPop) * 1000) / 10 : 50.6);
  const femalePct = censusData?.overview?.female_percent ?? (100 - malePct);
  const totalHouseholds = censusData?.overview?.total_households ?? profile?.total_households ?? demo?.households ?? 5914;
  const sexRatio = censusData?.overview?.sex_ratio ?? demo?.sexRatio ?? '102.22';
  const avgFamily = censusData?.overview?.average_household_size ?? demo?.averageFamilySize ?? '3.55';
  const density = censusData?.overview?.population_density ?? demo?.density ?? '112';
  const areaSqKm = censusData?.overview?.area_sq_km ?? profile?.area_sq_km ?? 187.29;
  const literacy = censusData?.overview?.literacy_rate ?? demo?.literacyRate ?? 57.7;
  const maleLit = censusData?.overview?.male_literacy_rate ?? demo?.maleLiteracyRate ?? 63.1;
  const femaleLit = censusData?.overview?.female_literacy_rate ?? demo?.femaleLiteracyRate ?? 52.1;
  const censusUrl = censusData?.source?.url || "https://censusresults.nsonepal.gov.np/population";

  // Dynamic Wards List
  const wardsList = censusData?.wards && censusData.wards.length > 0
    ? censusData.wards.map((w: any, idx: number) => ({
        ward: w.ward_no,
        name: w.name_np,
        total: w.total,
        male: w.male,
        female: w.female,
        pct: w.percent,
        color: WARD_PALETTE[idx % WARD_PALETTE.length]
      }))
    : [
        { ward: 1, name: 'बाँसखर्क', total: 2092, male: 1063, female: 1029, pct: 9.96, color: '#0284c7' },
        { ward: 2, name: 'बरुवा', total: 1696, male: 904, female: 792, pct: 8.08, color: '#06b6d4' },
        { ward: 3, name: 'भोताङ', total: 3003, male: 1561, female: 1442, pct: 14.30, color: '#10b981' },
        { ward: 4, name: 'थाङपालकोट', total: 2687, male: 1372, female: 1315, pct: 12.80, color: '#6366f1' },
        { ward: 5, name: 'गुन्सा', total: 2288, male: 1162, female: 1126, pct: 10.90, color: '#8b5cf6' },
        { ward: 6, name: 'थाङपालधाप', total: 3236, male: 1622, female: 1614, pct: 15.41, color: '#ec4899' },
        { ward: 7, name: 'भोटेनाम्लाङ', total: 3640, male: 1795, female: 1845, pct: 17.34, color: '#f59e0b' },
        { ward: 8, name: 'लागर्चे', total: 2355, male: 1135, female: 1220, pct: 11.22, color: '#14b8a6' },
      ];

  const maxWardTotal = Math.max(...wardsList.map((w: any) => w.total), 1);

  // Dynamic Caste/Ethnicity List
  const ethnicityList = censusData?.caste_ethnicity && censusData.caste_ethnicity.length > 0
    ? censusData.caste_ethnicity.map((c: any, idx: number) => ({
        caste: c.name_en ? `${c.name_np} (${c.name_en})` : c.name_np,
        count: c.population,
        pct: c.percentage,
        color: CASTE_PALETTE[idx % CASTE_PALETTE.length]
      }))
    : [
        { caste: 'तामाङ (Tamang)', count: 13837, pct: 65.9, color: '#0284c7' },
        { caste: 'क्षेत्री (Kshetri)', count: 2373, pct: 11.3, color: '#10b981' },
        { caste: 'नेवाः / नेवार (Newar)', count: 882, pct: 4.2, color: '#f59e0b' },
        { caste: 'ह्योल्मो / योल्मोपा (Hyolmo)', count: 777, pct: 3.7, color: '#8b5cf6' },
        { caste: 'सन्यासी / दसनामी (Dasnami)', count: 567, pct: 2.7, color: '#6366f1' },
        { caste: 'विश्वकर्मा (दलित)', count: 546, pct: 2.6, color: '#ef4444' },
        { caste: 'पहाडी ब्राह्मण (Hill Brahmin)', count: 399, pct: 1.9, color: '#14b8a6' },
        { caste: 'मिजार (दलित)', count: 378, pct: 1.8, color: '#f97316' },
        { caste: 'परियार (दलित)', count: 252, pct: 1.2, color: '#ec4899' },
        { caste: 'गुरुङ (Gurung)', count: 231, pct: 1.1, color: '#06b6d4' },
        { caste: 'अन्य समुदाय (Others)', count: 755, pct: 3.6, color: '#64748b' },
      ];

  // Dynamic Religion List
  const religionList = censusData?.religion && censusData.religion.length > 0
    ? censusData.religion.map((r: any, idx: number) => ({
        name: r.name_en ? `${r.name_np} (${r.name_en})` : r.name_np,
        count: r.population,
        pct: r.percentage,
        color: r.color || RELIGION_PALETTE[idx % RELIGION_PALETTE.length]
      }))
    : [
        { name: 'बौद्ध धर्म (Bouddha)', count: 14782, pct: 70.4, color: '#f59e0b' },
        { name: 'हिन्दु धर्म (Hindu)', count: 5879, pct: 28.0, color: '#ef4444' },
        { name: 'इसाई धर्म (Christian)', count: 315, pct: 1.5, color: '#3b82f6' },
        { name: 'बोन तथा अन्य', count: 21, pct: 0.1, color: '#10b981' },
      ];

  // Dynamic Language List
  const languageList = censusData?.mother_tongue && censusData.mother_tongue.length > 0
    ? censusData.mother_tongue.map((l: any, idx: number) => ({
        lang: l.name_np,
        count: l.speakers,
        pct: l.percentage,
        color: CASTE_PALETTE[idx % CASTE_PALETTE.length]
      }))
    : [
        { lang: 'तामाङ भाषा', count: 13648, pct: 65.0, color: '#0284c7' },
        { lang: 'नेपाली भाषा (खस)', count: 5354, pct: 25.5, color: '#10b981' },
        { lang: 'ह्योल्मो भाषा', count: 924, pct: 4.4, color: '#8b5cf6' },
        { lang: 'नेपालभाषा (नेवारी)', count: 756, pct: 3.6, color: '#f59e0b' },
        { lang: 'शेर्पा भाषा', count: 210, pct: 1.0, color: '#ec4899' },
        { lang: 'अन्य भाषा', count: 105, pct: 0.5, color: '#64748b' },
      ];

  // Amenities & Housing
  const toiletPct = censusData?.housing_and_amenities?.households_with_toilet_percent ?? 99.4;
  const ownedHousePct = censusData?.housing_and_amenities?.owned_house_percent ?? 97.7;
  const birthRegPct = censusData?.housing_and_amenities?.birth_registration_under_5_percent ?? 89.4;
  const disabilityPct = censusData?.housing_and_amenities?.disability_prevalence_percent ?? 2.4;

  // Age-Sex Pyramid Rows dynamically calculated based on exact male/female populations
  const agePyramidList = AGE_BRACKETS.map((row) => ({
    age: row.age,
    male: Math.round((malePop * row.mPct) / 100),
    female: Math.round((femalePop * row.fPct) / 100),
    mPct: row.mPct,
    fPct: row.fPct,
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* ── 0. OFFICIAL NSO SOURCE VERIFICATION BANNER ── */}
      <div 
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          borderRadius: '16px',
          padding: '1.25rem 1.5rem',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ 
            width: '44px', 
            height: '44px', 
            borderRadius: '12px', 
            background: 'rgba(56, 189, 248, 0.15)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            color: '#38bdf8' 
          }}>
            <Building size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '1.05rem', fontWeight: 800 }}>
                राष्ट्रिय जनगणना २०७८ (NSO Nepal Census 2021) आधिकारिक तथ्याङ्क
              </span>
              <span style={{ 
                background: '#059669', 
                color: '#ffffff', 
                fontSize: '0.72rem', 
                fontWeight: 700, 
                padding: '2px 8px', 
                borderRadius: '6px' 
              }}>
                प्रमाणित तथ्याङ्क
              </span>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#94a3b8' }}>
              राष्ट्रिय तथ्याङ्क कार्यालय (National Statistics Office) द्वारा सार्वजनिक {palikaName}को यथार्थ जनसांख्यिकी
            </p>
          </div>
        </div>

        <a 
          href={censusUrl} 
          target="_blank" 
          rel="noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: '#38bdf8',
            padding: '0.5rem 1rem',
            borderRadius: '10px',
            fontSize: '0.82rem',
            fontWeight: 700,
            textDecoration: 'none',
            transition: 'all 0.2s ease'
          }}
        >
          <ExternalLink size={14} /> NSO Census Portal हेर्नुहोस्
        </a>
      </div>

      {/* ── 1. TOP SUMMARY METRICS ROW ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div className="palika-glass-card" style={{ padding: '1.25rem', borderLeft: '4px solid #0284c7' }}>
          <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>कुल जनसंख्या</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a', margin: '4px 0' }}>
            {toNepaliDigits(totalPop)} जना
          </div>
          <div style={{ fontSize: '0.75rem', color: '#0284c7', fontWeight: 700 }}>
            पुरुष: {toNepaliDigits(malePop)} ({toNepaliDigits(malePct)}%) | महिला: {toNepaliDigits(femalePop)} ({toNepaliDigits(femalePct)}%)
          </div>
        </div>

        <div className="palika-glass-card" style={{ padding: '1.25rem', borderLeft: '4px solid #10b981' }}>
          <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>कुल घरधुरी (Households)</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#047857', margin: '4px 0' }}>
            {toNepaliDigits(totalHouseholds)} घर
          </div>
          <div style={{ fontSize: '0.75rem', color: '#047857', fontWeight: 700 }}>
            औसत परिवार आकार: {toNepaliDigits(avgFamily)} जना
          </div>
        </div>

        <div className="palika-glass-card" style={{ padding: '1.25rem', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>लैङ्गिक अनुपात (Sex Ratio)</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#b45309', margin: '4px 0' }}>
            {toNepaliDigits(sexRatio)}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>प्रति १०० महिलामा पुरुष</div>
        </div>

        <div className="palika-glass-card" style={{ padding: '1.25rem', borderLeft: '4px solid #8b5cf6' }}>
          <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>समग्र साक्षरता दर</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#6d28d9', margin: '4px 0' }}>
            {toNepaliDigits(literacy)}%
          </div>
          <div style={{ fontSize: '0.75rem', color: '#6d28d9', fontWeight: 600 }}>
            पुरुष: {toNepaliDigits(maleLit)}% | महिला: {toNepaliDigits(femaleLit)}%
          </div>
        </div>

        <div className="palika-glass-card" style={{ padding: '1.25rem', borderLeft: '4px solid #ec4899' }}>
          <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>जनघनत्व (Density)</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#be185d', margin: '4px 0' }}>
            {toNepaliDigits(density)}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>प्रति वर्ग कि.मि. (क्षेत्रफल: {toNepaliDigits(areaSqKm)} वर्ग किमि)</div>
        </div>
      </div>

      {/* ── 2. WARD-WISE OFFICIAL POPULATION DISTRIBUTION ── */}
      <div className="palika-glass-card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={20} className="text-blue-600" />
              {palikaName}: {toNepaliDigits(wardsList.length)} वटै वडाको यथार्थ जनसंख्या विवरण (NSO Census 2021)
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
              वडा नं. १ देखि {toNepaliDigits(wardsList.length)} सम्मको पुरुष, महिला तथा प्रतिशत वितरण
            </span>
          </div>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a', background: '#f1f5f9', padding: '4px 10px', borderRadius: '8px' }}>
            कुल: {toNepaliDigits(totalPop)} जना
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
          {wardsList.map((w: any) => (
            <div 
              key={w.ward} 
              style={{
                background: '#ffffff',
                border: '1.5px solid #e2e8f0',
                borderRadius: '12px',
                padding: '1rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>
                  वडा नं. {toNepaliDigits(w.ward)} ({w.name})
                </span>
                <span style={{ 
                  background: 'rgba(2, 132, 199, 0.1)', 
                  color: '#0284c7', 
                  fontSize: '0.75rem', 
                  fontWeight: 800, 
                  padding: '2px 8px', 
                  borderRadius: '6px' 
                }}>
                  {toNepaliDigits(w.pct)}%
                </span>
              </div>

              <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0f172a', margin: '4px 0' }}>
                {toNepaliDigits(w.total)} जना
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: '#64748b', marginTop: '6px' }}>
                <span>पुरुष: <strong>{toNepaliDigits(w.male)}</strong></span>
                <span>महिला: <strong>{toNepaliDigits(w.female)}</strong></span>
              </div>

              {/* Progress bar */}
              <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden', marginTop: '8px' }}>
                <div style={{ width: `${(w.total / maxWardTotal) * 100}%`, background: w.color, height: '100%' }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 3. AGE-SEX POPULATION PYRAMID ── */}
      <div className="palika-glass-card" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={20} className="text-blue-600" />
              उमेर-लिङ्ग जनसांख्यिक पिरामिड (Age-Sex Pyramid)
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
              बायाँ: पुरुष ({toNepaliDigits(malePop)} - {toNepaliDigits(malePct)}%) | दायाँ: महिला ({toNepaliDigits(femalePop)} - {toNepaliDigits(femalePct)}%)
            </span>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', fontSize: '0.82rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 700, color: '#0284c7' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#0284c7' }}></span> पुरुष
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 700, color: '#f43f5e' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#f43f5e' }}></span> महिला
            </span>
          </div>
        </div>

        {/* Pyramid Bars */}
        <div className="palika-pyramid-container">
          {agePyramidList.map((row, idx) => (
            <div key={idx} className="palika-pyramid-row">
              <div className="palika-pyramid-bar-left">
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                  {toNepaliDigits(row.male)} ({toNepaliDigits(row.mPct)}%)
                </span>
                <div
                  className="palika-pyramid-fill-male"
                  style={{ width: `${Math.min(100, row.mPct * 4.8)}%` }}
                ></div>
              </div>

              <div className="palika-pyramid-label">{row.age}</div>

              <div className="palika-pyramid-bar-right">
                <div
                  className="palika-pyramid-fill-female"
                  style={{ width: `${Math.min(100, row.fPct * 4.8)}%` }}
                ></div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                  {toNepaliDigits(row.female)} ({toNepaliDigits(row.fPct)}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 4. CASTE/ETHNICITY, RELIGION & LANGUAGE (3 COLUMNS) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        
        {/* Caste/Ethnicity Card */}
        <div className="palika-glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.65rem' }}>
            <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <PieChart size={18} className="text-blue-600" />
              जातजाति संरचना (Caste / Ethnicity)
            </h4>
            <span style={{ fontSize: '0.72rem', background: '#e0f2fe', color: '#0369a1', fontWeight: 700, padding: '2px 8px', borderRadius: '6px' }}>
              NSO 2021
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {ethnicityList.map((item: any, idx: number) => (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>
                  <span style={{ color: '#0f172a' }}>{item.caste}</span>
                  <span style={{ color: item.color }}>{toNepaliDigits(item.count)} ({toNepaliDigits(item.pct)}%)</span>
                </div>
                <div className="palika-meter-track">
                  <div className="palika-meter-fill" style={{ width: `${Math.min(100, item.pct)}%`, backgroundColor: item.color }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mother Tongue Card */}
        <div className="palika-glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.65rem' }}>
            <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <BookOpen size={18} className="text-emerald-600" />
              मातृभाषा (Mother Tongue)
            </h4>
            <span style={{ fontSize: '0.72rem', background: '#ecfdf5', color: '#065f46', fontWeight: 700, padding: '2px 8px', borderRadius: '6px' }}>
              {toNepaliDigits(languageList.length)} मुख्य भाषाहरू
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {languageList.map((item: any, idx: number) => (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>
                  <span style={{ color: '#0f172a' }}>{item.lang}</span>
                  <span style={{ color: item.color }}>{toNepaliDigits(item.count)} ({toNepaliDigits(item.pct)}%)</span>
                </div>
                <div className="palika-meter-track">
                  <div className="palika-meter-fill" style={{ width: `${Math.min(100, item.pct)}%`, backgroundColor: item.color }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Religion & Amenities Card */}
        <div className="palika-glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.65rem' }}>
            <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <HeartHandshake size={18} className="text-amber-600" />
              धर्म तथा घरधुरी सामाजिक सूचक
            </h4>
            <span style={{ fontSize: '0.72rem', background: '#fef3c7', color: '#92400e', fontWeight: 700, padding: '2px 8px', borderRadius: '6px' }}>
              आधिकारिक
            </span>
          </div>

          {/* Religion Breakdown */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '0.5rem' }}>धार्मिक संरचना:</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {religionList.map((r: any, idx: number) => (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, marginBottom: '2px' }}>
                    <span>{r.name}</span>
                    <span style={{ color: r.color }}>{toNepaliDigits(r.count)} ({toNepaliDigits(r.pct)}%)</span>
                  </div>
                  <div className="palika-meter-track">
                    <div className="palika-meter-fill" style={{ width: `${Math.min(100, r.pct)}%`, backgroundColor: r.color }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Key Amenities */}
          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '0.65rem' }}>घरधुरी तथा सामाजिक सूचक:</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.6rem' }}>
              <div style={{ padding: '0.55rem', borderRadius: '8px', background: '#ecfdf5', border: '1px solid #a7f3d0' }}>
                <div style={{ fontSize: '0.7rem', color: '#065f46', fontWeight: 700 }}>शौचालय पहुँच</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#047857' }}>{toNepaliDigits(toiletPct)}%</div>
              </div>
              <div style={{ padding: '0.55rem', borderRadius: '8px', background: '#f0f9ff', border: '1px solid #bae6fd' }}>
                <div style={{ fontSize: '0.7rem', color: '#0369a1', fontWeight: 700 }}>आफ्नै घर स्वामित्व</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0284c7' }}>{toNepaliDigits(ownedHousePct)}%</div>
              </div>
              <div style={{ padding: '0.55rem', borderRadius: '8px', background: '#fef3c7', border: '1px solid #fde68a' }}>
                <div style={{ fontSize: '0.7rem', color: '#92400e', fontWeight: 700 }}>जन्म दर्ता (५ वर्ष मुनि)</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#b45309' }}>{toNepaliDigits(birthRegPct)}%</div>
              </div>
              <div style={{ padding: '0.55rem', borderRadius: '8px', background: '#fdf4ff', border: '1px solid #f5d0fe' }}>
                <div style={{ fontSize: '0.7rem', color: '#86198f', fontWeight: 700 }}>अपाङ्गता दर</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#a21caf' }}>{toNepaliDigits(disabilityPct)}%</div>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
