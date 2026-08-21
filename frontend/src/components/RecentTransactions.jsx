import './RecentTransactions.css';

const CATEGORY_META = {
  salary: { icon: '💼', bg: '#f0eeff' },
  food: { icon: '🍕', bg: '#fff0f0' },
  shopping: { icon: '🛒', bg: '#f0fff4' },
  transport: { icon: '🚗', bg: '#fff7ed' },
  entertainment: { icon: '🎮', bg: '#f0f9ff' },
  freelance: { icon: '💻', bg: '#fdf4ff' },
};

function TransactionItem({ transaction }) {
  const { name, category, date, amount, type } = transaction;
  const meta = CATEGORY_META[category] ?? { icon: '💰', bg: '#f5f5f5' };
  const isCredit = type === 'income';

  const amountClass = isCredit
    ? 'txn-item__amount txn-item__amount--credit'
    : 'txn-item__amount txn-item__amount--debit';

  const displayAmount = isCredit
    ? `+Rs. ${amount.toLocaleString()}`
    : `-Rs. ${amount.toLocaleString()}`;

  return (
    <div className="txn-item">
      <div className="txn-item__left">
        <div className="txn-item__icon" style={{ background: meta.bg }}>
          {meta.icon}
        </div>
        <div>
          <div className="txn-item__name">{name}</div>
          <div className="txn-item__date">{date}</div>
        </div>
      </div>
      <div className={amountClass}>{displayAmount}</div>
    </div>
  );
}

function RecentTransactions({ transactions }) {
  return (
    <div className="recent-txn">
      <div className="recent-txn__header">
        <span className="recent-txn__title">🕐 Recent Transactions</span>
      </div>

      {transactions.map((txn) => (
        <TransactionItem key={txn.id} transaction={txn} />
      ))}
    </div>
  );
}

export default RecentTransactions;
