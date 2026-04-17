import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Scale, Plus, Eye, Edit2, X, Save, Calendar } from 'lucide-react';

const CASE_TYPES = ['Land Dispute','Family Dispute','Debt','Physical Injury','Noise Complaint','Property Damage','Others'];
const STATUS_FLOW = ['Filed','Mediation Scheduled','Under Mediation','Settled','Escalated to Court','Dismissed'];
const STATUS_COLOR = { Filed:'badge-blue','Mediation Scheduled':'badge-yellow','Under Mediation':'badge-yellow',Settled:'badge-green','Escalated to Court':'badge-red',Dismissed:'badge-gray' };

export default function Cases() {
  const { hasRole } = useAuth();
  const [cases, setCases] = useState([]);
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ caseNumber:'', complainantId:'', respondentId:'', caseType:'Land Dispute', description:'', filedDate:new Date().toISOString().split('T')[0] });
  const [hearingForm, setHearingForm] = useState({ hearingDate:'', hearingTime:'09:00', hearingVenue:'', notes:'' });
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);
  const canEdit = hasRole('Admin','Secretary');
  const canViewDetails = hasRole('Admin','Secretary');

  useEffect(() => {
    api.get('/cases').then(({ data }) => setCases(data.data || [])).catch(() => {}).finally(() => setLoading(false));
    api.get('/residents').then(({ data }) => setResidents(data.data || []));
  }, []);

  const filtered = cases.filter(c =>
    `${c.caseNumber} ${c.caseType} ${c.status}`.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (!selected) {
        const { data } = await api.post('/cases', form);
        setCases(prev => [data.data || data, ...prev]);
      } else {
        const { data } = await api.put(`/cases/${selected.id}`, { ...form, ...hearingForm });
        setCases(prev => prev.map(c => c.id === data.id ? data : c));
      }
      setModal(null);
    } catch {} finally { setSaving(false); }
  };

  const updateStatus = async (id, status) => {
    const { data } = await api.patch(`/cases/${id}/status`, { status });
    setCases(prev => prev.map(c => c.id === id ? { ...c, status } : c));
  };

  const residentName = (id) => {
    const r = residents.find(x => x.id === id);
    return r ? `${r.firstName} ${r.lastName}` : id;
  };

  return (
    <div style={{ maxWidth:1150 }}>
      <div className="page-header">
        <div><div className="page-title">KP Case Management</div><div className="page-subtitle">Katarungang Pambarangay — case filing, mediation, and hearing schedules</div></div>
        {canEdit && <button className="btn btn-primary" onClick={()=>{ setForm({ caseNumber:`KP-${new Date().getFullYear()}-${String(cases.length+1).padStart(3,'0')}`, complainantId:'', respondentId:'', caseType:'Land Dispute', description:'', filedDate:new Date().toISOString().split('T')[0] }); setSelected(null); setModal('form'); }}><Plus size={16}/>File New Case</button>}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'1rem', marginBottom:'1.25rem' }}>
        {['Filed','Under Mediation','Settled','Escalated to Court'].map(s => (
          <div key={s} className="gov-card" style={{ padding:'0.875rem',textAlign:'center' }}>
            <div style={{ fontSize:'1.5rem',fontWeight:900 }}>{cases.filter(c=>c.status===s).length}</div>
            <span className={`badge ${STATUS_COLOR[s]||'badge-gray'}`} style={{ marginTop:4,fontSize:'0.68rem' }}>{s}</span>
          </div>
        ))}
      </div>

      <div className="gov-card" style={{ marginBottom:'1.25rem',padding:'0.875rem 1.25rem' }}>
        <input className="form-input" placeholder="Search by case number, type, or status..." value={search} onChange={e=>setSearch(e.target.value)} style={{ maxWidth:360 }} />
      </div>

      <div className="gov-card" style={{ overflow:'hidden' }}>
        <table className="gov-table">
          <thead><tr><th>Case No.</th><th>Type</th>{canViewDetails&&<th>Complainant</th>}{canViewDetails&&<th>Respondent</th>}<th>Status</th><th>Filed Date</th><th>Hearing Date</th><th>Actions</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={8} style={{ padding:'2rem',textAlign:'center' }}>Loading...</td></tr>
            : filtered.map(c=>(
              <tr key={c.id}>
                <td style={{ fontWeight:700,color:'#1a4f8a' }}>{c.caseNumber}</td>
                <td style={{ fontSize:'0.82rem' }}>{c.caseType}</td>
                {canViewDetails && <td style={{ fontSize:'0.82rem',fontWeight:500 }}>{residentName(c.complainantId)}</td>}
                {canViewDetails && <td style={{ fontSize:'0.82rem' }}>{residentName(c.respondentId)}</td>}
                <td><span className={`badge ${STATUS_COLOR[c.status]||'badge-gray'}`} style={{ fontSize:'0.68rem' }}>{c.status}</span></td>
                <td style={{ fontSize:'0.78rem',color:'#64748b' }}>{c.filedDate}</td>
                <td style={{ fontSize:'0.78rem',color:'#64748b' }}>{c.hearingDate||'—'} {c.hearingTime||''}</td>
                <td><div style={{ display:'flex',gap:'0.3rem' }}>
                  <button onClick={()=>{ setSelected(c); setModal('view'); }} className="btn-icon"><Eye size={14} color="#1a4f8a"/></button>
                  {canEdit && c.status!=='Settled'&&c.status!=='Dismissed' && (
                    <button onClick={()=>{ setSelected(c); setForm(c); setHearingForm({hearingDate:c.hearingDate||'',hearingTime:c.hearingTime||'09:00',hearingVenue:c.hearingVenue||'',notes:c.notes||''}); setModal('form'); }} className="btn-icon"><Edit2 size={14} color="#d97706"/></button>
                  )}
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* View modal */}
      {modal==='view' && selected && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setModal(null)}>
          <div className="modal" style={{ maxWidth:540 }}>
            <div className="modal-header"><div className="modal-title">{selected.caseNumber} — {selected.caseType}</div><button onClick={()=>setModal(null)} className="btn-icon"><X size={16}/></button></div>
            <div className="modal-body">
              <div className="grid-2" style={{ gap:'0.75rem', marginBottom:'1rem' }}>
                {[['Case No.',selected.caseNumber],['Type',selected.caseType],['Status',selected.status],['Filed',selected.filedDate],
                  ...(canViewDetails?[['Complainant',residentName(selected.complainantId)],['Respondent',residentName(selected.respondentId)]]:
                  [['Parties','[RESTRICTED]']]),
                  ['Hearing Date',selected.hearingDate||'—'],['Hearing Time',selected.hearingTime||'—'],['Venue',selected.hearingVenue||'—'],
                ].map(([l,v])=>(
                  <div key={l}><div style={{ fontSize:'0.68rem',fontWeight:700,color:'#94a3b8',textTransform:'uppercase',marginBottom:2}}>{l}</div><div style={{ fontSize:'0.85rem',fontWeight:500}}>{v}</div></div>
                ))}
              </div>
              {canViewDetails && selected.description && (
                <div><div style={{ fontSize:'0.68rem',fontWeight:700,color:'#94a3b8',textTransform:'uppercase',marginBottom:4}}>Case Description</div><div style={{ fontSize:'0.85rem',lineHeight:1.65,background:'#f8fafc',padding:'0.75rem',borderRadius:6,border:'1px solid #dde3ed'}}>{selected.description}</div></div>
              )}
              {canViewDetails && selected.notes && (
                <div style={{ marginTop:'0.75rem' }}><div style={{ fontSize:'0.68rem',fontWeight:700,color:'#94a3b8',textTransform:'uppercase',marginBottom:4}}>Notes</div><div style={{ fontSize:'0.82rem',color:'#475569'}}>{selected.notes}</div></div>
              )}
              {canEdit && (
                <div style={{ marginTop:'1rem',display:'flex',gap:'0.5rem',flexWrap:'wrap' }}>
                  {STATUS_FLOW.filter(s=>s!==selected.status).map(s=>(
                    <button key={s} className="btn btn-secondary btn-sm" onClick={()=>{ updateStatus(selected.id,s); setSelected({...selected,status:s}); }}>{s}</button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* File/Edit form modal */}
      {modal==='form' && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setModal(null)}>
          <div className="modal" style={{ maxWidth:560 }}>
            <div className="modal-header"><div className="modal-title">{selected?'Edit Case':'File New KP Case'}</div><button onClick={()=>setModal(null)} className="btn-icon"><X size={16}/></button></div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="grid-2">
                  <div className="form-group"><label className="form-label">Case Number</label><input className="form-input" value={form.caseNumber} onChange={e=>setForm({...form,caseNumber:e.target.value})} /></div>
                  <div className="form-group"><label className="form-label">Date Filed</label><input className="form-input" type="date" value={form.filedDate} onChange={e=>setForm({...form,filedDate:e.target.value})} /></div>
                </div>
                <div className="form-group"><label className="form-label">Case Type</label><select className="form-select" value={form.caseType} onChange={e=>setForm({...form,caseType:e.target.value})}>{CASE_TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
                <div className="grid-2">
                  <div className="form-group"><label className="form-label">Complainant</label><select className="form-select" value={form.complainantId} onChange={e=>setForm({...form,complainantId:e.target.value})}><option value="">Select resident</option>{residents.map(r=><option key={r.id} value={r.id}>{r.lastName}, {r.firstName}</option>)}</select></div>
                  <div className="form-group"><label className="form-label">Respondent</label><select className="form-select" value={form.respondentId} onChange={e=>setForm({...form,respondentId:e.target.value})}><option value="">Select resident</option>{residents.map(r=><option key={r.id} value={r.id}>{r.lastName}, {r.firstName}</option>)}</select></div>
                </div>
                <div className="form-group"><label className="form-label">Case Description</label><textarea className="form-textarea" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} rows={3} /></div>
                <div className="section-stripe" style={{ marginBottom:'0.875rem' }}>Hearing Schedule</div>
                <div className="grid-2">
                  <div className="form-group"><label className="form-label">Hearing Date</label><input className="form-input" type="date" value={hearingForm.hearingDate} onChange={e=>setHearingForm({...hearingForm,hearingDate:e.target.value})} /></div>
                  <div className="form-group"><label className="form-label">Time</label><input className="form-input" type="time" value={hearingForm.hearingTime} onChange={e=>setHearingForm({...hearingForm,hearingTime:e.target.value})} /></div>
                </div>
                <div className="form-group"><label className="form-label">Venue</label><input className="form-input" value={hearingForm.hearingVenue} onChange={e=>setHearingForm({...hearingForm,hearingVenue:e.target.value})} placeholder="e.g., Barangay Hall Conference Room" /></div>
                <div className="form-group"><label className="form-label">Notes</label><textarea className="form-textarea" value={hearingForm.notes} onChange={e=>setHearingForm({...hearingForm,notes:e.target.value})} rows={2} /></div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={()=>setModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}><Save size={14}/>{saving?'Saving...':'Save Case'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
