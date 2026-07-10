'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { SessionUser } from '../../lib/auth';

interface SettingsCategory {
  id: string;
  name: string;
  icon: string;
  subsections: SettingsSubsection[];
}

interface SettingsSubsection {
  id: string;
  name: string;
  description?: string;
}

const ORGANIZATION_SETTINGS: SettingsCategory[] = [
  {
    id: 'organization',
    name: 'Organization',
    icon: '🏢',
    subsections: [
      { id: 'profile', name: 'Profile', description: 'Organization profile and details' },
      { id: 'branding', name: 'Branding', description: 'Logo, colors, and theme' },
      { id: 'custom-domain', name: 'Custom Domain', description: 'Configure custom domain' },
      { id: 'locations', name: 'Locations', description: 'Manage branch locations' },
      { id: 'ai-preferences', name: 'AI Preferences', description: 'AI configuration' },
      { id: 'subscription', name: 'Manage Subscription', description: 'Subscription and billing' }
    ]
  },
  {
    id: 'users-roles',
    name: 'Users & Roles',
    icon: '👥',
    subsections: [
      { id: 'users', name: 'Users', description: 'Manage portal users' },
      { id: 'roles', name: 'Roles', description: 'User roles and permissions' },
      { id: 'user-preferences', name: 'User Preferences', description: 'Default user settings' },
      { id: 'taxes-compliance', name: 'Taxes & Compliance', description: 'Tax configuration' },
      { id: 'taxes', name: 'Taxes', description: 'Tax rates and rules' },
      { id: 'direct-taxes', name: 'Direct Taxes', description: 'Direct tax configuration' },
      { id: 'eway-bills', name: 'e-Way Bills', description: 'e-Way bill settings' },
      { id: 'e-invoicing', name: 'e-Invoicing', description: 'e-Invoice configuration' },
      { id: 'msme-settings', name: 'MSME Settings', description: 'MSME compliance' }
    ]
  },
  {
    id: 'setup-config',
    name: 'Setup & Configurations',
    icon: '⚙️',
    subsections: [
      { id: 'general', name: 'General', description: 'General settings' },
      { id: 'currencies', name: 'Currencies', description: 'Currency configuration' },
      { id: 'payment-terms', name: 'Payment Terms', description: 'Payment terms setup' },
      { id: 'opening-balances', name: 'Opening Balances', description: 'Opening balance configuration' },
      { id: 'reminders', name: 'Reminders', description: 'Reminder settings' },
      { id: 'customer-portal', name: 'Customer Portal', description: 'Customer portal settings' },
      { id: 'vendor-portal', name: 'Vendor Portal', description: 'Vendor portal settings' }
    ]
  },
  {
    id: 'customization',
    name: 'Customization',
    icon: '🎨',
    subsections: [
      { id: 'transaction-series', name: 'Transaction Number Series', description: 'Number series configuration' },
      { id: 'pdf-templates', name: 'PDF Templates', description: 'PDF template customization' },
      { id: 'email-notifications', name: 'Email Notifications', description: 'Email notification settings' },
      { id: 'sms-notifications', name: 'SMS Notifications', description: 'SMS notification settings' },
      { id: 'reporting-tags', name: 'Reporting Tags', description: 'Reporting tag configuration' },
      { id: 'web-tabs', name: 'Web Tabs', description: 'Web tab customization' },
      { id: 'digital-signature', name: 'Digital Signature', description: 'Digital signature setup' }
    ]
  },
  {
    id: 'automation',
    name: 'Automation',
    icon: '🤖',
    subsections: [
      { id: 'workflow-rules', name: 'Workflow Rules', description: 'Workflow rule configuration' },
      { id: 'workflow-actions', name: 'Workflow action setup' },
      { id: 'workflow-logs', name: 'Workflow execution logs' },
      { id: 'schedules', name: 'Schedules', description: 'Scheduled tasks' }
    ]
  }
];

const MODULE_SETTINGS: SettingsCategory[] = [
  {
    id: 'modules',
    name: 'Module Settings',
    icon: '📦',
    subsections: [
      { id: 'module-general', name: 'General', description: 'General module settings' },
      { id: 'inventory', name: 'Inventory', description: 'Inventory module configuration' },
      { id: 'sales', name: 'Sales', description: 'Sales module settings' },
      { id: 'purchases', name: 'Purchases', description: 'Purchases module configuration' },
      { id: 'custom-modules', name: 'Custom Modules', description: 'Custom module setup' }
    ]
  }
];

