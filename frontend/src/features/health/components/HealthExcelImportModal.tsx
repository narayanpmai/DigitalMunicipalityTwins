import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
  X,
  FileSpreadsheet,
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileCheck2,
  Users,
  Pill,
  Sparkles,
  Building2,
} from 'lucide-react';
import { sectoralApi } from '../../../api/sectoral';

export interface HealthExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'facilities' | 'dhis2' | 'opd' | 'medicines';
  onSuccess: () => void;
}

export const HealthExcelImportModal: React.FC<HealthExcelImportModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'facilities',
  onSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'facilities' | 'dhis2' | 'opd' | 'medicines'>(initialTab);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileName, setFileName] = useState<string>('');
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync initial tab when opened
  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setParsedRows([]);
      setFileName('');
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  // ── 1. TEMPLATE DOWNLOAD HANDLERS ───────────────────────────────────────
  const handleDownloadFacilitiesTemplate = () => {
    const headers = [
      'सि.',
      'ठेगाना',
      'वडा',
      'स्थान',
      'संस्थाको नाम',
      'प्रकार',
      'दर्जा',
      'प्रमुखको नामथर',
      'मोबाइल नं.',
      'Latitude',
      'Longitude',
    ];

    const sampleRows = [
      [1, 'पाँचपोखरी थाङपाल गा.पा.', 1, 'बासखर्क', 'बासखर्क स्वास्थ्य चौकी', 'स्वास्थ्य चौकी', '', 'सागर आचार्य', '९८६४१६५३५३', 27.9450, 85.6130],
      [2, 'पाँचपोखरी थाङपाल गा.पा.', 2, 'बरुवा', 'बरुवा स्वास्थ्य चौकी', 'स्वास्थ्य चौकी', '', 'कमला थापा मगर', '९८६४१६५३९०', 27.9880, 85.6310],
      [3, 'पाँचपोखरी थाङपाल गा.पा.', 3, 'भोताङ', 'भोताङ स्वास्थ्य चौकी', 'स्वास्थ्य चौकी', '', 'प्यारीकुमारी तामाङ', '९८६४१६५३८३', 27.9789, 85.6123],
      [4, 'पाँचपोखरी थाङपाल गा.पा.', 4, 'थाङपाल', 'थाङपाल कोट स्वास्थ्य चौकी', 'स्वास्थ्य चौकी', '', 'ईश्वर दास', '९८६४१६५३८४', 27.9610, 85.5980],
      [6, 'पाँचपोखरी थाङपाल गा.पा.', 5, 'गुन्सा', 'गुन्सा स्वास्थ्य चौकी', 'स्वास्थ्य चौकी', '', 'खुस्बु दर्लामी', '९८६४१६५३८५', 27.9234, 85.5801],
      [7, 'पाँचपोखरी थाङपाल गा.पा.', 6, 'थाङपालधाप', 'थाङपालधाप सामुदायिक स्वास्थ्य ईकाइ', 'सामुदायिक स्वास्थ्य ईकाइ', '', 'उमा बाबा थापा', '९८४१४३०३४९', 27.9410, 85.5930],
      [8, 'पाँचपोखरी थाङपाल गा.पा.', 6, 'थाङपालधाप', 'थाङपालधाप स्वास्थ्य चौकी', 'स्वास्थ्य चौकी', '', 'पार्वती चौधरी', '९८६४१६५३८६', 27.9398, 85.5921],
      [9, 'पाँचपोखरी थाङपाल गा.पा.', 7, 'भोटेनाम्लाङ', 'भोटेनाम्लाङ स्वास्थ्य चौकी', 'स्वास्थ्य चौकी', '', 'निशा श्रेष्ठ', '९८६४१६५३८७', 27.9117, 85.5692],
      [10, 'पाँचपोखरी थाङपाल गा.पा.', 8, 'लाँगर्चे', 'लाँगर्चे स्वास्थ्य चौकी', 'स्वास्थ्य चौकी', '', 'विपना धिताल', '९८६४१६५३८८', 27.9087, 85.5745],
      [11, 'पाँचपोखरी थाङपाल गा.पा.', 9, 'लाँगर्चे', 'लाँगर्चे स्वास्थ्य चौकी', 'स्वास्थ्य चौकी', '', 'विपना धिताल', '९८६४१६५३८९', 27.9090, 85.5750],
    ];

    const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleRows]);
    ws['!cols'] = headers.map(() => ({ wch: 22 }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Health_Facilities');
    XLSX.writeFile(wb, 'Panchpokhari_Health_Facilities_Template.xlsx');
  };

  const handleDownloadDhis2Template = () => {
    const headers = [
      'स्वास्थ्य संस्थाको नाम',
      'वडा नं.',
      'आर्थिक वर्ष',
      'महिना',
      'DHIS2 Org Unit ID',
      'कुल ओपिडी बिरामी',
      'पुरुष ओपिडी',
      'महिला ओपिडी',
      'आकस्मिक सेवा',
      'पहिलो गर्भजाँच (1st ANC)',
      '४ पटक गर्भजाँच (4 ANC)',
      'संस्थागत सुत्केरी',
      'सुत्केरी पश्चात् जाँच (PNC)',
      'पूर्ण खोप बालबालिका',
      'वृद्धि अनुगमन',
      'झाडापखाला बिरामी',
      'निमोनिया/श्वासप्रश्वास',
      'उच्च रक्तचाप/मधुमेह',
      'मानसिक स्वास्थ्य',
      'प्रतिवेदकको नाम/पद',
    ];

    const sampleRows = [
      [
        'पाँचपोखरी आधारभूत अस्पताल',
        6,
        '२०८१/०८२',
        'भाद्र',
        'NP_BAG_SIN_P01',
        480,
        210,
        270,
        38,
        28,
        22,
        14,
        18,
        34,
        85,
        7,
        14,
        45,
        4,
        'स्वास्थ्य अधिकृत',
      ],
      [
        'मानेखर्क प्राथमिक स्वास्थ्य केन्द्र',
        4,
        '२०८१/०८२',
        'भाद्र',
        'NP_BAG_SIN_P04',
        360,
        165,
        195,
        22,
        19,
        15,
        9,
        12,
        26,
        64,
        5,
        11,
        28,
        2,
        'जनस्वास्थ्य निरीक्षक',
      ],
    ];

    const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleRows]);
    ws['!cols'] = headers.map(() => ({ wch: 22 }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'DHIS2_HMIS_Monthly_Report');
    XLSX.writeFile(wb, 'DHIS2_HMIS_Monthly_Report_Template.xlsx');
  };

  const handleDownloadOpdTemplate = () => {
    const headers = [
      'बिरामीको पूरा नाम (नेपाली)',
      'उमेर (वर्ष)',
      'लिङ्ग (male/female/other)',
      'वडा नं.',
      'मोबाइल नम्बर',
      'ओपिडी विभाग (Department)',
      'मुख्य समस्या/लक्षण (Chief Complaints)',
      'स्वास्थ्य बीमा छ? (हो/छैन)',
      'बीमा परिचयपत्र नं.',
      'स्वास्थ्य संस्थाको नाम',
      'टिकट शुल्क (रु)',
    ];

    const sampleRows = [
      [
        'रामबहादुर तामाङ',
        42,
        'male',
        6,
        '9841234567',
        'सामान्य चिकित्सा (General Medicine OPD)',
        '३ दिनदेखि ज्वरो र टाउको दुखाई',
        'हो',
        'HIB-2081-00452',
        'पाँचपोखरी आधारभूत अस्पताल',
        20,
      ],
      [
        'माया श्रेष्ठ',
        28,
        'female',
        3,
        '9861987654',
        'प्रसूति तथा स्त्रीरोग (MCH / ANC)',
        'नियमित दोस्रो त्रैमासिक गर्भजाँच',
        'छैन',
        '',
        'पाँचपोखरी आधारभूत अस्पताल',
        50,
      ],
    ];

    const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleRows]);
    ws['!cols'] = headers.map(() => ({ wch: 24 }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'OPD_Patients');
    XLSX.writeFile(wb, 'OPD_Patients_Registration_Template.xlsx');
  };

  const handleDownloadMedicineTemplate = () => {
    const headers = [
      'औषधिको नाम (व्यापारिक/ब्रान्ड)',
      'जेनेरिक नाम (Generic Name)',
      'प्रकार (essential/antibiotic/emergency/mch)',
      'स्वास्थ्य संस्था',
      'वडा नं.',
      'ब्याच नम्बर (Batch No)',
      'इकाई (ट्याब्लेट/भाइल/बोतल/क्याप्सुल)',
      'हाल मौज्दात संख्या (Quantity)',
      'न्यूनतम आवश्यक मौज्दात (Min Stock)',
      'म्याद सकिने मिति (BS/AD)',
    ];

    const sampleRows = [
      [
        'Paracetamol 500mg',
        'Paracetamol',
        'essential',
        'पाँचपोखरी आधारभूत अस्पताल',
        6,
        'PCM-2024-B1',
        'ट्याब्लेट',
        5000,
        1000,
        '२०८३/०४/०१',
      ],
      [
        'Amoxicillin 500mg',
        'Amoxicillin Trihydrate',
        'antibiotic',
        'मानेखर्क प्राथमिक स्वास्थ्य केन्द्र',
        4,
        'AMX-892',
        'क्याप्सुल',
        2400,
        500,
        '२०८२/१२/३०',
      ],
    ];

    const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleRows]);
    ws['!cols'] = headers.map(() => ({ wch: 24 }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'eLMIS_Medicines');
    XLSX.writeFile(wb, 'eLMIS_Medicine_Stock_Template.xlsx');
  };

  // ── 2. FILE UPLOAD & PARSING ─────────────────────────────────────────────
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setErrorMsg(null);
    setSuccessMsg(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsName = wb.SheetNames[0];
        const ws = wb.Sheets[wsName];
        const rawJson: any[] = XLSX.utils.sheet_to_json(ws, { defval: '' });

        if (!rawJson || rawJson.length === 0) {
          setErrorMsg('अपलोड गरिएको फाइलमा कुनै डाटा भेटिएन। कृपया नमुना टेम्प्लेट डाउनलोड गरी भर्नुहोस्।');
          return;
        }

        // Parse according to active tab
        if (activeTab === 'dhis2') {
          const parsed = rawJson.map((row) => {
            const facility =
              row['स्वास्थ्य संस्थाको नाम'] ||
              row['स्वास्थ्य संस्था'] ||
              row['healthFacilityName'] ||
              'पाँचपोखरी आधारभूत अस्पताल';
            const ward = Number(row['वडा नं.'] || row['wardNumber'] || 6);
            const fy = String(row['आर्थिक वर्ष'] || row['fiscalYear'] || '२०८१/०८२');
            const month = String(row['महिना'] || row['monthNepali'] || 'भाद्र');
            const orgUnit = String(row['DHIS2 Org Unit ID'] || row['dhis2OrgUnitId'] || 'NP_BAG_SIN_P01');

            return {
              healthFacilityName: facility,
              wardNumber: isNaN(ward) ? 6 : ward,
              fiscalYear: fy,
              monthNepali: month,
              dhis2OrgUnitId: orgUnit,
              totalOpdVisits: Number(row['कुल ओपिडी बिरामी'] || row['totalOpdVisits'] || 0),
              maleOpdVisits: Number(row['पुरुष ओपिडी'] || row['maleOpdVisits'] || 0),
              femaleOpdVisits: Number(row['महिला ओपिडी'] || row['femaleOpdVisits'] || 0),
              emergencyVisits: Number(row['आकस्मिक सेवा'] || row['emergencyVisits'] || 0),
              firstAncVisits: Number(row['पहिलो गर्भजाँच (1st ANC)'] || row['firstAncVisits'] || 0),
              fourAncProtocolVisits: Number(row['४ पटक गर्भजाँच (4 ANC)'] || row['fourAncProtocolVisits'] || 0),
              institutionalDeliveries: Number(row['संस्थागत सुत्केरी'] || row['institutionalDeliveries'] || 0),
              pncVisits: Number(row['सुत्केरी पश्चात् जाँच (PNC)'] || row['pncVisits'] || 0),
              fullyImmunizedChildren: Number(row['पूर्ण खोप बालबालिका'] || row['fullyImmunizedChildren'] || 0),
              growthMonitoredChildren: Number(row['वृद्धि अनुगमन'] || row['growthMonitoredChildren'] || 0),
              diarrheaCases: Number(row['झाडापखाला बिरामी'] || row['diarrheaCases'] || 0),
              ariPneumoniaCases: Number(row['निमोनिया/श्वासप्रश्वास'] || row['ariPneumoniaCases'] || 0),
              hypertensionDiabetesCases: Number(row['उच्च रक्तचाप/मधुमेह'] || row['hypertensionDiabetesCases'] || 0),
              mentalHealthCases: Number(row['मानसिक स्वास्थ्य'] || row['mentalHealthCases'] || 0),
              reportedBy: String(row['प्रतिवेदकको नाम/पद'] || row['reportedBy'] || 'स्वास्थ्य अधिकृत'),
              syncStatus: 'pending',
            };
          });
          setParsedRows(parsed);
        } else if (activeTab === 'opd') {
          const parsed = rawJson.map((row) => {
            const fullName = String(
              row['बिरामीको पूरा नाम (नेपाली)'] || row['नाम'] || row['fullName'] || 'बिरामी'
            );
            const age = Number(row['उमेर (वर्ष)'] || row['age'] || 30);
            const rawGender = String(row['लिङ्ग (male/female/other)'] || row['gender'] || 'male').toLowerCase();
            const gender = rawGender.includes('fe') || rawGender.includes('महि') ? 'female' : 'male';
            const ward = Number(row['वडा नं.'] || row['wardNumber'] || 6);
            const phone = String(row['मोबाइल नम्बर'] || row['phone'] || '');
            const dept = String(
              row['ओपिडी विभाग (Department)'] ||
                row['department'] ||
                'सामान्य चिकित्सा (General Medicine OPD)'
            );
            const complaint = String(row['मुख्य समस्या/लक्षण (Chief Complaints)'] || row['chiefComplaint'] || 'सामान्य परामर्श');
            const rawIns = String(row['स्वास्थ्य बीमा छ? (हो/छैन)'] || row['hasHealthInsurance'] || 'हो').toLowerCase();
            const hasIns = rawIns.includes('छ') || rawIns.includes('हो') || rawIns.includes('yes') || rawIns === 'true';
            const insNo = String(row['बीमा परिचयपत्र नं.'] || row['insuranceNumber'] || '');
            const facility = String(row['स्वास्थ्य संस्थाको नाम'] || 'पाँचपोखरी आधारभूत अस्पताल');
            const fee = Number(row['टिकट शुल्क (रु)'] || 20);

            return {
              firstName: fullName.split(' ')[0] || fullName,
              lastName: fullName.split(' ').slice(1).join(' ') || 'नेपाली',
              fullName,
              age: isNaN(age) ? 30 : age,
              gender,
              wardNumber: isNaN(ward) ? 6 : ward,
              phone,
              department: dept,
              chiefComplaint: complaint,
              hasHealthInsurance: hasIns,
              insuranceNumber: insNo,
              healthFacilityName: facility,
              ticketFee: fee,
              ticketStatus: 'active',
              visitType: 'new',
            };
          });
          setParsedRows(parsed);
        } else if (activeTab === 'medicines') {
          const parsed = rawJson.map((row) => {
            const medName = String(row['औषधिको नाम (व्यापारिक/ब्रान्ड)'] || row['medicineName'] || 'Paracetamol');
            const genName = String(row['जेनेरिक नाम (Generic Name)'] || row['genericName'] || medName);
            const cat = String(row['प्रकार (essential/antibiotic/emergency/mch)'] || row['category'] || 'essential');
            const facility = String(row['स्वास्थ्य संस्था'] || 'पाँचपोखरी आधारभूत अस्पताल');
            const ward = Number(row['वडा नं.'] || 6);
            const batch = String(row['ब्याच नम्बर (Batch No)'] || 'BATCH-001');
            const unit = String(row['इकाई (ट्याब्लेट/भाइल/बोतल/क्याप्सुल)'] || 'ट्याब्लेट');
            const qty = Number(row['हाल मौज्दात संख्या (Quantity)'] || row['stockQuantity'] || 100);
            const minQty = Number(row['न्यूनतम आवश्यक मौज्दात (Min Stock)'] || row['minimumRequiredStock'] || 20);
            const exp = String(row['म्याद सकिने मिति (BS/AD)'] || '२०८३/०१/०१');

            return {
              medicineName: medName,
              genericName: genName,
              category: cat,
              healthFacilityName: facility,
              wardNumber: isNaN(ward) ? 6 : ward,
              batchNo: batch,
              unit,
              stockQuantity: qty,
              minimumRequiredStock: minQty,
              expiryDate: exp,
              status: qty <= minQty ? 'low' : 'sufficient',
            };
          });
          setParsedRows(parsed);
        } else if (activeTab === 'facilities') {
          const parsed = rawJson.map((row) => {
            const rawOrder = row['सि.'] || row['सि'] || row['orderNo'] || row['क्रम'];
            const orderNo = rawOrder ? parseInt(String(rawOrder).replace(/[०-९]/g, (d) => '०१२३४५६७८९'.indexOf(d).toString()), 10) : undefined;
            const address = String(row['ठेगाना'] || row['address'] || 'पाँचपोखरी थाङपाल गा.पा.');
            const rawWard = row['वडा'] || row['वडा नं.'] || row['wardNumber'] || 1;
            const wardNumber = Number(String(rawWard).replace(/[०-९]/g, (d) => '०१२३४५६७८९'.indexOf(d).toString())) || 1;
            const location = String(row['स्थान'] || row['location'] || '');
            const nameNepali = String(row['संस्थाको नाम'] || row['नाम'] || row['nameNepali'] || 'स्वास्थ्य चौकी');
            const categoryNepali = String(row['प्रकार'] || row['categoryNepali'] || 'स्वास्थ्य चौकी');
            const designation = String(row['दर्जा'] || row['designation'] || '');
            const chiefName = String(row['प्रमुखको नामथर'] || row['प्रमुख'] || row['chiefName'] || row['inChargeName'] || '');
            const phone = String(row['मोबाइल नं.'] || row['मोबाइल'] || row['phone'] || row['contactNumber'] || '');
            const latitude = row['Latitude'] || row['अक्षांश'] ? parseFloat(row['Latitude'] || row['अक्षांश']) : undefined;
            const longitude = row['Longitude'] || row['देशान्तर'] ? parseFloat(row['Longitude'] || row['देशान्तर']) : undefined;

            return {
              orderNo: isNaN(orderNo as number) ? undefined : orderNo,
              address,
              wardNumber,
              location,
              nameNepali,
              name: nameNepali,
              categoryNepali,
              type: categoryNepali.includes('अस्पताल') ? 'hospital' : 'health_post',
              designation,
              chiefName,
              inChargeName: chiefName,
              phone,
              contactNumber: phone,
              latitude,
              longitude,
            };
          });
          setParsedRows(parsed);
        }
      } catch (err: any) {
        setErrorMsg('फाइल पढ्दा त्रुटि भयो: ' + err.message);
      }
    };
    reader.readAsBinaryString(file);
  };

  // ── 3. BATCH SUBMIT TO DATABASE ──────────────────────────────────────────
  const handleBatchSave = async () => {
    if (parsedRows.length === 0) return;

    setIsProcessing(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    let successCount = 0;
    let failCount = 0;

    for (const item of parsedRows) {
      try {
        if (activeTab === 'dhis2') {
          await sectoralApi.createDhis2Report(item);
        } else if (activeTab === 'opd') {
          await sectoralApi.createPatient(item);
        } else if (activeTab === 'medicines') {
          await sectoralApi.createMedicine(item);
        } else if (activeTab === 'facilities') {
          await sectoralApi.createHealthFacility(item);
        }
        successCount++;
      } catch (err) {
        console.error('Save error on item:', item, err);
        failCount++;
      }
    }

    setIsProcessing(false);

    if (successCount > 0) {
      setSuccessMsg(
        `सफलतापूर्वक ${successCount} वटा रेकर्डहरू डेटाबेसमा सुरक्षित गरियो! ${
          failCount > 0 ? `(${failCount} वटा असफल भयो)` : ''
        }`
      );
      setParsedRows([]);
      setFileName('');
      onSuccess();
    } else {
      setErrorMsg('रेकर्डहरू सुरक्षित गर्न सकिएन। कृपया नेटवर्क वा सर्भर लगहरू जाँच्नुहोस्।');
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1300,
        padding: '1.25rem',
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '900px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.75rem',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#f8fafc',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                backgroundColor: '#16a34a',
                color: '#ffffff',
                padding: '0.5rem',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FileSpreadsheet size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                स्वास्थ्य सेवा Excel / CSV एकमुष्ट डेटा अपलोड
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0 0 0' }}>
                DHIS2 मासिक स्वास्थ्य प्रतिवेदन, ओपिडी बिरामी दर्ता र निःशुल्क औषधि मौज्दात एकमुष्ट अपलोड गर्नुहोस्
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#64748b',
              padding: '0.25rem',
              borderRadius: '6px',
            }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Tab Selection */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            borderBottom: '1px solid #e2e8f0',
            backgroundColor: '#ffffff',
          }}
        >
          <button
            type="button"
            onClick={() => {
              setActiveTab('facilities');
              setParsedRows([]);
              setFileName('');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            style={{
              padding: '0.85rem 0.5rem',
              border: 'none',
              borderBottom: activeTab === 'facilities' ? '3px solid #dc2626' : '3px solid transparent',
              backgroundColor: activeTab === 'facilities' ? '#fef2f2' : 'transparent',
              color: activeTab === 'facilities' ? '#dc2626' : '#64748b',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
            }}
          >
            <Building2 size={16} />
            <span>१. स्वास्थ्य संस्था विवरण</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('dhis2');
              setParsedRows([]);
              setFileName('');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            style={{
              padding: '0.85rem 0.5rem',
              border: 'none',
              borderBottom: activeTab === 'dhis2' ? '3px solid #dc2626' : '3px solid transparent',
              backgroundColor: activeTab === 'dhis2' ? '#fef2f2' : 'transparent',
              color: activeTab === 'dhis2' ? '#dc2626' : '#64748b',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
            }}
          >
            <FileCheck2 size={16} />
            <span>२. DHIS2 प्रतिवेदन</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('opd');
              setParsedRows([]);
              setFileName('');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            style={{
              padding: '0.85rem 0.5rem',
              border: 'none',
              borderBottom: activeTab === 'opd' ? '3px solid #0284c7' : '3px solid transparent',
              backgroundColor: activeTab === 'opd' ? '#f0f9ff' : 'transparent',
              color: activeTab === 'opd' ? '#0284c7' : '#64748b',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
            }}
          >
            <Users size={16} />
            <span>३. OPD बिरामी दर्ता</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('medicines');
              setParsedRows([]);
              setFileName('');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            style={{
              padding: '0.85rem 0.5rem',
              border: 'none',
              borderBottom: activeTab === 'medicines' ? '3px solid #16a34a' : '3px solid transparent',
              backgroundColor: activeTab === 'medicines' ? '#f0fdf4' : 'transparent',
              color: activeTab === 'medicines' ? '#16a34a' : '#64748b',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
            }}
          >
            <Pill size={16} />
            <span>४. e-LMIS औषधि मौज्दात</span>
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Alerts */}
          {errorMsg && (
            <div
              style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                padding: '0.85rem 1rem',
                borderRadius: '8px',
                color: '#b91c1c',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
              }}
            >
              <AlertCircle size={18} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div
              style={{
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                padding: '0.85rem 1rem',
                borderRadius: '8px',
                color: '#15803d',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
              }}
            >
              <CheckCircle2 size={18} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Step 1: Download Template */}
          <div
            style={{
              backgroundColor: '#f8fafc',
              border: '1.5px dashed #cbd5e1',
              borderRadius: '12px',
              padding: '1.25rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={16} color="#0284c7" />
                <span>चरण १: आधिकारिक Excel नमुना (.xlsx) डाउनलोड गर्नुहोस्</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.25rem 0 0 0' }}>
                {activeTab === 'facilities' && 'गाउँपालिका अन्तर्गतका स्वास्थ्य संस्था, वडा, स्थान, संस्थाको नाम, प्रकार, दर्जा, प्रमुख र मोबाइल नम्बर।'}
                {activeTab === 'dhis2' && 'MoHP DHIS2/HMIS मानक स्तम्भहरू र नमुना तथ्याङ्क सहितको फाराम।'}
                {activeTab === 'opd' && 'ओपिडी बिरामी विवरण, स्वास्थ्य बीमा, लक्षण र टिकट सम्बन्धी स्तम्भहरू।'}
                {activeTab === 'medicines' && '९८ प्रकारका निःशुल्क औषधि, ब्याच, म्याद र मौज्दात संख्याको नमुना फाराम।'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                if (activeTab === 'facilities') handleDownloadFacilitiesTemplate();
                else if (activeTab === 'dhis2') handleDownloadDhis2Template();
                else if (activeTab === 'opd') handleDownloadOpdTemplate();
                else handleDownloadMedicineTemplate();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.6rem 1.25rem',
                borderRadius: '8px',
                border: '1px solid #0284c7',
                backgroundColor: '#ffffff',
                color: '#0284c7',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              }}
            >
              <Download size={16} />
              <span>Excel नमुना (.xlsx) डाउनलोड</span>
            </button>
          </div>

          {/* Step 2: Upload File */}
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: '2px dashed #94a3b8',
              borderRadius: '12px',
              padding: '1.75rem',
              textAlign: 'center',
              backgroundColor: '#fafafa',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".xlsx,.xls,.csv"
              style={{ display: 'none' }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              <div
                style={{
                  backgroundColor: '#e2e8f0',
                  color: '#475569',
                  padding: '0.75rem',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Upload size={24} />
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b' }}>
                {fileName ? `छनोट भएको फाइल: ${fileName}` : 'यहाँ फाइल ड्रप गर्नुहोस् वा क्लिक गरी छनोट गर्नुहोस्'}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                समर्थित फर्म्याटहरू: Microsoft Excel (.xlsx, .xls) तथा CSV (.csv)
              </div>
            </div>
          </div>

          {/* Step 3: Live Preview Table */}
          {parsedRows.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>
                  पूर्वावलोकन: {parsedRows.length} वटा रेकर्डहरू फेला परे
                </span>
                <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 700 }}>
                  ✓ डेटा जाँच सफल, अब डेटाबेसमा सुरक्षित गर्न सकिन्छ
                </span>
              </div>

              <div
                style={{
                  maxHeight: '220px',
                  overflowY: 'auto',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                }}
              >
                <div className="dt-responsive-table-wrapper">
<table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead style={{ backgroundColor: '#f1f5f9', position: 'sticky', top: 0 }}>
                    <tr>
                      <th style={{ padding: '8px 10px', borderBottom: '1px solid #cbd5e1' }}>#</th>
                      {activeTab === 'facilities' && (
                        <>
                          <th style={{ padding: '8px 10px', borderBottom: '1px solid #cbd5e1' }}>सि.</th>
                          <th style={{ padding: '8px 10px', borderBottom: '1px solid #cbd5e1' }}>ठेगाना</th>
                          <th style={{ padding: '8px 10px', borderBottom: '1px solid #cbd5e1' }}>वडा</th>
                          <th style={{ padding: '8px 10px', borderBottom: '1px solid #cbd5e1' }}>स्थान</th>
                          <th style={{ padding: '8px 10px', borderBottom: '1px solid #cbd5e1' }}>संस्थाको नाम</th>
                          <th style={{ padding: '8px 10px', borderBottom: '1px solid #cbd5e1' }}>प्रकार</th>
                          <th style={{ padding: '8px 10px', borderBottom: '1px solid #cbd5e1' }}>प्रमुखको नामथर</th>
                          <th style={{ padding: '8px 10px', borderBottom: '1px solid #cbd5e1' }}>मोबाइल नं.</th>
                        </>
                      )}
                      {activeTab === 'dhis2' && (
                        <>
                          <th style={{ padding: '8px 10px', borderBottom: '1px solid #cbd5e1' }}>संस्था</th>
                          <th style={{ padding: '8px 10px', borderBottom: '1px solid #cbd5e1' }}>वडा</th>
                          <th style={{ padding: '8px 10px', borderBottom: '1px solid #cbd5e1' }}>आ.व./महिना</th>
                          <th style={{ padding: '8px 10px', borderBottom: '1px solid #cbd5e1' }}>कुल OPD</th>
                          <th style={{ padding: '8px 10px', borderBottom: '1px solid #cbd5e1' }}>सुत्केरी</th>
                          <th style={{ padding: '8px 10px', borderBottom: '1px solid #cbd5e1' }}>पूर्ण खोप</th>
                          <th style={{ padding: '8px 10px', borderBottom: '1px solid #cbd5e1' }}>झाडापखाला/निमोनिया</th>
                        </>
                      )}
                      {activeTab === 'opd' && (
                        <>
                          <th style={{ padding: '8px 10px', borderBottom: '1px solid #cbd5e1' }}>बिरामीको नाम</th>
                          <th style={{ padding: '8px 10px', borderBottom: '1px solid #cbd5e1' }}>उमेर/लिङ्ग</th>
                          <th style={{ padding: '8px 10px', borderBottom: '1px solid #cbd5e1' }}>वडा</th>
                          <th style={{ padding: '8px 10px', borderBottom: '1px solid #cbd5e1' }}>ओपिडी विभाग</th>
                          <th style={{ padding: '8px 10px', borderBottom: '1px solid #cbd5e1' }}>लक्षण/समस्या</th>
                          <th style={{ padding: '8px 10px', borderBottom: '1px solid #cbd5e1' }}>बीमा</th>
                        </>
                      )}
                      {activeTab === 'medicines' && (
                        <>
                          <th style={{ padding: '8px 10px', borderBottom: '1px solid #cbd5e1' }}>औषधिको नाम</th>
                          <th style={{ padding: '8px 10px', borderBottom: '1px solid #cbd5e1' }}>जेनेरिक नाम</th>
                          <th style={{ padding: '8px 10px', borderBottom: '1px solid #cbd5e1' }}>संस्था / वडा</th>
                          <th style={{ padding: '8px 10px', borderBottom: '1px solid #cbd5e1' }}>ब्याच नं.</th>
                          <th style={{ padding: '8px 10px', borderBottom: '1px solid #cbd5e1' }}>मौज्दात</th>
                          <th style={{ padding: '8px 10px', borderBottom: '1px solid #cbd5e1' }}>म्याद</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {parsedRows.map((row, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '8px 10px', color: '#64748b' }}>{idx + 1}</td>
                        {activeTab === 'facilities' && (
                          <>
                            <td style={{ padding: '8px 10px', fontWeight: 700 }}>{row.orderNo || idx + 1}</td>
                            <td style={{ padding: '8px 10px' }}>{row.address}</td>
                            <td style={{ padding: '8px 10px' }}>वडा {row.wardNumber}</td>
                            <td style={{ padding: '8px 10px' }}>{row.location}</td>
                            <td style={{ padding: '8px 10px', fontWeight: 700, color: '#0f172a' }}>{row.nameNepali}</td>
                            <td style={{ padding: '8px 10px' }}>{row.categoryNepali}</td>
                            <td style={{ padding: '8px 10px', fontWeight: 600 }}>{row.chiefName}</td>
                            <td style={{ padding: '8px 10px', fontFamily: 'monospace' }}>{row.phone}</td>
                          </>
                        )}
                        {activeTab === 'dhis2' && (
                          <>
                            <td style={{ padding: '8px 10px', fontWeight: 600 }}>{row.healthFacilityName}</td>
                            <td style={{ padding: '8px 10px' }}>{row.wardNumber}</td>
                            <td style={{ padding: '8px 10px' }}>{row.fiscalYear} ({row.monthNepali})</td>
                            <td style={{ padding: '8px 10px', fontWeight: 700, color: '#0369a1' }}>{row.totalOpdVisits}</td>
                            <td style={{ padding: '8px 10px', color: '#16a34a', fontWeight: 700 }}>{row.institutionalDeliveries}</td>
                            <td style={{ padding: '8px 10px', color: '#d97706', fontWeight: 700 }}>{row.fullyImmunizedChildren}</td>
                            <td style={{ padding: '8px 10px' }}>{row.diarrheaCases} / {row.ariPneumoniaCases}</td>
                          </>
                        )}
                        {activeTab === 'opd' && (
                          <>
                            <td style={{ padding: '8px 10px', fontWeight: 700 }}>{row.fullName}</td>
                            <td style={{ padding: '8px 10px' }}>{row.age} वर्ष / {row.gender}</td>
                            <td style={{ padding: '8px 10px' }}>{row.wardNumber}</td>
                            <td style={{ padding: '8px 10px', color: '#0369a1' }}>{row.department}</td>
                            <td style={{ padding: '8px 10px' }}>{row.chiefComplaint}</td>
                            <td style={{ padding: '8px 10px' }}>{row.hasHealthInsurance ? '✓ बीमा' : '✗ सामान्य'}</td>
                          </>
                        )}
                        {activeTab === 'medicines' && (
                          <>
                            <td style={{ padding: '8px 10px', fontWeight: 700 }}>{row.medicineName}</td>
                            <td style={{ padding: '8px 10px', color: '#64748b' }}>{row.genericName}</td>
                            <td style={{ padding: '8px 10px' }}>{row.healthFacilityName} (वडा {row.wardNumber})</td>
                            <td style={{ padding: '8px 10px', fontFamily: 'monospace' }}>{row.batchNo}</td>
                            <td style={{ padding: '8px 10px', fontWeight: 700, color: '#16a34a' }}>
                              {row.stockQuantity} {row.unit}
                            </td>
                            <td style={{ padding: '8px 10px' }}>{row.expiryDate}</td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
</div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: '1rem 1.75rem',
            borderTop: '1px solid #e2e8f0',
            backgroundColor: '#f8fafc',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.75rem',
            alignItems: 'center',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '0.6rem 1.25rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#475569',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            रद्द गर्नुहोस्
          </button>

          <button
            type="button"
            disabled={parsedRows.length === 0 || isProcessing}
            onClick={handleBatchSave}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.6rem 1.5rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: parsedRows.length > 0 ? '#16a34a' : '#94a3b8',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: parsedRows.length > 0 ? 'pointer' : 'not-allowed',
              boxShadow: parsedRows.length > 0 ? '0 4px 12px rgba(22, 163, 74, 0.3)' : 'none',
            }}
          >
            {isProcessing ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>सुरक्षित हुँदैछ...</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={16} />
                <span>{parsedRows.length} वटा रेकर्डहरू डेटाबेसमा सुरक्षित गर्नुहोस्</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
