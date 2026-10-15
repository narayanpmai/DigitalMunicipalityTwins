import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Bot,
  Building2,
  TrendingUp,
  Calendar,
  Database,
  Users,
  Layers,
  FileCheck2,
  FolderGit2,
  BarChart3,
  FileText,
  MapPin,
  Trash2,
  CreditCard,
  Landmark,
  HeartHandshake,
  Briefcase,
  HeartPulse,
  GraduationCap,
  Sprout,
  Pill,
  AlertTriangle,
  Compass,
  BookOpen,
  BookMarked,
  Shield,
  Settings,
  HelpCircle,
  Lock,
  ExternalLink,
  Search,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  Filter,
  CloudRain,
} from 'lucide-react';

export interface ModuleItem {
  id: string;
  title: string;
  category: string;
  badge?: string;
  badgeColor?: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  isStaffOnly?: boolean;
}

export interface SectorDomain {
  id: string;
  title: string;
  shortTitle: string;
  count: number;
  color: string;
  icon: React.ReactNode;
}

export const SECTOR_DOMAINS: SectorDomain[] = [
  {
    id: 'command',
    title: 'मुख्य नियन्त्रण कक्ष (Command & Intelligence)',
    shortTitle: 'कमान्ड र नियन्त्रण',
    count: 6,
    color: '#f59e0b',
    icon: <LayoutDashboard size={18} />,
  },
  {
    id: 'core-mdm',
    title: 'कोर डाटा तथा डिजिटल फाउन्डेसन (Core MDM)',
    shortTitle: 'कोर डाटा (MDM)',
    count: 3,
    color: '#0ea5e9',
    icon: <Database size={18} />,
  },
  {
    id: 'e-office',
    title: 'प्रशासन तथा ई-अफिस कार्यप्रवाह (E-Office & Workflow)',
    shortTitle: 'प्रशासन र ई-अफिस',
    count: 9,
    color: '#8b5cf6',
    icon: <FileText size={18} />,
  },
  {
    id: 'citizen',
    title: 'नागरिक सेवा तथा डिजिटल सिफारिस (Citizen 360 & Sifaris)',
    shortTitle: 'नागरिक सेवा र सिफारिस',
    count: 7,
    color: '#10b981',
    icon: <FileCheck2 size={18} />,
  },
  {
    id: 'projects',
    title: 'योजना, बजेट तथा आयोजना चक्र (Planning & Projects)',
    shortTitle: 'योजना, बजेट र खरिद',
    count: 4,
    color: '#eab308',
    icon: <FolderGit2 size={18} />,
  },
  {
    id: 'infrastructure',
    title: 'भौतिक पूर्वाधार, नक्सा तथा सम्पत्ति (Infrastructure & Twin)',
    shortTitle: 'पूर्वाधार र ३डी ट्विन',
    count: 5,
    color: '#06b6d4',
    icon: <Layers size={18} />,
  },
  {
    id: 'revenue',
    title: 'आर्थिक प्रशासन तथा राजस्व (Revenue & Cooperatives)',
    shortTitle: 'राजस्व र सहकारी',
    count: 2,
    color: '#f97316',
    icon: <CreditCard size={18} />,
  },
  {
    id: 'social',
    title: 'सामाजिक विकास तथा सेवा क्षेत्र (Social & Sectoral)',
    shortTitle: 'सामाजिक विकास (१३)',
    count: 13,
    color: '#ec4899',
    icon: <HeartHandshake size={18} />,
  },
  {
    id: 'admin',
    title: 'सुरक्षा, अधिकार तथा प्रणाली नियन्त्रण (Security & Admin)',
    shortTitle: 'सुरक्षा र सुपर एडमिन',
    count: 4,
    color: '#6366f1',
    icon: <Shield size={18} />,
  },
];

