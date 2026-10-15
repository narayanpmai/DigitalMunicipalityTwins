import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './FacilityDetailPage.css';
import { projectsApi } from '../../api/projects';
import { municipalityApi } from '../../api/municipality';

interface FacilityDetailPageProps {
  forcedType?: 'school' | 'health_post' | 'ward_office' | 'viewpoint';
}

// Synchronous helper providing instant, authentic baseline profiles with 0ms loading delay
const getBaselineProfile = (rawId: string, forcedType?: string): any => {
  const facilityId = rawId || '37';
  const isKatari = facilityId === '37' || facilityId.toLowerCase() === 'sch014' || facilityId.toLowerCase() === 'sch-37';
  const facilityType = forcedType || (
    isKatari || facilityId.startsWith('s_') ? 'school' :
    facilityId.startsWith('h_') ? 'health_post' :
    facilityId.startsWith('w_') ? 'ward_office' :
    facilityId.startsWith('t_') ? 'viewpoint' : 'school'
  );

  const palikaName = isKatari ? 'कटारी नगरपालिका, उदयपुर' : 'पाँचपोखरी थाङपाल गाउँपालिका, सिन्धुपाल्चोक';

  // 1. KATARI REFERENCE SCHOOL 37
  if (isKatari) {
    return {
      id: '37',
      name: 'मदरल्याण्ड तालिमुल कुरान कटारी',
      nameEn: 'Motherland Talimul Quran Katari',
      code: 'SCH014',
      type: 'school',
      categoryNepali: 'सामुदायिक विद्यालय (१-१०)',
      wardNo: 3,
      municipality: 'कटारी नगरपालिका, उदयपुर',
      establishedDate: '२०६२ साल',
      lat: 26.963459,
      lng: 86.368172,
      contact: '035-450123',
      email: 'info.motherland@katarimun.gov.np',
      website: 'https://katarimun.deeyosoft.com/schools/37',
      slogan: 'ज्ञान, अनुशासन, चरित्र निर्माण र प्रविधिमैत्री शिक्षा हाम्रो प्रतिबद्धता',
      aboutSchool: {
        schoolOverview: 'मदरल्याण्ड तालिमुल कुरान कटारी, कटारी नगरपालिका–३, उदयपुरमा अवस्थित एक उत्कृष्ट सामुदायिक विद्यालय हो। यस विद्यालयमा कक्षा बालविकास (ECED) देखि कक्षा १० सम्म आधुनिक, समावेशी तथा प्रविधिमैत्री वातावरणमा पठनपाठन हुँदै आएको छ।',
        vision: 'विद्यालयको भिजन (Vision): गुणस्तरीय, समावेशी, प्रविधिमैत्री तथा जीवनोपयोगी शिक्षा प्रदान गरी अनुशासित, दक्ष, राष्ट्रप्रेमी र प्रतिस्पर्धी नागरिक उत्पादन गर्ने।',
        mission: 'विद्यालयको मिसन (Mission): विद्यार्थी केन्द्रित, गुणस्तरीय तथा समावेशी शिक्षण–सिकाइ सुनिश्चित गर्ने, शिक्षकहरूको पेसागत क्षमता विकास गर्ने र समुदायसँगको सहकार्यलाई मजबुत बनाउने।',
        objectives: [
          '१. विद्यार्थीहरूको सिकाइ उपलब्धि कम्तीमा ८५% पुर्याउने।',
          '२. आधुनिक सूचना तथा सञ्चार प्रविधि (ICT) को माध्यमबाट कक्षाकोठा शिक्षण प्रभावकारी बनाउने।',
          '३. लैंगिक समानता, बालमैत्री वातावरण तथा समावेशी शिक्षा पद्धति प्रवर्धन गर्ने।',
          '४. अतिरिक्त क्रियाकलाप, खेलकुद तथा नैतिक शिक्षामा विद्यार्थीहरूलाई अग्रसर गराउने।',
          '५. शतप्रतिशत विद्यार्थीहरूको वार्षिक निरन्तरता तथा शून्य ड्रपआउट दर कायम गर्ने।'
        ],
        principalName: 'मोहम्मद नुरुल हुदा',
        principalMessage: 'हाम्रो विद्यालयले बालबालिकाको सर्वाङ्गीण विकासका लागि सैद्धान्तिक ज्ञानसँगै व्यावहारिक सीप र प्रविधिमैत्री शिक्षामा विशेष जोड दिँदै आएको छ।',
        smcPresident: 'हाजी अब्दुल रज्जाक',
        schoolAddress: 'कटारी नगरपालिका–३, उदयपुर, कोशी प्रदेश, नेपाल'
      },
      kpis: {
        totalStudents: 385,
        maleStudents: 184,
        femaleStudents: 201,
        totalTeachers: 18,
        totalClassrooms: 16,
        totalBuildings: 3,
        overallScore: 84.5,
        gradeClassification: 'उत्कृष्ट (६५ देखि ९० भन्दा कम अंक)',
        gradeColor: '#2563eb'
      },
      infrastructure: {
        hasIctLab: true,
        ictComputersCount: 24,
        hasLibrary: true,
        libraryBooksCount: 1450,
        hasScienceLab: true,
        hasDrinkingWater: true,
        hasElectricity: true,
        hasSolarBackup: true,
        hasPlayground: true,
        hasCompoundWall: true,
        totalToilets: 8,
        girlsSeparateToilet: true
      },
      academics: {
        academicYear: '२०८१',
        classes: [
          { grade: 'बालविकास (ECED)', boys: 18, girls: 22, total: 40 },
          { grade: 'कक्षा १', boys: 16, girls: 19, total: 35 },
          { grade: 'कक्षा २', boys: 17, girls: 18, total: 35 },
          { grade: 'कक्षा ३', boys: 19, girls: 20, total: 39 },
          { grade: 'कक्षा ४', boys: 18, girls: 21, total: 39 },
          { grade: 'कक्षा ५', boys: 20, girls: 18, total: 38 },
          { grade: 'कक्षा ६', boys: 19, girls: 21, total: 40 },
          { grade: 'कक्षा ७', boys: 18, girls: 22, total: 40 },
          { grade: 'कक्षा ८', boys: 20, girls: 20, total: 40 },
          { grade: 'कक्षा ९', boys: 15, girls: 22, total: 37 },
          { grade: 'कक्षा १० (SEE)', boys: 16, girls: 20, total: 36 }
        ],
        passRatePercentage: 94.2,
        scholarshipStudentsCount: 68
      },
      teachers: [
        { name: 'मोहम्मद नुरुल हुदा', role: 'प्रधानाध्यापक', qualification: 'एम.एड. (शिक्षा प्रशासन)', type: 'स्थायी' },
        { name: 'रमेश कुमार श्रेष्ठ', role: 'मा.वि. शिक्षक (गणित)', qualification: 'एम.एससी. (गणित)', type: 'स्थायी' },
        { name: 'सुनिता अधिकारी', role: 'मा.वि. शिक्षिका (अंग्रेजी)', qualification: 'एम.ए. (अंग्रेजी)', type: 'राहत' },
        { name: 'दिनेश कुमार चौधरी', role: 'मा.वि. शिक्षक (विज्ञान)', qualification: 'बी.एससी. बी.एड.', type: 'स्थायी' },
        { name: 'अञ्जना तामाङ', role: 'प्रा.वि. शिक्षिका', qualification: 'बी.एड.', type: 'पालिका अनुदान' },
        { name: 'फातिमा खातुन', role: 'बालविकास सहजकर्ता (ECED)', qualification: '+२ (शिक्षा)', type: 'स्थानीय स्रोत' }
      ],
      assessment: {
        academicYear: '२०८१',
        currentScore: 84.5,
        targetScore: 90.0,
        progressPercentage: 84.5,
        classification: 'उत्कृष्ट',
        scale: [
          { level: 'सर्वोकृष्ट', range: '९० वा सो भन्दा बढी अंक', color: '#10b981' },
          { level: 'उत्कृष्ट', range: '६५ देखि ९० भन्दा कम अंक', color: '#3b82f6', current: true },
          { level: 'मध्यम', range: '५० देखि ६५ भन्दा कम अंक', color: '#f59e0b' },
          { level: 'कमजोर', range: '३५ देखि ५० भन्दा कम अंक', color: '#f97316' },
          { level: 'अति कमजोर', range: '३५ भन्दा कम अंक', color: '#ef4444' }
        ],
        indicators: [
          { sn: 1, title: 'संस्थागत व्यवस्थापन तथा सुशासन', fullMarks: 20, obtainedMarks: 17.5, percentage: 87.5, classification: 'उत्कृष्ट' },
          { sn: 2, title: 'भौतिक पूर्वाधार तथा शैक्षिक वातावरण', fullMarks: 20, obtainedMarks: 16.0, percentage: 80.0, classification: 'उत्कृष्ट' },
          { sn: 3, title: 'शिक्षण सिकाइ, पाठ्यक्रम तथा प्रविधि', fullMarks: 25, obtainedMarks: 21.0, percentage: 84.0, classification: 'उत्कृष्ट' },
          { sn: 4, title: 'विद्यार्थी सिकाइ उपलब्धि तथा परीक्षा नतिजा', fullMarks: 25, obtainedMarks: 21.5, percentage: 86.0, classification: 'उत्कृष्ट' },
          { sn: 5, title: 'समावेशिता, सहभागिता तथा समुदाय सम्बन्ध', fullMarks: 10, obtainedMarks: 8.5, percentage: 85.0, classification: 'उत्कृष्ट' }
        ]
      }
    };
  }

  // 2. HEALTH POST / HOSPITAL
  if (facilityType === 'health_post') {
    return {
      id: facilityId,
      name: facilityId === 'h_01' ? 'पाँचपोखरी आधारभूत अस्पताल (१५ शय्या)' : 'थाङपालधाप स्वास्थ्य चौकी',
      code: 'HP-06-001',
      type: 'health_post',
      categoryNepali: 'आधारभूत अस्पताल (१५ शय्या)',
      wardNo: 6,
      municipality: palikaName,
      establishedDate: '२०४६ साल',
      lat: 27.9423,
      lng: 85.5941,
      contact: '०११-६९०१००',
      email: 'health@panchpokharimun.gov.np',
      slogan: 'सुलभ, गुणस्तरीय र चौबीसै घण्टा भरपर्दो आधारभूत स्वास्थ्य सेवा',
      aboutHealth: {
        overview: 'पाँचपोखरी आधारभूत अस्पताल सिन्धुपाल्चोकको पाँचपोखरी थाङपाल गाउँपालिकामा अवस्थित मुख्य १५ शय्याको अस्पताल हो। यहाँ दैनिक बाह्य बिरामी सेवा (OPD), २४ सै घण्टा आकस्मिक तथा सुरक्षित प्रसूति सेवा (Birthing Center), निःशुल्क औषधि वितरण तथा नियमित खोप सेवा प्रदान गरिन्छ।',
        vision: 'स्वस्थ, सचेत र दीर्घायु नागरिक—समुदायमै सर्वसुलभ आधारभूत स्वास्थ्य सेवाको ग्यारेन्टी।',
        mission: 'गुणस्तरीय प्राथमिक स्वास्थ्य सेवा, सुरक्षित मातृत्व, बाल स्वास्थ्य तथा सर्ने/नसर्ने रोगहरूको रोकथाम र नियन्त्रणलाई प्रभावकारी बनाउने।',
        hfomcPresident: 'वडा अध्यक्ष (वडा नं. ६)',
        inchargeName: 'डा. सन्तोष शर्मा (मेडिकल अधिकृत)',
        address: 'वडा नं. ६, पाँचपोखरी थाङपाल गाउँपालिका, सिन्धुपाल्चोक'
      },
      kpis: {
        totalBeds: 15,
        dailyOpdAvg: 75,
        totalStaff: 14,
        hasAmbulance: true,
        ambulanceContact: '९८५११००११२ (२४/७ सेवा)',
        institutionalDeliveryRate: 94.5,
        fullImmunizationRate: 98.8
      },
      services: [
        { name: 'दैनिक ओपीडी (OPD) सेवा', description: 'सामान्य चिकित्सा, परामर्श तथा उपचार (बिहान १० देखि ५ बजेसम्म)' },
        { name: '२४ घण्टे सुरक्षित प्रसूति सेवा (Birthing Center)', description: 'दक्ष प्रसूतिकर्मी (SBA) द्वारा निःशुल्क डेलिभरी तथा न्यानो झोला वितरण' },
        { name: 'आकस्मिक प्राथमिक उपचार (Emergency)', description: 'दुर्घटना, घाउचोट, प्राथमिक शल्यक्रिया तथा अक्सिजन सेवा' },
        { name: 'निःशुल्क अत्यावश्यक औषधि वितरण', description: 'नेपाल सरकारले तोकेका ९८ प्रकारका औषधिहरूको निःशुल्क वितरण' },
        { name: 'नियमित खोप तथा पोषण क्लिनिक', description: 'बालबालिका तथा गर्भवती महिलाहरूका लागि मासिक खोप तथा वृद्धि अनुगमन' },
        { name: 'ल्याब परीक्षण सेवा', description: 'रक्त समूह, सुगर, हेमोग्लोबिन, पिसाब, एचआईभी, मलेरिया तथा गर्भ जाँच' }
      ],
      infrastructure: {
        hasIndoorWard: true,
        totalBeds: 15,
        hasBirthingCenter: true,
        hasColdChain: true,
        coldChainType: 'Solar ILR (आइस-लाइन्ड रेफ्रिजरेटर)',
        hasDrinkingWater: true,
        hasAutoclave: true,
        hasGeneratorBackup: true
      },
      staffList: [
        { name: 'डा. सन्तोष शर्मा', designation: 'मेडिकल अधिकृत', qualification: 'एम.बी.बी.एस.' },
        { name: 'एच.ए. प्रकाश तामाङ', designation: 'सिनियर एच.ए.', qualification: 'बी.पी.एच. / एच.ए.' },
        { name: 'सुनिता लामा', designation: 'सिनियर अनमी (SBA)', qualification: 'अनमी (प्रसूतिकर्मी)' },
        { name: 'रमेश पौडेल', designation: 'अहेव (AHW)', qualification: 'सी.एम.ए.' },
        { name: 'संगीता दङ्गाल', designation: 'ल्याब असिस्टेन्ट', qualification: 'ल्याब प्राविधिक' },
        { name: 'महिला स्वास्थ्य स्वयंसेविका सञ्जाल', designation: '९ जना FCHV', qualification: 'समुदाय परिचालन' }
      ],
      medicineStock: {
        availableCount: 98,
        criticalStockList: ['Paracetamol', 'Amoxicillin', 'Metronidazole', 'Cetirizine', 'ORS / Zinc', 'Iron Folic Acid', 'Antacid', 'Oxytocin']
      }
    };
  }

  // 3. WARD OFFICE
  if (facilityType === 'ward_office') {
    const wardNum = facilityId.includes('0') ? Number(facilityId.replace(/\D/g, '')) || 4 : 4;
    return {
      id: facilityId,
      name: `वडा नं. ${wardNum} कार्यालय (मानेखर्क / थाङपालकोट)`,
      code: `WARD-0${wardNum}`,
      type: 'ward_office',
      categoryNepali: 'वडा कार्यालय',
      wardNo: wardNum,
      municipality: palikaName,
      establishedDate: '२०७३ साल',
      lat: 27.9640,
      lng: 85.6005,
      contact: '९८५११००००४',
      email: `ward${wardNum}@panchpokharimun.gov.np`,
      slogan: 'सुशासन, पारदर्शिता, जनसहभागिता र समृद्ध वडा निर्माण',
      aboutWard: {
        overview: `वडा नं. ${wardNum} कार्यालय पाँचपोखरी थाङपाल गाउँपालिकाको प्रमुख प्रशासनिक इकाई हो। यस वडाले नागरिकहरूलाई व्यक्तिगत घटना दर्ता, विभिन्न सिफारिस, सामाजिक सुरक्षा भत्ता वितरण, विकास योजना तर्जुमा तथा स्थानीय विवाद समाधान सम्बन्धी सेवाहरू प्रवाह गर्दछ।`,
        boundaries: {
          east: 'जुगल गाउँपालिका सिमाना',
          west: 'हेलम्बु गाउँपालिका सिमाना',
          north: 'लाङटाङ राष्ट्रिय निकुञ्ज',
          south: 'मेलम्ची नगरपालिका सिमाना'
        },
        mainSettlements: ['मानेखर्क बजार', 'थाङपालकोट', 'बेसीटोल', 'डाँडागाउँ'],
        areaSqKm: 32.4,
        chairpersonName: 'श्रीमान् वडा अध्यक्ष',
        secretaryName: 'श्री वडा सचिव',
        address: `वडा नं. ${wardNum} कार्यालय, पाँचपोखरी थाङपाल गाउँपालिका`
      },
      kpis: {
        totalPopulation: 4250,
        totalHouseholds: 960,
        annualBudget: 'रु. १ करोड २५ लाख',
        activeProjectsCount: 18,
        completedProjectsPercentage: 82.5
      },
      representatives: [
        { name: 'श्रीमान् वडा अध्यक्ष', designation: 'वडा अध्यक्ष', contact: '९८५११००००४' },
        { name: 'सुश्री महिला वडा सदस्य', designation: 'महिला वडा सदस्य', contact: '९८४१०००००१' },
        { name: 'सुश्री दलित महिला सदस्य', designation: 'दलित महिला सदस्य', contact: '९८४१०००००२' },
        { name: 'श्री खुला वडा सदस्य (१)', designation: 'खुला वडा सदस्य', contact: '९८४१०००००३' },
        { name: 'श्री खुला वडा सदस्य (२)', designation: 'खुला वडा सदस्य', contact: '९८४१०००००४' },
        { name: 'श्री वडा सचिव', designation: 'वडा सचिव (प्रशासनिक प्रमुख)', contact: '९८४१५५००११' }
      ],
      citizenCharter: [
        { service: 'जन्म, मृत्यु, विवाह, बसाइँसराइ दर्ता', timeline: 'तत्काल / सोही दिन', fee: 'निःशुल्क (३५ दिनभित्र)', docs: 'अस्पताल प्रमाण, नागरिकता' },
        { service: 'घरबाटो, बिजुली, खानेपानी सिफारिस', timeline: '१ दिन', fee: 'तोकिएबमोजिम', docs: 'लालपुर्जा, तिरो तिरेको रसिद' },
        { service: 'सामाजिक सुरक्षा भत्ता दर्ता तथा नवीकरण', timeline: 'तत्काल', fee: 'निःशुल्क', docs: 'नागरिकता, परिचयपत्र' },
        { service: 'नागरिकता प्रमाणपत्रको सिफारिस', timeline: '१ दिन', fee: 'रु. १००', docs: 'बाबु/आमाको नागरिकता, जन्मदर्ता' }
      ],
      developmentProjects: [
        { name: 'वडास्तरीय सडक स्तरोन्नति तथा ढलान', budget: 'रु. ३५ लाख', progress: '८५% सम्पन्न' },
        { name: 'एक घर एक धारा खानेपानी आयोजना', budget: 'रु. २५ लाख', progress: '९०% सम्पन्न' },
        { name: 'सामुदायिक भवन तथा विपद् आश्रयस्थल', budget: 'रु. २० लाख', progress: '७०% सम्पन्न' },
        { name: 'कृषि तथा पशुपालन अनुदान कार्यक्रम', budget: 'रु. १५ लाख', progress: '१००% सम्पन्न' }
      ],
      demographics: {
        literacyRate: 76.4,
        ethnicDistribution: [
          { group: 'तामाङ / ह्योल्मो', percentage: 62 },
          { group: 'क्षेत्री / ब्राह्मण', percentage: 22 },
          { group: 'दलित', percentage: 11 },
          { group: 'अन्य', percentage: 5 }
        ]
      }
    };
  }

  // 4. TOURISM LANDMARK
  return {
    id: facilityId,
    name: 'पाँचपोखरी तीर्थस्थल तथा ताल समूह (४,१०० मि.)',
    code: 'TOUR-01',
    type: 'viewpoint',
    categoryNepali: 'धार्मिक तथा पर्यटकीय स्थल',
    wardNo: 3,
    municipality: palikaName,
    altitudeMeters: 4100,
    bestSeason: 'भाद्र (जनैपूर्णिमा) / असोज - कार्तिक / चैत्र - बैशाख',
    trekDurationDays: 4,
    lat: 28.0250,
    lng: 85.6980,
    contact: '९८५१०००००३',
    slogan: 'अलौकिक पाँचपोखरी—प्रकृति, संस्कृति र हिमाली सौन्दर्यको संगम',
    aboutTourism: {
      overview: 'पाँचपोखरी विश्वकै नवौं उच्च स्थानमा रहेको पवित्र सिमसार तथा अन्तर्राष्ट्रिय स्तरमा ख्यातिप्राप्त पर्यटकीय गन्तव्य हो। यहाँ पाँचवटा पवित्र कुण्डहरू (भैरव, सरस्वती, गणेश, सूर्य र नाग कुण्ड) रहेका छन् जहाँ जनैपूर्णिमाका दिन विशाल धार्मिक मेला लाग्दछ।',
      culturalSignificance: 'धार्मिक मान्यता अनुसार यी कुण्डहरूमा स्नान गरी शिवजीको पूजा गर्दा मनोकाङ्क्षा पूरा हुने, पाप नाश हुने र मोक्ष प्राप्त हुने विश्वास गरिन्छ।',
      highlights: [
        'विश्वकै नवौं उच्च स्थानमा रहेको पवित्र सिमसार (४,१०० मिटर)',
        'लाङटाङ, जुगल र दोर्जे लाक्पा हिमशृङ्खलाको ३६० डिग्री मनमोहक दृश्य',
        'ह्योल्मो तथा तामाङ संस्कृतिको मौलिक पहिचान र परम्परा',
        'लालीगुराँस, दुर्लभ जडीबुटी, डाँफे, कस्तुरी र याक चरिचरन'
      ],
      address: 'वडा नं. ३, पाँचपोखरी थाङपाल गाउँपालिका, सिन्धुपाल्चोक'
    },
    kpis: {
      altitudeMeters: 4100,
      bestSeason: 'असोज - कार्तिक / बैशाख',
      trekDurationDays: 4,
      annualTourists: '१५,०००+ आन्तरिक तथा बाह्य पर्यटक'
    },
    itinerary: [
      { day: 'दिन १', route: 'काठमाडौं देखि मेलम्ची हुँदै थाङपालधाप / भोताङ (गाडी यात्रा)', altitude: '१,८०० मि.', hours: '५-६ घण्टा' },
      { day: 'दिन २', route: 'भोताङ देखि देउराली हुँदै नोचे / टुप्पे डाँडा (पैदल यात्रा)', altitude: '३,१०० मि.', hours: '५-६ घण्टा' },
      { day: 'दिन ३', route: 'नोचे देखि पाँचपोखरी तीर्थस्थल (४,१०० मि.) दर्शन तथा कुण्ड परिक्रमा', altitude: '४,१०० मि.', hours: '४-५ घण्टा' },
      { day: 'दिन ४', route: 'पाँचपोखरीबाट सूर्योदय दर्शन गरी छिम्ति हुँदै काठमाडौं फिर्ती', altitude: '१,३०० मि.', hours: '६ घण्टा' }
    ],
    homestays: [
      { name: 'भोताङ सामुदायिक होमस्टे सञ्जाल', capacity: '५० जना', contact: '९८५१००००३३', rateAvg: 'रु. १,२०० (खाना र बास)' },
      { name: 'छिम्ति इको लज तथा क्याम्पिङ', capacity: '३० जना', contact: '९८४१६५३५५५', rateAvg: 'रु. १,५००' },
      { name: 'पाँचपोखरी धर्मशाला तथा तीर्थ लज', capacity: '१०० जना (सिजनल)', contact: '९८४१००००५५', rateAvg: 'रु. १,०००' }
    ],
    safetyTips: [
      'लेक लाग्ने (Altitude Sickness / AMS) बाट बच्न प्रशस्त पानी पिउने र विस्तारै हिँड्ने।',
      'लसुनको झोल, प्राथमिक उपचार किट, र चिसोबाट बच्ने डाउन ज्याकेट/वाटरप्रुफ कपडा साथमा राख्ने।',
      'स्थानीय प्रमाणित गाइड लिएर मात्र यात्रा गर्ने।',
      'आपत्कालीन उद्धार सम्पर्क: पाँचपोखरी पर्यटन सूचना केन्द्र ९८५१०००००४।'
    ]
  };
};

