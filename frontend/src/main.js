// ═══════════════════════════════════════════════════════════════
// P5 DIGITAL TWIN — Main JavaScript
// पाँचपोखरी थाङपाल गाउँपालिका
// ═══════════════════════════════════════════════════════════════

import './style.css';

// ── Config ─────────────────────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';
const MAP_CENTER = [27.9475, 85.7103];
const MAP_ZOOM = 11;

// ── State ──────────────────────────────────────────────────────
let currentLang = 'ne';
let mainMap = null;
let disasterMap = null;
let mapLayers = {};
let starRatingValue = 0;
let aiThinking = false;

// ── i18n Translations ──────────────────────────────────────────
const translations = {
  ne: {
    'nav.profile': 'पालिका परिचय',
    'nav.gis': 'GIS नक्सा',
    'nav.projects': 'योजनाहरू',
    'nav.tourism': 'पर्यटन',
    'nav.disaster': 'विपद्',
    'nav.opendata': 'खुला डेटा',
    'nav.admin': 'प्रशासन',
    'hero.badge': 'LIVE · रियल-टाइम डेटा सक्रिय',
    'hero.line1': 'नक्सामा विकास',
    'hero.line2': 'तथ्याङ्कमा प्रगति',
    'hero.line3': 'AI बाट निर्णय।',
    'hero.subtitle': 'पाँचपोखरी थाङपाल गाउँपालिकाको एकीकृत डिजिटल ट्विन प्लेटफर्म — GIS, AI, पर्यटन, विपद् व्यवस्थापन र विकास बुद्धिमत्ता एकै ठाउँमा।',
    'hero.cta.map': 'GIS नक्सा हेर्नुस्',
    'hero.cta.projects': 'विकास योजनाहरू',
    'hero.cta.ai': 'AI सोध्नुस्',
    'stat.wards': 'वडाहरू',
    'stat.population': 'जनसंख्या',
    'stat.projects': 'विकास योजना',
    'stat.tourists': 'वार्षिक पर्यटक',
    'section.profile.badge': 'पालिका परिचय',
    'section.profile.title': 'पाँचपोखरी थाङपाल गाउँपालिका',
    'section.profile.subtitle': 'सिन्धुपाल्चोक जिल्ला, बागमती प्रदेश, नेपाल',
    'kpi.population': 'कुल जनसंख्या',
    'kpi.tourists': 'वार्षिक पर्यटक',
    'kpi.budget': 'वार्षिक बजेट',
    'kpi.completed': 'पूरा योजनाहरू',
    'coverage.title': 'सेवा पहुँच (Coverage)',
    'wards.title': 'वडा प्रोफाइल',
    'gis.badge': 'इन्टरएक्टिभ GIS नक्सा',
    'gis.title': 'डिजिटल जिओग्राफिक नक्सा',
    'projects.title': 'विकास योजनाहरू',
    'projects.subtitle': 'पाँचपोखरी थाङपाल गाउँपालिकाका विकास कार्यहरू',
    'filter.all': 'सबै',
    'filter.ongoing': 'जारी',
    'filter.completed': 'पूरा',
    'filter.planned': 'योजित',
    'projects.viewall': 'सबै योजना हेर्नुस्',
    'achievements.title': '२०७९–२०८४: पाँच वर्षे विकास',
    'achievements.subtitle': 'अघिल्लो अवस्था र हालको अवस्थाको तुलना',
    'tourism.title': 'स्मार्ट पाँचपोखरी पर्यटन',
    'tourism.subtitle': 'AI-सक्षम पर्यटक गणना र विश्लेषण',
    'disaster.title': 'पाँचपोखरी विपद् बुद्धिमत्ता केन्द्र',
    'opendata.title': 'Open Panchpokhari Data',
    'opendata.subtitle': 'सार्वजनिक उपयोगको लागि अनुमोदित डेटासेट',
    'ai.title': 'Ask Panchpokhari AI',
    'ai.subtitle': 'पालिकाको बारेमा जुनसुकै प्रश्न सोध्नुस् — नेपाली वा अंग्रेजीमा',
    'feedback.title': 'नागरिक सन्तुष्टि सर्वेक्षण',
    'feedback.form.title': 'आफ्नो प्रतिक्रिया दिनुस्',
    'feedback.ward': 'वडा नम्बर',
    'feedback.comment': 'टिप्पणी',
    'feedback.submit': 'पठाउनुस्',
    'satisfaction.title': 'नागरिक सन्तुष्टि',
    'chart.budget.title': 'बजेट प्रवृत्ति (आ.व. २०७९ – २०८४)',
  },
  en: {
    'nav.profile': 'Municipality',
    'nav.gis': 'GIS Map',
    'nav.projects': 'Projects',
    'nav.tourism': 'Tourism',
    'nav.disaster': 'Disaster',
    'nav.opendata': 'Open Data',
    'nav.admin': 'Admin',
    'hero.badge': 'LIVE · Real-time Data Active',
    'hero.line1': 'Development on Map',
    'hero.line2': 'Progress in Data',
    'hero.line3': 'Decisions by AI.',
    'hero.subtitle': 'Integrated Digital Twin Platform for Panchpokhari Thangpal Rural Municipality — GIS, AI, Tourism, Disaster Management and Development Intelligence in one place.',
    'hero.cta.map': 'View GIS Map',
    'hero.cta.projects': 'Development Projects',
    'hero.cta.ai': 'Ask AI',
    'stat.wards': 'Wards',
    'stat.population': 'Population',
    'stat.projects': 'Projects',
    'stat.tourists': 'Annual Tourists',
    'section.profile.badge': 'Municipality Profile',
    'section.profile.title': 'Panchpokhari Thangpal Rural Municipality',
    'section.profile.subtitle': 'Sindhupalchok District, Bagmati Province, Nepal',
    'kpi.population': 'Total Population',
    'kpi.tourists': 'Annual Tourists',
    'kpi.budget': 'Annual Budget',
    'kpi.completed': 'Completed Projects',
    'coverage.title': 'Service Coverage',
    'wards.title': 'Ward Profiles',
    'gis.badge': 'Interactive GIS Map',
    'gis.title': 'Digital Geographic Map',
    'projects.title': 'Development Projects',
    'projects.subtitle': 'Development works of Panchpokhari Thangpal Rural Municipality',
    'filter.all': 'All',
    'filter.ongoing': 'Ongoing',
    'filter.completed': 'Completed',
    'filter.planned': 'Planned',
    'projects.viewall': 'View All Projects',
    'achievements.title': '2079–2084: Five Year Development',
    'achievements.subtitle': 'Comparison of previous and current status',
    'tourism.title': 'Smart Panchpokhari Tourism',
    'tourism.subtitle': 'AI-powered tourist counting and analytics',
    'disaster.title': 'Panchpokhari Disaster Intelligence Center',
    'opendata.title': 'Open Panchpokhari Data',
    'opendata.subtitle': 'Approved datasets for public use',
    'ai.title': 'Ask Panchpokhari AI',
    'ai.subtitle': 'Ask any question about the municipality — in Nepali or English',
    'feedback.title': 'Citizen Satisfaction Survey',
    'feedback.form.title': 'Submit Your Feedback',
    'feedback.ward': 'Ward Number',
    'feedback.comment': 'Comment',
    'feedback.submit': 'Submit',
    'satisfaction.title': 'Citizen Satisfaction',
    'chart.budget.title': 'Budget Trend (FY 2079 – 2084)',
  }
};

