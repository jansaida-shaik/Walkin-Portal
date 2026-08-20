import { InputHTMLAttributes } from 'react';

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export default function InputField({ label, id, ...props }: InputFieldProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label htmlFor={id} style={{ fontSize: '0.85rem', fontWeight: 600, opacity: 0.85 }}>
        {label}
      </label>
      <input
        id={id}
        {...props}
        style={{
          width: '100%',
          padding: '10px 14px',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--text)',
          fontSize: '0.9rem',
          outline: 'none',
          transition: 'var(--transition)'
        }}
      />
    </div>
  );
}
