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
  School as SchoolIcon,
  Users,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { sectoralApi } from '../../../api/sectoral';

export interface EducationExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'schools' | 'students' | 'teachers';
  onSuccess: () => void;
}

export const EducationExcelImportModal: React.FC<EducationExcelImportModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'schools',
  onSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'schools' | 'students' | 'teachers'>(initialTab);
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

  // ── 1. TEMPLATE DOWNLOAD ─────────────────────────────────────────────────
  const handleDownloadSchoolTemplate = () => {
    const headers = [
      'विद्यालयको नाम (नेपाली)',
      'विद्यालयको नाम (अंग्रेजी)',
      'EMIS कोड',
      'तह (माध्यमिक/आधारभूत/प्राथमिक)',
      'वडा नं.',
      'टोल/गाउँ',
      'प्रधानाध्यापकको नाम',
      'सम्पर्क नम्बर',
      'कुल विद्यार्थी संख्या',
      'छात्रा संख्या',
      'कुल शिक्षक संख्या',
      'कम्प्युटर ल्याब छ? (हो/छैन)',
      'विज्ञान प्रयोगशाला छ? (हो/छैन)',
      'पुस्तकालय छ? (हो/छैन)',
      'GPS अक्षांश (Latitude)',
      'GPS देशान्तर (Longitude)',
    ];

    const sampleRows = [
      [
        'श्री थाङपाल भ्याली माध्यमिक विद्यालय',
        'Shree Thangpal Valley Secondary School',
        '230101001',
        'माध्यमिक (१-१२)',
        6,
        'थाङपालधाप',
        'चन्द्रप्रसाद श्रेष्ठ',
        '9851123456',
        420,
        225,
        22,
        'हो',
        'हो',
        'हो',
        27.9660,
        85.6025,
      ],
      [
        'श्री भोताङ आधारभूत विद्यालय',
        'Shree Bhotang Basic School',
        '230101002',
        'आधारभूत (१-८)',
        3,
        'भोताङ बजार',
        'दावा तामाङ',
        '9841876543',
        185,
        95,
        11,
        'छैन',
        'छैन',
        'हो',
        27.9790,
        85.6130,
      ],
    ];

    const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleRows]);
    ws['!cols'] = headers.map(() => ({ wch: 26 }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Schools');
    XLSX.writeFile(wb, 'Schools_Registry_Template.xlsx');
  };

  const handleDownloadStudentTemplate = () => {
    const headers = [
      'विद्यार्थीको पूरा नाम',
      'विद्यालयको नाम',
      'कक्षा (१ देखि १२)',
      'रोल नम्बर',
      'लिङ्ग (male/female/other)',
      'जन्म मिति (BS)',
      'अभिभावकको नाम',
      'सम्पर्क नम्बर',
      'जाति/वर्ग (दलित/जनजाति/अन्य)',
      'छात्रवृत्ति प्रकार',
    ];

    const sampleRows = [
      [
        'आयुष तामाङ',
        'श्री थाङपाल भ्याली माध्यमिक विद्यालय',
        'कक्षा १०',
        12,
        'male',
        '२०६८/०५/१५',
        'पेम्बा तामाङ',
        '9841000000',
        'जनजाति',
        'जेहेन्दार छात्रवृत्ति',
      ],
      [
        'सुष्मा श्रेष्ठ',
        'श्री थाङपाल भ्याली माध्यमिक विद्यालय',
        'कक्षा १०',
        18,
        'female',
        '२०६८/०८/२१',
        'रामबहादुर श्रेष्ठ',
        '9861000000',
        'अन्य',
        'छात्रा छात्रवृत्ति',
      ],
    ];

    const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleRows]);
    ws['!cols'] = headers.map(() => ({ wch: 24 }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Students');
    XLSX.writeFile(wb, 'Students_Registry_Template.xlsx');
  };

  const handleDownloadTeacherTemplate = () => {
    const headers = [
      'शिक्षकको पूरा नाम',
      'विद्यालयको नाम',
      'पद/तह (मावि/निमावि/प्रावि)',
      'सेवा प्रकार (स्थायी/करार/राहत)',
      'मूल विषय',
      'शैक्षिक योग्यता',
      'सम्पर्क नम्बर',
      'इमेल ठेगाना',
    ];

    const sampleRows = [
      [
        'नवराज पौडेल',
        'श्री थाङपाल भ्याली माध्यमिक विद्यालय',
        'मावि शिक्षक',
        'स्थायी',
        'गणित (Mathematics)',
        'M.Sc. Mathematics',
        '9841112233',
        'navaraj@gmail.com',
      ],
      [
        'सविता सापकोटा',
        'श्री थाङपाल भ्याली माध्यमिक विद्यालय',
        'निमावि शिक्षक',
        'राहत',
        'अंग्रेजी (English)',
        'B.Ed. English',
        '9851223344',
        'sabita@gmail.com',
      ],
    ];

    const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleRows]);
    ws['!cols'] = headers.map(() => ({ wch: 24 }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Teachers');
    XLSX.writeFile(wb, 'Teachers_Registry_Template.xlsx');
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

        if (activeTab === 'schools') {
          const parsed = rawJson.map((row) => {
            const nameNp = String(row['विद्यालयको नाम (नेपाली)'] || row['nameNepali'] || 'विद्यालय');
            const nameEn = String(row['विद्यालयको नाम (अंग्रेजी)'] || row['nameEnglish'] || nameNp);
            const emis = String(row['EMIS कोड'] || row['emisCode'] || 'EMIS-001');
            const level = String(row['तह (माध्यमिक/आधारभूत/प्राथमिक)'] || row['level'] || 'माध्यमिक');
            const ward = Number(row['वडा नं.'] || row['wardNumber'] || 1);
            const tole = String(row['टोल/गाउँ'] || row['location'] || '');
            const prin = String(row['प्रधानाध्यापकको नाम'] || row['principalName'] || '');
            const phone = String(row['सम्पर्क नम्बर'] || row['contactNumber'] || '');
            const totalS = Number(row['कुल विद्यार्थी संख्या'] || row['totalStudents'] || 100);
            const femaleS = Number(row['छात्रा संख्या'] || row['femaleStudents'] || Math.round(totalS * 0.5));
            const totalT = Number(row['कुल शिक्षक संख्या'] || row['totalTeachers'] || 10);

            const hasIct = String(row['कम्प्युटर ल्याब छ? (हो/छैन)'] || '').includes('हो');
            const hasSci = String(row['विज्ञान प्रयोगशाला छ? (हो/छैन)'] || '').includes('हो');
            const hasLib = String(row['पुस्तकालय छ? (हो/छैन)'] || '').includes('हो');
            const latVal = row['GPS अक्षांश (Latitude)'] || row['latitude'] || row['lat'];
            const lngVal = row['GPS देशान्तर (Longitude)'] || row['longitude'] || row['lng'];

            return {
              nameNepali: nameNp,
              nameEnglish: nameEn,
              code: emis,
              emisCode: emis,
              level,
              wardNumber: isNaN(ward) ? 1 : ward,
              location: tole,
              principalName: prin,
              contactNumber: phone,
              totalStudents: totalS,
              femaleStudents: femaleS,
              totalTeachers: totalT,
              latitude: latVal && !isNaN(Number(latVal)) ? Number(latVal) : undefined,
              longitude: lngVal && !isNaN(Number(lngVal)) ? Number(lngVal) : undefined,
              hasIctLab: hasIct,
              hasScienceLab: hasSci,
              hasLibrary: hasLib,
              hasDrinkingWater: true,
              hasElectricity: true,
            };
          });
          setParsedRows(parsed);
        } else if (activeTab === 'students') {
          const parsed = rawJson.map((row) => {
            const name = String(row['विद्यार्थीको पूरा नाम'] || row['fullName'] || 'विद्यार्थी');
            const sName = String(row['विद्यालयको नाम'] || row['schoolName'] || '');
            const grade = String(row['कक्षा (१ देखि १२)'] || row['classGrade'] || 'कक्षा १०');
            const roll = Number(row['रोल नम्बर'] || row['rollNumber'] || 1);
            const gender = String(row['लिङ्ग (male/female/other)'] || row['gender'] || 'male');
            const dob = String(row['जन्म मिति (BS)'] || row['dob'] || '');
            const parent = String(row['अभिभावकको नाम'] || row['parentName'] || '');
            const phone = String(row['सम्पर्क नम्बर'] || row['contactPhone'] || '');
            const caste = String(row['जाति/वर्ग (दलित/जनजाति/अन्य)'] || row['casteCategory'] || 'अन्य');
            const scholarship = String(row['छात्रवृत्ति प्रकार'] || row['scholarshipType'] || '');

            return {
              fullName: name,
              schoolName: sName,
              classGrade: grade,
              rollNumber: isNaN(roll) ? 1 : roll,
              gender,
              dob,
              parentName: parent,
              contactPhone: phone,
              casteCategory: caste,
              scholarshipType: scholarship,
            };
          });
          setParsedRows(parsed);
        } else if (activeTab === 'teachers') {
          const parsed = rawJson.map((row) => {
            const name = String(row['शिक्षकको पूरा नाम'] || row['fullName'] || 'शिक्षक');
            const sName = String(row['विद्यालयको नाम'] || row['schoolName'] || '');
            const desig = String(row['पद/तह (मावि/निमावि/प्रावि)'] || row['designation'] || 'मावि शिक्षक');
            const serv = String(row['सेवा प्रकार (स्थायी/करार/राहत)'] || row['serviceType'] || 'स्थायी');
            const subj = String(row['मूल विषय'] || row['mainSubject'] || row['subject'] || 'सामान्य');
            const qual = String(row['शैक्षिक योग्यता'] || row['qualification'] || 'स्नातकोत्तर');
            const phone = String(row['सम्पर्क नम्बर'] || row['contactNumber'] || '');
            const email = String(row['इमेल ठेगाना'] || row['email'] || '');

            return {
              fullName: name,
              schoolName: sName,
              designation: desig,
              serviceType: serv,
              mainSubject: subj,
              qualification: qual,
              contactNumber: phone,
              email,
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

  // ── 3. BATCH SUBMIT ──────────────────────────────────────────────────────
  const handleBatchSave = async () => {
    if (parsedRows.length === 0) return;

    setIsProcessing(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    let successCount = 0;
    let failCount = 0;

    for (const item of parsedRows) {
      try {
        if (activeTab === 'schools') {
          await sectoralApi.createSchool(item);
        } else if (activeTab === 'students') {
          await sectoralApi.createStudent(item);
        } else if (activeTab === 'teachers') {
          await sectoralApi.createTeacher(item);
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
                शिक्षा प्रणाली Excel / CSV एकमुष्ट डेटा अपलोड
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0 0 0' }}>
                विद्यालय, विद्यार्थी भर्ना तथा शिक्षक विवरण Excel बाट एकमुष्ट प्रविष्टि गर्नुहोस्
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
            gridTemplateColumns: 'repeat(3, 1fr)',
            borderBottom: '1px solid #e2e8f0',
            backgroundColor: '#ffffff',
          }}
        >
          <button
            type="button"
            onClick={() => {
              setActiveTab('schools');
              setParsedRows([]);
              setFileName('');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            style={{
              padding: '0.85rem 1rem',
              border: 'none',
              borderBottom: activeTab === 'schools' ? '3px solid #0F4C81' : '3px solid transparent',
              backgroundColor: activeTab === 'schools' ? '#eff6ff' : 'transparent',
              color: activeTab === 'schools' ? '#0F4C81' : '#64748b',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
            }}
          >
            <SchoolIcon size={18} />
            <span>१. विद्यालय दर्ता (Schools)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('students');
              setParsedRows([]);
              setFileName('');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            style={{
              padding: '0.85rem 1rem',
              border: 'none',
              borderBottom: activeTab === 'students' ? '3px solid #0F4C81' : '3px solid transparent',
              backgroundColor: activeTab === 'students' ? '#eff6ff' : 'transparent',
              color: activeTab === 'students' ? '#0F4C81' : '#64748b',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
            }}
          >
            <GraduationCap size={18} />
            <span>२. विद्यार्थी विवरण (Students)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('teachers');
              setParsedRows([]);
              setFileName('');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            style={{
              padding: '0.85rem 1rem',
              border: 'none',
              borderBottom: activeTab === 'teachers' ? '3px solid #0F4C81' : '3px solid transparent',
              backgroundColor: activeTab === 'teachers' ? '#eff6ff' : 'transparent',
              color: activeTab === 'teachers' ? '#0F4C81' : '#64748b',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
            }}
          >
            <Users size={18} />
            <span>३. शिक्षक विवरण (Teachers)</span>
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
                <Sparkles size={16} color="#0F4C81" />
                <span>चरण १: आधिकारिक Excel नमुना (.xlsx) डाउनलोड गर्नुहोस्</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.25rem 0 0 0' }}>
                {activeTab === 'schools' && 'विद्यालयको नाम, EMIS कोड, वडा, तह, प्रअ तथा भौतिक पूर्वाधारका स्तम्भहरू।'}
                {activeTab === 'students' && 'विद्यार्थीको नाम, कक्षा, रोल नं, लिङ्ग, जन्ममिति र छात्रवृत्तिका स्तम्भहरू।'}
                {activeTab === 'teachers' && 'शिक्षकको नाम, पद, सेवा प्रकार, विषय, योग्यता र सम्पर्कका स्तम्भहरू।'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                if (activeTab === 'schools') handleDownloadSchoolTemplate();
                else if (activeTab === 'students') handleDownloadStudentTemplate();
                else handleDownloadTeacherTemplate();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.6rem 1.25rem',
                borderRadius: '8px',
                border: '1px solid #0F4C81',
                backgroundColor: '#ffffff',
                color: '#0F4C81',
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
                      {activeTab === 'schools' && (
                        <>
                          <th style={{ padding: '8px 10px', borderBottom: '1px solid #cbd5e1' }}>विद्यालयको नाम</th>
                          <th style={{ padding: '8px 10px', borderBottom: '1px solid #cbd5e1' }}>EMIS कोड</th>
                          <th style={{ padding: '8px 10px', borderBottom: '1px solid #cbd5e1' }}>तह / वडा</th>
                          <th style={{ padding: '8px 10px', borderBottom: '1px solid #cbd5e1' }}>प्रअ</th>
                          <th style={{ padding: '8px 10px', borderBottom: '1px solid #cbd5e1' }}>विद्यार्थी</th>
                          <th style={{ padding: '8px 10px', borderBottom: '1px solid #cbd5e1' }}>शिक्षक</th>
                        </>
                      )}
                      {activeTab === 'students' && (
                        <>
                          <th style={{ padding: '8px 10px', borderBottom: '1px solid #cbd5e1' }}>विद्यार्थीको नाम</th>
                          <th style={{ padding: '8px 10px', borderBottom: '1px solid #cbd5e1' }}>विद्यालय</th>
                          <th style={{ padding: '8px 10px', borderBottom: '1px solid #cbd5e1' }}>कक्षा / रोल</th>
                          <th style={{ padding: '8px 10px', borderBottom: '1px solid #cbd5e1' }}>लिङ्ग</th>
                          <th style={{ padding: '8px 10px', borderBottom: '1px solid #cbd5e1' }}>अभिभावक</th>
                        </>
                      )}
                      {activeTab === 'teachers' && (
                        <>
                          <th style={{ padding: '8px 10px', borderBottom: '1px solid #cbd5e1' }}>शिक्षकको नाम</th>
                          <th style={{ padding: '8px 10px', borderBottom: '1px solid #cbd5e1' }}>विद्यालय</th>
                          <th style={{ padding: '8px 10px', borderBottom: '1px solid #cbd5e1' }}>पद / सेवा</th>
                          <th style={{ padding: '8px 10px', borderBottom: '1px solid #cbd5e1' }}>मूल विषय</th>
                          <th style={{ padding: '8px 10px', borderBottom: '1px solid #cbd5e1' }}>सम्पर्क</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {parsedRows.map((row, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '8px 10px', color: '#64748b' }}>{idx + 1}</td>
                        {activeTab === 'schools' && (
                          <>
                            <td style={{ padding: '8px 10px', fontWeight: 700 }}>{row.nameNepali}</td>
                            <td style={{ padding: '8px 10px', fontFamily: 'monospace' }}>{row.emisCode}</td>
                            <td style={{ padding: '8px 10px' }}>{row.level} (वडा {row.wardNumber})</td>
                            <td style={{ padding: '8px 10px' }}>{row.principalName}</td>
                            <td style={{ padding: '8px 10px', fontWeight: 700, color: '#0369a1' }}>{row.totalStudents}</td>
                            <td style={{ padding: '8px 10px' }}>{row.totalTeachers}</td>
                          </>
                        )}
                        {activeTab === 'students' && (
                          <>
                            <td style={{ padding: '8px 10px', fontWeight: 700 }}>{row.fullName}</td>
                            <td style={{ padding: '8px 10px' }}>{row.schoolName}</td>
                            <td style={{ padding: '8px 10px' }}>{row.classGrade} (रोल {row.rollNumber})</td>
                            <td style={{ padding: '8px 10px' }}>{row.gender}</td>
                            <td style={{ padding: '8px 10px' }}>{row.parentName}</td>
                          </>
                        )}
                        {activeTab === 'teachers' && (
                          <>
                            <td style={{ padding: '8px 10px', fontWeight: 700 }}>{row.fullName}</td>
                            <td style={{ padding: '8px 10px' }}>{row.schoolName}</td>
                            <td style={{ padding: '8px 10px' }}>{row.designation} ({row.serviceType})</td>
                            <td style={{ padding: '8px 10px', color: '#0369a1' }}>{row.mainSubject}</td>
                            <td style={{ padding: '8px 10px' }}>{row.contactNumber}</td>
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
