'use client';

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

const inputStyle: React.CSSProperties = {
  background: 'var(--surface)',
  border: '1.5px solid var(--border)',
  borderRadius: '8px',
  color: 'var(--text)',
  padding: '10px 14px',
  fontSize: '0.86rem',
  fontWeight: 600,
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s, box-shadow 0.2s',
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  width: 'auto',
  minWidth: '90px',
  borderRight: 'none',
  borderTopRightRadius: 0,
  borderBottomRightRadius: 0,
  flexShrink: 0,
  cursor: 'pointer',
  paddingRight: '8px',
};

export default function PhoneInput({ id, value, onChange, required, disabled, placeholder, label }: PhoneInputProps) {
  const { code, number } = parsePhone(value);

  const handleCodeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value + number);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(code + e.target.value.replace(/[^0-9]/g, ''));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {label && (
        <label htmlFor={id} style={{
          fontSize: '0.72rem', color: 'var(--muted)', textTransform: 'uppercase',
          fontWeight: 800, letterSpacing: '0.05em', display: 'block',
        }}>
          {label}
        </label>
      )}
      <div style={{ display: 'flex', alignItems: 'stretch' }}>
        <select
          value={code}
          onChange={handleCodeChange}
          disabled={disabled}
          style={selectStyle}
          onFocus={e => {
            e.target.style.borderColor = 'var(--primary)';
            e.target.style.boxShadow = '0 0 0 3px var(--primary-glow)';
          }}
          onBlur={e => {
            e.target.style.borderColor = 'var(--border)';
            e.target.style.boxShadow = 'none';
          }}
        >
          {COUNTRY_CODES.map(cc => (
            <option key={cc.code} value={cc.code}>
              {cc.flag} {cc.code}
            </option>
          ))}
        </select>
        <input
          id={id}
          type="tel"
          inputMode="numeric"
          value={number}
          onChange={handleNumberChange}
          required={required}
          disabled={disabled}
          placeholder={placeholder || '9876543210'}
          style={{
            ...inputStyle,
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
            flex: 1,
            minWidth: 0,
          }}
          onFocus={e => {
            e.target.style.borderColor = 'var(--primary)';
            e.target.style.boxShadow = '0 0 0 3px var(--primary-glow)';
          }}
          onBlur={e => {
            e.target.style.borderColor = 'var(--border)';
            e.target.style.boxShadow = 'none';
          }}
        />
      </div>
    </div>
  );
}
