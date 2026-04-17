import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Settings, Users, Building, UserPlus, X, Save, Edit2, Shield } from 'lucide-react';
import { BARANGAYS, BARANGAY_NAMES, MUNICIPALITY } from '../../config/barangays';

const ROLES = ['Admin','Secretary'];

export default function SettingsPage() {
  const { user, hasRole } = useAuth();
  const [tab, setTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ firstName:'',lastName:'',email:'',barangay:'',role:'Viewer',password:'' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (tab === 'users') {
      api.get('/auth/users').then(({ data }) => setUsers(data.data || data || [])).catch(() => {}).finally(() => setLoading(false));
    }
  }, [tab]);

  const handleCreateUser = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await api.post('/auth/register', form);
      api.get('/auth/users').then(({ data }) => setUsers(data.data || data || []));
      setModal(null);
    } catch {} finally { setSaving(false); }
  };

  return (
    <div style={{ maxWidth:1000 }}>
      <div className="page-header">
        <div><div className="page-title">System Settings</div><div className="page-subtitle">User management, barangay profiles, and system configuration</div></div>
      </div>

      <div className="tab-bar" style={{ marginBottom:'1.5rem' }}>
        {[['users','👤 User Management'],['barangay','🏛️ Barangay Profiles'],['system','⚙️ System Info']].map(([k,l])=>(
          <button key={k} className={`tab-btn${tab===k?' active':''}`} onClick={()=>setTab(k)}>{l}</button>
        ))}
      </div>

      {/* User Management */}
      {tab === 'users' && (
        <div>
          <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:'1rem' }}>
            {hasRole('Admin') && <button className="btn btn-primary" onClick={()=>{ setForm({ firstName:'',lastName:'',email:'',barangay:'',role:'Viewer',password:'' }); setModal('user'); }}><UserPlus size={16}/>Add User</button>}
          </div>
          <div className="gov-card" style={{ overflow:'hidden' }}>
            <table className="gov-table">
              <thead><tr><th>Name</th><th>Email</th><th>Barangay</th><th>Role</th><th>Verified</th><th>Joined</th></tr></thead>
              <tbody>
                {loading ? <tr><td colSpan={6} style={{ padding:'2rem',textAlign:'center' }}>Loading...</td></tr>
                : users.map(u=>(
                  <tr key={u.id}>
                    <td style={{ fontWeight:600 }}>{u.firstName} {u.lastName}</td>
                    <td style={{ fontSize:'0.82rem' }}>{u.email}</td>
                    <td><span className="badge badge-blue" style={{ fontSize:'0.68rem' }}>{u.barangay}</span></td>
                    <td><span className={`badge ${u.role==='Admin'?'badge-red':u.role==='Secretary'?'badge-blue':u.role==='Tanod'?'badge-yellow':'badge-gray'}`} style={{ fontSize:'0.68rem' }}>{u.role}</span></td>
                    <td>{u.isVerified ? <span className="badge badge-green" style={{ fontSize:'0.65rem' }}>✓ Verified</span> : <span className="badge badge-gray" style={{ fontSize:'0.65rem' }}>Pending</span>}</td>
                    <td style={{ fontSize:'0.75rem',color:'#64748b' }}>{u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-PH') : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Barangay Profiles */}
      {tab === 'barangay' && (
        <div>
          <div className="alert alert-info" style={{ marginBottom:'1.25rem' }}>
            <Shield size={15}/>This displays the official profiles of all 15 covered barangays of Mamburao. Captain and Secretary details are used in official certificates.
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:'1rem' }}>
            {BARANGAYS.map((b,i) => (
              <div key={b.id} className="gov-card" style={{ padding:'1.25rem', display:'flex', gap:'0.875rem', alignItems:'flex-start' }}>
                <div style={{ width:42,height:42,borderRadius:9,background:'#1a4f8a',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:900,fontSize:'0.875rem',flexShrink:0 }}>
                  {String(i+1).padStart(2,'0')}
                </div>
                <div>
                  <div style={{ fontWeight:800,color:'#1a4f8a',marginBottom:'0.25rem' }}>Brgy. {b.name}</div>
                  <div style={{ fontSize:'0.75rem',color:'#334155',marginBottom:'0.1rem' }}><span style={{ fontWeight:700 }}>Kap.</span> {b.captain}</div>
                  <div style={{ fontSize:'0.72rem',color:'#64748b' }}><span style={{ fontWeight:700 }}>Sec.</span> {b.secretary}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* System Info */}
      {tab === 'system' && (
        <div className="gov-card gov-card-body">
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem' }}>
            {[
              ['System Name','Barangay Management Information System'],
              ['Municipality',MUNICIPALITY.name],
              ['Province',MUNICIPALITY.province],
              ['Region',MUNICIPALITY.region],
              ['ZIP Code',MUNICIPALITY.zipCode],
              ['Barangays Covered',`${BARANGAYS.length} Barangays`],
              ['Database','PouchDB (Local) + CouchDB (Remote)'],
              ['Sync Architecture','Offline-First via PouchDB replication'],
              ['Blockchain','SHA-256 Hash Chain Audit Trail'],
              ['Auth','JWT httpOnly Cookie + RBAC'],
              ['Version','v2.0 — Extended BIMS Edition'],
              ['DILG Standard','BIMS Extension for Mamburao'],
            ].map(([l,v])=>(
              <div key={l}><div style={{ fontSize:'0.68rem',fontWeight:700,color:'#94a3b8',textTransform:'uppercase',marginBottom:3}}>{l}</div><div style={{ fontSize:'0.875rem',fontWeight:500}}>{v}</div></div>
            ))}
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {modal==='user' && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setModal(null)}>
          <div className="modal" style={{ maxWidth:480 }}>
            <div className="modal-header"><div className="modal-title">Add New User</div><button onClick={()=>setModal(null)} className="btn-icon"><X size={16}/></button></div>
            <form onSubmit={handleCreateUser}>
              <div className="modal-body">
                <div className="grid-2">
                  <div className="form-group"><label className="form-label">First Name *</label><input className="form-input" required value={form.firstName} onChange={e=>setForm({...form,firstName:e.target.value})} /></div>
                  <div className="form-group"><label className="form-label">Last Name *</label><input className="form-input" required value={form.lastName} onChange={e=>setForm({...form,lastName:e.target.value})} /></div>
                </div>
                <div className="form-group"><label className="form-label">Email *</label><input className="form-input" type="email" required value={form.email} onChange={e=>setForm({...form,email:e.target.value})} /></div>
                <div className="grid-2">
                  <div className="form-group"><label className="form-label">Barangay</label><select className="form-select" value={form.barangay} onChange={e=>setForm({...form,barangay:e.target.value})}><option value="">Select</option>{BARANGAY_NAMES.map(b=><option key={b}>{b}</option>)}</select></div>
                  <div className="form-group"><label className="form-label">Role</label><select className="form-select" value={form.role} onChange={e=>setForm({...form,role:e.target.value})}>{ROLES.map(r=><option key={r}>{r}</option>)}</select></div>
                </div>
                <div className="form-group"><label className="form-label">Temporary Password *</label><input className="form-input" type="password" required value={form.password} onChange={e=>setForm({...form,password:e.target.value})} /></div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={()=>setModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}><Save size={14}/>{saving?'Creating...':'Create User'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
