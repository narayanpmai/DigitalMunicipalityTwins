import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { tourismApi, type Hotel } from '../../../api/tourism';
import { X, Home, MapPin, Phone, Users, CheckCircle, AlertCircle, Award, FileText, Bed } from 'lucide-react';

interface AddHotelModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Hotel | null;
}

export const AddHotelModal: React.FC<AddHotelModalProps> = ({ isOpen, onClose, initialData }) => {
  const queryClient = useQueryClient();

  const [name, setName] = useState(initialData?.name || '');
  const [type, setType] = useState<'homestay' | 'hotel' | 'resort'>((initialData?.type as any) || 'homestay');
  const [homestayType, setHomestayType] = useState<'community_homestay' | 'private_homestay' | 'hotel_lodge' | 'resort'>((initialData?.homestayType as any) || 'community_homestay');
  const [classification, setClassification] = useState<'क' | 'ख' | 'ग' | 'साधारण'>((initialData?.classification as any) || 'क');
  const [palikaRegNo, setPalikaRegNo] = useState(initialData?.palikaRegNo || '');
  const [wardNo, setWardNo] = useState(initialData?.wardNo || 3);
  const [ownerName, setOwnerName] = useState(initialData?.ownerName || '');
  const [phone, setPhone] = useState(initialData?.contactNumber || initialData?.phone || '');
  const [operatorPanOrCitizenship, setOperatorPanOrCitizenship] = useState(initialData?.operatorPanOrCitizenship || '');
  const [totalRooms, setTotalRooms] = useState(initialData?.totalRooms || 6);
  const [bedCapacity, setBedCapacity] = useState(initialData?.bedCapacity || initialData?.capacity || 15);
  const [pricePerNight, setPricePerNight] = useState(initialData?.pricePerNight || '१,५००');
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || '');
  const [amenitiesText, setAmenitiesText] = useState(initialData?.amenities?.join(', ') || 'तातो पानी, अर्गानिक खाना, वाइफाइ');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Update states when initialData changes
  React.useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name || '');
        setType((initialData.type as any) || 'homestay');
        setHomestayType((initialData.homestayType as any) || 'community_homestay');
        setClassification((initialData.classification as any) || 'क');
        setPalikaRegNo(initialData.palikaRegNo || '');
        setWardNo(initialData.wardNo || 3);
        setOwnerName(initialData.ownerName || '');
        setPhone(initialData.contactNumber || initialData.phone || '');
        setOperatorPanOrCitizenship(initialData.operatorPanOrCitizenship || '');
        setTotalRooms(initialData.totalRooms || 6);
        setBedCapacity(initialData.bedCapacity || initialData.capacity || 15);
        setPricePerNight(initialData.pricePerNight || '१,५००');
        setImageUrl(initialData.imageUrl || '');
        let amText = '';
        if (Array.isArray(initialData.amenities)) {
          amText = initialData.amenities.join(', ');
        } else if (typeof initialData.amenities === 'string') {
          amText = initialData.amenities;
        }
        setAmenitiesText(amText || 'तातो पानी, अर्गानिक खाना, वाइफाइ');
      } else {
        resetForm();
      }
    }
  }, [isOpen, initialData]);

  const mutation = useMutation({
    mutationFn: (data: Partial<Hotel>) => 
      initialData?.id ? tourismApi.updateHotel(initialData.id, data) : tourismApi.createHotel(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tourism-hotels'] });
      queryClient.invalidateQueries({ queryKey: ['tourism-stats'] });
      setSuccessMsg(initialData ? 'होटल / होमस्टे सफलतापूर्वक अद्यावधिक भयो!' : 'होटल / होमस्टे सफलतापूर्वक दर्ता भयो!');
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
        resetForm();
      }, 1500);
    },
    onError: () => {
      setErrorMsg(initialData ? 'अद्यावधिक गर्न सकिएन। कृपया विवरण जाँच्नुहोस्।' : 'होटल दर्ता गर्न सकिएन। कृपया विवरण जाँच्नुहोस्।');
    },
  });

  const resetForm = () => {
    setName('');
    setType('homestay');
    setHomestayType('community_homestay');
    setClassification('क');
    setPalikaRegNo('');
    setWardNo(3);
    setOwnerName('');
    setPhone('');
    setOperatorPanOrCitizenship('');
    setTotalRooms(6);
    setBedCapacity(15);
    setPricePerNight('१,५००');
    setImageUrl('');
    setAmenitiesText('तातो पानी, अर्गानिक खाना, वाइफाइ');
    setErrorMsg('');
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !ownerName.trim()) {
      setErrorMsg('कृपया होटलको नाम र सञ्चालकको नाम अनिवार्य भर्नुहोस्।');
      return;
    }

    const amenitiesList = amenitiesText
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    mutation.mutate({
      name: name.trim(),
      type,
      homestayType,
      classification,
      palikaRegNo: palikaRegNo.trim() || `पाँच-पर्यटन-०${wardNo}/२०८१-${Math.floor(Math.random()*800+100)}`,
      wardNo: Number(wardNo),
      ownerName: ownerName.trim(),
      proprietorName: ownerName.trim(),
      contactNumber: phone.trim() || undefined,
      phone: phone.trim() || undefined,
      operatorPanOrCitizenship: operatorPanOrCitizenship.trim() || undefined,
      totalRooms: Number(totalRooms) || 1,
      bedCapacity: Number(bedCapacity) || 1,
      capacity: Number(bedCapacity) || 1,
      pricePerNight: pricePerNight.trim() || '१,५००',
      amenities: amenitiesList,
      status: 'active',
      imageUrl: imageUrl.trim() || 'https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=500&q=80',
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
        maxWidth: '620px',
        maxHeight: '92vh',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        border: '1px solid #e2e8f0',
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #0369a1 0%, #0284c7 100%)',
          color: '#fff',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>
              {initialData ? 'होटल / होमस्टे विवरण सम्पादन' : 'नयाँ होटल / होमस्टे पालिका दर्ता'}
            </h3>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', opacity: 0.9 }}>गाउँपालिकाभित्र सञ्चालित आवास, वर्गीकरण, कोठा/बेड क्षमता तथा PAN अभिलेख</p>
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
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
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

          {/* Section 1: Hotel Name & Palika Reg */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
                होटल / होमस्टेको नाम *
              </label>
              <input
                type="text"
                required
                placeholder="उदा: तार्केघ्याङ शेर्पा होमस्टे"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
                पालिका व्यवसाय दर्ता नं.
              </label>
              <input
                type="text"
                placeholder="पाँच-पर्यटन-०३/२०८१-XXXX"
                value={palikaRegNo}
                onChange={(e) => setPalikaRegNo(e.target.value)}
                style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
              />
            </div>
          </div>

          {/* Section 2: Type, Classification & Ward */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 0.8fr', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
                आवासको प्रकार
              </label>
              <select
                value={homestayType}
                onChange={(e) => {
                  const val = e.target.value as any;
                  setHomestayType(val);
                  if (val === 'community_homestay' || val === 'private_homestay') setType('homestay');
                  else if (val === 'resort') setType('resort');
                  else setType('hotel');
                }}
                style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem', background: '#fff' }}
              >
                <option value="community_homestay">🏡 सामुदायिक होमस्टे</option>
                <option value="private_homestay">🏘️ निजी होमस्टे</option>
                <option value="hotel_lodge">🏨 होटल तथा लज</option>
                <option value="resort">🌲 रिसोर्ट</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
                स्तर वर्गीकरण (Class)
              </label>
              <select
                value={classification}
                onChange={(e) => setClassification(e.target.value as any)}
                style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem', background: '#fff' }}
              >
                <option value="क">⭐ 'क' वर्ग (उत्कृष्ट)</option>
                <option value="ख">⭐ 'ख' वर्ग (मध्यम)</option>
                <option value="ग">⭐ 'ग' वर्ग (आधारभूत)</option>
                <option value="साधारण">साधारण वर्ग</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
                वडा नं.
              </label>
              <select
                value={wardNo}
                onChange={(e) => setWardNo(parseInt(e.target.value))}
                style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem', background: '#fff' }}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map(w => (
                  <option key={w} value={w}>वडा {w}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Section 3: Proprietor & PAN */}
          <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
                  सञ्चालक / प्रोप्राइटरको नाम *
                </label>
                <input
                  type="text"
                  required
                  placeholder="उदा: दावा लामा"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
                  सम्पर्क फोन नं.
                </label>
                <input
                  type="tel"
                  placeholder="९८xxxxxxxx"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
                  स्थायी लेखा नं (PAN) / नागरिकता
                </label>
                <input
                  type="text"
                  placeholder="PAN: 602348912"
                  value={operatorPanOrCitizenship}
                  onChange={(e) => setOperatorPanOrCitizenship(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                />
              </div>
            </div>
          </div>

          {/* Section 4: Capacity & Rates */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
                कुल कोठा संख्या (Rooms)
              </label>
              <input
                type="number"
                min="1"
                max="200"
                value={totalRooms}
                onChange={(e) => setTotalRooms(Math.max(1, parseInt(e.target.value) || 1))}
                style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
                कुल बेड क्षमता (Beds)
              </label>
              <input
                type="number"
                min="1"
                max="500"
                value={bedCapacity}
                onChange={(e) => setBedCapacity(Math.max(1, parseInt(e.target.value) || 1))}
                style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
                प्रति रात शुल्क (रु.)
              </label>
              <input
                type="text"
                placeholder="१,५००"
                value={pricePerNight}
                onChange={(e) => setPricePerNight(e.target.value)}
                style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
              />
            </div>
          </div>

          {/* Section 5: Amenities & Image */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
                उपलब्ध सुविधाहरू (अल्पविरामले छुट्याउनुहोस्)
              </label>
              <input
                type="text"
                placeholder="तातो पानी, अर्गानिक खाना, वाइफाइ..."
                value={amenitiesText}
                onChange={(e) => setAmenitiesText(e.target.value)}
                style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
                तस्बिर URL (वैकल्पिक)
              </label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
              />
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.4rem' }}>
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
                background: '#0284c7',
                color: '#fff',
                fontWeight: 600,
                cursor: mutation.isPending ? 'not-allowed' : 'pointer',
                opacity: mutation.isPending ? 0.7 : 1,
              }}
            >
              {mutation.isPending ? 'प्रक्रिया हुँदैछ...' : (initialData ? 'विवरण अद्यावधिक गर्नुहोस्' : 'होटल / होमस्टे दर्ता गर्नुहोस्')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
