import React, { useState, useEffect, useMemo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Home,
  FileText,
  AlertTriangle,
  FolderGit2,
  Settings,
  Shield,
  Sprout,
  Compass,
  Layers,
  Inbox,
  MapPin,
  PieChart,
  Bot,
  HeartPulse,
  GraduationCap,
  BookOpen,
  Landmark,
  FileCheck,
  HeartHandshake,
  Database,
  Menu,
  X,
  HelpCircle,
  TrendingUp,
  Globe,
  Camera,
  Scale,
  MonitorPlay,
  Briefcase,
  ClipboardList,
  Building2,
  ChevronDown,
  Pill,
  Store,
  CloudLightning,
  UserCircle,
  Trash2,
  MonitorCheck,
  BookMarked,
  QrCode,
  BarChart3,
  Gavel,
  Calendar,
  Activity,
  ShieldAlert,
  HardHat,
  CalendarRange,
  Droplets,
  Trees,
  Trophy,
} from 'lucide-react';

// ── Dark Sidebar Design Tokens ──────────────────────────────────────
const S = {
  bg: '#0d1f3c',
  bgHover: '#1a3260',
  bgActive: '#1e4d9b',
  border: 'rgba(255,255,255,0.08)',
  sectionLabel: '#7ba3d4',
  text: '#c8daf5',
  textActive: '#ffffff',
  accent: '#3b82f6',
  accentLight: 'rgba(59,130,246,0.15)',
  shadow: '4px 0 24px rgba(0,0,0,0.25)',
};

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  badge?: string;
  badgeColor?: string;
  roles?: string[];
  featureId?: string;
  comingSoon?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export const adminNavSections: NavSection[] = [
  {
    title: 'मुख्य नियन्त्रण कक्ष (Command & Intelligence)',
    items: [
      {
        label: 'एकीकृत कमान्ड ड्यासवोर्ड',
        path: '/app',
        icon: <LayoutDashboard size={16} style={{ color: '#f59e0b' }} />,
        badge: 'Unified BI & Ops',
        badgeColor: '#f59e0b',
        featureId: 'f_dashboard',
      },
      {
        label: 'एआई पालिका सहायक',
        path: '/app/ai-portal',
        icon: <Bot size={16} style={{ color: '#ec4899' }} />,
        badge: 'AI Copilot',
        badgeColor: '#ec4899',
        featureId: 'f_ai',
      },
      {
        label: 'पालिका डिजिटल प्रोफाइल',
        path: '/app/profile',
        icon: <Building2 size={16} />,
        featureId: 'f_executive',
      },
      {
        label: 'प्रगति तथा अनुगमन प्रतिवेदन',
        path: '/app/progress-reports',
        icon: <TrendingUp size={16} />,
        featureId: 'f_progress',
      },
      {
        label: 'कार्यक्रम क्यालेन्डर',
        path: '/app/event-calendar',
        icon: <Calendar size={16} />,
        featureId: 'f_dashboard',
      },
    ],
  },
  {
    title: 'कोर डाटा तथा डिजिटल फाउन्डेसन (Core MDM)',
    items: [
      {
        label: 'मास्टर डाटा व्यवस्थापन (MDM)',
        path: '/app/mdm',
        icon: <Database size={16} style={{ color: '#0ea5e9' }} />,
        badge: 'Core MDM',
        badgeColor: '#0ea5e9',
        featureId: 'f_mdm',
        roles: ['super_admin', 'admin', 'it_admin', 'planning_officer', 'data_entry'],
      },
      {
        label: 'घरधुरी तथा जनसांख्यिकी ३६०',
        path: '/app/demographics',
        icon: <Home size={16} />,
        featureId: 'f_master',
      },
      {
        label: 'खुला तथ्याङ्क (Open Data)',
        path: '/app/open-data',
        icon: <Database size={16} />,
        featureId: 'f_master',
      },
    ],
  },
  {
    title: 'प्रशासन तथा ई-अफिस कार्यप्रवाह (E-Office & Workflow)',
    items: [
      {
        label: 'एकीकृत ई-अफिस (टिप्पणी/स्वीकृति)',
        path: '/app/e-office',
        icon: <Inbox size={16} style={{ color: '#a855f7' }} />,
        badge: 'Tippani',
        badgeColor: '#a855f7',
        featureId: 'f_eoffice',
      },
      {
        label: 'दर्ता तथा चलानी अभिलेख',
        path: '/app/darta-chalani',
        icon: <FileText size={16} style={{ color: '#10b981' }} />,
        badge: 'Registry',
        badgeColor: '#10b981',
        featureId: 'f_darta',
      },
      {
        label: 'डिजिटल दस्ताबेज तथा OCR अभिलेख',
        path: '/app/document-archive',
        icon: <BookOpen size={16} style={{ color: '#06b6d4' }} />,
        badge: 'OCR & Acts',
        badgeColor: '#06b6d4',
        featureId: 'f_eoffice',
      },
      {
        label: 'कर्मचारी व्यवस्थापन (HRMS)',
        path: '/app/employees',
        icon: <Users size={16} />,
        roles: ['super_admin', 'admin', 'cao', 'it_admin'],
      },
      {
        label: 'कार्यभार व्यवस्थापन (Tasks)',
        path: '/app/tasks',
        icon: <ClipboardList size={16} />,
        roles: ['super_admin', 'admin', 'cao', 'it_admin'],
      },
      {
        label: 'न्यायिक समिति व्यवस्थापन',
        path: '/app/judicial',
        icon: <Scale size={16} />,
        roles: ['super_admin', 'admin', 'cao'],
      },
      {
        label: 'बैठक तथा कार्यपालिका निर्णय',
        path: '/app/meetings',
        icon: <Gavel size={16} />,
        roles: ['super_admin', 'admin', 'cao'],
      },
      {
        label: 'जनप्रतिनिधि व्यवस्थापन',
        path: '/app/representatives',
        icon: <Users size={16} />,
        featureId: 'f_master',
      },
      {
        label: 'संघ-संस्थाहरू (NGO/CBO)',
        path: '/app/organizations',
        icon: <Building2 size={16} />,
        featureId: 'f_master',
      },
      {
        label: 'सूचना प्रविधि शाखा (IT Branch)',
        path: '/app/it-branch',
        icon: <MonitorCheck size={16} />,
        roles: ['super_admin', 'admin', 'it_admin'],
      },
      {
        label: 'सुशासन तथा सामाजिक परीक्षण',
        path: '/app/social-audit',
        icon: <Gavel size={16} style={{ color: '#38bdf8' }} />,
        badge: 'Social Audit',
        badgeColor: '#0284c7',
        roles: ['super_admin', 'admin', 'cao', 'planning_officer'],
      },
    ],
  },
  {
    title: 'नागरिक सेवा तथा डिजिटल सिफारिस (Citizen 360 & Sifaris)',
    items: [
      {
        label: 'नागरिक ३६० तथा घरधुरी प्रोफाइल',
        path: '/app/citizen-360',
        icon: <UserCircle size={16} style={{ color: '#38bdf8' }} />,
        badge: 'C360 & MDM',
        badgeColor: '#0284c7',
        featureId: 'f_master',
      },
      {
        label: 'अनलाइन डिजिटल सिफारिस (४०+)',
        path: '/app/sifaris',
        icon: <FileCheck size={16} style={{ color: '#22c55e' }} />,
        badge: '४०+ सिफारिस',
        badgeColor: '#22c55e',
        featureId: 'f_digital_sifaris',
      },
      {
        label: 'नागरिक सेवा पोर्टल ३६०',
        path: '/app/citizen-portal',
        icon: <Users size={16} />,
        featureId: 'f_portal',
      },
      {
        label: 'डिजिटल नागरिक बडापत्र',
        path: '/app/badapatra',
        icon: <FileText size={16} />,
        featureId: 'f_charter',
      },
      {
        label: 'प्रमाणपत्र प्रमाणीकरण (QR)',
        path: '/app/verify-certificate',
        icon: <QrCode size={16} />,
        featureId: 'f_digital_sifaris',
      },
      {
        label: 'नागरिक गुनासो व्यवस्थापन',
        path: '/app/complaints',
        icon: <AlertTriangle size={16} />,
        featureId: 'f_grievance',
      },
      {
        label: 'व्यवसाय दर्ता तथा इजाजत',
        path: '/app/businesses',
        icon: <Briefcase size={16} style={{ color: '#10b981' }} />,
        badge: 'नवीकरण/निरीक्षण',
        badgeColor: '#10b981',
        featureId: 'f_business',
      },
      {
        label: 'अनलाइन दरखास्त (e-Recruit)',
        path: '/app/recruitment',
        icon: <FileCheck size={16} />,
        roles: ['super_admin', 'admin', 'cao'],
      },
    ],
  },
  {
    title: 'योजना, बजेट तथा आयोजना चक्र (Planning & Projects)',
    items: [
      {
        label: 'सम्पूर्ण आयोजना जीवनचक्र ३६०',
        path: '/app/project-lifecycle',
        icon: <FolderGit2 size={16} style={{ color: '#eab308' }} />,
        badge: 'PPIS/360',
        badgeColor: '#eab308',
        featureId: 'f_project_lifecycle',
        roles: ['super_admin', 'admin', 'cao', 'planning_officer', 'engineer', 'accountant'],
      },
      {
        label: 'वार्षिक योजना तथा कार्यक्रम',
        path: '/app/projects',
        icon: <FolderGit2 size={16} />,
        featureId: 'f_planning',
      },
      {
        label: 'बजेट तथा वित्तीय पारदर्शिता',
        path: '/app/budget-tracker',
        icon: <BarChart3 size={16} />,
        featureId: 'f_planning',
      },
      {
        label: 'ई-बोलपत्र तथा सार्वजनिक खरिद',
        path: '/app/procurement',
        icon: <FileText size={16} />,
        featureId: 'f_planning',
        roles: ['super_admin', 'admin', 'cao', 'planning_officer', 'accountant'],
      },
    ],
  },
  {
    title: 'भौतिक पूर्वाधार, नक्सा तथा सम्पत्ति (Infrastructure & Twin)',
    items: [
      {
        label: 'अनलाइन नक्सा पास प्रणाली (e-BPS)',
        path: '/app/ebps-admin',
        icon: <Layers size={16} style={{ color: '#06b6d4' }} />,
        badge: 'BIM/EBPS',
        badgeColor: '#06b6d4',
        featureId: 'f_ebps',
        roles: ['super_admin', 'admin', 'cao', 'engineer'],
      },
      {
        label: 'सूचीकृत इन्जिनियर तथा प्राविधिक रोस्टर',
        path: '/app/engineers',
        icon: <HardHat size={16} style={{ color: '#f59e0b' }} />,
        badge: 'NEC/eBPS',
        badgeColor: '#f59e0b',
        featureId: 'f_ebps',
        roles: ['super_admin', 'admin', 'cao', 'engineer', 'planning_officer'],
      },
      {
        label: '३डी/जीआईएस डिजिटल ट्विन',
        path: '/app/asset-twin',
        icon: <MapPin size={16} style={{ color: '#6366f1' }} />,
        badge: '3D Twin',
        badgeColor: '#6366f1',
        featureId: 'f_asset_twin',
      },
      {
        label: 'डिजिटल क्याडास्ट्रल नक्सा (GIS)',
        path: '/app/gis-map',
        icon: <Layers size={16} />,
        featureId: 'f_gis',
      },
      {
        label: 'जग्गा वर्गीकरण तथा भू-उपयोग नक्सा',
        path: '/app/land-classification',
        icon: <Compass size={16} style={{ color: '#10b981' }} />,
        badge: 'Land Use Twin',
        badgeColor: '#10b981',
      },
      {
        label: 'सार्वजनिक जिन्सी तथा सम्पत्ति (PAMS)',
        path: '/app/assets',
        icon: <Database size={16} />,
        roles: ['super_admin', 'admin', 'accountant', 'cao'],
      },
      {
        label: 'फोहोरमैला व्यवस्थापन ट्विन',
        path: '/app/waste-management',
        icon: <Trash2 size={16} />,
        featureId: 'f_gis',
      },
      {
        label: 'खानेपानी तथा स्वच्छता (WASH Twin)',
        path: '/app/wash',
        icon: <Droplets size={16} style={{ color: '#0284c7' }} />,
        badge: 'WASH Twin',
        badgeColor: '#0284c7',
        featureId: 'f_gis',
      },
      {
        label: 'सडक सञ्जाल तथा यातायात (Roads & MTMP)',
        path: '/app/roads',
        icon: <Compass size={16} style={{ color: '#0f766e' }} />,
        badge: 'MTMP',
        badgeColor: '#0f766e',
        featureId: 'f_gis',
      },
    ],
  },
  {
    title: 'आर्थिक प्रशासन तथा राजस्व (Revenue & Cooperatives)',
    items: [
      {
        label: 'स्थानीय कर तथा राजस्व (e-Tax)',
        path: '/app/revenue',
        icon: <TrendingUp size={16} style={{ color: '#f59e0b' }} />,
        badge: 'e-Tax',
        badgeColor: '#f59e0b',
        featureId: 'f_revenue',
        roles: ['super_admin', 'admin', 'revenue_officer', 'cao', 'accountant'],
      },
      {
        label: 'सहकारी नियमन (COPOMIS)',
        path: '/app/cooperatives',
        icon: <Landmark size={16} />,
        featureId: 'f_revenue',
      },
    ],
  },
  {
    title: 'सामाजिक विकास तथा सेवा क्षेत्र (Social & Sectoral)',
    items: [
      {
        label: 'सामाजिक सुरक्षा तथा घटना दर्ता (SSIS)',
        path: '/app/vital-events',
        icon: <HeartHandshake size={16} />,
        featureId: 'f_vital',
      },
      {
        label: 'रोजगार सेवा केन्द्र (ESC)',
        path: '/app/employment',
        icon: <Briefcase size={16} />,
        roles: ['super_admin', 'admin', 'cao'],
      },
      {
        label: 'स्वास्थ्य सेवा व्यवस्थापन (HMIS)',
        path: '/app/health',
        icon: <HeartPulse size={16} />,
        featureId: 'f_health',
      },
      {
        label: 'शिक्षा तथा विद्यालय व्यवस्थापन (IEMIS)',
        path: '/app/education',
        icon: <GraduationCap size={16} />,
        featureId: 'f_education',
      },
      {
        label: 'कृषक प्रोफाइल तथा अनुदान',
        path: '/app/farmer-profile',
        icon: <UserCircle size={16} />,
        featureId: 'f_agriculture',
      },
      {
        label: 'कृषि तथा पशुपन्छी व्यवस्थापन',
        path: '/app/agriculture',
        icon: <Sprout size={16} />,
        featureId: 'f_agriculture',
      },
      {
        label: 'भेटेरिनरी तथा औषधि व्यवस्थापन',
        path: '/app/vet-medicine',
        icon: <Pill size={16} />,
        featureId: 'f_agriculture',
      },
      {
        label: 'विपद् जोखिम व्यवस्थापन',
        path: '/app/disaster',
        icon: <AlertTriangle size={16} />,
        featureId: 'f_disaster',
      },
      {
        label: 'पर्यटन तथा सम्पदा डिजिटल ट्विन',
        path: '/app/tourism',
        icon: <Compass size={16} />,
        featureId: 'f_tourism',
      },
      {
        label: 'डिजिटल पुस्तकालय',
        path: '/app/library',
        icon: <BookOpen size={16} />,
        featureId: 'f_library',
      },
      {
        label: 'सांस्कृतिक सङ्ग्रहालय',
        path: '/app/museum',
        icon: <Landmark size={16} />,
        featureId: 'f_museum',
      },
      {
        label: 'कानुन तथा ऐन संगालो',
        path: '/app/legal-repository',
        icon: <BookMarked size={16} />,
        featureId: 'f_eoffice',
      },
      {
        label: 'सामाजिक समावेशीकरण',
        path: '/app/social-inclusion',
        icon: <HeartHandshake size={16} />,
        featureId: 'f_vital',
      },
      {
        label: 'वातावरण तथा नदीजन्य खानी नियमन',
        path: '/app/environment',
        icon: <Trees size={16} style={{ color: '#16a34a' }} />,
        badge: 'IEE/वन',
        badgeColor: '#16a34a',
        featureId: 'f_agriculture',
      },
      {
        label: 'बजार अनुगमन तथा उपभोक्ता हित',
        path: '/app/market-inspection',
        icon: <Store size={16} style={{ color: '#b45309' }} />,
        badge: 'अनुगमन',
        badgeColor: '#b45309',
        featureId: 'f_business',
      },
      {
        label: 'बालमैत्री स्थानीय शासन (CFLG) र खेलकुद',
        path: '/app/cflg-sports',
        icon: <Trophy size={16} style={{ color: '#7c3aed' }} />,
        badge: 'CFLG',
        badgeColor: '#7c3aed',
        featureId: 'f_vital',
      },
    ],
  },
  {
    title: 'सुरक्षा, अधिकार तथा प्रणाली नियन्त्रण (Security & Admin)',
    items: [
      {
        label: 'भूमिका तथा अधिकार म्याट्रिक्स',
        path: '/app/admin',
        icon: <Shield size={16} style={{ color: '#3b82f6' }} />,
        badge: 'RBAC',
        badgeColor: '#3b82f6',
        roles: ['super_admin', 'admin', 'it_admin'],
      },
      {
        label: 'प्रणाली अडिट तथा सुरक्षा लग',
        path: '/app/audit-logs',
        icon: <Activity size={16} style={{ color: '#38bdf8' }} />,
        badge: 'Audit & Sec',
        badgeColor: '#38bdf8',
        roles: ['super_admin', 'admin', 'cao', 'it_admin'],
      },
      {
        label: 'पालिका प्रणाली कन्फिगरेसन',
        path: '/app/palika-settings',
        icon: <Settings size={16} />,
        roles: ['super_admin', 'admin', 'it_admin'],
      },
      {
        label: 'आर्थिक वर्ष व्यवस्थापन',
        path: '/app/admin?tab=fiscal-year',
        icon: <CalendarRange size={16} style={{ color: '#2563eb' }} />,
        badge: 'FY Setup',
        badgeColor: '#2563eb',
        roles: ['super_admin', 'admin', 'cao', 'it_admin', 'accountant'],
      },
      {
        label: 'मद्दत तथा प्रयोगकर्ता पुस्तिका',
        path: '/app/faq-help',
        icon: <HelpCircle size={16} />,
        roles: ['super_admin', 'admin', 'cao', 'it_admin'],
      },
      {
        label: 'सुपर एडमिन कन्सोल',
        path: '/super-admin',
        icon: <Shield size={16} style={{ color: '#ef4444' }} />,
        badge: 'Super Admin',
        badgeColor: '#ef4444',
        roles: ['super_admin', 'it_admin'],
      },
    ],
  },
];

