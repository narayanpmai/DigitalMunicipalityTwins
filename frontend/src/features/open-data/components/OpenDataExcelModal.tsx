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
  Database,
  FileText,
  Compass,
  Award,
} from 'lucide-react';
import { sectoralApi } from '../../../api/sectoral';
import type { OpenDataCategory, OpenDataRecord } from '../../../types/open-data';

export interface OpenDataExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultCategory?: OpenDataCategory;
}

const CATEGORY_INFOS: Record<OpenDataCategory, { label: string; icon: any; color: string; bg: string }> = {
  datasets: { label: 'खुला डेटा क्याटलग (Datasets)', icon: Database, color: '#2563eb', bg: '#eff6ff' },
  reports: { label: 'सार्वजनिक प्रतिवेदनहरू (Reports)', icon: FileText, color: '#10b981', bg: '#ecfdf5' },
  strategic: { label: 'रणनीतिक योजना तथा MTED', icon: Compass, color: '#9333ea', bg: '#faf5ff' },
  practices: { label: 'असल अभ्यास र सिकाइ (Practices)', icon: Award, color: '#d97706', bg: '#fffbeb' },
};

export const OpenDataExcelModal: React.FC<OpenDataExcelModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultCategory = 'datasets',
}) => {
  const [activeTab, setActiveTab] = useState<OpenDataCategory>(defaultCategory);
  const [file, setFile] = useState<File | null>(null);
  const [previewRows, setPreviewRows] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setActiveTab(defaultCategory);
    resetState();
  }, [defaultCategory, isOpen]);

  const resetState = () => {
    setFile(null);
    setPreviewRows([]);
    setErrorMsg(null);
    setSuccessMsg(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDownloadTemplate = () => {
    let headers: string[] = [];
    let sampleData: any[][] = [];
    let filename = '';

    if (activeTab === 'datasets') {
      filename = 'P5_OpenData_Datasets_Template.xlsx';
      headers = [
        'डेटासेटको शीर्षक',
        'विधा / क्षेत्र',
        'फाइल ढाँचा (Format)',
        'फाइल साइज (Size)',
        'रेकर्ड संख्या',
        'अद्यावधिक मिति',
        'आर्थिक वर्ष',
        'वडा नं.',
        'शाखा / निकाय',
        'डाउनलोड लिङ्क',
        'विस्तृत विवरण',
      ];
      sampleData = [
        ['पालिका जनसांख्यिकी तथा घरधुरी विवरण २०८१', 'जनसांख्यिकी', 'CSV / JSON', '1.2 MB', 5120, '२०८१/०५/०१', '२०८१/०८२', 0, 'योजना तथा तथ्याङ्क शाखा', '/data/downloads/demographics.csv', '८ वटै वडाको घरधुरी र जनसंख्या तथ्याङ्क'],
        ['वार्षिक बजेट तथा योजना विनियोजन २०८१/८२', 'बजेट/योजना', 'CSV / XLSX', '2.4 MB', 450, '२०८१/०४/१५', '२०८१/०८२', 0, 'आर्थिक प्रशासन शाखा', '/data/downloads/budget.xlsx', 'गाउँसभाबाट पारित बजेट र योजनाहरू'],
      ];
    } else if (activeTab === 'reports') {
      filename = 'P5_OpenData_Reports_Template.xlsx';
      headers = [
        'प्रतिवेदनको शीर्षक',
        'प्रतिवेदन प्रकार',
        'आर्थिक वर्ष',
        'प्रकाशन मिति',
        'फाइल ढाँचा',
        'साइज',
        'प्रकाशक / शाखा',
        'फाइल लिङ्क / URL',
        'विस्तृत विवरण र निष्कर्ष',
      ];
      sampleData = [
        ['आ.व. २०८०/०८१ वार्षिक प्रगति समीक्षा प्रतिवेदन', 'वार्षिक प्रतिवेदन', '२०८०/०८१', '२०८१/०४/३०', 'PDF', '4.2 MB', 'प्रमुख प्रशासकीय अधिकृतको कार्यालय', '/reports/annual_2080_81.pdf', 'वार्षिक भौतिक र वित्तीय प्रगतिको समीक्षा'],
        ['सार्वजनिक सुनुवाइ तथा सामाजिक परीक्षण प्रतिवेदन', 'सुशासन तथा परीक्षण', '२०८०/०८१', '२०८१/०३/२५', 'PDF', '2.6 MB', 'योजना तथा अनुगमन शाखा', '/reports/social_audit.pdf', '८ वटै वडामा आयोजित सार्वजनिक सुनुवाइ प्रतिवेदन'],
      ];
    } else if (activeTab === 'strategic') {
      filename = 'P5_OpenData_Strategic_MTED_Template.xlsx';
      headers = [
        'रणनीतिक स्तम्भ / योजना शीर्षक',
        'रणनीतिक क्षेत्र',
        'प्रमुख आवधिक लक्ष्य',
        'योजना अवधि (आ.व.)',
        'अनुमानित बजेट (रु.)',
        'जिम्मेवार शाखा',
        'प्रमुख सूचकहरू (सेमिकोलन ; ले छुट्याउनुहोस्)',
        'विस्तृत विवरण',
      ];
      sampleData = [
        ['दिगो सडक तथा पूर्वाधार संजाल विस्तार', 'पूर्वाधार विकास', '९५% बस्तीमा सुरक्षित बाह्रमासे सडक पहुँच', '२०८१-२०८६', 285000000, 'पूर्वाधार विकास शाखा', 'कालोपत्रे सडक: २५ किमी; ग्राभेल: ४० किमी; पक्की पुल: ४ वटा', 'गाउँपालिका चक्रपथ र वडा जोड्ने सडक स्तरोन्नति'],
        ['अग्र्यानिक कृषि, किबी र पशुपालन', 'आर्थिक विकास', 'कृषि आम्दानीमा ४०% वृद्धि र १००% अग्र्यानिक', '२०८१-२०८६', 145000000, 'कृषि शाखा', 'किबी पकेट: ५०० हेक्टर; शीतभण्डार: २ वटा', 'उत्पादित कृषि उपजको ब्रान्डिङ तथा बजार ग्यारेन्टी'],
      ];
    } else {
      filename = 'P5_OpenData_Good_Practices_Template.xlsx';
      headers = [
        'असल अभ्यासको शीर्षक',
        'विधा / क्षेत्र',
        'मुख्य आकर्षण / ट्यागलाइन',
        'आर्थिक वर्ष',
        'वडा नं.',
        'सहकार्य तथा जिम्मेवार शाखा',
        'प्राप्त उपलब्धिहरू (सेमिकोलन ; ले छुट्याउनुहोस्)',
        'विस्तृत पृष्ठभूमि र सिकाइ',
      ];
      sampleData = [
        ['डिजिटल ट्विन तथा GIS आधारित योजना प्रणाली', 'डिजिटल सुशासन', 'डिजिटल सुशासनको राष्ट्रिय नमुना', '२०८१/०८२', 0, 'काठमाडौँ विश्वविद्यालय / आइटी शाखा', 'थ्रीडी मोडेल तयार; GIS तह व्यवस्थापन; वैज्ञानिक योजना', 'नेपालमै पहिलो स्थानीय तह ३डी डिजिटल ट्विन'],
        ["'हाम्रो पाँचपोखरी' स्थानीय पाठ्यक्रम निर्माण", 'मौलिक शिक्षा', 'मौलिक ज्ञान र भाषा संरक्षण', '२०८०/०८१', 0, 'शिक्षा शाखा', 'कक्षा १-८ सम्म ८ वटा पाठ्यपुस्तक; ह्योल्मो भाषा संरक्षण', 'स्थानीय भूगोल, भाषा र संस्कृति समेटिएको पाठ्यक्रम'],
      ];
    }

    const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleData]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data');
    XLSX.writeFile(wb, filename);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setErrorMsg(null);
    setSuccessMsg(null);
    parseExcelFile(selected);
  };

  const parseExcelFile = (fileObj: File) => {
    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsName = wb.SheetNames[0];
        const ws = wb.Sheets[wsName];
        const data: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });

        if (!data || data.length <= 1) {
          setErrorMsg('फाइलमा कुनै डेटा रेकर्ड भेटिएन। कृपया नमुना ढाँचा अनुसार भर्नुहोस्।');
          setIsProcessing(false);
          return;
        }

        const rawRows = data.slice(1);
        const mappedRecords: Partial<OpenDataRecord>[] = [];

        rawRows.forEach((row) => {
          if (!row || row.length === 0 || !row[0]) return;

          if (activeTab === 'datasets') {
            mappedRecords.push({
              category: 'datasets',
              title: String(row[0] || '').trim(),
              subCategory: String(row[1] || '').trim() || 'जनसांख्यिकी',
              format: String(row[2] || '').trim() || 'CSV / JSON',
              fileSize: String(row[3] || '').trim() || '1.0 MB',
              recordsCount: Number(row[4]) || 0,
              publishDate: String(row[5] || '').trim() || '२०८१/०५/०१',
              fiscalYear: String(row[6] || '').trim() || '२०८१/०८२',
              wardNumber: Number(row[7]) || 0,
              authorOrDepartment: String(row[8] || '').trim() || 'योजना तथा सूचना प्रविधि शाखा',
              fileUrl: String(row[9] || '').trim(),
              description: String(row[10] || '').trim(),
              status: 'सक्रिय',
            });
          } else if (activeTab === 'reports') {
            mappedRecords.push({
              category: 'reports',
              title: String(row[0] || '').trim(),
              subCategory: String(row[1] || '').trim() || 'वार्षिक प्रतिवेदन',
              fiscalYear: String(row[2] || '').trim() || '२०८१/०८२',
              publishDate: String(row[3] || '').trim() || '२०८१/०४/३०',
              format: String(row[4] || '').trim() || 'PDF',
              fileSize: String(row[5] || '').trim() || '2.5 MB',
              authorOrDepartment: String(row[6] || '').trim() || 'प्रमुख प्रशासकीय अधिकृतको कार्यालय',
              fileUrl: String(row[7] || '').trim(),
              description: String(row[8] || '').trim(),
              status: 'प्रकाशित',
            });
          } else if (activeTab === 'strategic') {
            const rawIndicators = String(row[6] || '')
              .split(';')
              .map((s) => s.trim())
              .filter((s) => s.length > 0);

            mappedRecords.push({
              category: 'strategic',
              title: String(row[0] || '').trim(),
              subCategory: String(row[1] || '').trim() || 'पूर्वाधार विकास',
              targetGoal: String(row[2] || '').trim(),
              fiscalYear: String(row[3] || '').trim() || '२०८१-२०८६',
              budgetAllocated: Number(row[4]) || 0,
              authorOrDepartment: String(row[5] || '').trim() || 'योजना शाखा',
              keyIndicators: rawIndicators.length > 0 ? rawIndicators : undefined,
              description: String(row[7] || '').trim(),
              format: 'MTED ५-वर्षे स्तम्भ',
              status: 'कार्यान्वयनमा',
            });
          } else {
            const rawAchievements = String(row[6] || '')
              .split(';')
              .map((s) => s.trim())
              .filter((s) => s.length > 0);

            mappedRecords.push({
              category: 'practices',
              title: String(row[0] || '').trim(),
              subCategory: String(row[1] || '').trim() || 'डिजिटल सुशासन',
              tagBadge: String(row[2] || '').trim() || 'नमुना असल अभ्यास',
              fiscalYear: String(row[3] || '').trim() || '२०८१/०८२',
              wardNumber: Number(row[4]) || 0,
              authorOrDepartment: String(row[5] || '').trim() || 'पाँचपोखरी थाङपाल गाउँपालिका',
              keyIndicators: rawAchievements.length > 0 ? rawAchievements : undefined,
              description: String(row[7] || '').trim(),
              format: 'नमुना असल अभ्यास',
              status: 'नियमित',
            });
          }
        });

        setPreviewRows(mappedRecords);
      } catch (err: any) {
        setErrorMsg('एक्सेल फाइल पढ्न सकिएन: ' + (err?.message || 'अमान्य ढाँचा'));
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsBinaryString(fileObj);
  };

  const handleUploadSubmit = async () => {
    if (previewRows.length === 0) {
      setErrorMsg('अपलोड गर्नका लागि कुनै मान्य डेटा पङ्क्ति छैन।');
      return;
    }

    setIsUploading(true);
    setErrorMsg(null);
    try {
      const res = await sectoralApi.bulkImportOpenDataRecords(previewRows);
      setSuccessMsg(res?.message || `${previewRows.length} वटा रेकर्ड सफलतापूर्वक आयात गरियो!`);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMsg('बल्क अपलोड असफल भयो: ' + (err?.response?.data?.message || err?.message || 'नेटवर्क त्रुटि'));
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '850px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, #f0fdf4 0%, #e2e8f0 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                backgroundColor: '#16a34a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
              }}
            >
              <FileSpreadsheet size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                एक्सेल बल्क डेटा आयात (Excel Bulk Import)
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0 0 0' }}>
                खुला डेटासेट, प्रतिवेदन, MTED योजना वा असल अभ्यासहरू एकमुष्ट अपलोड गर्नुहोस्
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#64748b',
              padding: '6px',
              borderRadius: '8px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Category Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            backgroundColor: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
            overflowX: 'auto',
          }}
        >
          {(Object.keys(CATEGORY_INFOS) as OpenDataCategory[]).map((cat) => {
            const info = CATEGORY_INFOS[cat];
            const Icon = info.icon;
            const isSelected = activeTab === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setActiveTab(cat);
                  resetState();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 0.9rem',
                  borderRadius: '8px',
                  border: isSelected ? `2px solid ${info.color}` : '1px solid #cbd5e1',
                  backgroundColor: isSelected ? '#ffffff' : 'transparent',
                  color: isSelected ? info.color : '#64748b',
                  fontWeight: isSelected ? 700 : 500,
                  fontSize: '0.825rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                <Icon size={16} color={isSelected ? info.color : '#94a3b8'} />
                <span>{info.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Content */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Download Template Card */}
          <div
            style={{
              padding: '1rem 1.25rem',
              backgroundColor: '#f8fafc',
              borderRadius: '12px',
              border: '1px dashed #cbd5e1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#0f172a' }}>
                १. पहिले नमुना एक्सेल फाइल (Sample Template) डाउनलोड गर्नुहोस्
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                यस टेम्प्लेटमा सही स्तम्भहरू (Columns) र नमुना डेटा समावेश गरिएको छ।
              </div>
            </div>
            <button
              onClick={handleDownloadTemplate}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.55rem 1rem',
                borderRadius: '8px',
                border: '1px solid #16a34a',
                backgroundColor: '#f0fdf4',
                color: '#16a34a',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              <Download size={16} />
              <span>नमुना डाउनलोड (.xlsx)</span>
            </button>
          </div>

          {/* File Upload Box */}
          <div
            style={{
              padding: '1.5rem',
              border: '2px dashed #94a3b8',
              borderRadius: '12px',
              textAlign: 'center',
              backgroundColor: '#fafaf9',
              cursor: 'pointer',
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".xlsx, .xls, .csv"
              style={{ display: 'none' }}
            />
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: '#e0f2fe',
                color: '#0284c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 0.75rem auto',
              }}
            >
              <Upload size={24} />
            </div>
            <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.95rem' }}>
              {file ? file.name : 'एक्सेल फाइल यहाँ छानेर वा ड्र्याग गरेर अपलोड गर्नुहोस्'}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
              समर्थित ढाँचा: .xlsx, .xls, .csv (अधिकतम १० MB सम्म)
            </div>
          </div>

          {/* Alert Messages */}
          {errorMsg && (
            <div
              style={{
                padding: '0.75rem 1rem',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                color: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.85rem',
              }}
            >
              <AlertCircle size={18} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div
              style={{
                padding: '0.75rem 1rem',
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '8px',
                color: '#16a34a',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.85rem',
              }}
            >
              <CheckCircle2 size={18} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Data Preview Table */}
          {previewRows.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
                  डेटा पूर्वावलोकन (Preview): <strong>{previewRows.length} वटा रेकर्ड तयार</strong>
                </span>
                <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600 }}>
                  ✓ प्रमाणीकरण सफल
                </span>
              </div>

              <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                <div className="dt-responsive-table-wrapper">
<table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                  <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f1f5f9' }}>
                    <tr>
                      <th style={{ padding: '6px 10px', textAlign: 'left', borderBottom: '1px solid #cbd5e1' }}>क्र.सं.</th>
                      <th style={{ padding: '6px 10px', textAlign: 'left', borderBottom: '1px solid #cbd5e1' }}>शीर्षक</th>
                      <th style={{ padding: '6px 10px', textAlign: 'left', borderBottom: '1px solid #cbd5e1' }}>विधा/क्षेत्र</th>
                      <th style={{ padding: '6px 10px', textAlign: 'left', borderBottom: '1px solid #cbd5e1' }}>आ.व.</th>
                      <th style={{ padding: '6px 10px', textAlign: 'left', borderBottom: '1px solid #cbd5e1' }}>शाखा/निकाय</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewRows.map((r, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '6px 10px', color: '#64748b' }}>{idx + 1}</td>
                        <td style={{ padding: '6px 10px', fontWeight: 600, color: '#0f172a' }}>{r.title}</td>
                        <td style={{ padding: '6px 10px', color: '#475569' }}>{r.subCategory || '-'}</td>
                        <td style={{ padding: '6px 10px', color: '#475569' }}>{r.fiscalYear || '-'}</td>
                        <td style={{ padding: '6px 10px', color: '#64748b' }}>{r.authorOrDepartment || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
</div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.75rem',
            backgroundColor: '#ffffff',
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '0.6rem 1.25rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#475569',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer',
            }}
          >
            रद्द गर्नुहोस्
          </button>
          <button
            onClick={handleUploadSubmit}
            disabled={previewRows.length === 0 || isUploading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.6rem 1.4rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: previewRows.length > 0 ? '#16a34a' : '#cbd5e1',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: previewRows.length > 0 && !isUploading ? 'pointer' : 'not-allowed',
            }}
          >
            {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
            <span>{isUploading ? 'अपलोड हुँदैछ...' : `एकमुष्ट सुरक्षित गर्नुहोस् (${previewRows.length})`}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
