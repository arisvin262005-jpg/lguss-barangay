import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ArrowRight, Scale, FileText, Users, AlertTriangle, Loader2 } from 'lucide-react';
import api from '../services/api';

/* ─── Suggestion chips shown before user types ─── */
const EXAMPLES = [
  { label: 'Residents with unresolved KP cases', q: 'show residents with unresolved KP cases' },
  { label: 'Certifications issued this month',   q: 'find certifications issued this month'   },
  { label: 'Active cases under mediation',       q: 'show cases under mediation'              },
  { label: 'Pending certifications',             q: 'pending certifications'                  },
  { label: 'Senior citizens',                    q: 'show senior citizens'                    },
];

/* ─── Intent parser (no AI — pure regex/keyword) ─── */
function parseIntent(q) {
  const t = q.toLowerCase().trim();

  /* Check if [name] has a case / blotter record */
  const nameCheck = t.match(/check(?:\s+if)?\s+(.+?)\s+(?:has|had|have|already had)\s+(?:a\s+)?(?:case|blotter|kp|record)/i)
    || t.match(/(?:blotter|case|record)\s+(?:of|for)\s+(.+)/i);
  if (nameCheck) return { type: 'name_case_check', name: nameCheck[1].trim() };

  /* Certifications */
  if (/certif/.test(t)) {
    if (/this month|ngayong buwan/.test(t)) return { type: 'certs', filter: 'month' };
    if (/today|ngayon/.test(t))            return { type: 'certs', filter: 'today' };
    if (/pending/.test(t))                 return { type: 'certs', filter: 'Pending' };
    if (/released/.test(t))                return { type: 'certs', filter: 'Released' };
    if (/on hold/.test(t))                 return { type: 'certs', filter: 'On Hold' };
    return { type: 'certs', filter: 'all' };
  }

  /* Cases */
  if (/case|kp|katarungang/.test(t)) {
    if (/unresolved|active|open/.test(t) && /resident/.test(t))
      return { type: 'residents_with_cases' };
    if (/under mediation|mediation/.test(t)) return { type: 'cases', filter: 'Under Mediation' };
    if (/settled/.test(t))                   return { type: 'cases', filter: 'Settled' };
    if (/filed/.test(t))                     return { type: 'cases', filter: 'Filed' };
    if (/escalated/.test(t))                 return { type: 'cases', filter: 'Escalated to Court' };
    return { type: 'cases', filter: 'all' };
  }

  /* Residents */
  if (/resident|tao|residente/.test(t)) {
    const brgyMatch = t.match(/barangay\s+([a-z\s]+)/i);
    if (brgyMatch) return { type: 'residents', filter: 'barangay', value: brgyMatch[1].trim() };
    if (/senior|elderly|matanda/.test(t)) return { type: 'navigate', path: '/senior-citizens', label: 'Senior Citizens' };
    if (/pwd|disable/.test(t))            return { type: 'navigate', path: '/pwd',             label: 'PWD Registry'    };
    if (/voter/.test(t))                  return { type: 'navigate', path: '/voters',           label: 'Voter Registry'  };
    if (/unresolved|case|kp/.test(t))     return { type: 'residents_with_cases' };
    return { type: 'residents', filter: 'all' };
  }

  /* Incidents / blotter */
  if (/incident|blotter|complaint/.test(t)) return { type: 'navigate', path: '/incidents', label: 'Incidents & Complaints' };

  /* Reports */
  if (/report|analytics/.test(t)) return { type: 'navigate', path: '/reports', label: 'Reports & Analytics' };

  return { type: 'unknown' };
}

/* ─── Fetch & process results ─── */
async function fetchResults(intent) {
  const now = new Date();

  if (intent.type === 'certs') {
    const { data } = await api.get('/certifications');
    let items = data.data || [];
    if (intent.filter === 'month')
      items = items.filter(c => { const d = new Date(c.issuedAt); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); });
    else if (intent.filter === 'today')
      items = items.filter(c => new Date(c.issuedAt).toDateString() === now.toDateString());
    else if (['Pending','Released','On Hold'].includes(intent.filter))
      items = items.filter(c => c.status === intent.filter);
    return { kind: 'certs', items: items.slice(0, 8), total: items.length, path: '/certifications' };
  }

  if (intent.type === 'cases') {
    const { data } = await api.get('/cases');
    let items = data.data || [];
    if (intent.filter !== 'all') items = items.filter(c => c.status === intent.filter);
    return { kind: 'cases', items: items.slice(0, 8), total: items.length, path: '/cases' };
  }

  if (intent.type === 'residents') {
    const { data } = await api.get('/residents');
    let items = data.data || [];
    if (intent.filter === 'barangay' && intent.value)
      items = items.filter(r => r.barangay?.toLowerCase().includes(intent.value.toLowerCase()));
    return { kind: 'residents', items: items.slice(0, 8), total: items.length, path: '/residents' };
  }

  if (intent.type === 'residents_with_cases') {
    const [rRes, cRes] = await Promise.all([api.get('/residents'), api.get('/cases')]);
    const residents = rRes.data.data || [];
    const cases = cRes.data.data || [];
    const activeCases = cases.filter(c => !['Settled','Dismissed'].includes(c.status));
    const involvedIds = new Set([...activeCases.map(c => c.complainantId), ...activeCases.map(c => c.respondentId)]);
    const items = residents.filter(r => involvedIds.has(r.id)).slice(0, 8);
    return { kind: 'residents_cases', items, total: items.length, path: '/residents' };
  }

  if (intent.type === 'name_case_check') {
    const { data: rData } = await api.get('/residents');
    const residents = rData.data || [];
    const name = intent.name.toLowerCase();
    const matched = residents.filter(r =>
      `${r.firstName} ${r.lastName}`.toLowerCase().includes(name) ||
      `${r.lastName} ${r.firstName}`.toLowerCase().includes(name)
    );
    if (matched.length === 0) return { kind: 'not_found', name: intent.name };
    const results = [];
    for (const r of matched.slice(0, 3)) {
      try {
        const { data } = await api.get(`/cases/cross-check/${r.id}`);
        results.push({ resident: r, cases: data.cases || [], risk: data.summary?.riskLevel || 'CLEAR' });
      } catch { results.push({ resident: r, cases: [], risk: 'CLEAR' }); }
    }
    return { kind: 'name_check', results, path: '/cases' };
  }

  if (intent.type === 'navigate') {
    return { kind: 'navigate', path: intent.path, label: intent.label };
  }

  return { kind: 'unknown' };
}

