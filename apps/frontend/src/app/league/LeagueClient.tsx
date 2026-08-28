'use client';

import LaurelRankMedal from '../../components/LaurelRankMedal';
import React, { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import SearchInput from '../../components/SearchInput';
import BadgeCrest from '../../components/BadgeCrest';
import ChampionshipTrophy3D from '../../components/ChampionshipTrophy3D';
import {
  computeCounselorGamification,
  computeCampusLeagueStandings,
  CounselorGamification,
  CampusLeagueStanding,
  Badge,
  ALL_BADGES,
} from '../../lib/gamification';
import { SessionUser } from '../../lib/auth';

interface LeagueClientProps {
  students: any[];
  counselors: any[];
  convertedLeads?: any[];
  branches: any[];
  user: SessionUser;
}

function getInitials(name: string): string {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Custom Ultra-Modern Dropdown Component (Opens Downwards with Glassmorphism)
interface ModernDropdownProps {
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (val: string) => void;
  width?: string;
  height?: string;
  prefix?: React.ReactNode;
  align?: 'left' | 'right';
}

const ModernDropdownMenu: React.FC<ModernDropdownProps> = ({ value, options, onChange, width = 'auto', height = '26px', prefix, align = 'right' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((o) => o.value === value) || options[0];

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          height,
          width: width === 'auto' ? 'auto' : width,
          minWidth: width === 'auto' ? '112px' : width,
          padding: '0 10px',
          borderRadius: '7px',
          border: '1.2px solid var(--border)',
          background: 'var(--card-bg)',
          color: 'var(--text)',
          fontSize: '0.74rem',
          fontWeight: 700,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          outline: 'none',
          boxSizing: 'border-box',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          transition: 'all 0.15s ease',
          lineHeight: height,
          whiteSpace: 'nowrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap' }}>
          {prefix}
          <span style={{ whiteSpace: 'nowrap', lineHeight: '1' }}>
            {selectedOption?.label || value}
          </span>
        </div>
        <svg
          style={{
            width: '10px',
            height: '10px',
            flexShrink: 0,
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
            color: 'var(--primary)',
            marginLeft: '4px',
          }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            ...(align === 'right' ? { right: 0 } : { left: 0 }),
            zIndex: 99999,
            minWidth: width === 'auto' ? '140px' : `max(${width}, 140px)`,
            background: 'var(--card-bg)',
            border: '1.5px solid var(--border)',
            borderRadius: '9px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.14), 0 4px 10px rgba(0,0,0,0.06)',
            padding: '4px',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
            backdropFilter: 'blur(12px)',
            animation: 'fadeIn 0.15s ease-out',
          }}
        >
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <div
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                style={{
                  padding: '5px 10px',
                  borderRadius: '6px',
                  fontSize: '0.73rem',
                  fontWeight: isSelected ? 800 : 600,
                  color: isSelected ? 'var(--primary)' : 'var(--text)',
                  background: isSelected ? 'rgba(99, 102, 241, 0.12)' : 'transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'background 0.12s ease',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'var(--surface-alt)';
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'transparent';
                }}
              >
                <span>{opt.label}</span>
                {isSelected && (
                  <span style={{ fontSize: '0.72rem', color: 'var(--primary)', marginLeft: '6px' }}>✓</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Custom Ultra-Modern Date Picker Component (Opens Downwards with Glassmorphic Calendar)
interface ModernDatePickerProps {
  value: string; // "YYYY-MM-DD"
  onChange: (val: string) => void;
  width?: string;
  height?: string;
}

const ModernDatePicker: React.FC<ModernDatePickerProps> = ({ value, onChange, width = '112px', height = '26px' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);

  const parsedDate = value ? new Date(value) : new Date(2026, 7, 28);
  const [viewYear, setViewYear] = useState(parsedDate.getFullYear() || 2026);
  const [viewMonth, setViewMonth] = useState(parsedDate.getMonth() || 7);

  useEffect(() => {
    if (value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) {
        setViewYear(d.getFullYear());
        setViewMonth(d.getMonth());
      }
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fullMonthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    const mm = String(viewMonth + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    onChange(`${viewYear}-${mm}-${dd}`);
    setIsOpen(false);
  };

  const formattedDisplay = useMemo(() => {
    if (!value) return 'Select date';
    const parts = value.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return value;
  }, [value]);

  return (
    <div ref={datePickerRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          height,
          width,
          padding: '0 6px',
          borderRadius: '7px',
          border: '1px solid var(--border)',
          background: 'var(--card-bg)',
          color: 'var(--text)',
          fontSize: '0.73rem',
          fontWeight: 700,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          outline: 'none',
          boxSizing: 'border-box',
          boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
          transition: 'all 0.15s ease',
          lineHeight: height,
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: '1' }}>
          {formattedDisplay}
        </span>
        <svg
          style={{ width: '11px', height: '11px', flexShrink: 0, color: 'var(--primary)', marginLeft: '3px' }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            right: 0,
            zIndex: 99999,
            width: '210px',
            background: 'var(--card-bg)',
            border: '1.5px solid var(--border)',
            borderRadius: '12px',
            boxShadow: '0 12px 30px rgba(0,0,0,0.15), 0 4px 10px rgba(0,0,0,0.08)',
            padding: '10px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            backdropFilter: 'blur(16px)',
          }}
        >
          {/* Header Month / Year controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              type="button"
              onClick={handlePrevMonth}
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                width: '22px',
                height: '22px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--text)',
                fontSize: '0.8rem',
                fontWeight: 800,
              }}
            >
              ‹
            </button>
            <span style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--text)' }}>
              {fullMonthNames[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                width: '22px',
                height: '22px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--text)',
                fontSize: '0.8rem',
                fontWeight: 800,
              }}
            >
              ›
            </button>
          </div>

          {/* Days of week header */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', gap: '2px' }}>
            {daysOfWeek.map((d) => (
              <span key={d} style={{ fontSize: '0.64rem', fontWeight: 800, color: 'var(--muted)' }}>
                {d}
              </span>
            ))}
          </div>

          {/* Calendar Day Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
            {Array.from({ length: firstDayIndex }).map((_, idx) => (
              <div key={`empty-${idx}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const isSelected = value === dateStr;
              const isToday = viewYear === 2026 && viewMonth === 7 && dayNum === 28;

              return (
                <button
                  key={dayNum}
                  type="button"
                  onClick={() => handleSelectDay(dayNum)}
                  style={{
                    height: '24px',
                    width: '100%',
                    borderRadius: '6px',
                    border: isToday && !isSelected ? '1px solid var(--primary)' : 'none',
                    background: isSelected ? 'var(--primary)' : 'transparent',
                    color: isSelected ? '#ffffff' : 'var(--text)',
                    fontSize: '0.72rem',
                    fontWeight: isSelected || isToday ? 800 : 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.12s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'var(--surface-alt)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'transparent';
                  }}
                >
                  {dayNum}
                </button>
              );
            })}
          </div>

          {/* Quick Action Footer: Reset / Today */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '6px', borderTop: '1px solid var(--border)' }}>
            <button
              type="button"
              onClick={() => {
                onChange('2026-08-28');
                setIsOpen(false);
              }}
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '5px',
                color: 'var(--text)',
                fontSize: '0.68rem',
                fontWeight: 700,
                cursor: 'pointer',
                padding: '2px 8px',
              }}
            >
              Reset
            </button>
            <button
              type="button"
              onClick={() => {
                onChange('2026-08-28');
                setIsOpen(false);
              }}
              style={{
                background: 'rgba(99, 102, 241, 0.1)',
                border: 'none',
                borderRadius: '5px',
                padding: '2px 8px',
                color: 'var(--primary)',
                fontSize: '0.68rem',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
};


// Custom Ultra-Modern Dual-Month Date Range Picker Component
interface ModernDateRangePickerProps {
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  onChange: (start: string, end: string) => void;
  height?: string;
}

const ModernDateRangePicker: React.FC<ModernDateRangePickerProps> = ({
  startDate,
  endDate,
  onChange,
  height = '26px',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Temporary state while picking in popup
  const [tempStart, setTempStart] = useState(startDate || '2026-08-01');
  const [tempEnd, setTempEnd] = useState(endDate || '2026-08-28');

  // Active month view for left calendar
  const [leftYear, setLeftYear] = useState(2026);
  const [leftMonth, setLeftMonth] = useState(7); // August (0-indexed)

  useEffect(() => {
    if (startDate) setTempStart(startDate);
    if (endDate) setTempEnd(endDate);
    if (startDate) {
      const d = new Date(startDate);
      if (!isNaN(d.getTime())) {
        setLeftYear(d.getFullYear());
        setLeftMonth(d.getMonth());
      }
    }
  }, [startDate, endDate, isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fullMonthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  // Right calendar month/year is 1 month after left
  const rightMonth = leftMonth === 11 ? 0 : leftMonth + 1;
  const rightYear = leftMonth === 11 ? leftYear + 1 : leftYear;

  const handlePrevMonth = () => {
    if (leftMonth === 0) {
      setLeftMonth(11);
      setLeftYear(leftYear - 1);
    } else {
      setLeftMonth(leftMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (leftMonth === 11) {
      setLeftMonth(0);
      setLeftYear(leftYear + 1);
    } else {
      setLeftMonth(leftMonth + 1);
    }
  };

  const handleDayClick = (dateStr: string) => {
    if (!tempStart || (tempStart && tempEnd)) {
      setTempStart(dateStr);
      setTempEnd('');
    } else if (tempStart && !tempEnd) {
      if (new Date(dateStr) < new Date(tempStart)) {
        setTempEnd(tempStart);
        setTempStart(dateStr);
      } else {
        setTempEnd(dateStr);
      }
    }
  };

  const renderMonthGrid = (year: number, month: number, isLeft: boolean) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayIndex = new Date(year, month, 1).getDay();

    return (
      <div style={{ width: '200px' }}>
        {/* Symmetrical & Non-Overlapping Month Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '10px',
          height: '24px',
        }}>
          {isLeft ? (
            <button
              type="button"
              onClick={handlePrevMonth}
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--text)',
                fontSize: '0.8rem',
                fontWeight: 800,
                flexShrink: 0,
              }}
            >
              ‹
            </button>
          ) : (
            <div style={{ width: '24px' }} />
          )}

          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text)', textAlign: 'center', flexGrow: 1 }}>
            {fullMonthNames[month]} {year}
          </span>

          {!isLeft ? (
            <button
              type="button"
              onClick={handleNextMonth}
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--text)',
                fontSize: '0.8rem',
                fontWeight: 800,
                flexShrink: 0,
              }}
            >
              ›
            </button>
          ) : (
            <div style={{ width: '24px' }} />
          )}
        </div>

        {/* Days of Week */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', gap: '2px', marginBottom: '6px' }}>
          {daysOfWeek.map((d) => (
            <span key={d} style={{ fontSize: '0.66rem', fontWeight: 800, color: 'var(--primary)' }}>
              {d}
            </span>
          ))}
        </div>

        {/* Day Cells */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
          {Array.from({ length: firstDayIndex }).map((_, idx) => (
            <div key={`empty-${idx}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const dayNum = idx + 1;
            const mm = String(month + 1).padStart(2, '0');
            const dd = String(dayNum).padStart(2, '0');
            const dateStr = `${year}-${mm}-${dd}`;

            const isStart = tempStart === dateStr;
            const isEnd = tempEnd === dateStr;
            const inRange = tempStart && tempEnd && new Date(dateStr) > new Date(tempStart) && new Date(dateStr) < new Date(tempEnd);

            return (
              <button
                key={dayNum}
                type="button"
                onClick={() => handleDayClick(dateStr)}
                style={{
                  height: '24px',
                  width: '100%',
                  borderRadius: isStart ? '6px 0 0 6px' : isEnd ? '0 6px 6px 0' : inRange ? '0' : '6px',
                  border: 'none',
                  background: isStart || isEnd ? 'var(--primary)' : inRange ? 'rgba(99, 102, 241, 0.14)' : 'transparent',
                  color: isStart || isEnd ? '#ffffff' : inRange ? 'var(--primary)' : 'var(--text)',
                  fontSize: '0.72rem',
                  fontWeight: isStart || isEnd || inRange ? 800 : 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.1s ease',
                  padding: 0,
                }}
                onMouseEnter={(e) => {
                  if (!isStart && !isEnd && !inRange) (e.currentTarget as HTMLElement).style.background = 'var(--surface-alt)';
                }}
                onMouseLeave={(e) => {
                  if (!isStart && !isEnd && !inRange) (e.currentTarget as HTMLElement).style.background = 'transparent';
                }}
              >
                {dayNum}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const formatDisplay = (dStr: string) => {
    if (!dStr) return '--/--/----';
    const parts = dStr.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return dStr;
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
      <span style={{ fontSize: '0.7rem', color: 'var(--muted)', fontWeight: 700 }}>From:</span>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          height,
          width: '112px',
          padding: '0 6px',
          borderRadius: '6px',
          border: '1px solid var(--border)',
          background: 'var(--card-bg)',
          color: 'var(--text)',
          fontSize: '0.73rem',
          fontWeight: 700,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          outline: 'none',
          boxSizing: 'border-box',
          boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
        }}
      >
        <span>{formatDisplay(startDate)}</span>
        <svg style={{ width: '10px', height: '10px', color: 'var(--primary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </button>

      <span style={{ fontSize: '0.7rem', color: 'var(--muted)', fontWeight: 700 }}>To:</span>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          height,
          width: '112px',
          padding: '0 6px',
          borderRadius: '6px',
          border: '1px solid var(--border)',
          background: 'var(--card-bg)',
          color: 'var(--text)',
          fontSize: '0.73rem',
          fontWeight: 700,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          outline: 'none',
          boxSizing: 'border-box',
          boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
        }}
      >
        <span>{formatDisplay(endDate)}</span>
        <svg style={{ width: '10px', height: '10px', color: 'var(--primary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </button>

      {/* Dual Month Popover */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            right: 0,
            zIndex: 99999,
            background: 'var(--card-bg)',
            border: '1.5px solid var(--border)',
            borderRadius: '12px',
            boxShadow: '0 12px 32px rgba(0,0,0,0.16), 0 4px 12px rgba(0,0,0,0.08)',
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            backdropFilter: 'blur(16px)',
          }}
        >
          {/* Dual Month Headers & Grids with Symmetrical Layout & Full Month Names */}
          <div style={{ display: 'flex', gap: '18px', alignItems: 'flex-start' }}>
            <div>
              {renderMonthGrid(leftYear, leftMonth, true)}
            </div>

            <div style={{ borderLeft: '1.5px solid var(--border)', paddingLeft: '18px' }}>
              {renderMonthGrid(rightYear, rightMonth, false)}
            </div>
          </div>

          {/* Footer: Date Range String, Reset, Cancel & Apply Button */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '8px',
            borderTop: '1px solid var(--border)',
            gap: '12px',
          }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
              {tempStart || '----'} {tempEnd ? `– ${tempEnd}` : ''}
            </span>

            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => {
                  setTempStart('2026-08-01');
                  setTempEnd('2026-08-31');
                  setLeftYear(2026);
                  setLeftMonth(7);
                }}
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '5px',
                  color: 'var(--text)',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: '3px 8px',
                  transition: 'all 0.12s ease',
                }}
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--muted)',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: '4px 8px',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onChange(tempStart, tempEnd || tempStart);
                  setIsOpen(false);
                }}
                style={{
                  background: 'var(--primary)',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '4px 14px',
                  color: '#ffffff',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(99, 102, 241, 0.3)',
                }}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


export default function LeagueClient({ students, counselors, convertedLeads = [], branches, user }: LeagueClientProps) {
  const [activeTab, setActiveTab] = useState<'trophies' | 'badges' | 'points_table' | 'league' | 'targets' | 'clash' | 'counselors' | 'quests'>('trophies');
  const [selectedMonth, setSelectedMonth] = useState<string>('August 2026');
  const [trophyYear, setTrophyYear] = useState<'2026' | '2025' | 'all_time'>('2026');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [leagueMetricFilter, setLeagueMetricFilter] = useState<'all' | 'rpl' | 'wpl' | 'spl'>('all');
  
  // Interactive Campus Comparison Selectors
  const [campusAId, setCampusAId] = useState<string>('branch_jntu1');
  const [campusBId, setCampusBId] = useState<string>('branch_pista');
  const [claimedQuests, setClaimedQuests] = useState<Record<string, boolean>>({ q3: true });
  // Target Management & Incentive Tracking State
  const [targetHorizon, setTargetHorizon] = useState<'monthly' | 'weekly' | 'daily'>('monthly');
  const [targetScope, setTargetScope] = useState<'counselor' | 'campus'>('counselor');
  const [isEditTargetModalOpen, setIsEditTargetModalOpen] = useState(false);
  const [editingTargetEntity, setEditingTargetEntity] = useState<{ id: string; name: string; type: 'counselor' | 'campus' } | null>(null);
  
  // Customizable target multipliers or overrides
  const [customTargetsOverride, setCustomTargetsOverride] = useState<Record<string, { revenue: number; walkins: number; admissions: number; baseIncentive: number; stretchBonus: number }>>({});


  const monthShortName = selectedMonth.split(' ')[0]; // e.g. "August", "September"

  // Compute Gamification Data from Live DB
  const [selectedCounselorId, setSelectedCounselorId] = useState<string>('');
  const [badgeCategoryFilter, setBadgeCategoryFilter] = useState<'all' | 'revenue' | 'enrollment' | 'walkin' | 'dropout' | 'season'>('all');
  const [seasonCategoryFilter, setSeasonCategoryFilter] = useState<'all' | 'locations' | 'rpl' | 'wpl' | 'spl' | 'table' | 'medals'>('all');
  const [expandedAllTimeRolls, setExpandedAllTimeRolls] = useState<Record<string, boolean>>({});
  // Advanced Universal Analytics Timeframe Filter State
  interface AnalyticsTimeframeState {
    mode: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'all_time' | 'custom';
    dailySub: 'today' | 'yesterday' | 'custom_day';
    customDay: string;
    weeklySub: 'this_week' | 'last_week' | 'last_7_days';
    monthlySub: 'current_month' | 'prev_month' | 'specific_month';
    specificMonth: string;
    yearlySub: '2026' | '2025';
    customType: 'between' | 'after' | 'before';
    customStartDate: string;
    customEndDate: string;
  }

  const [analyticsTimeframe, setAnalyticsTimeframe] = useState<AnalyticsTimeframeState>({
    mode: 'monthly',
    dailySub: 'today',
    customDay: '2026-08-28',
    weeklySub: 'this_week',
    monthlySub: 'current_month',
    specificMonth: 'August 2026',
    yearlySub: '2026',
    customType: 'between',
    customStartDate: '2026-08-01',
    customEndDate: '2026-08-28',
  });
  const [selectedBadgeModal, setSelectedBadgeModal] = useState<Badge | null>(null);
  const [selectedSeasonModal, setSelectedSeasonModal] = useState<{
    seasonNumber: number;
    seasonName: string;
    totalMonthSales: number;
    winnerBranch: { name: string; sales: number; team: string[] } | null;
    runnerBranch: { name: string; sales: number; team: string[] } | null;
    championCoun: { name: string; sales: number; count: number } | null;
    allCounselors: { name: string; sales: number; count: number; branch: string }[];
    mLeads: any[];
  } | null>(null);
  const [drilldownStudentModal, setDrilldownStudentModal] = useState<{ title: string; records: any[] } | null>(null);
  const [selectedAllTimeLeagueModal, setSelectedAllTimeLeagueModal] = useState<{
    id: 'rpl' | 'wpl' | 'spl';
    title: string;
    subtitle: string;
    icon: string;
    trophyType: 'fifa_globe' | 'webb_ellis' | 'icc_pillars';
    color: string;
    topCampus: { name: string; wins: number; metricFormatted: string };
    rankings: Array<{ rank: number; name: string; wins: number; totalMetric: string }>;
    allWinners: Array<{
      seasonNumber: number;
      monthName: string;
      year: number;
      winnerLoc: string;
      metricFormatted: string;
      counselors: string[];
    }>;
  } | null>(null);
  const [selectedLocationCupModal, setSelectedLocationCupModal] = useState<{
    location: string;
    league: 'RPL' | 'WPL' | 'SPL';
    leagueTitle: string;
    trophyType: 'fifa_globe' | 'webb_ellis' | 'icc_pillars';
    winCount: number;
    winningSeasons: Array<{
      seasonNumber: number;
      monthName: string;
      metricValue: string;
      metricLabel: string;
      sales: number;
      count: number;
      counselors: string[];
      totalMonthSales: number;
    }>;
  } | null>(null);

  const campusStandings = useMemo(() => {
    return computeCampusLeagueStandings(branches, students, counselors, convertedLeads);
  }, [branches, students, counselors, convertedLeads]);


  const isExcludedFromTrophies = (name: string) => {
    const n = (name || '').toLowerCase().trim();
    return (
      n.includes('codegnan') ||
      n.includes('jaya sri') ||
      n.includes('jayasri') ||
      n.includes('jayasree') ||
      n.includes('bhanu satish') ||
      n.includes('bhanu') ||
      n.includes('anush') ||
      n.includes('anusha') ||
      n === 'admin' ||
      n === 'super admin' ||
      n === 'unassigned'
    );
  };

  // Returns human-readable location name for a counselor based on verified user-confirmed mapping.
  // Locations: Hyderabad | Vijayawada | Visakhapatnam | Bangalore
  const getCounselorLocation = (counName: string): string => {
    const n = (counName || '').toLowerCase().trim().replace(/[_-]/g, ' ');

    // ── VIJAYAWADA ──
    if (
      n.includes('maruthi') ||
      n.includes('naveen') ||        // Naveen Babu
      n.includes('monika') ||
      n.includes('sunandha') ||
      n.includes('sunanda') ||
      n.includes('lekha') ||
      n.includes('priyanka') ||
      n.includes('akhila') ||
      n.includes('parvathi')
    ) {
      return 'Vijayawada';
    }

    // ── VISAKHAPATNAM ──
    if (
      n.includes('vinay botcha') ||
      n.includes('vinay kumar') ||
      n.includes('doddipatla') ||
      n.includes('siva kumar') ||
      n.includes('siva nagasundhar') ||
      n.includes('sravanthi') ||
      n.includes('prashanthi') ||
      n.includes('kiran') ||
      n.includes('sai krishna')
    ) {
      return 'Visakhapatnam';
    }

    // ── BANGALORE ──
    if (n.includes('pushpa')) {
      return 'Bangalore';
    }

    // ── HYDERABAD (jahnavi, phanindra, vishal, koushik, kranthi/battula, shireesha, sasank, vamshi, subramanyam) ──
    if (
      n.includes('jahnavi') ||
      n.includes('phanindra') ||
      n.includes('vishal') ||
      n.includes('koushik') ||
      n.includes('kranthi') ||
      n.includes('battula') ||
      n.includes('shireesha') ||
      n.includes('shirisha') ||
      n.includes('sasank') ||
      n.includes('vamshi') ||
      n.includes('subramanyam') ||
      n.includes('devalla')
    ) {
      return 'Hyderabad';
    }

    return 'Hyderabad'; // default
  };

  // Legacy alias kept for campusStandings compatibility
  const getCounselorCampusBranch = (counName: string): string => {
    const loc = getCounselorLocation(counName);
    if (loc === 'Vijayawada') return '1st Campus (Main-VIJ)';
    if (loc === 'Visakhapatnam') return '1st Campus (Main-VSP)';
    if (loc === 'Bangalore') return 'Bangalore Campus';
    return '1st Campus (JNTU-HYD)';
  };

  const counselorGamifications = useMemo(() => {
    return counselors
      .filter((c) => !isExcludedFromTrophies(c.name || ''))
      .map((c) => computeCounselorGamification(c, students, convertedLeads))
      .sort((a, b) => b.xp - a.xp);
  }, [counselors, students, convertedLeads]);

  // Universal Record Date Parser
  const parseRecordDate = (rec: any): Date | null => {
    if (!rec) return null;
    const raw = rec.date || rec.createdAt || rec.sessionDate || rec.timestamp || rec.metadata?.['Created At'] || rec.metadata?.['Date'] || rec.metadata?.['Enrollment Date'] || rec.leadDate;
    if (!raw) return null;
    if (typeof raw === 'number') {
      const d = new Date(raw);
      return isNaN(d.getTime()) ? null : d;
    }
    if (raw instanceof Date) return isNaN(raw.getTime()) ? null : raw;
    if (typeof raw === 'string') {
      const parsed = new Date(raw);
      if (!isNaN(parsed.getTime())) return parsed;
      const parts = raw.split(/[-/]/);
      if (parts.length === 3) {
        if (parts[0].length === 4) return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
      }
    }
    return null;
  };

  const isDateInAnalyticsTimeframe = (recordDate: Date | null, tf: AnalyticsTimeframeState): boolean => {
    if (tf.mode === 'all_time') return true;
    if (!recordDate) return true;

    const rYear = recordDate.getFullYear();
    const rMonth = recordDate.getMonth(); // 0-11
    const rDate = recordDate.getDate();
    const recTime = recordDate.getTime();

    // Any Custom range selection (between start and end date)
    const isCustomActive = 
      tf.mode === 'custom' ||
      (tf.mode === 'daily' && tf.dailySub === 'custom_day') ||
      (tf.mode === 'weekly' && (tf.weeklySub as string) === 'custom') ||
      (tf.mode === 'monthly' && tf.monthlySub === 'specific_month') ||
      (tf.mode === 'yearly' && (tf.yearlySub as string) === 'custom');

    if (isCustomActive) {
      const start = tf.customStartDate ? new Date(tf.customStartDate).getTime() : 0;
      const end = tf.customEndDate ? new Date(`${tf.customEndDate}T23:59:59`).getTime() : Infinity;
      return recTime >= start && recTime <= end;
    }

    if (tf.mode === 'daily') {
      if (tf.dailySub === 'today') return rYear === 2026 && rMonth === 7 && rDate === 28;
      if (tf.dailySub === 'yesterday') return rYear === 2026 && rMonth === 7 && rDate === 27;
      return rYear === 2026 && rMonth === 7 && rDate === 28;
    }

    if (tf.mode === 'weekly') {
      if (tf.weeklySub === 'this_week') {
        const start = new Date(2026, 7, 24).getTime();
        const end = new Date(2026, 7, 30, 23, 59, 59).getTime();
        return recTime >= start && recTime <= end;
      }
      if (tf.weeklySub === 'last_week') {
        const start = new Date(2026, 7, 17).getTime();
        const end = new Date(2026, 7, 23, 23, 59, 59).getTime();
        return recTime >= start && recTime <= end;
      }
      if (tf.weeklySub === 'last_7_days') {
        const start = new Date(2026, 7, 21).getTime();
        const end = new Date(2026, 7, 28, 23, 59, 59).getTime();
        return recTime >= start && recTime <= end;
      }
      return true;
    }

    if (tf.mode === 'monthly') {
      if (tf.monthlySub === 'current_month') return rYear === 2026 && rMonth === 7;
      if (tf.monthlySub === 'prev_month') return rYear === 2026 && rMonth === 6;
      return true;
    }

    if (tf.mode === 'yearly') {
      if (tf.yearlySub === '2026') return rYear === 2026;
      if (tf.yearlySub === '2025') return rYear === 2025;
      return rYear === 2026;
    }

    return true;
  };

  const timeframeSummaryLabel = useMemo(() => {
    if (analyticsTimeframe.mode === 'all_time') return 'All-Time Historical Analytics';
    if (analyticsTimeframe.mode === 'daily') {
      return `Date: ${analyticsTimeframe.customDay}`;
    }
    if (analyticsTimeframe.mode === 'weekly') {
      if (analyticsTimeframe.weeklySub === 'this_week') return 'This Week (Aug 24 – 30, 2026)';
      if (analyticsTimeframe.weeklySub === 'last_week') return 'Last Week (Aug 17 – 23, 2026)';
      return 'Last 7 Days Rolling';
    }
    if (analyticsTimeframe.mode === 'monthly') {
      if (analyticsTimeframe.monthlySub === 'current_month') return 'Current Month (August 2026)';
      if (analyticsTimeframe.monthlySub === 'prev_month') return 'Previous Month (July 2026)';
      return analyticsTimeframe.specificMonth;
    }
    if (analyticsTimeframe.mode === 'yearly') {
      return `${analyticsTimeframe.yearlySub} Annual Edition`;
    }
    if (analyticsTimeframe.mode === 'custom') {
      return `${analyticsTimeframe.customStartDate} to ${analyticsTimeframe.customEndDate}`;
    }
    return 'Analytics Period';
  }, [analyticsTimeframe]);

  // Period Filtered Gamification for Counselor Table Tab
  const counselorGamificationsForPeriod = useMemo(() => {
    if (analyticsTimeframe.mode === 'all_time') return counselorGamifications;

    const filteredStudents = students.filter((s) => isDateInAnalyticsTimeframe(parseRecordDate(s), analyticsTimeframe));
    const filteredLeads = convertedLeads.filter((l) => isDateInAnalyticsTimeframe(parseRecordDate(l), analyticsTimeframe));

    return counselors
      .filter((c) => !isExcludedFromTrophies(c.name || ''))
      .map((c) => computeCounselorGamification(c, filteredStudents, filteredLeads))
      .sort((a, b) => b.xp - a.xp);
  }, [counselors, students, convertedLeads, counselorGamifications, analyticsTimeframe]);

  // Period Filtered Campus Standings
  const campusStandingsForPeriod = useMemo(() => {
    if (analyticsTimeframe.mode === 'all_time') return campusStandings;

    const filteredStudents = students.filter((s) => isDateInAnalyticsTimeframe(parseRecordDate(s), analyticsTimeframe));
    const filteredLeads = convertedLeads.filter((l) => isDateInAnalyticsTimeframe(parseRecordDate(l), analyticsTimeframe));

    return computeCampusLeagueStandings(branches, filteredStudents, counselors, filteredLeads);
  }, [branches, students, counselors, convertedLeads, campusStandings, analyticsTimeframe]);


  // Current active gamification stats (selected counselor or logged in user)
  const currentUserGamification = useMemo(() => {
    if (selectedCounselorId) {
      const found = counselorGamifications.find((cg) => cg.id === selectedCounselorId);
      if (found) return found;
    }
    return counselorGamifications.find((cg) => cg.id === user.id) || counselorGamifications[0] || {
      id: user.id || 'default_user',
      name: user.name || 'Counselor',
      branchName: 'Codegnan',
      level: 5,
      tierName: 'Gold Veteran',
      tierColor: '#f59e0b',
      xp: 1450,
      xpToNextLevel: 150,
      streakDays: 6,
      completedCount: 0,
      totalSales: 0,
      avgTicket: 0,
      walkinCount: 0,
      conversionRate: 0,
      dropoutPct: 0,
      badges: [],
      quests: [],
    };
  }, [counselorGamifications, user]);

  // Filtered Campuses
  const filteredCampuses = useMemo(() => {
    return campusStandings.filter((c) => {
      if (regionFilter !== 'all' && c.location !== regionFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return c.name.toLowerCase().includes(q) || c.location.toLowerCase().includes(q) || c.mvpCounselorName.toLowerCase().includes(q);
      }
      return true;
    });
  }, [campusStandings, regionFilter, searchQuery]);

  // Filtered & Ranked Counselors based on League Metric (Overall XP, RPL Revenue, WPL Walk-ins, SPL Admissions)
  const filteredCounselors = useMemo(() => {
    let list = [...counselorGamifications];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((cg) =>
        cg.name.toLowerCase().includes(q) || cg.branchName.toLowerCase().includes(q) || cg.tierName.toLowerCase().includes(q)
      );
    }

    if (leagueMetricFilter === 'rpl') {
      list.sort((a, b) => (b.totalSales || 0) - (a.totalSales || 0));
    } else if (leagueMetricFilter === 'wpl') {
      list.sort((a, b) => (b.walkinCount || 0) - (a.walkinCount || 0));
    } else if (leagueMetricFilter === 'spl') {
      list.sort((a, b) => (b.completedCount || 0) - (a.completedCount || 0));
    } else {
      list.sort((a, b) => (b.xp || 0) - (a.xp || 0));
    }

    return list;
  }, [counselorGamifications, searchQuery, leagueMetricFilter]);

  // ─── TARGETS & INCENTIVES CALCULATION ENGINE ───
  const targetAchievements = useMemo(() => {
    const horizonMultiplier = targetHorizon === 'daily' ? (1 / 26) : targetHorizon === 'weekly' ? (1 / 4) : 1;
    
    if (targetScope === 'counselor') {
      return counselorGamifications.map((cg, idx) => {
        // Base monthly benchmarks per counselor
        const defaultRevTarget = 500000 * horizonMultiplier; // ₹5L monthly
        const defaultWalkinTarget = Math.round(50 * horizonMultiplier); // 50 walkins monthly
        const defaultAdmTarget = Math.round(20 * horizonMultiplier); // 20 admissions monthly
        const defaultBaseIncentive = 5000 * horizonMultiplier;
        const defaultStretchBonus = 3000 * horizonMultiplier;

        const override = customTargetsOverride[cg.name] || customTargetsOverride[cg.id];
        const revTarget = override ? override.revenue : defaultRevTarget;
        const walkinTarget = override ? override.walkins : defaultWalkinTarget;
        const admTarget = override ? override.admissions : defaultAdmTarget;
        const baseInc = override ? override.baseIncentive : defaultBaseIncentive;
        const stretchInc = override ? override.stretchBonus : defaultStretchBonus;

        // Actuals scaled according to horizon
        const actRev = cg.totalSales || 0;
        const actWalkin = cg.walkinCount || 0;
        const actAdm = cg.completedCount || 0;

        const revPct = revTarget > 0 ? Math.min(200, Math.round((actRev / revTarget) * 100)) : 0;
        const walkinPct = walkinTarget > 0 ? Math.min(200, Math.round((actWalkin / walkinTarget) * 100)) : 0;
        const admPct = admTarget > 0 ? Math.min(200, Math.round((actAdm / admTarget) * 100)) : 0;

        // Composite weighted score: 40% Revenue, 40% Admissions, 20% Walk-ins
        const compositePct = Math.round((revPct * 0.4) + (admPct * 0.4) + (walkinPct * 0.2));

        // Incentive calculation
        let incentiveEarned = 0;
        let status = 'On Track ⚡';
        let statusColor = '#3b82f6';

        if (compositePct >= 120) {
          incentiveEarned = baseInc + stretchInc + (Math.max(0, actAdm - admTarget) * 500);
          status = 'Super Stretch 🚀';
          statusColor = '#8b5cf6';
        } else if (compositePct >= 100) {
          incentiveEarned = baseInc + (Math.max(0, actAdm - admTarget) * 300);
          status = 'Target Hit 🎉';
          statusColor = '#10b981';
        } else if (compositePct >= 75) {
          incentiveEarned = Math.round(baseInc * 0.5);
          status = 'On Track ⚡';
          statusColor = '#0284c7';
        } else if (compositePct >= 50) {
          incentiveEarned = 0;
          status = 'In Progress ⏳';
          statusColor = '#f59e0b';
        } else {
          incentiveEarned = 0;
          status = 'Behind Target ⚠️';
          statusColor = '#ef4444';
        }

        return {
          id: cg.id,
          name: cg.name,
          location: cg.branchName,
          type: 'counselor' as const,
          streakDays: cg.streakDays,
          targetRevenue: revTarget,
          actualRevenue: actRev,
          revenuePct: revPct,
          targetWalkins: walkinTarget,
          actualWalkins: actWalkin,
          walkinsPct: walkinPct,
          targetAdmissions: admTarget,
          actualAdmissions: actAdm,
          admissionsPct: admPct,
          compositePct,
          status,
          statusColor,
          incentiveEarned: Math.round(incentiveEarned),
        };
      }).sort((a, b) => b.compositePct - a.compositePct);
    } else {
      // Campus level targets
      return campusStandings.map((c, idx) => {
        const defaultRevTarget = 2500000 * horizonMultiplier; // ₹25L monthly
        const defaultWalkinTarget = Math.round(250 * horizonMultiplier); // 250 walkins monthly
        const defaultAdmTarget = Math.round(100 * horizonMultiplier); // 100 admissions monthly
        const defaultBaseIncentive = 25000 * horizonMultiplier;
        const defaultStretchBonus = 15000 * horizonMultiplier;

        const override = customTargetsOverride[c.name] || customTargetsOverride[c.id];
        const revTarget = override ? override.revenue : defaultRevTarget;
        const walkinTarget = override ? override.walkins : defaultWalkinTarget;
        const admTarget = override ? override.admissions : defaultAdmTarget;
        const baseInc = override ? override.baseIncentive : defaultBaseIncentive;
        const stretchInc = override ? override.stretchBonus : defaultStretchBonus;

        const actRev = c.totalSales || (c.intakeCount * 45000) || 0;
        const actWalkin = c.intakeCount || 0;
        const actAdm = c.completedCount || 0;

        const revPct = revTarget > 0 ? Math.min(200, Math.round((actRev / revTarget) * 100)) : 0;
        const walkinPct = walkinTarget > 0 ? Math.min(200, Math.round((actWalkin / walkinTarget) * 100)) : 0;
        const admPct = admTarget > 0 ? Math.min(200, Math.round((actAdm / admTarget) * 100)) : 0;

        const compositePct = Math.round((revPct * 0.4) + (admPct * 0.4) + (walkinPct * 0.2));

        let incentiveEarned = 0;
        let status = 'On Track ⚡';
        let statusColor = '#3b82f6';

        if (compositePct >= 120) {
          incentiveEarned = baseInc + stretchInc;
          status = 'Super Stretch 🚀';
          statusColor = '#8b5cf6';
        } else if (compositePct >= 100) {
          incentiveEarned = baseInc;
          status = 'Target Hit 🎉';
          statusColor = '#10b981';
        } else if (compositePct >= 75) {
          incentiveEarned = Math.round(baseInc * 0.5);
          status = 'On Track ⚡';
          statusColor = '#0284c7';
        } else if (compositePct >= 50) {
          incentiveEarned = 0;
          status = 'In Progress ⏳';
          statusColor = '#f59e0b';
        } else {
          incentiveEarned = 0;
          status = 'Behind Target ⚠️';
          statusColor = '#ef4444';
        }

        return {
          id: c.id,
          name: c.name,
          location: c.location,
          type: 'campus' as const,
          streakDays: c.winStreak,
          targetRevenue: revTarget,
          actualRevenue: actRev,
          revenuePct: revPct,
          targetWalkins: walkinTarget,
          actualWalkins: actWalkin,
          walkinsPct: walkinPct,
          targetAdmissions: admTarget,
          actualAdmissions: actAdm,
          admissionsPct: admPct,
          compositePct,
          status,
          statusColor,
          incentiveEarned: Math.round(incentiveEarned),
        };
      }).sort((a, b) => b.compositePct - a.compositePct);
    }
  }, [counselorGamifications, campusStandings, targetHorizon, targetScope, customTargetsOverride]);

  // Selected Comparison Campuses
  const selectedCampusA = useMemo(() => {
    return campusStandings.find((c) => c.id === campusAId) || campusStandings[0] || {
      name: '1st Campus (JNTU-HYD)',
      location: 'Hyderabad',
      intakeCount: 0,
      completedCount: 0,
      conversionRate: 0,
      winStreak: 0,
      leaguePoints: 0,
      mvpCounselorName: 'Kranthi Kumar',
    };
  }, [campusStandings, campusAId]);

  const selectedCampusB = useMemo(() => {
    return campusStandings.find((c) => c.id === campusBId) || campusStandings[1] || {
      name: '3rd Campus (Pista House-HYD)',
      location: 'Hyderabad',
      intakeCount: 0,
      completedCount: 0,
      conversionRate: 0,
      winStreak: 0,
      leaguePoints: 0,
      mvpCounselorName: 'Kranthi Kumar',
    };
  }, [campusStandings, campusBId]);

  const handleClaimQuest = (questId: string) => {
    setClaimedQuests((prev) => ({ ...prev, [questId]: true }));
  };

  return (
    <section className="dash-page" style={{ paddingBottom: '70px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* ─── Standard Clean Page Title Header ─── */}
      <div className="page-title-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: 0 }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
            {monthShortName} League &amp; Monthly Targets
            <span style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: '6px',
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(217, 119, 6, 0.2))',
              color: '#d97706',
              border: '1px solid rgba(245, 158, 11, 0.35)',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}>
              {monthShortName} 2026 Live
            </span>
          </h1>
          <p className="small-text" style={{ marginTop: '4px' }}>
            Counselor points leaderboard, achievement badge crests, and campus championship targets.
          </p>
        </div>

        {/* Header Right Controls - Executive Symmetrical Glassmorphic Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Dynamic Status Month Selector (Sequence: September, August, July) */}
          <ModernDropdownMenu
            value={selectedMonth}
            options={[
              { value: 'September 2026', label: 'September 2026' },
              { value: 'August 2026', label: 'August 2026' },
              { value: 'July 2026', label: 'July 2026' },
            ]}
            onChange={(val) => setSelectedMonth(val)}
            width="176px"
            height="32px"
            prefix={
              selectedMonth === 'August 2026' ? (
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  color: '#10b981',
                  background: 'rgba(16, 185, 129, 0.12)',
                  padding: '0 5px',
                  borderRadius: '4px',
                  height: '18px',
                  lineHeight: '18px',
                  boxSizing: 'border-box',
                }}>
                  <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                  LIVE
                </span>
              ) : selectedMonth === 'September 2026' ? (
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  color: '#3b82f6',
                  background: 'rgba(59, 130, 246, 0.12)',
                  padding: '0 5px',
                  borderRadius: '4px',
                  height: '18px',
                  lineHeight: '18px',
                  boxSizing: 'border-box',
                }}>
                  <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#3b82f6', display: 'inline-block' }} />
                  UPCOMING
                </span>
              ) : (
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  color: '#6b7280',
                  background: 'rgba(107, 114, 128, 0.12)',
                  padding: '0 5px',
                  borderRadius: '4px',
                  height: '18px',
                  lineHeight: '18px',
                  boxSizing: 'border-box',
                }}>
                  <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#6b7280', display: 'inline-block' }} />
                  ARCHIVE
                </span>
              )
            }
          />

          {/* Consistent Size Streak Pill (Exact 32px Height, Matching 8px Radius) */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08), rgba(239, 68, 68, 0.04))',
            border: '1.5px solid rgba(245, 158, 11, 0.25)',
            borderRadius: '7px',
            padding: '0 12px',
            height: '32px',
            boxSizing: 'border-box',
            boxShadow: '0 1px 3px rgba(245, 158, 11, 0.05)',
          }}>
            <span style={{ fontSize: '0.88rem' }}>🔥</span>
            <span style={{ fontSize: '0.82rem', fontWeight: 900, color: '#f59e0b', fontFamily: 'var(--font-mono)' }}>
              {currentUserGamification.streakDays}
            </span>
            <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
              Day Streak
            </span>
          </div>
        </div>
      </div>

      {/* ─── Executive Monthly KPI Metric Grid ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        
        {/* Card 1: Monthly Target Completion */}
        <div style={{
          background: 'var(--card-bg)',
          border: '1.5px solid var(--border)',
          borderRadius: '16px',
          padding: '18px 20px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)' }}>
              Monthly Target
            </span>
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: 'rgba(16, 185, 129, 0.14)', color: '#10b981',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="16" height="16"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
            </div>
          </div>
          <div style={{ fontSize: '2.1rem', fontWeight: 900, color: '#10b981', marginTop: '6px' }}>
            88%
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--muted)', fontWeight: 600, marginTop: '2px' }}>
            On track to exceed monthly quota
          </div>
        </div>

        {/* Card 2: League Leader */}
        <div style={{
          background: 'var(--card-bg)',
          border: '1.5px solid var(--border)',
          borderRadius: '16px',
          padding: '18px 20px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)' }}>
              {monthShortName.toUpperCase()} LEAGUE LEADER
            </span>
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: 'rgba(245, 158, 11, 0.14)', color: '#f59e0b',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="16" height="16"><path d="M6 9H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h2 M18 9h2a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-2 M6 3h12v7a6 6 0 0 1-12 0V3z M12 16v5 M8 21h8"/></svg>
            </div>
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--text)', marginTop: '8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            1st Campus (JNTU-HYD)
          </div>
          <div style={{ fontSize: '0.74rem', color: '#f59e0b', fontWeight: 800, marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
            1,250 League Points (LP)
          </div>
        </div>

        {/* Card 3: Highest Conversion */}
        <div style={{
          background: 'var(--card-bg)',
          border: '1.5px solid var(--border)',
          borderRadius: '16px',
          padding: '18px 20px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)' }}>
              Top Conversion
            </span>
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: 'rgba(99, 102, 241, 0.14)', color: 'var(--primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="16" height="16"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
            </div>
          </div>
          <div style={{ fontSize: '2.1rem', fontWeight: 900, color: 'var(--primary)', marginTop: '6px' }}>
            85%
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--muted)', fontWeight: 600, marginTop: '2px' }}>
            1st Campus (Main-VSP) lead
          </div>
        </div>

        {/* Card 4: Top Counselor */}
        <div style={{
          background: 'var(--card-bg)',
          border: '1.5px solid var(--border)',
          borderRadius: '16px',
          padding: '18px 20px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)' }}>
              Monthly MVP
            </span>
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: 'rgba(168, 85, 247, 0.14)', color: '#a855f7',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="16" height="16"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>
            </div>
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--text)', marginTop: '8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {counselorGamificationsForPeriod[0]?.name || 'Kranthi Kumar'}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--muted)', fontWeight: 600, marginTop: '2px' }}>
            Lvl {counselorGamificationsForPeriod[0]?.level || 5} • {counselorGamificationsForPeriod[0]?.xp || 0} PTS
          </div>
        </div>
      </div>

      {/* ─── Navigation Tabs Strip ─── */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        borderBottom: '1.5px solid var(--border)',
        paddingBottom: '12px',
      }}>
        {/* Tab Buttons */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { id: 'trophies', label: 'Trophies' },
            { id: 'badges', label: 'Badges & Medals' },
            { id: 'points_table', label: 'Counselor Table' },
            { id: 'league', label: 'Campus Standings' },
            { id: 'targets', label: 'Target Hub & Incentives' },
            { id: 'clash', label: 'Campus Comparison' },
            { id: 'counselors', label: 'Counselor Roster' },
            { id: 'quests', label: 'Daily Quests' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '8px',
                border: activeTab === tab.id ? '1.5px solid var(--primary)' : '1px solid transparent',
                background: activeTab === tab.id ? 'var(--surface)' : 'transparent',
                color: activeTab === tab.id ? 'var(--primary)' : 'var(--muted)',
                fontSize: '0.82rem',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: activeTab === tab.id ? '0 2px 8px rgba(99, 102, 241, 0.15)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>


      </div>


      {/* ══════════════════════════════════════════════════════════════
          TAB: 🏆 TROPHIES — Luxury Inter-Campus Championship Showcase
      ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'trophies' && (() => {
        const yrNum = trophyYear === '2025' ? 2025 : 2026;
        const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
        const LOCATIONS = trophyYear === '2026' 
          ? ['Hyderabad', 'Vijayawada', 'Visakhapatnam'] 
          : ['Hyderabad', 'Vijayawada', 'Visakhapatnam', 'Bangalore'];

        const LOCATION_FLAGS: Record<string, string> = {
          Hyderabad: '🟡',
          Vijayawada: '🔵',
          Visakhapatnam: '🟢',
          Bangalore: '🔴',
        };

        const activeYr = 2026;
        const activeMonth = 8; // Current active live month is August (8)

        // Helper to compute a single year's months data
        const computeYearData = (targetYear: number) => {
          return [1,2,3,4,5,6,7,8,9,10,11,12].map((m) => {
            const mName = monthNames[m - 1];
            const isFutureMonth = (targetYear === activeYr && m > activeMonth) || targetYear > activeYr;
            const nextMonthName = m === 12 ? 'January' : monthNames[m];
            const nextYrNum = m === 12 ? targetYear + 1 : targetYear;
            const unlockDateText = `${nextMonthName} 1st, ${nextYrNum}`;

            const mLeads = convertedLeads.filter((l: any) => {
              if (!l.enrollmentDate) return false;
              const d = new Date(l.enrollmentDate);
              return d.getFullYear() === targetYear && (d.getMonth() + 1) === m;
            });
            const totalMonthSales = mLeads.reduce((acc: number, l: any) => acc + (Number(l.feePaid) || 0), 0);

            const mStudents = (students || []).filter((s: any) => {
              const d = new Date(s.createdAt);
              return !isNaN(d.getTime()) && d.getFullYear() === targetYear && (d.getMonth() + 1) === m;
            });

            const locSalesMap: Record<string, { sales: number; count: number; counselors: Set<string> }> = {};
            const locWalkinMap: Record<string, number> = {};
            const cMap = new Map<string, { name: string; sales: number; count: number }>();

            const yearLocs = targetYear === 2026 ? ['Hyderabad', 'Vijayawada', 'Visakhapatnam'] : ['Hyderabad', 'Vijayawada', 'Visakhapatnam', 'Bangalore'];
            yearLocs.forEach(loc => {
              locSalesMap[loc] = { sales: 0, count: 0, counselors: new Set() };
              locWalkinMap[loc] = 0;
            });

            if (!isFutureMonth) {
              mLeads.forEach((l: any) => {
                const coun = (l.counselorName || l.metadata?.['Counsellor'] || '').trim().replace(/_/g, ' ');
                const paid = Number(l.feePaid) || 0;
                const loc = coun ? getCounselorLocation(coun) : 'Hyderabad';
                if (locSalesMap[loc]) {
                  locSalesMap[loc].sales += paid;
                  locSalesMap[loc].count += 1;
                  if (coun && !isExcludedFromTrophies(coun)) locSalesMap[loc].counselors.add(coun);
                }
                if (coun && !isExcludedFromTrophies(coun)) {
                  const cCur = cMap.get(coun) || { name: coun, sales: 0, count: 0 };
                  cCur.sales += paid;
                  cCur.count += 1;
                  cMap.set(coun, cCur);
                }
              });

              mStudents.forEach((s: any) => {
                const coun = (s.assignedCounselor?.name || s.metadata?.['Counsellor'] || '').trim().replace(/_/g, ' ');
                const loc = coun ? getCounselorLocation(coun) : (s.branch?.city || s.branch?.name || 'Visakhapatnam');
                if (locWalkinMap[loc] !== undefined) {
                  locWalkinMap[loc] += 1;
                } else {
                  const matched = yearLocs.find(l => loc.toLowerCase().includes(l.toLowerCase()));
                  if (matched) locWalkinMap[matched] += 1;
                }
              });
            }

            // 1. RPL Winner (Revenue)
            const rplSorted = yearLocs
              .map(loc => ({ loc, sales: locSalesMap[loc]?.sales || 0, count: locSalesMap[loc]?.count || 0, counselors: locSalesMap[loc]?.counselors || new Set<string>() }))
              .sort((a, b) => b.sales - a.sales);
            const rplWinner = !isFutureMonth && rplSorted[0]?.sales > 0 ? rplSorted[0] : null;

            // 2. WPL Winner (Walk-ins)
            const wplSorted = yearLocs
              .map(loc => ({ loc, count: locWalkinMap[loc] || 0 }))
              .sort((a, b) => b.count - a.count);
            const wplWinner = !isFutureMonth && (wplSorted[0]?.count > 0 
              ? wplSorted[0] 
              : (rplSorted[0]?.sales > 0 ? { loc: (m % 2 === 0 ? 'Visakhapatnam' : 'Hyderabad'), count: Math.round((locSalesMap[rplSorted[0].loc]?.count || 20) * 1.3) } : null));

            // 3. SPL Winner (Sales)
            const splSorted = yearLocs
              .map(loc => ({ loc, count: locSalesMap[loc]?.count || 0, sales: locSalesMap[loc]?.sales || 0, counselors: locSalesMap[loc]?.counselors || new Set<string>() }))
              .sort((a, b) => b.count - a.count);
            const splWinner = !isFutureMonth && splSorted[0]?.count > 0 ? splSorted[0] : null;

            const sortedCoun = Array.from(cMap.values()).sort((a, b) => b.sales - a.sales);
            const championCoun = sortedCoun[0] || null;

            return {
              m,
              mName,
              year: targetYear,
              isFutureMonth,
              unlockDateText,
              totalMonthSales,
              mLeads,
              sortedCoun,
              championCoun,
              rplWinner,
              rplSorted,
              wplWinner,
              wplSorted,
              splWinner,
              splSorted,
              locSalesMap,
            };
          });
        };

        const monthsData2026 = computeYearData(2026);
        const monthsData2025 = computeYearData(2025);
        
        // Active monthsData for rendering
        const monthsData = trophyYear === '2025' 
          ? monthsData2025 
          : (trophyYear === 'all_time' ? [...monthsData2026.filter(d => !d.isFutureMonth), ...monthsData2025] : monthsData2026);

        // Compute total achieved cups count
        let totalAchievedCups = 0;
        monthsData.forEach(d => {
          if (d.rplWinner) totalAchievedCups += 1;
          if (d.wplWinner) totalAchievedCups += 1;
          if (d.splWinner) totalAchievedCups += 1;
        });        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* ─── Hero Header & Stats Banner ─── */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.9) 100%)',
              border: '1.5px solid rgba(245, 158, 11, 0.4)',
              borderRadius: '20px',
              padding: '24px 28px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '20px',
              boxShadow: '0 12px 36px rgba(0, 0, 0, 0.25)',
              position: 'relative',
              overflow: 'hidden',
            }}>
              {/* Subtle background glow circle */}
              <div style={{
                position: 'absolute',
                top: '-40px',
                right: '10%',
                width: '180px',
                height: '180px',
                background: 'radial-gradient(circle, rgba(245, 158, 11, 0.18) 0%, transparent 70%)',
                pointerEvents: 'none',
              }} />

              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '2rem' }}>🏆</span>
                  <div>
                    <h2 style={{
                      fontSize: '1.45rem',
                      fontWeight: 900,
                      margin: 0,
                      background: 'linear-gradient(135deg, #ffffff 0%, #fef3c7 50%, #fde047 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      letterSpacing: '-0.01em',
                    }}>
                      Location Championship Trophies {trophyYear === 'all_time' ? '(All-Time)' : `(${trophyYear})`}
                    </h2>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.84rem', color: '#94a3b8', fontWeight: 600 }}>
                      Official Codegnan Premier Leagues • 3 Leagues (RPL, WPL, SPL) • {trophyYear === '2026' ? 'Hyderabad · Vijayawada · Visakhapatnam' : 'Hyderabad · Vijayawada · Visakhapatnam · Bangalore'}
                    </p>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative', zIndex: 1 }}>
                {/* Live Trophy Counter Pill */}
                <div style={{
                  background: 'rgba(245, 158, 11, 0.12)',
                  border: '1px solid rgba(245, 158, 11, 0.35)',
                  padding: '6px 16px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  <span style={{ fontSize: '1rem' }}>🏆</span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 900, color: '#f59e0b' }}>
                    {trophyYear === 'all_time' ? `${totalAchievedCups} All-Time Cups Awarded` : `${totalAchievedCups} / 36 Cups Awarded`}
                  </span>
                </div>

                {/* Time Period Switcher (2026, 2025, All Time) */}
                <div style={{ display: 'inline-flex', background: 'rgba(15, 23, 42, 0.75)', padding: '3px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.12)' }}>
                  {[
                    { id: '2026', label: '2026' },
                    { id: '2025', label: '2025' },
                    { id: 'all_time', label: 'All Time' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setTrophyYear(item.id as any)}
                      style={{
                        padding: '6px 16px',
                        borderRadius: '7px',
                        fontSize: '0.8rem',
                        fontWeight: 900,
                        border: 'none',
                        background: trophyYear === item.id ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'transparent',
                        color: trophyYear === item.id ? '#fff' : '#94a3b8',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        boxShadow: trophyYear === item.id ? '0 2px 8px rgba(245, 158, 11, 0.3)' : 'none',
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ─── Trophies Filter & Navigation Bar ─── */}
            <div style={{
              display: 'inline-flex',
              background: 'var(--surface)',
              border: '1.5px solid var(--border)',
              borderRadius: '11px',
              padding: '4px 6px',
              gap: '4px',
              flexWrap: 'wrap',
              boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
              marginBottom: '4px',
            }}>
              {[
                { id: 'all', label: 'All Trophies' },
                { id: 'locations', label: 'Location Trophies' },
                { id: 'rpl', label: 'RPL Cups' },
                { id: 'wpl', label: 'WPL Cups' },
                { id: 'spl', label: 'SPL Cups' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSeasonCategoryFilter(cat.id as any)}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '9px',
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    border: 'none',
                    background: seasonCategoryFilter === cat.id ? 'var(--primary)' : 'transparent',
                    color: seasonCategoryFilter === cat.id ? '#fff' : 'var(--text)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: seasonCategoryFilter === cat.id ? '0 2px 8px rgba(99, 102, 241, 0.2)' : 'none',
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* ══════════════════════════════════════════════════════════
                VIEW 1: 📍 LOCATION TROPHIES (CAMPUS TROPHY CABINETS)
            ══════════════════════════════════════════════════════════ */}
            {seasonCategoryFilter === 'locations' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                {LOCATIONS.filter((loc) => {
                  // Only display campuses that have actually won at least 1 championship trophy
                  const hasRpl = monthsData.some(d => d.rplWinner && d.rplWinner.loc.toLowerCase() === loc.toLowerCase());
                  const hasWpl = monthsData.some(d => d.wplWinner && d.wplWinner.loc.toLowerCase() === loc.toLowerCase());
                  const hasSpl = monthsData.some(d => d.splWinner && d.splWinner.loc.toLowerCase() === loc.toLowerCase());
                  return hasRpl || hasWpl || hasSpl;
                }).map((loc) => {
                  const rplWinningSeasons: any[] = [];
                  const wplWinningSeasons: any[] = [];
                  const splWinningSeasons: any[] = [];

                  monthsData.forEach((d) => {
                    if (d.rplWinner && d.rplWinner.loc.toLowerCase() === loc.toLowerCase()) {
                      rplWinningSeasons.push({
                        seasonNumber: d.m,
                        monthName: d.mName,
                        year: d.year || yrNum,
                        metricValue: `₹${((d.rplWinner.sales || 0) / 100000).toFixed(2)}L`,
                        metricLabel: 'Gross Fee Collection',
                        sales: d.rplWinner.sales,
                        count: d.rplWinner.count,
                        counselors: Array.from(d.rplWinner.counselors || []),
                        totalMonthSales: d.totalMonthSales,
                      });
                    }
                    if (d.wplWinner && d.wplWinner.loc.toLowerCase() === loc.toLowerCase()) {
                      wplWinningSeasons.push({
                        seasonNumber: d.m,
                        monthName: d.mName,
                        year: d.year || yrNum,
                        metricValue: `${d.wplWinner.count} Walk-ins`,
                        metricLabel: 'Physical Walk-in Footfall',
                        sales: d.locSalesMap[loc]?.sales || 0,
                        count: d.wplWinner.count,
                        counselors: Array.from(d.locSalesMap[loc]?.counselors || []),
                        totalMonthSales: d.totalMonthSales,
                      });
                    }
                    if (d.splWinner && d.splWinner.loc.toLowerCase() === loc.toLowerCase()) {
                      splWinningSeasons.push({
                        seasonNumber: d.m,
                        monthName: d.mName,
                        year: d.year || yrNum,
                        metricValue: `${d.splWinner.count} Admissions`,
                        metricLabel: 'Student Admissions Volume',
                        sales: d.splWinner.sales,
                        count: d.splWinner.count,
                        counselors: Array.from(d.splWinner.counselors || []),
                        totalMonthSales: d.totalMonthSales,
                      });
                    }
                  });

                  const totalLocationCups = rplWinningSeasons.length + wplWinningSeasons.length + splWinningSeasons.length;

                  return (
                    <div key={loc} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {/* Location Header Cabinet Bar */}
                      <div style={{
                        background: 'linear-gradient(135deg, var(--card-bg) 0%, var(--surface-alt) 100%)',
                        border: '1.5px solid var(--border)',
                        borderRadius: '14px',
                        padding: '16px 22px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '12px',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div>
                            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: 'var(--text)', letterSpacing: '-0.01em' }}>
                              {loc} Location Trophies {trophyYear === 'all_time' ? '(All-Time)' : `(${trophyYear})`}
                            </h3>
                            <span style={{ fontSize: '0.78rem', color: 'var(--muted)', fontWeight: 700 }}>
                              3 Premier League Championship Cups • {totalLocationCups} Total Titles Won {trophyYear === 'all_time' ? 'All-Time' : `in ${trophyYear}`}
                            </span>
                          </div>
                        </div>
                        <span style={{ fontSize: '0.8rem', fontWeight: 900, color: '#f59e0b', background: 'rgba(245,158,11,0.12)', padding: '5px 16px', borderRadius: '8px', border: '1px solid rgba(245,158,11,0.35)' }}>
                          🏆 {totalLocationCups} Total Cups
                        </span>
                      </div>

                      {/* Grand Cups Actually Won by this Location */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 320px))', gap: '18px' }}>
                        
                        {/* 1. RPL Cup Card (Only shown if won > 0) */}
                        {rplWinningSeasons.length > 0 && (
                        <div
                          onClick={() => {
                            setSelectedLocationCupModal({
                              location: loc,
                              league: 'RPL',
                              leagueTitle: 'Revenue Premier League (RPL Cup)',
                              trophyType: 'fifa_globe',
                              winCount: rplWinningSeasons.length,
                              winningSeasons: rplWinningSeasons,
                            });
                          }}
                          style={{
                            background: 'radial-gradient(ellipse at top, rgba(245, 158, 11, 0.12) 0%, var(--card-bg) 70%)',
                            border: rplWinningSeasons.length > 0 ? '1.5px solid rgba(245, 158, 11, 0.4)' : '1.5px solid var(--border)',
                            borderRadius: '12px',
                            padding: '24px 20px 18px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center',
                            gap: '10px',
                            boxShadow: rplWinningSeasons.length > 0 ? '0 8px 24px rgba(245, 158, 11, 0.1)' : '0 4px 16px rgba(0,0,0,0.04)',
                            cursor: 'pointer',
                            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                            minHeight: '350px',
                            position: 'relative',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-6px)';
                            e.currentTarget.style.borderColor = '#f59e0b';
                            e.currentTarget.style.boxShadow = '0 16px 36px rgba(245, 158, 11, 0.25)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.borderColor = rplWinningSeasons.length > 0 ? 'rgba(245, 158, 11, 0.4)' : 'var(--border)';
                            e.currentTarget.style.boxShadow = rplWinningSeasons.length > 0 ? '0 8px 24px rgba(245, 158, 11, 0.1)' : '0 4px 16px rgba(0,0,0,0.04)';
                          }}
                        >
                          <ChampionshipTrophy3D type="fifa_globe" size={155} />
                          <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 900, color: 'var(--text)', lineHeight: 1.2 }}>
                            💰 RPL Cup
                          </h4>
                          <span style={{
                            fontSize: '0.8rem',
                            fontWeight: 900,
                            padding: '5px 16px',
                            borderRadius: '9999px',
                            background: rplWinningSeasons.length > 0 ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(217, 119, 6, 0.15))' : 'var(--surface-alt)',
                            border: rplWinningSeasons.length > 0 ? '1.5px solid rgba(245, 158, 11, 0.5)' : '1px solid var(--border)',
                            color: rplWinningSeasons.length > 0 ? '#d97706' : 'var(--muted)',
                            letterSpacing: '0.02em',
                          }}>
                            ⚡ {rplWinningSeasons.length}x CHAMPION
                          </span>
                          <div style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--text)' }}>
                            {loc} • {rplWinningSeasons.length > 0 ? `${rplWinningSeasons.length} Times RPL Winner` : 'Contender'}
                          </div>
                          <p style={{ margin: 0, fontSize: '0.71rem', color: 'var(--muted)', lineHeight: 1.4, flex: 1 }}>
                            {rplWinningSeasons.length > 0 
                              ? `Won in: ${rplWinningSeasons.map(s => s.monthName.slice(0,3)).join(', ')} ${trophyYear === 'all_time' ? '' : `(${trophyYear})`}`
                              : `In contention for ${yrNum} seasons`}
                          </p>
                          <span style={{
                            fontSize: '0.7rem',
                            fontWeight: 900,
                            color: '#d97706',
                            background: 'rgba(245, 158, 11, 0.1)',
                            padding: '6px 14px',
                            borderRadius: '8px',
                            border: '1px solid rgba(245, 158, 11, 0.25)',
                            marginTop: 'auto',
                            width: '100%',
                            transition: 'all 0.15s ease',
                          }}>
                            View Ceremony ({rplWinningSeasons.length} Seasons) →
                          </span>
                        </div>
                        )}

                        {/* 2. WPL Cup Card (Only shown if won > 0) */}
                        {wplWinningSeasons.length > 0 && (
                        <div
                          onClick={() => {
                            setSelectedLocationCupModal({
                              location: loc,
                              league: 'WPL',
                              leagueTitle: 'Walk-in Premier League (WPL Cup)',
                              trophyType: 'webb_ellis',
                              winCount: wplWinningSeasons.length,
                              winningSeasons: wplWinningSeasons,
                            });
                          }}
                          style={{
                            background: 'radial-gradient(ellipse at top, rgba(16, 185, 129, 0.12) 0%, var(--card-bg) 70%)',
                            border: wplWinningSeasons.length > 0 ? '1.5px solid rgba(16, 185, 129, 0.4)' : '1.5px solid var(--border)',
                            borderRadius: '12px',
                            padding: '24px 20px 18px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center',
                            gap: '10px',
                            boxShadow: wplWinningSeasons.length > 0 ? '0 8px 24px rgba(16, 185, 129, 0.1)' : '0 4px 16px rgba(0,0,0,0.04)',
                            cursor: 'pointer',
                            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                            minHeight: '350px',
                            position: 'relative',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-6px)';
                            e.currentTarget.style.borderColor = '#10b981';
                            e.currentTarget.style.boxShadow = '0 16px 36px rgba(16, 185, 129, 0.25)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.borderColor = wplWinningSeasons.length > 0 ? 'rgba(16, 185, 129, 0.4)' : 'var(--border)';
                            e.currentTarget.style.boxShadow = wplWinningSeasons.length > 0 ? '0 8px 24px rgba(16, 185, 129, 0.1)' : '0 4px 16px rgba(0,0,0,0.04)';
                          }}
                        >
                          <ChampionshipTrophy3D type="webb_ellis" size={155} />
                          <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 900, color: 'var(--text)', lineHeight: 1.2 }}>
                            🚶 WPL Cup
                          </h4>
                          <span style={{
                            fontSize: '0.8rem',
                            fontWeight: 900,
                            padding: '5px 16px',
                            borderRadius: '9999px',
                            background: wplWinningSeasons.length > 0 ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.15))' : 'var(--surface-alt)',
                            border: wplWinningSeasons.length > 0 ? '1.5px solid rgba(16, 185, 129, 0.5)' : '1px solid var(--border)',
                            color: wplWinningSeasons.length > 0 ? '#059669' : 'var(--muted)',
                            letterSpacing: '0.02em',
                          }}>
                            👑 {wplWinningSeasons.length}x CHAMPION
                          </span>
                          <div style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--text)' }}>
                            {loc} • {wplWinningSeasons.length > 0 ? `${wplWinningSeasons.length} Times WPL Winner` : 'Contender'}
                          </div>
                          <p style={{ margin: 0, fontSize: '0.71rem', color: 'var(--muted)', lineHeight: 1.4, flex: 1 }}>
                            {wplWinningSeasons.length > 0 
                              ? `Won in: ${wplWinningSeasons.map(s => s.monthName.slice(0,3)).join(', ')} ${trophyYear === 'all_time' ? '' : `(${trophyYear})`}`
                              : `In contention for ${yrNum} seasons`}
                          </p>
                          <span style={{
                            fontSize: '0.7rem',
                            fontWeight: 900,
                            color: '#059669',
                            background: 'rgba(16, 185, 129, 0.1)',
                            padding: '6px 14px',
                            borderRadius: '8px',
                            border: '1px solid rgba(16, 185, 129, 0.25)',
                            marginTop: 'auto',
                            width: '100%',
                            transition: 'all 0.15s ease',
                          }}>
                            View Ceremony ({wplWinningSeasons.length} Seasons) →
                          </span>
                        </div>
                        )}

                        {/* 3. SPL Cup Card (Only shown if won > 0) */}
                        {splWinningSeasons.length > 0 && (
                        <div
                          onClick={() => {
                            setSelectedLocationCupModal({
                              location: loc,
                              league: 'SPL',
                              leagueTitle: 'Sales Premier League (SPL Cup)',
                              trophyType: 'icc_pillars',
                              winCount: splWinningSeasons.length,
                              winningSeasons: splWinningSeasons,
                            });
                          }}
                          style={{
                            background: 'radial-gradient(ellipse at top, rgba(56, 189, 248, 0.12) 0%, var(--card-bg) 70%)',
                            border: splWinningSeasons.length > 0 ? '1.5px solid rgba(56, 189, 248, 0.4)' : '1.5px solid var(--border)',
                            borderRadius: '12px',
                            padding: '24px 20px 18px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center',
                            gap: '10px',
                            boxShadow: splWinningSeasons.length > 0 ? '0 8px 24px rgba(56, 189, 248, 0.1)' : '0 4px 16px rgba(0,0,0,0.04)',
                            cursor: 'pointer',
                            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                            minHeight: '350px',
                            position: 'relative',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-6px)';
                            e.currentTarget.style.borderColor = '#0284c7';
                            e.currentTarget.style.boxShadow = '0 16px 36px rgba(56, 189, 248, 0.25)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.borderColor = splWinningSeasons.length > 0 ? 'rgba(56, 189, 248, 0.4)' : 'var(--border)';
                            e.currentTarget.style.boxShadow = splWinningSeasons.length > 0 ? '0 8px 24px rgba(56, 189, 248, 0.1)' : '0 4px 16px rgba(0,0,0,0.04)';
                          }}
                        >
                          <ChampionshipTrophy3D type="icc_pillars" size={155} />
                          <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 900, color: 'var(--text)', lineHeight: 1.2 }}>
                            🎓 SPL Cup
                          </h4>
                          <span style={{
                            fontSize: '0.8rem',
                            fontWeight: 900,
                            padding: '5px 16px',
                            borderRadius: '9999px',
                            background: splWinningSeasons.length > 0 ? 'linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(2, 132, 199, 0.15))' : 'var(--surface-alt)',
                            border: splWinningSeasons.length > 0 ? '1.5px solid rgba(56, 189, 248, 0.5)' : '1px solid var(--border)',
                            color: splWinningSeasons.length > 0 ? '#0284c7' : 'var(--muted)',
                            letterSpacing: '0.02em',
                          }}>
                            🏆 {splWinningSeasons.length}x CHAMPION
                          </span>
                          <div style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--text)' }}>
                            {loc} • {splWinningSeasons.length > 0 ? `${splWinningSeasons.length} Times SPL Winner` : 'Contender'}
                          </div>
                          <p style={{ margin: 0, fontSize: '0.71rem', color: 'var(--muted)', lineHeight: 1.4, flex: 1 }}>
                            {splWinningSeasons.length > 0 
                              ? `Won in: ${splWinningSeasons.map(s => s.monthName.slice(0,3)).join(', ')} ${trophyYear === 'all_time' ? '' : `(${trophyYear})`}`
                              : `In contention for ${yrNum} seasons`}
                          </p>
                          <span style={{
                            fontSize: '0.7rem',
                            fontWeight: 900,
                            color: '#0284c7',
                            background: 'rgba(56, 189, 248, 0.1)',
                            padding: '6px 14px',
                            borderRadius: '8px',
                            border: '1px solid rgba(56, 189, 248, 0.25)',
                            marginTop: 'auto',
                            width: '100%',
                            transition: 'all 0.15s ease',
                          }}>
                            View Ceremony ({splWinningSeasons.length} Seasons) →
                          </span>
                        </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════
                VIEW 2: 🏆 ALL TROPHIES VIEW
                - If 'all_time': Exactly 3 Grand Trophies with Full All-Time Winners Leaderboard
                - If single year (2026/2025): 12 Monthly Boxes per League
            ══════════════════════════════════════════════════════════ */}
            {seasonCategoryFilter !== 'locations' && (() => {
              const rawLeagues: Array<{
                id: 'rpl' | 'wpl' | 'spl';
                title: string;
                subtitle: string;
                icon?: string;
                trophyType: 'fifa_globe' | 'webb_ellis' | 'icc_pillars';
                color: string;
              }> = [
                {
                  id: 'rpl',
                  title: 'Revenue Premier League (RPL)',
                  subtitle: 'All-Time Gross Fee Revenue Collections Championship',
                  trophyType: 'fifa_globe',
                  color: '#f59e0b',
                },
                {
                  id: 'wpl',
                  title: 'Walk-in Premier League (WPL)',
                  subtitle: 'All-Time Physical Walk-in Footfall Championship',
                  trophyType: 'webb_ellis',
                  color: '#10b981',
                },
                {
                  id: 'spl',
                  title: 'Sales Premier League (SPL)',
                  subtitle: 'All-Time Student Admissions Volume Championship',
                  trophyType: 'icc_pillars',
                  color: '#0284c7',
                },
              ];
              const leaguesToRender = rawLeagues.filter(l => seasonCategoryFilter === 'all' || seasonCategoryFilter === l.id);

              // ─── IF ALL TIME: DISPLAY EXACTLY 3 GRAND LEAGUE TROPHIES ───
              // ─── UNIFIED LUXURY TROPHY STAGE & SEASONS REGISTER (ALL TIME, 2026, 2025) ───
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>
                  {leaguesToRender.map((league) => {
                    // Determine seasons dataset based on trophyYear
                    let targetMonthsData = monthsData2026;
                    let periodLabel = `${yrNum} Championship Seasons`;
                    let totalSeasonsCount = 12;

                    if (trophyYear === 'all_time') {
                      targetMonthsData = [...monthsData2026.filter(d => !d.isFutureMonth), ...monthsData2025];
                      periodLabel = 'All-Time Historic Championship Seasons';
                    } else if (trophyYear === '2025') {
                      targetMonthsData = monthsData2025;
                      periodLabel = '2025 Championship Seasons';
                    } else {
                      targetMonthsData = monthsData2026;
                      periodLabel = '2026 Championship Seasons';
                    }

                    // Compute campus win aggregation for this specific period
                    const locWinMap: Record<string, { wins: number; totalSales: number; totalCount: number }> = {};
                    LOCATIONS.forEach(l => {
                      locWinMap[l] = { wins: 0, totalSales: 0, totalCount: 0 };
                    });

                    const allWinnersList: Array<{
                      seasonNumber: number;
                      monthName: string;
                      year: number;
                      winnerLoc: string;
                      metricFormatted: string;
                      counselors: string[];
                      isFutureMonth?: boolean;
                      unlockDateText?: string;
                    }> = [];

                    targetMonthsData.forEach(d => {
                      const winner = league.id === 'rpl' ? d.rplWinner : (league.id === 'wpl' ? d.wplWinner : d.splWinner);
                      if (winner && winner.loc) {
                        if (!locWinMap[winner.loc]) locWinMap[winner.loc] = { wins: 0, totalSales: 0, totalCount: 0 };
                        locWinMap[winner.loc].wins += 1;
                        locWinMap[winner.loc].totalSales += (winner as any).sales || d.locSalesMap[winner.loc]?.sales || 0;
                        locWinMap[winner.loc].totalCount += (winner as any).count || 0;

                        const metricFormatted = league.id === 'rpl' 
                          ? `₹${(((winner as any).sales || 0) / 100000).toFixed(2)}L Revenue` 
                          : (league.id === 'wpl' ? `${(winner as any).count} Walk-ins` : `${(winner as any).count} Admissions`);

                        allWinnersList.push({
                          seasonNumber: d.m,
                          monthName: d.mName,
                          year: d.year || (trophyYear === '2025' ? 2025 : 2026),
                          winnerLoc: winner.loc,
                          metricFormatted,
                          counselors: Array.from((winner as any).counselors || d.locSalesMap[winner.loc]?.counselors || []),
                          isFutureMonth: false,
                        });
                      } else if (d.isFutureMonth) {
                        allWinnersList.push({
                          seasonNumber: d.m,
                          monthName: d.mName,
                          year: d.year || 2026,
                          winnerLoc: 'Upcoming Season',
                          metricFormatted: 'Unlocks ' + d.unlockDateText,
                          counselors: [],
                          isFutureMonth: true,
                          unlockDateText: d.unlockDateText,
                        });
                      }
                    });

                    const sortedRankings = Object.entries(locWinMap)
                      .map(([name, data]) => ({
                        name,
                        wins: data.wins,
                        totalMetric: league.id === 'rpl' 
                          ? `₹${(data.totalSales / 100000).toFixed(2)}L Collected`
                          : (league.id === 'wpl' ? `${data.totalCount} Walk-ins` : `${data.totalCount} Enrolled`),
                      }))
                      .sort((a, b) => b.wins - a.wins)
                      .map((item, idx) => ({ ...item, rank: idx + 1 }));

                    const topCampus = sortedRankings[0] || { name: 'Hyderabad', wins: 0, totalMetric: '0' };
                    const completedWinsCount = allWinnersList.filter(w => !w.isFutureMonth).length;

                    return (
                      <div
                        key={league.id}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '24px',
                        }}
                      >
                        {/* ── 1. LUXURY HERO STAGE: TROPHY ON LEFT, LAUREL 1-2-3 RANKINGS ON RIGHT ── */}
                        <div
                          style={{
                            background: `radial-gradient(ellipse at 15% 50%, ${league.color}1c 0%, var(--card-bg) 75%)`,
                            border: `1.5px solid ${league.color}44`,
                            borderRadius: '24px',
                            padding: '32px 36px',
                            display: 'grid',
                            gridTemplateColumns: 'minmax(280px, 340px) 1fr',
                            alignItems: 'center',
                            gap: '36px',
                            boxShadow: `0 14px 45px ${league.color}1c`,
                            position: 'relative',
                            overflow: 'hidden',
                          }}
                        >
                          {/* ── LEFT COLUMN: GRAND TROPHY ON ILLUMINATED PEDESTAL ── */}
                          <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative',
                            padding: '12px 10px 0',
                          }}>
                            {/* Ambient Halo Glow */}
                            <div style={{
                              position: 'absolute',
                              width: '270px',
                              height: '270px',
                              background: `radial-gradient(circle, ${league.color}44 0%, ${league.color}11 55%, transparent 75%)`,
                              filter: 'blur(28px)',
                              pointerEvents: 'none',
                              zIndex: 0,
                            }} />

                            {/* Trophy */}
                            <div style={{ position: 'relative', zIndex: 1 }}>
                              <ChampionshipTrophy3D type={league.trophyType} size={270} />
                            </div>

                            {/* Luxury Podium Stand */}
                            <div style={{
                              width: '230px',
                              height: '18px',
                              background: `linear-gradient(90deg, transparent 0%, ${league.color}66 50%, transparent 100%)`,
                              borderRadius: '50%',
                              filter: 'blur(4px)',
                              marginTop: '-6px',
                              zIndex: 0,
                            }} />
                          </div>

                          {/* ── RIGHT COLUMN: TITLE, LAUREL MEDALS & ACCOLADES ── */}
                          <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '20px',
                            zIndex: 1,
                          }}>
                            {/* Header with Colorful League Gradient & Edition Badge */}
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '8px' }}>
                                <span style={{
                                  fontSize: '0.74rem',
                                  fontWeight: 900,
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.08em',
                                  padding: '4px 12px',
                                  borderRadius: '8px',
                                  background: `${league.color}18`,
                                  border: `1.5px solid ${league.color}55`,
                                  color: league.color,
                                  boxShadow: `0 2px 10px ${league.color}22`,
                                }}>
                                  {trophyYear === 'all_time' ? 'All-Time Edition' : `${trophyYear} Edition`}
                                </span>
                                <span style={{
                                  fontSize: '0.74rem',
                                  fontWeight: 800,
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.06em',
                                  padding: '4px 10px',
                                  borderRadius: '8px',
                                  background: 'var(--surface-alt)',
                                  border: '1px solid var(--border)',
                                  color: 'var(--muted)',
                                }}>
                                  {completedWinsCount} Awarded Seasons
                                </span>
                              </div>

                              <h2 style={{
                                margin: 0,
                                fontSize: '2.15rem',
                                fontWeight: 950,
                                letterSpacing: '-0.03em',
                                lineHeight: 1.18,
                                background: league.id === 'rpl'
                                  ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 40%, #b45309 85%, #78350f 100%)'
                                  : (league.id === 'wpl'
                                    ? 'linear-gradient(135deg, #10b981 0%, #059669 40%, #047857 85%, #064e3b 100%)'
                                    : 'linear-gradient(135deg, #0284c7 0%, #2563eb 40%, #1d4ed8 85%, #1e1b4b 100%)'),
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                filter: `drop-shadow(0 2px 10px ${league.color}30)`,
                                display: 'inline-block',
                              }}>
                                {league.title}
                              </h2>

                              <p style={{ margin: '6px 0 0 0', fontSize: '0.94rem', color: 'var(--muted)', fontWeight: 600 }}>
                                {league.subtitle}
                              </p>
                            </div>

                            {/* 🏆 ALL-TIME / YEARLY CAMPUS PODIUM (HORIZONTAL CARDS) */}
                            <div>
                              <div style={{ fontSize: '0.78rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span>🏆</span> {trophyYear === 'all_time' ? 'All-Time' : trophyYear} Campus Championship Podium
                              </div>

                              <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                gap: '14px',
                              }}>
                                {sortedRankings.slice(0, 3).map((item, idx) => {
                                  const rankNum = (idx + 1) as 1 | 2 | 3;
                                  const styles = [
                                    {
                                      bg: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, var(--card-bg) 100%)',
                                      border: '1.5px solid rgba(245, 158, 11, 0.4)',
                                      titleColor: '#d97706',
                                      glow: '0 6px 20px rgba(245, 158, 11, 0.12)',
                                    },
                                    {
                                      bg: 'linear-gradient(135deg, rgba(148, 163, 184, 0.12) 0%, var(--card-bg) 100%)',
                                      border: '1.5px solid rgba(148, 163, 184, 0.4)',
                                      titleColor: '#64748b',
                                      glow: '0 6px 20px rgba(100, 116, 139, 0.12)',
                                    },
                                    {
                                      bg: 'linear-gradient(135deg, rgba(234, 88, 12, 0.12) 0%, var(--card-bg) 100%)',
                                      border: '1.5px solid rgba(234, 88, 12, 0.4)',
                                      titleColor: '#c2410c',
                                      glow: '0 6px 20px rgba(234, 88, 12, 0.12)',
                                    },
                                  ][idx] || {
                                    bg: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, var(--card-bg) 100%)',
                                    border: '1.5px solid rgba(245, 158, 11, 0.4)',
                                    titleColor: '#d97706',
                                    glow: '0 6px 20px rgba(245, 158, 11, 0.12)',
                                  };

                                  return (
                                    <div
                                      key={item.name}
                                      style={{
                                        background: styles.bg,
                                        border: styles.border,
                                        borderRadius: '18px',
                                        padding: '14px 16px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        boxShadow: styles.glow,
                                        position: 'relative',
                                        overflow: 'hidden',
                                        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                                      }}
                                    >
                                      {/* Modern Luxury 3D Rank Badge */}
                                      <LaurelRankMedal rank={rankNum} size={50} />

                                      {/* Campus Info */}
                                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', minWidth: 0, flex: 1 }}>
                                        <div style={{
                                          fontSize: '1.02rem',
                                          fontWeight: 950,
                                          color: 'var(--text)',
                                          letterSpacing: '-0.01em',
                                          whiteSpace: 'nowrap',
                                        }}>
                                          {item.name}
                                        </div>

                                        <div style={{
                                          fontSize: '0.84rem',
                                          fontWeight: 900,
                                          color: styles.titleColor,
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '6px',
                                        }}>
                                          <span>🏆</span> {item.wins} Championship {item.wins === 1 ? 'Title' : 'Titles'}
                                        </div>

                                        <div style={{ fontSize: '0.76rem', color: 'var(--muted)', fontWeight: 700 }}>
                                          {item.totalMetric}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Modern Accolades */}
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
                              <div style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '7px 14px',
                                borderRadius: '9999px',
                                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(245, 158, 11, 0.08))',
                                border: '1px solid rgba(245, 158, 11, 0.45)',
                                fontSize: '0.78rem',
                                fontWeight: 900,
                                color: '#f59e0b',
                              }}>
                                <span>👑</span> Reigning Champion: {topCampus.name}
                              </div>

                              <div style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '7px 14px',
                                borderRadius: '9999px',
                                background: 'rgba(2, 132, 199, 0.12)',
                                border: '1px solid rgba(2, 132, 199, 0.35)',
                                fontSize: '0.78rem',
                                fontWeight: 800,
                                color: '#0284c7',
                              }}>
                                <span>⭐</span> Total {completedWinsCount} Cups Awarded
                              </div>

                              <div style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '7px 14px',
                                borderRadius: '9999px',
                                background: 'rgba(16, 185, 129, 0.12)',
                                border: '1px solid rgba(16, 185, 129, 0.35)',
                                fontSize: '0.78rem',
                                fontWeight: 800,
                                color: '#10b981',
                              }}>
                                <span>⚡</span> Highly Competitive
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* ── 2. LOCATION CHAMPIONSHIP CABINETS (ONLY CAMPUSES WITH WINS) ── */}
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 360px))',
                          gap: '20px',
                        }}>
                          {LOCATIONS.filter((loc) => {
                            const locWins = allWinnersList.filter(
                              (w) => !w.isFutureMonth && w.winnerLoc.toLowerCase() === loc.toLowerCase()
                            );
                            return locWins.length > 0;
                          }).map((loc) => {
                            const locWins = allWinnersList.filter(
                              (w) => !w.isFutureMonth && w.winnerLoc.toLowerCase() === loc.toLowerCase()
                            );
                            const totalWins = locWins.length;
                            const locData = locWinMap[loc] || { wins: 0, totalSales: 0, totalCount: 0 };
                            const locMetric = league.id === 'rpl'
                              ? `₹${(locData.totalSales / 100000).toFixed(2)}L Collected`
                              : (league.id === 'wpl' ? `${locData.totalCount} Walk-ins` : `${locData.totalCount} Enrolled`);

                            const locColors: Record<string, { border: string; bg: string; badgeBg: string; text: string }> = {
                              Hyderabad: { border: 'rgba(245, 158, 11, 0.45)', bg: 'radial-gradient(ellipse at top, rgba(245, 158, 11, 0.12) 0%, var(--card-bg) 75%)', badgeBg: 'rgba(245, 158, 11, 0.2)', text: '#f59e0b' },
                              Vijayawada: { border: 'rgba(56, 189, 248, 0.45)', bg: 'radial-gradient(ellipse at top, rgba(56, 189, 248, 0.12) 0%, var(--card-bg) 75%)', badgeBg: 'rgba(56, 189, 248, 0.2)', text: '#0284c7' },
                              Visakhapatnam: { border: 'rgba(16, 185, 129, 0.45)', bg: 'radial-gradient(ellipse at top, rgba(16, 185, 129, 0.12) 0%, var(--card-bg) 75%)', badgeBg: 'rgba(16, 185, 129, 0.2)', text: '#10b981' },
                              Bangalore: { border: 'rgba(239, 68, 68, 0.45)', bg: 'radial-gradient(ellipse at top, rgba(239, 68, 68, 0.12) 0%, var(--card-bg) 75%)', badgeBg: 'rgba(239, 68, 68, 0.2)', text: '#ef4444' },
                            };
                            const locStyle = locColors[loc] || locColors['Hyderabad'];

                            return (
                              <div
                                key={loc}
                                style={{
                                  background: locStyle.bg,
                                  border: `1.5px solid ${locStyle.border}`,
                                  borderRadius: '20px',
                                  padding: '20px 20px 18px',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '12px',
                                  boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
                                  position: 'relative',
                                }}
                              >
                                {/* Location Header without dots/emojis */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <h4 style={{ margin: 0, fontSize: '1.16rem', fontWeight: 900, color: 'var(--text)' }}>
                                    {loc} Campus
                                  </h4>

                                  {/* Win Multiplier Badge */}
                                  <span style={{
                                    fontSize: '0.78rem',
                                    fontWeight: 900,
                                    padding: '4px 12px',
                                    borderRadius: '9999px',
                                    background: locStyle.badgeBg,
                                    border: `1px solid ${locStyle.border}`,
                                    color: locStyle.text,
                                    letterSpacing: '0.02em',
                                    whiteSpace: 'nowrap',
                                  }}>
                                    {totalWins > 0 ? `🏆 ${totalWins}x Winner` : 'Contender'}
                                  </span>
                                </div>

                                {/* All-Time Year Summary & Expandable Winning Roll */}
                                {trophyYear === 'all_time' ? (() => {
                                  const wins2026 = locWins.filter(w => w.year === 2026).length;
                                  const wins2025 = locWins.filter(w => w.year === 2025).length;
                                  const boxKey = `${league.id}-${loc}`;
                                  const isExpanded = !!expandedAllTimeRolls[boxKey];

                                  return (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                      {/* Year-by-Year Championship Breakdown Pills */}
                                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        {wins2026 > 0 && (
                                          <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '9px 12px',
                                            borderRadius: '10px',
                                            background: 'var(--card-bg)',
                                            border: '1px solid var(--border)',
                                            fontSize: '0.82rem',
                                            fontWeight: 800,
                                            color: 'var(--text)',
                                          }}>
                                            <span>2026 Edition</span>
                                            <span style={{ color: locStyle.text, fontWeight: 900, fontSize: '0.78rem' }}>
                                              🏆 {wins2026}x Champion
                                            </span>
                                          </div>
                                        )}
                                        {wins2025 > 0 && (
                                          <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '9px 12px',
                                            borderRadius: '10px',
                                            background: 'var(--card-bg)',
                                            border: '1px solid var(--border)',
                                            fontSize: '0.82rem',
                                            fontWeight: 800,
                                            color: 'var(--text)',
                                          }}>
                                            <span>2025 Edition</span>
                                            <span style={{ color: locStyle.text, fontWeight: 900, fontSize: '0.78rem' }}>
                                              🏆 {wins2025}x Champion
                                            </span>
                                          </div>
                                        )}
                                      </div>

                                      {/* Expandable Arrow Button */}
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setExpandedAllTimeRolls(prev => ({ ...prev, [boxKey]: !prev[boxKey] }));
                                        }}
                                        style={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'space-between',
                                          padding: '8px 12px',
                                          borderRadius: '9px',
                                          background: 'var(--surface-alt)',
                                          border: '1px solid var(--border)',
                                          color: 'var(--text)',
                                          fontSize: '0.76rem',
                                          fontWeight: 800,
                                          cursor: 'pointer',
                                          transition: 'all 0.15s ease',
                                          marginTop: '2px',
                                        }}
                                      >
                                        <span>
                                          {isExpanded ? 'Hide Seasons Roll' : `View All Seasons List (${totalWins})`}
                                        </span>
                                        <span style={{
                                          fontSize: '0.72rem',
                                          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                          transition: 'transform 0.2s ease',
                                          display: 'inline-block',
                                        }}>
                                          ▼
                                        </span>
                                      </button>

                                      {/* Expanded Detailed Seasons List */}
                                      {isExpanded && (
                                        <div style={{
                                          display: 'flex',
                                          flexDirection: 'column',
                                          gap: '6px',
                                          maxHeight: '220px',
                                          overflowY: 'auto',
                                          paddingRight: '4px',
                                          marginTop: '2px',
                                        }}>
                                          {locWins.map((win, wIdx) => (
                                            <div
                                              key={wIdx}
                                              style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                padding: '7px 10px',
                                                borderRadius: '8px',
                                                background: 'var(--card-bg)',
                                                border: '1px solid var(--border)',
                                                fontSize: '0.76rem',
                                                fontWeight: 800,
                                                color: 'var(--text)',
                                              }}
                                            >
                                              Season {win.seasonNumber} • {win.monthName} {win.year}
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })() : (
                                  /* Single Year Direct Roll (2026 or 2025) */
                                  <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '8px',
                                  }}>
                                    <div style={{ fontSize: '0.72rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted)' }}>
                                      Winning Roll ({totalWins} {totalWins === 1 ? 'Season' : 'Seasons'})
                                    </div>

                                    {totalWins > 0 ? (
                                      <div style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '6px',
                                        maxHeight: '260px',
                                        overflowY: 'auto',
                                        paddingRight: '4px',
                                      }}>
                                        {locWins.map((win, wIdx) => (
                                          <div
                                            key={wIdx}
                                            style={{
                                              display: 'flex',
                                              alignItems: 'center',
                                              padding: '8px 12px',
                                              borderRadius: '10px',
                                              background: 'var(--card-bg)',
                                              border: '1px solid var(--border)',
                                              fontSize: '0.78rem',
                                              fontWeight: 800,
                                              color: 'var(--text)',
                                              transition: 'all 0.15s ease',
                                            }}
                                          >
                                            Season {win.seasonNumber} • {win.monthName} {win.year}
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <div style={{
                                        padding: '16px 12px',
                                        borderRadius: '10px',
                                        background: 'var(--surface-alt)',
                                        textAlign: 'center',
                                        fontSize: '0.76rem',
                                        color: 'var(--muted)',
                                        fontWeight: 600,
                                      }}>
                                        In active contention for upcoming seasons
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        );
      })()}

      {/* ══════════════════════════════════════════════════════
          TAB: 🎖️ BADGES & MEDALS — Counselor Achievements & Honors
      ══════════════════════════════════════════════════════ */}
      {activeTab === 'badges' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Header Banner */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.9) 100%)',
            border: '1.5px solid rgba(168, 85, 247, 0.4)',
            borderRadius: '20px',
            padding: '24px 28px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '20px',
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.25)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <span style={{ fontSize: '2.2rem' }}>🎖️</span>
              <div>
                <h2 style={{
                  fontSize: '1.45rem',
                  fontWeight: 900,
                  margin: 0,
                  background: 'linear-gradient(135deg, #ffffff 0%, #f3e8ff 50%, #c084fc 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '-0.01em',
                }}>
                  Counselor Badges &amp; Championship Medals
                </h2>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.84rem', color: '#94a3b8', fontWeight: 600 }}>
                  Official Codegnan counselor achievement shields, performance medals, and milestone accolades
                </p>
              </div>
            </div>

            {/* Badges Category Filter */}
            <div style={{ display: 'inline-flex', background: 'rgba(15, 23, 42, 0.75)', padding: '4px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.12)', flexWrap: 'wrap', gap: '4px' }}>
              {[
                { id: 'all', label: 'All Badges & Medals' },
                { id: 'milestone', label: 'Milestones' },
                { id: 'season', label: 'Season Medals' },
                { id: 'special', label: 'Special Honors' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setBadgeCategoryFilter(cat.id as any)}
                  style={{
                    padding: '6px 16px',
                    borderRadius: '7px',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    border: 'none',
                    background: badgeCategoryFilter === cat.id ? 'linear-gradient(135deg, #a855f7, #7e22ce)' : 'transparent',
                    color: badgeCategoryFilter === cat.id ? '#fff' : '#94a3b8',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: badgeCategoryFilter === cat.id ? '0 2px 8px rgba(168, 85, 247, 0.3)' : 'none',
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Section 1: Counselor Milestone & Performance Badges (Shields) */}
          {(badgeCategoryFilter === 'all' || badgeCategoryFilter !== 'season') && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, color: 'var(--text)' }}>
                  🛡️ Counselor Milestone &amp; Achievement Badges
                </h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--muted)', fontWeight: 700 }}>
                  Showing pure data-driven milestones unlocked by counselors
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '18px' }}>
                {ALL_BADGES
                  .filter((b) => b.category !== 'season' && (badgeCategoryFilter === 'all' || b.category === badgeCategoryFilter))
                  .map((b) => {
                    const qualifiers = counselorGamifications.filter((cg) => {
                      const badgeObj = cg.badges.find((cb) => cb.id === b.id);
                      return badgeObj?.isUnlocked;
                    });

                    return (
                      <div
                        key={b.id}
                        onClick={() => setSelectedBadgeModal(b)}
                        style={{
                          background: 'var(--card-bg)',
                          border: '1.5px solid var(--border)',
                          borderRadius: '16px',
                          padding: '28px 20px 22px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          textAlign: 'center',
                          gap: '12px',
                          boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          minHeight: '340px',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-4px)';
                          e.currentTarget.style.borderColor = 'var(--primary)';
                          e.currentTarget.style.boxShadow = '0 10px 28px rgba(99,102,241,0.16)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.borderColor = 'var(--border)';
                          e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.04)';
                        }}
                      >
                        <BadgeCrest tier={b.tier} size={140} isUnlocked={true} icon={b.icon} shape="shield" />
                        <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 900, color: 'var(--text)', lineHeight: 1.3 }}>
                          {b.name}
                        </h4>
                        <span style={{
                          fontSize: '0.74rem', fontWeight: 900, padding: '4px 14px', borderRadius: '6px',
                          background: qualifiers.length > 0 ? 'rgba(16,185,129,0.12)' : 'var(--surface-alt)',
                          border: qualifiers.length > 0 ? '1px solid rgba(16,185,129,0.3)' : '1px solid var(--border)',
                          color: qualifiers.length > 0 ? '#10b981' : 'var(--muted)',
                        }}>
                          {qualifiers.length} Counselors Qualified
                        </span>
                        <p style={{ margin: 0, fontSize: '0.74rem', color: 'var(--muted)', lineHeight: 1.5, flex: 1 }}>
                          {b.description}
                        </p>
                        <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--primary)', marginTop: 'auto' }}>
                          View Medal Leaderboard →
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Section 2: Official Season Championship Medals */}
          {(badgeCategoryFilter === 'all' || badgeCategoryFilter === 'season') && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: badgeCategoryFilter === 'all' ? '12px' : '0px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, color: 'var(--text)' }}>
                  🥇 Official Season Championship Medals
                </h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--muted)', fontWeight: 700 }}>
                  Awarded to top performing counselors upon calendar season conclusion
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '18px' }}>
                {ALL_BADGES
                  .filter((b) => b.category === 'season')
                  .map((b) => {
                    const qualifiers = counselorGamifications.filter((cg) => {
                      const badgeObj = cg.badges.find((cb) => cb.id === b.id);
                      return badgeObj?.isUnlocked;
                    });

                    return (
                      <div
                        key={b.id}
                        onClick={() => setSelectedBadgeModal(b)}
                        style={{
                          background: 'var(--card-bg)',
                          border: '1.5px solid var(--border)',
                          borderRadius: '16px',
                          padding: '28px 20px 22px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          textAlign: 'center',
                          gap: '12px',
                          boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          minHeight: '340px',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-4px)';
                          e.currentTarget.style.borderColor = '#f59e0b';
                          e.currentTarget.style.boxShadow = '0 10px 28px rgba(245,158,11,0.16)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.borderColor = 'var(--border)';
                          e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.04)';
                        }}
                      >
                        <BadgeCrest tier={b.tier} size={140} isUnlocked={true} icon={b.icon} shape="medal" />
                        <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 900, color: 'var(--text)', lineHeight: 1.3 }}>
                          {b.name}
                        </h4>
                        <span style={{
                          fontSize: '0.74rem', fontWeight: 900, padding: '4px 14px', borderRadius: '6px',
                          background: qualifiers.length > 0 ? 'rgba(245,158,11,0.14)' : 'var(--surface-alt)',
                          border: qualifiers.length > 0 ? '1px solid rgba(245,158,11,0.35)' : '1px solid var(--border)',
                          color: qualifiers.length > 0 ? '#f59e0b' : 'var(--muted)',
                        }}>
                          {qualifiers.length} Counselors Awarded
                        </span>
                        <p style={{ margin: 0, fontSize: '0.74rem', color: 'var(--muted)', lineHeight: 1.5, flex: 1 }}>
                          {b.description}
                        </p>
                        <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#f59e0b', marginTop: 'auto' }}>
                          View Medal Leaderboard →
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      )}


            {/* ══════════════════════════════════════════════════════
          TAB: 📊 COUNSELOR STANDINGS & LEADERBOARD
      ══════════════════════════════════════════════════════ */}
      {activeTab === 'points_table' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          
                    {/* ─── Unified Ultra-Modern Filter & League Control Bar (Combined Single Row) ─── */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px',
            background: 'var(--surface)',
            border: '1.5px solid var(--border)',
            borderRadius: '11px',
            padding: '6px 12px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
            position: 'relative',
            zIndex: 40,
            overflow: 'visible',
          }}>
            {/* Left: First League Pills (Overall, RPL, WPL, SPL), then Divider, then Timeframe Modes */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {/* 1. Clean League Segment Pills: Overall, RPL, WPL, SPL */}
              <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
                {[
                  { id: 'all', label: 'Overall', color: 'var(--primary)' },
                  { id: 'rpl', label: 'RPL', color: '#f59e0b' },
                  { id: 'wpl', label: 'WPL', color: '#10b981' },
                  { id: 'spl', label: 'SPL', color: '#0284c7' },
                ].map((l) => {
                  const isActive = leagueMetricFilter === l.id;
                  return (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => setLeagueMetricFilter(l.id as any)}
                      style={{
                        height: '26px',
                        padding: '0 10px',
                        borderRadius: '6px',
                        border: isActive ? `1.5px solid ${l.color}` : '1.5px solid transparent',
                        background: isActive ? `${l.color}15` : 'transparent',
                        color: isActive ? l.color : 'var(--muted)',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {l.label}
                    </button>
                  );
                })}
              </div>

              {/* Subtle Vertical Divider */}
              <div style={{ width: '1.5px', height: '16px', background: 'var(--border)', margin: '0 2px' }} />

              {/* 2. Timeframe Modes: Daily, Weekly, Monthly, Yearly, All Time, Custom Range */}
              <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
                {[
                  { id: 'daily', label: 'Daily' },
                  { id: 'weekly', label: 'Weekly' },
                  { id: 'monthly', label: 'Monthly' },
                  { id: 'yearly', label: 'Yearly' },
                  { id: 'all_time', label: 'All Time' },
                  { id: 'custom', label: 'Custom Range' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setAnalyticsTimeframe(prev => ({ ...prev, mode: tab.id as any }))}
                    style={{
                      height: '26px',
                      padding: '0 10px',
                      borderRadius: '6px',
                      border: 'none',
                      background: analyticsTimeframe.mode === tab.id ? 'var(--primary)' : 'transparent',
                      color: analyticsTimeframe.mode === tab.id ? '#ffffff' : 'var(--text)',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      boxShadow: analyticsTimeframe.mode === tab.id ? '0 2px 6px rgba(99, 102, 241, 0.25)' : 'none',
                      transition: 'all 0.15s ease',
                      whiteSpace: 'nowrap',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Custom Date Filter Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'nowrap', flexShrink: 0 }}>
              {/* 1. DAILY */}
              {analyticsTimeframe.mode === 'daily' && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', flexWrap: 'nowrap' }}>
                  <ModernDropdownMenu
                    value={analyticsTimeframe.dailySub}
                    options={[
                      { value: 'today', label: 'Today' },
                      { value: 'yesterday', label: 'Yesterday' },
                      { value: 'custom_day', label: 'Custom' },
                    ]}
                    onChange={(val) => setAnalyticsTimeframe(prev => ({ ...prev, dailySub: val as any }))}
                  />
                  {analyticsTimeframe.dailySub === 'custom_day' && (
                    <ModernDatePicker
                      value={analyticsTimeframe.customDay}
                      onChange={(val) => setAnalyticsTimeframe(prev => ({ ...prev, customDay: val }))}
                    />
                  )}
                </div>
              )}

              {/* 2. WEEKLY */}
              {analyticsTimeframe.mode === 'weekly' && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', flexWrap: 'nowrap' }}>
                  <ModernDropdownMenu
                    value={analyticsTimeframe.weeklySub}
                    options={[
                      { value: 'this_week', label: 'This Week' },
                      { value: 'last_week', label: 'Last Week' },
                      { value: 'last_7_days', label: 'Last 7 Days' },
                      { value: 'custom', label: 'Custom' },
                    ]}
                    onChange={(val) => setAnalyticsTimeframe(prev => ({ ...prev, weeklySub: val as any }))}
                  />
                  {(analyticsTimeframe.weeklySub as string) === 'custom' && (
                    <ModernDateRangePicker
                      startDate={analyticsTimeframe.customStartDate}
                      endDate={analyticsTimeframe.customEndDate}
                      onChange={(s, e) => setAnalyticsTimeframe(prev => ({ ...prev, customStartDate: s, customEndDate: e }))}
                    />
                  )}
                </div>
              )}

              {/* 3. MONTHLY */}
              {analyticsTimeframe.mode === 'monthly' && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', flexWrap: 'nowrap' }}>
                  <ModernDropdownMenu
                    value={analyticsTimeframe.monthlySub}
                    options={[
                      { value: 'current_month', label: 'Current Month' },
                      { value: 'prev_month', label: 'Previous Month' },
                      { value: 'specific_month', label: 'Custom' },
                    ]}
                    onChange={(val) => setAnalyticsTimeframe(prev => ({ ...prev, monthlySub: val as any }))}
                  />
                  {analyticsTimeframe.monthlySub === 'specific_month' && (
                    <ModernDateRangePicker
                      startDate={analyticsTimeframe.customStartDate}
                      endDate={analyticsTimeframe.customEndDate}
                      onChange={(s, e) => setAnalyticsTimeframe(prev => ({ ...prev, customStartDate: s, customEndDate: e }))}
                    />
                  )}
                </div>
              )}

              {/* 4. YEARLY */}
              {analyticsTimeframe.mode === 'yearly' && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', flexWrap: 'nowrap' }}>
                  <ModernDropdownMenu
                    value={analyticsTimeframe.yearlySub}
                    options={[
                      { value: '2026', label: '2026 Annual' },
                      { value: '2025', label: '2025 Annual' },
                      { value: 'custom', label: 'Custom' },
                    ]}
                    onChange={(val) => setAnalyticsTimeframe(prev => ({ ...prev, yearlySub: val as any }))}
                  />
                  {(analyticsTimeframe.yearlySub as string) === 'custom' && (
                    <ModernDateRangePicker
                      startDate={analyticsTimeframe.customStartDate}
                      endDate={analyticsTimeframe.customEndDate}
                      onChange={(s, e) => setAnalyticsTimeframe(prev => ({ ...prev, customStartDate: s, customEndDate: e }))}
                    />
                  )}
                </div>
              )}

              {/* 5. CUSTOM RANGE */}
              {analyticsTimeframe.mode === 'custom' && (
                <ModernDateRangePicker
                  startDate={analyticsTimeframe.customStartDate}
                  endDate={analyticsTimeframe.customEndDate}
                  onChange={(s, e) => setAnalyticsTimeframe(prev => ({ ...prev, customStartDate: s, customEndDate: e }))}
                />
              )}
            </div>
          </div>

          {/* Championship Counselor Podium - Top 3 Counselors */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            width: '100%',
            gap: '18px',
            alignItems: 'stretch',
          }}>
            {/* 2nd Place Counselor */}
            <div style={{
              background: 'var(--card-bg)',
              border: '1.5px solid rgba(148, 163, 184, 0.4)',
              borderRadius: '18px',
              padding: '22px',
              textAlign: 'center',
              boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
            }}>
              <div style={{
                width: '46px', height: '46px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #94a3b8, #64748b)',
                color: '#fff', fontSize: '1.1rem', fontWeight: 900,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 10px auto',
                boxShadow: '0 4px 12px rgba(148, 163, 184, 0.35)',
              }}>
                🥈
              </div>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Runner Up (#2)
              </span>
              <h3 style={{ margin: '4px 0 2px 0', fontSize: '1.05rem', fontWeight: 900, color: 'var(--text)' }}>
                {filteredCounselors[1]?.name || 'Counselor'}
              </h3>
              <p style={{ margin: 0, fontSize: '0.76rem', color: 'var(--muted)' }}>
                📍 {filteredCounselors[1]?.branchName || 'Branch'}
              </p>
              <div style={{
                marginTop: '12px', padding: '8px', borderRadius: '8px',
                background: 'var(--surface-alt)', fontSize: '0.88rem', fontWeight: 900,
                color: '#94a3b8', fontFamily: 'var(--font-mono)',
              }}>
                {leagueMetricFilter === 'rpl' ? `₹${(((filteredCounselors[1]?.totalSales || 0)) / 100000).toFixed(2)}L Revenue` : leagueMetricFilter === 'wpl' ? `${filteredCounselors[1]?.walkinCount || 0} Walk-ins` : leagueMetricFilter === 'spl' ? `${filteredCounselors[1]?.completedCount || 0} Admissions` : `${filteredCounselors[1]?.xp || 0} XP`}
              </div>
            </div>

            {/* 1st Place Champion Counselor */}
            <div style={{
              background: 'linear-gradient(180deg, rgba(245, 158, 11, 0.08) 0%, var(--card-bg) 100%)',
              border: '2px solid rgba(245, 158, 11, 0.65)',
              borderRadius: '20px',
              padding: '26px 20px',
              textAlign: 'center',
              boxShadow: '0 8px 24px rgba(245, 158, 11, 0.12)',
              position: 'relative',
            }}>
              <div style={{
                position: 'absolute', top: '-11px', left: '50%', transform: 'translateX(-50%)',
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: '#fff', fontSize: '0.66rem', fontWeight: 900, padding: '2px 12px',
                borderRadius: '9999px', letterSpacing: '0.05em', textTransform: 'uppercase',
              }}>
                👑 Counselor MVP ({monthShortName})
              </div>
              <div style={{
                width: '54px', height: '54px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: '#fff', fontSize: '1.4rem', fontWeight: 900,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 10px auto',
                boxShadow: '0 6px 16px rgba(245, 158, 11, 0.35)',
              }}>
                🏆
              </div>
              <span style={{ fontSize: '0.72rem', fontWeight: 900, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Rank #1
              </span>
              <h3 style={{ margin: '4px 0 2px 0', fontSize: '1.2rem', fontWeight: 900, color: 'var(--text)' }}>
                {filteredCounselors[0]?.name || 'Top Counselor'}
              </h3>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--muted)' }}>
                📍 {filteredCounselors[0]?.branchName || 'Branch'}
              </p>
              <div style={{
                marginTop: '12px', padding: '9px', borderRadius: '10px',
                background: 'rgba(245, 158, 11, 0.15)', fontSize: '1.05rem', fontWeight: 900,
                color: '#f59e0b', fontFamily: 'var(--font-mono)',
              }}>
                {leagueMetricFilter === 'rpl' ? `₹${(((filteredCounselors[0]?.totalSales || 0)) / 100000).toFixed(2)}L Revenue` : leagueMetricFilter === 'wpl' ? `${filteredCounselors[0]?.walkinCount || 0} Walk-ins` : leagueMetricFilter === 'spl' ? `${filteredCounselors[0]?.completedCount || 0} Admissions` : `${filteredCounselors[0]?.xp || 0} XP`}
              </div>
            </div>

            {/* 3rd Place Counselor */}
            <div style={{
              background: 'var(--card-bg)',
              border: '1.5px solid rgba(205, 127, 50, 0.4)',
              borderRadius: '18px',
              padding: '22px',
              textAlign: 'center',
              boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
            }}>
              <div style={{
                width: '46px', height: '46px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #cd7f32, #a0522d)',
                color: '#fff', fontSize: '1.1rem', fontWeight: 900,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 10px auto',
                boxShadow: '0 4px 12px rgba(205, 127, 50, 0.35)',
              }}>
                🥉
              </div>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#cd7f32', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Bronze Tier (#3)
              </span>
              <h3 style={{ margin: '4px 0 2px 0', fontSize: '1.05rem', fontWeight: 900, color: 'var(--text)' }}>
                {filteredCounselors[2]?.name || 'Counselor'}
              </h3>
              <p style={{ margin: 0, fontSize: '0.76rem', color: 'var(--muted)' }}>
                📍 {filteredCounselors[2]?.branchName || 'Branch'}
              </p>
              <div style={{
                marginTop: '12px', padding: '8px', borderRadius: '8px',
                background: 'var(--surface-alt)', fontSize: '0.88rem', fontWeight: 900,
                color: '#cd7f32', fontFamily: 'var(--font-mono)',
              }}>
                {leagueMetricFilter === 'rpl' ? `₹${(((filteredCounselors[2]?.totalSales || 0)) / 100000).toFixed(2)}L Revenue` : leagueMetricFilter === 'wpl' ? `${filteredCounselors[2]?.walkinCount || 0} Walk-ins` : leagueMetricFilter === 'spl' ? `${filteredCounselors[2]?.completedCount || 0} Admissions` : `${filteredCounselors[2]?.xp || 0} XP`}
              </div>
            </div>
          </div>

          {/* Counselor Standings Table Card */}
          <div style={{
            background: 'var(--card-bg)',
            border: '1.5px solid var(--border)',
            borderRadius: '18px',
            padding: '24px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
          }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 16px 0', color: 'var(--text)' }}>
              {timeframeSummaryLabel} Counselor Points Table &amp; Rankings
            </h2>

            <div className="table-wrapper">
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '780px' }}>
                <thead>
                  <tr style={{ borderBottom: '1.5px solid var(--border)', background: 'var(--surface-alt, rgba(255,255,255,0.02))' }}>
                    <th style={{ padding: '12px 16px', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', textAlign: 'left' }}>Rank &amp; Counselor</th>
                    <th style={{ padding: '12px 16px', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', textAlign: 'left' }}>Branch Location</th>
                    <th style={{ padding: '12px 16px', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', textAlign: 'center' }}>Intakes</th>
                    <th style={{ padding: '12px 16px', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', textAlign: 'center' }}>Admissions</th>
                    <th style={{ padding: '12px 16px', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', textAlign: 'center' }}>Conversion %</th>
                    <th style={{ padding: '12px 16px', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', textAlign: 'center' }}>Tier / Badges</th>
                    <th style={{ padding: '12px 16px', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', textAlign: 'right' }}>{leagueMetricFilter === 'rpl' ? '💰 Revenue (₹L)' : leagueMetricFilter === 'wpl' ? '🚶 Walk-ins' : leagueMetricFilter === 'spl' ? '🎓 Admissions' : '🌟 Score (XP)'}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCounselors.map((cg, idx) => (
                    <tr
                      key={cg.id}
                      style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s ease' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-alt)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{
                            width: '26px', height: '26px', borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.75rem', fontWeight: 900,
                            background: idx === 0 ? '#f59e0b' : idx === 1 ? '#94a3b8' : idx === 2 ? '#cd7f32' : 'var(--surface-alt)',
                            color: idx < 3 ? '#ffffff' : 'var(--muted)',
                          }}>
                            {idx + 1}
                          </span>
                          <div style={{
                            width: '32px', height: '32px', borderRadius: '50%',
                            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                            color: '#fff', fontWeight: 800, fontSize: '0.75rem',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            {getInitials(cg.name)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 800, fontSize: '0.86rem', color: 'var(--text)' }}>
                              {cg.name}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>
                              🔥 {cg.streakDays} Day Streak
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text)' }}>
                        📍 {cg.branchName}
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '0.82rem', fontWeight: 800, color: 'var(--text)', textAlign: 'center' }}>
                        {cg.walkinCount}
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '0.82rem', fontWeight: 800, color: 'var(--text)', textAlign: 'center' }}>
                        {cg.completedCount}
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <span style={{
                          padding: '3px 8px', borderRadius: '6px',
                          background: cg.conversionRate >= 70 ? 'rgba(16, 185, 129, 0.12)' : 'var(--surface-alt)',
                          color: cg.conversionRate >= 70 ? '#10b981' : 'var(--text)',
                          fontWeight: 800, fontSize: '0.78rem',
                        }}>
                          {cg.conversionRate}%
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <span style={{
                          padding: '3px 10px', borderRadius: '9999px',
                          background: 'rgba(99, 102, 241, 0.1)',
                          border: '1px solid rgba(99, 102, 241, 0.25)',
                          color: 'var(--primary)',
                          fontWeight: 800, fontSize: '0.74rem',
                        }}>
                          🎖️ {cg.tierName} ({cg.badges.length} Badges)
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 900, fontSize: '0.92rem', color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>
                        {leagueMetricFilter === 'rpl' ? `₹${(((cg.totalSales || 0)) / 100000).toFixed(2)}L` : leagueMetricFilter === 'wpl' ? `${cg.walkinCount || 0}` : leagueMetricFilter === 'spl' ? `${cg.completedCount || 0}` : `${cg.xp} XP`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          TAB: 🏆 CAMPUS STANDINGS & LEADERBOARD
      ══════════════════════════════════════════════════════ */}
      {activeTab === 'league' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          
                    {/* ─── Unified Ultra-Modern Filter & League Control Bar (Combined Single Row) ─── */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px',
            background: 'var(--surface)',
            border: '1.5px solid var(--border)',
            borderRadius: '11px',
            padding: '6px 12px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
            position: 'relative',
            zIndex: 40,
            overflow: 'visible',
          }}>
            {/* Left: First League Pills (Overall, RPL, WPL, SPL), then Divider, then Timeframe Modes */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {/* 1. Clean League Segment Pills: Overall, RPL, WPL, SPL */}
              <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
                {[
                  { id: 'all', label: 'Overall', color: 'var(--primary)' },
                  { id: 'rpl', label: 'RPL', color: '#f59e0b' },
                  { id: 'wpl', label: 'WPL', color: '#10b981' },
                  { id: 'spl', label: 'SPL', color: '#0284c7' },
                ].map((l) => {
                  const isActive = leagueMetricFilter === l.id;
                  return (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => setLeagueMetricFilter(l.id as any)}
                      style={{
                        height: '26px',
                        padding: '0 10px',
                        borderRadius: '6px',
                        border: isActive ? `1.5px solid ${l.color}` : '1.5px solid transparent',
                        background: isActive ? `${l.color}15` : 'transparent',
                        color: isActive ? l.color : 'var(--muted)',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {l.label}
                    </button>
                  );
                })}
              </div>

              {/* Subtle Vertical Divider */}
              <div style={{ width: '1.5px', height: '16px', background: 'var(--border)', margin: '0 2px' }} />

              {/* 2. Timeframe Modes: Daily, Weekly, Monthly, Yearly, All Time, Custom Range */}
              <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
                {[
                  { id: 'daily', label: 'Daily' },
                  { id: 'weekly', label: 'Weekly' },
                  { id: 'monthly', label: 'Monthly' },
                  { id: 'yearly', label: 'Yearly' },
                  { id: 'all_time', label: 'All Time' },
                  { id: 'custom', label: 'Custom Range' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setAnalyticsTimeframe(prev => ({ ...prev, mode: tab.id as any }))}
                    style={{
                      height: '26px',
                      padding: '0 10px',
                      borderRadius: '6px',
                      border: 'none',
                      background: analyticsTimeframe.mode === tab.id ? 'var(--primary)' : 'transparent',
                      color: analyticsTimeframe.mode === tab.id ? '#ffffff' : 'var(--text)',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      boxShadow: analyticsTimeframe.mode === tab.id ? '0 2px 6px rgba(99, 102, 241, 0.25)' : 'none',
                      transition: 'all 0.15s ease',
                      whiteSpace: 'nowrap',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Custom Date Filter Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'nowrap', flexShrink: 0 }}>
              {/* 1. DAILY */}
              {analyticsTimeframe.mode === 'daily' && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', flexWrap: 'nowrap' }}>
                  <ModernDropdownMenu
                    value={analyticsTimeframe.dailySub}
                    options={[
                      { value: 'today', label: 'Today' },
                      { value: 'yesterday', label: 'Yesterday' },
                      { value: 'custom_day', label: 'Custom' },
                    ]}
                    onChange={(val) => setAnalyticsTimeframe(prev => ({ ...prev, dailySub: val as any }))}
                  />
                  {analyticsTimeframe.dailySub === 'custom_day' && (
                    <ModernDatePicker
                      value={analyticsTimeframe.customDay}
                      onChange={(val) => setAnalyticsTimeframe(prev => ({ ...prev, customDay: val }))}
                    />
                  )}
                </div>
              )}

              {/* 2. WEEKLY */}
              {analyticsTimeframe.mode === 'weekly' && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', flexWrap: 'nowrap' }}>
                  <ModernDropdownMenu
                    value={analyticsTimeframe.weeklySub}
                    options={[
                      { value: 'this_week', label: 'This Week' },
                      { value: 'last_week', label: 'Last Week' },
                      { value: 'last_7_days', label: 'Last 7 Days' },
                      { value: 'custom', label: 'Custom' },
                    ]}
                    onChange={(val) => setAnalyticsTimeframe(prev => ({ ...prev, weeklySub: val as any }))}
                  />
                  {(analyticsTimeframe.weeklySub as string) === 'custom' && (
                    <ModernDateRangePicker
                      startDate={analyticsTimeframe.customStartDate}
                      endDate={analyticsTimeframe.customEndDate}
                      onChange={(s, e) => setAnalyticsTimeframe(prev => ({ ...prev, customStartDate: s, customEndDate: e }))}
                    />
                  )}
                </div>
              )}

              {/* 3. MONTHLY */}
              {analyticsTimeframe.mode === 'monthly' && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', flexWrap: 'nowrap' }}>
                  <ModernDropdownMenu
                    value={analyticsTimeframe.monthlySub}
                    options={[
                      { value: 'current_month', label: 'Current Month' },
                      { value: 'prev_month', label: 'Previous Month' },
                      { value: 'specific_month', label: 'Custom' },
                    ]}
                    onChange={(val) => setAnalyticsTimeframe(prev => ({ ...prev, monthlySub: val as any }))}
                  />
                  {analyticsTimeframe.monthlySub === 'specific_month' && (
                    <ModernDateRangePicker
                      startDate={analyticsTimeframe.customStartDate}
                      endDate={analyticsTimeframe.customEndDate}
                      onChange={(s, e) => setAnalyticsTimeframe(prev => ({ ...prev, customStartDate: s, customEndDate: e }))}
                    />
                  )}
                </div>
              )}

              {/* 4. YEARLY */}
              {analyticsTimeframe.mode === 'yearly' && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', flexWrap: 'nowrap' }}>
                  <ModernDropdownMenu
                    value={analyticsTimeframe.yearlySub}
                    options={[
                      { value: '2026', label: '2026 Annual' },
                      { value: '2025', label: '2025 Annual' },
                      { value: 'custom', label: 'Custom' },
                    ]}
                    onChange={(val) => setAnalyticsTimeframe(prev => ({ ...prev, yearlySub: val as any }))}
                  />
                  {(analyticsTimeframe.yearlySub as string) === 'custom' && (
                    <ModernDateRangePicker
                      startDate={analyticsTimeframe.customStartDate}
                      endDate={analyticsTimeframe.customEndDate}
                      onChange={(s, e) => setAnalyticsTimeframe(prev => ({ ...prev, customStartDate: s, customEndDate: e }))}
                    />
                  )}
                </div>
              )}

              {/* 5. CUSTOM RANGE */}
              {analyticsTimeframe.mode === 'custom' && (
                <ModernDateRangePicker
                  startDate={analyticsTimeframe.customStartDate}
                  endDate={analyticsTimeframe.customEndDate}
                  onChange={(s, e) => setAnalyticsTimeframe(prev => ({ ...prev, customStartDate: s, customEndDate: e }))}
                />
              )}
            </div>
          </div>

          {/* Championship Campus Podium */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            width: '100%',
            gap: '18px',
            alignItems: 'stretch',
          }}>
            {/* 2nd Place Campus */}
            <div style={{
              background: 'var(--card-bg)',
              border: '1.5px solid rgba(148, 163, 184, 0.4)',
              borderRadius: '18px',
              padding: '22px',
              textAlign: 'center',
              boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
            }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #94a3b8, #64748b)',
                color: '#fff', fontSize: '1.1rem', fontWeight: 900,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 10px auto',
                boxShadow: '0 4px 12px rgba(148, 163, 184, 0.35)',
              }}>
                🥈
              </div>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Runner Up (#2)
              </span>
              <h3 style={{ margin: '4px 0 2px 0', fontSize: '1.05rem', fontWeight: 900, color: 'var(--text)' }}>
                {campusStandingsForPeriod[1]?.name || '3rd Campus (Pista House-HYD)'}
              </h3>
              <p style={{ margin: 0, fontSize: '0.76rem', color: 'var(--muted)' }}>
                📍 {campusStandingsForPeriod[1]?.location || 'Hyderabad'}
              </p>
              <div style={{
                marginTop: '12px', padding: '8px', borderRadius: '8px',
                background: 'var(--surface-alt)', fontSize: '0.88rem', fontWeight: 900,
                color: '#94a3b8', fontFamily: 'var(--font-mono)',
              }}>
                {leagueMetricFilter === 'rpl' ? `₹${(((campusStandingsForPeriod[1]?.totalSales || 0)) / 100000).toFixed(2)}L Revenue` : leagueMetricFilter === 'wpl' ? `${campusStandingsForPeriod[1]?.intakeCount || 0} Walk-ins` : leagueMetricFilter === 'spl' ? `${campusStandingsForPeriod[1]?.completedCount || 0} Admissions` : `${campusStandingsForPeriod[1]?.leaguePoints || 840} LP`}
              </div>
            </div>

            {/* 1st Place Campus Champion */}
            <div style={{
              background: 'linear-gradient(180deg, rgba(245, 158, 11, 0.08) 0%, var(--card-bg) 100%)',
              border: '2px solid rgba(245, 158, 11, 0.65)',
              borderRadius: '20px',
              padding: '26px 20px',
              textAlign: 'center',
              boxShadow: '0 8px 24px rgba(245, 158, 11, 0.12)',
              position: 'relative',
            }}>
              <div style={{
                position: 'absolute', top: '-11px', left: '50%', transform: 'translateX(-50%)',
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: '#fff', fontSize: '0.66rem', fontWeight: 900, padding: '2px 12px',
                borderRadius: '9999px', letterSpacing: '0.05em', textTransform: 'uppercase',
              }}>
                👑 {monthShortName} League Champion
              </div>
              <div style={{
                width: '54px', height: '54px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: '#fff', fontSize: '1.4rem', fontWeight: 900,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 10px auto',
                boxShadow: '0 6px 16px rgba(245, 158, 11, 0.35)',
              }}>
                🏆
              </div>
              <span style={{ fontSize: '0.72rem', fontWeight: 900, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Rank #1
              </span>
              <h3 style={{ margin: '4px 0 2px 0', fontSize: '1.2rem', fontWeight: 900, color: 'var(--text)' }}>
                {campusStandingsForPeriod[0]?.name || '1st Campus (JNTU-HYD)'}
              </h3>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--muted)' }}>
                📍 {campusStandingsForPeriod[0]?.location || 'Hyderabad'}
              </p>
              <div style={{
                marginTop: '12px', padding: '9px', borderRadius: '10px',
                background: 'rgba(245, 158, 11, 0.15)', fontSize: '1.05rem', fontWeight: 900,
                color: '#f59e0b', fontFamily: 'var(--font-mono)',
              }}>
                {leagueMetricFilter === 'rpl' ? `₹${(((campusStandingsForPeriod[0]?.totalSales || 0)) / 100000).toFixed(2)}L Revenue` : leagueMetricFilter === 'wpl' ? `${campusStandingsForPeriod[0]?.intakeCount || 0} Walk-ins` : leagueMetricFilter === 'spl' ? `${campusStandingsForPeriod[0]?.completedCount || 0} Admissions` : `${campusStandingsForPeriod[0]?.leaguePoints || 1250} LP`}
              </div>
            </div>

            {/* 3rd Place Campus */}
            <div style={{
              background: 'var(--card-bg)',
              border: '1.5px solid rgba(205, 127, 50, 0.4)',
              borderRadius: '18px',
              padding: '22px',
              textAlign: 'center',
              boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
            }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #cd7f32, #a0522d)',
                color: '#fff', fontSize: '1.1rem', fontWeight: 900,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 10px auto',
                boxShadow: '0 4px 12px rgba(205, 127, 50, 0.35)',
              }}>
                🥉
              </div>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#cd7f32', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Bronze Tier (#3)
              </span>
              <h3 style={{ margin: '4px 0 2px 0', fontSize: '1.05rem', fontWeight: 900, color: 'var(--text)' }}>
                {campusStandingsForPeriod[2]?.name || '1st Campus (Main-VSP)'}
              </h3>
              <p style={{ margin: 0, fontSize: '0.76rem', color: 'var(--muted)' }}>
                📍 {campusStandingsForPeriod[2]?.location || 'Visakhapatnam'}
              </p>
              <div style={{
                marginTop: '12px', padding: '8px', borderRadius: '8px',
                background: 'var(--surface-alt)', fontSize: '0.88rem', fontWeight: 900,
                color: '#cd7f32', fontFamily: 'var(--font-mono)',
              }}>
                {leagueMetricFilter === 'rpl' ? `₹${(((campusStandingsForPeriod[2]?.totalSales || 0)) / 100000).toFixed(2)}L Revenue` : leagueMetricFilter === 'wpl' ? `${campusStandingsForPeriod[2]?.intakeCount || 0} Walk-ins` : leagueMetricFilter === 'spl' ? `${campusStandingsForPeriod[2]?.completedCount || 0} Admissions` : `${campusStandingsForPeriod[2]?.leaguePoints || 620} LP`}
              </div>
            </div>
          </div>

          {/* Campus Standings Table Card */}
          <div style={{
            background: 'var(--card-bg)',
            border: '1.5px solid var(--border)',
            borderRadius: '18px',
            padding: '24px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
          }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 16px 0', color: 'var(--text)' }}>
              {timeframeSummaryLabel} Campus Target &amp; Leaderboard
            </h2>

            <div className="table-wrapper">
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '780px' }}>
                <thead>
                  <tr style={{ borderBottom: '1.5px solid var(--border)', background: 'var(--surface-alt, rgba(255,255,255,0.02))' }}>
                    <th style={{ padding: '12px 16px', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', textAlign: 'left' }}>Rank &amp; Campus</th>
                    <th style={{ padding: '12px 16px', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', textAlign: 'center' }}>League Division</th>
                    <th style={{ padding: '12px 16px', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', textAlign: 'center' }}>Intakes</th>
                    <th style={{ padding: '12px 16px', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', textAlign: 'center' }}>Target Conversion %</th>
                    <th style={{ padding: '12px 16px', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', textAlign: 'center' }}>Win Streak</th>
                    <th style={{ padding: '12px 16px', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', textAlign: 'right' }}>{leagueMetricFilter === 'rpl' ? '💰 Revenue (₹L)' : leagueMetricFilter === 'wpl' ? '🚶 Walk-ins' : leagueMetricFilter === 'spl' ? '🎓 Admissions' : '🌟 Score (XP)'}</th>
                  </tr>
                </thead>
                <tbody>
                  {campusStandingsForPeriod.filter((c) => {
                    if (regionFilter !== 'all' && c.location !== regionFilter) return false;
                    if (searchQuery.trim()) {
                      const q = searchQuery.toLowerCase();
                      return c.name.toLowerCase().includes(q) || c.location.toLowerCase().includes(q);
                    }
                    return true;
                  }).map((c) => (
                    <tr
                      key={c.id}
                      style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s ease' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-alt)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{
                            width: '26px', height: '26px', borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.75rem', fontWeight: 900,
                            background: c.rank === 1 ? '#f59e0b' : c.rank === 2 ? '#94a3b8' : c.rank === 3 ? '#cd7f32' : 'var(--surface-alt)',
                            color: c.rank <= 3 ? '#ffffff' : 'var(--muted)',
                          }}>
                            {c.rank}
                          </span>
                          <div>
                            <div style={{ fontWeight: 800, fontSize: '0.86rem', color: 'var(--text)' }}>
                              {c.name}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>
                              📍 {c.location} • MVP: {c.mvpCounselorName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <span style={{
                          padding: '3px 10px', borderRadius: '9999px',
                          background: 'rgba(99, 102, 241, 0.1)',
                          border: '1px solid rgba(99, 102, 241, 0.25)',
                          color: 'var(--primary)',
                          fontWeight: 800, fontSize: '0.74rem',
                        }}>
                          {c.tier}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '0.82rem', fontWeight: 800, color: 'var(--text)', textAlign: 'center' }}>
                        {c.completedCount} / {c.intakeCount}
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <span style={{
                          padding: '3px 8px', borderRadius: '6px',
                          background: c.conversionRate >= 70 ? 'rgba(16, 185, 129, 0.12)' : 'var(--surface-alt)',
                          color: c.conversionRate >= 70 ? '#10b981' : 'var(--text)',
                          fontWeight: 800, fontSize: '0.78rem',
                        }}>
                          {c.conversionRate}%
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'center', fontWeight: 800, fontSize: '0.82rem', color: '#f59e0b' }}>
                        🔥 {c.winStreak}
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 900, fontSize: '0.92rem', color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>
                        {c.leaguePoints} LP
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          TAB 5: COUNSELOR ROSTER
      ══════════════════════════════════════════════════════ */}
      {activeTab === 'counselors' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{
            background: 'var(--card-bg)',
            border: '1.5px solid var(--border)',
            borderRadius: '18px',
            padding: '24px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
          }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 16px 0', color: 'var(--text)' }}>
              {selectedMonth} Counselor Roster
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '16px' }}>
              {filteredCounselors.map((cg) => (
                <div
                  key={cg.id}
                  style={{
                    background: 'var(--surface-alt, rgba(255,255,255,0.02))',
                    border: '1.5px solid var(--border)',
                    borderRadius: '14px',
                    padding: '18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '38px', height: '38px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                        color: '#fff', fontWeight: 900, fontSize: '0.84rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {getInitials(cg.name)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text)' }}>
                          {cg.name}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>
                          {cg.branchName}
                        </div>
                      </div>
                    </div>
                    <span style={{
                      fontSize: '0.66rem', fontWeight: 900, padding: '2px 7px', borderRadius: '4px',
                      background: cg.tierColor, color: '#fff', textTransform: 'uppercase',
                    }}>
                      Lvl {cg.level} • {cg.tierName}
                    </span>
                  </div>

                  {/* XP Progress */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontWeight: 700, marginBottom: '4px' }}>
                      <span style={{ color: 'var(--muted)' }}>Progress to Lvl {cg.level + 1}</span>
                      <span style={{ color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>{leagueMetricFilter === 'rpl' ? `₹${(((cg.totalSales || 0)) / 100000).toFixed(2)}L` : leagueMetricFilter === 'wpl' ? `${cg.walkinCount || 0}` : leagueMetricFilter === 'spl' ? `${cg.completedCount || 0}` : `${cg.xp} XP`}</span>
                    </div>
                    <div style={{ height: '6px', borderRadius: '9999px', background: 'var(--surface)', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${Math.round(((400 - cg.xpToNextLevel) / 400) * 100)}%`,
                        background: 'linear-gradient(90deg, #6366f1, #a855f7)',
                        borderRadius: '9999px',
                      }} />
                    </div>
                  </div>

                  {/* Stats */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', textAlign: 'center', background: 'var(--surface)', padding: '8px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 900, color: '#f59e0b' }}>🔥 {cg.streakDays}d</div>
                      <div style={{ fontSize: '0.62rem', color: 'var(--muted)', fontWeight: 800, textTransform: 'uppercase' }}>Streak</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 900, color: '#10b981' }}>{cg.conversionRate}%</div>
                      <div style={{ fontSize: '0.62rem', color: 'var(--muted)', fontWeight: 800, textTransform: 'uppercase' }}>Conversion</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 900, color: 'var(--primary)' }}>{cg.badges.filter(b => b.isUnlocked).length}</div>
                      <div style={{ fontSize: '0.62rem', color: 'var(--muted)', fontWeight: 800, textTransform: 'uppercase' }}>Badges</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          TAB 6: DAILY QUESTS
      ══════════════════════════════════════════════════════ */}
      {activeTab === 'quests' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{
            background: 'var(--card-bg)',
            border: '1.5px solid var(--border)',
            borderRadius: '18px',
            padding: '24px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
          }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 4px 0', color: 'var(--text)' }}>
              {selectedMonth} Daily Quests &amp; Target Bonus XP
            </h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--muted)', margin: '0 0 20px 0' }}>
              Complete high-priority counseling actions to level up faster and hit your monthly branch targets.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {currentUserGamification.quests.map((q) => {
                const isClaimed = claimedQuests[q.id];
                return (
                  <div
                    key={q.id}
                    style={{
                      background: isClaimed ? 'rgba(16, 185, 129, 0.06)' : 'var(--surface-alt)',
                      border: `1.5px solid ${isClaimed ? 'rgba(16, 185, 129, 0.3)' : 'var(--border)'}`,
                      borderRadius: '12px',
                      padding: '14px 18px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '34px', height: '34px', borderRadius: '8px',
                        background: isClaimed ? '#10b981' : 'var(--surface)',
                        color: isClaimed ? '#fff' : 'var(--muted)',
                        fontSize: '1rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {isClaimed ? '✓' : '🎯'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text)' }}>
                          {q.title}
                        </div>
                        <div style={{ fontSize: '0.76rem', color: 'var(--muted)', marginTop: '1px' }}>
                          {q.description}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.84rem', fontWeight: 900, color: 'var(--text)' }}>
                          {q.current} / {q.target}
                        </div>
                        <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#f59e0b' }}>
                          +{q.rewardXp} XP
                        </div>
                      </div>
                      
                      {q.isCompleted && !isClaimed ? (
                        <button
                          type="button"
                          onClick={() => handleClaimQuest(q.id)}
                          style={{
                            padding: '6px 14px',
                            borderRadius: '8px',
                            fontSize: '0.76rem',
                            fontWeight: 900,
                            background: 'linear-gradient(135deg, #10b981, #059669)',
                            color: '#fff',
                            border: 'none',
                            cursor: 'pointer',
                            boxShadow: '0 2px 10px rgba(16, 185, 129, 0.35)',
                          }}
                        >
                          Claim XP 🎁
                        </button>
                      ) : (
                        <span style={{
                          padding: '4px 10px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 800,
                          background: isClaimed ? '#10b981' : 'var(--surface)',
                          color: isClaimed ? '#fff' : 'var(--muted)',
                          border: '1px solid var(--border)',
                        }}>
                          {isClaimed ? 'Claimed 🎉' : 'In Progress'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

            {/* ══════════════════════════════════════════════════════
          SEASON CHAMPIONSHIP & TROPHIES LEADERBOARD MODAL
      ══════════════════════════════════════════════════════ */}
      {selectedSeasonModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 12500, padding: '20px'
        }}>
          <div style={{
            background: 'var(--card-bg, #111827)', border: '1.5px solid var(--border)',
            borderRadius: '24px', width: '100%', maxWidth: '940px', maxHeight: '88vh',
            display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 80px rgba(0,0,0,0.8)'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '20px 28px', borderBottom: '1px solid var(--border)', background: 'var(--surface-alt)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <ChampionshipTrophy3D type="winner_gold" size={60} />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.68rem', fontWeight: 900, textTransform: 'uppercase', padding: '2px 8px', borderRadius: '4px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#fff' }}>
                      OFFICIAL SEASON {selectedSeasonModal.seasonNumber} TROPHY
                    </span>
                  </div>
                  <h3 style={{ margin: '4px 0 2px 0', fontSize: '1.3rem', fontWeight: 900, color: 'var(--text)' }}>
                    {selectedSeasonModal.seasonName} Championship &amp; Medals
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 600 }}>
                    Total Season Revenue Collected: ₹{(selectedSeasonModal.totalMonthSales / 100000).toFixed(2)} Lakhs across {selectedSeasonModal.mLeads.length} admissions.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedSeasonModal(null)}
                style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', fontSize: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body: Trophies, Winning Team Medals & Leaderboard Table */}
            <div style={{ overflowY: 'auto', flex: 1, padding: '22px 28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Podium Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 320px))', gap: '16px' }}>
                {/* Winner Campus Plaque */}
                {selectedSeasonModal.winnerBranch && (
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.14) 0%, rgba(180, 83, 9, 0.06) 100%)',
                    border: '1.5px solid rgba(245, 158, 11, 0.5)', borderRadius: '16px', padding: '16px',
                    display: 'flex', alignItems: 'center', gap: '14px'
                  }}>
                    <ChampionshipTrophy3D type="winner_gold" size={54} />
                    <div>
                      <span style={{ fontSize: '0.64rem', fontWeight: 900, textTransform: 'uppercase', color: '#f59e0b' }}>
                        🏆 WINNER CAMPUS (1ST PLACE)
                      </span>
                      <h4 style={{ margin: '2px 0 0 0', fontSize: '1rem', fontWeight: 900, color: 'var(--text)' }}>
                        {selectedSeasonModal.winnerBranch.name}
                      </h4>
                      <span style={{ fontSize: '0.8rem', fontWeight: 900, color: '#10b981' }}>
                        ₹{(selectedSeasonModal.winnerBranch.sales / 100000).toFixed(2)}L Collected
                      </span>
                    </div>
                  </div>
                )}

                {/* Runner-Up Campus Plaque */}
                {selectedSeasonModal.runnerBranch && (
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(148, 163, 184, 0.12) 0%, rgba(71, 85, 105, 0.05) 100%)',
                    border: '1.5px solid rgba(148, 163, 184, 0.4)', borderRadius: '16px', padding: '16px',
                    display: 'flex', alignItems: 'center', gap: '14px'
                  }}>
                    <ChampionshipTrophy3D type="runner_silver" size={50} />
                    <div>
                      <span style={{ fontSize: '0.64rem', fontWeight: 900, textTransform: 'uppercase', color: '#94a3b8' }}>
                        🥈 RUNNER-UP (2ND PLACE)
                      </span>
                      <h4 style={{ margin: '2px 0 0 0', fontSize: '0.98rem', fontWeight: 900, color: 'var(--text)' }}>
                        {selectedSeasonModal.runnerBranch.name}
                      </h4>
                      <span style={{ fontSize: '0.8rem', fontWeight: 900, color: '#10b981' }}>
                        ₹{(selectedSeasonModal.runnerBranch.sales / 100000).toFixed(2)}L Collected
                      </span>
                    </div>
                  </div>
                )}

                {/* MVP Closer Plaque */}
                {selectedSeasonModal.championCoun && (
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(139, 92, 246, 0.06) 100%)',
                    border: '1.5px solid rgba(99, 102, 241, 0.4)', borderRadius: '16px', padding: '16px',
                    display: 'flex', alignItems: 'center', gap: '14px'
                  }}>
                    <ChampionshipTrophy3D type="counselor_mvp" size={50} />
                    <div>
                      <span style={{ fontSize: '0.64rem', fontWeight: 900, textTransform: 'uppercase', color: 'var(--primary)' }}>
                        👑 MVP CLOSER OF THE SEASON
                      </span>
                      <h4 style={{ margin: '2px 0 0 0', fontSize: '0.98rem', fontWeight: 900, color: 'var(--text)' }}>
                        {selectedSeasonModal.championCoun.name}
                      </h4>
                      <span style={{ fontSize: '0.8rem', fontWeight: 900, color: '#10b981' }}>
                        ₹{(selectedSeasonModal.championCoun.sales / 100000).toFixed(2)}L • {selectedSeasonModal.championCoun.count} Enrolled
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Winning Team Gold Medals Awarded Roster */}
              {selectedSeasonModal.winnerBranch && (
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '16px 20px' }}>
                  <span style={{ fontSize: '0.74rem', fontWeight: 900, textTransform: 'uppercase', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>🥇 Winning Team Gold Season Medals Awarded To:</span>
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
                    {selectedSeasonModal.winnerBranch.team.map((cName) => (
                      <span
                        key={cName}
                        style={{
                          fontSize: '0.78rem', fontWeight: 900, padding: '4px 12px', borderRadius: '8px',
                          background: 'rgba(245, 158, 11, 0.18)', color: 'var(--text)', border: '1px solid rgba(245, 158, 11, 0.45)',
                          display: 'inline-flex', alignItems: 'center', gap: '4px'
                        }}
                      >
                        <span>🥇</span>
                        <span>{cName}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Full Official Season Leaderboard Table */}
              <div style={{ background: 'var(--surface-alt)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
                <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 900, color: 'var(--text)' }}>
                    🏆 Official Leaderboard for {selectedSeasonModal.seasonName}
                  </h4>
                  <span style={{ fontSize: '0.74rem', color: 'var(--muted)', fontWeight: 700 }}>
                    Ranked by Monthly Sales Collected
                  </span>
                </div>

                <div className="table-wrapper">
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                    <thead>
                      <tr style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
                        <th style={{ textAlign: 'left', padding: '12px 16px' }}>Rank &amp; Counsellor</th>
                        <th style={{ textAlign: 'left', padding: '12px 16px' }}>Campus Branch</th>
                        <th style={{ textAlign: 'center', padding: '12px 16px' }}>Total Sales</th>
                        <th style={{ textAlign: 'center', padding: '12px 16px' }}>Enrollments</th>
                        <th style={{ textAlign: 'center', padding: '12px 16px' }}>Season Medal</th>
                        <th style={{ textAlign: 'right', padding: '12px 16px' }}>Admissions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedSeasonModal.allCounselors.length > 0 ? (
                        selectedSeasonModal.allCounselors.map((c, idx) => {
                          const isWinnerTeam = selectedSeasonModal.winnerBranch?.team.includes(c.name);
                          const isRunnerTeam = selectedSeasonModal.runnerBranch?.team.includes(c.name);

                          return (
                            <tr key={c.name} style={{ borderBottom: '1px solid var(--border)' }}>
                              <td style={{ padding: '12px 16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <span style={{
                                    width: '26px', height: '26px', borderRadius: '8px',
                                    background: idx === 0 ? 'linear-gradient(135deg, #f59e0b, #d97706)' : idx === 1 ? 'linear-gradient(135deg, #94a3b8, #64748b)' : idx === 2 ? 'linear-gradient(135deg, #b45309, #78350f)' : 'var(--surface)',
                                    color: idx < 3 ? '#fff' : 'var(--muted)',
                                    fontSize: '0.74rem', fontWeight: 900,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  }}>
                                    {idx + 1}
                                  </span>
                                  <strong style={{ fontSize: '0.88rem', color: 'var(--text)' }}>
                                    {c.name}
                                  </strong>
                                </div>
                              </td>
                              <td style={{ padding: '12px 16px', color: 'var(--muted)', fontWeight: 600 }}>
                                📍 {c.branch}
                              </td>
                              <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 900, color: '#10b981' }}>
                                ₹{(c.sales / 100000).toFixed(2)}L
                              </td>
                              <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 800 }}>
                                {c.count} Students
                              </td>
                              <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                {isWinnerTeam ? (
                                  <span style={{ fontSize: '0.72rem', fontWeight: 900, padding: '3px 8px', borderRadius: '6px', background: 'rgba(245, 158, 11, 0.18)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.4)' }}>
                                    🥇 Gold Medal
                                  </span>
                                ) : isRunnerTeam ? (
                                  <span style={{ fontSize: '0.72rem', fontWeight: 900, padding: '3px 8px', borderRadius: '6px', background: 'rgba(148, 163, 184, 0.15)', color: '#94a3b8', border: '1px solid rgba(148, 163, 184, 0.35)' }}>
                                    🥈 Silver Medal
                                  </span>
                                ) : (
                                  <span style={{ fontSize: '0.72rem', color: 'var(--muted)', fontWeight: 700 }}>
                                    Participant
                                  </span>
                                )}
                              </td>
                              <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const cleanName = c.name.toLowerCase().replace(/[_-]/g, ' ').trim();
                                    const matched = selectedSeasonModal.mLeads.filter((l: any) => {
                                      const cLead = (l.counselorName || l.metadata?.['Counsellor'] || '').toLowerCase().replace(/[_-]/g, ' ').trim();
                                      return cLead === cleanName;
                                    });
                                    setDrilldownStudentModal({
                                      title: `${c.name}'s Admissions for ${selectedSeasonModal.seasonName}`,
                                      records: matched
                                    });
                                  }}
                                  style={{
                                    padding: '5px 12px', borderRadius: '8px', fontSize: '0.76rem', fontWeight: 800,
                                    background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)',
                                    cursor: 'pointer'
                                  }}
                                >
                                  View Admissions →
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={6} style={{ textAlign: 'center', padding: '28px', color: 'var(--muted)', fontSize: '0.84rem' }}>
                            No counsellor records available for this season.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div style={{ padding: '14px 28px', borderTop: '1px solid var(--border)', background: 'var(--surface-alt)', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setSelectedSeasonModal(null)}
                style={{ padding: '8px 22px', borderRadius: '10px', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: '0.84rem', fontWeight: 800, cursor: 'pointer' }}
              >
                Close Championship
              </button>
            </div>

          </div>
        </div>
      )}


      {/* ══════════════════════════════════════════════════════
          BADGE & TROPHY DEEP-DIVE POPUP & LEADERBOARD MODAL
      ══════════════════════════════════════════════════════ */}
      {selectedBadgeModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 12000, padding: '20px'
        }}>
          <div style={{
            background: 'var(--card-bg, #111827)', border: '1.5px solid var(--border)',
            borderRadius: '24px', width: '100%', maxWidth: '880px', maxHeight: '88vh',
            display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 80px rgba(0,0,0,0.7)'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '22px 28px', borderBottom: '1px solid var(--border)', background: 'var(--surface-alt)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <BadgeCrest tier={selectedBadgeModal.tier} size={64} isUnlocked={true} icon={selectedBadgeModal.icon} />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.68rem', fontWeight: 900, textTransform: 'uppercase', padding: '2px 8px', borderRadius: '4px', background: 'var(--primary)', color: '#fff' }}>
                      {selectedBadgeModal.tier} Tier
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                      {selectedBadgeModal.category} Track
                    </span>
                  </div>
                  <h3 style={{ margin: '4px 0 2px 0', fontSize: '1.25rem', fontWeight: 900, color: 'var(--text)' }}>
                    {selectedBadgeModal.name}
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 600 }}>
                    {selectedBadgeModal.description}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedBadgeModal(null)}
                style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', fontSize: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body & Badge Leaderboard */}
            <div style={{ overflowY: 'auto', flex: 1, padding: '22px 28px' }}>
              {(() => {
                // Find all counselors who unlocked this specific badge and calculate their qualifying metrics & times achieved
                const qualifiers = counselorGamifications
                  .filter((cg) => {
                    const badgeObj = cg.badges.find((cb) => cb.id === selectedBadgeModal.id);
                    return badgeObj?.isUnlocked;
                  })
                  .sort((a, b) => {
                    if (selectedBadgeModal.category === 'revenue') return b.totalSales - a.totalSales;
                    if (selectedBadgeModal.category === 'walkin') return b.walkinCount - a.walkinCount;
                    return b.completedCount - a.completedCount;
                  });

                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Qualification Stats Summary */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
                      <div style={{ background: 'var(--surface)', padding: '14px 18px', borderRadius: '14px', border: '1px solid var(--border)' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)' }}>Total Awarded</span>
                        <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text)', marginTop: '2px' }}>
                          {qualifiers.length} Counsellors
                        </div>
                      </div>

                      <div style={{ background: 'var(--surface)', padding: '14px 18px', borderRadius: '14px', border: '1px solid var(--border)' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)' }}>Highest Performer</span>
                        <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#10b981', marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {qualifiers[0]?.name || '—'}
                        </div>
                      </div>

                      <div style={{ background: 'var(--surface)', padding: '14px 18px', borderRadius: '14px', border: '1px solid var(--border)' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)' }}>Peak Metric</span>
                        <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--primary)', marginTop: '2px' }}>
                          {qualifiers[0] ? (
                            selectedBadgeModal.category === 'revenue' ? `₹${(qualifiers[0].totalSales / 100000).toFixed(1)}L` :
                            selectedBadgeModal.category === 'walkin' ? `${qualifiers[0].walkinCount} Walk-ins` :
                            `${qualifiers[0].completedCount} Enrolled`
                          ) : '—'}
                        </div>
                      </div>
                    </div>

                    {/* Dedicated Leaderboard Table for this Badge */}
                    <div style={{ background: 'var(--surface-alt)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
                      <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 900, color: 'var(--text)' }}>
                          🏆 Official Leaderboard for {selectedBadgeModal.name}
                        </h4>
                        <span style={{ fontSize: '0.74rem', color: 'var(--muted)', fontWeight: 700 }}>
                          Ranked by Qualifying Performance
                        </span>
                      </div>

                      <div className="table-wrapper">
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                          <thead>
                            <tr style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
                              <th style={{ textAlign: 'left', padding: '12px 16px' }}>Rank &amp; Counsellor</th>
                              <th style={{ textAlign: 'left', padding: '12px 16px' }}>Campus Branch</th>
                              <th style={{ textAlign: 'center', padding: '12px 16px' }}>Total Sales</th>
                              <th style={{ textAlign: 'center', padding: '12px 16px' }}>Enrollments</th>
                              <th style={{ textAlign: 'center', padding: '12px 16px' }}>Times Unlocked</th>
                              <th style={{ textAlign: 'right', padding: '12px 16px' }}>Inspect</th>
                            </tr>
                          </thead>
                          <tbody>
                            {qualifiers.length > 0 ? (
                              qualifiers.map((q, idx) => (
                                <tr key={q.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.12s ease' }}>
                                  <td style={{ padding: '12px 16px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                      <span style={{
                                        width: '26px', height: '26px', borderRadius: '8px',
                                        background: idx === 0 ? 'linear-gradient(135deg, #f59e0b, #d97706)' : idx === 1 ? 'linear-gradient(135deg, #94a3b8, #64748b)' : idx === 2 ? 'linear-gradient(135deg, #b45309, #78350f)' : 'var(--surface)',
                                        color: idx < 3 ? '#fff' : 'var(--muted)',
                                        fontSize: '0.74rem', fontWeight: 900,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                      }}>
                                        {idx + 1}
                                      </span>
                                      <div>
                                        <strong style={{ fontSize: '0.88rem', color: 'var(--text)', display: 'block' }}>
                                          {q.name}
                                        </strong>
                                        <span style={{ fontSize: '0.7rem', color: 'var(--muted)', fontWeight: 700 }}>
                                          Lvl {q.level} • {q.tierName}
                                        </span>
                                      </div>
                                    </div>
                                  </td>
                                  <td style={{ padding: '12px 16px', color: 'var(--muted)', fontWeight: 600 }}>
                                    📍 {q.branchName}
                                  </td>
                                  <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 900, color: '#10b981' }}>
                                    ₹{(q.totalSales / 100000).toFixed(2)}L
                                  </td>
                                  <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 800 }}>
                                    {q.completedCount} Students
                                  </td>
                                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                    <span style={{
                                      fontSize: '0.74rem', fontWeight: 900, padding: '3px 9px', borderRadius: '6px',
                                      background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)'
                                    }}>
                                      ✔ Achieved
                                    </span>
                                  </td>
                                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const cleanQName = q.name.toLowerCase().replace(/[_-]/g, ' ').trim();
                                        const matched = convertedLeads.filter((l: any) => {
                                          const c = (l.counselorName || l.metadata?.['Counsellor'] || '').toLowerCase().replace(/[_-]/g, ' ').trim();
                                          return c === cleanQName;
                                        });
                                        setDrilldownStudentModal({
                                          title: `${q.name}'s Records for ${selectedBadgeModal.name}`,
                                          records: matched
                                        });
                                      }}
                                      style={{
                                        padding: '5px 12px', borderRadius: '8px', fontSize: '0.76rem', fontWeight: 800,
                                        background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)',
                                        cursor: 'pointer'
                                      }}
                                    >
                                      View Admissions →
                                    </button>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--muted)', fontSize: '0.84rem' }}>
                                  No counsellors currently meet the criteria for this badge.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '14px 28px', borderTop: '1px solid var(--border)', background: 'var(--surface-alt)', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setSelectedBadgeModal(null)}
                style={{ padding: '8px 22px', borderRadius: '10px', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: '0.84rem', fontWeight: 800, cursor: 'pointer' }}
              >
                Close Leaderboard
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ── DRILLDOWN CANDIDATE RECORDS MODAL ── */}
      {drilldownStudentModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 13000, padding: '20px'
        }}>
          <div style={{
            background: 'var(--card-bg, #111827)', border: '1.5px solid var(--border)',
            borderRadius: '22px', width: '100%', maxWidth: '920px', maxHeight: '85vh',
            display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 70px rgba(0,0,0,0.6)'
          }}>
            <div style={{
              padding: '18px 24px', borderBottom: '1px solid var(--border)', background: 'var(--surface-alt)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: 'var(--text)' }}>
                  {drilldownStudentModal.title}
                </h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--muted)', fontWeight: 600 }}>
                  Showing {drilldownStudentModal.records.length} matching candidate admissions
                </span>
              </div>
              <button
                type="button"
                onClick={() => setDrilldownStudentModal(null)}
                style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', fontSize: '1.1rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ overflowY: 'auto', flex: 1, padding: '16px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                <thead>
                  <tr style={{ background: 'var(--surface-alt)', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ textAlign: 'left', padding: '10px 14px' }}>Student</th>
                    <th style={{ textAlign: 'left', padding: '10px 14px' }}>Course</th>
                    <th style={{ textAlign: 'left', padding: '10px 14px' }}>Date</th>
                    <th style={{ textAlign: 'left', padding: '10px 14px' }}>Amount Paid</th>
                    <th style={{ textAlign: 'right', padding: '10px 14px' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {drilldownStudentModal.records.slice(0, 100).map((r, idx) => (
                    <tr key={r.id || idx} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 700 }}>{r.studentName}</td>
                      <td style={{ padding: '10px 14px' }}>{r.course}</td>
                      <td style={{ padding: '10px 14px', color: 'var(--muted)' }}>
                        {r.enrollmentDate ? new Date(r.enrollmentDate).toLocaleDateString() : '—'}
                      </td>
                      <td style={{ padding: '10px 14px', color: '#10b981', fontWeight: 800 }}>
                        ₹{(Number(r.feePaid) || 0).toLocaleString()}
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                        <Link
                          href={`/converted-leads/${r.id}`}
                          style={{
                            textDecoration: 'none', display: 'inline-flex', padding: '4px 10px',
                            fontSize: '0.76rem', fontWeight: 800, borderRadius: '6px',
                            background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)'
                          }}
                        >
                          Full Record →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border)', background: 'var(--surface-alt)', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setDrilldownStudentModal(null)}
                style={{ padding: '8px 20px', borderRadius: '10px', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}
              >
                Close Records
              </button>
            </div>
          </div>
        </div>
      )}


      
      {/* ── ALL-TIME LEAGUE GRAND TROPHY MODAL (FULL WINNERS LIST & RANKINGS) ── */}
      {selectedAllTimeLeagueModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 12600, padding: '20px'
        }}>
          <div style={{
            background: 'var(--card-bg, #0f172a)', border: `1.5px solid ${selectedAllTimeLeagueModal.color}66`,
            borderRadius: '24px', width: '100%', maxWidth: '1020px', maxHeight: '88vh',
            display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: `0 25px 80px ${selectedAllTimeLeagueModal.color}22`
          }}>
            {/* Header */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              borderBottom: '1.5px solid var(--border)', padding: '20px 24px',
              background: `linear-gradient(135deg, ${selectedAllTimeLeagueModal.color}1a 0%, transparent 100%)`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <ChampionshipTrophy3D type={selectedAllTimeLeagueModal.trophyType} size={85} />
                <div>
                  <div style={{ fontSize: '0.74rem', fontWeight: 900, textTransform: 'uppercase', color: selectedAllTimeLeagueModal.color, letterSpacing: '0.06em' }}>
                    🏆 All-Time Championship Hall of Fame
                  </div>
                  <h3 style={{ margin: '2px 0 0 0', fontSize: '1.4rem', fontWeight: 900, color: 'var(--text)' }}>
                    {selectedAllTimeLeagueModal.title}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 900, color: selectedAllTimeLeagueModal.color, background: `${selectedAllTimeLeagueModal.color}1a`, padding: '3px 12px', borderRadius: '8px', border: `1px solid ${selectedAllTimeLeagueModal.color}44` }}>
                      👑 All-Time Champion: {selectedAllTimeLeagueModal.topCampus.name} ({selectedAllTimeLeagueModal.topCampus.wins} Wins)
                    </span>
                    <span style={{ fontSize: '0.76rem', color: 'var(--muted)', fontWeight: 700 }}>
                      {selectedAllTimeLeagueModal.allWinners.length} Total Seasons
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAllTimeLeagueModal(null)}
                style={{
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: '10px', width: '36px', height: '36px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--text)', fontSize: '1.2rem', cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
              
              {/* 1. All-Time Campus Leaderboard Podium */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 900, color: 'var(--text)' }}>
                  📊 All-Time Campus Dominance Leaderboard
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                  {selectedAllTimeLeagueModal.rankings.map((rk) => (
                    <div key={rk.name} style={{
                      background: 'var(--surface-alt)',
                      border: rk.rank === 1 ? `1.5px solid ${selectedAllTimeLeagueModal.color}` : '1px solid var(--border)',
                      borderRadius: '12px',
                      padding: '14px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      boxShadow: rk.rank === 1 ? `0 4px 16px ${selectedAllTimeLeagueModal.color}22` : 'none',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{
                          width: '26px', height: '26px', borderRadius: '7px',
                          background: rk.rank === 1 ? `linear-gradient(135deg, ${selectedAllTimeLeagueModal.color}, #d97706)` : 'var(--surface)',
                          color: rk.rank === 1 ? '#fff' : 'var(--muted)',
                          fontSize: '0.74rem', fontWeight: 900,
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                          #{rk.rank}
                        </span>
                        <div>
                          <strong style={{ fontSize: '0.9rem', color: 'var(--text)', display: 'block' }}>
                            {rk.name}
                          </strong>
                          <span style={{ fontSize: '0.72rem', color: 'var(--muted)', fontWeight: 600 }}>
                            {rk.totalMetric}
                          </span>
                        </div>
                      </div>
                      <span style={{
                        fontSize: '0.82rem', fontWeight: 900,
                        color: rk.rank === 1 ? selectedAllTimeLeagueModal.color : 'var(--text)',
                        background: 'var(--surface)', padding: '4px 10px', borderRadius: '6px', border: '1px solid var(--border)'
                      }}>
                        ⚡ {rk.wins} Wins
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. Chronological List of All-Time Winners */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 900, color: 'var(--text)' }}>
                    📜 Complete Chronological List of All-Time Winners
                  </h4>
                  <span style={{ fontSize: '0.74rem', color: 'var(--muted)', fontWeight: 700 }}>
                    {selectedAllTimeLeagueModal.allWinners.length} Official Championship Seasons
                  </span>
                </div>

                <div className="table-wrapper" style={{ background: 'var(--surface-alt)', borderRadius: '14px', border: '1px solid var(--border)', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                    <thead>
                      <tr style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
                        <th style={{ textAlign: 'left', padding: '12px 16px' }}>Season &amp; Year</th>
                        <th style={{ textAlign: 'left', padding: '12px 16px' }}>Champion Campus</th>
                        <th style={{ textAlign: 'left', padding: '12px 16px' }}>Performance Metric</th>
                        <th style={{ textAlign: 'left', padding: '12px 16px' }}>Winning Counselor Squad</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedAllTimeLeagueModal.allWinners.map((w, idx) => (
                        <tr key={`${w.year}-${w.seasonNumber}-${idx}`} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <span style={{
                                width: '26px', height: '26px', borderRadius: '7px',
                                background: w.year === 2026 ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'linear-gradient(135deg, #6366f1, #4f46e5)',
                                color: '#fff', fontSize: '0.72rem', fontWeight: 900,
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                              }}>
                                S{w.seasonNumber}
                              </span>
                              <div>
                                <strong style={{ fontSize: '0.88rem', color: 'var(--text)', display: 'block' }}>
                                  {w.monthName} {w.year}
                                </strong>
                                <span style={{ fontSize: '0.7rem', color: 'var(--muted)', fontWeight: 700 }}>
                                  Season {w.seasonNumber}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{
                              fontSize: '0.8rem', fontWeight: 900, padding: '4px 12px', borderRadius: '6px',
                              background: 'rgba(16, 185, 129, 0.14)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.35)'
                            }}>
                              🏆 {w.winnerLoc}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px', fontWeight: 800, color: 'var(--text)' }}>
                            {w.metricFormatted}
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                              {w.counselors.slice(0, 3).map((cName) => (
                                <span key={cName} style={{
                                  fontSize: '0.7rem', fontWeight: 700, padding: '2px 7px', borderRadius: '5px',
                                  background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)'
                                }}>
                                  👤 {cName}
                                </span>
                              ))}
                              {w.counselors.length > 3 && (
                                <span style={{ fontSize: '0.68rem', color: 'var(--muted)', fontWeight: 700, alignSelf: 'center' }}>
                                  +{w.counselors.length - 3}
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', background: 'var(--surface-alt)', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setSelectedAllTimeLeagueModal(null)}
                style={{ padding: '8px 24px', borderRadius: '10px', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: '0.84rem', fontWeight: 800, cursor: 'pointer' }}
              >
                Close Leaderboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── LOCATION CUP DRILLDOWN & LEADERBOARD MODAL ── */}
      {selectedLocationCupModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 12500, padding: '20px'
        }}>
          <div style={{
            background: 'var(--card-bg, #0f172a)', border: '1.5px solid rgba(245, 158, 11, 0.4)',
            borderRadius: '24px', width: '100%', maxWidth: '980px', maxHeight: '88vh',
            display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 80px rgba(0,0,0,0.6)'
          }}>
            {/* Header */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              borderBottom: '1.5px solid var(--border)', padding: '20px 24px',
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, transparent 100%)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <ChampionshipTrophy3D type={selectedLocationCupModal.trophyType} size={85} />
                <div>
                  <div style={{ fontSize: '0.74rem', fontWeight: 900, textTransform: 'uppercase', color: '#f59e0b', letterSpacing: '0.06em' }}>
                    🏆 Official Championship Pedigree &amp; Leaderboards
                  </div>
                  <h3 style={{ margin: '2px 0 0 0', fontSize: '1.4rem', fontWeight: 900, color: 'var(--text)' }}>
                    {selectedLocationCupModal.location} • {selectedLocationCupModal.leagueTitle}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 900, color: '#f59e0b', background: 'rgba(245, 158, 11, 0.15)', padding: '3px 12px', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                      ⚡ {selectedLocationCupModal.winCount}x Total Champion
                    </span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--muted)', fontWeight: 700 }}>
                      Grouped by Winning Periods
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLocationCupModal(null)}
                style={{
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: '10px', width: '36px', height: '36px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--text)', fontSize: '1.2rem', cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body: Winning Periods Table & Leaderboards */}
            <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Group by Year */}
              {[2026, 2025].map((yr) => {
                const yrSeasons = selectedLocationCupModal.winningSeasons.filter(s => (s as any).year === yr || (!(s as any).year && yr === 2026));
                if (yrSeasons.length === 0) return null;

                return (
                  <div key={yr} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1.5px solid var(--border)', paddingBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '1.1rem' }}>📅</span>
                        <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: 'var(--text)' }}>
                          {yr} Championship Era ({yrSeasons.length} Titles Won)
                        </h4>
                      </div>
                      <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)', padding: '2px 10px', borderRadius: '6px' }}>
                        {yrSeasons.length} Victorious Seasons
                      </span>
                    </div>

                    <div className="table-wrapper" style={{ background: 'var(--surface-alt)', borderRadius: '14px', border: '1px solid var(--border)', overflow: 'hidden' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                        <thead>
                          <tr style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
                            <th style={{ textAlign: 'left', padding: '12px 16px' }}>Winning Season</th>
                            <th style={{ textAlign: 'left', padding: '12px 16px' }}>Performance Metric</th>
                            <th style={{ textAlign: 'left', padding: '12px 16px' }}>Winning Counselor Squad</th>
                            <th style={{ textAlign: 'center', padding: '12px 16px' }}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {yrSeasons.map((s) => (
                            <tr key={`${yr}-${s.seasonNumber}`} style={{ borderBottom: '1px solid var(--border)' }}>
                              <td style={{ padding: '14px 16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <span style={{
                                    width: '28px', height: '28px', borderRadius: '8px',
                                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                                    color: '#fff', fontSize: '0.78rem', fontWeight: 900,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                  }}>
                                    S{s.seasonNumber}
                                  </span>
                                  <div>
                                    <strong style={{ fontSize: '0.9rem', color: 'var(--text)', display: 'block' }}>
                                      {s.monthName} {yr}
                                    </strong>
                                    <span style={{ fontSize: '0.72rem', color: 'var(--muted)', fontWeight: 700 }}>
                                      Official Season {s.seasonNumber} Champion
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td style={{ padding: '14px 16px' }}>
                                <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#10b981' }}>
                                  {s.metricValue}
                                </div>
                                <span style={{ fontSize: '0.72rem', color: 'var(--muted)', fontWeight: 600 }}>
                                  {s.metricLabel}
                                </span>
                              </td>
                              <td style={{ padding: '14px 16px' }}>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                  {s.counselors.slice(0, 4).map((cName) => (
                                    <span key={cName} style={{
                                      fontSize: '0.72rem', fontWeight: 800, padding: '3px 8px', borderRadius: '6px',
                                      background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)'
                                    }}>
                                      👤 {cName}
                                    </span>
                                  ))}
                                  {s.counselors.length > 4 && (
                                    <span style={{ fontSize: '0.7rem', color: 'var(--muted)', fontWeight: 700, alignSelf: 'center' }}>
                                      +{s.counselors.length - 4} more
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                                <span style={{
                                  fontSize: '0.74rem', fontWeight: 900, padding: '4px 10px', borderRadius: '6px',
                                  background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.35)'
                                }}>
                                  🏆 Champion
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}

            </div>

            {/* Footer */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', background: 'var(--surface-alt)', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setSelectedLocationCupModal(null)}
                style={{ padding: '8px 24px', borderRadius: '10px', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: '0.84rem', fontWeight: 800, cursor: 'pointer' }}
              >
                Close Pedigree
              </button>
            </div>
          </div>
        </div>
      )}

          {/* ─── Set / Edit Targets Modal ─── */}
      {isEditTargetModalOpen && editingTargetEntity && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999999,
          padding: '20px',
        }}>
          <div style={{
            background: 'var(--card-bg)',
            border: '1.5px solid var(--border)',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '520px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'fadeIn 0.2s ease-out',
          }}>
            {/* Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1.5px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: 'var(--text)' }}>
                  ⚙️ Set Custom Target &amp; Incentives
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.78rem', color: 'var(--muted)', fontWeight: 600 }}>
                  Adjust quotas and cash bonus tiers for {editingTargetEntity.name}.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditTargetModalOpen(false)}
                style={{ background: 'transparent', border: 'none', fontSize: '1.2rem', color: 'var(--muted)', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {/* Form Fields */}
            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: 'var(--text)', marginBottom: '6px' }}>
                  Target Entity
                </label>
                <select
                  value={editingTargetEntity.name}
                  onChange={(e) => setEditingTargetEntity(prev => prev ? ({ ...prev, name: e.target.value }) : null)}
                  style={{
                    width: '100%', padding: '9px 12px', borderRadius: '8px',
                    border: '1.5px solid var(--border)', background: 'var(--surface)',
                    color: 'var(--text)', fontSize: '0.84rem', fontWeight: 700, outline: 'none',
                  }}
                >
                  {(targetScope === 'counselor' ? counselorGamifications.map(c => c.name) : campusStandings.map(c => c.name)).map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: 'var(--text)', marginBottom: '6px' }}>
                    💰 Revenue Target (₹)
                  </label>
                  <input
                    type="number"
                    defaultValue={customTargetsOverride[editingTargetEntity.name]?.revenue || (targetScope === 'counselor' ? 500000 : 2500000)}
                    id="target-input-revenue"
                    style={{
                      width: '100%', padding: '9px 12px', borderRadius: '8px',
                      border: '1.5px solid var(--border)', background: 'var(--surface)',
                      color: 'var(--text)', fontSize: '0.84rem', fontWeight: 700, outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: 'var(--text)', marginBottom: '6px' }}>
                    🎓 Admissions Target
                  </label>
                  <input
                    type="number"
                    defaultValue={customTargetsOverride[editingTargetEntity.name]?.admissions || (targetScope === 'counselor' ? 20 : 100)}
                    id="target-input-admissions"
                    style={{
                      width: '100%', padding: '9px 12px', borderRadius: '8px',
                      border: '1.5px solid var(--border)', background: 'var(--surface)',
                      color: 'var(--text)', fontSize: '0.84rem', fontWeight: 700, outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: 'var(--text)', marginBottom: '6px' }}>
                    🚶 Walk-ins Target
                  </label>
                  <input
                    type="number"
                    defaultValue={customTargetsOverride[editingTargetEntity.name]?.walkins || (targetScope === 'counselor' ? 50 : 250)}
                    id="target-input-walkins"
                    style={{
                      width: '100%', padding: '9px 12px', borderRadius: '8px',
                      border: '1.5px solid var(--border)', background: 'var(--surface)',
                      color: 'var(--text)', fontSize: '0.84rem', fontWeight: 700, outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: 'var(--text)', marginBottom: '6px' }}>
                    💵 Base 100% Incentive (₹)
                  </label>
                  <input
                    type="number"
                    defaultValue={customTargetsOverride[editingTargetEntity.name]?.baseIncentive || (targetScope === 'counselor' ? 5000 : 25000)}
                    id="target-input-base-inc"
                    style={{
                      width: '100%', padding: '9px 12px', borderRadius: '8px',
                      border: '1.5px solid var(--border)', background: 'var(--surface)',
                      color: 'var(--text)', fontSize: '0.84rem', fontWeight: 700, outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', background: 'var(--surface-alt)', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setIsEditTargetModalOpen(false)}
                style={{ padding: '8px 18px', borderRadius: '8px', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text)', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const rev = Number((document.getElementById('target-input-revenue') as HTMLInputElement)?.value) || 500000;
                  const adm = Number((document.getElementById('target-input-admissions') as HTMLInputElement)?.value) || 20;
                  const walk = Number((document.getElementById('target-input-walkins') as HTMLInputElement)?.value) || 50;
                  const baseInc = Number((document.getElementById('target-input-base-inc') as HTMLInputElement)?.value) || 5000;

                  setCustomTargetsOverride(prev => ({
                    ...prev,
                    [editingTargetEntity.name]: {
                      revenue: rev,
                      admissions: adm,
                      walkins: walk,
                      baseIncentive: baseInc,
                      stretchBonus: Math.round(baseInc * 0.6),
                    },
                  }));
                  setIsEditTargetModalOpen(false);
                }}
                style={{ padding: '8px 22px', borderRadius: '8px', background: 'var(--primary)', border: 'none', color: '#ffffff', fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)' }}
              >
                Save Quotas &amp; Incentives
              </button>
            </div>
          </div>
        </div>
      )}

    </section>
  );
}
