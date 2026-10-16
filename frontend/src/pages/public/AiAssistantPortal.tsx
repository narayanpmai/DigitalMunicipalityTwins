import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bot, 
  User, 
  Send, 
  Sparkles, 
  RotateCcw, 
  Download, 
  Volume2, 
  Copy, 
  ExternalLink, 
  Check, 
  History,
  Building2,
  FileText,
  Ambulance,
  TrendingUp,
  Mountain,
  Layers,
  Sprout,
  Users
} from 'lucide-react';
import './AiAssistantPortal.css';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  sources?: string[];
  actions?: string[];
  navigationUrl?: string;
  confidence?: string;
  timestamp?: string;
}

interface PromptLog {
  id: string;
  user_prompt: string;
  ai_response: string;
  timestamp: string;
}

export default function AiAssistantPortal() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init',
      sender: 'ai',
      text: `नमस्कार! म **पाँचपोखरी थाङपाल गाउँपालिका** को आधिकारिक **एआई डिजिटल सहायक (AI Copilot)** हुँ। 

मलाई पालिकाको बजेट, १५६ चालु योजनाहरू, नागरिकता तथा सिफारिस, अनलाइन नक्सापास (e-BPS), २४ घण्टा आकस्मिक एम्बुलेन्स सेवा वा पाँचपोखरी कुण्ड पदयात्रा बारे सोध्न सक्नुहुन्छ।`,
      sources: ['पाँचपोखरी थाङपाल गाउँपालिका डिजिटल ट्विन डाटाबेस'],
      actions: ['नागरिक बडापत्र हेर्नुहोस्', 'डिजिटल प्रोफाइल', 'अनलाइन सिफारिस'],
      navigationUrl: '/badapatra',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [history, setHistory] = useState<PromptLog[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Fetch history from backend
  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/v1/ai-assistant/logs/');
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (error) {
      console.error('Error fetching AI prompt history:', error);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [messages]);

  const quickPrompts = [
    { label: '🏛️ पालिका परिचय र ८ वडाहरू', query: 'पाँचपोखरी थाङपाल गाउँपालिकाको परिचय र ८ वटै वडाको विवरण दिनुहोस्' },
    { label: '📜 नागरिकता सिफारिस प्रक्रिया', query: 'नागरिकता सिफारिसका लागि के के कागजात चाहिन्छ?' },
    { label: '🚑 २४/७ एम्बुलेन्स तथा स्वास्थ्य', query: 'आकस्मिक एम्बुलेन्स सेवा र अस्पताल कहाँ उपलब्ध छ?' },
    { label: '💰 बजेट र १५६ योजनाहरू', query: 'आर्थिक वर्ष २०८१/८२ को बजेट र विकास योजनाहरू कति छन्?' },
    { label: '🏔️ पाँचपोखरी कुण्ड पदयात्रा', query: 'पाँचपोखरी कुण्ड पदयात्रा र उपयुक्त मौसम कुन हो?' },
    { label: '🏗️ नक्सापास (e-BPS)', query: 'घर निर्माण गर्न अनलाइन नक्सापास (e-BPS) कसरी गर्ने?' },
    { label: '🌾 कृषि अनुदान र मल/बीउ', query: 'कृषक अनुदान र मल बीउबिजन वितरण प्रक्रिया के छ?' },
    { label: '👶 जन्म/मृत्यु/विवाह दर्ता', query: 'जन्म दर्ता र विवाह दर्ता गर्ने प्रक्रिया र समयसीमा के छ?' }
  ];

  const sendMessage = async (queryToSend?: string) => {
    const textToSend = queryToSend || inputValue;
    if (!textToSend.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: 'u-' + Date.now(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!queryToSend) setInputValue('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/v1/ai-assistant/chat/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: textToSend, user_id: 'admin_123' })
      });

      if (res.ok) {
        const data = await res.json();
        const aiMsg: ChatMessage = {
          id: 'ai-' + Date.now(),
          sender: 'ai',
          text: data.reply || data.answer,
          sources: data.sources,
          actions: data.actions,
          navigationUrl: data.navigationUrl,
          confidence: data.confidence || 'high',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, aiMsg]);
      } else {
        throw new Error('Server returned non-200');
      }
    } catch (error) {
      setMessages(prev => [
        ...prev,
        {
          id: 'err-' + Date.now(),
          sender: 'ai',
          text: 'माफ गर्नुहोला, सर्भरसँग सम्पर्क हुन सकेन। कृपया केही समयपछि पुनः प्रयास गर्नुहोस्।',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSpeak = (text: string) => {
    if (!('speechSynthesis' in window)) {
      alert('तपाईंको ब्राउजरमा बोली आवाज (Text-to-Speech) सुविधा उपलब्ध छैन।');
      return;
    }
    window.speechSynthesis.cancel();
    // Strip markdown formatting for cleaner speech
    const cleanText = text.replace(/[*#•_-]/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'ne-NP';
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    if (window.confirm('के तपाईं हालको च्याट कुराकानी सफा गर्न चाहनुहुन्छ?')) {
      setMessages([
        {
          id: 'init-fresh',
          sender: 'ai',
          text: 'नमस्ते! नयाँ च्याट सुरु भएको छ। मलाई पाँचपोखरी थाङपाल गाउँपालिका सम्बन्धी कुनै पनि जिज्ञासा सोध्नुहोस्।',
          sources: ['पाँचपोखरी थाङपाल गाउँपालिका आधिकारिक डिजिटल ट्विन डाटाबेस'],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  };

  const handleExportChat = () => {
    const chatContent = messages
      .map(
        m =>
          `[${m.timestamp || ''}] ${m.sender === 'user' ? 'प्रयोगकर्ता / नागरिक' : 'एआई डिजिटल सहायक'}:\n${m.text}\n${
            m.sources && m.sources.length > 0 ? `स्रोत: ${m.sources.join(', ')}\n` : ''
          }`
      )
      .join('\n---\n\n');

    const blob = new Blob([chatContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `panchpokhari_ai_chat_${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const renderFormattedText = (text: string) => {
    const lines = text.split('\n');
    return (
      <div className="msg-content-wrapper">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={idx} style={{ height: '0.4rem' }} />;

          // Bold Header matching **...**
          const boldMatch = trimmed.match(/^\*\*(.*?)\*\*(.*)$/);
          if (boldMatch) {
            return (
              <p key={idx} className="msg-header-line">
                <strong>{boldMatch[1]}</strong>
                {boldMatch[2]}
              </p>
            );
          }

          // Bullet list items
          if (trimmed.startsWith('•') || trimmed.startsWith('-')) {
            return (
              <div key={idx} className="msg-bullet-line">
                <span className="bullet-dot">•</span>
                <span>{renderInlineFormatting(trimmed.substring(1).trim())}</span>
              </div>
            );
          }

          // Numbered list items
          const numMatch = trimmed.match(/^([०-९\d]+[.)])\s*(.*)$/);
          if (numMatch) {
            return (
              <div key={idx} className="msg-num-line">
                <span className="num-prefix">{numMatch[1]}</span>
                <span>{renderInlineFormatting(numMatch[2])}</span>
              </div>
            );
          }

          return <p key={idx} className="msg-para-line">{renderInlineFormatting(trimmed)}</p>;
        })}
      </div>
    );
  };

  const renderInlineFormatting = (str: string) => {
    const parts = str.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, pIdx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={pIdx} style={{ color: '#fbd38d' }}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="ai-container">
      {/* ── TOP HEADER ── */}
      <div className="ai-header">
        <div className="ai-header-badge">
          <span className="live-indicator-dot" />
          <span>पाँचपोखरी थाङपाल गाउँपालिका • प्रशिक्षित एआई ज्ञान भण्डार (RAG Engine v2.4)</span>
        </div>
        <h1>AI Digital Assistant (NLP)</h1>
        <p>गाउँपालिकाको आधिकारिक डिजिटल ट्विन डाटाबेस (Single Source of Truth) सँग जोडिएको स्मार्ट च्याटबोट</p>
      </div>

      {/* ── QUICK PROMPT CHIPS ── */}
      <div className="quick-prompts-bar">
        <span className="quick-prompt-label">
          <Sparkles size={14} style={{ color: '#ed8936' }} /> द्रुत प्रश्नहरू:
        </span>
        <div className="quick-prompt-scroll">
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              className="quick-chip"
              onClick={() => sendMessage(p.query)}
              disabled={isTyping}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="ai-layout">
        {/* ── SIDEBAR: HISTORY & CONTROLS ── */}
        <div className="ai-sidebar">
          <div className="sidebar-top-actions">
            <button className="sidebar-action-btn primary" onClick={handleClearChat} title="नयाँ च्याट सुरु गर्नुहोस्">
              <RotateCcw size={14} /> नयाँ च्याट
            </button>
            <button className="sidebar-action-btn" onClick={handleExportChat} title="कुराकानी डाउनलोड गर्नुहोस्">
              <Download size={14} /> डाउनलोड
            </button>
          </div>

          <h3>
            <History size={16} /> तपाईँका अघिल्ला प्रश्नहरू
          </h3>
          <ul className="ai-history-list">
            {history.map(log => (
              <li
                key={log.id}
                className="ai-history-item"
                onClick={() => sendMessage(log.user_prompt)}
                title="यो प्रश्न पुनः सोध्नुहोस्"
              >
                <div className="history-prompt-text">
                  📝 {log.user_prompt?.length > 32 ? log.user_prompt.substring(0, 32) + '...' : log.user_prompt}
                </div>
              </li>
            ))}
            {history.length === 0 && (
              <li style={{ color: '#718096', fontSize: '0.85rem', padding: '0.75rem' }}>
                कुनै अघिल्ला प्रश्न भेटिएन।
              </li>
            )}
          </ul>

          {/* PALIKA QUICK FACTS WIDGET */}
          <div className="palika-facts-card">
            <h4>
              <Building2 size={14} /> पाँचपोखरी तथ्य (SSoT)
            </h4>
            <div className="facts-grid">
              <div className="fact-item">
                <span className="fact-val">२०,५४०</span>
                <span className="fact-lbl">कुल जनसंख्या</span>
              </div>
              <div className="fact-item">
                <span className="fact-val">५,८०५</span>
                <span className="fact-lbl">घरधुरी</span>
              </div>
              <div className="fact-item">
                <span className="fact-val">८ वटा</span>
                <span className="fact-lbl">वडाहरू</span>
              </div>
              <div className="fact-item">
                <span className="fact-val">१५६</span>
                <span className="fact-lbl">चालु योजना</span>
              </div>
              <div className="fact-item full">
                <span className="fact-val">रू. ५७.६८ करोड</span>
                <span className="fact-lbl">वार्षिक बजेट (आ.व. २०८१/८२)</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── MAIN CHAT AREA ── */}
        <div className="ai-chat-area">
          <div className="ai-messages">
            {messages.map(m => (
              <div key={m.id} className={`msg-wrapper ${m.sender === 'user' ? 'msg-wrapper-user' : 'msg-wrapper-ai'}`}>
                <div className="msg-avatar">
                  {m.sender === 'user' ? <User size={16} /> : <Bot size={18} />}
                </div>

                <div className={`msg-bubble ${m.sender === 'user' ? 'msg-user' : 'msg-ai'}`}>
                  {m.sender === 'ai' ? renderFormattedText(m.text) : <p>{m.text}</p>}

                  {/* Sources tag for AI */}
                  {m.sources && m.sources.length > 0 && (
                    <div className="msg-sources-tag">
                      📚 स्रोत: {m.sources.join(' • ')}
                    </div>
                  )}

                  {/* Suggested Action buttons */}
                  {m.actions && m.actions.length > 0 && (
                    <div className="msg-actions-container">
                      {m.actions.map((act, aIdx) => (
                        <button
                          key={aIdx}
                          className="msg-action-btn"
                          onClick={() => {
                            if (m.navigationUrl) navigate(m.navigationUrl);
                            else navigate('/badapatra');
                          }}
                        >
                          <ExternalLink size={12} /> {act}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Message Footer with speak and copy */}
                  <div className="msg-footer">
                    <span className="msg-timestamp">{m.timestamp}</span>
                    {m.sender === 'ai' && (
                      <div className="msg-tools">
                        <button
                          className="tool-icon-btn"
                          onClick={() => handleSpeak(m.text)}
                          title="आवाजमा सुन्नुहोस्"
                        >
                          <Volume2 size={13} />
                        </button>
                        <button
                          className="tool-icon-btn"
                          onClick={() => handleCopy(m.id, m.text)}
                          title="प्रतिलिपि गर्नुहोस्"
                        >
                          {copiedId === m.id ? <Check size={13} style={{ color: '#48bb78' }} /> : <Copy size={13} />}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="msg-wrapper msg-wrapper-ai">
                <div className="msg-avatar">
                  <Bot size={18} />
                </div>
                <div className="msg-bubble msg-ai typing-bubble">
                  <div className="typing-dots">
                    <span />
                    <span />
                    <span />
                  </div>
                  <span style={{ fontSize: '0.85rem', color: '#cbd5e0' }}>
                    पाँचपोखरी डिजिटल डाटाबेसमा उत्तर खोज्दैछ...
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* ── INPUT AREA ── */}
          <form className="ai-input-area" onSubmit={e => { e.preventDefault(); sendMessage(); }}>
            <input
              type="text"
              className="ai-input"
              placeholder="बजेट, सिफारिस, नक्सापास वा पाँचपोखरी बारे सोध्नुहोस्..."
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              disabled={isTyping}
              autoFocus
            />
            <button
              type="submit"
              className="ai-send-btn"
              disabled={isTyping || !inputValue.trim()}
              title="पठाउनुहोस्"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
