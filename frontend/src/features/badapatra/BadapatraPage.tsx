import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { badapatraApi } from '../../api/badapatra';
import type { CitizenCharterService } from '../../types/badapatra';
import {
  FileText,
  Search,
  Clock,
  Coins,
  UserCheck,
  Building,
  CheckSquare,
  HelpCircle,
  MapPin,
  ChevronDown,
  ChevronUp,
  PhoneCall,
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  CheckCircle2,
  Filter,
  Printer,
  Volume2,
  VolumeX,
  Play,
  Loader2,
  Download,
  FileSpreadsheet
} from 'lucide-react';
import * as XLSX from 'xlsx';

const PANCHPOKHARI_WARDS = [
  { id: 'all', name: 'सबै वडा (१-८)' },
  { id: '1', name: 'वडा नं. १ (बाँसखर्क)' },
  { id: '2', name: 'वडा नं. २ (बरुवा)' },
  { id: '3', name: 'वडा नं. ३ (भोताङ)' },
  { id: '4', name: 'वडा नं. ४ (थाङपालकोट)' },
  { id: '5', name: 'वडा नं. ५ (गुन्सा)' },
  { id: '6', name: 'वडा नं. ६ (थाङपालधाप)' },
  { id: '7', name: 'वडा नं. ७ (तिपेनी)' },
  { id: '8', name: 'वडा नं. ८ (लागर्चे)' },
];

interface ServiceFormData {
  id?: string;
  name: string;
  isWardLevel: boolean;
  category: string;
  department: string;
  wardNo: number | 'all';
  fee: string;
  timeRequired: string;
  responsibleOfficial: string;
  grievanceOfficial: string;
  roomNo: string;
  requiredDocuments: string;
  procedure: string;
}

const DEFAULT_FORM: ServiceFormData = {
  name: '',
  isWardLevel: true,
  category: 'वडा कार्यालय',
  department: 'वडा कार्यालय',
  wardNo: 'all',
  fee: 'निःशुल्क',
  timeRequired: 'सोही दिन',
  responsibleOfficial: 'वडा सचिव / वडा अध्यक्ष',
  grievanceOfficial: 'प्रमुख प्रशासकीय अधिकृत',
  roomNo: 'वडा प्रशासन कक्ष',
  requiredDocuments: '१) व्यहोरा खुल्ने निवेदन\n२) नागरिकता प्रमाणपत्रको प्रतिलिपि',
  procedure: 'फारम भरी आवश्यक कागजात संलग्न गरी कार्यालयमा पेश गर्ने।',
};

export interface BadapatraPageProps {
  readOnly?: boolean;
}

