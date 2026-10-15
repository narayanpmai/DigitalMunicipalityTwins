export interface MuseumArtifact {
  id: string;
  assetId: string;
  nameNp: string;
  nameEn: string;
  category: 'ऐतिहासिक कलाकृति' | 'धार्मिक ग्रन्थ' | 'संगीत तथा वाद्यवादन' | 'परम्परागत पोशाक' | 'दैनिक घरेलु औजार' | 'हस्तकला';
  era: string;
  material: string;
  origin: string;
  location: string;
  condition: 'उत्कृष्ट' | 'सामान्य राम्रो' | 'मर्मत आवश्यक';
  description: string;
  significance: string;
  imageUrl: string;
  audioDuration?: string;
  has3DModel?: boolean;
}

export interface HeritageDestination {
  id: string;
  code: string;
  nameNp: string;
  nameEn: string;
  category: 'धार्मिक तथा प्राकृतिक' | 'सांस्कृतिक सम्पदा' | 'साहसिक तथा भ्यू पोइन्ट' | 'ऐतिहासिक गढी';
  wardNo: number;
  altitudeMeters: number;
  bestSeason: string;
  trekDuration: string;
  highlights: string[];
  imageUrl: string;
  description: string;
  intro: string;
  audioGuideAvailable?: boolean;
  virtualTourUrl?: string;
  gisMapUrl?: string;
}

