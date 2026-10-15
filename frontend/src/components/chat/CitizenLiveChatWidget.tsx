import React, { useState, useRef, useEffect } from 'react';
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Phone,
  FileText,
  Search,
  ExternalLink,
} from 'lucide-react';
import { aiApi } from '../../api/ai';
import { complaintsApi } from '../../api/complaints';
import type { Complaint } from '../../types/complaint';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user' | 'system';
  text: string;
  timestamp: string;
  options?: string[];
  complaint?: Complaint;
}

export const CitizenLiveChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'register' | 'track' | 'whatsapp'>('chat');
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // In-chat complaint registration
  const [gWard, setGWard] = useState<number>(3);
  const [gCategory, setGCategory] = useState<string>('infrastructure');
  const [gTitle, setGTitle] = useState('');
  const [gDesc, setGDesc] = useState('');
  const [gName, setGName] = useState('');
  const [gPhone, setGPhone] = useState('');
  const [gAnonymous, setGAnonymous] = useState(false);
  const [isSubmittingComplaint, setIsSubmittingComplaint] = useState(false);
  const [registeredComplaint, setRegisteredComplaint] = useState<Complaint | null>(null);

  // In-chat complaint tracking
  const [trackQuery, setTrackQuery] = useState('');
  const [isTracking, setIsTracking] = useState(false);
  const [trackResult, setTrackResult] = useState<Complaint | null>(null);
  const [trackError, setTrackError] = useState('');

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: 'नमस्ते! 🙏 म पाँचपोखरी थाङपाल गाउँपालिकाको २४/७ नागरिक डिजिटल सहायक हुँ। म तपाईंलाई नागरिक बडापत्र, दस्तुर, आकस्मिक सेवा वा गुनासो दर्ता तथा सुनुवाइमा तत्काल सहयोग गर्न तयार छु।',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      options: [
        'सूचना अधिकारी (कुमार बस्नेत) वा विपद् फोकल (नारायण क्षेत्री) सम्पर्क',
        'नागरिकता सिफारिस दस्तुर र कागजात के के चाहिन्छ?',
        'खानेपानी वा सडक बिग्रेको गुनासो दर्ता गर्न चाहन्छु',
        'दर्ता भएको गुनासोको स्थिति कसरी ट्र्याक गर्ने?',
      ],
    },
  ]);

  useEffect(() => {
    if (isOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, activeTab]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputQuery).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: 'usr-' + Date.now(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    const lower = text.toLowerCase();
    if (
      lower.includes('कुमार') ||
      lower.includes('नारायण') ||
      lower.includes('सूचना अधिकारी') ||
      lower.includes('विपद्') ||
      lower.includes('सम्पर्क') ||
      lower.includes('whatsapp') ||
      lower.includes('फोन')
    ) {
      const contactMsg: ChatMessage = {
        id: 'contact-' + Date.now(),
        sender: 'ai',
        text: `👤 **पाँचपोखरी थाङपाल गाउँपालिका - तोकिएका आधिकारिक सम्पर्कहरू:**\n\n` +
          `१️⃣ **सूचना अधिकारी (श्री कुमार बस्नेत):**\n` +
          `• सम्पर्क / WhatsApp: 9851278530\n` +
          `• जिम्मेवारी: सूचनाको हक (RTI), नागरिक सेवा तथा प्रशासनिक गुनासो\n\n` +
          `२️⃣ **सूचना प्रविधि अधिकृत / विपद् फोकल पर्सन (श्री नारायण क्षेत्री):**\n` +
          `• सम्पर्क / WhatsApp: 9864112955\n` +
          `• जिम्मेवारी: बाढी/पहिरो, सडक अवरोध, विपद् पूर्वतयारी, Digital Twin तथा प्राविधिक समस्या\n\n` +
          `👉 तपाईं तलको **"ह्वाट्सएप"** ट्याबबाट सिधै सम्बन्धित अधिकृतसँग WhatsApp मा कुराकानी सुरु गर्न सक्नुहुन्छ।`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        options: [
          'खानेपानी वा सडक बिग्रेको गुनासो दर्ता गर्न चाहन्छु',
          'दर्ता भएको गुनासोको स्थिति कसरी ट्र्याक गर्ने?',
        ],
      };
      setMessages((prev) => [...prev, contactMsg]);
      setIsLoading(false);
      return;
    }

    try {
      const response = await aiApi.chat(text);
      const aiMsg: ChatMessage = {
        id: 'ai-' + Date.now(),
        sender: 'ai',
        text: response.answer || 'तपाईंको प्रश्न प्राप्त भयो। थप विवरणका लागि सम्बन्धित शाखामा सम्पर्क गर्न सक्नुहुन्छ।',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        options: response.suggestedActions?.slice(0, 3),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      const errorMsg: ChatMessage = {
        id: 'err-' + Date.now(),
        sender: 'system',
        text: 'माफ गर्नुहोस्, सेवामा केही प्राविधिक समस्या आयो। कृपया केही समयपछि पुन: प्रयास गर्नुहोस् वा सिधै ह्वाट्सएप प्रयोग गर्नुहोस्।',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gTitle.trim() || !gDesc.trim()) return;

    setIsSubmittingComplaint(true);
    try {
      const result = await complaintsApi.create({
        title: gTitle,
        description: gDesc,
        category: gCategory,
        wardNumber: gWard,
        complainantName: gAnonymous ? 'गोप्य नागरिक' : (gName || 'नागरिक'),
        complainantPhone: gPhone,
        isAnonymous: gAnonymous,
        channel: 'live_chat',
      });

      setRegisteredComplaint(result);

      const sysMsg: ChatMessage = {
        id: 'complaint-' + Date.now(),
        sender: 'system',
        text: `गुनासो सफलतापूर्वक दर्ता भयो! दर्ता नं: ${result.complaintNo} (ट्र्याकिङ कोड: ${result.trackingToken})`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        complaint: result,
      };
      setMessages((prev) => [...prev, sysMsg]);
    } catch {
      alert('गुनासो दर्ता गर्दा समस्या आयो। कृपया विवरण पुनः जाँच्नुहोस्।');
    } finally {
      setIsSubmittingComplaint(false);
    }
  };

  const handleTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = trackQuery.trim();
    if (!q) return;

    setIsTracking(true);
    setTrackError('');
    setTrackResult(null);

    try {
      const found = await complaintsApi.track(q);
      setTrackResult(found);
    } catch {
      setTrackError('उक्त दर्ता नम्बर वा कोड भएको कुनै गुनासो फेला परेन। कृपया आफ्नो दर्ता नम्बर पुनः जाँच्नुहोस्।');
    } finally {
      setIsTracking(false);
    }
  };

  const statusLabels: Record<string, { label: string; color: string; bg: string }> = {
    pending: { label: 'दर्ता भएको (कारबाही सुरु हुन बाँकी)', color: '#d97706', bg: '#fef3c7' },
    in_progress: { label: 'कारबाही प्रक्रियामा रहेको', color: '#2563eb', bg: '#eff6ff' },
    resolved: { label: 'सम्पन्न / समाधान भएको', color: '#16a34a', bg: '#dcfce7' },
    rejected: { label: 'अस्वीकृत / खारेज भएको', color: '#dc2626', bg: '#fee2e2' },
  };

  const infoOfficerWaUrl = `https://wa.me/9779851278530?text=${encodeURIComponent(
    'नमस्ते सूचना अधिकारीज्यू (कुमार बस्नेत), मलाई पाँचपोखरी थाङपाल गाउँपालिकाको सूचना माग / नागरिक सेवा सम्बन्धी जानकारी वा गुनासो पेश गर्नु परेको छ।'
  )}`;

  const itDisasterOfficerWaUrl = `https://wa.me/9779864112955?text=${encodeURIComponent(
    'नमस्ते सूचना प्रविधि अधिकृत / विपद् फोकल पर्सनज्यू (नारायण क्षेत्री), मलाई पाँचपोखरी थाङपाल गाउँपालिकाको विपद् जोखिम (बाढी/पहिरो/सडक अवरोध) वा प्राविधिक समस्या सम्बन्धी जानकारी गराउनु छ।'
  )}`;

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 99999, fontFamily: 'inherit' }}>
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'linear-gradient(135deg, #059669 0%, #0d9488 100%)',
            color: '#ffffff',
            padding: '12px 18px',
            borderRadius: '9999px',
            boxShadow: '0 10px 25px rgba(5, 150, 105, 0.45)',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          aria-label="नागरिक सहायता तथा Live Chat खोल्नुहोस्"
        >
          <span
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: '#34d399',
              boxShadow: '0 0 10px #34d399',
            }}
          />
          <MessageCircle size={22} color="#ffffff" />
          <div style={{ textAlign: 'left', lineHeight: '1.2' }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', color: '#a7f3d0', letterSpacing: '0.5px' }}>
              २४/७ नागरिक सहायता
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>Live Chat & WhatsApp</div>
          </div>
        </button>
      )}

      {/* Floating Chat Modal */}
      {isOpen && (
        <div
          style={{
            width: '390px',
            maxWidth: 'calc(100vw - 32px)',
            height: '560px',
            maxHeight: 'calc(100vh - 48px)',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.22)',
            border: '1px solid #cbd5e1',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              background: 'linear-gradient(135deg, #065f46 0%, #0f766e 100%)',
              color: '#ffffff',
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Bot size={20} color="#a7f3d0" />
              </div>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>पाँचपोखरी नागरिक सहायता</span>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#4ade80' }} />
                </div>
                <div style={{ fontSize: '0.7rem', color: '#d1fae5' }}>एआई डिजिटल सहायक • Live Chat • WhatsApp</div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#ffffff',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="बन्द गर्नुहोस्"
            >
              <X size={20} />
            </button>
          </div>

          {/* Tab Navigation */}
          <div
            style={{
              display: 'flex',
              backgroundColor: '#f8fafc',
              borderBottom: '1px solid #e2e8f0',
              fontSize: '0.75rem',
              fontWeight: 600,
            }}
          >
            {[
              { id: 'chat', label: 'एआई च्याट', icon: <Bot size={14} /> },
              { id: 'register', label: 'गुनासो दर्ता', icon: <FileText size={14} /> },
              { id: 'track', label: 'ट्र्याकिङ', icon: <Search size={14} /> },
              { id: 'whatsapp', label: 'WhatsApp', icon: <span style={{ color: '#16a34a', fontWeight: 800 }}>WA</span> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  flex: 1,
                  padding: '10px 4px',
                  border: 'none',
                  borderBottom: activeTab === tab.id ? '2px solid #059669' : '2px solid transparent',
                  backgroundColor: activeTab === tab.id ? '#ffffff' : 'transparent',
                  color: activeTab === tab.id ? '#059669' : '#64748b',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '5px',
                  transition: 'all 0.15s ease',
                }}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* TAB 1: AI Chat Assistant */}
          {activeTab === 'chat' && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc', overflow: 'hidden' }}>
              <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {messages.map((m) => (
                  <div
                    key={m.id}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: m.sender === 'user' ? 'flex-end' : 'flex-start',
                    }}
                  >
                    <div
                      style={{
                        maxWidth: '85%',
                        padding: '10px 12px',
                        borderRadius: '12px',
                        fontSize: '0.78rem',
                        lineHeight: '1.45',
                        backgroundColor:
                          m.sender === 'user'
                            ? '#059669'
                            : m.sender === 'system'
                            ? '#fef3c7'
                            : '#ffffff',
                        color:
                          m.sender === 'user'
                            ? '#ffffff'
                            : m.sender === 'system'
                            ? '#92400e'
                            : '#1e293b',
                        border:
                          m.sender === 'user'
                            ? 'none'
                            : m.sender === 'system'
                            ? '1px solid #fde68a'
                            : '1px solid #e2e8f0',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {m.text}

                      {m.complaint && (
                        <div
                          style={{
                            marginTop: '8px',
                            padding: '8px',
                            backgroundColor: '#ecfdf5',
                            border: '1px solid #a7f3d0',
                            borderRadius: '6px',
                            fontSize: '0.72rem',
                            color: '#065f46',
                          }}
                        >
                          <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <CheckCircle2 size={12} /> दर्ता सम्पन्न: {m.complaint.complaintNo}
                          </div>
                          <div>वडा नं: {m.complaint.wardNumber} | प्राथमिकता: {m.complaint.priority}</div>
                        </div>
                      )}
                    </div>

                    {m.options && m.options.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '6px', maxWidth: '95%' }}>
                        {m.options.map((opt, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSendMessage(opt)}
                            style={{
                              fontSize: '0.7rem',
                              backgroundColor: '#ffffff',
                              color: '#047857',
                              border: '1px solid #a7f3d0',
                              borderRadius: '16px',
                              padding: '4px 8px',
                              cursor: 'pointer',
                              textAlign: 'left',
                            }}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    )}

                    <span style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '3px', padding: '0 4px' }}>
                      {m.timestamp}
                    </span>
                  </div>
                ))}

                {isLoading && (
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.75rem',
                      color: '#64748b',
                      backgroundColor: 'rgba(255,255,255,0.8)',
                      padding: '6px 10px',
                      borderRadius: '8px',
                      width: 'fit-content',
                    }}
                  >
                    <Sparkles size={14} color="#059669" />
                    <span>एआई सहायक उत्तर खोज्दैछ...</span>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Chat Input Bar */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                style={{
                  padding: '10px',
                  backgroundColor: '#ffffff',
                  borderTop: '1px solid #e2e8f0',
                  display: 'flex',
                  gap: '8px',
                }}
              >
                <input
                  type="text"
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  placeholder="नागरिक बडापत्र वा गुनासोबारे सोध्नुहोस्..."
                  style={{
                    flex: 1,
                    fontSize: '0.78rem',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    outline: 'none',
                    backgroundColor: '#f8fafc',
                  }}
                />
                <button
                  type="submit"
                  disabled={!inputQuery.trim() || isLoading}
                  style={{
                    backgroundColor: '#059669',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0 12px',
                    cursor: 'pointer',
                    opacity: !inputQuery.trim() || isLoading ? 0.5 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Send size={15} />
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: In-Chat Grievance Intake Form */}
          {activeTab === 'register' && (
            <div style={{ flex: 1, overflowY: 'auto', padding: '14px', backgroundColor: '#f8fafc' }}>
              {registeredComplaint ? (
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    padding: '16px',
                    borderRadius: '12px',
                    border: '1px solid #a7f3d0',
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      backgroundColor: '#dcfce7',
                      color: '#16a34a',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 10px auto',
                    }}
                  >
                    <CheckCircle2 size={26} />
                  </div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, margin: '0 0 4px 0', color: '#1e293b' }}>
                    गुनासो सफलतापूर्वक दर्ता भयो!
                  </h4>
                  <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0 0 12px 0' }}>
                    सुशासन ऐन, २०६४ अनुसार गुनासो सुन्ने अधिकारी समक्ष पेश भएको छ।
                  </p>

                  <div
                    style={{
                      backgroundColor: '#f8fafc',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      textAlign: 'left',
                      fontSize: '0.75rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '5px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>दर्ता नं:</span>
                      <strong style={{ color: '#059669' }}>{registeredComplaint.complaintNo}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>ट्र्याकिङ कोड:</span>
                      <strong>{registeredComplaint.trackingToken}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>वडा:</span>
                      <span>वडा नं. {registeredComplaint.wardNumber}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>माध्यम:</span>
                      <span style={{ color: '#0284c7', fontWeight: 600 }}>लाइभ च्याट (Live Chat)</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                    <button
                      onClick={() => {
                        setRegisteredComplaint(null);
                        setGTitle('');
                        setGDesc('');
                      }}
                      style={{
                        flex: 1,
                        padding: '8px',
                        fontSize: '0.75rem',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        backgroundColor: '#ffffff',
                        cursor: 'pointer',
                      }}
                    >
                      अर्को दर्ता
                    </button>
                    <button
                      onClick={() => {
                        setTrackQuery(registeredComplaint.complaintNo);
                        setActiveTab('track');
                      }}
                      style={{
                        flex: 1,
                        padding: '8px',
                        fontSize: '0.75rem',
                        borderRadius: '6px',
                        border: 'none',
                        backgroundColor: '#059669',
                        color: '#ffffff',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      स्थिति हेर्नुहोस्
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleRegisterComplaint} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div
                    style={{
                      backgroundColor: '#ecfdf5',
                      padding: '10px',
                      borderRadius: '8px',
                      border: '1px solid #a7f3d0',
                      color: '#065f46',
                      fontSize: '0.72rem',
                    }}
                  >
                    <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <ShieldCheck size={14} color="#059669" />
                      ३ मिनेटमा जनगुनासो दर्ता
                    </div>
                    <div style={{ marginTop: '2px', color: '#047857' }}>
                      तपाईंको गुनासो सिधै गुनासो सुन्ने अधिकृत (राम बहादुर थापा) समक्ष पेश हुन्छ।
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '3px', color: '#334155' }}>
                      गुनासोको शीर्षक / विषय *
                    </label>
                    <input
                      type="text"
                      required
                      value={gTitle}
                      onChange={(e) => setGTitle(e.target.value)}
                      placeholder="e.g. वडा ३ मा खानेपानी पाइप फुट्यो"
                      style={{
                        width: '100%',
                        padding: '7px 10px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.75rem',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '3px', color: '#334155' }}>
                        वडा नं. *
                      </label>
                      <select
                        value={gWard}
                        onChange={(e) => setGWard(parseInt(e.target.value))}
                        style={{
                          width: '100%',
                          padding: '7px 10px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.75rem',
                          backgroundColor: '#ffffff',
                          boxSizing: 'border-box',
                        }}
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((w) => (
                          <option key={w} value={w}>वडा नं. {w}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '3px', color: '#334155' }}>
                        विधा *
                      </label>
                      <select
                        value={gCategory}
                        onChange={(e) => setGCategory(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '7px 10px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.75rem',
                          backgroundColor: '#ffffff',
                          boxSizing: 'border-box',
                        }}
                      >
                        <option value="infrastructure">सडक तथा पूर्वाधार</option>
                        <option value="drinking_water">खानेपानी तथा सरसफाइ</option>
                        <option value="electricity">विद्युत तथा ऊर्जा</option>
                        <option value="health">स्वास्थ्य सेवा</option>
                        <option value="education">शिक्षा तथा विद्यालय</option>
                        <option value="waste_management">फोहोरमैला व्यवस्थापन</option>
                        <option value="governance_corruption">सुशासन / अनियमितता</option>
                        <option value="other">अन्य विषय</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '3px', color: '#334155' }}>
                      समस्याको पूर्ण विवरण *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={gDesc}
                      onChange={(e) => setGDesc(e.target.value)}
                      placeholder="स्थान र समस्या स्पष्ट उल्लेख गर्नुहोस्..."
                      style={{
                        width: '100%',
                        padding: '7px 10px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.75rem',
                        boxSizing: 'border-box',
                        resize: 'vertical',
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '3px', color: '#334155' }}>
                        तपाईंको नाम {!gAnonymous && '*'}
                      </label>
                      <input
                        type="text"
                        disabled={gAnonymous}
                        value={gAnonymous ? 'गोप्य नागरिक' : gName}
                        onChange={(e) => setGName(e.target.value)}
                        placeholder="पूरा नाम"
                        style={{
                          width: '100%',
                          padding: '7px 10px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.75rem',
                          boxSizing: 'border-box',
                          opacity: gAnonymous ? 0.6 : 1,
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '3px', color: '#334155' }}>
                        फोन (WhatsApp)
                      </label>
                      <input
                        type="tel"
                        value={gPhone}
                        onChange={(e) => setGPhone(e.target.value)}
                        placeholder="९८..."
                        style={{
                          width: '100%',
                          padding: '7px 10px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.75rem',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <input
                      type="checkbox"
                      id="anonCheckInChat"
                      checked={gAnonymous}
                      onChange={(e) => setGAnonymous(e.target.checked)}
                      style={{ cursor: 'pointer' }}
                    />
                    <label htmlFor="anonCheckInChat" style={{ fontSize: '0.72rem', color: '#64748b', cursor: 'pointer' }}>
                      मेरो नाम र पहिचान गोप्य राख्नुहोस् (Anonymous)
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingComplaint}
                    style={{
                      backgroundColor: '#059669',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '10px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      marginTop: '4px',
                    }}
                  >
                    {isSubmittingComplaint ? 'दर्ता हुँदैछ...' : 'गुनासो सुरक्षित रूपमा दर्ता गर्नुहोस्'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB 3: Tracking */}
          {activeTab === 'track' && (
            <div style={{ flex: 1, overflowY: 'auto', padding: '14px', backgroundColor: '#f8fafc' }}>
              <form onSubmit={handleTrackSubmit} style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
                <input
                  type="text"
                  value={trackQuery}
                  onChange={(e) => setTrackQuery(e.target.value)}
                  placeholder="दर्ता नं (उदा: PPK-G-2081-0011)"
                  style={{
                    flex: 1,
                    fontSize: '0.75rem',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    outline: 'none',
                  }}
                />
                <button
                  type="submit"
                  disabled={isTracking || !trackQuery.trim()}
                  style={{
                    backgroundColor: '#059669',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '0 12px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {isTracking ? '...' : 'ट्र्याक'}
                </button>
              </form>

              {trackError && (
                <div
                  style={{
                    padding: '10px',
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#dc2626',
                    fontSize: '0.72rem',
                    borderRadius: '8px',
                    marginBottom: '10px',
                  }}
                >
                  {trackError}
                </div>
              )}

              {trackResult && (
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '10px',
                    padding: '12px',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    fontSize: '0.75rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: '0.85rem', color: '#1e293b' }}>{trackResult.complaintNo}</strong>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: '12px',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        backgroundColor: statusLabels[trackResult.status]?.bg || '#f1f5f9',
                        color: statusLabels[trackResult.status]?.color || '#475569',
                      }}
                    >
                      {statusLabels[trackResult.status]?.label || trackResult.status}
                    </span>
                  </div>

                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '6px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div>
                      <span style={{ color: '#94a3b8' }}>विषय: </span>
                      <strong style={{ color: '#334155' }}>{trackResult.title}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#94a3b8' }}>वडा: </span>
                      <span>वडा नं. {trackResult.wardNumber || 'गाउँपालिका'}</span>
                    </div>
                    <div>
                      <span style={{ color: '#94a3b8' }}>शाखा: </span>
                      <span style={{ color: '#047857', fontWeight: 600 }}>{trackResult.assignedDepartment}</span>
                    </div>
                    <div>
                      <span style={{ color: '#94a3b8' }}>अधिकृत: </span>
                      <span>{trackResult.assignedTo || 'कुमार बस्नेत (सूचना अधिकृत) / नारायण क्षेत्री (विपद्/IT)'}</span>
                    </div>

                    <div style={{ backgroundColor: '#f8fafc', padding: '8px', borderRadius: '6px', marginTop: '4px' }}>
                      <span style={{ fontWeight: 600, color: '#475569', display: 'block', marginBottom: '2px' }}>
                        कारबाही विवरण:
                      </span>
                      <p style={{ margin: 0, color: '#334155' }}>
                        {trackResult.actionTakenNotes || 'छानबिन प्रक्रिया जारी छ।'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Official WhatsApp & Officer Contacts */}
          {activeTab === 'whatsapp' && (
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '16px 14px',
                backgroundColor: '#f8fafc',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <div style={{ textAlign: 'center', marginBottom: '2px' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    backgroundColor: '#dcfce7',
                    color: '#16a34a',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '6px',
                  }}
                >
                  <MessageCircle size={26} />
                </div>
                <h4 style={{ fontSize: '0.92rem', fontWeight: 700, margin: '0 0 4px 0', color: '#1e293b' }}>
                  तोकिएका सम्पर्क अधिकारी तथा WhatsApp
                </h4>
                <p style={{ fontSize: '0.72rem', color: '#64748b', margin: 0, lineHeight: 1.4 }}>
                  नागरिक सेवा, सूचना माग वा आपत्कालीन विपद्का लागि सम्बन्धित अधिकृतसँग सिधै संवाद गर्नुहोस्।
                </p>
              </div>

              {/* Officer 1: Kumar Basnet (Information Officer) */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '12px',
                  padding: '12px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span
                      style={{
                        display: 'inline-block',
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        backgroundColor: '#dbeafe',
                        color: '#1e40af',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        marginBottom: '4px',
                        textTransform: 'uppercase',
                      }}
                    >
                      सूचनाको हक (RTI) / जनगुनासो
                    </span>
                    <h5 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>
                      श्री कुमार बस्नेत
                    </h5>
                    <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: '1px' }}>
                      सूचना अधिकारी / प्रशासन शाखा
                    </div>
                  </div>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#059669' }}>
                    ९८५१२७८५३०
                  </span>
                </div>

                <div style={{ fontSize: '0.7rem', color: '#64748b', lineHeight: 1.35 }}>
                  📌 सार्वजनिक सूचना माग, नागरिक सेवा तथा सामान्य गुनासो दर्ता एवं प्रशासनिक समन्वय।
                </div>

                <a
                  href={infoOfficerWaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    backgroundColor: '#16a34a',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 6px rgba(22, 163, 74, 0.25)',
                  }}
                >
                  <MessageCircle size={15} />
                  <span>कुमार बस्नेतलाई WhatsApp गर्नुहोस्</span>
                  <ExternalLink size={13} />
                </a>
              </div>

              {/* Officer 2: Narayan Chhetri (IT & Disaster Focal Person) */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '12px',
                  padding: '12px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span
                      style={{
                        display: 'inline-block',
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        backgroundColor: '#ffedd5',
                        color: '#c2410c',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        marginBottom: '4px',
                        textTransform: 'uppercase',
                      }}
                    >
                      विपद् फोकल / IT शाखा
                    </span>
                    <h5 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>
                      श्री नारायण क्षेत्री
                    </h5>
                    <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: '1px' }}>
                      सूचना प्रविधि अधिकृत / विपद् फोकल पर्सन
                    </div>
                  </div>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#059669' }}>
                    ९८६४११२९५५
                  </span>
                </div>

                <div style={{ fontSize: '0.7rem', color: '#64748b', lineHeight: 1.35 }}>
                  ⚠️ बाढी, पहिरो, सडक अवरोध, विपद् पूर्वतयारी, Digital Twin र प्राविधिक समस्या।
                </div>

                <a
                  href={itDisasterOfficerWaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    backgroundColor: '#0d9488',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 6px rgba(13, 148, 136, 0.25)',
                  }}
                >
                  <MessageCircle size={15} />
                  <span>नारायण क्षेत्रीलाई WhatsApp गर्नुहोस्</span>
                  <ExternalLink size={13} />
                </a>
              </div>

              {/* Automated Routing Explanation */}
              <div
                style={{
                  backgroundColor: '#f1f5f9',
                  border: '1px dashed #cbd5e1',
                  borderRadius: '10px',
                  padding: '10px',
                  fontSize: '0.68rem',
                  color: '#475569',
                  lineHeight: 1.4,
                }}
              >
                🔔 <strong>स्वचालित SMS अलर्ट:</strong> नागरिकले यस पोर्टलबाट गुनासो दर्ता हुनासाथ समस्याको प्रकृति अनुसार सिधै कुमार बस्नेत वा नारायण क्षेत्रीको मोबाइलमा दर्ता नम्बरसहित एसएमएस जान्छ।
              </div>
            </div>
          )}

          {/* Footer Branding */}
          <div
            style={{
              padding: '8px 14px',
              backgroundColor: '#f1f5f9',
              borderTop: '1px solid #e2e8f0',
              fontSize: '0.68rem',
              color: '#64748b',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>पाँचपोखरी थाङपाल डिजिटल ट्विन</span>
            <span style={{ fontWeight: 600, color: '#059669' }}>सुशासन ऐन, २०६४</span>
          </div>
        </div>
      )}
    </div>
  );
};
