import React, { useState, useEffect } from 'react';
import { TrendingUp, Sprout, Loader2, Activity, CheckCircle2 } from 'lucide-react';
import './PredictiveAnalytics.css';

export const PredictiveAnalytics: React.FC = () => {
  const [crop, setCrop] = useState('आलु');
  const [area, setArea] = useState(10);
  const [agriResult, setAgriResult] = useState<any>(null);
  const [isAgriLoading, setIsAgriLoading] = useState(false);

  const [growthTarget, setGrowthTarget] = useState(0.08);
  const [revResult, setRevResult] = useState<any>(null);
  const [isRevLoading, setIsRevLoading] = useState(false);

  useEffect(() => { fetchCropPrediction(); }, [crop, area]);
  useEffect(() => { fetchRevenuePrediction(); }, [growthTarget]);

  const fetchCropPrediction = async () => {
    setIsAgriLoading(true);
    try {
      const res = await fetch('/api/v1/analytics/crop-yield-forecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ crop_name: crop, area_hectares: area })
      });
      setAgriResult(await res.json());
    } catch (e) { console.error(e); }
    finally { setIsAgriLoading(false); }
  };

  const fetchRevenuePrediction = async () => {
    setIsRevLoading(true);
    try {
      const res = await fetch('/api/v1/analytics/revenue-forecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fiscal_year: '2082/083', target_growth_rate: growthTarget })
      });
      setRevResult(await res.json());
    } catch (e) { console.error(e); }
    finally { setIsRevLoading(false); }
  };

  const formatNPR = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'NPR', maximumFractionDigits: 0 }).format(amount);

  return (
    <div className="analytics-container">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="analytics-header">
        <div className="analytics-header-left">
          <h2>
            <Activity size={22} color="#0F4C81" />
            AI Predictive Analytics — कृषि र राजश्व प्रक्षेपण
          </h2>
          <p>एआई मोडेलमा आधारित रियल-टाइम पूर्वानुमान प्रणाली</p>
        </div>
        <div className="analytics-live-badge">
          <span className="analytics-live-dot" />
          Live AI Model
        </div>
      </div>

      {/* ── Cards Grid ──────────────────────────────────────────────────── */}
      <div className="analytics-grid">

        {/* Agriculture Prediction Card */}
        <div className="prediction-card">
          <div className="card-header">
            <div className="card-header-icon green">
              <Sprout size={20} color="#10B981" />
            </div>
            <div>
              <h3>कृषि उत्पादन प्रक्षेपण (Crop Yield)</h3>
              <p className="card-header-sub">बाली र जमिनको आधारमा उत्पादन अनुमान</p>
            </div>
          </div>

          <div className="card-controls">
            <div className="control-group">
              <label>बाली छान्नुहोस् (Crop)</label>
              <select value={crop} onChange={(e) => setCrop(e.target.value)} className="modern-input">
                <option value="आलु">🥔 आलु (Potato)</option>
                <option value="स्याउ">🍎 स्याउ (Apple)</option>
                <option value="मकै">🌽 मकै (Corn)</option>
                <option value="किबी">🥝 किबी (Kiwi)</option>
              </select>
            </div>
            <div className="control-group">
              <label>क्षेत्रफल (Hectares)</label>
              <div className="slider-row">
                <input
                  type="range" min="1" max="100"
                  value={area} onChange={(e) => setArea(Number(e.target.value))}
                  className="modern-slider"
                />
                <span className="slider-value-pill">{area} ha</span>
              </div>
            </div>
          </div>

          <div className="result-display">
            {isAgriLoading ? (
              <div className="loading-state">
                <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                एआई मोडेल गणना गर्दैछ...
              </div>
            ) : agriResult && (
              <div className="metrics-grid">
                <div className="metric-box">
                  <span className="metric-label">कुल उत्पादन (Total Yield)</span>
                  <span className="metric-value text-green">
                    {agriResult.total_estimated_production_metric_tons} <span>MT</span>
                  </span>
                </div>
                <div className="metric-box">
                  <span className="metric-label">अनुमानित बजार मूल्य</span>
                  <span className="metric-value text-blue">{formatNPR(agriResult.projected_revenue_npr)}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Revenue Prediction Card */}
        <div className="prediction-card">
          <div className="card-header">
            <div className="card-header-icon blue">
              <TrendingUp size={20} color="#0F4C81" />
            </div>
            <div>
              <h3>आन्तरिक राजश्व प्रक्षेपण (Revenue Forecast)</h3>
              <p className="card-header-sub">आर्थिक वर्ष २०८२/०८३ को बजेट पूर्वानुमान</p>
            </div>
          </div>

          <div className="card-controls">
            <div className="control-group">
              <label>लक्षित आर्थिक वृद्धिदर (Target Growth Rate)</label>
              <div className="slider-row">
                <input
                  type="range" min="0.01" max="0.25" step="0.01"
                  value={growthTarget} onChange={(e) => setGrowthTarget(Number(e.target.value))}
                  className="modern-slider slider-blue"
                />
                <span className="slider-value-pill" style={{ background: '#0F4C81' }}>
                  {(growthTarget * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </div>

          <div className="result-display">
            {isRevLoading ? (
              <div className="loading-state">
                <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                बजेट प्रक्षेपण गणना गर्दैछ...
              </div>
            ) : revResult && (
              <div className="metrics-grid">
                <div className="metric-box full-width">
                  <span className="metric-label">प्रक्षेपित राजश्व ({revResult.forecast_fiscal_year})</span>
                  <span className="metric-value text-blue">{formatNPR(revResult.projected_revenue_npr)}</span>
                </div>
                <div className="metric-box full-width">
                  <span className="metric-label">मुख्य वृद्धि हुने क्षेत्रहरू (Key Growth Sectors)</span>
                  <div className="tags-container">
                    {revResult.top_growing_sectors.map((sector: string, idx: number) => (
                      <span key={idx} className="sector-tag">
                        <CheckCircle2 size={10} style={{ display: 'inline', marginRight: '3px' }} />
                        {sector}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
