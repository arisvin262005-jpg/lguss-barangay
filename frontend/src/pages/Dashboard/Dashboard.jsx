import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSync } from '../../context/SyncContext';
import api from '../../services/api';
import { usePWA } from '../../context/PWAContext';
import { Users, Home, FileText, Scale, RefreshCw, TrendingUp, Plus, AlertCircle, Wifi, WifiOff, BrainCircuit, Download, MonitorCheck } from 'lucide-react';

const PIE_COLORS = ['#2563a8','#16a34a','#d97706','#dc2626','#7c3aed'];

const StatCard = ({ icon: Icon, label, value, sub, color = '#1a4f8a', loading }) => (
  <div className="stat-card">
    <div className="stat-icon" style={{ background: `${color}14`, border: `1px solid ${color}30` }}>
      <Icon size={20} color={color} />
    </div>
    {loading
      ? <div className="skeleton" style={{ height: 36, width: 80, marginBottom: 6 }} />
      : <div className="stat-value">{value ?? '—'}</div>}
    <div className="stat-label">{label}</div>
    {sub && <div className="stat-sub">{sub}</div>}
  </div>
);

export default function Dashboard() {
  const { user, hasRole } = useAuth();
  const { isOnline, syncStats } = useSync();
  const { installPrompt, isInstalled, showInstallPrompt } = usePWA();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const [integrity, setIntegrity] = useState(null);
  const [offlineStats, setOfflineStats] = useState({ cached: 0, synced: 0 });

  const fetchStats = () => {
    setLoading(true);
    Promise.all([
      api.get('/reports/dashboard-stats'),
      api.get('/audit/verify'),
      api.get('/sync/stats')
    ]).then(([s, v, os]) => {
      setStats(s.data);
      setIntegrity(v.data);
      setOfflineStats(os.data);
    })
    .catch(() => {})
    .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStats();
    // Auto-refresh every 30s for near real-time dashboard
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  // Also refresh when sync completes
  useEffect(() => {
    const onSync = () => fetchStats();
    window.addEventListener('sync-complete', onSync);
    return () => window.removeEventListener('sync-complete', onSync);
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  // Use real data from API — show empty arrays if no data yet (new account)
  const certChartData = stats?.certsByMonth?.length ? stats.certsByMonth : [];
  const caseStatusData = stats?.caseStatus?.filter(c => c.value > 0) || [];
  const ageDistData    = stats?.ageDistribution || [];

  return (
    <div style={{ maxWidth: 1200 }}>
      {/* Page header */}
      <div className="page-header">
        <div>
          <div className="page-title">{greeting}, {user?.name?.split(' ')[0]}! 👋</div>
          <div className="page-subtitle">{user?.barangay} • {user?.role} • {new Date().toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
        </div>
        <div style={{ display: 'flex', gap: '0.625rem', alignItems: 'center' }}>
          {installPrompt && !isInstalled && (
            <button 
              onClick={showInstallPrompt} 
              className="btn btn-primary"
              style={{ background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', boxShadow: '0 4px 12px rgba(16,185,129,0.3)' }}
            >
              <Download size={16} /> Install App
            </button>
          )}
          {hasRole('Admin', 'Secretary') && (
            <>
              <Link to="/residents" className="btn btn-outline btn-sm"><Plus size={14} /> Add Resident</Link>
              <Link to="/cases"     className="btn btn-outline btn-sm"><Plus size={14} /> File Case</Link>
              <Link to="/certifications" className="btn btn-primary btn-sm"><Plus size={14} /> Issue Cert</Link>
            </>
          )}
        </div>
      </div>

      {/* PWA Install Banner (Large) */}
      {installPrompt && !isInstalled && (
        <div className="install-banner" onClick={showInstallPrompt}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div className="install-banner-icon">
              <MonitorCheck size={28} color="#10b981" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#1e293b' }}>Install CRPS on your {window.innerWidth < 768 ? 'Phone' : 'Desktop'}</div>
              <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>Access records instantly even without internet. Guaranteed 100% offline-first performance.</div>
            </div>
          </div>
          <button className="btn btn-primary" style={{ background: '#10b981', whiteSpace: 'nowrap' }}>
            Install Now
          </button>
        </div>
      )}

      {/* AI Insight Shortcut */}
      <div className="gov-card" style={{ marginBottom: '1.25rem', background: 'linear-gradient(90deg, #f8fafc, #eff6ff)', borderLeft: '4px solid #7c3aed', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BrainCircuit size={22} color="#7c3aed" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#1e293b' }}>AI Intelligence Insight</div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
              {stats?.repeatOffenders > 0 
                ? `Detected ${stats.repeatOffenders} potential repeat offenders in KP cases. Mitigation intervention recommended.`
                : 'Neural pattern detection status: Stable. No recurring incident anomalies detected in jurisdiction.'}
            </div>
          </div>
        </div>
        <Link to="/ai-analytics" className="btn btn-outline btn-sm" style={{ borderColor: '#7c3aed', color: '#7c3aed' }}>View Detailed Analysis</Link>
      </div>

      {/* Offline banner */}
      {!isOnline && (
        <div className="alert alert-warning" style={{ marginBottom: '1.25rem' }}>
          <WifiOff size={16} />
          <div>
            <strong>You are currently offline.</strong>
            {' '}All changes are saved locally and will sync when connectivity is restored.
            {syncStats.pending > 0 && <span style={{ marginLeft: 6, fontWeight: 700 }}>{syncStats.pending} records pending sync.</span>}
          </div>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid-responsive" style={{ marginBottom: '1.5rem', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
        <StatCard icon={Users}      label="Total Residents"        value={stats?.residents   ?? 0}    sub="Registered profiles"        color="#1a4f8a" loading={loading} />
        <StatCard icon={Home}       label="Total Households"       value={stats?.households  ?? 0}    sub="Registered households"      color="#7c3aed" loading={loading} />
        <StatCard icon={FileText}   label="Pending Certs"          value={stats?.pendingCerts?? 0}    sub="Awaiting processing"        color="#d97706" loading={loading} />
        <StatCard icon={Scale}      label="Active KP Cases"        value={stats?.activeCases ?? 0}    sub="Under Mediation"            color="#dc2626" loading={loading} />
        <StatCard icon={Shield}     label="System Integrity"       value={integrity?.valid ? 'Verified' : 'Checking...'} sub={`${integrity?.blocks ?? 0} Hashed Blocks`} color={integrity?.valid ? '#10b981' : '#64748b'} loading={loading} />
        <StatCard icon={RefreshCw}  label="Sync Success"           value={`${syncStats.successRate}%`}sub={`${syncStats.pending} Pending Sync`} color={syncStats.successRate>=90?'#16a34a':'#d97706'} loading={false} />
        <StatCard icon={MonitorCheck} label="Offline Capacity"     value={`${offlineStats?.cached ?? 0}`} sub="Locally Secured"           color="#0891b2" loading={loading} />
        <StatCard icon={TrendingUp} label="Certs (Month)"          value={stats?.certThisMonth?? 0}   sub="Issued this month"          color="#0284c7" loading={loading} />
      </div>

      {/* Charts row */}
      <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
        {/* Bar: monthly certs */}
        <div className="gov-card" style={{ gridColumn: window.innerWidth > 1024 ? 'span 2' : 'span 1' }}>
          <div className="gov-card-header"><div className="gov-card-title"><FileText size={16} color="#1a4f8a" />Monthly Certifications Issued</div></div>
          <div style={{ padding: '1.25rem', height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={certChartData} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #dde3ed', fontSize: 12 }} />
                <Bar dataKey="count" fill="#1a4f8a" radius={[4,4,0,0]} name="Certifications" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie: case status */}
        <div className="gov-card">
          <div className="gov-card-header"><div className="gov-card-title"><Scale size={16} color="#1a4f8a" />Case Status</div></div>
          <div style={{ padding: '1rem', height: 220, display: 'flex', alignItems: 'center' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={caseStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={35}>
                  {caseStatusData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Age distribution + Activity feed */}
      <div className="grid-responsive" style={{ gridTemplateColumns: window.innerWidth > 1024 ? '1fr 360px' : '1fr' }}>
        {/* Age bar */}
        <div className="gov-card">
          <div className="gov-card-header"><div className="gov-card-title"><Users size={16} color="#1a4f8a" />Resident Age Distribution</div></div>
          <div style={{ padding: '1.25rem', height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ageDistData} barSize={42}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="group" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #dde3ed', fontSize: 12 }} />
                <Bar dataKey="count" fill="#2563a8" radius={[4,4,0,0]} name="Residents" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activity feed */}
        <div className="gov-card">
          <div className="gov-card-header">
            <div className="gov-card-title"><TrendingUp size={16} color="#1a4f8a" />Recent Activity</div>
            <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Last 10 actions</span>
          </div>
          <div className="gov-card-body" style={{ padding: '0.5rem 0' }}>
            {stats?.recentActivity?.length > 0 ? (
              stats.recentActivity.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', padding: '0.6rem 1.25rem', borderBottom: '1px solid #f8fafc' }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: item.type === 'certification' ? '#16a34a' : item.type === 'case' ? '#dc2626' : item.type === 'auth' ? '#7c3aed' : '#1a4f8a', flexShrink: 0, marginTop: 5 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.78rem', color: '#334155', fontWeight: 500, lineHeight: 1.4 }}>{item.action}</div>
                    <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: 2 }}>{item.user} &bull; {item.time}</div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: '2rem 1.25rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.82rem' }}>
                No activity yet. Start by adding residents or issuing certificates.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
