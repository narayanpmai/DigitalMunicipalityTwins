import * as XLSX from 'xlsx';
import type { HouseholdRecord } from '../../../api/demographics';

export interface ParsedHouseholdSummary {
  validRows: any[];
  totalCount: number;
  wardBreakdown: Record<number, number>;
  riskBreakdown: { low: number; medium: number; high: number };
  warnings: string[];
  samplePreview: any[];
}

export const HOUSEHOLD_EXCEL_HEADERS = [
  'वडा नं.* (Ward No)',
  'घरधुरी नम्बर (Matrix House No)',
  'घरमूलीको नाम* (Household Head Name)',
  'घरमूलीको लिङ्ग* (Gender)',
  'सम्पर्क फोन नं (Phone)',
  'नागरिकता वा परिचयपत्र नं (Citizenship/NID)',
  'टोल / बस्ती (Tole/Village)',
  'कुल परिवार संख्या* (Family Size)',
  'पुरुष संख्या (Male Count)',
  'महिला संख्या (Female Count)',
  'घरको संरचना प्रकार (House Type)',
  'GPS अक्षांश - Latitude (gpsLat)',
  'GPS देशान्तर - Longitude (gpsLon)',
  'विपद् जोखिम स्तर (Risk Level)',
  'जोखिम कैफियत (Risk Details)',
  'खानेपानीको मुख्य स्रोत (Drinking Water)',
  'शौचालयको प्रकार (Toilet Type)',
  'बिजुली/उर्जा स्रोत (Electricity Source)',
];

export const SAMPLE_HOUSEHOLD_ROWS = [
  [
    1,
    'P5-W01-0001',
    'दोर्जे तामाङ',
    'पुरुष',
    '9841567890',
    '27-01-72-10101',
    'मानेगाउँ',
    5,
    2,
    3,
    'अर्ध-पक्की (जस्ता छाना)',
    27.901617,
    85.616633,
    'न्यून',
    'सामान्य तथा सुरक्षित बस्ती भेग',
    'धारा / पाइप (निजी वा सार्वजनिक)',
    'फ्लश सहितको सुरक्षित चर्पी',
    'केन्द्रीय प्रसारण लाइन (NEA)',
  ],
  [
    2,
    'P5-W02-0001',
    'छेवाङ शेर्पा',
    'पुरुष',
    '9843210987',
    '27-01-73-10202',
    'ह्योल्मो गाउँ',
    4,
    2,
    2,
    'पक्की भवन (आरसीसी)',
    27.922275,
    85.629678,
    'मध्यम',
    'नदी किनार कटान क्षेत्र (मेलम्ची नदी तटीय)',
    'मूल तथा कुवाको पानी',
    'फ्लश सहितको सुरक्षित चर्पी',
    'केन्द्रीय प्रसारण लाइन (NEA)',
  ],
  [
    3,
    'P5-W03-0001',
    'दावा ह्योल्मो',
    'महिला',
    '9860123456',
    '27-01-74-10303',
    'याङरी बजार',
    6,
    3,
    3,
    'अर्ध-पक्की (जस्ता छाना)',
    27.965412,
    85.641235,
    'उच्च',
    'पहिरो जोखिम संवेदनशील क्षेत्र (भिरालो डाँडा)',
    'धारा / पाइप (निजी वा सार्वजनिक)',
    'फ्लश सहितको सुरक्षित चर्पी',
    'केन्द्रीय प्रसारण लाइन (NEA)',
  ],
  [
    4,
    'P5-W04-0001',
    'पासाङ तामाङ',
    'पुरुष',
    '9841890123',
    '27-01-75-10404',
    'मानेखर्क',
    5,
    2,
    3,
    'अर्ध-पक्की (जस्ता छाना)',
    27.934125,
    85.602314,
    'न्यून',
    'सामान्य तथा सुरक्षित क्षेत्र',
    'धारा / पाइप (निजी वा सार्वजनिक)',
    'फ्लश सहितको सुरक्षित चर्पी',
    'केन्द्रीय प्रसारण लाइन (NEA)',
  ],
  [
    5,
    'P5-W05-0001',
    'निमा तामाङ',
    'महिला',
    '9813456789',
    '27-01-76-10505',
    'सिमखर्क',
    4,
    2,
    2,
    'अर्ध-पक्की (जस्ता छाना)',
    27.892341,
    85.591245,
    'न्यून',
    'सुरक्षित बस्ती भेग',
    'धारा / पाइप (निजी वा सार्वजनिक)',
    'साधारण चर्पी',
    'केन्द्रीय प्रसारण लाइन (NEA)',
  ],
  [
    6,
    'P5-W06-0001',
    'राम कुमार श्रेष्ठ',
    'पुरुष',
    '9841345678',
    '27-01-77-10606',
    'केन्द्र बजार',
    5,
    3,
    2,
    'पक्की भवन (आरसीसी)',
    27.881236,
    85.612389,
    'न्यून',
    'बजार क्षेत्र सुरक्षित भूभाग',
    'धारा / पाइप (निजी वा सार्वजनिक)',
    'फ्लश सहितको सुरक्षित चर्पी',
    'केन्द्रीय प्रसारण लाइन (NEA)',
  ],
  [
    7,
    'P5-W07-0001',
    'कृष्ण गिरी',
    'पुरुष',
    '9851098765',
    '27-01-78-10707',
    'नदी किनार',
    4,
    2,
    2,
    'अर्ध-पक्की (जस्ता छाना)',
    27.863412,
    85.634512,
    'मध्यम',
    'बाढी कटान सम्भावित क्षेत्र (इन्द्रावती नदी)',
    'धारा / पाइप (निजी वा सार्वजनिक)',
    'फ्लश सहितको सुरक्षित चर्पी',
    'केन्द्रीय प्रसारण लाइन (NEA)',
  ],
  [
    8,
    'P5-W08-0001',
    'सोनाम तामाङ',
    'पुरुष',
    '9861239874',
    '27-01-79-10808',
    'भञ्ज्याङ',
    5,
    2,
    3,
    'अर्ध-पक्की (जस्ता छाना)',
    27.851245,
    85.651234,
    'न्यून',
    'सामान्य सुरक्षित डाँडा भेग',
    'धारा / पाइप (निजी वा सार्वजनिक)',
    'साधारण चर्पी',
    'केन्द्रीय प्रसारण लाइन (NEA)',
  ],
];

