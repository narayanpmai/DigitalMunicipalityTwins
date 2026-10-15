import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dartaChalaniApi } from '../../api/darta-chalani';
import { api } from '../../api/client';
import {
  Inbox,
  Send,
  Search,
  Plus,
  X,
  CheckCircle,
  XCircle,
  Lock,
  Edit2,
  Eye,
  AlertCircle,
  FileText,
  Printer,
  QrCode,
  UserCheck,
  CheckSquare,
  Clock,
  ShieldCheck,
  Building,
  Calendar,
  Phone,
  Mail,
  MapPin,
  HelpCircle,
  Download,
  Hash,
} from 'lucide-react';
import { BsCalendarModal } from '../../components/common/BsCalendarModal';
import { adToBs, toNepaliDigits, toEnglishDigits } from '../../utils/nepaliCalendar';
import { useTenant } from '../../context/TenantContext';

const TOK_PRESETS = [
  '१. नियमानुसार आवश्यक कारबाही गरी पेश गर्नुहोला।',
  '२. स्थलगत निरीक्षण तथा प्राविधिक जाँच गरी ३ दिनभित्र प्रतिवेदन पेश गर्नुहोला।',
  '३. सम्बन्धित फाँटबाट आवश्यक राय तथा टिप्पणीसहित निर्णयार्थ पेश गर्नुहोला।',
  '४. कानुन तथा मापदण्ड बमोजिम तुरुन्त फर्स्यौट गरी जानकारी गराउनुहोला।',
  '५. अभिलेखमा राखी आवश्यक कार्यान्वयन गर्नुहोला।',
  '६. बजेट तथा योजना शाखाबाट आवश्यक जाँचबुझ गरी पेश गर्नुहोला।',
  '७. न्यायिक समितिमा दर्ता गरी आवश्यक प्रक्रिया अगाडि बढाउनुहोला।',
];

const BRANCH_OPTIONS = [
  'प्रशासन तथा सामान्य सेवा शाखा',
  'योजना, अनुगमन तथा तथ्याङ्क शाखा',
  'आर्थिक प्रशासन (लेखा) शाखा',
  'शिक्षा, युवा तथा खेलकुद शाखा',
  'स्वास्थ्य शाखा',
  'पूर्वाधार विकास तथा प्राविधिक शाखा',
  'सामाजिक विकास शाखा',
  'कृषि तथा पशुपन्छी विकास शाखा',
  'राजस्व तथा आन्तरिक लेखापरीक्षण शाखा',
  'न्यायिक समिति तथा कानुन फाँट',
  'विपद् व्यवस्थापन तथा वातावरण शाखा',
  'वडा नं. १ कार्यालय',
  'वडा नं. २ कार्यालय',
  'वडा नं. ३ कार्यालय',
  'वडा नं. ४ कार्यालय',
  'वडा नं. ५ कार्यालय',
  'वडा नं. ६ कार्यालय',
  'वडा नं. ७ कार्यालय',
  'वडा नं. ८ कार्यालय',
];

