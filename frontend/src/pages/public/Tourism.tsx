import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { tourismApi, type Destination, type TourPackage, type Hotel, type LocalProduct } from '../../api/tourism';
import { api } from '../../api/client';
import { 
  Mountain, 
  MapPin, 
  Clock, 
  Calendar, 
  Compass, 
  Home, 
  ShoppingBag, 
  Search, 
  Users, 
  Phone, 
  CheckCircle2, 
  Sparkles,
  ChevronRight,
  ShieldAlert,
  AlertTriangle,
  Droplets,
  Wifi,
  WifiOff,
  Bed,
  Footprints,
  Flame,
  HeartHandshake,
  Eye,
  ExternalLink,
  X,
  Map as MapIcon,
  Info,
  Navigation,
  Activity,
  Layers,
  Sparkle,
  CloudSun,
  Wind,
  Thermometer,
  Gauge,
  Utensils,
  Waves,
  Sun,
  Moon,
  Star,
  FileText,
  Headphones,
  Video,
  Globe,
  DollarSign,
  TrendingUp,
  Download
} from 'lucide-react';
import { BookingModal } from '../../features/tourism/components/BookingModal';
import { Terrain3DView } from '../../components/maps/Terrain3DView';

// --- Types for Trekking & Cultural Route Twin ---
interface RouteStage {
  id: string;
  stageNo: number;
  title: string;
  altitudeMeters: number;
  elevationGain: string;
  distanceKm: number;
  durationHours: string;
  terrainType: string;
  waterSupply: string;
  networkStatus: 'ntc_4g' | 'ntc_weak' | 'ncell_4g' | 'no_network';
  accommodation: string;
  caution: string;
  highlights: string[];
  lat: number;
  lng: number;
  wardNo: number;
}

interface TrekRoute {
  id: string;
  name: string;
  subtitle: string;
  maxAltitude: number;
  durationDays: number;
  difficulty: 'moderate' | 'challenging' | 'easy';
  bestSeason: string;
  description: string;
  stages: RouteStage[];
}

// 1. Panchpokhari Sacred Lakes Trek (Classical Circuit)
const PANCHPOKHARI_ROUTE: TrekRoute = {
  id: 'panchpokhari-circuit',
  name: 'पवित्र पाँचपोखरी तीर्थ पदमार्ग (Panchpokhari Sacred Trek)',
  subtitle: 'विश्वकै नवौँ उच्च स्थानको पवित्र कुण्ड तथा जुगल हिमाल काखको ५ दिने शास्त्रीय यात्रा',
  maxAltitude: 4100,
  durationDays: 5,
  difficulty: 'challenging',
  bestSeason: 'भदौ - कात्तिक (शरद) तथा चैत - जेठ (वसन्त)',
  description: 'सिन्धुपाल्चोकको उत्तरी सीमानामा अवस्थित पाँचपोखरी (४,१०० मी.) हिन्दु तथा बौद्ध धर्मावलम्बीहरूको परम पवित्र तीर्थस्थल हो। जनैपूर्णिमा मेलामा यहाँ हजारौँ भक्तजन र धामीझाँक्रीहरूको भव्य जमघट हुन्छ।',
  stages: [
    {
      id: 'stage-1',
      stageNo: 1,
      title: 'काठमाडौं -> मेलम्चीपुल -> भोताङ (प्रवेशद्वार)',
      altitudeMeters: 2100,
      elevationGain: '+७०० मी. (सवारी/पैदल)',
      distanceKm: 65,
      durationHours: 'जिप ४-५ घण्टा, पैदल १ घण्टा',
      terrainType: 'पक्की/ग्राभेल सडक, हरियाली पहाड, तामाङ र शेर्पा बस्ती',
      waterSupply: 'प्रशस्त (पाइपलाइन तथा मूलको पानी)',
      networkStatus: 'ntc_4g',
      accommodation: 'भोताङ सामुदायिक होमस्टे तथा स्थानीय होटल (२५+ बेड)',
      caution: 'भोताङबाट माथि गाडी चल्दैन, यहाँबाट सम्पूर्ण आवश्यक बन्दोबस्तीका सामान र औषधि रुजु गर्नुहोस्।',
      highlights: ['भोताङ ड्रागन गुफा', 'किवी तथा रातो आलु खेती', 'सामुदायिक ह्योल्मो स्वागत'],
      lat: 27.9790,
      lng: 85.6580,
      wardNo: 3,
    },
    {
      id: 'stage-2',
      stageNo: 2,
      title: 'भोताङ -> छिमिटि झरना -> देउराली',
      altitudeMeters: 2200,
      elevationGain: '+१०० मी. (नदी किनार हुँदै उकालो)',
      distanceKm: 7.5,
      durationHours: '३.५ - ४ घण्टा',
      terrainType: 'घना सल्ला तथा गुराँसको जङ्गल, छिमिटि खोला, झोलुङ्गे पुल',
      waterSupply: 'छिमिटि झरना तथा मूलको पानी (उमालेर पिउने)',
      networkStatus: 'ntc_weak',
      accommodation: 'छिमिटि टी-हाउस तथा टेन्ट क्याम्पिङ स्थल',
      caution: 'वर्षायाममा बाटो चिप्लो हुन सक्छ, लौरी (Trekking pole) प्रयोग गर्नुहोस्।',
      highlights: ['छिमिटि प्राकृतिक झरना', 'क्याम्पिङ ग्राउन्ड', 'जङ्गली पन्छी र वनस्पति'],
      lat: 27.9810,
      lng: 85.6620,
      wardNo: 3,
    },
    {
      id: 'stage-3',
      stageNo: 3,
      title: 'देउराली -> नोस्यामपाटी (लेक सुरु विन्दु)',
      altitudeMeters: 3300,
      elevationGain: '+१,१०० मी. (ठाडो उकालो)',
      distanceKm: 9.0,
      durationHours: '५ - ६ घण्टा',
      terrainType: 'अल्पाइन बुट्यान, गुराँसको फेद, हावा चल्ने डाँडा',
      waterSupply: 'मुहानको पानी (नोस्यामपाटी नजिक सीमित)',
      networkStatus: 'ntc_weak',
      accommodation: 'सिजनल टी-हाउस शेल्टर तथा सामुदायिक पाटी',
      caution: '⚠️ ३,००० मिटर पार भएपछि लेक लाग्ने (AMS) जोखिम हुन्छ। छिटो नहिँड्नुहोस्, प्रशस्त पानी (४ लिटर) पिउनुहोस्।',
      highlights: ['लाङटाङ र जुगल हिमश्रृङ्खलाको पहिलो दृश्य', 'चौंरी खर्क', 'बादलभन्दा माथिको दृश्य'],
      lat: 28.0080,
      lng: 85.6850,
      wardNo: 3,
    },
    {
      id: 'stage-4',
      stageNo: 4,
      title: 'नोस्यामपाटी -> लौरीविनायक',
      altitudeMeters: 3700,
      elevationGain: '+४०० मी. (ढुङ्गेनी सिँढी र रिज ट्रेक)',
      distanceKm: 5.2,
      durationHours: '३ - ४ घण्टा',
      terrainType: 'रूखविहीन अल्पाइन रिज, ढुङ्गेनी ठाडो उकालो, धार्मिक लौरी थलो',
      waterSupply: 'सीमित (बोकेर लैजान सिफारिस)',
      networkStatus: 'ntc_weak',
      accommodation: 'तीर्थयात्री पाटी / सिजनल टिन शेल्टर',
      caution: 'हावाको चाप न्यून हुन्छ। टाउको दुख्ने वा वाकवाकी लागेमा आराम गर्नुहोस्, अक्सिजन सतर्कता अपनाउनुहोस्।',
      highlights: ['धार्मिक लौरी विसाउने पवित्र थलो', 'सूर्योदय दर्शन', 'अद्भूत हिम दृश्य'],
      lat: 28.0260,
      lng: 85.7010,
      wardNo: 3,
    },
    {
      id: 'stage-5',
      stageNo: 5,
      title: 'लौरीविनायक -> पवित्र पाँचपोखरी कुण्ड (अन्तिम गन्तव्य)',
      altitudeMeters: 4100,
      elevationGain: '+४०० मी.',
      distanceKm: 4.0,
      durationHours: '२.५ - ३ घण्टा',
      terrainType: 'उच्च हिमाली हिउँद/चट्टानी उपत्यका, ५ वटा पवित्र कुण्डको बेसिन',
      waterSupply: 'पवित्र कुण्ड (धार्मिक मर्यादा अनुसार पिउन योग्य, नुहाउन/फोहोर गर्न निषेध)',
      networkStatus: 'ntc_weak',
      accommodation: 'धर्मशाला, स्थानीय सिजनल लज तथा क्याम्पिङ',
      caution: 'राति अत्यधिक चिसो (-५° देखि -१०°C)। डाउन ज्याकेट, स्लिपिङ ब्याग अनिवार्य। पोखरीमा खुट्टा हाल्न वा फोहोर गर्न पूर्ण निषेध।',
      highlights: ['५ पवित्र कुण्ड (भैरव, सरस्वती, सूर्य, गणेश, तारा)', 'भगवान शिव मन्दिर', 'जुगल हिमालको काख'],
      lat: 28.0425,
      lng: 85.7140,
      wardNo: 3,
    }
  ]
};

// 2. Aama Yangri Peak Trek
const AAMA_YANGRI_ROUTE: TrekRoute = {
  id: 'aama-yangri-peak',
  name: 'आमा याङ्ग्री पिक तथा ह्योल्मो सांस्कृतिक पदमार्ग (Aama Yangri Peak)',
  subtitle: 'ह्योल्मो कुलदेवी शिखर (३,७७१ मी.), ऐतिहासिक तार्केघ्याङ गुम्बा र ३६०° हिम-पानोरामा',
  maxAltitude: 3771,
  durationDays: 3,
  difficulty: 'moderate',
  bestSeason: 'असोज - मंसिर तथा फागुन - जेठ',
  description: 'ह्योल्मो जातिकी संरक्षक देवीको रूपमा पुजिने आमा याङ्ग्री पिक काठमाडौं उपत्यका नजिकैको उत्कृष्ट ३६० डिग्री भ्यु-पोइन्ट हो। यहाँबाट जुगल, गणेश, लाङटाङ र दोर्जे लाक्पा हिमाल आँखै अगाडि देखिन्छन्।',
  stages: [
    {
      id: 'ay-stage-1',
      stageNo: 1,
      title: 'काठमाडौं -> मेलम्चीघ्याङ / तार्केघ्याङ',
      altitudeMeters: 2600,
      elevationGain: '+१,२०० मी. (सवारी/पैदल)',
      distanceKm: 75,
      durationHours: 'सवारी ५-६ घण्टा',
      terrainType: 'पहाडी सडक, ह्योल्मो शेर्पा गाउँ, पुराना काष्ठकला घरहरू',
      waterSupply: 'प्रशस्त (गाउँको मूल र पाइपलाइन)',
      networkStatus: 'ntc_4g',
      accommodation: 'तार्केघ्याङ ह्योल्मो पारिवारिक होमस्टे (१५+ घर)',
      caution: 'ह्योल्मो संस्कृति र परम्परागत शिष्टाचारको सम्मान गर्नुहोस्।',
      highlights: ['सयौँ वर्ष पुरानो तार्केघ्याङ गुम्बा', 'ह्योल्मो मौलिक खाना (स्याम्बाक, तेन्दु)', 'माने र छोर्तेन'],
      lat: 28.0120,
      lng: 85.6940,
      wardNo: 1,
    },
    {
      id: 'ay-stage-2',
      stageNo: 2,
      title: 'तार्केघ्याङ -> झाँक्री डाँडा / चौंरी खर्क',
      altitudeMeters: 3100,
      elevationGain: '+५०० मी. (उकालो पदमार्ग)',
      distanceKm: 4.8,
      durationHours: '२.५ - ३ घण्टा',
      terrainType: 'बाक्लो लालीगुराँस, धुपी र सल्लाको जङ्गल, काठे गोठहरू',
      waterSupply: 'बाटोको मूल धारा',
      networkStatus: 'ntc_4g',
      accommodation: 'सिजनल गोठ तथा चिया पसल (दिवा विश्राम)',
      caution: 'जङ्गली बाटोमा एक्लै नहिँड्नुहोस्, बाटो स्पष्ट चिह्न पछ्याउनुहोस्।',
      highlights: ['गुराँसको फुल (वसन्तमा)', 'कस्तुरी मृग र डाँफे विचरण क्षेत्र', 'चौंरी पालन'],
      lat: 28.0090,
      lng: 85.6880,
      wardNo: 2,
    },
    {
      id: 'ay-stage-3',
      stageNo: 3,
      title: 'झाँक्री डाँडा -> आमा याङ्ग्री पिक (३,७७१ मी.)',
      altitudeMeters: 3771,
      elevationGain: '+६७१ मी. (अन्तिम उकालो)',
      distanceKm: 3.8,
      durationHours: '२ - २.५ घण्टा',
      terrainType: 'रिज ट्रेक, हावा चल्ने चट्टानी चुचुरो, बौद्ध लुङदार (शान्ति ध्वजा)',
      waterSupply: 'चुचुरोमा पानी छैन (बोकेर लैजान अनिवार्य)',
      networkStatus: 'ntc_4g',
      accommodation: 'डे-हाइक (दिउँसो तार्केघ्याङ वा मेलम्चीघ्याङ फर्किने)',
      caution: 'शिखरमा तीव्र हावा चल्छ। विन्डप्रुफ ज्याकेट, टोपी र चश्मा अनिवार्य।',
      highlights: ['आमा याङ्ग्री कुलदेवी छोर्तेन', '३६०° जुगल, गणेश र लाङटाङ हिमश्रृङ्खला', 'सूर्योदयको स्वर्णिम दृश्य'],
      lat: 28.0062,
      lng: 85.6795,
      wardNo: 2,
    }
  ]
};

