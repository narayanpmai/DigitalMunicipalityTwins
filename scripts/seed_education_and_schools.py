import psycopg2
import uuid
import json
import sys
from datetime import datetime, date

sys.stdout.reconfigure(encoding='utf-8')

DB_URI = 'postgresql://p5admin:P5Digital%402024%21@localhost:5433/p5digital'

SCHOOLS_DATA = [
    # WARD 1: बाँसखर्क
    {
        "id": "sch-01-01",
        "name": "श्री बाँसखर्क माध्यमिक विद्यालय",
        "nameEn": "Shree Banskharka Secondary School",
        "wardNumber": 1,
        "type": "public",
        "level": "secondary",
        "levelDetails": "माध्यमिक (१-१०)",
        "totalStudents": 285,
        "maleStudents": 138,
        "femaleStudents": 147,
        "totalTeachers": 13,
        "emisCode": "240101001",
        "principalName": "राम बहादुर तामाङ",
        "contactPhone": "9841334411",
        "email": "banskharka.school@gmail.com",
        "tole": "बाँसखर्क बजार",
        "latitude": 27.9455,
        "longitude": 85.6135,
        "hasIctLab": True,
        "hasLibrary": True,
        "hasScienceLab": True,
        "hasDrinkingWater": True,
        "hasElectricity": True,
        "facilities": ["कम्प्युटर ल्याब", "विज्ञान प्रयोगशाला", "पुस्तकालय", "खेलमैदान", "शौचालय"]
    },
    {
        "id": "sch-01-02",
        "name": "श्री देवी आधारभूत विद्यालय",
        "nameEn": "Shree Devi Basic School",
        "wardNumber": 1,
        "type": "community",
        "level": "basic",
        "levelDetails": "आधारभूत (१-५)",
        "totalStudents": 65,
        "maleStudents": 32,
        "femaleStudents": 33,
        "totalTeachers": 4,
        "emisCode": "240101002",
        "principalName": "सरिता अधिकारी",
        "contactPhone": "9841334412",
        "email": "devi.basic@gmail.com",
        "tole": "माथिल्लो बाँसखर्क",
        "latitude": 27.9480,
        "longitude": 85.6170,
        "hasIctLab": False,
        "hasLibrary": True,
        "hasScienceLab": False,
        "hasDrinkingWater": True,
        "hasElectricity": True,
        "facilities": ["बालविकास कोठा", "खानेपानी", "शौचालय"]
    },

    # WARD 2: बरुवा
    {
        "id": "sch-02-01",
        "name": "श्री बरुवा माध्यमिक विद्यालय",
        "nameEn": "Shree Baruwa Secondary School",
        "wardNumber": 2,
        "type": "public",
        "level": "secondary",
        "levelDetails": "माध्यमिक (१-१०)",
        "totalStudents": 320,
        "maleStudents": 155,
        "femaleStudents": 165,
        "totalTeachers": 14,
        "emisCode": "240102001",
        "principalName": "दोर्जे ग्याल्बो लामा",
        "contactPhone": "9841554422",
        "email": "baruwa.secondary@gmail.com",
        "tole": "बरुवा मुख्य बस्ती",
        "latitude": 27.9545,
        "longitude": 85.5895,
        "hasIctLab": True,
        "hasLibrary": True,
        "hasScienceLab": False,
        "hasDrinkingWater": True,
        "hasElectricity": True,
        "facilities": ["कम्प्युटर ल्याब", "पुस्तकालय", "स्वच्छ खानेपानी", "फुटबल मैदान"]
    },
    {
        "id": "sch-02-02",
        "name": "श्री छिम्ती आधारभूत विद्यालय",
        "nameEn": "Shree Chhimti Basic School",
        "wardNumber": 2,
        "type": "community",
        "level": "basic",
        "levelDetails": "आधारभूत (१-८)",
        "totalStudents": 95,
        "maleStudents": 46,
        "femaleStudents": 49,
        "totalTeachers": 5,
        "emisCode": "240102002",
        "principalName": "कर्मा शेर्पा",
        "contactPhone": "9841554423",
        "email": "chhimti.basic@gmail.com",
        "tole": "छिम्ती बजार",
        "latitude": 27.9590,
        "longitude": 85.5920,
        "hasIctLab": False,
        "hasLibrary": True,
        "hasScienceLab": False,
        "hasDrinkingWater": True,
        "hasElectricity": True,
        "facilities": ["पुस्तकालय", "खानेपानी", "छात्रा शौचालय"]
    },

    # WARD 3: भोताङ
    {
        "id": "sch-03-01",
        "name": "श्री भोताङ देवी माध्यमिक विद्यालय",
        "nameEn": "Shree Bhotang Devi Secondary School",
        "wardNumber": 3,
        "type": "public",
        "level": "secondary",
        "levelDetails": "माध्यमिक (१-१२, शिक्षा तथा मानविकी)",
        "totalStudents": 420,
        "maleStudents": 205,
        "femaleStudents": 215,
        "totalTeachers": 18,
        "emisCode": "240103001",
        "principalName": "पेम्बा दोर्जे शेर्पा",
        "contactPhone": "9849001133",
        "email": "bhotang.devi@gmail.com",
        "tole": "भोताङ बजार",
        "latitude": 27.9652,
        "longitude": 85.6105,
        "hasIctLab": True,
        "hasLibrary": True,
        "hasScienceLab": True,
        "hasDrinkingWater": True,
        "hasElectricity": True,
        "facilities": ["विज्ञान ल्याब", "आधुनिक ICT ल्याब", "ई-लाइब्रेरी", "छात्रावास", "सौर्य ऊर्जा"]
    },
    {
        "id": "sch-03-02",
        "name": "श्री आमायाङ्ग्री आधारभूत विद्यालय",
        "nameEn": "Shree Aamayanri Basic School",
        "wardNumber": 3,
        "type": "community",
        "level": "basic",
        "levelDetails": "आधारभूत (१-५)",
        "totalStudents": 60,
        "maleStudents": 29,
        "femaleStudents": 31,
        "totalTeachers": 3,
        "emisCode": "240103002",
        "principalName": "ल्हाक्पा डोल्मा लामा",
        "contactPhone": "9849001134",
        "email": "aamayanri.school@gmail.com",
        "tole": "याङ्ग्री बस्ती",
        "latitude": 27.9690,
        "longitude": 85.6150,
        "hasIctLab": False,
        "hasLibrary": True,
        "hasScienceLab": False,
        "hasDrinkingWater": True,
        "hasElectricity": True,
        "facilities": ["बालविकास केन्द्र", "खानेपानी"]
    },

    # WARD 4: थाङपालकोट / मानेखर्क
    {
        "id": "sch-04-01",
        "name": "श्री रैथाने माध्यमिक विद्यालय, मानेखर्क",
        "nameEn": "Shree Raithane Secondary School, Manekharka",
        "wardNumber": 4,
        "type": "public",
        "level": "secondary",
        "levelDetails": "माध्यमिक (१-१२, सिभिल इन्जिनियरिङ प्राविधिक धार)",
        "totalStudents": 490,
        "maleStudents": 242,
        "femaleStudents": 248,
        "totalTeachers": 21,
        "emisCode": "240104001",
        "principalName": "कृष्ण प्रसाद घिमिरे",
        "contactPhone": "9851088771",
        "email": "raithane.manekharka@gmail.com",
        "tole": "मानेखर्क बजार",
        "latitude": 27.9615,
        "longitude": 85.5985,
        "hasIctLab": True,
        "hasLibrary": True,
        "hasScienceLab": True,
        "hasDrinkingWater": True,
        "hasElectricity": True,
        "facilities": ["सिभिल इन्जिनियरिङ ल्याब", "कम्प्युटर ल्याब", "विज्ञान प्रयोगशाला", "स्मार्ट बोर्ड", "पुस्तकालय"]
    },
    {
        "id": "sch-04-02",
        "name": "श्री महाकाली आधारभूत विद्यालय",
        "nameEn": "Shree Mahakali Basic School",
        "wardNumber": 4,
        "type": "community",
        "level": "basic",
        "levelDetails": "आधारभूत (१-८)",
        "totalStudents": 115,
        "maleStudents": 55,
        "femaleStudents": 60,
        "totalTeachers": 6,
        "emisCode": "240104002",
        "principalName": "दीपक सापकोटा",
        "contactPhone": "9851088772",
        "email": "mahakali.basic@gmail.com",
        "tole": "थाङपालकोट डाँडा",
        "latitude": 27.9570,
        "longitude": 85.5840,
        "hasIctLab": False,
        "hasLibrary": True,
        "hasScienceLab": False,
        "hasDrinkingWater": True,
        "hasElectricity": True,
        "facilities": ["पुस्तकालय", "खानेपानी", "खेलमैदान"]
    },

    # WARD 5: गुन्सा
    {
        "id": "sch-05-01",
        "name": "श्री गुन्सा माध्यमिक विद्यालय",
        "nameEn": "Shree Gunsa Secondary School",
        "wardNumber": 5,
        "type": "public",
        "level": "secondary",
        "levelDetails": "माध्यमिक (१-१०)",
        "totalStudents": 295,
        "maleStudents": 145,
        "femaleStudents": 150,
        "totalTeachers": 13,
        "emisCode": "240105001",
        "principalName": "अर्जुन प्रसाद पराजुली",
        "contactPhone": "9841667799",
        "email": "gunsa.secondary@gmail.com",
        "tole": "गुन्सा मुख्य बजार",
        "latitude": 27.9238,
        "longitude": 85.5805,
        "hasIctLab": True,
        "hasLibrary": True,
        "hasScienceLab": False,
        "hasDrinkingWater": True,
        "hasElectricity": True,
        "facilities": ["कम्प्युटर ल्याब", "पुस्तकालय", "धारा", "शौचालय"]
    },
    {
        "id": "sch-05-02",
        "name": "श्री फल्चा आधारभूत विद्यालय",
        "nameEn": "Shree Falcha Basic School",
        "wardNumber": 5,
        "type": "community",
        "level": "basic",
        "levelDetails": "आधारभूत (१-५)",
        "totalStudents": 65,
        "maleStudents": 31,
        "femaleStudents": 34,
        "totalTeachers": 4,
        "emisCode": "240105002",
        "principalName": "गीता न्यौपाने",
        "contactPhone": "9841667798",
        "email": "falcha.school@gmail.com",
        "tole": "फल्चा डाँडा",
        "latitude": 27.9270,
        "longitude": 85.5840,
        "hasIctLab": False,
        "hasLibrary": True,
        "hasScienceLab": False,
        "hasDrinkingWater": True,
        "hasElectricity": True,
        "facilities": ["बालविकास केन्द्र", "खानेपानी"]
    },

    # WARD 6: थाङपालधाप / गाउँपालिका केन्द्र
    {
        "id": "sch-06-01",
        "name": "श्री थाङपालधाप माध्यमिक विद्यालय (नमुना विद्यालय)",
        "nameEn": "Shree Thangpaldhap Model Secondary School",
        "wardNumber": 6,
        "type": "public",
        "level": "secondary",
        "levelDetails": "माध्यमिक (१-१२, विज्ञान तथा व्यवस्थापन संकाय)",
        "totalStudents": 580,
        "maleStudents": 282,
        "femaleStudents": 298,
        "totalTeachers": 25,
        "emisCode": "240106001",
        "principalName": "नेत्र प्रसाद न्यौपाने",
        "contactPhone": "9851022339",
        "email": "thangpaldhap.model@gmail.com",
        "tole": "गाउँपालिका केन्द्र, थाङपालधाप",
        "latitude": 27.9402,
        "longitude": 85.5922,
        "hasIctLab": True,
        "hasLibrary": True,
        "hasScienceLab": True,
        "hasDrinkingWater": True,
        "hasElectricity": True,
        "facilities": ["डिजिटल स्मार्ट क्लास", "पूर्ण विज्ञान ल्याब", "ई-लाइब्रेरी", "अडिटोरियम हल", "खेलमैदान", "सौर्य ब्याकअप"]
    },
    {
        "id": "sch-06-02",
        "name": "पाँचपोखरी चिल्ड्रेन एकेडेमी",
        "nameEn": "Panchpokhari Children Academy",
        "wardNumber": 6,
        "type": "private",
        "level": "basic",
        "levelDetails": "आधारभूत (१-८, अंग्रेजी माध्यम)",
        "totalStudents": 140,
        "maleStudents": 70,
        "femaleStudents": 70,
        "totalTeachers": 8,
        "emisCode": "240106002",
        "principalName": "सुरेश चन्द्र श्रेष्ठ",
        "contactPhone": "9841229911",
        "email": "panchpokhari.academy@gmail.com",
        "tole": "धाप बजार",
        "latitude": 27.9420,
        "longitude": 85.5940,
        "hasIctLab": True,
        "hasLibrary": True,
        "hasScienceLab": False,
        "hasDrinkingWater": True,
        "hasElectricity": True,
        "facilities": ["कम्प्युटर ल्याब", "अंग्रेजी माध्यम पुस्तकालय", "बस सेवा"]
    },

    # WARD 7: भोटेनाम्लाङ / तिपेनी
    {
        "id": "sch-07-01",
        "name": "श्री भोटेनाम्लाङ माध्यमिक विद्यालय, तिपेनी",
        "nameEn": "Shree Bhotenamlang Secondary School, Tipeni",
        "wardNumber": 7,
        "type": "public",
        "level": "secondary",
        "levelDetails": "माध्यमिक (१-१०)",
        "totalStudents": 360,
        "maleStudents": 175,
        "femaleStudents": 185,
        "totalTeachers": 15,
        "emisCode": "240107001",
        "principalName": "टेक बहादुर श्रेष्ठ",
        "contactPhone": "9849332244",
        "email": "bhotenamlang.school@gmail.com",
        "tole": "तिपेनी मुख्य बजार",
        "latitude": 27.9120,
        "longitude": 85.5695,
        "hasIctLab": True,
        "hasLibrary": True,
        "hasScienceLab": True,
        "hasDrinkingWater": True,
        "hasElectricity": True,
        "facilities": ["ICT ल्याब", "विज्ञान प्रयोगशाला", "पुस्तकालय", "खेलकुद सामग्री"]
    },
    {
        "id": "sch-07-02",
        "name": "श्री जालपा देवी आधारभूत विद्यालय",
        "nameEn": "Shree Jalpa Devi Basic School",
        "wardNumber": 7,
        "type": "community",
        "level": "basic",
        "levelDetails": "आधारभूत (१-५)",
        "totalStudents": 75,
        "maleStudents": 36,
        "femaleStudents": 39,
        "totalTeachers": 4,
        "emisCode": "240107002",
        "principalName": "सविता दनुवार",
        "contactPhone": "9849332245",
        "email": "jalpadevi.basic@gmail.com",
        "tole": "जालपा डाँडा",
        "latitude": 27.9150,
        "longitude": 85.5720,
        "hasIctLab": False,
        "hasLibrary": True,
        "hasScienceLab": False,
        "hasDrinkingWater": True,
        "hasElectricity": True,
        "facilities": ["बालमैत्री कक्षाकोठा", "खानेपानी", "शौचालय"]
    },

    # WARD 8: लाँगर्चे
    {
        "id": "sch-08-01",
        "name": "श्री लाँगर्चे माध्यमिक विद्यालय",
        "nameEn": "Shree Langarche Secondary School",
        "wardNumber": 8,
        "type": "public",
        "level": "secondary",
        "levelDetails": "माध्यमिक (१-१०)",
        "totalStudents": 275,
        "maleStudents": 132,
        "femaleStudents": 143,
        "totalTeachers": 12,
        "emisCode": "240108001",
        "principalName": "ईश्वर पाण्डे",
        "contactPhone": "9851012355",
        "email": "langarche.secondary@gmail.com",
        "tole": "लाँगर्चे बजार",
        "latitude": 27.9090,
        "longitude": 85.5750,
        "hasIctLab": True,
        "hasLibrary": True,
        "hasScienceLab": False,
        "hasDrinkingWater": True,
        "hasElectricity": True,
        "facilities": ["कम्प्युटर कक्षा", "पुस्तकालय", "स्वच्छ खानेपानी", "भलिबल मैदान"]
    },
    {
        "id": "sch-08-02",
        "name": "श्री सेतीदेवी आधारभूत विद्यालय, लाँगर्चे",
        "nameEn": "Shree Setidevi Basic School",
        "wardNumber": 8,
        "type": "community",
        "level": "basic",
        "levelDetails": "आधारभूत (१-५)",
        "totalStudents": 70,
        "maleStudents": 34,
        "femaleStudents": 36,
        "totalTeachers": 4,
        "emisCode": "240108002",
        "principalName": "कमल गुरुङ",
        "contactPhone": "9851012356",
        "email": "setidevi.langarche@gmail.com",
        "tole": "माथिल्लो लाँगर्चे",
        "latitude": 27.9060,
        "longitude": 85.5780,
        "hasIctLab": False,
        "hasLibrary": True,
        "hasScienceLab": False,
        "hasDrinkingWater": True,
        "hasElectricity": True,
        "facilities": ["बालविकास कोठा", "खानेपानी", "शौचालय"]
    }
]