export const publicNavSections: NavSection[] = [
  {
    title: 'मुख्य सूचना तथा कमान्ड (Overview & Profile)',
    items: [
      {
        label: 'एकीकृत कमान्ड ड्यासबोर्ड',
        path: '/',
        icon: <LayoutDashboard size={16} style={{ color: '#f59e0b' }} />,
        badge: 'Unified BI',
        badgeColor: '#f59e0b',
      },
      {
        label: 'पालिका डिजिटल प्रोफाइल',
        path: '/profile',
        icon: <Building2 size={16} />,
      },
      {
        label: 'जनप्रतिनिधि विवरण',
        path: '/representatives',
        icon: <Users size={16} />,
      },
      {
        label: 'बैठक तथा कार्यपालिका निर्णय',
        path: '/meetings',
        icon: <Gavel size={16} />,
      },
      {
        label: 'प्रगति तथा अनुगमन प्रतिवेदन',
        path: '/progress-reports',
        icon: <TrendingUp size={16} />,
      },
      {
        label: 'कार्यक्रम क्यालेन्डर',
        path: '/event-calendar',
        icon: <Calendar size={16} />,
      },
      {
        label: 'एआई पालिका सहायक',
        path: '/ai-assistant',
        icon: <Bot size={16} style={{ color: '#ec4899' }} />,
        badge: 'AI Copilot',
        badgeColor: '#ec4899',
      },
      {
        label: 'सुशासन तथा सामाजिक परीक्षण',
        path: '/social-audit',
        icon: <Gavel size={16} style={{ color: '#38bdf8' }} />,
        badge: 'Social Audit',
        badgeColor: '#0284c7',
      },
    ],
  },
  {
    title: 'नागरिक सेवा तथा डिजिटल सिफारिस (Citizen 360 & Sifaris)',
    items: [
      {
        label: 'अनलाइन डिजिटल सिफारिस (४०+)',
        path: '/citizen-services',
        icon: <FileCheck size={16} style={{ color: '#22c55e' }} />,
        badge: '४०+ सिफारिस',
        badgeColor: '#22c55e',
      },
      {
        label: 'नागरिक सेवा पोर्टल ३६०',
        path: '/citizen-portal',
        icon: <Users size={16} />,
      },
      {
        label: 'डिजिटल नागरिक बडापत्र',
        path: '/badapatra',
        icon: <FileText size={16} />,
      },
      {
        label: 'प्रमाणपत्र प्रमाणीकरण (QR)',
        path: '/verify-certificate',
        icon: <QrCode size={16} />,
      },
      {
        label: 'नागरिक गुनासो व्यवस्थापन',
        path: '/complaints',
        icon: <AlertTriangle size={16} />,
      },
      {
        label: 'व्यवसाय दर्ता तथा इजाजत',
        path: '/businesses',
        icon: <Briefcase size={16} />,
      },
      {
        label: 'अनलाइन दरखास्त (e-Recruit)',
        path: '/recruitment',
        icon: <FileCheck size={16} />,
      },
    ],
  },
  {
    title: 'योजना, बजेट तथा वित्तीय पारदर्शिता (Planning & Budget)',
    items: [
      {
        label: 'सम्पूर्ण आयोजना जीवनचक्र ३६०',
        path: '/projects',
        icon: <FolderGit2 size={16} style={{ color: '#f97316' }} />,
        badge: 'PPIS/360',
        badgeColor: '#f97316',
      },
      {
        label: 'बजेट तथा वित्तीय पारदर्शिता',
        path: '/budget-tracker',
        icon: <BarChart3 size={16} />,
      },
      {
        label: 'ई-बोलपत्र तथा सार्वजनिक खरिद',
        path: '/procurement',
        icon: <FileText size={16} />,
      },
    ],
  },
  {
    title: 'भौतिक पूर्वाधार, नक्सा तथा ट्विन (Infrastructure & Twin)',
    items: [
      {
        label: 'अनलाइन नक्सा पास प्रणाली (e-BPS)',
        path: '/building-permit',
        icon: <Layers size={16} style={{ color: '#6366f1' }} />,
        badge: 'BIM/EBPS',
        badgeColor: '#6366f1',
      },
      {
        label: '३डी/जीआईएस डिजिटल ट्विन',
        path: '/gis-map',
        icon: <Layers size={16} style={{ color: '#06b6d4' }} />,
        badge: '3D Twin',
        badgeColor: '#06b6d4',
      },
      {
        label: 'जग्गा वर्गीकरण तथा भू-उपयोग नक्सा',
        path: '/land-classification',
        icon: <Compass size={16} style={{ color: '#10b981' }} />,
        badge: 'Land Use Twin',
        badgeColor: '#10b981',
      },
      {
        label: 'फोहोरमैला व्यवस्थापन ट्विन',
        path: '/waste-management',
        icon: <Trash2 size={16} />,
      },
      {
        label: 'खानेपानी तथा स्वच्छता (WASH Twin)',
        path: '/wash',
        icon: <Droplets size={16} style={{ color: '#0284c7' }} />,
        badge: 'WASH Twin',
        badgeColor: '#0284c7',
      },
      {
        label: 'सडक सञ्जाल तथा यातायात (Roads & MTMP)',
        path: '/roads',
        icon: <Compass size={16} style={{ color: '#0f766e' }} />,
        badge: 'MTMP',
        badgeColor: '#0f766e',
      },
    ],
  },
  {
    title: 'आर्थिक प्रशासन तथा राजस्व (Revenue & Cooperatives)',
    items: [
      {
        label: 'स्थानीय कर तथा राजस्व (e-Tax)',
        path: '/revenue',
        icon: <TrendingUp size={16} style={{ color: '#14b8a6' }} />,
        badge: 'e-Tax',
        badgeColor: '#14b8a6',
      },
      {
        label: 'सहकारी नियमन (COPOMIS)',
        path: '/cooperatives',
        icon: <Landmark size={16} />,
      },
    ],
  },
  {
    title: 'सामाजिक विकास तथा सेवा क्षेत्र (Social & Sectoral)',
    items: [
      {
        label: 'सामाजिक सुरक्षा तथा घटना दर्ता (SSIS)',
        path: '/vital-events',
        icon: <HeartHandshake size={16} style={{ color: '#ec4899' }} />,
        badge: 'SSIS',
        badgeColor: '#ec4899',
      },
      {
        label: 'रोजगार सेवा केन्द्र (ESC)',
        path: '/employment',
        icon: <Briefcase size={16} />,
      },
      {
        label: 'स्वास्थ्य सेवा व्यवस्थापन (HMIS)',
        path: '/health',
        icon: <HeartPulse size={16} />,
      },
      {
        label: 'शिक्षा तथा विद्यालय व्यवस्थापन (IEMIS)',
        path: '/education',
        icon: <GraduationCap size={16} />,
      },
      {
        label: 'कृषक प्रोफाइल तथा अनुदान',
        path: '/farmer-profile',
        icon: <UserCircle size={16} />,
      },
      {
        label: 'कृषि तथा पशुपन्छी व्यवस्थापन',
        path: '/agriculture',
        icon: <Sprout size={16} />,
      },
      {
        label: 'भेटेरिनरी तथा औषधि व्यवस्थापन',
        path: '/vet-medicine',
        icon: <Pill size={16} />,
      },
      {
        label: 'विपद् जोखिम व्यवस्थापन',
        path: '/disaster',
        icon: <AlertTriangle size={16} />,
      },
      {
        label: 'पर्यटन तथा सम्पदा डिजिटल ट्विन',
        path: '/tourism',
        icon: <Compass size={16} />,
      },
      {
        label: 'डिजिटल पुस्तकालय',
        path: '/library',
        icon: <BookOpen size={16} />,
      },
      {
        label: 'सांस्कृतिक सङ्ग्रहालय',
        path: '/museum',
        icon: <Landmark size={16} />,
      },
      {
        label: 'कानुन तथा ऐन संगालो',
        path: '/legal-repository',
        icon: <BookMarked size={16} />,
      },
      {
        label: 'सामाजिक समावेशीकरण',
        path: '/social-inclusion',
        icon: <HeartHandshake size={16} />,
      },
      {
        label: 'वातावरण तथा नदीजन्य खानी नियमन',
        path: '/environment',
        icon: <Trees size={16} style={{ color: '#16a34a' }} />,
        badge: 'IEE/वन',
        badgeColor: '#16a34a',
      },
      {
        label: 'बजार अनुगमन तथा उपभोक्ता हित',
        path: '/market-inspection',
        icon: <Store size={16} style={{ color: '#b45309' }} />,
        badge: 'अनुगमन',
        badgeColor: '#b45309',
      },
      {
        label: 'बालमैत्री स्थानीय शासन (CFLG) र खेलकुद',
        path: '/cflg-sports',
        icon: <Trophy size={16} style={{ color: '#7c3aed' }} />,
        badge: 'CFLG',
        badgeColor: '#7c3aed',
      },
      {
        label: 'संघ-संस्थाहरू (NGO/CBO)',
        path: '/organizations',
        icon: <Building2 size={16} />,
      },
    ],
  },
  {
    title: 'खुला तथ्याङ्क तथा नागरिक सहायता (Open Data & Support)',
    items: [
      {
        label: 'खुला तथ्याङ्क (Open Data)',
        path: '/open-data',
        icon: <Database size={16} />,
      },
      {
        label: 'घरधुरी तथा जनसांख्यिकी ३६०',
        path: '/demographics',
        icon: <Home size={16} />,
      },
      {
        label: 'मद्दत तथा प्रयोगकर्ता पुस्तिका',
        path: '/faq-help',
        icon: <HelpCircle size={16} />,
      },
    ],
  },
];


