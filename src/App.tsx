import { useEffect, useState, createContext } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { LayoutDashboard, PhoneCall, Settings, Mic2, LogOut, ShieldAlert, KeyRound } from 'lucide-react';
import { supabase } from './supabase';
import DashboardPage from './pages/DashboardPage';
import CallsPage from './pages/CallsPage';
import AgentSettingsPage from './pages/AgentSettingsPage';
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/AdminPage';

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
      const { data } = await supabase
        .from('client_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (data) setProfile(data);
    } catch {
      console.log("No custom profile found yet.");
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

  // Determine which Vapi Key to use: Profile-specific ONLY for clients.
  // We do NOT fallback to the global demo key for logged in users to avoid confusion.
  const vapiApiKey = profile?.vapi_key || null;

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
              <NavLink to="/admin" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <KeyRound size={20} /> Super Admin
              </NavLink>
            </nav>

            {!profile && (
              <div style={{
                marginTop: 32, padding: 16, borderRadius: 12, border: '1px dashed var(--border-color)',
                background: 'rgba(239, 68, 68, 0.05)', fontSize: '0.8rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--danger)', marginBottom: 8, fontWeight: 600 }}>
                  <ShieldAlert size={14} /> Activation Required
                </div>
                <p style={{ color: 'var(--text-muted)' }}>
                  Your client account is pending activation by RealtyVoice Admin. No data will be visible until a Vapi API is linked.
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
                    {profile ? `Organization: ${profile.client_name}` : 'Awaiting Activation'}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{session.user.email}</span>
                </div>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--accent))', filter: 'brightness(1.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                  {session.user.email[0].toUpperCase()}
                </div>
              </div>
            </header>

            <main className="content-area" style={{ position: 'relative' }}>
              {/* Security Blur Guard & Activation Screen */}
              {!profile && !session.user.email.includes('realtyvoice') && (
                <div style={{
                  position: 'absolute',
                  top: 0, left: 0, right: 0, bottom: 0,
                  zIndex: 1000,
                  backdropFilter: 'blur(30px) saturate(180%)',
                  background: 'rgba(9, 9, 11, 0.4)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  padding: 40,
                  borderRadius: 24
                }}>
                  <div style={{
                    width: 80, height: 80, borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--danger)',
                    marginBottom: 24, border: '1px solid rgba(239, 68, 68, 0.2)'
                  }}>
                    <ShieldAlert size={40} />
                  </div>
                  <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 12 }}>Activation Required</h2>
                  <p style={{ maxWidth: 450, color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: 1.6 }}>
                    Your RealtyVoice license is currently <strong>Pending Activation</strong>.<br />
                    A Super Admin will link your Vapi Intel shortly.
                  </p>
                  <div style={{ marginTop: 32, padding: '12px 24px', background: 'rgba(255,255,255,0.05)', borderRadius: 12, border: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
                    User ID Hash: <code style={{ color: 'var(--primary)' }}>{session.user.id}</code>
                  </div>
                </div>
              )}

              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/calls" element={<CallsPage />} />
                <Route path="/agent" element={<AgentSettingsPage />} />
                <Route path="/admin" element={<AdminPage />} />
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
