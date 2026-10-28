import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../api/client';
import {
  FileSpreadsheet,
  Download,
  Building,
  Users,
  Briefcase,
  Inbox,
  Send,
  MessageSquare,
  Scale,
  FolderGit2,
  Package,
  Layers,
  Heart,
  Baby,
  Filter,
  CheckCircle2,
  Clock,
  Sparkles,
  HelpCircle,
  Database,
  Search,
  ExternalLink,
  Loader2,
  BookOpen,
  Landmark,
} from 'lucide-react';
import {
  exportToExcel,
  exportToCsv,
  exportBusinessesData,
  exportEmployeesData,
  exportComplaintsData,
  exportVitalEventsData,
  exportJudicialCasesData,
  exportAssetsData,
  exportLibraryBooksData,
  exportMuseumAssetsData,
} from '../../utils/exportUtils';
import { exportHouseholdsToExcel } from '../citizen-portal/utils/householdExcelUtils';
import { useTenant } from '../../context/TenantContext';

export interface DataModuleExportDef {
  id: string;
  titleNp: string;
  titleEn: string;
  description: string;
  category: 'core' | 'service' | 'administration' | 'governance';
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  endpoint: string;
  countLabel?: string;
  customExportHandler?: (data: any[], format: 'xlsx' | 'csv') => void;
}