// ── Demo Data ──────────────────────────────────────────────────
const WARDS = [
  { id: 1, name: 'वडा नं. १', nameEn: 'Ward No. 1', population: 3120, households: 680, schools: 2, health: 1, area: '38.2 km²' },
  { id: 2, name: 'वडा नं. २', nameEn: 'Ward No. 2', population: 2845, households: 612, schools: 3, health: 1, area: '41.5 km²' },
  { id: 3, name: 'वडा नं. ३', nameEn: 'Ward No. 3', population: 3210, households: 698, schools: 2, health: 0, area: '33.1 km²' },
  { id: 4, name: 'वडा नं. ४', nameEn: 'Ward No. 4', population: 2780, households: 601, schools: 2, health: 1, area: '35.8 km²' },
  { id: 5, name: 'वडा नं. ५', nameEn: 'Ward No. 5', population: 3450, households: 748, schools: 3, health: 1, area: '40.3 km²' },
  { id: 6, name: 'वडा नं. ६', nameEn: 'Ward No. 6', population: 2924, households: 634, schools: 2, health: 1, area: '37.6 km²' },
  { id: 7, name: 'वडा नं. ७', nameEn: 'Ward No. 7', population: 2738, households: 594, schools: 2, health: 0, area: '42.1 km²' },
  { id: 8, name: 'वडा नं. ८', nameEn: 'Ward No. 8', population: 2780, households: 667, schools: 2, health: 1, area: '33.55 km²' },
];

const PROJECTS = [
  { id: 'PPK-W01-RD-2083-001', name: 'खहरे–चाैकी सडक कालोपत्रे', nameEn: 'Khaure-Chauki Road Blacktopping', ward: 1, sector: 'सडक', status: 'completed', budget: '४५ लाख', progress: 100, lat: 27.965, lng: 85.715 },
  { id: 'PPK-W02-WS-2083-002', name: 'बडीखेल खानेपानी आयोजना', nameEn: 'Badikhel Water Supply Project', ward: 2, sector: 'खानेपानी', status: 'ongoing', budget: '३५ लाख', progress: 65, lat: 27.950, lng: 85.720 },
  { id: 'PPK-W03-ED-2083-003', name: 'बाग्मती माविको भवन निर्माण', nameEn: 'Bagmati Secondary School Construction', ward: 3, sector: 'शिक्षा', status: 'ongoing', budget: '५५ लाख', progress: 78, lat: 27.940, lng: 85.700 },
  { id: 'PPK-W04-HE-2083-004', name: 'प्राथमिक स्वास्थ्य केन्द्र विस्तार', nameEn: 'Primary Health Center Expansion', ward: 4, sector: 'स्वास्थ्य', status: 'completed', budget: '२८ लाख', progress: 100, lat: 27.955, lng: 85.695 },
  { id: 'PPK-W05-AG-2083-005', name: 'कृषि सडक विस्तार–पिपलखेत', nameEn: 'Agricultural Road - Piplakhet', ward: 5, sector: 'कृषि', status: 'planned', budget: '१८ लाख', progress: 0, lat: 27.970, lng: 85.725 },
  { id: 'PPK-W06-IT-2083-006', name: 'इन्टरनेट सेवा विस्तार', nameEn: 'Internet Service Expansion', ward: 6, sector: 'इन्टरनेट', status: 'ongoing', budget: '12 लाख', progress: 45, lat: 27.948, lng: 85.708 },
  { id: 'PPK-W07-RD-2083-007', name: 'थाङपाल–हाडे ग्राभेल सडक', nameEn: 'Thangpal-Hade Gravel Road', ward: 7, sector: 'सडक', status: 'ongoing', budget: '५२ लाख', progress: 55, lat: 27.935, lng: 85.718 },
  { id: 'PPK-W08-WS-2083-008', name: 'माथिल्लो टोल खानेपानी', nameEn: 'Upper Settlement Water Supply', ward: 8, sector: 'खानेपानी', status: 'completed', budget: '२२ लाख', progress: 100, lat: 27.960, lng: 85.698 },
  { id: 'PPK-W01-EL-2083-009', name: 'सौर्य विद्युत घरधुरी कार्यक्रम', nameEn: 'Solar Electricity Program', ward: 1, sector: 'विद्युत', status: 'completed', budget: '३० लाख', progress: 100, lat: 27.962, lng: 85.712 },
];

const TOURISM_PLACES = [
  { id: 1, name: 'पाँचपोखरी ताल', nameEn: 'Panchpokhari Lakes', type: 'धार्मिक/प्राकृतिक', icon: '🏔️', visitors: 4200, lat: 27.9850, lng: 85.7580 },
  { id: 2, name: 'थाङपाल भञ्ज्याङ', nameEn: 'Thangpal Pass', type: 'ट्रेकिङ', icon: '🥾', visitors: 2100, lat: 27.9720, lng: 85.7420 },
  { id: 3, name: 'चण्डेश्वरी मन्दिर', nameEn: 'Chandeshwari Temple', type: 'धार्मिक', icon: '🛕', visitors: 1850, lat: 27.9520, lng: 85.7050 },
  { id: 4, name: 'सुन्दरी खोला ट्रेल', nameEn: 'Sundari River Trail', type: 'पर्यटन', icon: '🌊', visitors: 980, lat: 27.9410, lng: 85.7100 },
  { id: 5, name: 'थाङपाल व्यूपोइन्ट', nameEn: 'Thangpal Viewpoint', type: 'दृश्यावलोकन', icon: '🔭', visitors: 1320, lat: 27.9650, lng: 85.7300 },
  { id: 6, name: 'ज्यामिरेश्वर पोखरी', nameEn: 'Jyamireswor Lake', type: 'प्राकृतिक', icon: '💧', visitors: 760, lat: 27.9780, lng: 85.7200 },
];

const ACHIEVEMENTS = [
  { icon: '🛣️', label: 'सडक पहुँच', labelEn: 'Road Access', before: '50%', after: '85%', change: '+35%' },
  { icon: '💧', label: 'खानेपानी', labelEn: 'Water Supply', before: '45%', after: '82%', change: '+37%' },
  { icon: '⚡', label: 'विद्युत', labelEn: 'Electricity', before: '62%', after: '91%', change: '+29%' },
  { icon: '📡', label: 'इन्टरनेट', labelEn: 'Internet', before: '8%', after: '55%', change: '+47%' },
  { icon: '🏫', label: 'शिक्षा', labelEn: 'Education', before: '72%', after: '94%', change: '+22%' },
  { icon: '🏥', label: 'स्वास्थ्य', labelEn: 'Health Access', before: '38%', after: '76%', change: '+38%' },
  { icon: '🏔️', label: 'वार्षिक पर्यटक', labelEn: 'Annual Tourists', before: '3,200', after: '12,450', change: '+289%' },
  { icon: '📊', label: 'डिजिटल सेवा', labelEn: 'Digital Services', before: '0', after: '8', change: 'नयाँ' },
];