/* ─── Result renderer ─── */
function Results({ result, navigate, close }) {
  if (!result) return null;

  if (result.kind === 'navigate') return (
    <div style={{ padding: '1rem' }}>
      <button onClick={() => { navigate(result.path); close(); }}
        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#eff6ff', border: '1.5px solid #bfdbfe', borderRadius: 9, padding: '0.65rem 1rem', fontWeight: 700, color: '#1a4f8a', cursor: 'pointer', fontSize: '0.85rem' }}>
        <ArrowRight size={15} /> Go to {result.label}
      </button>
    </div>
  );

  if (result.kind === 'not_found') return (
    <div style={{ padding: '1.25rem', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
      No resident named "<b>{result.name}</b>" found.
    </div>
  );

  if (result.kind === 'name_check') return (
    <div style={{ padding: '0.75rem 1rem' }}>
      <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>Case Record Check</div>
      {result.results.map(({ resident, cases, risk }) => {
        const RISK = { HIGH: '#dc2626', MODERATE: '#d97706', CLEAR: '#16a34a' };
        return (
          <div key={resident.id} style={{ border: '1px solid #e2e8f0', borderRadius: 9, padding: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#1e293b' }}>{resident.firstName} {resident.lastName}</div>
              <span style={{ fontSize: '0.65rem', fontWeight: 800, padding: '0.15rem 0.6rem', borderRadius: 100, background: RISK[risk] + '18', color: RISK[risk], border: `1px solid ${RISK[risk]}33` }}>
                {risk === 'CLEAR' ? '✅ CLEAR' : risk === 'HIGH' ? '🔴 HIGH RISK' : '⚠️ MODERATE'}
              </span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 2 }}>{resident.barangay}</div>
            {cases.length === 0
              ? <div style={{ fontSize: '0.75rem', color: '#16a34a', marginTop: 6 }}>No case records found.</div>
              : cases.slice(0, 3).map(c => (
                <div key={c.id} style={{ fontSize: '0.73rem', color: '#475569', marginTop: 4, display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                  <Scale size={11} color="#1a4f8a" /> <b>{c.caseNumber}</b> · {c.caseType} · <span style={{ color: ['Settled','Dismissed'].includes(c.status) ? '#16a34a' : '#dc2626' }}>{c.status}</span>
                </div>
              ))
            }
          </div>
        );
      })}
      <button onClick={() => { navigate(result.path); close(); }}
        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#1a4f8a', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, marginTop: 4 }}>
        <ArrowRight size={13} /> View all cases
      </button>
    </div>
  );

  /* certs / cases / residents / residents_cases */
  const iconMap = { certs: FileText, cases: Scale, residents: Users, residents_cases: Users };
  const Icon = iconMap[result.kind] || Users;
  const labelMap = {
    certs: c => `${c.certType} — ${c.status}`,
    cases: c => `${c.caseNumber} · ${c.caseType} · ${c.status}`,
    residents: r => `${r.firstName} ${r.lastName} — ${r.barangay}`,
    residents_cases: r => `${r.firstName} ${r.lastName} — ${r.barangay}`,
  };
  const getLabel = labelMap[result.kind];

  return (
    <div style={{ padding: '0.5rem 0.75rem' }}>
      <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem', padding: '0 0.25rem' }}>
        {result.total ?? 0} result{(result.total ?? 0) !== 1 ? 's' : ''} found
      </div>
      {result.items.map((item, i) => (
        <div key={item.id || i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.45rem 0.5rem', borderRadius: 7, cursor: 'pointer', transition: 'background 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          onClick={() => { navigate(result.path); close(); }}>
          <Icon size={13} color="#1a4f8a" style={{ flexShrink: 0 }} />
          <span style={{ fontSize: '0.8rem', color: '#334155', fontWeight: 500 }}>{getLabel(item)}</span>
        </div>
      ))}
      {(result.total ?? 0) > (result.items?.length ?? 0) && (
        <button onClick={() => { navigate(result.path); close(); }}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#1a4f8a', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, padding: '0.4rem 0.5rem' }}>
          <ArrowRight size={13} /> View all {result.total} results
        </button>
      )}
    </div>
  );
}

/* ─── Main SmartSearch Component ─── */
export default function SmartSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);
  const wrapRef = useRef(null);
  const navigate = useNavigate();

  /* Close on outside click */
  useEffect(() => {
    const handler = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* Keyboard shortcut Ctrl+K */
  useEffect(() => {
    const handler = (e) => { if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setOpen(true); setTimeout(() => inputRef.current?.focus(), 50); } };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const runSearch = async (q) => {
    if (!q.trim()) { setResult(null); return; }
    setLoading(true); setError(null); setResult(null);
    try {
      const intent = parseIntent(q);
      if (intent.type === 'unknown') { setError('Sorry, I didn\'t understand that. Try one of the examples below.'); return; }
      const res = await fetchResults(intent);
      setResult(res);
    } catch (err) {
      setError('Could not retrieve data. Please check your connection.');
    } finally { setLoading(false); }
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter') runSearch(query); if (e.key === 'Escape') { setOpen(false); setQuery(''); setResult(null); } };

  const close = () => { setOpen(false); setQuery(''); setResult(null); setError(null); };

  return (
    <div ref={wrapRef} style={{ position: 'relative', flex: 1, maxWidth: 420 }}>
      {/* Trigger bar */}
      <div onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 50); }}
        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 9, padding: '0.35rem 0.75rem', cursor: 'text', transition: 'all 0.2s' }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.13)'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}>
        <Search size={14} color="rgba(255,255,255,0.6)" />
        <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', flex: 1 }}>Smart search... <span style={{ fontSize: '0.65rem', background: 'rgba(255,255,255,0.12)', borderRadius: 4, padding: '0.1rem 0.35rem', marginLeft: 4 }}>Ctrl+K</span></span>
      </div>

      {/* Dropdown panel */}
      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0, minWidth: 420, background: '#fff', borderRadius: 12, boxShadow: '0 20px 60px rgba(0,0,0,0.18)', border: '1px solid #e2e8f0', zIndex: 9999, overflow: 'hidden' }}>
          {/* Search input */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', borderBottom: '1px solid #f1f5f9' }}>
            {loading ? <Loader2 size={16} color="#1a4f8a" style={{ animation: 'spin 0.8s linear infinite', flexShrink: 0 }} /> : <Search size={16} color="#1a4f8a" style={{ flexShrink: 0 }} />}
            <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)} onKeyDown={handleKeyDown}
              placeholder='Try: "Show residents with unresolved KP cases"'
              style={{ flex: 1, border: 'none', outline: 'none', fontSize: '0.88rem', color: '#1e293b', background: 'transparent', fontFamily: 'inherit' }} />
            {query && <button onClick={() => { setQuery(''); setResult(null); setError(null); inputRef.current?.focus(); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 2 }}><X size={14} color="#94a3b8" /></button>}
            <button onClick={() => runSearch(query)}
              style={{ background: '#1a4f8a', color: '#fff', border: 'none', borderRadius: 7, padding: '0.3rem 0.7rem', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}>Search</button>
          </div>

          {/* Error */}
          {error && (
            <div style={{ padding: '0.75rem 1rem', display: 'flex', gap: '0.5rem', alignItems: 'flex-start', borderBottom: '1px solid #f1f5f9' }}>
              <AlertTriangle size={15} color="#d97706" style={{ marginTop: 1, flexShrink: 0 }} />
              <span style={{ fontSize: '0.8rem', color: '#92400e' }}>{error}</span>
            </div>
          )}

          {/* Results */}
          {result && <Results result={result} navigate={navigate} close={close} />}

          {/* Example chips — shown when no query */}
          {!query && !result && !error && (
            <div style={{ padding: '0.75rem 1rem' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.6rem' }}>💡 Try asking:</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {EXAMPLES.map(ex => (
                  <button key={ex.q} onClick={() => { setQuery(ex.q); runSearch(ex.q); }}
                    style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 100, padding: '0.3rem 0.75rem', fontSize: '0.72rem', fontWeight: 600, color: '#475569', cursor: 'pointer', transition: 'all 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#eff6ff'; e.currentTarget.style.color = '#1a4f8a'; e.currentTarget.style.borderColor = '#bfdbfe'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#475569'; e.currentTarget.style.borderColor = '#e2e8f0'; }}>
                    {ex.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div style={{ padding: '0.4rem 1rem', background: '#f8fafc', borderTop: '1px solid #f1f5f9', fontSize: '0.65rem', color: '#94a3b8', display: 'flex', gap: '1rem' }}>
            <span>↵ Search</span><span>Esc Close</span><span>✦ No AI required — instant local matching</span>
          </div>
        </div>
      )}
    </div>
  );
}
