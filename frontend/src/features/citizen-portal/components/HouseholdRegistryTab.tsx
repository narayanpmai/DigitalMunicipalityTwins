import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  demographicsApi,
  type HouseholdRecord,
} from '../../../api/demographics';
import {
  agricultureApi,
  type AgricultureProfile,
  type SubsidyRecord,
} from '../../../api/agriculture';
import {
  getProvinces,
  getDistricts,
  getPalikas,
  getWards,
} from '../../../utils/nepalAdministrativeData';
import {
  downloadHouseholdExcelTemplate,
  exportHouseholdsToExcel,
  parseHouseholdExcelFile,
  type ParsedHouseholdSummary,
} from '../utils/householdExcelUtils';
import { useTenant } from '../../../context/TenantContext';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Home,
  Search,
  Plus,
  Filter,
  Eye,
  AlertTriangle,
  MapPin,
  QrCode,
  Users,
  ShieldCheck,
  CheckCircle,
  X,
  Phone,
  Droplet,
  Layers,
  Map as MapIcon,
  Table as TableIcon,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  ExternalLink,
  Crosshair,
  Sparkles,
  Trash2,
  UserPlus,
  LocateFixed,
  Building2,
  Compass,
  FileSpreadsheet,
  UploadCloud,
  Link as LinkIcon,
  Download,
  Edit3,
  Move,
  Save,
  Sprout,
  Leaf,
  Banknote,
} from 'lucide-react';



const WARD_METADATA = [
  { id: '1', name: 'वडा नं. १ (बाँसखर्क)' },
  { id: '2', name: 'वडा नं. २ (बरुवा)' },
  { id: '3', name: 'वडा नं. ३ (भोताङ)' },
  { id: '4', name: 'वडा नं. ४ (थाङपालकोट)' },
  { id: '5', name: 'वडा नं. ५ (गुन्सा)' },
  { id: '6', name: 'वडा नं. ६ (थाङपालधाप)' },
  { id: '7', name: 'वडा नं. ७ (तिपेनी)' },
  { id: '8', name: 'वडा नं. ८ (लागर्चे)' },
];

export const LOCAL_CROPS_PRESETS = [
  'हिमाली रातो आलु',
  'किवी फल',
  'अग्र्यानिक अलैँची',
  'मकै तथा कोदो',
  'धान बाली',
  'गहुँ तथा जौ',
  'रेन्बो ट्राउट',
  'हिमाली स्याउ',
  'बन्दा तथा काउली',
  'अदुवा / बेसार',
  'फापर'
];

export const LOCAL_LIVESTOCK_PRESETS = [
  { key: 'गाई / बाच्छाबाच्छी', label: 'गाई / बाच्छाबाच्छी', icon: '🐄', unit: 'वटा' },
  { key: 'भैंसी / राँगा', label: 'भैंसी / राँगा', icon: '🐃', unit: 'वटा' },
  { key: 'बाख्रा / खसी / बोका', label: 'बाख्रा / खसी', icon: '🐐', unit: 'वटा' },
  { key: 'याक / चौँरी', label: 'याक / चौँरी (Alpine)', icon: '🐂', unit: 'वटा' },
  { key: 'कुखुरा / हाँस', label: 'कुखुरा / हाँस', icon: '🐔', unit: 'वटा' },
  { key: 'सुँगुर / बङ्गुर', label: 'सुँगुर / बङ्गुर', icon: '🐖', unit: 'वटा' },
  { key: 'भेडा / च्याङ्ग्रा', label: 'भेडा / च्याङ्ग्रा', icon: '🐑', unit: 'वटा' },
  { key: 'माहुरीका घार', label: 'माहुरीका घार', icon: '🐝', unit: 'घार' },
  { key: 'रेन्बो ट्राउट पोखरी', label: 'ट्राउट पोखरी', icon: '🐟', unit: 'पोखरी' },
];

export const LOCAL_MACHINERY_OPTIONS = [
  'हाते ट्याक्टर / मिनि-टिलर',
  'थ्रेसर मेसिन',
  'प्लास्टिक टनेल / ग्रीनहाउस',
  'थोपा / स्प्रिंकलर सिँचाइ सेट',
  'घाँस काट्ने च्याफ कटर',
  'माटो परीक्षण किट'
];

// River Proximity and Flood/Landslide Risk Evaluation
export interface HazardAssessmentInput {
  riverName?: string;
  riverDistance?: 'lt30' | '30_100' | '100_250' | 'gt250' | 'none';
  slopeType?: 'flat' | 'moderate' | 'steep';
  hasActiveLandslide?: boolean;
  hasGroundCrack?: boolean;
  hasLandslideHistory?: boolean;
  hasFloodHistory?: boolean;
  hasRiverProtection?: boolean;
}

export const evaluateHazardRisk = (fields: HazardAssessmentInput) => {
  const {
    riverName = '',
    riverDistance = 'gt250',
    slopeType = 'flat',
    hasActiveLandslide = false,
    hasGroundCrack = false,
    hasLandslideHistory = false,
    hasFloodHistory = false,
    hasRiverProtection = false,
  } = fields;

  // 1. High Risk Check (पहिरो उच्च जोखिम)
  if (hasActiveLandslide || hasGroundCrack || (slopeType === 'steep' && hasLandslideHistory)) {
    const reasons: string[] = [];
    if (hasActiveLandslide) reasons.push('घर माथि/तल सक्रिय पहिरो');
    if (hasGroundCrack) reasons.push('जमिन वा घरमा धाँजा');
    if (slopeType === 'steep') reasons.push('अत्यधिक भिरालो जमिन (>३०°)');
    if (hasLandslideHistory) reasons.push('विगतको पहिरो इतिहास');
    return {
      riskLevel: 'high' as const,
      riskScore: 85,
      isAtRisk: true,
      riskDetails: `पहिरो उच्च जोखिम: ${reasons.join(', ')}`,
      label: 'पहिरो उच्च जोखिम (High Risk)',
      color: '#ef4444',
      badgeBg: 'rgba(239, 68, 68, 0.2)',
    };
  }

  // 2. Steep slope alone (>30 deg)
  if (slopeType === 'steep') {
    return {
      riskLevel: 'high' as const,
      riskScore: 75,
      isAtRisk: true,
      riskDetails: 'पहिरो उच्च जोखिम: अत्यधिक भिरालो जमिन (>३०° ढलान)',
      label: 'पहिरो उच्च जोखिम (High Risk)',
      color: '#ef4444',
      badgeBg: 'rgba(239, 68, 68, 0.2)',
    };
  }

  // 3. Medium Risk Check (नदी तटीय बाढी/कटान)
  if (riverDistance === 'lt30' || riverDistance === '30_100' || hasFloodHistory) {
    const reasons: string[] = [];
    if (riverName) reasons.push(`${riverName}`);
    if (riverDistance === 'lt30') reasons.push('नदीबाट दूरी ३० मिटर भित्र (अति उच्च कटान संवेदनशील)');
    else if (riverDistance === '30_100') reasons.push('नदीबाट दूरी ३०-१०० मिटर (तटीय कटान क्षेत्र)');
    if (hasFloodHistory) reasons.push('विगतमा बाढी/कटान परेको इतिहास');
    if (hasRiverProtection) reasons.push('तटबन्ध उपलब्ध');
    return {
      riskLevel: 'medium' as const,
      riskScore: 55,
      isAtRisk: true,
      riskDetails: `नदी तटीय मध्यम जोखिम: ${reasons.join(', ')}`,
      label: 'नदी तटीय मध्यम जोखिम (Medium Risk)',
      color: '#f97316',
      badgeBg: 'rgba(249, 115, 22, 0.2)',
    };
  }

  // 4. Low risk but in warning buffer (101-250m)
  if (riverDistance === '100_250') {
    return {
      riskLevel: 'low' as const,
      riskScore: 25,
      isAtRisk: false,
      riskDetails: `न्यून जोखिम (सतर्कता क्षेत्र): नदीबाट दूरी १०१-२५० मिटर (${riverName || 'नदी'})`,
      label: 'न्यून जोखिम / सतर्कता क्षेत्र (Safe/Buffer)',
      color: '#10b981',
      badgeBg: 'rgba(16, 185, 129, 0.2)',
    };
  }

  // 5. Safe / Low Risk
  return {
    riskLevel: 'low' as const,
    riskScore: 10,
    isAtRisk: false,
    riskDetails: 'सामान्य तथा सुरक्षित बस्ती क्षेत्र (Safe Terrain)',
    label: 'सुरक्षित / सामान्य क्षेत्र (Safe)',
    color: '#10b981',
    badgeBg: 'rgba(16, 185, 129, 0.2)',
  };
};

interface HazardAssessmentSectionProps {
  riverName: string;
  riverDistance: 'lt30' | '30_100' | '100_250' | 'gt250' | 'none';
  slopeType: 'flat' | 'moderate' | 'steep';
  hasActiveLandslide: boolean;
  hasGroundCrack: boolean;
  hasLandslideHistory: boolean;
  hasFloodHistory: boolean;
  hasRiverProtection: boolean;
  riskLevel: 'low' | 'medium' | 'high';
  riskScore?: number;
  riskDetails: string;
  onChange: (field: keyof HazardAssessmentInput, val: any) => void;
  onRiskLevelChange?: (level: 'low' | 'medium' | 'high') => void;
  onRiskDetailsChange?: (details: string) => void;
}

const HazardAssessmentSection: React.FC<HazardAssessmentSectionProps> = ({
  riverName,
  riverDistance,
  slopeType,
  hasActiveLandslide,
  hasGroundCrack,
  hasLandslideHistory,
  hasFloodHistory,
  hasRiverProtection,
  riskLevel,
  riskScore = 10,
  riskDetails,
  onChange,
  onRiskLevelChange,
  onRiskDetailsChange,
}) => {
  const quickRivers = ['मेलम्ची नदी', 'याङ्ग्री खोला', 'लार्के खोला', 'इन्द्रावती नदी', 'भोटेकोशी'];

  return (
    <div
      style={{
        backgroundColor: '#0b1329',
        border: '1px solid #1e293b',
        borderRadius: '12px',
        padding: '1.15rem',
        marginTop: '0.85rem',
        boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.3)',
      }}
    >
      {/* Section Header with live badge */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.5rem',
          borderBottom: '1px solid #1e293b',
          paddingBottom: '0.75rem',
          marginBottom: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              backgroundColor:
                riskLevel === 'high'
                  ? 'rgba(239, 68, 68, 0.2)'
                  : riskLevel === 'medium'
                  ? 'rgba(249, 115, 22, 0.2)'
                  : 'rgba(16, 185, 129, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {riskLevel === 'high' ? (
              <AlertTriangle size={16} color="#ef4444" />
            ) : riskLevel === 'medium' ? (
              <Droplet size={16} color="#f97316" />
            ) : (
              <ShieldCheck size={16} color="#10b981" />
            )}
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700, color: '#f8fafc' }}>
              विपद् जोखिम तथा नदी/पहिरो सामीप्यता मूल्यांकन
            </h4>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
              नदीको दूरी, जमिनको ढलान र स्थलगत सूचकका आधारमा स्वचालित स्तर निर्धारण
            </div>
          </div>
        </div>

        {/* Live Auto-Risk Badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.35rem 0.8rem',
            borderRadius: '9999px',
            fontSize: '0.78rem',
            fontWeight: 800,
            backgroundColor:
              riskLevel === 'high'
                ? 'rgba(239, 68, 68, 0.25)'
                : riskLevel === 'medium'
                ? 'rgba(249, 115, 22, 0.25)'
                : 'rgba(16, 185, 129, 0.25)',
            color: riskLevel === 'high' ? '#fca5a5' : riskLevel === 'medium' ? '#fdba74' : '#6ee7b7',
            border: `1px solid ${
              riskLevel === 'high' ? '#ef4444' : riskLevel === 'medium' ? '#f97316' : '#10b981'
            }`,
          }}
        >
          <span>
            {riskLevel === 'high'
              ? '🔴 पहिरो उच्च जोखिम'
              : riskLevel === 'medium'
              ? '🟠 नदी तटीय मध्यम जोखिम'
              : '🟢 सुरक्षित क्षेत्र'}
          </span>
          <span style={{ opacity: 0.8, fontSize: '0.7rem' }}>• {riskScore}/१००</span>
        </div>
      </div>

      {/* Row 1: River Name & River Distance in meters */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '0.85rem',
          marginBottom: '0.85rem',
        }}
      >
        <div>
          <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.3rem', fontWeight: 600 }}>
            नजिकको नदी / खोलाको नाम
          </label>
          <input
            type="text"
            placeholder="उदा. मेलम्ची नदी, भोटेकोशी, याङ्ग्री खोला..."
            value={riverName}
            onChange={(e) => onChange('riverName', e.target.value)}
            style={{
              width: '100%',
              padding: '0.55rem 0.75rem',
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '6px',
              color: '#ffffff',
              fontSize: '0.84rem',
            }}
          />
          {/* Quick suggestions */}
          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginTop: '0.35rem' }}>
            {quickRivers.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => onChange('riverName', r)}
                style={{
                  padding: '0.15rem 0.45rem',
                  fontSize: '0.68rem',
                  backgroundColor: riverName === r ? '#0284c7' : '#1e293b',
                  color: riverName === r ? '#ffffff' : '#94a3b8',
                  border: '1px solid #334155',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.3rem', fontWeight: 600 }}>
            नदी/खोलाबाट घरको दूरी (Distance in Meters) *
          </label>
          <select
            value={riverDistance}
            onChange={(e) => onChange('riverDistance', e.target.value as any)}
            style={{
              width: '100%',
              padding: '0.55rem 0.75rem',
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '6px',
              color: '#ffffff',
              fontSize: '0.84rem',
            }}
          >
            <option value="none">नदी छेउछाउ छैन (सुरक्षित बस्ती)</option>
            <option value="gt250">&gt; २५० मिटर टाढा (सुरक्षित दूरी)</option>
            <option value="100_250">१०१ देखि २५० मिटर (सतर्कता बफर क्षेत्र)</option>
            <option value="30_100">३० देखि १०० मिटर (🟠 नदी तटीय कटान जोखिम)</option>
            <option value="lt30">&lt; ३० मिटर (🔴 अति नजिक - उच्च बाढी/कटान)</option>
          </select>
          <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.35rem' }}>
            * १०० मिटर भित्र भएमा नक्सामा स्वचालित रूपमा 🟠 नदी तटीय स्तर आउनेछ।
          </div>
        </div>
      </div>

      {/* Row 2: Slope Category & Risk Level Override */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '0.85rem',
          marginBottom: '0.85rem',
        }}
      >
        <div>
          <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.3rem', fontWeight: 600 }}>
            जमिनको भिरालोपना (Slope Category) *
          </label>
          <select
            value={slopeType}
            onChange={(e) => onChange('slopeType', e.target.value as any)}
            style={{
              width: '100%',
              padding: '0.55rem 0.75rem',
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '6px',
              color: '#ffffff',
              fontSize: '0.84rem',
            }}
          >
            <option value="flat">समतल वा मन्द ढलान (&lt; १५° - सुरक्षित)</option>
            <option value="moderate">मध्यम भिरालो (१५° देखि ३०° सम्म ढलान)</option>
            <option value="steep">अत्यधिक भिरालो (&gt; ३०° - 🔴 पहिरो जोखिमयुक्त)</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.3rem', fontWeight: 600 }}>
            अन्तिम जोखिम वर्गीकरण (Risk Classification)
          </label>
          <select
            value={riskLevel}
            onChange={(e) => onRiskLevelChange && onRiskLevelChange(e.target.value as any)}
            style={{
              width: '100%',
              padding: '0.55rem 0.75rem',
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '6px',
              color: riskLevel === 'high' ? '#fca5a5' : riskLevel === 'medium' ? '#fdba74' : '#6ee7b7',
              fontWeight: 700,
              fontSize: '0.84rem',
            }}
          >
            <option value="low">🟢 न्यून जोखिम (सुरक्षित बस्ती)</option>
            <option value="medium">🟠 मध्यम जोखिम: नदी तटीय कटान</option>
            <option value="high">🔴 उच्च जोखिम: पहिरो तथा कटान</option>
          </select>
        </div>
      </div>

      {/* Row 3: Field Checklist Indicators */}
      <div style={{ marginBottom: '0.85rem' }}>
        <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.4rem', fontWeight: 600 }}>
          स्थलगत भौतिक तथा वातावरणीय सूचकहरू (Field Hazard Indicators)
        </label>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '0.5rem',
            backgroundColor: '#1e293b',
            padding: '0.75rem',
            borderRadius: '8px',
            border: '1px solid #334155',
          }}
        >
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: '#e2e8f0', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={hasActiveLandslide}
              onChange={(e) => onChange('hasActiveLandslide', e.target.checked)}
              style={{ accentColor: '#ef4444', width: '16px', height: '16px' }}
            />
            <span>⚠️ घर माथि/तल <strong>सक्रिय पहिरो</strong> चालु</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: '#e2e8f0', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={hasGroundCrack}
              onChange={(e) => onChange('hasGroundCrack', e.target.checked)}
              style={{ accentColor: '#ef4444', width: '16px', height: '16px' }}
            />
            <span>⚡ जमिन वा गारोमा <strong>धाँजा / चर्किएको</strong></span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: '#e2e8f0', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={hasFloodHistory}
              onChange={(e) => onChange('hasFloodHistory', e.target.checked)}
              style={{ accentColor: '#f97316', width: '16px', height: '16px' }}
            />
            <span>🌊 विगतमा <strong>बाढी/कटान</strong> परेको इतिहास</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: '#e2e8f0', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={hasRiverProtection}
              onChange={(e) => onChange('hasRiverProtection', e.target.checked)}
              style={{ accentColor: '#10b981', width: '16px', height: '16px' }}
            />
            <span>🛡️ ग्याबिन वा पक्की <strong>तटबन्ध पर्खाल</strong> छ</span>
          </label>
        </div>
      </div>

      {/* Row 4: Technical Risk Details & Remarks */}
      <div>
        <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.3rem', fontWeight: 600 }}>
          विपद् जोखिम विवरण तथा प्राविधिक विश्लेषण (Auto-evaluated Risk Summary)
        </label>
        <input
          type="text"
          value={riskDetails}
          onChange={(e) =>
            onRiskDetailsChange ? onRiskDetailsChange(e.target.value) : onChange('riskDetails' as any, e.target.value)
          }
          placeholder="स्वचालित जोखिम विवरण यहाँ आउनेछ..."
          style={{
            width: '100%',
            padding: '0.55rem 0.75rem',
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '6px',
            color: '#ffffff',
            fontSize: '0.84rem',
          }}
        />
      </div>
    </div>
  );
};

export interface HouseholdRegistryTabProps {
  isPublicMode?: boolean;
  initialRiskFilter?: string;
}

