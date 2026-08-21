import { useState, useMemo } from 'react';
import './Transactions.css';
import '../components/Shared/Shared.css';
import PageHeader from '../components/Shared/PageHeader';
import { useTransactions } from '../hooks/useFinTrack';

/* ── Category Meta (icons + colors) ── */
const CATEGORY_META = {
  salary: { icon: '💼', bg: '#f0eeff' },
  freelance: { icon: '💻', bg: '#fdf4ff' },
  food: { icon: '🍕', bg: '#fff0f0' },
  transport: { icon: '🚗', bg: '#fff7ed' },
  shopping: { icon: '🛒', bg: '#f0fff4' },
  entertainment: { icon: '🎮', bg: '#f0f9ff' },
  health: { icon: '🏥', bg: '#fff0f0' },
  education: { icon: '📚', bg: '#fffbeb' },
  utilities: { icon: '💡', bg: '#f0fdf4' },
  other: { icon: '💰', bg: '#f5f5f5' },
};

const CATEGORIES = Object.keys(CATEGORY_META);
const EMPTY_FORM = { name: '', amount: '', type: 'expense', category: 'food', date: '', note: '' };

/* ── Add Transaction Modal ── */
function AddTransactionModal({ onClose, onAdd }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!form.name || !form.amount || !form.date) return;
    setLoading(true);
    setError('');
    try {
      await onAdd({ ...form, amount: parseFloat(form.amount) });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to add transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal__header">
          <span className="modal__title">➕ Add Transaction</span>
          <div className="modal__close" onClick={onClose}>✕</div>
        </div>

        {error && (
          <div style={{ color: 'var(--danger)', fontSize: '13px', marginBottom: '12px' }}>
            {error}
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Description</label>
          <input className="form-input" name="name" placeholder="e.g. Monthly Salary"
            value={form.name} onChange={handleChange} />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Amount (Rs.)</label>
            <input className="form-input" name="amount" type="number" placeholder="0"
              value={form.amount} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Type</label>
            <select className="form-select" name="type" value={form.type} onChange={handleChange}>
              <option value="income">💚 Income</option>
              <option value="expense">❤️ Expense</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Category</label>
            <select className="form-select" name="category" value={form.category} onChange={handleChange}>
              {CATEGORIES.map(c => (
                <option key={c} value={c}>
                  {CATEGORY_META[c].icon} {c.charAt(0).toUpperCase() + c.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Date</label>
            <input className="form-input" name="date" type="date"
              value={form.date} onChange={handleChange} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Note (optional)</label>
          <input className="form-input" name="note" placeholder="Any details..."
            value={form.note} onChange={handleChange} />
        </div>

        <div className="modal__footer">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Adding...' : 'Add Transaction'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Transaction Row ── */
function TransactionRow({ txn, onDelete }) {
  const meta = CATEGORY_META[txn.category] ?? CATEGORY_META.other;
  const isIncome = txn.type === 'income';

  return (
    <div className="txn-row">
      <div className="txn-row__info">
        <div className="txn-row__icon" style={{ background: meta.bg }}>{meta.icon}</div>
        <div>
          <div className="txn-row__name">{txn.name}</div>
          {txn.note && <div className="txn-row__note">{txn.note}</div>}
        </div>
      </div>

      <div className="txn-row__date">{txn.date}</div>

      <div>
        <span className="category-badge">{meta.icon} {txn.category}</span>
      </div>

      <div>
        <span className={`type-badge type-badge--${txn.type}`}>
          {isIncome ? '↑ Income' : '↓ Expense'}
        </span>
      </div>

      <div className={`txn-row__amount txn-row__amount--${txn.type}`}>
        {isIncome ? '+' : '-'}Rs. {parseFloat(txn.amount).toLocaleString()}
      </div>

      <div className="txn-row__actions">
        <div className="icon-btn icon-btn--danger" onClick={() => onDelete(txn.id)} title="Delete">
          🗑️
        </div>
      </div>
    </div>
  );
}

/* ── Main Transactions Page ── */
function Transactions() {
  const { transactions, summary, loading, error, addTransaction, removeTransaction } = useTransactions();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);

  /* Filter transactions by search + type */
  const filtered = useMemo(() => {
    return transactions.filter(t => {
      const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.category.toLowerCase().includes(search.toLowerCase());
      const matchType = typeFilter === 'all' || t.type === typeFilter;
      return matchSearch && matchType;
    });
  }, [transactions, search, typeFilter]);

  const totalIncome = summary?.totalIncome ?? 0;
  const totalExpense = summary?.totalExpense ?? 0;

  if (loading) return <div className="transactions"><p style={{ padding: '20px' }}>Loading...</p></div>;
  if (error) return <div className="transactions"><p style={{ padding: '20px', color: 'var(--danger)' }}>{error}</p></div>;

  return (
    <div className="transactions">
      <PageHeader
        title="💸 Transactions"
        subtitle={`${transactions.length} transactions · Income: Rs. ${parseFloat(totalIncome).toLocaleString()} · Expenses: Rs. ${parseFloat(totalExpense).toLocaleString()}`}
      >
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          ➕ Add Transaction
        </button>
      </PageHeader>

      {/* Filter Bar */}
      <div className="txn-filters">
        <div className="txn-filters__search">
          <span className="txn-filters__search-icon">🔍</span>
          <input
            placeholder="Search transactions..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        {['all', 'income', 'expense'].map(f => (
          <div
            key={f}
            className={`filter-chip ${typeFilter === f ? 'filter-chip--active' : ''}`}
            onClick={() => setTypeFilter(f)}
          >
            {f === 'all' ? '📋 All' : f === 'income' ? '💚 Income' : '❤️ Expense'}
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="txn-table">
        <div className="txn-table__header">
          <span>Transaction</span>
          <span>Date</span>
          <span>Category</span>
          <span>Type</span>
          <span>Amount</span>
          <span></span>
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔍</div>
            <div>No transactions found</div>
          </div>
        ) : (
          filtered.map(txn => (
            <TransactionRow key={txn.id} txn={txn} onDelete={removeTransaction} />
          ))
        )}
      </div>

      {showModal && (
        <AddTransactionModal
          onClose={() => setShowModal(false)}
          onAdd={addTransaction}
        />
      )}
    </div>
  );
}

export default Transactions;