// 3. Tipeni - Chhimti - Manekharka Cultural Circuit (NEW 3rd Route)
const TIPENI_CHHIMTI_ROUTE: TrekRoute = {
  id: 'tipeni-chhimti-circuit',
  name: 'तिपेनी–छिम्ती–मानेखर्क सम्पदा पदमार्ग (Cultural Circuit)',
  subtitle: 'मेलम्ची नदी किनार, हरियाली चिया/किवी बगान, तामाङ र ह्योल्मो मौलिक बस्ती तथा छिम्ती झरनाको ४ दिने यात्रा',
  maxAltitude: 2200,
  durationDays: 4,
  difficulty: 'easy',
  bestSeason: 'वर्षैभरी (विशेषगरी असोज - वैशाख)',
  description: 'पाँचपोखरीको तल्लो तथा मध्य पहाडी भूभाग समेटिएको यो पदमार्ग स्थानीय संस्कृति, कृषि पर्यटन, झरना र सामुदायिक होमस्टे अनुभवका लागि उत्कृष्ट छ। यो पदयात्रा जुनसुकै उमेर समूहका पदयात्रीहरूका लागि सुरक्षित र सहज छ।',
  stages: [
    {
      id: 'tc-stage-1',
      stageNo: 1,
      title: 'काठमाडौं -> मेलम्ची -> तिपेनी बजार',
      altitudeMeters: 1200,
      elevationGain: '+४०० मी. (सवारी)',
      distanceKm: 52,
      durationHours: 'सवारी ३.५ - ४ घण्टा',
      terrainType: 'कालोपत्रे/ग्राभेल सडक, मेलम्ची र इन्द्रावती नदी किनार, बजार बस्ती',
      waterSupply: 'प्रशस्त (होटल तथा बजार)',
      networkStatus: 'ntc_4g',
      accommodation: 'तिपेनी स्थानीय लज तथा होटलहरू (४०+ बेड)',
      caution: 'मेलम्ची–तिपेनी सडक खण्डमा वर्षायाममा सामान्य हिलो र पहिरो सतर्कता राख्नुहोस्।',
      highlights: ['इन्द्रावती नदी संगम', 'तिपेनी बजार चहलपहल', 'स्थानीय ताजा ट्राउट माछा'],
      lat: 27.9150,
      lng: 85.6020,
      wardNo: 6,
    },
    {
      id: 'tc-stage-2',
      stageNo: 2,
      title: 'तिपेनी -> थाङपालधाप -> मानेखर्क तामाङ सम्पदा',
      altitudeMeters: 1850,
      elevationGain: '+६५० मी. (पदमार्ग तथा ग्रामीण सडक)',
      distanceKm: 9.2,
      durationHours: '३.५ - ४ घण्टा',
      terrainType: 'पहाडी सिँढी बाटो, परम्परागत ढुङ्गाका घरहरू, तामाङ बस्ती, खेतबारी',
      waterSupply: 'सामुदायिक धारा तथा मूलको पानी',
      networkStatus: 'ntc_4g',
      accommodation: 'मानेखर्क सामुदायिक होमस्टे (१०+ घर, ३५ बेड)',
      caution: 'उकालो बाटोमा बिस्तारै हिँड्नुहोस्, स्थानीय सांस्कृतिक परम्पराको सम्मान गर्नुहोस्।',
      highlights: ['मानेखर्क ऐतिहासिक तामाङ बस्ती', 'परम्परागत बौद्ध माने र छोर्तेन', 'अर्गानिक तामाङ खाना'],
      lat: 27.9480,
      lng: 85.6240,
      wardNo: 4,
    },
    {
      id: 'tc-stage-3',
      stageNo: 3,
      title: 'मानेखर्क -> छिम्ती प्राकृतिक झरना तथा क्याम्पिङ',
      altitudeMeters: 2200,
      elevationGain: '+३५० मी.',
      distanceKm: 6.8,
      durationHours: '३ घण्टा',
      terrainType: 'घना पाइन र गुराँसको जङ्गल, छिम्ती खोला कोरिडोर, ढुङ्गेनी गोरेटो',
      waterSupply: 'कञ्चन पहाडी झरनाको पानी (उमालेर पिउन योग्य)',
      networkStatus: 'ntc_weak',
      accommodation: 'छिम्ती इको टी-हाउस तथा क्याम्पिङ साइट',
      caution: 'झरना नजिक ढुङ्गा चिप्लो हुन सक्छ, पौडी खेल्दा गहिरो दहमा सतर्क रहनुहोस्।',
      highlights: ['१००+ मिटर अग्लो छिम्ती झरना', 'टेन्ट क्याम्पिङ र क्याम्पफायर', 'नदी किनार पदयात्रा'],
      lat: 27.9750,
      lng: 85.6540,
      wardNo: 3,
    },
    {
      id: 'tc-stage-4',
      stageNo: 4,
      title: 'छिम्ती -> भोताङ ड्रागन गुफा तथा किवी बगान -> काठमाडौं फिर्ता',
      altitudeMeters: 2100,
      elevationGain: '-१०० मी. (ओरालो/समतल)',
      distanceKm: 4.5,
      durationHours: '२ घण्टा पैदल + सवारी ५ घण्टा',
      terrainType: 'कृषि भूभाग, किवी बगान, तामाङ-ह्योल्मो बस्ती',
      waterSupply: 'प्रशस्त',
      networkStatus: 'ntc_4g',
      accommodation: 'भोताङ होमस्टे / काठमाडौं फिर्ता',
      caution: 'भोताङबाट काठमाडौंका लागि बिहान र दिउँसो छुट्ने नियमित जिप/बसको समय तालिका अग्रिम बुझ्नुहोस्।',
      highlights: ['ड्रागन गुफा अवलोकन', 'किवी फल टिप्ने अनुभव', 'स्थानीय कृषि कोसेली खरिद'],
      lat: 27.9790,
      lng: 85.6580,
      wardNo: 3,
    }
  ]
};

// --- Five Sacred Lakes (पाँचपोखरीका ५ पवित्र कुण्डहरू) ---
interface SacredLake {
  id: string;
  name: string;
  nameEn: string;
  altitudeMeters: number;
  depthMeters: number;
  areaRopani: number;
  waterColor: string;
  colorHex: string;
  deitySignificance: string;
  description: string;
  mythology: string;
  rituals: string;
  imageUrl: string;
  coordinates: { lat: number; lng: number };
}

const FIVE_SACRED_LAKES: SacredLake[] = [
  {
    id: 'bhairav-kunda',
    name: '१. भैरव कुण्ड (Bhairav Kunda)',
    nameEn: 'Bhairav Lake (The Fierce Protector)',
    altitudeMeters: 4100,
    depthMeters: 32,
    areaRopani: 42,
    waterColor: 'गाढा गाजले नीलो (Deep Navy Blue)',
    colorHex: '#1e3a8a',
    deitySignificance: 'भगवान शिवको उग्र एवं संहारक भैरव स्वरूप',
    description: 'पाँचपोखरीका पाँच कुण्डहरूमध्ये सबैभन्दा विशाल, गहिरो र मुख्य कुण्ड हो। यसको पानी गाढा निलो र रहस्यमयी देखिन्छ। वरिपरि काला चट्टानी पहाडहरू र जुगल हिमालको प्रतिविम्ब यस कुण्डमा झल्किन्छ।',
    mythology: 'समुन्द्र मन्थनबाट निस्किएको कालकूट विष सेवन गरेपछि घाँटीको जलन शान्त पार्न महादेवले त्रिशूल प्रहार गरी जल निकालेको र यहाँ ध्यानलीन भएको पौराणिक मान्यता छ।',
    rituals: 'भैरव कुण्डको तटमा रहेको शिव मन्दिरमा जनैपूर्णिमाका दिन विशेष पूजाअर्चना गरिन्छ। धामीझाँक्रीहरूले यहाँ विशेष अनुष्ठान गरी शक्ति जगाउने परम्परा छ।',
    imageUrl: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=700&q=80',
    coordinates: { lat: 28.0425, lng: 85.7140 }
  },
  {
    id: 'saraswati-kunda',
    name: '२. सरस्वती कुण्ड (Saraswati Kunda)',
    nameEn: 'Saraswati Lake (The Lake of Wisdom)',
    altitudeMeters: 4095,
    depthMeters: 18,
    areaRopani: 26,
    waterColor: 'कञ्चन स्फटिक सेतो/पारदर्शी (Crystal Clear White)',
    colorHex: '#38bdf8',
    deitySignificance: 'विद्या, बुद्धि, वाणी र संगीतकी देवी माँ सरस्वती',
    description: 'भैरव कुण्डको नजिकै रहेको यो कुण्ड अत्यन्त शान्त र कञ्चन छ। पानी यति सफा छ कि पिंधका ढुङ्गाहरू स्पष्ट देखिन्छन्। यसलाई पवित्र ज्ञानको मुहान मानिन्छ।',
    mythology: 'यस कुण्डको जल आचमन गर्नाले बुद्धि, वाणी र वाकसिद्धि प्राप्त हुने जनविश्वास छ। लामा गुरुहरूले साधना अघि यस कुण्डको जल अभिषेक गर्ने गर्दछन्।',
    rituals: 'विद्यार्थी तथा साधकहरूले कलम, कापी र रुद्राक्ष यस कुण्डको जलमा छोएर संकल्प लिने गर्दछन्।',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=700&q=80',
    coordinates: { lat: 28.0435, lng: 85.7130 }
  },
  {
    id: 'surya-kunda',
    name: '३. सूर्य कुण्ड (Surya Kunda)',
    nameEn: 'Surya Lake (The Lake of Radiance)',
    altitudeMeters: 4110,
    depthMeters: 24,
    areaRopani: 31,
    waterColor: 'सुनौलो चम्किलो (Golden Reflected)',
    colorHex: '#eab308',
    deitySignificance: 'प्रत्यक्ष देवता भगवान सूर्य नारायण',
    description: 'बिहानीपख जुगल हिमालबाट झुल्कने सूर्यको पहिलो सुनौलो किरण सिधै यस कुण्डमा ठोकिँदा कुण्डको पानी सुन जस्तै चम्किन्छ। यो दृश्य हेर्न बिहानै पदयात्रीहरू भेला हुन्छन्।',
    mythology: 'भगवान सूर्यले यस स्थानमा उर्जा संकलन गरी हिमालयको हिउँ पगाल्न र जगतलाई जीवन प्रदान गर्न प्रार्थना गरेको जनविश्वास छ।',
    rituals: 'बिहानी सूर्योदयको समयमा सूर्यलाई अर्घ्य दिने र कुण्डको दर्शन गर्ने परम्परा छ। यसले आँखाको ज्योति र शरीरमा तेज बढाउने विश्वास गरिन्छ।',
    imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=700&q=80',
    coordinates: { lat: 28.0445, lng: 85.7155 }
  },
  {
    id: 'ganesh-kunda',
    name: '४. गणेश कुण्ड (Ganesh Kunda)',
    nameEn: 'Ganesh Lake (The Remover of Obstacles)',
    altitudeMeters: 4085,
    depthMeters: 15,
    areaRopani: 22,
    waterColor: 'हल्का हरियो/फिरोजा (Turquoise Emerald)',
    colorHex: '#0d9488',
    deitySignificance: 'विघ्नहर्ता प्रथम पूज्य भगवान श्री गणेश',
    description: 'यस कुण्डको एकातर्फको प्राकृतिक चट्टानको बनावट भगवान गणेशको सुँड र कान जस्तो देखिने अनौठो प्राकृतिक आकृति रहेको छ। पानी हरियो फिरोजा रङ्गको छ।',
    mythology: 'कुनै पनि शुभ यात्रा वा कार्य सुरु गर्नु अघि विघ्न-बाधा नआओस् भनी देवताहरूले यहाँ गणेशजीको आव्हान गरेको किंवदन्ती छ।',
    rituals: 'पाँचपोखरी पुग्ने भक्तजनहरूले सबैभन्दा पहिले गणेश कुण्डको दर्शन गरी यात्राको पूर्णताको कामना गर्दछन्। लड्डु र फलफूल चढाउने गरिन्छ।',
    imageUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=700&q=80',
    coordinates: { lat: 28.0410, lng: 85.7125 }
  },
  {
    id: 'tara-kunda',
    name: '५. तारा कुण्ड (Tara Kunda)',
    nameEn: 'Tara Lake (The Goddess of Compassion)',
    altitudeMeters: 4090,
    depthMeters: 12,
    areaRopani: 19,
    waterColor: 'आकाशीय नीलो (Sky Cerulean Blue)',
    colorHex: '#0284c7',
    deitySignificance: 'करुणा र मुक्तिकी प्रतीक देवी आर्य तारा (Jetsun Dolma)',
    description: 'बौद्ध धर्मावलम्बीहरूका लागि अत्यन्त पावन कुण्ड। यसलाई हरित तारा (Green Tara) र श्वेत तारा (White Tara) को करुणाको प्रतीक मानिन्छ। यसको वरपर सधैँ शान्ति र आनन्दको अनुभूति हुन्छ।',
    mythology: 'बोदिसत्व अवलोकितेश्वरको आँसुबाट तारा देवीको उत्पत्ति भई यहाँका प्राणीहरूको दु:ख निवारण गर्न वास गरेको बौद्ध दर्शनको मान्यता छ।',
    rituals: 'कुण्ड वरिपरि बौद्ध ध्वजा (लुङदार) टाँगिने र "ॐ तारे तुत्तारे तुरे सोहा" मन्त्र जप गर्दै परिक्रमा गर्ने गरिन्छ।',
    imageUrl: 'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=700&q=80',
    coordinates: { lat: 28.0418, lng: 85.7160 }
  }
];

// --- Live Mountain Weather Stations ---
interface WeatherStation {
  id: string;
  name: string;
  altitudeMeters: number;
  tempCurrent: string;
  tempRange: string;
  weatherCondition: string;
  windSpeed: string;
  windChill: string;
  barometricPressure: string;
  oxygenLevel: string;
  amsRiskLevel: 'उच्च (High Risk)' | 'मध्यम (Moderate)' | 'न्यून (Safe)';
  clothingAdvice: string;
  updatedAt: string;
}

const MOUNTAIN_WEATHER_STATIONS: WeatherStation[] = [
  {
    id: 'panchpokhari-base',
    name: 'पाँचपोखरी कुण्ड तथा बेस क्याम्प',
    altitudeMeters: 4100,
    tempCurrent: '३°C',
    tempRange: '-४°C देखि ९°C',
    weatherCondition: 'सफा / पारिलो घाम',
    windSpeed: '१८ कि.मि./घण्टा (उ.पू.)',
    windChill: '-२°C',
    barometricPressure: '६१२ hPa',
    oxygenLevel: '६१% (समुद्र सतहको तुलनामा)',
    amsRiskLevel: 'उच्च (High Risk)',
    clothingAdvice: 'थर्मल इनर, डाउन ज्याकेट, विन्डप्रुफ ट्राउजर, स्लिपिङ ब्याग, ऊनी टोपी र पञ्जा अनिवार्य।',
    updatedAt: 'आज बिहान ७:०० बजे (Live Sensor)'
  },
  {
    id: 'aama-yangri-summit',
    name: 'आमा याङ्ग्री कुलदेवी पिक शिखर',
    altitudeMeters: 3771,
    tempCurrent: '६°C',
    tempRange: '०°C देखि १२°C',
    weatherCondition: 'आंशिक बदली / सफा हिमाल',
    windSpeed: '२२ कि.मि./घण्टा (पश्चिमी हावा)',
    windChill: '२°C',
    barometricPressure: '६३८ hPa',
    oxygenLevel: '६५%',
    amsRiskLevel: 'मध्यम (Moderate)',
    clothingAdvice: 'विन्डचिटर ज्याकेट, ट्रेकिङ बुट, पोलाराइज्ड सनग्लास, वाटरप्रुफ टोपी।',
    updatedAt: 'आज बिहान ७:३० बजे'
  },
  {
    id: 'bhotang-base',
    name: 'भोताङ प्रवेशद्वार तथा तिपेनी बेस',
    altitudeMeters: 2100,
    tempCurrent: '१६°C',
    tempRange: '११°C देखि २२°C',
    weatherCondition: 'सुहाउँदो पारिलो घाम',
    windSpeed: '८ कि.मि./घण्टा',
    windChill: '१६°C',
    barometricPressure: '७८५ hPa',
    oxygenLevel: '८२%',
    amsRiskLevel: 'न्यून (Safe)',
    clothingAdvice: 'सामान्य ट्रेकिङ टी-सर्ट, हलुका ज्याकेट, आरामदायी जुत्ता।',
    updatedAt: 'आज बिहान ८:०० बजे'
  }
];

// --- 12 Months Trekking Calendar ---
interface MonthSeason {
  nepaliMonth: string;
  englishMonth: string;
  seasonName: string;
  suitabilityScore: number;
  statusBadge: string;
  temperature: string;
  highlights: string;
  precautions: string;
}

