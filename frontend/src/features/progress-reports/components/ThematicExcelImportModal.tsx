import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  X,
  Layers,
  Check,
  RefreshCw,
  FileText,
  Table,
} from 'lucide-react';
import { THEMATIC_MODULE_SCHEMAS, type ThematicModuleDef } from '../thematicModuleSchemas';
import { reportsApi, type ThematicRecordItem } from '../../../api/reports';

interface ThematicExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialModuleKey?: number;
  initialWard?: number;
  onImportSuccess: (count: number) => void;
}

export const ThematicExcelImportModal: React.FC<ThematicExcelImportModalProps> = ({
  isOpen,
  onClose,
  initialModuleKey = 1,
  initialWard = 0,
  onImportSuccess,
}) => {
  const [selectedModuleKey, setSelectedModuleKey] = useState<number>(initialModuleKey || 1);
  const [selectedWard, setSelectedWard] = useState<number>(initialWard || 1);
  const [fiscalYear, setFiscalYear] = useState<string>('२०८०/०८१');
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [parsedRecords, setParsedRecords] = useState<Partial<ThematicRecordItem>[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const currentModule: ThematicModuleDef =
    THEMATIC_MODULE_SCHEMAS.find((m) => m.key === selectedModuleKey) || THEMATIC_MODULE_SCHEMAS[0];

  // ── 1. GENERATE & DOWNLOAD EXCEL TEMPLATE ─────────────────────────────────
  const handleDownloadTemplate = () => {
    // Standard Base Headers
    const baseHeaders = [
      'योजना/सम्पत्तिको नाम [assetName] *',
      'टोल वा बस्ती [toleBasti]',
      'वडा नं [wardNumber] (१-८) *',
      'कुल लागत रु [constructionCost]',
      'कुल खर्च रु [expenditureAmount]',
      'भौतिक प्रगति % [physicalProgressPercent]',
      'लाभान्वित घरधुरी [beneficiaryHouseholds]',
      'लाभान्वित जनसंख्या [beneficiaryPopulation]',
      'अवस्था [condition] (excellent/good/fair/needs_repair)',
      'जिम्मेवार निकाय वा उपभोक्ता समिति [responsibleAgency]',
    ];

    // Thematic Custom Fields Headers
    const customHeaders = currentModule.fields.map((f) => `${f.label} [${f.id}]`);
    const allHeaders = [...baseHeaders, ...customHeaders];

    // Sample Row 1
    const sampleRow1: any[] = [
      `${currentModule.title.split('(')[0].trim()} नमुना योजना १`,
      'थाङपाल टोल',
      selectedWard > 0 ? selectedWard : 1,
      1500000,
      1420000,
      95,
      120,
      580,
      'good',
      'उपभोक्ता समिति / गाउँपालिका',
    ];
    currentModule.fields.forEach((f) => {
      if (f.defaultValue !== undefined) {
        sampleRow1.push(f.defaultValue);
      } else if (f.type === 'number') {
        sampleRow1.push(10);
      } else if (f.options && f.options.length > 0) {
        sampleRow1.push(f.options[0].value);
      } else {
        sampleRow1.push(`${f.label} विवरण`);
      }
    });

    // Sample Row 2
    const sampleRow2: any[] = [
      `${currentModule.title.split('(')[0].trim()} नमुना योजना २`,
      'गुन्सा बस्ती',
      selectedWard > 0 ? selectedWard : 2,
      2800000,
      2750000,
      100,
      240,
      1120,
      'excellent',
      'गाउँपालिका योजना शाखा',
    ];
    currentModule.fields.forEach((f) => {
      if (f.defaultValue !== undefined) {
        sampleRow2.push(f.defaultValue);
      } else if (f.type === 'number') {
        sampleRow2.push(25);
      } else if (f.options && f.options.length > 1) {
        sampleRow2.push(f.options[1].value);
      } else {
        sampleRow2.push(`${f.label} विवरण २`);
      }
    });

    const worksheet = XLSX.utils.aoa_to_sheet([allHeaders, sampleRow1, sampleRow2]);

    // Auto-fit column widths
    worksheet['!cols'] = allHeaders.map((h) => ({ wch: Math.max(h.length + 4, 18) }));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'फाराम_डेटा');

    const cleanTitle = currentModule.title.replace(/[\/\(\)\s]+/g, '_').substring(0, 25);
    XLSX.writeFile(workbook, `P5_Module_${currentModule.key}_${cleanTitle}_Template.xlsx`);
  };

  // ── 2. HANDLE FILE UPLOAD & PARSING ───────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStatusMessage(null);
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setFileName(selectedFile.name);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const buffer = evt.target?.result;
        const wb = XLSX.read(buffer, { type: 'array' });
        const firstSheetName = wb.SheetNames[0];
        const worksheet = wb.Sheets[firstSheetName];
        const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (!rawJson || rawJson.length === 0) {
          setStatusMessage({ type: 'error', text: 'छनोट गरिएको फाइलमा कुनै डाटा भेटिएन।' });
          return;
        }

        // Map columns to standard ThematicRecordItem structure
        const records: Partial<ThematicRecordItem>[] = rawJson.map((row: any, idx: number) => {
          const getValue = (patterns: string[]): any => {
            const keys = Object.keys(row);
            for (const p of patterns) {
              const matchedKey = keys.find(
                (k) =>
                  k.toLowerCase().includes(p.toLowerCase()) ||
                  k.toLowerCase().includes(`[${p.toLowerCase()}]`)
              );
              if (matchedKey !== undefined && row[matchedKey] !== '') {
                return row[matchedKey];
              }
            }
            return undefined;
          };

          const assetName =
            getValue(['assetName', 'योजना/सम्पत्तिको नाम', 'योजना', 'नाम', 'सम्पत्ति']) ||
            `${currentModule.title.split('(')[0].trim()} रेकर्ड ${idx + 1}`;

          const toleBasti = getValue(['toleBasti', 'टोल', 'बस्ती']) || '';
          const wardNum = Number(getValue(['wardNumber', 'वडा नं', 'वडा'])) || (selectedWard > 0 ? selectedWard : 1);
          const constructionCost = Number(getValue(['constructionCost', 'लागत', 'बजेट'])) || 0;
          const expenditureAmount = Number(getValue(['expenditureAmount', 'खर्च'])) || 0;
          const physicalProgressPercent = Number(getValue(['physicalProgressPercent', 'प्रगति'])) || 100;
          const beneficiaryHouseholds = Number(getValue(['beneficiaryHouseholds', 'घरधुरी'])) || 0;
          const beneficiaryPopulation = Number(getValue(['beneficiaryPopulation', 'जनसंख्या', 'लाभग्राही'])) || 0;
          const condition = getValue(['condition', 'अवस्था']) || 'good';
          const responsibleAgency = getValue(['responsibleAgency', 'जिम्मेवार', 'निकाय']) || 'पाँचपोखरी थाङपाल गाउँपालिका';

          const thematicData: Record<string, any> = {};
          currentModule.fields.forEach((f) => {
            const val = getValue([f.id, f.label]);
            if (val !== undefined) {
              thematicData[f.id] = f.type === 'number' ? Number(val) : val;
            } else if (f.defaultValue !== undefined) {
              thematicData[f.id] = f.defaultValue;
            }
          });

          return {
            moduleKey: selectedModuleKey,
            moduleTitleNepali: currentModule.title,
            fiscalYear: fiscalYear,
            periodType: 'annual',
            assetName,
            toleBasti,
            wardNumber: wardNum,
            constructionCost,
            expenditureAmount,
            physicalProgressPercent,
            beneficiaryHouseholds,
            beneficiaryPopulation,
            condition: condition as any,
            responsibleAgency,
            geomType: 'Point',
            thematicData,
          };
        });

        setParsedRecords(records);
        setStatusMessage({
          type: 'success',
          text: `Excel फाइल सफलतापूर्वक पढियो! कुल ${records.length} वटा रेकर्डहरू फेला परे। तल समीक्षा गर्नुहोस् र सुरक्षित गर्नुहोस्।`,
        });
      } catch (err: any) {
        console.error('Excel parse error:', err);
        setStatusMessage({ type: 'error', text: 'Excel फाइल पढ्न सकिएन: ' + (err.message || 'अमान्य फाइल संरचना') });
      }
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  // ── 3. SAVE PARSED RECORDS TO BACKEND ─────────────────────────────────────
  const handleSaveToDatabase = async () => {
    if (parsedRecords.length === 0) return;
    setIsProcessing(true);
    setStatusMessage(null);

    let successCount = 0;
    let failCount = 0;

    for (const rec of parsedRecords) {
      try {
        await reportsApi.createThematicRecord(rec);
        successCount++;
      } catch (e) {
        console.error('Failed to create record:', rec, e);
        failCount++;
      }
    }

    setIsProcessing(false);

    if (successCount > 0) {
      onImportSuccess(successCount);
      setStatusMessage({
        type: 'success',
        text: `सफल! ${successCount} वटा रेकर्डहरू डेटाबेसमा सफलतापूर्वक थपिए।${failCount > 0 ? ` (${failCount} वटा असफल)` : ''}`,
      });
      setTimeout(() => {
        onClose();
      }, 1400);
    } else {
      setStatusMessage({
        type: 'error',
        text: 'डेटाबेसमा रेकर्डहरू सेभ गर्न सकिएन। कृपया नेटवर्क वा लगइन प्रमाणीकरण जाँच गर्नुहोस्।',
      });
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 1100,
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
          maxWidth: '920px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            backgroundColor: '#0F4C81',
            color: '#ffffff',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                padding: '0.5rem',
                borderRadius: '10px',
                display: 'flex',
              }}
            >
              <FileSpreadsheet size={24} color="#FCD34D" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>
                Excel फाइलबाट बल्क डेटा अपलोड (Bulk Excel / CSV Import)
              </h2>
              <p style={{ fontSize: '0.8rem', margin: '0.2rem 0 0', opacity: 0.85 }}>
                ३३ वटा विषयगत क्षेत्रका रेकर्डहरू Excel ढाँचामा एकैपटक प्रणालीमा प्रविष्टि गर्नुहोस्
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              padding: '0.4rem',
              borderRadius: '8px',
              display: 'flex',
            }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Step 1: Select Thematic Subject and Ward */}
          <div
            style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '1rem 1.25rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1rem',
            }}
          >
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#0F4C81', marginBottom: '0.35rem' }}>
                १. विषयगत क्षेत्र (३३ मोड्युलहरू मध्ये छान्नुहोस्) *
              </label>
              <select
                value={selectedModuleKey}
                onChange={(e) => {
                  setSelectedModuleKey(Number(e.target.value));
                  setParsedRecords([]);
                  setFile(null);
                  setStatusMessage(null);
                }}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.75rem',
                  borderRadius: '8px',
                  border: '1.5px solid #0F4C81',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  backgroundColor: '#ffffff',
                  color: '#0F4C81',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                {THEMATIC_MODULE_SCHEMAS.map((m) => (
                  <option key={m.key} value={m.key}>
                    {m.key}. {m.title} ({m.category})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                २. वडा छनोट (Default Ward)
              </label>
              <select
                value={selectedWard}
                onChange={(e) => setSelectedWard(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  backgroundColor: '#ffffff',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value={0}>समग्र गाउँपालिका (All Wards)</option>
                <option value={1}>वडा नं. १ (बाँसखर्क)</option>
                <option value={2}>वडा नं. २ (बरुवा)</option>
                <option value={3}>वडा नं. ३ (भोताङ)</option>
                <option value={4}>वडा नं. ४ (थाङपालकोट)</option>
                <option value={5}>वडा नं. ५ (गुन्सा)</option>
                <option value={6}>वडा नं. ६ (थाङपालधाप)</option>
                <option value={7}>वडा नं. ७ (भोटेनाम्लाङ)</option>
                <option value={8}>वडा नं. ८ (लागर्चे)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                ३. आर्थिक वर्ष (Fiscal Year)
              </label>
              <select
                value={fiscalYear}
                onChange={(e) => setFiscalYear(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  backgroundColor: '#ffffff',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="२०८०/०८१">२०८०/०८१</option>
                <option value="२०८१/०८२">२०८१/०८२</option>
                <option value="२०७९/०८०">२०७९/०८०</option>
                <option value="२०७८/०७९">२०७८/०७९</option>
              </select>
            </div>
          </div>

          {/* Step 2: Download Template & Upload Area */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '1rem',
            }}
          >
            {/* Download Template Box */}
            <div
              style={{
                border: '1px dashed #0284c7',
                backgroundColor: '#f0f9ff',
                borderRadius: '12px',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0284c7', fontWeight: 800, fontSize: '0.95rem' }}>
                  <Download size={18} />
                  <span>चरण क: आधिकारिक Excel नमुना डाउनलोड गर्नुहोस्</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#0369a1', marginTop: '0.4rem', lineHeight: 1.4 }}>
                  छानिएको <strong>"{currentModule.title}"</strong> को लागि आवश्यक सम्पूर्ण फिल्डहरू, सूचकहरू तथा नमुना डाटा सहितको खाली Excel फाइल प्राप्त गर्नुहोस्।
                </p>
              </div>
              <button
                onClick={handleDownloadTemplate}
                style={{
                  marginTop: '1rem',
                  backgroundColor: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.6rem 1rem',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 2px 6px rgba(2, 132, 199, 0.25)',
                }}
              >
                <Download size={16} />
                <span>Excel नमुना (.xlsx) डाउनलोड गर्नुहोस्</span>
              </button>
            </div>

            {/* Upload File Box */}
            <div
              style={{
                border: '2px dashed #10b981',
                backgroundColor: '#f0fdf4',
                borderRadius: '12px',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                cursor: 'pointer',
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  backgroundColor: '#dcfce7',
                  color: '#16a34a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '0.5rem',
                }}
              >
                <Upload size={22} />
              </div>
              <div style={{ fontWeight: 800, color: '#166534', fontSize: '0.95rem' }}>
                चरण ख: भरिएको Excel / CSV फाइल छान्नुहोस्
              </div>
              <div style={{ fontSize: '0.8rem', color: '#15803d', marginTop: '0.25rem' }}>
                {fileName ? (
                  <span style={{ fontWeight: 800, color: '#047857' }}>✓ फाइल: {fileName}</span>
                ) : (
                  'यहाँ क्लिक गरी कम्प्युटरबाट .xlsx वा .csv फाइल लोड गर्नुहोस्'
                )}
              </div>
            </div>
          </div>

          {/* Feedback Status Alert */}
          {statusMessage && (
            <div
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                backgroundColor: statusMessage.type === 'success' ? '#ecfdf5' : '#fef2f2',
                color: statusMessage.type === 'success' ? '#065f46' : '#991b1b',
                border: `1px solid ${statusMessage.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
              }}
            >
              {statusMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Step 3: Parsed Data Live Preview Table */}
          {parsedRecords.length > 0 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#1e293b' }}>
                  📊 अपलोड पूर्व समीक्षा (Preview: पहिलो ५ रेकर्डहरू)
                </span>
                <span style={{ fontSize: '0.8rem', backgroundColor: '#e2e8f0', padding: '0.2rem 0.6rem', borderRadius: '12px', fontWeight: 700 }}>
                  कुल {parsedRecords.length} रेकर्डहरू
                </span>
              </div>
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflowX: 'auto', maxHeight: '200px' }}>
                <div className="dt-responsive-table-wrapper">
<table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #cbd5e1', textAlign: 'left', color: '#475569' }}>
                      <th style={{ padding: '0.5rem 0.75rem' }}>#</th>
                      <th style={{ padding: '0.5rem 0.75rem' }}>योजना/सम्पत्ति</th>
                      <th style={{ padding: '0.5rem 0.75rem' }}>वडा</th>
                      <th style={{ padding: '0.5rem 0.75rem' }}>टोल</th>
                      <th style={{ padding: '0.5rem 0.75rem' }}>लागत रु</th>
                      <th style={{ padding: '0.5rem 0.75rem' }}>प्रगति %</th>
                      <th style={{ padding: '0.5rem 0.75rem' }}>अवस्था</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedRecords.slice(0, 5).map((r, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '0.45rem 0.75rem', fontWeight: 700 }}>{i + 1}</td>
                        <td style={{ padding: '0.45rem 0.75rem', fontWeight: 600, color: '#0F4C81' }}>{r.assetName}</td>
                        <td style={{ padding: '0.45rem 0.75rem' }}>वडा {r.wardNumber}</td>
                        <td style={{ padding: '0.45rem 0.75rem' }}>{r.toleBasti || '—'}</td>
                        <td style={{ padding: '0.45rem 0.75rem' }}>{r.constructionCost?.toLocaleString('ne-NP') || 0}</td>
                        <td style={{ padding: '0.45rem 0.75rem', color: '#16a34a', fontWeight: 700 }}>{r.physicalProgressPercent}%</td>
                        <td style={{ padding: '0.45rem 0.75rem' }}>{r.condition}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
</div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid #e2e8f0',
            backgroundColor: '#f8fafc',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
            * ३३ वटै विषयगत क्षेत्रका लागि नमुना डाउनलोड तथा प्रविष्टि मान्य छ
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={onClose}
              disabled={isProcessing}
              style={{
                padding: '0.55rem 1.25rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#475569',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              बन्द गर्नुहोस् (Cancel)
            </button>

            <button
              onClick={handleSaveToDatabase}
              disabled={parsedRecords.length === 0 || isProcessing}
              style={{
                padding: '0.55rem 1.5rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: parsedRecords.length > 0 ? '#10b981' : '#94a3b8',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.85rem',
                cursor: parsedRecords.length > 0 && !isProcessing ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: parsedRecords.length > 0 ? '0 4px 12px rgba(16, 185, 129, 0.3)' : 'none',
                transition: 'all 0.2s',
              }}
            >
              {isProcessing ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>प्रणालीमा सुरक्षित हुँदैछ...</span>
                </>
              ) : (
                <>
                  <Check size={16} />
                  <span>{parsedRecords.length > 0 ? `डेटाबेसमा सुरक्षित गर्नुहोस् (${parsedRecords.length} रेकर्डहरू)` : 'फाइल लोड गर्नुहोस्'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThematicExcelImportModal;
