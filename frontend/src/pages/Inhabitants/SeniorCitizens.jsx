import { useState, useEffect } from 'react';
import api from '../../services/api';
import { UserCheck, Search, Eye, X } from 'lucide-react';

const calcAge = (bd) => { if (!bd) return '—'; return `${new Date().getFullYear() - new Date(bd).getFullYear()}`; };

export default function SeniorCitizens() {
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    api.get('/residents', { params: { tag: 'senior' } })
      .then(({ data }) => setResidents((data.data || []).filter(r => r.tags?.senior || parseInt(calcAge(r.birthDate)) >= 60)))
      .catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = residents.filter(r =>
    `${r.firstName} ${r.lastName} ${r.barangay}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ maxWidth: 1100 }}>
      <div className="page-header">
        <div>
          <div className="page-title">Senior Citizens Registry</div>
          <div className="page-subtitle">Auto-filtered list of residents aged 60 and above</div>
        </div>
        <div style={{ padding:'0.5rem 1.25rem', borderRadius:8, background:'rgba(26,79,138,0.08)', border:'1px solid rgba(26,79,138,0.15)', fontSize:'0.82rem', fontWeight:700, color:'#1a4f8a' }}>
          👴 {filtered.length} Senior Citizens
        </div>
      </div>

      <div className="gov-card" style={{ marginBottom:'1.25rem', padding:'0.875rem 1.25rem' }}>
        <input className="form-input" placeholder="Search by name or barangay..." value={search} onChange={e=>setSearch(e.target.value)} style={{ maxWidth:360 }} />
      </div>

      <div className="gov-card" style={{ overflow:'hidden' }}>
        <table className="gov-table">
          <thead><tr><th>Name</th><th>Age</th><th>Sex</th><th>Barangay</th><th>OSCA ID</th><th>Pension Status</th><th>Medical Condition</th><th>Actions</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={8} style={{ padding:'2rem', textAlign:'center' }}>Loading...</td></tr>
            : filtered.map(r => (
              <tr key={r.id}>
                <td style={{ fontWeight:600 }}>{r.lastName}, {r.firstName}</td>
                <td><span style={{ fontWeight:700, color:'#1a4f8a' }}>{calcAge(r.birthDate)}</span> yrs</td>
                <td>{r.gender}</td>
                <td><span className="badge badge-blue" style={{ fontSize:'0.68rem' }}>{r.barangay}</span></td>
                <td style={{ fontSize:'0.8rem' }}>{r.oscaId || <span style={{ color:'#94a3b8' }}>Not yet issued</span>}</td>
                <td>{r.pensionStatus ? <span className="badge badge-green" style={{ fontSize:'0.68rem' }}>{r.pensionStatus}</span> : <span style={{ color:'#94a3b8', fontSize:'0.8rem' }}>—</span>}</td>
                <td style={{ fontSize:'0.8rem' }}>{r.medicalCondition || '—'}</td>
                <td><button onClick={()=>setSelected(r)} className="btn-icon"><Eye size={14} color="#1a4f8a"/></button></td>
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
                {[['Full Name',`${selected.firstName} ${selected.middleName||''} ${selected.lastName}`],['Age',`${calcAge(selected.birthDate)} years old`],['Birthdate',selected.birthDate],['Sex',selected.gender],['Civil Status',selected.civilStatus],['Barangay',selected.barangay],['Address',selected.address],['Contact',selected.contactNumber||'—'],['OSCA ID',selected.oscaId||'—'],['Pension',selected.pensionStatus||'—']].map(([l,v])=>(
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
