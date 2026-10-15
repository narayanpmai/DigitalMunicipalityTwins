import {
  MunicipalProject,
  MunicipalOfficial,
  BloodDonor,
  HealthPost,
  AgriMarketItem,
  FertilizerDistribution,
  TourismSpot,
  TrekkingTrail,
  RegisteredHomestay,
} from '../types';

// ─── 1. PUBLIC PROJECTS TRACKER ───

export const MOCK_PROJECTS: MunicipalProject[] = [
  {
    id: 'prj-01',
    title: 'मेलम्ची-तिपेनी-भोताङ सडक स्तरोन्नति तथा पक्की नाला निर्माण',
    wardNo: 3,
    budgetAllocatedRs: 4500000,
    budgetSpentRs: 3600000,
    progressPercent: 80,
    contractorOrSamiti: 'भोताङ सडक उपभोक्ता समिति',
    status: 'सञ्चालनमा',
    targetCompletionDate: '२०८१/०८/३०',
    category: 'सडक तथा पूर्वाधार',
  },
  {
    id: 'prj-02',
    title: 'बरुवा-सेर्माथाङ एक घर एक धारा स्वच्छ खानेपानी आयोजना',
    wardNo: 2,
    budgetAllocatedRs: 3200000,
    budgetSpentRs: 3200000,
    progressPercent: 100,
    contractorOrSamiti: 'सेर्माथाङ खानेपानी उपभोक्ता समिति',
    status: 'सम्पन्न भएको',
    targetCompletionDate: '२०८१/०५/१५',
    category: 'खानेपानी तथा सरसफाइ',
  },
  {
    id: 'prj-03',
    title: 'थाङपालधाप बहुउद्देश्यीय खेलकुद मैदान तथा कभर्डहल',
    wardNo: 6,
    budgetAllocatedRs: 5000000,
    budgetSpentRs: 2500000,
    progressPercent: 50,
    contractorOrSamiti: 'युवा तथा खेलकुद विकास समिति',
    status: 'सञ्चालनमा',
    targetCompletionDate: '२०८१/१०/१५',
    category: 'शिक्षा तथा खेलकुद',
  },
  {
    id: 'prj-04',
    title: 'मानेखर्क आधारभूत स्वास्थ्य सेवा केन्द्र भवन निर्माण',
    wardNo: 4,
    budgetAllocatedRs: 2800000,
    budgetSpentRs: 900000,
    progressPercent: 32,
    contractorOrSamiti: 'मानेखर्क निर्माण सेवा प्रा.लि.',
    status: 'सञ्चालनमा',
    targetCompletionDate: '२०८१/११/३०',
    category: 'स्वास्थ्य',
  },
];

// ─── 2. LEADERSHIP & STAFF DIRECTORY ───

export const MOCK_OFFICIALS: MunicipalOfficial[] = [
  {
    id: 'off-01',
    name: 'टासी लामा ह्योल्मो',
    role: 'गाउँपालिका अध्यक्ष',
    department: 'कार्यपालिका कार्यालय',
    phone: '९८५११००००१',
    roomNo: '१०१ (अध्यक्ष कार्यकक्ष)',
    isElected: true,
  },
  {
    id: 'off-02',
    name: 'सुनिता अधिकारी तामाङ',
    role: 'गाउँपालिका उपाध्यक्ष',
    department: 'न्यायिक समिति तथा अनुगमन',
    phone: '९८५११००००२',
    roomNo: '१०२ (उपाध्यक्ष कार्यकक्ष)',
    isElected: true,
  },
  {
    id: 'off-03',
    name: 'दिनेश पोखरेल',
    role: 'प्रमुख प्रशासकीय अधिकृत (CAO)',
    department: 'प्रशासन तथा व्यवस्थापन',
    phone: '९८५११००००३',
    roomNo: '१०३',
    isElected: false,
  },
  {
    id: 'off-04',
    name: 'दोर्जे तामाङ',
    role: 'वडा अध्यक्ष',
    department: '३ नं. वडा कार्यालय (भोताङ)',
    wardNo: 3,
    phone: '९८४१५५४४३३',
    roomNo: 'वडा कार्यालय भोताङ',
    isElected: true,
  },
  {
    id: 'off-05',
    name: 'ई. मिलन श्रेष्ठ',
    role: 'इन्जिनियर / पूर्वाधार प्रमुख',
    department: 'प्राविधिक शाखा',
    phone: '९८४१२२३३४४',
    roomNo: '२०४',
    isElected: false,
  },
  {
    id: 'off-06',
    name: 'संगीता गिरी',
    role: 'वडा सचिव',
    department: '३ नं. वडा कार्यालय (भोताङ)',
    wardNo: 3,
    phone: '९८६०११२२३३',
    roomNo: 'वडा कार्यालय भोताङ',
    isElected: false,
  },
];

