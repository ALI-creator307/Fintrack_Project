import './BudgetPlanner.css';

function getProgressClass(percent) {
  if (percent >= 100) return 'progress-bar__fill progress-bar__fill--danger';
  if (percent >= 80) return 'progress-bar__fill progress-bar__fill--warn';
  return 'progress-bar__fill';
}

function BudgetItem({ name, spent, limit }) {
  const percent = Math.min(Math.round((spent / limit) * 100), 100);
  const fillClass = getProgressClass(percent);

  return (
    <div className="budget-item">
      <div className="budget-item__row">
        <span className="budget-item__name">{name}</span>
        <span className="budget-item__amount">
          {spent.toLocaleString()} / {limit.toLocaleString()}
        </span>
      </div>
      <div className="progress-bar">
        <div className={fillClass} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function BudgetPlanner({ budgets }) {
  return (
    <div className="budget-planner">
      <div className="budget-planner__header">
        <span className="budget-planner__title">📋 Budget</span>
      </div>

      {budgets.map((item) => (
        <BudgetItem
          key={item.category}
          name={item.category}
          spent={item.spent}
          limit={item.limit}
        />
      ))}
    </div>
  );
}

export default BudgetPlanner;
