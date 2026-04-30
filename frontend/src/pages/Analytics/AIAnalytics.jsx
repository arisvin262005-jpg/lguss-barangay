import { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  TrendingUp, Users, MapPin, Heart, Shield,
  ChevronDown, ChevronUp, AlertTriangle, CheckCircle2,
  BarChart2, Calendar, Activity, Home, RefreshCw, Globe
} from 'lucide-react';

const BLUE   = '#1a4f8a';
const GREEN  = '#16a34a';
const ORANGE = '#d97706';
const RED    = '#dc2626';
const PURPLE = '#7c3aed';
const TEAL   = '#0891b2';

const RISK_COLOR = { HIGH: RED, CRITICAL: RED, ELEVATED: ORANGE, MODERATE: ORANGE, STABLE: GREEN, CLEAR: GREEN, LOW: GREEN, NORMAL: BLUE };
const PRIORITY_COLOR = { 'PRIORITY 1': RED, 'PRIORITY 2': ORANGE, 'PRIORITY 3': GREEN };

function StatCard({ label, value, color = BLUE, sub }) {
  return (
    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '0.9rem 1.1rem' }}>
      <div style={{ fontSize: '1.6rem', fontWeight: 900, color, lineHeight: 1 }}>{value ?? '—'}</div>
      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', marginTop: 4 }}>{label}</div>
      {sub && <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function Badge({ label, color }) {
  return (
    <span style={{
      display: 'inline-block', padding: '0.18rem 0.6rem', borderRadius: 100,
      fontSize: '0.62rem', fontWeight: 800, background: (color || BLUE) + '18',
      color: color || BLUE, border: `1px solid ${(color || BLUE)}33`,
    }}>{label}</span>
  );
}

function SectionCard({ icon: Icon, color, title, subtitle, children, loading }) {
  const [open, setOpen] = useState(true);
  return (
    <div style={{ border: `1.5px solid ${color}33`, borderRadius: 14, overflow: 'hidden', marginBottom: '1.25rem' }}>
      <div
        onClick={() => setOpen(o => !o)}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', background: `${color}0d`, cursor: 'pointer', borderBottom: open ? `1px solid ${color}22` : 'none' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{ width: 36, height: 36, borderRadius: 9, background: color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={18} color={color} />
          </div>
          <div>
            <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>{title}</div>
            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{subtitle}</div>
          </div>
        </div>
        {open ? <ChevronUp size={16} color="#94a3b8" /> : <ChevronDown size={16} color="#94a3b8" />}
      </div>
      {open && (
        <div style={{ padding: '1.25rem' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8', fontSize: '0.85rem' }}>
              <div style={{ width: 28, height: 28, border: `3px solid #e2e8f0`, borderTopColor: color, borderRadius: '50%', margin: '0 auto 0.75rem', animation: 'spin 0.8s linear infinite' }} />
              Calculating...
            </div>
          ) : children}
        </div>
      )}
    </div>
  );
}

/* ── 1. Service Demand Forecast ── */
function ServiceDemandPanel({ data }) {
  if (!data) return null;
  const max = Math.max(...data.monthData.map(m => m.count), 1);
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <StatCard label="Peak Months" value={data.peakMonths.length || 0} color={RED} />
        <StatCard label="Most Requested" value={data.topCertType?.type?.split(' ')[0] || '—'} color={ORANGE} sub={`${data.topCertType?.count || 0} issued`} />
        <StatCard label="Next Month Demand" value={data.nextMonthForecast?.demand || '—'} color={RISK_COLOR[data.nextMonthForecast?.demand] || BLUE} sub={data.nextMonthForecast?.month} />
      </div>
      <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 80, marginBottom: '1rem' }}>
        {data.monthData.map((m, i) => {
          const h = Math.max(6, (m.count / max) * 80);
          const c = m.demand === 'HIGH' ? RED : m.demand === 'NORMAL' ? BLUE : '#cbd5e1';
          return (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <div title={`${m.month}: ${m.count}`} style={{ width: '100%', height: h, background: c, borderRadius: '4px 4px 0 0', transition: 'height 0.5s' }} />
              <div style={{ fontSize: '0.55rem', color: '#94a3b8', fontWeight: 700 }}>{m.month}</div>
            </div>
          );
        })}
      </div>
      {data.peakMonths.length > 0 && (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: '0.75rem' }}>
          {data.peakMonths.map(m => <Badge key={m} label={`🔴 ${m} — HIGH`} color={RED} />)}
        </div>
      )}
      <div style={{ background: '#fefce8', border: '1px solid #fde68a', borderRadius: 8, padding: '0.75rem 1rem', fontSize: '0.8rem', color: '#92400e' }}>
        💡 {data.recommendation}
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <StatCard label="Total Residents" value={data.current.total} color={BLUE} />
        <StatCard label="Senior Citizens" value={data.current.senior} color={ORANGE} sub="+9% in 3yrs" />
        <StatCard label="PWD" value={data.current.pwd} color={PURPLE} sub="+4% in 3yrs" />
        <StatCard label="4Ps Beneficiary" value={data.current.fourPs} color={TEAL} />
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.6rem' }}>Age Group Distribution</div>
        {groups.map(([g, count]) => {
          const pct = Math.round((count / total) * 100);
          const proj = data.projected3yr[g] || 0;
          return (
            <div key={g} style={{ marginBottom: '0.6rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155' }}>{g} yrs</span>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{count} now → <b style={{ color: GREEN }}>{proj}</b> in 3yrs</span>
              </div>
              <div style={{ height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: g === '60+' ? ORANGE : BLUE, borderRadius: 4, transition: 'width 0.8s' }} />
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '0.75rem 1rem', fontSize: '0.8rem', color: '#166534' }}>
        📊 {data.insight}
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
        <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 10, padding: '0.85rem 1rem', marginBottom: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <AlertTriangle size={20} color={RED} />
          <div>
            <div style={{ fontWeight: 800, color: RED, fontSize: '0.88rem' }}>Highest Risk: {data.topRiskZone.barangay}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Risk Score: {data.topRiskZone.riskScore} · {data.topRiskZone.incidentCount} incidents · Peak month: {data.peakMonth?.month}</div>
          </div>
        </div>
      )}
      <div style={{ marginBottom: '1rem' }}>
        {data.zones.map((z, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: (RISK_COLOR[z.riskLevel] || BLUE) + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.75rem', color: RISK_COLOR[z.riskLevel] || BLUE }}>{i + 1}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1e293b' }}>{z.barangay}</div>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{z.incidentCount} incidents · pop. {z.population}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <Badge label={z.riskLevel} color={RISK_COLOR[z.riskLevel]} />
              <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: 3 }}>Score: {z.riskScore}</div>
            </div>
          </div>
        ))}
        {data.zones.length === 0 && <div style={{ color: '#94a3b8', textAlign: 'center', padding: '1.5rem', fontSize: '0.85rem' }}>No incident data yet. Add cases to enable hotspot analysis.</div>}
      </div>
      {data.insight && (
        <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 8, padding: '0.75rem 1rem', fontSize: '0.8rem', color: '#c2410c' }}>
          🗺️ {data.insight}
        </div>
      )}
    </div>
  );
}

