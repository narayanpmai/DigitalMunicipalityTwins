import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { adToBs, BS_MONTH_DAYS } from '../../utils/nepaliCalendar';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  MapPin,
  Clock,
  Users,
  Search,
  Filter,
  Trash2,
  Edit2,
  Save,
  CheckCircle2
} from 'lucide-react';

// BS Calendar specific constants (Mock data for Ashoj 2081)
const MONTHS_BS = [
  'वैशाख', 'जेठ', 'असार', 'साउन', 'भदौ', 'आश्विन',
  'कार्तिक', 'मंसिर', 'पुष', 'माघ', 'फागुन', 'चैत्र'
];
const DAYS_NEP = ['आइत', 'सोम', 'मंगल', 'बुध', 'बिही', 'शुक्र', 'शनि'];
const NEPALI_NUMBERS = ['०','१','२','३','४','५','६','७','८','९'];

const toNepali = (num: number) => num.toString().split('').map(n => NEPALI_NUMBERS[parseInt(n)] || n).join('');

type EventType = 'meeting' | 'holiday' | 'festival' | 'training' | 'other';

interface AppEvent {
  id: string;
  title: string;
  date: number; // Day of the month
  type: EventType;
  time?: string;
  location?: string;
  description?: string;
}

const INITIAL_EVENTS: AppEvent[] = [
  { id: '1', title: 'कार्यपालिका बैठक', date: 5, type: 'meeting', time: '११:०० बजे', location: 'गाउँपालिका सभाहल' },
  { id: '2', title: 'संविधान दिवस', date: 3, type: 'holiday', description: 'सार्वजनिक विदा' },
  { id: '3', title: 'कृषक तालिम', date: 12, type: 'training', time: '१०:०० बजे', location: 'वडा नं ३ कार्यालय' },
  { id: '4', title: 'विजया दशमी', date: 26, type: 'festival', description: 'सार्वजनिक विदा' },
  { id: '5', title: 'गाउँसभा तयारी', date: 18, type: 'meeting', time: '२:०० बजे', location: 'अध्यक्षको कार्यकक्ष' }
];

const TYPE_CONFIG: Record<EventType, { color: string, bg: string, label: string }> = {
  meeting: { color: '#0F4C81', bg: '#EBF3FA', label: 'बैठक' },
  holiday: { color: '#DC2626', bg: '#FEF2F2', label: 'सार्वजनिक विदा' },
  festival: { color: '#D97706', bg: '#FEF3C7', label: 'चाडपर्व' },
  training: { color: '#059669', bg: '#D1FAE5', label: 'तालिम/गोष्ठी' },
  other: { color: '#4B5563', bg: '#F3F4F6', label: 'अन्य' }
};

