import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tourismApi } from '../../../api/tourism';
import type { Hotel } from '../../../api/tourism';
import { MapPin, Phone, Users, Home, Search, Plus, Award, Bed, FileText, Edit, Trash2 } from 'lucide-react';
import { BookingModal } from './BookingModal';
import { AddHotelModal } from './AddHotelModal';

export const HotelsTab: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHotelForBooking, setSelectedHotelForBooking] = useState<Hotel | null>(null);
  const [isAddHotelOpen, setIsAddHotelOpen] = useState(false);
  const [hotelToEdit, setHotelToEdit] = useState<Hotel | null>(null);
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id: string) => tourismApi.deleteHotel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tourism-hotels'] });
      queryClient.invalidateQueries({ queryKey: ['tourism-stats'] });
      alert('विवरण सफलतापूर्वक हटाइयो।');
    },
    onError: () => {
      alert('विवरण हटाउन सकिएन।');
    }
  });

  const { data: hotels = [], isLoading } = useQuery({
    queryKey: ['tourism-hotels'],
    queryFn: () => tourismApi.getHotels(),
  });

  const filtered = hotels.filter((h: Hotel) => 
    h.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (h.ownerName && h.ownerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (h.palikaRegNo && h.palikaRegNo.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (h.operatorPanOrCitizenship && h.operatorPanOrCitizenship.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getClassificationBadge = (cls?: string) => {
    switch (cls) {
      case 'क':
        return { text: "⭐ 'क' वर्ग", bg: '#fef3c7', color: '#92400e', border: '#fde68a' };
      case 'ख':
        return { text: "⭐ 'ख' वर्ग", bg: '#e0f2fe', color: '#0369a1', border: '#bae6fd' };
      case 'ग':
        return { text: "⭐ 'ग' वर्ग", bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' };
      default:
        return { text: "साधारण वर्ग", bg: '#f8fafc', color: '#64748b', border: '#e2e8f0' };
    }
  };

  const getTypeLabel = (type?: string, homestayType?: string) => {
    if (homestayType === 'community_homestay') return '🏡 सामुदायिक होमस्टे';
    if (homestayType === 'private_homestay') return '🏘️ निजी होमस्टे';
    if (homestayType === 'resort' || type === 'resort') return '🌲 रिसोर्ट';
    return '🏨 होटल तथा लज';
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
        <div style={{ position: 'relative', width: '380px', maxWidth: '100%' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input 
            type="text" 
            placeholder="होटल, होमस्टे, दर्ता नं. वा प्रोप्राइटर खोज्नुहोस्..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '0.6rem 1rem 0.6rem 2.5rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
          />
        </div>

        <button
          onClick={() => setIsAddHotelOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.6rem 1.25rem',
            background: '#0284c7',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.85rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          <Plus size={16} /> नयाँ होटल/होमस्टे पालिका दर्ता
        </button>
      </div>

      {isLoading ? (
        <div className="dt-card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          होटल तथा होमस्टे लोड हुँदैछ...
        </div>
      ) : filtered.length === 0 ? (
        <div className="dt-card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <Home size={48} style={{ marginBottom: '1rem', opacity: 0.4 }} />
          <p>कुनै होटल वा होमस्टे फेला परेन।</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {filtered.map(hotel => {
            const classBadge = getClassificationBadge(hotel.classification);
            return (
              <div key={hotel.id} style={{ background: '#fff', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: '170px', backgroundImage: `url(${hotel.imageUrl || 'https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=500&q=80'})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
                  <span style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(15, 23, 42, 0.85)', color: '#fff', padding: '0.25rem 0.65rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600 }}>
                    {getTypeLabel(hotel.type, hotel.homestayType)}
                  </span>
                  <span style={{ position: 'absolute', top: '10px', right: '10px', background: classBadge.bg, color: classBadge.color, border: `1px solid ${classBadge.border}`, padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>
                    {classBadge.text}
                  </span>
                </div>
                
                <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ margin: '0 0 0.4rem', color: '#0f172a', fontSize: '1.1rem' }}>{hotel.name}</h3>

                  {hotel.palikaRegNo && (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', color: '#475569', marginBottom: '0.6rem', width: 'fit-content' }}>
                      <FileText size={12} color="#0284c7" /> दर्ता नं: <span style={{ fontWeight: 600, color: '#0f172a' }}>{hotel.palikaRegNo}</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                    <MapPin size={14} color="#0284c7" /> वडा नं. {hotel.wardNo}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                    <Bed size={14} color="#10b981" /> 
                    <span>कोठा: <strong style={{ color: '#0f172a' }}>{hotel.totalRooms || 5}</strong></span>
                    <span>•</span>
                    <Users size={14} color="#3b82f6" />
                    <span>बेड क्षमता: <strong style={{ color: '#0f172a' }}>{hotel.bedCapacity || hotel.capacity}</strong> जना</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem', color: '#64748b', fontSize: '0.82rem', marginBottom: '0.5rem' }}>
                    <Phone size={14} color="#64748b" style={{ marginTop: '2px' }} />
                    <div>
                      <div>{hotel.contactNumber || hotel.phone || 'N/A'} ({hotel.ownerName || hotel.proprietorName || 'N/A'})</div>
                      {hotel.operatorPanOrCitizenship && (
                        <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 500 }}>
                          {hotel.operatorPanOrCitizenship}
                        </div>
                      )}
                    </div>
                  </div>

                  {hotel.amenities && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', margin: '0.4rem 0 1rem' }}>
                      {(() => {
                        let ams: string[] = [];
                        const raw: any = hotel.amenities;
                        if (Array.isArray(raw)) {
                          ams = raw;
                        } else if (typeof raw === 'string') {
                          try {
                            const parsed = JSON.parse(raw);
                            if (Array.isArray(parsed)) ams = parsed;
                            else ams = raw.split(',').map((s: string) => s.trim());
                          } catch (e) {
                            ams = raw.split(',').map((s: string) => s.trim());
                          }
                        }
                        return ams.slice(0, 4).map((am, i) => (
                          <span key={i} style={{ background: '#f1f5f9', color: '#475569', fontSize: '0.72rem', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                            ✓ {am}
                          </span>
                        ));
                      })()}
                    </div>
                  )}

                  <div style={{ marginTop: 'auto', borderTop: '1px solid #e2e8f0', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>प्रति रात</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#16a34a' }}>रु {hotel.pricePerNight}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => {
                          setHotelToEdit(hotel);
                          setIsAddHotelOpen(true);
                        }}
                        title="सम्पादन गर्नुहोस्"
                        style={{ background: '#fffbeb', color: '#d97706', border: '1px solid #fde68a', padding: '0.45rem 0.6rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('के तपाईं यो विवरण मेटाउन निश्चित हुनुहुन्छ? (Delete Action)')) {
                            if (hotel.id) {
                              deleteMutation.mutate(hotel.id);
                            }
                          }
                        }}
                        title="हटाउनुहोस्"
                        disabled={deleteMutation.isPending}
                        style={{ background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', padding: '0.45rem 0.6rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', opacity: deleteMutation.isPending ? 0.5 : 1 }}
                      >
                        <Trash2 size={14} />
                      </button>
                      <button
                        onClick={() => setSelectedHotelForBooking(hotel)}
                        style={{ background: '#f0f9ff', color: '#0284c7', border: '1px solid #bae6fd', padding: '0.45rem 1rem', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}
                      >
                        बुकिङ
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedHotelForBooking && (
        <BookingModal
          isOpen={!!selectedHotelForBooking}
          onClose={() => setSelectedHotelForBooking(null)}
          bookingType="hotel"
          referenceId={selectedHotelForBooking.name}
          defaultPrice={selectedHotelForBooking.pricePerNight}
        />
      )}

      {isAddHotelOpen && (
        <AddHotelModal
          isOpen={isAddHotelOpen}
          onClose={() => {
            setIsAddHotelOpen(false);
            setTimeout(() => setHotelToEdit(null), 300);
          }}
          initialData={hotelToEdit}
        />
      )}
    </div>
  );
};
