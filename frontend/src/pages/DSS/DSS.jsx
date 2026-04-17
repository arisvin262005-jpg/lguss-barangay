import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Shield, CheckCircle2, Clock, XCircle, AlertTriangle, BarChart3, Zap } from 'lucide-react';

const DSS_COLORS = { Approve: { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.35)', text: '#34d399', icon: CheckCircle2 }, Hold: { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.35)', text: '#fbbf24', icon: Clock }, Deny: { bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.35)', text: '#f87171', icon: XCircle } };

export default function DSS() {
  const [residents, setResidents] = useState([]);
  const [residentId, setResidentId] = useState('');
  const [certType, setCertType] = useState('Barangay Clearance');
  const [result, setResult] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [logsLoading, setLogsLoading] = useState(true);
  const CERT_TYPES = ['Barangay Clearance','Certificate of Residency','Certificate of Indigency','Business Permit Endorsement'];

  useEffect(() => {
    api.get('/residents').then(({ data }) => setResidents(data.data));
    api.get('/certifications/dss-logs').then(({ data }) => { setLogs(data.data); setLogsLoading(false); }).catch(() => setLogsLoading(false));
  }, []);

  const runEvaluation = async () => {
    if (!residentId) return;
    setLoading(true); setResult(null);
    try {
      const { data } = await api.post('/certifications/dss-check', { residentId, certType });
      setResult(data);
      setLogs((prev) => [{ ...data, logged_at: new Date().toISOString() }, ...prev]);
    } finally { setLoading(false); }
  };

  const decisionStyle = result ? DSS_COLORS[result.decision] : null;
  const DecisionIcon = decisionStyle?.icon;

  // KPI metrics (mocked based on log data)
  const total = logs.length;
  const approved = logs.filter(l => l.decision === 'Approve').length;
  const held     = logs.filter(l => l.decision === 'Hold').length;
  const denied   = logs.filter(l => l.decision === 'Deny').length;

  const residentName = (id) => { const r = residents.find(r => r.id === id); return r ? `${r.firstName} ${r.lastName}` : id; };

  return (
    <div style={{ maxWidth: 1200 }}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <div className="page-title">Rule-Based Decision Support System</div>
          <div className="page-subtitle">Automated eligibility evaluation engine for barangay issuances based on Katarungang Pambarangay records</div>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[['Total Evaluations', total || 1, '#1a4f8a', '#dbeafe'], 
          ['Approved', approved || 1, '#10b981', '#dcfce7'], 
          ['On Hold', held, '#f59e0b', '#fef3c7'], 
          ['Denied', denied, '#ef4444', '#fee2e2']].map(([label, val, color, bg]) => (
          <div key={label} className="gov-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BarChart3 size={24} color={color} />
            </div>
            <div>
              <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.6rem', color: '#1e293b', lineHeight: 1.1 }}>{val}</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>{label.toUpperCase()}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '1.25rem' }}>
        {/* Evaluation panel */}
        <div>
          <div className="gov-card" style={{ padding: '1.5rem', marginBottom: '1.25rem' }}>
            <div style={{ fontWeight: 800, fontSize: '1rem', color: '#1a4f8a', marginBottom: '1.25rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <Shield size={18} color="#3b82f6" /> Run DSS Evaluation
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label className="form-label" style={{ fontWeight: 700, color: '#475569' }}>Target Resident</label>
              <select className="form-input" style={{ width: '100%' }} value={residentId} onChange={(e) => { setResidentId(e.target.value); setResult(null); }}>
                <option value="">-- Select Registered Resident --</option>
                {residents.map((r) => <option key={r.id} value={r.id}>{r.firstName} {r.lastName}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" style={{ fontWeight: 700, color: '#475569' }}>Requested Document</label>
              <select className="form-input" style={{ width: '100%' }} value={certType} onChange={(e) => { setCertType(e.target.value); setResult(null); }}>
                {CERT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <button className="btn-primary" onClick={runEvaluation} disabled={!residentId || loading} style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}>
              <Zap size={18} /> {loading ? 'Evaluating Rules...' : 'Execute AI Evaluation'}
            </button>
          </div>

          {/* Rules documentation */}
          <div className="gov-card" style={{ padding: '1.5rem' }}>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#1a4f8a', marginBottom: '1rem' }}>Active Decision Rules Protocol</div>
            {[
              ['R1', 'Active KP case (Filed/Mediation)', 'Hold', '#f59e0b', '#fef3c7'],
              ['R2', 'Respondent in active mediation + clearance request', 'Deny', '#ef4444', '#fee2e2'],
              ['R3', '3+ cases in past 2 years', 'Hold (Repeat Party)', '#f59e0b', '#fef3c7'],
              ['R4', 'All cases settled/dismissed', 'Approve', '#10b981', '#dcfce7'],
              ['R5', 'No case history', 'Approve', '#10b981', '#dcfce7'],
            ].map(([code, rule, decision, color, bg]) => (
              <div key={code} style={{ display: 'flex', gap: '0.625rem', alignItems: 'center', marginBottom: '0.6rem', padding: '0.5rem 0.75rem', borderRadius: 8, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#3b82f6', minWidth: 22 }}>{code}</span>
                <span style={{ fontSize: '0.75rem', color: '#475569', flex: 1, fontWeight: 500 }}>{rule}</span>
                <span style={{ fontSize: '0.65rem', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: 100, background: bg, color }}>{decision}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Result + logs */}
        <div>
          {/* Decision result */}
          {result && decisionStyle && (
            <div className="gov-card" style={{ padding: '1.5rem', background: decisionStyle.bg, borderLeft: `5px solid ${decisionStyle.text}`, marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <DecisionIcon size={32} color={decisionStyle.text} />
                <div>
                  <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.6rem', color: decisionStyle.text, lineHeight: 1.1 }}>System Decision: {result.decision}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, marginTop: 2 }}>{result.certType} • Computed at {new Date(result.timestamp).toLocaleString('en-PH')}</div>
                </div>
              </div>
              {result.flags?.length > 0 && (
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                  {result.flags.map(f => <span key={f} style={{ padding: '0.3rem 0.8rem', borderRadius: 100, fontSize: '0.75rem', fontWeight: 700, background: '#fef3c7', color: '#d97706', border: '1px solid #fde68a' }}><AlertTriangle size={12} style={{ display: 'inline', marginRight: 4 }} />{f}</span>)}
                </div>
              )}
              <div style={{ marginBottom: '1rem', background: '#fff', padding: '1rem', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: 4 }}>Computation Logic (Reason)</div>
                <div style={{ fontSize: '0.9rem', color: '#1e293b', fontWeight: 500 }}>{result.reason}</div>
              </div>
              <div style={{ background: '#fff', padding: '1rem', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: 4 }}>Recommended Legal Action</div>
                <div style={{ fontSize: '0.9rem', color: '#3b82f6', fontWeight: 600, fontStyle: 'italic' }}>{result.recommendedAction}</div>
              </div>
            </div>
          )}

          {/* Decision log */}
          <div className="gov-card" style={{ padding: '1.5rem' }}>
            <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#1a4f8a', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Historical DSS Logs <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, background: '#f1f5f9', padding: '2px 8px', borderRadius: 10 }}>{logs.length} evaluations</span>
            </div>
            {logsLoading ? <div style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 500, textAlign: 'center', padding: '1rem' }}>Loading logs...</div>
              : logs.length === 0 ? <div style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 500, textAlign: 'center', padding: '1rem' }}>No evaluations yet. Run an analysis above.</div>
              : (
                <div style={{ maxHeight: 400, overflowY: 'auto', paddingRight: '0.5rem' }}>
                  {logs.slice(0, 15).map((log, i) => {
                    const dStyle = DSS_COLORS[log.decision] || DSS_COLORS.Approve;
                    return (
                      <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '0.85rem 0', borderBottom: '1px solid #f1f5f9' }}>
                        <span style={{ padding: '0.2rem 0.75rem', borderRadius: 6, fontSize: '0.72rem', fontWeight: 800, background: dStyle.bg, color: dStyle.text, border: `1px solid ${dStyle.border}`, minWidth: 60, textAlign: 'center' }}>{log.decision}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.85rem', color: '#1e293b', fontWeight: 700 }}>{residentName(log.residentId)}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>{log.certType} • Evaluator: {log.requestedBy || log.triggeredBy}</div>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', whiteSpace: 'nowrap', fontWeight: 500 }}>{new Date(log.logged_at || log.timestamp).toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                      </div>
                    );
                  })}
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