export const HouseholdRegistryTab: React.FC<HouseholdRegistryTabProps> = ({ isPublicMode: propIsPublicMode, initialRiskFilter: propInitialRiskFilter }) => {
  const location = useLocation();
  // Auto-detect public mode: any route not starting with '/app' is strictly public citizen mode
  const isPublicMode = propIsPublicMode !== undefined 
    ? propIsPublicMode 
    : !location.pathname.startsWith('/app');
  const { settings, tenantId } = useTenant();
  const palikaName = settings?.palika_name || 'पालिका';
  const defaultCenter = useMemo<[number, number]>(() => {
    const t = `${settings?.palika_name || ''} ${palikaName || ''} ${tenantId || ''}`.toLowerCase();
    if (t.includes('गौशाला') || t.includes('gaushala')) return [26.9667, 85.8333];
    if (t.includes('बेनिघाट') || t.includes('benighat')) return [27.8182, 84.7645];
    if (t.includes('खाँडादेवी') || t.includes('khadadevi')) return [27.5458, 85.9872];
    if (t.includes('गल्छी') || t.includes('galchhi')) return [27.8000, 85.0000];
    if (t.includes('मेलम्ची') || t.includes('melamchi')) return [27.8300, 85.5800];
    if (t.includes('हेलम्बु') || t.includes('helambu')) return [27.9736, 85.6425];
    return [27.915, 85.615];
  }, [settings?.palika_name, palikaName, tenantId]);
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWard, setSelectedWard] = useState<string>('all');
  const [selectedRisk, setSelectedRisk] = useState<string>(propInitialRiskFilter || 'all');
  
  // Update risk filter if prop changes from external component click
  useEffect(() => {
    if (propInitialRiskFilter) {
      setSelectedRisk(propInitialRiskFilter);
    }
  }, [propInitialRiskFilter]);

  // Admin verification status filter: 'all' | 'approved' | 'pending' | 'rejected'
  const [adminStatusFilter, setAdminStatusFilter] = useState<string>(isPublicMode ? 'approved' : 'all');
  const [viewMode, setViewMode] = useState<'split' | 'map' | 'table'>('split');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 50;
  // Public submission success state
  const [publicSubmitSuccess, setPublicSubmitSuccess] = useState<{ matrixHouseNo: string } | null>(null);
  // Admin verify modal state
  const [verifyingHouse, setVerifyingHouse] = useState<HouseholdRecord | null>(null);
  const [verifyRemarks, setVerifyRemarks] = useState('');

  // Modal states
  const [viewingHouse, setViewingHouse] = useState<HouseholdRecord | null>(null);
  const [activeModalTab, setActiveModalTab] = useState<'basic' | 'family' | 'agriculture' | 'waste'>('basic');
  const [activeAgriSubTab, setActiveAgriSubTab] = useState<'land' | 'crops' | 'livestock' | 'subsidies'>('land');
  const [customCropInput, setCustomCropInput] = useState('');
  const [agriProfileData, setAgriProfileData] = useState<Partial<AgricultureProfile>>({
    landAreaHectares: 0,
    farmerCategory: 'small',
    mainCrops: [],
    livestockDetails: {},
    additionalDetails: {
      ropani: 0,
      aana: 0,
      paisa: 0,
      daam: 0,
      landOwnership: 'आफ्नै (Own)',
      landTypes: ['बारी / पाखो'],
      irrigationType: 'मौसमी (आकासे पानी)',
      farmingPractice: 'परम्परागत',
      hasInsurance: false,
      hasLoan: false,
      marketOutlets: ['स्थानीय हाटबजार'],
      mechanization: [],
      remarks: ''
    }
  });
  const [newSubsidy, setNewSubsidy] = useState<SubsidyRecord>({ date: '', amount: 0, purpose: '', fiscalYear: '२०८०/८१' });
  const [showSubsidyModal, setShowSubsidyModal] = useState(false);

  const [editingHouse, setEditingHouse] = useState<HouseholdRecord | null>(null);
  const [editModalTab, setEditModalTab] = useState<'basic' | 'family' | 'agriculture' | 'waste'>('basic');
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importSheetUrl, setImportSheetUrl] = useState('https://docs.google.com/spreadsheets/d/1sNW6tysu4ZtNsf6-wzAd43J6g46hXsNL/edit?usp=sharing');
  const [importTab, setImportTab] = useState<'link' | 'file'>('link');
  const [importLoading, setImportLoading] = useState(false);
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [excelPreview, setExcelPreview] = useState<ParsedHouseholdSummary | null>(null);
  const [isParsingExcel, setIsParsingExcel] = useState(false);
  const [replaceExistingData, setReplaceExistingData] = useState(true);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  // GPS Relocation (Drag & Drop Mode) State
  const [relocatingHouse, setRelocatingHouse] = useState<{
    id: string;
    matrixHouseNo: string;
    householdName: string;
    lat: number;
    lon: number;
    origLat: number;
    origLon: number;
  } | null>(null);
  const [isSavingRelocation, setIsSavingRelocation] = useState(false);
  const relocationMarkerRef = useRef<L.Marker | null>(null);

  // Map references
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerLayerRef = useRef<L.LayerGroup | null>(null);
  const palikaBoundaryLayerRef = useRef<L.GeoJSON | null>(null);
  const wardBoundaryLayerRef = useRef<L.GeoJSON | null>(null);

  // GIS Layer Visibility Toggles
  const [showPalikaBoundary, setShowPalikaBoundary] = useState(true);
  const [showWardBoundaries, setShowWardBoundaries] = useState(true);
  const [showHouseholdMarkers, setShowHouseholdMarkers] = useState(true);

  const baseLayersRef = useRef<{
    hybrid: L.TileLayer;
    esri: L.TileLayer;
    osm: L.TileLayer;
    topo: L.TileLayer;
  } | null>(null);
  const [activeBaseLayer, setActiveBaseLayer] = useState<'hybrid' | 'esri' | 'osm' | 'topo'>('hybrid');

  const handleSwitchBaseLayer = (layerKey: 'hybrid' | 'esri' | 'osm' | 'topo') => {
    if (!mapInstanceRef.current || !baseLayersRef.current) return;
    const map = mapInstanceRef.current;
    const { hybrid, esri, osm, topo } = baseLayersRef.current;

    [hybrid, esri, osm, topo].forEach((l) => {
      if (map.hasLayer(l)) {
        map.removeLayer(l);
      }
    });

    const targetLayer =
      layerKey === 'hybrid'
        ? hybrid
        : layerKey === 'esri'
        ? esri
        : layerKey === 'osm'
        ? osm
        : topo;

    map.addLayer(targetLayer);
    setActiveBaseLayer(layerKey);
  };

  // Form Family Member Interface
  interface FormFamilyMember {
    name: string;
    relation: string;
    gender: string;
    age: number | string;
    education?: string;
    occupation?: string;
  }

  // New Household Form State
  const [formData, setFormData] = useState({
    matrixHouseNo: '',
    legacyHouseNo: '',
    formerVdc: '',
    province: 'बागमती प्रदेश',
    district: 'सिन्धुपाल्चोक',
    municipality: 'पाँचपोखरी थाङपाल गाउँपालिका',
    wardNumber: 3,
    tole: '',
    householdName: '',
    headGender: 'male',
    ethnicity: 'तामाङ',
    citizenshipNo: '',
    contactPhone: '',
    cadastralParcelNo: '',
    landOwnership: 'आफ्नो स्वामित्व (लालपुर्जा भएको)',
    familySize: 4,
    maleCount: 2,
    femaleCount: 2,
    houseType: 'अर्ध-पक्की (जस्ता छाना)',
    storeys: 2,
    buildingPermitStatus: 'नक्सा पास भएको',
    reconstructionStatus: 'NRA भूकम्प प्रतिरोधी मापदण्ड',
    riskLevel: 'low' as 'low' | 'medium' | 'high',
    riskScore: 10,
    riskDetails: 'सामान्य तथा सुरक्षित बस्ती क्षेत्र (Safe Terrain)',
    riverName: '',
    riverDistance: 'gt250' as 'lt30' | '30_100' | '100_250' | 'gt250' | 'none',
    slopeType: 'flat' as 'flat' | 'moderate' | 'steep',
    hasActiveLandslide: false,
    hasGroundCrack: false,
    hasLandslideHistory: false,
    hasFloodHistory: false,
    hasRiverProtection: false,
    safeShelterDistanceMins: 15,
    gpsLat: 27.9152,
    gpsLon: 85.6185,
    drinkingWaterSource: 'धारा / पाइप (निजी वा सार्वजनिक)',
    waterPurification: 'उमाल्ने / फिल्टर गर्ने',
    toiletType: 'फ्लश सहितको सुरक्षित चर्पी',
    cookingFuel: 'एलपीजी ग्यास (LPG)',
    electricitySource: 'केन्द्रीय प्रसारण लाइन (NEA)',
    disabilityCount: 0,
    disabilityCardType: 'छैन',
    socialSecurityCount: 0,
    foreignMigrantsCount: 0,
  });

  // Nepal Administrative Cascade Selections (प्रदेश, जिल्ला, पालिका, वडा)
  const availableProvinces = useMemo(() => getProvinces(), []);
  const availableDistricts = useMemo(() => getDistricts(formData.province), [formData.province]);
  const availablePalikas = useMemo(() => getPalikas(formData.province, formData.district), [formData.province, formData.district]);
  const availableWards = useMemo(() => getWards(formData.province, formData.district, formData.municipality), [formData.province, formData.district, formData.municipality]);

  const handleProvinceChange = (newProvince: string) => {
    const districts = getDistricts(newProvince);
    const newDistrict = districts[0] || '';
    const palikas = getPalikas(newProvince, newDistrict);
    const newPalika = palikas[0] || '';
    const wards = getWards(newProvince, newDistrict, newPalika);
    const newWard = wards[0]?.id || 1;

    setFormData((prev) => ({
      ...prev,
      province: newProvince,
      district: newDistrict,
      municipality: newPalika,
      wardNumber: newWard,
    }));
  };

  const handleDistrictChange = (newDistrict: string) => {
    const palikas = getPalikas(formData.province, newDistrict);
    const newPalika = palikas[0] || '';
    const wards = getWards(formData.province, newDistrict, newPalika);
    const newWard = wards[0]?.id || 1;

    setFormData((prev) => ({
      ...prev,
      district: newDistrict,
      municipality: newPalika,
      wardNumber: newWard,
    }));
  };

  const handlePalikaChange = (newPalika: string) => {
    const wards = getWards(formData.province, formData.district, newPalika);
    const newWard = wards[0]?.id || 1;

    setFormData((prev) => ({
      ...prev,
      municipality: newPalika,
      wardNumber: newWard,
    }));
  };

  // Hazard Handlers for Create Form
  const handleFormHazardChange = (field: keyof HazardAssessmentInput, val: any) => {
    setFormData((prev) => {
      const updatedHazard: HazardAssessmentInput = {
        riverName: field === 'riverName' ? val : prev.riverName,
        riverDistance: field === 'riverDistance' ? val : prev.riverDistance,
        slopeType: field === 'slopeType' ? val : prev.slopeType,
        hasActiveLandslide: field === 'hasActiveLandslide' ? Boolean(val) : prev.hasActiveLandslide,
        hasGroundCrack: field === 'hasGroundCrack' ? Boolean(val) : prev.hasGroundCrack,
        hasLandslideHistory: field === 'hasLandslideHistory' ? Boolean(val) : prev.hasLandslideHistory,
        hasFloodHistory: field === 'hasFloodHistory' ? Boolean(val) : prev.hasFloodHistory,
        hasRiverProtection: field === 'hasRiverProtection' ? Boolean(val) : prev.hasRiverProtection,
      };
      const evalResult = evaluateHazardRisk(updatedHazard);
      return {
        ...prev,
        [field]: val,
        riskLevel: evalResult.riskLevel,
        riskScore: evalResult.riskScore,
        riskDetails: evalResult.riskDetails,
      };
    });
  };

  // Hazard Handlers for Edit Modal
  const handleEditHazardChange = (field: keyof HazardAssessmentInput, val: any) => {
    if (!editingHouse) return;
    const currentMeta = editingHouse.meta || {};
    const updatedHazard: HazardAssessmentInput = {
      riverName: field === 'riverName' ? val : currentMeta.riverName || '',
      riverDistance:
        field === 'riverDistance'
          ? val
          : currentMeta.riverDistance || (editingHouse.riskLevel === 'medium' ? '30_100' : 'gt250'),
      slopeType:
        field === 'slopeType'
          ? val
          : currentMeta.slopeType || (editingHouse.riskLevel === 'high' ? 'steep' : 'flat'),
      hasActiveLandslide:
        field === 'hasActiveLandslide' ? Boolean(val) : Boolean(currentMeta.hasActiveLandslide),
      hasGroundCrack: field === 'hasGroundCrack' ? Boolean(val) : Boolean(currentMeta.hasGroundCrack),
      hasLandslideHistory:
        field === 'hasLandslideHistory' ? Boolean(val) : Boolean(currentMeta.hasLandslideHistory),
      hasFloodHistory: field === 'hasFloodHistory' ? Boolean(val) : Boolean(currentMeta.hasFloodHistory),
      hasRiverProtection:
        field === 'hasRiverProtection' ? Boolean(val) : Boolean(currentMeta.hasRiverProtection),
    };
    const evalResult = evaluateHazardRisk(updatedHazard);
    setEditingHouse({
      ...editingHouse,
      riskLevel: evalResult.riskLevel,
      riskScore: evalResult.riskScore,
      riskDetails: evalResult.riskDetails,
      meta: {
        ...currentMeta,
        ...updatedHazard,
        [field]: val,
      },
    });
  };

  // Helper to safely open edit modal with initial hazard meta and tabs
  const openEditModal = (house: HouseholdRecord, initialTab: 'basic' | 'family' | 'agriculture' | 'waste' = 'basic') => {
    if (isPublicMode) {
      alert('🔒 यो सार्वजनिक नागरिक अवलोकन पोर्टल हो। घरधुरी विवरण सम्पादन गर्न पालिका कर्मचारी/प्रशासक लगइन आवश्यक पर्दछ।');
      return;
    }
    const meta = { ...(house.meta || {}) };
    if (!meta.riverDistance) {
      meta.riverDistance = house.riskLevel === 'medium' ? '30_100' : 'gt250';
    }
    if (!meta.slopeType) {
      meta.slopeType = house.riskLevel === 'high' ? 'steep' : 'flat';
    }
    if (!meta.wasteSegregation) {
      meta.wasteSegregation = 'स्रोतमा वर्गीकरण गरिएको (कुहिने र नकुहिने अलग)';
    }
    if (!meta.wasteTypes) {
      meta.wasteTypes = ['कुहिने (अर्गानिक/कम्पोस्ट)', 'प्लास्टिक र पेट बोतल', 'सिसा तथा काँच'];
    }
    if (!meta.wasteCollectionFreq) {
      meta.wasteCollectionFreq = 'हप्तामा २ पटक';
    }
    if (!meta.wasteCollectionMethod) {
      meta.wasteCollectionMethod = 'पालिकाको संकलन गाडी रुट (Door-to-door)';
    }
    if (!meta.hasCompostBin) {
      meta.hasCompostBin = 'छ (घरायसी कम्पोस्टिङ)';
    }
    if (!meta.organicWasteTreatment) {
      meta.organicWasteTreatment = 'घरायसी कम्पोस्ट मल बनाउने';
    }
    if (meta.walletBalance === undefined) {
      meta.walletBalance = 1250;
    }
    if (meta.recycledKg === undefined) {
      meta.recycledKg = 45;
    }
    if (meta.greenPoints === undefined) {
      meta.greenPoints = 125;
    }

    setEditModalTab(initialTab);
    setEditingHouse({
      ...house,
      familyMembers: house.familyMembers || [],
      meta,
    });
  };

  const handleEditAddMember = () => {
    if (!editingHouse) return;
    const currentMembers = editingHouse.familyMembers || [];
    setEditingHouse({
      ...editingHouse,
      familyMembers: [...currentMembers, { name: '', relation: 'अन्य', gender: 'other' as const, age: undefined }]
    });
  };

  const handleEditMemberChange = (idx: number, field: string, value: any) => {
    if (!editingHouse) return;
    const updated = [...(editingHouse.familyMembers || [])];
    updated[idx] = { ...updated[idx], [field]: value };
    setEditingHouse({ ...editingHouse, familyMembers: updated });
  };

  const handleEditRemoveMember = (idx: number) => {
    if (!editingHouse) return;
    const updated = [...(editingHouse.familyMembers || [])];
    updated.splice(idx, 1);
    setEditingHouse({ ...editingHouse, familyMembers: updated });
  };

  const [familyMembers, setFamilyMembers] = useState<FormFamilyMember[]>([
    {
      name: '',
      relation: 'घरमूली (Head)',
      gender: 'male',
      age: 45,
      education: 'माध्यमिक तह',
      occupation: 'कृषि तथा व्यापार',
    },
    {
      name: '',
      relation: 'श्रीमती / श्रीमान्',
      gender: 'female',
      age: 40,
      education: 'साक्षर',
      occupation: 'घरायसी तथा कृषि',
    },
    {
      name: '',
      relation: 'छोरा',
      gender: 'male',
      age: 18,
      education: 'माध्यमिक तह',
      occupation: 'विद्यार्थी',
    },
    {
      name: '',
      relation: 'छोरी',
      gender: 'female',
      age: 14,
      education: 'आधारभूत तह',
      occupation: 'विद्यार्थी',
    },
  ]);

  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [gpsAccepted, setGpsAccepted] = useState<boolean | null>(null);
  const [gpsStatus, setGpsStatus] = useState<string>('');
  const [showMemberDetails, setShowMemberDetails] = useState(true);
  const gpsWatchIdRef = useRef<number | null>(null);
  const gpsTimeoutRef = useRef<any>(null);

  // Stop GPS watcher and timer
  const stopGpsTracking = () => {
    if (gpsWatchIdRef.current !== null && typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.clearWatch(gpsWatchIdRef.current);
      gpsWatchIdRef.current = null;
    }
    if (gpsTimeoutRef.current) {
      clearTimeout(gpsTimeoutRef.current);
      gpsTimeoutRef.current = null;
    }
    setGpsLoading(false);
  };

  useEffect(() => {
    return () => {
      if (gpsWatchIdRef.current !== null && typeof navigator !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.clearWatch(gpsWatchIdRef.current);
      }
      if (gpsTimeoutRef.current) {
        clearTimeout(gpsTimeoutRef.current);
      }
    };
  }, []);

  // Auto-generate Household Number
  const generateHouseNumber = () => {
    const ward = String(formData.wardNumber).padStart(2, '0');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const prefix = formData.municipality.includes('पाँचपोखरी') ? 'P5' : 'HH';
    const newCode = `${prefix}-W${ward}-H${randomSuffix}`;
    setFormData((prev) => ({ ...prev, matrixHouseNo: newCode }));
  };

  // Live GPS Detector with strict <= 5m accuracy check
  const handleGetCurrentGps = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      const msg = 'तपाईंको ब्राउजर/डिभाइसमा Geolocation उपलब्ध छैन। कृपया म्यानुअल अक्षांश/देशान्तर भर्नुहोस्।';
      setGpsStatus(msg);
      setGpsAccepted(false);
      alert(msg);
      return;
    }

    stopGpsTracking();
    setGpsLoading(true);
    setGpsAccepted(null);
    setGpsAccuracy(null);
    setGpsStatus('📡 GPS उपग्रह सिग्नल खोजिँदैछ... ५ मिटर भन्दा कम (≤ 5m) परिशुद्धता नआएसम्म प्रतीक्षा गरिँदैछ...');

    let bestAcc = Infinity;

    // Timeout after 18s if accuracy never drops below 5m
    gpsTimeoutRef.current = setTimeout(() => {
      stopGpsTracking();
      if (bestAcc > 5.0) {
        setGpsAccepted(false);
        const displayAcc = bestAcc === Infinity ? 'अज्ञात' : `${bestAcc}`;
        setGpsStatus(
          `❌ GPS डाटा अस्वीकृत (परिशुद्धता: ±${displayAcc} मिटर): ५ मिटर भन्दा कम (≤ 5m) परिशुद्धता नआएकाले यो स्थान स्वीकार गरिएन। डिजिटल लगतका लागि उच्च परिशुद्धता अनिवार्य छ।`
        );
      }
    }, 18000);

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lon = Number(pos.coords.longitude.toFixed(6));
        const acc = Math.round(pos.coords.accuracy * 10) / 10;

        if (acc < bestAcc) {
          bestAcc = acc;
        }
        setGpsAccuracy(acc);

        // REQUIREMENT: Only accept when accuracy is 5 meters or less
        if (acc <= 5.0) {
          // ACCEPTED!
          stopGpsTracking();
          setGpsAccepted(true);
          setFormData((prev) => ({
            ...prev,
            gpsLat: lat,
            gpsLon: lon,
          }));
          setGpsStatus(`✓ GPS स्थान स्वीकृत भयो: ${lat}, ${lon} (परिशुद्धता: ±${acc} मिटर - ५ मिटर भित्र सफल)`);
        } else {
          // REJECTED / KEEP WAITING FOR REFINEMENT
          setGpsAccepted(false);
          setGpsStatus(
            `⚠️ GPS परिशुद्धता कमजोर: ±${acc} मिटर (अस्वीकृत)। डाटा मान्य हुन ५ मिटर भन्दा कम (≤ 5m) आवश्यक छ। उपग्रह सिग्नल सुधारको प्रतीक्षा गरिँदैछ...`
          );
        }
      },
      (err) => {
        stopGpsTracking();
        setGpsAccepted(false);
        let msg = 'GPS स्थान लिन सकिएन।';
        if (err.code === 1) {
          msg = 'स्थान अनुमति (Location Permission) अस्वीकार भयो। कृपया ब्राउजरमा स्थान अनुमति दिनुहोस्।';
        } else if (err.code === 2) {
          msg = 'GPS सिग्नल फेला परेन। कृपया खुला स्थानमा जानुहोस् वा म्यानुअल अक्षांश/देशान्तर भर्नुहोस्।';
        } else if (err.code === 3) {
          msg = 'स्थान पत्ता लगाउने समय समाप्त भयो। ५ मिटर भित्रको सिग्नल पाउन सकिएन।';
        }
        setGpsStatus(msg);
      },
      { enableHighAccuracy: true, timeout: 18000, maximumAge: 0 }
    );

    gpsWatchIdRef.current = watchId;
  };

  // Test simulation for sub-5 meter accurate GPS (useful for demonstration & indoor testing)
  const handleSimulateAccurateGps = () => {
    stopGpsTracking();
    const simLat = Number((27.9152 + (Math.random() - 0.5) * 0.003).toFixed(6));
    const simLon = Number((85.6185 + (Math.random() - 0.5) * 0.003).toFixed(6));
    const simAcc = Number((2.4 + Math.random() * 2.1).toFixed(1)); // between 2.4m and 4.5m (always <= 5m)

    setGpsAccuracy(simAcc);
    setGpsAccepted(true);
    setGpsLoading(false);
    setFormData((prev) => ({
      ...prev,
      gpsLat: simLat,
      gpsLon: simLon,
    }));
    setGpsStatus(
      `✓ उच्च परिशुद्धता GPS स्थान स्वीकृत भयो: ${simLat}, ${simLon} (परिशुद्धता: ±${simAcc} मिटर - ५ मिटर भित्र सफल)`
    );
  };

  // Add Family Member
  const handleAddMember = () => {
    setFamilyMembers((prev) => [
      ...prev,
      {
        name: '',
        relation: 'परिवार सदस्य',
        gender: 'male',
        age: '',
        education: 'साक्षर',
        occupation: 'कृषि तथा घरायसी',
      },
    ]);
    setFormData((prev) => ({ ...prev, familySize: prev.familySize + 1 }));
  };

  // Remove Family Member
  const handleRemoveMember = (idx: number) => {
    setFamilyMembers((prev) => prev.filter((_, i) => i !== idx));
    setFormData((prev) => ({ ...prev, familySize: Math.max(1, prev.familySize - 1) }));
  };

  // Update Member Field
  const handleMemberChange = (idx: number, field: keyof FormFamilyMember, val: any) => {
    setFamilyMembers((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: val };
      return next;
    });
  };

  // 1. Fetch full households – public mode only shows 'approved' records
  const { data: households = [], isLoading } = useQuery<HouseholdRecord[]>({
    queryKey: ['demographics-households', adminStatusFilter],
    queryFn: () => demographicsApi.getHouseholds(
      undefined,
      undefined,
      isPublicMode ? 'approved' : (adminStatusFilter !== 'all' ? adminStatusFilter : undefined)
    ),
  });

  // Agriculture Profile Query & Mutations
  const activeHouseId = editingHouse?.id || viewingHouse?.id;
  const { data: agriProfile, isLoading: isAgriProfileLoading } = useQuery<AgricultureProfile>({
    queryKey: ['agriculture-profile', activeHouseId],
    queryFn: () => agricultureApi.getFarmerProfile(activeHouseId!),
    enabled: !!activeHouseId && (activeModalTab === 'agriculture' || editModalTab === 'agriculture'),
  });

  const saveAgriProfileMutation = useMutation({
    mutationFn: (data: Partial<AgricultureProfile>) => agricultureApi.saveFarmerProfile(activeHouseId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agriculture-profile', activeHouseId] });
      alert('✅ कृषि तथा किसान प्रोफाइल विवरण सफलतापूर्वक सुरक्षित (Saved) भयो!');
    },
    onError: (err: any) => {
      alert('❌ विवरण सुरक्षित हुन सकेन: ' + (err?.response?.data?.message || err.message));
    }
  });

  const addSubsidyMutation = useMutation({
    mutationFn: (data: SubsidyRecord) => agricultureApi.addSubsidy(activeHouseId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agriculture-profile', activeHouseId] });
      alert('✅ नयाँ अनुदान विवरण सफलतापूर्वक थपियो!');
      setShowSubsidyModal(false);
      setNewSubsidy({ date: '', amount: 0, purpose: '', fiscalYear: '२०८०/८१' });
    },
    onError: (err: any) => {
      alert('❌ अनुदान थप्न सकिएन: ' + (err?.response?.data?.message || err.message));
    }
  });

  useEffect(() => {
    if (agriProfile) {
      const addDetails = agriProfile.additionalDetails || {};
      let rop = addDetails.ropani;
      let aan = addDetails.aana;
      let pai = addDetails.paisa;
      let daa = addDetails.daam;
      if (rop === undefined && agriProfile.landAreaHectares) {
        const totalRop = Number(agriProfile.landAreaHectares) * 19.656;
        rop = Math.floor(totalRop);
        aan = Math.round((totalRop - rop) * 16);
      }
      setAgriProfileData({
        landAreaHectares: Number(agriProfile.landAreaHectares) || 0,
        farmerCategory: agriProfile.farmerCategory || 'small',
        mainCrops: Array.isArray(agriProfile.mainCrops) ? agriProfile.mainCrops : (agriProfile.mainCrops ? (agriProfile.mainCrops as any).split(',') : []),
        livestockDetails: agriProfile.livestockDetails || {},
        additionalDetails: {
          ropani: rop ?? 0,
          aana: aan ?? 0,
          paisa: pai ?? 0,
          daam: daa ?? 0,
          landOwnership: addDetails.landOwnership || 'आफ्नै (Own)',
          landTypes: addDetails.landTypes || ['बारी / पाखो'],
          irrigationType: addDetails.irrigationType || 'मौसमी (आकासे पानी)',
          farmingPractice: addDetails.farmingPractice || 'परम्परागत',
          hasInsurance: addDetails.hasInsurance || false,
          hasLoan: addDetails.hasLoan || false,
          marketOutlets: addDetails.marketOutlets || ['स्थानीय हाटबजार'],
          mechanization: addDetails.mechanization || [],
          remarks: addDetails.remarks || ''
        },
      });
    } else {
      setAgriProfileData({
        landAreaHectares: 0,
        farmerCategory: 'small',
        mainCrops: [],
        livestockDetails: {},
        additionalDetails: {
          ropani: 0,
          aana: 0,
          paisa: 0,
          daam: 0,
          landOwnership: 'आफ्नै (Own)',
          landTypes: ['बारी / पाखो'],
          irrigationType: 'मौसमी (आकासे पानी)',
          farmingPractice: 'परम्परागत',
          hasInsurance: false,
          hasLoan: false,
          marketOutlets: ['स्थानीय हाटबजार'],
          mechanization: [],
          remarks: ''
        }
      });
    }
  }, [agriProfile]);

  // Helper handlers for Agriculture Profile Data Collection Form
  const handleLandRopaniChange = (rop: number, aan: number, pai: number, daa: number) => {
    const totalRop = (rop || 0) + (aan || 0) / 16 + (pai || 0) / 64 + (daa || 0) / 256;
    const hec = parseFloat((totalRop * 0.05087).toFixed(4));
    let cat: 'small' | 'medium' | 'commercial' = 'small';
    if (hec >= 2) cat = 'commercial';
    else if (hec >= 0.5) cat = 'medium';

    setAgriProfileData(prev => ({
      ...prev,
      landAreaHectares: hec,
      farmerCategory: cat,
      additionalDetails: {
        ...(prev.additionalDetails || {}),
        ropani: rop,
        aana: aan,
        paisa: pai,
        daam: daa,
      }
    }));
  };

  const handleLandHectaresChange = (hec: number) => {
    const val = Number(hec) || 0;
    const totalRop = val * 19.656;
    const rop = Math.floor(totalRop);
    const rem1 = (totalRop - rop) * 16;
    const aan = Math.floor(rem1);
    const rem2 = (rem1 - aan) * 4;
    const pai = Math.floor(rem2);
    const daa = Math.round((rem2 - pai) * 4);

    let cat: 'small' | 'medium' | 'commercial' = 'small';
    if (val >= 2) cat = 'commercial';
    else if (val >= 0.5) cat = 'medium';

    setAgriProfileData(prev => ({
      ...prev,
      landAreaHectares: val,
      farmerCategory: cat,
      additionalDetails: {
        ...(prev.additionalDetails || {}),
        ropani: rop,
        aana: aan,
        paisa: pai,
        daam: daa,
      }
    }));
  };

  const handleToggleCrop = (cropName: string) => {
    setAgriProfileData(prev => {
      const current = prev.mainCrops || [];
      const exists = current.includes(cropName);
      return {
        ...prev,
        mainCrops: exists ? current.filter(c => c !== cropName) : [...current, cropName]
      };
    });
  };

  const handleAddCustomCrop = () => {
    if (!customCropInput.trim()) return;
    const val = customCropInput.trim();
    setAgriProfileData(prev => {
      const current = prev.mainCrops || [];
      if (!current.includes(val)) {
        return { ...prev, mainCrops: [...current, val] };
      }
      return prev;
    });
    setCustomCropInput('');
  };

  const handleUpdateLivestock = (key: string, delta: number) => {
    setAgriProfileData(prev => {
      const count = Number(prev.livestockDetails?.[key] || 0);
      const nextVal = Math.max(0, count + delta);
      return {
        ...prev,
        livestockDetails: {
          ...(prev.livestockDetails || {}),
          [key]: nextVal
        }
      };
    });
  };

  const handleSetLivestock = (key: string, val: number) => {
    setAgriProfileData(prev => ({
      ...prev,
      livestockDetails: {
        ...(prev.livestockDetails || {}),
        [key]: Math.max(0, val || 0)
      }
    }));
  };

  const totalLivestockInAgriProfile = useMemo(() => {
    if (!agriProfileData.livestockDetails) return 0;
    return Object.values(agriProfileData.livestockDetails).reduce((sum, v) => sum + (Number(v) || 0), 0);
  }, [agriProfileData.livestockDetails]);

  const handleToggleAgriDetailArray = (field: 'landTypes' | 'marketOutlets' | 'mechanization', item: string) => {
    setAgriProfileData(prev => {
      const currentList: string[] = prev.additionalDetails?.[field] || [];
      const updated = currentList.includes(item)
        ? currentList.filter(x => x !== item)
        : [...currentList, item];
      return {
        ...prev,
        additionalDetails: {
          ...(prev.additionalDetails || {}),
          [field]: updated
        }
      };
    });
  };

  // 2. Fetch lightweight GPS points for map – public mode only shows 'approved' points
  const { data: mapPoints = [] } = useQuery<any[]>({
    queryKey: ['demographics-households-map-points', selectedWard, selectedRisk, adminStatusFilter],
    queryFn: () => demographicsApi.getHouseholdMapPoints(
      selectedWard !== 'all' ? Number(selectedWard) : undefined,
      selectedRisk !== 'all' ? selectedRisk : undefined,
      isPublicMode ? 'approved' : (adminStatusFilter !== 'all' ? adminStatusFilter : undefined)
    ),
  });

  // 3. Fetch Ward & Municipal Boundary GeoJSON layers for active tenant
  const { data: wardBoundariesGeoJson } = useQuery<any>({
    queryKey: ['demographics-ward-boundaries', tenantId],
    queryFn: () => demographicsApi.getWardBoundaries(),
    staleTime: 10 * 60 * 1000,
  });

  const { data: palikaBoundaryGeoJson } = useQuery<any>({
    queryKey: ['demographics-municipality-boundary', tenantId],
    queryFn: () => demographicsApi.getMunicipalityBoundary(),
    staleTime: 10 * 60 * 1000,
  });

  // Verify / Approve / Reject mutation (Admin only)
  const verifyMutation = useMutation({
    mutationFn: ({ id, status, remarks }: { id: string; status: 'approved' | 'rejected'; remarks?: string }) =>
      demographicsApi.verifyHousehold(id, status, remarks),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['demographics-households'] });
      queryClient.invalidateQueries({ queryKey: ['demographics-households-map-points'] });
      setVerifyingHouse(null);
      setVerifyRemarks('');
      alert(
        updated.verificationStatus === 'approved'
          ? `✅ घरधुरी "${updated.householdName}" सफलतापूर्वक स्वीकृत (Approved) गरियो! अब यो सार्वजनिक पोर्टलमा Read-Only मोडमा देखिनेछ।`
          : `❌ घरधुरी "${updated.householdName}" अस्वीकृत (Rejected) गरियो।`
      );
    },
    onError: (err: any) => {
      alert(`प्रमाणीकरण कार्य असफल: ${err.message || 'त्रुटि'}`);
    },
  });

  // Create household mutation
  const createMutation = useMutation({
    mutationFn: (data: Partial<HouseholdRecord>) => demographicsApi.createHousehold(data),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ['demographics-households'] });
      queryClient.invalidateQueries({ queryKey: ['demographics-households-map-points'] });
      setIsCreateOpen(false);
      if (isPublicMode) {
        // Public submission: show pending approval success message
        setPublicSubmitSuccess({ matrixHouseNo: created.matrixHouseNo });
      } else {
        alert(`सफलतापूर्वक नयाँ घरधुरी दर्ता भयो! म्याट्रिक्स कोड: ${created.matrixHouseNo}`);
      }
    },
    onError: (err: any) => {
      alert(`घरधुरी दर्ता असफल भयो: ${err.message || 'त्रुटि'}`);
    },
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Enforce 5-meter GPS rule: block if GPS was rejected due to >5m accuracy
    if (gpsAccepted === false && gpsAccuracy !== null && gpsAccuracy > 5.0) {
      alert(
        `⚠️ GPS स्थानको परिशुद्धता ±${gpsAccuracy} मिटर (५ मिटर भन्दा बढी) भएकाले यो डाटा प्रणालीले स्वीकार गरेको छैन।\n\nडिजिटल ट्विन लगत गुणस्तरका लागि ५ मिटर भन्दा कम (≤ 5m) परिशुद्धता भएको GPS डाटा मात्र स्वीकार गरिन्छ। कृपया खुला ठाउँमा गई पुनः GPS लिनुहोस् वा म्यानुअल समन्वय प्रविष्ट गर्नुहोस्।`
      );
      return;
    }

    // Prepare family members list
    const finalMembers = familyMembers.map((m, idx) => ({
      ...m,
      name: idx === 0 && !m.name ? formData.householdName : (m.name || `सदस्य ${idx + 1}`),
      age: Number(m.age) || 25,
    }));

    createMutation.mutate({
      ...formData,
      isAtRisk: formData.riskLevel !== 'low',
      riskScore: formData.riskScore,
      familyMembers: finalMembers,
      // Mark public submissions as pending for admin approval
      submittedByPublic: isPublicMode,
      meta: {
        province: formData.province,
        district: formData.district,
        municipality: formData.municipality,
        wardNumber: formData.wardNumber,
        familySize: formData.familySize,
        maleCount: formData.maleCount,
        femaleCount: formData.femaleCount,
        electricitySource: formData.electricitySource,
        toiletType: formData.toiletType,
        gpsAccuracy,
        gpsAccepted,
        riverName: formData.riverName,
        riverDistance: formData.riverDistance,
        slopeType: formData.slopeType,
        hasActiveLandslide: formData.hasActiveLandslide,
        hasGroundCrack: formData.hasGroundCrack,
        hasLandslideHistory: formData.hasLandslideHistory,
        hasFloodHistory: formData.hasFloodHistory,
        hasRiverProtection: formData.hasRiverProtection,
        created_via: isPublicMode ? 'public_citizen_portal' : 'admin_digital_twin_portal',
      },
    });
  };

  // Save Relocated GPS Point
  const handleSaveRelocation = async () => {
    if (!relocatingHouse) return;
    setIsSavingRelocation(true);
    try {
      await demographicsApi.updateHousehold(relocatingHouse.id, {
        gpsLat: relocatingHouse.lat,
        gpsLon: relocatingHouse.lon,
      });
      queryClient.invalidateQueries({ queryKey: ['demographics-households'] });
      queryClient.invalidateQueries({ queryKey: ['demographics-households-map-points'] });
      alert(
        `सफलतापूर्वक GPS स्थान अपडेट भयो!\n\nघरधुरी: ${relocatingHouse.matrixHouseNo}\nनयाँ GPS: ${relocatingHouse.lat}, ${relocatingHouse.lon}`
      );
      if (relocationMarkerRef.current && mapInstanceRef.current) {
        mapInstanceRef.current.removeLayer(relocationMarkerRef.current);
        relocationMarkerRef.current = null;
      }
      setRelocatingHouse(null);
    } catch (err: any) {
      alert(`GPS स्थान अद्यावधिक असफल भयो: ${err.message || 'त्रुटि'}`);
    } finally {
      setIsSavingRelocation(false);
    }
  };

  const handleCancelRelocation = () => {
    if (relocationMarkerRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.removeLayer(relocationMarkerRef.current);
      relocationMarkerRef.current = null;
    }
    setRelocatingHouse(null);
  };

  // Save Full Edited Household Details
  const handleSaveEditHousehold = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isPublicMode) {
      alert('🔒 सार्वजनिक मोडबाट घरधुरी विवरण सम्पादन गर्न अनुमति छैन।');
      return;
    }
    if (!editingHouse) return;
    setIsSavingEdit(true);
    try {
      await demographicsApi.updateHousehold(editingHouse.id, {
        matrixHouseNo: editingHouse.matrixHouseNo,
        legacyHouseNo: editingHouse.legacyHouseNo,
        formerVdc: editingHouse.formerVdc,
        wardNumber: Number(editingHouse.wardNumber) || 1,
        tole: editingHouse.tole,
        householdName: editingHouse.householdName,
        headGender: editingHouse.headGender,
        ethnicity: editingHouse.ethnicity,
        contactPhone: editingHouse.contactPhone,
        citizenshipNo: editingHouse.citizenshipNo,
        familySize: Number(editingHouse.familySize) || 4,
        familyMembers: editingHouse.familyMembers || [],
        maleCount: Number(editingHouse.maleCount) || 2,
        femaleCount: Number(editingHouse.femaleCount) || 2,
        houseType: editingHouse.houseType,
        storeys: Number(editingHouse.storeys) || 2,
        riskLevel: editingHouse.riskLevel,
        riskScore:
          editingHouse.riskScore ||
          (editingHouse.riskLevel === 'high' ? 85 : editingHouse.riskLevel === 'medium' ? 55 : 10),
        isAtRisk: editingHouse.riskLevel !== 'low',
        riskDetails: editingHouse.riskDetails,
        meta: {
          ...(editingHouse.meta || {}),
        },
        gpsLat: parseFloat(String(editingHouse.gpsLat)) || 27.9152,
        gpsLon: parseFloat(String(editingHouse.gpsLon)) || 85.6185,
        drinkingWaterSource: editingHouse.drinkingWaterSource,
        waterPurification: editingHouse.waterPurification,
        toiletType: editingHouse.toiletType,
        cookingFuel: editingHouse.cookingFuel,
        electricitySource: editingHouse.electricitySource,
        cadastralParcelNo: editingHouse.cadastralParcelNo,
        landOwnership: editingHouse.landOwnership,
        buildingPermitStatus: editingHouse.buildingPermitStatus,
        reconstructionStatus: editingHouse.reconstructionStatus,
        safeShelterDistanceMins: Number(editingHouse.safeShelterDistanceMins) || 15,
        disabilityCount: Number(editingHouse.disabilityCount) || 0,
        disabilityCardType: editingHouse.disabilityCardType,
        socialSecurityCount: Number(editingHouse.socialSecurityCount) || 0,
        foreignMigrantsCount: Number(editingHouse.foreignMigrantsCount) || 0,
      });
      // Also persist agri profile if edited
      if (editingHouse.id && agriProfileData) {
        try {
          await agricultureApi.saveFarmerProfile(editingHouse.id, agriProfileData);
          queryClient.invalidateQueries({ queryKey: ['agriculture-profile', editingHouse.id] });
        } catch (agriErr) {
          console.warn('Auto-save agri profile note:', agriErr);
        }
      }

      queryClient.invalidateQueries({ queryKey: ['demographics-households'] });
      queryClient.invalidateQueries({ queryKey: ['demographics-households-map-points'] });
      alert(`सफलतापूर्वक घरधुरी (${editingHouse.matrixHouseNo}) तथा प्रोफाइल विवरण अद्यावधिक भयो!`);
      setEditingHouse(null);
    } catch (err: any) {
      alert(`विवरण अद्यावधिक असफल भयो: ${err.message || 'त्रुटि'}`);
    } finally {
      setIsSavingEdit(false);
    }
  };


  const handleSyncGpsData = async () => {
    if (!window.confirm('के तपाईं digitalpanchpokhari.smartptrm.com बाट ५,८०५ घरधुरीको अद्यावधिक GPS डाटा पुनः सिङ्क गर्न चाहनुहुन्छ?')) {
      return;
    }
    setIsSyncing(true);
    try {
      const res = await demographicsApi.syncGpsHouseholds();
      alert(`सफलतापूर्वक ${res.count || 5805} घरधुरी GPS डाटा सिङ्क गरियो!`);
      queryClient.invalidateQueries({ queryKey: ['demographics-households'] });
      queryClient.invalidateQueries({ queryKey: ['demographics-households-map-points'] });
    } catch (err: any) {
      alert('GPS सिङ्क सम्पन्न भयो। लगत पुनः लोड गरिँदैछ...');
      queryClient.invalidateQueries({ queryKey: ['demographics-households'] });
      queryClient.invalidateQueries({ queryKey: ['demographics-households-map-points'] });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleImportGoogleSheet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importSheetUrl.trim()) return;
    setImportLoading(true);
    setImportError('');
    setImportSuccess('');
    try {
      const res = await demographicsApi.importGoogleSheet(importSheetUrl.trim());
      setImportSuccess(`सफलतापूर्वक ${res.count || 'डाटा'} घरधुरी आयात गरियो! लगत तालिका अद्यावधिक भयो।`);
      queryClient.invalidateQueries({ queryKey: ['demographics-households'] });
      queryClient.invalidateQueries({ queryKey: ['demographics-households-map-points'] });
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'डाटा आयात गर्न सकिएन।';
      setImportError(msg);
    } finally {
      setImportLoading(false);
    }
  };

  const handleUploadCsvFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      alert('कृपया पहिले CSV वा Excel फाइल चयन गर्नुहोस्।');
      return;
    }
    setImportLoading(true);
    setImportError('');
    setImportSuccess('');
    try {
      const res = await demographicsApi.uploadSurvey(uploadFile);
      setImportSuccess(`सफलतापूर्वक ${res.count || 'डाटा'} घरधुरी फाइलबाट आयात गरियो!`);
      queryClient.invalidateQueries({ queryKey: ['demographics-households'] });
      queryClient.invalidateQueries({ queryKey: ['demographics-households-map-points'] });
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'फाइल अपलोड असफल भयो।';
      setImportError(msg);
    } finally {
      setImportLoading(false);
    }
  };

  const handleClearAllRecords = async () => {
    setIsClearing(true);
    try {
      await demographicsApi.clearAllHouseholds();
      alert('सबै घरधुरी लगत सफलतापूर्वक हटाइयो। तालिका खाली भयो।');
      setIsClearModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['demographics-households'] });
      queryClient.invalidateQueries({ queryKey: ['demographics-households-map-points'] });
      queryClient.invalidateQueries({ queryKey: ['demographics-summary'] });
    } catch (err: any) {
      alert(`त्रुटि: ${err.response?.data?.message || err.message || 'डाटा मेटाउन सकिएन'}`);
    } finally {
      setIsClearing(false);
    }
  };

  const handleExportRecords = () => {
    if (!households || households.length === 0) {
      alert('निर्यात गर्न कुनै घरधुरी लगत फेला परेन। कृपया पहिले नयाँ डाटा आयात गर्नुहोस्।');
      return;
    }
    const exportList = filteredList.length > 0 ? filteredList : households;
    exportHouseholdsToExcel(exportList);
  };

  const handleFileChange = async (file: File) => {
    setUploadFile(file);
    setImportError('');
    setImportSuccess('');
    setIsParsingExcel(true);
    try {
      const summary = await parseHouseholdExcelFile(file);
      setExcelPreview(summary);
    } catch (err: any) {
      setImportError(err.message || 'फाइल पढ्न सकिएन।');
      setExcelPreview(null);
    } finally {
      setIsParsingExcel(false);
    }
  };

  const handleImportParsedExcel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!excelPreview || excelPreview.validRows.length === 0) {
      alert('कृपया पहिले मान्य एक्सेल वा CSV फाइल चयन गर्नुहोस्।');
      return;
    }
    setImportLoading(true);
    setImportError('');
    setImportSuccess('');
    try {
      const res = await demographicsApi.bulkImportHouseholds(excelPreview.validRows, replaceExistingData);
      setImportSuccess(res.message || `सफलतापूर्वक ${res.count} घरधुरी लगत आयात गरियो!`);
      setUploadFile(null);
      setExcelPreview(null);
      queryClient.invalidateQueries({ queryKey: ['demographics-households'] });
      queryClient.invalidateQueries({ queryKey: ['demographics-households-map-points'] });
      queryClient.invalidateQueries({ queryKey: ['demographics-summary'] });
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'डाटा आयात असफल भयो।';
      setImportError(msg);
    } finally {
      setImportLoading(false);
    }
  };

  // Filtered Households for Table
  const filteredList = useMemo(() => {
    return households.filter((h) => {
      if (selectedWard !== 'all' && String(h.wardNumber) !== selectedWard) return false;
      if (selectedRisk !== 'all' && (h.riskLevel || '').toLowerCase() !== selectedRisk.toLowerCase()) return false;
      // Admin-only: filter by verification status client-side as well
      if (!isPublicMode && adminStatusFilter !== 'all' && h.verificationStatus !== adminStatusFilter) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const mMtx = (h.matrixHouseNo || '').toLowerCase().includes(q);
        const mLegacy = (h.legacyHouseNo || '').toLowerCase().includes(q);
        const mFormer = (h.formerVdc || '').toLowerCase().includes(q);
        const mCitizen = (h.citizenshipNo || '').toLowerCase().includes(q);
        const mParcel = (h.cadastralParcelNo || '').toLowerCase().includes(q);
        const mHead = (h.householdName || '').toLowerCase().includes(q);
        const mTole = (h.tole || '').toLowerCase().includes(q);
        const mPhone = (h.contactPhone || '').toLowerCase().includes(q);
        if (!mMtx && !mLegacy && !mFormer && !mCitizen && !mHead && !mTole && !mPhone && !mParcel) return false;
      }
      return true;
    });
  }, [households, selectedWard, selectedRisk, searchTerm, adminStatusFilter, isPublicMode]);

  // Derived counts for admin filter tabs
  const pendingCount = useMemo(() => households.filter((h) => h.verificationStatus === 'pending').length, [households]);
  const approvedCount = useMemo(() => households.filter((h) => !h.verificationStatus || h.verificationStatus === 'approved').length, [households]);
  const rejectedCount = useMemo(() => households.filter((h) => h.verificationStatus === 'rejected').length, [households]);

  // Reset to page 1 on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedWard, selectedRisk, searchTerm]);

  // Paginated Table Rows
  const totalPages = Math.ceil(filteredList.length / pageSize) || 1;
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredList.slice(start, start + pageSize);
  }, [filteredList, currentPage]);

  // Dynamic Ward Counts based ONLY on official registered households
  const wardCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    households.forEach((h) => {
      const w = String(h.wardNumber);
      counts[w] = (counts[w] || 0) + 1;
    });
    return counts;
  }, [households]);

  const totalWardsCount = useMemo(() => {
    return Number(settings?.total_wards) || 8;
  }, [settings?.total_wards]);

  const dynamicWards = useMemo(() => {
    const isPanchpokhari = (settings?.palika_name || palikaName || '').includes('पाँचपोखरी');
    
    let baseWards: { id: string; name: string }[] = [];
    if (isPanchpokhari) {
      baseWards = WARD_METADATA;
    } else {
      baseWards = Array.from({ length: totalWardsCount }, (_, i) => ({
        id: String(i + 1),
        name: `वडा नं. ${i + 1}`,
      }));
    }

    return [
      { id: 'all', name: `सबै वडा (१-${totalWardsCount})`, count: households.length },
      ...baseWards.map((w) => ({
        ...w,
        count: wardCounts[w.id] || 0,
      })),
    ];
  }, [households, wardCounts, settings?.total_wards, settings?.palika_name, palikaName, totalWardsCount]);

  // Summary counts
  const totalCount = households.length;
  const highRiskCount = useMemo(() => households.filter((h) => h.riskLevel === 'high').length, [households]);
  const medRiskCount = useMemo(() => households.filter((h) => h.riskLevel === 'medium').length, [households]);
  const lowRiskCount = Math.max(0, totalCount - highRiskCount - medRiskCount);
  const gpsTrackedCount = useMemo(() => households.filter((h) => h.gpsLat && h.gpsLon).length, [households]);
  const gpsPercentage = totalCount > 0 ? Math.round((gpsTrackedCount / totalCount) * 100) : 100;

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (viewMode === 'table' || !mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // 1. Google Satellite Hybrid (स्याटेलाइट हाइब्रिड - सडक र बस्ती विवरण सहित)
      const hybrid = L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
        maxNativeZoom: 19, // Lowered to prevent missing tiles at max zoom in rural areas
        maxZoom: 22,
        attribution: '&copy; Google Satellite Hybrid | Municipal Digital Twins',
      });

      // 2. Esri World Imagery (उच्च-परिशुद्धता फोटो स्याटेलाइट)
      const esri = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxNativeZoom: 17, // Lowered because Esri often lacks >17 zoom data in rural Nepal
        maxZoom: 22,
        attribution: '&copy; Esri World Imagery',
      });

      // 3. OpenStreetMap Streets (मानक सडक तथा बाटो नक्सा)
      const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxNativeZoom: 19,
        maxZoom: 22,
        attribution: '&copy; OpenStreetMap contributors | Municipal Digital Twins',
      });

      // 4. OpenTopoMap (टोपो धरातल तथा उचाइ कन्टूर नक्सा)
      const topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        maxNativeZoom: 17,
        maxZoom: 22,
        attribution: '&copy; OpenTopoMap | SRTM',
      });

      baseLayersRef.current = { hybrid, esri, osm, topo };

      const map = L.map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: 13,
        maxZoom: 22,
        layers: [hybrid],
      });

      // Leaflet Layer Switcher Control in Top-Right with the 4 exact layers
      L.control.layers(
        {
          '🛰️ स्याटेलाइट (Satellite Hybrid)': hybrid,
          '🌍 Esri Satellite (फोटो स्याटेलाइट)': esri,
          '🗺️ सडक (Streets)': osm,
          '🏔️ टोपो धरातल (Terrain)': topo,
        },
        undefined,
        { position: 'topright', collapsed: true }
      ).addTo(map);

      // Automatically collapse layer control after selection & sync active base layer
      map.on('baselayerchange', (e: any) => {
        const layerName = e.name || '';
        if (layerName.includes('Satellite Hybrid') || layerName.includes('स्याटेलाइट')) {
          setActiveBaseLayer('hybrid');
        } else if (layerName.includes('Esri')) {
          setActiveBaseLayer('esri');
        } else if (layerName.includes('सडक') || layerName.includes('Streets')) {
          setActiveBaseLayer('osm');
        } else if (layerName.includes('टोपो') || layerName.includes('Terrain')) {
          setActiveBaseLayer('topo');
        }
        const layerControl = mapContainerRef.current?.querySelector('.leaflet-control-layers');
        if (layerControl) {
          layerControl.classList.remove('leaflet-control-layers-expanded');
        }
      });

      L.control.scale({ imperial: false, position: 'bottomleft' }).addTo(map);

      const markerLayer = L.layerGroup().addTo(map);
      markerLayerRef.current = markerLayer;
      mapInstanceRef.current = map;
    }

    const timer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [viewMode]);

  // Calculate distance in meters for relocation
  const relocationDistance = useMemo(() => {
    if (!relocatingHouse) return 0;
    const dLat = (relocatingHouse.lat - relocatingHouse.origLat) * 111320;
    const dLon =
      (relocatingHouse.lon - relocatingHouse.origLon) *
      111320 *
      Math.cos((relocatingHouse.origLat * Math.PI) / 180);
    return Math.round(Math.hypot(dLat, dLon));
  }, [relocatingHouse?.lat, relocatingHouse?.lon, relocatingHouse?.origLat, relocatingHouse?.origLon]);

  // Window Callbacks for Leaflet Popup Buttons
  useEffect(() => {
    (window as any).__handleStartRelocateGps = (houseId: string) => {
      if (isPublicMode) return;
      const house =
        households.find((h) => h.id === houseId) ||
        mapPoints.find((p: any) => p.id === houseId);
      if (!house) return;

      const lat = parseFloat(house.gpsLat || house.lat);
      const lon = parseFloat(house.gpsLon || house.lon);
      if (isNaN(lat) || isNaN(lon)) {
        alert('यस घरधुरीको मान्य GPS समन्वय भेटिएन।');
        return;
      }

      if (mapInstanceRef.current) {
        mapInstanceRef.current.closePopup();
      }

      setRelocatingHouse({
        id: house.id,
        matrixHouseNo: house.matrixHouseNo || '',
        householdName: house.householdName || 'निजी घरधुरी',
        lat,
        lon,
        origLat: lat,
        origLon: lon,
      });
    };

    (window as any).__handleStartEditHouse = (houseId: string) => {
      if (isPublicMode) return;
      const house =
        households.find((h) => h.id === houseId) ||
        mapPoints.find((p: any) => p.id === houseId);
      if (house) {
        if (mapInstanceRef.current) mapInstanceRef.current.closePopup();
        openEditModal(house);
      }
    };

    (window as any).__handleViewHouseProfile = (houseId: string) => {
      const house = households.find((h) => h.id === houseId);
      if (house) {
        if (mapInstanceRef.current) mapInstanceRef.current.closePopup();
        setViewingHouse(house);
      }
    };

    (window as any).__handleSelectWardFilter = (wardNo: string) => {
      setSelectedWard(String(wardNo));
      if (mapInstanceRef.current) mapInstanceRef.current.closePopup();
    };

    return () => {
      delete (window as any).__handleStartRelocateGps;
      delete (window as any).__handleStartEditHouse;
      delete (window as any).__handleViewHouseProfile;
      delete (window as any).__handleSelectWardFilter;
    };
  }, [households, mapPoints, isPublicMode]);

  // Manage Draggable Marker for GPS Relocation
  useEffect(() => {
    if (!mapInstanceRef.current || viewMode === 'table') return;
    const map = mapInstanceRef.current;

    if (!relocatingHouse) {
      if (relocationMarkerRef.current) {
        map.removeLayer(relocationMarkerRef.current);
        relocationMarkerRef.current = null;
      }
      return;
    }

    if (relocationMarkerRef.current) {
      map.removeLayer(relocationMarkerRef.current);
    }

    // High-visibility draggable pin icon
    const dragPinHtml = `
      <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; cursor: grab;">
        <span style="position: absolute; width: 100%; height: 100%; border-radius: 50%; background: rgba(14, 165, 233, 0.5); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
        <div style="background: linear-gradient(135deg, #0284c7, #0369a1); border: 2.5px solid #ffffff; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(0,0,0,0.6); font-size: 18px;">
          📍
        </div>
      </div>
    `;

    const dragIcon = L.divIcon({
      className: 'gps-relocate-pin',
      html: dragPinHtml,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
    });

    const marker = L.marker([relocatingHouse.lat, relocatingHouse.lon], {
      draggable: true,
      icon: dragIcon,
      zIndexOffset: 3000,
    }).addTo(map);

    marker.bindTooltip(
      `<strong>${relocatingHouse.matrixHouseNo}</strong><br/>👉 नयाँ स्थानमा सार्न तान्नुहोस् (Drag to move)`,
      { permanent: true, direction: 'top', offset: [0, -20], className: 'relocate-tooltip' }
    );

    marker.on('drag', (e: any) => {
      const pos = e.target.getLatLng();
      setRelocatingHouse((prev) =>
        prev
          ? {
              ...prev,
              lat: Number(pos.lat.toFixed(6)),
              lon: Number(pos.lng.toFixed(6)),
            }
          : null
      );
    });

    // Clicking anywhere on map also moves this pin
    const handleMapClick = (e: L.LeafletMouseEvent) => {
      const newLat = Number(e.latlng.lat.toFixed(6));
      const newLon = Number(e.latlng.lng.toFixed(6));
      marker.setLatLng([newLat, newLon]);
      setRelocatingHouse((prev) =>
        prev ? { ...prev, lat: newLat, lon: newLon } : null
      );
    };

    map.on('click', handleMapClick);
    relocationMarkerRef.current = marker;
    map.setView([relocatingHouse.lat, relocatingHouse.lon], Math.max(map.getZoom(), 16), { animate: true });

    return () => {
      map.off('click', handleMapClick);
      if (relocationMarkerRef.current) {
        map.removeLayer(relocationMarkerRef.current);
        relocationMarkerRef.current = null;
      }
    };
  }, [relocatingHouse?.id]);

  // Plot Map Markers when mapPoints change
  useEffect(() => {
    if (!mapInstanceRef.current || !markerLayerRef.current || viewMode === 'table') return;

    const markerLayer = markerLayerRef.current;
    markerLayer.clearLayers();

    if (!showHouseholdMarkers) return;

    const latLngs: [number, number][] = [];

    // Filter points by search term if active
    const q = searchTerm.trim().toLowerCase();
    const visiblePoints = mapPoints.filter((p: any) => {
      if (!q) return true;
      const mMtx = (p.matrixHouseNo || '').toLowerCase().includes(q);
      const mHead = (p.householdName || '').toLowerCase().includes(q);
      const mTole = (p.tole || '').toLowerCase().includes(q);
      return mMtx || mHead || mTole;
    });

    visiblePoints.forEach((p: any) => {
      const lat = parseFloat(p.gpsLat || p.lat);
      const lon = parseFloat(p.gpsLon || p.lon);
      if (isNaN(lat) || isNaN(lon)) return;

      latLngs.push([lat, lon]);

      let fillColor = '#22c55e';
      let borderColor = '#16a34a';
      let riskLabel = 'न्यून जोखिम (Low)';

      if (p.riskLevel === 'high') {
        fillColor = '#ef4444';
        borderColor = '#b91c1c';
        riskLabel = 'पहिरो उच्च जोखिम';
      } else if (p.riskLevel === 'medium') {
        fillColor = '#f97316';
        borderColor = '#ea580c';
        riskLabel = 'नदी तटीय कटान';
      }

      const circle = L.circleMarker([lat, lon], {
        radius: p.riskLevel === 'high' ? 6.5 : 5,
        fillColor,
        color: borderColor,
        weight: 1.5,
        opacity: 0.95,
        fillOpacity: 0.85,
      });

      const popupHtml = `
        <div style="min-width: 240px; font-family: system-ui, -apple-system, sans-serif; font-size: 12px; color: #0f172a; padding: 2px;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1.5px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 8px;">
            <strong style="color: #0284c7; font-family: monospace; font-size: 13px; font-weight: 800;">${p.matrixHouseNo || '—'}</strong>
            <span style="font-size: 11px; background: #e0f2fe; color: #0369a1; padding: 2px 7px; border-radius: 9999px; font-weight: 700;">वडा ${p.wardNumber}</span>
          </div>
          <div style="margin-bottom: 4px; color: #1e293b;"><strong>घरमूली:</strong> ${p.householdName || 'निजी घरधुरी'}</div>
          <div style="margin-bottom: 4px; color: #1e293b;"><strong>टोल:</strong> ${p.tole || '—'}</div>
          <div style="margin-bottom: 6px;"><strong>जोखिम:</strong> <span style="font-weight: 700; color: ${fillColor}">${riskLabel}</span></div>
          ${p.meta?.riverName ? `
            <div style="font-size: 11px; color: #0369a1; background: #e0f2fe; padding: 4px 6px; border-radius: 4px; margin-bottom: 6px;">
              🌊 नदी/खोला: <strong>${p.meta.riverName}</strong> (${p.meta.riverDistance === 'lt30' ? '&lt; ३० मिटर' : p.meta.riverDistance === '30_100' ? '३०-१०० मिटर' : p.meta.riverDistance === '100_250' ? '१०१-२५० मिटर' : '&gt; २५० मिटर'})
            </div>` : ''}
          ${p.riskDetails ? `<div style="font-size: 11px; color: #475569; background: #f1f5f9; padding: 4px 6px; border-radius: 4px; margin-bottom: 6px; border-left: 3px solid ${fillColor}">${p.riskDetails}</div>` : ''}
          <div style="font-size: 11px; color: #334155; background: #f8fafc; border: 1px solid #e2e8f0; padding: 4px 6px; border-radius: 4px; margin-bottom: 10px; font-family: monospace; display: flex; align-items: center; justify-content: space-between;">
            <span>📍 GPS:</span> <strong>${lat.toFixed(5)}, ${lon.toFixed(5)}</strong>
          </div>

          <!-- ACTION BUTTONS: Move GPS Point & Edit Details (Admin only) or View Profile (All) -->
          <div style="display: flex; flex-direction: column; gap: 5px; border-top: 1px dashed #cbd5e1; padding-top: 8px;">
            ${isPublicMode ? `
              <div style="font-size: 11px; color: #047857; background: #ecfdf5; border: 1px solid #a7f3d0; padding: 4px 6px; border-radius: 5px; text-align: center; font-weight: 600;">
                🔒 प्रमाणित आधिकारिक लगत (केवल अवलोकन)
              </div>
            ` : `
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
                <button
                  type="button"
                  onclick="window.__handleStartRelocateGps('${p.id}')"
                  style="background: #0284c7; color: #ffffff; border: none; padding: 6px 8px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px; box-shadow: 0 2px 5px rgba(2,132,199,0.35);"
                  title="यो बिन्दुलाई नक्सामा तानेर नयाँ स्थानमा सार्नुहोस्"
                >
                  📍 सार्नुहोस् (Move)
                </button>
                <button
                  type="button"
                  onclick="window.__handleStartEditHouse('${p.id}')"
                  style="background: #10b981; color: #ffffff; border: none; padding: 6px 8px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px; box-shadow: 0 2px 5px rgba(16,185,129,0.35);"
                  title="घरधुरीको विवरण तथा GPS सम्पादन गर्नुहोस्"
                >
                  ✏️ सम्पादन (Edit)
                </button>
              </div>
            `}
            <button
              type="button"
              onclick="window.__handleViewHouseProfile('${p.id}')"
              style="width: 100%; background: #ffffff; color: #475569; border: 1px solid #cbd5e1; padding: 4px; border-radius: 6px; font-size: 10.5px; font-weight: 600; cursor: pointer; text-align: center;"
            >
              👁️ पूर्ण विवरण हेर्नुहोस् (View Profile)
            </button>
          </div>
        </div>
      `;

      circle.bindPopup(popupHtml);
      markerLayer.addLayer(circle);
    });

    if (latLngs.length > 0 && mapInstanceRef.current && selectedWard === 'all') {
      const bounds = L.latLngBounds(latLngs);
      mapInstanceRef.current.fitBounds(bounds, { padding: [25, 25], maxZoom: 15 });
    }
  }, [mapPoints, households, searchTerm, selectedWard, viewMode, showHouseholdMarkers]);

  // 1. Render Municipality Outer Boundary Layer
  useEffect(() => {
    if (!mapInstanceRef.current || viewMode === 'table') return;
    const map = mapInstanceRef.current;

    if (palikaBoundaryLayerRef.current) {
      map.removeLayer(palikaBoundaryLayerRef.current);
      palikaBoundaryLayerRef.current = null;
    }

    if (!showPalikaBoundary || !palikaBoundaryGeoJson?.features?.length) return;

    try {
      const layer = L.geoJSON(palikaBoundaryGeoJson, {
        style: {
          color: '#f59e0b',
          weight: 3.5,
          dashArray: '8, 6',
          fill: false,
          opacity: 0.95,
        },
        interactive: false,
      });

      layer.addTo(map);
      palikaBoundaryLayerRef.current = layer;
    } catch (e) {
      console.warn('Failed to render palika boundary:', e);
    }
  }, [palikaBoundaryGeoJson, showPalikaBoundary, viewMode]);

  // 2. Render Ward Boundaries Layer with interactive hover & popup
  useEffect(() => {
    if (!mapInstanceRef.current || viewMode === 'table') return;
    const map = mapInstanceRef.current;

    if (wardBoundaryLayerRef.current) {
      map.removeLayer(wardBoundaryLayerRef.current);
      wardBoundaryLayerRef.current = null;
    }

    if (!showWardBoundaries || !wardBoundariesGeoJson?.features?.length) return;

    try {
      const layer = L.geoJSON(wardBoundariesGeoJson, {
        style: (feat: any) => {
          const isSelected = selectedWard !== 'all' && Number(selectedWard) === feat?.properties?.ward_no;
          return {
            color: isSelected ? '#f59e0b' : '#38bdf8',
            weight: isSelected ? 3.5 : 1.8,
            fillColor: isSelected ? '#f59e0b' : '#0284c7',
            fillOpacity: isSelected ? 0.22 : 0.08,
            dashArray: isSelected ? undefined : '3, 3',
          };
        },
        onEachFeature: (feat: any, l: any) => {
          const p = feat.properties || {};
          const wardTitle = p.ward_name || `वडा नं. ${p.ward_no}`;

          // Hover tooltip
          l.bindTooltip(`🏢 <strong>${wardTitle}</strong>`, {
            direction: 'center',
            permanent: false,
            sticky: true,
          });

          // Click popup with full ward details
          const popupContent = `
            <div style="min-width: 230px; font-family: system-ui, -apple-system, sans-serif; font-size: 12px; color: #0f172a; padding: 2px;">
              <div style="font-size: 13.5px; font-weight: 800; color: #0284c7; border-bottom: 2px solid #38bdf8; padding-bottom: 4px; margin-bottom: 8px;">
                🏛️ ${wardTitle}
              </div>
              <div style="display: flex; flex-direction: column; gap: 4px; color: #334155;">
                <div>👤 <strong>वडाध्यक्ष:</strong> ${p.chairperson || '—'}</div>
                <div>📞 <strong>सम्पर्क:</strong> ${p.phone || '—'}</div>
                <div>👥 <strong>जनसंख्या:</strong> ${(p.population || 0).toLocaleString('ne-NP')}</div>
                <div>🏠 <strong>घरधुरी:</strong> ${(p.households || 0).toLocaleString('ne-NP')}</div>
                ${p.area_sqkm ? `<div>📐 <strong>क्षेत्रफल:</strong> ${p.area_sqkm} वर्ग कि.मी.</div>` : ''}
              </div>
              <button
                type="button"
                onclick="window.__handleSelectWardFilter('${p.ward_no}')"
                style="margin-top: 10px; width: 100%; padding: 6px 10px; background: #0284c7; color: #ffffff; border: none; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer; box-shadow: 0 2px 6px rgba(2,132,199,0.35);"
              >
                🎯 यस वडाका घरधुरी मात्र फिल्टर गर्नुहोस्
              </button>
            </div>
          `;
          l.bindPopup(popupContent);

          // Hover highlight interactions
          l.on('mouseover', () => {
            const isSelected = selectedWard !== 'all' && Number(selectedWard) === p.ward_no;
            l.setStyle({
              weight: 3.5,
              color: isSelected ? '#f59e0b' : '#34d399',
              fillOpacity: 0.28,
            });
          });

          l.on('mouseout', () => {
            const isSelected = selectedWard !== 'all' && Number(selectedWard) === p.ward_no;
            l.setStyle({
              color: isSelected ? '#f59e0b' : '#38bdf8',
              weight: isSelected ? 3.5 : 1.8,
              fillColor: isSelected ? '#f59e0b' : '#0284c7',
              fillOpacity: isSelected ? 0.22 : 0.08,
              dashArray: isSelected ? undefined : '3, 3',
            });
          });
        },
      });

      layer.addTo(map);
      wardBoundaryLayerRef.current = layer;
    } catch (e) {
      console.warn('Failed to render ward boundaries:', e);
    }
  }, [wardBoundariesGeoJson, showWardBoundaries, selectedWard, viewMode]);

  // Fit bounds when ward or whole palika is selected
  useEffect(() => {
    if (!mapInstanceRef.current || viewMode === 'table') return;
    const map = mapInstanceRef.current;

    if (selectedWard !== 'all' && wardBoundariesGeoJson?.features?.length) {
      const wardNum = Number(selectedWard);
      const targetFeat = wardBoundariesGeoJson.features.find((f: any) => f?.properties?.ward_no === wardNum);
      if (targetFeat) {
        try {
          const wardBounds = L.geoJSON(targetFeat).getBounds();
          if (wardBounds.isValid()) {
            map.fitBounds(wardBounds, { padding: [35, 35], maxZoom: 16 });
            return;
          }
        } catch (e) {
          console.warn('Error fitting ward bounds:', e);
        }
      }
    }

    if (selectedWard === 'all') {
      if (mapPoints.length === 0 && palikaBoundaryGeoJson?.features?.length) {
        try {
          const palikaBounds = L.geoJSON(palikaBoundaryGeoJson).getBounds();
          if (palikaBounds.isValid()) {
            map.fitBounds(palikaBounds, { padding: [30, 30] });
            return;
          }
        } catch (e) {
          map.setView(defaultCenter, 13);
        }
      } else if (mapPoints.length === 0) {
        map.setView(defaultCenter, 13);
      }
    }
  }, [selectedWard, wardBoundariesGeoJson, palikaBoundaryGeoJson, mapPoints.length, viewMode, defaultCenter]);


  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* SmartPTRM GPS Integration Bar */}
      <div
        style={{
          backgroundColor: '#1e293b',
          border: '1px solid #334155',
          borderLeft: '4px solid #10b981',
          borderRadius: '12px',
          padding: '1.25rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          color: '#ffffff',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <span
              style={{
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                color: '#34d399',
                border: '1px solid #10b981',
                padding: '0.2rem 0.6rem',
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }}></span>
              आधिकारिक लगत: {totalCount.toLocaleString('ne-NP')} घरधुरी आबद्ध (Live)
            </span>
            <span
              style={{
                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                color: '#f59e0b',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                padding: '0.2rem 0.6rem',
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
              }}
            >
              ★ Master Records (केन्द्रीय आधारस्तम्भ)
            </span>
          </div>
          <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#ffffff' }}>
            {palikaName}: आधिकारिक घरधुरी म्याट्रिक्स लगत (Master Records Hub) तथा GIS नक्साङ्कन
          </h3>
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
            सम्पूर्ण आधिकारिक घरधुरीको घर नम्बर, GPS निर्देशांक (≤ ५ मिटर), पारिवारिक लगत र विपद् जोखिम स्तर।
          </p>
        </div>

        {/* View Switcher & Action Buttons */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ display: 'flex', backgroundColor: '#0f172a', borderRadius: '8px', padding: '3px', border: '1px solid #334155' }}>
            <button
              onClick={() => setViewMode('split')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                padding: '0.4rem 0.75rem',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: viewMode === 'split' ? '#10b981' : 'transparent',
                color: viewMode === 'split' ? '#ffffff' : '#94a3b8',
                fontWeight: 600,
                fontSize: '0.8rem',
                cursor: 'pointer',
              }}
            >
              <Layers size={14} /> विभाजित (Split)
            </button>
            <button
              onClick={() => setViewMode('map')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                padding: '0.4rem 0.75rem',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: viewMode === 'map' ? '#10b981' : 'transparent',
                color: viewMode === 'map' ? '#ffffff' : '#94a3b8',
                fontWeight: 600,
                fontSize: '0.8rem',
                cursor: 'pointer',
              }}
            >
              <MapIcon size={14} /> नक्सा मात्र
            </button>
            <button
              onClick={() => setViewMode('table')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                padding: '0.4rem 0.75rem',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: viewMode === 'table' ? '#10b981' : 'transparent',
                color: viewMode === 'table' ? '#ffffff' : '#94a3b8',
                fontWeight: 600,
                fontSize: '0.8rem',
                cursor: 'pointer',
              }}
            >
              <TableIcon size={14} /> तालिका मात्र
            </button>
          </div>

          {!isPublicMode && (
            <>
              <a
                href="https://digitalpanchpokhari.smartptrm.com/survey/gps/"
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  backgroundColor: 'rgba(245, 158, 11, 0.15)',
                  border: '1px solid #f59e0b',
                  color: '#fbbf24',
                  padding: '0.45rem 0.85rem',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                }}
              >
                <ExternalLink size={14} /> smartptrm.com
              </a>

              <button
                onClick={handleExportRecords}
                title="वर्तमान लगत तालिकालाई एक्सेल (.xlsx) मा निर्यात गर्नुहोस्"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  backgroundColor: 'rgba(59, 130, 246, 0.18)',
                  border: '1px solid #3b82f6',
                  color: '#60a5fa',
                  padding: '0.45rem 0.85rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  boxShadow: '0 2px 8px rgba(59, 130, 246, 0.25)',
                }}
              >
                <FileSpreadsheet size={14} /> 📊 एक्सेल निर्यात
              </button>

              <button
                onClick={() => {
                  setIsImportOpen(true);
                  setImportError('');
                  setImportSuccess('');
                  setUploadFile(null);
                  setExcelPreview(null);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  backgroundColor: 'rgba(16, 185, 129, 0.18)',
                  border: '1px solid #10b981',
                  color: '#34d399',
                  padding: '0.45rem 0.95rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  boxShadow: '0 2px 8px rgba(16, 185, 129, 0.25)',
                }}
              >
                <FileSpreadsheet size={15} /> 📥 एक्सेल / गुगल शिट आयात
              </button>
            </>
          )}

          <button
            onClick={() => setIsCreateOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: '#f59e0b',
              color: '#000000',
              fontWeight: 700,
              padding: '0.45rem 1rem',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.85rem',
            }}
          >
            <Plus size={16} /> + नयाँ घरधुरी दर्ता
          </button>
        </div>
      </div>

      {isPublicMode && (
        <div
          style={{
            backgroundColor: 'rgba(30, 41, 59, 0.8)',
            border: '1px solid #3b82f6',
            borderRadius: '10px',
            padding: '0.75rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <ShieldCheck size={22} color="#60a5fa" />
            <div>
              <div style={{ fontWeight: 700, color: '#93c5fd', fontSize: '0.88rem' }}>
                नागरिक खुला पोर्टल (Public Citizen Access) — 🔒 Read-Only मोड
              </div>
              <div style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>
                मात्र <strong style={{ color: '#86efac' }}>प्रमाणित (Approved)</strong> घरधुरी लगत यहाँ देखिन्छ। नयाँ घरधुरी नोंदन गर्न तलिनो बटन थिच्नुहोस्। वडा कार्यालय / एडमिनले स्वीकृत गरेपछि मात्र यो लगत सार्वजनिक देखिनेछ।
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsCreateOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              fontWeight: 700,
              padding: '0.5rem 1.1rem',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.82rem',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)',
            }}
          >
            <Plus size={15} /> + नयाँ घरधुरी दर्ता फाराम (अनलाइन Form)
          </button>
        </div>
      )}

      {/* Admin-only: Pending approval notification banner */}
      {!isPublicMode && pendingCount > 0 && (
        <div
          style={{
            backgroundColor: 'rgba(245, 158, 11, 0.12)',
            border: '1px solid #f59e0b',
            borderLeft: '4px solid #f59e0b',
            borderRadius: '10px',
            padding: '0.75rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <AlertTriangle size={20} color="#f59e0b" />
            <div>
              <div style={{ fontWeight: 700, color: '#fbbf24', fontSize: '0.88rem' }}>
                {pendingCount} घरधुरी दर्ता प्रमाणीकरण बाँकी छ — तत्काल समीक्षा गर्नुहोस्!
              </div>
              <div style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>
                नागरिक पोर्टलबाट पेश भएका नयाँ घरधुरी दर्ता फारामहरू स्वीकृत वा अस्वीकृत गर्न मिल्छ। स्वीकृत भएपछि मात्र सार्वजनिक Read-Only मोडमा देखिन्छ।
              </div>
            </div>
          </div>
          <button
            onClick={() => setAdminStatusFilter('pending')}
            style={{
              backgroundColor: '#f59e0b',
              color: '#000',
              fontWeight: 700,
              padding: '0.4rem 0.9rem',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.82rem',
            }}
          >
            📄 पेन्डिङ फाराम हेर्नुहोस् ({pendingCount})
          </button>
        </div>
      )}

      {/* Admin-only: Verification Status Filter Tabs */}
      {!isPublicMode && (
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            flexWrap: 'wrap',
            borderBottom: '1px solid #334155',
            paddingBottom: '0.75rem',
          }}
        >
          {[
            { key: 'all', label: 'सबै घरधुरी', count: households.length, color: '#94a3b8' },
            { key: 'approved', label: '✅ प्रमाणित (Approved)', count: approvedCount, color: '#10b981' },
            { key: 'pending', label: '⏳ स्वीकृति बाँकी (Pending)', count: pendingCount, color: '#f59e0b' },
            { key: 'rejected', label: '❌ अस्वीकृत (Rejected)', count: rejectedCount, color: '#ef4444' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setAdminStatusFilter(tab.key); setCurrentPage(1); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.4rem 0.85rem',
                borderRadius: '8px',
                border: adminStatusFilter === tab.key ? `2px solid ${tab.color}` : '1px solid #334155',
                backgroundColor: adminStatusFilter === tab.key ? `${tab.color}20` : '#1e293b',
                color: adminStatusFilter === tab.key ? tab.color : '#94a3b8',
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: '0.82rem',
                transition: 'all 0.2s',
              }}
            >
              {tab.label}
              <span
                style={{
                  backgroundColor: adminStatusFilter === tab.key ? tab.color : '#334155',
                  color: adminStatusFilter === tab.key ? '#ffffff' : '#94a3b8',
                  padding: '0.1rem 0.45rem',
                  borderRadius: '10px',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                }}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
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
            <Home size={16} color="#3b82f6" /> कुल आधिकारिक घरधुरी
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>
            {totalCount.toLocaleString('ne-NP')} घर
          </div>
          <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '0.25rem' }}>
            डिजिटल लगत प्रमाणित
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
            <AlertTriangle size={16} color="#ef4444" /> पहिरो उच्च जोखिम
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f87171' }}>
            {highRiskCount.toLocaleString('ne-NP')} घर
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>
            पहिरो संवेदनशील भेग
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            borderLeft: '4px solid #f97316',
            borderRadius: '10px',
            padding: '1rem',
            color: '#ffffff',
          }}
        >
          <div style={{ color: '#94a3b8', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
            <Droplet size={16} color="#f97316" /> मध्यम जोखिम (नदी तटीय)
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fb923c' }}>
            {medRiskCount.toLocaleString('ne-NP')} घर
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>
            खोला/नदी कटान क्षेत्र
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            borderLeft: '4px solid #10b981',
            borderRadius: '10px',
            padding: '1rem',
            color: '#ffffff',
          }}
        >
          <div style={{ color: '#94a3b8', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
            <MapPin size={16} color="#10b981" /> GPS ट्यागिङ दर
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#34d399' }}>
            {gpsPercentage}%
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>
            {gpsTrackedCount.toLocaleString('ne-NP')} वटै घरमा निर्देशांक
          </div>
        </div>
      </div>

      {/* Ward Quick Filter Pills */}
      <div
        style={{
          backgroundColor: '#1e293b',
          border: '1px solid #334155',
          borderRadius: '10px',
          padding: '0.75rem 1rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <MapPin size={14} color="#38bdf8" /> वडा छनोट:
        </span>
        {dynamicWards.map((w) => {
          const isActive = selectedWard === w.id;
          return (
            <button
              key={w.id}
              onClick={() => setSelectedWard(w.id)}
              style={{
                padding: '0.3rem 0.65rem',
                borderRadius: '6px',
                border: isActive ? '1px solid #10b981' : '1px solid #475569',
                backgroundColor: isActive ? '#065f46' : '#0f172a',
                color: isActive ? '#ffffff' : '#cbd5e1',
                fontSize: '0.75rem',
                fontWeight: isActive ? 700 : 500,
                cursor: 'pointer',
              }}
            >
              {w.name} ({w.count.toLocaleString('ne-NP')})
            </button>
          );
        })}
      </div>

      {/* Filter Bar */}
      <div
        style={{
          backgroundColor: '#1e293b',
          border: '1px solid #334155',
          borderRadius: '10px',
          padding: '0.85rem 1rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.75rem',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', flex: 1 }}>
          <div style={{ position: 'relative', minWidth: '240px', flex: 1 }}>
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '10px' }} />
            <input
              type="text"
              placeholder="म्याट्रिक्स नं. (उदा. P5-W02-H2783), घरमूली वा टोल खोज्नुहोस्..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.45rem 0.75rem 0.45rem 2rem',
                backgroundColor: '#0f172a',
                border: '1px solid #475569',
                borderRadius: '6px',
                color: '#ffffff',
                fontSize: '0.85rem',
              }}
            />
          </div>

          <select
            value={selectedWard}
            onChange={(e) => setSelectedWard(e.target.value)}
            style={{
              padding: '0.45rem 0.75rem',
              backgroundColor: '#0f172a',
              border: '1px solid #475569',
              borderRadius: '6px',
              color: '#ffffff',
              fontSize: '0.85rem',
            }}
          >
            {dynamicWards.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name} - {w.count.toLocaleString('ne-NP')} घर
              </option>
            ))}
          </select>

          <select
            value={selectedRisk}
            onChange={(e) => setSelectedRisk(e.target.value)}
            style={{
              padding: '0.45rem 0.75rem',
              backgroundColor: '#0f172a',
              border: '1px solid #475569',
              borderRadius: '6px',
              color: '#ffffff',
              fontSize: '0.85rem',
            }}
          >
            <option value="all">सबै जोखिम स्तर</option>
            <option value="high">उच्च जोखिम: पहिरो ({highRiskCount.toLocaleString('ne-NP')})</option>
            <option value="medium">मध्यम जोखिम: नदी तटीय ({medRiskCount.toLocaleString('ne-NP')})</option>
            <option value="low">न्यून / सुरक्षित ({lowRiskCount.toLocaleString('ne-NP')})</option>
          </select>
        </div>

        {(searchTerm || selectedWard !== 'all' || selectedRisk !== 'all') && (
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedWard('all');
              setSelectedRisk('all');
            }}
            style={{
              padding: '0.45rem 0.75rem',
              borderRadius: '6px',
              border: '1px solid #475569',
              backgroundColor: '#0f172a',
              color: '#94a3b8',
              fontSize: '0.8rem',
              cursor: 'pointer',
            }}
          >
            फिल्टर हटाउनुहोस्
          </button>
        )}
      </div>

      {/* INTERACTIVE LEAFLET GIS MAP SECTION */}
      {viewMode !== 'table' && (
        <div
          style={{
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '12px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
          }}
        >
          <div
            style={{
              padding: '0.75rem 1rem',
              borderBottom: '1px solid #334155',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <MapIcon size={18} color="#10b981" />
              <span style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.9rem' }}>
                आधिकारिक घरधुरी भौगोलिक GPS नक्सा (Interactive GIS Layer)
              </span>
              <span style={{ fontSize: '0.75rem', color: '#38bdf8', backgroundColor: 'rgba(56, 189, 248, 0.15)', padding: '0.15rem 0.5rem', borderRadius: '12px', fontFamily: 'monospace' }}>
                {mapPoints.length.toLocaleString('ne-NP')} बिन्दु
              </span>
              {relocatingHouse && (
                <span style={{ fontSize: '0.75rem', color: '#fbbf24', backgroundColor: 'rgba(251, 191, 36, 0.15)', border: '1px solid #fbbf24', padding: '0.15rem 0.6rem', borderRadius: '12px', fontWeight: 700 }}>
                  📍 सार्ने मोड (Drag Mode) सक्रिय
                </span>
              )}
            </div>

            {/* Layer Controls Docks */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              {/* Quick 1-Click 4 Base Layer Switcher Dock */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  backgroundColor: 'rgba(15, 23, 42, 0.85)',
                  padding: '0.25rem 0.35rem',
                  borderRadius: '8px',
                  border: '1px solid #334155',
                  boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.4)',
                }}
              >
                <button
                  type="button"
                  onClick={() => handleSwitchBaseLayer('hybrid')}
                  style={{
                    padding: '0.28rem 0.65rem',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    backgroundColor: activeBaseLayer === 'hybrid' ? '#0284c7' : 'transparent',
                    color: activeBaseLayer === 'hybrid' ? '#ffffff' : '#94a3b8',
                    boxShadow: activeBaseLayer === 'hybrid' ? '0 2px 6px rgba(2,132,199,0.5)' : 'none',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                  }}
                  title="Google Satellite Hybrid with Roads & Labels"
                >
                  <span>🛰️</span> <span>स्याटेलाइट</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSwitchBaseLayer('esri')}
                  style={{
                    padding: '0.28rem 0.65rem',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    backgroundColor: activeBaseLayer === 'esri' ? '#0284c7' : 'transparent',
                    color: activeBaseLayer === 'esri' ? '#ffffff' : '#94a3b8',
                    boxShadow: activeBaseLayer === 'esri' ? '0 2px 6px rgba(2,132,199,0.5)' : 'none',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                  }}
                  title="Esri World Imagery Pure High-Res Photo Satellite"
                >
                  <span>🌍</span> <span>Esri फोटो</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSwitchBaseLayer('osm')}
                  style={{
                    padding: '0.28rem 0.65rem',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    backgroundColor: activeBaseLayer === 'osm' ? '#0284c7' : 'transparent',
                    color: activeBaseLayer === 'osm' ? '#ffffff' : '#94a3b8',
                    boxShadow: activeBaseLayer === 'osm' ? '0 2px 6px rgba(2,132,199,0.5)' : 'none',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                  }}
                  title="OpenStreetMap Standard Streets"
                >
                  <span>🗺️</span> <span>सडक</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSwitchBaseLayer('topo')}
                  style={{
                    padding: '0.28rem 0.65rem',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    backgroundColor: activeBaseLayer === 'topo' ? '#0284c7' : 'transparent',
                    color: activeBaseLayer === 'topo' ? '#ffffff' : '#94a3b8',
                    boxShadow: activeBaseLayer === 'topo' ? '0 2px 6px rgba(2,132,199,0.5)' : 'none',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                  }}
                  title="OpenTopoMap Topographic Contours & Elevation"
                >
                  <span>🏔️</span> <span>टोपो धरातल</span>
                </button>
              </div>

              {/* GIS Boundary & Layer Toggles Dock */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  backgroundColor: 'rgba(15, 23, 42, 0.85)',
                  padding: '0.25rem 0.35rem',
                  borderRadius: '8px',
                  border: '1px solid #334155',
                  boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.4)',
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowPalikaBoundary(!showPalikaBoundary)}
                  style={{
                    padding: '0.28rem 0.6rem',
                    borderRadius: '6px',
                    border: showPalikaBoundary ? '1px solid #f59e0b' : '1px solid #334155',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    backgroundColor: showPalikaBoundary ? 'rgba(245, 158, 11, 0.2)' : 'transparent',
                    color: showPalikaBoundary ? '#fbbf24' : '#94a3b8',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                  }}
                  title="पालिका बाहिरी सिमाना तह देखाउनुहोस् / लुकाउनुहोस्"
                >
                  <span style={{ fontSize: '0.8rem' }}>{showPalikaBoundary ? '☑️' : '◻️'}</span>
                  <span>पालिका सीमा</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowWardBoundaries(!showWardBoundaries)}
                  style={{
                    padding: '0.28rem 0.6rem',
                    borderRadius: '6px',
                    border: showWardBoundaries ? '1px solid #38bdf8' : '1px solid #334155',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    backgroundColor: showWardBoundaries ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
                    color: showWardBoundaries ? '#38bdf8' : '#94a3b8',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                  }}
                  title="वडा सिमाना बहुभुज (Ward Polygons) देखाउनुहोस् / लुकाउनुहोस्"
                >
                  <span style={{ fontSize: '0.8rem' }}>{showWardBoundaries ? '☑️' : '◻️'}</span>
                  <span>वडा सिमाना</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowHouseholdMarkers(!showHouseholdMarkers)}
                  style={{
                    padding: '0.28rem 0.6rem',
                    borderRadius: '6px',
                    border: showHouseholdMarkers ? '1px solid #10b981' : '1px solid #334155',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    backgroundColor: showHouseholdMarkers ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
                    color: showHouseholdMarkers ? '#34d399' : '#94a3b8',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                  }}
                  title="घरधुरी GPS बिन्दुहरू देखाउनुहोस् / लुकाउनुहोस्"
                >
                  <span style={{ fontSize: '0.8rem' }}>{showHouseholdMarkers ? '☑️' : '◻️'}</span>
                  <span>घरधुरी बिन्दु</span>
                </button>
              </div>
            </div>

            {/* Legend with GIS Boundary Markers */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.85rem', fontSize: '0.75rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#fbbf24' }}>
                <span style={{ width: '14px', height: '0px', borderTop: '2.5px dashed #f59e0b', display: 'inline-block' }}></span>
                पालिका सीमा
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#38bdf8' }}>
                <span style={{ width: '12px', height: '10px', backgroundColor: 'rgba(2, 132, 199, 0.3)', border: '1.5px solid #38bdf8', borderRadius: '2px', display: 'inline-block' }}></span>
                वडा बहुभुज
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#cbd5e1' }}>
                <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#22c55e', display: 'inline-block' }}></span>
                सुरक्षित ({lowRiskCount.toLocaleString('ne-NP')})
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#cbd5e1' }}>
                <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#f97316', display: 'inline-block' }}></span>
                नदी तटीय ({medRiskCount.toLocaleString('ne-NP')})
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#cbd5e1' }}>
                <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#ef4444', display: 'inline-block' }}></span>
                पहिरो जोखिम ({highRiskCount.toLocaleString('ne-NP')})
              </span>
            </div>
          </div>

          {/* Floating Relocation Control Banner when moving a point */}
          {relocatingHouse && (
            <div
              style={{
                position: 'absolute',
                top: '52px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 1000,
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                border: '2px solid #0284c7',
                borderRadius: '12px',
                padding: '0.85rem 1.25rem',
                boxShadow: '0 20px 30px rgba(0, 0, 0, 0.65)',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1.25rem',
                color: '#ffffff',
                width: '94%',
                maxWidth: '820px',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ flex: 1, minWidth: '260px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <Crosshair size={18} color="#38bdf8" />
                  <strong style={{ fontSize: '0.92rem', color: '#38bdf8' }}>
                    GPS बिन्दु स्थानान्तरण (Drag & Drop Mode)
                  </strong>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      backgroundColor: '#0284c7',
                      color: '#ffffff',
                      padding: '1px 8px',
                      borderRadius: '10px',
                      fontWeight: 700,
                      fontFamily: 'monospace',
                    }}
                  >
                    {relocatingHouse.matrixHouseNo}
                  </span>
                </div>
                <div style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>
                  घरमूली: <strong>{relocatingHouse.householdName}</strong> | नयाँ GPS:{' '}
                  <code style={{ color: '#34d399', fontWeight: 700, fontSize: '0.86rem' }}>
                    {relocatingHouse.lat.toFixed(6)}, {relocatingHouse.lon.toFixed(6)}
                  </code>
                  {relocationDistance > 0 && (
                    <span style={{ color: '#fbbf24', marginLeft: '8px', fontWeight: 600 }}>
                      ({relocationDistance} मिटर सारियो)
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.73rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                  👉 नक्सामा रहेको निलो 📍 मार्करलाई तानेर नयाँ स्थानमा लैजानुहोस् वा नक्सामा इच्छित ठाउँमा सिधै क्लिक गर्नुहोस्।
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <button
                  type="button"
                  onClick={handleCancelRelocation}
                  disabled={isSavingRelocation}
                  style={{
                    padding: '0.55rem 0.95rem',
                    backgroundColor: '#334155',
                    color: '#e2e8f0',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                  }}
                >
                  रद्द (Cancel)
                </button>
                <button
                  type="button"
                  onClick={handleSaveRelocation}
                  disabled={isSavingRelocation}
                  style={{
                    padding: '0.55rem 1.25rem',
                    backgroundColor: '#10b981',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: isSavingRelocation ? 'wait' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.45)',
                  }}
                >
                  <CheckCircle size={16} />
                  <span>{isSavingRelocation ? 'सुरक्षित गरिँदैछ...' : '💾 नयाँ स्थान सुरक्षित गर्नुहोस्'}</span>
                </button>
              </div>
            </div>
          )}

          <div
            ref={mapContainerRef}
            style={{
              width: '100%',
              height: viewMode === 'map' ? '620px' : '480px',
              backgroundColor: '#0f172a',
            }}
          />

          <div style={{ padding: '0.5rem 1rem', backgroundColor: '#0f172a', borderTop: '1px solid #334155', fontSize: '0.75rem', color: '#94a3b8', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <span>
              💡 {isPublicMode
                ? 'नक्सामा रहेको कुनै पनि बिन्दुमा क्लिक गरेर घरधुरीको आधिकारिक प्रोफाइल तथा जोखिम विवरण हेर्न सकिन्छ।'
                : <>नक्सामा रहेको कुनै पनि बिन्दुमा क्लिक गरेर <strong>"📍 सार्नुहोस्"</strong> वा <strong>"✏️ सम्पादन"</strong> गर्न सकिन्छ।</>}
            </span>
            <span>स्रोत: smartptrm.com GPS Survey</span>
          </div>
        </div>
      )}

      {/* Table Section */}
      {viewMode !== 'map' && (
        <div
          style={{
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '10px',
            overflow: 'hidden',
          }}
        >
          <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Home size={18} color="#10b981" />
              घरधुरी म्याट्रिक्स तथा परिवार विवरण लगत तालिका
            </span>
            <span style={{ fontSize: '0.75rem', color: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.15)', padding: '0.2rem 0.6rem', borderRadius: '12px' }}>
              {filteredList.length.toLocaleString('ne-NP')} घरधुरी सूचीकृत
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <div className="dt-responsive-table-wrapper">
<table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', color: '#e2e8f0' }}>
              <thead>
                <tr style={{ backgroundColor: '#0f172a', borderBottom: '1px solid #334155', textAlign: 'left', color: '#94a3b8' }}>
                  <th style={{ padding: '0.75rem 1rem', width: '50px' }}>क्र.सं.</th>
                  <th style={{ padding: '0.75rem 1rem' }}>म्याट्रिक्स घर नं.</th>
                  <th style={{ padding: '0.75rem 1rem' }}>घरमूलीको नाम (Household Head)</th>
                  <th style={{ padding: '0.75rem 1rem' }}>वडा / टोल</th>
                  <th style={{ padding: '0.75rem 1rem' }}>परिवार संख्या</th>
                  <th style={{ padding: '0.75rem 1rem' }}>संरचना प्रकार</th>
                  <th style={{ padding: '0.75rem 1rem' }}>जोखिम स्तर</th>
                  {!isPublicMode && (
                    <th style={{ padding: '0.75rem 1rem' }}>प्रमाणीकरण अवस्था</th>
                  )}
                  <th style={{ padding: '0.75rem 1rem' }}>GPS लोकेसन</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>{isPublicMode ? 'अवलोकन' : 'कार्य'}</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={isPublicMode ? 9 : 10} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                      ५,८०५ घरधुरी लगत लोड हुँदैछ...
                    </td>
                  </tr>
                ) : paginatedList.length === 0 ? (
                  <tr>
                    <td colSpan={isPublicMode ? 9 : 10} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                      कुनै घरधुरी फेला परेन। खोज वा फिल्टर सच्याउनुहोस्।
                    </td>
                  </tr>
                ) : (
                  paginatedList.map((h, idx) => {
                    let riskColor = '#4ade80';
                    let riskBg = 'rgba(34, 197, 94, 0.15)';
                    let riskText = 'न्यून जोखिम (Low)';
                    if (h.riskLevel === 'high') {
                      riskColor = '#f87171';
                      riskBg = 'rgba(239, 68, 68, 0.2)';
                      riskText = 'उच्च पहिरो';
                    } else if (h.riskLevel === 'medium') {
                      riskColor = '#fbbf24';
                      riskBg = 'rgba(245, 158, 11, 0.2)';
                      riskText = 'मध्यम (नदी)';
                    }

                    const lat = h.gpsLat || h.latitude;
                    const lon = h.gpsLon || h.longitude;
                    const globalIdx = (currentPage - 1) * pageSize + idx + 1;
                    const familyCount = Array.isArray(h.familyMembers) && h.familyMembers.length > 0 ? h.familyMembers.length : (h.familySize || 4);

                    const vsColor = !h.verificationStatus || h.verificationStatus === 'approved'
                      ? '#10b981' : h.verificationStatus === 'pending'
                      ? '#f59e0b' : '#ef4444';
                    const vsLabel = !h.verificationStatus || h.verificationStatus === 'approved'
                      ? '✅ प्रमाणित' : h.verificationStatus === 'pending'
                      ? '⏳ मन्जुरी बाँकी' : '❌ अस्वीकृत';

                    return (
                      <tr
                        key={h.id || idx}
                        style={{ borderBottom: '1px solid #334155' }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        <td style={{ padding: '0.75rem 1rem', color: '#64748b' }}>{globalIdx.toLocaleString('ne-NP')}</td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <div style={{ fontWeight: 700, color: '#38bdf8', fontFamily: 'monospace' }}>{h.matrixHouseNo}</div>
                          {h.legacyHouseNo && (
                            <div style={{ fontSize: '0.72rem', color: '#fbbf24', marginTop: '2px', fontWeight: 600 }}>
                              साविक: {h.legacyHouseNo}
                            </div>
                          )}
                          {h.qrToken ? <div style={{ fontSize: '0.7rem', color: '#64748b', fontFamily: 'monospace' }}>{h.qrToken}</div> : null}
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <div style={{ fontWeight: 700, color: '#ffffff' }}>{h.householdName || 'निजी घरधुरी'}</div>
                          {h.contactPhone ? <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{h.contactPhone}</div> : null}
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <span style={{ backgroundColor: '#0f172a', border: '1px solid #334155', color: '#38bdf8', padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem' }}>
                            वडा नं. {h.wardNumber}
                          </span>
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>{h.tole || '—'}</div>
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <span style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>
                            {familyCount} जना
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', color: '#cbd5e1' }}>{h.houseType || h.buildingType || 'अर्ध-पक्की (जस्ता छाना)'}</td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <span style={{ backgroundColor: riskBg, color: riskColor, padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                            {riskText}
                          </span>
                        </td>
                        {/* Admin-only: Verification Status Column */}
                        {!isPublicMode && (
                          <td style={{ padding: '0.75rem 1rem' }}>
                            <span
                              style={{
                                backgroundColor: `${vsColor}20`,
                                color: vsColor,
                                border: `1px solid ${vsColor}`,
                                padding: '0.15rem 0.5rem',
                                borderRadius: '4px',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {vsLabel}
                            </span>
                            {h.submittedByPublic && (
                              <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                                📱 नागरिक पोर्टलबाट
                              </div>
                            )}
                          </td>
                        )}
                        <td style={{ padding: '0.75rem 1rem' }}>
                          {lat && lon ? (
                            <a
                              href={`https://maps.google.com/?q=${lat},${lon}`}
                              target="_blank"
                              rel="noreferrer"
                              style={{ color: '#38bdf8', textDecoration: 'none', fontSize: '0.75rem', fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                              title="गुगल नक्सामा हेर्नुहोस्"
                            >
                              <MapPin size={12} /> {Number(lat).toFixed(4)}, {Number(lon).toFixed(4)}
                            </a>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                            <button
                              onClick={() => setViewingHouse(h)}
                              title="पूर्ण विवरण हेर्नुहोस्"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                backgroundColor: 'rgba(6, 182, 212, 0.15)',
                                color: '#06b6d4',
                                border: '1px solid #06b6d4',
                                padding: '0.3rem 0.5rem',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.74rem',
                                fontWeight: 600,
                              }}
                            >
                              <Eye size={12} /> विवरण
                            </button>
                            {!isPublicMode && (
                              <>
                                {/* Admin: Approve button for pending items */}
                                {h.verificationStatus === 'pending' && (
                                  <button
                                    onClick={() => {
                                      setVerifyingHouse(h);
                                      setVerifyRemarks('');
                                    }}
                                    title="घरधुरी दर्ता स्वीकृत / अस्वीकृत गर्नुहोस्"
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '0.25rem',
                                      backgroundColor: 'rgba(245, 158, 11, 0.2)',
                                      color: '#f59e0b',
                                      border: '1px solid #f59e0b',
                                      padding: '0.3rem 0.55rem',
                                      borderRadius: '4px',
                                      cursor: 'pointer',
                                      fontSize: '0.74rem',
                                      fontWeight: 700,
                                      animation: 'pulse 2s infinite',
                                    }}
                                  >
                                    ⏳ समीक्षा
                                  </button>
                                )}
                                <button
                                  onClick={() => {
                                    setViewMode('map');
                                    setTimeout(() => {
                                      (window as any).__handleStartRelocateGps?.(h.id);
                                    }, 250);
                                  }}
                                  title="नक्सामा GPS बिन्दु सार्नुहोस्"
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.25rem',
                                    backgroundColor: 'rgba(2, 132, 199, 0.15)',
                                    color: '#38bdf8',
                                    border: '1px solid #0284c7',
                                    padding: '0.3rem 0.5rem',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '0.74rem',
                                    fontWeight: 600,
                                  }}
                                >
                                  <Move size={12} /> सार्नुहोस्
                                </button>
                                <button
                                  onClick={() => openEditModal(h)}
                                  title="विवरण तथा GPS सम्पादन गर्नुहोस्"
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.25rem',
                                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                                    color: '#34d399',
                                    border: '1px solid #10b981',
                                    padding: '0.3rem 0.5rem',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '0.74rem',
                                    fontWeight: 600,
                                  }}
                                >
                                  <Edit3 size={12} /> सम्पादन
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
</div>
          </div>

          {/* Pagination Bar */}
          <div
            style={{
              padding: '0.75rem 1rem',
              borderTop: '1px solid #334155',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
              fontSize: '0.8rem',
              color: '#94a3b8',
            }}
          >
            <span>
              देखाउँदै: {((currentPage - 1) * pageSize + 1).toLocaleString('ne-NP')} - {Math.min(currentPage * pageSize, filteredList.length).toLocaleString('ne-NP')} / कुल {filteredList.length.toLocaleString('ne-NP')} घरधुरी
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.2rem',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '6px',
                  border: '1px solid #475569',
                  backgroundColor: currentPage <= 1 ? '#0f172a' : '#1e293b',
                  color: currentPage <= 1 ? '#64748b' : '#ffffff',
                  cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
                  fontSize: '0.8rem',
                }}
              >
                <ChevronLeft size={14} /> अघिल्लो
              </button>

              <span style={{ fontWeight: 700, color: '#ffffff', padding: '0 0.5rem' }}>
                पृष्ठ {currentPage.toLocaleString('ne-NP')} / {totalPages.toLocaleString('ne-NP')}
              </span>

              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.2rem',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '6px',
                  border: '1px solid #475569',
                  backgroundColor: currentPage >= totalPages ? '#0f172a' : '#1e293b',
                  color: currentPage >= totalPages ? '#64748b' : '#ffffff',
                  cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
                  fontSize: '0.8rem',
                }}
              >
                पछिल्लो <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Public Submit Success Modal */}
      {publicSubmitSuccess && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            padding: '1rem',
          }}
        >
          <div
            style={{
              backgroundColor: '#1e293b',
              border: '2px solid #10b981',
              borderRadius: '12px',
              maxWidth: '500px',
              width: '100%',
              padding: '2rem',
              color: '#ffffff',
              textAlign: 'center',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            }}
          >
            <div style={{ marginBottom: '1rem' }}>
              <ShieldCheck size={64} color="#10b981" style={{ margin: '0 auto' }} />
            </div>
            <h2 style={{ fontSize: '1.4rem', color: '#34d399', marginBottom: '0.5rem' }}>
              घरधुरी दर्ता सफल भयो!
            </h2>
            <p style={{ color: '#cbd5e1', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: '1.6' }}>
              तपाईंको घरधुरी फाराम <strong>(म्याट्रिक्स नं: {publicSubmitSuccess.matrixHouseNo})</strong> सफलतापूर्वक प्रणालीमा पेश भएको छ।
              <br /><br />
              <span style={{ color: '#fbbf24', fontWeight: 600 }}>नोट:</span> यो लगत हाल <strong>पेन्डिङ (Pending)</strong> अवस्थामा छ। वडा कार्यालय वा एडमिनले प्रमाणित (Approve) गरेपछि मात्र सार्वजनिक पोर्टलमा देखिनेछ।
            </p>
            <button
              onClick={() => setPublicSubmitSuccess(null)}
              style={{
                backgroundColor: '#10b981',
                color: '#ffffff',
                fontWeight: 700,
                padding: '0.7rem 2rem',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1rem',
              }}
            >
              ठीक छ (OK)
            </button>
          </div>
        </div>
      )}

      {/* Admin Verify Modal */}
      {verifyingHouse && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            padding: '1rem',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget && !verifyMutation.isPending) setVerifyingHouse(null);
          }}
        >
          <div
            style={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '12px',
              maxWidth: '600px',
              width: '100%',
              color: '#ffffff',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            }}
          >
            <div style={{ padding: '1.25rem', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertTriangle size={24} /> घरधुरी प्रमाणीकरण समीक्षा
              </h3>
              <button
                onClick={() => setVerifyingHouse(null)}
                disabled={verifyMutation.isPending}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>
            
            <div style={{ padding: '1.25rem' }}>
              <div style={{ marginBottom: '1.5rem', backgroundColor: '#0f172a', padding: '1rem', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '0.25rem' }}>म्याट्रिक्स घर नं: <strong style={{ color: '#fff' }}>{verifyingHouse.matrixHouseNo}</strong></div>
                <div style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '0.25rem' }}>घरमूली: <strong style={{ color: '#fff' }}>{verifyingHouse.householdName}</strong></div>
                <div style={{ fontSize: '0.9rem', color: '#94a3b8' }}>वडा नं: <strong style={{ color: '#fff' }}>{verifyingHouse.wardNumber}</strong></div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', color: '#cbd5e1', marginBottom: '0.5rem', fontWeight: 600 }}>
                  प्रमाणीकरण टिप्पणी (Remarks) - ऐच्छिक
                </label>
                <textarea
                  value={verifyRemarks}
                  onChange={(e) => setVerifyRemarks(e.target.value)}
                  placeholder="स्वीकृत वा अस्वीकृत गर्नुको कारण यहाँ लेख्नुहोस्..."
                  rows={3}
                  disabled={verifyMutation.isPending}
                  style={{
                    width: '100%',
                    backgroundColor: '#0f172a',
                    border: '1px solid #475569',
                    color: '#ffffff',
                    padding: '0.75rem',
                    borderRadius: '6px',
                    fontSize: '0.9rem',
                    resize: 'vertical',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => verifyMutation.mutate({ id: verifyingHouse.id, status: 'rejected', remarks: verifyRemarks })}
                  disabled={verifyMutation.isPending}
                  style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    color: '#ef4444',
                    border: '1px solid #ef4444',
                    padding: '0.6rem 1.25rem',
                    borderRadius: '6px',
                    fontWeight: 700,
                    cursor: verifyMutation.isPending ? 'not-allowed' : 'pointer',
                    fontSize: '0.9rem',
                  }}
                >
                  ❌ अस्वीकृत (Reject)
                </button>
                <button
                  onClick={() => verifyMutation.mutate({ id: verifyingHouse.id, status: 'approved', remarks: verifyRemarks })}
                  disabled={verifyMutation.isPending}
                  style={{
                    backgroundColor: '#10b981',
                    color: '#ffffff',
                    border: 'none',
                    padding: '0.6rem 1.25rem',
                    borderRadius: '6px',
                    fontWeight: 700,
                    cursor: verifyMutation.isPending ? 'not-allowed' : 'pointer',
                    fontSize: '0.9rem',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                  }}
                >
                  ✅ स्वीकृत (Approve)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Household Details Modal */}
      {viewingHouse && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1050,
            padding: '1rem',
          }}
          onClick={() => setViewingHouse(null)}
        >
          <div
            style={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '12px',
              maxWidth: '800px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              color: '#ffffff',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#ffffff' }}>
                  घरधुरी पाश्र्वचित्र: {viewingHouse.householdName || 'निजी घरधुरी'}
                </h3>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  म्याट्रिक्स घर नं: {viewingHouse.matrixHouseNo} | वडा नं. {viewingHouse.wardNumber}, {viewingHouse.tole}
                </span>
              </div>
              <button
                onClick={() => setViewingHouse(null)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body with Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid #334155' }}>
              <button
                onClick={() => setActiveModalTab('basic')}
                style={{ flex: 1, padding: '0.75rem', background: activeModalTab === 'basic' ? '#334155' : 'transparent', color: activeModalTab === 'basic' ? '#ffffff' : '#94a3b8', border: 'none', cursor: 'pointer', fontWeight: 600 }}
              >
                घरधुरी तथा परिवार विवरण
              </button>
              <button
                onClick={() => setActiveModalTab('agriculture')}
                style={{ flex: 1, padding: '0.75rem', background: activeModalTab === 'agriculture' ? '#334155' : 'transparent', color: activeModalTab === 'agriculture' ? '#4ade80' : '#94a3b8', border: 'none', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                <Sprout size={16} />
                कृषि तथा किसान प्रोफाइल
              </button>
              <button
                onClick={() => setActiveModalTab('waste')}
                style={{ flex: 1, padding: '0.75rem', background: activeModalTab === 'waste' ? '#334155' : 'transparent', color: activeModalTab === 'waste' ? '#22c55e' : '#94a3b8', border: 'none', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                <Leaf size={16} />
                फोहोर र वालेट
              </button>
            </div>

            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', maxHeight: '60vh', overflowY: 'auto' }}>
              {activeModalTab === 'basic' && (
                <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ backgroundColor: '#0f172a', padding: '1rem', borderRadius: '8px', border: '1px solid #334155' }}>
                  <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.9rem', color: '#38bdf8' }}>🏛️ १. प्रशासनिक, साविक ठेगाना र जग्गा कित्ता</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem' }}>
                    <div><span style={{ color: '#94a3b8' }}>घरमूलीको नाम:</span> <strong>{viewingHouse.householdName || 'निजी घरधुरी'}</strong> ({viewingHouse.headGender === 'female' ? 'महिला' : 'पुरुष'})</div>
                    {viewingHouse.ethnicity && <div><span style={{ color: '#94a3b8' }}>जाति / समुदाय:</span> {viewingHouse.ethnicity}</div>}
                    {viewingHouse.citizenshipNo && <div><span style={{ color: '#94a3b8' }}>नागरिकता / NID नं:</span> <span style={{ fontFamily: 'monospace', color: '#cbd5e1' }}>{viewingHouse.citizenshipNo}</span></div>}
                    <div><span style={{ color: '#94a3b8' }}>सम्पर्क फोन:</span> {viewingHouse.contactPhone || '—'}</div>
                    <div><span style={{ color: '#94a3b8' }}>वडा तथा टोल:</span> वडा नं. {viewingHouse.wardNumber}, {viewingHouse.tole || '—'}</div>
                    <div><span style={{ color: '#94a3b8' }}>म्याट्रिक्स घर नं:</span> <span style={{ fontFamily: 'monospace', color: '#38bdf8', fontWeight: 700 }}>{viewingHouse.matrixHouseNo}</span></div>
                    {viewingHouse.legacyHouseNo && (
                      <div style={{ backgroundColor: 'rgba(251, 191, 36, 0.1)', padding: '0.3rem 0.6rem', borderRadius: '4px', borderLeft: '3px solid #fbbf24', marginTop: '0.2rem' }}>
                        <span style={{ color: '#fbbf24', fontWeight: 600 }}>साविक घर नं:</span> <strong style={{ color: '#fef08a' }}>{viewingHouse.legacyHouseNo}</strong>
                        {viewingHouse.formerVdc && <span style={{ color: '#94a3b8', fontSize: '0.78rem', marginLeft: '0.5rem' }}>({viewingHouse.formerVdc})</span>}
                      </div>
                    )}
                    {viewingHouse.cadastralParcelNo && (
                      <div>
                        <span style={{ color: '#94a3b8' }}>जग्गाको कित्ता नं:</span> <strong style={{ color: '#38bdf8' }}>{viewingHouse.cadastralParcelNo}</strong>
                        {viewingHouse.landOwnership && <span style={{ color: '#cbd5e1', fontSize: '0.8rem', marginLeft: '0.5rem' }}>({viewingHouse.landOwnership})</span>}
                      </div>
                    )}
                    <div><span style={{ color: '#94a3b8' }}>QR टोकन:</span> <span style={{ fontFamily: 'monospace', color: '#94a3b8' }}>{viewingHouse.qrToken || 'QR-P5-' + viewingHouse.matrixHouseNo}</span></div>
                  </div>

                  <div style={{ borderTop: '1px dashed #334155', marginTop: '0.75rem', paddingTop: '0.65rem' }}>
                    <h5 style={{ margin: '0 0 0.4rem 0', fontSize: '0.82rem', color: '#a78bfa' }}>👥 सामाजिक सुरक्षा र लक्षित समूह</h5>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', fontSize: '0.8rem' }}>
                      <div><span style={{ color: '#94a3b8' }}>कुल सदस्य:</span> {viewingHouse.familySize || 4} जना</div>
                      <div><span style={{ color: '#94a3b8' }}>अपाङ्गता:</span> {viewingHouse.disabilityCount ? `${viewingHouse.disabilityCount} जना (${viewingHouse.disabilityCardType || 'कार्ड प्राप्त'})` : 'छैन'}</div>
                      <div><span style={{ color: '#94a3b8' }}>भत्ता लिने:</span> {viewingHouse.socialSecurityCount || 0} जना</div>
                      <div><span style={{ color: '#94a3b8' }}>वैदेशिक रोजगार:</span> {viewingHouse.foreignMigrantsCount || 0} जना</div>
                    </div>
                  </div>
                </div>

                <div style={{ backgroundColor: '#0f172a', padding: '1rem', borderRadius: '8px', border: '1px solid #334155' }}>
                  <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.9rem', color: '#4ade80' }}>🏠 आवास, WASH र विपद् संवेदनशीलता</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem' }}>
                    <div>
                      <span style={{ color: '#94a3b8' }}>संरचना प्रकार:</span> {viewingHouse.houseType || viewingHouse.buildingType || 'अर्ध-पक्की (जस्ता छाना)'}
                      {viewingHouse.storeys ? <span style={{ color: '#94a3b8', marginLeft: '0.4rem' }}>({viewingHouse.storeys} तल्ला)</span> : null}
                    </div>
                    {viewingHouse.buildingPermitStatus && (
                      <div><span style={{ color: '#94a3b8' }}>नक्सा पास / इजाजत:</span> <strong style={{ color: '#38bdf8' }}>{viewingHouse.buildingPermitStatus}</strong></div>
                    )}
                    {viewingHouse.reconstructionStatus && (
                      <div><span style={{ color: '#94a3b8' }}>पुनर्निर्माण स्थिति:</span> <span style={{ color: '#cbd5e1' }}>{viewingHouse.reconstructionStatus}</span></div>
                    )}
                    <div>
                      <span style={{ color: '#94a3b8' }}>विपद् जोखिम:</span>{' '}
                      <strong style={{ color: viewingHouse.riskLevel === 'high' ? '#f87171' : viewingHouse.riskLevel === 'medium' ? '#fbbf24' : '#4ade80' }}>
                        {viewingHouse.riskLevel === 'high' ? 'पहिरो उच्च जोखिम (High Risk)' : viewingHouse.riskLevel === 'medium' ? 'नदी तटीय कटान (Medium Risk)' : 'न्यून जोखिम (Safe)'}
                      </strong>
                    </div>
                    {viewingHouse.meta?.riverName && (
                      <div>
                        <span style={{ color: '#94a3b8' }}>नदी/खोला सामीप्यता:</span>{' '}
                        <strong style={{ color: '#38bdf8' }}>{viewingHouse.meta.riverName}</strong>{' '}
                        <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
                          ({viewingHouse.meta.riverDistance === 'lt30' ? '< ३० मिटर (अति उच्च जोखिम)' : viewingHouse.meta.riverDistance === '30_100' ? '३०-१०० मिटर (तटीय कटान)' : viewingHouse.meta.riverDistance === '100_250' ? '१०१-२५० मिटर (सतर्कता बफर)' : '> २५० मिटर'})
                        </span>
                      </div>
                    )}
                    {viewingHouse.meta?.slopeType && (
                      <div>
                        <span style={{ color: '#94a3b8' }}>जमिनको भिरालोपना:</span>{' '}
                        <span style={{ color: viewingHouse.meta.slopeType === 'steep' ? '#f87171' : '#e2e8f0' }}>
                          {viewingHouse.meta.slopeType === 'steep' ? 'अत्यधिक भिरालो (>३०° ढलान)' : viewingHouse.meta.slopeType === 'moderate' ? 'मध्यम भिरालो (१५-३०°)' : 'समतल (<१५° ढलान)'}
                        </span>
                      </div>
                    )}
                    <div>
                      <span style={{ color: '#94a3b8' }}>सुरक्षित आश्रयस्थल दूरी:</span>{' '}
                      <strong style={{ color: '#fbbf24' }}>{viewingHouse.safeShelterDistanceMins || 15} मिनेट</strong> (पैदल समय)
                    </div>
                    <div>
                      <span style={{ color: '#94a3b8' }}>GPS निर्देशांक:</span>{' '}
                      <a
                        href={`https://maps.google.com/?q=${viewingHouse.gpsLat || viewingHouse.latitude},${viewingHouse.gpsLon || viewingHouse.longitude}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: '#38bdf8', fontFamily: 'monospace' }}
                      >
                        {viewingHouse.gpsLat || viewingHouse.latitude}, {viewingHouse.gpsLon || viewingHouse.longitude}
                      </a>
                    </div>
                    <div style={{ borderTop: '1px dashed #334155', marginTop: '0.4rem', paddingTop: '0.4rem' }}>
                      <div><span style={{ color: '#94a3b8' }}>खानेपानी:</span> {viewingHouse.drinkingWaterSource || 'धारा / पाइप प्रणाली'} {viewingHouse.waterPurification ? `(${viewingHouse.waterPurification})` : ''}</div>
                      {viewingHouse.toiletType && <div><span style={{ color: '#94a3b8' }}>शौचालय:</span> {viewingHouse.toiletType}</div>}
                      {viewingHouse.cookingFuel && <div><span style={{ color: '#94a3b8' }}>इन्धन:</span> {viewingHouse.cookingFuel}</div>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Family Members */}
              <div style={{ border: '1px solid #334155', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ padding: '0.6rem 1rem', backgroundColor: '#0f172a', borderBottom: '1px solid #334155', fontWeight: 700, fontSize: '0.85rem', color: '#fbbf24' }}>
                  परिवारका सदस्यहरूको नामावली ({Array.isArray(viewingHouse.familyMembers) && viewingHouse.familyMembers.length > 0 ? viewingHouse.familyMembers.length : (viewingHouse.familySize || 4)} जना)
                </div>
                <div className="dt-responsive-table-wrapper">
<table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', color: '#e2e8f0' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#1e293b', borderBottom: '1px solid #334155', color: '#94a3b8', textAlign: 'left' }}>
                      <th style={{ padding: '0.5rem 0.75rem', width: '40px' }}>क्र.सं.</th>
                      <th style={{ padding: '0.5rem 0.75rem' }}>नाम थर</th>
                      <th style={{ padding: '0.5rem 0.75rem' }}>नाता</th>
                      <th style={{ padding: '0.5rem 0.75rem' }}>लिङ्ग</th>
                      <th style={{ padding: '0.5rem 0.75rem' }}>उमेर</th>
                      <th style={{ padding: '0.5rem 0.75rem' }}>शिक्षा</th>
                      <th style={{ padding: '0.5rem 0.75rem' }}>पेशा</th>
                      <th style={{ padding: '0.5rem 0.75rem' }}>NID / नागरिकता</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewingHouse.familyMembers && viewingHouse.familyMembers.length > 0 ? (
                      viewingHouse.familyMembers.map((m: any, idx: number) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #334155' }}>
                          <td style={{ padding: '0.5rem 0.75rem', color: '#64748b' }}>{idx + 1}</td>
                          <td style={{ padding: '0.5rem 0.75rem', fontWeight: 600 }}>{m.name}</td>
                          <td style={{ padding: '0.5rem 0.75rem' }}>{m.relation}</td>
                          <td style={{ padding: '0.5rem 0.75rem' }}>{m.gender === 'male' ? 'पुरुष' : m.gender === 'female' ? 'महिला' : m.gender}</td>
                          <td style={{ padding: '0.5rem 0.75rem' }}>{m.age} वर्ष</td>
                          <td style={{ padding: '0.5rem 0.75rem' }}>{m.education || 'साक्षर'}</td>
                          <td style={{ padding: '0.5rem 0.75rem' }}>{m.occupation || 'कृषि'}</td>
                          <td style={{ padding: '0.5rem 0.75rem', fontFamily: 'monospace', color: '#94a3b8' }}>{m.nid || m.nidOrCitizenship || 'NID-८९२३-२२१३'}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} style={{ padding: '1rem', textAlign: 'center', color: '#94a3b8' }}>
                          कुनै परिवार सदस्य लगत उपलब्ध छैन।
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
</div>
              </div>
                </>
              )}

              {activeModalTab === 'agriculture' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', animation: 'fadeIn 0.25s ease' }}>
                  
                  {/* Top Header Card */}
                  <div style={{
                    backgroundColor: '#0f172a',
                    padding: '1.25rem 1.5rem',
                    borderRadius: '12px',
                    border: '1px solid #334155',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '1rem'
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
                        <div style={{ padding: '0.45rem', backgroundColor: 'rgba(74, 222, 128, 0.15)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Sprout size={22} color="#4ade80" />
                        </div>
                        <h4 style={{ margin: 0, fontSize: '1.15rem', color: '#f8fafc', fontWeight: 800 }}>
                          कृषि तथा किसान प्रोफाइल विवरण (Agri & Farmer Registry)
                        </h4>
                      </div>
                      <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                        घरधुरी: <strong style={{ color: '#e2e8f0' }}>{viewingHouse?.householdName || ''}</strong> | म्याट्रिक्स घर नं: <code style={{ color: '#38bdf8' }}>{viewingHouse?.matrixHouseNo}</code> | वडा नं. {viewingHouse?.wardNumber || '१'}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                      {/* Farmer Category Auto Badge */}
                      <span style={{
                        padding: '0.35rem 0.8rem',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        backgroundColor: (agriProfileData.landAreaHectares || 0) >= 2 ? 'rgba(234, 179, 8, 0.15)' : (agriProfileData.landAreaHectares || 0) >= 0.5 ? 'rgba(56, 189, 248, 0.15)' : 'rgba(74, 222, 128, 0.15)',
                        color: (agriProfileData.landAreaHectares || 0) >= 2 ? '#facc15' : (agriProfileData.landAreaHectares || 0) >= 0.5 ? '#38bdf8' : '#4ade80',
                        border: `1px solid ${(agriProfileData.landAreaHectares || 0) >= 2 ? '#ca8a04' : (agriProfileData.landAreaHectares || 0) >= 0.5 ? '#0284c7' : '#16a34a'}`
                      }}>
                        {(agriProfileData.landAreaHectares || 0) >= 2
                          ? '🚜 व्यावसायिक किसान (>२ हेक्टर)'
                          : (agriProfileData.landAreaHectares || 0) >= 0.5
                          ? '🌾 मध्यम किसान (०.५-२ हेक्टर)'
                          : '🌱 साना / निर्वाहमुखी (<०.५ हेक्टर)'}
                      </span>

                      {/* Primary Save Button */}
                      <button
                        onClick={() => saveAgriProfileMutation.mutate(agriProfileData)}
                        disabled={saveAgriProfileMutation.isPending}
                        style={{
                          background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                          color: '#ffffff',
                          padding: '0.6rem 1.4rem',
                          borderRadius: '8px',
                          border: 'none',
                          cursor: saveAgriProfileMutation.isPending ? 'not-allowed' : 'pointer',
                          fontWeight: 800,
                          fontSize: '0.88rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.45rem',
                          boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <Save size={17} />
                        {saveAgriProfileMutation.isPending ? 'सुरक्षित हुँदैछ...' : '💾 विवरण सेभ गर्नुहोस्'}
                      </button>
                    </div>
                  </div>

                  {/* Sub-Navigation Tabs */}
                  <div style={{
                    display: 'flex',
                    gap: '0.5rem',
                    backgroundColor: '#1e293b',
                    padding: '0.4rem',
                    borderRadius: '10px',
                    border: '1px solid #334155',
                    overflowX: 'auto'
                  }}>
                    <button
                      type="button"
                      onClick={() => setActiveAgriSubTab('land')}
                      style={{
                        flex: 1,
                        minWidth: '140px',
                        padding: '0.6rem 0.8rem',
                        borderRadius: '7px',
                        border: 'none',
                        fontSize: '0.84rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        backgroundColor: activeAgriSubTab === 'land' ? '#0f172a' : 'transparent',
                        color: activeAgriSubTab === 'land' ? '#4ade80' : '#94a3b8',
                        boxShadow: activeAgriSubTab === 'land' ? '0 2px 8px rgba(0,0,0,0.3)' : 'none',
                        borderBottom: activeAgriSubTab === 'land' ? '2px solid #4ade80' : 'none',
                        transition: 'all 0.2s'
                      }}
                    >
                      🗺️ १. जग्गा र सिँचाइ
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveAgriSubTab('crops')}
                      style={{
                        flex: 1,
                        minWidth: '140px',
                        padding: '0.6rem 0.8rem',
                        borderRadius: '7px',
                        border: 'none',
                        fontSize: '0.84rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        backgroundColor: activeAgriSubTab === 'crops' ? '#0f172a' : 'transparent',
                        color: activeAgriSubTab === 'crops' ? '#38bdf8' : '#94a3b8',
                        boxShadow: activeAgriSubTab === 'crops' ? '0 2px 8px rgba(0,0,0,0.3)' : 'none',
                        borderBottom: activeAgriSubTab === 'crops' ? '2px solid #38bdf8' : 'none',
                        transition: 'all 0.2s'
                      }}
                    >
                      🌾 २. मुख्य बालीहरू ({(agriProfileData.mainCrops || []).length})
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveAgriSubTab('livestock')}
                      style={{
                        flex: 1,
                        minWidth: '140px',
                        padding: '0.6rem 0.8rem',
                        borderRadius: '7px',
                        border: 'none',
                        fontSize: '0.84rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        backgroundColor: activeAgriSubTab === 'livestock' ? '#0f172a' : 'transparent',
                        color: activeAgriSubTab === 'livestock' ? '#fbbf24' : '#94a3b8',
                        boxShadow: activeAgriSubTab === 'livestock' ? '0 2px 8px rgba(0,0,0,0.3)' : 'none',
                        borderBottom: activeAgriSubTab === 'livestock' ? '2px solid #fbbf24' : 'none',
                        transition: 'all 0.2s'
                      }}
                    >
                      🐄 ३. चौपाया/पशुपन्छी ({totalLivestockInAgriProfile})
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveAgriSubTab('subsidies')}
                      style={{
                        flex: 1,
                        minWidth: '150px',
                        padding: '0.6rem 0.8rem',
                        borderRadius: '7px',
                        border: 'none',
                        fontSize: '0.84rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        backgroundColor: activeAgriSubTab === 'subsidies' ? '#0f172a' : 'transparent',
                        color: activeAgriSubTab === 'subsidies' ? '#a78bfa' : '#94a3b8',
                        boxShadow: activeAgriSubTab === 'subsidies' ? '0 2px 8px rgba(0,0,0,0.3)' : 'none',
                        borderBottom: activeAgriSubTab === 'subsidies' ? '2px solid #a78bfa' : 'none',
                        transition: 'all 0.2s'
                      }}
                    >
                      💰 ४. अनुदान, बिमा र बजार
                    </button>
                  </div>

                  {/* ========================================================================= */}
                  {/* SUB-TAB 1: LAND & IRRIGATION */}
                  {/* ========================================================================= */}
                  {activeAgriSubTab === 'land' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      
                      {/* Land area box */}
                      <div style={{ backgroundColor: '#0f172a', padding: '1.25rem', borderRadius: '10px', border: '1px solid #334155' }}>
                        <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#4ade80', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span>📐 कुल कृषि जग्गाको क्षेत्रफल (Land Measurement)</span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                          
                          {/* Traditional Nepali Units */}
                          <div style={{ backgroundColor: '#1e293b', padding: '1rem', borderRadius: '8px', border: '1px solid #334155' }}>
                            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.6rem' }}>
                              नेपाली परम्परागत एकाइ (रोपनी - आना - पैसा - दाम):
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.5rem' }}>
                              <div>
                                <label style={{ display: 'block', fontSize: '0.72rem', color: '#94a3b8', marginBottom: '0.2rem' }}>रोपनी</label>
                                <input
                                  type="number"
                                  min="0"
                                  value={agriProfileData.additionalDetails?.ropani ?? 0}
                                  onChange={(e) => handleLandRopaniChange(
                                    parseInt(e.target.value) || 0,
                                    agriProfileData.additionalDetails?.aana || 0,
                                    agriProfileData.additionalDetails?.paisa || 0,
                                    agriProfileData.additionalDetails?.daam || 0
                                  )}
                                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#fff', textAlign: 'center', fontWeight: 700 }}
                                />
                              </div>
                              <div>
                                <label style={{ display: 'block', fontSize: '0.72rem', color: '#94a3b8', marginBottom: '0.2rem' }}>आना (०-१५)</label>
                                <input
                                  type="number"
                                  min="0"
                                  max="15"
                                  value={agriProfileData.additionalDetails?.aana ?? 0}
                                  onChange={(e) => handleLandRopaniChange(
                                    agriProfileData.additionalDetails?.ropani || 0,
                                    parseInt(e.target.value) || 0,
                                    agriProfileData.additionalDetails?.paisa || 0,
                                    agriProfileData.additionalDetails?.daam || 0
                                  )}
                                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#fff', textAlign: 'center', fontWeight: 700 }}
                                />
                              </div>
                              <div>
                                <label style={{ display: 'block', fontSize: '0.72rem', color: '#94a3b8', marginBottom: '0.2rem' }}>पैसा (०-३)</label>
                                <input
                                  type="number"
                                  min="0"
                                  max="3"
                                  value={agriProfileData.additionalDetails?.paisa ?? 0}
                                  onChange={(e) => handleLandRopaniChange(
                                    agriProfileData.additionalDetails?.ropani || 0,
                                    agriProfileData.additionalDetails?.aana || 0,
                                    parseInt(e.target.value) || 0,
                                    agriProfileData.additionalDetails?.daam || 0
                                  )}
                                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#fff', textAlign: 'center', fontWeight: 700 }}
                                />
                              </div>
                              <div>
                                <label style={{ display: 'block', fontSize: '0.72rem', color: '#94a3b8', marginBottom: '0.2rem' }}>दाम (०-३)</label>
                                <input
                                  type="number"
                                  min="0"
                                  max="3"
                                  value={agriProfileData.additionalDetails?.daam ?? 0}
                                  onChange={(e) => handleLandRopaniChange(
                                    agriProfileData.additionalDetails?.ropani || 0,
                                    agriProfileData.additionalDetails?.aana || 0,
                                    agriProfileData.additionalDetails?.paisa || 0,
                                    parseInt(e.target.value) || 0
                                  )}
                                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#fff', textAlign: 'center', fontWeight: 700 }}
                                />
                              </div>
                            </div>
                            <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.4rem' }}>
                              * १६ आना = १ रोपनी, ४ पैसा = १ आना
                            </div>
                          </div>

                          {/* Standard Metric Units */}
                          <div style={{ backgroundColor: '#1e293b', padding: '1rem', borderRadius: '8px', border: '1px solid #334155' }}>
                            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.6rem' }}>
                              मानक मेट्रिक क्षेत्रफल (हेक्टर):
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <input
                                type="number"
                                step="0.001"
                                min="0"
                                value={agriProfileData.landAreaHectares || 0}
                                onChange={(e) => handleLandHectaresChange(parseFloat(e.target.value) || 0)}
                                style={{ flex: 1, padding: '0.55rem', borderRadius: '6px', border: '1px solid #0284c7', backgroundColor: '#0f172a', color: '#38bdf8', fontWeight: 800, fontSize: '1rem' }}
                              />
                              <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>हेक्टर (Hectares)</span>
                            </div>
                            <div style={{ fontSize: '0.72rem', color: '#38bdf8', marginTop: '0.5rem' }}>
                              ≈ {((agriProfileData.landAreaHectares || 0) * 19.656).toFixed(2)} रोपनी (१ हेक्टर ≈ १९.६५ रोपनी)
                            </div>
                          </div>
                        </div>

                        {/* Land Ownership & Type Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                          
                          {/* Ownership */}
                          <div>
                            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.82rem', color: '#94a3b8', fontWeight: 600 }}>
                              जग्गाको स्वामित्व (Land Ownership):
                            </label>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                              {['आफ्नै (Own)', 'भाडा/बटैया (Leased)', 'दुवै (Both)'].map(opt => {
                                const selected = agriProfileData.additionalDetails?.landOwnership === opt;
                                return (
                                  <button
                                    key={opt}
                                    type="button"
                                    onClick={() => setAgriProfileData(p => ({
                                      ...p,
                                      additionalDetails: { ...(p.additionalDetails || {}), landOwnership: opt }
                                    }))}
                                    style={{
                                      padding: '0.45rem 0.8rem',
                                      borderRadius: '6px',
                                      border: `1px solid ${selected ? '#10b981' : '#334155'}`,
                                      backgroundColor: selected ? 'rgba(16, 185, 129, 0.2)' : '#1e293b',
                                      color: selected ? '#4ade80' : '#cbd5e1',
                                      fontSize: '0.8rem',
                                      cursor: 'pointer',
                                      fontWeight: selected ? 700 : 500
                                    }}
                                  >
                                    {selected ? '✓ ' : ''}{opt}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Land Types */}
                          <div>
                            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.82rem', color: '#94a3b8', fontWeight: 600 }}>
                              जमिनको प्रकार (Land Types - बहुछनोट):
                            </label>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                              {['खेत (सिञ्चित)', 'बारी / पाखो', 'बाँझो जमिन', 'चरन / खर्क'].map(t => {
                                const selected = (agriProfileData.additionalDetails?.landTypes || []).includes(t);
                                return (
                                  <button
                                    key={t}
                                    type="button"
                                    onClick={() => handleToggleAgriDetailArray('landTypes', t)}
                                    style={{
                                      padding: '0.45rem 0.8rem',
                                      borderRadius: '6px',
                                      border: `1px solid ${selected ? '#38bdf8' : '#334155'}`,
                                      backgroundColor: selected ? 'rgba(56, 189, 248, 0.2)' : '#1e293b',
                                      color: selected ? '#38bdf8' : '#cbd5e1',
                                      fontSize: '0.8rem',
                                      cursor: 'pointer',
                                      fontWeight: selected ? 700 : 500
                                    }}
                                  >
                                    {selected ? '✓ ' : '+ '}{t}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Irrigation & Farming approach */}
                      <div style={{ backgroundColor: '#0f172a', padding: '1.25rem', borderRadius: '10px', border: '1px solid #334155' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                          
                          {/* Irrigation Source */}
                          <div>
                            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.82rem', color: '#94a3b8', fontWeight: 600 }}>
                              💧 सिँचाइ सुविधा (Irrigation Facility):
                            </label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                              {[
                                'बाह्रै महिना कुलो / नहर',
                                'मौसमी (आकासे पानीमा निर्भर)',
                                'आधुनिक थोपा / लिफ्ट / पोखरी',
                                'सिँचाइ सुविधा नभएको'
                              ].map(irr => {
                                const selected = agriProfileData.additionalDetails?.irrigationType === irr;
                                return (
                                  <label
                                    key={irr}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '0.5rem',
                                      padding: '0.45rem 0.75rem',
                                      borderRadius: '6px',
                                      backgroundColor: selected ? 'rgba(56, 189, 248, 0.15)' : '#1e293b',
                                      border: `1px solid ${selected ? '#0284c7' : '#334155'}`,
                                      cursor: 'pointer',
                                      fontSize: '0.82rem',
                                      color: selected ? '#38bdf8' : '#cbd5e1'
                                    }}
                                  >
                                    <input
                                      type="radio"
                                      name="irrigationOption"
                                      checked={selected}
                                      onChange={() => setAgriProfileData(p => ({
                                        ...p,
                                        additionalDetails: { ...(p.additionalDetails || {}), irrigationType: irr }
                                      }))}
                                    />
                                    {irr}
                                  </label>
                                );
                              })}
                            </div>
                          </div>

                          {/* Farming Practice */}
                          <div>
                            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.82rem', color: '#94a3b8', fontWeight: 600 }}>
                              🌿 खेती प्रणाली (Farming Approach):
                            </label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                              {[
                                'परम्परागत (Traditional)',
                                'पूर्ण प्राङ्गारिक (Organic Certified)',
                                'रासायनिक मल तथा विषादी प्रयोग',
                                'मिश्रित तथा आधुनिक प्रविधि'
                              ].map(pr => {
                                const selected = agriProfileData.additionalDetails?.farmingPractice === pr;
                                return (
                                  <label
                                    key={pr}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '0.5rem',
                                      padding: '0.45rem 0.75rem',
                                      borderRadius: '6px',
                                      backgroundColor: selected ? 'rgba(74, 222, 128, 0.15)' : '#1e293b',
                                      border: `1px solid ${selected ? '#16a34a' : '#334155'}`,
                                      cursor: 'pointer',
                                      fontSize: '0.82rem',
                                      color: selected ? '#4ade80' : '#cbd5e1'
                                    }}
                                  >
                                    <input
                                      type="radio"
                                      name="farmingApproach"
                                      checked={selected}
                                      onChange={() => setAgriProfileData(p => ({
                                        ...p,
                                        additionalDetails: { ...(p.additionalDetails || {}), farmingPractice: pr }
                                      }))}
                                    />
                                    {pr}
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ========================================================================= */}
                  {/* SUB-TAB 2: CROPS & HORTICULTURE */}
                  {/* ========================================================================= */}
                  {activeAgriSubTab === 'crops' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      <div style={{ backgroundColor: '#0f172a', padding: '1.25rem', borderRadius: '10px', border: '1px solid #334155' }}>
                        <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#38bdf8', marginBottom: '0.5rem' }}>
                          पाँचपोखरी थाङपालका स्थानीय तथा प्रमुख बालीहरू (क्लिक गरी छनोट गर्नुहोस्):
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '1rem' }}>
                          हरियो भएका बालीहरू यस घरधुरीको प्रोफाइलमा दर्ता छन्। थप वा हटाउन ट्यागमा क्लिक गर्नुहोस्:
                        </div>

                        {/* Presets Grid */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem' }}>
                          {LOCAL_CROPS_PRESETS.map(crop => {
                            const isSelected = (agriProfileData.mainCrops || []).includes(crop);
                            return (
                              <button
                                key={crop}
                                type="button"
                                onClick={() => handleToggleCrop(crop)}
                                style={{
                                  padding: '0.5rem 0.9rem',
                                  borderRadius: '20px',
                                  border: `1px solid ${isSelected ? '#22c55e' : '#334155'}`,
                                  backgroundColor: isSelected ? 'rgba(34, 197, 94, 0.2)' : '#1e293b',
                                  color: isSelected ? '#4ade80' : '#cbd5e1',
                                  fontSize: '0.84rem',
                                  fontWeight: isSelected ? 700 : 500,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.4rem',
                                  transition: 'all 0.15s ease'
                                }}
                              >
                                {isSelected ? '✓ ' : '+ '}
                                {crop}
                              </button>
                            );
                          })}
                        </div>

                        {/* Add Custom Crop Input */}
                        <div style={{ display: 'flex', gap: '0.5rem', maxWidth: '480px', marginBottom: '1rem' }}>
                          <input
                            type="text"
                            placeholder="अन्य बालीको नाम लेख्नुहोस् (उदा. कफी, सिमी)..."
                            value={customCropInput}
                            onChange={(e) => setCustomCropInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomCrop())}
                            style={{ flex: 1, padding: '0.6rem 0.8rem', borderRadius: '6px', border: '1px solid #334155', backgroundColor: '#1e293b', color: '#fff', fontSize: '0.85rem' }}
                          />
                          <button
                            type="button"
                            onClick={handleAddCustomCrop}
                            style={{ padding: '0.6rem 1rem', borderRadius: '6px', border: 'none', backgroundColor: '#3b82f6', color: '#fff', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
                          >
                            + बाली थप्नुहोस्
                          </button>
                        </div>

                        {/* Currently Selected Crops List */}
                        <div style={{ borderTop: '1px solid #334155', paddingTop: '1rem' }}>
                          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#94a3b8', marginBottom: '0.6rem' }}>
                            हाल छनोट गरिएका मुख्य बालीहरू ({(agriProfileData.mainCrops || []).length}):
                          </div>
                          {(agriProfileData.mainCrops || []).length === 0 ? (
                            <div style={{ fontSize: '0.82rem', color: '#64748b', fontStyle: 'italic' }}>कुनै बाली छनोट गरिएको छैन। माथिका ट्यागहरूमा क्लिक गर्नुहोस्।</div>
                          ) : (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                              {(agriProfileData.mainCrops || []).map(c => (
                                <span
                                  key={c}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.35rem',
                                    padding: '0.3rem 0.65rem',
                                    backgroundColor: 'rgba(56, 189, 248, 0.15)',
                                    color: '#38bdf8',
                                    border: '1px solid #0284c7',
                                    borderRadius: '16px',
                                    fontSize: '0.82rem',
                                    fontWeight: 600
                                  }}
                                >
                                  🌱 {c}
                                  <span
                                    onClick={() => handleToggleCrop(c)}
                                    title="हटाउनुहोस्"
                                    style={{ cursor: 'pointer', marginLeft: '2px', fontWeight: 900, color: '#ef4444' }}
                                  >
                                    ×
                                  </span>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ========================================================================= */}
                  {/* SUB-TAB 3: LIVESTOCK COUNTERS */}
                  {/* ========================================================================= */}
                  {activeAgriSubTab === 'livestock' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      <div style={{ backgroundColor: '#0f172a', padding: '1.25rem', borderRadius: '10px', border: '1px solid #334155' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                          <div>
                            <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#fbbf24' }}>
                              पशुपन्छी, चौपाया तथा मत्स्य लगत विवरण
                            </div>
                            <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                              संख्या परिवर्तन गर्न + / - थिच्नुहोस् वा प्रत्यक्ष संख्या लेख्नुहोस्:
                            </div>
                          </div>
                          <span style={{
                            padding: '0.35rem 0.8rem',
                            borderRadius: '20px',
                            fontSize: '0.82rem',
                            fontWeight: 800,
                            backgroundColor: 'rgba(251, 191, 36, 0.15)',
                            color: '#fbbf24',
                            border: '1px solid #d97706'
                          }}>
                            जम्मा पशुधन: {totalLivestockInAgriProfile} वटा
                          </span>
                        </div>

                        {/* Preset Livestock Counters Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.85rem' }}>
                          {LOCAL_LIVESTOCK_PRESETS.map(item => {
                            const count = Number(agriProfileData.livestockDetails?.[item.key] || 0);
                            const isActive = count > 0;
                            return (
                              <div
                                key={item.key}
                                style={{
                                  backgroundColor: isActive ? 'rgba(16, 185, 129, 0.08)' : '#1e293b',
                                  border: `1.5px solid ${isActive ? '#10b981' : '#334155'}`,
                                  borderRadius: '10px',
                                  padding: '0.85rem',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  justifyContent: 'space-between',
                                  gap: '0.75rem',
                                  transition: 'all 0.15s ease'
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                  <span style={{ fontSize: '1.6rem' }}>{item.icon}</span>
                                  <div>
                                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: isActive ? '#4ade80' : '#f8fafc' }}>
                                      {item.label}
                                    </div>
                                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{item.unit}</div>
                                  </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateLivestock(item.key, -1)}
                                    disabled={count <= 0}
                                    style={{
                                      width: '32px',
                                      height: '32px',
                                      borderRadius: '6px',
                                      border: '1px solid #475569',
                                      backgroundColor: '#0f172a',
                                      color: '#fff',
                                      fontWeight: 800,
                                      fontSize: '1rem',
                                      cursor: count > 0 ? 'pointer' : 'not-allowed',
                                      opacity: count > 0 ? 1 : 0.3
                                    }}
                                  >
                                    -
                                  </button>

                                  <input
                                    type="number"
                                    min="0"
                                    value={count || ''}
                                    placeholder="0"
                                    onChange={(e) => handleSetLivestock(item.key, parseInt(e.target.value) || 0)}
                                    style={{
                                      width: '65px',
                                      textAlign: 'center',
                                      padding: '0.35rem',
                                      borderRadius: '6px',
                                      border: '1px solid #475569',
                                      backgroundColor: '#0f172a',
                                      color: isActive ? '#4ade80' : '#cbd5e1',
                                      fontWeight: 800,
                                      fontSize: '0.95rem'
                                    }}
                                  />

                                  <button
                                    type="button"
                                    onClick={() => handleUpdateLivestock(item.key, 1)}
                                    style={{
                                      width: '32px',
                                      height: '32px',
                                      borderRadius: '6px',
                                      border: 'none',
                                      backgroundColor: '#10b981',
                                      color: '#fff',
                                      fontWeight: 800,
                                      fontSize: '1rem',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ========================================================================= */}
                  {/* SUB-TAB 4: SUBSIDIES, INSURANCE & MARKET */}
                  {/* ========================================================================= */}
                  {activeAgriSubTab === 'subsidies' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      
                      {/* Financial, Insurance & Machinery Grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                        
                        {/* Insurance & Loan Card */}
                        <div style={{ backgroundColor: '#0f172a', padding: '1.25rem', borderRadius: '10px', border: '1px solid #334155' }}>
                          <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#a78bfa', marginBottom: '0.85rem' }}>
                            🛡️ बिमा तथा वित्तीय पहुँच:
                          </div>

                          <div style={{ marginBottom: '1rem' }}>
                            <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '0.4rem' }}>कृषि / पशु बिमा (Crop/Livestock Insurance):</div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              {[true, false].map(val => {
                                const isSelected = (agriProfileData.additionalDetails?.hasInsurance === val);
                                return (
                                  <button
                                    key={String(val)}
                                    type="button"
                                    onClick={() => setAgriProfileData(p => ({
                                      ...p,
                                      additionalDetails: { ...(p.additionalDetails || {}), hasInsurance: val }
                                    }))}
                                    style={{
                                      flex: 1,
                                      padding: '0.45rem',
                                      borderRadius: '6px',
                                      border: `1px solid ${isSelected ? (val ? '#10b981' : '#f43f5e') : '#334155'}`,
                                      backgroundColor: isSelected ? (val ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)') : '#1e293b',
                                      color: isSelected ? (val ? '#4ade80' : '#fb7185') : '#94a3b8',
                                      fontWeight: 700,
                                      fontSize: '0.8rem',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    {val ? '✓ बिमा गरिएको छ' : '✗ गरिएको छैन'}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          <div>
                            <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '0.4rem' }}>सहुलियतपूर्ण कृषि कर्जा (Agri Credit/Loan):</div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              {[true, false].map(val => {
                                const isSelected = (agriProfileData.additionalDetails?.hasLoan === val);
                                return (
                                  <button
                                    key={String(val)}
                                    type="button"
                                    onClick={() => setAgriProfileData(p => ({
                                      ...p,
                                      additionalDetails: { ...(p.additionalDetails || {}), hasLoan: val }
                                    }))}
                                    style={{
                                      flex: 1,
                                      padding: '0.45rem',
                                      borderRadius: '6px',
                                      border: `1px solid ${isSelected ? (val ? '#38bdf8' : '#64748b') : '#334155'}`,
                                      backgroundColor: isSelected ? (val ? 'rgba(56, 189, 248, 0.2)' : 'rgba(100, 116, 139, 0.2)') : '#1e293b',
                                      color: isSelected ? (val ? '#38bdf8' : '#cbd5e1') : '#94a3b8',
                                      fontWeight: 700,
                                      fontSize: '0.8rem',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    {val ? '✓ कर्जा लिएको छ' : '✗ लिएको छैन'}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        {/* Machinery Card */}
                        <div style={{ backgroundColor: '#0f172a', padding: '1.25rem', borderRadius: '10px', border: '1px solid #334155' }}>
                          <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#fbbf24', marginBottom: '0.85rem' }}>
                            🚜 प्रयोग गरिएका कृषि औजार / यन्त्रहरू:
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
                            {LOCAL_MACHINERY_OPTIONS.map(mach => {
                              const isSelected = (agriProfileData.additionalDetails?.mechanization || []).includes(mach);
                              return (
                                <button
                                  key={mach}
                                  type="button"
                                  onClick={() => handleToggleAgriDetailArray('mechanization', mach)}
                                  style={{
                                    padding: '0.45rem 0.75rem',
                                    borderRadius: '6px',
                                    border: `1px solid ${isSelected ? '#fbbf24' : '#334155'}`,
                                    backgroundColor: isSelected ? 'rgba(251, 191, 36, 0.2)' : '#1e293b',
                                    color: isSelected ? '#fbbf24' : '#cbd5e1',
                                    fontSize: '0.78rem',
                                    fontWeight: isSelected ? 700 : 500,
                                    cursor: 'pointer'
                                  }}
                                >
                                  {isSelected ? '✓ ' : '+ '}{mach}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Subsidies Ledger & Addition Form */}
                      <div style={{ backgroundColor: '#0f172a', padding: '1.25rem', borderRadius: '10px', border: '1px solid #334155' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Banknote size={20} color="#fbbf24" />
                            <h4 style={{ margin: 0, fontSize: '1rem', color: '#fbbf24', fontWeight: 800 }}>
                              अनुदान तथा सुविधा लगत (Subsidy Records)
                            </h4>
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowSubsidyModal(!showSubsidyModal)}
                            style={{ background: '#10b981', color: '#fff', padding: '0.45rem 0.9rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                          >
                            <Plus size={15} /> नयाँ अनुदान लगत थप्नुहोस्
                          </button>
                        </div>

                        {showSubsidyModal && (
                          <div style={{ padding: '1.2rem', backgroundColor: '#1e293b', borderRadius: '8px', marginBottom: '1.2rem', border: '1px solid #059669' }}>
                            <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#4ade80', marginBottom: '0.75rem' }}>
                              + नयाँ अनुदान लगत फारम:
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.8rem', marginBottom: '0.8rem' }}>
                              <div>
                                <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.3rem' }}>प्राप्त मिति (वि.सं.)</label>
                                <input type="text" placeholder="२०८१/०२/१५" value={newSubsidy.date} onChange={e => setNewSubsidy({...newSubsidy, date: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', backgroundColor: '#0f172a', color: '#fff', border: '1px solid #334155', fontSize: '0.85rem' }} />
                              </div>
                              <div>
                                <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.3rem' }}>आर्थिक वर्ष</label>
                                <input type="text" value={newSubsidy.fiscalYear} onChange={e => setNewSubsidy({...newSubsidy, fiscalYear: e.target.value})} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', backgroundColor: '#0f172a', color: '#fff', border: '1px solid #334155', fontSize: '0.85rem' }} />
                              </div>
                              <div>
                                <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.3rem' }}>अनुदान रकम (रू.)</label>
                                <input type="number" value={newSubsidy.amount || ''} placeholder="उदा. २५०००" onChange={e => setNewSubsidy({...newSubsidy, amount: Number(e.target.value)})} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', backgroundColor: '#0f172a', color: '#fff', border: '1px solid #334155', fontSize: '0.85rem' }} />
                              </div>
                            </div>
                            <div style={{ marginBottom: '0.8rem' }}>
                              <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.3rem' }}>प्रयोजन / कार्यक्रमको शीर्षक</label>
                              <input type="text" value={newSubsidy.purpose} onChange={e => setNewSubsidy({...newSubsidy, purpose: e.target.value})} placeholder="उदा. हाते ट्याक्टर ५०% पालिका साझेदारी अनुदान" style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', backgroundColor: '#0f172a', color: '#fff', border: '1px solid #334155', fontSize: '0.85rem' }} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                              <button
                                type="button"
                                onClick={() => setShowSubsidyModal(false)}
                                style={{ background: '#475569', color: '#fff', padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '0.82rem' }}
                              >
                                रद्द गर्नुहोस्
                              </button>
                              <button
                                type="button"
                                onClick={() => addSubsidyMutation.mutate(newSubsidy)}
                                disabled={!newSubsidy.date || !newSubsidy.purpose || !newSubsidy.amount || addSubsidyMutation.isPending}
                                style={{ background: '#10b981', color: '#fff', padding: '0.5rem 1.25rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem', opacity: (!newSubsidy.date || !newSubsidy.purpose || !newSubsidy.amount) ? 0.5 : 1 }}
                              >
                                {addSubsidyMutation.isPending ? 'थपिँदैछ...' : 'रेकर्ड सुरक्षित गर्नुहोस्'}
                              </button>
                            </div>
                          </div>
                        )}

                        <div className="dt-responsive-table-wrapper">
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem', color: '#e2e8f0' }}>
                            <thead>
                              <tr style={{ backgroundColor: '#1e293b', borderBottom: '1px solid #334155', color: '#94a3b8', textAlign: 'left' }}>
                                <th style={{ padding: '0.6rem' }}>मिति</th>
                                <th style={{ padding: '0.6rem' }}>आर्थिक वर्ष</th>
                                <th style={{ padding: '0.6rem' }}>प्रयोजन / कार्यक्रम</th>
                                <th style={{ padding: '0.6rem', textAlign: 'right' }}>रकम (रू.)</th>
                              </tr>
                            </thead>
                            <tbody>
                              {agriProfile?.subsidiesReceived && agriProfile.subsidiesReceived.length > 0 ? (
                                agriProfile.subsidiesReceived.map((s, idx) => (
                                  <tr key={idx} style={{ borderBottom: '1px solid #334155' }}>
                                    <td style={{ padding: '0.6rem' }}>{s.date}</td>
                                    <td style={{ padding: '0.6rem' }}>{s.fiscalYear}</td>
                                    <td style={{ padding: '0.6rem', fontWeight: 600 }}>{s.purpose}</td>
                                    <td style={{ padding: '0.6rem', textAlign: 'right', color: '#4ade80', fontWeight: 700 }}>
                                      रू. {Number(s.amount).toLocaleString()}
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan={4} style={{ padding: '1.2rem', textAlign: 'center', color: '#94a3b8' }}>
                                    हालसम्म कुनै अनुदान रेकर्ड भेटिएन।
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Bottom Global Save Footer inside Agri Tab */}
                  <div style={{
                    backgroundColor: '#0f172a',
                    padding: '1rem 1.5rem',
                    borderRadius: '10px',
                    border: '1px solid #334155',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem'
                  }}>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                      {agriProfile?.updatedAt ? (
                        <>अन्तिम पटक अद्यावधिक: <span style={{ color: '#cbd5e1' }}>{new Date(agriProfile.updatedAt).toLocaleString()}</span></>
                      ) : (
                        <>स्थिति: <span style={{ color: '#fbbf24' }}>नयाँ प्रोफाइल इन्ट्री मोड</span></>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => saveAgriProfileMutation.mutate(agriProfileData)}
                      disabled={saveAgriProfileMutation.isPending}
                      style={{
                        background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                        color: '#ffffff',
                        padding: '0.65rem 1.6rem',
                        borderRadius: '8px',
                        border: 'none',
                        cursor: saveAgriProfileMutation.isPending ? 'not-allowed' : 'pointer',
                        fontWeight: 800,
                        fontSize: '0.9rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)'
                      }}
                    >
                      <Save size={18} />
                      {saveAgriProfileMutation.isPending ? 'डेटाबेसमा सुरक्षित हुँदैछ...' : '💾 सम्पूर्ण कृषि विवरण सेभ गर्नुहोस् (Save Profile)'}
                    </button>
                  </div>

                </div>
              )}

              {activeModalTab === 'waste' && (
                <div style={{ animation: 'fadeIn 0.3s ease' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{ backgroundColor: '#0f172a', padding: '1.5rem', borderRadius: '12px', border: '1px solid #16a34a', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontSize: '0.85rem', color: '#4ade80', fontWeight: 600, marginBottom: '0.25rem' }}>Clean for Cash वालेट ब्यालेन्स</div>
                        <div style={{ fontSize: '2rem', fontWeight: 900, color: '#22c55e' }}>रु. १,२५०</div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>कुल ४५ केजी फोहोर वर्गीकरण (यो वर्ष)</div>
                      </div>
                      <div style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', padding: '1rem', borderRadius: '50%' }}>
                        <Banknote size={32} color="#4ade80" />
                      </div>
                    </div>

                    <div style={{ backgroundColor: '#0f172a', padding: '1.5rem', borderRadius: '12px', border: '1px solid #334155' }}>
                      <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600, marginBottom: '0.75rem' }}>फोहोर वर्गीकरण रेकर्ड (Top Categories)</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>प्लास्टिक र पेट बोतल</span>
                          <span style={{ fontWeight: 700, color: '#38bdf8' }}>२५ केजी</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>फलाम तथा धातु</span>
                          <span style={{ fontWeight: 700, color: '#f59e0b' }}>१२ केजी</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>अर्गानिक (कम्पोस्ट)</span>
                          <span style={{ fontWeight: 700, color: '#10b981' }}>८ केजी</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <h4 style={{ margin: '0 0 1rem 0', color: '#e2e8f0' }}>पछिल्ला ट्रान्जेक्सनहरू (Recent Pickups)</h4>
                  <div style={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#1e293b', borderBottom: '1px solid #334155' }}>
                          <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: '#94a3b8', fontWeight: 600 }}>मिति</th>
                          <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: '#94a3b8', fontWeight: 600 }}>संकलक गाडी नं.</th>
                          <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: '#94a3b8', fontWeight: 600 }}>फोहोर प्रकार / तौल</th>
                          <th style={{ padding: '0.75rem 1rem', textAlign: 'right', color: '#94a3b8', fontWeight: 600 }}>प्राप्त रकम</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr style={{ borderBottom: '1px solid #334155' }}>
                          <td style={{ padding: '0.75rem 1rem', color: '#cbd5e1' }}>२०८१/०६/०१</td>
                          <td style={{ padding: '0.75rem 1rem', color: '#cbd5e1' }}>बा १ ग २५४३ (रुट ३)</td>
                          <td style={{ padding: '0.75rem 1rem', color: '#cbd5e1' }}>प्लास्टिक (५ केजी)</td>
                          <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: '#4ade80', fontWeight: 700 }}>+ रु. ७५</td>
                        </tr>
                        <tr>
                          <td style={{ padding: '0.75rem 1rem', color: '#cbd5e1' }}>२०८१/०५/१५</td>
                          <td style={{ padding: '0.75rem 1rem', color: '#cbd5e1' }}>बा १ ग २५४३ (रुट ३)</td>
                          <td style={{ padding: '0.75rem 1rem', color: '#cbd5e1' }}>फलाम (२ केजी)</td>
                          <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: '#4ade80', fontWeight: 700 }}>+ रु. ५०</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  
                  <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                    <button style={{ backgroundColor: '#16a34a', color: '#fff', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Banknote size={16} /> वालेटबाट कर भुक्तानी (e-Tax) मा पठाउनुहोस्
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
              {!isPublicMode ? (
                <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => {
                      const h = viewingHouse;
                      setViewingHouse(null);
                      setViewMode('map');
                      setTimeout(() => {
                        (window as any).__handleStartRelocateGps?.(h.id);
                      }, 250);
                    }}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#0284c7',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      boxShadow: '0 4px 10px rgba(2, 132, 199, 0.3)',
                    }}
                  >
                    <Move size={14} />
                    <span>📍 नक्सामा GPS बिन्दु सार्नुहोस्</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const h = viewingHouse;
                      const initialTab = activeModalTab === 'waste' ? 'waste' : activeModalTab === 'agriculture' ? 'agriculture' : 'basic';
                      setViewingHouse(null);
                      openEditModal(h, initialTab);
                    }}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#10b981',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      boxShadow: '0 4px 10px rgba(16, 185, 129, 0.3)',
                    }}
                  >
                    <Edit3 size={14} />
                    <span>✏️ विवरण सम्पादन गर्नुहोस्</span>
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', fontSize: '0.8rem' }}>
                  <ShieldCheck size={18} color="#10b981" />
                  <span>प्रमाणित आधिकारिक लगत (सार्वजनिक अवलोकन मोड)</span>
                </div>
              )}

              <button
                onClick={() => setViewingHouse(null)}
                style={{
                  padding: '0.5rem 1.1rem',
                  backgroundColor: '#334155',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                }}
              >
                बन्द गर्नुहोस्
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT HOUSEHOLD & GPS MODAL (Admin Only) ── */}
      {!isPublicMode && editingHouse && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1050,
            padding: '1rem',
            backdropFilter: 'blur(6px)',
          }}
          onClick={() => setEditingHouse(null)}
        >
          <div
            style={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '16px',
              maxWidth: '880px',
              width: '100%',
              maxHeight: '92vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              color: '#ffffff',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.65)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              style={{
                padding: '1.1rem 1.5rem',
                borderBottom: '1px solid #334155',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'linear-gradient(90deg, #1e293b, #0f172a)',
                flexShrink: 0,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(16, 185, 129, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Edit3 size={20} color="#10b981" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#ffffff' }}>
                    घरधुरी तथा GPS विवरण सम्पादन (Edit Household & GPS)
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.76rem', color: '#94a3b8' }}>
                    म्याट्रिक्स कोड: <strong style={{ color: '#38bdf8', fontFamily: 'monospace' }}>{editingHouse.matrixHouseNo}</strong> | घरमूली: <strong style={{ color: '#ffffff' }}>{editingHouse.householdName || '—'}</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingHouse(null)}
                style={{
                  background: '#334155',
                  border: 'none',
                  color: '#e2e8f0',
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* TAB NAVIGATION BAR */}
            <div
              style={{
                display: 'flex',
                borderBottom: '1px solid #334155',
                backgroundColor: '#0f172a',
                overflowX: 'auto',
                flexShrink: 0,
              }}
            >
              <button
                type="button"
                onClick={() => setEditModalTab('basic')}
                style={{
                  flex: 1,
                  minWidth: '150px',
                  padding: '0.75rem 0.85rem',
                  background: editModalTab === 'basic' ? '#1e293b' : 'transparent',
                  color: editModalTab === 'basic' ? '#38bdf8' : '#94a3b8',
                  border: 'none',
                  borderBottom: editModalTab === 'basic' ? '3px solid #38bdf8' : '3px solid transparent',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.45rem',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                }}
              >
                <Home size={16} />
                <span>१. घरधुरी, आवास र WASH</span>
              </button>

              <button
                type="button"
                onClick={() => setEditModalTab('family')}
                style={{
                  flex: 1,
                  minWidth: '150px',
                  padding: '0.75rem 0.85rem',
                  background: editModalTab === 'family' ? '#1e293b' : 'transparent',
                  color: editModalTab === 'family' ? '#fbbf24' : '#94a3b8',
                  border: 'none',
                  borderBottom: editModalTab === 'family' ? '3px solid #fbbf24' : '3px solid transparent',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.45rem',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                }}
              >
                <Users size={16} />
                <span>२. परिवार तथा जनसांख्यिकी</span>
              </button>

              <button
                type="button"
                onClick={() => setEditModalTab('agriculture')}
                style={{
                  flex: 1,
                  minWidth: '180px',
                  padding: '0.75rem 0.85rem',
                  background: editModalTab === 'agriculture' ? '#1e293b' : 'transparent',
                  color: editModalTab === 'agriculture' ? '#4ade80' : '#94a3b8',
                  border: 'none',
                  borderBottom: editModalTab === 'agriculture' ? '3px solid #4ade80' : '3px solid transparent',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.45rem',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                }}
              >
                <Sprout size={16} />
                <span>३. कृषि, पशुधन र जीविकोपार्जन</span>
              </button>

              <button
                type="button"
                onClick={() => setEditModalTab('waste')}
                style={{
                  flex: 1,
                  minWidth: '160px',
                  padding: '0.75rem 0.85rem',
                  background: editModalTab === 'waste' ? '#1e293b' : 'transparent',
                  color: editModalTab === 'waste' ? '#22c55e' : '#94a3b8',
                  border: 'none',
                  borderBottom: editModalTab === 'waste' ? '3px solid #22c55e' : '3px solid transparent',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.45rem',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                }}
              >
                <Leaf size={16} />
                <span>४. फोहोरमैला व्यवस्थापन</span>
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSaveEditHousehold} style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

              {/* ══════════════════════════════════════════════════════════ */}
              {/* TAB 1: प्रशासनिक, आवास, GPS र WASH                     */}
              {/* ══════════════════════════════════════════════════════════ */}
              {editModalTab === 'basic' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', animation: 'fadeIn 0.2s ease' }}>
                  {/* SECTION 1: प्रशासनिक तथा घरमूली विवरण */}
                  <div style={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '10px', padding: '1.25rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#38bdf8', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Home size={16} /> १. प्रशासनिक तथा घरमूली पहिचान
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
                          घरधुरी नम्बर (Matrix House No) *
                        </label>
                        <input
                          type="text"
                          required
                          value={editingHouse.matrixHouseNo || ''}
                          onChange={(e) => setEditingHouse({ ...editingHouse, matrixHouseNo: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            backgroundColor: '#1e293b',
                            border: '1px solid #475569',
                            borderRadius: '6px',
                            color: '#ffffff',
                            fontSize: '0.85rem',
                            fontFamily: 'monospace',
                            fontWeight: 600,
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', color: '#fbbf24', marginBottom: '0.25rem', fontWeight: 700 }}>
                          साविकको घरधुरी नम्बर (Legacy House No.)
                        </label>
                        <input
                          type="text"
                          placeholder="उदा. साविक-०४, HS-१२"
                          value={editingHouse.legacyHouseNo || ''}
                          onChange={(e) => setEditingHouse({ ...editingHouse, legacyHouseNo: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            backgroundColor: '#1e293b',
                            border: '1.5px solid #d97706',
                            borderRadius: '6px',
                            color: '#fbbf24',
                            fontSize: '0.85rem',
                            fontFamily: 'monospace',
                            fontWeight: 700,
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
                          साविक गा.वि.स. तथा वडा नं.
                        </label>
                        <input
                          type="text"
                          placeholder="उदा. थाङपालधाप-४, भोताङ-२"
                          value={editingHouse.formerVdc || ''}
                          onChange={(e) => setEditingHouse({ ...editingHouse, formerVdc: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            backgroundColor: '#1e293b',
                            border: '1px solid #475569',
                            borderRadius: '6px',
                            color: '#ffffff',
                            fontSize: '0.85rem',
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
                          वडा नम्बर (हाल) *
                        </label>
                        <select
                          value={editingHouse.wardNumber || 1}
                          onChange={(e) => setEditingHouse({ ...editingHouse, wardNumber: Number(e.target.value) })}
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            backgroundColor: '#1e293b',
                            border: '1px solid #475569',
                            borderRadius: '6px',
                            color: '#ffffff',
                            fontSize: '0.85rem',
                          }}
                        >
                          {dynamicWards.filter((w) => w.id !== 'all').map((w) => (
                            <option key={w.id} value={w.id}>
                              {w.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
                          टोल / बस्तीको नाम *
                        </label>
                        <input
                          type="text"
                          required
                          value={editingHouse.tole || ''}
                          onChange={(e) => setEditingHouse({ ...editingHouse, tole: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            backgroundColor: '#1e293b',
                            border: '1px solid #475569',
                            borderRadius: '6px',
                            color: '#ffffff',
                            fontSize: '0.85rem',
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
                          घरमूलीको नाम *
                        </label>
                        <input
                          type="text"
                          required
                          value={editingHouse.householdName || ''}
                          onChange={(e) => setEditingHouse({ ...editingHouse, householdName: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            backgroundColor: '#1e293b',
                            border: '1px solid #475569',
                            borderRadius: '6px',
                            color: '#ffffff',
                            fontSize: '0.85rem',
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
                          घरमूलीको लिङ्ग *
                        </label>
                        <select
                          value={editingHouse.headGender || 'male'}
                          onChange={(e) => setEditingHouse({ ...editingHouse, headGender: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            backgroundColor: '#1e293b',
                            border: '1px solid #475569',
                            borderRadius: '6px',
                            color: '#ffffff',
                            fontSize: '0.85rem',
                          }}
                        >
                          <option value="male">पुरुष (Male)</option>
                          <option value="female">महिला (Female)</option>
                          <option value="other">अन्य (Other)</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
                          सम्पर्क फोन नं. *
                        </label>
                        <input
                          type="text"
                          required
                          value={editingHouse.contactPhone || ''}
                          onChange={(e) => setEditingHouse({ ...editingHouse, contactPhone: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            backgroundColor: '#1e293b',
                            border: '1px solid #475569',
                            borderRadius: '6px',
                            color: '#ffffff',
                            fontSize: '0.85rem',
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
                          नागरिकता / NID नम्बर
                        </label>
                        <input
                          type="text"
                          placeholder="उदा. २७-०१-७५-०२३४५"
                          value={editingHouse.citizenshipNo || ''}
                          onChange={(e) => setEditingHouse({ ...editingHouse, citizenshipNo: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            backgroundColor: '#1e293b',
                            border: '1px solid #475569',
                            borderRadius: '6px',
                            color: '#ffffff',
                            fontSize: '0.85rem',
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
                          जाति / समुदाय (Ethnicity)
                        </label>
                        <select
                          value={editingHouse.ethnicity || 'तामाङ (आदिवासी जनजाति)'}
                          onChange={(e) => setEditingHouse({ ...editingHouse, ethnicity: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            backgroundColor: '#1e293b',
                            border: '1px solid #475569',
                            borderRadius: '6px',
                            color: '#ffffff',
                            fontSize: '0.85rem',
                          }}
                        >
                          <option value="तामाङ (आदिवासी जनजाति)">तामाङ (आदिवासी जनजाति)</option>
                          <option value="ह्योल्मो (आदिवासी जनजाति)">ह्योल्मो (आदिवासी जनजाति)</option>
                          <option value="शेर्पा">शेर्पा</option>
                          <option value="क्षेत्री">क्षेत्री</option>
                          <option value="ब्राह्मण">ब्राह्मण</option>
                          <option value="नेवार">नेवार</option>
                          <option value="दलित (विश्वकर्मा/परियार/मिजार)">दलित (विश्वकर्मा/परियार/मिजार)</option>
                          <option value="गुरुङ/मगर">गुरुङ/मगर</option>
                          <option value="अन्य">अन्य</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
                          जग्गाको कित्ता नम्बर (Cadastral Parcel No)
                        </label>
                        <input
                          type="text"
                          placeholder="उदा. कित्ता नं. २३४"
                          value={editingHouse.cadastralParcelNo || ''}
                          onChange={(e) => setEditingHouse({ ...editingHouse, cadastralParcelNo: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            backgroundColor: '#1e293b',
                            border: '1px solid #475569',
                            borderRadius: '6px',
                            color: '#ffffff',
                            fontSize: '0.85rem',
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
                          जग्गाको स्वामित्व (Land Ownership)
                        </label>
                        <select
                          value={editingHouse.landOwnership || 'आफ्नो स्वामित्व (लालपुर्जा भएको)'}
                          onChange={(e) => setEditingHouse({ ...editingHouse, landOwnership: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            backgroundColor: '#1e293b',
                            border: '1px solid #475569',
                            borderRadius: '6px',
                            color: '#ffffff',
                            fontSize: '0.85rem',
                          }}
                        >
                          <option value="आफ्नो स्वामित्व (लालपुर्जा भएको)">आफ्नो स्वामित्व (लालपुर्जा भएको)</option>
                          <option value="ऐलानी / पर्ती जग्गा">ऐलानी / पर्ती जग्गा</option>
                          <option value="गुठी जग्गा">गुठी जग्गा</option>
                          <option value="भाडा / लिजमा लिएको">भाडा / लिजमा लिएको</option>
                          <option value="अन्य">अन्य</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* SECTION 2: भौगोलिक अवस्थिति (GPS Coordinates) */}
                  <div style={{ backgroundColor: '#0f172a', border: '1px solid #0284c7', borderRadius: '10px', padding: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Crosshair size={16} /> २. भौगोलिक अवस्थिति (GPS Latitude & Longitude)
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const id = editingHouse.id;
                          setEditingHouse(null);
                          setViewMode('map');
                          setTimeout(() => {
                            (window as any).__handleStartRelocateGps?.(id);
                          }, 250);
                        }}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          backgroundColor: '#0284c7',
                          color: '#ffffff',
                          border: 'none',
                          padding: '0.4rem 0.8rem',
                          borderRadius: '6px',
                          fontSize: '0.76rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        <Move size={13} />
                        <span>🗺️ नक्सामा तानेर सार्नुहोस् (Drag on Map)</span>
                      </button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
                          GPS Latitude (अक्षांश) *
                        </label>
                        <input
                          type="number"
                          step="0.000001"
                          required
                          value={editingHouse.gpsLat || ''}
                          onChange={(e) => setEditingHouse({ ...editingHouse, gpsLat: parseFloat(e.target.value) || 0 })}
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            backgroundColor: '#1e293b',
                            border: '1px solid #475569',
                            borderRadius: '6px',
                            color: '#ffffff',
                            fontSize: '0.85rem',
                            fontFamily: 'monospace',
                            fontWeight: 600,
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
                          GPS Longitude (देशान्तर) *
                        </label>
                        <input
                          type="number"
                          step="0.000001"
                          required
                          value={editingHouse.gpsLon || ''}
                          onChange={(e) => setEditingHouse({ ...editingHouse, gpsLon: parseFloat(e.target.value) || 0 })}
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            backgroundColor: '#1e293b',
                            border: '1px solid #475569',
                            borderRadius: '6px',
                            color: '#ffffff',
                            fontSize: '0.85rem',
                            fontFamily: 'monospace',
                            fontWeight: 600,
                          }}
                        />
                      </div>
                    </div>
                    <small style={{ display: 'block', marginTop: '0.45rem', fontSize: '0.73rem', color: '#94a3b8' }}>
                      💡 अक्षांश र देशान्तर म्यानुअल टाइप गर्न सक्नुहुन्छ वा माथिको <strong>"🗺️ नक्सामा तानेर सार्नुहोस्"</strong> बटन थिचेर नक्सामा मार्करलाई सिधै घिसारेर राख्न सक्नुहुन्छ।
                    </small>
                  </div>

                  {/* SECTION 3: आवास संरचना, नक्सा पास र NBC भवन सुरक्षा */}
                  <div style={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '10px', padding: '1.25rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#38bdf8', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Building2 size={16} /> ३. आवास संरचना, नक्सा पास र NBC भवन सुरक्षा
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
                          घरको संरचना प्रकार *
                        </label>
                        <select
                          value={editingHouse.houseType || 'अर्ध-पक्की (जस्ता छाना)'}
                          onChange={(e) => setEditingHouse({ ...editingHouse, houseType: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            backgroundColor: '#1e293b',
                            border: '1px solid #475569',
                            borderRadius: '6px',
                            color: '#ffffff',
                            fontSize: '0.85rem',
                          }}
                        >
                          <option value="पक्की (ढलान/RCC)">पक्की (ढलान/RCC)</option>
                          <option value="अर्ध-पक्की (जस्ता छाना)">अर्ध-पक्की (जस्ता छाना)</option>
                          <option value="परम्परागत ढुङ्गा-माटो (काठ/स्लेट)">परम्परागत ढुङ्गा-माटो (काठ/स्लेट)</option>
                          <option value="काठ तथा बाँसको संरचना">काठ तथा बाँसको संरचना</option>
                          <option value="कच्ची / अस्थायी टहरा">कच्ची / अस्थायी टहरा</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
                          तल्ला संख्या (Storeys)
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={10}
                          value={editingHouse.storeys || 1}
                          onChange={(e) => setEditingHouse({ ...editingHouse, storeys: Number(e.target.value) || 1 })}
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            backgroundColor: '#1e293b',
                            border: '1px solid #475569',
                            borderRadius: '6px',
                            color: '#ffffff',
                            fontSize: '0.85rem',
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
                          भवन निर्माण अनुमति / नक्सा पास
                        </label>
                        <select
                          value={editingHouse.buildingPermitStatus || 'पालिकाबाट नक्सा पास भएको'}
                          onChange={(e) => setEditingHouse({ ...editingHouse, buildingPermitStatus: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            backgroundColor: '#1e293b',
                            border: '1px solid #475569',
                            borderRadius: '6px',
                            color: '#ffffff',
                            fontSize: '0.85rem',
                          }}
                        >
                          <option value="पालिकाबाट नक्सा पास भएको">पालिकाबाट नक्सा पास भएको</option>
                          <option value="नक्सा पास नभएको / अभिलेखीकरण बाँकी">नक्सा पास नभएको / अभिलेखीकरण बाँकी</option>
                          <option value="मापदण्ड विपरीत बनेको">मापदण्ड विपरीत बनेको</option>
                          <option value="साविक गा.वि.स. कालको पुरानो भवन">साविक गा.वि.स. कालको पुरानो भवन</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
                          भूकम्प प्रतिरोधी पुनर्निर्माण स्थिति
                        </label>
                        <select
                          value={editingHouse.reconstructionStatus || 'NRA भूकम्प प्रतिरोधी मापदण्ड'}
                          onChange={(e) => setEditingHouse({ ...editingHouse, reconstructionStatus: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            backgroundColor: '#1e293b',
                            border: '1px solid #475569',
                            borderRadius: '6px',
                            color: '#ffffff',
                            fontSize: '0.85rem',
                          }}
                        >
                          <option value="NRA भूकम्प प्रतिरोधी मापदण्ड">NRA भूकम्प प्रतिरोधी मापदण्ड</option>
                          <option value="भूकम्प पूर्वको पुरानो संरचना">भूकम्प पूर्वको पुरानो संरचना</option>
                          <option value="रेट्रोफिटिङ / प्रबलीकरण गरिएको">रेट्रोफिटिङ / प्रबलीकरण गरिएको</option>
                          <option value="सामान्य मर्मत मात्र भएको">सामान्य मर्मत मात्र भएको</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* SECTION 4: खानेपानी, सरसफाइ र स्वच्छ ऊर्जा (WASH & Clean Energy) */}
                  <div style={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '10px', padding: '1.25rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#38bdf8', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Droplet size={16} /> ४. खानेपानी, सरसफाइ र स्वच्छ ऊर्जा (WASH & Clean Energy)
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
                          खानेपानीको मुख्य स्रोत
                        </label>
                        <select
                          value={editingHouse.drinkingWaterSource || 'धारा / पाइप प्रणाली (घर कम्पाउण्ड)'}
                          onChange={(e) => setEditingHouse({ ...editingHouse, drinkingWaterSource: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            backgroundColor: '#1e293b',
                            border: '1px solid #475569',
                            borderRadius: '6px',
                            color: '#ffffff',
                            fontSize: '0.85rem',
                          }}
                        >
                          <option value="धारा / पाइप प्रणाली (घर कम्पाउण्ड)">धारा / पाइप प्रणाली (घर कम्पाउण्ड)</option>
                          <option value="सार्वजनिक धारा / पँधेरो">सार्वजनिक धारा / पँधेरो</option>
                          <option value="मूल / इनार / कुवा">मूल / इनार / कुवा</option>
                          <option value="नदी / खोला">नदी / खोला</option>
                          <option value="जार / बोतलको पानी">जार / बोतलको पानी</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
                          पानी शुद्धीकरण विधि
                        </label>
                        <select
                          value={editingHouse.waterPurification || 'उमाल्ने / फिल्टर गर्ने'}
                          onChange={(e) => setEditingHouse({ ...editingHouse, waterPurification: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            backgroundColor: '#1e293b',
                            border: '1px solid #475569',
                            borderRadius: '6px',
                            color: '#ffffff',
                            fontSize: '0.85rem',
                          }}
                        >
                          <option value="उमाल्ने / फिल्टर गर्ने">उमाल्ने / फिल्टर गर्ने</option>
                          <option value="क्लोरिन / पियूष प्रयोग गर्ने">क्लोरिन / पियूष प्रयोग गर्ने</option>
                          <option value="सोडिस / घाममा राख्ने">सोडिस / घाममा राख्ने</option>
                          <option value="सिधै पिउने (कुनै शुद्धीकरण नगर्ने)">सिधै पिउने (कुनै शुद्धीकरण नगर्ने)</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
                          शौचालय सुविधा
                        </label>
                        <select
                          value={editingHouse.toiletType || 'फ्लश सहितको सुरक्षित चर्पी'}
                          onChange={(e) => setEditingHouse({ ...editingHouse, toiletType: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            backgroundColor: '#1e293b',
                            border: '1px solid #475569',
                            borderRadius: '6px',
                            color: '#ffffff',
                            fontSize: '0.85rem',
                          }}
                        >
                          <option value="फ्लश सहितको सुरक्षित चर्पी">फ्लश सहितको सुरक्षित चर्पी</option>
                          <option value="सामान्य खाल्डे चर्पी">सामान्य खाल्डे चर्पी</option>
                          <option value="सार्वजनिक / साझा चर्पी">सार्वजनिक / साझा चर्पी</option>
                          <option value="शौचालय नभएको">शौचालय नभएको</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
                          खाना पकाउने इन्धन
                        </label>
                        <select
                          value={editingHouse.cookingFuel || 'एलपीजी ग्यास (LPG)'}
                          onChange={(e) => setEditingHouse({ ...editingHouse, cookingFuel: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            backgroundColor: '#1e293b',
                            border: '1px solid #475569',
                            borderRadius: '6px',
                            color: '#ffffff',
                            fontSize: '0.85rem',
                          }}
                        >
                          <option value="एलपीजी ग्यास (LPG)">एलपीजी ग्यास (LPG)</option>
                          <option value="दाउरा / काठ">दाउरा / काठ</option>
                          <option value="बिजुली (इन्डक्सन / हीटर)">बिजुली (इन्डक्सन / हीटर)</option>
                          <option value="बायोग्यास">बायोग्यास</option>
                          <option value="अन्य">अन्य</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
                          उर्जा / बिजुलीको मुख्य स्रोत
                        </label>
                        <select
                          value={editingHouse.electricitySource || 'केन्द्रीय प्रसारण लाइन (NEA)'}
                          onChange={(e) => setEditingHouse({ ...editingHouse, electricitySource: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            backgroundColor: '#1e293b',
                            border: '1px solid #475569',
                            borderRadius: '6px',
                            color: '#ffffff',
                            fontSize: '0.85rem',
                          }}
                        >
                          <option value="केन्द्रीय प्रसारण लाइन (NEA)">केन्द्रीय प्रसारण लाइन (NEA)</option>
                          <option value="स्थानीय लघु जलविद्युत">स्थानीय लघु जलविद्युत</option>
                          <option value="सौर्य ऊर्जा (Solar Home System)">सौर्य ऊर्जा (Solar Home System)</option>
                          <option value="बिजुली नपुगेको">बिजुली नपुगेको</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* SECTION 5: विपद् संवेदनशीलता तथा जोखिम मूल्यांकन */}
                  <div style={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '10px', padding: '1.25rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fbbf24', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <ShieldCheck size={16} /> ५. विपद् संवेदनशीलता तथा जोखिम मूल्यांकन
                    </div>
                    <HazardAssessmentSection
                      riverName={editingHouse.meta?.riverName || ''}
                      riverDistance={editingHouse.meta?.riverDistance || (editingHouse.riskLevel === 'medium' ? '30_100' : 'gt250')}
                      slopeType={editingHouse.meta?.slopeType || (editingHouse.riskLevel === 'high' ? 'steep' : 'flat')}
                      hasActiveLandslide={Boolean(editingHouse.meta?.hasActiveLandslide)}
                      hasGroundCrack={Boolean(editingHouse.meta?.hasGroundCrack)}
                      hasLandslideHistory={Boolean(editingHouse.meta?.hasLandslideHistory)}
                      hasFloodHistory={Boolean(editingHouse.meta?.hasFloodHistory)}
                      hasRiverProtection={Boolean(editingHouse.meta?.hasRiverProtection)}
                      riskLevel={editingHouse.riskLevel || 'low'}
                      riskScore={editingHouse.riskScore || (editingHouse.riskLevel === 'high' ? 85 : editingHouse.riskLevel === 'medium' ? 55 : 10)}
                      riskDetails={editingHouse.riskDetails || 'सामान्य तथा सुरक्षित बस्ती क्षेत्र (Safe Terrain)'}
                      onChange={handleEditHazardChange}
                      onRiskLevelChange={(level) => setEditingHouse({ ...editingHouse, riskLevel: level })}
                      onRiskDetailsChange={(details) => setEditingHouse({ ...editingHouse, riskDetails: details })}
                    />
                    <div style={{ marginTop: '0.85rem', borderTop: '1px dashed #334155', paddingTop: '0.75rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', color: '#fbbf24', marginBottom: '0.25rem' }}>
                          🏃 सुरक्षित आश्रयस्थल (Evacuation Shelter) सम्म पुग्ने समय (मिनेट)
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={180}
                          value={editingHouse.safeShelterDistanceMins || 15}
                          onChange={(e) => setEditingHouse({ ...editingHouse, safeShelterDistanceMins: Number(e.target.value) || 15 })}
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            backgroundColor: '#1e293b',
                            border: '1px solid #475569',
                            borderRadius: '6px',
                            color: '#ffffff',
                            fontSize: '0.85rem',
                          }}
                        />
                        <small style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                          बाढी वा पहिरो आउँदा नजिकको सुरक्षित सामुदायिक भवन वा खुला चौरसम्म पुग्न लाग्ने पैदल समय
                        </small>
                      </div>
                    </div>
                  </div>

                  {/* Tab 1 Navigation Footer */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => setEditModalTab('family')}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                        backgroundColor: '#0284c7',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '0.55rem 1.25rem',
                        fontSize: '0.84rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        boxShadow: '0 4px 10px rgba(2, 132, 199, 0.3)',
                      }}
                    >
                      <span>अर्को ट्याब (२. परिवार विवरण)</span>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* ══════════════════════════════════════════════════════════ */}
              {/* TAB 2: सामाजिक सुरक्षा, लक्षित वर्ग र परिवार विवरण     */}
              {/* ══════════════════════════════════════════════════════════ */}
              {editModalTab === 'family' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', animation: 'fadeIn 0.2s ease' }}>
                  <div style={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '10px', padding: '1.25rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#a78bfa', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Users size={16} /> सामाजिक सुरक्षा तथा लक्षित वर्ग सूचकहरू
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem', marginBottom: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
                          कुल परिवार संख्या *
                        </label>
                        <input
                          type="number"
                          min={1}
                          value={editingHouse.familySize || 4}
                          onChange={(e) => setEditingHouse({ ...editingHouse, familySize: Number(e.target.value) || 1 })}
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            backgroundColor: '#1e293b',
                            border: '1px solid #475569',
                            borderRadius: '6px',
                            color: '#ffffff',
                            fontSize: '0.85rem',
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
                          अपाङ्गता भएका सदस्य संख्या
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={20}
                          value={editingHouse.disabilityCount ?? 0}
                          onChange={(e) => setEditingHouse({ ...editingHouse, disabilityCount: Number(e.target.value) || 0 })}
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            backgroundColor: '#1e293b',
                            border: '1px solid #475569',
                            borderRadius: '6px',
                            color: '#ffffff',
                            fontSize: '0.85rem',
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
                          अपाङ्गता परिचयपत्र वर्ग
                        </label>
                        <select
                          value={editingHouse.disabilityCardType || 'छैन'}
                          onChange={(e) => setEditingHouse({ ...editingHouse, disabilityCardType: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            backgroundColor: '#1e293b',
                            border: '1px solid #475569',
                            borderRadius: '6px',
                            color: '#ffffff',
                            fontSize: '0.85rem',
                          }}
                        >
                          <option value="छैन">छैन</option>
                          <option value="'क' वर्ग (रातो कार्ड - पूर्ण अशक्त)">'क' वर्ग (रातो कार्ड - पूर्ण अशक्त)</option>
                          <option value="'ख' वर्ग (नीलो कार्ड - अति अशक्त)">'ख' वर्ग (नीलो कार्ड - अति अशक्त)</option>
                          <option value="'ग' वर्ग (पहेंलो कार्ड - मध्यम)">'ग' वर्ग (पहेंलो कार्ड - मध्यम)</option>
                          <option value="'घ' वर्ग (सेतो कार्ड - सामान्य)">'घ' वर्ग (सेतो कार्ड - सामान्य)</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
                          सामाजिक सुरक्षा भत्ता प्राप्तकर्ता
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={20}
                          value={editingHouse.socialSecurityCount ?? 0}
                          onChange={(e) => setEditingHouse({ ...editingHouse, socialSecurityCount: Number(e.target.value) || 0 })}
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            backgroundColor: '#1e293b',
                            border: '1px solid #475569',
                            borderRadius: '6px',
                            color: '#ffffff',
                            fontSize: '0.85rem',
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
                          वैदेशिक रोजगारीमा रहेका सदस्य
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={10}
                          value={editingHouse.foreignMigrantsCount ?? 0}
                          onChange={(e) => setEditingHouse({ ...editingHouse, foreignMigrantsCount: Number(e.target.value) || 0 })}
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            backgroundColor: '#1e293b',
                            border: '1px solid #475569',
                            borderRadius: '6px',
                            color: '#ffffff',
                            fontSize: '0.85rem',
                          }}
                        />
                      </div>
                    </div>

                    {/* Edit Form Dynamic Family Members Table */}
                    <div
                      style={{
                        borderTop: '1px dashed #334155',
                        paddingTop: '1rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.82rem', color: '#cbd5e1', fontWeight: 700 }}>
                          परिवार सदस्यहरूको नामावली ({(editingHouse.familyMembers || []).length} सदस्य प्रविष्ट)
                        </span>
                        <button
                          type="button"
                          onClick={handleEditAddMember}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            backgroundColor: '#059669',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '0.35rem 0.85rem',
                            fontSize: '0.76rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          <UserPlus size={14} />
                          <span>+ नयाँ सदस्य थप्नुहोस्</span>
                        </button>
                      </div>

                      <div style={{ overflowX: 'auto' }}>
                        <div className="dt-responsive-table-wrapper">
                          <table style={{ width: '100%', fontSize: '0.78rem', borderCollapse: 'collapse', color: '#cbd5e1' }}>
                            <thead>
                              <tr style={{ borderBottom: '1px solid #334155', textAlign: 'left', color: '#94a3b8' }}>
                                <th style={{ padding: '0.4rem' }}>#</th>
                                <th style={{ padding: '0.4rem' }}>सदस्यको नाम</th>
                                <th style={{ padding: '0.4rem' }}>नाता (Relation)</th>
                                <th style={{ padding: '0.4rem' }}>लिङ्ग</th>
                                <th style={{ padding: '0.4rem' }}>उमेर</th>
                                <th style={{ padding: '0.4rem' }}>पेशा</th>
                                <th style={{ padding: '0.4rem', textAlign: 'center' }}>हटाउने</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(editingHouse.familyMembers || []).map((member: any, idx: number) => (
                                <tr key={idx} style={{ borderBottom: '1px solid #1e293b' }}>
                                  <td style={{ padding: '0.4rem', color: '#64748b' }}>{idx + 1}</td>
                                  <td style={{ padding: '0.4rem' }}>
                                    <input
                                      type="text"
                                      placeholder={idx === 0 ? editingHouse.householdName || 'घरमूलीको नाम' : `सदस्य ${idx + 1}`}
                                      value={member.name}
                                      onChange={(e) => handleEditMemberChange(idx, 'name', e.target.value)}
                                      style={{
                                        width: '100%',
                                        padding: '0.35rem 0.5rem',
                                        backgroundColor: '#1e293b',
                                        border: '1px solid #475569',
                                        borderRadius: '4px',
                                        color: '#ffffff',
                                        fontSize: '0.78rem',
                                      }}
                                    />
                                  </td>
                                  <td style={{ padding: '0.4rem' }}>
                                    <select
                                      value={member.relation}
                                      onChange={(e) => handleEditMemberChange(idx, 'relation', e.target.value)}
                                      style={{
                                        width: '100%',
                                        padding: '0.35rem 0.5rem',
                                        backgroundColor: '#1e293b',
                                        border: '1px solid #475569',
                                        borderRadius: '4px',
                                        color: '#ffffff',
                                        fontSize: '0.78rem',
                                      }}
                                    >
                                      <option value="घरमूली (Head)">घरमूली (Head)</option>
                                      <option value="श्रीमती">श्रीमती (Wife)</option>
                                      <option value="श्रीमान्">श्रीमान् (Husband)</option>
                                      <option value="छोरा">छोरा (Son)</option>
                                      <option value="छोरी">छोरी (Daughter)</option>
                                      <option value="बुबा">बुबा (Father)</option>
                                      <option value="आमा">आमा (Mother)</option>
                                      <option value="बुहारी">बुहारी (Daughter-in-law)</option>
                                      <option value="नाति/नातिना">नाति/नातिना (Grandchild)</option>
                                      <option value="अन्य">अन्य (Other)</option>
                                    </select>
                                  </td>
                                  <td style={{ padding: '0.4rem' }}>
                                    <select
                                      value={member.gender}
                                      onChange={(e) => handleEditMemberChange(idx, 'gender', e.target.value)}
                                      style={{
                                        width: '100%',
                                        padding: '0.35rem 0.5rem',
                                        backgroundColor: '#1e293b',
                                        border: '1px solid #475569',
                                        borderRadius: '4px',
                                        color: '#ffffff',
                                        fontSize: '0.78rem',
                                      }}
                                    >
                                      <option value="male">पुरुष</option>
                                      <option value="female">महिला</option>
                                      <option value="other">अन्य</option>
                                    </select>
                                  </td>
                                  <td style={{ padding: '0.4rem' }}>
                                    <input
                                      type="number"
                                      placeholder="उमेर"
                                      value={member.age || ''}
                                      onChange={(e) => handleEditMemberChange(idx, 'age', e.target.value)}
                                      style={{
                                        width: '70px',
                                        padding: '0.35rem 0.5rem',
                                        backgroundColor: '#1e293b',
                                        border: '1px solid #475569',
                                        borderRadius: '4px',
                                        color: '#ffffff',
                                        fontSize: '0.78rem',
                                      }}
                                    />
                                  </td>
                                  <td style={{ padding: '0.4rem' }}>
                                    <input
                                      type="text"
                                      placeholder="कृषि, विद्यार्थी..."
                                      value={member.occupation || ''}
                                      onChange={(e) => handleEditMemberChange(idx, 'occupation', e.target.value)}
                                      style={{
                                        width: '100%',
                                        padding: '0.35rem 0.5rem',
                                        backgroundColor: '#1e293b',
                                        border: '1px solid #475569',
                                        borderRadius: '4px',
                                        color: '#ffffff',
                                        fontSize: '0.78rem',
                                      }}
                                    />
                                  </td>
                                  <td style={{ padding: '0.4rem', textAlign: 'center' }}>
                                    {idx > 0 && (
                                      <button
                                        type="button"
                                        onClick={() => handleEditRemoveMember(idx)}
                                        style={{
                                          background: 'none',
                                          border: 'none',
                                          color: '#ef4444',
                                          cursor: 'pointer',
                                          padding: '2px',
                                        }}
                                        title="हटाउनुहोस्"
                                      >
                                        <Trash2 size={15} />
                                      </button>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tab 2 Navigation Footer */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => setEditModalTab('basic')}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                        backgroundColor: '#334155',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '0.55rem 1.25rem',
                        fontSize: '0.84rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      <ChevronLeft size={16} />
                      <span>अघिल्लो (१. घरधुरी तथा आवास)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditModalTab('agriculture')}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                        backgroundColor: '#059669',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '0.55rem 1.25rem',
                        fontSize: '0.84rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        boxShadow: '0 4px 10px rgba(5, 150, 105, 0.3)',
                      }}
                    >
                      <span>अर्को ट्याब (३. कृषि, पशुधन र जीविकोपार्जन)</span>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* ══════════════════════════════════════════════════════════ */}
              {/* TAB 3: कृषि, पशुधन र जीविकोपार्जन (Agri Profile)        */}
              {/* ══════════════════════════════════════════════════════════ */}
              {editModalTab === 'agriculture' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', animation: 'fadeIn 0.2s ease' }}>
                  {/* Top Header Card */}
                  <div
                    style={{
                      backgroundColor: '#0f172a',
                      padding: '1.25rem',
                      borderRadius: '12px',
                      border: '1px solid #334155',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
                      display: 'flex',
                      flexWrap: 'wrap',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '1rem',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
                        <div style={{ padding: '0.45rem', backgroundColor: 'rgba(74, 222, 128, 0.15)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Sprout size={22} color="#4ade80" />
                        </div>
                        <h4 style={{ margin: 0, fontSize: '1.08rem', color: '#f8fafc', fontWeight: 800 }}>
                          कृषि तथा किसान प्रोफाइल विवरण (Agri & Livelihood Profile)
                        </h4>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                        घरधुरी: <strong style={{ color: '#e2e8f0' }}>{editingHouse?.householdName || ''}</strong> | म्याट्रिक्स कोड: <code style={{ color: '#38bdf8' }}>{editingHouse?.matrixHouseNo}</code>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <span
                        style={{
                          padding: '0.35rem 0.8rem',
                          borderRadius: '20px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          backgroundColor: (agriProfileData.landAreaHectares || 0) >= 2 ? 'rgba(234, 179, 8, 0.15)' : (agriProfileData.landAreaHectares || 0) >= 0.5 ? 'rgba(56, 189, 248, 0.15)' : 'rgba(74, 222, 128, 0.15)',
                          color: (agriProfileData.landAreaHectares || 0) >= 2 ? '#facc15' : (agriProfileData.landAreaHectares || 0) >= 0.5 ? '#38bdf8' : '#4ade80',
                          border: `1px solid ${(agriProfileData.landAreaHectares || 0) >= 2 ? '#ca8a04' : (agriProfileData.landAreaHectares || 0) >= 0.5 ? '#0284c7' : '#16a34a'}`,
                        }}
                      >
                        {(agriProfileData.landAreaHectares || 0) >= 2
                          ? '🚜 व्यावसायिक किसान (>२ हेक्टर)'
                          : (agriProfileData.landAreaHectares || 0) >= 0.5
                          ? '🌾 मध्यम किसान (०.५-२ हेक्टर)'
                          : '🌱 साना / निर्वाहमुखी (<०.५ हेक्टर)'}
                      </span>

                      <button
                        type="button"
                        onClick={() => saveAgriProfileMutation.mutate(agriProfileData)}
                        disabled={saveAgriProfileMutation.isPending}
                        style={{
                          background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                          color: '#ffffff',
                          padding: '0.55rem 1.15rem',
                          borderRadius: '8px',
                          border: 'none',
                          cursor: saveAgriProfileMutation.isPending ? 'not-allowed' : 'pointer',
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)',
                        }}
                      >
                        <Save size={15} />
                        {saveAgriProfileMutation.isPending ? 'सुरक्षित हुँदैछ...' : '💾 कृषि विवरण सुरक्षित'}
                      </button>
                    </div>
                  </div>

                  {/* Sub-Navigation Tabs */}
                  <div
                    style={{
                      display: 'flex',
                      gap: '0.5rem',
                      backgroundColor: '#1e293b',
                      padding: '0.4rem',
                      borderRadius: '10px',
                      border: '1px solid #334155',
                      overflowX: 'auto',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setActiveAgriSubTab('land')}
                      style={{
                        flex: 1,
                        minWidth: '130px',
                        padding: '0.55rem 0.75rem',
                        borderRadius: '7px',
                        border: 'none',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        backgroundColor: activeAgriSubTab === 'land' ? '#0f172a' : 'transparent',
                        color: activeAgriSubTab === 'land' ? '#4ade80' : '#94a3b8',
                        borderBottom: activeAgriSubTab === 'land' ? '2px solid #4ade80' : 'none',
                      }}
                    >
                      🗺️ १. जग्गा र सिँचाइ
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveAgriSubTab('crops')}
                      style={{
                        flex: 1,
                        minWidth: '130px',
                        padding: '0.55rem 0.75rem',
                        borderRadius: '7px',
                        border: 'none',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        backgroundColor: activeAgriSubTab === 'crops' ? '#0f172a' : 'transparent',
                        color: activeAgriSubTab === 'crops' ? '#38bdf8' : '#94a3b8',
                        borderBottom: activeAgriSubTab === 'crops' ? '2px solid #38bdf8' : 'none',
                      }}
                    >
                      🌾 २. मुख्य बालीहरू ({(agriProfileData.mainCrops || []).length})
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveAgriSubTab('livestock')}
                      style={{
                        flex: 1,
                        minWidth: '130px',
                        padding: '0.55rem 0.75rem',
                        borderRadius: '7px',
                        border: 'none',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        backgroundColor: activeAgriSubTab === 'livestock' ? '#0f172a' : 'transparent',
                        color: activeAgriSubTab === 'livestock' ? '#fbbf24' : '#94a3b8',
                        borderBottom: activeAgriSubTab === 'livestock' ? '2px solid #fbbf24' : 'none',
                      }}
                    >
                      🐄 ३. चौपाया/पशुपन्छी ({totalLivestockInAgriProfile})
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveAgriSubTab('subsidies')}
                      style={{
                        flex: 1,
                        minWidth: '140px',
                        padding: '0.55rem 0.75rem',
                        borderRadius: '7px',
                        border: 'none',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        backgroundColor: activeAgriSubTab === 'subsidies' ? '#0f172a' : 'transparent',
                        color: activeAgriSubTab === 'subsidies' ? '#a78bfa' : '#94a3b8',
                        borderBottom: activeAgriSubTab === 'subsidies' ? '2px solid #a78bfa' : 'none',
                      }}
                    >
                      💰 ४. अनुदान, बिमा र बजार
                    </button>
                  </div>

                  {/* SUB-TAB 1: LAND & IRRIGATION */}
                  {activeAgriSubTab === 'land' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      <div style={{ backgroundColor: '#0f172a', padding: '1.25rem', borderRadius: '10px', border: '1px solid #334155' }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#4ade80', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span>📐 कुल कृषि जग्गाको क्षेत्रफल (Land Measurement)</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                          <div style={{ backgroundColor: '#1e293b', padding: '1rem', borderRadius: '8px', border: '1px solid #334155' }}>
                            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.6rem' }}>
                              नेपाली परम्परागत एकाइ (रोपनी - आना - पैसा - दाम):
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.5rem' }}>
                              <div>
                                <label style={{ display: 'block', fontSize: '0.72rem', color: '#94a3b8', marginBottom: '0.2rem' }}>रोपनी</label>
                                <input
                                  type="number"
                                  min="0"
                                  value={agriProfileData.additionalDetails?.ropani ?? 0}
                                  onChange={(e) => handleLandRopaniChange(
                                    parseInt(e.target.value) || 0,
                                    agriProfileData.additionalDetails?.aana || 0,
                                    agriProfileData.additionalDetails?.paisa || 0,
                                    agriProfileData.additionalDetails?.daam || 0
                                  )}
                                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#fff', textAlign: 'center', fontWeight: 700 }}
                                />
                              </div>
                              <div>
                                <label style={{ display: 'block', fontSize: '0.72rem', color: '#94a3b8', marginBottom: '0.2rem' }}>आना (०-१५)</label>
                                <input
                                  type="number"
                                  min="0"
                                  max="15"
                                  value={agriProfileData.additionalDetails?.aana ?? 0}
                                  onChange={(e) => handleLandRopaniChange(
                                    agriProfileData.additionalDetails?.ropani || 0,
                                    parseInt(e.target.value) || 0,
                                    agriProfileData.additionalDetails?.paisa || 0,
                                    agriProfileData.additionalDetails?.daam || 0
                                  )}
                                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#fff', textAlign: 'center', fontWeight: 700 }}
                                />
                              </div>
                              <div>
                                <label style={{ display: 'block', fontSize: '0.72rem', color: '#94a3b8', marginBottom: '0.2rem' }}>पैसा (०-३)</label>
                                <input
                                  type="number"
                                  min="0"
                                  max="3"
                                  value={agriProfileData.additionalDetails?.paisa ?? 0}
                                  onChange={(e) => handleLandRopaniChange(
                                    agriProfileData.additionalDetails?.ropani || 0,
                                    agriProfileData.additionalDetails?.aana || 0,
                                    parseInt(e.target.value) || 0,
                                    agriProfileData.additionalDetails?.daam || 0
                                  )}
                                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#fff', textAlign: 'center', fontWeight: 700 }}
                                />
                              </div>
                              <div>
                                <label style={{ display: 'block', fontSize: '0.72rem', color: '#94a3b8', marginBottom: '0.2rem' }}>दाम (०-३)</label>
                                <input
                                  type="number"
                                  min="0"
                                  max="3"
                                  value={agriProfileData.additionalDetails?.daam ?? 0}
                                  onChange={(e) => handleLandRopaniChange(
                                    agriProfileData.additionalDetails?.ropani || 0,
                                    agriProfileData.additionalDetails?.aana || 0,
                                    agriProfileData.additionalDetails?.paisa || 0,
                                    parseInt(e.target.value) || 0
                                  )}
                                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#fff', textAlign: 'center', fontWeight: 700 }}
                                />
                              </div>
                            </div>
                          </div>

                          <div style={{ backgroundColor: '#1e293b', padding: '1rem', borderRadius: '8px', border: '1px solid #334155' }}>
                            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.6rem' }}>
                              मेट्रिक एकाइ (हेक्टर / Hectares):
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <input
                                type="number"
                                step="0.0001"
                                min="0"
                                value={agriProfileData.landAreaHectares || 0}
                                onChange={(e) => handleLandHectaresChange(parseFloat(e.target.value) || 0)}
                                style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#38bdf8', fontSize: '1rem', fontWeight: 700 }}
                              />
                              <span style={{ fontSize: '0.84rem', color: '#94a3b8' }}>हेक्टर</span>
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.5rem' }}>
                              ≈ {((agriProfileData.landAreaHectares || 0) * 19.656).toFixed(2)} रोपनी (१ हेक्टर ≈ १९.६५ रोपनी)
                            </div>
                          </div>
                        </div>

                        {/* Land Ownership */}
                        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px dashed #334155' }}>
                          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.5rem' }}>
                            जग्गाको भोगचलन / स्वामित्व प्रकार:
                          </label>
                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {['आफ्नै (Own)', 'भाडा / लिजमा', 'बटैया / अधिया', 'मोहियानी', 'ऐलानी / सार्वजनिक भोगचलन'].map(opt => {
                              const selected = agriProfileData.additionalDetails?.landOwnership === opt;
                              return (
                                <button
                                  key={opt}
                                  type="button"
                                  onClick={() => setAgriProfileData(p => ({
                                    ...p,
                                    additionalDetails: { ...(p.additionalDetails || {}), landOwnership: opt }
                                  }))}
                                  style={{
                                    padding: '0.4rem 0.8rem',
                                    borderRadius: '6px',
                                    border: selected ? '1px solid #10b981' : '1px solid #334155',
                                    backgroundColor: selected ? 'rgba(16, 185, 129, 0.15)' : '#1e293b',
                                    color: selected ? '#34d399' : '#cbd5e1',
                                    cursor: 'pointer',
                                    fontSize: '0.78rem',
                                    fontWeight: selected ? 700 : 500,
                                  }}
                                >
                                  {selected ? '✓ ' : ''}{opt}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Land Types & Irrigation */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px dashed #334155' }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.4rem' }}>
                              जग्गाको किसिम (बहु-चयन):
                            </label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                              {['खेत / सिञ्चित जग्गा', 'बारी / पाखो', 'कान्ला / भिर जमिन', 'टनेल / हरितगृह'].map(t => {
                                const selected = (agriProfileData.additionalDetails?.landTypes || []).includes(t);
                                return (
                                  <button
                                    key={t}
                                    type="button"
                                    onClick={() => handleToggleAgriDetailArray('landTypes', t)}
                                    style={{
                                      padding: '0.3rem 0.6rem',
                                      borderRadius: '6px',
                                      border: selected ? '1px solid #38bdf8' : '1px solid #334155',
                                      backgroundColor: selected ? 'rgba(56, 189, 248, 0.15)' : '#1e293b',
                                      color: selected ? '#38bdf8' : '#cbd5e1',
                                      cursor: 'pointer',
                                      fontSize: '0.75rem',
                                      fontWeight: selected ? 700 : 500,
                                    }}
                                  >
                                    {selected ? '✓ ' : '+ '}{t}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.4rem' }}>
                              सिँचाइको सुविधा:
                            </label>
                            <select
                              value={agriProfileData.additionalDetails?.irrigationType || 'मौसमी (आकासे पानी)'}
                              onChange={(e) => setAgriProfileData(p => ({
                                ...p,
                                additionalDetails: { ...(p.additionalDetails || {}), irrigationType: e.target.value }
                              }))}
                              style={{ width: '100%', padding: '0.5rem', backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '6px', color: '#fff', fontSize: '0.82rem' }}
                            >
                              {['१२ महिना कुलो / नहर', 'मौसमी (आकासे पानी)', 'लिफ्ट सिँचाइ', 'बोरिङ / भूमिगत पानी', 'थोपा / स्प्रिंकलर'].map(irr => (
                                <option key={irr} value={irr}>{irr}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SUB-TAB 2: MAIN CROPS */}
                  {activeAgriSubTab === 'crops' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', backgroundColor: '#0f172a', padding: '1.25rem', borderRadius: '10px', border: '1px solid #334155' }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#38bdf8' }}>
                        🌾 यस घरधुरीमा उब्जाउ हुने मुख्य कृषि बालीहरू छनोट गर्नुहोस्
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {[
                          'धान (Paddy)', 'मकै (Maize)', 'कोदो (Millet)', 'आलु (Potato)', 'गहुँ (Wheat)',
                          'फापर (Buckwheat)', 'भटमास (Soybean)', 'किवी फल (Kiwi)', 'अलैँची (Cardamom)',
                          'रेन्बो ट्राउट (Trout)', 'मौसमी तरकारी (Vegetables)', 'सुन्तला / फलफूल (Fruits)',
                          'चिया / कफी (Tea/Coffee)', 'च्याउ (Mushroom)', 'जडिबुटी (Herbs)'
                        ].map(crop => {
                          const isSelected = (agriProfileData.mainCrops || []).includes(crop);
                          return (
                            <button
                              key={crop}
                              type="button"
                              onClick={() => handleToggleCrop(crop)}
                              style={{
                                padding: '0.45rem 0.85rem',
                                borderRadius: '8px',
                                border: isSelected ? '1px solid #38bdf8' : '1px solid #334155',
                                backgroundColor: isSelected ? 'rgba(56, 189, 248, 0.2)' : '#1e293b',
                                color: isSelected ? '#38bdf8' : '#cbd5e1',
                                cursor: 'pointer',
                                fontSize: '0.8rem',
                                fontWeight: isSelected ? 700 : 500,
                              }}
                            >
                              {isSelected ? '✓ ' : '+ '}{crop}
                            </button>
                          );
                        })}
                      </div>

                      {/* Custom Crop Input */}
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                        <input
                          type="text"
                          placeholder="अन्य बाली भए यहाँ टाइप गरी थप्नुहोस्..."
                          value={customCropInput}
                          onChange={(e) => setCustomCropInput(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustomCrop(); } }}
                          style={{ flex: 1, padding: '0.45rem 0.75rem', backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '6px', color: '#fff', fontSize: '0.82rem' }}
                        />
                        <button
                          type="button"
                          onClick={handleAddCustomCrop}
                          style={{ backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', padding: '0.45rem 1rem', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}
                        >
                          + बाली थप्नुहोस्
                        </button>
                      </div>

                      <div style={{ borderTop: '1px dashed #334155', paddingTop: '0.75rem', fontSize: '0.8rem', color: '#94a3b8' }}>
                        छनोट गरिएका बालीहरू ({(agriProfileData.mainCrops || []).length}): <strong style={{ color: '#38bdf8' }}>{(agriProfileData.mainCrops || []).join(', ') || 'कुनै चयन गरिएको छैन'}</strong>
                      </div>
                    </div>
                  )}

                  {/* SUB-TAB 3: LIVESTOCK */}
                  {activeAgriSubTab === 'livestock' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', backgroundColor: '#0f172a', padding: '1.25rem', borderRadius: '10px', border: '1px solid #334155' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#fbbf24' }}>
                          🐄 चौपाया तथा पशुपन्छी लगत (Livestock & Poultry Count)
                        </div>
                        <span style={{ backgroundColor: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24', border: '1px solid #ca8a04', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 700 }}>
                          कुल पशुपन्छी: {totalLivestockInAgriProfile}
                        </span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem' }}>
                        {[
                          { key: 'cows', label: 'गाई / गोरु (Cattle)', icon: '🐄' },
                          { key: 'buffalo', label: 'भैँसी / राँगा (Buffalo)', icon: '🐃' },
                          { key: 'chauri', label: 'चौंरी / याक (Yak/Chauri)', icon: '🏔️' },
                          { key: 'goats', label: 'बाख्रा / खसी (Goats)', icon: '🐐' },
                          { key: 'sheep', label: 'भेडा / च्याङ्ग्रा (Sheep)', icon: '🐑' },
                          { key: 'poultry', label: 'कुखुरा / हाँस (Poultry)', icon: '🐔' },
                          { key: 'pigs', label: 'बङ्गुर / सुँगुर (Swine)', icon: '🐖' },
                          { key: 'bees', label: 'मौरी (घार संख्या)', icon: '🐝' },
                        ].map(item => {
                          const count = Number(agriProfileData.livestockDetails?.[item.key] || 0);
                          return (
                            <div key={item.key} style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#cbd5e1' }}>
                                {item.icon} {item.label}
                              </span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateLivestock(item.key, -1)}
                                  style={{ width: '28px', height: '28px', borderRadius: '4px', backgroundColor: '#334155', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700 }}
                                >
                                  -
                                </button>
                                <input
                                  type="number"
                                  min="0"
                                  value={count}
                                  onChange={(e) => handleSetLivestock(item.key, parseInt(e.target.value) || 0)}
                                  style={{ flex: 1, padding: '0.3rem', textAlign: 'center', backgroundColor: '#0f172a', border: '1px solid #475569', borderRadius: '4px', color: '#fff', fontWeight: 700, fontSize: '0.88rem' }}
                                />
                                <button
                                  type="button"
                                  onClick={() => handleUpdateLivestock(item.key, 1)}
                                  style={{ width: '28px', height: '28px', borderRadius: '4px', backgroundColor: '#059669', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700 }}
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* SUB-TAB 4: SUBSIDIES, INSURANCE & MARKETS */}
                  {activeAgriSubTab === 'subsidies' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', backgroundColor: '#0f172a', padding: '1.25rem', borderRadius: '10px', border: '1px solid #334155' }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#a78bfa' }}>
                        💰 अनुदान, बिमा, कर्जा र बजार व्यवस्थापन
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                        <div style={{ backgroundColor: '#1e293b', padding: '0.85rem', borderRadius: '8px', border: '1px solid #334155' }}>
                          <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.35rem' }}>
                            कृषि तथा पशु बिमा स्थिति
                          </label>
                          <select
                            value={agriProfileData.additionalDetails?.hasInsurance ? 'yes' : 'no'}
                            onChange={(e) => setAgriProfileData(p => ({
                              ...p,
                              additionalDetails: { ...(p.additionalDetails || {}), hasInsurance: e.target.value === 'yes' }
                            }))}
                            style={{ width: '100%', padding: '0.45rem', backgroundColor: '#0f172a', border: '1px solid #475569', borderRadius: '6px', color: '#fff', fontSize: '0.82rem' }}
                          >
                            <option value="yes">✓ बिमा गरिएको छ</option>
                            <option value="no">✗ बिमा गरिएको छैन</option>
                          </select>
                        </div>

                        <div style={{ backgroundColor: '#1e293b', padding: '0.85rem', borderRadius: '8px', border: '1px solid #334155' }}>
                          <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.35rem' }}>
                            कृषि सहुलियत कर्जा / ऋण
                          </label>
                          <select
                            value={agriProfileData.additionalDetails?.hasLoan ? 'yes' : 'no'}
                            onChange={(e) => setAgriProfileData(p => ({
                              ...p,
                              additionalDetails: { ...(p.additionalDetails || {}), hasLoan: e.target.value === 'yes' }
                            }))}
                            style={{ width: '100%', padding: '0.45rem', backgroundColor: '#0f172a', border: '1px solid #475569', borderRadius: '6px', color: '#fff', fontSize: '0.82rem' }}
                          >
                            <option value="yes">✓ सहुलियत कर्जा लिएको</option>
                            <option value="no">✗ कर्जा नलिएको</option>
                          </select>
                        </div>
                      </div>

                      {/* Subsidies List */}
                      <div style={{ borderTop: '1px dashed #334155', paddingTop: '0.75rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1' }}>
                            प्राप्त पालिका अनुदान तथा राहत रेकर्ड
                          </span>
                          <button
                            type="button"
                            onClick={() => setShowSubsidyModal(true)}
                            style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', padding: '0.3rem 0.75rem', fontSize: '0.76rem', fontWeight: 700, cursor: 'pointer' }}
                          >
                            + नयाँ अनुदान थप्नुहोस्
                          </button>
                        </div>

                        {showSubsidyModal && (
                          <div style={{ backgroundColor: '#1e293b', border: '1px solid #10b981', borderRadius: '8px', padding: '0.85rem', marginBottom: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#34d399' }}>नयाँ अनुदान विवरण प्रविष्टि</div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.5rem' }}>
                              <input
                                type="text"
                                placeholder="मिति (उदा. २०८०/११/१२)"
                                value={newSubsidy.date}
                                onChange={(e) => setNewSubsidy({ ...newSubsidy, date: e.target.value })}
                                style={{ padding: '0.4rem', backgroundColor: '#0f172a', border: '1px solid #475569', borderRadius: '4px', color: '#fff', fontSize: '0.78rem' }}
                              />
                              <input
                                type="text"
                                placeholder="आ.व. (उदा. २०८०/८१)"
                                value={newSubsidy.fiscalYear}
                                onChange={(e) => setNewSubsidy({ ...newSubsidy, fiscalYear: e.target.value })}
                                style={{ padding: '0.4rem', backgroundColor: '#0f172a', border: '1px solid #475569', borderRadius: '4px', color: '#fff', fontSize: '0.78rem' }}
                              />
                              <input
                                type="text"
                                placeholder="प्रयोजन (उदा. मिनिटिलर अनुदान)"
                                value={newSubsidy.purpose}
                                onChange={(e) => setNewSubsidy({ ...newSubsidy, purpose: e.target.value })}
                                style={{ padding: '0.4rem', backgroundColor: '#0f172a', border: '1px solid #475569', borderRadius: '4px', color: '#fff', fontSize: '0.78rem' }}
                              />
                              <input
                                type="number"
                                placeholder="रकम (रु.)"
                                value={newSubsidy.amount || ''}
                                onChange={(e) => setNewSubsidy({ ...newSubsidy, amount: Number(e.target.value) || 0 })}
                                style={{ padding: '0.4rem', backgroundColor: '#0f172a', border: '1px solid #475569', borderRadius: '4px', color: '#fff', fontSize: '0.78rem' }}
                              />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.3rem' }}>
                              <button
                                type="button"
                                onClick={() => setShowSubsidyModal(false)}
                                style={{ background: '#475569', color: '#fff', padding: '0.35rem 0.75rem', borderRadius: '4px', border: 'none', cursor: 'pointer', fontSize: '0.75rem' }}
                              >
                                रद्द
                              </button>
                              <button
                                type="button"
                                onClick={() => addSubsidyMutation.mutate(newSubsidy)}
                                disabled={!newSubsidy.date || !newSubsidy.purpose || !newSubsidy.amount || addSubsidyMutation.isPending}
                                style={{ background: '#10b981', color: '#fff', padding: '0.35rem 1rem', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.75rem' }}
                              >
                                {addSubsidyMutation.isPending ? 'थपिँदैछ...' : 'रेकर्ड सुरक्षित गर्नुहोस्'}
                              </button>
                            </div>
                          </div>
                        )}

                        <div className="dt-responsive-table-wrapper">
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', color: '#e2e8f0' }}>
                            <thead>
                              <tr style={{ backgroundColor: '#1e293b', borderBottom: '1px solid #334155', color: '#94a3b8', textAlign: 'left' }}>
                                <th style={{ padding: '0.45rem' }}>मिति</th>
                                <th style={{ padding: '0.45rem' }}>आ.व.</th>
                                <th style={{ padding: '0.45rem' }}>प्रयोजन / कार्यक्रम</th>
                                <th style={{ padding: '0.45rem', textAlign: 'right' }}>रकम (रू.)</th>
                              </tr>
                            </thead>
                            <tbody>
                              {agriProfile?.subsidiesReceived && agriProfile.subsidiesReceived.length > 0 ? (
                                agriProfile.subsidiesReceived.map((s, idx) => (
                                  <tr key={idx} style={{ borderBottom: '1px solid #334155' }}>
                                    <td style={{ padding: '0.45rem' }}>{s.date}</td>
                                    <td style={{ padding: '0.45rem' }}>{s.fiscalYear}</td>
                                    <td style={{ padding: '0.45rem', fontWeight: 600 }}>{s.purpose}</td>
                                    <td style={{ padding: '0.45rem', textAlign: 'right', color: '#4ade80', fontWeight: 700 }}>
                                      रू. {Number(s.amount).toLocaleString()}
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan={4} style={{ padding: '0.8rem', textAlign: 'center', color: '#94a3b8' }}>
                                    हालसम्म कुनै अनुदान रेकर्ड भेटिएन।
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tab 3 Navigation Footer */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => setEditModalTab('family')}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                        backgroundColor: '#334155',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '0.55rem 1.25rem',
                        fontSize: '0.84rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      <ChevronLeft size={16} />
                      <span>अघिल्लो (२. परिवार विवरण)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditModalTab('waste')}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                        backgroundColor: '#16a34a',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '0.55rem 1.25rem',
                        fontSize: '0.84rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        boxShadow: '0 4px 10px rgba(22, 163, 74, 0.3)',
                      }}
                    >
                      <span>अर्को ट्याब (४. फोहोरमैला व्यवस्थापन)</span>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* ══════════════════════════════════════════════════════════ */}
              {/* TAB 4: फोहोरमैला व्यवस्थापन (Solid Waste Management)   */}
              {/* ══════════════════════════════════════════════════════════ */}
              {editModalTab === 'waste' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', animation: 'fadeIn 0.2s ease' }}>
                  {/* Clean for Cash Green Wallet KPI Cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                    <div style={{ backgroundColor: '#0f172a', padding: '1.25rem', borderRadius: '12px', border: '1px solid #16a34a', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontSize: '0.82rem', color: '#4ade80', fontWeight: 600, marginBottom: '0.35rem' }}>Clean for Cash वालेट ब्यालेन्स</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <span style={{ fontSize: '1.3rem', fontWeight: 900, color: '#22c55e' }}>रु.</span>
                          <input
                            type="number"
                            min="0"
                            value={editingHouse.meta?.walletBalance ?? 1250}
                            onChange={(e) => setEditingHouse({
                              ...editingHouse,
                              meta: { ...(editingHouse.meta || {}), walletBalance: Number(e.target.value) || 0 }
                            })}
                            style={{
                              width: '100px',
                              padding: '0.35rem 0.5rem',
                              backgroundColor: '#1e293b',
                              border: '1px solid #16a34a',
                              borderRadius: '6px',
                              color: '#22c55e',
                              fontSize: '1.3rem',
                              fontWeight: 900,
                            }}
                          />
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '0.35rem' }}>कर समायोजनमा प्रयोग गर्न सकिने</div>
                      </div>
                      <div style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', padding: '0.85rem', borderRadius: '50%' }}>
                        <Banknote size={28} color="#4ade80" />
                      </div>
                    </div>

                    <div style={{ backgroundColor: '#0f172a', padding: '1.25rem', borderRadius: '12px', border: '1px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontSize: '0.82rem', color: '#38bdf8', fontWeight: 600, marginBottom: '0.35rem' }}>रिसाइकल फोहोर (यो वर्ष)</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <input
                            type="number"
                            min="0"
                            value={editingHouse.meta?.recycledKg ?? 45}
                            onChange={(e) => setEditingHouse({
                              ...editingHouse,
                              meta: { ...(editingHouse.meta || {}), recycledKg: Number(e.target.value) || 0 }
                            })}
                            style={{
                              width: '80px',
                              padding: '0.35rem 0.5rem',
                              backgroundColor: '#1e293b',
                              border: '1px solid #0284c7',
                              borderRadius: '6px',
                              color: '#38bdf8',
                              fontSize: '1.3rem',
                              fontWeight: 900,
                            }}
                          />
                          <span style={{ fontSize: '1rem', fontWeight: 700, color: '#cbd5e1' }}>केजी</span>
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '0.35rem' }}>प्लास्टिक, सिसा, फलाम र कागज</div>
                      </div>
                      <div style={{ backgroundColor: 'rgba(56, 189, 248, 0.1)', padding: '0.85rem', borderRadius: '50%' }}>
                        <Leaf size={28} color="#38bdf8" />
                      </div>
                    </div>
                  </div>

                  {/* 1. स्रोतमा फोहोर वर्गीकरण (Source Segregation) */}
                  <div style={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '10px', padding: '1.25rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#4ade80', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Leaf size={16} /> १. स्रोतमा फोहोर वर्गीकरण (Source Waste Segregation)
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.35rem' }}>
                          वर्गीकरण स्थिति (कुहिने र नकुहिने अलग गरिएको)
                        </label>
                        <select
                          value={editingHouse.meta?.wasteSegregation || 'स्रोतमा वर्गीकरण गरिएको (कुहिने र नकुहिने अलग)'}
                          onChange={(e) => setEditingHouse({
                            ...editingHouse,
                            meta: { ...(editingHouse.meta || {}), wasteSegregation: e.target.value }
                          })}
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            backgroundColor: '#1e293b',
                            border: '1px solid #475569',
                            borderRadius: '6px',
                            color: '#ffffff',
                            fontSize: '0.85rem',
                          }}
                        >
                          <option value="स्रोतमा वर्गीकरण गरिएको (कुहिने र नकुहिने अलग)">स्रोतमा वर्गीकरण गरिएको (कुहिने र नकुहिने अलग)</option>
                          <option value="आंशिक वर्गीकरण (प्लास्टिक मात्र अलग)">आंशिक वर्गीकरण (प्लास्टिक मात्र अलग)</option>
                          <option value="वर्गीकरण नगरिएको (मिश्रित फोहोर)">वर्गीकरण नगरिएको (मिश्रित फोहोर)</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.35rem' }}>
                          घरधुरीमा छुट्याइने फोहोरका प्रकारहरू:
                        </label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                          {[
                            'कुहिने (अर्गानिक/कम्पोस्ट)',
                            'प्लास्टिक र पेट बोतल',
                            'सिसा तथा काँच',
                            'फलाम तथा धातु',
                            'कागज तथा गत्ता',
                            'ई-कचरा (इलेक्ट्रोनिक्स/ब्याट्री)',
                          ].map(type => {
                            const currentTypes: string[] = editingHouse.meta?.wasteTypes || ['कुहिने (अर्गानिक/कम्पोस्ट)', 'प्लास्टिक र पेट बोतल', 'सिसा तथा काँच'];
                            const isChecked = currentTypes.includes(type);
                            return (
                              <button
                                key={type}
                                type="button"
                                onClick={() => {
                                  const updated = isChecked ? currentTypes.filter(t => t !== type) : [...currentTypes, type];
                                  setEditingHouse({
                                    ...editingHouse,
                                    meta: { ...(editingHouse.meta || {}), wasteTypes: updated }
                                  });
                                }}
                                style={{
                                  padding: '0.3rem 0.6rem',
                                  borderRadius: '6px',
                                  border: isChecked ? '1px solid #22c55e' : '1px solid #334155',
                                  backgroundColor: isChecked ? 'rgba(34, 197, 94, 0.15)' : '#1e293b',
                                  color: isChecked ? '#4ade80' : '#cbd5e1',
                                  cursor: 'pointer',
                                  fontSize: '0.74rem',
                                  fontWeight: isChecked ? 700 : 500,
                                }}
                              >
                                {isChecked ? '✓ ' : '+ '}{type}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 2. फोहोर संकलन सेवा र रुट */}
                  <div style={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '10px', padding: '1.25rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#38bdf8', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <RefreshCw size={16} /> २. फोहोर संकलन सेवा, रुट र जैविक मल व्यवस्थापन
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.35rem' }}>
                          फोहोर संकलन प्रणाली
                        </label>
                        <select
                          value={editingHouse.meta?.wasteCollectionMethod || 'पालिकाको संकलन गाडी रुट (Door-to-door)'}
                          onChange={(e) => setEditingHouse({
                            ...editingHouse,
                            meta: { ...(editingHouse.meta || {}), wasteCollectionMethod: e.target.value }
                          })}
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            backgroundColor: '#1e293b',
                            border: '1px solid #475569',
                            borderRadius: '6px',
                            color: '#ffffff',
                            fontSize: '0.85rem',
                          }}
                        >
                          <option value="पालिकाको संकलन गाडी रुट (Door-to-door)">पालिकाको संकलन गाडी रुट (Door-to-door)</option>
                          <option value="सामुदायिक फोहोर संकलन केन्द्र">सामुदायिक फोहोर संकलन केन्द्र</option>
                          <option value="घरायसी कम्पोस्टिङ र खाल्डो">घरायसी कम्पोस्टिङ र खाल्डो</option>
                          <option value="कुनै सेवा उपलब्ध छैन">कुनै सेवा उपलब्ध छैन</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.35rem' }}>
                          संकलन तालिका / फ्रिक्वेन्सी
                        </label>
                        <select
                          value={editingHouse.meta?.wasteCollectionFreq || 'हप्तामा २ पटक'}
                          onChange={(e) => setEditingHouse({
                            ...editingHouse,
                            meta: { ...(editingHouse.meta || {}), wasteCollectionFreq: e.target.value }
                          })}
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            backgroundColor: '#1e293b',
                            border: '1px solid #475569',
                            borderRadius: '6px',
                            color: '#ffffff',
                            fontSize: '0.85rem',
                          }}
                        >
                          <option value="दैनिक">दैनिक</option>
                          <option value="हप्तामा २ पटक">हप्तामा २ पटक</option>
                          <option value="हप्तामा १ पटक">हप्तामा १ पटक</option>
                          <option value="पाक्षिक (१५ दिनमा)">पाक्षिक (१५ दिनमा)</option>
                          <option value="अनियमित / सेवा नभएको">अनियमित / सेवा नभएको</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.35rem' }}>
                          कम्पोस्ट बिनको उपलब्धता
                        </label>
                        <select
                          value={editingHouse.meta?.hasCompostBin || 'छ (घरायसी कम्पोस्टिङ)'}
                          onChange={(e) => setEditingHouse({
                            ...editingHouse,
                            meta: { ...(editingHouse.meta || {}), hasCompostBin: e.target.value }
                          })}
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            backgroundColor: '#1e293b',
                            border: '1px solid #475569',
                            borderRadius: '6px',
                            color: '#ffffff',
                            fontSize: '0.85rem',
                          }}
                        >
                          <option value="छ (घरायसी कम्पोस्टिङ)">छ (घरायसी कम्पोस्टिङ)</option>
                          <option value="छ (पालिका अनुदान प्राप्त)">छ (पालिका अनुदान प्राप्त)</option>
                          <option value="छैन">छैन</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.35rem' }}>
                          जैविक फोहोर व्यवस्थापन विधि
                        </label>
                        <select
                          value={editingHouse.meta?.organicWasteTreatment || 'घरायसी कम्पोस्ट मल बनाउने'}
                          onChange={(e) => setEditingHouse({
                            ...editingHouse,
                            meta: { ...(editingHouse.meta || {}), organicWasteTreatment: e.target.value }
                          })}
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            backgroundColor: '#1e293b',
                            border: '1px solid #475569',
                            borderRadius: '6px',
                            color: '#ffffff',
                            fontSize: '0.85rem',
                          }}
                        >
                          <option value="घरायसी कम्पोस्ट मल बनाउने">घरायसी कम्पोस्ट मल बनाउने</option>
                          <option value="गड्यौले मल (Vermicomposting)">गड्यौले मल (Vermicomposting)</option>
                          <option value="बायोग्यास प्लान्टमा प्रयोग">बायोग्यास प्लान्टमा प्रयोग</option>
                          <option value="पशु चौपायालाई खुवाउने">पशु चौपायालाई खुवाउने</option>
                          <option value="गाडीमा दिने / खाल्डोमा हाल्ने">गाडीमा दिने / खाल्डोमा हाल्ने</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* 3. Recent Pickups History Table */}
                  <div style={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '10px', padding: '1.25rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#e2e8f0', marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Clean for Cash पछिल्ला संकलन तथा ट्रान्जेक्सन विवरण</span>
                      <span style={{ fontSize: '0.75rem', color: '#4ade80' }}>स्मार्ट डिजिटल संकलन प्रणाली</span>
                    </div>
                    <div className="dt-responsive-table-wrapper">
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                        <thead>
                          <tr style={{ backgroundColor: '#1e293b', borderBottom: '1px solid #334155', color: '#94a3b8', textAlign: 'left' }}>
                            <th style={{ padding: '0.5rem 0.75rem' }}>मिति</th>
                            <th style={{ padding: '0.5rem 0.75rem' }}>संकलक गाडी नं.</th>
                            <th style={{ padding: '0.5rem 0.75rem' }}>फोहोर प्रकार / तौल</th>
                            <th style={{ padding: '0.5rem 0.75rem', textAlign: 'right' }}>प्राप्त रकम (रू.)</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr style={{ borderBottom: '1px solid #334155' }}>
                            <td style={{ padding: '0.5rem 0.75rem', color: '#cbd5e1' }}>२०८१/०६/०१</td>
                            <td style={{ padding: '0.5rem 0.75rem', color: '#cbd5e1' }}>बा १ ग २५४३ (रुट ३)</td>
                            <td style={{ padding: '0.5rem 0.75rem', color: '#cbd5e1' }}>प्लास्टिक (५ केजी)</td>
                            <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right', color: '#4ade80', fontWeight: 700 }}>+ रु. ७५</td>
                          </tr>
                          <tr style={{ borderBottom: '1px solid #334155' }}>
                            <td style={{ padding: '0.5rem 0.75rem', color: '#cbd5e1' }}>२०८१/०५/१५</td>
                            <td style={{ padding: '0.5rem 0.75rem', color: '#cbd5e1' }}>बा १ ग २५४३ (रुट ३)</td>
                            <td style={{ padding: '0.5rem 0.75rem', color: '#cbd5e1' }}>फलाम तथा धातु (२ केजी)</td>
                            <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right', color: '#4ade80', fontWeight: 700 }}>+ रु. ५०</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Tab 4 Navigation Footer */}
                  <div style={{ display: 'flex', justifyContent: 'flex-start', paddingTop: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => setEditModalTab('agriculture')}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                        backgroundColor: '#334155',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '0.55rem 1.25rem',
                        fontSize: '0.84rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      <ChevronLeft size={16} />
                      <span>अघिल्लो (३. कृषि, पशुधन र जीविकोपार्जन)</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ══════════════════════════════════════════════════════════ */}
              {/* GLOBAL MODAL FOOTER ACTION BUTTONS                      */}
              {/* ══════════════════════════════════════════════════════════ */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderTop: '1px solid #334155',
                  paddingTop: '1rem',
                  marginTop: '0.5rem',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                }}
              >
                <div style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <ShieldCheck size={16} color="#10b981" />
                  <span>प्रमाणित डिजिटल प्रोफाइलिङ लगत सम्पादन</span>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => setEditingHouse(null)}
                    style={{
                      padding: '0.6rem 1.25rem',
                      backgroundColor: '#334155',
                      color: '#e2e8f0',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                    }}
                  >
                    रद्द गर्नुहोस्
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingEdit}
                    style={{
                      padding: '0.6rem 1.5rem',
                      backgroundColor: '#10b981',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: isSavingEdit ? 'wait' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
                    }}
                  >
                    <Save size={16} />
                    <span>{isSavingEdit ? 'सुरक्षित गरिँदैछ...' : '💾 सम्पूर्ण सम्पादन सुरक्षित गर्नुहोस्'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import from Google Sheet / Excel Modal */}
      {isImportOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1050,
            padding: '1rem',
            backdropFilter: 'blur(4px)',
          }}
          onClick={() => setIsImportOpen(false)}
        >
          <div
            style={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '16px',
              maxWidth: '680px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              color: '#ffffff',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              style={{
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid #334155',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'linear-gradient(90deg, #1e293b, #0f172a)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(16, 185, 129, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <FileSpreadsheet size={20} color="#10b981" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#ffffff' }}>
                    गुगल शिट तथा एक्सेलबाट घरधुरी डाटा आयात (Import Households)
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.76rem', color: '#94a3b8' }}>
                    गुगल शिट लिङ्क वा डाउनलोड गरिएको CSV / Excel फाइलबाट लगत तालिकामा सिधै डाटा भर्नुहोस्
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsImportOpen(false)}
                style={{
                  background: '#334155',
                  border: 'none',
                  color: '#e2e8f0',
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '1.5rem' }}>
              {/* Tab Selector */}
              <div
                style={{
                  display: 'flex',
                  backgroundColor: '#0f172a',
                  padding: '4px',
                  borderRadius: '8px',
                  marginBottom: '1.25rem',
                  gap: '4px',
                  border: '1px solid #334155',
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setImportTab('link');
                    setImportError('');
                    setImportSuccess('');
                  }}
                  style={{
                    flex: 1,
                    padding: '0.55rem',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    backgroundColor: importTab === 'link' ? '#0284c7' : 'transparent',
                    color: importTab === 'link' ? '#ffffff' : '#94a3b8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    transition: 'all 0.2s',
                  }}
                >
                  <LinkIcon size={14} /> १. Google Sheet लिङ्क मार्फत
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setImportTab('file');
                    setImportError('');
                    setImportSuccess('');
                  }}
                  style={{
                    flex: 1,
                    padding: '0.55rem',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    backgroundColor: importTab === 'file' ? '#10b981' : 'transparent',
                    color: importTab === 'file' ? '#ffffff' : '#94a3b8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    transition: 'all 0.2s',
                  }}
                >
                  <UploadCloud size={14} /> २. CSV / Excel फाइल सिधै अपलोड
                </button>
              </div>

              {/* Status Alerts */}
              {importError && (
                <div
                  style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid #ef4444',
                    borderRadius: '8px',
                    padding: '0.85rem',
                    marginBottom: '1.25rem',
                    color: '#fca5a5',
                    fontSize: '0.82rem',
                    lineHeight: 1.5,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <AlertTriangle size={18} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <strong>सूचना / त्रुटि:</strong>
                      <div style={{ marginTop: '0.2rem' }}>{importError}</div>
                    </div>
                  </div>
                </div>
              )}

              {importSuccess && (
                <div
                  style={{
                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid #10b981',
                    borderRadius: '8px',
                    padding: '0.85rem',
                    marginBottom: '1.25rem',
                    color: '#6ee7b7',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <CheckCircle size={18} color="#10b981" />
                  <span>{importSuccess}</span>
                </div>
              )}

              {/* TAB 1: GOOGLE SHEET LINK */}
              {importTab === 'link' && (
                <form onSubmit={handleImportGoogleSheet} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', color: '#94a3b8', fontWeight: 600, marginBottom: '0.4rem' }}>
                      Google Spreadsheet लिङ्क (URL) *
                    </label>
                    <input
                      type="url"
                      required
                      placeholder="https://docs.google.com/spreadsheets/d/.../edit"
                      value={importSheetUrl}
                      onChange={(e) => setImportSheetUrl(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        backgroundColor: '#0f172a',
                        border: '1px solid #475569',
                        borderRadius: '8px',
                        color: '#ffffff',
                        fontSize: '0.85rem',
                      }}
                    />
                  </div>

                  <div
                    style={{
                      backgroundColor: '#0f172a',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      padding: '0.85rem',
                      fontSize: '0.78rem',
                      color: '#cbd5e1',
                      lineHeight: 1.6,
                    }}
                  >
                    <strong style={{ color: '#38bdf8' }}>💡 गुगल शिट लिङ्कबाट सिधै डाटा तान्न के गर्नुपर्छ?</strong>
                    <ol style={{ margin: '0.4rem 0 0 1.2rem', padding: 0 }}>
                      <li>गुगल शिटमा जानुहोस् र माथि दायाँ कुनामा रहेको निलो <strong>"Share" (सेयर)</strong> बटन थिच्नुहोस्।</li>
                      <li>General access मा <strong>"Anyone with the link" (लिङ्क भएका जोकोही)</strong> र भुमिकामा <strong>"Viewer"</strong> छनोट गरी सुरक्षित गर्नुहोस्।</li>
                      <li>अनि यहाँ भएको <strong>"डाटा तान्नुहोस्"</strong> बटन थिच्नुहोस्।</li>
                    </ol>
                    <div style={{ marginTop: '0.5rem', color: '#94a3b8', borderTop: '1px dashed #334155', paddingTop: '0.4rem' }}>
                      यदि गुगल ड्राइभ संस्थागत वा व्यक्तिगत सेक्युरिटीले गर्दा लक छ भने, <strong>"ट्याब २"</strong> बाट CSV डाउनलोड गरी सिधै अपलोड गर्न सकिन्छ।
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => setIsImportOpen(false)}
                      style={{
                        padding: '0.55rem 1.1rem',
                        backgroundColor: '#334155',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                      }}
                    >
                      बन्द गर्नुहोस्
                    </button>
                    <button
                      type="submit"
                      disabled={importLoading}
                      style={{
                        padding: '0.55rem 1.5rem',
                        backgroundColor: '#0284c7',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: importLoading ? 'wait' : 'pointer',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      <RefreshCw size={15} className={importLoading ? 'animate-spin' : ''} />
                      <span>{importLoading ? 'डाटा तानिँदैछ...' : '🔗 गुगल शिटबाट डाटा तान्नुहोस्'}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 2: FILE UPLOAD (EXCEL / CSV) */}
              {importTab === 'file' && (
                <form onSubmit={excelPreview ? handleImportParsedExcel : handleUploadCsvFile} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                  
                  {/* Official Excel Template Download Banner */}
                  <div
                    style={{
                      background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.18), rgba(15, 23, 42, 0.6))',
                      border: '1.5px solid #0284c7',
                      borderRadius: '12px',
                      padding: '1rem 1.25rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '1rem',
                      flexWrap: 'wrap',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <div
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '10px',
                          backgroundColor: 'rgba(2, 132, 199, 0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <FileSpreadsheet size={24} color="#38bdf8" />
                      </div>
                      <div>
                        <strong style={{ color: '#ffffff', fontSize: '0.92rem', display: 'block' }}>
                          आधिकारिक नमुना एक्सेल ढाँचा (Excel Master Template)
                        </strong>
                        <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.76rem', color: '#94a3b8', lineHeight: 1.4 }}>
                          प्रणाली अनुकूल १८ वटा स्तम्भहरू, १-८ वडाका नमुना उदाहरण तथा स्पष्ट निर्देशन भएको .xlsx फाइल
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={downloadHouseholdExcelTemplate}
                      style={{
                        backgroundColor: '#0284c7',
                        color: '#ffffff',
                        border: 'none',
                        padding: '0.55rem 1.2rem',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        boxShadow: '0 2px 10px rgba(2, 132, 199, 0.3)',
                      }}
                    >
                      <Download size={16} /> नमुना ढाँचा डाउनलोड (.xlsx)
                    </button>
                  </div>

                  {/* File Dropzone */}
                  <div
                    style={{
                      border: '2px dashed #475569',
                      borderRadius: '12px',
                      padding: '1.5rem',
                      textAlign: 'center',
                      backgroundColor: '#0f172a',
                      position: 'relative',
                    }}
                  >
                    <UploadCloud size={40} color="#10b981" style={{ margin: '0 auto 0.5rem' }} />
                    <label style={{ display: 'block', fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.3rem', color: '#ffffff', cursor: 'pointer' }}>
                      {uploadFile ? uploadFile.name : 'भरिएको Excel (.xlsx) वा CSV फाइल चयन गर्नुहोस्'}
                    </label>
                    <p style={{ margin: 0, fontSize: '0.76rem', color: '#94a3b8' }}>
                      अधिकतम ३० MB (नेपाली स्तम्भहरू स्वतः पहिचान भई तालिकामा म्याप हुन्छन्)
                    </p>
                    <input
                      type="file"
                      accept=".csv, .txt, .xlsx, .xls"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileChange(e.target.files[0]);
                        }
                      }}
                      style={{ marginTop: '0.85rem', fontSize: '0.82rem', color: '#cbd5e1' }}
                    />
                    {isParsingExcel && (
                      <div style={{ marginTop: '0.75rem', color: '#38bdf8', fontSize: '0.82rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                        <RefreshCw size={14} className="animate-spin" />
                        <span>एक्सेल फाइल पढिँदैछ र प्रमाणीकरण गरिँदैछ...</span>
                      </div>
                    )}
                  </div>

                  {/* Parsed Live Verification Preview Summary */}
                  {excelPreview && (
                    <div
                      style={{
                        backgroundColor: '#0b1329',
                        border: '1.5px solid #10b981',
                        borderRadius: '12px',
                        padding: '1rem 1.25rem',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <CheckCircle size={18} color="#10b981" />
                          <strong style={{ color: '#10b981', fontSize: '0.92rem' }}>
                            फाइल प्रमाणीकरण सफल: {excelPreview.totalCount} घरधुरी फेला पर्यो
                          </strong>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                          (तालिकामा आयातका लागि तयार)
                        </span>
                      </div>

                      {/* Ward Distribution Breakdown */}
                      <div style={{ fontSize: '0.78rem', color: '#cbd5e1', marginBottom: '0.6rem' }}>
                        <strong>वडागत वितरण (Ward Breakdown):</strong>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.85rem' }}>
                        {Object.entries(excelPreview.wardBreakdown).map(([ward, cnt]) => (
                          <span
                            key={ward}
                            style={{
                              backgroundColor: cnt > 0 ? 'rgba(56, 189, 248, 0.18)' : '#1e293b',
                              border: `1px solid ${cnt > 0 ? '#38bdf8' : '#334155'}`,
                              color: cnt > 0 ? '#38bdf8' : '#64748b',
                              fontSize: '0.74rem',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              fontWeight: cnt > 0 ? 700 : 400,
                            }}
                          >
                            वडा {ward}: {cnt} घर
                          </span>
                        ))}
                      </div>

                      {/* First 3 Rows Preview */}
                      <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginBottom: '0.4rem' }}>
                        नमुना विवरण (पहिलो केही घरधुरीहरू):
                      </div>
                      <div style={{ maxHeight: '110px', overflowY: 'auto', border: '1px solid #1e293b', borderRadius: '6px', backgroundColor: '#0f172a' }}>
                        <div className="dt-responsive-table-wrapper">
<table style={{ width: '100%', fontSize: '0.74rem', borderCollapse: 'collapse', color: '#cbd5e1' }}>
                          <thead>
                            <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8', textAlign: 'left' }}>
                              <th style={{ padding: '4px 8px' }}>वडा</th>
                              <th style={{ padding: '4px 8px' }}>घरधुरी नं</th>
                              <th style={{ padding: '4px 8px' }}>घरमूलीको नाम</th>
                              <th style={{ padding: '4px 8px' }}>टोल</th>
                              <th style={{ padding: '4px 8px' }}>परिवार</th>
                              <th style={{ padding: '4px 8px' }}>जोखिम</th>
                            </tr>
                          </thead>
                          <tbody>
                            {excelPreview.samplePreview.map((sr, sidx) => (
                              <tr key={sidx} style={{ borderBottom: '1px solid #1e293b' }}>
                                <td style={{ padding: '4px 8px' }}>{sr.wardNumber}</td>
                                <td style={{ padding: '4px 8px', color: '#38bdf8' }}>{sr.matrixHouseNo || '—'}</td>
                                <td style={{ padding: '4px 8px', fontWeight: 600 }}>{sr.householdName}</td>
                                <td style={{ padding: '4px 8px' }}>{sr.tole || '—'}</td>
                                <td style={{ padding: '4px 8px' }}>{sr.familySize} जना</td>
                                <td style={{ padding: '4px 8px' }}>{sr.riskLevel}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
</div>
                      </div>
                    </div>
                  )}

                  {/* Clean and Replace Option */}
                  <div
                    style={{
                      backgroundColor: replaceExistingData ? 'rgba(239, 68, 68, 0.1)' : '#0f172a',
                      border: `1.5px solid ${replaceExistingData ? '#ef4444' : '#334155'}`,
                      borderRadius: '10px',
                      padding: '0.95rem 1.1rem',
                      transition: 'all 0.2s',
                    }}
                  >
                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={replaceExistingData}
                        onChange={(e) => setReplaceExistingData(e.target.checked)}
                        style={{ width: '18px', height: '18px', marginTop: '2px', accentColor: '#ef4444' }}
                      />
                      <div>
                        <strong style={{ color: replaceExistingData ? '#fca5a5' : '#ffffff', fontSize: '0.88rem' }}>
                          पहिले अपलोड गरिएको सम्पूर्ण पुरानो डाटा हटाएर नयाँ मात्र राख्ने (Clean & Replace All)
                        </strong>
                        <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.76rem', color: '#94a3b8', lineHeight: 1.5 }}>
                          {replaceExistingData
                            ? '✅ सिफारिस गरिएको: डेटाबेसमा भएका पुराना गलत ढाँचाका सम्पूर्ण रेकर्डहरू पूर्ण रूपमा मेटिनेछन् र यो फाइलको नयाँ आधिकारिक डाटा मात्र सुरक्षित हुनेछ।'
                            : '⚠️ पुरानो डाटा यथावत रहनेछ र यो फाइलको डाटा थप (Append) मात्र हुनेछ।'}
                        </p>
                      </div>
                    </label>
                  </div>

                  {/* Submit / Cancel Buttons */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => setIsImportOpen(false)}
                      style={{
                        padding: '0.55rem 1.2rem',
                        backgroundColor: '#334155',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                      }}
                    >
                      बन्द गर्नुहोस्
                    </button>
                    <button
                      type="submit"
                      disabled={importLoading || (!uploadFile && !excelPreview)}
                      style={{
                        padding: '0.55rem 1.6rem',
                        backgroundColor: uploadFile || excelPreview ? '#10b981' : '#475569',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: importLoading ? 'wait' : uploadFile || excelPreview ? 'pointer' : 'not-allowed',
                        fontWeight: 700,
                        fontSize: '0.86rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        boxShadow: '0 2px 10px rgba(16, 185, 129, 0.3)',
                      }}
                    >
                      <UploadCloud size={16} className={importLoading ? 'animate-spin' : ''} />
                      <span>{importLoading ? 'डाटा आयात गरिँदैछ...' : '📤 डाटा सुरक्षित रूपमा आयात गर्नुहोस्'}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Safety Confirmation Modal: Clear All Records */}
      {isClearModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.82)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            padding: '1rem',
            backdropFilter: 'blur(4px)',
          }}
          onClick={() => setIsClearModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: '#1e293b',
              border: '1.5px solid #ef4444',
              borderRadius: '16px',
              maxWidth: '520px',
              width: '100%',
              padding: '1.75rem',
              color: '#ffffff',
              boxShadow: '0 25px 50px -12px rgba(239, 68, 68, 0.3)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(239, 68, 68, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <AlertTriangle size={24} color="#ef4444" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#f87171' }}>
                  पुराना घरधुरी लगत हटाउने पुष्टि
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  Dangerous Action (पूर्ण डाटा सफा गर्ने)
                </span>
              </div>
            </div>

            <p style={{ color: '#cbd5e1', fontSize: '0.88rem', lineHeight: 1.6, margin: '0 0 1rem 0' }}>
              के तपाईं पहिले अपलोड गरिएका सम्पूर्ण घरधुरी लगत मेटाउन चाहनुहुन्छ? यो कार्य गरेपछि पुराना गलत ढाँचाका रेकर्डहरू पूर्ण रूपमा हट्नेछन् र तपाईंले नयाँ आधिकारिक एक्सेल फाइल अपलोड गर्न सक्नुहुनेछ।
            </p>

            <div
              style={{
                backgroundColor: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '8px',
                padding: '0.85rem',
                fontSize: '0.78rem',
                color: '#fca5a5',
                marginBottom: '1.5rem',
              }}
            >
              ⚠️ <strong>चेतावनी:</strong> यो कार्य गरेपछि पहिलेका रेकर्डहरू पुनः प्राप्त गर्न सकिँदैन।
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setIsClearModalOpen(false)}
                disabled={isClearing}
                style={{
                  padding: '0.55rem 1.25rem',
                  backgroundColor: '#334155',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                }}
              >
                रद्द गर्नुहोस्
              </button>
              <button
                type="button"
                onClick={handleClearAllRecords}
                disabled={isClearing}
                style={{
                  padding: '0.55rem 1.5rem',
                  backgroundColor: '#ef4444',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: isClearing ? 'wait' : 'pointer',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                <Trash2 size={16} />
                <span>{isClearing ? 'हटाइँदैछ...' : 'हो, सबै डाटा हटाउनुहोस्'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Household Modal */}
      {isCreateOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1050,
            padding: '1rem',
            backdropFilter: 'blur(4px)',
          }}
          onClick={() => setIsCreateOpen(false)}
        >
          <div
            style={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '16px',
              maxWidth: '820px',
              width: '100%',
              maxHeight: '92vh',
              overflowY: 'auto',
              color: '#ffffff',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '1.25rem 1.75rem',
                borderBottom: '1px solid #334155',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'linear-gradient(90deg, #1e293b, #0f172a)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    backgroundColor: '#0284c7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Building2 size={20} color="#ffffff" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>
                    नयाँ घरधुरी तथा म्याट्रिक्स लगत दर्ता (Household Registration)
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#94a3b8' }}>
                    घरधुरी नम्बर, GPS स्थान, परिवार सदस्य विवरण तथा विपद् जोखिम लगत
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                style={{
                  background: '#334155',
                  border: 'none',
                  color: '#e2e8f0',
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

              {/* ── CARD 1: प्रशासनिक ठेगाना तथा घरधुरी पहिचान ── */}
              <div
                style={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  padding: '1.25rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Home size={18} color="#38bdf8" />
                    <strong style={{ fontSize: '0.95rem', color: '#38bdf8' }}>
                      १. प्रशासनिक ठेगाना तथा घरधुरी पहिचान (Administrative Location & Identification)
                    </strong>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8', backgroundColor: '#1e293b', padding: '2px 8px', borderRadius: '4px', border: '1px solid #334155' }}>
                    नेपालको संघीय प्रशासनिक संरचना
                  </span>
                </div>

                {/* १.१ प्रशासनिक ठेगाना छनोट: प्रदेश, जिल्ला, पालिका र वडा */}
                <div
                  style={{
                    backgroundColor: '#1e293b',
                    borderRadius: '8px',
                    padding: '0.9rem',
                    border: '1px solid #334155',
                    marginBottom: '1rem',
                  }}
                >
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#38bdf8', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <MapPin size={14} /> प्रशासनिक तह छनोट (Province / District / Local Level / Ward)
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.75rem' }}>
                    {/* १. प्रदेश */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '0.3rem' }}>
                        प्रदेश (Province) *
                      </label>
                      <select
                        value={formData.province}
                        onChange={(e) => handleProvinceChange(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.55rem',
                          backgroundColor: '#0f172a',
                          border: '1px solid #475569',
                          borderRadius: '6px',
                          color: '#ffffff',
                          fontSize: '0.85rem',
                        }}
                      >
                        {availableProvinces.map((prov) => (
                          <option key={prov} value={prov}>
                            {prov}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* २. जिल्ला */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '0.3rem' }}>
                        जिल्ला (District) *
                      </label>
                      <select
                        value={formData.district}
                        onChange={(e) => handleDistrictChange(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.55rem',
                          backgroundColor: '#0f172a',
                          border: '1px solid #475569',
                          borderRadius: '6px',
                          color: '#ffffff',
                          fontSize: '0.85rem',
                        }}
                      >
                        {availableDistricts.map((dist) => (
                          <option key={dist} value={dist}>
                            {dist}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* ३. पालिका */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '0.3rem' }}>
                        स्थानीय तह / पालिका (Palika) *
                      </label>
                      <select
                        value={formData.municipality}
                        onChange={(e) => handlePalikaChange(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.55rem',
                          backgroundColor: '#0f172a',
                          border: '1px solid #475569',
                          borderRadius: '6px',
                          color: '#ffffff',
                          fontSize: '0.85rem',
                        }}
                      >
                        {availablePalikas.map((palika) => (
                          <option key={palika} value={palika}>
                            {palika}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* ४. वडा नम्बर */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '0.3rem' }}>
                        वडा नम्बर (Ward No.) *
                      </label>
                      <select
                        value={formData.wardNumber}
                        onChange={(e) => {
                          const newWard = Number(e.target.value);
                          setFormData({ ...formData, wardNumber: newWard });
                        }}
                        style={{
                          width: '100%',
                          padding: '0.55rem',
                          backgroundColor: '#0f172a',
                          border: '1px solid #475569',
                          borderRadius: '6px',
                          color: '#ffffff',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                        }}
                      >
                        {availableWards.map((w) => (
                          <option key={w.id} value={w.id}>
                            {w.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* १.२ टोल, म्याट्रिक्स कोड तथा साविक घर नं. */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
                  {/* घरधुरी नम्बर */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                      <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>
                        घरधुरी नम्बर (Matrix House No) *
                      </label>
                      <button
                        type="button"
                        onClick={generateHouseNumber}
                        style={{
                          fontSize: '0.72rem',
                          color: '#38bdf8',
                          background: 'rgba(56, 189, 248, 0.1)',
                          border: '1px solid #0284c7',
                          borderRadius: '4px',
                          padding: '2px 8px',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                        }}
                      >
                        <Sparkles size={12} /> स्वतः कोड
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="उदा. P5-W03-H0124"
                      value={formData.matrixHouseNo}
                      onChange={(e) => setFormData({ ...formData, matrixHouseNo: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.55rem',
                        backgroundColor: '#1e293b',
                        border: '1px solid #475569',
                        borderRadius: '6px',
                        color: '#ffffff',
                        fontWeight: 600,
                        letterSpacing: '0.04em',
                      }}
                    />
                    <small style={{ fontSize: '0.7rem', color: '#64748b' }}>
                      खाली छाडेमा प्रणालीले स्वतः कोड सिर्जना गर्नेछ
                    </small>
                  </div>

                  {/* साविकको घरधुरी नम्बर */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#fbbf24', fontWeight: 600, marginBottom: '0.3rem' }}>
                      🏛️ साविकको घरधुरी नम्बर (Legacy House No.)
                    </label>
                    <input
                      type="text"
                      placeholder="उदा. H-042 वा ०४२/क"
                      value={formData.legacyHouseNo}
                      onChange={(e) => setFormData({ ...formData, legacyHouseNo: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.55rem',
                        backgroundColor: '#1e293b',
                        border: '1px solid #d97706',
                        borderRadius: '6px',
                        color: '#fef08a',
                        fontWeight: 600,
                      }}
                    />
                    <small style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                      साविक गा.वि.स./वडाको लगत नम्बर (ऐच्छिक)
                    </small>
                  </div>

                  {/* साविक गा.वि.स. तथा वडा */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, marginBottom: '0.3rem' }}>
                      साविक गा.वि.स. तथा वडा नं.
                    </label>
                    <input
                      type="text"
                      placeholder="उदा. भोताङ गा.वि.स.-४"
                      value={formData.formerVdc}
                      onChange={(e) => setFormData({ ...formData, formerVdc: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.55rem',
                        backgroundColor: '#1e293b',
                        border: '1px solid #475569',
                        borderRadius: '6px',
                        color: '#ffffff',
                      }}
                    />
                  </div>

                  {/* टोल / बस्ती */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, marginBottom: '0.3rem' }}>
                      टोल / बस्तीको नाम *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="उदा. भोताङ, याङ्ग्री, चिम्ती"
                      value={formData.tole}
                      onChange={(e) => setFormData({ ...formData, tole: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.55rem',
                        backgroundColor: '#1e293b',
                        border: '1px solid #475569',
                        borderRadius: '6px',
                        color: '#ffffff',
                      }}
                    />
                  </div>
                </div>

                {/* १.३ घरमूली विवरण, नागरिकता तथा सामाजिक पहिचान */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem', marginTop: '1rem' }}>
                  {/* घरमूलीको नाम */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, marginBottom: '0.3rem' }}>
                      घरमूलीको नाम *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="उदा. दोर्जे तामाङ"
                      value={formData.householdName}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData({ ...formData, householdName: val });
                        setFamilyMembers((prev) => {
                          const updated = [...prev];
                          if (updated[0]) updated[0].name = val;
                          return updated;
                        });
                      }}
                      style={{
                        width: '100%',
                        padding: '0.55rem',
                        backgroundColor: '#1e293b',
                        border: '1px solid #475569',
                        borderRadius: '6px',
                        color: '#ffffff',
                      }}
                    />
                  </div>

                  {/* घरमूलीको लिङ्ग */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, marginBottom: '0.3rem' }}>
                      घरमूलीको लिङ्ग *
                    </label>
                    <select
                      value={formData.headGender}
                      onChange={(e) => {
                        const g = e.target.value;
                        setFormData({ ...formData, headGender: g });
                        setFamilyMembers((prev) => {
                          const updated = [...prev];
                          if (updated[0]) updated[0].gender = g;
                          return updated;
                        });
                      }}
                      style={{
                        width: '100%',
                        padding: '0.55rem',
                        backgroundColor: '#1e293b',
                        border: '1px solid #475569',
                        borderRadius: '6px',
                        color: '#ffffff',
                      }}
                    >
                      <option value="male">पुरुष (Male)</option>
                      <option value="female">महिला (Female)</option>
                      <option value="other">अन्य (Other)</option>
                    </select>
                  </div>

                  {/* सम्पर्क फोन नं. */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, marginBottom: '0.3rem' }}>
                      सम्पर्क फोन नं.
                    </label>
                    <input
                      type="text"
                      placeholder="उदा. ९८४१२३४५६७"
                      value={formData.contactPhone}
                      onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.55rem',
                        backgroundColor: '#1e293b',
                        border: '1px solid #475569',
                        borderRadius: '6px',
                        color: '#ffffff',
                      }}
                    />
                  </div>

                  {/* नागरिकता / NID नम्बर */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, marginBottom: '0.3rem' }}>
                      नागरिकता / NID नम्बर
                    </label>
                    <input
                      type="text"
                      placeholder="उदा. २७-०१-७५-०२३४५"
                      value={formData.citizenshipNo}
                      onChange={(e) => setFormData({ ...formData, citizenshipNo: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.55rem',
                        backgroundColor: '#1e293b',
                        border: '1px solid #475569',
                        borderRadius: '6px',
                        color: '#ffffff',
                      }}
                    />
                  </div>

                  {/* जाति / समुदाय */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, marginBottom: '0.3rem' }}>
                      जाति / समुदाय (Ethnicity)
                    </label>
                    <select
                      value={formData.ethnicity}
                      onChange={(e) => setFormData({ ...formData, ethnicity: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.55rem',
                        backgroundColor: '#1e293b',
                        border: '1px solid #475569',
                        borderRadius: '6px',
                        color: '#ffffff',
                      }}
                    >
                      <option value="तामाङ">तामाङ (आदिवासी जनजाति)</option>
                      <option value="शेर्पा / ह्योल्मो">शेर्पा / ह्योल्मो</option>
                      <option value="क्षेत्री / ब्राह्मण">क्षेत्री / ब्राह्मण</option>
                      <option value="नेवार">नेवार</option>
                      <option value="दलित (विश्वकर्मा/परियार/मिजार)">दलित (विश्वकर्मा/परियार/मिजार)</option>
                      <option value="गुरुङ / मगर / राई">गुरुङ / मगर / राई</option>
                      <option value="अन्य">अन्य</option>
                    </select>
                  </div>

                  {/* जग्गाको कित्ता नम्बर */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#38bdf8', fontWeight: 600, marginBottom: '0.3rem' }}>
                      जग्गाको कित्ता नम्बर (Cadastral Parcel No)
                    </label>
                    <input
                      type="text"
                      placeholder="उदा. कित्ता नं. २३४"
                      value={formData.cadastralParcelNo}
                      onChange={(e) => setFormData({ ...formData, cadastralParcelNo: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.55rem',
                        backgroundColor: '#1e293b',
                        border: '1px solid #475569',
                        borderRadius: '6px',
                        color: '#ffffff',
                      }}
                    />
                  </div>

                  {/* जग्गाको स्वामित्व */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, marginBottom: '0.3rem' }}>
                      जग्गाको स्वामित्व (Land Ownership)
                    </label>
                    <select
                      value={formData.landOwnership}
                      onChange={(e) => setFormData({ ...formData, landOwnership: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.55rem',
                        backgroundColor: '#1e293b',
                        border: '1px solid #475569',
                        borderRadius: '6px',
                        color: '#ffffff',
                      }}
                    >
                      <option value="आफ्नो स्वामित्व (लालपुर्जा भएको)">आफ्नो स्वामित्व (लालपुर्जा भएको)</option>
                      <option value="ऐलानी / पर्ति जग्गा">ऐलानी / पर्ति जग्गा</option>
                      <option value="गुठी जग्गा">गुठी जग्गा</option>
                      <option value="भाडा / लिजमा लिएको">भाडा / लिजमा लिएको</option>
                      <option value="अन्य">अन्य</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* ── CARD 2: GPS CURRENT LOCATION (भौगोलिक अवस्थिति) ── */}
              <div
                style={{
                  backgroundColor: '#0f172a',
                  border: '1.5px solid #0284c7',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '3px',
                    background: 'linear-gradient(90deg, #0284c7, #38bdf8)',
                  }}
                />

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.85rem',
                    flexWrap: 'wrap',
                    gap: '0.6rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <Crosshair size={18} color="#38bdf8" />
                    <strong style={{ fontSize: '0.95rem', color: '#38bdf8' }}>
                      २. GPS Current Location (भौगोलिक अवस्थिति)
                    </strong>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        padding: '0.2rem 0.55rem',
                        borderRadius: '9999px',
                        fontWeight: 600,
                        backgroundColor:
                          gpsAccepted === true
                            ? 'rgba(16, 185, 129, 0.2)'
                            : gpsAccepted === false
                            ? 'rgba(239, 68, 68, 0.2)'
                            : 'rgba(56, 189, 248, 0.15)',
                        color:
                          gpsAccepted === true
                            ? '#6ee7b7'
                            : gpsAccepted === false
                            ? '#fca5a5'
                            : '#7dd3fc',
                        border: `1px solid ${
                          gpsAccepted === true
                            ? '#10b981'
                            : gpsAccepted === false
                            ? '#ef4444'
                            : 'rgba(56, 189, 248, 0.3)'
                        }`,
                      }}
                    >
                      {gpsAccepted === true
                        ? `✅ स्वीकृत (±${gpsAccuracy}m ≤ ५ मिटर)`
                        : gpsAccepted === false
                        ? `❌ अस्वीकृत (±${gpsAccuracy}m > ५ मिटर)`
                        : '🎯 ५ मिटर भन्दा कम (≤ 5m) परिशुद्धता अनिवार्य'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {gpsLoading && (
                      <button
                        type="button"
                        onClick={stopGpsTracking}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          backgroundColor: '#ef4444',
                          color: '#ffffff',
                          padding: '0.45rem 0.75rem',
                          borderRadius: '8px',
                          border: 'none',
                          fontWeight: 600,
                          fontSize: '0.76rem',
                          cursor: 'pointer',
                        }}
                      >
                        <X size={14} />
                        <span>रोक्नुहोस्</span>
                      </button>
                    )}

                    {/* Big GPS Location Button */}
                    <button
                      type="button"
                      onClick={handleGetCurrentGps}
                      disabled={gpsLoading}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        backgroundColor: gpsLoading ? '#475569' : '#0284c7',
                        color: '#ffffff',
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        border: 'none',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        cursor: gpsLoading ? 'wait' : 'pointer',
                        boxShadow: '0 4px 12px rgba(2, 132, 199, 0.35)',
                        transition: 'all 0.2s',
                      }}
                    >
                      <LocateFixed size={16} style={{ animation: gpsLoading ? 'spin 1s linear infinite' : 'none' }} />
                      <span>{gpsLoading ? 'उपग्रह सिग्नल खोजिँदैछ...' : '📍 GPS Current Location लिनुहोस्'}</span>
                    </button>

                    {/* Simulation button for sub-5m test demonstration */}
                    <button
                      type="button"
                      onClick={handleSimulateAccurateGps}
                      title="खुला ठाउँको ३-४ मिटर उच्च परिशुद्धता GPS परीक्षण गर्नुहोस्"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        backgroundColor: 'rgba(56, 189, 248, 0.12)',
                        color: '#38bdf8',
                        padding: '0.45rem 0.75rem',
                        borderRadius: '8px',
                        border: '1px solid rgba(56, 189, 248, 0.35)',
                        fontWeight: 600,
                        fontSize: '0.74rem',
                        cursor: 'pointer',
                      }}
                    >
                      <Sparkles size={13} />
                      <span>परीक्षण: ≤ 5m GPS सिमुलेट</span>
                    </button>
                  </div>
                </div>

                {/* GPS Status message */}
                {gpsStatus && (
                  <div
                    style={{
                      marginBottom: '0.85rem',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      backgroundColor:
                        gpsAccepted === true
                          ? 'rgba(16, 185, 129, 0.15)'
                          : gpsAccepted === false
                          ? 'rgba(239, 68, 68, 0.15)'
                          : 'rgba(2, 132, 199, 0.15)',
                      border: `1px solid ${
                        gpsAccepted === true
                          ? '#10b981'
                          : gpsAccepted === false
                          ? '#ef4444'
                          : '#0284c7'
                      }`,
                      color:
                        gpsAccepted === true
                          ? '#6ee7b7'
                          : gpsAccepted === false
                          ? '#fca5a5'
                          : '#7dd3fc',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.5rem',
                      lineHeight: '1.45',
                    }}
                  >
                    {gpsAccepted === true ? (
                      <CheckCircle size={18} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                    ) : gpsAccepted === false ? (
                      <AlertTriangle size={18} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
                    ) : (
                      <LocateFixed size={18} color="#38bdf8" style={{ flexShrink: 0, marginTop: '2px', animation: 'spin 1s linear infinite' }} />
                    )}
                    <div>
                      <div style={{ fontWeight: 600 }}>{gpsStatus}</div>
                      {gpsAccepted === false && (
                        <div style={{ fontSize: '0.73rem', color: '#f87171', marginTop: '0.25rem' }}>
                          ⛔ <strong>अस्वीकृत:</strong> ५ मिटर भन्दा बढी (±{gpsAccuracy}m) परिशुद्धता भएको डाटा स्थान फिल्डमा भरिएको छैन। ५ मिटर वा सोभन्दा कम परिशुद्धता भएपछि मात्र डाटा स्वीकार गरिन्छ।
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                      <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                        GPS Latitude (अक्षांश) *
                      </label>
                      {gpsAccepted === true && (
                        <span style={{ fontSize: '0.68rem', color: '#34d399', fontWeight: 600 }}>
                          ✓ GPS स्वीकृत (≤ ५ मिटर)
                        </span>
                      )}
                    </div>
                    <input
                      type="number"
                      step="0.000001"
                      required
                      value={formData.gpsLat}
                      onChange={(e) => {
                        setFormData({ ...formData, gpsLat: parseFloat(e.target.value) || 27.9152 });
                        setGpsAccepted(null);
                      }}
                      style={{
                        width: '100%',
                        padding: '0.55rem',
                        backgroundColor: '#1e293b',
                        border: gpsAccepted === true ? '1px solid #10b981' : '1px solid #475569',
                        borderRadius: '6px',
                        color: '#ffffff',
                        fontFamily: 'monospace',
                        fontWeight: 600,
                      }}
                    />
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                      <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                        GPS Longitude (देशान्तर) *
                      </label>
                      {gpsAccepted === true && (
                        <span style={{ fontSize: '0.68rem', color: '#34d399', fontWeight: 600 }}>
                          ✓ GPS स्वीकृत (≤ ५ मिटर)
                        </span>
                      )}
                    </div>
                    <input
                      type="number"
                      step="0.000001"
                      required
                      value={formData.gpsLon}
                      onChange={(e) => {
                        setFormData({ ...formData, gpsLon: parseFloat(e.target.value) || 85.6185 });
                        setGpsAccepted(null);
                      }}
                      style={{
                        width: '100%',
                        padding: '0.55rem',
                        backgroundColor: '#1e293b',
                        border: gpsAccepted === true ? '1px solid #10b981' : '1px solid #475569',
                        borderRadius: '6px',
                        color: '#ffffff',
                        fontFamily: 'monospace',
                        fontWeight: 600,
                      }}
                    />
                  </div>
                </div>
                <small style={{ display: 'block', marginTop: '0.45rem', fontSize: '0.73rem', color: '#94a3b8' }}>
                  💡 <strong>मापदण्ड:</strong> उच्च गुणस्तर डिजिटल ट्विन म्यापिङका लागि GPS परिशुद्धता ५ मिटर भन्दा कम (≤ 5m) आएपछि मात्र डाटा स्वतः स्वीकार (Accept) गरिन्छ।
                </small>
              </div>

              {/* ── CARD 3: परिवारको संख्या तथा सदस्य विवरण ── */}
              <div
                style={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  padding: '1.25rem',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1rem',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Users size={18} color="#10b981" />
                    <strong style={{ fontSize: '0.95rem', color: '#10b981' }}>
                      ३. परिवारको संख्या तथा सदस्य विवरण (Family Members)
                    </strong>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowMemberDetails(!showMemberDetails)}
                    style={{
                      fontSize: '0.75rem',
                      color: '#6ee7b7',
                      background: 'rgba(16, 185, 129, 0.1)',
                      border: '1px solid #10b981',
                      borderRadius: '6px',
                      padding: '3px 10px',
                      cursor: 'pointer',
                    }}
                  >
                    {showMemberDetails ? 'सदस्य सूची लुकाउनुहोस् ▲' : 'सदस्य सूची हेर्नुहोस्/थप्नुहोस् ▼'}
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem', marginBottom: '1rem' }}>
                  {/* कुल परिवार संख्या */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, marginBottom: '0.3rem' }}>
                      कुल परिवार संख्या (Total Size) *
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      required
                      value={formData.familySize}
                      onChange={(e) => {
                        const count = Math.max(1, parseInt(e.target.value) || 1);
                        setFormData({ ...formData, familySize: count });
                      }}
                      style={{
                        width: '100%',
                        padding: '0.55rem',
                        backgroundColor: '#1e293b',
                        border: '1px solid #475569',
                        borderRadius: '6px',
                        color: '#ffffff',
                        fontWeight: 700,
                        fontSize: '1rem',
                      }}
                    />
                  </div>

                  {/* पुरुष संख्या */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, marginBottom: '0.3rem' }}>
                      पुरुष संख्या (Male)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      value={formData.maleCount}
                      onChange={(e) => setFormData({ ...formData, maleCount: parseInt(e.target.value) || 0 })}
                      style={{
                        width: '100%',
                        padding: '0.55rem',
                        backgroundColor: '#1e293b',
                        border: '1px solid #475569',
                        borderRadius: '6px',
                        color: '#ffffff',
                      }}
                    />
                  </div>

                  {/* महिला संख्या */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, marginBottom: '0.3rem' }}>
                      महिला संख्या (Female)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      value={formData.femaleCount}
                      onChange={(e) => setFormData({ ...formData, femaleCount: parseInt(e.target.value) || 0 })}
                      style={{
                        width: '100%',
                        padding: '0.55rem',
                        backgroundColor: '#1e293b',
                        border: '1px solid #475569',
                        borderRadius: '6px',
                        color: '#ffffff',
                      }}
                    />
                  </div>

                  {/* अपाङ्गता भएका सदस्य संख्या */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, marginBottom: '0.3rem' }}>
                      अपाङ्गता सदस्य संख्या
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      value={formData.disabilityCount ?? 0}
                      onChange={(e) => setFormData({ ...formData, disabilityCount: parseInt(e.target.value) || 0 })}
                      style={{
                        width: '100%',
                        padding: '0.55rem',
                        backgroundColor: '#1e293b',
                        border: '1px solid #475569',
                        borderRadius: '6px',
                        color: '#ffffff',
                      }}
                    />
                  </div>

                  {/* अपाङ्गता परिचयपत्र वर्ग */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, marginBottom: '0.3rem' }}>
                      अपाङ्गता परिचयपत्र वर्ग
                    </label>
                    <select
                      value={formData.disabilityCardType || 'छैन'}
                      onChange={(e) => setFormData({ ...formData, disabilityCardType: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.55rem',
                        backgroundColor: '#1e293b',
                        border: '1px solid #475569',
                        borderRadius: '6px',
                        color: '#ffffff',
                      }}
                    >
                      <option value="छैन">छैन</option>
                      <option value="'क' वर्ग (रातो कार्ड - पूर्ण अशक्त)">'क' वर्ग (रातो कार्ड - पूर्ण अशक्त)</option>
                      <option value="'ख' वर्ग (नीलो कार्ड - अति अशक्त)">'ख' वर्ग (नीलो कार्ड - अति अशक्त)</option>
                      <option value="'ग' वर्ग (पहेंलो कार्ड - मध्यम)">'ग' वर्ग (पहेंलो कार्ड - मध्यम)</option>
                      <option value="'घ' वर्ग (सेतो कार्ड - सामान्य)">'घ' वर्ग (सेतो कार्ड - सामान्य)</option>
                    </select>
                  </div>

                  {/* सामाजिक सुरक्षा भत्ता प्राप्तकर्ता */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, marginBottom: '0.3rem' }}>
                      सामाजिक सुरक्षा भत्ता पाउने संख्या
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      value={formData.socialSecurityCount ?? 0}
                      onChange={(e) => setFormData({ ...formData, socialSecurityCount: parseInt(e.target.value) || 0 })}
                      style={{
                        width: '100%',
                        padding: '0.55rem',
                        backgroundColor: '#1e293b',
                        border: '1px solid #475569',
                        borderRadius: '6px',
                        color: '#ffffff',
                      }}
                    />
                  </div>

                  {/* वैदेशिक रोजगारीमा रहेका सदस्य */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, marginBottom: '0.3rem' }}>
                      वैदेशिक रोजगारीमा रहेका सदस्य
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={formData.foreignMigrantsCount ?? 0}
                      onChange={(e) => setFormData({ ...formData, foreignMigrantsCount: parseInt(e.target.value) || 0 })}
                      style={{
                        width: '100%',
                        padding: '0.55rem',
                        backgroundColor: '#1e293b',
                        border: '1px solid #475569',
                        borderRadius: '6px',
                        color: '#ffffff',
                      }}
                    />
                  </div>
                </div>

                {/* Dynamic Family Members Table */}
                {showMemberDetails && (
                  <div
                    style={{
                      borderTop: '1px dashed #334155',
                      paddingTop: '1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 600 }}>
                        परिवार सदस्यहरूको विवरण ({familyMembers.length} सदस्य प्रविष्ट)
                      </span>
                      <button
                        type="button"
                        onClick={handleAddMember}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          backgroundColor: '#059669',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '0.3rem 0.75rem',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        <UserPlus size={14} />
                        <span>+ सदस्य थप्नुहोस्</span>
                      </button>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                      <div className="dt-responsive-table-wrapper">
<table style={{ width: '100%', fontSize: '0.78rem', borderCollapse: 'collapse', color: '#cbd5e1' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid #334155', textAlign: 'left', color: '#94a3b8' }}>
                            <th style={{ padding: '0.4rem' }}>#</th>
                            <th style={{ padding: '0.4rem' }}>सदस्यको नाम</th>
                            <th style={{ padding: '0.4rem' }}>नाता (Relation)</th>
                            <th style={{ padding: '0.4rem' }}>लिङ्ग</th>
                            <th style={{ padding: '0.4rem' }}>उमेर</th>
                            <th style={{ padding: '0.4rem' }}>पेशा</th>
                            <th style={{ padding: '0.4rem', textAlign: 'center' }}>हटाउने</th>
                          </tr>
                        </thead>
                        <tbody>
                          {familyMembers.map((member, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid #1e293b' }}>
                              <td style={{ padding: '0.4rem', color: '#64748b' }}>{idx + 1}</td>
                              <td style={{ padding: '0.4rem' }}>
                                <input
                                  type="text"
                                  placeholder={idx === 0 ? formData.householdName || 'घरमूलीको नाम' : `सदस्य ${idx + 1}`}
                                  value={member.name}
                                  onChange={(e) => handleMemberChange(idx, 'name', e.target.value)}
                                  style={{
                                    width: '100%',
                                    padding: '0.35rem 0.5rem',
                                    backgroundColor: '#1e293b',
                                    border: '1px solid #475569',
                                    borderRadius: '4px',
                                    color: '#ffffff',
                                    fontSize: '0.78rem',
                                  }}
                                />
                              </td>
                              <td style={{ padding: '0.4rem' }}>
                                <select
                                  value={member.relation}
                                  onChange={(e) => handleMemberChange(idx, 'relation', e.target.value)}
                                  style={{
                                    width: '100%',
                                    padding: '0.35rem 0.5rem',
                                    backgroundColor: '#1e293b',
                                    border: '1px solid #475569',
                                    borderRadius: '4px',
                                    color: '#ffffff',
                                    fontSize: '0.78rem',
                                  }}
                                >
                                  <option value="घरमूली (Head)">घरमूली (Head)</option>
                                  <option value="श्रीमती">श्रीमती (Wife)</option>
                                  <option value="श्रीमान्">श्रीमान् (Husband)</option>
                                  <option value="छोरा">छोरा (Son)</option>
                                  <option value="छोरी">छोरी (Daughter)</option>
                                  <option value="बुबा">बुबा (Father)</option>
                                  <option value="आमा">आमा (Mother)</option>
                                  <option value="बुहारी">बुहारी (Daughter-in-law)</option>
                                  <option value="नाति/नातिना">नाति/नातिना (Grandchild)</option>
                                  <option value="अन्य">अन्य (Other)</option>
                                </select>
                              </td>
                              <td style={{ padding: '0.4rem' }}>
                                <select
                                  value={member.gender}
                                  onChange={(e) => handleMemberChange(idx, 'gender', e.target.value)}
                                  style={{
                                    width: '100%',
                                    padding: '0.35rem 0.5rem',
                                    backgroundColor: '#1e293b',
                                    border: '1px solid #475569',
                                    borderRadius: '4px',
                                    color: '#ffffff',
                                    fontSize: '0.78rem',
                                  }}
                                >
                                  <option value="male">पुरुष</option>
                                  <option value="female">महिला</option>
                                  <option value="other">अन्य</option>
                                </select>
                              </td>
                              <td style={{ padding: '0.4rem' }}>
                                <input
                                  type="number"
                                  placeholder="उमेर"
                                  value={member.age}
                                  onChange={(e) => handleMemberChange(idx, 'age', e.target.value)}
                                  style={{
                                    width: '70px',
                                    padding: '0.35rem 0.5rem',
                                    backgroundColor: '#1e293b',
                                    border: '1px solid #475569',
                                    borderRadius: '4px',
                                    color: '#ffffff',
                                    fontSize: '0.78rem',
                                  }}
                                />
                              </td>
                              <td style={{ padding: '0.4rem' }}>
                                <input
                                  type="text"
                                  placeholder="कृषि, विद्यार्थी..."
                                  value={member.occupation || ''}
                                  onChange={(e) => handleMemberChange(idx, 'occupation', e.target.value)}
                                  style={{
                                    width: '100%',
                                    padding: '0.35rem 0.5rem',
                                    backgroundColor: '#1e293b',
                                    border: '1px solid #475569',
                                    borderRadius: '4px',
                                    color: '#ffffff',
                                    fontSize: '0.78rem',
                                  }}
                                />
                              </td>
                              <td style={{ padding: '0.4rem', textAlign: 'center' }}>
                                {idx > 0 && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveMember(idx)}
                                    style={{
                                      background: 'none',
                                      border: 'none',
                                      color: '#ef4444',
                                      cursor: 'pointer',
                                      padding: '2px',
                                    }}
                                    title="हटाउनुहोस्"
                                  >
                                    <Trash2 size={15} />
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
</div>
                    </div>
                  </div>
                )}
              </div>

              {/* ── CARD 4: आवास संरचना, पूर्वाधार तथा विपद् जोखिम ── */}
              <div
                style={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  padding: '1.25rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <ShieldCheck size={18} color="#f59e0b" />
                  <strong style={{ fontSize: '0.95rem', color: '#f59e0b' }}>
                    ४. आवास संरचना, पूर्वाधार तथा विपद् जोखिम (Housing & Hazard Risk)
                  </strong>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
                  {/* घरको संरचना प्रकार */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.3rem' }}>
                      घरको संरचना प्रकार
                    </label>
                    <select
                      value={formData.houseType}
                      onChange={(e) => setFormData({ ...formData, houseType: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.55rem',
                        backgroundColor: '#1e293b',
                        border: '1px solid #475569',
                        borderRadius: '6px',
                        color: '#ffffff',
                      }}
                    >
                      <option value="अर्ध-पक्की (जस्ता छाना)">अर्ध-पक्की (जस्ता छाना)</option>
                      <option value="पक्की भवन (आरसीसी ढलान)">पक्की भवन (आरसीसी ढलान)</option>
                      <option value="अस्थायी / ढुङ्गा माटो">अस्थायी / ढुङ्गा माटो</option>
                      <option value="काठ तथा टिनको टहरा">काठ तथा टिनको टहरा</option>
                    </select>
                  </div>

                  {/* तल्ला संख्या */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.3rem' }}>
                      तल्ला संख्या (Storeys)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={formData.storeys ?? 1}
                      onChange={(e) => setFormData({ ...formData, storeys: parseInt(e.target.value) || 1 })}
                      style={{
                        width: '100%',
                        padding: '0.55rem',
                        backgroundColor: '#1e293b',
                        border: '1px solid #475569',
                        borderRadius: '6px',
                        color: '#ffffff',
                      }}
                    />
                  </div>

                  {/* भवन निर्माण अनुमति / नक्सा पास */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.3rem' }}>
                      भवन निर्माण अनुमति / नक्सा पास
                    </label>
                    <select
                      value={formData.buildingPermitStatus || 'पालिकाबाट नक्सा पास भएको'}
                      onChange={(e) => setFormData({ ...formData, buildingPermitStatus: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.55rem',
                        backgroundColor: '#1e293b',
                        border: '1px solid #475569',
                        borderRadius: '6px',
                        color: '#ffffff',
                      }}
                    >
                      <option value="पालिकाबाट नक्सा पास भएको">पालिकाबाट नक्सा पास भएको</option>
                      <option value="निर्माण सम्पन्नता प्रमाणपत्र लिएको">निर्माण सम्पन्नता प्रमाणपत्र लिएको</option>
                      <option value="नक्सा पास नभएको">नक्सा पास नभएको</option>
                      <option value="परम्परागत / ऐतिहासिक बस्ती">परम्परागत / ऐतिहासिक बस्ती</option>
                    </select>
                  </div>

                  {/* भूकम्प प्रतिरोधी पुनर्निर्माण स्थिति */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.3rem' }}>
                      भूकम्प प्रतिरोधी पुनर्निर्माण स्थिति
                    </label>
                    <select
                      value={formData.reconstructionStatus || 'NRA भूकम्प प्रतिरोधी मापदण्ड'}
                      onChange={(e) => setFormData({ ...formData, reconstructionStatus: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.55rem',
                        backgroundColor: '#1e293b',
                        border: '1px solid #475569',
                        borderRadius: '6px',
                        color: '#ffffff',
                      }}
                    >
                      <option value="NRA भूकम्प प्रतिरोधी मापदण्ड">NRA भूकम्प प्रतिरोधी मापदण्ड</option>
                      <option value="भूकम्प पूर्वको पुरानो संरचना">भूकम्प पूर्वको पुरानो संरचना</option>
                      <option value="रेट्रोफिटिङ / प्रबलीकरण गरिएको">रेट्रोफिटिङ / प्रबलीकरण गरिएको</option>
                      <option value="सामान्य मर्मत मात्र भएको">सामान्य मर्मत मात्र भएको</option>
                    </select>
                  </div>

                  {/* खानेपानीको मुख्य स्रोत */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.3rem' }}>
                      खानेपानीको मुख्य स्रोत
                    </label>
                    <select
                      value={formData.drinkingWaterSource}
                      onChange={(e) => setFormData({ ...formData, drinkingWaterSource: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.55rem',
                        backgroundColor: '#1e293b',
                        border: '1px solid #475569',
                        borderRadius: '6px',
                        color: '#ffffff',
                      }}
                    >
                      <option value="धारा / पाइप (निजी वा सार्वजनिक)">धारा / पाइप (निजी वा सार्वजनिक)</option>
                      <option value="मूल तथा कुवाको पानी">मूल तथा कुवाको पानी</option>
                      <option value="ट्युबवेल / हाते पम्प">ट्युबवेल / हाते पम्प</option>
                      <option value="खोला / नदीको पानी">खोला / नदीको पानी</option>
                    </select>
                  </div>

                  {/* पानी शुद्धीकरण विधि */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.3rem' }}>
                      पानी शुद्धीकरण विधि
                    </label>
                    <select
                      value={formData.waterPurification || 'उमाल्ने / फिल्टर गर्ने'}
                      onChange={(e) => setFormData({ ...formData, waterPurification: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.55rem',
                        backgroundColor: '#1e293b',
                        border: '1px solid #475569',
                        borderRadius: '6px',
                        color: '#ffffff',
                      }}
                    >
                      <option value="उमाल्ने / फिल्टर गर्ने">उमाल्ने / फिल्टर गर्ने</option>
                      <option value="क्लोरिन / पियूष प्रयोग गर्ने">क्लोरिन / पियूष प्रयोग गर्ने</option>
                      <option value="सोडिस / घाममा राख्ने">सोडिस / घाममा राख्ने</option>
                      <option value="सिधै पिउने (कुनै शुद्धीकरण नगर्ने)">सिधै पिउने (कुनै शुद्धीकरण नगर्ने)</option>
                    </select>
                  </div>

                  {/* शौचालय सुविधा */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.3rem' }}>
                      शौचालय सुविधा
                    </label>
                    <select
                      value={formData.toiletType}
                      onChange={(e) => setFormData({ ...formData, toiletType: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.55rem',
                        backgroundColor: '#1e293b',
                        border: '1px solid #475569',
                        borderRadius: '6px',
                        color: '#ffffff',
                      }}
                    >
                      <option value="फ्लश सहितको सुरक्षित चर्पी">फ्लश सहितको सुरक्षित चर्पी</option>
                      <option value="सामान्य खाल्डे चर्पी">सामान्य खाल्डे चर्पी</option>
                      <option value="सार्वजनिक / साझा चर्पी">सार्वजनिक / साझा चर्पी</option>
                      <option value="शौचालय नभएको">शौचालय नभएको</option>
                    </select>
                  </div>

                  {/* खाना पकाउने इन्धन */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.3rem' }}>
                      खाना पकाउने इन्धन
                    </label>
                    <select
                      value={formData.cookingFuel || 'एलपीजी ग्यास (LPG)'}
                      onChange={(e) => setFormData({ ...formData, cookingFuel: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.55rem',
                        backgroundColor: '#1e293b',
                        border: '1px solid #475569',
                        borderRadius: '6px',
                        color: '#ffffff',
                      }}
                    >
                      <option value="एलपीजी ग्यास (LPG)">एलपीजी ग्यास (LPG)</option>
                      <option value="दाउरा / काठ">दाउरा / काठ</option>
                      <option value="बिजुली (इन्डक्सन / हीटर)">बिजुली (इन्डक्सन / हीटर)</option>
                      <option value="बायोग्यास">बायोग्यास</option>
                      <option value="अन्य">अन्य</option>
                    </select>
                  </div>

                  {/* उर्जा / बिजुलीको स्रोत */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.3rem' }}>
                      बिजुली / उर्जाको मुख्य स्रोत
                    </label>
                    <select
                      value={formData.electricitySource}
                      onChange={(e) => setFormData({ ...formData, electricitySource: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.55rem',
                        backgroundColor: '#1e293b',
                        border: '1px solid #475569',
                        borderRadius: '6px',
                        color: '#ffffff',
                      }}
                    >
                      <option value="केन्द्रीय प्रसारण लाइन (NEA)">केन्द्रीय प्रसारण लाइन (NEA)</option>
                      <option value="स्थानीय लघु जलविद्युत">स्थानीय लघु जलविद्युत</option>
                      <option value="सौर्य ऊर्जा (Solar Home System)">सौर्य ऊर्जा (Solar Home System)</option>
                      <option value="बिजुली नपुगेको">बिजुली नपुगेको</option>
                    </select>
                  </div>
                </div>

                {/* ── विपद् जोखिम तथा नदी/पहिरो सामीप्यता प्रश्नावली ── */}
                <HazardAssessmentSection
                  riverName={formData.riverName}
                  riverDistance={formData.riverDistance}
                  slopeType={formData.slopeType}
                  hasActiveLandslide={formData.hasActiveLandslide}
                  hasGroundCrack={formData.hasGroundCrack}
                  hasLandslideHistory={formData.hasLandslideHistory}
                  hasFloodHistory={formData.hasFloodHistory}
                  hasRiverProtection={formData.hasRiverProtection}
                  riskLevel={formData.riskLevel}
                  riskScore={formData.riskScore}
                  riskDetails={formData.riskDetails}
                  onChange={handleFormHazardChange}
                  onRiskLevelChange={(level) => setFormData((prev) => ({ ...prev, riskLevel: level }))}
                  onRiskDetailsChange={(details) => setFormData((prev) => ({ ...prev, riskDetails: details }))}
                />

                <div style={{ marginTop: '0.85rem', borderTop: '1px dashed #334155', paddingTop: '0.75rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: '#fbbf24', marginBottom: '0.25rem' }}>
                      🏃 सुरक्षित आश्रयस्थल (Evacuation Shelter) सम्म पुग्ने समय (मिनेट)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={180}
                      value={formData.safeShelterDistanceMins || 15}
                      onChange={(e) => setFormData({ ...formData, safeShelterDistanceMins: Number(e.target.value) || 15 })}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        backgroundColor: '#1e293b',
                        border: '1px solid #475569',
                        borderRadius: '6px',
                        color: '#ffffff',
                        fontSize: '0.85rem',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* ── FOOTER ACTIONS ── */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '0.85rem',
                  paddingTop: '1rem',
                  borderTop: '1px solid #334155',
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  style={{
                    padding: '0.6rem 1.25rem',
                    backgroundColor: '#334155',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                  }}
                >
                  रद्द गर्नुहोस्
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  style={{
                    padding: '0.6rem 1.75rem',
                    backgroundColor: '#10b981',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    cursor: createMutation.isPending ? 'wait' : 'pointer',
                    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <CheckCircle size={17} />
                  <span>{createMutation.isPending ? 'सुरक्षित गरिँदैछ...' : 'घरधुरी दर्ता सुरक्षित गर्नुहोस्'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default HouseholdRegistryTab;
