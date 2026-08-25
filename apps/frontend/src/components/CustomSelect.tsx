'use client';

import React from 'react';

export interface CustomSelectOption {
  value: string;
  label: string;
}

export interface CustomSelectProps {
  id?: string;
  name?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: (CustomSelectOption | string)[];
  placeholder?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
  className?: string;
  required?: boolean;
  'aria-label'?: string;
}

export default function CustomSelect({
  id,
  name,
  value,
  onChange,
  options = [],
  placeholder = '',
  disabled = false,
  style,
  className = '',
  required = false,
  'aria-label': ariaLabel,
}: CustomSelectProps) {
  const normalizedOptions: CustomSelectOption[] = options.map((opt) =>
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );

  return (
    <div
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        width: '100%',
      }}
      className={`custom-select-wrapper ${className}`}
    >
      <select
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        aria-label={ariaLabel}
        style={{
          width: '100%',
          minHeight: '38px',
          height: '38px',
          padding: '0 36px 0 13px',
          borderRadius: '8px',
          border: '1.5px solid var(--border)',
          background: 'var(--surface)',
          backgroundImage: 'none !important' as any,
          color: value ? 'var(--text)' : (placeholder ? 'var(--muted)' : 'var(--text)'),
          fontSize: '0.86rem',
          fontWeight: 600,
          fontFamily: 'inherit',
          cursor: disabled ? 'default' : 'pointer',
          outline: 'none',
          appearance: 'none',
          WebkitAppearance: 'none',
          MozAppearance: 'none',
          boxSizing: 'border-box',
          transition: 'border-color 0.2s, box-shadow 0.2s',
          opacity: disabled ? 0.85 : 1,
          ...style,
        }}
        onFocus={(e) => {
          e.target.style.borderColor = 'var(--primary)';
          e.target.style.boxShadow = '0 0 0 3px var(--primary-glow)';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = 'var(--border)';
          e.target.style.boxShadow = 'none';
        }}
      >
        {placeholder !== undefined && (
          <option value="" style={{ background: 'var(--surface, #1e293b)', color: 'var(--muted)' }}>
            {placeholder}
          </option>
        )}
        {normalizedOptions.map((opt) => (
          <option
            key={opt.value}
            value={opt.value}
            style={{ background: 'var(--surface, #1e293b)', color: 'var(--text, #f8fafc)', padding: '8px 12px' }}
          >
            {opt.label}
          </option>
        ))}
      </select>
      <div
        style={{
          position: 'absolute',
          right: '12px',
          top: '50%',
          transform: 'translateY(-50%)',
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'center',
          color: 'var(--muted)',
        }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ width: 14, height: 14 }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
    </div>
  );
}
