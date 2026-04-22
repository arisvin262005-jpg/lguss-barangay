import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, LogIn, AlertCircle, Wifi } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', remember: false });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [lockout, setLockout] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const startLockoutTimer = () => {
    setLockout(true);
    let secs = 900; setCountdown(secs);
    const t = setInterval(() => {
      secs--;
      setCountdown(secs);
      if (secs <= 0) { clearInterval(t); setLockout(false); setAttempts(0); }
    }, 1000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (lockout) return;
    setError(''); setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      if (newAttempts >= 5 || err.response?.data?.lockout) {
        startLockoutTimer();
        setError('Too many failed attempts. Account locked for 15 minutes.');
      } else {
        setError((err.response?.data?.error || 'Invalid credentials') + `. ${5 - newAttempts} attempt(s) remaining.`);
      }
    } finally { setLoading(false); }
  };

  const fmtCountdown = (s) => `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`;

  const demos = [
    { role: 'Admin',     email: 'admin@barangay.gov.ph' },
    { role: 'Secretary', email: 'secretary@barangay.gov.ph' },
  ];

  return (
    <div style={{ height: '100vh', width: '100vw', display: 'flex', background: '#f0f4f8', overflow: 'hidden' }}>
      {/* Left panel - Visual/Abstract */}
      <div className="gradient-bg-primary" style={{ flex: 1.2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', color: '#fff', position: 'relative', overflow: 'hidden' }}>
        <div className="floating-shape" style={{ position: 'absolute', top: '10%', left: '5%', width: 250, height: 250, background: 'radial-gradient(circle, rgba(14,165,233,0.5) 0%, rgba(0,0,0,0) 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div className="floating-shape" style={{ position: 'absolute', bottom: '10%', right: '10%', width: 350, height: 350, background: 'radial-gradient(circle, rgba(232,160,32,0.4) 0%, rgba(0,0,0,0) 70%)', borderRadius: '50%', pointerEvents: 'none', animationDelay: '2s', animationDuration: '8s' }} />

        <div className="glass-panel-dark hover-float" style={{ textAlign: 'center', maxWidth: 420, padding: '2.5rem 2rem', borderRadius: 20, zIndex: 1 }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem', filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.5))' }}>🏛️</div>
          <h1 style={{ fontWeight: 900, fontSize: '1.9rem', marginBottom: '0.75rem', lineHeight: 1.2, textShadow: '0 2px 5px rgba(0,0,0,0.4)', color: '#ffffff' }}>Barangay<br/>Management System</h1>
          <div style={{ width: 50, height: 4, background: 'linear-gradient(90deg, #0ea5e9, transparent)', margin: '0 auto 1rem', borderRadius: 2 }} />
          <p style={{ color: '#e0f2fe', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '1.5rem', fontWeight: 500 }}>Mamburao, Occidental Mindoro<br />Advanced DILG Information System</p>
          <div style={{ display: 'inline-flex', gap: '0.5rem', justifyContent: 'center', alignItems: 'center', background: 'rgba(0,0,0,0.3)', padding: '0.5rem 1rem', borderRadius: 100, border: '1px solid rgba(255,255,255,0.2)' }}>
            <Wifi size={16} color="#38bdf8" className="btn-pulse" style={{ borderRadius: '50%' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.05em', color: '#ffffff' }}>OFFLINE-FIRST SYNC</span>
          </div>
        </div>
      </div>

      {/* Right panel - Form Container */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', background: '#f8fafc', overflowY: 'auto' }}>
        <div style={{ width: '100%', maxWidth: 420, padding: '2rem', position: 'relative', zIndex: 1 }}>
          <h2 className="text-gradient" style={{ fontWeight: 900, fontSize: '1.6rem', marginBottom: '0.25rem' }}>Secure Portal</h2>
          <p style={{ fontSize: '0.85rem', color: '#334155', marginBottom: '1.5rem', fontWeight: 600 }}>Enter your credentials to access the system.</p>

          {/* Alert banners */}
          {lockout && (
            <div className="alert alert-danger" style={{ padding: '0.5rem 0.75rem', marginBottom: '1rem', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600, color: '#dc2626' }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>Locked. Try in <strong>{fmtCountdown(countdown)}</strong>.</span>
            </div>
          )}
          {error && !lockout && (
            <div className="alert alert-danger" style={{ padding: '0.5rem 0.75rem', marginBottom: '1rem', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600, color: '#dc2626' }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label" style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.8rem' }}>Official Email Address</label>
              <input className="form-input form-input-advanced" type="email" required placeholder="you@barangay.gov.ph" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={{ padding: '0.65rem 0.8rem', fontSize: '0.85rem', color: '#0f172a', fontWeight: 600, borderColor: '#cbd5e1' }} />
            </div>
            
            <div className="form-group" style={{ marginBottom: '0.75rem' }}>
              <label className="form-label" style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.8rem' }}>Secure Password</label>
              <div style={{ position: 'relative' }}>
                <input className="form-input form-input-advanced" type={showPwd ? 'text' : 'password'} required placeholder="••••••••" style={{ padding: '0.65rem 0.8rem', paddingRight: '2.5rem', fontSize: '0.85rem', color: '#0f172a', fontWeight: 800, borderColor: '#cbd5e1' }} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#475569', padding: '0.2rem' }}>
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#334155', cursor: 'pointer', fontWeight: 700 }}>
                <input type="checkbox" checked={form.remember} onChange={e => setForm({ ...form, remember: e.target.checked })} style={{ width: 14, height: 14, accentColor: '#1a4f8a', cursor: 'pointer' }} /> 
                Keep me logged in
              </label>
              <Link to="/forgot-password" style={{ fontSize: '0.8rem', color: '#0284c7', textDecoration: 'none', fontWeight: 800, transition: 'color 0.2s' }} onMouseEnter={e=>e.target.style.color='#1a4f8a'} onMouseLeave={e=>e.target.style.color='#0284c7'}>Reset Password?</Link>
            </div>

            <button type="submit" className="btn btn-primary hover-glow" disabled={loading || lockout} style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', fontSize: '0.9rem', borderRadius: 8, fontWeight: 800, background: 'linear-gradient(90deg, #1a4f8a, #0f2d52)', border: 'none', boxShadow: '0 4px 10px rgba(26,79,138,0.25)' }}>
              {loading ? <div className="animate-spin" style={{ width: 18, height: 18, border: '3px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} /> : <LogIn size={18} />}
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', margin: '1.25rem 0', opacity: 0.8 }}>
            <div style={{ flex: 1, height: 1, background: '#cbd5e1' }} />
            <span style={{ padding: '0 0.75rem', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569' }}>Demo Access</span>
            <div style={{ flex: 1, height: 1, background: '#cbd5e1' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
            {demos.map(d => (
              <button key={d.role} onClick={() => setForm({ email: d.email, password: 'admin123', remember: false })}
                className="hover-float"
                style={{ padding: '0.6rem 0.2rem', borderRadius: 8, background: '#ffffff', border: '1px solid #cbd5e1', cursor: 'pointer', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: '#0f172a', fontWeight: 800 }}>{d.role}</div>
              </button>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>
            No account? <Link to="/register" style={{ color: '#1a4f8a', fontWeight: 800, textDecoration: 'none', marginLeft: '0.2rem' }}>Register Now</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
