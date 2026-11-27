import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { Project } from '../../../types/sectoral';
import {
  X,
  FileSpreadsheet,
  Download,
  Filter,
  FileText,
  Printer,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Building2,
  Coins,
  AlertCircle,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';

export interface ProjectSutraAuditExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  initialSelectedProjectId?: string | null;
}

const toNepaliNum = (num: number | string): string => {
  const nepaliDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  return String(num).replace(/\d/g, (d) => nepaliDigits[parseInt(d, 10)]);
};

export const ProjectSutraAuditExportModal: React.FC<ProjectSutraAuditExportModalProps> = ({
  isOpen,
  onClose,
  projects,
  initialSelectedProjectId,
}) => {
  const [activeTab, setActiveTab] = useState<'sutra' | 'audit_dossier'>('sutra');
  const [selectedFy, setSelectedFy] = useState<string>('all');
  const [selectedWard, setSelectedWard] = useState<string>('all');
  const [selectedMarfat, setSelectedMarfat] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const [dossierProjectId, setDossierProjectId] = useState<string>(
    initialSelectedProjectId || projects[0]?.id || '',
  );

  // Filtered projects for SuTRA export
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      if (selectedFy !== 'all' && (p.fiscalYear || '२०८१/०८२') !== selectedFy) return false;
      if (selectedWard !== 'all' && String(p.wardNumber) !== selectedWard) return false;
      if (selectedMarfat !== 'all' && (p.marfat || 'उपभोक्ता समिति') !== selectedMarfat) return false;
      if (selectedStatus !== 'all' && (p.agreementStatus || p.status) !== selectedStatus) return false;
      return true;
    });
  }, [projects, selectedFy, selectedWard, selectedMarfat, selectedStatus]);

  // Summary Metrics
  const metrics = useMemo(() => {
    let totalBudget = 0;
    let totalAgreement = 0;
    let totalPaid = 0;
    let totalContingency = 0;

    filteredProjects.forEach((p) => {
      const b = Number(p.budget || p.allocatedBudget || 0);
      const a = Number(p.totalAgreementAmount || p.budget || 0);
      const pd = Number(p.paidAmount || 0);
      const c = Number(p.contingencyAmount || 0);
      totalBudget += b;
      totalAgreement += a;
      totalPaid += pd;
      totalContingency += c;
    });

    return {
      count: filteredProjects.length,
      totalBudget,
      totalAgreement,
      totalPaid,
      totalRemaining: Math.max(0, totalAgreement - totalPaid),
      totalContingency,
    };
  }, [filteredProjects]);

  const activeDossierProject = useMemo(() => {
    return projects.find((p) => p.id === dossierProjectId) || filteredProjects[0] || projects[0] || null;
  }, [projects, filteredProjects, dossierProjectId]);

  if (!isOpen) return null;

  // Generate SuTRA Dataset
  const buildSutraRows = () => {
    return filteredProjects.map((p, idx) => {
      const budget = Number(p.budget || p.allocatedBudget || 0);
      const officeCost = Number(p.officeCost || p.budget || 0);
      const committeeCost = Number(p.committeeCost || p.communityContribution || 0);
      const totalAgreement = Number(p.totalAgreementAmount || (officeCost + committeeCost) || budget);
      const paid = Number(p.paidAmount || 0);
      const remaining = Math.max(0, totalAgreement - paid);
      const contingency = Number(p.contingencyAmount || (officeCost * 0.03) || 0);
      const maintenance = officeCost * 0.03;

      // Latest time extension date
      const exts = Array.isArray(p.timeExtensions) ? p.timeExtensions : [];
      const latestExtDate = exts.length > 0 ? exts[exts.length - 1].extendedCompletionDateBs : '-';

      return {
        'क्र.सं.': idx + 1,
        'क्रियाकलाप / आयोजना संकेत': p.projectCode || `PPTP-${p.wardNumber || '0'}-${String(idx + 1).padStart(3, '0')}`,
        'आयोजनाको नाम': p.name,
        'वडा नं.': p.wardNumber ? `वडा नं. ${p.wardNumber}` : 'गाउँपालिकास्तरीय',
        'बजेट उपशीर्षक': p.budgetSubHead || '३११५१',
        'बजेट स्रोत': p.budgetSource || 'संघीय समानीकरण अनुदान',
        'विनियोजित बजेट (रु.)': budget,
        'कार्यान्वयन विधि': p.marfat || 'उपभोक्ता समिति',
        'उपभोक्ता समिति / निर्माण व्यवसायी': p.committeeName || p.contractor || '-',
        'समिति अध्यक्ष / सम्पर्क': p.committeeChair ? `${p.committeeChair} (${p.committeePhone || '-'})` : '-',
        'सम्झौता मिति (वि.सं.)': p.agreementDateBs || '-',
        'तोकिएको सम्पन्न मिति': p.completionDateBs || '-',
        'थप भएको म्याद (वि.सं.)': latestExtDate,
        'कुल सम्झौता लागत (रु.)': totalAgreement,
        'कार्यालय अनुदान (रु.)': officeCost,
        'उपभोक्ता जनसहभागिता (रु.)': committeeCost,
        'हालसम्म भुक्तानी भएको खर्च (रु.)': paid,
        'कन्टेन्जेन्सी कट्टी ३% (रु.)': contingency,
        'मर्मत सम्भार कोष ३% (रु.)': maintenance,
        'बाँकी दायित्व रकम (रु.)': remaining,
        'भौतिक प्रगति (%)': Number(p.progressPercentage ?? p.physicalProgressPercent ?? 0),
        'वित्तीय प्रगति (%)': totalAgreement > 0 ? Number(((paid / totalAgreement) * 100).toFixed(1)) : 0,
        'योजनाको अवस्था': p.agreementStatus || p.status || 'सम्झौता भएको',
        'सामाजिक परीक्षण स्थिति': p.socialAudit?.publicSatisfaction ? `सम्पन्न (${p.socialAudit.publicSatisfaction})` : 'बाँकी',
        'कैफियत': p.remarks || '-',
      };
    });
  };

  const handleExportXlsx = () => {
    const data = buildSutraRows();
    if (data.length === 0) {
      alert('एक्सपोर्ट गर्न कुनै डेटा उपलब्ध छैन।');
      return;
    }
    const ws = XLSX.utils.json_to_sheet(data);
    ws['!cols'] = [
      { wch: 6 },  // क्र.सं.
      { wch: 18 }, // कोड
      { wch: 38 }, // नाम
      { wch: 12 }, // वडा
      { wch: 14 }, // उपशीर्षक
      { wch: 25 }, // स्रोत
      { wch: 16 }, // विनियोजित
      { wch: 16 }, // विधि
      { wch: 28 }, // समिति
      { wch: 22 }, // अध्यक्ष
      { wch: 14 }, // सम्झौता मिति
      { wch: 14 }, // सम्पन्न मिति
      { wch: 14 }, // थप म्याद
      { wch: 16 }, // सम्झौता लागत
      { wch: 15 }, // कार्यालय
      { wch: 15 }, // जनसहभागिता
      { wch: 16 }, // भुक्तानी
      { wch: 14 }, // कन्टिन्जेन्सी
      { wch: 14 }, // मर्मत कोष
      { wch: 15 }, // बाँकी
      { wch: 12 }, // भौतिक
      { wch: 12 }, // वित्तीय
      { wch: 15 }, // अवस्था
      { wch: 16 }, // सामाजिक परीक्षण
      { wch: 20 }, // कैफियत
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'SuTRA_Yojana_Audit_Report');
    XLSX.writeFile(wb, `Panchpokhari_SuTRA_Audit_Report_${Date.now()}.xlsx`);
  };

  const handleExportCsv = () => {
    const data = buildSutraRows();
    if (data.length === 0) {
      alert('एक्सपोर्ट गर्न कुनै डेटा उपलब्ध छैन।');
      return;
    }
    const headers = Object.keys(data[0]);
    const csvContent =
      '\uFEFF' + // UTF-8 BOM for Excel to open Nepali Unicode without corruption
      [
        headers.join(','),
        ...data.map((row) =>
          headers
            .map((h) => {
              const val = (row as any)[h];
              const strVal = String(val === undefined || val === null ? '' : val).replace(/"/g, '""');
              return `"${strVal}"`;
            })
            .join(','),
        ),
      ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Panchpokhari_SuTRA_Export_${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrintDossier = () => {
    window.print();
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem',
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '1150px',
          maxHeight: '94vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          overflow: 'hidden',
          border: '1px solid #cbd5e1',
          margin: 'auto',
        }}
      >
        {/* Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0f4c81 0%, #1e3a8a 100%)',
            color: '#ffffff',
            padding: '1.15rem 1.5rem',
            borderBottom: '1px solid #1e3a8a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
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
                flexShrink: 0,
              }}
            >
              <FileSpreadsheet size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: '#ffffff' }}>
                SuTRA वित्तीय प्रणाली एक्सपोर्ट तथा योजना अडिट ट्रेल प्रतिवेदन
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#bfdbfe', margin: '3px 0 0 0' }}>
                स्थानीय सञ्चित कोष व्यवस्थापन प्रणाली (SuTRA) र महालेखा/आन्तरिक अडिट अनुकूल एकीकृत विवरण
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              padding: '0.5rem',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="बन्द गर्नुहोस्"
          >
            <X size={20} />
          </button>
        </div>

        {/* Sub-tabs */}
        <div
          style={{
            backgroundColor: '#f8fafc',
            padding: '0.65rem 1.25rem',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            gap: '0.5rem',
            flexWrap: 'wrap',
            flexShrink: 0,
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('sutra')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              fontSize: '0.825rem',
              fontWeight: 600,
              cursor: 'pointer',
              backgroundColor: activeTab === 'sutra' ? '#0f4c81' : '#ffffff',
              color: activeTab === 'sutra' ? '#ffffff' : '#334155',
              border: activeTab === 'sutra' ? '1px solid #0f4c81' : '1px solid #cbd5e1',
              boxShadow: activeTab === 'sutra' ? '0 2px 4px rgba(15,76,129,0.2)' : 'none',
            }}
          >
            <FileSpreadsheet size={16} />
            १. SuTRA Excel तथा CSV एक्सपोर्ट ({toNepaliNum(filteredProjects.length)} योजना)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('audit_dossier')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              fontSize: '0.825rem',
              fontWeight: 600,
              cursor: 'pointer',
              backgroundColor: activeTab === 'audit_dossier' ? '#0f4c81' : '#ffffff',
              color: activeTab === 'audit_dossier' ? '#ffffff' : '#334155',
              border: activeTab === 'audit_dossier' ? '1px solid #0f4c81' : '1px solid #cbd5e1',
              boxShadow: activeTab === 'audit_dossier' ? '0 2px 4px rgba(15,76,129,0.2)' : 'none',
            }}
          >
            <ShieldCheck size={16} />
            २. योजना अडिट ट्रेल विस्तृत प्रतिवेदन (Audit Trail Dossier)
          </button>
        </div>

        {/* Tab Content Area */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1.25rem',
            backgroundColor: '#f8fafc',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
          }}
        >
          {/* TAB 1: SUTRA EXPORT */}
          {activeTab === 'sutra' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Filters Box */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  padding: '1rem 1.25rem',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                }}
              >
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#0f2942', fontWeight: 700, fontSize: '0.85rem' }}>
                    <Filter size={16} color="#0f4c81" />
                    फिल्टर:
                  </div>

                  <div>
                    <select
                      value={selectedFy}
                      onChange={(e) => setSelectedFy(e.target.value)}
                      style={{
                        padding: '0.45rem 0.75rem',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        backgroundColor: '#f8fafc',
                      }}
                    >
                      <option value="all">सबै आर्थिक वर्ष</option>
                      <option value="२०८१/०८२">आ.व. २०८१/०८२ (चालु)</option>
                      <option value="२०८०/०८१">आ.व. २०८०/०८१</option>
                      <option value="२०७९/०८०">आ.व. २०७९/०८०</option>
                    </select>
                  </div>

                  <div>
                    <select
                      value={selectedWard}
                      onChange={(e) => setSelectedWard(e.target.value)}
                      style={{
                        padding: '0.45rem 0.75rem',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        backgroundColor: '#f8fafc',
                      }}
                    >
                      <option value="all">सबै वडाहरू (१ देखि ८)</option>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((w) => (
                        <option key={`ward-${w}`} value={String(w)}>
                          वडा नं. {toNepaliNum(w)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <select
                      value={selectedMarfat}
                      onChange={(e) => setSelectedMarfat(e.target.value)}
                      style={{
                        padding: '0.45rem 0.75rem',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        backgroundColor: '#f8fafc',
                      }}
                    >
                      <option value="all">सबै कार्यान्वयन विधि</option>
                      <option value="उपभोक्ता समिति">उपभोक्ता समिति</option>
                      <option value="ठेक्का / बोलपत्र">ठेक्का / बोलपत्र</option>
                      <option value="अमानत">अमानत</option>
                    </select>
                  </div>

                  <div>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      style={{
                        padding: '0.45rem 0.75rem',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        backgroundColor: '#f8fafc',
                      }}
                    >
                      <option value="all">सबै अवस्था (Status)</option>
                      <option value="सम्झौता भएको">सम्झौता भएको</option>
                      <option value="चालु / कार्यान्वयनमा">चालु / कार्यान्वयनमा</option>
                      <option value="सम्पन्न">सम्पन्न</option>
                      <option value="फरफारक भएको">फरफारक भएको</option>
                    </select>
                  </div>
                </div>

                {/* Export Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <button
                    type="button"
                    onClick={handleExportXlsx}
                    style={{
                      backgroundColor: '#047857',
                      color: '#ffffff',
                      padding: '0.55rem 1rem',
                      borderRadius: '8px',
                      fontWeight: 600,
                      fontSize: '0.825rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      border: 'none',
                      boxShadow: '0 2px 4px rgba(4,120,87,0.25)',
                    }}
                  >
                    <Download size={16} />
                    SuTRA Excel (.xlsx) एक्सपोर्ट
                  </button>

                  <button
                    type="button"
                    onClick={handleExportCsv}
                    style={{
                      backgroundColor: '#0f4c81',
                      color: '#ffffff',
                      padding: '0.55rem 1rem',
                      borderRadius: '8px',
                      fontWeight: 600,
                      fontSize: '0.825rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      border: 'none',
                      boxShadow: '0 2px 4px rgba(15,76,129,0.25)',
                    }}
                  >
                    <Download size={16} />
                    SuTRA CSV (.csv) एक्सपोर्ट
                  </button>
                </div>
              </div>

              {/* Metrics Ribbon */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '0.85rem',
                }}
              >
                <div style={{ backgroundColor: '#ffffff', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.725rem', color: '#64748b', fontWeight: 600 }}>कुल योजना संख्या</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f2942', marginTop: '2px' }}>
                    {toNepaliNum(metrics.count)} वटा
                  </div>
                </div>

                <div style={{ backgroundColor: '#ffffff', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.725rem', color: '#64748b', fontWeight: 600 }}>कुल विनियोजित बजेट</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e3a8a', marginTop: '2px' }}>
                    रु. {toNepaliNum(metrics.totalBudget.toLocaleString('en-IN'))}
                  </div>
                </div>

                <div style={{ backgroundColor: '#ffffff', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.725rem', color: '#64748b', fontWeight: 600 }}>कुल सम्झौता रकम</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f4c81', marginTop: '2px' }}>
                    रु. {toNepaliNum(metrics.totalAgreement.toLocaleString('en-IN'))}
                  </div>
                </div>

                <div style={{ backgroundColor: '#ffffff', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.725rem', color: '#64748b', fontWeight: 600 }}>हालसम्म निकासा/खर्च</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#047857', marginTop: '2px' }}>
                    रु. {toNepaliNum(metrics.totalPaid.toLocaleString('en-IN'))}
                  </div>
                </div>

                <div style={{ backgroundColor: '#ffffff', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.725rem', color: '#64748b', fontWeight: 600 }}>बाँकी वित्तीय दायित्व</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#dc2626', marginTop: '2px' }}>
                    रु. {toNepaliNum(metrics.totalRemaining.toLocaleString('en-IN'))}
                  </div>
                </div>
              </div>

              {/* Data Table Preview */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    padding: '0.75rem 1rem',
                    borderBottom: '1px solid #e2e8f0',
                    backgroundColor: '#f8fafc',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f2942' }}>
                    SuTRA एक्सपोर्ट स्तम्भ पूर्वावलोकन (Data Table Preview)
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    देखाउँदै: {toNepaliNum(filteredProjects.length)} योजनाहरू
                  </span>
                </div>

                <div style={{ overflowX: 'auto', maxHeight: '380px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#0f4c81', color: '#ffffff', position: 'sticky', top: 0, zIndex: 1 }}>
                        <th style={{ padding: '0.6rem 0.75rem', whiteSpace: 'nowrap' }}>क्र.सं.</th>
                        <th style={{ padding: '0.6rem 0.75rem', whiteSpace: 'nowrap' }}>संकेत/कोड</th>
                        <th style={{ padding: '0.6rem 0.75rem', minWidth: '220px' }}>आयोजनाको नाम</th>
                        <th style={{ padding: '0.6rem 0.75rem', whiteSpace: 'nowrap' }}>वडा</th>
                        <th style={{ padding: '0.6rem 0.75rem', whiteSpace: 'nowrap' }}>उपशीर्षक</th>
                        <th style={{ padding: '0.6rem 0.75rem', whiteSpace: 'nowrap' }}>बजेट स्रोत</th>
                        <th style={{ padding: '0.6rem 0.75rem', whiteSpace: 'nowrap', textAlign: 'right' }}>विनियोजित बजेट</th>
                        <th style={{ padding: '0.6rem 0.75rem', whiteSpace: 'nowrap', textAlign: 'right' }}>सम्झौता रकम</th>
                        <th style={{ padding: '0.6rem 0.75rem', whiteSpace: 'nowrap', textAlign: 'right' }}>खर्च रकम</th>
                        <th style={{ padding: '0.6rem 0.75rem', whiteSpace: 'nowrap', textAlign: 'right' }}>बाँकी दायित्व</th>
                        <th style={{ padding: '0.6rem 0.75rem', whiteSpace: 'nowrap', textAlign: 'center' }}>प्रगति %</th>
                        <th style={{ padding: '0.6rem 0.75rem', whiteSpace: 'nowrap' }}>अवस्था</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProjects.length === 0 ? (
                        <tr>
                          <td colSpan={12} style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                            फिल्टर अनुसार कुनै योजना फेला परेन।
                          </td>
                        </tr>
                      ) : (
                        filteredProjects.map((p, idx) => {
                          const budget = Number(p.budget || p.allocatedBudget || 0);
                          const totalAgreement = Number(p.totalAgreementAmount || p.budget || 0);
                          const paid = Number(p.paidAmount || 0);
                          const remaining = Math.max(0, totalAgreement - paid);
                          const progress = Number(p.progressPercentage ?? p.physicalProgressPercent ?? 0);

                          return (
                            <tr
                              key={p.id || idx}
                              style={{
                                borderBottom: '1px solid #f1f5f9',
                                backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc',
                              }}
                            >
                              <td style={{ padding: '0.55rem 0.75rem', fontWeight: 600 }}>{toNepaliNum(idx + 1)}</td>
                              <td style={{ padding: '0.55rem 0.75rem', fontFamily: 'monospace' }}>
                                {p.projectCode || `P-${p.wardNumber}-${idx + 1}`}
                              </td>
                              <td style={{ padding: '0.55rem 0.75rem', fontWeight: 600, color: '#0f2942' }}>
                                {p.name}
                              </td>
                              <td style={{ padding: '0.55rem 0.75rem', whiteSpace: 'nowrap' }}>
                                {p.wardNumber ? `वडा ${toNepaliNum(p.wardNumber)}` : 'पालिका'}
                              </td>
                              <td style={{ padding: '0.55rem 0.75rem', whiteSpace: 'nowrap', fontFamily: 'monospace' }}>
                                {p.budgetSubHead || '३११५१'}
                              </td>
                              <td style={{ padding: '0.55rem 0.75rem', whiteSpace: 'nowrap', color: '#475569' }}>
                                {p.budgetSource || 'संघीय समानीकरण'}
                              </td>
                              <td style={{ padding: '0.55rem 0.75rem', textAlign: 'right', fontWeight: 700 }}>
                                रु. {toNepaliNum(budget.toLocaleString('en-IN'))}
                              </td>
                              <td style={{ padding: '0.55rem 0.75rem', textAlign: 'right', fontWeight: 700, color: '#0f4c81' }}>
                                रु. {toNepaliNum(totalAgreement.toLocaleString('en-IN'))}
                              </td>
                              <td style={{ padding: '0.55rem 0.75rem', textAlign: 'right', fontWeight: 700, color: '#047857' }}>
                                रु. {toNepaliNum(paid.toLocaleString('en-IN'))}
                              </td>
                              <td style={{ padding: '0.55rem 0.75rem', textAlign: 'right', fontWeight: 700, color: '#dc2626' }}>
                                रु. {toNepaliNum(remaining.toLocaleString('en-IN'))}
                              </td>
                              <td style={{ padding: '0.55rem 0.75rem', textAlign: 'center', fontWeight: 700 }}>
                                <span
                                  style={{
                                    backgroundColor: progress >= 80 ? '#dcfce7' : progress >= 40 ? '#eff6ff' : '#fef9c3',
                                    color: progress >= 80 ? '#15803d' : progress >= 40 ? '#1d4ed8' : '#a16207',
                                    padding: '0.15rem 0.45rem',
                                    borderRadius: '4px',
                                  }}
                                >
                                  {toNepaliNum(progress)}%
                                </span>
                              </td>
                              <td style={{ padding: '0.55rem 0.75rem', whiteSpace: 'nowrap' }}>
                                <span
                                  style={{
                                    padding: '0.2rem 0.5rem',
                                    borderRadius: '999px',
                                    fontSize: '0.7rem',
                                    fontWeight: 700,
                                    backgroundColor: '#e2e8f0',
                                    color: '#334155',
                                  }}
                                >
                                  {p.agreementStatus || p.status || 'सम्झौता भएको'}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AUDIT TRAIL DOSSIER */}
          {activeTab === 'audit_dossier' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Project Picker for Dossier */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  padding: '0.85rem 1.25rem',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '280px' }}>
                  <label style={{ fontSize: '0.825rem', fontWeight: 700, color: '#0f2942', whiteSpace: 'nowrap' }}>
                    अडिट प्रतिवेदन हेर्न योजना छान्नुहोस्:
                  </label>
                  <select
                    value={activeDossierProject?.id || ''}
                    onChange={(e) => setDossierProjectId(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '0.45rem 0.75rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.825rem',
                      fontWeight: 600,
                      backgroundColor: '#f8fafc',
                    }}
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (वडा नं. {toNepaliNum(p.wardNumber)} | रु. {toNepaliNum(Number(p.budget || 0).toLocaleString('en-IN'))})
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handlePrintDossier}
                  style={{
                    backgroundColor: '#0f4c81',
                    color: '#ffffff',
                    padding: '0.55rem 1.25rem',
                    borderRadius: '8px',
                    fontWeight: 600,
                    fontSize: '0.825rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    border: 'none',
                    boxShadow: '0 2px 4px rgba(15,76,129,0.25)',
                  }}
                >
                  <Printer size={16} />
                  यो अडिट प्रतिवेदन प्रिन्ट गर्नुहोस्
                </button>
              </div>

              {/* Printable Dossier Sheet */}
              {activeDossierProject && (
                <div
                  id="print-audit-dossier"
                  style={{
                    backgroundColor: '#ffffff',
                    padding: '2.5rem',
                    borderRadius: '12px',
                    border: '1px solid #cbd5e1',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.5rem',
                    color: '#0f172a',
                    fontFamily: "'Noto Sans Devanagari', sans-serif",
                  }}
                >
                  {/* Letterhead */}
                  <div style={{ textAlign: 'center', borderBottom: '2px double #0f4c81', paddingBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                      <img
                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Emblem_of_Nepal.svg/120px-Emblem_of_Nepal.svg.png"
                        alt="Nepal Emblem"
                        style={{ height: '70px', width: 'auto' }}
                        onError={(e: any) => {
                          e.target.style.display = 'none';
                        }}
                      />
                      <div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#dc2626' }}>
                          पाँचपोखरी थाङपाल गाउँपालिका
                        </div>
                        <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f4c81', margin: '2px 0' }}>
                          गाउँ कार्यपालिकाको कार्यालय
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#334155', fontWeight: 600 }}>
                          थाङपालधाप, सिन्धुपाल्चोक, बागमती प्रदेश
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        display: 'inline-block',
                        backgroundColor: '#f1f5f9',
                        padding: '0.35rem 1.25rem',
                        borderRadius: '999px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.95rem',
                        fontWeight: 800,
                        color: '#0f2942',
                        marginTop: '0.5rem',
                      }}
                    >
                      योजना सम्झौता, कार्यान्वयन तथा भुक्तानी अडिट ट्रेल प्रतिवेदन (Project Audit Dossier)
                    </div>
                  </div>

                  {/* Section A: Project Identification */}
                  <div>
                    <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', fontWeight: 800, color: '#0f4c81', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.3rem' }}>
                      क. आयोजनाको आधारभूत पहिचान तथा बजेट विवरण (Project Identification)
                    </h4>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                      <tbody>
                        <tr>
                          <td style={{ padding: '0.35rem 0.5rem', fontWeight: 700, width: '25%', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>आयोजनाको नाम:</td>
                          <td style={{ padding: '0.35rem 0.5rem', fontWeight: 700, width: '45%', border: '1px solid #e2e8f0', color: '#0f4c81' }}>{activeDossierProject.name}</td>
                          <td style={{ padding: '0.35rem 0.5rem', fontWeight: 700, width: '15%', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>आयोजना संकेत:</td>
                          <td style={{ padding: '0.35rem 0.5rem', width: '15%', border: '1px solid #e2e8f0', fontFamily: 'monospace' }}>{activeDossierProject.projectCode || '-'}</td>
                        </tr>
                        <tr>
                          <td style={{ padding: '0.35rem 0.5rem', fontWeight: 700, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>कार्यक्षेत्र / वडा नं.:</td>
                          <td style={{ padding: '0.35rem 0.5rem', border: '1px solid #e2e8f0' }}>
                            {activeDossierProject.wardNumber ? `वडा नं. ${toNepaliNum(activeDossierProject.wardNumber)}, ${activeDossierProject.location || 'पाँचपोखरी थाङपाल'}` : 'गाउँपालिकास्तरीय'}
                          </td>
                          <td style={{ padding: '0.35rem 0.5rem', fontWeight: 700, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>आर्थिक वर्ष:</td>
                          <td style={{ padding: '0.35rem 0.5rem', border: '1px solid #e2e8f0' }}>{activeDossierProject.fiscalYear || '२०८१/०८२'}</td>
                        </tr>
                        <tr>
                          <td style={{ padding: '0.35rem 0.5rem', fontWeight: 700, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>बजेट स्रोत तथा शीर्षक:</td>
                          <td style={{ padding: '0.35rem 0.5rem', border: '1px solid #e2e8f0' }}>
                            {activeDossierProject.budgetSource || 'संघीय समानीकरण'} (उपशीर्षक: {activeDossierProject.budgetSubHead || '३११५१'})
                          </td>
                          <td style={{ padding: '0.35rem 0.5rem', fontWeight: 700, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>कार्यान्वयन विधि:</td>
                          <td style={{ padding: '0.35rem 0.5rem', border: '1px solid #e2e8f0' }}>{activeDossierProject.marfat || 'उपभोक्ता समिति'}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Section B: Financial Breakdown */}
                  <div>
                    <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', fontWeight: 800, color: '#0f4c81', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.3rem' }}>
                      ख. वित्तीय सम्झौता, किस्ता निकासा तथा कट्टी अडिट (Financial & Installment Audit)
                    </h4>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'center' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f1f5f9', fontWeight: 700 }}>
                          <th style={{ padding: '0.45rem', border: '1px solid #cbd5e1' }}>कार्यालय लागत (रु.)</th>
                          <th style={{ padding: '0.45rem', border: '1px solid #cbd5e1' }}>उपभोक्ता जनसहभागिता (रु.)</th>
                          <th style={{ padding: '0.45rem', border: '1px solid #cbd5e1' }}>कुल सम्झौता रकम (रु.)</th>
                          <th style={{ padding: '0.45rem', border: '1px solid #cbd5e1' }}>भुक्तानी निकासा (रु.)</th>
                          <th style={{ padding: '0.45rem', border: '1px solid #cbd5e1' }}>कन्टेन्जेन्सी ३% (रु.)</th>
                          <th style={{ padding: '0.45rem', border: '1px solid #cbd5e1' }}>बाँकी दायित्व (रु.)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td style={{ padding: '0.45rem', border: '1px solid #e2e8f0', fontWeight: 700 }}>
                            रु. {toNepaliNum(Number(activeDossierProject.officeCost || activeDossierProject.budget || 0).toLocaleString('en-IN'))}
                          </td>
                          <td style={{ padding: '0.45rem', border: '1px solid #e2e8f0', fontWeight: 700 }}>
                            रु. {toNepaliNum(Number(activeDossierProject.committeeCost || 0).toLocaleString('en-IN'))}
                          </td>
                          <td style={{ padding: '0.45rem', border: '1px solid #e2e8f0', fontWeight: 800, color: '#0f4c81' }}>
                            रु. {toNepaliNum(Number(activeDossierProject.totalAgreementAmount || activeDossierProject.budget || 0).toLocaleString('en-IN'))}
                          </td>
                          <td style={{ padding: '0.45rem', border: '1px solid #e2e8f0', fontWeight: 800, color: '#047857' }}>
                            रु. {toNepaliNum(Number(activeDossierProject.paidAmount || 0).toLocaleString('en-IN'))}
                          </td>
                          <td style={{ padding: '0.45rem', border: '1px solid #e2e8f0', fontWeight: 700 }}>
                            रु. {toNepaliNum(Number(activeDossierProject.contingencyAmount || 0).toLocaleString('en-IN'))}
                          </td>
                          <td style={{ padding: '0.45rem', border: '1px solid #e2e8f0', fontWeight: 800, color: '#dc2626' }}>
                            रु. {toNepaliNum(Math.max(0, Number(activeDossierProject.totalAgreementAmount || activeDossierProject.budget || 0) - Number(activeDossierProject.paidAmount || 0)).toLocaleString('en-IN'))}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Section C: Committee & Stakeholders */}
                  <div>
                    <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', fontWeight: 800, color: '#0f4c81', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.3rem' }}>
                      ग. उपभोक्ता समिति तथा बैंक खाता सञ्चालन (Committee & Bank Account)
                    </h4>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                      <tbody>
                        <tr>
                          <td style={{ padding: '0.35rem 0.5rem', fontWeight: 700, width: '25%', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>उपभोक्ता समितिको नाम:</td>
                          <td style={{ padding: '0.35rem 0.5rem', fontWeight: 700, width: '45%', border: '1px solid #e2e8f0' }}>{activeDossierProject.committeeName || '-'}</td>
                          <td style={{ padding: '0.35rem 0.5rem', fontWeight: 700, width: '15%', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>गठन मिति:</td>
                          <td style={{ padding: '0.35rem 0.5rem', width: '15%', border: '1px solid #e2e8f0' }}>{activeDossierProject.committeeFormationDateBs || '-'}</td>
                        </tr>
                        <tr>
                          <td style={{ padding: '0.35rem 0.5rem', fontWeight: 700, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>समिति अध्यक्ष / सचिव / कोषाध्यक्ष:</td>
                          <td style={{ padding: '0.35rem 0.5rem', border: '1px solid #e2e8f0' }}>
                            अध्यक्ष: {activeDossierProject.committeeChair || '-'} | सचिव: {activeDossierProject.committeeSecretary || '-'} | कोषाध्यक्ष: {activeDossierProject.committeeTreasurer || '-'}
                          </td>
                          <td style={{ padding: '0.35rem 0.5rem', fontWeight: 700, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>सम्पर्क मोबाइल:</td>
                          <td style={{ padding: '0.35rem 0.5rem', border: '1px solid #e2e8f0' }}>{activeDossierProject.committeePhone || '-'}</td>
                        </tr>
                        <tr>
                          <td style={{ padding: '0.35rem 0.5rem', fontWeight: 700, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>बैंक तथा खाता नम्बर:</td>
                          <td style={{ padding: '0.35rem 0.5rem', border: '1px solid #e2e8f0' }}>
                            {activeDossierProject.committeeBankDetails?.bankName || 'राष्ट्रिय वाणिज्य बैंक थाङपालधाप'} (खाता नं. {activeDossierProject.committeeBankDetails?.accountNumber || 'सञ्चालनमा'})
                          </td>
                          <td style={{ padding: '0.35rem 0.5rem', fontWeight: 700, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>जिम्मेवार प्राविधिक:</td>
                          <td style={{ padding: '0.35rem 0.5rem', border: '1px solid #e2e8f0' }}>{activeDossierProject.responsibleEngineer || 'प्राविधिक शाखा'}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Section D: Timeline & Time Extensions */}
                  <div>
                    <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', fontWeight: 800, color: '#0f4c81', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.3rem' }}>
                      घ. म्याद, कार्यतालिका तथा म्याद थप अनुमोदन इतिहास (Timeline & Time Extensions)
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                      <div style={{ padding: '0.4rem', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                        <strong>सम्झौता मिति:</strong> {activeDossierProject.agreementDateBs || '-'}
                      </div>
                      <div style={{ padding: '0.4rem', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                        <strong>सुरु हुने मिति:</strong> {activeDossierProject.startDateBs || '-'}
                      </div>
                      <div style={{ padding: '0.4rem', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                        <strong>अन्तिम सम्पन्न म्याद:</strong> {activeDossierProject.completionDateBs || '-'}
                      </div>
                    </div>

                    {Array.isArray(activeDossierProject.timeExtensions) && activeDossierProject.timeExtensions.length > 0 ? (
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem', textAlign: 'left' }}>
                        <thead>
                          <tr style={{ backgroundColor: '#f1f5f9' }}>
                            <th style={{ padding: '0.35rem', border: '1px solid #cbd5e1' }}>पटक</th>
                            <th style={{ padding: '0.35rem', border: '1px solid #cbd5e1' }}>निर्णय मिति</th>
                            <th style={{ padding: '0.35rem', border: '1px solid #cbd5e1' }}>थप भएको म्याद</th>
                            <th style={{ padding: '0.35rem', border: '1px solid #cbd5e1' }}>थप दिन</th>
                            <th style={{ padding: '0.35rem', border: '1px solid #cbd5e1' }}>म्याद थपको प्रमुख कारण</th>
                          </tr>
                        </thead>
                        <tbody>
                          {activeDossierProject.timeExtensions.map((ext, i) => (
                            <tr key={ext.id || i}>
                              <td style={{ padding: '0.35rem', border: '1px solid #e2e8f0' }}>{toNepaliNum(ext.extensionNo || i + 1)}</td>
                              <td style={{ padding: '0.35rem', border: '1px solid #e2e8f0' }}>{toNepaliNum(ext.decisionDateBs || '-')}</td>
                              <td style={{ padding: '0.35rem', border: '1px solid #e2e8f0', fontWeight: 700, color: '#0f4c81' }}>{toNepaliNum(ext.extendedCompletionDateBs)}</td>
                              <td style={{ padding: '0.35rem', border: '1px solid #e2e8f0' }}>{toNepaliNum(ext.extendedDays)} दिन</td>
                              <td style={{ padding: '0.35rem', border: '1px solid #e2e8f0' }}>{ext.reasonCategory || ext.reasonDetails || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div style={{ fontSize: '0.775rem', color: '#64748b', fontStyle: 'italic' }}>
                        यस आयोजनामा हालसम्म कुनै म्याद थप गरिएको छैन (तोकिएकै म्यादभित्र कार्य प्रगतिमा रहेको)।
                      </div>
                    )}
                  </div>

                  {/* Section E: Monitoring & Social Audit */}
                  <div>
                    <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', fontWeight: 800, color: '#0f4c81', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.3rem' }}>
                      ङ. स्थलगत अनुगमन तथा सामाजिक परीक्षण (Monitoring & Social Audit Records)
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', fontSize: '0.8rem' }}>
                      <div style={{ padding: '0.65rem', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: '#f8fafc' }}>
                        <div style={{ fontWeight: 700, color: '#0f4c81', marginBottom: '0.3rem' }}>वडा तथा प्राविधिक अनुगमन:</div>
                        {Array.isArray(activeDossierProject.monitoringRecords) && activeDossierProject.monitoringRecords.length > 0 ? (
                          <div>
                            {activeDossierProject.monitoringRecords.map((m, i) => (
                              <div key={i} style={{ borderBottom: '1px dashed #cbd5e1', paddingBottom: '0.25rem', marginBottom: '0.25rem' }}>
                                <strong>मिति:</strong> {toNepaliNum(m.date)} | <strong>अनुगमनकर्ता:</strong> {m.monitorName} ({m.designation}) <br />
                                <strong>भौतिक प्रगति:</strong> {toNepaliNum(m.progressObserved || 0)}% | <strong>गुणस्तर:</strong> Grade {m.rating || 'A'} <br />
                                <strong>सिफारिस:</strong> {m.recommendation || 'सन्तोषजनक'}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span style={{ color: '#64748b' }}>स्थलगत प्राविधिक अनुगमन प्रतिवेदन संलग्न।</span>
                        )}
                      </div>

                      <div style={{ padding: '0.65rem', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: '#f8fafc' }}>
                        <div style={{ fontWeight: 700, color: '#0f4c81', marginBottom: '0.3rem' }}>सार्वजनिक सुनुवाइ तथा सामाजिक परीक्षण:</div>
                        {activeDossierProject.socialAudit?.date ? (
                          <div>
                            <strong>सम्पन्न मिति:</strong> {toNepaliNum(activeDossierProject.socialAudit.date)} <br />
                            <strong>स्थान:</strong> {activeDossierProject.socialAudit.venue || '-'} <br />
                            <strong>सहभागी संख्या:</strong> कुल {toNepaliNum(activeDossierProject.socialAudit.participantsCount || 0)} जना (महिला: {toNepaliNum(activeDossierProject.socialAudit.femaleCount || 0)}, सीमान्तकृत: {toNepaliNum(activeDossierProject.socialAudit.marginalizedCount || 0)}) <br />
                            <strong>जनसन्तुष्टि स्थिति:</strong> {activeDossierProject.socialAudit.publicSatisfaction || 'सन्तोषजनक'}
                          </div>
                        ) : (
                          <span style={{ color: '#64748b' }}>अन्तिम किस्ता भुक्तानी पूर्व सामाजिक परीक्षण सम्पन्न गर्नुपर्ने।</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Section F: Audit Checklist */}
                  <div>
                    <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', fontWeight: 800, color: '#0f4c81', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.3rem' }}>
                      च. लेखा परीक्षण जाँच सूची (Auditor Compliance Verification Checklist)
                    </h4>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f1f5f9' }}>
                          <th style={{ padding: '0.35rem 0.5rem', border: '1px solid #cbd5e1', width: '8%' }}>क्र.सं.</th>
                          <th style={{ padding: '0.35rem 0.5rem', border: '1px solid #cbd5e1', width: '55%' }}>परीक्षण सूचक (Audit Compliance Parameter)</th>
                          <th style={{ padding: '0.35rem 0.5rem', border: '1px solid #cbd5e1', width: '20%' }}>अवस्था (Status)</th>
                          <th style={{ padding: '0.35rem 0.5rem', border: '1px solid #cbd5e1', width: '17%' }}>कैफियत</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { sn: 1, title: 'प्राविधिक लागत अनुमान तथा योजना सम्झौता पत्र संलग्न रहेको', ok: true },
                          { sn: 2, title: 'उपभोक्ता समिति गठन आमभेला माइन्युट र बैंक खाता सिफारिस प्रमाणित भएको', ok: true },
                          { sn: 3, title: 'नापी किताब (Measurement Book) र प्राविधिक मूल्याङ्कन बिल संलग्न रहेको', ok: true },
                          { sn: 4, title: 'कन्टेन्जेन्सी कट्टी (३%) र मर्मत सम्भार कोष (३%) वैधानिक रूपमा कट्टा गरिएको', ok: true },
                          { sn: 5, title: 'स्थलगत अनुगमन प्रतिवेदन र गुणस्तर ग्रेडिङ प्राप्त भएको', ok: true },
                          { sn: 6, title: 'सार्वजनिक सूचना पाटी (Citizen Hoarding Board) निर्माण स्थलमा स्थापना भएको', ok: true },
                          { sn: 7, title: 'सार्वजनिक सुनुवाइ तथा सामाजिक परीक्षण माइन्युट संलग्न रहेको', ok: !!activeDossierProject.socialAudit?.date },
                        ].map((chk) => (
                          <tr key={chk.sn}>
                            <td style={{ padding: '0.35rem 0.5rem', border: '1px solid #e2e8f0', textAlign: 'center' }}>{toNepaliNum(chk.sn)}</td>
                            <td style={{ padding: '0.35rem 0.5rem', border: '1px solid #e2e8f0' }}>{chk.title}</td>
                            <td style={{ padding: '0.35rem 0.5rem', border: '1px solid #e2e8f0', color: chk.ok ? '#15803d' : '#a16207', fontWeight: 700 }}>
                              {chk.ok ? '✓ नियमसंगत संलग्न' : '○ प्रक्रियामा रहेको'}
                            </td>
                            <td style={{ padding: '0.35rem 0.5rem', border: '1px solid #e2e8f0', color: '#64748b' }}>प्रमाणित</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Signatures */}
                  <div style={{ marginTop: '2.5rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', textAlign: 'center' }}>
                    <div>
                      <div style={{ borderBottom: '1px solid #94a3b8', height: '40px', marginBottom: '0.35rem' }} />
                      <div style={{ fontWeight: 700, fontSize: '0.825rem' }}>सब-इन्जिनियर / इन्जिनियर</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>प्राविधिक शाखा</div>
                    </div>

                    <div>
                      <div style={{ borderBottom: '1px solid #94a3b8', height: '40px', marginBottom: '0.35rem' }} />
                      <div style={{ fontWeight: 700, fontSize: '0.825rem' }}>लेखा अधिकृत / आ.प्र. अधिकृत</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>आर्थिक प्रशासन शाखा</div>
                    </div>

                    <div>
                      <div style={{ borderBottom: '1px solid #94a3b8', height: '40px', marginBottom: '0.35rem' }} />
                      <div style={{ fontWeight: 700, fontSize: '0.825rem' }}>प्रमुख प्रशासकीय अधिकृत</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>पाँचपोखरी थाङपाल गाउँपालिका</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
