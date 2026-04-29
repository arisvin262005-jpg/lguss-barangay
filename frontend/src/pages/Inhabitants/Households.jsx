import { useState, useEffect } from 'react';
import api, { resolveOfflineResponse } from '../../services/api';
import { BARANGAY_NAMES } from '../../config/barangays';
import { useAuth } from '../../context/AuthContext';
import { Home, Plus, Eye, Edit2, X, Save, Users, Trash2 } from 'lucide-react';

const HOUSE_TYPES = ['Concrete','Semi-Concrete','Wood','Light Materials','Mixed Materials'];
const TOILET_TYPES = ['Water Sealed','Open Pit','None'];
const WATER_SOURCES = ['MCWD Piped Water','Deep Well','Spring','Rainwater','Water Refilling Station'];

const emptyForm = {
  householdNumber: '', address: '', purok: '', zone: '', barangay: '',
  houseType: 'Concrete', toiletFacility: 'Water Sealed', waterSource: 'MCWD Piped Water',
  electricity: true, headId: '', headName: '',
};

export default function Households() {
  const { hasRole } = useAuth();
  const [households, setHouseholds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);
  const canEdit = hasRole('Admin','Secretary');

  useEffect(() => {
    api.get('/households').then(({ data }) => setHouseholds(data.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = households.filter(h =>
    `${h.householdNumber} ${h.address} ${h.headName} ${h.barangay}`.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd  = () => { setForm({ ...emptyForm }); setSelected(null); setModal('form'); };
  const openEdit = (h) => { setForm(h); setSelected(h); setModal('form'); };
  const openView = (h) => { setSelected(h); setModal('view'); };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (!selected) {
        const res = await api.post('/households', form);
        const saved = resolveOfflineResponse(res, form);
        setHouseholds(prev => [saved, ...prev]);
      } else {
        const res = await api.put(`/households/${selected.id}`, form);
        const saved = resolveOfflineResponse(res, form, selected.id);
        setHouseholds(prev => prev.map(h => h.id === saved.id ? saved : h));
      }
      setModal(null);
    } catch {} finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this household record?')) return;
    try { await api.delete(`/households/${id}`); } catch {}
    setHouseholds(prev => prev.filter(h => h.id !== id));
  };

  return (
    <div style={{ maxWidth: 1100 }}>
      <div className="page-header">
        <div>
          <div className="page-title">Household Records</div>
          <div className="page-subtitle">Manage household profiles and member lists</div>
        </div>
        {canEdit && <button className="btn btn-primary" onClick={openAdd}><Plus size={16} />Add Household</button>}
      </div>

      <div className="gov-card" style={{ marginBottom:'1.25rem', padding:'0.875rem 1.25rem', display:'flex', gap:'0.75rem', alignItems:'center' }}>
        <input className="form-input" placeholder="Search by number, address, or head name..." value={search} onChange={e=>setSearch(e.target.value)} style={{ flex:1 }} />
        <span style={{ fontSize:'0.78rem', color:'#64748b', fontWeight:600, whiteSpace:'nowrap' }}>{filtered.length} records</span>
      </div>

      <div className="gov-card" style={{ overflow:'hidden' }}>
        <table className="gov-table">
          <thead><tr><th>HH No.</th><th>Address / Purok</th><th>Barangay</th><th>Head of Family</th><th>Members</th><th>House Type</th><th>Actions</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={7} style={{ padding:'2rem', textAlign:'center' }}>Loading...</td></tr>
            : filtered.map(h => (
              <tr key={h.id}>
                <td><span style={{ fontWeight:700, color:'#1a4f8a' }}>{h.householdNumber}</span></td>
                <td><div style={{ fontWeight:500 }}>{h.address}</div>{h.purok && <div style={{ fontSize:'0.72rem', color:'#64748b' }}>{h.purok}{h.zone ? ' • '+h.zone : ''}</div>}</td>
                <td><span className="badge badge-blue" style={{ fontSize:'0.68rem' }}>{h.barangay}</span></td>
                <td style={{ fontWeight:500 }}>{h.headName || '—'}</td>
                <td><span className="badge badge-gray">{h.memberCount ?? 0} members</span></td>
                <td style={{ fontSize:'0.8rem' }}>{h.houseType}</td>
                <td><div style={{ display:'flex', gap:'0.3rem' }}>
                  <button onClick={() => openView(h)} className="btn-icon"><Eye size={14} color="#1a4f8a" /></button>
                  {canEdit && <button onClick={() => openEdit(h)} className="btn-icon"><Edit2 size={14} color="#d97706" /></button>}
                  {hasRole('Admin') && <button onClick={() => handleDelete(h.id)} className="btn-icon"><Trash2 size={14} color="#dc2626" /></button>}
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Form Modal */}
      {modal === 'form' && (
        <div className="modal-overlay" onClick={e => e.target===e.currentTarget && setModal(null)}>
          <div className="modal" style={{ maxWidth:580 }}>
            <div className="modal-header"><div className="modal-title">{selected ? 'Edit Household' : 'Add Household'}</div><button onClick={()=>setModal(null)} className="btn-icon"><X size={16}/></button></div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="grid-2">
                  <div className="form-group"><label className="form-label">Household Number *</label><input className="form-input" required value={form.householdNumber} onChange={e=>setForm({...form,householdNumber:e.target.value})} placeholder="HH-001" /></div>
                  <div className="form-group">
                    <label className="form-label">Barangay *</label>
                    <select className="form-select" required value={form.barangay} onChange={e=>setForm({...form,barangay:e.target.value})}>
                      <option value="">Select</option>{BARANGAY_NAMES.map(b=><option key={b}>{b}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group"><label className="form-label">Address</label><input className="form-input" value={form.address} onChange={e=>setForm({...form,address:e.target.value})} /></div>
                <div className="grid-2">
                  <div className="form-group"><label className="form-label">Purok</label><input className="form-input" value={form.purok} onChange={e=>setForm({...form,purok:e.target.value})} /></div>
                  <div className="form-group"><label className="form-label">Zone</label><input className="form-input" value={form.zone} onChange={e=>setForm({...form,zone:e.target.value})} /></div>
                </div>
                <div className="grid-2">
                  <div className="form-group"><label className="form-label">House Type</label><select className="form-select" value={form.houseType} onChange={e=>setForm({...form,houseType:e.target.value})}>{HOUSE_TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
                  <div className="form-group"><label className="form-label">Toilet Facility</label><select className="form-select" value={form.toiletFacility} onChange={e=>setForm({...form,toiletFacility:e.target.value})}>{TOILET_TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
                </div>
                <div className="grid-2">
                  <div className="form-group"><label className="form-label">Water Source</label><select className="form-select" value={form.waterSource} onChange={e=>setForm({...form,waterSource:e.target.value})}>{WATER_SOURCES.map(t=><option key={t}>{t}</option>)}</select></div>
                  <div className="form-group"><label className="form-label">Electricity</label><select className="form-select" value={form.electricity?'true':'false'} onChange={e=>setForm({...form,electricity:e.target.value==='true'})}><option value="true">With Electricity</option><option value="false">No Electricity</option></select></div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={()=>setModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}><Save size={14}/>{saving?'Saving...':'Save Household'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {modal === 'view' && selected && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setModal(null)}>
          <div className="modal" style={{ maxWidth:480 }}>
            <div className="modal-header"><div className="modal-title">{selected.householdNumber} — {selected.address}</div><button onClick={()=>setModal(null)} className="btn-icon"><X size={16}/></button></div>
            <div className="modal-body">
              <div className="grid-2" style={{ gap:'0.75rem', marginBottom:'1rem' }}>
                {[['Barangay',selected.barangay],['Purok',selected.purok||'—'],['Zone',selected.zone||'—'],['House Type',selected.houseType],['Toilet',selected.toiletFacility],['Water Source',selected.waterSource],['Electricity',selected.electricity?'Yes':'No'],['Members',`${selected.memberCount??0} registered`]].map(([l,v])=>(
                  <div key={l}><div style={{ fontSize:'0.68rem',fontWeight:700,color:'#94a3b8',textTransform:'uppercase',marginBottom:2}}>{l}</div><div style={{ fontSize:'0.85rem',fontWeight:500}}>{v}</div></div>
                ))}
              </div>
              {selected.members?.length > 0 && (
                <div>
                  <div style={{ fontSize:'0.72rem',fontWeight:700,color:'#94a3b8',textTransform:'uppercase',marginBottom:'0.5rem'}}>Members</div>
                  {selected.members.map(m=><div key={m.id} style={{ fontSize:'0.82rem',padding:'0.375rem 0',borderBottom:'1px solid #f1f5f9'}}>{m.firstName} {m.lastName} — {m.relationToHead}</div>)}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
