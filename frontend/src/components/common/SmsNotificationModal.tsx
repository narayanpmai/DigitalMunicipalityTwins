import React, { useState } from 'react';
import { Send, Phone, MessageSquare, CheckCircle, AlertCircle, X, Shield, RefreshCw } from 'lucide-react';

export interface SmsNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientName: string;
  recipientPhone: string;
  serviceName: string;
  referenceNumber: string;
  defaultMessage?: string;
  onSent?: () => void;
}

export const SmsNotificationModal: React.FC<SmsNotificationModalProps> = ({
  isOpen,
  onClose,
  recipientName,
  recipientPhone,
  serviceName,
  referenceNumber,
  defaultMessage,
  onSent,
}) => {
  const defaultTemplate =
    defaultMessage ||
    `श्री ${recipientName}ज्यू, पाँचपोखरी थाङपाल गाउँपालिकामा यहाँको ${serviceName} (संकेत नं: ${referenceNumber}) सफलतापूर्वक दर्ता/स्वीकृत भएको जानकारी गराइन्छ। - पाँचपोखरी थाङपाल गाउँपालिका`;

  const [phone, setPhone] = useState<string>(recipientPhone || '९८४१२३४५६७');
  const [channel, setChannel] = useState<'sms' | 'whatsapp'>('sms');
  const [message, setMessage] = useState<string>(defaultTemplate);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSend = () => {
    setIsSending(true);

    // Simulate SMS Gateway Dispatch via Sparrow/Aakash API
    setTimeout(() => {
      setIsSending(false);
      setIsSuccess(true);
      onSent?.();
    }, 1200);
  };

  const handleClose = () => {
    setIsSuccess(false);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '1rem',
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          maxWidth: '480px',
          width: '100%',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid #e2e8f0',
        }}
      >
        {/* Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 100%)',
            color: '#ffffff',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#99f6e4' }}>
              <MessageSquare size={14} /> नागरिक सूचना तथा अलर्ट सेवा
            </div>
            <h3 style={{ margin: '0.25rem 0 0', fontSize: '1.15rem', fontWeight: 700 }}>
              SMS / WhatsApp सूचना सम्प्रेषण
            </h3>
          </div>
          <button
            type="button"
            onClick={handleClose}
            style={{ background: 'none', border: 'none', color: '#ccfbf1', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '1.5rem' }}>
          {isSuccess ? (
            <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  backgroundColor: '#dcfce7',
                  color: '#15803d',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                }}
              >
                <CheckCircle size={36} />
              </div>
              <h4 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#15803d', margin: '0 0 0.5rem' }}>
                सूचना सफलतापूर्वक पठाइयो!
              </h4>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 1.5rem' }}>
                सेवाग्राही {recipientName} ({phone}) को मोबाइलमा {channel.toUpperCase()} सन्देश डेलिभर भइसकेको छ।
              </p>
              <button
                type="button"
                onClick={handleClose}
                style={{
                  padding: '0.65rem 1.5rem',
                  backgroundColor: '#0f766e',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                बन्द गर्नुहोस्
              </button>
            </div>
          ) : (
            <>
              {/* Channel Selector */}
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <button
                  type="button"
                  onClick={() => setChannel('sms')}
                  style={{
                    flex: 1,
                    padding: '0.65rem',
                    borderRadius: '8px',
                    border: `2px solid ${channel === 'sms' ? '#0d9488' : '#e2e8f0'}`,
                    backgroundColor: channel === 'sms' ? '#f0fdfa' : '#ffffff',
                    color: channel === 'sms' ? '#0f766e' : '#64748b',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                  }}
                >
                  <MessageSquare size={16} /> SMS गेटवे
                </button>
                <button
                  type="button"
                  onClick={() => setChannel('whatsapp')}
                  style={{
                    flex: 1,
                    padding: '0.65rem',
                    borderRadius: '8px',
                    border: `2px solid ${channel === 'whatsapp' ? '#16a34a' : '#e2e8f0'}`,
                    backgroundColor: channel === 'whatsapp' ? '#f0fdf4' : '#ffffff',
                    color: channel === 'whatsapp' ? '#15803d' : '#64748b',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                  }}
                >
                  <Phone size={16} /> WhatsApp Alert
                </button>
              </div>

              {/* Recipient Phone */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                  प्राप्तकर्ता मोबाइल नम्बर:
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="९८४xxxxxxx"
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                  }}
                />
              </div>

              {/* Message Body */}
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
                    सन्देश (SMS Text):
                  </label>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    {message.length} अक्षर
                  </span>
                </div>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.875rem',
                    lineHeight: 1.5,
                    resize: 'vertical',
                  }}
                />
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={handleClose}
                  style={{
                    padding: '0.6rem 1.25rem',
                    backgroundColor: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                  }}
                >
                  रद्द गर्नुहोस्
                </button>
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={isSending}
                  style={{
                    padding: '0.6rem 1.5rem',
                    backgroundColor: '#0f766e',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  {isSending ? (
                    <>
                      <RefreshCw size={16} className="spin" /> पठाइँदैछ...
                    </>
                  ) : (
                    <>
                      <Send size={16} /> सन्देश पठाउनुहोस्
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
