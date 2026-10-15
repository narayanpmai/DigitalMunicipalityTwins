import React, { useState, useEffect } from 'react';
import {
  X,
  FolderGit2,
  Save,
  CheckCircle2,
  AlertCircle,
  Building,
  Coins,
  Calendar,
  UserCheck,
  MapPin,
} from 'lucide-react';
import type { Project } from '../../../types/sectoral';

export interface ProjectAgreementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: Partial<Project>) => Promise<void> | void;
  projectToEdit?: Project | null;
  isSubmitting?: boolean;
}

const BUDGET_SOURCES = [
  'संघीय सरकार वित्तीय समानीकरण अनुदान',
  'कन्टिन्जेन्सी',
  'आन्तरिक स्रोत',
  'प्रकोप/विपद् व्यवस्थापन कोष',
  'प्रदेश सरकार विशेष अनुदान',
  'प्रदेश सरकार वित्तीय समानीकरण',
  'समपूरक अनुदान (संघीय/प्रदेश)',
  'सडक बोर्ड नेपाल',
];

const MARFAT_OPTIONS = [
  'उपभोक्ता समिति',
  'ठेक्का / बोलपत्र',
  'अमानत',
  'संस्था / समूह',
];

const SECTOR_OPTIONS = [
  { value: 'road', label: 'सडक तथा यातायात पूर्वाधार' },
  { value: 'water', label: 'खानेपानी तथा सरसफाइ' },
  { value: 'building', label: 'भवन तथा सामुदायिक संरचना' },
  { value: 'health', label: 'स्वास्थ्य संस्था तथा क्लिनिक' },
  { value: 'education', label: 'शिक्षा तथा विद्यालय' },
  { value: 'bridge', label: 'झोलुङ्गे / पक्की पुल' },
  { value: 'tourism', label: 'पर्यटन, पदमार्ग तथा संस्कृति' },
  { value: 'agriculture', label: 'कृषि तथा सिँचाइ' },
  { value: 'disaster', label: 'विपद् व्यवस्थापन तथा नदी नियन्त्रण' },
  { value: 'other', label: 'अन्य पूर्वाधार तथा सेवा' },
];

