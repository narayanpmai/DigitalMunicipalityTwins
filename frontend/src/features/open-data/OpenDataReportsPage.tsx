import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sectoralApi } from '../../api/sectoral';
import {
  Database,
  FileText,
  Compass,
  Award,
  Download,
  FileSpreadsheet,
  Layers,
  Calendar,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  RefreshCw,
  Building,
  Target,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Hash,
  Eye,
  ShieldCheck,
  Terminal,
  FileQuestion,
  Globe,
  X,
  Shield,
  Activity
} from 'lucide-react';
import type { OpenDataRecord, OpenDataCategory, OpenDataStats } from '../../types/open-data';
import { useTenant } from '../../context/TenantContext';
import { OpenDataModal } from './components/OpenDataModal';
import { OpenDataExcelModal } from './components/OpenDataExcelModal';
import { DatasetPreviewModal } from './components/DatasetPreviewModal';
import { MunicipalIndicatorsView } from './components/MunicipalIndicatorsView';
import { PublicTransparencyView } from './components/PublicTransparencyView';
import { SystemPublicationsView } from './components/SystemPublicationsView';
import { CitizenDataRequestsView } from './components/CitizenDataRequestsView';
import { DeveloperApiView } from './components/DeveloperApiView';
import './OpenDataReportsPage.css';

export interface OpenDataReportsPageProps {
  isReadOnly?: boolean;
}

export type PrimaryModuleTab =
  | 'catalog'
  | 'indicators'
  | 'transparency'
  | 'publications'
  | 'requests'
  | 'developer_api';