/* ── 4. Health Risk Forecast ── */
function HealthRiskPanel({ data }) {
  if (!data) return null;
  const { summary, outbreakRisk, highRiskResidents, insight } = data;
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <StatCard label="High Risk" value={summary.highRisk} color={RED} sub="2+ risk factors" />
        <StatCard label="Moderate Risk" value={summary.moderateRisk} color={ORANGE} sub="1 risk factor" />
        <StatCard label="Low Risk" value={summary.lowRisk} color={GREEN} sub="No risk factors" />
      </div>
      <div style={{ background: outbreakRisk.level === 'HIGH' ? '#fef2f2' : '#fffbeb', border: `1px solid ${outbreakRisk.level === 'HIGH' ? '#fca5a5' : '#fde68a'}`, borderRadius: 10, padding: '0.85rem 1rem', marginBottom: '1rem' }}>
        <div style={{ fontWeight: 800, color: outbreakRisk.level === 'HIGH' ? RED : ORANGE, fontSize: '0.88rem', marginBottom: 4 }}>
          🦟 Seasonal Risk: {outbreakRisk.type}
        </div>
        <div style={{ fontSize: '0.78rem', color: '#475569' }}>{outbreakRisk.season} · <b>{outbreakRisk.action}</b></div>
      </div>
      {highRiskResidents.length > 0 && (
        <div>
          <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>High-Risk Residents (Top 10)</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {highRiskResidents.slice(0, 10).map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.4rem 0.7rem', background: '#fef2f2', borderRadius: 7, border: '1px solid #fecaca' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1e293b' }}>{r.name}</span>
                <div style={{ display: 'flex', gap: 4 }}>
                  {r.factors.map(f => <Badge key={f} label={f} color={RED} />)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {insight && <div style={{ marginTop: '0.75rem', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 8, padding: '0.75rem 1rem', fontSize: '0.8rem', color: '#075985' }}>❤️ {insight}</div>}
    </div>
  );
}

/* ── 5. Calamity Vulnerability ── */
function CalamityPanel({ data }) {
  if (!data) return null;
  const { summary, households, evacuationSites, insight } = data;
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <StatCard label="Priority 1" value={summary.priority1} color={RED} sub="Evacuate First" />
        <StatCard label="Priority 2" value={summary.priority2} color={ORANGE} sub="High Attention" />
        <StatCard label="Priority 3" value={summary.priority3} color={GREEN} sub="Standard" />
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>Vulnerable Households</div>
        {households.slice(0, 8).map((h, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '0.55rem 0.7rem', borderRadius: 8, border: `1px solid ${(PRIORITY_COLOR[h.priority] || BLUE)}33`, marginBottom: '0.4rem', background: (PRIORITY_COLOR[h.priority] || BLUE) + '08' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#1e293b' }}>{h.householdNumber} — {h.address}</div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 4 }}>
                {h.flags.map((f, fi) => <Badge key={fi} label={f} color={PRIORITY_COLOR[h.priority]} />)}
              </div>
            </div>
            <Badge label={h.priority} color={PRIORITY_COLOR[h.priority]} />
          </div>
        ))}
        {households.length === 0 && <div style={{ color: '#94a3b8', textAlign: 'center', padding: '1.5rem', fontSize: '0.85rem' }}>Add household records to enable vulnerability analysis.</div>}
      </div>
      <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '0.75rem 1rem', marginBottom: '0.75rem' }}>
        <div style={{ fontWeight: 700, fontSize: '0.78rem', color: GREEN, marginBottom: 4 }}>🏫 Designated Evacuation Sites</div>
        {evacuationSites.map((s, i) => <div key={i} style={{ fontSize: '0.8rem', color: '#334155' }}>• {s}</div>)}
      </div>
      {insight && <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 8, padding: '0.75rem 1rem', fontSize: '0.8rem', color: '#c2410c' }}>🛡️ {insight}</div>}
    </div>
  );
}

