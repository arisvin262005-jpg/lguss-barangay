import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { BARANGAYS } from '../config/barangays';
import { useAuth } from '../context/AuthContext';
import { usePWA } from '../context/PWAContext';
import {
  Eye, EyeOff, LogIn, AlertCircle, UserPlus, CheckCircle2, X,
  ChevronRight, Server, Target, BrainCircuit, Scale, Users,
  FileText, Map, Link2, ShieldAlert, ChevronDown, Sparkles,
  Shield, Wifi, Database, ArrowRight, Star, Download
} from 'lucide-react';

const GOV_BLUE   = '#0a3161';
const GOV_LIGHT  = '#1a5296';
const ACCENT     = '#2563eb';
const GOLD       = '#f59e0b';

/* ─── Password strength helper ─── */
const getStrength = (pwd) => {
  let s = 0;
  if (pwd.length > 7)       s++;
  if (/[A-Z]/.test(pwd))    s++;
  if (/[0-9]/.test(pwd))    s++;
  if (/[^A-Za-z0-9]/.test(pwd)) s++;
  return s;
};

/* ─── Subsystems data ─── */
const SUBSYSTEMS = [
  { icon: Server,       title: 'Offline-First Engine',      desc: 'Saves transactions natively using LocalStorage and seamlessly syncs to Firebase Firestore upon internet restoration.',    color: '#3b82f6', bg: '#eff6ff' },
  { icon: Target,       title: 'Decision Support System',   desc: 'Rule-based mechanism that analyzes past offenses and KP case records to restrict or flag certifications automatically, ensuring compliance with barangay rules.', color: '#8b5cf6', bg: '#f5f3ff' },
  { icon: BrainCircuit, title: 'AI Predictive Analytics',  desc: 'Identifies crime patterns within the municipality using forecasting to optimize patrol scheduling.',         color: '#06b6d4', bg: '#ecfeff' },
  { icon: Scale,        title: 'Katarungang Pambarangay',  desc: 'Secure digital mediation management for filing cases, scheduling hearings, and generating summons.',          color: '#10b981', bg: '#ecfdf5' },
  { icon: Users,        title: 'Resident Profiling',        desc: 'Organizes and tracks comprehensive resident and household demographic data conforming to DILG standards.',    color: '#f59e0b', bg: '#fffbeb' },
  { icon: FileText,     title: 'Issuance Management',       desc: 'Handles the automated generation of clearances, permits, and certificates with digital logging.',            color: '#ef4444', bg: '#fef2f2' },
  { icon: Map,          title: 'Live GIS Tracking',         desc: 'Real-time mapping of Tanod patrol coordinates and incident reports across the municipality.',                 color: '#14b8a6', bg: '#f0fdfa' },
  { icon: Link2,        title: 'Blockchain Audit',          desc: 'Secure and transparent record-keeping using SHA-256 blockchain technology. Immutable storage ensures the integrity of all barangay records, certificates, and transactions.', color: '#6366f1', bg: '#eef2ff' },
  { icon: ShieldAlert,  title: 'DRRM & GAD Plan',           desc: 'Supports proactive budgeting and disaster readiness planning mapped explicitly to community demographics.',   color: '#f97316', bg: '#fff7ed' },
];

const STATS = [
  { value: 15,    suffix: '',  label: 'Barangays Covered',    icon: Map,      color: '#3b82f6' },
  { value: 100,   suffix: '%', label: 'System Uptime',       icon: Wifi,     color: '#10b981' },
  { value: 9,     suffix: '',  label: 'Integrated Modules',  icon: Database, color: '#8b5cf6' },
  { value: 2024,  suffix: '',  label: 'Year Deployed',       icon: Star,     color: GOLD      },
];

/* ─── Animated counter hook ─── */
function useCountUp(target, duration = 1800, active = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration, active]);
  return count;
}

/* ─── Intersection‑observer hook ─── */
function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

