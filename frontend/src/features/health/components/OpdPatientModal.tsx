import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  HeartPulse,
  Activity,
  User,
  MapPin,
  AlertTriangle,
  Stethoscope,
  FileText,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Phone,
  Calendar,
  AlertOctagon,
  UserPlus,
  Repeat,
  Search,
  Building2,
  BadgeCheck,
  Printer,
  History,
  Check,
  Share2,
  Database,
  Layers,
  CheckCircle,
} from 'lucide-react';
import type { PatientRecord } from '../../../types/health';
import { api } from '../../../api/client';
import { getHealthDoctors, getHealthDepartments } from '../healthSettingsStorage';

export interface OpdPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (patientData: Partial<PatientRecord>) => Promise<any>;
  existingPatients?: PatientRecord[];
  onUpdatePatient?: (id: string, patientData: Partial<PatientRecord>) => Promise<any>;
  initialMode?: 'new' | 'existing';
}

// Fallback Panchpokhari Municipal Citizen Registry (जब सर्भर अफलाइन वा नयाँ डेटाबेस हुन्छ)
const DEFAULT_MUNICIPAL_CITIZENS = [
  {
    id: 'cit-001',
    fullName: 'सुनिता तामाङ',
    fullNameEn: 'Sunita Tamang',
    citizenshipNo: '२७-०१-७९-००४२८',
    nationalId: 'NID-9823-4412',
    phone: '९८४१२३४५६७',
    gender: 'female',
    dateOfBirth: '1998-07-26',
    age: 28,
    dobBs: '२०५४-०४-१२',
    wardNumber: 3,
    address: 'पाँचपोखरी थाङपाल गाउँपालिका-३',
    tole: 'भोताङ',
    occupation: 'कृषि तथा पशुपालन',
    fatherName: 'दोर्जे तामाङ',
    motherName: 'फुल्मु तामाङ',
    spouseName: 'दावा तामाङ',
    emergencyContactName: 'दावा तामाङ',
    emergencyContactRelation: 'पति',
    emergencyContactPhone: '९८१२३४५६७८',
  },
  {
    id: 'cit-002',
    fullName: 'दावा तामाङ',
    fullNameEn: 'Dawa Tamang',
    citizenshipNo: '२७-०१-७५-००११९',
    nationalId: 'NID-8812-7763',
    phone: '९८१२३४५६७८',
    gender: 'male',
    dateOfBirth: '1994-03-15',
    age: 32,
    dobBs: '२०५०-११-२९',
    wardNumber: 3,
    address: 'पाँचपोखरी थाङपाल गाउँपालिका-३',
    tole: 'भोताङ',
    occupation: 'होटल तथा पर्यटन',
    fatherName: 'सोनाम तामाङ',
    motherName: 'पेमा तामाङ',
    spouseName: 'सुनिता तामाङ',
    emergencyContactName: 'सुनिता तामाङ',
    emergencyContactRelation: 'पत्नी',
    emergencyContactPhone: '९८४१२३४५६७',
  },
  {
    id: 'cit-003',
    fullName: 'राम बहादुर श्रेष्ठ',
    fullNameEn: 'Ram Bahadur Shrestha',
    citizenshipNo: '२७-०१-३२-००६५४',
    nationalId: 'NID-1102-3341',
    phone: '९८५१०१२३४५',
    gender: 'male',
    dateOfBirth: '1952-11-20',
    age: 74,
    dobBs: '२००९-०८-०५',
    wardNumber: 6,
    address: 'पाँचपोखरी थाङपाल गाउँपालिका-६',
    tole: 'थाङपालधाप',
    occupation: 'ज्येष्ठ नागरिक',
    fatherName: 'हरि बहादुर श्रेष्ठ',
    motherName: 'लक्ष्मी श्रेष्ठ',
    emergencyContactName: 'श्याम श्रेष्ठ',
    emergencyContactRelation: 'छोरा',
    emergencyContactPhone: '९८४१०९८७६५',
  },
  {
    id: 'cit-004',
    fullName: 'पासाङ ल्हामु शेर्पा',
    fullNameEn: 'Pasang Lhamu Sherpa',
    citizenshipNo: '२७-०१-८०-००५१२',
    nationalId: 'NID-6671-8890',
    phone: '९८४३९८७६५४',
    gender: 'female',
    dateOfBirth: '2001-09-10',
    age: 25,
    dobBs: '२०५८-०५-२५',
    wardNumber: 4,
    address: 'पाँचपोखरी थाङपाल गाउँपालिका-४',
    tole: 'मानेखर्क',
    occupation: 'शिक्षण',
    fatherName: 'छेवाङ शेर्पा',
    motherName: 'निमा शेर्पा',
    emergencyContactName: 'छेवाङ शेर्पा',
    emergencyContactRelation: 'बुबा',
    emergencyContactPhone: '९८४३००११२२',
  },
  {
    id: 'cit-005',
    fullName: 'वीर बहादुर गिरी',
    fullNameEn: 'Bir Bahadur Giri',
    citizenshipNo: '२७-०१-६४-००३२१',
    nationalId: 'NID-4451-2298',
    phone: '९८६००११२२३',
    gender: 'male',
    dateOfBirth: '1970-05-18',
    age: 56,
    dobBs: '२०२७-०२-०५',
    wardNumber: 2,
    address: 'पाँचपोखरी थाङपाल गाउँपालिका-२',
    tole: 'हौथले',
    occupation: 'व्यापार तथा सेवा',
    fatherName: 'कृष्ण गिरी',
    motherName: 'सरस्वती गिरी',
    emergencyContactName: 'कमला गिरी',
    emergencyContactRelation: 'पत्नी',
    emergencyContactPhone: '९८६००११२२४',
  },
];