const OPEN_DATASETS = [
  { title: 'बजेट तथा खर्च', titleEn: 'Budget & Expenditure', desc: 'आ.व. २०७९-२०८४ पाँच वर्षे बजेट तथ्याङ्क', formats: ['csv', 'json', 'pdf'] },
  { title: 'विकास योजनाहरू', titleEn: 'Development Projects', desc: '२४७ योजनाहरूको सम्पूर्ण विवरण', formats: ['csv', 'json', 'geojson'] },
  { title: 'जनसांख्यिकी', titleEn: 'Demographics', desc: 'वडागत जनसंख्या तथ्याङ्क', formats: ['csv', 'json'] },
  { title: 'पर्यटन तथ्याङ्क', titleEn: 'Tourism Statistics', desc: 'मासिक र वार्षिक पर्यटक तथ्याङ्क', formats: ['csv', 'json'] },
  { title: 'GIS तह', titleEn: 'GIS Layers', desc: 'वडा सिमाना, सडक, पर्यटन स्थल', formats: ['geojson'] },
  { title: 'वार्षिक प्रतिवेदन', titleEn: 'Annual Reports', desc: 'आ.व. २०८०/०८१ र २०८१/०८२', formats: ['pdf'] },
];

// AI Knowledge Base for mock responses
const AI_KNOWLEDGE = {
  'वडा ५': 'वडा नं. ५ मा हाल ३१ वटा योजनाहरू छन्। जनसंख्या ३,४५० छ। ३ वटा विद्यालय र १ स्वास्थ्य केन्द्र सञ्चालनमा छन्। खानेपानी पहुँच ७८% र विद्युत पहुँच ९२% छ। [स्रोत: DEMO डेटा]',
  'पर्यटक': 'आ.व. २०८३/०८४ मा पाँचपोखरीमा १२,४५० पर्यटक आएका थिए। यो गत वर्षको तुलनामा १८.४% ले बढी हो। सबैभन्दा बढी पर्यटक पाँचपोखरी ताल (४,२०० जना), थाङपाल भञ्ज्याङ (२,१०० जना) र चण्डेश्वरी मन्दिर (१,८५० जना) मा गए। [स्रोत: DEMO डेटा - AI काउन्टर]',
  'बजेट': 'आ.व. २०८१/०८२ को वार्षिक बजेट रु. २८.५ करोड छ। यसमध्ये पूँजीगत खर्च ५५%, चालु खर्च ३०%, र अन्य १५% छ। बजेट उपयोग ७८.४% छ। [स्रोत: DEMO वित्त तथ्याङ्क]',
  'खर्च': 'पाँच वर्षमा सबैभन्दा बढी खर्च सडक क्षेत्रमा (३२%), त्यसपछि खानेपानी (१८%), शिक्षा (१५%), स्वास्थ्य (१२%) र कृषि (१०%) मा भयो। [स्रोत: DEMO वित्त तथ्याङ्क]',
  'विपद्': 'पाँचपोखरी क्षेत्रमा मुख्य विपद् जोखिम: बाढी (सुन्दरी खोला क्षेत्र - मध्यम जोखिम) र पहिरो (थाङपाल उत्तरी भाग - उच्च जोखिम)। हाल सबै सेन्सर सामान्य अवस्थामा छन्। [स्रोत: DEMO सेन्सर डेटा]',
  'सडक': 'गत ५ वर्षमा सडक पहुँच ५०% बाट ८५% पुगेको छ। ४५ किमि नयाँ सडक निर्माण र कालोपत्रे भएको छ। हाल ७ वटा सडक योजना सञ्चालनमा छन्। [स्रोत: DEMO पूर्वाधार डेटा]',
};

// ── Initialize ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  await loadTenantProfile();

  loadMunicipalityStats();
  initNavbar();
  initParticles();
  initCounters();
  initWardCards();
  initMainMap();
  initProjectsGrid();
  initAchievements();
  initBudgetChart();
  initTourismSection();
  initDisasterMap();
  initOpenData();
  initStarRating();
  initSatisfactionChart();
  initHeroMiniChart();
  initVisitorTrendChart();
  startLiveUpdates();
  initAOSObserver();
  duplicateTickerItems();
  initDigitalReport();
});

// ── Load Dynamic Stats ─────────────────────────────────────────
async function loadTenantProfile() {
  try {
    const tenant = await window.api.get('/tenants/current');
    if (tenant && tenant.nameNp) {
      // Update DOM elements with tenant branding
      document.querySelectorAll('.brand-name').forEach(el => el.textContent = tenant.nameNp);
      const mainTitle = document.querySelector('.hero-content h1');
      if (mainTitle) mainTitle.innerHTML = `${tenant.nameNp}<br><span class="gradient-text">डिजिटल ट्विन</span>`;
      
      const logoImg = document.querySelector('.nav-brand img');
      if (logoImg && tenant.logoUrl) logoImg.src = tenant.logoUrl;
      
      document.title = `${tenant.nameEn || tenant.nameNp} - Digital Twin`;
    }
  } catch(e) {
    console.error('Failed to load tenant', e);
  }
}

async function loadMunicipalityStats() {
  try {
    const res = await fetch(`${API_BASE}/projects/stats`, { headers: window.api.headers() });
    if (!res.ok) return;
    const stats = await res.json();
    
    // Update KPI targets based on response
    // E.g. we might have projects stats. Wards are fixed to 8 or 9.
    const projectsCounter = document.querySelector('.hstat-value[data-target="247"]');
    if (projectsCounter) {
      projectsCounter.setAttribute('data-target', stats.total || 0);
    }
    
    // Also re-init counters so they animate to the new target
    initCounters();
  } catch (error) {
    console.error('Failed to load municipality stats', error);
  }
}

// ── Navbar Scroll ───────────────────────────────────────────────
function initNavbar() {
  const navbar = document.getElementById('mainNavbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
  });
}

// ── Particles ───────────────────────────────────────────────────
function initParticles() {
  const container = document.getElementById('heroParticles');
  if (!container) return;
  for (let i = 0; i < 50; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.cssText = `
      left: ${Math.random() * 100}%;
      width: ${Math.random() * 3 + 1}px;
      height: ${Math.random() * 3 + 1}px;
      animation-duration: ${Math.random() * 20 + 10}s;
      animation-delay: ${Math.random() * -20}s;
      opacity: ${Math.random() * 0.5 + 0.2};
    `;
    container.appendChild(p);
  }
}

// ── Digital Report Logic ───────────────────────────────────────
function initDigitalReport() {
  const fySelect = document.getElementById('publicFiscalYear');
  if (!fySelect) return;

  fySelect.addEventListener('change', (e) => {
    loadDigitalReport(e.target.value);
  });

  // Load initial data
  loadDigitalReport(fySelect.value);
}

