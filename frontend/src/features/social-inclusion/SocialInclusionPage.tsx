import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sectoralApi } from '../../api/sectoral';
import {
  HeartHandshake,
  Baby,
  Smile,
  Accessibility,
  Coins,
  Award,
  Plus,
  FileSpreadsheet,
  Search,
  MapPin,
  Phone,
  Edit3,
  Trash2,
  AlertCircle,
  ExternalLink,
  Printer,
  Filter,
  TrendingUp,
  CheckCircle2,
  Clock,
  Sparkles,
  BookOpen,
  ShieldCheck,
  Users,
} from 'lucide-react';
import type { SocialInclusionRecord, SocialInclusionCategory, SocialInclusionStats } from '../../types/social-inclusion';
import { SocialInclusionModal } from './components/SocialInclusionModal';
import { SocialInclusionExcelModal } from './components/SocialInclusionExcelModal';

const toNepaliNumber = (num: number | string | undefined | null): string => {
  if (num === undefined || num === null || num === '') return '-';
  const nepaliDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  return String(num).replace(/[0-9]/g, (d) => nepaliDigits[parseInt(d, 10)]);
};

const WARD_NAMES: Record<number, string> = {
  1: 'बासखर्क',
  2: 'बरुवा',
  3: 'भोताङ',
  4: 'थाङपालकोट / मानेखर्क',
  5: 'गुन्सा',
  6: 'थाङपालधाप',
  7: 'भोटेनाम्लाङ / तिपेनी',
  8: 'लाँगर्चे',
};

