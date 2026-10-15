import React, { useState, useEffect } from 'react';
import { ChevronLeft, Calendar as CalendarIcon, MapPin, Clock, Users, ChevronRight, Bell, Filter } from 'lucide-react';
import apiClient from '../../services/api';

type EventType = 'meeting' | 'holiday' | 'festival' | 'training' | 'other';

interface AppEvent {
  id: string;
  title: string;
  date: number; // Day of the month
  month: string;
  type: EventType;
  time?: string;
  location?: string;
  description?: string;
}

const TYPE_CONFIG: Record<EventType, { color: string, bg: string, label: string }> = {
  meeting: { color: '#0F4C81', bg: '#EBF3FA', label: 'बैठक' },
  holiday: { color: '#DC2626', bg: '#FEF2F2', label: 'सार्वजनिक विदा' },
  festival: { color: '#D97706', bg: '#FEF3C7', label: 'चाडपर्व' },
  training: { color: '#059669', bg: '#D1FAE5', label: 'तालिम/गोष्ठी' },
  other: { color: '#4B5563', bg: '#F3F4F6', label: 'अन्य' }
};

const MOCK_EVENTS: AppEvent[] = [
  { id: '1', title: 'कार्यपालिका बैठक', date: 5, month: 'आश्विन', type: 'meeting', time: '११:०० बजे', location: 'गाउँपालिका सभाहल' },
];

export const EventCalendarDashboard: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [events, setEvents] = useState<AppEvent[]>(MOCK_EVENTS);
  const [filter, setFilter] = useState<EventType | 'all'>('all');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await apiClient.get('/calendar/events');
        if (response.data && response.data.length > 0) {
          // Map backend 'event_type' to 'type'
          const mappedEvents = response.data.map((ev: any) => ({
            ...ev,
            type: ev.event_type
          }));
          setEvents(mappedEvents);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };
    fetchEvents();
  }, []);

  const filteredEvents = filter === 'all' ? events : events.filter(e => e.type === filter);
  
  // Sort by date assuming all are in the same month for demo
  const sortedEvents = [...filteredEvents].sort((a, b) => a.date - b.date);

  return (
    <div style={{ backgroundColor: '#F8FAFC', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#8B5CF6',
        padding: '1.2rem 1rem',
        paddingTop: '2.5rem',
        color: 'white',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        borderBottomLeftRadius: '24px',
        borderBottomRightRadius: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button onClick={onBack} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', padding: '0.2rem' }}>
              <ChevronLeft size={24} />
            </button>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>कार्यक्रम क्यालेन्डर</h2>
              <span style={{ fontSize: '0.75rem', opacity: 0.9 }}>२०८१ आश्विन महिनाका कार्यक्रमहरू</span>
            </div>
          </div>
          <button 
            style={{ 
              background: 'rgba(255, 255, 255, 0.2)', 
              border: 'none', 
              color: 'white', 
              borderRadius: '50%', 
              padding: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <CalendarIcon size={18} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ padding: '1.25rem 1rem', flex: 1, overflowY: 'auto', paddingBottom: '6rem' }}>
        
        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', marginBottom: '1rem', msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
          <button
            onClick={() => setFilter('all')}
            style={{
              padding: '0.4rem 1rem',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: 700,
              whiteSpace: 'nowrap',
              border: filter === 'all' ? '1.5px solid #8B5CF6' : '1px solid #E2E8F0',
              backgroundColor: filter === 'all' ? '#EDE9FE' : '#ffffff',
              color: filter === 'all' ? '#6D28D9' : '#64748B',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            सबै कार्यक्रम
          </button>
          {Object.entries(TYPE_CONFIG).map(([type, config]) => (
            <button
              key={type}
              onClick={() => setFilter(type as EventType)}
              style={{
                padding: '0.4rem 1rem',
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: 700,
                whiteSpace: 'nowrap',
                border: filter === type ? `1.5px solid ${config.color}` : '1px solid #E2E8F0',
                backgroundColor: filter === type ? config.bg : '#ffffff',
                color: filter === type ? config.color : '#64748B',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {config.label}
            </button>
          ))}
        </div>

        {/* Events List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {sortedEvents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94A3B8' }}>
              <CalendarIcon size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#64748B' }}>कुनै कार्यक्रम छैन</h3>
              <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>यस महिनाको लागि कुनै कार्यक्रम तय गरिएको छैन।</p>
            </div>
          ) : (
            sortedEvents.map(event => {
              const conf = TYPE_CONFIG[event.type];
              return (
                <div key={event.id} style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  border: '1px solid #E2E8F0',
                  padding: '1rem',
                  display: 'flex',
                  gap: '1rem',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                }}>
                  {/* Date Column */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: '55px',
                    height: '55px',
                    backgroundColor: conf.bg,
                    borderRadius: '12px',
                    border: `1px solid ${conf.color}40`
                  }}>
                    <span style={{ fontSize: '0.65rem', fontWeight: 700, color: conf.color, textTransform: 'uppercase' }}>{event.month}</span>
                    <span style={{ fontSize: '1.4rem', fontWeight: 900, color: conf.color, lineHeight: 1 }}>{event.date}</span>
                  </div>

                  {/* Details Column */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                      <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1E293B', margin: 0 }}>{event.title}</h3>
                      <span style={{ 
                        fontSize: '0.6rem', 
                        fontWeight: 700, 
                        color: conf.color, 
                        backgroundColor: conf.bg,
                        padding: '2px 8px',
                        borderRadius: '10px'
                      }}>
                        {conf.label}
                      </span>
                    </div>

                    {event.description && (
                      <p style={{ fontSize: '0.75rem', color: '#64748B', margin: '0 0 0.5rem 0' }}>{event.description}</p>
                    )}

                    {(event.time || event.location) && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.5rem' }}>
                        {event.time && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569', fontSize: '0.75rem', fontWeight: 600 }}>
                            <Clock size={13} color="#8B5CF6" />
                            {event.time}
                          </div>
                        )}
                        {event.location && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569', fontSize: '0.75rem', fontWeight: 600 }}>
                            <MapPin size={13} color="#EF4444" />
                            {event.location}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
