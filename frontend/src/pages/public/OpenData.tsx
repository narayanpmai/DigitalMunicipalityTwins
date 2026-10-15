import React, { useState, useMemo } from 'react';
import {
  Database,
  Download,
  FileJson,
  FileSpreadsheet,
  Layers,
  Calendar,
  Sparkles,
  Search,
  Filter,
  RefreshCw,
  Building,
  Target,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  FileText,
  Eye,
  Award,
  BookOpen,
  TrendingUp,
  ShieldCheck,
  Compass,
  ChevronRight,
  X,
  Share2,
  Table,
  Cpu,
  Globe,
  Activity,
  Heart,
  Droplet,
  GraduationCap,
  Wheat,
} from 'lucide-react';

interface DatasetItem {
  id: string;
  title: string;
  titleEn: string;
  category: 'demographics' | 'finance' | 'agriculture' | 'education' | 'health' | 'infrastructure' | 'disaster';
  categoryLabel: string;
  categoryIcon: any;
  fiscalYear: string;
  recordsCount: string;
  fileSizeCsv: string;
  fileSizeJson: string;
  publishDate: string;
  updatedDate: string;
  department: string;
  license: string;
  description: string;
  columns: string[];
  sampleData: Record<string, any>[];
}

// 8 Rich Authentic Local Datasets for Panchpokhari Thangpal
const OPEN_DATASETS: DatasetItem[] = [
  {
    id: 'ds-demographics-2078',
    title: 'पाँचपोखरी थाङपाल गाउँपालिका वडागत जनसांख्यिक लगत (राष्ट्रिय जनगणना २०७८)',
    titleEn: 'Ward-wise Demographics & Census Data 2078',
    category: 'demographics',
    categoryLabel: 'जनसांख्यिकी तथा घरधुरी',
    categoryIcon: Globe,
    fiscalYear: '२०७८/०७९',
    recordsCount: '८ वडा (२२,४१५ जनसंख्या)',
    fileSizeCsv: '२४ KB',
    fileSizeJson: '४८ KB',
    publishDate: '२०७९-१२-१५',
    updatedDate: '२०८१-०४-०१',
    department: 'योजना, तथ्याङ्क तथा सूचना प्रविधि शाखा',
    license: 'Creative Commons Attribution (CC-BY-SA 4.0)',
    description: 'राष्ट्रिय जनगणना २०७८ अनुसार वडा १ देखि ८ सम्मको कुल जनसंख्या, पुरुष/महिला अनुपात, कुल घरधुरी, औसत परिवार संख्या र साक्षरता दर।',
    columns: ['ward_no', 'ward_name', 'total_population', 'male', 'female', 'households', 'avg_household_size', 'literacy_rate_pct'],
    sampleData: [
      { ward_no: 1, ward_name: 'बाँसखर्क', total_population: 2480, male: 1210, female: 1270, households: 580, avg_household_size: 4.27, literacy_rate_pct: 68.5 },
      { ward_no: 2, ward_name: 'बरुवा', total_population: 2950, male: 1420, female: 1530, households: 690, avg_household_size: 4.28, literacy_rate_pct: 71.2 },
      { ward_no: 3, ward_name: 'भोताङ', total_population: 3420, male: 1680, female: 1740, households: 810, avg_household_size: 4.22, literacy_rate_pct: 74.6 },
      { ward_no: 4, ward_name: 'थाङपालकोट', total_population: 2890, male: 1390, female: 1500, households: 670, avg_household_size: 4.31, literacy_rate_pct: 76.1 },
      { ward_no: 5, ward_name: 'गुन्सा', total_population: 2640, male: 1280, female: 1360, households: 610, avg_household_size: 4.33, literacy_rate_pct: 73.8 },
      { ward_no: 6, ward_name: 'थाङपालधाप', total_population: 3180, male: 1550, female: 1630, households: 740, avg_household_size: 4.30, literacy_rate_pct: 82.4 },
      { ward_no: 7, ward_name: 'तिपेनी', total_population: 2540, male: 1240, female: 1300, households: 590, avg_household_size: 4.31, literacy_rate_pct: 79.5 },
      { ward_no: 8, ward_name: 'लाँगर्चे', total_population: 2315, male: 1120, female: 1195, households: 540, avg_household_size: 4.29, literacy_rate_pct: 70.2 },
    ],
  },
  {
    id: 'ds-budget-expenditure',
    title: 'वार्षिक बजेट, वित्तीय स्रोत तथा पुँजीगत खर्च लगत (आ.व. २०८०/८१ र २०८१/८२)',
    titleEn: 'Municipal Budget Allocation & Expenditure Dataset',
    category: 'finance',
    categoryLabel: 'बजेट तथा वित्त',
    categoryIcon: TrendingUp,
    fiscalYear: '२०८०/०८१ – २०८१/०८२',
    recordsCount: '४८ शीर्षक लगत',
    fileSizeCsv: '३६ KB',
    fileSizeJson: '६५ KB',
    publishDate: '२०८१-०३-२५',
    updatedDate: '२०८१-०५-१०',
    department: 'आर्थिक प्रशासन शाखा (Finance Section)',
    license: 'Open Government Data License (Nepal)',
    description: 'गाउँसभाद्वारा स्वीकृत वार्षिक चालु तथा पुँजीगत बजेट, वित्तीय समानीकरण अनुदान, राजस्व बाँडफाँड र शीर्षकगत खर्चको पूर्ण लगत।',
    columns: ['fiscal_year', 'budget_head', 'sector', 'allocated_npr', 'expenditure_npr', 'progress_pct', 'funding_source'],
    sampleData: [
      { fiscal_year: '२०८१/०८२', budget_head: 'सडक तथा यातायात पूर्वाधार', sector: 'पूर्वाधार', allocated_npr: 185000000, expenditure_npr: 142000000, progress_pct: 76.7, funding_source: 'गाउँसभा समानीकरण तथा प्रदेश' },
      { fiscal_year: '२०८१/०८२', budget_head: 'सामुदायिक विद्यालय दिवा खाजा तथा शिक्षा', sector: 'सामाजिक', allocated_npr: 68000000, expenditure_npr: 58500000, progress_pct: 86.0, funding_source: 'संघीय सशर्त अनुदान' },
      { fiscal_year: '२०८१/०८२', budget_head: 'आधारभूत स्वास्थ्य, औषधि र खोप सेवा', sector: 'स्वास्थ्य', allocated_npr: 42000000, expenditure_npr: 36800000, progress_pct: 87.6, funding_source: 'संघीय तथा आन्तरिक राजस्व' },
      { fiscal_year: '२०८१/०८२', budget_head: 'खानेपानी मुहान संरक्षण तथा एक घर एक धारा', sector: 'पूर्वाधार', allocated_npr: 54000000, expenditure_npr: 42500000, progress_pct: 78.7, funding_source: 'प्रदेश पूर्वाधार साझेदारी' },
      { fiscal_year: '२०८१/०८२', budget_head: 'कृषि तथा पशुपालन अनुदान र मल-बीउ', sector: 'आर्थिक', allocated_npr: 32000000, expenditure_npr: 28400000, progress_pct: 88.7, funding_source: 'गाउँपालिका आन्तरिक आय' },
      { fiscal_year: '२०८१/०८२', budget_head: 'विपद् जोखिम व्यवस्थापन तथा राहत कोष', sector: 'वातावरण', allocated_npr: 25000000, expenditure_npr: 18200000, progress_pct: 72.8, funding_source: 'प्रकोप व्यवस्थापन कोष' },
    ],
  },
  {
    id: 'ds-agriculture-production',
    title: 'कृषि बाली क्षेत्रफल, उत्पादन परिमाण तथा चौँरी/पशुपालन लगत',
    titleEn: 'Crop Production & Livestock Statistics Dataset',
    category: 'agriculture',
    categoryLabel: 'कृषि तथा पशुपन्छी',
    categoryIcon: Wheat,
    fiscalYear: '२०८०/०८१',
    recordsCount: '३२ वस्तु लगत',
    fileSizeCsv: '१८ KB',
    fileSizeJson: '४२ KB',
    publishDate: '२०८१-०२-१५',
    updatedDate: '२०८१-०४-२८',
    department: 'कृषि तथा पशुपन्छी विकास शाखा',
    license: 'Creative Commons CC-BY-SA 4.0',
    description: 'पाँचपोखरीका प्रमुख कृषि बालीहरू (आलु, मकै, कोदो, किबी, स्याउ, ट्राउट माछा) को क्षेत्रफल, वार्षिक उत्पादन (मे.टन) र चौँरीपालन लगत।',
    columns: ['crop_or_animal', 'category', 'cultivated_area_ha', 'production_mt_or_count', 'yield_per_ha_mt', 'households_involved'],
    sampleData: [
      { crop_or_animal: 'स्थानीय रातो आलु (Red Potato)', category: 'खाद्यान्न/नगदे', cultivated_area_ha: 840, production_mt_or_count: 11760, yield_per_ha_mt: 14.0, households_involved: 3840 },
      { crop_or_animal: 'मकै (Maize)', category: 'अन्नबाली', cultivated_area_ha: 1250, production_mt_or_count: 3125, yield_per_ha_mt: 2.5, households_involved: 4120 },
      { crop_or_animal: 'कोदो (Finger Millet)', category: 'अन्नबाली', cultivated_area_ha: 780, production_mt_or_count: 1092, yield_per_ha_mt: 1.4, households_involved: 3450 },
      { crop_or_animal: 'किबी फल (Kiwi Fruit)', category: 'उच्च मूल्य फलफूल', cultivated_area_ha: 45, production_mt_or_count: 360, yield_per_ha_mt: 8.0, households_involved: 320 },
      { crop_or_animal: 'हिमाली चौँरी / याक (Yak/Chauri)', category: 'पशुपालन', cultivated_area_ha: 0, production_mt_or_count: 480, yield_per_ha_mt: 0, households_involved: 65 },
      { crop_or_animal: 'रेन्बो ट्राउट माछा (Rainbow Trout)', category: 'मत्स्यपालन', cultivated_area_ha: 8, production_mt_or_count: 48, yield_per_ha_mt: 6.0, households_involved: 18 },
    ],
  },
  {
    id: 'ds-schools-emis',
    title: 'सामुदायिक तथा संस्थागत विद्यालय सूची, EMIS कोड तथा BLE/SEE नतिजा',
    titleEn: 'Schools Profile & BLE Exam Analytics Dataset',
    category: 'education',
    categoryLabel: 'शिक्षा तथा विद्यालय',
    categoryIcon: GraduationCap,
    fiscalYear: '२०८०/०८१',
    recordsCount: '२५ विद्यालय (५,७६० विद्यार्थी)',
    fileSizeCsv: '२८ KB',
    fileSizeJson: '५२ KB',
    publishDate: '२०८१-०३-०१',
    updatedDate: '२०८१-०४-१५',
    department: 'शिक्षा, युवा तथा खेलकुद शाखा',
    license: 'Creative Commons CC-BY-SA 4.0',
    description: 'पालिकाका २५ सामुदायिक तथा संस्थागत विद्यालयहरू, विद्यार्थी संख्या, शिक्षक दरबन्दी, EMIS कोड र BLE कक्षा ८ को परीक्षा उपलब्धि।',
    columns: ['school_name', 'emis_code', 'ward_no', 'level', 'total_students', 'teachers_count', 'ble_avg_gpa', 'pass_rate_pct'],
    sampleData: [
      { school_name: 'श्री थाङपाल भ्याली मा.वि.', emis_code: '230150001', ward_no: 3, level: 'माध्यमिक (१-१२)', total_students: 420, teachers_count: 22, ble_avg_gpa: 3.42, pass_rate_pct: 100.0 },
      { school_name: 'श्री थाङपालधाप मा.वि.', emis_code: '230150002', ward_no: 6, level: 'माध्यमिक (१-१२)', total_students: 385, teachers_count: 21, ble_avg_gpa: 3.35, pass_rate_pct: 100.0 },
      { school_name: 'श्री भोताङदेवि मा.वि.', emis_code: '230150003', ward_no: 3, level: 'माध्यमिक (१-१०)', total_students: 310, teachers_count: 17, ble_avg_gpa: 3.28, pass_rate_pct: 98.2 },
      { school_name: 'याङ्ग्री एकेडेमिक स्कुल', emis_code: '230150004', ward_no: 2, level: 'माध्यमिक (१-१०)', total_students: 290, teachers_count: 16, ble_avg_gpa: 3.25, pass_rate_pct: 96.5 },
      { school_name: 'श्री लाँगर्चे मा.वि.', emis_code: '230150005', ward_no: 8, level: 'माध्यमिक (१-१०)', total_students: 260, teachers_count: 15, ble_avg_gpa: 3.18, pass_rate_pct: 95.0 },
      { school_name: 'श्री तिपेनी आधारभूत विद्यालय', emis_code: '230150006', ward_no: 7, level: 'आधारभूत (१-८)', total_students: 185, teachers_count: 9, ble_avg_gpa: 2.92, pass_rate_pct: 92.4 },
    ],
  },
  {
    id: 'ds-health-facilities',
    title: 'स्वास्थ्य संस्था, बर्थिङ सेन्टर, खोप सेवा तथा औषधि मौज्दात लगत',
    titleEn: 'Health Facilities & Immunization Coverage Dataset',
    category: 'health',
    categoryLabel: 'स्वास्थ्य सेवा तथा खोप',
    categoryIcon: Heart,
    fiscalYear: '२०८०/०८१',
    recordsCount: '११ स्वास्थ्य एकाइ',
    fileSizeCsv: '१५ KB',
    fileSizeJson: '३२ KB',
    publishDate: '२०८१-०१-२०',
    updatedDate: '२०८१-०४-१०',
    department: 'स्वास्थ्य शाखा (Health Section)',
    license: 'Creative Commons CC-BY-SA 4.0',
    description: 'पालिकाका स्वास्थ्य चौकी, सामुदायिक स्वास्थ्य एकाइ, बर्थिङ सेन्टर, पूर्ण खोप कभरेज (९८.५%) र एम्बुलेन्स सेवा विवरण।',
    columns: ['facility_name', 'facility_type', 'ward_no', 'annual_opd_patients', 'birthing_service', 'ambulance_standby', 'full_immunization_pct'],
    sampleData: [
      { facility_name: 'थाङपालधाप आधारभूत अस्पताल / स्वा.चौ.', facility_type: 'आधारभूत अस्पताल', ward_no: 6, annual_opd_patients: 4820, birthing_service: 'उपलब्ध (२४/७)', ambulance_standby: 'उपलब्ध', full_immunization_pct: 99.1 },
      { facility_name: 'भोताङ स्वास्थ्य चौकी', facility_type: 'स्वास्थ्य चौकी', ward_no: 3, annual_opd_patients: 3410, birthing_service: 'उपलब्ध (२४/७)', ambulance_standby: 'उपलब्ध', full_immunization_pct: 98.4 },
      { facility_name: 'बरुवा स्वास्थ्य चौकी', facility_type: 'स्वास्थ्य चौकी', ward_no: 2, annual_opd_patients: 2950, birthing_service: 'उपलब्ध (२४/७)', ambulance_standby: 'उपलब्ध', full_immunization_pct: 98.0 },
      { facility_name: 'गुन्सा स्वास्थ्य चौकी', facility_type: 'स्वास्थ्य चौकी', ward_no: 5, annual_opd_patients: 2640, birthing_service: 'उपलब्ध', ambulance_standby: 'कलमा उपलब्ध', full_immunization_pct: 98.6 },
      { facility_name: 'तिपेनी स्वास्थ्य एकाइ', facility_type: 'सामुदायिक स्वास्थ्य एकाइ', ward_no: 7, annual_opd_patients: 2180, birthing_service: 'रेफरल सेन्टर', ambulance_standby: 'कलमा उपलब्ध', full_immunization_pct: 99.2 },
    ],
  },
  {
    id: 'ds-infrastructure-roads',
    title: 'सडक सञ्जाल लगत, पुल तथा पूर्वाधार सम्पत्ति डिजिटल अभिलेख',
    titleEn: 'Roads, Bridges & Physical Infrastructure Dataset',
    category: 'infrastructure',
    categoryLabel: 'सडक तथा पूर्वाधार',
    categoryIcon: Building,
    fiscalYear: '२०८१/०८२',
    recordsCount: '२४४.७ कि.मि. सञ्जाल',
    fileSizeCsv: '३२ KB',
    fileSizeJson: '६८ KB',
    publishDate: '२०८१-०४-०५',
    updatedDate: '२०८१-०५-१२',
    department: 'पूर्वाधार तथा प्राविधिक शाखा',
    license: 'Creative Commons CC-BY-SA 4.0',
    description: 'कालोपत्रे (३८.५ कि.मि.), ग्राभेल (६४.२ कि.मि.), कच्ची सडक (१४२ कि.मि.), ५ पक्की मोटरेबल पुल र ११ झोलुङ्गे पुलको पूर्ण लगत।',
    columns: ['road_or_bridge_name', 'type', 'length_km_or_span_m', 'ward_connectivity', 'condition', 'beneficiary_households'],
    sampleData: [
      { road_or_bridge_name: 'मेलम्ची–तिपेनी–थाङपालधाप सडक', type: 'कालोपत्रे सडक', length_km_or_span_m: 18.2, ward_connectivity: 'वडा ६, ७', condition: 'उत्कृष्ट (Good)', beneficiary_households: 2450 },
      { road_or_bridge_name: 'थाङपालधाप–भोताङ पर्यटन सडक', type: 'कालोपत्रे/ग्राभेल', length_km_or_span_m: 12.5, ward_connectivity: 'वडा ३, ६', condition: 'स्तरोन्नति हुँदै', beneficiary_households: 1820 },
      { road_or_bridge_name: 'बाँसखर्क कृषि लिङ्क सडक', type: 'ओटासिल कालोपत्रे', length_km_or_span_m: 7.8, ward_connectivity: 'वडा १', condition: 'राम्रो (Fair)', beneficiary_households: 680 },
      { road_or_bridge_name: 'इन्द्रावती पक्की मोटरेबल पुल', type: 'आरसीसी प्रि-स्ट्रेस्ड पुल', length_km_or_span_m: 42.0, ward_connectivity: 'वडा ७', condition: 'सञ्चालनमा', beneficiary_households: 4200 },
      { road_or_bridge_name: 'याङ्ग्री खोला आरसीसी पुल', type: 'आरसीसी बिम पुल', length_km_or_span_m: 35.0, ward_connectivity: 'वडा २', condition: 'सञ्चालनमा', beneficiary_households: 1950 },
    ],
  },
  {
    id: 'ds-disaster-risks',
    title: 'विपद् जोखिम बिन्दु, बाढी सेन्सर लगत तथा आपतकालीन आश्रयस्थल',
    titleEn: 'Disaster Risk Points & Early Warning Sensors Dataset',
    category: 'disaster',
    categoryLabel: 'विपद् तथा वातावरण',
    categoryIcon: Activity,
    fiscalYear: '२०८१/०८२',
    recordsCount: '४८ बिन्दु लगत',
    fileSizeCsv: '२० KB',
    fileSizeJson: '४० KB',
    publishDate: '२०८१-०२-१०',
    updatedDate: '२०८१-०५-०१',
    department: 'विपद् जोखिम व्यवस्थापन तथा वातावरण एकाइ',
    license: 'Open Data Nepal (Govt CC)',
    description: 'मेलम्ची, इन्द्रावती र याङ्ग्री खोलाका नदी जलसतह सेन्सर, पहिरो जोखिम क्षेत्र, हेलिप्याड र आपतकालीन आश्रयस्थल लगत।',
    columns: ['station_or_site_name', 'type', 'ward_no', 'warning_threshold_m', 'danger_threshold_m', 'latitude', 'longitude', 'status'],
    sampleData: [
      { station_or_site_name: 'भोताङ याङ्ग्री हाइड्रो स्टेशन', type: 'नदी जलसतह सेन्सर', ward_no: 3, warning_threshold_m: 3.5, danger_threshold_m: 4.8, latitude: 27.9654, longitude: 85.6421, status: 'सामान्य (Safe)' },
      { station_or_site_name: 'तिपेनी बजार इन्द्रावती गेज', type: 'नदी जलसतह सेन्सर', ward_no: 7, warning_threshold_m: 4.0, danger_threshold_m: 5.5, latitude: 27.9189, longitude: 85.5812, status: 'सामान्य (Safe)' },
      { station_or_site_name: 'लाँगर्चे पहिरो अनुगमन क्षेत्र', type: 'पहिरो जोखिम बिन्दु', ward_no: 8, warning_threshold_m: 0, danger_threshold_m: 0, latitude: 27.9087, longitude: 85.5745, status: 'बायो-इन्जिनियरिङ नियन्त्रण' },
      { station_or_site_name: 'मानेखर्क खेलमैदान हेलिप्याड', type: 'आपतकालीन आश्रयस्थल', ward_no: 3, warning_threshold_m: 0, danger_threshold_m: 0, latitude: 27.9541, longitude: 85.6321, status: 'तयार अवस्था' },
    ],
  },
];

