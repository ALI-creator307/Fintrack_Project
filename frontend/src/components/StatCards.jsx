import './StatCards.css';

function StatCard({ label, value, change, isPositiveChange, isPrimary }) {
  const cardClass = isPrimary ? 'stat-card stat-card--primary' : 'stat-card';
  const changeClass = isPositiveChange
    ? 'stat-card__change'
    : 'stat-card__change stat-card__change--down';

  return (
    <div className={cardClass}>
      <div className="stat-card__top">
        <span className="stat-card__label">{label}</span>
        <div className="stat-card__action">↗</div>
      </div>
      <div className="stat-card__value">{value}</div>
      <div className={changeClass}>
        {isPositiveChange ? '↑' : '↓'} {change}
      </div>
    </div>
  );
}

function StatCards({ summary }) {
  const cards = [
    {
      label: 'Total Balance',
      value: `Rs. ${summary.balance?.toLocaleString() ?? 0}`,
      change: '8.2% vs last month',
      isPositiveChange: true,
      isPrimary: false,
    },
    {
      label: 'Total Income',
      value: `Rs. ${summary.income?.toLocaleString() ?? 0}`,
      change: '5.1% vs last month',
      isPositiveChange: true,
      isPrimary: true,
    },
    {
      label: 'Total Expenses',
      value: `Rs. ${summary.expenses?.toLocaleString() ?? 0}`,
      change: '2.4% vs last month',
      isPositiveChange: false,
      isPrimary: false,
    },
    {
      label: 'Total Savings',
      value: `Rs. ${summary.savings?.toLocaleString() ?? 0}`,
      change: '12.1% vs last month',
      isPositiveChange: true,
      isPrimary: false,
    },
  ];

  return (
    <div className="stat-cards">
      {cards.map((card) => (
        <StatCard key={card.label} {...card} />
      ))}
    </div>
  );
}

export default StatCards;
