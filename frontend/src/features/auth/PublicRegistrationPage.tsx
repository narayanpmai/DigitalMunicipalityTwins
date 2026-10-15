import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Briefcase,
  HardHat,
  FileText,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  AlertCircle,
  Building2,
  Lock,
  Mail,
  Phone,
  Sparkles,
  MapPin,
  HeartHandshake
} from 'lucide-react';
import { createApiClient } from '../../api/client';
import './PublicRegistration.css';

export const PublicRegistrationPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [citizenTab, setCitizenTab] = useState<'personal' | 'address' | 'social'>('personal');
  const [regType, setRegType] = useState<string>('public_citizen');
  
  const [formData, setFormData] = useState<Record<string, any>>({
    fullName: '', email: '', password: '', phone: '',
    fullNameEn: '', nationalId: '', citizenshipNo: '',
    gender: 'FEMALE', dobBs: '', bloodGroup: 'O+',
    maritalStatus: 'विवाहित', wardNumber: 1, tole: '',
    targetedGroup: 'सामान्य नागरिक (General)', insuranceNumber: '',
    panNo: '', licenseNo: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const regTypes = [
    {
      id: 'public_citizen',
      title: 'नागरिक (Citizen)',
      icon: User,
      desc: 'विस्तृत नागरिक प्रोफाइलसहित खाता खोल्न',
      accentColor: '#2563eb',
      bgLight: '#eff6ff',
      tags: ['नागरिक ई-सिफारिस', 'डिजिटल बडापत्र', 'गुनासो/उजुरी'],
    },
    {
      id: 'public_business',
      title: 'व्यवसायी (Business)',
      icon: Briefcase,
      desc: 'व्यवसाय दर्ता तथा कर तिर्न',
      accentColor: '#059669',
      bgLight: '#ecfdf5',
      tags: ['व्यवसाय दर्ता', 'कर/दस्तुर चुक्ता', 'इजाजत नवीकरण'],
    },
    {
      id: 'public_contractor',
      title: 'ठेकेदार (Contractor)',
      icon: HardHat,
      desc: 'ई-बोलपत्र (e-Tender) का लागि',
      accentColor: '#d97706',
      bgLight: '#fffbeb',
      tags: ['सार्वजनिक खरिद', 'ई-बोलपत्र', 'योजना सम्झौता'],
    },
    {
      id: 'public_engineer',
      title: 'इन्जिनियर (Engineer)',
      icon: FileText,
      desc: 'घर-नक्सा पास (e-BPS) का लागि',
      accentColor: '#7c3aed',
      bgLight: '#f5f3ff',
      tags: ['ई-नक्सा पास (e-BPS)', 'डिजाइन सुपरिवेक्षण', 'प्राविधिक प्रतिवेदन'],
    },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    let specificDetails = {};
    if (regType === 'public_citizen') {
      specificDetails = {
        fullNameEn: formData.fullNameEn,
        nationalId: formData.nationalId,
        citizenshipNo: formData.citizenshipNo,
        gender: formData.gender,
        dobBs: formData.dobBs,
        bloodGroup: formData.bloodGroup,
        maritalStatus: formData.maritalStatus,
        wardNumber: Number(formData.wardNumber),
        tole: formData.tole,
        targetedGroup: formData.targetedGroup,
        insuranceNumber: formData.insuranceNumber,
      };
    } else {
      specificDetails = { panNo: formData.panNo, licenseNo: formData.licenseNo };
    }

    try {
      const client = createApiClient();
      await client.post('/auth/public/register', {
        registrationType: regType,
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        specificDetails
      });
      
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'खाता दर्ता प्रक्रियामा समस्या देखियो। कृपया पुन: प्रयास गर्नुहोस्।');
    } finally {
      setIsLoading(false);
    }
  };

  const renderCitizenWizard = () => (
    <div>
      {/* Sub-tabs for Citizen KYC */}
      <div className="reg-subtabs">
        <button
          type="button"
          onClick={() => setCitizenTab('personal')}
          className={`reg-subtab-btn ${citizenTab === 'personal' ? 'active' : ''}`}
        >
          <User size={16} />
          <span>१. व्यक्तिगत विवरण</span>
        </button>
        <button
          type="button"
          onClick={() => setCitizenTab('address')}
          className={`reg-subtab-btn ${citizenTab === 'address' ? 'active' : ''}`}
        >
          <MapPin size={16} />
          <span>२. ठेगाना</span>
        </button>
        <button
          type="button"
          onClick={() => setCitizenTab('social')}
          className={`reg-subtab-btn ${citizenTab === 'social' ? 'active' : ''}`}
        >
          <HeartHandshake size={16} />
          <span>३. सामाजिक विवरण</span>
        </button>
      </div>

      <div>
        {citizenTab === 'personal' && (
          <div className="reg-form-grid">
            <div className="reg-input-group">
              <label className="reg-input-label">Full Name (English) - ऐच्छिक</label>
              <input
                type="text"
                name="fullNameEn"
                className="reg-input-field"
                placeholder="Ex: Ram Bahadur Shrestha"
                onChange={handleInputChange}
                value={formData.fullNameEn}
              />
            </div>
            <div className="reg-input-group">
              <label className="reg-input-label">राष्ट्रिय परिचयपत्र नं. (NID No) - ऐच्छिक</label>
              <input
                type="text"
                name="nationalId"
                className="reg-input-field"
                placeholder="उदा: १२३४५६७८९०"
                onChange={handleInputChange}
                value={formData.nationalId}
              />
            </div>
            <div className="reg-input-group">
              <label className="reg-input-label">नागरिकता नं. - ऐच्छिक</label>
              <input
                type="text"
                name="citizenshipNo"
                className="reg-input-field"
                placeholder="उदा: २७-०१-७६-०१२३४"
                onChange={handleInputChange}
                value={formData.citizenshipNo}
              />
            </div>
            <div className="reg-input-group">
              <label className="reg-input-label">लिङ्ग (Gender) <span style={{ color: '#ef4444' }}>*</span></label>
              <select
                name="gender"
                className="reg-input-field"
                onChange={handleInputChange}
                value={formData.gender}
              >
                <option value="FEMALE">महिला (Female)</option>
                <option value="MALE">पुरुष (Male)</option>
                <option value="OTHER">अन्य (Other)</option>
              </select>
            </div>
            <div className="reg-input-group">
              <label className="reg-input-label">जन्ममिति (वि.सं.) - ऐच्छिक</label>
              <input
                type="text"
                name="dobBs"
                placeholder="उदा: २०५५-०४-१०"
                className="reg-input-field"
                onChange={handleInputChange}
                value={formData.dobBs}
              />
            </div>
            <div className="reg-input-group">
              <label className="reg-input-label">रक्त समूह (Blood Group)</label>
              <select
                name="bloodGroup"
                className="reg-input-field"
                onChange={handleInputChange}
                value={formData.bloodGroup}
              >
                <option value="A+">A+</option><option value="A-">A-</option>
                <option value="B+">B+</option><option value="B-">B-</option>
                <option value="AB+">AB+</option><option value="AB-">AB-</option>
                <option value="O+">O+</option><option value="O-">O-</option>
                <option value="थाहा नभएको">थाहा नभएको (Unknown)</option>
              </select>
            </div>
            <div className="reg-input-group" style={{ gridColumn: '1 / -1' }}>
              <label className="reg-input-label">वैवाहिक स्थिति</label>
              <select
                name="maritalStatus"
                className="reg-input-field"
                onChange={handleInputChange}
                value={formData.maritalStatus}
              >
                <option value="विवाहित">विवाहित (Married)</option>
                <option value="अविवाहित">अविवाहित (Unmarried)</option>
                <option value="एकल/बिधवा">एकल / बिधवा (Single/Widow)</option>
                <option value="सम्बन्धविच्छेद">सम्बन्धविच्छेद (Divorced)</option>
              </select>
            </div>
          </div>
        )}

        {citizenTab === 'address' && (
          <div className="reg-form-grid">
            <div className="reg-input-group">
              <label className="reg-input-label">वडा नम्बर <span style={{ color: '#ef4444' }}>*</span></label>
              <select
                name="wardNumber"
                required
                className="reg-input-field"
                onChange={handleInputChange}
                value={formData.wardNumber}
              >
                <option value="1">वडा नं. १ (बाँसखर्क)</option>
                <option value="2">वडा नं. २ (बरुवा)</option>
                <option value="3">वडा नं. ३ (भोताङ)</option>
                <option value="4">वडा नं. ४ (थाङपालकोट)</option>
                <option value="5">वडा नं. ५ (गुन्सा)</option>
                <option value="6">वडा नं. ६ (थाङपालधाप)</option>
                <option value="7">वडा नं. ७ (तिपेनी)</option>
                <option value="8">वडा नं. ८ (लाँगर्चे)</option>
              </select>
            </div>
            <div className="reg-input-group">
              <label className="reg-input-label">गाउँ / टोल बस्ती - ऐच्छिक</label>
              <input
                type="text"
                name="tole"
                placeholder="उदा: भोताङ, गाम्चेत, मानेखर्क"
                className="reg-input-field"
                onChange={handleInputChange}
                value={formData.tole}
              />
            </div>
          </div>
        )}

        {citizenTab === 'social' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="reg-input-group">
              <label className="reg-input-label">लक्षित वर्ग समूह (Targeted Category)</label>
              <select
                name="targetedGroup"
                className="reg-input-field"
                onChange={handleInputChange}
                value={formData.targetedGroup}
              >
                <option>सामान्य नागरिक (General)</option>
                <option>ज्येष्ठ नागरिक (Senior Citizen)</option>
                <option>एकल महिला / बिधवा (Single/Widow)</option>
                <option>अपाङ्गता - क वर्ग (पूर्ण अशक्त)</option>
                <option>अपाङ्गता - ख वर्ग (अति अशक्त)</option>
                <option>दलित तथा लोपोन्मुख</option>
                <option>अति विपन्न परिवार</option>
              </select>
            </div>
            <div className="reg-input-group">
              <label className="reg-input-label">स्वास्थ्य बीमा नम्बर (Health Insurance No) - ऐच्छिक</label>
              <input
                type="text"
                name="insuranceNumber"
                placeholder="उदा: NIB-2081-01234"
                className="reg-input-field"
                onChange={handleInputChange}
                value={formData.insuranceNumber}
              />
            </div>
          </div>
        )}
      </div>

      <div className="reg-action-bar">
        <button
          type="button"
          onClick={() => {
            if (citizenTab === 'personal') setStep(2);
            else if (citizenTab === 'address') setCitizenTab('personal');
            else if (citizenTab === 'social') setCitizenTab('address');
          }}
          className="reg-btn-secondary"
        >
          <ArrowLeft size={16} />
          <span>पछाडि (Back)</span>
        </button>

        {citizenTab === 'social' ? (
          <button
            type="submit"
            disabled={isLoading}
            className="reg-btn-primary"
          >
            <ShieldCheck size={18} />
            <span>{isLoading ? 'प्रक्रियामा छ...' : 'दर्ता सम्पन्न गर्नुहोस् (Submit)'}</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              if (citizenTab === 'personal') setCitizenTab('address');
              else if (citizenTab === 'address') setCitizenTab('social');
            }}
            className="reg-btn-primary"
          >
            <span>अर्को चरण (Next)</span>
            <ArrowRight size={18} />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="reg-page-container">
      {/* Header Banner */}
      <div className="reg-header-banner">
        <div className="reg-palika-pill">
          <Building2 size={15} />
          <span>पाँचपोखरी थाङपाल गाउँपालिका • डिजिटल पालिका पोर्टल</span>
        </div>
        <h1 className="reg-title">नयाँ प्रयोगकर्ता दर्ता (Public Registration)</h1>
        <p className="reg-subtitle">
          पालिकाको एकीकृत डिजिटल सेवा, ई-सिफारिस, योजना तथा व्यवसाय प्रणालीमा सुरक्षित पहुँचका लागि आफ्नो खाता खोल्नुहोस्।
        </p>
      </div>

      {/* Main Registration Card */}
      <div className="reg-main-card">
        {success ? (
          <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%', background: '#ecfdf5',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem',
              boxShadow: '0 0 0 8px #d1fae5'
            }}>
              <CheckCircle2 size={48} color="#059669" />
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 850, color: '#065f46', marginBottom: '0.5rem' }}>
              सफलतापूर्वक दर्ता भयो!
            </h2>
            <p style={{ color: '#475569', fontSize: '1rem', maxWidth: '500px', margin: '0 auto 1.5rem', lineHeight: 1.5 }}>
              तपाईंको खाता सुरक्षित रूपमा प्रणालीमा दर्ता भएको छ। पालिका प्रमाणीकरण पश्चात् तपाईंले सम्पूर्ण सेवाहरू उपभोग गर्न सक्नुहुनेछ।
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#f8fafc', padding: '0.6rem 1.25rem', borderRadius: '10px', fontSize: '0.9rem', color: '#64748b' }}>
              <span>लगइन पेजमा लैजाँदैछ...</span>
            </div>
          </div>
        ) : (
          <>
            {error && (
              <div className="reg-alert-error">
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
            )}

            {/* Stepper Progress Indicator */}
            <div className="reg-stepper-container">
              {/* Step 1 */}
              <div className="reg-step-item">
                <div className={`reg-step-circle ${step === 1 ? 'active' : step > 1 ? 'completed' : ''}`}>
                  {step > 1 ? <CheckCircle2 size={20} /> : '१'}
                </div>
                <div className={`reg-step-label ${step === 1 ? 'active' : ''}`}>
                  <span>सेवा छनोट</span>
                  <span className="reg-step-sublabel">Select Role</span>
                </div>
              </div>

              <div className={`reg-step-line ${step > 1 ? 'completed' : ''}`} />

              {/* Step 2 */}
              <div className="reg-step-item">
                <div className={`reg-step-circle ${step === 2 ? 'active' : step > 2 ? 'completed' : ''}`}>
                  {step > 2 ? <CheckCircle2 size={20} /> : '२'}
                </div>
                <div className={`reg-step-label ${step === 2 ? 'active' : ''}`}>
                  <span>लगइन खाता</span>
                  <span className="reg-step-sublabel">Credentials</span>
                </div>
              </div>

              <div className={`reg-step-line ${step > 2 ? 'completed' : ''}`} />

              {/* Step 3 */}
              <div className="reg-step-item">
                <div className={`reg-step-circle ${step === 3 ? 'active' : ''}`}>
                  ३
                </div>
                <div className={`reg-step-label ${step === 3 ? 'active' : ''}`}>
                  <span>विस्तृत विवरण</span>
                  <span className="reg-step-sublabel">Profile & KYC</span>
                </div>
              </div>
            </div>

            {/* STEP 1: ROLE SELECTION */}
            {step === 1 && (
              <div>
                <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
                  <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.4rem' }}>
                    तपाईं कुन सेवाको लागि दर्ता गर्दै हुनुहुन्छ?
                  </h2>
                  <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}>
                    आफ्नो आवश्यकता अनुसार उपयुक्त प्रयोगकर्ता भूमिका छनोट गर्नुहोस्
                  </p>
                </div>

                {/* 2x2 Role Cards Grid */}
                <div className="reg-roles-grid">
                  {regTypes.map((type) => {
                    const isSelected = regType === type.id;
                    const IconComp = type.icon;

                    return (
                      <div
                        key={type.id}
                        className={`reg-role-card ${isSelected ? 'selected' : ''}`}
                        onClick={() => setRegType(type.id)}
                      >
                        <div className="reg-role-radio">
                          {isSelected && <div className="reg-role-radio-dot" />}
                        </div>

                        <div>
                          <div
                            className="reg-role-icon-box"
                            style={{
                              backgroundColor: isSelected ? type.accentColor : type.bgLight,
                              color: isSelected ? '#ffffff' : type.accentColor,
                            }}
                          >
                            <IconComp size={28} />
                          </div>

                          <h3 className="reg-role-title">{type.title}</h3>
                          <p className="reg-role-desc">{type.desc}</p>
                        </div>

                        <div className="reg-role-tags">
                          {type.tags.map((tag, i) => (
                            <span key={i} className="reg-role-tag">{tag}</span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    disabled={!regType}
                    className="reg-btn-primary"
                    style={{ minWidth: '240px', justifyContent: 'center' }}
                  >
                    <span>खाताको विवरण राख्नुहोस्</span>
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: CREDENTIALS */}
            {step === 2 && (
              <div>
                <div style={{ marginBottom: '1.75rem' }}>
                  <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.35rem' }}>
                    लगइन खाता विवरण (Account Credentials)
                  </h2>
                  <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}>
                    पोर्टलमा लगइन गर्नका लागि आफ्नो आधिकारिक इमेल, फोन र सुरक्षित पासवर्ड राख्नुहोस्
                  </p>
                </div>

                <div className="reg-form-grid">
                  <div className="reg-input-group">
                    <label className="reg-input-label">
                      <span>पूरा नाम (Full Name)</span>
                      <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      required
                      placeholder="उदा: राम बहादुर श्रेष्ठ"
                      className="reg-input-field"
                      onChange={handleInputChange}
                      value={formData.fullName}
                    />
                  </div>

                  <div className="reg-input-group">
                    <label className="reg-input-label">
                      <span>इमेल ठेगाना (Email)</span>
                      <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="ram@example.com"
                      className="reg-input-field"
                      onChange={handleInputChange}
                      value={formData.email}
                    />
                  </div>

                  <div className="reg-input-group">
                    <label className="reg-input-label">
                      <span>सम्पर्क मोबाइल नं. (Phone)</span>
                      <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      placeholder="उदा: ९८४१२३४५६७"
                      className="reg-input-field"
                      onChange={handleInputChange}
                      value={formData.phone}
                    />
                  </div>

                  <div className="reg-input-group">
                    <label className="reg-input-label">
                      <span>नयाँ पासवर्ड (Password)</span>
                      <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="password"
                      name="password"
                      required
                      minLength={6}
                      placeholder="कम्तीमा ६ अक्षरको गोप्य पासवर्ड"
                      className="reg-input-field"
                      onChange={handleInputChange}
                      value={formData.password}
                    />
                  </div>
                </div>

                <div className="reg-action-bar">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="reg-btn-secondary"
                  >
                    <ArrowLeft size={16} />
                    <span>पछाडि (Back)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (!formData.fullName || !formData.email || !formData.phone || formData.password.length < 6) {
                        setError('कृपया सबै अनिवार्य विवरणहरू भर्नुहोस् र पासवर्ड कम्तीमा ६ अक्षरको राख्नुहोस्।');
                        return;
                      }
                      setError('');
                      setStep(3);
                    }}
                    className="reg-btn-primary"
                  >
                    <span>अर्को चरण: व्यक्तिगत विवरण</span>
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: PROFILE & KYC */}
            {step === 3 && (
              <form onSubmit={handleSubmit}>
                {regType === 'public_citizen' ? (
                  <div>
                    <div style={{ marginBottom: '1.5rem' }}>
                      <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.35rem' }}>
                        नागरिकको विस्तृत विवरण (Citizen Profile & KYC)
                      </h2>
                      <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}>
                        अनलाइन सिफारिस तथा ई-सेवाहरूमा तपाईंको विवरण स्वतः प्रमाणीकरणका लागि सही जानकारी भर्नुहोस्
                      </p>
                    </div>
                    {renderCitizenWizard()}
                  </div>
                ) : (
                  <div>
                    <div style={{ marginBottom: '1.5rem' }}>
                      <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.35rem' }}>
                        व्यावसायिक तथा इजाजत विवरण (Business & License Info)
                      </h2>
                      <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}>
                        सम्बन्धित संस्था वा निकायद्वारा जारी आधिकारिक दर्ता नम्बर प्रविष्ट गर्नुहोस्
                      </p>
                    </div>
                    
                    {(regType === 'public_business' || regType === 'public_contractor') && (
                      <div className="reg-input-group">
                        <label className="reg-input-label">
                          <span>PAN / VAT नम्बर</span>
                          <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <input
                          type="text"
                          name="panNo"
                          required
                          placeholder="उदा: ६०१२३४५६७"
                          className="reg-input-field"
                          onChange={handleInputChange}
                          value={formData.panNo}
                        />
                      </div>
                    )}

                    {regType === 'public_engineer' && (
                      <div className="reg-input-group">
                        <label className="reg-input-label">
                          <span>नेपाल इन्जिनियरिङ काउन्सिल (NEC) दर्ता नं.</span>
                          <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <input
                          type="text"
                          name="licenseNo"
                          required
                          placeholder="उदा: NEC-A-12345"
                          className="reg-input-field"
                          onChange={handleInputChange}
                          value={formData.licenseNo}
                        />
                      </div>
                    )}

                    <div className="reg-action-bar">
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="reg-btn-secondary"
                      >
                        <ArrowLeft size={16} />
                        <span>पछाडि (Back)</span>
                      </button>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="reg-btn-primary"
                      >
                        <ShieldCheck size={18} />
                        <span>{isLoading ? 'प्रक्रियामा छ...' : 'दर्ता सम्पन्न गर्नुहोस् (Register)'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </form>
            )}
          </>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="reg-footer-box">
        <div className="reg-footer-link">
          <span>पहिले नै खाता दर्ता भइसकेको छ? </span>
          <a href="/login">यहाँ लगइन गर्नुहोस् (Sign In)</a>
        </div>
        <div className="reg-security-note">
          <ShieldCheck size={14} color="#10b981" />
          <span>नेपाल सरकारको डिजिटल सुरक्षा मापदण्ड अनुरूप तपाईंको व्यक्तिगत तथ्याङ्क पूर्ण सुरक्षित रहनेछ।</span>
        </div>
      </div>
    </div>
  );
};

export default PublicRegistrationPage;