// Public Annual Reports
const PUBLIC_REPORTS = [
  {
    title: 'आ.व. २०८१/०८२ वार्षिक नीति तथा कार्यक्रम र बजेट वक्तव्य',
    category: 'वार्षिक नीति तथा बजेट',
    date: '२०८१ असार १०',
    size: '४.८ MB',
    format: 'PDF',
    description: 'गाउँसभाको १५औं अधिवेशनबाट पारित आर्थिक वर्ष २०८१/०८२ को वार्षिक नीति, विकास प्राथमिकता तथा बजेट विनियोजन विवरण।',
  },
  {
    title: 'आ.व. २०८०/०८१ चौथो त्रैमासिक तथा वार्षिक समग्र प्रगति समीक्षा प्रतिवेदन',
    category: 'प्रगति समीक्षा प्रतिवेदन',
    date: '२०८१ साउन २५',
    size: '३.२ MB',
    format: 'PDF',
    description: 'योजना, पूर्वाधार, शिक्षा, स्वास्थ्य र सामाजिक विकासमा हासिल भएका भौतिक तथा वित्तीय प्रगतिको विस्तृत आधिकारिक समीक्षा।',
  },
  {
    title: 'महालेखा परीक्षकको ६१औं वार्षिक लेखापरीक्षण प्रतिवेदन (गाउँपालिका सारांश)',
    category: 'लेखापरीक्षण तथा सुशासन',
    date: '२०८१ वैशाख १५',
    size: '२.५ MB',
    format: 'PDF',
    description: 'महालेखा परीक्षकको कार्यालयबाट सम्पादित अन्तिम लेखापरीक्षण प्रतिवेदन, बेरुजु लगत र फर्स्यौट कार्ययोजना।',
  },
  {
    title: 'आर्थिक वर्ष २०८०/०८१ को सार्वजनिक सुनुवाइ तथा सामाजिक परीक्षण निर्णय अभिलेख',
    category: 'सामाजिक परीक्षण तथा सुनुवाइ',
    date: '२०८० चैत २८',
    size: '१.८ MB',
    format: 'PDF',
    description: '८ वटै वडाका नागरिक, सरोकारवाला र जनप्रतिनिधिहरूको सहभागितामा सम्पन्न सार्वजनिक सुनुवाइमा उठेका प्रश्न र निर्णयहरू।',
  },
  {
    title: 'पाँचपोखरी थाङपाल गाउँपालिका विपद् पूर्वतयारी तथा प्रतिकार्य योजना (DPRP)',
    category: 'विपद् व्यवस्थापन',
    date: '२०८० जेठ ३०',
    size: '३.४ MB',
    format: 'PDF',
    description: 'बाढी, पहिरो र भूकम्प जोखिम न्यूनीकरणका लागि वडास्तरीय स्रोत नक्सांकन र आपतकालीन उद्धार कार्यविधि।',
  },
];

