import React, { useState, useEffect, useCallback } from 'react';
import {
  FileBarChart2, Download, BookOpen, BarChart2,
  TrendingUp, Users, Building2, Droplets, Zap, Wifi, RefreshCw,
  CheckCircle2, Clock, AlertCircle, ArrowUpRight, Globe, Layers,
  ChevronRight, Award, Target, Landmark, PieChart,
} from 'lucide-react';
import { reportsApi, ProgressKpiData, GeneratedReportData } from '../../api/reports';
import { revenueApi, RevenueStats } from '../../api/revenue';

type ReportType = '1_year' | '5_year' | '10_year';

const FISCAL_YEARS = ['२०८१/०८२', '२०८०/०८१', '२०७९/०८०', '२०७८/०७९'];
const REPORT_TYPE_LABELS: Record<ReportType, string> = {
  '1_year': 'वार्षिक (१ वर्ष)',
  '5_year': 'पञ्चवर्षीय (५ वर्ष)',
  '10_year': 'दशवर्षीय (१० वर्ष)',
};

const KpiCard: React.FC<{
  icon: React.ReactNode; label: string; value: string | number; color: string; sub?: string;
}> = ({ icon, label, value, color, sub }) => (
  <div
    style={{
      background: '#ffffff', borderRadius: 14, padding: '1.25rem 1.5rem',
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)', borderTop: `4px solid ${color}`,
      display: 'flex', flexDirection: 'column', gap: 8, transition: 'transform .2s, box-shadow .2s',
    }}
    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 6px 20px rgba(0,0,0,0.12)'; }}
    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ''; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)'; }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color }}>
      {icon}
      <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>{label}</span>
    </div>
    <div style={{ fontSize: '1.7rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{value}</div>
    {sub && <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{sub}</div>}
  </div>
);

const ProgressBar: React.FC<{ label: string; value: number; color?: string }> = ({ label, value, color = '#0284c7' }) => (
  <div style={{ marginBottom: '0.85rem' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
      <span style={{ fontSize: '0.875rem', color: '#334155', fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: '0.875rem', color, fontWeight: 700 }}>{value}%</span>
    </div>
    <div style={{ height: 8, background: '#e2e8f0', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{
        height: '100%', width: `${Math.min(value, 100)}%`,
        background: `linear-gradient(90deg, ${color}, ${color}cc)`,
        borderRadius: 8, transition: 'width 1s ease-out',
      }} />
    </div>
  </div>
);

const SectionHeader: React.FC<{ icon: React.ReactNode; title: string; sub?: string }> = ({ icon, title, sub }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.25rem' }}>
    <div style={{
      width: 40, height: 40, borderRadius: 10,
      background: 'linear-gradient(135deg,#0284c7,#0ea5e9)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      {React.cloneElement(icon as React.ReactElement<any>, { size: 20, color: '#fff' })}
    </div>
    <div>
      <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>{title}</h3>
      {sub && <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>{sub}</p>}
    </div>
  </div>
);

const LoadingSpinner = () => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem', gap: 16 }}>
    <div style={{
      width: 48, height: 48, border: '4px solid #e2e8f0',
      borderTopColor: '#0284c7', borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
    }} />
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    <p style={{ color: '#64748b', margin: 0 }}>डाटा लोड हुँदैछ…</p>
  </div>
);

export const AnnualReport: React.FC = () => {
  const [reportType, setReportType] = useState<ReportType>('1_year');
  const [fiscalYear, setFiscalYear] = useState('२०८१/०८२');
  const [kpis, setKpis] = useState<ProgressKpiData | null>(null);
  const [report, setReport] = useState<GeneratedReportData | null>(null);
  const [revenue, setRevenue] = useState<RevenueStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'sectors' | 'finance' | 'progress'>('overview');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [kpiData, reportData, revenueData] = await Promise.allSettled([
        reportsApi.getDashboardKpis(),
        reportsApi.generateReport({ type: reportType, fiscalYear }),
        revenueApi.getRevenueStats(fiscalYear),
      ]);
      if (kpiData.status === 'fulfilled') setKpis(kpiData.value);
      if (reportData.status === 'fulfilled') setReport(reportData.value);
      if (revenueData.status === 'fulfilled') setRevenue(revenueData.value);
      if (kpiData.status === 'rejected' && reportData.status === 'rejected') {
        setError('API सेवा उपलब्ध छैन। स्थानीय डाटा प्रदर्शन गरिएको छ।');
      }
    } catch {
      setError('डाटा लोड गर्न सकिएन।');
    } finally {
      setLoading(false);
    }
  }, [reportType, fiscalYear]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const staticKpis = {
    totalPopulation: 12480, totalHouseholds: 2940, wardCount: 9,
    schoolCount: 28, healthFacilityCount: 14, roadLengthKm: 87,
    waterAccessPercent: 78, electrificationPercent: 91, internetAccessPercent: 64,
    budgetUtilizationPercent: 82, capitalExpenditurePercent: 61,
    recurrentExpenditurePercent: 39, completedProjectsCount: 46,
    ongoingProjectsCount: 12, revenueGrowthPercent: 18,
  } as ProgressKpiData;

  const displayKpis = kpis ?? staticKpis;

  const tabs = [
    { key: 'overview' as const, label: 'सारांश', icon: <BarChart2 size={16} /> },
    { key: 'sectors' as const, label: 'क्षेत्रगत', icon: <Layers size={16} /> },
    { key: 'finance' as const, label: 'वित्तीय', icon: <Landmark size={16} /> },
    { key: 'progress' as const, label: 'प्रगति', icon: <Target size={16} /> },
  ];

  const staticBeforeAfter = [
    { indicator: 'जनसंख्या', unit: 'जना', baseline2074: 9800, current2084: 12480, growthPercent: 27.3, status: 'improved' },
    { indicator: 'खानेपानी पहुँच', unit: '%', baseline2074: 52, current2084: 78, growthPercent: 50, status: 'improved' },
    { indicator: 'विद्युतीकरण', unit: '%', baseline2074: 61, current2084: 91, growthPercent: 49.2, status: 'improved' },
    { indicator: 'साक्षरता दर', unit: '%', baseline2074: 68, current2084: 84, growthPercent: 23.5, status: 'improved' },
  ];

  const staticSectors = [
    { title: 'पूर्वाधार', completedCount: 18, targetCount: 22, expenditure: '८.५ करोड', utilization: '86', achievementNote: 'सडक तथा पुल निर्माण' },
    { title: 'स्वास्थ्य', completedCount: 8, targetCount: 10, expenditure: '२.३ करोड', utilization: '80', achievementNote: 'स्वास्थ्य चौकी स्तरोन्नति' },
    { title: 'शिक्षा', completedCount: 7, targetCount: 9, expenditure: '३.१ करोड', utilization: '77', achievementNote: 'कक्षाकोठा निर्माण' },
    { title: 'खानेपानी', completedCount: 6, targetCount: 8, expenditure: '१.८ करोड', utilization: '75', achievementNote: 'ग्रामीण खानेपानी योजना' },
    { title: 'कृषि', completedCount: 4, targetCount: 6, expenditure: '१.२ करोड', utilization: '66', achievementNote: 'सिंचाइ तथा कृषि सामग्री' },
    { title: 'पर्यटन', completedCount: 3, targetCount: 4, expenditure: '०.९ करोड', utilization: '75', achievementNote: 'पदमार्ग सुधार' },
  ];

  return (
    <div style={{ padding: '2rem', fontFamily: "'Inter', sans-serif", maxWidth: 1200, margin: '0 auto' }}>

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg,#0c1a3a 0%,#0284c7 100%)',
        borderRadius: 20, padding: '2.5rem', marginBottom: '2rem',
        color: '#fff', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'absolute', bottom: -60, right: 60, width: 280, height: 280, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, position: 'relative' }}>
          <FileBarChart2 size={36} color="#38bdf8" />
          <div>
            <h1 style={{ margin: 0, fontSize: '1.9rem', fontWeight: 800 }}>वार्षिक प्रतिवेदन</h1>
            <p style={{ margin: 0, color: '#93c5fd', fontSize: '0.95rem' }}>
              {report?.metadata?.municipalityName ?? 'पाँचपोखरी थाङपाल गाउँपालिका'}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: '1.5rem', position: 'relative' }}>
          <select value={reportType} onChange={e => setReportType(e.target.value as ReportType)} style={{
            background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)',
            color: '#fff', padding: '0.5rem 1rem', borderRadius: 10, cursor: 'pointer', fontSize: '0.9rem',
          }}>
            {Object.entries(REPORT_TYPE_LABELS).map(([k, v]) => (
              <option key={k} value={k} style={{ color: '#0f172a' }}>{v}</option>
            ))}
          </select>
          <select value={fiscalYear} onChange={e => setFiscalYear(e.target.value)} style={{
            background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)',
            color: '#fff', padding: '0.5rem 1rem', borderRadius: 10, cursor: 'pointer', fontSize: '0.9rem',
          }}>
            {FISCAL_YEARS.map(y => <option key={y} value={y} style={{ color: '#0f172a' }}>आ.व. {y}</option>)}
          </select>
          <button onClick={fetchData} style={{
            background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.35)',
            color: '#fff', padding: '0.5rem 1rem', borderRadius: 10, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.9rem',
          }}>
            <RefreshCw size={15} /> पुनःलोड
          </button>
          <button onClick={() => window.print()} style={{
            background: 'linear-gradient(135deg,#16a34a,#22c55e)',
            border: 'none', color: '#fff', padding: '0.5rem 1.25rem',
            borderRadius: 10, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.9rem', marginLeft: 'auto',
          }}>
            <Download size={15} /> PDF डाउनलोड
          </button>
        </div>
      </div>

      {error && (
        <div style={{
          background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12,
          padding: '1rem 1.5rem', marginBottom: '1.5rem',
          display: 'flex', alignItems: 'center', gap: 10, color: '#dc2626',
        }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {loading ? <LoadingSpinner /> : (
        <>
          {/* KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '1rem', marginBottom: '2rem' }}>
            <KpiCard icon={<Users size={20} />} label="जनसंख्या" value={displayKpis.totalPopulation?.toLocaleString() ?? '—'} color="#0284c7" sub={`${displayKpis.totalHouseholds?.toLocaleString()} घरधुरी`} />
            <KpiCard icon={<Building2 size={20} />} label="वडा संख्या" value={displayKpis.wardCount ?? 9} color="#7c3aed" sub="प्रशासनिक एकाइ" />
            <KpiCard icon={<CheckCircle2 size={20} />} label="सम्पन्न आयोजना" value={displayKpis.completedProjectsCount ?? 46} color="#16a34a" sub={`${displayKpis.ongoingProjectsCount ?? 12} जारी`} />
            <KpiCard icon={<Droplets size={20} />} label="खानेपानी पहुँच" value={`${displayKpis.waterAccessPercent ?? 78}%`} color="#0ea5e9" sub="घरधुरीहरू" />
            <KpiCard icon={<Zap size={20} />} label="विद्युतीकरण" value={`${displayKpis.electrificationPercent ?? 91}%`} color="#d97706" sub="सौर्य/ग्रिड" />
            <KpiCard icon={<Wifi size={20} />} label="इन्टरनेट पहुँच" value={`${displayKpis.internetAccessPercent ?? 64}%`} color="#8b5cf6" sub="ब्रोडब्यान्ड/मोबाइल" />
            <KpiCard icon={<Globe size={20} />} label="बजेट उपयोग" value={`${displayKpis.budgetUtilizationPercent ?? 82}%`} color="#dc2626" sub="चालु आ.व." />
            <KpiCard icon={<TrendingUp size={20} />} label="राजस्व वृद्धि" value={`${displayKpis.revenueGrowthPercent ?? 18}%`} color="#0284c7" sub="अघिल्लो वर्ष भन्दा" />
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4, marginBottom: '1.5rem', background: '#f1f5f9', padding: 4, borderRadius: 14, width: 'fit-content' }}>
            {tabs.map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '0.55rem 1.1rem',
                borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600,
                background: activeTab === t.key ? '#0284c7' : 'transparent',
                color: activeTab === t.key ? '#fff' : '#64748b',
                transition: 'all .2s',
              }}>
                {t.icon}{t.label}
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div style={{ background: '#fff', borderRadius: 16, padding: '1.75rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', gridColumn: '1/-1' }}>
                <SectionHeader icon={<BookOpen />} title="प्रतिवेदन विवरण" sub={report?.metadata?.title ?? 'वार्षिक कार्य प्रतिवेदन'} />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '1rem' }}>
                  {[
                    { label: 'आर्थिक वर्ष', value: report?.metadata?.fiscalYear ?? fiscalYear },
                    { label: 'प्रतिवेदन प्रकार', value: REPORT_TYPE_LABELS[reportType] },
                    { label: 'पालिका', value: report?.metadata?.municipalityName ?? 'पाँचपोखरी थाङपाल' },
                    { label: 'जिल्ला', value: report?.metadata?.district ?? 'सिन्धुपाल्चोक' },
                    { label: 'प्रदेश', value: report?.metadata?.province ?? 'बागमती' },
                    { label: 'प्रकाशन मिति', value: report?.metadata?.publishedDateNepali ?? '—' },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ background: '#f8fafc', borderRadius: 10, padding: '0.75rem 1rem' }}>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: 4 }}>{label}</div>
                      <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.9rem' }}>{value}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: '#fff', borderRadius: 16, padding: '1.75rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <SectionHeader icon={<ArrowUpRight />} title="पहिले–पछि तुलना" sub="मुख्य सूचकहरू" />
                {(report?.beforeAfterData ?? staticBeforeAfter).slice(0, 5).map(item => (
                  <div key={item.indicator} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid #f1f5f9' }}>
                    <span style={{ fontSize: '0.875rem', color: '#334155', fontWeight: 500 }}>{item.indicator}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{item.baseline2074} {item.unit}</span>
                      <ChevronRight size={14} color="#cbd5e1" />
                      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>{item.current2084} {item.unit}</span>
                      <span style={{
                        fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                        background: item.growthPercent >= 0 ? '#dcfce7' : '#fee2e2',
                        color: item.growthPercent >= 0 ? '#16a34a' : '#dc2626',
                      }}>+{item.growthPercent?.toFixed(1)}%</span>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ background: '#fff', borderRadius: 16, padding: '1.75rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <SectionHeader icon={<Award />} title="आयोजना अवस्था" sub="चालु आर्थिक वर्ष" />
                {[
                  { label: 'सम्पन्न', count: displayKpis.completedProjectsCount ?? 46, color: '#16a34a', bg: '#dcfce7' },
                  { label: 'जारी', count: displayKpis.ongoingProjectsCount ?? 12, color: '#0284c7', bg: '#dbeafe' },
                  { label: 'सुरु नभएको', count: 4, color: '#d97706', bg: '#fef3c7' },
                ].map(s => (
                  <div key={s.label} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0.75rem 1rem', borderRadius: 10, background: s.bg, marginBottom: '0.5rem',
                  }}>
                    <span style={{ fontWeight: 600, color: s.color }}>{s.label}</span>
                    <span style={{ fontSize: '1.4rem', fontWeight: 800, color: s.color }}>{s.count}</span>
                  </div>
                ))}
                <div style={{ marginTop: '1rem' }}>
                  <ProgressBar label="बजेट उपयोग" value={displayKpis.budgetUtilizationPercent ?? 82} color="#0284c7" />
                </div>
              </div>
            </div>
          )}

          {/* Sectors Tab */}
          {activeTab === 'sectors' && (
            <div style={{ background: '#fff', borderRadius: 16, padding: '1.75rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <SectionHeader icon={<PieChart />} title="क्षेत्रगत प्रगति सारांश" sub="आर्थिक वर्षको विषयगत उपलब्धि" />
              {(report?.sectorSummaries ?? staticSectors).map((sec, i) => (
                <div key={i} style={{
                  background: '#f8fafc', borderRadius: 12, padding: '1.25rem',
                  marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap',
                }}>
                  <div style={{ minWidth: 120 }}>
                    <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 2 }}>{sec.title}</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{sec.achievementNote}</div>
                  </div>
                  <div style={{ flex: 1, minWidth: 160 }}>
                    <ProgressBar
                      label={`${sec.completedCount}/${sec.targetCount} सम्पन्न`}
                      value={Math.round((sec.completedCount / (sec.targetCount || 1)) * 100)}
                      color={i % 3 === 0 ? '#0284c7' : i % 3 === 1 ? '#16a34a' : '#7c3aed'}
                    />
                  </div>
                  <div style={{ textAlign: 'right', minWidth: 80 }}>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>रु. {sec.expenditure}</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{sec.utilization}% उपयोग</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Finance Tab */}
          {activeTab === 'finance' && (
            <div style={{ background: '#fff', borderRadius: 16, padding: '1.75rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <SectionHeader icon={<Landmark />} title="आम्दानी–खर्च विवरण" sub={revenue ? `आ.व. ${fiscalYear}` : 'अनुमानित तथ्यांक'} />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                {[
                  { label: 'कुल राजस्व', value: revenue ? `रु. ${(revenue.totalRevenue / 10000000).toFixed(2)} करोड` : 'रु. ४.५ करोड', color: '#16a34a' },
                  { label: 'रसिद संख्या', value: revenue?.totalReceipts?.toLocaleString() ?? '1,240', color: '#0284c7' },
                  { label: 'पूँजीगत खर्च', value: `${displayKpis.capitalExpenditurePercent ?? 61}%`, color: '#7c3aed' },
                  { label: 'चालु खर्च', value: `${displayKpis.recurrentExpenditurePercent ?? 39}%`, color: '#d97706' },
                ].map(({ label, value, color }) => (
                  <div key={label} style={{ background: '#f8fafc', borderRadius: 12, padding: '1rem 1.25rem', borderLeft: `4px solid ${color}` }}>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: 6 }}>{label}</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color }}>{value}</div>
                  </div>
                ))}
              </div>
              <ProgressBar label="पूँजीगत खर्च" value={displayKpis.capitalExpenditurePercent ?? 61} color="#7c3aed" />
              <ProgressBar label="चालु खर्च" value={displayKpis.recurrentExpenditurePercent ?? 39} color="#d97706" />
              <ProgressBar label="बजेट उपयोग (समग्र)" value={displayKpis.budgetUtilizationPercent ?? 82} color="#0284c7" />
              {revenue?.byType && revenue.byType.length > 0 && (
                <div style={{ marginTop: '1.5rem' }}>
                  <h4 style={{ color: '#0f172a', marginBottom: '1rem', fontSize: '0.95rem' }}>राजस्व स्रोत अनुसार</h4>
                  {revenue.byType.slice(0, 6).map((t, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f1f5f9' }}>
                      <span style={{ color: '#334155', fontSize: '0.875rem' }}>{t.type}</span>
                      <span style={{ fontWeight: 700, color: '#0284c7', fontSize: '0.875rem' }}>
                        रु. {typeof t.amount === 'number' ? t.amount.toLocaleString() : t.amount} ({t.count} रसिद)
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Progress Tab */}
          {activeTab === 'progress' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div style={{ background: '#fff', borderRadius: 16, padding: '1.75rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <SectionHeader icon={<Target />} title="पूर्वाधार सूचक" sub="सेवा पहुँच प्रतिशत" />
                <ProgressBar label="खानेपानी पहुँच" value={displayKpis.waterAccessPercent ?? 78} color="#0ea5e9" />
                <ProgressBar label="विद्युत पहुँच" value={displayKpis.electrificationPercent ?? 91} color="#d97706" />
                <ProgressBar label="इन्टरनेट पहुँच" value={displayKpis.internetAccessPercent ?? 64} color="#8b5cf6" />
                <ProgressBar label="बजेट उपयोग" value={displayKpis.budgetUtilizationPercent ?? 82} color="#0284c7" />
              </div>
              <div style={{ background: '#fff', borderRadius: 16, padding: '1.75rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <SectionHeader icon={<Award />} title="शिक्षा तथा स्वास्थ्य" sub="सामाजिक सूचकहरू" />
                {[
                  { label: 'विद्यालय संख्या', value: displayKpis.schoolCount ?? 28, max: 35, unit: 'वटा' },
                  { label: 'स्वास्थ्य संस्था', value: displayKpis.healthFacilityCount ?? 14, max: 20, unit: 'वटा' },
                  { label: 'सडक लम्बाइ', value: displayKpis.roadLengthKm ?? 87, max: 120, unit: 'कि.मि.' },
                ].map(s => (
                  <div key={s.label} style={{ marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: '0.875rem', color: '#334155', fontWeight: 500 }}>{s.label}</span>
                      <span style={{ fontWeight: 700, color: '#0f172a' }}>{s.value} {s.unit}</span>
                    </div>
                    <div style={{ height: 10, background: '#e2e8f0', borderRadius: 8, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', width: `${Math.min((s.value / s.max) * 100, 100)}%`,
                        background: 'linear-gradient(90deg,#0284c7,#38bdf8)', borderRadius: 8,
                        transition: 'width 1s ease-out',
                      }} />
                    </div>
                  </div>
                ))}
              </div>
              {displayKpis.wardRankings && displayKpis.wardRankings.length > 0 && (
                <div style={{ background: '#fff', borderRadius: 16, padding: '1.75rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', gridColumn: '1/-1' }}>
                  <SectionHeader icon={<BarChart2 />} title="वडा क्रमाङ्क" sub="कार्यसम्पादन मूल्यांकन" />
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                      <thead>
                        <tr style={{ background: '#f8fafc' }}>
                          {['क्रम', 'वडा', 'वडानं.', 'स्कोर', 'सम्पन्न', 'बजेट उपयोग'].map(h => (
                            <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 700, color: '#64748b', whiteSpace: 'nowrap', borderBottom: '2px solid #e2e8f0' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {displayKpis.wardRankings.map((w, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}
                            onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = '#f8fafc'}
                            onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = ''}
                          >
                            <td style={{ padding: '0.75rem 1rem' }}>
                              <span style={{
                                width: 28, height: 28, borderRadius: '50%',
                                background: i < 3 ? ['#d97706', '#94a3b8', '#c2965c'][i] : '#e2e8f0',
                                color: i < 3 ? '#fff' : '#64748b',
                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                fontWeight: 700, fontSize: '0.8rem',
                              }}>{w.rank}</span>
                            </td>
                            <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#0f172a' }}>{w.wardName}</td>
                            <td style={{ padding: '0.75rem 1rem', color: '#64748b' }}>{w.wardNumber}</td>
                            <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#0284c7' }}>{w.score}</td>
                            <td style={{ padding: '0.75rem 1rem', color: '#16a34a', fontWeight: 600 }}>{w.completedProjects}</td>
                            <td style={{ padding: '0.75rem 1rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ flex: 1, height: 6, background: '#e2e8f0', borderRadius: 4 }}>
                                  <div style={{ height: '100%', width: `${w.budgetUtil}%`, background: '#0284c7', borderRadius: 4 }} />
                                </div>
                                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{w.budgetUtil}%</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Archive */}
          <div style={{ marginTop: '2rem', background: '#fff', borderRadius: 16, padding: '1.75rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <SectionHeader icon={<FileBarChart2 />} title="प्रतिवेदन संग्रह" sub="पुराना वार्षिक प्रतिवेदनहरू" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '1rem' }}>
              {[
                { year: '२०८०/०८१', size: '४.२ MB' },
                { year: '२०७९/०८०', size: '३.८ MB' },
                { year: '२०७८/०७९', size: '३.५ MB' },
                { year: '२०७७/०७८', size: '२.९ MB' },
              ].map(r => (
                <div key={r.year} style={{
                  background: '#f8fafc', borderRadius: 12, padding: '1rem 1.25rem',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  border: '1px solid #e2e8f0', transition: 'border-color .2s',
                }}
                  onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = '#0284c7'}
                  onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = '#e2e8f0'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <BookOpen size={18} color="#0284c7" />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>आ.व. {r.year}</div>
                      <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>PDF • {r.size}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: '0.75rem', background: '#dcfce7', color: '#16a34a', padding: '2px 10px', borderRadius: 20, fontWeight: 600 }}>
                      <Clock size={11} style={{ verticalAlign: 'middle', marginRight: 3 }} />उपलब्ध
                    </span>
                    <button style={{
                      background: '#0284c7', color: '#fff', border: 'none',
                      padding: '0.4rem 0.9rem', borderRadius: 8, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.8rem', fontWeight: 600,
                    }}>
                      <Download size={13} /> डाउनलोड
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

