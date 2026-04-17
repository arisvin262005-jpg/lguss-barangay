import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Database, Shield, CheckCircle2, Hash } from 'lucide-react';

export default function BlockchainAudit() {
  const [allBlocks, setAllBlocks] = useState([]);
  const [verification, setVerification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterRecord, setFilterRecord] = useState('');

  useEffect(() => {
    Promise.all([api.get('/audit'), api.get('/audit/verify')]).then(([a, v]) => {
      setAllBlocks(a.data.data || a.data);
      setVerification(v.data);
    }).catch(() => setLoading(false)).finally(() => setLoading(false));
  }, []);

  const ACTION_COLORS = { USER_REGISTERED: '#3b82f6', USER_LOGIN: '#6366f1', RESIDENT_CREATED: '#10b981', RESIDENT_UPDATED: '#f59e0b', RESIDENT_DELETED: '#ef4444', CERTIFICATION_CREATED: '#8b5cf6', CERTIFICATION_STATUS_UPDATED: '#f59e0b', CASE_FILED: '#ef4444', CASE_STATUS_UPDATED: '#f59e0b', DSS_EVALUATED: '#06b6d4', INCIDENT_REPORTED: '#f43f5e' };

  const filtered = filterRecord ? allBlocks.filter(b => b.recordId?.toLowerCase().includes(filterRecord.toLowerCase()) || b.action?.toLowerCase().includes(filterRecord.toLowerCase()) || b.actor?.toLowerCase().includes(filterRecord.toLowerCase())) : allBlocks;

  return (
    <div style={{ maxWidth: 1200 }}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <div className="page-title">Blockchain Audit Ledger</div>
          <div className="page-subtitle">Immutable SHA-256 hashed chain of all system actions — ensuring tamper-proof records</div>
        </div>
      </div>

      {/* Verification banner */}
      {verification && (
        <div className="gov-card" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', padding: '1rem 1.5rem', marginBottom: '1.5rem', borderLeft: `4px solid ${verification.valid ? '#10b981' : '#ef4444'}`, background: verification.valid ? '#f0fdf4' : '#fef2f2' }}>
          {verification.valid ? <CheckCircle2 size={24} color="#10b981" /> : <Shield size={24} color="#ef4444" />}
          <div>
            <div style={{ fontWeight: 800, color: verification.valid ? '#059669' : '#b91c1c', fontSize: '1.05rem' }}>
              Chain Integrity: {verification.valid ? 'Verified — No Tampering Detected' : 'ALERT: Chain Tampered!'}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>{verification.blocks} blocks verified via strict SHA-256 cryptographic hash chain</div>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.5rem', color: '#1e293b', lineHeight: 1.1 }}>{verification.blocks}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>Total Blocks</div>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="gov-card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <input className="form-input" style={{ width: '100%', maxWidth: 450 }} placeholder="Search hash, record ID, or actor..." value={filterRecord} onChange={(e) => setFilterRecord(e.target.value)} />
      </div>

      {/* Chain Table */}
      <div className="gov-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 50 }}>#</th>
                <th style={{ width: 140 }}>Action</th>
                <th>Record ID</th>
                <th>Actor</th>
                <th>Role</th>
                <th>Timestamp</th>
                <th>SHA-256 Hash</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8', fontWeight: 600 }}>Loading blockchain...</td></tr>
                : filtered.slice(0, 50).reverse().map((block) => (
                <tr key={block.index ?? block.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>{block.index ?? '—'}</td>
                  <td>
                    <span style={{ padding: '0.25rem 0.6rem', borderRadius: 6, fontSize: '0.7rem', fontWeight: 700, background: `${ACTION_COLORS[block.action] || '#64748b'}22`, color: ACTION_COLORS[block.action] || '#475569', display: 'inline-block' }}>{block.action}</span>
                  </td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#3b82f6', fontWeight: 600 }}>{block.recordId?.slice(0, 16) || '—'}</td>
                  <td style={{ fontSize: '0.85rem', color: '#1e293b', fontWeight: 600 }}>{block.actor}</td>
                  <td style={{ fontSize: '0.75rem', color: '#64748b' }}>{block.actorRole}</td>
                  <td style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 500 }}>{block.timestamp ? new Date(block.timestamp).toLocaleString('en-PH', { year: '2-digit', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#f8fafc', padding: '4px 8px', borderRadius: 6, border: '1px solid #e2e8f0', width: 'fit-content' }}>
                      <Hash size={12} color="#94a3b8" />
                      <span style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: '#475569', fontWeight: 500 }}>{block.hash?.slice(0, 24)}...</span>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && !loading && <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>No blocks found in the chain.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      
      <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: '#64748b', textAlign: 'center', fontWeight: 600 }}>
        Showing {Math.min(filtered.length, 50)} of {filtered.length} blocks • Powered by Cryptographic SHA-256 Hashing Algorithm
      </div>
    </div>
  );
}
