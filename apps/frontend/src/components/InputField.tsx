import { InputHTMLAttributes } from 'react';

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export default function InputField({ label, id, ...props }: InputFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[0.85rem] font-semibold opacity-85">
        {label}
      </label>
      <input
        id={id}
        {...props}
        className="w-full px-3.5 py-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-md)] text-[var(--text)] text-[0.9rem] outline-none transition-[var(--transition)] focus:border-[var(--primary)]"
      />
    </div>
  );
}
