// ============================================================================
// DigiPalika - Critical Civic Features Mock Data (नेपालका स्थानीय तह)
// ============================================================================

// 1. Disaster Early Warning & River Water Levels (बाढी-पहिरो पूर्वसूचना)
export interface RiverGauge {
  id: string;
  riverName: string;
  stationName: string;
  wardNo: number;
  currentLevelM: number;
  warningLevelM: number;
  dangerLevelM: number;
  status: 'safe' | 'warning' | 'danger';
  trend: 'rising' | 'steady' | 'falling';
  updatedAt: string;
}

export interface EvacuationShelter {
  id: string;
  name: string;
  wardNo: number;
  location: string;
  capacityPersons: number;
  focalPerson: string;
  contactNo: string;
  facilities: string[];
}

export const MOCK_RIVER_GAUGES: RiverGauge[] = [
  {
    id: 'rg-1',
    riverName: 'मेलम्ची खोला',
    stationName: 'मेलम्ची बजार जलमापन केन्द्र',
    wardNo: 3,
    currentLevelM: 4.8,
    warningLevelM: 4.2,
    dangerLevelM: 5.5,
    status: 'warning',
    trend: 'rising',
    updatedAt: '५ मिनेट अगाडि',
  },
  {
    id: 'rg-2',
    riverName: 'इन्द्रावती नदी',
    stationName: 'सिपाघाट बाढी अनुगमन स्टेशन',
    wardNo: 1,
    currentLevelM: 6.2,
    warningLevelM: 5.0,
    dangerLevelM: 6.0,
    status: 'danger',
    trend: 'rising',
    updatedAt: '२ मिनेट अगाडि',
  },
  {
    id: 'rg-3',
    riverName: 'लार्के / पाँचपोखरी खोला',
    stationName: 'भोताङ हाइड्रोपवर बाँध स्टेशन',
    wardNo: 4,
    currentLevelM: 2.1,
    warningLevelM: 3.5,
    dangerLevelM: 4.5,
    status: 'safe',
    trend: 'steady',
    updatedAt: '१० मिनेट अगाडि',
  },
];

export const MOCK_SHELTERS: EvacuationShelter[] = [
  {
    id: 'sh-1',
    name: 'श्री थाङपाल भ्याली माध्यमिक विद्यालय',
    wardNo: 3,
    location: 'गुन्सा बजार',
    capacityPersons: 350,
    focalPerson: 'रामबहादुर तामाङ (प्र.अ.)',
    contactNo: '9841234567',
    facilities: ['खानेपानी', 'प्राथमिक स्वास्थ्य कक्ष', 'सौर्य बत्ती', 'हेलीप्याड'],
  },
  {
    id: 'sh-2',
    name: 'वडा नं. ४ सामुदायिक भवन तथा खेलमैदान',
    wardNo: 4,
    location: 'मानेखर्क',
    capacityPersons: 200,
    focalPerson: 'डोल्मा शेर्पा (वडा सदस्य)',
    contactNo: '9851122334',
    facilities: ['अस्थायी शौचालय', 'खानेपानी ट्याङ्की', 'वाईफाई', 'कम्बल भण्डार'],
  },
  {
    id: 'sh-3',
    name: 'नेपाल रेडक्रस सोसाइटी उपशाखा भवन',
    wardNo: 2,
    location: 'बरुवा बजार',
    capacityPersons: 150,
    focalPerson: 'गोविन्द श्रेष्ठ (संयोजक)',
    contactNo: '9849988776',
    facilities: ['एम्बुलेन्स सेवा', 'अक्सिजन सिलिन्डर', 'खाद्य भण्डार'],
  },
];

// 2. Social Security Allowance e-KYC (सामाजिक सुरक्षा भत्ता नवीकरण)
export interface BeneficiaryRecord {
  citizenshipNo: string;
  ssnCardNo: string;
  fullName: string;
  wardNo: number;
  category: 'ज्येष्ठ नागरिक' | 'एकल महिला' | 'अपाङ्गता (पूर्ण)' | 'अपाङ्गता (अति अशक्त)' | 'बाल पोषण भत्ता';
  dobBs: string;
  bankName: string;
  accountNo: string;
  lastRenewedDateBs: string;
  status: 'नवीकरण आवश्यक' | 'सफल' | 'प्रमाणिकरण विचाराधीन';
}

