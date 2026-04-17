import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Vote, Eye, X } from 'lucide-react';

const calcAge = (bd) => bd ? `${new Date().getFullYear()-new Date(bd).getFullYear()}` : '—';

export default function VoterRegistry() {
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    api.get('/residents').then(({ data }) => setResidents((data.data||[]).filter(r=>r.tags?.voter))).catch(()=>{}).finally(()=>setLoading(false));
  }, []);

  const filtered = residents.filter(r =>
    `${r.firstName} ${r.lastName} ${r.barangay}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ maxWidth:1100 }}>
      <div className="page-header">
        <div><div className="page-title">Voter Registry</div><div className="page-subtitle">Residents tagged as registered voters</div></div>
        <div style={{ padding:'0.5rem 1.25rem',borderRadius:8,background:'rgba(22,163,74,0.08)',border:'1px solid rgba(22,163,74,0.15)',fontSize:'0.82rem',fontWeight:700,color:'#16a34a' }}>
          🗳️ {filtered.length} Voters
        </div>
      </div>
      <div className="gov-card" style={{ marginBottom:'1.25rem',padding:'0.875rem 1.25rem' }}>
        <input className="form-input" placeholder="Search by name or barangay..." value={search} onChange={e=>setSearch(e.target.value)} style={{ maxWidth:360 }} />
      </div>
      <div className="gov-card" style={{ overflow:'hidden' }}>
        <table className="gov-table">
          <thead><tr><th>Name</th><th>Age</th><th>Sex</th><th>Civil Status</th><th>Barangay</th><th>Precinct No.</th><th>Actions</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={7} style={{ padding:'2rem',textAlign:'center' }}>Loading...</td></tr>
            : filtered.map(r=>(
              <tr key={r.id}>
                <td style={{ fontWeight:600 }}>{r.lastName}, {r.firstName}</td>
                <td>{calcAge(r.birthDate)} yrs</td>
                <td>{r.gender}</td>
                <td>{r.civilStatus}</td>
                <td><span className="badge badge-blue" style={{ fontSize:'0.68rem' }}>{r.barangay}</span></td>
                <td style={{ fontSize:'0.8rem' }}>{r.precinctNo||<span style={{ color:'#94a3b8' }}>—</span>}</td>
                <td><button onClick={()=>setSelected(r)} className="btn-icon"><Eye size={14} color="#1a4f8a"/></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {selected && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setSelected(null)}>
          <div className="modal" style={{ maxWidth:400 }}>
            <div className="modal-header"><div className="modal-title">{selected.firstName} {selected.lastName}</div><button onClick={()=>setSelected(null)} className="btn-icon"><X size={16}/></button></div>
            <div className="modal-body">
              <div className="grid-2" style={{ gap:'0.75rem' }}>
                {[['Name',`${selected.firstName} ${selected.lastName}`],['Age',`${calcAge(selected.birthDate)} years`],['Sex',selected.gender],['Barangay',selected.barangay],['Address',selected.address||'—'],['Precinct No.',selected.precinctNo||'—']].map(([l,v])=>(
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
