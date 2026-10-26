import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { aiApi, type AiChatMessage } from '../../api/ai';
import { useTenant } from '../../context/TenantContext';
import { getTenantId } from '../../api/client';
import {
  Bot,
  User,
  Send,
  Sparkles,
  Trash2,
  ExternalLink,
  BookOpen,
  Volume2,
  Download,
  CheckCircle2,
} from 'lucide-react';

export const AiAssistantPage: React.FC = () => {
  const navigate = useNavigate();
  const { settings, currentTenant } = useTenant();
  const effTenant = (currentTenant?.subdomain || getTenantId() || '').toLowerCase();
  const isKhadadevi = effTenant.includes('khadadevi') || effTenant.includes('khandadevi') || (settings?.palika_name || '').includes('खाँडादेवी') || (settings?.palika_name || '').includes('खाडादेवी');
  const isBenighat = !isKhadadevi && (effTenant.includes('benighat') || (settings?.palika_name || '').includes('बेनिघाट'));

  const palikaName = isKhadadevi 
    ? (settings?.palika_name || 'खाँडादेवी गाउँपालिका')
    : isBenighat
      ? (settings?.palika_name || 'बेनिघाट रोराङ्ग गाउँपालिका')
      : (settings?.palika_name || currentTenant?.name_np || 'पाँचपोखरी थाङपाल गाउँपालिका');

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<AiChatMessage[]>([]);

  useEffect(() => {
    setMessages([
      {
        id: 'welcome',
        sender: 'ai',
        text: isKhadadevi
          ? `नमस्ते! म **खाँडादेवी गाउँपालिका** को डिजिटल ट्विन एआई सहायक हुँ। म तपाईंलाई पालिकाका ९ वटै वडा, बजेट, नागरिक सेवा, दस्तुर, आकस्मिक एम्बुलेन्स सेवा, खाँडादेवी मन्दिर तथा धार्मिक पर्यटन सम्बन्धी आधिकारिक जानकारी दिन तयार छु। के जान्न चाहनुहुन्छ?`
          : isBenighat
          ? `नमस्ते! म **बेनिघाट रोराङ्ग गाउँपालिका** को डिजिटल ट्विन एआई सहायक हुँ। म तपाईंलाई पालिकाका १० वटै वडा, बजेट, नागरिक सेवा, दस्तुर, राजमार्ग आकस्मिक एम्बुलेन्स, त्रिशूली जलपर्यटन सम्बन्धी आधिकारिक जानकारी दिन तयार छु। के जान्न चाहनुहुन्छ?`
          : `नमस्ते! म **पाँचपोखरी थाङपाल गाउँपालिका** डिजिटल ट्विन एआई सहायक हुँ। म तपाईंलाई पालिकाका आयोजनाहरू, बजेट, नागरिक सेवा, दस्तुर, आकस्मिक एम्बुलेन्स, विद्यालय, वा पर्यटकीय स्थल सम्बन्धी आधिकारिक जानकारी दिन तयार छु। के जान्न चाहनुहुन्छ?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: `${palikaName} एकीकृत डिजिटल ट्विन डाटाबेस`,
        confidence: 'high',
        suggestedActions: isKhadadevi
          ? ['९ वटै वडा विवरण', 'नागरिक बडापत्र हेर्नुहोस्', 'आकस्मिक एम्बुलेन्स सेवा', 'खाँडादेवी मन्दिर पर्यटन']
          : isBenighat
          ? ['१० वटै वडा विवरण', 'नागरिक बडापत्र हेर्नुहोस्', 'आकस्मिक एम्बुलेन्स सेवा', 'त्रिशूली र्‍याफ्टिङ']
          : ['नागरिक बडापत्र हेर्नुहोस्', 'आकस्मिक एम्बुलेन्स सेवा', 'पाँचपोखरी पदयात्रा मौसम', 'विकास योजना तथा बजेट'],
        navigationUrl: '/badapatra',
      },
    ]);
  }, [palikaName, isKhadadevi, isBenighat]);

  const quickPrompts = isKhadadevi
    ? [
        'खाँडादेवीका ९ वटै वडा अध्यक्ष र सम्पर्क नम्बर के हुन्?',
        'खाँडादेवी गाउँपालिकाको राष्ट्रिय जनगणना २०७८ को विवरण कस्तो छ?',
        'गाउँपालिका अध्यक्ष र उपाध्यक्ष को हुनुहुन्छ?',
        'नागरिकता सिफारिसका लागि के के कागजात चाहिन्छ?',
        'आकस्मिक एम्बुलेन्स र स्वास्थ्य सेवा कसरी पाउने?',
        'खाँडादेवी मन्दिर र पर्यटकीय स्थलहरू बारे बताउनुहोस्',
      ]
    : isBenighat
    ? [
        'बेनीघाट रोराङका १० वटै वडा अध्यक्षहरूको नाम र फोन नम्बर दिनुहोस्',
        'बेनिघाट रोराङ्ग गाउँपालिकाको राष्ट्रिय जनगणना २०७८ को विवरण दिनुहोस्',
        'गाउँपालिका अध्यक्ष र उपाध्यक्षको सम्पर्क विवरण के छ?',
        'नागरिकता सिफारिसका लागि के के कागजात चाहिन्छ?',
        'आकस्मिक एम्बुलेन्स सेवा र अस्पताल कहाँ उपलब्ध छ?',
      ]
    : [
        'नागरिकता सिफारिसका लागि के के कागजात चाहिन्छ?',
        'आकस्मिक एम्बुलेन्स र अस्पताल सेवा कहाँ उपलब्ध छ?',
        'पाँचपोखरी ताल पदयात्राका लागि उपयुक्त मौसम कुन हो?',
        'यस आर्थिक वर्षमा वडा ३ मा कस्ता सडक योजना छन्?',
        'अपाङ्गता परिचयपत्र वर्गीकरण र भत्ता कति छ?',
      ];

  const handleSpeak = (text: string) => {
    if (!('speechSynthesis' in window)) {
      alert('तपाईंको ब्राउजरमा आवाज सुविधा उपलब्ध छैन।');
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ne-NP';
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  };

  const handleExportChat = () => {
    const chatContent = messages
      .map(
        (m) =>
          `[${m.timestamp}] ${m.sender === 'user' ? 'नागरिक / प्रयोगकर्ता' : 'एआई डिजिटल सहायक'}:\n${m.text}\n${
            m.source ? `स्रोत: ${m.source}\n` : ''
          }`
      )
      .join('\n---\n\n');

    const blob = new Blob([chatContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `p5_ai_assistant_chat_${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSend = async (queryToSend?: string) => {
    const query = queryToSend || inputQuery;
    if (!query.trim() || isLoading) return;

    const userMsg: AiChatMessage = {
      id: 'u-' + Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const res = await aiApi.chat(query);
      const aiMsg: AiChatMessage = {
        id: 'ai-' + Date.now(),
        sender: 'ai',
        text: res.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: res.source || (res.sources ? res.sources.join(', ') : undefined),
        confidence: res.confidence || 'high',
        suggestedActions: res.suggestedActions,
        navigationUrl: res.navigationUrl,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      const errorMsg: AiChatMessage = {
        id: 'err-' + Date.now(),
        sender: 'ai',
        text: 'माफ गर्नुहोस्, हाल सर्भरसँग सम्पर्क हुन सकेन। कृपया केही समयपछि पुन: प्रयास गर्नुहोस्।',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'प्रणाली त्रुटि',
        confidence: 'low',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', height: 'calc(100vh - 120px)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Bot size={28} color="var(--primary)" />
            <span>डिजिटल ट्विन एआई सहायक (AI Twin Advisor)</span>
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            FastAPI RAG माइक्रो-सर्भिस, पालिका नीति निर्देशिका तथा वास्तविक तथ्याङ्क प्रमाणित स्मार्ट सहायक
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={handleExportChat}
            className="dt-btn dt-btn-outline"
            title="संवाद डाउनलोड गर्नुहोस्"
            style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}
          >
            <Download size={15} />
            <span>संवाद डाउनलोड</span>
          </button>
          <button
            onClick={() => setMessages([messages[0]])}
            className="dt-btn dt-btn-outline"
            title="कुराकानी खाली गर्नुहोस्"
            style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}
          >
            <Trash2 size={15} />
            <span>खाली गर्नुहोस्</span>
          </button>
        </div>
      </div>

      {/* Suggested Quick Prompts */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            className="dt-btn dt-btn-outline"
            style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem', borderRadius: '9999px', backgroundColor: '#ffffff' }}
          >
            <Sparkles size={12} color="var(--primary)" />
            <span>{prompt}</span>
          </button>
        ))}
      </div>

      {/* Chat Messages Log */}
      <div
        className="dt-card"
        style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          padding: '1.5rem',
        }}
      >
        {messages.map((m) => (
          <div
            key={m.id}
            style={{
              display: 'flex',
              gap: '0.75rem',
              maxWidth: m.sender === 'user' ? '75%' : '85%',
              alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            {m.sender === 'ai' && (
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary-light)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Bot size={20} />
              </div>
            )}

            <div
              style={{
                backgroundColor: m.sender === 'user' ? 'var(--primary)' : '#f8fafc',
                color: m.sender === 'user' ? '#ffffff' : 'var(--text-main)',
                border: m.sender === 'user' ? 'none' : '1px solid var(--border)',
                padding: '1rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.9rem',
                lineHeight: 1.6,
                boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.6rem',
              }}
            >
              <div style={{ whiteSpace: 'pre-line' }}>{m.text}</div>

              {/* Source & Confidence Badge for AI Messages */}
              {m.sender === 'ai' && m.source && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                    paddingTop: '0.5rem',
                    borderTop: '1px dashed #e2e8f0',
                    fontSize: '0.75rem',
                    color: '#64748b',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <BookOpen size={13} color="var(--primary)" />
                    <span>स्रोत: <strong>{m.source}</strong></span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span
                      style={{
                        padding: '0.15rem 0.45rem',
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        backgroundColor: m.confidence === 'high' ? '#dcfce7' : '#fef9c3',
                        color: m.confidence === 'high' ? '#15803d' : '#854d0e',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.2rem',
                      }}
                    >
                      <CheckCircle2 size={11} />
                      {m.confidence === 'high' ? 'उच्च विश्वसनीयता' : 'मध्यम विश्वसनीयता'}
                    </span>

                    <button
                      onClick={() => handleSpeak(m.text)}
                      title="आवाजमा सुन्नुहोस्"
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.2rem',
                        fontSize: '0.75rem',
                      }}
                    >
                      <Volume2 size={14} />
                      <span>सुन्नुहोस्</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Suggested Action Chips / Navigation */}
              {m.sender === 'ai' && (m.suggestedActions || m.navigationUrl) && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.25rem' }}>
                  {m.navigationUrl && (
                    <button
                      onClick={() => navigate(m.navigationUrl!)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        padding: '0.3rem 0.6rem',
                        borderRadius: '6px',
                        border: '1px solid var(--primary)',
                        backgroundColor: 'var(--primary-light)',
                        color: 'var(--primary)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      <ExternalLink size={12} />
                      <span>सम्बन्धित पोर्टल खोल्नुहोस्</span>
                    </button>
                  )}

                  {(m.suggestedActions || []).map((action, aIdx) => (
                    <button
                      key={aIdx}
                      onClick={() => handleSend(action)}
                      style={{
                        padding: '0.25rem 0.55rem',
                        borderRadius: '6px',
                        border: '1px solid #e2e8f0',
                        backgroundColor: '#ffffff',
                        color: '#475569',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                      }}
                    >
                      💡 {action}
                    </button>
                  ))}
                </div>
              )}

              <div
                style={{
                  fontSize: '0.7rem',
                  opacity: 0.6,
                  textAlign: 'right',
                }}
              >
                {m.timestamp}
              </div>
            </div>

            {m.sender === 'user' && (
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: '#cbd5e1',
                  color: '#334155',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <User size={20} />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div style={{ display: 'flex', gap: '0.75rem', alignSelf: 'flex-start' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bot size={20} />
            </div>
            <div style={{ backgroundColor: '#f1f5f9', padding: '0.85rem 1.15rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              एआई खोज्दैछ...
            </div>
          </div>
        )}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        style={{ display: 'flex', gap: '0.75rem' }}
      >
        <input
          type="text"
          className="dt-input"
          style={{ padding: '0.75rem 1rem', fontSize: '0.95rem' }}
          placeholder="तपाईंको प्रश्न यहाँ टाइप गर्नुहोस् (नेपाली वा अंग्रेजीमा)..."
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
        />
        <button
          type="submit"
          className="dt-btn dt-btn-primary"
          style={{ padding: '0.75rem 1.5rem' }}
          disabled={isLoading || !inputQuery.trim()}
        >
          <Send size={18} />
          <span>पठाउनुहोस्</span>
        </button>
      </form>
    </div>
  );
};

export default AiAssistantPage;
