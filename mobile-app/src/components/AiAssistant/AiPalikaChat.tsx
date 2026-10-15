import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Mic,
  MicOff,
  Volume2,
  X,
  Sparkles,
  ChevronRight,
  ExternalLink,
  RotateCcw,
  User,
  CheckCircle2,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  actionButton?: {
    label: string;
    tab: 'charter' | 'sifarish' | 'scanner' | 'survey' | 'elibrary' | 'more' | 'tourism-twin' | 'cultural-museum';
  };
}

interface AiPalikaChatProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: any) => void;
}

export const AiPalikaChat: React.FC<AiPalikaChatProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-0',
      sender: 'ai',
      text: 'नमस्ते! म डिजिपालिका (DigiPalika) को आधिकारिक AI नागरिक सहायक हुँ। म तपाईंलाई नागरिक बडापत्र, ई-सिफारिस, स्थानीय कर, योजना, पर्यटन तथा सम्पदा डिजिटल ट्विन र सांस्कृतिक सङ्ग्रहालय सम्बन्धी कुनै पनि जानकारी दिन सक्छु। मलाई केही सोध्नुहोस्!',
      timestamp: 'अहिले',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  // Suggested Quick Prompts
  const quickPrompts = [
    'पाँचपोखरी पर्यटन तथा सम्पदा डिजिटल ट्विन',
    'ह्योल्मो सांस्कृतिक सङ्ग्रहालय र पुरातात्विक वस्तुहरू',
    'नाता प्रमाणित गर्न के-के कागजात चाहिन्छ?',
    'भत्ता e-KYC नवीकरण कसरी गर्ने?',
    'फोहोर संकलन गाडी कहिले आउँछ?',
    'नदीको जलसतह र बाढीको अवस्था के छ?',
    'न्यायिक समितिमा उजुरी कसरी दिने?',
  ];

  // Smart Knowledge Answer Engine (Offline RAG / Semantic Rule Engine)
  const getSmartAiReply = (query: string): { reply: string; action?: ChatMessage['actionButton'] } => {
    const q = query.toLowerCase();

    // 0A. Tourism & Heritage Digital Twin (पर्यटन, सम्पदा, पाँचपोखरी, आमायाङ्ग्री, कुण्ड, पदमार्ग, ट्रेकिङ, डिजिटल ट्विन)
    if (q.includes('पर्यटन') || q.includes('ट्विन') || q.includes('सम्पदा') || q.includes('ट्रेक') || q.includes('पदमार्ग') || q.includes('आमायाङ्ग्री') || q.includes('कुण्ड') || (q.includes('पाँचपोखरी') && !q.includes('लोगो'))) {
      return {
        reply: `🏔️ पाँचपोखरी पर्यटन तथा सम्पदा डिजिटल ट्विन (Panchpokhari Tourism & Heritage Twin):
• पाँचपोखरी पावन ५ कुण्डहरू (भैरव, सरस्वती, सूर्य, गणेश, तारा): समुन्द्री सतहबाट ४,१०० मिटर उचाइमा अवस्थित, जनैपूर्णिमा महामेला तथा ३६०° पदमार्ग।
• आमायाङ्ग्री चुचुरो (३,७७१ मी.): हेलम्बु तथा लाङटाङ हिमशृङ्खलाको अद्वितीय सूर्योदय दृश्यावलोकन।
• तार्केघ्याङ प्राचीन गुम्बा: ३०० वर्ष पुरानो बौद्ध परम्परा र गुरु पद्मसम्भव तपोभूमि।
• ३D डिजिटल ट्विन वेब पोर्टल: http://localhost:8080/app/library (तथा /app/tourism) मा पूर्ण ३D मोडल, पदमार्ग GIS र अडियो गाइड उपलब्ध छ।`,
        action: { label: 'पर्यटन तथा सम्पदा डिजिटल ट्विन खोल्नुहोस्', tab: 'tourism-twin' },
      };
    }

    // 0B. Cultural Museum (सांस्कृतिक सङ्ग्रहालय, ह्योल्मो, तामाङ, मूर्ति, थाङ्का, अष्टधातु, प्रज्ञापारमिता, भेषभूषा)
    if (q.includes('सङ्ग्रहालय') || q.includes('संग्रहालय') || q.includes('ह्योल्मो') || q.includes('म्युजियम') || q.includes('मूर्ति') || q.includes('थाङ्का') || q.includes('प्रज्ञापारमिता') || q.includes('भेषभूषा')) {
      return {
        reply: `🏛️ पाँचपोखरी सांस्कृतिक सङ्ग्रहालय (Hyolmo & Tamang Cultural Museum):
• गुरु पद्मसम्भव अष्टधातु मूर्ति: १७औँ शताब्दीको बहुमूल्य पुरातात्विक धातु मूर्ति (वडा नं ३ भोताङ)।
• सुनौलो मसीले लिखित प्रज्ञापारमिता ग्रन्थ: १८औँ शताब्दीको तिब्बती हस्तलिखित पाण्डुलिपि।
• ह्योल्मो मौलिक बाजा (ग्यालिङ, डुङ्छेन) र महिला मौलिक भेषभूषा (स्यामा, चाँदीको गाउ)।
• सांस्कृतिक सङ्ग्रहालय ३D पोर्टल: http://localhost:8080/app/museum मा थ्रीडी अन्तरक्रियात्मक दृश्य तथा अडियो गाइड उपलब्ध छ।`,
        action: { label: 'सांस्कृतिक सङ्ग्रहालय खोल्नुहोस्', tab: 'cultural-museum' },
      };
    }

    // 1. Sifarish: Relationship verification (नाता प्रमाणित)
    if (q.includes('नाता प्रमाणित') || q.includes('नाता')) {
      return {
        reply: `नाता प्रमाणित सिफारिसका लागि निम्न कागजातहरू आवश्यक पर्दछ:
१. सम्बन्धित व्यक्तिहरूको सक्कल नेपाली नागरिकता प्रमाणपत्र प्रतिलिपि
२. नाता खुल्ने जन्मदर्ता वा विवाह दर्ता प्रमाणपत्र
३. स्थानीय सर्जमिन मुचुल्का (वडाबाट)
४. पासपोर्ट साइजको फोटो २/२ प्रति
• लाग्ने दस्तुर: रु. ५००/-
• लाग्ने समय: सोही दिन (अधिकतम १ दिन)`,
        action: { label: 'नाता प्रमाणित ई-सिफारिस फारम खोल्नुहोस्', tab: 'sifarish' },
      };
    }

    // 2. Social Security Allowance e-KYC (भत्ता, ज्येष्ठ नागरिक, अपाङ्गता, e-KYC)
    if (q.includes('भत्ता') || q.includes('kyc') || q.includes('ज्येष्ठ') || q.includes('नवीकरण') || q.includes('एकल महिला')) {
      return {
        reply: `सामाजिक सुरक्षा भत्ता e-KYC घरमै बसेर मोबाइल क्यामेराबाट गर्न सकिन्छ:
१. 'थप सेवा' ट्याबमा गई 'भत्ता e-KYC' छान्नुहोस्।
२. लाभग्राहीको विवरण छान्नुहोस्।
३. क्यामेरा अगाडि अनुहार राखेर 'फेस प्रमाणीकरण' बटन थिच्नुहोस्।
४. आँखा झिम्क्याएर प्रमाणीकरण पूरा भएपछि राष्ट्रिय पञ्जीकरण विभाग (VERSP-MICS) मा तत्काल नवीकरण हुन्छ।`,
        action: { label: 'सामाजिक सुरक्षा भत्ता e-KYC खोल्नुहोस्', tab: 'more' },
      };
    }

    // 3. Live Garbage Truck Tracker (फोहोर, गाडी, सफाइ, डस्टबिन)
    if (q.includes('फोहोर') || q.includes('गाडी') || q.includes('सफाइ') || q.includes('डस्टबिन')) {
      return {
        reply: `फोहोर संकलन गाडी प्रत्यक्ष GPS ट्र्याकिङ:
• आज गाडी बा १ ग २४५६ रुट १ (भोटेनाम्लाङ → भोताङ → गुन्सा बजार) मा सञ्चालनमा छ।
• आजको संकलन: 'कुहिने जैविक फोहोर'
• तपाईंको टोलमा आइपुग्न करिब १२-१५ मिनेट बाँकी छ।
• गाडी ५०० मिटर नजिक आइपुग्दा मोबाइलमा घण्टी बज्ने सुविधा चालु छ।`,
        action: { label: 'फोहोर गाडी लाइभ GPS नक्सा हेर्नुहोस्', tab: 'more' },
      };
    }

    // 4. Flood & Disaster Early Warning (बाढी, पहिरो, नदी, जलसतह, सेन्सर)
    if (q.includes('बाढी') || q.includes('पहिरो') || q.includes('नदी') || q.includes('जलसतह') || q.includes('इन्द्रावती') || q.includes('मेलम्ची')) {
      return {
        reply: `⚠️ प्रत्यक्ष बाढी पूर्वसूचना अपडेट:
• इन्द्रावती नदी: ६.२ मिटर (🔴 खतरा विन्दु नाघ्यो - सतर्क रहनुहोस्!)
• मेलम्ची खोला: ४.८ मिटर (🟡 सतर्कता तह)
• पाँचपोखरी खोला: २.१ मिटर (🟢 सामान्य स्थिति)
• उच्च जोखिम क्षेत्रका नागरिकका लागि थाङपाल भ्याली मा.वि. र मानेखर्क सामुदायिक भवनमा सुरक्षित आश्रयस्थल तोकिएको छ।`,
        action: { label: 'प्रत्यक्ष बाढी पूर्वसूचना तथा साइरन हेर्नुहोस्', tab: 'more' },
      };
    }

    // 5. Judicial Committee (न्यायिक समिति, उजुरी, इजलास, तारेख, सिमाना, विवाद)
    if (q.includes('न्यायिक') || q.includes('उजुरी') || q.includes('इजलास') || q.includes('विवाद') || q.includes('तारेख') || q.includes('सिमाना')) {
      return {
        reply: `न्यायिक समिति डिजिटल इजलास (गाउँपालिका उपाध्यक्ष संयोजक):
• तपाईंले जग्गाको साँध-सिमाना, सिँचाइ कुलो, घरेलु झैझगडा र ज्याला मजुरी सम्बन्धी उजुरी अनलाइन दर्ता गर्न सक्नुहुन्छ।
• दर्ता भएपछि म्याद तामेल, वडा मेलमिलाप केन्द्रको छलफल र आगामी पेशी/तारेखको मिति मोबाइलमै हेर्न सकिन्छ।`,
        action: { label: 'न्यायिक समिति उजुरी तथा इजलास खोल्नुहोस्', tab: 'more' },
      };
    }

    // 6. Palika Skill & Rojgar Bank (प्लम्बर, इलेक्ट्रिसियन, मिस्त्री, काम, रोजगार, सीप)
    if (q.includes('प्लम्बर') || q.includes('इलेक्ट्रिसियन') || q.includes('डकर्मी') || q.includes('सिकर्मी') || q.includes('रोजगार') || q.includes('सीप') || q.includes('मिस्त्री')) {
      return {
        reply: `पालिका सीप तथा रोजगार बैंक:
• पालिकामा सूचीकृत दक्ष प्लम्बर (दिनेश तामाङ), इलेक्ट्रिसियन (रोशन श्रेष्ठ), डकर्मी, सिकर्मी र कृषि प्राविधिकहरू उपलब्ध छन्।
• तपाईंले १-ट्यापमा फोन गरी घरमै काममा बोलाउन सक्नुहुन्छ।
• युवाहरूले आफ्नो सीप दर्ता गरी काम पाउने आवेदन पनि दिन सक्छन्।`,
        action: { label: 'स्थानीय सीप तथा रोजगार बैंक खोल्नुहोस्', tab: 'more' },
      };
    }

    // 7. Tax / Revenue
    if (q.includes('कर') || q.includes('सम्पत्ति') || q.includes('राजस्व') || q.includes('मालपोत') || q.includes('रसिद')) {
      return {
        reply: `स्थानीय तहमा सम्पत्ति कर तथा व्यवसाय कर डिजिटल रूपमा तिर्न सकिन्छ:
• तपाईंले नागरिकता नं. वा कित्ता नं. हालेर बक्यौता जाँच्न सक्नुहुन्छ।
• eSewa, Khalti वा Fonepay मार्फत भुक्तानी गर्न सकिन्छ।
• आश्विन मसान्तभित्र चालु वर्षको कर बुझाउँदा १०% सम्म छुट प्राप्त हुन्छ।
• भुक्तानीपछि तुरुन्तै आधिकारिक मलेप १०२ डिजिटल रसिद प्राप्त हुन्छ।`,
        action: { label: 'डिजिटल कर बक्यौता हेर्नुहोस्', tab: 'more' },
      };
    }

    // 8. Emergency SOS & Police
    if (q.includes('एम्बुलेन्स') || q.includes('प्रहरी') || q.includes('आपतकाल') || q.includes('sos')) {
      return {
        reply: `🚨 पाँचपोखरी आपतकालीन सहायता सम्पर्क:
• एम्बुलेन्स (२४ घण्टा): ९८५१२३४००१ / ०११-६९२००१
• विपद् फोकल पर्सन: ९८४१००११२२
• इलाका प्रहरी कार्यालय: १०० / ९८५११००१००
• तपाईंले एपको SOS बटन थिचेर चर्को साइरन बजाउन र तत्काल फोन गर्न सक्नुहुन्छ।`,
        action: { label: 'आपतकालीन SOS पेज खोल्नुहोस्', tab: 'more' },
      };
    }

    // 9. Agri Market Prices
    if (q.includes('भाउ') || q.includes('किवी') || q.includes('अलैंची') || q.includes('आलु') || q.includes('मल') || q.includes('कृषि')) {
      return {
        reply: `🥬 आजको स्थानीय कृषि संकलन केन्द्र दररेट:
• किवी (ग्रेड ए अर्गानिक): रु. ३५० / केजी
• अलैंची (डम्बरशाही): रु. १,४५० / केजी
• स्थानीय रातो आलु (भोताङ): रु. ६५ / केजी
• रेन्बो ट्राउट माछा: रु. १,२०० / केजी
• युरिया तथा जैविक मल वडा ६ र ३ को सहकारीबाट अनुदान दरमा उपलब्ध छ।`,
        action: { label: 'विस्तृत कृषि बजारभाउ हेर्नुहोस्', tab: 'more' },
      };
    }

    // 10. Document Scanner
    if (q.includes('स्क्यान') || q.includes('कागजात') || q.includes('लालपुर्जा') || q.includes('नागरिकता') || q.includes('pdf')) {
      return {
        reply: `तपाईंले क्यामेराबाट नागरिकता, लालपुर्जा वा सरकारी पत्र स्क्यान गर्न सक्नुहुन्छ:
• Auto-Edge Detection मार्फत किनारा मिलाउन सकिन्छ।
• म्याजिक कलर र कालो-सेतो फिल्टरबाट सफा पार्न सकिन्छ।
• नेपाली तथा अंग्रेजी OCR मार्फत अक्षर निकाल्न र PDF बनाउन सकिन्छ।`,
        action: { label: 'स्मार्ट डकुमेन्ट स्क्यानर खोल्नुहोस्', tab: 'scanner' },
      };
    }

    // 11. Household Survey
    if (q.includes('सर्भे') || q.includes('घरधुरी') || q.includes('तथ्यांक') || q.includes('गणक')) {
      return {
        reply: `एकिकृत घरधुरी सर्भे (Kobo/ODK इन्जिन):
• फिल्ड गणकहरूले अफलाइन नै घरधुरीको सम्पूर्ण विवरण र GPS लोकेसन संकलन गर्न सक्छन्।
• इन्टरनेट आएपछि एकमुष्ट सर्भरमा सिङ्क गर्न सकिन्छ।`,
        action: { label: 'घरधुरी सर्भे प्रणाली खोल्नुहोस्', tab: 'survey' },
      };
    }

    // 12. E-Library
    if (q.includes('ऐन') || q.includes('बजेट') || q.includes('किताब') || q.includes('पुस्तकालय') || q.includes('पाठ्यक्रम')) {
      return {
        reply: `पालिका ई-लाइब्रेरीमा स्थानीय आर्थिक ऐन २०८१, वार्षिक बजेट (रातो किताब), कक्षा १-८ को स्थानीय पाठ्यपुस्तक (हाम्रो पाँचपोखरी), र अर्गानिक खेती निर्देशिका उपलब्ध छन्। तपाईंले मोबाइलमै पढ्न वा सुन्न सक्नुहुन्छ।`,
        action: { label: 'ई-लाइब्रेरी खोल्नुहोस्', tab: 'elibrary' },
      };
    }

    // Default Fallback
    return {
      reply: `तपाईंको प्रश्न "${query}" प्राप्त भयो। 
यस विषयमा थप जानकारी लिन सम्बन्धित वडा कार्यालय वा प्रमुख प्रशासकीय अधिकृतको कार्यकक्षमा सम्पर्क गर्न सक्नुहुन्छ। बडापत्र वा ई-सिफारिस ट्याबबाट प्रक्रिया हेर्न सक्नुहुन्छ।`,
      action: { label: 'नागरिक बडापत्र हेर्नुहोस्', tab: 'charter' },
    };
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: 'अहिले',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      // Import apiClient at top if not present, but using fetch for direct API fallback
      const response = await fetch('http://localhost:3001/api/v1/ai-assistant/chat/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text }),
      });
      
      const data = await response.json();
      
      // If API returns a valid reply, use it. Otherwise fallback to the smart rule engine.
      const aiReplyText = data.reply ? data.reply : getSmartAiReply(text).reply;
      const fallbackAction = getSmartAiReply(text).action;

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: aiReplyText,
        timestamp: 'अहिले',
        actionButton: fallbackAction, // Keeping local navigation actions for now
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      console.error('API Chat Error:', error);
      // Fallback to local offline RAG
      const fallback = getSmartAiReply(text);
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: fallback.reply,
        timestamp: 'अहिले',
        actionButton: fallback.action,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  // Voice speech synthesis
  const speakMessage = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text.slice(0, 300));
      utterance.lang = 'ne-NP';
      utterance.rate = 0.92;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Mock Voice Input via Web Speech API
  const handleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('यस ब्राउजरमा भ्वाइस इनपुट उपलब्ध छैन। कृपया लेखेर सोध्नुहोस्।');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'ne-NP';
    recognition.interimResults = false;

    setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setIsListening(false);
      handleSendMessage(transcript);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(5px)',
        zIndex: 2500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0.75rem',
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          maxWidth: '480px',
          width: '100%',
          height: '88vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
        }}
      >
        {/* ─── CHATBOT HEADER ─── */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0369a1 0%, #0284c7 60%, #38bdf8 100%)',
            color: '#ffffff',
            padding: '0.85rem 1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1.5px solid rgba(255,255,255,0.4)',
              }}
            >
              <Bot size={22} color="#ffffff" />
            </div>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>डिजिपालिका AI साथी</span>
                <span style={{ fontSize: '0.6rem', backgroundColor: 'rgba(255,255,255,0.25)', padding: '1px 5px', borderRadius: '4px' }}>
                  Smart AI
                </span>
              </div>
              <div style={{ fontSize: '0.68rem', opacity: 0.9 }}>
                २४/७ डिजिटल नागरिक सेवा सहायक • नेपाली आवाज समर्थित
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#ffffff',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* ─── CHAT MESSAGES BODY ─── */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1rem',
            backgroundColor: '#f8fafc',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem',
          }}
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              }}
            >
              <div
                style={{
                  maxWidth: '85%',
                  backgroundColor: msg.sender === 'user' ? '#0284c7' : '#ffffff',
                  color: msg.sender === 'user' ? '#ffffff' : '#0f172a',
                  padding: '0.75rem 0.9rem',
                  borderRadius: msg.sender === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                  border: msg.sender === 'user' ? 'none' : '1px solid #e2e8f0',
                  fontSize: '0.82rem',
                  lineHeight: 1.55,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {msg.text}

                {/* Direct Action Link if AI suggests navigation */}
                {msg.actionButton && (
                  <button
                    type="button"
                    onClick={() => {
                      onNavigateTab(msg.actionButton?.tab);
                      onClose();
                    }}
                    style={{
                      marginTop: '8px',
                      backgroundColor: '#e0f2fe',
                      color: '#0369a1',
                      border: '1px solid #bae6fd',
                      borderRadius: '8px',
                      padding: '6px 10px',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      cursor: 'pointer',
                      width: '100%',
                      justifyContent: 'center',
                    }}
                  >
                    <span>{msg.actionButton.label}</span>
                    <ChevronRight size={14} />
                  </button>
                )}
              </div>

              {/* TTS Listen Button for AI replies */}
              {msg.sender === 'ai' && (
                <button
                  type="button"
                  onClick={() => speakMessage(msg.text)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    fontSize: '0.65rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px',
                    cursor: 'pointer',
                    marginTop: '3px',
                    padding: '2px 4px',
                  }}
                >
                  <Volume2 size={12} />
                  <span>सुन्नुहोस्</span>
                </button>
              )}
            </div>
          ))}

          {isTyping && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '0.75rem' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#0284c7', animation: 'pulse 1s infinite' }} />
              <span>AI सहायकले जवाफ खोज्दैछ...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ─── SUGGESTED PROMPT CHIPS ─── */}
        <div
          style={{
            padding: '6px 10px',
            backgroundColor: '#ffffff',
            borderTop: '1px solid #f1f5f9',
            display: 'flex',
            gap: '6px',
            overflowX: 'auto',
            scrollbarWidth: 'none',
          }}
        >
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(qp)}
              style={{
                backgroundColor: '#f1f5f9',
                color: '#334155',
                border: '1px solid #e2e8f0',
                borderRadius: '14px',
                padding: '4px 10px',
                fontSize: '0.68rem',
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              {qp}
            </button>
          ))}
        </div>

        {/* ─── CHAT INPUT BAR ─── */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          style={{
            padding: '0.75rem 1rem',
            backgroundColor: '#ffffff',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <button
            type="button"
            onClick={handleVoiceInput}
            style={{
              backgroundColor: isListening ? '#ef4444' : '#f1f5f9',
              color: isListening ? '#ffffff' : '#0284c7',
              border: 'none',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
              transition: 'background-color 0.2s ease',
            }}
            title="नेपालीमा बोल्नुहोस्"
          >
            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>

          <input
            type="text"
            placeholder={isListening ? 'सुन्दैछ... बोल्नुहोस्...' : 'यहाँ आफ्नो प्रश्न लेख्नुहोस्...'}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            style={{
              flex: 1,
              height: '40px',
              borderRadius: '20px',
              border: '1px solid #cbd5e1',
              padding: '0 14px',
              fontSize: '0.82rem',
              outline: 'none',
            }}
          />

          <button
            type="submit"
            disabled={!inputText.trim()}
            style={{
              backgroundColor: inputText.trim() ? '#0284c7' : '#cbd5e1',
              color: '#ffffff',
              border: 'none',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: inputText.trim() ? 'pointer' : 'default',
              flexShrink: 0,
            }}
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};
