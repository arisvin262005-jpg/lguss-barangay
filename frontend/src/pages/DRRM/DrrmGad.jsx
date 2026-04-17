import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Shield, Heart, Plus, X, Save, Edit2 } from 'lucide-react';

function Section({ title, icon: Icon, data, loading, fields, addLabel, canEdit, form, setForm, onSave, saving, modal, setModal, onEdit, emptyForm }) {
  return (
    <div className="gov-card" style={{ marginBottom:'1.25rem' }}>
      <div className="gov-card-header">
        <div className="gov-card-title"><Icon size={16} color="#1a4f8a" />{title}</div>
        {canEdit && <button className="btn btn-primary btn-sm" onClick={()=>{ setForm(emptyForm); setModal(title); }}><Plus size={14}/>{addLabel}</button>}
      </div>
      <div style={{ overflow:'hidden' }}>
        <table className="gov-table">
          <thead><tr>{fields.map(f=><th key={f.label}>{f.label}</th>)}<th>Actions</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={fields.length+1} style={{ padding:'2rem',textAlign:'center' }}>Loading...</td></tr>
            : data.length===0 ? <tr><td colSpan={fields.length+1} style={{ textAlign:'center',padding:'1.5rem',color:'#94a3b8' }}>No records yet</td></tr>
            : data.map(row=>(
              <tr key={row.id}>
                {fields.map(f=><td key={f.key} style={{ fontSize:'0.82rem' }}>{f.render?f.render(row[f.key]):row[f.key]||'—'}</td>)}
                <td>{canEdit && <button onClick={()=>onEdit(row)} className="btn-icon"><Edit2 size={14} color="#d97706"/></button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function DrrmGad() {
  const { hasRole } = useAuth();
  const [plans, setPlans] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loadingP, setLoadingP] = useState(true);
  const [loadingG, setLoadingG] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);
  const canEdit = hasRole('Admin','Secretary');

  const emptyPlan = { title:'', type:'Flood', description:'', evacuationSite:'', contactPerson:'', contactNumber:'', lastUpdated:new Date().toISOString().split('T')[0] };
  const emptyProg = { title:'', type:'Livelihood', description:'', budget:'', beneficiaryCount:'', status:'Active', startDate:'', endDate:'' };

  useEffect(() => {
    api.get('/drrm/plans').then(({ data }) => setPlans(data.data || [])).catch(() => {}).finally(() => setLoadingP(false));
    api.get('/drrm/programs').then(({ data }) => setPrograms(data.data || [])).catch(() => {}).finally(() => setLoadingG(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (modal === 'DRRM') {
        if (!selected) { const { data } = await api.post('/drrm/plans', form); setPlans(prev => [data.data, ...prev]); }
        else { const { data } = await api.put(`/drrm/plans/${selected.id}`, form); setPlans(prev => prev.map(p => p.id === data.data.id ? data.data : p)); }
      } else {
        if (!selected) { const { data } = await api.post('/drrm/programs', form); setPrograms(prev => [data.data, ...prev]); }
        else { const { data } = await api.put(`/drrm/programs/${selected.id}`, form); setPrograms(prev => prev.map(p => p.id === data.data.id ? data.data : p)); }
      }
      setModal(null); setSelected(null);
    } catch {} finally { setSaving(false); }
  };

  const planFields = [
    { key:'title', label:'Plan Title' },
    { key:'type', label:'Hazard Type' },
    { key:'evacuationSite', label:'Evacuation Site' },
    { key:'contactPerson', label:'Contact Person' },
    { key:'lastUpdated', label:'Last Updated' },
  ];
  const programFields = [
    { key:'title', label:'Program' },
    { key:'type', label:'Type' },
    { key:'beneficiaryCount', label:'Beneficiaries' },
    { key:'budget', label:'Budget', render: v => v ? `₱${Number(v).toLocaleString()}` : '—' },
    { key:'status', label:'Status', render: v => <span className={`badge ${v==='Active'?'badge-green':'badge-gray'}`} style={{ fontSize:'0.65rem' }}>{v}</span> },
  ];

  return (
    <div style={{ maxWidth:1100 }}>
      <div className="page-header">
        <div><div className="page-title">DRRM & GAD Programs</div><div className="page-subtitle">Disaster Risk Reduction Management & Gender and Development</div></div>
      </div>

      {/* DRRM Section */}
      <Section title="Emergency & Disaster Plans" icon={Shield}
        data={plans} loading={loadingP} fields={planFields} addLabel="Add Plan" canEdit={canEdit}
        form={form} setForm={setForm} onSave={handleSave} saving={saving} modal={modal} setModal={setModal}
        onEdit={p=>{ setForm(p); setSelected(p); setModal('DRRM'); }} emptyForm={emptyPlan} />

      {/* GAD Section */}
      <Section title="GAD Programs" icon={Heart}
        data={programs} loading={loadingG} fields={programFields} addLabel="Add Program" canEdit={canEdit}
        form={form} setForm={setForm} onSave={handleSave} saving={saving} modal={modal} setModal={setModal}
        onEdit={p=>{ setForm(p); setSelected(p); setModal('GAD'); }} emptyForm={emptyProg} />

      {/* Shared modal */}
      {modal && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setModal(null)}>
          <div className="modal" style={{ maxWidth:520 }}>
            <div className="modal-header"><div className="modal-title">{selected?'Edit':'Add'} {modal==='DRRM'?'Emergency Plan':'GAD Program'}</div><button onClick={()=>setModal(null)} className="btn-icon"><X size={16}/></button></div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-group"><label className="form-label">Title *</label><input className="form-input" required value={form.title||''} onChange={e=>setForm({...form,title:e.target.value})} /></div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Type</label>
                    <select className="form-select" value={form.type||''} onChange={e=>setForm({...form,type:e.target.value})}>
                      {modal==='DRRM' ? ['Flood','Typhoon','Earthquake','Fire','Landslide','Tsunami'].map(t=><option key={t}>{t}</option>)
                        : ['Livelihood','Health','Education','Legal Aid','Anti-Violence','Others'].map(t=><option key={t}>{t}</option>)}
                    </select>
                  </div>
                  {modal==='DRRM' ? (
                    <div className="form-group"><label className="form-label">Last Updated</label><input className="form-input" type="date" value={form.lastUpdated||''} onChange={e=>setForm({...form,lastUpdated:e.target.value})} /></div>
                  ) : (
                    <div className="form-group"><label className="form-label">Beneficiaries</label><input className="form-input" type="number" value={form.beneficiaryCount||''} onChange={e=>setForm({...form,beneficiaryCount:e.target.value})} /></div>
                  )}
                </div>
                <div className="form-group"><label className="form-label">Description</label><textarea className="form-textarea" value={form.description||''} onChange={e=>setForm({...form,description:e.target.value})} rows={3} /></div>
                {modal==='DRRM' ? (
                  <div className="grid-2">
                    <div className="form-group"><label className="form-label">Evacuation Site</label><input className="form-input" value={form.evacuationSite||''} onChange={e=>setForm({...form,evacuationSite:e.target.value})} /></div>
                    <div className="form-group"><label className="form-label">Contact Person</label><input className="form-input" value={form.contactPerson||''} onChange={e=>setForm({...form,contactPerson:e.target.value})} /></div>
                  </div>
                ) : (
                  <div className="grid-2">
                    <div className="form-group"><label className="form-label">Budget (₱)</label><input className="form-input" type="number" value={form.budget||''} onChange={e=>setForm({...form,budget:e.target.value})} /></div>
                    <div className="form-group"><label className="form-label">Status</label><select className="form-select" value={form.status||'Active'} onChange={e=>setForm({...form,status:e.target.value})}><option>Active</option><option>Completed</option><option>On Hold</option></select></div>
                  </div>
                )}
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
