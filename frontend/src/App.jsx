import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SyncProvider } from './context/SyncContext';
import { PWAProvider } from './context/PWAContext';
import Layout from './components/Layout';
import PageLoader from './components/PageLoader';
import Chatbot from './components/Chatbot';

// Public pages
import Landing     from './pages/Landing';
// Auth pages are now embedded Modals inside Landing

// Protected pages
import Dashboard   from './pages/Dashboard/Dashboard';

// Inhabitants
import Residents      from './pages/Residents/Residents';
import Households     from './pages/Inhabitants/Households';
import SeniorCitizens from './pages/Inhabitants/SeniorCitizens';
import PWDRegistry    from './pages/Inhabitants/PWDRegistry';
import VoterRegistry  from './pages/Inhabitants/VoterRegistry';

// Issuances
import Certifications from './pages/Certifications/Certifications';

// KP Cases
import Cases          from './pages/Cases/Cases';

// Other modules
import Legislation from './pages/Legislation/Legislation';
import Incidents   from './pages/Incidents/Incidents';
import Assets      from './pages/Assets/Assets';
import DrrmGad     from './pages/DRRM/DrrmGad';
import Settings    from './pages/Settings/Settings';

// Smart tools (existing pages from previous build)
import DSS            from './pages/DSS/DSS';
import SyncEngine     from './pages/Sync/SyncEngine';
import BlockchainAudit from './pages/Blockchain/BlockchainAudit';
import Tracking       from './pages/Tracking/Tracking';
import Reports        from './pages/Reports/Reports';
import AIAnalytics    from './pages/Analytics/AIAnalytics';

const SESSION_TIMEOUT = 30 * 60 * 1000;

function AuthGuard({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#f0f4f8' }}>
      <div style={{ textAlign:'center' }}>
        <div className="animate-spin" style={{ width:48,height:48,border:'4px solid #dde3ed',borderTopColor:'#1a4f8a',borderRadius:'50%',margin:'0 auto 1rem' }} />
        <div style={{ color:'#64748b',fontWeight:600 }}>Loading...</div>
      </div>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
}

import { useState, useEffect } from 'react';

function ProtectedLayout({ children, roles }) {
  return (
    <AuthGuard roles={roles}>
      <Layout>{children}</Layout>
    </AuthGuard>
  );
}

import { Toaster } from 'react-hot-toast';

export default function App() {
  return (
    <AuthProvider sessionTimeout={SESSION_TIMEOUT}>
      <PWAProvider>
        <SyncProvider>
          <BrowserRouter>
            <PageLoader />
            <Toaster position="bottom-right" toastOptions={{ style: { borderRadius: 10, fontWeight: 600, fontSize: '0.85rem' } }} />
            <Routes>
            {/* Public */}
            <Route path="/"         element={<Landing />} />
            <Route path="/login"    element={<Navigate to="/" replace />} />
            <Route path="/register" element={<Navigate to="/" replace />} />
            <Route path="/forgot-password" element={<Navigate to="/" replace />} />

            {/* Dashboard */}
            <Route path="/dashboard" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />

            {/* Inhabitants */}
            <Route path="/residents"      element={<ProtectedLayout roles={['Admin','Secretary']}><Residents /></ProtectedLayout>} />
            <Route path="/households"     element={<ProtectedLayout roles={['Admin','Secretary']}><Households /></ProtectedLayout>} />
            <Route path="/senior-citizens"element={<ProtectedLayout roles={['Admin','Secretary']}><SeniorCitizens /></ProtectedLayout>} />
            <Route path="/pwd"            element={<ProtectedLayout roles={['Admin','Secretary']}><PWDRegistry /></ProtectedLayout>} />
            <Route path="/voters"         element={<ProtectedLayout roles={['Admin','Secretary']}><VoterRegistry /></ProtectedLayout>} />

            {/* Issuances */}
            <Route path="/certifications" element={<ProtectedLayout roles={['Admin','Secretary']}><Certifications /></ProtectedLayout>} />
            <Route path="/issuance-logs"  element={<ProtectedLayout roles={['Admin','Secretary']}><Certifications /></ProtectedLayout>} />

            {/* KP Cases */}
            <Route path="/cases"    element={<ProtectedLayout roles={['Admin','Secretary']}><Cases /></ProtectedLayout>} />
            <Route path="/hearings" element={<ProtectedLayout roles={['Admin','Secretary']}><Cases /></ProtectedLayout>} />

            {/* Other modules */}
            <Route path="/legislation" element={<ProtectedLayout roles={['Admin','Secretary']}><Legislation /></ProtectedLayout>} />
            <Route path="/incidents"   element={<ProtectedLayout roles={['Admin','Secretary']}><Incidents /></ProtectedLayout>} />
            <Route path="/assets"      element={<ProtectedLayout roles={['Admin','Secretary']}><Assets /></ProtectedLayout>} />
            <Route path="/drrm"        element={<ProtectedLayout roles={['Admin','Secretary']}><DrrmGad /></ProtectedLayout>} />
            <Route path="/gad"         element={<ProtectedLayout roles={['Admin','Secretary']}><DrrmGad /></ProtectedLayout>} />

            {/* Smart tools */}
            <Route path="/tracking" element={<ProtectedLayout roles={['Admin','Secretary']}><Tracking /></ProtectedLayout>} />
            <Route path="/dss"      element={<ProtectedLayout roles={['Admin','Secretary']}><DSS /></ProtectedLayout>} />
            <Route path="/audit"    element={<ProtectedLayout roles={['Admin', 'Secretary']}><BlockchainAudit /></ProtectedLayout>} />
            <Route path="/sync"     element={<ProtectedLayout><SyncEngine /></ProtectedLayout>} />
            <Route path="/reports"  element={<ProtectedLayout roles={['Admin','Secretary']}><Reports /></ProtectedLayout>} />
            <Route path="/ai-analytics" element={<ProtectedLayout roles={['Admin','Secretary']}><AIAnalytics /></ProtectedLayout>} />

            {/* Settings */}
            <Route path="/settings" element={<ProtectedLayout roles={['Admin']}><Settings /></ProtectedLayout>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <Chatbot />
          </BrowserRouter>
        </SyncProvider>
      </PWAProvider>
    </AuthProvider>
  );
}
