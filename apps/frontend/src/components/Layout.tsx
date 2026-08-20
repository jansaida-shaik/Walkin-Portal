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
