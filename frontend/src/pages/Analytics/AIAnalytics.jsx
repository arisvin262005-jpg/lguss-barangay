import { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  TrendingUp, Users, MapPin, Heart, Shield,
  AlertTriangle, CheckCircle2, BarChart2, Calendar, 
  Activity, Home, RefreshCw, Globe, BrainCircuit,
  Zap, ArrowRight
} from 'lucide-react';

const BLUE   = '#1e40af';
const GREEN  = '#15803d';
const ORANGE = '#b45309';
const RED    = '#b91c1c';
const PURPLE = '#6d28d9';
const TEAL   = '#0f766e';

const RISK_COLOR = { HIGH: RED, CRITICAL: RED, ELEVATED: ORANGE, MODERATE: ORANGE, STABLE: GREEN, CLEAR: GREEN, LOW: GREEN, NORMAL: BLUE };
const PRIORITY_COLOR = { 'PRIORITY 1': RED, 'PRIORITY 2': ORANGE, 'PRIORITY 3': GREEN };

function StatCard({ label, value, color = BLUE, sub }) {
  return (
    <div style={{ background: '#fff', border: `1px solid ${color}20`, borderRadius: 12, padding: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
      <div style={{ fontSize: '1.7rem', fontWeight: 900, color, lineHeight: 1 }}>{value ?? '—'}</div>
      <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#475569', marginTop: 6 }}>{label}</div>
      {sub && <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function Badge({ label, color }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', padding: '0.2rem 0.6rem', borderRadius: 100,
      fontSize: '0.65rem', fontWeight: 800, background: (color || BLUE) + '15',
      color: color || BLUE, border: `1px solid ${(color || BLUE)}30`,
    }}>{label}</span>
  );
}

function DashboardCard({ icon: Icon, color, title, subtitle, children, loading }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9', background: 'linear-gradient(to right, #ffffff, #f8fafc)' }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: `linear-gradient(135deg, ${color}20, ${color}10)`, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${color}20` }}>
          <Icon size={20} color={color} />
        </div>
        <div>
          <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '1rem' }}>{title}</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{subtitle}</div>
        </div>
      </div>
      <div style={{ padding: '1.5rem', flex: 1, background: '#fafcff' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: '#94a3b8', fontSize: '0.85rem' }}>
            <div style={{ width: 32, height: 32, border: `3px solid #e2e8f0`, borderTopColor: color, borderRadius: '50%', margin: '0 auto 1rem', animation: 'spin 0.8s linear infinite' }} />
            Processing predictive models...
          </div>
        ) : children}
      </div>
    </div>
  );
}

