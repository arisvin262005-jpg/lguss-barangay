import { useState, useEffect } from 'react';
import api, { resolveOfflineResponse } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, Plus, X, Save, Edit2, Trash2 } from 'lucide-react';

const TYPES = ['Ordinance','Resolution','Executive Order'];
export default function Legislation() {
  const { hasRole } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('Ordinance');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ type:'Ordinance', number:'', title:'', description:'', dateEnacted:new Date().toISOString().split('T')[0], author:'', status:'Active' });
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);
  const canEdit = hasRole('Admin','Secretary');

  useEffect(() => {
    api.get('/legislation').then(({ data }) => setItems(data.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = items.filter(i => i.type === tab);
  const openAdd = () => { setForm({ type:tab, number:'', title:'', description:'', dateEnacted:new Date().toISOString().split('T')[0], author:'', status:'Active' }); setSelected(null); setModal('form'); };
  const openEdit = (item) => { setForm(item); setSelected(item); setModal('form'); };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (!selected) {
        const res = await api.post('/legislation', form);
        const saved = resolveOfflineResponse(res, form);
        setItems(prev => [saved, ...prev]);
      } else {
        const res = await api.put(`/legislation/${selected.id}`, form);
        const saved = resolveOfflineResponse(res, form, selected.id);
        setItems(prev => prev.map(i => i.id === saved.id ? saved : i));
      }
      setModal(null);
    } catch {} finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this legislation record?')) return;
    try { await api.delete(`/legislation/${id}`); } catch {}
    setItems(prev => prev.filter(i => i.id !== id));
  };

  return (
    <div style={{ maxWidth:1100 }}>
      <div className="page-header">
        <div><div className="page-title">Legislation Records</div><div className="page-subtitle">Barangay ordinances, resolutions, and executive orders</div></div>
        {canEdit && <button className="btn btn-primary" onClick={openAdd}><Plus size={16}/>Add {tab}</button>}
      </div>
      <div className="tab-bar" style={{ marginBottom:'1.25rem' }}>
        {TYPES.map(t=><button key={t} className={`tab-btn${tab===t?' active':''}`} onClick={()=>setTab(t)}>{t}s <span className="badge badge-blue" style={{ marginLeft:4,fontSize:'0.65rem' }}>{items.filter(i=>i.type===t).length}</span></button>)}
      </div>
      <div className="gov-card" style={{ overflow:'hidden' }}>
        <table className="gov-table">
          <thead><tr><th>Number</th><th>Title</th><th>Author</th><th>Date Enacted</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={6} style={{ padding:'2rem',textAlign:'center' }}>Loading...</td></tr>
            : filtered.map(item=>(
              <tr key={item.id}>
                <td style={{ fontWeight:700,color:'#1a4f8a' }}>{item.number}</td>
                <td><div style={{ fontWeight:500,fontSize:'0.85rem',marginBottom:2 }}>{item.title}</div><div style={{ fontSize:'0.75rem',color:'#64748b',maxWidth:300 }}>{item.description?.substring(0,80)}{item.description?.length>80?'...':''}</div></td>
                <td style={{ fontSize:'0.8rem' }}>{item.author}</td>
                <td style={{ fontSize:'0.78rem',color:'#64748b' }}>{item.dateEnacted}</td>
                <td><span className={`badge ${item.status==='Active'?'badge-green':'badge-gray'}`} style={{ fontSize:'0.68rem' }}>{item.status}</span></td>
                <td><div style={{ display:'flex',gap:'0.3rem' }}>
                  {canEdit && <button onClick={()=>openEdit(item)} className="btn-icon"><Edit2 size={14} color="#d97706"/></button>}
                  {hasRole('Admin') && <button onClick={()=>handleDelete(item.id)} className="btn-icon"><Trash2 size={14} color="#dc2626"/></button>}
                </div></td>
              </tr>
            ))}
            {!loading && filtered.length===0 && <tr><td colSpan={6} style={{ textAlign:'center',padding:'2.5rem',color:'#94a3b8' }}>No {tab}s recorded yet</td></tr>}
          </tbody>
        </table>
      </div>
      {modal==='form' && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setModal(null)}>
          <div className="modal" style={{ maxWidth:580 }}>
            <div className="modal-header"><div className="modal-title">{selected?'Edit':'Add'} {form.type}</div><button onClick={()=>setModal(null)} className="btn-icon"><X size={16}/></button></div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="grid-2">
                  <div className="form-group"><label className="form-label">Type</label><select className="form-select" value={form.type} onChange={e=>setForm({...form,type:e.target.value})}>{TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
                  <div className="form-group"><label className="form-label">Number *</label><input className="form-input" required value={form.number} onChange={e=>setForm({...form,number:e.target.value})} placeholder="e.g. BO-2024-001" /></div>
                </div>
                <div className="form-group"><label className="form-label">Title *</label><input className="form-input" required value={form.title} onChange={e=>setForm({...form,title:e.target.value})} /></div>
                <div className="form-group"><label className="form-label">Description</label><textarea className="form-textarea" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} rows={3} /></div>
                <div className="grid-2">
                  <div className="form-group"><label className="form-label">Author</label><input className="form-input" value={form.author} onChange={e=>setForm({...form,author:e.target.value})} /></div>
                  <div className="form-group"><label className="form-label">Date Enacted</label><input className="form-input" type="date" value={form.dateEnacted} onChange={e=>setForm({...form,dateEnacted:e.target.value})} /></div>
                </div>
                <div className="form-group"><label className="form-label">Status</label><select className="form-select" value={form.status} onChange={e=>setForm({...form,status:e.target.value})}><option>Active</option><option>Repealed</option><option>Amended</option></select></div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={()=>setModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}><Save size={14}/>{saving?'Saving...':'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
