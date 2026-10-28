import * as XLSX from 'xlsx';

/**
 * Universal Data Export Utility for Municipal Digital Twin (Panchpokhari Thangpal)
 * Supports full Nepali Unicode Devanagari UTF-8 in Excel (.xlsx) and CSV (.csv with UTF-8 BOM).
 */

export interface ExportColumn<T = any> {
  header: string;
  key: keyof T | string;
  width?: number;
  format?: (value: any, row: T) => string | number;
}

export interface ExportOptions<T = any> {
  filename: string;
  sheetName?: string;
  columns: ExportColumn<T>[];
  data: T[];
}

/**
 * Generates an Excel (.xlsx) file and triggers download
 */
export function exportToExcel<T = any>({
  filename,
  sheetName = 'डाटा_अभिलेख',
  columns,
  data,
}: ExportOptions<T>): void {
  if (!data || data.length === 0) {
    alert('निर्यात गर्नका लागि कुनै तथ्याङ्क (Data) उपलब्ध छैन।');
    return;
  }

  // 1. Build Rows
  const headers = columns.map((col) => col.header);
  const rows = data.map((item, index) => {
    return columns.map((col) => {
      if (col.key === '__index__') {
        return index + 1;
      }
      const rawVal = getNestedValue(item, col.key as string);
      if (col.format) {
        return col.format(rawVal, item);
      }
      if (rawVal === null || rawVal === undefined) return '-';
      if (typeof rawVal === 'boolean') return rawVal ? 'छ' : 'छैन';
      return rawVal;
    });
  });

  const wsData = [headers, ...rows];
  const worksheet = XLSX.utils.aoa_to_sheet(wsData);

  // 2. Set Column Widths
  worksheet['!cols'] = columns.map((col) => ({
    wch: col.width || Math.max(col.header.length * 2, 16),
  }));

  // 3. Create Workbook & Append Sheet
  const workbook = XLSX.utils.book_new();
  const safeSheetName = (sheetName || 'Data').substring(0, 31).replace(/[\\/?*[\]]/g, '_');
  XLSX.utils.book_append_sheet(workbook, worksheet, safeSheetName);

  // 4. Download
  const safeFilename = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`;
  XLSX.writeFile(workbook, safeFilename);
}

/**
 * Generates a CSV (.csv) file with UTF-8 BOM and triggers download
 * UTF-8 BOM (\uFEFF) ensures Nepali Devanagari script opens correctly in Microsoft Excel on Windows.
 */
export function exportToCsv<T = any>({
  filename,
  columns,
  data,
}: ExportOptions<T>): void {
  if (!data || data.length === 0) {
    alert('निर्यात गर्नका लागि कुनै तथ्याङ्क (Data) उपलब्ध छैन।');
    return;
  }

  const headers = columns.map((col) => `"${col.header.replace(/"/g, '""')}"`).join(',');
  const rows = data.map((item, index) => {
    return columns
      .map((col) => {
        let val: any;
        if (col.key === '__index__') {
          val = index + 1;
        } else {
          const rawVal = getNestedValue(item, col.key as string);
          val = col.format ? col.format(rawVal, item) : rawVal;
        }
        if (val === null || val === undefined) val = '-';
        if (typeof val === 'boolean') val = val ? 'छ' : 'छैन';
        const strVal = String(val).replace(/"/g, '""');
        return `"${strVal}"`;
      })
      .join(',');
  });

  // Prepend UTF-8 BOM (\uFEFF)
  const csvContent = '\uFEFF' + [headers, ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const safeFilename = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  link.setAttribute('download', safeFilename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Helper to retrieve nested object value by dot notation ('user.name')
 */
function getNestedValue(obj: any, path: string): any {
  if (!obj || !path) return undefined;
  if (!path.includes('.')) return obj[path];
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}

/**
 * Pre-configured Exporter: Businesses
 */
export function exportBusinessesData(businesses: any[], format: 'xlsx' | 'csv' = 'xlsx') {
  const dateStr = new Date().toISOString().slice(0, 10);
  const columns: ExportColumn[] = [
    { header: 'क्र.सं.', key: '__index__', width: 8 },
    { header: 'दर्ता नम्बर', key: 'registrationNo', width: 18 },
    { header: 'व्यवसायको नाम', key: 'businessName', width: 28 },
    { header: 'Business Name (En)', key: 'businessNameEn', width: 26 },
    { header: 'प्रोप्राइटरको नाम', key: 'proprietorName', width: 22 },
    { header: 'सम्पर्क फोन', key: 'proprietorPhone', width: 16 },
    { header: 'नागरिकता नं.', key: 'proprietorCitizenshipNo', width: 18 },
    { header: 'प्यान / भ्याट नं.', key: 'panNumber', width: 16 },
    { header: 'व्यवसायको प्रकृति', key: 'category', width: 30 },
    { header: 'वडा नं.', key: 'wardNumber', width: 10, format: (v) => `वडा नं. ${v}` },
    { header: 'टोल / बस्ती', key: 'tole', width: 18 },
    { header: 'लगानी पूँजी (रु.)', key: 'capitaInvestmentNPR', width: 18, format: (v) => Number(v || 0).toLocaleString('en-IN') },
    { header: 'कामदार संख्या', key: 'employeeCount', width: 14 },
    { header: 'दर्ता मिति (वि.सं.)', key: 'registrationDateBs', width: 18 },
    { header: 'नवीकरण म्याद (वि.सं.)', key: 'renewalDueDateBs', width: 18 },
    { header: 'वार्षिक शुल्क (रु.)', key: 'annualFeeNPR', width: 16, format: (v) => Number(v || 0).toLocaleString('en-IN') },
    { header: 'स्थिति', key: 'status', width: 16 },
  ];

  const filename = `Panchpokhari_Business_Register_${dateStr}`;
  if (format === 'csv') {
    exportToCsv({ filename, columns, data: businesses });
  } else {
    exportToExcel({ filename, sheetName: 'व्यवसाय_दर्ता_अभिलेख', columns, data: businesses });
  }
}

/**
 * Pre-configured Exporter: Employees HRMS
 */
export function exportEmployeesData(employees: any[], format: 'xlsx' | 'csv' = 'xlsx') {
  const dateStr = new Date().toISOString().slice(0, 10);
  const columns: ExportColumn[] = [
    { header: 'क्र.सं.', key: '__index__', width: 8 },
    { header: 'कर्मचारी संकेत नं.', key: 'employeeCode', width: 18, format: (v, r) => v || r.id?.substring(0, 8) },
    { header: 'पूरा नाम', key: 'fullName', width: 24 },
    { header: 'पद (Designation)', key: 'designation', width: 22 },
    { header: 'शाखा / फाँट / कार्यालय', key: 'department', width: 26 },
    { header: 'वडा नं.', key: 'wardNumber', width: 10, format: (v) => v ? `वडा नं. ${v}` : 'केन्द्र' },
    { header: 'सेवा प्रकार', key: 'employmentType', width: 16 },
    { header: 'सेवा स्थिति', key: 'serviceStatus', width: 18 },
    { header: 'सम्पर्क फोन', key: 'phone', width: 16 },
    { header: 'ईमेल', key: 'email', width: 22 },
    { header: 'नागरिकता नं.', key: 'citizenshipNo', width: 18 },
    { header: 'स्थायी लेखा नं. (PAN)', key: 'panNumber', width: 16 },
    { header: 'कर्मचारी सञ्चय कोष (PF)', key: 'pfNumber', width: 16 },
    { header: 'नियुक्ति मिति (वि.सं.)', key: 'joiningDateBs', width: 18 },
    { header: 'जन्म मिति (वि.सं.)', key: 'dateOfBirthBs', width: 18 },
    { header: 'शैक्षिक योग्यता', key: 'highestEducation', width: 20 },
    { header: 'मासिक तलब (रु.)', key: 'monthlySalary', width: 16, format: (v) => v ? Number(v).toLocaleString('en-IN') : '-' },
    { header: 'ठेगाना', key: 'currentAddress', width: 22 },
  ];

  const filename = `Panchpokhari_Employees_HRMS_${dateStr}`;
  if (format === 'csv') {
    exportToCsv({ filename, columns, data: employees });
  } else {
    exportToExcel({ filename, sheetName: 'कर्मचारी_विवरण_अभिलेख', columns, data: employees });
  }
}

/**
 * Pre-configured Exporter: Complaints & Grievances
 */
export function exportComplaintsData(complaints: any[], format: 'xlsx' | 'csv' = 'xlsx') {
  const dateStr = new Date().toISOString().slice(0, 10);
  const columns: ExportColumn[] = [
    { header: 'क्र.सं.', key: '__index__', width: 8 },
    { header: 'ट्र्याकिङ कोड', key: 'trackingNumber', width: 18, format: (v, r) => v || r.ticketId || r.id?.substring(0, 8) },
    { header: 'गुनासोको विषय / शीर्षक', key: 'title', width: 28 },
    { header: 'विस्तृत व्यहोरा', key: 'description', width: 36 },
    { header: 'क्षेत्र / वर्गीकरण', key: 'category', width: 20 },
    { header: 'गुनासोकर्ता', key: 'complainantName', width: 20, format: (v, r) => r.isAnonymous ? 'गोप्य (अज्ञात)' : (v || 'नागरिक') },
    { header: 'सम्पर्क फोन', key: 'complainantPhone', width: 16 },
    { header: 'वडा नं.', key: 'wardNumber', width: 10, format: (v) => v ? `वडा नं. ${v}` : 'सम्पूर्ण' },
    { header: 'प्राथमिकता', key: 'priority', width: 14 },
    { header: 'स्थिति', key: 'status', width: 16 },
    { header: 'जिम्मेवार शाखा', key: 'assignedDepartment', width: 26 },
    { header: 'जिम्मेवार अधिकारी', key: 'assignedTo', width: 22 },
    { header: 'दर्ता मिति', key: 'createdAt', width: 18, format: (v) => v ? String(v).slice(0, 10) : '-' },
  ];

  const filename = `Panchpokhari_Complaints_Log_${dateStr}`;
  if (format === 'csv') {
    exportToCsv({ filename, columns, data: complaints });
  } else {
    exportToExcel({ filename, sheetName: 'नागरिक_गुनासो_अभिलेख', columns, data: complaints });
  }
}

/**
 * Pre-configured Exporter: Vital Events Registry (Birth, Death, Marriage, Divorce, Migration)
 */
export function exportVitalEventsData(events: any[], format: 'xlsx' | 'csv' = 'xlsx') {
  const dateStr = new Date().toISOString().slice(0, 10);
  const eventTypeMap: Record<string, string> = {
    birth: 'जन्म दर्ता',
    death: 'मृत्यु दर्ता',
    marriage: 'विवाह दर्ता',
    divorce: 'सम्बन्ध विच्छेद',
    migration: 'बसाइँसराइ',
  };

  const columns: ExportColumn[] = [
    { header: 'क्र.सं.', key: '__index__', width: 8 },
    { header: 'दर्ता नम्बर', key: 'registrationNumber', width: 18 },
    { header: 'घटनाको प्रकार', key: 'eventType', width: 18, format: (v) => eventTypeMap[v] || v },
    { header: 'सम्बन्धित व्यक्तिको नाम', key: 'personName', width: 24 },
    { header: 'Person Name (English)', key: 'personNameEn', width: 24 },
    { header: 'घटना मिति (वि.सं.)', key: 'eventDateBs', width: 18 },
    { header: 'घटना मिति (ई.सं.)', key: 'eventDateAd', width: 16 },
    { header: 'वडा नं.', key: 'wardNumber', width: 10, format: (v) => `वडा नं. ${v}` },
    { header: 'सूचकको नाम (Informant)', key: 'informantName', width: 22 },
    { header: 'सूचकको नागरिकता नं.', key: 'informantCitizenshipNo', width: 20 },
    { header: 'बाबु / पतिको नाम', key: 'fatherOrHusbandName', width: 22 },
    { header: 'आमाको नाम', key: 'motherName', width: 22 },
    { header: 'प्रमाणपत्र स्थिति', key: 'status', width: 16 },
    { header: 'कैफियत', key: 'remarks', width: 24 },
  ];

  const filename = `Panchpokhari_Vital_Events_${dateStr}`;
  if (format === 'csv') {
    exportToCsv({ filename, columns, data: events });
  } else {
    exportToExcel({ filename, sheetName: 'घटना_दर्ता_अभिलेख', columns, data: events });
  }
}

/**
 * Pre-configured Exporter: Judicial Committee Cases
 */
export function exportJudicialCasesData(cases: any[], format: 'xlsx' | 'csv' = 'xlsx') {
  const dateStr = new Date().toISOString().slice(0, 10);
  const columns: ExportColumn[] = [
    { header: 'क्र.सं.', key: '__index__', width: 8 },
    { header: 'मुद्दा दर्ता नं.', key: 'caseNumber', width: 18, format: (v, r) => v || r.registrationNo || r.id?.substring(0, 8) },
    { header: 'मुद्दा / विवादको विषय', key: 'title', width: 28 },
    { header: 'विवादको प्रकृति', key: 'disputeType', width: 26 },
    { header: 'वादी / निवेदक', key: 'complainantName', width: 22 },
    { header: 'वादी सम्पर्क', key: 'complainantPhone', width: 16 },
    { header: 'प्रतिवादीको नाम', key: 'respondentName', width: 22 },
    { header: 'प्रतिवादी सम्पर्क', key: 'respondentPhone', width: 16 },
    { header: 'वडा नं.', key: 'wardNumber', width: 10, format: (v) => `वडा नं. ${v}` },
    { header: 'दर्ता मिति (वि.सं.)', key: 'registrationDateBs', width: 18 },
    { header: 'आगामी पेशी / तारेख', key: 'nextHearingDateBs', width: 18 },
    { header: 'मुद्दाको अवस्था', key: 'status', width: 20 },
    { header: 'तोकिएको मेलमिलापकर्ता', key: 'assignedMediator', width: 22 },
    { header: 'निर्णय / मिलापत्र सारांश', key: 'verdictSummary', width: 32 },
  ];

  const filename = `Panchpokhari_Judicial_Cases_${dateStr}`;
  if (format === 'csv') {
    exportToCsv({ filename, columns, data: cases });
  } else {
    exportToExcel({ filename, sheetName: 'न्यायिक_समिति_मुद्दा_अभिलेख', columns, data: cases });
  }
}

/**
 * Pre-configured Exporter: Municipal Assets (PAMS)
 */
export function exportAssetsData(assets: any[], format: 'xlsx' | 'csv' = 'xlsx') {
  const dateStr = new Date().toISOString().slice(0, 10);
  const columns: ExportColumn[] = [
    { header: 'क्र.सं.', key: '__index__', width: 8 },
    { header: 'जिन्सी संकेत नं.', key: 'assetCode', width: 18 },
    { header: 'सम्पत्तिको नाम / विवरण', key: 'assetName', width: 28 },
    { header: 'वर्गीकरण (Category)', key: 'category', width: 24 },
    { header: 'म.ले.प. फारम नं.', key: 'malepaForm', width: 16 },
    { header: 'वडा नं.', key: 'wardNumber', width: 10, format: (v) => v ? `वडा नं. ${v}` : 'केन्द्र' },
    { header: 'शाखा / कार्यालय', key: 'department', width: 22 },
    { header: 'जिम्मा लिने कर्मचारी', key: 'custodianName', width: 22 },
    { header: 'स्थान / कोठा नं.', key: 'location', width: 18 },
    { header: 'खरिद मिति (वि.सं.)', key: 'purchaseDateBs', width: 16 },
    { header: 'खरिद मूल्य (रु.)', key: 'purchaseCost', width: 16, format: (v) => Number(v || 0).toLocaleString('en-IN') },
    { header: 'हालको मूल्य (रु.)', key: 'currentBookValue', width: 16, format: (v) => Number(v || 0).toLocaleString('en-IN') },
    { header: 'भौतिक अवस्था', key: 'condition', width: 16 },
    { header: 'मोडेल / प्लेट नं.', key: 'modelOrPlateNo', width: 18 },
    { header: 'कैफियत', key: 'remarks', width: 22 },
  ];

  const filename = `Panchpokhari_Assets_PAMS_${dateStr}`;
  if (format === 'csv') {
    exportToCsv({ filename, columns, data: assets });
  } else {
    exportToExcel({ filename, sheetName: 'सम्पत्ति_तथा_जिन्सी_अभिलेख', columns, data: assets });
  }
}

/**
 * Pre-configured Exporter: Digital Library Books
 */
export function exportLibraryBooksData(books: any[], format: 'xlsx' | 'csv' = 'xlsx') {
  const dateStr = new Date().toISOString().slice(0, 10);
  const mediaMap: Record<string, string> = {
    physical: 'भौतिक पुस्तक',
    ebook: 'ई-पुस्तक (PDF)',
    audiobook: 'अडियोबुक',
    videobook: 'भिडियो ई-कक्षा',
  };

  const columns: ExportColumn[] = [
    { header: 'क्र.सं.', key: '__index__', width: 8 },
    { header: 'पुस्तक संकेत नं.', key: 'bookId', width: 16 },
    { header: 'पुस्तकको नाम / शीर्षक', key: 'title', width: 30 },
    { header: 'लेखक / रचनाकार', key: 'author', width: 22 },
    { header: 'प्रकाशक', key: 'publisher', width: 20 },
    { header: 'प्रकाशन वर्ष (वि.सं.)', key: 'publicationYear', width: 16 },
    { header: 'विधा / श्रेणी', key: 'category', width: 20 },
    { header: 'विषय', key: 'subject', width: 20 },
    { header: 'भाषा', key: 'language', width: 14 },
    { header: 'ढाँचा (Media Type)', key: 'mediaType', width: 18, format: (v) => mediaMap[v] || v },
    { header: 'ISBN', key: 'isbn', width: 16 },
    { header: 'र्याक नं.', key: 'rackNo', width: 12 },
    { header: 'दराज नं.', key: 'shelfNo', width: 12 },
    { header: 'कुल प्रति', key: 'totalCopies', width: 12 },
    { header: 'उपलब्ध प्रति', key: 'availableCopies', width: 12 },
    { header: 'पृष्ठ संख्या', key: 'pages', width: 12 },
    { header: 'स्थिति', key: 'verificationStatus', width: 14 },
  ];

  const filename = `Panchpokhari_Library_Catalog_${dateStr}`;
  if (format === 'csv') {
    exportToCsv({ filename, columns, data: books });
  } else {
    exportToExcel({ filename, sheetName: 'पुस्तकालय_क्याटलग', columns, data: books });
  }
}

/**
 * Pre-configured Exporter: Cultural Museum Artifacts & Heritage Assets
 */
export function exportMuseumAssetsData(assets: any[], format: 'xlsx' | 'csv' = 'xlsx') {
  const dateStr = new Date().toISOString().slice(0, 10);
  const columns: ExportColumn[] = [
    { header: 'क्र.सं.', key: '__index__', width: 8 },
    { header: 'सामग्री संकेत नं.', key: 'assetId', width: 18 },
    { header: 'कलाकृति / सम्पदाको नाम', key: 'nameNp', width: 28 },
    { header: 'Name in English', key: 'nameEn', width: 26 },
    { header: 'विधा / वर्गीकरण', key: 'category', width: 22 },
    { header: 'उप-विधा', key: 'subCategory', width: 18 },
    { header: 'अनुमानित कालखण्ड', key: 'estimatedPeriod', width: 18 },
    { header: 'उत्पत्ति स्थल', key: 'origin', width: 20 },
    { header: 'बनावट सामग्री', key: 'material', width: 18 },
    { header: 'भौतिक अवस्था', key: 'condition', width: 16 },
    { header: 'सङ्ग्रहालय स्थान', key: 'museumLocation', width: 22 },
    { header: 'ऐतिहासिक पृष्ठभूमि', key: 'history', width: 34 },
    { header: 'परम्परागत उपयोग', key: 'usage', width: 26 },
    { header: 'प्रदर्शन स्थिति', key: 'verificationStatus', width: 16 },
  ];

  const filename = `Panchpokhari_Museum_Catalog_${dateStr}`;
  if (format === 'csv') {
    exportToCsv({ filename, columns, data: assets });
  } else {
    exportToExcel({ filename, sheetName: 'सङ्ग्रहालय_क्याटलग', columns, data: assets });
  }
}

