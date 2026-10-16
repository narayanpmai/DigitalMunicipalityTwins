import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen, HeartPulse, Droplets, Users, Trees,
  BusFront, Activity, Building2, Zap, Landmark,
  Tractor, Leaf, MountainSnow, Castle, Home,
  Fish, ShieldAlert, Sparkles, Search, ChevronRight,
  TrendingUp, CheckCircle2, ShieldCheck, History,
  FileCheck2, CheckSquare, Layers, Award, Scale, HelpCircle
} from 'lucide-react';
import { toNepaliDigits } from '../../../utils/nepaliCalendar';

export interface ThematicItem {
  id: number;
  pillarKey: 'social' | 'infrastructure' | 'economic' | 'environment' | 'governance';
  pillarTitle: string;
  title: string;
  subtitle: string;
  indicator: string;
  progressPct: number;
  icon: React.ReactNode;
  color: string;
  fieldsCount: number;
}

export const THEMATIC_PILLARS = [
  {
    key: 'social',
    title: '१. सामाजिक विकास (Social Development)',
    desc: 'शिक्षा, स्वास्थ्य, खानेपानी, सरसफाइ तथा सामाजिक सुरक्षा',
    color: '#EC4899',
    bgColor: 'rgba(236, 72, 153, 0.12)',
    icon: <Users size={22} color="#EC4899" />,
    avgProgress: 88,
  },
  {
    key: 'infrastructure',
    title: '२. भौतिक पूर्वाधार विकास (Physical Infrastructure)',
    desc: 'सडक, पुल, भवन, सिँचाइ, विद्युत, दूरसञ्चार तथा GIS योजना',
    color: '#10B981',
    bgColor: 'rgba(16, 185, 129, 0.12)',
    icon: <BusFront size={22} color="#10B981" />,
    avgProgress: 86,
  },
  {
    key: 'economic',
    title: '३. आर्थिक विकास (Economic Development)',
    desc: 'कृषि, पशुपालन, चिया बगान, माछा फार्म, पर्यटन तथा राजस्व',
    color: '#F59E0B',
    bgColor: 'rgba(245, 158, 11, 0.12)',
    icon: <Tractor size={22} color="#F59E0B" />,
    avgProgress: 85,
  },
  {
    key: 'environment',
    title: '४. वातावरण, वन तथा विपद् व्यवस्थापन (Environment & Disaster)',
    desc: 'पाँचपोखरी कुण्ड, वन, जलवायु अनुकूलन तथा विपद् पूर्वतयारी',
    color: '#0EA5E9',
    bgColor: 'rgba(14, 165, 233, 0.12)',
    icon: <Droplets size={22} color="#0EA5E9" />,
    avgProgress: 90,
  },
  {
    key: 'governance',
    title: '५. सुशासन तथा संस्थागत विकास (Governance & Institutional)',
    desc: 'डिजिटल ई-सेवा, पालिका प्रोफाइल, वडा श्रेणी तथा नागरिक सन्तुष्टि',
    color: '#6366F1',
    bgColor: 'rgba(99, 102, 241, 0.12)',
    icon: <ShieldCheck size={22} color="#6366F1" />,
    avgProgress: 91,
  },
];

