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
  Sparkles
} from 'lucide-react';

const AGE_PYRAMID_DATA = [
  { age: '८०+ वर्ष', male: 110, female: 145, mPct: 1.1, fPct: 1.4 },
  { age: '७०-७९ वर्ष', male: 320, female: 360, mPct: 3.2, fPct: 3.5 },
  { age: '६०-६९ वर्ष', male: 680, female: 725, mPct: 6.8, fPct: 7.1 },
  { age: '५०-५९ वर्ष', male: 1050, female: 1120, mPct: 10.6, fPct: 11.0 },
  { age: '४०-४९ वर्ष', male: 1380, female: 1460, mPct: 13.9, fPct: 14.3 },
  { age: '३०-३९ वर्ष', male: 1620, female: 1710, mPct: 16.3, fPct: 16.8 },
  { age: '२०-२९ वर्ष', male: 1850, female: 1940, mPct: 18.6, fPct: 19.0 },
  { age: '१०-१९ वर्ष', male: 1610, female: 1580, mPct: 16.2, fPct: 15.5 },
  { age: '०-९ वर्ष', male: 1330, female: 1300, mPct: 13.4, fPct: 12.8 },
];

const ETHNICITY_DATA = [
  { caste: 'तामाङ (Tamang)', count: 12820, pct: 62.4, color: '#0284c7' },
  { caste: 'क्षेत्री तथा बाहुन (Chhetri/Brahmin)', count: 3720, pct: 18.1, color: '#10b981' },
  { caste: 'नेवार (Newar)', count: 2570, pct: 12.5, color: '#f59e0b' },
  { caste: 'दलित (विश्वकर्मा/परियार/मिजार)', count: 985, pct: 4.8, color: '#ef4444' },
  { caste: 'ह्योल्मो/शेर्पा तथा अन्य', count: 445, pct: 2.2, color: '#8b5cf6' },
];

const LANGUAGE_DATA = [
  { lang: 'तामाङ भाषा', pct: 60.8, color: '#0284c7' },
  { lang: 'नेपाली भाषा (खस)', pct: 24.5, color: '#10b981' },
  { lang: 'ह्योल्मो/शेर्पा भाषा', pct: 12.1, color: '#8b5cf6' },
  { lang: 'नेवारी तथा अन्य', pct: 2.6, color: '#f59e0b' },
];

