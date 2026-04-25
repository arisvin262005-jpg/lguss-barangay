import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSync } from '../context/SyncContext';
import { usePWA } from '../context/PWAContext';
import {
  LayoutDashboard, Users, Home, UserCheck, Accessibility, Vote,
  FileText, Scale, BookOpen, AlertTriangle, Building2, Shield,
  Heart, Bot, BarChart3, Settings,
  ChevronRight, LogOut, Wifi, WifiOff, RefreshCw,
  Menu, X, Bell, User, ClipboardList, Calendar,
  BrainCircuit, Download
} from 'lucide-react';

const NAV_GROUPS = [
  {
    label: null,
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', roles: ['Admin','Secretary'] },
    ]
  },
  {
    label: 'Inhabitants',
    roles: ['Admin','Secretary'],
    items: [
      { icon: Home,         label: 'Household Records',  path: '/households',     roles: ['Admin','Secretary'] },
      { icon: Users,        label: 'Resident Profiling', path: '/residents',      roles: ['Admin','Secretary'] },
      { icon: UserCheck,    label: 'Senior Citizens',    path: '/senior-citizens',roles: ['Admin','Secretary'] },
      { icon: Accessibility,label: 'PWD Registry',       path: '/pwd',            roles: ['Admin','Secretary'] },
      { icon: Vote,         label: 'Voter Registry',     path: '/voters',         roles: ['Admin','Secretary'] },
    ]
  },
  {
    label: 'Issuances',
    roles: ['Admin','Secretary'],
    items: [
      { icon: FileText,      label: 'Certifications', path: '/certifications',  roles: ['Admin','Secretary'] },
    ]
  },
  {
    label: 'Katarungang Pambarangay',
    roles: ['Admin','Secretary'],
    items: [
      { icon: Scale,    label: 'Case List',          path: '/cases',       roles: ['Admin','Secretary'] },
      { icon: Calendar, label: 'Hearing Schedule',   path: '/hearings',    roles: ['Admin','Secretary'] },
    ]
  },
  {
    label: 'Legislation',
    roles: ['Admin','Secretary'],
    items: [
      { icon: BookOpen, label: 'Ordinances & Resolutions', path: '/legislation', roles: ['Admin','Secretary'] },
    ]
  },
  {
    label: 'Incidents & Complaints',
    roles: ['Admin','Secretary'],
    items: [
      { icon: AlertTriangle, label: 'File & Track Complaints', path: '/incidents', roles: ['Admin','Secretary'] },
    ]
  },
  {
    label: 'Asset & Infrastructure',
    roles: ['Admin','Secretary'],
    items: [
      { icon: Building2, label: 'Barangay Assets', path: '/assets', roles: ['Admin','Secretary'] },
    ]
  },
  {
    label: 'DRRM & GAD',
    roles: ['Admin','Secretary'],
    items: [
      { icon: Shield, label: 'DRRM & GAD Programs', path: '/drrm', roles: ['Admin','Secretary'] },
    ]
  },
  {
    label: 'Smart Tools',
    roles: ['Admin','Secretary'],
    items: [
      { icon: Bot,          label: 'Rule-Based Decision Support System', path: '/dss',          roles: ['Admin','Secretary'] },
      { icon: BrainCircuit, label: 'AI Predictive Analytics',            path: '/ai-analytics', roles: ['Admin','Secretary'] },
    ]
  },
  {
    label: 'Reports',
    roles: ['Admin','Secretary'],
    items: [
      { icon: BarChart3, label: 'Reports & Analytics', path: '/reports', roles: ['Admin','Secretary'] },
      { icon: RefreshCw, label: 'Sync Engine',         path: '/sync',    roles: ['Admin','Secretary'] },
    ]
  },
  {
    label: 'Administration',
    roles: ['Admin'],
    items: [
      { icon: Settings, label: 'Settings', path: '/settings', roles: ['Admin'] },
    ]
  },
];

