
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { LayoutDashboard, PhoneCall, Settings, Mic2, Activity } from 'lucide-react';
import DashboardPage from './pages/DashboardPage.tsx';
import CallsPage from './pages/CallsPage.tsx';
import AgentSettingsPage from './pages/AgentSettingsPage.tsx';

function App() {
  return (
    <Router>
      <div className="app-container">
        {/* Sidebar */}
        <div className="sidebar">
          <div className="brand">
            <Mic2 className="icon" size={28} />
            <span>RealtyVoice</span>
          </div>

          <nav className="nav-links mt-4">
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
              <Activity size={20} /> Analytics (Soon)
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="main-content">
          <header className="header">
            <h1 className="page-title">RealtyVoice Operations</h1>
            <div className="flex-between gap-4">
              <span className="badge primary">RealtyVoice Dashboard</span>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--accent))', filter: 'brightness(1.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                A
              </div>
            </div>
          </header>

          <main className="content-area">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/calls" element={<CallsPage />} />
              <Route path="/agent" element={<AgentSettingsPage />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
