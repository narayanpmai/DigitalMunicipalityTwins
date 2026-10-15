import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, Loader2, Link2, ChevronRight } from 'lucide-react';
import './MunicipalAIAssistant.css';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  sources?: string[];
  actions?: string[];
}

export const MunicipalAIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: 'नमस्ते! म नारायण नगरपालिकाको एआई डिजिटल असिस्टेन्ट हुँ। म तपाईंलाई कसरी सहयोग गर्न सक्छु?',
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), sender: 'user', text: inputText };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      // API Call to our new Backend
      const response = await fetch('/api/v1/chat/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: userMsg.text }],
          tenant_id: 'narayan'
        })
      });

      const data = await response.json();
      
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: data.reply,
        sources: data.sources,
        actions: data.actions
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        sender: 'ai',
        text: 'माफ गर्नुहोला, सर्भरमा समस्या आएको छ। कृपया एकछिन पछि प्रयास गर्नुहोला।'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="ai-assistant-container">
      {/* Floating Action Button */}
      {!isOpen && (
        <button 
          className="ai-fab-button pulse-animation"
          onClick={() => setIsOpen(true)}
        >
          <Bot size={28} color="white" />
          <span className="ai-fab-tooltip">नागरिक सहायता (AI)</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="ai-chat-window glass-effect">
          {/* Header */}
          <div className="ai-chat-header">
            <div className="ai-header-info">
              <div className="ai-avatar">
                <Bot size={24} color="#ffffff" />
              </div>
              <div>
                <h3 className="ai-title">डिजिटल असिस्टेन्ट</h3>
                <p className="ai-subtitle">नारायण नगरपालिका (AI)</p>
              </div>
            </div>
            <button className="ai-close-btn" onClick={() => setIsOpen(false)}>
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="ai-chat-body">
            {messages.map((msg) => (
              <div key={msg.id} className={`ai-message-wrapper ${msg.sender === 'user' ? 'user-wrapper' : 'ai-wrapper'}`}>
                <div className={`ai-message-bubble ${msg.sender === 'user' ? 'user-bubble' : 'ai-bubble'}`}>
                  <p>{msg.text}</p>
                  
                  {/* Show Sources if available */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="ai-sources">
                      <div className="ai-source-title"><Link2 size={12} /> स्रोत (Sources):</div>
                      <ul>
                        {msg.sources.map((src, idx) => (
                          <li key={idx}>{src}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Show Actions if available */}
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="ai-actions-container">
                      {msg.actions.map((act, idx) => (
                        <button key={idx} className="ai-action-btn">
                          {act} <ChevronRight size={14} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="ai-message-wrapper ai-wrapper">
                <div className="ai-message-bubble ai-bubble typing-indicator">
                  <Loader2 size={18} className="spin-animation" /> <span>सोच्दै...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form className="ai-chat-footer" onSubmit={handleSendMessage}>
            <input 
              type="text" 
              className="ai-chat-input"
              placeholder="आफ्नो प्रश्न यहाँ लेख्नुहोस्..." 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isLoading}
            />
            <button type="submit" className="ai-send-btn" disabled={!inputText.trim() || isLoading}>
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
