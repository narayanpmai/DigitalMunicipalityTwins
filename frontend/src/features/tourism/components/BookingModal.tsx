import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { tourismApi, type Reservation } from '../../../api/tourism';
import { X, Calendar, User, Phone, Mail, Users, CheckCircle, AlertCircle } from 'lucide-react';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingType: 'hotel' | 'package';
  referenceId: string;
  defaultPrice?: string;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  bookingType,
  referenceId,
  defaultPrice,
}) => {
  const queryClient = useQueryClient();

  const [guestName, setGuestName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [checkInDate, setCheckInDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [pax, setPax] = useState(1);
  const [specialRequests, setSpecialRequests] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Calculate estimated total
  const numericPrice = defaultPrice ? parseInt(defaultPrice.replace(/[^0-9]/g, ''), 10) || 0 : 0;
  const estimatedTotal = numericPrice > 0 ? (numericPrice * pax).toLocaleString('ne-NP') : defaultPrice || '';

  const mutation = useMutation({
    mutationFn: (data: Partial<Reservation>) => tourismApi.createReservation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tourism-reservations'] });
      queryClient.invalidateQueries({ queryKey: ['tourism-stats'] });
      setSuccessMsg('बुकिङ सफलतापूर्वक सुरक्षित भयो! हामी छिट्टै सम्पर्क गर्नेछौं।');
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
        resetForm();
      }, 1800);
    },
    onError: (err: any) => {
      setErrorMsg('बुकिङ सुरक्षित गर्न सकिएन। कृपया पुनः प्रयास गर्नुहोस्।');
    },
  });

  const resetForm = () => {
    setGuestName('');
    setPhone('');
    setEmail('');
    setPax(1);
    setSpecialRequests('');
    setErrorMsg('');
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !phone.trim()) {
      setErrorMsg('कृपया पर्यटकको नाम र फोन नम्बर अनिवार्य भर्नुहोस्।');
      return;
    }

    mutation.mutate({
      guestName: guestName.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      bookingType,
      referenceId,
      checkInDate,
      pax: Number(pax),
      totalAmount: estimatedTotal ? `रु ${estimatedTotal}` : undefined,
      status: 'pending',
      specialRequests: specialRequests.trim() || undefined,
    });
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '520px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden',
        border: '1px solid #e2e8f0',
        animation: 'fadeIn 0.2s ease-out',
      }}>
        {/* Modal Header */}
        <div style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: '#fff',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div>
            <span style={{
              display: 'inline-block',
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '0.2rem 0.6rem',
              borderRadius: '9999px',
              backgroundColor: bookingType === 'package' ? '#8b5cf6' : '#0284c7',
              marginBottom: '0.35rem',
            }}>
              {bookingType === 'package' ? 'पर्यटन प्याकेज बुकिङ' : 'होटल / होमस्टे बुकिङ'}
            </span>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>{referenceId}</h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              padding: '0.5rem',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {successMsg && (
            <div style={{
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              color: '#065f46',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.9rem',
            }}>
              <CheckCircle size={18} color="#10b981" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#991b1b',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.9rem',
            }}>
              <AlertCircle size={18} color="#ef4444" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Guest Name */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
              <User size={14} color="#64748b" /> पर्यटक / पाहुनाको पूरा नाम *
            </label>
            <input
              type="text"
              required
              placeholder="उदा: राम बहादुर श्रेष्ठ"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.9rem',
                outline: 'none',
              }}
            />
          </div>

          {/* Phone and Email Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                <Phone size={14} color="#64748b" /> सम्पर्क फोन *
              </label>
              <input
                type="tel"
                required
                placeholder="९८xxxxxxxx"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.9rem',
                  outline: 'none',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                <Mail size={14} color="#64748b" /> इमेल (वैकल्पिक)
              </label>
              <input
                type="email"
                placeholder="example@mail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.9rem',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Date and Pax Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                <Calendar size={14} color="#64748b" /> यात्रा / चेक-इन मिति
              </label>
              <input
                type="date"
                value={checkInDate}
                onChange={(e) => setCheckInDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.9rem',
                  outline: 'none',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                <Users size={14} color="#64748b" /> संख्या (Pax)
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={pax}
                onChange={(e) => setPax(Math.max(1, parseInt(e.target.value) || 1))}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.9rem',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Price Calculation Box */}
          {estimatedTotal && (
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                अनुमानित कुल लागत ({pax} जनाको लागि):
              </span>
              <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                रु {estimatedTotal}
              </span>
            </div>
          )}

          {/* Special Requests */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
              थप विवरण वा विशेष अनुरोध (Special Requests)
            </label>
            <textarea
              rows={2}
              placeholder="खानपान, विशेष आवश्यकता वा गाइड सम्बन्धी जानकारी..."
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.9rem',
                outline: 'none',
                resize: 'none',
              }}
            />
          </div>

          {/* Footer Actions */}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#fff',
                color: '#475569',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              रद्द गर्नुहोस्
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              style={{
                flex: 2,
                padding: '0.75rem',
                borderRadius: '8px',
                border: 'none',
                background: bookingType === 'package' ? '#701a75' : '#0284c7',
                color: '#fff',
                fontWeight: 600,
                cursor: mutation.isPending ? 'not-allowed' : 'pointer',
                opacity: mutation.isPending ? 0.7 : 1,
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
            >
              {mutation.isPending ? 'सुरक्षित हुँदैछ...' : 'बुकिङ निश्चित गर्नुहोस्'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
