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
import { useTenant } from '../../context/TenantContext';
import { getTenantId } from '../../api/client';
import { toNepaliDigits } from '../../utils/nepaliCalendar';
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
  const { settings, currentTenant } = useTenant();
  
  const effTenant = (currentTenant?.subdomain || getTenantId() || '').toLowerCase();
  const isGaushala = effTenant.includes('gaushala') || (settings?.palika_name || '').includes('गौशाला');
  const isKhadadevi = !isGaushala && (effTenant.includes('khadadevi') || effTenant.includes('khandadevi') || (settings?.palika_name || '').includes('खाँडादेवी') || (settings?.palika_name || '').includes('खाडादेवी'));
  const isBenighat = !isGaushala && !isKhadadevi && (effTenant.includes('benighat') || (settings?.palika_name || '').includes('बेनिघाट'));
  
  const palikaName = isGaushala
    ? (settings?.palika_name || 'गौशाला नगरपालिका')
    : isKhadadevi
      ? (settings?.palika_name || 'खाँडादेवी गाउँपालिका')
      : isBenighat 
        ? (settings?.palika_name || 'बेनिघाट रोराङ्ग गाउँपालिका') 
        : (settings?.palika_name || currentTenant?.name_np || 'पाँचपोखरी थाङपाल गाउँपालिका');
  
  const totalWards = isGaushala ? 12 : (isKhadadevi ? 9 : (isBenighat ? 10 : (settings?.total_wards || 8)));
  const totalPopulation = isGaushala ? '७२,४८१' : (isKhadadevi ? '१९,३१२' : (isBenighat ? '३३,८५४' : '२०,५४०'));
  const totalHouseholds = isGaushala ? '१४,४४६' : (isKhadadevi ? '५,५०१' : (isBenighat ? '७,६०१' : '५,८०५'));
  const annualBudget = isGaushala ? 'रू. ७४.५० करोड' : (isKhadadevi ? 'रू. ४८.६० करोड' : (isBenighat ? 'रू. ७२.४० करोड' : 'रू. ५७.६८ करोड'));
  const activeProjects = isGaushala ? '१९२' : (isKhadadevi ? '१३८' : (isBenighat ? '१८४' : '१५६'));

  const [messages, setMessages] = useState<ChatMessage[]>([]);
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

  // Set initial welcome message depending on active tenant
  useEffect(() => {
    setMessages([
      {
        id: 'init',
        sender: 'ai',
        text: isGaushala
          ? `नमस्कार! म **गौशाला नगरपालिका** को आधिकारिक **एआई डिजिटल सहायक (AI Copilot)** हुँ। 

मलाई नगरपालिकाको १२ वटै वडा तथा वडा अध्यक्षहरू, फोन तथा आधिकारिक इमेल, बजेट तथा विकास योजनाहरू, एभरेष्ट सुगर मिल तथा उखु खेती, नागरिकता तथा सिफारिस, अनलाइन नक्सापास (e-BPS), २४ घण्टा आकस्मिक एम्बुलेन्स सेवा वा गौशाला बजार तथा सांस्कृतिक सम्पदा बारे सोध्न सक्नुहुन्छ।`
          : isKhadadevi
          ? `नमस्कार! म **खाँडादेवी गाउँपालिका** को आधिकारिक **एआई डिजिटल सहायक (AI Copilot)** हुँ। 

मलाई पालिकाको ९ वटै वडा तथा वडा अध्यक्षहरू, बजेट र १३८ चालु विकास योजनाहरू, नागरिकता तथा सिफारिस, अनलाइन नक्सापास (e-BPS), २४ घण्टा आकस्मिक एम्बुलेन्स सेवा वा खाँडादेवी मन्दिर तथा धार्मिक पर्यटन बारे सोध्न सक्नुहुन्छ।`
          : isBenighat
            ? `नमस्कार! म **बेनिघाट रोराङ्ग गाउँपालिका** को आधिकारिक **एआई डिजिटल सहायक (AI Copilot)** हुँ। 

मलाई पालिकाको १० वटै वडा तथा वडा अध्यक्षहरू, बजेट र विकास योजनाहरू, नागरिकता तथा सिफारिस, अनलाइन नक्सापास (e-BPS), २४ घण्टा राजमार्ग आकस्मिक एम्बुलेन्स सेवा वा त्रिशूली जलपर्यटन बारे सोध्न सक्नुहुन्छ।`
            : `नमस्कार! म **पाँचपोखरी थाङपाल गाउँपालिका** को आधिकारिक **एआई डिजिटल सहायक (AI Copilot)** हुँ। 

मलाई पालिकाको बजेट, १५६ चालु योजनाहरू, नागरिकता तथा सिफारिस, अनलाइन नक्सापास (e-BPS), २४ घण्टा आकस्मिक एम्बुलेन्स सेवा वा पाँचपोखरी कुण्ड पदयात्रा बारे सोध्न सक्नुहुन्छ।`,
        sources: [
          isGaushala
            ? 'गौशाला नगरपालिका डिजिटल ट्विन डाटाबेस'
            : isKhadadevi 
              ? 'खाँडादेवी गाउँपालिका डिजिटल ट्विन डाटाबेस' 
              : isBenighat 
                ? 'बेनिघाट रोराङ्ग गाउँपालिका डिजिटल ट्विन डाटाबेस' 
                : 'पाँचपोखरी थाङपाल गाउँपालिका डिजिटल ट्विन डाटाबेस'
        ],
        actions: isGaushala
          ? ['१२ वटै वडा विवरण', 'जनप्रतिनिधि सूची', 'नागरिक बडापत्र']
          : isKhadadevi
            ? ['९ वटै वडा विवरण', 'जनप्रतिनिधि सूची', 'नागरिक बडापत्र']
            : isBenighat 
              ? ['१० वटै वडा विवरण', 'जनप्रतिनिधि सूची', 'नागरिक बडापत्र'] 
              : ['नागरिक बडापत्र हेर्नुहोस्', 'डिजिटल प्रोफाइल', 'अनलाइन सिफारिस'],
        navigationUrl: '/badapatra',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  }, [isGaushala, isKhadadevi, isBenighat]);

  // Fetch history from backend with tenant header
  const fetchHistory = async () => {
    try {
      const activeTenant = isGaushala ? 'gaushala' : (isKhadadevi ? 'khadadevi' : (isBenighat ? 'benighatrorang' : effTenant));
      const res = await fetch(`/api/v1/ai-assistant/logs/?tenant_id=${encodeURIComponent(activeTenant)}`, {
        headers: {
          'X-Tenant-Id': activeTenant
        }
      });
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
  }, [messages, effTenant, isGaushala, isKhadadevi]);

  const quickPrompts = isGaushala
    ? [
        { label: '🏛️ १२ वडा र अध्यक्षहरूको इमेल/फोन', query: 'गौशाला नगरपालिकाका १२ वटै वडा अध्यक्ष, फोन र आधिकारिक इमेलको पूर्ण विवरण दिनुहोस्' },
        { label: '👥 नगर प्रमुख र उपप्रमुख सम्पर्क', query: 'नगर प्रमुख डा. दिपेन्द्र महतो (९८५४०२९१५८) र उपप्रमुख रेनु कुमारी महतोको सम्पर्क र कार्यालय विवरण दिनुहोस्' },
        { label: '📊 राष्ट्रिय जनगणना २०७८', query: 'गौशाला नगरपालिकाको राष्ट्रिय जनगणना २०७८ अनुसार जनसंख्या (७२,४८१), घरधुरी (१४,४४६) र जातजातिको विवरण दिनुहोस्' },
        { label: '🏭 एभरेष्ट सुगर मिल र उखु पकेट', query: 'एभरेष्ट सुगर एण्ड केमिकल इन्डस्ट्रिज, उखु किसान सहुलियत र कृषि पकेट क्षेत्र बारे बताउनुहोस्' },
        { label: '📜 नागरिकता तथा वडा सिफारिस', query: 'नागरिकता सिफारिस र व्यक्तिगत घटना दर्ताका लागि के के कागजात चाहिन्छ?' },
        { label: '🚑 २४/७ नगर एम्बुलेन्स सेवा', query: 'गौशाला नगरपालिकाको आकस्मिक एम्बुलेन्स सेवा (१०२ / ९८५४०२९१५८) र स्वास्थ्य केन्द्रहरूको सम्पर्क के छ?' },
        { label: '💰 बजेट र विकास योजनाहरू', query: 'गौशाला नगरपालिकाको वार्षिक बजेट र चालु विकास योजनाहरू कति छन्?' },
        { label: '🏗️ नक्सापास (e-BPS)', query: 'गौशाला नगरमा घर निर्माण गर्न अनलाइन नक्सापास (e-BPS) कसरी गर्ने?' },
      ]
    : isKhadadevi
    ? [
        { label: '🏛️ पालिका परिचय र ९ वडाहरू', query: 'खाँडादेवी गाउँपालिकाको परिचय र ९ वटै वडाको विवरण दिनुहोस्' },
        { label: '👥 गाउँपालिका अध्यक्ष र उपाध्यक्ष', query: 'गाउँपालिका अध्यक्ष ज्ञानकुमार श्रेष्ठ र उपाध्यक्ष रमा घिसिङको सम्पर्क र कार्यालय विवरण दिनुहोस्' },
        { label: '📊 राष्ट्रिय जनगणना २०७८', query: 'खाँडादेवी गाउँपालिकाको राष्ट्रिय जनगणना २०७८ अनुसार जनसंख्या, घरधुरी र जातजातिको विवरण दिनुहोस्' },
        { label: '📜 नागरिकता सिफारिस प्रक्रिया', query: 'नागरिकता सिफारिसका लागि के के कागजात चाहिन्छ?' },
        { label: '🚑 २४/७ एम्बुलेन्स सेवा', query: 'आकस्मिक एम्बुलेन्स सेवा र स्वास्थ्य चौकीहरूको सम्पर्क के छ?' },
        { label: '💰 बजेट र १३८ योजनाहरू', query: 'आर्थिक वर्ष २०८१/८२ को बजेट र विकास योजनाहरू कति छन्?' },
        { label: '🛕 खाँडादेवी मन्दिर र पर्यटन', query: 'खाँडादेवी मन्दिर, विश्वामित्र गुफा र पर्यटकीय स्थलहरू बारे बताउनुहोस्' },
        { label: '🏗️ नक्सापास (e-BPS)', query: 'घर निर्माण गर्न अनलाइन नक्सापास (e-BPS) कसरी गर्ने?' },
      ]
    : isBenighat
    ? [
        { label: '🏛️ १० वटै वडा र अध्यक्षहरू', query: 'बेनीघाट रोराङका १० वटै वडा अध्यक्षहरूको नाम र फोन नम्बर दिनुहोस्' },
        { label: '👥 गाउँपालिका अध्यक्ष र उपाध्यक्ष', query: 'गाउँपालिका अध्यक्ष कृष्ण बहादुर थपलिया (विवेक) र उपाध्यक्ष टाप बहादुर श्रेष्ठको सम्पर्क र कार्यालय विवरण दिनुहोस्' },
        { label: '📊 राष्ट्रिय जनगणना २०७८', query: 'बेनिघाट रोराङ्ग गाउँपालिकाको राष्ट्रिय जनगणना २०७८ अनुसार जनसंख्या, घरधुरी र जातजातिको विवरण दिनुहोस्' },
        { label: '📜 नागरिकता सिफारिस प्रक्रिया', query: 'नागरिकता सिफारिसका लागि के के कागजात चाहिन्छ?' },
        { label: '🚑 २४/७ राजमार्ग एम्बुलेन्स सेवा', query: 'आकस्मिक एम्बुलेन्स सेवा र विशालटार स्वास्थ्य केन्द्रको सम्पर्क के छ?' },
        { label: '💰 बजेट र १८४ योजनाहरू', query: 'आर्थिक वर्ष २०८१/८२ को बजेट र विकास योजनाहरू कति छन्?' },
        { label: '🚣 त्रिशूली र्‍याफ्टिङ र पर्यटन', query: 'त्रिशूली नदी र्‍याफ्टिङ, मलेखु माछा र चेपाङ सम्पदा बारे बताउनुहोस्' },
        { label: '🏗️ नक्सापास (e-BPS)', query: 'घर निर्माण गर्न अनलाइन नक्सापास (e-BPS) कसरी गर्ने?' },
      ]
    : [
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
      const activeTenant = isGaushala ? 'gaushala' : (isKhadadevi ? 'khadadevi' : (isBenighat ? 'benighatrorang' : (effTenant || 'panchpokhari')));
      const res = await fetch('/api/v1/ai-assistant/chat/', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Tenant-Id': activeTenant
        },
        body: JSON.stringify({ prompt: textToSend, user_id: 'admin_123', tenant_id: activeTenant })
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
          text: `नमस्ते! नयाँ च्याट सुरु भएको छ। मलाई ${palikaName} सम्बन्धी कुनै पनि जिज्ञासा सोध्नुहोस्।`,
          sources: [`${palikaName} आधिकारिक डिजिटल ट्विन डाटाबेस`],
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
    link.download = `${effTenant}_ai_chat_${Date.now()}.txt`;
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
        return <strong key={pIdx} className="msg-highlight">{part.slice(2, -2)}</strong>;
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
          <span>{palikaName} • प्रशिक्षित एआई ज्ञान भण्डार (RAG Engine v2.4)</span>
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
              <Building2 size={14} /> {palikaName} तथ्य (SSoT)
            </h4>
            <div className="facts-grid">
              <div className="fact-item">
                <span className="fact-val">{totalPopulation}</span>
                <span className="fact-lbl">कुल जनसंख्या</span>
              </div>
              <div className="fact-item">
                <span className="fact-val">{totalHouseholds}</span>
                <span className="fact-lbl">घरधुरी</span>
              </div>
              <div className="fact-item">
                <span className="fact-val">{toNepaliDigits(totalWards)} वटा</span>
                <span className="fact-lbl">वडाहरू</span>
              </div>
              <div className="fact-item">
                <span className="fact-val">{toNepaliDigits(activeProjects)}</span>
                <span className="fact-lbl">चालु योजना</span>
              </div>
              <div className="fact-item full">
                <span className="fact-val">{annualBudget}</span>
                <span className="fact-lbl">वार्षिक बजेट (आ.व. २०८१/८२)</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── MAIN CHAT VIEW ── */}
        <div className="ai-chat-area">
          <div className="ai-messages">
            {messages.map(msg => (
              <div key={msg.id} className={`msg-wrapper ${msg.sender === 'user' ? 'msg-wrapper-user' : 'msg-wrapper-ai'}`}>
                <div className="msg-avatar">
                  {msg.sender === 'user' ? <User size={18} /> : <Bot size={18} />}
                </div>

                <div className={`msg-bubble ${msg.sender === 'user' ? 'msg-user' : 'msg-ai'}`}>
                  {/* Message formatted body */}
                  <div className="message-text">
                    {renderFormattedText(msg.text)}
                  </div>

                  {/* Sources tag */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="msg-sources-tag">
                      <span className="sources-title">
                        <FileText size={12} /> स्रोत:
                      </span>
                      {msg.sources.map((src, sIdx) => (
                        <span key={sIdx} className="source-badge">
                          {src}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Suggested Quick Actions */}
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="msg-actions-container">
                      {msg.actions.map((act, aIdx) => (
                        <button
                          key={aIdx}
                          className="msg-action-btn"
                          onClick={() => {
                            if (msg.navigationUrl) navigate(msg.navigationUrl);
                            else sendMessage(act);
                          }}
                        >
                          <ExternalLink size={12} /> {act}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Bubble Footer: Timestamp & Audio controls */}
                  <div className="msg-footer">
                    <span className="timestamp-text">{msg.timestamp}</span>

                    <div className="msg-tools">
                      <button
                        className="tool-icon-btn"
                        onClick={() => handleCopy(msg.id, msg.text)}
                        title="प्रतिलिपि गर्नुहोस्"
                      >
                        {copiedId === msg.id ? <Check size={13} style={{ color: '#48bb78' }} /> : <Copy size={13} />}
                      </button>
                      <button
                        className="tool-icon-btn"
                        onClick={() => handleSpeak(msg.text)}
                        title="आवाजमा सुन्नुहोस् (Listen Speech)"
                      >
                        <Volume2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Typing status indicator */}
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
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* ── CHAT INPUT COMPONENT ── */}
          <div className="ai-input-area">
            <form
              onSubmit={e => {
                e.preventDefault();
                sendMessage();
              }}
              className="ai-input-form"
            >
              <input
                type="text"
                placeholder={isGaushala
                  ? "गौशालाका १२ वटै वडा, जनप्रतिनिधि, एभरेष्ट सुगर मिल, नागरिक सेवा, बजेट वा योजना बारे सोध्नुहोस्..."
                  : isKhadadevi
                  ? "खाँडादेवीका ९ वटै वडा, जनप्रतिनिधि, नागरिक सेवा, बजेट, योजना वा मन्दिर पर्यटन बारे सोध्नुहोस्..."
                  : isBenighat 
                  ? "बेनिघाट रोराङ्गका १० वटै वडा, जनप्रतिनिधि, नागरिक सेवा, बजेट वा योजना बारे सोध्नुहोस्..." 
                  : "पालिकाको बजेट, सेवा, सिफारिस, एम्बुलेन्स, वडा वा पर्यटन सम्बन्धी प्रश्न सोध्नुहोस्..."}
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                disabled={isTyping}
                className="ai-input"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isTyping}
                className="ai-send-btn"
                title="पठाउनुहोस् (Send)"
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
