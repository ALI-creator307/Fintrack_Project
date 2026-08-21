import { useState } from 'react';
import './Analytics.css';
import '../components/Shared/Shared.css';
import PageHeader from '../components/Shared/PageHeader';
import { useTransactions } from '../hooks/useFinTrack';

const COLORS = ['#ef4444', '#22c55e', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6', '#14b8a6', '#f97316'];

/* ── Stacked Bar Chart (Income vs Expense) ── */
function IncomeExpenseChart({ data }) {
    if (data.length === 0) {
        return (
            <div className="chart-card">
                <div className="chart-card__title">📊 Income vs Expense</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No transactions yet.</div>
            </div>
        );
    }
    const max = Math.max(...data.map(d => d.income), 1);

    return (
        <div className="chart-card">
            <div className="chart-card__title">📊 Income vs Expense</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '160px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                {data.map(item => {
                    const incomeH = Math.round((item.income / max) * 130);
                    const expenseH = Math.round((item.expense / max) * 130);
                    return (
                        <div key={item.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px' }}>
                                <div style={{ width: '8px', height: incomeH, background: 'var(--primary)', borderRadius: '3px 3px 0 0' }} title={`Income: Rs.${item.income.toLocaleString()}`} />
                                <div style={{ width: '8px', height: expenseH, background: '#e0d9ff', borderRadius: '3px 3px 0 0' }} title={`Expense: Rs.${item.expense.toLocaleString()}`} />
                            </div>
                            <span style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: 500 }}>{item.month}</span>
                        </div>
                    );
                })}
            </div>
            <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: 'var(--text-muted)' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' }} /> Income
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: 'var(--text-muted)' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#e0d9ff' }} /> Expense
                </div>
            </div>
        </div>
    );
}

