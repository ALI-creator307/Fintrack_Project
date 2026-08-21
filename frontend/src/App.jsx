import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Budget from './pages/Budget';
import Analytics from './pages/Analytics';
import Goals from './pages/Goals';
import Login from './pages/Login';
import Register from './pages/Register';
import OAuth2Callback from './pages/OAuth2Callback';
import { authService } from './services/api';
import './variables.css';
import './layout.css';

/* ── Page Registry ── */
const PAGES = {
  dashboard: Dashboard,
  transactions: Transactions,
  budget: Budget,
  analytics: Analytics,
  goals: Goals,
};

function App() {
  // Check localStorage for existing session
  const [user, setUser] = useState(authService.getCurrentUser());
  const [activePage, setActivePage] = useState('dashboard');
  const [authPage, setAuthPage] = useState('login'); // 'login' | 'register'

  /* ── OAuth2 Callback Route ── */
  if (window.location.pathname === '/oauth2/callback') {
    return <OAuth2Callback onLogin={(u) => setUser(u)} />;
  }

  /* ── Not logged in → Show Auth Pages ── */
  if (!user) {
    if (authPage === 'register') {
      return (
        <Register
          onLogin={(u) => setUser(u)}
          onNavigateLogin={() => setAuthPage('login')}
        />
      );
    }
    return (
      <Login
        onLogin={(u) => setUser(u)}
        onNavigateRegister={() => setAuthPage('register')}
      />
    );
  }

  /* ── Logged in → Main App ── */
  const PageComponent = PAGES[activePage] ?? Dashboard;

  const handleNavigate = (pageId) => {
    if (pageId === 'logout') {
      authService.logout();   // clear localStorage
      setUser(null);          // reset state → shows Login
      setActivePage('dashboard');
      return;
    }
    setActivePage(pageId);
  };

  return (
    <div className="app-layout">
      <Sidebar activePage={activePage} onNavigate={handleNavigate} />
      <main className="app-main">
        <PageComponent user={user} />
      </main>
    </div>
  );
}

export default App;