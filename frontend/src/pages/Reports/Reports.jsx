import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { FileDown, Download, BarChart3, TrendingUp, Users, Scale, FileText, RefreshCw, AlertCircle } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Papa from 'papaparse';

const EMPTY_CASES = { Filed: 0, Mediation: 0, Settled: 0, Escalated: 0, Dismissed: 0 };

const buildEmptyReports = () => ({
  certs: [],
  cases: { ...EMPTY_CASES },
  residents: [],
  time: {
    timeSavedPercent: 0,
    avgSystemProcessingMins: 0,
    avgManualProcessingMins: 45,
    totalHoursSaved: 0,
    certificationsIssued: 0,
  },
  dups: { duplicateReductionRate: 0, repeatInvolvedParties: 0, totalResidents: 0 },
});

/** Demo KPIs when API is unavailable (offline demo login / server waking up) */
const buildDemoReports = () => ({
  certs: [],
  cases: { Filed: 2, Mediation: 1, Settled: 5, Escalated: 0, Dismissed: 1 },
  residents: [],
  time: {
    timeSavedPercent: 82.2,
    avgSystemProcessingMins: 8,
    avgManualProcessingMins: 45,
    totalHoursSaved: 12.5,
    certificationsIssued: 20,
  },
  dups: { duplicateReductionRate: 67.3, repeatInvolvedParties: 3, totalResidents: 150 },
});

const pick = (result, mapFn, fallback) =>
  result.status === 'fulfilled' ? mapFn(result.value) : fallback;