export const ProjectAgreementModal: React.FC<ProjectAgreementModalProps> = ({
  isOpen,
  onClose,
  onSave,
  projectToEdit,
  isSubmitting = false,
}) => {
  const [formData, setFormData] = useState<Partial<Project>>({
    name: '',
    projectCode: '',
    wardNumber: 0,
    level: 'नगर स्तरिय',
    sector: 'road',
    fiscalYear: '०८२/०८३',
    budgetSource: 'संघीय सरकार वित्तीय समानीकरण अनुदान',
    marfat: 'उपभोक्ता समिति',
    officeCost: 0,
    committeeCost: 0,
    allocatedBudget: 0,
    palikaGrant: 0,
    communityContribution: 0,
    contingencyAmount: 0,
    startDateBs: '२०८३-०२-३०',
    completionDateBs: '२०८३-०३-१५',
    agreementDateBs: '२०८३-०२-२५',
    committeeName: '',
    committeeChair: '',
    committeeSecretary: '',
    committeeTreasurer: '',
    committeePhone: '',
    contractorName: '',
    status: 'ongoing',
    physicalProgressPercent: 0,
    financialProgress: 0,
    paidAmount: 0,
    description: '',
    location: '',
    latitude: 27.9450,
    longitude: 85.6130,
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (projectToEdit) {
      setFormData({
        ...projectToEdit,
        officeCost: Number(projectToEdit.officeCost !== undefined ? projectToEdit.officeCost : projectToEdit.allocatedBudget || 0),
        committeeCost: Number(projectToEdit.committeeCost || 0),
        allocatedBudget: Number(projectToEdit.allocatedBudget || projectToEdit.officeCost || 0),
        palikaGrant: Number(projectToEdit.palikaGrant || 0),
        communityContribution: Number(projectToEdit.communityContribution || 0),
        paidAmount: Number(projectToEdit.paidAmount || projectToEdit.expenditureAmount || 0),
        physicalProgressPercent: Number(projectToEdit.physicalProgressPercent || 0),
        wardNumber: Number(projectToEdit.wardNumber) || 0,
      });
    } else {
      setFormData({
        name: '',
        projectCode: '',
        wardNumber: 0,
        level: 'नगर स्तरिय',
        sector: 'road',
        fiscalYear: '०८२/०८३',
        budgetSource: 'संघीय सरकार वित्तीय समानीकरण अनुदान',
        marfat: 'उपभोक्ता समिति',
        officeCost: 500000,
        committeeCost: 0,
        allocatedBudget: 500000,
        palikaGrant: 500000,
        communityContribution: 0,
        contingencyAmount: 0,
        startDateBs: '२०८३-०२-३०',
        completionDateBs: '२०८३-०३-१५',
        agreementDateBs: '२०८३-०२-२५',
        committeeName: '',
        committeeChair: '',
        committeeSecretary: '',
        committeeTreasurer: '',
        committeePhone: '',
        contractorName: '',
        status: 'ongoing',
        physicalProgressPercent: 50,
        financialProgress: 40,
        paidAmount: 200000,
        description: '',
        location: '',
        latitude: 27.9450,
        longitude: 85.6130,
      });
    }
    setErrorMessage(null);
  }, [projectToEdit, isOpen]);

  const handleInputChange = (field: keyof Project, value: any) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      // auto-adjust related amounts
      if (field === 'officeCost') {
        next.allocatedBudget = Number(value) || 0;
        if (!next.palikaGrant || next.palikaGrant === prev.officeCost) {
          next.palikaGrant = Number(value) || 0;
        }
      }
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || formData.name.trim() === '') {
      setErrorMessage('कृपया आयोजनाको नाम अनिवार्य रूपमा भर्नुहोस्।');
      return;
    }

    const submissionData: Partial<Project> = {
      ...formData,
      wardNumber: Number(formData.wardNumber) || 0,
      officeCost: Number(formData.officeCost) || 0,
      committeeCost: Number(formData.committeeCost) || 0,
      allocatedBudget: Number(formData.officeCost || formData.allocatedBudget) || 0,
      palikaGrant: Number(formData.palikaGrant) || 0,
      communityContribution: Number(formData.communityContribution) || 0,
      paidAmount: Number(formData.paidAmount) || 0,
      physicalProgressPercent: Number(formData.physicalProgressPercent) || 0,
      financialProgress: Number(formData.financialProgress) || 0,
    };

    onSave(submissionData);
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
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '860px',
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
            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            color: '#ffffff',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
              }}
            >
              <FolderGit2 size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: '#ffffff' }}>
                {projectToEdit ? 'योजना सम्झौता सम्पादन गर्नुहोस्' : 'योजना सम्झौता फारम (+ नयाँ योजना सम्झौता दर्ता)'}
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#e0f2fe', margin: '2px 0 0 0' }}>
                पाँचपोखरी थाङपाल गाउँपालिका — उपभोक्ता समिति तथा ठेक्का सम्झौता व्यवस्थापन
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#ffffff',
              padding: '6px',
              borderRadius: '8px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {errorMessage && (
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
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Section 1: General Details */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem', backgroundColor: '#f8fafc' }}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0369a1', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Building size={16} />
              <span>१. आयोजनाको सामान्य विवरण (Project Overview)</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
                  आयोजनाको नाम *
                </label>
                <input
                  type="text"
                  required
                  placeholder="उदा: थाङपालकोट स्वास्थ्य चौकी मर्मत / छिम्ती सामुदायिक भवन"
                  value={formData.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                    आर्थिक वर्ष
                  </label>
                  <select
                    value={formData.fiscalYear || '०८२/०८३'}
                    onChange={(e) => handleInputChange('fiscalYear', e.target.value)}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', backgroundColor: '#ffffff' }}
                  >
                    <option value="०८२/०८३">०८२/०८३</option>
                    <option value="०८१/०८२">०८१/०८२</option>
                    <option value="०८०/०८१">०८०/०८१</option>
                    <option value="२०८३/८४">२०८३/८४</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                    वडा / नगर स्तर
                  </label>
                  <select
                    value={formData.level || 'नगर स्तरिय'}
                    onChange={(e) => handleInputChange('level', e.target.value)}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', backgroundColor: '#ffffff' }}
                  >
                    <option value="नगर स्तरिय">नगर स्तरिय (पालिका स्तर)</option>
                    <option value="वडा स्तरिय">वडा स्तरिय</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                    वडा नं.
                  </label>
                  <select
                    value={formData.wardNumber ?? 0}
                    onChange={(e) => handleInputChange('wardNumber', Number(e.target.value))}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', backgroundColor: '#ffffff' }}
                  >
                    <option value={0}>सबै वडा / नगर स्तरिय</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((w) => (
                      <option key={w} value={w}>वडा नं. {w}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                    कार्यान्वयन मार्फत
                  </label>
                  <select
                    value={formData.marfat || 'उपभोक्ता समिति'}
                    onChange={(e) => handleInputChange('marfat', e.target.value)}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', backgroundColor: '#ffffff' }}
                  >
                    {MARFAT_OPTIONS.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Budget Source & Cost Structure */}
          <div style={{ border: '1px solid #bbf7d0', borderRadius: '10px', padding: '1rem', backgroundColor: '#f0fdf4' }}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#166534', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Coins size={16} />
              <span>२. बजेट स्रोत र लागत संरचना (Cost Structure)</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#166534', marginBottom: '0.25rem' }}>
                  बजेट स्रोत *
                </label>
                <input
                  type="text"
                  list="budget-sources-list"
                  placeholder="बजेट स्रोत छान्नुहोस् वा टाइप गर्नुहोस्"
                  value={formData.budgetSource || ''}
                  onChange={(e) => handleInputChange('budgetSource', e.target.value)}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #86efac', fontSize: '0.875rem' }}
                />
                <datalist id="budget-sources-list">
                  {BUDGET_SOURCES.map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#166534', marginBottom: '0.25rem' }}>
                  कार्यालय लागत / अनुमान (रु.) *
                </label>
                <input
                  type="number"
                  placeholder="१५००००.००"
                  value={formData.officeCost ?? 0}
                  onChange={(e) => handleInputChange('officeCost', Number(e.target.value))}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #86efac', fontSize: '0.875rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#166534', marginBottom: '0.25rem' }}>
                  उपभोक्ता समिति लागत (रु.)
                </label>
                <input
                  type="number"
                  placeholder="१६२३४.०९"
                  value={formData.committeeCost ?? 0}
                  onChange={(e) => handleInputChange('committeeCost', Number(e.target.value))}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #86efac', fontSize: '0.875rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#166534', marginBottom: '0.25rem' }}>
                  पालिका अनुदान रकम (रु.)
                </label>
                <input
                  type="number"
                  placeholder="अनुदान रकम"
                  value={formData.palikaGrant ?? 0}
                  onChange={(e) => handleInputChange('palikaGrant', Number(e.target.value))}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #86efac', fontSize: '0.875rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#166534', marginBottom: '0.25rem' }}>
                  जनसहभागिता / श्रमदान (रु.)
                </label>
                <input
                  type="number"
                  placeholder="श्रमदान रकम"
                  value={formData.communityContribution ?? 0}
                  onChange={(e) => handleInputChange('communityContribution', Number(e.target.value))}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #86efac', fontSize: '0.875rem' }}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Dates BS */}
          <div style={{ border: '1px solid #fed7aa', borderRadius: '10px', padding: '1rem', backgroundColor: '#fff7ed' }}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#9a3412', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Calendar size={16} />
              <span>३. मिति विवरण (वि.सं. - Dates BS)</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#9a3412', marginBottom: '0.25rem' }}>
                  सम्झौता मिति (वि.सं.)
                </label>
                <input
                  type="text"
                  placeholder="२०८३-०२-२५"
                  value={formData.agreementDateBs || ''}
                  onChange={(e) => handleInputChange('agreementDateBs', e.target.value)}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #fdba74', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#9a3412', marginBottom: '0.25rem' }}>
                  सुरु हुने मिति (वि.सं.) *
                </label>
                <input
                  type="text"
                  placeholder="२०८३-०२-३०"
                  value={formData.startDateBs || ''}
                  onChange={(e) => handleInputChange('startDateBs', e.target.value)}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #fdba74', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#9a3412', marginBottom: '0.25rem' }}>
                  सम्पन्न हुने मिति (वि.सं.) *
                </label>
                <input
                  type="text"
                  placeholder="२०८३-०३-१५"
                  value={formData.completionDateBs || ''}
                  onChange={(e) => handleInputChange('completionDateBs', e.target.value)}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #fdba74', fontSize: '0.85rem' }}
                />
              </div>
            </div>
          </div>

          {/* Section 4: Consumer Committee Details */}
          <div style={{ border: '1px solid #e9d5ff', borderRadius: '10px', padding: '1rem', backgroundColor: '#faf5ff' }}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#6b21a8', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <UserCheck size={16} />
              <span>४. उपभोक्ता समिति पदाधिकारी विवरण (Consumer Committee)</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#6b21a8', marginBottom: '0.25rem' }}>
                  उपभोक्ता समितिको नाम
                </label>
                <input
                  type="text"
                  placeholder="उदा: थाङपालकोट स्वास्थ्य चौकी मर्मत उपभोक्ता समिति"
                  value={formData.committeeName || ''}
                  onChange={(e) => handleInputChange('committeeName', e.target.value)}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #d8b4fe', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#6b21a8', marginBottom: '0.25rem' }}>
                  अध्यक्षको नाम
                </label>
                <input
                  type="text"
                  placeholder="अध्यक्षको नाम"
                  value={formData.committeeChair || ''}
                  onChange={(e) => handleInputChange('committeeChair', e.target.value)}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #d8b4fe', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#6b21a8', marginBottom: '0.25rem' }}>
                  सम्पर्क मोबाइल नं.
                </label>
                <input
                  type="text"
                  placeholder="९८४१००००००"
                  value={formData.committeePhone || ''}
                  onChange={(e) => handleInputChange('committeePhone', e.target.value)}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #d8b4fe', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#6b21a8', marginBottom: '0.25rem' }}>
                  सचिवको नाम
                </label>
                <input
                  type="text"
                  placeholder="सचिवको नाम"
                  value={formData.committeeSecretary || ''}
                  onChange={(e) => handleInputChange('committeeSecretary', e.target.value)}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #d8b4fe', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#6b21a8', marginBottom: '0.25rem' }}>
                  कोषाध्यक्षको नाम
                </label>
                <input
                  type="text"
                  placeholder="कोषाध्यक्षको नाम"
                  value={formData.committeeTreasurer || ''}
                  onChange={(e) => handleInputChange('committeeTreasurer', e.target.value)}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #d8b4fe', fontSize: '0.85rem' }}
                />
              </div>
            </div>
          </div>

          {/* Section 5: Technical Estimate, Contingency & Monitoring (स्थानीय तह प्राविधिक तथा अनुगमन) */}
          <div style={{ border: '1px solid #93c5fd', borderRadius: '10px', padding: '1rem', backgroundColor: '#eff6ff' }}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1e40af', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Building size={16} />
              <span>५. प्राविधिक लगत अनुमान, कन्टिन्जेन्सी र अनुगमन समिति मूल्याङ्कन</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#1e40af', marginBottom: '0.25rem' }}>
                  प्राविधिक लगत अनुमान (रु.)
                </label>
                <input
                  type="number"
                  placeholder="उदा. ५०००००"
                  value={formData.technicalEstimateAmount ?? ''}
                  onChange={(e) => handleInputChange('technicalEstimateAmount', Number(e.target.value))}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #bfdbfe', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#1e40af', marginBottom: '0.25rem' }}>
                  जिम्मेवार इन्जिनियर / प्राविधिक
                </label>
                <input
                  type="text"
                  placeholder="उदा. ई. सन्तोष श्रेष्ठ"
                  value={formData.responsibleEngineer || ''}
                  onChange={(e) => handleInputChange('responsibleEngineer', e.target.value)}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #bfdbfe', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#1e40af', marginBottom: '0.25rem' }}>
                  कन्टिन्जेन्सी कट्टी दर (%)
                </label>
                <select
                  value={formData.contingencyRatePercent ?? 3}
                  onChange={(e) => handleInputChange('contingencyRatePercent', Number(e.target.value))}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #bfdbfe', fontSize: '0.85rem', backgroundColor: '#ffffff' }}
                >
                  <option value={1.5}>१.५% (ठेक्का आयोजना)</option>
                  <option value={3}>३.०% (उपभोक्ता समिति - मानक)</option>
                  <option value={5}>५.०% (विशेष संरचना)</option>
                  <option value={0}>०% (छुट)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#1e40af', marginBottom: '0.25rem' }}>
                  मर्मत सम्भार कोष कट्टी (%)
                </label>
                <select
                  value={formData.maintenanceFundPercent ?? 3}
                  onChange={(e) => handleInputChange('maintenanceFundPercent', Number(e.target.value))}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #bfdbfe', fontSize: '0.85rem', backgroundColor: '#ffffff' }}
                >
                  <option value={3}>३% (मानक दर)</option>
                  <option value={5}>५% (उच्च उपयोग संरचना)</option>
                  <option value={0}>०%</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#1e40af', marginBottom: '0.25rem' }}>
                  अनुगमन समिति मूल्याङ्कन अंक (/१००)
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  placeholder="उदा. ८८"
                  value={formData.monitoringCommitteeScore ?? ''}
                  onChange={(e) => handleInputChange('monitoringCommitteeScore', Number(e.target.value))}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #bfdbfe', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#1e40af', marginBottom: '0.25rem' }}>
                  अनुगमन समिति (उपाध्यक्ष संयोजक) सिफारिस
                </label>
                <select
                  value={formData.monitoringRecommendation || 'under_review'}
                  onChange={(e) => handleInputChange('monitoringRecommendation', e.target.value)}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #bfdbfe', fontSize: '0.85rem', backgroundColor: '#ffffff' }}
                >
                  <option value="approved_for_installment">सिफारिस स्वीकृत (किस्ता निकासा योग्य)</option>
                  <option value="under_review">स्थलगत अध्ययन जारी (Under Review)</option>
                  <option value="revision_needed">सुधार / थप कागजात आवश्यक</option>
                  <option value="pending">प्रक्रियामा (Pending)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 6: Progress & Location */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                भौतिक प्रगति (%)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={formData.physicalProgressPercent ?? 0}
                onChange={(e) => handleInputChange('physicalProgressPercent', Number(e.target.value))}
                style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                हालसम्म भुक्तानी रकम (रु.)
              </label>
              <input
                type="number"
                value={formData.paidAmount ?? 0}
                onChange={(e) => handleInputChange('paidAmount', Number(e.target.value))}
                style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                आयोजना स्थिति (Status)
              </label>
              <select
                value={formData.status || 'ongoing'}
                onChange={(e) => handleInputChange('status', e.target.value)}
                style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', backgroundColor: '#ffffff' }}
              >
                <option value="ongoing">सञ्चालनमा (Ongoing)</option>
                <option value="completed">सम्पन्न (Completed)</option>
                <option value="approved">सम्झौता स्वीकृत (Agreed)</option>
                <option value="planning">योजना चरण (Planning)</option>
              </select>
            </div>
          </div>

          {/* Footer Actions */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              gap: '0.75rem',
              marginTop: '0.5rem',
              paddingTop: '1rem',
              borderTop: '1px solid #e2e8f0',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
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
              type="submit"
              disabled={isSubmitting}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.6rem 1.4rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#0284c7',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                boxShadow: '0 2px 4px rgba(2, 132, 199, 0.2)',
              }}
            >
              <Save size={16} />
              <span>{isSubmitting ? 'सुरक्षित हुँदैछ...' : projectToEdit ? 'परिवर्तन सुरक्षित गर्नुहोस्' : 'योजना सम्झौता सुरक्षित गर्नुहोस्'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