import { useAuth } from '../../context/AuthContext';
import { useTenant } from '../../context/TenantContext';
import { useQuery } from '@tanstack/react-query';
import { usersApi, type Role as ApiRole } from '../../api/users';

interface SidebarProps {
  isPublic?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ isPublic = false }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  const { settings, currentTenant, tenantId } = useTenant();
  const palikaName = settings?.palika_name || currentTenant?.name_np || 'डिजिटल ट्विन';

  // Load dynamic RBAC roles & permissions (from API & synced with localStorage)
  const { data: dbRoles = [] } = useQuery<ApiRole[]>({
    queryKey: ['roles'],
    queryFn: async () => {
      try {
        const roles = await usersApi.getRoles();
        if (Array.isArray(roles) && roles.length > 0) {
          try {
            localStorage.setItem('p5_role_permissions', JSON.stringify(roles));
          } catch {}
          return roles;
        }
      } catch (err) {
        console.warn('Failed to fetch roles from API, reading cache:', err);
      }
      try {
        const cached = localStorage.getItem('p5_role_permissions');
        if (cached) return JSON.parse(cached);
      } catch {}
      return [];
    },
    enabled: !isPublic && !!user,
    staleTime: 30 * 1000,
  });

  const tenantBadge = useMemo(() => {
    const sub = (currentTenant?.subdomain || tenantId || '').toLowerCase();
    const name = (palikaName || '').toLowerCase();
    if (sub.includes('gaushala') || name.includes('गौशाला')) return 'GM';
    if (sub.includes('khada') || sub.includes('khanda') || name.includes('खाँडादेवी')) return 'KD';
    if (sub.includes('benighat') || name.includes('बेनिघाट')) return 'BR';
    if (sub.includes('helambu') || name.includes('हेलम्बु')) return 'HM';
    if (sub.includes('melamchi') || name.includes('मेलम्ची')) return 'MM';
    if (sub.includes('indrawati') || name.includes('इन्द्रावती')) return 'IW';
    if (sub.includes('galchhi') || name.includes('गल्छी')) return 'GL';
    return 'P5';
  }, [currentTenant?.subdomain, tenantId, palikaName]);

  const currentSections = useMemo(() => {
    if (isPublic) return publicNavSections;
    const userRole = user?.role || 'admin';
    const isSuper = userRole === 'super_admin' || userRole === 'it_admin' || userRole === 'admin';

    // Find permissions for current role from dbRoles or cached matrix
    let rolePermissions: string[] | null = null;
    if (!isSuper) {
      const activeRoleObj = dbRoles.find((r) => r.name === userRole);
      if (activeRoleObj && Array.isArray(activeRoleObj.permissions)) {
        rolePermissions = activeRoleObj.permissions;
      } else {
        try {
          const cached = localStorage.getItem('p5_role_permissions');
          if (cached) {
            const list = JSON.parse(cached);
            const found = list.find((r: any) => r.name === userRole);
            if (found && Array.isArray(found.permissions)) {
              rolePermissions = found.permissions;
            }
          }
        } catch {}
      }
    }

    return adminNavSections
      .map((section) => ({
        ...section,
        items: section.items.filter((item) => {
          // Super admin and Palika Admin can see all modules
          if (isSuper) {
            if (item.roles && !item.roles.includes(userRole)) {
              if (item.roles.includes('super_admin') && !item.roles.includes('admin') && userRole !== 'super_admin') {
                return false;
              }
            }
            return true;
          }

          // If role-restricted admin item (e.g. HRMS, IT Branch, Admin Console)
          if (item.roles && item.roles.length > 0) {
            if (!item.roles.includes(userRole)) return false;
          }

          // If linked to an RBAC Matrix feature: STRICT FILTERING!
          // Only show if the role explicitly has this feature checked in the matrix!
          if (item.featureId) {
            if (!rolePermissions || !rolePermissions.includes(item.featureId)) {
              return false;
            }
          }

          return true;
        }),
      }))
      .filter((section) => section.items.length > 0);
  }, [isPublic, user?.role, dbRoles]);

  // Track expanded state for sections (all open by default, expandable/collapsible)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    currentSections.forEach((sec) => {
      initial[sec.title] = true;
    });
    return initial;
  });

  useEffect(() => {
    setIsMobileOpen(false);
    // Ensure section with active route stays open
    currentSections.forEach((sec) => {
      const isCurrentActive = sec.items.some((item) =>
        item.path === '/' || item.path === '/app'
          ? location.pathname === item.path
          : location.pathname.startsWith(item.path)
      );
      if (isCurrentActive) {
        setOpenSections((prev) => ({ ...prev, [sec.title]: true }));
      }
    });
  }, [location.pathname, isPublic]);

  const toggleSection = (title: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [title]: prev[title] === undefined ? false : !prev[title],
    }));
  };

  const navContent = (
    <>
      {/* Brand Header */}
      <div
        style={{
          padding: '1.25rem 1rem',
          borderBottom: `1px solid ${S.border}`,
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #1565C0, #0284c7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 800,
            fontSize: '0.9rem',
            flexShrink: 0,
            boxShadow: '0 2px 8px rgba(2,132,199,0.4)',
          }}
        >
          {tenantBadge}
        </div>
        <div>
          <div style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.85rem', lineHeight: 1.3 }}>
            Municipal Digital Twins
          </div>
          <div style={{ color: S.sectionLabel, fontSize: '0.72rem', marginTop: '1px' }}>
            v2.0-ts
          </div>
        </div>
      </div>

      {/* Nav Sections with Collapsible Accordion */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem 0.625rem' }}>
        {currentSections.map((section) => {
          const isOpen = openSections[section.title] ?? true;
          const hasActiveItem = section.items.some((item) =>
            item.path === '/' || item.path === '/app'
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path)
          );

          return (
            <div key={section.title} style={{ marginBottom: '0.75rem' }}>
              {/* Section Accordion Header */}
              <button
                type="button"
                onClick={() => toggleSection(section.title)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.35rem 0.5rem',
                  marginBottom: '0.2rem',
                  borderRadius: '6px',
                  transition: 'background 0.15s ease',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      color: hasActiveItem ? '#60a5fa' : S.sectionLabel,
                    }}
                  >
                    {section.title}
                  </span>
                  <span
                    style={{
                      fontSize: '0.62rem',
                      padding: '1px 5px',
                      borderRadius: '10px',
                      backgroundColor: hasActiveItem ? 'rgba(59,130,246,0.25)' : 'rgba(255,255,255,0.08)',
                      color: hasActiveItem ? '#93c5fd' : S.sectionLabel,
                      fontWeight: 600,
                    }}
                  >
                    {section.items.length}
                  </span>
                </div>
                <ChevronDown
                  size={14}
                  style={{
                    color: hasActiveItem ? '#60a5fa' : S.sectionLabel,
                    transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
                    transition: 'transform 0.2s ease',
                    opacity: 0.85,
                  }}
                />
              </button>

              {/* Nav Items */}
              {isOpen && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                  {section.items.map((item) => {
                    if (item.comingSoon) {
                      return (
                        <div
                          key={item.path}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.625rem',
                            padding: '0.5rem 0.625rem',
                            borderRadius: '8px',
                            fontSize: '0.825rem',
                            fontWeight: 400,
                            color: 'rgba(200,218,245, 0.4)',
                            backgroundColor: 'transparent',
                            cursor: 'not-allowed',
                          }}
                          title="यो सुविधा निर्माण हुँदैछ"
                        >
                          <span style={{ opacity: 0.4, flexShrink: 0 }}>{item.icon}</span>
                          <span style={{ flex: 1, lineHeight: 1.3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            {item.label}
                            <span style={{ fontSize: '0.6rem', background: 'rgba(255,255,255,0.05)', padding: '2px 5px', borderRadius: '4px', letterSpacing: '0.05em' }}>
                              Coming Soon
                            </span>
                          </span>
                        </div>
                      );
                    }

                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === '/' || item.path === '/app'}
                        style={({ isActive }) => ({
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.625rem',
                          padding: '0.5rem 0.625rem',
                          borderRadius: '8px',
                          textDecoration: 'none',
                          fontSize: '0.825rem',
                          fontWeight: isActive ? 600 : 400,
                          color: isActive ? S.textActive : S.text,
                          backgroundColor: isActive ? S.bgActive : 'transparent',
                          transition: 'all 0.15s ease',
                          position: 'relative',
                        })}
                        onMouseEnter={(e) => {
                          const el = e.currentTarget;
                          if (!el.classList.contains('active')) {
                            el.style.backgroundColor = S.bgHover;
                            el.style.color = '#ffffff';
                          }
                        }}
                        onMouseLeave={(e) => {
                          const el = e.currentTarget;
                          if (!el.classList.contains('active')) {
                            el.style.backgroundColor = 'transparent';
                            el.style.color = S.text;
                          }
                        }}
                      >
                        <span style={{ opacity: 0.85, flexShrink: 0 }}>{item.icon}</span>
                        <span style={{ flex: 1, lineHeight: 1.3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.35rem' }}>
                          <span>{item.label}</span>
                          {item.badge && (
                            <span
                              style={{
                                fontSize: '0.58rem',
                                padding: '1px 5px',
                                borderRadius: '4px',
                                backgroundColor: item.badgeColor ? `${item.badgeColor}22` : 'rgba(255,255,255,0.08)',
                                color: item.badgeColor || '#93c5fd',
                                border: `1px solid ${item.badgeColor ? `${item.badgeColor}44` : 'rgba(255,255,255,0.15)'}`,
                                fontWeight: 700,
                                whiteSpace: 'nowrap',
                                letterSpacing: '0.02em',
                              }}
                            >
                              {item.badge}
                            </span>
                          )}
                        </span>
                      </NavLink>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div
        style={{
          padding: '0.875rem 1rem',
          borderTop: `1px solid ${S.border}`,
          fontSize: '0.72rem',
          color: S.sectionLabel,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        <Settings size={13} />
        <span>{palikaName}</span>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        style={{
          position: 'fixed',
          bottom: '1.5rem',
          right: '1.5rem',
          zIndex: 1000,
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          backgroundColor: '#0284c7',
          color: '#ffffff',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(2,132,199,0.4)',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        className="sidebar-mobile-toggle"
        aria-label="Toggle navigation menu"
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 900,
          }}
          className="sidebar-overlay"
        />
      )}

      {/* Desktop Sidebar */}
      <aside
        style={{
          width: '256px',
          backgroundColor: S.bg,
          display: 'flex',
          flexDirection: 'column',
          height: 'calc(100vh - 64px)',
          position: 'sticky',
          top: '64px',
          flexShrink: 0,
          boxShadow: S.shadow,
        }}
        className="sidebar-desktop"
      >
        {navContent}
      </aside>

      {/* Mobile Drawer */}
      <aside
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '280px',
          height: '100vh',
          backgroundColor: S.bg,
          boxShadow: '4px 0 24px rgba(0,0,0,0.3)',
          zIndex: 950,
          flexDirection: 'column',
          transform: isMobileOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          overflowY: 'auto',
        }}
        className="sidebar-mobile"
      >
        <div
          style={{
            padding: '1rem',
            borderBottom: `1px solid ${S.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#ffffff' }}>
            🏛️ पालिका डिजिटल ट्विन
          </span>
          <button
            onClick={() => setIsMobileOpen(false)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: S.sectionLabel, padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>
        {navContent}
      </aside>
    </>
  );
};
