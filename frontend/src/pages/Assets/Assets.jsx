import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Building2, Plus, X, Save, Edit2 } from 'lucide-react';

const ASSET_TYPES = ['Building','Vehicle','Equipment','Furniture','Land','Others'];
const CONDITIONS   = ['Excellent','Good','Fair','Poor','For Disposal'];

export default function Assets() {
  const { hasRole } = useAuth();
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ name:'', type:'Building', description:'', condition:'Good', acquisitionDate:'', estimatedValue:'', location:'' });
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);
  const canEdit = hasRole('Admin','Secretary');

  useEffect(() => {
    api.get('/assets').then(({ data }) => setAssets(data.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (!selected) {
        const { data } = await api.post('/assets', form);
        setAssets(prev => [data.data, ...prev]);
      } else {
        const { data } = await api.put(`/assets/${selected.id}`, form);
        setAssets(prev => prev.map(a => a.id === data.data.id ? data.data : a));
      }
      setModal(null);
    } catch {} finally { setSaving(false); }
  };

  const COND_COLOR = { Excellent:'badge-green', Good:'badge-green', Fair:'badge-yellow', Poor:'badge-red', 'For Disposal':'badge-red' };

  return (
    <div style={{ maxWidth:1100 }}>
      <div className="page-header">
        <div><div className="page-title">Barangay Asset Management</div><div className="page-subtitle">Inventory of barangay properties and equipment</div></div>
        {canEdit && <button className="btn btn-primary" onClick={()=>{ setForm({ name:'',type:'Building',description:'',condition:'Good',acquisitionDate:'',estimatedValue:'',location:'' }); setSelected(null); setModal('form'); }}><Plus size={16}/>Add Asset</button>}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'1rem', marginBottom:'1.25rem' }}>
        {ASSET_TYPES.slice(0,4).map(t => (
          <div key={t} className="gov-card" style={{ padding:'0.875rem',textAlign:'center' }}>
            <div style={{ fontSize:'1.5rem',fontWeight:900 }}>{assets.filter(a=>a.type===t).length}</div>
            <div style={{ fontSize:'0.75rem',color:'#64748b',marginTop:4 }}>{t}s</div>
          </div>
        ))}
      </div>

      <div className="gov-card" style={{ overflow:'hidden' }}>
        <table className="gov-table">
          <thead><tr><th>Asset Name</th><th>Type</th><th>Location</th><th>Condition</th><th>Estimated Value</th><th>Acquired</th><th>Actions</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={7} style={{ padding:'2rem',textAlign:'center' }}>Loading...</td></tr>
            : assets.map(a=>(
              <tr key={a.id}>
                <td><div style={{ fontWeight:600 }}>{a.name}</div><div style={{ fontSize:'0.72rem',color:'#64748b' }}>{a.description?.substring(0,50)}</div></td>
                <td><span className="badge badge-blue" style={{ fontSize:'0.68rem' }}>{a.type}</span></td>
                <td style={{ fontSize:'0.8rem' }}>{a.location||'—'}</td>
                <td><span className={`badge ${COND_COLOR[a.condition]||'badge-gray'}`} style={{ fontSize:'0.68rem' }}>{a.condition}</span></td>
                <td style={{ fontSize:'0.85rem',fontWeight:600 }}>{a.estimatedValue ? `₱${Number(a.estimatedValue).toLocaleString()}` : '—'}</td>
                <td style={{ fontSize:'0.78rem',color:'#64748b' }}>{a.acquisitionDate||'—'}</td>
                <td>{canEdit && <button onClick={()=>{ setForm(a); setSelected(a); setModal('form'); }} className="btn-icon"><Edit2 size={14} color="#d97706"/></button>}</td>
              </tr>
            ))}
            {!loading && assets.length===0 && <tr><td colSpan={7} style={{ textAlign:'center',padding:'2.5rem',color:'#94a3b8' }}>No assets recorded</td></tr>}
          </tbody>
        </table>
      </div>

      {modal==='form' && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setModal(null)}>
          <div className="modal" style={{ maxWidth:520 }}>
            <div className="modal-header"><div className="modal-title">{selected?'Edit Asset':'Add Asset'}</div><button onClick={()=>setModal(null)} className="btn-icon"><X size={16}/></button></div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-group"><label className="form-label">Asset Name *</label><input className="form-input" required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} /></div>
                <div className="grid-2">
                  <div className="form-group"><label className="form-label">Type</label><select className="form-select" value={form.type} onChange={e=>setForm({...form,type:e.target.value})}>{ASSET_TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
                  <div className="form-group"><label className="form-label">Condition</label><select className="form-select" value={form.condition} onChange={e=>setForm({...form,condition:e.target.value})}>{CONDITIONS.map(c=><option key={c}>{c}</option>)}</select></div>
                </div>
                <div className="form-group"><label className="form-label">Description</label><textarea className="form-textarea" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} rows={2} /></div>
                <div className="grid-2">
                  <div className="form-group"><label className="form-label">Location</label><input className="form-input" value={form.location} onChange={e=>setForm({...form,location:e.target.value})} /></div>
                  <div className="form-group"><label className="form-label">Estimated Value (₱)</label><input className="form-input" type="number" value={form.estimatedValue} onChange={e=>setForm({...form,estimatedValue:e.target.value})} /></div>
                </div>
                <div className="form-group"><label className="form-label">Acquisition Date</label><input className="form-input" type="date" value={form.acquisitionDate} onChange={e=>setForm({...form,acquisitionDate:e.target.value})} /></div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={()=>setModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}><Save size={14}/>{saving?'Saving...':'Save Asset'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
