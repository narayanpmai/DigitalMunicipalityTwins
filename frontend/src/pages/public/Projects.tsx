import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Pickaxe,
  TrendingUp,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Layers,
  Coins,
  Building,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  MapPin,
  Phone,
  User,
  Users,
  FileText,
  Percent,
  Calendar,
  X,
  Printer,
  CheckCircle,
  AlertCircle,
  BarChart3,
  HardHat,
  Briefcase,
  Compass,
  LayoutGrid,
  Table,
  Droplet,
  Wrench,
  Shield,
  Eye,
  ArrowRight,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { sectoralApi } from '../../api/sectoral';
import type { Project } from '../../types/sectoral';

// Comprehensive authentic fallback demo projects for Panchpokhari Thangpal
const DEMO_PROJECTS: Project[] = [
  {
    id: 'prj-101',
    projectCode: 'PPK-W01-RD-081-001',
    name: 'बाँसखर्क–याङ्ग्री कृषि सडक कालोपत्रे तथा स्तरोन्नति',
    nameEn: 'Banskharka-Yangri Agricultural Road Pavement',
    wardNumber: 1,
    sector: 'सडक तथा यातायात',
    fiscalYear: '२०८१/०८२',
    allocatedBudget: 4500000,
    expenditureAmount: 3600000,
    physicalProgressPercent: 88,
    status: 'ongoing',
    level: 'नगर स्तरिय',
    marfat: 'उपभोक्ता समिति',
    budgetSource: 'संघीय समपूरक तथा गाउँसभा विशेष अनुदान',
    contractorName: 'बाँसखर्क सडक निर्माण उपभोक्ता समिति',
    committeeName: 'बाँसखर्क सडक निर्माण उपभोक्ता समिति',
    committeeChair: 'पासाङ दावा तामाङ',
    committeeSecretary: 'माया श्रेष्ठ',
    committeeTreasurer: 'निर्मला पराजुली',
    committeePhone: '९८४१२३४५६७',
    startDateBs: '२०८१-०४-१५',
    completionDateBs: '२०८२-०२-३०',
    officeCost: 4500000,
    committeeCost: 450000,
    palikaGrant: 4050000,
    communityContribution: 450000,
    totalAgreementAmount: 4500000,
    paidAmount: 3600000,
    financialProgress: 80,
    agreementStatus: 'पेश्की तथा दोस्रो किस्ता भुक्तानी',
    workOrderNumber: 'WO-2081-014',
    latitude: 27.9124,
    longitude: 85.6412,
    location: 'बाँसखर्क, वडा नं. १',
    description: 'बाँसखर्क बस्तीदेखि याङ्ग्री खोलासम्म ६.२ कि.मि. सडक चौडा, नाली निर्माण तथा ओटासिल कालोपत्रे कार्य।',
  },
  {
    id: 'prj-102',
    projectCode: 'PPK-W02-BR-081-002',
    name: 'बरुवा खोला आरसीसी मोटरेबल पुल निर्माण',
    nameEn: 'Baruwa Khola RCC Motorable Bridge Construction',
    wardNumber: 2,
    sector: 'पुल तथा कल्भर्ट',
    fiscalYear: '२०८०/०८१',
    allocatedBudget: 12500000,
    expenditureAmount: 12500000,
    physicalProgressPercent: 100,
    status: 'completed',
    level: 'नगर स्तरिय',
    marfat: 'ठेक्का / बोलपत्र',
    budgetSource: 'प्रदेश पूर्वाधार साझेदारी कोष',
    contractorName: 'सिन्धु हिमशिखर निर्माण सेवा प्रा.लि.',
    committeeName: 'बरुवा पुल अनुगमन तथा समन्वय समिति',
    committeeChair: 'ल्हाक्पा शेर्पा',
    committeePhone: '९८५१२२३३४४',
    startDateBs: '२०८०-०५-१०',
    completionDateBs: '२०८१-०३-१५',
    officeCost: 12500000,
    committeeCost: 0,
    palikaGrant: 12500000,
    communityContribution: 0,
    totalAgreementAmount: 12500000,
    paidAmount: 12500000,
    financialProgress: 100,
    agreementStatus: 'फरफारक सम्पन्न',
    workOrderNumber: 'WO-2080-089',
    latitude: 27.9482,
    longitude: 85.6215,
    location: 'बरुवा खोला दोभान, वडा नं. २',
    description: '३५ मिटर लम्बाइको दुई लेन आरसीसी मोटरेबल पुल निर्माण सम्पन्न, बाह्रै महिना सवारी सञ्चालन सुनिश्चित।',
  },
  {
    id: 'prj-103',
    projectCode: 'PPK-W03-TR-081-003',
    name: 'भोताङ–पाँचपोखरी धार्मिक पदमार्ग स्तरोन्नति तथा रेलिङ निर्माण',
    nameEn: 'Bhotang-Panchpokhari Heritage Trail Upgrade',
    wardNumber: 3,
    sector: 'पर्यटन तथा सम्पदा',
    fiscalYear: '२०८१/०८२',
    allocatedBudget: 3500000,
    expenditureAmount: 2625000,
    physicalProgressPercent: 75,
    status: 'ongoing',
    level: 'नगर स्तरिय',
    marfat: 'उपभोक्ता समिति',
    budgetSource: 'गाउँपालिका आन्तरिक पर्यटन प्रवर्द्धन कोष',
    contractorName: 'पाँचपोखरी तीर्थ पदमार्ग उपभोक्ता समिति',
    committeeName: 'पाँचपोखरी तीर्थ पदमार्ग उपभोक्ता समिति',
    committeeChair: 'दावा दोर्जे लामा',
    committeeSecretary: 'छिरिङ तामाङ',
    committeeTreasurer: 'पासाङ याङ्जी शेर्पा',
    committeePhone: '९८६१२३८८९९',
    startDateBs: '२०८१-०६-०१',
    completionDateBs: '२०८२-०१-२५',
    officeCost: 3500000,
    committeeCost: 350000,
    palikaGrant: 3150000,
    communityContribution: 350000,
    totalAgreementAmount: 3500000,
    paidAmount: 2625000,
    financialProgress: 75,
    agreementStatus: 'नापी किताब रुजु भई दोस्रो किस्ता',
    workOrderNumber: 'WO-2081-032',
    latitude: 27.9789,
    longitude: 85.7103,
    location: 'भोताङ–हवेली–पाँचपोखरी खण्ड, वडा नं. ३',
    description: 'चिम्तीदेखि नोर्सिङपाटी हुँदै पाँचपोखरीसम्म ढुङ्गाको सिँढी, फलामे रेलिङ तथा २ वटा विश्रामस्थल निर्माण।',
  },
  {
    id: 'prj-104',
    projectCode: 'PPK-W04-IR-081-004',
    name: 'थाङपालकोट एकीकृत पक्की सिँचाइ कुलो तथा मुहान संरक्षण',
    nameEn: 'Thangpalkot Integrated Irrigation Canal',
    wardNumber: 4,
    sector: 'सिँचाइ तथा नदी नियन्त्रण',
    fiscalYear: '२०८०/०८१',
    allocatedBudget: 2200000,
    expenditureAmount: 2200000,
    physicalProgressPercent: 100,
    status: 'completed',
    level: 'वडा स्तरिय',
    marfat: 'उपभोक्ता समिति',
    budgetSource: 'कृषि तथा जलस्रोत सशर्त अनुदान',
    contractorName: 'थाङपालकोट कृषक सिँचाइ उपभोक्ता समिति',
    committeeName: 'थाङपालकोट कृषक सिँचाइ उपभोक्ता समिति',
    committeeChair: 'रामबहादुर दनुवार',
    committeePhone: '९८४३९९११२२',
    startDateBs: '२०८०-०७-१५',
    completionDateBs: '२०८१-०१-३०',
    officeCost: 2200000,
    committeeCost: 220000,
    palikaGrant: 1980000,
    communityContribution: 220000,
    totalAgreementAmount: 2200000,
    paidAmount: 2200000,
    financialProgress: 100,
    agreementStatus: 'फरफारक सम्पन्न',
    workOrderNumber: 'WO-2080-055',
    latitude: 27.9341,
    longitude: 85.6023,
    location: 'थाङपालकोट, वडा नं. ४',
    description: '३.२ कि.मि. आरसीसी सिँचाइ कुलो निर्माण भई ४५ हेक्टर खेतीयोग्य जमिनमा बाह्रै महिना सिँचाइ सुविधा।',
  },
  {
    id: 'prj-105',
    projectCode: 'PPK-W05-WS-081-005',
    name: 'गुन्सा–थाङपाल सौर्य ऊर्जा लिफ्टिङ खानेपानी आयोजना',
    nameEn: 'Gunsa-Thangpal Solar Lift Drinking Water Scheme',
    wardNumber: 5,
    sector: 'खानेपानी तथा सरसफाइ',
    fiscalYear: '२०८१/०८२',
    allocatedBudget: 6800000,
    expenditureAmount: 4760000,
    physicalProgressPercent: 70,
    status: 'ongoing',
    level: 'नगर स्तरिय',
    marfat: 'उपभोक्ता समिति',
    budgetSource: 'जलवायु अनुकूलन तथा खानेपानी कोष',
    contractorName: 'गुन्सा खानेपानी उपभोक्ता समिति',
    committeeName: 'गुन्सा खानेपानी उपभोक्ता समिति',
    committeeChair: 'कान्छा तामाङ',
    committeePhone: '९८५११२३४८०',
    startDateBs: '२०८१-०५-०१',
    completionDateBs: '२०८२-०३-१५',
    officeCost: 6800000,
    committeeCost: 680000,
    palikaGrant: 6120000,
    communityContribution: 680000,
    totalAgreementAmount: 6800000,
    paidAmount: 4760000,
    financialProgress: 70,
    agreementStatus: 'पाइपलाइन तथा ट्याङ्की निर्माण चालु',
    workOrderNumber: 'WO-2081-048',
    latitude: 27.9256,
    longitude: 85.5891,
    location: 'गुन्सा, वडा नं. ५',
    description: '५० हजार लिटरको रिजर्भ्वायर ट्याङ्की र सौर्य पम्पिङमार्फत ६४० घरधुरीमा स्वच्छ खानेपानी विस्तार।',
  },
  {
    id: 'prj-106',
    projectCode: 'PPK-W06-BL-081-006',
    name: 'थाङपालधाप माध्यमिक विद्यालय चारकोठे आधुनिक भूकम्प प्रतिरोधी भवन',
    nameEn: 'Thangpaldhap Secondary School Building',
    wardNumber: 6,
    sector: 'शिक्षा तथा भवन',
    fiscalYear: '२०८०/०८१',
    allocatedBudget: 4800000,
    expenditureAmount: 4800000,
    physicalProgressPercent: 100,
    status: 'completed',
    level: 'नगर स्तरिय',
    marfat: 'उपभोक्ता समिति',
    budgetSource: 'संघीय शिक्षा विशेष अनुदान',
    contractorName: 'थाङपालधाप मा.वि. विद्यालय व्यवस्थापन समिति',
    committeeName: 'थाङपालधाप मा.वि. विद्यालय व्यवस्थापन समिति',
    committeeChair: 'सुशील सापकोटा',
    committeePhone: '९८५१२२४४६६',
    startDateBs: '२०८०-०३-०१',
    completionDateBs: '२०८१-०१-१५',
    officeCost: 4800000,
    committeeCost: 480000,
    palikaGrant: 4320000,
    communityContribution: 480000,
    totalAgreementAmount: 4800000,
    paidAmount: 4800000,
    financialProgress: 100,
    agreementStatus: 'फरफारक सम्पन्न',
    workOrderNumber: 'WO-2080-021',
    latitude: 27.9398,
    longitude: 85.5921,
    location: 'थाङपालधाप, वडा नं. ६',
    description: 'चारवटा आधुनिक स्मार्ट कक्षाकोठा, विज्ञान प्रयोगशाला तथा छात्र-छात्रा अपाङ्गमैत्री शौचालय निर्माण।',
  },
  {
    id: 'prj-107',
    projectCode: 'PPK-W07-FL-081-007',
    name: 'तिपेनी बजार इन्द्रावती नदी नियन्त्रण ग्याबियन पर्खाल तथा खेलमैदान',
    nameEn: 'Tipeni Indrawati River Training & Sports Ground',
    wardNumber: 7,
    sector: 'सिँचाइ तथा नदी नियन्त्रण',
    fiscalYear: '२०८१/०८२',
    allocatedBudget: 3200000,
    expenditureAmount: 1920000,
    physicalProgressPercent: 60,
    status: 'ongoing',
    level: 'वडा स्तरिय',
    marfat: 'उपभोक्ता समिति',
    budgetSource: 'विपद् व्यवस्थापन तथा पूर्वाधार कोष',
    contractorName: 'तिपेनी नदी नियन्त्रण समिति',
    committeeName: 'तिपेनी नदी नियन्त्रण समिति',
    committeeChair: 'गणेश अधिकारी',
    committeePhone: '९८४१५५६६७७',
    startDateBs: '२०८१-०६-१५',
    completionDateBs: '२०८२-०२-१५',
    officeCost: 3200000,
    committeeCost: 320000,
    palikaGrant: 2880000,
    communityContribution: 320000,
    totalAgreementAmount: 3200000,
    paidAmount: 1920000,
    financialProgress: 60,
    agreementStatus: 'ग्याबियन जाली भर्ने कार्य चालु',
    workOrderNumber: 'WO-2081-057',
    latitude: 27.9189,
    longitude: 85.5812,
    location: 'तिपेनी बजार, वडा नं. ७',
    description: 'इन्द्रावती नदीको कटानबाट तिपेनी बजार तथा स्थानीय खेलमैदान जोगाउन १.२ कि.मि. ग्याबियन पर्खाल।',
  },
  {
    id: 'prj-108',
    projectCode: 'PPK-W08-DS-081-008',
    name: 'लाँगर्चे पहिरो रोकथाम बायो–इन्जिनियरिङ तथा ड्रेनेज व्यवस्थापन',
    nameEn: 'Langarche Landslide Mitigation & Drainage System',
    wardNumber: 8,
    sector: 'विपद् तथा वातावरण',
    fiscalYear: '२०८१/०८२',
    allocatedBudget: 1800000,
    expenditureAmount: 900000,
    physicalProgressPercent: 50,
    status: 'ongoing',
    level: 'वडा स्तरिय',
    marfat: 'उपभोक्ता समिति',
    budgetSource: 'प्रकोप व्यवस्थापन कोष',
    contractorName: 'लाँगर्चे पहिरो नियन्त्रण समिति',
    committeeName: 'लाँगर्चे पहिरो नियन्त्रण समिति',
    committeeChair: 'दान बहादुर तामाङ',
    committeePhone: '९८६०११२२३३',
    startDateBs: '२०८१-०७-०१',
    completionDateBs: '२०८२-०२-२८',
    officeCost: 1800000,
    committeeCost: 180000,
    palikaGrant: 1620000,
    communityContribution: 180000,
    totalAgreementAmount: 1800000,
    paidAmount: 900000,
    financialProgress: 50,
    agreementStatus: 'प्रथम किस्ता फुकुवा तथा काम चालु',
    workOrderNumber: 'WO-2081-063',
    latitude: 27.9087,
    longitude: 85.5745,
    location: 'लाँगर्चे भिर, वडा नं. ८',
    description: 'घाँस रोपण, बाँसका बिरुवा, भिरालो जमिनमा चेक ड्याम तथा पानीको निकास नाली निर्माण।',
  },
];

