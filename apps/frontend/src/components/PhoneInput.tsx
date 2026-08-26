'use client';

import { useState } from 'react';
import { COUNTRY_CODES } from '../lib/constants';

interface PhoneInputProps {
  id?: string;
  value: string;           // full stored value e.g. "+919876543210"
  onChange: (full: string) => void;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  label?: string;
}

/** Parses "+919876543210" → { code: "+91", number: "9876543210" } */
function parsePhone(full: string): { code: string; number: string } {
  if (!full) return { code: '+91', number: '' };
  for (const cc of [...COUNTRY_CODES].sort((a, b) => b.code.length - a.code.length)) {
    if (full.startsWith(cc.code)) {
      return { code: cc.code, number: full.slice(cc.code.length) };
    }
  }
  return { code: '+91', number: full };
}

export default function PhoneInput({ id, value, onChange, required, disabled, placeholder, label }: PhoneInputProps) {
  const { code, number } = parsePhone(value);
  const [isFocused, setIsFocused] = useState(false);

  const handleCodeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value + number);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(code + e.target.value.replace(/[^0-9]/g, ''));
  };

  const currentCountry = COUNTRY_CODES.find(c => c.code === code) || COUNTRY_CODES[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: 0, width: '100%' }}>
      {label && (
        <label htmlFor={id} style={{
          fontSize: '0.72rem',
          color: 'var(--muted)',
          textTransform: 'uppercase',
          fontWeight: 800,
          letterSpacing: '0.05em',
          margin: '0 0 4px 0',
          display: 'block',
          lineHeight: '1.4',
        }}>
          {label}
        </label>
      )}

      {/* Unified Premium Input Container */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        background: 'var(--surface)',
        border: isFocused ? '1.5px solid var(--primary)' : '1.5px solid var(--border)',
        boxShadow: isFocused ? '0 0 0 3px var(--primary-glow)' : 'none',
        borderRadius: '8px',
        width: '100%',
        boxSizing: 'border-box',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease',
        overflow: 'hidden',
      }}>
        {/* Country Code Selector Wrapper */}
        <div style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          background: 'rgba(255, 255, 255, 0.025)',
          borderRight: '1.5px solid var(--border)',
          padding: '0 8px 0 10px',
          height: '38px',
          flexShrink: 0,
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}>
          {/* Custom Stylized Display */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            pointerEvents: 'none',
            fontSize: '0.86rem',
            fontWeight: 700,
            color: 'var(--text)',
            userSelect: 'none',
          }}>
            <span style={{ fontSize: '1rem', lineHeight: 1 }}>{currentCountry.flag}</span>
            <span style={{ letterSpacing: '0.02em' }}>{currentCountry.code}</span>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ width: 12, height: 12, color: 'var(--muted)', opacity: 0.8, marginLeft: 2 }}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>

          {/* Invisible Overlay Select to handle native selection cleanly */}
          <select
            value={code}
            onChange={handleCodeChange}
            disabled={disabled}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            style={{
              position: 'absolute',
              inset: 0,
              opacity: 0,
              width: '100%',
              height: '100%',
              cursor: disabled ? 'not-allowed' : 'pointer',
              zIndex: 1,
            }}
          >
            {COUNTRY_CODES.map(cc => (
              <option key={cc.code} value={cc.code} style={{ background: 'var(--card-bg, #111827)', color: '#fff' }}>
                {cc.flag} {cc.country} ({cc.code})
              </option>
            ))}
          </select>
        </div>

        {/* Numeric Input */}
        <input
          id={id}
          type="tel"
          inputMode="numeric"
          value={number}
          onChange={handleNumberChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          required={required}
          disabled={disabled}
          placeholder={placeholder || '9876543210'}
          style={{
            flex: 1,
            minWidth: 0,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--text)',
            padding: '10px 12px',
            fontSize: '0.88rem',
            fontWeight: 600,
            fontFamily: 'inherit',
            letterSpacing: '0.02em',
          }}
        />
      </div>
    </div>
  );
}