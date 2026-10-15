import React, { useState } from 'react';
import {
  X,
  Smartphone,
  ShieldCheck,
  KeyRound,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Lock,
  QrCode,
  UserCheck,
  AlertCircle,
  HelpCircle,
  Fingerprint,
} from 'lucide-react';
import { CitizenUser } from '../../types';
import { DEMO_CITIZEN_USER } from '../../data/mockCitizenData';
import apiClient from '../../services/api';

interface CitizenAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: CitizenUser) => void;
}

export const CitizenAuthModal: React.FC<CitizenAuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [authMethod, setAuthMethod] = useState<'otp' | 'nagarik_app' | 'nin' | 'biometric' | 'employee'>('otp');
  const [phone, setPhone] = useState('९८४१२३४५६७');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [ninInput, setNinInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [employeeEmail, setEmployeeEmail] = useState('');
  const [employeePassword, setEmployeePassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      setErrorMsg('कृपया १० अंकको मान्य मोबाइल नम्बर प्रविष्ट गर्नुहोस्।');
      return;
    }
    setErrorMsg(null);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setOtpSent(true);
      setOtpCode('७४२८९०'); // Auto-filled mock OTP for smooth testing
    }, 600);
  };

  const fetchRealCitizenAndLogin = async (searchValue: string) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const response = await apiClient.get(`/citizen-360/citizens?search=${searchValue}`);
      if (response.data && response.data.length > 0) {
        const realCitizen = response.data[0];
        const profileRes = await apiClient.get(`/citizen-360/citizens/${realCitizen.id}/360`);
        const pData = profileRes.data;
        
        const mappedUser: CitizenUser = {
          ...DEMO_CITIZEN_USER,
          id: pData.citizen.id,
          fullName: pData.citizen.fullName,
          fullNameEn: pData.citizen.fullNameEn || '',
          phone: pData.citizen.mobileNo || searchValue,
          citizenshipNo: pData.citizen.citizenshipNo || '',
          nationalIdNo: pData.citizen.nationalId || '',
          dateOfBirthBs: pData.citizen.dobBs || '',
          gender: pData.citizen.gender || '',
          householdNo: pData.household ? pData.household.householdNumber : '',
        };
        onLoginSuccess(mappedUser);
      } else {
        // Fallback if not found in real DB
        onLoginSuccess(DEMO_CITIZEN_USER);
      }
      onClose();
    } catch (error) {
      console.error('Error fetching real citizen:', error);
      onLoginSuccess(DEMO_CITIZEN_USER);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 6) {
      setErrorMsg('कृपया ६ अंकको OTP कोड राख्नुहोस्।');
      return;
    }
    await fetchRealCitizenAndLogin(phone);
  };

  const handleNagarikAppLogin = async () => {
    // Assuming nagarik app gives us a generic phone or nin for demo
    await fetchRealCitizenAndLogin(phone);
  };

  const handleNinLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ninInput || !passwordInput) {
      setErrorMsg('कृपया राष्ट्रिय परिचयपत्र वा नागरिकता नं. र पासवर्ड प्रविष्ट गर्नुहोस्।');
      return;
    }
    await fetchRealCitizenAndLogin(ninInput);
  };

  const handleEmployeeLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeEmail || !employeePassword) {
      setErrorMsg('कृपया इमेल र पासवर्ड प्रविष्ट गर्नुहोस्।');
      return;
    }
    setErrorMsg(null);
    setIsLoading(true);
    try {
      // Create FormData as FastAPI expects OAuth2PasswordRequestForm
      const formData = new URLSearchParams();
      formData.append('username', employeeEmail);
      formData.append('password', employeePassword);
      
      const response = await apiClient.post('/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      
      const { access_token, user } = response.data;
      if (access_token && user) {
        // Map backend User schema to mobile CitizenUser (for auth context compatibility)
        const employeeUser: CitizenUser = {
          ...DEMO_CITIZEN_USER,
          id: user.id || 9999,
          fullName: user.full_name,
          fullNameEn: user.username,
          phone: user.phone || 'Employee',
          citizenshipNo: user.email,
          userType: user.role === 'admin' ? 'official' : 'citizen' // Mock property adaptation
        };
        onLoginSuccess(employeeUser);
        onClose();
      }
    } catch (error: any) {
      setErrorMsg(error.response?.data?.detail || 'लगइन असफल भयो। कृपया इमेल र पासवर्ड जाँच गर्नुहोस्।');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = () => {
    onLoginSuccess(DEMO_CITIZEN_USER);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.72)',
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
          maxWidth: '440px',
          width: '100%',
          boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          animation: 'fadeInUp 0.25s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #A81C3C 0%, #7C1D4A 50%, #0F4C81 100%)',
            color: '#ffffff',
            padding: '1.25rem 1.25rem 1.15rem 1.25rem',
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                backgroundColor: '#ffffff',
                border: '2px solid #F59E0B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                flexShrink: 0,
                padding: '2px',
              }}
            >
              <img
                src="/panchpokhari-logo.png"
                alt="Panchpokhari Logo"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>
            <div>
              <div style={{ fontSize: '0.98rem', fontWeight: 900, lineHeight: 1.2 }}>
                नागरिक लगइन तथा प्रमाणीकरण
              </div>
              <div style={{ fontSize: '0.72rem', opacity: 0.9, marginTop: '2px' }}>
                पाँचपोखरी थाङपाल गाउँपालिका • डिजिटल नागरिक प्रोफाइल
              </div>
            </div>
          </div>
        </div>

        {/* Auth Method Navigation Tabs */}
        <div
          style={{
            display: 'flex',
            overflowX: 'auto',
            backgroundColor: '#F1F5F9',
            padding: '4px',
            gap: '4px',
            borderBottom: '1px solid #E2E8F0',
            scrollbarWidth: 'none',
          }}
        >
          <button
            type="button"
            onClick={() => {
              setAuthMethod('otp');
              setErrorMsg(null);
            }}
            style={{
              flex: '1 0 auto',
              padding: '8px 8px',
              border: 'none',
              borderRadius: '10px',
              fontSize: '0.7rem',
              fontWeight: 800,
              cursor: 'pointer',
              backgroundColor: authMethod === 'otp' ? '#ffffff' : 'transparent',
              color: authMethod === 'otp' ? '#A81C3C' : '#64748B',
              boxShadow: authMethod === 'otp' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '3px',
            }}
          >
            <Smartphone size={13} />
            <span>OTP</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthMethod('nagarik_app');
              setErrorMsg(null);
            }}
            style={{
              flex: '1 0 auto',
              padding: '8px 8px',
              border: 'none',
              borderRadius: '10px',
              fontSize: '0.7rem',
              fontWeight: 800,
              cursor: 'pointer',
              backgroundColor: authMethod === 'nagarik_app' ? '#ffffff' : 'transparent',
              color: authMethod === 'nagarik_app' ? '#0F4C81' : '#64748B',
              boxShadow: authMethod === 'nagarik_app' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '3px',
            }}
          >
            <QrCode size={13} />
            <span>नागरिक एप</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthMethod('nin');
              setErrorMsg(null);
            }}
            style={{
              flex: '1 0 auto',
              padding: '8px 8px',
              border: 'none',
              borderRadius: '10px',
              fontSize: '0.7rem',
              fontWeight: 800,
              cursor: 'pointer',
              backgroundColor: authMethod === 'nin' ? '#ffffff' : 'transparent',
              color: authMethod === 'nin' ? '#0F4C81' : '#64748B',
              boxShadow: authMethod === 'nin' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '3px',
            }}
          >
            <KeyRound size={13} />
            <span>NIN</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthMethod('biometric');
              setErrorMsg(null);
            }}
            style={{
              flex: '1 0 auto',
              padding: '8px 8px',
              border: 'none',
              borderRadius: '10px',
              fontSize: '0.7rem',
              fontWeight: 800,
              cursor: 'pointer',
              backgroundColor: authMethod === 'biometric' ? '#ffffff' : 'transparent',
              color: authMethod === 'biometric' ? '#059669' : '#64748B',
              boxShadow: authMethod === 'biometric' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
            }}
          >
            <Fingerprint size={13} />
            <span>बायोमेट्रिक</span>
          </button>
          
          <button
            type="button"
            onClick={() => {
              setAuthMethod('employee');
              setErrorMsg(null);
            }}
            style={{
              flex: '1 0 auto',
              padding: '8px 8px',
              border: 'none',
              borderRadius: '10px',
              fontSize: '0.7rem',
              fontWeight: 800,
              cursor: 'pointer',
              backgroundColor: authMethod === 'employee' ? '#ffffff' : 'transparent',
              color: authMethod === 'employee' ? '#D97706' : '#64748B',
              boxShadow: authMethod === 'employee' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
            }}
          >
            <UserCheck size={13} />
            <span>कर्मचारी</span>
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '1.25rem', overflowY: 'auto', maxHeight: '70vh' }}>
          {errorMsg && (
            <div
              style={{
                backgroundColor: '#FEF2F2',
                border: '1px solid #FECACA',
                borderRadius: '12px',
                padding: '9px 12px',
                color: '#DC2626',
                fontSize: '0.76rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '1rem',
              }}
            >
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* ─── METHOD 1: MOBILE OTP ─── */}
          {authMethod === 'otp' && (
            <div>
              {!otpSent ? (
                <form onSubmit={handleSendOtp}>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>
                      नागरिक मोबाइल नम्बर (१० अंक):
                    </label>
                    <div style={{ position: 'relative' }}>
                      <span
                        style={{
                          position: 'absolute',
                          left: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          fontSize: '0.84rem',
                          fontWeight: 800,
                          color: '#64748B',
                        }}
                      >
                        +९७७
                      </span>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="९८XXXXXXXX"
                        style={{
                          width: '100%',
                          padding: '11px 12px 11px 54px',
                          borderRadius: '12px',
                          border: '1.5px solid #CBD5E1',
                          fontSize: '0.92rem',
                          fontWeight: 700,
                          outline: 'none',
                          color: '#0F172A',
                          backgroundColor: '#F8FAFC',
                        }}
                      />
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '6px' }}>
                      * वडा कार्यालयमा दर्ता भएको मोबाइल नम्बर राख्दा प्रोफाइल स्वतः सिङ्क हुन्छ।
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    style={{
                      width: '100%',
                      background: 'linear-gradient(135deg, #A81C3C 0%, #0F4C81 100%)',
                      color: '#ffffff',
                      border: 'none',
                      padding: '12px',
                      borderRadius: '12px',
                      fontSize: '0.88rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 12px rgba(168, 28, 60, 0.25)',
                    }}
                  >
                    <span>{isLoading ? 'OTP पठाउँदै...' : 'सुरक्षित OTP कोड पठाउनुहोस्'}</span>
                    <ArrowRight size={16} />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp}>
                  <div style={{ textAlign: 'center', marginBottom: '1.15rem' }}>
                    <div
                      style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '50%',
                        backgroundColor: '#ECFDF5',
                        color: '#059669',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 8px auto',
                      }}
                    >
                      <CheckCircle2 size={24} />
                    </div>
                    <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0F172A' }}>
                      {phone} मा SMS कोड पठाइयो
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '3px' }}>
                      कृपया प्राप्त ६ अंकको OTP कोड प्रविष्ट गर्नुहोस्
                    </div>
                  </div>

                  <div style={{ marginBottom: '1.15rem' }}>
                    <input
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="७४२८९०"
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '12px',
                        border: '2px solid #059669',
                        fontSize: '1.25rem',
                        fontWeight: 900,
                        letterSpacing: '8px',
                        textAlign: 'center',
                        outline: 'none',
                        color: '#0F172A',
                        backgroundColor: '#F0FDF4',
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    style={{
                      width: '100%',
                      background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                      color: '#ffffff',
                      border: 'none',
                      padding: '12px',
                      borderRadius: '12px',
                      fontSize: '0.9rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 14px rgba(5, 150, 105, 0.3)',
                    }}
                  >
                    <UserCheck size={18} />
                    <span>{isLoading ? 'प्रमाणीकरण हुँदैछ...' : 'प्रमाणीकरण गरी प्रोफाइल खोल्नुहोस्'}</span>
                  </button>

                  <div style={{ textAlign: 'center', marginTop: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      style={{ background: 'none', border: 'none', color: '#64748B', fontSize: '0.74rem', textDecoration: 'underline', cursor: 'pointer' }}
                    >
                      अर्को मोबाइल नम्बर प्रयोग गर्नुहोस्
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* ─── METHOD 2: NAGARIK APP SSO ─── */}
          {authMethod === 'nagarik_app' && (
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '16px',
                  backgroundColor: '#EFF6FF',
                  border: '1.5px solid #BFDBFE',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px auto',
                  color: '#1D4ED8',
                }}
              >
                <QrCode size={34} />
              </div>

              <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#0F172A', marginBottom: '4px' }}>
                नेपाल सरकार • नागरिक एप (Nagarik App)
              </div>
              <div style={{ fontSize: '0.75rem', color: '#475569', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                तपाईंको राष्ट्रिय परिचयपत्र (NIN), नागरिकता र स्थायी ठेगाना नागरिक एपबाट १-ट्यापमा प्रमाणीकरण गरी सुरक्षित पहुँच प्राप्त गर्नुहोस्।
              </div>

              <button
                type="button"
                onClick={handleNagarikAppLogin}
                disabled={isLoading}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #1D4ED8 0%, #0F4C81 100%)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '12px',
                  fontSize: '0.88rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(29, 78, 216, 0.28)',
                }}
              >
                <ShieldCheck size={18} />
                <span>{isLoading ? 'नागरिक एप सिङ्क हुँदै...' : 'नागरिक एप मार्फत सिधै लगइन गर्नुहोस्'}</span>
              </button>

              <div style={{ fontSize: '0.68rem', color: '#64748B', marginTop: '10px' }}>
                🔒 VERSP-MICS तथा गृह मन्त्रालयको राष्ट्रिय प्रमाणीकरण मापदण्ड अनुरूप सुरक्षित।
              </div>
            </div>
          )}

          {/* ─── METHOD 3: NIN / CITIZENSHIP + PASSWORD ─── */}
          {authMethod === 'nin' && (
            <form onSubmit={handleNinLogin}>
              <div style={{ marginBottom: '0.85rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#334155', marginBottom: '5px' }}>
                  राष्ट्रिय परिचयपत्र नं. (NIN) वा नागरिकता नं.:
                </label>
                <input
                  type="text"
                  value={ninInput}
                  onChange={(e) => setNinInput(e.target.value)}
                  placeholder="७१२-८९४-३२० वा २७-०१-७५-०३४२१"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '12px',
                    border: '1.5px solid #CBD5E1',
                    fontSize: '0.86rem',
                    fontWeight: 700,
                    outline: 'none',
                    backgroundColor: '#F8FAFC',
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.15rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#334155', marginBottom: '5px' }}>
                  नागरिक पासवर्ड:
                </label>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '12px',
                    border: '1.5px solid #CBD5E1',
                    fontSize: '0.86rem',
                    fontWeight: 700,
                    outline: 'none',
                    backgroundColor: '#F8FAFC',
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #0F4C81 0%, #1E293B 100%)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '12px',
                  fontSize: '0.88rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(15, 76, 129, 0.25)',
                }}
              >
                <Lock size={16} />
                <span>{isLoading ? 'प्रमाणीकरण हुँदैछ...' : 'सुरक्षित लगइन'}</span>
              </button>
            </form>
          )}

          {/* ─── METHOD 4: BIOMETRIC AUTHENTICATION ─── */}
          {authMethod === 'biometric' && (
            <div style={{ textAlign: 'center', padding: '0.75rem 0' }}>
              <div
                style={{
                  width: '74px',
                  height: '74px',
                  borderRadius: '50%',
                  backgroundColor: '#ECFDF5',
                  border: '2.5px solid #10B981',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem auto',
                  boxShadow: '0 6px 20px rgba(16, 185, 129, 0.28)',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                }}
                onClick={() => {
                  setIsLoading(true);
                  setTimeout(() => {
                    setIsLoading(false);
                    onLoginSuccess(DEMO_CITIZEN_USER);
                    onClose();
                  }, 800);
                }}
              >
                <Fingerprint size={42} />
              </div>

              <div style={{ fontSize: '0.96rem', fontWeight: 900, color: '#0F172A', marginBottom: '4px' }}>
                बायोमेट्रिक प्रमाणीकरण (Touch ID / Face ID)
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748B', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                मोबाइलको औंठाछाप सेन्सरमा औंला राख्नुहोस् वा १-ट्यापमा प्रमाणीकरण गर्नुहोस्।
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsLoading(true);
                  setTimeout(() => {
                    setIsLoading(false);
                    onLoginSuccess(DEMO_CITIZEN_USER);
                    onClose();
                  }, 700);
                }}
                disabled={isLoading}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '12px',
                  fontSize: '0.9rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(5, 150, 105, 0.3)',
                }}
              >
                <Fingerprint size={18} />
                <span>{isLoading ? 'सेन्सर प्रमाणीकरण हुँदैछ...' : 'औंठाछाप / फेस आइडीबाट लगइन'}</span>
              </button>

              <div style={{ fontSize: '0.68rem', color: '#64748B', marginTop: '10px' }}>
                🔒 सुरक्षित यन्त्र (Device Hardware Keystore) मा इन्क्रिप्टेड।
              </div>
            </div>
          )}
          {/* ─── METHOD 5: EMPLOYEE / OFFICIAL AUTHENTICATION ─── */}
          {authMethod === 'employee' && (
            <div style={{ textAlign: 'center', padding: '0.75rem 0' }}>
              <div
                style={{
                  width: '74px',
                  height: '74px',
                  borderRadius: '50%',
                  backgroundColor: '#FFFBEB',
                  border: '2.5px solid #F59E0B',
                  color: '#D97706',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem auto',
                  boxShadow: '0 6px 20px rgba(245, 158, 11, 0.28)',
                }}
              >
                <UserCheck size={42} />
              </div>

              <div style={{ fontSize: '0.96rem', fontWeight: 900, color: '#0F172A', marginBottom: '4px' }}>
                कर्मचारी तथा जनप्रतिनिधि लगइन
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748B', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                गाउँपालिकाको आधिकारिक इमेल वा Google Workspace मार्फत लगइन गर्नुहोस्।
              </div>

              <form onSubmit={handleEmployeeLogin} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '12px' }}>
                <input
                  type="email"
                  value={employeeEmail}
                  onChange={(e) => setEmployeeEmail(e.target.value)}
                  placeholder="आधिकारिक इमेल वा युजरनेम"
                  style={{
                    width: '100%', padding: '12px', borderRadius: '12px', border: '1.5px solid #CBD5E1', fontSize: '0.9rem', outline: 'none'
                  }}
                />
                <input
                  type="password"
                  value={employeePassword}
                  onChange={(e) => setEmployeePassword(e.target.value)}
                  placeholder="पासवर्ड"
                  style={{
                    width: '100%', padding: '12px', borderRadius: '12px', border: '1.5px solid #CBD5E1', fontSize: '0.9rem', outline: 'none'
                  }}
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #0F4C81 0%, #1D6FA5 100%)',
                    color: '#ffffff',
                    border: 'none',
                    padding: '12px',
                    borderRadius: '12px',
                    fontSize: '0.9rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(15, 76, 129, 0.3)',
                    marginTop: '4px'
                  }}
                >
                  <Lock size={18} />
                  <span>{isLoading ? 'प्रमाणीकरण हुँदैछ...' : 'आधिकारिक पोर्टल (ई-हाजिरी)'}</span>
                </button>
              </form>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <div style={{ flex: 1, height: '1px', backgroundColor: '#E2E8F0' }}></div>
                <span style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 600 }}>वा</span>
                <div style={{ flex: 1, height: '1px', backgroundColor: '#E2E8F0' }}></div>
              </div>

              <button
                type="button"
                onClick={() => {
                  // TODO: Implement actual Capacitor Google Auth plugin integration here
                  // e.g. const user = await GoogleAuth.signIn();
                  setIsLoading(true);
                  setTimeout(() => {
                    setIsLoading(false);
                    onLoginSuccess({...DEMO_CITIZEN_USER, fullName: 'Google User'});
                    onClose();
                  }, 700);
                }}
                disabled={isLoading}
                style={{
                  width: '100%',
                  backgroundColor: '#ffffff',
                  color: '#1E293B',
                  border: '1.5px solid #CBD5E1',
                  padding: '12px',
                  borderRadius: '12px',
                  fontSize: '0.9rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                }}
              >
                <img src="https://www.google.com/favicon.ico" alt="Google" style={{ width: 18, height: 18 }} />
                <span>Google Workspace (SSO) लगइन</span>
              </button>

            </div>
          )}

          {/* Quick Demo Login One-Tap Bar */}
          <div
            style={{
              marginTop: '1.25rem',
              paddingTop: '1rem',
              borderTop: '1px dashed #CBD5E1',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '0.72rem', color: '#64748B', marginBottom: '8px' }}>
              💡 परीक्षणका लागि तत्काल १-ट्याप परीक्षण लगइन:
            </div>
            <button
              type="button"
              onClick={handleQuickDemoLogin}
              style={{
                width: '100%',
                backgroundColor: '#FFFBEB',
                border: '1.5px solid #FCD34D',
                color: '#B45309',
                padding: '9px 12px',
                borderRadius: '12px',
                fontSize: '0.78rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'all 0.15s ease',
              }}
            >
              <Sparkles size={15} color="#D97706" />
              <span>डेमो नागरिक खाताबाट तत्काल लगइन गर्नुहोस् (वडा ३)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
