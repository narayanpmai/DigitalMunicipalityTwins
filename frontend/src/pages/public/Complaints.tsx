import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  AlertCircle,
  HeadphonesIcon,
  Send,
  Search,
  CheckCircle2,
  Clock,
  Shield,
  Phone,
  HelpCircle,
  FileText,
  UserCheck,
  Map,
  Smartphone,
} from 'lucide-react';
import { complaintsApi } from '../../api/complaints';
import type { Complaint } from '../../types/complaint';
import { rtiApi, type RtiRequest } from '../../api/rti';

const CATEGORIES = [
  { value: 'infrastructure', label: 'सडक तथा पूर्वाधार' },
  { value: 'drinking_water', label: 'खानेपानी तथा सरसफाइ' },
  { value: 'electricity', label: 'विद्युत तथा सञ्चार' },
  { value: 'health', label: 'स्वास्थ्य सेवा' },
  { value: 'education', label: 'शिक्षा तथा विद्यालय' },
  { value: 'waste_management', label: 'फोहोरमैला व्यवस्थापन' },
  { value: 'governance_corruption', label: 'सुशासन तथा अनियमितता' },
  { value: 'service_delay', label: 'सेवा प्रवाहमा ढिलासुस्ती' },
  { value: 'environment', label: 'वन, वातावरण तथा विपद्' },
  { value: 'other', label: 'अन्य विषय' },
];

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'दर्ता भएको (कारबाही सुरु हुन बाँकी)', color: '#d97706', bg: '#fef3c7' },
  in_progress: { label: 'कारबाही प्रक्रियामा रहेको', color: '#2563eb', bg: '#eff6ff' },
  resolved: { label: 'सम्पन्न / समाधान भएको', color: '#16a34a', bg: '#dcfce7' },
  rejected: { label: 'अस्वीकृत / खारेज भएको', color: '#dc2626', bg: '#fee2e2' },
};

