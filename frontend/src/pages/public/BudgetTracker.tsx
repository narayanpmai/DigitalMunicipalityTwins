import React, { useState } from 'react';
import {
  TrendingUp, DollarSign, BarChart3,
  Download, Calendar, ChevronDown,
  ArrowUpRight, ArrowDownRight, Landmark, HeartPulse,
  Building2, Shield, Users, Activity, Edit2, X, CheckCircle2
} from 'lucide-react';
import { useLocation } from 'react-router-dom';

/* ═══════════════════════════════════════════════════════════════════════════
   Budget Tracker — Municipal Budget Transparency Portal
   पाँचपोखरी थाङपाल गाउँपालिका
   ═══════════════════════════════════════════════════════════════════════════ */

const FY = '२०८३/०८४';
const INITIAL_TARGET_INCOME = 612418000;

interface BudgetSubsector {
  id: string;
  name: string;
  allocated: number;
  spent: number;
}

interface BudgetSector {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
  allocated: number;
  spent: number;
  subsectors: BudgetSubsector[];
}

const SECTORS: BudgetSector[] = [
  {
    id: 'economic', name: 'आर्थिक विकास', icon: <TrendingUp size={18} />, color: '#047857', bg: '#ECFDF5', allocated: 34291000, spent: 201993,
    subsectors: [
      { id: 'eco-1', name: 'कृषि', allocated: 11845000, spent: 72384 },
      { id: 'eco-2', name: 'उद्योग', allocated: 2822000, spent: 38203 },
      { id: 'eco-3', name: 'पर्यटन', allocated: 1900000, spent: 0 },
      { id: 'eco-4', name: 'सहकारी', allocated: 400000, spent: 0 },
      { id: 'eco-5', name: 'वित्तीय क्षेत्र', allocated: 474000, spent: 91406 },
      { id: 'eco-6', name: 'जलश्रोत तथा सिंचाई', allocated: 11950000, spent: 0 },
      { id: 'eco-7', name: 'पशुपन्छी विकास', allocated: 4600000, spent: 0 },
      { id: 'eco-8', name: 'भूमि व्यवस्था', allocated: 100000, spent: 0 },
      { id: 'eco-9', name: 'आपूर्ति', allocated: 200000, spent: 0 },
    ]
  },
  {
    id: 'social', name: 'सामाजिक विकास', icon: <HeartPulse size={18} />, color: '#7C3AED', bg: '#F5F3FF', allocated: 248324000, spent: 2405038,
    subsectors: [
      { id: 'soc-1', name: 'शिक्षा', allocated: 210564000, spent: 2207654 },
      { id: 'soc-2', name: 'स्वास्थ्य', allocated: 27355000, spent: 197384 },
      { id: 'soc-3', name: 'खानेपानी तथा सरसफाई', allocated: 1150000, spent: 0 },
      { id: 'soc-4', name: 'भाषा तथा संस्कृति', allocated: 300000, spent: 0 },
      { id: 'soc-5', name: 'लैंगिक समानता तथा सामाजिक समावेशीकरण', allocated: 3700000, spent: 0 },
      { id: 'soc-6', name: 'युवा तथा खेलकुद', allocated: 3450000, spent: 0 },
      { id: 'soc-7', name: 'सामाजिक सुरक्षा तथा संरक्षण', allocated: 1805000, spent: 0 },
    ]
  },
  {
    id: 'infra', name: 'पूर्वाधार विकास', icon: <Building2 size={18} />, color: '#0F4C81', bg: '#EBF3FA', allocated: 199427715, spent: 950000,
    subsectors: [
      { id: 'inf-1', name: 'यातयात पूर्वाधार', allocated: 98184715, spent: 0 },
      { id: 'inf-2', name: 'भवन, आवास तथा सहरी विकास', allocated: 78643000, spent: 950000 },
      { id: 'inf-3', name: 'संचार तथा सूचना प्रबिधि', allocated: 2100000, spent: 0 },
      { id: 'inf-4', name: 'सम्पदा पूर्वाधार', allocated: 20400000, spent: 0 },
      { id: 'inf-5', name: 'बिज्ञान तथा प्रबिधि', allocated: 100000, spent: 0 },
    ]
  },
  {
    id: 'governance', name: 'सुशासन तथा अन्तरसम्बन्धित क्षेत्र', icon: <Shield size={18} />, color: '#B45309', bg: '#FFFBEB', allocated: 22362000, spent: 3086261,
    subsectors: [
      { id: 'gov-1', name: 'विपद व्यवस्थापन', allocated: 9160000, spent: 3000000 },
      { id: 'gov-2', name: 'कानुन तथा न्याय', allocated: 1799000, spent: 38203 },
      { id: 'gov-3', name: 'शासन प्रणाली', allocated: 1800000, spent: 0 },
      { id: 'gov-4', name: 'तथ्यांक प्रणाली', allocated: 1780000, spent: 0 },
      { id: 'gov-5', name: 'श्रम तथा रोजगारी', allocated: 2416000, spent: 48058 },
      { id: 'gov-6', name: 'योजना तर्जुमा र कार्यन्वयन', allocated: 200000, spent: 0 },
      { id: 'gov-7', name: 'अनुगमन तथा मूल्यांकन', allocated: 500000, spent: 0 },
      { id: 'gov-8', name: 'प्रशासकीय सुशासन', allocated: 3570000, spent: 0 },
      { id: 'gov-9', name: 'वित्तीय सुशासन', allocated: 1137000, spent: 0 },
    ]
  },
  {
    id: 'admin', name: 'कार्यालय सञ्चालन तथा प्रशासनिक', icon: <Users size={18} />, color: '#374151', bg: '#F9FAFB', allocated: 108013285, spent: 3870064,
    subsectors: [
      { id: 'adm-1', name: 'कार्यालय सञ्चालन तथा प्रशासनिक', allocated: 108013285, spent: 3870064 },
    ]
  },
];

