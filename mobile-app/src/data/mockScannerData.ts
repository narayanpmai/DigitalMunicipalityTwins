import { ScannedDocument } from '../types';

// Helper to create realistic SVG document mock images as base64
const createSvgDoc = (title: string, subtitle: string, bodyText: string, stampColor = '#dc2626') => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="850" viewBox="0 0 600 850" style="background:#fcfbf7; border: 2px solid #e2e8f0; font-family:'Noto Sans Devanagari', sans-serif;">
    <!-- Government Header Crest -->
    <rect width="600" height="850" fill="#fcfbf7"/>
    <rect x="25" y="25" width="550" height="800" fill="none" stroke="#cbd5e1" stroke-width="2" stroke-dasharray="6,4"/>
    
    <!-- Header Emblem Circle -->
    <circle cx="300" cy="80" r="30" fill="#fee2e2" stroke="#dc2626" stroke-width="2"/>
    <text x="300" y="86" font-size="20" text-anchor="middle" fill="#dc2626">🇳🇵</text>
    
    <text x="300" y="130" font-size="16" font-weight="bold" text-anchor="middle" fill="#0f172a">नेपाल सरकार</text>
    <text x="300" y="152" font-size="14" font-weight="bold" text-anchor="middle" fill="#0369a1">${subtitle}</text>
    <text x="300" y="176" font-size="18" font-weight="900" text-anchor="middle" fill="#b91c1c">${title}</text>
    <line x1="120" y1="190" x2="480" y2="190" stroke="#b91c1c" stroke-width="2"/>

    <!-- Document Meta Box -->
    <rect x="50" y="215" width="500" height="60" fill="#f8fafc" stroke="#e2e8f0" rx="6"/>
    <text x="70" y="240" font-size="11" fill="#64748b">कागजात कोड: <tspan font-weight="bold" fill="#0f172a">PPK-DOC-2081/82</tspan></text>
    <text x="70" y="260" font-size="11" fill="#64748b">दर्ता मिति: <tspan font-weight="bold" fill="#0f172a">२०८१/०६/१५</tspan></text>
    <text x="340" y="240" font-size="11" fill="#64748b">वडा नं: <tspan font-weight="bold" fill="#0f172a">०३ (भोताङ)</tspan></text>
    <text x="340" y="260" font-size="11" fill="#64748b">प्रमाणीकरण स्थिति: <tspan font-weight="bold" fill="#16a34a">स्वीकृत / जारी</tspan></text>

    <!-- Document Content Lines -->
    <text x="50" y="320" font-size="12" fill="#334155" line-height="1.6">
      ${bodyText}
    </text>

    <!-- Stamp & Seal -->
    <g transform="translate(380, 680)">
      <circle cx="50" cy="50" r="45" fill="none" stroke="${stampColor}" stroke-width="2" stroke-dasharray="4,2"/>
      <circle cx="50" cy="50" r="38" fill="none" stroke="${stampColor}" stroke-width="1"/>
      <text x="50" y="45" font-size="9" font-weight="bold" text-anchor="middle" fill="${stampColor}">गाउँ कार्यपालिकाको कार्यालय</text>
      <text x="50" y="58" font-size="8" text-anchor="middle" fill="${stampColor}">पाँचपोखरी थाङपाल</text>
      <text x="50" y="70" font-size="7" font-weight="bold" text-anchor="middle" fill="${stampColor}">आधिकारिक छाप</text>
    </g>

    <!-- Signature Line -->
    <g transform="translate(80, 720)">
      <line x1="0" y1="0" x2="150" y2="0" stroke="#0f172a" stroke-width="1.5"/>
      <text x="75" y="16" font-size="10" text-anchor="middle" fill="#0f172a">हस्ताक्षर / वडा सचिव</text>
    </g>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const INITIAL_MOCK_DOCUMENTS: ScannedDocument[] = [
  {
    id: 'doc-1',
    title: 'नेपाली नागरिकता प्रमाणपत्र - राम बहादुर श्रेष्ठ',
    category: 'citizenship',
    categoryLabel: 'नागरिकता तथा परिचयपत्र',
    createdAt: '२०८१/०६/१२',
    updatedAt: '२०८१/०६/१२',
    tags: ['नागरिकता', 'परिचयपत्र', 'वडा ३'],
    notes: 'ई-सिफारिस तथा बैंकिङ्ग प्रयोजनका लागि स्क्यान गरिएको।',
    fileSizeKb: 340,
    ocrExtractedText: `नेपाल सरकार
गृह मन्त्रालय
जिल्ला प्रशासन कार्यालय, सिन्धुपाल्चोक

नागरिकता प्रमाणपत्र नं: २७-०१-७८-०४५२१
नाम: राम बहादुर श्रेष्ठ (Ram Bahadur Shrestha)
जन्म मिति: २०५२/०४/१५
स्थायी ठेगाना: पाँचपोखरी थाङपाल गाउँपालिका, वडा नं. ३
बाबुको नाम: हरि बहादुर श्रेष्ठ
आमाको नाम: सीता देवी श्रेष्ठ
जारी मिति: २०७०/०५/२२
जारी गर्ने अधिकारी: सहायक प्रमुख जिल्ला अधिकारी`,
    pages: [
      {
        id: 'p-1-1',
        pageNumber: 1,
        originalImageUrl: createSvgDoc(
          'नागरिकता प्रमाणपत्र (अघिल्लो भाग)',
          'जिल्ला प्रशासन कार्यालय, सिन्धुपाल्चोक',
          `<tspan x="50" dy="0">नागरिकता नं: २७-०१-७८-०४५२१</tspan>
           <tspan x="50" dy="25">नाम थर: राम बहादुर श्रेष्ठ</tspan>
           <tspan x="50" dy="25">जन्म मिति: २०५२ साल श्रावण १५ गते</tspan>
           <tspan x="50" dy="25">स्थायी ठेगाना: पाँचपोखरी थाङपाल गाउँपालिका वडा नं ३</tspan>
           <tspan x="50" dy="25">बाबुको नाम: हरि बहादुर श्रेष्ठ</tspan>
           <tspan x="50" dy="25">आमाको नाम: सीता देवी श्रेष्ठ</tspan>`
        ),
        processedImageUrl: createSvgDoc(
          'नागरिकता प्रमाणपत्र (अघिल्लो भाग)',
          'जिल्ला प्रशासन कार्यालय, सिन्धुपाल्चोक',
          `<tspan x="50" dy="0">नागरिकता नं: २७-०१-७८-०४५२१</tspan>
           <tspan x="50" dy="25">नाम थर: राम बहादुर श्रेष्ठ</tspan>
           <tspan x="50" dy="25">जन्म मिति: २०५२ साल श्रावण १५ गते</tspan>
           <tspan x="50" dy="25">स्थायी ठेगाना: पाँचपोखरी थाङपाल गाउँपालिका वडा नं ३</tspan>
           <tspan x="50" dy="25">बाबुको नाम: हरि बहादुर श्रेष्ठ</tspan>
           <tspan x="50" dy="25">आमाको नाम: सीता देवी श्रेष्ठ</tspan>`
        ),
        rotation: 0,
        filter: 'magic',
        brightness: 0,
        contrast: 15,
        ocrText: `नागरिकता प्रमाणपत्र नं: २७-०१-७८-०४५२१\nनाम: राम बहादुर श्रेष्ठ\nजन्म मिति: २०५२/०४/१५`,
      },
      {
        id: 'p-1-2',
        pageNumber: 2,
        originalImageUrl: createSvgDoc(
          'नागरिकता प्रमाणपत्र (पछिल्लो भाग)',
          'नागरिकता विवरण पृष्ठ',
          `<tspan x="50" dy="0">सनाखत गर्ने: वडा अध्यक्ष / सचिव</tspan>
           <tspan x="50" dy="25">जारी मिति: २०७०/०५/२२</tspan>
           <tspan x="50" dy="25">प्रशासनिक छाप तथा औंठाछाप प्रमाणित।</tspan>`
        ),
        processedImageUrl: createSvgDoc(
          'नागरिकता प्रमाणपत्र (पछिल्लो भाग)',
          'नागरिकता विवरण पृष्ठ',
          `<tspan x="50" dy="0">सनाखत गर्ने: वडा अध्यक्ष / सचिव</tspan>
           <tspan x="50" dy="25">जारी मिति: २०७०/०५/२२</tspan>
           <tspan x="50" dy="25">प्रशासनिक छाप तथा औंठाछाप प्रमाणित।</tspan>`
        ),
        rotation: 0,
        filter: 'bw',
        brightness: 5,
        contrast: 20,
      },
    ],
  },
  {
    id: 'doc-2',
    title: 'जग्गाधनी दर्ता प्रमाणपुर्जा (लालपुर्जा) - कित्ता नं ४५२',
    category: 'lalpurja',
    categoryLabel: 'जग्गाधनी प्रमाणपुर्जा (लालपुर्जा)',
    createdAt: '२०८१/०५/२८',
    updatedAt: '२०८१/०५/२८',
    tags: ['लालपुर्जा', 'कित्ता ४५२', 'जग्गा'],
    notes: 'सम्पत्ति कर भुक्तानी तथा बैंक प्रयोजन।',
    fileSizeKb: 480,
    ocrExtractedText: `नेपाल सरकार
भूमि व्यवस्था, सहकारी तथा गरिबी निवारण मन्त्रालय
मालपोत कार्यालय, सिन्धुपाल्चोक

जग्गाधनी दर्ता प्रमाणपुर्जा (लालपुर्जा)
जग्गाधनीको नाम: राम बहादुर श्रेष्ठ
बाबुको नाम: हरि बहादुर श्रेष्ठ
स्थानीय तह: पाँचपोखरी थाङपाल गाउँपालिका, वडा नं. ३
सिट नं.: १०२-०९३४
कित्ता नं.: ४५२
क्षेत्रफल: ०-८-२-१ (आठ आना दुई पैसा एक दाम)
किसिम: पाखो अब्बल`,
    pages: [
      {
        id: 'p-2-1',
        pageNumber: 1,
        originalImageUrl: createSvgDoc(
          'जग्गाधनी दर्ता प्रमाणपुर्जा',
          'मालपोत कार्यालय, सिन्धुपाल्चोक',
          `<tspan x="50" dy="0">जग्गाधनीको नाम: राम बहादुर श्रेष्ठ</tspan>
           <tspan x="50" dy="25">कित्ता नं: ४५२</tspan>
           <tspan x="50" dy="25">सिट नं: १०२-०९३४</tspan>
           <tspan x="50" dy="25">क्षेत्रफल: ०-८-२-१ (८ आना २ पैसा १ दाम)</tspan>
           <tspan x="50" dy="25">स्थान: पाँचपोखरी थाङपाल वडा नं ३</tspan>
           <tspan x="50" dy="25">कैफियत: हकदाबी नभएको दर्ता जग्गा</tspan>`
        ),
        processedImageUrl: createSvgDoc(
          'जग्गाधनी दर्ता प्रमाणपुर्जा',
          'मालपोत कार्यालय, सिन्धुपाल्चोक',
          `<tspan x="50" dy="0">जग्गाधनीको नाम: राम बहादुर श्रेष्ठ</tspan>
           <tspan x="50" dy="25">कित्ता नं: ४५२</tspan>
           <tspan x="50" dy="25">सिट नं: १०२-०९३४</tspan>
           <tspan x="50" dy="25">क्षेत्रफल: ०-८-२-१ (८ आना २ पैसा १ दाम)</tspan>
           <tspan x="50" dy="25">स्थान: पाँचपोखरी थाङपाल वडा नं ३</tspan>
           <tspan x="50" dy="25">कैफियत: हकदाबी नभएको दर्ता जग्गा</tspan>`
        ),
        rotation: 0,
        filter: 'magic',
        brightness: 0,
        contrast: 10,
        ocrText: `कित्ता नं: ४५२\nक्षेत्रफल: ०-८-२-१\nजग्गाधनी: राम बहादुर श्रेष्ठ`,
      },
    ],
  },
  {
    id: 'doc-3',
    title: 'नाता प्रमाणित सिफारिस पत्र (दर्ता नं ५६२)',
    category: 'sifarish',
    categoryLabel: 'ई-सिफारिस तथा नाता प्रमाणित',
    createdAt: '२०८१/०६/०५',
    updatedAt: '२०८१/०६/०५',
    tags: ['नाता प्रमाणित', 'सिफारिस', 'वडा कार्यालय'],
    notes: 'राहदानी आवेदनका लागि वडाबाट प्राप्त आधिकारिक सिफारिस।',
    fileSizeKb: 290,
    ocrExtractedText: `पाँचपोखरी थाङपाल गाउँपालिका
३ नं. वडा कार्यालय, भोताङ
पत्र संख्या: २०८१/०८२
चलानी नं.: ५६२
मिति: २०८१/०६/०५

विषय: नाता प्रमाणित सम्बन्धमा।
श्री जो जससँग सम्बन्ध छ।
प्रस्तुत विषयमा यस पाँचपोखरी थाङपाल गाउँपालिका वडा नं. ३ स्थायी ठेगाना भएका श्री राम बहादुर श्रेष्ठको निम्न अनुसारका व्यक्तिहरूसँग नाता सम्बन्ध कायम रहेको ब्यहोरा स्थानीय सर्जमिन मुचुल्का अनुसार प्रमाणित गरिन्छ।`,
    pages: [
      {
        id: 'p-3-1',
        pageNumber: 1,
        originalImageUrl: createSvgDoc(
          'नाता प्रमाणित सिफारिस पत्र',
          '३ नं. वडा कार्यालय, भोताङ',
          `<tspan x="50" dy="0">पत्र संख्या: २०८१/०८२</tspan>
           <tspan x="50" dy="25">चलानी नं: ५६२</tspan>
           <tspan x="50" dy="25">मिति: २०८१/०६/०५</tspan>
           <tspan x="50" dy="25">विषय: नाता प्रमाणित सिफारिस।</tspan>
           <tspan x="50" dy="25">आवेदक: राम बहादुर श्रेष्ठ</tspan>
           <tspan x="50" dy="25">सम्बन्ध: बाबु-छोरा नाता प्रमाणित गरिएको।</tspan>`
        ),
        processedImageUrl: createSvgDoc(
          'नाता प्रमाणित सिफारिस पत्र',
          '३ नं. वडा कार्यालय, भोताङ',
          `<tspan x="50" dy="0">पत्र संख्या: २०८१/०८२</tspan>
           <tspan x="50" dy="25">चलानी नं: ५६२</tspan>
           <tspan x="50" dy="25">मिति: २०८१/०६/०५</tspan>
           <tspan x="50" dy="25">विषय: नाता प्रमाणित सिफारिस।</tspan>
           <tspan x="50" dy="25">आवेदक: राम बहादुर श्रेष्ठ</tspan>
           <tspan x="50" dy="25">सम्बन्ध: बाबु-छोरा नाता प्रमाणित गरिएको।</tspan>`
        ),
        rotation: 0,
        filter: 'bw',
        brightness: 0,
        contrast: 10,
        ocrText: `चलानी नं: ५६२\nविषय: नाता प्रमाणित सिफारिस\nमिति: २०८१/०६/०५`,
      },
    ],
  },
  {
    id: 'doc-4',
    title: 'सम्पत्ति तथा व्यवसाय कर रसिद (मलेप फारम १०२)',
    category: 'tax_receipt',
    categoryLabel: 'कर तथा मालपोत रसिद',
    createdAt: '२०८१/०६/१०',
    updatedAt: '२०८१/०६/१०',
    tags: ['कर रसिद', 'सम्पत्ति कर', 'मलेप १०२'],
    notes: 'आ.व. २०८०/८१ को सम्पत्ति कर चुक्ता रसिद।',
    fileSizeKb: 215,
    ocrExtractedText: `पाँचपोखरी थाङपाल गाउँपालिका
राजस्व प्रशासन शाखा
म.ले.प. फारम नं. १०२ (डिजिटल रसिद)
रसिद नं.: PPK-REV-10492
करदाताको नाम: राम बहादुर श्रेष्ठ
कित्ता नं: ४५२
सम्पत्ति कर: रु. १,२००/-
सेवा शुल्क: रु. १००/-
जम्मा बुझाएको रकम: रु. १,३००/-
भुक्तानी माध्यम: eSewa Digital Wallet`,
    pages: [
      {
        id: 'p-4-1',
        pageNumber: 1,
        originalImageUrl: createSvgDoc(
          'सम्पत्ति कर चुक्ता रसिद (मलेप १०२)',
          'राजस्व प्रशासन शाखा, पाँचपोखरी',
          `<tspan x="50" dy="0">रसिद नं: PPK-REV-10492</tspan>
           <tspan x="50" dy="25">करदाता: राम बहादुर श्रेष्ठ</tspan>
           <tspan x="50" dy="25">कित्ता नं: ४५२</tspan>
           <tspan x="50" dy="25">सम्पत्ति कर: रु. १,२००/-</tspan>
           <tspan x="50" dy="25">जम्मा चुक्ता रकम: रु. १,३००/-</tspan>
           <tspan x="50" dy="25">भुक्तानी स्थिति: चुक्ता भएको (Paid)</tspan>`
        ),
        processedImageUrl: createSvgDoc(
          'सम्पत्ति कर चुक्ता रसिद (मलेप १०२)',
          'राजस्व प्रशासन शाखा, पाँचपोखरी',
          `<tspan x="50" dy="0">रसिद नं: PPK-REV-10492</tspan>
           <tspan x="50" dy="25">करदाता: राम बहादुर श्रेष्ठ</tspan>
           <tspan x="50" dy="25">कित्ता नं: ४५२</tspan>
           <tspan x="50" dy="25">सम्पत्ति कर: रु. १,२००/-</tspan>
           <tspan x="50" dy="25">जम्मा चुक्ता रकम: रु. १,३००/-</tspan>
           <tspan x="50" dy="25">भुक्तानी स्थिति: चुक्ता भएको (Paid)</tspan>`
        ),
        rotation: 0,
        filter: 'magic',
        brightness: 0,
        contrast: 15,
        ocrText: `रसिद नं: PPK-REV-10492\nजम्मा बुझाएको रकम: रु. १,३००/-`,
      },
    ],
  },
];