// Local SDG 2030 Indicators for Panchpokhari
const SDG_GOALS = [
  {
    code: 'SDG 1',
    title: 'गरिबीको अन्त्य (No Poverty)',
    target: 'लक्षित विपन्न घरधुरी सामाजिक सुरक्षा १००% कभरेज',
    progress: 94,
    color: '#e11d48',
    status: 'लक्ष्योन्मुख',
    metric: '२,६४० लाभान्वित ज्येष्ठ नागरिक, दलित तथा एकल महिला',
  },
  {
    code: 'SDG 3',
    title: 'असल स्वास्थ्य र समृद्धि (Good Health)',
    target: 'शतप्रतिशत संस्थागत सुत्केरी र पूर्ण खोप कभरेज',
    progress: 98,
    color: '#16a34a',
    status: 'उत्कृष्ट उपलब्धि',
    metric: '९८.५% बालबालिका पूर्ण खोपयुक्त, ५ बर्थिङ सेन्टर',
  },
  {
    code: 'SDG 4',
    title: 'गुणस्तरीय शिक्षा (Quality Education)',
    target: 'आधारभूत तह उत्तीर्ण दर ९५%+ र निःशुल्क दिवा खाजा',
    progress: 96,
    color: '#c026d3',
    status: 'लक्ष्य हासिल',
    metric: '९६.२% BLE उत्तीर्ण दर, ४,१४७ विद्यार्थी दिवा खाजा',
  },
  {
    code: 'SDG 6',
    title: 'स्वच्छ खानेपानी र सरसफाइ (Clean Water)',
    target: 'एक घर एक धारा ८५%+ कभरेज',
    progress: 89,
    color: '#0284c7',
    status: 'तीव्र विस्तार',
    metric: '८९.४% घरधुरीमा स्वच्छ सुरक्षित पिउने पानी',
  },
  {
    code: 'SDG 7',
    title: 'किफायती र स्वच्छ ऊर्जा (Clean Energy)',
    target: 'शतप्रतिशत घरधुरीमा राष्ट्रिय ग्रिड तथा सौर्य ऊर्जा पहुँच',
    progress: 97,
    color: '#d97706',
    status: 'सम्पन्न प्रायः',
    metric: '९७.२% घरधुरीमा विद्युतीकरण सम्पन्न',
  },
  {
    code: 'SDG 13',
    title: 'जलवायु अनुकूलन तथा विपद् पूर्वसूचना (Climate Action)',
    target: 'नदी जलसतह स्वचालित सेन्सर र पहिरो बायो-इन्जिनियरिङ',
    progress: 92,
    color: '#059669',
    status: 'अग्रणी पालिका',
    metric: '३ नदी सेन्सर २४ सै घण्टा प्रत्यक्ष लाइभ ट्विनमा सक्रिय',
  },
];