/* ── 6. Barangay Case Roster ── */
function RosterPanel({ data }) {
  if (!data) return null;
  const { summary, byBarangay } = data;
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <StatCard label="Total Involved" value={summary.totalInvolved} color={BLUE} />
        <StatCard label="High Risk" value={summary.highRisk} color={RED} sub="Score >= 6" />
        <StatCard label="Cross-Barangay" value={summary.crossBarangay} color={PURPLE} sub="Moved/Multiple" />
        <StatCard label="Total Barangays" value={summary.totalBarangays} color={TEAL} />
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>Barangay Case Intelligence</div>
        {byBarangay.map((b, i) => (
          <div key={i} style={{ marginBottom: '1rem', border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden' }}>
            <div style={{ background: '#f8fafc', padding: '0.6rem 1rem', fontWeight: 700, fontSize: '0.85rem', color: '#1e293b', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
              <span>{b.barangay}</span>
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>{b.residents.length} Residents · {b.totalCases} Cases</span>
            </div>
            <div style={{ padding: '0.5rem' }}>
              {b.residents.slice(0, 5).map((r, ri) => (
                <div key={ri} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.4rem 0.5rem', borderBottom: ri < Math.min(b.residents.length, 5) - 1 ? '1px solid #f1f5f9' : 'none' }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155' }}>{r.name}</div>
                    <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: 2 }}>{r.totalCases} Cases ({r.asRespondent}x Resp, {r.asComplainant}x Comp)</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <Badge label={r.riskLevel} color={RISK_COLOR[r.riskLevel]} />
                    {r.isCrossBarangay && <div style={{ fontSize: '0.6rem', color: PURPLE, fontWeight: 700, marginTop: 3 }}>📍 Cross-Brgy</div>}
                  </div>
                </div>
              ))}
              {b.residents.length > 5 && <div style={{ textAlign: 'center', padding: '0.5rem', fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600, background: '#f8fafc', borderRadius: 6, marginTop: 4 }}>+ {b.residents.length - 5} more residents</div>}
            </div>
          </div>
        ))}
      </div>
      <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 8, padding: '0.75rem 1rem', fontSize: '0.8rem', color: '#075985' }}>
        ⚖️ {data.methodology}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════ */
export default function AIAnalytics() {
  const [forecasts, setForecasts] = useState({
    serviceDemand: null, demographic: null, hotspot: null, health: null, calamity: null, roster: null,
  });
  const [loadingMap, setLoadingMap] = useState({
    serviceDemand: true, demographic: true, hotspot: true, health: true, calamity: true, roster: true,
  });
  const [lastRefresh, setLastRefresh] = useState(null);

  const loadAll = () => {
    setLoadingMap({ serviceDemand: true, demographic: true, hotspot: true, health: true, calamity: true, roster: true });
    setLastRefresh(null);

    const fetch1 = api.get('/reports/forecast/service-demand').then(r => setForecasts(f => ({ ...f, serviceDemand: r.data }))).catch(() => {}).finally(() => setLoadingMap(m => ({ ...m, serviceDemand: false })));
    const fetch2 = api.get('/reports/forecast/demographic-trends').then(r => setForecasts(f => ({ ...f, demographic: r.data }))).catch(() => {}).finally(() => setLoadingMap(m => ({ ...m, demographic: false })));
    const fetch3 = api.get('/reports/forecast/incident-hotspots').then(r => setForecasts(f => ({ ...f, hotspot: r.data }))).catch(() => {}).finally(() => setLoadingMap(m => ({ ...m, hotspot: false })));
    const fetch4 = api.get('/reports/forecast/health-risk').then(r => setForecasts(f => ({ ...f, health: r.data }))).catch(() => {}).finally(() => setLoadingMap(m => ({ ...m, health: false })));
    const fetch5 = api.get('/reports/forecast/calamity-vulnerability').then(r => setForecasts(f => ({ ...f, calamity: r.data }))).catch(() => {}).finally(() => setLoadingMap(m => ({ ...m, calamity: false })));
    const fetch6 = api.get('/reports/barangay-case-roster').then(r => setForecasts(f => ({ ...f, roster: r.data }))).catch(() => {}).finally(() => setLoadingMap(m => ({ ...m, roster: false })));

    Promise.all([fetch1, fetch2, fetch3, fetch4, fetch5, fetch6]).then(() => setLastRefresh(new Date().toLocaleTimeString('en-PH')));
  };

  useEffect(() => { loadAll(); }, []);

  return (
    <div style={{ maxWidth: 1100 }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg,#1a4f8a,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BarChart2 size={20} color="#fff" />
            </div>
            <span style={{ fontWeight: 900, fontSize: '1.4rem', color: '#0f172a' }}>Predictive Analytics</span>
          </div>
          <div style={{ fontSize: '0.85rem', color: '#64748b', paddingLeft: 48 }}>
            5 statistical forecasting features · Computed from live barangay data · No internet required
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {lastRefresh && <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>Updated {lastRefresh}</span>}
          <button onClick={loadAll} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 1rem', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 9, fontWeight: 700, fontSize: '0.8rem', color: '#475569', cursor: 'pointer' }}>
            <RefreshCw size={13} /> Refresh
          </button>
        </div>
      </div>

      {/* Feature Badges */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {[
          { label: '📄 Service Demand', color: RED },
          { label: '👥 Demographic Trends', color: BLUE },
          { label: '🗺️ Incident Hotspots', color: ORANGE },
          { label: '❤️ Health Risk', color: PURPLE },
          { label: '🛡️ Calamity Vulnerability', color: TEAL },
          { label: '🌐 System-Wide Case Roster', color: BLUE },
        ].map((b, i) => (
          <span key={i} style={{ padding: '0.3rem 0.8rem', borderRadius: 100, background: b.color + '12', border: `1px solid ${b.color}33`, fontSize: '0.75rem', fontWeight: 700, color: b.color }}>
            {b.label}
          </span>
        ))}
      </div>

      {/* 1. Service Demand */}
      <SectionCard icon={Calendar} color={RED} title="Service Demand Forecasting" subtitle="Predicts peak months for document requests (clearance, indigency, etc.)" loading={loadingMap.serviceDemand}>
        <ServiceDemandPanel data={forecasts.serviceDemand} />
      </SectionCard>

      {/* 2. Demographic Trends */}
      <SectionCard icon={Users} color={BLUE} title="Demographic Trend Analysis" subtitle="3-year population growth projection by age group and special sectors" loading={loadingMap.demographic}>
        <DemographicPanel data={forecasts.demographic} />
      </SectionCard>

      {/* 3. Incident Hotspot */}
      <SectionCard icon={MapPin} color={ORANGE} title="Incident Hotspot & Risk Mapping" subtitle="Identifies high-risk barangays and peak months for Tanod deployment planning" loading={loadingMap.hotspot}>
        <HotspotPanel data={forecasts.hotspot} />
      </SectionCard>

      {/* 4. Health Risk */}
      <SectionCard icon={Heart} color={PURPLE} title="Health Risk & Outbreak Forecasting" subtitle="Identifies vulnerable residents and seasonal disease outbreak risks" loading={loadingMap.health}>
        <HealthRiskPanel data={forecasts.health} />
      </SectionCard>

      {/* 5. Calamity Vulnerability */}
      <SectionCard icon={Shield} color={TEAL} title="Calamity Vulnerability Profiling" subtitle="Ranks households by DRRM vulnerability for priority evacuation planning" loading={loadingMap.calamity}>
        <CalamityPanel data={forecasts.calamity} />
      </SectionCard>

      {/* 6. System-Wide Case Roster */}
      <SectionCard icon={Globe} color={BLUE} title="System-Wide Barangay Case Roster" subtitle="Identifies cross-barangay repeat offenders and computes resident risk scores" loading={loadingMap.roster}>
        <RosterPanel data={forecasts.roster} />
      </SectionCard>
    </div>
  );
}
