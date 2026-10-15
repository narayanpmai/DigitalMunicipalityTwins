import React, { useState, useEffect } from 'react';
import {
  X,
  Database,
  FileText,
  Compass,
  Award,
  Save,
  CheckCircle2,
  AlertCircle,
  Link as LinkIcon,
  Tag,
  Building,
  Target,
  FileSpreadsheet,
} from 'lucide-react';
import type { OpenDataRecord, OpenDataCategory } from '../../../types/open-data';

export interface OpenDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: Partial<OpenDataRecord>) => Promise<void> | void;
  recordToEdit?: OpenDataRecord | null;
  defaultCategory?: OpenDataCategory;
  isSubmitting?: boolean;
}

const CATEGORY_TABS: Array<{ id: OpenDataCategory; label: string; icon: any; color: string; bg: string }> = [
  { id: 'datasets', label: 'खुला डेटा क्याटलग (Datasets)', icon: Database, color: '#2563eb', bg: '#eff6ff' },
  { id: 'reports', label: 'सार्वजनिक प्रतिवेदनहरू (Reports)', icon: FileText, color: '#10b981', bg: '#ecfdf5' },
  { id: 'strategic', label: 'रणनीतिक योजना तथा MTED', icon: Compass, color: '#9333ea', bg: '#faf5ff' },
  { id: 'practices', label: 'असल अभ्यास र सिकाइ (Practices)', icon: Award, color: '#d97706', bg: '#fffbeb' },
];

const DATASET_SUB_CATEGORIES = [
  'जनसांख्यिकी',
  'बजेट/योजना',
  'स्वास्थ्य',
  'शिक्षा',
  'पर्यटन/GIS',
  'पूर्वाधार',
  'कृषि तथा पशुपन्छी',
  'विपद् व्यवस्थापन',
  'सामाजिक समावेशीकरण',
  'सुशासन तथा प्रशासन',
];

const REPORT_SUB_CATEGORIES = [
  'वार्षिक प्रतिवेदन',
  'वित्तीय प्रतिवेदन',
  'सुशासन तथा परीक्षण',
  'विपद् व्यवस्थापन',
  'नागरिक बडापत्र तथा गुनासो',
  'आयोजना अनुगमन प्रतिवेदन',
  'विशेष अध्ययन प्रतिवेदन',
];

const STRATEGIC_PILLARS = [
  'पूर्वाधार विकास',
  'आर्थिक विकास',
  'पर्यटन तथा संस्कृति',
  'सामाजिक रूपान्तरण',
  'वातावरण तथा विपद्',
  'डिजिटल सुशासन',
];

const PRACTICE_SUB_CATEGORIES = [
  'डिजिटल सुशासन',
  'मौलिक शिक्षा',
  'सामाजिक सुरक्षा',
  'वातावरण तथा पर्यटन',
  'कृषि प्रवर्द्धन',
  'स्वास्थ्य सेवा',
  'सामुदायिक विकास',
];