async function loadDigitalReport(fiscalYear) {
  const grid = document.getElementById('publicIndicatorsGrid');
  if (!grid) return;

  grid.innerHTML = `
    <div class="col-12 text-center text-white-50 py-5">
      <div class="spinner-border text-primary" role="status"></div>
      <div class="mt-3">तथ्याङ्क लोड हुँदैछ...</div>
    </div>
  `;

  try {
    const res = await fetch(`${API_BASE}/documents/indicators?fiscalYear=${encodeURIComponent(fiscalYear)}`);
    if (!res.ok) throw new Error('Failed to fetch data');
    const data = await res.json();

    if (!data || data.length === 0) {
      grid.innerHTML = `
        <div class="col-12 text-center text-white-50 py-5">
          <i class="bi bi-inbox fs-1"></i>
          <div class="mt-3">यस आर्थिक वर्षको कुनै पनि तथ्याङ्क फेला परेन।</div>
        </div>
      `;
      return;
    }

    grid.innerHTML = '';
    
    // Group by category (Optional, but let's just display all of them)
    data.forEach(ind => {
      const col = document.createElement('div');
      col.className = 'col-md-6 col-lg-3 mb-4';
      
      let icon = 'bi-bar-chart';
      if (ind.category === 'Education' || ind.category === 'शिक्षा') icon = 'bi-book';
      else if (ind.category === 'Health' || ind.category === 'स्वास्थ्य') icon = 'bi-heart-pulse';
      else if (ind.category === 'Agriculture' || ind.category === 'कृषि') icon = 'bi-tree';
      else if (ind.category === 'Infrastructure' || ind.category === 'सडक') icon = 'bi-cone-striped';
      else if (ind.category === 'Tourism' || ind.category === 'पर्यटन') icon = 'bi-camera';

      col.innerHTML = `
        <div class="indicator-card h-100" data-aos="fade-up">
          <div class="indicator-header">
            <div class="indicator-icon">
              <i class="bi ${icon}"></i>
            </div>
            <h5 class="indicator-title">${ind.nameNp || ind.nameEn}</h5>
          </div>
          <div class="indicator-value">
            ${ind.value.toLocaleString()} <span class="indicator-unit">${ind.unit || ''}</span>
          </div>
          <div class="indicator-footer">
            <span>स्रोत: ${ind.sourceDocument?.title || 'आधिकारिक प्रतिवेदन'}</span>
            ${ind.sourcePage ? `<span>पृष्ठ: ${ind.sourcePage}</span>` : ''}
          </div>
        </div>
      `;
      grid.appendChild(col);
    });

  } catch (error) {
    console.error(error);
    grid.innerHTML = `
      <div class="col-12 text-center text-danger py-5">
        <i class="bi bi-exclamation-triangle fs-1"></i>
        <div class="mt-3">तथ्याङ्क लोड गर्न समस्या भयो। कृपया पछि प्रयास गर्नुहोला।</div>
      </div>
    `;
  }
}

// ── Counters ───────────────────────────────────────────────────
function initCounters() {
  const counters = document.querySelectorAll('.counter[data-target]');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(c => obs.observe(c));
}

function animateCounter(el) {
  const target = parseInt(el.dataset.target);
  const duration = 1800;
  const step = target / (duration / 16);
  let current = 0;
  const timer = setInterval(() => {
    current = Math.min(current + step, target);
    el.textContent = Math.floor(current).toLocaleString('ne-NP');
    if (current >= target) clearInterval(timer);
  }, 16);
}

// ── Ward Cards ─────────────────────────────────────────────────
async function initWardCards() {
  const container = document.getElementById('wardCards');
  if (!container) return;
  
  try {
    const res = await fetch(`${API_BASE}/wards`);
    if (!res.ok) return;
    const data = await res.json();
    
    container.innerHTML = '';
    
    data.forEach(w => {
      const col = document.createElement('div');
      col.className = 'col-lg-3 col-md-4 col-sm-6';
      col.innerHTML = `
        <div class="ward-card" onclick="showWardDetail('${w.id}')">
          <div class="ward-num">वडा नं. ${w.wardNumber}</div>
          <div class="ward-pop"><i class="bi bi-people"></i> ${(w.population || 0).toLocaleString()} जना</div>
          <div class="ward-stats">
            <div class="ws-item"><i class="bi bi-building"></i> ${w.schools || 0} विद्यालय</div>
            <div class="ws-item"><i class="bi bi-heart-pulse"></i> ${w.healthPosts || 0} स्वास्थ्य</div>
          </div>
          <div style="font-size:0.72rem; color:var(--dark-muted); margin-top:8px;">${w.areaSqKm || 0} वर्ग कि.मि.</div>
        </div>`;
      container.appendChild(col);
    });
  } catch (error) {
    console.error('Failed to load wards:', error);
  }
}

// ── Main GIS Map ────────────────────────────────────────────────
function initMainMap() {
  if (!document.getElementById('mainMap')) return;

  mainMap = L.map('mainMap', {
    center: MAP_CENTER,
    zoom: MAP_ZOOM,
    zoomControl: true,
  });

  // Dark tile layer
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '© OpenStreetMap contributors © CARTO',
    subdomains: 'abcd',
    maxZoom: 19,
  }).addTo(mainMap);

  // Also load satellite for toggle
  const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: '© Esri'
  });

  // Approximate municipality boundary (demo polygon)
  const boundaryCoords = [
    [27.910, 85.670], [27.912, 85.740], [27.980, 85.780],
    [28.010, 85.750], [28.005, 85.680], [27.970, 85.650],
    [27.940, 85.645], [27.910, 85.670]
  ];

  const boundary = L.polygon(boundaryCoords, {
    color: '#1565C0',
    weight: 2.5,
    fillColor: '#0D47A1',
    fillOpacity: 0.08,
    dashArray: '6,4',
  }).addTo(mainMap);

  boundary.bindPopup(`
    <div class="p5-popup">
      <h6>पाँचपोखरी थाङपाल गाउँपालिका</h6>
      <p style="font-size:0.8rem; color:#94A3B8;">सिन्धुपाल्चोक, बागमती प्रदेश</p>
      <p style="font-size:0.82rem;">क्षेत्रफल: ३०२.०५ वर्ग कि.मि. | वडाहरू: ८</p>
    </div>
  `);

  // Project markers layer
  const projectLayer = L.layerGroup();
  PROJECTS.forEach(p => {
    const color = p.status === 'completed' ? '#10B981' : p.status === 'ongoing' ? '#F59E0B' : '#3B82F6';
    const marker = L.circleMarker([p.lat, p.lng], {
      radius: 8,
      fillColor: color,
      color: '#fff',
      weight: 2,
      fillOpacity: 0.9,
    });
    marker.bindPopup(`
      <div class="p5-popup">
        <h6>${p.name}</h6>
        <div style="font-size:0.72rem; color:#60A5FA; font-family:monospace;">${p.id}</div>
        <div style="font-size:0.82rem; margin-top:8px;">
          <div>वडा: ${p.ward} | बजेट: ${p.budget}</div>
          <div>प्रगति: ${p.progress}% | ${statusLabel(p.status)}</div>
        </div>
      </div>
    `);
    projectLayer.addLayer(marker);
  });
  projectLayer.addTo(mainMap);
  mapLayers.projects = projectLayer;

  // Tourism markers layer
  const tourismLayer = L.layerGroup();
  TOURISM_PLACES.forEach(t => {
    const icon = L.divIcon({
      html: `<div style="background:#E65100; color:white; width:28px; height:28px; border-radius:50% 50% 50% 0; transform:rotate(-45deg); display:flex; align-items:center; justify-content:center; font-size:12px; box-shadow:0 2px 8px rgba(0,0,0,0.4)"><span style="transform:rotate(45deg)">${t.icon}</span></div>`,
      className: '',
      iconSize: [28, 28],
      iconAnchor: [14, 28],
    });
    const marker = L.marker([t.lat, t.lng], { icon });
    marker.bindPopup(`
      <div class="p5-popup">
        <h6>${t.name}</h6>
        <div style="font-size:0.78rem; color:#FB923C;">${t.type}</div>
        <div style="font-size:0.82rem; margin-top:8px;">वार्षिक पर्यटक: ${t.visitors.toLocaleString()}</div>
      </div>
    `);
    tourismLayer.addLayer(marker);
  });
  tourismLayer.addTo(mainMap);
  mapLayers.tourism = tourismLayer;

  // Disaster zones layer (demo)
  const disasterLayer = L.layerGroup();
  const floodZone = L.polygon([
    [27.920, 85.700], [27.925, 85.720], [27.915, 85.725], [27.910, 85.705]
  ], { color: '#EF4444', fillColor: '#EF4444', fillOpacity: 0.25, weight: 2 });
  floodZone.bindPopup(`<div class="p5-popup"><h6>🌊 बाढी जोखिम क्षेत्र</h6><div style="color:#F87171; font-size:0.8rem;">मध्यम जोखिम — सुन्दरी खोला</div></div>`);
  disasterLayer.addLayer(floodZone);

  const landslideZone = L.polygon([
    [27.990, 85.660], [27.995, 85.680], [27.985, 85.690], [27.978, 85.668]
  ], { color: '#F59E0B', fillColor: '#F59E0B', fillOpacity: 0.25, weight: 2 });
  landslideZone.bindPopup(`<div class="p5-popup"><h6>⛰️ पहिरो जोखिम क्षेत्र</h6><div style="color:#FCD34D; font-size:0.8rem;">उच्च जोखिम — थाङपाल उत्तर</div></div>`);
  disasterLayer.addLayer(landslideZone);
  mapLayers.disaster = disasterLayer;
}

