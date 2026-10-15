import React, { useRef } from 'react';
import { X, Printer, Download, RefreshCw, CheckCircle2, Clock, FileCheck2, Building2, Calendar, ShieldCheck, Activity, Users, Baby } from 'lucide-react';
import type { HealthDhis2Report } from '../../../types/health';

interface Dhis2ReportDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: HealthDhis2Report | null;
  onSync?: (id: string) => void;
  isSyncing?: boolean;
}

export const Dhis2ReportDetailModal: React.FC<Dhis2ReportDetailModalProps> = ({
  isOpen,
  onClose,
  report,
  onSync,
  isSyncing,
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !report) return null;

  const isSynced = report.syncStatus === 'synced';

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(report, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `DHIS2_HMIS_${report.healthFacilityName}_${report.monthNepali}_${report.fiscalYear}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1100,
        padding: '1rem',
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          maxWidth: '920px',
          width: '100%',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
          border: '1.5px solid #cbd5e1',
          overflow: 'hidden',
        }}
      >
        {/* MODAL HEADER */}
        <div
          style={{
            padding: '1.2rem 1.5rem',
            background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTopLeftRadius: '15px',
            borderTopRightRadius: '15px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '10px', borderRadius: '10px' }}>
              <FileCheck2 size={24} color="#ffffff" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>
                नेपाल सरकार DHIS2 / HMIS मासिक स्वास्थ्य प्रतिवेदन विवरण
              </h2>
              <p style={{ fontSize: '0.78rem', color: '#ddd6fe', margin: '2px 0 0 0' }}>
                स्वास्थ्य तथा जनसंख्या मन्त्रालय (MoHP) • आधिकारिक मासिक स्वास्थ्य सेवा प्रवाह फाराम
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={handlePrint}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#ffffff',
                color: '#6d28d9',
                padding: '6px 14px',
                borderRadius: '8px',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
                boxShadow: '0 2px 5px rgba(0,0,0,0.15)',
              }}
            >
              <Printer size={15} />
              <span>प्रिन्ट फाराम</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadJson}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: '#ffffff',
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.3)',
                fontWeight: 600,
                fontSize: '0.8rem',
                cursor: 'pointer',
              }}
            >
              <Download size={15} />
              <span>JSON</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: '#ffffff',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '8px',
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* MODAL BODY (PRINTABLE) */}
        <div
          ref={printRef}
          style={{
            padding: '1.5rem',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            backgroundColor: '#ffffff',
          }}
        >
          {/* OFFICIAL HEADER BANNER */}
          <div
            style={{
              textAlign: 'center',
              borderBottom: '2px double #cbd5e1',
              paddingBottom: '1rem',
            }}
          >
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#dc2626' }}>नेपाल सरकार</div>
            <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0f172a' }}>स्वास्थ्य तथा जनसंख्या मन्त्रालय</div>
            <div style={{ fontSize: '0.82rem', color: '#475569' }}>स्वास्थ्य सेवा विभाग • व्यवस्थापन महाशाखा (HMIS Section)</div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1e293b', marginTop: '6px' }}>
              मासिक स्वास्थ्य संस्था प्रतिवेदन (HMIS Form No. 9.3)
            </div>
          </div>

          {/* FACILITY & REPORT METADATA */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '10px',
              backgroundColor: '#f8fafc',
              padding: '12px 14px',
              borderRadius: '10px',
              border: '1.5px solid #e2e8f0',
            }}
          >
            <div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>स्वास्थ्य संस्थाको नाम:</div>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>{report.healthFacilityName}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>वडा नं. / पालिका:</div>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>
                वडा नं. {report.wardNumber}, पाँचपोखरी थाङपाल
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>प्रतिवेदन अवधि (Period):</div>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#7c3aed' }}>
                {report.monthNepali} महिना (आ.व. {report.fiscalYear})
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>DHIS2 Org Unit कोड:</div>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a', fontFamily: 'monospace' }}>
                {report.dhis2OrgUnitId || 'N/A'}
              </div>
            </div>
          </div>

          {/* SECTION 1: OPD SERVICE STATISTICS */}
          <div style={{ border: '1.5px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
            <div
              style={{
                backgroundColor: '#fee2e2',
                color: '#991b1b',
                padding: '8px 14px',
                fontWeight: 800,
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Users size={16} />
              <span>१. बहिरङ्ग सेवा तथ्याङ्क (Outpatient Department - OPD Visits)</span>
            </div>
            <div style={{ padding: '12px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
              <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: '#fff5f5', border: '1px solid #fecdd3', textAlign: 'center' }}>
                <div style={{ fontSize: '0.72rem', color: '#881337', fontWeight: 600 }}>कुल ओपीडी बिरामी</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#be123c' }}>{report.totalOpdVisits || 0}</div>
                <div style={{ fontSize: '0.7rem', color: '#475569' }}>जना</div>
              </div>
              <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', textAlign: 'center' }}>
                <div style={{ fontSize: '0.72rem', color: '#0369a1', fontWeight: 600 }}>पुरुष बिरामी (Male)</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0284c7' }}>{report.maleOpdVisits || 0}</div>
                <div style={{ fontSize: '0.7rem', color: '#475569' }}>जना</div>
              </div>
              <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: '#fdf2f8', border: '1px solid #fbcfe8', textAlign: 'center' }}>
                <div style={{ fontSize: '0.72rem', color: '#9d174d', fontWeight: 600 }}>महिला बिरामी (Female)</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#db2777' }}>{report.femaleOpdVisits || 0}</div>
                <div style={{ fontSize: '0.7rem', color: '#475569' }}>जना</div>
              </div>
              <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <div style={{ fontSize: '0.72rem', color: '#475569', fontWeight: 600 }}>५ वर्ष मुनिका बालबालिका</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>{report.under5OpdVisits || 0}</div>
                <div style={{ fontSize: '0.7rem', color: '#475569' }}>जना</div>
              </div>
              <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <div style={{ fontSize: '0.72rem', color: '#475569', fontWeight: 600 }}>६० वर्ष माथिका जेष्ठ नागरिक</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>{report.elderlyOpdVisits || 0}</div>
                <div style={{ fontSize: '0.7rem', color: '#475569' }}>जना</div>
              </div>
            </div>
          </div>

          {/* SECTION 2: MATERNAL & CHILD HEALTH */}
          <div style={{ border: '1.5px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
            <div
              style={{
                backgroundColor: '#dcfce7',
                color: '#166534',
                padding: '8px 14px',
                fontWeight: 800,
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Baby size={16} />
              <span>२. सुरक्षित मातृत्व, खोप तथा बाल स्वास्थ्य सेवा (Maternal & Child Health)</span>
            </div>
            <div style={{ padding: '12px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
              <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                <div style={{ fontSize: '0.74rem', color: '#15803d', fontWeight: 600 }}>संस्थागत सुत्केरी (Deliveries)</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#166534', marginTop: '2px' }}>
                  {report.institutionalDeliveries || 0} <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>जना</span>
                </div>
              </div>
              <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                <div style={{ fontSize: '0.74rem', color: '#15803d', fontWeight: 600 }}>पूर्ण खोप पाएका बालबालिका</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#166534', marginTop: '2px' }}>
                  {report.fullyImmunizedChildren || 0} <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>जना</span>
                </div>
              </div>
              <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                <div style={{ fontSize: '0.74rem', color: '#15803d', fontWeight: 600 }}>वृद्धि अनुगमन गरिएका बालबालिका</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#166534', marginTop: '2px' }}>
                  {report.growthMonitoredChildren || 0} <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>जना</span>
                </div>
              </div>
              <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                <div style={{ fontSize: '0.74rem', color: '#15803d', fontWeight: 600 }}>४ पटक गर्भजाँच (ANC 4 Visits)</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#166534', marginTop: '2px' }}>
                  {report.anc4Visits || 0} <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>जना</span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: DISEASE SURVEILLANCE */}
          <div style={{ border: '1.5px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
            <div
              style={{
                backgroundColor: '#fef3c7',
                color: '#92400e',
                padding: '8px 14px',
                fontWeight: 800,
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Activity size={16} />
              <span>३. प्रमुख रोग निगरानी तथा प्रकोप प्रतिवेदन (Disease Surveillance & Epidemics)</span>
            </div>
            <div style={{ padding: '12px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
              <div style={{ padding: '8px 10px', borderRadius: '6px', backgroundColor: '#fffdf0', border: '1px solid #fde68a' }}>
                <div style={{ fontSize: '0.72rem', color: '#78350f', fontWeight: 600 }}>झाडापखाला (Diarrhea):</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#b45309' }}>{report.diarrheaCases || 0} केस</div>
              </div>
              <div style={{ padding: '8px 10px', borderRadius: '6px', backgroundColor: '#fffdf0', border: '1px solid #fde68a' }}>
                <div style={{ fontSize: '0.72rem', color: '#78350f', fontWeight: 600 }}>निमोनिया (ARI/Pneumonia):</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#b45309' }}>{report.ariPneumoniaCases || 0} केस</div>
              </div>
              <div style={{ padding: '8px 10px', borderRadius: '6px', backgroundColor: '#fffdf0', border: '1px solid #fde68a' }}>
                <div style={{ fontSize: '0.72rem', color: '#78350f', fontWeight: 600 }}>डेंगी / मलेरिया (Vector-Borne):</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#b45309' }}>{report.dengueCases || 0} केस</div>
              </div>
              <div style={{ padding: '8px 10px', borderRadius: '6px', backgroundColor: '#fffdf0', border: '1px solid #fde68a' }}>
                <div style={{ fontSize: '0.72rem', color: '#78350f', fontWeight: 600 }}>टाइफाइड (Typhoid Fever):</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#b45309' }}>{report.typhoidCases || 0} केस</div>
              </div>
            </div>
          </div>

          {/* SECTION 4: SUBMITTER & SYNC STATUS */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              backgroundColor: isSynced ? '#f0fdf4' : '#fffbeb',
              borderRadius: '10px',
              border: `1.5px solid ${isSynced ? '#86efac' : '#fde68a'}`,
              flexWrap: 'wrap',
              gap: '10px',
            }}
          >
            <div>
              <div style={{ fontSize: '0.74rem', color: '#475569', fontWeight: 600 }}>प्रतिवेदन भर्ने स्वास्थ्यकर्मी:</div>
              <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0f172a' }}>
                {report.reportedBy || 'स्वास्थ्य शाखा प्रमुख'}
              </div>
              {report.remarks && (
                <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px', fontStyle: 'italic' }}>
                  कैफियत: {report.remarks}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>DHIS2 सर्भर स्थिति:</div>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    color: isSynced ? '#15803d' : '#b45309',
                  }}
                >
                  {isSynced ? <CheckCircle2 size={15} /> : <Clock size={15} />}
                  <span>{isSynced ? 'राष्ट्रिय DHIS2 मा सिङ्क भएको' : 'सिङ्क हुन बाँकी (Pending)'}</span>
                </div>
              </div>

              {!isSynced && onSync && (
                <button
                  type="button"
                  disabled={isSyncing}
                  onClick={() => onSync(report.id)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: '#10b981',
                    color: '#ffffff',
                    padding: '7px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(16, 185, 129, 0.25)',
                  }}
                >
                  <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
                  <span>{isSyncing ? 'सिङ्क हुँदै...' : 'अहिले सिङ्क गर्नुहोस्'}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div
          style={{
            padding: '1rem 1.5rem',
            backgroundColor: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            दर्ता मिति: {report.createdAt ? new Date(report.createdAt).toLocaleDateString('ne-NP') : '२०८१'}
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '7px 18px',
              borderRadius: '8px',
              backgroundColor: '#e2e8f0',
              color: '#334155',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.84rem',
              cursor: 'pointer',
            }}
          >
            बन्द गर्नुहोस्
          </button>
        </div>
      </div>
    </div>
  );
};