export const EventCalendarPage: React.FC = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/app');
  
  // Get current Nepali date
  const todayAd = new Date().toISOString().split('T')[0];
  let defaultYear = 2083;
  let defaultMonth = 5; // 0-indexed (Ashwin)
  let todayBsDay = 12;

  try {
    const bsDate = adToBs(todayAd); // e.g., '2083-06-12'
    if (bsDate) {
      const parts = bsDate.split('-');
      defaultYear = parseInt(parts[0], 10);
      defaultMonth = parseInt(parts[1], 10) - 1;
      todayBsDay = parseInt(parts[2], 10);
    }
  } catch (e) {
    console.error('Nepali date parsing failed', e);
  }

  const [currentYear, setCurrentYear] = useState(defaultYear);
  const [currentMonth, setCurrentMonth] = useState(defaultMonth);
  const [events, setEvents] = useState<AppEvent[]>(INITIAL_EVENTS);
  const [isEditing, setIsEditing] = useState(false);
  const [search, setSearch] = useState('');

  // Calculate days in month and starting day offset
  const daysInMonth = BS_MONTH_DAYS[currentYear]?.[currentMonth] || 30;
  // A simple pseudo-random offset that stays consistent for a given month/year
  const startDayOffset = (currentYear + currentMonth) % 7;

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  };

  const handleAddEvent = (day: number) => {
    if (!isAdmin || !isEditing) return;
    const title = window.prompt(`आश्विन ${toNepali(day)} को लागि नयाँ कार्यक्रमको नाम:`);
    if (title) {
      setEvents([...events, {
        id: Date.now().toString(),
        title,
        date: day,
        type: 'meeting',
      }]);
    }
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if(window.confirm('के तपाईं यो कार्यक्रम हटाउन निश्चित हुनुहुन्छ?')) {
      setEvents(events.filter(ev => ev.id !== id));
    }
  };

  return (
    <div style={{ padding: '24px 32px', background: '#F8FAFC', minHeight: '100vh', fontFamily: "'Noto Sans Devanagari','Inter',sans-serif" }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#EBF3FA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CalendarIcon size={24} color="#0F4C81" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F172A', margin: '0 0 4px 0' }}>पालिका कार्यक्रम क्यालेन्डर</h1>
            <p style={{ color: '#64748B', fontSize: '0.95rem', margin: 0 }}>पालिकाका सम्पूर्ण गतिविधि, विदा र बैठकहरूको सूची</p>
          </div>
        </div>
        
        {isAdmin && (
          <button 
            onClick={() => setIsEditing(!isEditing)} 
            style={{ padding: '8px 16px', background: isEditing ? '#DC2626' : '#0F4C81', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            {isEditing ? <><Save size={16}/> सुरक्षित गर्नुहोस्</> : <><Edit2 size={16}/> सम्पादन गर्नुहोस्</>}
          </button>
        )}
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '16px 20px', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button onClick={prevMonth} style={{ padding: '8px', background: '#F1F5F9', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <ChevronLeft size={20} color="#475569" />
          </button>
          
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A', minWidth: '180px', textAlign: 'center' }}>
            {MONTHS_BS[currentMonth]} {toNepali(currentYear)}
          </div>
          
          <button onClick={nextMonth} style={{ padding: '8px', background: '#F1F5F9', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <ChevronRight size={20} color="#475569" />
          </button>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="कार्यक्रम खोज्नुहोस्..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ padding: '8px 16px 8px 36px', border: '1.5px solid #E2E8F0', borderRadius: '8px', fontSize: '0.85rem', outline: 'none' }} 
            />
          </div>
          <button style={{ padding: '8px', background: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <Filter size={18} color="#475569" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        {/* Days Header */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
          {DAYS_NEP.map((d, i) => (
            <div key={d} style={{ padding: '12px', textAlign: 'center', fontWeight: 700, fontSize: '0.9rem', color: i === 6 ? '#DC2626' : '#475569' }}>
              {d}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
          {Array.from({ length: startDayOffset }).map((_, i) => (
            <div key={`empty-${i}`} style={{ minHeight: '120px', borderRight: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0', background: '#F8FAFC', opacity: 0.5 }}></div>
          ))}
          
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dayEvents = events.filter(e => e.date === day && e.title.includes(search));
            const isToday = currentYear === defaultYear && currentMonth === defaultMonth && day === todayBsDay;
            const isSaturday = (startDayOffset + i) % 7 === 6;
            
            return (
              <div 
                key={day} 
                onClick={() => handleAddEvent(day)}
                style={{ 
                  minHeight: '130px', 
                  padding: '8px', 
                  borderRight: '1px solid #E2E8F0', 
                  borderBottom: '1px solid #E2E8F0',
                  background: isToday ? '#F0F9FF' : '#fff',
                  cursor: (isAdmin && isEditing) ? 'pointer' : 'default',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ 
                    fontSize: '1rem', 
                    fontWeight: 700, 
                    color: isSaturday ? '#DC2626' : (isToday ? '#0284C7' : '#1E293B'),
                    background: isToday ? '#E0F2FE' : 'transparent',
                    width: '28px', height: '28px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: '50%'
                  }}>
                    {toNepali(day)}
                  </span>
                  {(isAdmin && isEditing) && (
                    <Plus size={14} color="#94A3B8" style={{ opacity: 0.5 }} />
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {dayEvents.map(ev => (
                    <div 
                      key={ev.id} 
                      style={{ 
                        background: TYPE_CONFIG[ev.type].bg, 
                        borderLeft: `3px solid ${TYPE_CONFIG[ev.type].color}`,
                        padding: '6px 8px', 
                        borderRadius: '0 4px 4px 0',
                        fontSize: '0.75rem',
                        position: 'relative'
                      }}
                    >
                      <div style={{ fontWeight: 700, color: TYPE_CONFIG[ev.type].color, marginBottom: '2px' }}>{ev.title}</div>
                      {ev.time && <div style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#475569', fontSize: '0.65rem' }}><Clock size={10} /> {ev.time}</div>}
                      {ev.location && <div style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#475569', fontSize: '0.65rem', marginTop: '2px' }}><MapPin size={10} /> {ev.location}</div>}
                      
                      {(isAdmin && isEditing) && (
                        <button 
                          onClick={(e) => handleDelete(e, ev.id)} 
                          style={{ position: 'absolute', top: '4px', right: '4px', background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer' }}
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div style={{ marginTop: '20px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        {Object.values(TYPE_CONFIG).map((t, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#475569', fontWeight: 600 }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: t.bg, border: `1px solid ${t.color}` }}></span>
            {t.label}
          </div>
        ))}
      </div>
    </div>
  );
};
export default EventCalendarPage;
