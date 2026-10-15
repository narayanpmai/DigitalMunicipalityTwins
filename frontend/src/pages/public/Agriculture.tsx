import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Sprout,
  BarChart,
  MapPin,
  Database,
  TrendingUp,
  CloudLightning,
  Bug,
  ShieldAlert,
  Info,
  Volume2,
  Square,
  Loader2,
  Search,
  CheckCircle2,
  FileBadge,
  Map,
  Users,
  Store,
  Calendar,
  Phone,
  Printer,
  Award,
  CreditCard,
  Pill,
  Syringe,
  AlertTriangle,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import {
  agricultureApi,
  AgricultureFarmer,
  SoilHealthCardData,
  VetMedicine,
} from '../../api/agriculture';
import { FarmerDigitalIdModal } from '../../features/agriculture/components/FarmerDigitalIdModal';

export const Agriculture: React.FC = () => {
  const [searchParams] = useSearchParams();
  const verifyParam = searchParams.get('verify') || searchParams.get('farmerId');

  // TTS Audio States
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  // Price search & category filter
  const [priceSearch, setPriceSearch] = useState('');
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>('all');

  // Soil Card Lookup States
  const [farmerSearchId, setFarmerSearchId] = useState(verifyParam || '');
  const [searchedFarmer, setSearchedFarmer] = useState<AgricultureFarmer | null>(null);
  const [lookupError, setLookupError] = useState('');
  const [isIdModalOpen, setIsIdModalOpen] = useState(false);

  // Livestock Hub Sub-tab
  const [livestockSubTab, setLivestockSubTab] = useState<'vaccine' | 'medicine' | 'contacts'>('vaccine');

  // Queries
  const { data: prices = [], isLoading: loadingPrices } = useQuery({
    queryKey: ['public-market-prices'],
    queryFn: () => agricultureApi.getMarketPrices(),
  });

  const { data: advisories = [], isLoading: loadingAdvisories } = useQuery({
    queryKey: ['public-advisories'],
    queryFn: () => agricultureApi.getAdvisories(true), // activeOnly = true
  });

  const { data: summary } = useQuery({
    queryKey: ['public-farmer-summary'],
    queryFn: () => agricultureApi.getFarmerSummary(),
  });

  const { data: allFarmers = [] } = useQuery({
    queryKey: ['public-farmers-lookup'],
    queryFn: () => agricultureApi.getFarmers(),
  });

  const { data: medicines = [], isLoading: loadingMeds } = useQuery({
    queryKey: ['public-vet-medicines'],
    queryFn: () => agricultureApi.getMedicines(),
  });

  // Handle URL verify parameter automatically
  useEffect(() => {
    if (verifyParam && allFarmers.length > 0) {
      const term = verifyParam.trim().toLowerCase();
      const match = allFarmers.find(
        (f) =>
          f.farmerId.toLowerCase() === term ||
          (f.contactPhone && f.contactPhone.toLowerCase().includes(term)) ||
          f.fullName.toLowerCase().includes(term)
      );
      if (match) {
        setSearchedFarmer(match);
        setIsIdModalOpen(true);
      }
    }
  }, [verifyParam, allFarmers]);

  const stopAudio = () => {
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const handlePlayAudio = async () => {
    if (isPlaying) {
      stopAudio();
      return;
    }

    try {
      setIsGeneratingAudio(true);
      const itemsCount = prices.length || 12;
      const advCount = advisories.length || 4;
      const text = `नमस्कार! पाँचपोखरी थाङपाल गाउँपालिका कृषि तथा पशुपन्छी पोर्टलमा स्वागत छ। आजको बजार भाउमा भोताङे रातो आलु, किबी फल, ट्राउट माछा, लप्सी, र दूध सहित कुल ${itemsCount} वटा वस्तुहरूको दरभाउ प्रकाशित गरिएको छ। पालिकाभित्र ${advCount} वटा मौसमी तथा रोगकिरा नियन्त्रण परामर्शहरू सक्रिय छन्। किसानहरूले आफ्नो कृषक नम्बर हानेर डिजिटल माटो स्वास्थ्य कार्ड हेर्न सक्नुहुन्छ। धन्यवाद!`;

      const blob = await agricultureApi.generateSpeech(text);
      const url = URL.createObjectURL(blob);
      const newAudio = new Audio(url);

      newAudio.onended = () => {
        setIsPlaying(false);
      };

      setAudio(newAudio);
      newAudio.play();
      setIsPlaying(true);
    } catch (error) {
      console.error('TTS Error:', error);
      alert('अडियो बनाउन समस्या भयो, कृपया केही बेरपछि प्रयास गर्नुहोस्।');
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  // Farmer Soil Card Search Handler
  const handleFarmerLookup = (e?: React.FormEvent, customTerm?: string) => {
    if (e) e.preventDefault();
    setLookupError('');
    setSearchedFarmer(null);

    const term = (customTerm || farmerSearchId).trim().toLowerCase();
    if (!term) return;

    const match = allFarmers.find(
      (f) =>
        f.farmerId.toLowerCase() === term ||
        (f.contactPhone && f.contactPhone.toLowerCase().includes(term)) ||
        f.fullName.toLowerCase().includes(term)
    );

    if (match) {
      setSearchedFarmer(match);
      if (customTerm) setFarmerSearchId(customTerm);
    } else {
      setLookupError(
        'उक्त कृषक नम्बर वा फोन नम्बर भएको किसान फेला परेन। कृपया आफ्नो आधिकारिक कृषक आइडी (जस्तै: KMP-2081-001) वा दर्ता फोन नम्बर जाँच गर्नुहोस्।'
      );
    }
  };

  const getAdvisoryStyles = (type: string) => {
    switch (type) {
      case 'weather':
        return {
          bg: '#fefce8',
          border: '#f59e0b',
          icon: <CloudLightning size={22} color="#d97706" />,
          titleColor: '#92400e',
          badgeText: 'मौसम पूर्वसूचना',
        };
      case 'pest_control':
        return {
          bg: '#fef2f2',
          border: '#ef4444',
          icon: <Bug size={22} color="#dc2626" />,
          titleColor: '#991b1b',
          badgeText: 'रोगकिरा नियन्त्रण',
        };
      case 'crop_management':
        return {
          bg: '#f0fdf4',
          border: '#22c55e',
          icon: <Sprout size={22} color="#16a34a" />,
          titleColor: '#166534',
          badgeText: 'बाली व्यवस्थापन',
        };
      case 'livestock_health':
        return {
          bg: '#faf5ff',
          border: '#a855f7',
          icon: <ShieldAlert size={22} color="#9333ea" />,
          titleColor: '#6b21a8',
          badgeText: 'पशु स्वास्थ्य परामर्श',
        };
      default:
        return {
          bg: '#eff6ff',
          border: '#38bdf8',
          icon: <Info size={22} color="#0284c7" />,
          titleColor: '#075985',
          badgeText: 'सामान्य सूचना',
        };
    }
  };

  // Kalimati Wholesale Price & Profit Margin Comparison Helper
  const getKalimatiBenchmark = (itemName: string, localAvg: number, category: string) => {
    const name = itemName.toLowerCase();
    if (name.includes('आलु') || name.includes('potato')) {
      return { price: 68, margin: 36, isSpecial: true, tag: 'प्रसिद्ध हिमाली स्वाद' };
    }
    if (name.includes('किबी') || name.includes('kiwi')) {
      return { price: 340, margin: 36, isSpecial: true, tag: 'ए-ग्रेड अर्गानिक' };
    }
    if (name.includes('ट्राउट') || name.includes('trout')) {
      return { price: 1450, margin: 21, isSpecial: true, tag: 'हिमनदी चिसो पानी' };
    }
    if (name.includes('लप्सी') || name.includes('lapsi')) {
      return { price: 60, margin: 50, isSpecial: true, tag: 'परम्परागत क्यान्डी हब' };
    }
    if (name.includes('अलैंची') || name.includes('cardamom')) {
      return { price: 1800, margin: 20, isSpecial: true, tag: 'उच्च मूल्य नगदे बाली' };
    }
    if (name.includes('घ्यू') || name.includes('ghee')) {
      return { price: 1600, margin: 23, isSpecial: true, tag: 'शुद्ध हिमाली चौंरी/गाई' };
    }
    if (name.includes('अदुवा') || name.includes('ginger')) {
      return { price: 135, margin: 29, isSpecial: false, tag: '' };
    }
    if (name.includes('दूध') || name.includes('milk')) {
      return { price: 95, margin: 19, isSpecial: false, tag: '' };
    }
    if (name.includes('सिमी') || name.includes('beans')) {
      return { price: 160, margin: 28, isSpecial: false, tag: '' };
    }
    if (name.includes('गोलभेँडा') || name.includes('tomato')) {
      return { price: 70, margin: 21, isSpecial: false, tag: '' };
    }
    if (name.includes('काउली') || name.includes('cauliflower')) {
      return { price: 62, margin: 29, isSpecial: false, tag: '' };
    }
    if (name.includes('मासु') || name.includes('mutton')) {
      return { price: 1250, margin: 22, isSpecial: false, tag: '' };
    }

    const fallbackBenchmark = Math.round(localAvg * 1.25);
    return { price: fallbackBenchmark, margin: 25, isSpecial: false, tag: '' };
  };

  // Filtered prices based on search & tab
  const filteredPrices = prices.filter((p) => {
    const name = (p.item?.itemName || '').toLowerCase();
    const cat = (p.item?.category || '').toLowerCase();

    const matchesSearch =
      !priceSearch ||
      name.includes(priceSearch.toLowerCase()) ||
      cat.includes(priceSearch.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedCategoryTab === 'all') return true;
    if (selectedCategoryTab === 'vegetables') return cat.includes('तरकारी') || cat.includes('vegetable');
    if (selectedCategoryTab === 'fruits') return cat.includes('फलफूल') || cat.includes('fruit');
    if (selectedCategoryTab === 'cash_crop') return cat.includes('नगदे') || cat.includes('cash');
    if (selectedCategoryTab === 'fish_meat') return cat.includes('मत्स्य') || cat.includes('मासु') || cat.includes('meat') || cat.includes('fish');
    if (selectedCategoryTab === 'dairy') return cat.includes('दुग्ध') || cat.includes('dairy');

    return true;
  });

  const parseSoilData = (data: any): SoilHealthCardData | null => {
    if (!data) return null;
    if (typeof data === 'object') return data;
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  };

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '100%',
        margin: '0',
        padding: '1.5rem 0.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '2.25rem',
      }}
    >
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '1rem',
          borderBottom: '1px solid #e2e8f0',
          paddingBottom: '1.5rem',
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#ecfdf5',
              border: '1px solid #a7f3d0',
              color: '#065f46',
              padding: '3px 10px',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 700,
              marginBottom: '0.5rem',
            }}
          >
            <Sparkles size={14} color="#059669" />
            <span>पाँचपोखरी थाङपाल डिजिटल ट्विन कृषि तथा पशुपन्छी हब</span>
          </div>
          <h1
            style={{
              fontSize: '2.2rem',
              fontWeight: 800,
              color: '#0f172a',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              margin: 0,
            }}
          >
            <Sprout size={36} color="#16a34a" />
            कृषि तथा पशुपन्छी डिजिटल ट्विन पोर्टल
          </h1>
          <p
            style={{
              color: '#64748b',
              fontSize: '1rem',
              margin: '0.5rem 0 0',
              maxWidth: '800px',
            }}
          >
            दैनिक स्थानीय हाटबजार दरभाउ, काठमाडौं कालीमाटी थोक बजार तुलना, डिजिटल किसान परिचयपत्र,
            माटो स्वास्थ्य कार्ड, मौसमी खोप क्यालेन्डर र जीआईएस पकेट क्षेत्र पूर्वाधार
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handlePlayAudio}
            disabled={isGeneratingAudio}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.9rem',
              backgroundColor: isPlaying ? '#ef4444' : '#8b5cf6',
              color: '#ffffff',
              padding: '0.65rem 1.25rem',
              borderRadius: '10px',
              border: 'none',
              fontWeight: 700,
              cursor: isGeneratingAudio ? 'not-allowed' : 'pointer',
              boxShadow: isPlaying
                ? '0 3px 8px rgba(239, 68, 68, 0.3)'
                : '0 3px 8px rgba(139, 92, 246, 0.3)',
            }}
          >
            {isGeneratingAudio ? (
              <Loader2 size={18} className="dt-spin" />
            ) : isPlaying ? (
              <Square size={18} fill="currentColor" />
            ) : (
              <Volume2 size={18} />
            )}
            {isGeneratingAudio
              ? 'अडियो बन्दैछ...'
              : isPlaying
              ? 'रोक्नुहोस्'
              : '📢 दैनिक बजार अडियो'}
          </button>

          <a
            href="#farmer-id-lookup-section"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.9rem',
              backgroundColor: '#16a34a',
              color: '#ffffff',
              padding: '0.65rem 1.25rem',
              borderRadius: '10px',
              textDecoration: 'none',
              fontWeight: 700,
              boxShadow: '0 3px 8px rgba(22, 163, 74, 0.25)',
            }}
          >
            <CreditCard size={18} />
            <span>🪪 किसान परिचयपत्र खोज्नुहोस्</span>
          </a>

          <a
            href="/farmer-profile"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.9rem',
              backgroundColor: '#0284c7',
              color: '#ffffff',
              padding: '0.65rem 1.25rem',
              borderRadius: '10px',
              textDecoration: 'none',
              fontWeight: 700,
              boxShadow: '0 3px 8px rgba(2, 132, 199, 0.25)',
            }}
          >
            <span>👨‍🌾 कृषक प्रोफाइल तथा अनुदान</span>
          </a>

          <a
            href="/vet-medicine"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.9rem',
              backgroundColor: '#0d9488',
              color: '#ffffff',
              padding: '0.65rem 1.25rem',
              borderRadius: '10px',
              textDecoration: 'none',
              fontWeight: 700,
              boxShadow: '0 3px 8px rgba(13, 148, 136, 0.25)',
            }}
          >
            <span>💊 भेटेरिनरी व्यवस्थापन</span>
          </a>

          <a
            href="/agri-market"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.9rem',
              backgroundColor: '#ea580c',
              color: '#ffffff',
              padding: '0.65rem 1.25rem',
              borderRadius: '10px',
              textDecoration: 'none',
              fontWeight: 700,
              boxShadow: '0 3px 8px rgba(234, 88, 12, 0.25)',
            }}
          >
            <span>🏪 कृषि बजार मूल्य</span>
          </a>

          <a
            href="/agri-advisory"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.9rem',
              backgroundColor: '#7c3aed',
              color: '#ffffff',
              padding: '0.65rem 1.25rem',
              borderRadius: '10px',
              textDecoration: 'none',
              fontWeight: 700,
              boxShadow: '0 3px 8px rgba(124, 58, 237, 0.25)',
            }}
          >
            <span>🌾 कृषि सल्लाह/सूचना</span>
          </a>

          <a
            href="/gis-map?filter=agriculture"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.9rem',
              backgroundColor: '#ecfdf5',
              color: '#065f46',
              padding: '0.65rem 1.25rem',
              borderRadius: '10px',
              border: '1px solid #a7f3d0',
              fontWeight: 700,
              textDecoration: 'none',
              boxShadow: '0 2px 6px rgba(5, 150, 105, 0.15)',
            }}
          >
            <Map size={18} />
            <span>जीआईएस नक्सामा हेर्नुहोस्</span>
          </a>
        </div>
      </div>

      {/* Top Statistics Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
        }}
      >
        <div
          style={{
            backgroundColor: '#ffffff',
            padding: '1.35rem',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.04)',
            borderTop: '4px solid #16a34a',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              color: '#64748b',
              fontSize: '0.85rem',
            }}
          >
            <span>दर्ता भएका प्रमाणित कृषक</span>
            <Users size={20} color="#16a34a" />
          </div>
          <h2
            style={{
              fontSize: '2.1rem',
              fontWeight: 800,
              color: '#16a34a',
              margin: '0.5rem 0 0',
            }}
          >
            {summary?.totalRegisteredFarmers || allFarmers.length} जना
          </h2>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
            कुल खेती जग्गा: <strong>५६.५ रोपनी</strong>
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#ffffff',
            padding: '1.35rem',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.04)',
            borderTop: '4px solid #0284c7',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              color: '#64748b',
              fontSize: '0.85rem',
            }}
          >
            <span>दैनिक बजार दरभाउ वस्तुहरू</span>
            <Store size={20} color="#0284c7" />
          </div>
          <h2
            style={{
              fontSize: '2.1rem',
              fontWeight: 800,
              color: '#0284c7',
              margin: '0.5rem 0 0',
            }}
          >
            {prices.length || 12} वस्तु
          </h2>
          <div style={{ fontSize: '0.75rem', color: '#0369a1', marginTop: '4px' }}>
            कालीमाटी थोक बजार तुलनासहित
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#ffffff',
            padding: '1.35rem',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.04)',
            borderTop: '4px solid #9333ea',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              color: '#64748b',
              fontSize: '0.85rem',
            }}
          >
            <span>जारी माटो स्वास्थ्य कार्ड</span>
            <FileBadge size={20} color="#9333ea" />
          </div>
          <h2
            style={{
              fontSize: '2.1rem',
              fontWeight: 800,
              color: '#9333ea',
              margin: '0.5rem 0 0',
            }}
          >
            {summary?.soilHealthCardsIssued || 6} थान
          </h2>
          <div style={{ fontSize: '0.75rem', color: '#7e22ce', marginTop: '4px' }}>
            pH र N-P-K मलखाद सिफारिससहित
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#ffffff',
            padding: '1.35rem',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.04)',
            borderTop: '4px solid #d97706',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              color: '#64748b',
              fontSize: '0.85rem',
            }}
          >
            <span>अनुदानित पशुरोग औषधि मौज्दात</span>
            <Pill size={20} color="#d97706" />
          </div>
          <h2
            style={{
              fontSize: '2.1rem',
              fontWeight: 800,
              color: '#d97706',
              margin: '0.5rem 0 0',
            }}
          >
            {medicines.length || 8} प्रकार
          </h2>
          <div style={{ fontSize: '0.75rem', color: '#b45309', marginTop: '4px' }}>
            FMD / PPR खोप र भिटामिन उपलब्ध
          </div>
        </div>
      </div>

      {/* Advisories Section */}
      {!loadingAdvisories && advisories.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.5rem',
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: '1.3rem',
                fontWeight: 800,
                color: '#0f172a',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <CloudLightning size={24} color="#d97706" />
              मौसम पूर्वसूचना तथा प्राविधिक सल्लाह बुलेटिन
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
              कृषि विकास शाखा, पाँचपोखरी थाङपाल
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '1rem',
            }}
          >
            {advisories.map((advisory) => {
              const styles = getAdvisoryStyles(advisory.advisoryType);
              return (
                <div
                  key={advisory.id}
                  style={{
                    backgroundColor: styles.bg,
                    borderLeft: `5px solid ${styles.border}`,
                    borderRadius: '10px',
                    padding: '1.25rem',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '0.5rem',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: styles.titleColor,
                          background: 'rgba(255,255,255,0.85)',
                          padding: '2px 8px',
                          borderRadius: '9999px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        {styles.icon} {styles.badgeText}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {advisory.issuedDate
                          ? new Date(advisory.issuedDate).toLocaleDateString('ne-NP')
                          : '-'}
                      </span>
                    </div>
                    <h4
                      style={{
                        margin: '0 0 0.5rem',
                        fontSize: '1.05rem',
                        fontWeight: 700,
                        color: styles.titleColor,
                      }}
                    >
                      {advisory.title}
                    </h4>
                    <p
                      style={{
                        margin: 0,
                        fontSize: '0.875rem',
                        color: '#334155',
                        lineHeight: 1.5,
                        whiteSpace: 'pre-line',
                      }}
                    >
                      {advisory.content}
                    </p>
                  </div>
                  <div
                    style={{
                      borderTop: '1px solid rgba(0,0,0,0.06)',
                      paddingTop: '0.5rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.75rem',
                      color: '#64748b',
                    }}
                  >
                    <span>🏛️ {advisory.issuedBy || 'कृषि शाखा'}</span>
                    {advisory.validUntil && (
                      <span style={{ color: '#b45309', fontWeight: 600 }}>
                        मान्य: {new Date(advisory.validUntil).toLocaleDateString('ne-NP')} सम्म
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= CITIZEN FARMER ID & SOIL HEALTH CARD SECTION ================= */}
      <div
        id="farmer-id-lookup-section"
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '2rem',
          boxShadow: '0 6px 16px rgba(0,0,0,0.06)',
          border: '1px solid #e2e8f0',
          borderLeft: '6px solid #16a34a',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '1.25rem',
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#ecfdf5',
                color: '#15803d',
                padding: '2px 8px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 700,
                marginBottom: '4px',
              }}
            >
              <Award size={14} /> ई-किसान डिजिटल प्रमाणीकरण सेवा
            </div>
            <h3
              style={{
                margin: 0,
                fontSize: '1.4rem',
                fontWeight: 800,
                color: '#0f172a',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <CreditCard size={26} color="#16a34a" />
              आफ्नो डिजिटल किसान परिचयपत्र तथा माटो कार्ड खोज्नुहोस्
            </h3>
            <p style={{ margin: '6px 0 0', fontSize: '0.88rem', color: '#64748b' }}>
              गाउँपालिकाद्वारा जारी आधिकारिक कृषक नम्बर (उदा: <strong>KMP-2081-001</strong>), सम्पर्क
              फोन वा नाम हानेर आधिकारिक परिचयपत्र हेर्नुहोस् र प्रिन्ट गर्नुहोस्।
            </p>
          </div>
        </div>

        {/* Quick Sample Chips for Ease of Access */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            flexWrap: 'wrap',
            marginBottom: '1rem',
            fontSize: '0.8rem',
            color: '#64748b',
          }}
        >
          <span>द्रुत नमुना परीक्षण:</span>
          {[
            { label: 'दावा साङ्गे शेर्पा (भोताङ)', id: 'KMP-2081-001' },
            { label: 'शान्ति माया तामाङ (बाँसखर्क)', id: 'KMP-2081-002' },
            { label: 'हरि प्रसाद न्यौपाने (थाङपालधाप)', id: 'KMP-2081-003' },
          ].map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => handleFarmerLookup(undefined, s.id)}
              style={{
                backgroundColor: '#f1f5f9',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                padding: '3px 10px',
                fontSize: '0.78rem',
                fontWeight: 600,
                color: '#334155',
                cursor: 'pointer',
              }}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <form
          onSubmit={(e) => handleFarmerLookup(e)}
          style={{
            display: 'flex',
            gap: '0.75rem',
            flexWrap: 'wrap',
            maxWidth: '650px',
            marginBottom: '1rem',
          }}
        >
          <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8',
              }}
            />
            <input
              type="text"
              placeholder="कृषक नम्बर, फोन नम्बर वा नाम टाइप गर्नुहोस्..."
              value={farmerSearchId}
              onChange={(e) => setFarmerSearchId(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem 0.75rem 2.5rem',
                borderRadius: '10px',
                border: '1.5px solid #cbd5e1',
                fontSize: '0.95rem',
                outline: 'none',
              }}
            />
          </div>
          <button
            type="submit"
            style={{
              backgroundColor: '#16a34a',
              color: '#ffffff',
              padding: '0.75rem 1.5rem',
              borderRadius: '10px',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(22, 163, 74, 0.3)',
            }}
          >
            कार्ड खोज्नुहोस्
          </button>
        </form>

        {lookupError && (
          <div
            style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#991b1b',
              padding: '0.85rem 1.25rem',
              borderRadius: '8px',
              fontSize: '0.88rem',
            }}
          >
            {lookupError}
          </div>
        )}

        {/* Farmer Matched Preview Card */}
        {searchedFarmer && (
          <div
            style={{
              backgroundColor: '#f0fdf4',
              border: '2px solid #86efac',
              borderRadius: '12px',
              padding: '1.5rem',
              marginTop: '1rem',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: '1rem',
                borderBottom: '1px solid #bbf7d0',
                paddingBottom: '1rem',
                marginBottom: '1rem',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h4
                    style={{
                      margin: 0,
                      fontSize: '1.35rem',
                      fontWeight: 800,
                      color: '#14532d',
                    }}
                  >
                    {searchedFarmer.fullName}
                  </h4>
                  <span
                    style={{
                      backgroundColor: '#16a34a',
                      color: '#ffffff',
                      padding: '2px 8px',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                    }}
                  >
                    प्रमाणित कृषक
                  </span>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#166534', marginTop: '4px' }}>
                  कृषक नं: <strong>{searchedFarmer.farmerId}</strong> | वडा नं.{' '}
                  {searchedFarmer.wardNumber}, {searchedFarmer.toleVillage || 'पाँचपोखरी'} | सम्पर्क:{' '}
                  <strong>{searchedFarmer.contactPhone || '-'}</strong>
                </div>
              </div>

              {/* Print Official ID Button */}
              <button
                type="button"
                onClick={() => setIsIdModalOpen(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#15803d',
                  color: '#ffffff',
                  padding: '0.65rem 1.4rem',
                  borderRadius: '10px',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  boxShadow: '0 3px 10px rgba(21, 128, 61, 0.3)',
                }}
              >
                <Printer size={18} />
                <span>🪪 डिजिटल परिचयपत्र हेर्नुहोस् र प्रिन्ट गर्नुहोस्</span>
              </button>
            </div>

            {/* Quick Overview Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                marginBottom: '1rem',
              }}
            >
              <div
                style={{
                  backgroundColor: '#ffffff',
                  padding: '0.85rem',
                  borderRadius: '8px',
                  border: '1px solid #bbf7d0',
                }}
              >
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>किसान वर्ग</div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                  {searchedFarmer.farmerCategory}
                </div>
              </div>

              <div
                style={{
                  backgroundColor: '#ffffff',
                  padding: '0.85rem',
                  borderRadius: '8px',
                  border: '1px solid #bbf7d0',
                }}
              >
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>खेती गरिएको जग्गा</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#16a34a' }}>
                  {searchedFarmer.landAreaRopani} रोपनी
                </div>
              </div>

              <div
                style={{
                  backgroundColor: '#ffffff',
                  padding: '0.85rem',
                  borderRadius: '8px',
                  border: '1px solid #bbf7d0',
                }}
              >
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>मुख्य उत्पादित बाली</div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>
                  {searchedFarmer.majorCrops || '-'}
                </div>
              </div>

              <div
                style={{
                  backgroundColor: '#ffffff',
                  padding: '0.85rem',
                  borderRadius: '8px',
                  border: '1px solid #bbf7d0',
                }}
              >
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>पशुपन्छी संख्या</div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#92400e' }}>
                  {searchedFarmer.livestockDetails || '-'}
                </div>
              </div>
            </div>

            {/* Soil Health Card Section */}
            {searchedFarmer.soilHealthCard ? (
              (() => {
                const card = parseSoilData(searchedFarmer.soilHealthCard);
                if (!card) return null;
                return (
                  <div
                    style={{
                      backgroundColor: '#faf5ff',
                      border: '1px solid #e9d5ff',
                      borderRadius: '10px',
                      padding: '1rem',
                      marginTop: '0.5rem',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '0.5rem',
                      }}
                    >
                      <h5
                        style={{
                          margin: 0,
                          fontSize: '0.95rem',
                          fontWeight: 700,
                          color: '#6b21a8',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <FileBadge size={16} /> माटो परीक्षण कार्ड ({card.cardNo || 'जारी'})
                      </h5>
                      <span
                        style={{
                          backgroundColor: '#f3e8ff',
                          color: '#7e22ce',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                        }}
                      >
                        स्थिति: {card.status}
                      </span>
                    </div>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
                        gap: '0.5rem',
                        marginBottom: '0.5rem',
                      }}
                    >
                      <div
                        style={{
                          backgroundColor: '#ffffff',
                          padding: '0.5rem',
                          borderRadius: '6px',
                          textAlign: 'center',
                          border: '1px solid #e9d5ff',
                        }}
                      >
                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>माटो pH</div>
                        <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                          {card.ph}
                        </div>
                      </div>
                      <div
                        style={{
                          backgroundColor: '#ffffff',
                          padding: '0.5rem',
                          borderRadius: '6px',
                          textAlign: 'center',
                          border: '1px solid #e9d5ff',
                        }}
                      >
                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>नाइट्रोजन (N)</div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#16a34a' }}>
                          {card.nitrogen}
                        </div>
                      </div>
                      <div
                        style={{
                          backgroundColor: '#ffffff',
                          padding: '0.5rem',
                          borderRadius: '6px',
                          textAlign: 'center',
                          border: '1px solid #e9d5ff',
                        }}
                      >
                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>फस्फोरस (P)</div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0284c7' }}>
                          {card.phosphorus}
                        </div>
                      </div>
                      <div
                        style={{
                          backgroundColor: '#ffffff',
                          padding: '0.5rem',
                          borderRadius: '6px',
                          textAlign: 'center',
                          border: '1px solid #e9d5ff',
                        }}
                      >
                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>पोटासियम (K)</div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#d97706' }}>
                          {card.potassium}
                        </div>
                      </div>
                      <div
                        style={{
                          backgroundColor: '#ffffff',
                          padding: '0.5rem',
                          borderRadius: '6px',
                          textAlign: 'center',
                          border: '1px solid #e9d5ff',
                        }}
                      >
                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>प्राङ्गारिक पदार्थ</div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#7e22ce' }}>
                          {card.organicMatter}
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        backgroundColor: '#fef3c7',
                        padding: '0.6rem 0.85rem',
                        borderRadius: '6px',
                        border: '1px solid #fde68a',
                        fontSize: '0.82rem',
                        color: '#92400e',
                      }}
                    >
                      <strong>💡 प्राविधिक सल्लाह:</strong> {card.advisory}
                    </div>
                  </div>
                );
              })()
            ) : (
              <div style={{ fontSize: '0.85rem', color: '#166534', marginTop: '0.5rem' }}>
                यो कृषकको माटो परीक्षण कार्ड शाखामा प्रक्रियामा छ।
              </div>
            )}
          </div>
        )}
      </div>

      {/* ================= TODAY'S MARKET PRICES & KALIMATI BENCHMARK ================= */}
      <div
        style={{
          backgroundColor: '#ffffff',
          padding: '2rem',
          borderRadius: '16px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '1.25rem',
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#f0fdf4',
                color: '#15803d',
                padding: '2px 8px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 700,
                marginBottom: '4px',
              }}
            >
              <TrendingUp size={14} /> दैनिक हाटबजार तथा उपज दरभाउ
            </div>
            <h3
              style={{
                margin: 0,
                fontSize: '1.45rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#0f172a',
              }}
            >
              आजको कृषि उपज दरभाउ तथा कालीमाटी थोक बजार तुलना
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#64748b' }}>
              पाँचपोखरीका प्रमुख हाटबजार/संकलन केन्द्रहरूको स्थानीय फार्मगेट मूल्य र काठमाडौं कालीमाटी
              थोक बजारको मूल्य तुलना
            </p>
          </div>

          <div style={{ position: 'relative', minWidth: '240px' }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8',
              }}
            />
            <input
              type="text"
              placeholder="वस्तु वा वर्ग खोज्नुहोस्..."
              value={priceSearch}
              onChange={(e) => setPriceSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '0.55rem 1rem 0.55rem 2.25rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.85rem',
              }}
            />
          </div>
        </div>

        {/* Commodity Category Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            flexWrap: 'wrap',
            marginBottom: '1.25rem',
            borderBottom: '1px solid #e2e8f0',
            paddingBottom: '0.75rem',
          }}
        >
          {[
            { key: 'all', label: 'सबै वस्तुहरू' },
            { key: 'vegetables', label: 'तरकारी (Vegetables)' },
            { key: 'fruits', label: 'फलफूल (Fruits)' },
            { key: 'cash_crop', label: 'नगदे बाली (Cash Crops)' },
            { key: 'fish_meat', label: 'मत्स्य तथा मासु (Fish & Meat)' },
            { key: 'dairy', label: 'दुग्धजन्य (Dairy)' },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setSelectedCategoryTab(tab.key)}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                backgroundColor:
                  selectedCategoryTab === tab.key ? '#16a34a' : '#f1f5f9',
                color: selectedCategoryTab === tab.key ? '#ffffff' : '#475569',
                transition: 'all 0.15s ease',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Price Table */}
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              minWidth: '100%',
              borderCollapse: 'collapse',
              textAlign: 'left',
              fontSize: '0.88rem',
            }}
          >
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#334155' }}>
                  वस्तुको नाम तथा पहिचान
                </th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#334155' }}>वर्ग</th>
                <th
                  style={{
                    padding: '0.75rem 1rem',
                    fontWeight: 700,
                    color: '#334155',
                    textAlign: 'center',
                  }}
                >
                  इकाई
                </th>
                <th
                  style={{
                    padding: '0.75rem 1rem',
                    fontWeight: 700,
                    color: '#047857',
                    textAlign: 'right',
                  }}
                >
                  पाँचपोखरी स्थानीय दर
                </th>
                <th
                  style={{
                    padding: '0.75rem 1rem',
                    fontWeight: 800,
                    color: '#0f172a',
                    textAlign: 'right',
                  }}
                >
                  स्थानीय औसत (रु.)
                </th>
                <th
                  style={{
                    padding: '0.75rem 1rem',
                    fontWeight: 800,
                    color: '#1d4ed8',
                    textAlign: 'right',
                  }}
                >
                  कालीमाटी थोक बेन्चमार्क
                </th>
                <th
                  style={{
                    padding: '0.75rem 1rem',
                    fontWeight: 800,
                    color: '#b45309',
                    textAlign: 'center',
                  }}
                >
                  बचत / अन्तर %
                </th>
                <th
                  style={{
                    padding: '0.75rem 1rem',
                    fontWeight: 700,
                    color: '#64748b',
                    textAlign: 'center',
                  }}
                >
                  प्रवृत्ति
                </th>
              </tr>
            </thead>
            <tbody>
              {loadingPrices ? (
                <tr>
                  <td colSpan={8} style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                    मूल्य सूची लोड हुँदैछ...
                  </td>
                </tr>
              ) : filteredPrices.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                    छानिएको वर्गमा कुनै मूल्य सूची फेला परेन।
                  </td>
                </tr>
              ) : (
                filteredPrices.map((price) => {
                  const avg = price.averagePrice || Math.round((price.minPrice + price.maxPrice) / 2);
                  const benchmark = getKalimatiBenchmark(
                    price.item?.itemName || '',
                    avg,
                    price.item?.category || ''
                  );

                  return (
                    <tr
                      key={price.id}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        backgroundColor: benchmark.isSpecial ? '#fcfdfa' : 'transparent',
                      }}
                    >
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontWeight: 700, color: '#0f172a' }}>
                            {price.item?.itemName}
                          </span>
                          {benchmark.isSpecial && (
                            <span
                              style={{
                                backgroundColor: '#fef3c7',
                                color: '#b45309',
                                border: '1px solid #fde68a',
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                padding: '1px 6px',
                                borderRadius: '4px',
                              }}
                            >
                              ⭐ पाँचपोखरी पहिचान
                            </span>
                          )}
                        </div>
                        {benchmark.tag && (
                          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                            {benchmark.tag}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', color: '#64748b' }}>
                        <span
                          style={{
                            padding: '2px 8px',
                            borderRadius: '4px',
                            backgroundColor: '#f1f5f9',
                          }}
                        >
                          {price.item?.category}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: '0.85rem 1rem',
                          fontSize: '0.85rem',
                          textAlign: 'center',
                          color: '#64748b',
                        }}
                      >
                        {price.item?.unit}
                      </td>
                      <td
                        style={{
                          padding: '0.85rem 1rem',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          color: '#047857',
                          textAlign: 'right',
                        }}
                      >
                        रु. {price.minPrice} – {price.maxPrice}
                      </td>
                      <td
                        style={{
                          padding: '0.85rem 1rem',
                          fontSize: '1rem',
                          fontWeight: 800,
                          color: '#0f172a',
                          textAlign: 'right',
                        }}
                      >
                        रु. {avg}
                      </td>
                      <td
                        style={{
                          padding: '0.85rem 1rem',
                          fontSize: '0.95rem',
                          fontWeight: 700,
                          color: '#1d4ed8',
                          textAlign: 'right',
                        }}
                      >
                        रु. {benchmark.price}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            backgroundColor: '#dcfce7',
                            color: '#15803d',
                            padding: '2px 8px',
                            borderRadius: '9999px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                          }}
                        >
                          +{benchmark.margin}% मार्जिन
                        </span>
                      </td>
                      <td
                        style={{
                          padding: '0.85rem 1rem',
                          fontSize: '0.8rem',
                          textAlign: 'center',
                          fontWeight: 700,
                          color: '#16a34a',
                        }}
                      >
                        📈 स्थिर/वृद्धि
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= LIVESTOCK CARE & VET VACCINATION HUB ================= */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '2rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '1.25rem',
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#faf5ff',
                color: '#7e22ce',
                padding: '2px 8px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 700,
                marginBottom: '4px',
              }}
            >
              <Syringe size={14} /> पशु स्वास्थ्य तथा निःशुल्क सेवा
            </div>
            <h3
              style={{
                margin: 0,
                fontSize: '1.45rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#0f172a',
              }}
            >
              पशुपन्छी स्वास्थ्य, मौसमी खोप क्यालेन्डर तथा औषधि सेवा हब
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#64748b' }}>
              चौंरी, गाईभैंसी, बाख्रा तथा पशुपन्छीका लागि पालिकास्तरीय निःशुल्क खोप तालिका, औषधि
              मौज्दात र आकस्मिक प्राविधिक सम्पर्क
            </p>
          </div>

          {/* Sub-tab switcher */}
          <div
            style={{
              display: 'flex',
              backgroundColor: '#f1f5f9',
              padding: '4px',
              borderRadius: '8px',
              gap: '4px',
            }}
          >
            <button
              type="button"
              onClick={() => setLivestockSubTab('vaccine')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                fontSize: '0.82rem',
                fontWeight: 700,
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: livestockSubTab === 'vaccine' ? '#ffffff' : 'transparent',
                color: livestockSubTab === 'vaccine' ? '#7e22ce' : '#64748b',
                boxShadow:
                  livestockSubTab === 'vaccine' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              <Syringe size={15} /> मौसमी खोप क्यालेन्डर
            </button>
            <button
              type="button"
              onClick={() => setLivestockSubTab('medicine')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                fontSize: '0.82rem',
                fontWeight: 700,
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: livestockSubTab === 'medicine' ? '#ffffff' : 'transparent',
                color: livestockSubTab === 'medicine' ? '#7e22ce' : '#64748b',
                boxShadow:
                  livestockSubTab === 'medicine' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              <Pill size={15} /> औषधि मौज्दात ({medicines.length})
            </button>
            <button
              type="button"
              onClick={() => setLivestockSubTab('contacts')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                fontSize: '0.82rem',
                fontWeight: 700,
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: livestockSubTab === 'contacts' ? '#ffffff' : 'transparent',
                color: livestockSubTab === 'contacts' ? '#7e22ce' : '#64748b',
                boxShadow:
                  livestockSubTab === 'contacts' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              <Phone size={15} /> वडा पशु प्राविधिक
            </button>
          </div>
        </div>

        {/* Tab 1: Seasonal Vaccination Calendar */}
        {livestockSubTab === 'vaccine' && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1rem',
            }}
          >
            {[
              {
                title: 'खोरेत रोग (FMD Vaccine)',
                target: 'गाई, भैंसी, चौंरी, याक',
                timing: 'फागुन–चैत र असोज–कार्तिक',
                frequency: 'वर्षमा २ पटक',
                fee: '१००% निःशुल्क',
                color: '#dc2626',
                bg: '#fef2f2',
                desc: 'मुख र खुरमा घाउ हुने, उच्च ज्वरो र दुध उत्पादन घट्ने प्राणघातक रोग विरुद्ध खोप।',
              },
              {
                title: 'पिपिआर खोप (PPR Goat Plague)',
                target: 'बाख्रा, खसी, भेडा',
                timing: 'माघ–फागुन (वार्षिक अभियान)',
                frequency: '३ वर्षमा १ पटक',
                fee: '१००% निःशुल्क',
                color: '#7e22ce',
                bg: '#faf5ff',
                desc: 'बाख्राको हैजा विरुद्ध राष्ट्रिय अभियान अन्तर्गत पालिकाका सबै वडामा सञ्चालन।',
              },
              {
                title: 'रेबिज खोप (Anti-Rabies)',
                target: 'घरपालुवा कुकुर, बिरालो, पशु',
                timing: 'वर्षभरी उपलब्ध',
                frequency: 'वार्षिक १ पटक',
                fee: 'निःशुल्क / अनुदानित',
                color: '#b45309',
                bg: '#fffbeb',
                desc: 'रेबिज संक्रमण रोकथामका लागि आकस्मिक तथा नियमित खोप सेवा।',
              },
              {
                title: 'नाम्ले र माटे (Deworming/Fluke)',
                target: 'गाई, भैँसी, बाख्रा, चौंरी',
                timing: 'जेठ (बर्खा अघि) र असोज (बर्खा पछि)',
                frequency: 'वर्षमा २ पटक',
                fee: 'निःशुल्क बोलस वितरण',
                color: '#047857',
                bg: '#ecfdf5',
                desc: 'अल्बेन्डाजोल र आइभरमेक्टिन प्रयोग गरी आन्तरिक परजीवी रोकथाम।',
              },
            ].map((vax, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: vax.bg,
                  border: `1px solid ${vax.color}30`,
                  borderLeft: `5px solid ${vax.color}`,
                  borderRadius: '10px',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '0.75rem',
                }}
              >
                <div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '4px',
                    }}
                  >
                    <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: vax.color }}>
                      {vax.title}
                    </h4>
                    <span
                      style={{
                        backgroundColor: '#ffffff',
                        color: vax.color,
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        border: `1px solid ${vax.color}40`,
                      }}
                    >
                      {vax.fee}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 600 }}>
                    लक्षित पशु: <strong>{vax.target}</strong>
                  </div>
                  <p style={{ margin: '8px 0 0', fontSize: '0.82rem', color: '#334155', lineHeight: 1.4 }}>
                    {vax.desc}
                  </p>
                </div>
                <div
                  style={{
                    borderTop: '1px solid rgba(0,0,0,0.06)',
                    paddingTop: '0.5rem',
                    fontSize: '0.75rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    color: '#64748b',
                  }}
                >
                  <span>📅 खोप समय: <strong>{vax.timing}</strong></span>
                  <span>{vax.frequency}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Medicine Inventory */}
        {livestockSubTab === 'medicine' && (
          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                minWidth: '100%',
                borderCollapse: 'collapse',
                textAlign: 'left',
                fontSize: '0.88rem',
              }}
            >
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#334155' }}>
                    औषधि / भ्याक्सिनको नाम
                  </th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#334155' }}>
                    ब्याच नम्बर
                  </th>
                  <th
                    style={{
                      padding: '0.75rem 1rem',
                      fontWeight: 700,
                      color: '#334155',
                      textAlign: 'center',
                    }}
                  >
                    इकाई
                  </th>
                  <th
                    style={{
                      padding: '0.75rem 1rem',
                      fontWeight: 700,
                      color: '#16a34a',
                      textAlign: 'right',
                    }}
                  >
                    हालको मौज्दात
                  </th>
                  <th
                    style={{
                      padding: '0.75rem 1rem',
                      fontWeight: 700,
                      color: '#334155',
                      textAlign: 'center',
                    }}
                  >
                    अवस्था
                  </th>
                  <th
                    style={{
                      padding: '0.75rem 1rem',
                      fontWeight: 700,
                      color: '#334155',
                      textAlign: 'center',
                    }}
                  >
                    सेवा शुल्क
                  </th>
                </tr>
              </thead>
              <tbody>
                {loadingMeds ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                      औषधि मौज्दात लोड हुँदैछ...
                    </td>
                  </tr>
                ) : medicines.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                      औषधि मौज्दात विवरण फेला परेन।
                    </td>
                  </tr>
                ) : (
                  medicines.map((med) => (
                    <tr key={med.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#0f172a' }}>
                        {med.medicineName}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontFamily: 'monospace', color: '#64748b' }}>
                        {med.batchNumber || '-'}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'center', color: '#64748b' }}>
                        {med.unit}
                      </td>
                      <td
                        style={{
                          padding: '0.85rem 1rem',
                          textAlign: 'right',
                          fontWeight: 800,
                          color: med.stockQuantity > 20 ? '#16a34a' : '#d97706',
                        }}
                      >
                        {med.stockQuantity} {med.unit}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                        <span
                          style={{
                            backgroundColor: '#dcfce7',
                            color: '#15803d',
                            padding: '2px 8px',
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                          }}
                        >
                          उपलब्ध
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                        <span
                          style={{
                            backgroundColor: '#ecfdf5',
                            color: '#065f46',
                            padding: '2px 8px',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                          }}
                        >
                          निःशुल्क / ५०% अनुदान
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Emergency Ward Contacts */}
        {livestockSubTab === 'contacts' && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1rem',
            }}
          >
            {[
              { ward: 'वडा ३, भोताङ', center: 'भोताङ पशु सेवा केन्द्र', phone: '९८४१२३८९१०', incharge: 'दावा साङ्गे शेर्पा' },
              { ward: 'वडा २, थाङपालकोट', center: 'थाङपालकोट पशु क्लिनिक', phone: '९८६०१२३४५६', incharge: 'पेम्बा दोर्जे तामाङ' },
              { ward: 'वडा ५, गुन्सा', center: 'गुन्सा पशु सेवा उपकेन्द्र', phone: '९८५११२२३३४', incharge: 'डा. सन्दीप अधिकारी' },
              { ward: 'वडा १, बाँसखर्क', center: 'बाँसखर्क पशु स्वास्थ्य इकाई', phone: '९८६०९८१२३४', incharge: 'शान्ति माया तामाङ' },
              { ward: 'वडा ६, थाङपालधाप', center: 'थाङपालधाप सेवा केन्द्र', phone: '९८४१५६७८९०', incharge: 'हरि प्रसाद न्यौपाने' },
              { ward: 'वडा ७, भोटेसिपा', center: 'भोटेसिपा पशु स्वास्थ्य डेस्क', phone: '९८४१७७८८९९', incharge: 'कृष्ण बहादुर श्रेष्ठ' },
              { ward: 'वडा ४, मानेखर्क', center: 'मानेखर्क भेटेरिनरी हब', phone: '९८४१००११२२', incharge: 'पशु विकास अधिकृत' },
              { ward: 'वडा ८, लाङटाङ', center: 'लाङटाङ पशु स्वास्थ्य इकाई', phone: '९८०१२३४८८८', incharge: 'सुजन लामा' },
            ].map((c, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '0.5rem',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#7e22ce' }}>
                    {c.ward}
                  </div>
                  <h5 style={{ margin: '3px 0', fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                    {c.center}
                  </h5>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    प्रभारी: {c.incharge}
                  </div>
                </div>
                <a
                  href={`tel:${c.phone.replace(/[^0-9]/g, '')}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    backgroundColor: '#16a34a',
                    color: '#ffffff',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                  }}
                >
                  <Phone size={14} /> {c.phone} (कल गर्नुहोस्)
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ================= AGRICULTURAL POCKET ZONES & GIS MAP ================= */}
      <div
        style={{
          backgroundColor: '#ffffff',
          padding: '2rem',
          borderRadius: '16px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.25rem',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#fef2f2',
                color: '#dc2626',
                padding: '2px 8px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 700,
                marginBottom: '4px',
              }}
            >
              <MapPin size={14} /> भौगोलिक पकेट क्षेत्र नक्सा
            </div>
            <h4
              style={{
                margin: 0,
                fontSize: '1.4rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#0f172a',
              }}
            >
              कृषि, फलफूल तथा पशुपन्छी पकेट क्षेत्रहरू
            </h4>
            <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#64748b' }}>
              विशेष भौगोलिक हावापानी अनुसार विकास गरिएका ८ वटा पकेट क्षेत्र, संकलन केन्द्र, शीत भण्डार र चिस्यान केन्द्रहरू
            </p>
          </div>
          <a
            href="/gis-map?filter=agriculture"
            style={{
              color: '#0284c7',
              fontSize: '0.9rem',
              fontWeight: 700,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#f0f9ff',
              padding: '6px 14px',
              borderRadius: '8px',
              border: '1px solid #bae6fd',
            }}
          >
            <span>जीआईएस नक्सामा सबै केन्द्रहरू हेर्नुहोस्</span> ➔
          </a>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1rem',
          }}
        >
          {[
            {
              id: 'agri-bhotang-hub',
              name: '🥔 प्रसिद्ध भोताङे रातो आलु पकेट',
              ward: 'वडा ३, ५',
              center: 'भोताङ कृषि संकलन केन्द्र',
              desc: 'उच्च हिमाली स्वादिलो आलु उत्पादन क्षेत्र (२,१५० मि. उचाइ)',
              status: '🟢 संकलन चालु',
            },
            {
              id: 'agri-thangpalkot-kiwi',
              name: '🥝 थाङपालकोट किबी फल पकेट',
              ward: 'वडा २, ६',
              center: 'थाङपालकोट फलफूल हब',
              desc: 'ए-ग्रेड किबी उत्पादन तथा प्याकेजिङ (१,९५० मि. उचाइ)',
              status: '🟢 संकलन चालु',
            },
            {
              id: 'agri-banskharka-lapsi',
              name: '🍏 बाँसखर्क लप्सी तथा सुन्तला पकेट',
              ward: 'वडा १, ८',
              center: 'बाँसखर्क प्रशोधन केन्द्र',
              desc: 'परम्परागत लप्सी क्यान्डी र सुन्तला बगैँचा (१,६५० मि.)',
              status: '🏭 प्रशोधन केन्द्र',
            },
            {
              id: 'agri-trout-farm',
              name: '🐟 मानेखर्क रेन्बो ट्राउट माछा पकेट',
              ward: 'वडा ४',
              center: 'मानेखर्क ट्राउट स्रोत केन्द्र',
              desc: 'चिसो हिमनदीको पानीमा पालिएको ट्राउट माछा फार्म (१,९८० मि.)',
              status: '🐟 ह्याचरी तथा फार्म',
            },
            {
              id: 'agri-gunsa-vet',
              name: '🌿 गुन्सा अर्गानिक अलैंची तथा पशु उपकेन्द्र',
              ward: 'वडा ५, ८',
              center: 'गुन्सा संकलन तथा पशु उपकेन्द्र',
              desc: 'उच्च मूल्य नगदे बाली तथा खोप सेवा (१,८२० मि.)',
              status: '💉 खोप तथा उपचार',
            },
            {
              id: 'agri-dairy-coop',
              name: '🌾 थाङपालधाप दुग्ध तथा खाद्यान्न टार',
              ward: 'वडा ४, ६, ७',
              center: 'थाङपालधाप दुग्ध सहकारी',
              desc: 'दैनिक ३,५०० लिटर क्षमताको दुग्ध चिस्यान केन्द्र (१,४२० मि.)',
              status: '❄️ चिस्यान केन्द्र',
            },
          ].map((pocket, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '1.15rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '0.75rem',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h5 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                    {pocket.name}
                  </h5>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      backgroundColor: '#e0f2fe',
                      color: '#0369a1',
                      padding: '2px 8px',
                      borderRadius: '9999px',
                    }}
                  >
                    {pocket.ward}
                  </span>
                </div>
                <p style={{ margin: '6px 0 0', fontSize: '0.82rem', color: '#64748b', lineHeight: 1.4 }}>
                  {pocket.desc}
                </p>
              </div>

              <div
                style={{
                  borderTop: '1px solid #e2e8f0',
                  paddingTop: '0.6rem',
                  fontSize: '0.78rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ color: '#059669', fontWeight: 700 }}>{pocket.status}</span>
                <a
                  href={`/gis-map?filter=agriculture`}
                  style={{
                    color: '#0284c7',
                    fontWeight: 700,
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px',
                  }}
                >
                  <span>नक्सामा हेर्नुहोस्</span> ➔
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Official Farmer Digital Identity Card Modal */}
      <FarmerDigitalIdModal
        farmer={searchedFarmer}
        isOpen={isIdModalOpen}
        onClose={() => setIsIdModalOpen(false)}
      />
    </div>
  );
};

export default Agriculture;
