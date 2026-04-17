import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { getBarangayInfo } from '../../config/barangays';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { FileText, Plus, Search, X, Save, Printer, CheckCircle, AlertCircle, XCircle, Clock } from 'lucide-react';

const CERT_TYPES = ['Barangay Clearance','Certificate of Residency','Certificate of Indigency','Business Permit Endorsement','Certificate of Good Moral Character'];
const STATUS_META = {
  Pending:    { cls: 'badge-yellow', icon: '🕐' },
  Processing: { cls: 'badge-blue',   icon: '⚙️' },
  Released:   { cls: 'badge-green',  icon: '✅' },
  'On Hold':  { cls: 'badge-yellow', icon: '⚠️' },
  Cancelled:  { cls: 'badge-red',    icon: '❌' },
};
const DSS_META = {
  Approve: { cls: 'badge-green',  label: '✅ CLEAR' },
  Hold:    { cls: 'badge-yellow', label: '⚠️ HOLD' },
  Flag:    { cls: 'badge-yellow', label: '🚩 FLAG' },
  Deny:    { cls: 'badge-red',    label: '❌ DENY' },
};

export default function Certifications() {
  const { user, hasRole } = useAuth();
  const [certs, setCerts] = useState([]);
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ residentId:'', certType:'Barangay Clearance', purpose:'' });
  const [saving, setSaving] = useState(false);
  const [dssResult, setDssResult] = useState(null);
  const [dssLoading, setDssLoading] = useState(false);
  const [selectedCert, setSelectedCert]= useState(null);
  const canEdit = hasRole('Admin','Secretary');

  useEffect(() => {
    api.get('/certifications').then(({ data }) => setCerts(data.data || [])).catch(() => {}).finally(() => setLoading(false));
    api.get('/residents').then(({ data }) => setResidents(data.data || []));
  }, []);

  const filtered = certs.filter(c =>
    `${c.residentName||''} ${c.certType} ${c.status}`.toLowerCase().includes(search.toLowerCase())
  );

  const runDss = async () => {
    if (!form.residentId) return;
    setDssLoading(true);
    try {
      const { data } = await api.post('/certifications/dss-check', { residentId: form.residentId, certType: form.certType });
      setDssResult(data);
    } catch {} finally { setDssLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const { data } = await api.post('/certifications', form);
      setCerts(prev => [data.data || data, ...prev]);
      setModal(null); setDssResult(null);
    } catch {} finally { setSaving(false); }
  };

  // ===== PRINT CERTIFICATE PDF =====
  const printCert = (cert) => {
    const img1 = new Image();
    img1.src = '/assets/mamburao_logo.png';
    const img2 = new Image();
    img2.src = '/assets/barangay_logo.png';

    img1.onload = () => {
      img2.onload = () => {
        generatePDF(cert, img1, img2);
      };
    };
  };

  const generatePDF = (cert, mamburaoLogo, barangayLogo) => {
    const resident = residents.find(r => r.id === cert.residentId);
    const brgyInfo  = getBarangayInfo(cert.barangay || user?.barangay);
    const doc = new jsPDF('p','mm','a4');
    const mx = 25, pw = 160;

    // Logos
    doc.addImage(mamburaoLogo, 'PNG', mx, 15, 24, 24);
    doc.addImage(barangayLogo, 'PNG', mx + pw - 24, 15, 24, 24);

    // Republic of the Philippines header
    doc.setFontSize(9); doc.setFont('helvetica','normal');
    doc.text('Republic of the Philippines', 105, 20, { align:'center' });
    doc.text('Province of Occidental Mindoro', 105, 25, { align:'center' });
    doc.text('Municipality of Mamburao', 105, 30, { align:'center' });
    doc.setFontSize(12); doc.setFont('helvetica','bold');
    doc.text(`BARANGAY ${(cert.barangay||user?.barangay||'').toUpperCase()}`, 105, 38, { align:'center' });

    // Decorative line
    doc.setLineWidth(0.8); doc.setDrawColor(26,79,138);
    doc.line(mx, 45, mx+pw, 45);
    doc.setLineWidth(0.3); doc.line(mx, 47, mx+pw, 47);

    // Office label
    doc.setFontSize(11); doc.setFont('helvetica','bold');
    doc.text('OFFICE OF THE BARANGAY SECRETARY', 105, 55, { align:'center' });

    // Certificate type
    doc.setFontSize(14); doc.setFont('helvetica','bold');
    doc.text(cert.certType.toUpperCase(), 105, 68, { align:'center' });
    doc.setLineWidth(0.5); doc.line(mx+20, 70, mx+pw-20, 70);

    // Body
    doc.setFontSize(11); doc.setFont('helvetica','normal');
    const name = resident ? `${resident.firstName} ${resident.middleName?.[0]?resident.middleName[0]+'. ':''} ${resident.lastName}` : 'N/A';
    doc.text('TO WHOM IT MAY CONCERN:', mx, 83);
    doc.setFont('helvetica','normal');
    const body = `      This is to certify that ${name.trim()}, of legal age, ${resident?.civilStatus||''}, ${resident?.citizenship||'Filipino'} citizen, is a bona fide resident of Barangay ${cert.barangay||user?.barangay}, Municipality of Mamburao, Occidental Mindoro.\n\n      This certification is issued upon the request of the above-named person for the purpose of ${cert.purpose || 'whatever legal purpose it may serve'}.`;
    const lines = doc.splitTextToSize(body, pw);
    doc.text(lines, mx, 95);

    // Ornum reference and date
    const today = new Date().toLocaleDateString('en-PH', { year:'numeric', month:'long', day:'numeric' });
    doc.text(`Issued this ${today} at Barangay ${cert.barangay||user?.barangay}, Mamburao, Occidental Mindoro.`, mx, 140);

    // Signatures
    doc.setFont('helvetica','bold');
    doc.text('_______________________________', mx+60, 165);
    doc.setFont('helvetica','normal');
    doc.text(`${brgyInfo?.captain || 'Barangay Captain'}`, mx+63, 171);
    doc.text('Punong Barangay', mx+68, 176);

    doc.text(`Certified by:`, mx, 165);
    doc.setFont('helvetica','bold');
    doc.text(`${brgyInfo?.secretary || user?.name || 'Barangay Secretary'}`, mx, 171);
    doc.setFont('helvetica','normal');
    doc.text('Barangay Secretary', mx, 176);

    // OR Number
    if (cert.orNumber) {
      doc.setFontSize(9);
      doc.text(`O.R. No.: ${cert.orNumber}`, mx, 205);
      doc.text(`Date: ${today}`, mx, 210);
    }

    // Bottom line
    doc.setLineWidth(0.3); doc.setDrawColor(26,79,138);
    doc.line(mx,240,mx+pw,240);
    doc.setFontSize(8); doc.setTextColor(100);
    doc.text('Not valid without official seal of the barangay.', 105, 245, { align:'center' });

    doc.save(`${cert.certType.replace(/ /g,'_')}_${name.trim().replace(/ /g,'_')}.pdf`);
  };

  return (
    <div style={{ maxWidth:1150 }}>
      <div className="page-header">
        <div><div className="page-title">Certifications & Issuances</div><div className="page-subtitle">Issue and manage barangay certifications with DSS eligibility check</div></div>
        {canEdit && <button className="btn btn-primary" onClick={()=>{ setForm({residentId:'',certType:'Barangay Clearance',purpose:''}); setDssResult(null); setModal('form'); }}><Plus size={16}/>Issue Certificate</button>}
      </div>

      {/* Stats row */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'1rem', marginBottom:'1.25rem' }}>
        {[['Released',certs.filter(c=>c.status==='Released').length,'badge-green'],['Pending',certs.filter(c=>c.status==='Pending').length,'badge-yellow'],['On Hold',certs.filter(c=>c.status==='On Hold').length,'badge-yellow'],['Cancelled',certs.filter(c=>c.status==='Cancelled').length,'badge-red']].map(([l,v,cls])=>(
          <div key={l} className="gov-card" style={{ padding:'0.875rem 1.25rem', textAlign:'center' }}>
            <div style={{ fontSize:'1.5rem',fontWeight:900 }}>{v}</div>
            <span className={`badge ${cls}`} style={{ marginTop:4 }}>{l}</span>
          </div>
        ))}
      </div>

      <div className="gov-card" style={{ marginBottom:'1.25rem',padding:'0.875rem 1.25rem' }}>
        <input className="form-input" placeholder="Search by resident name, type, or status..." value={search} onChange={e=>setSearch(e.target.value)} style={{ maxWidth:360 }} />
      </div>

      <div className="gov-card" style={{ overflow:'hidden' }}>
        <table className="gov-table">
          <thead><tr><th>Resident</th><th>Certificate Type</th><th>Purpose</th><th>DSS Result</th><th>Status</th><th>OR No.</th><th>Issued</th><th>Actions</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={8} style={{ padding:'2rem',textAlign:'center' }}>Loading...</td></tr>
            : filtered.map(c=>(
              <tr key={c.id}>
                <td style={{ fontWeight:600 }}>{c.residentName || c.residentId}</td>
                <td style={{ fontSize:'0.82rem' }}>{c.certType}</td>
                <td style={{ fontSize:'0.8rem',color:'#64748b',maxWidth:120 }}>{c.purpose}</td>
                <td>{c.dssDecision ? <span className={`badge ${DSS_META[c.dssDecision]?.cls||'badge-gray'}`} style={{ fontSize:'0.65rem' }}>{DSS_META[c.dssDecision]?.label||c.dssDecision}</span> : '—'}</td>
                <td><span className={`badge ${STATUS_META[c.status]?.cls||'badge-gray'}`} style={{ fontSize:'0.68rem' }}>{STATUS_META[c.status]?.icon} {c.status}</span></td>
                <td style={{ fontSize:'0.8rem' }}>{c.orNumber||'—'}</td>
                <td style={{ fontSize:'0.78rem',color:'#64748b' }}>{c.issuedAt ? new Date(c.issuedAt).toLocaleDateString('en-PH') : '—'}</td>
                <td>
                  {c.status==='Released' &&
                    <button onClick={()=>printCert(c)} className="btn btn-secondary btn-sm"><Printer size={13}/>Print</button>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Issue form modal */}
      {modal==='form' && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setModal(null)}>
          <div className="modal" style={{ maxWidth:520 }}>
            <div className="modal-header"><div className="modal-title">Issue Certificate</div><button onClick={()=>setModal(null)} className="btn-icon"><X size={16}/></button></div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Resident *</label>
                  <select className="form-select" required value={form.residentId} onChange={e=>{ setForm({...form,residentId:e.target.value}); setDssResult(null); }}>
                    <option value="">Select resident...</option>
                    {residents.map(r=><option key={r.id} value={r.id}>{r.lastName}, {r.firstName} — {r.barangay}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Certificate Type *</label>
                  <select className="form-select" value={form.certType} onChange={e=>setForm({...form,certType:e.target.value})}>
                    {CERT_TYPES.map(t=><option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Purpose *</label>
                  <input className="form-input" required value={form.purpose} onChange={e=>setForm({...form,purpose:e.target.value})} placeholder="e.g., Employment, PHILHEALTH, Banking..." />
                </div>

                {/* DSS Check */}
                <div style={{ background:'#f8fafc',border:'1px solid #dde3ed',borderRadius:8,padding:'0.875rem',marginTop:'0.5rem' }}>
                  <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.625rem' }}>
                    <span style={{ fontWeight:700,fontSize:'0.82rem',color:'#1a4f8a' }}>🤖 Decision Support System Check</span>
                    <button type="button" className="btn btn-outline btn-sm" onClick={runDss} disabled={!form.residentId||dssLoading}>
                      {dssLoading?'Checking...':'Run DSS Check'}
                    </button>
                  </div>
                  {dssResult && (
                    <div className={`alert ${{'Approve':'alert-success','Hold':'alert-warning','Flag':'alert-warning','Deny':'alert-danger'}[dssResult.decision]||'alert-info'}`} style={{ margin:0 }}>
                      <strong>{DSS_META[dssResult.decision]?.label}</strong> — {dssResult.reason}
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={()=>setModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving||dssResult?.decision==='Deny'}>
                  <Save size={14}/>{saving?'Issuing...':'Issue Certificate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
