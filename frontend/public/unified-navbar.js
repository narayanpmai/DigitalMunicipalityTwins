/**
 * ═══════════════════════════════════════════════════════════════════════════
 * P5 MUNICIPAL DIGITAL TWINS — MASTER SHELL (2026 SaaS + Nepal Gov Edition)
 * पाँचपोखरी थाङपाल गाउँपालिका (Panchpokhari Thangpal Rural Municipality)
 * ═══════════════════════════════════════════════════════════════════════════
 * Features:
 *   • 2026 Modern SaaS + Local Government Header & Collapsible Sidebar
 *   • Dynamic Breadcrumbs, Nepali BS Date, Fiscal Year Selector (२०८१/८२)
 *   • Global Quick Search Modal (Ctrl + K) with instant page navigation
 *   • Notification Badges, Collapsible Mode (270px <-> 64px) with Tooltips
 *   • Language Switcher (नेपाली / English), Instant Theme Mode Toggle
 *   • Total eradication of old legacy navbars & sidebars sitewide
 *   • Responsive Desktop, Tablet, Mobile (360px - 1920px) with Zero Overflow
 * ═══════════════════════════════════════════════════════════════════════════
 */

(function () {
  'use strict';

  /* ── THEME PALETTES ─────────────────────────────────────────────────── */
  const THEMES = {
    'p5-theme-light':  { label: 'उज्यालो (Light)', icon: '☀️', accent: '#0F4C81', bg: '#F8FAFC', surface: '#FFFFFF', nav: '#FFFFFF', text: '#0F172A' },
    'p5-theme-dark':   { label: 'डार्क (Dark)',     icon: '🌙', accent: '#38BDF8', bg: '#0B0F19', surface: '#111827', nav: '#0B0F19', text: '#F8FAFC' },
    'p5-theme-nature': { label: 'हरियाली (Nature)',icon: '🌿', accent: '#10B981', bg: '#052E16', surface: '#064E3B', nav: '#03200F', text: '#ECFDF5' },
    'p5-theme-nepal':  { label: 'नेपाल (Nepal)',   icon: '🇳🇵', accent: '#E65100', bg: '#450A0A', surface: '#7F1D1D', nav: '#2E0707', text: '#FFF1F2' },
    'p5-theme-ocean':  { label: 'समुद्री (Ocean)',  icon: '🌊', accent: '#0EA5E9', bg: '#082F49', surface: '#0C4A6E', nav: '#051F31', text: '#F0F9FF' },
  };

  /* ── MENU GROUPS & NAVIGATION DATA ──────────────────────────────────── */
  const MENU_GROUPS = [
    {
      id: 'core', label: 'मुख्य ड्यासबोर्ड', icon: 'bi-grid-1x2',
      items: [
        { href: '/index.html',        icon: 'bi-house-door',   label: 'पोर्टल गृहपृष्ठ',      key: 'index' },
        { href: '/app.html',          icon: 'bi-speedometer2', label: 'डिजिटल ट्विन ड्यासबोर्ड', key: 'app', badge: 'Live' },
      ]
    },
    {
      id: 'about', label: 'हाम्रो बारेमा', icon: 'bi-building',
      items: [
        { href: '/profile.html',      icon: 'bi-bank',          label: 'पालिकाको परिचय',      key: 'profile' },
        { href: '/geography.html',    icon: 'bi-geo-alt',       label: 'भौगोलिक अवस्था',      key: 'geography' },
        { href: '/demographics.html', icon: 'bi-people',        label: 'जनसांख्यिक तथ्याङ्क', key: 'demographics', badge: '८ वडा' },
        { href: '/culture-info.html', icon: 'bi-stars',         label: 'संस्कृति र सम्पदा',  key: 'culture-info' },
        { href: '/admin-info.html',   icon: 'bi-person-badge',  label: 'प्रशासनिक संरचना',    key: 'admin-info' },
      ]
    },
    {
      id: 'sectors', label: 'विषयगत क्षेत्रहरू', icon: 'bi-diagram-3',
      items: [
        { href: '/economic-dev.html',          icon: 'bi-graph-up-arrow',     label: 'आर्थिक विकास',           key: 'economic-dev' },
        { href: '/agriculture.html',           icon: 'bi-tree',               label: 'कृषि तथा पशुपन्छी',       key: 'agriculture' },
        { href: '/education.html',             icon: 'bi-book',               label: 'शिक्षा प्रणाली',           key: 'education' },
        { href: '/health.html',                icon: 'bi-heart-pulse',        label: 'स्वास्थ्य सेवा',           key: 'health' },
        { href: '/tourism.html',               icon: 'bi-signpost-split',     label: 'पर्यटन विकास',            key: 'tourism' },
        { href: '/projects.html',              icon: 'bi-cone-striped',       label: 'विकास योजनाहरू',           key: 'projects', badge: '१२' },
        { href: '/disaster.html',              icon: 'bi-shield-exclamation', label: 'विपद् व्यवस्थापन',        key: 'disaster' },
        { href: '/social-dev.html',            icon: 'bi-gender-ambiguous',   label: 'सामाजिक समावेशीकरण',     key: 'social-dev' },
        { href: '/women-children-senior.html', icon: 'bi-person-hearts',      label: 'महिला तथा बालबालिका',     key: 'women-children' },
        { href: '/library.html',               icon: 'bi-book-half',          label: 'डिजिटल पुस्तकालय',        key: 'library' },
        { href: '/museum.html',                icon: 'bi-bank2',              label: 'सांस्कृतिक सङ्ग्रहालय',  key: 'museum' },
        { href: '/organizations.html',         icon: 'bi-buildings',          label: 'संघ-संस्थाहरू',           key: 'organizations' },
        { href: '/livestock.html',             icon: 'bi-egg',                label: 'पशुपन्छी विकास',          key: 'livestock' },
        { href: '/camera.html',                icon: 'bi-camera-video',       label: 'प्रत्यक्ष क्यामरा/GIS',  key: 'camera' },
      ]
    },
    {
      id: 'citizen', label: 'नागरिक सेवा', icon: 'bi-card-checklist',
      items: [
        { href: '/citizen-services.html',       icon: 'bi-card-checklist',        label: 'डिजिटल नागरिक वडापत्र',    key: 'citizen-services', badge: '२४' },
        { href: '/business-registration.html',  icon: 'bi-shop',                  label: 'व्यवसाय दर्ता तथा नविकरण', key: 'business-registration', badge: 'नयाँ' },
        { href: '/project-agreement.html',      icon: 'bi-file-earmark-check',     label: 'योजना सम्झौता पोर्टल',    key: 'project-agreement' },
        { href: '/darta-chalani.html',          icon: 'bi-envelope-paper',         label: 'कागजात दर्ता चलानी',      key: 'darta-chalani' },
        { href: '/admin.html#dartaChalaniPanel', icon: 'bi-envelope-paper-fill', label: 'डिजिटल दर्ता चलानी (प्रशासन)', key: 'admin-darta-chalani', badge: 'दर्ता' },
        { href: '/admin.html#socialSecurityPanel', icon: 'bi-shield-heart', label: 'सामाजिक सुरक्षा भत्ता (SSIS)', key: 'social-security', badge: 'SSIS' },
        { href: '/admin.html#employmentPanel', icon: 'bi-person-workspace', label: 'रोजगार केन्द्र तथा श्रम बैंक (ESC)', key: 'employment-esc', badge: 'PMEP' },
        { href: '/admin.html#agriculturePanel', icon: 'bi-flower1', label: 'किसान लगत, ५०% अनुदान र माटो कार्ड', key: 'agri-farmer', badge: 'कृषि' },
        { href: '/admin.html#disasterPanel', icon: 'bi-shield-exclamation', label: 'विपद् व्यवस्थापन केन्द्र (DMIS)', key: 'dmis', badge: 'DMIS' },
        { href: '/admin.html#revenuePanel',     icon: 'bi-cash-coin',              label: 'स्थानीय कर तथा राजस्व (e-Tax)', key: 'e-tax', badge: 'e-Tax' },
        { href: '/admin.html#procurementPanel', icon: 'bi-file-earmark-spreadsheet', label: 'ई-बोलपत्र तथा खरिद (e-Procurement)', key: 'e-procurement' },
        { href: '/admin.html#buildingPermitPanel', icon: 'bi-building-add',        label: 'घर-नक्सा पास प्रणाली (e-BPS)', key: 'e-bps', badge: 'e-BPS' },
        { href: '/admin.html#assetsPanel',      icon: 'bi-box-seam',              label: 'जिन्सी तथा सम्पत्ति (PAMS)', key: 'pams' },
        { href: '/admin.html#vitalEventsPanel', icon: 'bi-heart-pulse',           label: 'व्यक्तिगत घटना दर्ता',   key: 'vital-events' },
        { href: '/admin.html#judicialPanel',    icon: 'bi-shield-check',          label: 'न्यायिक समिति इजलास',    key: 'judicial' },
        { href: '/complaints.html',             icon: 'bi-chat-left-text',         label: 'गुनासो तथा उजुरी',         key: 'complaints', badge: '३' },
        { href: '/public-report.html',          icon: 'bi-file-earmark-easel-fill', label: '१० वर्षे प्रगति प्रतिवेदन (One Pager)', key: 'public-report', badge: '१० वर्षे' },
        { href: '/annual-report.html',          icon: 'bi-file-earmark-bar-graph', label: 'वार्षिक प्रगति प्रतिवेदन', key: 'annual-report' },
        { href: '/opendata.html',               icon: 'bi-database',               label: 'खुला तथ्याङ्क',            key: 'opendata' },
        { href: '/mted.html',                   icon: 'bi-cash-coin',              label: 'मध्यमकालीन खर्च (MTED)',  key: 'mted' },
        { href: '/good-practices.html',         icon: 'bi-award',                  label: 'असल अभ्यासहरू',            key: 'good-practices' },
        { href: '/ai.html',                     icon: 'bi-robot',                  label: 'AI पालिका सहायक',          key: 'ai', badge: 'AI' },
      ]
    },
    {
      id: 'governance', label: 'प्रशासनिक प्रणाली', icon: 'bi-shield-lock',
      items: [
        { href: '/login.html', icon: 'bi-lock-fill', label: 'कर्मचारी लगइन', key: 'login' },
        { href: '/admin.html#dartaChalaniPanel', icon: 'bi-envelope-paper-fill', label: 'दर्ता तथा चलानी किताब', key: 'admin-darta' },
        { href: '/admin.html#socialSecurityPanel', icon: 'bi-shield-heart-fill', label: 'सामाजिक सुरक्षा भत्ता (SSIS)', key: 'admin-ssis' },
        { href: '/admin.html#employmentPanel', icon: 'bi-person-workspace', label: 'रोजगार सेवा केन्द्र (PMEP)', key: 'admin-pmep' },
        { href: '/admin.html#agriculturePanel', icon: 'bi-flower1', label: 'कृषि अनुदान तथा माटो कार्ड', key: 'admin-agri' },
        { href: '/admin.html#disasterPanel', icon: 'bi-shield-exclamation', label: 'विपद् आपतकालीन केन्द्र (DMIS)', key: 'admin-dmis' },
      ]
    }
  ];

  /* ── BREADCRUMB MAPPING ─────────────────────────────────────────────── */
  const BREADCRUMB_MAP = {
    'index':                   ['गृहपृष्ठ'],
    'demographics':            ['गृहपृष्ठ', 'हाम्रो बारेमा', 'जनसांख्यिक तथ्याङ्क'],
    'profile':                 ['गृहपृष्ठ', 'हाम्रो बारेमा', 'पालिकाको परिचय'],
    'geography':               ['गृहपृष्ठ', 'हाम्रो बारेमा', 'भौगोलिक अवस्था'],
    'culture-info':            ['गृहपृष्ठ', 'हाम्रो बारेमा', 'संस्कृति र सम्पदा'],
    'admin-info':              ['गृहपृष्ठ', 'हाम्रो बारेमा', 'प्रशासनिक संरचना'],
    'economic-dev':            ['गृहपृष्ठ', 'विषयगत क्षेत्र', 'आर्थिक विकास'],
    'agriculture':             ['गृहपृष्ठ', 'विषयगत क्षेत्र', 'कृषि तथा पशुपन्छी'],
    'education':               ['गृहपृष्ठ', 'विषयगत क्षेत्र', 'शिक्षा प्रणाली'],
    'health':                  ['गृहपृष्ठ', 'विषयगत क्षेत्र', 'स्वास्थ्य सेवा'],
    'tourism':                 ['गृहपृष्ठ', 'विषयगत क्षेत्र', 'पर्यटन विकास'],
    'projects':                ['गृहपृष्ठ', 'विषयगत क्षेत्र', 'विकास योजनाहरू'],
    'disaster':                ['गृहपृष्ठ', 'विषयगत क्षेत्र', 'विपद् व्यवस्थापन'],
    'citizen-services':        ['गृहपृष्ठ', 'नागरिक सेवा', 'नागरिक वडापत्र'],
    'complaints':              ['गृहपृष्ठ', 'नागरिक सेवा', 'गुनासो तथा उजुरी'],
    'opendata':                ['गृहपृष्ठ', 'नागरिक सेवा', 'खुला तथ्याङ्क'],
    'public-report':           ['गृहपृष्ठ', 'नागरिक सेवा', '१० वर्षे प्रगति प्रतिवेदन (One Pager)'],
    'one-pager':               ['गृहपृष्ठ', 'नागरिक सेवा', '१० वर्षे प्रगति प्रतिवेदन (One Pager)'],
    'annual-report':           ['गृहपृष्ठ', 'नागरिक सेवा', 'वार्षिक प्रतिवेदन'],
    'ai':                      ['गृहपृष्ठ', 'नागरिक सेवा', 'AI डिजिटल सहायक'],
    'app':                     ['ड्यासबोर्ड', 'प्रशासन', 'डिजिटल ट्विन'],
    'login':                   ['प्रशासन', 'सुरक्षित लगइन']
  };

  function getActiveKey() {
    const path = window.location.pathname.toLowerCase().replace(/^\//, '').replace(/\.html$/, '');
    if (!path || path === '') return 'index';
    return path;
  }

  function getCurrentTheme() {
    return localStorage.getItem('p5_public_theme') || 'p5-theme-light';
  }

  function applyTheme(themeKey) {
    const theme = THEMES[themeKey] || THEMES['p5-theme-light'];
    Object.keys(THEMES).forEach(t => document.body.classList.remove(t));
    document.body.classList.add(themeKey);
    localStorage.setItem('p5_public_theme', themeKey);

    // Update root tokens dynamically
    document.documentElement.style.setProperty('--gov-primary', theme.accent);
    document.documentElement.style.setProperty('--gov-bg', theme.bg);
    document.documentElement.style.setProperty('--gov-surface', theme.surface);

    document.querySelectorAll('.p5-theme-dot').forEach(dot => {
      dot.classList.toggle('active', dot.dataset.theme === themeKey);
    });

    const themeToggleIcon = document.getElementById('p5ThemeToggleIcon');
    if (themeToggleIcon) {
      themeToggleIcon.className = themeKey === 'p5-theme-dark' ? 'bi bi-sun-fill' : 'bi bi-moon-stars-fill';
    }
  }

  /* ── INJECT MASTER SHELL STYLES ─────────────────────────────────────── */
  function injectShellStyles() {
    if (document.getElementById('p5-master-shell-styles')) return;
    const style = document.createElement('style');
    style.id = 'p5-master-shell-styles';
    style.textContent = `
      :root {
        --p5-shell-header-h: 64px;
        --p5-shell-sidebar-w: 270px;
        --p5-shell-sidebar-coll: 64px;
      }

      /* ── TOP HEADER BAR ── */
      #p5UnifiedNav {
        position: fixed !important; top: 0; left: 0; right: 0;
        height: var(--p5-shell-header-h) !important;
        background: #ffffff !important;
        border-bottom: 1px solid #e2e8f0 !important;
        z-index: 1060 !important;
        display: flex !important; align-items: center !important; justify-content: space-between !important;
        padding: 0 1.25rem !important;
        box-shadow: 0 1px 3px rgba(15,23,42,0.05) !important;
        transition: background 0.25s ease, border-color 0.25s ease !important;
      }

      body.p5-theme-dark #p5UnifiedNav {
        background: #0b0f19 !important;
        border-bottom-color: rgba(255,255,255,0.08) !important;
        box-shadow: 0 1px 4px rgba(0,0,0,0.3) !important;
      }

      /* Header Left (Toggle + Brand + Breadcrumb) */
      .p5-hdr-left {
        display: flex; align-items: center; gap: 14px; min-width: 0;
      }

      .p5-sidebar-toggle-btn {
        width: 38px; height: 38px; border-radius: 8px;
        background: transparent; border: 1px solid #e2e8f0;
        color: #0f172a; display: flex; align-items: center; justify-content: center;
        cursor: pointer; transition: all 0.2s; font-size: 1.15rem; flex-shrink: 0;
      }
      .p5-sidebar-toggle-btn:hover {
        background: #f1f5f9; border-color: #cbd5e1;
      }
      body.p5-theme-dark .p5-sidebar-toggle-btn {
        border-color: rgba(255,255,255,0.12); color: #f8fafc;
      }
      body.p5-theme-dark .p5-sidebar-toggle-btn:hover {
        background: #1e293b;
      }

      .p5-hdr-brand {
        display: flex; align-items: center; gap: 10px; text-decoration: none !important;
      }
      .p5-hdr-logo {
        width: 38px; height: 38px; border-radius: 9px;
        background: linear-gradient(135deg, #0f4c81 0%, #e65100 100%);
        color: #ffffff; font-weight: 800; font-size: 0.95rem;
        display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        box-shadow: 0 2px 6px rgba(15,76,129,0.3);
      }
      .p5-hdr-title {
        display: flex; flex-direction: column; line-height: 1.2;
      }
      .p5-hdr-title .gov-name {
        font-size: 0.96rem; font-weight: 700; color: #0f172a; white-space: nowrap;
      }
      body.p5-theme-dark .p5-hdr-title .gov-name { color: #f8fafc; }
      .p5-hdr-title .sub-name {
        font-size: 0.72rem; color: #64748b; white-space: nowrap; font-weight: 500;
      }

      /* Header Breadcrumbs */
      .p5-hdr-breadcrumbs {
        display: flex; align-items: center; gap: 6px; margin-left: 12px;
        padding-left: 16px; border-left: 1px solid #e2e8f0;
        font-size: 0.82rem; color: #64748b;
      }
      body.p5-theme-dark .p5-hdr-breadcrumbs { border-left-color: rgba(255,255,255,0.1); color: #94a3b8; }
      .p5-hdr-breadcrumbs span.active { color: #0f4c81; font-weight: 600; }
      body.p5-theme-dark .p5-hdr-breadcrumbs span.active { color: #38bdf8; }
      @media(max-width: 991px) { .p5-hdr-breadcrumbs { display: none; } }

      /* Header Right (Search, Date, Fiscal Year, Lang, Theme, Login) */
      .p5-hdr-right {
        display: flex; align-items: center; gap: 10px; flex-shrink: 0;
      }

      .p5-hdr-chip {
        display: inline-flex; align-items: center; gap: 5px;
        padding: 4px 10px; border-radius: 999px;
        background: #f1f5f9; color: #334155; font-size: 0.76rem; font-weight: 600;
        border: 1px solid #e2e8f0; white-space: nowrap;
      }
      body.p5-theme-dark .p5-hdr-chip {
        background: #1e293b; color: #cbd5e1; border-color: rgba(255,255,255,0.08);
      }
      @media(max-width: 820px) { .p5-hdr-chip { display: none; } }

      .p5-hdr-search-btn {
        display: flex; align-items: center; gap: 8px;
        padding: 6px 12px; border-radius: 8px;
        background: #f8fafc; border: 1px solid #e2e8f0;
        color: #64748b; font-size: 0.82rem; cursor: pointer;
        transition: all 0.2s;
      }
      .p5-hdr-search-btn:hover { background: #f1f5f9; border-color: #cbd5e1; color: #0f172a; }
      body.p5-theme-dark .p5-hdr-search-btn {
        background: #1e293b; border-color: rgba(255,255,255,0.1); color: #94a3b8;
      }
      body.p5-theme-dark .p5-hdr-search-btn:hover { color: #f8fafc; border-color: #38bdf8; }
      .p5-kbd {
        padding: 1px 5px; border-radius: 4px; font-size: 0.7rem;
        background: #e2e8f0; color: #475569; font-family: monospace; font-weight: 600;
      }
      body.p5-theme-dark .p5-kbd { background: #334155; color: #cbd5e1; }
      @media(max-width: 600px) { .p5-hdr-search-btn span { display: none; } }

      .p5-hdr-action-btn {
        width: 36px; height: 36px; border-radius: 8px;
        border: 1px solid #e2e8f0; background: transparent;
        color: #334155; display: flex; align-items: center; justify-content: center;
        cursor: pointer; transition: all 0.2s; font-size: 1rem; position: relative;
      }
      .p5-hdr-action-btn:hover { background: #f1f5f9; color: #0f172a; }
      body.p5-theme-dark .p5-hdr-action-btn { border-color: rgba(255,255,255,0.1); color: #cbd5e1; }
      body.p5-theme-dark .p5-hdr-action-btn:hover { background: #1e293b; color: #f8fafc; }

      .p5-notif-badge {
        position: absolute; top: -3px; right: -3px;
        width: 17px; height: 17px; border-radius: 50%;
        background: #ef4444; color: #fff; font-size: 0.65rem; font-weight: 700;
        display: flex; align-items: center; justify-content: center;
        border: 2px solid #fff;
      }
      body.p5-theme-dark .p5-notif-badge { border-color: #0b0f19; }

      .p5-login-btn {
        display: inline-flex; align-items: center; gap: 6px;
        padding: 6px 14px; border-radius: 8px;
        background: #0f4c81; color: #ffffff !important;
        font-weight: 600; font-size: 0.82rem; text-decoration: none !important;
        box-shadow: 0 1px 3px rgba(15,76,129,0.3); transition: all 0.2s;
      }
      .p5-login-btn:hover { background: #0a3660; transform: translateY(-1px); }
      body.p5-theme-dark .p5-login-btn {
        background: #0284c7; box-shadow: 0 1px 3px rgba(2,132,199,0.4);
      }
      body.p5-theme-dark .p5-login-btn:hover { background: #0369a1; }

      /* Authenticated User Header Pill */
      .p5-user-pill-wrap {
        display: inline-flex; align-items: center; gap: 6px;
      }
      .p5-user-pill {
        display: inline-flex; align-items: center; gap: 7px;
        padding: 4px 10px; border-radius: 999px;
        background: #f0fdf4; border: 1px solid #bbf7d0;
        color: #166534 !important; text-decoration: none !important;
        font-size: 0.8rem; font-weight: 600; transition: all 0.2s;
      }
      .p5-user-pill:hover {
        background: #dcfce7; border-color: #86efac; transform: translateY(-1px);
        box-shadow: 0 2px 6px rgba(22,101,52,0.15);
      }
      body.p5-theme-dark .p5-user-pill {
        background: rgba(34, 197, 94, 0.12); border-color: rgba(34, 197, 94, 0.3);
        color: #86efac !important;
      }
      .p5-user-avatar {
        width: 24px; height: 24px; border-radius: 50%;
        background: #16a34a; color: #ffffff;
        display: flex; align-items: center; justify-content: center;
        font-size: 0.72rem; flex-shrink: 0;
      }
      .p5-user-meta {
        display: flex; flex-direction: column; line-height: 1.1; text-align: left;
      }
      .p5-user-name {
        font-size: 0.78rem; font-weight: 700; max-width: 110px;
        overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
      }
      .p5-user-role {
        font-size: 0.65rem; color: #15803d; font-weight: 500;
      }
      body.p5-theme-dark .p5-user-role { color: #4ade80; }
      .p5-dashboard-chip {
        display: inline-flex; align-items: center; gap: 2px;
        padding: 2px 7px; border-radius: 999px;
        background: #16a34a; color: #ffffff;
        font-size: 0.68rem; font-weight: 700;
      }
      .p5-quick-logout-btn {
        height: 32px; border-radius: 8px;
        padding: 4px 10px;
        border: 1px solid #fecaca; background: #fef2f2;
        color: #dc2626; display: inline-flex; align-items: center; justify-content: center; gap: 4px;
        cursor: pointer; font-size: 0.82rem; font-weight: 700; transition: all 0.2s;
      }
      .p5-quick-logout-btn:hover {
        background: #fee2e2; border-color: #f87171; color: #b91c1c; transform: translateY(-1px);
        box-shadow: 0 2px 6px rgba(220,38,38,0.2);
      }
      body.p5-theme-dark .p5-quick-logout-btn {
        background: rgba(239, 68, 68, 0.15); border-color: rgba(239, 68, 68, 0.3); color: #fca5a5;
      }
      @media (max-width: 680px) {
        .p5-user-meta { display: none; }
      }

      /* ── COLLAPSIBLE LEFT SIDEBAR ── */
      #p5PublicSidebar {
        position: fixed !important; top: var(--p5-shell-header-h) !important; left: 0 !important;
        width: var(--p5-shell-sidebar-w) !important;
        height: calc(100vh - var(--p5-shell-header-h)) !important;
        background: #ffffff !important;
        border-right: 1px solid #e2e8f0 !important;
        z-index: 1040 !important;
        display: flex !important; flex-direction: column !important;
        transition: width 0.28s cubic-bezier(0.4,0,0.2,1), transform 0.28s cubic-bezier(0.4,0,0.2,1), background 0.25s !important;
        overflow: hidden !important;
        box-shadow: 1px 0 3px rgba(15,23,42,0.03) !important;
      }

      body.p5-theme-dark #p5PublicSidebar {
        background: #0b0f19 !important;
        border-right-color: rgba(255,255,255,0.08) !important;
      }

      #p5PublicSidebar.collapsed {
        width: var(--p5-shell-sidebar-coll) !important;
      }

      @media (max-width: 991px) {
        #p5PublicSidebar {
          transform: translateX(-100%) !important;
          width: var(--p5-shell-sidebar-w) !important;
          box-shadow: 4px 0 24px rgba(0,0,0,0.25) !important;
        }
        #p5PublicSidebar.mobile-open {
          transform: translateX(0) !important;
        }
      }

      #p5SidebarScrollArea {
        flex: 1; overflow-y: auto; overflow-x: hidden;
        padding: 10px 8px;
        scrollbar-width: thin;
      }

      .p5-sb-section-title {
        font-size: 0.70rem; font-weight: 700; color: #94a3b8;
        text-transform: uppercase; letter-spacing: 0.08em;
        padding: 12px 12px 4px; display: flex; align-items: center; gap: 6px;
      }
      #p5PublicSidebar.collapsed .p5-sb-section-title {
        justify-content: center; padding: 12px 0 4px;
      }
      #p5PublicSidebar.collapsed .p5-sb-section-title span { display: none; }

      .p5-sb-link {
        display: flex; align-items: center; gap: 10px;
        padding: 8px 12px; margin: 2px 0; border-radius: 8px;
        color: #334155 !important; font-size: 0.85rem; font-weight: 500;
        text-decoration: none !important; transition: all 0.18s ease;
        position: relative; white-space: nowrap;
      }
      body.p5-theme-dark .p5-sb-link { color: #cbd5e1 !important; }

      .p5-sb-link:hover {
        background: #f1f5f9; color: #0f172a !important;
      }
      body.p5-theme-dark .p5-sb-link:hover {
        background: #1e293b; color: #f8fafc !important;
      }

      .p5-sb-link.active {
        background: #ebf3fa !important;
        color: #0f4c81 !important;
        font-weight: 600;
      }
      body.p5-theme-dark .p5-sb-link.active {
        background: rgba(56,189,248,0.15) !important;
        color: #38bdf8 !important;
      }

      .p5-sb-link i {
        font-size: 1.05rem; width: 22px; text-align: center; flex-shrink: 0;
        color: #64748b; transition: color 0.18s;
      }
      .p5-sb-link:hover i, .p5-sb-link.active i { color: #0f4c81; }
      body.p5-theme-dark .p5-sb-link:hover i, body.p5-theme-dark .p5-sb-link.active i { color: #38bdf8; }

      .p5-sb-label { flex: 1; overflow: hidden; text-overflow: ellipsis; }

      .p5-sb-badge {
        padding: 2px 7px; border-radius: 999px; font-size: 0.68rem; font-weight: 700;
        background: #f1f5f9; color: #475569;
      }
      .p5-sb-link.active .p5-sb-badge { background: #0f4c81; color: #fff; }
      body.p5-theme-dark .p5-sb-badge { background: #334155; color: #cbd5e1; }
      body.p5-theme-dark .p5-sb-link.active .p5-sb-badge { background: #38bdf8; color: #0f172a; }

      /* Collapsed Mode Sidebar Rules */
      #p5PublicSidebar.collapsed .p5-sb-link {
        justify-content: center; padding: 10px 0;
      }
      #p5PublicSidebar.collapsed .p5-sb-label,
      #p5PublicSidebar.collapsed .p5-sb-badge {
        display: none !important;
      }
      #p5PublicSidebar.collapsed .p5-sb-link:hover::after {
        content: attr(data-tooltip);
        position: absolute; left: calc(100% + 10px); top: 50%; transform: translateY(-50%);
        background: #0f172a; color: #f8fafc; padding: 5px 11px; border-radius: 6px;
        font-size: 0.78rem; font-weight: 500; white-space: nowrap; z-index: 9999;
        box-shadow: 0 4px 14px rgba(0,0,0,0.25); pointer-events: none;
      }

      /* Sidebar Footer */
      #p5SidebarFooter {
        padding: 12px 14px; border-top: 1px solid #e2e8f0;
        display: flex; flex-direction: column; gap: 8px; flex-shrink: 0;
        background: #fafafa;
      }
      body.p5-theme-dark #p5SidebarFooter {
        background: #080d16; border-top-color: rgba(255,255,255,0.08);
      }
      #p5PublicSidebar.collapsed #p5SidebarFooter {
        padding: 10px 4px; align-items: center;
      }
      .p5-sf-tollfree {
        display: flex; align-items: center; gap: 8px; font-size: 0.78rem; color: #64748b;
      }
      #p5PublicSidebar.collapsed .p5-sf-tollfree span { display: none; }
      .p5-sf-themes {
        display: flex; align-items: center; gap: 6px; justify-content: space-between;
      }
      #p5PublicSidebar.collapsed .p5-sf-themes { flex-direction: column; gap: 4px; }
      .p5-theme-dot {
        width: 24px; height: 24px; border-radius: 50%; border: 2px solid transparent;
        cursor: pointer; display: flex; align-items: center; justify-content: center;
        font-size: 0.75rem; transition: transform 0.15s; background: rgba(0,0,0,0.04);
      }
      .p5-theme-dot:hover { transform: scale(1.15); }
      .p5-theme-dot.active { border-color: #0f4c81; box-shadow: 0 0 0 2px rgba(15,76,129,0.2); }

      /* ── CONTENT OFFSET (ZERO OVERFLOW) ── */
      body.p5-portal-active .d-flex.w-100 {
        margin-top: var(--p5-shell-header-h) !important;
        margin-left: var(--p5-shell-sidebar-w) !important;
        width: calc(100% - var(--p5-shell-sidebar-w)) !important;
        max-width: calc(100% - var(--p5-shell-sidebar-w)) !important;
        box-sizing: border-box !important;
        transition: margin-left 0.28s cubic-bezier(0.4,0,0.2,1), width 0.28s cubic-bezier(0.4,0,0.2,1) !important;
        flex-wrap: nowrap !important;
      }
      body.p5-portal-active.sidebar-collapsed .d-flex.w-100 {
        margin-left: var(--p5-shell-sidebar-coll) !important;
        width: calc(100% - var(--p5-shell-sidebar-coll)) !important;
        max-width: calc(100% - var(--p5-shell-sidebar-coll)) !important;
      }

      body.p5-portal-active .portal-main {
        margin-top: var(--p5-shell-header-h) !important;
        margin-left: var(--p5-shell-sidebar-w) !important;
        width: calc(100% - var(--p5-shell-sidebar-w)) !important;
        max-width: calc(100% - var(--p5-shell-sidebar-w)) !important;
        box-sizing: border-box !important;
        transition: margin-left 0.28s, width 0.28s !important;
      }
      body.p5-portal-active.sidebar-collapsed .portal-main {
        margin-left: var(--p5-shell-sidebar-coll) !important;
        width: calc(100% - var(--p5-shell-sidebar-coll)) !important;
        max-width: calc(100% - var(--p5-shell-sidebar-coll)) !important;
      }

      body.p5-portal-active > header:not(#p5UnifiedNav),
      body.p5-portal-active > main,
      body.p5-portal-active > section,
      body.p5-portal-active > .main-wrapper {
        margin-top: var(--p5-shell-header-h) !important;
        margin-left: var(--p5-shell-sidebar-w) !important;
        width: calc(100% - var(--p5-shell-sidebar-w)) !important;
        max-width: calc(100% - var(--p5-shell-sidebar-w)) !important;
        box-sizing: border-box !important;
        transition: margin-left 0.28s, width 0.28s !important;
      }
      body.p5-portal-active.sidebar-collapsed > header:not(#p5UnifiedNav),
      body.p5-portal-active.sidebar-collapsed > main,
      body.p5-portal-active.sidebar-collapsed > section,
      body.p5-portal-active.sidebar-collapsed > .main-wrapper {
        margin-left: var(--p5-shell-sidebar-coll) !important;
        width: calc(100% - var(--p5-shell-sidebar-coll)) !important;
        max-width: calc(100% - var(--p5-shell-sidebar-coll)) !important;
      }

      @media (max-width: 991px) {
        body.p5-portal-active .d-flex.w-100,
        body.p5-portal-active .portal-main,
        body.p5-portal-active > header:not(#p5UnifiedNav),
        body.p5-portal-active > main,
        body.p5-portal-active > section,
        body.p5-portal-active > .main-wrapper {
          margin-left: 0 !important;
          width: 100% !important;
          max-width: 100% !important;
        }
      }

      /* ── HIDE LEGACY NAVBARS & SIDEBARS PERMANENTLY ── */
      body.p5-portal-active nav:not(#p5UnifiedNav),
      body.p5-portal-active .navbar:not(#p5UnifiedNav),
      body.p5-portal-active header.p5-navbar,
      body.p5-portal-active .public-sidebar,
      body.p5-portal-active .portal-sidebar,
      body.p5-portal-active #publicSidebar,
      body.p5-portal-active #portalSidebar,
      body.p5-portal-active .sidebar-overlay,
      body.p5-portal-active #sidebarOverlay,
      body.p5-portal-active #publicSidebarOverlay { display: none !important; }

      /* ── SEARCH MODAL (Ctrl + K) ── */
      #p5SearchModal {
        display: none; position: fixed; inset: 0;
        background: rgba(15,23,42,0.6); backdrop-filter: blur(4px);
        z-index: 1080; align-items: flex-start; justify-content: center;
        padding-top: 10vh;
      }
      #p5SearchModal.show { display: flex; }
      .p5-search-dialog {
        background: #ffffff; border-radius: 12px; width: 90%; max-width: 580px;
        box-shadow: 0 20px 40px rgba(0,0,0,0.2); overflow: hidden;
        border: 1px solid #e2e8f0; animation: p5ModalFade 0.2s ease-out;
      }
      body.p5-theme-dark .p5-search-dialog {
        background: #111827; border-color: rgba(255,255,255,0.1);
      }
      @keyframes p5ModalFade {
        from { opacity: 0; transform: scale(0.96); }
        to { opacity: 1; transform: scale(1); }
      }
      .p5-search-input-box {
        display: flex; align-items: center; gap: 12px; padding: 14px 18px;
        border-bottom: 1px solid #e2e8f0;
      }
      body.p5-theme-dark .p5-search-input-box { border-bottom-color: rgba(255,255,255,0.08); }
      .p5-search-input-box input {
        border: none; outline: none; width: 100%; font-size: 1rem;
        background: transparent; color: inherit; font-family: inherit;
      }
      .p5-search-results {
        max-height: 380px; overflow-y: auto; padding: 8px;
      }
      .p5-search-item {
        display: flex; align-items: center; justify-content: space-between;
        padding: 10px 14px; border-radius: 8px; text-decoration: none !important;
        color: #0f172a; transition: background 0.15s;
      }
      body.p5-theme-dark .p5-search-item { color: #f8fafc; }
      .p5-search-item:hover, .p5-search-item.active { background: #f1f5f9; }
      body.p5-theme-dark .p5-search-item:hover { background: #1e293b; }

      /* Mobile Overlay */
      #p5SidebarOverlay {
        display: none; position: fixed; inset: 0;
        background: rgba(15,23,42,0.5); backdrop-filter: blur(2px);
        z-index: 1035;
      }
      #p5SidebarOverlay.show { display: block; }
    `;
    document.head.insertBefore(style, document.head.firstChild);
  }

  /* ── BUILD HEADER HTML ── */
  function buildHeaderHTML() {
    const activeKey = getActiveKey();
    const breadcrumbs = BREADCRUMB_MAP[activeKey] || ['गृहपृष्ठ', 'सेवा'];

    const breadcrumbsHTML = breadcrumbs.map((b, i) => {
      const isLast = i === breadcrumbs.length - 1;
      return `<span class="${isLast ? 'active' : ''}">${b}</span>${!isLast ? '<i class="bi bi-chevron-right" style="font-size:0.65rem;opacity:0.5;"></i>' : ''}`;
    }).join('');

    return `
      <!-- Header Left -->
      <div class="p5-hdr-left">
        <button class="p5-sidebar-toggle-btn" id="p5SidebarToggleBtn" title="मेनु टगल">
          <i class="bi bi-layout-sidebar"></i>
        </button>

        <a class="p5-hdr-brand" href="/index.html">
          <div class="p5-hdr-logo">P5</div>
          <div class="p5-hdr-title">
            <span class="gov-name">पाँचपोखरी थाङपाल गाउँपालिका</span>
            <span class="sub-name">Municipal Digital Twins</span>
          </div>
        </a>

        <div class="p5-hdr-breadcrumbs">
          ${breadcrumbsHTML}
        </div>
      </div>

      <!-- Header Right -->
      <div class="p5-hdr-right">
        <!-- Fiscal Year Chip -->
        <div class="p5-hdr-chip" title="चालू आर्थिक वर्ष">
          <i class="bi bi-calendar3" style="color:var(--gov-primary)"></i>
          <span>आ.व. २०८१/८२</span>
        </div>

        <!-- Nepali Date -->
        <div class="p5-hdr-chip" title="आजको नेपाली मिति">
          <i class="bi bi-clock-history" style="color:var(--gov-secondary)"></i>
          <span>२०८१ भदौ २३</span>
        </div>

        <!-- Quick Search -->
        <button class="p5-hdr-search-btn" id="p5SearchTriggerBtn" title="द्रुत खोजी (Ctrl + K)">
          <i class="bi bi-search"></i>
          <span>खोजी गर्नुहोस्...</span>
          <span class="p5-kbd">⌘K</span>
        </button>

        <!-- Notification Bell -->
        <button class="p5-hdr-action-btn" title="सूचनाहरू" onclick="alert('सूचना प्रणाली: कुनै नयाँ जरुरी विपद् वा सूचना छैन।')">
          <i class="bi bi-bell"></i>
          <span class="p5-notif-badge">३</span>
        </button>

        <!-- Theme Mode Toggle Button (Light <-> Dark) -->
        <button class="p5-hdr-action-btn" id="p5ThemeQuickToggle" title="थिम मोड बदल्नुहोस्">
          <i class="bi bi-moon-stars-fill" id="p5ThemeToggleIcon"></i>
        </button>

        <!-- Portal / Employee Login or Authenticated User State -->
        ${getAuthMarkup()}
      </div>
    `;
  }

  /* ── GET DYNAMIC AUTH MARKUP ── */
  function getAuthMarkup() {
    const token = localStorage.getItem('p5_token');
    if (!token) {
      return `
        <a class="p5-login-btn" href="/login.html" title="कर्मचारी / अधिकारी लगइन">
          <i class="bi bi-shield-lock"></i>
          <span>कर्मचारी लगइन</span>
        </a>
      `;
    }

    let user = {};
    try {
      user = JSON.parse(localStorage.getItem('p5_user') || '{}');
    } catch (e) {
      user = {};
    }

    const name = localStorage.getItem('p5_name') || user.fullName || user.email || 'कर्मचारी';
    const role = (localStorage.getItem('p5_role') || user.role || 'admin').toLowerCase();

    const roleMap = {
      'super_admin': 'सुपर एडमिन',
      'it_admin': 'IT एडमिन',
      'admin': 'प्रशासक',
      'cao': 'प्रमुख प्रशासकीय अधिकृत',
      'ward_user': 'वडा अधिकृत',
      'data_entry': 'डाटा प्रविष्टि',
      'citizen': 'नागरिक'
    };
    const roleLabel = roleMap[role] || 'अधिकृत';
    const isSuperRole = ['super_admin', 'it_admin', 'admin'].includes(role);
    const dashboardUrl = isSuperRole ? '/super-admin.html' : '/app.html';

    return `
      <div class="p5-user-pill-wrap">
        <a href="${dashboardUrl}" class="p5-user-pill" title="प्रशासनिक ड्यासबोर्डमा जानुहोस् (${name})">
          <div class="p5-user-avatar"><i class="bi bi-person-fill"></i></div>
          <div class="p5-user-meta">
            <span class="p5-user-name">${name}</span>
            <span class="p5-user-role">${roleLabel}</span>
          </div>
          <span class="p5-dashboard-chip">ड्यासबोर्ड <i class="bi bi-arrow-right-short"></i></span>
        </a>
        <button type="button" class="p5-quick-logout-btn" id="p5QuickLogoutBtn" onclick="window.p5QuickLogout(event)" title="लगआउट गर्नुहोस् (सार्वजनिक पेजमा फर्कनुहोस्)">
          <i class="bi bi-box-arrow-right"></i>
          <span>लगआउट</span>
        </button>
      </div>
    `;
  }

  /* ── BUILD SIDEBAR HTML ── */
  function buildSidebarHTML() {
    const activeKey = getActiveKey();
    const token = localStorage.getItem('p5_token');
    let user = {};
    try {
      user = JSON.parse(localStorage.getItem('p5_user') || '{}');
    } catch (e) {
      user = {};
    }
    const role = (localStorage.getItem('p5_role') || user.role || 'admin').toLowerCase();
    const isSuperRole = ['super_admin', 'it_admin', 'admin'].includes(role);
    const dashboardUrl = isSuperRole ? '/super-admin.html' : '/app.html';

    let sectionsHTML = '';

    MENU_GROUPS.forEach(group => {
      let itemsHTML = '';
      if (group.id === 'admin') {
        if (token) {
          itemsHTML = `
            <a href="${dashboardUrl}" class="p5-sb-link" data-tooltip="प्रशासनिक ड्यासबोर्ड">
              <i class="bi bi-speedometer2" style="color: #10b981;"></i>
              <span class="p5-sb-label fw-bold" style="color: #10b981;">प्रशासनिक ड्यासबोर्ड ↗</span>
            </a>
            <a href="#" onclick="window.p5QuickLogout(event)" class="p5-sb-link" data-tooltip="लगआउट गर्नुहोस्" style="color: #ef4444;">
              <i class="bi bi-box-arrow-right" style="color: #ef4444;"></i>
              <span class="p5-sb-label fw-bold" style="color: #ef4444;">लगआउट (Logout)</span>
            </a>
          `;
        } else {
          itemsHTML = `
            <a href="/login.html" class="p5-sb-link ${activeKey === 'login' ? 'active' : ''}" data-tooltip="कर्मचारी लगइन">
              <i class="bi bi-lock-fill"></i>
              <span class="p5-sb-label">कर्मचारी लगइन</span>
            </a>
          `;
        }
      } else {
        group.items.forEach(item => {
          const isActive = (activeKey === item.key || activeKey.includes(item.key));
          const badgeHTML = item.badge ? `<span class="p5-sb-badge">${item.badge}</span>` : '';
          itemsHTML += `
            <a href="${item.href}" class="p5-sb-link ${isActive ? 'active' : ''}" data-tooltip="${item.label}">
              <i class="bi ${item.icon}"></i>
              <span class="p5-sb-label">${item.label}</span>
              ${badgeHTML}
            </a>
          `;
        });
      }

      sectionsHTML += `
        <div class="p5-sb-section-title">
          <i class="bi ${group.icon}"></i>
          <span>${group.label}</span>
        </div>
        ${itemsHTML}
      `;
    });

    // Theme Dots HTML
    let themeDots = '';
    Object.entries(THEMES).forEach(([key, t]) => {
      themeDots += `<button class="p5-theme-dot" data-theme="${key}" title="${t.label}" type="button">${t.icon}</button>`;
    });

    return `
      <div id="p5SidebarScrollArea">
        ${sectionsHTML}
      </div>

      <div id="p5SidebarFooter">
        <div class="p5-sf-tollfree">
          <i class="bi bi-telephone-fill" style="color:var(--gov-secondary)"></i>
          <span>निःशुल्क हटलाइन: <strong>1149</strong></span>
        </div>
        <div class="p5-sf-themes">
          ${themeDots}
        </div>
      </div>
    `;
  }

  /* ── SEARCH MODAL HTML ── */
  function buildSearchModalHTML() {
    return `
      <div class="p5-search-dialog" id="p5SearchDialog">
        <div class="p5-search-input-box">
          <i class="bi bi-search fs-5 text-muted"></i>
          <input type="text" id="p5GlobalSearchInput" placeholder="सेवा, वडा, प्रतिवेदन वा योजना खोजी गर्नुहोस्..." autocomplete="off">
          <span class="p5-kbd">ESC</span>
        </div>
        <div class="p5-search-results" id="p5SearchResults">
          <!-- Populated by JS -->
        </div>
      </div>
    `;
  }

  /* ── INITIALIZATION ── */
  function init() {
    injectShellStyles();

    // 1. Clean conflicting inline styles
    document.body.classList.remove('light-theme', 'dark-theme', 'portal-theme');
    document.body.style.removeProperty('padding-top');
    document.body.style.removeProperty('margin-top');

    // 2. Eradicate ALL legacy sidebars & overlays from DOM completely
    document.querySelectorAll('.public-sidebar, .portal-sidebar, #publicSidebar, #portalSidebar, .sidebar-overlay, #sidebarOverlay, #publicSidebarOverlay').forEach(el => {
      if (el && el.id !== 'p5PublicSidebar') el.remove();
    });

    // 3. Setup Header Navbar
    let existingNav = document.getElementById('mainNavbar') || document.querySelector('nav.p5-navbar, nav.navbar');
    if (existingNav) {
      existingNav.id = 'p5UnifiedNav';
      existingNav.removeAttribute('class');
      existingNav.removeAttribute('style');
    } else {
      existingNav = document.createElement('header');
      existingNav.id = 'p5UnifiedNav';
      document.body.insertBefore(existingNav, document.body.firstChild);
    }
    existingNav.innerHTML = buildHeaderHTML();

    // 4. Remove any duplicate navs
    document.querySelectorAll('nav:not(#p5UnifiedNav), .navbar:not(#p5UnifiedNav)').forEach(el => el.remove());

    // 5. Setup Sidebar
    let sidebar = document.getElementById('p5PublicSidebar');
    if (!sidebar) {
      sidebar = document.createElement('aside');
      sidebar.id = 'p5PublicSidebar';
      document.body.insertBefore(sidebar, document.body.firstChild);
    }
    sidebar.innerHTML = buildSidebarHTML();

    // 6. Mobile Overlay
    let overlay = document.getElementById('p5SidebarOverlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'p5SidebarOverlay';
      document.body.appendChild(overlay);
    }

    // 7. Search Modal
    let searchModal = document.getElementById('p5SearchModal');
    if (!searchModal) {
      searchModal = document.createElement('div');
      searchModal.id = 'p5SearchModal';
      searchModal.innerHTML = buildSearchModalHTML();
      document.body.appendChild(searchModal);
    }

    document.body.classList.add('p5-portal-active');

    // 8. Apply Saved Theme
    applyTheme(getCurrentTheme());

    // 9. Restore Collapse state
    const isCollapsed = localStorage.getItem('p5_sidebar_collapsed') === 'true';
    if (isCollapsed && window.innerWidth > 991) {
      sidebar.classList.add('collapsed');
      document.body.classList.add('sidebar-collapsed');
    }

    // 10. Sidebar Toggle Action
    function toggleSidebar() {
      if (window.innerWidth <= 991) {
        const isOpen = sidebar.classList.toggle('mobile-open');
        overlay.classList.toggle('show', isOpen);
        document.body.style.overflow = isOpen ? 'hidden' : '';
      } else {
        const coll = sidebar.classList.toggle('collapsed');
        document.body.classList.toggle('sidebar-collapsed', coll);
        localStorage.setItem('p5_sidebar_collapsed', coll);
      }
    }

    const toggleBtn = document.getElementById('p5SidebarToggleBtn');
    if (toggleBtn) toggleBtn.addEventListener('click', toggleSidebar);

    overlay.addEventListener('click', () => {
      sidebar.classList.remove('mobile-open');
      overlay.classList.remove('show');
      document.body.style.overflow = '';
    });

    // 11. Quick Theme Toggle (Sun/Moon button)
    const quickThemeBtn = document.getElementById('p5ThemeQuickToggle');
    if (quickThemeBtn) {
      quickThemeBtn.addEventListener('click', () => {
        const current = getCurrentTheme();
        const next = current === 'p5-theme-dark' ? 'p5-theme-light' : 'p5-theme-dark';
        applyTheme(next);
      });
    }

    // Theme Dots
    document.querySelectorAll('.p5-theme-dot').forEach(dot => {
      dot.addEventListener('click', () => applyTheme(dot.dataset.theme));
    });

    // Quick Logout Action & Auth listener
    window.p5QuickLogout = function(e) {
      if (e) {
        if (e.preventDefault) e.preventDefault();
        if (e.stopPropagation) e.stopPropagation();
      }
      localStorage.removeItem('p5_token');
      localStorage.removeItem('p5_user');
      localStorage.removeItem('p5_role');
      localStorage.removeItem('p5_email');
      localStorage.removeItem('p5_name');
      localStorage.removeItem('token');
      localStorage.removeItem('access_token');
      localStorage.removeItem('jwt');
      sessionStorage.clear();
      document.cookie = "p5_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      window.location.href = '/index.html';
    };

    const quickLogoutBtn = document.getElementById('p5QuickLogoutBtn');
    if (quickLogoutBtn) {
      quickLogoutBtn.addEventListener('click', window.p5QuickLogout);
    }

    window.addEventListener('storage', (e) => {
      if (e.key === 'p5_token' || e.key === 'p5_user') {
        window.location.reload();
      }
    });

    // 12. Search Modal Logic
    const searchTrigger = document.getElementById('p5SearchTriggerBtn');
    const searchInput = document.getElementById('p5GlobalSearchInput');
    const searchResults = document.getElementById('p5SearchResults');

    function openSearch() {
      searchModal.classList.add('show');
      if (searchInput) {
        searchInput.value = '';
        renderSearchResults('');
        setTimeout(() => searchInput.focus(), 50);
      }
    }

    function closeSearch() {
      searchModal.classList.remove('show');
    }

    if (searchTrigger) searchTrigger.addEventListener('click', openSearch);
    searchModal.addEventListener('click', (e) => {
      if (e.target === searchModal) closeSearch();
    });

    // Keyboard shortcut (Ctrl + K / Cmd + K, and Esc)
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        openSearch();
      }
      if (e.key === 'Escape' && searchModal.classList.contains('show')) {
        closeSearch();
      }
    });

    // Search Items Index
    const searchItems = [];
    MENU_GROUPS.forEach(g => {
      g.items.forEach(it => {
        searchItems.push({ label: it.label, href: it.href, category: g.label, icon: it.icon });
      });
    });

    function renderSearchResults(query) {
      const q = query.trim().toLowerCase();
      const filtered = q === '' ? searchItems.slice(0, 8) : searchItems.filter(item => item.label.toLowerCase().includes(q) || item.category.toLowerCase().includes(q));

      if (filtered.length === 0) {
        searchResults.innerHTML = `<div style="text-align:center;padding:24px;color:#94a3b8;"><i class="bi bi-search fs-3"></i><p class="mt-2 mb-0">‘${query}’ फेला परेन।</p></div>`;
        return;
      }

      searchResults.innerHTML = filtered.map(item => `
        <a href="${item.href}" class="p5-search-item">
          <div style="display:flex;align-items:center;gap:10px;">
            <i class="bi ${item.icon}" style="color:var(--gov-primary);font-size:1.1rem;"></i>
            <span style="font-weight:600;font-size:0.9rem;">${item.label}</span>
          </div>
          <span style="font-size:0.75rem;color:#94a3b8;">${item.category}</span>
        </a>
      `).join('');
    }

    if (searchInput) {
      searchInput.addEventListener('input', (e) => renderSearchResults(e.target.value));
    }

    // Responsive resize handler
    window.addEventListener('resize', () => {
      if (window.innerWidth > 991) {
        sidebar.classList.remove('mobile-open');
        overlay.classList.remove('show');
        document.body.style.overflow = '';
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
