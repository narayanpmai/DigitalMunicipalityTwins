import React, { useState } from 'react';
import {
  X,
  User,
  ShieldCheck,
  FileCheck2,
  Coins,
  FileText,
  Phone,
  Mail,
  MapPin,
  QrCode,
  Download,
  ExternalLink,
  LogOut,
  Clock,
  CheckCircle2,
  AlertCircle,
  Home,
  Users,
  Copy,
  FolderLock,
  Lock,
  Fingerprint,
  CreditCard,
} from 'lucide-react';
import { CitizenUser } from '../../types';
import {
  MOCK_CITIZEN_APPLICATIONS,
  MOCK_CITIZEN_TAX_HISTORY,
  MOCK_DIGITAL_LOCKER_DOCS,
} from '../../data/mockCitizenData';
import { MunicipalPaymentModal } from '../PaymentGateway/MunicipalPaymentModal';

interface CitizenProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: CitizenUser;
  onLogout: () => void;
  onNavigateTab: (tab: any) => void;
}

export const CitizenProfileModal: React.FC<CitizenProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onLogout,
  onNavigateTab,
}) => {
  const [activeTab, setActiveTab] = useState<'id_card' | 'applications' | 'taxes' | 'locker'>('id_card');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(() => {
    return localStorage.getItem('palika_biometric_enabled') === 'true';
  });
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentModalData, setPaymentModalData] = useState<{ purpose: string; amount: number } | null>(null);
  const [taxHistory, setTaxHistory] = useState(MOCK_CITIZEN_TAX_HISTORY);

  if (!isOpen) return null;

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1800);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(5px)',
        zIndex: 1300,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          maxWidth: '480px',
          width: '100%',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 60px rgba(0,0,0,0.35)',
          overflow: 'hidden',
          animation: 'fadeInUp 0.25s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #A81C3C 0%, #7C1D4A 45%, #0F4C81 100%)',
            color: '#ffffff',
            padding: '1.25rem 1.25rem 1rem 1.25rem',
            position: 'relative',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                backgroundColor: '#ffffff',
                border: '3px solid #F59E0B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                flexShrink: 0,
                boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
              }}
            >
              <img
                src="/panchpokhari-logo.png"
                alt="Panchpokhari Logo"
                style={{ width: '85%', height: '85%', objectFit: 'contain' }}
              />
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '1.05rem', fontWeight: 900 }}>{user.fullName}</span>
                <span
                  style={{
                    backgroundColor: '#10B981',
                    color: '#ffffff',
                    fontSize: '0.6rem',
                    fontWeight: 800,
                    padding: '2px 6px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2px',
                  }}
                >
                  <ShieldCheck size={11} />
                  <span>प्रमाणित</span>
                </span>
              </div>
              <div style={{ fontSize: '0.74rem', opacity: 0.9, marginTop: '2px' }}>
                {user.fullNameEn} • वडा नं. {user.permanentAddress.wardNo} ({user.permanentAddress.tole})
              </div>
              <div style={{ fontSize: '0.68rem', color: '#FCD34D', marginTop: '2px', fontWeight: 700 }}>
                घरधुरी कोड: {user.householdNo} • ५पोखरी थाङपाल
              </div>
            </div>
          </div>
        </div>

        {/* 4 Navigation Tabs */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            backgroundColor: '#F1F5F9',
            padding: '4px',
            gap: '4px',
            borderBottom: '1px solid #E2E8F0',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('id_card')}
            style={{
              padding: '8px 2px',
              border: 'none',
              borderRadius: '10px',
              fontSize: '0.7rem',
              fontWeight: 800,
              cursor: 'pointer',
              backgroundColor: activeTab === 'id_card' ? '#ffffff' : 'transparent',
              color: activeTab === 'id_card' ? '#A81C3C' : '#64748B',
              boxShadow: activeTab === 'id_card' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '3px',
            }}
          >
            <User size={15} />
            <span>परिचयपत्र</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('applications')}
            style={{
              padding: '8px 2px',
              border: 'none',
              borderRadius: '10px',
              fontSize: '0.7rem',
              fontWeight: 800,
              cursor: 'pointer',
              backgroundColor: activeTab === 'applications' ? '#ffffff' : 'transparent',
              color: activeTab === 'applications' ? '#E65100' : '#64748B',
              boxShadow: activeTab === 'applications' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '3px',
            }}
          >
            <FileCheck2 size={15} />
            <span>ई-सिफारिस (३)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('taxes')}
            style={{
              padding: '8px 2px',
              border: 'none',
              borderRadius: '10px',
              fontSize: '0.7rem',
              fontWeight: 800,
              cursor: 'pointer',
              backgroundColor: activeTab === 'taxes' ? '#ffffff' : 'transparent',
              color: activeTab === 'taxes' ? '#D97706' : '#64748B',
              boxShadow: activeTab === 'taxes' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '3px',
            }}
          >
            <Coins size={15} />
            <span>कर रसिद</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('locker')}
            style={{
              padding: '8px 2px',
              border: 'none',
              borderRadius: '10px',
              fontSize: '0.7rem',
              fontWeight: 800,
              cursor: 'pointer',
              backgroundColor: activeTab === 'locker' ? '#ffffff' : 'transparent',
              color: activeTab === 'locker' ? '#0F4C81' : '#64748B',
              boxShadow: activeTab === 'locker' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '3px',
            }}
          >
            <FolderLock size={15} />
            <span>कागजात लकर</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div style={{ padding: '1rem', overflowY: 'auto', flex: 1, backgroundColor: '#F8FAFC' }}>
          {/* ─── TAB 1: DIGITAL MUNICIPAL ID CARD ─── */}
          {activeTab === 'id_card' && (
            <div>
              {/* Official Digital Smart Card */}
              <div
                style={{
                  background: 'linear-gradient(135deg, #0F4C81 0%, #1E3A8A 60%, #172554 100%)',
                  borderRadius: '18px',
                  padding: '1.15rem',
                  color: '#ffffff',
                  boxShadow: '0 8px 24px rgba(15, 76, 129, 0.3)',
                  border: '1.5px solid #F59E0B',
                  marginBottom: '1rem',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Background watermark */}
                <div
                  style={{
                    position: 'absolute',
                    right: '-20px',
                    bottom: '-20px',
                    opacity: 0.1,
                    pointerEvents: 'none',
                  }}
                >
                  <img src="/panchpokhari-logo.png" alt="watermark" style={{ width: '160px', height: '160px' }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
                  <div>
                    <div style={{ fontSize: '0.62rem', letterSpacing: '1px', textTransform: 'uppercase', color: '#FCD34D', fontWeight: 800 }}>
                      पाँचपोखरी थाङपाल गाउँपालिका
                    </div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 900 }}>
                      डिजिटल नागरिक परिचयपत्र (Smart Palika ID)
                    </div>
                  </div>
                  <div
                    style={{
                      backgroundColor: '#ffffff',
                      padding: '4px',
                      borderRadius: '8px',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                    }}
                  >
                    <QrCode size={40} color="#0F172A" />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.74rem', marginBottom: '0.85rem' }}>
                  <div>
                    <span style={{ color: '#93C5FD', display: 'block', fontSize: '0.64rem' }}>नागरिकता नं.:</span>
                    <strong style={{ letterSpacing: '0.5px' }}>{user.citizenshipNo}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#93C5FD', display: 'block', fontSize: '0.64rem' }}>राष्ट्रिय परिचयपत्र (NIN):</span>
                    <strong style={{ letterSpacing: '0.5px' }}>{user.nationalIdNo}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#93C5FD', display: 'block', fontSize: '0.64rem' }}>मोबाइल नं.:</span>
                    <strong>{user.phone}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#93C5FD', display: 'block', fontSize: '0.64rem' }}>स्थायी ठेगाना:</span>
                    <strong>वडा नं {user.permanentAddress.wardNo}, {user.permanentAddress.tole}</strong>
                  </div>
                </div>

                <div
                  style={{
                    borderTop: '1px solid rgba(255,255,255,0.2)',
                    paddingTop: '6px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.68rem',
                  }}
                >
                  <span style={{ color: '#FCD34D' }}>रक्त समूह: <strong>{user.bloodGroup}</strong></span>
                  <span style={{ color: '#86EFAC' }}>✅ नेपाल सरकार प्रमाणीकरण सिङ्क</span>
                </div>
              </div>

              {/* Detailed Personal Attributes */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  padding: '1rem',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                }}
              >
                <div style={{ fontSize: '0.8rem', fontWeight: 900, color: '#0F172A', marginBottom: '0.75rem' }}>
                  व्यक्तिगत तथा घरधुरी विवरण:
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid #F1F5F9' }}>
                    <span style={{ color: '#64748B' }}>जन्म मिति:</span>
                    <strong style={{ color: '#0F172A' }}>{user.dateOfBirthBs} (BS)</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid #F1F5F9' }}>
                    <span style={{ color: '#64748B' }}>मतदाता परिचयपत्र नं:</span>
                    <strong style={{ color: '#0F172A' }}>{user.voterCardNo}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid #F1F5F9' }}>
                    <span style={{ color: '#64748B' }}>करदाता संकेत (PAN):</span>
                    <strong style={{ color: '#0F172A' }}>{user.taxpayerPan}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid #F1F5F9' }}>
                    <span style={{ color: '#64748B' }}>परिवार सदस्य संख्या:</span>
                    <strong style={{ color: '#0F172A' }}>{user.familyMembersCount} जना (घरधुरी संकलन सूचीकृत)</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>आपतकालीन सम्पर्क:</span>
                    <strong style={{ color: '#DC2626' }}>{user.emergencyContactName} ({user.emergencyContactPhone})</strong>
                  </div>
                </div>
              </div>

              {/* Biometric Security Card */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  padding: '12px',
                  border: '1px solid #E2E8F0',
                  marginTop: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '10px',
                      backgroundColor: '#ECFDF5',
                      color: '#059669',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Fingerprint size={22} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0F172A' }}>
                      बायोमेट्रिक अनलक (Touch ID / Face ID)
                    </div>
                    <div style={{ fontSize: '0.66rem', color: isBiometricEnabled ? '#059669' : '#64748B', fontWeight: 600 }}>
                      {isBiometricEnabled ? '✅ सक्रिय छ (औंठाछापबाट १-ट्याप लगइन)' : 'निष्क्रिय छ (सक्रिय गर्न थिच्नुहोस्)'}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const next = !isBiometricEnabled;
                    setIsBiometricEnabled(next);
                    localStorage.setItem('palika_biometric_enabled', next ? 'true' : 'false');
                  }}
                  style={{
                    backgroundColor: isBiometricEnabled ? '#10B981' : '#CBD5E1',
                    border: 'none',
                    width: '46px',
                    height: '26px',
                    borderRadius: '13px',
                    padding: '2px',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'background-color 0.2s',
                  }}
                >
                  <div
                    style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      backgroundColor: '#ffffff',
                      transform: isBiometricEnabled ? 'translateX(20px)' : 'translateX(0px)',
                      transition: 'transform 0.2s',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    }}
                  />
                </button>
              </div>
            </div>
          )}

          {/* ─── TAB 2: CITIZEN APPLICATIONS ─── */}
          {activeTab === 'applications' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <div style={{ fontSize: '0.84rem', fontWeight: 900, color: '#0F172A' }}>
                  मेरा ई-सिफारिस दरखास्तहरू ({MOCK_CITIZEN_APPLICATIONS.length})
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigateTab('sifarish');
                  }}
                  style={{
                    backgroundColor: '#E65100',
                    color: '#ffffff',
                    border: 'none',
                    padding: '5px 10px',
                    borderRadius: '8px',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  + नयाँ सिफारिस
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {MOCK_CITIZEN_APPLICATIONS.map((app) => (
                  <div
                    key={app.id}
                    style={{
                      backgroundColor: '#ffffff',
                      borderRadius: '14px',
                      padding: '12px',
                      border: '1.5px solid #E2E8F0',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0F172A' }}>
                        {app.sifarishName}
                      </div>
                      <span
                        style={{
                          backgroundColor: app.status === 'सिफारिस तयार' ? '#ECFDF5' : '#FFFBEB',
                          color: app.status === 'सिफारिस तयार' ? '#059669' : '#D97706',
                          border: `1px solid ${app.status === 'सिफारिस तयार' ? '#A7F3D0' : '#FDE68A'}`,
                          padding: '3px 8px',
                          borderRadius: '10px',
                          fontSize: '0.64rem',
                          fontWeight: 800,
                          flexShrink: 0,
                        }}
                      >
                        {app.status === 'सिफारिस तयार' ? '✅ ' : '⏳ '}
                        {app.status}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '0.7rem', color: '#64748B' }}>
                      <span>संकेत नं: <strong>{app.applicationNo}</strong></span>
                      <span>मिति: {app.appliedDate}</span>
                    </div>

                    <div
                      style={{
                        marginTop: '8px',
                        paddingTop: '8px',
                        borderTop: '1px dashed #E2E8F0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <span style={{ fontSize: '0.72rem', color: '#475569' }}>
                        दस्तुर: <strong>रु. {app.fee}</strong>
                      </span>
                      {app.status === 'सिफारिस तयार' ? (
                        <button
                          type="button"
                          onClick={() => alert(`सिफारिस प्रमाणपत्र डाउनलोड भयो! (संकेत: ${app.applicationNo})`)}
                          style={{
                            backgroundColor: '#ECFDF5',
                            color: '#059669',
                            border: '1px solid #10B981',
                            padding: '4px 10px',
                            borderRadius: '8px',
                            fontSize: '0.68rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Download size={12} />
                          <span>प्रमाणपत्र डाउनलोड</span>
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.68rem', color: '#D97706', fontWeight: 700 }}>
                          वडा अध्यक्ष/सचिव प्रमाणीकरण प्रक्रियामा
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── TAB 3: TAX & REVENUE RECEIPTS ─── */}
          {activeTab === 'taxes' && (
            <div>
              <div
                style={{
                  backgroundColor: '#ECFDF5',
                  borderRadius: '12px',
                  padding: '10px',
                  border: '1px solid #A7F3D0',
                  color: '#065F46',
                  fontSize: '0.76rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '1rem',
                }}
              >
                <CheckCircle2 size={18} color="#059669" />
                <div>
                  <strong>चालु आ.व. २०८१/८२ सम्मको कर चुक्ता:</strong> तपाईंको नाममा कुनै बक्यौता बाँकी छैन।
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 900, color: '#0F172A' }}>
                  तिरेको कर तथा मलेप १०२ रसिद विवरण:
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPaymentModalData({
                      purpose: 'सम्पत्ति कर तथा भूमि कर (चालु आ.व. २०८१/८२)',
                      amount: 1250,
                    });
                    setIsPaymentModalOpen(true);
                  }}
                  style={{
                    backgroundColor: '#D97706',
                    color: '#ffffff',
                    border: 'none',
                    padding: '6px 11px',
                    borderRadius: '8px',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    boxShadow: '0 2px 6px rgba(217, 119, 6, 0.25)',
                  }}
                >
                  <CreditCard size={13} />
                  <span>+ अनलाइन कर तिर्नुहोस्</span>
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {taxHistory.map((tax, idx) => (
                  <div
                    key={idx}
                    style={{
                      backgroundColor: '#ffffff',
                      borderRadius: '14px',
                      padding: '12px',
                      border: '1px solid #E2E8F0',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0F172A' }}>
                          {tax.taxType}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '2px' }}>
                          आ.व. {tax.fiscalYear} • {tax.receiptNo}
                        </div>
                      </div>
                      <span
                        style={{
                          backgroundColor: '#DCFCE7',
                          color: '#15803D',
                          padding: '2px 8px',
                          borderRadius: '8px',
                          fontSize: '0.65rem',
                          fontWeight: 800,
                        }}
                      >
                        चुक्ता
                      </span>
                    </div>

                    <div
                      style={{
                        marginTop: '8px',
                        paddingTop: '8px',
                        borderTop: '1px dashed #E2E8F0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '0.72rem',
                      }}
                    >
                      <span>
                        बुझाएको रकम: <strong>रु. {tax.paidAmountRs}</strong> ({tax.paymentMethod})
                      </span>
                      <button
                        type="button"
                        onClick={() => alert(`मलेप १०२ डिजिटल रसिद (${tax.receiptNo}) डाउनलोड भयो!`)}
                        style={{
                          backgroundColor: '#F1F5F9',
                          color: '#0F4C81',
                          border: '1px solid #CBD5E1',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '0.66rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <Download size={11} />
                        <span>रसिद</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── TAB 4: DIGITAL LOCKER ─── */}
          {activeTab === 'locker' && (
            <div>
              <div
                style={{
                  backgroundColor: '#EFF6FF',
                  borderRadius: '12px',
                  padding: '10px',
                  border: '1px solid #BFDBFE',
                  color: '#1E40AF',
                  fontSize: '0.74rem',
                  marginBottom: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <FolderLock size={18} color="#2563EB" />
                <div>
                  <strong>डिजिटल नागरिक लकर:</strong> यहाँ सुरक्षित कागजातहरू ई-सिफारिस भर्दा १-ट्यापमा स्वतः संलग्न हुन्छन्।
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {MOCK_DIGITAL_LOCKER_DOCS.map((doc) => (
                  <div
                    key={doc.id}
                    style={{
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      padding: '10px 12px',
                      border: '1px solid #E2E8F0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0F172A' }}>
                        {doc.name}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: '#64748B', marginTop: '2px' }}>
                        प्रकार: {doc.type} • जारी: {doc.issuedDate}
                      </div>
                    </div>
                    <span
                      style={{
                        backgroundColor: '#ECFDF5',
                        color: '#059669',
                        fontSize: '0.64rem',
                        fontWeight: 800,
                        padding: '3px 8px',
                        borderRadius: '6px',
                      }}
                    >
                      प्रमाणित ✅
                    </span>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigateTab('scanner');
                  }}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1.5px dashed #0F4C81',
                    color: '#0F4C81',
                    padding: '9px 14px',
                    borderRadius: '12px',
                    fontSize: '0.76rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    width: '100%',
                  }}
                >
                  + स्मार्ट स्क्यानरबाट नयाँ कागजात थप्नुहोस्
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Actions Bar */}
        <div
          style={{
            padding: '0.85rem 1rem',
            borderTop: '1px solid #E2E8F0',
            backgroundColor: '#ffffff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ fontSize: '0.7rem', color: '#64748B' }}>
            सत्र: <strong>सुरक्षित नागरिक खाता</strong>
          </div>

          <button
            type="button"
            onClick={() => {
              if (window.confirm('के तपाईं सुरक्षित रूपमा लगआउट गर्न चाहनुहुन्छ?')) {
                onLogout();
                onClose();
              }
            }}
            style={{
              backgroundColor: '#FEF2F2',
              color: '#DC2626',
              border: '1px solid #FECACA',
              padding: '7px 14px',
              borderRadius: '10px',
              fontSize: '0.74rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <LogOut size={14} />
            <span>लगआउट (अतिथि मोड)</span>
          </button>
        </div>
      </div>

      {/* ─── IN-APP MUNICIPAL PAYMENT GATEWAY MODAL ─── */}
      {isPaymentModalOpen && paymentModalData && (
        <MunicipalPaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          purpose={paymentModalData.purpose}
          amount={paymentModalData.amount}
          referenceNo={`PP-TAX-${Date.now().toString().slice(-6)}`}
          payerName={user.fullName}
          payerPhone={user.phone}
          wardNo={user.permanentAddress.wardNo}
          onPaymentSuccess={(newReceipt) => {
            const newRecord = {
              fiscalYear: newReceipt.fiscalYear,
              taxType: newReceipt.purpose,
              receiptNo: newReceipt.receiptNo,
              paidAmountRs: newReceipt.amountRs,
              discountRs: 125,
              paidDate: newReceipt.dateBs,
              paymentMethod: newReceipt.paymentGateway,
              status: 'चुक्ता' as const,
            };
            setTaxHistory((prev) => [newRecord, ...prev]);
          }}
        />
      )}
    </div>
  );
};
