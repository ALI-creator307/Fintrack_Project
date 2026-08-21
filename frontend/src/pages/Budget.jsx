import { useMemo, useState } from 'react';
import './Budget.css';
import '../components/Shared/Shared.css';
import PageHeader from '../components/Shared/PageHeader';
import { useBudgets } from '../hooks/useFinTrack';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function getStatus(spent, limit) {
    const pct = (spent / limit) * 100;
    if (pct >= 100) return 'danger';
    if (pct >= 80) return 'warn';
    return 'ok';
}

/* ── Edit Budget Modal ── */
function EditBudgetModal({ budget, onClose, onSave }) {
    const [limit, setLimit] = useState(budget.limit);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal__header">
                    <span className="modal__title">{budget.icon} Edit Budget — {budget.category}</span>
                    <div className="modal__close" onClick={onClose}>✕</div>
                </div>

                <div className="form-group">
                    <label className="form-label">Monthly Limit (Rs.)</label>
                    <input
                        className="form-input"
                        type="number"
                        value={limit}
                        onChange={(e) => setLimit(parseFloat(e.target.value))}
                    />
                </div>

                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    Current spending: Rs. {budget.spent.toLocaleString()}
                </p>

                <div className="modal__footer">
                    <button className="btn-secondary" onClick={onClose}>Cancel</button>
                    <button className="btn-primary" onClick={() => { onSave(budget.id, limit); onClose(); }}>
                        Save Limit
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ── Budget Card ── */
function BudgetCard({ budget, onEdit }) {
    const percent = Math.min(Math.round((budget.spent / budget.limit) * 100), 100);
    const status = getStatus(budget.spent, budget.limit);
    const remaining = budget.limit - budget.spent;

    const fillClass = `budget-card__fill budget-card__fill--${status === 'ok' ? '' : status}`.trim();
    const remainingClass = `budget-card__remaining budget-card__remaining--${status}`;

    return (
        <div className="budget-card">
            <div className="budget-card__top">
                <div className="budget-card__left">
                    <div className="budget-card__icon" style={{ background: budget.bg }}>{budget.icon}</div>
                    <div>
                        <div className="budget-card__name">{budget.category}</div>
                        <div className="budget-card__month">Monthly budget</div>
                    </div>
                </div>
                <div className="budget-card__edit-btn" onClick={() => onEdit(budget)} title="Edit limit">✏️</div>
            </div>

            <div className="budget-card__progress-row">
                <span className="budget-card__spent">Rs. {budget.spent.toLocaleString()}</span>
                <span className="budget-card__limit">of Rs. {budget.limit.toLocaleString()}</span>
            </div>

            <div className="budget-card__bar">
                <div className={fillClass} style={{ width: `${percent}%` }} />
            </div>

            <div className="budget-card__footer">
                <span className={remainingClass}>
                    {remaining >= 0
                        ? `Rs. ${remaining.toLocaleString()} remaining`
                        : `Rs. ${Math.abs(remaining).toLocaleString()} over budget!`}
                </span>
                <span className="budget-card__percent">{percent}%</span>
            </div>
        </div>
    );
}

/* ── Main Budget Page ── */
function Budget() {
    const now = new Date();
    const [monthIndex, setMonthIndex] = useState(now.getMonth());
    const [year, setYear] = useState(now.getFullYear());
    const [editTarget, setEditTarget] = useState(null);
    const [newCategory, setNewCategory] = useState('');
    const [newLimit, setNewLimit] = useState('');
    const { budgets, loading, error, saveBudget, updateBudget } = useBudgets(monthIndex + 1, year);

    const normalizedBudgets = useMemo(
        () =>
            budgets.map((b) => ({
                id: b.id,
                category: b.category,
                icon: '📋',
                bg: '#f5f5f5',
                limit: Number(b.limitAmount ?? 0),
                spent: Number(b.spentAmount ?? 0),
            })),
        [budgets]
    );

    const overBudget = normalizedBudgets.filter(b => b.spent > b.limit);
    const nearLimit = normalizedBudgets.filter(b => {
        const pct = (b.spent / b.limit) * 100;
        return pct >= 80 && pct < 100;
    });

    const totalBudgeted = normalizedBudgets.reduce((s, b) => s + b.limit, 0);
    const totalSpent = normalizedBudgets.reduce((s, b) => s + b.spent, 0);
    const totalLeft = totalBudgeted - totalSpent;

    const handleSaveLimit = async (id, limitAmount) => {
        await updateBudget(id, {
            category: editTarget?.category ?? '',
            limitAmount: Number(limitAmount),
        });
    };

    const handleCreateBudget = async () => {
        const trimmedCategory = newCategory.trim();
        if (!trimmedCategory || !newLimit) return;
        await saveBudget({
            category: trimmedCategory,
            limitAmount: Number(newLimit),
        });
        setNewCategory('');
        setNewLimit('');
    };

    const prevMonth = () => {
        setMonthIndex((i) => {
            if (i === 0) {
                setYear((y) => y - 1);
                return 11;
            }
            return i - 1;
        });
    };
    const nextMonth = () => {
        setMonthIndex((i) => {
            if (i === 11) {
                setYear((y) => y + 1);
                return 0;
            }
            return i + 1;
        });
    };

    return (
        <div className="budget-page">
            <PageHeader
                title="📋 Budget Planner"
                subtitle="Set monthly limits and track your backend spending"
            />

            {error && (
                <div className="budget-alert budget-alert--danger">
                    {error}
                </div>
            )}

            <div className="budget-month-bar" style={{ marginBottom: '12px' }}>
                <input
                    className="form-input"
                    placeholder="Category (e.g. food)"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                />
                <input
                    className="form-input"
                    type="number"
                    placeholder="Limit"
                    value={newLimit}
                    onChange={(e) => setNewLimit(e.target.value)}
                />
                <button className="btn-primary" onClick={handleCreateBudget}>
                    + Add Budget
                </button>
            </div>

            {/* Alerts */}
            {overBudget.map(b => (
                <div key={b.id} className="budget-alert budget-alert--danger">
                    🚨 <strong>{b.category}</strong> budget exceeded by Rs. {(b.spent - b.limit).toLocaleString()}!
                </div>
            ))}
            {nearLimit.map(b => (
                <div key={b.id} className="budget-alert budget-alert--warn">
                    ⚠️ <strong>{b.category}</strong> is at {Math.round((b.spent / b.limit) * 100)}% — almost at limit!
                </div>
            ))}

            {/* Month Nav */}
            <div className="budget-month-bar">
                <div className="month-nav-btn" onClick={prevMonth}>←</div>
                <span className="budget-month-bar__label">📅 {MONTHS[monthIndex]} {year}</span>
                <div className="month-nav-btn" onClick={nextMonth}>→</div>
            </div>

            {/* Summary */}
            <div className="budget-summary">
                <div className="budget-summary-card">
                    <div className="budget-summary-card__label">Total Budgeted</div>
                    <div className="budget-summary-card__value">Rs. {totalBudgeted.toLocaleString()}</div>
                </div>
                <div className="budget-summary-card">
                    <div className="budget-summary-card__label">Total Spent</div>
                    <div className="budget-summary-card__value budget-summary-card__value--danger">
                        Rs. {totalSpent.toLocaleString()}
                    </div>
                </div>
                <div className="budget-summary-card">
                    <div className="budget-summary-card__label">Remaining</div>
                    <div className={`budget-summary-card__value budget-summary-card__value--${totalLeft >= 0 ? 'success' : 'danger'}`}>
                        Rs. {Math.abs(totalLeft).toLocaleString()}
                    </div>
                </div>
            </div>

            {/* Budget Cards */}
            <div className="budget-cards">
                {loading && <div style={{ color: 'var(--text-muted)' }}>Loading budgets...</div>}
                {!loading && normalizedBudgets.map(b => (
                    <BudgetCard key={b.id} budget={b} onEdit={setEditTarget} />
                ))}
            </div>

            {editTarget && (
                <EditBudgetModal
                    budget={editTarget}
                    onClose={() => setEditTarget(null)}
                    onSave={handleSaveLimit}
                />
            )}
        </div>
    );
}

export default Budget;