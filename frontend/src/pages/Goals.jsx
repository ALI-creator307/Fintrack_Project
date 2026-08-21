import { useState } from 'react';
import './Goals.css';
import '../components/Shared/Shared.css';
import PageHeader from '../components/Shared/PageHeader';
import { useGoals } from '../hooks/useFinTrack';

/* ── Add Goal Modal ── */
function AddGoalModal({ onClose, onAdd }) {
    const [form, setForm] = useState({ name: '', icon: '🎯', bg: '#f0eeff', targetAmount: '', deadline: '' });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(p => ({ ...p, [name]: value }));
    };

    const handleSubmit = () => {
        if (!form.name || !form.targetAmount || !form.deadline) return;
        onAdd({ ...form, targetAmount: parseFloat(form.targetAmount) });
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal__header">
                    <span className="modal__title">🎯 New Savings Goal</span>
                    <div className="modal__close" onClick={onClose}>✕</div>
                </div>

                <div className="form-group">
                    <label className="form-label">Goal Name</label>
                    <input className="form-input" name="name" placeholder="e.g. New Car" value={form.name} onChange={handleChange} />
                </div>
                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label">Target Amount (Rs.)</label>
                        <input className="form-input" name="targetAmount" type="number" placeholder="100000" value={form.targetAmount} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Deadline</label>
                        <input className="form-input" name="deadline" placeholder="Dec 2025" value={form.deadline} onChange={handleChange} />
                    </div>
                </div>

                <div className="modal__footer">
                    <button className="btn-secondary" onClick={onClose}>Cancel</button>
                    <button className="btn-primary" onClick={handleSubmit}>Create Goal</button>
                </div>
            </div>
        </div>
    );
}

/* ── Goal Card ── */
function GoalCard({ goal, onContribute }) {
    const [amount, setAmount] = useState('');
    const saved = Number(goal.savedAmount ?? 0);
    const target = Number(goal.targetAmount ?? 0);
    const percent = target > 0 ? Math.min(Math.round((saved / target) * 100), 100) : 0;
    const isDone = goal.status === 'completed' || percent >= 100;
    const remaining = target - saved;

    const handleContribute = () => {
        const val = parseFloat(amount);
        if (!val || val <= 0) return;
        onContribute(goal.id, val);
        setAmount('');
    };

    return (
        <div className="goal-card">
            <div className="goal-card__header">
                <div className="goal-card__left">
                    <div className="goal-card__icon" style={{ background: goal.bg }}>{goal.icon}</div>
                    <div>
                        <div className="goal-card__name">{goal.name}</div>
                        <div className="goal-card__deadline">🗓️ Target: {goal.deadline}</div>
                    </div>
                </div>
                <div className={`goal-card__status goal-card__status--${isDone ? 'completed' : 'active'}`}>
                    {isDone ? '✅ Done' : '🔄 Active'}
                </div>
            </div>

            <div className="goal-card__amounts">
                <span className="goal-card__saved">Rs. {saved.toLocaleString()}</span>
                <span className="goal-card__target">of Rs. {target.toLocaleString()}</span>
            </div>

            <div className="goal-card__bar">
                <div className={`goal-card__fill ${isDone ? 'goal-card__fill--done' : ''}`} style={{ width: `${percent}%` }} />
            </div>

            <div className="goal-card__footer">
                <span className="goal-card__remaining">
                    {isDone ? 'Goal achieved! 🎉' : `Rs. ${remaining.toLocaleString()} remaining`}
                </span>
                <span className={`goal-card__percent ${isDone ? 'goal-card__percent--done' : ''}`}>{percent}%</span>
            </div>

            {!isDone && (
                <div className="goal-card__contribute">
                    <input
                        className="contribute-input"
                        type="number"
                        placeholder="Add amount..."
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                    />
                    <button className="contribute-btn" onClick={handleContribute}>+ Add</button>
                </div>
            )}
        </div>
    );
}

/* ── Main Goals Page ── */
function Goals() {
    const { goals, loading, error, addGoal, contributeToGoal } = useGoals();
    const [showModal, setShowModal] = useState(false);

    const totalTarget = goals.reduce((s, g) => s + Number(g.targetAmount ?? 0), 0);
    const totalSaved = goals.reduce((s, g) => s + Number(g.savedAmount ?? 0), 0);

    const handleContribute = (id, amount) => {
        contributeToGoal(id, amount);
    };

    const handleAdd = (goal) => {
        addGoal(goal);
    };

    return (
        <div className="goals-page">
            <PageHeader
                title="🎯 Savings Goals"
                subtitle={`${goals.length} goals · Rs. ${totalSaved.toLocaleString()} saved of Rs. ${totalTarget.toLocaleString()}`}
            >
                <button className="btn-primary" onClick={() => setShowModal(true)}>➕ New Goal</button>
            </PageHeader>

            {error && <div className="budget-alert budget-alert--danger">{error}</div>}
            {loading && <div style={{ color: 'var(--text-muted)', marginBottom: '10px' }}>Loading goals...</div>}

            <div className="goals-grid">
                {goals.map(g => (
                    <GoalCard key={g.id} goal={g} onContribute={handleContribute} />
                ))}
            </div>

            {showModal && (
                <AddGoalModal onClose={() => setShowModal(false)} onAdd={handleAdd} />
            )}
        </div>
    );
}

export default Goals;