/* ─── Single animated card ─── */
function AnimatedCard({ children, delay = 0, style = {} }) {
  const [ref, inView] = useInView(0.1);
  return (
    <div ref={ref} style={{
      transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
      opacity: inView ? 1 : 0,
      transform: inView ? 'translateY(0)' : 'translateY(40px)',
      ...style,
    }}>
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════ */
export default function Landing() {
  const [authModal, setAuthModal] = useState(null);
  const [scrolled, setScrolled]   = useState(false);
  const [heroVisible, setHeroVisible] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { isInstallable, isInstalled, installApp } = usePWA();

  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 100);
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => { clearTimeout(t); window.removeEventListener('scroll', handleScroll); };
  }, []);

  // Close mobile nav on click
  const closeNav = () => setMobileNavOpen(false);

  return (
    <div style={{ fontFamily: "'Inter', 'Roboto', sans-serif", color: '#1e293b', background: '#f8fafc', overflowX: 'hidden' }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

        * { box-sizing: border-box; }
        body { margin: 0; padding: 0; }
        .lp-container { max-width: 1200px; margin: 0 auto; padding: 0 1.5rem; }

        /* ── Nav ── */
        .lp-header {
          position: sticky; top: 0; z-index: 200;
          background: rgba(255,255,255,1);
          border-bottom: 1px solid transparent;
          transition: all 0.4s;
        }
        .lp-header.scrolled {
          background: rgba(255,255,255,0.85);
          backdrop-filter: blur(18px);
          border-color: rgba(10,49,97,0.1);
          box-shadow: 0 4px 24px rgba(10,49,97,0.08);
        }
        .lp-nav { display:flex; align-items:center; justify-content:space-between; height:72px; }
        .lp-nav-desktop { display: flex; gap: 0.25rem; align-items: center; }
        
        .lp-nav-link {
          text-decoration:none; color:#475569; font-weight:600; font-size:0.9rem;
          padding:0.4rem 0.6rem; border-radius:6px; transition:all 0.2s; position:relative;
        }
        .lp-nav-link::after {
          content:''; position:absolute; bottom:0; left:50%; right:50%;
          height:2px; background:${ACCENT}; border-radius:2px;
          transition:left 0.3s, right 0.3s;
        }
        .lp-nav-link:hover { color:${GOV_BLUE}; }
        .lp-nav-link:hover::after { left:0.6rem; right:0.6rem; }

        /* ── Mobile Nav ── */
        .mobile-nav-toggle { display: none; background: transparent; border: 1px solid #e2e8f0; border-radius: 8px; padding: 0.5rem; cursor: pointer; color: ${GOV_BLUE}; }
        
        .mobile-nav-drawer {
          position: fixed; top: 72px; left: 0; right: 0; 
          background: #fff; border-bottom: 1px solid #e2e8f0;
          padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem;
          z-index: 190; transform: translateY(-110%);
          transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 10px 20px rgba(0,0,0,0.05);
        }
        .mobile-nav-drawer.open { transform: translateY(0); }
        .mobile-nav-item { text-decoration: none; color: ${GOV_BLUE}; font-weight: 700; font-size: 1.1rem; padding: 0.5rem 0; border-bottom: 1px solid #f1f5f9; }
        
        @media (max-width: 960px) {
          .lp-nav-desktop { display: none; }
          .mobile-nav-toggle { display: flex; }
          .lp-logo-text { display: none; }
        }

        @media (max-width: 480px) {
          .section-heading { font-size: 1.75rem !important; }
          .lp-nav { height: 60px; }
          .mobile-nav-drawer { top: 60px; }
          .lp-logo-group img:not(:first-child) { display: none; }
        }

        /* ── Hero particles ── */
        @keyframes float1 { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-25px) rotate(8deg)} }
        @keyframes float2 { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-18px) rotate(-6deg)} }
        @keyframes float3 { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-30px) rotate(12deg)} }
        @keyframes shimmer { 0%{transform:translateX(-100%)} 100%{transform:translateX(100%)} }
        @keyframes pulse-ring { 0%{transform:scale(0.8);opacity:1} 100%{transform:scale(2.2);opacity:0} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes fadeSlideUp {
          from { opacity:0; transform:translateY(32px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes fadeSlideDown { from{opacity:0;transform:translateY(-16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes scaleIn { from{opacity:0;transform:scale(0.9)} to{opacity:1;transform:scale(1)} }
        @keyframes countUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes borderGlow {
          0%,100%{box-shadow:0 0 0 0 rgba(37,99,235,0)} 50%{box-shadow:0 0 0 6px rgba(37,99,235,0.15)}
        }

        .hero-particle {
          position:absolute; border-radius:50%; opacity:0.12; pointer-events:none;
        }
        .p1 { width:280px; height:280px; background:${ACCENT}; top:-80px; right:-60px; animation:float1 7s ease-in-out infinite; }
        .p2 { width:180px; height:180px; background:#60a5fa; bottom:-40px; left:5%; animation:float2 9s ease-in-out infinite 1s; }
        .p3 { width:120px; height:120px; background:#f59e0b; top:40%; right:12%; animation:float3 6s ease-in-out infinite 2s; }
        .p4 { width:60px; height:60px; background:#34d399; top:20%; left:15%; animation:float1 8s ease-in-out infinite 0.5s; }
        .p5 { width:90px; height:90px; background:#a78bfa; bottom:20%; right:25%; animation:float2 11s ease-in-out infinite 3s; }

        /* ── Shimmer button ── */
        .btn-primary {
          position:relative; overflow:hidden;
          background:linear-gradient(135deg,#2563eb,#1d4ed8);
          color:#fff; border:none; padding:0.9rem 2.2rem; border-radius:10px;
          font-weight:700; font-size:1rem; cursor:pointer;
          box-shadow:0 4px 14px rgba(37,99,235,0.4);
          transition:transform 0.2s, box-shadow 0.2s;
        }
        .btn-primary:hover { transform:translateY(-2px); box-shadow:0 8px 20px rgba(37,99,235,0.45); }
        .btn-primary:active { transform:translateY(0); }
        .btn-primary::after {
          content:''; position:absolute; top:0; left:-100%; width:60%; height:100%;
          background:linear-gradient(90deg,transparent,rgba(255,255,255,0.25),transparent);
          animation:shimmer 2.5s infinite;
        }
        .btn-glass {
          background:rgba(255,255,255,0.12); border:1px solid rgba(255,255,255,0.35);
          color:#fff; padding:0.9rem 2.2rem; border-radius:10px;
          font-weight:700; font-size:1rem; cursor:pointer;
          backdrop-filter:blur(10px);
          transition:all 0.25s;
        }
        .btn-glass:hover { background:rgba(255,255,255,0.22); transform:translateY(-2px); }

        /* ── Subsystem card ── */
        .sub-card {
          background:#fff; border-radius:16px;
          padding:2.5rem 1.75rem 2rem;
          box-shadow:0 2px 12px rgba(0,0,0,0.06);
          border:1px solid #e8edf5;
          display:flex; flex-direction:column; align-items:flex-start;
          cursor:default;
          transition:transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s;
          animation:borderGlow 3s ease-in-out infinite;
        }
        .sub-card:hover {
          transform:translateY(-8px) scale(1.02);
          box-shadow:0 20px 40px rgba(0,0,0,0.12);
        }
        .sub-card-icon {
          width:56px; height:56px; border-radius:14px;
          display:flex; align-items:center; justify-content:center;
          margin-bottom:1.25rem; flex-shrink:0;
          transition:transform 0.3s;
        }
        .sub-card:hover .sub-card-icon { transform:scale(1.15) rotate(-5deg); }

        /* ── Stats card ── */
        .stat-card {
          background:#fff; border-radius:16px; padding:2.2rem 1.75rem;
          box-shadow:0 2px 12px rgba(0,0,0,0.06); border:1px solid #e8edf5;
          text-align:center;
          transition:transform 0.3s, box-shadow 0.3s;
        }
        .stat-card:hover { transform:translateY(-6px); box-shadow:0 16px 32px rgba(0,0,0,0.1); }

        /* ── Barangay card ── */
        .brgy-card {
          background:#fff; border:1px solid #e8edf5; border-radius:12px;
          padding:1rem 1.25rem; display:flex; gap:0.9rem; align-items:center;
          transition:all 0.25s;
          box-shadow:0 1px 4px rgba(0,0,0,0.04);
        }
        .brgy-card:hover {
          border-color:${ACCENT}; transform:translateX(4px);
          box-shadow:0 4px 16px rgba(37,99,235,0.12);
        }

        /* ── Section heading ── */
        .section-tag {
          font-size:0.75rem; font-weight:800; letter-spacing:0.15em; text-transform:uppercase;
          color:${ACCENT}; margin-bottom:0.75rem; display:block;
        }
        .section-heading {
          font-size:2.25rem; font-weight:900; color:${GOV_BLUE};
          line-height:1.2; margin:0 0 1rem 0;
        }
        .section-subtext {
          font-size:1.05rem; color:#64748b; line-height:1.65; max-width:580px;
        }

        /* ── FAQ accordion ── */
        .faq-item {
          background:#fff; border:1px solid #e8edf5; border-radius:12px;
          margin-bottom:1rem; overflow:hidden;
          transition:box-shadow 0.25s;
        }
        .faq-item:hover { box-shadow:0 4px 16px rgba(0,0,0,0.07); }
        .faq-q {
          padding:1.25rem 1.5rem; font-weight:700; color:${GOV_BLUE};
          font-size:1rem; cursor:pointer; display:flex; justify-content:space-between;
          align-items:center; user-select:none;
          transition:background 0.2s;
        }
        .faq-q:hover { background:#f8fafc; }
        .faq-a {
          padding:0 1.5rem; max-height:0; overflow:hidden;
          color:#475569; font-size:0.95rem; line-height:1.7;
          transition:max-height 0.4s ease, padding 0.3s;
        }
        .faq-a.open { max-height:400px; padding:0 1.5rem 1.25rem; }

        /* ── Modal ── */
        .modal-overlay {
          position:fixed; inset:0; background:rgba(15,23,42,0.7);
          backdrop-filter:blur(8px); display:flex; align-items:center;
          justify-content:center; z-index:9999; padding:1rem;
          animation:fadeSlideDown 0.25s ease;
        }
        .modal-content {
          background:#ffffff; border-radius:16px; width:100%; max-width:490px;
          max-height:92vh; overflow-y:auto;
          box-shadow:0 32px 64px rgba(0,0,0,0.25); position:relative;
          animation:scaleIn 0.3s cubic-bezier(0.34,1.56,0.64,1);
        }
        .modal-content::-webkit-scrollbar { width:4px; }
        .modal-content::-webkit-scrollbar-thumb { background:#cbd5e1; border-radius:4px; }

        /* ── Scroll indicator ── */
        @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(6px)} }
        .scroll-ind { animation:bounce 1.8s ease-in-out infinite; }

        /* ── Divider gradient ── */
        .grad-divider { height:3px; background:linear-gradient(90deg,${GOV_BLUE},${ACCENT},${GOLD},${ACCENT},${GOV_BLUE}); }

        /* ── Footer ── */
        .lp-footer-link { color:#94a3b8; text-decoration:none; font-size:0.9rem; line-height:2.2; transition:color 0.2s; }
        .lp-footer-link:hover { color:#e2e8f0; }
      `}</style>

      {/* ── Auth Modal ── */}
      {authModal && (
        <div className="modal-overlay" onMouseDown={() => setAuthModal(null)}>
          <div className="modal-content" onMouseDown={e => e.stopPropagation()}>
            <button onClick={() => setAuthModal(null)} style={{
              position:'absolute', top:14, right:14, background:'#f1f5f9',
              border:'none', borderRadius:'50%', padding:7, cursor:'pointer',
              zIndex:10, display:'flex', transition:'background 0.2s',
            }} onMouseEnter={e => e.target.style.background='#e2e8f0'} onMouseLeave={e => e.target.style.background='#f1f5f9'}>
              <X size={17} color="#64748b" />
            </button>
            {authModal === 'login' ? <LoginForm onSwitch={() => setAuthModal('register')} /> : <RegisterForm onSwitch={() => setAuthModal('login')} />}
          </div>
        </div>
      )}

      {/* ── GOVPH Banner ── */}
      <div style={{ background:'linear-gradient(90deg,#0a3161,#1a5296)', padding:'0.45rem 0', fontSize:'0.73rem', color:'rgba(255,255,255,0.75)' }}>
        <div className="lp-container" style={{ display:'flex', alignItems:'center', gap:'0.6rem' }}>
          <img src="https://labforall.bagongpilipinas.ph/wp-content/uploads/2023/06/Bagong-Pilipinas-Logo-1966x2048.png" style={{ width:14, height:14, objectFit:'contain', opacity:0.9 }} alt="Gov" />
          <span className="hide-mobile">Official digital platform of the Local Government of Mamburao, Republic of the Philippines</span>
          <span className="show-mobile">Gov.ph · LGU Mamburao</span>
        </div>
      </div>

      {/* ── Header / Nav ── */}
      <header className={`lp-header ${scrolled ? 'scrolled' : ''}`}>
        <div className="lp-container lp-nav">
          <div className="lp-logo-group" style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
            <img src="/logo-crps.png" alt="CRPS" style={{ width:40, height:40, objectFit:'contain' }} />
            <img src="https://gimgs2.nohat.cc/thumb/f/640/barangay-3-balansay-mamburao-municipal-gymnasium-logo-appraisals-pennant--5281772497534976.jpg" alt="Mamburao" style={{ width:38, height:38, borderRadius:'50%', objectFit:'cover', border:'2px solid #e2e8f0' }} />
            <img src="https://labforall.bagongpilipinas.ph/wp-content/uploads/2023/06/Bagong-Pilipinas-Logo-1966x2048.png" alt="Bagong Pilipinas" style={{ width:40, height:40, objectFit:'contain' }} />
            <div className="lp-logo-text">
              <div style={{ fontWeight:900, fontSize:'1.1rem', color:GOV_BLUE, lineHeight:1.2, letterSpacing:'-0.01em' }}>
                CRPS — Mamburao
              </div>
              <div style={{ fontSize:'0.7rem', color:'#64748b', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em' }}>
                DILG · Occ. Mindoro
              </div>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="lp-nav-desktop">
            {['home','subsystems','about','barangays','faq'].map(id => (
              <a key={id} href={`#${id}`} className="lp-nav-link">
                {id === 'home' ? 'Home' : id === 'subsystems' ? 'Modules' : id === 'about' ? 'Background' : id === 'barangays' ? 'Coverage' : 'FAQs'}
              </a>
            ))}
            <button onClick={() => setAuthModal('login')} style={{
              marginLeft:'0.75rem', background:`linear-gradient(135deg,${GOV_BLUE},${GOV_LIGHT})`,
              color:'#fff', border:'none', padding:'0.55rem 1.35rem', borderRadius:8,
              fontWeight:700, cursor:'pointer', fontSize:'0.88rem',
              boxShadow:'0 3px 10px rgba(10,49,97,0.3)', transition:'all 0.2s',
            }} onMouseEnter={e => e.currentTarget.style.transform='translateY(-1px)'} onMouseLeave={e => e.currentTarget.style.transform='translateY(0)'}>
              Portal Access
            </button>
          </nav>

          {/* Mobile Toggle */}
          <button className="mobile-nav-toggle" onClick={() => setMobileNavOpen(!mobileNavOpen)}>
            {mobileNavOpen ? <X size={22} /> : <LogIn size={22} />}
          </button>
        </div>

        {/* Mobile Nav Drawer */}
        <div className={`mobile-nav-drawer ${mobileNavOpen ? 'open' : ''}`}>
          {['home','subsystems','about','barangays','faq'].map(id => (
            <a key={id} href={`#${id}`} className="mobile-nav-item" onClick={closeNav}>
              {id === 'home' ? '🏠 Home' : id === 'subsystems' ? '🛠️ Systems' : id === 'about' ? 'ℹ️ Background' : id === 'barangays' ? '📍 Coverage' : '❓ FAQs'}
            </a>
          ))}
          {isInstallable && !isInstalled && (
            <button onClick={() => { closeNav(); installApp(); }} style={{
              background:`linear-gradient(135deg,#10b981,#059669)`,
              color:'#fff', border:'none', padding:'0.85rem', borderRadius:10,
              fontWeight:700, cursor:'pointer', fontSize:'1rem', marginTop: '0.5rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
            }}>
              <Download size={20} /> Install Mobile App
            </button>
          )}
          <button onClick={() => { closeNav(); setAuthModal('login'); }} style={{
            background:`linear-gradient(135deg,${GOV_BLUE},${GOV_LIGHT})`,
            color:'#fff', border:'none', padding:'0.85rem', borderRadius:10,
            fontWeight:700, cursor:'pointer', fontSize:'1rem', marginTop: '0.5rem'
          }}>
            Sign In to Portal Access
          </button>
        </div>
      </header>

      {/* ══════════════════════ HERO ══════════════════════ */}
      <section id="home" style={{
        backgroundImage: `url('https://i.ytimg.com/vi/oDFXnl_3vW8/maxresdefault.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        color:'#ffffff', padding:'7rem 0 6rem', position:'relative', overflow:'hidden', minHeight:'92vh',
        display:'flex', alignItems:'center',
      }}>
        {/* Particles */}
        <div className="hero-particle p1" />
        <div className="hero-particle p2" />
        <div className="hero-particle p3" />
        <div className="hero-particle p4" />
        <div className="hero-particle p5" />

        {/* Dark overlay for readability over the photo */}
        <div style={{
          position:'absolute', inset:0,
          background: 'linear-gradient(150deg, rgba(6,15,46,0.82) 0%, rgba(10,32,87,0.78) 50%, rgba(13,59,138,0.7) 100%)',
        }}/>
        {/* Grid overlay */}
        <div style={{
          position:'absolute', inset:0, opacity:0.04,
          backgroundImage:'linear-gradient(rgba(255,255,255,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.5) 1px,transparent 1px)',
          backgroundSize:'60px 60px',
        }}/>

        <div className="lp-container" style={{ position:'relative', zIndex:2, textAlign:'center', maxWidth:860, margin:'0 auto' }}>

          {/* Badge */}
          <div style={{
            display:'inline-flex', alignItems:'center', gap:'0.5rem',
            background:'rgba(37,99,235,0.25)', border:'1px solid rgba(96,165,250,0.35)',
            borderRadius:100, padding:'0.4rem 1.1rem', marginBottom:'2rem',
            backdropFilter:'blur(8px)',
            opacity: heroVisible ? 1 : 0,
            transform: heroVisible ? 'translateY(0)' : 'translateY(-16px)',
            transition:'all 0.7s ease 0.1s',
          }}>
            <Sparkles size={13} color="#93c5fd" />
            <span style={{ fontSize:'0.78rem', fontWeight:700, color:'#93c5fd', letterSpacing:'0.06em', textTransform:'uppercase' }}>
              Powered by NVIDIA Llama 3.3 · Offline-First · Blockchain-Secured
            </span>
          </div>

          {/* Heading */}
          <h1 style={{
            fontSize:'3.6rem', fontWeight:900, lineHeight:1.1, marginBottom:'1.5rem',
            letterSpacing:'-0.02em',
            opacity: heroVisible ? 1 : 0,
            transform: heroVisible ? 'translateY(0)' : 'translateY(28px)',
            transition:'all 0.8s ease 0.25s',
          }}>
            <span style={{ display:'block', color:'#e2e8f0' }}>Centralized Residents</span>
            <span style={{
              display:'block',
              background:'linear-gradient(90deg,#60a5fa,#93c5fd,#a5b4fc)',
              WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
            }}>Profiling System</span>
          </h1>

          {/* Sub */}
          <p style={{
            fontSize:'1.15rem', color:'#94a3b8', lineHeight:1.75,
            marginBottom:'3rem', maxWidth:680, margin:'0 auto 3rem',
            opacity: heroVisible ? 1 : 0,
            transform: heroVisible ? 'translateY(0)' : 'translateY(20px)',
            transition:'all 0.8s ease 0.4s',
          }}>
            A <strong style={{ color:'#60a5fa' }}>next-generation digital platform</strong> unifying governance,
            service delivery, and AI-driven analytics for the <strong style={{ color:'#fff' }}>15 barangays of Mamburao</strong>.
            Fully operational even without internet.
          </p>

          {/* CTA Buttons */}
          <div style={{
            display:'flex', gap:'1rem', justifyContent:'center', flexWrap:'wrap',
            opacity: heroVisible ? 1 : 0,
            transform: heroVisible ? 'translateY(0)' : 'translateY(16px)',
            transition:'all 0.8s ease 0.55s',
          }}>
            <button onClick={() => setAuthModal('register')} className="btn-primary" style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
              <UserPlus size={18} /> Register LGU Branch
            </button>
            <button onClick={() => setAuthModal('login')} className="btn-glass" style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
              <LogIn size={18} /> Sign In to Portal
            </button>
            {isInstallable && !isInstalled && (
              <button onClick={installApp} className="btn-primary" style={{ display:'flex', alignItems:'center', gap:'0.5rem', background: 'linear-gradient(135deg,#10b981,#059669)', border: 'none' }}>
                <Download size={18} /> Install App
              </button>
            )}
          </div>

          {/* Trust badges */}
          <div style={{
            display:'flex', gap:'2rem', justifyContent:'center', marginTop:'4rem',
            flexWrap:'wrap',
            opacity: heroVisible ? 1 : 0, transition:'all 0.8s ease 0.7s',
          }}>
            {[
              { icon: Shield,     label: 'DILG Compliant' },
              { icon: Database,   label: 'LocalStorage + Firebase' },
              { icon: Link2,      label: 'SHA-256 Blockchain' },
              { icon: BrainCircuit, label: 'NVIDIA Llama AI' },
            ].map((b, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:'0.4rem', color:'rgba(255,255,255,0.45)', fontSize:'0.8rem', fontWeight:600 }}>
                <b.icon size={14} /> {b.label}
              </div>
            ))}
          </div>

          {/* Scroll indicator */}
          <div className="scroll-ind" style={{ marginTop:'3.5rem', color:'rgba(255,255,255,0.3)', opacity: heroVisible ? 1 : 0, transition:'opacity 1s ease 1s' }}>
            <ChevronDown size={28} />
          </div>
        </div>
      </section>

      <div className="grad-divider" />

      {/* ══════════════════════ STATS STRIP ══════════════════════ */}
      <StatsStrip />

      <div className="grad-divider" />

      {/* ══════════════════════ SUBSYSTEMS ══════════════════════ */}
      <section id="subsystems" style={{ padding:'6rem 0', background:'#f8fafc' }}>
        <div className="lp-container">
          <AnimatedCard>
            <div style={{ textAlign:'center', marginBottom:'3.5rem' }}>
              <span className="section-tag">Core Modules</span>
              <h2 className="section-heading" style={{ margin:'0 auto 1rem', textAlign:'center' }}>CRPS Subsystems & Capabilities</h2>
              <p className="section-subtext" style={{ margin:'0 auto', textAlign:'center' }}>
                Nine advanced modules engineered to eliminate delays, overcome internet limitations,
                and guarantee data integrity in every barangay transaction.
              </p>
            </div>
          </AnimatedCard>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:'1.5rem' }}>
            {SUBSYSTEMS.map((s, idx) => {
              const Icon = s.icon;
              return (
                <AnimatedCard key={idx} delay={idx * 60}>
                  <div className="sub-card">
                    <div className="sub-card-icon" style={{ background:s.bg }}>
                      <Icon size={26} color={s.color} strokeWidth={1.8} />
                    </div>
                    <h3 style={{ color:'#0f172a', fontSize:'1.05rem', margin:'0 0 0.6rem', fontWeight:800 }}>{s.title}</h3>
                    <p style={{ color:'#64748b', margin:'0 0 1.5rem', fontSize:'0.9rem', lineHeight:1.65, flex:1 }}>{s.desc}</p>
                    <button style={{
                      background:'transparent', border:`1.5px solid ${s.color}33`,
                      color:s.color, padding:'0.5rem 1.1rem', borderRadius:8,
                      fontWeight:700, fontSize:'0.78rem', cursor:'pointer',
                      display:'flex', alignItems:'center', gap:'0.35rem',
                      transition:'all 0.2s',
                    }} onMouseEnter={e => { e.currentTarget.style.background = s.bg; }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                      Learn More <ArrowRight size={13} />
                    </button>
                  </div>
                </AnimatedCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════ ABOUT ══════════════════════ */}
      <section id="about" style={{ padding:'6rem 0', background:'#ffffff' }}>
        <div className="lp-container">
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'4rem', alignItems:'center' }}>
            <AnimatedCard>
              <span className="section-tag">Our Story</span>
              <h2 className="section-heading">Background & Implementation</h2>
              <p style={{ color:'#475569', fontSize:'1.05rem', lineHeight:1.75, marginBottom:'1.25rem' }}>
                In alignment with the national directive for digital transformation, LGUSS was conceptualized to
                resolve the growing challenges faced by local governments in Mamburao — particularly
                <strong> poor internet stability</strong> and limited technical resources.
              </p>
              <p style={{ color:'#475569', fontSize:'1.05rem', lineHeight:1.75, marginBottom:'2rem' }}>
                Traditional manual logbooks result in processing delays and data integrity failures.
                By adopting an offline-capable digital solution reinforced by
                <strong> Blockchain audit trails</strong> and <strong>NVIDIA Llama AI</strong>, we ensure
                uninterrupted public service and fully transparent governance.
              </p>
              <div style={{ display:'flex', gap:'1rem', flexWrap:'wrap' }}>
                {[
                  { label:'Offline-First', color:'#3b82f6' },
                  { label:'DILG Standard', color:'#10b981' },
                  { label:'AI-Powered',    color:'#8b5cf6' },
                  { label:'Open Source',   color:GOLD },
                ].map((tag, i) => (
                  <span key={i} style={{
                    background:`${tag.color}14`, border:`1px solid ${tag.color}33`,
                    color:tag.color, padding:'0.35rem 0.85rem', borderRadius:100,
                    fontSize:'0.78rem', fontWeight:700,
                  }}>{tag.label}</span>
                ))}
              </div>
            </AnimatedCard>

            <AnimatedCard delay={150} style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
              {[
                { label:'Barangays Unified Under One System', value:'15 Brgy.', icon:Map, color:'#3b82f6', bg:'#eff6ff' },
                { label:'Guaranteed System Uptime via PouchDB', value:'100%', icon:Wifi, color:'#10b981', bg:'#ecfdf5' },
                { label:'Local AI Pattern Detection via NVIDIA NIM', value:'LLaMA 3.3', icon:BrainCircuit, color:'#8b5cf6', bg:'#f5f3ff' },
                { label:'Blockchain Audit Trail per Transaction', value:'SHA-256', icon:Shield, color:GOV_BLUE, bg:'#eff6ff' },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} style={{
                    display:'flex', alignItems:'center', gap:'1.25rem',
                    background:'#f8fafc', border:'1px solid #e8edf5', borderRadius:14,
                    padding:'1.25rem 1.5rem', transition:'all 0.25s',
                    cursor:'default',
                  }} onMouseEnter={e => { e.currentTarget.style.borderColor = item.color+'66'; e.currentTarget.style.background = item.bg; }} onMouseLeave={e => { e.currentTarget.style.borderColor = '#e8edf5'; e.currentTarget.style.background = '#f8fafc'; }}>
                    <div style={{ width:48, height:48, background:item.bg, border:`1px solid ${item.color}33`, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <Icon size={22} color={item.color} />
                    </div>
                    <div style={{ flex:1, fontSize:'0.9rem', color:'#475569', lineHeight:1.4 }}>{item.label}</div>
                    <div style={{ fontWeight:900, fontSize:'1rem', color:item.color, whiteSpace:'nowrap' }}>{item.value}</div>
                  </div>
                );
              })}
            </AnimatedCard>
          </div>
        </div>
      </section>

      {/* ══════════════════════ BARANGAYS ══════════════════════ */}
      <section id="barangays" style={{ padding:'6rem 0', background:'#f8fafc' }}>
        <div className="lp-container">
          <AnimatedCard>
            <div style={{ textAlign:'center', marginBottom:'3.5rem' }}>
              <span className="section-tag">Coverage Area</span>
              <h2 className="section-heading" style={{ textAlign:'center', margin:'0 auto 1rem' }}>Mamburao Municipal Coverage</h2>
              <p className="section-subtext" style={{ textAlign:'center', margin:'0 auto' }}>
                Unifying operations across all 15 constituent barangays of Mamburao, Occidental Mindoro.
                Our digital infrastructure ensures every resident is accounted for, even in the most remote areas.
              </p>
            </div>
          </AnimatedCard>

          {/* Map Display Card */}
          <AnimatedCard delay={100}>
            <div style={{ 
              background: '#fff', 
              borderRadius: 24, 
              padding: '1.5rem', 
              boxShadow: '0 20px 50px rgba(10,49,97,0.12)', 
              border: '1px solid #e8edf5',
              marginBottom: '3.5rem',
              overflow: 'hidden'
            }}>
              <div style={{ 
                borderRadius: 16, 
                overflow: 'hidden', 
                border: '1px solid #f1f5f9',
                background: '#f8fafc',
                position: 'relative',
                display: 'flex',
                justifyContent: 'center'
              }}>
                <img 
                  src="/mamburao_map.png"
                  onError={e => { e.currentTarget.src = 'https://i.ytimg.com/vi/oDFXnl_3vW8/maxresdefault.jpg'; }}
                  alt="Mamburao Municipal Map - showing all 15 barangays" 
                  style={{ 
                    width: '100%', 
                    maxHeight: '600px', 
                    objectFit: 'contain',
                    display: 'block',
                    transition: 'transform 0.5s ease'
                  }} 
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                />
                <div style={{ 
                  position: 'absolute', 
                  bottom: '1rem', 
                  right: '1rem', 
                  background: 'rgba(255,255,255,0.85)', 
                  backdropFilter: 'blur(8px)',
                  padding: '0.4rem 0.8rem',
                  borderRadius: 8,
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  color: '#475569',
                  border: '1px solid rgba(0,0,0,0.05)'
                }}>
                  📍 OFFICIAL MUNICIPAL GEOLOCATION
                </div>
              </div>
            </div>
          </AnimatedCard>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:'1rem' }}>
            {BARANGAYS.map((b, i) => (
              <AnimatedCard key={b.id} delay={i * 40 + 200}>
                <div className="brgy-card">
                  <div style={{
                    width:40, height:40, borderRadius:'50%', background:'#eff6ff',
                    border:'1.5px solid #bfdbfe', display:'flex', alignItems:'center',
                    justifyContent:'center', flexShrink:0, overflow:'hidden',
                  }}>
                    <img src="https://gimgs2.nohat.cc/thumb/f/640/barangay-3-balansay-mamburao-municipal-gymnasium-logo-appraisals-pennant--5281772497534976.jpg" style={{ width:'100%', height:'100%', objectFit:'cover' }} alt="" />
                  </div>
                  <div>
                    <div style={{ fontWeight:700, fontSize:'0.9rem', color:GOV_BLUE }}>Brgy. {b.name}</div>
                    <div style={{ fontSize:'0.72rem', color:'#94a3b8', marginTop:'0.15rem' }}>#{String(i + 1).padStart(2,'0')} · Mamburao, Occ. Mindoro</div>
                  </div>
                </div>
              </AnimatedCard>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════ FAQs ══════════════════════ */}
      <section id="faq" style={{ padding:'6rem 0', background:'#ffffff' }}>
        <div className="lp-container" style={{ maxWidth:780 }}>
          <AnimatedCard>
            <div style={{ textAlign:'center', marginBottom:'3.5rem' }}>
              <span className="section-tag">Support</span>
              <h2 className="section-heading" style={{ textAlign:'center', margin:'0 auto 1rem' }}>Frequently Asked Questions</h2>
            </div>
          </AnimatedCard>
          <FAQSection />
        </div>
      </section>

      {/* ══════════════════════ FOOTER ══════════════════════ */}
      <footer style={{ background:`linear-gradient(135deg,#060f2e,#0a2057)`, color:'#fff', padding:'4rem 0 0' }}>
        <div className="lp-container" style={{ display:'grid', gridTemplateColumns:'minmax(260px,2.2fr) 1fr 1fr', gap:'3rem', paddingBottom:'3rem' }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:'0.9rem', marginBottom:'1.5rem' }}>
              <img src="https://toppng.com/uploads/preview/dilg-logo-11550728661mdmkpc6xag.png" style={{ width:52, height:52, objectFit:'contain' }} alt="DILG Logo" />
              <img src="https://tse4.mm.bing.net/th/id/OIP.a8wSKZPLNVtv2S4T7340WQHaHk?rs=1&pid=ImgDetMain&o=7&rm=3" style={{ width:52, height:52, objectFit:'contain', borderRadius:'50%', border:'2px solid rgba(255,255,255,0.15)' }} alt="Mamburao LGU Seal" />
              <div>
                <div style={{ fontWeight:900, fontSize:'1rem', color:'#e2e8f0' }}>Republic of the Philippines</div>
                <div style={{ fontSize:'0.78rem', color:'#64748b', marginTop:2 }}>LGU Mamburao, Occidental Mindoro</div>
              </div>
            </div>
            <p style={{ fontSize:'0.88rem', color:'#64748b', lineHeight:1.7, marginBottom:'1.5rem' }}>
              Spearheaded by DILG's ISTMS, designed to enhance local governance through unified, AI-powered digital systems.
            </p>
            <div style={{ display:'flex', gap:'0.5rem' }}>
              <div style={{ background:'rgba(37,99,235,0.2)', border:'1px solid rgba(96,165,250,0.25)', borderRadius:8, padding:'0.4rem 0.8rem', fontSize:'0.72rem', fontWeight:700, color:'#60a5fa' }}>
                🤖 NVIDIA Llama 3.3
              </div>
              <div style={{ background:'rgba(16,185,129,0.2)', border:'1px solid rgba(52,211,153,0.25)', borderRadius:8, padding:'0.4rem 0.8rem', fontSize:'0.72rem', fontWeight:700, color:'#34d399' }}>
                📡 Offline-First
              </div>
            </div>
          </div>

          <div>
            <h4 style={{ color:'#e2e8f0', marginBottom:'1.25rem', fontSize:'0.95rem', fontWeight:800, textTransform:'uppercase', letterSpacing:'0.08em' }}>About GOVPH</h4>
            <ul style={{ listStyle:'none', padding:0, margin:0 }}>
              {[['http://www.gov.ph','Official Gazette'],['http://data.gov.ph','Open Data Portal'],['http://www.gov.ph/feedback/idulog/','Send Feedback']].map(([href, label]) => (
                <li key={label}><a href={href} className="lp-footer-link">{label}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 style={{ color:'#e2e8f0', marginBottom:'1.25rem', fontSize:'0.95rem', fontWeight:800, textTransform:'uppercase', letterSpacing:'0.08em' }}>Gov't Links</h4>
            <ul style={{ listStyle:'none', padding:0, margin:0 }}>
              {[['http://president.gov.ph','Office of the President'],['http://senate.gov.ph/','Senate of the Philippines'],['http://www.congress.gov.ph/','House of Representatives'],['http://sc.judiciary.gov.ph/','Supreme Court']].map(([href, label]) => (
                <li key={label}><a href={href} className="lp-footer-link">{label}</a></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="grad-divider" />
        <div style={{ textAlign:'center', padding:'1.25rem', fontSize:'0.82rem', color:'#475569' }}>
          <div style={{ marginBottom: '0.4rem' }}>
            © 2024 Centralized Residents Profiling System (CRPS) · Local Government of Mamburao, Occ. Mindoro
          </div>
          <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>
            System developed by <strong style={{ color: '#94a3b8' }}>Arvin Dela Rosa Marasigan</strong> (Full Stack Developer). 
            Frontend by <strong style={{ color: '#94a3b8' }}>Hannah Alfaro</strong> and <strong style={{ color: '#94a3b8' }}>Lanibel Cabrera</strong>.
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ─── Stats Strip (animated counters) ─── */
function StatsStrip() {
  const [ref, inView] = useInView(0.2);
  return (
    <section ref={ref} style={{ padding:'4rem 0', background:'#ffffff' }}>
      <div className="lp-container">
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'1.5rem' }}>
          {STATS.map((s, i) => {
            const Icon = s.icon;
            const count = useCountUp(s.value, 1600, inView);
            return (
              <div key={i} className="stat-card">
                <div style={{ width:52, height:52, borderRadius:14, background:`${s.color}14`, border:`1px solid ${s.color}22`, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1rem' }}>
                  <Icon size={24} color={s.color} />
                </div>
                <div style={{ fontSize:'2.8rem', fontWeight:900, color:GOV_BLUE, lineHeight:1, fontVariantNumeric:'tabular-nums' }}>
                  {count}{s.suffix}
                </div>
                <div style={{ fontSize:'0.88rem', color:'#64748b', fontWeight:600, marginTop:'0.5rem' }}>{s.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── FAQ accordion ─── */
const FAQS = [
  {
    q: 'How does the Offline-First architecture actually work?',
    a: 'The system stores all records locally on the user\'s device using IndexedDB (via PouchDB). Barangay secretaries can add residents, file cases, and issue certificates even if the network is unplugged. Once internet is detected, it automatically replicates local data to the central CouchDB cloud securely.'
  },
  {
    q: 'How reliable is the data security of this LGUSS?',
    a: 'We implemented Role-Based Access Control (RBAC) ensuring secretaries only access their own barangay\'s records. Furthermore, every transaction generates a cryptographic SHA-256 hash. If any record is tampered directly in the database, hash validation fails instantly, alerting the Admin of potential fraud.'
  },
  {
    q: 'Does this system use real AI?',
    a: 'Yes. Aside from a Rule-Based DSS that flags offenders during certificate issuance, the system now integrates the NVIDIA NIM API (meta/llama-3.3-70b-instruct) — a state-of-the-art large language model that analyzes barangay case patterns and generates real-time governance recommendations.'
  },
  {
    q: 'Can the AI analytics work without the internet?',
    a: 'The local risk-scoring and repeat offender detection are fully offline. The NVIDIA Llama AI feature requires an internet connection to call the NVIDIA NIM API, but the system gracefully falls back to local analysis when offline.'
  },
];

function FAQSection() {
  const [open, setOpen] = useState(null);
  return (
    <div>
      {FAQS.map((faq, i) => (
        <AnimatedCard key={i} delay={i * 80}>
          <div className="faq-item">
            <div className="faq-q" onClick={() => setOpen(open === i ? null : i)}>
              <span>{faq.q}</span>
              <div style={{ transform: open === i ? 'rotate(180deg)' : 'rotate(0)', transition:'transform 0.3s', flexShrink:0, marginLeft:'1rem', color: ACCENT }}>
                <ChevronDown size={18} />
              </div>
            </div>
            <div className={`faq-a ${open === i ? 'open' : ''}`}>{faq.a}</div>
          </div>
        </AnimatedCard>
      ))}
    </div>
  );
}

/* ─── Login Form ─── */
function LoginForm({ onSwitch }) {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form, setForm]         = useState({ email:'', password:'', remember:false });
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [showPwd, setShowPwd]   = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [lockout, setLockout]   = useState(false);
  const [countdown, setCountdown] = useState(0);

  const startLockoutTimer = () => {
    setLockout(true); let secs = 900; setCountdown(secs);
    const t = setInterval(() => { secs--; setCountdown(secs); if (secs <= 0) { clearInterval(t); setLockout(false); setAttempts(0); } }, 1000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (lockout) return;
    setError(''); setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      const n = attempts + 1; setAttempts(n);
      if (n >= 5 || err.response?.status === 429) { 
        startLockoutTimer(); 
        setError('Security Lockout (DILG Standard): Too many attempts. Please wait 15 minutes or use Offline Demo Access.'); 
      }
      else if (!err.response) setError('Server connection lost or waking up. You can continue using Offline Mode / Demo Access for now.');
      else setError((err.response?.data?.error || 'Invalid credentials') + `. ${5 - n} security attempt(s) remaining.`);
    } finally { setLoading(false); }
  };

  const fmt = (s) => `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`;
  const demos = [{ role:'Admin', email:'admin@barangay.gov.ph' },{ role:'Secretary', email:'sec@barangay.gov.ph' }];

  return (
    <div style={{ padding:'2.25rem' }}>
      {/* Modal Header with Logos */}
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', marginBottom:'1.75rem', paddingBottom:'1.5rem', borderBottom:'2px solid #f1f5f9', textAlign:'center' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'0.75rem', marginBottom:'0.85rem' }}>
          <img src="https://toppng.com/uploads/preview/dilg-logo-11550728661mdmkpc6xag.png" alt="DILG" style={{ width:48, height:48, objectFit:'contain' }} />
          <div style={{ width:1, height:40, background:'#e2e8f0' }} />
          <img src="https://gimgs2.nohat.cc/thumb/f/640/barangay-3-balansay-mamburao-municipal-gymnasium-logo-appraisals-pennant--5281772497534976.jpg" alt="Mamburao" style={{ width:46, height:46, borderRadius:'50%', objectFit:'cover', border:'2px solid #e2e8f0' }} />
          <div style={{ width:1, height:40, background:'#e2e8f0' }} />
          <img src="https://labforall.bagongpilipinas.ph/wp-content/uploads/2023/06/Bagong-Pilipinas-Logo-1966x2048.png" alt="Bagong Pilipinas" style={{ width:44, height:44, objectFit:'contain' }} />
        </div>
        <h2 style={{ fontWeight:900, fontSize:'1.25rem', color:GOV_BLUE, margin:'0 0 0.25rem' }}>LGUSS Portal Sign In</h2>
        <div style={{ fontSize:'0.75rem', color:'#94a3b8', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em' }}>DILG Extension · Mamburao, Occ. Mindoro</div>
      </div>

      {lockout && <div style={{ background:'#fef2f2', borderLeft:'4px solid #ef4444', padding:'0.75rem 1rem', marginBottom:'1rem', color:'#b91c1c', fontSize:'0.85rem', borderRadius:8 }}><strong>Locked Out:</strong> Try again in {fmt(countdown)}.</div>}
      {error && !lockout && <div style={{ background:'#fef2f2', borderLeft:'4px solid #ef4444', padding:'0.75rem 1rem', marginBottom:'1rem', color:'#b91c1c', fontSize:'0.85rem', borderRadius:8 }}>{error}</div>}

      <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
        <div>
          <label style={labelStyle}>Official Email Address</label>
          <input type="email" required placeholder="you@barangay.gov.ph" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Password Key</label>
          <div style={{ position:'relative' }}>
            <input type={showPwd ? 'text' : 'password'} required placeholder="••••••••" style={inputStyle} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
            <button type="button" onClick={() => setShowPwd(!showPwd)} style={eyeBtnStyle}>{showPwd ? <EyeOff size={15}/> : <Eye size={15}/>}</button>
          </div>
        </div>
        <button type="submit" disabled={loading || lockout} style={submitBtnStyle}>
          {loading ? <><span style={spinnerStyle} /> Authenticating...</> : <><LogIn size={17}/> Sign In</>}
        </button>
      </form>


      <div style={{ textAlign:'center', marginTop:'1rem', fontSize:'0.85rem', color:'#94a3b8' }}>
        Unregistered LGU branch?{' '}<button type="button" onClick={onSwitch} style={{ border:'none', background:'none', color:GOV_BLUE, fontWeight:700, cursor:'pointer' }}>Register</button>
      </div>
    </div>
  );
}

/* ─── Register Form ─── */
function RegisterForm({ onSwitch }) {
  const { register } = useAuth();
  const [form, setForm]           = useState({ firstName:'', lastName:'', email:'', password:'', confirmPassword:'', barangay:'', role:'Secretary', privacyAgreed:false });
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [showPwd, setShowPwd]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [success, setSuccess]     = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return setError('Passwords do not match.');
    if (getStrength(form.password) < 3) return setError('Password too weak. Use 8+ chars with uppercase & numbers.');
    if (!form.privacyAgreed) return setError('You must agree to the Data Privacy Act.');
    setError(''); setLoading(true);
    try {
      await register({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        barangay: form.barangay,
        role: form.role
      });
      setSuccess(true);
      setTimeout(() => onSwitch(), 3000);
    } catch (err) { 
        if (!err.response) setError('Server unreachable. Please check your internet or retry when online.');
        else setError(err.response?.data?.error || 'Registration failed.'); 
    }
    finally { setLoading(false); }
  };

  if (success) return (
    <div style={{ padding:'3.5rem 2rem', textAlign:'center' }}>
      <CheckCircle2 size={52} color="#10b981" style={{ margin:'0 auto 1.5rem', display:'block' }} />
      <h2 style={{ fontWeight:900, fontSize:'1.4rem', color:'#10b981', marginBottom:'0.5rem' }}>Registration Successful!</h2>
      <p style={{ color:'#64748b', fontSize:'0.95rem' }}>Your official account was created. Redirecting to sign in...</p>
    </div>
  );

  return (
    <div style={{ padding:'2.25rem' }}>
      {/* Modal Header with Logos */}
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', marginBottom:'1.75rem', paddingBottom:'1.5rem', borderBottom:'2px solid #f1f5f9', textAlign:'center' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'0.75rem', marginBottom:'0.85rem' }}>
          <img src="https://toppng.com/uploads/preview/dilg-logo-11550728661mdmkpc6xag.png" alt="DILG" style={{ width:48, height:48, objectFit:'contain' }} />
          <div style={{ width:1, height:40, background:'#e2e8f0' }} />
          <img src="https://gimgs2.nohat.cc/thumb/f/640/barangay-3-balansay-mamburao-municipal-gymnasium-logo-appraisals-pennant--5281772497534976.jpg" alt="Mamburao" style={{ width:46, height:46, borderRadius:'50%', objectFit:'cover', border:'2px solid #e2e8f0' }} />
          <div style={{ width:1, height:40, background:'#e2e8f0' }} />
          <img src="https://labforall.bagongpilipinas.ph/wp-content/uploads/2023/06/Bagong-Pilipinas-Logo-1966x2048.png" alt="Bagong Pilipinas" style={{ width:44, height:44, objectFit:'contain' }} />
        </div>
        <h2 style={{ fontWeight:900, fontSize:'1.25rem', color:GOV_BLUE, margin:'0 0 0.25rem' }}>LGU Official Registration</h2>
        <div style={{ fontSize:'0.75rem', color:'#94a3b8', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em' }}>DILG Extension · Mamburao, Occ. Mindoro</div>
      </div>

      {error && <div style={{ background:'#fef2f2', borderLeft:'4px solid #ef4444', padding:'0.75rem 1rem', marginBottom:'1rem', color:'#b91c1c', fontSize:'0.85rem', borderRadius:8 }}>{error}</div>}

      <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
        <div style={{ display:'flex', gap:'0.75rem' }}>
          <div style={{ flex:1 }}><label style={labelStyle}>First Name</label><input required placeholder="Juan" value={form.firstName} onChange={e=>setForm({...form, firstName:e.target.value})} style={inputStyle} /></div>
          <div style={{ flex:1 }}><label style={labelStyle}>Last Name</label><input required placeholder="Dela Cruz" value={form.lastName} onChange={e=>setForm({...form, lastName:e.target.value})} style={inputStyle} /></div>
        </div>
        <div style={{ display:'flex', gap:'0.75rem' }}>
          <div style={{ flex:2 }}>
            <label style={labelStyle}>Barangay</label>
            <select required value={form.barangay} onChange={e=>setForm({...form, barangay:e.target.value})} style={inputStyle}>
              <option value="">Select barangay...</option>
              {BARANGAYS.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
            </select>
          </div>
          <div style={{ flex:1 }}>
            <label style={labelStyle}>Role</label>
            <select value={form.role} onChange={e=>setForm({...form, role:e.target.value})} style={inputStyle}>
              {['Admin','Secretary'].map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label style={labelStyle}>Official Email</label>
          <input type="email" required placeholder="name@barangay.gov.ph" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} style={inputStyle} />
        </div>
        <div style={{ display:'flex', gap:'0.75rem' }}>
          <div style={{ flex:1 }}>
            <label style={labelStyle}>Password</label>
            <div style={{ position:'relative' }}>
              <input type={showPwd?'text':'password'} required value={form.password} onChange={e=>setForm({...form, password:e.target.value})} style={inputStyle} placeholder="8+ chars" />
              <button type="button" onClick={()=>setShowPwd(!showPwd)} style={eyeBtnStyle}>{showPwd?<EyeOff size={15}/>:<Eye size={15}/>}</button>
            </div>
          </div>
          <div style={{ flex:1 }}>
            <label style={labelStyle}>Confirm</label>
            <div style={{ position:'relative' }}>
              <input type={showConfirm?'text':'password'} required value={form.confirmPassword} onChange={e=>setForm({...form, confirmPassword:e.target.value})} style={inputStyle} placeholder="Re-enter" />
              <button type="button" onClick={()=>setShowConfirm(!showConfirm)} style={eyeBtnStyle}>{showConfirm?<EyeOff size={15}/>:<Eye size={15}/>}</button>
            </div>
          </div>
        </div>
        {form.password && (
          <div>
            <div style={{ height:4, borderRadius:4, background:'#f1f5f9', overflow:'hidden' }}>
              <div style={{ height:'100%', width:`${(getStrength(form.password)/4)*100}%`, background:['#ef4444','#f59e0b','#f59e0b','#10b981','#10b981'][getStrength(form.password)], transition:'width 0.3s' }} />
            </div>
            <div style={{ fontSize:'0.72rem', color:'#94a3b8', marginTop:'0.25rem' }}>{['','Weak','Fair','Good','Strong'][getStrength(form.password)]} password</div>
          </div>
        )}
        <label style={{ display:'flex', gap:'0.5rem', alignItems:'flex-start', cursor:'pointer' }}>
          <input type="checkbox" required checked={form.privacyAgreed} onChange={e=>setForm({...form, privacyAgreed:e.target.checked})} style={{ marginTop:3 }} />
          <span style={{ fontSize:'0.78rem', color:'#64748b', lineHeight:1.5 }}>I agree to the <strong>Data Privacy Act of 2012</strong> and consent to the processing of my official data.</span>
        </label>
        <button type="submit" disabled={loading} style={{ ...submitBtnStyle, background:'linear-gradient(135deg,#10b981,#059669)', boxShadow:'0 4px 12px rgba(16,185,129,0.35)' }}>
          {loading ? <><span style={spinnerStyle}/> Creating account...</> : <><UserPlus size={17}/> Initialize Access</>}
        </button>
      </form>
      <div style={{ textAlign:'center', marginTop:'1rem', fontSize:'0.85rem', color:'#94a3b8' }}>
        Already registered?{' '}<button type="button" onClick={onSwitch} style={{ border:'none', background:'none', color:GOV_BLUE, fontWeight:700, cursor:'pointer' }}>Sign In</button>
      </div>
    </div>
  );
}

/* ─── Shared input styles ─── */
const labelStyle  = { display:'block', fontSize:'0.8rem', fontWeight:700, color:'#374151', marginBottom:'0.35rem' };
const inputStyle  = { width:'100%', padding:'0.65rem 0.85rem', border:'1.5px solid #e2e8f0', borderRadius:8, boxSizing:'border-box', fontSize:'0.9rem', outline:'none', transition:'border-color 0.2s', fontFamily:'inherit', background:'#fafafa' };
const eyeBtnStyle = { position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#94a3b8', display:'flex' };
const submitBtnStyle = {
  display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem',
  width:'100%', padding:'0.85rem', marginTop:'0.25rem', borderRadius:10,
  fontWeight:700, fontSize:'0.95rem',
  background:`linear-gradient(135deg,${GOV_BLUE},${GOV_LIGHT})`,
  color:'#fff', border:'none', cursor:'pointer',
  boxShadow:'0 4px 12px rgba(10,49,97,0.3)',
  transition:'all 0.2s',
};
const spinnerStyle = { width:14, height:14, border:'2px solid rgba(255,255,255,0.4)', borderTopColor:'#fff', borderRadius:'50%', display:'inline-block', animation:'spin 0.8s linear infinite' };
