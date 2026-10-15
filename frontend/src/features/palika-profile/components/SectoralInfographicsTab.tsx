import React from 'react';
import {
  Sprout,
  HeartPulse,
  GraduationCap,
  TrendingUp,
  FolderGit2,
  AlertTriangle,
  HeartHandshake,
  Compass,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  Building,
  Milk,
  Truck,
  Mountain
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const SectoralInfographicsTab: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* HEADER BANNER */}
      <div className="palika-glass-card" style={{ padding: '1.25rem 1.5rem', background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)', border: '1.5px solid #a7f3d0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="agri-badge agri-badge-success">८ विषयगत शाखाहरू</span>
              <span style={{ fontSize: '0.8rem', color: '#047857', fontWeight: 700 }}>लाइभ डिजिटल ट्विन्स टेलिमेट्री</span>
            </div>
            <h3 style={{ margin: '0.35rem 0 0', fontSize: '1.25rem', fontWeight: 900, color: '#065f46' }}>
              बहु-क्षेत्रीय एकीकृत इन्फोग्राफिक्स म्याट्रिक्स (Cross-Sectoral Unified Dashboard)
            </h3>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.86rem', color: '#047857' }}>
              पाँचपोखरी थाङपालका कृषि, स्वास्थ्य, शिक्षा, राजस्व, पूर्वाधार, विपद्, पर्यटन र सामाजिक सुरक्षा मोड्युलहरूबाट संकलित आधिकारिक प्रगति
            </p>
          </div>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#065f46', background: '#ffffff', padding: '6px 12px', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
            आ.व. २०८१/८२ अद्यावधिक
          </div>
        </div>
      </div>

      {/* 8 SECTORAL INFOGRAPHIC CARDS GRID */}
      <div className="palika-sector-grid">
        {/* 1. कृषि तथा पशुपन्छी */}
        <div className="palika-sector-card" style={{ borderTop: '4px solid #059669' }}>
          <div className="palika-sector-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sprout size={20} />
              </div>
              <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: '#0f172a' }}>कृषि तथा पशुपन्छी</h4>
            </div>
            <span className="agri-badge agri-badge-success">सक्रिय</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.84rem', color: '#334155' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>वार्षिक आलु उत्पादन:</span>
              <strong style={{ color: '#047857' }}>१,४५० मे.टन</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>दैनिक दूध संकलन:</span>
              <strong style={{ color: '#0284c7' }}>३,०५०+ लिटर</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>चौँरी/गाई तथा बाख्रा:</span>
              <strong>२२,७५०+ गोटा</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>मलखाद कोटा (अनुदान):</span>
              <strong>०.८५ टन</strong>
            </div>
          </div>

          <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #e2e8f0' }}>
            <Link to="/app/agriculture" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem', fontWeight: 800, color: '#059669', textDecoration: 'none' }}>
              कृषि पोर्टल खोल्नुहोस् <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* 2. स्वास्थ्य सेवा */}
        <div className="palika-sector-card" style={{ borderTop: '4px solid #ef4444' }}>
          <div className="palika-sector-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <HeartPulse size={20} />
              </div>
              <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: '#0f172a' }}>स्वास्थ्य तथा पोषण</h4>
            </div>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: '#fee2e2', color: '#b91c1c' }}>DHIS2 Live</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.84rem', color: '#334155' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>स्वास्थ्य चौकी + अस्पताल:</span>
              <strong>८ चौकी + १ अस्पताल</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>पूर्ण खोप कभरेज:</span>
              <strong style={{ color: '#047857' }}>९८.४% (प्रमाणित)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>संस्थागत सुत्केरी दर:</span>
              <strong style={{ color: '#0284c7' }}>९१.२%</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>एम्बुलेन्स सेवा:</span>
              <strong>२ वटा २४/७ तैनाथ</strong>
            </div>
          </div>

          <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #e2e8f0' }}>
            <Link to="/app/health" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem', fontWeight: 800, color: '#dc2626', textDecoration: 'none' }}>
              स्वास्थ्य सेवा खोल्नुहोस् <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* 3. शिक्षा प्रणाली */}
        <div className="palika-sector-card" style={{ borderTop: '4px solid #0284c7' }}>
          <div className="palika-sector-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <GraduationCap size={20} />
              </div>
              <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: '#0f172a' }}>शिक्षा तथा साक्षरता</h4>
            </div>
            <span className="agri-badge agri-badge-info">EMIS Sync</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.84rem', color: '#334155' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>सामुदायिक विद्यालय:</span>
              <strong>३२ विद्यालय + १ क्याम्पस</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>कुल विद्यार्थी संख्या:</span>
              <strong style={{ color: '#0f4c81' }}>४,१२० जना</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>छात्र / छात्रा अनुपात:</span>
              <strong>४९% : ५१%</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>दिवा खाजा कार्यक्रम:</span>
              <strong style={{ color: '#047857' }}>९४% कभरेज</strong>
            </div>
          </div>

          <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #e2e8f0' }}>
            <Link to="/app/education" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem', fontWeight: 800, color: '#0284c7', textDecoration: 'none' }}>
              शिक्षा प्रणाली खोल्नुहोस् <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* 4. आर्थिक तथा राजस्व */}
        <div className="palika-sector-card" style={{ borderTop: '4px solid #f59e0b' }}>
          <div className="palika-sector-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingUp size={20} />
              </div>
              <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: '#0f172a' }}>राजस्व तथा बजेट</h4>
            </div>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: '#fef3c7', color: '#b45309' }}>e-Tax</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.84rem', color: '#334155' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>वार्षिक कुल बजेट:</span>
              <strong style={{ color: '#0f172a' }}>रु. ५८.४५ करोड</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>आन्तरिक राजस्व संकलन:</span>
              <strong style={{ color: '#047857' }}>रु. २.८० करोड</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>पुँजीगत खर्च प्रगति:</span>
              <strong style={{ color: '#0284c7' }}>६८.४%</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>करदाता दायरा:</span>
              <strong>३,४५० दर्ता</strong>
            </div>
          </div>

          <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #e2e8f0' }}>
            <Link to="/app/revenue" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem', fontWeight: 800, color: '#d97706', textDecoration: 'none' }}>
              राजस्व ड्यासवोर्ड खोल्नुहोस् <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* 5. पूर्वाधार तथा योजना */}
        <div className="palika-sector-card" style={{ borderTop: '4px solid #6366f1' }}>
          <div className="palika-sector-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#e0e7ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FolderGit2 size={20} />
              </div>
              <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: '#0f172a' }}>पूर्वाधार तथा योजना</h4>
            </div>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: '#e0e7ff', color: '#4338ca' }}>e-BPS / PAMS</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.84rem', color: '#334155' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>सडक सञ्जाल लम्बाइ:</span>
              <strong>२८० कि.मी.</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>कालोपत्रे तथा ग्राभेल:</span>
              <strong style={{ color: '#047857' }}>१३० कि.मी. (४६%)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>चालू विकास आयोजना:</span>
              <strong style={{ color: '#0284c7' }}>६२ वटा योजना</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>घर-नक्सा पास (e-BPS):</span>
              <strong>१४५ स्वीकृत</strong>
            </div>
          </div>

          <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #e2e8f0' }}>
            <Link to="/app/projects" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem', fontWeight: 800, color: '#4f46e5', textDecoration: 'none' }}>
              आयोजना सूची खोल्नुहोस् <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* 6. विपद् तथा वातावरण */}
        <div className="palika-sector-card" style={{ borderTop: '4px solid #dc2626' }}>
          <div className="palika-sector-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertTriangle size={20} />
              </div>
              <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: '#0f172a' }}>विपद् तथा वातावरण</h4>
            </div>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: '#fee2e2', color: '#dc2626' }}>पूर्वसूचना</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.84rem', color: '#334155' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>वन क्षेत्र कभरेज:</span>
              <strong style={{ color: '#047857' }}>५४% (हरित पालिका)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>मेलम्ची बाढी जोखिम क्षेत्र:</span>
              <strong style={{ color: '#dc2626' }}>४ वडा जोखिमयुक्त</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>पूर्वसूचना साइरन प्रणाली:</span>
              <strong>३ स्थानमा जडित</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>आपतकालीन आश्रयस्थल:</span>
              <strong>८ वटा तोकिएको</strong>
            </div>
          </div>

          <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #e2e8f0' }}>
            <Link to="/app/disaster" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem', fontWeight: 800, color: '#dc2626', textDecoration: 'none' }}>
              विपद् पोर्टल खोल्नुहोस् <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* 7. सामाजिक सुरक्षा */}
        <div className="palika-sector-card" style={{ borderTop: '4px solid #8b5cf6' }}>
          <div className="palika-sector-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#f3e8ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <HeartHandshake size={20} />
              </div>
              <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: '#0f172a' }}>सामाजिक सुरक्षा</h4>
            </div>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: '#f3e8ff', color: '#6d28d9' }}>SSIS Sync</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.84rem', color: '#334155' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>कुल भत्ता लाभान्वित:</span>
              <strong style={{ color: '#7c3aed' }}>२,८४० जना</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>ज्येष्ठ नागरिक संख्या:</span>
              <strong>१,४२० जना</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>वार्षिक वितरण रकम:</span>
              <strong style={{ color: '#047857' }}>रु. ६.२० करोड</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>बैंकिङ भुक्तानी प्रणाली:</span>
              <strong>१००% बैंक खातामा</strong>
            </div>
          </div>

          <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #e2e8f0' }}>
            <Link to="/app/vital-events?tab=beneficiaries" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem', fontWeight: 800, color: '#7c3aed', textDecoration: 'none' }}>
              सामाजिक सुरक्षा तथा पञ्जीकरण खोल्नुहोस् <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* 8. पर्यटन तथा सम्पदा */}
        <div className="palika-sector-card" style={{ borderTop: '4px solid #0891b2' }}>
          <div className="palika-sector-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#cffafe', color: '#0891b2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Compass size={20} />
              </div>
              <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: '#0f172a' }}>पर्यटन तथा संस्कृति</h4>
            </div>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: '#cffafe', color: '#0e7490' }}>रामसार क्षेत्र</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.84rem', color: '#334155' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>प्रमुख पर्यटकीय गन्तव्य:</span>
              <strong>१० वटा सूचीकृत</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>दर्ता सामुदायिक होमस्टे:</span>
              <strong style={{ color: '#0891b2' }}>२४ घर</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>वार्षिक पदयात्री पर्यटक:</span>
              <strong style={{ color: '#047857' }}>१२,५००+ जना</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>धार्मिक सम्पदा (गुम्बा/मन्दिर):</span>
              <strong>४८ वटा</strong>
            </div>
          </div>

          <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #e2e8f0' }}>
            <Link to="/app/tourism" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem', fontWeight: 800, color: '#0891b2', textDecoration: 'none' }}>
              पर्यटन पोर्टल खोल्नुहोस् <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