const SEASONAL_TREK_CALENDAR: MonthSeason[] = [
  {
    nepaliMonth: 'वैशाख',
    englishMonth: 'Mid Apr - Mid May',
    seasonName: 'वसन्त (Spring)',
    suitabilityScore: 5,
    statusBadge: 'सर्वोत्कृष्ट (Best)',
    temperature: '५° देखि १५°C',
    highlights: 'लालीगुराँस ढकमक्क फुल्ने, हिमाल छर्लङ्ग देखिने, न्यानो पदयात्रा।',
    precautions: 'दिउँसो हल्का बादल लाग्न सक्छ, सनस्क्रीन र पानी पर्याप्त बोक्नुहोस्।'
  },
  {
    nepaliMonth: 'जेठ',
    englishMonth: 'Mid May - Mid Jun',
    seasonName: 'ग्रीष्म (Summer)',
    suitabilityScore: 4,
    statusBadge: 'उत्कृष्ट (Good)',
    temperature: '८° देखि १८°C',
    highlights: 'लामो दिन, उच्च खर्कहरूमा चौंरी चराउने मौसम, हरियाली वातावरण।',
    precautions: 'महिनाको अन्त्यतिर पूर्व-मनसुन वर्षा हुन सक्छ, रेनकोट साथमा राख्नुहोस्।'
  },
  {
    nepaliMonth: 'असार',
    englishMonth: 'Mid Jun - Mid Jul',
    seasonName: 'वर्षा (Monsoon)',
    suitabilityScore: 2,
    statusBadge: 'वर्षा / सतर्कता',
    temperature: '१०° देखि १७°C',
    highlights: 'झरनाहरू उर्लने, उच्च लेकमा विभिन्न रङ्गीन हिमाली फूलहरू फुल्ने।',
    precautions: 'चिप्लो बाटो, जुका (Leeches) को उच्च जोखिम, पहिरो सतर्कता अनिवार्य।'
  },
  {
    nepaliMonth: 'साउन',
    englishMonth: 'Mid Jul - Mid Aug',
    seasonName: 'वर्षा (Monsoon)',
    suitabilityScore: 2,
    statusBadge: 'वर्षा / सतर्कता',
    temperature: '९° देखि १६°C',
    highlights: 'धार्मिक रुपमा शिव आराधना महिना, साउन पूर्णिमा जनैपूर्णिमा मेलाको तयारी।',
    precautions: 'नदी खोलामा बाढी, बाटोमा पहिरो, वाटरप्रुफ बन्दोबस्ती अनिवार्य।'
  },
  {
    nepaliMonth: 'भदौ',
    englishMonth: 'Mid Aug - Mid Sep',
    seasonName: 'शरद पूर्व (Post Monsoon)',
    suitabilityScore: 5,
    statusBadge: 'सर्वोत्कृष्ट (Best)',
    temperature: '६° देखि १५°C',
    highlights: 'पाँचपोखरीको महान् जनैपूर्णिमा मेला, हजारौँ धामीझाँक्री र तीर्थयात्रीको उत्सव।',
    precautions: 'मेलामा भीडभाड हुने हुँदा धर्मशाला र क्याम्पिङ व्यवस्था अग्रिम मिलाउनुहोस्।'
  },
  {
    nepaliMonth: 'असोज',
    englishMonth: 'Mid Sep - Mid Oct',
    seasonName: 'शरद (Autumn Peak)',
    suitabilityScore: 5,
    statusBadge: 'सर्वोत्कृष्ट (Best)',
    temperature: '४° देखि १३°C',
    highlights: 'वर्षकै सबैभन्दा सफा नीलो आकाश, जुगल र लाङटाङको स्वर्णिम पानोरामा।',
    precautions: 'राति चिसो बढ्ने हुँदा डाउन ज्याकेट र न्यानो लुगा तयार राख्नुहोस्।'
  },
  {
    nepaliMonth: 'कात्तिक',
    englishMonth: 'Mid Oct - Mid Nov',
    seasonName: 'शरद (Late Autumn)',
    suitabilityScore: 5,
    statusBadge: 'सर्वोत्कृष्ट (Best)',
    temperature: '२° देखि १०°C',
    highlights: 'उत्कृष्ट फोटोग्राफी मौसम, स्थिर हावापानी, चाडपर्वको उल्लास।',
    precautions: 'बिहान र बेलुकी तापक्रम शून्य नजिक झर्न सक्छ।'
  },
  {
    nepaliMonth: 'मंसिर',
    englishMonth: 'Mid Nov - Mid Dec',
    seasonName: 'हेमन्त (Pre-Winter)',
    suitabilityScore: 4,
    statusBadge: 'उत्कृष्ट (Good)',
    temperature: '-२° देखि ८°C',
    highlights: 'सफा हिउँको पहिलो तह, शान्त पदमार्ग, काठमाडौं नजिकै हिउँ हेर्न मिल्ने।',
    precautions: 'उच्च लेकमा टी-हाउस बन्द हुन थाल्ने हुँदा बन्दोबस्ती यकिन गरेर मात्र जानुहोस्।'
  },
  {
    nepaliMonth: 'पुस',
    englishMonth: 'Mid Dec - Mid Jan',
    seasonName: 'शिशिर (Winter)',
    suitabilityScore: 3,
    statusBadge: 'मध्यम / चिसो',
    temperature: '-८° देखि ३°C',
    highlights: 'पाँचपोखरीका कुण्डहरू पूर्ण हिउँले जम्ने (Frozen Lakes), असाधारण स्नो दृश्य।',
    precautions: 'कडा जाडो, हिउँमा चिप्लिने जोखिम (क्र्याम्पोन/लौरी आवश्यक), अनुभवी गाइड अनिवार्य।'
  },
  {
    nepaliMonth: 'माघ',
    englishMonth: 'Mid Jan - Mid Feb',
    seasonName: 'शिशिर (Peak Winter)',
    suitabilityScore: 3,
    statusBadge: 'मध्यम / चिसो',
    temperature: '-१०° देखि २°C',
    highlights: 'हिउँका थुप्राहरू, सोनम ल्होसार ह्योल्मो सांस्कृतिक महोत्सव गाउँहरूमा।',
    precautions: '४,००० मिटरमा भारी हिमपात भएमा बाटो अवरुद्ध हुन सक्छ।'
  },
  {
    nepaliMonth: 'फागुन',
    englishMonth: 'Mid Feb - Mid Mar',
    seasonName: 'वसन्त पूर्व (Early Spring)',
    suitabilityScore: 4,
    statusBadge: 'उत्कृष्ट (Good)',
    temperature: '०° देखि १०°C',
    highlights: 'हिउँ पग्लिन सुरु हुने, तल्लो भेगमा गुराँसका कोपिलाहरू लाग्ने।',
    precautions: 'बिहानीपख हिउँ जमेको बाटोमा सतर्कता अपनाउनुहोस्।'
  },
  {
    nepaliMonth: 'चैत',
    englishMonth: 'Mid Mar - Mid Apr',
    seasonName: 'वसन्त (Spring Bloom)',
    suitabilityScore: 5,
    statusBadge: 'सर्वोत्कृष्ट (Best)',
    temperature: '३° देखि १३°C',
    highlights: 'रातो, सेतो र गुलाबी गुराँसले डाँडाहरू राताम्मे हुने, आमा याङ्ग्री पूजा।',
    precautions: 'हावा चल्न सक्छ, विन्डप्रुफ कपडा आवश्यक।'
  }
];

// --- Registered Homestays & Lodges Directory ---
interface HomestayItem {
  id: string;
  name: string;
  type: 'homestay' | 'hotel';
  wardNo: number;
  village: string;
  operatorName: string;
  phone: string;
  roomsCount: number;
  bedsCount: number;
  ratePerPerson: string;
  specialDishes: string[];
  amenities: string[];
  rating: number;
  imageUrl: string;
}

const REGISTERED_HOMESTAYS: HomestayItem[] = [
  {
    id: 'hs-bhotang-1',
    name: 'भोताङ ड्रागन सामुदायिक होमस्टे नं. १',
    type: 'homestay',
    wardNo: 3,
    village: 'भोताङ',
    operatorName: 'दावा दावा शेर्पा',
    phone: '९८४१५२६३७४',
    roomsCount: 6,
    bedsCount: 16,
    ratePerPerson: 'रु १,२०० (कोठा + साँझको खाना + खाजा)',
    specialDishes: ['तामाङ फापरको ढिँडो', 'अर्गानिक सिस्नोको सुप', 'लोकल कुखुराको झोल', 'किवी वाइन'],
    amenities: ['तातो पानी (Solar)', 'NTC 4G WiFi', 'चार्जिङ सुविधा', 'स्थानीय गाइड समन्वय'],
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&q=80'
  },
  {
    id: 'hs-bhotang-2',
    name: 'याङ्ग्री भ्याली इको होमस्टे',
    type: 'homestay',
    wardNo: 3,
    village: 'भोताङ',
    operatorName: 'निमा तामाङ',
    phone: '९८६०९८७६५४',
    roomsCount: 5,
    bedsCount: 12,
    ratePerPerson: 'रु १,१५०',
    specialDishes: ['रातो आलुको दम', 'गुन्द्रुक-भटमास', 'मकैको च्याँख्ला', 'हिमाली मह'],
    amenities: ['तातो पानी', 'क्याम्पफायर थलो', 'पार्किङ', 'प्राङ्गारिक तरकारी'],
    rating: 4.7,
    imageUrl: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=600&q=80'
  },
  {
    id: 'hs-tarkegyang-1',
    name: 'तार्केघ्याङ ह्योल्मो हेरिटेज होमस्टे',
    type: 'homestay',
    wardNo: 1,
    village: 'तार्केघ्याङ',
    operatorName: 'कर्मा छेवाङ ह्योल्मो',
    phone: '९८५१०२३४५६',
    roomsCount: 8,
    bedsCount: 22,
    ratePerPerson: 'रु १,५०० (ह्योल्मो सांस्कृतिक प्याकेज)',
    specialDishes: ['ह्योल्मो स्याम्बाक (परम्परागत रोटी)', 'तेन्दु (नुडल्स सुप)', 'चौंरीको शुद्ध घिउ', 'छुर्पीको तरकारी'],
    amenities: ['गुम्बा दृश्य रुम', 'परम्परागत काष्ठकला', 'ह्योल्मो सांस्कृतिक नाच', 'WiFi'],
    rating: 4.9,
    imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80'
  },
  {
    id: 'hs-tarkegyang-2',
    name: 'आमा याङ्ग्री पिक भ्यु लज एण्ड होमस्टे',
    type: 'homestay',
    wardNo: 2,
    village: 'तार्केघ्याङ / मेलम्चीघ्याङ',
    operatorName: 'पेम्बा दोर्जे लामा',
    phone: '९८४९०१२३४५',
    roomsCount: 6,
    bedsCount: 15,
    ratePerPerson: 'रु १,४००',
    specialDishes: ['सुक्खा मासु र फापर', 'तिब्बती नुनिलो चिया (सुज्या)', 'चौंरीको दही', 'जौको सातु'],
    amenities: ['३६०° हिम-दृश्य छत', 'अक्सिजन सिलिन्डर', 'ट्रेकिङ पोल भाडामा', 'तातो पानी'],
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&q=80'
  },
  {
    id: 'hs-manekharka-1',
    name: 'मानेखर्क तामाङ सांस्कृतिक होमस्टे',
    type: 'homestay',
    wardNo: 4,
    village: 'मानेखर्क',
    operatorName: 'सानुकान्छा तामाङ',
    phone: '९८४३४५६७८९',
    roomsCount: 5,
    bedsCount: 14,
    ratePerPerson: 'रु १,१००',
    specialDishes: ['कोदोको ढिँडो', 'अर्गानिक रायोको साग', 'सिस्नो सुप', 'तामाङ सेलरोटी'],
    amenities: ['डम्फु नाच प्रस्तुति', 'तामाङ वेशभूषा फोटो सेसन', 'WiFi', 'तातो पानी'],
    rating: 4.7,
    imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&q=80'
  },
  {
    id: 'hs-chhimti-1',
    name: 'छिम्ती झरना इको क्याम्प एण्ड होमस्टे',
    type: 'homestay',
    wardNo: 3,
    village: 'छिम्ती',
    operatorName: 'ल्हाक्पा रिन्जी शेर्पा',
    phone: '९८६११२२३३४',
    roomsCount: 4,
    bedsCount: 10,
    ratePerPerson: 'रु १,१५० (टेन्ट क्याम्पिङ रु ९००)',
    specialDishes: ['पहाडी खोलाको ताजा असला माछा', 'किवी अचार', 'ढिँडो र सिस्नो', 'गुन्द्रुक'],
    amenities: ['झरना छेउ टेन्ट क्याम्पिङ', 'क्याम्पफायर', 'लोकल गाइड', 'सौर्य बत्ती'],
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?w=600&q=80'
  },
  {
    id: 'hs-gunsa-1',
    name: 'गुन्सा सौर्य हरियाली होमस्टे',
    type: 'homestay',
    wardNo: 5,
    village: 'गुन्सा',
    operatorName: 'विष्णु माया श्रेष्ठ',
    phone: '९८५११३३४४५',
    roomsCount: 5,
    bedsCount: 12,
    ratePerPerson: 'रु १,०५०',
    specialDishes: ['नेवारी खाजा सेट', 'ताजा घ्यू र आलु', 'फापरको रोटी', 'अर्गानिक मह'],
    amenities: ['चिया बगान अवलोकन', 'शान्त वातावरण', 'WiFi', 'तातो पानी'],
    rating: 4.6,
    imageUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&q=80'
  },
  {
    id: 'hs-tipeni-1',
    name: 'इन्द्रावती भ्याली लज एण्ड रिसोर्ट',
    type: 'hotel',
    wardNo: 6,
    village: 'तिपेनी बजार',
    operatorName: 'राजकुमार दाहाल',
    phone: '९८५१२२३३४४',
    roomsCount: 12,
    bedsCount: 28,
    ratePerPerson: 'रु १,६०० (अट्याच बाथरुम)',
    specialDishes: ['ताजा ट्राउट माछा रोस्ट', 'लोकल खसीको मासु', 'दालभात तरकारी', 'चिसो पेय पदार्थ'],
    amenities: ['अट्याच बाथरुम', 'चौबीसै घण्टा वाइफाइ', 'विशाल पार्किङ', 'नदी किनार दृश्य'],
    rating: 4.7,
    imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80'
  }
];

// Cultural Heritage Data
const CULTURAL_HERITAGES = [
  {
    id: 'heritage-1',
    title: 'तार्केघ्याङ ऐतिहासिक गुम्बा (Tarkegyang Monastery)',
    type: 'ऐतिहासिक गुम्बा',
    wardNo: 1,
    altitude: '२,६०० मी.',
    description: 'ह्योल्मो क्षेत्रकै सबैभन्दा पुरानो र प्रमुख बौद्ध गुम्बा। यो बुद्ध धर्मको ञिङ्मा परम्परासँग सम्बन्धित छ र यहाँ सयौँ वर्ष पुराना थाङ्का चित्र, बुद्धमूर्ति तथा प्राचीन हस्तलिखित पाण्डुलिपिहरू संरक्षित छन्।',
    festival: 'सोनम ल्होसार, बुद्ध जयन्ती, मणि डुम्डु',
    imageUrl: 'https://images.unsplash.com/photo-1605640840605-14ac1855827b?w=600&q=80',
    tags: ['प्राचीन पाण्डुलिपि', 'ञिङ्मा सम्प्रदाय', 'काष्ठकला', 'ह्योल्मो केन्द्र']
  },
  {
    id: 'heritage-2',
    title: 'आमा याङ्ग्री कुलदेवी छोर्तेन (Protectress Chorten)',
    type: 'पवित्र शक्तिपीठ / छोर्तेन',
    wardNo: 2,
    altitude: '३,७७१ मी.',
    description: 'ह्योल्मो जातिकी संरक्षक देवी आमा याङ्ग्रीको वासस्थान मानिने शिखर। यहाँ स्थापित विशाल छोर्तेन र बौद्ध ध्वजाहरूले सम्पूर्ण उपत्यकाको सुख, शान्ति र समृद्धिको रक्षा गर्ने जनविश्वास छ।',
    festival: 'चैत्र पूर्णिमा विशेष पूजा, लामा पूजा',
    imageUrl: 'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?w=600&q=80',
    tags: ['कुलदेवी पीठ', '३६०° हिमालयन भ्यु', 'शान्ति ध्वजा', 'तपस्या स्थल']
  },
  {
    id: 'heritage-3',
    title: 'गुरु पद्मसम्भव (गुरु रिन्पोछे) ध्यान गुफा',
    type: 'पवित्र साधना गुफा',
    wardNo: 3,
    altitude: '२,८०० मी.',
    description: 'आठौँ शताब्दीमा तिब्बत प्रस्थान गर्ने क्रममा महान तान्त्रिक गुरु पद्मसंभवले यहाँ गुप्त रूपमा लामो समय ध्यान तथा साधना गर्नुभएको विश्वास गरिन्छ। यो गुफा ह्योल्मो बेयुल (Beyul) को अभिन्न अङ्ग हो।',
    festival: 'गुरु रिन्पोछे त्सेचु (दशमी तिथि)',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&q=80',
    tags: ['बेयुल गुप्त उपत्यका', 'ध्यान साधना', 'पदचिन्ह', 'तान्त्रिक इतिहास']
  },
  {
    id: 'heritage-4',
    title: 'पाँचपोखरीका ५ पवित्र कुण्डहरू (Five Sacred Lakes)',
    type: 'धार्मिक हिमताल संगम',
    wardNo: 3,
    altitude: '४,१०० मी.',
    description: 'भैरव कुण्ड, सरस्वती कुण्ड, सूर्य कुण्ड, गणेश कुण्ड, र तारा कुण्ड गरी ५ वटा प्राकृतिक हिमकुण्डहरूको अलौकिक संगम। जनैपूर्णिमा मेलामा यहाँ स्नान गर्नाले पाप नष्ट भई मनोकांक्षा पूरा हुने विश्वास छ।',
    festival: 'जनैपूर्णिमा मेला (भाद्र शुक्ल पूर्णिमा)',
    imageUrl: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=700&q=80',
    tags: ['५ कुण्ड', 'शिव मन्दिर', 'धामीझाँक्री नाच', 'जनैपूर्णिमा']
  }
];

