import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { tourismApi, type TourPackage } from '../../../api/tourism';
import { Clock, Map, CheckCircle2, User, Package, Search, Plus } from 'lucide-react';
import { BookingModal } from './BookingModal';
import { AddPackageModal } from './AddPackageModal';

export const PackagesTab: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [bookingPackage, setBookingPackage] = useState<TourPackage | null>(null);
  const [isAddPackageOpen, setIsAddPackageOpen] = useState(false);

  const { data: packages = [], isLoading } = useQuery<TourPackage[]>({
    queryKey: ['tourism-packages'],
    queryFn: () => tourismApi.getPackages(),
  });

  const filtered = packages.filter(pkg =>
    !searchTerm ||
    pkg.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (pkg.titleEn && pkg.titleEn.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Search & Actions Bar */}
      <div style={{
        background: '#fff',
        borderRadius: '10px',
        padding: '0.85rem 1.25rem',
        border: '1px solid #e2e8f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.75rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
      }}>
        <div style={{ position: 'relative', width: '320px', maxWidth: '100%' }}>
          <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input
            type="text"
            placeholder="प्याकेजको नाम खोज्नुहोस्..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '0.5rem 1rem 0.5rem 2.2rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
            कुल <strong>{packages.length}</strong> वटा टुर प्याकेज
          </div>
          <button
            onClick={() => setIsAddPackageOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.55rem 1.1rem',
              background: '#701a75',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.85rem',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
          >
            <Plus size={16} /> नयाँ प्याकेज थप्नुहोस्
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="dt-card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          प्याकेजहरू लोड हुँदैछ...
        </div>
      ) : filtered.length === 0 ? (
        <div className="dt-card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <Package size={48} style={{ marginBottom: '1rem', opacity: 0.4 }} />
          <p>कुनै पर्यटन प्याकेज फेला परेन।</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
          {filtered.map(pkg => (
            <div key={pkg.id} style={{ display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
              <div style={{ height: '200px', backgroundImage: `url(${pkg.imageUrl || 'https://images.unsplash.com/photo-1542314831-c6a4203251f8?w=500&q=80'})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(0,0,0,0.7)', color: '#fff', padding: '0.3rem 0.75rem', borderRadius: '16px', fontSize: '0.8rem', fontWeight: 600 }}>
                  {pkg.durationDays} Days Tour
                </div>
                <div style={{ position: 'absolute', bottom: '12px', left: '12px', background: pkg.difficulty === 'easy' ? '#22c55e' : pkg.difficulty === 'moderate' ? '#eab308' : '#ef4444', color: '#fff', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                  {pkg.difficulty?.toUpperCase()}
                </div>
              </div>
              <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.15rem', color: '#0f172a' }}>{pkg.title}</h3>
                {pkg.titleEn && <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.75rem' }}>{pkg.titleEn}</div>}

                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', color: '#475569', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Clock size={16} color="#0284c7" /> {pkg.durationDays} दिन</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><User size={16} color="#0284c7" /> {pkg.guideAvailable ? 'गाइड सहित' : 'गाइड बिना'}</div>
                </div>

                {pkg.destinations && pkg.destinations.length > 0 && (
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Map size={14} /> गन्तव्यहरु:</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      {(() => {
                        let dests: string[] = [];
                        const rawDests: any = pkg.destinations;
                        if (Array.isArray(rawDests)) {
                          dests = rawDests;
                        } else if (typeof rawDests === 'string') {
                          try {
                            const parsed = JSON.parse(rawDests);
                            if (Array.isArray(parsed)) dests = parsed;
                            else dests = rawDests.split(',').map((s: string) => s.trim());
                          } catch (e) {
                            dests = rawDests.split(',').map((s: string) => s.trim());
                          }
                        }
                        return dests.map(d => <span key={d} style={{ fontSize: '0.75rem', background: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '4px', color: '#475569' }}>{d}</span>);
                      })()}
                    </div>
                  </div>
                )}

                {pkg.inclusions && pkg.inclusions.length > 0 && (
                  <div style={{ marginBottom: '1.5rem', flex: 1 }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>समावेश सुविधाहरु:</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                      {(() => {
                        let incs: string[] = [];
                        const rawIncs: any = pkg.inclusions;
                        if (Array.isArray(rawIncs)) {
                          incs = rawIncs;
                        } else if (typeof rawIncs === 'string') {
                          try {
                            const parsed = JSON.parse(rawIncs);
                            if (Array.isArray(parsed)) incs = parsed;
                            else incs = rawIncs.split(',').map((s: string) => s.trim());
                          } catch (e) {
                            incs = rawIncs.split(',').map((s: string) => s.trim());
                          }
                        }
                        return incs.map(inc => (
                          <div key={inc} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#475569' }}>
                            <CheckCircle2 size={14} color="#16a34a" /> {inc}
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>प्रति व्यक्ति</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#701a75' }}>रु {pkg.costPerPerson || '—'}</div>
                  </div>
                  <button
                    onClick={() => setBookingPackage(pkg)}
                    style={{ background: '#701a75', color: '#fff', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    बुक गर्नुहोस्
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Booking Modal */}
      {bookingPackage && (
        <BookingModal
          isOpen={!!bookingPackage}
          onClose={() => setBookingPackage(null)}
          bookingType="package"
          referenceId={bookingPackage.title}
          defaultPrice={bookingPackage.costPerPerson}
        />
      )}

      {/* Add Package Modal */}
      {isAddPackageOpen && (
        <AddPackageModal
          isOpen={isAddPackageOpen}
          onClose={() => setIsAddPackageOpen(false)}
        />
      )}
    </div>
  );
};
