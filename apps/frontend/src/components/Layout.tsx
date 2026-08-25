'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, useRef, ReactNode } from 'react';
import { logout } from '../actions/authActions';
import { SessionUser } from '../lib/auth';
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
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  
  // Phase 2 foundations: Command palette state
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
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
    const nextTheme = savedTheme === 'light' ? 'light' : 'dark';
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
        <aside className={`sidebar overflow-x-hidden ${menuOpen ? 'open' : ''}`} style={{ width: sidebarCollapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)' }}>
          {/* Logo container */}
          <div className={`sidebar-brand flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-start'}`}>
            {!sidebarCollapsed ? (
              <img
                src="/Complete website logo.png"
                alt="Organization Logo"
                className="sidebar-logo-full max-h-9 w-auto"
              />
            ) : (
              <div className="w-9 h-9 rounded-[10px] bg-[var(--accent-gradient)] flex items-center justify-center font-black text-white text-[0.95rem] shrink-0 tracking-tight">C</div>
            )}
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

          {/* Sidebar Collapse Toggle Button */}
          {!hideNav && (
            <div className="sidebar-footer">
              <button
                type="button"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className={`outline-btn w-full h-9 min-h-9 px-2.5 flex items-center gap-2 text-[0.8rem] font-bold ${sidebarCollapsed ? 'justify-center' : 'justify-start'}`}
                title={sidebarCollapsed ? 'Expand navigation' : 'Collapse navigation'}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14" strokeLinecap="round" strokeLinejoin="round"
                  className={`shrink-0 transition-transform duration-250 ease-in-out ${sidebarCollapsed ? 'rotate-180' : ''}`}>
                  <path d="M15 18l-6-6 6-6" />
                </svg>
                {!sidebarCollapsed && <span>Collapse</span>}
              </button>
            </div>
          )}
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
              {/* Centralized Search triggers */}
              <button
                type="button"
                className="search-input"
                onClick={() => setIsCommandPaletteOpen(true)}
                title="Search or perform actions (⌘K)"
              >
                <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" width="16" height="16">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.3-4.3" />
                </svg>
                <span>Search (⌘K)</span>
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

      {/* ─── Global Command Palette Foundation Overlay ──────────────── */}
      <div className={`command-palette-overlay ${isCommandPaletteOpen ? 'open' : ''}`} onClick={() => setIsCommandPaletteOpen(false)}>
        <div className="command-palette-container p-4" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-3 border-b border-[var(--border)] pb-3">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" width="20" height="20" className="text-[var(--primary)] shrink-0">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.3-4.3" />
            </svg>
            <input
              type="text"
              placeholder="Search leads, counselors, or enter commands (e.g. > new)..."
              className="border-none bg-transparent w-full text-[0.95rem] text-[var(--text)] outline-none"
              disabled={!isCommandPaletteOpen}
              autoFocus
            />
            <span className="text-[0.72rem] bg-[var(--surface-alt)] px-2 py-0.5 rounded border border-[var(--border)] text-[var(--muted)] font-bold">ESC</span>
          </div>
          
          {/* Static placeholders detailing how index results will behave in Phase 4 */}
          <div className="mt-4 flex flex-col gap-2">
            <div className="text-[0.72rem] uppercase font-extrabold text-[var(--muted)] tracking-wider">Quick Actions</div>
            <div className="flex flex-col gap-1">
              <button
                type="button"
                onClick={() => { setIsCommandPaletteOpen(false); router.push('/walkins'); }}
                className="outline-btn w-full px-2.5 py-2 rounded-md text-left text-[0.84rem] cursor-pointer flex justify-between"
              >
                <span>➕ Register Walk-in</span>
                <span className="opacity-50">&gt; new</span>
              </button>
            </div>
          </div>
        </div>
      </div>    </div>
  );
}
