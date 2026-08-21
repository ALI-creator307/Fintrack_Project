import './DashboardHeader.css';

function DashboardHeader({ userName, hasNotifications }) {
  const initial = userName ? userName.charAt(0).toUpperCase() : 'U';

  return (
    <div className="dashboard-header">
      <div>
        <h1 className="dashboard-header__title">
          Welcome back, {userName}! 👋
        </h1>
        <p className="dashboard-header__subtitle">
          Here's your financial summary for this month
        </p>
      </div>

      <div className="dashboard-header__right">
        <div className="notif-btn">
          🔔
          {hasNotifications && <div className="notif-btn__dot" />}
        </div>

        <div className="user-chip">
          <div className="user-chip__avatar">{initial}</div>
          <span className="user-chip__name">{userName}</span>
        </div>
      </div>
    </div>
  );
}

export default DashboardHeader;