export const OpenData: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'datasets' | 'reports' | 'sdg' | 'practices'>('datasets');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDatasetForPreview, setSelectedDatasetForPreview] = useState<DatasetItem | null>(null);

  // Filter datasets
  const filteredDatasets = useMemo(() => {
    return OPEN_DATASETS.filter((ds) => {
      const matchCat = selectedCategory === 'all' || ds.category === selectedCategory;
      const matchSearch =
        !searchQuery.trim() ||
        ds.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ds.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ds.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ds.department.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [selectedCategory, searchQuery]);

  // Download CSV generator
  const downloadCsv = (dataset: DatasetItem) => {
    const headers = dataset.columns.join(',');
    const rows = dataset.sampleData.map((row) =>
      dataset.columns.map((col) => `"${row[col] ?? ''}"`).join(',')
    );
    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${dataset.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download JSON generator
  const downloadJson = (dataset: DatasetItem) => {
    const jsonContent = JSON.stringify(dataset.sampleData, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${dataset.id}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ width: '100%', maxWidth: '100%', margin: '0', padding: '1.5rem 0.5rem', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* ─── PAGE HEADER ─── */}
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.25rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#e0f2fe', color: '#0369a1', padding: '0.35rem 0.85rem', borderRadius: '20px', fontSize: '0.825rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            <Database size={16} />
            <span>नेपाल सरकार स्थानीय तह खुला तथ्याङ्क (Open Government Data · CC-BY-SA 4.0)</span>
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.75rem', margin: 0, letterSpacing: '-0.5px' }}>
            <Database size={36} color="#0284c7" />
            खुला तथ्याङ्क तथा सार्वजनिक प्रतिवेदन पोर्टल
          </h1>
          <p style={{ color: '#64748b', fontSize: '1rem', marginTop: '0.4rem', margin: 0, maxWidth: '850px', lineHeight: 1.5 }}>
            नागरिक, अनुसन्धानकर्ता, सञ्चारकर्मी र विकास साझेदारहरूका लागि पाँचपोखरी थाङपाल गाउँपालिकाको आधिकारिक, मेसिनले पढ्न मिल्ने (Machine-Readable CSV, JSON) खुला तथ्याङ्क र वार्षिक सार्वजनिक प्रतिवेदनहरू।
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div
            style={{
              backgroundColor: '#f0fdf4',
              border: '1px solid #86efac',
              borderRadius: '10px',
              padding: '0.65rem 1.1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#166534',
              fontWeight: 800,
              fontSize: '0.88rem',
            }}
          >
            <ShieldCheck size={18} color="#16a34a" />
            <span>शतप्रतिशत खुला एवं पारदर्शी</span>
          </div>
        </div>
      </div>

      {/* ─── 4-METRIC EXECUTIVE KPI BAR ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <div style={{ backgroundColor: '#ffffff', padding: '1.25rem 1.4rem', borderRadius: '14px', boxShadow: '0 4px 14px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0', borderTop: '4px solid #0284c7' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>कुल खुला डेटासेटहरू</span>
            <Database size={22} color="#0284c7" />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#0f172a', margin: '0.35rem 0 0.1rem' }}>
            १६+ <span style={{ fontSize: '0.92rem', fontWeight: 600, color: '#64748b' }}>डेटासेट</span>
          </div>
          <div style={{ fontSize: '0.78rem', color: '#0284c7', fontWeight: 700 }}>
            ७ विषयगत क्षेत्र (CSV/JSON प्रत्यक्ष)
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', padding: '1.25rem 1.4rem', borderRadius: '14px', boxShadow: '0 4px 14px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0', borderTop: '4px solid #16a34a' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>डिजिटल अनुक्रमणिका रेकर्ड</span>
            <Layers size={22} color="#16a34a" />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#16a34a', margin: '0.35rem 0 0.1rem' }}>
            २२,४००+ <span style={{ fontSize: '0.92rem', fontWeight: 600, color: '#64748b' }}>पङ्क्ति</span>
          </div>
          <div style={{ fontSize: '0.78rem', color: '#15803d', fontWeight: 700 }}>
            जनगणना, कृषि, शिक्षा, सडक लगत
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', padding: '1.25rem 1.4rem', borderRadius: '14px', boxShadow: '0 4px 14px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0', borderTop: '4px solid #7c3aed' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>सार्वजनिक प्रतिवेदनहरू</span>
            <FileText size={22} color="#7c3aed" />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#7c3aed', margin: '0.35rem 0 0.1rem' }}>
            १२+ <span style={{ fontSize: '0.92rem', fontWeight: 600, color: '#64748b' }}>दस्तावेज</span>
          </div>
          <div style={{ fontSize: '0.78rem', color: '#6b21a8', fontWeight: 700 }}>
            नीति, समीक्षा, लेखापरीक्षण (PDF)
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', padding: '1.25rem 1.4rem', borderRadius: '14px', boxShadow: '0 4px 14px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0', borderTop: '4px solid #d97706' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>नागरिक डाउनलोड पहुँच</span>
            <Download size={22} color="#d97706" />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#d97706', margin: '0.35rem 0 0.1rem' }}>
            ५,८४०+ <span style={{ fontSize: '0.92rem', fontWeight: 600, color: '#64748b' }}>पटक</span>
          </div>
          <div style={{ fontSize: '0.78rem', color: '#b45309', fontWeight: 700 }}>
            अनुसन्धान तथा सार्वजनिक उपयोग
          </div>
        </div>
      </div>

      {/* ─── 4-TAB INTEGRATED NAVIGATION ─── */}
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
          onClick={() => setActiveTab('datasets')}
          style={{
            flex: '1 1 200px',
            padding: '0.75rem 1.25rem',
            borderRadius: '9px',
            border: 'none',
            backgroundColor: activeTab === 'datasets' ? '#0284c7' : 'transparent',
            color: activeTab === 'datasets' ? '#ffffff' : '#334155',
            fontWeight: 800,
            fontSize: '0.92rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            boxShadow: activeTab === 'datasets' ? '0 2px 8px rgba(2,132,199,0.3)' : 'none',
            transition: 'all 0.15s ease',
          }}
        >
          <Database size={18} />
          <span>१. खुला डेटासेट सूची (Datasets & APIs)</span>
          <span style={{ fontSize: '0.72rem', backgroundColor: activeTab === 'datasets' ? 'rgba(255,255,255,0.25)' : '#e2e8f0', color: activeTab === 'datasets' ? '#ffffff' : '#475569', padding: '1px 6px', borderRadius: '10px' }}>
            {OPEN_DATASETS.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('reports')}
          style={{
            flex: '1 1 200px',
            padding: '0.75rem 1.25rem',
            borderRadius: '9px',
            border: 'none',
            backgroundColor: activeTab === 'reports' ? '#0284c7' : 'transparent',
            color: activeTab === 'reports' ? '#ffffff' : '#334155',
            fontWeight: 800,
            fontSize: '0.92rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            boxShadow: activeTab === 'reports' ? '0 2px 8px rgba(2,132,199,0.3)' : 'none',
            transition: 'all 0.15s ease',
          }}
        >
          <FileText size={18} />
          <span>२. वार्षिक प्रगति तथा सार्वजनिक प्रतिवेदन</span>
          <span style={{ fontSize: '0.72rem', backgroundColor: activeTab === 'reports' ? 'rgba(255,255,255,0.25)' : '#e2e8f0', color: activeTab === 'reports' ? '#ffffff' : '#475569', padding: '1px 6px', borderRadius: '10px' }}>
            {PUBLIC_REPORTS.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('sdg')}
          style={{
            flex: '1 1 200px',
            padding: '0.75rem 1.25rem',
            borderRadius: '9px',
            border: 'none',
            backgroundColor: activeTab === 'sdg' ? '#0284c7' : 'transparent',
            color: activeTab === 'sdg' ? '#ffffff' : '#334155',
            fontWeight: 800,
            fontSize: '0.92rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            boxShadow: activeTab === 'sdg' ? '0 2px 8px rgba(2,132,199,0.3)' : 'none',
            transition: 'all 0.15s ease',
          }}
        >
          <Target size={18} />
          <span>३. दिगो विकास लक्ष्य (SDG 2030)</span>
          <span style={{ fontSize: '0.72rem', backgroundColor: activeTab === 'sdg' ? 'rgba(255,255,255,0.25)' : '#e2e8f0', color: activeTab === 'sdg' ? '#ffffff' : '#475569', padding: '1px 6px', borderRadius: '10px' }}>
            ६ लक्ष्य
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('practices')}
          style={{
            flex: '1 1 200px',
            padding: '0.75rem 1.25rem',
            borderRadius: '9px',
            border: 'none',
            backgroundColor: activeTab === 'practices' ? '#0284c7' : 'transparent',
            color: activeTab === 'practices' ? '#ffffff' : '#334155',
            fontWeight: 800,
            fontSize: '0.92rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            boxShadow: activeTab === 'practices' ? '0 2px 8px rgba(2,132,199,0.3)' : 'none',
            transition: 'all 0.15s ease',
          }}
        >
          <Award size={18} />
          <span>४. उत्कृष्ट स्थानीय अभ्यासहरू</span>
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          TAB 1: OPEN DATASETS LIST (CSV / JSON / TABLE PREVIEW)
         ═══════════════════════════════════════════════════════════════ */}
      {activeTab === 'datasets' && (
        <div>
          {/* Filters and Search */}
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
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ position: 'relative', minWidth: '260px' }}>
                <Search size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '11px' }} />
                <input
                  type="text"
                  placeholder="डेटासेट, विषय वा शाखा खोज्नुहोस्..."
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

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
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
                <option value="all">सबै विषयगत क्षेत्रहरू</option>
                <option value="demographics">जनसांख्यिकी तथा घरधुरी</option>
                <option value="finance">बजेट तथा वित्त</option>
                <option value="agriculture">कृषि तथा पशुपन्छी</option>
                <option value="education">शिक्षा तथा विद्यालय</option>
                <option value="health">स्वास्थ्य सेवा तथा खोप</option>
                <option value="infrastructure">सडक तथा पूर्वाधार</option>
                <option value="disaster">विपद् तथा वातावरण</option>
              </select>
            </div>

            <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
              उपलब्ध खुला डेटासेट: <strong style={{ color: '#0284c7' }}>{filteredDatasets.length} वटा</strong>
            </div>
          </div>

          {/* Dataset Cards Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {filteredDatasets.map((ds) => {
              const IconComp = ds.categoryIcon;
              return (
                <div
                  key={ds.id}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    padding: '1.5rem',
                    boxShadow: '0 3px 10px rgba(0,0,0,0.02)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1.25rem',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ flex: '1 1 500px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
                      <span style={{ fontSize: '0.74rem', fontWeight: 800, backgroundColor: '#f0f9ff', color: '#0369a1', padding: '0.2rem 0.65rem', borderRadius: '20px', border: '1px solid #bae6fd', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <IconComp size={13} />
                        <span>{ds.categoryLabel}</span>
                      </span>
                      <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>
                        आ.व. {ds.fiscalYear}
                      </span>
                      <span style={{ fontSize: '0.74rem', backgroundColor: '#f1f5f9', color: '#475569', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                        {ds.recordsCount}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.35rem' }}>
                      {ds.title}
                    </h3>
                    <div style={{ fontSize: '0.82rem', color: '#64748b', fontStyle: 'italic', marginBottom: '0.5rem' }}>
                      {ds.titleEn}
                    </div>

                    <p style={{ fontSize: '0.85rem', color: '#334155', margin: '0 0 0.65rem', lineHeight: 1.5 }}>
                      {ds.description}
                    </p>

                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.78rem', color: '#64748b', flexWrap: 'wrap' }}>
                      <span><strong>शाखा:</strong> {ds.department}</span>
                      <span>•</span>
                      <span><strong>लाइसेन्स:</strong> {ds.license}</span>
                      <span>•</span>
                      <span><strong>अद्यावधिक:</strong> {ds.updatedDate}</span>
                    </div>
                  </div>

                  {/* Actions (Preview, CSV, JSON) */}
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => setSelectedDatasetForPreview(ds)}
                      style={{
                        padding: '0.55rem 0.95rem',
                        borderRadius: '8px',
                        backgroundColor: '#f8fafc',
                        border: '1px solid #cbd5e1',
                        color: '#334155',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                      }}
                    >
                      <Eye size={15} color="#0284c7" />
                      <span>डेटा पूर्वावलोकन</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => downloadCsv(ds)}
                      style={{
                        padding: '0.55rem 0.95rem',
                        borderRadius: '8px',
                        backgroundColor: '#0284c7',
                        border: 'none',
                        color: 'white',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        boxShadow: '0 2px 6px rgba(2, 132, 199, 0.3)',
                      }}
                      title="CSV ढाँचामा डाउनलोड गर्नुहोस्"
                    >
                      <FileSpreadsheet size={15} />
                      <span>CSV ({ds.fileSizeCsv})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => downloadJson(ds)}
                      style={{
                        padding: '0.55rem 0.95rem',
                        borderRadius: '8px',
                        backgroundColor: '#0f172a',
                        border: 'none',
                        color: 'white',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                      }}
                      title="JSON ढाँचामा डाउनलोड गर्नुहोस्"
                    >
                      <FileJson size={15} />
                      <span>JSON ({ds.fileSizeJson})</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          TAB 2: ANNUAL REPORTS & SOCIAL AUDIT
         ═══════════════════════════════════════════════════════════════ */}
      {activeTab === 'reports' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              padding: '1.5rem',
              boxShadow: '0 4px 14px rgba(0,0,0,0.02)',
              marginBottom: '0.5rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.85rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FileText size={22} color="#7c3aed" />
                  <span>आधिकारिक सार्वजनिक प्रतिवेदन तथा लेखापरीक्षण संग्रह</span>
                </h3>
                <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.85rem' }}>
                  वार्षिक बजेट वक्तव्य, चौमासिक समीक्षा, सामाजिक परीक्षण र महालेखा परीक्षक प्रतिवेदन
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {PUBLIC_REPORTS.map((rep, i) => (
                <div
                  key={i}
                  style={{
                    backgroundColor: '#f8fafc',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    padding: '1.25rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem',
                  }}
                >
                  <div style={{ flex: '1 1 450px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, backgroundColor: '#ede9fe', color: '#6d28d9', padding: '1px 8px', borderRadius: '4px' }}>
                        {rep.category}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>प्रकाशित मिति: {rep.date}</span>
                    </div>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.35rem' }}>
                      {rep.title}
                    </h4>
                    <p style={{ fontSize: '0.82rem', color: '#475569', margin: 0, lineHeight: 1.4 }}>
                      {rep.description}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      alert(`📄 '${rep.title}' डाउनलोड हुँदैछ...\n\nढाँचा: ${rep.format} (${rep.size})\nप्रकाशक: पाँचपोखरी थाङपाल गाउँकार्यपालिकाको कार्यालय`);
                    }}
                    style={{
                      padding: '0.55rem 1.1rem',
                      borderRadius: '8px',
                      backgroundColor: '#7c3aed',
                      border: 'none',
                      color: 'white',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      boxShadow: '0 2px 6px rgba(124, 58, 237, 0.3)',
                    }}
                  >
                    <Download size={15} />
                    <span>डाउनलोड ({rep.size})</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          TAB 3: LOCAL SUSTAINABLE DEVELOPMENT GOALS (SDG 2030)
         ═══════════════════════════════════════════════════════════════ */}
      {activeTab === 'sdg' && (
        <div>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.5rem', boxShadow: '0 4px 14px rgba(0,0,0,0.02)', marginBottom: '1.5rem' }}>
            <div style={{ marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.85rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Target size={22} color="#059669" />
                <span>पाँचपोखरी थाङपाल स्थानीय दिगो विकास लक्ष्य (SDG 2030 Local Indicators)</span>
              </h3>
              <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.85rem' }}>
                संयुक्त राष्ट्रसंघीय दिगो विकास लक्ष्यहरूको स्थानीयकरण तथा गाउँपालिकाको पञ्चवर्षीय आवधिक योजना (२०७९-२०८४) लक्ष्य सूचक
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
              {SDG_GOALS.map((g, i) => (
                <div
                  key={i}
                  style={{
                    backgroundColor: '#f8fafc',
                    borderRadius: '14px',
                    border: '1px solid #e2e8f0',
                    borderLeft: `5px solid ${g.color}`,
                    padding: '1.25rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 900, color: g.color }}>{g.code}</span>
                    <span style={{ fontSize: '0.72rem', backgroundColor: '#dcfce7', color: '#166534', padding: '1px 7px', borderRadius: '10px', fontWeight: 700 }}>
                      {g.status}
                    </span>
                  </div>

                  <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.35rem' }}>
                    {g.title}
                  </h4>
                  <div style={{ fontSize: '0.8rem', color: '#475569', marginBottom: '0.75rem', lineHeight: 1.4 }}>
                    {g.target}
                  </div>

                  {/* Progress Bar */}
                  <div style={{ marginBottom: '0.6rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', marginBottom: '0.25rem' }}>
                      <span style={{ color: '#64748b' }}>प्रगति दर:</span>
                      <strong style={{ color: g.color }}>{g.progress}%</strong>
                    </div>
                    <div style={{ width: '100%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${g.progress}%`,
                          height: '100%',
                          backgroundColor: g.color,
                          borderRadius: '4px',
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ fontSize: '0.75rem', color: '#0f172a', fontWeight: 600 }}>
                    📌 {g.metric}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          TAB 4: BEST LOCAL PRACTICES & DIGITAL TWIN MILESTONES
         ═══════════════════════════════════════════════════════════════ */}
      {activeTab === 'practices' && (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.5rem', boxShadow: '0 4px 14px rgba(0,0,0,0.02)' }}>
          <div style={{ marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.85rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Award size={22} color="#0284c7" />
              <span>उत्कृष्ट स्थानीय अभ्यास तथा डिजिटल ट्विन रूपान्तरण (Best Practices)</span>
            </h3>
            <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.85rem' }}>
              प्रविधि, सुशासन र नागरिक सेवा प्रवाहमा पाँचपोखरी थाङपाल गाउँपालिकाले हासिल गरेका प्रमुख उपलब्धिका केस-स्टडीहरू
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            <div style={{ backgroundColor: '#f0f9ff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #bae6fd' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0369a1', marginBottom: '0.35rem' }}>केस स्टडी १ · विपद् पूर्वसूचना</div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem' }}>
                नेपालमै पहिलो पटक स्थानीय तहमा ३D डिजिटल ट्विन र स्वचालित नदी सेन्सर
              </h4>
              <p style={{ fontSize: '0.82rem', color: '#334155', lineHeight: 1.5, margin: 0 }}>
                मेलम्ची, इन्द्रावती र याङ्ग्री खोलामा राखिएका स्वचालित जलसतह सेन्सरहरू सिधै डिजिटल ट्विन नक्सामा जोडी खतरा स्तर नाघ्नासाथ तटीय क्षेत्रका नागरिक र सुरक्षा निकायमा स्वचालित साइरन र SMS सूचना जाने प्रणाली स्थापित।
              </p>
            </div>

            <div style={{ backgroundColor: '#f0fdf4', padding: '1.25rem', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#166534', marginBottom: '0.35rem' }}>केस स्टडी २ · नागरिक सेवा प्रवाह</div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem' }}>
                ई-सिफारिसमा डिजिटल हस्ताक्षर तथा स्वचालित SMS गेटवे सेवा
              </h4>
              <p style={{ fontSize: '0.82rem', color: '#334155', lineHeight: 1.5, margin: 0 }}>
                नागरिकले घरमै बसी अनलाइनबाट सिफारिस दरखास्त दिने, वडा सचिव र अध्यक्षले क्रिप्टोग्राफिक डिजिटल हस्ताक्षर गर्ने, र सिफारिस स्वीकृत हुनासाथ तत्काल नागरिकको मोबाइलमा सुरक्षित डाउनलोड लिङ्क सहितको SMS पुग्ने प्रविधि।
              </p>
            </div>

            <div style={{ backgroundColor: '#faf5ff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e9d5ff' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#7e22ce', marginBottom: '0.35rem' }}>केस स्टडी ३ · विकास आयोजना सुशासन</div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem' }}>
                नापी किताब (MB) र सामाजिक परीक्षण अनिवार्य गरी १००% फरफारक
              </h4>
              <p style={{ fontSize: '0.82rem', color: '#334155', lineHeight: 1.5, margin: 0 }}>
                प्रत्येक उपभोक्ता समितिको निर्माण कार्यमा प्राविधिक इन्जिनियरको नापी किताब रुजु र बस्तीस्तरको सार्वजनिक सामाजिक परीक्षण सम्पन्न भएपछि मात्रै अन्तिम किस्ता भुक्तानी दिने कडा पारदर्शी व्यवस्था।
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          DATASET PREVIEW MODAL
         ═══════════════════════════════════════════════════════════════ */}
      {selectedDatasetForPreview && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: '1rem',
          }}
          onClick={() => setSelectedDatasetForPreview(null)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              maxWidth: '960px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid #bae6fd',
              padding: '1.75rem',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <span style={{ fontSize: '0.74rem', fontWeight: 800, backgroundColor: '#e0f2fe', color: '#0369a1', padding: '1px 8px', borderRadius: '4px' }}>
                    {selectedDatasetForPreview.categoryLabel}
                  </span>
                  <span style={{ fontSize: '0.76rem', color: '#64748b' }}>आ.व. {selectedDatasetForPreview.fiscalYear}</span>
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  {selectedDatasetForPreview.title}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setSelectedDatasetForPreview(null)}
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

            {/* Metadata Badges */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', backgroundColor: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#475569', marginBottom: '1.25rem' }}>
              <div><strong>जिम्मेवार शाखा:</strong> {selectedDatasetForPreview.department}</div>
              <div>•</div>
              <div><strong>लाइसेन्स:</strong> {selectedDatasetForPreview.license}</div>
              <div>•</div>
              <div><strong>अभिलेख:</strong> {selectedDatasetForPreview.recordsCount}</div>
            </div>

            {/* Table Preview */}
            <div style={{ marginBottom: '1.5rem', border: '1px solid #cbd5e1', borderRadius: '10px', overflowX: 'auto' }}>
              <div style={{ backgroundColor: '#f1f5f9', padding: '0.5rem 0.85rem', fontWeight: 700, fontSize: '0.82rem', color: '#0f172a', borderBottom: '1px solid #cbd5e1', display: 'flex', justifyContent: 'space-between' }}>
                <span>डेटासेट स्तम्भहरू तथा पहिलो नमुना रेकर्डहरू:</span>
                <span style={{ color: '#0284c7' }}>{selectedDatasetForPreview.columns.length} स्तम्भ (Columns)</span>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #cbd5e1' }}>
                    {selectedDatasetForPreview.columns.map((col, idx) => (
                      <th key={idx} style={{ padding: '7px 10px', borderRight: '1px solid #e2e8f0', textAlign: 'left', fontWeight: 700, color: '#334155' }}>
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {selectedDatasetForPreview.sampleData.map((row, rIdx) => (
                    <tr key={rIdx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      {selectedDatasetForPreview.columns.map((col, cIdx) => (
                        <td key={cIdx} style={{ padding: '6px 10px', borderRight: '1px solid #f1f5f9', color: '#1e293b' }}>
                          {String(row[col] ?? '-')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Modal Bottom Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                मेसिन-पढ्न-मिल्ने खुला ढाँचामा तत्काल स्थानीय डिभाइसमा डाउनलोड गर्नुहोस्:
              </span>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => downloadCsv(selectedDatasetForPreview)}
                  style={{
                    padding: '0.55rem 1.1rem',
                    borderRadius: '8px',
                    backgroundColor: '#0284c7',
                    border: 'none',
                    color: 'white',
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    boxShadow: '0 2px 6px rgba(2, 132, 199, 0.3)',
                  }}
                >
                  <FileSpreadsheet size={15} />
                  <span>CSV फाइल डाउनलोड ({selectedDatasetForPreview.fileSizeCsv})</span>
                </button>

                <button
                  type="button"
                  onClick={() => downloadJson(selectedDatasetForPreview)}
                  style={{
                    padding: '0.55rem 1.1rem',
                    borderRadius: '8px',
                    backgroundColor: '#0f172a',
                    border: 'none',
                    color: 'white',
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  <FileJson size={15} />
                  <span>JSON डाउनलोड ({selectedDatasetForPreview.fileSizeJson})</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OpenData;
