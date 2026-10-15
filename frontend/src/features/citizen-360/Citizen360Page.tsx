import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Users,
  Home,
  UserCheck,
  ShieldAlert,
  HeartPulse,
  Wifi,
  CreditCard,
  Search,
  Filter,
  Plus,
  Eye,
  Edit3,
  MapPin,
  Phone,
  Briefcase,
  TrendingUp,
  FileCheck2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { citizen360Api } from '../../api/citizen360';
import { HouseholdDetailModal } from './components/HouseholdDetailModal';
import { AddApplicationModal } from './components/AddApplicationModal';

export const Citizen360Page: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'households' | 'citizens' | 'applications'>('households');
  const [selectedWard, setSelectedWard] = useState<number | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [moduleFilter, setModuleFilter] = useState<string>('all');

  // Modal states
  const [detailHouseholdId, setDetailHouseholdId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAddAppOpen, setIsAddAppOpen] = useState(false);

  // Fetch KPI Stats
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ['citizen-360', 'stats'],
    queryFn: citizen360Api.getStats,
  });

  // Fetch Households
  const {
    data: householdsData,
    isLoading: householdsLoading,
    refetch: refetchHouseholds,
  } = useQuery({
    queryKey: ['citizen-360', 'households', selectedWard, searchTerm],
    queryFn: () =>
      citizen360Api.getHouseholds({
        ward: selectedWard,
        search: searchTerm || undefined,
        limit: 100,
      }),
  });

  // Fetch Citizens
  const {
    data: citizensData,
    isLoading: citizensLoading,
    refetch: refetchCitizens,
  } = useQuery({
    queryKey: ['citizen-360', 'citizens', selectedWard, searchTerm],
    queryFn: () =>
      citizen360Api.getCitizens({
        ward: selectedWard,
        search: searchTerm || undefined,
        limit: 100,
      }),
  });

  // Fetch Applications
  const {
    data: applicationsData,
    isLoading: appsLoading,
    refetch: refetchApps,
  } = useQuery({
    queryKey: ['citizen-360', 'applications', moduleFilter],
    queryFn: () =>
      citizen360Api.getApplications({
        module: moduleFilter !== 'all' ? moduleFilter : undefined,
        limit: 100,
      }),
  });

  const handleOpenDetail = (householdId: string) => {
    setDetailHouseholdId(householdId);
    setIsDetailOpen(true);
  };

  // Filter households by risk level if selected
  const filteredHouseholds = (householdsData?.items || []).filter((h) => {
    if (riskFilter === 'all') return true;
    return h.socioEconomic?.disaster_risk_category?.toLowerCase() === riskFilter.toLowerCase();
  });

  // Filter applications by search term
  const filteredApplications = (applicationsData?.items || []).filter((app) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      app.application_ref_no.toLowerCase().includes(term) ||
      (app.citizenName && app.citizenName.toLowerCase().includes(term)) ||
      app.service_module.toLowerCase().includes(term)
    );
  });

  return (
    <div style={{ padding: '24px', background: '#f8fafc', minHeight: '100vh' }}>
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)',
              }}
            >
              <Users size={24} />
            </div>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                नागरिक ३६० तथा घरधुरी सामाजिक-आर्थिक प्रोफाइल
              </h1>
              <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#64748b' }}>
                पाँचपोखरी थाङपाल गाउँपालिका — Citizen 360, Master Household Registry & Socio-Economic Census
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => {
              refetchStats();
              refetchHouseholds();
              refetchCitizens();
              refetchApps();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 14px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: '#fff',
              color: '#475569',
              fontSize: '13px',
              fontWeight: '500',
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={14} />
            ताजा गर्नुहोस्
          </button>

          <button
            onClick={() => setIsAddAppOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 18px',
              borderRadius: '8px',
              border: 'none',
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              color: '#fff',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)',
            }}
          >
            <Plus size={16} />
            नयाँ सेवा आवेदन दर्ता
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        {/* Card 1 */}
        <div
          style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '18px 20px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ margin: 0, fontSize: '13px', fontWeight: '500', color: '#64748b' }}>
                कुल घरधुरी (MDM Households)
              </p>
              <h3 style={{ margin: '6px 0 2px', fontSize: '28px', fontWeight: '700', color: '#0f172a' }}>
                {statsLoading ? '...' : (stats?.totalHouseholds ?? 0).toLocaleString()}
              </h3>
              <p style={{ margin: 0, fontSize: '12px', color: '#059669', fontWeight: '500' }}>
                ✓ {stats?.totalSurveyedProfiles ?? 0} घरधुरी ३६० प्रोफाइल प्रमाणित
              </p>
            </div>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '10px',
                background: '#e0f2fe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0284c7',
              }}
            >
              <Home size={24} />
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div
          style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '18px 20px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ margin: 0, fontSize: '13px', fontWeight: '500', color: '#64748b' }}>
                दर्ता नागरिक (Verified Citizens)
              </p>
              <h3 style={{ margin: '6px 0 2px', fontSize: '28px', fontWeight: '700', color: '#0f172a' }}>
                {statsLoading ? '...' : (stats?.totalCitizens ?? 0).toLocaleString()}
              </h3>
              <p style={{ margin: 0, fontSize: '12px', color: '#475569' }}>
                प्रति घरधुरी औसत{' '}
                {stats && stats.totalHouseholds > 0
                  ? (stats.totalCitizens / stats.totalHouseholds).toFixed(1)
                  : '0'}{' '}
                सदस्य
              </p>
            </div>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '10px',
                background: '#ecfdf5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#059669',
              }}
            >
              <UserCheck size={24} />
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div
          style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '18px 20px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ margin: 0, fontSize: '13px', fontWeight: '500', color: '#64748b' }}>
                स्वास्थ्य बीमा आबद्धता (Coverage)
              </p>
              <h3 style={{ margin: '6px 0 2px', fontSize: '28px', fontWeight: '700', color: '#0f172a' }}>
                {statsLoading ? '...' : `${stats?.healthInsuranceCoverageRate ?? 0}%`}
              </h3>
              <p style={{ margin: 0, fontSize: '12px', color: '#2563eb' }}>
                बैंक खाता: {stats?.bankAccountCoverageRate ?? 0}% | इन्टरनेट: {stats?.internetAccessRate ?? 0}%
              </p>
            </div>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '10px',
                background: '#eff6ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2563eb',
              }}
            >
              <HeartPulse size={24} />
            </div>
          </div>
        </div>

        {/* Card 4 */}
        <div
          style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '18px 20px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ margin: 0, fontSize: '13px', fontWeight: '500', color: '#64748b' }}>
                उच्च सङ्कटापन्न (Vulnerable Households)
              </p>
              <h3 style={{ margin: '6px 0 2px', fontSize: '28px', fontWeight: '700', color: '#dc2626' }}>
                {statsLoading ? '...' : (stats?.vulnerableHouseholds ?? 0).toLocaleString()}
              </h3>
              <p style={{ margin: 0, fontSize: '12px', color: '#b91c1c' }}>
                विपद् उच्च जोखिम:{' '}
                {stats?.disasterRiskBreakdown?.High ||
                  stats?.disasterRiskBreakdown?.high ||
                  0}{' '}
                घरधुरी
              </p>
            </div>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '10px',
                background: '#fef2f2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#dc2626',
              }}
            >
              <ShieldAlert size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs and Filters Navigation */}
      <div
        style={{
          background: '#fff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '16px 20px',
          marginBottom: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            borderBottom: '1px solid #e2e8f0',
            paddingBottom: '16px',
          }}
        >
          {/* Main Tabs */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setActiveTab('households')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 16px',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'households' ? '#e0f2fe' : 'transparent',
                color: activeTab === 'households' ? '#0369a1' : '#64748b',
                fontWeight: activeTab === 'households' ? '600' : '500',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Home size={16} />
              घरधुरी प्रोफाइल तथा आर्थिक अवस्था ({householdsData?.total ?? 0})
            </button>

            <button
              onClick={() => setActiveTab('citizens')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 16px',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'citizens' ? '#e0f2fe' : 'transparent',
                color: activeTab === 'citizens' ? '#0369a1' : '#64748b',
                fontWeight: activeTab === 'citizens' ? '600' : '500',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Users size={16} />
              नागरिक ३६० निर्देशिका ({citizensData?.total ?? 0})
            </button>

            <button
              onClick={() => setActiveTab('applications')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 16px',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'applications' ? '#e0f2fe' : 'transparent',
                color: activeTab === 'applications' ? '#0369a1' : '#64748b',
                fontWeight: activeTab === 'applications' ? '600' : '500',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <FileCheck2 size={16} />
              नागरिक सेवा तथा ई-सिफारिस आवेदन ({applicationsData?.total ?? 0})
            </button>
          </div>

          {/* Quick Stats right */}
          <div style={{ fontSize: '13px', color: '#64748b' }}>
            कुल आवेदन: <strong>{stats?.totalApplications ?? 0}</strong> (स्वीकृत:{' '}
            <span style={{ color: '#059669' }}>{stats?.approvedApplications ?? 0}</span> | विचाराधीन:{' '}
            <span style={{ color: '#d97706' }}>{stats?.pendingApplications ?? 0}</span>)
          </div>
        </div>

        {/* Filter Controls Row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginTop: '16px',
            flexWrap: 'wrap',
          }}
        >
          {/* Search Box */}
          <div style={{ position: 'relative', flex: '1', minWidth: '240px' }}>
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
              placeholder={
                activeTab === 'households'
                  ? 'घरधुरी नं, घरमुलीको नाम वा टोल खोज्नुहोस्...'
                  : activeTab === 'citizens'
                  ? 'नागरिकको नाम, नागरिकता नं वा मोबाइल...'
                  : 'आवेदन दर्ता नं, आवेदक वा सेवा प्रकार...'
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 36px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                outline: 'none',
              }}
            />
          </div>

          {/* Ward Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>वडा:</span>
            <select
              value={selectedWard === undefined ? '' : selectedWard}
              onChange={(e) =>
                setSelectedWard(e.target.value === '' ? undefined : Number(e.target.value))
              }
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                background: '#fff',
                color: '#334155',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="">सबै वडाहरू (All Wards)</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((w) => (
                <option key={w} value={w}>
                  वडा नं {w}
                </option>
              ))}
            </select>
          </div>

          {/* Risk Filter (Active in households tab) */}
          {activeTab === 'households' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>विपद् जोखिम:</span>
              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  background: '#fff',
                  color: '#334155',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="all">सबै स्तर (All Risk Levels)</option>
                <option value="high">उच्च जोखिम (High Risk)</option>
                <option value="medium">मध्यम जोखिम (Medium Risk)</option>
                <option value="low">न्यून जोखिम (Low Risk)</option>
              </select>
            </div>
          )}

          {/* Module Filter (Active in applications tab) */}
          {activeTab === 'applications' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>सेवा क्षेत्र:</span>
              <select
                value={moduleFilter}
                onChange={(e) => setModuleFilter(e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  background: '#fff',
                  color: '#334155',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="all">सबै सेवा (All Services)</option>
                <option value="esifaris">ई-सिफारिस (e-Sifaris)</option>
                <option value="social_security">सामाजिक सुरक्षा भत्ता</option>
                <option value="vital_registration">घटना दर्ता (Vital Reg)</option>
                <option value="ebps">घर नक्सा पास (eBPS)</option>
                <option value="grievance">गुनासो तथा उजुरी</option>
                <option value="agriculture_subsidy">कृषि अनुदान / राहत</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* TAB CONTENT 1: HOUSEHOLDS */}
      {activeTab === 'households' && (
        <div>
          {householdsLoading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
              घरधुरी प्रोफाइल लोड हुँदैछ...
            </div>
          ) : filteredHouseholds.length === 0 ? (
            <div
              style={{
                background: '#fff',
                borderRadius: '12px',
                padding: '48px',
                textAlign: 'center',
                border: '1px dashed #cbd5e1',
                color: '#64748b',
              }}
            >
              <Home size={36} style={{ color: '#94a3b8', margin: '0 auto 12px' }} />
              <h3 style={{ margin: '0 0 6px', color: '#1e293b' }}>कुनै घरधुरी फेला परेन</h3>
              <p style={{ margin: 0, fontSize: '13px' }}>
                कृपया खोज शब्द वा वडा फिल्टर परिवर्तन गरी पुनः प्रयास गर्नुहोस्।
              </p>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
                gap: '16px',
              }}
            >
              {filteredHouseholds.map((h) => {
                const se = h.socioEconomic;
                const riskColor =
                  se?.disaster_risk_category?.toLowerCase() === 'high'
                    ? '#dc2626'
                    : se?.disaster_risk_category?.toLowerCase() === 'medium'
                    ? '#d97706'
                    : '#059669';

                return (
                  <div
                    key={h.id}
                    style={{
                      background: '#fff',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      padding: '18px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                    }}
                  >
                    <div>
                      {/* Card Header */}
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: '10px',
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span
                              style={{
                                background: '#f1f5f9',
                                color: '#475569',
                                fontSize: '11px',
                                fontWeight: '700',
                                padding: '2px 8px',
                                borderRadius: '4px',
                              }}
                            >
                              घर नं: {h.householdNumber}
                            </span>
                            <span
                              style={{
                                background: '#e0f2fe',
                                color: '#0369a1',
                                fontSize: '11px',
                                fontWeight: '600',
                                padding: '2px 8px',
                                borderRadius: '4px',
                              }}
                            >
                              वडा नं {h.wardNumber}
                            </span>
                          </div>
                          <h3
                            style={{
                              margin: '6px 0 2px',
                              fontSize: '16px',
                              fontWeight: '700',
                              color: '#0f172a',
                            }}
                          >
                            {h.headName}
                          </h3>
                          <p
                            style={{
                              margin: 0,
                              fontSize: '12px',
                              color: '#64748b',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <MapPin size={12} /> {h.toleName || 'टोल उल्लेख नभएको'}
                          </p>
                        </div>

                        {/* Disaster Risk Badge */}
                        {se?.disaster_risk_category && (
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: '700',
                              padding: '3px 8px',
                              borderRadius: '12px',
                              color: riskColor,
                              background:
                                se?.disaster_risk_category?.toLowerCase() === 'high'
                                  ? '#fee2e2'
                                  : se?.disaster_risk_category?.toLowerCase() === 'medium'
                                  ? '#fef3c7'
                                  : '#dcfce7',
                            }}
                          >
                            {se.disaster_risk_category} Risk
                          </span>
                        )}
                      </div>

                      {/* Socio-economic stats strip */}
                      <div
                        style={{
                          background: '#f8fafc',
                          borderRadius: '8px',
                          padding: '10px 12px',
                          margin: '12px 0',
                          display: 'grid',
                          gridTemplateColumns: 'repeat(2, 1fr)',
                          gap: '8px',
                          fontSize: '12px',
                        }}
                      >
                        <div>
                          <span style={{ color: '#64748b' }}>पारिवारिक सदस्य:</span>{' '}
                          <strong>{h.familyMembersCount} जना</strong>
                        </div>
                        <div>
                          <span style={{ color: '#64748b' }}>मुख्य पेशा:</span>{' '}
                          <strong>{se?.primary_occupation || 'उल्लेख नभएको'}</strong>
                        </div>
                        <div>
                          <span style={{ color: '#64748b' }}>वार्षिक आय:</span>{' '}
                          <strong>{se?.annual_income_bracket || 'N/A'}</strong>
                        </div>
                        <div>
                          <span style={{ color: '#64748b' }}>जग्गा जमिन:</span>{' '}
                          <strong>
                            {se?.land_ownership_area_sqm
                              ? `${se.land_ownership_area_sqm} sq.m`
                              : 'उपलब्ध छैन'}
                          </strong>
                        </div>
                      </div>

                      {/* Amenities checklist icons */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          marginBottom: '14px',
                          fontSize: '12px',
                        }}
                      >
                        <span
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            color: se?.has_health_insurance ? '#059669' : '#94a3b8',
                            fontWeight: se?.has_health_insurance ? '600' : '400',
                          }}
                        >
                          <HeartPulse size={14} /> स्वास्थ्य बीमा
                        </span>
                        <span
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            color: se?.has_bank_account ? '#2563eb' : '#94a3b8',
                            fontWeight: se?.has_bank_account ? '600' : '400',
                          }}
                        >
                          <CreditCard size={14} /> बैंक खाता
                        </span>
                        <span
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            color: se?.has_internet_access ? '#7c3aed' : '#94a3b8',
                            fontWeight: se?.has_internet_access ? '600' : '400',
                          }}
                        >
                          <Wifi size={14} /> इन्टरनेट
                        </span>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div
                      style={{
                        borderTop: '1px solid #f1f5f9',
                        paddingTop: '12px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div style={{ fontSize: '11px', color: '#64748b' }}>
                        सङ्कटापन्न अङ्क:{' '}
                        <strong
                          style={{
                            color:
                              (se?.vulnerability_score ?? 0) > 0.6
                                ? '#dc2626'
                                : (se?.vulnerability_score ?? 0) > 0.3
                                ? '#d97706'
                                : '#059669',
                          }}
                        >
                          {((se?.vulnerability_score ?? 0) * 100).toFixed(0)}%
                        </strong>
                      </div>

                      <button
                        onClick={() => handleOpenDetail(h.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          border: '1px solid #0284c7',
                          background: '#f0f9ff',
                          color: '#0284c7',
                          fontSize: '12px',
                          fontWeight: '600',
                          cursor: 'pointer',
                        }}
                      >
                        <Eye size={13} />
                        विस्तृत ३६० प्रोफाइल
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 2: CITIZENS DIRECTORY */}
      {activeTab === 'citizens' && (
        <div>
          {citizensLoading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
              नागरिक निर्देशिका लोड हुँदैछ...
            </div>
          ) : (citizensData?.items || []).length === 0 ? (
            <div
              style={{
                background: '#fff',
                borderRadius: '12px',
                padding: '48px',
                textAlign: 'center',
                border: '1px dashed #cbd5e1',
                color: '#64748b',
              }}
            >
              <Users size={36} style={{ color: '#94a3b8', margin: '0 auto 12px' }} />
              <h3 style={{ margin: '0 0 6px', color: '#1e293b' }}>कुनै नागरिक फेला परेनन्</h3>
              <p style={{ margin: 0, fontSize: '13px' }}>
                कृपया खोज मापदण्ड परिवर्तन गरी पुनः खोजी गर्नुहोस्।
              </p>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '16px',
              }}
            >
              {(citizensData?.items || []).map((c) => (
                <div
                  key={c.id}
                  style={{
                    background: '#fff',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    padding: '16px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '50%',
                        background:
                          c.gender === 'Female'
                            ? 'linear-gradient(135deg, #f43f5e 0%, #be123c 100%)'
                            : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontWeight: '700',
                        fontSize: '16px',
                      }}
                    >
                      {c.fullName ? c.fullName.charAt(0) : 'N'}
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>
                        {c.fullName}
                      </h4>
                      <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>
                        {c.relationshipToHead} ({c.gender}) • वि.सं. {c.dobBs}
                      </p>
                    </div>
                  </div>

                  <div
                    style={{
                      background: '#f8fafc',
                      borderRadius: '8px',
                      padding: '10px 12px',
                      fontSize: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                    }}
                  >
                    <div>
                      <span style={{ color: '#64748b' }}>नागरिकता नं:</span>{' '}
                      <strong style={{ color: '#334155' }}>{c.citizenshipNo || 'N/A'}</strong>
                    </div>
                    {c.nationalId && (
                      <div>
                        <span style={{ color: '#64748b' }}>राष्ट्रिय परिचयपत्र:</span>{' '}
                        <strong style={{ color: '#334155' }}>{c.nationalId}</strong>
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Phone size={12} style={{ color: '#64748b' }} />
                      <span style={{ color: '#64748b' }}>मोबाइल नं:</span>{' '}
                      <strong>{c.mobileNo || 'N/A'}</strong>
                    </div>
                  </div>

                  {c.householdId && (
                    <div style={{ marginTop: '12px', textAlign: 'right' }}>
                      <button
                        onClick={() => handleOpenDetail(c.householdId!)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#0284c7',
                          fontSize: '12px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <Home size={12} />
                        घरधुरी प्रोफाइल हेर्नुहोस् &rarr;
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 3: CITIZEN APPLICATIONS & SERVICES */}
      {activeTab === 'applications' && (
        <div
          style={{
            background: '#fff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          }}
        >
          {appsLoading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
              आवेदन अभिलेख लोड हुँदैछ...
            </div>
          ) : filteredApplications.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center', color: '#64748b' }}>
              <FileCheck2 size={36} style={{ color: '#94a3b8', margin: '0 auto 12px' }} />
              <h3 style={{ margin: '0 0 6px', color: '#1e293b' }}>कुनै सेवा आवेदन फेला परेन</h3>
              <p style={{ margin: 0, fontSize: '13px' }}>
                नयाँ सेवा आवेदन दर्ता गर्न माथिको "नयाँ सेवा आवेदन दर्ता" बटन थिच्नुहोस्।
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '12px 16px', color: '#475569', fontWeight: '600' }}>आवेदन दर्ता नं</th>
                    <th style={{ padding: '12px 16px', color: '#475569', fontWeight: '600' }}>आवेदक नागरिक</th>
                    <th style={{ padding: '12px 16px', color: '#475569', fontWeight: '600' }}>सेवा क्षेत्र</th>
                    <th style={{ padding: '12px 16px', color: '#475569', fontWeight: '600' }}>आवेदन मिति</th>
                    <th style={{ padding: '12px 16px', color: '#475569', fontWeight: '600' }}>अवस्था (Status)</th>
                    <th style={{ padding: '12px 16px', color: '#475569', fontWeight: '600' }}>कार्यवाही</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApplications.map((app) => {
                    const statusColor =
                      app.status === 'APPROVED' || app.status === 'COMPLETED'
                        ? '#059669'
                        : app.status === 'PENDING'
                        ? '#d97706'
                        : app.status === 'IN_REVIEW'
                        ? '#2563eb'
                        : '#dc2626';

                    const statusBg =
                      app.status === 'APPROVED' || app.status === 'COMPLETED'
                        ? '#ecfdf5'
                        : app.status === 'PENDING'
                        ? '#fffbeb'
                        : app.status === 'IN_REVIEW'
                        ? '#eff6ff'
                        : '#fef2f2';

                    return (
                      <tr
                        key={app.id}
                        style={{
                          borderBottom: '1px solid #f1f5f9',
                          transition: 'background 0.15s ease',
                        }}
                      >
                        <td style={{ padding: '14px 16px', fontWeight: '600', color: '#0f172a' }}>
                          {app.application_ref_no}
                        </td>
                        <td style={{ padding: '14px 16px', color: '#334155' }}>
                          <strong>{app.citizenName || 'नागरिक'}</strong>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span
                            style={{
                              background: '#f1f5f9',
                              color: '#475569',
                              padding: '3px 8px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontWeight: '500',
                            }}
                          >
                            {app.service_module}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', color: '#64748b' }}>
                          {app.application_date || 'N/A'}
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span
                            style={{
                              background: statusBg,
                              color: statusColor,
                              padding: '3px 10px',
                              borderRadius: '12px',
                              fontSize: '11px',
                              fontWeight: '700',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            {app.status === 'APPROVED' && <CheckCircle2 size={12} />}
                            {app.status === 'PENDING' && <Clock size={12} />}
                            {app.status}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <button
                            onClick={() => {
                              alert(`आवेदन नं ${app.application_ref_no} को विवरण: अवस्था ${app.status}`);
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#0284c7',
                              fontSize: '12px',
                              fontWeight: '600',
                              cursor: 'pointer',
                            }}
                          >
                            विवरण
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Household Detail Modal */}
      <HouseholdDetailModal
        householdId={detailHouseholdId}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setDetailHouseholdId(null);
        }}
      />

      {/* Add Citizen Application Modal */}
      <AddApplicationModal
        isOpen={isAddAppOpen}
        onClose={() => setIsAddAppOpen(false)}
        onSuccess={() => {
          refetchApps();
          refetchStats();
        }}
        citizens={citizensData || []}
      />
    </div>
  );
};

export default Citizen360Page;
