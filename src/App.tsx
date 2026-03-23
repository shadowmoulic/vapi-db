import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { LayoutDashboard, PhoneCall, Settings, Mic2, Activity, LogOut } from 'lucide-react';
import { supabase } from './supabase';
import DashboardPage from './pages/DashboardPage.tsx';
import CallsPage from './pages/CallsPage.tsx';
import AgentSettingsPage from './pages/AgentSettingsPage.tsx';
import LoginPage from './pages/LoginPage.tsx';

function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div style={{
        height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg-dark)', color: 'var(--text-muted)'
      }}>
        Initializing RealtyVoice Neural Auth...
      </div>
    );
  }

  if (!session) {
    return <LoginPage />;
  }

  return (
    <Router>
      <div className="app-container">
        {/* Sidebar */}
        <div className="sidebar">
          <div className="brand" style={{ marginBottom: 32 }}>
            <Mic2 className="icon" size={28} />
            <span>RealtyVoice</span>
          </div>

          <nav className="nav-links">
            <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end>
              <LayoutDashboard size={20} /> Dashboard
            </NavLink>
            <NavLink to="/calls" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <PhoneCall size={20} /> Call Logs
            </NavLink>
            <NavLink to="/agent" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Settings size={20} /> Agent Configuration
            </NavLink>
            <div className="nav-link" style={{ opacity: 0.5, cursor: 'not-allowed' }}>
              <Activity size={20} /> Multi-Client Panel
            </div>
          </nav>

          <div style={{ marginTop: 'auto' }}>
            <button className="btn btn-secondary" onClick={handleLogout} style={{ width: '100%', justifyContent: 'center', gap: 12 }}>
              <LogOut size={18} /> Sign Out
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="main-content">
          <header className="header">
            <h1 className="page-title">RealtyVoice Operations</h1>
            <div className="flex-between gap-4">
              <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span className="badge primary" style={{ opacity: 0.8 }}>Secure Agent Session</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{session.user.email}</span>
              </div>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--accent))', filter: 'brightness(1.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                {session.user.email[0].toUpperCase()}
              </div>
            </div>
          </header>

          <main className="content-area">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/calls" element={<CallsPage />} />
              <Route path="/agent" element={<AgentSettingsPage />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