/**
 * Downloads official blank/sample Excel template for Panchpokhari Household Master Registry
 */
export function downloadHouseholdExcelTemplate(): void {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Master Form
  const wsData = [HOUSEHOLD_EXCEL_HEADERS, ...SAMPLE_HOUSEHOLD_ROWS];
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Column widths
  ws['!cols'] = [
    { wch: 18 }, // Ward No
    { wch: 22 }, // Matrix House No
    { wch: 26 }, // Household Head Name
    { wch: 16 }, // Gender
    { wch: 18 }, // Phone
    { wch: 25 }, // Citizenship/NID
    { wch: 20 }, // Tole/Village
    { wch: 18 }, // Family Size
    { wch: 16 }, // Male Count
    { wch: 16 }, // Female Count
    { wch: 24 }, // House Type
    { wch: 20 }, // GPS Lat
    { wch: 20 }, // GPS Lon
    { wch: 18 }, // Risk Level
    { wch: 32 }, // Risk Details
    { wch: 28 }, // Drinking Water
    { wch: 25 }, // Toilet Type
    { wch: 26 }, // Electricity
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'घरधुरी_लगत_फारम');

  // Sheet 2: Guidelines & Allowed Values
  const instructionsData = [
    ['पाँचपोखरी थाङपाल गाउँपालिका: आधिकारिक घरधुरी लगत (Master Records Hub) भर्ने मार्गदर्शन'],
    [''],
    ['स्तम्भ (Column)', 'अनिवार्यता', 'स्वीकार्य मानहरू (Allowed Values / Examples)', 'कैफियत / विवरण'],
    ['वडा नं.', 'अनिवार्य (*)', '१, २, ३, ४, ५, ६, ७, ८ (अंक १ देखि ८)', 'घरधुरी रहेको आधिकारिक वडा'],
    ['घरधुरी नम्बर', 'वैकल्पिक', 'P5-W01-0001 (वा खाली छाड्नुहोस्)', 'खाली छाडेमा प्रणालीले वडा अनुसार स्वतः नयाँ नम्बर दिनेछ'],
    ['घरमूलीको नाम', 'अनिवार्य (*)', 'जस्तै: दोर्जे तामाङ, सीता श्रेष्ठ', 'नेपाली वा अंग्रेजीमा घरमूलीको पूरा नाम'],
    ['घरमूलीको लिङ्ग', 'अनिवार्य (*)', 'पुरुष, महिला, अन्य (Male, Female, Other)', 'घरमूलीको लिङ्ग'],
    ['सम्पर्क फोन नं', 'वैकल्पिक', '९८४१५६७८९०, 9841567890', '१० अंकको मोबाइल नम्बर'],
    ['नागरिकता/परिचयपत्र', 'वैकल्पिक', '२७-०१-७२-१०१०१, NID-XXXX', 'नागरिकता वा राष्ट्रिय परिचयपत्र नम्बर'],
    ['टोल / बस्ती', 'सिफारिस', 'बाँसखर्क, ह्योल्मो गाउँ, मानेगाउँ, याङरी बजार आदि', 'घरधुरी रहेको टोल वा गाउँको नाम'],
    ['कुल परिवार संख्या', 'अनिवार्य (*)', 'संख्या (उदा: 4, 5, 6)', 'घरमा बसोबास गर्ने कुल सदस्य संख्या'],
    ['पुरुष संख्या', 'वैकल्पिक', 'संख्या (उदा: 2)', 'परिवारमा पुरुष सदस्य संख्या'],
    ['महिला संख्या', 'वैकल्पिक', 'संख्या (उदा: 3)', 'परिवारमा महिला सदस्य संख्या'],
    ['घरको संरचना प्रकार', 'सिफारिस', 'पक्की भवन (आरसीसी) / अर्ध-पक्की (जस्ता छाना) / कच्ची (ढुङ्गा माटो) / अस्थायी टहरो', 'घरको भौतिक बनावट'],
    ['GPS अक्षांश (Latitude)', 'सिफारिस', 'उदा: 27.901617 (२७.८५ देखि २८.०५ भित्र)', 'मोबाइल वा GPS उपकरणबाट लिइएको अक्षांश'],
    ['GPS देशान्तर (Longitude)', 'सिफारिस', 'उदा: 85.616633 (८५.५० देखि ८५.७५ भित्र)', 'मोबाइल वा GPS उपकरणबाट लिइएको देशान्तर'],
    ['विपद् जोखिम स्तर', 'सिफारिस', 'न्यून (Low), मध्यम (Medium), उच्च (High)', 'पहिरो वा बाढी कटानको संवेदनशीलता'],
    ['जोखिम कैफियत', 'वैकल्पिक', 'पहिरो उच्च जोखिम / नदी किनार कटान / सामान्य सुरक्षित क्षेत्र', 'जोखिम वा सुरक्षाको संक्षिप्त विवरण'],
    ['खानेपानीको मुख्य स्रोत', 'वैकल्पिक', 'धारा / पाइप (निजी वा सार्वजनिक) / मूल तथा कुवाको पानी / ट्युबवेल', 'दैनिक उपभोग गर्ने पानीको स्रोत'],
    ['शौचालयको प्रकार', 'वैकल्पिक', 'फ्लश सहितको सुरक्षित चर्पी / साधारण चर्पी / छैन', 'शौचालय सुविधा'],
    ['बिजुली/उर्जा स्रोत', 'वैकल्पिक', 'केन्द्रीय प्रसारण लाइन (NEA) / सौर्य उर्जा (Solar) / अन्य', 'उज्यालोका लागि प्रयोग हुने मुख्य उर्जा'],
    [''],
    ['महत्वपूर्ण सुझाव:', '', '', ''],
    ['१. पहिलो पङ्क्ति (Header Row) नबदल्नुहोस् र नमेट्नुहोस्।'],
    ['२. यस फाइलमा नयाँ डाटा भरेपछि "एक्सेल / गुगल शिट आयात" मेनुबाट सिधै अपलोड गर्नुहोस्।'],
    ['३. नयाँ डाटा अपलोड गर्दा "पहिलेको डाटा हटाएर नयाँ मात्र राख्ने" छनोट गरेमा पुरानो गलत डाटा स्वतः हटी सफा हुनेछ।'],
  ];

  const wsInstructions = XLSX.utils.aoa_to_sheet(instructionsData);
  wsInstructions['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 45 }, { wch: 45 }];
  XLSX.utils.book_append_sheet(wb, wsInstructions, 'मार्गदर्शन_र_निर्देशन');

  XLSX.writeFile(wb, 'Panchpokhari_Household_Master_Template.xlsx');
}

/**
 * Exports current loaded household records to Excel
 */
export function exportHouseholdsToExcel(records: HouseholdRecord[], filename?: string): void {
  const wb = XLSX.utils.book_new();

  const rows = records.map((h, idx) => {
    const lat = h.gpsLat || h.latitude || '';
    const lon = h.gpsLon || h.longitude || '';
    const familySize = Array.isArray(h.familyMembers) && h.familyMembers.length > 0
      ? h.familyMembers.length
      : (h.familySize || 4);
    const maleCount = h.meta?.maleCount || Math.floor(familySize / 2);
    const femaleCount = h.meta?.femaleCount || (familySize - maleCount);

    let riskNep = 'न्यून';
    if (h.riskLevel === 'high') riskNep = 'उच्च';
    else if (h.riskLevel === 'medium') riskNep = 'मध्यम';

    const genderNep = h.headGender === 'female' ? 'महिला' : 'पुरुष';

    return [
      h.wardNumber || 1,
      h.matrixHouseNo || `P5-W${String(h.wardNumber || 1).padStart(2, '0')}-${String(idx + 1).padStart(4, '0')}`,
      h.householdName || 'निजी घरधुरी',
      genderNep,
      h.contactPhone || '',
      h.citizenshipNo || h.meta?.citizenshipNo || '',
      h.tole || '',
      familySize,
      maleCount,
      femaleCount,
      h.houseType || 'अर्ध-पक्की (जस्ता छाना)',
      lat,
      lon,
      riskNep,
      h.riskDetails || '',
      h.drinkingWaterSource || 'धारा / पाइप (निजी वा सार्वजनिक)',
      h.toiletType || h.meta?.toiletType || 'फ्लश सहितको सुरक्षित चर्पी',
      h.electricitySource || h.meta?.electricitySource || 'केन्द्रीय प्रसारण लाइन (NEA)',
    ];
  });

  const wsData = [HOUSEHOLD_EXCEL_HEADERS, ...rows];
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  ws['!cols'] = [
    { wch: 18 },
    { wch: 22 },
    { wch: 26 },
    { wch: 16 },
    { wch: 18 },
    { wch: 25 },
    { wch: 20 },
    { wch: 18 },
    { wch: 16 },
    { wch: 16 },
    { wch: 24 },
    { wch: 20 },
    { wch: 20 },
    { wch: 18 },
    { wch: 32 },
    { wch: 28 },
    { wch: 25 },
    { wch: 26 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'घरधुरी_लगत');

  const name = filename || `Panchpokhari_Household_Master_Records_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, name);
}

/**
 * Parses uploaded Excel/CSV file and extracts valid household rows with validation summary
 */
export async function parseHouseholdExcelFile(file: File): Promise<ParsedHouseholdSummary> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const wb = XLSX.read(data, { type: 'binary' });

        // Prefer first sheet with "घरधुरी" or Sheet 0
        const targetSheetName = wb.SheetNames.find((s) => s.includes('घरधुरी')) || wb.SheetNames[0];
        const ws = wb.Sheets[targetSheetName];

        if (!ws) {
          throw new Error('फाइलमा कुनै पनि मान्य पाना (Sheet) फेला परेन।');
        }

        const rawJson: any[] = XLSX.utils.sheet_to_json(ws, { defval: '' });

        if (!rawJson || rawJson.length === 0) {
          throw new Error('अपलोड गरिएको फाइल खाली छ। कृपया डाटा भरिएको एक्सेल फाइल अपलोड गर्नुहोस्।');
        }

        const parseNum = (val: any, fallback: number = 0): number => {
          if (val === undefined || val === null || val === '') return fallback;
          if (typeof val === 'number') return isNaN(val) ? fallback : val;
          const nepaliDigits: Record<string, string> = {
            '०': '0', '१': '1', '२': '2', '३': '3', '४': '4',
            '५': '5', '६': '6', '७': '7', '८': '8', '९': '9',
          };
          const str = String(val).replace(/[०-९]/g, (d) => nepaliDigits[d] || d).replace(/[^0-9.-]/g, '');
          const n = parseFloat(str);
          return isNaN(n) ? fallback : n;
        };

        const validRows: any[] = [];
        const wardBreakdown: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0 };
        const riskBreakdown = { low: 0, medium: 0, high: 0 };
        const warnings: string[] = [];

        const seenMatrixNos = new Map<string, number>();

        for (let i = 0; i < rawJson.length; i++) {
          const r = rawJson[i];

          // Check if row has any non-empty value
          const hasData = Object.values(r).some((v) => v !== undefined && v !== null && String(v).trim() !== '');
          if (!hasData) continue;

          // Detect ward
          let ward = parseNum(
            r['वडा नं.* (Ward No)'] || r['वडा नं.'] || r['वडा नम्बर'] || r['वडा'] || r['wardNumber'] || r['Ward'] || r['ward'] || 1,
            1
          );
          if (ward < 1 || ward > 8) {
            ward = 1;
            if (warnings.length < 5) warnings.push(`पङ्क्ति ${i + 2}: वडा नम्बर १-८ बीच हुनुपर्छ। स्वतः वडा १ कायम गरियो।`);
          }

          // Household Head Name
          const householdName = String(
            r['घरमूलीको नाम* (Household Head Name)'] ||
            r['घरमूलीको नाम'] ||
            r['घरमूली'] ||
            r['householdName'] ||
            r['Household Head'] ||
            r['name'] ||
            ''
          ).trim();

          if (!householdName && warnings.length < 5) {
            warnings.push(`पङ्क्ति ${i + 2}: घरमूलीको नाम खाली भेटियो।`);
          }

          // Matrix House No with duplicate protection
          const rawMatrixNo = String(
            r['घरधुरी नम्बर (Matrix House No)'] ||
            r['घरधुरी नम्बर'] ||
            r['घर नम्बर'] ||
            r['matrixHouseNo'] ||
            ''
          ).trim();

          let matrixHouseNo = rawMatrixNo;
          if (matrixHouseNo) {
            if (seenMatrixNos.has(matrixHouseNo)) {
              const count = (seenMatrixNos.get(matrixHouseNo) || 1) + 1;
              seenMatrixNos.set(matrixHouseNo, count);
              matrixHouseNo = `${matrixHouseNo}-${count}`;
              if (warnings.length < 8) {
                warnings.push(`पङ्क्ति ${i + 2}: घरधुरी नम्बर '${rawMatrixNo}' दोहोरिएकोले '${matrixHouseNo}' कायम गरियो।`);
              }
            } else {
              seenMatrixNos.set(matrixHouseNo, 1);
            }
          }

          // Gender
          const genderRaw = String(
            r['घरमूलीको लिङ्ग* (Gender)'] ||
            r['घरमूलीको लिङ्ग'] ||
            r['लिङ्ग'] ||
            r['headGender'] ||
            r['Gender'] ||
            'पुरुष'
          ).toLowerCase();
          const headGender = genderRaw.startsWith('f') || genderRaw.includes('महिला') ? 'female' : 'male';

          // Phone
          const contactPhone = String(
            r['सम्पर्क फोन नं (Phone)'] ||
            r['सम्पर्क फोन'] ||
            r['सम्पर्क नं'] ||
            r['फोन'] ||
            r['मोबाइल'] ||
            r['contactPhone'] ||
            r['Phone'] ||
            ''
          ).trim();

          // Citizenship / NID
          const citizenshipNo = String(
            r['नागरिकता वा परिचयपत्र नं (Citizenship/NID)'] ||
            r['नागरिकता वा परिचयपत्र'] ||
            r['नागरिकता'] ||
            r['citizenshipNo'] ||
            ''
          ).trim();

          // Tole
          const tole = String(
            r['टोल / बस्ती (Tole/Village)'] ||
            r['टोल / बस्ती'] ||
            r['टोल'] ||
            r['गाउँ'] ||
            r['tole'] ||
            r['Tole'] ||
            ''
          ).trim();

          // Family size
          const familySize = parseNum(
            r['कुल परिवार संख्या* (Family Size)'] ||
            r['कुल परिवार संख्या'] ||
            r['परिवार संख्या'] ||
            r['familySize'] ||
            r['Family Size'],
            4
          );

          const maleCount = parseNum(
            r['पुरुष संख्या (Male Count)'] || r['पुरुष संख्या'] || r['पुरुष'] || r['maleCount'],
            Math.floor(familySize / 2)
          );

          const femaleCount = parseNum(
            r['महिला संख्या (Female Count)'] || r['महिला संख्या'] || r['महिला'] || r['femaleCount'],
            familySize - maleCount
          );

          // House Type
          const houseType = String(
            r['घरको संरचना प्रकार (House Type)'] ||
            r['घरको संरचना प्रकार'] ||
            r['घरको प्रकार'] ||
            r['houseType'] ||
            r['Building Type'] ||
            'अर्ध-पक्की (जस्ता छाना)'
          ).trim();

          // GPS Lat & Lon
          const gpsLat = parseFloat(
            String(
              r['GPS अक्षांश - Latitude (gpsLat)'] ||
              r['GPS अक्षांश'] ||
              r['अक्षांश'] ||
              r['gpsLat'] ||
              r['Latitude'] ||
              r['lat'] ||
              ''
            )
          ) || (27.9152 + (ward * 0.01));

          const gpsLon = parseFloat(
            String(
              r['GPS देशान्तर - Longitude (gpsLon)'] ||
              r['GPS देशान्तर'] ||
              r['देशान्तर'] ||
              r['gpsLon'] ||
              r['Longitude'] ||
              r['lon'] ||
              r['lng'] ||
              ''
            )
          ) || (85.6185 + (ward * 0.01));

          // Risk Level
          const riskRaw = String(
            r['विपद् जोखिम स्तर (Risk Level)'] ||
            r['विपद् जोखिम स्तर'] ||
            r['विपद् जोखिम'] ||
            r['जोखिम स्तर'] ||
            r['riskLevel'] ||
            r['Risk Level'] ||
            'न्यून'
          ).toLowerCase();

          let riskLevel: 'low' | 'medium' | 'high' = 'low';
          if (riskRaw.includes('high') || riskRaw.includes('उच्च')) {
            riskLevel = 'high';
            riskBreakdown.high++;
          } else if (riskRaw.includes('med') || riskRaw.includes('मध्यम')) {
            riskLevel = 'medium';
            riskBreakdown.medium++;
          } else {
            riskLevel = 'low';
            riskBreakdown.low++;
          }

          // Risk details
          const riskDetails = String(
            r['जोखिम कैफियत (Risk Details)'] ||
            r['जोखिम कैफियत'] ||
            r['कैफियत'] ||
            r['riskDetails'] ||
            (riskLevel === 'high' ? 'पहिरो उच्च जोखिम क्षेत्र' : riskLevel === 'medium' ? 'नदी तटीय बाढी/कटान क्षेत्र' : 'सामान्य तथा सुरक्षित क्षेत्र')
          ).trim();

          // Utilities
          const drinkingWaterSource = String(
            r['खानेपानीको मुख्य स्रोत (Drinking Water)'] ||
            r['खानेपानीको मुख्य स्रोत'] ||
            r['खानेपानीको स्रोत'] ||
            r['drinkingWaterSource'] ||
            'धारा / पाइप (निजी वा सार्वजनिक)'
          ).trim();

          const toiletType = String(
            r['शौचालयको प्रकार (Toilet Type)'] ||
            r['शौचालयको प्रकार'] ||
            r['toiletType'] ||
            'फ्लश सहितको सुरक्षित चर्पी'
          ).trim();

          const electricitySource = String(
            r['बिजुली/उर्जा स्रोत (Electricity Source)'] ||
            r['बिजुली/उर्जा स्रोत'] ||
            r['बिजुली'] ||
            r['electricitySource'] ||
            'केन्द्रीय प्रसारण लाइन (NEA)'
          ).trim();

          wardBreakdown[ward] = (wardBreakdown[ward] || 0) + 1;

          validRows.push({
            wardNumber: ward,
            matrixHouseNo,
            householdName: householdName || `घरधुरी (वडा ${ward})`,
            headGender,
            contactPhone,
            citizenshipNo,
            tole,
            familySize,
            maleCount,
            femaleCount,
            houseType,
            gpsLat,
            gpsLon,
            riskLevel,
            riskDetails,
            drinkingWaterSource,
            toiletType,
            electricitySource,
          });
        }

        resolve({
          validRows,
          totalCount: validRows.length,
          wardBreakdown,
          riskBreakdown,
          warnings,
          samplePreview: validRows.slice(0, 4),
        });
      } catch (err: any) {
        reject(new Error(err.message || 'एक्सेल फाइल पढ्न सकिएन।'));
      }
    };

    reader.onerror = () => reject(new Error('फाइल पढ्दा प्राविधिक त्रुटि भयो।'));
    reader.readAsBinaryString(file);
  });
}
