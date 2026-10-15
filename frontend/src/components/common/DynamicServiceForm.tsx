import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createApiClient } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import {
  Sprout,
  HeartPulse,
  FileCheck,
  Building2,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  ArrowLeft,
  Upload,
  FileText,
  Printer,
  RotateCcw,
  ShieldCheck,
  User,
  Phone,
  MapPin,
  Stethoscope,
  Briefcase,
  Layers,
  Award,
  X,
  Plus
} from 'lucide-react';
import './DynamicServiceForm.css';

interface ServiceItem {
  id: string;
  category: 'agriculture' | 'health' | 'sifarish' | 'business';
  title: string;
  desc: string;
  icon: any;
  turnaround: string;
  fee: string;
  badgeColor: string;
  requiredDocs: string[];
}

const SERVICE_CATALOG: ServiceItem[] = [
  {
    id: 'AGRICULTURE_FARMER',
    category: 'agriculture',
    title: 'कृषक सूचीकरण तथा अनुदान माग',
    desc: 'उन्नत बीउबिजन, हाते ट्रयाक्टर/कृषि औजार अनुदान, रासायनिक मल तथा माटो परीक्षणको लागि आधिकारिक कृषक दर्ता।',
    icon: Sprout,
    turnaround: '१-२ कार्यदिन',
    fee: 'निःशुल्क',
    badgeColor: '#16a34a',
    requiredDocs: ['नागरिकताको प्रतिलिपि', 'जग्गाधनी प्रमाणपुर्जा (लालपुर्जा) वा सम्झौता पत्र', 'पासपोर्ट साइजको फोटो'],
  },
  {
    id: 'HEALTH_PATIENT',
    category: 'health',
    title: 'अस्पताल ओपीडी टिकट तथा परामर्श दर्ता',
    desc: 'पाँचपोखरी आधारभूत अस्पताल तथा स्वास्थ्य चौकीहरूमा बहिरंग (OPD) परामर्श, डाक्टर जाँच तथा टिकट बुकिङ।',
    icon: HeartPulse,
    turnaround: 'तत्काल सेवा',
    fee: 'बीमा भए निःशुल्क / रु. २०',
    badgeColor: '#dc2626',
    requiredDocs: ['नागरिकता वा राष्ट्रिय परिचयपत्र', 'स्वास्थ्य बीमा कार्ड (भएमा)'],
  },
  {
    id: 'SIFARISH_RELATIONSHIP',
    category: 'sifarish',
    title: 'पारिवारिक नाता प्रमाणीकरण सिफारिस',
    desc: 'वैदेशिक रोजगार, छात्रवृत्ति, राहदानी वा सम्पत्ति हस्तान्तरण प्रयोजनका लागि पारिवारिक नाता प्रमाणित सिफारिस।',
    icon: FileCheck,
    turnaround: '१ कार्यदिन',
    fee: 'रु. ५००',
    badgeColor: '#2563eb',
    requiredDocs: ['परिवारका सबै सदस्यहरूको नागरिकता/जन्मदर्ता', 'बसाईंसराई प्रमाणपत्र (लागू भएमा)', 'नाता खुल्ने तस्विर'],
  },
  {
    id: 'BUSINESS_REGISTRATION',
    category: 'business',
    title: 'नयाँ व्यवसाय / उद्योग दर्ता सिफारिस',
    desc: 'पालिका कार्यक्षेत्रभित्र साना तथा मझौला उद्योग, कृषि फार्म, पर्यटन होमस्टे वा व्यापारिक पसल दर्ताको सिफारिस।',
    icon: Building2,
    turnaround: '२-३ कार्यदिन',
    fee: 'पूँजी अनुसार',
    badgeColor: '#d97706',
    requiredDocs: ['सञ्चालकको नागरिकता प्रतिलिपि', 'घरबहाल सम्झौता पत्र', 'व्यवसाय रहने स्थानको चारकिल्ला'],
  },
  {
    id: 'SIFARISH_CITIZENSHIP',
    category: 'sifarish',
    title: 'नेपाली नागरिकता प्रमाणपत्र सिफारिस',
    desc: 'वंशजको आधारमा नयाँ नागरिकता वा प्रतिलिपि प्राप्त गर्न वडा कार्यालयको आधिकारिक सिफारिस पत्र।',
    icon: Award,
    turnaround: '१ कार्यदिन',
    fee: 'रु. २००',
    badgeColor: '#7c3aed',
    requiredDocs: ['बुबा/आमाको नागरिकता प्रतिलिपि', 'जन्मदर्ता प्रमाणपत्र', 'शैक्षिक योग्यता प्रमाणपत्र वा कक्षा ८/१० को मार्कसिट'],
  },
  {
    id: 'SIFARISH_CHAR_CERT',
    category: 'sifarish',
    title: 'चारित्रिक प्रमाणपत्र तथा स्थानीय बसोबास',
    desc: 'अध्ययन, रोजगारी तथा अन्य प्रशासनिक प्रयोजनको लागि स्थानीय वडा बसोबास तथा चारित्रिक सिफारिस पत्र।',
    icon: ShieldCheck,
    turnaround: '१ कार्यदिन',
    fee: 'रु. १००',
    badgeColor: '#0891b2',
    requiredDocs: ['नागरिकता प्रतिलिपि', 'स्थानीय बसोबास प्रमाणित कागजात / बिजुली बिल'],
  },
  {
    id: 'HEALTH_FACILITY',
    category: 'health',
    title: 'स्वास्थ्य संस्था सेवा तथा खोप अनुरोध',
    desc: 'वडास्तरीय खोप केन्द्र, मातृशिशु क्लिनिक वा निःशुल्क औषधि वितरण सम्बन्धी विशेष अनुरोध।',
    icon: Stethoscope,
    turnaround: '२ कार्यदिन',
    fee: 'निःशुल्क',
    badgeColor: '#e11d48',
    requiredDocs: ['खोप कार्ड वा अस्पताल सिफारिस पत्र'],
  },
  {
    id: 'AGRICULTURE_DATA',
    category: 'agriculture',
    title: 'बाली उत्पादन तथा मौसमी तथ्यांक',
    desc: 'वार्षिक कृषि उत्पादन, हिउँदे तथा बर्खे बाली, र पकेट क्षेत्र तथ्यांक पालिका कृषि अभिलेखमा प्रविष्टि।',
    icon: Layers,
    turnaround: '२ कार्यदिन',
    fee: 'निःशुल्क',
    badgeColor: '#059669',
    requiredDocs: ['जग्गा विवरण'],
  },
];