export const ALL_53_MODULES: ModuleItem[] = [
  // ── 1. मुख्य नियन्त्रण कक्ष (Command & Intelligence) - 6 ─────────────────────
  {
    id: 'cmd-executive',
    title: 'कार्यपालिका कमान्ड ड्यासवोर्ड',
    category: 'command',
    badge: 'Executive BI',
    badgeColor: '#f59e0b',
    description: 'गाउँपालिका अध्यक्ष, उपाध्यक्ष तथा प्रमुख प्रशासकीय अधिकृतका लागि उच्चस्तरीय निर्णय तथा सूचक विश्लेषण ड्यासबोर्ड।',
    icon: <LayoutDashboard size={22} color="#f59e0b" />,
    path: '/progress-reports',
    isStaffOnly: false,
  },
  {
    id: 'cmd-overview',
    title: 'दैनिक कार्यसञ्चालन (Overview)',
    category: 'command',
    description: 'दैनिक सेवा प्रवाह, आयोजना अवस्था, वडागत उपस्थिति र समग्र पालिका सञ्चालनको प्रत्यक्ष सारांश।',
    icon: <LayoutDashboard size={22} color="#0284c7" />,
    path: '/',
    isStaffOnly: false,
  },
  {
    id: 'cmd-ai-copilot',
    title: 'एआई पालिका सहायक',
    category: 'command',
    badge: 'AI Copilot',
    badgeColor: '#ec4899',
    description: 'प्राकृतिक नेपाली भाषामा पालिका नियम, सेवा प्रक्रिया र नीतिगत प्रश्नहरूको २४/७ स्वचालित डिजिटल परामर्श।',
    icon: <Bot size={22} color="#ec4899" />,
    path: '/ai-assistant',
    isStaffOnly: false,
  },
  {
    id: 'cmd-profile',
    title: 'पालिका डिजिटल प्रोफाइल',
    category: 'command',
    description: 'भौगोलिक सीमा, ८ वटै वडा विवरण, जनसांख्यिकी, प्राकृतिक स्रोत तथा पालिकाको समग्र परिचय।',
    icon: <Building2 size={22} color="#3b82f6" />,
    path: '/profile',
    isStaffOnly: false,
  },
  {
    id: 'cmd-reports',
    title: 'प्रगति तथा अनुगमन प्रतिवेदन',
    category: 'command',
    description: 'वार्षिक, त्रैमासिक भौतिक तथा वित्तीय उपलब्धि, विकास सूचकाङ्क र सार्वजनिक अनुगमन प्रतिवेदनहरू।',
    icon: <TrendingUp size={22} color="#10b981" />,
    path: '/progress-reports',
    isStaffOnly: false,
  },
  {
    id: 'cmd-calendar',
    title: 'कार्यक्रम क्यालेन्डर',
    category: 'command',
    description: 'पालिका तथा वडास्तरीय सार्वजनिक कार्यक्रम, कार्यपालिका बैठक, सभा सम्मेलन र चाडपर्व तालिका।',
    icon: <Calendar size={22} color="#8b5cf6" />,
    path: '/event-calendar',
    isStaffOnly: false,
  },
  {
    id: 'cmd-weather',
    title: 'मौसम जानकारी (Weather)',
    category: 'command',
    badge: 'New',
    badgeColor: '#3b82f6',
    description: 'पाँचपोखरी थाङपाल गाउँपालिकाको वास्तविक समयको मौसम तथा वर्षा मापन जानकारी।',
    icon: <CloudRain size={22} color="#3b82f6" />,
    path: '/citizen-portal?tab=weather',
    isStaffOnly: false,
  },

  // ── 2. कोर डाटा तथा डिजिटल फाउन्डेसन (Core MDM) - 3 ──────────────────────────
  {
    id: 'mdm-core',
    title: 'मास्टर डाटा व्यवस्थापन (MDM)',
    category: 'core-mdm',
    badge: 'Core MDM',
    badgeColor: '#0ea5e9',
    description: 'वडा सीमा, टोल, सडक सञ्जाल, सार्वजनिक संस्था र वर्गीकरणको एकीकृत आधिकारिक मास्टर डाटाबेस।',
    icon: <Database size={22} color="#0ea5e9" />,
    path: '/login?redirect=/app/mdm',
    isStaffOnly: true,
  },
  {
    id: 'mdm-demographics',
    title: 'घरधुरी तथा जनसांख्यिकी ३६०',
    category: 'core-mdm',
    description: 'पालिकाका ५,८०५ घरधुरीको पारिवारिक, सामाजिक, आर्थिक तथा शैक्षिक विवरणको पूर्ण डिजिटल अभिलेख।',
    icon: <Users size={22} color="#10b981" />,
    path: '/citizen-portal',
    isStaffOnly: false,
  },
  {
    id: 'mdm-open-data',
    title: 'खुला तथ्याङ्क (Open Data)',
    category: 'core-mdm',
    description: 'अनुसन्धानकर्ता, नागरिक र पत्रकारका लागि पालिकाको खुला, पारदर्शी र डाउनलोडयोग्य तथ्याङ्क भण्डार।',
    icon: <Database size={22} color="#6366f1" />,
    path: '/open-data',
    isStaffOnly: false,
  },

  // ── 3. प्रशासन तथा ई-अफिस कार्यप्रवाह (E-Office & Workflow) - 9 ─────────────
  {
    id: 'office-tippani',
    title: 'एकीकृत ई-अफिस (टिप्पणी/स्वीकृति)',
    category: 'e-office',
    badge: 'Tippani',
    badgeColor: '#a855f7',
    description: 'कागजविहीन डिजिटल टिप्पणी उठान, तहगत पेस, डिजिटल हस्ताक्षर तथा निर्णय प्रमाणीकरण कार्यप्रवाह।',
    icon: <FileText size={22} color="#a855f7" />,
    path: '/login?redirect=/app/e-office',
    isStaffOnly: true,
  },
  {
    id: 'office-registry',
    title: 'दर्ता तथा चलानी अभिलेख',
    category: 'e-office',
    badge: 'Registry',
    badgeColor: '#06b6d4',
    description: 'आधिकारिक पत्रव्यवहारको डिजिटल दर्ता, चलानी नम्बर उत्पादन, स्क्यान संलग्नता र ट्र्याकिङ।',
    icon: <FileCheck2 size={22} color="#06b6d4" />,
    path: '/login?redirect=/app/darta-chalani',
    isStaffOnly: true,
  },
  {
    id: 'office-hrms',
    title: 'कर्मचारी व्यवस्थापन (HRMS)',
    category: 'e-office',
    description: 'पालिका कर्मचारीहरूको व्यक्तिगत विवरण, पदस्थापना, हाजिरी, बिदा अभिलेख र कार्यसम्पादन।',
    icon: <Users size={22} color="#3b82f6" />,
    path: '/login?redirect=/app/employees',
    isStaffOnly: true,
  },
  {
    id: 'office-tasks',
    title: 'कार्यभार व्यवस्थापन (Tasks)',
    category: 'e-office',
    description: 'शाखागत दैनिक जिम्मेवारी, कार्य प्रगति ट्र्याकिङ, म्याद व्यवस्थापन र सुपरिवेक्षण।',
    icon: <Briefcase size={22} color="#f59e0b" />,
    path: '/login?redirect=/app/tasks',
    isStaffOnly: true,
  },
  {
    id: 'office-judicial',
    title: 'न्यायिक समिति व्यवस्थापन',
    category: 'e-office',
    description: 'स्थानीय न्यायिक समितिमा दर्ता भएका विवाद, उजुरी, तारेख, मिलापत्र र फैसलाको अभिलेख।',
    icon: <Landmark size={22} color="#ef4444" />,
    path: '/login?redirect=/app/judicial',
    isStaffOnly: true,
  },
  {
    id: 'office-meetings',
    title: 'बैठक तथा कार्यपालिका निर्णय',
    category: 'e-office',
    description: 'गाउँ कार्यपालिका तथा विषयगत समिति बैठकका निर्णयहरू, माइन्युट र सार्वजनिक सूचनाहरू।',
    icon: <Calendar size={22} color="#10b981" />,
    path: '/meetings',
    isStaffOnly: false,
  },
  {
    id: 'office-representatives',
    title: 'जनप्रतिनिधि व्यवस्थापन',
    category: 'e-office',
    description: 'गाउँपालिका अध्यक्ष, उपाध्यक्ष, वडा अध्यक्ष तथा सदस्यहरूको आधिकारिक विवरण र सम्पर्क डाइरेक्टरी।',
    icon: <Users size={22} color="#0284c7" />,
    path: '/representatives',
    isStaffOnly: false,
  },
  {
    id: 'office-organizations',
    title: 'संघ-संस्थाहरू (NGO/CBO)',
    category: 'e-office',
    description: 'पालिकाभित्र क्रियाशील गैरसरकारी संस्था, नागरिक समाज र क्लबहरूको दर्ता तथा सहकार्य अभिलेख।',
    icon: <HeartHandshake size={22} color="#ec4899" />,
    path: '/organizations',
    isStaffOnly: false,
  },
  {
    id: 'office-it-branch',
    title: 'सूचना प्रविधि शाखा (IT Branch)',
    category: 'e-office',
    description: 'पालिकाका सर्भर, नेटवर्क, हार्डवेयर उपकरण र डिजिटल पूर्वाधारहरूको प्राविधिक व्यवस्थापन।',
    icon: <Settings size={22} color="#64748b" />,
    path: '/login?redirect=/app/it-branch',
    isStaffOnly: true,
  },

  // ── 4. नागरिक सेवा तथा डिजिटल सिफारिस (Citizen 360 & Sifaris) - 7 ──────────
  {
    id: 'citizen-sifaris',
    title: 'अनलाइन डिजिटल सिफारिस (४०+)',
    category: 'citizen',
    badge: '४०+ सिफारिस',
    badgeColor: '#10b981',
    description: 'नाता प्रमाणित, चार किल्ला, नागरिकता सिफारिस लगायतका ४० भन्दा बढी वडा सिफारिस अनलाइन दरखास्त।',
    icon: <FileCheck2 size={22} color="#10b981" />,
    path: '/citizen-services',
    isStaffOnly: false,
  },
  {
    id: 'citizen-portal-360',
    title: 'नागरिक सेवा पोर्टल ३६०',
    category: 'citizen',
    description: 'नागरिकको व्यक्तिगत सेवा इतिहास, पेश गरिएका निवेदनको स्थिति र एकीकृत डिजिटल प्रोफाइल।',
    icon: <Users size={22} color="#0284c7" />,
    path: '/citizen-portal',
    isStaffOnly: false,
  },
  {
    id: 'citizen-badapatra',
    title: 'डिजिटल नागरिक बडापत्र',
    category: 'citizen',
    description: 'पालिका तथा ८ वटै वडाबाट प्रवाह हुने सम्पूर्ण सेवा, आवश्यक कागजात, दस्तुर र लाग्ने समयको विवरण।',
    icon: <FileText size={22} color="#8b5cf6" />,
    path: '/badapatra',
    isStaffOnly: false,
  },
  {
    id: 'citizen-verify',
    title: 'प्रमाणपत्र प्रमाणीकरण (QR)',
    category: 'citizen',
    description: 'पालिकाबाट जारी भएका सिफारिस, दर्ता प्रमाणपत्र र कागजातको QR कोड स्क्यान गरी प्रत्यक्ष आधिकारिकता जाँच।',
    icon: <CheckCircle2 size={22} color="#059669" />,
    path: '/verify-certificate',
    isStaffOnly: false,
  },
  {
    id: 'citizen-complaints',
    title: 'नागरिक गुनासो व्यवस्थापन',
    category: 'citizen',
    description: 'सार्वजनिक सेवा, विकास निर्माण वा ढिलासुस्ती सम्बन्धी उजुरी तथा सुझाव अनलाइन दर्ता र प्रत्यक्ष समाधान ट्र्याकिङ।',
    icon: <AlertTriangle size={22} color="#f59e0b" />,
    path: '/complaints',
    isStaffOnly: false,
  },
  {
    id: 'citizen-businesses',
    title: 'व्यवसाय दर्ता तथा इजाजत',
    category: 'citizen',
    description: 'पालिका क्षेत्रभित्र नयाँ व्यवसाय, उद्योग, पसल दर्ता, नवीकरण तथा व्यवसाय कर चुक्ता प्रक्रिया।',
    icon: <Briefcase size={22} color="#3b82f6" />,
    path: '/businesses',
    isStaffOnly: false,
  },
  {
    id: 'citizen-recruitment',
    title: 'अनलाइन दरखास्त (e-Recruit)',
    category: 'citizen',
    description: 'पालिकाद्वारा विज्ञापित करार तथा सेवा पदहरूको अनलाइन विज्ञापन, दरखास्त फारम तथा परीक्षा सूचना।',
    icon: <GraduationCap size={22} color="#7c3aed" />,
    path: '/recruitment',
    isStaffOnly: false,
  },

  // ── 5. योजना, बजेट तथा आयोजना चक्र (Planning & Projects) - 4 ───────────────
  {
    id: 'plan-ppis',
    title: 'सम्पूर्ण आयोजना जीवनचक्र ३६०',
    category: 'projects',
    badge: 'PPIS/360',
    badgeColor: '#eab308',
    description: 'योजना छनोट, लागत अनुमान, सम्झौता, उपभोक्ता समिति गठन, किस्ता भुक्तानी र सम्पन्नताको पूर्ण जीवनचक्र।',
    icon: <FolderGit2 size={22} color="#eab308" />,
    path: '/projects',
    isStaffOnly: false,
  },
  {
    id: 'plan-annual',
    title: 'वार्षिक योजना तथा कार्यक्रम',
    category: 'projects',
    description: 'चालु आर्थिक वर्षका ८ वटै वडा र पालिकास्तरीय स्वीकृत विकास आयोजना तथा कार्यक्रमहरूको सूची।',
    icon: <FolderGit2 size={22} color="#0284c7" />,
    path: '/projects',
    isStaffOnly: false,
  },
  {
    id: 'plan-budget',
    title: 'बजेट तथा वित्तीय पारदर्शिता',
    category: 'projects',
    description: 'पालिकाको स्रोत-साधन बाँडफाँड, कुल बजेट, चालु/पुँजीगत खर्च, वित्तीय प्रगति र सार्वजनिक बजेट ट्र्याकर।',
    icon: <BarChart3 size={22} color="#10b981" />,
    path: '/budget-tracker',
    isStaffOnly: false,
  },
  {
    id: 'plan-procurement',
    title: 'ई-बोलपत्र तथा सार्वजनिक खरिद',
    category: 'projects',
    description: 'सार्वजनिक खरिद, बोलपत्र सूचना (Tender/EOI/RFQ), ठेक्का सम्झौता तथा आपूर्तिकर्ता विवरण।',
    icon: <FileText size={22} color="#6366f1" />,
    path: '/procurement',
    isStaffOnly: false,
  },

  // ── 6. भौतिक पूर्वाधार, नक्सा तथा सम्पत्ति (Infrastructure & Twin) - 5 ──────
  {
    id: 'infra-ebps',
    title: 'अनलाइन नक्सा पास प्रणाली (e-BPS)',
    category: 'infrastructure',
    badge: 'BIM/EBPS',
    badgeColor: '#06b6d4',
    description: 'भवन निर्माण अनुमति, अनलाइन नक्सा दर्ता, डिजिटल ड्रइङ चेक र निर्माण इजाजत ट्र्याकिङ।',
    icon: <Layers size={22} color="#06b6d4" />,
    path: '/building-permit',
    isStaffOnly: false,
  },
  {
    id: 'infra-3d-twin',
    title: '३डी/जीआईएस डिजिटल ट्विन',
    category: 'infrastructure',
    badge: '3D Twin',
    badgeColor: '#6366f1',
    description: 'पाँचपोखरी थाङपालको भौगोलिक धरातल, सडक, पुल, विद्यालय र भौतिक संरचनाहरूको ३डी डिजिटल ट्विन।',
    icon: <MapPin size={22} color="#6366f1" />,
    path: '/gis-map',
    isStaffOnly: false,
  },
  {
    id: 'infra-gis-cadastral',
    title: 'डिजिटल क्याडास्ट्रल नक्सा (GIS)',
    category: 'infrastructure',
    description: 'कित्तागत जग्गा नापी नक्सा, वडा सीमाना, सडक अधिकार क्षेत्र (ROW) र भूउपयोग क्षेत्र नक्साङ्कन।',
    icon: <Layers size={22} color="#10b981" />,
    path: '/gis-map',
    isStaffOnly: false,
  },
  {
    id: 'infra-pams',
    title: 'सार्वजनिक जिन्सी तथा सम्पत्ति (PAMS)',
    category: 'infrastructure',
    description: 'सार्वजनिक जग्गा, सरकारी भवन, सवारीसाधन, उपकरण तथा जिन्सी सामग्रीको डिजिटल लगत।',
    icon: <Database size={22} color="#f59e0b" />,
    path: '/login?redirect=/app/assets',
    isStaffOnly: true,
  },
  {
    id: 'infra-waste',
    title: 'फोहोरमैला व्यवस्थापन ट्विन',
    category: 'infrastructure',
    description: 'फोहोर संकलन रुट, डम्पिङ/ल्यान्डफिल साइट अनुगमन र सरसफाइ सवारी साधनको ट्र्याकिङ।',
    icon: <Trash2 size={22} color="#84cc16" />,
    path: '/waste-management',
    isStaffOnly: false,
  },

  // ── 7. आर्थिक प्रशासन तथा राजस्व (Revenue & Cooperatives) - 2 ──────────────
  {
    id: 'rev-tax',
    title: 'स्थानीय कर तथा राजस्व (e-Tax)',
    category: 'revenue',
    badge: 'e-Tax',
    badgeColor: '#f97316',
    description: 'सम्पत्ति कर, भूमिकर (मालपोत), व्यवसाय कर, बहाल कर र शुल्कको अनलाइन भुक्तानी र डिजिटल रसिद।',
    icon: <CreditCard size={22} color="#f97316" />,
    path: '/revenue',
    isStaffOnly: false,
  },
  {
    id: 'rev-copomis',
    title: 'सहकारी नियमन (COPOMIS)',
    category: 'revenue',
    description: 'पालिकाभित्रका बचत तथा ऋण सहकारी, बहुउद्देश्यीय सहकारीहरूको वित्तीय विवरण, नियमन र प्रतिवेदन।',
    icon: <Landmark size={22} color="#0284c7" />,
    path: '/cooperatives',
    isStaffOnly: false,
  },

  // ── 8. सामाजिक विकास तथा सेवा क्षेत्र (Social & Sectoral) - 13 ────────────
  {
    id: 'soc-ssis',
    title: 'सामाजिक सुरक्षा तथा घटना दर्ता (SSIS)',
    category: 'social',
    badge: 'SSIS',
    badgeColor: '#ec4899',
    description: 'ज्येष्ठ नागरिक, एकल महिला, अपाङ्गता भत्ता वितरण तथा जन्म, मृत्यु, विवाह घटना दर्ता व्यवस्थापन।',
    icon: <HeartHandshake size={22} color="#ec4899" />,
    path: '/vital-events',
    isStaffOnly: false,
  },
  {
    id: 'soc-esc',
    title: 'रोजगार सेवा केन्द्र (ESC)',
    category: 'social',
    description: 'प्रधानमन्त्री रोजगार कार्यक्रम, बेरोजगार सूचीकरण, स्थानीय सीप विकास तालिम र श्रम बैंक।',
    icon: <Briefcase size={22} color="#3b82f6" />,
    path: '/login?redirect=/app/employment',
    isStaffOnly: true,
  },
  {
    id: 'soc-hmis',
    title: 'स्वास्थ्य सेवा व्यवस्थापन (HMIS)',
    category: 'social',
    description: 'स्वास्थ्य चौकी, प्राथमिक अस्पताल, खोप कार्यक्रम, मातृशिशु सेवा, औषधि मौज्दात र स्वास्थ्य सूचक।',
    icon: <HeartPulse size={22} color="#ef4444" />,
    path: '/health',
    isStaffOnly: false,
  },
  {
    id: 'soc-iemis',
    title: 'शिक्षा तथा विद्यालय व्यवस्थापन (IEMIS)',
    category: 'social',
    description: 'सामुदायिक विद्यालय, विद्यार्थी-शिक्षक संख्या, छात्रवृत्ति, भौतिक पूर्वाधार र शैक्षिक नतिजा।',
    icon: <GraduationCap size={22} color="#8b5cf6" />,
    path: '/education',
    isStaffOnly: false,
  },
  {
    id: 'soc-farmer',
    title: 'कृषक प्रोफाइल तथा अनुदान',
    category: 'social',
    description: 'स्थानीय किसानहरूको डिजिटल परिचयपत्र, कृषि यन्त्र/बीउबिजन अनुदान र बाली उत्पादन लगत।',
    icon: <Sprout size={22} color="#16a34a" />,
    path: '/agriculture',
    isStaffOnly: false,
  },
  {
    id: 'soc-agri',
    title: 'कृषि तथा पशुपन्छी व्यवस्थापन',
    category: 'social',
    description: 'कृषि पकेट क्षेत्र, पशुपालन, उत्पादन संकलन केन्द्र र कृषि बजार मूल्य सूचना प्रणाली।',
    icon: <Sprout size={22} color="#15803d" />,
    path: '/agriculture',
    isStaffOnly: false,
  },
  {
    id: 'soc-vet',
    title: 'भेटेरिनरी तथा औषधि व्यवस्थापन',
    category: 'social',
    description: 'पशुपन्छी खोप, पशु स्वास्थ्य उपचार सेवा, औषधिको मौज्दात र प्राविधिक परामर्श।',
    icon: <Pill size={22} color="#0d9488" />,
    path: '/vet-medicine',
    isStaffOnly: false,
  },
  {
    id: 'soc-disaster',
    title: 'विपद् जोखिम व्यवस्थापन',
    category: 'social',
    description: 'बाढी, पहिरो, भूकम्प पूर्वसूचना प्रणाली, मेलम्ची नदी जलसतह सेन्सर र आपत्कालीन उद्धार कार्य।',
    icon: <AlertTriangle size={22} color="#dc2626" />,
    path: '/disaster',
    isStaffOnly: false,
  },
  {
    id: 'soc-tourism',
    title: 'पर्यटन तथा सम्पदा डिजिटल ट्विन',
    category: 'social',
    description: 'पाँचपोखरी कुण्ड, आमा याङ्ग्री, ऐतिहासिक पदमार्ग, होमस्टे र स्थानीय पर्यटकीय सम्पदाहरूको ३डी गाइड।',
    icon: <Compass size={22} color="#0284c7" />,
    path: '/tourism',
    isStaffOnly: false,
  },
  {
    id: 'soc-library',
    title: 'डिजिटल पुस्तकालय',
    category: 'social',
    description: 'शैक्षिक पुस्तक, स्थानीय अनुसन्धान प्रतिवेदन, पाठ्यसामग्री र ई-पुस्तकहरूको खुला डिजिटल संग्रह।',
    icon: <BookOpen size={22} color="#7c3aed" />,
    path: '/library',
    isStaffOnly: false,
  },
  {
    id: 'soc-museum',
    title: 'सांस्कृतिक सङ्ग्रहालय',
    category: 'social',
    description: 'ह्योल्मो तथा तामाङ कला, परम्परागत भेषभूषा, पुरातात्विक सामग्री र सांस्कृतिक सम्पदा ग्यालरी।',
    icon: <Landmark size={22} color="#b45309" />,
    path: '/museum',
    isStaffOnly: false,
  },
  {
    id: 'soc-legal',
    title: 'कानुन तथा ऐन संगालो',
    category: 'social',
    description: 'गाउँसभाबाट पारित ऐन, कानुन, नियमावली, कार्यविधि तथा राजपत्रहरूको आधिकारिक संग्रह।',
    icon: <BookMarked size={22} color="#475569" />,
    path: '/legal-repository',
    isStaffOnly: false,
  },
  {
    id: 'soc-inclusion',
    title: 'सामाजिक समावेशीकरण',
    category: 'social',
    description: 'महिला, बालबालिका, दलित, जनजाति तथा सीमान्तकृत समुदायको उत्थान, सीप विकास र सशक्तीकरण।',
    icon: <HeartHandshake size={22} color="#db2777" />,
    path: '/social-inclusion',
    isStaffOnly: false,
  },

  // ── 9. सुरक्षा, अधिकार तथा प्रणाली नियन्त्रण (Security & Admin) - 4 ─────────
  {
    id: 'sec-rbac',
    title: 'भूमिका तथा अधिकार म्याट्रिक्स',
    category: 'admin',
    badge: 'RBAC',
    badgeColor: '#3b82f6',
    description: 'कर्मचारी, शाखा प्रमुख तथा प्रशासकहरूको भूमिका, कार्य-अधिकार र सुरक्षित पहुँच नियन्त्रण।',
    icon: <Shield size={22} color="#3b82f6" />,
    path: '/login?redirect=/app/admin',
    isStaffOnly: true,
  },
  {
    id: 'sec-config',
    title: 'पालिका प्रणाली कन्फिगरेसन',
    category: 'admin',
    description: 'पालिकाको नाम, लोगो, वडा संरचना, वित्तीय वर्ष, SMS/Email गेटवे तथा प्रणाली सेटिङ।',
    icon: <Settings size={22} color="#64748b" />,
    path: '/login?redirect=/app/palika-settings',
    isStaffOnly: true,
  },
  {
    id: 'sec-faq',
    title: 'मद्दत तथा प्रयोगकर्ता पुस्तिका',
    category: 'admin',
    description: 'डिजिटल प्रणाली प्रयोग गर्ने विधि, बारम्बार सोधिने प्रश्नहरू (FAQ) र नागरिक सहायता मार्गदर्शिका।',
    icon: <HelpCircle size={22} color="#059669" />,
    path: '/faq-help',
    isStaffOnly: false,
  },
  {
    id: 'sec-super-admin',
    title: 'सुपर एडमिन कन्सोल',
    category: 'admin',
    badge: 'Super Admin',
    badgeColor: '#ef4444',
    description: 'मल्टी-टिनेन्ट प्रणाली नियन्त्रण, डाटाबेस ब्याकअप, इन्फ्रास्ट्रक्चर हेल्थ तथा सुपर प्रशासक लग्स।',
    icon: <Shield size={22} color="#ef4444" />,
    path: '/login?redirect=/super-admin',
    isStaffOnly: true,
  },
];

