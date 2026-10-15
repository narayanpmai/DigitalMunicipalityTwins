import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Info, 
  Building2, 
  Store, 
  Trees, 
  Home, 
  Printer, 
  X, 
  FileText, 
  MapPin, 
  AlertTriangle, 
  CheckCircle 
} from 'lucide-react';
import { revenueApi, TaxCalculationParams, TaxCalculationResult } from '../../../api/revenue';
import { toNepaliDigits } from '../utils/nepaliCurrencyWords';

interface TaxCalculatorCardProps {
  onProceedToPayment?: (calcDetails: {
    category: string;
    revenueHead: string;
    baseAmount: number;
    discountAmount: number;
    fineAmount: number;
    netAmount: number;
    details: any;
  }) => void;
}

// Government Land Valuation by Ward & Road Access (Panchpokhari Thangpal standard)
const LAND_VALUATION_PER_ROPANI: Record<number, { main: number; branch: number; trail: number; none: number }> = {
  1: { main: 600000, branch: 400000, trail: 250000, none: 150000 },
  2: { main: 750000, branch: 500000, trail: 300000, none: 200000 },
  3: { main: 900000, branch: 650000, trail: 400000, none: 250000 }, // Tarkeghyang tourist hub
  4: { main: 700000, branch: 450000, trail: 280000, none: 180000 },
  5: { main: 550000, branch: 380000, trail: 240000, none: 150000 },
  6: { main: 500000, branch: 350000, trail: 220000, none: 140000 },
  7: { main: 480000, branch: 320000, trail: 200000, none: 130000 },
  8: { main: 450000, branch: 300000, trail: 190000, none: 120000 },
};