// ─── 1. CULTURAL MUSEUM ARTIFACTS (सांस्कृतिक सङ्ग्रहालय कलाकृतिहरू) ───
export const MOCK_MUSEUM_ARTIFACTS: MuseumArtifact[] = [
  {
    id: 'mus-01',
    assetId: 'MUS-P5-001',
    nameNp: 'गुरु पद्मसम्भव अष्टधातु मूर्ति',
    nameEn: 'Guru Padmasambhava Ashtadhatu Idol',
    category: 'ऐतिहासिक कलाकृति',
    era: '८औं शताब्दी (१,२०० वर्ष पुरानो)',
    material: 'अष्टधातु (Eight Sacred Metals)',
    origin: 'तार्केघ्याङ प्राचीन गुम्बा भण्डार',
    location: 'ह्योल्मो सांस्कृतिक सङ्ग्रहालय, तार्केघ्याङ (वडा ३)',
    condition: 'उत्कृष्ट',
    description: 'आठौं शताब्दीमा ह्योल्मो भूमिमा धर्म प्रचार र ध्यान गर्दा निर्माण गरिएको मानिने प्राचीन अष्टधातुको ध्यानस्थ मूर्ति।',
    significance: 'गुम्बामा विशेष पूजा तथा अभिषेक अनुष्ठानमा मात्र सर्वसाधारणलाई दर्शन गराइने अत्यन्त दुर्लभ र ऐतिहासिक सम्पदा।',
    imageUrl: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=600&q=80',
    audioDuration: '२:४५ मिनेट',
    has3DModel: true,
  },
  {
    id: 'mus-02',
    assetId: 'MUS-P5-002',
    nameNp: 'सुनौलो अक्षरले लेखिएको प्रज्ञापारमिता ग्रन्थ',
    nameEn: 'Gold-Inscribed Prajnaparamita Scripture',
    category: 'धार्मिक ग्रन्थ',
    era: '१६औं शताब्दी (करिब ४५० वर्ष पुरानो)',
    material: 'हिमाली लोक्ता कागज, शुद्ध सुनको मसी, काठको बुट्टेदार गाता',
    origin: 'तार्केघ्याङ प्राचीन गुम्बा',
    location: 'ह्योल्मो सांस्कृतिक सङ्ग्रहालय, तार्केघ्याङ',
    condition: 'सामान्य राम्रो',
    description: 'परम्परागत हिमाली लोक्ता कागजमा शुद्ध सुनको मसीले रञ्जना र तिब्बती लिपिमा हातले लेखिएको दुर्लभ ग्रन्थ।',
    significance: 'बौद्ध दर्शनको मूल सिद्धान्त प्रज्ञापारमिताको अध्ययन र वार्षिक लोप्चो पूजामा पाठ गरिने पवित्र ग्रन्थ।',
    imageUrl: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777d?w=600&q=80',
    audioDuration: '३:१० मिनेट',
    has3DModel: true,
  },
  {
    id: 'mus-03',
    assetId: 'MUS-P5-003',
    nameNp: 'परम्परागत ह्योल्मो ग्यालिङ (धार्मिक बाजा)',
    nameEn: 'Traditional Gyaling Wind Instrument',
    category: 'संगीत तथा वाद्यवादन',
    era: '१९औं शताब्दी',
    material: 'काठ, पित्तल र चाँदीको जलप',
    origin: 'ह्योल्मो समुदाय, वडा ३',
    location: 'ह्योल्मो सांस्कृतिक सङ्ग्रहालय, तार्केघ्याङ',
    condition: 'उत्कृष्ट',
    description: 'बौद्ध धार्मिक अनुष्ठान र लामा नृत्य (छाम) मा बजाइने पित्तल र चाँदीको बुट्टा कुँदिएको परम्परागत सहनाई-बाजा।',
    significance: 'दैनिक गुम्बा पूजा तथा धार्मिक उत्सवमा मधुर ध्वनि अर्पण गर्न र शान्तिको सन्देश फैलाउन प्रयोग गरिन्छ।',
    imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&q=80',
    audioDuration: '१:५० मिनेट',
    has3DModel: false,
  },
  {
    id: 'mus-04',
    assetId: 'MUS-P5-004',
    nameNp: 'लामो धार्मिक काँसको बाजा (डुङ्छेन)',
    nameEn: 'Traditional Dungchen Alpine Horn',
    category: 'संगीत तथा वाद्यवादन',
    era: '१९औं शताब्दी',
    material: 'तामा र पित्तल (३ मिटर टेलिस्कोपिक)',
    origin: 'भोताङ बौद्ध गुम्बा (वडा ७)',
    location: 'ह्योल्मो सांस्कृतिक सङ्ग्रहालय, तार्केघ्याङ',
    condition: 'सामान्य राम्रो',
    description: '३ मिटर लामो तामा र पित्तलले बनेको बाजा, जसको गम्भीर ध्वनिले हिमाली उपत्यकामा परसम्म गुञ्जन गर्दछ।',
    significance: 'उच्च लामाहरूको स्वागत, महापूजा र नयाँ वर्ष (ल्होसार) को आरम्भमा ध्वनि तरङ्ग फैलाउन प्रयोग।',
    imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=80',
    audioDuration: '२:०५ मिनेट',
    has3DModel: true,
  },
  {
    id: 'mus-05',
    assetId: 'MUS-P5-005',
    nameNp: 'परम्परागत ह्योल्मो महिला पोशाक (स्यामा र बख्खु)',
    nameEn: 'Traditional Hyolmo Women Attire (Syama)',
    category: 'परम्परागत पोशाक',
    era: '२०औं शताब्दी प्रारम्भ',
    material: 'शुद्ध भेडाको ऊन, कपास र प्राकृतिक वनस्पति रङ',
    origin: 'बरुवा तथा तार्केघ्याङ',
    location: 'ह्योल्मो सांस्कृतिक सङ्ग्रहालय, तार्केघ्याङ',
    condition: 'उत्कृष्ट',
    description: 'भेडाको ऊन र प्राकृतिक रङबाट हातले बुनेको परम्परागत रंगीन पाटा भएको ह्योल्मो महिलाहरूको औपचारिक पोशाक।',
    significance: 'ह्योल्मो जातिको विशिष्ट मौलिक सांस्कृतिक पहिचान, परम्परागत विवाह र चाडपर्वमा अनिवार्य मानिने भेषभूषा।',
    imageUrl: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=600&q=80',
    audioDuration: '२:१५ मिनेट',
    has3DModel: false,
  },
  {
    id: 'mus-06',
    assetId: 'MUS-P5-006',
    nameNp: 'ह्योल्मो चाँदीको कण्ठहार तथा गाउ (Amulet Box)',
    nameEn: 'Silver Amulet Box Gau Necklace',
    category: 'परम्परागत पोशाक',
    era: '१९औं शताब्दी',
    material: 'शुद्ध चाँदी, फिरोजा (टर्क्वाइज), रातो मुगा',
    origin: 'तार्केघ्याङ ह्योल्मो परिवार',
    location: 'ह्योल्मो सांस्कृतिक सङ्ग्रहालय, तार्केघ्याङ',
    condition: 'उत्कृष्ट',
    description: 'महिलाहरूले गलामा लगाउने कलात्मक चाँदीको बट्टा (गाउ) जसमा पवित्र मन्त्र र लामाको प्रसाद राखिन्छ।',
    significance: 'नकारात्मक ऊर्जाबाट रक्षा गर्न र धार्मिक पहिचानका लागि लगाइने पुर्ख्यौली गहना।',
    imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80',
    audioDuration: '१:४० मिनेट',
    has3DModel: true,
  },
  {
    id: 'mus-07',
    assetId: 'MUS-P5-007',
    nameNp: 'प्राचीन काठको घ्यु-मन्थन ठेकी (डाङ्गो)',
    nameEn: 'Antique Yak Milk Churner (Dango)',
    category: 'दैनिक घरेलु औजार',
    era: '१९औं शताब्दी अन्त्य',
    material: 'ओखरको काठ, बाँसको कसिलो चोया',
    origin: 'लागार्छे याक खर्क (वडा ८)',
    location: 'ह्योल्मो सांस्कृतिक सङ्ग्रहालय, तार्केघ्याङ',
    condition: 'उत्कृष्ट',
    description: 'लेकाली चौंरीको दुधबाट घ्यु र मोही बनाउन प्रयोग गरिने काठ र बाँसको चोयाले कसिलो गरी बाँधिएको परम्परागत भाँडो।',
    significance: 'उच्च हिमाली भेगमा पुर्खौंदेखि चल्दै आएको चौंरीपालन र परम्परागत हिमाली डेरी संस्कृतिको प्रतीक।',
    imageUrl: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=600&q=80',
    audioDuration: '१:३० मिनेट',
    has3DModel: false,
  },
  {
    id: 'mus-08',
    assetId: 'MUS-P5-008',
    nameNp: 'प्राकृतिक वनस्पति रङको मण्डल थाङ्का',
    nameEn: 'Natural Pigment Mandala Thangka',
    category: 'हस्तकला',
    era: '१९औं शताब्दी अन्त्य',
    material: 'सुती कपडा, सुनको जलप र प्राकृतिक खनिज रङ',
    origin: 'ह्योल्मो बौद्ध गुम्बा (वडा ३)',
    location: 'ह्योल्मो सांस्कृतिक सङ्ग्रहालय, तार्केघ्याङ',
    condition: 'सामान्य राम्रो',
    description: 'सुती कपडामा वनस्पति र खनिज रङ प्रयोग गरी बनाइएको कालचक्र मण्डल थाङ्का।',
    significance: 'ध्यान केन्द्रित गर्न, ब्रह्माण्डको संरचना बुझ्न र गुम्बाको मण्डप सजावटमा प्रयोग गरिने अद्वितीय कला।',
    imageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&q=80',
    audioDuration: '२:३० मिनेट',
    has3DModel: true,
  },
];