TEACHERS_DATA = [
    # WARD 1
    {"fullName": "राम बहादुर तामाङ", "schoolCode": "240101001", "designation": "प्रधानाध्यापक", "serviceType": "स्थायी", "mainSubject": "नेपाली", "qualification": "स्नातकोत्तर (M.Ed)", "contactPhone": "9841334411", "email": "ram.tamang@gmail.com"},
    {"fullName": "सुनिता सापकोटा", "schoolCode": "240101001", "designation": "मावि शिक्षक", "serviceType": "स्थायी", "mainSubject": "अंग्रेजी", "qualification": "स्नातकोत्तर (M.A. English)", "contactPhone": "9841334413", "email": "sunita.sapkota@gmail.com"},
    {"fullName": "विजय कुमार गोले", "schoolCode": "240101001", "designation": "मावि शिक्षक", "serviceType": "राहत", "mainSubject": "विज्ञान", "qualification": "स्नातक (B.Sc)", "contactPhone": "9841334414", "email": "bijay.gole@gmail.com"},
    {"fullName": "चमेली तामाङ", "schoolCode": "240101001", "designation": "निमावि शिक्षक", "serviceType": "स्थायी", "mainSubject": "गणित", "qualification": "स्नातक (B.Ed)", "contactPhone": "9841334415", "email": "chameli.tmg@gmail.com"},
    {"fullName": "सरिता अधिकारी", "schoolCode": "240101002", "designation": "प्रधानाध्यापक", "serviceType": "स्थायी", "mainSubject": "नेपाली", "qualification": "स्नातक (B.Ed)", "contactPhone": "9841334412", "email": "sarita.adhikari@gmail.com"},

    # WARD 2
    {"fullName": "दोर्जे ग्याल्बो लामा", "schoolCode": "240102001", "designation": "प्रधानाध्यापक", "serviceType": "स्थायी", "mainSubject": "सामाजिक", "qualification": "स्नातकोत्तर (M.A.)", "contactPhone": "9841554422", "email": "dorje.lama@gmail.com"},
    {"fullName": "कमला श्रेष्ठ", "schoolCode": "240102001", "designation": "मावि शिक्षक", "serviceType": "स्थायी", "mainSubject": "गणित", "qualification": "स्नातकोत्तर (M.Sc Math)", "contactPhone": "9841554424", "email": "kamala.shrestha@gmail.com"},
    {"fullName": "सुवास पण्डित", "schoolCode": "240102001", "designation": "निमावि शिक्षक", "serviceType": "राहत", "mainSubject": "अंग्रेजी", "qualification": "स्नातक (B.Ed)", "contactPhone": "9841554425", "email": "subash.pandit@gmail.com"},
    {"fullName": "कर्मा शेर्पा", "schoolCode": "240102002", "designation": "प्रधानाध्यापक", "serviceType": "स्थायी", "mainSubject": "नेपाली", "qualification": "स्नातक (B.Ed)", "contactPhone": "9841554423", "email": "karma.sherpa@gmail.com"},

    # WARD 3
    {"fullName": "पेम्बा दोर्जे शेर्पा", "schoolCode": "240103001", "designation": "प्रधानाध्यापक", "serviceType": "स्थायी", "mainSubject": "अंग्रेजी", "qualification": "स्नातकोत्तर (M.Ed English)", "contactPhone": "9849001133", "email": "pemba.sherpa@gmail.com"},
    {"fullName": "निमा शेर्पा", "schoolCode": "240103001", "designation": "उमावि शिक्षक", "serviceType": "स्थायी", "mainSubject": "अर्थशास्त्र", "qualification": "स्नातकोत्तर (M.A. Econ)", "contactPhone": "9849001135", "email": "nima.sherpa@gmail.com"},
    {"fullName": "डिकी डोल्मा लामा", "schoolCode": "240103001", "designation": "मावि शिक्षक", "serviceType": "राहत", "mainSubject": "विज्ञान", "qualification": "स्नातक (B.Sc)", "contactPhone": "9849001136", "email": "diki.lama@gmail.com"},
    {"fullName": "सुरेश कुमार तामाङ", "schoolCode": "240103001", "designation": "कम्प्युटर शिक्षक", "serviceType": "करार", "mainSubject": "कम्प्युटर/ICT", "qualification": "B.Sc CSIT", "contactPhone": "9849001137", "email": "suresh.ict@gmail.com"},
    {"fullName": "ल्हाक्पा डोल्मा लामा", "schoolCode": "240103002", "designation": "प्रधानाध्यापक", "serviceType": "स्थायी", "mainSubject": "प्रावि तह", "qualification": "प्रवीणता प्रमाणपत्र (10+2)", "contactPhone": "9849001134", "email": "lhakpa.dolma@gmail.com"},

    # WARD 4
    {"fullName": "कृष्ण प्रसाद घिमिरे", "schoolCode": "240104001", "designation": "प्रधानाध्यापक", "serviceType": "स्थायी", "mainSubject": "गणित", "qualification": "स्नातकोत्तर (M.Sc)", "contactPhone": "9851088771", "email": "krishna.ghimire@gmail.com"},
    {"fullName": "ई. विजय लामा", "schoolCode": "240104001", "designation": "इन्जिनियरिङ प्रशिक्षक", "serviceType": "करार", "mainSubject": "सिभिल इन्जिनियरिङ", "qualification": "B.E. Civil", "contactPhone": "9851088773", "email": "bijay.civil@gmail.com"},
    {"fullName": "मञ्जु सापकोटा", "schoolCode": "240104001", "designation": "मावि शिक्षक", "serviceType": "स्थायी", "mainSubject": "नेपाली", "qualification": "स्नातकोत्तर (M.A.)", "contactPhone": "9851088774", "email": "manju.sapkota@gmail.com"},
    {"fullName": "राजेश थापा", "schoolCode": "240104001", "designation": "मावि शिक्षक", "serviceType": "राहत", "mainSubject": "अंग्रेजी", "qualification": "स्नातक (B.Ed)", "contactPhone": "9851088775", "email": "rajesh.thapa@gmail.com"},
    {"fullName": "दीपक सापकोटा", "schoolCode": "240104002", "designation": "प्रधानाध्यापक", "serviceType": "स्थायी", "mainSubject": "सामाजिक", "qualification": "स्नातक (B.A.)", "contactPhone": "9851088772", "email": "deepak.sapkota@gmail.com"},

    # WARD 5
    {"fullName": "अर्जुन प्रसाद पराजुली", "schoolCode": "240105001", "designation": "प्रधानाध्यापक", "serviceType": "स्थायी", "mainSubject": "नेपाली", "qualification": "स्नातकोत्तर (M.A.)", "contactPhone": "9841667799", "email": "arjun.parajuli@gmail.com"},
    {"fullName": "कृष्ण बहादुर पण्डित", "schoolCode": "240105001", "designation": "मावि शिक्षक", "serviceType": "स्थायी", "mainSubject": "गणित", "qualification": "स्नातक (B.Sc)", "contactPhone": "9841667791", "email": "krishna.pandit@gmail.com"},
    {"fullName": "सुनिता कार्की", "schoolCode": "240105001", "designation": "निमावि शिक्षक", "serviceType": "राहत", "mainSubject": "विज्ञान", "qualification": "स्नातक (B.Sc)", "contactPhone": "9841667792", "email": "sunita.karki@gmail.com"},
    {"fullName": "गीता न्यौपाने", "schoolCode": "240105002", "designation": "प्रधानाध्यापक", "serviceType": "स्थायी", "mainSubject": "प्रावि तह", "qualification": "स्नातक (B.Ed)", "contactPhone": "9841667798", "email": "geeta.neupane@gmail.com"},

    # WARD 6
    {"fullName": "नेत्र प्रसाद न्यौपाने", "schoolCode": "240106001", "designation": "प्रधानाध्यापक (नमुना विद्यालय)", "serviceType": "स्थायी", "mainSubject": "विज्ञान/भौतिकशास्त्र", "qualification": "स्नातकोत्तर (M.Sc Physics)", "contactPhone": "9851022339", "email": "netra.neupane@gmail.com"},
    {"fullName": "डा. अच्युत ढुङ्गाना", "schoolCode": "240106001", "designation": "उमावि शिक्षक", "serviceType": "स्थायी", "mainSubject": "रसायनशास्त्र", "qualification": "Ph.D./M.Sc Chemistry", "contactPhone": "9851022340", "email": "achyut.chem@gmail.com"},
    {"fullName": "शर्मिला खतिवडा", "schoolCode": "240106001", "designation": "उमावि शिक्षक", "serviceType": "स्थायी", "mainSubject": "जीवविज्ञान (Biology)", "qualification": "स्नातकोत्तर (M.Sc Zoology)", "contactPhone": "9851022341", "email": "sharmila.bio@gmail.com"},
    {"fullName": "ई. सुशान्त दाहाल", "schoolCode": "240106001", "designation": "कम्प्युटर/ICT प्रमुख", "serviceType": "करार", "mainSubject": "कम्प्युटर साइन्स", "qualification": "B.E. Computer", "contactPhone": "9851022342", "email": "sushant.it@gmail.com"},
    {"fullName": "सुरेश चन्द्र श्रेष्ठ", "schoolCode": "240106002", "designation": "प्रधानाध्यापक", "serviceType": "संस्थागत", "mainSubject": "अंग्रेजी", "qualification": "स्नातक (B.A. English)", "contactPhone": "9841229911", "email": "suresh.academy@gmail.com"},

    # WARD 7
    {"fullName": "टेक बहादुर श्रेष्ठ", "schoolCode": "240107001", "designation": "प्रधानाध्यापक", "serviceType": "स्थायी", "mainSubject": "गणित", "qualification": "स्नातकोत्तर (M.Sc Math)", "contactPhone": "9849332244", "email": "tek.shrestha@gmail.com"},
    {"fullName": "राजु दनुवार", "schoolCode": "240107001", "designation": "मावि शिक्षक", "serviceType": "स्थायी", "mainSubject": "नेपाली", "qualification": "स्नातक (B.Ed)", "contactPhone": "9849332246", "email": "raju.danuwar@gmail.com"},
    {"fullName": "सविता श्रेष्ठ", "schoolCode": "240107001", "designation": "निमावि शिक्षक", "serviceType": "राहत", "mainSubject": "विज्ञान", "qualification": "स्नातक (B.Sc)", "contactPhone": "9849332247", "email": "savita.shrestha@gmail.com"},
    {"fullName": "सविता दनुवार", "schoolCode": "240107002", "designation": "प्रधानाध्यापक", "serviceType": "स्थायी", "mainSubject": "प्रावि तह", "qualification": "प्रवीणता प्रमाणपत्र (10+2)", "contactPhone": "9849332245", "email": "savita.danuwar@gmail.com"},

    # WARD 8
    {"fullName": "ईश्वर पाण्डे", "schoolCode": "240108001", "designation": "प्रधानाध्यापक", "serviceType": "स्थायी", "mainSubject": "सामाजिक", "qualification": "स्नातकोत्तर (M.A.)", "contactPhone": "9851012355", "email": "ishwor.pandey@gmail.com"},
    {"fullName": "कमल गुरुङ", "schoolCode": "240108001", "designation": "मावि शिक्षक", "serviceType": "स्थायी", "mainSubject": "अंग्रेजी", "qualification": "स्नातक (B.Ed)", "contactPhone": "9851012357", "email": "kamal.gurung@gmail.com"},
    {"fullName": "पार्वती खत्री", "schoolCode": "240108001", "designation": "निमावि शिक्षक", "serviceType": "राहत", "mainSubject": "गणित", "qualification": "स्नातक (B.Ed)", "contactPhone": "9851012358", "email": "parbati.khatri@gmail.com"},
    {"fullName": "राम कुमार खत्री", "schoolCode": "240108002", "designation": "प्रधानाध्यापक", "serviceType": "स्थायी", "mainSubject": "प्रावि तह", "qualification": "स्नातक (B.A.)", "contactPhone": "9851012356", "email": "ram.khatri@gmail.com"}
]