export const OpenDataReportsPage: React.FC<OpenDataReportsPageProps> = ({ isReadOnly = false }) => {
  const { settings } = useTenant();
  const location = useLocation();
  const isAdmin = !isReadOnly && location.pathname.startsWith('/app');
  const queryClient = useQueryClient();

  // Primary Tab state
  const [primaryTab, setPrimaryTab] = useState<PrimaryModuleTab>('catalog');

  // Sub-category state for Catalog tab
  const [activeTab, setActiveTab] = useState<OpenDataCategory>('datasets');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFiscalYear, setSelectedFiscalYear] = useState<string>('all');
  const [selectedWard, setSelectedWard] = useState<number>(0);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [recordToEdit, setRecordToEdit] = useState<OpenDataRecord | null>(null);
  const [recordToDelete, setRecordToDelete] = useState<OpenDataRecord | null>(null);
  const [selectedPreviewRecord, setSelectedPreviewRecord] = useState<OpenDataRecord | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Queries
  const { data: stats, refetch: refetchStats, isFetching: isStatsFetching } = useQuery<OpenDataStats>({
    queryKey: ['open-data-stats'],
    queryFn: () => sectoralApi.getOpenDataStats() as Promise<OpenDataStats>,
  });

  const {
    data: records = [],
    isLoading,
    refetch: refetchRecords,
    isFetching: isRecordsFetching,
  } = useQuery<OpenDataRecord[]>({
    queryKey: ['open-data-records', activeTab, searchQuery, selectedFiscalYear, selectedWard],
    queryFn: () =>
      sectoralApi.getOpenDataRecords({
        category: activeTab,
        search: searchQuery,
        fiscalYear: selectedFiscalYear === 'all' ? undefined : selectedFiscalYear,
        ward: selectedWard === 0 ? undefined : selectedWard,
      }) as Promise<OpenDataRecord[]>,
  });

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Mutations
  const saveMutation = useMutation({
    mutationFn: async (record: Partial<OpenDataRecord>) => {
      if (recordToEdit?.id) {
        return sectoralApi.updateOpenDataRecord(recordToEdit.id, record);
      } else {
        return sectoralApi.createOpenDataRecord(record);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['open-data-records'] });
      queryClient.invalidateQueries({ queryKey: ['open-data-stats'] });
      setIsModalOpen(false);
      setRecordToEdit(null);
      showToast(recordToEdit ? 'विवरण सफलतापूर्वक अद्यावधिक गरियो!' : 'नयाँ विवरण सफलतापूर्वक सुरक्षित गरियो!');
    },
    onError: (err: any) => {
      showToast(err?.response?.data?.message || 'डेटा सेभ गर्दा त्रुटि देखापर्यो।', 'error');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return sectoralApi.deleteOpenDataRecord(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['open-data-records'] });
      queryClient.invalidateQueries({ queryKey: ['open-data-stats'] });
      setRecordToDelete(null);
      showToast('रेकर्ड सफलतापूर्वक हटाइयो!');
    },
    onError: (err: any) => {
      showToast(err?.response?.data?.message || 'हटाउँदा त्रुटि देखापर्यो।', 'error');
    },
  });

  const handleDownloadAction = async (item: OpenDataRecord, forcedFormat: 'json' | 'csv' = 'json') => {
    try {
      await sectoralApi.incrementOpenDataDownload(item.id);
      queryClient.invalidateQueries({ queryKey: ['open-data-stats'] });
    } catch (e) {
      // non-blocking
    }

    if (item.fileUrl && (item.fileUrl.startsWith('http') || item.fileUrl.startsWith('/data') || item.fileUrl.startsWith('/reports'))) {
      const link = document.createElement('a');
      link.href = item.fileUrl;
      link.download = `${item.title.toLowerCase().replace(/\s+/g, '_')}`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (forcedFormat === 'csv' && Array.isArray(item.sampleData) && item.sampleData.length > 0) {
      const keys = Object.keys(item.sampleData[0]);
      const csvRows = [
        keys.join(','),
        ...item.sampleData.map((row) => keys.map((k) => `"${row[k] ?? ''}"`).join(',')),
      ];
      const blob = new Blob(['\uFEFF' + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${item.title.toLowerCase().replace(/\s+/g, '_')}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const fileData = {
        metadata: {
          title: item.title,
          category: item.category,
          subCategory: item.subCategory,
          fiscalYear: item.fiscalYear,
          format: item.format,
          recordsCount: item.recordsCount,
          wardNumber: item.wardNumber,
          department: item.authorOrDepartment,
          description: item.description,
          license: item.license || 'CC-BY-SA 4.0',
          exportedAt: new Date().toISOString(),
          palika: `${settings?.palikaNameNp || 'पाँचपोखरी थाङपाल गाउँपालिका'} (Panchpokhari Thangpal Rural Municipality)`,
        },
        columns: item.columnsSchema || [],
        records: item.sampleData || [],
        keyIndicators: item.keyIndicators || null,
      };
      const file = new Blob([JSON.stringify(fileData, null, 2)], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(file);
      link.download = `${item.title.toLowerCase().replace(/\s+/g, '_')}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleOpenAddModal = () => {
    setRecordToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: OpenDataRecord) => {
    setRecordToEdit(item);
    setIsModalOpen(true);
  };

  return (
    <div className="od-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 10000,
            padding: '0.85rem 1.25rem',
            borderRadius: '12px',
            backgroundColor: toastMessage.type === 'success' ? '#10b981' : '#ef4444',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '0.9rem',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            animation: 'odFadeIn 0.2s ease',
          }}
        >
          {toastMessage.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Page Header with Official Municipal Branding & Live Database Status */}
      <div className="od-header">
        <div className="od-header-left">
          <div className="od-header-badges-row">
            <div className="od-palika-badge">
              <Shield size={14} className="text-emerald-700" />
              <span>{settings?.palikaNameNp || 'पाँचपोखरी थाङपाल गाउँपालिका'}</span>
              <span>•</span>
              <span>खुला तथ्याङ्क तथा पारदर्शिता (Open Data Portal)</span>
            </div>

            <div className="od-db-live-badge" title="केन्द्रीय PostgreSQL 16 - PostGIS डाटाबेससँग प्रत्यक्ष जोडिएको छ">
              <span className="od-pulse-dot"></span>
              <Database size={13} className="text-emerald-600" />
              <span>लाइभ डाटाबेस सिङ्क्रोनाइज्ड (PostgreSQL 16)</span>
            </div>
          </div>

          <h1 className="od-header-title">
            खुला तथ्याङ्क, पालिका सूचकहरू तथा सार्वजनिक पारदर्शिता
          </h1>
          <p className="od-header-subtitle">
            गाउँपालिकाका आधिकारिक खुला डेटासेटहरू (Open Data Catalog), दिगो विकास सूचक (SDGs), RTI स्वतः प्रकाशन, प्रणालीगत खुला तालिकाहरू तथा नागरिक सूचना ड्यासबोर्ड।
          </p>
        </div>

        {/* Top Action Buttons (Catalog View) */}
        {isAdmin && primaryTab === 'catalog' && (
          <div className="od-header-actions">
            <button
              onClick={() => setIsExcelModalOpen(true)}
              className="od-btn-excel"
              title="एक्सेल फाइलबाट धेरै डेटा एकैपटक अपलोड गर्नुहोस्"
            >
              <FileSpreadsheet size={18} />
              <span>Excel बल्क अपलोड</span>
            </button>

            <button
              onClick={handleOpenAddModal}
              className="od-btn-primary"
              title="नयाँ खुला डेटासेट वा प्रतिवेदन थप्नुहोस्"
            >
              <Plus size={18} />
              <span>+ नयाँ विवरण थप्नुहोस्</span>
            </button>
          </div>
        )}
      </div>

      {/* KPI Stats Cards - Interactive and Clickable */}
      <div className="od-kpi-grid">
        {/* 1. DATASETS */}
        <div 
          className={`od-kpi-card ${primaryTab === 'catalog' && activeTab === 'datasets' ? 'active-kpi' : ''}`}
          onClick={() => { setPrimaryTab('catalog'); setActiveTab('datasets'); }}
          title="खुला डेटासेटहरू हेर्न क्लिक गर्नुहोस्"
        >
          <div className="od-kpi-icon" style={{ backgroundColor: '#e0f2fe', color: '#0284c7' }}>
            <Database size={24} />
          </div>
          <div>
            <div className="od-kpi-label">खुला डेटासेटहरू</div>
            <div className="od-kpi-val">
              {stats?.totalDatasets ?? 8} <small>वटा</small>
            </div>
            <div className="od-kpi-sub">नागरिक तथा अनुसन्धानकर्ताका लागि</div>
          </div>
        </div>

        {/* 2. REPORTS */}
        <div 
          className={`od-kpi-card ${primaryTab === 'catalog' && activeTab === 'reports' ? 'active-kpi' : ''}`}
          onClick={() => { setPrimaryTab('catalog'); setActiveTab('reports'); }}
          title="सार्वजनिक प्रतिवेदनहरू हेर्न क्लिक गर्नुहोस्"
        >
          <div className="od-kpi-icon" style={{ backgroundColor: '#ecfdf5', color: '#10b981' }}>
            <FileText size={24} />
          </div>
          <div>
            <div className="od-kpi-label">सार्वजनिक प्रतिवेदनहरू</div>
            <div className="od-kpi-val">
              {stats?.totalReports ?? 4} <small>वटा</small>
            </div>
            <div className="od-kpi-sub">आवधिक प्रगति, बजेट तथा लेखाजोखा</div>
          </div>
        </div>

        {/* 3. MUNICIPAL INDICATORS */}
        <div 
          className={`od-kpi-card ${primaryTab === 'indicators' ? 'active-kpi' : ''}`}
          onClick={() => setPrimaryTab('indicators')}
          title="सक्रिय पालिका सूचकहरू हेर्न क्लिक गर्नुहोस्"
        >
          <div className="od-kpi-icon" style={{ backgroundColor: '#f3e8ff', color: '#8b5cf6' }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <div className="od-kpi-label">सक्रिय पालिका सूचकहरू</div>
            <div className="od-kpi-val">
              {stats?.activeIndicatorsCount ?? 12} <small>सूचक</small>
            </div>
            <div className="od-kpi-sub">दिगो विकास लक्ष्य (SDGs) प्रगतितर्फ</div>
          </div>
        </div>

        {/* 4. TRANSPARENCY SCORE */}
        <div 
          className={`od-kpi-card ${primaryTab === 'transparency' ? 'active-kpi' : ''}`}
          onClick={() => setPrimaryTab('transparency')}
          title="पारदर्शिता तथा RTI विवरण हेर्न क्लिक गर्नुहोस्"
        >
          <div className="od-kpi-icon" style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}>
            <ShieldCheck size={24} />
          </div>
          <div>
            <div className="od-kpi-label">सार्वजनिक पारदर्शिता स्कोर</div>
            <div className="od-kpi-val" style={{ color: '#16a34a' }}>
              {stats?.transparencyScore ?? 88.5} <small>/ १००</small>
            </div>
            <div className="od-kpi-sub">RTI स्वतः प्रकाशन अनुपालन</div>
          </div>
        </div>

        {/* 5. DOWNLOADS */}
        <div 
          className="od-kpi-card"
          title="सार्वजनिक तथ्याङ्क डाउनलोड संख्या"
        >
          <div className="od-kpi-icon" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
            <Download size={24} />
          </div>
          <div>
            <div className="od-kpi-label">कुल डाउनलोड सङ्ख्या</div>
            <div className="od-kpi-val">
              {(stats?.totalDownloads ?? 4641).toLocaleString('ne-NP')} <small>पटक</small>
            </div>
            <div className="od-kpi-sub">CSV, JSON तथा Excel ढाँचामा</div>
          </div>
        </div>
      </div>

      {/* ─── PRIMARY 6-PILLAR NAVIGATION TABS ─── */}
      <div className="od-primary-tabs-wrapper">
        <div className="od-primary-tabs">
          <button
            onClick={() => setPrimaryTab('catalog')}
            className={`od-tab-btn ${primaryTab === 'catalog' ? 'active' : ''}`}
          >
            <Database size={17} />
            <span>खुला तथ्याङ्क भण्डार (Open Data Catalog)</span>
            <span className="od-tab-pill">{(stats?.totalDatasets ?? 8) + (stats?.totalReports ?? 4)}</span>
          </button>

          <button
            onClick={() => setPrimaryTab('indicators')}
            className={`od-tab-btn ${primaryTab === 'indicators' ? 'active' : ''}`}
          >
            <TrendingUp size={17} />
            <span>पालिका सूचक तथा दिगो विकास लक्ष्य (SDG)</span>
            <span className="od-tab-pill">{stats?.activeIndicatorsCount ?? 12}</span>
          </button>

          <button
            onClick={() => setPrimaryTab('transparency')}
            className={`od-tab-btn ${primaryTab === 'transparency' ? 'active' : ''}`}
          >
            <ShieldCheck size={17} />
            <span>सार्वजनिक पारदर्शिता तथा RTI</span>
          </button>

          <button
            onClick={() => setPrimaryTab('publications')}
            className={`od-tab-btn ${primaryTab === 'publications' ? 'active' : ''}`}
          >
            <Layers size={17} />
            <span>प्रणालीगत खुला डाटा तालिकाहरू</span>
          </button>

          <button
            onClick={() => setPrimaryTab('requests')}
            className={`od-tab-btn ${primaryTab === 'requests' ? 'active' : ''}`}
          >
            <FileQuestion size={17} />
            <span>नागरिक डेटा माग तथा अनुरोध</span>
            {stats?.pendingRequestsCount ? <span className="od-tab-pill">{stats.pendingRequestsCount}</span> : null}
          </button>

          <button
            onClick={() => setPrimaryTab('developer_api')}
            className={`od-tab-btn ${primaryTab === 'developer_api' ? 'active' : ''}`}
          >
            <Terminal size={17} />
            <span>खुला डाटा REST API पोर्टल</span>
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────────
          TAB 1: OPEN DATA CATALOG
      ───────────────────────────────────────────────────────────────────────────── */}
      {primaryTab === 'catalog' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Sub Navigation Tabs for Catalog */}
          <div className="od-sub-tabs-wrapper">
            <div className="od-sub-tabs">
              <button
                onClick={() => setActiveTab('datasets')}
                className={`od-sub-tab-btn ${activeTab === 'datasets' ? 'active' : ''}`}
              >
                <Database size={15} />
                <span>खुला डेटा क्याटलग (Datasets)</span>
                <span className="od-sub-tab-pill">{stats?.totalDatasets ?? 8}</span>
              </button>

              <button
                onClick={() => setActiveTab('reports')}
                className={`od-sub-tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
              >
                <FileText size={15} />
                <span>सार्वजनिक प्रतिवेदनहरू (Reports)</span>
                <span className="od-sub-tab-pill">{stats?.totalReports ?? 4}</span>
              </button>

              <button
                onClick={() => setActiveTab('strategic')}
                className={`od-sub-tab-btn ${activeTab === 'strategic' ? 'active' : ''}`}
              >
                <Compass size={15} />
                <span>रणनीतिक योजना तथा MTED</span>
                <span className="od-sub-tab-pill">{stats?.strategicPillars ?? 2}</span>
              </button>

              <button
                onClick={() => setActiveTab('practices')}
                className={`od-sub-tab-btn ${activeTab === 'practices' ? 'active' : ''}`}
              >
                <Award size={15} />
                <span>असल अभ्यास र सिकाइ (Good Practices)</span>
                <span className="od-sub-tab-pill">{stats?.goodPractices ?? 2}</span>
              </button>
            </div>
          </div>

          {/* Filter and Search Bar */}
          <div className="od-filter-bar">
            <div className="od-search-box">
              <Search size={17} className="text-slate-400" />
              <input
                type="text"
                placeholder="शीर्षक, विधा वा विवरण खोज्नुहोस्..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} title="खाली गर्नुहोस्">
                  <X size={16} />
                </button>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              {/* Ward Selector */}
              <div className="od-select-wrapper">
                <select
                  value={selectedWard}
                  onChange={(e) => setSelectedWard(Number(e.target.value))}
                >
                  <option value={0}>सबै वडा (All Wards)</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((w) => (
                    <option key={w} value={w}>
                      वडा नं. {w}
                    </option>
                  ))}
                </select>
              </div>

              {/* Fiscal Year Selector */}
              <div className="od-select-wrapper">
                <select
                  value={selectedFiscalYear}
                  onChange={(e) => setSelectedFiscalYear(e.target.value)}
                >
                  <option value="all">सबै आ.व. (All Years)</option>
                  <option value="२०८१/०८२">२०८१/०८२</option>
                  <option value="२०८०/०८१">२०८०/०८१</option>
                  <option value="२०७९/०८०">२०७९/०८०</option>
                  <option value="२०७८/०७९">२०७८/०७९</option>
                </select>
              </div>

              <button
                onClick={() => { refetchRecords(); refetchStats(); }}
                className="od-btn-refresh"
                title="तथ्याङ्क पुनः लोड गर्नुहोस्"
              >
                <RefreshCw size={15} className={isRecordsFetching || isStatsFetching ? 'animate-spin' : ''} />
                <span>रिफ्रेस</span>
              </button>
            </div>
          </div>

          {/* Records Display Grid */}
          {isLoading ? (
            <div style={{ padding: '3.5rem', textAlign: 'center', color: '#64748b', fontWeight: 600 }}>
              <RefreshCw size={24} className="animate-spin inline mr-2 text-sky-600" />
              <span>खुला डेटासेटहरू लोड हुँदैछन्...</span>
            </div>
          ) : records.length === 0 ? (
            <div className="od-card" style={{ padding: '3.5rem', textAlign: 'center', color: '#64748b' }}>
              <FileQuestion size={40} className="mx-auto mb-2 text-slate-300" />
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#334155' }}>कुनै रेकर्ड फेला परेन</div>
              <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>कृपया खोज वा फिल्टर परिवर्तन गरी पुनः प्रयास गर्नुहोस्।</p>
            </div>
          ) : (
            <div className="od-cards-grid">
              {records.map((d) => (
                <div key={d.id} className="od-card">
                  <div>
                    <div className="od-card-header">
                      <div className="od-card-tags">
                        <span className="od-badge-subcat">
                          {d.subCategory || 'डेटासेट'}
                        </span>
                        {d.wardNumber > 0 ? (
                          <span className="od-badge-ward">
                            वडा नं. {d.wardNumber}
                          </span>
                        ) : (
                          <span className="od-badge-ward">
                            सबै वडा
                          </span>
                        )}
                        <span className="od-badge-fy">
                          आ.व. {d.fiscalYear}
                        </span>
                      </div>

                      {/* Edit & Delete Action Buttons for Admins */}
                      {isAdmin && (
                        <div className="od-admin-actions">
                          <button
                            onClick={() => handleOpenEditModal(d)}
                            title="सम्पादन गर्नुहोस्"
                            className="od-btn-admin-edit"
                          >
                            <Edit2 size={13} />
                            <span>सम्पादन</span>
                          </button>
                          <button
                            onClick={() => setRecordToDelete(d)}
                            title="हटाउनुहोस्"
                            className="od-btn-admin-del"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      )}
                    </div>

                    <h3 className="od-card-title" title={d.title}>
                      {d.title}
                    </h3>

                    {d.description && (
                      <p className="od-card-desc" title={d.description}>
                        {d.description}
                      </p>
                    )}

                    <div className="od-card-meta">
                      <span>ढाँचा: <strong>{d.format || 'CSV / JSON'}</strong></span>
                      <span>रेकर्ड: <strong>{(Number(d.recordsCount) || 0).toLocaleString('ne-NP')} वटा</strong></span>
                      <span>साइज: <strong>{d.fileSize || '1 MB'}</strong></span>
                      {d.downloadCount !== undefined && <span>डाउनलोड: <strong>{d.downloadCount} पटक</strong></span>}
                    </div>

                    {d.authorOrDepartment && (
                      <div className="od-card-dept">
                        <Building size={13} className="text-slate-400" />
                        <span>{d.authorOrDepartment}</span>
                      </div>
                    )}
                  </div>

                  {/* Dual Action Buttons: Preview & Download */}
                  <div className="od-card-actions">
                    <button
                      onClick={() => setSelectedPreviewRecord(d)}
                      className="od-btn-preview"
                    >
                      <Eye size={15} />
                      <span>पूर्वावलोकन</span>
                    </button>

                    <button
                      onClick={() => handleDownloadAction(d, 'json')}
                      className="od-btn-download"
                    >
                      <Download size={15} />
                      <span>डाउनलोड</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          TAB 2: MUNICIPAL INDICATORS & SDGs
      ───────────────────────────────────────────────────────────────────────────── */}
      {primaryTab === 'indicators' && (
        <MunicipalIndicatorsView isAdmin={isAdmin} />
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          TAB 3: CITIZEN DASHBOARD & PUBLIC TRANSPARENCY
      ───────────────────────────────────────────────────────────────────────────── */}
      {primaryTab === 'transparency' && (
        <PublicTransparencyView />
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          TAB 4: SYSTEM PUBLICATIONS (dash_open_data_publications)
      ───────────────────────────────────────────────────────────────────────────── */}
      {primaryTab === 'publications' && (
        <SystemPublicationsView isAdmin={isAdmin} />
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          TAB 5: CITIZEN DATA REQUESTS (RTI / Data Inquiries)
      ───────────────────────────────────────────────────────────────────────────── */}
      {primaryTab === 'requests' && (
        <CitizenDataRequestsView isAdmin={isAdmin} />
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          TAB 6: DEVELOPER REST API PORTAL
      ───────────────────────────────────────────────────────────────────────────── */}
      {primaryTab === 'developer_api' && (
        <DeveloperApiView />
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          MODALS
      ───────────────────────────────────────────────────────────────────────────── */}

      {/* Interactive Dataset Preview Modal */}
      <DatasetPreviewModal
        isOpen={!!selectedPreviewRecord}
        onClose={() => setSelectedPreviewRecord(null)}
        record={selectedPreviewRecord}
        onDownload={(item, fmt) => handleDownloadAction(item, fmt)}
      />

      {/* Delete Confirmation Modal */}
      {recordToDelete && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '1.75rem',
              maxWidth: '440px',
              width: '100%',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid #e2e8f0',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#dc2626', marginBottom: '0.85rem' }}>
              <AlertCircle size={26} />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>रेकर्ड मेटाउने निश्चित गर्नुहुन्छ?</h3>
            </div>
            <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: '1.5', margin: '0 0 1.5rem 0' }}>
              तपाईं "<strong>{recordToDelete.title}</strong>" हटाउन लाग्नुभएको छ। यो कार्य फिर्ता गर्न सकिँदैन।
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                onClick={() => setRecordToDelete(null)}
                style={{
                  padding: '0.55rem 1.15rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#475569',
                  fontWeight: 600,
                  fontSize: '0.86rem',
                  cursor: 'pointer',
                }}
              >
                रद्द गर्नुहोस्
              </button>
              <button
                onClick={() => deleteMutation.mutate(recordToDelete.id)}
                disabled={deleteMutation.isPending}
                style={{
                  padding: '0.55rem 1.35rem',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.86rem',
                  cursor: deleteMutation.isPending ? 'not-allowed' : 'pointer',
                }}
              >
                {deleteMutation.isPending ? 'मेटाउँदैछ...' : 'निश्चय नै मेटाउनुहोस्'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      <OpenDataModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setRecordToEdit(null);
        }}
        onSave={(record) => saveMutation.mutate(record)}
        recordToEdit={recordToEdit}
        defaultCategory={activeTab}
        isSubmitting={saveMutation.isPending}
      />

      {/* Excel Bulk Import Modal */}
      <OpenDataExcelModal
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['open-data-records'] });
          queryClient.invalidateQueries({ queryKey: ['open-data-stats'] });
          showToast('एक्सेलबाट रेकर्डहरू सफलतापूर्वक आयात गरियो!');
        }}
        defaultCategory={activeTab}
      />
    </div>
  );
};

export default OpenDataReportsPage;