function toggleLayer(name, btn) {
  if (!mainMap || !mapLayers[name]) return;
  btn.classList.toggle('active');
  if (mapLayers[name]._map) {
    mainMap.removeLayer(mapLayers[name]);
  } else {
    mainMap.addLayer(mapLayers[name]);
  }
}

// ── Projects Grid ────────────────────────────────────────────────
function initProjectsGrid() {
  const grid = document.getElementById('projectsGrid');
  if (!grid) return;
  renderProjects(PROJECTS.slice(0, 6));
}

function renderProjects(projects) {
  const grid = document.getElementById('projectsGrid');
  grid.innerHTML = '';
  projects.forEach(p => {
    const col = document.createElement('div');
    col.className = 'col-lg-4 col-md-6 project-item';
    col.dataset.status = p.status;
    col.dataset.ward = p.ward;
    const fillClass = `fill-${p.status}`;
    col.innerHTML = `
      <div class="project-card h-100">
        <div class="pc-header">
          <span class="pc-id">${p.id}</span>
          <span class="pc-status status-${p.status}">${statusLabel(p.status)}</span>
        </div>
        <div class="pc-body">
          <div class="pc-title">${p.name}</div>
          <div class="pc-meta">
            <span class="pc-tag"><i class="bi bi-grid-3x3-gap"></i> वडा ${p.ward}</span>
            <span class="pc-tag"><i class="bi bi-tag"></i> ${p.sector}</span>
          </div>
          <div class="pc-progress">
            <div class="pc-progress-label">
              <span>प्रगति</span><span>${p.progress}%</span>
            </div>
            <div class="pc-bar">
              <div class="pc-bar-fill ${fillClass}" style="width:${p.progress}%"></div>
            </div>
          </div>
        </div>
        <div class="pc-footer">
          <span class="pc-budget"><i class="bi bi-currency-rupee"></i> ${p.budget}</span>
          <span class="pc-ward"><i class="bi bi-geo-alt"></i> वडा ${p.ward}</span>
        </div>
      </div>`;
    grid.appendChild(col);
  });
}

function filterProjects(status, btn) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const filtered = status === 'all' ? PROJECTS : PROJECTS.filter(p => p.status === status);
  renderProjects(filtered.slice(0, 6));
}

function filterByWard(ward) {
  const filtered = ward ? PROJECTS.filter(p => p.ward == ward) : PROJECTS;
  renderProjects(filtered.slice(0, 6));
}

// ── Achievements ─────────────────────────────────────────────────
function initAchievements() {
  const grid = document.getElementById('achievementsGrid');
  if (!grid) return;
  ACHIEVEMENTS.forEach((a, i) => {
    const col = document.createElement('div');
    col.className = 'col-lg-3 col-md-4 col-sm-6';
    col.setAttribute('data-aos', 'fade-up');
    col.setAttribute('data-aos-delay', String(i * 50));
    col.innerHTML = `
      <div class="achievement-card">
        <div class="ach-icon">${a.icon}</div>
        <div class="ach-label">${a.label}</div>
        <div class="ach-comparison">
          <span class="ach-before">${a.before}</span>
          <span class="ach-arrow">→</span>
          <span class="ach-after">${a.after}</span>
        </div>
        <span class="ach-change"><i class="bi bi-arrow-up-right"></i> ${a.change}</span>
      </div>`;
    grid.appendChild(col);
  });
}

// ── Budget Chart ─────────────────────────────────────────────────
function initBudgetChart() {
  const canvas = document.getElementById('budgetChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['२०७९/८०', '२०८०/८१', '२०८१/८२', '२०८२/८३', '२०८३/८४'],
      datasets: [
        {
          label: 'बजेट (करोड)',
          data: [18.2, 21.5, 24.8, 26.3, 28.5],
          backgroundColor: 'rgba(13,71,161,0.8)',
          borderRadius: 6,
        },
        {
          label: 'खर्च (करोड)',
          data: [14.8, 17.9, 19.5, 21.2, 22.4],
          backgroundColor: 'rgba(230,81,0,0.8)',
          borderRadius: 6,
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { labels: { color: 'rgba(255,255,255,0.7)', font: { family: 'Outfit' } } },
      },
      scales: {
        x: { ticks: { color: 'rgba(255,255,255,0.6)' }, grid: { color: 'rgba(255,255,255,0.05)' } },
        y: { ticks: { color: 'rgba(255,255,255,0.6)' }, grid: { color: 'rgba(255,255,255,0.05)' } },
      }
    }
  });
}

// ── Tourism Section ───────────────────────────────────────────────
function initTourismSection() {
  initTourismGrid();
  renderLocationCounts();
}