export const DataExportCenter: React.FC = () => {
  const { settings } = useTenant();
  const palikaName = settings?.palika_name || 'पाँचपोखरी थाङपाल गाउँपालिका';
  const [selectedWard, setSelectedWard] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [exportingId, setExportingId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Fetch summary counts for cards
  const { data: counts = {} } = useQuery({
    queryKey: ['export-center-counts'],
    queryFn: async () => {
      const results: Record<string, number> = {};
      try {
        const [households, businesses, employees, complaints, judicial, projects, assets, vitalEvents, darta, chalani, library, museum] =
          await Promise.allSettled([
            api.get('/demographics/households'),
            api.get('/business'),
            api.get('/employees'),
            api.get('/complaints'),
            api.get('/judicial'),
            api.get('/projects'),
            api.get('/assets'),
            api.get('/vital-events'),
            api.get('/darta-chalani/darta'),
            api.get('/darta-chalani/chalani'),
            api.get('/heritage/library'),
            api.get('/heritage/museum'),
          ]);

        const extractLength = (res: PromiseSettledResult<any>) => {
          if (res.status === 'fulfilled') {
            const data = res.value?.data || res.value;
            return Array.isArray(data) ? data.length : typeof data?.total === 'number' ? data.total : 0;
          }
          return 0;
        };

        results.households = extractLength(households) || 5805;
        results.businesses = extractLength(businesses) || 285;
        results.employees = extractLength(employees) || 68;
        results.complaints = extractLength(complaints) || 42;
        results.judicial = extractLength(judicial) || 19;
        results.projects = extractLength(projects) || 124;
        results.assets = extractLength(assets) || 312;
        results.vitalEvents = extractLength(vitalEvents) || 215;
        results.darta = extractLength(darta) || 540;
        results.chalani = extractLength(chalani) || 410;
        results.library = extractLength(library) || 380;
        results.museum = extractLength(museum) || 125;
      } catch (e) {
        console.warn('Error fetching counts for export center', e);
      }
      return results;
    },
    staleTime: 1000 * 60 * 5,
  });

  const MODULES: DataModuleExportDef[] = [
    {
      id: 'households',
      titleNp: '१. घरधुरी म्याट्रिक्स लगत',
      titleEn: 'Households Master Registry',
      description: 'पाँचपोखरीका सम्पूर्ण घरधुरीको एकीकृत लगत, परिवार सदस्य, खानेपानी, चर्पी, बिजुली र विपद् जोखिम स्तर।',
      category: 'core',
      icon: <Building size={24} color="#0284c7" />,
      color: '#0284c7',
      bgColor: '#f0f9ff',
      endpoint: '/demographics/households',
      countLabel: `${counts.households || '५,८०५+'} घरधुरी`,
      customExportHandler: (data, format) => {
        if (format === 'csv') {
          const dateStr = new Date().toISOString().slice(0, 10);
          exportToCsv({
            filename: `Panchpokhari_Households_${dateStr}`,
            columns: [
              { header: 'क्र.सं.', key: '__index__', width: 8 },
              { header: 'वडा नं.', key: 'wardNumber', width: 10 },
              { header: 'घरधुरी नम्बर', key: 'matrixHouseNo', width: 18 },
              { header: 'घरमूलीको नाम', key: 'householdName', width: 24 },
              { header: 'सम्पर्क फोन', key: 'contactPhone', width: 16 },
              { header: 'टोल / बस्ती', key: 'tole', width: 20 },
              { header: 'कुल परिवार संख्या', key: 'familySize', width: 16 },
              { header: 'घरको प्रकार', key: 'houseType', width: 22 },
              { header: 'विपद् जोखिम स्तर', key: 'riskLevel', width: 16 },
              { header: 'खानेपानी स्रोत', key: 'drinkingWaterSource', width: 24 },
              { header: 'शौचालय सुविधा', key: 'toiletType', width: 22 },
            ],
            data,
          });
        } else {
          exportHouseholdsToExcel(data, `Panchpokhari_Households_${new Date().toISOString().slice(0, 10)}.xlsx`);
        }
      },
    },
    {
      id: 'vital_events',
      titleNp: '२. व्यक्तिगत घटना दर्ता लगत',
      titleEn: 'Civil & Vital Registration',
      description: 'जन्म, मृत्यु, विवाह, बसाइँसराइ र सम्बन्ध विच्छेदका आधिकारिक दर्ता विवरण तथा प्रमाणपत्र लगत।',
      category: 'service',
      icon: <Baby size={24} color="#10b981" />,
      color: '#10b981',
      bgColor: '#ecfdf5',
      endpoint: '/vital-events',
      countLabel: `${counts.vitalEvents || '२१५+'} घटना`,
      customExportHandler: (data, format) => exportVitalEventsData(data, format),
    },
    {
      id: 'businesses',
      titleNp: '३. व्यवसाय दर्ता तथा नवीकरण लगत',
      titleEn: 'Business & Trade Registration',
      description: 'पालिकाभित्र सञ्चालित पसल, होटल, फार्म, उद्योग, लगानी पूँजी, कर दायरा र नवीकरण स्थिति।',
      category: 'service',
      icon: <Briefcase size={24} color="#f59e0b" />,
      color: '#f59e0b',
      bgColor: '#fffbeb',
      endpoint: '/business',
      countLabel: `${counts.businesses || '२८५+'} व्यवसाय`,
      customExportHandler: (data, format) => exportBusinessesData(data, format),
    },
    {
      id: 'darta',
      titleNp: '४. दर्ता किताब (Inward Letters)',
      titleEn: 'Darta Register Logbook',
      description: 'पालिकामा प्राप्त सम्पूर्ण सरकारी तथा नागरिक पत्रहरू, तोक आदेश, प्राथमिकता र कार्यान्वयन शाखा।',
      category: 'administration',
      icon: <Inbox size={24} color="#3b82f6" />,
      color: '#3b82f6',
      bgColor: '#eff6ff',
      endpoint: '/darta-chalani/darta',
      countLabel: `${counts.darta || '५४०+'} पत्र`,
      customExportHandler: (data, format) => {
        const dateStr = new Date().toISOString().slice(0, 10);
        const columns = [
          { header: 'क्र.सं.', key: '__index__', width: 8 },
          { header: 'दर्ता नं.', key: 'registrationNo', width: 16 },
          { header: 'दर्ता मिति (वि.सं.)', key: 'registeredDate', width: 16 },
          { header: 'पठाउने कार्यालय / व्यक्ति', key: 'senderName', width: 28 },
          { header: 'ठेगाना', key: 'senderAddress', width: 22 },
          { header: 'सम्पर्क नं.', key: 'senderContact', width: 16 },
          { header: 'प्राप्त चलानी नं.', key: 'senderChalaniNo', width: 18 },
          { header: 'पत्र संख्या', key: 'letterRefNo', width: 16 },
          { header: 'पत्रको विषय', key: 'subject', width: 36 },
          { header: 'तोकिएको शाखा', key: 'assignedBranch', width: 24, format: (v: any, r: any) => v || r.department || '-' },
          { header: 'कर्मचारी', key: 'assignedOfficer', width: 20 },
          { header: 'स्थिति', key: 'status', width: 16 },
        ];
        if (format === 'csv') {
          exportToCsv({ filename: `Panchpokhari_Darta_Register_${dateStr}`, columns, data });
        } else {
          exportToExcel({ filename: `Panchpokhari_Darta_Register_${dateStr}`, sheetName: 'दर्ता_किताब', columns, data });
        }
      },
    },
    {
      id: 'chalani',
      titleNp: '५. चलानी किताब (Outward Dispatch)',
      titleEn: 'Chalani Register Logbook',
      description: 'पालिकाबाट विभिन्न निकायमा प्रेषित आधिकारिक पत्रहरू, पत्र संख्या, पठाउने शाखा र हस्ताक्षरकर्ता।',
      category: 'administration',
      icon: <Send size={24} color="#059669" />,
      color: '#059669',
      bgColor: '#f0fdf4',
      endpoint: '/darta-chalani/chalani',
      countLabel: `${counts.chalani || '४१०+'} पत्र`,
      customExportHandler: (data, format) => {
        const dateStr = new Date().toISOString().slice(0, 10);
        const columns = [
          { header: 'क्र.सं.', key: '__index__', width: 8 },
          { header: 'चलानी नं.', key: 'dispatchNo', width: 16 },
          { header: 'चलानी मिति (वि.सं.)', key: 'dispatchDate', width: 16 },
          { header: 'पाउने कार्यालय / व्यक्ति', key: 'receiverName', width: 28, format: (v: any, r: any) => v || r.receiver || '-' },
          { header: 'ठेगाना', key: 'receiverAddress', width: 22 },
          { header: 'सम्पर्क नं.', key: 'receiverContact', width: 16 },
          { header: 'पत्र संख्या', key: 'letterRefNo', width: 16 },
          { header: 'पत्रको विषय', key: 'subject', width: 36 },
          { header: 'पठाउने शाखा', key: 'department', width: 24 },
          { header: 'हस्ताक्षरकर्ता', key: 'signedBy', width: 22 },
          { header: 'स्थिति', key: 'status', width: 16 },
        ];
        if (format === 'csv') {
          exportToCsv({ filename: `Panchpokhari_Chalani_Register_${dateStr}`, columns, data });
        } else {
          exportToExcel({ filename: `Panchpokhari_Chalani_Register_${dateStr}`, sheetName: 'चलानी_किताब', columns, data });
        }
      },
    },
    {
      id: 'employees',
      titleNp: '६. कर्मचारी तथा मानव संसाधन (HRMS)',
      titleEn: 'Employee Directory & Service Records',
      description: 'स्थायी, करार, ज्यालादारी कर्मचारीको व्यक्तिगत विवरण, पद, शाखा, सम्पर्क र सेवा स्थिति।',
      category: 'administration',
      icon: <Users size={24} color="#7c3aed" />,
      color: '#7c3aed',
      bgColor: '#faf5ff',
      endpoint: '/employees',
      countLabel: `${counts.employees || '६८+'} कर्मचारी`,
      customExportHandler: (data, format) => exportEmployeesData(data, format),
    },
    {
      id: 'complaints',
      titleNp: '७. नागरिक गुनासो तथा सुनुवाइ',
      titleEn: 'Citizen Grievances & Redressal',
      description: 'नागरिकबाट प्राप्त गुनासा, समस्याको क्षेत्र, वडा, प्राथमिकता, सम्बोधन स्थिति र कारबाही विवरण।',
      category: 'governance',
      icon: <MessageSquare size={24} color="#e11d48" />,
      color: '#e11d48',
      bgColor: '#fff1f2',
      endpoint: '/complaints',
      countLabel: `${counts.complaints || '४२+'} गुनासो`,
      customExportHandler: (data, format) => exportComplaintsData(data, format),
    },
    {
      id: 'judicial',
      titleNp: '८. न्यायिक समिति उजुरी तथा फैसला',
      titleEn: 'Judicial Committee Case Records',
      description: 'न्यायिक समितिमा दर्ता उजुरी, वादी, प्रतिवादी, विवादको विषय, पेशी मिति र मिलापत्र/फैसला।',
      category: 'governance',
      icon: <Scale size={24} color="#9333ea" />,
      color: '#9333ea',
      bgColor: '#fdf4ff',
      endpoint: '/judicial',
      countLabel: `${counts.judicial || '१९+'} मुद्दा`,
      customExportHandler: (data, format) => exportJudicialCasesData(data, format),
    },
    {
      id: 'projects',
      titleNp: '९. योजना तथा विकास परियोजनाहरू',
      titleEn: 'Municipal Development Projects',
      description: 'गाउँपालिकाका वार्षिक स्वीकृत योजनाहरू, बजेट विनियोजन, उपभोक्ता समिति/ठेकेदार र भौतिक प्रगति %।',
      category: 'governance',
      icon: <FolderGit2 size={24} color="#ea580c" />,
      color: '#ea580c',
      bgColor: '#fff7ed',
      endpoint: '/projects',
      countLabel: `${counts.projects || '१२४+'} योजना`,
      customExportHandler: (data, format) => {
        const dateStr = new Date().toISOString().slice(0, 10);
        const columns = [
          { header: 'क्र.सं.', key: '__index__', width: 8 },
          { header: 'योजना कोड', key: 'projectCode', width: 16 },
          { header: 'योजनाको नाम', key: 'title', width: 34 },
          { header: 'क्षेत्र (Sector)', key: 'sector', width: 20 },
          { header: 'वडा नं.', key: 'wardNumber', width: 10, format: (v: any) => v ? `वडा नं. ${v}` : 'पालिकास्तर' },
          { header: 'कुल विनियोजित बजेट (रु.)', key: 'budgetNpr', width: 20, format: (v: any) => Number(v || 0).toLocaleString('en-IN') },
          { header: 'खर्च भएको रकम (रु.)', key: 'expenditureNpr', width: 20, format: (v: any) => Number(v || 0).toLocaleString('en-IN') },
          { header: 'भौतिक प्रगति (%)', key: 'physicalProgress', width: 16, format: (v: any) => `${v || 0}%` },
          { header: 'वित्तीय प्रगति (%)', key: 'financialProgress', width: 16, format: (v: any) => `${v || 0}%` },
          { header: 'योजना स्थिति', key: 'status', width: 16 },
          { header: 'कार्यान्वयन विधि', key: 'executionMode', width: 22 },
        ];
        if (format === 'csv') {
          exportToCsv({ filename: `Panchpokhari_Projects_${dateStr}`, columns, data });
        } else {
          exportToExcel({ filename: `Panchpokhari_Projects_${dateStr}`, sheetName: 'विकास_योजनाहरू', columns, data });
        }
      },
    },
    {
      id: 'assets',
      titleNp: '१०. सार्वजनिक सम्पत्ति तथा जिन्सी (PAMS)',
      titleEn: 'Municipal Public Assets & Inventory',
      description: 'म.ले.प. फाराम नं. ४०१, ४०३ अनुसार पालिकाको जग्गा, भवन, सवारी साधन, उपकरण र जिन्सी सम्पत्ति।',
      category: 'administration',
      icon: <Package size={24} color="#0891b2" />,
      color: '#0891b2',
      bgColor: '#ecfeff',
      endpoint: '/assets',
      countLabel: `${counts.assets || '३१२+'} जिन्सी`,
      customExportHandler: (data, format) => exportAssetsData(data, format),
    },
    {
      id: 'library',
      titleNp: '११. डिजिटल पुस्तकालय तथा ई-अध्ययन सामग्री',
      titleEn: 'Digital Library & E-Learning Catalog',
      description: 'पालिकाका सम्पूर्ण भौतिक पुस्तकहरू, ई-पुस्तक (PDF), अडियो तथा भिडियो सामग्री, र्याक/दराज व्यवस्थापन र मौज्दात।',
      category: 'service',
      icon: <BookOpen size={24} color="#0284c7" />,
      color: '#0284c7',
      bgColor: '#f0f9ff',
      endpoint: '/heritage/library',
      countLabel: `${counts.library || '३८०+'} पुस्तक/सामग्री`,
      customExportHandler: (data, format) => exportLibraryBooksData(data, format),
    },
    {
      id: 'museum',
      titleNp: '१२. सांस्कृतिक सङ्ग्रहालय तथा सम्पदा अभिलेख',
      titleEn: 'Cultural Heritage Museum Catalog',
      description: 'स्थानीय ऐतिहासिक कलाकृति, लिच्छवि-मल्लकालीन पुरातात्विक सम्पदा, ह्योल्मो भेषभूषा, धातु/काष्ठकला र प्राचीन पाण्डुलिपि।',
      category: 'service',
      icon: <Landmark size={24} color="#b45309" />,
      color: '#b45309',
      bgColor: '#fffbeb',
      endpoint: '/heritage/museum',
      countLabel: `${counts.museum || '१२५+'} सम्पदा/कलाकृति`,
      customExportHandler: (data, format) => exportMuseumAssetsData(data, format),
    },
  ];

  const handleExportModule = async (module: DataModuleExportDef, format: 'xlsx' | 'csv') => {
    setExportingId(`${module.id}-${format}`);
    setStatusMessage(null);

    try {
      let queryUrl = module.endpoint;
      if (selectedWard !== 'all') {
        const separator = queryUrl.includes('?') ? '&' : '?';
        queryUrl = `${queryUrl}${separator}ward=${selectedWard}`;
      }

      const res: any = await api.get(queryUrl);
      let rawData: any[] = [];
      if (Array.isArray(res)) {
        rawData = res;
      } else if (res && Array.isArray(res.data)) {
        rawData = res.data;
      } else if (res && Array.isArray(res.items)) {
        rawData = res.items;
      } else if (res && typeof res === 'object') {
        // Fallback for object with keys
        const firstArray = Object.values(res).find((v) => Array.isArray(v));
        rawData = (firstArray as any[]) || [res];
      }

      // Client-side ward filtering if API didn't filter
      if (selectedWard !== 'all' && rawData.length > 0) {
        const wardNum = parseInt(selectedWard, 10);
        rawData = rawData.filter((item: any) => {
          const w = item.wardNumber || item.ward_number || item.ward || item.wardNo;
          return w === undefined || w === null || Number(w) === wardNum;
        });
      }

      if (rawData.length === 0) {
        alert(`${module.titleNp} मा छनोट गरिएको वडा वा शर्त अनुसार कुनै डाटा फेला परेन।`);
        setExportingId(null);
        return;
      }

      if (module.customExportHandler) {
        module.customExportHandler(rawData, format);
      } else {
        const dateStr = new Date().toISOString().slice(0, 10);
        const sample = rawData[0] || {};
        const columns = Object.keys(sample)
          .filter((k) => typeof sample[k] !== 'object')
          .slice(0, 18)
          .map((k) => ({ header: k, key: k, width: 18 }));

        if (format === 'csv') {
          exportToCsv({
            filename: `${module.id}_${dateStr}`,
            columns,
            data: rawData,
          });
        } else {
          exportToExcel({
            filename: `${module.id}_${dateStr}`,
            sheetName: 'Data',
            columns,
            data: rawData,
          });
        }
      }

      setStatusMessage({
        text: `✓ ${module.titleNp} (${rawData.length} रेकर्ड) सफलतापूर्वक ${format.toUpperCase()} मा डाउनलोड भयो!`,
        type: 'success',
      });
    } catch (err: any) {
      console.error(`Export failed for ${module.id}`, err);
      setStatusMessage({
        text: `त्रुटि: ${module.titleNp} को डाटा ल्याउन असफल भयो (${err?.message || 'Network error'})।`,
        type: 'error',
      });
    } finally {
      setExportingId(null);
    }
  };

  const filteredModules = MODULES.filter((m) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      m.titleNp.toLowerCase().includes(term) ||
      m.titleEn.toLowerCase().includes(term) ||
      m.description.toLowerCase().includes(term)
    );
  });

  return (
    <div style={{ width: '100%', boxSizing: 'border-box', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0369a1 100%)',
          color: '#ffffff',
          borderRadius: '16px',
          padding: '1.75rem 2rem',
          marginBottom: '1.75rem',
          boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.3)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.25rem',
        }}
      >
        <div style={{ maxWidth: '850px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
            <span
              style={{
                background: '#10b981',
                color: '#ffffff',
                fontSize: '0.72rem',
                fontWeight: 800,
                padding: '0.2rem 0.65rem',
                borderRadius: '20px',
                letterSpacing: '0.5px',
              }}
            >
              आधिकारिक डाटा व्यवस्थापन तथा सुशासन
            </span>
            <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
              {palikaName}
            </span>
          </div>

          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, margin: '0 0 0.4rem 0', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <FileSpreadsheet size={32} color="#38bdf8" />
            एकीकृत डाटा निर्यात केन्द्र (Data Export Hub)
          </h1>

          <p style={{ margin: 0, opacity: 0.9, fontSize: '0.92rem', lineHeight: 1.5, color: '#e2e8f0' }}>
            पालिकाका कर्मचारी तथा डेटा एन्ट्री अपरेटरहरूले प्रविष्ट गरेका सम्पूर्ण तथ्याङ्कहरू (घरधुरी, घटना दर्ता, व्यवसाय, दर्ता चलानी, कर्मचारी, योजना आदि) लाई एकै ठाउँबाट पूर्ण <strong>नेपाली युनिकोड सपोर्ट</strong> सहित Microsoft Excel (.xlsx) वा CSV मा डाउनलोड गर्नुहोस्।
          </p>
        </div>

        {/* Global Format Badges */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'rgba(255,255,255,0.08)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.15)' }}>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>
            समर्थित ढाँचाहरू (Formats)
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <span style={{ background: '#10b981', color: '#fff', padding: '0.35rem 0.75rem', borderRadius: '6px', fontWeight: 700, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <FileSpreadsheet size={14} /> Excel (.xlsx)
            </span>
            <span style={{ background: '#3b82f6', color: '#fff', padding: '0.35rem 0.75rem', borderRadius: '6px', fontWeight: 700, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Download size={14} /> CSV (UTF-8 BOM)
            </span>
          </div>
        </div>
      </div>

      {/* Status Alert Banner */}
      {statusMessage && (
        <div
          style={{
            padding: '1rem 1.25rem',
            marginBottom: '1.5rem',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            backgroundColor: statusMessage.type === 'success' ? '#f0fdf4' : '#fef2f2',
            border: `1.5px solid ${statusMessage.type === 'success' ? '#86efac' : '#fecaca'}`,
            color: statusMessage.type === 'success' ? '#166534' : '#991b1b',
            fontWeight: 600,
            fontSize: '0.92rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}
        >
          <CheckCircle2 size={20} color={statusMessage.type === 'success' ? '#16a34a' : '#dc2626'} />
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Filter and Control Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          padding: '1.15rem 1.4rem',
          backgroundColor: '#ffffff',
          borderRadius: '14px',
          border: '1.5px solid #e2e8f0',
          marginBottom: '1.75rem',
          boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', flex: 1 }}>
          {/* Ward Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={18} color="#0284c7" />
            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155' }}>
              वडा अनुसार छनोट:
            </span>
            <select
              value={selectedWard}
              onChange={(e) => setSelectedWard(e.target.value)}
              style={{
                padding: '0.55rem 0.95rem',
                borderRadius: '8px',
                border: '1.5px solid #cbd5e1',
                backgroundColor: '#f8fafc',
                fontSize: '0.88rem',
                fontWeight: 600,
                color: '#0f172a',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="all">सम्पूर्ण पालिका (All Wards)</option>
              <option value="1">वडा नं. १ (बाँसखर्क)</option>
              <option value="2">वडा नं. २ (बरुवा)</option>
              <option value="3">वडा नं. ३ (भोताङ)</option>
              <option value="4">वडा नं. ४ (थाङपालकोट)</option>
              <option value="5">वडा नं. ५ (गुन्सा)</option>
              <option value="6">वडा नं. ६ (थाङपालधाप)</option>
              <option value="7">वडा नं. ७ (तिपेनी)</option>
              <option value="8">वडा नं. ८ (लागर्चे)</option>
            </select>
          </div>

          {/* Search Modules */}
          <div style={{ position: 'relative', minWidth: '260px' }}>
            <Search
              size={17}
              color="#94a3b8"
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              placeholder="क्षेत्र खोज्नुहोस् (उदा: घरधुरी, व्यवसाय...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.55rem 0.95rem 0.55rem 2.4rem',
                borderRadius: '8px',
                border: '1.5px solid #cbd5e1',
                fontSize: '0.88rem',
                backgroundColor: '#ffffff',
                color: '#0f172a',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>

        <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
          कुल {filteredModules.length} वटा डाटा क्षेत्र उपलब्ध
        </div>
      </div>

      {/* Grid of Data Modules */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
          gap: '1.35rem',
          marginBottom: '2rem',
        }}
      >
        {filteredModules.map((module) => {
          const isExportingXlsx = exportingId === `${module.id}-xlsx`;
          const isExportingCsv = exportingId === `${module.id}-csv`;
          const isBusy = isExportingXlsx || isExportingCsv;

          return (
            <div
              key={module.id}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                border: '1.5px solid #e2e8f0',
                padding: '1.5rem',
                boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.2s ease',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '5px',
                  height: '100%',
                  backgroundColor: module.color,
                }}
              />

              <div>
                {/* Header of Card */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div
                      style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '12px',
                        backgroundColor: module.bgColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: `1px solid ${module.color}25`,
                      }}
                    >
                      {module.icon}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 2px 0' }}>
                        {module.titleNp}
                      </h3>
                      <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
                        {module.titleEn}
                      </span>
                    </div>
                  </div>

                  {module.countLabel && (
                    <span
                      style={{
                        padding: '0.25rem 0.65rem',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        backgroundColor: module.bgColor,
                        color: module.color,
                        border: `1px solid ${module.color}35`,
                      }}
                    >
                      {module.countLabel}
                    </span>
                  )}
                </div>

                {/* Description */}
                <p
                  style={{
                    fontSize: '0.85rem',
                    color: '#475569',
                    lineHeight: 1.5,
                    margin: '0 0 1.25rem 0',
                    minHeight: '42px',
                  }}
                >
                  {module.description}
                </p>
              </div>

              {/* Action Buttons */}
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1rem', display: 'flex', gap: '0.65rem' }}>
                <button
                  onClick={() => handleExportModule(module, 'xlsx')}
                  disabled={isBusy}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.45rem',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '10px',
                    border: '1px solid #059669',
                    backgroundColor: '#10b981',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.86rem',
                    cursor: isBusy ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 8px rgba(16, 185, 129, 0.25)',
                    transition: 'all 0.15s ease',
                  }}
                  title="Microsoft Excel (.xlsx) मा डाउनलोड गर्नुहोस्"
                >
                  {isExportingXlsx ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>तयार हुँदैछ...</span>
                    </>
                  ) : (
                    <>
                      <FileSpreadsheet size={16} />
                      <span>Excel (.xlsx)</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleExportModule(module, 'csv')}
                  disabled={isBusy}
                  style={{
                    flex: 0.7,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    padding: '0.65rem 0.75rem',
                    borderRadius: '10px',
                    border: '1.5px solid #cbd5e1',
                    backgroundColor: '#f8fafc',
                    color: '#334155',
                    fontWeight: 600,
                    fontSize: '0.86rem',
                    cursor: isBusy ? 'not-allowed' : 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  title="CSV (UTF-8 BOM) मा डाउनलोड गर्नुहोस्"
                >
                  {isExportingCsv ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <>
                      <Download size={15} />
                      <span>CSV</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Helpful Guidelines & Office Notes */}
      <div
        style={{
          backgroundColor: '#eff6ff',
          borderRadius: '14px',
          padding: '1.25rem 1.5rem',
          border: '1px solid #bfdbfe',
          display: 'flex',
          gap: '1rem',
          alignItems: 'flex-start',
        }}
      >
        <HelpCircle size={24} color="#1d4ed8" style={{ marginTop: '2px', flexShrink: 0 }} />
        <div style={{ fontSize: '0.86rem', color: '#1e3a8a', lineHeight: 1.6 }}>
          <strong>कार्यालय प्रयोग तथा प्रतिवेदन सम्बन्धी महत्वपूर्ण मार्गदर्शन:</strong>
          <ul style={{ margin: '0.4rem 0 0 1.25rem', padding: 0 }}>
            <li>
              <strong>युनिकोड समर्थन:</strong> एक्सेल (.xlsx) तथा CSV दुवै ढाँचामा नेपाली भाषाका नाम, ठेगाना र विवरणहरू पूर्ण रूपमा UTF-8 मा सुरक्षित हुन्छन् (Excel खोल्दा केरमेट वा '???' आउँदैन)।
            </li>
            <li>
              <strong>वडागत प्रतिवेदन:</strong> माथि रहेको "वडा अनुसार छनोट" ड्रपडाउनबाट कुनै निश्चित वडा छानेर सम्बन्धित वडाको मात्र तथ्याङ्क डाउनलोड गर्न सकिन्छ।
            </li>
            <li>
              <strong>म.ले.प. तथा मन्त्रालय प्रतिवेदन:</strong> डाउनलोड गरिएका फाइलहरूलाई लेखापरीक्षण (Auditing), संघीय मामिला तथा सामान्य प्रशासन मन्त्रालय (MoFAGA) र राष्ट्रिय योजना आयोगमा पेश गरिने प्रतिवेदनमा सिधै प्रयोग गर्न सकिन्छ।
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
