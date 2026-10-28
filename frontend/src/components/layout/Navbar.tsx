import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTenant } from '../../context/TenantContext';
import { useAuth } from '../../context/AuthContext';
import { useFiscalYear } from '../../context/FiscalYearContext';
import {
  Search,
  Bell,
  ExternalLink,
  LogOut,
  HelpCircle,
  ChevronDown,
  Calendar,
  Shield,
  User,
  Building2,
  Briefcase,
  Coins,
  Landmark,
} from 'lucide-react';
import { adToBs } from '../../utils/nepaliCalendar';

// ── Navbar Design Tokens ────────────────────────────────────────────
const N = {
  bg: '#ffffff',
  border: '#e2e8f0',
  text: '#0f172a',
  textMuted: '#64748b',
  primary: '#0284c7',
  primaryLight: '#e0f2fe',
  height: '64px',
};

interface NavbarProps {
  isPublic?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ isPublic = false }) => {
  const { settings, tenantId } = useTenant();
  const { user, logout } = useAuth();
  const { fiscalYears, activeFiscalYear, setActiveFiscalYear } = useFiscalYear();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [portalMenuOpen, setPortalMenuOpen] = useState(false);
  const portalMenuRef = useRef<HTMLDivElement>(null);

  // Palika name
  let tenantPalikaName = settings?.palika_name;
  if (!tenantPalikaName) {
    try {
      const storedTenants = JSON.parse(localStorage.getItem('p5_tenants_list') || '[]');
      const match = storedTenants.find((t: any) => t.id === tenantId || t.code === tenantId);
      if (match && match.name) tenantPalikaName = match.name;
    } catch (e) {}
  }
  const palikaName = tenantPalikaName || 'पाँचपोखरी थाङपाल गाउँपालिका';
  const isGaushalaTenant = tenantId === 'gaushala' || tenantId === 'gaushalamun' || palikaName.includes('गौशाला');
  const isKhadadeviTenant = tenantId === 'khadadevi' || tenantId === 'khandadevi' || palikaName.includes('खाँडादेवी');
  const isBenighatTenant = tenantId === 'benighatrorang' || palikaName.includes('बेनिघाट');
  const isGalchhiTenant = tenantId === 'galchhi' || palikaName.includes('गल्छी');
  const isMelamchiTenant = tenantId === 'melamchi' || palikaName.includes('मेलम्ची');
  const slogan = (settings?.slogan && settings.slogan !== 'आधुनिक, सुशासनयुक्त र समृद्ध पालिका') 
    ? settings.slogan 
    : (isGaushalaTenant 
        ? 'कृषि, उद्योग र समृद्धिको सहर: हाम्रो गौशाला नगर' 
        : (isKhadadeviTenant 
            ? 'सुन्दर, सभ्य र समृद्ध खाँडादेवी !!!' 
            : (isBenighatTenant 
                ? 'कृषि, पर्यटन र पूर्वाधार: समृद्ध बेनीघाट रोराङ्गको आधार' 
                : (isGalchhiTenant
                    ? 'कृषि, पर्यटन र पूर्वाधार: समृद्ध गल्छीको आधार'
                    : (isMelamchiTenant
                        ? 'मेलम्ची नगर समृद्धिको आधार – कृषि, पर्यटन, उद्योग र जलाधार'
                        : (settings?.slogan || 'आधुनिक, सुशासनयुक्त र समृद्ध पालिका'))))));


  // Today's Nepali date
  const todayAD = new Date();
  const todayAdStr = todayAD.toISOString().split('T')[0];
  const nepaliDateStr = (() => {
    try {
      return adToBs(todayAdStr);
    } catch {
      return null;
    }
  })();
  const nepaliParts = nepaliDateStr ? nepaliDateStr.split('-') : null;

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
      if (portalMenuRef.current && !portalMenuRef.current.contains(e.target as Node)) {
        setPortalMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  // Role display
  const roleLabel: Record<string, string> = {
    super_admin: 'सुपर एडमिन',
    admin: 'पालिका एडमिन',
    cao: 'प्रमुख प्रशासकीय',
    planning_officer: 'योजना अधिकृत',
    revenue_officer: 'राजस्व अधिकृत',
    ward_user: 'वडा सचिव',
    it_admin: 'IT अधिकृत',
    disaster_officer: 'विपद् अधिकृत',
  };
  const roleColor: Record<string, string> = {
    super_admin: '#dc2626',
    admin: '#2563eb',
    cao: '#7c3aed',
    it_admin: '#4f46e5',
    ward_user: '#0891b2',
  };

  const userRole = user?.role || 'admin';
  const roleBadgeColor = roleColor[userRole] || '#0284c7';
  const roleBadgeLabel = roleLabel[userRole] || userRole.toUpperCase();

  return (
    <header
      style={{
        height: N.height,
        backgroundColor: N.bg,
        borderBottom: `1px solid ${N.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.25rem',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        gap: '1rem',
      }}
    >
      {/* ── Left: Brand ────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
        {settings?.logo_url ? (
          <img
            src={settings.logo_url}
            alt="Logo"
            style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '8px' }}
          />
        ) : (
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #0d2757, #0284c7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 800,
              fontSize: '0.9rem',
              flexShrink: 0,
              boxShadow: '0 2px 8px rgba(2,132,199,0.35)',
            }}
          >
            P5
          </div>
        )}
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: N.text, lineHeight: 1.2 }}>
            {palikaName}
          </div>
          <div className="dt-hide-on-mobile" style={{ fontSize: '0.7rem', color: N.textMuted, lineHeight: 1.3 }}>
            {slogan}
          </div>
        </div>
      </div>

      {/* ── Center: Search + Date ───────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, maxWidth: '520px' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1 }}>
          <Search
            size={15}
            style={{
              position: 'absolute',
              left: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: N.textMuted,
            }}
          />
          <input
            type="text"
            placeholder="सेवा, संस्था, योजना खोज्नुहोस्..."
            style={{
              width: '100%',
              padding: '0.45rem 0.75rem 0.45rem 2rem',
              border: `1px solid ${N.border}`,
              borderRadius: '8px',
              fontSize: '0.825rem',
              color: N.text,
              backgroundColor: '#f8fafc',
              outline: 'none',
            }}
          />
        </div>

        {/* Nepali Date Badge */}
        {nepaliParts && (
          <div
            className="dt-hide-on-mobile"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '0.35rem 0.75rem',
              backgroundColor: '#f0f9ff',
              border: '1px solid #bae6fd',
              borderRadius: '8px',
              fontSize: '0.775rem',
              color: '#0369a1',
              fontWeight: 600,
              flexShrink: 0,
              whiteSpace: 'nowrap',
            }}
          >
            <Calendar size={13} />
            <span>वि.सं. {nepaliParts[0]}/{nepaliParts[1]}/{nepaliParts[2]}</span>
          </div>
        )}

        {/* Global Fiscal Year (आर्थिक वर्ष) Selector */}
        <div
          className="dt-hide-on-mobile"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '0.2rem 0.5rem 0.2rem 0.65rem',
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '8px',
            fontSize: '0.775rem',
            color: '#15803d',
            fontWeight: 600,
            flexShrink: 0,
            boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
          }}
          title="सक्रिय आर्थिक वर्ष छनोट गर्नुहोस्"
        >
          <Coins size={13} color="#16a34a" />
          <span style={{ whiteSpace: 'nowrap', color: '#166534', fontWeight: 700 }}>आ.व.</span>
          <select
            value={activeFiscalYear}
            onChange={(e) => setActiveFiscalYear(e.target.value)}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: '#15803d',
              fontWeight: 700,
              fontSize: '0.775rem',
              outline: 'none',
              cursor: 'pointer',
              padding: '2px 0',
            }}
          >
            {activeFiscalYear && !fiscalYears.some((f) => f.name === activeFiscalYear) && (
              <option value={activeFiscalYear} style={{ color: '#0f172a', fontWeight: 700 }}>
                {activeFiscalYear} (चालू)
              </option>
            )}
            {fiscalYears.map((fy) => {
              const isCurr = fy.name === activeFiscalYear;
              return (
                <option key={fy.id || fy.name} value={fy.name} style={{ color: '#0f172a', fontWeight: isCurr ? 700 : 500 }}>
                  {fy.name} {isCurr ? '(चालू)' : ''}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* ── Right: Actions ──────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>

        {/* Notification Bell */}
        <button
          style={{
            width: '36px', height: '36px', borderRadius: '8px',
            backgroundColor: 'transparent', border: `1px solid ${N.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: N.textMuted, position: 'relative',
            transition: 'all 0.15s ease',
          }}
          title="सूचनाहरू"
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#f1f5f9'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
        >
          <Bell size={16} />
          {/* Unread dot */}
          <span style={{
            position: 'absolute', top: '6px', right: '6px',
            width: '8px', height: '8px', borderRadius: '50%',
            backgroundColor: '#ef4444', border: '2px solid white',
          }} />
        </button>

        {/* FAQ Help */}
        <Link
          to="/faq-help"
          className="dt-hide-on-mobile"
          style={{
            width: '36px', height: '36px', borderRadius: '8px',
            backgroundColor: 'transparent', border: `1px solid ${N.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: N.textMuted, textDecoration: 'none',
            transition: 'all 0.15s ease',
          }}
          title="मद्दत तथा FAQ"
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#f1f5f9'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
        >
          <HelpCircle size={16} />
        </Link>

        {/* Admin / Public Portal Switcher */}
        {isPublic && (
          <Link
            to="/pwa"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.4rem 0.85rem',
              border: '1.5px solid #38bdf8',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: 800,
              color: '#0369a1',
              textDecoration: 'none',
              transition: 'all 0.15s ease',
              backgroundColor: '#f0f9ff',
            }}
            title="नागरिक मोबाइल एप (PWA: अफलाइन बडापत्र र SOS साइरन)"
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = '#e0f2fe';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = '#f0f9ff';
            }}
          >
            <span>📱</span>
            <span>नागरिक एप (PWA)</span>
          </Link>
        )}
        {/* Integrated Digital Portals Dropdown */}
        {isPublic && (
          <div style={{ position: 'relative' }} ref={portalMenuRef}>
            <button
              onClick={() => setPortalMenuOpen(!portalMenuOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.4rem 0.85rem',
                border: '1.5px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 700,
                color: '#1e293b',
                backgroundColor: portalMenuOpen ? '#f1f5f9' : '#ffffff',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              title="ई-नक्सा, बोलपत्र, राजस्व तथा सहकारी पोर्टलहरू"
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f8fafc';
                e.currentTarget.style.borderColor = '#94a3b8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = portalMenuOpen ? '#f1f5f9' : '#ffffff';
                e.currentTarget.style.borderColor = '#cbd5e1';
              }}
            >
              <Building2 size={14} color="#0284c7" />
              <span>ई-सेवा पोर्टलहरू</span>
              <ChevronDown
                size={14}
                style={{
                  color: '#64748b',
                  transform: portalMenuOpen ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.2s',
                }}
              />
            </button>

            {portalMenuOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  width: '270px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  boxShadow: '0 12px 30px rgba(0,0,0,0.12)',
                  zIndex: 250,
                  padding: '0.45rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.25rem',
                }}
              >
                <Link
                  to="/ebps"
                  onClick={() => setPortalMenuOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    padding: '0.55rem 0.75rem',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    color: '#1e293b',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f0fdf4'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <div style={{ padding: '0.35rem', borderRadius: '6px', backgroundColor: '#e0e7ff', color: '#4338ca' }}>
                    <Building2 size={15} />
                  </div>
                  <div>
                    <div style={{ color: '#0f172a', fontWeight: 700 }}>ई-नक्सा पास (e-BPS)</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>भवन निर्माण अनुमति तथा ड्रइङ</div>
                  </div>
                </Link>

                <Link
                  to="/procurement"
                  onClick={() => setPortalMenuOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    padding: '0.55rem 0.75rem',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    color: '#1e293b',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#eff6ff'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <div style={{ padding: '0.35rem', borderRadius: '6px', backgroundColor: '#dbeafe', color: '#1d4ed8' }}>
                    <Briefcase size={15} />
                  </div>
                  <div>
                    <div style={{ color: '#0f172a', fontWeight: 700 }}>ई-बोलपत्र (e-Tender)</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>सार्वजनिक खरिद तथा ठेक्का</div>
                  </div>
                </Link>

                <Link
                  to="/revenue"
                  onClick={() => setPortalMenuOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    padding: '0.55rem 0.75rem',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    color: '#1e293b',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f0fdfa'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <div style={{ padding: '0.35rem', borderRadius: '6px', backgroundColor: '#ccfbf1', color: '#0f766e' }}>
                    <Coins size={15} />
                  </div>
                  <div>
                    <div style={{ color: '#0f172a', fontWeight: 700 }}>डिजिटल राजस्व (e-Tax)</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>सम्पत्ति, व्यवसाय तथा मालपोत कर</div>
                  </div>
                </Link>

                <Link
                  to="/cooperatives"
                  onClick={() => setPortalMenuOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    padding: '0.55rem 0.75rem',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    color: '#1e293b',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f0fdfa'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <div style={{ padding: '0.35rem', borderRadius: '6px', backgroundColor: '#ccfbf1', color: '#0f766e' }}>
                    <Landmark size={15} />
                  </div>
                  <div>
                    <div style={{ color: '#0f172a', fontWeight: 700 }}>सहकारी प्रतिवेदन (COPOMIS)</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>वित्तीय प्रतिवेदन तथा PEARLS</div>
                  </div>
                </Link>
              </div>
            )}
          </div>
        )}
        {isPublic && user && (
          <Link
            to="/app"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.4rem 0.85rem',
              border: '1px solid #93c5fd',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: '#1d4ed8',
              textDecoration: 'none',
              transition: 'all 0.15s ease',
              backgroundColor: '#eff6ff',
            }}
            title="प्रशासन ड्यासबोर्ड खोल्नुहोस्"
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = '#dbeafe';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = '#eff6ff';
            }}
          >
            <Shield size={14} color="#1d4ed8" />
            <span>प्रशासन ड्यासबोर्ड</span>
          </Link>
        )}
        {!isPublic && (
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.4rem 0.85rem',
              border: `1px solid ${N.border}`,
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: 500,
              color: N.text,
              textDecoration: 'none',
              transition: 'all 0.15s ease',
              backgroundColor: '#f8fafc',
            }}
            title="नागरिक पोर्टल हेर्नुहोस्"
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = '#f1f5f9';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = '#f8fafc';
            }}
          >
            <ExternalLink size={14} color="#0284c7" />
            <span>सार्वजनिक पोर्टल</span>
          </Link>
        )}

        {/* User Menu */}
        {user && (
          <div style={{ position: 'relative' }} ref={menuRef}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.4rem 0.75rem 0.4rem 0.5rem',
                backgroundColor: userMenuOpen ? '#f0f9ff' : 'transparent',
                border: `1px solid ${userMenuOpen ? '#bae6fd' : N.border}`,
                borderRadius: '10px', cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              title={`${user.email} (${user.role})`}
            >
              {/* Avatar */}
              <div
                style={{
                  width: '28px', height: '28px', borderRadius: '8px',
                  background: `linear-gradient(135deg, ${roleBadgeColor}, #0284c7)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: '0.75rem', fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {(user.fullName || user.email).charAt(0).toUpperCase()}
              </div>
              {/* Name + Role */}
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: N.text, lineHeight: 1.2 }}>
                  {user.fullName || user.email.split('@')[0]}
                </div>
                <div style={{ fontSize: '0.68rem', color: roleBadgeColor, fontWeight: 600, lineHeight: 1.2 }}>
                  {roleBadgeLabel}
                </div>
              </div>
              <ChevronDown size={14} style={{ color: N.textMuted, transform: userMenuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>

            {/* Dropdown */}
            {userMenuOpen && (
              <div
                style={{
                  position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                  width: '220px',
                  backgroundColor: '#ffffff',
                  border: `1px solid ${N.border}`,
                  borderRadius: '12px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  zIndex: 200,
                  overflow: 'hidden',
                  animation: 'slideDown 0.15s ease',
                }}
              >
                {/* User Info Header */}
                <div style={{ padding: '0.875rem 1rem', borderBottom: `1px solid ${N.border}` }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: N.text }}>
                    {user.fullName || 'Admin User'}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: N.textMuted, marginTop: '2px' }}>
                    {user.email}
                  </div>
                  <div
                    style={{
                      display: 'inline-block', marginTop: '6px',
                      padding: '2px 8px', borderRadius: '6px', fontSize: '0.7rem',
                      fontWeight: 700, backgroundColor: `${roleBadgeColor}18`,
                      color: roleBadgeColor,
                    }}
                  >
                    {roleBadgeLabel}
                  </div>
                </div>

                {/* Menu Items */}
                <div style={{ padding: '0.5rem' }}>
                  <Link
                    to="/palika-settings"
                    onClick={() => setUserMenuOpen(false)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.625rem',
                      padding: '0.55rem 0.75rem', borderRadius: '8px',
                      textDecoration: 'none', fontSize: '0.825rem', color: N.text,
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#f8fafc'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
                  >
                    <User size={15} style={{ color: N.textMuted }} />
                    प्रोफाइल सेटिङ
                  </Link>

                  {user.role === 'super_admin' && (
                    <Link
                      to="/super-admin"
                      onClick={() => setUserMenuOpen(false)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.625rem',
                        padding: '0.55rem 0.75rem', borderRadius: '8px',
                        textDecoration: 'none', fontSize: '0.825rem', color: '#2563eb',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#eff6ff'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
                    >
                      <Shield size={15} />
                      Super Admin Console
                    </Link>
                  )}

                  <div style={{ borderTop: `1px solid ${N.border}`, marginTop: '4px', paddingTop: '4px' }}>
                    <button
                      onClick={handleLogout}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.625rem',
                        padding: '0.55rem 0.75rem', borderRadius: '8px', width: '100%',
                        fontSize: '0.825rem', fontWeight: 500, color: '#ef4444',
                        backgroundColor: 'transparent', border: 'none', cursor: 'pointer',
                        transition: 'background 0.15s', textAlign: 'left',
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#fef2f2'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
                    >
                      <LogOut size={15} />
                      लगआउट गर्नुहोस्
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Login Button for Public */}
        {isPublic && !user && (
          <Link
            to="/login"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '6px 14px', borderRadius: '8px',
              background: '#0284c7', color: '#ffffff',
              fontWeight: 600, fontSize: '0.82rem', textDecoration: 'none',
              boxShadow: '0 1px 3px rgba(2,132,199,0.3)', transition: 'all 0.2s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#026ca3'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#0284c7'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
          >
            <User size={14} />
            कर्मचारी लगइन
          </Link>
        )}
      </div>

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </header>
  );
};
