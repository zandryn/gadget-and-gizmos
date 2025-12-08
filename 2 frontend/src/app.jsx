import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './pages/dashboard';
import Categories from './pages/categories';
import Library from './pages/library';
import Add_Device from './pages/add_device';
import Edit_Device from './pages/edit_device';
import About from './pages/about';
import Settings from './pages/settings';
import './styles/global.css';

const Icons = {
  dashboard: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/>
      <rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>
    </svg>
  ),
  categories: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  ),
  library: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
    </svg>
  ),
  add: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
    </svg>
  ),
  about: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
    </svg>
  ),
  settings: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  ),
};

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const navItems = [
    { path: '/', label: 'Dashboard', icon: Icons.dashboard },
    { path: '/categories', label: 'Categories', icon: Icons.categories },
    { path: '/library', label: 'My Library', icon: Icons.library },
    { path: '/add', label: 'Add Device', icon: Icons.add },
    { path: '/about', label: 'About', icon: Icons.about },
  ];

  return (
    <Router>
      <div className={`app-layout ${darkMode ? 'dark-mode' : ''}`}>
        <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
          <div className="sidebar-header">
            <button 
              className="logo" 
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}
            >
              <span className="logo-icon">✦</span>
              {!sidebarCollapsed && <span className="logo-text">Gadgets & Gizmos</span>}
            </button>
          </div>

          <nav className="sidebar-nav">
            <span className="nav-label">MENU</span>
            {navItems.map((item) => (
              <NavLink key={item.path} to={item.path} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <item.icon />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </NavLink>
            ))}
          </nav>

          <div className="sidebar-footer">
            <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Icons.settings />
              {!sidebarCollapsed && <span>Settings</span>}
            </NavLink>
          </div>
        </aside>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/library" element={<Library />} />
            <Route path="/add" element={<Add_Device />} />
            <Route path="/edit/:id" element={<Edit_Device />} />
            <Route path="/about" element={<About />} />
            <Route path="/settings" element={<Settings darkMode={darkMode} setDarkMode={setDarkMode} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