// ─── 2. TOURISM & HERITAGE DESTINATIONS (पर्यटन तथा सम्पदा डिजिटल ट्विन) ───
export const MOCK_HERITAGE_DESTINATIONS: HeritageDestination[] = [
  {
    id: 'dest-01',
    code: 'HER-W03-001',
    nameNp: 'पाँचपोखरी पावन कुण्डहरू (Panchpokhari Sacred Lakes)',
    nameEn: 'Panchpokhari Sacred Lakes',
    category: 'धार्मिक तथा प्राकृतिक',
    wardNo: 3,
    altitudeMeters: 4100,
    bestSeason: 'भदौ - कात्तिक, चैत - जेठ',
    trekDuration: '४ देखि ६ दिन',
    highlights: ['५ वटा पवित्र हिमताल', 'जुगल हिमाल हिमशृङ्खला', 'जनैपूर्णिमा भव्य मेला', 'अविस्मरणीय सूर्योदय'],
    imageUrl: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80',
    description: 'विश्वकै ९ औं अग्लो स्थानमा अवस्थित ५ वटा पवित्र कुण्डहरू (सूर्य, भैरव, नाग, सरस्वती र गणेश कुण्ड)।',
    intro: 'समुद्र सतहबाट ४,१०० मिटर उचाइमा रहेको यो स्थल हिन्दु र बौद्ध दुवै धर्मावलम्बीको साझा पवित्र तीर्थस्थल हो। जुगल हिमालको काखमा अवस्थित पाँच तालहरूको दर्शनले मनमा शान्ति र पुण्य प्राप्ति हुने जनविश्वास छ।',
    audioGuideAvailable: true,
    virtualTourUrl: 'http://localhost:8080/app/gis-map?route=panchpokhari',
    gisMapUrl: 'http://localhost:8080/app/gis-map?route=panchpokhari',
  },
  {
    id: 'dest-02',
    code: 'HER-W02-001',
    nameNp: 'आमायाङ्ग्री चुचुरो तथा छोर्तेन (Ama Yangri Peak)',
    nameEn: 'Ama Yangri Peak & Chhorten',
    category: 'साहसिक तथा भ्यू पोइन्ट',
    wardNo: 2,
    altitudeMeters: 3771,
    bestSeason: 'असोज - मंसिर, फागुन - वैशाख',
    trekDuration: '२ देखि ३ दिन',
    highlights: ['३६० डिग्री हिमशृङ्खला', 'आमायाङ्ग्री छोर्तेन', 'ह्योल्मो संस्कृति', 'लालीगुराँस वन'],
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80',
    description: 'ह्योल्मो समुदायकी रक्षक देवी आमायाङ्ग्रीको पवित्र चुचुरो र प्राचीन छोर्तेन।',
    intro: 'यहाँबाट लाङटाङ, जुगल, गणेश, दोर्जे लाक्पा र गौरीशंकर हिमालको ३६० डिग्री मनमोहक दृश्य देखिन्छ। बिहानीपखको सूर्योदय हेर्न हजारौं पर्यटक यहाँ पुग्दछन्।',
    audioGuideAvailable: true,
    virtualTourUrl: 'http://localhost:8080/app/gis-map?route=amayangri',
    gisMapUrl: 'http://localhost:8080/app/gis-map?route=amayangri',
  },
  {
    id: 'dest-03',
    code: 'HER-W03-002',
    nameNp: 'तार्केघ्याङ प्राचीन सम्पदा बस्ती तथा गुम्बा',
    nameEn: 'Tarkeghyang Heritage Village',
    category: 'सांस्कृतिक सम्पदा',
    wardNo: 3,
    altitudeMeters: 2600,
    bestSeason: 'बाह्रै महिना',
    trekDuration: 'सडकमार्ग / १ दिन',
    highlights: ['ऐतिहासिक छ्योइलिङ गुम्बा', 'ह्योल्मो संस्कृति र भेषभूषा', 'सामुदायिक होमस्टे', 'अर्गानिक स्याउ र किबी'],
    imageUrl: 'https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=800&q=80',
    description: 'ह्योल्मो संस्कृतिको केन्द्रविन्दु, ढुङ्गाका सुन्दर परम्परागत घरहरू र ३०० वर्ष पुरानो गुम्बा।',
    intro: 'तार्केघ्याङ ह्योल्मो समुदायको मुटु मानिन्छ। परम्परागत बौद्ध गुम्बा, ऐतिहासिक ध्यान केन्द्र र आतिथ्यपूर्ण शेर्पा-ह्योल्मो होमस्टेले यहाँ पुग्ने जो कोहीलाई मन्त्रमुग्ध बनाउँछ।',
    audioGuideAvailable: true,
    virtualTourUrl: 'http://localhost:8080/app/library',
  },
  {
    id: 'dest-04',
    code: 'HER-W03-003',
    nameNp: 'गुरु पद्मसम्भव ध्यान गुफा (ड्रागन केभ)',
    nameEn: 'Padmasambhava Meditation Cave',
    category: 'धार्मिक तथा प्राकृतिक',
    wardNo: 3,
    altitudeMeters: 3250,
    bestSeason: 'असोज - जेठ',
    trekDuration: '१ दिन (तार्केघ्याङबाट)',
    highlights: ['प्राचीन ध्यान गुफा', 'प्राकृतिक प्रस्तर बज्र चिन्ह', 'शान्त साधना केन्द्र'],
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80',
    description: 'आठौं शताब्दीमा बौद्ध धर्मगुरु पद्मसम्भव (गुरु रिन्पोछे) ले ध्यान गरेको मानिने पवित्र गुफा।',
    intro: 'गुफाभित्र प्राकृतिक चट्टानमा बज्र, शंख र विभिन्न धार्मिक चिन्हका आकृतिहरू प्रस्तरमा कुँदिएका भेटिन्छन्। अन्तर्राष्ट्रिय बौद्ध तीर्थयात्रीहरूका लागि यो एक प्रमुख गन्तव्य हो।',
    audioGuideAvailable: true,
    virtualTourUrl: 'http://localhost:8080/app/library',
  },
  {
    id: 'dest-05',
    code: 'HER-W04-001',
    nameNp: 'छिमिटि पवित्र झरना तथा क्यानोनिङ स्पट',
    nameEn: 'Chhimiti Waterfall & Canyoning',
    category: 'साहसिक तथा भ्यू पोइन्ट',
    wardNo: 4,
    altitudeMeters: 1850,
    bestSeason: 'असोज - जेठ',
    trekDuration: 'आधा दिन',
    highlights: ['१०० मिटर प्राकृतिक झरना', 'साहसिक क्यानोनिङ खेल', 'पवित्र नागथान', 'हरियाली जंगल'],
    imageUrl: 'https://images.unsplash.com/photo-1511497584788-87676104235f?w=800&q=80',
    description: '१०० मिटर भन्दा अग्लो आकर्षक प्राकृतिक झरना र फेदीमा रहेको पवित्र नागथान।',
    intro: 'छिमिटि झरना साहसिक खेल क्यानोनिङका लागि नेपालकै उत्कृष्ट प्राकृतिक स्पटहरूमध्ये एक हो। झरनाको चिसो पानी र वरिपरिको हरियालीले मन लोभ्याउँछ।',
    audioGuideAvailable: false,
    virtualTourUrl: 'http://localhost:8080/app/library',
  },
  {
    id: 'dest-06',
    code: 'HER-W06-001',
    nameNp: 'ऐतिहासिक थाङपालकोट गढी तथा पुरानो दरबार',
    nameEn: 'Thangpalkot Historical Fort & Haveli',
    category: 'ऐतिहासिक गढी',
    wardNo: 6,
    altitudeMeters: 2150,
    bestSeason: 'बाह्रै महिना',
    trekDuration: '१ दिन',
    highlights: ['ऐतिहासिक ढुङ्गे किल्ला', 'तोप स्थल', 'नेपाल एकीकरण इतिहास', 'हवेली वास्तुकला'],
    imageUrl: 'https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?w=800&q=80',
    description: 'मल्लकालीन र बाइसे-चौबिसे कालको सामरिक सुरक्षा गढी र ऐतिहासिक रैथाने हवेली।',
    intro: 'नेपाल एकीकरणको इतिहाससँग जोडिएको सिन्धुपाल्चोकको एक महत्वपूर्ण ऐतिहासिक स्थल। यहाँबाट वरिपरिका पाँचवटै डाँडाकाडा र मेलम्ची उपत्यकाको सुरक्षा निगरानी गरिन्थ्यो।',
    audioGuideAvailable: true,
    virtualTourUrl: 'http://localhost:8080/app/library',
  },
];