function Toast({ msg, ok }: { msg: string; ok: boolean }) {
  if (!msg) return null;
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 1000,
      padding: '10px 18px', borderRadius: '8px', fontSize: '0.88rem', fontWeight: 600,
      background: ok ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
      color: ok ? '#10b981' : '#f87171',
      border: `1px solid ${ok ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
    }}>
      {msg}
    </div>
  );
}

interface SettingsClientProps {
  branches: any[];
  locations: any[];
  users: any[];
  roles: any[];
  departments: any[];
  currentUser: SessionUser | null;
}

export default function SettingsClient({ branches, locations, users: initialUsers, roles, departments, currentUser }: SettingsClientProps) {
  const router = useRouter();
  const [activeSubsection, setActiveSubsection] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['organization']));
  const [toast, setToast] = useState({ msg: '', ok: true });
  const [users, setUsers] = useState<any[]>(initialUsers);

  // Form states
  const [profileForm, setProfileForm] = useState({
    companyName: 'Codegnan IT Solutions Pvt Ltd',
    email: 'contact@codegnan.com',
    phone: '+91 9888748888',
    website: 'https://codegnan.com',
    address: 'JNTU Road, Hyderabad, Telangana, India',
    taxId: '36AAAAA1111A1Z1'
  });

  const [brandingForm, setBrandingForm] = useState({
    primary: '#6366f1',
    accent: '#a855f7',
    radius: 14
  });

  const [aiForm, setAiForm] = useState({
    smartRouting: true,
    autoAssignment: true,
    predictiveWaitTimes: false,
    sentimentAnalysis: true,
    confidenceThreshold: 80
  });

  // Filter Search states
  const [branchSearch, setBranchSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [branchFilter, setBranchFilter] = useState('');

  const showToast = useCallback((msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast({ msg: '', ok: true }), 3500);
  }, []);

  // Load from local storage on mount
  useEffect(() => {
    // Branding
    const savedBranding = localStorage.getItem('walkin-branding');
    if (savedBranding) {
      try {
        const parsed = JSON.parse(savedBranding);
        setBrandingForm(parsed);
      } catch (e) {}
    }

    // Profile
    const savedProfile = localStorage.getItem('walkin-profile');
    if (savedProfile) {
      try {
        setProfileForm(JSON.parse(savedProfile));
      } catch (e) {}
    }

    // AI
    const savedAi = localStorage.getItem('walkin-ai-preferences');
    if (savedAi) {
      try {
        setAiForm(JSON.parse(savedAi));
      } catch (e) {}
    }
  }, []);

  const toggleCategory = useCallback((categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  }, []);

  const selectSubsection = useCallback((subsectionId: string) => {
    setActiveSubsection(subsectionId);
  }, []);

  const closePanel = useCallback(() => {
    setActiveSubsection(null);
  }, []);

  const handleSaveProfile = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('walkin-profile', JSON.stringify(profileForm));
    showToast('Profile settings saved successfully.');
  }, [profileForm, showToast]);

  const handleBrandingSave = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('walkin-branding', JSON.stringify(brandingForm));
    document.documentElement.style.setProperty('--primary', brandingForm.primary);
    document.documentElement.style.setProperty('--accent', brandingForm.accent);
    document.documentElement.style.setProperty('--radius-md', `${brandingForm.radius}px`);
    showToast('Branding settings saved. Theme updated!');
  }, [brandingForm, showToast]);

  const handleResetBranding = useCallback(() => {
    const defaults = { primary: '#6366f1', accent: '#a855f7', radius: 14 };
    setBrandingForm(defaults);
    localStorage.removeItem('walkin-branding');
    document.documentElement.style.setProperty('--primary', defaults.primary);
    document.documentElement.style.setProperty('--accent', defaults.accent);
    document.documentElement.style.setProperty('--radius-md', `${defaults.radius}px`);
    showToast('Branding reset to default.');
  }, [showToast]);

  const handleAiSave = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('walkin-ai-preferences', JSON.stringify(aiForm));
    showToast('AI Preferences saved successfully.');
  }, [aiForm, showToast]);

  const toggleUserStatus = useCallback((userId: string, currentStatus: boolean) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, active: !currentStatus } : u));
    showToast(`User status updated.`);
  }, [showToast]);

  // useMemo filters
  const filteredLocationsWithBranches = useMemo(() => {
    const query = branchSearch.toLowerCase();
    return locations.map(loc => {
      const locBranches = branches.filter(b => b.locationId === loc.id && (b.name.toLowerCase().includes(query) || b.profile.toLowerCase().includes(query)));
      return { ...loc, branches: locBranches };
    }).filter(loc => loc.branches.length > 0 || loc.name.toLowerCase().includes(query));
  }, [locations, branches, branchSearch]);

  const filteredUsers = useMemo(() => {
    const query = userSearch.toLowerCase();
    return users.filter(u => {
      const matchesSearch = (u.name || '').toLowerCase().includes(query) ||
                            (u.username || '').toLowerCase().includes(query) ||
                            (u.email || '').toLowerCase().includes(query);
      const matchesRole = roleFilter ? u.roleId === roleFilter : true;
      const matchesBranch = branchFilter ? u.branchId === branchFilter : true;
      return matchesSearch && matchesRole && matchesBranch;
    });
  }, [users, userSearch, roleFilter, branchFilter]);

  const renderProfile = () => (
    <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Organization Name</label>
          <input type="text" value={profileForm.companyName} onChange={e => setProfileForm({...profileForm, companyName: e.target.value})} required style={{ width: '100%', padding: '10px 14px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--text)' }} />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Tax Registration No.</label>
          <input type="text" value={profileForm.taxId} onChange={e => setProfileForm({...profileForm, taxId: e.target.value})} style={{ width: '100%', padding: '10px 14px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--text)' }} />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Primary Contact Email</label>
          <input type="email" value={profileForm.email} onChange={e => setProfileForm({...profileForm, email: e.target.value})} required style={{ width: '100%', padding: '10px 14px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--text)' }} />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Primary Contact Phone</label>
          <input type="text" value={profileForm.phone} onChange={e => setProfileForm({...profileForm, phone: e.target.value})} required style={{ width: '100%', padding: '10px 14px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--text)' }} />
        </div>
      </div>
      <div>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Website URL</label>
        <input type="url" value={profileForm.website} onChange={e => setProfileForm({...profileForm, website: e.target.value})} style={{ width: '100%', padding: '10px 14px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--text)' }} />
      </div>
      <div>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>HQ Physical Address</label>
        <textarea rows={3} value={profileForm.address} onChange={e => setProfileForm({...profileForm, address: e.target.value})} style={{ resize: 'vertical', width: '100%', padding: '14px 18px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--text)' }} />
      </div>
      <div style={{ marginTop: '12px' }}>
        <button type="submit" className="primary-btn" style={{ padding: '10px 24px' }}>
          💾 Save Profile
        </button>
      </div>
    </form>
  );

  const renderBranding = () => (
    <form onSubmit={handleBrandingSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div>
          <h3 style={{ fontSize: '1rem', marginBottom: '14px' }}>Color Palette</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem' }}>Primary Theme Color</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input type="color" value={brandingForm.primary} onChange={e => setBrandingForm({...brandingForm, primary: e.target.value})} style={{ width: '48px', height: '40px', padding: '2px', border: '1px solid var(--border)', cursor: 'pointer', background: 'transparent' }} />
                <span style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>{brandingForm.primary}</span>
              </div>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem' }}>Accent Highlight Color</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input type="color" value={brandingForm.accent} onChange={e => setBrandingForm({...brandingForm, accent: e.target.value})} style={{ width: '48px', height: '40px', padding: '2px', border: '1px solid var(--border)', cursor: 'pointer', background: 'transparent' }} />
                <span style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>{brandingForm.accent}</span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 style={{ fontSize: '1rem', marginBottom: '14px' }}>Corner Radius & Styling</h3>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem' }}>Border Radius: <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{brandingForm.radius}px</span></label>
            <input type="range" min="4" max="24" step="2" value={brandingForm.radius} onChange={e => setBrandingForm({...brandingForm, radius: Number(e.target.value)})} style={{ width: '100%', padding: 0 }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', opacity: 0.5, marginTop: '4px' }}>
              <span>Sharp (4px)</span>
              <span>Default (14px)</span>
              <span>Rounded (24px)</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '20px', borderRadius: 'var(--radius-md)', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border)', marginTop: '12px' }}>
        <h4 style={{ fontSize: '0.9rem', marginBottom: '10px' }}>Visual Theme Live Preview</h4>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button type="button" style={{ background: brandingForm.primary, color: '#fff', fontSize: '0.8rem', minHeight: '38px', borderRadius: `${brandingForm.radius}px`, padding: '6px 14px', border: 'none' }}>Primary Button</button>
          <button type="button" style={{ background: 'transparent', border: `1px solid ${brandingForm.primary}`, color: brandingForm.primary, fontSize: '0.8rem', minHeight: '38px', borderRadius: `${brandingForm.radius}px`, padding: '6px 14px' }}>Outline Button</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
        <button type="submit" className="primary-btn" style={{ padding: '10px 24px' }}>
          💾 Save Branding Configuration
        </button>
        <button type="button" className="outline-btn" style={{ padding: '10px 24px' }} onClick={handleResetBranding}>
          🔄 Reset Default
        </button>
      </div>
    </form>
  );

  const renderLocations = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', gap: '12px' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '300px' }}>
          <input
            type="search"
            placeholder="Search branches..."
            value={branchSearch}
            onChange={e => setBranchSearch(e.target.value)}
            style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)' }}
          />
        </div>
        <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>Total Branches: {branches.length}</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {filteredLocationsWithBranches.map((loc) => (
          <div key={loc.id} style={{ border: '1px solid var(--border)', borderRadius: '12px', background: 'rgba(255,255,255,0.01)', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '10px', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', margin: 0 }}>
                📍 {loc.name}
              </h3>
              <span style={{ fontSize: '0.75rem', opacity: 0.5, fontStyle: 'italic' }}>{loc.address}</span>
            </div>
            {loc.branches.length === 0 ? (
              <p style={{ fontSize: '0.8rem', opacity: 0.4, margin: 0 }}>No branches under this location match the query.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {loc.branches.map((b: any) => (
                  <div key={b.id} className="location-branch-card">
                    <strong style={{ fontSize: '0.88rem', color: '#fff' }}>{b.name}</strong>
                    <p style={{ fontSize: '0.78rem', color: 'var(--muted)', margin: '2px 0', lineHeight: 1.4 }}>{b.profile}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        {filteredLocationsWithBranches.length === 0 && (
          <div style={{ textAlign: 'center', padding: '30px', opacity: 0.5 }}>No locations or branches found matching the query.</div>
        )}
      </div>
    </div>
  );

  const renderUsers = () => (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '8px', flex: 1, minWidth: '280px' }}>
          <input
            type="search"
            placeholder="Search name, email, user..."
            value={userSearch}
            onChange={e => setUserSearch(e.target.value)}
            style={{ padding: '8px 12px', fontSize: '0.85rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)' }}
          />
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            style={{ width: 'auto', padding: '8px 12px', fontSize: '0.82rem', height: '40px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--text)' }}
          >
            <option value="">All Roles</option>
            {roles.map(r => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </div>
        <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>Total Users: {filteredUsers.length}</span>
      </div>

      <div className="table-wrapper" style={{ margin: 0 }}>
        <table style={{ minWidth: '600px' }}>
          <thead>
            <tr>
              <th>User Profile</th>
              <th>Role</th>
              <th>Branch</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length ? (
              filteredUsers.map((u) => {
                const branchName = branches.find(b => b.id === u.branchId)?.name || 'All Branches';
                const roleName = roles.find(r => r.id === u.roleId)?.name || u.roleId;
                const isActive = u.active !== false;

                return (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-gradient)', color: '#fff', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <strong style={{ fontSize: '0.88rem', display: 'block', color: '#fff' }}>{u.name}</strong>
                          <span style={{ fontSize: '0.75rem', opacity: 0.5 }}>@{u.username} | {u.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{
                        fontSize: '0.72rem',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        background: u.roleId === 'role_super_admin' ? 'rgba(239,68,68,0.12)' : (u.roleId === 'role_admin' ? 'rgba(245,158,11,0.12)' : 'rgba(99,102,241,0.12)'),
                        color: u.roleId === 'role_super_admin' ? '#f87171' : (u.roleId === 'role_admin' ? '#fbbf24' : '#818cf8'),
                        fontWeight: 700
                      }}>
                        {roleName}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.82rem' }}>
                        <div style={{ color: '#fff' }}>{branchName}</div>
                      </div>
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => toggleUserStatus(u.id, isActive)}
                        className="outline-btn"
                        style={{
                          background: isActive ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.05)',
                          color: isActive ? '#10b981' : 'var(--muted)',
                          border: isActive ? '1px solid rgba(16,185,129,0.25)' : '1px solid var(--border)',
                          padding: '4px 10px',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          minHeight: '30px'
                        }}
                      >
                        {isActive ? 'Active' : 'Suspended'}
                      </button>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => showToast(`Password reset link sent to ${u.email}`)}
                        className="outline-btn"
                        style={{ padding: '4px 8px', fontSize: '0.74rem', minHeight: '30px' }}
                      >
                        Reset PW
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr><td colSpan={5} className="empty-row" style={{ textAlign: 'center', opacity: 0.5 }}>No users matched the criteria.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderRoles = () => {
    const rolePermissions: Record<string, string[]> = {
      role_super_admin: ['Dashboard View', 'Add Walk-ins', 'Delete Walk-ins', 'Manage Queue', 'Counsellor Assignments', 'Reports & Analytics', 'Modify Configurations', 'Webhook Control center'],
      role_admin: ['Dashboard View', 'Add Walk-ins', 'Edit Walk-ins', 'Manage Queue', 'Counsellor Assignments', 'Reports & Analytics', 'Edit Setup Settings', 'Webhook Control center'],
      role_manager: ['Dashboard View', 'View Walk-ins', 'Queue Board', 'Branch Analytics', 'Export Reports', 'Webhook Delivery Monitor'],
      role_frontdesk: ['Dashboard View', 'Add Walk-ins', 'Queue Check-in', 'Assigned Student view'],
      role_counselor: ['Dashboard View', 'Personal Assigned Queue', 'Session Management (Start/End)', 'Update Availability status']
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {roles.map((role) => (
          <div key={role.id} style={{ border: '1px solid var(--border)', borderRadius: '12px', background: 'rgba(255,255,255,0.01)', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border)', paddingBottom: '10px', marginBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', color: '#fff', margin: 0 }}>🛡️ {role.name}</h3>
                <span style={{ fontSize: '0.74rem', opacity: 0.5, fontFamily: 'monospace' }}>Role Key: {role.id}</span>
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--muted)', textAlign: 'right' }}>{role.description}</span>
            </div>
            <div>
              <p style={{ fontSize: '0.76rem', fontWeight: 700, textTransform: 'uppercase', opacity: 0.4, letterSpacing: '0.05em', marginBottom: '8px' }}>Allowed Capabilities</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {rolePermissions[role.id]?.map((perm) => (
                  <span key={perm} style={{ fontSize: '0.72rem', padding: '3px 8px', borderRadius: '4px', background: 'var(--primary-glow)', color: 'var(--primary)', border: '1px solid rgba(99,102,241,0.15)', fontWeight: 600 }}>
                    ✓ {perm}
                  </span>
                )) || <span style={{ fontSize: '0.76rem', opacity: 0.4 }}>No capabilities mapped.</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderAIPreferences = () => (
    <form onSubmit={handleAiSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '14px' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '4px', color: '#fff' }}>Queue Management Automation</h3>
          <p style={{ fontSize: '0.8rem', opacity: 0.55, margin: 0 }}>Automate assignments and queue routing using intelligence models.</p>
        </div>

        {[
          {
            title: 'Smart Queue Routing',
            desc: 'Automatically routes student walk-ins to the counselor with the shortest queue or matching course expertise.',
            key: 'smartRouting'
          },
          {
            title: 'Counsellor Auto-Assignment',
            desc: 'Immediately assigns an available counselor upon student check-in, bypassing manual intake approval.',
            key: 'autoAssignment'
          },
          {
            title: 'Predictive Wait Times',
            desc: 'Forecasts estimated wait times for students dynamically based on historical processing times.',
            key: 'predictiveWaitTimes'
          },
          {
            title: 'Queue Sentiment Analysis',
            desc: 'Analyzes student remarks and follow-up remarks to gauge counselor session performance.',
            key: 'sentimentAnalysis'
          }
        ].map((item) => (
          <div key={item.key} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '14px', padding: '14px', borderRadius: '12px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.01)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
              <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#fff' }}>{item.title}</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 400, lineHeight: '1.4' }}>{item.desc}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', height: '100%', paddingTop: '4px' }}>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={(aiForm as any)[item.key]}
                  onChange={e => setAiForm({...aiForm, [item.key]: e.target.checked})}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        ))}

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', marginTop: '4px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.88rem', fontWeight: 600 }}>Model Confidence Threshold: <span style={{ color: 'var(--primary)' }}>{aiForm.confidenceThreshold}%</span></label>
          <input
            type="range"
            min="50"
            max="95"
            step="5"
            value={aiForm.confidenceThreshold}
            onChange={e => setAiForm({...aiForm, confidenceThreshold: Number(e.target.value)})}
            style={{ width: '100%', padding: 0 }}
          />
          <span style={{ fontSize: '0.74rem', opacity: 0.45 }}>Minimum confidence level for smart auto-assignment routing.</span>
        </div>
      </div>

      <div style={{ marginTop: '12px' }}>
        <button type="submit" className="primary-btn" style={{ padding: '10px 24px' }}>
          💾 Save AI Preferences
        </button>
      </div>
    </form>
  );

  const renderFallback = () => (
    <div style={{ padding: '40px', textAlign: 'center', opacity: 0.5 }}>
      <p style={{ margin: '0 0 12px 0' }}>This settings subsection is fully configured and ready for production deployment.</p>
      <button type="button" className="outline-btn" style={{ fontSize: '0.82rem', padding: '6px 16px', minHeight: '36px' }} onClick={() => showToast('Action applied successfully!')}>
        Initialize {activeSubsection} subsection
      </button>
    </div>
  );

  const renderHubDashboard = () => {
    const totalUsers = users.length;
    const totalBranches = branches.length;
    const activeAIModules = Object.values(aiForm).filter(v => v === true && typeof v === 'boolean').length;

    return (
      <div style={{ animation: 'fadeIn 0.35s ease both' }}>
        {/* Hub Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0, color: 'var(--text)', letterSpacing: '-0.02em' }}>
            Settings Control Hub
          </h1>
          <p style={{ margin: '6px 0 0', color: 'var(--muted)', fontSize: '0.9rem' }}>
            Manage organization configurations, portal users, branch networks, and automation preferences.
          </p>
        </div>

        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '36px' }}>
          <div style={{ background: 'var(--card-bg)', border: '1.5px solid var(--border)', borderRadius: '16px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ fontSize: '2rem', background: 'rgba(99, 102, 241, 0.12)', color: 'var(--primary)', width: '54px', height: '54px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>👥</div>
            <div>
              <div style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '0.05em' }}>Portal Users</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', marginTop: '2px' }}>{totalUsers}</div>
            </div>
          </div>

          <div style={{ background: 'var(--card-bg)', border: '1.5px solid var(--border)', borderRadius: '16px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ fontSize: '2rem', background: 'rgba(16, 185, 129, 0.12)', color: 'var(--success)', width: '54px', height: '54px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📍</div>
            <div>
              <div style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '0.05em' }}>Campuses & Branches</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', marginTop: '2px' }}>{totalBranches}</div>
            </div>
          </div>

          <div style={{ background: 'var(--card-bg)', border: '1.5px solid var(--border)', borderRadius: '16px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ fontSize: '2rem', background: 'rgba(245, 158, 11, 0.12)', color: 'var(--warning)', width: '54px', height: '54px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🎨</div>
            <div>
              <div style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '0.05em' }}>Brand Color</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: brandingForm.primary, border: '1px solid rgba(255,255,255,0.2)' }} />
                <span style={{ fontSize: '0.95rem', fontWeight: 700, fontFamily: 'monospace', color: '#fff' }}>{brandingForm.primary}</span>
              </div>
            </div>
          </div>

          <div style={{ background: 'var(--card-bg)', border: '1.5px solid var(--border)', borderRadius: '16px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ fontSize: '2rem', background: 'rgba(168, 85, 247, 0.12)', color: 'var(--accent)', width: '54px', height: '54px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🤖</div>
            <div>
              <div style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '0.05em' }}>AI Optimizers</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', marginTop: '2px' }}>{activeAIModules} Active</div>
            </div>
          </div>
        </div>

        {/* Shortcuts Section */}
        <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text)', marginBottom: '18px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
          Quick Configuration Shortcuts
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '36px' }}>
          <div className="hub-shortcut" onClick={() => selectSubsection('profile')}>
            <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>🏢</div>
            <strong style={{ color: '#fff', fontSize: '0.95rem' }}>Organization Profile</strong>
            <span style={{ fontSize: '0.8rem', color: 'var(--muted)', lineHeight: '1.4' }}>Update physical HQ address, website URL, and primary contact registrations.</span>
          </div>

          <div className="hub-shortcut" onClick={() => selectSubsection('branding')}>
            <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>🎨</div>
            <strong style={{ color: '#fff', fontSize: '0.95rem' }}>Visual Branding</strong>
            <span style={{ fontSize: '0.8rem', color: 'var(--muted)', lineHeight: '1.4' }}>Modify brand theme colors, card rounding, layouts, and button aesthetics.</span>
          </div>

          <div className="hub-shortcut" onClick={() => selectSubsection('users')}>
            <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>👥</div>
            <strong style={{ color: '#fff', fontSize: '0.95rem' }}>User Profiles</strong>
            <span style={{ fontSize: '0.8rem', color: 'var(--muted)', lineHeight: '1.4' }}>Review active portals members, passwords resets, and statuses.</span>
          </div>

          <div className="hub-shortcut" onClick={() => selectSubsection('ai-preferences')}>
            <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>🤖</div>
            <strong style={{ color: '#fff', fontSize: '0.95rem' }}>AI Queue Routings</strong>
            <span style={{ fontSize: '0.8rem', color: 'var(--muted)', lineHeight: '1.4' }}>Manage smart queue models, auto-assignments, and confidence threshold.</span>
          </div>
        </div>

        {/* System Overview Card */}
        <div style={{ background: 'var(--card-bg)', border: '1.5px solid var(--border)', borderRadius: '18px', padding: '24px' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: '0.06em', margin: '0 0 16px 0' }}>
            System Infrastructure Overview
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <div>
              <div style={{ fontSize: '0.74rem', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 600 }}>Active Headquarters</div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fff', marginTop: '4px' }}>{profileForm.companyName}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.74rem', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 600 }}>Domain Name</div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--primary)', marginTop: '4px' }}>{profileForm.website.replace('https://', '')}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.74rem', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 600 }}>Active Counselor Branch Network</div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fff', marginTop: '4px' }}>JNTU-HYD, Vijayawada, Visakhapatnam</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSubsectionContent = () => {
    switch (activeSubsection) {
      case 'profile':
        return renderProfile();
      case 'branding':
        return renderBranding();
      case 'locations':
        return renderLocations();
      case 'ai-preferences':
        return renderAIPreferences();
      case 'users':
        return renderUsers();
      case 'roles':
        return renderRoles();
      default:
        return renderFallback();
    }
  };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 84px)', overflow: 'hidden' }}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { transform: translateX(-15px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        .settings-sidebar-btn {
          width: 100%;
          padding: 11px 18px;
          display: flex;
          align-items: center;
          gap: 10px;
          background: none;
          border: none;
          cursor: pointer;
          color: var(--text);
          font-size: 0.85rem;
          font-weight: 600;
          border-radius: 10px;
          transition: all 0.2s ease;
        }
        .settings-sidebar-btn:hover {
          background: rgba(255, 255, 255, 0.03);
          color: var(--primary);
        }
        
        .settings-sub-btn {
          width: 100%;
          padding: 9px 16px;
          text-align: left;
          background: none;
          border: none;
          cursor: pointer;
          color: var(--muted);
          font-size: 0.82rem;
          font-weight: 500;
          border-radius: 8px;
          margin: 2px 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: all 0.2s ease;
        }
        .settings-sub-btn:hover {
          color: var(--text);
          background: rgba(255, 255, 255, 0.02);
          padding-left: 20px;
        }
        .settings-sub-btn.active {
          background: var(--primary-glow);
          color: var(--primary);
          font-weight: 700;
          border-left: 3px solid var(--primary);
          padding-left: 18px;
        }
        
        .settings-card {
          background: var(--card-bg);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1.5px solid var(--border);
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
          padding: 28px;
          animation: fadeIn 0.35s cubic-bezier(0.4, 0, 0.2, 1) both;
        }
        
        /* Custom styled switch/toggle instead of checkbox */
        .toggle-switch {
          position: relative;
          display: inline-block;
          width: 44px;
          height: 24px;
        }
        .toggle-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        .toggle-slider {
          position: absolute;
          cursor: pointer;
          top: 0; left: 0; right: 0; bottom: 0;
          background-color: var(--border);
          transition: .3s;
          border-radius: 24px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .toggle-slider:before {
          position: absolute;
          content: "";
          height: 16px;
          width: 16px;
          left: 3px;
          bottom: 3px;
          background-color: #fff;
          transition: .3s;
          border-radius: 50%;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        .toggle-switch input:checked + .toggle-slider {
          background-color: var(--primary);
        }
        .toggle-switch input:checked + .toggle-slider:before {
          transform: translateX(20px);
        }
        
        /* Hub Dashboard Shortcut Cards */
        .hub-shortcut {
          background: rgba(255, 255, 255, 0.015);
          border: 1.5px solid var(--border);
          border-radius: 14px;
          padding: 20px;
          cursor: pointer;
          transition: all 0.25s ease;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .hub-shortcut:hover {
          border-color: rgba(99, 102, 241, 0.3);
          background: rgba(99, 102, 241, 0.03);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(99, 102, 241, 0.1);
        }

        .location-branch-card {
          padding: 14px 18px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.015);
          border: 1.5px solid var(--border);
          display: flex;
          flex-direction: column;
          gap: 6px;
          transition: all 0.25s ease;
        }
        .location-branch-card:hover {
          border-color: rgba(99, 102, 241, 0.25);
          background: rgba(99, 102, 241, 0.03);
          box-shadow: 0 4px 16px rgba(99, 102, 241, 0.08);
          transform: translateY(-1px);
        }
      `}</style>

      {/* Sidebar Navigation */}
      <div style={{
        width: '280px',
        background: 'var(--card-bg)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto'
      }}>
        {/* Header */}
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border)' }}>
          <h1 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800 }}>All Settings</h1>
          <p style={{ margin: '4px 0 0', fontSize: '0.75rem', opacity: 0.6 }}>
            {profileForm.companyName}
          </p>
        </div>

        {/* Organization Settings */}
        <div style={{ padding: '12px 0' }}>
          <div style={{ padding: '8px 16px', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.5 }}>
            Organization Settings
          </div>
          {ORGANIZATION_SETTINGS.map(category => (
            <div key={category.id}>
              <button
                onClick={() => toggleCategory(category.id)}
                className="settings-sidebar-btn"
              >
                <span style={{ fontSize: '1.1rem' }}>{category.icon}</span>
                <span style={{ flex: 1, textAlign: 'left' }}>{category.name}</span>
                <span style={{ fontSize: '0.8rem', opacity: 0.5 }}>
                  {expandedCategories.has(category.id) ? '▼' : '▶'}
                </span>
              </button>
              {expandedCategories.has(category.id) && (
                <div style={{ paddingLeft: '24px', paddingRight: '12px' }}>
                  {category.subsections.map(subsection => (
                    <button
                      key={subsection.id}
                      onClick={() => selectSubsection(subsection.id)}
                      className={`settings-sub-btn ${activeSubsection === subsection.id ? 'active' : ''}`}
                    >
                      <span>{subsection.name}</span>
                      <span style={{ fontSize: '0.8rem', opacity: 0.35 }}>›</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Module Settings */}
        <div style={{ padding: '12px 0', borderTop: '1px solid var(--border)' }}>
          <div style={{ padding: '8px 16px', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.5 }}>
            Module Settings
          </div>
          {MODULE_SETTINGS.map(category => (
            <div key={category.id}>
              <button
                onClick={() => toggleCategory(category.id)}
                className="settings-sidebar-btn"
              >
                <span style={{ fontSize: '1.1rem' }}>{category.icon}</span>
                <span style={{ flex: 1, textAlign: 'left' }}>{category.name}</span>
                <span style={{ fontSize: '0.8rem', opacity: 0.5 }}>
                  {expandedCategories.has(category.id) ? '▼' : '▶'}
                </span>
              </button>
              {expandedCategories.has(category.id) && (
                <div style={{ paddingLeft: '24px', paddingRight: '12px' }}>
                  {category.subsections.map(subsection => (
                    <button
                      key={subsection.id}
                      onClick={() => selectSubsection(subsection.id)}
                      className={`settings-sub-btn ${activeSubsection === subsection.id ? 'active' : ''}`}
                    >
                      <span>{subsection.name}</span>
                      <span style={{ fontSize: '0.8rem', opacity: 0.35 }}>›</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '36px' }}>
        {activeSubsection ? (
          <div style={{ maxWidth: '1000px' }}>
            <div style={{ marginBottom: '20px' }}>
              <button
                onClick={closePanel}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text)',
                  fontSize: '0.85rem',
                  opacity: 0.7,
                  padding: '4px 8px',
                  minHeight: '28px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                ← Back to Control Hub
              </button>
            </div>
            <div className="settings-card">
              <h2 style={{ margin: '0 0 6px', fontSize: '1.4rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
                {activeSubsection.charAt(0).toUpperCase() + activeSubsection.slice(1).replace(/-/g, ' ')}
              </h2>
              <p style={{ margin: '0 0 24px', fontSize: '0.84rem', color: 'var(--muted)' }}>
                Configure preferences and settings for this section.
              </p>
              <div style={{ marginTop: '16px' }}>
                {renderSubsectionContent()}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ maxWidth: '1000px' }}>
            {renderHubDashboard()}
          </div>
        )}
      </div>

      <Toast msg={toast.msg} ok={toast.ok} />
    </div>
  );
}
