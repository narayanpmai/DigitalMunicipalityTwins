import React, { useState, useEffect } from 'react';
import { Project, ProjectSmsLog } from '../../../types/sectoral';
import { adToBs } from '../../../utils/nepaliCalendar';
import {
  X,
  Send,
  MessageSquare,
  Smartphone,
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  History,
  Radio,
  FileText,
  Loader2,
  ShieldAlert,
} from 'lucide-react';

export interface ProjectSmsNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  onSendSms: (payload: {
    phone: string;
    message: string;
    recipientRole?: string;
    recipientName?: string;
    templateKey?: string;
    sentDateBs?: string;
  }) => Promise<any>;
}

const toNepaliNum = (num: number | string): string => {
  const nepaliDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  return String(num).replace(/\d/g, (d) => nepaliDigits[parseInt(d, 10)]);
};

export const ProjectSmsNotificationModal: React.FC<ProjectSmsNotificationModalProps> = ({
  isOpen,
  onClose,
  project,
  onSendSms,
}) => {
  const todayBs = adToBs(new Date().toISOString().split('T')[0]) || '२०८१-०८-१०';
  const [activeTab, setActiveTab] = useState<'dispatcher' | 'history'>('dispatcher');

  // Form State
  const [recipientRole, setRecipientRole] = useState<string>('समिति अध्यक्ष');
  const [recipientName, setRecipientName] = useState<string>('');
  const [recipientPhone, setRecipientPhone] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [templateKey, setTemplateKey] = useState<string>('agreement');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [dispatchSuccessMsg, setDispatchSuccessMsg] = useState<string | null>(null);

  // Auto-populate based on project
  useEffect(() => {
    if (!isOpen || !project) return;
    setActiveTab('dispatcher');
    setDispatchSuccessMsg(null);

    const chairName = project.committeeChair || 'अध्यक्ष ज्यू';
    const chairPhone = project.committeePhone || '9841234567';

    setRecipientRole('समिति अध्यक्ष');
    setRecipientName(chairName);
    setRecipientPhone(chairPhone);

    // Default template: Agreement Completed
    const totalAmt = Number(project.totalAgreementAmount || project.budget || 0).toLocaleString('en-IN');
    setMessage(
      `पाँचपोखरी थाङपाल गाउँपालिका: '${project.name}' को सम्झौता रु. ${toNepaliNum(totalAmt)} मा सम्पन्न भएको छ। तोकिएको म्याद मिति ${toNepaliNum(project.completionDateBs || '२०८१-१२-३०')} भित्र कार्य सम्पन्न गर्नुहोला।`,
    );
    setTemplateKey('agreement');
  }, [isOpen, project]);

  if (!isOpen || !project) return null;

  const totalAgreementStr = Number(project.totalAgreementAmount || project.budget || 0).toLocaleString('en-IN');
  const paidAmountStr = Number(project.paidAmount || 0).toLocaleString('en-IN');
  const completionDate = project.completionDateBs || '२०८१-१२-३०';

  // Templates Dictionary
  const templates = [
    {
      key: 'agreement',
      title: '१. योजना सम्झौता सम्पन्न सूचना',
      icon: FileText,
      color: '#0f4c81',
      text: `पाँचपोखरी थाङपाल गाउँपालिका: '${project.name}' को सम्झौता रु. ${toNepaliNum(totalAgreementStr)} मा सम्पन्न भएको छ। तोकिएको म्याद मिति ${toNepaliNum(completionDate)} भित्र गुणस्तरीय कार्य सम्पन्न गर्नुहोला।`,
    },
    {
      key: 'installment',
      title: '२. किस्ता रकम निकासा सूचना',
      icon: CheckCircle2,
      color: '#047857',
      text: `पाँचपोखरी थाङपाल गाउँपालिका: '${project.name}' को किस्ता रकम रु. ${toNepaliNum(paidAmountStr)} बैंक खातामा निकासा भएको छ। निर्माण कार्यलाई तीव्रता दिई समयमै नापी किताब पेश गर्नुहोला।`,
    },
    {
      key: 'deadline_alert',
      title: '३. १५-दिने म्याद समाप्ति पूर्व-सचेतना अलर्ट',
      icon: AlertTriangle,
      color: '#d97706',
      text: `जरुरी सूचना: '${project.name}' को सम्झौता म्याद मिति ${toNepaliNum(completionDate)} मा समाप्त हुँदैछ। तोकिएको म्यादभित्र कार्य सम्पन्न गरी नापी किताब र अनुगमन प्रतिवेदन पेश गर्नुहोला।`,
    },
    {
      key: 'extension',
      title: '४. म्याद थप स्वीकृति सूचना',
      icon: Clock,
      color: '#4338ca',
      text: `पाँचपोखरी थाङपाल गाउँपालिका: कार्यपालिकाको निर्णयानुसार '${project.name}' को म्याद मिति ${toNepaliNum(completionDate)} सम्म थप भएको छ। निर्धारित समयमै कार्य सम्पन्न गर्नुहोला।`,
    },
    {
      key: 'social_audit',
      title: '५. सामाजिक परीक्षण / आमभेला आह्वान',
      icon: Users,
      color: '#0d9488',
      text: `सूचना: '${project.name}' को सार्वजनिक सुनुवाइ तथा सामाजिक परीक्षण भेला आयोजना गरिएकाले सम्पूर्ण उपभोक्ता तथा सरोकारवालाहरूको उपस्थितिको लागि अनुरोध छ।`,
    },
  ];

  const handleSelectRecipientPreset = (role: string, name: string, phone: string) => {
    setRecipientRole(role);
    setRecipientName(name);
    setRecipientPhone(phone);
  };

  const handleSelectTemplate = (t: (typeof templates)[0]) => {
    setTemplateKey(t.key);
    setMessage(t.text);
  };

  const handleSubmitSms = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientPhone || recipientPhone.length < 10) {
      alert('कृपया मान्य १० अंकको मोबाइल नम्बर प्रविष्ट गर्नुहोस्।');
      return;
    }
    if (!message.trim()) {
      alert('कृपया सन्देश प्रविष्ट गर्नुहोस्।');
      return;
    }

    setIsSending(true);
    setDispatchSuccessMsg(null);
    try {
      await onSendSms({
        phone: recipientPhone,
        message: message.trim(),
        recipientRole,
        recipientName,
        templateKey,
        sentDateBs: todayBs,
      });
      setDispatchSuccessMsg(
        `SMS सफलतापूर्वक नेपाल टेलिकम (NTC) / Sparrow SMS गेटवे मार्फत ${recipientName} (${recipientPhone}) लाई प्रेषित गरियो।`,
      );
    } catch (err: any) {
      alert(err?.response?.data?.detail || err?.message || 'SMS पठाउन असफल भयो।');
    } finally {
      setIsSending(false);
    }
  };

  const smsLogs: ProjectSmsLog[] = Array.isArray(project.smsLogs) ? project.smsLogs : [];

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
          maxWidth: '960px',
          maxHeight: '92vh',
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
              <Smartphone size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: '#ffffff' }}>
                उपभोक्ता समिति SMS तथा सूचना प्रणाली
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#bfdbfe', margin: '3px 0 0 0' }}>
                {project.name} | वडा नं. {toNepaliNum(project.wardNumber)} | उपभोक्ता समिति: {project.committeeName || '-'}
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
            onClick={() => setActiveTab('dispatcher')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              fontSize: '0.825rem',
              fontWeight: 600,
              cursor: 'pointer',
              backgroundColor: activeTab === 'dispatcher' ? '#0f4c81' : '#ffffff',
              color: activeTab === 'dispatcher' ? '#ffffff' : '#334155',
              border: activeTab === 'dispatcher' ? '1px solid #0f4c81' : '1px solid #cbd5e1',
              boxShadow: activeTab === 'dispatcher' ? '0 2px 4px rgba(15,76,129,0.2)' : 'none',
            }}
          >
            <Send size={16} />
            १. नयाँ SMS सन्देश पठाउनुहोस् (Instant Dispatcher)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              fontSize: '0.825rem',
              fontWeight: 600,
              cursor: 'pointer',
              backgroundColor: activeTab === 'history' ? '#0f4c81' : '#ffffff',
              color: activeTab === 'history' ? '#ffffff' : '#334155',
              border: activeTab === 'history' ? '1px solid #0f4c81' : '1px solid #cbd5e1',
              boxShadow: activeTab === 'history' ? '0 2px 4px rgba(15,76,129,0.2)' : 'none',
            }}
          >
            <History size={16} />
            २. विगतमा प्रेषित SMS लगहरू ({toNepaliNum(smsLogs.length)})
          </button>
        </div>

        {/* Tab Content */}
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
          {/* TAB 1: DISPATCHER */}
          {activeTab === 'dispatcher' && (
            <form onSubmit={handleSubmitSms} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Success Notification Alert */}
              {dispatchSuccessMsg && (
                <div
                  style={{
                    backgroundColor: '#ecfdf5',
                    border: '1px solid #a7f3d0',
                    color: '#065f46',
                    padding: '0.85rem 1.25rem',
                    borderRadius: '10px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                  }}
                >
                  <CheckCircle2 size={20} color="#059669" />
                  <span>{dispatchSuccessMsg}</span>
                </div>
              )}

              {/* 1-Click Recipient Presets */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  padding: '1.25rem',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f2942' }}>
                    १. सन्देश प्राप्तकर्ता छान्नुहोस् (Select Recipient):
                  </label>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    एक-क्लिकमा पदाधिकारी छान्नुहोस् वा म्यानुअल नम्बर राख्नुहोस्
                  </span>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '0.65rem',
                  }}
                >
                  <button
                    type="button"
                    onClick={() =>
                      handleSelectRecipientPreset(
                        'समिति अध्यक्ष',
                        project.committeeChair || 'अध्यक्ष',
                        project.committeePhone || '9841234567',
                      )
                    }
                    style={{
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      border: recipientRole === 'समिति अध्यक्ष' ? '2px solid #0f4c81' : '1px solid #cbd5e1',
                      backgroundColor: recipientRole === 'समिति अध्यक्ष' ? '#eff6ff' : '#ffffff',
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ fontSize: '0.725rem', color: '#64748b', fontWeight: 600 }}>समिति अध्यक्ष</div>
                    <div style={{ fontSize: '0.825rem', fontWeight: 700, color: '#0f2942' }}>
                      {project.committeeChair || 'अध्यक्ष'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#0f4c81', fontFamily: 'monospace' }}>
                      📞 {project.committeePhone || '9841234567'}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleSelectRecipientPreset(
                        'समिति सचिव',
                        project.committeeSecretary || 'सचिव',
                        '9851123456',
                      )
                    }
                    style={{
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      border: recipientRole === 'समिति सचिव' ? '2px solid #0f4c81' : '1px solid #cbd5e1',
                      backgroundColor: recipientRole === 'समिति सचिव' ? '#eff6ff' : '#ffffff',
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ fontSize: '0.725rem', color: '#64748b', fontWeight: 600 }}>समिति सचिव</div>
                    <div style={{ fontSize: '0.825rem', fontWeight: 700, color: '#0f2942' }}>
                      {project.committeeSecretary || 'सचिव'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#0f4c81', fontFamily: 'monospace' }}>
                      📞 9851123456
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleSelectRecipientPreset(
                        'समिति कोषाध्यक्ष',
                        project.committeeTreasurer || 'कोषाध्यक्ष',
                        '9860123456',
                      )
                    }
                    style={{
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      border: recipientRole === 'समिति कोषाध्यक्ष' ? '2px solid #0f4c81' : '1px solid #cbd5e1',
                      backgroundColor: recipientRole === 'समिति कोषाध्यक्ष' ? '#eff6ff' : '#ffffff',
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ fontSize: '0.725rem', color: '#64748b', fontWeight: 600 }}>समिति कोषाध्यक्ष</div>
                    <div style={{ fontSize: '0.825rem', fontWeight: 700, color: '#0f2942' }}>
                      {project.committeeTreasurer || 'कोषाध्यक्ष'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#0f4c81', fontFamily: 'monospace' }}>
                      📞 9860123456
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleSelectRecipientPreset(
                        'वडा प्राविधिक / इन्जिनियर',
                        project.responsibleEngineer || 'प्राविधिक',
                        project.engineerPhone || '9841000000',
                      )
                    }
                    style={{
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      border: recipientRole === 'वडा प्राविधिक / इन्जिनियर' ? '2px solid #0f4c81' : '1px solid #cbd5e1',
                      backgroundColor: recipientRole === 'वडा प्राविधिक / इन्जिनियर' ? '#eff6ff' : '#ffffff',
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ fontSize: '0.725rem', color: '#64748b', fontWeight: 600 }}>जिम्मेवार प्राविधिक</div>
                    <div style={{ fontSize: '0.825rem', fontWeight: 700, color: '#0f2942' }}>
                      {project.responsibleEngineer || 'प्राविधिक'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#0f4c81', fontFamily: 'monospace' }}>
                      📞 {project.engineerPhone || '9841000000'}
                    </div>
                  </button>
                </div>

                {/* Recipient Details Inputs */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '0.85rem',
                    paddingTop: '0.5rem',
                    borderTop: '1px solid #f1f5f9',
                  }}
                >
                  <div>
                    <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                      प्राप्तकर्ताको भूमिका:
                    </label>
                    <input
                      type="text"
                      value={recipientRole}
                      onChange={(e) => setRecipientRole(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.5rem 0.75rem',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.825rem',
                        boxSizing: 'border-box',
                      }}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                      प्राप्तकर्ताको नाम:
                    </label>
                    <input
                      type="text"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.5rem 0.75rem',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.825rem',
                        boxSizing: 'border-box',
                      }}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                      मोबाइल नम्बर (१० अंक):
                    </label>
                    <input
                      type="text"
                      value={recipientPhone}
                      onChange={(e) => setRecipientPhone(e.target.value)}
                      placeholder="98XXXXXXXX"
                      style={{
                        width: '100%',
                        padding: '0.5rem 0.75rem',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.825rem',
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        boxSizing: 'border-box',
                      }}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Template Selector */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  padding: '1.25rem',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f2942' }}>
                    २. आधिकारिक नेपाली SMS ढाँचा (Quick SMS Templates):
                  </label>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    क्लिक गरी सन्देश स्वतः भर्नुहोस्
                  </span>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {templates.map((t) => {
                    const Icon = t.icon;
                    const isSelected = templateKey === t.key;
                    return (
                      <button
                        key={t.key}
                        type="button"
                        onClick={() => handleSelectTemplate(t)}
                        style={{
                          padding: '0.45rem 0.85rem',
                          borderRadius: '8px',
                          border: isSelected ? `2px solid ${t.color}` : '1px solid #cbd5e1',
                          backgroundColor: isSelected ? '#f8fafc' : '#ffffff',
                          color: isSelected ? t.color : '#334155',
                          fontWeight: isSelected ? 700 : 500,
                          fontSize: '0.775rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          cursor: 'pointer',
                        }}
                      >
                        <Icon size={14} color={t.color} />
                        {t.title}
                      </button>
                    );
                  })}
                </div>

                {/* Message Textarea */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155' }}>
                      SMS सन्देश पाठ (सन्देश सम्पादन गर्न सक्नुहुन्छ):
                    </label>
                    <span style={{ fontSize: '0.725rem', color: '#64748b' }}>
                      अक्षर संख्या: <strong>{message.length}</strong> (नेपाली युनिकोड १ SMS ≈ ७० क्यारेक्टर)
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.85rem',
                      lineHeight: 1.5,
                      boxSizing: 'border-box',
                      resize: 'vertical',
                      backgroundColor: '#ffffff',
                    }}
                    required
                  />
                </div>

                {/* Dispatch Controls */}
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '1rem',
                    paddingTop: '0.5rem',
                    borderTop: '1px solid #f1f5f9',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.775rem', color: '#475569' }}>
                    <Radio size={16} color="#059669" />
                    गेटवे: <strong>नेपाल टेलिकम (NTC SMS) / Sparrow SMS Gateway</strong> (सक्रिय)
                  </div>

                  <button
                    type="submit"
                    disabled={isSending}
                    style={{
                      backgroundColor: '#0f4c81',
                      color: '#ffffff',
                      padding: '0.65rem 1.5rem',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: isSending ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      border: 'none',
                      boxShadow: '0 2px 4px rgba(15,76,129,0.25)',
                    }}
                  >
                    {isSending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    {isSending ? 'SMS प्रेषित हुँदैछ...' : 'SMS पठाउनुहोस्'}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* TAB 2: HISTORY */}
          {activeTab === 'history' && (
            <div
              style={{
                backgroundColor: '#ffffff',
                padding: '1.25rem',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: '1px solid #e2e8f0',
                  paddingBottom: '0.65rem',
                }}
              >
                <h3 style={{ margin: 0, fontWeight: 700, fontSize: '0.925rem', color: '#0f2942' }}>
                  यस आयोजनामा प्रेषित SMS इतिहास ({toNepaliNum(smsLogs.length)} सन्देश)
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  महालेखा अडिट तथा पालिका आधिकारिक सूचना अभिलेख
                </span>
              </div>

              {smsLogs.length === 0 ? (
                <div
                  style={{
                    padding: '2rem',
                    textAlign: 'center',
                    color: '#64748b',
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px dashed #cbd5e1',
                    fontSize: '0.825rem',
                  }}
                >
                  यस आयोजनाको लागि अहिलेसम्म कुनै SMS प्रेषित गरिएको छैन। ट्याब १ बाट पहिलो सन्देश पठाउनुहोस्।
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#0f4c81', color: '#ffffff' }}>
                        <th style={{ padding: '0.6rem 0.75rem', whiteSpace: 'nowrap' }}>क्र.सं.</th>
                        <th style={{ padding: '0.6rem 0.75rem', whiteSpace: 'nowrap' }}>मिति (वि.सं.)</th>
                        <th style={{ padding: '0.6rem 0.75rem', whiteSpace: 'nowrap' }}>प्राप्तकर्ता</th>
                        <th style={{ padding: '0.6rem 0.75rem', whiteSpace: 'nowrap' }}>पद / भूमिका</th>
                        <th style={{ padding: '0.6rem 0.75rem', whiteSpace: 'nowrap' }}>मोबाइल नं.</th>
                        <th style={{ padding: '0.6rem 0.75rem', minWidth: '280px' }}>सन्देश व्यहोरा</th>
                        <th style={{ padding: '0.6rem 0.75rem', whiteSpace: 'nowrap' }}>स्थिति</th>
                      </tr>
                    </thead>
                    <tbody>
                      {smsLogs.map((log, idx) => (
                        <tr
                          key={log.id || idx}
                          style={{
                            borderBottom: '1px solid #f1f5f9',
                            backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc',
                          }}
                        >
                          <td style={{ padding: '0.55rem 0.75rem', fontWeight: 600 }}>{toNepaliNum(idx + 1)}</td>
                          <td style={{ padding: '0.55rem 0.75rem', whiteSpace: 'nowrap' }}>
                            {toNepaliNum(log.sentDateBs || todayBs)}
                          </td>
                          <td style={{ padding: '0.55rem 0.75rem', fontWeight: 700, color: '#0f2942' }}>
                            {log.recipientName}
                          </td>
                          <td style={{ padding: '0.55rem 0.75rem' }}>{log.recipientRole}</td>
                          <td style={{ padding: '0.55rem 0.75rem', fontFamily: 'monospace', fontWeight: 600 }}>
                            {log.phone}
                          </td>
                          <td style={{ padding: '0.55rem 0.75rem', color: '#334155', lineHeight: 1.4 }}>
                            {log.message}
                          </td>
                          <td style={{ padding: '0.55rem 0.75rem', whiteSpace: 'nowrap' }}>
                            <span
                              style={{
                                backgroundColor: '#dcfce7',
                                color: '#15803d',
                                border: '1px solid #86efac',
                                padding: '0.2rem 0.5rem',
                                borderRadius: '999px',
                                fontWeight: 700,
                                fontSize: '0.7rem',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                              }}
                            >
                              <CheckCircle2 size={12} />
                              DELIVERED
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
