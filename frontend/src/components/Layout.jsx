import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSync } from '../context/SyncContext';
import {
  LayoutDashboard, Users, Home, UserCheck, Accessibility, Vote,
  FileText, Scale, BookOpen, AlertTriangle, Building2, Shield,
  Heart, Map, Bot, Link2, BarChart3, Settings,
  ChevronRight, LogOut, Wifi, WifiOff, RefreshCw,
  Menu, X, Bell, User, ClipboardList, Calendar,
  BrainCircuit
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
      { icon: FileText,      label: 'Issue Certificate', path: '/certifications',  roles: ['Admin','Secretary'] },
      { icon: ClipboardList, label: 'Issuance Logs',     path: '/issuance-logs',  roles: ['Admin','Secretary'] },
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
      { icon: Map,   label: 'Tanod GPS Tracking', path: '/tracking', roles: ['Admin','Secretary'] },
      { icon: Bot,   label: 'Decision Support',   path: '/dss',      roles: ['Admin','Secretary'] },
      { icon: BrainCircuit, label: 'AI Predictive Analytics', path: '/ai-analytics', roles: ['Admin','Secretary'] },
      { icon: Link2, label: 'Blockchain Audit',   path: '/audit',    roles: ['Admin'] },
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
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [openGroups, setOpenGroups] = useState({});

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
      {/* ========== SIDEBAR ========== */}
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
        {/* Header */}
        <div className="sidebar-header">
          <div className="sidebar-logo">🏛️</div>
          {!collapsed && (
            <div style={{ overflow: 'hidden' }}>
              <div className="sidebar-title">Barangay MIS</div>
              <div className="sidebar-sub">Mamburao, Occ. Mindoro</div>
            </div>
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
                  title={collapsed ? item.label : ''}>
                  <item.icon size={17} className="nav-item-icon" />
                  {!collapsed && <span className="nav-item-label">{item.label}</span>}
                </NavLink>
              ));
            }

            const isOpen = openGroups[group.label];

            return (
              <div key={group.label}>
                {!collapsed && <div className="nav-group-label">{group.label}</div>}

                {visibleItems.map((item) => {
                  const isActive = location.pathname.startsWith(item.path);
                  return (
                    <NavLink key={item.path} to={item.path}
                      className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                      title={collapsed ? item.label : ''}>
                      <item.icon size={16} className="nav-item-icon" />
                      {!collapsed && (
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
          <div className="sidebar-user">
            <div className="sidebar-avatar">
              {user?.name?.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase() || 'U'}
            </div>
            {!collapsed && (
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
          <button onClick={() => setCollapsed(!collapsed)}
            className="btn-icon" title="Toggle Sidebar">
            {collapsed ? <Menu size={18} /> : <X size={18} />}
          </button>

          <span className="topbar-title">{currentPageName()}</span>

          {/* Online/Offline Badge */}
          <div className={`online-badge ${isOnline ? 'online' : 'offline'}`}>
            {isOnline ? <Wifi size={13} /> : <WifiOff size={13} />}
            {isOnline ? 'Online' : 'Offline'}
            {!isOnline && syncStats.pending > 0 && (
              <span style={{ marginLeft: '0.25rem', background: '#dc2626', color: '#fff', borderRadius: 100, padding: '0 0.4rem', fontSize: '0.65rem' }}>
                {syncStats.pending} pending
              </span>
            )}
          </div>

          {/* User avatar shortcut */}
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
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
