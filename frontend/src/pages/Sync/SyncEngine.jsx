import { useSync } from '../../context/SyncContext';
import { RefreshCw, CheckCircle2, Clock, XCircle, Wifi, WifiOff, AlertTriangle, ArrowRight, Database, Server, HardDrive, Cloud } from 'lucide-react';

export default function SyncEngine() {
  const { isOnline, syncStats, syncStatus, triggerSync, retryFailed } = useSync();

  const steps = [
    { icon: HardDrive, label: 'User Action', sub: 'Create / Update / Delete', color: '#1a4f8a' },
    { icon: Database, label: 'LocalStorage (Queue)', sub: 'Local Sandbox Storage', color: '#f59e0b' },
    { icon: RefreshCw, label: 'Sync Pipeline', sub: 'Online Reconnect', color: '#3b82f6' },
    { icon: Cloud, label: 'Firestore (Remote)', sub: 'DILG Cloud Database', color: '#10b981' },
  ];

  return (
    <div style={{ maxWidth: 1000 }}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <div className="page-title">Offline-First Sync Engine</div>
          <div className="page-subtitle">Real-time synchronization status — LocalStorage → Firebase Firestore architecture</div>
        </div>
      </div>

      {/* Connection status */}
      <div className="gov-card" style={{ padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'space-between', flexWrap: 'wrap', borderLeft: `4px solid ${isOnline ? '#10b981' : '#ef4444'}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {isOnline ? <Wifi size={24} color="#10b981" /> : <WifiOff size={24} color="#ef4444" />}
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: isOnline ? '#059669' : '#b91c1c' }}>{isOnline ? 'Online — Sync Engine Active' : 'Offline — Local Mode'}</div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>{isOnline ? 'Data is currently linked and pushing to Firebase server.' : 'No internet. Working in Offline Sandbox. Will sync on reconnect.'}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.625rem' }}>
          {isOnline && <button className="btn-primary" onClick={triggerSync} style={{ padding: '0.5rem 1rem' }}><RefreshCw size={16} />Force Sync</button>}
          {syncStats.failed > 0 && <button className="btn-danger" onClick={retryFailed} style={{ padding: '0.5rem 1rem' }}>Retry Failed ({syncStats.failed})</button>}
        </div>
      </div>

      {/* Sync stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[['Synced Output', syncStats.synced, CheckCircle2, '#10b981', '#dcfce7'], 
          ['Offline Queue', syncStats.pending, Clock, '#f59e0b', '#fef3c7'], 
          ['Failed Push', syncStats.failed, XCircle, '#ef4444', '#fee2e2'], 
          ['Success Rate', `${syncStats.successRate}%`, RefreshCw, '#1a4f8a', '#dbeafe']].map(([label, val, Icon, color, bg]) => (
          <div key={label} className="gov-card" style={{ padding: '1.25rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
              <Icon size={20} color={color} />
            </div>
            <div style={{ fontWeight: 800, fontSize: '1.8rem', color: '#1e293b', lineHeight: 1.1 }}>{val}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, marginTop: '0.25rem' }}>{label.toUpperCase()}</div>
          </div>
        ))}
      </div>

      {/* Sync progress bar */}
      <div className="gov-card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.85rem' }}>
          <span style={{ fontWeight: 700, color: '#1e293b' }}>Overall Synchronization Progress</span>
          <span style={{ color: '#10b981', fontWeight: 800 }}>{syncStats.successRate}%</span>
        </div>
        <div style={{ height: 10, borderRadius: 5, background: '#f1f5f9', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${syncStats.successRate}%`, background: '#10b981', borderRadius: 5, transition: 'width 0.5s ease' }} />
        </div>
        {syncStatus === 'syncing' && <div style={{ fontSize: '0.8rem', color: '#3b82f6', marginTop: '0.5rem', fontWeight: 600 }}>⟳ Sync in progress...</div>}
        {syncStatus === 'complete' && <div style={{ fontSize: '0.8rem', color: '#10b981', marginTop: '0.5rem', fontWeight: 600 }}>✓ Sync complete!</div>}
      </div>

      {/* Architecture Diagram */}
      <div className="gov-card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
        <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#1a4f8a', marginBottom: '2rem', textAlign: 'center' }}>BIMS Offline-First Architecture</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: 0, overflowX: 'auto' }}>
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={step.label} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ textAlign: 'center', padding: '0.75rem', width: 140 }}>
                  <div style={{ width: 64, height: 64, borderRadius: 16, background: '#fff', border: `2px solid ${step.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem', boxShadow: `0 4px 12px ${step.color}22` }}>
                    <Icon size={28} color={step.color} />
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1e293b' }}>{step.label}</div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, marginTop: 4 }}>{step.sub}</div>
                </div>
                {i < steps.length - 1 && <ArrowRight size={20} color="#cbd5e1" style={{ margin: '0 0.25rem', flexShrink: 0 }} />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Concept Guide */}
      <div className="gov-card" style={{ padding: '1.5rem' }}>
        <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#1a4f8a', marginBottom: '1.25rem' }}>Conflict Resolution & Storage Strategy</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          {[
            ['Conflict Strategy', 'Last-Write-Wins with timestamp comparison. Newer offline timestamp always takes precedence during real-time sync.', '#3b82f6'],
            ['Retry Queue', 'Failed network push attempts are queued and retried automatically on reconnect with visual tracing indicators.', '#f59e0b'],
            ['Local-First Storage', 'All database writes go to PouchDB offline sandbox first — absolutely zero data loss on network failure.', '#10b981'],
            ['Selective Mirroring', 'The sync engine replicates only the barangay scope of the active user to reduce local storage footprint.', '#7c3aed'],
          ].map(([title, desc, color]) => (
            <div key={title} style={{ padding: '1rem', borderRadius: 8, background: '#f8fafc', borderLeft: `3px solid ${color}` }}>
              <div style={{ fontWeight: 800, color: '#1e293b', fontSize: '0.9rem', marginBottom: '0.35rem' }}>{title}</div>
              <p style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.5, fontWeight: 500, margin: 0 }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
