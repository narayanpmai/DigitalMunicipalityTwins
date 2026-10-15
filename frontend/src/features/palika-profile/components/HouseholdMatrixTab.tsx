import React, { useState } from 'react';
import {
  Home,
  Droplets,
  Zap,
  Flame,
  Wifi,
  Search,
  CheckCircle2,
  Filter,
  Download,
  FileSpreadsheet,
  Layers,
  Sparkles
} from 'lucide-react';

const HOUSING_TYPES = [
  { type: 'ढुङ्गा-माटो तथा जस्तापाता (परम्परागत)', count: 3947, pct: 68, color: '#0284c7' },
  { type: 'पक्की आरसीसी फ्रेम (भूकम्प प्रतिरोधी)', count: 1277, pct: 22, color: '#10b981' },
  { type: 'काठ तथा अस्थायी टहरो', count: 581, pct: 10, color: '#f59e0b' },
];

const WATER_SOURCES = [
  { source: 'पाइप/धारा (व्यक्तिगत तथा सार्वजनिक)', count: 4888, pct: 84.2, color: '#0284c7' },
  { source: 'मूल/कुवा तथा स्प्रिङ प्रणाली', count: 726, pct: 12.5, color: '#10b981' },
  { source: 'नदी/खोला तथा अन्य', count: 191, pct: 3.3, color: '#ef4444' },
];

const FUEL_TYPES = [
  { fuel: 'एलपी ग्यास (LPG Gas)', count: 3367, pct: 58.0, color: '#0284c7' },
  { fuel: 'दाउरा तथा काठ (Firewood)', count: 2206, pct: 38.0, color: '#f59e0b' },
  { fuel: 'विद्युत तथा बायोग्यास (Induction/Biogas)', count: 232, pct: 4.0, color: '#10b981' },
];

const SAMPLE_HOUSEHOLDS = [
  { houseNo: 'P5-W1-0012', headName: 'दावा दोर्जे तामाङ', wardNo: 1, settlement: 'बाँसखर्क', members: 5, houseType: 'आरसीसी पक्की', water: 'पाइप धारा', fuel: 'एलपी ग्यास', electricity: true, toilet: 'फ्लस शौचालय', status: 'प्रमाणित' },
  { houseNo: 'P5-W2-0045', headName: 'पेम्बा शेर्पा', wardNo: 2, settlement: 'बरुवा देउराली', members: 4, houseType: 'ढुङ्गा-माटो', water: 'पाइप धारा', fuel: 'दाउरा/ग्यास', electricity: true, toilet: 'फ्लस शौचालय', status: 'प्रमाणित' },
  { houseNo: 'P5-W3-0089', headName: 'निमा लामा ह्योल्मो', wardNo: 3, settlement: 'भोताङ मानेडाँडा', members: 6, houseType: 'आरसीसी पक्की', water: 'पाइप धारा', fuel: 'एलपी ग्यास', electricity: true, toilet: 'फ्लस शौचालय', status: 'प्रमाणित' },
  { houseNo: 'P5-W4-0112', headName: 'सुमित्रा श्रेष्ठ', wardNo: 4, settlement: 'थाङपालकोट', members: 4, houseType: 'ढुङ्गा-माटो', water: 'पाइप धारा', fuel: 'एलपी ग्यास', electricity: true, toilet: 'फ्लस शौचालय', status: 'प्रमाणित' },
  { houseNo: 'P5-W5-0156', headName: 'सुकुमान तामाङ', wardNo: 5, settlement: 'गुन्सा काउले', members: 5, houseType: 'ढुङ्गा-माटो', water: 'मूल कुवा', fuel: 'दाउरा', electricity: true, toilet: 'खाल्डे शौचालय', status: 'प्रमाणित' },
  { houseNo: 'P5-W6-0001', headName: 'दिल बहादुर श्रेष्ठ', wardNo: 6, settlement: 'थाङपालधाप बजार', members: 4, houseType: 'आरसीसी पक्की', water: 'पाइप धारा', fuel: 'एलपी ग्यास', electricity: true, toilet: 'फ्लस शौचालय', status: 'प्रमाणित' },
  { houseNo: 'P5-W7-0204', headName: 'ज्ञान बहादुर तामाङ', wardNo: 7, settlement: 'भोटेनाम्लाङ', members: 5, houseType: 'ढुङ्गा-माटो', water: 'पाइप धारा', fuel: 'दाउरा/ग्यास', electricity: true, toilet: 'फ्लस शौचालय', status: 'प्रमाणित' },
  { houseNo: 'P5-W8-0078', headName: 'टेक बहादुर तामाङ', wardNo: 8, settlement: 'लागर्चे भञ्ज्याङ', members: 4, houseType: 'ढुङ्गा-माटो', water: 'पाइप धारा', fuel: 'दाउरा', electricity: true, toilet: 'खाल्डे शौचालय', status: 'प्रमाणित' },
];