export const Tourism: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'trails' | 'lakes' | 'weather' | 'hotels' | 'heritage' | 'visitors' | 'destinations' | 'packages' | 'safety' | 'products'>('trails');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoute, setSelectedRoute] = useState<'panchpokhari' | 'aama_yangri' | 'tipeni_chhimti'>('panchpokhari');
  const [activeStageId, setActiveStageId] = useState<string>('stage-1');
  const [show3DModal, setShow3DModal] = useState<boolean>(false);
  const [selectedLakeForModal, setSelectedLakeForModal] = useState<SacredLake | null>(null);
  const [hotelWardFilter, setHotelWardFilter] = useState<number | 'all'>('all');
  const [hotelTypeFilter, setHotelTypeFilter] = useState<'all' | 'homestay' | 'hotel'>('all');
  const [hoveredElevationPoint, setHoveredElevationPoint] = useState<RouteStage | null>(null);
  const [visitorFyFilter, setVisitorFyFilter] = useState<string>('all');
  const [visitorTypeFilter, setVisitorTypeFilter] = useState<string>('all');

  const [selectedBooking, setSelectedBooking] = useState<{
    type: 'package' | 'hotel';
    name: string;
    price?: string;
  } | null>(null);

  // Queries
  const { data: destinations = [], isLoading: loadingDestinations } = useQuery({
    queryKey: ['public-destinations'],
    queryFn: () => tourismApi.getDestinations(),
  });

  const { data: packages = [], isLoading: loadingPackages } = useQuery({
    queryKey: ['public-packages'],
    queryFn: () => tourismApi.getPackages(),
  });

  const { data: hotels = [], isLoading: loadingHotels } = useQuery({
    queryKey: ['public-hotels'],
    queryFn: () => tourismApi.getHotels(),
  });

  const { data: products = [], isLoading: loadingProducts } = useQuery({
    queryKey: ['public-products'],
    queryFn: () => tourismApi.getLocalProducts(),
  });

  const { data: stats } = useQuery({
    queryKey: ['tourism-stats'],
    queryFn: () => tourismApi.getStats(),
  });

  const { data: culturalRecords = [], isLoading: loadingCultural } = useQuery({
    queryKey: ['cultural-records'],
    queryFn: async () => {
      try {
        const res = await api.get('/heritage/cultural-records');
        return Array.isArray(res) ? res : (res as any)?.data || [];
      } catch {
        return [];
      }
    },
  });

  const { data: visitorRecords = [], isLoading: loadingVisitors } = useQuery({
    queryKey: ['visitor-records', visitorFyFilter],
    queryFn: async () => {
      try {
        const url = visitorFyFilter && visitorFyFilter !== 'all' 
          ? `/visitors?fiscalYear=${encodeURIComponent(visitorFyFilter)}` 
          : '/visitors';
        const res = await api.get(url);
        return Array.isArray(res) ? res : (res as any)?.data || [];
      } catch {
        return [];
      }
    },
  });

  const { data: visitorSummary = [] } = useQuery({
    queryKey: ['visitor-summary', visitorFyFilter],
    queryFn: async () => {
      try {
        const url = visitorFyFilter && visitorFyFilter !== 'all' 
          ? `/visitors/summary?fiscalYear=${encodeURIComponent(visitorFyFilter)}` 
          : '/visitors/summary';
        const res = await api.get(url);
        return Array.isArray(res) ? res : (res as any)?.data || [];
      } catch {
        return [];
      }
    },
  });

  const formatNpr = (val: number | undefined) => {
    if (!val) return 'रु ०';
    return `रु ${val.toLocaleString('en-IN')}`;
  };

  const toNepali = (num: number | undefined, fallback: string) => {
    if (num === undefined || num === null) return fallback;
    return String(num).replace(/[0-9]/g, d => '०१२३४५६७८९'[parseInt(d)]);
  };

  // Route Selection
  const currentRoute = useMemo(() => {
    if (selectedRoute === 'panchpokhari') return PANCHPOKHARI_ROUTE;
    if (selectedRoute === 'aama_yangri') return AAMA_YANGRI_ROUTE;
    return TIPENI_CHHIMTI_ROUTE;
  }, [selectedRoute]);

  const activeStage = useMemo(() => {
    return currentRoute.stages.find(s => s.id === activeStageId) || currentRoute.stages[0];
  }, [currentRoute, activeStageId]);

  // Combined Homestays & Lodges
  const allHomestays = useMemo(() => {
    const combined = [...REGISTERED_HOMESTAYS];
    if (hotels && hotels.length > 0) {
      hotels.forEach(h => {
        if (!combined.some(c => c.name.toLowerCase() === h.name.toLowerCase())) {
          combined.push({
            id: h.id || `api-${Math.random()}`,
            name: h.name,
            type: (h.type === 'homestay' ? 'homestay' : 'hotel') as any,
            wardNo: h.wardNo || 3,
            village: h.wardNo ? `वडा नं. ${h.wardNo}` : 'पाँचपोखरी',
            operatorName: h.ownerName || 'व्यवस्थापक',
            phone: h.contactNumber || '९८५१२१००००',
            roomsCount: 4,
            bedsCount: h.capacity || 10,
            ratePerPerson: h.pricePerNight ? `रु ${h.pricePerNight}` : 'रु १,२००',
            specialDishes: ['स्थानीय अर्गानिक खाना', 'सिस्नोको सुप', 'ढिँडो'],
            amenities: h.amenities || ['तातो पानी', 'WiFi'],
            rating: 4.7,
            imageUrl: h.imageUrl || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&q=80'
          });
        }
      });
    }
    return combined;
  }, [hotels]);

  const filteredHomestays = useMemo(() => {
    return allHomestays.filter(h => {
      const matchesSearch = !searchTerm ||
        h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.village.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.operatorName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesWard = hotelWardFilter === 'all' || h.wardNo === hotelWardFilter;
      const matchesType = hotelTypeFilter === 'all' || h.type === hotelTypeFilter;
      return matchesSearch && matchesWard && matchesType;
    });
  }, [allHomestays, searchTerm, hotelWardFilter, hotelTypeFilter]);

  const filteredDestinations = destinations.filter(d =>
    !searchTerm ||
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.nameEn && d.nameEn.toLowerCase().includes(searchTerm.toLowerCase())) ||
    d.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPackages = packages.filter(p =>
    !searchTerm ||
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.titleEn && p.titleEn.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredProducts = products.filter(pr =>
    !searchTerm ||
    pr.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pr.vendorName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // SVG Elevation Curve Calculations
  const svgWidth = 840;
  const svgHeight = 220;
  const padX = 60;
  const padY = 35;
  const maxAlt = Math.max(...currentRoute.stages.map(s => s.altitudeMeters), 4200);
  const minAlt = Math.min(...currentRoute.stages.map(s => s.altitudeMeters), 1000) - 200;

  const stagePoints = currentRoute.stages.map((stage, idx) => {
    const x = padX + (idx / Math.max(1, currentRoute.stages.length - 1)) * (svgWidth - padX * 2);
    const normalizedY = (stage.altitudeMeters - minAlt) / (maxAlt - minAlt);
    const y = svgHeight - padY - normalizedY * (svgHeight - padY * 2);
    return { ...stage, x, y };
  });

  const pathD = stagePoints.reduce((acc, pt, idx) => {
    if (idx === 0) return `M ${pt.x} ${pt.y}`;
    const prev = stagePoints[idx - 1];
    const cpX1 = prev.x + (pt.x - prev.x) / 2;
    const cpY1 = prev.y;
    const cpX2 = prev.x + (pt.x - prev.x) / 2;
    const cpY2 = pt.y;
    return `${acc} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${pt.x} ${pt.y}`;
  }, '');

  const areaD = `${pathD} L ${stagePoints[stagePoints.length - 1].x} ${svgHeight - padY} L ${stagePoints[0].x} ${svgHeight - padY} Z`;

  return (
    <div style={{ width: '100%', maxWidth: '100%', margin: '0', padding: '1.5rem 0.5rem 4rem', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* ========================================================================= */}
      {/* TOP BANNER WITH GLASSMORPHISM & 3D VIRTUAL TOUR HIGHLIGHT */}
      {/* ========================================================================= */}
      <div style={{
        position: 'relative',
        borderRadius: '20px',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #031525 0%, #0c2d48 45%, #145da0 80%, #0284c7 100%)',
        color: '#ffffff',
        padding: '2.75rem 2.25rem',
        marginBottom: '2rem',
        boxShadow: '0 20px 35px -10px rgba(6, 23, 39, 0.35)',
        border: '1px solid rgba(255, 255, 255, 0.14)'
      }}>
        {/* Subtle glowing mountain backdrop elements */}
        <div style={{
          position: 'absolute',
          right: '-50px',
          bottom: '-40px',
          opacity: 0.15,
          pointerEvents: 'none',
        }}>
          <Mountain size={380} color="#ffffff" />
        </div>

        <div style={{ maxWidth: '850px', position: 'relative', zIndex: 2 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(255, 255, 255, 0.14)',
            backdropFilter: 'blur(10px)',
            padding: '0.4rem 1rem',
            borderRadius: '9999px',
            fontSize: '0.85rem',
            fontWeight: 700,
            marginBottom: '1rem',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            letterSpacing: '0.3px'
          }}>
            <Compass size={16} color="#38bdf8" /> पाँचपोखरी थाङपाल पदमार्ग तथा पर्यटन ३D डिजिटल जुम्ल्याहा (Digital Twin)
          </div>

          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, lineHeight: 1.25, margin: '0 0 0.85rem 0', letterSpacing: '-0.5px' }}>
            पवित्र पाँचपोखरी, आमा याङ्ग्री पिक तथा ह्योल्मो संस्कृतिको ३D भर्चुअल टुर
          </h1>
          
          <p style={{ fontSize: '1.05rem', lineHeight: 1.65, opacity: 0.92, margin: '0 0 1.75rem 0' }}>
            विश्वकै ९औं उच्च स्थानको ५ वटा पवित्र कुण्ड (४,१०० मी.), ह्योल्मो कुलदेवी शिखर (३,७७१ मी.), तिपेनी–छिम्ती सांस्कृतिक पदमार्ग, गतिशील ३D उचाइ प्रोफाइल, उच्च हिमाली प्रत्यक्ष मौसम गाइड, र २०+ दर्ता भएका सामुदायिक होमस्टे।
          </p>

          <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setActiveTab('trails')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.55rem',
                background: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)',
                color: '#0f172a',
                border: 'none',
                padding: '0.75rem 1.4rem',
                borderRadius: '10px',
                fontWeight: 800,
                fontSize: '0.92rem',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(56, 189, 248, 0.4)',
                transition: 'all 0.2s'
              }}
            >
              🗺️ ३ पदमार्ग तथा उचाइ प्रोफाइल
            </button>

            <button
              onClick={() => setActiveTab('lakes')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.55rem',
                background: 'rgba(255, 255, 255, 0.16)',
                backdropFilter: 'blur(8px)',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.35)',
                padding: '0.75rem 1.4rem',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.92rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              🌊 ५ पवित्र कुण्डहरू (Virtual Explorer)
            </button>

            <button
              onClick={() => setShow3DModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.55rem',
                background: '#0f172a',
                color: '#38bdf8',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                padding: '0.75rem 1.4rem',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.92rem',
                cursor: 'pointer',
              }}
            >
              🏔️ ३D टोपोग्राफिक मोडल (Isometric)
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* KPI STATS BAR */}
      {/* ========================================================================= */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem',
      }}>
        <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -2px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: '#e0f2fe', color: '#0284c7', padding: '0.9rem', borderRadius: '12px' }}>
            <Mountain size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>अधिकतम उचाइ (पाँचपोखरी)</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0369a1', marginTop: '0.1rem' }}>४,१०० मी.</div>
          </div>
        </div>

        <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -2px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: '#dcfce7', color: '#16a34a', padding: '0.9rem', borderRadius: '12px' }}>
            <Home size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>दर्ता भएका सामुदायिक होमस्टे</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#15803d', marginTop: '0.1rem' }}>
              {toNepali(allHomestays.length, '२०')} वटा
            </div>
          </div>
        </div>

        <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -2px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: '#f3e8ff', color: '#7e22ce', padding: '0.9rem', borderRadius: '12px' }}>
            <Compass size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>प्रमुख पदमार्ग रुटहरू</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#6b21a8', marginTop: '0.1rem' }}>
              ३ प्रमुख ट्रेल
            </div>
          </div>
        </div>

        <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -2px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: '#fee2e2', color: '#dc2626', padding: '0.9rem', borderRadius: '12px' }}>
            <ShieldAlert size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>२४/७ आपतकालीन उद्धार सेल</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#b91c1c', marginTop: '0.1rem' }}>९८५१२१००००</div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODERN 9-TAB NAVIGATION BAR */}
      {/* ========================================================================= */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.75rem',
        background: '#ffffff',
        padding: '0.65rem 0.85rem',
        borderRadius: '14px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 4px rgba(0,0,0,0.03)'
      }}>
        <div style={{
          display: 'flex',
          gap: '0.35rem',
          flexWrap: 'wrap',
        }}>
          {[
            { id: 'trails', label: 'पदमार्ग तथा ३D प्रोफाइल', icon: <Footprints size={15} /> },
            { id: 'lakes', label: '५ पवित्र कुण्डहरू', icon: <Waves size={15} /> },
            { id: 'weather', label: 'मौसम तथा क्यालेन्डर', icon: <CloudSun size={15} /> },
            { id: 'hotels', label: 'सामुदायिक होमस्टे लगत', icon: <Home size={15} /> },
            { id: 'heritage', label: 'ह्योल्मो संस्कृति र गुम्बा', icon: <Sparkles size={15} /> },
            { id: 'visitors', label: 'पर्यटक/आगन्तुक तथ्याङ्क', icon: <Users size={15} /> },
            { id: 'destinations', label: 'गन्तव्यहरू', icon: <Mountain size={15} /> },
            { id: 'packages', label: 'ट्रेकिङ प्याकेज', icon: <Compass size={15} /> },
            { id: 'safety', label: 'सुरक्षा र AMS उद्धार', icon: <ShieldAlert size={15} /> },
            { id: 'products', label: 'स्थानीय उत्पादन', icon: <ShoppingBag size={15} /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.6rem 0.95rem',
                borderRadius: '10px',
                border: 'none',
                background: activeTab === tab.id ? '#0284c7' : 'transparent',
                color: activeTab === tab.id ? '#ffffff' : '#475569',
                fontWeight: activeTab === tab.id ? 700 : 600,
                fontSize: '0.86rem',
                cursor: 'pointer',
                boxShadow: activeTab === tab.id ? '0 4px 8px rgba(2, 132, 199, 0.25)' : 'none',
                transition: 'all 0.15s ease-in-out',
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Global Search */}
        <div style={{ position: 'relative', width: '250px', maxWidth: '100%' }}>
          <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input
            type="text"
            placeholder="खोज्नुहोस् (स्थान, होमस्टे, कुण्ड)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem 0.9rem 0.5rem 2.1rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.82rem',
              outline: 'none',
              background: '#f8fafc',
            }}
          />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: TRAILS & DYNAMIC SVG ELEVATION 3D ROUTE TWIN */}
      {/* ========================================================================= */}
      {activeTab === 'trails' && (
        <div>
          {/* Route Switcher Buttons: 3 Major Routes */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <button
              onClick={() => {
                setSelectedRoute('panchpokhari');
                setActiveStageId('stage-1');
              }}
              style={{
                padding: '1.25rem',
                borderRadius: '14px',
                border: selectedRoute === 'panchpokhari' ? '2.5px solid #0284c7' : '1px solid #cbd5e1',
                background: selectedRoute === 'panchpokhari' ? '#f0f9ff' : '#ffffff',
                cursor: 'pointer',
                textAlign: 'left',
                boxShadow: selectedRoute === 'panchpokhari' ? '0 6px 12px rgba(2, 132, 199, 0.15)' : '0 2px 4px rgba(0,0,0,0.03)',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, background: '#0284c7', color: '#fff', padding: '0.2rem 0.65rem', borderRadius: '20px' }}>
                  शास्त्रीय तीर्थ यात्रा (५ दिन)
                </span>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0369a1' }}>४,१०० मी.</span>
              </div>
              <h3 style={{ margin: '0 0 0.35rem 0', fontSize: '1.1rem', color: '#0f172a', fontWeight: 800 }}>
                १. पाँचपोखरी पवित्र तीर्थ पदमार्ग
              </h3>
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b', lineHeight: 1.4 }}>
                मेलम्चीपुल ➔ भोताङ ➔ छिमिटि ➔ देउराली ➔ नोस्यामपाटी ➔ लौरीविनायक ➔ पाँचपोखरी कुण्ड
              </p>
            </button>

            <button
              onClick={() => {
                setSelectedRoute('aama_yangri');
                setActiveStageId('ay-stage-1');
              }}
              style={{
                padding: '1.25rem',
                borderRadius: '14px',
                border: selectedRoute === 'aama_yangri' ? '2.5px solid #7c3aed' : '1px solid #cbd5e1',
                background: selectedRoute === 'aama_yangri' ? '#faf5ff' : '#ffffff',
                cursor: 'pointer',
                textAlign: 'left',
                boxShadow: selectedRoute === 'aama_yangri' ? '0 6px 12px rgba(124, 58, 237, 0.15)' : '0 2px 4px rgba(0,0,0,0.03)',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, background: '#7c3aed', color: '#fff', padding: '0.2rem 0.65rem', borderRadius: '20px' }}>
                  ह्योल्मो सांस्कृतिक पिक (३ दिन)
                </span>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#6d28d9' }}>३,७७१ मी.</span>
              </div>
              <h3 style={{ margin: '0 0 0.35rem 0', fontSize: '1.1rem', color: '#0f172a', fontWeight: 800 }}>
                २. आमा याङ्ग्री पिक तथा ह्योल्मो ट्रेल
              </h3>
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b', lineHeight: 1.4 }}>
                काठमाडौं ➔ तार्केघ्याङ प्राचीन गुम्बा ➔ झाँक्री डाँडा ➔ आमा याङ्ग्री कुलदेवी छोर्तेन
              </p>
            </button>

            <button
              onClick={() => {
                setSelectedRoute('tipeni_chhimti');
                setActiveStageId('tc-stage-1');
              }}
              style={{
                padding: '1.25rem',
                borderRadius: '14px',
                border: selectedRoute === 'tipeni_chhimti' ? '2.5px solid #16a34a' : '1px solid #cbd5e1',
                background: selectedRoute === 'tipeni_chhimti' ? '#f0fdf4' : '#ffffff',
                cursor: 'pointer',
                textAlign: 'left',
                boxShadow: selectedRoute === 'tipeni_chhimti' ? '0 6px 12px rgba(22, 163, 74, 0.15)' : '0 2px 4px rgba(0,0,0,0.03)',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, background: '#16a34a', color: '#fff', padding: '0.2rem 0.65rem', borderRadius: '20px' }}>
                  सांस्कृतिक सर्किट (४ दिन)
                </span>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#15803d' }}>२,२०० मी.</span>
              </div>
              <h3 style={{ margin: '0 0 0.35rem 0', fontSize: '1.1rem', color: '#0f172a', fontWeight: 800 }}>
                ३. तिपेनी–छिम्ती–मानेखर्क सम्पदा ट्रेल
              </h3>
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b', lineHeight: 1.4 }}>
                मेलम्ची ➔ तिपेनी बजार ➔ मानेखर्क तामाङ सम्पदा ➔ छिम्ती झरना ➔ भोताङ किवी बगान
              </p>
            </button>
          </div>

          {/* Dynamic SVG Elevation Profile Cross-Section Chart */}
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '1.5rem',
            marginBottom: '1.5rem',
            boxShadow: '0 4px 10px rgba(0,0,0,0.03)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Activity size={20} color="#0284c7" /> गतिशील उचाइ प्रोफाइल चार्ट (Interactive Elevation Curve)
                </h3>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                  पदमार्गका वेपोइन्टहरूमा माउस होभर वा क्लिक गरी उचाइ, दूरी, र बाटोको प्रकृति जाँच गर्नुहोस्।
                </p>
              </div>

              {/* Altitude Zone Badges */}
              <div style={{ display: 'flex', gap: '0.6rem', fontSize: '0.75rem', fontWeight: 700, flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#15803d', background: '#dcfce7', padding: '0.2rem 0.55rem', borderRadius: '6px' }}>
                  🟢 सुरक्षित (&lt;२,५०० मी.)
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#b45309', background: '#fef3c7', padding: '0.2rem 0.55rem', borderRadius: '6px' }}>
                  🟡 अनुकूलन (२,५००-३,५०० मी.)
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#b91c1c', background: '#fee2e2', padding: '0.2rem 0.55rem', borderRadius: '6px' }}>
                  🔴 AMS सतर्कता (&gt;३,५०० मी.)
                </span>
              </div>
            </div>

            {/* SVG Chart Rendering Container */}
            <div style={{ width: '100%', overflowX: 'auto', background: '#0a101d', borderRadius: '12px', padding: '0.75rem 0.5rem' }}>
              <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={{ width: '100%', minWidth: '700px', height: 'auto', display: 'block' }}>
                <defs>
                  <linearGradient id="elevationGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.85" />
                    <stop offset="45%" stopColor="#0284c7" stopOpacity="0.45" />
                    <stop offset="85%" stopColor="#16a34a" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#0f172a" stopOpacity="0.05" />
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>

                {/* Horizontal Grid lines */}
                {[4000, 3000, 2000, 1000].map(gridAlt => {
                  if (gridAlt < minAlt || gridAlt > maxAlt) return null;
                  const normY = (gridAlt - minAlt) / (maxAlt - minAlt);
                  const gy = svgHeight - padY - normY * (svgHeight - padY * 2);
                  return (
                    <g key={gridAlt}>
                      <line x1={padX} y1={gy} x2={svgWidth - padX} y2={gy} stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />
                      <text x={padX - 8} y={gy + 4} fill="#64748b" fontSize="10" textAnchor="end" fontFamily="monospace">
                        {gridAlt}m
                      </text>
                    </g>
                  );
                })}

                {/* Shaded Area under Curve */}
                <path d={areaD} fill="url(#elevationGrad)" />

                {/* Main Profile Line Curve */}
                <path d={pathD} fill="none" stroke="#38bdf8" strokeWidth="3.5" filter="url(#glow)" />

                {/* Stage Points and Interactive Markers */}
                {stagePoints.map((pt) => {
                  const isSelected = pt.id === activeStage.id;
                  const isHovered = hoveredElevationPoint?.id === pt.id;
                  return (
                    <g
                      key={pt.id}
                      onClick={() => setActiveStageId(pt.id)}
                      onMouseEnter={() => setHoveredElevationPoint(pt)}
                      onMouseLeave={() => setHoveredElevationPoint(null)}
                      style={{ cursor: 'pointer' }}
                    >
                      {/* Vertical line to ground */}
                      <line x1={pt.x} y1={pt.y} x2={pt.x} y2={svgHeight - padY} stroke={isSelected ? '#38bdf8' : 'rgba(255,255,255,0.15)'} strokeDasharray={isSelected ? 'none' : '2 2'} strokeWidth={isSelected ? 2 : 1} />
                      
                      {/* Outer pulse circle if selected */}
                      {isSelected && (
                        <circle cx={pt.x} cy={pt.y} r="14" fill="#38bdf8" opacity="0.3" />
                      )}

                      {/* Main Node */}
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={isSelected || isHovered ? 8 : 6}
                        fill={isSelected ? '#38bdf8' : pt.altitudeMeters >= 3500 ? '#ef4444' : pt.altitudeMeters >= 2500 ? '#f59e0b' : '#22c55e'}
                        stroke="#0f172a"
                        strokeWidth="2.5"
                      />

                      {/* Altitude Label */}
                      <text
                        x={pt.x}
                        y={pt.y - 12}
                        fill={isSelected ? '#38bdf8' : '#e2e8f0'}
                        fontSize="11"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        {pt.altitudeMeters}m
                      </text>

                      {/* Stage Name below */}
                      <text
                        x={pt.x}
                        y={svgHeight - padY + 16}
                        fill={isSelected ? '#38bdf8' : '#94a3b8'}
                        fontSize="10"
                        fontWeight={isSelected ? 'bold' : 'normal'}
                        textAnchor="middle"
                      >
                        {pt.title.split('->').pop()?.trim().slice(0, 10)}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Stepper Timeline Buttons */}
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '1.25rem',
            marginBottom: '1.5rem',
            boxShadow: '0 4px 10px rgba(0,0,0,0.03)'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${currentRoute.stages.length}, 1fr)`,
              gap: '0.75rem',
              overflowX: 'auto',
              paddingBottom: '0.5rem'
            }}>
              {currentRoute.stages.map((stage) => {
                const isSelected = stage.id === activeStage.id;
                const isHighAltitude = stage.altitudeMeters >= 3500;
                const isModerateAltitude = stage.altitudeMeters >= 2500 && stage.altitudeMeters < 3500;
                const badgeBg = isHighAltitude ? '#fee2e2' : isModerateAltitude ? '#fef3c7' : '#dcfce7';
                const badgeColor = isHighAltitude ? '#b91c1c' : isModerateAltitude ? '#b45309' : '#15803d';

                return (
                  <button
                    key={stage.id}
                    onClick={() => setActiveStageId(stage.id)}
                    style={{
                      background: isSelected ? '#0f172a' : '#f8fafc',
                      color: isSelected ? '#ffffff' : '#334155',
                      border: isSelected ? '2px solid #38bdf8' : '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '1rem 0.75rem',
                      cursor: 'pointer',
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.35rem',
                      boxShadow: isSelected ? '0 6px 14px rgba(15, 23, 42, 0.25)' : 'none',
                      transition: 'all 0.2s',
                      minWidth: '150px'
                    }}
                  >
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      background: isSelected ? 'rgba(255,255,255,0.2)' : badgeBg,
                      color: isSelected ? '#38bdf8' : badgeColor,
                      padding: '0.2rem 0.6rem',
                      borderRadius: '9999px'
                    }}>
                      चरण {toNepali(stage.stageNo, String(stage.stageNo))}
                    </span>

                    <div style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: '0.2rem', color: isSelected ? '#38bdf8' : '#0f172a' }}>
                      {stage.altitudeMeters} मी.
                    </div>

                    <div style={{ fontSize: '0.82rem', fontWeight: 600, lineHeight: 1.3, textAlign: 'center' }}>
                      {stage.title.split('->').pop()?.trim()}
                    </div>

                    <div style={{ fontSize: '0.72rem', opacity: isSelected ? 0.8 : 0.6, marginTop: '0.2rem' }}>
                      ⏱️ {stage.durationHours}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Stage Detailed Twin Card */}
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1.5px solid #0284c7',
            padding: '1.75rem',
            marginBottom: '2rem',
            boxShadow: '0 8px 20px rgba(2, 132, 199, 0.08)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1.25rem', marginBottom: '1.25rem' }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#e0f2fe', color: '#0369a1', padding: '0.25rem 0.75rem', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                  <MapPin size={13} /> चरण नं. {activeStage.stageNo} • वडा नं. {activeStage.wardNo}
                </div>
                <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#0f172a', fontWeight: 800 }}>
                  {activeStage.title}
                </h2>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.85rem', color: '#64748b', flexWrap: 'wrap' }}>
                  <span>उचाइ: <strong style={{ color: '#0284c7' }}>{activeStage.altitudeMeters} मिटर</strong></span>
                  <span>उचाइ फरक: <strong style={{ color: '#0f172a' }}>{activeStage.elevationGain}</strong></span>
                  <span>दूरी: <strong style={{ color: '#0f172a' }}>{activeStage.distanceKm} कि.मी.</strong></span>
                  <span>समय: <strong style={{ color: '#0f172a' }}>{activeStage.durationHours}</strong></span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button
                  onClick={() => window.open(`/gis-map?filter=viewpoint&lat=${activeStage.lat}&lng=${activeStage.lng}`, '_blank')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    background: '#0284c7',
                    color: '#ffffff',
                    border: 'none',
                    padding: '0.65rem 1.1rem',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                  }}
                >
                  <Navigation size={15} /> GIS नक्सामा लोकेट गर्नुहोस्
                </button>
                <button
                  onClick={() => setShow3DModal(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    background: '#0f172a',
                    color: '#38bdf8',
                    border: 'none',
                    padding: '0.65rem 1.1rem',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                  }}
                >
                  🏔️ ३D टोपोग्राफी
                </button>
              </div>
            </div>

            {/* Stage Attributes Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '1.25rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#0284c7', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                  <Droplets size={16} /> पिउने पानीको स्रोत
                </div>
                <div style={{ fontSize: '0.88rem', color: '#1e293b', lineHeight: 1.4 }}>
                  {activeStage.waterSupply}
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: activeStage.networkStatus.includes('ntc') ? '#16a34a' : '#dc2626', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                  {activeStage.networkStatus.includes('ntc') ? <Wifi size={16} /> : <WifiOff size={16} />} 
                  मोबाइल नेटवर्क कभरेज
                </div>
                <div style={{ fontSize: '0.88rem', color: '#1e293b', lineHeight: 1.4 }}>
                  {activeStage.networkStatus === 'ntc_4g' ? 'NTC 4G/3G द्रुत इन्टरनेट उपलब्ध' :
                   activeStage.networkStatus === 'ntc_weak' ? 'NTC (१-२ बार, केवल फोन कल / मौसम अनुसार)' :
                   'सम्पर्कविहीन (नो नेटवर्क)'}
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#7c3aed', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                  <Bed size={16} /> बास तथा आवास व्यवस्था
                </div>
                <div style={{ fontSize: '0.88rem', color: '#1e293b', lineHeight: 1.4 }}>
                  {activeStage.accommodation}
                </div>
              </div>
            </div>

            {/* Caution Banner */}
            <div style={{
              background: activeStage.altitudeMeters >= 3500 ? '#fef2f2' : activeStage.altitudeMeters >= 2500 ? '#fffbeb' : '#f0fdf4',
              borderLeft: `4px solid ${activeStage.altitudeMeters >= 3500 ? '#ef4444' : activeStage.altitudeMeters >= 2500 ? '#f59e0b' : '#22c55e'}`,
              padding: '1rem 1.25rem',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
              marginBottom: '1.25rem'
            }}>
              <AlertTriangle size={20} color={activeStage.altitudeMeters >= 3500 ? '#dc2626' : activeStage.altitudeMeters >= 2500 ? '#d97706' : '#16a34a'} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: activeStage.altitudeMeters >= 3500 ? '#991b1b' : activeStage.altitudeMeters >= 2500 ? '#92400e' : '#166534', marginBottom: '0.2rem' }}>
                  {activeStage.altitudeMeters >= 3500 ? '🚨 उच्च हिमाली तथा AMS सतर्कता सल्लाह' : '💡 यात्रा सल्लाह तथा सावधानी'}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#334155', lineHeight: 1.45 }}>
                  {activeStage.caution}
                </div>
              </div>
            </div>

            {/* Highlights Chips */}
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>यस चरणका मुख्य आकर्षणहरू:</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
                {activeStage.highlights.map((hl, idx) => (
                  <span key={idx} style={{ background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', padding: '0.25rem 0.65rem', borderRadius: '6px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Sparkles size={12} color="#0284c7" /> {hl}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: FIVE SACRED LAKES 3D VIRTUAL EXPLORER (५ पवित्र कुण्डहरू) */}
      {/* ========================================================================= */}
      {activeTab === 'lakes' && (
        <div>
          {/* Lakes Hero Banner */}
          <div style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #0369a1 100%)',
            color: '#fff',
            borderRadius: '16px',
            padding: '2rem',
            marginBottom: '2rem',
            boxShadow: '0 10px 25px -5px rgba(3, 105, 161, 0.3)'
          }}>
            <div style={{ maxWidth: '840px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.15)', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                <Waves size={15} color="#38bdf8" /> विश्वकै नवौँ उच्च स्थानको हिमताल संगम (४,१०० मिटर)
              </div>
              <h2 style={{ fontSize: '1.95rem', fontWeight: 800, margin: '0 0 0.65rem 0' }}>
                पाँचपोखरीका ५ पवित्र कुण्डहरू (Five Sacred Lakes Virtual Twin)
              </h2>
              <p style={{ fontSize: '0.95rem', lineHeight: 1.6, opacity: 0.92, margin: 0 }}>
                भैरव, सरस्वती, सूर्य, गणेश र तारा कुण्ड गरी ५ वटा प्राकृतिक कुण्डहरूको धार्मिक, ऐतिहासिक, भू-वैज्ञानिक तथा आध्यात्मिक रहस्य। प्रत्येक कुण्डको गहिराई, क्षेत्रफल, जलको रङ्ग र पौराणिक महत्व।
              </p>
            </div>
          </div>

          {/* 5 Lakes Interactive Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            {FIVE_SACRED_LAKES.map(lake => (
              <div
                key={lake.id}
                style={{
                  background: '#ffffff',
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.04)',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{
                  height: '220px',
                  backgroundImage: `url(${lake.imageUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  position: 'relative'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: 'rgba(15, 23, 42, 0.85)',
                    color: '#fff',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: 700
                  }}>
                    🏔️ {lake.altitudeMeters} मी.
                  </div>

                  <div style={{
                    position: 'absolute',
                    bottom: '12px',
                    left: '12px',
                    background: lake.colorHex,
                    color: '#fff',
                    padding: '0.3rem 0.75rem',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
                  }}>
                    {lake.waterColor}
                  </div>
                </div>

                <div style={{ padding: '1.4rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ margin: '0 0 0.25rem', fontSize: '1.25rem', color: '#0f172a', fontWeight: 800 }}>
                    {lake.name}
                  </h3>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '0.75rem' }}>{lake.nameEn}</div>

                  <div style={{
                    background: '#f8fafc',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    fontSize: '0.82rem',
                    color: '#1e293b',
                    marginBottom: '0.85rem'
                  }}>
                    <strong>आराध्य देव / प्रतीक:</strong> {lake.deitySignificance}
                  </div>

                  <p style={{ fontSize: '0.86rem', color: '#334155', lineHeight: 1.55, margin: '0 0 1rem', flex: 1 }}>
                    {lake.description}
                  </p>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '0.5rem',
                    fontSize: '0.78rem',
                    color: '#475569',
                    borderTop: '1px solid #f1f5f9',
                    paddingTop: '0.75rem',
                    marginBottom: '1rem'
                  }}>
                    <div>गहिराई: <strong style={{ color: '#0284c7' }}>{lake.depthMeters} मिटर</strong></div>
                    <div>क्षेत्रफल: <strong style={{ color: '#0f172a' }}>{lake.areaRopani} रोपनी</strong></div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => setSelectedLakeForModal(lake)}
                      style={{
                        flex: 1,
                        background: '#0284c7',
                        color: '#fff',
                        border: 'none',
                        padding: '0.65rem',
                        borderRadius: '8px',
                        fontSize: '0.84rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.35rem'
                      }}
                    >
                      <Eye size={15} /> पौराणिक कथा र ३६०° विवरण
                    </button>
                    <button
                      onClick={() => window.open(`/gis-map?filter=viewpoint&lat=${lake.coordinates.lat}&lng=${lake.coordinates.lng}`, '_blank')}
                      style={{
                        background: '#f1f5f9',
                        color: '#0f172a',
                        border: '1px solid #cbd5e1',
                        padding: '0.65rem',
                        borderRadius: '8px',
                        cursor: 'pointer'
                      }}
                      title="GIS नक्सामा हेर्नुहोस्"
                    >
                      <Navigation size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: HIGH-ALTITUDE MOUNTAIN WEATHER & 12-MONTH TREK CALENDAR */}
      {/* ========================================================================= */}
      {activeTab === 'weather' && (
        <div>
          {/* Weather Stations 3-Card Grid */}
          <div style={{ marginBottom: '2.5rem' }}>
            <div style={{ marginBottom: '1.25rem' }}>
              <h2 style={{ margin: '0 0 0.35rem', fontSize: '1.45rem', color: '#0f172a', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CloudSun size={24} color="#0284c7" /> प्रत्यक्ष उच्च हिमाली मौसम सेन्सर (Live Mountain Stations)
              </h2>
              <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748b' }}>
                १,२०० मी. उपत्यका देखि ४,१०० मी. पाँचपोखरी बेस क्याम्प सम्मको वास्तविक समय हावापानी तथा अक्सिजन अवस्था।
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {MOUNTAIN_WEATHER_STATIONS.map(st => (
                <div
                  key={st.id}
                  style={{
                    background: '#ffffff',
                    borderRadius: '16px',
                    border: '1.5px solid #cbd5e1',
                    padding: '1.5rem',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.04)',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, background: '#e0f2fe', color: '#0369a1', padding: '0.2rem 0.6rem', borderRadius: '6px' }}>
                        🏔️ {st.altitudeMeters} मिटर
                      </span>
                      <h3 style={{ margin: '0.4rem 0 0', fontSize: '1.2rem', color: '#0f172a', fontWeight: 800 }}>
                        {st.name}
                      </h3>
                    </div>

                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '0.25rem 0.65rem',
                      borderRadius: '20px',
                      background: st.amsRiskLevel.includes('उच्च') ? '#fee2e2' : st.amsRiskLevel.includes('मध्यम') ? '#fef3c7' : '#dcfce7',
                      color: st.amsRiskLevel.includes('उच्च') ? '#b91c1c' : st.amsRiskLevel.includes('मध्यम') ? '#b45309' : '#15803d'
                    }}>
                      AMS: {st.amsRiskLevel}
                    </span>
                  </div>

                  {/* Big Temp Metric */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#f8fafc', padding: '1rem', borderRadius: '12px', marginBottom: '1.25rem' }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0284c7' }}>
                      {st.tempCurrent}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>{st.weatherCondition}</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>तापक्रम दायरा: {st.tempRange}</div>
                    </div>
                  </div>

                  {/* Weather Attributes */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.82rem', marginBottom: '1.25rem' }}>
                    <div style={{ background: '#f8fafc', padding: '0.65rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <div style={{ color: '#64748b', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Wind size={12} /> हावाको गति</div>
                      <div style={{ fontWeight: 700, color: '#0f172a', marginTop: '0.2rem' }}>{st.windSpeed}</div>
                    </div>
                    <div style={{ background: '#f8fafc', padding: '0.65rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <div style={{ color: '#64748b', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Thermometer size={12} /> विन्ड चिल</div>
                      <div style={{ fontWeight: 700, color: '#0284c7', marginTop: '0.2rem' }}>{st.windChill}</div>
                    </div>
                    <div style={{ background: '#f8fafc', padding: '0.65rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <div style={{ color: '#64748b', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Gauge size={12} /> हावाको चाप</div>
                      <div style={{ fontWeight: 700, color: '#0f172a', marginTop: '0.2rem' }}>{st.barometricPressure}</div>
                    </div>
                    <div style={{ background: '#f8fafc', padding: '0.65rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <div style={{ color: '#64748b', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Activity size={12} /> अक्सिजन स्तर</div>
                      <div style={{ fontWeight: 700, color: '#16a34a', marginTop: '0.2rem' }}>{st.oxygenLevel}</div>
                    </div>
                  </div>

                  {/* Clothing Advisory */}
                  <div style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '0.75rem', borderRadius: '8px', fontSize: '0.8rem', color: '#92400e', marginTop: 'auto' }}>
                    <strong>💡 पोसाक सिफारिस:</strong> {st.clothingAdvice}
                  </div>

                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.75rem', textAlign: 'right' }}>
                    अद्यावधिक: {st.updatedAt}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 12-Month Trekking Calendar Matrix */}
          <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.5rem', boxShadow: '0 4px 10px rgba(0,0,0,0.03)' }}>
            <div style={{ marginBottom: '1.25rem' }}>
              <h2 style={{ margin: '0 0 0.35rem', fontSize: '1.35rem', color: '#0f172a', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={22} color="#0284c7" /> १२ महिने पदयात्रा उपयुक्तता क्यालेन्डर (Seasonal Trekking Matrix)
              </h2>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                कुन महिनामा पाँचपोखरी वा आमा याङ्ग्री जान सबैभन्दा उत्तम हुन्छ? महिना अनुसार मौसम, हिउँ र सावधानी विवरण।
              </p>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', minWidth: '700px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569', textAlign: 'left' }}>
                    <th style={{ padding: '0.75rem 1rem' }}>महिना</th>
                    <th style={{ padding: '0.75rem 1rem' }}>ऋतु</th>
                    <th style={{ padding: '0.75rem 1rem' }}>उपयुक्तता</th>
                    <th style={{ padding: '0.75rem 1rem' }}>तापक्रम</th>
                    <th style={{ padding: '0.75rem 1rem' }}>मुख्य आकर्षणहरू</th>
                    <th style={{ padding: '0.75rem 1rem' }}>सतर्कता</th>
                  </tr>
                </thead>
                <tbody>
                  {SEASONAL_TREK_CALENDAR.map((m, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 800, color: '#0f172a' }}>
                        {m.nepaliMonth}
                        <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 400 }}>{m.englishMonth}</div>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: '#334155' }}>{m.seasonName}</td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span style={{
                          padding: '0.25rem 0.6rem',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          background: m.statusBadge.includes('सर्वोत्कृष्ट') ? '#dcfce7' : m.statusBadge.includes('उत्कृष्ट') ? '#e0f2fe' : m.statusBadge.includes('वर्षा') ? '#fee2e2' : '#fef3c7',
                          color: m.statusBadge.includes('सर्वोत्कृष्ट') ? '#15803d' : m.statusBadge.includes('उत्कृष्ट') ? '#0369a1' : m.statusBadge.includes('वर्षा') ? '#b91c1c' : '#b45309'
                        }}>
                          {m.statusBadge}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: '#0f172a', fontWeight: 600 }}>{m.temperature}</td>
                      <td style={{ padding: '0.85rem 1rem', color: '#334155', maxWidth: '280px' }}>{m.highlights}</td>
                      <td style={{ padding: '0.85rem 1rem', color: '#64748b', fontSize: '0.8rem' }}>{m.precautions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: REGISTERED HOMESTAYS & LODGES DIRECTORY */}
      {/* ========================================================================= */}
      {activeTab === 'hotels' && (
        <div>
          {/* Homestay Filters Header */}
          <div style={{
            background: '#ffffff',
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            padding: '1.25rem',
            marginBottom: '1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>वडा अनुसार फिल्टर:</span>
              {[
                { label: 'सबै वडा', val: 'all' as const },
                { label: 'वडा १ (तार्केघ्याङ)', val: 1 },
                { label: 'वडा २ (याङ्ग्री)', val: 2 },
                { label: 'वडा ३ (भोताङ/छिमिटि)', val: 3 },
                { label: 'वडा ४ (मानेखर्क)', val: 4 },
                { label: 'वडा ५ (गुन्सा)', val: 5 },
                { label: 'वडा ६ (तिपेनी)', val: 6 },
              ].map(w => (
                <button
                  key={String(w.val)}
                  onClick={() => setHotelWardFilter(w.val)}
                  style={{
                    padding: '0.4rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: hotelWardFilter === w.val ? '#0284c7' : '#cbd5e1',
                    background: hotelWardFilter === w.val ? '#0284c7' : '#f8fafc',
                    color: hotelWardFilter === w.val ? '#fff' : '#475569',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {w.label}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button
                onClick={() => setHotelTypeFilter('all')}
                style={{
                  padding: '0.4rem 0.8rem',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  background: hotelTypeFilter === 'all' ? '#0f172a' : '#fff',
                  color: hotelTypeFilter === 'all' ? '#fff' : '#475569',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                सबै प्रकार ({allHomestays.length})
              </button>
              <button
                onClick={() => setHotelTypeFilter('homestay')}
                style={{
                  padding: '0.4rem 0.8rem',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  background: hotelTypeFilter === 'homestay' ? '#16a34a' : '#fff',
                  color: hotelTypeFilter === 'homestay' ? '#fff' : '#475569',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                सामुदायिक होमस्टे
              </button>
              <button
                onClick={() => setHotelTypeFilter('hotel')}
                style={{
                  padding: '0.4rem 0.8rem',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  background: hotelTypeFilter === 'hotel' ? '#0284c7' : '#fff',
                  color: hotelTypeFilter === 'hotel' ? '#fff' : '#475569',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                होटल तथा लज
              </button>
            </div>
          </div>

          {filteredHomestays.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>कुनै आवास फेला परेन।</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {filteredHomestays.map(h => (
                <div key={h.id} style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 8px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ height: '200px', backgroundImage: `url(${h.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
                    <span style={{ position: 'absolute', top: '10px', right: '10px', background: h.type === 'homestay' ? '#16a34a' : '#0284c7', color: '#fff', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>
                      {h.type === 'homestay' ? '🏡 सामुदायिक होमस्टे' : '🏨 लज / रिसोर्ट'}
                    </span>
                    <span style={{ position: 'absolute', bottom: '10px', left: '10px', background: 'rgba(15, 23, 42, 0.85)', color: '#fff', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600 }}>
                      वडा नं. {h.wardNo} • {h.village}
                    </span>
                  </div>
                  
                  <div style={{ padding: '1.35rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                      <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.15rem', fontWeight: 800 }}>{h.name}</h3>
                      <span style={{ color: '#eab308', fontWeight: 800, fontSize: '0.85rem' }}>★ {h.rating}</span>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', color: '#64748b', fontSize: '0.84rem', marginBottom: '0.85rem' }}>
                      <div>सञ्चालक: <strong style={{ color: '#0f172a' }}>{h.operatorName}</strong></div>
                      <div>क्षमता: <strong>{h.roomsCount} कोठा / {h.bedsCount} बेड</strong></div>
                      <div style={{ color: '#0284c7', fontWeight: 700 }}>शुल्क: {h.ratePerPerson}</div>
                    </div>

                    {/* Local Dishes */}
                    {h.specialDishes && (
                      <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #f1f5f9', marginBottom: '0.85rem' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.35rem' }}>
                          <Utensils size={13} color="#16a34a" /> स्थानीय मौलिक परिकारहरू:
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                          {h.specialDishes.map((dish, i) => (
                            <span key={i} style={{ fontSize: '0.72rem', background: '#ffffff', border: '1px solid #e2e8f0', padding: '0.15rem 0.45rem', borderRadius: '4px', color: '#334155' }}>
                              {dish}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div style={{ marginTop: 'auto', display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => window.open(`tel:${h.phone}`)}
                        style={{
                          flex: 1,
                          background: '#ecfdf5',
                          color: '#065f46',
                          border: '1px solid #a7f3d0',
                          padding: '0.65rem',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: 700,
                          fontSize: '0.84rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.35rem'
                        }}
                      >
                        <Phone size={14} /> फोन कल ({h.phone})
                      </button>

                      <button
                        onClick={() => setSelectedBooking({ type: 'hotel', name: h.name, price: h.ratePerPerson })}
                        style={{
                          background: '#0284c7',
                          color: '#fff',
                          border: 'none',
                          padding: '0.65rem 1rem',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: 700,
                          fontSize: '0.84rem'
                        }}
                      >
                        बुकिङ
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: HYOLMO CULTURE & HERITAGE */}
      {/* ========================================================================= */}
      {activeTab === 'heritage' && (
        <div>
          <div style={{
            background: 'linear-gradient(135deg, #4c0519 0%, #881337 50%, #9f1239 100%)',
            color: '#fff',
            borderRadius: '16px',
            padding: '2rem',
            marginBottom: '2rem',
            boxShadow: '0 10px 25px -5px rgba(136, 19, 55, 0.25)'
          }}>
            <div style={{ maxWidth: '800px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.15)', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                <Sparkles size={14} color="#fecdd3" /> पवित्र ह्योल्मो बेयुल (Beyul Hyolmo Heritage)
              </div>
              <h2 style={{ fontSize: '1.85rem', fontWeight: 800, margin: '0 0 0.65rem 0' }}>
                ह्योल्मो संस्कृति, ऐतिहासिक गुम्बा तथा आध्यात्मिक तीर्थस्थलहरू
              </h2>
              <p style={{ fontSize: '0.95rem', lineHeight: 1.6, opacity: 0.92, margin: 0 }}>
                आठौँ शताब्दीमा गुरु पद्मसंभवले साधना गर्नुभएको पवित्र बेयुल (रहस्यमयी उपत्यका), सयौँ वर्ष पुराना काष्ठकलायुक्त बौद्ध गुम्बा, कुलदेवी आमा याङ्ग्री र पाँचपोखरीको अलौकिक आध्यात्मिक संगम।
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
            {CULTURAL_HERITAGES.map((her) => (
              <div key={her.id} style={{
                background: '#ffffff',
                borderRadius: '14px',
                border: '1px solid #e2e8f0',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
              }}>
                <div style={{
                  height: '210px',
                  backgroundImage: `url(${her.imageUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  position: 'relative'
                }}>
                  <span style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(15, 23, 42, 0.85)', color: '#fff', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>
                    🏔️ {her.altitude}
                  </span>
                  <span style={{ position: 'absolute', bottom: '12px', left: '12px', background: '#9f1239', color: '#fff', padding: '0.25rem 0.7rem', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700 }}>
                    वडा नं. {her.wardNo} • {her.type}
                  </span>
                </div>

                <div style={{ padding: '1.35rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem', color: '#0f172a', fontWeight: 800 }}>
                    {her.title}
                  </h3>
                  <p style={{ fontSize: '0.88rem', lineHeight: 1.55, color: '#334155', margin: '0 0 1rem 0', flex: 1 }}>
                    {her.description}
                  </p>

                  <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '8px', padding: '0.65rem 0.85rem', fontSize: '0.82rem', color: '#881337', marginBottom: '1rem' }}>
                    <strong>🎉 मुख्य पर्व/मेला:</strong> {her.festival}
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {her.tags.map((tg, i) => (
                      <span key={i} style={{ fontSize: '0.75rem', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                        #{tg}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Intangible Heritage & Cultural Records from Database */}
          <div style={{ marginTop: '2.5rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>
                  अमूर्त सांस्कृतिक सम्पदा, मौखिक इतिहास तथा पर्व अभिलेख (Cultural Records Twin)
                </h3>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.86rem', color: '#64748b' }}>
                  पालिकाका रैथाने धामीझाँक्री, लामा गुरु, कलाकार तथा इतिहासकारहरूसँग लिइएका प्रमाणित अन्तर्वार्ता तथा श्रव्य-दृश्य अभिलेख
                </p>
              </div>
              <span style={{ background: '#f1f5f9', color: '#475569', padding: '0.35rem 0.85rem', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 700 }}>
                कुल अभिलेख: {culturalRecords.length} वटा
              </span>
            </div>

            {loadingCultural ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>सांस्कृतिक अभिलेख लोड हुँदैछ...</div>
            ) : culturalRecords.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', background: '#f8fafc', borderRadius: '12px', color: '#64748b' }}>अभिलेख फेला परेन।</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
                {culturalRecords.map((cr: any) => (
                  <div key={cr.id} style={{
                    background: '#ffffff',
                    borderRadius: '14px',
                    border: '1px solid #e2e8f0',
                    padding: '1.35rem',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                    transition: 'transform 0.15s ease',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.65rem' }}>
                      <span style={{ fontSize: '0.72rem', background: '#e0e7ff', color: '#3730a3', padding: '0.25rem 0.55rem', borderRadius: '4px', fontWeight: 700 }}>
                        {cr.recordId || 'CUL'}
                      </span>
                      <span style={{
                        fontSize: '0.72rem',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '12px',
                        fontWeight: 700,
                        background: cr.verificationStatus === 'Published' ? '#dcfce7' : cr.verificationStatus === 'Verified' ? '#e0f2fe' : '#fef3c7',
                        color: cr.verificationStatus === 'Published' ? '#166534' : cr.verificationStatus === 'Verified' ? '#0369a1' : '#92400e',
                      }}>
                        {cr.verificationStatus === 'Published' ? '✓ प्रकाशित' : cr.verificationStatus === 'Verified' ? '✓ प्रमाणित' : 'मस्यौदा'}
                      </span>
                    </div>

                    <h4 style={{ margin: '0 0 0.45rem 0', fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                      {cr.title}
                    </h4>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: '#64748b', marginBottom: '0.75rem' }}>
                      <MapPin size={14} color="#0284c7" />
                      <span>{cr.location || 'पञ्चपोखरी थाङपाल'}</span>
                    </div>

                    <p style={{ fontSize: '0.85rem', lineHeight: 1.55, color: '#334155', margin: '0 0 1rem 0', flex: 1 }}>
                      {cr.description}
                    </p>

                    <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '0.65rem 0.8rem', fontSize: '0.8rem', color: '#475569', marginBottom: '0.85rem' }}>
                      {cr.intervieweeName && (
                        <div style={{ marginBottom: '0.2rem' }}>
                          <strong>अन्तर्वार्तादाता:</strong> {cr.intervieweeName}
                        </div>
                      )}
                      {cr.interviewerName && (
                        <div>
                          <strong>सङ्कलनकर्ता:</strong> {cr.interviewerName}
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem', alignItems: 'center' }}>
                      {cr.audioUrl && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', background: '#ecfdf5', color: '#065f46', padding: '0.25rem 0.55rem', borderRadius: '6px', fontWeight: 600 }}>
                          <Headphones size={13} /> अडियो
                        </span>
                      )}
                      {cr.videoUrl && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', background: '#eff6ff', color: '#1d4ed8', padding: '0.25rem 0.55rem', borderRadius: '6px', fontWeight: 600 }}>
                          <Video size={13} /> भिडियो
                        </span>
                      )}
                      {cr.transcriptUrl && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', background: '#fdf4ff', color: '#86198f', padding: '0.25rem 0.55rem', borderRadius: '6px', fontWeight: 600 }}>
                          <FileText size={13} /> टिपोट
                        </span>
                      )}
                      <span style={{ marginLeft: 'auto', fontSize: '0.72rem', background: '#f1f5f9', color: '#475569', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>
                        {cr.type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: DESTINATIONS */}
      {/* ========================================================================= */}
      {activeTab === 'destinations' && (
        <div>
          {loadingDestinations ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>गन्तव्यहरू लोड हुँदैछ...</div>
          ) : filteredDestinations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>कुनै पर्यटकीय गन्तव्य फेला परेन।</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {filteredDestinations.map(dest => (
                <div key={dest.id} style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                  <div style={{ height: '210px', backgroundImage: `url(${dest.imageUrl || 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=500&q=80'})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(15, 23, 42, 0.85)', color: '#fff', padding: '0.25rem 0.7rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>
                      ⛰️ {dest.altitudeMeters} मिटर
                    </div>
                    {dest.wardNo && (
                      <div style={{ position: 'absolute', bottom: '10px', left: '10px', background: '#0284c7', color: '#fff', padding: '0.25rem 0.65rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>
                        वडा नं. {dest.wardNo}
                      </div>
                    )}
                  </div>
                  <div style={{ padding: '1.35rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.25rem', color: '#0f172a', fontWeight: 800 }}>{dest.name}</h3>
                    {dest.nameEn && <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.75rem' }}>{dest.nameEn}</div>}
                    <p style={{ fontSize: '0.88rem', lineHeight: 1.55, color: '#334155', flex: 1, margin: '0 0 1rem 0' }}>
                      {dest.description}
                    </p>

                    <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.82rem', color: '#64748b' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Calendar size={13} color="#0284c7" />
                        <span>उत्कृष्ट मौसम: <strong>{dest.bestSeason}</strong></span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Clock size={13} color="#0284c7" />
                        <span>समय: <strong>{dest.trekDuration}</strong></span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: TOUR PACKAGES */}
      {/* ========================================================================= */}
      {activeTab === 'packages' && (
        <div>
          {loadingPackages ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>प्याकेजहरू लोड हुँदैछ...</div>
          ) : filteredPackages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>कुनै ट्रेकिङ प्याकेज फेला परेन।</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {filteredPackages.map(pkg => (
                <div key={pkg.id} style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                  <div style={{ height: '200px', backgroundImage: `url(${pkg.imageUrl || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=500&q=80'})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '10px', right: '10px', background: '#0284c7', color: '#fff', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>
                      ⏱️ {pkg.durationDays} दिन
                    </div>
                  </div>
                  <div style={{ padding: '1.35rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ margin: '0 0 0.35rem 0', fontSize: '1.25rem', color: '#0f172a', fontWeight: 800 }}>{pkg.title}</h3>
                    <p style={{ fontSize: '0.88rem', lineHeight: 1.55, color: '#334155', margin: '0 0 1rem 0', flex: 1 }}>{pkg.description}</p>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0284c7', marginBottom: '1rem' }}>रु {pkg.costPerPerson} / व्यक्ति</div>
                    <button
                      onClick={() => setSelectedBooking({ type: 'package', name: pkg.title, price: pkg.costPerPerson })}
                      style={{ width: '100%', background: '#0284c7', color: '#fff', border: 'none', padding: '0.7rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.88rem' }}
                    >
                      प्याकेज बुकिङ गर्नुहोस्
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 8: TREKKER SAFETY & AMS PROTOCOL */}
      {/* ========================================================================= */}
      {activeTab === 'safety' && (
        <div>
          <div style={{
            background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #4338ca 100%)',
            color: '#fff',
            borderRadius: '16px',
            padding: '2rem',
            marginBottom: '2rem',
            boxShadow: '0 10px 25px -5px rgba(49, 46, 129, 0.3)'
          }}>
            <div style={{ maxWidth: '820px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.15)', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                <ShieldAlert size={15} color="#c7d2fe" /> उच्च उचाइ स्वास्थ्य तथा आपतकालीन सुरक्षा प्रोटोकल
              </div>
              <h2 style={{ fontSize: '1.85rem', fontWeight: 800, margin: '0 0 0.65rem 0' }}>
                लेक लाग्ने (Acute Mountain Sickness) सचेतना तथा उद्धार प्रणाली
              </h2>
              <p style={{ fontSize: '0.95rem', lineHeight: 1.6, opacity: 0.92, margin: 0 }}>
                पाँचपोखरी (४,१०० मी.) तथा आमा याङ्ग्री (३,७७१ मी.) पदयात्रामा ३,००० मिटरभन्दा माथिको उचाइमा शरीरलाई अनुकूलन (Acclimatization) गराउनु अनिवार्य छ। लक्षण देखिएमा तुरुन्त प्राथमिक उपचार र तल झर्ने निर्णय गर्नुहोस्।
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
            <div style={{ background: '#ffffff', borderRadius: '12px', border: '1.5px solid #86efac', padding: '1.25rem' }}>
              <h4 style={{ margin: '0 0 0.5rem', color: '#166534', fontWeight: 700 }}>१. सामान्य लक्षण (Mild AMS)</h4>
              <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.2rem', fontSize: '0.85rem', color: '#334155' }}>
                <li>हल्का टाउको दुख्ने, थकान महसुस हुने, भोक नलाग्ने।</li>
              </ul>
              <div style={{ background: '#f0fdf4', padding: '0.5rem', borderRadius: '6px', fontSize: '0.8rem', color: '#15803d', fontWeight: 600 }}>
                ✓ ४ लिटर मनतातो पानी पिउने, थप उकालो नचढ्ने।
              </div>
            </div>

            <div style={{ background: '#ffffff', borderRadius: '12px', border: '1.5px solid #fde047', padding: '1.25rem' }}>
              <h4 style={{ margin: '0 0 0.5rem', color: '#854d0e', fontWeight: 700 }}>२. मध्यम लक्षण (Moderate AMS)</h4>
              <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.2rem', fontSize: '0.85rem', color: '#334155' }}>
                <li>कडा टाउको दुखाइ, वाकवाकी, सास फेर्न गाह्रो।</li>
              </ul>
              <div style={{ background: '#fefce8', padding: '0.5rem', borderRadius: '6px', fontSize: '0.8rem', color: '#a16207', fontWeight: 600 }}>
                ⚠️ तुरुन्त ५०० मिटर तल (देउराली वा नोस्यामपाटी) ओर्लिने।
              </div>
            </div>

            <div style={{ background: '#ffffff', borderRadius: '12px', border: '1.5px solid #fca5a5', padding: '1.25rem' }}>
              <h4 style={{ margin: '0 0 0.5rem', color: '#991b1b', fontWeight: 700 }}>३. गम्भीर जोखिम (Severe HAPE/HACE)</h4>
              <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.2rem', fontSize: '0.85rem', color: '#334155' }}>
                <li>हिँड्न नसक्ने, बेहोस हुने, ओठ नीलो हुने।</li>
              </ul>
              <div style={{ background: '#fef2f2', padding: '0.5rem', borderRadius: '6px', fontSize: '0.8rem', color: '#b91c1c', fontWeight: 700 }}>
                🚨 तत्काल अक्सिजन दिने, तुरुन्त हेलिकप्टर उद्धार बोलाउने।
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 9: LOCAL PRODUCTS */}
      {/* ========================================================================= */}
      {activeTab === 'products' && (
        <div>
          {loadingProducts ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>उत्पादनहरू लोड हुँदैछ...</div>
          ) : filteredProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>कुनै स्थानीय उत्पादन फेला परेन।</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {filteredProducts.map(prod => (
                <div key={prod.id} style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                  <div style={{ height: '180px', backgroundImage: `url(${prod.imageUrl || 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=500&q=80'})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
                    <span style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(15, 23, 42, 0.85)', color: '#fff', padding: '0.25rem 0.65rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>
                      {prod.category}
                    </span>
                  </div>
                  <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ margin: '0 0 0.25rem 0', color: '#0f172a', fontSize: '1.15rem', fontWeight: 800 }}>{prod.name}</h3>
                    <div style={{ color: '#0284c7', fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.75rem' }}>रु {prod.price || '—'}</div>
                    <div style={{ fontSize: '0.85rem', color: '#475569', background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', flex: 1 }}>
                      <div>उत्पादक: <strong>{prod.vendorName}</strong></div>
                      {prod.wardNo && <div>वडा नं. {prod.wardNo}</div>}
                    </div>
                    <button
                      onClick={() => prod.contactNumber ? window.open(`tel:${prod.contactNumber}`) : alert(`सम्पर्क: ${prod.vendorName}`)}
                      style={{ width: '100%', marginTop: '1rem', background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', padding: '0.65rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.88rem' }}
                    >
                      <Phone size={14} style={{ display: 'inline', marginRight: '4px' }} /> अर्डर सोधपुछ ({prod.contactNumber || 'सम्पर्क'})
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB: VISITOR & TOURIST RECORDS DIGITAL TWIN */}
      {/* ========================================================================= */}
      {activeTab === 'visitors' && (
        <div>
          {/* Header Banner */}
          <div style={{
            background: 'linear-gradient(135deg, #0c4a6e 0%, #0369a1 50%, #0284c7 100%)',
            color: '#fff',
            borderRadius: '16px',
            padding: '2rem',
            marginBottom: '2rem',
            boxShadow: '0 10px 25px -5px rgba(3, 105, 161, 0.25)'
          }}>
            <div style={{ maxWidth: '850px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', background: 'rgba(255,255,255,0.18)', padding: '0.35rem 0.85rem', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                <Users size={14} color="#bae6fd" /> पर्यटक तथा आगन्तुक डिजिटल ट्विन (Visitor Analytics Twin)
              </div>
              <h2 style={{ fontSize: '1.85rem', fontWeight: 800, margin: '0 0 0.65rem 0' }}>
                आगन्तुक तथा पर्यटक अभिलेख व्यवस्थापन प्रणाली
              </h2>
              <p style={{ fontSize: '0.95rem', lineHeight: 1.6, opacity: 0.94, margin: 0 }}>
                पञ्चपोखरी, आमा याङ्ग्री, ड्रयागन फल्स तथा ह्योल्मो सांस्कृतिक मार्गमा भ्रमण गर्ने स्वदेशी तथा विदेशी पर्यटकहरूको मासिक लगत, बसाई अवधि, राजस्व संकलन तथा गन्तव्य विश्लेषण।
              </p>
            </div>
          </div>

          {/* KPI Analytics Cards */}
          {(() => {
            const filtered = visitorRecords.filter((v: any) => {
              if (visitorTypeFilter !== 'all' && v.visitorType !== visitorTypeFilter) return false;
              if (searchTerm && searchTerm.trim()) {
                const term = searchTerm.toLowerCase();
                const dest = (v.destination || '').toLowerCase();
                const nat = (v.nationality || '').toLowerCase();
                const notes = (v.notes || '').toLowerCase();
                if (!dest.includes(term) && !nat.includes(term) && !notes.includes(term)) return false;
              }
              return true;
            });

            const totalVisitors = filtered.reduce((acc: number, cur: any) => acc + (cur.count || 0), 0);
            const domesticVisitors = filtered.filter((v: any) => v.visitorType === 'domestic').reduce((acc: number, cur: any) => acc + (cur.count || 0), 0);
            const intlVisitors = filtered.filter((v: any) => v.visitorType === 'international').reduce((acc: number, cur: any) => acc + (cur.count || 0), 0);
            const totalRevenue = filtered.reduce((acc: number, cur: any) => acc + (parseFloat(cur.revenueNPR) || 0), 0);

            return (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
                  <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.35rem', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.84rem', color: '#64748b', fontWeight: 600 }}>कुल पर्यटक संख्या</span>
                      <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
                        <Users size={20} />
                      </div>
                    </div>
                    <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>
                      {totalVisitors.toLocaleString()} <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#64748b' }}>जना</span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#059669', fontWeight: 600 }}>
                      आर्थिक वर्ष {visitorFyFilter === 'all' ? 'समग्र' : visitorFyFilter} लगत
                    </div>
                  </div>

                  <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.35rem', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.84rem', color: '#64748b', fontWeight: 600 }}>आन्तरिक पर्यटक (स्वदेशी)</span>
                      <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}>
                        <Mountain size={20} />
                      </div>
                    </div>
                    <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#059669', marginBottom: '0.25rem' }}>
                      {domesticVisitors.toLocaleString()} <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#64748b' }}>जना</span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      कुल पर्यटकको {totalVisitors > 0 ? Math.round((domesticVisitors / totalVisitors) * 100) : 0}% हिस्सा
                    </div>
                  </div>

                  <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.35rem', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.84rem', color: '#64748b', fontWeight: 600 }}>अन्तर्राष्ट्रिय पर्यटक (विदेशी)</span>
                      <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#faf5ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7c3aed' }}>
                        <Globe size={20} />
                      </div>
                    </div>
                    <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#7c3aed', marginBottom: '0.25rem' }}>
                      {intlVisitors.toLocaleString()} <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#64748b' }}>जना</span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      कुल पर्यटकको {totalVisitors > 0 ? Math.round((intlVisitors / totalVisitors) * 100) : 0}% हिस्सा
                    </div>
                  </div>

                  <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.35rem', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.84rem', color: '#64748b', fontWeight: 600 }}>कुल संकलित पर्यटन राजस्व</span>
                      <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}>
                        <DollarSign size={20} />
                      </div>
                    </div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#d97706', marginBottom: '0.25rem' }}>
                      {formatNpr(totalRevenue)}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#059669', fontWeight: 600 }}>
                      प्रवेश शुल्क, गाइड दस्तुर तथा पदमार्ग सेवा शुल्क
                    </div>
                  </div>
                </div>

                {/* Filter Controls Bar */}
                <div style={{
                  background: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  marginBottom: '1.5rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569' }}>आर्थिक वर्ष:</label>
                      <select
                        value={visitorFyFilter}
                        onChange={(e) => setVisitorFyFilter(e.target.value)}
                        style={{
                          padding: '0.45rem 0.85rem',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.84rem',
                          fontWeight: 600,
                          color: '#0f172a',
                          background: '#f8fafc',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="all">सबै आर्थिक वर्ष</option>
                        <option value="२०८१/०८२">२०८१/०८२</option>
                        <option value="२०८०/०८१">२०८०/०८१</option>
                      </select>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569' }}>पर्यटक प्रकार:</label>
                      <select
                        value={visitorTypeFilter}
                        onChange={(e) => setVisitorTypeFilter(e.target.value)}
                        style={{
                          padding: '0.45rem 0.85rem',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.84rem',
                          fontWeight: 600,
                          color: '#0f172a',
                          background: '#f8fafc',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="all">सबै (आन्तरिक र विदेशी)</option>
                        <option value="domestic">आन्तरिक (Domestic)</option>
                        <option value="international">अन्तर्राष्ट्रिय (International)</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.84rem', color: '#64748b' }}>
                    नतिजा: <strong>{filtered.length}</strong> वटा मासिक रेकर्ड
                  </div>
                </div>

                {/* Table of Monthly Visitor Records */}
                <div style={{
                  background: '#ffffff',
                  borderRadius: '14px',
                  border: '1px solid #e2e8f0',
                  overflow: 'hidden',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                }}>
                  <div style={{ padding: '1.25rem', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                      मासिक पर्यटक अभिलेख तथा राजस्व विवरण (Monthly Records Registry)
                    </h3>
                  </div>

                  {loadingVisitors ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>पर्यटक तथ्याङ्क लोड हुँदैछ...</div>
                  ) : filtered.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>कुनै अभिलेख फेला परेन।</div>
                  ) : (
                    <div className="dt-responsive-table-wrapper" style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem', textAlign: 'left' }}>
                        <thead>
                          <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 700 }}>
                            <th style={{ padding: '0.85rem 1rem' }}>आ.व.</th>
                            <th style={{ padding: '0.85rem 1rem' }}>महिना</th>
                            <th style={{ padding: '0.85rem 1rem' }}>प्रकार</th>
                            <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>आगन्तुक संख्या</th>
                            <th style={{ padding: '0.85rem 1rem' }}>प्रमुख गन्तव्य</th>
                            <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>राजस्व रु.</th>
                            <th style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>बसाई (दिन)</th>
                            <th style={{ padding: '0.85rem 1rem' }}>राष्ट्रियता</th>
                            <th style={{ padding: '0.85rem 1rem' }}>कैफियत / उद्देश्य</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filtered.map((item: any) => {
                            const monthNames: Record<number, string> = {
                              1: 'वैशाख', 2: 'जेठ', 3: 'असार', 4: 'साउन',
                              5: 'भाद्र', 6: 'असोज', 7: 'कात्तिक', 8: 'मंसिर',
                              9: 'पुस', 10: 'माघ', 11: 'फागुन', 12: 'चैत'
                            };
                            const isDomestic = item.visitorType === 'domestic';

                            return (
                              <tr
                                key={item.id}
                                style={{
                                  borderBottom: '1px solid #f1f5f9',
                                  transition: 'background 0.15s ease'
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                                onMouseLeave={(e) => (e.currentTarget.style.background = '#ffffff')}
                              >
                                <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#0f172a' }}>
                                  {item.fiscalYear}
                                </td>
                                <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#334155' }}>
                                  {monthNames[item.month] || item.month || '-'}
                                </td>
                                <td style={{ padding: '0.85rem 1rem' }}>
                                  <span style={{
                                    display: 'inline-block',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    padding: '0.2rem 0.6rem',
                                    borderRadius: '12px',
                                    background: isDomestic ? '#dcfce7' : '#f3e8ff',
                                    color: isDomestic ? '#166534' : '#6b21a8'
                                  }}>
                                    {isDomestic ? 'नेपाली (आन्तरिक)' : 'विदेशी (पर्यटक)'}
                                  </span>
                                </td>
                                <td style={{ padding: '0.85rem 1rem', textAlign: 'right', fontWeight: 800, color: '#0f172a' }}>
                                  {(item.count || 0).toLocaleString()}
                                </td>
                                <td style={{ padding: '0.85rem 1rem', color: '#1e293b', fontWeight: 600 }}>
                                  {item.destination || '-'}
                                </td>
                                <td style={{ padding: '0.85rem 1rem', textAlign: 'right', fontWeight: 700, color: '#059669' }}>
                                  {formatNpr(item.revenueNPR)}
                                </td>
                                <td style={{ padding: '0.85rem 1rem', textAlign: 'center', color: '#64748b' }}>
                                  {item.averageStayDays ? `${item.averageStayDays} दिन` : '-'}
                                </td>
                                <td style={{ padding: '0.85rem 1rem', color: '#475569' }}>
                                  {item.nationality || 'नेपाली'}
                                </td>
                                <td style={{ padding: '0.85rem 1rem', fontSize: '0.82rem', color: '#64748b', maxWidth: '240px' }}>
                                  {item.notes || '-'}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SACRED LAKE DETAIL MODAL */}
      {/* ========================================================================= */}
      {selectedLakeForModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(8px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '750px',
            maxHeight: '92vh',
            overflowY: 'auto',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{
              height: '240px',
              backgroundImage: `url(${selectedLakeForModal.imageUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              position: 'relative',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              color: '#fff'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ background: 'rgba(0,0,0,0.6)', padding: '0.3rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700 }}>
                  🏔️ उचाइ: {selectedLakeForModal.altitudeMeters} मिटर
                </span>
                <button
                  onClick={() => setSelectedLakeForModal(null)}
                  style={{ background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <X size={18} />
                </button>
              </div>

              <div>
                <span style={{ background: selectedLakeForModal.colorHex, padding: '0.25rem 0.65rem', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700 }}>
                  {selectedLakeForModal.waterColor}
                </span>
                <h2 style={{ margin: '0.4rem 0 0', fontSize: '1.75rem', fontWeight: 800, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                  {selectedLakeForModal.name}
                </h2>
              </div>
            </div>

            <div style={{ padding: '1.75rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '10px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>गहिराई</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0284c7' }}>{selectedLakeForModal.depthMeters} मी.</div>
                </div>
                <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '10px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>क्षेत्रफल</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>{selectedLakeForModal.areaRopani} रोपनी</div>
                </div>
                <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '10px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>धार्मिक महत्व</div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#16a34a', marginTop: '0.2rem' }}>{selectedLakeForModal.deitySignificance.slice(0, 15)}...</div>
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <h4 style={{ margin: '0 0 0.35rem', color: '#0f172a', fontWeight: 800 }}>📖 कुण्डको परिचय तथा स्वरूप:</h4>
                <p style={{ margin: 0, fontSize: '0.88rem', color: '#334155', lineHeight: 1.6 }}>{selectedLakeForModal.description}</p>
              </div>

              <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', padding: '1rem', borderRadius: '10px', marginBottom: '1.25rem' }}>
                <h4 style={{ margin: '0 0 0.35rem', color: '#0369a1', fontWeight: 800 }}>✨ पौराणिक किंवदन्ती तथा आध्यात्मिक कथा:</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#1e293b', lineHeight: 1.55 }}>{selectedLakeForModal.mythology}</p>
              </div>

              <div style={{ background: '#fefce8', border: '1px solid #fef08a', padding: '1rem', borderRadius: '10px', marginBottom: '1.5rem' }}>
                <h4 style={{ margin: '0 0 0.35rem', color: '#854d0e', fontWeight: 800 }}>🙏 पूजाअर्चना विधि तथा धार्मिक आचारसंहिता:</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#713f12', lineHeight: 1.55 }}>{selectedLakeForModal.rituals}</p>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={() => window.open(`/gis-map?filter=viewpoint&lat=${selectedLakeForModal.coordinates.lat}&lng=${selectedLakeForModal.coordinates.lng}`, '_blank')}
                  style={{ flex: 1, background: '#0284c7', color: '#fff', border: 'none', padding: '0.75rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
                >
                  🌐 GIS डिजिटल नक्सामा हेर्नुहोस्
                </button>
                <button
                  onClick={() => setSelectedLakeForModal(null)}
                  style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
                >
                  बन्द गर्नुहोस्
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3D TOPOGRAPHIC TERRAIN MODAL */}
      {/* ========================================================================= */}
      {show3DModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(8px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{
            background: '#0f172a',
            color: '#fff',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '1050px',
            maxHeight: '92vh',
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.2)',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
          }}>
            <div style={{ padding: '1.25rem 1.75rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Mountain size={20} /> पाँचपोखरी थाङपाल ३D टोपोग्राफिक मोडल (Isometric Elevation Twin)
                </h3>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.82rem', color: '#94a3b8' }}>
                  १,२०० मी. मेलम्ची उपत्यका देखि ४,१०० मी. पाँचपोखरी कुण्ड सम्मको वास्तविक भौगोलिक उचाइ सतह। माउसले घुमाउनुहोस् (Drag to rotate)।
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button
                  onClick={() => window.open('/gis-map?filter=viewpoint', '_blank')}
                  style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '0.5rem 0.9rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 700 }}
                >
                  🌐 Full GIS Map
                </button>
                <button
                  onClick={() => setShow3DModal(false)}
                  style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div style={{ flex: 1, position: 'relative', minHeight: '520px' }}>
              <Terrain3DView height="520px" />
            </div>
          </div>
        </div>
      )}

      {/* Online Booking Modal */}
      {selectedBooking && (
        <BookingModal
          isOpen={!!selectedBooking}
          onClose={() => setSelectedBooking(null)}
          bookingType={selectedBooking.type}
          referenceId={selectedBooking.name}
          defaultPrice={selectedBooking.price}
        />
      )}
    </div>
  );
};

export default Tourism;
