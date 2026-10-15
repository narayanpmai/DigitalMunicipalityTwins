import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  demographicsApi,
  type DemographicCategory,
  type DemographicSummary,
} from '../../../api/demographics';
import {
  BarChart3,
  Search,
  RefreshCw,
  Users,
  BookOpen,
  Briefcase,
  Home,
  ShieldAlert,
  Percent,
  Layers,
  Database,
  Calendar,
} from 'lucide-react';

const CATEGORIES_META: Record<string, { label: string; icon: any }> = {
  all: { label: 'सबै सूचकहरू (All 94)', icon: Layers },
  population: { label: 'जनसंख्या (Population)', icon: Users },
  'age-structure': { label: 'उमेर संरचना (Age)', icon: BarChart3 },
  literacy: { label: 'शिक्षा र साक्षरता (Literacy)', icon: BookOpen },
  economic: { label: 'आर्थिक र श्रम (Economic)', icon: Briefcase },
  household: { label: 'आवास पूर्वाधार (Housing)', icon: Home },
  disability: { label: 'अपाङ्गता (Disability)', icon: ShieldAlert },
  'caste-ethnicity': { label: 'जातजाति (Caste)', icon: Users },
  religion: { label: 'धार्मिक संरचना (Religion)', icon: Layers },
  migration: { label: 'बसाइँसराइ (Migration)', icon: Layers },
  'vital-events': { label: 'पञ्जीकरण (Vital Events)', icon: Layers },
  'marital-status': { label: 'वैवाहिक स्थिति (Marital)', icon: Users },
};