/* ── CSS Donut Chart ── */
function DonutChart({ categories }) {
    if (categories.length === 0) {
        return (
            <div className="chart-card">
                <div className="chart-card__title">🥧 Spending Breakdown</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No expense data yet.</div>
            </div>
        );
    }
    // Build conic-gradient from percentages
    let cumulative = 0;
    const segments = categories.map(c => {
        const start = cumulative;
        cumulative += c.percent;
        return { ...c, start, end: cumulative };
    });

    const gradient = segments
        .map(s => `${s.color} ${s.start}% ${s.end}%`)
        .join(', ');

    const donutStyle = {
        background: `conic-gradient(${gradient})`,
        borderRadius: '50%',
        width: '130px',
        height: '130px',
        position: 'relative',
    };

    const holeStyle = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '70px',
        height: '70px',
        background: 'white',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '10px',
        fontWeight: '700',
        color: 'var(--text-primary)',
        textAlign: 'center',
        lineHeight: '1.3',
    };

    return (
        <div className="chart-card">
            <div className="chart-card__title">🥧 Spending Breakdown</div>
            <div className="donut-wrap">
                <div style={donutStyle}>
                    <div style={holeStyle}>Expenses<br />Breakdown</div>
                </div>
                <div className="donut-legend">
                    {categories.map(c => (
                        <div key={c.name} className="donut-legend-item">
                            <div className="donut-legend-item__dot" style={{ background: c.color }} />
                            <span className="donut-legend-item__name">{c.icon} {c.name}</span>
                            <span className="donut-legend-item__pct">{c.percent}%</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

/* ── Category Stats Table ── */
function CategoryTable({ categories }) {
    const total = categories.reduce((s, c) => s + c.amount, 0);

    return (
        <div className="analytics-table">
            <div className="analytics-table__title">📋 Category Breakdown — April 2024</div>
            <div className="analytics-table__row analytics-table__head">
                <span>Category</span>
                <span>Amount Spent</span>
                <span>% of Total</span>
                <span>vs. Last Month</span>
            </div>
            {categories.map(c => (
                <div key={c.name} className="analytics-table__row">
                    <div className="analytics-table__category">
                        <div className="cat-icon" style={{ background: c.bg }}>{c.icon}</div>
                        {c.name}
                    </div>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Rs. {c.amount.toLocaleString()}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{c.percent}%</span>
                    <span style={{ color: 'var(--success)', fontWeight: 600 }}>↓ 3.2%</span>
                </div>
            ))}
            <div className="analytics-table__row" style={{ borderTop: '2px solid var(--border)', marginTop: '4px' }}>
                <span style={{ fontWeight: 700 }}>Total</span>
                <span style={{ fontWeight: 800, color: 'var(--primary)' }}>Rs. {total.toLocaleString()}</span>
                <span style={{ fontWeight: 700 }}>100%</span>
                <span></span>
            </div>
        </div>
    );
}

/* ── Main Analytics Page ── */
function Analytics() {
    const [view, setView] = useState('monthly');
    const { transactions, loading, error } = useTransactions();

    const monthlyMap = new Map();
    transactions.forEach((t) => {
        const date = new Date(t.date);
        if (Number.isNaN(date.getTime())) return;
        const key = `${date.getFullYear()}-${date.getMonth()}`;
        if (!monthlyMap.has(key)) {
            monthlyMap.set(key, {
                month: date.toLocaleString('en-US', { month: 'short' }),
                income: 0,
                expense: 0,
                sortKey: key,
            });
        }
        const row = monthlyMap.get(key);
        const amount = Number(t.amount ?? 0);
        if (t.type === 'income') row.income += amount;
        if (t.type === 'expense') row.expense += amount;
    });
    const allMonths = Array.from(monthlyMap.values()).sort((a, b) => a.sortKey.localeCompare(b.sortKey));
    const displayData = view === 'monthly' ? allMonths.slice(-7) : allMonths;

    const totalIncome = displayData.reduce((s, d) => s + d.income, 0);
    const totalExpense = displayData.reduce((s, d) => s + d.expense, 0);
    const savings = totalIncome - totalExpense;

    const categoryTotals = new Map();
    transactions
        .filter((t) => t.type === 'expense')
        .forEach((t) => {
            const key = t.category || 'other';
            categoryTotals.set(key, (categoryTotals.get(key) ?? 0) + Number(t.amount ?? 0));
        });
    const expenseSum = Array.from(categoryTotals.values()).reduce((s, v) => s + v, 0);
    const categoryBreakdown = Array.from(categoryTotals.entries())
        .map(([name, amount], idx) => ({
            name,
            icon: '📌',
            bg: '#f5f5f5',
            color: COLORS[idx % COLORS.length],
            amount,
            percent: expenseSum > 0 ? Math.round((amount / expenseSum) * 100) : 0,
        }))
        .sort((a, b) => b.amount - a.amount);

    if (loading) return <div className="analytics"><p style={{ padding: '20px' }}>Loading...</p></div>;
    if (error) return <div className="analytics"><p style={{ padding: '20px', color: 'var(--danger)' }}>{error}</p></div>;

    return (
        <div className="analytics">
            <PageHeader
                title="📈 Analytics"
                subtitle="Visualize your financial patterns"
            >
                <div className="analytics-toggle">
                    <div className={`toggle-btn ${view === 'monthly' ? 'toggle-btn--active' : ''}`} onClick={() => setView('monthly')}>Monthly</div>
                    <div className={`toggle-btn ${view === 'yearly' ? 'toggle-btn--active' : ''}`} onClick={() => setView('yearly')}>Yearly</div>
                </div>
            </PageHeader>

            {/* Top Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
                {[
                    { label: 'Total Income', value: `Rs. ${totalIncome.toLocaleString()}`, color: 'var(--success)' },
                    { label: 'Total Expense', value: `Rs. ${totalExpense.toLocaleString()}`, color: 'var(--danger)' },
                    { label: 'Net Savings', value: `Rs. ${savings.toLocaleString()}`, color: 'var(--primary)' },
                ].map(s => (
                    <div key={s.label} style={{ background: 'var(--surface)', borderRadius: 'var(--border-radius-lg)', padding: '18px 20px', boxShadow: 'var(--shadow-md)' }}>
                        <div style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)', marginBottom: '8px' }}>{s.label}</div>
                        <div style={{ fontSize: '22px', fontWeight: 800, color: s.color }}>{s.value}</div>
                    </div>
                ))}
            </div>

            {/* Charts */}
            <div className="analytics-charts">
                <IncomeExpenseChart data={displayData} />
                <DonutChart categories={categoryBreakdown} />
            </div>

            {/* Table */}
            <CategoryTable categories={categoryBreakdown} />
        </div>
    );
}

export default Analytics;