export default function Reports() {
  const { hasRole, user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [usingDemo, setUsingDemo] = useState(false);

  const loadReports = useCallback(async () => {
    if (!hasRole('Admin', 'Secretary')) { setLoading(false); return; }
    setLoading(true);
    setLoadError('');

    const fallback = user?.isOfflineMode ? buildDemoReports() : buildEmptyReports();

    const results = await Promise.allSettled([
      api.get('/reports/certifications'),
      api.get('/reports/cases'),
      api.get('/reports/residents'),
      api.get('/reports/time-saved'),
      api.get('/reports/duplicates'),
    ]);

    const okCount = results.filter((r) => r.status === 'fulfilled').length;
    const mergeTime = (raw, fb) => ({
      ...fb,
      ...(raw && typeof raw === 'object' ? raw : {}),
      totalHoursSaved: Number(raw?.totalHoursSaved ?? fb.totalHoursSaved) || 0,
      certificationsIssued: Number(raw?.certificationsIssued ?? fb.certificationsIssued) || 0,
      timeSavedPercent: Number(raw?.timeSavedPercent ?? fb.timeSavedPercent) || 0,
      avgSystemProcessingMins: Number(raw?.avgSystemProcessingMins ?? fb.avgSystemProcessingMins) || 0,
      avgManualProcessingMins: Number(raw?.avgManualProcessingMins ?? fb.avgManualProcessingMins) || 45,
    });
    const mergeDups = (raw, fb) => ({
      ...fb,
      ...(raw && typeof raw === 'object' ? raw : {}),
      duplicateReductionRate: Number(raw?.duplicateReductionRate ?? fb.duplicateReductionRate) || 0,
      repeatInvolvedParties: Number(raw?.repeatInvolvedParties ?? fb.repeatInvolvedParties) || 0,
      totalResidents: Number(raw?.totalResidents ?? fb.totalResidents) || 0,
    });
    const next = {
      certs: pick(results[0], (r) => (Array.isArray(r.data?.data) ? r.data.data : []), fallback.certs),
      cases: pick(results[1], (r) => (r.data?.summary && typeof r.data.summary === 'object' ? r.data.summary : EMPTY_CASES), fallback.cases),
      residents: pick(results[2], (r) => (Array.isArray(r.data?.data) ? r.data.data : []), fallback.residents),
      time: pick(results[3], (r) => mergeTime(r.data, fallback.time), fallback.time),
      dups: pick(results[4], (r) => mergeDups(r.data, fallback.dups), fallback.dups),
    };

    setData(next);
    setUsingDemo(user?.isOfflineMode || okCount === 0);
    if (okCount === 0) {
      setLoadError(
        user?.isOfflineMode
          ? 'Offline demo mode — showing sample KPIs. Connect online for live municipal data.'
          : 'Could not reach the reports API. The server may be waking up — click Retry or check your connection.'
      );
    }
    setLoading(false);
  }, [hasRole, user?.isOfflineMode]);

  useEffect(() => { loadReports(); }, [loadReports]);

  if (!hasRole('Admin', 'Secretary')) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-light)' }}>Access Restricted</div>;
  if (loading) return (
    <div style={{ padding: '4rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div className="animate-spin" style={{ width: 40, height: 40, border: '4px solid rgba(26,79,138,0.2)', borderTopColor: '#1a4f8a', borderRadius: '50%', marginBottom: '1rem' }} />
      <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Loading reports and generating analytics...</span>
    </div>
  );

  const exportCSV = (type) => {
    let csvData = [];
    let filename = '';
    if (type === 'residents') {
      csvData = data.residents.map(r => ({ ID: r.id, Name: `${r.lastName}, ${r.firstName}`, Age: new Date().getFullYear() - new Date(r.birthDate).getFullYear(), Gender: r.gender, CivilStatus: r.civilStatus, Barangay: r.barangay }));
      filename = 'Resident_Masterlist';
    } else if (type === 'certs') {
      csvData = data.certs.map(c => ({ ID: c.id, Resident: c.residentName, Type: c.certType, Purpose: c.purpose, Status: c.status, Date: new Date(c.issuedAt).toLocaleDateString() }));
      filename = 'Certification_Log';
    }
    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const exportPDF = (type) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Department of the Interior and Local Government', 14, 15);
    doc.setFontSize(12);
    doc.text(`Barangay Management System - Mamburao (${user.role === 'Admin' ? 'All Barangays' : user.barangay})`, 14, 22);

    if (type === 'residents') {
      doc.text('Resident Masterlist', 14, 32);
      const rows = data.residents.map(r => [r.lastName+', '+r.firstName, r.gender, r.civilStatus, r.barangay]);
      doc.autoTable({ startY: 38, head: [['Name', 'Gender', 'Status', 'Barangay']], body: rows });
    } else if (type === 'certs') {
      doc.text('Certification Issuance Log', 14, 32);
      const rows = data.certs.map(c => [c.residentName, c.certType, c.status, new Date(c.issuedAt).toLocaleDateString()]);
      doc.autoTable({ startY: 38, head: [['Resident', 'Type', 'Status', 'Date']], body: rows });
    }
    doc.save(`${type}_report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const ReportCard = ({ title, icon: Icon, color, children }) => (
    <div className="gov-card hover-float" style={{ display: 'flex', flexDirection: 'column', height: '100%', borderTop: `4px solid ${color}` }}>
      <div className="gov-card-header" style={{ borderBottom: 'none', paddingBottom: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ padding: '0.5rem', borderRadius: 8, background: `${color}15`, color: color }}>
            <Icon size={22} />
          </div>
          <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text)' }}>{title}</div>
        </div>
      </div>
      <div className="gov-card-body" style={{ flex: 1, paddingTop: '0.5rem' }}>{children}</div>
    </div>
  );

  if (!data) return (
    <div style={{ padding: '3rem 2rem', textAlign: 'center' }}>
      <AlertCircle size={40} color="#d97706" style={{ margin: '0 auto 1rem' }} />
      <p style={{ fontWeight: 700, marginBottom: '1rem' }}>Reports could not be loaded.</p>
      <button type="button" className="btn btn-primary" onClick={loadReports}><RefreshCw size={16} /> Retry</button>
    </div>
  );

  return (
    <div className="animate-in" style={{ width: '100%', margin: '0 auto' }}>
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title">Reports & Analytics</h1>
          <p className="page-subtitle">Exportable community data and key performance indicators.</p>
        </div>
        <button type="button" className="btn btn-outline btn-sm" onClick={loadReports} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {loadError && (
        <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 10, padding: '0.85rem 1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: '0.9rem', color: '#92400e' }}>
          <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 2 }} />
          <span>{loadError}{usingDemo ? ' (Demo KPIs shown below.)' : ''}</span>
        </div>
      )}

      {/* KPI Row */}
      <div className="grid-3" style={{ marginBottom: '2.5rem' }}>
        <ReportCard title="Time Saved (DSS)" icon={TrendingUp} color="#16a34a">
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '2.5rem', fontWeight: 900, color: '#16a34a', lineHeight: 1 }}>{data.time?.timeSavedPercent ?? 0}%</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>faster processing</span>
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text)', lineHeight: 1.6, background: 'var(--surface-2)', padding: '0.75rem', borderRadius: 8 }}>
            System average: <strong>{data.time?.avgSystemProcessingMins ?? 0} mins</strong> vs Manual: <strong>{data.time?.avgManualProcessingMins ?? 45} mins</strong>.
            <br/><br/>
            Total of <strong>{(data.time?.totalHoursSaved ?? 0).toFixed(1)} hours</strong> saved across <strong>{data.time?.certificationsIssued ?? 0}</strong> certifications.
          </div>
        </ReportCard>

        <ReportCard title="KP Effectiveness" icon={Scale} color="#0284c7">
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0284c7', lineHeight: 1 }}>{data.dups?.duplicateReductionRate ?? 0}%</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>dispute reduction</span>
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text)', lineHeight: 1.6, background: 'var(--surface-2)', padding: '0.75rem', borderRadius: 8 }}>
            <strong>{data.dups?.repeatInvolvedParties ?? 0}</strong> repeat offenders successfully flagged by the Decision Support System over a total base of <strong>{data.dups?.totalResidents ?? 0}</strong> recorded residents.
          </div>
        </ReportCard>

        <ReportCard title="Cases Overview" icon={BarChart3} color="#d97706">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.5rem' }}>
            {Object.entries(data.cases || EMPTY_CASES).map(([status, count]) => (
              <div key={status} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.75rem', background: 'var(--surface-2)', borderRadius: 6, border: '1px solid var(--border)' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>{status}</span>
                <span style={{ fontWeight: 800, color: 'var(--text)', fontSize: '1.1rem' }}>{count}</span>
              </div>
            ))}
          </div>
        </ReportCard>
      </div>

      {/* Export Row */}
      <div className="section-stripe" style={{ marginBottom: '1.5rem', background: 'linear-gradient(90deg, #1a4f8a, #0ea5e9)' }}>
        <FileText size={18} /> Generate Official Documents
      </div>
      
      <div className="grid-2" style={{ gap: '1.5rem' }}>
        <div className="gov-card hover-float" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ padding: '0.75rem', borderRadius: 12, background: 'rgba(26,79,138,0.1)' }}>
              <Users size={28} color="#1a4f8a" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--text)' }}>Resident Masterlist</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Standard DILG demographic export.</div>
            </div>
          </div>
          <div style={{ background: 'var(--surface-2)', padding: '0.75rem 1rem', borderRadius: 8, fontSize: '0.85rem', color: 'var(--text)', marginBottom: '1.5rem', borderLeft: '3px solid #1a4f8a' }}>
            <strong>{data.residents.length}</strong> resident records available for extraction.
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: 'auto' }}>
            <button onClick={() => exportCSV('residents')} className="btn btn-outline" style={{ flex: 1, justifyContent: 'center', fontWeight: 700 }}><FileDown size={18}/> Export CSV</button>
            <button onClick={() => exportPDF('residents')} className="btn btn-primary" style={{ flex: 1, justifyContent: 'center', fontWeight: 700, background: '#dc2626', borderColor: '#dc2626' }}><Download size={18}/> Print PDF</button>
          </div>
        </div>

        <div className="gov-card hover-float" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ padding: '0.75rem', borderRadius: 12, background: 'rgba(26,79,138,0.1)' }}>
              <FileText size={28} color="#1a4f8a" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--text)' }}>Certification Log</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Log of all released & pending issuances.</div>
            </div>
          </div>
          <div style={{ background: 'var(--surface-2)', padding: '0.75rem 1rem', borderRadius: 8, fontSize: '0.85rem', color: 'var(--text)', marginBottom: '1.5rem', borderLeft: '3px solid #1a4f8a' }}>
            <strong>{data.certs.length}</strong> certification logs available for extraction.
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: 'auto' }}>
            <button onClick={() => exportCSV('certs')} className="btn btn-outline" style={{ flex: 1, justifyContent: 'center', fontWeight: 700 }}><FileDown size={18}/> Export CSV</button>
            <button onClick={() => exportPDF('certs')} className="btn btn-primary" style={{ flex: 1, justifyContent: 'center', fontWeight: 700, background: '#dc2626', borderColor: '#dc2626' }}><Download size={18}/> Print PDF</button>
          </div>
        </div>
      </div>
    </div>
  );
}