STUDENTS_SAMPLE = [
    # Banskharka
    {"fullName": "रोशन तामाङ", "schoolCode": "240101001", "classGrade": "कक्षा १०", "rollNumber": 1, "gender": "छात्र", "dob": "२०६५-०४-१५", "parentName": "सोम बहादुर तामाङ", "contactPhone": "9841334401", "casteCategory": "जनजाति", "scholarshipType": "जेहेन्दार छात्रवृत्ति"},
    {"fullName": "आस्मा सापकोटा", "schoolCode": "240101001", "classGrade": "कक्षा १०", "rollNumber": 2, "gender": "छात्रा", "dob": "२०६५-०६-२०", "parentName": "गोविन्द सापकोटा", "contactPhone": "9841334402", "casteCategory": "ब्राह्मण/क्षेत्री", "scholarshipType": "छात्रा प्रोत्साहन छात्रवृत्ति"},
    {"fullName": "सुदीप गोले", "schoolCode": "240101001", "classGrade": "कक्षा ९", "rollNumber": 1, "gender": "छात्र", "dob": "२०६६-०३-१२", "parentName": "दावा गोले", "contactPhone": "9841334403", "casteCategory": "जनजाति", "scholarshipType": "छैन"},
    {"fullName": "मनिषा विक", "schoolCode": "240101001", "classGrade": "कक्षा ८", "rollNumber": 5, "gender": "छात्रा", "dob": "२०६७-०८-१०", "parentName": "मान बहादुर विक", "contactPhone": "9841334404", "casteCategory": "दलित", "scholarshipType": "दलित छात्रवृत्ति"},

    # Baruwa
    {"fullName": "पेम्बा लामा", "schoolCode": "240102001", "classGrade": "कक्षा १०", "rollNumber": 1, "gender": "छात्र", "dob": "२०६५-०१-१०", "parentName": "दोर्जे लामा", "contactPhone": "9841554401", "casteCategory": "जनजाति", "scholarshipType": "जेहेन्दार छात्रवृत्ति"},
    {"fullName": "सिता श्रेष्ठ", "schoolCode": "240102001", "classGrade": "कक्षा १०", "rollNumber": 2, "gender": "छात्रा", "dob": "२०६५-०५-१८", "parentName": "हरि श्रेष्ठ", "contactPhone": "9841554402", "casteCategory": "जनजाति", "scholarshipType": "छात्रा प्रोत्साहन छात्रवृत्ति"},
    {"fullName": "छिरिङ तामाङ", "schoolCode": "240102001", "classGrade": "कक्षा ६", "rollNumber": 3, "gender": "छात्र", "dob": "२०६९-०२-११", "parentName": "निमा तामाङ", "contactPhone": "9841554403", "casteCategory": "जनजाति", "scholarshipType": "छैन"},

    # Bhotang
    {"fullName": "आङ दावा शेर्पा", "schoolCode": "240103001", "classGrade": "कक्षा १२", "rollNumber": 1, "gender": "छात्र", "dob": "२०६३-०२-०५", "parentName": "पासाङ शेर्पा", "contactPhone": "9849001101", "casteCategory": "जनजाति", "scholarshipType": "जेहेन्दार छात्रवृत्ति"},
    {"fullName": "डोल्मा शेर्पा", "schoolCode": "240103001", "classGrade": "कक्षा १२", "rollNumber": 2, "gender": "छात्रा", "dob": "२०६३-०७-१४", "parentName": "मिङ्मा शेर्पा", "contactPhone": "9849001102", "casteCategory": "जनजाति", "scholarshipType": "छात्रा प्रोत्साहन छात्रवृत्ति"},
    {"fullName": "सुमन तामाङ", "schoolCode": "240103001", "classGrade": "कक्षा ११", "rollNumber": 3, "gender": "छात्र", "dob": "२०६४-११-२५", "parentName": "सुरेश तामाङ", "contactPhone": "9849001103", "casteCategory": "जनजाति", "scholarshipType": "छैन"},
    {"fullName": "सुनिता परियार", "schoolCode": "240103001", "classGrade": "कक्षा ९", "rollNumber": 4, "gender": "छात्रा", "dob": "२०६६-०९-३०", "parentName": "राम परियार", "contactPhone": "9849001104", "casteCategory": "दलित", "scholarshipType": "दलित छात्रवृत्ति"},

    # Thangpalkot
    {"fullName": "अर्जुन घिमिरे", "schoolCode": "240104001", "classGrade": "कक्षा १२ (सिभिल)", "rollNumber": 1, "gender": "छात्र", "dob": "२०६३-०४-०२", "parentName": "माधव घिमिरे", "contactPhone": "9851088701", "casteCategory": "ब्राह्मण/क्षेत्री", "scholarshipType": "जेहेन्दार छात्रवृत्ति"},
    {"fullName": "रञ्जिता सापकोटा", "schoolCode": "240104001", "classGrade": "कक्षा १२ (सिभिल)", "rollNumber": 2, "gender": "छात्रा", "dob": "२०६३-०८-१२", "parentName": "केशव सापकोटा", "contactPhone": "9851088702", "casteCategory": "ब्राह्मण/क्षेत्री", "scholarshipType": "प्राविधिक धार छात्रवृत्ति"},
    {"fullName": "सन्तोष लामा", "schoolCode": "240104001", "classGrade": "कक्षा १०", "rollNumber": 1, "gender": "छात्र", "dob": "२०६५-१०-०५", "parentName": "कामी लामा", "contactPhone": "9851088703", "casteCategory": "जनजाति", "scholarshipType": "छैन"},

    # Gunsa
    {"fullName": "विशाल पराजुली", "schoolCode": "240105001", "classGrade": "कक्षा १०", "rollNumber": 1, "gender": "छात्र", "dob": "२०६५-०२-२२", "parentName": "हरि पराजुली", "contactPhone": "9841667701", "casteCategory": "ब्राह्मण/क्षेत्री", "scholarshipType": "जेहेन्दार छात्रवृत्ति"},
    {"fullName": "पूजा पण्डित", "schoolCode": "240105001", "classGrade": "कक्षा ९", "rollNumber": 2, "gender": "छात्रा", "dob": "२०६६-०५-१४", "parentName": "कृष्ण पण्डित", "contactPhone": "9841667702", "casteCategory": "ब्राह्मण/क्षेत्री", "scholarshipType": "छात्रा प्रोत्साहन छात्रवृत्ति"},

    # Thangpaldhap (Model School)
    {"fullName": "विवेक न्यौपाने", "schoolCode": "240106001", "classGrade": "कक्षा १२ (विज्ञान)", "rollNumber": 1, "gender": "छात्र", "dob": "२०६३-०१-१५", "parentName": "मुकुन्द न्यौपाने", "contactPhone": "9851022301", "casteCategory": "ब्राह्मण/क्षेत्री", "scholarshipType": "नमुना विद्यालय छात्रवृत्ति"},
    {"fullName": "आयुषा श्रेष्ठ", "schoolCode": "240106001", "classGrade": "कक्षा १२ (विज्ञान)", "rollNumber": 2, "gender": "छात्रा", "dob": "२०६३-०६-२५", "parentName": "सुरेश श्रेष्ठ", "contactPhone": "9851022302", "casteCategory": "जनजाति", "scholarshipType": "छात्रा विज्ञान छात्रवृत्ति"},
    {"fullName": "रोनिश तामाङ", "schoolCode": "240106001", "classGrade": "कक्षा ११ (व्यवस्थापन)", "rollNumber": 1, "gender": "छात्र", "dob": "२०६४-०४-११", "parentName": "सोम तामाङ", "contactPhone": "9851022303", "casteCategory": "जनजाति", "scholarshipType": "छैन"},
    {"fullName": "सुष्मा मिजार", "schoolCode": "240106001", "classGrade": "कक्षा १०", "rollNumber": 3, "gender": "छात्रा", "dob": "२०६५-१२-०२", "parentName": "गोरे मिजार", "contactPhone": "9851022304", "casteCategory": "दलित", "scholarshipType": "दलित छात्रवृत्ति"},

    # Bhotenamlang
    {"fullName": "प्रदीप श्रेष्ठ", "schoolCode": "240107001", "classGrade": "कक्षा १०", "rollNumber": 1, "gender": "छात्र", "dob": "२०६५-०३-१७", "parentName": "उत्तम श्रेष्ठ", "contactPhone": "9849332201", "casteCategory": "जनजाति", "scholarshipType": "जेहेन्दार छात्रवृत्ति"},
    {"fullName": "सपना दनुवार", "schoolCode": "240107001", "classGrade": "कक्षा १०", "rollNumber": 2, "gender": "छात्रा", "dob": "२०६५-०७-०८", "parentName": "सुब्बा दनुवार", "contactPhone": "9849332202", "casteCategory": "जनजाति", "scholarshipType": "लोपोन्मुख दनुवार छात्रवृत्ति"},

    # Langarche
    {"fullName": "उमेश पाण्डे", "schoolCode": "240108001", "classGrade": "कक्षा १०", "rollNumber": 1, "gender": "छात्र", "dob": "२०६५-०५-०१", "parentName": "कमल पाण्डे", "contactPhone": "9851012301", "casteCategory": "ब्राह्मण/क्षेत्री", "scholarshipType": "जेहेन्दार छात्रवृत्ति"},
    {"fullName": "रितु गुरुङ", "schoolCode": "240108001", "classGrade": "कक्षा ९", "rollNumber": 2, "gender": "छात्रा", "dob": "२०६६-०८-१५", "parentName": "डम्बर गुरुङ", "contactPhone": "9851012302", "casteCategory": "जनजाति", "scholarshipType": "छात्रा प्रोत्साहन छात्रवृत्ति"}
]