function initTourismGrid() {
  const grid = document.getElementById('tourismGrid');
  if (!grid) return;
  TOURISM_PLACES.forEach(t => {
    const card = document.createElement('div');
    card.className = 'tourism-place-card';
    card.innerHTML = `
      <div class="tpc-img">${t.icon}</div>
      <div class="tpc-body">
        <div class="tpc-name">${t.name}</div>
        <div class="tpc-type">${t.type}</div>
        <div class="tpc-count"><i class="bi bi-people"></i> ${t.visitors.toLocaleString()} पर्यटक/वर्ष</div>
      </div>`;
    grid.appendChild(card);
  });
}

function renderLocationCounts() {
  const container = document.getElementById('locationCounts');
  if (!container) return;
  const maxV = Math.max(...TOURISM_PLACES.map(t => t.visitors));
  TOURISM_PLACES.forEach(t => {
    const row = document.createElement('div');
    row.className = 'loc-item';
    row.innerHTML = `
      <span class="loc-name">${t.name.substring(0, 10)}...</span>
      <div class="loc-bar"><div class="loc-fill" style="width:${(t.visitors/maxV*100).toFixed(0)}%"></div></div>
      <span class="loc-count">${t.visitors.toLocaleString()}</span>`;
    container.appendChild(row);
  });
}

// ── Visitor Trend Chart ───────────────────────────────────────────
function initVisitorTrendChart() {
  const canvas = document.getElementById('visitorTrendChart');
  if (!canvas) return;
  const months = ['बैशाख','जेष्ठ','आषाढ','श्रावण','भाद्र','आश्विन','कार्तिक','मंसिर','पौष','माघ','फाल्गुण','चैत्र'];
  const data = [650, 420, 280, 190, 210, 780, 1450, 1620, 980, 820, 1200, 1850];
  const ctx = canvas.getContext('2d');
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: months,
      datasets: [{
        label: 'पर्यटक',
        data,
        borderColor: '#E65100',
        backgroundColor: 'rgba(230,81,0,0.15)',
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: '#E65100',
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: 'rgba(255,255,255,0.5)', font: { size: 9 } }, grid: { display: false } },
        y: { ticks: { color: 'rgba(255,255,255,0.5)', font: { size: 9 } }, grid: { color: 'rgba(255,255,255,0.05)' } }
      }
    }
  });
}

// ── Hero Mini Chart ───────────────────────────────────────────────
function initHeroMiniChart() {
  const canvas = document.getElementById('heroMiniChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const data = Array.from({length: 12}, () => Math.floor(Math.random() * 200 + 50));
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: Array(12).fill(''),
      datasets: [{
        data,
        borderColor: '#60A5FA',
        backgroundColor: 'rgba(96,165,250,0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        borderWidth: 2,
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
      scales: { x: { display: false }, y: { display: false } },
      animation: { duration: 1500 }
    }
  });
}

// ── Disaster Map ──────────────────────────────────────────────────
function initDisasterMap() {
  const el = document.getElementById('disasterMap');
  if (!el) return;
  disasterMap = L.map('disasterMap', {
    center: MAP_CENTER,
    zoom: 11,
    zoomControl: false,
    dragging: false,
    scrollWheelZoom: false,
  });
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '',
    subdomains: 'abcd',
  }).addTo(disasterMap);

  // Flood zone
  L.polygon([[27.920,85.700],[27.925,85.720],[27.915,85.725],[27.910,85.705]], {
    color: '#EF4444', fillColor: '#EF4444', fillOpacity: 0.4, weight: 2
  }).addTo(disasterMap).bindTooltip('🌊 बाढी जोखिम - मध्यम');

  // Landslide zone
  L.polygon([[27.990,85.660],[27.995,85.680],[27.985,85.690],[27.978,85.668]], {
    color: '#F59E0B', fillColor: '#F59E0B', fillOpacity: 0.4, weight: 2
  }).addTo(disasterMap).bindTooltip('⛰️ पहिरो जोखिम - उच्च');
}

// ── Open Data ─────────────────────────────────────────────────────
function initOpenData() {
  const grid = document.getElementById('openDataGrid');
  if (!grid) return;
  const icons = ['bi-bar-chart-line', 'bi-pin-map', 'bi-people', 'bi-camera', 'bi-layers', 'bi-file-text'];
  const colors = ['rgba(13,71,161,0.2)', 'rgba(230,81,0,0.2)', 'rgba(16,185,129,0.2)', 'rgba(245,158,11,0.2)', 'rgba(59,130,246,0.2)', 'rgba(239,68,68,0.2)'];
  const iconColors = ['#60A5FA', '#FB923C', '#34D399', '#FCD34D', '#60A5FA', '#F87171'];
  OPEN_DATASETS.forEach((d, i) => {
    const col = document.createElement('div');
    col.className = 'col-lg-4 col-md-6';
    const fmtHtml = d.formats.map(f => `<span class="od-fmt fmt-${f}">${f.toUpperCase()}</span>`).join('');
    col.innerHTML = `
      <div class="opendata-card" onclick="downloadDataset('${d.titleEn}')">
        <div class="od-icon" style="background:${colors[i]}; color:${iconColors[i]}"><i class="bi ${icons[i]}"></i></div>
        <div class="od-body">
          <div class="od-title">${d.title}</div>
          <div class="od-desc">${d.desc}</div>
          <div class="od-formats">${fmtHtml}</div>
        </div>
        <i class="bi bi-download od-download"></i>
      </div>`;
    grid.appendChild(col);
  });
}

function downloadDataset(name) {
  showToast(`"${name}" डेटासेट डाउनलोड सुरु भयो`, 'success');
}