export const PublicModulesDirectory: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredModules = useMemo(() => {
    return ALL_53_MODULES.filter((mod) => {
      const matchesCategory = selectedCategory === 'all' || mod.category === selectedCategory;
      const q = searchQuery.trim().toLowerCase();
      if (!q) return matchesCategory;

      const matchesQuery =
        mod.title.toLowerCase().includes(q) ||
        mod.description.toLowerCase().includes(q) ||
        (mod.badge && mod.badge.toLowerCase().includes(q));

      return matchesCategory && matchesQuery;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <section
      id="palika-modules-directory"
      style={{
        width: '100%',
        maxWidth: '100%',
        margin: '3rem 0',
        padding: '0 0.5rem',
      }}
    >
      {/* ── HEADER BANNER ── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0d1f3c 0%, #1e3a8a 50%, #0f172a 100%)',
          borderRadius: '24px',
          padding: '3rem 2rem',
          color: '#ffffff',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 20px 40px rgba(13, 31, 60, 0.25)',
          marginBottom: '2.5rem',
        }}
      >
        {/* Subtle decorative glow */}
        <div
          style={{
            position: 'absolute',
            top: '-50px',
            right: '-50px',
            width: '260px',
            height: '260px',
            background: 'radial-gradient(circle, rgba(56,189,248,0.25) 0%, rgba(56,189,248,0) 70%)',
            borderRadius: '50%',
            pointerEvents: 'none',
          }}
        />

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: '850px', margin: '0 auto' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(8px)',
              padding: '0.4rem 1.1rem',
              borderRadius: '30px',
              fontSize: '0.85rem',
              fontWeight: 700,
              color: '#38bdf8',
              marginBottom: '1rem',
            }}
          >
            <Sparkles size={16} />
            <span>एकीकृत पालिका डिजिटल आर्किटेक्चर · ९ क्षेत्रगत आयाम (Domains)</span>
          </div>

          <h2
            style={{
              fontSize: 'clamp(1.8rem, 3.8vw, 2.7rem)',
              fontWeight: 800,
              margin: '0 0 1rem',
              lineHeight: 1.25,
            }}
          >
            पालिकाका सम्पूर्ण <span style={{ color: '#38bdf8' }}>५३ वटै डिजिटल मोड्युलहरू</span>
          </h2>

          <p
            style={{
              fontSize: '1rem',
              color: '#cbd5e1',
              lineHeight: 1.6,
              margin: '0 0 2rem',
            }}
          >
            पाँचपोखरी थाङपाल गाउँपालिकाको सार्वजनिक नागरिक सेवा, ३डी डिजिटल ट्विन, प्रशासनिक ई-अफिस, बजेट तथा योजना व्यवस्थापनलाई क्षेत्रगत रुपमा एकै ठाउँबाट हेर्नुहोस् र उपयोग गर्नुहोस्।
          </p>

          {/* Quick Metrics Bar */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '1rem',
              padding: '1.25rem',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(6px)',
            }}
          >
            <div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#38bdf8' }}>९</div>
              <div style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 600 }}>क्षेत्रगत आयाम</div>
            </div>
            <div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#4ade80' }}>३६+</div>
              <div style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 600 }}>नागरिक खुला सेवा</div>
            </div>
            <div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fbbf24' }}>१७</div>
              <div style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 600 }}>प्रशासनिक ई-गभर्नेन्स</div>
            </div>
            <div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#c084fc' }}>१००%</div>
              <div style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 600 }}>डिजिटल ट्विन इन्टिग्रेटेड</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── SEARCH & FILTER CONTROLS ── */}
      <div style={{ marginBottom: '2rem' }}>
        {/* Search Input */}
        <div
          style={{
            maxWidth: '680px',
            margin: '0 auto 1.5rem',
            position: 'relative',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#ffffff',
              borderRadius: '50px',
              padding: '0.5rem 0.75rem 0.5rem 1.4rem',
              boxShadow: '0 4px 18px rgba(0,0,0,0.06)',
              border: '1px solid #cbd5e1',
            }}
          >
            <Search size={20} color="#64748b" style={{ flexShrink: 0, marginRight: '0.6rem' }} />
            <input
              type="text"
              placeholder="मोड्युलको नाम, सेवा वा शाखा खोज्नुहोस् (उदा: नक्सा, सिफारिस, बजेट, स्वास्थ्य)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                fontSize: '0.98rem',
                color: '#0f172a',
                fontFamily: 'inherit',
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  border: 'none',
                  background: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  padding: '0.2rem 0.6rem',
                }}
              >
                हटाउनुहोस्
              </button>
            )}
          </div>
        </div>

        {/* Sector Tabs (Horizontal scroll on mobile) */}
        <div
          style={{
            display: 'flex',
            gap: '0.6rem',
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <button
            onClick={() => setSelectedCategory('all')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.6rem 1.1rem',
              borderRadius: '30px',
              border: selectedCategory === 'all' ? '2px solid #0284c7' : '1px solid #e2e8f0',
              backgroundColor: selectedCategory === 'all' ? '#0284c7' : '#ffffff',
              color: selectedCategory === 'all' ? '#ffffff' : '#475569',
              fontWeight: 700,
              fontSize: '0.86rem',
              cursor: 'pointer',
              boxShadow: selectedCategory === 'all' ? '0 4px 12px rgba(2, 132, 199, 0.25)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            <Filter size={15} />
            <span>सबै मोड्युलहरू</span>
            <span
              style={{
                backgroundColor: selectedCategory === 'all' ? 'rgba(255,255,255,0.25)' : '#f1f5f9',
                color: selectedCategory === 'all' ? '#ffffff' : '#64748b',
                padding: '1px 7px',
                borderRadius: '12px',
                fontSize: '0.75rem',
              }}
            >
              ५३
            </span>
          </button>

          {SECTOR_DOMAINS.map((domain) => {
            const isSelected = selectedCategory === domain.id;
            return (
              <button
                key={domain.id}
                onClick={() => setSelectedCategory(domain.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.6rem 1rem',
                  borderRadius: '30px',
                  border: isSelected ? `2px solid ${domain.color}` : '1px solid #e2e8f0',
                  backgroundColor: isSelected ? domain.color : '#ffffff',
                  color: isSelected ? '#ffffff' : '#334155',
                  fontWeight: isSelected ? 700 : 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  boxShadow: isSelected ? `0 4px 12px ${domain.color}40` : 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                <span>{domain.shortTitle}</span>
                <span
                  style={{
                    backgroundColor: isSelected ? 'rgba(255,255,255,0.25)' : '#f1f5f9',
                    color: isSelected ? '#ffffff' : '#64748b',
                    padding: '1px 6px',
                    borderRadius: '10px',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                  }}
                >
                  {domain.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── RESULTS COUNT INFO ── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          margin: '0 0.5rem 1.25rem',
          color: '#64748b',
          fontSize: '0.88rem',
          fontWeight: 600,
        }}
      >
        <span>
          कुल <strong style={{ color: '#0f172a' }}>{filteredModules.length}</strong> मोड्युलहरू सूचीकृत
          {selectedCategory !== 'all' && (
            <span style={{ color: '#0284c7', marginLeft: '6px' }}>
              ({SECTOR_DOMAINS.find((s) => s.id === selectedCategory)?.title})
            </span>
          )}
        </span>
        {searchQuery && (
          <span style={{ fontSize: '0.82rem', color: '#d97706' }}>
            खोज शब्द: "{searchQuery}"
          </span>
        )}
      </div>

      {/* ── MODULES CARD GRID ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {filteredModules.map((item) => {
          const domain = SECTOR_DOMAINS.find((d) => d.id === item.category);

          return (
            <div
              key={item.id}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.07)';
                e.currentTarget.style.borderColor = domain?.color || '#0284c7';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.03)';
                e.currentTarget.style.borderColor = '#e2e8f0';
              }}
            >
              <div>
                {/* Header row: Icon & Domain Tag */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '1rem',
                  }}
                >
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '12px',
                      backgroundColor: `${domain?.color || '#0284c7'}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {item.icon}
                  </div>

                  <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                    {item.badge && (
                      <span
                        style={{
                          backgroundColor: item.badgeColor || '#0284c7',
                          color: '#ffffff',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '6px',
                          textTransform: 'uppercase',
                        }}
                      >
                        {item.badge}
                      </span>
                    )}

                    <span
                      style={{
                        backgroundColor: '#f1f5f9',
                        color: '#475569',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        padding: '2px 7px',
                        borderRadius: '6px',
                      }}
                    >
                      {domain?.shortTitle}
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h3
                  style={{
                    fontSize: '1.08rem',
                    fontWeight: 700,
                    color: '#0f172a',
                    margin: '0 0 0.5rem',
                    lineHeight: 1.35,
                  }}
                >
                  {item.title}
                </h3>

                {/* Description */}
                <p
                  style={{
                    fontSize: '0.85rem',
                    color: '#64748b',
                    lineHeight: 1.55,
                    margin: '0 0 1.25rem',
                  }}
                >
                  {item.description}
                </p>
              </div>

              {/* Action & Access Footer */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '0.9rem',
                  borderTop: '1px solid #f1f5f9',
                  gap: '0.75rem',
                }}
              >
                {/* Access indicator */}
                {item.isStaffOnly ? (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      fontSize: '0.76rem',
                      fontWeight: 600,
                      color: '#d97706',
                      backgroundColor: '#fef3c7',
                      padding: '3px 8px',
                      borderRadius: '6px',
                    }}
                  >
                    <Lock size={12} />
                    कर्मचारी पहुँच
                  </span>
                ) : (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      fontSize: '0.76rem',
                      fontWeight: 600,
                      color: '#15803d',
                      backgroundColor: '#dcfce7',
                      padding: '3px 8px',
                      borderRadius: '6px',
                    }}
                  >
                    <CheckCircle2 size={12} />
                    नागरिक खुला
                  </span>
                )}

                {/* Navigation Button */}
                {item.isStaffOnly ? (
                  <Link
                    to={item.path}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      backgroundColor: '#f8fafc',
                      color: '#334155',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      padding: '0.45rem 0.9rem',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      textDecoration: 'none',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#0f172a';
                      e.currentTarget.style.color = '#ffffff';
                      e.currentTarget.style.borderColor = '#0f172a';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#f8fafc';
                      e.currentTarget.style.color = '#334155';
                      e.currentTarget.style.borderColor = '#cbd5e1';
                    }}
                  >
                    <span>कर्मचारी लगइन</span>
                    <ChevronRight size={14} />
                  </Link>
                ) : (
                  <Link
                    to={item.path}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      backgroundColor: '#0284c7',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '0.45rem 0.95rem',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      textDecoration: 'none',
                      boxShadow: '0 2px 6px rgba(2, 132, 199, 0.25)',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#0369a1';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#0284c7';
                    }}
                  >
                    <span>खोल्नुहोस्</span>
                    <ChevronRight size={14} />
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredModules.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '3rem 1rem',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px dashed #cbd5e1',
            color: '#64748b',
          }}
        >
          <Search size={36} color="#94a3b8" style={{ marginBottom: '0.75rem' }} />
          <h4 style={{ fontSize: '1.1rem', color: '#0f172a', margin: '0 0 0.5rem' }}>
            कुनै मोड्युल फेला परेन
          </h4>
          <p style={{ fontSize: '0.9rem', margin: '0 0 1rem' }}>
            तपाईंको खोज शब्द "{searchQuery}" सँग मेल खाने कुनै मोड्युल भेटिएन।
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            style={{
              padding: '0.5rem 1.2rem',
              backgroundColor: '#0284c7',
              color: '#ffffff',
              borderRadius: '8px',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            सबै ५३ मोड्युल देखाउनुहोस्
          </button>
        </div>
      )}
    </section>
  );
};
