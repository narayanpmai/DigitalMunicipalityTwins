export interface ThematicFieldDef {
  id: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'boolean' | 'textarea';
  placeholder?: string;
  unit?: string;
  options?: Array<{ label: string; value: string }>;
  defaultValue?: any;
  required?: boolean;
}

export interface ThematicModuleDef {
  key: number;
  category: string;
  title: string;
  desc: string;
  indicators: string[];
  fields: ThematicFieldDef[];
}

export const THEMATIC_MODULE_SCHEMAS: ThematicModuleDef[] = [
  // १. पालिकाको समग्र परिचय
  {
    key: 1,
    category: 'प्रशासन',
    title: 'पालिकाको समग्र परिचय (Municipality Profile)',
    desc: 'प्रदेश, जिल्ला, कुल जनसंख्या, लिंग, घरधुरी, क्षेत्रफल, जनघनत्व',
    indicators: ['कुल जनसंख्या', 'कुल घरधुरी', 'जनघनत्व', 'प्रति वर्ग कि.मि. जनसंख्या', 'वडा अनुसार जनसंख्या'],
    fields: [
      { id: 'province', label: 'प्रदेश (Province)', type: 'text', defaultValue: 'बागमती प्रदेश', required: true },
      { id: 'district', label: 'जिल्ला (District)', type: 'text', defaultValue: 'सिन्धुपाल्चोक', required: true },
      { id: 'localLevelName', label: 'स्थानीय तहको नाम', type: 'text', defaultValue: 'पाँचपोखरी थाङपाल गाउँपालिका', required: true },
      { id: 'surveyDate', label: 'सर्वेक्षण मिति (वि.सं.)', type: 'text', placeholder: '२०८०/१२/२०' },
      { id: 'dataCollector', label: 'तथ्याङ्क संकलनकर्ता', type: 'text', placeholder: 'नाम र पद' },
      { id: 'totalPopulation', label: 'कुल जनसंख्या', type: 'number', unit: 'जना', defaultValue: 22756 },
      { id: 'maleCount', label: 'पुरुष जनसंख्या', type: 'number', unit: 'जना', defaultValue: 11210 },
      { id: 'femaleCount', label: 'महिला जनसंख्या', type: 'number', unit: 'जना', defaultValue: 11546 },
      { id: 'otherCount', label: 'अन्य लिंगी', type: 'number', unit: 'जना', defaultValue: 0 },
      { id: 'totalHouseholds', label: 'कुल घरधुरी', type: 'number', unit: 'घर', defaultValue: 5642 },
      { id: 'areaSqKm', label: 'कुल क्षेत्रफल', type: 'number', unit: 'वर्ग कि.मि.', defaultValue: 400.6 },
      { id: 'wardCount', label: 'वडा संख्या', type: 'number', unit: 'वटा', defaultValue: 8 },
      { id: 'density', label: 'जनघनत्व (प्रति वर्ग कि.मि.)', type: 'number', unit: 'जना/कि.मि.²', defaultValue: 56.8 },
    ],
  },

  // २. GIS/GPS आधारित विकास योजना विवरण
  {
    key: 2,
    category: 'पूर्वाधार',
    title: 'GIS/GPS आधारित विकास योजना विवरण',
    desc: 'योजना कोड, नाम, प्रकार, लागत, खर्च, Before/After फोटो, भिडियो, प्रगति %',
    indicators: ['कुल योजना संख्या', 'सम्पन्न योजना', 'सञ्चालनमा रहेका योजना', 'सम्पन्न प्रतिशत', 'बजेट उपयोग प्रतिशत', 'लाभग्राही संख्या'],
    fields: [
      { id: 'projectType', label: 'योजना प्रकार', type: 'select', options: [
        { label: 'सडक तथा यातायात', value: 'road' },
        { label: 'खानेपानी तथा सरसफाइ', value: 'water' },
        { label: 'भवन तथा आवास', value: 'building' },
        { label: 'पुल तथा ट्रस', value: 'bridge' },
        { label: 'सिँचाइ तथा नदी नियन्त्रण', value: 'irrigation' },
        { label: 'शिक्षा तथा खेलकुद', value: 'education' },
        { label: 'स्वास्थ्य पूर्वाधार', value: 'health' },
      ] },
      { id: 'workStatus', label: 'कार्य अवस्था', type: 'select', options: [
        { label: 'सम्पन्न (Completed)', value: 'completed' },
        { label: 'सञ्चालनमा / निर्माणाधीन (Ongoing)', value: 'ongoing' },
        { label: 'योजना चरण (Planning)', value: 'planned' },
      ] },
      { id: 'contractType', label: 'कार्यान्वयन विधि', type: 'select', options: [
        { label: 'उपभोक्ता समिति (Consumer Committee)', value: 'committee' },
        { label: 'ठेक्का सम्झौता (Contractor)', value: 'contract' },
        { label: 'अमानत / साझेदारी', value: 'direct' },
      ] },
    ],
  },

  // ३. शिक्षा क्षेत्र
  {
    key: 3,
    category: 'शिक्षा',
    title: 'शिक्षा क्षेत्र',
    desc: 'विद्यालय, विद्यार्थी, शिक्षक, ICT Lab, Smart Classroom, SEE उत्तीर्ण दर',
    indicators: ['विद्यालय संख्या', 'विद्यार्थी संख्या', 'शिक्षक संख्या', 'SEE उत्तीर्ण दर', 'भर्नादर', 'Dropout Rate', 'ICT भएका विद्यालय', 'Smart Classroom भएका विद्यालय'],
    fields: [
      { id: 'schoolType', label: 'विद्यालयको प्रकार', type: 'select', options: [
        { label: 'माध्यमिक विद्यालय (कक्षा १–१२)', value: 'secondary' },
        { label: 'आधारभूत विद्यालय (कक्षा १–८)', value: 'basic' },
        { label: 'प्राथमिक विद्यालय (कक्षा १–५)', value: 'primary' },
        { label: 'प्राविधिक शिक्षालय (Technical)', value: 'technical' },
      ] },
      { id: 'studentsCount', label: 'विद्यार्थी संख्या', type: 'number', unit: 'जना' },
      { id: 'teachersCount', label: 'शिक्षक संख्या', type: 'number', unit: 'जना' },
      { id: 'hasIctLab', label: 'ICT Lab कम्प्युटर ल्याब उपलब्ध ?', type: 'boolean', defaultValue: true },
      { id: 'hasSmartClassroom', label: 'Smart Classroom स्मार्ट कक्षाकोठा उपलब्ध ?', type: 'boolean', defaultValue: true },
      { id: 'hasLibrary', label: 'पुस्तकालय सुविधा उपलब्ध ?', type: 'boolean', defaultValue: true },
      { id: 'hasDrinkingWater', label: 'सुरक्षित खानेपानी सुविधा उपलब्ध ?', type: 'boolean', defaultValue: true },
      { id: 'hasToilet', label: 'छात्र/छात्रा छुट्टाछुट्टै शौचालय ?', type: 'boolean', defaultValue: true },
      { id: 'hasInternet', label: 'इन्टरनेट सुविधा उपलब्ध ?', type: 'boolean', defaultValue: true },
      { id: 'seePassRate', label: 'SEE उत्तीर्ण दर (%)', type: 'number', unit: '%' },
      { id: 'enrollmentRate', label: 'कुल भर्नादर (%)', type: 'number', unit: '%' },
      { id: 'dropoutRate', label: 'विद्यार्थी ड्रपआउट दर (%)', type: 'number', unit: '%' },
    ],
  },

  // ४. स्वास्थ्य क्षेत्र
  {
    key: 4,
    category: 'स्वास्थ्य',
    title: 'स्वास्थ्य क्षेत्र',
    desc: 'स्वास्थ्य संस्था, स्वास्थ्यकर्मी, प्रसूति, खोप, टेलिमेडिसिन, एम्बुलेन्स',
    indicators: ['संस्थागत सुत्केरी दर', 'खोप दर', 'स्वास्थ्य पहुँच', 'स्वास्थ्य संस्था संख्या', 'प्रति जनसंख्या स्वास्थ्यकर्मी अनुपात'],
    fields: [
      { id: 'facilityType', label: 'स्वास्थ्य संस्था प्रकार', type: 'select', options: [
        { label: '१५ शय्या आधारभूत अस्पताल', value: 'hospital_15bed' },
        { label: 'स्वास्थ्य चौकी (Health Post)', value: 'health_post' },
        { label: 'आधारभूत स्वास्थ्य सेवा केन्द्र', value: 'basic_center' },
        { label: 'आयुर्वेद औषधालय', value: 'ayurveda' },
      ] },
      { id: 'healthWorkersCount', label: 'स्वास्थ्यकर्मी संख्या', type: 'number', unit: 'जना' },
      { id: 'bedsCount', label: 'शैया (Beds) संख्या', type: 'number', unit: 'शय्या' },
      { id: 'hasBirthingCenter', label: 'प्रसूति सेवा (Birthing Center) २४/७ उपलब्ध ?', type: 'boolean', defaultValue: true },
      { id: 'hasVaccination', label: 'नियमित खोप कार्यक्रम उपलब्ध ?', type: 'boolean', defaultValue: true },
      { id: 'hasTelemedicine', label: 'विशेषज्ञ टेलिमेडिसिन सेवा उपलब्ध ?', type: 'boolean', defaultValue: true },
      { id: 'hasAmbulance', label: 'एम्बुलेन्स सेवा उपलब्ध ?', type: 'boolean', defaultValue: true },
      { id: 'medicineAvailabilityPercent', label: 'निःशुल्क अत्यावश्यक औषधि उपलब्धता (%)', type: 'number', unit: '%', defaultValue: 95 },
      { id: 'institutionalDeliveryRate', label: 'संस्थागत सुत्केरी दर (%)', type: 'number', unit: '%', defaultValue: 92 },
      { id: 'immunizationRate', label: 'पूर्ण खोप दर (%)', type: 'number', unit: '%', defaultValue: 98 },
    ],
  },

  // ५. कृषि
  {
    key: 5,
    category: 'कृषि',
    title: 'कृषि तथा बाली उत्पादन',
    desc: 'किसान, सिँचित क्षेत्रफल, किबी/बाली, टनेल, बीउ, आम्दानी',
    indicators: ['किसान संख्या', 'उत्पादन वृद्धि', 'कृषि आय', 'सिँचाइ भएको क्षेत्रफल', 'टनेल संख्या'],
    fields: [
      { id: 'farmerName', label: 'किसान / समूह / सहकारीको नाम', type: 'text' },
      { id: 'cultivableAreaRopani', label: 'खेतीयोग्य क्षेत्रफल (रोपनी वा हेक्टर)', type: 'number', unit: 'रोपनी' },
      { id: 'hasIrrigation', label: 'सिँचाइ सुविधा उपलब्ध ?', type: 'boolean', defaultValue: true },
      { id: 'cropType', label: 'प्रमुख बाली प्रकार', type: 'text', placeholder: 'उदा: किबी, आलु, तरकारी, मकै, कोदो' },
      { id: 'tunnelsCount', label: 'प्लास्टिक टनेल संख्या', type: 'number', unit: 'वटा' },
      { id: 'seedsDistributedKg', label: 'वितरण गरिएको उन्नत बीउ (केजी)', type: 'number', unit: 'केजी' },
      { id: 'equipmentDistributed', label: 'कृषि उपकरण वितरण (मिनीटिलर, कटर आदि)', type: 'text' },
      { id: 'annualAgriIncome', label: 'वार्षिक कृषि आम्दानी (रु)', type: 'number', unit: 'रु' },
      { id: 'productionGrowthPercent', label: 'उत्पादन वृद्धि प्रतिशत (%)', type: 'number', unit: '%' },
    ],
  },

  // ६. पशुपालन
  {
    key: 6,
    category: 'कृषि',
    title: 'पशुपालन तथा डेरी उत्पादन',
    desc: 'चौंरी/याक, पशु संख्या, बीमा, नस्ल सुधार, दूध उत्पादन',
    indicators: ['पशु संख्या', 'बीमा भएका पशु', 'दूध उत्पादन', 'नस्ल सुधार संख्या'],
    fields: [
      { id: 'animalType', label: 'पशुको प्रकार', type: 'select', options: [
        { label: 'चौंरी / याक (उच्च हिमाली)', value: 'yak_chauri' },
        { label: 'उन्नत गाई (Cow)', value: 'cow' },
        { label: 'भैंसी (Buffalo)', value: 'buffalo' },
        { label: 'बाख्रा / भेडा (Goat/Sheep)', value: 'goat_sheep' },
        { label: 'कुखुरा / हाँस (Poultry)', value: 'poultry' },
      ] },
      { id: 'animalCount', label: 'कुल पशु संख्या', type: 'number', unit: 'वटा' },
      { id: 'insuredAnimalCount', label: 'बीमा गरिएका पशु संख्या', type: 'number', unit: 'वटा' },
      { id: 'breedImprovementCount', label: 'नस्ल सुधार (कृत्रिम गर्भाधान) संख्या', type: 'number', unit: 'वटा' },
      { id: 'dailyMilkProductionLiters', label: 'दैनिक दूध/डेरी उत्पादन (लिटर)', type: 'number', unit: 'लिटर' },
    ],
  },

  // ७. पर्यटन
  {
    key: 7,
    category: 'पर्यटन',
    title: 'पर्यटन तथा पदमार्ग',
    desc: 'पर्यटकीय स्थल, पदमार्ग, होमस्टे, पर्यटक संख्या, आय',
    indicators: ['पर्यटकीय स्थल संख्या', 'पर्यटक वृद्धि', 'पर्यटन आय', 'होमस्टे संख्या'],
    fields: [
      { id: 'siteName', label: 'पर्यटकीय स्थलको नाम', type: 'text' },
      { id: 'trailLengthKm', label: 'पदमार्ग लम्बाइ (कि.मि.)', type: 'number', unit: 'कि.मि.' },
      { id: 'homestaysCount', label: 'दर्ता भएका होमस्टे संख्या', type: 'number', unit: 'वटा' },
      { id: 'annualVisitors', label: 'वार्षिक पर्यटक संख्या (जना)', type: 'number', unit: 'जना' },
      { id: 'touristGrowthPercent', label: 'पर्यटक आगमन वृद्धि प्रतिशत (%)', type: 'number', unit: '%' },
      { id: 'annualTourismIncome', label: 'वार्षिक पर्यटन आय (रु)', type: 'number', unit: 'रु' },
    ],
  },

  // ८. सडक पूर्वाधार
  {
    key: 8,
    category: 'पूर्वाधार',
    title: 'सडक पूर्वाधार',
    desc: 'सडक नाम, GPS Track, कालोपत्रे, ग्राभेल, कच्ची लम्बाइ',
    indicators: ['कुल सडक लम्बाइ', 'कालोपत्रे सडक %', 'ग्राभेल सडक %', 'कच्ची सडक %', 'सम्पत्ति अवस्था सूचकाङ्क'],
    fields: [
      { id: 'roadType', label: 'सडक वर्गीकरण', type: 'select', options: [
        { label: 'गाउँपालिका चक्रपथ / मुख्य सडक', value: 'main' },
        { label: 'वडा जोड्ने सडक', value: 'ward_connect' },
        { label: 'कृषि तथा पर्यटकीय सडक', value: 'agri_tourism' },
      ] },
      { id: 'totalLengthKm', label: 'कुल सडक लम्बाइ (कि.मि.)', type: 'number', unit: 'कि.मि.' },
      { id: 'widthMeters', label: 'सडक चौडाइ (मिटर)', type: 'number', unit: 'मिटर' },
      { id: 'blacktoppedKm', label: 'कालोपत्रे गरिएको लम्बाइ (कि.मि.)', type: 'number', unit: 'कि.मि.' },
      { id: 'gravelKm', label: 'ग्राभेल गरिएको लम्बाइ (कि.मि.)', type: 'number', unit: 'कि.मि.' },
      { id: 'dirtKm', label: 'कच्ची सडक लम्बाइ (कि.मि.)', type: 'number', unit: 'कि.मि.' },
      { id: 'assetCondition', label: '🟢🟡🔴 सम्पत्ति अवस्था (Asset Condition)', type: 'select', options: [
        { label: '🟢 राम्रो अवस्थामा (Good — नियमित उपयोगयोग्य)', value: 'good' },
        { label: '🟡 सामान्य मर्मत आवश्यक (Fair — Minor Repair)', value: 'fair' },
        { label: '🔴 तत्काल मर्मत / पुनर्निर्माण आवश्यक (Poor)', value: 'poor' },
      ] },
      { id: 'lastMaintenanceYear', label: 'अन्तिम मर्मत वर्ष (वि.सं.)', type: 'text', placeholder: '२०८०' },
      { id: 'maintenanceFundAvailable', label: 'के वार्षिक मर्मतसम्भार कोष उपलब्ध छ ?', type: 'boolean', defaultValue: false },
      { id: 'estimatedRemainingLifeYears', label: 'अनुमानित बाँकी आयु (वर्ष)', type: 'number', unit: 'वर्ष', placeholder: '10' },
    ],
  },

  // ९. खानेपानी
  {
    key: 9,
    category: 'पूर्वाधार',
    title: 'खानेपानी (एक घर एक धारा)',
    desc: 'एक घर एक धारा, मुहान, धारा संख्या, लाभग्राही घरधुरी',
    indicators: ['खानेपानी पहुँच %', 'लाभग्राही घरधुरी', 'सञ्चालनमा रहेका योजना', 'सम्पत्ति अवस्था सूचकाङ्क'],
    fields: [
      { id: 'waterSource', label: 'पानीको मुख्य स्रोत', type: 'select', options: [
        { label: 'प्राकृतिक मुहान (Spring)', value: 'spring' },
        { label: 'नदी / खोला लिफ्टिङ (Lifting)', value: 'lifting' },
        { label: 'डिप बोरिङ (Deep Boring)', value: 'boring' },
        { label: 'आकाशे पानी संकलन (Rainwater)', value: 'rainwater' },
      ] },
      { id: 'tapCount', label: 'वितरण गरिएको निजी धारा संख्या', type: 'number', unit: 'धारा' },
      { id: 'beneficiaryHouseholds', label: 'लाभान्वित कुल घरधुरी', type: 'number', unit: 'घर' },
      { id: 'operationalStatus', label: 'सञ्चालन अवस्था', type: 'select', options: [
        { label: 'नियमित सञ्चालनमा', value: 'operational' },
        { label: 'आंशिक सञ्चालनमा', value: 'partial' },
        { label: 'मर्मत आवश्यक', value: 'needs_repair' },
      ] },
      { id: 'coveragePercent', label: 'खानेपानी कभरेज प्रतिशत (%)', type: 'number', unit: '%' },
      { id: 'assetCondition', label: '🟢🟡🔴 पूर्वाधार अवस्था (Asset Condition)', type: 'select', options: [
        { label: '🟢 राम्रो — नियमित आपूर्ति भइरहेको', value: 'good' },
        { label: '🟡 सामान्य — आंशिक मर्मत आवश्यक', value: 'fair' },
        { label: '🔴 खराब — पाइप फुटेको / मुहान सुकेको', value: 'poor' },
      ] },
      { id: 'lastMaintenanceYear', label: 'अन्तिम मर्मत वर्ष (वि.सं.)', type: 'text', placeholder: '२०८०' },
      { id: 'maintenanceFundAvailable', label: 'के उपभोक्ता समितिको मर्मत कोष उपलब्ध छ ?', type: 'boolean', defaultValue: false },
      { id: 'estimatedRemainingLifeYears', label: 'अनुमानित बाँकी आयु (वर्ष)', type: 'number', unit: 'वर्ष' },
    ],
  },

  // १०. विद्युत तथा सञ्चार
  {
    key: 10,
    category: 'पूर्वाधार',
    title: 'विद्युत तथा सञ्चार',
    desc: 'विद्युतीकरण %, इन्टरनेट, मोबाइल नेटवर्क, CCTV, Wi-Fi',
    indicators: ['विद्युतीकरण %', 'इन्टरनेट पहुँच %', 'CCTV संख्या'],
    fields: [
      { id: 'isElectrified', label: 'के यस बस्तीमा राष्ट्रिय प्रसारण बिजुली पुगेको छ ?', type: 'boolean', defaultValue: true },
      { id: 'hasInternet', label: 'के ब्रोडब्यान्ड / फाइबर इन्टरनेट उपलब्ध छ ?', type: 'boolean', defaultValue: true },
      { id: 'mobileNetwork', label: 'मोबाइल नेटवर्क स्तर (4G/5G/2G)', type: 'select', options: [
        { label: '4G LTE पूर्ण पहुँच', value: '4g_full' },
        { label: '4G आंशिक पहुँच', value: '4g_partial' },
        { label: '2G/3G मात्र', value: '2g_3g' },
      ] },
      { id: 'cctvCount', label: 'जडान गरिएका CCTV क्यामेरा संख्या', type: 'number', unit: 'वटा' },
      { id: 'hasPublicWifi', label: 'सार्वजनिक नि:शुल्क Wi-Fi उपलब्ध ?', type: 'boolean', defaultValue: true },
      { id: 'blackWireExtensionKm', label: 'विद्युत सुरक्षित कालो तार विस्तार (कि.मि.)', type: 'number', unit: 'कि.मि.' },
      { id: 'transformersCount', label: 'ट्रान्सफर्मर संख्या', type: 'number', unit: 'वटा' },
    ],
  },

  // ११. वातावरण तथा जलवायु
  {
    key: 11,
    category: 'वातावरण',
    title: 'वातावरण तथा जलवायु',
    desc: 'वन क्षेत्र, वृक्षारोपण, नदी संरक्षण, फोहोर व्यवस्थापन',
    indicators: ['वन क्षेत्रफल', 'वृक्षारोपण संख्या', 'फोहोर व्यवस्थापन प्रतिशत', 'संरक्षण क्षेत्र'],
    fields: [
      { id: 'forestAreaHectares', label: 'सामुदायिक / कबुलियती वन क्षेत्रफल (हेक्टर)', type: 'number', unit: 'हेक्टर' },
      { id: 'plantationTreesCount', label: 'रोपिएका नयाँ विरुवा संख्या', type: 'number', unit: 'विरुवा' },
      { id: 'riverConservationWork', label: 'नदी तथा जलाधार संरक्षण कार्य', type: 'text' },
      { id: 'wasteManagementPercent', label: 'फोहोरमैला संकलन तथा व्यवस्थापन (%)', type: 'number', unit: '%' },
      { id: 'landslideProneArea', label: 'पहिरो जोखिम क्षेत्र पहिचान', type: 'text' },
      { id: 'floodProneArea', label: 'बाढी कटान जोखिम क्षेत्र', type: 'text' },
    ],
  },

  // १२. विपद् व्यवस्थापन
  {
    key: 12,
    category: 'विपद्',
    title: 'विपद् व्यवस्थापन तथा पूर्वतयारी',
    desc: 'जोखिम नक्साङ्कन, प्रभावित परिवार, राहत, पूर्वतयारी',
    indicators: ['उच्च जोखिम क्षेत्र', 'प्रभावित परिवार', 'राहत वितरण प्रतिशत', 'जोखिम नक्साङ्कन'],
    fields: [
      { id: 'disasterType', label: 'विपद्को प्रकार', type: 'select', options: [
        { label: 'पहिरो (Landslide)', value: 'landslide' },
        { label: 'बाढी तथा कटान (Flood)', value: 'flood' },
        { label: 'भूकम्पीय जोखिम (Earthquake)', value: 'earthquake' },
        { label: 'हावाहुरी तथा आगलागी (Fire/Storm)', value: 'fire' },
      ] },
      { id: 'riskLevel', label: 'जोखिम स्तर (Risk Level)', type: 'select', options: [
        { label: 'उच्च जोखिम (High)', value: 'high' },
        { label: 'मध्यम जोखिम (Medium)', value: 'medium' },
        { label: 'सामान्य / न्यून (Low)', value: 'low' },
      ] },
      { id: 'affectedFamiliesCount', label: 'प्रभावित परिवार संख्या', type: 'number', unit: 'परिवार' },
      { id: 'reliefDistributionPercent', label: 'राहत तथा पुनर्स्थापना वितरण प्रतिशत (%)', type: 'number', unit: '%' },
      { id: 'preparednessProgram', label: 'सञ्चालन गरिएको पूर्वतयारी कार्यक्रम', type: 'text' },
    ],
  },

  // १३. सामाजिक समावेशीकरण
  {
    key: 13,
    category: 'समावेशीकरण',
    title: 'सामाजिक समावेशीकरण',
    desc: 'महिला, दलित, जनजाति, अपाङ्गता बजेट तथा कार्यक्रम',
    indicators: ['महिला सहभागिता %', 'दलित लाभग्राही', 'जनजाति लाभग्राही', 'अपाङ्गता लाभग्राही', 'समावेशी बजेट %'],
    fields: [
      { id: 'womenParticipationPercent', label: 'कार्यक्रमहरूमा महिला सहभागिता (%)', type: 'number', unit: '%' },
      { id: 'dalitBeneficiaries', label: 'दलित समुदायका प्रत्यक्ष लाभग्राही संख्या', type: 'number', unit: 'जना' },
      { id: 'janajatiBeneficiaries', label: 'आदिवासी जनजाति लाभग्राही संख्या', type: 'number', unit: 'जना' },
      { id: 'disabilityBeneficiaries', label: 'अपाङ्गता भएका लाभग्राही संख्या', type: 'number', unit: 'जना' },
      { id: 'inclusiveBudgetPercent', label: 'कुल बजेटमा समावेशी विनियोजन प्रतिशत (%)', type: 'number', unit: '%' },
    ],
  },

  // १४. वित्तीय प्रगति
  {
    key: 14,
    category: 'प्रशासन',
    title: 'वित्तीय प्रगति',
    desc: 'विनियोजित बजेट, खर्च %, अनुदान, आन्तरिक राजस्व',
    indicators: ['बजेट उपयोग %', 'राजस्व वृद्धि %', 'पूँजीगत खर्च %', 'चालु खर्च %'],
    fields: [
      { id: 'allocatedBudgetNpr', label: 'कुल विनियोजित बजेट (रु)', type: 'number', unit: 'रु' },
      { id: 'totalExpendedNpr', label: 'कुल यथार्थ खर्च (रु)', type: 'number', unit: 'रु' },
      { id: 'capitalExpenditurePercent', label: 'पूँजीगत (विकास) खर्च प्रतिशत (%)', type: 'number', unit: '%' },
      { id: 'recurrentExpenditurePercent', label: 'चालु खर्च प्रतिशत (%)', type: 'number', unit: '%' },
      { id: 'internalRevenueNpr', label: 'आन्तरिक राजस्व संकलन (रु)', type: 'number', unit: 'रु' },
      { id: 'revenueGrowthPercent', label: 'राजस्व वृद्धि प्रतिशत (%)', type: 'number', unit: '%' },
      { id: 'federalGrantNpr', label: 'संघीय सरकार वित्तीय अनुदान (रु)', type: 'number', unit: 'रु' },
      { id: 'provincialGrantNpr', label: 'प्रदेश सरकार वित्तीय अनुदान (रु)', type: 'number', unit: 'रु' },
    ],
  },

  // १५. डिजिटल सुशासन
  {
    key: 15,
    category: 'सुशासन',
    title: 'डिजिटल सुशासन',
    desc: 'Website, Mobile App, E-Services, डिजिटल बडापत्र',
    indicators: ['Online सेवा संख्या', 'सेवाग्राही संख्या', 'सेवा प्रवाह समय', 'गुनासो समाधान प्रतिशत', 'डिजिटल सेवा सूचकाङ्क'],
    fields: [
      { id: 'hasActiveWebsite', label: 'अद्यावधिक वेबसाइट सञ्चालनमा छ ?', type: 'boolean', defaultValue: true },
      { id: 'hasMobileApp', label: 'नागरिक मोबाइल एप सञ्चालनमा छ ?', type: 'boolean', defaultValue: true },
      { id: 'onlineServicesCount', label: 'अनलाइन उपलब्ध सेवा संख्या (वटा)', type: 'number', unit: 'वटा' },
      { id: 'hasEAttendance', label: 'विद्युतीय हाजिरी (E-Attendance) अनिवार्य ?', type: 'boolean', defaultValue: true },
      { id: 'hasDigitalBadapatra', label: 'डिजिटल नागरिक बडापत्र जडान ?', type: 'boolean', defaultValue: true },
      { id: 'grievanceResolutionPercent', label: 'गुनासो समाधान प्रतिशत (%)', type: 'number', unit: '%' },
      { id: 'digitalServiceIndex', label: 'डिजिटल सेवा सूचकाङ्क (०-१००)', type: 'number', unit: 'स्कोर' },
    ],
  },

  // १६. वडा अनुसार प्रगति
  {
    key: 16,
    category: 'प्रशासन',
    title: 'वडा अनुसार प्रगति',
    desc: 'वडास्तरीय योजना संख्या, बजेट, सडक, खानेपानी प्रगति',
    indicators: ['वडा प्रगति %', 'सम्पन्न योजना %', 'बजेट उपयोग %', 'वडा विकास सूचकाङ्क'],
    fields: [
      { id: 'targetProjectsCount', label: 'वडामा छनोट भएका कुल योजना संख्या', type: 'number', unit: 'वटा' },
      { id: 'completedProjectsCount', label: 'सम्पन्न भएका योजना संख्या', type: 'number', unit: 'वटा' },
      { id: 'wardBudgetUtilizationPercent', label: 'वडा बजेट उपयोग प्रतिशत (%)', type: 'number', unit: '%' },
      { id: 'wardDevelopmentIndex', label: 'वडा समग्र विकास सूचकाङ्क (०-१००)', type: 'number', unit: 'स्कोर' },
    ],
  },

  // १७. नागरिक सन्तुष्टि सर्वेक्षण
  {
    key: 17,
    category: 'सुशासन',
    title: 'नागरिक सन्तुष्टि सर्वेक्षण',
    desc: 'QR Code आधारित शिक्षा, स्वास्थ्य, सडक सन्तुष्टि ८६.४%',
    indicators: ['नागरिक सन्तुष्टि सूचकाङ्क', 'गुनासो संख्या', 'समाधान प्रतिशत', 'सेवा गुणस्तर सूचकाङ्क'],
    fields: [
      { id: 'educationSatisfactionScore', label: 'शिक्षा सेवा सन्तुष्टि (१ देखि ५ स्कोर)', type: 'number', unit: '/५' },
      { id: 'healthSatisfactionScore', label: 'स्वास्थ्य सेवा सन्तुष्टि (१ देखि ५ स्कोर)', type: 'number', unit: '/५' },
      { id: 'roadSatisfactionScore', label: 'सडक पूर्वाधार सन्तुष्टि (१ देखि ५ स्कोर)', type: 'number', unit: '/५' },
      { id: 'waterSatisfactionScore', label: 'खानेपानी सेवा सन्तुष्टि (१ देखि ५ स्कोर)', type: 'number', unit: '/५' },
      { id: 'overallSatisfactionPercent', label: 'समग्र नागरिक सन्तुष्टि सूचकाङ्क (%)', type: 'number', unit: '%' },
      { id: 'citizenFeedbackNotes', label: 'नागरिकहरूको प्रमुख सुझाव तथा प्रतिक्रिया', type: 'textarea' },
    ],
  },

  // १८. Before vs After (२०७४–२०८४)
  {
    key: 18,
    category: 'योजना',
    title: 'Before vs After (२०७४–२०८४) ऐतिहासिक तुलना',
    desc: 'आधाररेखा २०७९ र हालको अवस्था २०८४ को तुलना — सडक, खानेपानी, विद्युत, शिक्षा, स्वास्थ्य, राजस्व, डिजिटल, रोजगार',
    indicators: ['सडक सञ्जाल वृद्धि', 'खानेपानी कभरेज', 'विद्युतीकरण', 'डिजिटल सेवा पहुँच', 'राजस्व आत्मनिर्भरता', 'रोजगार वृद्धि', 'SEE उत्तीर्ण दर', 'संस्थागत सुत्केरी दर', 'पर्यटक संख्या वृद्धि'],
    fields: [
      { id: 'baselinePeriod', label: 'आधाररेखा अवधि (Baseline Period)', type: 'text', defaultValue: '२०७४/२०७९' },
      { id: 'currentPeriod', label: 'हालको मूल्याङ्कन वर्ष (Current Period)', type: 'text', defaultValue: '२०८४' },

      // --- पूर्वाधार तुलना ---
      { id: 'roadLengthBefore', label: '🛣️ सडक लम्बाइ: पहिले (कि.मि.)', type: 'number', unit: 'कि.मि.' },
      { id: 'roadLengthAfter', label: '🛣️ सडक लम्बाइ: अहिले (कि.मि.)', type: 'number', unit: 'कि.मि.' },
      { id: 'waterCoverageBefore', label: '💧 खानेपानी कभरेज: पहिले (%)', type: 'number', unit: '%' },
      { id: 'waterCoverageAfter', label: '💧 खानेपानी कभरेज: अहिले (%)', type: 'number', unit: '%' },
      { id: 'electricityCoverageBefore', label: '⚡ विद्युतीकरण: पहिले (%)', type: 'number', unit: '%' },
      { id: 'electricityCoverageAfter', label: '⚡ विद्युतीकरण: अहिले (%)', type: 'number', unit: '%' },
      { id: 'bridgesBuiltCount', label: '🌉 निर्माण गरिएका पुल संख्या (दशकमा)', type: 'number', unit: 'वटा' },

      // --- शिक्षा तुलना ---
      { id: 'seePassRateBefore', label: '📚 SEE उत्तीर्ण दर: पहिले (%)', type: 'number', unit: '%' },
      { id: 'seePassRateAfter', label: '📚 SEE उत्तीर्ण दर: अहिले (%)', type: 'number', unit: '%' },
      { id: 'ictLabsBefore', label: '💻 ICT Lab भएका विद्यालय: पहिले', type: 'number', unit: 'वटा' },
      { id: 'ictLabsAfter', label: '💻 ICT Lab भएका विद्यालय: अहिले', type: 'number', unit: 'वटा' },

      // --- स्वास्थ्य तुलना ---
      { id: 'institutionalDeliveryBefore', label: '🏥 संस्थागत सुत्केरी दर: पहिले (%)', type: 'number', unit: '%' },
      { id: 'institutionalDeliveryAfter', label: '🏥 संस्थागत सुत्केरी दर: अहिले (%)', type: 'number', unit: '%' },

      // --- आर्थिक तथा रोजगार तुलना ---
      { id: 'municipalRevenueBefore', label: '💰 स्वयं राजस्व: पहिले (रु लाखमा)', type: 'number', unit: 'लाख रु' },
      { id: 'municipalRevenueAfter', label: '💰 स्वयं राजस्व: अहिले (रु लाखमा)', type: 'number', unit: 'लाख रु' },
      { id: 'jobsCreatedCount', label: '👷 दशकमा सिर्जना भएको रोजगारी (जना)', type: 'number', unit: 'जना' },
      { id: 'annualTourismIncomeBefore', label: '🏔️ पर्यटन आय: पहिले (रु लाखमा)', type: 'number', unit: 'लाख रु' },
      { id: 'annualTourismIncomeAfter', label: '🏔️ पर्यटन आय: अहिले (रु लाखमा)', type: 'number', unit: 'लाख रु' },

      // --- डिजिटल सुशासन ---
      { id: 'onlineServicesBefore', label: '🖥️ अनलाइन सेवा संख्या: पहिले', type: 'number', unit: 'सेवा' },
      { id: 'onlineServicesAfter', label: '🖥️ अनलाइन सेवा संख्या: अहिले', type: 'number', unit: 'सेवा' },
      { id: 'citizenTimeSavedHoursPerYear', label: '⏱️ डिजिटल सेवाले नागरिकको वार्षिक बचत समय (घण्टा)', type: 'number', unit: 'घण्टा' },

      // --- समग्र उपलब्धि ---
      { id: 'keyTransformationsSummary', label: '📝 दशकका मुख्य रणनीतिक उपलब्धिहरू', type: 'textarea' },
      { id: 'remainingChallenges', label: '⚠️ अझै बाँकी प्रमुख चुनौतीहरू', type: 'textarea' },
    ],
  },

  // २०. झोलुङ्गे पुल (Suspension Bridge)
  {
    key: 20,
    category: 'पूर्वाधार',
    title: 'झोलुङ्गे पुल (Suspension Bridge)',
    desc: 'नदी नाम, लम्बाइ, चौडाइ, भार क्षमता, लाभग्राही, Before/After',
    indicators: ['झोलुङ्गे पुल संख्या', 'सञ्चालनमा रहेका पुल', 'मर्मत आवश्यक पुल', 'लाभान्वित घरधुरी', 'लाभान्वित जनसंख्या', 'विद्यालय पहुँच सुधार', 'स्वास्थ्य पहुँच सुधार', 'औसत यात्रा समय घटेको (%)', 'सम्पत्ति अवस्था सूचकाङ्क'],
    fields: [
      { id: 'bridgeName', label: 'पुलको नाम*', type: 'text', required: true, placeholder: 'उदा: याङरी खोला झोलुङ्गे पुल' },
      { id: 'riverName', label: 'नदी / खोलाको नाम*', type: 'text', required: true, placeholder: 'उदा: याङरी खोला' },
      { id: 'constructionYear', label: 'निर्माण वर्ष (वि.सं.)', type: 'text', placeholder: '२०८०' },
      { id: 'constructingAgency', label: 'निर्माण संस्था / उपभोक्ता समिति', type: 'text', placeholder: 'सस्पेन्सन ब्रिज डिभिजन / समिति' },
      { id: 'bridgeLengthMeters', label: 'पुलको लम्बाइ (मिटर)*', type: 'number', unit: 'मिटर', required: true },
      { id: 'bridgeWidthMeters', label: 'पुलको चौडाइ (मिटर)', type: 'number', unit: 'मिटर', defaultValue: 1.2 },
      { id: 'designCapacityTons', label: 'डिजाइन क्षमता (टन वा व्यक्ति)', type: 'number', unit: 'टन' },
      { id: 'operationalStatus', label: 'सञ्चालन अवस्था', type: 'select', options: [
        { label: 'नियमित सञ्चालनमा (Operational)', value: 'operational' },
        { label: 'आंशिक सञ्चालनमा', value: 'partial' },
        { label: 'मर्मत आवश्यक (Needs Repair)', value: 'needs_repair' },
      ] },
      { id: 'travelTimeReducedPercent', label: 'औसत यात्रा समय घटेको (%)', type: 'number', unit: '%', defaultValue: 60 },
      { id: 'schoolAccessImproved', label: 'के विद्यालय पहुँचमा सुधार भएको छ ?', type: 'boolean', defaultValue: true },
      { id: 'healthAccessImproved', label: 'के स्वास्थ्य संस्था पहुँचमा सुधार भएको छ ?', type: 'boolean', defaultValue: true },
      { id: 'assetCondition', label: '🟢🟡🔴 पुलको संरचनागत अवस्था (Asset Condition)', type: 'select', options: [
        { label: '🟢 राम्रो — सुरक्षित तथा पूर्ण सञ्चालनयोग्य', value: 'good' },
        { label: '🟡 सामान्य — केही तारहरू/बोर्ड मर्मत आवश्यक', value: 'fair' },
        { label: '🔴 खराब — तत्काल मर्मत/बन्द गर्नुपर्ने', value: 'poor' },
      ] },
      { id: 'lastInspectionYear', label: 'अन्तिम सुरक्षा निरीक्षण वर्ष (वि.सं.)', type: 'text', placeholder: '२०८०' },
      { id: 'maintenanceFundAvailable', label: 'के मर्मतसम्भार कोष / जिम्मेवारी निर्धारण भएको छ ?', type: 'boolean', defaultValue: false },
    ],
  },

  // २१. मोटरेबल पुल (Motorable Bridge)
  {
    key: 21,
    category: 'पूर्वाधार',
    title: 'मोटरेबल पुल (Motorable Bridge)',
    desc: 'सडक, आरसीसी/ट्रस, लम्बाइ, भार, लाभान्वित बस्ती, समय बचत',
    indicators: ['मोटरेबल पुल संख्या', 'सडक सञ्जाल जोडिएका बस्ती', 'लाभान्वित जनसंख्या', 'यात्रा समय बचत', 'आर्थिक पहुँच वृद्धि', 'सम्पत्ति अवस्था सूचकाङ्क'],
    fields: [
      { id: 'bridgeName', label: 'मोटरेबल पुलको नाम*', type: 'text', required: true },
      { id: 'roadName', label: 'जोडिएको सडकको नाम', type: 'text' },
      { id: 'bridgeStructureType', label: 'पुलको प्रकार', type: 'select', options: [
        { label: 'आरसीसी गार्डर पुल (RCC Girder)', value: 'rcc_girder' },
        { label: 'स्टिल ट्रस पुल (Steel Truss)', value: 'steel_truss' },
        { label: 'प्रि-स्ट्रेस्ड कंक्रिट पुल', value: 'pre_stressed' },
      ] },
      { id: 'lengthMeters', label: 'पुलको लम्बाइ (मिटर)*', type: 'number', unit: 'मिटर' },
      { id: 'widthMeters', label: 'चौडाइ (मिटर)', type: 'number', unit: 'मिटर' },
      { id: 'loadCapacityTons', label: 'भार क्षमता (टन)*', type: 'number', unit: 'टन' },
      { id: 'settlementsConnectedCount', label: 'सडक सञ्जालमा जोडिएका नयाँ बस्ती संख्या', type: 'number', unit: 'बस्ती' },
      { id: 'travelTimeSavedMinutes', label: 'यात्रा समय बचत (मिनेट)', type: 'number', unit: 'मिनेट' },
      { id: 'assetCondition', label: '🟢🟡🔴 पुलको संरचनागत अवस्था (Asset Condition)', type: 'select', options: [
        { label: '🟢 राम्रो — पूर्ण भार वहन क्षमतासहित सञ्चालनयोग्य', value: 'good' },
        { label: '🟡 सामान्य — तत्काल मर्मत नचाहिने तर अनुगमन आवश्यक', value: 'fair' },
        { label: '🔴 खराब — भार सीमा घटाउनु वा बन्द गर्नुपर्ने', value: 'poor' },
      ] },
      { id: 'lastInspectionYear', label: 'अन्तिम इन्जिनियरिङ निरीक्षण वर्ष (वि.सं.)', type: 'text', placeholder: '२०८०' },
      { id: 'maintenanceFundAvailable', label: 'के मर्मतसम्भार जिम्मेवारी र कोष तोकिएको छ ?', type: 'boolean', defaultValue: false },
      { id: 'estimatedRemainingLifeYears', label: 'अनुमानित बाँकी संरचना आयु (वर्ष)', type: 'number', unit: 'वर्ष' },
    ],
  },

  // २२. सामुदायिक भवन
  {
    key: 22,
    category: 'भवन',
    title: 'सामुदायिक भवन',
    desc: 'क्षमता, अपाङ्गमैत्री, इन्टरनेट, बहुउद्देश्यीय प्रयोग',
    indicators: ['सामुदायिक भवन संख्या', 'नियमित प्रयोग हुने भवन', 'क्षमता उपयोग (%)', 'अपाङ्गमैत्री भवन (%)', 'सम्पत्ति अवस्था सूचकाङ्क'],
    fields: [
      { id: 'buildingName', label: 'सामुदायिक भवनको नाम*', type: 'text', required: true },
      { id: 'buildingType', label: 'भवनको प्रकार', type: 'select', options: [
        { label: 'बहुउद्देश्यीय सामुदायिक भवन', value: 'multipurpose' },
        { label: 'विपद् सुरक्षित आश्रयस्थल (Evacuation Center)', value: 'evacuation' },
        { label: 'महिला तथा आमा समूह भवन', value: 'women_group' },
        { label: 'ज्येष्ठ नागरिक मिलन केन्द्र', value: 'senior_center' },
      ] },
      { id: 'capacityPersons', label: 'बैठक / आश्रय क्षमता (व्यक्ति)*', type: 'number', unit: 'जना' },
      { id: 'isDisabilityFriendly', label: 'अपाङ्गमैत्री (र्याम्प/शौचालय) छ ?', type: 'boolean', defaultValue: true },
      { id: 'hasInternet', label: 'इन्टरनेट सुविधा उपलब्ध ?', type: 'boolean', defaultValue: true },
      { id: 'usageStatus', label: 'प्रयोगको नियमितता', type: 'select', options: [
        { label: 'नियमित प्रयोग भइरहेको', value: 'regular' },
        { label: 'कहिलेकाहीँ प्रयोग हुने', value: 'occasional' },
        { label: 'प्रयोगविहीन', value: 'abandoned' },
      ] },
      { id: 'assetCondition', label: '🟢🟡🔴 भवनको संरचनागत अवस्था (Asset Condition)', type: 'select', options: [
        { label: '🟢 राम्रो — पूर्ण प्रयोगयोग्य तथा सुरक्षित', value: 'good' },
        { label: '🟡 सामान्य — साधारण मर्मत / रंगरोगन आवश्यक', value: 'fair' },
        { label: '🔴 खराब — संरचनागत क्षति / तत्काल मर्मत आवश्यक', value: 'poor' },
      ] },
      { id: 'lastMaintenanceYear', label: 'अन्तिम मर्मत वर्ष (वि.सं.)', type: 'text', placeholder: '२०८०' },
      { id: 'maintenanceFundAvailable', label: 'के भवन मर्मतसम्भार कोष वा जिम्मेवारी तोकिएको छ ?', type: 'boolean', defaultValue: false },
    ],
  },

  // २३. धार्मिक तथा सांस्कृतिक सम्पदा
  {
    key: 23,
    category: 'संस्कृति',
    title: 'धार्मिक तथा सांस्कृतिक सम्पदा',
    desc: 'गुम्बा, मन्दिर, ऐतिहासिक महत्व, संरक्षण अवस्था, आगन्तुक',
    indicators: ['सम्पदा संख्या', 'संरक्षण गरिएका सम्पदा', 'पर्यटक संख्या', 'धार्मिक कार्यक्रम संख्या'],
    fields: [
      { id: 'heritageName', label: 'सम्पदाको नाम*', type: 'text', required: true },
      { id: 'heritageType', label: 'सम्पदाको प्रकार', type: 'select', options: [
        { label: 'बौद्ध गुम्बा / छोर्तेन / माने', value: 'gumba' },
        { label: 'हिन्दू मन्दिर / धाम', value: 'temple' },
        { label: 'प्राकृतिक पवित्र कुण्ड / पोखरी', value: 'holy_pond' },
        { label: 'ऐतिहासिक किल्ला / गढी', value: 'historical_fort' },
      ] },
      { id: 'historicalImportance', label: 'ऐतिहासिक तथा सांस्कृतिक महत्व', type: 'textarea' },
      { id: 'conservationStatus', label: 'संरक्षण तथा पुनर्निर्माण अवस्था', type: 'select', options: [
        { label: 'पूर्ण संरक्षण तथा जिर्णोद्धार सम्पन्न', value: 'fully_restored' },
        { label: 'संरक्षण कार्य जारी', value: 'in_progress' },
        { label: 'मर्मत तथा जिर्णोद्धार आवश्यक', value: 'needs_restoration' },
      ] },
      { id: 'annualVisitorsCount', label: 'वार्षिक दर्शनार्थी / पर्यटक संख्या', type: 'number', unit: 'जना' },
    ],
  },

  // २४. प्रतिक्षालय (Waiting Shelter)
  {
    key: 24,
    category: 'पूर्वाधार',
    title: 'प्रतिक्षालय (Waiting Shelter)',
    desc: 'यात्रु बिसौनी, क्षमता, बस सेवा, दैनिक प्रयोगकर्ता',
    indicators: ['प्रतिक्षालय संख्या', 'सञ्चालनमा रहेका प्रतिक्षालय', 'दैनिक प्रयोगकर्ता', 'सेवा पहुँच', 'सम्पत्ति अवस्था सूचकाङ्क'],
    fields: [
      { id: 'shelterLocation', label: 'प्रतिक्षालय रहेको स्थान*', type: 'text', required: true },
      { id: 'roadName', label: 'जोडिएको सडकको नाम', type: 'text' },
      { id: 'capacityPersons', label: 'यात्रु क्षमता (व्यक्ति)', type: 'number', unit: 'जना' },
      { id: 'busServiceAvailable', label: 'नियमित बस / सार्वजनिक यातायात उपलब्ध ?', type: 'boolean', defaultValue: true },
      { id: 'dailyUsersCount', label: 'दैनिक औसत प्रयोगकर्ता (यात्रु संख्या)', type: 'number', unit: 'जना' },
      { id: 'assetCondition', label: '🟢🟡🔴 प्रतिक्षालयको अवस्था (Asset Condition)', type: 'select', options: [
        { label: '🟢 राम्रो — सफा तथा पूर्ण प्रयोगयोग्य', value: 'good' },
        { label: '🟡 सामान्य — रंगरोगन वा साधारण मर्मत आवश्यक', value: 'fair' },
        { label: '🔴 खराब — भाँचिएको / प्रयोगयोग्य नभएको', value: 'poor' },
      ] },
      { id: 'lastMaintenanceYear', label: 'अन्तिम मर्मत वर्ष (वि.सं.)', type: 'text', placeholder: '२०८०' },
    ],
  },

  // २५. पार्क तथा बाल उद्यान
  {
    key: 25,
    category: 'पर्यटन',
    title: 'पार्क तथा बाल उद्यान',
    desc: 'हरियाली क्षेत्रफल, खेल सामग्री, शौचालय, खानेपानी, CCTV',
    indicators: ['पार्क संख्या', 'हरियाली क्षेत्रफल', 'दैनिक आगन्तुक', 'बालमैत्री पार्क (%)'],
    fields: [
      { id: 'parkName', label: 'पार्कको नाम*', type: 'text', required: true },
      { id: 'areaSqMeters', label: 'कुल क्षेत्रफल (वर्ग मिटर)*', type: 'number', unit: 'वर्ग मिटर' },
      { id: 'hasChildrenPlayground', label: 'बाल उद्यान तथा खेल सामग्री उपलब्ध ?', type: 'boolean', defaultValue: true },
      { id: 'greeneryAreaPercent', label: 'हरियाली क्षेत्र प्रतिशत (%)', type: 'number', unit: '%' },
      { id: 'hasToilet', label: 'शौचालय सुविधा उपलब्ध ?', type: 'boolean', defaultValue: true },
      { id: 'hasDrinkingWater', label: 'पिउने पानी सुविधा उपलब्ध ?', type: 'boolean', defaultValue: true },
      { id: 'hasCctv', label: 'CCTV सुरक्षा क्यामेरा जडान ?', type: 'boolean', defaultValue: true },
      { id: 'dailyVisitorsCount', label: 'दैनिक औसत आगन्तुक संख्या', type: 'number', unit: 'जना' },
    ],
  },

  // २६. सिँचाइ कुलो
  {
    key: 26,
    category: 'कृषि',
    title: 'सिँचाइ कुलो पूर्वाधार',
    desc: 'GPS Line, कुल लम्बाइ, सिँचित क्षेत्रफल, लाभान्वित किसान',
    indicators: ['कुलो संख्या', 'कुल लम्बाइ', 'सिँचित क्षेत्रफल', 'लाभान्वित किसान', 'कृषि उत्पादन वृद्धि', 'सम्पत्ति अवस्था सूचकाङ्क'],
    fields: [
      { id: 'canalName', label: 'कुलोको नाम*', type: 'text', required: true },
      { id: 'lengthMeters', label: 'कुलोको कुल लम्बाइ (मिटर वा कि.मि.)*', type: 'number', unit: 'मिटर' },
      { id: 'waterSource', label: 'पानीको मुहान / स्रोत नदी', type: 'text' },
      { id: 'irrigatedAreaHectares', label: 'सिँचित कुल क्षेत्रफल (हेक्टर वा रोपनी)*', type: 'number', unit: 'रोपनी' },
      { id: 'beneficiaryFarmersCount', label: 'लाभान्वित किसान परिवार संख्या', type: 'number', unit: 'परिवार' },
      { id: 'canalCondition', label: 'कुलोको अवस्था (पक्की आरसीसी / पाइप / कच्ची)', type: 'select', options: [
        { label: 'आरसीसी पक्की कुलो', value: 'rcc' },
        { label: 'पाइपलाइन सिँचाइ', value: 'pipe' },
        { label: 'ढुङ्गा माटोको कच्ची कुलो', value: 'earthen' },
      ] },
      { id: 'assetCondition', label: '🟢🟡🔴 कुलोको संरचनागत अवस्था (Asset Condition)', type: 'select', options: [
        { label: '🟢 राम्रो — नियमित पानी बग्ने अवस्थामा', value: 'good' },
        { label: '🟡 सामान्य — केही ठाउँमा मर्मत आवश्यक', value: 'fair' },
        { label: '🔴 खराब — भत्किएको / पानी नबग्ने अवस्था', value: 'poor' },
      ] },
      { id: 'lastMaintenanceYear', label: 'अन्तिम मर्मत वर्ष (वि.सं.)', type: 'text', placeholder: '२०८०' },
      { id: 'maintenanceFundAvailable', label: 'के उपभोक्ता समितिको मर्मत कोष उपलब्ध छ ?', type: 'boolean', defaultValue: false },
    ],
  },

  // २७. विद्युत कालो तार विस्तार
  {
    key: 27,
    category: 'पूर्वाधार',
    title: 'विद्युत कालो तार (ABC Cable) विस्तार',
    desc: 'एबीसी केबल लम्बाइ, ट्रान्सफर्मर, पोल, सुरक्षित विद्युतीकरण',
    indicators: ['विद्युतीकरण प्रतिशत', 'नयाँ घरधुरी', 'विद्युत लाइन लम्बाइ', 'ट्रान्सफर्मर संख्या', 'सम्पत्ति अवस्था सूचकाङ्क'],
    fields: [
      { id: 'extensionLocation', label: 'विस्तार गरिएको स्थान / बस्ती*', type: 'text', required: true },
      { id: 'cableLengthKm', label: 'कालो तार (ABC Cable) विस्तार लम्बाइ (कि.मि.)*', type: 'number', unit: 'कि.मि.' },
      { id: 'transformersCount', label: 'जडान गरिएका ट्रान्सफर्मर संख्या', type: 'number', unit: 'वटा' },
      { id: 'polesCount', label: 'गाडिएका विद्युत पोल संख्या', type: 'number', unit: 'वटा' },
      { id: 'beneficiaryHouseholds', label: 'लाभान्वित नयाँ घरधुरी संख्या', type: 'number', unit: 'घर' },
      { id: 'assetCondition', label: '🟢🟡🔴 विद्युत लाइनको अवस्था (Asset Condition)', type: 'select', options: [
        { label: '🟢 राम्रो — नियमित विद्युत आपूर्ति, कुनै समस्या छैन', value: 'good' },
        { label: '🟡 सामान्य — केही पोल/तार मर्मत आवश्यक', value: 'fair' },
        { label: '🔴 खराब — बारम्बार विद्युत कटौती / ट्रान्सफर्मर जलेको', value: 'poor' },
      ] },
      { id: 'lastMaintenanceYear', label: 'अन्तिम मर्मत / निरीक्षण वर्ष (वि.सं.)', type: 'text', placeholder: '२०८०' },
      { id: 'maintenanceFundAvailable', label: 'के विद्युत प्राधिकरणसँग मर्मत सम्झौता छ ?', type: 'boolean', defaultValue: true },
    ],
  },

  // २८. ताल तथा पोखरी संरक्षण
  {
    key: 28,
    category: 'वातावरण',
    title: 'ताल तथा पोखरी संरक्षण (पवित्र पाँचपोखरी)',
    desc: 'पाँचपोखरी ५ वटै ताल, GPS Polygon, जैविक विविधता, ड्रोन फोटो',
    indicators: ['संरक्षण गरिएका ताल', 'क्षेत्रफल', 'पर्यटक संख्या', 'जैविक विविधता सूचक'],
    fields: [
      { id: 'lakeName', label: 'ताल / पोखरीको नाम*', type: 'text', required: true },
      { id: 'areaSqMeters', label: 'क्षेत्रफल (वर्ग मिटर)*', type: 'number', unit: 'वर्ग मिटर' },
      { id: 'conservationWorksDone', label: 'सम्पन्न गरिएका संरक्षण कार्यहरू', type: 'textarea' },
      { id: 'biodiversityStatus', label: 'जैविक विविधता तथा वन्यजन्तु अवस्था', type: 'text' },
      { id: 'tourismActivities', label: 'पर्यटकीय तथा धार्मिक गतिविधिहरू', type: 'text' },
      { id: 'dronePhotographed', label: 'ड्रोनबाट नक्साङ्कन तथा अनुगमन गरिएको ?', type: 'boolean', defaultValue: true },
    ],
  },

  // २९. प्राकृतिक तथा कृत्रिम झरना संरक्षण
  {
    key: 29,
    category: 'पर्यटन',
    title: 'प्राकृतिक तथा कृत्रिम झरना संरक्षण',
    desc: 'झरना उचाइ, पानीको मात्रा, सिँढी/रेलिङ, पर्यटक संख्या',
    indicators: ['झरना संख्या', 'संरक्षण भएका झरना', 'पर्यटक संख्या', 'पर्यटन आम्दानी'],
    fields: [
      { id: 'waterfallName', label: 'झरनाको नाम*', type: 'text', required: true },
      { id: 'waterfallType', label: 'झरनाको प्रकार', type: 'select', options: [
        { label: 'प्राकृतिक झरना (Natural Waterfall)', value: 'natural' },
        { label: 'कृत्रिम / व्यवस्थापन गरिएको झरना', value: 'artificial' },
      ] },
      { id: 'heightMeters', label: 'झरनाको उचाइ (मिटर)*', type: 'number', unit: 'मिटर' },
      { id: 'hasSafeTrailAndRailing', label: 'सुरक्षित सिँढी, रेलिङ तथा भ्युपोइन्ट निर्मित ?', type: 'boolean', defaultValue: true },
      { id: 'annualVisitorsCount', label: 'वार्षिक पर्यटक संख्या (जना)', type: 'number', unit: 'जना' },
    ],
  },

  // ३०. चिया बगान
  {
    key: 30,
    category: 'कृषि',
    title: 'चिया बगान (Tea Gardens)',
    desc: 'अग्र्यानिक चिया, GPS Polygon, क्षेत्रफल, उत्पादन, रोजगार',
    indicators: ['चिया क्षेत्रफल', 'उत्पादन', 'किसान संख्या', 'रोजगार', 'आम्दानी'],
    fields: [
      { id: 'gardenName', label: 'चिया बगानको नाम*', type: 'text', required: true },
      { id: 'areaHectares', label: 'बगानको कुल क्षेत्रफल (हेक्टर)*', type: 'number', unit: 'हेक्टर' },
      { id: 'farmerMembersCount', label: 'आवद्ध किसान संख्या', type: 'number', unit: 'जना' },
      { id: 'annualProductionKg', label: 'वार्षिक तयारी चिया उत्पादन (केजी)*', type: 'number', unit: 'केजी' },
      { id: 'hasProcessingCenter', label: 'स्थानीय प्रशोधन केन्द्र उपलब्ध ?', type: 'boolean', defaultValue: true },
      { id: 'jobsCreatedCount', label: 'सिर्जना भएको रोजगारी संख्या (जना)', type: 'number', unit: 'जना' },
      { id: 'isOrganicCertified', label: 'अग्र्यानिक प्रमाणीकरण भएको ?', type: 'boolean', defaultValue: true },
    ],
  },

  // ३१. कोसेली घर
  {
    key: 31,
    category: 'पर्यटन',
    title: 'कोसेली घर (Souvenir Houses)',
    desc: 'स्थानीय रैथाने उत्पादन, महिला समूह, वार्षिक बिक्री कारोबार',
    indicators: ['कोसेली घर संख्या', 'स्थानीय उत्पादन संख्या', 'महिला सहभागिता', 'वार्षिक कारोबार'],
    fields: [
      { id: 'houseName', label: 'कोसेली घरको नाम*', type: 'text', required: true },
      { id: 'operationalStatus', label: 'सञ्चालन अवस्था', type: 'select', options: [
        { label: 'नियमित सञ्चालनमा', value: 'regular' },
        { label: 'मौसमी सञ्चालनमा', value: 'seasonal' },
      ] },
      { id: 'localProductsList', label: 'प्रमुख रैथाने उत्पादनहरू', type: 'textarea', placeholder: 'उदा: अग्र्यानिक चिया, किबी जाम, चौंरी घ्यु, हस्तकला' },
      { id: 'womenGroupsCount', label: 'आवद्ध महिला समूह संख्या', type: 'number', unit: 'समूह' },
      { id: 'annualTurnoverNpr', label: 'वार्षिक कुल कारोबार (रु)', type: 'number', unit: 'रु' },
    ],
  },

  // ३२. माछा फार्म
  {
    key: 32,
    category: 'कृषि',
    title: 'माछा फार्म (Rainbow Trout Fisheries)',
    desc: 'रेन्बो ट्राउट, पोखरी संख्या, उत्पादन, किसान आम्दानी',
    indicators: ['माछा उत्पादन', 'माछा किसान', 'वार्षिक आम्दानी', 'उत्पादन वृद्धि'],
    fields: [
      { id: 'farmName', label: 'माछा फार्मको नाम*', type: 'text', required: true },
      { id: 'pondsCount', label: 'रेस्वे पोखरी संख्या*', type: 'number', unit: 'पोखरी' },
      { id: 'species', label: 'माछाको प्रजाति', type: 'text', defaultValue: 'रेन्बो ट्राउट (Rainbow Trout)' },
      { id: 'annualProductionKg', label: 'वार्षिक उत्पादन (केजी)*', type: 'number', unit: 'केजी' },
      { id: 'annualIncomeNpr', label: 'वार्षिक आम्दानी (रु)', type: 'number', unit: 'रु' },
      { id: 'productionGrowthPercent', label: 'उत्पादन वृद्धि प्रतिशत (%)', type: 'number', unit: '%' },
    ],
  },

  // ३३. वडा तथा पालिका भवन
  {
    key: 33,
    category: 'भवन',
    title: 'वडा तथा पालिका भवन (Municipal Buildings)',
    desc: 'प्रशासनिक भवन, तला, बैठक हल, सौर्य ऊर्जा, अपाङ्गमैत्री, CCTV',
    indicators: ['वडा भवन संख्या', 'पालिका भवन संख्या', 'डिजिटल सेवा उपलब्धता', 'CCTV जडान प्रतिशत', 'अपाङ्गमैत्री भवन', 'सेवा कक्ष संख्या', 'नागरिक सेवा क्षमता', 'डिजिटल पूर्वाधार सूचकाङ्क', 'सम्पत्ति अवस्था सूचकाङ्क'],
    fields: [
      { id: 'buildingName', label: 'भवनको नाम*', type: 'text', required: true },
      { id: 'buildingType', label: 'भवनको वर्गीकरण', type: 'select', options: [
        { label: 'पालिका केन्द्रीय प्रशासनिक भवन', value: 'palika_central' },
        { label: 'वडा कार्यालय प्रशासनिक भवन', value: 'ward_office' },
        { label: 'सेवा केन्द्र भवन', value: 'service_center' },
      ] },
      { id: 'floorAreaSqFt', label: 'भवनको कुल क्षेत्रफल (वर्ग फिट)*', type: 'number', unit: 'वर्ग फिट' },
      { id: 'storeysCount', label: 'तला संख्या (Storeys)', type: 'number', unit: 'तला' },
      { id: 'meetingHallCapacity', label: 'बैठक / सभा हल क्षमता (व्यक्ति)', type: 'number', unit: 'जना' },
      { id: 'serviceRoomsCount', label: 'नागरिक सेवा कक्ष संख्या', type: 'number', unit: 'कोठा' },
      { id: 'hasInternet', label: 'इन्टरनेट तथा डिजिटल सेवा उपलब्ध ?', type: 'boolean', defaultValue: true },
      { id: 'hasCctv', label: 'CCTV सुरक्षा निगरानी जडान ?', type: 'boolean', defaultValue: true },
      { id: 'hasSolarBackup', label: 'सौर्य ऊर्जा / ब्याकअप जडान ?', type: 'boolean', defaultValue: true },
      { id: 'isDisabilityFriendly', label: 'अपाङ्गमैत्री (र्याम्प/लिफ्ट) सुविधा ?', type: 'boolean', defaultValue: true },
      { id: 'parkingVehiclesCapacity', label: 'पार्किङ क्षमता (सवारी साधन संख्या)', type: 'number', unit: 'सवारी' },
      { id: 'assetCondition', label: '🟢🟡🔴 भवनको संरचनागत अवस्था (Asset Condition)', type: 'select', options: [
        { label: '🟢 राम्रो — पूर्ण प्रयोगयोग्य, सुरक्षित र सफा', value: 'good' },
        { label: '🟡 सामान्य — रंगरोगन / सामान्य मर्मत आवश्यक', value: 'fair' },
        { label: '🔴 खराब — संरचनागत क्षति, तत्काल मर्मत आवश्यक', value: 'poor' },
      ] },
      { id: 'constructionYear', label: 'भवन निर्माण वर्ष (वि.सं.)', type: 'text', placeholder: '२०७५' },
      { id: 'lastMaintenanceYear', label: 'अन्तिम मर्मत / रंगरोगन वर्ष (वि.सं.)', type: 'text', placeholder: '२०८०' },
      { id: 'estimatedRemainingLifeYears', label: 'अनुमानित बाँकी भवन आयु (वर्ष)', type: 'number', unit: 'वर्ष', placeholder: '25' },
    ],
  },
];
