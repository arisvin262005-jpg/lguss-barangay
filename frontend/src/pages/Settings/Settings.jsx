import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Users, Building, Settings, UserPlus, X, Save, Shield,
  CheckCircle2, XCircle, Clock, RefreshCw, AlertTriangle, Info,
  Eye, EyeOff, User, Mail, MapPin, Calendar, Trash2, ChevronRight
} from 'lucide-react';
import { BARANGAYS, BARANGAY_NAMES, MUNICIPALITY } from '../../config/barangays';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user, hasRole } = useAuth();
  const [tab, setTab] = useState('pending');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', barangay: '', role: 'Secretary', password: '' });
  const [saving, setSaving] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [actionLoading, setActionLoading] = useState({});

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/auth/users');
      setUsers(data.data || data || []);
    } catch {
      toast.error('Failed to load users.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const pendingUsers  = users.filter(u => !u.isVerified && u.role !== 'Admin');
  const activeUsers   = users.filter(u => u.isVerified);

  const handleApprove = async (u) => {
    setActionLoading(prev => ({ ...prev, [u.id]: 'approving' }));
    try {
      await api.post(`/auth/approve/${u.id}`);
      toast.success(`✅ ${u.firstName} ${u.lastName} approved and can now log in.`);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Approval failed.');
    } finally {
      setActionLoading(prev => ({ ...prev, [u.id]: null }));
    }
  };

  const handleReject = async (u, isActive = false) => {
    const label = isActive ? 'remove' : 'reject';
    if (!window.confirm(`${isActive ? 'Remove' : 'Reject'} account of ${u.firstName} ${u.lastName}? This cannot be undone.`)) return;
    setActionLoading(prev => ({ ...prev, [u.id]: 'rejecting' }));
    try {
      await api.delete(`/auth/users/${u.id}`);
      toast.success(`Account of ${u.firstName} ${u.lastName} has been ${label}ed.`);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Action failed.');
    } finally {
      setActionLoading(prev => ({ ...prev, [u.id]: null }));
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      // Admin directly creates accounts that are pre-approved
      await api.post('/auth/register', { ...form, role: 'Secretary' });
      // Auto-approve the directly created account
      const { data: allUsers } = await api.get('/auth/users');
      const newUser = (allUsers.data || allUsers).find(u => u.email === form.email);
      if (newUser) await api.post(`/auth/approve/${newUser.id}`);
      toast.success(`Secretary account for ${form.firstName} ${form.lastName} created and approved.`);
      fetchUsers();
      setModal(null);
      setForm({ firstName: '', lastName: '', email: '', barangay: '', role: 'Secretary', password: '' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create account.');
    } finally { setSaving(false); }
  };

  const TABS = [
    { key: 'pending',   icon: Clock,     label: 'Pending Approvals', badge: pendingUsers.length },
    { key: 'users',     icon: Users,     label: 'User Management' },
    { key: 'barangay',  icon: Building,  label: 'Barangay Profiles' },
    { key: 'system',    icon: Settings,  label: 'System Info' },
  ];

  return (
    <div style={{ maxWidth: 1100 }}>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <div className="page-title">System Administration</div>
          <div className="page-subtitle">Manage user accounts, approve Secretaries, and configure system settings</div>
        </div>
        {tab === 'users' && (
          <button className="btn btn-primary" onClick={() => setModal('user')}>
            <UserPlus size={16} /> Add Secretary Account
          </button>
        )}
      </div>

      {/* Tab Bar */}
      <div className="tab-bar" style={{ marginBottom: '1.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        {TABS.map(({ key, icon: Icon, label, badge }) => (
          <button
            key={key}
            className={`tab-btn${tab === key ? ' active' : ''}`}
            onClick={() => setTab(key)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', position: 'relative' }}
          >
            <Icon size={15} />
            {label}
            {badge > 0 && (
              <span style={{ background: '#dc2626', color: '#fff', borderRadius: 100, padding: '0.05rem 0.45rem', fontSize: '0.68rem', fontWeight: 800, minWidth: 18, textAlign: 'center', lineHeight: 1.6 }}>
                {badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── PENDING APPROVALS TAB ── */}
      {tab === 'pending' && (
        <div>
          {pendingUsers.length === 0 ? (
            <div className="gov-card gov-card-body" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
              <CheckCircle2 size={56} color="#16a34a" style={{ marginBottom: '1rem', opacity: 0.7 }} />
              <div style={{ fontWeight: 800, fontSize: '1.2rem', color: '#334155', marginBottom: '0.5rem' }}>No Pending Approvals</div>
              <div style={{ color: '#64748b', fontSize: '0.9rem' }}>All Secretary registration requests have been processed.</div>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem 1.125rem', background: 'rgba(217,119,6,0.08)', border: '1px solid rgba(217,119,6,0.25)', borderRadius: 12, marginBottom: '1.5rem' }}>
                <AlertTriangle size={18} color="#d97706" />
                <div style={{ fontSize: '0.85rem', color: '#92400e', fontWeight: 600 }}>
                  <strong>{pendingUsers.length} account{pendingUsers.length > 1 ? 's' : ''}</strong> awaiting your approval. Review each request before granting system access.
                </div>
                <button onClick={fetchUsers} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#92400e', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 700, fontSize: '0.8rem' }}>
                  <RefreshCw size={14} /> Refresh
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {pendingUsers.map(u => (
                  <div key={u.id} className="gov-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap', border: '2px solid rgba(217,119,6,0.2)', background: 'rgba(255,251,235,0.5)' }}>
                    {/* Avatar */}
                    <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg, #d97706, #f59e0b)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.1rem', flexShrink: 0 }}>
                      {`${u.firstName?.[0] || ''}${u.lastName?.[0] || ''}`.toUpperCase()}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ fontWeight: 800, fontSize: '1rem', color: '#1e293b', marginBottom: '0.25rem' }}>
                        {u.firstName} {u.lastName}
                        <span style={{ marginLeft: '0.6rem', background: '#fef3c7', color: '#92400e', borderRadius: 6, padding: '0.1rem 0.5rem', fontSize: '0.7rem', fontWeight: 800, verticalAlign: 'middle' }}>PENDING</span>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', fontSize: '0.8rem', color: '#475569' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Mail size={13} />{u.email}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><MapPin size={13} />{u.barangay || '—'}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Calendar size={13} />{u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '0.75rem', flexShrink: 0 }}>
                      <button
                        onClick={() => handleApprove(u)}
                        disabled={!!actionLoading[u.id]}
                        className="btn btn-primary"
                        style={{ background: 'linear-gradient(90deg, #16a34a, #22c55e)', border: 'none', padding: '0.6rem 1.25rem', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                      >
                        {actionLoading[u.id] === 'approving' ? <div className="animate-spin" style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} /> : <CheckCircle2 size={15} />}
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(u, false)}
                        disabled={!!actionLoading[u.id]}
                        className="btn"
                        style={{ background: '#fff', border: '1.5px solid #dc2626', color: '#dc2626', padding: '0.6rem 1.25rem', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', borderRadius: 8 }}
                      >
                        {actionLoading[u.id] === 'rejecting' ? <div className="animate-spin" style={{ width: 14, height: 14, border: '2px solid rgba(220,38,38,0.3)', borderTopColor: '#dc2626', borderRadius: '50%' }} /> : <XCircle size={15} />}
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── USER MANAGEMENT TAB ── */}
      {tab === 'users' && (
        <div>
          <div className="gov-card" style={{ overflow: 'hidden' }}>
            {loading ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                <div className="animate-spin" style={{ width: 32, height: 32, border: '3px solid #e2e8f0', borderTopColor: '#1a4f8a', borderRadius: '50%', margin: '0 auto 1rem' }} />
                Loading users...
              </div>
            ) : (
              <table className="gov-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Barangay</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th style={{ textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.filter(u => u.role !== 'Admin' || user?.role === 'Admin').map(u => (
                    <tr key={u.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: u.role === 'Admin' ? 'linear-gradient(135deg,#1a4f8a,#0ea5e9)' : 'linear-gradient(135deg,#475569,#94a3b8)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 900, flexShrink: 0 }}>
                            {`${u.firstName?.[0] || ''}${u.lastName?.[0] || ''}`.toUpperCase()}
                          </div>
                          <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{u.firstName} {u.lastName}</span>
                        </div>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: '#475569' }}>{u.email}</td>
                      <td><span className="badge badge-blue" style={{ fontSize: '0.68rem' }}>{u.barangay || '—'}</span></td>
                      <td>
                        <span className={`badge ${u.role === 'Admin' ? 'badge-red' : 'badge-blue'}`} style={{ fontSize: '0.68rem' }}>
                          {u.role}
                        </span>
                      </td>
                      <td>
                        {u.isVerified
                          ? <span className="badge badge-green" style={{ fontSize: '0.65rem' }}>✓ Active</span>
                          : <span className="badge badge-yellow" style={{ fontSize: '0.65rem' }}>⏳ Pending</span>
                        }
                      </td>
                      <td style={{ fontSize: '0.75rem', color: '#64748b' }}>{u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-PH') : '—'}</td>
                      <td style={{ textAlign: 'center' }}>
                        {u.role !== 'Admin' && (
                          <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
                            {!u.isVerified && (
                              <button onClick={() => handleApprove(u)} disabled={!!actionLoading[u.id]} title="Approve" style={{ background: '#dcfce7', border: 'none', borderRadius: 6, padding: '0.35rem 0.6rem', cursor: 'pointer', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 700, fontSize: '0.75rem' }}>
                                <CheckCircle2 size={13} /> Approve
                              </button>
                            )}
                            <button onClick={() => handleReject(u, u.isVerified)} disabled={!!actionLoading[u.id]} title="Remove" style={{ background: '#fee2e2', border: 'none', borderRadius: 6, padding: '0.35rem 0.6rem', cursor: 'pointer', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 700, fontSize: '0.75rem' }}>
                              <Trash2 size={13} /> Remove
                            </button>
                          </div>
                        )}
                        {u.role === 'Admin' && <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>System Admin</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <div style={{ marginTop: '0.75rem', fontSize: '0.78rem', color: '#94a3b8', fontWeight: 500 }}>
            Total: {users.length} accounts • {activeUsers.length} active • {pendingUsers.length} pending
          </div>
        </div>
      )}

      {/* ── BARANGAY PROFILES TAB ── */}
      {tab === 'barangay' && (
        <div>
          <div className="alert alert-info" style={{ marginBottom: '1.25rem' }}>
            <Shield size={15} />Official profiles of all covered barangays of Mamburao. Captain and Secretary details are used in official certificates.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {BARANGAYS.map((b, i) => (
              <div key={b.id} className="gov-card" style={{ padding: '1.25rem', display: 'flex', gap: '0.875rem', alignItems: 'flex-start' }}>
                <div style={{ width: 42, height: 42, borderRadius: 9, background: '#1a4f8a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.875rem', flexShrink: 0 }}>
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div>
                  <div style={{ fontWeight: 800, color: '#1a4f8a', marginBottom: '0.25rem' }}>Brgy. {b.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#334155', marginBottom: '0.1rem' }}><span style={{ fontWeight: 700 }}>Kap.</span> {b.captain}</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}><span style={{ fontWeight: 700 }}>Sec.</span> {b.secretary}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── SYSTEM INFO TAB ── */}
      {tab === 'system' && (
        <div className="gov-card gov-card-body">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            {[
              ['System Name', 'Centralized Residents Profiling System (CRPS)'],
              ['Municipality', MUNICIPALITY.name],
              ['Province', MUNICIPALITY.province],
              ['Region', MUNICIPALITY.region],
              ['ZIP Code', MUNICIPALITY.zipCode],
              ['Barangays Covered', `${BARANGAYS.length} Barangays`],
              ['Database', 'In-Memory + Firebase Firestore (Offline-First)'],
              ['Sync Architecture', 'Firebase Real-time Sync + Local JSON fallback'],
              ['Authentication', 'JWT httpOnly Cookie + RBAC'],
              ['Roles', 'Admin (1 singleton) • Secretary (per barangay)'],
              ['Version', 'v2.0 — Extended BIMS Edition'],
              ['DILG Standard', 'BIMS Extension for Mamburao'],
            ].map(([l, v]) => (
              <div key={l}>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 3 }}>{l}</div>
                <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── ADD USER MODAL ── */}
      {modal === 'user' && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal" style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <div className="modal-title">Create Secretary Account</div>
              <button onClick={() => setModal(null)} className="btn-icon"><X size={16} /></button>
            </div>
            <form onSubmit={handleCreateUser}>
              <div className="modal-body">
                {/* Info notice */}
                <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start', background: 'rgba(26,79,138,0.07)', border: '1px solid rgba(26,79,138,0.15)', borderRadius: 10, padding: '0.75rem', marginBottom: '1.25rem' }}>
                  <Info size={15} color="#1a4f8a" style={{ flexShrink: 0, marginTop: 2 }} />
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#334155', lineHeight: 1.6 }}>
                    Accounts created here are <strong>automatically approved</strong>. The Secretary can log in immediately using these credentials.
                  </p>
                </div>

                <div className="grid-2">
                  <div className="form-group"><label className="form-label">First Name *</label><input className="form-input" required value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} /></div>
                  <div className="form-group"><label className="form-label">Last Name *</label><input className="form-input" required value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} /></div>
                </div>
                <div className="form-group"><label className="form-label">Email Address *</label><input className="form-input" type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Barangay *</label>
                    <select className="form-select" required value={form.barangay} onChange={e => setForm({ ...form, barangay: e.target.value })}>
                      <option value="">Select Barangay</option>
                      {BARANGAY_NAMES.map(b => <option key={b}>{b}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">System Role</label>
                    <div className="form-input" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(26,79,138,0.05)', cursor: 'default' }}>
                      <span>📋</span><span style={{ fontWeight: 700, color: '#1a4f8a' }}>Secretary</span>
                    </div>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Temporary Password *</label>
                  <div style={{ position: 'relative' }}>
                    <input className="form-input" type={showPwd ? 'text' : 'password'} required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Min. 8 characters" style={{ paddingRight: '2.5rem' }} />
                    <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                      {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <div className="animate-spin" style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} /> : <Save size={14} />}
                  {saving ? 'Creating...' : 'Create & Approve Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