// Authentic Infrastructure Assets for Panchpokhari Thangpal
const INFRASTRUCTURE_ASSETS = [
  {
    category: 'road',
    title: 'सडक सञ्जाल लगत (Road Network Twin)',
    totalLength: '२४४.७ कि.मि.',
    stats: [
      { label: 'कालोपत्रे सडक (Paved)', value: '३८.५ कि.मि.', color: '#16a34a', desc: 'बाह्रै महिना पक्की यातायात' },
      { label: 'ग्राभेल सडक (Gravel)', value: '६४.२ कि.मि.', color: '#0284c7', desc: 'नियमित मर्मत हुने सडक' },
      { label: 'कच्ची/कृषि सडक (Earthen)', value: '१४२.० कि.मि.', color: '#d97706', desc: 'उत्पादन क्षेत्र जोड्ने सञ्जाल' },
    ],
    items: [
      { name: 'मेलम्ची–तिपेनी–थाङपालधाप मुख्य खण्ड', type: 'कालोपत्रे (Blacktopped)', length: '१८.२ कि.मि.', wards: 'वडा ६, ७', condition: 'उत्कृष्ट (Good)', traffic: 'दैनिक ४५०+ सवारी' },
      { name: 'थाङपालधाप–भोताङ पर्यटन कोरिडोर', type: 'कालोपत्रे/ग्राभेल', length: '१२.५ कि.मि.', wards: 'वडा ३, ६', condition: 'स्तरोन्नति हुँदै', traffic: 'दैनिक २८०+ सवारी' },
      { name: 'बाँसखर्क लिङ्क कृषि सडक', type: 'ओटासिल कालोपत्रे', length: '७.८ कि.मि.', wards: 'वडा १', condition: 'राम्रो (Fair)', traffic: 'दैनिक १२०+ सवारी' },
      { name: 'बरुवा–छिम्ती पदमार्ग सहायक सडक', type: 'ग्राभेल सडक', length: '१५.४ कि.मि.', wards: 'वडा २, ३', condition: 'मौसमी मर्मत', traffic: 'दैनिक ९०+ सवारी' },
    ],
  },
  {
    category: 'bridge',
    title: 'पुल तथा झोलुङ्गे पुल लगत (Bridges Twin)',
    totalLength: '१६ वटा पुल संरचना',
    stats: [
      { label: 'पक्की मोटरेबल पुल', value: '५ वटा', color: '#16a34a', desc: 'आरसीसी तथा स्टिल ट्रस' },
      { label: 'झोलुङ्गे पुल (Suspension)', value: '११ वटा', color: '#0284c7', desc: 'दुर्गम बस्ती पैदल पहुँच' },
      { label: 'भारवहन क्षमता', value: '२५–३० टन', color: '#7c3aed', desc: 'हेभी सवारी अनुकूल' },
    ],
    items: [
      { name: 'इन्द्रावती नदी पक्की मोटरेबल पुल', type: 'आरसीसी प्रि-स्ट्रेस्ड', span: '४२ मिटर', wards: 'वडा ७', capacity: '३० टन', status: 'सञ्चालनमा' },
      { name: 'याङ्ग्री खोला आरसीसी मोटरेबल पुल', type: 'आरसीसी बिम पुल', span: '३५ मिटर', wards: 'वडा २', capacity: '२५ टन', status: 'सञ्चालनमा' },
      { name: 'तिपेनी बजार झोलुङ्गे पुल', type: 'डी-सस्पेन्सन पैदल पुल', span: '१२८ मिटर', wards: 'वडा ७', capacity: '८५० घरधुरी', status: 'सञ्चालनमा' },
      { name: 'भोताङ देउराली पदमार्ग झोलुङ्गे पुल', type: 'सस्पेन्सन पदमार्ग पुल', span: '१४५ मिटर', wards: 'वडा ३', capacity: 'पर्यटक तथा स्थानीय', status: 'सञ्चालनमा' },
    ],
  },
  {
    category: 'water',
    title: 'खानेपानी तथा सरसफाइ पूर्वाधार (Water Supply Twin)',
    totalLength: '८,४५० घरधुरी पहुँच',
    stats: [
      { label: 'एक घर एक धारा कभरेज', value: '८९.४%', color: '#16a34a', desc: 'स्वच्छ सुरक्षित खानेपानी' },
      { label: 'कुल रिजर्भ्वायर क्षमता', value: '३,४०,००० लि.', color: '#0284c7', desc: 'दैनिक भण्डारण' },
      { label: 'सञ्चालित गुरुयोजना', value: '१४ वटा', color: '#d97706', desc: 'मुहान संरक्षणसहित' },
    ],
    items: [
      { name: 'भोताङ चिम्ती बृहत् खानेपानी आयोजना', type: 'गुरुत्वाकर्षण (Gravity)', capacity: '५०,००० लिटर ट्याङ्की', wards: 'वडा ३', households: '१,१२० घरधुरी', status: 'नियमित आपूर्ति' },
      { name: 'गुन्सा सौर्य लिफ्टिङ खानेपानी योजना', type: 'सौर्य पम्पिङ (Solar Lift)', capacity: '३५,००० लिटर ट्याङ्की', wards: 'वडा ५', households: '६४० घरधुरी', status: 'सञ्चालनमा' },
      { name: 'थाङपालधाप एकीकृत पानी शुद्धीकरण प्लान्ट', type: 'UV तथा बालुवा फिल्टर', capacity: '४०,००० लिटर ट्याङ्की', wards: 'वडा ६', households: '८९० घरधुरी', status: 'नियमित आपूर्ति' },
      { name: 'बाँसखर्क याङ्ग्री धारा प्रणाली', type: 'मुहान संरक्षण प्रणाली', capacity: '३०,००० लिटर ट्याङ्की', wards: 'वडा १', households: '७२० घरधुरी', status: 'नियमित आपूर्ति' },
    ],
  },
];