/* ── 1. Service Demand Forecast ── */
function ServiceDemandPanel({ data }) {
  if (!data) return null;
  const max = Math.max(...data.monthData.map(m => m.count), 1);
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <StatCard label="Peak Demand Months" value={data.peakMonths.length || 0} color={RED} />
        <StatCard label="Highest Request" value={data.topCertType?.type?.split(' ')[0] || '—'} color={ORANGE} sub={`${data.topCertType?.count || 0} issued`} />
      </div>
      <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 100, marginBottom: '1rem', background: '#fff', padding: '1rem', borderRadius: 12, border: '1px solid #e2e8f0' }}>
        {data.monthData.map((m, i) => {
          const h = Math.max(8, (m.count / max) * 100);
          const c = m.demand === 'HIGH' ? RED : m.demand === 'NORMAL' ? BLUE : '#cbd5e1';
          return (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div title={`${m.month}: ${m.count}`} style={{ width: '100%', height: h, background: c, borderRadius: '4px 4px 0 0', transition: 'height 0.5s' }} />
              <div style={{ fontSize: '0.6rem', color: '#64748b', fontWeight: 800 }}>{m.month}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── 2. Demographic Trends ── */
function DemographicPanel({ data }) {
  if (!data) return null;
  const groups = Object.entries(data.current.ageGroups);
  const total = data.current.total || 1;
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <StatCard label="Total Residents" value={data.current.total} color={BLUE} />
        <StatCard label="Seniors (Projected)" value={data.sectorGrowth.find(s=>s.sector==='Senior Citizens')?.projected || 0} color={ORANGE} sub="+9% Growth" />
      </div>
      <div style={{ background: '#fff', padding: '1rem', borderRadius: 12, border: '1px solid #e2e8f0' }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '1rem' }}>Age Group 3-Year Projection</div>
        {groups.map(([g, count]) => {
          const pct = Math.round((count / total) * 100);
          const proj = data.projected3yr[g] || 0;
          return (
            <div key={g} style={{ marginBottom: '0.8rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#334155' }}>{g} yrs</span>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Now: {count} <ArrowRight size={10} style={{display:'inline', margin:'0 2px'}}/> <b style={{ color: BLUE }}>{proj}</b></span>
              </div>
              <div style={{ height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: g === '60+' ? ORANGE : BLUE, borderRadius: 4, transition: 'width 0.8s' }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── 3. Incident Hotspot Forecast ── */
function HotspotPanel({ data }) {
  if (!data) return null;
  return (
    <div>
      {data.topRiskZone && (
        <div style={{ background: 'linear-gradient(to right, #fef2f2, #fff)', border: '1px solid #fca5a5', borderRadius: 12, padding: '1rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertTriangle size={24} color={RED} />
          </div>
          <div>
            <div style={{ fontWeight: 900, color: RED, fontSize: '0.95rem' }}>CRITICAL: {data.topRiskZone.barangay}</div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 2 }}>Risk Score: {data.topRiskZone.riskScore} · {data.topRiskZone.incidentCount} incidents recorded</div>
          </div>
        </div>
      )}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        {data.zones.map((z, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.85rem 1rem', borderBottom: i < data.zones.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: (RISK_COLOR[z.riskLevel] || BLUE) + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.75rem', color: RISK_COLOR[z.riskLevel] || BLUE }}>{i + 1}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#1e293b' }}>{z.barangay}</div>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Pop: {z.population}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <Badge label={z.riskLevel} color={RISK_COLOR[z.riskLevel]} />
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', marginTop: 4 }}>Score: {z.riskScore}</div>
            </div>
          </div>
        ))}
        {data.zones.length === 0 && <div style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem', fontSize: '0.85rem' }}>Insufficient data for hotspot modeling.</div>}
      </div>
    </div>
  );
}

/* ── 4. Health Risk Forecast ── */
function HealthRiskPanel({ data }) {
  if (!data) return null;
  const { summary, outbreakRisk, highRiskResidents } = data;
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <StatCard label="High Health Risk" value={summary.highRisk} color={RED} sub="2+ Vulnerabilities" />
        <StatCard label="Moderate Risk" value={summary.moderateRisk} color={ORANGE} sub="1 Vulnerability" />
      </div>
      <div style={{ background: outbreakRisk.level === 'HIGH' ? '#fef2f2' : '#fffbeb', border: `1px solid ${outbreakRisk.level === 'HIGH' ? '#fca5a5' : '#fde68a'}`, borderRadius: 12, padding: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: 6 }}>
          <Activity size={18} color={outbreakRisk.level === 'HIGH' ? RED : ORANGE} />
          <div style={{ fontWeight: 800, color: outbreakRisk.level === 'HIGH' ? RED : ORANGE, fontSize: '0.9rem' }}>
            Seasonal Outbreak Watch
          </div>
        </div>
        <div style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 600 }}>{outbreakRisk.type} ({outbreakRisk.season})</div>
      </div>
      {highRiskResidents.length > 0 && (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '1rem' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>Top At-Risk Individuals</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {highRiskResidents.slice(0, 5).map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 0.8rem', background: '#f8fafc', borderRadius: 8, border: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#1e293b' }}>{r.name}</span>
                <div style={{ display: 'flex', gap: 4 }}>
                  {r.factors.slice(0,2).map(f => <Badge key={f} label={f} color={RED} />)}
                  {r.factors.length > 2 && <Badge label={`+${r.factors.length-2}`} color="#64748b" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── 5. Calamity Vulnerability ── */
function CalamityPanel({ data }) {
  if (!data) return null;
  const { summary, households } = data;
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <StatCard label="Priority 1" value={summary.priority1} color={RED} sub="Critical Evac" />
        <StatCard label="Priority 2" value={summary.priority2} color={ORANGE} sub="High Need" />
        <StatCard label="Priority 3" value={summary.priority3} color={GREEN} sub="Standard" />
      </div>
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '1rem' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>Vulnerable Households</div>
        {households.slice(0, 4).map((h, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '0.75rem', borderRadius: 8, border: `1px solid ${(PRIORITY_COLOR[h.priority] || BLUE)}30`, marginBottom: '0.5rem', background: (PRIORITY_COLOR[h.priority] || BLUE) + '05' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#1e293b' }}>{h.householdNumber}</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 2 }}>{h.address}</div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 6 }}>
                {h.flags.slice(0,2).map((f, fi) => <Badge key={fi} label={f} color={PRIORITY_COLOR[h.priority]} />)}
              </div>
            </div>
            <Badge label={h.priority} color={PRIORITY_COLOR[h.priority]} />
          </div>
        ))}
        {households.length === 0 && <div style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem', fontSize: '0.85rem' }}>Add household records to enable vulnerability analysis.</div>}
      </div>
    </div>
  );
}

/* ── 6. Repeat Offender Pattern Detection (Panel Requirement) ── */
function RepeatOffenderPanel({ data }) {
  if (!data) return <div style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem', fontSize: '0.85rem' }}>Add KP Case records to enable pattern detection.</div>;
  const { summary, repeatOffenders, topCaseTypes, peakMonth } = data;
  const riskColor = { HIGH: RED, MODERATE: ORANGE, LOW: GREEN };
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.65rem', marginBottom: '1rem' }}>
        <StatCard label="Repeat Respondents" value={summary.total} color={RED} sub="≥2 KP cases" />
        <StatCard label="HIGH Risk" value={summary.highRisk} color={ORANGE} sub="Score ≥ 8" />
        <StatCard label="Cases Scanned" value={summary.totalCasesAnalyzed} color={BLUE} sub="Total KP records" />
      </div>
      {/* Privacy note */}
      <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 8, padding: '0.6rem 0.9rem', marginBottom: '1rem', fontSize: '0.72rem', color: '#92400e', display: 'flex', gap: '0.5rem' }}>
        <AlertTriangle size={13} style={{ flexShrink: 0, marginTop: 1 }} />
        <span>Case particulars are protected. Last names are partially masked (e.g., "Juan D***") per data privacy protocols.</span>
      </div>
      {/* Offender list */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '0.75rem' }}>
        <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>Top Repeat Respondents</div>
        {repeatOffenders.length === 0 && <div style={{ color: '#94a3b8', fontSize: '0.82rem', textAlign: 'center', padding: '1rem' }}>No repeat offenders found in current data.</div>}
        {repeatOffenders.slice(0, 5).map((r, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 0.5rem', borderBottom: i < 4 ? '1px solid #f1f5f9' : 'none' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1e293b' }}>{r.displayName}</div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{r.barangay} &middot; {r.totalCases} cases &middot; {r.activeCases} active</div>
            </div>
            <Badge label={r.riskLevel} color={riskColor[r.riskLevel] || BLUE} />
          </div>
        ))}
      </div>
      {/* Top case types */}
      {topCaseTypes?.length > 0 && (
        <div style={{ marginTop: '1rem', background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0', padding: '0.75rem' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>Top Case Types &mdash; Community Intervention Targets</div>
          {topCaseTypes.map((t, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', padding: '0.3rem 0', borderBottom: i < topCaseTypes.length - 1 ? '1px solid #f1f5f9' : 'none', color: '#334155' }}>
              <span>{t.type}</span><span style={{ fontWeight: 800, color: RED }}>{t.count}</span>
            </div>
          ))}
        </div>
      )}
      {peakMonth?.count > 0 && <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: '#64748b', textAlign: 'center' }}>Peak case filing month: <strong style={{ color: ORANGE }}>{peakMonth.month}</strong> ({peakMonth.count} cases)</div>}
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════ */
export default function AIAnalytics() {
  const [forecasts, setForecasts] = useState({
    serviceDemand: null, demographic: null, hotspot: null, health: null, calamity: null, roster: null, repeatOffenders: null,
  });
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);

  const loadAll = () => {
    setLoading(true);
    setLastRefresh(null);

    Promise.allSettled([
      api.get('/reports/forecast/service-demand'),
      api.get('/reports/forecast/demographic-trends'),
      api.get('/reports/forecast/incident-hotspots'),
      api.get('/reports/forecast/health-risk'),
      api.get('/reports/forecast/calamity-vulnerability'),
      api.get('/reports/barangay-case-roster'),
      api.get('/reports/forecast/repeat-offenders'),
    ]).then(results => {
      setForecasts({
        serviceDemand:    results[0].status === 'fulfilled' ? results[0].value.data : null,
        demographic:      results[1].status === 'fulfilled' ? results[1].value.data : null,
        hotspot:          results[2].status === 'fulfilled' ? results[2].value.data : null,
        health:           results[3].status === 'fulfilled' ? results[3].value.data : null,
        calamity:         results[4].status === 'fulfilled' ? results[4].value.data : null,
        roster:           results[5].status === 'fulfilled' ? results[5].value.data : null,
        repeatOffenders:  results[6].status === 'fulfilled' ? results[6].value.data : null,
      });
      setLastRefresh(new Date().toLocaleTimeString('en-PH'));
      setLoading(false);
    });
  };

  useEffect(() => { 
    loadAll(); 
    const interval = setInterval(loadAll, 5000);
    const onFocus = () => { if (document.visibilityState === 'visible') loadAll(); };
    document.addEventListener('visibilitychange', onFocus);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onFocus);
    };
  }, []);

  // Aggregate all DSS Insights for the Executive Summary
  const allInsights = [
    forecasts.repeatOffenders?.insight,
    forecasts.serviceDemand?.recommendation,
    forecasts.hotspot?.insight,
    forecasts.health?.insight,
    forecasts.calamity?.insight,
    forecasts.demographic?.insight,
  ].filter(Boolean);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Premium Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, #1e40af, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(124, 58, 237, 0.25)' }}>
            <BrainCircuit size={28} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontWeight: 900, fontSize: '1.75rem', color: '#0f172a', margin: '0 0 0.25rem 0', letterSpacing: '-0.03em' }}>Predictive Intelligence</h1>
            <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 500 }}>System-wide forecasting & actionable insights for LGU planning</div>
          </div>
        </div>
        <div>
          <button onClick={loadAll} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem', background: '#fff', border: '1px solid #cbd5e1', borderRadius: 10, fontWeight: 700, fontSize: '0.85rem', color: '#475569', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.02)' }}>
            <RefreshCw size={14} className={loading ? 'spin' : ''} /> {loading ? 'Analyzing Data...' : 'Refresh Models'}
          </button>
          {lastRefresh && <div style={{ fontSize: '0.7rem', color: '#94a3b8', textAlign: 'right', marginTop: 6, fontWeight: 600 }}>Last sync: {lastRefresh}</div>}
        </div>
      </div>

      {/* DSS Executive Summary (Top Full Width) */}
      <div style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)', borderRadius: 20, padding: '2rem', marginBottom: '2rem', color: '#fff', boxShadow: '0 10px 30px rgba(15, 23, 42, 0.2)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, background: 'radial-gradient(circle, rgba(124,58,237,0.3) 0%, rgba(0,0,0,0) 70%)', borderRadius: '50%' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <Zap size={22} color="#fbbf24" />
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, letterSpacing: '0.02em' }}>DSS Executive Summary — Actionable Insights</h2>
        </div>
        
        {loading ? (
           <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', color: '#94a3b8' }}>
             <div style={{ width: 20, height: 20, border: '2px solid #334155', borderTopColor: '#fbbf24', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
             Generating comprehensive intelligence report...
           </div>
        ) : allInsights.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {allInsights.map((insight, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', background: 'rgba(255,255,255,0.03)', padding: '1rem 1.25rem', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
                <CheckCircle2 size={18} color="#10b981" style={{ marginTop: 2, flexShrink: 0 }} />
                <span style={{ fontSize: '0.9rem', lineHeight: 1.6, color: '#e2e8f0', fontWeight: 500 }}>{insight}</span>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ color: '#94a3b8', fontSize: '0.9rem', fontStyle: 'italic' }}>Not enough data collected yet to generate executive insights. Please add more records.</div>
        )}
      </div>

      {/* Measurable Outputs Strip (Panel Requirement: measureable results) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(155px,1fr))', gap: '0.85rem', marginBottom: '2rem' }}>
        {[
          { label: 'Repeat Offenders', value: forecasts.repeatOffenders?.summary?.total ?? '—', sub: 'Pattern Detected', color: RED },
          { label: 'HIGH Risk Residents', value: forecasts.health?.summary?.highRisk ?? '—', sub: 'Multi-factor Risk', color: ORANGE },
          { label: 'Priority 1 Households', value: forecasts.calamity?.summary?.priority1 ?? '—', sub: 'DRRM Evacuation', color: PURPLE },
          { label: 'Cases Analyzed', value: forecasts.repeatOffenders?.summary?.totalCasesAnalyzed ?? '—', sub: 'KP Record Scan', color: TEAL },
          { label: 'Peak Demand Months', value: forecasts.serviceDemand?.peakMonths?.length ?? '—', sub: 'Service Forecast', color: BLUE },
        ].map((m,i) => <StatCard key={i} label={m.label} value={m.value} sub={m.sub} color={m.color} />)}
      </div>

      {/* Grid of Specialized Forecasting Modules */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: '1.5rem', paddingBottom: '3rem' }}>

        <DashboardCard icon={AlertTriangle} color={RED} title="Repeat Offender Pattern Detection" subtitle="Pattern recognition: respondents with ≥2 KP cases (names partially masked for privacy protection)" loading={loading}>
          <RepeatOffenderPanel data={forecasts.repeatOffenders} />
        </DashboardCard>

        <DashboardCard icon={MapPin} color={ORANGE} title="Security & Incident Hotspots" subtitle="Weighted risk score per barangay — guides Tanod deployment schedule" loading={loading}>
          <HotspotPanel data={forecasts.hotspot} />
        </DashboardCard>

        <DashboardCard icon={Shield} color={TEAL} title="Disaster & Calamity Vulnerability" subtitle="Priority evacuation list — house type + utilities + vulnerable members" loading={loading}>
          <CalamityPanel data={forecasts.calamity} />
        </DashboardCard>

        <DashboardCard icon={Heart} color={PURPLE} title="Health Risk & Outbreak Detection" subtitle="Seasonal disease forecast — multi-factor vulnerable resident mapping" loading={loading}>
          <HealthRiskPanel data={forecasts.health} />
        </DashboardCard>

        <DashboardCard icon={Calendar} color={RED} title="Service Demand Projection" subtitle="Threshold-based staffing forecast from certification issuance history" loading={loading}>
          <ServiceDemandPanel data={forecasts.serviceDemand} />
        </DashboardCard>

        <DashboardCard icon={Users} color={BLUE} title="Demographic Growth Trends" subtitle="Compound growth rate projection — 3-year sector population forecast" loading={loading}>
          <DemographicPanel data={forecasts.demographic} />
        </DashboardCard>
      </div>

    </div>
  );
}