NUTRITION_DATA = [
    {"schoolName": "श्री बाँसखर्क माध्यमिक विद्यालय (बालविकास-५)", "wardNumber": 1, "beneficiaryCount": 160, "monthlyDisbursed": 52800.0, "status": "Active"},
    {"schoolName": "श्री देवी आधारभूत विद्यालय, बाँसखर्क", "wardNumber": 1, "beneficiaryCount": 65, "monthlyDisbursed": 21450.0, "status": "Active"},
    {"schoolName": "श्री बरुवा माध्यमिक विद्यालय (बालविकास-५)", "wardNumber": 2, "beneficiaryCount": 180, "monthlyDisbursed": 59400.0, "status": "Active"},
    {"schoolName": "श्री छिम्ती आधारभूत विद्यालय, बरुवा", "wardNumber": 2, "beneficiaryCount": 95, "monthlyDisbursed": 31350.0, "status": "Active"},
    {"schoolName": "श्री भोताङ देवी माध्यमिक विद्यालय (बालविकास-५)", "wardNumber": 3, "beneficiaryCount": 210, "monthlyDisbursed": 69300.0, "status": "Active"},
    {"schoolName": "श्री आमायाङ्ग्री आधारभूत विद्यालय, भोताङ", "wardNumber": 3, "beneficiaryCount": 60, "monthlyDisbursed": 19800.0, "status": "Active"},
    {"schoolName": "श्री रैथाने माध्यमिक विद्यालय, मानेखर्क (बालविकास-५)", "wardNumber": 4, "beneficiaryCount": 230, "monthlyDisbursed": 75900.0, "status": "Active"},
    {"schoolName": "श्री महाकाली आधारभूत विद्यालय, थाङपालकोट", "wardNumber": 4, "beneficiaryCount": 115, "monthlyDisbursed": 37950.0, "status": "Active"},
    {"schoolName": "श्री गुन्सा माध्यमिक विद्यालय (बालविकास-५)", "wardNumber": 5, "beneficiaryCount": 150, "monthlyDisbursed": 49500.0, "status": "Active"},
    {"schoolName": "श्री फल्चा आधारभूत विद्यालय, गुन्सा", "wardNumber": 5, "beneficiaryCount": 65, "monthlyDisbursed": 21450.0, "status": "Active"},
    {"schoolName": "श्री थाङपालधाप माध्यमिक विद्यालय (बालविकास-५)", "wardNumber": 6, "beneficiaryCount": 260, "monthlyDisbursed": 85800.0, "status": "Active"},
    {"schoolName": "श्री भोटेनाम्लाङ माध्यमिक विद्यालय, तिपेनी (बालविकास-५)", "wardNumber": 7, "beneficiaryCount": 190, "monthlyDisbursed": 62700.0, "status": "Active"},
    {"schoolName": "श्री जालपा देवी आधारभूत विद्यालय, भोटेनाम्लाङ", "wardNumber": 7, "beneficiaryCount": 75, "monthlyDisbursed": 24750.0, "status": "Active"},
    {"schoolName": "श्री लाँगर्चे माध्यमिक विद्यालय (बालविकास-५)", "wardNumber": 8, "beneficiaryCount": 140, "monthlyDisbursed": 46200.0, "status": "Active"},
    {"schoolName": "श्री सेतीदेवी आधारभूत विद्यालय, लाँगर्चे", "wardNumber": 8, "beneficiaryCount": 70, "monthlyDisbursed": 23100.0, "status": "Active"}
]

