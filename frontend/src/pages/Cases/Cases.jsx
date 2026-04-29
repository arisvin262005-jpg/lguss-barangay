import { useState, useEffect } from 'react';
import api, { resolveOfflineResponse } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Scale, Plus, Eye, EyeOff, Edit2, X, Save, Calendar, CheckCircle2, Clock, AlertTriangle, FileText, Printer } from 'lucide-react';

const CASE_TYPES = ['Land Dispute','Family Dispute','Debt','Physical Injury','Noise Complaint','Property Damage','Others'];
const STATUS_FLOW = ['Filed','Mediation Scheduled','Under Mediation','Settled','Escalated to Court','Dismissed'];

const STATUS_CONFIG = {
  'Filed':               { color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', icon: FileText },
  'Mediation Scheduled': { color: '#d97706', bg: '#fffbeb', border: '#fcd34d', icon: Calendar },
  'Under Mediation':     { color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe', icon: Clock },
  'Settled':             { color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', icon: CheckCircle2 },
  'Escalated to Court':  { color: '#dc2626', bg: '#fef2f2', border: '#fca5a5', icon: AlertTriangle },
  'Dismissed':           { color: '#64748b', bg: '#f8fafc', border: '#cbd5e1', icon: X },
};

const TIMELINE_STEPS = ['Filed', 'Mediation Scheduled', 'Under Mediation', 'Settled'];

function CaseTimeline({ status }) {
  const currentIdx = TIMELINE_STEPS.indexOf(status);
  const isTerminal = status === 'Escalated to Court' || status === 'Dismissed';

  return (
    <div style={{ margin: '1rem 0' }}>
      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.08em' }}>
        Case Progress
      </div>
      {isTerminal ? (
        <div style={{
          padding: '0.6rem 1rem', borderRadius: 8,
          background: status === 'Escalated to Court' ? '#fef2f2' : '#f8fafc',
          border: `1px solid ${status === 'Escalated to Court' ? '#fca5a5' : '#cbd5e1'}`,
          color: status === 'Escalated to Court' ? '#dc2626' : '#64748b',
          fontSize: '0.82rem', fontWeight: 700,
          display: 'flex', alignItems: 'center', gap: '0.5rem',
        }}>
          {status === 'Escalated to Court' ? '⚠️' : '🚫'}  Case status: {status}
        </div>
      ) : (
        <div className="kp-timeline">
          {TIMELINE_STEPS.map((step, i) => {
            const isDone = currentIdx > i;
            const isActive = currentIdx === i;
            const cfg = STATUS_CONFIG[step] || {};
            return (
              <div key={step} style={{ display: 'flex', alignItems: 'center' }}>
                <div className={`kp-step ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}>
                  <div className="kp-step-circle" style={{
                    background: isDone ? '#16a34a' : isActive ? cfg.color : '#e2e8f0',
                    color: isDone || isActive ? '#fff' : '#94a3b8',
                    border: `2px solid ${isDone ? '#16a34a' : isActive ? cfg.color : '#e2e8f0'}`,
                  }}>
                    {isDone ? '✓' : i + 1}
                  </div>
                  <div className="kp-step-label" style={{
                    color: isDone ? '#16a34a' : isActive ? cfg.color : '#94a3b8',
                    fontWeight: isActive ? 800 : 600,
                  }}>
                    {step}
                  </div>
                </div>
                {i < TIMELINE_STEPS.length - 1 && (
                  <div className={`kp-step-line ${isDone ? 'done' : ''}`} />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SkeletonRow() {
  return (
    <tr>
      {[120, 90, 130, 130, 90, 80, 80, 80].map((w, i) => (
        <td key={i}><div className="skeleton" style={{ height: 14, width: w }} /></td>
      ))}
    </tr>
  );
}

export default function Cases() {
  const { hasRole } = useAuth();
  const [cases, setCases] = useState([]);
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ caseNumber:'', complainantId:'', respondentId:'', caseType:'Land Dispute', description:'', filedDate: new Date().toISOString().split('T')[0] });
  const [hearingForm, setHearingForm] = useState({ hearingDate:'', hearingTime:'09:00', hearingVenue:'', notes:'' });
  const [privacyMode, setPrivacyMode] = useState(true);
  const canEdit = hasRole('Admin', 'Secretary');

  const maskName = (name) => {
    if (!privacyMode) return name;
    if (!name || name === '—') return name;
    const parts = name.split(' ');
    return parts.map(p => p[0] + '*'.repeat(Math.max(0, p.length - 1))).join(' ');
  };

  useEffect(() => {
    Promise.all([
      api.get('/cases').catch(() => ({ data: { data: [] } })),
      api.get('/residents').catch(() => ({ data: { data: [] } })),
    ]).then(([cRes, rRes]) => {
      setCases(cRes.data.data || []);
      setResidents(rRes.data.data || []);
    }).finally(() => setLoading(false));
  }, []);

  const filtered = cases.filter(c => {
    const matchesSearch = `${c.caseNumber} ${c.caseType} ${c.status}`.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'All' || c.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (!selected) {
        const payload = { ...form, ...hearingForm };
        const res = await api.post('/cases', payload);
        const saved = resolveOfflineResponse(res, { ...payload, status: 'Filed', filedDate: payload.filedDate || new Date().toISOString().split('T')[0] });
        setCases(prev => [saved, ...prev]);
      } else {
        const res = await api.put(`/cases/${selected.id}`, { ...form, ...hearingForm });
        const saved = resolveOfflineResponse(res, { ...form, ...hearingForm }, selected.id);
        setCases(prev => prev.map(c => c.id === selected.id ? { ...c, ...saved } : c));
      }
      setModal(null);
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || err.response?.data?.error || 'Failed to save case. Please try again.';
      alert(msg);
    } finally { setSaving(false); }
  };

  const updateStatus = async (id, status) => {
    await api.patch(`/cases/${id}/status`, { status });
    setCases(prev => prev.map(c => c.id === id ? { ...c, status } : c));
    setSelected(prev => prev ? { ...prev, status } : prev);
  };

  const residentName = (id) => {
    const r = residents.find(x => x.id === id);
    return r ? `${r.firstName} ${r.lastName}` : (id || '—');
  };

  const openNew = () => {
    setForm({
      caseNumber: `KP-${new Date().getFullYear()}-${String(cases.length + 1).padStart(3, '0')}`,
      complainantId: '', respondentId: '', caseType: 'Land Dispute',
      description: '', filedDate: new Date().toISOString().split('T')[0],
    });
    setHearingForm({ hearingDate: '', hearingTime: '09:00', hearingVenue: '', notes: '' });
    setSelected(null); setModal('form');
  };

  const openEdit = (c) => {
    setSelected(c); setForm(c);
    setHearingForm({ hearingDate: c.hearingDate || '', hearingTime: c.hearingTime || '09:00', hearingVenue: c.hearingVenue || '', notes: c.notes || '' });
    setModal('form');
  };

  return (
    <div style={{ maxWidth: 1200 }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-title">Katarungang Pambarangay</div>
          <div className="page-subtitle">Case filing, mediation scheduling, and case progress tracking</div>
        </div>
        <div style={{ display: 'flex', gap: '0.625rem', alignItems: 'center' }}>
          <button 
            className={`btn ${privacyMode ? 'btn-primary' : 'btn-outline'}`} 
            onClick={() => setPrivacyMode(!privacyMode)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}
          >
            {privacyMode ? <EyeOff size={14} /> : <Eye size={14} />} 
            {privacyMode ? 'Privacy: ON' : 'Privacy: OFF'}
          </button>
          {canEdit && (
            <button className="btn btn-primary" onClick={openNew} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Plus size={16} /> File New Case
            </button>
          )}
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.25rem' }}>
        {['Filed', 'Under Mediation', 'Settled', 'Escalated to Court'].map(s => {
          const cfg = STATUS_CONFIG[s] || {};
          const Icon = cfg.icon || Scale;
          const count = cases.filter(c => c.status === s).length;
          return (
            <div key={s} className="gov-card" style={{ padding: '1.1rem', borderLeft: `4px solid ${cfg.color}`, cursor: 'pointer' }}
              onClick={() => setFilterStatus(filterStatus === s ? 'All' : s)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '2rem', fontWeight: 900, color: cfg.color, lineHeight: 1.1 }}>{loading ? '—' : count}</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, marginTop: 4 }}>{s}</div>
                </div>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={18} color={cfg.color} />
                </div>
              </div>
              {filterStatus === s && (
                <div style={{ marginTop: 6, fontSize: '0.62rem', fontWeight: 800, color: cfg.color, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  ● Filtered
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Search + Filter */}
      <div className="gov-card" style={{ padding: '0.875rem 1.25rem', marginBottom: '1.25rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <input className="form-input" placeholder="🔍 Search case number, type, or status..." value={search}
          onChange={e => setSearch(e.target.value)} style={{ maxWidth: 320 }} />
        <select className="form-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ maxWidth: 200 }}>
          <option value="All">All Statuses</option>
          {STATUS_FLOW.map(s => <option key={s}>{s}</option>)}
        </select>
        <span style={{ fontSize: '0.78rem', color: '#94a3b8', marginLeft: 'auto', fontWeight: 600 }}>
          {filtered.length} of {cases.length} cases
        </span>
      </div>

      {/* Table */}
      <div className="gov-card" style={{ overflow: 'hidden' }}>
        <table className="gov-table">
          <thead>
            <tr>
              <th>Case No.</th>
              <th>Type</th>
              <th>Complainant</th>
              <th>Respondent</th>
              <th>Status</th>
              <th>Filed Date</th>
              <th>Hearing</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={8}>
                  <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                    <Scale size={40} style={{ opacity: 0.2, display: 'block', margin: '0 auto 1rem' }} />
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>No cases found</div>
                    <div style={{ fontSize: '0.8rem', marginTop: 4 }}>
                      {search ? 'Try a different search term' : 'Click "File New Case" to begin'}
                    </div>
                  </div>
                </td>
              </tr>
            ) : filtered.map(c => {
              const cfg = STATUS_CONFIG[c.status] || { color: '#64748b', bg: '#f8fafc' };
              return (
                <tr key={c.id} onClick={() => { setSelected(c); setModal('view'); }}>
                  <td>
                    <div style={{ fontWeight: 800, color: '#1a4f8a', fontSize: '0.85rem' }}>{c.caseNumber}</div>
                    {c._isOfflineDraft && <span className="offline-draft-badge">📦 Offline Draft</span>}
                  </td>
                  <td style={{ fontSize: '0.82rem', color: '#475569' }}>{c.caseType}</td>
                  <td style={{ fontSize: '0.82rem', fontWeight: 600 }}>{maskName(residentName(c.complainantId))}</td>
                  <td style={{ fontSize: '0.82rem' }}>{maskName(residentName(c.respondentId))}</td>
                  <td>
                    <span style={{
                      display: 'inline-block',
                      padding: '0.2rem 0.65rem',
                      borderRadius: 100,
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      background: cfg.bg,
                      color: cfg.color,
                      border: `1px solid ${cfg.border || cfg.color + '33'}`,
                      whiteSpace: 'nowrap',
                    }}>
                      {c.status}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.78rem', color: '#64748b' }}>{c.filedDate || '—'}</td>
                  <td style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    {c.hearingDate ? `${c.hearingDate} ${c.hearingTime || ''}` : '—'}
                  </td>
                  <td onClick={e => e.stopPropagation()}>
                    <div style={{ display: 'flex', gap: '0.3rem' }}>
                      <button onClick={() => { setSelected(c); setModal('view'); }} className="btn-icon" title="View">
                        <Eye size={14} color="#1a4f8a" />
                      </button>
                      {canEdit && c.status !== 'Settled' && c.status !== 'Dismissed' && (
                        <button onClick={() => openEdit(c)} className="btn-icon" title="Edit">
                          <Edit2 size={14} color="#d97706" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ─── VIEW MODAL ─── */}
      {modal === 'view' && selected && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal" style={{ maxWidth: 600 }}>
            <div className="modal-header">
              <div>
                <div className="modal-title">{selected.caseNumber}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>{selected.caseType}</div>
              </div>
              <button onClick={() => setModal(null)} className="btn-icon"><X size={16} /></button>
            </div>
            <div className="modal-body">

              {/* Status Badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', padding: '0.75rem 1rem', borderRadius: 10, background: (STATUS_CONFIG[selected.status]?.bg || '#f8fafc'), border: `1px solid ${STATUS_CONFIG[selected.status]?.border || '#e2e8f0'}` }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: (STATUS_CONFIG[selected.status]?.color || '#64748b') + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {(() => { const Icon = STATUS_CONFIG[selected.status]?.icon || Scale; return <Icon size={18} color={STATUS_CONFIG[selected.status]?.color || '#64748b'} />; })()}
                </div>
                <div>
                  <div style={{ fontWeight: 800, color: STATUS_CONFIG[selected.status]?.color || '#64748b', fontSize: '0.9rem' }}>{selected.status}</div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>Current Stage</div>
                </div>
              </div>

              {/* Timeline */}
              <CaseTimeline status={selected.status} />

              {/* Details Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '1rem' }}>
                {[
                  ['Case Number', selected.caseNumber],
                  ['Date Filed', selected.filedDate || '—'],
                  ['Complainant', maskName(residentName(selected.complainantId))],
                  ['Respondent', maskName(residentName(selected.respondentId))],
                  ['Hearing Date', selected.hearingDate || '—'],
                  ['Hearing Time', selected.hearingTime || '—'],
                  ['Venue', selected.hearingVenue || '—'],
                ].map(([label, value]) => (
                  <div key={label}>
                    <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>{label}</div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#1e293b' }}>{value}</div>
                  </div>
                ))}
              </div>

              {selected.description && (
                <div style={{ marginTop: '1rem' }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Case Description</div>
                  <div style={{ fontSize: '0.85rem', lineHeight: 1.65, background: '#f8fafc', padding: '0.85rem', borderRadius: 8, border: '1px solid #dde3ed', color: '#334155' }}>
                    {privacyMode ? '******** Content hidden in Privacy Mode ********' : selected.description}
                  </div>
                </div>
              )}

              {selected.notes && (
                <div style={{ marginTop: '0.75rem' }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Hearing Notes</div>
                  <div style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.6 }}>{selected.notes}</div>
                </div>
              )}

              {/* Status Update Buttons */}
              {canEdit && selected.status !== 'Settled' && selected.status !== 'Dismissed' && (
                <div style={{ marginTop: '1.25rem', padding: '1rem', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
                    Update Case Status
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {STATUS_FLOW.filter(s => s !== selected.status).map(s => {
                      const cfg = STATUS_CONFIG[s] || {};
                      return (
                        <button key={s} onClick={() => updateStatus(selected.id, s)}
                          style={{ padding: '0.4rem 0.85rem', background: cfg.bg || '#f8fafc', border: `1px solid ${cfg.border || '#e2e8f0'}`, color: cfg.color || '#64748b', borderRadius: 8, fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}>
                          → {s}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setModal(null)}>Close</button>
              {canEdit && selected.status !== 'Settled' && selected.status !== 'Dismissed' && (
                <button type="button" className="btn btn-primary" onClick={() => openEdit(selected)}>
                  <Edit2 size={14} /> Edit Case
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── FILE / EDIT MODAL ─── */}
      {modal === 'form' && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal" style={{ maxWidth: 580 }}>
            <div className="modal-header">
              <div className="modal-title">{selected ? 'Edit KP Case' : 'File New KP Case'}</div>
              <button onClick={() => setModal(null)} className="btn-icon"><X size={16} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Case Number</label>
                    <input className="form-input" value={form.caseNumber} onChange={e => setForm({ ...form, caseNumber: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Date Filed</label>
                    <input className="form-input" type="date" value={form.filedDate} onChange={e => setForm({ ...form, filedDate: e.target.value })} required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Case Type</label>
                  <select className="form-select" value={form.caseType} onChange={e => setForm({ ...form, caseType: e.target.value })}>
                    {CASE_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Complainant (Nagrereklamo)</label>
                    <select className="form-select" value={form.complainantId} onChange={e => setForm({ ...form, complainantId: e.target.value })}>
                      <option value="">— Select Resident —</option>
                      {residents.map(r => <option key={r.id} value={r.id}>{r.lastName}, {r.firstName}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Respondent (Inireklamo)</label>
                    <select className="form-select" value={form.respondentId} onChange={e => setForm({ ...form, respondentId: e.target.value })}>
                      <option value="">— Select Resident —</option>
                      {residents.map(r => <option key={r.id} value={r.id}>{r.lastName}, {r.firstName}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Case Description / Salaysay</label>
                  <textarea className="form-textarea" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Ilarawan ang pangyayari..." />
                </div>

                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem', marginTop: '0.5rem' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#1a4f8a', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Calendar size={13} /> Hearing Schedule
                  </div>
                  <div className="grid-2">
                    <div className="form-group">
                      <label className="form-label">Hearing Date</label>
                      <input className="form-input" type="date" value={hearingForm.hearingDate} onChange={e => setHearingForm({ ...hearingForm, hearingDate: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Time</label>
                      <input className="form-input" type="time" value={hearingForm.hearingTime} onChange={e => setHearingForm({ ...hearingForm, hearingTime: e.target.value })} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Venue / Lugar</label>
                    <input className="form-input" value={hearingForm.hearingVenue} onChange={e => setHearingForm({ ...hearingForm, hearingVenue: e.target.value })} placeholder="e.g., Barangay Hall Conference Room" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Notes / Tala</label>
                    <textarea className="form-textarea" value={hearingForm.notes} onChange={e => setHearingForm({ ...hearingForm, notes: e.target.value })} rows={2} placeholder="Optional hearing notes..." />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Save size={14} />{saving ? 'Saving...' : 'Save Case'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