export const PANCHPOKHARI_33_SECTORS: ThematicItem[] = [
  // ── Pillar 1: सामाजिक विकास (Social Development) ──────────────────────────
  {
    id: 3,
    pillarKey: 'social',
    pillarTitle: 'सामाजिक विकास',
    title: 'शिक्षा क्षेत्र पूर्वाधार तथा गुणस्तर',
    subtitle: 'शिक्षा • १२ फिल्डहरू',
    indicator: '४२ विद्यालय • ५,७६० विद्यार्थी • २७२ शिक्षक • शतप्रतिशत डिजिटल अभिलेख',
    progressPct: 88,
    icon: <BookOpen size={20} />,
    color: '#F59E0B',
    fieldsCount: 12,
  },
  {
    id: 4,
    pillarKey: 'social',
    pillarTitle: 'सामाजिक विकास',
    title: 'स्वास्थ्य संस्था तथा खोप सेवा',
    subtitle: 'स्वास्थ्य • १० फिल्डहरू',
    indicator: '१० स्वास्थ्य संस्था • ३ प्राथमिक अस्पताल • ९८% खोप दर • २४ सै घण्टा प्रसूति',
    progressPct: 91,
    icon: <HeartPulse size={20} />,
    color: '#EC4899',
    fieldsCount: 10,
  },
  {
    id: 9,
    pillarKey: 'social',
    pillarTitle: 'सामाजिक विकास',
    title: 'खानेपानी (एक घर एक धारा)',
    subtitle: 'खानेपानी • ५ फिल्डहरू',
    indicator: '५,१३६ घरमा धारा जडान • ८८.५% घरधुरी पहुँच • नियमित पानी शुद्धीकरण',
    progressPct: 86,
    icon: <Droplets size={20} />,
    color: '#38BDF8',
    fieldsCount: 5,
  },
  {
    id: 13,
    pillarKey: 'social',
    pillarTitle: 'सामाजिक विकास',
    title: 'सामाजिक समावेशीकरण तथा सुरक्षा',
    subtitle: 'समावेशीकरण • ५ फिल्डहरू',
    indicator: '६ लक्षित समूह • ३,२४० लाभग्राही • १००% डिजिटल बैंक खातामार्फत भुक्तानी',
    progressPct: 94,
    icon: <Users size={20} />,
    color: '#D946EF',
    fieldsCount: 5,
  },
  {
    id: 25,
    pillarKey: 'social',
    pillarTitle: 'सामाजिक विकास',
    title: 'पार्क तथा बाल उद्यान',
    subtitle: 'सार्वजनिक स्थल • ८ फिल्डहरू',
    indicator: '४ बाल उद्यान • २ खुला व्यायामशाला • समुदायमा आधारित व्यवस्थापन',
    progressPct: 78,
    icon: <Trees size={20} />,
    color: '#10B981',
    fieldsCount: 8,
  },

  // ── Pillar 2: भौतिक पूर्वाधार विकास (Physical Infrastructure) ─────────────
  {
    id: 8,
    pillarKey: 'infrastructure',
    pillarTitle: 'भौतिक पूर्वाधार',
    title: 'सडक पूर्वाधार (कालोपत्रे/ग्राभेल/कच्ची)',
    subtitle: 'यातायात • ६ फिल्डहरू',
    indicator: '१४८.५ कि.मि. कुल सडक सञ्जाल (२८.२ कि.मि. कालोपत्रे, ७२ कि.मि. ग्राभेल)',
    progressPct: 76,
    icon: <BusFront size={20} />,
    color: '#64748B',
    fieldsCount: 6,
  },
  {
    id: 20,
    pillarKey: 'infrastructure',
    pillarTitle: 'भौतिक पूर्वाधार',
    title: 'झोलुङ्गे पुल (Suspension Bridges)',
    subtitle: 'पुल पूर्वाधार • ११ फिल्डहरू',
    indicator: '२२ वटा झोलुङ्गे पुल • खोला तथा नदीमा बाह्रै महिना सुरक्षित आवागमन',
    progressPct: 95,
    icon: <Activity size={20} />,
    color: '#F59E0B',
    fieldsCount: 11,
  },
  {
    id: 21,
    pillarKey: 'infrastructure',
    pillarTitle: 'भौतिक पूर्वाधार',
    title: 'मोटरेबल पुल (Motorable Bridges)',
    subtitle: 'सडक पुल • ८ फिल्डहरू',
    indicator: '७ वटा मोटरेबल पुल (५ सम्पन्न, २ निर्माणाधीन) • मेलम्ची तथा याङ्ग्री कोरिडोर',
    progressPct: 82,
    icon: <BusFront size={20} />,
    color: '#10B981',
    fieldsCount: 8,
  },
  {
    id: 22,
    pillarKey: 'infrastructure',
    pillarTitle: 'भौतिक पूर्वाधार',
    title: 'सामुदायिक तथा बहुउद्देश्यीय भवन',
    subtitle: 'भवन • ६ फिल्डहरू',
    indicator: '१६ वटा सामुदायिक भवन • ८ वटै वडामा भूकम्प प्रतिरोधी सुरक्षित हल',
    progressPct: 89,
    icon: <Building2 size={20} />,
    color: '#3B82F6',
    fieldsCount: 6,
  },
  {
    id: 33,
    pillarKey: 'infrastructure',
    pillarTitle: 'भौतिक पूर्वाधार',
    title: 'वडा तथा पालिका भवन (Municipal Buildings)',
    subtitle: 'प्रशासनिक भवन • ११ फिल्डहरू',
    indicator: '८ वटै वडा कार्यालय पक्की आधुनिक भवन • १ केन्द्रीय प्रशासकीय भवन (धाप)',
    progressPct: 98,
    icon: <Building2 size={20} />,
    color: '#6366F1',
    fieldsCount: 11,
  },
  {
    id: 10,
    pillarKey: 'infrastructure',
    pillarTitle: 'भौतिक पूर्वाधार',
    title: 'विद्युत तथा सूचना प्रविधि',
    subtitle: 'विद्युत/इन्टरनेट • ७ फिल्डहरू',
    indicator: '९६.४% घरधुरीमा राष्ट्रिय प्रसारण ग्रीड • ८ वटै वडामा FTTH फाइबर इन्टरनेट',
    progressPct: 92,
    icon: <Zap size={20} />,
    color: '#EAB308',
    fieldsCount: 7,
  },
  {
    id: 27,
    pillarKey: 'infrastructure',
    pillarTitle: 'भौतिक पूर्वाधार',
    title: 'विद्युत कालो तार (ABC Cable) विस्तार',
    subtitle: 'विद्युत सुरक्षा • ५ फिल्डहरू',
    indicator: '५४ कि.मि. इन्सुलेटेड एबीसी कालो तार जडान • सर्ट सर्किट शून्य जोखिम',
    progressPct: 87,
    icon: <Zap size={20} />,
    color: '#EAB308',
    fieldsCount: 5,
  },
  {
    id: 26,
    pillarKey: 'infrastructure',
    pillarTitle: 'भौतिक पूर्वाधार',
    title: 'सिँचाइ कुलो पूर्वाधार',
    subtitle: 'सिँचाइ • ६ फिल्डहरू',
    indicator: '३२ वटा सिँचाइ योजना • १,४५० हेक्टर खेतबारीमा बाह्रै महिना पानी सुविधा',
    progressPct: 81,
    icon: <Droplets size={20} />,
    color: '#38BDF8',
    fieldsCount: 6,
  },
  {
    id: 24,
    pillarKey: 'infrastructure',
    pillarTitle: 'भौतिक पूर्वाधार',
    title: 'यात्रु प्रतिक्षालय (Waiting Shelters)',
    subtitle: 'सार्वजनिक सेवा • ५ फिल्डहरू',
    indicator: '२८ वटा यात्रु प्रतिक्षालय • मुख्य सडक तथा पर्यटकीय पदमार्गमा निर्मित',
    progressPct: 90,
    icon: <Home size={20} />,
    color: '#8B5CF6',
    fieldsCount: 5,
  },
  {
    id: 2,
    pillarKey: 'infrastructure',
    pillarTitle: 'भौतिक पूर्वाधार',
    title: 'GIS/GPS आधारित विकास योजना विवरण',
    subtitle: 'योजना अनुगमन • ३ फिल्डहरू',
    indicator: '१५६ विकास आयोजना १००% जियो-ट्यागिङ • नक्सामा प्रत्यक्ष प्रगति ट्र्याकिङ',
    progressPct: 94,
    icon: <Layers size={20} />,
    color: '#10B981',
    fieldsCount: 3,
  },

  // ── Pillar 3: आर्थिक विकास (Economic Development) ─────────────────────────
  {
    id: 5,
    pillarKey: 'economic',
    pillarTitle: 'आर्थिक विकास',
    title: 'कृषि तथा बाली उत्पादन',
    subtitle: 'कृषि • ९ फिल्डहरू',
    indicator: 'मकै, कोदो, आलु तथा किवी खेती • २,१०० हेक्टर उत्पादन क्षेत्र • कृषि अनुदान',
    progressPct: 83,
    icon: <Tractor size={20} />,
    color: '#84CC16',
    fieldsCount: 9,
  },
  {
    id: 6,
    pillarKey: 'economic',
    pillarTitle: 'आर्थिक विकास',
    title: 'पशुपालन तथा डेरी उत्पादन',
    subtitle: 'पशुधन • ५ फिल्डहरू',
    indicator: 'चौंरी, याक तथा उन्नत बाख्रापालन • दैनिक ४,२५० लिटर दूध संकलन तथा प्रशोधन',
    progressPct: 86,
    icon: <Leaf size={20} />,
    color: '#22C55E',
    fieldsCount: 5,
  },
  {
    id: 30,
    pillarKey: 'economic',
    pillarTitle: 'आर्थिक विकास',
    title: 'चिया बगान तथा प्रशोधन',
    subtitle: 'नगदे बाली • ७ फिल्डहरू',
    indicator: 'भोताङ र थाङपालकोट चिया बगान • प्राङ्गारिक अर्थोडक्स चिया ब्रान्डिङ',
    progressPct: 79,
    icon: <Trees size={20} />,
    color: '#84CC16',
    fieldsCount: 7,
  },
  {
    id: 32,
    pillarKey: 'economic',
    pillarTitle: 'आर्थिक विकास',
    title: 'माछा फार्म (Rainbow Trout Fisheries)',
    subtitle: 'मत्स्यपालन • ६ फिल्डहरू',
    indicator: '६ वटा रेन्बो ट्राउट फार्म • वार्षिक १८ टन उत्पादन • चिसो हिमाली पानी उपयोग',
    progressPct: 91,
    icon: <Fish size={20} />,
    color: '#06B6D4',
    fieldsCount: 6,
  },
  {
    id: 7,
    pillarKey: 'economic',
    pillarTitle: 'आर्थिक विकास',
    title: 'पर्यटन, पदमार्ग तथा होमस्टे',
    subtitle: 'पर्यटन • ६ फिल्डहरू',
    indicator: 'पाँचपोखरी ट्रेकिङ ट्रेल • ४८ वटा दर्ता सामुदायिक होमस्टे • गाइड तालिम',
    progressPct: 88,
    icon: <MountainSnow size={20} />,
    color: '#0EA5E9',
    fieldsCount: 6,
  },
  {
    id: 23,
    pillarKey: 'economic',
    pillarTitle: 'आर्थिक विकास',
    title: 'धार्मिक तथा सांस्कृतिक सम्पदा',
    subtitle: 'सम्पदा • ५ फिल्डहरू',
    indicator: 'पवित्र पाँचपोखरी कुण्ड, आमायाङ्ग्री, चण्डेश्वरी • वार्षिक ३५ हजार+ तीर्थयात्री',
    progressPct: 93,
    icon: <Castle size={20} />,
    color: '#F59E0B',
    fieldsCount: 5,
  },
  {
    id: 31,
    pillarKey: 'economic',
    pillarTitle: 'आर्थिक विकास',
    title: 'कोसेली घर तथा स्थानीय बजार',
    subtitle: 'बजार • ५ फिल्डहरू',
    indicator: '३ कोसेली घर (हवेली, धाप, मेलम्ची) • स्थानीय कृषि तथा हस्तकला प्रवर्द्धन',
    progressPct: 75,
    icon: <Home size={20} />,
    color: '#D946EF',
    fieldsCount: 5,
  },
  {
    id: 14,
    pillarKey: 'economic',
    pillarTitle: 'आर्थिक विकास',
    title: 'वित्तीय प्रगति तथा राजस्व परिचालन',
    subtitle: 'राजस्व • ८ फिल्डहरू',
    indicator: 'वार्षिक बजेट रु. ५८.४५ करोड • रु. ५७.६८ करोड परिचालन (८२.४% वित्तीय प्रगति)',
    progressPct: 82,
    icon: <Landmark size={20} />,
    color: '#10B981',
    fieldsCount: 8,
  },

  // ── Pillar 4: वातावरण, वन तथा विपद् व्यवस्थापन (Environment & Disaster) ──
  {
    id: 11,
    pillarKey: 'environment',
    pillarTitle: 'वातावरण/विपद्',
    title: 'वातावरण, वन तथा जलवायु',
    subtitle: 'वन/जैविक • ६ फिल्डहरू',
    indicator: '६८.४% वन क्षेत्र • १२ सामुदायिक वन • स्थानीय जलवायु अनुकूलन योजना (LAPA)',
    progressPct: 89,
    icon: <Trees size={20} />,
    color: '#14B8A6',
    fieldsCount: 6,
  },
  {
    id: 28,
    pillarKey: 'environment',
    pillarTitle: 'वातावरण/विपद्',
    title: 'ताल तथा पोखरी संरक्षण (पाँचपोखरी)',
    subtitle: 'रामसार सिमसार • ६ फिल्डहरू',
    indicator: '४,१०० मी. उचाइको विश्वकै ९औँ रामसार सिमसार कुण्ड • शून्य प्लास्टिक अभियान',
    progressPct: 96,
    icon: <Droplets size={20} />,
    color: '#0EA5E9',
    fieldsCount: 6,
  },
  {
    id: 29,
    pillarKey: 'environment',
    pillarTitle: 'वातावरण/विपद्',
    title: 'प्राकृतिक तथा कृत्रिम झरना संरक्षण',
    subtitle: 'पर्यापर्यटन • ५ फिल्डहरू',
    indicator: '७ वटा मुख्य झरनाहरू संरक्षण तथा पर्यटकीय रेलिङ, पदमार्ग निर्माण सम्पन्न',
    progressPct: 84,
    icon: <Droplets size={20} />,
    color: '#3B82F6',
    fieldsCount: 5,
  },
  {
    id: 12,
    pillarKey: 'environment',
    pillarTitle: 'वातावरण/विपद्',
    title: 'विपद् व्यवस्थापन तथा पूर्वतयारी',
    subtitle: 'विपद् सुरक्षा • ५ फिल्डहरू',
    indicator: '८ सुरक्षित आश्रयस्थल (१,६४० क्षमता) • मेलम्ची बाढी पूर्वसूचना सेन्सर जडान',
    progressPct: 90,
    icon: <ShieldAlert size={20} />,
    color: '#EF4444',
    fieldsCount: 5,
  },

  // ── Pillar 5: सुशासन तथा संस्थागत विकास (Governance & Institutional) ────
  {
    id: 15,
    pillarKey: 'governance',
    pillarTitle: 'सुशासन',
    title: 'डिजिटल सुशासन तथा अनलाइन ई-सेवा',
    subtitle: 'ई-शासन • ७ फिल्डहरू',
    indicator: '९१.०% अनलाइन ई-सिफारिस दर • डिजिटल बडापत्र र टोकन प्रणाली सक्रिय',
    progressPct: 93,
    icon: <Activity size={20} />,
    color: '#6366F1',
    fieldsCount: 7,
  },
  {
    id: 1,
    pillarKey: 'governance',
    pillarTitle: 'सुशासन',
    title: 'पालिकाको समग्र परिचय (Municipality Profile)',
    subtitle: 'केन्द्रीय प्रोफाइल • १३ फिल्डहरू',
    indicator: '२०,५४० नागरिक • ५,८०५ घरधुरी • ८ वडा • १८७.२९ वर्ग कि.मि. क्षेत्रफल',
    progressPct: 98,
    icon: <Landmark size={20} />,
    color: '#38BDF8',
    fieldsCount: 13,
  },
  {
    id: 16,
    pillarKey: 'governance',
    pillarTitle: 'सुशासन',
    title: 'वडा अनुसार प्रगति तथा श्रेणी',
    subtitle: 'कार्यसम्पादन • ४ फिल्डहरू',
    indicator: '८ वटै वडाको मासिक कार्यसम्पादन मूल्याङ्कन • सुशासन तथा वित्तीय पारदर्शिता',
    progressPct: 91,
    icon: <Layers size={20} />,
    color: '#8B5CF6',
    fieldsCount: 4,
  },
  {
    id: 17,
    pillarKey: 'governance',
    pillarTitle: 'सुशासन',
    title: 'नागरिक सन्तुष्टि सर्वेक्षण (Citizen CSI)',
    subtitle: 'सेवा गुणस्तर • ६ फिल्डहरू',
    indicator: '८६.४% नागरिक सन्तुष्टि दर • २४ मिनेट औसत सेवा वितरण समय',
    progressPct: 86,
    icon: <CheckCircle2 size={20} />,
    color: '#F43F5E',
    fieldsCount: 6,
  },
  {
    id: 18,
    pillarKey: 'governance',
    pillarTitle: 'सुशासन',
    title: 'Before vs After (२०७४–२०८४) ऐतिहासिक तुलना',
    subtitle: '१० वर्षे रूपान्तरण • ८ फिल्डहरू',
    indicator: 'सडक, स्वास्थ्य, शिक्षा तथा डिजिटल सेवामा ऐतिहासिक परिवर्तनको वैज्ञानिक तुलना',
    progressPct: 88,
    icon: <History size={20} />,
    color: '#38BDF8',
    fieldsCount: 8,
  },
  {
    id: 19,
    pillarKey: 'governance',
    pillarTitle: 'सुशासन',
    title: 'सार्वजनिक सुनुवाइ तथा गुनासो फछ्र्यौट',
    subtitle: 'पारदर्शिता • ५ फिल्डहरू',
    indicator: '९२% गुनासो फछ्र्यौट दर • चौमासिक सार्वजनिक सुनुवाइ तथा सामाजिक परीक्षण',
    progressPct: 92,
    icon: <Scale size={20} />,
    color: '#10B981',
    fieldsCount: 5,
  },
];