export default function Layout({ children }) {
  const { user, logout, hasRole } = useAuth();
  const { isOnline, syncStats } = useSync();
  const { installPrompt, isInstalled, showInstallPrompt } = usePWA();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState({});

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Handle window resize to reset mobile states
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) setMobileOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-open the group that contains the active path
  useEffect(() => {
    const active = {};
    NAV_GROUPS.forEach((g) => {
      if (g.items?.some((i) => location.pathname.startsWith(i.path))) active[g.label] = true;
    });
    setOpenGroups(active);
  }, [location.pathname]);

  const toggleGroup = (label) => setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));

  const handleLogout = async () => { await logout(); navigate('/login'); };

  const visibleGroups = NAV_GROUPS.filter((g) => {
    if (!g.roles) return true;
    return g.roles.some((r) => hasRole(r));
  });

  const currentPageName = () => {
    for (const g of NAV_GROUPS) {
      for (const item of g.items || []) {
        if (location.pathname.startsWith(item.path)) return item.label;
      }
    }
    return 'Barangay Management System';
  };

  return (
    <div className="app-shell">
      {/* ========== SIDEBAR BACKDROP (Mobile) ========== */}
      {mobileOpen && (
        <div className="sidebar-backdrop" onClick={() => setMobileOpen(false)} />
      )}

      {/* ========== SIDEBAR ========== */}
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        {/* Header */}
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <img src="/logo-crps.png" alt="CRPS" style={{ width: 32, height: 32, objectFit: 'contain' }} />
          </div>
          {(!collapsed || mobileOpen) && (
            <div style={{ overflow: 'hidden' }}>
              <div className="sidebar-title">CRPS System</div>
              <div className="sidebar-sub">Centralized Residents Profiling</div>
            </div>
          )}
          {mobileOpen && (
            <button onClick={() => setMobileOpen(false)} className="show-mobile btn-icon" style={{ marginLeft: 'auto', background: 'transparent', border: 'none', color: '#fff' }}>
              <X size={20} />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {visibleGroups.map((group) => {
            const visibleItems = group.items.filter((item) =>
              item.roles.some((r) => hasRole(r))
            );
            if (visibleItems.length === 0) return null;

            // Single-item group or no label → flat item
            if (!group.label) {
              return visibleItems.map((item) => (
                <NavLink key={item.path} to={item.path}
                  className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                  title={collapsed && !mobileOpen ? item.label : ''}>
                  <item.icon size={17} className="nav-item-icon" />
                  {(!collapsed || mobileOpen) && <span className="nav-item-label">{item.label}</span>}
                </NavLink>
              ));
            }

            const isOpen = openGroups[group.label];

            return (
              <div key={group.label}>
                {(!collapsed || mobileOpen) && <div className="nav-group-label">{group.label}</div>}

                {visibleItems.map((item) => {
                  const isActive = location.pathname.startsWith(item.path);
                  return (
                    <NavLink key={item.path} to={item.path}
                      className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                      title={collapsed && !mobileOpen ? item.label : ''}>
                      <item.icon size={16} className="nav-item-icon" />
                      {(!collapsed || mobileOpen) && (
                        <>
                          <span className="nav-item-label">{item.label}</span>
                          {item.path === '/sync' && syncStats.pending > 0 && (
                            <span className="nav-item-badge">{syncStats.pending}</span>
                          )}
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          {installPrompt && !isInstalled && (!collapsed || mobileOpen) && (
            <button onClick={showInstallPrompt} className="nav-item" style={{ color: '#10b981', marginBottom: '0.5rem' }}>
              <Download size={17} className="nav-item-icon" />
              <span className="nav-item-label">Install App</span>
            </button>
          )}
          <div className="sidebar-user">
            <div className="sidebar-avatar">
              {user?.name?.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase() || 'U'}
            </div>
            {(!collapsed || mobileOpen) && (
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ fontWeight: 600, fontSize: '0.8rem', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
                <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.5)' }}>{user?.role} • {user?.barangay?.split(' ')[0]}</div>
              </div>
            )}
            <button onClick={handleLogout} title="Logout"
              style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 6, padding: '0.35rem', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center' }}>
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* ========== MAIN AREA ========== */}
      <div className="main-area">
        {/* Topbar */}
        <header className="topbar">
          <button onClick={() => {
            if (window.innerWidth <= 768) setMobileOpen(true);
            else setCollapsed(!collapsed);
          }}
            className="btn-icon" title="Toggle Sidebar">
            <Menu size={18} />
          </button>

          <span className="topbar-title">{currentPageName()}</span>

          {/* Online/Offline Badge */}
          <div className={`online-badge ${isOnline ? 'online' : 'offline'}`} 
            style={{ padding: window.innerWidth <= 480 ? '0.3rem 0.4rem' : '0.3rem 0.75rem' }}>
            {isOnline ? <Wifi size={13} /> : <WifiOff size={13} />}
            <span className="hide-mobile">{isOnline ? 'Online' : 'Offline'}</span>
            {!isOnline && syncStats.pending > 0 && (
              <span style={{ marginLeft: '0.25rem', background: '#dc2626', color: '#fff', borderRadius: 100, padding: '0 0.4rem', fontSize: '0.65rem' }}>
                {syncStats.pending}
              </span>
            )}
          </div>

          {/* User avatar shortcut — profile menu placeholder */}
          <div className="hide-mobile" style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
            title={`${user?.name} (${user?.role})`}>
            {user?.name?.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase() || 'U'}
          </div>
        </header>

        {/* Page Content */}
        <main className="page-content">
          {children}
        </main>
      </div>
    </div>
  );
}
