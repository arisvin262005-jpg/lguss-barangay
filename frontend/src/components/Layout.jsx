import { useState, useEffect, useCallback } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSync } from '../context/SyncContext';
import { usePWA } from '../context/PWAContext';
import SmartSearch from './SmartSearch';
import {
  LayoutDashboard, Users, Home, UserCheck, Accessibility, Vote,
  FileText, Scale, BookOpen, AlertTriangle, Building2, Shield,
  Heart, Bot, BarChart3, Settings,
  ChevronRight, LogOut, Wifi, WifiOff, RefreshCw,
  Menu, X, Bell, User, ClipboardList, Calendar,
  BrainCircuit, Download, Gift, Stethoscope, DollarSign,
  FileCheck, Megaphone, Zap, TrendingUp, QrCode
} from 'lucide-react';

// Admin = LGU monitoring & system control | Secretary = barangay operations (data entry)
const ROLES = { ADMIN: 'Admin', SEC: 'Secretary' };

const NAV_GROUPS = [
  // ── ADMIN (LGU / CRPS): monitor all barangays, approve users, watch sync ──
  {
    label: 'LGU Monitoring',
    roles: [ROLES.ADMIN],
    items: [
      { icon: LayoutDashboard, label: 'Municipal Dashboard',   path: '/dashboard',    roles: [ROLES.ADMIN] },
      { icon: BarChart3,       label: 'Reports & Analytics',   path: '/reports',      roles: [ROLES.ADMIN] },
      { icon: BrainCircuit,    label: 'AI Insights & Forecasts', path: '/ai-analytics', roles: [ROLES.ADMIN] },
    ]
  },
  {
    label: 'System Administration',
    roles: [ROLES.ADMIN],
    items: [
      { icon: Settings,  label: 'User Approvals & Settings', path: '/settings', roles: [ROLES.ADMIN] },
      { icon: RefreshCw, label: 'Sync Monitor',              path: '/sync',     roles: [ROLES.ADMIN] },
    ]
  },

  // ── SECRETARY: daily barangay encoding & issuances ──
  {
    label: null,
    roles: [ROLES.SEC],
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', roles: [ROLES.SEC] },
      { icon: QrCode,          label: '📷 QR Code Scanner', path: '/residents?scan=true', roles: [ROLES.SEC] },
    ]
  },
  {
    label: 'Inhabitants',
    roles: [ROLES.SEC],
    items: [
      { icon: Home,          label: 'Household Records',  path: '/households',      roles: [ROLES.SEC] },
      { icon: Users,         label: 'Resident Profiling', path: '/residents',       roles: [ROLES.SEC] },
      { icon: UserCheck,     label: 'Senior Citizens',    path: '/senior-citizens', roles: [ROLES.SEC] },
      { icon: Accessibility, label: 'PWD Registry',       path: '/pwd',             roles: [ROLES.SEC] },
      { icon: Vote,          label: 'Voter Registry',     path: '/voters',          roles: [ROLES.SEC] },
    ]
  },
  {
    label: 'Issuances',
    roles: [ROLES.SEC],
    items: [
      { icon: FileText, label: 'Certifications', path: '/certifications', roles: [ROLES.SEC] },
    ]
  },
  {
    label: 'Katarungang Pambarangay',
    roles: [ROLES.SEC],
    items: [
      { icon: Scale,    label: 'Case List',        path: '/cases',    roles: [ROLES.SEC] },
      { icon: Calendar, label: 'Hearing Schedule', path: '/hearings', roles: [ROLES.SEC] },
    ]
  },
  {
    label: 'Legislation',
    roles: [ROLES.SEC],
    items: [
      { icon: BookOpen, label: 'Ordinances & Resolutions', path: '/legislation', roles: [ROLES.SEC] },
    ]
  },
  {
    label: 'Incidents & Complaints',
    roles: [ROLES.SEC],
    items: [
      { icon: AlertTriangle, label: 'File & Track Complaints', path: '/incidents', roles: [ROLES.SEC] },
    ]
  },
  {
    label: 'Asset & Infrastructure',
    roles: [ROLES.SEC],
    items: [
      { icon: Building2, label: 'Barangay Assets', path: '/assets', roles: [ROLES.SEC] },
    ]
  },
  {
    label: 'DRRM & GAD',
    roles: [ROLES.SEC],
    items: [
      { icon: Shield, label: 'DRRM & GAD Programs', path: '/drrm', roles: [ROLES.SEC] },
    ]
  },
  {
    label: 'Smart Tools (AI)',
    roles: [ROLES.SEC],
    items: [
      { icon: BrainCircuit, label: '🤖 AI Decision Support',  path: '/ai-analytics', roles: [ROLES.SEC] },
      { icon: Zap,          label: '✨ AI Document Drafting', path: '/ai-drafting',  roles: [ROLES.SEC] },
      { icon: Bot,          label: '⚙️ Rule-Based DSS',       path: '/dss',          roles: [ROLES.SEC] },
    ]
  },
  {
    label: 'Reports',
    roles: [ROLES.SEC],
    items: [
      { icon: BarChart3, label: 'Reports & Analytics', path: '/reports', roles: [ROLES.SEC] },
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
  const [showProfile, setShowProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ firstName: '', lastName: '', password: '' });
  const [profileSaving, setProfileSaving] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  // Fetch pending approvals count for Admin badge
  const fetchPendingCount = useCallback(async () => {
    if (!hasRole('Admin')) return;
    try {
      const { default: api } = await import('../services/api');
      const { data } = await api.get('/auth/users');
      const allUsers = data.data || data || [];
      setPendingCount(allUsers.filter(u => !u.isVerified && u.role !== 'Admin').length);
    } catch {
      // silent fail — badge just won’t show
    }
  }, [hasRole]);

  useEffect(() => {
    fetchPendingCount();
    // Re-check every 60 seconds
    const interval = setInterval(fetchPendingCount, 60_000);
    return () => clearInterval(interval);
  }, [fetchPendingCount]);

  const handleOpenProfile = () => {
    if (!user) return;
    const parts = (user.name || '').split(' ');
    const firstName = parts[0] || '';
    const lastName = parts.slice(1).join(' ') || '';
    setProfileForm({ firstName, lastName, password: '' });
    setShowProfile(true);
  };

  const handleLogout = async (e) => { 
    if (e) e.stopPropagation(); 
    await logout(); 
    navigate('/login'); 
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    try {
      const { default: api } = await import('../services/api');
      await api.put('/auth/update-profile', profileForm);
      alert('Profile updated successfully! Please log in again to apply changes.');
      await logout();
      navigate('/login');
    } catch (err) {
      alert('Failed to update profile');
    } finally {
      setProfileSaving(false);
    }
  };

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

  const navBasePath = (path) => path.split('?')[0];

  // Auto-open the group that contains the active path
  useEffect(() => {
    const active = {};
    NAV_GROUPS.forEach((g) => {
      if (g.items?.some((i) => location.pathname.startsWith(navBasePath(i.path)))) active[g.label] = true;
    });
    setOpenGroups(active);
  }, [location.pathname]);

  const toggleGroup = (label) => setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));

  const visibleGroups = NAV_GROUPS.filter((g) => {
    if (!g.roles) return true;
    return g.roles.some((r) => hasRole(r));
  });

  const currentPageName = () => {
    for (const g of NAV_GROUPS) {
      for (const item of g.items || []) {
        if (location.pathname.startsWith(navBasePath(item.path))) return item.label;
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
            <div style={{ width: 36, height: 36, borderRadius: 8, background: '#fff', padding: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src="/assets/astig_logo.png" alt="System Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
          </div>
          {(!collapsed || mobileOpen) && (
            <div style={{ overflow: 'hidden' }}>
              <div className="sidebar-title">BeMIS</div>
              <div className="sidebar-sub">Barangay Management & Information</div>
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
                  const isActive = location.pathname.startsWith(navBasePath(item.path));
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
                          {item.path === '/settings' && pendingCount > 0 && (
                            <span className="nav-item-badge" style={{ background: '#dc2626' }}>{pendingCount}</span>
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
          <div className="sidebar-user" onClick={handleOpenProfile} 
               style={{ cursor: 'pointer', justifyContent: collapsed && !mobileOpen ? 'center' : 'flex-start' }} 
               title="Click to edit profile">
            <div className="sidebar-avatar">
              {user?.name?.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase() || 'U'}
            </div>
            {(!collapsed || mobileOpen) && (
              <>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.8rem', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
                  <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.5)' }}>{user?.role} • {user?.barangay?.split(' ')[0]}</div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); handleLogout(); }} title="Logout"
                  style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 6, padding: '0.35rem', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center' }}>
                  <LogOut size={14} />
                </button>
              </>
            )}
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

          <span className="topbar-title hide-mobile">{currentPageName()}</span>

          {/* Smart Search Bar */}
          <SmartSearch />

          {/* Spacer to push items to the right */}
          <div style={{ flex: 1 }} className="hide-mobile" />

          {/* Notification Bell */}
          <button className="btn-icon" title="Notifications" style={{ position: 'relative', marginRight: '0.5rem' }}>
            <Bell size={18} />
            {pendingCount > 0 && (
              <span style={{ position: 'absolute', top: -6, right: -6, background: '#dc2626', color: '#fff', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700 }}>
                {pendingCount}
              </span>
            )}
          </button>

          {/* Online/Offline Badge */}
          <div className={`online-badge ${isOnline ? 'online' : 'offline'}`} 
            style={{ padding: window.innerWidth <= 480 ? '0.3rem 0.4rem' : '0.3rem 0.75rem', flexShrink: 0 }}>
            {isOnline ? <Wifi size={13} /> : <WifiOff size={13} />}
            <span className="hide-mobile">{isOnline ? 'Online' : 'Offline'}</span>
            {!isOnline && syncStats.pending > 0 && (
              <span style={{ marginLeft: '0.25rem', background: '#dc2626', color: '#fff', borderRadius: 100, padding: '0 0.4rem', fontSize: '0.65rem' }}>
                {syncStats.pending}
              </span>
            )}
          </div>

          {/* User avatar shortcut */}
          <div onClick={handleOpenProfile} className="hide-mobile" style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}
            title={`Edit Profile: ${user?.name} (${user?.role})`}>
            {user?.name?.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase() || 'U'}
          </div>
        </header>

        {/* Page Content */}
        <main className="page-content">
          {children}
        </main>
      </div>

      {/* ========== PROFILE EDIT MODAL ========== */}
      {showProfile && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowProfile(false); }}>
          <div className="modal" style={{ maxWidth: 400 }}>
            <div className="modal-header">
              <div className="modal-title">Edit Profile</div>
              <button onClick={() => setShowProfile(false)} className="btn-icon"><X size={16} /></button>
            </div>
            <form onSubmit={handleUpdateProfile}>
              <div className="modal-body">
                <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                  <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 800, margin: '0 auto 0.5rem' }}>
                    {user?.name?.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase() || 'U'}
                  </div>
                  <div style={{ fontWeight: 700, color: '#1e293b' }}>{user?.email}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{user?.role} • {user?.barangay}</div>
                </div>
                <div className="form-group">
                  <label className="form-label">First Name</label>
                  <input className="form-input" value={profileForm.firstName} onChange={e => setProfileForm({ ...profileForm, firstName: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input className="form-input" value={profileForm.lastName} onChange={e => setProfileForm({ ...profileForm, lastName: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">New Password (optional)</label>
                  <input className="form-input" type="password" placeholder="Leave blank to keep current" value={profileForm.password} onChange={e => setProfileForm({ ...profileForm, password: e.target.value })} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowProfile(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={profileSaving}>{profileSaving ? 'Saving...' : 'Save Profile'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
