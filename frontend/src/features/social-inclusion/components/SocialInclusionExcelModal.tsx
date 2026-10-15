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
  Baby,
  Smile,
  Accessibility,
  Coins,
  HeartHandshake,
} from 'lucide-react';
import { sectoralApi } from '../../../api/sectoral';
import type { SocialInclusionCategory } from '../../../types/social-inclusion';

export interface SocialInclusionExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: SocialInclusionCategory;
  onSuccess: () => void;
}

export const SocialInclusionExcelModal: React.FC<SocialInclusionExcelModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'women_children',
  onSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<SocialInclusionCategory>(initialTab);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileName, setFileName] = useState<string>('');
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // ── TEMPLATE DOWNLOAD ───────────────────────────────────────
  const handleDownloadTemplate = () => {
    let headers: string[] = [];
    let sampleData: any[][] = [];
    let filename = '';

    if (activeTab === 'women_children') {
      filename = 'P5_Women_Children_Template.xlsx';
      headers = [
        'वडा नं.',
        'कार्यक्रम / समूहको नाम',
        'सेवा प्रकार',
        'स्थान / टोल',
        'लाभान्वित संख्या',
        'महिला संख्या',
        'विनियोजित बजेट (रु.)',
        'खर्च बजेट (रु.)',
        'संयोजकको नाम',
        'मोबाइल नं.',
        'Latitude',
        'Longitude',
        'स्थिति',
        'कैफियत',
      ];
      sampleData = [
        [1, 'बासखर्क जनहित महिला बचत समूह', 'महिला समूह तथा उद्यम', 'बासखर्क', 45, 45, 250000, 210000, 'सरिता तामाङ', '९८४१२२३३४४', 27.9450, 85.6130, 'regular', 'अग्र्यानिक किबी प्रवर्द्धन'],
        [2, 'बरुवा मातृशिशु पोषण कार्यक्रम', 'मातृशिशु पोषण', 'बरुवा', 78, 52, 400000, 380000, 'कमला थापा', '९८६४१६५३९०', 27.9880, 85.6310, 'ongoing', 'पोषण भत्ता वितरण'],
      ];
    } else if (activeTab === 'senior') {
      filename = 'P5_Senior_Citizens_Template.xlsx';
      headers = [
        'वडा नं.',
        'कार्यक्रमको नाम',
        'सेवा प्रकार',
        'स्थान / टोल',
        'लाभान्वित ज्येष्ठ नागरिक संख्या',
        '७५+ ज्येष्ठ नागरिक',
        'बजेट / भत्ता रकम (रु.)',
        'खर्च रकम (रु.)',
        'सम्पर्क व्यक्ति',
        'मोबाइल नं.',
        'Latitude',
        'Longitude',
        'स्थिति',
        'कैफियत',
      ];
      sampleData = [
        [6, 'पाँचपोखरी ज्येष्ठ नागरिक सम्मान तथा भत्ता', 'सामाजिक सुरक्षा भत्ता', 'थाङपालधाप', 1680, 520, 6500000, 6200000, 'सामाजिक विकास अधिकृत', '०११-६९०१००', 27.9398, 85.5921, 'regular', 'प्रत्येक त्रैमासिकमा भुक्तानी'],
        [1, 'बासखर्क घरदैलो ज्येष्ठ नागरिक स्वास्थ्य सेवा', 'घरदैलो स्वास्थ्य परीक्षण', 'बासखर्क', 140, 48, 180000, 165000, 'सागर आचार्य', '९८६४१६५३५३', 27.9450, 85.6130, 'regular', 'रक्तचाप र मधुमेह जाँच'],
      ];
    } else if (activeTab === 'disability') {
      filename = 'P5_Disability_Inclusion_Template.xlsx';
      headers = [
        'वडा नं.',
        'कार्यक्रम / विवरण',
        'परिचयपत्र वर्ग (क/ख/ग/घ)',
        'स्थान / टोल',
        'लाभान्वित संख्या',
        'सहायक सामग्री / भत्ता विवरण',
        'बजेट (रु.)',
        'खर्च रकम (रु.)',
        'सम्पर्क व्यक्ति',
        'मोबाइल नं.',
        'Latitude',
        'Longitude',
        'स्थिति',
        'कैफियत',
      ];
      sampleData = [
        [6, "'क' वर्ग (रातो कार्ड) पूर्ण अशक्त भत्ता", 'क', 'थाङपालधाप', 42, 'मासिक रु. ३,९९० भत्ता', 2010960, 1950000, 'स्वास्थ्य संयोजक', '०११-६९०१००', 27.9398, 85.5921, 'regular', 'पूर्ण अशक्त घरदैलो सेवा'],
        [1, 'अपाङ्गता ह्विलचेयर तथा सहायक सामग्री वितरण', 'क/ख', 'बासखर्क', 28, 'ह्विलचेयर तथा वैशाखी', 350000, 340000, 'सागर आचार्य', '९८६४१६५३५३', 27.9450, 85.6130, 'completed', '१२ थान ह्विलचेयर वितरण'],
      ];
    } else if (activeTab === 'economic') {
      filename = 'P5_Economic_Empowerment_Template.xlsx';
      headers = [
        'वडा नं.',
        'कार्यक्रमको नाम',
        'क्षेत्र / प्रकार',
        'स्थान / टोल',
        'लाभान्वित संख्या',
        'विपन्न/दलित परिवार संख्या',
        'विनियोजित बजेट (रु.)',
        'खर्च रकम (रु.)',
        'संयोजक / संस्था',
        'मोबाइल नं.',
        'Latitude',
        'Longitude',
        'स्थिति',
        'कैफियत',
      ];
      sampleData = [
        [6, 'प्रधानमन्त्री रोजगार कार्यक्रम (१०० दिने रोजगारी)', '१०० दिने रोजगारी', 'थाङपालधाप', 320, 140, 2450000, 2380000, 'रोजगार संयोजक', '०११-६९०१००', 27.9398, 85.5921, 'completed', 'पदमार्ग तथा सडक मर्मत'],
        [1, 'किबी खेती तथा फलफूल प्रशोधन तालिम', 'कृषि उद्यम तालिम', 'बासखर्क', 40, 18, 280000, 265000, 'कृषि प्राविधिक', '९८६४१६५३५३', 27.9450, 85.6130, 'completed', 'किबी जाम तथा जुस प्रविधि'],
      ];
    } else {
      filename = 'P5_Marginalized_Targeted_Groups_Template.xlsx';
      headers = [
        'वडा नं.',
        'कार्यक्रमको नाम',
        'क्षेत्र / प्रकार',
        'स्थान / टोल',
        'लाभान्वित संख्या',
        'महिला संख्या',
        'विनियोजित बजेट (रु.)',
        'खर्च रकम (रु.)',
        'संयोजक / संस्था',
        'मोबाइल नं.',
        'Latitude',
        'Longitude',
        'स्थिति',
        'कैफियत',
      ];
      sampleData = [
        [4, 'ह्योल्मो तथा तामाङ परम्परागत संस्कृति तथा सम्पदा संरक्षण', 'आदिवासी जनजाति संस्कृति', 'मानेखर्क', 240, 120, 850000, 820000, 'लाक्पा दोर्जे ह्योल्मो', '९८४१९९११२२', 27.9610, 85.5980, 'completed', 'भाषा लिपि कक्षा तथा वाद्यवादन संरक्षण'],
        [7, 'दलित समुदाय परम्परागत आरन आधुनिकीकरण तथा आधुनिक औजार', 'दलित उत्थान तथा सीप', 'भोटेनाम्लाङ', 38, 8, 450000, 435000, 'टेक बहादुर विश्वकर्मा', '९८४९३३२२११', 27.9117, 85.5692, 'completed', 'इलेक्ट्रिक ब्लोअर र ग्राइन्डर सहयोग'],
      ];
    }

    const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleData]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Inclusion_Data');
    XLSX.writeFile(wb, filename);
  };

  // ── FILE UPLOAD & PARSING ─────────────────────────────────────
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
        const rawJson: any[] = XLSX.utils.sheet_to_json(ws);

        if (rawJson.length === 0) {
          setErrorMsg('छानिएको एक्सेल फाइलमा कुनै तथ्याङ्क भेटिएन।');
          return;
        }

        const mappedRows = rawJson.map((row) => {
          const ward = parseInt(row['वडा नं.'] || row['वडा'] || row['Ward'] || '1', 10) || 1;
          const title = String(row['कार्यक्रम / समूहको नाम'] || row['कार्यक्रमको नाम'] || row['कार्यक्रम / विवरण'] || row['Title'] || row['नाम'] || 'नयाँ कार्यक्रम').trim();
          const serviceType = String(row['सेवा प्रकार'] || row['क्षेत्र / प्रकार'] || row['प्रकार'] || row['Type'] || '').trim();
          const location = String(row['स्थान / टोल'] || row['स्थान'] || row['Location'] || `वडा नं. ${ward}`).trim();
          const beneficiariesCount = parseInt(row['लाभान्वित संख्या'] || row['लाभान्वित ज्येष्ठ नागरिक संख्या'] || row['Beneficiaries'] || '0', 10) || 0;
          const femaleBeneficiaries = parseInt(row['महिला संख्या'] || '0', 10) || 0;
          const budgetAllocated = parseFloat(row['विनियोजित बजेट (रु.)'] || row['बजेट / भत्ता रकम (रु.)'] || row['बजेट (रु.)'] || row['Budget'] || '0') || 0;
          const budgetSpent = parseFloat(row['खर्च बजेट (रु.)'] || row['खर्च रकम (रु.)'] || row['खर्च'] || '0') || 0;
          const coordinatorName = String(row['संयोजकको नाम'] || row['सम्पर्क व्यक्ति'] || row['संयोजक / संस्था'] || row['Coordinator'] || '').trim();
          const coordinatorPhone = String(row['मोबाइल नं.'] || row['फोन'] || row['Phone'] || '').trim();
          const lat = parseFloat(row['Latitude'] || row['अक्षांश'] || '27.9450') || 27.9450;
          const lng = parseFloat(row['Longitude'] || row['देशान्तर'] || '85.6130') || 85.6130;
          const status = String(row['स्थिति'] || 'regular').trim();
          const remarks = String(row['कैफियत'] || '').trim();

          let disabilityCardType = 'none';
          const cardRaw = String(row['परिचयपत्र वर्ग (क/ख/ग/घ)'] || row['वर्ग'] || '').toLowerCase();
          if (cardRaw.includes('क') || cardRaw.includes('ka')) disabilityCardType = 'ka';
          else if (cardRaw.includes('ख') || cardRaw.includes('kha')) disabilityCardType = 'kha';
          else if (cardRaw.includes('ग') || cardRaw.includes('ga')) disabilityCardType = 'ga';
          else if (cardRaw.includes('घ') || cardRaw.includes('gha')) disabilityCardType = 'gha';

          return {
            category: activeTab,
            wardNumber: ward,
            fiscalYear: '२०८१/०८२',
            title,
            serviceType,
            location,
            beneficiariesCount,
            femaleBeneficiaries,
            maleBeneficiaries: beneficiariesCount - femaleBeneficiaries,
            disabilityCardType,
            budgetAllocated,
            budgetSpent,
            coordinatorName,
            coordinatorPhone,
            latitude: lat,
            longitude: lng,
            status,
            remarks,
          };
        });

        setParsedRows(mappedRows);
        setSuccessMsg(`${mappedRows.length} वटा रेकर्डहरू आयातका लागि तयार भयो।`);
      } catch (err: any) {
        setErrorMsg('एक्सेल फाइल पढ्न सकिएन। ढाँचा जाँच गर्नुहोस्।');
      }
    };
    reader.readAsBinaryString(file);
  };

  // ── CONFIRM IMPORT ───────────────────────────────────────────
  const handleConfirmImport = async () => {
    if (parsedRows.length === 0) return;
    setIsProcessing(true);
    setErrorMsg(null);
    try {
      await sectoralApi.bulkImportSocialInclusionRecords(parsedRows);
      setSuccessMsg(`सफलतापूर्वक ${parsedRows.length} वटा रेकर्डहरू डेटाबेसमा सुरक्षित गरियो!`);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1400);
    } catch (err: any) {
      setErrorMsg('डेटाबेसमा सुरक्षित गर्न सकिएन: ' + (err?.response?.data?.message || err.message));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.72)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1rem',
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '820px',
          maxHeight: '92vh',
          overflowY: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          border: '1px solid #cbd5e1',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.25rem 1.75rem',
            borderBottom: '1px solid #e2e8f0',
            backgroundColor: '#f8fafc',
            borderTopLeftRadius: '16px',
            borderTopRightRadius: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: '#ecfdf5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FileSpreadsheet size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                सामाजिक समावेशीकरण एकमुष्ट Excel आयात (Bulk Import)
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0 0 0' }}>
                Excel फाइल मार्फत एकैपटक धेरै विवरणहरू प्रविष्ट गर्नुहोस्
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              border: 'none',
              background: '#f1f5f9',
              color: '#64748b',
              cursor: 'pointer',
              padding: '7px',
              borderRadius: '8px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Category Selector Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', backgroundColor: '#ffffff', padding: '0 1.5rem' }}>
          {[
            { key: 'women_children', label: 'महिला तथा बालबालिका', icon: Baby, color: '#ec4899' },
            { key: 'senior', label: 'ज्येष्ठ नागरिक सुरक्षा', icon: Smile, color: '#2563eb' },
            { key: 'disability', label: 'अपाङ्गता सशक्तीकरण', icon: Accessibility, color: '#16a34a' },
            { key: 'economic', label: 'आर्थिक तथा सीप विकास', icon: Coins, color: '#d97706' },
            { key: 'marginalized', label: 'दलित, जनजाति तथा लक्षित वर्ग', icon: HeartHandshake, color: '#7c3aed' },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setActiveTab(tab.key as SocialInclusionCategory);
                  setParsedRows([]);
                  setFileName('');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '12px 16px',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  fontSize: '0.84rem',
                  fontWeight: isSelected ? 800 : 600,
                  color: isSelected ? tab.color : '#64748b',
                  borderBottom: isSelected ? `3px solid ${tab.color}` : '3px solid transparent',
                }}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem 1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Step 1: Download Template */}
          <div
            style={{
              padding: '1.1rem',
              backgroundColor: '#f8fafc',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <h4 style={{ fontSize: '0.90rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                चरण १: आधिकारिक Excel नमुना (Template) डाउनलोड गर्नुहोस्
              </h4>
              <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '3px 0 0 0' }}>
                सम्बन्धित क्षेत्र अनुसार आवश्यक स्तम्भहरू भएको .xlsx फाइल तयार पारिएको छ।
              </p>
            </div>
            <button
              type="button"
              onClick={handleDownloadTemplate}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#0284c7',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
              }}
            >
              <Download size={15} />
              <span>नमुना डाउनलोड (.xlsx)</span>
            </button>
          </div>

          {/* Step 2: Upload File */}
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              padding: '2rem',
              borderRadius: '12px',
              border: '2px dashed #cbd5e1',
              backgroundColor: '#ffffff',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".xlsx, .xls, .csv"
              style={{ display: 'none' }}
            />
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: '#eff6ff',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 10px auto',
              }}
            >
              <Upload size={24} />
            </div>
            <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>
              {fileName ? fileName : 'यहाँ क्लिक गरी Excel फाइल छनोट गर्नुहोस्'}
            </h4>
            <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '4px 0 0 0' }}>
              .xlsx, .xls ढाँचाको फाइल अपलोड गर्नुहोस्
            </p>
          </div>

          {/* Feedback messages */}
          {errorMsg && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', borderRadius: '8px', backgroundColor: '#fef2f2', color: '#b91c1c', fontSize: '0.84rem' }}>
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', borderRadius: '8px', backgroundColor: '#f0fdf4', color: '#15803d', fontSize: '0.84rem' }}>
              <CheckCircle2 size={16} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Data Preview Table */}
          {parsedRows.length > 0 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f172a' }}>
                  पूर्वावलोकन (Preview): कुल {parsedRows.length} वटा रेकर्ड
                </span>
              </div>
              <div style={{ maxHeight: '220px', overflowY: 'auto', border: '1px solid #cbd5e1', borderRadius: '8px' }}>
                <div className="dt-responsive-table-wrapper">
<table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.80rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                      <th style={{ padding: '8px 10px' }}>वडा</th>
                      <th style={{ padding: '8px 10px' }}>कार्यक्रम / संस्थाको नाम</th>
                      <th style={{ padding: '8px 10px' }}>स्थान</th>
                      <th style={{ padding: '8px 10px' }}>लाभान्वित</th>
                      <th style={{ padding: '8px 10px' }}>बजेट</th>
                      <th style={{ padding: '8px 10px' }}>सम्पर्क</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedRows.map((r, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '7px 10px', fontWeight: 700 }}>वडा {r.wardNumber}</td>
                        <td style={{ padding: '7px 10px', fontWeight: 600 }}>{r.title}</td>
                        <td style={{ padding: '7px 10px', color: '#64748b' }}>{r.location}</td>
                        <td style={{ padding: '7px 10px', fontWeight: 700 }}>{r.beneficiariesCount} जना</td>
                        <td style={{ padding: '7px 10px' }}>रु. {r.budgetAllocated?.toLocaleString()}</td>
                        <td style={{ padding: '7px 10px', color: '#64748b' }}>{r.coordinatorName || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
</div>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '0.8rem', borderTop: '1px solid #e2e8f0' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '9px 18px',
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
              onClick={handleConfirmImport}
              disabled={parsedRows.length === 0 || isProcessing}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 20px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#16a34a',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: parsedRows.length === 0 || isProcessing ? 'not-allowed' : 'pointer',
                opacity: parsedRows.length === 0 || isProcessing ? 0.6 : 1,
              }}
            >
              {isProcessing && <Loader2 size={16} className="animate-spin" />}
              <span>{isProcessing ? 'सुरक्षित हुँदैछ...' : 'एकमुष्ट आयात गर्नुहोस्'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
