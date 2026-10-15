import React, { useState } from 'react';
import { Calendar, X, Clock } from 'lucide-react';
import { BsCalendarModal } from './BsCalendarModal';
import { adToBs, toNepaliDigits } from '../../utils/nepaliCalendar';

interface NepaliDatePickerProps {
  value: string;
  onChange: (bsDate: string, adDate?: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  style?: React.CSSProperties;
  inputStyle?: React.CSSProperties;
  className?: string;
}

export const NepaliDatePicker: React.FC<NepaliDatePickerProps> = ({
  value,
  onChange,
  label,
  placeholder = 'उदा: २०८१-०९-१४',
  required = false,
  disabled = false,
  style,
  inputStyle,
  className = '',
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSetToday = (e: React.MouseEvent) => {
    e.stopPropagation();
    const todayBs = adToBs(new Date().toISOString().split('T')[0]);
    const todayAd = new Date().toISOString().split('T')[0];
    onChange(todayBs, todayAd);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', width: '100%', ...style }} className={className}>
      {label && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
            {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
          </label>
          <button
            type="button"
            onClick={handleSetToday}
            style={{
              background: 'none',
              border: 'none',
              color: '#2563eb',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '2px',
              padding: '0 2px',
            }}
          >
            <Clock size={12} /> आज
          </button>
        </div>
      )}

      <div
        onClick={() => !disabled && setIsModalOpen(true)}
        style={{
          display: 'flex',
          alignItems: 'center',
          border: '1px solid #cbd5e1',
          borderRadius: '8px',
          padding: '0.55rem 0.75rem',
          backgroundColor: disabled ? '#f1f5f9' : '#ffffff',
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'all 0.15s ease',
          boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
          ...inputStyle,
        }}
        title="नेपाली पात्रोबाट मिति छनोट गर्नुहोस्"
      >
        <Calendar size={18} color="#64748b" style={{ marginRight: '0.5rem', flexShrink: 0 }} />
        <span
          style={{
            flex: 1,
            fontSize: '0.9rem',
            color: value ? '#0f172a' : '#94a3b8',
            fontFamily: 'inherit',
          }}
        >
          {value || placeholder}
        </span>

        {value && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '2px',
              display: 'flex',
              alignItems: 'center',
              borderRadius: '4px',
            }}
            title="मेटाउनुहोस्"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <BsCalendarModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialBsDate={value}
        onSelectDate={(bsDate, adDate) => {
          onChange(bsDate, adDate);
          setIsModalOpen(false);
        }}
        title={label ? `${label} छनोट (वि.सं.)` : 'नेपाली मिति छनोट'}
      />
    </div>
  );
};