export const DemographicsInfographicsTab: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. TOP SUMMARY METRICS ROW */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <div className="palika-glass-card" style={{ padding: '1.25rem', borderLeft: '4px solid #0284c7' }}>
          <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>कुल जनसंख्या</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a', margin: '4px 0' }}>२०,५४०</div>
          <div style={{ fontSize: '0.75rem', color: '#0284c7', fontWeight: 700 }}>राष्ट्रिय जनगणना २०७८ आधार</div>
        </div>

        <div className="palika-glass-card" style={{ padding: '1.25rem', borderLeft: '4px solid #10b981' }}>
          <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>लैङ्गिक अनुपात (Sex Ratio)</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#047857', margin: '4px 0' }}>९३.५</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>प्रति १०० महिलामा पुरुष</div>
        </div>

        <div className="palika-glass-card" style={{ padding: '1.25rem', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>औसत परिवार आकार</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#b45309', margin: '4px 0' }}>३.५४</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>सदस्य प्रति घरधुरी</div>
        </div>

        <div className="palika-glass-card" style={{ padding: '1.25rem', borderLeft: '4px solid #8b5cf6' }}>
          <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>समग्र साक्षरता दर</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#6d28d9', margin: '4px 0' }}>७२.४%</div>
          <div style={{ fontSize: '0.75rem', color: '#047857', fontWeight: 600 }}>पुरुष: ७८.५% | महिला: ६६.२%</div>
        </div>
      </div>

      {/* 2. AGE-SEX POPULATION PYRAMID */}
      <div className="palika-glass-card" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={20} className="text-blue-600" />
              पाँचपोखरी थाङपाल: उमेर-लिङ्ग जनसांख्यिक पिरामिड (Age-Sex Pyramid)
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>बायाँ: पुरुष (९,९५० - ४८.४%) | दायाँ: महिला (१०,५९० - ५१.६%)</span>
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
          {AGE_PYRAMID_DATA.map((row, idx) => (
            <div key={idx} className="palika-pyramid-row">
              {/* Male Bar (Grows from Right to Left) */}
              <div className="palika-pyramid-bar-left">
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                  {row.male.toLocaleString()} ({row.mPct}%)
                </span>
                <div
                  className="palika-pyramid-fill-male"
                  style={{ width: `${Math.min(100, row.mPct * 4.8)}%` }}
                ></div>
              </div>

              {/* Age Label */}
              <div className="palika-pyramid-label">{row.age}</div>

              {/* Female Bar (Grows from Left to Right) */}
              <div className="palika-pyramid-bar-right">
                <div
                  className="palika-pyramid-fill-female"
                  style={{ width: `${Math.min(100, row.fPct * 4.8)}%` }}
                ></div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                  {row.female.toLocaleString()} ({row.fPct}%)
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Age Group Highlights */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
          <div style={{ padding: '0.85rem', borderRadius: '10px', background: '#f0f9ff', border: '1px solid #bae6fd' }}>
            <div style={{ fontSize: '0.75rem', color: '#0369a1', fontWeight: 700 }}>👶 बालबालिका (०-१४ वर्ष)</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0284c7', margin: '2px 0' }}>५,१७० जना (२५.२%)</div>
            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>शिक्षा तथा बाल पोषण प्राथमिकता समूह</div>
          </div>

          <div style={{ padding: '0.85rem', borderRadius: '10px', background: '#ecfdf5', border: '1px solid #a7f3d0' }}>
            <div style={{ fontSize: '0.75rem', color: '#065f46', fontWeight: 700 }}>💪 उत्पादनशील उमेर (१५-५९ वर्ष)</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#047857', margin: '2px 0' }}>१२,०४० जना (५८.६%)</div>
            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>कृषि, पर्यटन र स्वरोजगार समूह</div>
          </div>

          <div style={{ padding: '0.85rem', borderRadius: '10px', background: '#fdf4ff', border: '1px solid #f5d0fe' }}>
            <div style={{ fontSize: '0.75rem', color: '#86198f', fontWeight: 700 }}>👵 ज्येष्ठ नागरिक (६०+ वर्ष)</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#a21caf', margin: '2px 0' }}>३,३३० जना (१६.२%)</div>
            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>सामाजिक सुरक्षा तथा स्वास्थ्य सेवा समूह</div>
          </div>
        </div>
      </div>

      {/* 3. ETHNICITY & LANGUAGE SECTION */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
        {/* Ethnicity Card */}
        <div className="palika-glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.65rem' }}>
            <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <PieChart size={18} className="text-blue-600" />
              जातजाति तथा समुदायगत वितरण
            </h4>
            <span className="agri-badge agri-badge-info">५ मुख्य समूह</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {ETHNICITY_DATA.map((item, idx) => (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', fontWeight: 700, marginBottom: '4px' }}>
                  <span style={{ color: '#0f172a' }}>{item.caste}</span>
                  <span style={{ color: item.color }}>{item.count.toLocaleString()} ({item.pct}%)</span>
                </div>
                <div className="palika-meter-track">
                  <div className="palika-meter-fill" style={{ width: `${item.pct}%`, backgroundColor: item.color }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Language & Disability Card */}
        <div className="palika-glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.65rem' }}>
            <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <BookOpen size={18} className="text-emerald-600" />
              मातृभाषा संरचना तथा अपाङ्गता स्थिति
            </h4>
            <span className="agri-badge agri-badge-success">सामाजिक सुरक्षा</span>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#334155', marginBottom: '0.5rem' }}>मातृभाषा अनुपात:</div>
            <div style={{ display: 'flex', gap: '0.4rem', height: '14px', borderRadius: '6px', overflow: 'hidden', marginBottom: '0.5rem' }}>
              {LANGUAGE_DATA.map((l, idx) => (
                <div key={idx} style={{ width: `${l.pct}%`, background: l.color }} title={`${l.lang}: ${l.pct}%`}></div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.4rem', fontSize: '0.75rem' }}>
              {LANGUAGE_DATA.map((l, idx) => (
                <span key={idx} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: l.color }}></span>
                  {l.lang}: <strong>{l.pct}%</strong>
                </span>
              ))}
            </div>
          </div>

          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#334155', marginBottom: '0.5rem' }}>अपाङ्गता परिचयपत्र वितरण स्थिति:</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', textAlign: 'center' }}>
              <div style={{ padding: '0.5rem', borderRadius: '8px', background: '#fee2e2', border: '1px solid #fca5a5' }}>
                <div style={{ fontSize: '0.7rem', color: '#991b1b', fontWeight: 700 }}>पूर्ण अशक्त (क)</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#b91c1c' }}>४२</div>
              </div>
              <div style={{ padding: '0.5rem', borderRadius: '8px', background: '#e0f2fe', border: '1px solid #7dd3fc' }}>
                <div style={{ fontSize: '0.7rem', color: '#0369a1', fontWeight: 700 }}>अति अशक्त (ख)</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0284c7' }}>८८</div>
              </div>
              <div style={{ padding: '0.5rem', borderRadius: '8px', background: '#fef3c7', border: '1px solid #fcd34d' }}>
                <div style={{ fontSize: '0.7rem', color: '#92400e', fontWeight: 700 }}>मध्यम (ग)</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#d97706' }}>१२४</div>
              </div>
              <div style={{ padding: '0.5rem', borderRadius: '8px', background: '#f1f5f9', border: '1px solid #cbd5e1' }}>
                <div style={{ fontSize: '0.7rem', color: '#475569', fontWeight: 700 }}>सामान्य (घ)</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#334155' }}>७६</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
