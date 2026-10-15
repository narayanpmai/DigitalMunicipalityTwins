import React, { useState, useEffect, useMemo } from 'react';
import {
  BS_MONTH_DAYS,
  BS_MONTH_NAMES,
  toNepaliDigits,
  toEnglishDigits,
  bsToDaysDiff,
  bsToAd,
  adToBs,
} from '../../utils/nepaliCalendar';
import { Calendar, ChevronLeft, ChevronRight, Clock, X } from 'lucide-react';

interface BsCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialBsDate?: string;
  onSelectDate: (bsDate: string, adDate: string) => void;
  title?: string;
}

export const BsCalendarModal: React.FC<BsCalendarModalProps> = ({
  isOpen,
  onClose,
  initialBsDate,
  onSelectDate,
  title = 'नेपाली पात्रो (वि.सं.)',
}) => {
  const [activeYear, setActiveYear] = useState<number>(2082);
  const [activeMonth, setActiveMonth] = useState<number>(4); // साउन
  const [selectedDay, setSelectedDay] = useState<number>(1);

  // Initialize from initialBsDate or Today
  useEffect(() => {
    if (!isOpen) return;

    if (initialBsDate) {
      const eng = toEnglishDigits(initialBsDate);
      const parts = eng.split('-');
      if (parts.length === 3) {
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10);
        const d = parseInt(parts[2], 10);
        if (y >= 2075 && y <= 2090 && m >= 1 && m <= 12 && d >= 1 && d <= 32) {
          setActiveYear(y);
          setActiveMonth(m);
          setSelectedDay(d);
          return;
        }
      }
    }

    // Default to today
    const todayBs = adToBs(new Date().toISOString().split('T')[0]).split('-');
    setActiveYear(parseInt(todayBs[0], 10) || 2081);
    setActiveMonth(parseInt(todayBs[1], 10) || 4);
    setSelectedDay(parseInt(todayBs[2], 10) || 1);
  }, [isOpen, initialBsDate]);

  const monthDaysList = useMemo(() => {
    return BS_MONTH_DAYS[activeYear] || [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30];
  }, [activeYear]);

  const totalDays = monthDaysList[activeMonth - 1] || 30;

  const startWeekday = useMemo(() => {
    const diffFirstDay = bsToDaysDiff(activeYear, activeMonth, 1);
    let wd = (6 + (diffFirstDay % 7)) % 7;
    if (wd < 0) wd += 7;
    return wd;
  }, [activeYear, activeMonth]);

  const [tY, tM, tD] = useMemo(() => {
    const todayBsStr = adToBs(new Date().toISOString().split('T')[0]);
    return todayBsStr.split('-').map(Number);
  }, []);

  const handlePrevMonth = () => {
    if (activeMonth === 1) {
      setActiveMonth(12);
      setActiveYear((y) => Math.max(2075, y - 1));
    } else {
      setActiveMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (activeMonth === 12) {
      setActiveMonth(1);
      setActiveYear((y) => Math.min(2090, y + 1));
    } else {
      setActiveMonth((m) => m + 1);
    }
  };

  const handleSelectSpecificDate = (y: number, m: number, d: number) => {
    setSelectedDay(d);
    setActiveYear(y);
    setActiveMonth(m);
    const mm = String(m).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    const bsDateNep = `${toNepaliDigits(y)}-${toNepaliDigits(mm)}-${toNepaliDigits(dd)}`;
    const adDate = bsToAd(y, m, d);
    onSelectDate(bsDateNep, adDate);
    onClose();
  };

  const handleSelectDay = (day: number) => {
    handleSelectSpecificDate(activeYear, activeMonth, day);
  };

  const handleToday = () => {
    handleSelectSpecificDate(tY, tM, tD);
  };

  if (!isOpen) return null;

  const selectedAdDate = bsToAd(activeYear, activeMonth, selectedDay);
  const selectedLabel = `${toNepaliDigits(activeYear)} ${BS_MONTH_NAMES[activeMonth - 1]} ${toNepaliDigits(
    String(selectedDay).padStart(2, '0')
  )} गते (${selectedAdDate} A.D.)`;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '380px',
          backgroundColor: '#1e293b',
          color: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #475569',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease-out',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            backgroundColor: 'rgba(15, 23, 42, 0.7)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={18} color="#f59e0b" />
            <div>
              <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>{title}</h4>
              <small style={{ color: '#94a3b8', fontSize: '0.72rem' }}>Bikram Sambat Calendar</small>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '6px',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1rem' }}>
          {/* Year & Month Selection Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
            <button
              type="button"
              onClick={handlePrevMonth}
              title="अघिल्लो महिना"
              style={{
                padding: '6px 8px',
                borderRadius: '8px',
                backgroundColor: '#0f172a',
                border: '1px solid #475569',
                color: '#ffffff',
                cursor: 'pointer',
              }}
            >
              <ChevronLeft size={16} />
            </button>

            <select
              value={activeYear}
              onChange={(e) => setActiveYear(parseInt(e.target.value, 10))}
              style={{
                flex: 1,
                padding: '6px 8px',
                borderRadius: '8px',
                backgroundColor: '#0f172a',
                border: '1px solid #475569',
                color: '#ffffff',
                fontSize: '0.85rem',
                fontWeight: 600,
                outline: 'none',
              }}
            >
              {Array.from({ length: 16 }, (_, i) => 2075 + i).map((yr) => (
                <option key={yr} value={yr}>
                  {toNepaliDigits(yr)} ({yr})
                </option>
              ))}
            </select>

            <select
              value={activeMonth}
              onChange={(e) => setActiveMonth(parseInt(e.target.value, 10))}
              style={{
                flex: 1,
                padding: '6px 8px',
                borderRadius: '8px',
                backgroundColor: '#0f172a',
                border: '1px solid #475569',
                color: '#ffffff',
                fontSize: '0.85rem',
                fontWeight: 600,
                outline: 'none',
              }}
            >
              {BS_MONTH_NAMES.map((name, idx) => (
                <option key={idx + 1} value={idx + 1}>
                  {name}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleNextMonth}
              title="पछिल्लो महिना"
              style={{
                padding: '6px 8px',
                borderRadius: '8px',
                backgroundColor: '#0f172a',
                border: '1px solid #475569',
                color: '#ffffff',
                cursor: 'pointer',
              }}
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Weekday Headers */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              textAlign: 'center',
              fontWeight: 700,
              fontSize: '0.75rem',
              marginBottom: '6px',
            }}
          >
            <div style={{ color: '#f87171', padding: '4px 0' }}>आइत</div>
            <div style={{ color: '#94a3b8', padding: '4px 0' }}>सोम</div>
            <div style={{ color: '#94a3b8', padding: '4px 0' }}>मङ्गल</div>
            <div style={{ color: '#94a3b8', padding: '4px 0' }}>बुध</div>
            <div style={{ color: '#94a3b8', padding: '4px 0' }}>बिही</div>
            <div style={{ color: '#94a3b8', padding: '4px 0' }}>शुक्र</div>
            <div style={{ color: '#f87171', padding: '4px 0' }}>शनि</div>
          </div>

          {/* Days Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '4px',
              textAlign: 'center',
            }}
          >
            {/* Leading empty cells */}
            {Array.from({ length: startWeekday }).map((_, idx) => (
              <div key={`empty-${idx}`} style={{ height: '36px' }} />
            ))}

            {/* Days */}
            {Array.from({ length: totalDays }).map((_, idx) => {
              const day = idx + 1;
              const weekday = (startWeekday + day - 1) % 7;
              const isSat = weekday === 6;
              const isToday = activeYear === tY && activeMonth === tM && day === tD;
              const isSelected = day === selectedDay;

              return (
                <div
                  key={day}
                  onClick={() => handleSelectDay(day)}
                  style={{
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '8px',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    backgroundColor: isSelected
                      ? '#2563eb'
                      : isToday
                      ? 'rgba(56, 189, 248, 0.2)'
                      : 'rgba(255, 255, 255, 0.05)',
                    color: isSelected
                      ? '#ffffff'
                      : isSat
                      ? '#f87171'
                      : isToday
                      ? '#38bdf8'
                      : '#f1f5f9',
                    border: isSelected
                      ? '1px solid #93c5fd'
                      : isToday
                      ? '1px solid #38bdf8'
                      : '1px solid rgba(255, 255, 255, 0.08)',
                    boxShadow: isSelected ? '0 0 10px rgba(37, 99, 235, 0.6)' : 'none',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = '#1d4ed8';
                      e.currentTarget.style.color = '#ffffff';
                      e.currentTarget.style.transform = 'scale(1.08)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = isToday
                        ? 'rgba(56, 189, 248, 0.2)'
                        : 'rgba(255, 255, 255, 0.05)';
                      e.currentTarget.style.color = isSat ? '#f87171' : isToday ? '#38bdf8' : '#f1f5f9';
                      e.currentTarget.style.transform = 'scale(1)';
                    }
                  }}
                  title={`${toNepaliDigits(activeYear)} ${BS_MONTH_NAMES[activeMonth - 1]} ${toNepaliDigits(day)}`}
                >
                  {toNepaliDigits(day)}
                </div>
              );
            })}
          </div>

          {/* Selected Date Preview */}
          <div
            style={{
              marginTop: '1rem',
              padding: '8px 12px',
              borderRadius: '8px',
              backgroundColor: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.78rem',
            }}
          >
            <span style={{ color: '#94a3b8' }}>छानिएको मिति:</span>
            <span style={{ color: '#fbbf24', fontWeight: 700, fontFamily: 'monospace' }}>{selectedLabel}</span>
          </div>
        </div>

        {/* Modal Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 16px',
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <button
            type="button"
            onClick={handleToday}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 10px',
              borderRadius: '6px',
              border: '1px solid #38bdf8',
              backgroundColor: 'transparent',
              color: '#38bdf8',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Clock size={12} />
            <span>आज (Today)</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '4px 12px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: '#475569',
              color: '#ffffff',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            बन्द
          </button>
        </div>
      </div>
    </div>
  );
};
