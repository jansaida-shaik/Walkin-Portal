'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SessionUser } from '../../lib/auth';
import { updateUserProfile, changePassword } from '../../actions/authActions';

interface UserRecord {
  id: string;
  username: string;
  name: string;
  email: string;
  roleId: string;
  branchId: string;
  departmentId: string;
  status: string;
  createdAt: string;
}

interface ProfileClientProps {
  currentUser: SessionUser;
  userRecord: UserRecord;
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export default function ProfileClient({ currentUser, userRecord }: ProfileClientProps) {
  const router = useRouter();
  const [profileForm, setProfileForm] = useState({
    name: userRecord.name,
    email: userRecord.email,
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await updateUserProfile(profileForm);
    if (res.success) {
      showToast('Profile details updated successfully!');
      router.refresh();
    } else {
      showToast(res.error || 'Failed to update profile', 'error');
    }
    setLoading(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast('New passwords do not match.', 'error');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      showToast('Password must be at least 6 characters.', 'error');
      return;
    }

    setPwLoading(true);
    const res = await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
    if (res.success) {
      showToast('Password changed successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } else {
      showToast(res.error || 'Failed to change password.', 'error');
    }
    setPwLoading(false);
  };

  return (
    <section className="dash-page" style={{ maxWidth: '1080px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* ── Toast ── */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 28, right: 28, zIndex: 9999,
          padding: '12px 22px', borderRadius: '12px', fontSize: '0.88rem', fontWeight: 700,
          background: toast.type === 'success' ? 'rgba(16,185,129,0.18)' : 'rgba(239,68,68,0.18)',
          color: toast.type === 'success' ? '#10b981' : '#ef4444',
          border: `1.5px solid ${toast.type === 'success' ? 'rgba(16,185,129,0.4)' : 'rgba(239,68,68,0.4)'}`,
          backdropFilter: 'blur(16px)',
          boxShadow: '0 12px 36px rgba(0,0,0,0.35)',
          display: 'flex', alignItems: 'center', gap: '10px',
        }}>
          <span style={{ fontSize: '1.1rem' }}>{toast.type === 'success' ? '✓' : '⚠️'}</span>
          <span>{toast.msg}</span>
        </div>
      )}

      {/* ── Header Banner ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--surface)',
        border: '1.5px solid var(--border)',
        borderRadius: '16px',
        padding: '24px',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '16px',
            background: 'var(--primary-glow)', color: 'var(--primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.6rem', fontWeight: 900,
            border: '2px solid rgba(99,102,241,0.3)',
            boxShadow: '0 4px 16px var(--primary-glow)',
          }}>
            {getInitials(userRecord.name)}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text)', margin: 0 }}>
                {userRecord.name}
              </h1>
              <span style={{
                fontSize: '0.72rem',
                background: 'rgba(99, 102, 241, 0.12)',
                color: 'var(--primary)',
                padding: '2px 8px',
                borderRadius: '9999px',
                fontWeight: 800,
                border: '1px solid rgba(99, 102, 241, 0.25)',
              }}>
                {currentUser.role}
              </span>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.86rem', color: 'var(--muted)' }}>
              @{userRecord.username} • 📍 {currentUser.branchName || 'Main Campus'} • Joined {new Date(userRecord.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* ── Main 2-Column Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: '24px', alignItems: 'start' }}>
        
        {/* LEFT: Personal Details Form */}
        <div className="dash-table-card" style={{ padding: '24px' }}>
          <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text)', margin: '0 0 4px 0' }}>
              Personal Profile Details
            </h2>
            <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--muted)' }}>
              Update your display name and correspondence email address.
            </p>
          </div>

          <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '6px' }}>
                Full Name
              </label>
              <input
                type="text"
                value={profileForm.name}
                onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                required
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: '8px',
                  border: '1.5px solid var(--border)', background: 'var(--surface-alt)', color: 'var(--text)',
                  fontSize: '0.88rem', fontWeight: 600, outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '6px' }}>
                Username (Immutable ID)
              </label>
              <input
                type="text"
                readOnly
                value={userRecord.username}
                disabled
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: '8px',
                  border: '1.5px solid var(--border)', background: 'var(--surface)', color: 'var(--muted)',
                  fontSize: '0.88rem', fontWeight: 600, outline: 'none', cursor: 'not-allowed',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '6px' }}>
                Email Address
              </label>
              <input
                type="email"
                value={profileForm.email}
                onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                placeholder="name@codegnan.com"
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: '8px',
                  border: '1.5px solid var(--border)', background: 'var(--surface-alt)', color: 'var(--text)',
                  fontSize: '0.88rem', fontWeight: 600, outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button
                type="submit"
                className="primary-btn"
                disabled={loading}
                style={{ height: '38px', minHeight: '38px', fontSize: '0.84rem', padding: '0 20px', borderRadius: '8px' }}
              >
                {loading ? 'Saving…' : 'Save Profile Details'}
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT: Security & Password Change */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Change Password Card */}
          <div className="dash-table-card" style={{ padding: '24px' }}>
            <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '14px', marginBottom: '18px' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text)', margin: '0 0 4px 0' }}>
                Change Password
              </h2>
              <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--muted)' }}>
                Keep your account secure with a strong password.
              </p>
            </div>

            <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '6px' }}>
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  required
                  placeholder="••••••••"
                  style={{
                    width: '100%', padding: '9px 12px', borderRadius: '8px',
                    border: '1.5px solid var(--border)', background: 'var(--surface-alt)', color: 'var(--text)',
                    fontSize: '0.88rem', outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '6px' }}>
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  required
                  placeholder="Minimum 6 characters"
                  style={{
                    width: '100%', padding: '9px 12px', borderRadius: '8px',
                    border: '1.5px solid var(--border)', background: 'var(--surface-alt)', color: 'var(--text)',
                    fontSize: '0.88rem', outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '6px' }}>
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  required
                  placeholder="Re-type new password"
                  style={{
                    width: '100%', padding: '9px 12px', borderRadius: '8px',
                    border: '1.5px solid var(--border)', background: 'var(--surface-alt)', color: 'var(--text)',
                    fontSize: '0.88rem', outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                <button
                  type="submit"
                  className="primary-btn"
                  disabled={pwLoading}
                  style={{ height: '36px', minHeight: '36px', fontSize: '0.82rem', padding: '0 16px', borderRadius: '8px' }}
                >
                  {pwLoading ? 'Updating…' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>

          {/* Account Role & Scope info */}
          <div className="dash-table-card" style={{ padding: '20px' }}>
            <div style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--text)', marginBottom: '12px' }}>
              Account Scope & Permissions
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>
                <span style={{ color: 'var(--muted)' }}>Assigned Role</span>
                <strong style={{ color: 'var(--text)' }}>{currentUser.role}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>
                <span style={{ color: 'var(--muted)' }}>Campus Branch</span>
                <strong style={{ color: 'var(--text)' }}>{currentUser.branchName || 'All Campuses'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--muted)' }}>Location Region</span>
                <strong style={{ color: 'var(--text)' }}>{currentUser.locationName || 'Hyderabad'}</strong>
              </div>
            </div>
          </div>

        </div>

      </div>

    </section>
  );
}