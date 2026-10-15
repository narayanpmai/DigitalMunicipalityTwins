import React, { useState, useEffect } from 'react';
import type {
  DoctorMaster,
  LabTestCatalogItem,
  MedicineCategoryItem,
  MedicineUnitItem,
  HospitalDepartmentItem,
  IpdWardItem,
} from '../../../types/health';
import {
  getHealthDoctors,
  saveHealthDoctors,
  getHealthLabTests,
  saveHealthLabTests,
  getHealthMedCategories,
  saveHealthMedCategories,
  getHealthMedUnits,
  saveHealthMedUnits,
  getHealthDepartments,
  saveHealthDepartments,
  getHealthIpdWards,
  saveHealthIpdWards,
  resetHealthSettingsToDefault,
} from '../healthSettingsStorage';
import {
  Settings,
  Stethoscope,
  Activity,
  Pill,
  Building2,
  Bed,
  Plus,
  Trash2,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Search,
  ShieldCheck,
  Phone,
  Tag,
  Boxes,
  User,
  Check,
} from 'lucide-react';

export const HealthSettingsTab: React.FC = () => {
  const [subTab, setSubTab] = useState<'doctors' | 'lab' | 'medicines' | 'departments' | 'wards'>('doctors');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState<string | null>(null);

  // ── DATA STATES ─────────────────────────────────────────────────────
  const [doctors, setDoctors] = useState<DoctorMaster[]>(getHealthDoctors);
  const [labTests, setLabTests] = useState<LabTestCatalogItem[]>(getHealthLabTests);
  const [medCategories, setMedCategories] = useState<MedicineCategoryItem[]>(getHealthMedCategories);
  const [medUnits, setMedUnits] = useState<MedicineUnitItem[]>(getHealthMedUnits);
  const [departments, setDepartments] = useState<HospitalDepartmentItem[]>(getHealthDepartments);
  const [ipdWards, setIpdWards] = useState<IpdWardItem[]>(getHealthIpdWards);

  // Sync on storage event
  useEffect(() => {
    const handleSync = () => {
      setDoctors(getHealthDoctors());
      setLabTests(getHealthLabTests());
      setMedCategories(getHealthMedCategories());
      setMedUnits(getHealthMedUnits());
      setDepartments(getHealthDepartments());
      setIpdWards(getHealthIpdWards());
    };
    window.addEventListener('p5-health-settings-changed', handleSync);
    return () => window.removeEventListener('p5-health-settings-changed', handleSync);
  }, []);

  const triggerToast = (msg: string) => {
    setShowSuccessToast(msg);
    setTimeout(() => setShowSuccessToast(null), 3000);
  };

  // ── FORM STATES ─────────────────────────────────────────────────────
  // 1. Doctor Form
  const [newDoctor, setNewDoctor] = useState({
    name: '',
    designation: '',
    nmcNumber: '',
    department: 'सामान्य चिकित्सा तथा ओपिडी',
    phone: '',
  });

  const handleAddDoctor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDoctor.name.trim()) return;
    const doc: DoctorMaster = {
      id: 'doc-' + Date.now(),
      name: newDoctor.name.trim(),
      designation: newDoctor.designation.trim() || 'मेडिकल अधिकृत (Medical Officer)',
      nmcNumber: newDoctor.nmcNumber.trim() || 'NMC-Reg',
      department: newDoctor.department.trim(),
      phone: newDoctor.phone.trim() || '',
      isActive: true,
    };
    const updated = [doc, ...doctors];
    setDoctors(updated);
    saveHealthDoctors(updated);
    setNewDoctor({ name: '', designation: '', nmcNumber: '', department: 'सामान्य चिकित्सा तथा ओपिडी', phone: '' });
    triggerToast(`चिकित्सक ${doc.name} सफलतापूर्वक थपियो!`);
  };

  const handleDeleteDoctor = (id: string, name: string) => {
    if (!window.confirm(`के तपाईं चिकित्सक "${name}" लाई सूचीबाट हटाउन निश्चित हुनुहुन्छ?`)) return;
    const updated = doctors.filter((d) => d.id !== id);
    setDoctors(updated);
    saveHealthDoctors(updated);
    triggerToast(`चिकित्सक हटाइयो।`);
  };

  const handleToggleDoctorStatus = (id: string) => {
    const updated = doctors.map((d) => (d.id === id ? { ...d, isActive: !d.isActive } : d));
    setDoctors(updated);
    saveHealthDoctors(updated);
  };

  // 2. Lab Test Form
  const [newLabTest, setNewLabTest] = useState({
    testName: '',
    category: 'Hematology',
    sampleType: 'रगत (Blood)',
    normalRange: '',
    unit: '',
    price: 150,
    isInsuranceCovered: true,
  });

  const handleAddLabTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabTest.testName.trim()) return;
    const testItem: LabTestCatalogItem = {
      id: 'lab-' + Date.now(),
      testName: newLabTest.testName.trim(),
      category: newLabTest.category.trim(),
      sampleType: newLabTest.sampleType.trim(),
      normalRange: newLabTest.normalRange.trim() || 'Negative / Normal',
      unit: newLabTest.unit.trim() || '-',
      price: Number(newLabTest.price) || 0,
      isInsuranceCovered: Boolean(newLabTest.isInsuranceCovered),
    };
    const updated = [testItem, ...labTests];
    setLabTests(updated);
    saveHealthLabTests(updated);
    setNewLabTest({
      testName: '',
      category: 'Hematology',
      sampleType: 'रगत (Blood)',
      normalRange: '',
      unit: '',
      price: 150,
      isInsuranceCovered: true,
    });
    triggerToast(`ल्याब परीक्षण "${testItem.testName}" क्याटलगमा थपियो!`);
  };

  const handleDeleteLabTest = (id: string, name: string) => {
    if (!window.confirm(`के तपाईं परीक्षण "${name}" लाई हटाउन निश्चित हुनुहुन्छ?`)) return;
    const updated = labTests.filter((t) => t.id !== id);
    setLabTests(updated);
    saveHealthLabTests(updated);
    triggerToast(`परीक्षण हटाइयो।`);
  };

  // 3. Medicine Categories & Units Form
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const item: MedicineCategoryItem = {
      id: 'cat-' + Date.now(),
      name: newCatName.trim(),
      nameNepali: newCatName.trim(),
      description: newCatDesc.trim() || 'औषधि वर्ग',
    };
    const updated = [...medCategories, item];
    setMedCategories(updated);
    saveHealthMedCategories(updated);
    setNewCatName('');
    setNewCatDesc('');
    triggerToast(`औषधि वर्ग थपियो!`);
  };

  const handleDeleteCategory = (id: string) => {
    const updated = medCategories.filter((c) => c.id !== id);
    setMedCategories(updated);
    saveHealthMedCategories(updated);
  };

  const [newUnitName, setNewUnitName] = useState('');
  const [newUnitDesc, setNewUnitDesc] = useState('');

  const handleAddUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUnitName.trim()) return;
    const item: MedicineUnitItem = {
      id: 'unit-' + Date.now(),
      name: newUnitName.trim(),
      nameNepali: newUnitName.trim(),
      description: newUnitDesc.trim() || 'वितरण एकाइ',
    };
    const updated = [...medUnits, item];
    setMedUnits(updated);
    saveHealthMedUnits(updated);
    setNewUnitName('');
    setNewUnitDesc('');
    triggerToast(`वितरण एकाइ थपियो!`);
  };

  const handleDeleteUnit = (id: string) => {
    const updated = medUnits.filter((u) => u.id !== id);
    setMedUnits(updated);
    saveHealthMedUnits(updated);
  };

  // 4. Department Form
  const [newDept, setNewDept] = useState({ name: '', roomNo: '', fee: 0, inChargeName: '' });
  const handleAddDept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDept.name.trim()) return;
    const dept: HospitalDepartmentItem = {
      id: 'dept-' + Date.now(),
      name: newDept.name.trim(),
      roomNo: newDept.roomNo.trim() || 'कोठा नं.',
      fee: Number(newDept.fee) || 0,
      inChargeName: newDept.inChargeName.trim() || '',
    };
    const updated = [...departments, dept];
    setDepartments(updated);
    saveHealthDepartments(updated);
    setNewDept({ name: '', roomNo: '', fee: 0, inChargeName: '' });
    triggerToast(`विभाग थपियो!`);
  };

  const handleDeleteDept = (id: string) => {
    const updated = departments.filter((d) => d.id !== id);
    setDepartments(updated);
    saveHealthDepartments(updated);
  };

  // Reset Master
  const handleResetDefaults = () => {
    if (
      window.confirm(
        'के तपाईं सबै स्वास्थ्य सेटिङ्सहरू (चिकित्सक, ल्याब परीक्षण, औषधि वर्ग तथा एकाइ) लाई नेपाल सरकारको मानक डिफल्ट डाटामा रिसेट गर्न चाहनुहुन्छ?'
      )
    ) {
      resetHealthSettingsToDefault();
      triggerToast('सबै सेटिङहरू सफलतापूर्वक रिसेट भयो!');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Toast Notification */}
      {showSuccessToast && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9999,
            backgroundColor: '#0f172a',
            color: '#ffffff',
            padding: '12px 20px',
            borderRadius: '10px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.9rem',
            fontWeight: 700,
            borderLeft: '5px solid #10b981',
          }}
        >
          <CheckCircle2 size={18} color="#10b981" />
          <span>{showSuccessToast}</span>
        </div>
      )}

      {/* ── TOP HEADER CARD ────────────────────────────────────────── */}
      <div
        className="dt-card"
        style={{
          padding: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          border: '1.5px solid #e2e8f0',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #0f172a 0%, #334155 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.25)',
            }}
          >
            <Settings size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>अस्पताल मास्टर तथा प्रणाली सेटिङ्स (Hospital Master Settings)</span>
              <span style={{ fontSize: '0.75rem', background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '6px' }}>
                One-Time Configuration
              </span>
            </h2>
            <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '3px 0 0 0' }}>
              चिकित्सक नामावली, प्रयोगशाला दररेट, औषधि वर्ग/एकाइ र अस्पताल विभागहरूको केन्द्रीकृत व्यवस्थापन। यहाँ गरिएको परिवर्तन ओपिडी, भर्ना र बिलिङमा तुरुन्त लागू हुन्छ।
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleResetDefaults}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            backgroundColor: '#ffffff',
            color: '#475569',
            fontSize: '0.82rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          title="नेपाल सरकारको आधिकारिक मानकमा पुनः सेट गर्नुहोस्"
        >
          <RotateCcw size={15} />
          <span>डिफल्ट सेटिङ्स रिस्टोर गर्नुहोस्</span>
        </button>
      </div>

      {/* ── SETTINGS SUB-NAVBAR ─────────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '10px',
          background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',
          padding: '10px',
          borderRadius: '16px',
          border: '1.5px solid #cbd5e1',
          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
        }}
      >
        {/* TAB 1: DOCTORS */}
        <button
          type="button"
          onClick={() => setSubTab('doctors')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 14px',
            borderRadius: '12px',
            border: subTab === 'doctors' ? '2px solid #be123c' : '1.5px solid #fca5a5',
            background: subTab === 'doctors' ? 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)' : '#fff5f5',
            color: subTab === 'doctors' ? '#ffffff' : '#881337',
            boxShadow: subTab === 'doctors' ? '0 6px 18px rgba(225, 29, 72, 0.35)' : '0 2px 6px rgba(225, 29, 72, 0.06)',
            cursor: 'pointer',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            textAlign: 'left',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '10px',
                backgroundColor: subTab === 'doctors' ? 'rgba(255, 255, 255, 0.22)' : '#fee2e2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Stethoscope size={18} color={subTab === 'doctors' ? '#ffffff' : '#e11d48'} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.84rem', lineHeight: 1.25 }}>
                १. चिकित्सक तथा स्वास्थ्यकर्मी
              </div>
              <div style={{ fontSize: '0.72rem', opacity: subTab === 'doctors' ? 0.9 : 0.75, marginTop: '2px', fontWeight: 600 }}>
                Doctors & Staff
              </div>
            </div>
          </div>
          <span
            style={{
              padding: '3px 9px',
              borderRadius: '12px',
              fontSize: '0.72rem',
              fontWeight: 800,
              backgroundColor: subTab === 'doctors' ? 'rgba(255, 255, 255, 0.28)' : '#fee2e2',
              color: subTab === 'doctors' ? '#ffffff' : '#991b1b',
              flexShrink: 0,
            }}
          >
            {doctors.length} जना
          </span>
        </button>

        {/* TAB 2: LAB TESTS */}
        <button
          type="button"
          onClick={() => setSubTab('lab')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 14px',
            borderRadius: '12px',
            border: subTab === 'lab' ? '2px solid #047857' : '1.5px solid #86efac',
            background: subTab === 'lab' ? 'linear-gradient(135deg, #059669 0%, #047857 100%)' : '#ecfdf5',
            color: subTab === 'lab' ? '#ffffff' : '#14532d',
            boxShadow: subTab === 'lab' ? '0 6px 18px rgba(5, 150, 105, 0.35)' : '0 2px 6px rgba(5, 150, 105, 0.06)',
            cursor: 'pointer',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            textAlign: 'left',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '10px',
                backgroundColor: subTab === 'lab' ? 'rgba(255, 255, 255, 0.22)' : '#d1fae5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Activity size={18} color={subTab === 'lab' ? '#ffffff' : '#059669'} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.84rem', lineHeight: 1.25 }}>
                २. ल्याब परीक्षण क्याटलग
              </div>
              <div style={{ fontSize: '0.72rem', opacity: subTab === 'lab' ? 0.9 : 0.75, marginTop: '2px', fontWeight: 600 }}>
                Lab Tests & Rates
              </div>
            </div>
          </div>
          <span
            style={{
              padding: '3px 9px',
              borderRadius: '12px',
              fontSize: '0.72rem',
              fontWeight: 800,
              backgroundColor: subTab === 'lab' ? 'rgba(255, 255, 255, 0.28)' : '#d1fae5',
              color: subTab === 'lab' ? '#ffffff' : '#065f46',
              flexShrink: 0,
            }}
          >
            {labTests.length} वटा
          </span>
        </button>

        {/* TAB 3: MEDICINES CATEGORIES & UNITS */}
        <button
          type="button"
          onClick={() => setSubTab('medicines')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 14px',
            borderRadius: '12px',
            border: subTab === 'medicines' ? '2px solid #b45309' : '1.5px solid #fcd34d',
            background: subTab === 'medicines' ? 'linear-gradient(135deg, #d97706 0%, #b45309 100%)' : '#fffbeb',
            color: subTab === 'medicines' ? '#ffffff' : '#78350f',
            boxShadow: subTab === 'medicines' ? '0 6px 18px rgba(217, 119, 6, 0.35)' : '0 2px 6px rgba(217, 119, 6, 0.06)',
            cursor: 'pointer',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            textAlign: 'left',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '10px',
                backgroundColor: subTab === 'medicines' ? 'rgba(255, 255, 255, 0.22)' : '#fef3c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Pill size={18} color={subTab === 'medicines' ? '#ffffff' : '#d97706'} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.84rem', lineHeight: 1.25 }}>
                ३. औषधि वर्ग र वितरण एकाइ
              </div>
              <div style={{ fontSize: '0.72rem', opacity: subTab === 'medicines' ? 0.9 : 0.75, marginTop: '2px', fontWeight: 600 }}>
                Categories & Units
              </div>
            </div>
          </div>
          <span
            style={{
              padding: '3px 9px',
              borderRadius: '12px',
              fontSize: '0.72rem',
              fontWeight: 800,
              backgroundColor: subTab === 'medicines' ? 'rgba(255, 255, 255, 0.28)' : '#fef3c7',
              color: subTab === 'medicines' ? '#ffffff' : '#92400e',
              flexShrink: 0,
            }}
          >
            {medCategories.length + medUnits.length} प्रकार
          </span>
        </button>

        {/* TAB 4: DEPARTMENTS & CLINICS */}
        <button
          type="button"
          onClick={() => setSubTab('departments')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 14px',
            borderRadius: '12px',
            border: subTab === 'departments' ? '2px solid #0369a1' : '1.5px solid #7dd3fc',
            background: subTab === 'departments' ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' : '#f0f9ff',
            color: subTab === 'departments' ? '#ffffff' : '#075985',
            boxShadow: subTab === 'departments' ? '0 6px 18px rgba(2, 132, 199, 0.35)' : '0 2px 6px rgba(2, 132, 199, 0.06)',
            cursor: 'pointer',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            textAlign: 'left',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '10px',
                backgroundColor: subTab === 'departments' ? 'rgba(255, 255, 255, 0.22)' : '#e0f2fe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Building2 size={18} color={subTab === 'departments' ? '#ffffff' : '#0284c7'} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.84rem', lineHeight: 1.25 }}>
                ४. ओपीडी विभाग र क्लिनिकहरू
              </div>
              <div style={{ fontSize: '0.72rem', opacity: subTab === 'departments' ? 0.9 : 0.75, marginTop: '2px', fontWeight: 600 }}>
                Departments & Clinics
              </div>
            </div>
          </div>
          <span
            style={{
              padding: '3px 9px',
              borderRadius: '12px',
              fontSize: '0.72rem',
              fontWeight: 800,
              backgroundColor: subTab === 'departments' ? 'rgba(255, 255, 255, 0.28)' : '#e0f2fe',
              color: subTab === 'departments' ? '#ffffff' : '#0369a1',
              flexShrink: 0,
            }}
          >
            {departments.length} वटा
          </span>
        </button>

        {/* TAB 5: IPD WARDS & BEDS */}
        <button
          type="button"
          onClick={() => setSubTab('wards')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 14px',
            borderRadius: '12px',
            border: subTab === 'wards' ? '2px solid #6d28d9' : '1.5px solid #c4b5fd',
            background: subTab === 'wards' ? 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)' : '#faf5ff',
            color: subTab === 'wards' ? '#ffffff' : '#581c87',
            boxShadow: subTab === 'wards' ? '0 6px 18px rgba(124, 58, 237, 0.35)' : '0 2px 6px rgba(124, 58, 237, 0.06)',
            cursor: 'pointer',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            textAlign: 'left',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '10px',
                backgroundColor: subTab === 'wards' ? 'rgba(255, 255, 255, 0.22)' : '#ede9fe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Bed size={18} color={subTab === 'wards' ? '#ffffff' : '#7c3aed'} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.84rem', lineHeight: 1.25 }}>
                ५. १५-शय्या वार्ड तथा बेड
              </div>
              <div style={{ fontSize: '0.72rem', opacity: subTab === 'wards' ? 0.9 : 0.75, marginTop: '2px', fontWeight: 600 }}>
                IPD Wards & 15 Beds
              </div>
            </div>
          </div>
          <span
            style={{
              padding: '3px 9px',
              borderRadius: '12px',
              fontSize: '0.72rem',
              fontWeight: 800,
              backgroundColor: subTab === 'wards' ? 'rgba(255, 255, 255, 0.28)' : '#ede9fe',
              color: subTab === 'wards' ? '#ffffff' : '#6d28d9',
              flexShrink: 0,
            }}
          >
            १५ बेड
          </span>
        </button>
      </div>

      {/* ── PANEL 1: DOCTORS & HEALTH STAFF ────────────────────────── */}
      {subTab === 'doctors' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {/* Add Doctor Form */}
          <div className="dt-card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={18} color="#e11d48" />
              <span>+ नयाँ चिकित्सक / स्वास्थ्यकर्मी थप्नुहोस्</span>
            </h3>
            <form onSubmit={handleAddDoctor} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                  चिकित्सकको पूरा नाम (Full Name with Dr.) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="उदा: डा. सुजन खनाल"
                  value={newDoctor.name}
                  onChange={(e) => setNewDoctor({ ...newDoctor, name: e.target.value })}
                  className="dt-input"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                  पद तथा उपाधि (Designation / Qualification) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="उदा: MBBS, MDGP (कन्सल्टेन्ट फिजिसियन)"
                  value={newDoctor.designation}
                  onChange={(e) => setNewDoctor({ ...newDoctor, designation: e.target.value })}
                  className="dt-input"
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                    NMC / NHPC दर्ता नं.
                  </label>
                  <input
                    type="text"
                    placeholder="उदा: NMC-18452"
                    value={newDoctor.nmcNumber}
                    onChange={(e) => setNewDoctor({ ...newDoctor, nmcNumber: e.target.value })}
                    className="dt-input"
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                    सम्पर्क फोन नं.
                  </label>
                  <input
                    type="text"
                    placeholder="९८xxxxxxxx"
                    value={newDoctor.phone}
                    onChange={(e) => setNewDoctor({ ...newDoctor, phone: e.target.value })}
                    className="dt-input"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                  सम्बन्धित विभाग / क्लिनिक (Department)
                </label>
                <select
                  value={newDoctor.department}
                  onChange={(e) => setNewDoctor({ ...newDoctor, department: e.target.value })}
                  className="dt-input"
                  style={{ width: '100%' }}
                >
                  <option value="सामान्य चिकित्सा तथा ओपिडी">सामान्य चिकित्सा तथा ओपिडी</option>
                  <option value="प्रसूति तथा स्त्रीरोग (MCH/ANC)">प्रसूति तथा स्त्रीरोग (MCH/ANC)</option>
                  <option value="बालरोग तथा खोप">बालरोग तथा खोप</option>
                  <option value="हाडजोर्नी तथा नशा">हाडजोर्नी तथा नशा</option>
                  <option value="आकस्मिक कक्ष (Emergency)">आकस्मिक कक्ष (Emergency)</option>
                  <option value="प्रयोगशाला (Laboratory)">प्रयोगशाला (Laboratory)</option>
                </select>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{
                  marginTop: '8px',
                  backgroundColor: '#e11d48',
                  borderColor: '#e11d48',
                  color: '#ffffff',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <Plus size={16} />
                <span>चिकित्सक सुरक्षित गर्नुहोस्</span>
              </button>
            </form>
          </div>

          {/* Doctors List Table */}
          <div className="dt-card" style={{ padding: '1.25rem', flex: 2 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                स्वीकृत चिकित्सक तथा स्वास्थ्यकर्मी सूची ({doctors.length} जना)
              </h3>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                ओपिडी, भर्ना र प्रेस्क्रिप्सन फाराममा यही सूची देखिनेछ
              </span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="dt-table" style={{ width: '100%', fontSize: '0.82rem' }}>
                <thead>
                  <tr>
                    <th>चिकित्सकको नाम र पद</th>
                    <th>दर्ता नम्बर</th>
                    <th>विभाग</th>
                    <th>स्थिति</th>
                    <th style={{ textAlign: 'center' }}>कार्य</th>
                  </tr>
                </thead>
                <tbody>
                  {doctors.map((doc) => (
                    <tr key={doc.id}>
                      <td>
                        <strong style={{ color: '#0f172a', fontSize: '0.88rem' }}>{doc.name}</strong>
                        <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{doc.designation}</div>
                        {doc.phone && (
                          <div style={{ fontSize: '0.72rem', color: '#0284c7', display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <Phone size={10} /> {doc.phone}
                          </div>
                        )}
                      </td>
                      <td>
                        <span style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                          {doc.nmcNumber}
                        </span>
                      </td>
                      <td>{doc.department}</td>
                      <td>
                        <button
                          type="button"
                          onClick={() => handleToggleDoctorStatus(doc.id)}
                          style={{
                            border: 'none',
                            borderRadius: '9999px',
                            padding: '2px 8px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            backgroundColor: doc.isActive ? '#dcfce7' : '#f1f5f9',
                            color: doc.isActive ? '#15803d' : '#64748b',
                          }}
                        >
                          {doc.isActive ? '🟢 सक्रिय (Active)' : '⚪ बिदामा'}
                        </button>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => handleDeleteDoctor(doc.id, doc.name)}
                          style={{
                            border: 'none',
                            background: '#fee2e2',
                            color: '#ef4444',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                          }}
                          title="हटाउनुहोस्"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── PANEL 2: LAB TESTS CATALOG ─────────────────────────────── */}
      {subTab === 'lab' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {/* Add Lab Test Form */}
          <div className="dt-card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={18} color="#059669" />
              <span>+ नयाँ प्रयोगशाला परीक्षण (Lab Test) थप्नुहोस्</span>
            </h3>
            <form onSubmit={handleAddLabTest} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                  परीक्षणको नाम (Test Name) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="उदा: Thyroid Function Test (TFT - T3, T4, TSH)"
                  value={newLabTest.testName}
                  onChange={(e) => setNewLabTest({ ...newLabTest, testName: e.target.value })}
                  className="dt-input"
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                    विधा (Category)
                  </label>
                  <select
                    value={newLabTest.category}
                    onChange={(e) => setNewLabTest({ ...newLabTest, category: e.target.value })}
                    className="dt-input"
                    style={{ width: '100%' }}
                  >
                    <option value="Hematology">Hematology (रक्त)</option>
                    <option value="Biochemistry">Biochemistry (बायोकेमिस्ट्री)</option>
                    <option value="Serology">Serology / Immunology</option>
                    <option value="Clinical Pathology">Clinical Pathology (पिसाब/दिसा)</option>
                    <option value="Microbiology">Microbiology (खकार/कल्चर)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                    नमुना / ट्युब (Sample Type)
                  </label>
                  <input
                    type="text"
                    placeholder="उदा: रगत (Serum Red Tube)"
                    value={newLabTest.sampleType}
                    onChange={(e) => setNewLabTest({ ...newLabTest, sampleType: e.target.value })}
                    className="dt-input"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                    सामान्य दायरा (Normal Range)
                  </label>
                  <input
                    type="text"
                    placeholder="उदा: 70 - 110"
                    value={newLabTest.normalRange}
                    onChange={(e) => setNewLabTest({ ...newLabTest, normalRange: e.target.value })}
                    className="dt-input"
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                    एकाइ (Unit)
                  </label>
                  <input
                    type="text"
                    placeholder="उदा: mg/dL, /cumm"
                    value={newLabTest.unit}
                    onChange={(e) => setNewLabTest({ ...newLabTest, unit: e.target.value })}
                    className="dt-input"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                    सरकारी दररेट (रु.) *
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={newLabTest.price}
                    onChange={(e) => setNewLabTest({ ...newLabTest, price: Number(e.target.value) })}
                    className="dt-input"
                    style={{ width: '100%' }}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingTop: '20px' }}>
                  <input
                    type="checkbox"
                    id="insuranceCoveredCheck"
                    checked={newLabTest.isInsuranceCovered}
                    onChange={(e) => setNewLabTest({ ...newLabTest, isInsuranceCovered: e.target.checked })}
                  />
                  <label htmlFor="insuranceCoveredCheck" style={{ fontSize: '0.78rem', fontWeight: 600, color: '#166534', cursor: 'pointer' }}>
                    स्वास्थ्य बीमामा आबद्ध (HIB Covered)
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{
                  marginTop: '8px',
                  backgroundColor: '#059669',
                  borderColor: '#059669',
                  color: '#ffffff',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <Plus size={16} />
                <span>ल्याब परीक्षण सुरक्षित गर्नुहोस्</span>
              </button>
            </form>
          </div>

          {/* Lab Tests Table */}
          <div className="dt-card" style={{ padding: '1.25rem', flex: 2 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '8px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                स्वीकृत ल्याब परीक्षण क्याटलग ({labTests.length} प्रकार)
              </h3>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                ल्याब अर्डर फाराम र नतिजा प्रविष्टिमा स्वतः लोड हुनेछ
              </span>
            </div>

            <div style={{ overflowX: 'auto', maxHeight: '520px' }}>
              <table className="dt-table" style={{ width: '100%', fontSize: '0.82rem' }}>
                <thead>
                  <tr>
                    <th>परीक्षणको नाम</th>
                    <th>विधा / नमुना प्रकार</th>
                    <th>सामान्य दायरा (Range)</th>
                    <th>दररेट (रु.)</th>
                    <th>बीमा</th>
                    <th style={{ textAlign: 'center' }}>कार्य</th>
                  </tr>
                </thead>
                <tbody>
                  {labTests.map((t) => (
                    <tr key={t.id}>
                      <td>
                        <strong style={{ color: '#0f172a' }}>{t.testName}</strong>
                      </td>
                      <td>
                        <span style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontSize: '0.74rem', fontWeight: 600 }}>
                          {t.category}
                        </span>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{t.sampleType}</div>
                      </td>
                      <td>
                        <span style={{ color: '#0284c7', fontWeight: 600 }}>{t.normalRange}</span>
                      </td>
                      <td>
                        <strong>रु. {t.price}</strong>
                      </td>
                      <td>
                        {t.isInsuranceCovered ? (
                          <span style={{ color: '#16a34a', fontWeight: 700, fontSize: '0.75rem' }}>✓ बीमा मान्य</span>
                        ) : (
                          <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>नगद मात्र</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => handleDeleteLabTest(t.id, t.testName)}
                          style={{
                            border: 'none',
                            background: '#fee2e2',
                            color: '#ef4444',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── PANEL 3: MEDICINE CATEGORIES & DISPENSING UNITS ────────── */}
      {subTab === 'medicines' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
          {/* Dosage Categories */}
          <div className="dt-card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Pill size={18} color="#d97706" />
              <span>औषधि वर्ग (Medicine Categories / Dosage Forms)</span>
            </h3>

            <form onSubmit={handleAddCategory} style={{ display: 'flex', gap: '6px', marginBottom: '1rem' }}>
              <input
                type="text"
                required
                placeholder="नयाँ वर्ग (उदा: लोसन / इनहेलर)..."
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="dt-input"
                style={{ flex: 1 }}
              />
              <button
                type="submit"
                className="btn btn-primary"
                style={{ backgroundColor: '#d97706', borderColor: '#d97706', color: '#ffffff', fontWeight: 700 }}
              >
                + थप्नुहोस्
              </button>
            </form>

            <div style={{ overflowX: 'auto' }}>
              <table className="dt-table" style={{ width: '100%', fontSize: '0.82rem' }}>
                <thead>
                  <tr>
                    <th>क्र.सं.</th>
                    <th>औषधि वर्ग (Dosage Form)</th>
                    <th>विवरण</th>
                    <th style={{ textAlign: 'center' }}>कार्य</th>
                  </tr>
                </thead>
                <tbody>
                  {medCategories.map((cat, idx) => (
                    <tr key={cat.id}>
                      <td>{idx + 1}</td>
                      <td>
                        <strong>{cat.nameNepali || cat.name}</strong>
                      </td>
                      <td style={{ color: '#64748b' }}>{cat.description || '-'}</td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => handleDeleteCategory(cat.id)}
                          style={{
                            border: 'none',
                            background: '#fee2e2',
                            color: '#ef4444',
                            padding: '3px 6px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Dispensing Units */}
          <div className="dt-card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Boxes size={18} color="#0284c7" />
              <span>वितरण तथा भण्डार एकाइ (Dispensing Units)</span>
            </h3>

            <form onSubmit={handleAddUnit} style={{ display: 'flex', gap: '6px', marginBottom: '1rem' }}>
              <input
                type="text"
                required
                placeholder="नयाँ एकाइ (उदा: क्यान / डब्बा)..."
                value={newUnitName}
                onChange={(e) => setNewUnitName(e.target.value)}
                className="dt-input"
                style={{ flex: 1 }}
              />
              <button
                type="submit"
                className="btn btn-primary"
                style={{ backgroundColor: '#0284c7', borderColor: '#0284c7', color: '#ffffff', fontWeight: 700 }}
              >
                + थप्नुहोस्
              </button>
            </form>

            <div style={{ overflowX: 'auto' }}>
              <table className="dt-table" style={{ width: '100%', fontSize: '0.82rem' }}>
                <thead>
                  <tr>
                    <th>क्र.सं.</th>
                    <th>वितरण एकाइ (Unit)</th>
                    <th>विवरण</th>
                    <th style={{ textAlign: 'center' }}>कार्य</th>
                  </tr>
                </thead>
                <tbody>
                  {medUnits.map((u, idx) => (
                    <tr key={u.id}>
                      <td>{idx + 1}</td>
                      <td>
                        <strong>{u.nameNepali || u.name}</strong>
                      </td>
                      <td style={{ color: '#64748b' }}>{u.description || '-'}</td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => handleDeleteUnit(u.id)}
                          style={{
                            border: 'none',
                            background: '#fee2e2',
                            color: '#ef4444',
                            padding: '3px 6px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── PANEL 4: DEPARTMENTS & CLINICS ─────────────────────────── */}
      {subTab === 'departments' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          <div className="dt-card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 1rem 0' }}>
              + नयाँ ओपीडी विभाग / क्लिनिक थप्नुहोस्
            </h3>
            <form onSubmit={handleAddDept} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                  विभागको नाम *
                </label>
                <input
                  type="text"
                  required
                  placeholder="उदा: मानसिक स्वास्थ्य तथा काउन्सिलिङ"
                  value={newDept.name}
                  onChange={(e) => setNewDept({ ...newDept, name: e.target.value })}
                  className="dt-input"
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                    कोठा नम्बर
                  </label>
                  <input
                    type="text"
                    placeholder="उदा: कोठा नं. १०६"
                    value={newDept.roomNo}
                    onChange={(e) => setNewDept({ ...newDept, roomNo: e.target.value })}
                    className="dt-input"
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                    दर्ता शुल्क (रु.)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={newDept.fee}
                    onChange={(e) => setNewDept({ ...newDept, fee: Number(e.target.value) })}
                    className="dt-input"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                  विभाग इन्चार्ज
                </label>
                <input
                  type="text"
                  placeholder="उदा: डाक्टर / काउन्सिलर नाम"
                  value={newDept.inChargeName}
                  onChange={(e) => setNewDept({ ...newDept, inChargeName: e.target.value })}
                  className="dt-input"
                  style={{ width: '100%' }}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ backgroundColor: '#0284c7', borderColor: '#0284c7', color: '#ffffff', fontWeight: 700, marginTop: '6px' }}
              >
                + विभाग सुरक्षित गर्नुहोस्
              </button>
            </form>
          </div>

          <div className="dt-card" style={{ padding: '1.25rem', flex: 2 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 1rem 0' }}>
              दर्ता भएका अस्पताल विभाग तथा क्लिनिकहरू ({departments.length} वटा)
            </h3>
            <table className="dt-table" style={{ width: '100%', fontSize: '0.82rem' }}>
              <thead>
                <tr>
                  <th>विभागको नाम</th>
                  <th>कोठा नं.</th>
                  <th>ओपीडी शुल्क</th>
                  <th>इन्चार्ज</th>
                  <th style={{ textAlign: 'center' }}>कार्य</th>
                </tr>
              </thead>
              <tbody>
                {departments.map((dept) => (
                  <tr key={dept.id}>
                    <td>
                      <strong>{dept.name}</strong>
                    </td>
                    <td>
                      <span style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>{dept.roomNo}</span>
                    </td>
                    <td>{dept.fee === 0 ? <span style={{ color: '#16a34a', fontWeight: 700 }}>निःशुल्क</span> : `रु. ${dept.fee}`}</td>
                    <td>{dept.inChargeName || '-'}</td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={() => handleDeleteDept(dept.id)}
                        style={{ border: 'none', background: '#fee2e2', color: '#ef4444', padding: '3px 6px', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── PANEL 5: IPD WARDS & BEDS ──────────────────────────────── */}
      {subTab === 'wards' && (
        <div className="dt-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                १५-शय्या आधारभूत अस्पताल: वार्ड तथा बेड व्यवस्थापन (IPD Setup)
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '2px 0 0 0' }}>
                पाँचपोखरी थाङपाल प्राथमिक अस्पतालमा स्वीकृत कुल १५ शय्याको वार्ड अनुसार विभाजन
              </p>
            </div>
            <span style={{ background: '#dcfce7', color: '#15803d', padding: '4px 10px', borderRadius: '20px', fontWeight: 800, fontSize: '0.8rem' }}>
              कुल क्षमता: १५ शय्या (Beds)
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            {ipdWards.map((w, idx) => (
              <div
                key={w.id}
                style={{
                  background: '#f8fafc',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>{w.wardName}</strong>
                  <span style={{ background: '#7c3aed', color: '#ffffff', padding: '2px 8px', borderRadius: '10px', fontSize: '0.72rem', fontWeight: 800 }}>
                    {w.totalBeds} शय्या
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  बेड संकेत: <strong>{w.bedPrefix}01 देखि {w.bedPrefix}0{w.totalBeds}</strong>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#15803d', fontWeight: 600 }}>
                  दैनिक शुल्क: {w.ratePerDay === 0 ? 'नेपाल सरकार निःशुल्क' : `रु. ${w.ratePerDay}`}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
export default HealthSettingsTab;
