import React, { useState } from 'react';
import {
  MOCK_HOTEL_HOMESTAYS,
  HotelHomestayItem,
} from '../../data/mockHotelHomestayData';
import {
  Search,
  Phone,
  MapPin,
  Bed,
  Calendar,
  Sparkles,
  Star,
  CheckCircle2,
  FileText,
  CreditCard,
  X,
  Filter,
  Users,
  Compass,
  Check,
  Send,
  Building,
} from 'lucide-react';

interface MobileAccommodationsHubProps {
  onSelectOnMap?: (lat: number, lng: number, name: string) => void;
}

export const MobileAccommodationsHub: React.FC<MobileAccommodationsHubProps> = ({
  onSelectOnMap,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedWard, setSelectedWard] = useState<number | 'all'>('all');
  const [selectedHotelForBooking, setSelectedHotelForBooking] = useState<HotelHomestayItem | null>(null);

  // Booking Form State
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [checkInDate, setCheckInDate] = useState('2026-10-10');
  const [paxCount, setPaxCount] = useState('2');
  const [roomsCount, setRoomsCount] = useState('1');
  const [mealPreference, setMealPreference] = useState('अर्गानिक स्थानीय खाना');
  const [bookingSuccessMsg, setBookingSuccessMsg] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'सबै' },
    { id: 'community_homestay', label: 'सामुदायिक होमस्टे' },
    { id: 'resort', label: 'रिसोर्ट' },
    { id: 'hotel_lodge', label: 'होटल तथा लज' },
    { id: 'private_homestay', label: 'निजी होमस्टे' },
  ];

  const wards: (number | 'all')[] = ['all', 1, 2, 3, 4, 7, 8];

  const filteredHotels = MOCK_HOTEL_HOMESTAYS.filter((h) => {
    const matchesSearch =
      h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.proprietorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.locationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.palikaRegNo.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = selectedType === 'all' || h.type === selectedType;
    const matchesWard = selectedWard === 'all' || h.wardNo === selectedWard;

    return matchesSearch && matchesType && matchesWard;
  });

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName || !guestPhone) {
      alert('कृपया तपाईंको नाम र सम्पर्क फोन नम्बर अनिवार्य भर्नुहोस्।');
      return;
    }

    const bookingId = `BK-P5-${Math.floor(1000 + Math.random() * 9000)}`;
    setBookingSuccessMsg(`तपाईंको बुकिङ सफलतापूर्वक दर्ता भयो! (बुकिङ आइडी: ${bookingId})। सञ्चालक ${selectedHotelForBooking?.proprietorName} लाई सूचना पठाइएको छ।`);

    setTimeout(() => {
      setBookingSuccessMsg(null);
      setSelectedHotelForBooking(null);
      setGuestName('');
      setGuestPhone('');
    }, 3500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', paddingBottom: '20px' }}>
      {/* ─── 1. TOP SUMMARY METRICS BANNER ─── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #065F46 0%, #047857 50%, #064E3B 100%)',
          color: '#ffffff',
          borderRadius: '18px',
          padding: '1.1rem',
          boxShadow: '0 6px 18px rgba(4, 120, 87, 0.25)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <span
            style={{
              fontSize: '0.66rem',
              fontWeight: 800,
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              color: '#FDE047',
              padding: '2px 8px',
              borderRadius: '12px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Sparkles size={11} />
            <span>गाउँपालिका पर्यटन शाखा आधिकारिक अभिलेख</span>
          </span>
          <span style={{ fontSize: '0.64rem', color: '#A7F3D0', fontWeight: 700 }}>
            ८ वटै वडा कभरेज
          </span>
        </div>

        <h3 style={{ margin: '0 0 4px 0', fontSize: '1.15rem', fontWeight: 900 }}>
          होटल तथा होमस्टे डिजिटल व्यवस्थापन
        </h3>
        <p style={{ margin: '0 0 10px 0', fontSize: '0.74rem', color: '#D1FAE5', lineHeight: 1.4 }}>
          पाँचपोखरी थाङपाल गाउँपालिकामा विधिवत दर्ता भएका सामुदायिक होमस्टे, रिसोर्ट र लजहरूको विवरण तथा अनलाइन बुकिङ।
        </p>

        {/* Quick Numbers Bar */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '6px',
            backgroundColor: 'rgba(0, 0, 0, 0.25)',
            padding: '8px 4px',
            borderRadius: '12px',
            textAlign: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: '0.6rem', color: '#A7F3D0' }}>🏡 कुल दर्ता</div>
            <div style={{ fontSize: '0.86rem', fontWeight: 900 }}>{MOCK_HOTEL_HOMESTAYS.length}+</div>
          </div>
          <div>
            <div style={{ fontSize: '0.6rem', color: '#A7F3D0' }}>🛏️ बेड क्षमता</div>
            <div style={{ fontSize: '0.86rem', fontWeight: 900 }}>१५०+ जना</div>
          </div>
          <div>
            <div style={{ fontSize: '0.6rem', color: '#A7F3D0' }}>⭐ 'क' वर्ग</div>
            <div style={{ fontSize: '0.86rem', fontWeight: 900 }}>५०%</div>
          </div>
          <div>
            <div style={{ fontSize: '0.6rem', color: '#A7F3D0' }}>📞 प्रत्यक्ष कल</div>
            <div style={{ fontSize: '0.86rem', fontWeight: 900 }}>१-ट्याप</div>
          </div>
        </div>
      </div>

      {/* ─── 2. SEARCH & FILTER SECTION ─── */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1.5px solid #E2E8F0',
          padding: '0.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
        }}
      >
        {/* Search Input */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#F8FAFC',
            border: '1.5px solid #CBD5E1',
            borderRadius: '12px',
            padding: '7px 10px',
            gap: '8px',
          }}
        >
          <Search size={16} color="#64748B" />
          <input
            type="text"
            placeholder="होटल, होमस्टे, वडा वा सञ्चालक खोज्नुहोस्..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              border: 'none',
              outline: 'none',
              backgroundColor: 'transparent',
              width: '100%',
              fontSize: '0.78rem',
              color: '#1E293B',
              fontWeight: 600,
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px', scrollbarWidth: 'none' }}>
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelectedType(c.id)}
              style={{
                padding: '5px 11px',
                borderRadius: '18px',
                fontSize: '0.7rem',
                fontWeight: 800,
                whiteSpace: 'nowrap',
                border: selectedType === c.id ? 'none' : '1px solid #E2E8F0',
                backgroundColor: selectedType === c.id ? '#047857' : '#F8FAFC',
                color: selectedType === c.id ? '#ffffff' : '#475569',
                cursor: 'pointer',
                boxShadow: selectedType === c.id ? '0 2px 6px rgba(4,120,87,0.25)' : 'none',
              }}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Ward Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', overflowX: 'auto', paddingBottom: '2px', scrollbarWidth: 'none' }}>
          <span style={{ fontSize: '0.64rem', color: '#64748B', fontWeight: 800, whiteSpace: 'nowrap' }}>वडा:</span>
          {wards.map((w) => (
            <button
              key={String(w)}
              type="button"
              onClick={() => setSelectedWard(w)}
              style={{
                padding: '3px 8px',
                borderRadius: '12px',
                fontSize: '0.66rem',
                fontWeight: 700,
                whiteSpace: 'nowrap',
                border: selectedWard === w ? 'none' : '1px solid #E2E8F0',
                backgroundColor: selectedWard === w ? '#0F4C81' : '#FFFFFF',
                color: selectedWard === w ? '#ffffff' : '#64748B',
                cursor: 'pointer',
              }}
            >
              {w === 'all' ? 'सबै' : `वडा ${w}`}
            </button>
          ))}
        </div>
      </div>

      {/* ─── 3. ACCOMMODATION CARDS (MATCHING WEB PORTAL SCREENSHOT) ─── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
        {filteredHotels.length === 0 ? (
          <div
            style={{
              padding: '2rem 1rem',
              textAlign: 'center',
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              color: '#64748B',
            }}
          >
            <Building size={32} style={{ margin: '0 auto 8px auto', opacity: 0.5 }} />
            <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>कुनै होटल वा होमस्टे भेटिएन</div>
            <div style={{ fontSize: '0.74rem' }}>कृपया खोजी शब्द वा फिल्टर परिवर्तन गरि हेर्नुहोस्।</div>
          </div>
        ) : (
          filteredHotels.map((hotel) => (
            <div
              key={hotel.id}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '18px',
                border: '1.5px solid #E2E8F0',
                overflow: 'hidden',
                boxShadow: '0 4px 14px rgba(0,0,0,0.04)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Card Image Banner with Badges */}
              <div style={{ position: 'relative', height: '150px', overflow: 'hidden' }}>
                <img
                  src={hotel.imageUrl}
                  alt={hotel.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.65) 100%)',
                  }}
                />

                {/* Left Tag Badge: Community Homestay / Resort / Lodge */}
                <span
                  style={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    backgroundColor:
                      hotel.type === 'community_homestay'
                        ? '#065F46'
                        : hotel.type === 'resort'
                        ? '#4C1D95'
                        : hotel.type === 'hotel_lodge'
                        ? '#0F4C81'
                        : '#334155',
                    color: '#ffffff',
                    fontSize: '0.64rem',
                    fontWeight: 800,
                    padding: '3px 8px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                  }}
                >
                  <span>🏡</span>
                  <span>{hotel.typeNepali}</span>
                </span>

                {/* Right Rating Badge: 'क' / 'ख' / 'ग' वर्ग */}
                <span
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    backgroundColor: '#FEF3C7',
                    color: '#92400E',
                    fontSize: '0.65rem',
                    fontWeight: 900,
                    padding: '3px 8px',
                    borderRadius: '8px',
                    border: '1px solid #FCD34D',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                  }}
                >
                  <Star size={11} fill="#D97706" color="#D97706" />
                  <span>'{hotel.classification}' वर्ग</span>
                </span>

                {/* Bottom Title on Image */}
                <div style={{ position: 'absolute', bottom: '8px', left: '12px', right: '12px', color: '#ffffff' }}>
                  <div style={{ fontSize: '0.94rem', fontWeight: 900, lineHeight: 1.25, textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
                    {hotel.name}
                  </div>
                  <div style={{ fontSize: '0.68rem', opacity: 0.9, marginTop: '2px' }}>
                    {hotel.locationName} • {hotel.altitudeMeters} मिटर
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div style={{ padding: '0.85rem 1rem', display: 'flex', flexDirection: 'column', gap: '7px' }}>
                {/* Registration Number Pill */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  <span
                    style={{
                      fontSize: '0.64rem',
                      fontWeight: 700,
                      backgroundColor: '#EFF6FF',
                      color: '#1D4ED8',
                      padding: '2px 7px',
                      borderRadius: '6px',
                      border: '1px solid #BFDBFE',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <FileText size={10} />
                    <span>दर्ता नं: {hotel.palikaRegNo}</span>
                  </span>

                  <span
                    style={{
                      fontSize: '0.64rem',
                      fontWeight: 700,
                      backgroundColor: '#F1F5F9',
                      color: '#0F4C81',
                      padding: '2px 7px',
                      borderRadius: '6px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '3px',
                    }}
                  >
                    <MapPin size={10} />
                    <span>वडा नं. {hotel.wardNo}</span>
                  </span>
                </div>

                {/* Capacity & Operator Details */}
                <div style={{ fontSize: '0.72rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}>
                    <Bed size={13} color="#047857" />
                    <span>कोठा: {hotel.totalRooms} • बेड क्षमता: {hotel.bedCapacity} जना</span>
                  </span>
                </div>

                <div style={{ fontSize: '0.7rem', color: '#64748B' }}>
                  <span>📞 {hotel.phone} ({hotel.proprietorName}) | {hotel.operatorPanOrCitizenship}</span>
                </div>

                {/* Amenities Chips */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', margin: '2px 0' }}>
                  {hotel.amenities.map((am, i) => (
                    <span
                      key={i}
                      style={{
                        fontSize: '0.62rem',
                        fontWeight: 600,
                        backgroundColor: '#F8FAFC',
                        color: '#334155',
                        border: '1px solid #E2E8F0',
                        padding: '2px 6px',
                        borderRadius: '6px',
                      }}
                    >
                      ✓ {am}
                    </span>
                  ))}
                </div>

                {/* Card Footer: Price & Action Buttons */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderTop: '1px solid #F1F5F9',
                    paddingTop: '8px',
                    marginTop: '2px',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.62rem', color: '#64748B' }}>प्रति रात</div>
                    <div style={{ fontSize: '0.96rem', fontWeight: 900, color: '#047857' }}>
                      रु {hotel.pricePerNight}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {/* Map Button */}
                    {onSelectOnMap && (
                      <button
                        type="button"
                        onClick={() => onSelectOnMap(hotel.lat, hotel.lng, hotel.name)}
                        style={{
                          backgroundColor: '#EFF6FF',
                          color: '#1D4ED8',
                          border: '1px solid #BFDBFE',
                          padding: '6px 9px',
                          borderRadius: '10px',
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px',
                        }}
                      >
                        <Compass size={12} color="#1D4ED8" />
                        <span>नक्सा</span>
                      </button>
                    )}

                    {/* 1-Tap Direct Call */}
                    <a
                      href={`tel:${hotel.phone}`}
                      style={{
                        backgroundColor: '#F0FDF4',
                        color: '#15803D',
                        border: '1px solid #BBF7D0',
                        padding: '6px 10px',
                        borderRadius: '10px',
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Phone size={12} />
                      <span>कल</span>
                    </a>

                    {/* Booking Button */}
                    <button
                      type="button"
                      onClick={() => setSelectedHotelForBooking(hotel)}
                      style={{
                        backgroundColor: '#0F4C81',
                        color: '#ffffff',
                        border: 'none',
                        padding: '6px 14px',
                        borderRadius: '10px',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        boxShadow: '0 2px 6px rgba(15, 76, 129, 0.25)',
                      }}
                    >
                      <Calendar size={12} />
                      <span>बुकिङ</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ─── 4. INTERACTIVE ONLINE BOOKING MODAL ─── */}
      {selectedHotelForBooking && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.65)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              maxWidth: '440px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                background: 'linear-gradient(135deg, #0F4C81 0%, #1E3A8A 100%)',
                color: '#ffffff',
                padding: '1rem',
                borderTopLeftRadius: '20px',
                borderTopRightRadius: '20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
              }}
            >
              <div>
                <span style={{ fontSize: '0.64rem', backgroundColor: '#F59E0B', color: '#0F172A', fontWeight: 800, padding: '2px 7px', borderRadius: '6px' }}>
                  {selectedHotelForBooking.typeNepali}
                </span>
                <h4 style={{ margin: '4px 0 0 0', fontSize: '1rem', fontWeight: 900 }}>
                  {selectedHotelForBooking.name}
                </h4>
                <div style={{ fontSize: '0.7rem', opacity: 0.9, marginTop: '2px' }}>
                  दर: रु {selectedHotelForBooking.pricePerNight} प्रति रात
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedHotelForBooking(null)}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  color: '#ffffff',
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  fontWeight: 900,
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '1.25rem' }}>
              {bookingSuccessMsg ? (
                <div
                  style={{
                    backgroundColor: '#F0FDF4',
                    border: '1.5px solid #86EFAC',
                    color: '#15803D',
                    borderRadius: '14px',
                    padding: '1.25rem',
                    textAlign: 'center',
                  }}
                >
                  <CheckCircle2 size={40} color="#16A34A" style={{ margin: '0 auto 8px auto' }} />
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '1rem', fontWeight: 900 }}>
                    बुकिङ सफल भयो!
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.78rem', lineHeight: 1.5 }}>
                    {bookingSuccessMsg}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleBookingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '3px' }}>
                      पर्यटक / नागरिकको पूरा नाम *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="उदाहरण: राम बहादुर तामाङ"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '10px',
                        border: '1.5px solid #CBD5E1',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '3px' }}>
                      सम्पर्क फोन / ह्वाट्सएप नम्बर *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="९८xxxxxxxx"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '10px',
                        border: '1.5px solid #CBD5E1',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                      <label style={{ fontSize: '0.72rem', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '3px' }}>
                        आगमन मिति
                      </label>
                      <input
                        type="date"
                        value={checkInDate}
                        onChange={(e) => setCheckInDate(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '7px 8px',
                          borderRadius: '10px',
                          border: '1.5px solid #CBD5E1',
                          fontSize: '0.76rem',
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.72rem', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '3px' }}>
                        पर्यटक संख्या (Pax)
                      </label>
                      <select
                        value={paxCount}
                        onChange={(e) => setPaxCount(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '7px 8px',
                          borderRadius: '10px',
                          border: '1.5px solid #CBD5E1',
                          fontSize: '0.76rem',
                          backgroundColor: '#ffffff',
                        }}
                      >
                        <option value="1">१ जना</option>
                        <option value="2">२ जना</option>
                        <option value="3-5">३ देखि ५ जना</option>
                        <option value="6-10">६ देखि १० जना (ग्रुप)</option>
                        <option value="10+">१० जना भन्दा बढी</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '3px' }}>
                      खानाको प्राथमिकता (Meal Preference)
                    </label>
                    <select
                      value={mealPreference}
                      onChange={(e) => setMealPreference(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '7px 8px',
                        borderRadius: '10px',
                        border: '1.5px solid #CBD5E1',
                        fontSize: '0.76rem',
                        backgroundColor: '#ffffff',
                      }}
                    >
                      <option value="अर्गानिक स्थानीय खाना">अर्गानिक स्थानीय खाना (ढिँडो/सिस्नो/लोकल कुखुरा)</option>
                      <option value="सादा शाकाहारी">सादा शाकाहारी (दालभात तरकारी)</option>
                      <option value="ह्योल्मो विशेष स्याम्बाक/तेन्दु">ह्योल्मो विशेष स्याम्बाक/तेन्दु सुप</option>
                      <option value="कोठा मात्र (Bed Only)">कोठा मात्र (Bed Only)</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                    <button
                      type="submit"
                      style={{
                        flex: 1,
                        backgroundColor: '#047857',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '10px',
                        fontSize: '0.82rem',
                        fontWeight: 900,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        boxShadow: '0 3px 10px rgba(4,120,87,0.3)',
                      }}
                    >
                      <Send size={14} />
                      <span>बुकिङ अनुरोध पठाउनुहोस्</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedHotelForBooking(null)}
                      style={{
                        backgroundColor: '#F1F5F9',
                        color: '#64748B',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '10px 14px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      रद्द
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileAccommodationsHub;
