import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Accessibility, Eye, X, Search } from 'lucide-react';

const calcAge = (bd) => bd ? `${new Date().getFullYear()-new Date(bd).getFullYear()}` : '—';

export default function PWDRegistry() {
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    api.get('/residents').then(({ data }) => setResidents((data.data||[]).filter(r=>r.tags?.pwd))).catch(()=>{}).finally(()=>setLoading(false));
  }, []);

  const filtered = residents.filter(r =>
    `${r.firstName} ${r.lastName} ${r.barangay} ${r.disabilityType||''}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ maxWidth:1100 }}>
      <div className="page-header">
        <div><div className="page-title">PWD Registry</div><div className="page-subtitle">Persons with Disability — auto-filtered by PWD tag</div></div>
        <div style={{ padding:'0.5rem 1.25rem',borderRadius:8,background:'rgba(124,58,237,0.08)',border:'1px solid rgba(124,58,237,0.15)',fontSize:'0.82rem',fontWeight:700,color:'#7c3aed' }}>
          ♿ {filtered.length} PWD Records
        </div>
      </div>
      <div className="gov-card" style={{ marginBottom:'1.25rem',padding:'0.875rem 1.25rem' }}>
        <input className="form-input" placeholder="Search by name, barangay, disability..." value={search} onChange={e=>setSearch(e.target.value)} style={{ maxWidth:360 }} />
      </div>
      <div className="gov-card" style={{ overflow:'hidden' }}>
        <table className="gov-table">
          <thead><tr><th>Name</th><th>Age</th><th>Sex</th><th>Barangay</th><th>PWD ID No.</th><th>Disability Type</th><th>Actions</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={7} style={{ padding:'2rem',textAlign:'center' }}>Loading...</td></tr>
            : filtered.map(r=>(
              <tr key={r.id}>
                <td style={{ fontWeight:600 }}>{r.lastName}, {r.firstName}</td>
                <td>{calcAge(r.birthDate)} yrs</td>
                <td>{r.gender}</td>
                <td><span className="badge badge-blue" style={{ fontSize:'0.68rem' }}>{r.barangay}</span></td>
                <td style={{ fontSize:'0.8rem' }}>{r.pwdId||<span style={{ color:'#94a3b8' }}>Not issued</span>}</td>
                <td>{r.disabilityType
                  ? <span className="badge badge-purple" style={{ fontSize:'0.68rem' }}>{r.disabilityType}</span>
                  : <span style={{ color:'#94a3b8',fontSize:'0.8rem' }}>—</span>}</td>
                <td><button onClick={()=>setSelected(r)} className="btn-icon"><Eye size={14} color="#7c3aed"/></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {selected && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setSelected(null)}>
          <div className="modal" style={{ maxWidth:420 }}>
            <div className="modal-header"><div className="modal-title">{selected.firstName} {selected.lastName}</div><button onClick={()=>setSelected(null)} className="btn-icon"><X size={16}/></button></div>
            <div className="modal-body">
              <div className="grid-2" style={{ gap:'0.75rem' }}>
                {[['Name',`${selected.firstName} ${selected.lastName}`],['Age',`${calcAge(selected.birthDate)} years`],['Sex',selected.gender],['Civil Status',selected.civilStatus],['Barangay',selected.barangay],['Contact',selected.contactNumber||'—'],['PWD ID',selected.pwdId||'—'],['Disability Type',selected.disabilityType||'—']].map(([l,v])=>(
                  <div key={l}><div style={{ fontSize:'0.68rem',fontWeight:700,color:'#94a3b8',textTransform:'uppercase',marginBottom:2}}>{l}</div><div style={{ fontSize:'0.85rem',fontWeight:500}}>{v}</div></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