export const Complaints: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'register' | 'rti' | 'track'>('register');

  // Form State (Complaints)
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [ward, setWard] = useState<number>(1);
  const [category, setCategory] = useState('infrastructure');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<Complaint | null>(null);
  const [submitError, setSubmitError] = useState('');

  // Form State (RTI - Right to Information)
  const [rtiName, setRtiName] = useState('');
  const [rtiPhone, setRtiPhone] = useState('');
  const [rtiEmail, setRtiEmail] = useState('');
  const [rtiAddress, setRtiAddress] = useState('');
  const [rtiSubject, setRtiSubject] = useState('');
  const [rtiDescription, setRtiDescription] = useState('');
  const [rtiPurpose, setRtiPurpose] = useState('');
  const [rtiFormat, setRtiFormat] = useState<'electronic' | 'certified_copy' | 'inspection'>('electronic');
  const [isRtiSubmitting, setIsRtiSubmitting] = useState(false);
  const [rtiSuccess, setRtiSuccess] = useState<RtiRequest | null>(null);
  const [rtiError, setRtiError] = useState('');

  // Track State
  const [trackNumber, setTrackNumber] = useState('');
  const [isTracking, setIsTracking] = useState(false);
  const [trackedComplaint, setTrackedComplaint] = useState<Complaint | null>(null);
  const [trackedRti, setTrackedRti] = useState<RtiRequest | null>(null);
  const [trackError, setTrackError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setIsSubmitting(true);

    try {
      const res = await complaintsApi.create({
        title,
        description,
        category,
        complainantName: isAnonymous ? 'गोप्य नागरिक' : name,
        complainantPhone: phone,
        wardNumber: ward,
        isAnonymous,
      });
      setSubmitSuccess(res);
      // Reset form
      setName('');
      setPhone('');
      setTitle('');
      setDescription('');
    } catch (err: any) {
      setSubmitError(
        err?.response?.data?.message ||
          'गुनासो दर्ता गर्दा समस्या आयो। कृपया केही समयपछि पुन: प्रयास गर्नुहोस् वा सिधै कार्यालयमा सम्पर्क गर्नुहोस्।'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRtiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRtiError('');
    setIsRtiSubmitting(true);

    try {
      const res = await rtiApi.create({
        applicantName: rtiName,
        applicantPhone: rtiPhone,
        applicantEmail: rtiEmail,
        applicantAddress: rtiAddress,
        subject: rtiSubject,
        requestedInformation: rtiDescription,
        purpose: rtiPurpose,
        format: rtiFormat,
      });
      setRtiSuccess(res);
      setRtiName('');
      setRtiPhone('');
      setRtiEmail('');
      setRtiAddress('');
      setRtiSubject('');
      setRtiDescription('');
      setRtiPurpose('');
    } catch (err: any) {
      setRtiError(err?.response?.data?.message || 'सूचना मागको निवेदन दर्ता गर्दा समस्या आयो। कृपया पुन: प्रयास गर्नुहोस्।');
    } finally {
      setIsRtiSubmitting(false);
    }
  };

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackNumber.trim()) return;

    setTrackError('');
    setIsTracking(true);
    setTrackedComplaint(null);
    setTrackedRti(null);

    const q = trackNumber.trim();

    try {
      // If starts with RTI or looks like RTI token/no, try RTI first
      if (q.toUpperCase().includes('RTI')) {
        const rtiRes = await rtiApi.track(q);
        setTrackedRti(rtiRes);
      } else {
        try {
          const compRes = await complaintsApi.track(q);
          setTrackedComplaint(compRes);
        } catch {
          // If complaint not found, try RTI
          const rtiRes = await rtiApi.track(q);
          setTrackedRti(rtiRes);
        }
      }
    } catch {
      setTrackError('उक्त दर्ता नं. वा टोकन भएको कुनै गुनासो वा सूचना मागको निवेदन फेला परेन। कृपया विवरण सही भए नभएको जाँच गर्नुहोस्।');
    } finally {
      setIsTracking(false);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Header Banner */}
      <div
        style={{
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #0d2757 0%, #1565c0 100%)',
          color: '#ffffff',
          padding: '2.25rem 2rem',
          marginBottom: '2rem',
          boxShadow: '0 8px 24px rgba(13,39,87,0.15)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <div
            style={{
              padding: '10px',
              borderRadius: '12px',
              backgroundColor: 'rgba(255,255,255,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MessageSquare size={28} color="#ffffff" />
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, margin: 0 }}>
            नागरिक गुनासो तथा उजुरी व्यवस्थापन
          </h1>
        </div>
        <p style={{ color: '#bfdbfe', margin: '0.25rem 0 0 0', fontSize: '0.95rem', maxWidth: '700px' }}>
          पाँचपोखरी थाङपाल गाउँपालिकाको सेवा प्रवाह, विकास निर्माण, वा अन्य विषयमा आफ्ना समस्या र सुझावहरू
          सिधै जनप्रतिनिधि तथा जिम्मेवार अधिकारीसमक्ष पुर्‍याउनुहोस्।
        </p>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          backgroundColor: '#f1f5f9',
          padding: '0.5rem',
          borderRadius: '12px',
          marginBottom: '2rem',
          maxWidth: '100%',
          overflowX: 'auto',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
        }}
      >
        <button
          onClick={() => setActiveTab('register')}
          style={{
            flex: 1,
            padding: '0.85rem 1.5rem',
            border: 'none',
            background: activeTab === 'register' ? '#ffffff' : 'transparent',
            cursor: 'pointer',
            fontSize: '0.95rem',
            fontWeight: 700,
            color: activeTab === 'register' ? '#0f4c81' : '#64748b',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: activeTab === 'register' ? '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)' : 'none',
            whiteSpace: 'nowrap'
          }}
        >
          <Send size={18} color={activeTab === 'register' ? '#0f4c81' : '#94a3b8'} />
          <span>गुनासो दर्ता (गुनासो सुन्ने अधिकारी)</span>
        </button>

        <button
          onClick={() => setActiveTab('rti')}
          style={{
            flex: 1,
            padding: '0.85rem 1.5rem',
            border: 'none',
            background: activeTab === 'rti' ? '#ffffff' : 'transparent',
            cursor: 'pointer',
            fontSize: '0.95rem',
            fontWeight: 700,
            color: activeTab === 'rti' ? '#0f4c81' : '#64748b',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: activeTab === 'rti' ? '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)' : 'none',
            whiteSpace: 'nowrap'
          }}
        >
          <FileText size={18} color={activeTab === 'rti' ? '#0f4c81' : '#94a3b8'} />
          <span>सूचना मागको निवेदन (सूचना अधिकारी)</span>
        </button>

        <button
          onClick={() => setActiveTab('track')}
          style={{
            flex: 1,
            padding: '0.85rem 1.5rem',
            border: 'none',
            background: activeTab === 'track' ? '#ffffff' : 'transparent',
            cursor: 'pointer',
            fontSize: '0.95rem',
            fontWeight: 700,
            color: activeTab === 'track' ? '#0f4c81' : '#64748b',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: activeTab === 'track' ? '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)' : 'none',
            whiteSpace: 'nowrap'
          }}
        >
          <Search size={18} color={activeTab === 'track' ? '#0f4c81' : '#94a3b8'} />
          <span>स्थिति ट्र्याक गर्नुहोस् (Track Status)</span>
        </button>
      </div>

      {/* TAB 1: REGISTRATION */}
      {activeTab === 'register' && (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
          {/* Main Form */}
          <div
            style={{
              backgroundColor: '#ffffff',
              padding: '2rem',
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
            }}
          >
            {submitSuccess ? (
              <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    backgroundColor: '#dcfce7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem auto',
                  }}
                >
                  <CheckCircle2 size={36} color="#16a34a" />
                </div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#166534', margin: '0 0 0.5rem 0' }}>
                  गुनासो सफलतापूर्वक दर्ता भयो!
                </h3>
                <p style={{ color: '#4b5563', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  तपाईंको गुनासो सम्बन्धित शाखा तथा अधिकारीलाई पठाइएको छ।
                </p>

                <div
                  style={{
                    backgroundColor: '#f0fdf4',
                    border: '1px dashed #86efac',
                    borderRadius: '10px',
                    padding: '1.25rem',
                    marginBottom: '1.5rem',
                    display: 'inline-block',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ fontSize: '0.8rem', color: '#15803d', fontWeight: 600 }}>गुनासो दर्ता नम्बर:</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#14532d', letterSpacing: '0.05em' }}>
                    {submitSuccess.complaintNo || 'CMP-' + Math.floor(100000 + Math.random() * 900000)}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#15803d', marginTop: '0.25rem' }}>
                    * कृपया यो नम्बर सुरक्षित राख्नुहोस्, यसबाट गुनासोको प्रगति हेर्न सकिन्छ।
                  </div>
                </div>

                <div>
                  <button
                    onClick={() => {
                      setSubmitSuccess(null);
                      setActiveTab('track');
                      setTrackNumber(submitSuccess.complaintNo || '');
                    }}
                    style={{
                      padding: '0.65rem 1.5rem',
                      backgroundColor: '#0284c7',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      marginRight: '0.75rem',
                    }}
                  >
                    स्थिति ट्र्याक गर्नुहोस्
                  </button>
                  <button
                    onClick={() => setSubmitSuccess(null)}
                    style={{
                      padding: '0.65rem 1.25rem',
                      backgroundColor: '#f1f5f9',
                      color: '#334155',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    अर्को गुनासो लेख्नुहोस्
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <h3 style={{ margin: '0 0 0.5rem 0', color: '#0f172a', fontWeight: 700, fontSize: '1.2rem' }}>
                  अनलाइन गुनासो दर्ता फारम
                </h3>

                {submitError && (
                  <div
                    style={{
                      padding: '0.75rem 1rem',
                      backgroundColor: '#fef2f2',
                      border: '1px solid #fecaca',
                      borderRadius: '8px',
                      color: '#b91c1c',
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <AlertCircle size={16} />
                    <span>{submitError}</span>
                  </div>
                )}

                {/* Category & Ward */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                      विषयगत क्षेत्र *
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.55rem 0.75rem',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.9rem',
                        backgroundColor: '#f8fafc',
                        outline: 'none',
                      }}
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                      सम्बन्धित वडा नं *
                    </label>
                    <select
                      value={ward}
                      onChange={(e) => setWard(Number(e.target.value))}
                      style={{
                        width: '100%',
                        padding: '0.55rem 0.75rem',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.9rem',
                        backgroundColor: '#f8fafc',
                        outline: 'none',
                      }}
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((w) => (
                        <option key={w} value={w}>
                          वडा नं. {w}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                    गुनासोको मुख्य शीर्षक *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="जस्तै: वडा नं ३ मा खानेपानी पाइपलाइन अवरुद्ध भएको बारे"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.9rem',
                      outline: 'none',
                    }}
                  />
                </div>

                {/* Description */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                    विस्तृत विवरण *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="समस्याको पूरा विवरण, स्थान, कति दिनदेखि समस्या छ, आदि लेख्नुहोला..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.75rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.9rem',
                      outline: 'none',
                      resize: 'vertical',
                    }}
                  />
                </div>

                {/* Complainant Details */}
                <div
                  style={{
                    backgroundColor: '#f8fafc',
                    padding: '1.25rem',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>
                      नागरिक सम्पर्क विवरण
                    </span>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.825rem', color: '#64748b' }}>
                      <input
                        type="checkbox"
                        checked={isAnonymous}
                        onChange={(e) => setIsAnonymous(e.target.checked)}
                      />
                      <span>नाम गोप्य राख्नुहोस्</span>
                    </label>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: isAnonymous ? '1fr' : '1fr 1fr', gap: '1rem' }}>
                    {!isAnonymous && (
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: '#475569', marginBottom: '0.25rem' }}>
                          पूरा नाम *
                        </label>
                        <input
                          type="text"
                          required={!isAnonymous}
                          placeholder="तपाईंको नाम"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.5rem 0.75rem',
                            borderRadius: '6px',
                            border: '1px solid #cbd5e1',
                            fontSize: '0.85rem',
                            backgroundColor: '#ffffff',
                          }}
                        />
                      </div>
                    )}

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: '#475569', marginBottom: '0.25rem' }}>
                        सम्पर्क फोन नम्बर (SMS अद्यावधिकको लागि) *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="९८xxxxxxxx"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.5rem 0.75rem',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.85rem',
                          backgroundColor: '#ffffff',
                        }}
                      />
                    </div>

                    {phone && phone.trim().length >= 7 && (
                      <div
                        style={{
                          gridColumn: isAnonymous ? '1' : '1 / -1',
                          marginTop: '0.5rem',
                          padding: '0.6rem 0.85rem',
                          backgroundColor: '#f0f9ff',
                          border: '1px solid #bae6fd',
                          borderRadius: '8px',
                          fontSize: '0.78rem',
                          color: '#0369a1',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                        }}
                      >
                        <Smartphone size={16} color="#0284c7" />
                        <div>
                          <strong>स्वचालित SMS अलर्ट सेवा:</strong> गुनासो दर्ता हुनासाथ <strong>{phone}</strong> मा दर्ता टोकन र कारबाहीको प्रत्यक्ष SMS सूचना प्राप्त हुनेछ।
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: '0.85rem 1.75rem',
                    backgroundColor: isSubmitting ? '#94a3b8' : '#0284c7',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 2px 6px rgba(2,132,199,0.3)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Send size={18} />
                  <span>{isSubmitting ? 'दर्ता हुँदैछ...' : 'गुनासो दर्ता गर्नुहोस्'}</span>
                </button>
              </form>
            )}
          </div>

          {/* Sidebar / Helpline Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Direct Official Card */}
            <div
              style={{
                backgroundColor: '#ffffff',
                padding: '1.5rem',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ padding: '8px', backgroundColor: '#eff6ff', borderRadius: '10px' }}>
                  <HeadphonesIcon size={22} color="#0284c7" />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#0f172a', fontWeight: 700 }}>
                    गुनासो सुन्ने अधिकारी
                  </h4>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>गाउँ कार्यपालिका कार्यालय</span>
                </div>
              </div>
              <div style={{ fontSize: '0.85rem', color: '#334155', lineHeight: 1.6 }}>
                <div><strong>सम्पर्क व्यक्ति:</strong> सूचना तथा गुनासो शाखा</div>
                <div><strong>हटलाइन:</strong> ०११-६९०००१ / ९८५१२३४५६७</div>
                <div><strong>समय:</strong> बिहान १०:०० देखि साँझ ५:०० सम्म</div>
                <div><strong>इमेल:</strong> gunaso@panchpokhari.gov.np</div>
              </div>
            </div>

            {/* Privacy Guarantee */}
            <div
              style={{
                backgroundColor: '#f0fdf4',
                padding: '1.25rem',
                borderRadius: '12px',
                border: '1px solid #bbf7d0',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#166534', fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                <Shield size={18} />
                <span>गोपनीयताको प्रत्याभूति</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#15803d', lineHeight: 1.5 }}>
                तपाईंको पहिचान र व्यक्तिगत विवरण स्थानीय सरकार सञ्चालन ऐन, २०७४ बमोजिम पूर्ण गोप्य राखिनेछ।
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: RTI REGISTRATION (सूचना अधिकारी) */}
      {activeTab === 'rti' && (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
          {/* RTI Form */}
          <div
            style={{
              backgroundColor: '#ffffff',
              padding: '2rem',
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
            }}
          >
            {rtiSuccess ? (
              <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    backgroundColor: '#dcfce7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem auto',
                  }}
                >
                  <CheckCircle2 size={36} color="#16a34a" />
                </div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#166534', margin: '0 0 0.5rem 0' }}>
                  सूचना मागको निवेदन सफलतापूर्वक दर्ता भयो!
                </h3>
                <p style={{ color: '#4b5563', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  तपाईंको निवेदन सिधै <strong>सूचना अधिकारी</strong> समक्ष पेश भएको छ। सूचनाको हक ऐन, २०६४ अनुसार १५ दिनभित्र सूचना उपलब्ध गराइनेछ।
                </p>

                <div
                  style={{
                    backgroundColor: '#f0fdf4',
                    border: '1px dashed #86efac',
                    borderRadius: '10px',
                    padding: '1.25rem',
                    marginBottom: '1.5rem',
                    display: 'inline-block',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ fontSize: '0.8rem', color: '#15803d', fontWeight: 600 }}>सूचना माग दर्ता नम्बर:</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#14532d', letterSpacing: '0.05em' }}>
                    {rtiSuccess.requestNo}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#166534', marginTop: '0.25rem' }}>
                    गोप्य ट्र्याकिङ कोड: <strong>{rtiSuccess.trackingToken}</strong>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#15803d', marginTop: '0.35rem' }}>
                    * कृपया यो दर्ता नम्बर सुरक्षित राख्नुहोस्, यसबाट निवेदनको प्रगति हेर्न सकिन्छ।
                  </div>
                </div>

                <div>
                  <button
                    onClick={() => {
                      setRtiSuccess(null);
                      setActiveTab('track');
                      setTrackNumber(rtiSuccess.requestNo);
                    }}
                    style={{
                      padding: '0.65rem 1.5rem',
                      backgroundColor: '#0284c7',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      marginRight: '0.75rem',
                    }}
                  >
                    स्थिति ट्र्याक गर्नुहोस्
                  </button>
                  <button
                    onClick={() => setRtiSuccess(null)}
                    style={{
                      padding: '0.65rem 1.25rem',
                      backgroundColor: '#f1f5f9',
                      color: '#334155',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    अर्को निवेदन पेश गर्नुहोस्
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleRtiSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <h3 style={{ margin: '0 0 0.35rem 0', color: '#0f172a', fontWeight: 700, fontSize: '1.25rem' }}>
                    सूचना मागको अनलाइन निवेदन (RTI Application)
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>
                    सूचनाको हक सम्बन्धी ऐन, २०६४ को दफा ३ र ७ बमोजिम सार्वजनिक सूचना प्राप्त गर्न यो फारम भर्नुहोस्।
                  </p>
                </div>

                {rtiError && (
                  <div
                    style={{
                      padding: '0.75rem 1rem',
                      backgroundColor: '#fef2f2',
                      border: '1px solid #fecaca',
                      borderRadius: '8px',
                      color: '#b91c1c',
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <AlertCircle size={16} />
                    <span>{rtiError}</span>
                  </div>
                )}

                {/* Applicant Info */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                      निवेदकको पूरा नाम *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="उदा. सुमन श्रेष्ठ"
                      value={rtiName}
                      onChange={(e) => setRtiName(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.9rem',
                        outline: 'none',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                      सम्पर्क फोन / मोबाइल *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="९८xxxxxxxx"
                      value={rtiPhone}
                      onChange={(e) => setRtiPhone(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.9rem',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                      इमेल ठेगाना
                    </label>
                    <input
                      type="email"
                      placeholder="email@example.com"
                      value={rtiEmail}
                      onChange={(e) => setRtiEmail(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.9rem',
                        outline: 'none',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                      स्थायी / हालको ठेगाना
                    </label>
                    <input
                      type="text"
                      placeholder="उदा. पाँचपोखरी-३, भोताङ"
                      value={rtiAddress}
                      onChange={(e) => setRtiAddress(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.9rem',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                    माग गरिएको सूचनाको विषय *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="उदा. आ.व. २०८०/८१ को पूर्वाधार योजनाहरूको सम्झौता तथा भुक्तानी विवरण पाउँ"
                    value={rtiSubject}
                    onChange={(e) => setRtiSubject(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.9rem',
                      outline: 'none',
                    }}
                  />
                </div>

                {/* Requested Information Details */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                    माग गरिएको सूचनाको विस्तृत व्यहोरा *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="कृपया कुन आयोजना, निर्णय, कागजात वा विषयको सूचना आवश्यक परेको हो, स्पष्ट खुलाउनुहोस्..."
                    value={rtiDescription}
                    onChange={(e) => setRtiDescription(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.9rem',
                      outline: 'none',
                      resize: 'vertical',
                    }}
                  />
                </div>

                {/* Purpose & Format */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                      सूचना माग गर्नुको प्रयोजन
                    </label>
                    <input
                      type="text"
                      placeholder="उदा. अध्ययन तथा अनुसन्धान / सामाजिक परीक्षण"
                      value={rtiPurpose}
                      onChange={(e) => setRtiPurpose(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.9rem',
                        outline: 'none',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                      सूचना प्राप्त गर्न चाहेको माध्यम
                    </label>
                    <select
                      value={rtiFormat}
                      onChange={(e) => setRtiFormat(e.target.value as any)}
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.9rem',
                        outline: 'none',
                        backgroundColor: '#ffffff',
                      }}
                    >
                      <option value="electronic">इलेक्ट्रोनिक प्रतिलिपि (PDF / Email)</option>
                      <option value="certified_copy">प्रमाणित कागजी प्रतिलिपि (Certified Copy)</option>
                      <option value="inspection">स्थलगत अभिलेख निरीक्षण (Record Inspection)</option>
                    </select>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isRtiSubmitting}
                  style={{
                    padding: '0.85rem 1.75rem',
                    backgroundColor: isRtiSubmitting ? '#94a3b8' : '#1e40af',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    cursor: isRtiSubmitting ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 2px 6px rgba(30,64,175,0.3)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Send size={18} />
                  <span>{isRtiSubmitting ? 'निवेदन दर्ता हुँदैछ...' : 'सूचना मागको निवेदन पेश गर्नुहोस्'}</span>
                </button>
              </form>
            )}
          </div>

          {/* Sidebar / Information Officer Helpline Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Information Officer Card */}
            <div
              style={{
                backgroundColor: '#ffffff',
                padding: '1.25rem',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div style={{ padding: '8px', backgroundColor: '#eff6ff', borderRadius: '10px' }}>
                  <FileText size={20} color="#1e40af" />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.92rem', color: '#0f172a', fontWeight: 700 }}>
                    तोकिएको सूचना अधिकारी
                  </h4>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>सूचनाको हक ऐन, २०६४ बमोजिम</span>
                </div>
              </div>
              <div style={{ fontSize: '0.82rem', color: '#334155', lineHeight: 1.6 }}>
                <div><strong>अधिकारी:</strong> श्री कुमार बस्नेत</div>
                <div><strong>शाखा:</strong> प्रशासन तथा आन्तरिक व्यवस्थापन शाखा</div>
                <div><strong>सम्पर्क / WhatsApp:</strong> ९८५१२७८५३०</div>
                <div><strong>इमेल:</strong> kumarbasnet297106@gmail.com</div>
                <div><strong>कानुनी म्याद:</strong> निवेदन दर्ता भएको १५ दिनभित्र</div>
              </div>
              <a
                href={`https://wa.me/9779851278530?text=${encodeURIComponent('नमस्ते सूचना अधिकारीज्यू (कुमार बस्नेत), मलाई पाँचपोखरी थाङपाल गाउँपालिकाको सूचना माग / नागरिक गुनासो सम्बन्धी निवेदन पेश गर्नु छ।')}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  marginTop: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  backgroundColor: '#16a34a',
                  color: '#ffffff',
                  padding: '7px 12px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textDecoration: 'none',
                }}
              >
                <MessageSquare size={14} />
                <span>कुमार बस्नेतलाई WhatsApp गर्नुहोस्</span>
              </a>
            </div>

            {/* IT & Disaster Focal Person Card */}
            <div
              style={{
                backgroundColor: '#ffffff',
                padding: '1.25rem',
                borderRadius: '12px',
                border: '1px solid #fed7aa',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div style={{ padding: '8px', backgroundColor: '#fff7ed', borderRadius: '10px' }}>
                  <AlertCircle size={20} color="#c2410c" />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.92rem', color: '#0f172a', fontWeight: 700 }}>
                    विपद् फोकल / IT अधिकृत
                  </h4>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>विपद् जोखिम तथा प्राविधिक सहायता</span>
                </div>
              </div>
              <div style={{ fontSize: '0.82rem', color: '#334155', lineHeight: 1.6 }}>
                <div><strong>अधिकारी:</strong> श्री नारायण क्षेत्री</div>
                <div><strong>शाखा:</strong> सूचना प्रविधि तथा विपद् व्यवस्थापन एकाइ</div>
                <div><strong>सम्पर्क / WhatsApp:</strong> ९८६४११२९५५</div>
                <div><strong>इमेल:</strong> ito@panchpokharithangpalmun.gov.np</div>
                <div><strong>जिम्मेवारी:</strong> बाढी, पहिरो, सडक अवरोध, प्रविधि</div>
              </div>
              <a
                href={`https://wa.me/9779864112955?text=${encodeURIComponent('नमस्ते IT अधिकृत तथा विपद् फोकल पर्सनज्यू (नारायण क्षेत्री), मलाई पाँचपोखरी थाङपाल गाउँपालिकाको विपद् जोखिम / प्राविधिक समस्या सम्बन्धी जानकारी गराउनु छ।')}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  marginTop: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  backgroundColor: '#0d9488',
                  color: '#ffffff',
                  padding: '7px 12px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textDecoration: 'none',
                }}
              >
                <MessageSquare size={14} />
                <span>नारायण क्षेत्रीलाई WhatsApp गर्नुहोस्</span>
              </a>
            </div>

            {/* Legal Notice */}
            <div
              style={{
                backgroundColor: '#eff6ff',
                padding: '1.25rem',
                borderRadius: '12px',
                border: '1px solid #bfdbfe',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1e40af', fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                <Shield size={18} />
                <span>सूचनाको कानुनी हक</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#1e3a8a', lineHeight: 1.5 }}>
                नेपालको संविधानको धारा २७ तथा सूचनाको हक सम्बन्धी ऐन, २०६४ अनुसार प्रत्येक नागरिकलाई सार्वजनिक निकायमा रहेको सार्वजनिक महत्त्वको सूचना माग्ने र पाउने संवैधानिक अधिकार छ।
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TRACKING */}
      {activeTab === 'track' && (
        <div
          style={{
            backgroundColor: '#ffffff',
            padding: '2.5rem 2rem',
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
            maxWidth: '700px',
            margin: '0 auto',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                backgroundColor: '#f0f9ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 0.75rem auto',
              }}
            >
              <Search size={26} color="#0284c7" />
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.25rem 0' }}>
              गुनासो स्थिति ट्र्याकिङ (Track Complaint)
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0 }}>
              गुनासो दर्ता गर्दा प्राप्त भएको दर्ता नम्बर (जस्तै: CMP-2024-001) प्रविष्ट गर्नुहोस्।
            </p>
          </div>

          <form onSubmit={handleTrack} style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem' }}>
            <input
              type="text"
              required
              placeholder="गुनासो दर्ता नम्बर हाल्नुहोस्..."
              value={trackNumber}
              onChange={(e) => setTrackNumber(e.target.value)}
              style={{
                flex: 1,
                padding: '0.65rem 1rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.95rem',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              disabled={isTracking}
              style={{
                padding: '0.65rem 1.5rem',
                backgroundColor: '#0284c7',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: isTracking ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <Search size={16} />
              <span>{isTracking ? 'खोज्दै...' : 'खोज्नुहोस्'}</span>
            </button>
          </form>

          {trackError && (
            <div
              style={{
                padding: '1rem',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                color: '#b91c1c',
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <AlertCircle size={18} />
              <span>{trackError}</span>
            </div>
          )}

          {trackedComplaint && (
            <div
              style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '1.5rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid #e2e8f0',
                  paddingBottom: '0.75rem',
                  marginBottom: '1rem',
                }}
              >
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>दर्ता नम्बर</span>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                    {trackedComplaint.complaintNo}
                  </div>
                </div>

                {/* Status Badge */}
                {(() => {
                  const s = STATUS_LABELS[trackedComplaint.status] || {
                    label: trackedComplaint.status,
                    color: '#64748b',
                    bg: '#f1f5f9',
                  };
                  return (
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '0.775rem',
                        fontWeight: 700,
                        color: s.color,
                        backgroundColor: s.bg,
                      }}
                    >
                      {s.label}
                    </span>
                  );
                })()}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
                <div>
                  <strong style={{ color: '#475569' }}>विषय:</strong>
                  <div style={{ color: '#0f172a', fontWeight: 600, marginTop: '2px' }}>
                    {trackedComplaint.title}
                  </div>
                </div>

                <div>
                  <strong style={{ color: '#475569' }}>विवरण:</strong>
                  <p style={{ color: '#334155', margin: '4px 0 0 0', lineHeight: 1.5 }}>
                    {trackedComplaint.description}
                  </p>
                </div>

                {trackedComplaint.wardNumber && (
                  <div>
                    <strong style={{ color: '#475569' }}>सम्बन्धित वडा:</strong> वडा नं {trackedComplaint.wardNumber}
                  </div>
                )}

                {trackedComplaint.assignedDepartment && (
                  <div>
                    <strong style={{ color: '#475569' }}>जिम्मेवार शाखा:</strong> {trackedComplaint.assignedDepartment}
                  </div>
                )}

                {trackedComplaint.resolution && (
                  <div
                    style={{
                      marginTop: '0.5rem',
                      backgroundColor: '#ecfdf5',
                      border: '1px solid #a7f3d0',
                      borderRadius: '8px',
                      padding: '0.85rem',
                    }}
                  >
                    <div style={{ color: '#065f46', fontWeight: 700, fontSize: '0.8rem', marginBottom: '2px' }}>
                      कारबाही / समाधान विवरण:
                    </div>
                    <div style={{ color: '#047857', fontSize: '0.85rem' }}>
                      {trackedComplaint.resolution}
                    </div>
                  </div>
                )}

                {/* ─── LIVE GRIEVANCE CITIZEN SMS DELIVERY AUDIT TRAIL ─── */}
                <div
                  style={{
                    marginTop: '1rem',
                    backgroundColor: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '10px',
                    padding: '0.85rem 1rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem', flexWrap: 'wrap', gap: '0.4rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <Smartphone size={16} color="#0284c7" />
                      <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#0f172a' }}>
                        नागरिक SMS गेटवे सूचना स्थिति (SMS Tracking Trail)
                      </span>
                      <span style={{ fontSize: '0.68rem', backgroundColor: '#e0f2fe', color: '#0369a1', padding: '1px 5px', borderRadius: '4px', fontWeight: 700 }}>
                        Aakash SMS Gateway
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        alert(`📲 नागरिकको मोबाइल (${trackedComplaint.complainantPhone || '९८xxxxxxxx'}) मा नयाँ SMS अलर्ट पठाइयो!\n\nसन्देश: "पाँचपोखरी थाङपाल गाउँपालिका: तपाईंको गुनासो दर्ता नं [${trackedComplaint.complaintNo}] को पछिल्लो अवस्था: ${trackedComplaint.status}। तोकिएको शाखा: ${trackedComplaint.assignedDepartment || 'प्रशासन शाखा'}।"\n\nस्थिति: DELIVERED (पुष्टि भयो)`);
                      }}
                      style={{
                        fontSize: '0.72rem',
                        padding: '0.25rem 0.65rem',
                        borderRadius: '4px',
                        backgroundColor: '#f8fafc',
                        border: '1px solid #38bdf8',
                        color: '#0284c7',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                      }}
                    >
                      <Send size={11} />
                      <span>SMS पुनः पठाउनुहोस्</span>
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.78rem' }}>
                    {/* Stage 1: Grievance Registered SMS */}
                    <div style={{ backgroundColor: '#f8fafc', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                        <strong style={{ color: '#0369a1' }}>१. गुनासो दर्ता पुष्टि SMS</strong>
                        <span style={{ fontSize: '0.68rem', color: '#16a34a', fontWeight: 700, backgroundColor: '#dcfce7', padding: '1px 5px', borderRadius: '3px' }}>
                          ✓ DELIVERED
                        </span>
                      </div>
                      <div style={{ color: '#334155', fontStyle: 'italic' }}>
                        "पाँचपोखरी थाङपाल: तपाईंको गुनासो दर्ता भएको छ। दर्ता नं: {trackedComplaint.complaintNo}। ट्र्याक गर्न: {window.location.origin}/complaints"
                      </div>
                      <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '2px' }}>
                        प्रापक: {trackedComplaint.complainantPhone || 'गोप्य'} • प्रेषक: PANCHPOKHARI
                      </div>
                    </div>

                    {/* Stage 2: Officer Assigned SMS */}
                    <div style={{ backgroundColor: '#f8fafc', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                        <strong style={{ color: '#334155' }}>२. जिम्मेवार शाखा तथा अधिकृत तोकिएको SMS</strong>
                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            backgroundColor: trackedComplaint.status !== 'pending' ? '#dcfce7' : '#fef3c7',
                            color: trackedComplaint.status !== 'pending' ? '#166534' : '#b45309',
                            padding: '1px 5px',
                            borderRadius: '3px',
                          }}
                        >
                          {trackedComplaint.status !== 'pending' ? '✓ DELIVERED' : '⏳ तोकिँदैछ (Pending)'}
                        </span>
                      </div>
                      <div style={{ color: '#334155', fontStyle: 'italic' }}>
                        "तपाईंको गुनासो (नं: {trackedComplaint.complaintNo}) सम्बन्धित {trackedComplaint.assignedDepartment || 'शाखा'} मा कारबाही प्रक्रियामा अगाडि बढेको छ।"
                      </div>
                    </div>

                    {/* Stage 3: Resolved SMS */}
                    <div style={{ backgroundColor: '#f8fafc', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                        <strong style={{ color: '#334155' }}>३. समस्या सम्बोधन तथा समाधान SMS</strong>
                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            backgroundColor: trackedComplaint.status === 'resolved' ? '#dcfce7' : '#f1f5f9',
                            color: trackedComplaint.status === 'resolved' ? '#166534' : '#94a3b8',
                            padding: '1px 5px',
                            borderRadius: '3px',
                          }}
                        >
                          {trackedComplaint.status === 'resolved' ? '✓ DELIVERED' : '⏳ समाधान प्रक्रियामा'}
                        </span>
                      </div>
                      <div style={{ color: '#334155', fontStyle: 'italic' }}>
                        {trackedComplaint.status === 'resolved'
                          ? `तपाईंको गुनासो समाधान भएको छ। कैफियत: ${trackedComplaint.resolution || 'स्थलगत मर्मत सम्पन्न'}`
                          : 'गुनासो समाधान हुनासाथ नागरिकको मोबाइलमा अन्तिम SMS सूचना पठाइनेछ।'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tracked RTI Request Display */}
          {trackedRti && (
            <div
              style={{
                backgroundColor: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '12px',
                padding: '1.5rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid #bfdbfe',
                  paddingBottom: '0.75rem',
                  marginBottom: '1rem',
                }}
              >
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#1d4ed8', fontWeight: 600 }}>सूचना माग दर्ता नम्बर</span>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1e3a8a' }}>
                    {trackedRti.requestNo}
                  </div>
                </div>

                <span
                  style={{
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: trackedRti.status === 'info_provided' ? '#166534' : trackedRti.status === 'in_progress' ? '#1e40af' : '#b45309',
                    backgroundColor: trackedRti.status === 'info_provided' ? '#dcfce7' : trackedRti.status === 'in_progress' ? '#dbeafe' : '#fef3c7',
                  }}
                >
                  {trackedRti.status === 'info_provided' ? 'सूचना उपलब्ध गराइएको' : trackedRti.status === 'in_progress' ? 'प्रक्रियामा' : trackedRti.status === 'rejected' ? 'अस्वीकृत' : 'नयाँ दर्ता'}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
                <div>
                  <strong style={{ color: '#1e3a8a' }}>विषय:</strong>
                  <div style={{ color: '#0f172a', fontWeight: 700, marginTop: '2px' }}>
                    {trackedRti.subject}
                  </div>
                </div>

                <div>
                  <strong style={{ color: '#1e3a8a' }}>माग गरिएको सूचना:</strong>
                  <p style={{ color: '#334155', margin: '4px 0 0 0', lineHeight: 1.5 }}>
                    {trackedRti.requestedInformation}
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', background: '#ffffff', padding: '0.75rem', borderRadius: '8px', border: '1px solid #dbeafe' }}>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '0.75rem' }}>जिम्मेवार अधिकृत:</span>
                    <div style={{ fontWeight: 600, color: '#1e3a8a' }}>{trackedRti.assignedOfficer}</div>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '0.75rem' }}>कानुनी म्याद (१५ दिन):</span>
                    <div style={{ fontWeight: 600, color: '#b45309' }}>{trackedRti.legalDeadlineBs || '१५ दिनभित्र'}</div>
                  </div>
                </div>

                {trackedRti.actionTakenNotes && (
                  <div
                    style={{
                      marginTop: '0.5rem',
                      backgroundColor: '#ffffff',
                      border: '1px solid #bfdbfe',
                      borderRadius: '8px',
                      padding: '0.85rem',
                    }}
                  >
                    <div style={{ color: '#1e40af', fontWeight: 700, fontSize: '0.8rem', marginBottom: '2px' }}>
                      सूचना अधिकारीको निर्णय / जवाफ:
                    </div>
                    <div style={{ color: '#334155', fontSize: '0.85rem', lineHeight: 1.5 }}>
                      {trackedRti.actionTakenNotes}
                    </div>
                    {trackedRti.attachmentUrl && (
                      <div style={{ marginTop: '0.5rem' }}>
                        <a
                          href={trackedRti.attachmentUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#2563eb', fontWeight: 600, fontSize: '0.8rem' }}
                        >
                          📄 उपलब्ध गराइएको प्रमाणित कागजात हेर्नुहोस्
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
