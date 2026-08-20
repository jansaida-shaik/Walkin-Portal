'use client';

import { useState, useActionState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '../../actions/authActions';

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setErrorMsg('');
    
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    const res = await login(null, formData);
    if (res && res.error) {
      setErrorMsg(res.error);
      setLoading(false);
    } else if (res && res.success) {
      router.push('/dashboard');
      // Trigger a soft-refresh of root layout so the sidebar shows user details
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 100);
    }
  };

  return (
    <div className="login-split">
      {/* Left Panel */}
      <div className="login-right">
        <div className="login-right-content">
          <img
            src="/Login Page logo.png"
            alt="Organization Logo"
            className="login-org-logo"
          />
          <h2>Walk-in Control Center</h2>
          <p>
            Centralized front desk and counselor management for branch walk-ins.
          </p>
        </div>
      </div>

      {/* Right Form */}
      <div className="login-left">
        <div className="login-left-inner">
          <div className="login-heading">
            <h1>Log in</h1>
            <p>Please login and access your personalized dashboard.</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-field">
              <label htmlFor="username">Username</label>
              <div className="input-wrapper">
                <svg className="input-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <svg className="input-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                      <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button type="submit" className="login-submit" disabled={loading} style={{ width: '100%' }}>
              {loading ? 'Signing in...' : 'Login'}
            </button>
          </form>

          {errorMsg && <div className="login-message" style={{ background: 'var(--danger-glow)', border: '1px solid var(--border)', color: 'var(--danger)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem', fontWeight: 600, marginTop: '16px' }}>{errorMsg}</div>}
        </div>
      </div>
    </div>
  );
}