export const HouseholdMatrixTab: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWard, setSelectedWard] = useState<number>(0);

  const filteredHouseholds = SAMPLE_HOUSEHOLDS.filter((h) => {
    const matchesSearch =
      !searchTerm ||
      h.headName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.houseNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.settlement.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesWard = selectedWard === 0 || h.wardNo === selectedWard;
    return matchesSearch && matchesWard;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. TOP 4 HOUSING INDICATORS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <div className="palika-glass-card" style={{ padding: '1.25rem', borderLeft: '4px solid #0284c7' }}>
          <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>कुल गणना भएका घरधुरी</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a', margin: '4px 0' }}>५,८०५ घर</div>
          <div style={{ fontSize: '0.75rem', color: '#0284c7', fontWeight: 700 }}>डिजिटल म्याट्रिक्समा अभिलेखीकृत</div>
        </div>

        <div className="palika-glass-card" style={{ padding: '1.25rem', borderLeft: '4px solid #10b981' }}>
          <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>सुरक्षित खानेपानी पहुँच</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#047857', margin: '4px 0' }}>८४.२%</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>४,८८८ घरधुरीमा धारा जडान</div>
        </div>

        <div className="palika-glass-card" style={{ padding: '1.25rem', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>विद्युत/उर्जा सुविधा</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#b45309', margin: '4px 0' }}>९६.४%</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>राष्ट्रिय ग्रिड + लघु-जलविद्युत</div>
        </div>

        <div className="palika-glass-card" style={{ padding: '1.25rem', borderLeft: '4px solid #8b5cf6' }}>
          <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>शौचालय सुविधा (ODF)</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#6d28d9', margin: '4px 0' }}>९८%</div>
          <div style={{ fontSize: '0.75rem', color: '#047857', fontWeight: 600 }}>खुल्ला दिसामुक्त पालिका</div>
        </div>
      </div>

      {/* 2. INFOGRAPHICS GAUGES GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {/* Gauge 1: घरको भौतिक संरचना */}
        <div className="palika-glass-card" style={{ padding: '1.4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.65rem' }}>
            <Home size={18} className="text-blue-600" />
            <h4 style={{ margin: 0, fontSize: '1.02rem', fontWeight: 900, color: '#0f172a' }}>घरको भौतिक बनोट (Structure Types)</h4>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {HOUSING_TYPES.map((h, idx) => (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700, marginBottom: '3px' }}>
                  <span style={{ color: '#334155' }}>{h.type}</span>
                  <span style={{ color: h.color }}>{h.count.toLocaleString()} घर ({h.pct}%)</span>
                </div>
                <div className="palika-meter-track">
                  <div className="palika-meter-fill" style={{ width: `${h.pct}%`, backgroundColor: h.color }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gauge 2: पिउने पानीको स्रोत */}
        <div className="palika-glass-card" style={{ padding: '1.4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.65rem' }}>
            <Droplets size={18} className="text-emerald-600" />
            <h4 style={{ margin: 0, fontSize: '1.02rem', fontWeight: 900, color: '#0f172a' }}>खानेपानीको मुख्य स्रोत (Drinking Water)</h4>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {WATER_SOURCES.map((w, idx) => (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700, marginBottom: '3px' }}>
                  <span style={{ color: '#334155' }}>{w.source}</span>
                  <span style={{ color: w.color }}>{w.count.toLocaleString()} घर ({w.pct}%)</span>
                </div>
                <div className="palika-meter-track">
                  <div className="palika-meter-fill" style={{ width: `${w.pct}%`, backgroundColor: w.color }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gauge 3: खाना पकाउने इन्धन */}
        <div className="palika-glass-card" style={{ padding: '1.4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.65rem' }}>
            <Flame size={18} className="text-amber-600" />
            <h4 style={{ margin: 0, fontSize: '1.02rem', fontWeight: 900, color: '#0f172a' }}>खाना पकाउने इन्धन (Cooking Fuel)</h4>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {FUEL_TYPES.map((f, idx) => (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700, marginBottom: '3px' }}>
                  <span style={{ color: '#334155' }}>{f.fuel}</span>
                  <span style={{ color: f.color }}>{f.count.toLocaleString()} घर ({f.pct}%)</span>
                </div>
                <div className="palika-meter-track">
                  <div className="palika-meter-fill" style={{ width: `${f.pct}%`, backgroundColor: f.color }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. HOUSEHOLD REGISTRY MASTER TABLE */}
      <div className="palika-glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.4rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', background: '#f8fafc' }}>
          <div>
            <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: '#0f172a' }}>
              डिजिटल घरधुरी म्याट्रिक्स लगत (Household Matrix Registry)
            </h4>
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>वडा नं. १ देखि ८ सम्मका प्रमाणित घरधुरी विवरण</span>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <select
              value={selectedWard}
              onChange={(e) => setSelectedWard(Number(e.target.value))}
              style={{ padding: '0.4rem 0.75rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.82rem', fontWeight: 700, outline: 'none' }}
            >
              <option value={0}>सबै वडाहरू (All Wards)</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((w) => (
                <option key={w} value={w}>वडा नं. {w}</option>
              ))}
            </select>

            <div style={{ position: 'relative', width: '210px' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="घरमुली वा घर नं. खोज..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '0.4rem 0.65rem 0.4rem 2rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.82rem', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="agri-pro-table">
            <thead>
              <tr>
                <th style={{ padding: '0.85rem 1.2rem' }}>घर नं. (House ID)</th>
                <th>घरमुलीको नाम</th>
                <th>वडा नं.</th>
                <th>टोल/बस्ती</th>
                <th style={{ textAlign: 'center' }}>परिवार सदस्य</th>
                <th>घरको बनोट</th>
                <th>खानेपानी</th>
                <th>इन्धन</th>
                <th style={{ textAlign: 'center' }}>स्थिति</th>
              </tr>
            </thead>
            <tbody>
              {filteredHouseholds.map((h, idx) => (
                <tr key={idx}>
                  <td style={{ padding: '0.85rem 1.2rem', fontWeight: 800, color: '#0f4c81' }}>
                    {h.houseNo}
                  </td>
                  <td style={{ fontWeight: 800, color: '#0f172a' }}>{h.headName}</td>
                  <td>
                    <span style={{ padding: '2px 8px', borderRadius: '4px', background: '#f1f5f9', fontWeight: 700, fontSize: '0.75rem' }}>
                      वडा {h.wardNo}
                    </span>
                  </td>
                  <td style={{ color: '#475569' }}>{h.settlement}</td>
                  <td style={{ textAlign: 'center', fontWeight: 700 }}>{h.members} जना</td>
                  <td>
                    <span style={{ padding: '2px 8px', borderRadius: '4px', background: h.houseType.includes('आरसीसी') ? '#ecfdf5' : '#fef3c7', color: h.houseType.includes('आरसीसी') ? '#047857' : '#92400e', fontWeight: 700, fontSize: '0.75rem' }}>
                      {h.houseType}
                    </span>
                  </td>
                  <td style={{ color: '#334155', fontSize: '0.82rem' }}>{h.water}</td>
                  <td style={{ color: '#334155', fontSize: '0.82rem' }}>{h.fuel}</td>
                  <td style={{ textAlign: 'center' }}>
                    <span style={{ padding: '2px 8px', borderRadius: '4px', background: '#d1fae5', color: '#065f46', fontWeight: 800, fontSize: '0.72rem' }}>
                      ✓ {h.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
