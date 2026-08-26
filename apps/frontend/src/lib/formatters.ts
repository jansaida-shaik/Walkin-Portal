/**
 * Standard Phone Number Formatter & Normalizer (E.164 Compact Standard)
 * Unified pattern: "+919705243061" (no spaces) across frontend and backend.
 */
export function formatPhoneNumber(phone: string | null | undefined): string {
  if (!phone || typeof phone !== 'string') return '—';
  
  const trimmed = phone.trim();
  if (!trimmed) return '—';

  // Extract all numeric digits
  const digits = trimmed.replace(/\D/g, '');
  if (!digits) return trimmed;

  // 10 digits (Standard Indian Mobile) -> +91XXXXXXXXXX
  if (digits.length === 10) {
    return `+91${digits}`;
  }

  // 11 digits with leading 0 (e.g. 09705243061) -> +91XXXXXXXXXX
  if (digits.length === 11 && digits.startsWith('0')) {
    return `+91${digits.slice(1)}`;
  }

  // 12 digits starting with 91 (e.g. 919705243061) -> +91XXXXXXXXXX
  if (digits.length === 12 && digits.startsWith('91')) {
    return `+91${digits.slice(2)}`;
  }

  // International / other lengths
  if (digits.length > 10) {
    return `+${digits}`;
  }

  return `+91${digits}`;
}

export function normalizePhoneForStorage(phone: string | null | undefined): string {
  return formatPhoneNumber(phone);
}
