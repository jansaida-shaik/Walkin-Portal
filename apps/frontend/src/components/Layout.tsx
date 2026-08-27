'use client';

function getInitials(name: string): string {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}



import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, useRef, ReactNode } from 'react';
import { logout } from '../actions/authActions';
import { SessionUser } from '../lib/auth';
import { formatPhoneNumber } from '../lib/formatters';
import { navConfig, NavigationItem } from '../config/navigation';

export interface LayoutProps {
  children: ReactNode;
  user: SessionUser | null;
}

export default function Layout({ children, user }: LayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('light');
  
  // Phase 2 foundations: Command palette state
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchFilter, setSearchFilter] = useState<'all' | 'students' | 'counselors' | 'pages'>('all');
  const [isSearchingLive, setIsSearchingLive] = useState<boolean>(false);
  const [liveStudents, setLiveStudents] = useState<any[]>([]);
  const [liveCounselors, setLiveCounselors] = useState<any[]>([]);

  // Live PostgreSQL Database Search Debouncer
  useEffect(() => {
    if (!isCommandPaletteOpen) {
      setSearchQuery('');
      setLiveStudents([]);
      setLiveCounselors([]);
      setIsSearchingLive(false);
      return;
    }

    const trimmed = searchQuery.trim();
    if (trimmed.length === 0) {
      setLiveStudents([]);
      setLiveCounselors([]);
      setIsSearchingLive(false);
      return;
    }

    setIsSearchingLive(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`);
        if (res.ok) {
          const data = await res.json();
          setLiveStudents(data.students || []);
          setLiveCounselors(data.counselors || []);
        }
      } catch (err) {
        console.error('Live search error:', err);
      } finally {
        setIsSearchingLive(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery, isCommandPaletteOpen]);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState<boolean>(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const profileButtonRef = useRef<HTMLButtonElement>(null);

  const hideNav = pathname === '/login' || pathname === '/walkin-form';

  // Hotkey listener for Command Palette (⌘K or Ctrl+K) and Escape key
    useEffect(() => {
    if (!isProfileDropdownOpen) return;
    const handleDocClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        profileDropdownRef.current && !profileDropdownRef.current.contains(target) &&
        profileButtonRef.current && !profileButtonRef.current.contains(target)
      ) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleDocClick);
    return () => document.removeEventListener('mousedown', handleDocClick);
  }, [isProfileDropdownOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem('walkin-theme');
    const nextTheme = savedTheme === 'dark' ? 'dark' : 'light';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);

    // Apply custom settings values if configured in localStorage
    const savedBranding = localStorage.getItem('walkin-branding');
    if (savedBranding) {
      try {
        const parsed = JSON.parse(savedBranding);
        document.documentElement.style.setProperty('--primary', parsed.primary);
        document.documentElement.style.setProperty('--accent', parsed.accent);
        document.documentElement.style.setProperty('--radius-md', `${parsed.radius}px`);
      } catch (e) {}
    }
  }, []);

  function toggleTheme(): void {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    window.localStorage.setItem('walkin-theme', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  }

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const canAccess = (item: NavigationItem): boolean => {
    if (!user) return false;
    const roleId = user.roleId;
    return item.rolePermissions.includes(roleId);
  };

  // Filter and group routes by their category
  const visibleItems = navConfig.filter((item) => item.visibilityFlags.sidebar && canAccess(item));
  
  const operationsGroup = visibleItems.filter(item => item.category === 'operations');
  const analyticsGroup = visibleItems.filter(item => item.category === 'analytics');
  const configGroup = visibleItems.filter(item => item.category === 'configuration');

  const activeItem = navConfig.find(item => item.href === pathname);

  return (
    <div className={`portal-shell ${hideNav ? 'no-sidebar' : ''} ${sidebarCollapsed ? 'collapsed' : ''}`} style={{ gridTemplateColumns: hideNav ? '1fr' : sidebarCollapsed ? 'var(--sidebar-collapsed-width) 1fr' : 'var(--sidebar-width) 1fr' }}>
      {/* Sidebar navigation */}
      {!hideNav && (
        <aside className={`sidebar ${menuOpen ? 'open' : ''}`} style={{ width: sidebarCollapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)', overflow: 'visible' }}>
          {/* Logo container with Top-Right Circular Toggle */}
          <div className={`sidebar-brand relative flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'}`} style={{ overflow: 'visible' }}>
            {!sidebarCollapsed ? (
              <img
                src="/Complete website logo.png"
                alt="Organization Logo"
                className="sidebar-logo-full w-auto"
                style={{ maxHeight: '42px' }}
              />
            ) : (
              <img
                src="/logo.png"
                alt="Codegnan Logo"
                className="w-auto object-contain"
                style={{ maxHeight: '52px', maxWidth: '52px' }}
              />
            )}

            {/* Circular Collapse Toggle Button on Border */}
            <button
              type="button"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className="sidebar-edge-toggle"
              style={{
                position: 'absolute',
                right: '-13px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                background: 'var(--surface)',
                border: '1.5px solid var(--border)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 60,
                color: 'var(--text)',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--primary)';
                e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
                e.currentTarget.style.boxShadow = '0 4px 12px var(--primary-glow)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.12)';
              }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                width="13"
                height="13"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  transform: sidebarCollapsed ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
          </div>

          {/* Navigation categories */}
          <nav className="sidebar-nav">
            {operationsGroup.length > 0 && (
              <>
                {!sidebarCollapsed && <div className="sidebar-category-title">Operations</div>}
                {operationsGroup.map((item) => (
                  <Link key={item.id} href={item.href} className={pathname === item.href ? 'active' : ''} title={item.label}>
                    <span className="nav-icon-box">
                      <svg className="nav-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d={item.icon} />
                      </svg>
                    </span>
                    {!sidebarCollapsed && <span>{item.label}</span>}
                  </Link>
                ))}
              </>
            )}

            {analyticsGroup.length > 0 && (
              <>
                {!sidebarCollapsed && <div className="sidebar-category-title">Analytics</div>}
                {analyticsGroup.map((item) => (
                  <Link key={item.id} href={item.href} className={pathname === item.href ? 'active' : ''} title={item.label}>
                    <span className="nav-icon-box">
                      <svg className="nav-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d={item.icon} />
                      </svg>
                    </span>
                    {!sidebarCollapsed && <span>{item.label}</span>}
                  </Link>
                ))}
              </>
            )}

            {configGroup.length > 0 && (
              <>
                {!sidebarCollapsed && <div className="sidebar-category-title">Configurations</div>}
                {configGroup.map((item) => (
                  <Link key={item.id} href={item.href} className={pathname === item.href ? 'active' : ''} title={item.label}>
                    <span className="nav-icon-box">
                      <svg className="nav-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d={item.icon} />
                      </svg>
                    </span>
                    {!sidebarCollapsed && <span>{item.label}</span>}
                  </Link>
                ))}
              </>
            )}
          </nav>


        </aside>
      )}

      {/* Main page content area */}
      <div className="portal-content">
        {!hideNav && (
          <header className="portal-header">
            <div className="header-left">
              <button type="button" className="menu-toggle" onClick={() => setMenuOpen((prev) => !prev)}>
                ☰
              </button>
              <div className="header-branding">
                <div className="brand">Walk-In Management Control Center</div>
                <div className="subtitle">
                  {activeItem ? `${activeItem.label} Mode` : 'Queue: Counseling Services'}
                </div>
              </div>
            </div>

            {/* Quick Action search and profile commands */}
            <div className="header-actions">
              {/* Ultra-Modern Global Search Bar Trigger */}
              <button
                type="button"
                className="global-search-trigger"
                onClick={() => setIsCommandPaletteOpen(true)}
                title="Global Search & Quick Actions (⌘K / Ctrl+K)"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '0 10px 0 14px',
                  height: '38px',
                  minHeight: '38px',
                  width: '260px',
                  borderRadius: '9999px',
                  border: '1.5px solid var(--border)',
                  background: 'var(--surface-alt, rgba(255, 255, 255, 0.03))',
                  color: 'var(--muted)',
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--primary)';
                  e.currentTarget.style.boxShadow = '0 0 0 3px var(--primary-glow)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="16" height="16" style={{ color: 'var(--primary)', flexShrink: 0 }}>
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.3-4.3" />
                </svg>
                <span style={{ fontSize: '0.84rem', fontWeight: 500, color: 'var(--muted)', flex: 1, textAlign: 'left' }}>
                  Search anything...
                </span>
                <kbd style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '2px 7px',
                  borderRadius: '6px',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  color: 'var(--text)',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
                  fontFamily: 'inherit',
                  letterSpacing: '0.04em',
                }}>
                  ⌘K
                </kbd>
              </button>

              {/* Settings Icon Link beside Dark Mode */}
              <Link
                href="/settings"
                className={`icon-btn ${pathname === '/settings' ? 'active' : ''}`}
                aria-label="Settings"
                title="System Settings"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textDecoration: 'none',
                  color: pathname === '/settings' ? 'var(--primary)' : 'var(--text)',
                  border: pathname === '/settings' ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                  background: pathname === '/settings' ? 'rgba(99, 102, 241, 0.12)' : 'transparent',
                  boxShadow: pathname === '/settings' ? '0 0 0 2px var(--primary-glow)' : 'none',
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" width="18" height="18" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </Link>

              <button
                type="button"
                className="icon-btn theme-toggle"
                onClick={toggleTheme}
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
              >
                {theme === 'dark' ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" width="18" height="18" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="4" />
                    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" width="18" height="18" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.8A8.5 8.5 0 1111.2 3a6.5 6.5 0 009.8 9.8z" />
                  </svg>
                )}
              </button>

              {user ? (
                <div style={{ position: 'relative' }}>
                  {/* ─── Sleek Unified Profile Trigger Pill ─── */}
                  <button
                    ref={profileButtonRef}
                    type="button"
                    onClick={() => setIsProfileDropdownOpen(prev => !prev)}
                    aria-label="User Profile & Account Menu"
                    aria-expanded={isProfileDropdownOpen}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '9px',
                      padding: '4px 10px 4px 5px',
                      borderRadius: '9999px',
                      background: isProfileDropdownOpen ? 'var(--surface-alt)' : 'rgba(255,255,255,0.03)',
                      border: `1.5px solid ${isProfileDropdownOpen ? 'var(--primary)' : 'var(--border)'}`,
                      cursor: 'pointer',
                      transition: 'all 0.18s ease',
                      boxShadow: isProfileDropdownOpen ? '0 0 0 3px var(--primary-glow)' : 'none',
                    }}
                  >
                    {/* Avatar circle with live online badge */}
                    <div style={{ position: 'relative', width: 32, height: 32, flexShrink: 0 }}>
                      <div style={{
                        width: '100%', height: '100%', borderRadius: '50%',
                        background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                        color: '#ffffff', fontWeight: 800, fontSize: '0.82rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 2px 8px rgba(99,102,241,0.3)',
                      }}>
                        {user.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <span style={{
                        position: 'absolute', bottom: -1, right: -1,
                        width: 9, height: 9, borderRadius: '50%',
                        background: '#10b981', border: '2px solid var(--surface)',
                      }} />
                    </div>

                    {/* Text Details */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left', lineHeight: 1.25 }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text)', whiteSpace: 'nowrap' }}>
                        {user.name}
                      </span>
                      <span style={{ fontSize: '0.67rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        {user.role}
                      </span>
                    </div>

                    {/* Crisp Micro Chevron SVG */}
                    <svg
                      viewBox="0 0 20 20" fill="currentColor" width="13" height="13"
                      style={{
                        color: 'var(--muted)',
                        transform: isProfileDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                      }}
                    >
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>

                  {/* ─── Clean Minimalist Profile Popover ─── */}
                  {isProfileDropdownOpen && (
                    <div
                      ref={profileDropdownRef}
                      style={{
                        position: 'absolute',
                        top: 'calc(100% + 8px)',
                        right: 0,
                        width: '200px',
                        background: 'var(--surface)',
                        border: '1.5px solid var(--border)',
                        borderRadius: '14px',
                        boxShadow: '0 16px 40px -6px rgba(0,0,0,0.22), 0 0 0 1px var(--border)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        zIndex: 1000,
                        padding: '6px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px',
                        animation: 'dropdownFadeIn 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
                      }}
                    >
                      {/* 1. My Profile */}
                      <Link
                        href="/profile"
                        onClick={() => setIsProfileDropdownOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '9px 12px',
                          borderRadius: '8px',
                          fontSize: '0.84rem',
                          fontWeight: 600,
                          color: 'var(--text)',
                          textDecoration: 'none',
                          transition: 'all 0.12s ease',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-alt)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary)' }}>
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                        <span>My Profile</span>
                      </Link>

                      {/* Subtle Divider */}
                      <div style={{ height: '1px', background: 'var(--border)', margin: '3px 4px' }} />

                      {/* 2. Log Out */}
                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          handleLogout();
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '9px 12px',
                          borderRadius: '8px',
                          border: 'none',
                          background: 'transparent',
                          color: '#ef4444',
                          fontSize: '0.84rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          textAlign: 'left',
                          width: '100%',
                          transition: 'all 0.12s ease',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#ef4444' }}>
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                          <polyline points="16 17 21 12 16 7" />
                          <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                        <span>Log Out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link href="/login" className="login-link">
                  Login
                </Link>
              )}
            </div>
          </header>
        )}

        <main className="portal-main">{children}</main>
      </div>

      {/* ─── Global Command Palette Live Real-Time Search Overlay ──────────────── */}
      <div
        className={`command-palette-overlay ${isCommandPaletteOpen ? 'open' : ''}`}
        onClick={() => setIsCommandPaletteOpen(false)}
        style={{
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          background: 'rgba(3, 7, 18, 0.75)',
        }}
      >
        <div
          className="command-palette-container"
          onClick={(e) => e.stopPropagation()}
          style={{
            maxWidth: '680px',
            width: '94%',
            background: 'var(--surface)',
            border: '1.5px solid var(--border)',
            borderRadius: '18px',
            boxShadow: '0 30px 70px -15px rgba(0, 0, 0, 0.6), 0 0 0 1px var(--border)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: '85vh',
          }}
        >
          {/* Top Search Input Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px 20px',
            borderBottom: '1px solid var(--border)',
            background: 'var(--surface)',
            flexShrink: 0,
          }}>
            {isSearchingLive ? (
              <div style={{
                width: 18, height: 18, borderRadius: '50%',
                border: '2px solid var(--primary)',
                borderTopColor: 'transparent',
                animation: 'spin 0.6s linear infinite',
                flexShrink: 0,
              }} />
            ) : (
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.2" width="20" height="20" style={{ color: 'var(--primary)', flexShrink: 0 }}>
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.3-4.3" />
              </svg>
            )}
            <input
              type="text"
              placeholder="Search live students, phone (+91...), counselors, or commands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                border: 'none',
                background: 'transparent',
                width: '100%',
                fontSize: '1.02rem',
                fontWeight: 500,
                color: 'var(--text)',
                outline: 'none',
                fontFamily: 'inherit',
              }}
              disabled={!isCommandPaletteOpen}
              autoFocus
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--muted)', fontSize: '0.9rem', padding: '2px 6px',
                }}
              >
                ✕
              </button>
            )}
            <span style={{
              fontSize: '0.68rem',
              fontWeight: 800,
              background: 'var(--surface-alt)',
              padding: '3px 8px',
              borderRadius: '6px',
              border: '1px solid var(--border)',
              color: 'var(--muted)',
            }}>
              ESC
            </span>
          </div>

          {/* Search Filter Tabs */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            background: 'var(--surface-alt, rgba(255,255,255,0.02))',
            borderBottom: '1px solid var(--border)',
            overflowX: 'auto',
            flexShrink: 0,
          }}>
            {[
              { id: 'all', label: 'All Results' },
              { id: 'students', label: `👥 Live Students (${liveStudents.length})` },
              { id: 'counselors', label: `👤 Counselors (${liveCounselors.length})` },
              { id: 'pages', label: '⚡ Navigation & Actions' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSearchFilter(tab.id as any)}
                style={{
                  padding: '4px 12px',
                  borderRadius: '9999px',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  border: searchFilter === tab.id ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                  background: searchFilter === tab.id ? 'var(--primary-glow, rgba(99, 102, 241, 0.12))' : 'transparent',
                  color: searchFilter === tab.id ? 'var(--primary)' : 'var(--muted)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Results Container */}
          <div className="scroller" style={{ flex: 1, overflowY: 'auto', padding: '14px 16px' }}>

            {/* 1. Live Students / Walk-in Database Matches */}
            {(searchFilter === 'all' || searchFilter === 'students') && liveStudents.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase',
                  letterSpacing: '0.08em', color: 'var(--muted)', padding: '4px 8px 8px 8px',
                }}>
                  <span>Live Student Records ({liveStudents.length})</span>
                  <span style={{ fontSize: '0.64rem', color: 'var(--primary)' }}>PostgreSQL Live</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {liveStudents.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        setIsCommandPaletteOpen(false);
                        router.push(`/walkins/record?studentId=${s.id}`);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        borderRadius: '12px',
                        border: '1px solid transparent',
                        background: 'var(--surface-alt, rgba(255,255,255,0.02))',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.15s ease',
                        width: '100%',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--surface)';
                        e.currentTarget.style.borderColor = 'var(--primary)';
                        e.currentTarget.style.boxShadow = '0 2px 10px rgba(99,102,241,0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'var(--surface-alt, rgba(255,255,255,0.02))';
                        e.currentTarget.style.borderColor = 'transparent';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                        <div style={{
                          width: 34, height: 34, borderRadius: '50%',
                          background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                          color: '#fff', fontWeight: 800, fontSize: '0.8rem',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          {getInitials(s.name)}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text)' }}>
                              {s.name}
                            </span>
                            <span style={{
                              fontFamily: 'var(--font-mono)', fontSize: '0.74rem',
                              color: 'var(--primary)', fontWeight: 700,
                            }}>
                              {formatPhoneNumber(s.phone)}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {s.course} • {s.branchName || 'Main Campus'}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, marginLeft: '12px' }}>
                        <span style={{
                          fontSize: '0.68rem', fontWeight: 800, padding: '2px 8px', borderRadius: '9999px',
                          background: s.status === 'In Session' ? 'rgba(245, 158, 11, 0.15)' : s.status === 'Completed' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(99, 102, 241, 0.15)',
                          color: s.status === 'In Session' ? '#d97706' : s.status === 'Completed' ? '#059669' : '#6366f1',
                          border: '1px solid currentColor',
                        }}>
                          {s.status}
                        </span>
                        <span style={{ fontSize: '0.74rem', color: 'var(--muted)' }}>Open ↵</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 2. Live Counselors / Staff Database Matches */}
            {(searchFilter === 'all' || searchFilter === 'counselors') && liveCounselors.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase',
                  letterSpacing: '0.08em', color: 'var(--muted)', padding: '4px 8px 8px 8px',
                }}>
                  <span>Counselors & Staff ({liveCounselors.length})</span>
                  <span style={{ fontSize: '0.64rem', color: 'var(--primary)' }}>PostgreSQL Live</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {liveCounselors.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setIsCommandPaletteOpen(false);
                        router.push('/counsellors');
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        borderRadius: '12px',
                        border: '1px solid transparent',
                        background: 'var(--surface-alt, rgba(255,255,255,0.02))',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.15s ease',
                        width: '100%',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--surface)';
                        e.currentTarget.style.borderColor = 'var(--primary)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'var(--surface-alt, rgba(255,255,255,0.02))';
                        e.currentTarget.style.borderColor = 'transparent';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: 34, height: 34, borderRadius: '50%',
                          background: 'linear-gradient(135deg, #10b981, #06b6d4)',
                          color: '#fff', fontWeight: 800, fontSize: '0.8rem',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          {getInitials(c.name)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--text)' }}>
                            👤 {c.name}
                          </div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--muted)', marginTop: '1px' }}>
                            {c.email || 'Counselor Team'}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          fontSize: '0.68rem', fontWeight: 800, padding: '2px 8px', borderRadius: '9999px',
                          background: c.status === 'Available' ? 'rgba(16, 185, 129, 0.15)' : c.status === 'Busy' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                          color: c.status === 'Available' ? '#059669' : c.status === 'Busy' ? '#d97706' : '#f43f5e',
                          border: '1px solid currentColor',
                        }}>
                          {c.status || 'Active'}
                        </span>
                        <span style={{ fontSize: '0.74rem', color: 'var(--muted)' }}>View ↵</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Navigation & Actions Group */}
            {(searchFilter === 'all' || searchFilter === 'pages') && (
              <div>
                <div style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted)', padding: '4px 8px 8px 8px' }}>
                  Navigation & Modules
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {[
                    { name: 'Dashboard', href: '/dashboard', icon: '📊', desc: 'Real-time metrics & intake telemetry' },
                    { name: 'Walk-ins Directory', href: '/walkins', icon: '👥', desc: 'All registered student walk-ins' },
                    { name: 'Live Queue', href: '/queue', icon: '📋', desc: 'Token-based waiting & counseling pipeline' },
                    { name: 'Counseling Sessions', href: '/sessions', icon: '🎙️', desc: 'Active and past counseling discussions' },
                    { name: 'Reports & Analytics', href: '/reports', icon: '📈', desc: 'Conversion metrics and pipeline reports' },
                    { name: 'Webhooks Gateway', href: '/webhooks', icon: '⚡', desc: 'Real-time lead integration webhooks' },
                    { name: 'System Settings', href: '/settings', icon: '⚙️', desc: 'Campus branches & team directory' },
                    { name: 'My Profile', href: '/profile', icon: '👤', desc: 'Account security & personal details' },
                  ]
                    .filter((cmd) => {
                      if (!searchQuery) return true;
                      const q = searchQuery.toLowerCase();
                      return cmd.name.toLowerCase().includes(q) || cmd.desc.toLowerCase().includes(q) || cmd.href.toLowerCase().includes(q);
                    })
                    .map((cmd) => (
                      <button
                        key={cmd.href}
                        type="button"
                        onClick={() => {
                          setIsCommandPaletteOpen(false);
                          router.push(cmd.href);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 12px',
                          borderRadius: '10px',
                          border: '1px solid transparent',
                          background: 'transparent',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'all 0.15s ease',
                          width: '100%',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'var(--surface-alt)';
                          e.currentTarget.style.borderColor = 'var(--border)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.borderColor = 'transparent';
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ fontSize: '1.1rem' }}>{cmd.icon}</span>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text)' }}>{cmd.name}</div>
                            <div style={{ fontSize: '0.74rem', color: 'var(--muted)', marginTop: '1px' }}>{cmd.desc}</div>
                          </div>
                        </div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--muted)', fontWeight: 600 }}>Jump to ↵</span>
                      </button>
                    ))}
                </div>

                {/* Quick Actions */}
                <div style={{ marginTop: '14px' }}>
                  <div style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted)', padding: '4px 8px 8px 8px' }}>
                    Quick Actions
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCommandPaletteOpen(false);
                        router.push('/walkins');
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 12px',
                        borderRadius: '10px',
                        background: 'transparent',
                        border: '1px solid transparent',
                        cursor: 'pointer',
                        width: '100%',
                        textAlign: 'left',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--surface-alt)';
                        e.currentTarget.style.borderColor = 'var(--border)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.borderColor = 'transparent';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '1.1rem' }}>➕</span>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text)' }}>Register New Student Walk-in</div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--muted)', marginTop: '1px' }}>Open the student check-in intake dialog</div>
                        </div>
                      </div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--primary)', fontWeight: 700 }}>&gt; new</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        toggleTheme();
                        setIsCommandPaletteOpen(false);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 12px',
                        borderRadius: '10px',
                        background: 'transparent',
                        border: '1px solid transparent',
                        cursor: 'pointer',
                        width: '100%',
                        textAlign: 'left',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--surface-alt)';
                        e.currentTarget.style.borderColor = 'var(--border)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.borderColor = 'transparent';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '1.1rem' }}>🌓</span>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text)' }}>Toggle Dark / Light Theme</div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--muted)', marginTop: '1px' }}>Switch UI visual appearance mode</div>
                        </div>
                      </div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--muted)', fontWeight: 600 }}>Theme</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Empty state when searching and no results */}
            {searchQuery.trim().length > 0 && !isSearchingLive && liveStudents.length === 0 && liveCounselors.length === 0 && searchFilter !== 'pages' && (
              <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--muted)' }}>
                <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>🔍</div>
                <strong style={{ fontSize: '0.94rem', color: 'var(--text)' }}>No matching live records found</strong>
                <p style={{ fontSize: '0.82rem', marginTop: '4px' }}>
                  No students or counselors match "{searchQuery}". Try searching by student name, phone number, or course.
                </p>
              </div>
            )}
          </div>

          {/* Footer Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 18px',
            borderTop: '1px solid var(--border)',
            background: 'var(--surface-alt, rgba(255,255,255,0.02))',
            fontSize: '0.72rem',
            color: 'var(--muted)',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <span><kbd style={{ padding: '1px 5px', borderRadius: '4px', background: 'var(--surface)', border: '1px solid var(--border)' }}>↵</kbd> to open</span>
              <span><kbd style={{ padding: '1px 5px', borderRadius: '4px', background: 'var(--surface)', border: '1px solid var(--border)' }}>ESC</kbd> to close</span>
            </div>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981' }} />
              Live PostgreSQL Indexing
            </span>
          </div>
        </div>
      </div>    </div>
  );
}