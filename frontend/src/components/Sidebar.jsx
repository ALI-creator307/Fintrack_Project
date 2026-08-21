import './Sidebar.css';

const NAV_ITEMS = [
  { id: 'dashboard', icon: '📊', label: 'Dashboard' },
  { id: 'transactions', icon: '💸', label: 'Transactions' },
  { id: 'goals', icon: '🎯', label: 'Goals' },
  { id: 'budget', icon: '📋', label: 'Budget' },
  { id: 'analytics', icon: '📈', label: 'Analytics' },
];

const BOTTOM_ITEMS = [
  { id: 'settings', icon: '⚙️', label: 'Settings' },
  { id: 'logout', icon: '🚪', label: 'Logout' },
];

function NavItem({ item, isActive, onNavigate }) {
  const activeClass = isActive ? 'sidebar__nav-item--active' : '';

  return (
    <div
      className={`sidebar__nav-item ${activeClass}`}
      onClick={() => onNavigate(item.id)}
    >
      <span className="sidebar__nav-icon">{item.icon}</span>
      <span className="sidebar__nav-label">{item.label}</span>
    </div>
  );
}

function Sidebar({ activePage, onNavigate }) {
  return (
    <aside className="sidebar">
      <div className="sidebar__logo">
        <div className="sidebar__logo-icon">F</div>
        <div className="sidebar__logo-text">FinTrack</div>
      </div>

      {NAV_ITEMS.map((item) => (
        <NavItem
          key={item.id}
          item={item}
          isActive={activePage === item.id}
          onNavigate={onNavigate}
        />
      ))}

      <div className="sidebar__bottom">
        {BOTTOM_ITEMS.map((item) => (
          <NavItem
            key={item.id}
            item={item}
            isActive={activePage === item.id}
            onNavigate={onNavigate}
          />
        ))}
      </div>
    </aside>
  );
}

export default Sidebar;