export const ThematicPillarsMatrix: React.FC<{ readOnly?: boolean }> = ({ readOnly = false }) => {
  const navigate = useNavigate();
  const [selectedPillar, setSelectedPillar] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const handleOpenModule = (moduleId: number) => {
    const target = readOnly ? '/progress-reports' : '/app/progress-reports';
    navigate(target, { state: { selectedModuleKey: moduleId, activeTab: 'forms' } });
  };

  const filteredItems = PANCHPOKHARI_33_SECTORS.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.indicator.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPillar = selectedPillar === 'all' || item.pillarKey === selectedPillar;
    return matchesSearch && matchesPillar;
  });

  const activePillars = selectedPillar === 'all'
    ? THEMATIC_PILLARS
    : THEMATIC_PILLARS.filter((p) => p.key === selectedPillar);

  return (
    <div className="thematic-pillars-wrapper">
      {/* ── Toolbar: Search + Pillar Filter Buttons ───────────────────────── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          background: '#ffffff',
          padding: '1rem 1.25rem',
          borderRadius: '16px',
          border: '1.5px solid #e2e8f0',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setSelectedPillar('all')}
            style={{
              padding: '0.45rem 1rem',
              borderRadius: '10px',
              border: '1.5px solid',
              borderColor: selectedPillar === 'all' ? '#0284c7' : '#e2e8f0',
              background: selectedPillar === 'all' ? '#0284c7' : '#f8fafc',
              color: selectedPillar === 'all' ? '#ffffff' : '#475569',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: selectedPillar === 'all' ? '0 2px 8px rgba(2, 132, 199, 0.3)' : 'none',
            }}
          >
            सबै ३३ विषयगत क्षेत्रहरू
          </button>
          {THEMATIC_PILLARS.map((p) => (
            <button
              key={p.key}
              onClick={() => setSelectedPillar(p.key)}
              style={{
                padding: '0.45rem 0.9rem',
                borderRadius: '10px',
                border: '1.5px solid',
                borderColor: selectedPillar === p.key ? p.color : '#e2e8f0',
                background: selectedPillar === p.key ? p.color : '#f8fafc',
                color: selectedPillar === p.key ? '#ffffff' : '#475569',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                boxShadow: selectedPillar === p.key ? `0 2px 8px ${p.color}40` : 'none',
              }}
            >
              <span>{p.title.split(' ')[1]}</span>
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: '#f8fafc',
            border: '1.5px solid #cbd5e1',
            borderRadius: '10px',
            padding: '0.45rem 0.85rem',
            minWidth: '280px',
          }}
        >
          <Search size={16} color="#64748b" />
          <input
            type="text"
            placeholder="३३ क्षेत्र, सडक, खानेपानी, स्वास्थ्य खोज्नुहोस्..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#0f172a',
              fontSize: '0.82rem',
              fontWeight: 600,
              width: '100%',
            }}
          />
        </div>
      </div>

      {/* ── 5 Pillar Sections ─────────────────────────────────────────────── */}
      {activePillars.map((pillar) => {
        const pillarItems = filteredItems.filter((i) => i.pillarKey === pillar.key);
        if (pillarItems.length === 0) return null;

        const avgScore = Math.round(
          pillarItems.reduce((acc, curr) => acc + curr.progressPct, 0) / pillarItems.length
        );

        return (
          <div className="pillar-card-box" key={pillar.key}>
            {/* Pillar Header */}
            <div className="pillar-box-header">
              <div className="pillar-title-area">
                <div className="pillar-icon-badge" style={{ background: pillar.bgColor }}>
                  {pillar.icon}
                </div>
                <div>
                  <h3 className="pillar-heading">
                    <span>{pillar.title}</span>
                    <span
                      style={{
                        fontSize: '0.74rem',
                        fontWeight: 800,
                        color: pillar.color,
                        background: `${pillar.color}20`,
                        padding: '2px 8px',
                        borderRadius: '6px',
                        border: `1px solid ${pillar.color}40`,
                      }}
                    >
                      {toNepaliDigits(pillarItems.length)} क्षेत्रहरू
                    </span>
                  </h3>
                  <p className="pillar-subtext">{pillar.desc}</p>
                </div>
              </div>

              <div className="pillar-progress-stat">
                <span className="pillar-stat-pill" style={{ background: `${pillar.color}20`, color: pillar.color }}>
                  औसत प्रगति: {toNepaliDigits(avgScore)}%
                </span>
              </div>
            </div>

            {/* Items Grid */}
            <div className="pillar-items-grid">
              {pillarItems.map((item) => (
                <div className="pillar-item-card" key={item.id}>
                  <div>
                    <div className="pillar-item-header">
                      <div
                        className="pillar-item-icon"
                        style={{ background: `${item.color}22`, color: item.color }}
                      >
                        {item.icon}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="pillar-item-title" title={item.title}>
                          {item.title}
                        </div>
                        <div className="pillar-item-subtitle">{item.subtitle}</div>
                      </div>
                    </div>

                    <div className="pillar-item-indicator" style={{ marginTop: '0.75rem' }}>
                      📍 {item.indicator}
                    </div>
                  </div>

                  <div>
                    <div className="pillar-item-prog-wrap" style={{ marginBottom: '0.65rem' }}>
                      <div className="pillar-item-prog-labels">
                        <span>प्रगति सूचक</span>
                        <span style={{ color: item.color }}>{toNepaliDigits(item.progressPct)}%</span>
                      </div>
                      <div className="pillar-item-prog-bar">
                        <div
                          className="pillar-item-prog-fill"
                          style={{ width: `${item.progressPct}%`, background: item.color }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.7rem', color: '#64748B' }}>
                        ID: #{item.id}
                      </span>
                      <button
                        type="button"
                        className="pillar-item-btn"
                        onClick={() => handleOpenModule(item.id)}
                        title="यस क्षेत्रको प्रगति प्रतिवेदन तथा फाराम खोल्नुहोस्"
                      >
                        <span>फाराम / प्रतिवेदन खोल्नुहोस्</span>
                        <ChevronRight size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
