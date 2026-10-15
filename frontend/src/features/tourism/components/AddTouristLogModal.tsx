import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { tourismApi, type TouristLog } from '../../../api/tourism';
import { X, UserPlus, Globe, FileText, Calendar, CheckCircle, AlertCircle, Shield, PhoneCall, DollarSign, Compass } from 'lucide-react';

interface AddTouristLogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddTouristLogModal: React.FC<AddTouristLogModalProps> = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();

  const [touristName, setTouristName] = useState('');
  const [country, setCountry] = useState('Nepal');
  const [permitNumber, setPermitNumber] = useState('');
  const [entryDate, setEntryDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [exitDate, setExitDate] = useState('');
  const [purpose, setPurpose] = useState('Trekking');
  const [destination, setDestination] = useState('पाँचपोखरी ताल');
  const [gender, setGender] = useState('male');
  const [ageGroup, setAgeGroup] = useState('adult');

  // Municipal Safety & Permit Fields
  const [guideName, setGuideName] = useState('');
  const [guideLicenseNo, setGuideLicenseNo] = useState('');
  const [guidePhone, setGuidePhone] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [insurancePolicyNo, setInsurancePolicyNo] = useState('');
  const [entryFeeNpr, setEntryFeeNpr] = useState<number>(100);
  const [entryFeeStatus, setEntryFeeStatus] = useState<'paid' | 'waived' | 'pending'>('paid');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const mutation = useMutation({
    mutationFn: (data: Partial<TouristLog>) => tourismApi.createTouristLog(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tourism-logs'] });
      queryClient.invalidateQueries({ queryKey: ['tourism-stats'] });
      setSuccessMsg('पर्यटक आगमन सफलतापूर्वक दर्ता भयो!');
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
        resetForm();
      }, 1500);
    },
    onError: () => {
      setErrorMsg('पर्यटक दर्ता गर्न सकिएन। कृपया विवरण जाँच्नुहोस्।');
    },
  });

  const resetForm = () => {
    setTouristName('');
    setCountry('Nepal');
    setPermitNumber('');
    setEntryDate(new Date().toISOString().split('T')[0]);
    setExitDate('');
    setPurpose('Trekking');
    setDestination('पाँचपोखरी ताल');
    setGender('male');
    setAgeGroup('adult');
    setGuideName('');
    setGuideLicenseNo('');
    setGuidePhone('');
    setEmergencyContact('');
    setInsurancePolicyNo('');
    setEntryFeeNpr(100);
    setEntryFeeStatus('paid');
    setErrorMsg('');
  };

  const handleCountryChange = (val: string) => {
    setCountry(val);
    if (val.trim().toLowerCase() === 'nepal' || val.trim() === 'नेपाल') {
      setEntryFeeNpr(100);
    } else {
      setEntryFeeNpr(2000);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!touristName.trim()) {
      setErrorMsg('कृपया पर्यटकको पूरा नाम अनिवार्य भर्नुहोस्।');
      return;
    }

    mutation.mutate({
      touristName: touristName.trim(),
      country: country.trim(),
      permitNumber: permitNumber.trim() || undefined,
      entryDate,
      exitDate: exitDate || undefined,
      purpose,
      destination: destination.trim(),
      gender,
      ageGroup,
      guideName: guideName.trim() || undefined,
      guideLicenseNo: guideLicenseNo.trim() || undefined,
      guidePhone: guidePhone.trim() || undefined,
      emergencyContact: emergencyContact.trim() || undefined,
      insurancePolicyNo: insurancePolicyNo.trim() || undefined,
      entryFeeNpr: Number(entryFeeNpr) || 0,
      entryFeeStatus,
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
        maxWidth: '680px',
        maxHeight: '92vh',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        border: '1px solid #e2e8f0',
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
          color: '#fff',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>नयाँ पर्यटक दर्ता तथा सुरक्षा अभिलेख</h3>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', opacity: 0.9 }}>गाउँपालिकामा आगमन हुने पर्यटक, गाइड, बीमा र प्रवेश शुल्क अभिलेख</p>
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {successMsg && (
            <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', padding: '0.75rem 1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
              <CheckCircle size={18} color="#10b981" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '0.75rem 1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
              <AlertCircle size={18} color="#ef4444" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section 1: Basic Info */}
          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.95rem', color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <UserPlus size={16} /> पर्यटकको व्यक्तिगत विवरण
            </h4>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                  पर्यटकको पूरा नाम *
                </label>
                <input
                  type="text"
                  required
                  placeholder="उदा: जोन स्मिथ / सागर दाहाल"
                  value={touristName}
                  onChange={(e) => setTouristName(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                  राष्ट्रियता / देश *
                </label>
                <input
                  type="text"
                  required
                  placeholder="उदा: Nepal, USA, Germany..."
                  value={country}
                  onChange={(e) => handleCountryChange(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                  परमिट / राहदानी / नागरिकता नं.
                </label>
                <input
                  type="text"
                  placeholder="TIMS-2026-XXXX / नागरिकता नं"
                  value={permitNumber}
                  onChange={(e) => setPermitNumber(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                  लिङ्ग (Gender)
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem', background: '#fff' }}
                >
                  <option value="male">पुरुष (Male)</option>
                  <option value="female">महिला (Female)</option>
                  <option value="other">अन्य (Other)</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                  उमेर समूह
                </label>
                <select
                  value={ageGroup}
                  onChange={(e) => setAgeGroup(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem', background: '#fff' }}
                >
                  <option value="youth">युवा (१८-२९ वर्ष)</option>
                  <option value="adult">वयस्क (३०-५९ वर्ष)</option>
                  <option value="senior">ज्येष्ठ नागरिक (६०+)</option>
                  <option value="child">बालबालिका (&lt;१८ वर्ष)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Destination & Travel Plan */}
          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.95rem', color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Compass size={16} /> भ्रमण गन्तव्य तथा मिति
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                  प्रमुख गन्तव्य
                </label>
                <input
                  type="text"
                  placeholder="पाँचपोखरी, आमायांग्री, छिमिटि..."
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                  भ्रमणको मुख्य उद्देश्य
                </label>
                <select
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem', background: '#fff' }}
                >
                  <option value="Trekking">पदयात्रा (Trekking)</option>
                  <option value="Pilgrimage">धार्मिक तीर्थयात्रा (Pilgrimage)</option>
                  <option value="Research">अध्ययन तथा अनुसन्धान (Research)</option>
                  <option value="Sightseeing">मनोरञ्जन / दृश्यावलोकन (Sightseeing)</option>
                  <option value="Other">अन्य (Other)</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                  प्रवेश मिति
                </label>
                <input
                  type="date"
                  value={entryDate}
                  onChange={(e) => setEntryDate(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                  अनुमानित प्रस्थान मिति
                </label>
                <input
                  type="date"
                  value={exitDate}
                  onChange={(e) => setExitDate(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Guide, Emergency & Insurance (Municipal Safe Tourism) */}
          <div style={{ background: '#eff6ff', padding: '1rem', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
            <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.95rem', color: '#1d4ed8', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Shield size={16} /> गाइड, आपतकालीन सम्पर्क तथा बीमा विवरण
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#1e3a8a', marginBottom: '0.25rem' }}>
                  इजाजतप्राप्त गाइड/पोर्टरको नाम
                </label>
                <input
                  type="text"
                  placeholder="उदा: तेन्जिङ शेर्पा / पेम्बा तामाङ"
                  value={guideName}
                  onChange={(e) => setGuideName(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #93c5fd', fontSize: '0.875rem' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#1e3a8a', marginBottom: '0.25rem' }}>
                  गाइड इजाजतपत्र नं. (License No.)
                </label>
                <input
                  type="text"
                  placeholder="उदा: NMA-GL-8492"
                  value={guideLicenseNo}
                  onChange={(e) => setGuideLicenseNo(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #93c5fd', fontSize: '0.875rem' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#1e3a8a', marginBottom: '0.25rem' }}>
                  गाइडको सम्पर्क फोन नं.
                </label>
                <input
                  type="tel"
                  placeholder="९८xxxxxxxx"
                  value={guidePhone}
                  onChange={(e) => setGuidePhone(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #93c5fd', fontSize: '0.875rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#1e3a8a', marginBottom: '0.25rem' }}>
                  आपतकालीन सम्पर्क व्यक्ति र फोन
                </label>
                <input
                  type="text"
                  placeholder="उदा: Sarah Clarke (+61 412 345 678)"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #93c5fd', fontSize: '0.875rem' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#1e3a8a', marginBottom: '0.25rem' }}>
                  पर्यटक बीमा पोलिसी नं. (Insurance)
                </label>
                <input
                  type="text"
                  placeholder="उदा: ALLIANZ-99214 / शिखर बीमा"
                  value={insurancePolicyNo}
                  onChange={(e) => setInsurancePolicyNo(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #93c5fd', fontSize: '0.875rem' }}
                />
              </div>
            </div>
          </div>

          {/* Section 4: Palika / TIMS Fee */}
          <div style={{ background: '#f0fdf4', padding: '1rem', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
            <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.95rem', color: '#15803d', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <DollarSign size={16} /> पालिका प्रवेश / TIMS पर्यटन शुल्क
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#166534', marginBottom: '0.25rem' }}>
                  प्रवेश शुल्क (रु. NPR)
                </label>
                <input
                  type="number"
                  min="0"
                  value={entryFeeNpr}
                  onChange={(e) => setEntryFeeNpr(Number(e.target.value) || 0)}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #86efac', fontSize: '0.875rem' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#166534', marginBottom: '0.25rem' }}>
                  शुल्क भुक्तानी स्थिति
                </label>
                <select
                  value={entryFeeStatus}
                  onChange={(e) => setEntryFeeStatus(e.target.value as any)}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #86efac', fontSize: '0.875rem', background: '#fff' }}
                >
                  <option value="paid">✅ तिरेको (Paid)</option>
                  <option value="waived">🎟️ छुट / निःशुल्क (Waived)</option>
                  <option value="pending">⏳ बाँकी (Pending)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
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
                background: '#2563eb',
                color: '#fff',
                fontWeight: 600,
                cursor: mutation.isPending ? 'not-allowed' : 'pointer',
                opacity: mutation.isPending ? 0.7 : 1,
              }}
            >
              {mutation.isPending ? 'दर्ता हुँदैछ...' : 'पर्यटक दर्ता गर्नुहोस्'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