def seed_education():
    conn = psycopg2.connect(DB_URI)
    cur = conn.cursor()

    print("--- STEP 1: Seeding Schools Table ---")
    cur.execute("DELETE FROM education_attendance")
    cur.execute("DELETE FROM education_nutrition")
    cur.execute("DELETE FROM students")
    cur.execute("DELETE FROM teachers")
    cur.execute("DELETE FROM schools")

    school_code_to_id = {}

    for s in SCHOOLS_DATA:
        s_id = str(uuid.uuid4())
        school_code_to_id[s["emisCode"]] = (s_id, s["name"])
        cur.execute("""
            INSERT INTO schools (
                id, name, "nameEn", "wardNumber", type, level, "levelDetails",
                "totalStudents", "totalTeachers", "maleStudents", "femaleStudents",
                "emisCode", "principalName", "contactPhone", email, tole,
                latitude, longitude, "hasIctLab", "hasLibrary", "hasScienceLab",
                "hasDrinkingWater", "hasElectricity", facilities, "createdAt", "updatedAt"
            ) VALUES (
                %s, %s, %s, %s, %s, %s, %s,
                %s, %s, %s, %s,
                %s, %s, %s, %s, %s,
                %s, %s, %s, %s, %s,
                %s, %s, %s, %s, %s
            )
        """, (
            s_id,
            s["name"],
            s["nameEn"],
            s["wardNumber"],
            s["type"],
            s["level"],
            s["levelDetails"],
            s["totalStudents"],
            s["totalTeachers"],
            s["maleStudents"],
            s["femaleStudents"],
            s["emisCode"],
            s["principalName"],
            s["contactPhone"],
            s["email"],
            s["tole"],
            s["latitude"],
            s["longitude"],
            s["hasIctLab"],
            s["hasLibrary"],
            s["hasScienceLab"],
            s["hasDrinkingWater"],
            s["hasElectricity"],
            json.dumps(s["facilities"], ensure_ascii=False),
            datetime.utcnow(),
            datetime.utcnow()
        ))
    conn.commit()
    print(f"✓ Successfully seeded {len(SCHOOLS_DATA)} schools across Wards 1 to 8 into 'schools' table.")

    print("\n--- STEP 2: Seeding Teachers Table ---")
    for t in TEACHERS_DATA:
        s_info = school_code_to_id.get(t["schoolCode"])
        s_id = s_info[0] if s_info else None
        cur.execute("""
            INSERT INTO teachers (
                id, "fullName", "schoolId", designation, "serviceType",
                "mainSubject", qualification, "contactPhone", email,
                "createdAt", "updatedAt"
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            str(uuid.uuid4()),
            t["fullName"],
            s_id,
            t["designation"],
            t["serviceType"],
            t["mainSubject"],
            t["qualification"],
            t["contactPhone"],
            t["email"],
            datetime.utcnow(),
            datetime.utcnow()
        ))
    conn.commit()
    print(f"✓ Successfully seeded {len(TEACHERS_DATA)} teachers into 'teachers' table.")

    print("\n--- STEP 3: Seeding Students Table ---")
    for idx, st in enumerate(STUDENTS_SAMPLE):
        s_info = school_code_to_id.get(st["schoolCode"])
        s_id = s_info[0] if s_info else None
        adm_no = f"IEMIS-{st['schoolCode']}-{st.get('rollNumber', idx+1):03d}"
        cur.execute("""
            INSERT INTO students (
                id, "fullName", "admissionNo", "schoolId", "classGrade",
                "rollNumber", gender, dob, "parentName", "contactPhone",
                "casteCategory", "scholarshipType", "createdAt", "updatedAt"
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            str(uuid.uuid4()),
            st["fullName"],
            adm_no,
            s_id,
            st["classGrade"],
            st["rollNumber"],
            st["gender"],
            st["dob"],
            st["parentName"],
            st["contactPhone"],
            st["casteCategory"],
            st["scholarshipType"],
            datetime.utcnow(),
            datetime.utcnow()
        ))
    conn.commit()
    print(f"✓ Successfully seeded {len(STUDENTS_SAMPLE)} IEMIS students into 'students' table.")

    print("\n--- STEP 4: Seeding Midday Nutrition Table ---")
    for n in NUTRITION_DATA:
        cur.execute("""
            INSERT INTO education_nutrition (
                id, "schoolName", "wardNumber", "beneficiaryCount", "monthlyDisbursed",
                status, "createdAt", "updatedAt"
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            str(uuid.uuid4()),
            n["schoolName"],
            n["wardNumber"],
            n["beneficiaryCount"],
            n["monthlyDisbursed"],
            n["status"],
            datetime.utcnow(),
            datetime.utcnow()
        ))
    conn.commit()
    print(f"✓ Successfully seeded {len(NUTRITION_DATA)} nutrition records into 'education_nutrition' table.")

    print("\n--- STEP 5: Seeding Smart Attendance Table ---")
    today_str = datetime.now().strftime("%Y-%m-%d")
    for t in TEACHERS_DATA[:15]:
        s_info = school_code_to_id.get(t["schoolCode"])
        s_id = s_info[0] if s_info else None
        s_name = s_info[1] if s_info else "गाउँपालिका विद्यालय"
        cur.execute("""
            INSERT INTO education_attendance (
                id, date, "userName", "userType", "schoolId", "schoolName",
                "inTime", "outTime", status, "deviceId", "createdAt", "updatedAt"
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            str(uuid.uuid4()),
            today_str,
            t["fullName"],
            "teacher",
            s_id,
            s_name,
            "09:48:12",
            "16:05:30",
            "Present",
            "BIO-APP-01",
            datetime.utcnow(),
            datetime.utcnow()
        ))
    conn.commit()
    print(f"✓ Successfully seeded 15 smart attendance records into 'education_attendance' table.")

    # Verification queries
    print("\n--- Summary Verification ---")
    cur.execute("SELECT count(*) FROM schools")
    print(f"schools: {cur.fetchone()[0]}")
    cur.execute("SELECT count(*) FROM teachers")
    print(f"teachers: {cur.fetchone()[0]}")
    cur.execute("SELECT count(*) FROM students")
    print(f"students: {cur.fetchone()[0]}")
    cur.execute("SELECT count(*) FROM education_nutrition")
    print(f"education_nutrition: {cur.fetchone()[0]}")
    cur.execute("SELECT count(*) FROM education_attendance")
    print(f"education_attendance: {cur.fetchone()[0]}")

    cur.close()
    conn.close()

if __name__ == '__main__':
    seed_education()
