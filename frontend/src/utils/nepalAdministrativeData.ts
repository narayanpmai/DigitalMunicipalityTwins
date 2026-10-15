/**
 * Nepal Administrative Structure (नेपालको प्रशासनिक विभाजन)
 * 7 Provinces, 77 Districts, Municipalities, and Wards in standard Nepali.
 */

export interface WardOption {
  id: number;
  label: string;
}

export interface PalikaOption {
  name: string;
  totalWards?: number;
  customWards?: WardOption[];
}

export interface DistrictOption {
  name: string;
  palikas: PalikaOption[];
}

export interface ProvinceOption {
  name: string;
  districts: DistrictOption[];
}

export const PANCHPOKHARI_WARDS: WardOption[] = [
  { id: 1, label: 'वडा नं. १ (बाँसखर्क)' },
  { id: 2, label: 'वडा नं. २ (बरुवा)' },
  { id: 3, label: 'वडा नं. ३ (भोताङ)' },
  { id: 4, label: 'वडा नं. ४ (थाङपालकोट)' },
  { id: 5, label: 'वडा नं. ५ (गुन्सा)' },
  { id: 6, label: 'वडा नं. ६ (थाङपालधाप)' },
  { id: 7, label: 'वडा नं. ७ (तिपेनी)' },
  { id: 8, label: 'वडा नं. ८ (लागर्चे)' },
];