export const SurveyIndicatorsTab: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Fetch Summary
  const { data: summary, refetch: refetchSummary } = useQuery<DemographicSummary>({
    queryKey: ['demographics-summary'],
    queryFn: () => demographicsApi.getSummary(),
  });

  // 2. Fetch All Indicators
  const {
    data: categoriesData,
    isLoading,
    refetch: refetchIndicators,
  } = useQuery<DemographicCategory[]>({
    queryKey: ['demographics-all-indicators'],
    queryFn: () => demographicsApi.getAllIndicators(),
  });

  const handleRefresh = () => {
    refetchSummary();
    refetchIndicators();
  };

  // Flatten indicators into rows
  const flatIndicatorList = useMemo(() => {
    if (!categoriesData) return [];
    const list: any[] = [];
    for (const cat of categoriesData) {
      if (cat.indicators && cat.indicators.length > 0) {
        for (const ind of cat.indicators) {
          if (ind.values && ind.values.length > 0) {
            for (const val of ind.values) {
              list.push({
                id: val.id,
                categoryCode: cat.code,
                categoryName: cat.name,
                categoryNameEn: cat.nameEn,
                indicatorCode: ind.code,
                indicatorName: ind.name,
                indicatorNameEn: ind.nameEn,
                unitType: ind.unitType,
                sourceYear: ind.sourceYear,
                segmentKey: val.segmentKey,
                segmentLabel: val.segmentLabel,
                wardNumber: val.wardNumber,
                valueNumber: val.valueNumber,
                valueText: val.valueText,
                sourceNote: val.sourceNote,
                capturedOn: val.capturedOn,
              });
            }
          } else {
            list.push({
              categoryCode: cat.code,
              categoryName: cat.name,
              categoryNameEn: cat.nameEn,
              indicatorCode: ind.code,
              indicatorName: ind.name,
              indicatorNameEn: ind.nameEn,
              unitType: ind.unitType,
              sourceYear: ind.sourceYear,
              segmentKey: 'total',
              segmentLabel: 'Total',
              valueNumber: null,
              valueText: 'N/A',
              sourceNote: 'NPHC 2021',
            });
          }
        }
      }
    }
    return list;
  }, [categoriesData]);

  // Filtered List
  const filteredList = useMemo(() => {
    return flatIndicatorList.filter((item) => {
      if (selectedCategory !== 'all' && item.categoryCode !== selectedCategory) {
        return false;
      }
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const mCode = (item.indicatorCode || '').toLowerCase().includes(q);
        const mName = (item.indicatorName || '').toLowerCase().includes(q);
        const mNameEn = (item.indicatorNameEn || '').toLowerCase().includes(q);
        const mSegment = (item.segmentLabel || '').toLowerCase().includes(q);
        const mCat = (item.categoryName || '').toLowerCase().includes(q);
        if (!mCode && !mName && !mNameEn && !mSegment && !mCat) return false;
      }
      return true;
    });
  }, [flatIndicatorList, selectedCategory, searchTerm]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 6 Top KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
        }}
      >
        <div
          style={{
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            borderLeft: '4px solid #3b82f6',
            borderRadius: '10px',
            padding: '1rem',
            color: '#ffffff',
          }}
        >
          <div style={{ color: '#94a3b8', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
            <Users size={16} color="#3b82f6" /> कुल जनसंख्या (२०७८)
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>
            {summary?.population?.total ? Number(summary.population.total).toLocaleString('ne-NP') : '२०,९९७'}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
            पुरुष: १०,६१४ | महिला: १०,३८३
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            borderLeft: '4px solid #06b6d4',
            borderRadius: '10px',
            padding: '1rem',
            color: '#ffffff',
          }}
        >
          <div style={{ color: '#94a3b8', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
            <Home size={16} color="#06b6d4" /> कुल घरधुरी
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#38bdf8' }}>
            {summary?.population?.households ? Number(summary.population.households).toLocaleString('ne-NP') : '५,२३४'}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
            औसत परिवार आकार: {summary?.population?.avgHouseholdSize || '४.०१'} जना
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            borderLeft: '4px solid #22c55e',
            borderRadius: '10px',
            padding: '1rem',
            color: '#ffffff',
          }}
        >
          <div style={{ color: '#94a3b8', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
            <BookOpen size={16} color="#22c55e" /> कुल साक्षरता दर
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#4ade80' }}>
            {summary?.literacy?.totalRate ? `${Number(summary.literacy.totalRate).toFixed(1)}%` : '७३.२%'}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
            पुरुष: ८१.४% | महिला: ६५.३%
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            borderLeft: '4px solid #f59e0b',
            borderRadius: '10px',
            padding: '1rem',
            color: '#ffffff',
          }}
        >
          <div style={{ color: '#94a3b8', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
            <Briefcase size={16} color="#f59e0b" /> आर्थिक सक्रिय
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fbbf24' }}>
            {summary?.economic?.active ? Number(summary.economic.active).toLocaleString('ne-NP') : '११,०४३'}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
            कृषिमा संलग्न: ७,८१२ (७०.७%)
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            borderLeft: '4px solid #ef4444',
            borderRadius: '10px',
            padding: '1rem',
            color: '#ffffff',
          }}
        >
          <div style={{ color: '#94a3b8', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
            <Home size={16} color="#ef4444" /> पक्की/अर्धपक्की घर
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>
            ४,२१८
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
            सुरक्षित आवास दर: ७६.८%
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            borderLeft: '4px solid #a855f7',
            borderRadius: '10px',
            padding: '1rem',
            color: '#ffffff',
          }}
        >
          <div style={{ color: '#94a3b8', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
            <ShieldAlert size={16} color="#a855f7" /> अपाङ्गता दर
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#c084fc' }}>
            {summary?.disability?.rate ? `${Number(summary.disability.rate).toFixed(2)}%` : '२.९१%'}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
            कुल ६१२ जना (क, ख, ग, घ वर्ग)
          </div>
        </div>
      </div>

      {/* 11 Category Selector Badges */}
      <div
        style={{
          backgroundColor: '#1e293b',
          border: '1px solid #334155',
          borderRadius: '10px',
          padding: '1rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Layers size={16} color="#38bdf8" />
            सर्वेक्षण विषयगत क्षेत्रहरू (११ मुख्य वर्ग / ९४ आधिकारिक सूचकहरू):
          </div>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', backgroundColor: '#0f172a', padding: '0.2rem 0.6rem', borderRadius: '12px' }}>
            {flatIndicatorList.length} सूचक उपलब्ध
          </span>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {Object.entries(CATEGORIES_META).map(([code, meta]) => {
            const isActive = selectedCategory === code;
            const Icon = meta.icon;
            return (
              <button
                key={code}
                onClick={() => setSelectedCategory(code)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.4rem 0.8rem',
                  borderRadius: '20px',
                  border: isActive ? '1px solid #38bdf8' : '1px solid #475569',
                  backgroundColor: isActive ? 'rgba(56, 189, 248, 0.2)' : '#0f172a',
                  color: isActive ? '#38bdf8' : '#94a3b8',
                  fontSize: '0.8rem',
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <Icon size={14} />
                {meta.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Table Section */}
      <div
        style={{
          backgroundColor: '#1e293b',
          border: '1px solid #334155',
          borderRadius: '10px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '1rem',
            borderBottom: '1px solid #334155',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ffffff', fontWeight: 700 }}>
            <Database size={18} color="#06b6d4" />
            <span>डिजिटल पाश्र्वचित्र तथा सर्वेक्षण सूचक तथ्याङ्क तालिका</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '10px' }} />
              <input
                type="text"
                placeholder="सूचक, खण्ड वा कोड खोज्नुहोस्..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  padding: '0.45rem 0.75rem 0.45rem 2rem',
                  backgroundColor: '#0f172a',
                  border: '1px solid #475569',
                  borderRadius: '6px',
                  color: '#ffffff',
                  fontSize: '0.85rem',
                  minWidth: '260px',
                }}
              />
            </div>
            <button
              onClick={handleRefresh}
              title="ताजा गर्नुहोस्"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                backgroundColor: 'rgba(255,255,255,0.08)',
                border: '1px solid #475569',
                color: '#ffffff',
                padding: '0.45rem 0.75rem',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.85rem',
              }}
            >
              <RefreshCw size={14} />
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div style={{ overflowX: 'auto' }}>
          <div className="dt-responsive-table-wrapper">
<table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', color: '#e2e8f0' }}>
            <thead>
              <tr style={{ backgroundColor: '#0f172a', borderBottom: '1px solid #334155', textAlign: 'left', color: '#94a3b8' }}>
                <th style={{ padding: '0.75rem 1rem', width: '50px' }}>क्र.सं.</th>
                <th style={{ padding: '0.75rem 1rem' }}>सूचक कोड / नाम (Indicator)</th>
                <th style={{ padding: '0.75rem 1rem' }}>विषयगत समूह (Category)</th>
                <th style={{ padding: '0.75rem 1rem' }}>उप-समूह / खण्ड (Segment)</th>
                <th style={{ padding: '0.75rem 1rem' }}>मान / तथ्याङ्क (Value)</th>
                <th style={{ padding: '0.75rem 1rem' }}>एकाइ (Unit)</th>
                <th style={{ padding: '0.75rem 1rem' }}>स्रोत तथा वर्ष</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                    डेटा लोड हुँदैछ, कृपया प्रतीक्षा गर्नुहोस्...
                  </td>
                </tr>
              ) : filteredList.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                    कुनै सूचक फेला परेन।
                  </td>
                </tr>
              ) : (
                filteredList.map((item, idx) => {
                  let valueDisplay: React.ReactNode = '—';
                  if (item.valueNumber !== null && item.valueNumber !== undefined) {
                    const num = Number(item.valueNumber);
                    if (item.unitType === 'percent') {
                      valueDisplay = (
                        <span style={{ backgroundColor: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 700 }}>
                          {num.toFixed(1)}%
                        </span>
                      );
                    } else if (item.unitType === 'ratio') {
                      valueDisplay = (
                        <span style={{ backgroundColor: 'rgba(14, 165, 233, 0.2)', color: '#38bdf8', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 700 }}>
                          {num.toFixed(2)}
                        </span>
                      );
                    } else {
                      valueDisplay = <strong style={{ color: '#fbbf24' }}>{num.toLocaleString('ne-NP')}</strong>;
                    }
                  } else if (item.valueText) {
                    valueDisplay = <span>{item.valueText}</span>;
                  }

                  return (
                    <tr
                      key={item.id || idx}
                      style={{
                        borderBottom: '1px solid #334155',
                        transition: 'background-color 0.15s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <td style={{ padding: '0.75rem 1rem', color: '#64748b' }}>{(idx + 1).toLocaleString('ne-NP')}</td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{ fontWeight: 700, color: '#ffffff' }}>{item.indicatorName || item.indicatorCode}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'monospace' }}>{item.indicatorCode}</div>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span style={{ backgroundColor: '#0f172a', border: '1px solid #334155', color: '#38bdf8', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem' }}>
                          {item.categoryName || item.categoryCode}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span style={{ backgroundColor: 'rgba(255,255,255,0.08)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem' }}>
                          {item.segmentLabel || item.segmentKey || 'Total'}
                        </span>
                        {item.wardNumber ? (
                          <span style={{ marginLeft: '0.4rem', backgroundColor: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '0.15rem 0.4rem', borderRadius: '4px', fontSize: '0.7rem' }}>
                            वडा {item.wardNumber}
                          </span>
                        ) : null}
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>{valueDisplay}</td>
                      <td style={{ padding: '0.75rem 1rem', color: '#94a3b8', fontSize: '0.75rem' }}>{item.unitType || 'count'}</td>
                      <td style={{ padding: '0.75rem 1rem', color: '#94a3b8', fontSize: '0.75rem' }}>
                        <div>{item.sourceNote || 'NPHC 2021 - CBS'}</div>
                        {item.sourceYear ? <div style={{ color: '#64748b' }}>{item.sourceYear} BS</div> : null}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
</div>
        </div>

        {/* Footer info */}
        <div style={{ padding: '0.75rem 1rem', backgroundColor: '#0f172a', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#94a3b8' }}>
          <span>देखाउँदै: {filteredList.length} सूचक (कुल: {flatIndicatorList.length})</span>
          <span>स्रोत: राष्ट्रिय जनगणना २०७८ / पाँचपोखरी थाङपाल डिजिटल प्रोफाइल</span>
        </div>
      </div>
    </div>
  );
};
