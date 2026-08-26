'use client';

import React, { useState } from 'react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
  ariaLabel?: string;
  width?: string | number;
  className?: string;
  style?: React.CSSProperties;
}

export default function SearchInput({
  value,
  onChange,
  placeholder = 'Search...',
  id,
  ariaLabel = 'Search input',
  width = '100%',
  className = '',
  style,
}: SearchInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div
      className={`portal-search-bar ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        background: isFocused ? 'var(--surface)' : 'var(--surface-alt, rgba(255, 255, 255, 0.03))',
        border: `1.5px solid ${isFocused ? 'var(--primary)' : 'var(--border)'}`,
        borderRadius: '10px',
        padding: '0 14px',
        height: '40px',
        minHeight: '40px',
        width: typeof width === 'number' ? `${width}px` : width,
        boxShadow: isFocused
          ? '0 0 0 3px var(--primary-glow, rgba(99, 102, 241, 0.15))'
          : '0 1px 3px rgba(0, 0, 0, 0.03)',
        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        flexShrink: 0,
        boxSizing: 'border-box',
        ...style,
      }}
    >
      <svg
        aria-hidden="true"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth="2.2"
        width="15"
        height="15"
        style={{
          color: isFocused ? 'var(--primary)' : 'var(--muted)',
          transition: 'color 0.2s ease',
          flexShrink: 0,
        }}
      >
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.3-4.3" />
      </svg>
      <input
        id={id}
        type="text"
        autoComplete="off"
        spellCheck={false}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        aria-label={ariaLabel}
        style={{
          border: 'none',
          background: 'transparent',
          backgroundColor: 'transparent',
          boxShadow: 'none',
          borderRadius: 0,
          WebkitAppearance: 'none',
          appearance: 'none',
          width: '100%',
          fontSize: '0.86rem',
          fontWeight: 500,
          color: 'var(--text)',
          outline: 'none',
          padding: 0,
          margin: 0,
          fontFamily: 'inherit',
          lineHeight: '1.4',
        }}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          style={{
            background: 'var(--surface-alt)',
            border: '1px solid var(--border)',
            borderRadius: '50%',
            cursor: 'pointer',
            color: 'var(--muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '18px',
            height: '18px',
            fontSize: '0.65rem',
            padding: 0,
            flexShrink: 0,
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--text)';
            e.currentTarget.style.borderColor = 'var(--primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--muted)';
            e.currentTarget.style.borderColor = 'var(--border)';
          }}
        >
          ✕
        </button>
      )}
    </div>
  );
}