export const MOCK_BENEFICIARIES: BeneficiaryRecord[] = [
  {
    citizenshipNo: '२२-०१-७२-०३४२१',
    ssnCardNo: 'SSN-PPK-03-8821',
    fullName: 'वीरबहादुर तामाङ',
    wardNo: 3,
    category: 'ज्येष्ठ नागरिक',
    dobBs: '२००६/०४/१५ (७५ वर्ष)',
    bankName: 'नेपाल बैंक लि. (पाँचपोखरी शाखा)',
    accountNo: '०२४००१०२९३८२९१',
    lastRenewedDateBs: '२०८०/०४/२०',
    status: 'नवीकरण आवश्यक',
  },
  {
    citizenshipNo: '२२-०१-७०-०१८४९',
    ssnCardNo: 'SSN-PPK-04-1029',
    fullName: 'कान्छीमाया विक',
    wardNo: 4,
    category: 'एकल महिला',
    dobBs: '२०१८/०९/२२ (६३ वर्ष)',
    bankName: 'कृषि विकास बैंक लि.',
    accountNo: '०३८००२९३८४७१६२',
    lastRenewedDateBs: '२०८१/०४/०५',
    status: 'सफल',
  },
  {
    citizenshipNo: '२२-०२-७४-००५१२',
    ssnCardNo: 'SSN-PPK-02-4412',
    fullName: 'ल्हाक्पा शेर्पा',
    wardNo: 2,
    category: 'अपाङ्गता (पूर्ण)',
    dobBs: '२०४५/११/०८ (३६ वर्ष)',
    bankName: 'नेपाल बैंक लि.',
    accountNo: '०२४००९३८२७१६२३',
    lastRenewedDateBs: '२०८०/०४/२८',
    status: 'नवीकरण आवश्यक',
  },
];

// 3. Live Garbage Truck Tracker (फोहोरमैला संकलन गाडी प्रत्यक्ष जीपीएस)
export interface GarbageTruck {
  id: string;
  vehicleNumber: string;
  driverName: string;
  driverPhone: string;
  routeTitle: string;
  currentLocationName: string;
  lat: number;
  lng: number;
  heading: string;
  speedKmH: number;
  wasteType: 'कुहिने फोहोर (जैविक)' | 'नकुहिने फोहोर (प्लास्टिक/सिसा)' | 'सबै मिश्रित';
  etaMinutes: number;
  status: 'on_route' | 'dumping' | 'depot';
  stops: { name: string; time: string; passed: boolean }[];
}

export const MOCK_GARBAGE_TRUCK: GarbageTruck = {
  id: 'gt-01',
  vehicleNumber: 'बा १ ग २४५६ (पाँचपोखरी सफाइ भ्यान १)',
  driverName: 'सुकमान तामाङ',
  driverPhone: '9841098765',
  routeTitle: 'रुट १: भोटेनाम्लाङ → भोताङ → गुन्सा बजार',
  currentLocationName: 'भोताङ पुल चोक, वडा नं. ४',
  lat: 27.9125,
  lng: 85.6421,
  heading: 'गुन्सा बजारतर्फ',
  speedKmH: 22,
  wasteType: 'कुहिने फोहोर (जैविक)',
  etaMinutes: 14,
  status: 'on_route',
  stops: [
    { name: 'भोटेनाम्लाङ बसपार्क', time: '०७:३० AM', passed: true },
    { name: 'भोताङ पुल चोक', time: '०८:१५ AM', passed: true },
    { name: 'गुन्सा स्वास्थ्यचौकी टोल', time: '०८:४५ AM', passed: false },
    { name: 'मानेखर्क चोक', time: '०९:२० AM', passed: false },
    { name: 'वडा नं. ३ कार्यालय प्रांगण', time: '१०:०० AM', passed: false },
  ],
};