export const DynamicServiceForm: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Wizard Navigation
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [activeCategory, setActiveCategory] = useState<'all' | 'agriculture' | 'health' | 'sifarish' | 'business'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState<string>('AGRICULTURE_FARMER');

  // Form Data
  const [formData, setFormData] = useState<Record<string, any>>({
    fullName: '',
    contactPhone: '',
    email: '',
    wardNumber: 3,
    toleVillage: '',
    citizenshipNo: '',
  });

  // Pre-fill user profile if logged in
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: prev.fullName || user.fullName || '',
        email: prev.email || user.email || '',
        contactPhone: prev.contactPhone || (user as any).phone || '',
        wardNumber: prev.wardNumber || (user as any).wardNumber || (user as any).ward_id || 3,
      }));
    }
  }, [user]);

  // Uploaded documents state
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; size: string }[]>([]);
  const [declarationChecked, setDeclarationChecked] = useState(false);

  // Submission State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [receiptData, setReceiptData] = useState<any>(null);

  const selectedService = useMemo(
    () => SERVICE_CATALOG.find(s => s.id === selectedServiceId) || SERVICE_CATALOG[0],
    [selectedServiceId]
  );

  const filteredServices = useMemo(() => {
    return SERVICE_CATALOG.filter(s => {
      if (activeCategory !== 'all' && s.category !== activeCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          s.title.toLowerCase().includes(q) ||
          s.desc.toLowerCase().includes(q) ||
          s.id.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [activeCategory, searchQuery]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).map(f => ({
        name: f.name,
        size: (f.size / (1024 * 1024)).toFixed(2) + ' MB'
      }));
      setUploadedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (idx: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!declarationChecked) {
      alert('कृपया विवरण सत्य-तथ्य भएको स्वघोषणा बाकसमा टिक लगाउनुहोस्।');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const client = createApiClient();
      const payload = {
        serviceType: selectedServiceId,
        data: {
          ...formData,
          serviceTitle: selectedService.title,
          serviceCategory: selectedService.category,
          documents: uploadedFiles.map(f => f.name),
        }
      };

      const res = await client.post('/service-router/submit', payload);
      
      const resData = res.data || res;
      const trackingCode = resData?.data?.farmerId || resData?.data?.patientNo || resData?.data?.applicationNo || `P5-2081-SVC-${Math.floor(10000 + Math.random() * 90000)}`;

      setReceiptData({
        token: trackingCode,
        service: selectedService,
        applicant: formData,
        submittedAt: new Date().toLocaleDateString('ne-NP'),
        dateBs: '२०८१-०५-२९',
        branch: selectedService.category === 'agriculture' ? 'कृषि तथा पशुसेवा विकास शाखा' : selectedService.category === 'health' ? 'स्वास्थ्य तथा पोषण शाखा' : selectedService.category === 'sifarish' ? 'वडा कार्यालय तथा नागरिक ई-सेवा' : 'योजना तथा आर्थिक विकास शाखा'
      });

      setCurrentStep(5);
    } catch (err: any) {
      setError(err.response?.data?.message || 'अनुरोध पेश गर्न सकिएन। कृपया विवरण पुन: रुजु गर्नुहोस्।');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCurrentStep(1);
    setReceiptData(null);
    setUploadedFiles([]);
    setDeclarationChecked(false);
    setError('');
  };

  return (
    <div className="dynamic-service-container">
      {/* Header Banner */}
      <div className="dynamic-service-header">
        <div style={{ position: 'relative', zIndex: 2 }}>
          <h2 className="dynamic-service-title">
            <Layers size={28} />
            <span>एकीकृत सेवा अनुरोध फारम (Dynamic Service Router)</span>
          </h2>
          <p className="dynamic-service-subtitle">
            पाँचपोखरी थाङपाल गाउँपालिकाका कृषि, स्वास्थ्य, नागरिक ई-सिफारिस तथा व्यवसाय दर्ता लगायतका सम्पूर्ण सेवाहरूको एकीकृत अनलाइन आवेदन प्रणाली।
          </p>
        </div>
      </div>

      <div className="dynamic-service-body">
        {/* Citizen Authentication Status Card */}
        {user ? (
          <div className="citizen-auth-banner verified">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <ShieldCheck size={26} color="#059669" />
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.98rem' }}>
                  प्रमाणित नागरिक खाता: {user.fullName || user.email}
                </div>
                <div style={{ fontSize: '0.82rem', opacity: 0.9 }}>
                  तपाईंको प्रोफाइल विवरण स्वतः फारममा संलग्न गरिएको छ।
                </div>
              </div>
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, backgroundColor: '#bbf7d0', color: '#166534', padding: '4px 10px', borderRadius: '8px' }}>
              सक्रिय सत्र (Active Session)
            </span>
          </div>
        ) : (
          <div className="citizen-auth-banner guest">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <User size={24} color="#2563eb" />
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>
                  नागरिक लगइन उपलब्ध छ
                </div>
                <div style={{ fontSize: '0.82rem', opacity: 0.85 }}>
                  खाता लगइन गर्दा तपाईंको विवरण स्वतः भरिनेछ र आवेदनको प्रत्यक्ष स्थिति (Tracking) हेर्न सकिनेछ।
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => navigate('/login')}
                style={{ backgroundColor: '#2563eb', color: '#ffffff', border: 'none', padding: '0.45rem 1rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}
              >
                लगइन गर्नुहोस्
              </button>
              <button
                type="button"
                onClick={() => navigate('/register')}
                style={{ backgroundColor: '#ffffff', color: '#1e40af', border: '1px solid #bfdbfe', padding: '0.45rem 1rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}
              >
                नयाँ दर्ता
              </button>
            </div>
          </div>
        )}

        {/* Wizard Step Bar */}
        {currentStep < 5 && (
          <div className="wizard-steps-container">
            <div className="wizard-progress-track">
              <div
                className="wizard-progress-bar"
                style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
              />
            </div>

            <div className={`wizard-step-item ${currentStep === 1 ? 'active' : currentStep > 1 ? 'completed' : ''}`} onClick={() => setCurrentStep(1)}>
              <div className="wizard-step-circle">१</div>
              <div className="wizard-step-label">सेवा छनोट</div>
            </div>

            <div className={`wizard-step-item ${currentStep === 2 ? 'active' : currentStep > 2 ? 'completed' : ''}`} onClick={() => setCurrentStep(2)}>
              <div className="wizard-step-circle">२</div>
              <div className="wizard-step-label">सेवाग्राही विवरण</div>
            </div>

            <div className={`wizard-step-item ${currentStep === 3 ? 'active' : currentStep > 3 ? 'completed' : ''}`} onClick={() => setCurrentStep(3)}>
              <div className="wizard-step-circle">३</div>
              <div className="wizard-step-label">आवश्यक विवरण</div>
            </div>

            <div className={`wizard-step-item ${currentStep === 4 ? 'active' : ''}`} onClick={() => setCurrentStep(4)}>
              <div className="wizard-step-circle">४</div>
              <div className="wizard-step-label">कागजात र पेश</div>
            </div>
          </div>
        )}

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 1.25rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', color: '#991b1b', marginBottom: '1.5rem' }}>
            <AlertCircle size={20} />
            <span style={{ fontWeight: 600 }}>{error}</span>
          </div>
        )}

        {/* STEP 1: SERVICE SELECTION */}
        {currentStep === 1 && (
          <div>
            {/* Search & Category Filter Chips */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ position: 'relative' }}>
                <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="text"
                  className="form-control"
                  style={{ paddingLeft: '44px', fontSize: '1rem' }}
                  placeholder="कुनै पनि सेवा खोज्नुहोस् (उदा: मल, बीउ, ओपीडी, नाता सिफारिस, व्यवसाय)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="category-filter-chips">
                <button
                  type="button"
                  onClick={() => setActiveCategory('all')}
                  className={`category-chip ${activeCategory === 'all' ? 'active' : ''}`}
                >
                  सबै सेवाहरू ({SERVICE_CATALOG.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCategory('agriculture')}
                  className={`category-chip ${activeCategory === 'agriculture' ? 'active' : ''}`}
                >
                  🌾 कृषि तथा पशुपालन
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCategory('health')}
                  className={`category-chip ${activeCategory === 'health' ? 'active' : ''}`}
                >
                  🏥 स्वास्थ्य तथा ओपीडी
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCategory('sifarish')}
                  className={`category-chip ${activeCategory === 'sifarish' ? 'active' : ''}`}
                >
                  📜 नागरिक ई-सिफारिस
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCategory('business')}
                  className={`category-chip ${activeCategory === 'business' ? 'active' : ''}`}
                >
                  🏢 व्यवसाय तथा उद्योग
                </button>
              </div>
            </div>

            {/* Service Cards Grid */}
            <div className="service-cards-grid">
              {filteredServices.map((srv) => {
                const isSelected = selectedServiceId === srv.id;
                const IconComp = srv.icon;

                return (
                  <div
                    key={srv.id}
                    className={`service-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedServiceId(srv.id)}
                  >
                    <div>
                      <div className="service-card-header">
                        <div
                          className="service-card-icon"
                          style={{
                            backgroundColor: isSelected ? srv.badgeColor : '#f1f5f9',
                            color: isSelected ? '#ffffff' : srv.badgeColor
                          }}
                        >
                          <IconComp size={24} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <h4 className="service-card-title">{srv.title}</h4>
                          <span
                            className="service-badge"
                            style={{
                              backgroundColor: `${srv.badgeColor}18`,
                              color: srv.badgeColor,
                            }}
                          >
                            {srv.category.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <p className="service-card-desc">{srv.desc}</p>
                    </div>

                    <div className="service-card-footer">
                      <span style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={13} /> {srv.turnaround}
                      </span>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a' }}>
                        {srv.fee}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="wizard-nav-actions" style={{ justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn-wizard-next"
                onClick={() => setCurrentStep(2)}
              >
                <span>अर्को: सेवाग्राही विवरण (Next)</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: APPLICANT DETAILS */}
        {currentStep === 2 && (
          <div className="service-form-section">
            <div className="section-title-bar">
              <User color="#2563eb" size={24} />
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#1e293b' }}>
                  सेवाग्राहीको परिचय तथा सम्पर्क विवरण
                </h3>
                <small style={{ color: '#64748b' }}>तपाईंको आवेदन प्रमाणीकरणका लागि सही व्यक्तिगत विवरण भर्नुहोस्</small>
              </div>
            </div>

            <div className="form-grid">
              <div className="form-input-wrapper">
                <label className="form-group-label">पूरा नाम (Full Name) <span style={{ color: '#ef4444' }}>*</span></label>
                <input
                  type="text"
                  required
                  name="fullName"
                  className="form-control"
                  placeholder="उदा: राम बहादुर श्रेष्ठ"
                  value={formData.fullName || ''}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-input-wrapper">
                <label className="form-group-label">सम्पर्क फोन / मोबाइल <span style={{ color: '#ef4444' }}>*</span></label>
                <input
                  type="tel"
                  required
                  name="contactPhone"
                  className="form-control"
                  placeholder="उदा: ९८४१२३४५६७"
                  value={formData.contactPhone || ''}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-input-wrapper">
                <label className="form-group-label">इमेल ठेगाना</label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  placeholder="ram@example.com"
                  value={formData.email || ''}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-input-wrapper">
                <label className="form-group-label">वडा नं. (Ward) <span style={{ color: '#ef4444' }}>*</span></label>
                <select
                  required
                  name="wardNumber"
                  className="form-control"
                  value={formData.wardNumber || 3}
                  onChange={handleInputChange}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(w => (
                    <option key={w} value={w}>वडा नं. {w}</option>
                  ))}
                </select>
              </div>

              <div className="form-input-wrapper">
                <label className="form-group-label">टोल / गाउँ बस्ती</label>
                <input
                  type="text"
                  name="toleVillage"
                  className="form-control"
                  placeholder="उदा: भोताङ, गाम्चेत"
                  value={formData.toleVillage || ''}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-input-wrapper">
                <label className="form-group-label">नागरिकता वा राष्ट्रिय परिचयपत्र नं.</label>
                <input
                  type="text"
                  name="citizenshipNo"
                  className="form-control"
                  placeholder="उदा: २७-०१-७५-०१२३४"
                  value={formData.citizenshipNo || ''}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="wizard-nav-actions">
              <button
                type="button"
                className="btn-wizard-prev"
                onClick={() => setCurrentStep(1)}
              >
                <ArrowLeft size={16} />
                <span>पछाडि (Back)</span>
              </button>

              <button
                type="button"
                className="btn-wizard-next"
                onClick={() => {
                  if (!formData.fullName || !formData.contactPhone) {
                    alert('कृपया पूरा नाम र सम्पर्क नम्बर अनिवार्य रूपमा भर्नुहोस्।');
                    return;
                  }
                  setCurrentStep(3);
                }}
              >
                <span>अर्को: सेवा सम्बन्धी विवरण</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: DYNAMIC SERVICE SPECIFIC FIELDS */}
        {currentStep === 3 && (
          <div className="service-form-section">
            <div className="section-title-bar">
              <FileText color="#2563eb" size={24} />
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#1e293b' }}>
                  {selectedService.title} - आवश्यक विवरण
                </h3>
                <small style={{ color: '#64748b' }}>छनोट गरिएको सेवाका लागि आवश्यक विशेष जानकारी भर्नुहोस्</small>
              </div>
            </div>

            {/* AGRICULTURE FIELDS */}
            {selectedService.category === 'agriculture' && (
              <div className="form-grid">
                <div className="form-input-wrapper">
                  <label className="form-group-label">किसानको वर्ग (Farmer Category)</label>
                  <select
                    name="farmerCategory"
                    className="form-control"
                    value={formData.farmerCategory || 'साना किसान (२-१० रोपनी)'}
                    onChange={handleInputChange}
                  >
                    <option value="सीमान्तकृत किसान (< २ रोपनी)">सीमान्तकृत किसान (&lt; २ रोपनी)</option>
                    <option value="साना किसान (२-१० रोपनी)">साना किसान (२-१० रोपनी)</option>
                    <option value="व्यावसायिक किसान (> १० रोपनी)">व्यावसायिक किसान (&gt; १० रोपनी)</option>
                  </select>
                </div>

                <div className="form-input-wrapper">
                  <label className="form-group-label">जग्गाको क्षेत्रफल (रोपनीमा) <span style={{ color: '#ef4444' }}>*</span></label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    name="landAreaRopani"
                    className="form-control"
                    placeholder="उदा: ४.५"
                    value={formData.landAreaRopani || ''}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-input-wrapper" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-group-label">मुख्य बाली तथा उत्पादन (Major Crops)</label>
                  <input
                    type="text"
                    name="majorCrops"
                    className="form-control"
                    placeholder="उदा: भोताङे आलु, किबी फल, मकै, सिमी"
                    value={formData.majorCrops || ''}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-input-wrapper" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-group-label">पशुपालन विवरण (Livestock Details)</label>
                  <input
                    type="text"
                    name="livestockDetails"
                    className="form-control"
                    placeholder="उदा: गाई २, चौंरी १, बाख्रा ६"
                    value={formData.livestockDetails || ''}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-input-wrapper">
                  <label className="form-group-label">बैंकको नाम</label>
                  <input
                    type="text"
                    name="bankName"
                    className="form-control"
                    placeholder="उदा: नेपाल बैंक, भोताङ शाखा"
                    value={formData.bankName || ''}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-input-wrapper">
                  <label className="form-group-label">बैंक खाता नम्बर</label>
                  <input
                    type="text"
                    name="bankAccountNo"
                    className="form-control"
                    placeholder="उदा: ०२३००१०००४१२३४"
                    value={formData.bankAccountNo || ''}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            )}

            {/* HEALTH FIELDS */}
            {selectedService.category === 'health' && (
              <div className="form-grid">
                <div className="form-input-wrapper">
                  <label className="form-group-label">उमेर (Age) <span style={{ color: '#ef4444' }}>*</span></label>
                  <input
                    type="number"
                    required
                    min="0"
                    max="120"
                    name="age"
                    className="form-control"
                    placeholder="उदा: ३२"
                    value={formData.age || ''}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-input-wrapper">
                  <label className="form-group-label">लिङ्ग (Gender) <span style={{ color: '#ef4444' }}>*</span></label>
                  <select
                    name="gender"
                    className="form-control"
                    value={formData.gender || 'female'}
                    onChange={handleInputChange}
                  >
                    <option value="female">महिला (Female)</option>
                    <option value="male">पुरुष (Male)</option>
                    <option value="other">अन्य (Other)</option>
                  </select>
                </div>

                <div className="form-input-wrapper">
                  <label className="form-group-label">ओपीडी विभाग (Department)</label>
                  <select
                    name="department"
                    className="form-control"
                    value={formData.department || 'सामान्य चिकित्सा (General OPD)'}
                    onChange={handleInputChange}
                  >
                    <option value="सामान्य चिकित्सा (General OPD)">सामान्य चिकित्सा (General OPD)</option>
                    <option value="प्रसूति तथा स्त्रीरोग (MCH / ANC)">प्रसूति तथा स्त्रीरोग (MCH / ANC)</option>
                    <option value="बालरोग (Pediatrics)">बालरोग (Pediatrics)</option>
                    <option value="दन्तरोग (Dental)">दन्तरोग (Dental)</option>
                    <option value="हाडजोर्नी (Orthopedics)">हाडजोर्नी (Orthopedics)</option>
                  </select>
                </div>

                <div className="form-input-wrapper">
                  <label className="form-group-label">स्वास्थ्य संस्था (Health Facility)</label>
                  <input
                    type="text"
                    name="healthFacilityName"
                    className="form-control"
                    value={formData.healthFacilityName || 'पाँचपोखरी आधारभूत अस्पताल'}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-input-wrapper">
                  <label className="form-group-label">स्वास्थ्य बीमा छ?</label>
                  <select
                    name="hasHealthInsurance"
                    className="form-control"
                    value={formData.hasHealthInsurance ? 'yes' : 'no'}
                    onChange={(e) => setFormData({ ...formData, hasHealthInsurance: e.target.value === 'yes' })}
                  >
                    <option value="yes">छ (Yes)</option>
                    <option value="no">छैन (No)</option>
                  </select>
                </div>

                <div className="form-input-wrapper">
                  <label className="form-group-label">स्वास्थ्य बीमा नम्बर (भएमा)</label>
                  <input
                    type="text"
                    name="insuranceNumber"
                    className="form-control"
                    placeholder="उदा: NIB-2081-88412"
                    value={formData.insuranceNumber || ''}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-input-wrapper" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-group-label">मुख्य स्वास्थ्य समस्या / लक्षणहरू (Chief Complaints)</label>
                  <textarea
                    rows={3}
                    name="chiefComplaint"
                    className="form-control"
                    placeholder="उदा: २ दिनदेखि ज्वरो आएको, टाउको दुखेको र खोकी लागेको..."
                    value={formData.chiefComplaint || ''}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            )}

            {/* SIFARISH FIELDS */}
            {selectedService.category === 'sifarish' && (
              <div className="form-grid">
                <div className="form-input-wrapper" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-group-label">सिफारिस मागको प्रयोजन (Purpose) <span style={{ color: '#ef4444' }}>*</span></label>
                  <input
                    type="text"
                    required
                    name="purpose"
                    className="form-control"
                    placeholder="उदा: वैदेशिक अध्ययन भिसा प्रयोजनार्थ नाता प्रमाणित"
                    value={formData.purpose || ''}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-input-wrapper">
                  <label className="form-group-label">सम्बन्धित व्यक्ति/परिवारको विवरण</label>
                  <input
                    type="text"
                    name="relatedPersons"
                    className="form-control"
                    placeholder="उदा: बुबा- कृष्ण बहादुर, आमा- सुनमाया"
                    value={formData.relatedPersons || ''}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-input-wrapper">
                  <label className="form-group-label">कित्ता नं. वा जग्गा विवरण (आवश्यक परे)</label>
                  <input
                    type="text"
                    name="kittaNo"
                    className="form-control"
                    placeholder="उदा: कित्ता नं. २१५, क्षेत्रफल ०-८-०-०"
                    value={formData.kittaNo || ''}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-input-wrapper" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-group-label">थप विवरण / व्यहोरा (Remarks/Notes)</label>
                  <textarea
                    rows={3}
                    name="remarks"
                    className="form-control"
                    placeholder="थप कैफियत वा कार्यालयलाई जानकारी गराउनुपर्ने व्यहोरा..."
                    value={formData.remarks || ''}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            )}

            {/* BUSINESS FIELDS */}
            {selectedService.category === 'business' && (
              <div className="form-grid">
                <div className="form-input-wrapper" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-group-label">व्यवसाय वा फर्मको नाम (Business Name) <span style={{ color: '#ef4444' }}>*</span></label>
                  <input
                    type="text"
                    required
                    name="businessName"
                    className="form-control"
                    placeholder="उदा: पाँचपोखरी अर्गानिक एग्रो फार्म तथा रिसोर्ट"
                    value={formData.businessName || ''}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-input-wrapper">
                  <label className="form-group-label">व्यवसायको प्रकार (Business Type)</label>
                  <select
                    name="businessType"
                    className="form-control"
                    value={formData.businessType || 'एकलौटी फर्म'}
                    onChange={handleInputChange}
                  >
                    <option value="एकलौटी फर्म">एकलौटी फर्म (Sole Proprietorship)</option>
                    <option value="साझेदारी">साझेदारी (Partnership)</option>
                    <option value="प्राइभेट लिमिटेड">प्राइभेट लिमिटेड (Pvt. Ltd.)</option>
                    <option value="सहकारी / समूह">सहकारी / समूह (Cooperative/Group)</option>
                  </select>
                </div>

                <div className="form-input-wrapper">
                  <label className="form-group-label">कुल पूँजी लगानी (रु.) <span style={{ color: '#ef4444' }}>*</span></label>
                  <input
                    type="number"
                    required
                    name="capitalInvestment"
                    className="form-control"
                    placeholder="उदा: ५०००००"
                    value={formData.capitalInvestment || ''}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-input-wrapper" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-group-label">मुख्य कारोबार तथा सेवाको प्रकृति</label>
                  <input
                    type="text"
                    name="businessNature"
                    className="form-control"
                    placeholder="उदा: फलफूल प्रशोधन, ट्राउट माछापालन तथा पर्यटक आवास"
                    value={formData.businessNature || ''}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            )}

            <div className="wizard-nav-actions">
              <button
                type="button"
                className="btn-wizard-prev"
                onClick={() => setCurrentStep(2)}
              >
                <ArrowLeft size={16} />
                <span>पछाडि (Back)</span>
              </button>

              <button
                type="button"
                className="btn-wizard-next"
                onClick={() => setCurrentStep(4)}
              >
                <span>अर्को: कागजात र पेश (Next)</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: SUPPORTING DOCUMENTS & SUBMIT */}
        {currentStep === 4 && (
          <div className="service-form-section">
            <div className="section-title-bar">
              <Upload color="#2563eb" size={24} />
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#1e293b' }}>
                  आवश्यक कागजात अपलोड तथा स्वघोषणा
                </h3>
                <small style={{ color: '#64748b' }}>स्पष्ट बुझिने फोटो वा PDF फाइलहरू संलग्न गर्नुहोस्</small>
              </div>
            </div>

            {/* Checklist of required docs */}
            <div style={{ padding: '1rem 1.25rem', backgroundColor: '#eff6ff', borderRadius: '12px', border: '1px solid #bfdbfe', marginBottom: '1.5rem' }}>
              <div style={{ fontWeight: 700, color: '#1e40af', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                📌 यस सेवाका लागि आवश्यक पर्ने कागजातहरू:
              </div>
              <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#1e3a8a', fontSize: '0.85rem' }}>
                {selectedService.requiredDocs.map((doc, i) => (
                  <li key={i} style={{ marginBottom: '3px' }}>{doc}</li>
                ))}
              </ul>
            </div>

            {/* Upload Dropzone */}
            <div
              className="document-dropzone"
              onClick={() => document.getElementById('doc-file-input')?.click()}
            >
              <Upload size={36} color="#3b82f6" style={{ margin: '0 auto 0.75rem' }} />
              <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '1.05rem', marginBottom: '0.25rem' }}>
                यहाँ क्लिक गरी कागजात अपलोड गर्नुहोस्
              </div>
              <p style={{ color: '#64748b', fontSize: '0.82rem', margin: 0 }}>
                समर्थित ढाँचा: PDF, JPG, PNG (प्रति फाइल अधिकतम ५ MB)
              </p>
              <input
                id="doc-file-input"
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />
            </div>

            {/* Uploaded files list */}
            {uploadedFiles.length > 0 && (
              <div className="uploaded-files-list">
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginTop: '0.5rem' }}>
                  संलग्न गरिएका फाइलहरू ({uploadedFiles.length}):
                </div>
                {uploadedFiles.map((file, idx) => (
                  <div key={idx} className="uploaded-file-item">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <FileText size={18} color="#2563eb" />
                      <span style={{ fontWeight: 600, color: '#1e293b' }}>{file.name}</span>
                      <span style={{ color: '#64748b', fontSize: '0.75rem' }}>({file.size})</span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Declaration Checkbox */}
            <div style={{ marginTop: '1.75rem', padding: '1.25rem', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  style={{ width: '18px', height: '18px', marginTop: '2px', cursor: 'pointer' }}
                  checked={declarationChecked}
                  onChange={(e) => setDeclarationChecked(e.target.checked)}
                />
                <span style={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.5 }}>
                  <strong>स्वघोषणा:</strong> मैले यस एकीकृत सेवा अनुरोध फारममा भरेका सम्पूर्ण विवरण तथा संलग्न कागजातहरू सत्य-तथ्य हुन्। कुनै व्यहोरा झुठ्ठा वा किर्ते ठहरिएमा कानुन बमोजिमको कारबाही भोग्न मञ्जुर छु।
                </span>
              </label>
            </div>

            <div className="wizard-nav-actions">
              <button
                type="button"
                className="btn-wizard-prev"
                onClick={() => setCurrentStep(3)}
              >
                <ArrowLeft size={16} />
                <span>पछाडि (Back)</span>
              </button>

              <button
                type="button"
                disabled={loading || !declarationChecked}
                className="btn-wizard-next"
                style={{
                  opacity: (!declarationChecked || loading) ? 0.6 : 1,
                  cursor: (!declarationChecked || loading) ? 'not-allowed' : 'pointer'
                }}
                onClick={() => handleSubmit()}
              >
                {loading ? (
                  <span>आवेदन सुरक्षित हुँदैछ...</span>
                ) : (
                  <>
                    <span>अनुरोध पेश गर्नुहोस् (Submit Request)</span>
                    <CheckCircle2 size={18} />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: OFFICIAL DIGITAL ACKNOWLEDGMENT RECEIPT */}
        {currentStep === 5 && receiptData && (
          <div>
            <div className="digital-receipt-card">
              {/* Municipal Header */}
              <div className="receipt-header">
                <div style={{ fontSize: '0.85rem', color: '#dc2626', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  नेपाल सरकार | बागमती प्रदेश
                </div>
                <h2 style={{ margin: '4px 0', fontSize: '1.45rem', fontWeight: 900, color: '#1e3a8a' }}>
                  पाँचपोखरी थाङपाल गाउँपालिका
                </h2>
                <div style={{ fontSize: '0.9rem', color: '#475569', fontWeight: 600 }}>
                  गाउँ कार्यपालिकाको कार्यालय, सिन्धुपाल्चोक
                </div>
                <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '2px' }}>
                  एकीकृत सेवा प्रवाह प्रणाली — अनलाइन आवेदन पावती (Digital Receipt)
                </div>

                <div className="receipt-token-badge">
                  टोकन / ट्र्याकिङ कोड: {receiptData.token}
                </div>
              </div>

              {/* Receipt Summary Table */}
              <table className="receipt-details-table">
                <tbody>
                  <tr>
                    <td className="label">सेवाको नाम (Service):</td>
                    <td className="value">{receiptData.service.title}</td>
                  </tr>
                  <tr>
                    <td className="label">सम्बन्धित शाखा (Branch):</td>
                    <td className="value">{receiptData.branch}</td>
                  </tr>
                  <tr>
                    <td className="label">सेवाग्राहीको नाम (Applicant):</td>
                    <td className="value">{receiptData.applicant.fullName}</td>
                  </tr>
                  <tr>
                    <td className="label">सम्पर्क नम्बर (Phone):</td>
                    <td className="value">{receiptData.applicant.contactPhone}</td>
                  </tr>
                  <tr>
                    <td className="label">वडा तथा स्थान:</td>
                    <td className="value">वडा नं. {receiptData.applicant.wardNumber}, {receiptData.applicant.toleVillage || 'पाँचपोखरी थाङपाल'}</td>
                  </tr>
                  <tr>
                    <td className="label">दर्ता मिति (Submission Date):</td>
                    <td className="value">{receiptData.dateBs} (BS) / {receiptData.submittedAt}</td>
                  </tr>
                  <tr>
                    <td className="label">अनुमानित कार्य समय (Turnaround):</td>
                    <td className="value">{receiptData.service.turnaround}</td>
                  </tr>
                  <tr>
                    <td className="label">स्थिति (Status):</td>
                    <td className="value">
                      <span style={{ backgroundColor: '#dcfce7', color: '#15803d', padding: '3px 8px', borderRadius: '6px', fontSize: '0.82rem' }}>
                        दर्ता भएको (Registered & In Review)
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Instructions */}
              <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '10px', fontSize: '0.82rem', color: '#475569', lineHeight: 1.5, marginTop: '1rem' }}>
                ℹ️ <strong>नागरिकलाई जानकारी:</strong> तपाईंको आवेदन सुरक्षित साथ सम्बन्धित शाखामा पुगेको छ। यस पावतीमा उल्लिखित <strong>टोकन कोड ({receiptData.token})</strong> सुरक्षित राख्नुहोला। शाखाबाट कार्य सम्पन्न भएपछि तपाईंको मोबाइल नम्बरमा SMS पठाइनेछ।
              </div>

              {/* Print / Action Buttons */}
              <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem', gap: '1rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={resetForm}
                  className="dt-btn dt-btn-outline"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <RotateCcw size={16} />
                  <span>अर्को सेवा अनुरोध पेश गर्नुहोस्</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="dt-btn dt-btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#1e3a8a' }}
                >
                  <Printer size={16} />
                  <span>पावती प्रिन्ट / डाउनलोड गर्नुहोस् (Print)</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DynamicServiceForm;
