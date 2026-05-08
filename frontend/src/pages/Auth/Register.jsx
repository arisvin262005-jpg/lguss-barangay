import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, UserPlus, AlertCircle, ShieldCheck, CheckCircle2, Clock, Info } from 'lucide-react';

const BARANGAYS = [
  'Barangay 1 (Poblacion)', 'Barangay 2 (Poblacion)', 'Barangay 3 (Poblacion)',
  'Barangay 4 (Poblacion)', 'Barangay 5', 'Barangay 6', 'Barangay 7', 'Barangay 8',
  'Balansay', 'Fatima', 'Tayamaan', 'Calawag', 'Dalahican', 'Payompon',
  'Tangkalan', 'San Luis', 'Talabaan',
];

const getStrength = (pwd) => {
  let s = 0;
  if (pwd.length >= 8) s++;
  if (/[A-Z]/.test(pwd)) s++;
  if (/[0-9]/.test(pwd)) s++;
  if (/[^A-Za-z0-9]/.test(pwd)) s++;
  if (pwd.length >= 12) s++;
  return s;
};
const STRENGTH_LABEL = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
const STRENGTH_COLOR = ['', '#dc2626', '#d97706', '#0284c7', '#16a34a', '#16a34a'];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '',
    confirmPassword: '', barangay: '', role: 'Secretary', privacyAgreed: false
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const str = getStrength(form.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.privacyAgreed) { setError('You must agree to the Data Privacy Act notice.'); return; }
    if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return; }
    if (str < 2) { setError('Password is too weak. Use at least 8 characters with uppercase letters and numbers.'); return; }

    setError(''); setLoading(true);
    try {
      await register({ ...form, role: 'Secretary' });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Pending Approval Success Screen ──
  if (success) {
    return (
      <div className="gradient-bg-primary" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div className="glass-panel" style={{ width: '100%', maxWidth: 480, padding: '3.5rem 3rem', borderRadius: 24, textAlign: 'center' }}>
          {/* Icon */}
          <div style={{ width: 90, height: 90, borderRadius: '50%', background: 'linear-gradient(135deg, #1a4f8a, #0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: '0 0 30px rgba(14,165,233,0.4)' }}>
            <Clock color="#fff" size={44} />
          </div>

          <h2 style={{ fontWeight: 900, fontSize: '1.8rem', color: '#1a4f8a', marginBottom: '0.75rem' }}>
            Registration Submitted!
          </h2>
          <p style={{ fontSize: '1rem', color: '#334155', fontWeight: 600, marginBottom: '0.5rem' }}>
            Your Secretary account is <span style={{ color: '#d97706', fontWeight: 800 }}>pending admin approval.</span>
          </p>
          <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.7, marginBottom: '2rem' }}>
            The System Administrator will review your registration request. You will be able to log in once your account has been approved.
          </p>

          {/* Info box */}
          <div style={{ background: 'rgba(26,79,138,0.07)', border: '1px solid rgba(26,79,138,0.15)', borderRadius: 12, padding: '1rem 1.25rem', marginBottom: '2rem', textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Info size={16} color="#1a4f8a" />
              <span style={{ fontWeight: 700, color: '#1a4f8a', fontSize: '0.85rem' }}>What happens next?</span>
            </div>
            <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#475569', fontSize: '0.82rem', lineHeight: 1.8 }}>
              <li>The Admin reviews your account details</li>
              <li>Once approved, you can log in with your email & password</li>
              <li>Contact your LGU Administrator if you need immediate access</li>
            </ul>
          </div>

          <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'linear-gradient(90deg, #1a4f8a, #0ea5e9)', color: '#fff', padding: '0.75rem 2rem', borderRadius: 10, fontWeight: 800, fontSize: '0.9rem', textDecoration: 'none', boxShadow: '0 4px 12px rgba(26,79,138,0.3)' }}>
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="gradient-bg-primary" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative', overflow: 'hidden' }}>
      {/* Abstract Background Shapes */}
      <div className="floating-shape" style={{ position: 'absolute', top: '-10%', left: '-10%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(14,165,233,0.3) 0%, rgba(0,0,0,0) 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
      <div className="floating-shape" style={{ position: 'absolute', bottom: '-20%', right: '-5%', width: 600, height: 600, background: 'radial-gradient(circle, rgba(232,160,32,0.2) 0%, rgba(0,0,0,0) 70%)', borderRadius: '50%', pointerEvents: 'none', animationDelay: '2s', animationDuration: '10s' }} />

      <div className="glass-panel" style={{ width: '100%', maxWidth: 650, borderRadius: 24, overflow: 'hidden', position: 'relative', zIndex: 1, boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
        {/* Header stripe */}
        <div style={{ background: 'linear-gradient(90deg, #163e6e, #1a4f8a)', color: '#fff', padding: '2rem 3rem', display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
          <span className="floating-shape" style={{ fontSize: '2.5rem', filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.3))' }}>🏛️</span>
          <div>
            <div style={{ fontWeight: 900, fontSize: '1.4rem', letterSpacing: '0.02em', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>Secretary Account Registration</div>
            <div style={{ fontSize: '0.85rem', color: '#bae6fd', fontWeight: 500 }}>Barangay Management System — Mamburao, Occ. Mindoro</div>
          </div>
        </div>

        <div style={{ padding: '3rem' }}>
          {/* Role notice banner */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.25)', borderRadius: 12, padding: '0.875rem 1.125rem', marginBottom: '1.75rem' }}>
            <Info size={18} color="#0ea5e9" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <div style={{ fontWeight: 700, color: '#0369a1', fontSize: '0.85rem', marginBottom: '0.2rem' }}>Barangay Secretary Registration</div>
              <div style={{ fontSize: '0.8rem', color: '#334155', lineHeight: 1.6 }}>
                This form is for <strong>Barangay Secretaries only.</strong> The Admin account is managed directly by the LGU System Administrator. Submitted accounts require Admin approval before login.
              </div>
            </div>
          </div>

          {error && <div className="alert alert-danger" style={{ marginBottom: '1.5rem', borderRadius: 12, alignItems: 'center' }}><AlertCircle size={18} /><span>{error}</span></div>}

          <form onSubmit={handleSubmit}>
            <div className="grid-2" style={{ marginBottom: '1.25rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 700 }}>First Name *</label>
                <input className="form-input form-input-advanced" required value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} placeholder="Juan" />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 700 }}>Last Name *</label>
                <input className="form-input form-input-advanced" required value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} placeholder="dela Cruz" />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="form-label" style={{ fontWeight: 700 }}>Official Email Address *</label>
              <input className="form-input form-input-advanced" type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="juan@barangay.gov.ph" />
            </div>

            <div className="grid-2" style={{ marginBottom: '1.25rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 700 }}>Designated Barangay *</label>
                <select className="form-select form-input-advanced" required value={form.barangay} onChange={e => setForm({ ...form, barangay: e.target.value })}>
                  <option value="" disabled>Select Barangay</option>
                  {BARANGAYS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 700 }}>System Role</label>
                <div className="form-input form-input-advanced" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'default', background: 'rgba(26,79,138,0.05)', borderColor: 'rgba(26,79,138,0.2)' }}>
                  <span style={{ fontSize: '1rem' }}>📋</span>
                  <span style={{ fontWeight: 700, color: '#1a4f8a', fontSize: '0.85rem' }}>Secretary</span>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', marginLeft: 'auto' }}>(fixed)</span>
                </div>
              </div>
            </div>

            <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 700 }}>Secure Password *</label>
                <div style={{ position: 'relative' }}>
                  <input className="form-input form-input-advanced" type={showPwd ? 'text' : 'password'} required placeholder="Min 8 chars, uppercase, number" style={{ paddingRight: '2.5rem' }} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                  <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                    {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {form.password && (
                  <div style={{ marginTop: '0.75rem', background: '#f8fafc', padding: '0.5rem', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', gap: 4, marginBottom: '0.4rem' }}>
                      {[1, 2, 3, 4, 5].map(i => <div key={i} style={{ flex: 1, height: 6, borderRadius: 3, background: i <= str ? STRENGTH_COLOR[str] : '#cbd5e1', transition: 'background 0.4s ease' }} />)}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: STRENGTH_COLOR[str], fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{STRENGTH_LABEL[str]}</div>
                  </div>
                )}
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 700 }}>Confirm Password *</label>
                <input className="form-input form-input-advanced" type="password" required placeholder="••••••••" value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} />
                {form.confirmPassword && form.password !== form.confirmPassword && (
                  <div style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '0.4rem', fontWeight: 600 }}>Passwords do not match</div>
                )}
              </div>
            </div>

            {/* Data Privacy Notice */}
            <div className="hover-float" style={{ padding: '1.25rem', borderRadius: 12, background: '#f8fafc', border: '1px solid #cbd5e1', marginBottom: '2rem', transition: 'all 0.3s' }}>
              <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', marginBottom: '0.75rem' }}>
                <ShieldCheck size={20} color="#1a4f8a" />
                <strong style={{ color: '#1a4f8a', fontSize: '0.9rem' }}>Data Privacy Act of 2012 (RA 10173)</strong>
              </div>
              <p style={{ color: '#475569', lineHeight: 1.6, fontSize: '0.85rem' }}>Your personal information will be securely collected and processed exclusively for barangay management and governance purposes. Local offline data is encrypted.</p>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '1rem', cursor: 'pointer', fontWeight: 700, color: '#0f2d52' }}>
                <input type="checkbox" checked={form.privacyAgreed} onChange={e => setForm({ ...form, privacyAgreed: e.target.checked })} style={{ width: 18, height: 18, accentColor: '#1a4f8a', cursor: 'pointer' }} />
                I accept the Data Privacy Terms and Conditions.
              </label>
            </div>

            <button type="submit" className="btn btn-primary btn-pulse" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '1rem', borderRadius: 12, fontSize: '1rem', fontWeight: 800, background: 'linear-gradient(90deg, #1a4f8a, #0ea5e9)', border: 'none', boxShadow: '0 4px 15px rgba(26,79,138,0.3)' }}>
              {loading ? <div className="animate-spin" style={{ width: 20, height: 20, border: '3px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} /> : <UserPlus size={20} />}
              {loading ? 'Submitting Registration...' : 'Submit Registration Request'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>
            Already registered? <Link to="/login" style={{ color: '#1a4f8a', fontWeight: 800, textDecoration: 'none', marginLeft: '0.3rem' }}>Sign In here</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
