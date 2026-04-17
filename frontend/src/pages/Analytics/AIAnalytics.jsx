import { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import {
  BrainCircuit, AlertTriangle, ShieldAlert, Sparkles,
  TrendingUp, Activity, CheckCircle2, Cpu, Send,
  Loader2, Zap, RefreshCw, Terminal, ChevronRight
} from 'lucide-react';

const ACCENT  = '#7c3aed';
const BLUE    = '#1a4f8a';
const SUCCESS = '#10b981';
const WARN    = '#f59e0b';
const DANGER  = '#ef4444';

/* ─── Typing Effect Hook ─── */
function useTypingEffect(text, speed = 12, active = false) {
  const [displayed, setDisplayed] = useState('');
  const indexRef = useRef(0);

  useEffect(() => {
    if (!active || !text) return;
    setDisplayed('');
    indexRef.current = 0;
    const interval = setInterval(() => {
      if (indexRef.current < text.length) {
        setDisplayed(prev => prev + text[indexRef.current]);
        indexRef.current++;
      } else {
        clearInterval(interval);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, active, speed]);

  return displayed;
}

export default function AIAnalytics() {
  const [data,        setData]        = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [localInsights, setLocalInsights] = useState([]);
  const [isTyping,    setIsTyping]    = useState(false);
  const [isOnline,    setIsOnline]    = useState(navigator.onLine);

  // NVIDIA AI state
  const [nimLoading, setNimLoading]   = useState(false);
  const [nimResponse, setNimResponse] = useState('');
  const [nimError,   setNimError]     = useState('');
  const [nimActive,  setNimActive]    = useState(false);
  const [nimDone,    setNimDone]      = useState(false);
  const [nimTimestamp, setNimTimestamp] = useState('');
  const [isOfflineFallback, setIsOfflineFallback] = useState(false);
  const terminalRef = useRef(null);

  /* Typing animation for NIM response */
  const typedNim = useTypingEffect(nimResponse, 10, nimActive);

  /* Track online/offline status */
  useEffect(() => {
    const goOnline  = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener('online',  goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online',  goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  /* Auto-scroll terminal */
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [typedNim, localInsights]);

  /* ── Load local analytics on mount ── */
  useEffect(() => {
    Promise.all([
      api.get('/reports/cases').catch(() => ({ data: { byBarangay: {} } })),
      api.get('/reports/residents').catch(() => ({ data: { data: [] } })),
      api.get('/reports/duplicates').catch(() => ({ data: { repeatInvolvedParties: 0 } })),
    ]).then(([casesRes, resRes, dupRes]) => {
      const casesData      = casesRes.data;
      const residentsData  = resRes.data.data || [];
      const repeatOffenders = dupRes.data.repeatInvolvedParties || 0;

      const risks = [];
      const stats = casesData.byBarangay || {};
      for (const [brgy, count] of Object.entries(stats)) {
        if (brgy === 'undefined') continue;
        const pop   = residentsData.filter(r => r.barangay === brgy).length || 100;
        const score = Math.min(((count / pop) * 1000).toFixed(1), 99);
        risks.push({
          barangay:  brgy,
          caseCount: count,
          riskScore: score,
          level:     score > 30 ? 'CRITICAL' : score > 15 ? 'ELEVATED' : 'STABLE',
          color:     score > 30 ? DANGER     : score > 15 ? WARN       : SUCCESS,
        });
      }

      const sortedRisks = risks.sort((a, b) => b.riskScore - a.riskScore);
      setData({
        risks: sortedRisks,
        repeatOffenders,
        totalResidents: residentsData.length,
        totalCases: Object.values(stats).reduce((s, v) => s + v, 0),
      });

      // Local terminal messages
      const msgs = [
        '🔄 Initializing local pattern detection engine...',
        '📦 Loading offline datasets from PouchDB cache...',
        `📊 ${residentsData.length} resident records loaded. ${Object.keys(stats).length} barangay zones indexed.`,
      ];
      if (repeatOffenders > 0) {
        msgs.push(`⚠️  Detected ${repeatOffenders} repeat offender(s). Flagging for intensive mediation.`);
      } else {
        msgs.push('✅ No recurring offenders detected. Community mediation holding effectively.');
      }
      if (sortedRisks[0]?.level === 'CRITICAL') {
        msgs.push(`🚨 HIGH RISK ZONE: ${sortedRisks[0].barangay} — anomalous case spike detected. Deploy additional Tanods.`);
      } else if (sortedRisks.length > 0) {
        msgs.push('📈 Case frequencies within normal control limits across all jurisdictions.');
      }
      msgs.push('✅ Local engine ready. Click "Ask NIM AI" for deep LLM analysis.');

      let i = 0;
      setIsTyping(true);
      setLocalInsights([]);
      const interval = setInterval(() => {
        if (i < msgs.length) { setLocalInsights(prev => [...prev, msgs[i]]); i++; }
        else { setIsTyping(false); clearInterval(interval); }
      }, 900);

      setLoading(false);
    });
  }, []);

  /* ── Local Offline Fallback Analysis Generator ── */
  const generateOfflineFallback = (d) => {
    const top     = d.risks?.[0];
    const second  = d.risks?.[1];
    const stable  = d.risks?.filter(r => r.level === 'STABLE').length ?? 0;
    const critical= d.risks?.filter(r => r.level === 'CRITICAL').length ?? 0;
    const elevated= d.risks?.filter(r => r.level === 'ELEVATED').length ?? 0;

    const lines = [];
    lines.push(`📋 EXECUTIVE SUMMARY`);
    lines.push(`The barangay system currently monitors ${d.totalResidents} registered residents across ${d.risks?.length ?? 0} barangay zones with ${d.totalCases} total KP case records, indicating ${ d.totalCases > 20 ? 'an elevated' : 'a manageable'} community incident load.`);
    lines.push(``);
    lines.push(`🔍 KEY RISK FINDINGS (Local Engine)`);
    if (top) {
      lines.push(`• HIGHEST RISK: ${top.barangay} — Risk Score ${top.riskScore} [${top.level}]. ${top.caseCount} recorded incidents relative to its population density place this zone at priority status.`);
    }
    if (second) {
      lines.push(`• SECONDARY ALERT: ${second.barangay} — Risk Score ${second.riskScore} [${second.level}]. Monitor closely for escalation patterns.`);
    }
    if (d.repeatOffenders > 0) {
      lines.push(`• REPEAT OFFENDERS: ${d.repeatOffenders} resident(s) flagged with multiple KP involvements — priority candidates for intensive barangay mediation programs.`);
    } else {
      lines.push(`• RECIDIVISM CHECK: No repeat offenders detected. Barangay mediation programs appear effective.`);
    }
    if (critical > 0) {
      lines.push(`• ${critical} zone(s) at CRITICAL level — immediate resource reallocation recommended.`);
    }
    lines.push(``);
    lines.push(`✅ RECOMMENDATIONS`);
    if (top?.level === 'CRITICAL') {
      lines.push(`① Deploy additional Tanod patrol units to ${top.barangay} during peak hours (18:00–24:00).`);
    } else {
      lines.push(`① Maintain current Tanod patrol distribution — risk levels within acceptable bounds.`);
    }
    if (d.repeatOffenders > 0) {
      lines.push(`② Schedule mandatory mediation hearings for ${d.repeatOffenders} flagged repeat offender(s) within 30 days.`);
    } else {
      lines.push(`② Continue community engagement programs to sustain low recidivism rates across all barangays.`);
    }
    lines.push(`③ File updated DRRM and GAD Plan reports for zones with Elevated or Critical scores before the next fiscal quarter.`);
    lines.push(``);
    lines.push(`⚠️  NOTE: This analysis was generated by the LOCAL offline engine. Connect to the internet and click "Ask NIM AI" for enhanced insights powered by NVIDIA Llama 3.3 70B.`);
    return lines.join('\n');
  };

  /* ── Call NVIDIA NIM API via backend proxy ── */
  const handleNimAnalyze = async () => {
    if (nimLoading || !data) return;
    setNimLoading(true);
    setNimError('');
    setNimResponse('');
    setNimActive(false);
    setNimDone(false);
    setNimTimestamp('');
    setIsOfflineFallback(false);

    /* ── OFFLINE PATH: use local fallback ── */
    if (!isOnline) {
      await new Promise(r => setTimeout(r, 1200)); // simulate analysis delay
      const fallback = generateOfflineFallback(data);
      setNimResponse(fallback);
      setNimTimestamp(new Date().toLocaleTimeString());
      setIsOfflineFallback(true);
      setNimActive(true);
      setNimLoading(false);
      setTimeout(() => setNimDone(true), fallback.length * 10 + 500);
      return;
    }

    /* ── ONLINE PATH: call NVIDIA NIM via backend ── */
    try {
      const res = await api.post('/ai/analyze', {
        risks:          data.risks,
        repeatOffenders:data.repeatOffenders,
        totalResidents: data.totalResidents,
        totalCases:     data.totalCases,
      });
      setNimResponse(res.data.analysis);
      setNimTimestamp(new Date(res.data.timestamp).toLocaleTimeString());
      setNimActive(true);
      setTimeout(() => setNimDone(true), res.data.analysis.length * 10 + 500);
    } catch (err) {
      /* If API call fails even when nominally online → auto-fallback */
      const apiErr = err.response?.data?.error;
      if (!apiErr) {
        // Network-level failure — use local fallback
        const fallback = generateOfflineFallback(data);
        setNimResponse(fallback);
        setNimTimestamp(new Date().toLocaleTimeString());
        setIsOfflineFallback(true);
        setNimActive(true);
        setTimeout(() => setNimDone(true), fallback.length * 10 + 500);
      } else {
        setNimError(apiErr);
      }
    } finally {
      setNimLoading(false);
    }
  };

  const handleReset = () => {
    setNimResponse(''); setNimActive(false); setNimDone(false);
    setNimError(''); setNimTimestamp(''); setIsOfflineFallback(false);
  };

  return (
    <div style={{ maxWidth: 1200 }}>

      <style>{`
        @keyframes spin   { to { transform: rotate(360deg); } }
        @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes blink  { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes glow   { 0%,100%{box-shadow:0 0 8px rgba(124,58,237,0.4)} 50%{box-shadow:0 0 20px rgba(124,58,237,0.7)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .nim-line { animation: fadeIn 0.3s ease forwards; }
        .blinking-cursor::after { content:'▋'; animation:blink 1s step-end infinite; color:#7c3aed; margin-left:1px; }
      `}</style>

      {/* ── Page Header ── */}
      <div style={{ marginBottom: '2rem', display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:'1rem', flexWrap:'wrap' }}>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:'0.4rem' }}>
            <div style={{ width:38, height:38, borderRadius:10, background:'linear-gradient(135deg,#5b21b6,#7c3aed)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <BrainCircuit size={20} color="#fff" />
            </div>
            <span style={{ fontWeight:900, fontSize:'1.4rem', color:'#0f172a' }}>AI Predictive Analytics Engine</span>
          </div>
          <div style={{ fontSize:'0.88rem', color:'#64748b', paddingLeft:48 }}>
            Offline pattern detection · Risk Scoring · NVIDIA Llama 3.3 70B integration
          </div>
        </div>
        <div style={{ display:'flex', gap:'0.5rem', alignItems:'center', flexShrink:0 }}>
          <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', padding:'0.4rem 0.9rem', borderRadius:100, fontSize:'0.72rem', fontWeight:700, color:SUCCESS, display:'flex', gap:5, alignItems:'center' }}>
            <Activity size={12} color={SUCCESS} /> LOCAL ENGINE ONLINE
          </div>
          <div style={{ background:'#f5f3ff', border:'1px solid #ddd6fe', padding:'0.4rem 0.9rem', borderRadius:100, fontSize:'0.72rem', fontWeight:700, color:ACCENT, display:'flex', gap:5, alignItems:'center', animation:'glow 3s ease-in-out infinite' }}>
            <Cpu size={12} color={ACCENT} /> NVIDIA NIM READY
          </div>
        </div>
      </div>

      {/* ── NVIDIA NIM Panel (full-width, top) ── */}
      <div style={{
        marginBottom:'1.75rem',
        border:'1.5px solid #ddd6fe',
        borderRadius:16,
        background:'linear-gradient(135deg,#0f0a1e 0%,#1a0a38 50%,#0d1f4a 100%)',
        overflow:'hidden',
        boxShadow:'0 8px 32px rgba(124,58,237,0.2)',
      }}>
        {/* NIM Header */}
        <div style={{ padding:'0.9rem 1.5rem', background:'rgba(124,58,237,0.15)', borderBottom:'1px solid rgba(124,58,237,0.2)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
            <div style={{ display:'flex', gap:'0.4rem' }}>
              <div style={{ width:10, height:10, borderRadius:'50%', background:DANGER }} />
              <div style={{ width:10, height:10, borderRadius:'50%', background:WARN }} />
              <div style={{ width:10, height:10, borderRadius:'50%', background:SUCCESS }} />
            </div>
            <span style={{ fontSize:'0.78rem', color: isOnline ? '#a78bfa' : WARN, fontWeight:700, fontFamily:'monospace' }}>
              {isOnline ? 'nvidia_nim_terminal · meta/llama-3.3-70b-instruct' : '⚡ offline_engine_terminal · local-rule-based-v1'}
            </span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
            {nimDone && nimTimestamp && (
              <span style={{ fontSize:'0.72rem', color:'#64748b', fontFamily:'monospace' }}>
                {isOfflineFallback ? '⚡ offline' : '🌐 nvidia nim'} · {nimTimestamp}
              </span>
            )}
            {(nimResponse || nimError) && (
              <button onClick={handleReset} style={{ background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.12)', color:'#94a3b8', padding:'0.3rem 0.75rem', borderRadius:6, cursor:'pointer', fontSize:'0.72rem', fontWeight:700, display:'flex', alignItems:'center', gap:'0.3rem', transition:'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.15)'} onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.08)'}>
                <RefreshCw size={11} /> Reset
              </button>
            )}
          </div>
        </div>

        {/* NIM Terminal Body */}
        <div ref={terminalRef} style={{ padding:'1.5rem', minHeight:240, maxHeight:380, overflowY:'auto', fontFamily:'monospace', fontSize:'0.84rem', lineHeight:1.7 }}>

          {/* Local engine logs */}
          {loading ? (
            <div style={{ color:'#3b82f6' }}>&gt; Initializing neural pattern detection routines...<span style={{ animation:'pulse 1.5s infinite', display:'inline-block' }}>_</span></div>
          ) : (
            <>
              {localInsights.map((msg, idx) => (
                <div key={idx} className="nim-line" style={{ color:'#94a3b8', marginBottom:'0.4rem', display:'flex', gap:'0.5rem' }}>
                  <span style={{ color:'#475569', flexShrink:0 }}>[LOCAL]</span>
                  <span>{msg}</span>
                </div>
              ))}
              {isTyping && (
                <div style={{ color:'#64748b', display:'flex', gap:'0.5rem' }}>
                  <span>[LOCAL]</span><span style={{ animation:'pulse 1s infinite' }}>Processing...</span>
                </div>
              )}

              {/* Divider after local log */}
              {!isTyping && !nimResponse && !nimError && !nimLoading && (
                <div style={{ borderTop:'1px solid rgba(255,255,255,0.06)', marginTop:'1rem', paddingTop:'1rem', color:'#475569', display:'flex', gap:'0.5rem', alignItems:'center' }}>
                  <ChevronRight size={14} color={isOnline ? '#7c3aed' : WARN} />
                  <span style={{ color: isOnline ? '#7c3aed' : WARN, fontWeight:700 }}>Ready.</span>
                  <span style={{ color:'#64748b' }}>
                    {isOnline
                      ? 'Click "Ask NIM AI" below to invoke Llama 3.3 analysis →'
                      : 'OFFLINE MODE — Click "Ask NIM AI" to run local engine analysis →'
                    }
                  </span>
                </div>
              )}

              {/* Loading NIM */}
              {nimLoading && (
                <div style={{ borderTop:'1px solid rgba(255,255,255,0.06)', marginTop:'1rem', paddingTop:'1rem' }}>
                  <div style={{ color:'#a78bfa', display:'flex', gap:'0.5rem', alignItems:'center', marginBottom:'0.4rem' }}>
                    <span>[{isOnline ? 'NIM' : 'LOCAL'}]</span>
                    <span>{isOnline ? 'Connecting to NVIDIA API endpoint...' : 'Running offline rule-based analysis engine...'}</span>
                    <span style={{ animation:'pulse 1s infinite' }}>⬛</span>
                  </div>
                  <div style={{ color:'#7c3aed', display:'flex', gap:'0.5rem', alignItems:'center' }}>
                    <span>[{isOnline ? 'NIM' : 'LOCAL'}]</span>
                    <span>{isOnline ? 'Sending barangay data payload to meta/llama-3.3-70b-instruct...' : 'Generating structured insights from local PouchDB cache...'}</span>
                  </div>
                </div>
              )}

              {/* NIM Error */}
              {nimError && (
                <div style={{ borderTop:'1px solid rgba(239,68,68,0.2)', marginTop:'1rem', paddingTop:'1rem', color:DANGER }}>
                  <span>[NIM ERROR] </span>{nimError}
                </div>
              )}

              {/* NIM Response */}
              {nimActive && nimResponse && (
                <div style={{ borderTop:`1px solid ${isOfflineFallback ? 'rgba(245,158,11,0.2)' : 'rgba(124,58,237,0.2)'}`, marginTop:'1rem', paddingTop:'1rem' }}>
                  <div style={{ color: isOfflineFallback ? WARN : '#a78bfa', marginBottom:'0.75rem', display:'flex', gap:'0.5rem', alignItems:'center' }}>
                    <span>[{isOfflineFallback ? 'LOCAL' : 'NIM'}]</span>
                    <span style={{ color:SUCCESS }}>
                      {isOfflineFallback
                        ? 'Offline analysis complete — Local Rule Engine ✓'
                        : 'Response received from meta/llama-3.3-70b-instruct ✓'
                      }
                    </span>
                  </div>
                  <div style={{ color:'#e2e8f0', whiteSpace:'pre-wrap', lineHeight:1.8 }} className={!nimDone ? 'blinking-cursor' : ''}>
                    {typedNim}
                  </div>
                  {nimDone && (
                    <div className="nim-line" style={{ color:SUCCESS, marginTop:'1.25rem', display:'flex', gap:'0.5rem', alignItems:'center' }}>
                      <span>[{isOfflineFallback ? 'LOCAL' : 'NIM'}]</span>
                      <span>Analysis complete. End of transmission. ✅</span>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* NIM Action Bar */}
        <div style={{ padding:'1rem 1.5rem', background:'rgba(0,0,0,0.3)', borderTop:'1px solid rgba(255,255,255,0.06)', display:'flex', alignItems:'center', justifyContent:'space-between', gap:'1rem' }}>
          <div style={{ fontSize:'0.75rem', color:'#475569', fontFamily:'monospace' }}>
            {isOnline ? (
              <>Model: <span style={{ color:'#a78bfa' }}>meta/llama-3.3-70b-instruct</span> &nbsp;·&nbsp;
              Temp: <span style={{ color:'#60a5fa' }}>0.2</span> &nbsp;·&nbsp;
              Max tokens: <span style={{ color:'#60a5fa' }}>1024</span> &nbsp;·&nbsp;
              Via: <span style={{ color:'#34d399' }}>NVIDIA NIM API</span></>
            ) : (
              <><span style={{ color:WARN }}>⚡ OFFLINE MODE</span> &nbsp;·&nbsp;
              Engine: <span style={{ color:'#60a5fa' }}>local-rule-based-v1</span> &nbsp;·&nbsp;
              Source: <span style={{ color:'#34d399' }}>PouchDB cache</span></>
            )}
          </div>
          <button
            onClick={handleNimAnalyze}
            disabled={nimLoading || loading}
            style={{
              display:'flex', alignItems:'center', gap:'0.5rem',
              background: nimLoading ? 'rgba(124,58,237,0.3)' : isOnline
                ? 'linear-gradient(135deg,#7c3aed,#5b21b6)'
                : 'linear-gradient(135deg,#b45309,#92400e)',
              border: `1px solid ${isOnline ? 'rgba(167,139,250,0.4)' : 'rgba(251,191,36,0.4)'}`,
              color: isOnline ? '#e9d5ff' : '#fde68a',
              padding:'0.6rem 1.4rem', borderRadius:10,
              fontWeight:700, fontSize:'0.85rem', cursor: nimLoading ? 'not-allowed' : 'pointer',
              boxShadow: nimLoading ? 'none' : isOnline ? '0 4px 14px rgba(124,58,237,0.4)' : '0 4px 14px rgba(180,83,9,0.4)',
              transition:'all 0.25s', fontFamily:'monospace',
              opacity: loading ? 0.5 : 1,
            }}
            onMouseEnter={e => { if (!nimLoading && !loading) e.currentTarget.style.transform='translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; }}
          >
            {nimLoading
              ? <><Loader2 size={15} style={{ animation:'spin 1s linear infinite' }} /> Analyzing...</>
              : isOnline
                ? <><Zap size={15} /> Ask NIM AI</>
                : <><Zap size={15} /> Analyze Offline ⚡</>
            }
          </button>
        </div>
      </div>

      {/* ── Bottom Grid: Risk Table + Sidebar ── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 360px', gap:'1.5rem' }}>

        {/* Risk Scoring Panel */}
        <div className="gov-card" style={{ padding:'1.75rem' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.25rem' }}>
            <div style={{ fontWeight:800, fontSize:'1.05rem', color:BLUE, display:'flex', alignItems:'center', gap:'0.5rem' }}>
              <ShieldAlert size={18} color={BLUE} /> AI Zone Risk Scoring
            </div>
            <div style={{ fontSize:'0.72rem', color:'#94a3b8', background:'#f8fafc', border:'1px solid #e2e8f0', padding:'0.3rem 0.75rem', borderRadius:100, fontWeight:700 }}>
              LOCAL ENGINE
            </div>
          </div>
          <p style={{ fontSize:'0.82rem', color:'#64748b', marginBottom:'1.5rem', lineHeight:1.6 }}>
            Calculates geographical hazard levels based on historical case frequency mapped against population density.
          </p>

          <table className="data-table" style={{ width:'100%' }}>
            <thead>
              <tr>
                <th>Jurisdiction</th>
                <th>Incidents</th>
                <th>Risk Score</th>
                <th>Threat Level</th>
              </tr>
            </thead>
            <tbody>
              {(!data?.risks || data.risks.length === 0) && (
                <tr><td colSpan={4} style={{ textAlign:'center', padding:'2rem', color:'#94a3b8', fontStyle:'italic' }}>
                  Insufficient data. Add case records to enable scoring.
                </td></tr>
              )}
              {data?.risks?.map((r, i) => (
                <tr key={i}>
                  <td style={{ fontWeight:700, color:'#1e293b' }}>{r.barangay}</td>
                  <td style={{ color:'#64748b', fontWeight:600 }}>{r.caseCount} records</td>
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap:'0.6rem' }}>
                      <span style={{ fontFamily:'monospace', fontWeight:800, color:r.color, minWidth:32 }}>{r.riskScore}</span>
                      <div style={{ flex:1, height:6, background:'#f1f5f9', borderRadius:4, overflow:'hidden', maxWidth:90 }}>
                        <div style={{ width:`${Math.min(r.riskScore, 100)}%`, height:'100%', background:r.color, borderRadius:4, transition:'width 1s ease' }} />
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize:'0.68rem', fontWeight:800, padding:'0.28rem 0.65rem', borderRadius:100, background:`${r.color}18`, color:r.color, border:`1px solid ${r.color}33` }}>
                      {r.level}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right Sidebar */}
        <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>

          {/* Repeat Offenders */}
          <div className="gov-card" style={{ padding:'1.5rem', background:'linear-gradient(135deg,#fff5f5,#fef2f2)' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem' }}>
              <div style={{ width:44, height:44, borderRadius:12, background:'#fee2e2', border:'1px solid #fca5a5', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <AlertTriangle size={22} color={DANGER} />
              </div>
              <span style={{ fontSize:'0.7rem', fontWeight:800, color:DANGER, background:'#fee2e2', border:'1px solid #fca5a5', padding:'0.3rem 0.75rem', borderRadius:100 }}>DSS FLAGGED</span>
            </div>
            <div style={{ fontSize:'3rem', fontWeight:900, color:'#b91c1c', lineHeight:1 }}>{data?.repeatOffenders || 0}</div>
            <div style={{ fontSize:'0.88rem', color:'#1e293b', fontWeight:700, marginTop:'0.4rem' }}>Repeat Offenders Identified</div>
            <div style={{ fontSize:'0.78rem', color:'#64748b', marginTop:'0.75rem', lineHeight:1.5 }}>
              Residents flagged as respondents in multiple KP incidents within a 2-year sliding window.
            </div>
          </div>

          {/* Stats */}
          <div className="gov-card" style={{ padding:'1.5rem' }}>
            <div style={{ fontWeight:800, fontSize:'0.95rem', color:BLUE, marginBottom:'1rem', display:'flex', alignItems:'center', gap:'0.5rem' }}>
              <TrendingUp size={16} color={BLUE} /> Dataset Summary
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
              {[
                { label:'Total Residents',    value: data?.totalResidents ?? '—', color:'#3b82f6' },
                { label:'KP Cases in System', value: data?.totalCases ?? '—',     color:ACCENT    },
                { label:'Barangay Zones',     value: data?.risks?.length ?? '—',  color:SUCCESS   },
              ].map((item, i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0.6rem 0.85rem', background:'#f8fafc', borderRadius:8, border:'1px solid #e8edf5' }}>
                  <span style={{ fontSize:'0.82rem', color:'#475569', fontWeight:600 }}>{item.label}</span>
                  <span style={{ fontSize:'1.05rem', fontWeight:900, color:item.color }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Engine Features */}
          <div className="gov-card" style={{ padding:'1.5rem' }}>
            <div style={{ fontWeight:800, fontSize:'0.95rem', color:BLUE, marginBottom:'1rem', display:'flex', alignItems:'center', gap:'0.5rem' }}>
              <Sparkles size={16} color={ACCENT} /> Capabilities
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'0.85rem' }}>
              {[
                { title:'NVIDIA Llama 3.3 70B',     desc:'Real LLM analysis of barangay data via NVIDIA NIM API, server-proxied for security.',     color:ACCENT    },
                { title:'Offline Risk Profiling',   desc:'Compares case volumes vs. population density locally — no internet needed.',              color:'#3b82f6' },
                { title:'Repeat Offender Detection',desc:'Sliding-window analysis of KP respondents to flag recidivists for intensive mediation.',  color:DANGER    },
                { title:'Predictive Allocation',    desc:'Identifies high-risk zones to optimize Tanod patrol dispatch via Live GPS module.',        color:SUCCESS   },
              ].map((item, idx) => (
                <div key={idx} style={{ display:'flex', gap:'0.6rem', alignItems:'flex-start' }}>
                  <CheckCircle2 size={14} color={item.color} style={{ marginTop:2, flexShrink:0 }} />
                  <div>
                    <div style={{ fontSize:'0.8rem', fontWeight:800, color:'#334155' }}>{item.title}</div>
                    <div style={{ fontSize:'0.72rem', color:'#94a3b8', lineHeight:1.45, marginTop:1 }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
