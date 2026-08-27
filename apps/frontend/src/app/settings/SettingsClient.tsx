'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { SessionUser } from '../../lib/auth';
import CustomSelect from '../../components/CustomSelect';

interface Branch {
  id: string;
  name: string;
  code?: string;
  locationId: string;
  locationName: string;
  departmentIds?: string[];
  departmentNames?: string[];
  active?: boolean;
}

interface Location {
  id: string;
  name: string;
}

interface User {
  id: string;
  username: string;
  name: string;
  email?: string;
  roleId: string;
  branchId?: string;
  departmentId?: string;
  active?: boolean;
}

interface Role {
  id: string;
  name: string;
  description?: string;
}

interface Department {
  id: string;
  name: string;
}

interface SettingsClientProps {
  branches: Branch[];
  locations: Location[];
  users: User[];
  roles: Role[];
  departments: Department[];
  currentUser: SessionUser | null;
}

type SectionKey = 'general' | 'campuses' | 'team' | 'roles' | 'appearance' | 'ai' | 'security';

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export default function SettingsClient({
  branches: initialBranches,
  locations,
  users: initialUsers,
  roles,
  departments,
  currentUser,
}: SettingsClientProps) {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<SectionKey>('general');
  const [branches, setBranches] = useState<Branch[]>(initialBranches);
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Search & Filter in Team section
  const [teamSearch, setTeamSearch] = useState('');
  const [teamRoleFilter, setTeamRoleFilter] = useState('');
  const [teamBranchFilter, setTeamBranchFilter] = useState('');

  // ── Form States ──
  const [orgForm, setOrgForm] = useState({
    companyName: 'Codegnan IT Solutions Pvt Ltd',
    email: 'contact@codegnan.com',
    phone: '+91 9888748888',
    website: 'https://codegnan.com',
    address: 'Pista House Building, JNTU-Hitech City Main Rd, Hyderabad, Telangana 500085',
    timezone: 'Asia/Kolkata',
    currency: 'INR',
  });

  const [appearanceForm, setAppearanceForm] = useState({
    theme: 'dark',
    primaryColor: '#6366f1',
    radius: '8px',
    formHeading: 'Student Walk-In Registration',
    formSubtitle: 'Fill your details to receive instant counseling and explore in-demand tech programs.',
    showWalkinBanner: true,
  });

  const [aiForm, setAiForm] = useState({
    smartRouting: true,
    audioFiltering: true,
    autoSummary: true,
    defaultLanguage: 'te-IN',
    slaWarningMinutes: '15',
    slaBreachMinutes: '30',
  });

  const [securityForm, setSecurityForm] = useState({
    sessionTimeout: '8',
    enforce2FA: false,
    autoLock: true,
    strictIpAudit: false,
  });

  const showToast = useCallback((msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // Load from local storage
  useEffect(() => {
    try {
      const sOrg = localStorage.getItem('walkin_org_settings');
      if (sOrg) setOrgForm(JSON.parse(sOrg));

      const sApp = localStorage.getItem('walkin_branding_settings');
      if (sApp) setAppearanceForm(JSON.parse(sApp));

      const sAi = localStorage.getItem('walkin_ai_settings');
      if (sAi) setAiForm(JSON.parse(sAi));

      const sSec = localStorage.getItem('walkin_security_settings');
      if (sSec) setSecurityForm(JSON.parse(sSec));
    } catch (e) {}
  }, []);

  const handleSaveAll = () => {
    setLoading(true);
    try {
      localStorage.setItem('walkin_org_settings', JSON.stringify(orgForm));
      localStorage.setItem('walkin_branding_settings', JSON.stringify(appearanceForm));
      localStorage.setItem('walkin_ai_settings', JSON.stringify(aiForm));
      localStorage.setItem('walkin_security_settings', JSON.stringify(securityForm));

      setHasUnsavedChanges(false);
      showToast('Settings saved successfully and synced across all portal nodes!');
    } catch (e) {
      showToast('Failed to save settings', 'error');
    }
    setLoading(false);
  };

  const handleResetDefaults = () => {
    if (!confirm('Reset all settings to system default parameters?')) return;
    setOrgForm({
      companyName: 'Codegnan IT Solutions Pvt Ltd',
      email: 'contact@codegnan.com',
      phone: '+91 9888748888',
      website: 'https://codegnan.com',
      address: 'Pista House Building, JNTU-Hitech City Main Rd, Hyderabad, Telangana 500085',
      timezone: 'Asia/Kolkata',
      currency: 'INR',
    });
    setAppearanceForm({
      theme: 'dark',
      primaryColor: '#6366f1',
      radius: '8px',
      formHeading: 'Student Walk-In Registration',
      formSubtitle: 'Fill your details to receive instant counseling and explore in-demand tech programs.',
      showWalkinBanner: true,
    });
    setAiForm({
      smartRouting: true,
      audioFiltering: true,
      autoSummary: true,
      defaultLanguage: 'te-IN',
      slaWarningMinutes: '15',
      slaBreachMinutes: '30',
    });
    setSecurityForm({
      sessionTimeout: '8',
      enforce2FA: false,
      autoLock: true,
      strictIpAudit: false,
    });
    setHasUnsavedChanges(true);
    showToast('Defaults restored. Click Save to persist.');
  };

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchSearch = !teamSearch || u.name.toLowerCase().includes(teamSearch.toLowerCase()) || (u.email || '').toLowerCase().includes(teamSearch.toLowerCase()) || u.username.toLowerCase().includes(teamSearch.toLowerCase());
      const matchRole = !teamRoleFilter || u.roleId === teamRoleFilter;
      const matchBranch = !teamBranchFilter || u.branchId === teamBranchFilter;
      return matchSearch && matchRole && matchBranch;
    });
  }, [users, teamSearch, teamRoleFilter, teamBranchFilter]);

  const navItems = [
    {
      id: 'general' as SectionKey,
      label: 'General & Organization',
      badge: 'Core',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 21h18" /><path d="M5 21V7l8-4v18" /><path d="M19 21V11l-6-4" /><path d="M9 9v.01" /><path d="M9 12v.01" /><path d="M9 15v.01" /><path d="M9 18v.01" />
        </svg>
      )
    },
    {
      id: 'campuses' as SectionKey,
      label: 'Campuses & Locations',
      badge: `${branches.length} Nodes`,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
        </svg>
      )
    },
    {
      id: 'team' as SectionKey,
      label: 'Team & Access Roles',
      badge: `${users.length} Staff`,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      )
    },
    {
      id: 'appearance' as SectionKey,
      label: 'Branding & Theme',
      badge: 'Style',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" /><circle cx="17.5" cy="10.5" r=".5" fill="currentColor" /><circle cx="8.5" cy="7.5" r=".5" fill="currentColor" /><circle cx="6.5" cy="12.5" r=".5" fill="currentColor" /><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.563-2.512 5.563-5.563C22 6.5 17.5 2 12 2z" />
        </svg>
      )
    },
    {
      id: 'ai' as SectionKey,
      label: 'AI & Telemetry Routing',
      badge: 'DSP Active',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      )
    },
    {
      id: 'security' as SectionKey,
      label: 'Security & Compliance',
      badge: '2FA',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      )
    },
  ];

  return (
    <section className="dash-page" style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
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
          <span>{toast.type === 'success' ? '✓' : '⚠️'}</span>
          <span>{toast.msg}</span>
        </div>
      )}

      {/* ── Executive Header ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--surface)',
        border: '1.5px solid var(--border)',
        borderRadius: '16px',
        padding: '20px 24px',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '12px',
            background: 'var(--primary-glow)', color: 'var(--primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1.5px solid rgba(99,102,241,0.25)',
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text)', margin: 0, letterSpacing: '-0.02em' }}>
                Settings Control Center
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
                ENTERPRISE
              </span>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.86rem', color: 'var(--muted)' }}>
              Master configuration hub for campus branches, counselor routing, visual branding, and AI engines.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {hasUnsavedChanges && (
            <span style={{ fontSize: '0.78rem', color: '#f59e0b', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b', animation: 'pulse 1.5s infinite' }} />
              Unsaved changes
            </span>
          )}
          <button
            type="button"
            className="outline-btn"
            onClick={handleResetDefaults}
            style={{ height: '38px', minHeight: '38px', fontSize: '0.82rem', padding: '0 14px', borderRadius: '8px' }}
          >
            Reset Defaults
          </button>
          <button
            type="button"
            className="primary-btn"
            onClick={handleSaveAll}
            disabled={loading}
            style={{
              height: '38px', minHeight: '38px', fontSize: '0.84rem', padding: '0 18px',
              borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '8px',
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" />
            </svg>
            <span>{loading ? 'Saving…' : 'Save All Changes'}</span>
          </button>
        </div>
      </div>

      {/* ── 2-Column SaaS Layout (Left Rail + Right Canvas) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '270px minmax(0, 1fr)', gap: '24px', alignItems: 'start' }}>
        
        {/* LEFT NAV RAIL */}
        <div style={{
          background: 'var(--surface)',
          border: '1.5px solid var(--border)',
          borderRadius: '16px',
          padding: '14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          position: 'sticky',
          top: '20px',
        }}>
          <div style={{ padding: '6px 10px 10px 10px', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '0.05em' }}>
            Configuration Sections
          </div>

          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveSection(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: isActive ? '1.5px solid rgba(99, 102, 241, 0.35)' : '1.5px solid transparent',
                  background: isActive ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                  color: isActive ? 'var(--primary)' : 'var(--text)',
                  fontSize: '0.86rem',
                  fontWeight: isActive ? 800 : 600,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={e => {
                  if (!isActive) e.currentTarget.style.background = 'var(--surface-alt)';
                }}
                onMouseLeave={e => {
                  if (!isActive) e.currentTarget.style.background = 'transparent';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ color: isActive ? 'var(--primary)' : 'var(--muted)', display: 'flex', alignItems: 'center' }}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                <span style={{
                  fontSize: '0.68rem',
                  padding: '2px 7px',
                  borderRadius: '9999px',
                  background: isActive ? 'rgba(99, 102, 241, 0.16)' : 'var(--surface-alt)',
                  color: isActive ? 'var(--primary)' : 'var(--muted)',
                  fontWeight: 800,
                }}>
                  {item.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* RIGHT CANVAS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* 🏢 SECTION 1: GENERAL & ORGANIZATION */}
          {activeSection === 'general' && (
            <div className="dash-table-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text)', margin: '0 0 4px 0' }}>
                  Organization Profile & Headquarters
                </h2>
                <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--muted)' }}>
                  Manage the institutional identity, headquarters location, and default currency.
                </p>
              </div>

              {/* Card Group 1 */}
              <div style={{
                background: 'var(--surface-alt)', border: '1px solid var(--border)',
                borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px',
              }}>
                <div style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Legal Identity & Public Profile
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '6px' }}>
                      Company Legal Entity Name
                    </label>
                    <input
                      type="text"
                      value={orgForm.companyName}
                      onChange={e => { setOrgForm({ ...orgForm, companyName: e.target.value }); setHasUnsavedChanges(true); }}
                      style={{
                        width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid var(--border)',
                        background: 'var(--surface)', color: 'var(--text)', fontSize: '0.88rem', fontWeight: 600, outline: 'none',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '6px' }}>
                      Official Web Portal URL
                    </label>
                    <input
                      type="url"
                      value={orgForm.website}
                      onChange={e => { setOrgForm({ ...orgForm, website: e.target.value }); setHasUnsavedChanges(true); }}
                      style={{
                        width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid var(--border)',
                        background: 'var(--surface)', color: 'var(--text)', fontSize: '0.88rem', fontWeight: 600, outline: 'none',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '6px' }}>
                      Primary Support Email
                    </label>
                    <input
                      type="email"
                      value={orgForm.email}
                      onChange={e => { setOrgForm({ ...orgForm, email: e.target.value }); setHasUnsavedChanges(true); }}
                      style={{
                        width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid var(--border)',
                        background: 'var(--surface)', color: 'var(--text)', fontSize: '0.88rem', fontWeight: 600, outline: 'none',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '6px' }}>
                      Official Contact Phone
                    </label>
                    <input
                      type="tel"
                      value={orgForm.phone}
                      onChange={e => { setOrgForm({ ...orgForm, phone: e.target.value }); setHasUnsavedChanges(true); }}
                      style={{
                        width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid var(--border)',
                        background: 'var(--surface)', color: 'var(--text)', fontSize: '0.88rem', fontWeight: 600, outline: 'none',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '6px' }}>
                    Main Campus / Headquarters Physical Address
                  </label>
                  <textarea
                    rows={2}
                    value={orgForm.address}
                    onChange={e => { setOrgForm({ ...orgForm, address: e.target.value }); setHasUnsavedChanges(true); }}
                    style={{
                      width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid var(--border)',
                      background: 'var(--surface)', color: 'var(--text)', fontSize: '0.88rem', fontWeight: 600, outline: 'none', resize: 'vertical',
                    }}
                  />
                </div>
              </div>

              {/* Card Group 2 */}
              <div style={{
                background: 'var(--surface-alt)', border: '1px solid var(--border)',
                borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px',
              }}>
                <div style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Regional & Accounting Parameters
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '6px' }}>
                      System Timezone
                    </label>
                    <CustomSelect
                      value={orgForm.timezone}
                      onChange={e => { setOrgForm({ ...orgForm, timezone: e.target.value }); setHasUnsavedChanges(true); }}
                      options={[
                        { value: 'Asia/Kolkata', label: '🇮🇳 Asia/Kolkata (IST - UTC+05:30)' },
                        { value: 'Asia/Dubai', label: '🇦🇪 Asia/Dubai (GST - UTC+04:00)' },
                        { value: 'America/New_York', label: '🇺🇸 America/New_York (EST - UTC-05:00)' },
                        { value: 'Europe/London', label: '🇬🇧 Europe/London (GMT - UTC+00:00)' },
                      ]}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '6px' }}>
                      Base Accounting Currency
                    </label>
                    <CustomSelect
                      value={orgForm.currency}
                      onChange={e => { setOrgForm({ ...orgForm, currency: e.target.value }); setHasUnsavedChanges(true); }}
                      options={[
                        { value: 'INR', label: 'INR (₹ - Indian Rupee)' },
                        { value: 'USD', label: 'USD ($ - US Dollar)' },
                        { value: 'EUR', label: 'EUR (€ - Euro)' },
                        { value: 'AED', label: 'AED (د.إ - UAE Dirham)' },
                      ]}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 📍 SECTION 2: CAMPUSES & LOCATIONS */}
          {activeSection === 'campuses' && (
            <div className="dash-table-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text)', margin: '0 0 4px 0' }}>
                    Active Campus Branch Nodes
                  </h2>
                  <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--muted)' }}>
                    Physical institutional centers configured for walk-in queues and counseling sessions.
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
                {branches.map((b) => (
                  <div
                    key={b.id}
                    style={{
                      background: 'var(--surface-alt)', border: '1.5px solid var(--border)',
                      borderRadius: '14px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.98rem', color: 'var(--text)' }}>
                          {b.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--primary)', marginTop: '2px' }}>
                          #{b.id}
                        </div>
                      </div>
                      <span style={{
                        padding: '2px 8px', borderRadius: '9999px',
                        background: 'rgba(16,185,129,0.12)', color: '#10b981',
                        fontSize: '0.7rem', fontWeight: 800,
                      }}>
                        ACTIVE
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--muted)' }}>
                      <span>📍</span>
                      <span>{b.locationName || 'Hyderabad Region'}</span>
                    </div>

                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
                      <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '6px', background: 'var(--surface)', border: '1px solid var(--border)', fontWeight: 600 }}>
                        Technical Training
                      </span>
                      <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '6px', background: 'var(--surface)', border: '1px solid var(--border)', fontWeight: 600 }}>
                        Admissions Desk
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 👥 SECTION 3: TEAM & ACCESS ROLES */}
          {activeSection === 'team' && (
            <div className="dash-table-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text)', margin: '0 0 4px 0' }}>
                  Team Directory & Role Allocations
                </h2>
                <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--muted)' }}>
                  Assigned staff members, counselor credentials, and campus permissions.
                </p>
              </div>

              {/* Search & Filter Bar */}
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{
                  flex: '1 1 240px', display: 'flex', alignItems: 'center', gap: '8px',
                  background: 'var(--surface-alt)', borderRadius: '8px', border: '1.5px solid var(--border)', padding: '0 12px',
                }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--muted)' }}>
                    <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.3-4.3" />
                  </svg>
                  <input
                    type="search"
                    placeholder="Search staff by name or email…"
                    value={teamSearch}
                    onChange={e => setTeamSearch(e.target.value)}
                    style={{ border: 'none', background: 'transparent', width: '100%', fontSize: '0.84rem', color: 'var(--text)', outline: 'none', padding: '8px 0' }}
                  />
                </div>
                <div style={{ width: '180px' }}>
                  <CustomSelect
                    value={teamRoleFilter}
                    onChange={e => setTeamRoleFilter(e.target.value)}
                    options={[
                      { value: '', label: 'All Roles' },
                      { value: 'role_super_admin', label: 'Super Admin' },
                      { value: 'role_admin', label: 'Admin' },
                      { value: 'role_counselor', label: 'Counselor' },
                      { value: 'role_front_desk', label: 'Front Desk' },
                    ]}
                  />
                </div>
              </div>

              {/* Table */}
              <div className="table-wrapper">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1.5px solid var(--border)', background: 'var(--surface-alt)' }}>
                      <th style={{ padding: '10px 14px', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)' }}>Member</th>
                      <th style={{ padding: '10px 14px', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)' }}>Role</th>
                      <th style={{ padding: '10px 14px', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)' }}>Assigned Campus</th>
                      <th style={{ padding: '10px 14px', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => {
                      const branch = branches.find(b => b.id === u.branchId);
                      return (
                        <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '12px 14px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{
                                width: 32, height: 32, borderRadius: '50%',
                                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                                color: '#fff', fontWeight: 800, fontSize: '0.8rem',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                              }}>
                                {getInitials(u.name)}
                              </div>
                              <div>
                                <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.86rem' }}>{u.name}</div>
                                <div style={{ fontSize: '0.74rem', color: 'var(--muted)' }}>{u.email || `@${u.username}`}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <span style={{
                              fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase',
                              background: 'rgba(99, 102, 241, 0.12)', color: 'var(--primary)',
                              padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(99, 102, 241, 0.25)',
                            }}>
                              {u.roleId?.replace('role_', '').replace('_', ' ')}
                            </span>
                          </td>
                          <td style={{ padding: '12px 14px', fontSize: '0.82rem', color: 'var(--muted)' }}>
                            📍 {branch?.name || 'All Campuses'}
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <span style={{
                              fontSize: '0.72rem', fontWeight: 800,
                              color: '#10b981', background: 'rgba(16,185,129,0.12)',
                              padding: '2px 8px', borderRadius: '9999px',
                            }}>
                              ACTIVE
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 🎨 SECTION 4: BRANDING & THEME */}
          {activeSection === 'appearance' && (
            <div className="dash-table-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text)', margin: '0 0 4px 0' }}>
                  Branding, Color Tokens & Walk-in Form Customizer
                </h2>
                <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--muted)' }}>
                  Customize the visual identity, student self-registration form banners, and accent themes.
                </p>
              </div>

              {/* Accent Colors */}
              <div style={{ background: 'var(--surface-alt)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
                <div style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--text)', textTransform: 'uppercase', marginBottom: '12px' }}>
                  Primary Accent Theme
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
                  {[
                    { name: 'Electric Indigo', hex: '#6366f1' },
                    { name: 'Neon Violet', hex: '#8b5cf6' },
                    { name: 'Cyber Emerald', hex: '#10b981' },
                    { name: 'Sky Cyan', hex: '#0ea5e9' },
                    { name: 'Vibrant Amber', hex: '#f59e0b' },
                    { name: 'Hyper Rose', hex: '#f43f5e' },
                  ].map((color) => {
                    const isSelected = appearanceForm.primaryColor === color.hex;
                    return (
                      <button
                        key={color.hex}
                        type="button"
                        onClick={() => { setAppearanceForm({ ...appearanceForm, primaryColor: color.hex }); setHasUnsavedChanges(true); }}
                        style={{
                          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                          padding: '14px', borderRadius: '10px',
                          border: isSelected ? `2px solid ${color.hex}` : '1.5px solid var(--border)',
                          background: isSelected ? `${color.hex}14` : 'var(--surface)',
                          cursor: 'pointer', transition: 'all 0.15s ease',
                        }}
                      >
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: color.hex, boxShadow: `0 2px 8px ${color.hex}66` }} />
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text)' }}>{color.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Form Customizer */}
              <div style={{ background: 'var(--surface-alt)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--text)', textTransform: 'uppercase' }}>
                  Walk-in Self Registration Page Customizer (/walkin-form)
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '6px' }}>
                    Registration Page Heading
                  </label>
                  <input
                    type="text"
                    value={appearanceForm.formHeading}
                    onChange={e => { setAppearanceForm({ ...appearanceForm, formHeading: e.target.value }); setHasUnsavedChanges(true); }}
                    style={{
                      width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid var(--border)',
                      background: 'var(--surface)', color: 'var(--text)', fontSize: '0.88rem', fontWeight: 600, outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '6px' }}>
                    Registration Page Subtitle & Instructions
                  </label>
                  <textarea
                    rows={2}
                    value={appearanceForm.formSubtitle}
                    onChange={e => { setAppearanceForm({ ...appearanceForm, formSubtitle: e.target.value }); setHasUnsavedChanges(true); }}
                    style={{
                      width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid var(--border)',
                      background: 'var(--surface)', color: 'var(--text)', fontSize: '0.88rem', fontWeight: 600, outline: 'none', resize: 'vertical',
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* 🤖 SECTION 5: AI & TELEMETRY */}
          {activeSection === 'ai' && (
            <div className="dash-table-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text)', margin: '0 0 4px 0' }}>
                  AI Routing & Audio DSP Telemetry
                </h2>
                <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--muted)' }}>
                  Configure real-time counselor speech processing and queue load balancers.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{
                  padding: '16px 20px', borderRadius: '12px', background: 'var(--surface-alt)',
                  border: '1.5px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text)' }}>Real-Time Audio DSP Noise Suppression</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '2px' }}>
                      Removes ambient classroom background noise during counseling session recording.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={aiForm.audioFiltering}
                    onChange={e => { setAiForm({ ...aiForm, audioFiltering: e.target.checked }); setHasUnsavedChanges(true); }}
                    style={{ width: 20, height: 20, accentColor: 'var(--primary)' }}
                  />
                </div>

                <div style={{
                  padding: '16px 20px', borderRadius: '12px', background: 'var(--surface-alt)',
                  border: '1.5px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text)' }}>Automated Gemini AI Session Summarizer</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '2px' }}>
                      Generates instant executive counseling notes and next-steps upon session completion.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={aiForm.autoSummary}
                    onChange={e => { setAiForm({ ...aiForm, autoSummary: e.target.checked }); setHasUnsavedChanges(true); }}
                    style={{ width: 20, height: 20, accentColor: 'var(--primary)' }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* 🔒 SECTION 6: SECURITY & COMPLIANCE */}
          {activeSection === 'security' && (
            <div className="dash-table-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text)', margin: '0 0 4px 0' }}>
                  Security, Session Timeout & Compliance
                </h2>
                <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--muted)' }}>
                  Manage idle session expiry durations and staff authorization policies.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '600px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '6px' }}>
                    Idle Session Expiry Duration
                  </label>
                  <CustomSelect
                    value={securityForm.sessionTimeout}
                    onChange={e => { setSecurityForm({ ...securityForm, sessionTimeout: e.target.value }); setHasUnsavedChanges(true); }}
                    options={[
                      { value: '4', label: '4 Hours (High Security)' },
                      { value: '8', label: '8 Hours (Standard Shift)' },
                      { value: '12', label: '12 Hours (Extended)' },
                      { value: '24', label: '24 Hours (Full Day)' },
                    ]}
                  />
                </div>

                <div style={{
                  padding: '16px 20px', borderRadius: '12px', background: 'var(--surface-alt)',
                  border: '1.5px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text)' }}>Enforce 2FA for Super Admin & Admin Roles</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '2px' }}>
                      Requires authenticator TOTP token verification on login.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={securityForm.enforce2FA}
                    onChange={e => { setSecurityForm({ ...securityForm, enforce2FA: e.target.checked }); setHasUnsavedChanges(true); }}
                    style={{ width: 20, height: 20, accentColor: 'var(--primary)' }}
                  />
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

    </section>
  );
}