import React, { useState, useEffect, useRef } from 'react';
import './AiAssistantPortal.css';

interface ChatMessage {
    id: string;
    sender: 'user' | 'ai';
    text: string;
}

interface PromptLog {
    id: string;
    user_prompt: string;
    ai_response: string;
    timestamp: string;
}

export default function AiAssistantPortal() {
    const [messages, setMessages] = useState<ChatMessage[]>([
        { id: 'init', sender: 'ai', text: 'नमस्कार! म पालिकाको डिजिटल AI सहायक हुँ। मलाई पालिकाको बजेट, नक्सा पास, सिफारिस र अन्य सेवाहरूको बारेमा सोध्न सक्नुहुन्छ।' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [history, setHistory] = useState<PromptLog[]>([]);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    // Fetch history
    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await fetch('/api/v1/ai-assistant/logs/');
                if(res.ok) setHistory(await res.json());
            } catch (error) {
                console.error(error);
            }
        };
        fetchHistory();
    }, [messages]); // Re-fetch when new message added

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const userMsg: ChatMessage = { id: Date.now().toString(), sender: 'user', text: inputValue };
        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsTyping(true);

        try {
            const res = await fetch('/api/v1/ai-assistant/chat/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: userMsg.text, user_id: 'admin_123' })
            });
            
            if (res.ok) {
                const data = await res.json();
                const aiMsg: ChatMessage = { id: Date.now().toString() + 'ai', sender: 'ai', text: data.reply };
                setMessages(prev => [...prev, aiMsg]);
            }
        } catch (error) {
            setMessages(prev => [...prev, { id: 'err', sender: 'ai', text: 'माफ गर्नुहोला, सर्भरमा समस्या छ।' }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="ai-container">
            <div className="ai-header">
                <h1>AI Digital Assistant (NLP)</h1>
                <p> पालिकाको डाटाबेस (RAG) सँग जोडिएको स्मार्ट च्याटबोट (Phase 11)</p>
            </div>

            <div className="ai-layout">
                {/* Sidebar History */}
                <div className="ai-sidebar">
                    <h3>तपाईँका अघिल्ला प्रश्नहरू</h3>
                    <ul className="ai-history-list">
                        {history.map(log => (
                            <li key={log.id} className="ai-history-item" onClick={() => {
                                setMessages([
                                    { id: log.id+'_u', sender: 'user', text: log.user_prompt },
                                    { id: log.id+'_a', sender: 'ai', text: log.ai_response }
                                ]);
                            }}>
                                📝 {log.user_prompt?.length > 25 ? log.user_prompt.substring(0,25) + '...' : log.user_prompt}
                            </li>
                        ))}
                        {history.length === 0 && <li style={{color:'#718096', fontSize:'0.9rem'}}>कुनै रेकर्ड छैन।</li>}
                    </ul>
                </div>

                {/* Main Chat Area */}
                <div className="ai-chat-area">
                    <div className="ai-messages">
                        {messages.map(m => (
                            <div key={m.id} className={`msg-bubble ${m.sender === 'user' ? 'msg-user' : 'msg-ai'}`}>
                                {m.text}
                            </div>
                        ))}
                        {isTyping && <div className="typing-indicator">AI ले उत्तर खोज्दै छ...</div>}
                        <div ref={messagesEndRef} />
                    </div>

                    <form className="ai-input-area" onSubmit={sendMessage}>
                        <input 
                            type="text" 
                            className="ai-input" 
                            placeholder="बजेट, सिफारिस वा नक्सा पास बारे सोध्नुहोस्..." 
                            value={inputValue}
                            onChange={e => setInputValue(e.target.value)}
                            disabled={isTyping}
                        />
                        <button type="submit" className="ai-send-btn" disabled={isTyping || !inputValue.trim()}>
                            ➤
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