export const DartaChalaniPage: React.FC = () => {
  let tenantSettings: any = null;
  try {
    const tenantCtx = useTenant();
    tenantSettings = tenantCtx?.settings;
  } catch {}

  const [activeTab, setActiveTab] = useState<'darta' | 'chalani'>('darta');
  const [searchTerm, setSearchTerm] = useState('');
  const [fiscalYear, setFiscalYear] = useState('२०८१/०८२');
  const [branchFilter, setBranchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Fetch currently active Fiscal Year from backend
  const { data: currentFyData } = useQuery({
    queryKey: ['active-fiscal-year'],
    queryFn: async () => {
      try {
        const res: any = await api.get('/fiscal-years/current');
        return res?.yearNp || res?.yearEn || '२०८१/०८२';
      } catch {
        return '२०८१/०८२';
      }
    },
    staleTime: 1000 * 60 * 60,
  });

  const activeFiscalYear = currentFyData || '२०८१/०८२';

  useEffect(() => {
    if (activeFiscalYear) {
      setFiscalYear(activeFiscalYear);
    }
  }, [activeFiscalYear]);

  // Modern GoN Features States
  const [showTokModal, setShowTokModal] = useState(false);
  const [tokRecord, setTokRecord] = useState<any | null>(null);
  const [tokForm, setTokForm] = useState({
    tokAdesh: '',
    assignedBranch: 'प्रशासन तथा सामान्य सेवा शाखा',
    assignedOfficer: '',
    deadlineDate: '',
    priority: 'साधारण',
    tokGivenBy: 'प्रमुख प्रशासकीय अधिकृत',
    tokDate: '२०८२-०५-२०',
  });

  const [showLetterModal, setShowLetterModal] = useState(false);
  const [letterRecord, setLetterRecord] = useState<any | null>(null);
  const [letterContent, setLetterContent] = useState('');

  const [showSlipModal, setShowSlipModal] = useState(false);
  const [slipRecord, setSlipRecord] = useState<any | null>(null);

  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifySearchCode, setVerifySearchCode] = useState('');
  const [verificationResult, setVerificationResult] = useState<any | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);
  const queryClient = useQueryClient();

  // BS Calendar Date Picker States
  const [calendarModalOpen, setCalendarModalOpen] = useState(false);
  const [calendarTarget, setCalendarTarget] = useState<'entry' | 'letter' | 'deadline'>('entry');

  const getInitialTodayBs = () => {
    try {
      const todayAd = new Date().toISOString().split('T')[0];
      const bsStr = adToBs(todayAd);
      if (bsStr) {
        return toNepaliDigits(bsStr);
      }
    } catch {
      // fallback
    }
    return '२०८१-०५-२०';
  };

  const formatNepaliTime = (val?: string | Date | null): string => {
    if (!val) {
      return new Date().toLocaleTimeString('ne-NP', { hour: '2-digit', minute: '2-digit', hour12: true });
    }
    if (val instanceof Date) {
      return val.toLocaleTimeString('ne-NP', { hour: '2-digit', minute: '2-digit', hour12: true });
    }
    let str = String(val).trim();
    str = str.replace(/(\bAM\b|am)/gi, 'पूर्वाह्न').replace(/(\bPM\b|pm)/gi, 'अपराह्न');
    return toNepaliDigits(str);
  };

  const getCurrentTimeStr = () => {
    return new Date().toLocaleTimeString('ne-NP', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const openBsCalendar = (target: 'entry' | 'letter' | 'deadline') => {
    setCalendarTarget(target);
    setCalendarModalOpen(true);
  };

  const handleCalendarDateSelect = (bsDate: string, adDate: string) => {
    if (calendarTarget === 'entry') {
      setFormData(prev => ({ ...prev, entryDateBs: bsDate }));
    } else if (calendarTarget === 'letter') {
      setFormData(prev => ({ ...prev, letterDateBs: bsDate, letterDateAd: adDate }));
    } else if (calendarTarget === 'deadline') {
      setTokForm(prev => ({ ...prev, deadlineDate: bsDate }));
    }
  };

  // New Record Form State with full Official Government Fields
  const [formData, setFormData] = useState({
    registrationNo: '', // दर्ता नं.
    dispatchNo: '', // चलानी नं.
    subject: '', // पत्रको विषय
    senderOrganization: '', // पठाउने कार्यालय वा व्यक्ति
    senderAddress: '', // पठाउनेको ठेगाना
    senderContact: '', // सम्पर्क / फोन
    recipientOrganization: '', // पाउने कार्यालय वा व्यक्ति
    recipientAddress: '', // पाउनेको ठेगाना
    recipientContact: '', // पाउनेको सम्पर्क
    letterNo: '', // पत्र संख्या
    senderChalaniNo: '', // प्राप्त पत्रको चलानी नं.
    letterDateBs: getInitialTodayBs(), // पत्र मिति (वि.सं.)
    letterDateAd: new Date().toISOString().split('T')[0], // पत्र मिति (ई.सं.)
    entryDateBs: getInitialTodayBs(), // दर्ता / चलानी मिति (वि.सं.)
    entryTime: getCurrentTimeStr(), // समय
    department: 'प्रशासन तथा सामान्य सेवा शाखा', // शाखा
    assignedOfficer: '', // जिम्मेवार कर्मचारी
    remarks: '', // कैफियत
    classification: 'साधारण', // प्राथमिकता
    deliveryMethod: 'हातै', // माध्यम
    pageCount: '१', // पाना संख्या
    signedBy: 'प्रमुख प्रशासकीय अधिकृत', // हस्ताक्षर गर्ने
  });

  const resetForm = () => {
    setEditingRecord(null);
    const now = new Date();
    const timeStr = getCurrentTimeStr();
    const todayBs = getInitialTodayBs();
    setFormData({
      registrationNo: '',
      dispatchNo: '',
      subject: '',
      senderOrganization: '',
      senderAddress: '',
      senderContact: '',
      recipientOrganization: '',
      recipientAddress: '',
      recipientContact: '',
      letterNo: '',
      senderChalaniNo: '',
      letterDateBs: todayBs,
      letterDateAd: now.toISOString().split('T')[0],
      entryDateBs: todayBs,
      entryTime: timeStr,
      department: 'प्रशासन तथा सामान्य सेवा शाखा',
      assignedOfficer: '',
      remarks: '',
      classification: 'साधारण',
      deliveryMethod: 'हातै',
      pageCount: '१',
      signedBy: 'प्रमुख प्रशासकीय अधिकृत',
    });
    setFormError('');
    setFormSuccess(false);
  };

  const { data: dartaList = [], isLoading: isDartaLoading } = useQuery({
    queryKey: ['darta-list'],
    queryFn: () => dartaChalaniApi.getDartaList(),
  });

  const { data: chalaniList = [], isLoading: isChalaniLoading } = useQuery({
    queryKey: ['chalani-list'],
    queryFn: () => dartaChalaniApi.getChalaniList(),
  });

  // Open New Entry Modal and Auto-populate Next Darta/Chalani Number
  const openNewModal = async (type?: 'darta' | 'chalani') => {
    const targetTab = type || activeTab;
    resetForm();
    setShowModal(true);

    try {
      const nextData = await dartaChalaniApi.getNextNumbers(activeFiscalYear);
      if (nextData) {
        if (targetTab === 'darta') {
          setFormData(prev => ({ ...prev, registrationNo: toNepaliDigits(nextData.nextDartaNo || '१') }));
        } else {
          setFormData(prev => ({ ...prev, dispatchNo: toNepaliDigits(nextData.nextChalaniNo || '१') }));
        }
      }
    } catch {
      if (targetTab === 'darta') {
        setFormData(prev => ({ ...prev, registrationNo: toNepaliDigits(dartaList.length + 1) }));
      } else {
        setFormData(prev => ({ ...prev, dispatchNo: toNepaliDigits(chalaniList.length + 1) }));
      }
    }
  };

  // Approval Mutations
  const dartaApprovalMutation = useMutation({
    mutationFn: ({ id, approvalStatus, reason }: { id: string; approvalStatus: string; reason?: string }) =>
      dartaChalaniApi.setDartaApproval(id, approvalStatus, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['darta-list'] });
    },
    onError: (err: any) => {
      alert('स्वीकृति त्रुटि: ' + (err?.message || 'असफल भयो'));
    }
  });

  const chalaniApprovalMutation = useMutation({
    mutationFn: ({ id, approvalStatus, reason }: { id: string; approvalStatus: string; reason?: string }) =>
      dartaChalaniApi.setChalaniApproval(id, approvalStatus, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chalani-list'] });
    },
    onError: (err: any) => {
      alert('स्वीकृति त्रुटि: ' + (err?.message || 'असफल भयो'));
    }
  });

  // Tok-Aadesh Mutation
  const tokAadeshMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => dartaChalaniApi.assignTokAdesh(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['darta-list'] });
      setShowTokModal(false);
      alert('तोक आदेश सफलतापूर्वक जारी गरियो!');
    },
    onError: (err: any) => {
      alert('तोक आदेश त्रुटि: ' + (err?.message || 'असफल भयो'));
    }
  });

  const handleToggleApproval = (item: any, type: 'darta' | 'chalani') => {
    const isApproved = item.approvalStatus === 'approved';
    const targetStatus = isApproved ? 'rejected' : 'approved';

    let reason = '';
    if (targetStatus === 'rejected') {
      const input = prompt('अस्विकृत गर्नुको कारण उल्लेख गर्नुहोस् (वैकल्पिक):', 'सम्पादन तथा आवश्यक संशोधनका लागि');
      if (input === null) return;
      reason = input.trim();
    }

    if (type === 'darta') {
      dartaApprovalMutation.mutate({ id: item.id, approvalStatus: targetStatus, reason });
    } else {
      chalaniApprovalMutation.mutate({ id: item.id, approvalStatus: targetStatus, reason });
    }
  };

  const handleOpenTokModal = (item: any) => {
    setTokRecord(item);
    setTokForm({
      tokAdesh: item.tokAdesh || '',
      assignedBranch: item.assignedBranch || item.department || 'प्रशासन तथा सामान्य सेवा शाखा',
      assignedOfficer: item.assignedOfficer || '',
      deadlineDate: item.deadlineDate || '',
      priority: item.priority || item.classification || 'साधारण',
      tokGivenBy: item.tokGivenBy || 'प्रमुख प्रशासकीय अधिकृत',
      tokDate: item.tokDate || 'मिति उपलब्ध छैन',
    });
    setShowTokModal(true);
  };

  const handleSaveTokAadesh = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokForm.tokAdesh.trim()) {
      alert('तोक आदेश / निर्देशन विवरण अनिवार्य छ।');
      return;
    }
    if (tokRecord) {
      tokAadeshMutation.mutate({
        id: tokRecord.id,
        data: tokForm,
      });
    }
  };

  const handleOpenLetterModal = (item: any) => {
    setLetterRecord(item);
    setLetterContent(
      item.letterBody ||
        `महोदय,\n\nउपरोक्त सम्बन्धमा प्रस्तुत गाउँपालिकाको निर्णयानुसार अनुरोध भएबमोजिम यस कार्यालयबाट आवश्यक कार्यान्वयनका लागि यो पत्र प्रेषित गरिएको छ।\n\nयस पत्रको आधिकारिकता माथि रहेको वा तल उल्लेखित प्रमाणीकरण QR कोड स्क्यान गरी गाउँपालिकाको आधिकारिक डिजिटल ट्विन प्रणालीबाट तुरुन्त जाँच्न सकिनेछ।`
    );
    setShowLetterModal(true);
  };

  const handleOpenSlipModal = (item: any) => {
    setSlipRecord(item);
    setShowSlipModal(true);
  };

  const handleVerifySearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!verifySearchCode.trim()) return;
    setIsVerifying(true);
    setVerificationResult(null);
    try {
      const res: any = await dartaChalaniApi.verifyRecord(verifySearchCode.trim());
      setVerificationResult(res);
    } catch (err: any) {
      setVerificationResult({ verified: false, message: 'प्रमाणीकरण असफल भयो वा कोड अमान्य छ।' });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleEditClick = (item: any, type?: 'darta' | 'chalani') => {
    if (item.approvalStatus === 'approved') {
      alert('यो पत्र स्विकृत भइसकेकोले सुरक्षित छ। सम्पादन (Edit) गर्नका लागि पहिले अस्विकृत (Revert Approval) गर्नुहोस्।');
      return;
    }
    const editType = type || (item.dispatchNo ? 'chalani' : 'darta');
    setActiveTab(editType);
    setEditingRecord(item);
    setFormError('');
    setFormSuccess(false);

    const now = new Date();
    const todayBs = getInitialTodayBs();

    setFormData({
      registrationNo: toNepaliDigits(item.registrationNo || item.dartaNo || ''),
      dispatchNo: toNepaliDigits(item.dispatchNo || ''),
      subject: item.subject || '',
      senderOrganization: item.senderName || item.senderOrganization || '',
      senderAddress: item.senderAddress || '',
      senderContact: item.senderContact || '',
      recipientOrganization: item.receiverName || item.receiver || '',
      recipientAddress: item.receiverAddress || '',
      recipientContact: item.receiverContact || '',
      letterNo: toNepaliDigits(item.letterRefNo || item.letterNo || ''),
      senderChalaniNo: toNepaliDigits(item.senderChalaniNo || ''),
      letterDateBs: toNepaliDigits(item.letterDate || item.registeredDate || item.dispatchDate || todayBs),
      letterDateAd: item.registeredDateAd || item.dispatchDateAd || now.toISOString().split('T')[0],
      entryDateBs: toNepaliDigits(item.registeredDate || item.dispatchDate || todayBs),
      entryTime: formatNepaliTime(item.registeredTime || item.dispatchTime || getCurrentTimeStr()),
      department: item.department || item.assignedBranch || 'प्रशासन तथा सामान्य सेवा शाखा',
      assignedOfficer: item.assignedOfficer || '',
      remarks: item.remarks || '',
      classification: item.classification || item.priority || 'साधारण',
      deliveryMethod: item.deliveryMethod || 'हातै',
      pageCount: toNepaliDigits(item.pageCount || '१'),
      signedBy: item.signedBy || 'प्रमुख प्रशासकीय अधिकृत',
    });

    setShowModal(true);
  };

  const handleViewDetails = (item: any) => {
    setSelectedRecord(item);
    setShowDetailsModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (activeTab === 'darta') {
      if (!formData.registrationNo?.trim()) {
        setFormError('दर्ता नम्बर अनिवार्य छ।');
        return;
      }
      if (!formData.senderOrganization.trim()) {
        setFormError('पठाउने कार्यालय वा व्यक्तिको नाम अनिवार्य छ।');
        return;
      }
    } else {
      if (!formData.dispatchNo?.trim()) {
        setFormError('चलानी नम्बर अनिवार्य छ।');
        return;
      }
      if (!formData.recipientOrganization.trim()) {
        setFormError('पाउने कार्यालय वा व्यक्तिको नाम अनिवार्य छ।');
        return;
      }
    }

    if (!formData.subject.trim()) {
      setFormError('पत्रको विषय अनिवार्य छ।');
      return;
    }

    const toEnDigits = (str: string) => (str || '').replace(/[०-९]/g, d => '०१२३४५६७८९'.indexOf(d).toString());
    const parsedPageCount = parseInt(toEnDigits(formData.pageCount || '1'), 10) || 1;

    try {
      if (editingRecord) {
        if (activeTab === 'darta') {
          await dartaChalaniApi.updateDarta(editingRecord.id, {
            registrationNo: formData.registrationNo.trim(),
            registeredDate: formData.entryDateBs || 'मिति उपलब्ध छैन',
            registeredDateAd: formData.letterDateAd,
            registeredTime: formData.entryTime,
            subject: formData.subject,
            senderName: formData.senderOrganization,
            senderAddress: formData.senderAddress,
            senderContact: formData.senderContact,
            senderChalaniNo: formData.senderChalaniNo,
            letterRefNo: formData.letterNo || formData.registrationNo.trim(),
            letterDate: formData.letterDateBs,
            department: formData.department,
            assignedBranch: formData.department,
            assignedOfficer: formData.assignedOfficer,
            classification: formData.classification,
            priority: formData.classification,
            deliveryMethod: formData.deliveryMethod,
            pageCount: parsedPageCount,
            remarks: formData.remarks,
          });
        } else {
          await dartaChalaniApi.updateChalani(editingRecord.id, {
            dispatchNo: formData.dispatchNo.trim(),
            dispatchDate: formData.entryDateBs || 'मिति उपलब्ध छैन',
            dispatchDateAd: formData.letterDateAd,
            dispatchTime: formData.entryTime,
            subject: formData.subject,
            receiverName: formData.recipientOrganization,
            receiverAddress: formData.recipientAddress,
            receiverContact: formData.recipientContact,
            letterRefNo: formData.dispatchNo.trim(),
            department: formData.department,
            signedBy: formData.signedBy || 'प्रमुख प्रशासकीय अधिकृत',
            classification: formData.classification,
            priority: formData.classification,
            deliveryMethod: formData.deliveryMethod,
            pageCount: parsedPageCount,
            remarks: formData.remarks,
          });
        }
      } else {
        if (activeTab === 'darta') {
          await dartaChalaniApi.createDarta({
            registrationNo: formData.registrationNo.trim(),
            registeredDate: formData.entryDateBs || 'मिति उपलब्ध छैन',
            registeredDateAd: formData.letterDateAd,
            registeredTime: formData.entryTime,
            subject: formData.subject,
            senderName: formData.senderOrganization,
            senderAddress: formData.senderAddress,
            senderContact: formData.senderContact,
            senderChalaniNo: formData.senderChalaniNo,
            letterRefNo: formData.letterNo || formData.registrationNo.trim(),
            letterDate: formData.letterDateBs,
            department: formData.department,
            assignedBranch: formData.department,
            assignedOfficer: formData.assignedOfficer,
            classification: formData.classification,
            priority: formData.classification,
            deliveryMethod: formData.deliveryMethod,
            pageCount: parsedPageCount,
            remarks: formData.remarks,
            fiscalYear: activeFiscalYear,
          });
        } else {
          await dartaChalaniApi.createChalani({
            dispatchNo: formData.dispatchNo.trim(),
            dispatchDate: formData.entryDateBs || 'मिति उपलब्ध छैन',
            dispatchDateAd: formData.letterDateAd,
            dispatchTime: formData.entryTime,
            subject: formData.subject,
            receiverName: formData.recipientOrganization,
            receiverAddress: formData.recipientAddress,
            receiverContact: formData.recipientContact,
            letterRefNo: formData.dispatchNo.trim(), // Patra Sankhya is Chalani number itself
            department: formData.department,
            signedBy: formData.signedBy || 'प्रमुख प्रशासकीय अधिकृत',
            classification: formData.classification,
            priority: formData.classification,
            deliveryMethod: formData.deliveryMethod,
            pageCount: parsedPageCount,
            remarks: formData.remarks,
            fiscalYear: activeFiscalYear,
          });
        }
      }

      setFormSuccess(true);
      queryClient.invalidateQueries({ queryKey: ['darta-list'] });
      queryClient.invalidateQueries({ queryKey: ['chalani-list'] });
      setTimeout(() => {
        setShowModal(false);
        resetForm();
      }, 1000);
    } catch (err: any) {
      setFormError(err?.message || 'सुरक्षित गर्न सकिएन');
    }
  };

  const filteredDarta = useMemo(() => {
    return dartaList.filter((d: any) => {
      if (branchFilter && (d.assignedBranch !== branchFilter && d.department !== branchFilter)) return false;
      if (statusFilter && d.status !== statusFilter) return false;
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      const nepTerm = toNepaliDigits(term);
      const enTerm = toEnglishDigits(term);
      const subject = (d.subject || '').toLowerCase();
      const sender = (d.senderName || d.senderOrganization || '').toLowerCase();
      const no = (d.registrationNo || d.dartaNo || '').toString().toLowerCase();
      const ref = (d.letterRefNo || d.letterNo || '').toLowerCase();
      const vCode = (d.verificationCode || '').toLowerCase();
      return (
        subject.includes(term) ||
        sender.includes(term) ||
        no.includes(term) ||
        no.includes(nepTerm) ||
        no.includes(enTerm) ||
        ref.includes(term) ||
        vCode.includes(term)
      );
    });
  }, [dartaList, searchTerm, branchFilter, statusFilter]);

  const filteredChalani = useMemo(() => {
    return chalaniList.filter((c: any) => {
      if (branchFilter && c.department !== branchFilter) return false;
      if (statusFilter && c.status !== statusFilter) return false;
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      const nepTerm = toNepaliDigits(term);
      const enTerm = toEnglishDigits(term);
      const subject = (c.subject || '').toLowerCase();
      const rec = (c.receiverName || c.receiver || c.recipientOrganization || '').toLowerCase();
      const no = (c.dispatchNo || c.chalaniNo || '').toString().toLowerCase();
      const vCode = (c.verificationCode || '').toLowerCase();
      return (
        subject.includes(term) ||
        rec.includes(term) ||
        no.includes(term) ||
        no.includes(nepTerm) ||
        no.includes(enTerm) ||
        vCode.includes(term)
      );
    });
  }, [chalaniList, searchTerm, branchFilter, statusFilter]);

  const stats = useMemo(() => {
    const totalDarta = dartaList.length;
    const totalChalani = chalaniList.length;
    const allRecords = [...dartaList, ...chalaniList];
    const approvedCount = allRecords.filter((r: any) => r.approvalStatus === 'approved').length;
    const pendingCount = allRecords.filter((r: any) => r.approvalStatus !== 'approved' && r.approvalStatus !== 'rejected').length;
    return {
      totalDarta,
      totalChalani,
      approvedCount,
      pendingCount,
    };
  }, [dartaList, chalaniList]);

  const handleExportCsv = () => {
    if (activeTab === 'darta') {
      const headers = ['दर्ता नं.', 'दर्ता मिति (BS)', 'दर्ता मिति (AD)', 'पठाउने कार्यालय/व्यक्ति', 'ठेगाना', 'सम्पर्क नं.', 'प्राप्त चलानी नं.', 'पत्र संख्या', 'विषय', 'तोकिएको शाखा', 'कर्मचारी', 'स्थिति', 'स्वीकृति स्थिति', 'प्रमाणीकरण कोड'];
      const rows = filteredDarta.map((d: any) => [
        `"${d.registrationNo || ''}"`,
        `"${d.registeredDate || ''}"`,
        `"${d.registeredDateAd || ''}"`,
        `"${d.senderName || ''}"`,
        `"${d.senderAddress || ''}"`,
        `"${d.senderContact || ''}"`,
        `"${d.senderChalaniNo || ''}"`,
        `"${d.letterRefNo || ''}"`,
        `"${(d.subject || '').replace(/"/g, '""')}"`,
        `"${d.assignedBranch || d.department || ''}"`,
        `"${d.assignedOfficer || ''}"`,
        `"${d.status || ''}"`,
        `"${d.approvalStatus || ''}"`,
        `"${d.verificationCode || ''}"`,
      ]);
      const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `Panchpokhari_Darta_Register_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const headers = ['चलानी नं.', 'चलानी मिति (BS)', 'चलानी मिति (AD)', 'पाउने कार्यालय/व्यक्ति', 'ठेगाना', 'सम्पर्क नं.', 'पत्र संख्या', 'विषय', 'पठाउने शाखा', 'हस्ताक्षरकर्ता', 'स्थिति', 'स्वीकृति स्थिति', 'प्रमाणीकरण कोड'];
      const rows = filteredChalani.map((c: any) => [
        `"${c.dispatchNo || ''}"`,
        `"${c.dispatchDate || ''}"`,
        `"${c.dispatchDateAd || ''}"`,
        `"${c.receiverName || c.receiver || ''}"`,
        `"${c.receiverAddress || ''}"`,
        `"${c.receiverContact || ''}"`,
        `"${c.letterRefNo || ''}"`,
        `"${(c.subject || '').replace(/"/g, '""')}"`,
        `"${c.department || ''}"`,
        `"${c.signedBy || ''}"`,
        `"${c.status || ''}"`,
        `"${c.approvalStatus || ''}"`,
        `"${c.verificationCode || ''}"`,
      ]);
      const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `Panchpokhari_Chalani_Register_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const renderApprovalBadge = (status?: string) => {
    if (status === 'approved') {
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 9px', borderRadius: '6px', fontSize: '0.74rem', fontWeight: 700, backgroundColor: '#dcfce7', color: '#166534', border: '1px solid #86efac' }}>
          ✓ स्वीकृत (Approved)
        </span>
      );
    }
    if (status === 'rejected') {
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 9px', borderRadius: '6px', fontSize: '0.74rem', fontWeight: 700, backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5' }}>
          ✕ अस्वीकृत (Rejected)
        </span>
      );
    }
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 9px', borderRadius: '6px', fontSize: '0.74rem', fontWeight: 700, backgroundColor: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' }}>
        ⏱ पेश भएको (Pending)
      </span>
    );
  };

  const getPriorityBadge = (p?: string) => {
    if (p === 'अति जरुरी' || p === 'तुरुन्त') {
      return <span style={{ padding: '2px 7px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700, backgroundColor: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5' }}>अति जरुरी</span>;
    }
    if (p === 'जरुरी') {
      return <span style={{ padding: '2px 7px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700, backgroundColor: '#fef3c7', color: '#b45309', border: '1px solid #fde68a' }}>जरुरी</span>;
    }
    return <span style={{ padding: '2px 7px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600, backgroundColor: '#f1f5f9', color: '#475569', border: '1.5px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>साधारण</span>;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', fontFamily: 'Outfit, "Noto Sans Devanagari", sans-serif' }}>
      {/* ─── 1. TOP HERO BANNER (नेपाल सरकार मानक डिजिटल ब्यानर) ─── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 55%, #0284c7 100%)',
          borderRadius: '18px',
          padding: '1.75rem 2rem',
          color: '#ffffff',
          boxShadow: '0 10px 30px -5px rgba(15, 23, 42, 0.35)',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1.25rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative background glow */}
        <div
          style={{
            position: 'absolute',
            right: '-50px',
            bottom: '-50px',
            width: '220px',
            height: '220px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(56, 189, 248, 0.2) 0%, rgba(255,255,255,0) 70%)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ zIndex: 1, maxWidth: '720px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.6rem', flexWrap: 'wrap' }}>
            <span style={{ backgroundColor: 'rgba(239, 68, 68, 0.25)', color: '#fca5a5', border: '1px solid rgba(239, 68, 68, 0.4)', padding: '0.2rem 0.65rem', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700 }}>
              🇳🇵 नेपाल सरकार मानक
            </span>
            <span style={{ backgroundColor: 'rgba(16, 185, 129, 0.25)', color: '#6ee7b7', border: '1px solid rgba(16, 185, 129, 0.4)', padding: '0.2rem 0.65rem', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700 }}>
              DoIT NeGIF Standard
            </span>
            <span style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#e2e8f0', padding: '0.2rem 0.65rem', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 600 }}>
              आ.व. {activeFiscalYear}
            </span>
          </div>

          <h1 style={{ fontSize: '1.85rem', fontWeight: 900, margin: '0 0 0.4rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem', letterSpacing: '-0.01em', lineHeight: 1.2 }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.25)' }}>
              <FileText size={26} color="#ffffff" />
            </div>
            <span>डिजिटल दर्ता तथा चलानी व्यवस्थापन प्रणाली</span>
          </h1>

          <p style={{ margin: 0, opacity: 0.9, fontSize: '0.92rem', lineHeight: 1.5 }}>
            पाँचपोखरी थाङपाल गाउँपालिका — अधिकारिक तोक आदेश, सरकारी लेटरहेड, डिजिटल QR प्रमाणीकरण र नागरिक पावती रसिद
          </p>
        </div>

        {/* Action Buttons in Hero */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem', zIndex: 1 }}>
          <button
            onClick={() => openNewModal('darta')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.88rem',
              padding: '0.65rem 1.15rem',
              borderRadius: '10px',
              border: '1px solid rgba(255,255,255,0.25)',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
              transition: 'all 0.2s ease',
            }}
          >
            <Plus size={18} />
            <span>+ नयाँ दर्ता (Inward)</span>
          </button>

          <button
            onClick={() => openNewModal('chalani')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.88rem',
              padding: '0.65rem 1.15rem',
              borderRadius: '10px',
              border: '1px solid rgba(255,255,255,0.25)',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
              transition: 'all 0.2s ease',
            }}
          >
            <Send size={16} />
            <span>+ नयाँ चलानी (Outward)</span>
          </button>

          <button
            onClick={() => { setVerifySearchCode(''); setVerificationResult(null); setShowVerifyModal(true); }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'rgba(255,255,255,0.14)',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '0.88rem',
              padding: '0.65rem 1rem',
              borderRadius: '10px',
              border: '1px solid rgba(255,255,255,0.25)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <ShieldCheck size={17} />
            <span>पत्र प्रमाणीकरण (QR)</span>
          </button>

          <button
            onClick={handleExportCsv}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'rgba(255,255,255,0.14)',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '0.88rem',
              padding: '0.65rem 1rem',
              borderRadius: '10px',
              border: '1px solid rgba(255,255,255,0.25)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            title="वर्तमान सूची Excel/CSV मा डाउनलोड गर्नुहोस्"
          >
            <Download size={16} />
            <span>CSV निर्यात</span>
          </button>
        </div>
      </div>

      {/* ─── 2. FOUR KPI STATISTIC CARDS (आधुनिक तथ्याङ्क कार्डहरू) ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        {/* Card 1: Total Darta */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '1.25rem 1.5rem',
            border: '1.5px solid #e2e8f0',
            boxShadow: '0 4px 12px rgba(15, 23, 42, 0.04)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', backgroundColor: '#2563eb' }} />
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>कुल दर्ता पत्र (Inward)</div>
            <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#1e3a8a', margin: '4px 0 2px' }}>{toNepaliDigits(stats.totalDarta)}</div>
            <div style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 600 }}>आ.व. {toNepaliDigits(activeFiscalYear)} अभिलेख</div>
          </div>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Inbox size={26} />
          </div>
        </div>

        {/* Card 2: Total Chalani */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '1.25rem 1.5rem',
            border: '1.5px solid #e2e8f0',
            boxShadow: '0 4px 12px rgba(15, 23, 42, 0.04)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', backgroundColor: '#16a34a' }} />
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>कुल चलानी पत्र (Outward)</div>
            <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#14532d', margin: '4px 0 2px' }}>{toNepaliDigits(stats.totalChalani)}</div>
            <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600 }}>बाहिर पठाइएका पत्राचार</div>
          </div>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Send size={24} />
          </div>
        </div>

        {/* Card 3: Approved & Executed */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '1.25rem 1.5rem',
            border: '1.5px solid #e2e8f0',
            boxShadow: '0 4px 12px rgba(15, 23, 42, 0.04)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', backgroundColor: '#8b5cf6' }} />
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>स्वीकृत / फर्स्यौट</div>
            <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#581c87', margin: '4px 0 2px' }}>{toNepaliDigits(stats.approvedCount)}</div>
            <div style={{ fontSize: '0.75rem', color: '#7c3aed', fontWeight: 600 }}>तोक आदेश कार्यान्वयन सम्पन्न</div>
          </div>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#faf5ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle size={26} />
          </div>
        </div>

        {/* Card 4: Pending Action */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '1.25rem 1.5rem',
            border: '1.5px solid #e2e8f0',
            boxShadow: '0 4px 12px rgba(15, 23, 42, 0.04)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', backgroundColor: '#f59e0b' }} />
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>विचाराधीन / कारबाहीमा</div>
            <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#78350f', margin: '4px 0 2px' }}>{toNepaliDigits(stats.pendingCount)}</div>
            <div style={{ fontSize: '0.75rem', color: '#d97706', fontWeight: 600 }}>तोक आदेश वा फर्स्यौट बाँकी</div>
          </div>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#fffbeb', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={26} />
          </div>
        </div>
      </div>

      {/* ─── ENTRY MODAL (नयाँ दर्ता / चलानी प्रविष्टि फाराम) ─── */}
      {showModal && (
        <div
          className="modal-backdrop"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.72)',
            backdropFilter: 'blur(8px)',
            zIndex: 1050,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) { setShowModal(false); resetForm(); } }}
        >
          <div
            className="modal-panel"
            style={{
              maxWidth: '1060px',
              width: '96vw',
              borderRadius: '16px',
              backgroundColor: '#ffffff',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.45)',
              border: '1.5px solid #cbd5e1',
              outline: 'none',
              color: '#0f172a',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Header: Compact, Sleek */}
            <div
              style={{
                padding: '0.6rem 1.25rem',
                borderBottom: '1px solid rgba(255,255,255,0.15)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: editingRecord
                  ? 'linear-gradient(135deg, #4338ca 0%, #6366f1 100%)'
                  : activeTab === 'darta'
                  ? 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)'
                  : 'linear-gradient(135deg, #065f46 0%, #059669 100%)',
                color: '#ffffff',
                borderTopLeftRadius: '16px',
                borderTopRightRadius: '16px',
                flexShrink: 0,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {editingRecord ? <Edit2 size={16} /> : activeTab === 'darta' ? <Inbox size={18} /> : <Send size={16} />}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h2 style={{ fontSize: '1.02rem', fontWeight: 800, margin: 0, letterSpacing: '-0.01em' }}>
                      {editingRecord
                        ? (activeTab === 'darta' ? `दर्ता विवरण सम्पादन (दर्ता नं. ${formData.registrationNo || '१'})` : `चलानी विवरण सम्पादन (चलानी नं. ${formData.dispatchNo || '१'})`)
                        : (activeTab === 'darta' ? 'नयाँ दर्ता प्रविष्टि' : 'नयाँ चलानी प्रविष्टि')}
                    </h2>
                    <span style={{ backgroundColor: 'rgba(255,255,255,0.22)', padding: '1px 8px', borderRadius: '10px', fontSize: '0.68rem', fontWeight: 700 }}>
                      🇳🇵 नेपाल सरकार मानक
                    </span>
                  </div>
                  <div style={{ fontSize: '0.72rem', opacity: 0.9 }}>
                    {editingRecord
                      ? 'अभिलेखको विवरण सच्याई सुरक्षित गर्नुहोस्'
                      : activeTab === 'darta'
                      ? 'आन्तरिक तथा बाह्य कार्यालयबाट प्राप्त पत्र दर्ता'
                      : 'कार्यालयबाट अन्य निकाय/व्यक्तिमा पठाइने पत्र चलानी'}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => { setShowModal(false); resetForm(); }}
                style={{
                  background: 'rgba(255,255,255,0.18)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '30px',
                  height: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#ffffff',
                  transition: 'all 0.2s ease',
                }}
                title="फाराम बन्द गर्नुहोस्"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form Container with 2 Balanced Columns */}
            <form
              onSubmit={handleSubmit}
              style={{
                padding: '0.75rem 1.15rem 0.65rem 1.15rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.55rem',
                overflow: 'visible',
              }}
            >
              {formError && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#fee2e2', color: '#991b1b', padding: '0.35rem 0.75rem', borderRadius: '6px', fontSize: '0.8rem' }}>
                  <AlertCircle size={15} /><span>{formError}</span>
                </div>
              )}
              {formSuccess && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#dcfce7', color: '#166534', padding: '0.35rem 0.75rem', borderRadius: '6px', fontSize: '0.8rem' }}>
                  <CheckCircle size={15} /><span>सफलतापूर्वक सुरक्षित गरियो!</span>
                </div>
              )}

              {/* 2-COLUMN MAIN BODY */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', alignItems: 'stretch' }}>
                {/* ── LEFT COLUMN ── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                  {/* SECTION 1: Number & Date (2 rows, 2 cols each so NO CLIPPING) */}
                  <div style={{ padding: '0.55rem 0.75rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1.5px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 800, color: activeTab === 'darta' ? '#1d4ed8' : '#15803d', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Hash size={14} />
                      <span>खण्ड १: {activeTab === 'darta' ? 'दर्ता' : 'चलानी'} नम्बर तथा मिति विवरण</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      {/* Row 1: Reg/Dispatch No + Fiscal Year */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '0.5rem' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: 800, color: activeTab === 'darta' ? '#1e3a8a' : '#14532d' }}>
                              {activeTab === 'darta' ? 'दर्ता नं. *' : 'चलानी नं. *'}
                            </label>
                            <span style={{ fontSize: '0.6rem', fontWeight: 700, backgroundColor: activeTab === 'darta' ? '#dbeafe' : '#dcfce7', color: activeTab === 'darta' ? '#1d4ed8' : '#15803d', padding: '0 4px', borderRadius: '3px' }}>
                              स्वत: सिफारिस
                            </span>
                          </div>
                          <input
                            className="dt-input"
                            style={{
                              height: '32px',
                              fontWeight: 800,
                              fontSize: '0.95rem',
                              color: activeTab === 'darta' ? '#1e3a8a' : '#14532d',
                              backgroundColor: '#ffffff',
                              borderColor: activeTab === 'darta' ? '#93c5fd' : '#86efac',
                              padding: '0 8px',
                            }}
                            placeholder="१"
                            value={activeTab === 'darta' ? formData.registrationNo : formData.dispatchNo}
                            onChange={e => {
                              const nepVal = toNepaliDigits(e.target.value);
                              if (activeTab === 'darta') setFormData({ ...formData, registrationNo: nepVal });
                              else setFormData({ ...formData, dispatchNo: nepVal });
                            }}
                            required
                          />
                        </div>

                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155' }}>आर्थिक वर्ष</label>
                            <span style={{ fontSize: '0.6rem', fontWeight: 700, backgroundColor: '#dcfce7', color: '#15803d', padding: '0 4px', borderRadius: '3px' }}>सक्रिय</span>
                          </div>
                          <div
                            className="dt-input"
                            style={{
                              height: '32px',
                              backgroundColor: '#f8fafc',
                              color: '#0f172a',
                              fontWeight: 700,
                              fontSize: '0.84rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'not-allowed',
                              border: '1.5px solid #cbd5e1',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                              outline: 'none',
                              padding: '0 6px',
                            }}
                            title="हाल पालिकामा सक्रिय रहेको चालू आर्थिक वर्ष"
                          >
                            <span>{activeFiscalYear}</span>
                          </div>
                        </div>
                      </div>

                      {/* Row 2: Date BS (wide!) + Time */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.5rem' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155' }}>
                              {activeTab === 'darta' ? 'दर्ता मिति *' : 'चलानी मिति *'}
                            </label>
                            <button
                              type="button"
                              onClick={() => openBsCalendar('entry')}
                              style={{ fontSize: '0.6rem', fontWeight: 700, backgroundColor: '#eff6ff', color: '#1d4ed8', padding: '0 4px', borderRadius: '3px', border: '1px solid #bfdbfe', cursor: 'pointer' }}
                              title="नेपाली पात्रो खोल्नुहोस्"
                            >
                              पात्रो
                            </button>
                          </div>
                          <div style={{ display: 'flex', gap: '2px' }}>
                            <input
                              className="dt-input"
                              style={{ height: '32px', fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', flex: 1, padding: '0 6px', cursor: 'pointer' }}
                              placeholder="२०८१-०५-२०"
                              value={formData.entryDateBs}
                              onClick={() => openBsCalendar('entry')}
                              readOnly
                              required
                            />
                            <button
                              type="button"
                              onClick={() => openBsCalendar('entry')}
                              style={{
                                height: '32px',
                                width: '32px',
                                minWidth: '32px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: activeTab === 'darta' ? '#eff6ff' : '#f0fdf4',
                                border: activeTab === 'darta' ? '1px solid #93c5fd' : '1px solid #86efac',
                                borderRadius: '6px',
                                color: activeTab === 'darta' ? '#1d4ed8' : '#15803d',
                                cursor: 'pointer',
                                padding: 0,
                              }}
                              title="नेपाली पात्रो खोल्नुहोस्"
                            >
                              <Calendar size={14} />
                            </button>
                          </div>
                        </div>

                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155' }}>समय</label>
                            <button
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  entryTime: getCurrentTimeStr()
                                }));
                              }}
                              style={{ fontSize: '0.6rem', fontWeight: 700, backgroundColor: '#f1f5f9', color: '#475569', padding: '0 4px', borderRadius: '3px', border: '1.5px solid #e2e8f0', cursor: 'pointer' }}
                              title="हालको नेपाली समय सेट गर्नुहोस्"
                            >
                              अहिले
                            </button>
                          </div>
                          <div style={{ display: 'flex', gap: '2px' }}>
                            <input
                              className="dt-input"
                              style={{ height: '32px', fontSize: '0.82rem', fontWeight: 600, color: '#0f172a', flex: 1, padding: '0 6px' }}
                              placeholder="१०:३० पूर्वाह्न"
                              value={formData.entryTime}
                              onChange={e => setFormData({ ...formData, entryTime: toNepaliDigits(e.target.value) })}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  entryTime: getCurrentTimeStr()
                                }));
                              }}
                              style={{
                                height: '32px',
                                width: '30px',
                                minWidth: '30px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: '#f8fafc',
                                border: '1.5px solid #cbd5e1',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                                outline: 'none',
                                borderRadius: '6px',
                                color: '#475569',
                                cursor: 'pointer',
                                padding: 0,
                              }}
                              title="घडी समय अपडेट गर्नुहोस्"
                            >
                              <Clock size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SECTION 2: Sender / Recipient Details (3 clean rows) */}
                  <div style={{ padding: '0.55rem 0.75rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1.5px solid #e2e8f0', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#334155', marginBottom: '0.15rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Building size={14} />
                      <span>खण्ड २: {activeTab === 'darta' ? 'पठाउने कार्यालय वा व्यक्तिको विवरण' : 'पाउने कार्यालय वा व्यक्तिको विवरण'}</span>
                    </div>

                    {/* Sender / Recipient Name */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#334155', marginBottom: '2px' }}>
                        {activeTab === 'darta' ? 'पठाउने कार्यालय, निकाय वा सेवाग्राहीको नाम *' : 'पाउने कार्यालय, निकाय वा व्यक्तिको नाम *'}
                      </label>
                      <input
                        className="dt-input"
                        style={{ height: '32px', fontSize: '0.84rem', padding: '0 8px' }}
                        placeholder={activeTab === 'darta' ? 'उदा. गृह मन्त्रालय, सिंहदरबार / श्री राम बहादुर श्रेष्ठ' : 'उदा. सहरी विकास तथा भवन निर्माण विभाग, बबरमहल'}
                        value={activeTab === 'darta' ? formData.senderOrganization : formData.recipientOrganization}
                        onChange={e => {
                          if (activeTab === 'darta') setFormData({ ...formData, senderOrganization: e.target.value });
                          else setFormData({ ...formData, recipientOrganization: e.target.value });
                        }}
                        required
                      />
                    </div>

                    {/* Address (Full width) */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: '#334155', marginBottom: '2px' }}>ठेगाना (Address)</label>
                      <input
                        className="dt-input"
                        style={{ height: '32px', fontSize: '0.84rem', padding: '0 8px' }}
                        placeholder={activeTab === 'darta' ? 'उदा. काठमाडौं / वडा नं. ४' : 'उदा. बबरमहल, काठमाडौं'}
                        value={activeTab === 'darta' ? formData.senderAddress : formData.recipientAddress}
                        onChange={e => {
                          if (activeTab === 'darta') setFormData({ ...formData, senderAddress: e.target.value });
                          else setFormData({ ...formData, recipientAddress: e.target.value });
                        }}
                      />
                    </div>

                    {/* Darta Specific: Sender Chalani No & Letter Date */}
                    {activeTab === 'darta' ? (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: '#334155', marginBottom: '2px' }}>प्राप्त पत्रको चलानी नं.</label>
                          <input
                            className="dt-input"
                            style={{ height: '32px', fontSize: '0.84rem', padding: '0 8px' }}
                            placeholder="उदा. ४५२ / ख-१"
                            value={formData.senderChalaniNo}
                            onChange={e => setFormData({ ...formData, senderChalaniNo: toNepaliDigits(e.target.value) })}
                          />
                        </div>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                            <label style={{ fontSize: '0.74rem', fontWeight: 600, color: '#334155' }}>पत्रको मिति</label>
                            <button
                              type="button"
                              onClick={() => openBsCalendar('letter')}
                              style={{ fontSize: '0.6rem', fontWeight: 700, backgroundColor: '#eff6ff', color: '#1d4ed8', padding: '0 4px', borderRadius: '3px', border: '1px solid #bfdbfe', cursor: 'pointer' }}
                              title="नेपाली पात्रो खोल्नुहोस्"
                            >
                              पात्रो
                            </button>
                          </div>
                          <div style={{ display: 'flex', gap: '2px' }}>
                            <input
                              className="dt-input"
                              style={{ height: '32px', fontSize: '0.84rem', fontWeight: 600, color: '#0f172a', flex: 1, padding: '0 6px', cursor: 'pointer' }}
                              placeholder="२०८१-०५-२५"
                              value={formData.letterDateBs}
                              onClick={() => openBsCalendar('letter')}
                              readOnly
                            />
                            <button
                              type="button"
                              onClick={() => openBsCalendar('letter')}
                              style={{
                                height: '32px',
                                width: '30px',
                                minWidth: '30px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: '#eff6ff',
                                border: '1px solid #93c5fd',
                                borderRadius: '6px',
                                color: '#1d4ed8',
                                cursor: 'pointer',
                                padding: 0,
                              }}
                              title="पत्रको मिति छान्नुहोस्"
                            >
                              <Calendar size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: '#334155', marginBottom: '2px' }}>बोधार्थ / अतिरिक्त जानकारी</label>
                        <input
                          className="dt-input"
                          style={{ height: '32px', fontSize: '0.84rem', padding: '0 8px' }}
                          placeholder="बोधार्थ वा पठाउने निकायको थप विवरण..."
                          value={formData.senderChalaniNo}
                          onChange={e => setFormData({ ...formData, senderChalaniNo: e.target.value })}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* ── RIGHT COLUMN: Section 3 Letter & Branch Details ── */}
                <div style={{ padding: '0.55rem 0.75rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1.5px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#334155', marginBottom: '0.15rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FileText size={14} />
                    <span>खण्ड ३: पत्र तथा शाखा सम्बन्धी विवरण</span>
                  </div>

                  {/* Subject */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#334155', marginBottom: '2px' }}>पत्रको विषय (Subject) *</label>
                    <input
                      className="dt-input"
                      style={{ height: '32px', fontSize: '0.84rem', padding: '0 8px' }}
                      placeholder="पत्रको मुख्य विषय स्पष्ट रूपमा लेख्नुहोस्..."
                      value={formData.subject}
                      onChange={e => setFormData({ ...formData, subject: e.target.value })}
                      required
                    />
                  </div>

                  {/* Branch / Section (Full width, Letter Ref No hidden per user request) */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: '#334155', marginBottom: '2px' }}>
                      {activeTab === 'darta' ? 'सम्बन्धित शाखा / फाँट *' : 'पठाउने शाखा / फाँट *'}
                    </label>
                    <select
                      className="dt-select"
                      style={{ width: '100%', height: '32px', fontSize: '0.8rem', padding: '0 6px' }}
                      value={formData.department}
                      onChange={e => setFormData({ ...formData, department: e.target.value })}
                    >
                      {BRANCH_OPTIONS.map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>

                  {/* Priority & Delivery (2 wide columns so options never clip!) */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.5rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: '#334155', marginBottom: '2px' }}>प्राथमिकता (Priority)</label>
                      <select
                        className="dt-select"
                        style={{ width: '100%', height: '32px', fontSize: '0.8rem', padding: '0 6px' }}
                        value={formData.classification}
                        onChange={e => setFormData({ ...formData, classification: e.target.value })}
                      >
                        <option value="साधारण">साधारण (Ordinary)</option>
                        <option value="जरुरी">जरुरी (Urgent)</option>
                        <option value="तुरुन्त">तुरुन्त (Immediate)</option>
                        <option value="अति जरुरी">अति जरुरी (Most Urgent)</option>
                        <option value="गोप्य">गोप्य (Confidential)</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: '#334155', marginBottom: '2px' }}>माध्यम (Delivery)</label>
                      <select
                        className="dt-select"
                        style={{ width: '100%', height: '32px', fontSize: '0.8rem', padding: '0 6px' }}
                        value={formData.deliveryMethod}
                        onChange={e => setFormData({ ...formData, deliveryMethod: e.target.value })}
                      >
                        <option value="हातै">हातै (By Hand)</option>
                        <option value="हुलाक">हुलाक (Postal)</option>
                        <option value="इमेल">इमेल (Email)</option>
                        <option value="फ्याक्स">फ्याक्स (Fax)</option>
                        <option value="कुरियर">कुरियर (Courier)</option>
                      </select>
                    </div>
                  </div>

                  {/* Pages & Officer / Signatory */}
                  <div style={{ display: 'grid', gridTemplateColumns: '0.7fr 1.3fr', gap: '0.5rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: '#334155', marginBottom: '2px' }}>पाना (Pages)</label>
                      <input
                        type="text"
                        className="dt-input"
                        style={{ height: '32px', fontSize: '0.84rem', padding: '0 6px' }}
                        placeholder="१"
                        value={formData.pageCount}
                        onChange={e => setFormData({ ...formData, pageCount: toNepaliDigits(e.target.value) })}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: '#334155', marginBottom: '2px' }}>
                        {activeTab === 'darta' ? 'जिम्मेवार कर्मचारी / फाँटवाला' : 'हस्ताक्षर गर्ने अधिकारी / पद'}
                      </label>
                      <input
                        className="dt-input"
                        style={{ height: '32px', fontSize: '0.84rem', padding: '0 8px' }}
                        placeholder={activeTab === 'darta' ? 'उदा. शाखा अधिकृत / इन्जिनियर' : 'उदा. प्रमुख प्रशासकीय अधिकृत'}
                        value={activeTab === 'darta' ? formData.assignedOfficer : formData.signedBy}
                        onChange={e => {
                          if (activeTab === 'darta') setFormData({ ...formData, assignedOfficer: e.target.value });
                          else setFormData({ ...formData, signedBy: e.target.value });
                        }}
                      />
                    </div>
                  </div>

                  {/* Remarks: Clean single line input instead of multi-row textarea */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: '#334155', marginBottom: '2px' }}>कैफियत (Remarks)</label>
                    <input
                      className="dt-input"
                      style={{ height: '32px', fontSize: '0.84rem', padding: '0 8px' }}
                      placeholder="कुनै विशेष निर्देशन वा संक्षिप्त कैफियत..."
                      value={formData.remarks}
                      onChange={e => setFormData({ ...formData, remarks: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons: Compact Footer */}
              <div
                style={{
                  display: 'flex',
                  gap: '0.75rem',
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                  paddingTop: '0.45rem',
                  borderTop: '1px solid #e2e8f0',
                  marginTop: '0.15rem',
                }}
              >
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  style={{
                    padding: '0.42rem 1.1rem',
                    borderRadius: '8px',
                    border: '1.5px solid #cbd5e1',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    outline: 'none',
                    backgroundColor: '#ffffff',
                    color: '#475569',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: '0.84rem',
                    transition: 'all 0.15s ease',
                  }}
                >
                  रद्द गर्नुहोस् (Cancel)
                </button>
                <button
                  type="submit"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '0.42rem 1.4rem',
                    borderRadius: '8px',
                    backgroundColor: editingRecord
                      ? '#4f46e5'
                      : activeTab === 'darta'
                      ? '#2563eb'
                      : '#16a34a',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: '0.86rem',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: editingRecord
                      ? '0 3px 10px rgba(79, 70, 229, 0.35)'
                      : activeTab === 'darta'
                      ? '0 3px 10px rgba(37, 99, 235, 0.35)'
                      : '0 3px 10px rgba(22, 163, 74, 0.35)',
                    transition: 'all 0.15s ease',
                  }}
                  disabled={formSuccess}
                >
                  <CheckCircle size={16} />
                  <span>
                    {formSuccess
                      ? 'सम्पन्न भयो'
                      : editingRecord
                      ? 'परिवर्तन सुरक्षित गर्नुहोस् (Update)'
                      : activeTab === 'darta'
                      ? 'दर्ता सुरक्षित गर्नुहोस्'
                      : 'चलानी सुरक्षित गर्नुहोस्'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── TOK AADESH MODAL (तोक आदेश जारी गर्ने फाराम) ─── */}
      {showTokModal && tokRecord && (
        <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setShowTokModal(false); }}>
          <div className="modal-panel" style={{ maxWidth: '620px' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fffbeb' }}>
              <div>
                <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#b45309', textTransform: 'uppercase' }}>अधिकारिक तोक आदेश तथा शाखा हस्तान्तरण</span>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '2px 0 0 0', color: '#78350f' }}>
                  ✍️ तोक आदेश (दर्ता नं. {toNepaliDigits(tokRecord.registrationNo)})
                </h2>
              </div>
              <button onClick={() => setShowTokModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveTokAadesh} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ padding: '0.75rem 1rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '0.85rem' }}>
                <div><strong>विषय:</strong> {tokRecord.subject}</div>
                <div style={{ color: '#475569', marginTop: '2px' }}><strong>पठाउने:</strong> {tokRecord.senderName} | <strong>दर्ता मिति:</strong> {toNepaliDigits(tokRecord.registeredDate)}</div>
              </div>

              {/* Quick Presets */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  मानक तोक आदेश चयन गर्नुहोस् (Quick Presets):
                </label>
                <select
                  className="dt-select"
                  style={{ width: '100%', fontSize: '0.85rem' }}
                  onChange={(e) => {
                    if (e.target.value) {
                      setTokForm({ ...tokForm, tokAdesh: e.target.value });
                    }
                  }}
                >
                  <option value="">-- तोक आदेशको मानक ढाँचा छान्नुहोस् --</option>
                  {TOK_PRESETS.map((p, idx) => (
                    <option key={idx} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              {/* Directive Textarea */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  तोक आदेश / निर्देशन ब्यहोरा (Directive) *
                </label>
                <textarea
                  className="dt-input"
                  rows={3}
                  placeholder="आधिकारिक तोक आदेश वा निर्देशन यहाँ लेख्नुहोस्..."
                  value={tokForm.tokAdesh}
                  onChange={(e) => setTokForm({ ...tokForm, tokAdesh: e.target.value })}
                  required
                />
              </div>

              {/* Branch & Officer */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    तोकिएको शाखा / फाँट *
                  </label>
                  <select
                    className="dt-select"
                    style={{ width: '100%' }}
                    value={tokForm.assignedBranch}
                    onChange={(e) => setTokForm({ ...tokForm, assignedBranch: e.target.value })}
                  >
                    {BRANCH_OPTIONS.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    जिम्मेवार कर्मचारी (Officer Name)
                  </label>
                  <input
                    className="dt-input"
                    placeholder="उदा. राम प्रसाद अधिकारी (शाखा प्रमुख)"
                    value={tokForm.assignedOfficer}
                    onChange={(e) => setTokForm({ ...tokForm, assignedOfficer: e.target.value })}
                  />
                </div>
              </div>

              {/* Priority, Deadline, Given By */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                      कार्यसम्पादन म्याद (Deadline वि.सं.)
                    </label>
                    <button
                      type="button"
                      onClick={() => openBsCalendar('deadline')}
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        backgroundColor: '#eff6ff',
                        color: '#1d4ed8',
                        padding: '1px 6px',
                        borderRadius: '4px',
                        border: '1px solid #bfdbfe',
                        cursor: 'pointer',
                      }}
                      title="म्याद मिति पात्रोबाट छान्नुहोस्"
                    >
                      पात्रो
                    </button>
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <input
                      className="dt-input"
                      style={{ cursor: 'pointer', flex: 1 }}
                      placeholder="२०८१-०६-०१"
                      value={tokForm.deadlineDate}
                      onClick={() => openBsCalendar('deadline')}
                      readOnly
                    />
                    <button
                      type="button"
                      onClick={() => openBsCalendar('deadline')}
                      style={{
                        padding: '0 10px',
                        backgroundColor: '#eff6ff',
                        border: '1px solid #93c5fd',
                        borderRadius: '6px',
                        color: '#1d4ed8',
                        cursor: 'pointer',
                      }}
                      title="नेपाली पात्रो खोल्नुहोस्"
                    >
                      <Calendar size={16} />
                    </button>
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    प्राथमिकता (Priority)
                  </label>
                  <select
                    className="dt-select"
                    style={{ width: '100%' }}
                    value={tokForm.priority}
                    onChange={(e) => setTokForm({ ...tokForm, priority: e.target.value })}
                  >
                    <option value="साधारण">साधारण (३ दिनभित्र)</option>
                    <option value="जरुरी">जरुरी (२४ घण्टाभित्र)</option>
                    <option value="तुरुन्त">तुरुन्त (आजै सम्पादन)</option>
                    <option value="अति जरुरी">अति जरुरी (तुरुन्त कारबाही)</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  तोक आदेश दिने अधिकारी
                </label>
                <input
                  className="dt-input"
                  value={tokForm.tokGivenBy}
                  onChange={(e) => setTokForm({ ...tokForm, tokGivenBy: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
                <button type="button" className="dt-btn dt-btn-outline" onClick={() => setShowTokModal(false)}>रद्द</button>
                <button type="submit" className="dt-btn dt-btn-primary" style={{ backgroundColor: '#b45309', borderColor: '#b45309' }}>
                  <CheckSquare size={16} />
                  <span>तोक आदेश जारी गर्नुहोस् (Issue Tok)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── OFFICIAL LETTERHEAD & QR VERIFICATION MODAL ─── */}
      {showLetterModal && letterRecord && (
        <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setShowLetterModal(false); }}>
          <div className="modal-panel" style={{ maxWidth: '800px', width: '95%' }}>
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Printer size={20} color="#dc2626" />
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>
                  आधिकारिक सरकारी पत्र प्रिन्ट (Official Letterhead & QR Code)
                </h3>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="dt-btn dt-btn-primary" onClick={() => window.print()} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Printer size={16} />
                  <span>प्रिन्ट गर्नुहोस् (Print)</span>
                </button>
                <button onClick={() => setShowLetterModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Printable Letterhead Body */}
            <div style={{ padding: '2rem', backgroundColor: '#ffffff', color: '#0f172a', fontFamily: "'Mukta', 'Noto Sans Devanagari', sans-serif" }}>
              {/* Government Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '3px double #b91c1c', paddingBottom: '14px', marginBottom: '16px' }}>
                <div style={{ width: '80px', textAlign: 'center' }}>
                  <img
                    src={tenantSettings?.emblem_url || "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Emblem_of_Nepal.svg/240px-Emblem_of_Nepal.svg.png"}
                    style={{ width: '70px', height: 'auto', maxHeight: '70px', objectFit: 'contain' }}
                    alt="नेपाल सरकार निशाना छाप"
                  />
                </div>
                <div style={{ flex: 1, textAlign: 'center', lineHeight: 1.3, padding: '0 0.5rem' }}>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#b91c1c' }}>नेपाल सरकार / {tenantSettings?.province || 'बागमती प्रदेश'}</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#1e3a8a' }}>{tenantSettings?.palika_name || 'पाँचपोखरी थाङपाल गाउँपालिका'}</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#b91c1c' }}>गाउँ कार्यपालिकाको कार्यालय</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#334155' }}>{tenantSettings?.headquarters || tenantSettings?.address || 'थाङपालधाप, सिन्धुपाल्चोक'}</div>
                  <div style={{ fontSize: '0.78rem', color: '#475569' }}>ईमेल: {tenantSettings?.email || 'info@panchpokharimun.gov.np'} | वेबसाइट: {tenantSettings?.website || 'panchpokharimun.gov.np'}</div>
                </div>
                <div style={{ width: '80px', textAlign: 'center' }}>
                  <img
                    src={tenantSettings?.logo_url || '/panchpokhari-logo.png'}
                    style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'contain', border: '1.5px solid #cbd5e1' }}
                    alt="Palika Logo"
                    onError={(e: any) => {
                      e.target.src = '/panchpokhari-logo.png';
                    }}
                  />
                </div>
              </div>

              {/* Meta details */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.92rem', fontWeight: 700, margin: '18px 0' }}>
                <div>
                  <div>पत्र संख्या: <span style={{ fontWeight: 500 }}>{toNepaliDigits(letterRecord.fiscalYear || '२०८२/०८३')}</span></div>
                  <div>चलानी नं.: <span style={{ color: '#b91c1c', fontSize: '1.05rem' }}>{toNepaliDigits(letterRecord.dispatchNo) || '-'}</span></div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div>मिति (BS): <span style={{ fontWeight: 500 }}>{toNepaliDigits(letterRecord.dispatchDate) || 'मिति उपलब्ध छैन'}</span></div>
                  <div>मिति (AD): <span style={{ fontWeight: 500, color: '#475569', fontSize: '0.82rem' }}>{letterRecord.dispatchDateAd || new Date().toISOString().split('T')[0]}</span></div>
                </div>
              </div>

              {/* Recipient */}
              <div style={{ margin: '20px 0', fontSize: '0.95rem', lineHeight: 1.6 }}>
                <div><strong>श्री {letterRecord.receiverName || letterRecord.receiver || letterRecord.recipientOrganization || 'सम्बन्धित निकाय / व्यक्ति'}</strong>,</div>
                {letterRecord.receiverAddress && <div>{letterRecord.receiverAddress}</div>}
              </div>

              {/* Subject */}
              <div style={{ textAlign: 'center', margin: '24px 0 20px 0', fontSize: '1.1rem', fontWeight: 800 }}>
                <u>विषय: {letterRecord.subject || '-'}</u>
              </div>

              {/* Body */}
              <div style={{ minHeight: '200px', fontSize: '0.98rem', lineHeight: 1.8, whiteSpace: 'pre-wrap', textAlign: 'justify', margin: '20px 0 40px 0' }}>
                {letterContent}
              </div>

              {/* Signature Block */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '40px', paddingTop: '10px' }}>
                <div style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.4 }}>
                  <div><strong>बोधार्थ (CC):</strong></div>
                  <div>- सम्बन्धित शाखा / कार्यालय अभिलेख</div>
                  <div>- अध्यक्ष / प्रमुख प्रशासकीय अधिकृतको सचिवालय</div>
                </div>
                <div style={{ textAlign: 'center', width: '220px' }}>
                  <div style={{ height: '35px' }}></div>
                  <div style={{ borderTop: '1px dotted #000', paddingTop: '4px', fontWeight: 800 }}>
                    ( {letterRecord.signedBy || 'प्रमुख प्रशासकीय अधिकृत'} )
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#475569' }}>गाउँ कार्यपालिकाको कार्यालय</div>
                </div>
              </div>

              {/* Official Seal Footer */}
              <div style={{ marginTop: '30px', borderTop: '1px dashed #cbd5e1', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.74rem', color: '#475569' }}>
                <div>🔐 नेपाल सरकारको विद्युतीय दर्ता-चलानी प्रणालीबाट प्रमाणित (DoIT NeGIF Standard)</div>
                <div>प्रमाणीकरण कोड: <strong>{letterRecord.verificationCode || '-'}</strong></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── CITIZEN DARTA SLIP MODAL (नागरिक दर्ता भरपाई) ─── */}
      {showSlipModal && slipRecord && (
        <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setShowSlipModal(false); }}>
          <div className="modal-panel" style={{ maxWidth: '520px' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Printer size={18} color="#2563eb" />
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>
                  नागरिक दर्ता पावती / भरपाई (Receipt Slip)
                </h3>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="dt-btn dt-btn-primary" onClick={() => window.print()} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Printer size={15} />
                  <span>प्रिन्ट (Print)</span>
                </button>
                <button onClick={() => setShowSlipModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Slip Printable Box */}
            <div style={{ padding: '1.5rem', backgroundColor: '#ffffff', color: '#0f172a', fontFamily: "'Mukta', sans-serif" }}>
              <div style={{ textAlign: 'center', borderBottom: '2px solid #2563eb', paddingBottom: '8px', marginBottom: '12px' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#b91c1c' }}>पाँचपोखरी थाङपाल गाउँपालिका</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e3a8a' }}>गाउँ कार्यपालिकाको कार्यालय, थाङपालधाप</div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, backgroundColor: '#e0f2fe', color: '#0369a1', display: 'inline-block', padding: '2px 10px', borderRadius: '4px', marginTop: '4px' }}>
                  नागरिक दर्ता पावती भरपाई (Darta Slip)
                </div>
              </div>

              <div className="dt-responsive-table-wrapper">
<table style={{ width: '100%', fontSize: '0.88rem', borderCollapse: 'collapse', lineHeight: 1.8 }}>
                <tbody>
                  <tr>
                    <td style={{ fontWeight: 700, width: '35%', color: '#475569' }}>दर्ता नं. (Reg No):</td>
                    <td style={{ fontWeight: 900, color: '#2563eb', fontSize: '1.15rem' }}>{toNepaliDigits(slipRecord.registrationNo)}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 700, color: '#475569' }}>दर्ता मिति (Date):</td>
                    <td>{toNepaliDigits(slipRecord.registeredDate)} (आ.व. {toNepaliDigits(slipRecord.fiscalYear || '२०८२/०८३')})</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 700, color: '#475569' }}>निवेदक / पठाउने:</td>
                    <td><strong>{slipRecord.senderName}</strong></td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 700, color: '#475569' }}>पत्रको विषय (Subject):</td>
                    <td>{slipRecord.subject}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 700, color: '#475569' }}>तोकिएको शाखा:</td>
                    <td><span style={{ backgroundColor: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', fontWeight: 700, color: '#0f172a' }}>{slipRecord.assignedBranch || slipRecord.department || 'प्रशासन शाखा'}</span></td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 700, color: '#475569' }}>तोक आदेश / निर्देशन:</td>
                    <td><span style={{ color: '#b45309', fontStyle: 'italic' }}>{slipRecord.tokAdesh || 'कारबाही प्रक्रियामा'}</span></td>
                  </tr>
                </tbody>
              </table>
</div>

              {/* QR and Instruction */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '14px', padding: '10px', backgroundColor: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '6px' }}>
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(
                    `${window.location.origin}/api/v1/darta-chalani/verify/${slipRecord.verificationCode || slipRecord.registrationNo}`
                  )}`}
                  style={{ width: '70px', height: '70px' }}
                  alt="QR"
                />
                <div style={{ fontSize: '0.74rem', color: '#475569', lineHeight: 1.4 }}>
                  <strong>नागरिक अनलाइन ट्र्याकिङ:</strong> यो QR कोड स्क्यान गरी वा पालिकाको पोर्टलमा दर्ता नं. <strong>{toNepaliDigits(slipRecord.registrationNo)}</strong> मार्फत आफ्नो पत्रको कारबाहीको अवस्था हेर्न सक्नुहुन्छ।
                </div>
              </div>

              <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#475569' }}>
                <div>दर्ता गर्ने: <strong>{slipRecord.approvedBy || 'फाँट अधिकृत'}</strong></div>
                <div>आधिकारिक छाप: ____________</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── PUBLIC VERIFICATION & TRACKING MODAL ─── */}
      {showVerifyModal && (
        <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setShowVerifyModal(false); }}>
          <div className="modal-panel" style={{ maxWidth: '580px' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f0fdf4' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={22} color="#16a34a" />
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#166534' }}>
                  आधिकारिक पत्र प्रमाणीकरण तथा ट्र्याकिङ
                </h3>
              </div>
              <button onClick={() => setShowVerifyModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <form onSubmit={handleVerifySearch} style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  className="dt-input"
                  placeholder="प्रमाणीकरण कोड वा दर्ता/चलानी नं. प्रविष्ट गर्नुहोस् (उदा. PKP-D-2082-083-1)..."
                  value={verifySearchCode}
                  onChange={(e) => setVerifySearchCode(e.target.value)}
                  style={{ flex: 1 }}
                />
                <button type="submit" className="dt-btn dt-btn-primary" disabled={isVerifying}>
                  {isVerifying ? 'जाँच हुँदै...' : 'जाँच गर्नुहोस्'}
                </button>
              </form>

              {/* Verification Result Card */}
              {verificationResult && (
                <div>
                  {verificationResult.verified ? (
                    <div style={{ padding: '1.25rem', backgroundColor: '#f0fdf4', border: '2px solid #86efac', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#166534', fontWeight: 800, fontSize: '1rem', marginBottom: '8px' }}>
                        <CheckCircle size={22} />
                        <span>नेपाल सरकारको आधिकारिक प्रणालीबाट प्रमाणित (VERIFIED)</span>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#1e293b', display: 'flex', flexDirection: 'column', gap: '4px', lineHeight: 1.6 }}>
                        <div><strong>कार्यालय:</strong> {verificationResult.municipality}</div>
                        <div><strong>पत्रको प्रकार:</strong> {verificationResult.type}</div>
                        <div><strong>नम्बर:</strong> {toNepaliDigits(verificationResult.registrationNo || verificationResult.dispatchNo)} (आ.व. {toNepaliDigits(verificationResult.fiscalYear)})</div>
                        <div><strong>मिति:</strong> {toNepaliDigits(verificationResult.dateBs)}</div>
                        <div><strong>विषय:</strong> {verificationResult.subject}</div>
                        <div><strong>{verificationResult.sender ? 'पठाउने:' : 'पाउने:'}</strong> {verificationResult.sender || verificationResult.receiver}</div>
                        <div><strong>सम्बन्धित शाखा:</strong> {verificationResult.assignedBranch || verificationResult.department}</div>
                        <div><strong>स्थिति:</strong> <span style={{ fontWeight: 700, color: '#16a34a' }}>{verificationResult.status}</span></div>
                        <div style={{ marginTop: '8px', fontSize: '0.75rem', color: '#475569', borderTop: '1px solid #bbf7d0', paddingTop: '6px' }}>
                          प्रमाणीकरण कोड: <code>{verificationResult.verificationCode}</code> | जाँच गरिएको मिति: {new Date(verificationResult.verifiedAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: '1rem', backgroundColor: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px', color: '#991b1b', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <XCircle size={20} />
                      <span>{verificationResult.message}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── DETAILS MODAL ─── */}
      {showDetailsModal && selectedRecord && (
        <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setShowDetailsModal(false); }}>
          <div className="modal-panel" style={{ maxWidth: '620px' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
                📋 विस्तृत अभिलेख विवरण ({activeTab === 'darta' ? 'दर्ता' : 'चलानी'} नं. {toNepaliDigits(selectedRecord.registrationNo || selectedRecord.dispatchNo) || '-'})
              </h2>
              <button onClick={() => setShowDetailsModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.88rem' }}>
              <div style={{ padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1.5px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                <div style={{ fontWeight: 700, marginBottom: '4px' }}>स्वीकृति स्थिति (Approval Status):</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '4px' }}>
                  {renderApprovalBadge(selectedRecord.approvalStatus)}
                  {selectedRecord.approvedBy && (
                    <span style={{ fontSize: '0.8rem', color: '#475569' }}>
                      (स्वीकृत गर्ने: <strong>{selectedRecord.approvedBy}</strong>)
                    </span>
                  )}
                </div>
                {selectedRecord.rejectionReason && (
                  <div style={{ marginTop: '6px', color: '#dc2626', fontSize: '0.8rem' }}>
                    <strong>अस्विकृत कारण:</strong> {selectedRecord.rejectionReason}
                  </div>
                )}
              </div>

              <div><strong>पत्रको विषय:</strong> {selectedRecord.subject || '-'}</div>
              <div><strong>{activeTab === 'darta' ? 'पठाउने कार्यालय:' : 'पाउने कार्यालय:'}</strong> {selectedRecord.senderName || selectedRecord.receiverName || '-'}</div>
              <div><strong>पत्र संख्या:</strong> {toNepaliDigits(selectedRecord.letterRefNo) || '-'}</div>
              <div><strong>मिति (वि.सं.):</strong> {toNepaliDigits(selectedRecord.registeredDate || selectedRecord.dispatchDate) || '-'} {(selectedRecord.registeredTime || selectedRecord.dispatchTime) ? `(${formatNepaliTime(selectedRecord.registeredTime || selectedRecord.dispatchTime)})` : ''}</div>
              <div><strong>सम्बन्धित शाखा:</strong> {selectedRecord.assignedBranch || selectedRecord.department || 'प्रशासन शाखा'}</div>
              {selectedRecord.assignedOfficer && <div><strong>तोकिएको कर्मचारी:</strong> {selectedRecord.assignedOfficer}</div>}
              {selectedRecord.tokAdesh && (
                <div style={{ backgroundColor: '#fffbeb', padding: '8px', borderRadius: '6px', border: '1px solid #fde68a' }}>
                  <strong style={{ color: '#b45309' }}>तोक आदेश:</strong> {selectedRecord.tokAdesh}
                </div>
              )}
              <div><strong>प्रक्रियागत स्थिति:</strong> {selectedRecord.status || '-'}</div>
              {selectedRecord.verificationCode && <div><strong>प्रमाणीकरण कोड:</strong> <code>{selectedRecord.verificationCode}</code></div>}
              {selectedRecord.remarks && <div><strong>कैफियत:</strong> {selectedRecord.remarks}</div>}
            </div>
            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="dt-btn dt-btn-outline" onClick={() => setShowDetailsModal(false)}>बन्द गर्नुहोस्</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── 3. MODERN TABS & ADVANCED FILTER TOOLBAR ─── */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '1rem 1.25rem',
          border: '1.5px solid #e2e8f0',
          boxShadow: '0 4px 15px rgba(15, 23, 42, 0.04)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Segmented Tab Buttons (Darta vs Chalani) */}
        <div
          style={{
            display: 'inline-flex',
            padding: '5px',
            backgroundColor: '#f1f5f9',
            borderRadius: '14px',
            gap: '6px',
            border: '1.5px solid #e2e8f0',
          }}
        >
          <button
            type="button"
            onClick={() => { setActiveTab('darta'); setBranchFilter(''); setStatusFilter(''); }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '0.65rem 1.3rem',
              borderRadius: '10px',
              border: 'none',
              fontWeight: 800,
              fontSize: '0.9rem',
              cursor: 'pointer',
              background: activeTab === 'darta'
                ? 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)'
                : 'transparent',
              color: activeTab === 'darta' ? '#ffffff' : '#475569',
              boxShadow: activeTab === 'darta' ? '0 4px 12px rgba(37, 99, 235, 0.3)' : 'none',
              transition: 'all 0.18s ease',
            }}
          >
            <Inbox size={18} />
            <span>दर्ता किताब (Inward Register)</span>
            <span
              style={{
                backgroundColor: activeTab === 'darta' ? 'rgba(255,255,255,0.25)' : '#e2e8f0',
                color: activeTab === 'darta' ? '#ffffff' : '#334155',
                padding: '2px 8px',
                borderRadius: '999px',
                fontSize: '0.74rem',
                fontWeight: 800,
              }}
            >
              {toNepaliDigits(dartaList.length)}
            </span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('chalani'); setBranchFilter(''); setStatusFilter(''); }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '0.65rem 1.3rem',
              borderRadius: '10px',
              border: 'none',
              fontWeight: 800,
              fontSize: '0.9rem',
              cursor: 'pointer',
              background: activeTab === 'chalani'
                ? 'linear-gradient(135deg, #065f46 0%, #16a34a 100%)'
                : 'transparent',
              color: activeTab === 'chalani' ? '#ffffff' : '#475569',
              boxShadow: activeTab === 'chalani' ? '0 4px 12px rgba(22, 163, 74, 0.3)' : 'none',
              transition: 'all 0.18s ease',
            }}
          >
            <Send size={17} />
            <span>चलानी किताब (Outward Register)</span>
            <span
              style={{
                backgroundColor: activeTab === 'chalani' ? 'rgba(255,255,255,0.25)' : '#e2e8f0',
                color: activeTab === 'chalani' ? '#ffffff' : '#334155',
                padding: '2px 8px',
                borderRadius: '999px',
                fontSize: '0.74rem',
                fontWeight: 800,
              }}
            >
              {toNepaliDigits(chalaniList.length)}
            </span>
          </button>
        </div>

        {/* Filter Toolbar */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search Box */}
          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input
              type="text"
              className="dt-input"
              style={{ paddingLeft: '36px', height: '42px', borderRadius: '10px', fontSize: '0.88rem' }}
              placeholder="विषय, कार्यालय वा नं. खोज्नुहोस्..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Branch Filter */}
          <select
            className="dt-select"
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            style={{ maxWidth: '200px', height: '42px', borderRadius: '10px', fontSize: '0.85rem' }}
          >
            <option value="">सबै शाखा (All Branches)</option>
            {BRANCH_OPTIONS.map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            className="dt-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ height: '42px', borderRadius: '10px', fontSize: '0.85rem' }}
          >
            <option value="">सबै स्थिति (All Status)</option>
            <option value="दर्ता भएको">दर्ता भएको</option>
            <option value="तोक आदेश भएको">तोक आदेश भएको</option>
            <option value="कारबाहीमा">कारबाहीमा</option>
            <option value="फर्स्यौट भएको">फर्स्यौट भएको</option>
            <option value="चलानी भएको">चलानी भएको</option>
          </select>

          {/* Fiscal Year Filter */}
          <select
            className="dt-select"
            value={fiscalYear}
            onChange={(e) => setFiscalYear(e.target.value)}
            style={{ height: '42px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 600 }}
          >
            <option value="२०८२/०८३">आ.व. २०८२/०८३</option>
            <option value="२०८१/०८२">आ.व. २०८१/०८२</option>
            <option value="२०८०/०८१">आ.व. २०८०/०८१</option>
          </select>
        </div>
      </div>

      {/* ─── DATA TABLE ─── */}
      {activeTab === 'darta' ? (
        <div className="dt-table-wrapper" style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1.5px solid #e2e8f0', boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)', overflow: 'hidden' }}>
          <div className="dt-responsive-table-wrapper">
<table className="dt-table">
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '0.9rem 1rem', fontSize: '0.82rem', fontWeight: 800, color: '#334155' }}>दर्ता नं. र मिति</th>
                <th style={{ padding: '0.9rem 1rem', fontSize: '0.82rem', fontWeight: 800, color: '#334155' }}>पठाउने कार्यालय / संस्था</th>
                <th style={{ padding: '0.9rem 1rem', fontSize: '0.82rem', fontWeight: 800, color: '#334155' }}>पत्र संख्या</th>
                <th style={{ padding: '0.9rem 1rem', fontSize: '0.82rem', fontWeight: 800, color: '#334155' }}>पत्रको विषय</th>
                <th style={{ padding: '0.9rem 1rem', fontSize: '0.82rem', fontWeight: 800, color: '#334155' }}>तोकिएको शाखा</th>
                <th style={{ padding: '0.9rem 1rem', fontSize: '0.82rem', fontWeight: 800, color: '#334155' }}>तोक आदेश / स्थिति</th>
                <th style={{ padding: '0.9rem 1rem', fontSize: '0.82rem', fontWeight: 800, color: '#334155', textAlign: 'center' }}>सरकारी कार्यहरू (Official Actions)</th>
              </tr>
            </thead>
            <tbody>
              {isDartaLoading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '4rem 1rem', color: '#475569' }}>
                    <div style={{ display: 'inline-block', width: '24px', height: '24px', border: '3px solid #cbd5e1', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '8px' }} />
                    <div>रेकर्ड लोड हुँदैछ...</div>
                  </td>
                </tr>
              ) : filteredDarta.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '4rem 1rem' }}>
                    <div style={{ display: 'inline-flex', width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#eff6ff', color: '#2563eb', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                      <Inbox size={32} />
                    </div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1e293b', margin: '0 0 0.5rem 0' }}>कुनै दर्ता अभिलेख भेटिएन</h3>
                    <p style={{ color: '#475569', fontSize: '0.88rem', maxWidth: '420px', margin: '0 auto 1.25rem auto' }}>
                      खोजिएको फिल्टर अनुसार कुनै दर्ता पत्र प्राप्त भएन वा यस आ.व. मा नयाँ दर्ता सुरु गरिएको छैन।
                    </p>
                    <button
                      type="button"
                      onClick={() => openNewModal('darta')}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '0.65rem 1.35rem',
                        borderRadius: '9px',
                        backgroundColor: '#2563eb',
                        color: '#ffffff',
                        fontWeight: 700,
                        border: 'none',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                      }}
                    >
                      <Plus size={16} />
                      <span>+ नयाँ दर्ता प्रविष्टि गर्नुहोस्</span>
                    </button>
                  </td>
                </tr>
              ) : (
                filteredDarta.map((d: any) => {
                  const isApproved = d.approvalStatus === 'approved';
                  return (
                    <tr key={d.id}>
                      <td>
                        <div style={{ fontWeight: 800, color: '#2563eb', fontSize: '0.95rem' }}>दर्ता नं. {toNepaliDigits(d.registrationNo) || '-'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {toNepaliDigits(d.registeredDate) || '-'} {d.registeredTime ? `(${formatNepaliTime(d.registeredTime)})` : ''}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{d.senderName || '-'}</div>
                        {d.senderAddress && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{d.senderAddress}</div>}
                      </td>
                      <td>
                        <div>{toNepaliDigits(d.letterRefNo) || '-'}</div>
                        {getPriorityBadge(d.priority || d.classification)}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{d.subject || '-'}</div>
                        {d.verificationCode && (
                          <div style={{ fontSize: '0.72rem', color: '#475569' }}>कोड: <code>{d.verificationCode}</code></div>
                        )}
                      </td>
                      <td>
                        <span className="dt-badge dt-badge-info">{d.assignedBranch || d.department || 'प्रशासन शाखा'}</span>
                        {d.assignedOfficer && (
                          <div style={{ fontSize: '0.74rem', color: '#0284c7', marginTop: '2px' }}>({d.assignedOfficer})</div>
                        )}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: '0.82rem' }}>{d.status || 'दर्ता भएको'}</div>
                        {d.tokAdesh && (
                          <div style={{ fontSize: '0.72rem', color: '#b45309', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={d.tokAdesh}>
                            ✍️ {d.tokAdesh}
                          </div>
                        )}
                        <div style={{ marginTop: '4px' }}>{renderApprovalBadge(d.approvalStatus)}</div>
                      </td>
                      <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                          {/* 1. Tok Aadesh Action */}
                          <button
                            type="button"
                            onClick={() => handleOpenTokModal(d)}
                            title="तोक आदेश लगाउनुहोस् / शाखा तोक्नुहोस्"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, border: '1px solid #d97706', color: '#b45309', background: '#fef3c7', cursor: 'pointer' }}
                          >
                            <UserCheck size={14} />
                            <span>तोक आदेश</span>
                          </button>

                          {/* 2. Citizen Receipt Slip Print */}
                          <button
                            type="button"
                            onClick={() => handleOpenSlipModal(d)}
                            title="नागरिक दर्ता पावती रसिद प्रिन्ट गर्नुहोस्"
                            style={{ padding: '5px 8px', borderRadius: '6px', border: '1.5px solid #cbd5e1', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', outline: 'none', background: '#f8fafc', color: '#334155', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}
                          >
                            <Printer size={14} color="#0284c7" />
                            <span>पावती</span>
                          </button>

                          {/* 3. Approval / Rejection Action */}
                          {isApproved ? (
                            <button
                              type="button"
                              onClick={() => handleToggleApproval(d, 'darta')}
                              title="अस्विकृत गर्नुहोस् (सम्पादन गर्नका लागि पहिले अस्विकृत गर्नुपर्छ)"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, border: '1px solid #dc2626', color: '#dc2626', background: '#fee2e2', cursor: 'pointer' }}
                            >
                              <XCircle size={14} />
                              <span>अस्विकृत</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleToggleApproval(d, 'darta')}
                              title="स्विकृत गर्नुहोस्"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, border: '1px solid #16a34a', color: '#16a34a', background: '#dcfce7', cursor: 'pointer' }}
                            >
                              <CheckCircle size={14} />
                              <span>स्विकृत</span>
                            </button>
                          )}

                          {/* 4. View Details */}
                          <button
                            type="button"
                            onClick={() => handleViewDetails(d)}
                            title="विस्तृत विवरण हेर्नुहोस्"
                            style={{ padding: '5px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--surface)', cursor: 'pointer' }}
                          >
                            <Eye size={15} color="var(--primary)" />
                          </button>

                          {/* 5. Edit (Locked when approved) */}
                          {isApproved ? (
                            <button
                              type="button"
                              onClick={() => handleEditClick(d)}
                              title="स्विकृत भइसकेकोले सम्पादन लक छ (पहिले अस्विकृत गर्नुहोस्)"
                              style={{ padding: '5px', borderRadius: '6px', border: '1.5px solid #cbd5e1', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', outline: 'none', color: '#0f172a', background: '#f1f5f9', cursor: 'not-allowed', opacity: 0.6 }}
                            >
                              <Lock size={15} color="#64748b" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleEditClick(d)}
                              title="सम्पादन गर्नुहोस्"
                              style={{ padding: '5px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--surface)', cursor: 'pointer' }}
                            >
                              <Edit2 size={15} color="#2563eb" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
</div>
        </div>
      ) : (
        <div className="dt-table-wrapper" style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1.5px solid #e2e8f0', boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)', overflow: 'hidden' }}>
          <div className="dt-responsive-table-wrapper">
<table className="dt-table">
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '0.9rem 1rem', fontSize: '0.82rem', fontWeight: 800, color: '#334155' }}>चलानी नं. र मिति</th>
                <th style={{ padding: '0.9rem 1rem', fontSize: '0.82rem', fontWeight: 800, color: '#334155' }}>पाउने कार्यालय / व्यक्ति</th>
                <th style={{ padding: '0.9rem 1rem', fontSize: '0.82rem', fontWeight: 800, color: '#334155' }}>पत्र संख्या</th>
                <th style={{ padding: '0.9rem 1rem', fontSize: '0.82rem', fontWeight: 800, color: '#334155' }}>पत्रको विषय</th>
                <th style={{ padding: '0.9rem 1rem', fontSize: '0.82rem', fontWeight: 800, color: '#334155' }}>पठाउने शाखा</th>
                <th style={{ padding: '0.9rem 1rem', fontSize: '0.82rem', fontWeight: 800, color: '#334155' }}>स्थिति तथा स्वीकृति</th>
                <th style={{ padding: '0.9rem 1rem', fontSize: '0.82rem', fontWeight: 800, color: '#334155', textAlign: 'center' }}>सरकारी कार्यहरू (Official Actions)</th>
              </tr>
            </thead>
            <tbody>
              {isChalaniLoading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '4rem 1rem', color: '#475569' }}>
                    <div style={{ display: 'inline-block', width: '24px', height: '24px', border: '3px solid #cbd5e1', borderTopColor: '#059669', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '8px' }} />
                    <div>रेकर्ड लोड हुँदैछ...</div>
                  </td>
                </tr>
              ) : filteredChalani.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '4rem 1rem' }}>
                    <div style={{ display: 'inline-flex', width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#ecfdf5', color: '#059669', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                      <Send size={32} />
                    </div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1e293b', margin: '0 0 0.5rem 0' }}>कुनै चलानी अभिलेख भेटिएन</h3>
                    <p style={{ color: '#475569', fontSize: '0.88rem', maxWidth: '420px', margin: '0 auto 1.25rem auto' }}>
                      खोजिएको फिल्टर अनुसार कुनै चलानी पत्र प्राप्त भएन वा यस आ.व. मा नयाँ चलानी दर्ता गरिएको छैन।
                    </p>
                    <button
                      type="button"
                      onClick={() => openNewModal('chalani')}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '0.65rem 1.35rem',
                        borderRadius: '9px',
                        backgroundColor: '#059669',
                        color: '#ffffff',
                        fontWeight: 700,
                        border: 'none',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)',
                      }}
                    >
                      <Plus size={16} />
                      <span>+ नयाँ चलानी प्रविष्टि गर्नुहोस्</span>
                    </button>
                  </td>
                </tr>
              ) : (
                filteredChalani.map((c: any) => {
                  const isApproved = c.approvalStatus === 'approved';
                  return (
                    <tr key={c.id}>
                      <td>
                        <div style={{ fontWeight: 800, color: '#16a34a', fontSize: '0.95rem' }}>चलानी नं. {toNepaliDigits(c.dispatchNo) || '-'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {toNepaliDigits(c.dispatchDate) || '-'} {c.dispatchTime ? `(${formatNepaliTime(c.dispatchTime)})` : ''}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{c.receiverName || c.receiver || '-'}</div>
                        {c.receiverAddress && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.receiverAddress}</div>}
                      </td>
                      <td>
                        <div>{toNepaliDigits(c.letterRefNo) || '-'}</div>
                        {getPriorityBadge(c.priority || c.classification)}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{c.subject || '-'}</div>
                        {c.verificationCode && (
                          <div style={{ fontSize: '0.72rem', color: '#475569' }}>कोड: <code>{c.verificationCode}</code></div>
                        )}
                      </td>
                      <td>
                        <span className="dt-badge dt-badge-info">{c.department || 'प्रशासन शाखा'}</span>
                      </td>
                      <td>
                        <div>{c.status || 'चलानी भएको'}</div>
                        <div style={{ marginTop: '4px' }}>{renderApprovalBadge(c.approvalStatus)}</div>
                      </td>
                      <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                          {/* 1. Official Letterhead Print with QR code */}
                          <button
                            type="button"
                            onClick={() => handleOpenLetterModal(c)}
                            title="सरकारी लेटरहेड तथा प्रमाणीकरण QR कोड सहितको पत्र प्रिन्ट गर्नुहोस्"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, border: '1px solid #dc2626', color: '#b91c1c', background: '#fee2e2', cursor: 'pointer' }}
                          >
                            <Printer size={14} />
                            <span>पत्र प्रिन्ट</span>
                          </button>

                          {/* 2. Approval / Rejection Action Button */}
                          {isApproved ? (
                            <button
                              type="button"
                              onClick={() => handleToggleApproval(c, 'chalani')}
                              title="अस्विकृत गर्नुहोस् (सम्पादन गर्नका लागि पहिले अस्विकृत गर्नुपर्छ)"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, border: '1px solid #dc2626', color: '#dc2626', background: '#fee2e2', cursor: 'pointer' }}
                            >
                              <XCircle size={14} />
                              <span>अस्विकृत</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleToggleApproval(c, 'chalani')}
                              title="स्विकृत गर्नुहोस्"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, border: '1px solid #16a34a', color: '#16a34a', background: '#dcfce7', cursor: 'pointer' }}
                            >
                              <CheckCircle size={14} />
                              <span>स्विकृत</span>
                            </button>
                          )}

                          {/* 3. View Details Button */}
                          <button
                            type="button"
                            onClick={() => handleViewDetails(c)}
                            title="विस्तृत विवरण हेर्नुहोस्"
                            style={{ padding: '5px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--surface)', cursor: 'pointer' }}
                          >
                            <Eye size={15} color="var(--primary)" />
                          </button>

                          {/* 4. Edit Button (Locked when approved) */}
                          {isApproved ? (
                            <button
                              type="button"
                              onClick={() => handleEditClick(c)}
                              title="स्विकृत भइसकेकोले सम्पादन लक छ (पहिले अस्विकृत गर्नुहोस्)"
                              style={{ padding: '5px', borderRadius: '6px', border: '1.5px solid #cbd5e1', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', outline: 'none', color: '#0f172a', background: '#f1f5f9', cursor: 'not-allowed', opacity: 0.6 }}
                            >
                              <Lock size={15} color="#64748b" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleEditClick(c)}
                              title="सम्पादन गर्नुहोस्"
                              style={{ padding: '5px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--surface)', cursor: 'pointer' }}
                            >
                              <Edit2 size={15} color="#2563eb" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
</div>
        </div>
      )}
      {/* BS Calendar Date Picker Modal */}
      <BsCalendarModal
        isOpen={calendarModalOpen}
        onClose={() => setCalendarModalOpen(false)}
        initialBsDate={
          calendarTarget === 'entry'
            ? formData.entryDateBs
            : calendarTarget === 'letter'
            ? formData.letterDateBs
            : tokForm.deadlineDate
        }
        onSelectDate={handleCalendarDateSelect}
        title={
          calendarTarget === 'entry'
            ? (activeTab === 'darta' ? 'दर्ता मिति छान्नुहोस् (वि.सं.)' : 'चलानी मिति छान्नुहोस् (वि.सं.)')
            : calendarTarget === 'letter'
            ? 'पत्रको मिति छान्नुहोस् (Letter Date BS)'
            : 'कार्यसम्पादन म्याद मिति छान्नुहोस् (Deadline BS)'
        }
      />
    </div>
  );
};