// ─── 3. BLOOD NETWORK & HEALTH ───

export const MOCK_BLOOD_DONORS: BloodDonor[] = [
  { id: 'bd-1', name: 'निमा शेर्पा', bloodGroup: 'O+', wardNo: 2, tole: 'सेर्माथाङ', phone: '९८४१००११२२', lastDonatedDate: '२०८१/०२/१५', isAvailable: true },
  { id: 'bd-2', name: 'सुरेश श्रेष्ठ', bloodGroup: 'A+', wardNo: 6, tole: 'थाङपालधाप', phone: '९८५१२२३३४४', lastDonatedDate: '२०८१/०३/१०', isAvailable: true },
  { id: 'bd-3', name: 'पासाङ तामाङ', bloodGroup: 'B+', wardNo: 3, tole: 'भोताङ', phone: '९८६०३३४४५५', lastDonatedDate: '२०८०/१२/२०', isAvailable: true },
  { id: 'bd-4', name: 'मनिषा गिरी', bloodGroup: 'AB+', wardNo: 1, tole: 'बाँसखर्क', phone: '९८४१७७८८९९', lastDonatedDate: '२०८१/०४/०५', isAvailable: true },
  { id: 'bd-5', name: 'छिरिङ ह्योल्मो', bloodGroup: 'O-', wardNo: 2, tole: 'बरुवा', phone: '९८६०११७७८८', lastDonatedDate: '२०८१/०१/१२', isAvailable: true },
  { id: 'bd-6', name: 'दीपक तामाङ', bloodGroup: 'A-', wardNo: 4, tole: 'थाङपालकोट', phone: '९८४१९९२२११', lastDonatedDate: '२०८०/११/२५', isAvailable: false },
];

export const MOCK_HEALTH_POSTS: HealthPost[] = [
  {
    id: 'hp-1',
    name: 'थाङपालधाप प्राथमिक स्वास्थ्य केन्द्र',
    wardNo: 6,
    location: 'धाप बजार',
    incharge: 'डा. प्रशान्त अधिकारी',
    phone: '०११-६९२००१',
    ambulancePhone: '९८५१२३४००१',
    opdHours: 'बिहान १०:०० देखि साँझ ४:०० (आइत-शुक्र)',
    services: ['२४ घण्टा इमर्जेन्सी', 'प्रसूति सेवा', 'ल्याब/रगत परीक्षण', 'औषधि वितरण', 'एक्स-रे'],
  },
  {
    id: 'hp-2',
    name: 'भोताङ आधारभूत स्वास्थ्य चौकी',
    wardNo: 3,
    location: 'भोताङ केन्द्र',
    incharge: 'अहेव राम चन्द्र सापकोटा',
    phone: '०११-६९२००३',
    ambulancePhone: '९८४१२२२३३३',
    opdHours: 'बिहान १०:०० देखि दिउँसो ३:००',
    services: ['सामान्य ओपीडी', 'बाल खोप', 'घाउ ड्रेसिङ', 'सुरक्षित सुत्केरी परामर्श'],
  },
  {
    id: 'hp-3',
    name: 'सेर्माथाङ स्वास्थ्य चौकी',
    wardNo: 2,
    location: 'सेर्माथाङ',
    incharge: 'सिनियर अनमी डोल्मा शेर्पा',
    phone: '०११-६९२००२',
    ambulancePhone: '९८५१०००११२',
    opdHours: 'बिहान १०:०० देखि दिउँसो ३:००',
    services: ['ओपीडी', 'अक्सिजन सिलिन्डर सपोर्ट (हाइ अल्टिच्युड)', 'निशुल्क औषधि'],
  },
];

// ─── 4. AGRI-MARKET & FERTILIZER ───