// 4. Judicial Committee e-Court & Complaints (न्यायिक समिति अनलाइन इजलास)
export interface JudicialCase {
  caseNo: string;
  plaintiff: string; // वादी
  defendant: string; // प्रतिवादी
  disputeCategory: string; // साँध-सिमाना, घरेलु, कुलोपानी, ज्यालामजुरी
  wardNo: number;
  filingDateBs: string;
  nextHearingDateBs: string;
  coordinator: string; // उपप्रमुख/संयोजक
  status: 'उजुरी दर्ता' | 'म्याद तामेल' | 'मेलमिलाप प्रक्रिया' | 'इजलास सुनुवाइ' | 'फैसला तयार';
  summary: string;
}

export const MOCK_JUDICIAL_CASES: JudicialCase[] = [
  {
    caseNo: 'न्या.स.-०८१/०८२-०२४',
    plaintiff: 'गोकर्ण प्रसाद दाहाल',
    defendant: 'शम्भु बहादुर श्रेष्ठ',
    disputeCategory: 'जग्गाको साँध-सिमाना तथा साँधको पर्खाल विवाद',
    wardNo: 3,
    filingDateBs: '२०८१/०५/१५',
    nextHearingDateBs: '२०८१/०६/२० (दिउँसो १:०० बजे)',
    coordinator: 'उपाध्यक्ष (संयोजक - न्यायिक समिति)',
    status: 'मेलमिलाप प्रक्रिया',
    summary: 'कित्ता नं. ४२१ र ४२२ बीचको सिमानामा बनेको पर्खालले पानीको निकास थुनेको सम्बन्धी विवादमा अमिनसहित सर्जमिन मुचुल्का हुँदै।',
  },
  {
    caseNo: 'न्या.स.-०८१/०८२-०१९',
    plaintiff: 'माया तामाङ',
    defendant: 'दावा नोर्बु शेर्पा',
    disputeCategory: 'सिँचाइ कुलो पानी बाँडफाँड विवाद',
    wardNo: 4,
    filingDateBs: '२०८१/०४/२८',
    nextHearingDateBs: '२०८१/०६/१४ (बिहान ११:०० बजे)',
    coordinator: 'वडा नं. ४ मेलमिलाप केन्द्र',
    status: 'इजलास सुनुवाइ',
    summary: 'धानखेतमा आलोपालो पानी लगाउने पुराना परम्परागत कुलोमा नयाँ बाटो खन्दा अवरोध पुगेको विषयमा न्यायिक समितिमा संयुक्त छलफल।',
  },
  {
    caseNo: 'न्या.स.-०८१/०८२-०१५',
    plaintiff: 'कृष्ण बहादुर गिरी',
    defendant: 'हरि शरण लामिछाने',
    disputeCategory: 'कृषि ज्याला मजुरी भुक्तानी विवाद',
    wardNo: 2,
    filingDateBs: '२०८१/०४/१०',
    nextHearingDateBs: 'सम्पन्न भयो',
    coordinator: 'न्यायिक समिति इजलास',
    status: 'फैसला तयार',
    summary: 'दुवै पक्षको सहमतिमा बाँकी रु. ३५,०००/- किस्ताबन्दीमा भुक्तानी गर्ने गरी मिलापत्र सम्पन्न भएको।',
  },
];

// 5. Palika Rojgar & Skill Bank (स्थानीय सीप तथा रोजगार बैंक)
export interface SkilledWorker {
  id: string;
  fullName: string;
  skillCategory: 'प्लम्बर' | 'इलेक्ट्रिसियन/वायरिङ' | 'डकर्मी (Mason)' | 'सिकर्मी (Carpenter)' | 'कृषि/भेट प्राविधिक' | 'सवारी/डोजर चालक' | 'कम्प्युटर अपरेटर' | 'सिलाइकटाइ';
  wardNo: number;
  experienceYears: number;
  rating: number; // 1-5
  totalJobsDone: number;
  phone: string;
  isVerified: boolean;
  trainingInstitute: string;
  availableNow: boolean;
  about: string;
}

