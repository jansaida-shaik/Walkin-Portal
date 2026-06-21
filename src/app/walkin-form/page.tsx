'use client';

import { useState } from 'react';
import { COURSES, COUNTRY_CODES, branches } from '../../lib/constants';
import { createWalkin } from '../../actions/walkinActions';

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '11px 14px',
  background: 'rgba(255,255,255,0.04)',
  border: '1.5px solid rgba(255,255,255,0.1)',
  borderRadius: '10px',
  color: '#fff',
  fontSize: '0.9rem',
  fontFamily: 'inherit',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s, box-shadow 0.2s',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.78rem',
  fontWeight: 700,
  color: 'rgba(255,255,255,0.6)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginBottom: '6px',
};

function focusIn(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
  e.target.style.borderColor = 'rgba(99,102,241,0.7)';
  e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15)';
}
function focusOut(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
  e.target.style.borderColor = 'rgba(255,255,255,0.1)';
  e.target.style.boxShadow = 'none';
}

export default function WalkinForm() {
  const [form, setForm] = useState({
    studentName: '',
    countryCode: '+91',
    phone: '',
    email: '',
    branchId: '',
    course: '',
    source: 'Walk-in Form',
    remarks: '',
  });

  const [message, setMessage] = useState<{ text: string; type: 'idle' | 'success' | 'error' | 'duplicate' }>({
    text: 'Fill in your details below to register your walk-in.',
    type: 'idle',
  });
  const [result, setResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent): Promise<void> {
    event.preventDefault();
    if (!form.studentName || !form.phone || !form.email || !form.branchId || !form.course) {
      setMessage({ text: 'Please fill in all required fields.', type: 'error' });
      return;
    }

    setLoading(true);
    setMessage({ text: 'Submitting your walk-in registration...', type: 'idle' });
    setResult(null);

    const fullPhone = form.countryCode + form.phone;

    const formData = new FormData();
    formData.append('studentName', form.studentName);
    formData.append('phone', fullPhone);
    formData.append('countryCode', form.countryCode);
    formData.append('email', form.email);
    formData.append('branchId', form.branchId);
    formData.append('course', form.course);
    formData.append('source', form.source);
    formData.append('remarks', form.remarks || 'Self registered via walk-in form.');

    const res = await createWalkin(null, formData);

    if (res && (res as any).error) {
      const isDuplicate = (res as any).duplicate;
      setMessage({
        text: (res as any).error,
        type: isDuplicate ? 'duplicate' : 'error',
      });
    } else if (res && (res as any).success) {
      setMessage({ text: 'Walk-in registered successfully!', type: 'success' });
      setResult(res);
      setForm({
        studentName: '', countryCode: '+91', phone: '', email: '',
        branchId: '', course: '', source: 'Walk-in Form', remarks: '',
      });
    }
    setLoading(false);
  }

  const msgColors = {
    idle:      { bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.55)' },
    success:   { bg: 'rgba(16,185,129,0.1)',   border: 'rgba(16,185,129,0.3)',   color: '#10b981' },
    error:     { bg: 'rgba(239,68,68,0.1)',    border: 'rgba(239,68,68,0.3)',    color: '#f87171' },
    duplicate: { bg: 'rgba(245,158,11,0.1)',   border: 'rgba(245,158,11,0.3)',   color: '#f59e0b' },
  };
  const mc = msgColors[message.type];

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      padding: '40px 20px',
      background: 'linear-gradient(135deg, #0a0b14 0%, #0f1023 50%, #0a0b14 100%)',
    }}>
      <section style={{
        maxWidth: '560px',
        width: '100%',
        padding: '36px 32px',
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: '20px',
        border: '1.5px solid rgba(255,255,255,0.07)',
        boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 56, height: 56, borderRadius: '16px', marginBottom: '16px',
            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
            boxShadow: '0 8px 24px rgba(99,102,241,0.35)',
            fontSize: '1.6rem',
          }}>🎓</div>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '1.7rem', fontWeight: 800, color: '#fff' }}>
            Walk-in Registration
          </h1>
          <p style={{ margin: 0, fontSize: '0.88rem', color: 'rgba(255,255,255,0.5)' }}>
            Register your visit and get assigned to a counsellor instantly.
          </p>
        </div>

        {/* QR Code */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
          padding: '16px', marginBottom: '24px',
          background: 'rgba(255,255,255,0.02)',
          borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
              (typeof window !== 'undefined' ? window.location.href : '') ||
              `${process.env.NEXT_PUBLIC_APP_URL || ''}/walkin-form`
            )}&bgcolor=ffffff&color=000000`}
            alt="Walkin form QR code"
            style={{ width: 120, height: 120, borderRadius: '8px' }}
          />
          <p style={{ margin: 0, fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)' }}>
            Scan to open on your phone
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

          {/* Name */}
          <div>
            <label style={labelStyle}>Full Name <span style={{ color: '#f87171' }}>*</span></label>
            <input
              type="text"
              value={form.studentName}
              onChange={e => setForm({ ...form, studentName: e.target.value })}
              required
              placeholder="e.g. Rahul Sharma"
              style={inputStyle}
              onFocus={focusIn}
              onBlur={focusOut}
            />
          </div>

          {/* Phone with country code */}
          <div>
            <label style={labelStyle}>Phone Number <span style={{ color: '#f87171' }}>*</span></label>
            <div style={{ display: 'flex', gap: 0 }}>
              <select
                value={form.countryCode}
                onChange={e => setForm({ ...form, countryCode: e.target.value })}
                style={{
                  ...inputStyle,
                  width: 'auto',
                  minWidth: '98px',
                  borderTopRightRadius: 0,
                  borderBottomRightRadius: 0,
                  borderRight: 'none',
                  paddingRight: '8px',
                  flexShrink: 0,
                  cursor: 'pointer',
                }}
                onFocus={focusIn}
                onBlur={focusOut}
              >
                {COUNTRY_CODES.map(cc => (
                  <option key={cc.code} value={cc.code} style={{ background: '#1a1b2e' }}>
                    {cc.flag} {cc.code}
                  </option>
                ))}
              </select>
              <input
                type="tel"
                inputMode="numeric"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value.replace(/[^0-9]/g, '') })}
                required
                placeholder="9876543210"
                style={{
                  ...inputStyle,
                  borderTopLeftRadius: 0,
                  borderBottomLeftRadius: 0,
                  flex: 1,
                }}
                onFocus={focusIn}
                onBlur={focusOut}
              />
            </div>
          </div>

          {/* Email — required */}
          <div>
            <label style={labelStyle}>Email Address <span style={{ color: '#f87171' }}>*</span></label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value.toLowerCase() })}
              required
              placeholder="name@example.com"
              style={inputStyle}
              onFocus={focusIn}
              onBlur={focusOut}
            />
          </div>

          {/* Branch */}
          <div>
            <label style={labelStyle}>Branch / Campus <span style={{ color: '#f87171' }}>*</span></label>
            <select
              value={form.branchId}
              onChange={e => setForm({ ...form, branchId: e.target.value })}
              required
              style={{ ...inputStyle, cursor: 'pointer' }}
              onFocus={focusIn}
              onBlur={focusOut}
            >
              <option value="" style={{ background: '#1a1b2e' }}>— Select Branch —</option>
              {branches.map(b => (
                <option key={b.id} value={b.id} style={{ background: '#1a1b2e' }}>{b.name}</option>
              ))}
            </select>
          </div>

          {/* Course */}
          <div>
            <label style={labelStyle}>Course Interested <span style={{ color: '#f87171' }}>*</span></label>
            <select
              value={COURSES.includes(form.course) ? form.course : (form.course ? 'Other' : '')}
              onChange={e => {
                if (e.target.value !== 'Other') setForm({ ...form, course: e.target.value });
                else setForm({ ...form, course: '' });
              }}
              required={!form.course}
              style={{ ...inputStyle, cursor: 'pointer' }}
              onFocus={focusIn}
              onBlur={focusOut}
            >
              <option value="" style={{ background: '#1a1b2e' }}>— Select Course —</option>
              {COURSES.map(c => (
                <option key={c} value={c} style={{ background: '#1a1b2e' }}>{c}</option>
              ))}
            </select>
            {form.course && !COURSES.slice(0, -1).includes(form.course) && (
              <input
                type="text"
                placeholder="Type your course..."
                value={form.course}
                onChange={e => setForm({ ...form, course: e.target.value })}
                required
                style={{ ...inputStyle, marginTop: '8px' }}
                onFocus={focusIn}
                onBlur={focusOut}
              />
            )}
          </div>

          {/* How did you hear about us */}
          <div>
            <label style={labelStyle}>How did you hear about us?</label>
            <select
              value={form.source}
              onChange={e => setForm({ ...form, source: e.target.value })}
              style={{ ...inputStyle, cursor: 'pointer' }}
              onFocus={focusIn}
              onBlur={focusOut}
            >
              <option value="Walk-in Form" style={{ background: '#1a1b2e' }}>Walk-in (Direct Visit)</option>
              <option value="Google" style={{ background: '#1a1b2e' }}>Google Search</option>
              <option value="Social Media" style={{ background: '#1a1b2e' }}>Social Media</option>
              <option value="Referral" style={{ background: '#1a1b2e' }}>Friend / Referral</option>
              <option value="Just Dial" style={{ background: '#1a1b2e' }}>Just Dial</option>
              <option value="Other" style={{ background: '#1a1b2e' }}>Other</option>
            </select>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              minHeight: '48px',
              marginTop: '4px',
              background: loading ? 'rgba(99,102,241,0.5)' : 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
              border: 'none',
              borderRadius: '12px',
              color: '#fff',
              fontSize: '0.95rem',
              fontWeight: 800,
              cursor: loading ? 'not-allowed' : 'pointer',
              letterSpacing: '0.03em',
              boxShadow: loading ? 'none' : '0 6px 20px rgba(99,102,241,0.4)',
              transition: 'background 0.2s, transform 0.15s, box-shadow 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
            onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 28px rgba(99,102,241,0.5)'; }}}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(99,102,241,0.4)'; }}
          >
            {loading ? (
              <>
                <span style={{ width: 16, height: 16, border: '2.5px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                Submitting...
              </>
            ) : 'Submit Walk-in Registration →'}
          </button>
        </form>

        {/* Status message */}
        <div style={{
          marginTop: '20px', padding: '14px 18px',
          borderRadius: '12px',
          background: mc.bg, border: `1.5px solid ${mc.border}`,
          color: mc.color,
          fontSize: '0.875rem', fontWeight: 600, textAlign: 'center',
          lineHeight: 1.5,
        }}>
          {message.type === 'duplicate' && '⚠️ '}
          {message.type === 'error' && '❌ '}
          {message.type === 'success' && '✅ '}
          {message.text}
        </div>

        {/* Success card */}
        {result && (
          <div style={{
            marginTop: '20px', padding: '24px',
            borderRadius: '14px',
            background: 'rgba(16,185,129,0.08)',
            border: '1.5px solid rgba(16,185,129,0.25)',
          }}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', color: '#10b981', textAlign: 'center', fontWeight: 800 }}>
              🎉 Registration Successful!
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem', color: 'rgba(255,255,255,0.85)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '8px' }}>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>Queue Token</span>
                <span style={{ fontSize: '1.3rem', fontWeight: 900, color: '#a5b4fc', fontFamily: 'monospace' }}>
                  A{result.token?.id}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>Assigned Counsellor</span>
                <span style={{ fontWeight: 700 }}>{result.walkin?.counselorName || 'Waitlist'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>Branch</span>
                <span style={{ fontWeight: 700 }}>{result.walkin?.branchName}</span>
              </div>
            </div>
            <p style={{ margin: '14px 0 0 0', fontSize: '0.8rem', color: 'rgba(255,255,255,0.35)', textAlign: 'center' }}>
              Please wait in the reception area. You'll be called shortly.
            </p>
          </div>
        )}
      </section>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        select option { background: #1a1b2e; }
      `}</style>
    </div>
  );
}