export const NEPAL_ADMIN_STRUCTURE: ProvinceOption[] = [
  {
    "name": "कोशी प्रदेश",
    "districts": [
      {
        "name": "मोरङ",
        "palikas": [
          {
            "name": "विराटनगर",
            "totalWards": 19
          },
          {
            "name": "लेटाङ",
            "totalWards": 9
          },
          {
            "name": "सुनवर्शी",
            "totalWards": 9
          },
          {
            "name": "रंगेली",
            "totalWards": 9
          },
          {
            "name": "पथरी शनिश्चरे",
            "totalWards": 14
          },
          {
            "name": "उरालाबारी",
            "totalWards": 9
          },
          {
            "name": "बेलबारी",
            "totalWards": 11
          },
          {
            "name": "सुन्दरहरैचा",
            "totalWards": 12
          },
          {
            "name": "रतुवामाई",
            "totalWards": 10
          },
          {
            "name": "जहादा",
            "totalWards": 7
          },
          {
            "name": "कटहरी",
            "totalWards": 7
          },
          {
            "name": "ग्रामथान",
            "totalWards": 7
          },
          {
            "name": "धनपालथान",
            "totalWards": 7
          },
          {
            "name": "केराबारी",
            "totalWards": 10
          },
          {
            "name": "बुढीगंगा",
            "totalWards": 9
          },
          {
            "name": "कानेपोखरी",
            "totalWards": 7
          },
          {
            "name": "मिक्लाजुङ",
            "totalWards": 9
          }
        ]
      },
      {
        "name": "सुनसरी",
        "palikas": [
          {
            "name": "धरान",
            "totalWards": 20
          },
          {
            "name": "इटहरी",
            "totalWards": 20
          },
          {
            "name": "रामधुनी",
            "totalWards": 9
          },
          {
            "name": "बराहक्षेत्र",
            "totalWards": 11
          },
          {
            "name": "दुहबी",
            "totalWards": 12
          },
          {
            "name": "इनरुवा",
            "totalWards": 10
          },
          {
            "name": "गढी",
            "totalWards": 6
          },
          {
            "name": "कोशी",
            "totalWards": 8
          },
          {
            "name": "बर्जु",
            "totalWards": 6
          },
          {
            "name": "हरिनगर",
            "totalWards": 7
          },
          {
            "name": "देवानगन्ज",
            "totalWards": 7
          },
          {
            "name": "भोक्राहा नरसिङ्ग",
            "totalWards": 8
          }
        ]
      },
      {
        "name": "ताप्लेजुङ",
        "palikas": [
          {
            "name": "फुङ्लिङ",
            "totalWards": 11
          },
          {
            "name": "सिडिङबा",
            "totalWards": 7
          },
          {
            "name": "Meringden",
            "totalWards": 6
          },
          {
            "name": "माइवाखोला",
            "totalWards": 6
          },
          {
            "name": "फाक्ताङलुङ",
            "totalWards": 7
          },
          {
            "name": "सिरिजाङ्घा",
            "totalWards": 8
          },
          {
            "name": "मिक्वाखोला",
            "totalWards": 5
          },
          {
            "name": "आठराई त्रिवेणी",
            "totalWards": 5
          },
          {
            "name": "पाथिवरा यांगवारक",
            "totalWards": 6
          }
        ]
      },
      {
        "name": "संखुवासभा",
        "palikas": [
          {
            "name": "धर्मदेवी",
            "totalWards": 9
          },
          {
            "name": "माडी",
            "totalWards": 9
          },
          {
            "name": "पञ्चखापन",
            "totalWards": 9
          },
          {
            "name": "चैनपुर",
            "totalWards": 11
          },
          {
            "name": "खाँदबारी",
            "totalWards": 11
          },
          {
            "name": "मकालु",
            "totalWards": 6
          },
          {
            "name": "चिचिला",
            "totalWards": 5
          },
          {
            "name": "सिलिचङ",
            "totalWards": 5
          },
          {
            "name": "भोटखोला",
            "totalWards": 5
          },
          {
            "name": "सभापोखरी",
            "totalWards": 6
          }
        ]
      },
      {
        "name": "सोलुखुम्बु",
        "palikas": [
          {
            "name": "सोलुदुधाकुण्ड",
            "totalWards": 10
          },
          {
            "name": "सोटाङ",
            "totalWards": 5
          },
          {
            "name": "महाकुलुङ",
            "totalWards": 5
          },
          {
            "name": "लिखुपिके",
            "totalWards": 5
          },
          {
            "name": "नेचासल्यान",
            "totalWards": 6
          },
          {
            "name": "थुलुङ दुधकोशी",
            "totalWards": 7
          },
          {
            "name": "माप्या दुधकोशी",
            "totalWards": 7
          },
          {
            "name": "खुम्बुपसङ्लाहमु",
            "totalWards": 5
          }
        ]
      },
      {
        "name": "ओखलढुङ्गा",
        "palikas": [
          {
            "name": "सिद्धिचरण",
            "totalWards": 12
          },
          {
            "name": "लिखु",
            "totalWards": 9
          },
          {
            "name": "मोलुङ",
            "totalWards": 8
          },
          {
            "name": "सुनकोशी",
            "totalWards": 10
          },
          {
            "name": "चम्पादेवी",
            "totalWards": 10
          },
          {
            "name": "चिसंखुगढी",
            "totalWards": 8
          },
          {
            "name": "खिजिदेम्बा",
            "totalWards": 9
          },
          {
            "name": "मानेभञ्ज्याङ",
            "totalWards": 9
          }
        ]
      },
      {
        "name": "खोटाङ",
        "palikas": [
          {
            "name": "हलेसी तुवाचुङ",
            "totalWards": 11
          },
          {
            "name": "दिक्तेल रुपाकोट मझुवागढी",
            "totalWards": 15
          },
          {
            "name": "साकेला",
            "totalWards": 5
          },
          {
            "name": "खोटेहाङ",
            "totalWards": 9
          },
          {
            "name": "बराहापोखरी",
            "totalWards": 6
          },
          {
            "name": "ऐसेलुखर्क",
            "totalWards": 7
          },
          {
            "name": "रवा बेसी",
            "totalWards": 9
          },
          {
            "name": "केपिलासगढी",
            "totalWards": 7
          },
          {
            "name": "जानतेढुङ्गा",
            "totalWards": 6
          },
          {
            "name": "डिप्रुङ",
            "totalWards": 7
          }
        ]
      },
      {
        "name": "भोजपुर",
        "palikas": [
          {
            "name": "षडानन्द",
            "totalWards": 14
          },
          {
            "name": "भोजपुर",
            "totalWards": 12
          },
          {
            "name": "अरुण",
            "totalWards": 7
          },
          {
            "name": "आमचोक",
            "totalWards": 10
          },
          {
            "name": "हतुवागढी",
            "totalWards": 9
          },
          {
            "name": "पौवाडुङ्मा",
            "totalWards": 6
          },
          {
            "name": "टेम्केमाइयुङ",
            "totalWards": 9
          },
          {
            "name": "सालपसिलिछो",
            "totalWards": 6
          },
          {
            "name": "रामप्रसाद",
            "totalWards": 8
          }
        ]
      },
      {
        "name": "धनकुटा",
        "palikas": [
          {
            "name": "पाखरिबास",
            "totalWards": 10
          },
          {
            "name": "महालक्ष्मी",
            "totalWards": 9
          },
          {
            "name": "धनकुटा",
            "totalWards": 10
          },
          {
            "name": "चौबिसे",
            "totalWards": 8
          },
          {
            "name": "शहिदभूमि",
            "totalWards": 7
          },
          {
            "name": "साँगुरीगढी",
            "totalWards": 10
          },
          {
            "name": "छथर जोरपाटी",
            "totalWards": 6
          }
        ]
      },
      {
        "name": "तेह्रथुम",
        "palikas": [
          {
            "name": "लालीगुराँस",
            "totalWards": 9
          },
          {
            "name": "म्याङलुङ",
            "totalWards": 10
          },
          {
            "name": "छथर",
            "totalWards": 6
          },
          {
            "name": "फेडाप",
            "totalWards": 5
          },
          {
            "name": "आठराई",
            "totalWards": 7
          },
          {
            "name": "मेन्चायम",
            "totalWards": 6
          }
        ]
      },
      {
        "name": "पाँचथर",
        "palikas": [
          {
            "name": "फिदिम",
            "totalWards": 14
          },
          {
            "name": "याङ्गवारक",
            "totalWards": 9
          },
          {
            "name": "हिलिहाङ",
            "totalWards": 9
          },
          {
            "name": "फालेलुङ",
            "totalWards": 9
          },
          {
            "name": "तुम्बेवा",
            "totalWards": 9
          },
          {
            "name": "कुमायक",
            "totalWards": 9
          },
          {
            "name": "मिक्लाजुङ",
            "totalWards": 9
          },
          {
            "name": "फाल्गुनन्द",
            "totalWards": 9
          }
        ]
      },
      {
        "name": "इलाम",
        "palikas": [
          {
            "name": "इलाम",
            "totalWards": 12
          },
          {
            "name": "माई",
            "totalWards": 10
          },
          {
            "name": "देउमाई",
            "totalWards": 9
          },
          {
            "name": "सूर्योदय",
            "totalWards": 14
          },
          {
            "name": "रोङ",
            "totalWards": 6
          },
          {
            "name": "मङ्गेबुङ",
            "totalWards": 6
          },
          {
            "name": "चुलाचुली",
            "totalWards": 6
          },
          {
            "name": "सन्दकपुर",
            "totalWards": 5
          },
          {
            "name": "फाकफोक्थुम",
            "totalWards": 7
          },
          {
            "name": "माइजोगमाई",
            "totalWards": 6
          }
        ]
      },
      {
        "name": "झापा",
        "palikas": [
          {
            "name": "शिवसताक्सी",
            "totalWards": 11
          },
          {
            "name": "भद्रपुर",
            "totalWards": 10
          },
          {
            "name": "कनकाई",
            "totalWards": 9
          },
          {
            "name": "बिर्तामोड",
            "totalWards": 10
          },
          {
            "name": "मेचीनगर",
            "totalWards": 15
          },
          {
            "name": "दमक",
            "totalWards": 10
          },
          {
            "name": "अर्जुनधारा",
            "totalWards": 11
          },
          {
            "name": "गौराधा",
            "totalWards": 9
          },
          {
            "name": "कमल",
            "totalWards": 7
          },
          {
            "name": "झापा",
            "totalWards": 7
          },
          {
            "name": "कचनकवल",
            "totalWards": 7
          },
          {
            "name": "गौरीगञ्ज",
            "totalWards": 6
          },
          {
            "name": "बाह्रदशी",
            "totalWards": 7
          },
          {
            "name": "हल्दिबारी",
            "totalWards": 5
          },
          {
            "name": "बुद्धशान्ति",
            "totalWards": 7
          }
        ]
      },
      {
        "name": "उदयपुर",
        "palikas": [
          {
            "name": "त्रियुग",
            "totalWards": 16
          },
          {
            "name": "कटारी",
            "totalWards": 14
          },
          {
            "name": "चौदण्डीगढी",
            "totalWards": 10
          },
          {
            "name": "बेलका",
            "totalWards": 9
          },
          {
            "name": "तापली",
            "totalWards": 5
          },
          {
            "name": "रौतामाई",
            "totalWards": 8
          },
          {
            "name": "उदयपुरगढी",
            "totalWards": 8
          },
          {
            "name": "लिम्चुङबुङ",
            "totalWards": 9
          }
        ]
      }
    ]
  },
  {
    "name": "मधेश प्रदेश",
    "districts": [
      {
        "name": "पर्सा",
        "palikas": [
          {
            "name": "वीरगन्ज",
            "totalWards": 32
          },
          {
            "name": "बहुदरमाई",
            "totalWards": 9
          },
          {
            "name": "पोखरिया",
            "totalWards": 10
          },
          {
            "name": "पर्सागढी",
            "totalWards": 9
          },
          {
            "name": "थोरी",
            "totalWards": 5
          },
          {
            "name": "धोबिनी",
            "totalWards": 5
          },
          {
            "name": "छिपहरमाई",
            "totalWards": 5
          },
          {
            "name": "जिरभवानी",
            "totalWards": 5
          },
          {
            "name": "जगरनाथपुर",
            "totalWards": 6
          },
          {
            "name": "कालिकामाई",
            "totalWards": 5
          },
          {
            "name": "बिन्दवासिनी",
            "totalWards": 5
          },
          {
            "name": "पकाहा मेनपुर",
            "totalWards": 5
          },
          {
            "name": "सखुवा प्रसौनी",
            "totalWards": 6
          },
          {
            "name": "पटेरवा सुगौली",
            "totalWards": 5
          }
        ]
      },
      {
        "name": "बारा",
        "palikas": [
          {
            "name": "जितपुरसिमारा",
            "totalWards": 24
          },
          {
            "name": "कलैया",
            "totalWards": 27
          },
          {
            "name": "पचरौता",
            "totalWards": 9
          },
          {
            "name": "निजगढ",
            "totalWards": 13
          },
          {
            "name": "सिम्रौनगढ",
            "totalWards": 11
          },
          {
            "name": "महागढीमाई",
            "totalWards": 11
          },
          {
            "name": "कोल्हाबी",
            "totalWards": 11
          },
          {
            "name": "फेटा",
            "totalWards": 7
          },
          {
            "name": "देवताल",
            "totalWards": 7
          },
          {
            "name": "प्रसौनी",
            "totalWards": 7
          },
          {
            "name": "सुवर्ण",
            "totalWards": 8
          },
          {
            "name": "बारागढी",
            "totalWards": 6
          },
          {
            "name": "करैयामाई",
            "totalWards": 8
          },
          {
            "name": "परवानीपुर",
            "totalWards": 5
          },
          {
            "name": "बिश्रामपुर",
            "totalWards": 5
          },
          {
            "name": "आदर्श कोतवाल",
            "totalWards": 8
          }
        ]
      },
      {
        "name": "सप्तरी",
        "palikas": [
          {
            "name": "हनुमाननगर कंकालिनी",
            "totalWards": 14
          },
          {
            "name": "कञ्चनरुप",
            "totalWards": 12
          },
          {
            "name": "राजविराज",
            "totalWards": 16
          },
          {
            "name": "खडक",
            "totalWards": 11
          },
          {
            "name": "डाक्नेश्वरी",
            "totalWards": 10
          },
          {
            "name": "सप्तकोशी",
            "totalWards": 11
          },
          {
            "name": "सुरुङ्गा",
            "totalWards": 11
          },
          {
            "name": "शम्भुनाथ",
            "totalWards": 12
          },
          {
            "name": "बोडे बार्सैन",
            "totalWards": 10
          },
          {
            "name": "राजगढ",
            "totalWards": 9
          },
          {
            "name": "रुपानी",
            "totalWards": 6
          },
          {
            "name": "तिराहुत",
            "totalWards": 5
          },
          {
            "name": "महादेव",
            "totalWards": 6
          },
          {
            "name": "विष्णुपुर",
            "totalWards": 7
          },
          {
            "name": "छिन्नमस्ता",
            "totalWards": 7
          },
          {
            "name": "बालन बिहुल",
            "totalWards": 6
          },
          {
            "name": "तिलाठी कोइलाडी",
            "totalWards": 8
          },
          {
            "name": "अग्निशैर कृष्ण सावरण",
            "totalWards": 6
          }
        ]
      },
      {
        "name": "सिराहा",
        "palikas": [
          {
            "name": "मिर्चैया",
            "totalWards": 12
          },
          {
            "name": "लहान",
            "totalWards": 24
          },
          {
            "name": "सिरहा",
            "totalWards": 22
          },
          {
            "name": "धनगढीमाई",
            "totalWards": 14
          },
          {
            "name": "कल्याणपुर",
            "totalWards": 12
          },
          {
            "name": "कर्जन्हा",
            "totalWards": 11
          },
          {
            "name": "गोलबजार",
            "totalWards": 13
          },
          {
            "name": "सुखीपुर",
            "totalWards": 10
          },
          {
            "name": "औरही",
            "totalWards": 5
          },
          {
            "name": "नरहा",
            "totalWards": 5
          },
          {
            "name": "अर्नामा",
            "totalWards": 5
          },
          {
            "name": "भगवानपुर",
            "totalWards": 5
          },
          {
            "name": "नवराजपुर",
            "totalWards": 5
          },
          {
            "name": "विष्णुपुर",
            "totalWards": 5
          },
          {
            "name": "बरियारपट्टी",
            "totalWards": 5
          },
          {
            "name": "लक्ष्मीपुर पटारी",
            "totalWards": 6
          },
          {
            "name": "सखुवानङ्करकट्टी",
            "totalWards": 5
          }
        ]
      },
      {
        "name": "धनुषा",
        "palikas": [
          {
            "name": "जनकपुरधाम",
            "totalWards": 25
          },
          {
            "name": "मिथिला बिहारी",
            "totalWards": 10
          },
          {
            "name": "नगराई",
            "totalWards": 9
          },
          {
            "name": "गणेशमान चारनाथ",
            "totalWards": 11
          },
          {
            "name": "मिथिला",
            "totalWards": 11
          },
          {
            "name": "धनुषाधाम",
            "totalWards": 9
          },
          {
            "name": "बिदेहा",
            "totalWards": 9
          },
          {
            "name": "सबाइला",
            "totalWards": 13
          },
          {
            "name": "कमला",
            "totalWards": 9
          },
          {
            "name": "हंसपुर",
            "totalWards": 9
          },
          {
            "name": "सहिदनगर",
            "totalWards": 9
          },
          {
            "name": "क्षिरेश्वरनाथ",
            "totalWards": 14
          },
          {
            "name": "औराही",
            "totalWards": 6
          },
          {
            "name": "धनौजी",
            "totalWards": 5
          },
          {
            "name": "बटेश्वर",
            "totalWards": 5
          },
          {
            "name": "जनकनन्दनी",
            "totalWards": 6
          },
          {
            "name": "लक्ष्मीनिया",
            "totalWards": 7
          },
          {
            "name": "मुखियापट्टी मुसरमिया",
            "totalWards": 6
          }
        ]
      },
      {
        "name": "महोत्तरी",
        "palikas": [
          {
            "name": "गौशाला",
            "totalWards": 12
          },
          {
            "name": "रामगोपालपुर",
            "totalWards": 9
          },
          {
            "name": "औरही",
            "totalWards": 9
          },
          {
            "name": "बर्दिवास",
            "totalWards": 14
          },
          {
            "name": "भङ्गाहा",
            "totalWards": 9
          },
          {
            "name": "जलेश्वर",
            "totalWards": 12
          },
          {
            "name": "बलवा",
            "totalWards": 11
          },
          {
            "name": "मनरा सिसवा",
            "totalWards": 10
          },
          {
            "name": "मटिहानी",
            "totalWards": 9
          },
          {
            "name": "लोहारपट्टी",
            "totalWards": 9
          },
          {
            "name": "पिपरा",
            "totalWards": 7
          },
          {
            "name": "सोनामा",
            "totalWards": 8
          },
          {
            "name": "सम्सी",
            "totalWards": 7
          },
          {
            "name": "एकडानरा",
            "totalWards": 6
          },
          {
            "name": "महोत्तरी",
            "totalWards": 6
          }
        ]
      },
      {
        "name": "सर्लाही",
        "palikas": [
          {
            "name": "बराहथवा",
            "totalWards": 18
          },
          {
            "name": "हरिपुर",
            "totalWards": 9
          },
          {
            "name": "ईश्वरपुर",
            "totalWards": 15
          },
          {
            "name": "लालबन्दी",
            "totalWards": 17
          },
          {
            "name": "मलङ्गवा",
            "totalWards": 12
          },
          {
            "name": "कबिलासी",
            "totalWards": 10
          },
          {
            "name": "बागमती",
            "totalWards": 12
          },
          {
            "name": "हरिवान",
            "totalWards": 11
          },
          {
            "name": "बलरा",
            "totalWards": 11
          },
          {
            "name": "हरिपुरवा",
            "totalWards": 9
          },
          {
            "name": "गोदैता",
            "totalWards": 12
          },
          {
            "name": "धनकौल",
            "totalWards": 7
          },
          {
            "name": "पर्सा",
            "totalWards": 6
          },
          {
            "name": "विष्णु",
            "totalWards": 8
          },
          {
            "name": "रामनगर",
            "totalWards": 7
          },
          {
            "name": "कौडेना",
            "totalWards": 7
          },
          {
            "name": "बासबरिया",
            "totalWards": 6
          },
          {
            "name": "चन्द्रनगर",
            "totalWards": 7
          },
          {
            "name": "चक्रघट्टा",
            "totalWards": 9
          },
          {
            "name": "ब्रम्हपुरी",
            "totalWards": 7
          }
        ]
      },
      {
        "name": "रौतहट",
        "palikas": [
          {
            "name": "कटहरिया",
            "totalWards": 9
          },
          {
            "name": "मौलापुर",
            "totalWards": 9
          },
          {
            "name": "माधव नारायण",
            "totalWards": 9
          },
          {
            "name": "गौर",
            "totalWards": 9
          },
          {
            "name": "गुजरा",
            "totalWards": 9
          },
          {
            "name": "गरुड",
            "totalWards": 9
          },
          {
            "name": "ईशानाथ",
            "totalWards": 9
          },
          {
            "name": "चन्द्रपुर",
            "totalWards": 10
          },
          {
            "name": "देवाही गोनाही",
            "totalWards": 14
          },
          {
            "name": "वृन्दबन",
            "totalWards": 9
          },
          {
            "name": "राजपुर",
            "totalWards": 9
          },
          {
            "name": "राजदेवी",
            "totalWards": 9
          },
          {
            "name": "गढीमाई",
            "totalWards": 9
          },
          {
            "name": "विजयपुर फटुवा",
            "totalWards": 11
          },
          {
            "name": "बौधिमाई",
            "totalWards": 9
          },
          {
            "name": "पारोहा",
            "totalWards": 9
          },
          {
            "name": "यमुनामाई",
            "totalWards": 5
          },
          {
            "name": "दुर्गा भगवती",
            "totalWards": 5
          }
        ]
      }
    ]
  },
  {
    "name": "बागमती प्रदेश",
    "districts": [
      {
        "name": "चितवन",
        "palikas": [
          {
            "name": "भरतपुर",
            "totalWards": 32
          },
          {
            "name": "कालिका",
            "totalWards": 14
          },
          {
            "name": "खैरहनी",
            "totalWards": 14
          },
          {
            "name": "माडी",
            "totalWards": 14
          },
          {
            "name": "राप्ती",
            "totalWards": 14
          },
          {
            "name": "रत्ननगर",
            "totalWards": 14
          },
          {
            "name": "इच्छाकामना",
            "totalWards": 9
          }
        ]
      },
      {
        "name": "काठमाडौं",
        "palikas": [
          {
            "name": "काठमाडौं ।",
            "totalWards": 32
          },
          {
            "name": "कीर्तिपुर",
            "totalWards": 10
          },
          {
            "name": "शंखरापुर",
            "totalWards": 9
          },
          {
            "name": "नागार्जुन",
            "totalWards": 10
          },
          {
            "name": "कागेश्वरी मनहोरा",
            "totalWards": 9
          },
          {
            "name": "दक्षिणकाली",
            "totalWards": 9
          },
          {
            "name": "बुढानिलकण्ठ",
            "totalWards": 13
          },
          {
            "name": "तारकेश्वर",
            "totalWards": 11
          },
          {
            "name": "टोखा",
            "totalWards": 11
          },
          {
            "name": "चन्द्रागिरि",
            "totalWards": 15
          },
          {
            "name": "गोकर्णेश्वर",
            "totalWards": 9
          }
        ]
      },
      {
        "name": "ललितपुर",
        "palikas": [
          {
            "name": "ललितपुर",
            "totalWards": 29
          },
          {
            "name": "महालक्ष्मी",
            "totalWards": 10
          },
          {
            "name": "गोदावरी",
            "totalWards": 6
          },
          {
            "name": "बागमती",
            "totalWards": 7
          },
          {
            "name": "महांकाल",
            "totalWards": 6
          },
          {
            "name": "कोन्ज्योसोम",
            "totalWards": 5
          }
        ]
      },
      {
        "name": "मकवानपुर",
        "palikas": [
          {
            "name": "हेटौंडा",
            "totalWards": 19
          },
          {
            "name": "थाहा",
            "totalWards": 14
          },
          {
            "name": "बकैया",
            "totalWards": 9
          },
          {
            "name": "कैलाश",
            "totalWards": 9
          },
          {
            "name": "मनहरी",
            "totalWards": 9
          },
          {
            "name": "भीमफेदी",
            "totalWards": 9
          },
          {
            "name": "बागमती",
            "totalWards": 9
          },
          {
            "name": "रक्सिराङ",
            "totalWards": 9
          },
          {
            "name": "मकवानपुरगढी",
            "totalWards": 9
          },
          {
            "name": "इन्द्रसरोवर",
            "totalWards": 9
          }
        ]
      },
      {
        "name": "दोलखा",
        "palikas": [
          {
            "name": "जिरी",
            "totalWards": 9
          },
          {
            "name": "भीमेश्वर",
            "totalWards": 9
          },
          {
            "name": "बिगु",
            "totalWards": 8
          },
          {
            "name": "सेलुङ",
            "totalWards": 8
          },
          {
            "name": "मेलुङ",
            "totalWards": 7
          },
          {
            "name": "बैतेश्वर",
            "totalWards": 8
          },
          {
            "name": "तामाकोशी",
            "totalWards": 7
          },
          {
            "name": "गौरीशंकर",
            "totalWards": 9
          },
          {
            "name": "कालिञ्चोक",
            "totalWards": 9
          }
        ]
      },
      {
        "name": "सिन्धुपाल्चोक",
        "palikas": [
          {
            "name": "चौतारा साँगाचोकगढी",
            "totalWards": 14
          },
          {
            "name": "बाह्रबिसे",
            "totalWards": 9
          },
          {
            "name": "मेलम्ची",
            "totalWards": 13
          },
          {
            "name": "जुगल",
            "totalWards": 7
          },
          {
            "name": "बलेफी",
            "totalWards": 8
          },
          {
            "name": "सुनकोशी",
            "totalWards": 5
          },
          {
            "name": "हेलम्बु",
            "totalWards": 7
          },
          {
            "name": "भोटेकोशी",
            "totalWards": 5
          },
          {
            "name": "लिसाङ्खु",
            "totalWards": 7
          },
          {
            "name": "इन्द्रावती",
            "totalWards": 12
          },
          {
            "name": "त्रिपुरासुन्दरी",
            "totalWards": 9
          },
          {
            "name": "पाँचपोखरी थाङ्पाल",
            "totalWards": 8
          }
        ]
      },
      {
        "name": "धादिङ",
        "palikas": [
          {
            "name": "नीलकण्ठ",
            "totalWards": 14
          },
          {
            "name": "धुनिबेसी",
            "totalWards": 9
          },
          {
            "name": "गजुरी",
            "totalWards": 8
          },
          {
            "name": "गाल्ची",
            "totalWards": 8
          },
          {
            "name": "ठाकरे",
            "totalWards": 11
          },
          {
            "name": "सिद्धलेक",
            "totalWards": 7
          },
          {
            "name": "खनियाबास",
            "totalWards": 5
          },
          {
            "name": "ज्वालामुखी",
            "totalWards": 7
          },
          {
            "name": "गंगाजमुना",
            "totalWards": 7
          },
          {
            "name": "रुबी उपत्यका",
            "totalWards": 6
          },
          {
            "name": "त्रिपुरा सुन्दरी",
            "totalWards": 7
          },
          {
            "name": "नेत्रावती डब्जोङ",
            "totalWards": 5
          },
          {
            "name": "बेनिघाट रोराङ",
            "totalWards": 10
          }
        ]
      },
      {
        "name": "नुवाकोट",
        "palikas": [
          {
            "name": "बेलकोटगढी",
            "totalWards": 13
          },
          {
            "name": "बिदुर",
            "totalWards": 13
          },
          {
            "name": "ककनी",
            "totalWards": 8
          },
          {
            "name": "ताडी",
            "totalWards": 6
          },
          {
            "name": "लिखु",
            "totalWards": 6
          },
          {
            "name": "म्यागाङ",
            "totalWards": 9
          },
          {
            "name": "शिवपुरी",
            "totalWards": 8
          },
          {
            "name": "किस्पाङ",
            "totalWards": 5
          },
          {
            "name": "सुर्यगढी",
            "totalWards": 5
          },
          {
            "name": "तारकेश्वर",
            "totalWards": 6
          },
          {
            "name": "पञ्चकन्या",
            "totalWards": 5
          },
          {
            "name": "दुप्चेश्वर",
            "totalWards": 7
          }
        ]
      },
      {
        "name": "भक्तपुर",
        "palikas": [
          {
            "name": "चाँगुनारायण",
            "totalWards": 9
          },
          {
            "name": "सूर्यविनायक",
            "totalWards": 10
          },
          {
            "name": "भक्तपुर",
            "totalWards": 10
          },
          {
            "name": "मध्यपुरथिमि",
            "totalWards": 9
          }
        ]
      },
      {
        "name": "काभ्रेपलाञ्चोक",
        "palikas": [
          {
            "name": "बनेपा",
            "totalWards": 14
          },
          {
            "name": "मण्डनदेउपुर",
            "totalWards": 14
          },
          {
            "name": "धुलिखेल",
            "totalWards": 14
          },
          {
            "name": "पनौती",
            "totalWards": 14
          },
          {
            "name": "नमोबुद्ध",
            "totalWards": 14
          },
          {
            "name": "पाँचखाल",
            "totalWards": 14
          },
          {
            "name": "रोशी",
            "totalWards": 9
          },
          {
            "name": "तेमल",
            "totalWards": 9
          },
          {
            "name": "भुम्लु",
            "totalWards": 9
          },
          {
            "name": "महाभारत",
            "totalWards": 9
          },
          {
            "name": "बेथानचोक",
            "totalWards": 9
          },
          {
            "name": "खानीखोला",
            "totalWards": 9
          },
          {
            "name": "चौरीदेउराली",
            "totalWards": 9
          }
        ]
      },
      {
        "name": "रामेछाप",
        "palikas": [
          {
            "name": "मन्थली",
            "totalWards": 14
          },
          {
            "name": "रामेछाप",
            "totalWards": 9
          },
          {
            "name": "सुनापति",
            "totalWards": 5
          },
          {
            "name": "दोरम्बा",
            "totalWards": 7
          },
          {
            "name": "उमाकुण्ड",
            "totalWards": 7
          },
          {
            "name": "खाडादेवी",
            "totalWards": 9
          },
          {
            "name": "गोकुलगंगा",
            "totalWards": 6
          },
          {
            "name": "लिखु तामाकोशी",
            "totalWards": 7
          }
        ]
      },
      {
        "name": "सिन्धुली",
        "palikas": [
          {
            "name": "दुधौली",
            "totalWards": 14
          },
          {
            "name": "कमलामाई",
            "totalWards": 14
          },
          {
            "name": "मारिन",
            "totalWards": 7
          },
          {
            "name": "फिक्कल",
            "totalWards": 6
          },
          {
            "name": "तिनपाटन",
            "totalWards": 11
          },
          {
            "name": "सुनकोशी",
            "totalWards": 7
          },
          {
            "name": "गोलन्जोर",
            "totalWards": 7
          },
          {
            "name": "घाङ्लेख",
            "totalWards": 5
          },
          {
            "name": "हरिहरपुरगढी",
            "totalWards": 8
          }
        ]
      },
      {
        "name": "रसुवा",
        "palikas": [
          {
            "name": "कालिका",
            "totalWards": 5
          },
          {
            "name": "नौकुण्ड",
            "totalWards": 6
          },
          {
            "name": "उत्तरगया",
            "totalWards": 5
          },
          {
            "name": "गोसाइकुण्ड",
            "totalWards": 6
          },
          {
            "name": "अमाकोडिङमो",
            "totalWards": 9
          }
        ]
      }
    ]
  },
  {
    "name": "गण्डकी प्रदेश",
    "districts": [
      {
        "name": "कास्की",
        "palikas": [
          {
            "name": "पोखरा",
            "totalWards": 33
          },
          {
            "name": "रुपा",
            "totalWards": 7
          },
          {
            "name": "माडी",
            "totalWards": 12
          },
          {
            "name": "अन्नपूर्ण",
            "totalWards": 11
          },
          {
            "name": "माछापुच्छ्रे",
            "totalWards": 9
          }
        ]
      },
      {
        "name": "गोरखा",
        "palikas": [
          {
            "name": "पालुङटार",
            "totalWards": 10
          },
          {
            "name": "गोरखा",
            "totalWards": 14
          },
          {
            "name": "गण्डकी",
            "totalWards": 8
          },
          {
            "name": "धार्चे",
            "totalWards": 7
          },
          {
            "name": "आरुघाट",
            "totalWards": 10
          },
          {
            "name": "अजिरकोट",
            "totalWards": 5
          },
          {
            "name": "सहिद लखन",
            "totalWards": 9
          },
          {
            "name": "सिरञ्चोक",
            "totalWards": 8
          },
          {
            "name": "भीमसेनथापा",
            "totalWards": 8
          },
          {
            "name": "चुम नुब्रि",
            "totalWards": 7
          },
          {
            "name": "बारपाक सुलिकोट",
            "totalWards": 8
          }
        ]
      },
      {
        "name": "म्याग्दी",
        "palikas": [
          {
            "name": "बेनी",
            "totalWards": 10
          },
          {
            "name": "मंगला",
            "totalWards": 5
          },
          {
            "name": "मलिका",
            "totalWards": 7
          },
          {
            "name": "रघुगंगा",
            "totalWards": 8
          },
          {
            "name": "धौलागिरी",
            "totalWards": 7
          },
          {
            "name": "अन्नपूर्ण",
            "totalWards": 8
          }
        ]
      },
      {
        "name": "लमजुङ",
        "palikas": [
          {
            "name": "सुन्दरबजार",
            "totalWards": 11
          },
          {
            "name": "बेशिशहर",
            "totalWards": 11
          },
          {
            "name": "रैनास",
            "totalWards": 10
          },
          {
            "name": "मध्यनेपाल",
            "totalWards": 10
          },
          {
            "name": "दोर्दी",
            "totalWards": 9
          },
          {
            "name": "दूधपोखरी",
            "totalWards": 6
          },
          {
            "name": "मर्स्याङ्दी",
            "totalWards": 9
          },
          {
            "name": "क्वालासोथर",
            "totalWards": 9
          }
        ]
      },
      {
        "name": "तनहुँ",
        "palikas": [
          {
            "name": "ब्यास",
            "totalWards": 7
          },
          {
            "name": "शुक्लागण्डकी",
            "totalWards": 12
          },
          {
            "name": "भीमद",
            "totalWards": 9
          },
          {
            "name": "भानु",
            "totalWards": 13
          },
          {
            "name": "घिरिङ",
            "totalWards": 5
          },
          {
            "name": "देवघाट",
            "totalWards": 5
          },
          {
            "name": "रिसिङ",
            "totalWards": 8
          },
          {
            "name": "म्याग्दे",
            "totalWards": 7
          },
          {
            "name": "बन्दीपुर",
            "totalWards": 6
          },
          {
            "name": "अन्बुखैरेनी",
            "totalWards": 6
          }
        ]
      },
      {
        "name": "नवलपरासी पूर्व",
        "palikas": [
          {
            "name": "मध्यविन्दु",
            "totalWards": 14
          },
          {
            "name": "देवचुली",
            "totalWards": 14
          },
          {
            "name": "गैडाकोट",
            "totalWards": 14
          },
          {
            "name": "कावासोती",
            "totalWards": 14
          },
          {
            "name": "बौदेकाली",
            "totalWards": 9
          },
          {
            "name": "बुलिङटार",
            "totalWards": 9
          },
          {
            "name": "हुप्सेकोट",
            "totalWards": 9
          },
          {
            "name": "बिनयी",
            "totalWards": 9
          }
        ]
      },
      {
        "name": "स्याङ्जा",
        "palikas": [
          {
            "name": "पुतलीबजार",
            "totalWards": 14
          },
          {
            "name": "भिरकोट",
            "totalWards": 9
          },
          {
            "name": "गल्याङ",
            "totalWards": 11
          },
          {
            "name": "चापाकोट",
            "totalWards": 10
          },
          {
            "name": "वालिङ",
            "totalWards": 14
          },
          {
            "name": "हरिनास",
            "totalWards": 7
          },
          {
            "name": "बिरुवा",
            "totalWards": 8
          },
          {
            "name": "आँधीखोला",
            "totalWards": 6
          },
          {
            "name": "फेदीखोला",
            "totalWards": 5
          },
          {
            "name": "कालीगण्डगी",
            "totalWards": 7
          },
          {
            "name": "अर्जुनचौपरी",
            "totalWards": 6
          }
        ]
      },
      {
        "name": "पर्वत",
        "palikas": [
          {
            "name": "कुश्मा",
            "totalWards": 14
          },
          {
            "name": "फलेबास",
            "totalWards": 11
          },
          {
            "name": "मोदी",
            "totalWards": 8
          },
          {
            "name": "पाइन्यु",
            "totalWards": 7
          },
          {
            "name": "जलजला",
            "totalWards": 9
          },
          {
            "name": "बिहादी",
            "totalWards": 6
          },
          {
            "name": "महाशिला",
            "totalWards": 6
          }
        ]
      },
      {
        "name": "बागलुङ",
        "palikas": [
          {
            "name": "जैमुनी",
            "totalWards": 10
          },
          {
            "name": "बाग्लुङ",
            "totalWards": 14
          },
          {
            "name": "गलकोट",
            "totalWards": 11
          },
          {
            "name": "ढोरपाटन",
            "totalWards": 9
          },
          {
            "name": "बरेङ",
            "totalWards": 5
          },
          {
            "name": "बडिगाड",
            "totalWards": 10
          },
          {
            "name": "निसिखोला",
            "totalWards": 7
          },
          {
            "name": "कान्ठेखोला",
            "totalWards": 8
          },
          {
            "name": "तारा खोला",
            "totalWards": 5
          },
          {
            "name": "तमन खोला",
            "totalWards": 6
          }
        ]
      },
      {
        "name": "मनाङ",
        "palikas": [
          {
            "name": "चामे",
            "totalWards": 5
          },
          {
            "name": "नरशोन",
            "totalWards": 9
          },
          {
            "name": "नरपा भूमि",
            "totalWards": 9
          },
          {
            "name": "मनाङ इङ्स्याङ",
            "totalWards": 9
          }
        ]
      },
      {
        "name": "मुस्ताङ",
        "palikas": [
          {
            "name": "थासाङ",
            "totalWards": 5
          },
          {
            "name": "घरापझोङ",
            "totalWards": 5
          },
          {
            "name": "लोमान्थाङ",
            "totalWards": 5
          },
          {
            "name": "लो घेकर दामोदरकुण्ड",
            "totalWards": 9
          },
          {
            "name": "वारागुङ मुक्तिक्षेत्र",
            "totalWards": 9
          }
        ]
      }
    ]
  },
  {
    "name": "लुम्बिनी प्रदेश",
    "districts": [
      {
        "name": "दाङ",
        "palikas": [
          {
            "name": "घोराही",
            "totalWards": 19
          },
          {
            "name": "तुलसीपुर",
            "totalWards": 19
          },
          {
            "name": "लमही",
            "totalWards": 9
          },
          {
            "name": "बबई",
            "totalWards": 7
          },
          {
            "name": "गढवा",
            "totalWards": 8
          },
          {
            "name": "राप्ती",
            "totalWards": 8
          },
          {
            "name": "राजपुर",
            "totalWards": 7
          },
          {
            "name": "दंगिशरण",
            "totalWards": 7
          },
          {
            "name": "शान्तिनगर",
            "totalWards": 7
          },
          {
            "name": "बंगलाचुली",
            "totalWards": 8
          }
        ]
      },
      {
        "name": "रुपन्देही",
        "palikas": [
          {
            "name": "बुटवल",
            "totalWards": 19
          },
          {
            "name": "लुम्बिनी संस्कृत",
            "totalWards": 13
          },
          {
            "name": "देवदह",
            "totalWards": 12
          },
          {
            "name": "सैनामैना",
            "totalWards": 11
          },
          {
            "name": "सिद्धार्थनगर",
            "totalWards": 13
          },
          {
            "name": "तिलोतमा",
            "totalWards": 17
          },
          {
            "name": "कञ्चन",
            "totalWards": 5
          },
          {
            "name": "सियारी",
            "totalWards": 7
          },
          {
            "name": "रोहिणी",
            "totalWards": 7
          },
          {
            "name": "गैडहवा",
            "totalWards": 9
          },
          {
            "name": "ओमसतिया",
            "totalWards": 6
          },
          {
            "name": "शुद्धोधन",
            "totalWards": 7
          },
          {
            "name": "मायादेवी",
            "totalWards": 8
          },
          {
            "name": "मार्चवारी",
            "totalWards": 7
          },
          {
            "name": "कोटाहिमाई",
            "totalWards": 7
          },
          {
            "name": "समरीमाई",
            "totalWards": 7
          }
        ]
      },
      {
        "name": "बाँके",
        "palikas": [
          {
            "name": "नेपालगन्ज",
            "totalWards": 23
          },
          {
            "name": "कोहलपुर",
            "totalWards": 15
          },
          {
            "name": "खजुरा",
            "totalWards": 8
          },
          {
            "name": "जानकी",
            "totalWards": 6
          },
          {
            "name": "बैजनाथ",
            "totalWards": 8
          },
          {
            "name": "डुडुवा",
            "totalWards": 6
          },
          {
            "name": "नरैनापुर",
            "totalWards": 6
          },
          {
            "name": "राप्ती सोनारी",
            "totalWards": 9
          }
        ]
      },
      {
        "name": "रोल्पा",
        "palikas": [
          {
            "name": "रोल्पा",
            "totalWards": 10
          },
          {
            "name": "माडी",
            "totalWards": 6
          },
          {
            "name": "थवाङ",
            "totalWards": 5
          },
          {
            "name": "सुनछहरी",
            "totalWards": 7
          },
          {
            "name": "लुङ्गरी",
            "totalWards": 7
          },
          {
            "name": "गंगादेव",
            "totalWards": 9
          },
          {
            "name": "त्रिवेणी",
            "totalWards": 7
          },
          {
            "name": "परिवर्तन",
            "totalWards": 9
          },
          {
            "name": "रुन्टीगढी",
            "totalWards": 9
          },
          {
            "name": "सुनिल स्मृति",
            "totalWards": 9
          }
        ]
      },
      {
        "name": "प्युठान",
        "palikas": [
          {
            "name": "प्युठान",
            "totalWards": 10
          },
          {
            "name": "स्वर्गद्वारी",
            "totalWards": 9
          },
          {
            "name": "आइराबत",
            "totalWards": 6
          },
          {
            "name": "गौमुखी",
            "totalWards": 7
          },
          {
            "name": "झिमरुक",
            "totalWards": 8
          },
          {
            "name": "नौबहिनी",
            "totalWards": 8
          },
          {
            "name": "मांडवी",
            "totalWards": 5
          },
          {
            "name": "मल्लरानी",
            "totalWards": 5
          },
          {
            "name": "सरूमरानी",
            "totalWards": 6
          }
        ]
      },
      {
        "name": "गुल्मी",
        "palikas": [
          {
            "name": "रेसुंगा",
            "totalWards": 14
          },
          {
            "name": "मुसिकोट",
            "totalWards": 9
          },
          {
            "name": "रुरु",
            "totalWards": 6
          },
          {
            "name": "इस्मा",
            "totalWards": 6
          },
          {
            "name": "मदने",
            "totalWards": 7
          },
          {
            "name": "मलिका",
            "totalWards": 8
          },
          {
            "name": "चत्रकोट",
            "totalWards": 6
          },
          {
            "name": "चत्रकोट",
            "totalWards": 6
          },
          {
            "name": "सत्यवती",
            "totalWards": 8
          },
          {
            "name": "चन्द्रकोट",
            "totalWards": 8
          },
          {
            "name": "कालीगण्डकी",
            "totalWards": 7
          },
          {
            "name": "गुल्मीदरबार",
            "totalWards": 7
          }
        ]
      },
      {
        "name": "अर्घाखाँची",
        "palikas": [
          {
            "name": "भुमेकस्थान",
            "totalWards": 10
          },
          {
            "name": "सितगंगा",
            "totalWards": 14
          },
          {
            "name": "सन्धिखर्क",
            "totalWards": 12
          },
          {
            "name": "पाणिनी",
            "totalWards": 8
          },
          {
            "name": "छत्रदेव",
            "totalWards": 8
          },
          {
            "name": "मलारानी",
            "totalWards": 9
          }
        ]
      },
      {
        "name": "पाल्पा",
        "palikas": [
          {
            "name": "तानसेन",
            "totalWards": 14
          },
          {
            "name": "रामपुर",
            "totalWards": 10
          },
          {
            "name": "रम्भा",
            "totalWards": 5
          },
          {
            "name": "तिनाउ",
            "totalWards": 6
          },
          {
            "name": "निस्दी",
            "totalWards": 7
          },
          {
            "name": "मठगढी",
            "totalWards": 8
          },
          {
            "name": "रिब्दीकोट",
            "totalWards": 8
          },
          {
            "name": "पूर्वखोला",
            "totalWards": 6
          },
          {
            "name": "बागनास्कली",
            "totalWards": 9
          },
          {
            "name": "रैनादेवी",
            "totalWards": 8
          }
        ]
      },
      {
        "name": "नवलपरासी पश्चिम",
        "palikas": [
          {
            "name": "बर्दघाट",
            "totalWards": 14
          },
          {
            "name": "सुनवल",
            "totalWards": 14
          },
          {
            "name": "रामग्राम",
            "totalWards": 14
          },
          {
            "name": "सरवल",
            "totalWards": 9
          },
          {
            "name": "सुस्ता",
            "totalWards": 9
          },
          {
            "name": "प्रतापपुर",
            "totalWards": 9
          },
          {
            "name": "पाल्ही नन्दन",
            "totalWards": 9
          }
        ]
      },
      {
        "name": "कपिलवस्तु",
        "palikas": [
          {
            "name": "शिवराज",
            "totalWards": 11
          },
          {
            "name": "कपिलवस्तु",
            "totalWards": 12
          },
          {
            "name": "बुद्धभूमि",
            "totalWards": 10
          },
          {
            "name": "महाराजगन्ज",
            "totalWards": 11
          },
          {
            "name": "बाणगंगा",
            "totalWards": 11
          },
          {
            "name": "कृष्णनगर",
            "totalWards": 12
          },
          {
            "name": "यशोधरा",
            "totalWards": 8
          },
          {
            "name": "विजयनगर",
            "totalWards": 7
          },
          {
            "name": "मायादेवी",
            "totalWards": 8
          },
          {
            "name": "शुद्धोधन",
            "totalWards": 6
          }
        ]
      },
      {
        "name": "बर्दिया",
        "palikas": [
          {
            "name": "ठाकुरबाबा",
            "totalWards": 9
          },
          {
            "name": "बाँसगढी",
            "totalWards": 9
          },
          {
            "name": "बारबर्दिया",
            "totalWards": 11
          },
          {
            "name": "राजापुर",
            "totalWards": 10
          },
          {
            "name": "मधुवन",
            "totalWards": 9
          },
          {
            "name": "गुलरिया",
            "totalWards": 12
          },
          {
            "name": "गेरुवा",
            "totalWards": 6
          },
          {
            "name": "बढैयाताल",
            "totalWards": 9
          }
        ]
      },
      {
        "name": "रुकुम पूर्व",
        "palikas": [
          {
            "name": "भुमे",
            "totalWards": 9
          },
          {
            "name": "सिस्ने",
            "totalWards": 9
          },
          {
            "name": "पुथा उत्तरगंगा",
            "totalWards": 9
          }
        ]
      }
    ]
  },
  {
    "name": "कर्णाली प्रदेश",
    "districts": [
      {
        "name": "हुम्ला",
        "palikas": [
          {
            "name": "सिमकोट",
            "totalWards": 8
          },
          {
            "name": "नम्खा",
            "totalWards": 6
          },
          {
            "name": "चनखेली",
            "totalWards": 6
          },
          {
            "name": "तान्जाकोट",
            "totalWards": 5
          },
          {
            "name": "सार्केगड",
            "totalWards": 8
          },
          {
            "name": "अडांचुली",
            "totalWards": 6
          },
          {
            "name": "खार्पुनाथ",
            "totalWards": 5
          }
        ]
      },
      {
        "name": "डोल्पा",
        "palikas": [
          {
            "name": "त्रिपुरासुन्दरी",
            "totalWards": 11
          },
          {
            "name": "ठुली भेरी",
            "totalWards": 11
          },
          {
            "name": "काइके",
            "totalWards": 7
          },
          {
            "name": "जगदुल्ला",
            "totalWards": 6
          },
          {
            "name": "मुड्केचुला",
            "totalWards": 9
          },
          {
            "name": "डोल्पो बुद्ध",
            "totalWards": 6
          },
          {
            "name": "शे फोक्सुण्डो",
            "totalWards": 9
          },
          {
            "name": "छर्का ताङसोङ",
            "totalWards": 6
          }
        ]
      },
      {
        "name": "मुगु",
        "palikas": [
          {
            "name": "छायानाथ रारा",
            "totalWards": 14
          },
          {
            "name": "सोरु",
            "totalWards": 11
          },
          {
            "name": "खत्याड",
            "totalWards": 11
          },
          {
            "name": "मुगुम कर्मारोङ",
            "totalWards": 9
          }
        ]
      },
      {
        "name": "जुम्ला",
        "palikas": [
          {
            "name": "चन्दननाथ",
            "totalWards": 10
          },
          {
            "name": "हिमा",
            "totalWards": 7
          },
          {
            "name": "तिला",
            "totalWards": 9
          },
          {
            "name": "सिन्जा",
            "totalWards": 6
          },
          {
            "name": "गुठीचौर",
            "totalWards": 5
          },
          {
            "name": "तातोपानी",
            "totalWards": 8
          },
          {
            "name": "पत्रासी",
            "totalWards": 7
          },
          {
            "name": "कनकसुन्दरी",
            "totalWards": 8
          }
        ]
      },
      {
        "name": "कालिकोट",
        "palikas": [
          {
            "name": "खंडचक्र",
            "totalWards": 11
          },
          {
            "name": "रास्कोट",
            "totalWards": 9
          },
          {
            "name": "तिलागुफा",
            "totalWards": 11
          },
          {
            "name": "महावाई",
            "totalWards": 7
          },
          {
            "name": "पलाता",
            "totalWards": 9
          },
          {
            "name": "नरहरिनाथ",
            "totalWards": 9
          },
          {
            "name": "पाँचलझरना",
            "totalWards": 9
          },
          {
            "name": "शुभ कालिका",
            "totalWards": 9
          },
          {
            "name": "सन्नी त्रिवेणी",
            "totalWards": 9
          }
        ]
      },
      {
        "name": "दैलेख",
        "palikas": [
          {
            "name": "आठबिस",
            "totalWards": 9
          },
          {
            "name": "दुल्लु",
            "totalWards": 13
          },
          {
            "name": "चामुण्डा बिन्द्रसैनी",
            "totalWards": 9
          },
          {
            "name": "नारायण",
            "totalWards": 11
          },
          {
            "name": "भैरवी",
            "totalWards": 7
          },
          {
            "name": "महाबु",
            "totalWards": 6
          },
          {
            "name": "गुराँस",
            "totalWards": 8
          },
          {
            "name": "नौमुले",
            "totalWards": 8
          },
          {
            "name": "भगवतीमाई",
            "totalWards": 7
          },
          {
            "name": "ठान्टिकाण्ड",
            "totalWards": 6
          },
          {
            "name": "डुङ्गेश्वर",
            "totalWards": 6
          }
        ]
      },
      {
        "name": "जाजरकोट",
        "palikas": [
          {
            "name": "नालागड",
            "totalWards": 13
          },
          {
            "name": "भेरी",
            "totalWards": 13
          },
          {
            "name": "छेडागढ",
            "totalWards": 13
          },
          {
            "name": "कुसे",
            "totalWards": 9
          },
          {
            "name": "शिवालय",
            "totalWards": 9
          },
          {
            "name": "बारेकोट",
            "totalWards": 9
          },
          {
            "name": "जुनिचन्दे",
            "totalWards": 11
          }
        ]
      },
      {
        "name": "रुकुम पश्चिम",
        "palikas": [
          {
            "name": "आठबिस्कोट",
            "totalWards": 14
          },
          {
            "name": "चौरजहारी",
            "totalWards": 14
          },
          {
            "name": "मुसिकोट",
            "totalWards": 14
          },
          {
            "name": "त्रिवेणी",
            "totalWards": 9
          },
          {
            "name": "सानी भेरी",
            "totalWards": 9
          },
          {
            "name": "बनफिकोट",
            "totalWards": 9
          }
        ]
      },
      {
        "name": "सल्यान",
        "palikas": [
          {
            "name": "शारदा",
            "totalWards": 15
          },
          {
            "name": "बांगड",
            "totalWards": 12
          },
          {
            "name": "बागचौर",
            "totalWards": 12
          },
          {
            "name": "कुमाख",
            "totalWards": 7
          },
          {
            "name": "डार्मा",
            "totalWards": 6
          },
          {
            "name": "कपुरकोट",
            "totalWards": 6
          },
          {
            "name": "कालीमाटी",
            "totalWards": 7
          },
          {
            "name": "त्रिवेणी",
            "totalWards": 5
          },
          {
            "name": "छत्रेश्वरी",
            "totalWards": 7
          },
          {
            "name": "सिद्ध कुमाख",
            "totalWards": 9
          }
        ]
      },
      {
        "name": "सुर्खेत",
        "palikas": [
          {
            "name": "गुर्भाकोट",
            "totalWards": 14
          },
          {
            "name": "पञ्चपुरी",
            "totalWards": 11
          },
          {
            "name": "भेरीगंगा",
            "totalWards": 13
          },
          {
            "name": "लेकबेशी",
            "totalWards": 10
          },
          {
            "name": "वीरेन्द्रनगर",
            "totalWards": 16
          },
          {
            "name": "चौकुने",
            "totalWards": 10
          },
          {
            "name": "सिम्ता",
            "totalWards": 9
          },
          {
            "name": "चिंगाड",
            "totalWards": 6
          },
          {
            "name": "बराहताल",
            "totalWards": 10
          }
        ]
      }
    ]
  },
  {
    "name": "सुदूरपश्चिम प्रदेश",
    "districts": [
      {
        "name": "कैलाली",
        "palikas": [
          {
            "name": "धनगढी",
            "totalWards": 19
          },
          {
            "name": "टीकापुर",
            "totalWards": 9
          },
          {
            "name": "घोडाघोडी",
            "totalWards": 12
          },
          {
            "name": "भजनी",
            "totalWards": 9
          },
          {
            "name": "गौरीगंगा",
            "totalWards": 11
          },
          {
            "name": "गोदावरी",
            "totalWards": 12
          },
          {
            "name": "लम्कीचुहा",
            "totalWards": 10
          },
          {
            "name": "चुरे",
            "totalWards": 6
          },
          {
            "name": "जानकी",
            "totalWards": 9
          },
          {
            "name": "कैलारी",
            "totalWards": 9
          },
          {
            "name": "जोशीपुर",
            "totalWards": 7
          },
          {
            "name": "मोहन्याल",
            "totalWards": 7
          },
          {
            "name": "बर्दगोरिया",
            "totalWards": 6
          }
        ]
      },
      {
        "name": "बाजुरा",
        "palikas": [
          {
            "name": "बडिमालिका",
            "totalWards": 9
          },
          {
            "name": "त्रिवेणी",
            "totalWards": 9
          },
          {
            "name": "बुढीगंगा",
            "totalWards": 10
          },
          {
            "name": "बुढीनन्द",
            "totalWards": 10
          },
          {
            "name": "गौमुल",
            "totalWards": 6
          },
          {
            "name": "हिमाली",
            "totalWards": 7
          },
          {
            "name": "जगन्नाथ",
            "totalWards": 9
          },
          {
            "name": "खप्तड छेडेदह",
            "totalWards": 7
          },
          {
            "name": "स्वामी कार्तिक खापर",
            "totalWards": 5
          }
        ]
      },
      {
        "name": "बझाङ",
        "palikas": [
          {
            "name": "जय पृथ्वी",
            "totalWards": 11
          },
          {
            "name": "बुंगल",
            "totalWards": 11
          },
          {
            "name": "मस्त",
            "totalWards": 7
          },
          {
            "name": "थालारा",
            "totalWards": 9
          },
          {
            "name": "तालकोट",
            "totalWards": 7
          },
          {
            "name": "सुर्मा",
            "totalWards": 5
          },
          {
            "name": "साइपाल",
            "totalWards": 9
          },
          {
            "name": "दुर्गाथली",
            "totalWards": 7
          },
          {
            "name": "बिठाडचिर",
            "totalWards": 9
          },
          {
            "name": "केदारसेउ",
            "totalWards": 9
          },
          {
            "name": "खप्तडछन्ना",
            "totalWards": 7
          },
          {
            "name": "चाबिस्पाथीवेरा",
            "totalWards": 7
          }
        ]
      },
      {
        "name": "दार्चुला",
        "palikas": [
          {
            "name": "महाकाली",
            "totalWards": 9
          },
          {
            "name": "शैल्यशिखर",
            "totalWards": 9
          },
          {
            "name": "लेकम",
            "totalWards": 6
          },
          {
            "name": "नौगाड",
            "totalWards": 6
          },
          {
            "name": "ब्यास",
            "totalWards": 6
          },
          {
            "name": "दुन्हु",
            "totalWards": 5
          },
          {
            "name": "मर्मा",
            "totalWards": 6
          },
          {
            "name": "एपिहिमल",
            "totalWards": 6
          },
          {
            "name": "मालिकार्जुन",
            "totalWards": 8
          }
        ]
      },
      {
        "name": "बैतडी",
        "palikas": [
          {
            "name": "मेलौली",
            "totalWards": 9
          },
          {
            "name": "दशरथचन्द",
            "totalWards": 11
          },
          {
            "name": "पुर्चौडी",
            "totalWards": 10
          },
          {
            "name": "पाटन",
            "totalWards": 10
          },
          {
            "name": "सिगास",
            "totalWards": 9
          },
          {
            "name": "शिवनाथ",
            "totalWards": 6
          },
          {
            "name": "सुर्नाया",
            "totalWards": 8
          },
          {
            "name": "डिलासैनी",
            "totalWards": 7
          },
          {
            "name": "पञ्चेश्वर",
            "totalWards": 6
          },
          {
            "name": "दोगडाकेदार",
            "totalWards": 8
          }
        ]
      },
      {
        "name": "डडेलधुरा",
        "palikas": [
          {
            "name": "अमरगढी",
            "totalWards": 11
          },
          {
            "name": "परशुराम",
            "totalWards": 12
          },
          {
            "name": "अलिताल",
            "totalWards": 8
          },
          {
            "name": "अजयमेरु",
            "totalWards": 6
          },
          {
            "name": "भागेश्वर",
            "totalWards": 5
          },
          {
            "name": "नवदुर्गा",
            "totalWards": 5
          },
          {
            "name": "गणयपधुरा",
            "totalWards": 5
          }
        ]
      },
      {
        "name": "डोटी",
        "palikas": [
          {
            "name": "दिपायल सिलगढी",
            "totalWards": 9
          },
          {
            "name": "शिखर",
            "totalWards": 11
          },
          {
            "name": "सायल",
            "totalWards": 6
          },
          {
            "name": "आदर्श",
            "totalWards": 7
          },
          {
            "name": "जोरयाल",
            "totalWards": 6
          },
          {
            "name": "बडीकेदार",
            "totalWards": 5
          },
          {
            "name": "पूर्वचौकी",
            "totalWards": 7
          },
          {
            "name": "के आई सिंह",
            "totalWards": 7
          },
          {
            "name": "Bogtan Foodsil",
            "totalWards": 7
          }
        ]
      },
      {
        "name": "अछाम",
        "palikas": [
          {
            "name": "साँफेबगर",
            "totalWards": 14
          },
          {
            "name": "मंगलसेन",
            "totalWards": 14
          },
          {
            "name": "कमलबजार",
            "totalWards": 10
          },
          {
            "name": "पञ्चदेवल विनायक",
            "totalWards": 9
          },
          {
            "name": "ढकारी",
            "totalWards": 8
          },
          {
            "name": "मेल्लेख",
            "totalWards": 8
          },
          {
            "name": "चौरपाटी",
            "totalWards": 7
          },
          {
            "name": "रामरोशन",
            "totalWards": 7
          },
          {
            "name": "तुर्मखाड",
            "totalWards": 8
          },
          {
            "name": "बान्नीगढी",
            "totalWards": 6
          }
        ]
      },
      {
        "name": "कञ्चनपुर",
        "palikas": [
          {
            "name": "पुनर्वास",
            "totalWards": 11
          },
          {
            "name": "कृष्णपुर",
            "totalWards": 9
          },
          {
            "name": "महाकाली",
            "totalWards": 19
          },
          {
            "name": "बेदकोट",
            "totalWards": 10
          },
          {
            "name": "बेलौरी",
            "totalWards": 10
          },
          {
            "name": "भीमदत्त",
            "totalWards": 19
          },
          {
            "name": "शुक्लाफाँटा",
            "totalWards": 12
          },
          {
            "name": "बेलडाँडी",
            "totalWards": 5
          },
          {
            "name": "लालझण्डी",
            "totalWards": 9
          }
        ]
      }
    ]
  }
];