export const MOCK_SKILLED_WORKERS: SkilledWorker[] = [
  {
    id: 'sk-1',
    fullName: 'दिनेश तामाङ',
    skillCategory: 'प्लम्बर',
    wardNo: 3,
    experienceYears: 6,
    rating: 4.9,
    totalJobsDone: 142,
    phone: '9841334455',
    isVerified: true,
    trainingInstitute: 'CTEVT स्तर-२ प्रमाणित प्लम्बर',
    availableNow: true,
    about: 'घरको पाइपलाइन जडान, पानी ट्याङ्की मर्मत, बाथरुम फिटिङ र ड्रिप सिँचाइमा अनुभवी।',
  },
  {
    id: 'sk-2',
    fullName: 'रोशन श्रेष्ठ',
    skillCategory: 'इलेक्ट्रिसियन/वायरिङ',
    wardNo: 3,
    experienceYears: 8,
    rating: 4.8,
    totalJobsDone: 210,
    phone: '9851098123',
    isVerified: true,
    trainingInstitute: 'हेभी करेन्ट तथा सौर्य उर्जा वायरिङ तालिम',
    availableNow: true,
    about: 'घरेलु हाउस वायरिङ, मोटर पम्प मर्मत, इन्भर्टर/सोलर जडान र सर्ट सर्किट फल्ट फाइन्डिङ।',
  },
  {
    id: 'sk-3',
    fullName: 'कामी दोर्जे शेर्पा',
    skillCategory: 'सिकर्मी (Carpenter)',
    wardNo: 4,
    experienceYears: 12,
    rating: 5.0,
    totalJobsDone: 95,
    phone: '9849887766',
    isVerified: true,
    trainingInstitute: 'परम्परागत काष्ठकला तथा आधुनिक फर्निचर',
    availableNow: false,
    about: 'झ्याल-ढोका, चौकोस, होमस्टे तथा कटेज काठको सजावट र आधुनिक मोडुलर किचन।',
  },
  {
    id: 'sk-4',
    fullName: 'सीता लामिछाने',
    skillCategory: 'कृषि/भेट प्राविधिक',
    wardNo: 2,
    experienceYears: 5,
    rating: 4.9,
    totalJobsDone: 180,
    phone: '9860123987',
    isVerified: true,
    trainingInstitute: 'JT कृषि तथा पशु स्वास्थ्य प्राविधिक (I.Sc.Ag)',
    availableNow: true,
    about: 'गाईभैँसीको कृत्रिम गर्भाधान (AI), बालीमा लाग्ने रोगकीरा पहिचान र जैविक विषादी परामर्श।',
  },
  {
    id: 'sk-5',
    fullName: 'बीरमान विक',
    skillCategory: 'डकर्मी (Mason)',
    wardNo: 5,
    experienceYears: 15,
    rating: 4.7,
    totalJobsDone: 80,
    phone: '9843216549',
    isVerified: true,
    trainingInstitute: 'भूकम्प प्रतिरोधी भवन निर्माण डकर्मी तालिम',
    availableNow: true,
    about: 'गाह्रो लगाउने, प्लास्टर, टाइल-मार्बल र सिमेन्ट कङ्क्रिट ढलान कार्यमा निपुण।',
  },
  {
    id: 'sk-6',
    fullName: 'सुनिता दनुवार',
    skillCategory: 'कम्प्युटर अपरेटर',
    wardNo: 1,
    experienceYears: 3,
    rating: 4.8,
    totalJobsDone: 64,
    phone: '9812345678',
    isVerified: true,
    trainingInstitute: 'डिप्लोमा इन कम्प्युटर अप्लिकेसन तथा अनलाइन फारम',
    availableNow: true,
    about: 'नागरिकता/राहदानी अनलाइन फारम, नेपाली युनिकोड टाइप, मलेप रसिद तथा फोटोकपी।',
  },
];