// ── Satisfaction Chart ────────────────────────────────────────────
function initSatisfactionChart() {
  const canvas = document.getElementById('satisfactionChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const categories = ['सडक', 'खानेपानी', 'शिक्षा', 'स्वास्थ्य', 'डिजिटल सेवा'];
  const scores = [3.5, 3.9, 4.1, 3.7, 3.2];
  new Chart(ctx, {
    type: 'radar',
    data: {
      labels: categories,
      datasets: [{
        label: 'सन्तुष्टि',
        data: scores,
        borderColor: '#E65100',
        backgroundColor: 'rgba(230,81,0,0.15)',
        pointBackgroundColor: '#E65100',
        pointRadius: 4,
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        r: {
          min: 0, max: 5,
          ticks: { display: false },
          pointLabels: { color: 'rgba(255,255,255,0.7)', font: { size: 11, family: 'Noto Sans Devanagari' } },
          grid: { color: 'rgba(255,255,255,0.08)' },
          angleLines: { color: 'rgba(255,255,255,0.08)' },
        }
      }
    }
  });
}

// ── Star Rating ───────────────────────────────────────────────────
function initStarRating() {
  const stars = document.querySelectorAll('.star');
  stars.forEach((star, i) => {
    star.addEventListener('click', () => {
      starRatingValue = i + 1;
      stars.forEach((s, j) => s.classList.toggle('active', j <= i));
    });
    star.addEventListener('mouseenter', () => {
      stars.forEach((s, j) => s.style.color = j <= i ? '#FCD34D' : 'rgba(255,255,255,0.2)');
    });
    star.addEventListener('mouseleave', () => {
      stars.forEach((s, j) => s.style.color = j < starRatingValue ? '#F59E0B' : 'rgba(255,255,255,0.2)');
    });
  });
}

// ── Feedback Submit ───────────────────────────────────────────────
function submitFeedback(e) {
  e.preventDefault();
  const ward = document.getElementById('fbWard').value;
  const comment = document.getElementById('fbComment').value;
  if (!ward || !starRatingValue) {
    showToast('कृपया वडा छान्नुस् र मूल्याङ्कन दिनुस्', 'warning');
    return;
  }
  showToast('धन्यवाद! आफ्नो प्रतिक्रिया पठाइयो।', 'success');
  e.target.reset();
  starRatingValue = 0;
  document.querySelectorAll('.star').forEach(s => s.classList.remove('active'));
}
window.submitFeedback = submitFeedback;

// ── AI Assistant ──────────────────────────────────────────────────
function askAI(question) {
  document.getElementById('aiInput').value = question;
  sendAIMessage();
}
window.askAI = askAI;

async function sendAIMessage() {
  if (aiThinking) return;
  const input = document.getElementById('aiInput');
  const question = input.value.trim();
  if (!question) return;

  // Add user message
  addMessage(question, 'user');
  input.value = '';
  aiThinking = true;

  // Typing indicator
  const typingId = addTypingIndicator();

  // Call backend AI endpoint
  try {
    const res = await fetch(`${API_BASE}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: question })
    });
    
    if (res.ok) {
      const data = await res.json();
      addMessage(data.answer, 'bot');
    } else {
      addMessage('माफी चाहन्छु, सर्भरमा समस्या छ। कृपया पछि प्रयास गर्नुहोला।', 'bot');
    }
  } catch (error) {
    console.error('AI Error:', error);
    addMessage('इन्टरनेट जडानमा समस्या देखियो।', 'bot');
  }

  removeTypingIndicator(typingId);
  aiThinking = false;
}
window.sendAIMessage = sendAIMessage;

function generateAIResponse(question) {
  const q = question.toLowerCase();
  for (const [key, answer] of Object.entries(AI_KNOWLEDGE)) {
    if (q.includes(key.toLowerCase()) || key.split(' ').some(k => q.includes(k.toLowerCase()))) {
      return answer;
    }
  }
  // Generic response
  if (q.includes('विद्यालय') || q.includes('school')) {
    return 'पाँचपोखरी थाङपाल गाउँपालिकामा जम्मा १८ वटा विद्यालय छन् — ५ माध्यमिक, ८ निम्नमाध्यमिक र ५ प्राथमिक। कुल विद्यार्थी संख्या ४,२३५ र शिक्षक संख्या १८७ छ। [स्रोत: DEMO शिक्षा डेटा]';
  }
  if (q.includes('योजना') || q.includes('project')) {
    return 'हाल गाउँपालिकामा जम्मा २४७ वटा विकास योजनाहरू छन् — १०५ पूरा, १४२ जारी र ३० योजित। कुल लागत रु. ८.५ करोड। सबैभन्दा बढी सडक क्षेत्रमा (८२ योजना) योजनाहरू छन्। [स्रोत: DEMO परियोजना डेटा]';
  }
  return `"${question}" को बारेमा जानकारी खोज्दैछु... हाल उपलब्ध डेमो डेटामा यो विशेष प्रश्नको जवाफ तयार छैन। कृपया पालिका कार्यालयमा ०११-४२१२३४ मा सम्पर्क गर्नुस् वा info@panchpokhari.gov.np मा इमेल गर्नुस्।\n\n[नोट: यो AI प्रणाली DEMO मोडमा चलिरहेको छ। Gemini API कनेक्ट गरेपछि थप जानकारी उपलब्ध हुनेछ।]`;
}

function addMessage(text, role) {
  const messages = document.getElementById('aiMessages');
  const div = document.createElement('div');
  div.className = `ai-msg ${role}`;
  div.innerHTML = `
    ${role === 'bot' ? '<div class="aim-avatar"><i class="bi bi-stars"></i></div>' : ''}
    <div class="aim-bubble">
      <p>${text.replace(/\n/g, '<br>')}</p>
      ${role === 'bot' ? '<div class="aim-meta">AI सहायक • डेटा-आधारित जवाफ</div>' : ''}
    </div>
    ${role === 'user' ? '<div class="aim-avatar" style="background:var(--p5-blue)"><i class="bi bi-person-fill"></i></div>' : ''}
  `;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

function addTypingIndicator() {
  const messages = document.getElementById('aiMessages');
  const id = 'typing-' + Date.now();
  const div = document.createElement('div');
  div.className = 'ai-msg bot ai-typing';
  div.id = id;
  div.innerHTML = `
    <div class="aim-avatar"><i class="bi bi-stars"></i></div>
    <div class="aim-bubble">
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
    </div>
  `;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
  return id;
}

function removeTypingIndicator(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

// Enter key for AI
document.addEventListener('DOMContentLoaded', () => {
  // Portal Sidebar Toggle
  const sidebarToggleBtn = document.getElementById('mobileSidebarToggle');
  const portalSidebar = document.getElementById('portalSidebar');
  const sidebarOverlay = document.getElementById('sidebarOverlay');

  if (sidebarToggleBtn && portalSidebar && sidebarOverlay) {
    const toggleSidebar = () => {
      portalSidebar.classList.toggle('mobile-open');
      sidebarOverlay.classList.toggle('active');
    };

    sidebarToggleBtn.addEventListener('click', toggleSidebar);
    sidebarOverlay.addEventListener('click', toggleSidebar);

    // Close sidebar when a link is clicked (optional but good for mobile UX)
    const sidebarLinks = portalSidebar.querySelectorAll('.ps-nav a');
    sidebarLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 991) {
          toggleSidebar();
        }
      });
    });
  }

  // Super Admin & Portal View Switching
  const saLinks = document.querySelectorAll('.sa-card-link[data-target], .ps-nav a[data-target]');
  const saViews = document.querySelectorAll('.sa-view');
  
  if (saLinks.length > 0 && saViews.length > 0) {
    saLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Remove active class from all links
        saLinks.forEach(l => l.classList.remove('active'));
        // Add active class to clicked link
        link.classList.add('active');
        
        // Hide all views
        saViews.forEach(v => {
          v.style.display = 'none';
          v.classList.remove('active');
        });
        
        // Show target view
        const targetId = link.getAttribute('data-target');
        const targetView = document.getElementById(targetId);
        if (targetView) {
          targetView.style.display = 'block';
          // Small delay for transition effect if needed
          setTimeout(() => targetView.classList.add('active'), 50);
        }

        // On mobile, close sidebar after clicking
        if (window.innerWidth <= 991 && typeof toggleSidebar === 'function') {
           toggleSidebar();
        }
      });
    });
  }

  // Set Language if available
  const currentLang = localStorage.getItem('lang') || 'ne';

  const aiInput = document.getElementById('aiInput');
  if (aiInput) {
    aiInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') sendAIMessage();
    });
  }
});

// ── Live Updates ──────────────────────────────────────────────────
function startLiveUpdates() {
  let touristCount = 34;
  setInterval(() => {
    // Simulate live visitor updates
    const delta = Math.random() > 0.7 ? 1 : 0;
    touristCount += delta;
    const el = document.getElementById('todayCount');
    const tickerEl = document.getElementById('tickerTourists');
    const liveEl = document.getElementById('liveTourists');
    if (el) el.textContent = touristCount;
    if (tickerEl) tickerEl.textContent = touristCount;
    if (liveEl) liveEl.textContent = touristCount;

    // Simulate sensor fluctuation
    simulateSensors();
  }, 5000);
}

function simulateSensors() {
  const riverVal = (1.0 + Math.random() * 0.5).toFixed(1);
  const rainVal = Math.floor(10 + Math.random() * 8);
  const soilVal = Math.floor(40 + Math.random() * 15);
  const tempVal = Math.floor(10 + Math.random() * 5);

  setText('riverLevel', `${riverVal} m`);
  setText('rainfall', `${rainVal} mm`);
  setText('soilMoisture', `${soilVal}%`);
  setText('temperature', `${tempVal}°C`);

  setWidth('riverFill', (parseFloat(riverVal) / 5 * 100).toFixed(0) + '%');
  setWidth('rainFill', (rainVal / 50 * 100).toFixed(0) + '%');
  setWidth('soilFill', soilVal + '%');
  setWidth('tempFill', ((tempVal + 5) / 40 * 100).toFixed(0) + '%');

  setText('lastUpdate', 'अहिले');
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function setWidth(id, val) {
  const el = document.getElementById(id);
  if (el) el.style.width = val;
}

// ── AOS (Animate on Scroll) ───────────────────────────────────────
function initAOSObserver() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const delay = parseInt(e.target.getAttribute('data-aos-delay') || 0);
        setTimeout(() => e.target.classList.add('aos-animate'), delay);
      }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('[data-aos]').forEach(el => obs.observe(el));
}

// ── Utility ───────────────────────────────────────────────────────
function statusLabel(status) {
  const labels = {
    completed: 'पूरा', ongoing: 'जारी', planned: 'योजित',
    suspended: 'रोकिएको', cancelled: 'रद्द'
  };
  return labels[status] || status;
}

function showToast(message, type = 'info') {
  const colors = { success: '#10B981', warning: '#F59E0B', error: '#EF4444', info: '#3B82F6' };
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed; top: 80px; right: 20px; z-index: 9999;
    background: var(--dark-card); border: 1px solid ${colors[type]};
    border-radius: 12px; padding: 14px 20px; max-width: 320px;
    box-shadow: 0 8px 30px rgba(0,0,0,0.4);
    color: white; font-family: var(--font-nepali); font-size: 0.88rem;
    transform: translateX(100%); transition: transform 0.3s ease;
    display: flex; align-items: center; gap: 10px;
  `;
  toast.innerHTML = `<span style="color:${colors[type]};font-size:1.1rem;">●</span>${message}`;
  document.body.appendChild(toast);
  setTimeout(() => toast.style.transform = 'translateX(0)', 100);
  setTimeout(() => {
    toast.style.transform = 'translateX(150%)';
    setTimeout(() => toast.remove(), 400);
  }, 3500);
}

// ── Language ──────────────────────────────────────────────────────
window.setLang = function(lang) {
  currentLang = lang;
  document.documentElement.lang = lang;
  document.getElementById('btn-ne').classList.toggle('active', lang === 'ne');
  document.getElementById('btn-en').classList.toggle('active', lang === 'en');
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (translations[lang] && translations[lang][key]) {
      el.textContent = translations[lang][key];
    }
  });
};

// ── Scroll to AI ──────────────────────────────────────────────────
window.scrollToAI = function() {
  document.getElementById('ai-assistant').scrollIntoView({ behavior: 'smooth' });
};

// ── Ward Detail ───────────────────────────────────────────────────
window.showWardDetail = function(wardId) {
  const ward = WARDS.find(w => w.id === wardId);
  if (!ward) return;
  showToast(`${ward.name}: जनसंख्या ${ward.population.toLocaleString()} | ${ward.schools} विद्यालय | ${ward.area}`, 'info');
};

// ── Duplicate ticker for seamless loop ────────────────────────────
function duplicateTickerItems() {
  const items = document.getElementById('tickerItems');
  if (!items) return;
  items.innerHTML += items.innerHTML;
}

// ── Map Search ────────────────────────────────────────────────────
const mapSearchInput = document.getElementById('mapSearch');
if (mapSearchInput) {
  mapSearchInput.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase();
    if (q.length < 2) return;
    const found = [...PROJECTS, ...TOURISM_PLACES].find(
      item => (item.name || '').toLowerCase().includes(q) || (item.nameEn || '').toLowerCase().includes(q)
    );
    if (found && found.lat && mainMap) {
      mainMap.flyTo([found.lat, found.lng], 14, { duration: 1.5 });
    }
  });
}

