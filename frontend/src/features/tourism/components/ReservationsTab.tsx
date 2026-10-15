import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tourismApi, type Reservation } from '../../../api/tourism';
import { Search, Filter, CheckCircle, XCircle, Trash2, Check, Clock, Plus, Calendar } from 'lucide-react';
import { BookingModal } from './BookingModal';

export const ReservationsTab: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [isNewBookingOpen, setIsNewBookingOpen] = useState(false);

  const { data: reservations = [], isLoading } = useQuery<Reservation[]>({
    queryKey: ['tourism-reservations'],
    queryFn: () => tourismApi.getReservations(),
  });

  // Status mutation
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      tourismApi.updateReservationStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tourism-reservations'] });
      queryClient.invalidateQueries({ queryKey: ['tourism-stats'] });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => tourismApi.deleteReservation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tourism-reservations'] });
      queryClient.invalidateQueries({ queryKey: ['tourism-stats'] });
    },
  });

  const filtered = reservations.filter(r => {
    const matchesSearch =
      !searchTerm ||
      r.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.phone.includes(searchTerm) ||
      r.referenceId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchesType = typeFilter === 'all' || r.bookingType === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return { bg: '#dcfce7', color: '#15803d', label: 'स्वीकृत (Confirmed)' };
      case 'cancelled':
        return { bg: '#fee2e2', color: '#b91c1c', label: 'रद्द (Cancelled)' };
      case 'completed':
        return { bg: '#e0e7ff', color: '#4338ca', label: 'सम्पन्न (Completed)' };
      default:
        return { bg: '#fef9c3', color: '#a16207', label: 'प्रतीक्षारत (Pending)' };
    }
  };

  return (
    <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
      {/* Top Header & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', fontWeight: 700 }}>
            बुकिङ तथा आरक्षण व्यवस्थापन (Reservations)
          </h2>
          <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: '#64748b' }}>
            पर्यटकहरूले गरेका होटल र टुर प्याकेज बुकिङहरूको प्रत्यक्ष डेटाबेस अभिलेख
          </p>
        </div>

        <button
          onClick={() => setIsNewBookingOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.6rem 1.25rem',
            background: '#0284c7',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 600,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          <Plus size={18} /> नयाँ बुकिङ प्रविष्टि
        </button>
      </div>

      {/* Filter Toolbar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem', alignItems: 'center' }}>
        <div style={{ flex: '1 1 240px', position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input
            type="text"
            placeholder="पाहुनाको नाम, फोन वा गन्तव्य खोज्नुहोस्..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '0.55rem 1rem 0.55rem 2.2rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
          />
        </div>

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          style={{ padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', background: '#fff', color: '#334155' }}
        >
          <option value="all">सबै अवस्था (All Status)</option>
          <option value="pending">प्रतीक्षारत (Pending)</option>
          <option value="confirmed">स्वीकृत (Confirmed)</option>
          <option value="completed">सम्पन्न (Completed)</option>
          <option value="cancelled">रद्द (Cancelled)</option>
        </select>

        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          style={{ padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', background: '#fff', color: '#334155' }}
        >
          <option value="all">सबै प्रकार (All Types)</option>
          <option value="package">टुर प्याकेज (Tour Package)</option>
          <option value="hotel">होटल / होमस्टे (Hotel/Homestay)</option>
        </select>
      </div>

      {/* Table Content */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
          आरक्षण डेटाबेस लोड हुँदैछ...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b', background: '#f8fafc', borderRadius: '8px' }}>
          कुनै बुकिङ अभिलेख फेला परेन।
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
              <tr>
                <th style={{ padding: '0.75rem 1rem' }}>आईडी</th>
                <th style={{ padding: '0.75rem 1rem' }}>पाहुनाको नाम (सम्पर्क)</th>
                <th style={{ padding: '0.75rem 1rem' }}>बुकिङ प्रकार / शीर्षक</th>
                <th style={{ padding: '0.75rem 1rem' }}>चेक-इन / संख्या</th>
                <th style={{ padding: '0.75rem 1rem' }}>कुल रकम</th>
                <th style={{ padding: '0.75rem 1rem' }}>अवस्था</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>कार्य (Actions)</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => {
                const badge = getStatusBadge(r.status);
                const shortId = r.id ? r.id.substring(0, 6).toUpperCase() : 'N/A';

                return (
                  <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#0ea5e9' }}>
                      #{shortId}
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ fontWeight: 600, color: '#1e293b' }}>{r.guestName}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {r.phone} {r.email ? `• ${r.email}` : ''}
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '0.15rem 0.5rem',
                        background: r.bookingType === 'hotel' ? '#f0fdf4' : '#fdf4ff',
                        color: r.bookingType === 'hotel' ? '#16a34a' : '#c026d3',
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        marginBottom: '0.2rem',
                      }}>
                        {r.bookingType === 'hotel' ? 'होटल' : 'प्याकेज'}
                      </span>
                      <div style={{ color: '#334155', fontWeight: 500 }}>{r.referenceId}</div>
                      {r.specialRequests && (
                        <div style={{ fontSize: '0.75rem', color: '#64748b', fontStyle: 'italic', marginTop: '0.2rem' }}>
                          "{r.specialRequests}"
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ color: '#0f172a', fontWeight: 500 }}>{r.checkInDate || '—'}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{r.pax} जना</div>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#10b981' }}>
                      {r.totalAmount || '—'}
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span style={{
                        padding: '0.25rem 0.6rem',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        background: badge.bg,
                        color: badge.color,
                        display: 'inline-block',
                      }}>
                        {badge.label}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                        {r.status === 'pending' && (
                          <>
                            <button
                              onClick={() => r.id && statusMutation.mutate({ id: r.id, status: 'confirmed' })}
                              title="पुष्टि गर्नुहोस् (Confirm)"
                              style={{
                                background: '#dcfce7',
                                border: '1px solid #86efac',
                                color: '#16a34a',
                                padding: '0.35rem 0.5rem',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                              }}
                            >
                              <CheckCircle size={14} /> पुष्टि
                            </button>
                            <button
                              onClick={() => r.id && statusMutation.mutate({ id: r.id, status: 'cancelled' })}
                              title="रद्द गर्नुहोस् (Cancel)"
                              style={{
                                background: '#fee2e2',
                                border: '1px solid #fca5a5',
                                color: '#dc2626',
                                padding: '0.35rem 0.5rem',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                              }}
                            >
                              <XCircle size={14} /> रद्द
                            </button>
                          </>
                        )}
                        {r.status === 'confirmed' && (
                          <button
                            onClick={() => r.id && statusMutation.mutate({ id: r.id, status: 'completed' })}
                            title="भ्रमण सम्पन्न भयो (Mark Completed)"
                            style={{
                              background: '#e0e7ff',
                              border: '1px solid #c7d2fe',
                              color: '#4338ca',
                              padding: '0.35rem 0.5rem',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                            }}
                          >
                            ✓ सम्पन्न
                          </button>
                        )}
                        <button
                          onClick={() => {
                            if (r.id && window.confirm('के तपाईं यो आरक्षण अभिलेख मेटाउन निश्चित हुनुहुन्छ?')) {
                              deleteMutation.mutate(r.id);
                            }
                          }}
                          title="मेटाउनुहोस्"
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#94a3b8',
                            padding: '0.35rem',
                            borderRadius: '4px',
                            cursor: 'pointer',
                          }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Manual Booking Modal */}
      {isNewBookingOpen && (
        <BookingModal
          isOpen={isNewBookingOpen}
          onClose={() => setIsNewBookingOpen(false)}
          bookingType="package"
          referenceId="पाँचपोखरी ५ दिने पदयात्रा"
        />
      )}
    </div>
  );
};