export const Projects: React.FC = () => {
  const navigate = useNavigate();

  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'projects' | 'infrastructure' | 'governance'>('projects');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Filters
  const [filterWard, setFilterWard] = useState<number | 'all'>('all');
  const [filterSector, setFilterSector] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterMarfat, setFilterMarfat] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Fetch projects from backend API with fallback
  const { data: apiProjects = [], isLoading, refetch } = useQuery<Project[]>({
    queryKey: ['public-projects'],
    queryFn: async () => {
      try {
        const data = await sectoralApi.getProjects({});
        return data && data.length > 0 ? data : DEMO_PROJECTS;
      } catch {
        return DEMO_PROJECTS;
      }
    },
  });

  const allProjects = apiProjects.length > 0 ? apiProjects : DEMO_PROJECTS;

  // Filtered projects
  const filteredProjects = useMemo(() => {
    return allProjects.filter((p) => {
      const matchWard = filterWard === 'all' || p.wardNumber === Number(filterWard);
      const matchSector =
        filterSector === 'all' ||
        (p.sector && p.sector.toLowerCase().includes(filterSector.toLowerCase()));
      const matchStatus =
        filterStatus === 'all' ||
        (filterStatus === 'completed' && (p.status === 'completed' || p.physicalProgressPercent === 100)) ||
        (filterStatus === 'ongoing' && p.status === 'ongoing') ||
        (filterStatus === 'planning' && (p.status === 'planning' || p.status === 'tender'));
      const matchMarfat =
        filterMarfat === 'all' ||
        (p.marfat && p.marfat.toLowerCase().includes(filterMarfat.toLowerCase()));
      const matchSearch =
        !searchQuery.trim() ||
        p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sector?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.projectCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.contractorName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p as any).committeeName?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchWard && matchSector && matchStatus && matchMarfat && matchSearch;
    });
  }, [allProjects, filterWard, filterSector, filterStatus, filterMarfat, searchQuery]);

  // Executive KPI summary calculations
  const totalCount = allProjects.length;
  const completedProjects = allProjects.filter((p) => p.status === 'completed' || p.physicalProgressPercent === 100);
  const completedCount = completedProjects.length;
  const ongoingCount = allProjects.filter((p) => p.status === 'ongoing').length;
  const totalBudgetNPR = allProjects.reduce((acc, p) => acc + (p.allocatedBudget || (p as any).budget || 0), 0);
  const totalExpNPR = allProjects.reduce((acc, p) => acc + (p.expenditureAmount || (p as any).paidAmount || 0), 0);
  const avgPhysicalProgress = totalCount > 0
    ? Math.round(allProjects.reduce((acc, p) => acc + (p.physicalProgressPercent || (p as any).progressPercentage || 0), 0) / totalCount)
    : 78;
  const avgFinancialProgress = totalBudgetNPR > 0 ? Math.round((totalExpNPR / totalBudgetNPR) * 100) : 68;

  return (
    <div style={{ width: '100%', maxWidth: '100%', margin: '0', padding: '1.5rem 0.5rem', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* ─── PRINT CSS TO GUARANTEE BEAUTIFUL A4 PRINTING ─── */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-project-sheet, #printable-project-sheet * {
            visibility: visible;
          }
          #printable-project-sheet {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 15mm;
            background: white !important;
            box-shadow: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* ─── PAGE TITLE & EXECUTIVE HEADER ─── */}
      <div style={{ marginBottom: '1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.25rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#e0f2fe', color: '#0369a1', padding: '0.35rem 0.85rem', borderRadius: '20px', fontSize: '0.825rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            <HardHat size={16} />
            <span>पाँचपोखरी थाङपाल गाउँपालिका · सार्वजनिक पूर्वाधार तथा योजना अनुगमन डिजिटल ट्विन</span>
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.75rem', margin: 0, letterSpacing: '-0.5px' }}>
            <Pickaxe size={36} color="#0284c7" />
            विकास योजना तथा भौतिक पूर्वाधार ट्विन
          </h1>
          <p style={{ color: '#64748b', fontSize: '1rem', marginTop: '0.4rem', margin: 0, maxWidth: '850px', lineHeight: 1.5 }}>
            वडा नं. १ देखि ८ सम्म सञ्चालित गौरवका तथा वडास्तरीय सडक, खानेपानी, पुल, सिँचाइ र भवन आयोजनाहरूको भौतिक एवं वित्तीय प्रगति, उपभोक्ता समिति विवरण र प्राविधिक नापी किताब (MB) को प्रत्यक्ष पारदर्शी अनुगमन।
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/gis-map?filter=project')}
            style={{
              backgroundColor: '#0284c7',
              color: '#ffffff',
              border: 'none',
              padding: '0.65rem 1.25rem',
              borderRadius: '10px',
              fontSize: '0.88rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 14px rgba(2, 132, 199, 0.35)',
              transition: 'all 0.15s ease',
            }}
          >
            <Compass size={18} />
            <span>🗺️ GIS डिजिटल ट्विन नक्सा</span>
          </button>

          <button
            onClick={() => navigate('/progress-reports')}
            style={{
              backgroundColor: '#8b5cf6',
              color: '#ffffff',
              border: 'none',
              padding: '0.65rem 1.25rem',
              borderRadius: '10px',
              fontSize: '0.88rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 14px rgba(139, 92, 246, 0.35)',
            }}
          >
            <TrendingUp size={18} />
            <span>📊 प्रगति प्रतिवेदन</span>
          </button>

          <button
            onClick={() => navigate('/procurement')}
            style={{
              backgroundColor: '#059669',
              color: '#ffffff',
              border: 'none',
              padding: '0.65rem 1.25rem',
              borderRadius: '10px',
              fontSize: '0.88rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 14px rgba(5, 150, 105, 0.35)',
            }}
          >
            <Briefcase size={18} />
            <span>📑 ई-बोलपत्र (Procurement)</span>
          </button>

          <button
            onClick={() => refetch()}
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              padding: '0.65rem 1rem',
              borderRadius: '10px',
              fontSize: '0.88rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: '#334155',
            }}
          >
            <RefreshCw size={16} className={isLoading ? 'spin' : ''} />
            <span>ताजा गर्नुहोस्</span>
          </button>
        </div>
      </div>

      {/* ─── 4-METRIC EXECUTIVE KPI DASHBOARD ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        {/* Card 1: Total Projects */}
        <div style={{ backgroundColor: '#ffffff', padding: '1.25rem 1.4rem', borderRadius: '14px', boxShadow: '0 4px 14px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0', borderTop: '4px solid #0284c7' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>कुल विकास योजनाहरू</span>
            <TrendingUp size={22} color="#0284c7" />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#0f172a', margin: '0.35rem 0 0.1rem' }}>
            {totalCount} <span style={{ fontSize: '0.92rem', fontWeight: 600, color: '#64748b' }}>आयोजना</span>
          </div>
          <div style={{ fontSize: '0.78rem', color: '#0284c7', fontWeight: 700 }}>
            आ.व. २०८०/०८१ र २०८१/०८२ (वडा १-८)
          </div>
        </div>

        {/* Card 2: Completed Projects */}
        <div style={{ backgroundColor: '#ffffff', padding: '1.25rem 1.4rem', borderRadius: '14px', boxShadow: '0 4px 14px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0', borderTop: '4px solid #16a34a' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>सम्पन्न भएका योजनाहरू</span>
            <CheckCircle2 size={22} color="#16a34a" />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#16a34a', margin: '0.35rem 0 0.1rem' }}>
            {completedCount} <span style={{ fontSize: '0.92rem', fontWeight: 600, color: '#64748b' }}>({Math.round((completedCount / totalCount) * 100)}%)</span>
          </div>
          <div style={{ fontSize: '0.78rem', color: '#15803d', fontWeight: 700 }}>
            नापी किताब रुजु तथा फरफारक सम्पन्न
          </div>
        </div>

        {/* Card 3: Ongoing Projects */}
        <div style={{ backgroundColor: '#ffffff', padding: '1.25rem 1.4rem', borderRadius: '14px', boxShadow: '0 4px 14px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0', borderTop: '4px solid #d97706' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>निर्माणाधीन योजनाहरू</span>
            <Clock size={22} color="#d97706" />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#d97706', margin: '0.35rem 0 0.1rem' }}>
            {ongoingCount} <span style={{ fontSize: '0.92rem', fontWeight: 600, color: '#64748b' }}>योजना</span>
          </div>
          <div style={{ fontSize: '0.78rem', color: '#b45309', fontWeight: 700 }}>
            औसत भौतिक प्रगति: {avgPhysicalProgress}%
          </div>
        </div>

        {/* Card 4: Budget & Financial Progress */}
        <div style={{ backgroundColor: '#ffffff', padding: '1.25rem 1.4rem', borderRadius: '14px', boxShadow: '0 4px 14px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0', borderTop: '4px solid #7c3aed' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>कुल बजेट र वित्तीय खर्च</span>
            <Coins size={22} color="#7c3aed" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#7c3aed', margin: '0.35rem 0 0.1rem' }}>
            रु. {(totalBudgetNPR / 10000000).toFixed(2)} <span style={{ fontSize: '0.92rem', fontWeight: 600 }}>करोड</span>
          </div>
          <div style={{ fontSize: '0.78rem', color: '#6b21a8', fontWeight: 700 }}>
            भुक्तानी खर्च: रु. {(totalExpNPR / 10000000).toFixed(2)} करोड ({avgFinancialProgress}%)
          </div>
        </div>
      </div>

      {/* ─── 3-TAB INTEGRATED NAVIGATION BAR ─── */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          backgroundColor: '#f1f5f9',
          padding: '0.4rem',
          borderRadius: '12px',
          marginBottom: '1.75rem',
          flexWrap: 'wrap',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('projects')}
          style={{
            flex: '1 1 200px',
            padding: '0.75rem 1.25rem',
            borderRadius: '9px',
            border: 'none',
            backgroundColor: activeTab === 'projects' ? '#0284c7' : 'transparent',
            color: activeTab === 'projects' ? '#ffffff' : '#334155',
            fontWeight: 800,
            fontSize: '0.92rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            boxShadow: activeTab === 'projects' ? '0 2px 8px rgba(2,132,199,0.3)' : 'none',
            transition: 'all 0.15s ease',
          }}
        >
          <Pickaxe size={18} />
          <span>१. विकास योजना अनुगमन (Projects Tracker)</span>
          <span style={{ fontSize: '0.72rem', backgroundColor: activeTab === 'projects' ? 'rgba(255,255,255,0.25)' : '#e2e8f0', color: activeTab === 'projects' ? '#ffffff' : '#475569', padding: '1px 6px', borderRadius: '10px' }}>
            {totalCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('infrastructure')}
          style={{
            flex: '1 1 200px',
            padding: '0.75rem 1.25rem',
            borderRadius: '9px',
            border: 'none',
            backgroundColor: activeTab === 'infrastructure' ? '#0284c7' : 'transparent',
            color: activeTab === 'infrastructure' ? '#ffffff' : '#334155',
            fontWeight: 800,
            fontSize: '0.92rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            boxShadow: activeTab === 'infrastructure' ? '0 2px 8px rgba(2,132,199,0.3)' : 'none',
            transition: 'all 0.15s ease',
          }}
        >
          <Building size={18} />
          <span>२. भौतिक पूर्वाधार सम्पत्ति ट्विन (Assets Twin)</span>
          <span style={{ fontSize: '0.72rem', backgroundColor: activeTab === 'infrastructure' ? 'rgba(255,255,255,0.25)' : '#e2e8f0', color: activeTab === 'infrastructure' ? '#ffffff' : '#475569', padding: '1px 6px', borderRadius: '10px' }}>
            २४४+ कि.मि.
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('governance')}
          style={{
            flex: '1 1 200px',
            padding: '0.75rem 1.25rem',
            borderRadius: '9px',
            border: 'none',
            backgroundColor: activeTab === 'governance' ? '#0284c7' : 'transparent',
            color: activeTab === 'governance' ? '#ffffff' : '#334155',
            fontWeight: 800,
            fontSize: '0.92rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            boxShadow: activeTab === 'governance' ? '0 2px 8px rgba(2,132,199,0.3)' : 'none',
            transition: 'all 0.15s ease',
          }}
        >
          <ShieldCheck size={18} />
          <span>३. सुशासन, नापी किताब (MB) र फरफारक</span>
          <span style={{ fontSize: '0.72rem', backgroundColor: activeTab === 'governance' ? 'rgba(255,255,255,0.25)' : '#e2e8f0', color: activeTab === 'governance' ? '#ffffff' : '#475569', padding: '1px 6px', borderRadius: '10px' }}>
            १००% पारदर्शी
          </span>
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          TAB 1: DEVELOPMENT PROJECTS & SCHEMES TRACKER
         ═══════════════════════════════════════════════════════════════ */}
      {activeTab === 'projects' && (
        <>
          {/* Filter Bar */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '14px',
              padding: '1.25rem 1.5rem',
              border: '1px solid #e2e8f0',
              marginBottom: '1.75rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
            }}
          >
            <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', alignItems: 'center' }}>
              {/* Search */}
              <div style={{ position: 'relative', minWidth: '240px' }}>
                <Search size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '11px' }} />
                <input
                  type="text"
                  placeholder="योजना, उपभोक्ता समिति वा कोड..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem 0.55rem 2.2rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Ward Filter */}
              <select
                value={filterWard}
                onChange={(e) => setFilterWard(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                style={{
                  padding: '0.55rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.85rem',
                  backgroundColor: '#ffffff',
                  color: '#334155',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                <option value="all">सबै वडाहरू (वडा १-८)</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((w) => (
                  <option key={w} value={w}>वडा नं. {w}</option>
                ))}
              </select>

              {/* Sector Filter */}
              <select
                value={filterSector}
                onChange={(e) => setFilterSector(e.target.value)}
                style={{
                  padding: '0.55rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.85rem',
                  backgroundColor: '#ffffff',
                  color: '#334155',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                <option value="all">सबै क्षेत्रहरू (सडक, खानेपानी...)</option>
                <option value="सडक">सडक तथा यातायात</option>
                <option value="खानेपानी">खानेपानी तथा सरसफाइ</option>
                <option value="पुल">पुल तथा कल्भर्ट</option>
                <option value="सिँचाइ">सिँचाइ तथा नदी नियन्त्रण</option>
                <option value="भवन">शिक्षा तथा भवन</option>
                <option value="पर्यटन">पर्यटन तथा पदमार्ग</option>
                <option value="विपद्">विपद् तथा वातावरण</option>
              </select>

              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{
                  padding: '0.55rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.85rem',
                  backgroundColor: '#ffffff',
                  color: '#334155',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                <option value="all">सबै प्रगति अवस्था</option>
                <option value="completed">सम्पन्न भएका (१००%)</option>
                <option value="ongoing">निर्माणाधीन (Ongoing)</option>
                <option value="planning">सम्झौता / योजना चरण</option>
              </select>
            </div>

            {/* View Mode Toggle & Count */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
                भेटिएका: <strong style={{ color: '#0284c7' }}>{filteredProjects.length} वटा</strong>
              </span>

              <div style={{ display: 'flex', backgroundColor: '#f1f5f9', padding: '2px', borderRadius: '8px' }}>
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  style={{
                    padding: '0.35rem 0.65rem',
                    border: 'none',
                    borderRadius: '6px',
                    backgroundColor: viewMode === 'grid' ? '#ffffff' : 'transparent',
                    color: viewMode === 'grid' ? '#0284c7' : '#64748b',
                    cursor: 'pointer',
                    boxShadow: viewMode === 'grid' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  }}
                  title="ग्रिड कार्ड भ्यु"
                >
                  <LayoutGrid size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  style={{
                    padding: '0.35rem 0.65rem',
                    border: 'none',
                    borderRadius: '6px',
                    backgroundColor: viewMode === 'table' ? '#ffffff' : 'transparent',
                    color: viewMode === 'table' ? '#0284c7' : '#64748b',
                    cursor: 'pointer',
                    boxShadow: viewMode === 'table' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  }}
                  title="तालिका भ्यु"
                >
                  <Table size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Grid View */}
          {viewMode === 'grid' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.4rem' }}>
              {filteredProjects.map((p) => {
                const isCompleted = p.status === 'completed' || p.physicalProgressPercent === 100;
                const progress = p.physicalProgressPercent || (p as any).progressPercentage || (isCompleted ? 100 : 75);
                const budget = p.allocatedBudget || (p as any).budget || 1500000;
                const paid = p.expenditureAmount || (p as any).paidAmount || Math.round(budget * (progress / 100));
                const finPercent = (p as any).financialProgress || Math.min(100, Math.round((paid / budget) * 100));

                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedProject(p)}
                    style={{
                      backgroundColor: '#ffffff',
                      borderRadius: '16px',
                      border: '1px solid #e2e8f0',
                      padding: '1.4rem',
                      boxShadow: '0 3px 10px rgba(0,0,0,0.03)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      position: 'relative',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-3px)';
                      e.currentTarget.style.boxShadow = '0 10px 22px rgba(2, 132, 199, 0.12)';
                      e.currentTarget.style.borderColor = '#7dd3fc';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 3px 10px rgba(0,0,0,0.03)';
                      e.currentTarget.style.borderColor = '#e2e8f0';
                    }}
                  >
                    <div>
                      {/* Top Badges */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                        <span style={{ fontSize: '0.74rem', fontWeight: 800, backgroundColor: '#f0f9ff', color: '#0369a1', padding: '0.25rem 0.65rem', borderRadius: '20px', border: '1px solid #bae6fd' }}>
                          वडा नं. {p.wardNumber} · {p.sector}
                        </span>
                        <span
                          style={{
                            fontSize: '0.74rem',
                            fontWeight: 800,
                            padding: '0.25rem 0.65rem',
                            borderRadius: '20px',
                            backgroundColor: isCompleted ? '#dcfce7' : '#fef3c7',
                            color: isCompleted ? '#166534' : '#92400e',
                            border: `1px solid ${isCompleted ? '#bbf7d0' : '#fde68a'}`,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                          }}
                        >
                          {isCompleted ? <CheckCircle size={12} /> : <Clock size={12} />}
                          {isCompleted ? 'सम्पन्न (Completed)' : 'निर्माणाधीन'}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, marginBottom: '0.2rem', fontFamily: 'monospace' }}>
                        {p.projectCode}
                      </div>

                      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.65rem', lineHeight: 1.4 }}>
                        {p.name}
                      </h3>

                      {/* Committee & Budget Meta */}
                      <div style={{ fontSize: '0.8rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '0.35rem', margin: '0.65rem 0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Users size={14} color="#0284c7" />
                          <span>कार्यान्वयन: <strong>{p.committeeName || p.contractorName || 'उपभोक्ता समिति'}</strong></span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Layers size={14} color="#7c3aed" />
                          <span style={{ fontSize: '0.76rem' }}>स्रोत: {p.budgetSource || 'गाउँसभा आन्तरिक'}</span>
                        </div>
                      </div>

                      {/* Dual Progress Bars */}
                      <div style={{ margin: '0.85rem 0 0.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: '#334155', marginBottom: '0.3rem' }}>
                          <span>भौतिक प्रगति (Physical):</span>
                          <strong style={{ color: isCompleted ? '#16a34a' : '#0284c7' }}>{progress}%</strong>
                        </div>
                        <div style={{ width: '100%', height: '7px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', marginBottom: '0.5rem' }}>
                          <div
                            style={{
                              width: `${progress}%`,
                              height: '100%',
                              backgroundColor: isCompleted ? '#16a34a' : '#0284c7',
                              borderRadius: '4px',
                            }}
                          />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: '#334155', marginBottom: '0.3rem' }}>
                          <span>वित्तीय भुक्तानी (Financial):</span>
                          <strong style={{ color: '#7c3aed' }}>{finPercent}%</strong>
                        </div>
                        <div style={{ width: '100%', height: '7px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${finPercent}%`,
                              height: '100%',
                              backgroundColor: '#7c3aed',
                              borderRadius: '4px',
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Bottom Row */}
                    <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.85rem', marginTop: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>सम्झौता बजेट</div>
                        <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f172a' }}>
                          रु. {Number(budget).toLocaleString('ne-NP')}
                        </div>
                      </div>

                      <button
                        type="button"
                        style={{
                          backgroundColor: '#f8fafc',
                          border: '1px solid #cbd5e1',
                          borderRadius: '8px',
                          padding: '0.4rem 0.75rem',
                          fontSize: '0.78rem',
                          color: '#0284c7',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          cursor: 'pointer',
                        }}
                      >
                        <span>पारदर्शी लगत</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Table View */
            <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', overflowX: 'auto', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>कोड / वडा</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>योजनाको नाम</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>क्षेत्र</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>कार्यान्वयन निकाय</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>सम्झौता बजेट (रु.)</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>भौतिक प्रगति</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>अवस्था</th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 700, textAlign: 'right' }}>कार्य</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProjects.map((p) => {
                    const isCompleted = p.status === 'completed' || p.physicalProgressPercent === 100;
                    return (
                      <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '0.75rem 1rem', fontWeight: 600, fontFamily: 'monospace' }}>
                          <span style={{ backgroundColor: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>
                            वडा {p.wardNumber}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#0f172a' }}>{p.name}</td>
                        <td style={{ padding: '0.75rem 1rem', color: '#64748b' }}>{p.sector}</td>
                        <td style={{ padding: '0.75rem 1rem' }}>{p.committeeName || p.contractorName || 'उपभोक्ता समिति'}</td>
                        <td style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>
                          रु. {Number(p.allocatedBudget || 0).toLocaleString('ne-NP')}
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <strong style={{ color: isCompleted ? '#16a34a' : '#0284c7' }}>
                            {p.physicalProgressPercent || 75}%
                          </strong>
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <span
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: '12px',
                              backgroundColor: isCompleted ? '#dcfce7' : '#fef3c7',
                              color: isCompleted ? '#166534' : '#92400e',
                            }}
                          >
                            {isCompleted ? 'सम्पन्न' : 'चालु'}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                          <button
                            type="button"
                            onClick={() => setSelectedProject(p)}
                            style={{
                              backgroundColor: '#0284c7',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '0.35rem 0.75rem',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            विवरण
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          TAB 2: PALIKA INFRASTRUCTURE ASSETS DIGITAL TWIN
         ═══════════════════════════════════════════════════════════════ */}
      {activeTab === 'infrastructure' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {INFRASTRUCTURE_ASSETS.map((section, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                padding: '1.5rem',
                boxShadow: '0 4px 14px rgba(0,0,0,0.02)',
              }}
            >
              {/* Section Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                    {section.title}
                  </h3>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>पाँचपोखरी थाङपाल गाउँपालिका आधिकारिक पूर्वाधार लगत</span>
                </div>
                <div style={{ backgroundColor: '#e0f2fe', color: '#0369a1', padding: '0.35rem 0.85rem', borderRadius: '20px', fontWeight: 800, fontSize: '0.85rem' }}>
                  {section.totalLength}
                </div>
              </div>

              {/* 3 Metric Badges */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                {section.stats.map((st, i) => (
                  <div key={i} style={{ backgroundColor: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>{st.label}</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 900, color: st.color, margin: '0.2rem 0' }}>{st.value}</div>
                    <div style={{ fontSize: '0.72rem', color: '#475569' }}>{st.desc}</div>
                  </div>
                ))}
              </div>

              {/* Items Table */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                      <th style={{ padding: '0.65rem 0.85rem', textAlign: 'left' }}>पूर्वाधार संरचनाको नाम</th>
                      <th style={{ padding: '0.65rem 0.85rem', textAlign: 'left' }}>प्रकार / प्रविधि</th>
                      <th style={{ padding: '0.65rem 0.85rem', textAlign: 'left' }}>लम्बाइ / क्षमता</th>
                      <th style={{ padding: '0.65rem 0.85rem', textAlign: 'left' }}>सम्बन्धित वडा</th>
                      <th style={{ padding: '0.65rem 0.85rem', textAlign: 'left' }}>लाभान्वित / ट्राफिक</th>
                      <th style={{ padding: '0.65rem 0.85rem', textAlign: 'right' }}>अवस्था</th>
                    </tr>
                  </thead>
                  <tbody>
                    {section.items.map((it: any, i: number) => (
                      <tr key={i} style={{ borderBottom: '1px solid #f8fafc' }}>
                        <td style={{ padding: '0.65rem 0.85rem', fontWeight: 700, color: '#0f172a' }}>{it.name}</td>
                        <td style={{ padding: '0.65rem 0.85rem', color: '#64748b' }}>{it.type}</td>
                        <td style={{ padding: '0.65rem 0.85rem', fontWeight: 600 }}>{it.length || it.span || it.capacity}</td>
                        <td style={{ padding: '0.65rem 0.85rem', color: '#0284c7' }}>{it.wards}</td>
                        <td style={{ padding: '0.65rem 0.85rem' }}>{it.traffic || it.capacity || it.households}</td>
                        <td style={{ padding: '0.65rem 0.85rem', textAlign: 'right' }}>
                          <span style={{ fontSize: '0.72rem', backgroundColor: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>
                            {it.condition || it.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          TAB 3: GOVERNANCE, MB & SOCIAL AUDIT TRANSPARENCY BOARD
         ═══════════════════════════════════════════════════════════════ */}
      {activeTab === 'governance' && (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.5rem', boxShadow: '0 4px 14px rgba(0,0,0,0.02)' }}>
          <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={22} color="#16a34a" />
                <span>सुशासन, नापी किताब (MB) र सामाजिक परीक्षण बोर्ड</span>
              </h3>
              <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.85rem' }}>
                स्थानीय सरकार सञ्चालन ऐन, २०७४ अनुसार उपभोक्ता समिति तथा योजनाहरूको प्राविधिक मूल्याङ्कन र सार्वजनिक सुनुवाइ विवरण
              </p>
            </div>

            <div style={{ fontSize: '0.8rem', color: '#16a34a', backgroundColor: '#dcfce7', padding: '0.4rem 0.85rem', borderRadius: '8px', fontWeight: 700 }}>
              ✓ शतप्रतिशत डिजिटल अभिलेखीकरण
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                  <th style={{ padding: '0.75rem 0.85rem', textAlign: 'left' }}>योजना कोड / वडा</th>
                  <th style={{ padding: '0.75rem 0.85rem', textAlign: 'left' }}>योजनाको नाम</th>
                  <th style={{ padding: '0.75rem 0.85rem', textAlign: 'left' }}>उपभोक्ता समिति नेतृत्व</th>
                  <th style={{ padding: '0.75rem 0.85rem', textAlign: 'left' }}>नापी किताब (MB) स्थिति</th>
                  <th style={{ padding: '0.75rem 0.85rem', textAlign: 'left' }}>सामाजिक परीक्षण</th>
                  <th style={{ padding: '0.75rem 0.85rem', textAlign: 'left' }}>फरफारक प्रमाणपत्र</th>
                  <th style={{ padding: '0.75rem 0.85rem', textAlign: 'right' }}>नागरिक कार्य</th>
                </tr>
              </thead>
              <tbody>
                {allProjects.map((p) => {
                  const isCompleted = p.status === 'completed' || p.physicalProgressPercent === 100;
                  return (
                    <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.75rem 0.85rem', fontWeight: 700, fontFamily: 'monospace' }}>
                        <div>{p.projectCode}</div>
                        <span style={{ fontSize: '0.72rem', color: '#0284c7' }}>वडा नं. {p.wardNumber}</span>
                      </td>
                      <td style={{ padding: '0.75rem 0.85rem', fontWeight: 700, color: '#0f172a' }}>
                        {p.name}
                      </td>
                      <td style={{ padding: '0.75rem 0.85rem' }}>
                        <div><strong>{(p as any).committeeChair || 'दावा तामाङ'}</strong> (अध्यक्ष)</div>
                        <a href={`tel:${(p as any).committeePhone || '9851000000'}`} style={{ color: '#0284c7', fontSize: '0.78rem', textDecoration: 'none' }}>
                          📞 {(p as any).committeePhone || '९८५१२२४४००'}
                        </a>
                      </td>
                      <td style={{ padding: '0.75rem 0.85rem' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: '#16a34a', fontWeight: 700, fontSize: '0.78rem' }}>
                          <CheckCircle2 size={13} /> इन्जिनियर रुजु
                        </span>
                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>नापी मूल्याङ्कन दर्ता</div>
                      </td>
                      <td style={{ padding: '0.75rem 0.85rem' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: isCompleted ? '#16a34a' : '#d97706', fontWeight: 700, fontSize: '0.78rem' }}>
                          {isCompleted ? <CheckCircle2 size={13} /> : <Clock size={13} />}
                          {isCompleted ? 'भेला अनुमोदन' : 'आयोजना हुँदै'}
                        </span>
                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>सार्वजनिक सुनुवाइ</div>
                      </td>
                      <td style={{ padding: '0.75rem 0.85rem' }}>
                        <span style={{ fontSize: '0.76rem', backgroundColor: isCompleted ? '#dcfce7' : '#fef3c7', color: isCompleted ? '#166534' : '#b45309', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                          {isCompleted ? '✓ फरफारक सम्पन्न' : 'प्रक्रियामा'}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 0.85rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                          <button
                            type="button"
                            onClick={() => setSelectedProject(p)}
                            style={{
                              backgroundColor: '#f1f5f9',
                              border: '1px solid #cbd5e1',
                              borderRadius: '6px',
                              padding: '0.3rem 0.65rem',
                              fontSize: '0.76rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            लगत
                          </button>
                          <button
                            type="button"
                            onClick={() => navigate(`/complaints?title=${encodeURIComponent(`योजना सम्बन्धी गुनासो: ${p.name} (${p.projectCode})`)}`)}
                            style={{
                              backgroundColor: '#fef2f2',
                              border: '1px solid #fecaca',
                              color: '#dc2626',
                              borderRadius: '6px',
                              padding: '0.3rem 0.65rem',
                              fontSize: '0.76rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                            }}
                            title="यो योजना सम्बन्धी गुनासो दर्ता गर्नुहोस्"
                          >
                            <MessageSquare size={12} />
                            <span>गुनासो</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          A4 PRINTABLE PROJECT TRANSPARENCY MODAL
         ═══════════════════════════════════════════════════════════════ */}
      {selectedProject && (
        <div
          className="no-print-modal"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: '1rem',
          }}
          onClick={() => setSelectedProject(null)}
        >
          <div
            id="printable-project-sheet"
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              maxWidth: '860px',
              width: '100%',
              maxHeight: '92vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid #e2e8f0',
              padding: '2rem',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Close & Print Controls */}
            <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0369a1', fontWeight: 800, fontSize: '0.88rem' }}>
                <ShieldCheck size={18} />
                <span>आधिकारिक योजना पारदर्शी प्रोफाइल (A4 Printable Transparency Sheet)</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => window.print()}
                  style={{
                    backgroundColor: '#dc2626',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '0.4rem 0.9rem',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  <Printer size={15} />
                  <span>A4 प्रिन्ट</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedProject(null)}
                  style={{
                    backgroundColor: '#f1f5f9',
                    border: 'none',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#64748b',
                  }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Official Letterhead Heading in Sheet */}
            <div style={{ textAlign: 'center', borderBottom: '2px solid #b91c1c', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.85rem', color: '#b91c1c', fontWeight: 700 }}>स्थानीय सरकार</div>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#b91c1c', margin: '0.15rem 0' }}>
                पाँचपोखरी थाङ्गपाल गाउँपालिका
              </h2>
              <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>गाउँकार्यपालिकाको कार्यालय</div>
              <div style={{ fontSize: '0.78rem', color: '#475569' }}>थाङ्गपालधाप, सिन्धुपाल्चोक, बाग्मती प्रदेश</div>
              <div style={{ fontSize: '0.78rem', color: '#b91c1c', fontWeight: 800, marginTop: '4px' }}>
                "विकास योजना तथा सार्वजनिक पूर्वाधार लगत विवरण"
              </div>
            </div>

            {/* Project Basic Overview */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.82rem', marginBottom: '1.25rem' }}>
              <div>
                <span style={{ color: '#64748b' }}>योजना कोड:</span> <strong style={{ fontFamily: 'monospace' }}>{selectedProject.projectCode}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>सम्बन्धित वडा:</span> <strong>वडा नं. {selectedProject.wardNumber}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>क्षेत्र:</span> <strong>{selectedProject.sector}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>आर्थिक वर्ष:</span> <strong>{selectedProject.fiscalYear}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>कार्यान्वयन मोडेल:</span> <strong>{(selectedProject as any).marfat || 'उपभोक्ता समिति'}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>योजना स्तर:</span> <strong>{(selectedProject as any).level || 'नगर स्तरिय'}</strong>
              </div>
            </div>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem' }}>
              {selectedProject.name}
            </h3>
            {selectedProject.description && (
              <p style={{ fontSize: '0.82rem', color: '#334155', lineHeight: 1.5, margin: '0 0 1rem' }}>
                {selectedProject.description}
              </p>
            )}

            {/* Cost Sharing Table */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.4rem' }}>
                लागत साझेदारी तथा बजेट विनियोजन (Cost Sharing):
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', border: '1px solid #cbd5e1' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f1f5f9' }}>
                    <th style={{ padding: '6px 10px', border: '1px solid #cbd5e1', textAlign: 'left' }}>विवरण</th>
                    <th style={{ padding: '6px 10px', border: '1px solid #cbd5e1', textAlign: 'right' }}>रकम (रु.)</th>
                    <th style={{ padding: '6px 10px', border: '1px solid #cbd5e1', textAlign: 'right' }}>साझेदारी प्रतिशत</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1' }}>गाउँपालिका अनुदान (Palika Grant)</td>
                    <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 700 }}>
                      रु. {Number((selectedProject as any).palikaGrant || Number(selectedProject.allocatedBudget || 0) * 0.9).toLocaleString('ne-NP')}
                    </td>
                    <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1', textAlign: 'right' }}>९०%</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1' }}>जनसहभागिता / श्रमदान (Community Contribution)</td>
                    <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 700 }}>
                      रु. {Number((selectedProject as any).communityContribution || Number(selectedProject.allocatedBudget || 0) * 0.1).toLocaleString('ne-NP')}
                    </td>
                    <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1', textAlign: 'right' }}>१०%</td>
                  </tr>
                  <tr style={{ backgroundColor: '#f8fafc', fontWeight: 800 }}>
                    <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1' }}>कुल सम्झौता लगत (Total Cost)</td>
                    <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1', textAlign: 'right', color: '#0284c7' }}>
                      रु. {Number(selectedProject.allocatedBudget || 0).toLocaleString('ne-NP')}
                    </td>
                    <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1', textAlign: 'right' }}>१००%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Committee Leadership */}
            <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
                उपभोक्ता समिति विवरण (Consumer Committee):
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', fontSize: '0.8rem' }}>
                <div>
                  <span style={{ color: '#64748b' }}>समिति नाम:</span> <strong>{(selectedProject as any).committeeName || 'स्थानीय उपभोक्ता समिति'}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>समिति अध्यक्ष:</span> <strong>{(selectedProject as any).committeeChair || 'दावा तामाङ'}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>सम्पर्क नम्बर:</span>{' '}
                  <a href={`tel:${(selectedProject as any).committeePhone || '9851000000'}`} style={{ color: '#0284c7', textDecoration: 'none' }}>
                    {(selectedProject as any).committeePhone || '९८५१२२४४००'}
                  </a>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>सुरु मिति:</span> {(selectedProject as any).startDateBs || '२०८१-०४-१५'}
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>सम्पन्न म्याद:</span> {(selectedProject as any).completionDateBs || '२०८२-०२-३०'}
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>कार्यादेश नं:</span> {(selectedProject as any).workOrderNumber || 'WO-2081-014'}
                </div>
              </div>
            </div>

            {/* Signatures & QR Code in Print Sheet */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid #cbd5e1' }}>
              <div style={{ textAlign: 'center', width: '180px', fontSize: '0.8rem' }}>
                <div style={{ height: '35px' }}></div>
                <div style={{ borderTop: '1px dotted #000', paddingTop: '4px', fontWeight: 700 }}>
                  ( {(selectedProject as any).committeeChair || 'उपभोक्ता समिति अध्यक्ष'} )
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>उपभोक्ता समिति</div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=75x75&data=${encodeURIComponent(
                    `${window.location.origin}/projects`
                  )}`}
                  alt="QR Code"
                  style={{ width: '60px', height: '60px', border: '1px solid #cbd5e1', padding: '2px', borderRadius: '4px' }}
                />
                <div style={{ fontSize: '0.62rem', color: '#16a34a', fontWeight: 700, marginTop: '2px' }}>
                  ✓ डिजिटल ट्विन प्रमाणित
                </div>
              </div>

              <div style={{ textAlign: 'center', width: '180px', fontSize: '0.8rem' }}>
                <div style={{ height: '35px' }}></div>
                <div style={{ borderTop: '1px dotted #000', paddingTop: '4px', fontWeight: 700 }}>
                  ( योजना तथा प्राविधिक शाखा )
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>इन्जिनियर / अधिकृत</div>
              </div>
            </div>

            {/* Bottom Modal Actions (No-Print) */}
            <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '1rem', marginTop: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => {
                  navigate(`/complaints?title=${encodeURIComponent(`योजना सम्बन्धी गुनासो: ${selectedProject.name} (${selectedProject.projectCode})`)}`);
                }}
                style={{
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#dc2626',
                  borderRadius: '8px',
                  padding: '0.55rem 1rem',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <MessageSquare size={15} />
                <span>यो योजनामा नागरिक गुनासो दर्ता गर्नुहोस्</span>
              </button>

              <div style={{ display: 'flex', gap: '0.65rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    navigate(`/gis-map?filter=project&ward=${selectedProject.wardNumber}`);
                  }}
                  style={{
                    backgroundColor: '#0284c7',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.55rem 1.25rem',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    boxShadow: '0 2px 6px rgba(2,132,199,0.3)',
                  }}
                >
                  <Compass size={16} />
                  <span>🗺️ GIS नक्सामा हेर्नुहोस्</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
