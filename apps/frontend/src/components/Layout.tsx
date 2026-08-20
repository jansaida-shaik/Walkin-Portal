'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, ReactNode } from 'react';
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

  const hideNav = pathname === '/login' || pathname === '/walkin-form';

  // Hotkey listener for Command Palette (⌘K or Ctrl+K) and Escape key
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
    <div className={`portal-shell ${hideNav ? 'no-sidebar' : ''} ${sidebarCollapsed ? 'collapsed' : ''}`} style={{
      gridTemplateColumns: hideNav ? '1fr' : sidebarCollapsed ? 'var(--sidebar-collapsed-width) 1fr' : 'var(--sidebar-width) 1fr'
    }}>
      {/* Sidebar navigation */}
      {!hideNav && (
        <aside className={`sidebar ${menuOpen ? 'open' : ''}`} style={{
          width: sidebarCollapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)',
          overflowX: 'hidden'
        }}>
          {/* Logo container */}
          <div className="sidebar-brand" style={{ display: 'flex', alignItems: 'center', justifyContent: sidebarCollapsed ? 'center' : 'flex-start' }}>
            {!sidebarCollapsed ? (
              <img
                src="/Complete website logo.png"
                alt="Organization Logo"
                className="sidebar-logo-full"
                style={{ maxHeight: '36px', width: 'auto' }}
              />
            ) : (
              <div style={{
                width: 36, height: 36, borderRadius: '10px',
                background: 'var(--accent-gradient)', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontWeight: 900, color: '#fff', fontSize: '0.95rem',
                flexShrink: 0, letterSpacing: '-0.02em'
              }}>C</div>
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
                className="outline-btn"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                style={{
                  width: '100%', height: '36px', minHeight: '36px', padding: '0 10px',
                  display: 'flex', alignItems: 'center', justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                  gap: '8px', fontSize: '0.8rem', fontWeight: 700
                }}
                title={sidebarCollapsed ? 'Expand navigation' : 'Collapse navigation'}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14" strokeLinecap="round" strokeLinejoin="round"
                  style={{ transform: sidebarCollapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.25s ease', flexShrink: 0 }}>
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
                <div className="user-info">
                  <div className="user-details">
                    <span className="user-name">{user.name}</span>
                    <span className="user-role">{user.role}</span>
                  </div>
                  <button type="button" className="profile-menu" onClick={handleLogout} aria-label="Logout" title="Click to log out">
                    <span className="user-photo">{user.name?.charAt(0).toUpperCase() || 'U'}</span>
                    <span>⌄</span>
                  </button>
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
        <div className="command-palette-container" onClick={(e) => e.stopPropagation()} style={{ padding: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', borderBottom: '1px solid var(--border)', paddingBottom: 'var(--space-3)' }}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" width="20" height="20" style={{ color: 'var(--primary)' }}>
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.3-4.3" />
            </svg>
            <input
              type="text"
              placeholder="Search leads, counselors, or enter commands (e.g. > new)..."
              style={{ border: 'none', background: 'transparent', width: '100%', fontSize: '0.95rem', color: 'var(--text)', outline: 'none' }}
              disabled={!isCommandPaletteOpen}
              autoFocus
            />
            <span style={{ fontSize: '0.72rem', background: 'var(--surface-alt)', padding: '3px 8px', borderRadius: '4px', border: '1px solid var(--border)', color: 'var(--muted)', fontWeight: 700 }}>ESC</span>
          </div>
          
          {/* Static placeholders detailing how index results will behave in Phase 4 */}
          <div style={{ marginTop: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 800, color: 'var(--muted)', letterSpacing: '0.04em' }}>Quick Actions</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <button
                type="button"
                onClick={() => { setIsCommandPaletteOpen(false); router.push('/walkins'); }}
                style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', textAlign: 'left', fontSize: '0.84rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}
                className="outline-btn"
              >
                <span>➕ Register Walk-in</span>
                <span style={{ opacity: 0.5 }}>&gt; new</span>
              </button>
            </div>
          </div>
        </div>
      </div>    </div>
  );
}
