'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { SessionUser } from '../../lib/auth';
import { updateUserProfile, changePassword } from '../../actions/authActions';
import BadgeCrest from '../../components/BadgeCrest';
import { ALL_BADGES } from '../../lib/gamification';

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
  if (!name) return '??';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export default function ProfileClient({ currentUser, userRecord }: ProfileClientProps) {
  const router = useRouter();
  const [activeMode, setActiveMode] = useState<'view' | 'edit'>('view');

  const [profileForm, setProfileForm] = useState({
    name: userRecord.name,
    email: userRecord.email,
    phone: '+91 9888748888',
    bio: 'Dedicated Senior Career Counselor guiding engineering and computer science students to industry-aligned career tracks in Full Stack Java, Python, and Data Science.',
    specialization: 'Full Stack Java, Python, AI & Cloud Computing',
    consultationHours: '09:30 AM – 06:30 PM (Mon – Sat)',
    maxCapacity: '15 Intakes / Day',
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
    const res = await updateUserProfile({ name: profileForm.name, email: profileForm.email });
    if (res.success) {
      showToast('Profile details saved successfully!');
      router.refresh();
      setActiveMode('view');
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

  // Mock gamification trophies for showcase
  const badgesShowcase = useMemo(() => {
    return ALL_BADGES.map((b, idx) => ({
      ...b,
      isUnlocked: idx === 0 || idx === 3 || idx === 5,
      progressPct: idx === 0 || idx === 3 || idx === 5 ? 100 : idx === 1 ? 1 : 60,
    }));
  }, []);

  const roleMeta = useMemo(() => {
    const r = currentUser.role?.toLowerCase() || '';
    if (r.includes('admin')) {
      return {
        title: 'Super Admin',
        icon: '🛡️',
        color: '#6366f1',
        tag: 'Full Master Access',
        desc: 'Unrestricted control across all 4 walk-in campus centers, user authentication, webhooks, and executive reporting.',
      };
    }
    if (r.includes('head') || r.includes('manager')) {
      return {
        title: 'Campus Head / Branch Manager',
        icon: '🏛️',
        color: '#f59e0b',
        tag: 'Branch Supervisor',
        desc: 'Supervises branch queue, reassigns counselor tokens, monitors monthly targets, and leads campus standings.',
      };
    }
    if (r.includes('front') || r.includes('reception')) {
      return {
        title: 'Front Desk / Receptionist',
        icon: '📋',
        color: '#06b6d4',
        tag: 'Front Desk Intake',
        desc: 'Registers walk-in candidates, parent accompanied status, assigns queue tokens, and merges group walk-ins.',
      };
    }
    return {
      title: 'Senior Counselor',
      icon: '🎓',
      color: '#10b981',
      tag: 'Counselling Operations',
      desc: 'Conducts candidate counseling in Live Workspace, records session audio, triggers AI summary, and earns achievement badges.',
    };
  }, [currentUser.role]);

  return (
    <section className="dash-page" style={{ maxWidth: '1180px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '60px' }}>
      
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

      {/* ── Header Banner & Mode Switcher ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--surface)',
        border: '1.5px solid var(--border)',
        borderRadius: '18px',
        padding: '24px',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div style={{
            width: '68px', height: '68px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
            color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.6rem', fontWeight: 900,
            border: '2px solid rgba(255,255,255,0.2)',
            boxShadow: '0 6px 20px rgba(99,102,241,0.35)',
          }}>
            {getInitials(profileForm.name)}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text)', margin: 0 }}>
                {profileForm.name}
              </h1>
              <span style={{
                fontSize: '0.72rem',
                background: 'rgba(99, 102, 241, 0.15)',
                color: 'var(--primary)',
                padding: '3px 10px',
                borderRadius: '9999px',
                fontWeight: 800,
                border: '1px solid rgba(99, 102, 241, 0.3)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}>
                <span>{roleMeta.icon}</span> {roleMeta.title}
              </span>
              <span style={{
                fontSize: '0.7rem', fontWeight: 900, padding: '3px 8px', borderRadius: '6px',
                background: '#f59e0b', color: '#fff', textTransform: 'uppercase',
              }}>
                Lvl 5 • Gold Veteran
              </span>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.84rem', color: 'var(--muted)' }}>
              @{userRecord.username} • {currentUser.branchName || '1st Campus (JNTU-HYD)'} • 🔥 6-Day Streak
            </p>
          </div>
        </div>

        {/* View / Edit Mode Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={() => setActiveMode('view')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '8px',
              border: activeMode === 'view' ? '1.5px solid var(--primary)' : '1px solid var(--border)',
              background: activeMode === 'view' ? 'var(--primary)' : 'var(--surface-alt)',
              color: activeMode === 'view' ? '#fff' : 'var(--muted)',
              fontSize: '0.82rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: activeMode === 'view' ? '0 2px 10px rgba(99, 102, 241, 0.35)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            👁️ Showcase View
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('edit')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '8px',
              border: activeMode === 'edit' ? '1.5px solid var(--primary)' : '1px solid var(--border)',
              background: activeMode === 'edit' ? 'var(--primary)' : 'var(--surface-alt)',
              color: activeMode === 'edit' ? '#fff' : 'var(--muted)',
              fontSize: '0.82rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: activeMode === 'edit' ? '0 2px 10px rgba(99, 102, 241, 0.35)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            ✏️ Edit Profile
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          MODE 1: VIEW / PUBLIC ACHIEVEMENT SHOWCASE
      ══════════════════════════════════════════════════════ */}
      {activeMode === 'view' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* KPI Stat Strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
            <div style={{ background: 'var(--card-bg)', border: '1.5px solid var(--border)', borderRadius: '14px', padding: '16px 18px' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)' }}>Total Handled</span>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text)', marginTop: '4px' }}>124</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: '2px' }}>Walk-in Candidates Guided</div>
            </div>

            <div style={{ background: 'var(--card-bg)', border: '1.5px solid var(--border)', borderRadius: '14px', padding: '16px 18px' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)' }}>Conversion Rate</span>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#10b981', marginTop: '4px' }}>88%</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: '2px' }}>Enrollment Velocity</div>
            </div>

            <div style={{ background: 'var(--card-bg)', border: '1.5px solid var(--border)', borderRadius: '14px', padding: '16px 18px' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)' }}>League Points</span>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--primary)', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>1,450 PTS</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: '2px' }}>Rank #1 MVP (August 2026)</div>
            </div>

            <div style={{ background: 'var(--card-bg)', border: '1.5px solid var(--border)', borderRadius: '14px', padding: '16px 18px' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)' }}>Active Streak</span>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#f59e0b', marginTop: '4px' }}>🔥 6 Days</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: '2px' }}>Consecutive Attendance</div>
            </div>
          </div>

          {/* 2-Column Section: Left Achievements / Right Profile Details */}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.6fr) minmax(0, 1fr)', gap: '20px', alignItems: 'start' }}>
            
            {/* LEFT: Achievement Badges Shelf */}
            <div style={{
              background: 'var(--card-bg)',
              border: '1.5px solid var(--border)',
              borderRadius: '18px',
              padding: '24px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h2 style={{ fontSize: '1.15rem', fontWeight: 900, margin: 0, color: 'var(--text)' }}>
                    🎖️ Career Achievement Trophies &amp; Medals
                  </h2>
                  <p style={{ fontSize: '0.76rem', color: 'var(--muted)', margin: '3px 0 0 0' }}>
                    Milestones unlocked through high-conversion counseling velocity.
                  </p>
                </div>
                <span style={{
                  padding: '4px 10px', borderRadius: '6px', fontSize: '0.74rem', fontWeight: 800,
                  background: 'rgba(16, 185, 129, 0.12)', color: '#10b981',
                }}>
                  3 Unlocked
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '14px' }}>
                {badgesShowcase.map((b) => (
                  <div
                    key={b.id}
                    style={{
                      background: 'var(--surface)',
                      border: '1.5px solid var(--border)',
                      borderRadius: '14px',
                      padding: '16px 14px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      position: 'relative',
                    }}
                  >
                    <span style={{
                      position: 'absolute', top: '10px', right: '10px',
                      fontSize: '0.62rem', fontWeight: 900, padding: '2px 6px', borderRadius: '4px',
                      background: b.isUnlocked ? '#dcfce7' : '#f1f5f9',
                      color: b.isUnlocked ? '#15803d' : '#64748b',
                      border: `1px solid ${b.isUnlocked ? '#86efac' : '#cbd5e1'}`,
                    }}>
                      {b.isUnlocked ? 'UNLOCKED ✔' : 'LOCKED 🔒'}
                    </span>

                    <div style={{ marginTop: '8px', marginBottom: '10px' }}>
                      <BadgeCrest
                        tier={b.tier}
                        size={60}
                        isUnlocked={b.isUnlocked}
                        icon={b.icon}
                      />
                    </div>

                    <h3 style={{ margin: '0 0 4px 0', fontSize: '0.92rem', fontWeight: 800, color: 'var(--text)' }}>
                      {b.name}
                    </h3>
                    <p style={{ margin: '0 0 10px 0', fontSize: '0.72rem', color: 'var(--muted)', lineHeight: 1.4 }}>
                      {b.description}
                    </p>

                    <div style={{ width: '100%', marginTop: 'auto' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.64rem', fontWeight: 800, marginBottom: '3px' }}>
                        <span style={{ color: 'var(--muted)' }}>MASTERY</span>
                        <span style={{ color: b.isUnlocked ? '#10b981' : 'var(--primary)' }}>{b.progressPct}%</span>
                      </div>
                      <div style={{ height: '4px', borderRadius: '9999px', background: 'var(--surface-alt)', overflow: 'hidden' }}>
                        <div style={{
                          height: '100%',
                          width: `${b.progressPct}%`,
                          background: b.isUnlocked ? '#10b981' : '#6366f1',
                          borderRadius: '9999px',
                        }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT: Professional Bio & Scope Card */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Bio & Details */}
              <div style={{
                background: 'var(--card-bg)',
                border: '1.5px solid var(--border)',
                borderRadius: '18px',
                padding: '22px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
              }}>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--text)' }}>
                  Professional Profile &amp; Bio
                </h3>
                <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--muted)', lineHeight: 1.55 }}>
                  {profileForm.bio}
                </p>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div>
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)' }}>Tech Specializations</span>
                    <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text)', marginTop: '2px' }}>
                      {profileForm.specialization}
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)' }}>Consultation Hours</span>
                    <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text)', marginTop: '2px' }}>
                      {profileForm.consultationHours}
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)' }}>Max Daily Intake Quota</span>
                    <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text)', marginTop: '2px' }}>
                      {profileForm.maxCapacity}
                    </div>
                  </div>
                </div>
              </div>

              {/* Role Definition & Permission Matrix */}
              <div style={{
                background: 'var(--card-bg)',
                border: '1.5px solid var(--border)',
                borderRadius: '18px',
                padding: '22px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1.2rem' }}>{roleMeta.icon}</span>
                  <span style={{ fontSize: '0.94rem', fontWeight: 800, color: 'var(--text)' }}>
                    {roleMeta.title}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--muted)', lineHeight: 1.45 }}>
                  {roleMeta.desc}
                </p>
                <div style={{
                  marginTop: '8px', padding: '8px 12px', borderRadius: '8px',
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  fontSize: '0.74rem', color: 'var(--text)', fontWeight: 700,
                }}>
                  Supervised Branch: <strong>{currentUser.branchName || '1st Campus (JNTU-HYD)'}</strong>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          MODE 2: EDIT PROFILE MODE
      ══════════════════════════════════════════════════════ */}
      {activeMode === 'edit' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: '24px', alignItems: 'start' }}>
          
          {/* LEFT: Editable Profile Fields Form */}
          <div className="dash-table-card" style={{ padding: '24px' }}>
            <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text)', margin: '0 0 4px 0' }}>
                  Edit Counselor &amp; Personal Profile
                </h2>
                <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--muted)' }}>
                  Update your contact details, bio summary, consultation hours, and intake settings.
                </p>
              </div>
            </div>

            <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
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
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '6px' }}>
                    Contact Phone Number
                  </label>
                  <input
                    type="text"
                    value={profileForm.phone}
                    onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                    style={{
                      width: '100%', padding: '10px 14px', borderRadius: '8px',
                      border: '1.5px solid var(--border)', background: 'var(--surface-alt)', color: 'var(--text)',
                      fontSize: '0.88rem', fontWeight: 600, outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '6px' }}>
                    Max Daily Intake Capacity
                  </label>
                  <input
                    type="text"
                    value={profileForm.maxCapacity}
                    onChange={e => setProfileForm({ ...profileForm, maxCapacity: e.target.value })}
                    style={{
                      width: '100%', padding: '10px 14px', borderRadius: '8px',
                      border: '1.5px solid var(--border)', background: 'var(--surface-alt)', color: 'var(--text)',
                      fontSize: '0.88rem', fontWeight: 600, outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '6px' }}>
                  Counselor Bio &amp; Intro Summary
                </label>
                <textarea
                  rows={3}
                  value={profileForm.bio}
                  onChange={e => setProfileForm({ ...profileForm, bio: e.target.value })}
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: '8px',
                    border: '1.5px solid var(--border)', background: 'var(--surface-alt)', color: 'var(--text)',
                    fontSize: '0.86rem', outline: 'none', resize: 'vertical',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '6px' }}>
                  Tech Program Specializations
                </label>
                <input
                  type="text"
                  value={profileForm.specialization}
                  onChange={e => setProfileForm({ ...profileForm, specialization: e.target.value })}
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: '8px',
                    border: '1.5px solid var(--border)', background: 'var(--surface-alt)', color: 'var(--text)',
                    fontSize: '0.88rem', fontWeight: 600, outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setActiveMode('view')}
                  style={{
                    padding: '8px 18px', borderRadius: '8px',
                    background: 'var(--surface-alt)', border: '1px solid var(--border)',
                    color: 'var(--text)', fontSize: '0.84rem', fontWeight: 700, cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: '8px 22px', borderRadius: '8px',
                    background: 'linear-gradient(135deg, var(--primary), #818cf8)',
                    border: 'none', color: '#fff', fontSize: '0.84rem', fontWeight: 800,
                    cursor: 'pointer', boxShadow: '0 2px 10px rgba(99, 102, 241, 0.35)',
                  }}
                >
                  {loading ? 'Saving Changes…' : '💾 Save Profile Details'}
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
                Role Permissions Scope
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>
                  <span style={{ color: 'var(--muted)' }}>Assigned Role</span>
                  <strong style={{ color: 'var(--text)' }}>{roleMeta.title}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>
                  <span style={{ color: 'var(--muted)' }}>Supervised Branch</span>
                  <strong style={{ color: 'var(--text)' }}>{currentUser.branchName || '1st Campus (JNTU-HYD)'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--muted)' }}>Primary Region</span>
                  <strong style={{ color: 'var(--text)' }}>{currentUser.locationName || 'Hyderabad'}</strong>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

    </section>
  );
}
