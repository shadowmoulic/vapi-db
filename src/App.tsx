import { useEffect, useState, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { LayoutDashboard, PhoneCall, Settings, Mic2, Activity, LogOut, ShieldAlert } from 'lucide-react';
import { supabase } from './supabase';
import DashboardPage from './pages/DashboardPage.tsx';
import CallsPage from './pages/CallsPage.tsx';
import AgentSettingsPage from './pages/AgentSettingsPage.tsx';
import LoginPage from './pages/LoginPage.tsx';

// Global context for the client's Vapi Configuration
export const AuthContext = createContext<{
  session: any,
  profile: any,
  vapiConfig: { apiKey: string | null }
}>({ session: null, profile: null, vapiConfig: { apiKey: null } });

function App() {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else setLoading(false);
    });

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      // Attempt to fetch custom client key from Supabase
      const { data, error } = await supabase
        .from('client_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (data) setProfile(data);
    } catch (e) {
      console.log("No custom profile found yet, using default env key.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div style={{
        height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg-dark)', color: 'var(--text-muted)'
      }}>
        Synchronizing RealtyVoice Neural ID...
      </div>
    );
  }

  if (!session) {
    return <LoginPage />;
  }

  // Determine which Vapi Key to use: Profile-specific OR fallback to global env
  const vapiApiKey = profile?.vapi_key || import.meta.env.VITE_VAPI_API_KEY;

  return (
    <AuthContext.Provider value={{ session, profile, vapiConfig: { apiKey: vapiApiKey } }}>
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
                <Settings size={20} /> Configuration
              </NavLink>
            </nav>

            {!profile && (
              <div style={{
                marginTop: 32, padding: 16, borderRadius: 12, border: '1px dashed var(--border-color)',
                background: 'rgba(239, 68, 68, 0.05)', fontSize: '0.8rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--danger)', marginBottom: 8, fontWeight: 600 }}>
                  <ShieldAlert size={14} /> Profile Required
                </div>
                <p style={{ color: 'var(--text-muted)' }}>
                  Sign-up complete, but your client profile hasn't been initialized in Supabase yet. Using global demo key.
                </p>
              </div>
            )}

            <div style={{ marginTop: 'auto' }}>
              <button className="btn btn-secondary" onClick={handleLogout} style={{ width: '100%', justifyContent: 'center', gap: 12 }}>
                <LogOut size={18} /> Sign Out
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="main-content">
            <header className="header">
              <h1 className="page-title">Operations Console</h1>
              <div className="flex-between gap-4">
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span className="badge primary" style={{ opacity: 0.8 }}>
                    {profile ? `Client: ${profile.client_name}` : 'Demo Environment'}
                  </span>
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
    </AuthContext.Provider>
  );
}

export default App;
