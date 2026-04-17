import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { AlertTriangle, Plus, X, Save, Eye } from 'lucide-react';

const PRIORITY = { Low:'badge-gray', Medium:'badge-yellow', High:'badge-red', Critical:'badge-red' };
const STATUS   = { Open:'badge-blue', 'Under Investigation':'badge-yellow', Resolved:'badge-green', Closed:'badge-gray' };

export default function Incidents() {
  const { hasRole } = useAuth();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ type:'General Complaint', description:'', priority:'Medium', isVawc:false, complainantId:'' });
  const [residents, setResidents] = useState([]);
  const [saving, setSaving] = useState(false);
  const canFile = hasRole('Admin','Secretary','Tanod');
  const canViewVawc = hasRole('Admin');

  useEffect(() => {
    api.get('/incidents').then(({ data }) => setIncidents(data.data || [])).catch(() => {}).finally(() => setLoading(false));
    api.get('/residents').then(({ data }) => setResidents(data.data || []));
  }, []);

  const filtered = incidents.filter(i => tab === 'vawc' ? i.isVawc : tab === 'general' ? !i.isVawc : true);

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const { data } = await api.post('/incidents', form);
      setIncidents(prev => [data.data, ...prev]);
      setModal(null);
    } catch {} finally { setSaving(false); }
  };

  return (
    <div style={{ maxWidth:1100 }}>
      <div className="page-header">
        <div><div className="page-title">Incidents & Complaints</div><div className="page-subtitle">File and track barangay complaints including VAWC cases</div></div>
        {canFile && <button className="btn btn-primary" onClick={()=>{ setForm({ type:'General Complaint',description:'',priority:'Medium',isVawc:false,complainantId:'' }); setModal('form'); }}><Plus size={16}/>File Complaint</button>}
      </div>

      <div className="tab-bar" style={{ marginBottom:'1.25rem' }}>
        {[['all','All Incidents'],['general','General Complaints'],['vawc','VAWC Cases']].map(([k,l])=>(
          <button key={k} className={`tab-btn${tab===k?' active':''}`} onClick={()=>setTab(k)}>{l}
            {k==='vawc'&&<span className="badge badge-red" style={{ marginLeft:4,fontSize:'0.65rem' }}>{incidents.filter(i=>i.isVawc).length}</span>}
          </button>
        ))}
      </div>

      {tab === 'vawc' && !canViewVawc && (
        <div className="alert alert-warning" style={{ marginBottom:'1.25rem' }}>
          <AlertTriangle size={16}/>VAWC case details are restricted. Only Admin users can view full VAWC records.
        </div>
      )}

      <div className="gov-card" style={{ overflow:'hidden' }}>
        <table className="gov-table">
          <thead><tr><th>Type</th><th>Complainant</th><th>Priority</th><th>Status</th><th>Posted</th><th>Description</th><th>Actions</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={7} style={{ padding:'2rem',textAlign:'center' }}>Loading...</td></tr>
            : filtered.map(inc=>(
              <tr key={inc.id}>
                <td><span className={`badge ${inc.isVawc?'badge-red':'badge-blue'}`} style={{ fontSize:'0.68rem' }}>{inc.isVawc?'🚨 VAWC':inc.type}</span></td>
                <td style={{ fontWeight:500,fontSize:'0.82rem' }}>{inc.complainantName}</td>
                <td><span className={`badge ${PRIORITY[inc.priority]||'badge-gray'}`} style={{ fontSize:'0.68rem' }}>{inc.priority}</span></td>
                <td><span className={`badge ${STATUS[inc.status]||'badge-gray'}`} style={{ fontSize:'0.68rem' }}>{inc.status}</span></td>
                <td style={{ fontSize:'0.75rem',color:'#64748b' }}>{new Date(inc.filedAt).toLocaleDateString('en-PH')}</td>
                <td style={{ fontSize:'0.78rem',color:'#475569',maxWidth:200 }}>{inc.description?.substring(0,60)}{inc.description?.length>60?'...':''}</td>
                <td><button onClick={()=>{ setSelected(inc); setModal('view'); }} className="btn-icon"><Eye size={14} color="#1a4f8a"/></button></td>
              </tr>
            ))}
            {!loading && filtered.length===0 && <tr><td colSpan={7} style={{ textAlign:'center',padding:'2.5rem',color:'#94a3b8' }}>No incidents found</td></tr>}
          </tbody>
        </table>
      </div>

      {/* File modal */}
      {modal==='form' && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setModal(null)}>
          <div className="modal" style={{ maxWidth:520 }}>
            <div className="modal-header"><div className="modal-title">File Complaint / Incident</div><button onClick={()=>setModal(null)} className="btn-icon"><X size={16}/></button></div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-group"><label className="form-label">Complainant (Resident)</label><select className="form-select" value={form.complainantId} onChange={e=>setForm({...form,complainantId:e.target.value})}><option value="">Anonymous / Walk-in</option>{residents.map(r=><option key={r.id} value={r.id}>{r.lastName}, {r.firstName}</option>)}</select></div>
                <div className="grid-2">
                  <div className="form-group"><label className="form-label">Incident Type</label><select className="form-select" value={form.type} onChange={e=>setForm({...form,type:e.target.value})}>{['General Complaint','Neighbor Dispute','Property Damage','Noise Disturbance','Illegal Dumping','Others'].map(t=><option key={t}>{t}</option>)}</select></div>
                  <div className="form-group"><label className="form-label">Priority</label><select className="form-select" value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})}>{['Low','Medium','High','Critical'].map(p=><option key={p}>{p}</option>)}</select></div>
                </div>
                <div className="form-group"><label className="form-label">Description *</label><textarea className="form-textarea" required value={form.description} onChange={e=>setForm({...form,description:e.target.value})} rows={4} /></div>
                {hasRole('Admin','Secretary') && (
                  <label style={{ display:'flex',alignItems:'center',gap:'0.5rem',padding:'0.75rem',background:'rgba(220,38,38,0.05)',border:'1px solid rgba(220,38,38,0.15)',borderRadius:8,cursor:'pointer',fontSize:'0.82rem',fontWeight:600,color:'#dc2626' }}>
                    <input type="checkbox" checked={form.isVawc} onChange={e=>setForm({...form,isVawc:e.target.checked,type:e.target.checked?'VAWC':form.type})} style={{ accentColor:'#dc2626' }}/>
                    🚨 This is a VAWC (Violence Against Women and Children) Case — details will be encrypted and access-restricted
                  </label>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={()=>setModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}><Save size={14}/>{saving?'Filing...':'File Incident'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View modal */}
      {modal==='view' && selected && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setModal(null)}>
          <div className="modal" style={{ maxWidth:460 }}>
            <div className="modal-header"><div className="modal-title">{selected.isVawc?'🚨 VAWC Case':selected.type}</div><button onClick={()=>setModal(null)} className="btn-icon"><X size={16}/></button></div>
            <div className="modal-body">
              <div className="grid-2" style={{ gap:'0.75rem', marginBottom:'1rem' }}>
                {[['Complainant',selected.complainantName],['Priority',selected.priority],['Status',selected.status],['Filed',new Date(selected.filedAt).toLocaleDateString('en-PH')],['Barangay',selected.barangay]].map(([l,v])=>(
                  <div key={l}><div style={{ fontSize:'0.68rem',fontWeight:700,color:'#94a3b8',textTransform:'uppercase',marginBottom:2}}>{l}</div><div style={{ fontSize:'0.85rem',fontWeight:500}}>{v}</div></div>
                ))}
              </div>
              <div><div style={{ fontSize:'0.68rem',fontWeight:700,color:'#94a3b8',textTransform:'uppercase',marginBottom:4}}>Description</div>
                <div style={{ background:selected.description==='[RESTRICTED]'?'#fff5f5':'#f8fafc',border:`1px solid ${selected.description==='[RESTRICTED]'?'rgba(220,38,38,0.2)':'#dde3ed'}`,borderRadius:6,padding:'0.75rem',fontSize:'0.85rem',lineHeight:1.65 }}>
                  {selected.description === '[RESTRICTED]' ? '🔒 Access restricted — contact Admin to view VAWC details.' : selected.description}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