/** Helper Functions */

export function getProvinces(): string[] {
  return NEPAL_ADMIN_STRUCTURE.map((p) => p.name);
}

export function getDistricts(provinceName: string): string[] {
  const prov = NEPAL_ADMIN_STRUCTURE.find((p) => p.name === provinceName);
  return prov ? prov.districts.map((d) => d.name) : [];
}

export function getPalikas(provinceName: string, districtName: string): string[] {
  const prov = NEPAL_ADMIN_STRUCTURE.find((p) => p.name === provinceName);
  if (!prov) return [];
  const dist = prov.districts.find((d) => d.name === districtName);
  return dist ? dist.palikas.map((pl) => pl.name) : [];
}

export function getWards(provinceName: string, districtName: string, palikaName: string): WardOption[] {
  const prov = NEPAL_ADMIN_STRUCTURE.find((p) => p.name === provinceName);
  if (!prov) return generateDefaultWards(8);
  const dist = prov.districts.find((d) => d.name === districtName);
  if (!dist) return generateDefaultWards(8);
  const palika = dist.palikas.find((pl) => pl.name === palikaName);
  if (!palika) return generateDefaultWards(8);

  if (palika.customWards && palika.customWards.length > 0) {
    return palika.customWards;
  }

  const count = palika.totalWards || 9;
  return generateDefaultWards(count);
}

function generateDefaultWards(count: number): WardOption[] {
  const list: WardOption[] = [];
  for (let i = 1; i <= count; i++) {
    list.push({ id: i, label: `वडा नं. ${i}` });
  }
  return list;
}