export const OpdPatientModal: React.FC<OpdPatientModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  existingPatients = [],
  onUpdatePatient,
  initialMode = 'new',
}) => {
  // ── Mode: नयाँ बिरामी दर्ता (New) वा पुराना बिरामी दर्ता / ओपिडी पुर्जी (Existing) ──
  const [registrationMode, setRegistrationMode] = useState<'new' | 'existing'>(initialMode);

  useEffect(() => {
    if (isOpen) {
      setRegistrationMode(initialMode || 'new');
    }
  }, [isOpen, initialMode]);

  // Navigation Tabs (For New Patient Mode)
  const [activeTab, setActiveTab] = useState<'demographics' | 'address_insurance' | 'triage_vitals' | 'clinical_opd'>('demographics');

  // ── 1. Demographics & Identity (New Patient) ───────────────────────────────
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [fullNameEn, setFullNameEn] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [dobBs, setDobBs] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('female');
  const [bloodGroup, setBloodGroup] = useState<string>('O+');
  const [citizenshipOrNin, setCitizenshipOrNin] = useState('');
  const [maritalStatus, setMaritalStatus] = useState<string>('विवाहित');
  const [occupation, setOccupation] = useState<string>('कृषि');
  const [citizenId, setCitizenId] = useState<string>('');

  // ── Citizen Master Search State (एकिकृत पालिका नागरिक लगत खोज्ने) ───────────
  const [citizenSearchQuery, setCitizenSearchQuery] = useState('');
  const [citizenResults, setCitizenResults] = useState<any[]>([]);
  const [isSearchingCitizens, setIsSearchingCitizens] = useState(false);
  const [selectedCitizen, setSelectedCitizen] = useState<any | null>(null);
  const [isCitizenLookupOpen, setIsCitizenLookupOpen] = useState(false);

  // ── 2. Address & Emergency Contact ─────────────────────────────────────────
  const [phone, setPhone] = useState('');
  const [wardNumber, setWardNumber] = useState<number>(3);
  const [toleVillage, setToleVillage] = useState('भोताङ');
  const [address, setAddress] = useState('पाँचपोखरी थाङपाल गाउँपालिका');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactRelation, setEmergencyContactRelation] = useState('पति / पत्नी');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');

  // ── 3. Health Insurance & Social Security ──────────────────────────────────
  const [hasHealthInsurance, setHasHealthInsurance] = useState(false);
  const [insuranceNumber, setInsuranceNumber] = useState('');
  const [targetedGroup, setTargetedGroup] = useState<string>('सामान्य नागरिक (General)');
  const [paymentMode, setPaymentMode] = useState<string>('नगद (Cash)');
  const [ticketFee, setTicketFee] = useState<number>(20);

  // ── 4. Clinical Triage & Vitals ────────────────────────────────────────────
  const [triagePriority, setTriagePriority] = useState<'routine' | 'urgent' | 'emergency'>('routine');
  const [bloodPressure, setBloodPressure] = useState('120/80');
  const [pulseRate, setPulseRate] = useState('76');
  const [temperatureF, setTemperatureF] = useState('98.6');
  const [spo2Percent, setSpo2Percent] = useState('98');
  const [respiratoryRate, setRespiratoryRate] = useState('18');
  const [heightCm, setHeightCm] = useState('158');
  const [weightKg, setWeightKg] = useState('56');
  const [bmi, setBmi] = useState('22.4');
  const [bmiCategory, setBmiCategory] = useState('सामान्य (Normal)');
  const [bloodGlucose, setBloodGlucose] = useState('102');

  // ── 5. Clinical History & Allergies ────────────────────────────────────────
  const [knownAllergies, setKnownAllergies] = useState('');
  const [pastMedicalHistory, setPastMedicalHistory] = useState<string[]>([]);
  const [currentMedications, setCurrentMedications] = useState('');

  // ── 6. OPD Consultation & Doctor ───────────────────────────────────────────
  const [doctorsList, setDoctorsList] = useState(() => getHealthDoctors().filter(d => d.isActive));
  const [departmentsList, setDepartmentsList] = useState(() => getHealthDepartments());
  const defaultDocName = doctorsList[0] ? `${doctorsList[0].nameNepali || doctorsList[0].name} (${doctorsList[0].designation})` : 'डा. सुजन खनाल (MDGP)';
  const defaultDeptName = departmentsList[0] ? departmentsList[0].name : 'सामान्य चिकित्सा (General Medicine OPD)';
  const defaultRoomNo = departmentsList[0]?.roomNo || 'कक्ष नं. १०१';

  useEffect(() => {
    const handleSettingsChange = () => {
      const docs = getHealthDoctors().filter(d => d.isActive);
      setDoctorsList(docs);
      const depts = getHealthDepartments();
      setDepartmentsList(depts);
    };
    window.addEventListener('p5-health-settings-changed', handleSettingsChange);
    return () => window.removeEventListener('p5-health-settings-changed', handleSettingsChange);
  }, []);

  const [visitType, setVisitType] = useState<'new' | 'followup' | 'emergency'>('new');
  const [department, setDepartment] = useState(defaultDeptName);
  const [attendingDoctor, setAttendingDoctor] = useState(defaultDocName);
  const [roomNumber, setRoomNumber] = useState(defaultRoomNo);
  const [chiefComplaints, setChiefComplaints] = useState('');
  const [provisionalDiagnosis, setProvisionalDiagnosis] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  // ══════════════════════════════════════════════════════════════════════════════
  // RETURNING PATIENT (पुराना बिरामी दर्ता / ओपिडी पुर्जी) STATE
  // ══════════════════════════════════════════════════════════════════════════════
  const [existingSearchQuery, setExistingSearchQuery] = useState('');
  const [selectedExistingPatient, setSelectedExistingPatient] = useState<PatientRecord | null>(null);
  const [existingVisitDept, setExistingVisitDept] = useState(defaultDeptName);
  const [existingVisitDoctor, setExistingVisitDoctor] = useState(defaultDocName);
  const [existingVisitRoom, setExistingVisitRoom] = useState(defaultRoomNo);
  const [existingVisitComplaints, setExistingVisitComplaints] = useState('');
  const [existingBp, setExistingBp] = useState('120/80');
  const [existingPulse, setExistingPulse] = useState('74');
  const [existingTemp, setExistingTemp] = useState('98.6');
  const [existingSpo2, setExistingSpo2] = useState('98');
  const [existingWeight, setExistingWeight] = useState('56');
  const [existingFee, setExistingFee] = useState(20);
  const [isSubmittingExisting, setIsSubmittingExisting] = useState(false);

  // Auto-calculate BMI whenever height or weight changes
  useEffect(() => {
    const h = parseFloat(heightCm) / 100;
    const w = parseFloat(weightKg);
    if (h > 0 && w > 0) {
      const calculatedBmi = (w / (h * h)).toFixed(1);
      setBmi(calculatedBmi);
      const numBmi = parseFloat(calculatedBmi);
      if (numBmi < 18.5) setBmiCategory('न्यून तौल (Underweight)');
      else if (numBmi <= 24.9) setBmiCategory('सामान्य (Normal)');
      else if (numBmi <= 29.9) setBmiCategory('अधिक तौल (Overweight)');
      else setBmiCategory('मोटोपना (Obese)');
    } else {
      setBmi('');
      setBmiCategory('');
    }
  }, [heightCm, weightKg]);

  // Adjust ticket fee based on insurance and targeted groups (New Patient)
  useEffect(() => {
    if (
      hasHealthInsurance ||
      targetedGroup.includes('ज्येष्ठ नागरिक') ||
      targetedGroup.includes('अपाङ्गता') ||
      targetedGroup.includes('अति विपन्न') ||
      targetedGroup.includes('FCHV') ||
      triagePriority === 'emergency'
    ) {
      setTicketFee(0);
      setPaymentMode('निःशुल्क (Exempt / Insurance)');
    } else {
      setTicketFee(20);
      setPaymentMode('नगद (Cash)');
    }
  }, [hasHealthInsurance, targetedGroup, triagePriority]);

  // Handle Returning Patient Selection
  const handleSelectExistingPatient = (patient: PatientRecord) => {
    setSelectedExistingPatient(patient);
    if (patient.bloodPressure) setExistingBp(patient.bloodPressure);
    if (patient.pulseRate) setExistingPulse(patient.pulseRate);
    if (patient.temperatureF) setExistingTemp(patient.temperatureF);
    if (patient.spo2Percent) setExistingSpo2(patient.spo2Percent);
    if (patient.weightKg) setExistingWeight(patient.weightKg);
    if (patient.department) setExistingVisitDept(patient.department);
    if (patient.attendingDoctor) setExistingVisitDoctor(patient.attendingDoctor);
    if (patient.roomNumber) setExistingVisitRoom(patient.roomNumber);

    // Fee calculation for returning patient
    if (
      patient.hasHealthInsurance ||
      patient.targetedGroup?.includes('ज्येष्ठ नागरिक') ||
      patient.targetedGroup?.includes('अपाङ्गता') ||
      patient.targetedGroup?.includes('अति विपन्न') ||
      patient.targetedGroup?.includes('FCHV')
    ) {
      setExistingFee(0);
    } else {
      setExistingFee(20);
    }
  };

  // Search Citizens from Palika Central Citizen Master (/api/v1/citizens)
  const handleSearchCitizens = async (queryText?: string) => {
    const q = (queryText !== undefined ? queryText : citizenSearchQuery).trim();
    if (!q) {
      setCitizenResults(DEFAULT_MUNICIPAL_CITIZENS);
      return;
    }
    setIsSearchingCitizens(true);
    try {
      const res: any = await api.get('/citizens', { params: { search: q } });
      const list = Array.isArray(res) ? res : res?.data || [];
      if (list && list.length > 0) {
        setCitizenResults(list);
      } else {
        const localMatches = DEFAULT_MUNICIPAL_CITIZENS.filter((c: any) =>
          (c.fullName || c.name || '').toLowerCase().includes(q.toLowerCase()) ||
          (c.fullNameEn || '').toLowerCase().includes(q.toLowerCase()) ||
          (c.citizenshipNo || '').includes(q) ||
          (c.nationalId || '').toLowerCase().includes(q.toLowerCase()) ||
          (c.phone || '').includes(q)
        );
        setCitizenResults(localMatches.length > 0 ? localMatches : DEFAULT_MUNICIPAL_CITIZENS);
      }
    } catch {
      const localMatches = DEFAULT_MUNICIPAL_CITIZENS.filter((c: any) =>
        (c.fullName || c.name || '').toLowerCase().includes(q.toLowerCase()) ||
        (c.fullNameEn || '').toLowerCase().includes(q.toLowerCase()) ||
        (c.citizenshipNo || '').includes(q) ||
        (c.nationalId || '').toLowerCase().includes(q.toLowerCase()) ||
        (c.phone || '').includes(q)
      );
      setCitizenResults(localMatches.length > 0 ? localMatches : DEFAULT_MUNICIPAL_CITIZENS);
    } finally {
      setIsSearchingCitizens(false);
    }
  };

  // Pull citizen data into New Patient form
  const handleSelectCitizen = (cit: any) => {
    setSelectedCitizen(cit);
    setCitizenId(cit.nationalId || cit.citizenshipNo || `CIT-2081-${cit.id ? cit.id.slice(0, 4) : '0042'}`);
    const parts = (cit.fullName || '').trim().split(' ');
    setFirstName(parts[0] || '');
    if (parts.length > 2) {
      setMiddleName(parts.slice(1, -1).join(' '));
      setLastName(parts[parts.length - 1] || '');
    } else if (parts.length === 2) {
      setMiddleName('');
      setLastName(parts[1] || '');
    } else {
      setMiddleName('');
      setLastName('');
    }

    if (cit.fullNameEn) setFullNameEn(cit.fullNameEn.toUpperCase());
    if (cit.gender) setGender(cit.gender === 'male' || cit.gender === 'female' ? cit.gender : 'female');
    if (cit.citizenshipNo) setCitizenshipOrNin(cit.citizenshipNo);
    else if (cit.nationalId) setCitizenshipOrNin(cit.nationalId);
    if (cit.phone) setPhone(cit.phone);
    if (cit.wardNumber) setWardNumber(Number(cit.wardNumber));
    if (cit.tole) setToleVillage(cit.tole);
    if (cit.address) setAddress(cit.address);
    if (cit.dobBs) setDobBs(cit.dobBs);
    if (cit.age) {
      setAge(cit.age);
    } else if (cit.dateOfBirth) {
      const dob = new Date(cit.dateOfBirth);
      const calculatedAge = new Date().getFullYear() - dob.getFullYear();
      setAge(calculatedAge > 0 ? calculatedAge : 28);
    }
    if (cit.occupation) setOccupation(cit.occupation);
    if (cit.emergencyContactName) setEmergencyContactName(cit.emergencyContactName);
    if (cit.emergencyContactRelation) setEmergencyContactRelation(cit.emergencyContactRelation);
    if (cit.emergencyContactPhone) setEmergencyContactPhone(cit.emergencyContactPhone);

    setIsCitizenLookupOpen(false);
  };

  // Toggle Past Medical History tags
  const toggleMedicalHistory = (condition: string) => {
    if (pastMedicalHistory.includes(condition)) {
      setPastMedicalHistory(pastMedicalHistory.filter((c) => c !== condition));
    } else {
      setPastMedicalHistory([...pastMedicalHistory, condition]);
    }
  };

  // Quick Demo Autofill for Testing
  const handleAutofillDemo = () => {
    setFirstName('सुनिता');
    setMiddleName('कुमारी');
    setLastName('तामाङ');
    setFullNameEn('SUNITA KUMARI TAMANG');
    setAge(28);
    setDobBs('२०५४-०४-१२');
    setGender('female');
    setBloodGroup('O+');
    setCitizenshipOrNin('२७-०१-७९-००४२८');
    setCitizenId('CIT-2081-00428');
    setMaritalStatus('विवाहित');
    setOccupation('कृषि तथा पशुपालन');
    setPhone('९८४१२३४५६७');
    setWardNumber(3);
    setToleVillage('भोताङ, थाङपाल');
    setAddress('पाँचपोखरी थाङपाल गाउँपालिका-३');
    setEmergencyContactName('दावा तामाङ');
    setEmergencyContactRelation('पति');
    setEmergencyContactPhone('९८१२३४५६७८');
    setHasHealthInsurance(true);
    setInsuranceNumber('NIB-2081-009842');
    setTargetedGroup('स्वास्थ्य बीमा सेवाग्राही');
    setTriagePriority('routine');
    setBloodPressure('118/76');
    setPulseRate('74');
    setTemperatureF('98.4');
    setSpo2Percent('99');
    setRespiratoryRate('16');
    setHeightCm('156');
    setWeightKg('54');
    setBloodGlucose('98');
    setKnownAllergies('पेन्सिलिन (Penicillin allergy)');
    setPastMedicalHistory(['दम / ब्रोन्काइटिस (Asthma)']);
    setCurrentMedications('Salbutamol Inhaler (आवश्यकता अनुसार)');
    setDepartment('सामान्य चिकित्सा (General Medicine OPD)');
    setAttendingDoctor('डा. सुजन खनाल (MDGP - मेडिकल सुपरिटेन्डेन्ट)');
    setRoomNumber('कक्ष नं. १०१');
    setChiefComplaints('२ दिनदेखि सुक्खा खोकी, हल्का छाती भारी हुने र ज्वरो');
    setProvisionalDiagnosis('Acute Bronchitis (Mild Asthma Exacerbation) [J20.9]');
  };

  // Submit New Patient EHR Registration
  const handleSubmitNewPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !age) {
      setActiveTab('demographics');
      return;
    }

    setIsSubmitting(true);
    const constructedFullName = `${firstName.trim()} ${middleName.trim() ? middleName.trim() + ' ' : ''}${lastName.trim()}`.trim();
    const constructedAddress = `${address.trim()}${toleVillage ? ', ' + toleVillage.trim() : ''}`;

    try {
      await onSubmit({
        firstName: firstName.trim(),
        middleName: middleName.trim() || undefined,
        lastName: lastName.trim(),
        fullName: constructedFullName,
        fullNameEn: fullNameEn.trim() || undefined,
        age: Number(age),
        dobBs: dobBs.trim() || undefined,
        gender,
        bloodGroup,
        citizenshipOrNin: citizenshipOrNin.trim() || undefined,
        citizenId: citizenId.trim() || undefined,
        crossSectoralAlerts: [
          'पालिका एकीकृत नागरिक लगतसँग आबद्ध',
          hasHealthInsurance ? 'स्वास्थ्य बीमा बोर्ड (HIB) सक्रिय' : 'सामान्य नागरिक सूची',
          'वडा नं. ' + wardNumber + ' डिजिटल प्रोफाइल अपडेटेड',
        ],
        maritalStatus,
        occupation,
        phone: phone.trim() || undefined,
        wardNumber,
        address: constructedAddress,
        toleVillage: toleVillage.trim() || undefined,
        emergencyContactName: emergencyContactName.trim() || undefined,
        emergencyContactRelation: emergencyContactRelation.trim() || undefined,
        emergencyContactPhone: emergencyContactPhone.trim() || undefined,
        hasHealthInsurance,
        insuranceNumber: hasHealthInsurance ? insuranceNumber.trim() : undefined,
        targetedGroup,
        paymentMode,
        healthFacilityName: 'पाँचपोखरी प्राथमिक आधारभूत अस्पताल',
        visitType: 'new',
        department,
        attendingDoctor,
        roomNumber,
        ticketFee,
        ticketStatus: 'active',
        triagePriority,
        bloodPressure,
        pulseRate,
        temperatureF,
        spo2Percent,
        respiratoryRate,
        heightCm,
        weightKg,
        bmi,
        bmiCategory,
        bloodGlucose,
        knownAllergies: knownAllergies.trim() || undefined,
        pastMedicalHistory,
        currentMedications: currentMedications.trim() || undefined,
        chiefComplaint: chiefComplaints.trim() || undefined,
        chiefComplaints: chiefComplaints.trim() || undefined,
        provisionalDiagnosis: provisionalDiagnosis.trim() || undefined,
      });
      onClose();
    } catch (err) {
      console.error('Failed to create EHR patient', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Returning Patient OPD Ticket (Fast Follow-up)
  const handleSubmitExistingPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExistingPatient) return;

    setIsSubmittingExisting(true);
    const visitPayload: Partial<PatientRecord> = {
      ...selectedExistingPatient,
      department: existingVisitDept,
      attendingDoctor: existingVisitDoctor,
      roomNumber: existingVisitRoom,
      ticketFee: existingFee,
      ticketStatus: 'active',
      visitType: 'followup',
      bloodPressure: existingBp || selectedExistingPatient.bloodPressure,
      pulseRate: existingPulse || selectedExistingPatient.pulseRate,
      temperatureF: existingTemp || selectedExistingPatient.temperatureF,
      spo2Percent: existingSpo2 || selectedExistingPatient.spo2Percent,
      weightKg: existingWeight || selectedExistingPatient.weightKg,
      chiefComplaint: existingVisitComplaints.trim() || selectedExistingPatient.chiefComplaint || 'फलो-अप परामर्श',
      chiefComplaints: existingVisitComplaints.trim() || selectedExistingPatient.chiefComplaints || 'फलो-अप परामर्श',
    };

    try {
      if (onUpdatePatient && selectedExistingPatient.id) {
        await onUpdatePatient(selectedExistingPatient.id, visitPayload);
      } else {
        await onSubmit(visitPayload);
      }
      onClose();
    } catch (err) {
      console.error('Failed to issue returning patient ticket', err);
    } finally {
      setIsSubmittingExisting(false);
    }
  };

  // Filter Existing Patients for fast lookup
  const matchingExistingPatients = existingPatients.filter((p) => {
    if (!existingSearchQuery.trim()) return true;
    const q = existingSearchQuery.trim().toLowerCase();
    return (
      (p.fullName || '').toLowerCase().includes(q) ||
      (p.patientNo || '').toLowerCase().includes(q) ||
      (p.phone || '').includes(q) ||
      (p.citizenshipOrNin || '').toLowerCase().includes(q) ||
      (p.insuranceNumber || '').toLowerCase().includes(q)
    );
  });

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9998,
        padding: '1rem',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '940px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '94vh',
          fontFamily: "'Outfit', 'Noto Sans Devanagari', sans-serif",
          border: '1px solid #e2e8f0',
        }}
      >
        {/* ── MODERN EHR HEADER BAR ── */}
        <div
          style={{
            padding: '16px 24px',
            backgroundColor: '#072e73',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '2px solid #1e4a9c',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
              }}
            >
              <HeartPulse size={26} color="#38bdf8" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                  {registrationMode === 'new'
                    ? 'आधुनिक Electronic Health Record (EHR) नयाँ बिरामी दर्ता'
                    : 'पुराना बिरामी दर्ता तथा ओपिडी पुर्जी (Re-visit OPD Ticket)'}
                </h2>
                <span
                  style={{
                    backgroundColor: registrationMode === 'new' ? '#10b981' : '#f59e0b',
                    color: '#ffffff',
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    letterSpacing: '0.04em',
                  }}
                >
                  {registrationMode === 'new' ? 'NEW EHR 2026' : 'QUICK RE-VISIT 15s'}
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', margin: '2px 0 0', color: '#93bbf6' }}>
                पाँचपोखरी प्राथमिक आधारभूत अस्पताल • एकिकृत पालिका डिजिटल ट्विन र एकल नागरिक लगत प्रणाली
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {registrationMode === 'new' && (
              <button
                type="button"
                onClick={handleAutofillDemo}
                title="परीक्षणका लागि नमुना बिरामी डेटा भर्नुहोस्"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease',
                }}
              >
                <Sparkles size={14} color="#fde047" />
                <span>नमुना डेटा भर्नुहोस्</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                color: '#ffffff',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* ── TOP SEGMENTED MODE SELECTOR (नयाँ vs पुराना बिरामी दर्ता) ── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            backgroundColor: '#f1f5f9',
            borderBottom: '2px solid #cbd5e1',
          }}
        >
          <button
            type="button"
            onClick={() => setRegistrationMode('new')}
            style={{
              padding: '13px 20px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 800,
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              backgroundColor: registrationMode === 'new' ? '#ffffff' : '#f8fafc',
              color: registrationMode === 'new' ? '#1d4ed8' : '#64748b',
              borderBottom: registrationMode === 'new' ? '3px solid #2563eb' : '3px solid transparent',
              transition: 'all 0.2s ease',
            }}
          >
            <UserPlus size={18} color={registrationMode === 'new' ? '#2563eb' : '#64748b'} />
            <span>१. नयाँ बिरामी दर्ता (New Patient Registration)</span>
            <span
              style={{
                fontSize: '0.68rem',
                backgroundColor: registrationMode === 'new' ? '#dbeafe' : '#e2e8f0',
                color: registrationMode === 'new' ? '#1e40af' : '#64748b',
                padding: '2px 8px',
                borderRadius: '9999px',
              }}
            >
              सम्पूर्ण EHR
            </span>
          </button>

          <button
            type="button"
            onClick={() => setRegistrationMode('existing')}
            style={{
              padding: '13px 20px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 800,
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              backgroundColor: registrationMode === 'existing' ? '#ffffff' : '#f8fafc',
              color: registrationMode === 'existing' ? '#047857' : '#64748b',
              borderBottom: registrationMode === 'existing' ? '3px solid #059669' : '3px solid transparent',
              transition: 'all 0.2s ease',
            }}
          >
            <Repeat size={18} color={registrationMode === 'existing' ? '#059669' : '#64748b'} />
            <span>२. पुराना बिरामी दर्ता / ओपिडी पुर्जी (Existing Patient Re-visit Ticket)</span>
            <span
              style={{
                fontSize: '0.68rem',
                backgroundColor: registrationMode === 'existing' ? '#dcfce7' : '#e2e8f0',
                color: registrationMode === 'existing' ? '#166534' : '#64748b',
                padding: '2px 8px',
                borderRadius: '9999px',
                fontWeight: 700,
              }}
            >
              द्रुत १५ सेकेन्ड
            </span>
          </button>
        </div>

        {/* ════════════════════════════════════════════════════════════════════════
            MODE 1: NEW PATIENT REGISTRATION (सम्पूर्ण आधुनिक EHR फारम)
           ════════════════════════════════════════════════════════════════════════ */}
        {registrationMode === 'new' && (
          <>
            {/* ALLERGY SAFETY BANNER */}
            {knownAllergies.trim() && (
              <div
                style={{
                  backgroundColor: '#fef2f2',
                  borderBottom: '1px solid #fecaca',
                  padding: '8px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: '#991b1b',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                }}
              >
                <AlertOctagon size={18} color="#dc2626" />
                <span>
                  <strong>CRITICAL ALLERGY ALERT:</strong> यो बिरामीलाई निम्न औषधि/खानाको एलर्जी रहेको दर्ता छ:{' '}
                  <u style={{ color: '#dc2626' }}>{knownAllergies}</u>
                </span>
              </div>
            )}

            {/* STEPPED CLINICAL TABS BAR */}
            <div
              style={{
                display: 'flex',
                backgroundColor: '#f8fafc',
                borderBottom: '1px solid #e2e8f0',
                padding: '4px 16px',
                gap: '6px',
                overflowX: 'auto',
              }}
            >
              {[
                { id: 'demographics', num: '१', label: 'व्यक्तिगत पहिचान', sub: 'Demographics & ID', icon: <User size={15} /> },
                { id: 'address_insurance', num: '२', label: 'सम्पर्क तथा बीमा', sub: 'Contact & Insurance', icon: <MapPin size={15} /> },
                { id: 'triage_vitals', num: '३', label: 'भाइटल्स र Triage', sub: 'Clinical Vitals', icon: <Activity size={15} /> },
                { id: 'clinical_opd', num: '४', label: 'ओपिडी र परामर्श', sub: 'OPD & Diagnosis', icon: <Stethoscope size={15} /> },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as any)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: 'none',
                      backgroundColor: isActive ? '#ffffff' : 'transparent',
                      color: isActive ? '#1d4ed8' : '#64748b',
                      fontWeight: isActive ? 800 : 600,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      boxShadow: isActive ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                      borderBottom: isActive ? '2px solid #2563eb' : '2px solid transparent',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <div
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: isActive ? '#eff6ff' : '#e2e8f0',
                        color: isActive ? '#2563eb' : '#64748b',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                      }}
                    >
                      {tab.num}
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ lineHeight: 1.1 }}>{tab.label}</div>
                      <small style={{ fontSize: '0.68rem', color: isActive ? '#3b82f6' : '#94a3b8', fontWeight: 500 }}>
                        {tab.sub}
                      </small>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* FORM CONTENT AREA */}
            <form onSubmit={handleSubmitNewPatient} style={{ padding: '20px 24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* TAB 1: DEMOGRAPHICS & UNIFIED CITIZEN MASTER INTEGRATION */}
              {activeTab === 'demographics' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {/* 🏛️ UNIFIED CITIZEN REGISTRY LOOKUP CARD */}
                  <div
                    style={{
                      backgroundColor: '#eff6ff',
                      borderRadius: '12px',
                      border: '1.5px solid #bfdbfe',
                      padding: '12px 16px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Building2 size={18} color="#1d4ed8" />
                        <div>
                          <span style={{ fontWeight: 800, fontSize: '0.86rem', color: '#1e3a8a' }}>
                            एकीकृत पालिका नागरिक लगतबाट तान्नुहोस् (Unified Citizen Master Integration)
                          </span>
                          <p style={{ margin: '1px 0 0 0', fontSize: '0.74rem', color: '#3b82f6' }}>
                            नागरिकले पालिकाबाट जुनसुकै सेवा लिएको भए पनि एउटै स्थायी दर्ता नम्बर (National ID / Citizen ID) रहनेछ
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setIsCitizenLookupOpen(!isCitizenLookupOpen);
                          if (!isCitizenLookupOpen && citizenResults.length === 0) {
                            handleSearchCitizens('');
                          }
                        }}
                        style={{
                          backgroundColor: '#2563eb',
                          color: '#ffffff',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <Search size={14} />
                        <span>{isCitizenLookupOpen ? 'लगत बन्द गर्नुहोस्' : 'नागरिक लगत खोज्नुहोस्'}</span>
                      </button>
                    </div>

                    {/* Expandable Search Input & Live Results */}
                    {isCitizenLookupOpen && (
                      <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px dashed #bfdbfe' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <div style={{ position: 'relative', flex: 1 }}>
                            <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                            <input
                              type="text"
                              placeholder="राष्ट्रिय परिचयपत्र (NID), नागरिकता नं, फोन वा नाम (उदा: २७-०१, सुनिता, ९८४१...)"
                              value={citizenSearchQuery}
                              onChange={(e) => {
                                setCitizenSearchQuery(e.target.value);
                                handleSearchCitizens(e.target.value);
                              }}
                              style={{
                                width: '100%',
                                padding: '8px 12px 8px 32px',
                                borderRadius: '8px',
                                border: '1px solid #93c5fd',
                                fontSize: '0.84rem',
                                backgroundColor: '#ffffff',
                              }}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleSearchCitizens()}
                            disabled={isSearchingCitizens}
                            style={{
                              backgroundColor: '#1d4ed8',
                              color: '#ffffff',
                              border: 'none',
                              padding: '8px 16px',
                              borderRadius: '8px',
                              fontWeight: 700,
                              fontSize: '0.82rem',
                              cursor: 'pointer',
                            }}
                          >
                            {isSearchingCitizens ? 'खोजिँदै...' : 'खोज्नुहोस्'}
                          </button>
                        </div>

                        {/* Citizen search results */}
                        <div style={{ marginTop: '10px', maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {citizenResults.map((cit) => (
                            <div
                              key={cit.id || cit.citizenshipNo}
                              onClick={() => handleSelectCitizen(cit)}
                              style={{
                                backgroundColor: '#ffffff',
                                border: '1px solid #e2e8f0',
                                padding: '8px 12px',
                                borderRadius: '8px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f0fdf4')}
                              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
                            >
                              <div>
                                <div style={{ fontWeight: 800, fontSize: '0.84rem', color: '#0f172a' }}>
                                  {cit.fullName} ({cit.fullNameEn || 'Citizen'}) • वडा नं. {cit.wardNumber}, {cit.tole || ''}
                                </div>
                                <div style={{ fontSize: '0.74rem', color: '#64748b', display: 'flex', gap: '10px', marginTop: '2px' }}>
                                  <span>नागरिकता/NID: <strong>{cit.citizenshipNo || cit.nationalId}</strong></span>
                                  <span>फोन: {cit.phone || '—'}</span>
                                  <span>उमेर: {cit.age || 28} वर्ष ({cit.gender === 'female' ? 'महिला' : 'पुरुष'})</span>
                                </div>
                              </div>
                              <button
                                type="button"
                                style={{
                                  backgroundColor: '#10b981',
                                  color: '#ffffff',
                                  border: 'none',
                                  padding: '4px 10px',
                                  borderRadius: '6px',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                }}
                              >
                                <Check size={13} />
                                <span>तान्नुहोस्</span>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Linked Citizen Confirmation Badge */}
                    {citizenId && (
                      <div
                        style={{
                          marginTop: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          backgroundColor: '#dcfce7',
                          border: '1px solid #86efac',
                          borderRadius: '8px',
                          padding: '6px 12px',
                          fontSize: '0.78rem',
                          color: '#166534',
                          fontWeight: 700,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <BadgeCheck size={16} color="#16a34a" />
                          <span>
                            प्रमाणित पालिका एकल नागरिक कोड (Unified Citizen ID): <strong>{citizenId}</strong> सँग आबद्ध
                          </span>
                        </div>
                        <span style={{ fontSize: '0.7rem', color: '#15803d', backgroundColor: '#ffffff', padding: '1px 6px', borderRadius: '4px' }}>
                          अन्तर-शाखा सिङ्क सक्रिय
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Standard Demographics Inputs */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a' }}>
                      १. बिरामीको व्यक्तिगत विवरण तथा राष्ट्रिय पहिचान (Patient Identity & Demographics)
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>* चिन्ह लगाइएका फिल्डहरू अनिवार्य छन्</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                        पहिलो नाम (First Name) *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="उदा: सुनिता"
                        className="dt-input"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                        बीचको नाम (Middle Name)
                      </label>
                      <input
                        type="text"
                        placeholder="उदा: कुमारी"
                        className="dt-input"
                        value={middleName}
                        onChange={(e) => setMiddleName(e.target.value)}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                        थर (Last Name) *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="उदा: तामाङ"
                        className="dt-input"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                        अंग्रेजीमा पुरा नाम (Full Name in English - EHR Capital)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. SUNITA KUMARI TAMANG"
                        className="dt-input"
                        value={fullNameEn}
                        onChange={(e) => setFullNameEn(e.target.value.toUpperCase())}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', letterSpacing: '0.03em' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                        नागरिकता / राष्ट्रिय परिचयपत्र (NID / Citizenship No)
                      </label>
                      <input
                        type="text"
                        placeholder="२७-०१-७९-XXXXX"
                        className="dt-input"
                        value={citizenshipOrNin}
                        onChange={(e) => setCitizenshipOrNin(e.target.value)}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                        उमेर (Age in Years) *
                      </label>
                      <input
                        type="number"
                        required
                        min={0}
                        max={125}
                        placeholder="उदा: 28"
                        className="dt-input"
                        value={age}
                        onChange={(e) => setAge(e.target.value ? Number(e.target.value) : '')}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                        जन्ममिति वि.सं. (DOB in BS)
                      </label>
                      <input
                        type="text"
                        placeholder="उदा: २०५४-०४-१२"
                        className="dt-input"
                        value={dobBs}
                        onChange={(e) => setDobBs(e.target.value)}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                        लिङ्ग (Gender) *
                      </label>
                      <select
                        className="dt-input"
                        value={gender}
                        onChange={(e) => setGender(e.target.value as any)}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                      >
                        <option value="female">महिला (Female)</option>
                        <option value="male">पुरुष (Male)</option>
                        <option value="other">अन्य (Other)</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                        रक्त समूह (Blood Group)
                      </label>
                      <select
                        className="dt-input"
                        value={bloodGroup}
                        onChange={(e) => setBloodGroup(e.target.value)}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', fontWeight: 700, color: '#dc2626' }}
                      >
                        <option value="A+">A+ (A Positive)</option>
                        <option value="A-">A- (A Negative)</option>
                        <option value="B+">B+ (B Positive)</option>
                        <option value="B-">B- (B Negative)</option>
                        <option value="O+">O+ (O Positive)</option>
                        <option value="O-">O- (O Negative)</option>
                        <option value="AB+">AB+ (AB Positive)</option>
                        <option value="AB-">AB- (AB Negative)</option>
                        <option value="Unknown">अज्ञात (Unknown)</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                        वैवाहिक स्थिति (Marital Status)
                      </label>
                      <select
                        className="dt-input"
                        value={maritalStatus}
                        onChange={(e) => setMaritalStatus(e.target.value)}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                      >
                        <option value="विवाहित">विवाहित (Married)</option>
                        <option value="अविवाहित">अविवाहित (Unmarried)</option>
                        <option value="एकल / विधुर / विधवा">एकल / विधुर / विधवा (Single/Widowed)</option>
                        <option value="पारपाचुके">पारपाचुके (Divorced)</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                        पेशा (Occupation)
                      </label>
                      <input
                        type="text"
                        placeholder="उदा: कृषि तथा पशुपालन"
                        className="dt-input"
                        value={occupation}
                        onChange={(e) => setOccupation(e.target.value)}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: ADDRESS & INSURANCE */}
              {activeTab === 'address_insurance' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a' }}>
                    २. स्थायी तथा वर्तमान बसोबास ठेगाना (Address & Contact)
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1.5fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                        सम्पर्क फोन / मोबाइल नं.
                      </label>
                      <input
                        type="text"
                        placeholder="९८४१XXXXXX"
                        className="dt-input"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                        वडा नं. (Ward Number) *
                      </label>
                      <select
                        className="dt-input"
                        value={wardNumber}
                        onChange={(e) => setWardNumber(Number(e.target.value))}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', fontWeight: 700 }}
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((w) => (
                          <option key={w} value={w}>वडा नं. {w}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                        टोल / गाउँ (Tole / Settlement)
                      </label>
                      <input
                        type="text"
                        placeholder="उदा: भोताङ, थाङपालधाप, मानेखर्क"
                        className="dt-input"
                        value={toleVillage}
                        onChange={(e) => setToleVillage(e.target.value)}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      पुरा ठेगाना (Full Address)
                    </label>
                    <input
                      type="text"
                      className="dt-input"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                    />
                  </div>

                  {/* Emergency Contact Card */}
                  <div style={{ backgroundColor: '#fef2f2', borderRadius: '12px', padding: '12px 16px', border: '1px solid #fee2e2' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#991b1b', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Phone size={14} />
                      <span>आपतकालीन सम्पर्क व्यक्ति (Emergency Contact Person)</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1.2fr', gap: '10px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#7f1d1d', marginBottom: '2px' }}>
                          सम्पर्क व्यक्तिको नाम
                        </label>
                        <input
                          type="text"
                          placeholder="उदा: दावा तामाङ"
                          className="dt-input"
                          value={emergencyContactName}
                          onChange={(e) => setEmergencyContactName(e.target.value)}
                          style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #fca5a5', fontSize: '0.82rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#7f1d1d', marginBottom: '2px' }}>
                          नाता (Relation)
                        </label>
                        <input
                          type="text"
                          placeholder="उदा: पति, आमा, दाजु"
                          className="dt-input"
                          value={emergencyContactRelation}
                          onChange={(e) => setEmergencyContactRelation(e.target.value)}
                          style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #fca5a5', fontSize: '0.82rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#7f1d1d', marginBottom: '2px' }}>
                          सम्पर्क फोन नं.
                        </label>
                        <input
                          type="text"
                          placeholder="९८१२XXXXXX"
                          className="dt-input"
                          value={emergencyContactPhone}
                          onChange={(e) => setEmergencyContactPhone(e.target.value)}
                          style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #fca5a5', fontSize: '0.82rem' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Health Insurance & Social Security Card */}
                  <div style={{ backgroundColor: '#f0fdf4', borderRadius: '12px', padding: '12px 16px', border: '1px solid #bbf7d0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#166534', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <ShieldCheck size={16} />
                        <span>नेपाल सरकार स्वास्थ्य बीमा कार्यक्रम (Health Insurance Board - HIB)</span>
                      </div>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 800, color: '#15803d' }}>
                        <input
                          type="checkbox"
                          checked={hasHealthInsurance}
                          onChange={(e) => setHasHealthInsurance(e.target.checked)}
                          style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                        />
                        <span>स्वास्थ्य बीमा कार्ड छ (Insured)</span>
                      </label>
                    </div>

                    {hasHealthInsurance && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '10px', marginTop: '6px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#14532d', marginBottom: '2px' }}>
                            बीमा परिचयपत्र नं. (HIB Card Number) *
                          </label>
                          <input
                            type="text"
                            placeholder="NIB-2081-XXXXXX"
                            className="dt-input"
                            value={insuranceNumber}
                            onChange={(e) => setInsuranceNumber(e.target.value)}
                            style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #86efac', fontSize: '0.84rem' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#14532d', marginBottom: '2px' }}>
                            सुविधा स्थिति
                          </label>
                          <div style={{ fontSize: '0.8rem', color: '#15803d', fontWeight: 700, padding: '7px 10px', backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #86efac' }}>
                            ✓ रु. १,००,००० सम्म निःशुल्क सेवा प्राप्त
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: CLINICAL VITALS, TRIAGE & ALLERGIES */}
              {activeTab === 'triage_vitals' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a' }}>
                      ३. प्रारम्भिक स्वास्थ्य परीक्षण तथा Triage (Clinical Vitals & Acuity)
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>अस्पताल नर्सिङ वा अहेवद्वारा जाँच</span>
                  </div>

                  {/* Triage Acuity Selector */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
                    {[
                      { id: 'routine', label: 'सामान्य (Routine)', color: '#10b981', bg: '#ecfdf5', desc: 'नियमित स्वास्थ्य समस्या' },
                      { id: 'urgent', label: 'अति आवश्यक (Urgent)', color: '#f59e0b', bg: '#fffbeb', desc: 'तीव्र दुखाई, उच्च ज्वरो' },
                      { id: 'emergency', label: 'आकस्मिक (Emergency)', color: '#dc2626', bg: '#fef2f2', desc: 'तत्काल चिकित्सक आवश्यक' },
                    ].map((t) => {
                      const isSel = triagePriority === t.id;
                      return (
                        <div
                          key={t.id}
                          onClick={() => setTriagePriority(t.id as any)}
                          style={{
                            padding: '10px 14px',
                            borderRadius: '10px',
                            border: `2px solid ${isSel ? t.color : '#e2e8f0'}`,
                            backgroundColor: isSel ? t.bg : '#ffffff',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontWeight: 800, fontSize: '0.84rem', color: t.color }}>{t.label}</span>
                            {isSel && <CheckCircle2 size={16} color={t.color} />}
                          </div>
                          <small style={{ fontSize: '0.7rem', color: '#64748b', display: 'block', marginTop: '2px' }}>
                            {t.desc}
                          </small>
                        </div>
                      );
                    })}
                  </div>

                  {/* Vitals Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#334155', marginBottom: '2px' }}>
                        रक्तचाप (BP mmHg)
                      </label>
                      <input
                        type="text"
                        placeholder="120/80"
                        className="dt-input"
                        value={bloodPressure}
                        onChange={(e) => setBloodPressure(e.target.value)}
                        style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#334155', marginBottom: '2px' }}>
                        नाडीको गति (Pulse bpm)
                      </label>
                      <input
                        type="text"
                        placeholder="76"
                        className="dt-input"
                        value={pulseRate}
                        onChange={(e) => setPulseRate(e.target.value)}
                        style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#334155', marginBottom: '2px' }}>
                        तापक्रम (Temp °F)
                      </label>
                      <input
                        type="text"
                        placeholder="98.6"
                        className="dt-input"
                        value={temperatureF}
                        onChange={(e) => setTemperatureF(e.target.value)}
                        style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#334155', marginBottom: '2px' }}>
                        अक्सिजन (SpO2 %)
                      </label>
                      <input
                        type="text"
                        placeholder="98"
                        className="dt-input"
                        value={spo2Percent}
                        onChange={(e) => setSpo2Percent(e.target.value)}
                        style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                      />
                    </div>
                  </div>

                  {/* Height, Weight, BMI */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#334155', marginBottom: '2px' }}>
                        उचाई (Height cm)
                      </label>
                      <input
                        type="number"
                        placeholder="158"
                        className="dt-input"
                        value={heightCm}
                        onChange={(e) => setHeightCm(e.target.value)}
                        style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#334155', marginBottom: '2px' }}>
                        तौल (Weight kg)
                      </label>
                      <input
                        type="number"
                        placeholder="56"
                        className="dt-input"
                        value={weightKg}
                        onChange={(e) => setWeightKg(e.target.value)}
                        style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#334155', marginBottom: '2px' }}>
                        BMI सूचक (Calculated)
                      </label>
                      <div
                        style={{
                          padding: '7px 10px',
                          backgroundColor: '#f1f5f9',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.85rem',
                          fontWeight: 800,
                          color: '#0f172a',
                        }}
                      >
                        {bmi ? `${bmi} kg/m² (${bmiCategory})` : '—'}
                      </div>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#334155', marginBottom: '2px' }}>
                        ग्लुकोज (RBS mg/dL)
                      </label>
                      <input
                        type="text"
                        placeholder="102"
                        className="dt-input"
                        value={bloodGlucose}
                        onChange={(e) => setBloodGlucose(e.target.value)}
                        style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                      />
                    </div>
                  </div>

                  {/* Allergy & Chronic Conditions */}
                  <div style={{ backgroundColor: '#fff7ed', borderRadius: '12px', padding: '12px 16px', border: '1px solid #fed7aa' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#9a3412', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <AlertTriangle size={15} />
                      <span>औषधि तथा खानाको एलर्जी (Known Allergies - EHR Safety Critical)</span>
                    </div>
                    <input
                      type="text"
                      placeholder="उदा: पेन्सिलिन (Penicillin), सल्फा (Sulfa), प्यारासिटामोल..."
                      className="dt-input"
                      value={knownAllergies}
                      onChange={(e) => setKnownAllergies(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #fdba74', fontSize: '0.85rem', color: '#7c2d12', fontWeight: 700 }}
                    />
                  </div>
                </div>
              )}

              {/* TAB 4: OPD CONSULTATION & DOCTOR */}
              {activeTab === 'clinical_opd' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a' }}>
                    ४. ओपिडी विभाग, चिकित्सक र प्रारम्भिक समस्या (OPD Consultation & Complaints)
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1.4fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                        ओपिडी विभाग (OPD Department) *
                      </label>
                      <select
                        className="dt-input"
                        value={department}
                        onChange={(e) => {
                          const val = e.target.value;
                          setDepartment(val);
                          const matched = departmentsList.find((d) => d.name === val);
                          if (matched?.roomNo) setRoomNumber(matched.roomNo);
                          if (typeof matched?.fee === 'number') setTicketFee(matched.fee);
                        }}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 700 }}
                      >
                        {departmentsList.map((d) => (
                          <option key={d.id} value={d.name}>
                            {d.name} {d.roomNo ? `(${d.roomNo})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                        हेर्ने चिकित्सक (Attending Doctor)
                      </label>
                      <select
                        className="dt-input"
                        value={attendingDoctor}
                        onChange={(e) => setAttendingDoctor(e.target.value)}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 700 }}
                      >
                        {doctorsList.length > 0 ? (
                          doctorsList.map((doc) => {
                            const docName = doc.nameNepali || doc.name;
                            const val = `${docName} (${doc.designation}${doc.nmcNumber ? ` - NMC ${doc.nmcNumber}` : ''})`;
                            return (
                              <option key={doc.id} value={val}>
                                {docName} ({doc.designation})
                              </option>
                            );
                          })
                        ) : (
                          <option value="डा. सुजन खनाल (MDGP)">डा. सुजन खनाल (MDGP)</option>
                        )}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                        कक्ष नं. (Room No)
                      </label>
                      <input
                        type="text"
                        className="dt-input"
                        value={roomNumber}
                        onChange={(e) => setRoomNumber(e.target.value)}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 700 }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      मुख्य समस्या तथा लक्षणहरू (Chief Complaints) *
                    </label>
                    <textarea
                      rows={2}
                      placeholder="उदा: २ दिनदेखि सुक्खा खोकी, हल्का छाती भारी हुने र ज्वरो आएको..."
                      className="dt-input"
                      value={chiefComplaints}
                      onChange={(e) => setChiefComplaints(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                    />
                  </div>

                  {/* Fee Breakdown */}
                  <div style={{ backgroundColor: '#f8fafc', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>ओपिडी पुर्जी शुल्क: रु. {ticketFee}</div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b' }}>भुक्तानी माध्यम: {paymentMode}</div>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 700 }}>
                      {hasHealthInsurance ? '✓ स्वास्थ्य बीमा बोर्ड अन्तर्गत निःशुल्क' : '✓ सरकारी तोकिएको दर'}
                    </div>
                  </div>
                </div>
              )}

              {/* FOOTER ACTION BUTTONS (NEW PATIENT) */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '16px',
                  borderTop: '1px solid #e2e8f0',
                  marginTop: 'auto',
                }}
              >
                <div>
                  {activeTab !== 'demographics' && (
                    <button
                      type="button"
                      onClick={() => {
                        if (activeTab === 'clinical_opd') setActiveTab('triage_vitals');
                        else if (activeTab === 'triage_vitals') setActiveTab('address_insurance');
                        else if (activeTab === 'address_insurance') setActiveTab('demographics');
                      }}
                      style={{
                        padding: '9px 16px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        backgroundColor: '#ffffff',
                        color: '#334155',
                        fontWeight: 700,
                        cursor: 'pointer',
                        fontSize: '0.82rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <ArrowLeft size={15} />
                      <span>अघिल्लो चरण</span>
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  {activeTab !== 'clinical_opd' ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (activeTab === 'demographics') setActiveTab('address_insurance');
                        else if (activeTab === 'address_insurance') setActiveTab('triage_vitals');
                        else if (activeTab === 'triage_vitals') setActiveTab('clinical_opd');
                      }}
                      style={{
                        padding: '9px 20px',
                        borderRadius: '8px',
                        backgroundColor: '#2563eb',
                        color: '#ffffff',
                        border: 'none',
                        fontWeight: 700,
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <span>पछिल्लो चरण</span>
                      <ArrowRight size={15} />
                    </button>
                  ) : null}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                      padding: '9px 22px',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: '#dc2626',
                      color: '#ffffff',
                      fontWeight: 800,
                      cursor: 'pointer',
                      fontSize: '0.88rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 14px rgba(220, 38, 38, 0.3)',
                    }}
                  >
                    <CheckCircle2 size={17} />
                    <span>{isSubmitting ? 'दर्ता हुँदैछ...' : '✓ नयाँ बिरामी दर्ता गरि EHR टिकट जारी गर्नुहोस्'}</span>
                  </button>
                </div>
              </div>
            </form>
          </>
        )}

        {/* ════════════════════════════════════════════════════════════════════════
            MODE 2: RETURNING PATIENT RE-VISIT TICKET (पुराना बिरामी ओपिडी पुर्जी)
           ════════════════════════════════════════════════════════════════════════ */}
        {registrationMode === 'existing' && (
          <form onSubmit={handleSubmitExistingPatient} style={{ padding: '20px 24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* FAST LOOKUP SEARCH BAR */}
            <div
              style={{
                backgroundColor: '#f0fdf4',
                padding: '14px 18px',
                borderRadius: '12px',
                border: '1.5px solid #86efac',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Repeat size={18} color="#059669" />
                <span style={{ fontWeight: 800, fontSize: '0.88rem', color: '#166534' }}>
                  पुराना बिरामी खोजी (Instant Patient Lookup by MRN, Phone, NID or Name)
                </span>
                <span style={{ fontSize: '0.72rem', backgroundColor: '#ffffff', color: '#15803d', padding: '2px 8px', borderRadius: '12px', border: '1px solid #86efac', fontWeight: 700 }}>
                  कुल दर्ता: {existingPatients.length} जना
                </span>
              </div>

              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#059669' }} />
                <input
                  type="text"
                  placeholder="बिरामी दर्ता नं (उदा: PT-2081-0001), नागरिकता/NID, फोन वा नाम हालेर खोज्नुहोस्..."
                  value={existingSearchQuery}
                  onChange={(e) => setExistingSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px 10px 36px',
                    borderRadius: '8px',
                    border: '1.5px solid #34d399',
                    fontSize: '0.88rem',
                    outline: 'none',
                    backgroundColor: '#ffffff',
                    fontWeight: 600,
                  }}
                />
              </div>

              {/* Matching list if not yet selected or searching */}
              {matchingExistingPatients.length > 0 && (
                <div style={{ marginTop: '10px', maxHeight: '160px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {matchingExistingPatients.map((p) => {
                    const isSelected = selectedExistingPatient?.id === p.id;
                    return (
                      <div
                        key={p.id || p.patientNo}
                        onClick={() => handleSelectExistingPatient(p)}
                        style={{
                          backgroundColor: isSelected ? '#dcfce7' : '#ffffff',
                          border: isSelected ? '1.5px solid #16a34a' : '1px solid #cbd5e1',
                          borderRadius: '8px',
                          padding: '8px 12px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          cursor: 'pointer',
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ backgroundColor: '#072e73', color: '#ffffff', padding: '1px 6px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 800 }}>
                              {p.patientNo}
                            </span>
                            <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#0f172a' }}>
                              {p.fullName}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                              ({p.gender === 'female' ? 'महिला' : 'पुरुष'}, {p.age} वर्ष) • वडा नं. {p.wardNumber}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#475569', display: 'flex', gap: '10px', marginTop: '2px' }}>
                            <span>फोन: {p.phone || '—'}</span>
                            <span>रक्त समूह: <strong style={{ color: '#dc2626' }}>{p.bloodGroup || '—'}</strong></span>
                            {p.hasHealthInsurance && <span style={{ color: '#16a34a', fontWeight: 700 }}>✓ स्वास्थ्य बीमा कार्ड</span>}
                            {p.knownAllergies && <span style={{ color: '#dc2626', fontWeight: 700 }}>⚠️ एलर्जी: {p.knownAllergies}</span>}
                          </div>
                        </div>

                        <button
                          type="button"
                          style={{
                            backgroundColor: isSelected ? '#15803d' : '#059669',
                            color: '#ffffff',
                            border: 'none',
                            padding: '5px 12px',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          {isSelected ? '✓ छानिएको' : 'छान्नुहोस्'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* SELECTED PATIENT VERIFIED PROFILE CARD */}
            {selectedExistingPatient ? (
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: '1.5px solid #2563eb',
                  padding: '14px 18px',
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.08)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ backgroundColor: '#1e40af', color: '#ffffff', padding: '2px 8px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 800 }}>
                        {selectedExistingPatient.patientNo}
                      </span>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                        {selectedExistingPatient.fullName}
                      </h3>
                      {selectedExistingPatient.fullNameEn && (
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                          ({selectedExistingPatient.fullNameEn})
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '6px', fontSize: '0.78rem', color: '#334155' }}>
                      <span>उमेर/लिङ्ग: <strong>{selectedExistingPatient.age} वर्ष / {selectedExistingPatient.gender === 'female' ? 'महिला' : 'पुरुष'}</strong></span>
                      <span>वडा नं: <strong>{selectedExistingPatient.wardNumber} ({selectedExistingPatient.address || 'पाँचपोखरी'})</strong></span>
                      <span>रक्त समूह: <strong style={{ color: '#dc2626' }}>{selectedExistingPatient.bloodGroup || 'O+'}</strong></span>
                      <span>फोन: <strong>{selectedExistingPatient.phone || '—'}</strong></span>
                      {selectedExistingPatient.citizenshipOrNin && (
                        <span>NID/नागरिकता: <strong>{selectedExistingPatient.citizenshipOrNin}</strong></span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                    <span
                      style={{
                        backgroundColor: selectedExistingPatient.hasHealthInsurance ? '#dcfce7' : '#f1f5f9',
                        color: selectedExistingPatient.hasHealthInsurance ? '#166534' : '#475569',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                      }}
                    >
                      {selectedExistingPatient.hasHealthInsurance
                        ? `✓ HIB बीमा नं: ${selectedExistingPatient.insuranceNumber || 'सक्रिय'}`
                        : 'सामान्य नागरिक'}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: '#1d4ed8', fontWeight: 700 }}>
                      एकल पालिका कोड: {selectedExistingPatient.citizenId || selectedExistingPatient.citizenshipOrNin || 'प्रमाणित'}
                    </span>
                  </div>
                </div>

                {/* CRITICAL ALLERGY ALERT IN RETURNING PROFILE */}
                {selectedExistingPatient.knownAllergies && (
                  <div
                    style={{
                      marginTop: '10px',
                      backgroundColor: '#fef2f2',
                      border: '1px solid #fecaca',
                      borderRadius: '8px',
                      padding: '6px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: '#991b1b',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                    }}
                  >
                    <AlertOctagon size={16} color="#dc2626" />
                    <span>⚠️ CRITICAL ALLERGY: यो बिरामीलाई {selectedExistingPatient.knownAllergies} को एलर्जी छ!</span>
                  </div>
                )}

                {/* TODAY'S RE-VISIT ENTRY FIELDS */}
                <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px dashed #cbd5e1' }}>
                  <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                    आजको भ्रमण विवरण तथा ओपिडी परामर्श (Today's Follow-up Consultation)
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.2fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#334155', marginBottom: '2px' }}>
                        आज जचाउने ओपिडी विभाग *
                      </label>
                      <select
                        className="dt-input"
                        value={existingVisitDept}
                        onChange={(e) => {
                          const val = e.target.value;
                          setExistingVisitDept(val);
                          const matched = departmentsList.find((d) => d.name === val);
                          if (matched?.roomNo) setExistingVisitRoom(matched.roomNo);
                          if (typeof matched?.fee === 'number') setExistingFee(matched.fee);
                        }}
                        style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem', fontWeight: 700 }}
                      >
                        {departmentsList.map((d) => (
                          <option key={d.id} value={d.name}>
                            {d.name} {d.roomNo ? `(${d.roomNo})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#334155', marginBottom: '2px' }}>
                        हेर्ने चिकित्सक (Attending Doctor)
                      </label>
                      <select
                        className="dt-input"
                        value={existingVisitDoctor}
                        onChange={(e) => setExistingVisitDoctor(e.target.value)}
                        style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem', fontWeight: 700 }}
                      >
                        {doctorsList.length > 0 ? (
                          doctorsList.map((doc) => {
                            const docName = doc.nameNepali || doc.name;
                            const val = `${docName} (${doc.designation}${doc.nmcNumber ? ` - NMC ${doc.nmcNumber}` : ''})`;
                            return (
                              <option key={doc.id} value={val}>
                                {docName} ({doc.designation})
                              </option>
                            );
                          })
                        ) : (
                          <option value="डा. सुजन खनाल (MDGP)">डा. सुजन खनाल (MDGP)</option>
                        )}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#334155', marginBottom: '2px' }}>
                        कक्ष नं. (Room)
                      </label>
                      <input
                        type="text"
                        className="dt-input"
                        value={existingVisitRoom}
                        onChange={(e) => setExistingVisitRoom(e.target.value)}
                        style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem', fontWeight: 700 }}
                      />
                    </div>
                  </div>

                  {/* Today's Vitals */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', marginTop: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#334155', marginBottom: '2px' }}>
                        BP (mmHg)
                      </label>
                      <input
                        type="text"
                        value={existingBp}
                        onChange={(e) => setExistingBp(e.target.value)}
                        style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#334155', marginBottom: '2px' }}>
                        नाडी (Pulse)
                      </label>
                      <input
                        type="text"
                        value={existingPulse}
                        onChange={(e) => setExistingPulse(e.target.value)}
                        style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#334155', marginBottom: '2px' }}>
                        तापक्रम (°F)
                      </label>
                      <input
                        type="text"
                        value={existingTemp}
                        onChange={(e) => setExistingTemp(e.target.value)}
                        style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#334155', marginBottom: '2px' }}>
                        SpO2 (%)
                      </label>
                      <input
                        type="text"
                        value={existingSpo2}
                        onChange={(e) => setExistingSpo2(e.target.value)}
                        style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#334155', marginBottom: '2px' }}>
                        तौल (Weight kg)
                      </label>
                      <input
                        type="text"
                        value={existingWeight}
                        onChange={(e) => setExistingWeight(e.target.value)}
                        style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                      />
                    </div>
                  </div>

                  {/* Chief complaints */}
                  <div style={{ marginTop: '10px' }}>
                    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#334155', marginBottom: '2px' }}>
                      आजको मुख्य समस्या / फलो-अप जाँचको कारण (Chief Complaints for Today)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="उदा: फलो-अप जाँच, छाती भारी हुन कम भएको तर हल्का टाउको दुखाई..."
                      className="dt-input"
                      value={existingVisitComplaints}
                      onChange={(e) => setExistingVisitComplaints(e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div
                style={{
                  padding: '2.5rem',
                  textAlign: 'center',
                  backgroundColor: '#f8fafc',
                  borderRadius: '12px',
                  border: '1.5px dashed #cbd5e1',
                }}
              >
                <Search size={32} color="#94a3b8" style={{ margin: '0 auto 8px auto' }} />
                <div style={{ fontWeight: 800, color: '#334155', fontSize: '0.95rem' }}>
                  कृपया माथिको खोज पट्टीबाट पुरानो बिरामी छान्नुहोस्
                </div>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '4px 0 0 0' }}>
                  बिरामीको दर्ता नम्बर (MRN: PT-2081-xxxx), फोन नम्बर, वा नाम टाइप गरि सूचीबाट छान्नुहोस् ।
                </p>
              </div>
            )}

            {/* ACTION FOOTER FOR EXISTING PATIENT */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '16px',
                borderTop: '1px solid #e2e8f0',
                marginTop: 'auto',
              }}
            >
              <div style={{ fontSize: '0.82rem', color: '#475569' }}>
                शुल्क: <strong>रु. {existingFee}</strong> ({existingFee === 0 ? 'बीमा/लक्षित निःशुल्क' : 'नगद'})
              </div>

              <button
                type="submit"
                disabled={!selectedExistingPatient || isSubmittingExisting}
                style={{
                  padding: '10px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: selectedExistingPatient ? '#059669' : '#94a3b8',
                  color: '#ffffff',
                  fontWeight: 800,
                  cursor: selectedExistingPatient ? 'pointer' : 'not-allowed',
                  fontSize: '0.88rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: selectedExistingPatient ? '0 4px 14px rgba(5, 150, 105, 0.3)' : 'none',
                }}
              >
                <Printer size={17} />
                <span>{isSubmittingExisting ? 'पुर्जी बन्दैछ...' : '✓ पुराना बिरामी ओपिडी पुर्जी जारी गर्नुहोस् (Print Slip)'}</span>
              </button>
            </div>
          </form>
        )}

        {/* ── UNIFIED CROSS-SECTORAL SYSTEM ARCHITECTURE FOOTER NOTE ── */}
        <div
          style={{
            backgroundColor: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            padding: '8px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.72rem',
            color: '#64748b',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={14} color="#2563eb" />
            <span>
              <strong>अन्तर-क्षेत्रगत एकीकृत डिजिटल ट्विन:</strong> स्वास्थ्य डेटा स्वतः सामाजिक सुरक्षा, घटना दर्ता, महामारी GIS र योजना शाखासँग आवद्ध छ।
            </span>
          </div>
          <span style={{ fontWeight: 700, color: '#0284c7' }}>P5 Digital Twin v2.6</span>
        </div>
      </div>
    </div>
  );
};

export default OpdPatientModal;