export const MOCK_AGRI_MARKET: AgriMarketItem[] = [
  { id: 'ag-1', name: 'किवी फल (ग्रेड ए अर्गानिक)', category: 'फलफूल', unit: 'केजी', todayPriceRs: 350, yesterdayPriceRs: 360, priceTrend: 'down', marketCenter: 'तिपेनी हाटबजार' },
  { id: 'ag-2', name: 'अलैंची (ठूलो दाना डम्बरशाही)', category: 'नगदेबाली', unit: 'केजी', todayPriceRs: 1450, yesterdayPriceRs: 1400, priceTrend: 'up', marketCenter: 'धाप संकलन केन्द्र' },
  { id: 'ag-3', name: 'स्थानीय रातो आलु (भोताङ)', category: 'तरकारी', unit: 'केजी', todayPriceRs: 65, yesterdayPriceRs: 65, priceTrend: 'stable', marketCenter: 'याङरी बजार' },
  { id: 'ag-4', name: 'ताजा गाई/भैंसीको दुध', category: 'दुग्ध/पशु', unit: 'लिटर', todayPriceRs: 90, yesterdayPriceRs: 90, priceTrend: 'stable', marketCenter: 'डेरी संकलन केन्द्र' },
  { id: 'ag-5', name: 'हिमाली रेन्बो ट्राउट माछा', category: 'दुग्ध/पशु', unit: 'केजी', todayPriceRs: 1200, yesterdayPriceRs: 1200, priceTrend: 'stable', marketCenter: 'चिम्ती ट्राउट फार्म' },
  { id: 'ag-6', name: 'जङ्गली मह (अर्गानिक भीरमह)', category: 'नगदेबाली', unit: 'केजी', todayPriceRs: 1500, yesterdayPriceRs: 1450, priceTrend: 'up', marketCenter: 'बाँसखर्क' },
  { id: 'ag-7', name: 'बन्दा गोभी (अर्गानिक)', category: 'तरकारी', unit: 'केजी', todayPriceRs: 45, yesterdayPriceRs: 50, priceTrend: 'down', marketCenter: 'तिपेनी हाटबजार' },
];

export const MOCK_FERTILIZER: FertilizerDistribution[] = [
  { id: 'ft-1', centerName: 'पाँचपोखरी साना किसान कृषि सहकारी', wardNo: 6, fertilizerType: 'युरिया', stockBags: 180, pricePerBagRs: 1050, status: 'मौज्दात उपलब्ध' },
  { id: 'ft-2', centerName: 'पाँचपोखरी साना किसान कृषि सहकारी', wardNo: 6, fertilizerType: 'डीएपी', stockBags: 120, pricePerBagRs: 2450, status: 'मौज्दात उपलब्ध' },
  { id: 'ft-3', centerName: 'भोताङ कृषि बहुउद्देश्यीय सहकारी', wardNo: 3, fertilizerType: 'जैविक मल (अर्गानिक कम्पोस्ट)', stockBags: 340, pricePerBagRs: 650, status: 'मौज्दात उपलब्ध' },
  { id: 'ft-4', centerName: 'बरुवा सेवा केन्द्र', wardNo: 2, fertilizerType: 'पोटास', stockBags: 25, pricePerBagRs: 1800, status: 'न्यून मौज्दात' },
];

// ─── 5. TOURISM, TRAILS & HOMESTAYS ───

