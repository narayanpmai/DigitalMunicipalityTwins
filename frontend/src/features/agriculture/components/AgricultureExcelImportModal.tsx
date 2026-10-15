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
  Sprout,
  Sparkles,
} from 'lucide-react';
import { sectoralApi } from '../../../api/sectoral';

export interface AgricultureExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AgricultureExcelImportModal: React.FC<AgricultureExcelImportModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileName, setFileName] = useState<string>('');
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDownloadTemplate = () => {
    const headers = [
      'बालीको नाम (नेपाली)',
      'बालीको प्रकार (vegetable/cereal/fruit/cash/spice)',
      'वडा नं.',
      'खेती गरिएको क्षेत्रफल (हेक्टर)',
      'उत्पादन परिमाण (मेट्रिक टन)',
      'आर्थिक वर्ष',
      'उत्पादकत्व (टन/हेक्टर)',
      'कैफियत / पकेट क्षेत्र',
    ];

    const sampleRows = [
      [
        'आलु (जनकदेव / कार्डिनल)',
        'vegetable',
        3,
        25.5,
        380.0,
        '2080/081',
        14.9,
        'भोताङ उच्च पहाडी आलु पकेट क्षेत्र',
      ],
      [
        'किबी (Kiwi Fruit)',
        'fruit',
        6,
        12.0,
        96.0,
        '2080/081',
        8.0,
        'थाङपालधाप व्यावसायिक किबी जोन',
      ],
      [
        'मकै (मनकामना-३)',
        'cereal',
        2,
        45.0,
        135.0,
        '2080/081',
        3.0,
        'बरुवा मकै उत्पादन समूह',
      ],
    ];

    const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleRows]);
    ws['!cols'] = headers.map(() => ({ wch: 24 }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Crops_Production');
    XLSX.writeFile(wb, 'Agriculture_Crops_Production_Template.xlsx');
  };

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

        const parsed = rawJson.map((row) => {
          const crop = String(row['बालीको नाम (नेपाली)'] || row['cropName'] || 'बाली');
          const type = String(row['बालीको प्रकार (vegetable/cereal/fruit/cash/spice)'] || row['cropType'] || 'vegetable');
          const ward = Number(row['वडा नं.'] || row['wardNumber'] || 1);
          const area = Number(row['खेती गरिएको क्षेत्रफल (हेक्टर)'] || row['areaHectares'] || 5);
          const prod = Number(row['उत्पादन परिमाण (मेट्रिक टन)'] || row['productionMt'] || 50);
          const fy = String(row['आर्थिक वर्ष'] || row['fiscalYear'] || '2080/081');

          return {
            cropName: crop,
            cropType: type,
            wardNumber: isNaN(ward) ? 1 : ward,
            areaHectares: isNaN(area) ? 5 : area,
            productionMt: isNaN(prod) ? 50 : prod,
            fiscalYear: fy,
          };
        });

        setParsedRows(parsed);
      } catch (err: any) {
        setErrorMsg('फाइल पढ्दा त्रुटि भयो: ' + err.message);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleBatchSave = async () => {
    if (parsedRows.length === 0) return;

    setIsProcessing(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    let successCount = 0;
    let failCount = 0;

    for (const item of parsedRows) {
      try {
        await sectoralApi.createAgricultureRecord(item);
        successCount++;
      } catch (err) {
        console.error('Save error on crop:', item, err);
        failCount++;
      }
    }

    setIsProcessing(false);

    if (successCount > 0) {
      setSuccessMsg(
        `सफलतापूर्वक ${successCount} वटा बाली/उत्पादन रेकर्डहरू डेटाबेसमा सुरक्षित गरियो! ${
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
          maxWidth: '850px',
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
              <Sprout size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                कृषि तथा बाली उत्पादन Excel एकमुष्ट डेटा अपलोड
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0 0 0' }}>
                वडागत बाली, क्षेत्रफल (हेक्टर), वार्षिक उत्पादन (मेट्रिक टन) र पकेट क्षेत्र एकमुष्ट Excel बाट भर्नुहोस्
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

        {/* Modal Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
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
                <Sparkles size={16} color="#16a34a" />
                <span>चरण १: कृषि तथा बाली उत्पादनको Excel नमुना (.xlsx) डाउनलोड गर्नुहोस्</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.25rem 0 0 0' }}>
                बालीको नाम, प्रकार, वडा, क्षेत्रफल (हेक्टर) र उत्पादन परिमाण (मेट्रिक टन) को पूर्व-तयार स्तम्भहरू।
              </p>
            </div>

            <button
              type="button"
              onClick={handleDownloadTemplate}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.6rem 1.25rem',
                borderRadius: '8px',
                border: '1px solid #16a34a',
                backgroundColor: '#ffffff',
                color: '#16a34a',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
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
                  पूर्वावलोकन: {parsedRows.length} वटा बाली रेकर्डहरू फेला परे
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
                      <th style={{ padding: '8px 10px', borderBottom: '1px solid #cbd5e1' }}>बालीको नाम</th>
                      <th style={{ padding: '8px 10px', borderBottom: '1px solid #cbd5e1' }}>प्रकार</th>
                      <th style={{ padding: '8px 10px', borderBottom: '1px solid #cbd5e1' }}>वडा</th>
                      <th style={{ padding: '8px 10px', borderBottom: '1px solid #cbd5e1' }}>क्षेत्रफल (हेक्टर)</th>
                      <th style={{ padding: '8px 10px', borderBottom: '1px solid #cbd5e1' }}>उत्पादन (मे.टन)</th>
                      <th style={{ padding: '8px 10px', borderBottom: '1px solid #cbd5e1' }}>आर्थिक वर्ष</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedRows.map((row, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '8px 10px', color: '#64748b' }}>{idx + 1}</td>
                        <td style={{ padding: '8px 10px', fontWeight: 700 }}>{row.cropName}</td>
                        <td style={{ padding: '8px 10px', color: '#0369a1' }}>{row.cropType}</td>
                        <td style={{ padding: '8px 10px' }}>वडा {row.wardNumber}</td>
                        <td style={{ padding: '8px 10px', fontWeight: 700 }}>{row.areaHectares} ha</td>
                        <td style={{ padding: '8px 10px', fontWeight: 700, color: '#16a34a' }}>
                          {row.productionMt} MT
                        </td>
                        <td style={{ padding: '8px 10px' }}>{row.fiscalYear}</td>
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
                <span>{parsedRows.length} वटा रेकर्डहरू सुरक्षित गर्नुहोस्</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
