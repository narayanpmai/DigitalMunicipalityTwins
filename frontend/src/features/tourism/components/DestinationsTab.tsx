import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tourismApi } from '../../../api/tourism';
import type { Destination } from '../../../api/tourism';
import { Mountain, Calendar, Clock, Sparkles, Search, Edit, Trash2, Plus } from 'lucide-react';
import { AddDestinationModal } from './AddDestinationModal';

export const DestinationsTab: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [destinationToEdit, setDestinationToEdit] = useState<Destination | null>(null);
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id: string) => tourismApi.deleteDestination(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tourism-destinations'] });
      queryClient.invalidateQueries({ queryKey: ['tourism-stats'] });
      alert('गन्तव्य सफलतापूर्वक हटाइयो।');
    },
    onError: () => {
      alert('गन्तव्य हटाउन सकिएन।');
    }
  });

  const { data: destinations = [], isLoading } = useQuery({
    queryKey: ['tourism-destinations'],
    queryFn: () => tourismApi.getDestinations(),
  });

  const filtered = destinations.filter((item: Destination) => {
    const matchesSearch =
      !searchTerm ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="dt-card" style={{ padding: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
        <div style={{ flex: '1 1 260px', position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="dt-input"
            style={{ paddingLeft: '32px' }}
            placeholder="पर्यटकीय गन्तव्य वा सम्पदा खोज्नुहोस्..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="dt-select"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="all">सबै प्रकार (All Categories)</option>
          <option value="lake">पवित्र कुण्ड / ताल (Lakes)</option>
          <option value="peak">हिमशिखर / भ्युपोइन्ट (Peaks)</option>
          <option value="temple">गुम्बा तथा सम्पदा (Heritage)</option>
          <option value="cave">प्राकृतिक गुफा (Caves)</option>
        </select>

        <button
          onClick={() => {
            setDestinationToEdit(null);
            setIsModalOpen(true);
          }}
          className="dt-btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.2rem', whiteSpace: 'nowrap' }}
        >
          <Plus size={16} /> नयाँ गन्तव्य
        </button>
      </div>

      {isLoading ? (
        <div className="dt-card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          पर्यटन जानकारी लोड हुँदैछ...
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {filtered.map((dest: Destination) => (
            <div
              key={dest.id}
              className="dt-card"
              style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
            >
              <div style={{ height: '200px', backgroundImage: `url(${dest.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '12px', right: '12px', backgroundColor: 'rgba(15, 23, 42, 0.85)', color: '#ffffff', padding: '0.25rem 0.6rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Mountain size={12} />
                  <span>{dest.altitudeMeters} मिटर</span>
                </div>
                <div style={{ position: 'absolute', bottom: '12px', left: '12px', backgroundColor: 'var(--primary)', color: '#ffffff', padding: '0.25rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                  वडा नं. {dest.wardNo}
                </div>
              </div>

              <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.25rem' }}>{dest.name}</h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>{dest.nameEn}</div>
                <p style={{ fontSize: '0.875rem', lineHeight: 1.5, color: 'var(--text-main)', marginBottom: '1rem', flex: 1 }}>{dest.description}</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', borderTop: '1px solid var(--border)', paddingTop: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Calendar size={14} color="var(--primary)" />
                    <span>उत्कृष्ट मौसम: <strong>{dest.bestSeason}</strong></span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Clock size={14} color="var(--primary)" />
                    <span>समय: <strong>{dest.trekDuration}</strong></span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.75rem' }}>
                  {(() => {
                    let hl: string[] = [];
                    const raw: any = dest.highlights;
                    if (Array.isArray(raw)) {
                      hl = raw;
                    } else if (typeof raw === 'string') {
                      try {
                        const parsed = JSON.parse(raw);
                        if (Array.isArray(parsed)) hl = parsed;
                        else hl = raw.split(',').map((s: string) => s.trim());
                      } catch (e) {
                        hl = raw.split(',').map((s: string) => s.trim());
                      }
                    }
                    return hl.map((h, i) => (
                      <span key={i} style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '4px', backgroundColor: '#f1f5f9', color: '#334155', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <Sparkles size={10} color="var(--primary)" /> {h}
                      </span>
                    ));
                  })()}
                </div>

                <div style={{ marginTop: '1rem', display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => window.open(`/facilities/${dest.id}`, '_blank')}
                    style={{ flex: 1, background: '#e0e7ff', border: '1px solid #c7d2fe', borderRadius: '6px', padding: '0.65rem 1rem', cursor: 'pointer', color: '#4338ca', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                  >
                    🌐 विस्तृत प्रोफाइल ➔
                  </button>
                  <button
                    onClick={() => {
                      setDestinationToEdit(dest);
                      setIsModalOpen(true);
                    }}
                    title="सम्पादन गर्नुहोस्"
                    style={{ background: '#fffbeb', color: '#d97706', border: '1px solid #fde68a', padding: '0.65rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('के तपाईं यो गन्तव्य मेटाउन निश्चित हुनुहुन्छ?')) {
                        if (dest.id) {
                          deleteMutation.mutate(dest.id);
                        }
                      }
                    }}
                    title="हटाउनुहोस्"
                    disabled={deleteMutation.isPending}
                    style={{ background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', padding: '0.65rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', opacity: deleteMutation.isPending ? 0.5 : 1 }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <AddDestinationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        destinationToEdit={destinationToEdit}
      />
    </div>
  );
};