export const MOCK_TOURISM_SPOTS: TourismSpot[] = [
  {
    id: 'ts-1',
    title: 'पवित्र पाँचपोखरी कुण्ड (Panchpokhari Lakes)',
    wardNo: 3,
    category: 'प्राकृतिक/कुण्ड',
    altitudeMeters: 4100,
    description: 'विश्वकै नवौं उच्च स्थानमा रहेको हिन्दु र बौद्ध धर्मावलम्बीको पवित्र ५ वटा हिमतालहरूको समूह। जनैपूर्णिमामा ठूलो धार्मिक मेला लाग्दछ।',
    highlights: ['५ वटा पवित्र हिमताल', 'भगवान शिवको मन्दिर', 'जुगल हिमालको नजिकैको दृश्य'],
    bestSeason: 'भदौ - कात्तिक, चैत - जेठ',
  },
  {
    id: 'ts-2',
    title: 'ऐतिहासिक मेलम्चीघ्याङ गुम्बा (Melamchighyang Monastery)',
    wardNo: 1,
    category: 'गुम्बा',
    altitudeMeters: 2560,
    description: 'गुरु पद्मसम्भव (गुरु रिन्पोछे) ले ध्यान गरेको पवित्र गुफा र प्राचीन ह्योल्मो बौद्ध संस्कृति झल्किने भव्य गुम्बा।',
    highlights: ['गुरु रिन्पोछे गुफा', 'ह्योल्मो सांस्कृतिक संग्रहालय', 'प्राकृतिक झरना'],
    bestSeason: 'वर्षैभरी अनुकूल',
  },
  {
    id: 'ts-3',
    title: 'आमा याङ्ग्री पिक (Ama Yangri Peak)',
    wardNo: 2,
    category: 'दृश्यवलोकन',
    altitudeMeters: 3771,
    description: 'ह्योल्मो उपत्यकाकी संरक्षिका देवी मानिने आमा याङ्ग्रीको चुचुरो। यहाँबाट लाङटाङ, जुगल, गणेश र गौरीशंकर हिमाल ३६० डिग्री देखिन्छ।',
    highlights: ['३६० डिग्री हिमशृङ्खला दृश्य', 'ह्योल्मो देवीको थान', 'लालीगुराँस जंगल'],
    bestSeason: 'असोज - मंसिर, फागुन - वैशाख',
  },
];

export const MOCK_TREKKING_TRAILS: TrekkingTrail[] = [
  {
    id: 'tr-1',
    trailName: 'पाँचपोखरी सांस्कृतिक तथा धार्मिक पदमार्ग (Panchpokhari Heritage Trail)',
    totalDistanceKm: 42,
    durationDays: 5,
    maxAltitudeMeters: 4100,
    difficulty: 'मध्यम',
    routePoints: ['काठमाडौँ/मेलम्ची', 'तिपेनी', 'भोताङ', 'चिम्ती', 'टुपीडाँडा', 'नोसम्पती', 'पाँचपोखरी'],
    teaHousesAvailable: true,
  },
  {
    id: 'tr-2',
    trailName: 'ह्योल्मो हेरिटेज तथा आमा याङ्ग्री ट्रेल (Hyolmo Circuit Trail)',
    totalDistanceKm: 28,
    durationDays: 3,
    maxAltitudeMeters: 3771,
    difficulty: 'सजिलो',
    routePoints: ['मेलम्चीघ्याङ', 'तार्केघ्याङ', 'सेर्माथाङ', 'आमा याङ्ग्री पिक'],
    teaHousesAvailable: true,
  },
];

export const MOCK_HOMESTAYS: RegisteredHomestay[] = [
  {
    id: 'hs-1',
    name: 'सेर्माथाङ ह्योल्मो सामुदायिक होमस्टे',
    wardNo: 2,
    village: 'सेर्माथाङ डाँडा',
    ownerName: 'दावा फुल्मु ह्योल्मो',
    phone: '९८५११२३९८७',
    totalRooms: 8,
    totalBeds: 16,
    specialFood: 'स्थानीय स्याउ, फापरको ढिँडो, सिस्नो, अर्गानिक घिउ, छुर्पी',
    pricePerNightRs: 1200,
  },
  {
    id: 'hs-2',
    name: 'भोताङ अर्गानिक भिलेज होमस्टे',
    wardNo: 3,
    village: 'चिम्ती / भोताङ',
    ownerName: 'पासाङ दोर्जे तामाङ',
    phone: '९८४१६६७७८८',
    totalRooms: 6,
    totalBeds: 12,
    specialFood: 'ताजा रेन्बो ट्राउट माछा, स्थानीय कोदोको परिकार, तामाङ खाजा',
    pricePerNightRs: 1000,
  },
  {
    id: 'hs-3',
    name: 'थाङपालकोट प्रकृति होमस्टे',
    wardNo: 4,
    village: 'मानेखर्क',
    ownerName: 'माया तामाङ',
    phone: '९८६०५५४४३३',
    totalRooms: 5,
    totalBeds: 10,
    specialFood: 'गुन्द्रुक-भटमास, स्थानीय कुखुराको झोल, सेलरोटी',
    pricePerNightRs: 900,
  },
];