export const FacilityDetailPage: React.FC<FacilityDetailPageProps> = ({ forcedType }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // Extract ID reliably from URL params or location pathname
  const pathParts = location.pathname.split('/').filter(Boolean);
  const rawId = id || (pathParts.length > 1 ? pathParts[pathParts.length - 1] : '37');

  // Synchronous initialization ensures immediate render without loading delay
  const [data, setData] = useState<any>(() => getBaselineProfile(rawId, forcedType));
  const [activeTab, setActiveTab] = useState<number>(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedMapLayer, setSelectedMapLayer] = useState<'streets' | 'satellite' | 'terrain'>('satellite');

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Re-fetch or refresh from API in background
  useEffect(() => {
    const facilityId = rawId || '37';
    let baseData = getBaselineProfile(facilityId, forcedType);
    setData(baseData);

    const fetchData = async () => {
      try {
        const facilityType = baseData.type;
        
        if (facilityType === 'ward_office') {
          const wardNum = baseData.wardNo;
          
          // Fetch real projects
          try {
            const projRes: any = await projectsApi.getAll({ ward: wardNum });
            const projList: any[] = Array.isArray(projRes) ? projRes : (projRes?.data || []);
            if (projList.length > 0) {
              baseData = {
                ...baseData,
                developmentProjects: projList.map((p: any) => ({
                  name: p.name,
                  budget: `रु. ${p.budget?.toLocaleString() || 0}`,
                  progress: `${p.progressPercentage || 0}% सम्पन्न`
                }))
              };
            }
          } catch (e) {
            console.error('Failed to fetch projects', e);
          }

          // Fetch ward details for panoramaUrl
          try {
            const wards = await municipalityApi.getWards();
            const wardDetails = wards.find((w: any) => w.wardNo === wardNum);
            if (wardDetails && wardDetails.panoramaUrl) {
              baseData = { ...baseData, panoramaUrl: wardDetails.panoramaUrl };
            }
          } catch (e) {
            console.error('Failed to fetch wards', e);
          }
          
          setData({ ...baseData });
        }

        const res = await fetch(`/api/v1/gis/facilities/${facilityId}`);
        if (res.ok) {
          const json = await res.json();
          if (json && json.name) {
            setData((prev: any) => ({ ...prev, ...json }));
          }
        }
      } catch (e) {
        console.error(e);
      }
    };

    fetchData();
  }, [rawId, forcedType]);

  // Leaflet map setup
  useEffect(() => {
    if (!data || !mapContainerRef.current) return;

    const lat = data.lat || 27.9405;
    const lng = data.lng || 85.5935;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [lat, lng],
        zoom: 15,
        maxZoom: 22,
        zoomControl: true,
      });

      mapInstanceRef.current = map;

      // Base tile
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '&copy; Esri & NASA',
        maxNativeZoom: 19,
        maxZoom: 22,
      }).addTo(map);

      const pinColor = data.type === 'health_post' ? '#e11d48' : data.type === 'ward_office' ? '#059669' : data.type === 'viewpoint' ? '#d97706' : '#1d4ed8';
      const pinEmoji = data.type === 'health_post' ? '🏥' : data.type === 'ward_office' ? '🏛️' : data.type === 'viewpoint' ? '🏔️' : '🏫';

      const customIcon = L.divIcon({
        className: 'facility-detail-pin',
        html: `
          <div style="
            background: ${pinColor};
            color: white;
            padding: 6px 12px;
            border-radius: 9999px;
            font-size: 13px;
            font-weight: 700;
            display: flex;
            align-items: center;
            gap: 6px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.35);
            border: 2px solid white;
            white-space: nowrap;
          ">
            <span>${pinEmoji}</span>
            <span>${data.name}</span>
          </div>
        `,
        iconSize: [120, 36],
        iconAnchor: [60, 18],
      });

      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);
      marker.bindPopup(`<b>${data.name}</b><br>GPS: ${lat.toFixed(5)}° N, ${lng.toFixed(5)}° E`).openPopup();

      L.circle([lat, lng], {
        radius: 500,
        color: pinColor,
        fillColor: pinColor,
        fillOpacity: 0.15,
        weight: 2,
        dashArray: '5, 5',
      }).addTo(map).bindPopup('Shapely Geodesic Buffer (५०० मिटर प्रभाव क्षेत्र)');
    } else {
      mapInstanceRef.current.setView([lat, lng], 15);
    }

    setTimeout(() => {
      mapInstanceRef.current?.invalidateSize();
    }, 250);
  }, [data, activeTab]);

  const changeTileLayer = (layer: 'streets' | 'satellite' | 'terrain') => {
    setSelectedMapLayer(layer);
    if (!mapInstanceRef.current) return;

    mapInstanceRef.current.eachLayer((l) => {
      if (l instanceof L.TileLayer) {
        mapInstanceRef.current?.removeLayer(l);
      }
    });

    let newUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    let maxNative = 19;

    if (layer === 'streets') {
      newUrl = 'https://{s}.tile.openstreetmap.org/{z}/{y}/{x}.png';
      maxNative = 19;
    } else if (layer === 'terrain') {
      newUrl = 'https://{s}.tile.opentopomap.org/{z}/{y}/{x}.png';
      maxNative = 17;
    }

    L.tileLayer(newUrl, {
      maxNativeZoom: maxNative,
      maxZoom: 22,
    }).addTo(mapInstanceRef.current);
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast('लिङ्क सफलतापुर्वक प्रतिलिपि (Copy) गरियो!');
  };

  const printProfile = () => {
    window.print();
  };

  const facilityType = data.type || forcedType || 'school';
  const typeTheme = facilityType === 'health_post' ? 'health' : facilityType === 'ward_office' ? 'ward' : facilityType === 'viewpoint' ? 'tourism' : 'school';

  return (
    <div className="facility-detail-container">
      {/* Top Navbar */}
      <nav className="facility-nav-bar">
        <a href={
          typeTheme === 'health' ? '/health' :
          typeTheme === 'school' ? '/education' :
          typeTheme === 'tourism' ? '/tourism' :
          '/gis-map'
        } className="facility-back-btn">
          <span>←</span>
          <span>
            {typeTheme === 'health' ? 'स्वास्थ्य सेवा पोर्टलमा फर्कनुहोस्' :
             typeTheme === 'school' ? 'MunSMS मा फर्कनुहोस्' :
             typeTheme === 'tourism' ? 'पर्यटन पोर्टलमा फर्कनुहोस्' :
             'डिजिटल ट्विन GIS नक्सामा फर्कनुहोस्'}
          </span>
        </a>

        <div className="facility-actions-top">
          <button onClick={copyShareLink} className="btn-action-pill">
            <span>🔗</span>
            <span>सेयर</span>
          </button>
          <button onClick={printProfile} className="btn-action-pill primary">
            <span>🖨️</span>
            <span>विवरण प्रिन्ट</span>
          </button>
        </div>
      </nav>

      {/* Hero Header Banner */}
      <header className={`facility-hero-banner ${typeTheme}`}>
        <div className="facility-hero-inner">
          <div className="facility-badge-row">
            <span className={`badge-tag type-${typeTheme}`}>
              {facilityType === 'health_post' ? '🏥 स्वास्थ्य संस्था' :
               facilityType === 'ward_office' ? '🏛️ वडा कार्यालय' :
               facilityType === 'viewpoint' ? '🏔️ पर्यटकीय सम्पदा' : '🏫 शिक्षा प्रणाली'}
            </span>
            <span className="badge-tag light">वडा नं. {data.wardNo}</span>
            <span className="badge-tag light">कोड: {data.code || data.id}</span>
            {data.establishedDate && <span className="badge-tag light">स्थापना: {data.establishedDate}</span>}
          </div>

          <div className="facility-title-block">
            <div className="facility-logo-emblem">
              {facilityType === 'health_post' ? '🏥' :
               facilityType === 'ward_office' ? '🏛️' :
               facilityType === 'viewpoint' ? '🏔️' : '🏫'}
            </div>
            <div>
              <h1 className="facility-main-heading">{data.name}</h1>
              {data.slogan && <p className="facility-slogan">"{data.slogan}"</p>}
              <div className="facility-location-line">
                <span>📍</span>
                <span>{data.municipality || 'पाँचपोखरी थाङपाल गाउँपालिका'} • GPS: {data.lat?.toFixed(4)}° N, {data.lng?.toFixed(4)}° E</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* KPI Highlight Cards Grid */}
      <section className="facility-kpi-grid">
        {facilityType === 'school' && (
          <>
            <div className="facility-kpi-card">
              <div className="facility-kpi-icon">👥</div>
              <div className="facility-kpi-info">
                <span className="facility-kpi-label">कुल विद्यार्थी</span>
                <span className="facility-kpi-value">{data.kpis?.totalStudents || 385} जना</span>
                <span className="facility-kpi-sub">छात्रा: {data.kpis?.femaleStudents || 201} | छात्र: {data.kpis?.maleStudents || 184}</span>
              </div>
            </div>
            <div className="facility-kpi-card green">
              <div className="facility-kpi-icon">👨‍🏫</div>
              <div className="facility-kpi-info">
                <span className="facility-kpi-label">शिक्षक तथा कर्मचारी</span>
                <span className="facility-kpi-value">{data.kpis?.totalTeachers || 18} जना</span>
                <span className="facility-kpi-sub">स्वीकृत दरबन्दी तथा राहत</span>
              </div>
            </div>
            <div className="facility-kpi-card rose">
              <div className="facility-kpi-icon">🏛️</div>
              <div className="facility-kpi-info">
                <span className="facility-kpi-label">भौतिक संरचना</span>
                <span className="facility-kpi-value">{data.kpis?.totalBuildings || 3} भवन / {data.kpis?.totalClassrooms || 16} कोठा</span>
                <span className="facility-kpi-sub">पक्की कक्षाकोठा</span>
              </div>
            </div>
            <div className="facility-kpi-card amber">
              <div className="facility-kpi-icon">⭐</div>
              <div className="facility-kpi-info">
                <span className="facility-kpi-label">समग्र मूल्याङ्कन (SMEPMS)</span>
                <span className="facility-kpi-value">{data.kpis?.overallScore || 84.5}%</span>
                <span className="facility-kpi-sub" style={{ color: '#2563eb', fontWeight: 700 }}>उत्कृष्ट (६५-९०%)</span>
              </div>
            </div>
          </>
        )}

        {facilityType === 'health_post' && (
          <>
            <div className="facility-kpi-card rose">
              <div className="facility-kpi-icon">🛏️</div>
              <div className="facility-kpi-info">
                <span className="facility-kpi-label">कुल शय्या (Beds)</span>
                <span className="facility-kpi-value">{data.kpis?.totalBeds || 15} शय्या</span>
                <span className="facility-kpi-sub">इन्डोर तथा प्रसूति वार्ड</span>
              </div>
            </div>
            <div className="facility-kpi-card">
              <div className="facility-kpi-icon">🩺</div>
              <div className="facility-kpi-info">
                <span className="facility-kpi-label">दैनिक औसत ओपीडी</span>
                <span className="facility-kpi-value">{data.kpis?.dailyOpdAvg || 65}+ जना</span>
                <span className="facility-kpi-sub">सामान्य चिकित्सा तथा परामर्श</span>
              </div>
            </div>
            <div className="facility-kpi-card green">
              <div className="facility-kpi-icon">👩‍⚕️</div>
              <div className="facility-kpi-info">
                <span className="facility-kpi-label">स्वास्थ्यकर्मी तथा जनशक्ति</span>
                <span className="facility-kpi-value">{data.kpis?.totalStaff || 14} जना</span>
                <span className="facility-kpi-sub">डाक्टर, एच.ए., अनमी, अहेव</span>
              </div>
            </div>
            <div className="facility-kpi-card amber">
              <div className="facility-kpi-icon">🚑</div>
              <div className="facility-kpi-info">
                <span className="facility-kpi-label">एम्बुलेन्स सेवा</span>
                <span className="facility-kpi-value" style={{ color: '#16a34a' }}>२४/७ सक्रिय</span>
                <span className="facility-kpi-sub">{data.kpis?.ambulanceContact || '९८५११००११२'}</span>
              </div>
            </div>
          </>
        )}

        {facilityType === 'ward_office' && (
          <>
            <div className="facility-kpi-card green">
              <div className="facility-kpi-icon">👥</div>
              <div className="facility-kpi-info">
                <span className="facility-kpi-label">वडाको कुल जनसंख्या</span>
                <span className="facility-kpi-value">{data.kpis?.totalPopulation || 4250} जना</span>
                <span className="facility-kpi-sub">जनगणना २०८१ तथ्याङ्क</span>
              </div>
            </div>
            <div className="facility-kpi-card">
              <div className="facility-kpi-icon">🏡</div>
              <div className="facility-kpi-info">
                <span className="facility-kpi-label">कुल घरधुरी संख्या</span>
                <span className="facility-kpi-value">{data.kpis?.totalHouseholds || 960} घरधुरी</span>
                <span className="facility-kpi-sub">औसत परिवार संख्या ४.४</span>
              </div>
            </div>
            <div className="facility-kpi-card amber">
              <div className="facility-kpi-icon">💰</div>
              <div className="facility-kpi-info">
                <span className="facility-kpi-label">वार्षिक विकास बजेट</span>
                <span className="facility-kpi-value">{data.kpis?.annualBudget || 'रु. १ करोड २५ लाख'}</span>
                <span className="facility-kpi-sub">पूर्वाधार तथा सामाजिक विकास</span>
              </div>
            </div>
            <div className="facility-kpi-card rose">
              <div className="facility-kpi-icon">📋</div>
              <div className="facility-kpi-info">
                <span className="facility-kpi-label">चालु योजना तथा आयोजना</span>
                <span className="facility-kpi-value">{data.kpis?.activeProjectsCount || 18} वटा</span>
                <span className="facility-kpi-sub">प्रगति: {data.kpis?.completedProjectsPercentage || 82}%</span>
              </div>
            </div>
          </>
        )}

        {facilityType === 'viewpoint' && (
          <>
            <div className="facility-kpi-card amber">
              <div className="facility-kpi-icon">🏔️</div>
              <div className="facility-kpi-info">
                <span className="facility-kpi-label">उचाइ (Altitude)</span>
                <span className="facility-kpi-value">{data.kpis?.altitudeMeters || 4100} मिटर</span>
                <span className="facility-kpi-sub">समुद्री सतहबाट</span>
              </div>
            </div>
            <div className="facility-kpi-card green">
              <div className="facility-kpi-icon">🍂</div>
              <div className="facility-kpi-info">
                <span className="facility-kpi-label">उपयुक्त मौसम</span>
                <span className="facility-kpi-value">{data.kpis?.bestSeason || 'असोज - कार्तिक'}</span>
                <span className="facility-kpi-sub">तथा जनैपूर्णिमा महामेला</span>
              </div>
            </div>
            <div className="facility-kpi-card">
              <div className="facility-kpi-icon">🥾</div>
              <div className="facility-kpi-info">
                <span className="facility-kpi-label">पदयात्रा अवधि</span>
                <span className="facility-kpi-value">{data.kpis?.trekDurationDays || 4} दिन</span>
                <span className="facility-kpi-sub">काठमाडौं - पाँचपोखरी राउन्ड</span>
              </div>
            </div>
            <div className="facility-kpi-card rose">
              <div className="facility-kpi-icon">🚩</div>
              <div className="facility-kpi-info">
                <span className="facility-kpi-label">वार्षिक पर्यटक</span>
                <span className="facility-kpi-value">{data.kpis?.annualTourists || '१५,०००+'}</span>
                <span className="facility-kpi-sub">आन्तरिक तथा बाह्य भक्तजन</span>
              </div>
            </div>
          </>
        )}
      </section>

      {/* Main Content Area with Sector-Specific Tabs */}
      <main className="facility-content-wrapper">
        {/* TAB BUTTONS */}
        <div className="facility-tab-nav">
          {facilityType === 'school' && (
            <>
              <button className={`facility-tab-btn ${activeTab === 0 ? 'active' : ''}`} onClick={() => setActiveTab(0)}>
                <span>🏫 विद्यालय परिचय</span>
              </button>
              <button className={`facility-tab-btn ${activeTab === 1 ? 'active' : ''}`} onClick={() => setActiveTab(1)}>
                <span>🏗️ भौतिक पूर्वाधार तथा सुविधा</span>
              </button>
              <button className={`facility-tab-btn ${activeTab === 2 ? 'active' : ''}`} onClick={() => setActiveTab(2)}>
                <span>📊 शैक्षिक तथ्याङ्क तथा भर्ना</span>
              </button>
              <button className={`facility-tab-btn ${activeTab === 3 ? 'active' : ''}`} onClick={() => setActiveTab(3)}>
                <span>👨‍🏫 शिक्षक तथा कर्मचारी विवरण</span>
              </button>
              <button className={`facility-tab-btn ${activeTab === 4 ? 'active' : ''}`} onClick={() => setActiveTab(4)}>
                <span>📈 समग्र मूल्याङ्कन स्थिति (SMEPMS)</span>
              </button>
              <button className={`facility-tab-btn ${activeTab === 5 ? 'active' : ''}`} onClick={() => setActiveTab(5)}>
                <span>🗺️ स्थान तथा इन्टिग्रेटेड नक्सा</span>
              </button>
            </>
          )}

          {facilityType === 'health_post' && (
            <>
              <button className={`facility-tab-btn health ${activeTab === 0 ? 'active health' : ''}`} onClick={() => setActiveTab(0)}>
                <span>🏥 संस्था परिचय</span>
              </button>
              <button className={`facility-tab-btn health ${activeTab === 1 ? 'active health' : ''}`} onClick={() => setActiveTab(1)}>
                <span>🩺 उपलब्ध स्वास्थ्य सेवाहरू</span>
              </button>
              <button className={`facility-tab-btn health ${activeTab === 2 ? 'active health' : ''}`} onClick={() => setActiveTab(2)}>
                <span>🏢 शय्या तथा भौतिक पूर्वाधार</span>
              </button>
              <button className={`facility-tab-btn health ${activeTab === 3 ? 'active health' : ''}`} onClick={() => setActiveTab(3)}>
                <span>👩‍⚕️ स्वास्थ्यकर्मी तथा जनशक्ति</span>
              </button>
              <button className={`facility-tab-btn health ${activeTab === 4 ? 'active health' : ''}`} onClick={() => setActiveTab(4)}>
                <span>💊 औषधि मौज्दात तथा स्वास्थ्य सूचक</span>
              </button>
              <button className={`facility-tab-btn health ${activeTab === 5 ? 'active health' : ''}`} onClick={() => setActiveTab(5)}>
                <span>🗺️ आपत्कालीन एम्बुलेन्स तथा नक्सा</span>
              </button>
            </>
          )}

          {facilityType === 'ward_office' && (
            <>
              <button className={`facility-tab-btn ward ${activeTab === 0 ? 'active ward' : ''}`} onClick={() => setActiveTab(0)}>
                <span>🏛️ वडा परिचय तथा भूगोल</span>
              </button>
              <button className={`facility-tab-btn ward ${activeTab === 1 ? 'active ward' : ''}`} onClick={() => setActiveTab(1)}>
                <span>👥 जनप्रतिनिधि तथा कर्मचारी</span>
              </button>
              <button className={`facility-tab-btn ward ${activeTab === 2 ? 'active ward' : ''}`} onClick={() => setActiveTab(2)}>
                <span>📜 नागरिक सेवा तथा बडापत्र</span>
              </button>
              <button className={`facility-tab-btn ward ${activeTab === 3 ? 'active ward' : ''}`} onClick={() => setActiveTab(3)}>
                <span>🏗️ विकास बजेट तथा योजनाहरू</span>
              </button>
              <button className={`facility-tab-btn ward ${activeTab === 4 ? 'active ward' : ''}`} onClick={() => setActiveTab(4)}>
                <span>📊 जनसाङ्ख्यिक तथा बस्ती विवरण</span>
              </button>
              <button className={`facility-tab-btn ward ${activeTab === 5 ? 'active ward' : ''}`} onClick={() => setActiveTab(5)}>
                <span>🗺️ वडा सिमाना तथा नक्सा</span>
              </button>
            </>
          )}

          {facilityType === 'viewpoint' && (
            <>
              <button className={`facility-tab-btn tourism ${activeTab === 0 ? 'active tourism' : ''}`} onClick={() => setActiveTab(0)}>
                <span>🏔️ गन्तव्य परिचय र महत्त्व</span>
              </button>
              <button className={`facility-tab-btn tourism ${activeTab === 1 ? 'active tourism' : ''}`} onClick={() => setActiveTab(1)}>
                <span>🌟 मुख्य आकर्षणहरू</span>
              </button>
              <button className={`facility-tab-btn tourism ${activeTab === 2 ? 'active tourism' : ''}`} onClick={() => setActiveTab(2)}>
                <span>🥾 पदमार्ग तथा यात्रा तालिका</span>
              </button>
              <button className={`facility-tab-btn tourism ${activeTab === 3 ? 'active tourism' : ''}`} onClick={() => setActiveTab(3)}>
                <span>🏡 होटल तथा होमस्टे सुविधा</span>
              </button>
              <button className={`facility-tab-btn tourism ${activeTab === 4 ? 'active tourism' : ''}`} onClick={() => setActiveTab(4)}>
                <span>⚠️ मौसम तथा लेक लाग्ने सुरक्षा</span>
              </button>
              <button className={`facility-tab-btn tourism ${activeTab === 5 ? 'active tourism' : ''}`} onClick={() => setActiveTab(5)}>
                <span>🗺️ ३D भू-धरातल तथा नक्सा</span>
              </button>
            </>
          )}
        </div>

        {/* TAB 0: परिचय (About / Overview) */}
        {activeTab === 0 && (
          <div className="facility-tab-content">
            <div className="facility-card-box">
              <div className="facility-card-header">
                <span style={{ fontSize: '22px' }}>📖</span>
                <h3 className="facility-card-title">संस्थाको विस्तृत पृष्ठभूमि तथा परिचय</h3>
              </div>
              <p className="facility-paragraph">
                {data.aboutSchool?.schoolOverview || data.aboutHealth?.overview || data.aboutWard?.overview || data.aboutTourism?.overview ||
                 `${data.name}, ${data.municipality}को एक प्रमुख सार्वजनिक पूर्वाधार हो।`}
              </p>
            </div>

            {(data.aboutSchool?.vision || data.aboutHealth?.vision) && (
              <div className="facility-card-box" style={{ borderLeft: '4px solid #3b82f6' }}>
                <div className="facility-card-header">
                  <span style={{ fontSize: '20px' }}>🎯</span>
                  <h3 className="facility-card-title">दृष्टि (Vision) तथा ध्येय (Mission)</h3>
                </div>
                <p className="facility-paragraph" style={{ fontWeight: 600 }}>
                  {data.aboutSchool?.vision || data.aboutHealth?.vision}
                </p>
                <p className="facility-paragraph" style={{ color: '#475569' }}>
                  {data.aboutSchool?.mission || data.aboutHealth?.mission}
                </p>
              </div>
            )}

            {data.aboutSchool?.objectives && (
              <div className="facility-card-box">
                <div className="facility-card-header">
                  <span style={{ fontSize: '20px' }}>🎯</span>
                  <h3 className="facility-card-title">मुख्य उद्देश्यहरू</h3>
                </div>
                <ul className="objective-list">
                  {data.aboutSchool.objectives.map((obj: string, i: number) => (
                    <li key={i} className="objective-item">
                      <span>✓</span>
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {data.aboutTourism?.culturalSignificance && (
              <div className="facility-card-box" style={{ borderLeft: '4px solid #d97706' }}>
                <div className="facility-card-header">
                  <span style={{ fontSize: '20px' }}>🕉️</span>
                  <h3 className="facility-card-title">धार्मिक तथा ऐतिहासिक मान्यता</h3>
                </div>
                <p className="facility-paragraph">
                  {data.aboutTourism.culturalSignificance}
                </p>
              </div>
            )}
          </div>
        )}
        
        {/* TAB 1: पूर्वाधार / सेवाहरू (Ward Office 360 View) */}
        {activeTab === 0 && facilityType === 'ward_office' && data.panoramaUrl && (
          <div className="facility-tab-content">
            <div className="facility-card-box">
              <div className="facility-card-header">
                <span style={{ fontSize: '22px' }}>🌐</span>
                <h3 className="facility-card-title">वडा कार्यालय (360° View)</h3>
              </div>
              <div style={{ width: '100%', height: '400px', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#e2e8f0' }}>
                <iframe 
                  width="100%" 
                  height="100%" 
                  frameBorder="0" 
                  allow="xr-spatial-tracking; gyroscope; accelerometer" 
                  allowFullScreen 
                  scrolling="no" 
                  src={data.panoramaUrl}
                  title="360 Degree View"
                ></iframe>
              </div>
            </div>
          </div>
        )}

        {/* TAB 1: पूर्वाधार / सेवाहरू */}
        {activeTab === 1 && (
          <div className="facility-tab-content">
            {facilityType === 'school' && (
              <div className="facility-card-box">
                <div className="facility-card-header">
                  <span style={{ fontSize: '22px' }}>🏗️</span>
                  <h3 className="facility-card-title">भौतिक पूर्वाधार तथा शैक्षिक सुविधाहरू</h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px', marginTop: 12 }}>
                  <div className="objective-item" style={{ borderLeftColor: '#10b981' }}>
                    <span>💻</span>
                    <div>
                      <strong>कम्प्युटर तथा आईसीटी ल्याब:</strong> {data.infrastructure?.hasIctLab ? `उपलब्ध (${data.infrastructure?.ictComputersCount || 24} थान कम्प्युटर)` : 'प्रक्रियामा'}
                    </div>
                  </div>
                  <div className="objective-item" style={{ borderLeftColor: '#3b82f6' }}>
                    <span>📚</span>
                    <div>
                      <strong>पुस्तकालय तथा ई-लाइब्रेरी:</strong> {data.infrastructure?.hasLibrary ? `सञ्चालित (${data.infrastructure?.libraryBooksCount || 1450} पुस्तकहरू)` : 'स्थापना हुँदै'}
                    </div>
                  </div>
                  <div className="objective-item" style={{ borderLeftColor: '#8b5cf6' }}>
                    <span>🔬</span>
                    <div>
                      <strong>विज्ञान प्रयोगशाला:</strong> {data.infrastructure?.hasScienceLab ? 'पूर्ण सुसज्जित प्रयोगशाला उपलब्ध' : 'आधारभूत उपकरण मात्र'}
                    </div>
                  </div>
                  <div className="objective-item" style={{ borderLeftColor: '#06b6d4' }}>
                    <span>🚰</span>
                    <div>
                      <strong>स्वच्छ खानेपानी:</strong> {data.infrastructure?.hasDrinkingWater ? 'युरोगार्ड / फिल्टर सहित नियमित आपूर्ति' : 'धारा उपलब्ध'}
                    </div>
                  </div>
                  <div className="objective-item" style={{ borderLeftColor: '#f59e0b' }}>
                    <span>⚡</span>
                    <div>
                      <strong>विद्युत तथा सोलार ब्याकअप:</strong> {data.infrastructure?.hasSolarBackup ? '२४ सै घण्टा निर्वाध विद्युत आपूर्ति' : 'राष्ट्रिय प्रसारण लाइन'}
                    </div>
                  </div>
                  <div className="objective-item" style={{ borderLeftColor: '#ec4899' }}>
                    <span>🚻</span>
                    <div>
                      <strong>बालमैत्री शौचालय:</strong> {data.infrastructure?.girlsSeparateToilet ? `छात्र र छात्राका लागि छुट्टाछुट्टै (${data.infrastructure?.totalToilets || 8} वटा)` : 'उपलब्ध'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {facilityType === 'health_post' && (
              <div className="facility-card-box">
                <div className="facility-card-header">
                  <span style={{ fontSize: '22px' }}>🩺</span>
                  <h3 className="facility-card-title">उपलब्ध स्वास्थ्य तथा उपचार सेवाहरू</h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '14px' }}>
                  {data.services?.map((srv: any, idx: number) => (
                    <div key={idx} className="objective-item" style={{ borderLeftColor: '#e11d48' }}>
                      <span style={{ fontSize: '20px' }}>⚕️</span>
                      <div>
                        <strong>{srv.name}</strong>
                        <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>{srv.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {facilityType === 'ward_office' && (
              <div className="facility-card-box">
                <div className="facility-card-header">
                  <span style={{ fontSize: '22px' }}>👥</span>
                  <h3 className="facility-card-title">जनप्रतिनिधि तथा कर्मचारी नामावली</h3>
                </div>
                <div className="facility-table-wrapper">
                  <table className="facility-table">
                    <thead>
                      <tr>
                        <th>क्र.सं.</th>
                        <th>नाम थर</th>
                        <th>पद</th>
                        <th>सम्पर्क फोन</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.representatives?.map((rep: any, idx: number) => (
                        <tr key={idx}>
                          <td>{idx + 1}</td>
                          <td><strong>{rep.name}</strong></td>
                          <td><span className="badge-tag light" style={{ color: '#0f172a' }}>{rep.designation}</span></td>
                          <td><a href={`tel:${rep.contact}`} style={{ color: '#0284c7', textDecoration: 'none', fontWeight: 600 }}>{rep.contact}</a></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {facilityType === 'viewpoint' && (
              <div className="facility-card-box">
                <div className="facility-card-header">
                  <span style={{ fontSize: '22px' }}>🌟</span>
                  <h3 className="facility-card-title">गन्तव्यका मुख्य आकर्षणहरू</h3>
                </div>
                <ul className="objective-list">
                  {data.aboutTourism?.highlights?.map((h: string, idx: number) => (
                    <li key={idx} className="objective-item" style={{ borderLeftColor: '#d97706' }}>
                      <span>✨</span>
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: तथ्याङ्क / बडापत्र / पदमार्ग */}
        {activeTab === 2 && (
          <div className="facility-tab-content">
            {facilityType === 'school' && (
              <div className="facility-card-box">
                <div className="facility-card-header">
                  <span style={{ fontSize: '22px' }}>📊</span>
                  <h3 className="facility-card-title">कक्षागत विद्यार्थी भर्ना तथा उपस्थिति विवरण</h3>
                </div>
                <div className="facility-table-wrapper">
                  <table className="facility-table">
                    <thead>
                      <tr>
                        <th>तह / कक्षा</th>
                        <th>छात्र (Boys)</th>
                        <th>छात्रा (Girls)</th>
                        <th>जम्मा (Total)</th>
                        <th>प्रतिशत</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.academics?.classes?.map((cls: any, i: number) => (
                        <tr key={i}>
                          <td><strong>{cls.grade}</strong></td>
                          <td>{cls.boys} जना</td>
                          <td>{cls.girls} जना</td>
                          <td><strong>{cls.total} जना</strong></td>
                          <td><span style={{ color: '#059669', fontWeight: 700 }}>१००%</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {facilityType === 'health_post' && (
              <div className="facility-card-box">
                <div className="facility-card-header">
                  <span style={{ fontSize: '22px' }}>🏢</span>
                  <h3 className="facility-card-title">शय्या तथा मेडिकल पूर्वाधार</h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                  <div className="objective-item" style={{ borderLeftColor: '#e11d48' }}>
                    <span>🛏️</span>
                    <div><strong>इन्डोर शय्या क्षमता:</strong> {data.infrastructure?.totalBeds || 15} शय्या</div>
                  </div>
                  <div className="objective-item" style={{ borderLeftColor: '#0284c7' }}>
                    <span>❄️</span>
                    <div><strong>खोप कोल्डचेन:</strong> {data.infrastructure?.coldChainType || 'Solar ILR रेफ्रिजरेटर'}</div>
                  </div>
                  <div className="objective-item" style={{ borderLeftColor: '#10b981' }}>
                    <span>👶</span>
                    <div><strong>सुरक्षित प्रसूति कक्ष:</strong> SBA उपकरण सहित २४ घण्टा सञ्चालित</div>
                  </div>
                </div>
              </div>
            )}

            {facilityType === 'ward_office' && (
              <div className="facility-card-box">
                <div className="facility-card-header">
                  <span style={{ fontSize: '22px' }}>📜</span>
                  <h3 className="facility-card-title">नागरिक बडापत्र (Citizen Charter)</h3>
                </div>
                <div className="facility-table-wrapper">
                  <table className="facility-table">
                    <thead>
                      <tr>
                        <th>सेवाको नाम</th>
                        <th>लाग्ने समय</th>
                        <th>दस्तुर</th>
                        <th>आवश्यक कागजात</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.citizenCharter?.map((srv: any, i: number) => (
                        <tr key={i}>
                          <td><strong>{srv.service}</strong></td>
                          <td><span style={{ color: '#059669', fontWeight: 600 }}>{srv.timeline}</span></td>
                          <td>{srv.fee}</td>
                          <td style={{ fontSize: '12.5px', color: '#64748b' }}>{srv.docs}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {facilityType === 'viewpoint' && (
              <div className="facility-card-box">
                <div className="facility-card-header">
                  <span style={{ fontSize: '22px' }}>🥾</span>
                  <h3 className="facility-card-title">पदमार्ग तथा दैनिक यात्रा तालिका (Trek Itinerary)</h3>
                </div>
                <div className="facility-table-wrapper">
                  <table className="facility-table">
                    <thead>
                      <tr>
                        <th>दिन</th>
                        <th>पदमार्ग खण्ड</th>
                        <th>उचाइ</th>
                        <th>हिँड्ने समय</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.itinerary?.map((it: any, i: number) => (
                        <tr key={i}>
                          <td><strong>{it.day}</strong></td>
                          <td>{it.route}</td>
                          <td><span style={{ color: '#d97706', fontWeight: 700 }}>{it.altitude}</span></td>
                          <td>{it.hours}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: शिक्षक / बजेट / होमस्टे */}
        {activeTab === 3 && (
          <div className="facility-tab-content">
            {facilityType === 'school' && (
              <div className="facility-card-box">
                <div className="facility-card-header">
                  <span style={{ fontSize: '22px' }}>👨‍🏫</span>
                  <h3 className="facility-card-title">शिक्षक तथा कर्मचारी दरबन्दी विवरण</h3>
                </div>
                <div className="facility-table-wrapper">
                  <table className="facility-table">
                    <thead>
                      <tr>
                        <th>क्र.सं.</th>
                        <th>शिक्षकको नाम</th>
                        <th>पद / विषय</th>
                        <th>शैक्षिक योग्यता</th>
                        <th>दरबन्दी प्रकार</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.teachers?.map((t: any, i: number) => (
                        <tr key={i}>
                          <td>{i + 1}</td>
                          <td><strong>{t.name}</strong></td>
                          <td>{t.role}</td>
                          <td>{t.qualification}</td>
                          <td><span className="badge-tag light" style={{ color: '#0f172a' }}>{t.type}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {facilityType === 'ward_office' && (
              <div className="facility-card-box">
                <div className="facility-card-header">
                  <span style={{ fontSize: '22px' }}>🏗️</span>
                  <h3 className="facility-card-title">चालु विकास बजेट तथा योजनाहरू</h3>
                </div>
                <div className="facility-table-wrapper">
                  <table className="facility-table">
                    <thead>
                      <tr>
                        <th>योजनाको नाम</th>
                        <th>विनियोजित बजेट</th>
                        <th>प्रगति स्थिति</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.developmentProjects?.map((p: any, i: number) => (
                        <tr key={i}>
                          <td><strong>{p.name}</strong></td>
                          <td><span style={{ color: '#059669', fontWeight: 700 }}>{p.budget}</span></td>
                          <td><span className="badge-tag light" style={{ color: '#2563eb' }}>{p.progress}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {facilityType === 'viewpoint' && (
              <div className="facility-card-box">
                <div className="facility-card-header">
                  <span style={{ fontSize: '22px' }}>🏡</span>
                  <h3 className="facility-card-title">होटल, होमस्टे तथा स्थानीय सेवा</h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                  {data.homestays?.map((h: any, i: number) => (
                    <div key={i} className="objective-item" style={{ borderLeftColor: '#059669' }}>
                      <span>🏨</span>
                      <div>
                        <strong>{h.name}</strong>
                        <div style={{ fontSize: '12.5px', color: '#64748b', marginTop: 4 }}>
                          क्षमता: {h.capacity} | दर: {h.rateAvg} | 📞 {h.contact}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: मूल्याङ्कन स्थिति (SMEPMS / Health Indicators / Demographics / Safety) */}
        {activeTab === 4 && (
          <div className="facility-tab-content">
            {facilityType === 'school' && (
              <div className="facility-card-box">
                <div className="facility-card-header">
                  <span style={{ fontSize: '22px' }}>📈</span>
                  <h3 className="facility-card-title">समग्र विद्यालय मूल्याङ्कन स्थिति (SMEPMS Score)</h3>
                </div>

                <div style={{ background: '#eff6ff', padding: '16px 20px', borderRadius: '10px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '13px', color: '#1e40af', fontWeight: 700 }}>वर्तमान स्कोर (Current Score)</span>
                    <div style={{ fontSize: '32px', fontWeight: 900, color: '#1d4ed8' }}>{data.assessment?.currentScore || 84.5}%</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '13px', color: '#64748b' }}>लक्ष्य स्कोर: {data.assessment?.targetScore || 90}%</span>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: '#059669' }}>वर्गीकरण: {data.assessment?.classification || 'उत्कृष्ट'}</div>
                  </div>
                </div>

                {/* 5-tier classification scale bar */}
                <div className="assessment-scale-bar">
                  {data.assessment?.scale?.map((tier: any, i: number) => (
                    <div key={i} className={`scale-tier ${tier.current ? 'active' : ''}`} style={tier.current ? { background: tier.color, borderColor: tier.color } : {}}>
                      <div style={{ fontWeight: 800 }}>{tier.level}</div>
                      <div style={{ fontSize: '10.5px', opacity: 0.9 }}>{tier.range}</div>
                    </div>
                  ))}
                </div>

                {/* Indicator-wise Marks Breakdown Table */}
                <h4 style={{ margin: '20px 0 10px', fontSize: '16px' }}>सूचकहरूको प्राप्तांक तथा वर्गीकरण</h4>
                <div className="facility-table-wrapper">
                  <table className="facility-table">
                    <thead>
                      <tr>
                        <th>क्र.सं.</th>
                        <th>मूल्याङ्कन सूचक</th>
                        <th>पूर्णांक</th>
                        <th>प्राप्तांक</th>
                        <th>प्रतिशत</th>
                        <th>वर्गीकरण</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.assessment?.indicators?.map((ind: any, i: number) => (
                        <tr key={i}>
                          <td>{ind.sn}</td>
                          <td><strong>{ind.title}</strong></td>
                          <td>{ind.fullMarks}</td>
                          <td><strong>{ind.obtainedMarks}</strong></td>
                          <td><span style={{ color: '#059669', fontWeight: 700 }}>{ind.percentage}%</span></td>
                          <td><span className="badge-tag light" style={{ color: '#1d4ed8' }}>{ind.classification}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {facilityType === 'health_post' && (
              <div className="facility-card-box">
                <div className="facility-card-header">
                  <span style={{ fontSize: '22px' }}>💊</span>
                  <h3 className="facility-card-title">अत्यावश्यक औषधि तथा स्वास्थ्य सूचक स्थिति</h3>
                </div>
                <p className="facility-paragraph">
                  नेपाल सरकारले निःशुल्क वितरणका लागि तोकेका ९८ प्रकारका अत्यावश्यक औषधिहरूको मौज्दात १००% पूर्ण रहेको छ।
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                  {data.medicineStock?.criticalStockList?.map((med: string, i: number) => (
                    <div key={i} className="objective-item" style={{ borderLeftColor: '#10b981', fontSize: '13px' }}>
                      <span>💊</span>
                      <span><strong>{med}</strong> (पर्याप्त)</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {facilityType === 'ward_office' && (
              <div className="facility-card-box">
                <div className="facility-card-header">
                  <span style={{ fontSize: '22px' }}>📊</span>
                  <h3 className="facility-card-title">वडाको जनसाङ्ख्यिक तथा बस्ती विवरण</h3>
                </div>
                <p className="facility-paragraph">
                  कुल साक्षरता दर: <strong>{data.demographics?.literacyRate || 76.4}%</strong>
                </p>
                <div className="facility-table-wrapper">
                  <table className="facility-table">
                    <thead>
                      <tr>
                        <th>जातजाति समूह</th>
                        <th>जनसंख्या हिस्सा (%)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.demographics?.ethnicDistribution?.map((eth: any, i: number) => (
                        <tr key={i}>
                          <td><strong>{eth.group}</strong></td>
                          <td><strong>{eth.percentage}%</strong></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {facilityType === 'viewpoint' && (
              <div className="facility-card-box">
                <div className="facility-card-header">
                  <span style={{ fontSize: '22px' }}>⚠️</span>
                  <h3 className="facility-card-title">मौसम, लेक लाग्ने (AMS) सुरक्षा तथा पूर्वतयारी</h3>
                </div>
                <ul className="objective-list">
                  {data.safetyTips?.map((tip: string, i: number) => (
                    <li key={i} className="objective-item" style={{ borderLeftColor: '#ef4444' }}>
                      <span>⚠️</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: स्थान तथा इन्टिग्रेटेड नक्सा */}
        {activeTab === 5 && (
          <div className="facility-tab-content">
            <div className="facility-card-box">
              <div className="facility-card-header" style={{ justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: '22px' }}>🗺️</span>
                  <h3 className="facility-card-title">भौगोलिक अवस्थिति तथा Shapely बफर विश्लेषण</h3>
                </div>

                {/* Map Layer Switcher */}
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    onClick={() => changeTileLayer('satellite')}
                    className={`btn-action-pill ${selectedMapLayer === 'satellite' ? 'primary' : ''}`}
                    style={{ padding: '4px 10px', fontSize: '11.5px' }}
                  >
                    🛰️ स्याटेलाइट
                  </button>
                  <button
                    onClick={() => changeTileLayer('streets')}
                    className={`btn-action-pill ${selectedMapLayer === 'streets' ? 'primary' : ''}`}
                    style={{ padding: '4px 10px', fontSize: '11.5px' }}
                  >
                    🗺️ सडक
                  </button>
                  <button
                    onClick={() => changeTileLayer('terrain')}
                    className={`btn-action-pill ${selectedMapLayer === 'terrain' ? 'primary' : ''}`}
                    style={{ padding: '4px 10px', fontSize: '11.5px' }}
                  >
                    ⛰️ टोपो
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '8px 0 12px', fontSize: '13px', color: '#475569' }}>
                <span>
                  📍 GPS अक्षांश: <strong>{data.lat?.toFixed(5)}° N</strong> | देशान्तर: <strong>{data.lng?.toFixed(5)}° E</strong>
                </span>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${data.lat},${data.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-action-pill"
                  style={{ color: '#0284c7', borderColor: '#0284c7' }}
                >
                  🗺️ Google Map मा नेभिगेट गर्नुहोस्
                </a>
              </div>

              {/* Leaflet Map Canvas */}
              <div ref={mapContainerRef} className="facility-map-box" />

              {/* Contact Info Box below map */}
              <div style={{ marginTop: 20, padding: 16, background: '#f8fafc', borderRadius: 8, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>📞 आधिकारिक सम्पर्क</div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>{data.contact || '०११-६९०१००'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>✉️ इमेल ठेगाना</div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>{data.email || 'info@panchpokharimun.gov.np'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>📍 प्रशासनिक ठेगाना</div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>{data.municipality || 'पाँचपोखरी थाङपाल, सिन्धुपाल्चोक'}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="facility-toast">
          <span>✓</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
