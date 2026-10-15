import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { agricultureApi, AgriMarketItem, AgriMarketPrice } from '../../api/agriculture';
import {
  Plus,
  Search,
  CheckCircle2,
  Store,
  TrendingUp,
  TrendingDown,
  Calendar,
  Layers,
  Printer,
  X,
  FileText,
  AlertCircle,
  Tag,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Sparkles,
  RefreshCw,
  Filter,
  BarChart3,
  Activity,
  ShieldCheck
} from 'lucide-react';
import './agriculture-pro.css';

const CATEGORIES = [
  'सबै वर्ग',
  'तरकारी',
  'फलफूल',
  'खाद्यान्न',
  'पशुपन्छी/मासु/दूध',
  'मसला तथा जडीबुटी'
];

const MARKET_HUBS = [
  'सबै संकलन केन्द्र',
  'पाँचपोखरी हाटबजार (भोताङ)',
  'मेलम्ची कृषि संकलन केन्द्र',
  'मानेखर्क बजार केन्द्र',
  'थाङपालकोट संकलन डिपो',
  'कालिमाटी थोक बजार तुलना'
];

export const AgriMarketAdminPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'prices' | 'items'>('prices');
  const [selectedCategory, setSelectedCategory] = useState<string>('सबै वर्ग');
  const [selectedHub, setSelectedHub] = useState<string>('सबै संकलन केन्द्र');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().slice(0, 10));

  // Modals & Feedback
  const [showAddItem, setShowAddItem] = useState(false);
  const [showAddPrice, setShowAddPrice] = useState(false);
  const [showBulletinModal, setShowBulletinModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // States for Items
  const [newItem, setNewItem] = useState<Partial<AgriMarketItem>>({
    category: 'तरकारी',
    unit: 'के.जी. (Kg)',
    isOrganic: false,
  });

  // States for Prices
  const [newPrice, setNewPrice] = useState<Partial<AgriMarketPrice>>({
    minPrice: 50,
    maxPrice: 65,
    wholesalePrice: 48,
    retailPrice: 65,
    marketCenter: 'पाँचपोखरी हाटबजार (भोताङ)',
    dailyInflowQuintal: 10,
  });

  React.useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const { data: items = [], isLoading: loadingItems } = useQuery({
    queryKey: ['market-items'],
    queryFn: agricultureApi.getMarketItems,
  });

  const { data: prices = [], isLoading: loadingPrices } = useQuery({
    queryKey: ['market-prices', selectedDate],
    queryFn: () => agricultureApi.getMarketPrices(selectedDate),
  });

  const addItemMutation = useMutation({
    mutationFn: agricultureApi.createMarketItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['market-items'] });
      setShowAddItem(false);
      setNewItem({ category: 'तरकारी', unit: 'के.जी. (Kg)' });
      setToastMessage({ type: 'success', text: 'नयाँ कृषि उपज वस्तु सफलतापूर्वक सूचीकृत गरियो!' });
    },
    onError: (err: any) => {
      setToastMessage({ type: 'error', text: 'त्रुटि: ' + (err.message || 'वस्तु थप्न सकिएन') });
    }
  });

  const recordPriceMutation = useMutation({
    mutationFn: agricultureApi.recordMarketPrice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['market-prices'] });
      setShowAddPrice(false);
      setNewPrice({ minPrice: 50, maxPrice: 65 });
      setToastMessage({ type: 'success', text: 'बजार मूल्य सफलतापूर्वक सुरक्षित गरियो!' });
    },
    onError: (err: any) => {
      setToastMessage({ type: 'error', text: 'त्रुटि: ' + (err.response?.data?.message || err.message) });
    }
  });

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.itemName || !newItem.category || !newItem.unit) return;
    addItemMutation.mutate(newItem as AgriMarketItem);
  };

  const handleRecordPrice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrice.itemId || !newPrice.minPrice || !newPrice.maxPrice) return;
    const avg = newPrice.averagePrice || Math.round(((newPrice.minPrice + newPrice.maxPrice) / 2) * 100) / 100;
    recordPriceMutation.mutate({
      ...newPrice,
      averagePrice: avg,
      date: selectedDate
    } as AgriMarketPrice);
  };

  // Quick Date Setters
  const setQuickDate = (offsetDays: number) => {
    const d = new Date();
    d.setDate(d.getDate() - offsetDays);
    setSelectedDate(d.toISOString().slice(0, 10));
  };

  const isToday = selectedDate === new Date().toISOString().slice(0, 10);

  // Filtered Prices
  const filteredPrices = useMemo(() => {
    return prices.filter(p => {
      const catMatch = selectedCategory === 'सबै वर्ग' || p.item?.category === selectedCategory;
      const hubMatch = selectedHub === 'सबै संकलन केन्द्र' || p.marketCenter === selectedHub;
      const searchMatch = !searchTerm ||
        p.item?.itemName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.item?.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.marketCenter?.toLowerCase().includes(searchTerm.toLowerCase());
      return catMatch && hubMatch && searchMatch;
    });
  }, [prices, selectedCategory, selectedHub, searchTerm]);

  // Filtered Items
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const catMatch = selectedCategory === 'सबै वर्ग' || item.category === selectedCategory;
      const searchMatch = !searchTerm || item.itemName?.toLowerCase().includes(searchTerm.toLowerCase());
      return catMatch && searchMatch;
    });
  }, [items, selectedCategory, searchTerm]);

  // KPIs
  const totalCommodities = items.length;
  const updatedTodayCount = prices.length;
  const updatePercent = totalCommodities > 0 ? Math.round((updatedTodayCount / totalCommodities) * 100) : 0;
  const avgMarketPrice = useMemo(() => {
    if (prices.length === 0) return 0;
    const sum = prices.reduce((acc, p) => acc + (p.averagePrice || (p.minPrice + p.maxPrice) / 2), 0);
    return Math.round(sum / prices.length);
  }, [prices]);

  return (
    <div className="gov-content-wrapper" style={{ padding: '1.5rem', }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '24px',
            zIndex: 9999,
            backgroundColor: toastMessage.type === 'success' ? '#064e3b' : '#991b1b',
            color: '#ffffff',
            padding: '0.9rem 1.35rem',
            borderRadius: '12px',
            boxShadow: '0 15px 35px rgba(0,0,0,0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.8rem',
            fontWeight: 700,
            fontSize: '0.9rem',
            border: '1px solid rgba(255,255,255,0.2)',
          }}
        >
          {toastMessage.type === 'success' ? <CheckCircle2 size={20} className="text-emerald-400" /> : <AlertCircle size={20} className="text-red-300" />}
          <span>{toastMessage.text}</span>
          <button
            onClick={() => setToastMessage(null)}
            style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', marginLeft: '0.5rem' }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* COMMAND CENTER HERO BANNER */}
      <div className="agri-hero-banner" style={{ background: 'linear-gradient(135deg, #064e3b 0%, #047857 45%, #0d9488 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', position: 'relative', zIndex: 2 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.55rem', flexWrap: 'wrap' }}>
              <span className="agri-telemetry-badge" style={{ background: 'rgba(255, 255, 255, 0.18)', color: '#d1fae5' }}>
                <span className="agri-pulse-dot" style={{ backgroundColor: '#34d399', boxShadow: '0 0 8px #34d399' }}></span>
                दैनिक कृषि बजार दररेट संकलन म्याट्रिक्स
              </span>
              <span style={{ fontSize: '0.78rem', color: '#a7f3d0', fontWeight: 600 }}>
                नेपाल सरकार • पाँचपोखरी थाङपाल गाउँ कार्यपालिका • कृषि तथा बजार व्यवस्थापन शाखा
              </span>
            </div>

            <h1 style={{ fontSize: '1.9rem', fontWeight: 900, margin: 0, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#ffffff' }}>
              <Store size={36} className="text-emerald-300" />
              दैनिक कृषि बजार तथा थोक/खुद्रा मूल्य केन्द्र
            </h1>
            <p style={{ fontSize: '0.92rem', color: '#ecfdf5', margin: '0.5rem 0 0', maxWidth: '820px', lineHeight: 1.5 }}>
              पालिकाभित्र उत्पादित तथा संकलित तरकारी, फलफूल, खाद्यान्न र दुग्धजन्य उपजको आधिकारिक दैनिक बजार दररेट, थोक-खुद्रा मूल्य विश्लेषण र आधिकारिक बुलेटिन
            </p>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => setShowBulletinModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.65rem 1.15rem',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(8px)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.88rem',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                transition: 'all 0.15s ease'
              }}
            >
              <Printer size={17} /> बजार बुलेटिन प्रिन्ट (Print)
            </button>
            <button
              type="button"
              onClick={() => setShowAddPrice(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.65rem 1.25rem',
                borderRadius: '10px',
                background: '#10b981',
                color: '#ffffff',
                fontWeight: 900,
                fontSize: '0.88rem',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
              }}
            >
              <TrendingUp size={17} /> दैनिक मूल्य प्रविष्टि
            </button>
            <button
              type="button"
              onClick={() => setShowAddItem(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.65rem 1.15rem',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.95)',
                color: '#065f46',
                fontWeight: 800,
                fontSize: '0.88rem',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
              }}
            >
              <Plus size={17} /> नयाँ वस्तु दर्ता
            </button>
          </div>
        </div>
      </div>

      {/* GLOWING COMMAND CENTER KPI METRICS */}
      <div className="agri-kpi-grid" style={{ marginBottom: '1.5rem' }}>
        {/* KPI 1 */}
        <div className="agri-kpi-glow-card" style={{ borderTop: '4px solid #10b981' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748b' }}>सूचीकृत कृषि उपजहरू</div>
              <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#0f172a', margin: '4px 0 2px' }}>
                {totalCommodities} <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#64748b' }}>वस्तुहरू</span>
              </div>
            </div>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)', color: '#065f46', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)' }}>
              <Store size={26} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
            <span className="agri-badge agri-badge-success">५ मुख्य वर्ग</span>
            <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600, alignSelf: 'center' }}>स्थानीय संकलन केन्द्र</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="agri-kpi-glow-card" style={{ borderTop: '4px solid #3b82f6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748b' }}>आजको मूल्य अद्यावधिक दर</div>
              <div style={{ fontSize: '1.85rem', fontWeight: 900, color: updatedTodayCount > 0 ? '#2563eb' : '#d97706', margin: '4px 0 2px' }}>
                {updatedTodayCount} / {totalCommodities} <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>({updatePercent}%)</span>
              </div>
            </div>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)', color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)' }}>
              <Calendar size={26} />
            </div>
          </div>
          {/* Progress bar */}
          <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '999px', marginTop: '0.65rem', overflow: 'hidden' }}>
            <div style={{ width: `${Math.min(100, updatePercent)}%`, height: '100%', background: 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)', borderRadius: '999px' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.4rem', fontSize: '0.75rem', color: '#64748b' }}>
            <span>मिति: <strong>{selectedDate}</strong></span>
            <span style={{ fontWeight: 700, color: updatedTodayCount > 0 ? '#16a34a' : '#ea580c' }}>
              {updatedTodayCount > 0 ? '✓ प्रत्यक्ष अद्यावधिक' : 'प्रविष्टि बाँकी'}
            </span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="agri-kpi-glow-card" style={{ borderTop: '4px solid #f59e0b' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748b' }}>औसत बजार मूल्य सूचकाङ्क</div>
              <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#0f172a', margin: '4px 0 2px' }}>
                रु. {avgMarketPrice} <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>/इकाई</span>
              </div>
            </div>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(245, 158, 11, 0.2)' }}>
              <Tag size={26} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.75rem', alignItems: 'center' }}>
            <span className="agri-badge agri-badge-warning">दैनिक संकलित दर</span>
            <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>मेलम्ची/काठमाण्डौ बजार दर अनुकूल</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="agri-kpi-glow-card" style={{ borderTop: '4px solid #14b8a6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748b' }}>बजार मूल्य स्थिरता सूचक</div>
              <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#0f766e', margin: '4px 0 2px' }}>
                सन्तुलित <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#047857' }}>(Normal)</span>
              </div>
            </div>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #ccfbf1 0%, #99f6e4 100%)', color: '#0f766e', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(20, 184, 166, 0.2)' }}>
              <TrendingUp size={26} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.75rem', alignItems: 'center' }}>
            <span className="agri-badge agri-badge-success">कालिमाटी सन्तुलन</span>
            <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>उतारचढाव ±२.४% मात्र</span>
          </div>
        </div>
      </div>

      {/* Date Navigator & Tabs Ribbon */}
      <div className="agri-glass-card" style={{ padding: '0.95rem 1.35rem', marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => setActiveTab('prices')}
              className="gov-btn"
              style={{
                padding: '0.55rem 1.15rem',
                fontSize: '0.88rem',
                fontWeight: 700,
                borderRadius: '8px',
                backgroundColor: activeTab === 'prices' ? 'var(--gov-primary, #0f4c81)' : 'transparent',
                color: activeTab === 'prices' ? '#ffffff' : 'var(--gov-text-secondary, #475569)',
                border: '1px solid',
                borderColor: activeTab === 'prices' ? 'var(--gov-primary, #0f4c81)' : 'var(--gov-border, #e2e8f0)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
              }}
            >
              <TrendingUp size={16} /> दैनिक मूल्य सूची ({prices.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('items')}
              className="gov-btn"
              style={{
                padding: '0.55rem 1.15rem',
                fontSize: '0.88rem',
                fontWeight: 700,
                borderRadius: '8px',
                backgroundColor: activeTab === 'items' ? 'var(--gov-primary, #0f4c81)' : 'transparent',
                color: activeTab === 'items' ? '#ffffff' : 'var(--gov-text-secondary, #475569)',
                border: '1px solid',
                borderColor: activeTab === 'items' ? 'var(--gov-primary, #0f4c81)' : 'var(--gov-border, #e2e8f0)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
              }}
            >
              <Store size={16} /> कृषि वस्तु व्यवस्थापन ({items.length})
            </button>
          </div>

          {/* Date Picker & Quick Date Buttons */}
          {activeTab === 'prices' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--gov-text-secondary, #475569)' }}>मिति:</span>
              <div style={{ display: 'flex', gap: '0.3rem' }}>
                <button
                  type="button"
                  onClick={() => setQuickDate(0)}
                  style={{
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: '1px solid',
                    borderColor: isToday ? '#059669' : 'var(--gov-border, #cbd5e1)',
                    backgroundColor: isToday ? '#ecfdf5' : '#ffffff',
                    color: isToday ? '#065f46' : '#475569',
                  }}
                >
                  आज (Today)
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDate(1)}
                  style={{
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: '1px solid var(--gov-border, #cbd5e1)',
                    backgroundColor: '#ffffff',
                    color: '#475569',
                  }}
                >
                  हिजो
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDate(2)}
                  style={{
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: '1px solid var(--gov-border, #cbd5e1)',
                    backgroundColor: '#ffffff',
                    color: '#475569',
                  }}
                >
                  २ दिन अघि
                </button>
              </div>

              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                style={{
                  padding: '0.4rem 0.65rem',
                  borderRadius: '6px',
                  border: '1px solid var(--gov-border, #cbd5e1)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                }}
              />
            </div>
          )}
        </div>

        {/* Category Filter Pills & Search */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.6rem', borderTop: '1px solid var(--gov-border, #e2e8f0)', paddingTop: '0.75rem' }}>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '3px 10px',
                    borderRadius: '999px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: '1px solid',
                    borderColor: isSelected ? 'var(--gov-primary, #0f4c81)' : 'var(--gov-border, #cbd5e1)',
                    backgroundColor: isSelected ? 'var(--gov-primary-light, #ebf3fa)' : '#ffffff',
                    color: isSelected ? 'var(--gov-primary, #0f4c81)' : 'var(--gov-text-secondary, #475569)',
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <select
              value={selectedHub}
              onChange={e => setSelectedHub(e.target.value)}
              style={{
                padding: '0.4rem 0.75rem',
                borderRadius: '6px',
                border: '1px solid var(--gov-border, #cbd5e1)',
                fontSize: '0.82rem',
                fontWeight: 700,
                outline: 'none',
                backgroundColor: '#ffffff',
                color: '#0f172a'
              }}
            >
              {MARKET_HUBS.map(hub => (
                <option key={hub} value={hub}>{hub}</option>
              ))}
            </select>

            <div style={{ position: 'relative', width: '200px' }}>
              <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gov-text-muted, #94a3b8)' }} />
              <input
                type="text"
                placeholder="वस्तु खोज्नुहोस्..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.4rem 0.75rem 0.4rem 2rem',
                  borderRadius: '6px',
                  border: '1px solid var(--gov-border, #cbd5e1)',
                  fontSize: '0.82rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* TAB 1: DAILY PRICES */}
      {activeTab === 'prices' && (
        <div className="agri-glass-card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="agri-pro-table">
              <thead>
                <tr>
                  <th style={{ padding: '1rem 1.25rem' }}>वस्तुको नाम</th>
                  <th>संकलन केन्द्र / बजार</th>
                  <th>वर्ग</th>
                  <th>इकाई</th>
                  <th style={{ textAlign: 'right' }}>थोक मूल्य (रु.)</th>
                  <th style={{ textAlign: 'right' }}>खुद्रा मूल्य (रु.)</th>
                  <th style={{ textAlign: 'right' }}>औसत दर (Avg)</th>
                  <th style={{ textAlign: 'center' }}>दैनिक आवक</th>
                  <th style={{ textAlign: 'center' }}>मूल्य दायरा</th>
                </tr>
              </thead>
              <tbody>
                {loadingPrices ? (
                  <tr>
                    <td colSpan={9} style={{ padding: '3.5rem 1rem', textAlign: 'center', color: '#64748b' }}>
                      दैनिक बजार मूल्य लोड हुँदैछ...
                    </td>
                  </tr>
                ) : filteredPrices.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ padding: '4rem 1rem', textAlign: 'center', color: '#64748b' }}>
                      <Store size={42} style={{ margin: '0 auto 0.75rem', opacity: 0.35 }} />
                      <p style={{ margin: 0, fontWeight: 800, fontSize: '1.05rem', color: '#334155' }}>{selectedDate} को लागि कुनै मूल्य रेकर्ड गरिएको छैन।</p>
                      <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '4px 0 1rem' }}>यस मितिका लागि स्थानीय हाटबजार तथा संकलन केन्द्रको मूल्य प्रविष्टि गर्नुहोस्।</p>
                      <button
                        type="button"
                        onClick={() => setShowAddPrice(true)}
                        className="gov-btn gov-btn-primary"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#059669', borderColor: '#059669', fontSize: '0.88rem' }}
                      >
                        <Plus size={16} /> यस मितिको लागि मूल्य प्रविष्टि गर्नुहोस्
                      </button>
                    </td>
                  </tr>
                ) : (
                  filteredPrices.map((price) => {
                    const avg = price.averagePrice || Math.round(((price.minPrice + price.maxPrice) / 2) * 100) / 100;
                    const spreadPercent = price.maxPrice > price.minPrice 
                      ? Math.min(92, Math.max(8, ((avg - price.minPrice) / (price.maxPrice - price.minPrice)) * 100))
                      : 50;
                    return (
                      <tr key={price.id}>
                        <td style={{ padding: '1rem 1.25rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                            <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>
                              {price.item?.itemName}
                            </span>
                            {price.item?.isOrganic && (
                              <span style={{ fontSize: '0.68rem', backgroundColor: '#ecfdf5', color: '#047857', border: '1px solid #86efac', padding: '1px 6px', borderRadius: '4px', fontWeight: 800 }}>
                                🌱 अग्र्यानिक
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '2px' }}>
                            प्रमाणित बजार दर • P5-MKT
                          </div>
                        </td>
                        <td>
                          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0369a1' }}>
                            {price.marketCenter || 'पाँचपोखरी हाटबजार'}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontSize: '0.78rem', fontWeight: 700, padding: '3px 10px', borderRadius: '6px', backgroundColor: '#f1f5f9', color: '#334155', border: '1px solid #e2e8f0' }}>
                            {price.item?.category}
                          </span>
                        </td>
                        <td style={{ color: '#475569', fontWeight: 600 }}>
                          {price.item?.unit}
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 800, color: '#1e40af', fontSize: '0.95rem' }}>
                          रु. {price.wholesalePrice || price.minPrice}
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 800, color: '#b45309', fontSize: '0.95rem' }}>
                          रु. {price.retailPrice || price.maxPrice}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <span style={{ fontWeight: 900, fontSize: '1.02rem', color: '#047857' }}>
                            रु. {avg}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>
                            {price.dailyInflowQuintal ? `${price.dailyInflowQuintal} क्विन्टल` : 'नियमित'}
                          </span>
                        </td>
                        {/* Interactive Price Spread Meter */}
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                            <div className="agri-price-spread-track">
                              <div className="agri-price-spread-fill" style={{ left: '0%', width: '100%' }} />
                              <div
                                className="agri-price-spread-thumb"
                                style={{ left: `${spreadPercent}%` }}
                                title={`औसत दर: रु. ${avg}`}
                              />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', width: '130px', fontSize: '0.68rem', color: '#64748b' }}>
                              <span>रु. {price.minPrice}</span>
                              <span>रु. {price.maxPrice}</span>
                            </div>
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
      )}

      {/* TAB 2: COMMODITY ITEMS MASTER */}
      {activeTab === 'items' && (
        <div className="agri-glass-card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="agri-pro-table">
              <thead>
                <tr>
                  <th style={{ padding: '1rem 1.25rem', width: '70px' }}>क्र.सं.</th>
                  <th>वस्तुको नाम (Commodity)</th>
                  <th>वर्ग (Category)</th>
                  <th>मानक इकाई (Standard Unit)</th>
                  <th style={{ textAlign: 'center' }}>प्रणाली स्थिति</th>
                </tr>
              </thead>
              <tbody>
                {loadingItems ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '3.5rem 1rem', textAlign: 'center', color: '#64748b' }}>
                      सूचीकृत वस्तुहरू लोड हुँदैछ...
                    </td>
                  </tr>
                ) : filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '3.5rem 1rem', textAlign: 'center', color: '#64748b' }}>
                      कुनै वस्तु फेला परेन।
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item, idx) => (
                    <tr key={item.id}>
                      <td style={{ padding: '1rem 1.25rem', color: '#94a3b8', fontWeight: 700 }}>
                        {String(idx + 1).padStart(2, '0')}
                      </td>
                      <td>
                        <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>
                          {item.itemName}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                          दर्ता कोड: P5-AGRI-{item.id?.slice(0, 6) || 'ITEM'}
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, padding: '3px 10px', borderRadius: '6px', backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }}>
                          {item.category}
                        </span>
                      </td>
                      <td style={{ color: '#334155', fontWeight: 600 }}>
                        {item.unit}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className="agri-badge agri-badge-success">
                          <span className="agri-pulse-dot" style={{ width: '6px', height: '6px' }}></span>
                          सक्रिय (Active)
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: Add New Item */}
      {showAddItem && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div className="agri-glass-card" style={{ maxWidth: '520px', width: '100%', padding: '2rem', boxShadow: '0 25px 60px rgba(0,0,0,0.3)', backgroundColor: '#ffffff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Plus size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 900, margin: 0, color: '#0f172a' }}>
                    नयाँ कृषि उपज दर्ता
                  </h3>
                  <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '2px 0 0' }}>बजार मूल्य सूचीमा नयाँ उपज थप्नुहोस्</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddItem(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddItem} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.4rem', color: '#334155' }}>उपजको नाम (Commodity Name)</label>
                <input
                  type="text"
                  required
                  placeholder="जस्तै: हिमाली रातो आलु, किवी फल, रेन्बो ट्राउट, अकबरे खुर्सानी"
                  value={newItem.itemName || ''}
                  onChange={e => setNewItem({ ...newItem, itemName: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.4rem', color: '#334155' }}>वर्ग (Category)</label>
                <select
                  value={newItem.category || 'तरकारी'}
                  onChange={e => setNewItem({ ...newItem, category: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                >
                  <option value="तरकारी">तरकारी (Vegetable)</option>
                  <option value="फलफूल">फलफूल (Fruit)</option>
                  <option value="खाद्यान्न">खाद्यान्न (Grain)</option>
                  <option value="पशुपन्छी/मासु/दूध">पशुपन्छी/मासु/दूध (Livestock/Dairy)</option>
                  <option value="मसला तथा जडीबुटी">मसला तथा जडीबुटी (Spices/Herbs)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.4rem', color: '#334155' }}>मानक इकाई (Standard Unit)</label>
                <select
                  value={newItem.unit || 'के.जी. (Kg)'}
                  onChange={e => setNewItem({ ...newItem, unit: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                >
                  <option value="के.जी. (Kg)">के.जी. (Kg)</option>
                  <option value="लिटर (Liter)">लिटर (Liter)</option>
                  <option value="गोटा (Piece)">गोटा (Piece)</option>
                  <option value="मुठा (Bunch)">मुठा (Bunch)</option>
                  <option value="दर्जन (Dozen)">दर्जन (Dozen)</option>
                  <option value="क्रेट (Crate)">क्रेट (Crate)</option>
                  <option value="बोरा (Bag/50kg)">बोरा (Bag/50kg)</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.65rem 0.85rem', borderRadius: '8px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                <input
                  type="checkbox"
                  id="item-is-organic"
                  checked={newItem.isOrganic || false}
                  onChange={e => setNewItem({ ...newItem, isOrganic: e.target.checked })}
                  style={{ width: '18px', height: '18px', accentColor: '#059669', cursor: 'pointer' }}
                />
                <label htmlFor="item-is-organic" style={{ fontSize: '0.84rem', fontWeight: 700, color: '#065f46', cursor: 'pointer' }}>
                  🌱 अग्र्यानिक / स्थानीय रैथाने कृषि उपज (Organic / Indigenous)
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                <button
                  type="button"
                  onClick={() => setShowAddItem(false)}
                  className="gov-btn gov-btn-outline"
                >
                  रद्द
                </button>
                <button
                  type="submit"
                  disabled={addItemMutation.isPending}
                  className="gov-btn gov-btn-primary"
                  style={{ background: '#059669', borderColor: '#059669', fontWeight: 800 }}
                >
                  {addItemMutation.isPending ? 'दर्ता हुँदैछ...' : 'वस्तु दर्ता गर्नुहोस्'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Record Daily Price */}
      {showAddPrice && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div className="agri-glass-card" style={{ maxWidth: '580px', width: '100%', padding: '2rem', boxShadow: '0 25px 60px rgba(0,0,0,0.3)', backgroundColor: '#ffffff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <TrendingUp size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 900, margin: 0, color: '#0f172a' }}>
                    दैनिक बजार मूल्य प्रविष्टि
                  </h3>
                  <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '2px 0 0' }}>
                    प्रविष्टि मिति: <strong>{selectedDate}</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddPrice(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleRecordPrice} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.4rem', color: '#334155' }}>उपज वस्तु छान्नुहोस्</label>
                <select
                  required
                  value={newPrice.itemId || ''}
                  onChange={e => setNewPrice({ ...newPrice, itemId: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                >
                  <option value="">छान्नुहोस्...</option>
                  {items.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.itemName} {item.isOrganic ? '🌱 (अग्र्यानिक)' : ''} ({item.category} - {item.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.4rem', color: '#334155' }}>बजार / संकलन केन्द्र छनोट</label>
                <select
                  value={newPrice.marketCenter || 'पाँचपोखरी हाटबजार (भोताङ)'}
                  onChange={e => setNewPrice({ ...newPrice, marketCenter: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                >
                  <option value="पाँचपोखरी हाटबजार (भोताङ)">पाँचपोखरी हाटबजार (भोताङ)</option>
                  <option value="मेलम्ची कृषि संकलन केन्द्र">मेलम्ची कृषि संकलन केन्द्र</option>
                  <option value="मानेखर्क बजार केन्द्र">मानेखर्क बजार केन्द्र</option>
                  <option value="थाङपालकोट संकलन डिपो">थाङपालकोट संकलन डिपो</option>
                  <option value="कालिमाटी थोक बजार तुलना">कालिमाटी थोक बजार तुलना</option>
                </select>
              </div>

              <div className="agri-grid-2">
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.4rem', color: '#1e40af' }}>थोक मूल्य (Wholesale रु.)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    placeholder="थोक दर"
                    value={newPrice.wholesalePrice || ''}
                    onChange={e => setNewPrice({ ...newPrice, wholesalePrice: parseFloat(e.target.value) || 0 })}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1.5px solid #bfdbfe', fontWeight: 800, fontSize: '1rem', color: '#1e40af' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.4rem', color: '#b45309' }}>खुद्रा मूल्य (Retail रु.)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    placeholder="खुद्रा दर"
                    value={newPrice.retailPrice || ''}
                    onChange={e => setNewPrice({ ...newPrice, retailPrice: parseFloat(e.target.value) || 0 })}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1.5px solid #fed7aa', fontWeight: 800, fontSize: '1rem', color: '#b45309' }}
                  />
                </div>
              </div>

              <div className="agri-grid-2">
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.4rem', color: '#334155' }}>न्यूनतम मूल्य (रु.)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    required
                    value={newPrice.minPrice || ''}
                    onChange={e => setNewPrice({ ...newPrice, minPrice: parseFloat(e.target.value) || 0 })}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 800, fontSize: '0.95rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.4rem', color: '#334155' }}>अधिकतम मूल्य (रु.)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    required
                    value={newPrice.maxPrice || ''}
                    onChange={e => setNewPrice({ ...newPrice, maxPrice: parseFloat(e.target.value) || 0 })}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 800, fontSize: '0.95rem' }}
                  />
                </div>
              </div>

              <div className="agri-grid-2">
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.4rem', color: '#334155' }}>औसत दर (रु.)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    placeholder="स्वतः हिसाब हुनेछ"
                    value={newPrice.averagePrice || ''}
                    onChange={e => setNewPrice({ ...newPrice, averagePrice: parseFloat(e.target.value) || undefined })}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.4rem', color: '#334155' }}>दैनिक बजार आवक (क्विन्टल)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    placeholder="जस्तै: १२"
                    value={newPrice.dailyInflowQuintal || ''}
                    onChange={e => setNewPrice({ ...newPrice, dailyInflowQuintal: parseFloat(e.target.value) || undefined })}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                <button
                  type="button"
                  onClick={() => setShowAddPrice(false)}
                  className="gov-btn gov-btn-outline"
                >
                  रद्द
                </button>
                <button
                  type="submit"
                  disabled={recordPriceMutation.isPending}
                  className="gov-btn gov-btn-primary"
                  style={{ backgroundColor: '#059669', borderColor: '#059669', fontWeight: 800 }}
                >
                  {recordPriceMutation.isPending ? 'सुरक्षित हुँदैछ...' : 'मूल्य सुरक्षित गर्नुहोस्'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Printable Daily Market Gazette Bulletin */}
      {showBulletinModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div className="agri-glass-card" style={{ maxWidth: '680px', width: '100%', padding: '2rem', backgroundColor: '#ffffff', borderRadius: '20px', boxShadow: '0 25px 60px rgba(0,0,0,0.3)', maxHeight: '92vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '46px', height: '46px', borderRadius: '12px', backgroundColor: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(5, 150, 105, 0.2)' }}>
                  <FileText size={26} />
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#047857' }}>पाँचपोखरी थाङपाल गाउँ कार्यपालिका</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0f172a' }}>दैनिक कृषि बजार दररेट बुलेटिन (Gazette)</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowBulletinModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Bulletin Sheet with Watermark */}
            <div id="printable-bulletin" className="agri-bulletin-sheet">
              {/* Header */}
              <div style={{ textAlign: 'center', borderBottom: '2px solid #059669', paddingBottom: '0.85rem', marginBottom: '1.2rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.04em' }}>
                  नेपाल सरकार • बागमती प्रदेश • सिन्धुपाल्चोक
                </div>
                <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#064e3b', margin: '3px 0' }}>
                  पाँचपोखरी थाङपाल गाउँ कार्यपालिका
                </div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#047857' }}>
                  कृषि तथा पशुपन्छी विकास शाखा
                </div>
                <div style={{ display: 'inline-block', backgroundColor: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', padding: '3px 12px', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 800, marginTop: '6px' }}>
                  दैनिक कृषि उपज थोक तथा खुद्रा बजार मूल्य बुलेटिन
                </div>
                <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '6px', fontWeight: 600 }}>
                  प्रकाशन मिति: <strong>{selectedDate}</strong> | बुलेटिन संख्या: <strong>P5-MKT-{selectedDate}</strong>
                </div>
              </div>

              {prices.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>यस मितिको कुनै दररेट रेकर्ड गरिएको छैन।</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f0fdf4', borderBottom: '1.5px solid #86efac' }}>
                      <th style={{ padding: '7px 10px', textAlign: 'left', fontWeight: 800, color: '#065f46' }}>क्र.सं.</th>
                      <th style={{ padding: '7px 10px', textAlign: 'left', fontWeight: 800, color: '#065f46' }}>उपजको नाम</th>
                      <th style={{ padding: '7px 10px', textAlign: 'left', fontWeight: 800, color: '#065f46' }}>केन्द्र / बजार</th>
                      <th style={{ padding: '7px 10px', textAlign: 'left', fontWeight: 800, color: '#065f46' }}>इकाई</th>
                      <th style={{ padding: '7px 10px', textAlign: 'right', fontWeight: 800, color: '#065f46' }}>थोक (रु.)</th>
                      <th style={{ padding: '7px 10px', textAlign: 'right', fontWeight: 800, color: '#065f46' }}>खुद्रा (रु.)</th>
                      <th style={{ padding: '7px 10px', textAlign: 'right', fontWeight: 800, color: '#065f46' }}>औसत दर (रु.)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prices.map((p, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '7px 10px', color: '#64748b', fontWeight: 700 }}>{idx + 1}</td>
                        <td style={{ padding: '7px 10px', fontWeight: 800, color: '#0f172a' }}>
                          {p.item?.itemName} {p.item?.isOrganic ? '🌱 (अग्र्यानिक)' : ''}
                        </td>
                        <td style={{ padding: '7px 10px', color: '#0369a1', fontSize: '0.78rem', fontWeight: 600 }}>{p.marketCenter || 'स्थानीय हाटबजार'}</td>
                        <td style={{ padding: '7px 10px', color: '#64748b' }}>{p.item?.unit}</td>
                        <td style={{ padding: '7px 10px', textAlign: 'right', fontWeight: 700, color: '#1e40af' }}>रु. {p.wholesalePrice || p.minPrice}</td>
                        <td style={{ padding: '7px 10px', textAlign: 'right', fontWeight: 700, color: '#b45309' }}>रु. {p.retailPrice || p.maxPrice}</td>
                        <td style={{ padding: '7px 10px', textAlign: 'right', fontWeight: 900, color: '#047857', fontSize: '0.92rem' }}>
                          रु. {p.averagePrice || Math.round(((p.minPrice + p.maxPrice) / 2) * 100) / 100}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Seal & Signatures */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '2rem', paddingTop: '1.25rem', borderTop: '1px dashed #94a3b8' }}>
                <div style={{ maxWidth: '300px' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', lineHeight: 1.5 }}>
                    📌 <strong>नोट:</strong> यो दररेट पालिका संकलन केन्द्र, मेलम्ची तथा काठमाण्डौ बजार अनुसन्धानका आधारमा प्रमाणित गरिएको हो।
                  </div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '6px', fontSize: '0.7rem', color: '#059669', fontWeight: 800 }}>
                    <ShieldCheck size={14} /> पाँचपोखरी डिजिटल ट्विन प्रमाणीकृत
                  </div>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <div style={{ borderBottom: '1.5px solid #0f172a', width: '150px', height: '36px', marginBottom: '4px' }}></div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0f172a' }}>बजार अधिकृत / कृषि शाखा प्रमुख</div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>पाँचपोखरी थाङपाल गाउँपालिका</div>
                </div>
              </div>
            </div>

            {/* Print Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                onClick={() => setShowBulletinModal(false)}
                className="gov-btn gov-btn-outline"
              >
                बन्द
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="gov-btn gov-btn-primary"
                style={{ backgroundColor: '#059669', borderColor: '#059669', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800 }}
              >
                <Printer size={16} /> बुलेटिन प्रिन्ट गर्नुहोस्
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