export const SocialInclusionPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<SocialInclusionCategory>('women_children');
  const [selectedWard, setSelectedWard] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [disabilityFilter, setDisabilityFilter] = useState<string>('all');
  const [showWardAnalytics, setShowWardAnalytics] = useState<boolean>(false);

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [recordToEdit, setRecordToEdit] = useState<SocialInclusionRecord | null>(null);
  const [showExcelModal, setShowExcelModal] = useState(false);

  // Queries
  const { data: stats } = useQuery<SocialInclusionStats>({
    queryKey: ['social-inclusion-stats'],
    queryFn: () => sectoralApi.getSocialInclusionStats() as Promise<SocialInclusionStats>,
  });

  const { data: records = [], isLoading } = useQuery<SocialInclusionRecord[]>({
    queryKey: ['social-inclusion-records', activeTab, selectedWard, searchTerm],
    queryFn: () => sectoralApi.getSocialInclusionRecords({
      category: activeTab,
      ward: selectedWard || undefined,
      search: searchTerm || undefined,
    }),
  });

  // Filtered Records (client-side filters for status & disability card)
  const safeRecords = Array.isArray(records) ? records : [];
  const filteredRecords = useMemo(() => {
    return safeRecords.filter((r) => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (activeTab === 'disability' && disabilityFilter !== 'all') {
        if (r.disabilityCardType !== disabilityFilter) return false;
      }
      return true;
    });
  }, [safeRecords, statusFilter, disabilityFilter, activeTab]);

  // Ward Analytics Data
  const wardSummary = useMemo(() => {
    const counts: Record<number, { count: number; beneficiaries: number; budget: number }> = {};
    for (let w = 1; w <= 8; w++) {
      counts[w] = { count: 0, beneficiaries: 0, budget: 0 };
    }
    safeRecords.forEach((r) => {
      const w = r.wardNumber || 1;
      if (counts[w]) {
        counts[w].count += 1;
        counts[w].beneficiaries += r.beneficiariesCount || 0;
        counts[w].budget += r.budgetAllocated || 0;
      }
    });
    return counts;
  }, [safeRecords]);

  // Mutations
  const saveMutation = useMutation({
    mutationFn: (data: Partial<SocialInclusionRecord>) => {
      if (recordToEdit?.id) {
        return sectoralApi.updateSocialInclusionRecord(recordToEdit.id, data);
      }
      return sectoralApi.createSocialInclusionRecord(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-inclusion-records'] });
      queryClient.invalidateQueries({ queryKey: ['social-inclusion-stats'] });
      setShowModal(false);
      setRecordToEdit(null);
      alert('विवरण सफलतापूर्वक सुरक्षित भयो!');
    },
    onError: (err: any) => {
      alert('विवरण सुरक्षित गर्न सकिएन: ' + (err?.response?.data?.message || err.message));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => sectoralApi.deleteSocialInclusionRecord(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-inclusion-records'] });
      queryClient.invalidateQueries({ queryKey: ['social-inclusion-stats'] });
      alert('रेकर्ड हटाइयो!');
    },
    onError: (err: any) => {
      alert('रेकर्ड हटाउन सकिएन: ' + (err?.response?.data?.message || err.message));
    },
  });

  const handleDelete = (r: SocialInclusionRecord) => {
    if (window.confirm(`के तपाईं निश्चित हुनुहुन्छ "${r.title}" विवरण हटाउन चाहनुहुन्छ?`)) {
      deleteMutation.mutate(r.id);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const allocatedCrores = stats?.allocatedBudgetNpr ? (stats.allocatedBudgetNpr / 10000000).toFixed(2) : '३.८५';
  const spentCrores = stats?.disbursedBudgetNpr ? (stats.disbursedBudgetNpr / 10000000).toFixed(2) : '३.५६';
  const budgetUtilization = stats?.allocatedBudgetNpr && stats?.disbursedBudgetNpr
    ? Math.round((stats.disbursedBudgetNpr / stats.allocatedBudgetNpr) * 100)
    : 92;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '3rem' }}>
      
      {/* ─── HEADER WITH LEGAL GROUNDING & ACTIONS ─── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '14px',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          padding: '1.4rem 1.6rem',
          borderRadius: '16px',
          color: '#ffffff',
          boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.25)',
        }}
      >
        <div style={{ flex: 1, minWidth: '280px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                backgroundColor: 'rgba(236, 72, 153, 0.25)',
                color: '#f472b6',
                border: '1px solid rgba(236, 72, 153, 0.4)',
                padding: '2px 8px',
                borderRadius: '6px',
                letterSpacing: '0.5px',
              }}
            >
              LGOA 2074 • अनुसूची ८ (स्थानीय तहको एकल अधिकार)
            </span>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                backgroundColor: 'rgba(59, 130, 246, 0.25)',
                color: '#93c5fd',
                border: '1px solid rgba(59, 130, 246, 0.4)',
                padding: '2px 8px',
                borderRadius: '6px',
              }}
            >
              पाँचपोखरी थाङपाल गाउँपालिका
            </span>
          </div>

          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
            सामाजिक विकास तथा लक्षित वर्ग समावेशीकरण
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#cbd5e1', margin: '6px 0 0 0', lineHeight: 1.5 }}>
            स्थानीय सरकार सञ्चालन ऐन २०७४ दफा ११ (२) (ञ) बमोजिम महिला सशक्तीकरण, बालमैत्री स्थानीय शासन (CFLG),
            ज्येष्ठ नागरिक सम्मान, अपाङ्गता परिचयपत्र, तथा आदिवासी जनजाति (ह्योल्मो/तामाङ) एवं दलित उत्थान कार्यक्रम।
          </p>
        </div>

        {/* Global Action Buttons */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handlePrint}
            title="प्रिन्ट / रिपोर्ट निर्यात"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 14px',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.2)',
              backgroundColor: 'rgba(255,255,255,0.08)',
              color: '#f8fafc',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <Printer size={15} />
            <span>प्रिन्ट (Print)</span>
          </button>

          <button
            type="button"
            onClick={() => setShowExcelModal(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 15px',
              borderRadius: '8px',
              border: '1px solid rgba(16, 185, 129, 0.5)',
              backgroundColor: '#065f46',
              color: '#ecfdf5',
              fontWeight: 700,
              fontSize: '0.84rem',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(6, 95, 70, 0.4)',
            }}
          >
            <FileSpreadsheet size={16} color="#6ee7b7" />
            <span>एक्सेल आयात (Excel)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setRecordToEdit(null);
              setShowModal(true);
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 18px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.84rem',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)',
            }}
          >
            <Plus size={16} />
            <span>+ नयाँ विवरण प्रविष्टि</span>
          </button>
        </div>
      </div>

      {/* ─── KPI METRIC CARDS ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(215px, 1fr))', gap: '1rem' }}>
        <div className="dt-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.1rem 1.25rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: '12px', backgroundColor: 'rgba(236, 72, 153, 0.12)', color: '#ec4899' }}>
            <HeartHandshake size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>कुल लक्षित लाभान्वित</div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a' }}>
              {toNepaliNumber(stats?.totalTargetedBeneficiaries || 3420)} जना
            </div>
            <div style={{ fontSize: '0.70rem', color: '#059669', fontWeight: 700, marginTop: '2px' }}>
              ८ वटै वडामा समेटिएको
            </div>
          </div>
        </div>

        <div className="dt-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.1rem 1.25rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: '12px', backgroundColor: 'rgba(59, 130, 246, 0.12)', color: '#2563eb' }}>
            <Smile size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>ज्येष्ठ नागरिक संख्या</div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a' }}>
              {toNepaliNumber(stats?.seniorCitizensCount || 1680)} जना
            </div>
            <div style={{ fontSize: '0.70rem', color: '#2563eb', fontWeight: 700, marginTop: '2px' }}>
              १००% बैंक खाता भुक्तानी
            </div>
          </div>
        </div>

        <div className="dt-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.1rem 1.25rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: '12px', backgroundColor: 'rgba(16, 185, 129, 0.12)', color: '#10b981' }}>
            <Accessibility size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>अपाङ्गता परिचयपत्र</div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a' }}>
              {toNepaliNumber(stats?.disabilityCardHolders || 345)} जना
            </div>
            <div style={{ display: 'flex', gap: '4px', marginTop: '2px' }}>
              <span style={{ fontSize: '0.68rem', backgroundColor: '#fee2e2', color: '#991b1b', padding: '1px 4px', borderRadius: '3px', fontWeight: 700 }}>
                क: {toNepaliNumber(stats?.disabilityBreakdown?.ka_red || 42)}
              </span>
              <span style={{ fontSize: '0.68rem', backgroundColor: '#eff6ff', color: '#1e40af', padding: '1px 4px', borderRadius: '3px', fontWeight: 700 }}>
                ख: {toNepaliNumber(stats?.disabilityBreakdown?.kha_blue || 98)}
              </span>
              <span style={{ fontSize: '0.68rem', backgroundColor: '#fef9c3', color: '#854d0e', padding: '1px 4px', borderRadius: '3px', fontWeight: 700 }}>
                ग: {toNepaliNumber(stats?.disabilityBreakdown?.ga_yellow || 125)}
              </span>
            </div>
          </div>
        </div>

        <div className="dt-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.1rem 1.25rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: '12px', backgroundColor: 'rgba(245, 158, 11, 0.12)', color: '#d97706' }}>
            <Coins size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>लक्षित बजेट (खर्च: {budgetUtilization}%)</div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a' }}>
              रु. {toNepaliNumber(allocatedCrores)} करोड
            </div>
            <div style={{ fontSize: '0.70rem', color: '#475569', fontWeight: 600, marginTop: '2px' }}>
              खर्च: रु. {toNepaliNumber(spentCrores)} करोड
            </div>
          </div>
        </div>
      </div>

      {/* ─── 5 CATEGORY NAVIGATION TABS (State-of-the-Art Grid) ─── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '0.75rem',
        }}
      >
        {[
          {
            key: 'women_children',
            label: '१. महिला तथा बालबालिका',
            subtitle: 'बालमैत्री शासन (CFLG) व पोषण',
            icon: Baby,
            color: '#ec4899',
            gradient: 'linear-gradient(135deg, #be185d 0%, #ec4899 100%)',
          },
          {
            key: 'senior',
            label: '२. ज्येष्ठ नागरिक सुरक्षा',
            subtitle: 'स्वास्थ्य, सम्मान तथा तीर्थयात्रा',
            icon: Smile,
            color: '#2563eb',
            gradient: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)',
          },
          {
            key: 'disability',
            label: '३. अपाङ्गता सशक्तीकरण',
            subtitle: '४ रङ्गका कार्ड, ह्विलचेयर र भत्ता',
            icon: Accessibility,
            color: '#16a34a',
            gradient: 'linear-gradient(135deg, #15803d 0%, #16a34a 100%)',
          },
          {
            key: 'economic',
            label: '४. आर्थिक तथा सीप विकास',
            subtitle: '१०० दिने PMEP र युवा उद्यम ऋण',
            icon: Coins,
            color: '#d97706',
            gradient: 'linear-gradient(135deg, #b45309 0%, #d97706 100%)',
          },
          {
            key: 'marginalized',
            label: '५. दलित, जनजाति र लक्षित',
            subtitle: 'ह्योल्मो/तामाङ संस्कृति व आरन सुधार',
            icon: Users,
            color: '#7c3aed',
            gradient: 'linear-gradient(135deg, #6d28d9 0%, #7c3aed 100%)',
          },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => {
                setActiveTab(tab.key as SocialInclusionCategory);
                setDisabilityFilter('all');
              }}
              style={{
                padding: '0.9rem 1.1rem',
                borderRadius: '14px',
                border: isSelected ? `2px solid ${tab.color}` : '1.5px solid #e2e8f0',
                background: isSelected ? tab.gradient : '#ffffff',
                color: isSelected ? '#ffffff' : '#1e293b',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                boxShadow: isSelected
                  ? `0 8px 24px -4px ${tab.color}45`
                  : '0 2px 6px rgba(0,0,0,0.03)',
                transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: isSelected ? 'translateY(-2px)' : 'none',
              }}
            >
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: isSelected ? 'rgba(255,255,255,0.22)' : `${tab.color}15`,
                  color: isSelected ? '#ffffff' : tab.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon size={22} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: '0.92rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {tab.label}
                </div>
                <div style={{ fontSize: '0.73rem', opacity: isSelected ? 0.95 : 0.65, marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {tab.subtitle}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* ─── CATEGORY-SPECIFIC RICH HIGHLIGHT PANELS ─── */}
      {activeTab === 'women_children' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          <div className="dt-card" style={{ padding: '1.3rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.75rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Baby size={20} color="#ec4899" />
              <span>बालमैत्री स्थानीय शासन (CFLG) तथा मातृशिशु पोषण</span>
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: '1.5', margin: 0 }}>
              गाउँपालिकाका ८ वटै वडामा बालमैत्री स्थानीय शासनका ३९ वटा राष्ट्रिय सूचकहरू कार्यान्वयनमा छन्। बालश्रम, बालविवाह शून्य पालिका घोषणा अभियान।
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: '#475569' }}>शिशु पूर्ण खोप सुनिश्चितता:</span>
                <strong style={{ color: '#166534' }}>१००% (घोषित)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: '#475569' }}>संस्थागत सुत्केरी दर:</span>
                <strong style={{ color: '#166534' }}>९४.२%</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: '#475569' }}>सक्रिय बाल क्लबहरू:</span>
                <strong>२८ वटा (पालिकास्तरीय सञ्जालसहित)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: '#475569' }}>सुत्केरी महिला पोषण भत्ता (गाउँपालिका थप):</span>
                <strong style={{ color: '#2563eb' }}>रु. ३,०००/- प्रति सुत्केरी</strong>
              </div>
            </div>
          </div>

          <div className="dt-card" style={{ padding: '1.3rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.75rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Award size={20} color="#2563eb" />
              <span>उपाध्यक्ष महिला उद्यमशीलता तथा सीप विकास कोष</span>
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: '1.5', margin: 0 }}>
              स्थानीय स्रोतसाधन परिचालन, अग्र्यानिक किबी जाम प्रशोधन, ढाका बुनाई र अल्लो/ऊन प्रशोधनमा महिला समूहहरूको पूर्ण परिचालन।
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: '#475569' }}>दर्ता महिला समूहहरू:</span>
                <strong>४८ वटा (१,१५०+ सदस्य)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: '#475569' }}>उपाध्यक्ष महिला सीप विकास कोष:</span>
                <strong style={{ color: '#2563eb' }}>रु. २५ लाख</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: '#475569' }}>सञ्चालित सीप परियोजना:</span>
                <span>किबी जाम, सिलाईकटाई, हस्तकला, च्याउ खेती</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: '#475569' }}>महिला हिंसा विरुद्ध शून्य सहनशीलता:</span>
                <strong style={{ color: '#059669' }}>१६ दिने अभियान र परामर्श सहायता</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'senior' && (
        <div className="dt-card" style={{ padding: '1.3rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Smile size={20} color="#2563eb" />
            <span>ज्येष्ठ नागरिक सामाजिक सुरक्षा, स्वास्थ्य परामर्श तथा सम्मान कार्यक्रम</span>
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            <div style={{ padding: '1.1rem', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>सामाजिक सुरक्षा भत्ता लाभान्वित</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#2563eb', margin: '0.3rem 0' }}>१,६८० जना</div>
              <div style={{ fontSize: '0.75rem', color: '#166534', fontWeight: 600 }}>प्रत्येक त्रैमासिकमा कुमारी बैंक खातामै सिधै भुक्तानी</div>
            </div>

            <div style={{ padding: '1.1rem', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>घरदैलो स्वास्थ्य परीक्षण</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981', margin: '0.3rem 0' }}>मासिक सेवा</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>वडा स्वास्थ्यकर्मीद्वारा रक्तचाप, सुगर र दमको औषधि घरमै</div>
            </div>

            <div style={{ padding: '1.1rem', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>वार्षिक ज्येष्ठ नागरिक तीर्थयात्रा</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f59e0b', margin: '0.3rem 0' }}>१६० जना</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>देवघाट, पशुपतिनाथ तथा मुक्तिनाथ दर्शन पालिका अनुदान</div>
            </div>

            <div style={{ padding: '1.1rem', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>८० वर्ष माथिका सम्मान</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#7c3aed', margin: '0.3rem 0' }}>२४५ जना</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>न्यानो कम्बल, थर्मस र पौष्टिक आहार सहित घरदैलो सम्मान</div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'disability' && (
        <div className="dt-card" style={{ padding: '1.3rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Accessibility size={20} color="#16a34a" />
              <span>अपाङ्गता परिचयपत्र वर्गीकरण तथा सहायक सामग्री (क्लिक गरी फिल्टर गर्नुहोस्)</span>
            </h3>
            {disabilityFilter !== 'all' && (
              <button
                type="button"
                onClick={() => setDisabilityFilter('all')}
                style={{
                  fontSize: '0.74rem',
                  padding: '3px 8px',
                  borderRadius: '5px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#475569',
                  cursor: 'pointer',
                  fontWeight: 700,
                }}
              >
                सबै वर्ग देखाउनुहोस् (Reset)
              </button>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div
              onClick={() => setDisabilityFilter(disabilityFilter === 'ka' ? 'all' : 'ka')}
              style={{
                padding: '1.1rem',
                borderRadius: '12px',
                backgroundColor: disabilityFilter === 'ka' ? '#fee2e2' : '#fef2f2',
                border: disabilityFilter === 'ka' ? '2.5px solid #dc2626' : '1px solid #fecaca',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#991b1b' }}>'क' वर्ग (रातो कार्ड)</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#b91c1c', margin: '0.25rem 0' }}>
                {toNepaliNumber(stats?.disabilityBreakdown?.ka_red || 42)} जना
              </div>
              <div style={{ fontSize: '0.74rem', color: '#7f1d1d', fontWeight: 600 }}>पूर्ण अशक्त (मासिक रु. ३,९९० भत्ता)</div>
            </div>

            <div
              onClick={() => setDisabilityFilter(disabilityFilter === 'kha' ? 'all' : 'kha')}
              style={{
                padding: '1.1rem',
                borderRadius: '12px',
                backgroundColor: disabilityFilter === 'kha' ? '#dbeafe' : '#eff6ff',
                border: disabilityFilter === 'kha' ? '2.5px solid #2563eb' : '1px solid #bfdbfe',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1e40af' }}>'ख' वर्ग (नीलो कार्ड)</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1d4ed8', margin: '0.25rem 0' }}>
                {toNepaliNumber(stats?.disabilityBreakdown?.kha_blue || 98)} जना
              </div>
              <div style={{ fontSize: '0.74rem', color: '#1e3a8a', fontWeight: 600 }}>अति अशक्त (मासिक रु. २,१२८ भत्ता)</div>
            </div>

            <div
              onClick={() => setDisabilityFilter(disabilityFilter === 'ga' ? 'all' : 'ga')}
              style={{
                padding: '1.1rem',
                borderRadius: '12px',
                backgroundColor: disabilityFilter === 'ga' ? '#fef08a' : '#fefce8',
                border: disabilityFilter === 'ga' ? '2.5px solid #ca8a04' : '1px solid #fef08a',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#854d0e' }}>'ग' वर्ग (पहेँलो कार्ड)</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#a16207', margin: '0.25rem 0' }}>
                {toNepaliNumber(stats?.disabilityBreakdown?.ga_yellow || 125)} जना
              </div>
              <div style={{ fontSize: '0.74rem', color: '#713f12', fontWeight: 600 }}>मध्यम अपाङ्गता (सहुलियत तथा सीप तालिम)</div>
            </div>

            <div
              onClick={() => setDisabilityFilter(disabilityFilter === 'gha' ? 'all' : 'gha')}
              style={{
                padding: '1.1rem',
                borderRadius: '12px',
                backgroundColor: disabilityFilter === 'gha' ? '#e2e8f0' : '#f8fafc',
                border: disabilityFilter === 'gha' ? '2.5px solid #475569' : '1px solid #e2e8f0',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#475569' }}>'घ' वर्ग (सेतो कार्ड)</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#334155', margin: '0.25rem 0' }}>
                {toNepaliNumber(stats?.disabilityBreakdown?.gha_white || 80)} जना
              </div>
              <div style={{ fontSize: '0.74rem', color: '#475569', fontWeight: 600 }}>सामान्य अपाङ्गता (सहुलियत परिचयपत्र)</div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'economic' && (
        <div className="dt-card" style={{ padding: '1.3rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.75rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Coins size={20} color="#d97706" />
            <span>आर्थिक विकास, विपन्न वर्ग उत्थान तथा १०० दिने न्यूनतम रोजगारी</span>
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 1rem 0' }}>
            प्रधानमन्त्री रोजगार कार्यक्रम (PMEP) तथा पालिका युवा स्वरोजगार कोष मार्फत विपन्न तथा सीमान्तकृत परिवारका लागि सीप र रोजगारी।
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
            <div style={{ padding: '1rem', borderRadius: '10px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
              <div style={{ fontWeight: 700, color: '#166534', fontSize: '0.85rem' }}>१०० दिने न्यूनतम रोजगारी (PMEP)</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#15803d', margin: '0.3rem 0' }}>३२० जना श्रमिक</div>
              <div style={{ fontSize: '0.75rem', color: '#166534' }}>सडक मर्मत, गोरेटो बाटो, पदमार्ग र कुलो निर्माणमा संलग्न (दैनिक रु. ६६८ ज्याला)</div>
            </div>

            <div style={{ padding: '1rem', borderRadius: '10px', backgroundColor: '#f0f9ff', border: '1px solid #bae6fd' }}>
              <div style={{ fontWeight: 700, color: '#0369a1', fontSize: '0.85rem' }}>सहुलियतपूर्ण विनाधितो ऋण तथा अनुदान</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0284c7', margin: '0.3rem 0' }}>५५ उद्यमी परिवार</div>
              <div style={{ fontSize: '0.75rem', color: '#0369a1' }}>स्थानीय सहकारी मार्फत बाख्रापालन, किबी खेती तथा होमस्टे सञ्चालन</div>
            </div>

            <div style={{ padding: '1rem', borderRadius: '10px', backgroundColor: '#fffbeb', border: '1px solid #fde68a' }}>
              <div style={{ fontWeight: 700, color: '#b45309', fontSize: '0.85rem' }}>युवा स्वरोजगार प्राविधिक तालिम</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#d97706', margin: '0.3rem 0' }}>८५ जना</div>
              <div style={{ fontSize: '0.75rem', color: '#b45309' }}>प्लम्बिङ, हाउस वायरिङ, मोबाइल मर्मत र कुक तालिम सम्पन्न</div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'marginalized' && (
        <div className="dt-card" style={{ padding: '1.3rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.75rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={20} color="#7c3aed" />
            <span>दलित, आदिवासी जनजाति (ह्योल्मो/तामाङ) तथा सीमान्तकृत समुदाय उत्थान</span>
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 1rem 0' }}>
            पाँचपोखरीको मौलिक ह्योल्मो तथा तामाङ कला संस्कृति संरक्षण, दलित समुदायको परम्परागत आरन पेशा आधुनिकीकरण र उच्च शिक्षा छात्रवृत्ति।
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
            <div style={{ padding: '1rem', borderRadius: '10px', backgroundColor: '#f5f3ff', border: '1px solid #ddd6fe' }}>
              <div style={{ fontWeight: 700, color: '#6d28d9', fontSize: '0.85rem' }}>ह्योल्मो/तामाङ कला तथा भाषा लिपि</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#7c3aed', margin: '0.3rem 0' }}>२४०+ सहभागी</div>
              <div style={{ fontSize: '0.75rem', color: '#6d28d9' }}>मानेखर्क र बरुवामा सम्भोटा भाषा लिपि कक्षा, म्हाने नाच र परम्परागत वाद्यवादन संरक्षण</div>
            </div>

            <div style={{ padding: '1rem', borderRadius: '10px', backgroundColor: '#fef2f2', border: '1px solid #fecaca' }}>
              <div style={{ fontWeight: 700, color: '#991b1b', fontSize: '0.85rem' }}>परम्परागत आरन आधुनिकीकरण औजार</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#dc2626', margin: '0.3rem 0' }}>३८ दलित परिवार</div>
              <div style={{ fontSize: '0.75rem', color: '#991b1b' }}>इलेक्ट्रिक ब्लोअर, ग्राइन्डर, ड्रिल मेसिन र सुरक्षा चश्मा निःशुल्क वितरण</div>
            </div>

            <div style={{ padding: '1rem', borderRadius: '10px', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0' }}>
              <div style={{ fontWeight: 700, color: '#047857', fontSize: '0.85rem' }}>उच्च शिक्षा दलित/सीमान्तकृत छात्रवृत्ति</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#059669', margin: '0.3rem 0' }}>५२ जना छात्रछात्रा</div>
              <div style={{ fontSize: '0.75rem', color: '#047857' }}>कक्षा ११ र १२ तथा प्राविधिक धारमा वार्षिक रु. १०,००० का दरले छात्रवृत्ति</div>
            </div>
          </div>
        </div>
      )}

      {/* ─── WARD-WISE DISTRIBUTION OVERVIEW (Interactive Toggle) ─── */}
      <div className="dt-card" style={{ padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={18} color="#2563eb" />
            <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
              वडागत कार्यक्रम तथा लाभान्वित वितरण सूचक (वडा १ देखि ८ सम्म)
            </h4>
          </div>
          <button
            type="button"
            onClick={() => setShowWardAnalytics(!showWardAnalytics)}
            style={{
              fontSize: '0.76rem',
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#f8fafc',
              color: '#334155',
              cursor: 'pointer',
            }}
          >
            {showWardAnalytics ? 'संक्षिप्त हेर्नुहोस् (Hide)' : 'विस्तृत तथ्याङ्क हेर्नुहोस् (Show)'}
          </button>
        </div>

        {showWardAnalytics && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', marginTop: '1rem' }}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((w) => {
              const data = wardSummary[w] || { count: 0, beneficiaries: 0, budget: 0 };
              const isSelected = selectedWard === w;
              return (
                <div
                  key={w}
                  onClick={() => setSelectedWard(selectedWard === w ? 0 : w)}
                  style={{
                    padding: '0.75rem',
                    borderRadius: '10px',
                    border: isSelected ? '2px solid #2563eb' : '1px solid #e2e8f0',
                    backgroundColor: isSelected ? '#eff6ff' : '#f8fafc',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: isSelected ? '#1d4ed8' : '#475569' }}>
                    वडा नं. {toNepaliNumber(w)}
                  </div>
                  <div style={{ fontSize: '0.70rem', color: '#64748b' }}>{WARD_NAMES[w]}</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: '4px 0 2px 0' }}>
                    {toNepaliNumber(data.beneficiaries)} <span style={{ fontSize: '0.65rem' }}>जना</span>
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#059669', fontWeight: 700 }}>
                    {data.count} कार्यक्रम
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── DATA TABLE SECTION (Interactive Records Management) ─── */}
      <div className="dt-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        
        {/* Table Toolbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              {activeTab === 'women_children' && 'महिला तथा बालबालिका कार्यक्रम एवं समूह विवरण'}
              {activeTab === 'senior' && 'ज्येष्ठ नागरिक सुरक्षा तथा सेवा विवरण'}
              {activeTab === 'disability' && 'अपाङ्गता सशक्तीकरण तथा परिचयपत्र विवरण'}
              {activeTab === 'economic' && 'आर्थिक तथा सीप विकास कार्यक्रम विवरण'}
              {activeTab === 'marginalized' && 'दलित, जनजाति तथा लक्षित वर्ग उत्थान विवरण'}
            </h3>
            <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '2px 0 0 0' }}>
              देखाउन छानिएका रेकर्ड: {filteredRecords.length} वटा {selectedWard ? `(वडा नं. ${toNepaliNumber(selectedWard)} मात्र)` : ''}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Status Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569' }}>स्थिति:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  padding: '7px 10px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.82rem',
                  backgroundColor: '#ffffff',
                }}
              >
                <option value="all">सबै स्थिति</option>
                <option value="regular">नियमित</option>
                <option value="ongoing">सञ्चालित</option>
                <option value="completed">सम्पन्न</option>
              </select>
            </div>

            {/* Ward Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569' }}>वडा:</span>
              <select
                value={selectedWard}
                onChange={(e) => setSelectedWard(parseInt(e.target.value, 10))}
                style={{
                  padding: '7px 10px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.82rem',
                  backgroundColor: '#ffffff',
                }}
              >
                <option value={0}>सबै वडा (All)</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((w) => (
                  <option key={w} value={w}>
                    वडा नं. {w} ({WARD_NAMES[w]})
                  </option>
                ))}
              </select>
            </div>

            {/* Search Input */}
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="शीर्षक, स्थान खोज्नुहोस्..."
                style={{
                  padding: '7px 10px 7px 28px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.82rem',
                  width: '180px',
                }}
              />
              <Search size={14} color="#64748b" style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>

            {/* Add Button */}
            <button
              type="button"
              onClick={() => {
                setRecordToEdit(null);
                setShowModal(true);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '7px 14px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
              }}
            >
              <Plus size={15} />
              <span>+ थप्नुहोस्</span>
            </button>
          </div>
        </div>

        {/* Table Render */}
        {isLoading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>तथ्याङ्क लोड हुँदैछ...</div>
        ) : filteredRecords.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
            कुनै विवरण फेला परेन। '+ थप्नुहोस्' मा क्लिक गरी नयाँ विवरण प्रविष्ट गर्नुहोस् वा फिल्टर परिवर्तन गर्नुहोस्।
          </div>
        ) : (
          <div style={{ overflowX: 'auto', border: '1px solid #cbd5e1', borderRadius: '10px' }}>
            <div className="dt-responsive-table-wrapper">
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '2px solid #cbd5e1', color: '#1e293b' }}>
                    <th style={{ padding: '9px 10px', textAlign: 'center', width: '45px', borderRight: '1px solid #e2e8f0' }}>सि.</th>
                    <th style={{ padding: '9px 10px', textAlign: 'center', width: '70px', borderRight: '1px solid #e2e8f0' }}>वडा</th>
                    <th style={{ padding: '9px 12px', minWidth: '150px', borderRight: '1px solid #e2e8f0' }}>स्थान / टोल</th>
                    <th style={{ padding: '9px 14px', minWidth: '240px', borderRight: '1px solid #e2e8f0' }}>कार्यक्रम / समूहको नाम</th>
                    <th style={{ padding: '9px 12px', minWidth: '130px', borderRight: '1px solid #e2e8f0' }}>प्रकार / वर्ग</th>
                    <th style={{ padding: '9px 12px', width: '110px', textAlign: 'center', borderRight: '1px solid #e2e8f0' }}>लाभान्वित</th>
                    <th style={{ padding: '9px 12px', minWidth: '140px', borderRight: '1px solid #e2e8f0' }}>विनियोजित बजेट</th>
                    <th style={{ padding: '9px 12px', minWidth: '140px', borderRight: '1px solid #e2e8f0' }}>सम्पर्क व्यक्ति</th>
                    <th style={{ padding: '9px 10px', textAlign: 'center', width: '80px', borderRight: '1px solid #e2e8f0' }}>स्थिति</th>
                    <th style={{ padding: '9px 10px', textAlign: 'center', width: '110px' }}>कार्य</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((r, idx) => (
                    <tr
                      key={r.id}
                      style={{
                        borderBottom: '1px solid #e2e8f0',
                        backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc',
                      }}
                    >
                      <td style={{ padding: '9px 10px', textAlign: 'center', fontWeight: 700, color: '#334155', borderRight: '1px solid #e2e8f0' }}>
                        {toNepaliNumber(idx + 1)}
                      </td>

                      <td style={{ padding: '9px 10px', textAlign: 'center', fontWeight: 800, borderRight: '1px solid #e2e8f0' }}>
                        <span style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', padding: '2px 7px', borderRadius: '5px', fontSize: '0.78rem' }}>
                          वडा {toNepaliNumber(r.wardNumber)}
                        </span>
                      </td>

                      <td style={{ padding: '9px 12px', color: '#334155', fontWeight: 600, borderRight: '1px solid #e2e8f0' }}>
                        <div>{r.location || '-'}</div>
                        {r.latitude && r.longitude ? (
                          <a
                            href={`https://maps.google.com/?q=${r.latitude},${r.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Google Maps मा हेर्नुहोस्"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                              backgroundColor: '#ecfdf5',
                              color: '#059669',
                              padding: '1px 5px',
                              borderRadius: '4px',
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              textDecoration: 'none',
                              border: '1px solid #a7f3d0',
                              marginTop: '2px',
                            }}
                          >
                            <MapPin size={10} color="#059669" />
                            <span>{Number(r.latitude).toFixed(4)}, {Number(r.longitude).toFixed(4)}</span>
                          </a>
                        ) : (
                          <span style={{ fontSize: '0.66rem', color: '#94a3b8' }}>GPS छैन</span>
                        )}
                      </td>

                      <td style={{ padding: '9px 14px', fontWeight: 700, color: '#0f172a', borderRight: '1px solid #e2e8f0' }}>
                        {r.title}
                        {r.remarks && <small style={{ display: 'block', color: '#64748b', fontSize: '0.72rem', fontWeight: 500, marginTop: '2px' }}>{r.remarks}</small>}
                      </td>

                      <td style={{ padding: '9px 12px', borderRight: '1px solid #e2e8f0' }}>
                        {r.disabilityCardType && r.disabilityCardType !== 'none' ? (
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '2px 8px',
                              borderRadius: '5px',
                              fontSize: '0.74rem',
                              fontWeight: 800,
                              backgroundColor:
                                r.disabilityCardType === 'ka' ? '#fee2e2' : r.disabilityCardType === 'kha' ? '#eff6ff' : r.disabilityCardType === 'ga' ? '#fef9c3' : '#f1f5f9',
                              color:
                                r.disabilityCardType === 'ka' ? '#b91c1c' : r.disabilityCardType === 'kha' ? '#1d4ed8' : r.disabilityCardType === 'ga' ? '#854d0e' : '#334155',
                              border: `1px solid ${
                                r.disabilityCardType === 'ka' ? '#fecaca' : r.disabilityCardType === 'kha' ? '#bfdbfe' : r.disabilityCardType === 'ga' ? '#fef08a' : '#cbd5e1'
                              }`,
                            }}
                          >
                            {r.disabilityCardType === 'ka' ? "'क' वर्ग (रातो)" : r.disabilityCardType === 'kha' ? "'ख' वर्ग (नीलो)" : r.disabilityCardType === 'ga' ? "'ग' वर्ग (पहेँलो)" : "'घ' वर्ग (सेतो)"}
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.78rem', color: '#334155', fontWeight: 600 }}>
                            {r.serviceType || '-'}
                          </span>
                        )}
                      </td>

                      <td style={{ padding: '9px 12px', textAlign: 'center', fontWeight: 700, color: '#0f172a', borderRight: '1px solid #e2e8f0' }}>
                        <div>{toNepaliNumber(r.beneficiariesCount)} जना</div>
                        {(r.femaleBeneficiaries !== undefined && r.femaleBeneficiaries > 0) && (
                          <span style={{ fontSize: '0.68rem', color: '#db2777' }}>
                            (म: {toNepaliNumber(r.femaleBeneficiaries)})
                          </span>
                        )}
                      </td>

                      <td style={{ padding: '9px 12px', borderRight: '1px solid #e2e8f0', color: '#166534', fontWeight: 700 }}>
                        {r.budgetAllocated ? `रु. ${r.budgetAllocated.toLocaleString()}` : '-'}
                        {r.budgetSpent ? (
                          <small style={{ display: 'block', color: '#64748b', fontSize: '0.70rem', fontWeight: 500 }}>
                            खर्च: रु. {r.budgetSpent.toLocaleString()}
                          </small>
                        ) : null}
                      </td>

                      <td style={{ padding: '9px 12px', borderRight: '1px solid #e2e8f0' }}>
                        <div style={{ fontWeight: 600, color: '#1e293b' }}>{r.coordinatorName || '-'}</div>
                        {r.coordinatorPhone && (
                          <a
                            href={`tel:${r.coordinatorPhone}`}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                              color: '#0284c7',
                              fontSize: '0.74rem',
                              fontWeight: 700,
                              textDecoration: 'none',
                            }}
                          >
                            <Phone size={10} />
                            <span>{r.coordinatorPhone}</span>
                          </a>
                        )}
                      </td>

                      <td style={{ padding: '9px 10px', textAlign: 'center', borderRight: '1px solid #e2e8f0' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '0.70rem',
                            fontWeight: 700,
                            backgroundColor: r.status === 'completed' ? '#dcfce7' : r.status === 'ongoing' ? '#eff6ff' : '#f8fafc',
                            color: r.status === 'completed' ? '#15803d' : r.status === 'ongoing' ? '#1d4ed8' : '#475569',
                            border: `1px solid ${r.status === 'completed' ? '#bbf7d0' : r.status === 'ongoing' ? '#bfdbfe' : '#e2e8f0'}`,
                          }}
                        >
                          {r.status === 'completed' ? 'सम्पन्न' : r.status === 'ongoing' ? 'सञ्चालित' : 'नियमित'}
                        </span>
                      </td>

                      <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
                          <button
                            type="button"
                            onClick={() => {
                              setRecordToEdit(r);
                              setShowModal(true);
                            }}
                            title="सम्पादन गर्नुहोस्"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                              padding: '4px 8px',
                              borderRadius: '5px',
                              border: '1px solid #bae6fd',
                              backgroundColor: '#f0f9ff',
                              color: '#0284c7',
                              cursor: 'pointer',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                            }}
                          >
                            <Edit3 size={12} />
                            <span>सम्पादन</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(r)}
                            title="हटाउनुहोस्"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              padding: '4px 6px',
                              borderRadius: '5px',
                              border: '1px solid #fecaca',
                              backgroundColor: '#fef2f2',
                              color: '#dc2626',
                              cursor: 'pointer',
                            }}
                          >
                            <Trash2 size={12} />
                          </button>
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

      {/* ─── MODALS ─── */}
      <SocialInclusionModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setRecordToEdit(null);
        }}
        recordToEdit={recordToEdit}
        defaultCategory={activeTab}
        onSave={(data) => saveMutation.mutateAsync(data)}
        isSubmitting={saveMutation.isPending}
      />

      <SocialInclusionExcelModal
        isOpen={showExcelModal}
        onClose={() => setShowExcelModal(false)}
        initialTab={activeTab}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['social-inclusion-records'] });
          queryClient.invalidateQueries({ queryKey: ['social-inclusion-stats'] });
        }}
      />
    </div>
  );
};

export default SocialInclusionPage;