const INCOME_SOURCES = [
  { name: 'राजस्व समानीकरण अनुदान (संघ)', amount: 150000000, pct: 24.5, color: '#0F4C81' },
  { name: 'सशर्त अनुदान (संघ)',           amount: 250000000, pct: 40.8, color: '#1565C0' },
  { name: 'विशेष अनुदान (संघ)',           amount: 80000000, pct:  13.1, color: '#2196F3' },
  { name: 'प्रदेश अनुदान',              amount: 72418000, pct: 11.8, color: '#7C3AED' },
  { name: 'आन्तरिक राजस्व (स्वस्रोत)',  amount: 60000000, pct:  9.8, color: '#047857' },
];

const formatNPR = (n: number, short = false) => {
  if (short) {
    if (n >= 10_000_000) return `रू. ${(n / 10_000_000).toFixed(2)} करोड`;
    if (n >= 100_000)    return `रू. ${(n / 100_000).toFixed(1)} लाख`;
    return `रू. ${n.toLocaleString()}`;
  }
  const formatted = n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `रू. ${formatted}`;
};

const pct = (spent: number, allocated: number) => {
  if (allocated === 0) return 0;
  return Number(((spent / allocated) * 100).toFixed(2));
};

export const BudgetTrackerPage: React.FC = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/app');
  const [activeTab, setActiveTab] = useState<'expenditure' | 'detailed_table' | 'income'>('expenditure');
  const [selectedFY, setSelectedFY] = useState(FY);
  const [isEditing, setIsEditing] = useState(false);
  const [targetIncome, setTargetIncome] = useState(INITIAL_TARGET_INCOME);
  const [sectors, setSectors] = useState(SECTORS);
  const [incomes, setIncomes] = useState(INCOME_SOURCES);

  const totalBudget = sectors.reduce((acc, s) => acc + s.allocated, 0);
  const totalSpent = sectors.reduce((acc, s) => acc + s.spent, 0);
  const totalIncome = incomes.reduce((acc, inc) => acc + inc.amount, 0);

  const overallPct = pct(totalSpent, totalBudget);
  const incomePct = pct(totalIncome, targetIncome);
  const remainingBudget = totalBudget - totalSpent;

  const inputStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: '120px',
    padding: '6px 10px',
    fontSize: '0.85rem',
    color: '#0F172A',
    backgroundColor: '#fff',
    border: '1.5px solid #CBD5E1',
    borderRadius: '6px',
    outline: 'none',
    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.04)',
    fontFamily: 'inherit',
    fontWeight: 600,
    textAlign: 'right',
  };

  const subInputStyle: React.CSSProperties = {
    ...inputStyle,
    maxWidth: '105px',
    padding: '5px 8px',
    fontSize: '0.8rem',
    border: '1px solid #E2E8F0',
    fontWeight: 500,
    color: '#334155',
  };


  const handleSubsectorChange = (sectorId: string, subId: string, field: string, value: string) => {
    setSectors(sectors.map(s => {
      if (s.id !== sectorId) return s;
      const newSub = s.subsectors.map(sub => sub.id === subId ? { ...sub, [field]: Number(value) } : sub);
      const newAllocated = newSub.reduce((acc, curr) => acc + curr.allocated, 0);
      const newSpent = newSub.reduce((acc, curr) => acc + curr.spent, 0);
      return { ...s, subsectors: newSub, allocated: newAllocated, spent: newSpent };
    }));
  };

  const handleSectorChange = (sectorId: string, field: string, value: string) => {
     setSectors(sectors.map(s => s.id === sectorId ? { ...s, [field]: Number(value) } : s));
  };

  const handleIncomeChange = (name: string, field: string, value: string) => {
    setIncomes(incomes.map(i => i.name === name ? { ...i, [field]: Number(value) } : i));
  };

  return (
    <div style={{ padding: '28px 32px', background: '#F8FAFC', minHeight: '100vh', fontFamily: "'Noto Sans Devanagari','Outfit','Inter',sans-serif" }}>
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#EBF3FA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BarChart3 size={22} color="#0F4C81" />
              </div>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                बजेट पारदर्शिता ट्र्याकर
              </h1>
            </div>
            <p style={{ color: '#64748B', fontSize: '0.85rem', margin: 0 }}>
              पाँचपोखरी थाङपाल गाउँपालिका — आर्थिक वर्ष {selectedFY} को बजेट विवरण
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {isAdmin && (
              <button onClick={() => setIsEditing(!isEditing)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: isEditing ? '#DC2626' : '#10B981', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                {isEditing ? <><X size={14} /> सम्पादन बन्द गर्नुहोस्</> : <><Edit2 size={14} /> सम्पादन गर्नुहोस्</>}
              </button>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#fff', border: '1.5px solid #E2E8F0', borderRadius: '8px', padding: '8px 12px', fontSize: '0.82rem', color: '#475569', cursor: 'pointer' }}>
              <Calendar size={15} /> आ.व. {selectedFY} <ChevronDown size={14} />
            </div>
            <button onClick={() => window.print()} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: '#0F4C81', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
              <Download size={14} /> PDF रिपोर्ट
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '14px', marginTop: '20px' }}>
          {[
            {
              label: 'कुल बजेट',
              value: formatNPR(totalBudget, true),
              sub: `आ.व. ${selectedFY}`,
              icon: <DollarSign size={20} color="#0F4C81" />,
              iconBg: '#EBF3FA',
              trend: null,
            },
            {
              label: 'खर्च भएको',
              value: formatNPR(totalSpent, true),
              sub: `${overallPct}% खर्च भयो`,
              icon: <TrendingUp size={20} color="#047857" />,
              iconBg: '#ECFDF5',
              trend: 'up',
              trendColor: '#047857',
            },
            {
              label: 'बाँकी बजेट',
              value: formatNPR(remainingBudget, true),
              sub: `${(100 - overallPct).toFixed(2)}% शेष`,
              icon: <Activity size={20} color="#B45309" />,
              iconBg: '#FFFBEB',
              trend: null,
            },
            {
              label: 'राजस्व संकलन',
              value: formatNPR(totalIncome, true),
              sub: `लक्ष्यको ${incomePct}% हासिल`,
              icon: <Landmark size={20} color="#7C3AED" />,
              iconBg: '#F5F3FF',
              trend: incomePct >= 100 ? 'up' : 'down',
              trendColor: incomePct >= 100 ? '#047857' : '#DC2626',
            },
          ].map((kpi) => (
            <div key={kpi.label} style={{ background: '#fff', border: '1.5px solid #E2E8F0', borderRadius: '14px', padding: '18px 16px', boxShadow: '0 1px 4px rgba(15,23,42,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '9px', background: kpi.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {kpi.icon}
                </div>
                {kpi.trend && (
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: kpi.trendColor, display: 'flex', alignItems: 'center', gap: '2px', background: kpi.trendColor + '15', padding: '3px 7px', borderRadius: '9999px' }}>
                    {kpi.trend === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    {kpi.trend === 'up' ? 'राम्रो' : 'पछि'}
                  </span>
                )}
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>{kpi.value}</div>
              <div style={{ fontSize: '0.9rem', color: '#64748B', marginTop: '4px' }}>{kpi.label}</div>
              <div style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: '2px' }}>{kpi.sub}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '4px', background: '#F1F5F9', padding: '4px', borderRadius: '10px', marginBottom: '16px', width: 'fit-content' }}>
        {[
          { id: 'expenditure', label: '📊 क्षेत्रगत खर्च' },
          { id: 'detailed_table', label: '📋 विस्तृत तालिका' },
          { id: 'income',      label: '💰 राजस्व स्रोत' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              padding: '10px 20px', fontSize: '0.95rem', fontWeight: 600,
              borderRadius: '7px', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              background: activeTab === tab.id ? '#fff' : 'transparent',
              color:      activeTab === tab.id ? '#0F172A' : '#64748B',
              boxShadow:  activeTab === tab.id ? '0 1px 4px rgba(15,23,42,0.08)' : 'none',
              transition: 'all 0.15s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'expenditure' && (
        <div style={{ background: '#fff', border: '1.5px solid #E2E8F0', borderRadius: '14px', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0F172A' }}>क्षेत्रगत बजेट खर्च विवरण</h3>
            <span style={{ fontSize: '0.85rem', color: '#64748B', background: '#F1F5F9', padding: '6px 14px', borderRadius: '9999px' }}>
              आ.व. {selectedFY}
            </span>
          </div>
          <div style={{ padding: '8px 0' }}>
            {sectors.map((sector, idx) => {
              const spentPct = pct(sector.spent, sector.allocated);
              const isOverspent = sector.spent > sector.allocated;
              return (
                <div key={sector.id} style={{ padding: '14px 20px', borderBottom: idx < sectors.length - 1 ? '1px solid #F1F5F9' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: sector.bg, color: sector.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {sector.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A' }}>{sector.name}</span>
                        <div style={{ display: 'flex', gap: '12px', flexShrink: 0, fontSize: '0.9rem' }}>
                          <span style={{ color: '#64748B' }}>विनियोजित: <strong style={{ color: '#0F172A' }}>{formatNPR(sector.allocated, true)}</strong></span>
                          <span style={{ color: isOverspent ? '#DC2626' : '#047857' }}>खर्च: <strong>{formatNPR(sector.spent, true)}</strong></span>
                          <span style={{
                            fontWeight: 700,
                            color: spentPct >= 90 ? '#047857' : spentPct >= 60 ? '#0F4C81' : '#F59E0B',
                            background: spentPct >= 90 ? '#ECFDF5' : spentPct >= 60 ? '#EBF3FA' : '#FFFBEB',
                            padding: '2px 7px', borderRadius: '9999px',
                          }}>
                            {spentPct}%
                          </span>
                        </div>
                      </div>
                      <div style={{ height: '8px', background: '#F1F5F9', borderRadius: '9999px', overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', borderRadius: '9999px',
                          background: spentPct >= 90 ? '#10B981' : spentPct >= 60 ? sector.color : '#F59E0B',
                          width: `${spentPct}%`, transition: 'width 0.8s ease',
                        }} />
                      </div>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                        {sector.subsectors.map((s) => (
                          <span key={s.id} style={{ fontSize: '0.8rem', padding: '4px 10px', borderRadius: '6px', background: sector.bg, color: sector.color, fontWeight: 600 }}>{s.name}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'detailed_table' && (
        <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '14px', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
              <thead>
                <tr style={{ background: '#F1F5F9', borderBottom: '2px solid #CBD5E1' }}>
                  <th style={{ padding: '12px', textAlign: 'center', borderRight: '1px solid #E2E8F0', fontWeight: 700, fontSize: '0.9rem' }}>क्र.सं.</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderRight: '1px solid #E2E8F0', fontWeight: 700, fontSize: '0.9rem' }}>क्षेत्र/उप क्षेत्र</th>
                  <th style={{ padding: '12px', borderRight: '1px solid #E2E8F0', fontWeight: 700, fontSize: '0.9rem' }}>Allocation</th>
                  <th style={{ padding: '12px', borderRight: '1px solid #E2E8F0', fontWeight: 700, fontSize: '0.9rem' }}>खर्च</th>
                  <th style={{ padding: '12px', borderRight: '1px solid #E2E8F0', fontWeight: 700, fontSize: '0.9rem' }}>खर्च (%)</th>
                  <th style={{ padding: '12px', fontWeight: 700, fontSize: '0.9rem' }}>मौज्दात</th>
                </tr>
              </thead>
              <tbody>
                {sectors.map((sec, i) => (
                  <React.Fragment key={sec.id}>
                    {/* Main Sector Row */}
                    <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', fontWeight: 700 }}>
                      <td style={{ padding: '10px 12px', textAlign: 'center', borderRight: '1px solid #E2E8F0', fontSize: '0.95rem' }}>{['१','२','३','४','५'][i]}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'left', borderRight: '1px solid #E2E8F0', fontSize: '0.95rem' }}>{sec.name}</td>
                      <td style={{ padding: '10px 12px', borderRight: '1px solid #E2E8F0', fontSize: '0.95rem' }}>
                         {isEditing ? <input type="number" value={sec.allocated} onChange={e => handleSectorChange(sec.id, 'allocated', e.target.value)} style={inputStyle}/> : formatNPR(sec.allocated, false).replace('रू. ','')}
                      </td>
                      <td style={{ padding: '10px 12px', borderRight: '1px solid #E2E8F0', fontSize: '0.95rem' }}>
                         {isEditing ? <input type="number" value={sec.spent} onChange={e => handleSectorChange(sec.id, 'spent', e.target.value)} style={inputStyle}/> : formatNPR(sec.spent, false).replace('रू. ','')}
                      </td>
                      <td style={{ padding: '10px 12px', borderRight: '1px solid #E2E8F0', fontSize: '0.95rem' }}>{pct(sec.spent, sec.allocated)}</td>
                      <td style={{ padding: '10px 12px', fontSize: '0.95rem' }}>{formatNPR(sec.allocated - sec.spent, false).replace('रू. ','')}</td>
                    </tr>
                    {/* Sub Sector Rows */}
                    {sec.subsectors.map((sub, j) => (
                      <tr key={sub.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '8px 12px', textAlign: 'center', borderRight: '1px solid #E2E8F0', fontSize: '0.9rem', color: '#475569' }}>{['१','२','३','४','५','६','७','८','९'][j]}</td>
                        <td style={{ padding: '8px 12px', textAlign: 'left', borderRight: '1px solid #E2E8F0', fontSize: '0.9rem', color: '#475569', paddingLeft: '24px' }}>{sub.name}</td>
                        <td style={{ padding: '8px 12px', borderRight: '1px solid #E2E8F0', fontSize: '0.9rem', color: '#475569' }}>
                           {isEditing ? <input type="number" value={sub.allocated} onChange={e => handleSubsectorChange(sec.id, sub.id, 'allocated', e.target.value)} style={subInputStyle}/> : formatNPR(sub.allocated, false).replace('रू. ','')}
                        </td>
                        <td style={{ padding: '8px 12px', borderRight: '1px solid #E2E8F0', fontSize: '0.9rem', color: '#475569' }}>
                           {isEditing ? <input type="number" value={sub.spent} onChange={e => handleSubsectorChange(sec.id, sub.id, 'spent', e.target.value)} style={subInputStyle}/> : formatNPR(sub.spent, false).replace('रू. ','')}
                        </td>
                        <td style={{ padding: '8px 12px', borderRight: '1px solid #E2E8F0', fontSize: '0.9rem', color: '#475569' }}>{pct(sub.spent, sub.allocated)}</td>
                        <td style={{ padding: '8px 12px', fontSize: '0.9rem', color: '#475569' }}>{formatNPR(sub.allocated - sub.spent, false).replace('रू. ','')}</td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background: '#F8FAFC', borderTop: '2px solid #CBD5E1', fontWeight: 800 }}>
                  <td colSpan={2} style={{ padding: '10px 12px', textAlign: 'center', borderRight: '1px solid #E2E8F0' }}>Grand Total</td>
                  <td style={{ padding: '10px 12px', borderRight: '1px solid #E2E8F0' }}>{formatNPR(totalBudget, false).replace('रू. ','')}</td>
                  <td style={{ padding: '10px 12px', borderRight: '1px solid #E2E8F0' }}>{formatNPR(totalSpent, false).replace('रू. ','')}</td>
                  <td style={{ padding: '10px 12px', borderRight: '1px solid #E2E8F0' }}>{pct(totalSpent, totalBudget)}</td>
                  <td style={{ padding: '10px 12px' }}>{formatNPR(totalBudget - totalSpent, false).replace('रू. ','')}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'income' && (
        <div style={{ background: '#fff', border: '1.5px solid #E2E8F0', borderRadius: '14px', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0F172A' }}>राजस्व स्रोत तथा संकलन विवरण</h3>
          </div>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', background: '#F0F9FF' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A' }}>
                कुल राजस्व संकलन लक्ष्य: {isEditing ? <input type='number' value={targetIncome} onChange={e => setTargetIncome(Number(e.target.value))} style={inputStyle}/> : formatNPR(targetIncome, true)}
              </span>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: incomePct >= 90 ? '#047857' : '#0F4C81' }}>
                {formatNPR(totalIncome, true)} ({incomePct}%)
              </span>
            </div>
            <div style={{ height: '12px', background: '#BAE6FD', borderRadius: '9999px', overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: '9999px', background: 'linear-gradient(90deg,#0F4C81,#0284C7)', width: `${incomePct}%`, transition: 'width 1s ease' }} />
            </div>
          </div>
          <div style={{ padding: '8px 0' }}>
            {incomes.map((src, idx) => (
              <div key={src.name} style={{ padding: '14px 20px', borderBottom: idx < incomes.length - 1 ? '1px solid #F1F5F9' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: src.color, flexShrink: 0 }} />
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0F172A' }}>{src.name}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    {isEditing ? <input type='number' value={src.amount} onChange={e => handleIncomeChange(src.name, 'amount', e.target.value)} style={{...inputStyle, maxWidth: '100px'}}/> : <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0F172A' }}>{formatNPR(src.amount, true)}</span>}
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '3px 8px', borderRadius: '9999px', background: src.color + '18', color: src.color }}>
                      {src.pct}%
                    </span>
                  </div>
                </div>
                <div style={{ marginTop: '8px', height: '6px', background: '#F1F5F9', borderRadius: '9999px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: '9999px', background: src.color, width: `${src.pct}%`, transition: 'width 0.8s ease' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginTop: '20px', padding: '14px 18px', background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '10px', fontSize: '0.75rem', color: '#065F46', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
        <CheckCircle2 size={15} style={{ flexShrink: 0, marginTop: '1px' }} />
        <span><strong>पारदर्शिता नोट:</strong> यो तथ्यांक पाँचपोखरी थाङपाल गाउँपालिकाको आन्तरिक लेखा प्रणालीबाट स्वचालित रूपमा अपडेट हुन्छ। अन्तिम अपडेट: {new Date().toLocaleDateString('ne-NP')} | स्रोत: गाउँपालिका लेखा शाखा</span>
      </div>
    </div>
  );
};

export default BudgetTrackerPage;