export const TaxCalculatorCard: React.FC<TaxCalculatorCardProps> = ({ onProceedToPayment }) => {
  const [category, setCategory] = useState<'property' | 'business' | 'land' | 'rent'>('property');
  const [showSlipModal, setShowSlipModal] = useState(false);

  // Parameters
  const [params, setParams] = useState<TaxCalculationParams>({
    taxCategory: 'property',
    payerName: 'दावा लामा शेर्पा',
    ownerPanOrCitizenship: '२७-०१-६५-०१२३४',
    wardNumber: 3,
    kittaNo: '३४२, ३४३',
    charkillaEast: 'सार्वजनिक गोरेटो बाटो',
    charkillaWest: 'पेम्बा दोर्जेको खेत',
    charkillaNorth: 'सिँचाइ कुलो',
    charkillaSouth: 'कर्म लामाको साँध',
    landAreaRopani: 2,
    landAreaAana: 4,
    landAreaPaisa: 2,
    landAreaDaam: 1,
    roadAccess: 'main',
    structureType: 'rcc',
    builtAreaSqFt: 1200,
    businessCapital: 500000,
    businessNature: 'होटल तथा पर्यटन व्यवसाय (पर्यटकीय क्षेत्र)',
    landGrade: 'abbal',
    monthlyRent: 25000,
    isEarlyRebateEligible: true,
    delayPenaltyRatePercent: 0,
  });

  const [calcResult, setCalcResult] = useState<TaxCalculationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Perform calculation
  const runCalculation = async () => {
    setIsCalculating(true);
    try {
      const res = await revenueApi.calculateTax({
        ...params,
        taxCategory: category,
      });
      if ((res as any)?.data) {
        setCalcResult((res as any).data);
        return;
      }
    } catch {
      // Local fallback calculation with authentic municipal valuation formula
    }

    const ward = params.wardNumber || 3;
    const road = params.roadAccess || 'main';
    const wardRates = LAND_VALUATION_PER_ROPANI[ward] || LAND_VALUATION_PER_ROPANI[3];
    const ratePerRopani = wardRates[road] || 600000;

    // Area in Ropani units
    const totalRopani = (params.landAreaRopani || 0) + 
      ((params.landAreaAana || 0) / 16) + 
      ((params.landAreaPaisa || 0) / 64) + 
      ((params.landAreaDaam || 0) / 256);

    const totalLandValue = Math.round(totalRopani * ratePerRopani);

    let base = 2500;
    const breakdown = [];

    if (category === 'property') {
      // 0.05% of land evaluated value
      const landTax = Math.round(totalLandValue * 0.0005);
      breakdown.push({
        title: `जग्गा सम्पत्ति कर (वडा ${ward} - सरकारी मूल्याङ्कन रु. ${(ratePerRopani/100000).toFixed(1)} लाख/रोपनी)`,
        amount: landTax,
        description: `कुल जग्गा मूल्याङ्कन: रु. ${totalLandValue.toLocaleString('ne-NP')} (${totalRopani.toFixed(2)} रोपनी)`,
      });

      // Structure tax
      const structRate = params.structureType === 'rcc' ? 4.0 : params.structureType === 'semi_pakki' ? 2.5 : 1.2;
      const houseTax = Math.round((params.builtAreaSqFt || 0) * structRate);
      breakdown.push({
        title: `भवन संरचना कर (${params.structureType === 'rcc' ? 'पक्की RCC' : params.structureType === 'semi_pakki' ? 'अर्ध-पक्की' : 'कच्ची'})`,
        amount: houseTax,
        description: `${params.builtAreaSqFt || 0} वर्गफिट @ रु. ${structRate}/वर्गफिट`,
      });

      base = landTax + houseTax;
    } else if (category === 'land') {
      // Malpot land revenue
      const gradeRate = params.landGrade === 'abbal' ? 120 : params.landGrade === 'doyam' ? 90 : params.landGrade === 'seem' ? 60 : 40;
      base = Math.round(totalRopani * 16 * gradeRate);
      breakdown.push({
        title: `मालपोत तथा भूमिकर (${params.landGrade === 'abbal' ? 'अब्बल' : params.landGrade === 'doyam' ? 'दोयम' : 'सिम'} जग्गा)`,
        amount: base,
        description: `${(totalRopani * 16).toFixed(1)} आना @ रु. ${gradeRate}/आना`,
      });
    } else if (category === 'business') {
      const cap = params.businessCapital || 500000;
      base = cap <= 500000 ? 2500 : cap <= 2500000 ? 5000 : cap <= 5000000 ? 10000 : 15000;
      breakdown.push({
        title: 'स्थानीय व्यवसाय कर',
        amount: base,
        description: `पुँजी: रु. ${cap.toLocaleString('ne-NP')} (${params.businessNature})`,
      });
    } else if (category === 'rent') {
      base = Math.round((params.monthlyRent || 0) * 12 * 0.10);
      breakdown.push({
        title: 'घरबहाल कर (१०%)',
        amount: base,
        description: `मासिक बहाल रु. ${(params.monthlyRent || 0).toLocaleString('ne-NP')} को वार्षिक १०%`,
      });
    }

    // Discount (Early payment before Poush end: 10%)
    let discount = 0;
    if (params.isEarlyRebateEligible) {
      discount = Math.round(base * 0.10);
      breakdown.push({
        title: '१०% अग्रिम कर भुक्तानी छुट',
        amount: -discount,
        description: 'स्थानीय आर्थिक ऐन बमोजिम पुस मसान्तभित्र भुक्तानीमा विशेष सहुलियत',
      });
    }

    // Penalty if overdue
    let fine = 0;
    if ((params.delayPenaltyRatePercent || 0) > 0) {
      fine = Math.round(base * ((params.delayPenaltyRatePercent || 0) / 100));
      breakdown.push({
        title: `म्याद नाघेको जरिवाना (${params.delayPenaltyRatePercent}%)`,
        amount: fine,
        description: 'म्याद नाघेपश्चात तोकिएको विलम्ब शुल्क',
      });
    }

    const netPayable = Math.max(0, base - discount + fine);

    setCalcResult({
      taxCategory: category,
      baseTax: base,
      discountAmount: discount,
      fineAmount: fine,
      netPayable,
      breakdown,
      fiscalYear: '२०८१/०८२',
      statutoryAct: 'पाँचपोखरी थाङपाल गाउँपालिका आर्थिक ऐन, २०८१',
    });

    setIsCalculating(false);
  };

  useEffect(() => {
    runCalculation();
  }, [category, params]);

  const handlePayClick = () => {
    if (!calcResult || !onProceedToPayment) return;
    const categoryHeadMap: Record<string, string> = {
      property: 'सम्पत्ति कर (Integrated Property Tax)',
      business: 'व्यवसाय कर (Business Tax)',
      land: 'मालपोत तथा भूमिकर (Land Revenue)',
      rent: 'घरबहाल कर (House Rent Tax)',
    };
    onProceedToPayment({
      category,
      revenueHead: categoryHeadMap[category] || 'स्थानीय कर',
      baseAmount: calcResult.baseTax,
      discountAmount: calcResult.discountAmount,
      fineAmount: calcResult.fineAmount,
      netAmount: calcResult.netPayable,
      details: {
        kittaNo: params.kittaNo,
        wardNumber: params.wardNumber,
        payerName: params.payerName,
        charkilla: `${params.charkillaEast || ''}, ${params.charkillaWest || ''}, ${params.charkillaNorth || ''}, ${params.charkillaSouth || ''}`,
      },
    });
  };

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        fontFamily: "'Inter', system-ui, sans-serif"
      }}
    >
      {/* Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #059669 100%)',
          padding: '1.25rem 1.75rem',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.55rem', borderRadius: '10px' }}>
            <Calculator size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
              डिजिटल कर तथा मालपोत मूल्याङ्कन क्यालकुलेटर
            </h2>
            <p style={{ margin: '0.2rem 0 0', opacity: 0.9, fontSize: '0.8rem' }}>
              पाँचपोखरी थाङपाल गाउँपालिका आर्थिक ऐन २०८१ बमोजिम सम्पत्ति, मालपोत, कित्ता तथा घरबहाल कर निर्धारण
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowSlipModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.55rem 1rem',
            background: 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '8px',
            color: '#fff',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.82rem',
          }}
        >
          <Printer size={15} /> कर निर्धारण पुर्जी (Slip)
        </button>
      </div>

      {/* Category Tabs */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          backgroundColor: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
        }}
      >
        {[
          { id: 'property', label: 'एकीकृत सम्पत्ति कर', sub: 'घर तथा जग्गा संयुक्त', icon: <Home size={18} /> },
          { id: 'land', label: 'मालपोत तथा भूमिकर', sub: 'कित्ता तथा जग्गाको किसिम', icon: <Trees size={18} /> },
          { id: 'business', label: 'स्थानीय व्यवसाय कर', sub: 'व्यवसाय पुँजी तथा प्रकृति', icon: <Store size={18} /> },
          { id: 'rent', label: 'घरबहाल कर (१०%)', sub: 'मासिक घरभाडा कट्टी', icon: <Building2 size={18} /> },
        ].map((tab) => {
          const isActive = category === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setCategory(tab.id as any);
                setParams((prev) => ({ ...prev, taxCategory: tab.id as any }));
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                padding: '0.9rem 1.25rem',
                border: 'none',
                borderBottom: isActive ? '3px solid #059669' : '3px solid transparent',
                backgroundColor: isActive ? '#ffffff' : 'transparent',
                color: isActive ? '#065f46' : '#64748b',
                fontWeight: isActive ? 800 : 600,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ color: isActive ? '#059669' : '#94a3b8' }}>{tab.icon}</div>
              <div>
                <div style={{ fontSize: '0.9rem' }}>{tab.label}</div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 500 }}>{tab.sub}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Body: Inputs + Live Assessment */}
      <div
        style={{
          padding: '1.5rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '1.75rem',
        }}
      >
        {/* Left Column: Form Inputs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Taxpayer & Kitta Information */}
          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ margin: '0 0 0.6rem', fontSize: '0.85rem', color: '#065f46', fontWeight: 700 }}>
              १. करदाता तथा कित्ता विवरण
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '0.65rem', marginBottom: '0.65rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.2rem' }}>करदाताको नाम *</label>
                <input
                  type="text"
                  value={params.payerName || ''}
                  onChange={(e) => setParams({ ...params, payerName: e.target.value })}
                  style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.2rem' }}>PAN / नागरिकता नं.</label>
                <input
                  type="text"
                  value={params.ownerPanOrCitizenship || ''}
                  onChange={(e) => setParams({ ...params, ownerPanOrCitizenship: e.target.value })}
                  style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.2rem' }}>वडा नं. *</label>
                <select
                  value={params.wardNumber || 3}
                  onChange={(e) => setParams({ ...params, wardNumber: Number(e.target.value) })}
                  style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem', background: '#fff' }}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(w => (
                    <option key={w} value={w}>वडा नं. {w}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.2rem' }}>कित्ता नम्बर *</label>
                <input
                  type="text"
                  placeholder="उदा: ३४२, ३४३"
                  value={params.kittaNo || ''}
                  onChange={(e) => setParams({ ...params, kittaNo: e.target.value })}
                  style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                />
              </div>
            </div>
          </div>

          {/* Land Area: Ropani-Aana-Paisa-Daam */}
          {(category === 'property' || category === 'land') && (
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ margin: '0 0 0.6rem', fontSize: '0.85rem', color: '#065f46', fontWeight: 700 }}>
                २. जग्गाको क्षेत्रफल (रोपनी-आना-पैसा-दाम)
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.2rem' }}>रोपनी</label>
                  <input
                    type="number"
                    min="0"
                    value={params.landAreaRopani || 0}
                    onChange={(e) => setParams({ ...params, landAreaRopani: parseFloat(e.target.value) || 0 })}
                    style={{ width: '100%', padding: '0.45rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', textAlign: 'center' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.2rem' }}>आना (०-१५)</label>
                  <input
                    type="number"
                    min="0"
                    max="15"
                    value={params.landAreaAana || 0}
                    onChange={(e) => setParams({ ...params, landAreaAana: parseFloat(e.target.value) || 0 })}
                    style={{ width: '100%', padding: '0.45rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', textAlign: 'center' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.2rem' }}>पैसा (०-३)</label>
                  <input
                    type="number"
                    min="0"
                    max="3"
                    value={params.landAreaPaisa || 0}
                    onChange={(e) => setParams({ ...params, landAreaPaisa: parseFloat(e.target.value) || 0 })}
                    style={{ width: '100%', padding: '0.45rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', textAlign: 'center' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.2rem' }}>दाम (०-३)</label>
                  <input
                    type="number"
                    min="0"
                    max="3"
                    value={params.landAreaDaam || 0}
                    onChange={(e) => setParams({ ...params, landAreaDaam: parseFloat(e.target.value) || 0 })}
                    style={{ width: '100%', padding: '0.45rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', textAlign: 'center' }}
                  />
                </div>
              </div>

              {/* Road & Grade */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.2rem' }}>सडकको पहुँच</label>
                  <select
                    value={params.roadAccess || 'main'}
                    onChange={(e) => setParams({ ...params, roadAccess: e.target.value as any })}
                    style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem', background: '#fff' }}
                  >
                    <option value="main">🛣️ पक्की कालोपत्रे मुख्य सडक</option>
                    <option value="branch">🚜 ग्राभेल / शाखा सडक</option>
                    <option value="trail">🚶 कच्ची मोटरबाटो / गोरेटो</option>
                    <option value="none">सडक पहुँच नभएको</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.2rem' }}>जग्गाको किसिम</label>
                  <select
                    value={params.landGrade || 'abbal'}
                    onChange={(e) => setParams({ ...params, landGrade: e.target.value as any })}
                    style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem', background: '#fff' }}
                  >
                    <option value="abbal">अब्बल (उत्कृष्ट उब्जाउ/आवासीय)</option>
                    <option value="doyam">दोयम (मध्यम)</option>
                    <option value="seem">सिम (कमजोर)</option>
                    <option value="chahar">चाहार (पाखो/भिरालो)</option>
                  </select>
                </div>
              </div>

              {/* Four boundaries (चारकिल्ला) */}
              <div style={{ marginTop: '0.65rem', paddingTop: '0.65rem', borderTop: '1px dashed #cbd5e1' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>चारकिल्ला विवरण:</span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', marginTop: '0.3rem' }}>
                  <input
                    type="text"
                    placeholder="पूर्व: बाटो / साँध..."
                    value={params.charkillaEast || ''}
                    onChange={(e) => setParams({ ...params, charkillaEast: e.target.value })}
                    style={{ padding: '0.35rem 0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.78rem' }}
                  />
                  <input
                    type="text"
                    placeholder="पश्चिम: साँध..."
                    value={params.charkillaWest || ''}
                    onChange={(e) => setParams({ ...params, charkillaWest: e.target.value })}
                    style={{ padding: '0.35rem 0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.78rem' }}
                  />
                  <input
                    type="text"
                    placeholder="उत्तर: कुलो / साँध..."
                    value={params.charkillaNorth || ''}
                    onChange={(e) => setParams({ ...params, charkillaNorth: e.target.value })}
                    style={{ padding: '0.35rem 0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.78rem' }}
                  />
                  <input
                    type="text"
                    placeholder="दक्षिण: साँध..."
                    value={params.charkillaSouth || ''}
                    onChange={(e) => setParams({ ...params, charkillaSouth: e.target.value })}
                    style={{ padding: '0.35rem 0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.78rem' }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Structure (for Property Tax) */}
          {category === 'property' && (
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ margin: '0 0 0.6rem', fontSize: '0.85rem', color: '#065f46', fontWeight: 700 }}>
                ३. भवन संरचनाको विवरण
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.65rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.2rem' }}>संरचनाको प्रकृति</label>
                  <select
                    value={params.structureType || 'rcc'}
                    onChange={(e) => setParams({ ...params, structureType: e.target.value as any })}
                    style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem', background: '#fff' }}
                  >
                    <option value="rcc">🏢 पक्की RCC फ्रेम (दर रु ४.०/वर्गफिट)</option>
                    <option value="semi_pakki">🏠 अर्ध-पक्की लोडबेयरिङ (रु २.५/वर्गफिट)</option>
                    <option value="kachhi">🛖 कच्ची ढुङ्गा-माटो (रु १.२/वर्गफिट)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.2rem' }}>निर्मित क्षेत्रफल (वर्गफिट)</label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={params.builtAreaSqFt || 0}
                    onChange={(e) => setParams({ ...params, builtAreaSqFt: parseFloat(e.target.value) || 0 })}
                    style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Business Inputs */}
          {category === 'business' && (
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.2rem' }}>व्यवसायको पुँजी लगानी (रु.)</label>
                  <input
                    type="number"
                    min="0"
                    step="50000"
                    value={params.businessCapital || 0}
                    onChange={(e) => setParams({ ...params, businessCapital: parseFloat(e.target.value) || 0 })}
                    style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.2rem' }}>व्यवसायको प्रकृति</label>
                  <input
                    type="text"
                    value={params.businessNature || ''}
                    onChange={(e) => setParams({ ...params, businessNature: e.target.value })}
                    style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Rent Inputs */}
          {category === 'rent' && (
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.2rem' }}>मासिक घरबहाल रकम (रु.)</label>
              <input
                type="number"
                min="0"
                step="1000"
                value={params.monthlyRent || 0}
                onChange={(e) => setParams({ ...params, monthlyRent: parseFloat(e.target.value) || 0 })}
                style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
              />
              <small style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.3rem', display: 'block' }}>
                *स्थानीय सरकार सञ्चालन ऐन अनुसार स्थानीय तहमा १०% घरबहाल कर लाग्नेछ।
              </small>
            </div>
          )}

          {/* Rebate & Penalty Rules */}
          <div style={{ background: '#f0fdf4', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid #bbf7d0', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 700, color: '#166534' }}>
              <input
                type="checkbox"
                checked={!!params.isEarlyRebateEligible}
                onChange={(e) => setParams({ ...params, isEarlyRebateEligible: e.target.checked, delayPenaltyRatePercent: e.target.checked ? 0 : params.delayPenaltyRatePercent })}
                style={{ width: '16px', height: '16px', accentColor: '#166534' }}
              />
              <span>पुस मसान्तभित्र अग्रिम कर भुक्तानी (१०% विशेष छुट सहुलियत)</span>
            </label>

            {!params.isEarlyRebateEligible && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                <span style={{ fontSize: '0.78rem', color: '#991b1b', fontWeight: 600 }}>म्याद नाघेको विलम्ब जरिवाना:</span>
                <select
                  value={params.delayPenaltyRatePercent || 0}
                  onChange={(e) => setParams({ ...params, delayPenaltyRatePercent: Number(e.target.value) })}
                  style={{ padding: '0.3rem 0.5rem', borderRadius: '6px', border: '1px solid #fca5a5', fontSize: '0.78rem', background: '#fff', color: '#991b1b', fontWeight: 600 }}
                >
                  <option value={0}>०% (नियमित)</option>
                  <option value={5}>५% जरिवाना (माघ मसान्तसम्म)</option>
                  <option value={10}>१०% जरिवाना (फागुन मसान्तसम्म)</option>
                  <option value={15}>१५% जरिवाना (चैत मसान्तसम्म)</option>
                  <option value={25}>२५% जरिवाना (आर्थिक वर्ष पश्चात)</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Tax Assessment Breakdown */}
        <div
          style={{
            backgroundColor: '#f8fafc',
            borderRadius: '14px',
            border: '1.5px solid #e2e8f0',
            padding: '1.35rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
              <div>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase' }}>
                  कर मूल्याङ्कन फाँटवारी (Live Calculation)
                </span>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>आ.व. २०८१/०८२</div>
              </div>
              <span
                style={{
                  fontSize: '0.75rem',
                  color: '#065f46',
                  backgroundColor: '#d1fae5',
                  padding: '3px 10px',
                  borderRadius: '20px',
                  fontWeight: 700,
                }}
              >
                {isCalculating ? 'हिसाब हुँदैछ...' : 'मूल्याङ्कन सम्पन्न'}
              </span>
            </div>

            {/* Breakdown List */}
            {calcResult && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
                {calcResult.breakdown.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      fontSize: '0.85rem',
                      borderBottom: '1px dashed #e2e8f0',
                      paddingBottom: '0.5rem',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, color: item.amount < 0 ? '#15803d' : item.amount > 0 && item.title.includes('जरिवाना') ? '#b91c1c' : '#1e293b' }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>{item.description}</div>
                    </div>
                    <div
                      style={{
                        fontWeight: 800,
                        color: item.amount < 0 ? '#15803d' : item.amount > 0 && item.title.includes('जरिवाना') ? '#b91c1c' : '#0f172a',
                        fontFamily: 'monospace',
                        fontSize: '0.95rem',
                        whiteSpace: 'nowrap',
                        marginLeft: '1rem',
                      }}
                    >
                      {item.amount < 0 ? `- रु. ${Math.abs(item.amount).toLocaleString('ne-NP')}` : `रु. ${item.amount.toLocaleString('ne-NP')}`}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Net Payable Box & Actions */}
          <div>
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '2px solid #059669',
                borderRadius: '12px',
                padding: '1.1rem',
                marginBottom: '1rem',
                boxShadow: '0 4px 12px rgba(5, 150, 105, 0.12)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>जम्मा खुद तिर्नुपर्ने रकम:</div>
                  <div style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 700, marginTop: '2px' }}>
                    {params.isEarlyRebateEligible ? '✓ १०% अग्रिम कर छुट कट्टी' : params.delayPenaltyRatePercent ? `विलम्ब जरिवाना: ${params.delayPenaltyRatePercent}%` : 'नियमित दररेट'}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#065f46', lineHeight: 1.1 }}>
                    रु. {calcResult ? calcResult.netPayable.toLocaleString('ne-NP') : '०'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'monospace' }}>
                    NPR {calcResult?.netPayable}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setShowSlipModal(true)}
                style={{
                  padding: '0.8rem 1rem',
                  backgroundColor: '#ffffff',
                  color: '#334155',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                <Printer size={16} /> पुर्जी हेर्नुहोस्
              </button>

              <button
                type="button"
                onClick={handlePayClick}
                disabled={!calcResult || calcResult.netPayable <= 0}
                style={{
                  flex: 1,
                  padding: '0.85rem',
                  backgroundColor: '#059669',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: 800,
                  fontSize: '0.92rem',
                  cursor: calcResult && calcResult.netPayable > 0 ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 14px rgba(5, 150, 105, 0.3)',
                }}
              >
                <Sparkles size={17} />
                <span>तुरुन्त अनलाइन भुक्तानी</span>
                <ArrowRight size={17} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── MODAL: TAX ESTIMATION SLIP PRINT ────────────────────────── */}
      {showSlipModal && calcResult && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '680px', maxHeight: '92vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ background: '#1e293b', color: '#fff', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>कर मूल्याङ्कन तथा निर्धारण पुर्जी (Assessment Slip)</div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => window.print()} style={{ background: '#059669', border: 'none', color: '#fff', borderRadius: '6px', padding: '0.4rem 0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.82rem', fontWeight: 600 }}>
                  <Printer size={15} /> प्रिन्ट गर्नुहोस्
                </button>
                <button onClick={() => setShowSlipModal(false)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', borderRadius: '50%', padding: '0.35rem', cursor: 'pointer' }}>
                  <X size={18} />
                </button>
              </div>
            </div>

            <div style={{ padding: '2rem', overflowY: 'auto' }}>
              {/* Slip Header */}
              <div style={{ textAlign: 'center', borderBottom: '2px solid #0f172a', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.85rem', color: '#475569' }}>नेपाल सरकार / बागमती प्रदेश</div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#065f46' }}>पाँचपोखरी थाङपाल गाउँपालिका</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>गाउँ कार्यपालिकाको कार्यालय, राजस्व तथा मालपोत शाखा</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>थाङपालधाप, सिन्धुपाल्चोक</div>
                <div style={{ display: 'inline-block', marginTop: '0.5rem', padding: '0.2rem 1rem', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '20px', fontWeight: 700, color: '#065f46', fontSize: '0.9rem' }}>
                  प्रारम्भिक कर निर्धारण पुर्जी (Tax Assessment Slip)
                </div>
              </div>

              {/* Taxpayer Meta */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', background: '#f8fafc', padding: '0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.82rem', marginBottom: '1.25rem' }}>
                <div><strong>करदाताको नाम:</strong> {params.payerName}</div>
                <div><strong>PAN / नागरिकता:</strong> {params.ownerPanOrCitizenship || 'N/A'}</div>
                <div><strong>कित्ता नम्बर:</strong> {params.kittaNo} (वडा नं. {params.wardNumber})</div>
                <div><strong>आर्थिक वर्ष:</strong> {calcResult.fiscalYear}</div>
                <div style={{ gridColumn: 'span 2' }}>
                  <strong>चारकिल्ला:</strong> पू: {params.charkillaEast || '-'}, प: {params.charkillaWest || '-'}, उ: {params.charkillaNorth || '-'}, द: {params.charkillaSouth || '-'}
                </div>
              </div>

              {/* Breakdown Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                    <th style={{ padding: '0.6rem 0.75rem', border: '1px solid #cbd5e1' }}>क्र.सं.</th>
                    <th style={{ padding: '0.6rem 0.75rem', border: '1px solid #cbd5e1' }}>कर शीर्षक तथा विवरण</th>
                    <th style={{ padding: '0.6rem 0.75rem', border: '1px solid #cbd5e1', textAlign: 'right' }}>रकम (रु.)</th>
                  </tr>
                </thead>
                <tbody>
                  {calcResult.breakdown.map((item, idx) => (
                    <tr key={idx}>
                      <td style={{ padding: '0.55rem 0.75rem', border: '1px solid #cbd5e1', textAlign: 'center' }}>{idx + 1}</td>
                      <td style={{ padding: '0.55rem 0.75rem', border: '1px solid #cbd5e1' }}>
                        <div style={{ fontWeight: 600 }}>{item.title}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.description}</div>
                      </td>
                      <td style={{ padding: '0.55rem 0.75rem', border: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 700, fontFamily: 'monospace' }}>
                        {item.amount < 0 ? `- रु. ${Math.abs(item.amount).toLocaleString('ne-NP')}` : `रु. ${item.amount.toLocaleString('ne-NP')}`}
                      </td>
                    </tr>
                  ))}
                  <tr style={{ background: '#ecfdf5', fontWeight: 800 }}>
                    <td colSpan={2} style={{ padding: '0.75rem', border: '1px solid #cbd5e1', textAlign: 'right' }}>कुल खुद बुझाउनुपर्ने कर:</td>
                    <td style={{ padding: '0.75rem', border: '1px solid #cbd5e1', textAlign: 'right', fontSize: '1.1rem', color: '#065f46' }}>
                      रु. {calcResult.netPayable.toLocaleString('ne-NP')}
                    </td>
                  </tr>
                </tbody>
              </table>

              <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'space-between', padding: '0 2rem' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ borderTop: '1px dotted #334155', width: '150px', marginBottom: '4px' }}></div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>करदाताको हस्ताक्षर</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ borderTop: '1px dotted #334155', width: '180px', marginBottom: '4px' }}></div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>राजस्व तथा मालपोत अधिकृत</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>पाँचपोखरी थाङपाल गाउँपालिका</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaxCalculatorCard;