export const OpenDataModal: React.FC<OpenDataModalProps> = ({
  isOpen,
  onClose,
  onSave,
  recordToEdit,
  defaultCategory = 'datasets',
  isSubmitting = false,
}) => {
  const [activeCategory, setActiveCategory] = useState<OpenDataCategory>(defaultCategory);
  const [formData, setFormData] = useState<Partial<OpenDataRecord>>({
    category: defaultCategory,
    title: '',
    subCategory: '',
    fiscalYear: '२०८१/०८२',
    wardNumber: 0,
    description: '',
    format: 'CSV / JSON',
    fileSize: '1.0 MB',
    recordsCount: 0,
    fileUrl: '',
    publishDate: '२०८१/०५/०१',
    authorOrDepartment: 'योजना तथा सूचना प्रविधि शाखा',
    targetGoal: '',
    budgetAllocated: 0,
    tagBadge: '',
    status: 'प्रकाशित',
    keyIndicators: [],
  });

  const [indicatorText, setIndicatorText] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (recordToEdit) {
      setActiveCategory(recordToEdit.category || 'datasets');
      setFormData({
        ...recordToEdit,
        budgetAllocated: Number(recordToEdit.budgetAllocated) || 0,
        recordsCount: Number(recordToEdit.recordsCount) || 0,
        wardNumber: Number(recordToEdit.wardNumber) || 0,
      });

      if (Array.isArray(recordToEdit.keyIndicators)) {
        setIndicatorText(recordToEdit.keyIndicators.join('\n'));
      } else if (typeof recordToEdit.keyIndicators === 'object' && recordToEdit.keyIndicators !== null) {
        setIndicatorText(Object.values(recordToEdit.keyIndicators).join('\n'));
      } else {
        setIndicatorText('');
      }
    } else {
      setActiveCategory(defaultCategory);
      const defaultsForCat = getDefaultsForCategory(defaultCategory);
      setFormData({
        category: defaultCategory,
        title: '',
        subCategory: defaultsForCat.subCategory,
        fiscalYear: defaultCategory === 'strategic' ? '२०८१-२०८६' : '२०८१/०८२',
        wardNumber: 0,
        description: '',
        format: defaultsForCat.format,
        fileSize: defaultsForCat.fileSize,
        recordsCount: 0,
        fileUrl: '',
        publishDate: '२०८१/०५/०१',
        authorOrDepartment: defaultsForCat.department,
        targetGoal: '',
        budgetAllocated: 0,
        tagBadge: defaultsForCat.tagBadge,
        status: defaultCategory === 'strategic' ? 'कार्यान्वयनमा' : defaultCategory === 'practices' ? 'नियमित' : 'प्रकाशित',
        keyIndicators: [],
      });
      setIndicatorText('');
    }
    setErrorMessage(null);
  }, [recordToEdit, isOpen, defaultCategory]);

  function getDefaultsForCategory(cat: OpenDataCategory) {
    switch (cat) {
      case 'datasets':
        return {
          subCategory: 'जनसांख्यिकी',
          format: 'CSV / JSON',
          fileSize: '1.2 MB',
          department: 'योजना तथा सूचना प्रविधि शाखा',
          tagBadge: '',
        };
      case 'reports':
        return {
          subCategory: 'वार्षिक प्रतिवेदन',
          format: 'PDF',
          fileSize: '3.5 MB',
          department: 'प्रमुख प्रशासकीय अधिकृतको कार्यालय',
          tagBadge: '',
        };
      case 'strategic':
        return {
          subCategory: 'पूर्वाधार विकास',
          format: 'MTED ५-वर्षे स्तम्भ',
          fileSize: '',
          department: 'योजना तथा पूर्वाधार विकास शाखा',
          tagBadge: '',
        };
      case 'practices':
        return {
          subCategory: 'डिजिटल सुशासन',
          format: 'नमुना असल अभ्यास',
          fileSize: '',
          department: 'पाँचपोखरी थाङपाल गाउँपालिका',
          tagBadge: 'नमुना अभ्यास',
        };
      default:
        return {
          subCategory: '',
          format: '',
          fileSize: '',
          department: '',
          tagBadge: '',
        };
    }
  }

  const handleCategoryChange = (cat: OpenDataCategory) => {
    setActiveCategory(cat);
    const defaults = getDefaultsForCategory(cat);
    setFormData((prev) => ({
      ...prev,
      category: cat,
      subCategory: prev.subCategory || defaults.subCategory,
      format: prev.format || defaults.format,
      fileSize: prev.fileSize || defaults.fileSize,
      authorOrDepartment: prev.authorOrDepartment || defaults.department,
      tagBadge: prev.tagBadge || defaults.tagBadge,
      fiscalYear: cat === 'strategic' ? '२०८१-२०८६' : prev.fiscalYear || '२०८१/०८२',
      status: cat === 'strategic' ? 'कार्यान्वयनमा' : cat === 'practices' ? 'नियमित' : 'प्रकाशित',
    }));
  };

  const handleInputChange = (field: keyof OpenDataRecord, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || formData.title.trim() === '') {
      setErrorMessage('कृपया मुख्य शीर्षक अनिवार्य रूपमा भर्नुहोस्।');
      return;
    }

    const parsedIndicators = indicatorText
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const submissionData: Partial<OpenDataRecord> = {
      ...formData,
      category: activeCategory,
      wardNumber: Number(formData.wardNumber) || 0,
      budgetAllocated: Number(formData.budgetAllocated) || 0,
      recordsCount: Number(formData.recordsCount) || 0,
      keyIndicators: parsedIndicators.length > 0 ? parsedIndicators : undefined,
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
          maxWidth: '780px',
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
            background: 'linear-gradient(135deg, #f8fafc 0%, #edf2f7 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                backgroundColor: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
              }}
            >
              <Database size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                {recordToEdit ? 'विवरण सम्पादन गर्नुहोस्' : '+ नयाँ खुला तथ्याङ्क / योजना प्रविष्टि'}
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0 0 0' }}>
                पाँचपोखरी थाङपाल गाउँपालिका — खुला तथ्याङ्क, प्रतिवेदन, MTED तथा असल अभ्यास
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
            backgroundColor: '#f1f5f9',
            borderBottom: '1px solid #e2e8f0',
            overflowX: 'auto',
          }}
        >
          {CATEGORY_TABS.map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeCategory === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleCategoryChange(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 0.9rem',
                  borderRadius: '8px',
                  border: isSelected ? `2px solid ${tab.color}` : '1px solid #cbd5e1',
                  backgroundColor: isSelected ? '#ffffff' : 'transparent',
                  color: isSelected ? tab.color : '#64748b',
                  fontWeight: isSelected ? 700 : 500,
                  fontSize: '0.825rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  boxShadow: isSelected ? '0 2px 4px rgba(0,0,0,0.06)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                <Icon size={16} color={isSelected ? tab.color : '#94a3b8'} />
                <span>{tab.label}</span>
              </button>
            );
          })}
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

          {/* Row 1: Title */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
              {activeCategory === 'datasets' && 'डेटासेटको शीर्षक *'}
              {activeCategory === 'reports' && 'सार्वजनिक प्रतिवेदनको शीर्षक *'}
              {activeCategory === 'strategic' && 'रणनीतिक योजना / स्तम्भको शीर्षक *'}
              {activeCategory === 'practices' && 'असल अभ्यासको शीर्षक *'}
            </label>
            <input
              type="text"
              required
              placeholder={
                activeCategory === 'datasets'
                  ? 'उदा: पालिका जनसांख्यिकी तथा घरधुरी विवरण २०८१'
                  : activeCategory === 'reports'
                  ? 'उदा: आ.व. २०८०/०८१ वार्षिक प्रगति तथा समीक्षा प्रतिवेदन'
                  : activeCategory === 'strategic'
                  ? 'उदा: १. दिगो सडक तथा पूर्वाधार संजाल विस्तार'
                  : "उदा: 'हाम्रो पाँचपोखरी' स्थानीय पाठ्यक्रम निर्माण"
              }
              value={formData.title || ''}
              onChange={(e) => handleInputChange('title', e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 0.9rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.9rem',
                color: '#0f172a',
                outline: 'none',
              }}
            />
          </div>

          {/* Row 2: Sub-category, Fiscal Year, Ward */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                विषयगत क्षेत्र / विधा
              </label>
              <input
                type="text"
                list="subcategory-options"
                placeholder="क्षेत्र चयन वा टाइप गर्नुहोस्"
                value={formData.subCategory || ''}
                onChange={(e) => handleInputChange('subCategory', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.8rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.875rem',
                }}
              />
              <datalist id="subcategory-options">
                {activeCategory === 'datasets' && DATASET_SUB_CATEGORIES.map((s) => <option key={s} value={s} />)}
                {activeCategory === 'reports' && REPORT_SUB_CATEGORIES.map((s) => <option key={s} value={s} />)}
                {activeCategory === 'strategic' && STRATEGIC_PILLARS.map((s) => <option key={s} value={s} />)}
                {activeCategory === 'practices' && PRACTICE_SUB_CATEGORIES.map((s) => <option key={s} value={s} />)}
              </datalist>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                {activeCategory === 'strategic' ? 'योजना अवधि / आ.व.' : 'आर्थिक वर्ष'}
              </label>
              <input
                type="text"
                placeholder={activeCategory === 'strategic' ? '२०८१-२०८६' : '२०८१/०८२'}
                value={formData.fiscalYear || ''}
                onChange={(e) => handleInputChange('fiscalYear', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.8rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.875rem',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                सम्बन्धित वडा
              </label>
              <select
                value={formData.wardNumber ?? 0}
                onChange={(e) => handleInputChange('wardNumber', Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.8rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.875rem',
                  backgroundColor: '#ffffff',
                }}
              >
                <option value={0}>सबै वडा (पालिका स्तर)</option>
                <option value={1}>वडा नं. १ (बासखर्क)</option>
                <option value={2}>वडा नं. २ (बरुवा)</option>
                <option value={3}>वडा नं. ३ (भोताङ)</option>
                <option value={4}>वडा नं. ४ (थाङपाल / मानेखर्क)</option>
                <option value={5}>वडा नं. ५ (गुन्सा)</option>
                <option value={6}>वडा नं. ६ (थाङपालधाप)</option>
                <option value={7}>वडा नं. ७ (भोटेनाम्लाङ / तिपेनी)</option>
                <option value={8}>वडा नं. ८ (लाँगर्चे)</option>
              </select>
            </div>
          </div>

          {/* Category-Specific Fields */}

          {/* DATASETS SPECIFIC */}
          {activeCategory === 'datasets' && (
            <div
              style={{
                backgroundColor: '#eff6ff',
                padding: '1rem',
                borderRadius: '10px',
                border: '1px solid #bfdbfe',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
              }}
            >
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#1e40af', marginBottom: '0.3rem' }}>
                  फाइल ढाँचा (Format)
                </label>
                <input
                  type="text"
                  placeholder="उदा: CSV / JSON, GeoJSON"
                  value={formData.format || ''}
                  onChange={(e) => handleInputChange('format', e.target.value)}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #93c5fd', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#1e40af', marginBottom: '0.3rem' }}>
                  रेकर्ड संख्या (Records)
                </label>
                <input
                  type="number"
                  placeholder="उदा: 5120"
                  value={formData.recordsCount ?? 0}
                  onChange={(e) => handleInputChange('recordsCount', Number(e.target.value))}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #93c5fd', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#1e40af', marginBottom: '0.3rem' }}>
                  फाइल साइज (Size)
                </label>
                <input
                  type="text"
                  placeholder="उदा: 1.2 MB, 480 KB"
                  value={formData.fileSize || ''}
                  onChange={(e) => handleInputChange('fileSize', e.target.value)}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #93c5fd', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#1e40af', marginBottom: '0.3rem' }}>
                  अद्यावधिक मिति
                </label>
                <input
                  type="text"
                  placeholder="२०८१/०५/०१"
                  value={formData.publishDate || ''}
                  onChange={(e) => handleInputChange('publishDate', e.target.value)}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #93c5fd', fontSize: '0.85rem' }}
                />
              </div>
            </div>
          )}

          {/* REPORTS SPECIFIC */}
          {activeCategory === 'reports' && (
            <div
              style={{
                backgroundColor: '#ecfdf5',
                padding: '1rem',
                borderRadius: '10px',
                border: '1px solid #a7f3d0',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
              }}
            >
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#065f46', marginBottom: '0.3rem' }}>
                  प्रकाशन मिति
                </label>
                <input
                  type="text"
                  placeholder="२०८१/०४/३०"
                  value={formData.publishDate || ''}
                  onChange={(e) => handleInputChange('publishDate', e.target.value)}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #6ee7b7', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#065f46', marginBottom: '0.3rem' }}>
                  फाइल ढाँचा र साइज
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder="PDF"
                    value={formData.format || ''}
                    onChange={(e) => handleInputChange('format', e.target.value)}
                    style={{ width: '45%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #6ee7b7', fontSize: '0.85rem' }}
                  />
                  <input
                    type="text"
                    placeholder="4.2 MB"
                    value={formData.fileSize || ''}
                    onChange={(e) => handleInputChange('fileSize', e.target.value)}
                    style={{ width: '55%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #6ee7b7', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#065f46', marginBottom: '0.3rem' }}>
                  डाउनलोड लिङ्क / PDF URL
                </label>
                <input
                  type="text"
                  placeholder="/reports/annual_report.pdf"
                  value={formData.fileUrl || ''}
                  onChange={(e) => handleInputChange('fileUrl', e.target.value)}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #6ee7b7', fontSize: '0.85rem' }}
                />
              </div>
            </div>
          )}

          {/* STRATEGIC MTED SPECIFIC */}
          {activeCategory === 'strategic' && (
            <div
              style={{
                backgroundColor: '#faf5ff',
                padding: '1rem',
                borderRadius: '10px',
                border: '1px solid #e9d5ff',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: '#6b21a8', marginBottom: '0.3rem' }}>
                  प्रमुख आवधिक लक्ष्य (Target Milestone / MTED Goal)
                </label>
                <input
                  type="text"
                  placeholder="उदा: लक्ष्य: ९५% बस्तीमा सुरक्षित बाह्रमासे सडक पहुँच तथा पक्की पुल निर्माण"
                  value={formData.targetGoal || ''}
                  onChange={(e) => handleInputChange('targetGoal', e.target.value)}
                  style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '6px', border: '1px solid #d8b4fe', fontSize: '0.875rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#6b21a8', marginBottom: '0.3rem' }}>
                    अनुमानित ५-वर्षे बजेट (रु. मा)
                  </label>
                  <input
                    type="number"
                    placeholder="उदा: 285000000"
                    value={formData.budgetAllocated ?? 0}
                    onChange={(e) => handleInputChange('budgetAllocated', Number(e.target.value))}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #d8b4fe', fontSize: '0.85rem' }}
                  />
                  <div style={{ fontSize: '0.75rem', color: '#9333ea', marginTop: '3px' }}>
                    {formData.budgetAllocated ? `रु. ${(Number(formData.budgetAllocated) / 10000000).toFixed(2)} करोड` : ''}
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#6b21a8', marginBottom: '0.3rem' }}>
                    स्तम्भ ढाँचा / वर्गीकरण
                  </label>
                  <input
                    type="text"
                    placeholder="MTED ५-वर्षे स्तम्भ"
                    value={formData.format || ''}
                    onChange={(e) => handleInputChange('format', e.target.value)}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #d8b4fe', fontSize: '0.85rem' }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* GOOD PRACTICES SPECIFIC */}
          {activeCategory === 'practices' && (
            <div
              style={{
                backgroundColor: '#fffbeb',
                padding: '1rem',
                borderRadius: '10px',
                border: '1px solid #fde68a',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: '#92400e', marginBottom: '0.3rem' }}>
                  मुख्य आकर्षण / ट्यागलाइन (Tagline / Badge)
                </label>
                <input
                  type="text"
                  placeholder="उदा: डिजिटल सुशासनको राष्ट्रिय नमुना / मौलिक ज्ञान र भाषा संरक्षण"
                  value={formData.tagBadge || ''}
                  onChange={(e) => handleInputChange('tagBadge', e.target.value)}
                  style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '6px', border: '1px solid #fcd34d', fontSize: '0.875rem' }}
                />
              </div>
            </div>
          )}

          {/* Row 3: Department, Status, Resource Link */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                शाखा / जिम्मेवार निकाय
              </label>
              <input
                type="text"
                placeholder="योजना तथा सूचना प्रविधि शाखा"
                value={formData.authorOrDepartment || ''}
                onChange={(e) => handleInputChange('authorOrDepartment', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.8rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.875rem',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                अवस्था / स्थिति
              </label>
              <select
                value={formData.status || 'प्रकाशित'}
                onChange={(e) => handleInputChange('status', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.8rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.875rem',
                  backgroundColor: '#ffffff',
                }}
              >
                <option value="प्रकाशित">प्रकाशित (Published)</option>
                <option value="सक्रिय">सक्रिय (Active)</option>
                <option value="नियमित">नियमित (Regular)</option>
                <option value="कार्यान्वयनमा">कार्यान्वयनमा (Ongoing)</option>
                <option value="मस्यौदा">मस्यौदा (Draft)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                फाइल वा डाउनलोड लिङ्क
              </label>
              <input
                type="text"
                placeholder="/downloads/file.csv वा https://..."
                value={formData.fileUrl || ''}
                onChange={(e) => handleInputChange('fileUrl', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.8rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.875rem',
                }}
              />
            </div>
          </div>

          {/* Row 4: Description / Summary */}
          <div>
            <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
              विस्तृत विवरण तथा सारांश
            </label>
            <textarea
              rows={3}
              placeholder="डेटासेट, प्रतिवेदन वा योजनाको विस्तृत विवरण यहाँ प्रविष्टि गर्नुहोस्..."
              value={formData.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 0.8rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.875rem',
                lineHeight: '1.5',
                resize: 'vertical',
              }}
            />
          </div>

          {/* Row 5: Key Indicators / Achievements (for strategic and practices) */}
          {(activeCategory === 'strategic' || activeCategory === 'practices') && (
            <div>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                {activeCategory === 'strategic' ? 'प्रमुख सूचक तथा रणनीतिहरू (प्रत्येक लाइनमा एक सूचक)' : 'प्राप्त मुख्य उपलब्धिहरू (प्रत्येक लाइनमा एक उपलब्धि)'}
              </label>
              <textarea
                rows={3}
                placeholder={
                  activeCategory === 'strategic'
                    ? 'कालोपत्रे सडक: २५ किमी विस्तार\nग्राभेल तथा नाला निर्माण: ४० किमी\nपक्की मोटरेबल पुल: ४ वटा'
                    : 'थ्रीडी डिजिटल ट्विन मोडेल तयार\nसडक, भवन र पहिरो जोखिम GIS तह\nसिम्युलेसन आधारित योजना तर्जुमा'
                }
                value={indicatorText}
                onChange={(e) => setIndicatorText(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.8rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.85rem',
                  lineHeight: '1.5',
                  resize: 'vertical',
                }}
              />
            </div>
          )}

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
                backgroundColor: '#2563eb',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)',
              }}
            >
              <Save size={16} />
              <span>{isSubmitting ? 'सुरक्षित हुँदैछ...' : recordToEdit ? 'परिवर्तन सुरक्षित गर्नुहोस्' : 'नयाँ रेकर्ड थप्नुहोस्'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