// -------------------------------------------------------------
// USER SETUP API INTEGRATION
// -------------------------------------------------------------
async function fetchUsers() {
  const tbody = document.getElementById('userTableBody');
  if (!tbody) return;
  
  try {
    const users = await window.api.get('/users');
    tbody.innerHTML = '';
    users.forEach(user => {
      const badgeRole = user.role === 'super_admin' ? 'bg-primary' : 'bg-info';
      const badgeStatus = user.isActive ? 'bg-success' : 'bg-danger';
      const statusText = user.isActive ? 'सक्रिय' : 'निष्क्रिय';
      
      tbody.innerHTML += `
        <tr>
          <td>${user.fullName}</td>
          <td>${user.email}</td>
          <td>${user.wardNumber ? 'वडा ' + user.wardNumber : 'पाँचपोखरी थाङपाल'}</td>
          <td><span class="badge ${badgeRole} rounded-pill px-3">${user.role}</span></td>
          <td><span class="badge ${badgeStatus} rounded-pill px-3">${statusText}</span></td>
        </tr>
      `;
    });
  } catch(e) {
    console.error('Failed to fetch users:', e);
  }
}

const userSubmitBtn = document.getElementById('userSubmitBtn');
if (userSubmitBtn) {
  // Try to load initial list when the DOM is ready
  fetchUsers();

  userSubmitBtn.addEventListener('click', async () => {
    const fullName = document.getElementById('userName').value;
    const email = document.getElementById('userEmail').value;
    const roleValue = document.getElementById('userRole').value; // 'Admin', 'Editor', 'Viewer'
    
    // Map UI role to enum
    let role = 'public';
    if(roleValue === 'Admin') role = 'super_admin';
    if(roleValue === 'Editor') role = 'ward_officer';
    if(roleValue === 'Viewer') role = 'cao';

    try {
      userSubmitBtn.disabled = true;
      userSubmitBtn.innerText = 'थप्दैछ...';
      
      await window.api.post('/users', {
        fullName,
        email,
        password: 'Password123!', // Default password for new users
        role,
        isActive: true,
        emailVerified: true
      });
      
      // Reset form & Refresh Table
      document.getElementById('userForm').reset();
      fetchUsers();
      alert('प्रयोगकर्ता सफलतापूर्वक थपियो! (User added successfully)');
    } catch(error) {
      alert('त्रुटि: ' + error.message);
    } finally {
      userSubmitBtn.disabled = false;
      userSubmitBtn.innerText = 'प्रयोगकर्ता थप्नुहोस्';
    }
  });
}

