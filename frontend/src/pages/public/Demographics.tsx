import React, { useState, useEffect } from 'react';
import {
  Users, User, UserPlus, Home, BookOpen, Briefcase,
  Droplets, Zap, Wifi, Activity, AlertCircle, RefreshCw,
  Heart, TrendingUp, Globe, Map,
} from 'lucide-react';
import { demographicsApi, DemographicSummary } from '../../api/demographics';

/* ── helpers ── */
const Stat: React.FC<{ icon: React.ReactNode; label: string; value: string | number; color: string; sub?: string }> = ({
  icon, label, value, color, sub,
}) => (
  <div style={{
    background: '#fff', borderRadius: 14, padding: '1.25rem 1.5rem',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)', borderTop: `4px solid ${color}`,
    display: 'flex', flexDirection: 'column', gap: 6,
    transition: 'transform .2s, box-shadow .2s',
  }}
    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; }}
    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ''; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)'; }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color }}>
      {icon}
      <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>{label}</span>
    </div>
    <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{value}</div>
    {sub && <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{sub}</div>}
  </div>
);

const Bar: React.FC<{ label: string; value: number; max?: number; color?: string; unit?: string }> = ({
  label, value, max = 100, color = '#0284c7', unit = '%',
}) => {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div style={{ marginBottom: '0.9rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: '0.875rem', color: '#334155', fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: '0.875rem', fontWeight: 700, color }}>{value}{unit}</span>
      </div>
      <div style={{ height: 8, background: '#e2e8f0', borderRadius: 8, overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${pct}%`,
          background: `linear-gradient(90deg, ${color}, ${color}cc)`,
          borderRadius: 8, transition: 'width 1s ease-out',
        }} />
      </div>
    </div>
  );
};

const Card: React.FC<{ title: string; icon: React.ReactNode; color: string; children: React.ReactNode }> = ({
  title, icon, color, children,
}) => (
  <div style={{ background: '#fff', borderRadius: 16, padding: '1.75rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.25rem' }}>
      <div style={{
        width: 40, height: 40, borderRadius: 10,
        background: `linear-gradient(135deg, ${color}, ${color}aa)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        {React.cloneElement(icon as React.ReactElement<any>, { size: 20, color: '#fff' })}
      </div>
      <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>{title}</h3>
    </div>
    {children}
  </div>
);

const DonutRing: React.FC<{ pct: number; color: string; label: string; size?: number }> = ({
  pct, color, label, size = 72,
}) => {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={8} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={8}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1s ease-out' }}
        />
        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle"
          style={{ fill: '#0f172a', fontSize: 13, fontWeight: 800, transform: 'rotate(90deg)', transformOrigin: '50% 50%' }}>
          {pct}%
        </text>
      </svg>
      <span style={{ fontSize: '0.72rem', color: '#64748b', textAlign: 'center', maxWidth: size }}>{label}</span>
    </div>
  );
};

const FALLBACK: DemographicSummary = {
  population: { total: 17521, male: 8600, female: 8921, households: 4820, avgHouseholdSize: 3.6, sexRatio: 96.4, density: 28, areaSqKm: 626, wards: 9 },
  ageStructure: { under15: 28, workingAge: 62, elderly65Plus: 10, dependencyRatio: 61 },
  literacy: { totalRate: 72, maleRate: 81, femaleRate: 64, higherEdu: 8, slcPassed: 34, noEdu: 18 },
  housing: { privateHouses: 4820, permanent: 42, semiPermanent: 38, temporary: 20, pipedWater: 74, electricity: 89, toilet: 87, internet: 61 },
  disability: { total: 312, rate: 1.8 },
  economic: { active: 8200, agriculture: 74, participationRate: 68, abroad: 1840 },
  householdRegistry: { registeredCount: 4230, highRiskCount: 186 },
};

export const Demographics: React.FC = () => {
  const [data, setData] = useState<DemographicSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [ward, setWard] = useState(0);

  const load = async () => {
    setLoading(true);
    setError(false);
    try {
      const s = await demographicsApi.getSummary();
      setData(s);
    } catch {
      setError(true);
      setData(FALLBACK);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const d = data ?? FALLBACK;
  const malePct = d.population.total ? Math.round((d.population.male / d.population.total) * 100) : 49;
  const femalePct = 100 - malePct;

  return (
    <div style={{ padding: '2rem', fontFamily: "'Inter', sans-serif", maxWidth: 1200, margin: '0 auto' }}>

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg,#0c1a3a 0%,#0284c7 100%)',
        borderRadius: 20, padding: '2.5rem', marginBottom: '2rem',
        color: '#fff', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'absolute', bottom: -60, right: 80, width: 260, height: 260, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, position: 'relative' }}>
          <Users size={36} color="#38bdf8" />
          <div>
            <h1 style={{ margin: 0, fontSize: '1.9rem', fontWeight: 800 }}>जनसांख्यिक अवस्था</h1>
            <p style={{ margin: 0, color: '#93c5fd', fontSize: '0.95rem' }}>राष्ट्रिय जनगणना २०७८ — {d.municipalityName || 'स्थानीय तह'}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: '1.25rem', position: 'relative' }}>
          <select value={ward} onChange={e => setWard(Number(e.target.value))} style={{
            background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)',
            color: '#fff', padding: '0.45rem 1rem', borderRadius: 10, cursor: 'pointer', fontSize: '0.9rem',
          }}>
            <option value={0} style={{ color: '#0f172a' }}>सम्पूर्ण पालिका</option>
            {Array.from({ length: d.population?.wards || 8 }, (_, i) => i + 1).map(w => (
              <option key={w} value={w} style={{ color: '#0f172a' }}>वडा नं. {w}</option>
            ))}
          </select>
          <button onClick={load} style={{
            background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.35)',
            color: '#fff', padding: '0.45rem 1rem', borderRadius: 10, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.9rem',
          }}>
            <RefreshCw size={14} /> पुनःलोड
          </button>
          {/* Summary pills */}
          {[
            { label: `${d.population.total.toLocaleString()} जनसंख्या` },
            { label: `${d.population.households.toLocaleString()} घरधुरी` },
            { label: `${d.population.wards} वडा` },
            { label: `${d.population.areaSqKm} वर्ग कि.मि.` },
          ].map(p => (
            <span key={p.label} style={{
              background: 'rgba(255,255,255,0.18)', borderRadius: 20,
              padding: '0.35rem 0.9rem', fontSize: '0.82rem', fontWeight: 600, color: '#fff',
            }}>{p.label}</span>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12,
          padding: '0.85rem 1.25rem', marginBottom: '1.5rem',
          display: 'flex', alignItems: 'center', gap: 10, color: '#dc2626', fontSize: '0.9rem',
        }}>
          <AlertCircle size={16} /> API उपलब्ध छैन — जनगणना २०७८ को अनुमानित तथ्यांक प्रदर्शन गरिएको छ।
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem', gap: 16, flexDirection: 'column' }}>
          <div style={{ width: 44, height: 44, border: '4px solid #e2e8f0', borderTopColor: '#0284c7', borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          <p style={{ color: '#64748b', margin: 0 }}>डाटा लोड हुँदैछ…</p>
        </div>
      ) : (
        <>
          {/* Top KPI row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: '1rem', marginBottom: '2rem' }}>
            <Stat icon={<Users size={20} />} label="जम्मा जनसंख्या" value={d.population.total.toLocaleString()} color="#0284c7" sub={`घनत्व: ${d.population.density} प्रति वर्ग कि.मि.`} />
            <Stat icon={<User size={20} />} label="पुरुष" value={d.population.male.toLocaleString()} color="#16a34a" sub={`${malePct}% — लिंग अनुपात ${d.population.sexRatio}`} />
            <Stat icon={<UserPlus size={20} />} label="महिला" value={d.population.female.toLocaleString()} color="#e11d48" sub={`${femalePct}%`} />
            <Stat icon={<Home size={20} />} label="घरधुरी" value={d.population.households.toLocaleString()} color="#7c3aed" sub={`औसत परिवार आकार: ${d.population.avgHouseholdSize}`} />
            <Stat icon={<Map size={20} />} label="क्षेत्रफल" value={`${d.population.areaSqKm} कि.मि²`} color="#d97706" sub={`${d.population.wards} वडा`} />
            <Stat icon={<Globe size={20} />} label="विदेशमा" value={d.economic.abroad.toLocaleString()} color="#0ea5e9" sub="वैदेशिक रोजगार" />
          </div>

          {/* Section grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

            {/* Age structure */}
            <Card title="उमेर संरचना" icon={<Activity />} color="#0284c7">
              <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '1.25rem' }}>
                <DonutRing pct={d.ageStructure.under15} color="#0284c7" label="१५ वर्षमुनि" />
                <DonutRing pct={d.ageStructure.workingAge} color="#16a34a" label="कार्यसक्षम (१५-६४)" />
                <DonutRing pct={d.ageStructure.elderly65Plus} color="#d97706" label="ज्येष्ठ (६५+)" />
              </div>
              <Bar label="निर्भरता अनुपात" value={d.ageStructure.dependencyRatio} color="#7c3aed" />
            </Card>

            {/* Literacy */}
            <Card title="शैक्षिक अवस्था" icon={<BookOpen />} color="#16a34a">
              <Bar label="समग्र साक्षरता" value={d.literacy.totalRate} color="#16a34a" />
              <Bar label="पुरुष साक्षरता" value={d.literacy.maleRate} color="#0284c7" />
              <Bar label="महिला साक्षरता" value={d.literacy.femaleRate} color="#e11d48" />
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: '0.5rem' }}>
                {[
                  { label: 'उच्च शिक्षा', value: d.literacy.higherEdu, color: '#7c3aed' },
                  { label: 'SLC उत्तीर्ण', value: d.literacy.slcPassed, color: '#0284c7' },
                  { label: 'शिक्षाविहीन', value: d.literacy.noEdu, color: '#dc2626' },
                ].map(i => (
                  <div key={i.label} style={{ flex: '1 1 80px', background: '#f8fafc', borderRadius: 10, padding: '0.5rem 0.75rem', borderLeft: `3px solid ${i.color}` }}>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{i.label}</div>
                    <div style={{ fontWeight: 700, color: i.color, fontSize: '1rem' }}>{i.value}%</div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Housing & Infrastructure */}
            <Card title="आवास तथा पूर्वाधार" icon={<Home />} color="#7c3aed">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
                {[
                  { label: 'पक्की घर', value: d.housing.permanent, color: '#16a34a' },
                  { label: 'अर्धपक्की', value: d.housing.semiPermanent, color: '#d97706' },
                  { label: 'कच्ची घर', value: d.housing.temporary, color: '#dc2626' },
                ].map(h => (
                  <div key={h.label} style={{ background: '#f8fafc', borderRadius: 10, padding: '0.5rem 0.75rem', borderLeft: `3px solid ${h.color}` }}>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{h.label}</div>
                    <div style={{ fontWeight: 700, color: h.color }}>{h.value}%</div>
                  </div>
                ))}
              </div>
              <Bar label="पाइपको पानी" value={d.housing.pipedWater} color="#0ea5e9" />
              <Bar label="विद्युत पहुँच" value={d.housing.electricity} color="#d97706" />
              <Bar label="शौचालय" value={d.housing.toilet} color="#16a34a" />
              <Bar label="इन्टरनेट" value={d.housing.internet} color="#8b5cf6" />
            </Card>

            {/* Economic */}
            <Card title="आर्थिक अवस्था" icon={<Briefcase />} color="#d97706">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                {[
                  { label: 'आर्थिक सक्रिय', value: d.economic.active.toLocaleString(), color: '#16a34a', unit: 'जना' },
                  { label: 'सहभागिता दर', value: `${d.economic.participationRate}%`, color: '#0284c7', unit: '' },
                  { label: 'कृषिमा आश्रित', value: `${d.economic.agriculture}%`, color: '#d97706', unit: '' },
                  { label: 'विदेशमा', value: d.economic.abroad.toLocaleString(), color: '#7c3aed', unit: 'जना' },
                ].map(e => (
                  <div key={e.label} style={{ background: '#f8fafc', borderRadius: 10, padding: '0.75rem', borderLeft: `3px solid ${e.color}` }}>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: 4 }}>{e.label}</div>
                    <div style={{ fontWeight: 800, color: e.color, fontSize: '1.1rem' }}>{e.value}</div>
                  </div>
                ))}
              </div>
              <Bar label="कृषिमा आश्रित" value={d.economic.agriculture} color="#d97706" />
              <Bar label="श्रम सहभागिता" value={d.economic.participationRate} color="#0284c7" />
            </Card>

            {/* Disability & Social */}
            <Card title="अपाङ्गता तथा सामाजिक" icon={<Heart />} color="#e11d48">
              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginBottom: '1.25rem' }}>
                <DonutRing pct={d.disability.rate} color="#e11d48" label="अपाङ्गता दर" size={80} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: 4 }}>कुल अपाङ्ग</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>{d.disability.total.toLocaleString()}</div>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: 4 }}>जनसंख्याको {d.disability.rate}%</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {[
                  { label: 'घरदर्ता भएका', value: d.householdRegistry.registeredCount.toLocaleString(), color: '#16a34a' },
                  { label: 'उच्च जोखिम', value: d.householdRegistry.highRiskCount.toLocaleString(), color: '#dc2626' },
                ].map(s => (
                  <div key={s.label} style={{ flex: 1, background: '#f8fafc', borderRadius: 10, padding: '0.75rem', borderLeft: `3px solid ${s.color}` }}>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: 4 }}>{s.label}</div>
                    <div style={{ fontWeight: 800, color: s.color, fontSize: '1.1rem' }}>{s.value}</div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Sex ratio gauge + quick facts */}
            <Card title="लिंग अनुपात तथा तथ्यांक" icon={<TrendingUp />} color="#0ea5e9">
              <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '1.25rem' }}>
                <DonutRing pct={malePct} color="#0284c7" label="पुरुष" size={80} />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>लिंग अनुपात</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0284c7' }}>{d.population.sexRatio}</div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>प्रति १०० महिला पुरुष</div>
                </div>
                <DonutRing pct={femalePct} color="#e11d48" label="महिला" size={80} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                {[
                  { label: 'घनत्व', value: `${d.population.density}/कि.मि²` },
                  { label: 'औसत परिवार', value: `${d.population.avgHouseholdSize} जना` },
                  { label: 'क्षेत्रफल', value: `${d.population.areaSqKm} कि.मि²` },
                  { label: 'वडा संख्या', value: `${d.population.wards} वटा` },
                ].map(f => (
                  <div key={f.label} style={{ background: '#f8fafc', borderRadius: 10, padding: '0.6rem 0.75rem' }}>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{f.label}</div>
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>{f.value}</div>
                  </div>
                ))}
              </div>
            </Card>

          </div>

          {/* Data source footer */}
          <div style={{ marginTop: '1.5rem', background: '#f8fafc', borderRadius: 12, padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: 10, color: '#64748b', fontSize: '0.82rem' }}>
            <Activity size={15} />
            <span>स्रोत: राष्ट्रिय जनगणना २०७८ — राष्ट्रिय तथ्याङ्क कार्यालय (NSO Nepal)। डाटा {d.municipalityName || 'पालिका'}को डिजिटल ट्विन प्रणालीबाट लिइएको।</span>
          </div>
        </>
      )}
    </div>
  );
};

