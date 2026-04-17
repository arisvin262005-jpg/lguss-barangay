import { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { BARANGAY_NAMES, getBarangayInfo } from '../../config/barangays';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { QRCodeSVG } from 'qrcode.react';
import { Users, Plus, Search, Edit2, Eye, Trash2, X, Save, Download, QrCode, Filter } from 'lucide-react';

const EDUCATION = ['No Formal Education','Elementary Graduate','High School Graduate','Vocational/Tech-Voc','College Level','College Graduate','Post Graduate'];
const CIVIL_STATUS = ['Single','Married','Widowed','Separated','Annulled'];
const BLOOD_TYPES = ['A+','A-','B+','B-','AB+','AB-','O+','O-','Unknown'];
const TAGS_LIST = [
  { key: 'voter',    label: '🗳️ Voter' },
  { key: 'senior',   label: '👴 Senior Citizen' },
  { key: 'pwd',      label: '♿ PWD' },
  { key: 'fourPs',   label: '🏠 4Ps Beneficiary' },
  { key: 'soloPar',  label: '👩‍👦 Solo Parent' },
  { key: 'ip',       label: '🌿 Indigenous People' },
];

const emptyForm = {
  firstName:'', lastName:'', middleName:'', suffix:'', birthDate:'',
  gender:'Male', civilStatus:'Single', citizenship:'Filipino', religion:'', birthplace:'',
  address:'', barangay:'', contactNumber:'', email:'',
  education:'', occupation:'', monthlyIncome:'', bloodType:'',
  householdId:'', relationToHead:'Head',
  tags:{ voter:false, senior:false, pwd:false, fourPs:false, soloPar:false, ip:false },
};

const calcAge = (bd) => { if (!bd) return '—'; const d = new Date(bd); return `${new Date().getFullYear() - d.getFullYear()}`; };

export default function Residents() {
  const { hasRole } = useAuth();
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [filterBarangay, setFilterBarangay] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showQR, setShowQR] = useState(null);
  const qrRef = useRef(null);

  const canEdit = hasRole('Admin', 'Secretary');
  const canDelete = hasRole('Admin');

  useEffect(() => {
    api.get('/residents', { params: { search, barangay: filterBarangay } })
      .then(({ data }) => setResidents(data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [search, filterBarangay]);

  const filtered = residents.filter(r => !filterTag || r.tags?.[filterTag]);

  const openAdd  = () => { setForm(emptyForm); setSelected(null); setModal('form'); setError(''); };
  const openEdit = (r) => { setForm(r); setSelected(r); setModal('form'); setError(''); };
  const openView = (r) => { setSelected(r); setModal('view'); };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true); setError('');
    // Auto-tag senior if age >= 60
    const age = parseInt(calcAge(form.birthDate));
    const tags = { ...form.tags, senior: age >= 60 };
    try {
      if (!selected) {
        const { data } = await api.post('/residents', { ...form, tags });
        setResidents(prev => [data, ...prev]);
      } else {
        const { data } = await api.put(`/residents/${selected.id}`, { ...form, tags });
        setResidents(prev => prev.map(r => r.id === data.id ? data : r));
      }
      setModal(null);
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Failed to save');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Archive this resident record?')) return;
    await api.delete(`/residents/${id}`);
    setResidents(prev => prev.filter(r => r.id !== id));
  };

  // ===== EXPORT EXCEL =====
  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filtered.map(r => ({
      'Last Name': r.lastName, 'First Name': r.firstName, 'Middle Name': r.middleName || '',
      'Suffix': r.suffix || '', 'Birthdate': r.birthDate, 'Age': calcAge(r.birthDate),
      'Sex': r.gender, 'Civil Status': r.civilStatus, 'Barangay': r.barangay,
      'Address': r.address, 'Contact No': r.contactNumber || '',
      'Education': r.education || '', 'Occupation': r.occupation || '',
      'Blood Type': r.bloodType || '', 'Voter': r.tags?.voter ? 'Yes' : 'No',
      'Senior': r.tags?.senior ? 'Yes' : 'No', 'PWD': r.tags?.pwd ? 'Yes' : 'No',
      '4Ps': r.tags?.fourPs ? 'Yes' : 'No',
    })));
    ws['!cols'] = Array(18).fill({ wch: 16 });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Residents');
    XLSX.writeFile(wb, `Resident_Masterlist_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // ===== EXPORT PDF =====
  const exportPDF = () => {
    const doc = new jsPDF('l', 'mm', 'a4');
    doc.setFontSize(14); doc.setFont('helvetica','bold');
    doc.text('MUNICIPALITY OF MAMBURAO', 148, 16, { align: 'center' });
    doc.setFontSize(11); doc.setFont('helvetica','normal');
    doc.text('Occidental Mindoro — Resident Masterlist', 148, 23, { align: 'center' });
    doc.setFontSize(9);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-PH', { dateStyle: 'long' })}  |  Total Records: ${filtered.length}`, 148, 29, { align: 'center' });
    doc.autoTable({
      startY: 35,
      head: [['#','Last Name','First Name','Age','Sex','Civil Status','Barangay','Voter','Senior','PWD']],
      body: filtered.map((r, i) => [
        i+1, r.lastName, `${r.firstName} ${r.middleName?.[0]||''}`.trim(),
        calcAge(r.birthDate), r.gender?.[0], r.civilStatus, r.barangay,
        r.tags?.voter?'✓':'', r.tags?.senior?'✓':'', r.tags?.pwd?'✓':'',
      ]),
      headStyles: { fillColor: [26,79,138], textColor: '#fff', fontSize: 8, fontStyle: 'bold' },
      bodyStyles: { fontSize: 7.5 },
      alternateRowStyles: { fillColor: [248,250,252] },
    });
    doc.save(`Resident_Masterlist_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const tagBadge = (tags) => TAGS_LIST.filter(t => tags?.[t.key]).map(t => (
    <span key={t.key} className="badge badge-blue" style={{ fontSize: '0.65rem', padding: '0.12rem 0.45rem', marginRight: 3 }}>{t.label}</span>
  ));

  return (
    <div style={{ maxWidth: 1200 }}>
      <div className="page-header">
        <div>
          <div className="page-title">Resident Profiling</div>
          <div className="page-subtitle">Manage constituent records with full demographic data</div>
        </div>
        <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap' }}>
          {canEdit && (
            <>
              <button className="btn btn-secondary btn-sm" onClick={exportExcel}><Download size={14} /> Excel</button>
              <button className="btn btn-secondary btn-sm" onClick={exportPDF}><Download size={14} /> PDF</button>
              <button className="btn btn-primary" onClick={openAdd}><Plus size={16} /> Add Resident</button>
            </>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="gov-card" style={{ marginBottom: '1.25rem', padding: '0.875rem 1.25rem', display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div className="search-bar" style={{ flex: 1, minWidth: 200 }}>
          <Search size={15} className="search-bar-icon" />
          <input className="form-input" placeholder="Search by name..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '2.2rem' }} />
        </div>
        <select className="form-select" style={{ width: 190 }} value={filterBarangay} onChange={e => setFilterBarangay(e.target.value)}>
          <option value="">All Barangays</option>
          {BARANGAY_NAMES.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
        <select className="form-select" style={{ width: 180 }} value={filterTag} onChange={e => setFilterTag(e.target.value)}>
          <option value="">All Types</option>
          {TAGS_LIST.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
        </select>
        <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>{filtered.length} records</span>
      </div>

      {/* Table */}
      <div className="gov-card" style={{ overflow: 'hidden' }}>
        <table className="gov-table">
          <thead>
            <tr><th>Name</th><th>Age / Sex</th><th>Civil Status</th><th>Barangay</th><th>Contact</th><th>Tags</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {loading ? Array.from({length: 5}).map((_, i) => (
              <tr key={i}><td colSpan={7}><div className="skeleton" style={{ height: 18, borderRadius: 4 }} /></td></tr>
            )) : filtered.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8' }}>No residents found</td></tr>
            ) : filtered.map(r => (
              <tr key={r.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#1a4f8a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>
                      {r.firstName?.[0]}{r.lastName?.[0]}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{r.lastName}, {r.firstName} {r.middleName?.[0] ? r.middleName[0]+'.' : ''}{r.suffix ? ` ${r.suffix}` : ''}</div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{r.occupation || 'No occupation'}</div>
                    </div>
                  </div>
                </td>
                <td><div style={{ fontWeight: 600 }}>{calcAge(r.birthDate)} yrs</div><div style={{ fontSize: '0.72rem', color: '#64748b' }}>{r.gender}</div></td>
                <td style={{ fontSize: '0.82rem' }}>{r.civilStatus}</td>
                <td><span className="badge badge-blue" style={{ fontSize: '0.68rem' }}>{r.barangay}</span></td>
                <td style={{ fontSize: '0.8rem' }}>{r.contactNumber || '—'}</td>
                <td><div style={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>{tagBadge(r.tags)}</div></td>
                <td>
                  <div style={{ display: 'flex', gap: '0.3rem' }}>
                    <button onClick={() => openView(r)} className="btn-icon" title="View"><Eye size={14} color="#1a4f8a" /></button>
                    <button onClick={() => setShowQR(r)}  className="btn-icon" title="QR Code"><QrCode size={14} color="#7c3aed" /></button>
                    {canEdit   && <button onClick={() => openEdit(r)}    className="btn-icon" title="Edit"><Edit2 size={14} color="#d97706" /></button>}
                    {canDelete && <button onClick={() => handleDelete(r.id)} className="btn-icon" title="Archive"><Trash2 size={14} color="#dc2626" /></button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* QR Modal */}
      {showQR && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowQR(null)}>
          <div className="modal" style={{ maxWidth: 320, textAlign: 'center' }}>
            <div className="modal-header"><span className="modal-title">Resident QR Code</span><button onClick={() => setShowQR(null)} className="btn-icon"><X size={16} /></button></div>
            <div className="modal-body">
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                <QRCodeSVG ref={qrRef} value={JSON.stringify({ id: showQR.id, name: `${showQR.firstName} ${showQR.lastName}`, barangay: showQR.barangay, birthDate: showQR.birthDate })} size={180} level="M" />
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{showQR.lastName}, {showQR.firstName}</div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 2 }}>Brgy. {showQR.barangay} • ID: {showQR.id}</div>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {modal === 'form' && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal" style={{ maxWidth: 740 }}>
            <div className="modal-header">
              <div className="modal-title">{selected ? 'Edit Resident' : 'Add New Resident'}</div>
              <button onClick={() => setModal(null)} className="btn-icon"><X size={16} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                {error && <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>{error}</div>}

                {/* Section: Personal Info */}
                <div className="section-stripe" style={{ marginBottom: '1rem' }}>Personal Information</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 0.5fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  {[['firstName','First Name *'],['lastName','Last Name *'],['middleName','Middle Name'],['suffix','Suffix']].map(([k,l]) => (
                    <div key={k}>
                      <label className="form-label">{l}</label>
                      <input className="form-input" value={form[k]||''} onChange={e=>setForm({...form,[k]:e.target.value})} required={k.includes('Name') && k!=='middleName'} />
                    </div>
                  ))}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div>
                    <label className="form-label">Birth Date *</label>
                    <input className="form-input" type="date" required value={form.birthDate} onChange={e=>setForm({...form,birthDate:e.target.value})} />
                  </div>
                  <div>
                    <label className="form-label">Sex</label>
                    <select className="form-select" value={form.gender} onChange={e=>setForm({...form,gender:e.target.value})}>
                      <option>Male</option><option>Female</option><option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Civil Status</label>
                    <select className="form-select" value={form.civilStatus} onChange={e=>setForm({...form,civilStatus:e.target.value})}>
                      {CIVIL_STATUS.map(s=><option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Blood Type</label>
                    <select className="form-select" value={form.bloodType} onChange={e=>setForm({...form,bloodType:e.target.value})}>
                      <option value="">Select</option>
                      {BLOOD_TYPES.map(t=><option key={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'0.75rem', marginBottom:'0.75rem' }}>
                  <div><label className="form-label">Religion</label><input className="form-input" value={form.religion||''} onChange={e=>setForm({...form,religion:e.target.value})} /></div>
                  <div><label className="form-label">Citizenship</label><input className="form-input" value={form.citizenship} onChange={e=>setForm({...form,citizenship:e.target.value})} /></div>
                  <div><label className="form-label">Birthplace</label><input className="form-input" value={form.birthplace||''} onChange={e=>setForm({...form,birthplace:e.target.value})} /></div>
                </div>

                {/* Section: Address */}
                <div className="section-stripe" style={{ marginBottom: '1rem', marginTop: '0.5rem' }}>Address & Contact</div>
                <div style={{ display: 'grid', gridTemplateColumns:'2fr 1fr 1fr', gap:'0.75rem', marginBottom:'0.75rem' }}>
                  <div><label className="form-label">Address</label><input className="form-input" value={form.address} onChange={e=>setForm({...form,address:e.target.value})} placeholder="House No., Street" /></div>
                  <div>
                    <label className="form-label">Barangay *</label>
                    <select className="form-select" required value={form.barangay} onChange={e=>setForm({...form,barangay:e.target.value})}>
                      <option value="">Select</option>
                      {BARANGAY_NAMES.map(b=><option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div><label className="form-label">Contact No.</label><input className="form-input" value={form.contactNumber||''} onChange={e=>setForm({...form,contactNumber:e.target.value})} /></div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem', marginBottom:'0.75rem' }}>
                  <div><label className="form-label">Email</label><input className="form-input" type="email" value={form.email||''} onChange={e=>setForm({...form,email:e.target.value})} /></div>
                  <div><label className="form-label">Relationship to Household Head</label><input className="form-input" value={form.relationToHead} onChange={e=>setForm({...form,relationToHead:e.target.value})} /></div>
                </div>

                {/* Section: Socioeconomic */}
                <div className="section-stripe" style={{ marginBottom: '1rem', marginTop: '0.5rem' }}>Socioeconomic Information</div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'0.75rem', marginBottom:'0.75rem' }}>
                  <div>
                    <label className="form-label">Educational Attainment</label>
                    <select className="form-select" value={form.education||''} onChange={e=>setForm({...form,education:e.target.value})}>
                      <option value="">Select</option>
                      {EDUCATION.map(e=><option key={e}>{e}</option>)}
                    </select>
                  </div>
                  <div><label className="form-label">Occupation</label><input className="form-input" value={form.occupation||''} onChange={e=>setForm({...form,occupation:e.target.value})} /></div>
                  <div><label className="form-label">Monthly Income (₱)</label><input className="form-input" type="number" value={form.monthlyIncome||''} onChange={e=>setForm({...form,monthlyIncome:e.target.value})} /></div>
                </div>

                {/* Tags */}
                <div className="section-stripe" style={{ marginBottom: '0.875rem', marginTop: '0.5rem' }}>Classification Tags</div>
                <div style={{ display:'flex', gap:'0.75rem', flexWrap:'wrap', marginBottom:'0.5rem' }}>
                  {TAGS_LIST.map(t => (
                    <label key={t.key} style={{ display:'flex', alignItems:'center', gap:'0.35rem', fontSize:'0.82rem', color:'#334155', cursor:'pointer', padding:'0.35rem 0.75rem', background: form.tags?.[t.key] ? '#e8f0fb' : '#f8fafc', border: `1px solid ${form.tags?.[t.key] ? '#1a4f8a' : '#dde3ed'}`, borderRadius:7 }}>
                      <input type="checkbox" checked={!!form.tags?.[t.key]} onChange={e=>setForm({...form,tags:{...form.tags,[t.key]:e.target.checked}})} style={{ accentColor:'#1a4f8a' }} />
                      {t.label}
                    </label>
                  ))}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : <><Save size={15} />Save Resident</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {modal === 'view' && selected && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal" style={{ maxWidth: 560 }}>
            <div className="modal-header">
              <div className="modal-title">{selected.lastName}, {selected.firstName}</div>
              <button onClick={() => setModal(null)} className="btn-icon"><X size={16} /></button>
            </div>
            <div className="modal-body">
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.875rem' }}>
                {[
                  ['Full Name', `${selected.firstName} ${selected.middleName||''} ${selected.lastName} ${selected.suffix||''}`],
                  ['Birthdate / Age', `${selected.birthDate} (${calcAge(selected.birthDate)} yrs old)`],
                  ['Sex', selected.gender], ['Civil Status', selected.civilStatus],
                  ['Religion', selected.religion||'—'], ['Birthplace', selected.birthplace||'—'],
                  ['Barangay', selected.barangay], ['Address', selected.address],
                  ['Contact', selected.contactNumber||'—'], ['Email', selected.email||'—'],
                  ['Occupation', selected.occupation||'—'], ['Education', selected.education||'—'],
                  ['Monthly Income', selected.monthlyIncome ? `₱${Number(selected.monthlyIncome).toLocaleString()}` : '—'],
                  ['Blood Type', selected.bloodType||'—'],
                ].map(([l,v]) => (
                  <div key={l}><div style={{ fontSize:'0.68rem', fontWeight:700, color:'#94a3b8', textTransform:'uppercase', marginBottom:2 }}>{l}</div><div style={{ fontSize:'0.85rem', color:'#1e2a3a', fontWeight:500 }}>{v}</div></div>
                ))}
              </div>
              {selected.tags && Object.values(selected.tags).some(Boolean) && (
                <div style={{ marginTop:'1rem' }}>
                  <div style={{ fontSize:'0.68rem', fontWeight:700, color:'#94a3b8', textTransform:'uppercase', marginBottom:'0.5rem' }}>Tags</div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>{tagBadge(selected.tags)}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