export const BadapatraPage: React.FC<BadapatraPageProps> = ({ readOnly = false }) => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedScope, setSelectedScope] = useState<'all' | 'ward' | 'palika'>('all');
  const [selectedWard, setSelectedWard] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedServiceId, setExpandedServiceId] = useState<string | null>('145');

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [formData, setFormData] = useState<ServiceFormData>(DEFAULT_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Audio and TTS States
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [playingServiceId, setPlayingServiceId] = useState<string | null>(null);
  const [isVoiceLoading, setIsVoiceLoading] = useState<string | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  // National Anthem Scheduler
  useEffect(() => {
    if (!audioEnabled) return;

    let timeoutId: NodeJS.Timeout;
    
    const scheduleNationalAnthem = () => {
      const now = new Date();
      const anthemTime = new Date();
      anthemTime.setHours(9, 0, 0, 0); // 9:00 AM

      if (now.getTime() > anthemTime.getTime()) {
        anthemTime.setDate(anthemTime.getDate() + 1);
      }

      const timeUntil9AM = anthemTime.getTime() - now.getTime();

      timeoutId = setTimeout(() => {
        const audio = new Audio('/national-anthem.mp3');
        audio.play().catch(error => console.log("Autoplay blocked:", error));
        
        // Schedule for next day
        scheduleNationalAnthem();
      }, timeUntil9AM);
    };

    scheduleNationalAnthem();

    return () => clearTimeout(timeoutId);
  }, [audioEnabled]);

  const speakText = async (text: string, serviceId: string) => {
    // If clicking the currently playing service, stop it
    if (playingServiceId === serviceId || isVoiceLoading === serviceId) {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }
      setPlayingServiceId(null);
      setIsVoiceLoading(null);
      return;
    }

    // Stop any other currently playing audio
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }

    try {
      setIsVoiceLoading(serviceId);
      
      // Call our custom AI TTS endpoint (ElevenLabs cloned voice)
      const audioBlob = await badapatraApi.generateSpeech(text);
      
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      currentAudioRef.current = audio;
      
      audio.onended = () => {
        setPlayingServiceId(null);
        URL.revokeObjectURL(audioUrl); // cleanup
      };

      audio.onerror = () => {
        setPlayingServiceId(null);
        alert("अडियो प्ले गर्न समस्या भयो।");
        URL.revokeObjectURL(audioUrl);
      };

      setIsVoiceLoading(null);
      setPlayingServiceId(serviceId);
      await audio.play();

    } catch (error) {
      console.error("TTS Error:", error);
      setIsVoiceLoading(null);
      setPlayingServiceId(null);
      alert("अडियो जेनेरेट गर्न सकिएन। API Key सेट नभएको हुन सक्छ।");
    }
  };

  const { data: rawServices = [], isLoading } = useQuery({
    queryKey: ['badapatra-services'],
    queryFn: () => badapatraApi.getAllServices(),
    staleTime: 1000 * 60 * 5,
  });

  const { data: summary } = useQuery({
    queryKey: ['badapatra-summary'],
    queryFn: () => badapatraApi.getSummary(),
    staleTime: 1000 * 60 * 5,
  });

  // Ensure services is always an array
  const services: CitizenCharterService[] = useMemo(() => {
    if (Array.isArray(rawServices)) return rawServices;
    if (rawServices && typeof rawServices === 'object' && Array.isArray((rawServices as any).data)) {
      return (rawServices as any).data;
    }
    return [];
  }, [rawServices]);

  // Scope Counts
  const totalCount = services.length;
  const wardCount = useMemo(() => services.filter((s) => s.isWardLevel).length, [services]);
  const palikaCount = useMemo(() => services.filter((s) => !s.isWardLevel).length, [services]);

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    services.forEach((s) => {
      if (s.category) cats.add(s.category);
    });
    return Array.from(cats);
  }, [services]);

  // Filtered Services
  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const sName = service.name || '';
      const sOfficial = service.responsibleOfficial || '';
      const sDept = service.department || '';
      const sDocs = Array.isArray(service.requiredDocuments) ? service.requiredDocuments : [];

      const matchesSearch =
        !searchTerm ||
        sName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sOfficial.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sDept.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sDocs.some((doc) => doc.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesScope =
        selectedScope === 'all'
          ? true
          : selectedScope === 'ward'
          ? !!service.isWardLevel
          : !service.isWardLevel;

      const matchesWard =
        selectedWard === 'all' ||
        !service.isWardLevel ||
        service.wardNo === 'all' ||
        !service.wardNo ||
        String(service.wardNo) === String(selectedWard);

      const matchesCategory =
        selectedCategory === 'all' || service.category === selectedCategory;

      return matchesSearch && matchesScope && matchesWard && matchesCategory;
    });
  }, [services, searchTerm, selectedScope, selectedWard, selectedCategory]);

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleOpenCreate = () => {
    setModalMode('create');
    setFormData({
      ...DEFAULT_FORM,
      isWardLevel: selectedScope === 'palika' ? false : true,
      category: selectedScope === 'palika' ? 'प्रशासन तथा योजना शाखा' : 'वडा कार्यालय',
      department: selectedScope === 'palika' ? 'गाउँपालिका केन्द्र' : 'वडा कार्यालय',
      wardNo: selectedWard !== 'all' ? Number(selectedWard) : 'all',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (service: CitizenCharterService, e: React.MouseEvent) => {
    e.stopPropagation();
    setModalMode('edit');
    const docs = Array.isArray(service.requiredDocuments)
      ? service.requiredDocuments.join('\n')
      : String(service.requiredDocuments || '');

    setFormData({
      id: service.id,
      name: service.name,
      isWardLevel: !!service.isWardLevel,
      category: service.category || (service.isWardLevel ? 'वडा कार्यालय' : 'गाउँकार्यपालिका'),
      department: service.department || (service.isWardLevel ? 'वडा कार्यालय' : 'गाउँपालिका केन्द्र'),
      wardNo: service.wardNo !== undefined ? service.wardNo : 'all',
      fee: service.fee || 'निःशुल्क',
      timeRequired: service.timeRequired || 'सोही दिन',
      responsibleOfficial: service.responsibleOfficial || 'सम्बन्धित अधिकारी',
      grievanceOfficial: service.grievanceOfficial || 'प्रमुख प्रशासकीय अधिकृत',
      roomNo: service.roomNo || 'प्रशासन कक्ष',
      requiredDocuments: docs,
      procedure: service.procedure || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (service: CitizenCharterService, e: React.MouseEvent) => {
    e.stopPropagation();
    const confirmed = window.confirm(`के तपाईं "${service.name}" सेवा नागरिक बडापत्रबाट हटाउन निश्चित हुनुहुन्छ?`);
    if (!confirmed) return;

    try {
      await badapatraApi.deleteService(service.id);
      await queryClient.invalidateQueries({ queryKey: ['badapatra-services'] });
      await queryClient.invalidateQueries({ queryKey: ['badapatra-summary'] });
      showNotice(`"${service.name}" सेवा सफलतापूर्वक हटाइयो।`);
    } catch (err: any) {
      alert(`सेवा हटाउन सकिएन: ${err.message || 'त्रुटि देखा पर्यो'}`);
    }
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('कृपया सेवाको नाम प्रविष्ट गर्नुहोस्।');
      return;
    }

    setIsSaving(true);
    try {
      const docArray = formData.requiredDocuments
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

      const payload: Partial<CitizenCharterService> = {
        name: formData.name.trim(),
        isWardLevel: formData.isWardLevel,
        category: formData.category.trim() || (formData.isWardLevel ? 'वडा कार्यालय' : 'गाउँकार्यपालिका'),
        department: formData.department.trim() || (formData.isWardLevel ? 'वडा कार्यालय' : 'गाउँपालिका केन्द्र'),
        wardNo: formData.isWardLevel ? formData.wardNo : undefined,
        fee: formData.fee.trim() || 'निःशुल्क',
        timeRequired: formData.timeRequired.trim() || 'सोही दिन',
        responsibleOfficial: formData.responsibleOfficial.trim() || (formData.isWardLevel ? 'वडा सचिव / वडा अध्यक्ष' : 'शाखा प्रमुख'),
        grievanceOfficial: formData.grievanceOfficial.trim() || 'प्रमुख प्रशासकीय अधिकृत',
        roomNo: formData.roomNo.trim() || (formData.isWardLevel ? 'वडा प्रशासन कक्ष' : 'प्रशासन कक्ष'),
        requiredDocuments: docArray.length > 0 ? docArray : ['आवश्यक कागजातको विवरण कार्यालयबाट उपलब्ध हुनेछ।'],
        procedure: formData.procedure.trim() || 'फारम भरी आवश्यक कागजात संलग्न गरी कार्यालयमा पेश गर्ने।',
      };

      if (modalMode === 'create') {
        await badapatraApi.createService(payload);
        showNotice(`नयाँ सेवा "${payload.name}" सफलतापूर्वक बडापत्रमा थप गरियो।`);
      } else if (modalMode === 'edit' && formData.id) {
        await badapatraApi.updateService(formData.id, payload);
        showNotice(`सेवा "${payload.name}" सफलतापूर्वक अद्यावधिक गरियो।`);
      }

      await queryClient.invalidateQueries({ queryKey: ['badapatra-services'] });
      await queryClient.invalidateQueries({ queryKey: ['badapatra-summary'] });
      setIsModalOpen(false);
    } catch (err: any) {
      alert(`बडापत्र सुरक्षित गर्न सकिएन: ${err.message || 'त्रुटि देखा पर्यो'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const [isExporting, setIsExporting] = useState(false);

  const handleExportToExcel = () => {
    try {
      setIsExporting(true);
      const servicesToExport = services;

      if (!servicesToExport || servicesToExport.length === 0) {
        alert('Export गर्न कुनै पनि सेवा विवरण भेटिएन।');
        setIsExporting(false);
        return;
      }

      const wb = XLSX.utils.book_new();

      // 1. Sheet 1: Citizen_Charter_Standard (matching D:\Project\CITIZEN_CHARTER_2026-09-24 10_55_37.784267+00_00.xlsx)
      const cols42 = [
        'id', 'created_at', 'last_modified', 'deleted_at',
        'service_details', 'service_details_ne', 'service_details_en', 'service_details_ol',
        'required_process', 'required_documents', 'required_documents_ne', 'required_documents_en', 'required_documents_ol',
        'fees', 'fees_ne', 'fees_en', 'fees_ol',
        'processing_time', 'processing_time_ne', 'processing_time_en', 'processing_time_ol',
        'responsible_person_or_section', 'responsible_person_or_section_ne', 'responsible_person_or_section_en', 'responsible_person_or_section_ol',
        'flow_time', 'flow_time_ne', 'flow_time_en', 'flow_time_ol',
        'complaint_officer', 'service_code', 'service_type', 'online_service_link',
        'providing_department', 'fee_details', 'process_steps', 'related_law',
        'feature_icon', 'is_active', 'department', 'ward', 'ward_department'
      ];

      const nowIso = new Date().toISOString().replace('T', ' ').substring(0, 19) + '+00:00';

      const rows42 = servicesToExport.map((s) => {
        const docsStr = Array.isArray(s.requiredDocuments)
          ? s.requiredDocuments.join('\n')
          : String(s.requiredDocuments || '');
        const isWard = s.isWardLevel ?? true;
        const dept = s.department || (isWard ? 'वडा कार्यालय' : 'गाउँपालिका केन्द्र');
        const room = s.roomNo || (isWard ? 'वडा प्रशासन कक्ष' : 'प्रशासन कक्ष');
        const proc = s.procedure || 'फारम भरी आवश्यक कागजात संलग्न गरी कार्यालयमा पेश गर्ने।';
        const fee = s.fee || 'निःशुल्क';
        const timeReq = s.timeRequired || 'सोही दिन';
        const official = s.responsibleOfficial || 'वडा सचिव / शाखा प्रमुख';
        const complaint = s.grievanceOfficial || 'प्रमुख प्रशासकीय अधिकृत / गाउँपालिका उपाध्यक्ष';

        return [
          s.id,
          nowIso,
          nowIso,
          '',
          s.name,
          s.name,
          '',
          '',
          proc,
          docsStr,
          docsStr,
          '',
          '',
          fee,
          fee,
          '',
          '',
          timeReq,
          timeReq,
          '',
          '',
          official,
          official,
          '',
          '',
          '',
          '',
          '',
          '',
          complaint,
          `S-${s.id}`,
          isWard ? 'वडा तह' : 'गाउँपालिका तह',
          'https://eservice.panchpokharimun.gov.np',
          dept,
          fee,
          proc,
          'स्थानीय सरकार सञ्चालन ऐन, २०७४',
          'file-text',
          'TRUE',
          s.category || dept,
          isWard ? 'सबै वडा (१-८)' : 'गाउँपालिका केन्द्र',
          room
        ];
      });

      const ws1 = XLSX.utils.aoa_to_sheet([cols42, ...rows42]);
      XLSX.utils.book_append_sheet(wb, ws1, 'Citizen_Charter_Standard');

      // 2. Sheet 2: नागरिक_वडापत्र_विस्तृत
      const nepaliCols = [
        'क्र.सं.',
        'सेवाको नाम (Service Name)',
        'तह (Level)',
        'शाखा / वडा (Department / Ward)',
        'दस्तुर (Fee)',
        'लाग्ने समय (Processing Time)',
        'जिम्मेवार अधिकारी (Responsible Official)',
        'सेवा प्रवाह कक्ष (Room No)',
        'आवश्यक कागजातहरू (Required Documents)',
        'सेवा प्रक्रिया (Procedure)',
        'गुनासो सुन्ने अधिकारी (Grievance Officer)'
      ];

      const rowsNepali = servicesToExport.map((s, idx) => {
        const docsStr = Array.isArray(s.requiredDocuments)
          ? s.requiredDocuments.join('\n')
          : String(s.requiredDocuments || '');
        const isWard = s.isWardLevel ?? true;

        return [
          idx + 1,
          s.name,
          isWard ? 'वडा तह' : 'पालिका केन्द्र',
          s.department || (isWard ? 'वडा कार्यालय' : 'गाउँपालिका केन्द्र'),
          s.fee || 'निःशुल्क',
          s.timeRequired || 'सोही दिन',
          s.responsibleOfficial || 'वडा सचिव / शाखा प्रमुख',
          s.roomNo || (isWard ? 'वडा प्रशासन कक्ष' : 'प्रशासन कक्ष'),
          docsStr,
          s.procedure || 'फारम भरी आवश्यक कागजात संलग्न गरी कार्यालयमा पेश गर्ने।',
          s.grievanceOfficial || 'प्रमुख प्रशासकीय अधिकृत / गाउँपालिका उपाध्यक्ष'
        ];
      });

      const ws2 = XLSX.utils.aoa_to_sheet([nepaliCols, ...rowsNepali]);
      ws2['!cols'] = [
        { wch: 8 },
        { wch: 38 },
        { wch: 14 },
        { wch: 22 },
        { wch: 16 },
        { wch: 20 },
        { wch: 25 },
        { wch: 18 },
        { wch: 45 },
        { wch: 35 },
        { wch: 30 },
      ];

      XLSX.utils.book_append_sheet(wb, ws2, 'नागरिक_वडापत्र_विस्तृत');

      const d = new Date();
      const pad = (n: number) => String(n).padStart(2, '0');
      const timestamp = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}_${pad(d.getMinutes())}_${pad(d.getSeconds())}`;
      const filename = `CITIZEN_CHARTER_${timestamp}.xlsx`;

      XLSX.writeFile(wb, filename);
      setActionNotice(`सफलतापूर्वक ${servicesToExport.length} वटा नागरिक वडापत्र सेवाहरू "${filename}" मा Export भयो!`);
    } catch (err: any) {
      alert(`Export असफल भयो: ${err.message || 'त्रुटि'}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem' }}>
      {/* Action Notice Alert (Admin Only) */}
      {!readOnly && actionNotice && (
        <div
          style={{
            backgroundColor: '#ecfdf5',
            color: '#065f46',
            border: '1px solid #a7f3d0',
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            fontWeight: 600,
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={20} color="#059669" />
            <span>{actionNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionNotice(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#065f46' }}
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #2563eb 100%)',
          color: '#ffffff',
          borderRadius: '20px',
          padding: '2rem',
          boxShadow: '0 10px 25px -5px rgba(30, 58, 138, 0.3)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
        }}
      >
        <div style={{ maxWidth: '650px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
            <span
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: 700,
                letterSpacing: '0.5px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <FileText size={14} /> नागरिक सेवा निर्देशिका {readOnly && '• सार्वजनिक वडापत्र'}
            </span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 0.5rem 0', letterSpacing: '-0.5px' }}>
            डिजिटल नागरिक वडापत्र (Citizen Charter)
          </h1>
          <p style={{ margin: 0, opacity: 0.9, fontSize: '0.95rem', lineHeight: 1.5 }}>
            पाँचपोखरी थाङपाल गाउँपालिका केन्द्र तथा १ देखि ८ वटै वडा कार्यालयहरूबाट नागरिकलाई प्रवाह गरिने सेवा, दस्तुर, समय तथा आवश्यक कागजातहरूको एकीकृत विवरण
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={() => setAudioEnabled(!audioEnabled)}
              style={{
                backgroundColor: audioEnabled ? '#10b981' : 'rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                padding: '0.85rem 1.25rem',
                fontWeight: 700,
                fontSize: '0.875rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backdropFilter: 'blur(8px)',
                transition: 'all 0.2s ease',
              }}
              title="अडियो वाचन र राष्ट्रिय गान सक्षम गर्नुहोस्"
            >
              {audioEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
              <span>{audioEnabled ? 'अडियो अन छ' : 'अडियो सुरु गर्नुहोस्'}</span>
            </button>
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(8px)',
                borderRadius: '14px',
                padding: '0.85rem 1.25rem',
                textAlign: 'center',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              <div style={{ fontSize: '0.75rem', opacity: 0.85, fontWeight: 600 }}>कुल सेवाहरू</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 900 }}>{totalCount}</div>
            </div>
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(8px)',
                borderRadius: '14px',
                padding: '0.85rem 1.25rem',
                textAlign: 'center',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              <div style={{ fontSize: '0.75rem', opacity: 0.85, fontWeight: 600 }}>वडा तहका सेवा</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 900 }}>{wardCount}</div>
            </div>
          </div>

          {/* Excel Export Button (.xlsx) */}
          <button
            type="button"
            onClick={handleExportToExcel}
            disabled={isExporting}
            style={{
              backgroundColor: '#059669',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              padding: '0.85rem 1.25rem',
              fontWeight: 800,
              fontSize: '0.9rem',
              cursor: isExporting ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 14px rgba(5, 150, 105, 0.4)',
              transition: 'transform 0.15s ease',
              opacity: isExporting ? 0.7 : 1,
            }}
            onMouseOver={(e) => !isExporting && (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseOut={(e) => !isExporting && (e.currentTarget.style.transform = 'translateY(0)')}
            title="डिजिटल नागरिक वडापत्रलाई Excel (.xlsx) मा Export गर्नुहोस्"
          >
            <Download size={18} />
            <span>{isExporting ? 'Export हुँदैछ...' : 'एक्सेल Export (.xlsx)'}</span>
          </button>

          {!readOnly ? (
            <button
              type="button"
              onClick={handleOpenCreate}
              style={{
                backgroundColor: '#ffffff',
                color: '#1e40af',
                border: 'none',
                borderRadius: '12px',
                padding: '0.85rem 1.25rem',
                fontWeight: 800,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                transition: 'transform 0.15s ease',
              }}
              onMouseOver={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseOut={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <Plus size={18} />
              <span>नयाँ सेवा थप्नुहोस्</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => window.print()}
              style={{
                backgroundColor: '#ffffff',
                color: '#1e40af',
                border: 'none',
                borderRadius: '12px',
                padding: '0.85rem 1.25rem',
                fontWeight: 700,
                fontSize: '0.875rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                transition: 'transform 0.15s ease',
              }}
              onMouseOver={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseOut={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
              title="वडापत्र प्रिन्ट वा PDF सेभ गर्नुहोस्"
            >
              <Printer size={16} />
              <span>प्रिन्ट / सुरक्षित गर्नुहोस्</span>
            </button>
          )}
        </div>
      </div>

      {/* Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <div className="dt-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: '12px', backgroundColor: '#eff6ff', color: '#2563eb' }}>
            <FileText size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>कुल नागरिक सेवाहरू</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>{totalCount}</div>
          </div>
        </div>

        <div className="dt-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: '12px', backgroundColor: '#ecfdf5', color: '#059669' }}>
            <Building size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>८ वटा वडा कार्यालय</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>{wardCount} सेवाहरू</div>
          </div>
        </div>

        <div className="dt-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: '12px', backgroundColor: '#fef3c7', color: '#d97706' }}>
            <Coins size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>निःशुल्क सेवाहरू</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>
              {summary?.freeServicesCount || 42}
            </div>
          </div>
        </div>

        <div className="dt-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: '12px', backgroundColor: '#f5f3ff', color: '#7c3aed' }}>
            <Clock size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>सोही दिन सेवा प्रवाह</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>८८% भन्दा बढी</div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div
        className="dt-card"
        style={{
          padding: '1.25rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'center',
          boxShadow: '0 4px 14px rgba(0,0,0,0.03)',
        }}
      >
        {/* Search */}
        <div style={{ flex: '1 1 260px', position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            className="dt-input"
            style={{ paddingLeft: '38px', height: '42px', fontSize: '0.9rem' }}
            placeholder="सेवाको नाम, आवश्यक कागजात वा शाखा खोज्नुहोस्..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Scope Toggle */}
        <div style={{ display: 'flex', borderRadius: '10px', border: '1px solid #cbd5e1', overflow: 'hidden', backgroundColor: '#f8fafc' }}>
          <button
            type="button"
            onClick={() => setSelectedScope('all')}
            style={{
              padding: '8px 16px',
              fontSize: '0.85rem',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              backgroundColor: selectedScope === 'all' ? '#2563eb' : 'transparent',
              color: selectedScope === 'all' ? '#ffffff' : '#475569',
              transition: 'all 0.15s ease',
            }}
          >
            सबै सेवा ({totalCount})
          </button>
          <button
            type="button"
            onClick={() => setSelectedScope('ward')}
            style={{
              padding: '8px 16px',
              fontSize: '0.85rem',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              backgroundColor: selectedScope === 'ward' ? '#2563eb' : 'transparent',
              color: selectedScope === 'ward' ? '#ffffff' : '#475569',
              transition: 'all 0.15s ease',
            }}
          >
            वडा कार्यालय ({wardCount})
          </button>
          <button
            type="button"
            onClick={() => setSelectedScope('palika')}
            style={{
              padding: '8px 16px',
              fontSize: '0.85rem',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              backgroundColor: selectedScope === 'palika' ? '#2563eb' : 'transparent',
              color: selectedScope === 'palika' ? '#ffffff' : '#475569',
              transition: 'all 0.15s ease',
            }}
          >
            पालिका केन्द्र ({palikaCount})
          </button>
        </div>

        {/* Ward Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <select
            className="dt-select"
            value={selectedWard}
            onChange={(e) => setSelectedWard(e.target.value)}
            style={{
              height: '42px',
              minWidth: '170px',
              fontSize: '0.85rem',
              fontWeight: 600,
              borderColor: selectedWard !== 'all' ? '#2563eb' : '#cbd5e1',
              backgroundColor: selectedWard !== 'all' ? '#eff6ff' : '#ffffff',
            }}
          >
            {PANCHPOKHARI_WARDS.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        </div>

        {/* Category Select */}
        {categories.length > 0 && (
          <select
            className="dt-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{ height: '42px', minWidth: '160px', fontSize: '0.85rem', fontWeight: 600 }}
          >
            <option value="all">सबै वर्ग / शाखा</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Services List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {isLoading ? (
          <div className="dt-card" style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
            बडापत्र विवरण लोड हुँदैछ...
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="dt-card" style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
            <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>
              खोजिएको शब्द वा छनोट अनुसार कुनै सेवा फेला परेन।
            </p>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>
              कृपया खोज शब्द परिवर्तन गर्नुहोस् वा फिल्टर रिसेट गर्नुहोस्।
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setSelectedScope('all');
                setSelectedWard('all');
                setSelectedCategory('all');
              }}
              style={{
                marginTop: '1rem',
                padding: '6px 16px',
                borderRadius: '8px',
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              फिल्टर रिसेट गर्नुहोस्
            </button>
          </div>
        ) : (
          filteredServices.map((service: CitizenCharterService) => {
            const isExpanded = expandedServiceId === service.id;
            const docList = Array.isArray(service.requiredDocuments) ? service.requiredDocuments : [];

            return (
              <div
                key={service.id}
                className="dt-card"
                style={{
                  padding: '1.25rem',
                  border: isExpanded ? '2px solid #2563eb' : '1px solid #e2e8f0',
                  boxShadow: isExpanded ? '0 8px 24px rgba(37,99,235,0.08)' : '0 2px 8px rgba(0,0,0,0.02)',
                  transition: 'all 0.2s ease',
                  backgroundColor: '#ffffff',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    userSelect: 'none',
                    gap: '1rem',
                  }}
                  onClick={() => setExpandedServiceId(isExpanded ? null : service.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '10px',
                        backgroundColor: service.isWardLevel ? '#ecfdf5' : '#eff6ff',
                        color: service.isWardLevel ? '#059669' : '#2563eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <FileText size={22} />
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                          {service.name}
                        </h3>
                        <span className={`dt-badge ${service.isWardLevel ? 'dt-badge-success' : 'dt-badge-info'}`}>
                          {service.isWardLevel ? 'वडा तह' : 'पालिका तह'}
                        </span>
                        {service.wardNo && service.wardNo !== 'all' && (
                          <span className="dt-badge dt-badge-primary">
                            वडा नं. {service.wardNo}
                          </span>
                        )}
                        {service.category && (
                          <span className="dt-badge dt-badge-warning">{service.category}</span>
                        )}
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1.5rem',
                          marginTop: '0.4rem',
                          fontSize: '0.82rem',
                          color: '#64748b',
                          flexWrap: 'wrap',
                        }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={14} color="#d97706" />
                          लाग्ने समय: <strong style={{ color: '#0f172a' }}>{service.timeRequired}</strong>
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Coins size={14} color="#059669" />
                          दस्तुर: <strong style={{ color: '#0f172a' }}>{service.fee}</strong>
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Building size={14} color="#2563eb" />
                          {service.department}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions: Edit, Delete (Admin Only), Expand */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <button
                      type="button"
                      title="सुन्नुहोस्"
                      onClick={(e) => {
                        e.stopPropagation();
                        const text = `${service.name} सेवा। लाग्ने समय: ${service.timeRequired}। दस्तुर: ${service.fee}। आवश्यक कागजातहरू: ${docList.join(', ')}`;
                        speakText(text, service.id);
                      }}
                      style={{
                        border: '1px solid #e2e8f0',
                        background: playingServiceId === service.id ? '#eff6ff' : '#ffffff',
                        padding: '7px 9px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        color: playingServiceId === service.id ? '#2563eb' : '#64748b',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.background = '#eff6ff')}
                      onMouseOut={(e) => (e.currentTarget.style.background = playingServiceId === service.id ? '#eff6ff' : '#ffffff')}
                    >
                      {isVoiceLoading === service.id ? (
                        <Loader2 size={15} className="animate-spin" />
                      ) : playingServiceId === service.id ? (
                        <Play size={15} />
                      ) : (
                        <Volume2 size={15} />
                      )}
                    </button>

                    {!readOnly && (
                      <>
                        <button
                          type="button"
                          title="सम्पादन गर्नुहोस्"
                          onClick={(e) => handleOpenEdit(service, e)}
                          style={{
                            border: '1px solid #e2e8f0',
                            background: '#ffffff',
                            padding: '7px 9px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            color: '#2563eb',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'background 0.15s ease',
                          }}
                          onMouseOver={(e) => (e.currentTarget.style.background = '#eff6ff')}
                          onMouseOut={(e) => (e.currentTarget.style.background = '#ffffff')}
                        >
                          <Pencil size={15} />
                        </button>

                        <button
                          type="button"
                          title="मेटाउनुहोस्"
                          onClick={(e) => handleDelete(service, e)}
                          style={{
                            border: '1px solid #fee2e2',
                            background: '#ffffff',
                            padding: '7px 9px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            color: '#dc2626',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'background 0.15s ease',
                          }}
                          onMouseOver={(e) => (e.currentTarget.style.background = '#fef2f2')}
                          onMouseOut={(e) => (e.currentTarget.style.background = '#ffffff')}
                        >
                          <Trash2 size={15} />
                        </button>
                      </>
                    )}

                    <button
                      type="button"
                      style={{
                        border: 'none',
                        background: '#f8fafc',
                        padding: '8px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        color: '#475569',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div
                    style={{
                      marginTop: '1.25rem',
                      paddingTop: '1.25rem',
                      borderTop: '1px solid #f1f5f9',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                      gap: '1.5rem',
                    }}
                  >
                    <div>
                      <h4
                        style={{
                          fontSize: '0.9rem',
                          fontWeight: 700,
                          color: '#0f172a',
                          marginBottom: '0.6rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <CheckSquare size={16} color="#2563eb" />
                        <span>आवश्यक कागजात तथा प्रमाणहरू:</span>
                      </h4>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        {docList.map((doc, idx) => (
                          <li
                            key={idx}
                            style={{
                              fontSize: '0.85rem',
                              padding: '0.35rem 0',
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '0.5rem',
                              color: '#334155',
                              lineHeight: 1.45,
                            }}
                          >
                            <span style={{ color: '#2563eb', fontWeight: 900 }}>•</span>
                            <span>{doc}</span>
                          </li>
                        ))}
                      </ul>

                      {service.procedure && (
                        <div style={{ marginTop: '0.75rem', padding: '8px 12px', backgroundColor: '#eff6ff', borderRadius: '8px', fontSize: '0.8rem', color: '#1e40af' }}>
                          <strong>प्रक्रिया:</strong> {service.procedure}
                        </div>
                      )}
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem',
                        backgroundColor: '#f8fafc',
                        padding: '1.25rem',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        height: 'fit-content',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#334155' }}>
                        <UserCheck size={16} color="#2563eb" />
                        <span>
                          जिम्मेवार अधिकारी: <strong style={{ color: '#0f172a' }}>{service.responsibleOfficial}</strong>
                        </span>
                      </div>

                      {service.grievanceOfficial && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#334155' }}>
                          <HelpCircle size={16} color="#d97706" />
                          <span>
                            गुनासो सुन्ने अधिकारी: <strong style={{ color: '#0f172a' }}>{service.grievanceOfficial}</strong>
                          </span>
                        </div>
                      )}

                      {service.roomNo && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#334155' }}>
                          <MapPin size={16} color="#64748b" />
                          <span>
                            सेवा प्रवाह कक्ष: <strong style={{ color: '#0f172a' }}>{service.roomNo}</strong>
                          </span>
                        </div>
                      )}

                      <div style={{ marginTop: '4px', paddingTop: '8px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>गुनासो तथा सोधपुछ:</span>
                        <a
                          href="tel:011-691001"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            color: '#2563eb',
                            textDecoration: 'none',
                          }}
                        >
                          <PhoneCall size={12} />
                          <span>०११-६९१००१</span>
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Service Modal (Admin Only) */}
      {!readOnly && isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
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
              maxWidth: '680px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
              border: '1px solid #e2e8f0',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#f8fafc',
                borderTopLeftRadius: '16px',
                borderTopRightRadius: '16px',
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                  {modalMode === 'create' ? 'नयाँ नागरिक बडापत्र सेवा थप्नुहोस्' : 'बडापत्र सेवा सम्पादन / अद्यावधिक'}
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                  नागरिकलाई प्रवाह गरिने सेवा, दस्तुर, समय तथा कागजातहरूको विवरण
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitForm} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Service Name */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  सेवाको नाम *
                </label>
                <input
                  type="text"
                  required
                  className="dt-input"
                  style={{ width: '100%', height: '40px' }}
                  placeholder="जस्तै: फरक जन्म मिति सिफारिस, धारा जडान, व्यवसाय दर्ता"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              {/* Scope & Ward Selection */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    क्षेत्र / तह *
                  </label>
                  <select
                    className="dt-select"
                    style={{ width: '100%', height: '40px' }}
                    value={formData.isWardLevel ? 'ward' : 'palika'}
                    onChange={(e) => {
                      const isWard = e.target.value === 'ward';
                      setFormData({
                        ...formData,
                        isWardLevel: isWard,
                        category: isWard ? 'वडा कार्यालय' : 'प्रशासन तथा योजना शाखा',
                        department: isWard ? 'वडा कार्यालय' : 'गाउँपालिका केन्द्र',
                        responsibleOfficial: isWard ? 'वडा सचिव / वडा अध्यक्ष' : 'शाखा प्रमुख',
                        roomNo: isWard ? 'वडा प्रशासन कक्ष' : 'प्रशासन कक्ष',
                      });
                    }}
                  >
                    <option value="ward">वडा कार्यालय तह</option>
                    <option value="palika">गाउँपालिका केन्द्र तह</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    वडा छनोट
                  </label>
                  <select
                    className="dt-select"
                    style={{ width: '100%', height: '40px' }}
                    disabled={!formData.isWardLevel}
                    value={formData.wardNo}
                    onChange={(e) => setFormData({ ...formData, wardNo: e.target.value === 'all' ? 'all' : Number(e.target.value) })}
                  >
                    {PANCHPOKHARI_WARDS.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Category & Department */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    शाखा / वर्ग
                  </label>
                  <input
                    type="text"
                    className="dt-input"
                    style={{ width: '100%', height: '40px' }}
                    placeholder="जस्तै: वडा कार्यालय, योजना तथा प्रशासन"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    सेवा प्रदायक निकाय
                  </label>
                  <input
                    type="text"
                    className="dt-input"
                    style={{ width: '100%', height: '40px' }}
                    placeholder="जस्तै: वडा कार्यालय, गाउँकार्यपालिका"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  />
                </div>
              </div>

              {/* Fee & Time Required */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    लाग्ने दस्तुर *
                  </label>
                  <input
                    type="text"
                    required
                    className="dt-input"
                    style={{ width: '100%', height: '40px' }}
                    placeholder="जस्तै: निःशुल्क वा रु. १०० ।"
                    value={formData.fee}
                    onChange={(e) => setFormData({ ...formData, fee: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    लाग्ने समय *
                  </label>
                  <input
                    type="text"
                    required
                    className="dt-input"
                    style={{ width: '100%', height: '40px' }}
                    placeholder="जस्तै: सोही दिन, २ घण्टा भित्र, बढीमा ३ दिन"
                    value={formData.timeRequired}
                    onChange={(e) => setFormData({ ...formData, timeRequired: e.target.value })}
                  />
                </div>
              </div>

              {/* Responsible Official & Room No */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    जिम्मेवार अधिकारी
                  </label>
                  <input
                    type="text"
                    className="dt-input"
                    style={{ width: '100%', height: '40px' }}
                    placeholder="जस्तै: वडा अध्यक्ष/वडा सचिव"
                    value={formData.responsibleOfficial}
                    onChange={(e) => setFormData({ ...formData, responsibleOfficial: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    सेवा प्रवाह कक्ष / कोठा
                  </label>
                  <input
                    type="text"
                    className="dt-input"
                    style={{ width: '100%', height: '40px' }}
                    placeholder="जस्तै: वडा प्रशासन कक्ष, कोठा नं २"
                    value={formData.roomNo}
                    onChange={(e) => setFormData({ ...formData, roomNo: e.target.value })}
                  />
                </div>
              </div>

              {/* Required Documents */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  आवश्यक कागजातहरू (प्रत्येक बुँदा नयाँ लाइनमा)
                </label>
                <textarea
                  rows={4}
                  className="dt-input"
                  style={{ width: '100%', padding: '10px', fontSize: '0.85rem' }}
                  placeholder="१) व्यहोरा खुल्ने निवेदन&#10;२) नागरिकता प्रमाणपत्रको प्रतिलिपि&#10;३) मालपोत कर तिरेको रसिद"
                  value={formData.requiredDocuments}
                  onChange={(e) => setFormData({ ...formData, requiredDocuments: e.target.value })}
                />
              </div>

              {/* Procedure */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  सेवा प्राप्त गर्ने प्रक्रिया वा थप कैफियत
                </label>
                <textarea
                  rows={2}
                  className="dt-input"
                  style={{ width: '100%', padding: '10px', fontSize: '0.85rem' }}
                  placeholder="फारम भरी आवश्यक कागजात संलग्न गरी कार्यालयमा पेश गर्ने।"
                  value={formData.procedure}
                  onChange={(e) => setFormData({ ...formData, procedure: e.target.value })}
                />
              </div>

              {/* Modal Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    fontWeight: 600,
                    cursor: 'pointer',
                    color: '#475569',
                  }}
                >
                  रद्द गर्नुहोस्
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  style={{
                    padding: '8px 22px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#2563eb',
                    color: '#ffffff',
                    fontWeight: 700,
                    cursor: isSaving ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Save size={16} />
                  <span>{isSaving ? 'सुरक्षित हुँदैछ...' : modalMode === 'create' ? 'सेवा थप्नुहोस्' : 'अद्यावधिक गर्नुहोस्'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BadapatraPage;
