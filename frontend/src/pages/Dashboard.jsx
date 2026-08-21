import './Dashboard.css';
import DashboardHeader from '../components/DashboardHeader';
import StatCards from '../components/StatCards';
import MoneyFlowChart from '../components/MoneyFlowChart';
import BudgetPlanner from '../components/BudgetPlanner';
import RecentTransactions from '../components/RecentTransactions';
import { useTransactions, useBudgets } from '../hooks/useFinTrack';

/**
 * Dashboard Page
 * Shows financial summary for the logged-in user.
 * All data comes from the Spring Boot backend via hooks.
 *
 * Props:
 *   user — current logged-in user object from localStorage
 */
function Dashboard({ user }) {
  // Real data from backend
  const { transactions, summary, loading: txnLoading } = useTransactions();
  const { budgets, loading: budgetLoading } = useBudgets(
    new Date().getMonth() + 1,  // current month (1-12)
    new Date().getFullYear()
  );

  // Show loading state while data is being fetched
  if (txnLoading) {
    return (
      <div className="dashboard">
        <div className="dashboard__loading">Loading your data...</div>
      </div>
    );
  }

  // Summary defaults to zero if no data yet
  const summaryData = summary ?? {
    balance: 0,
    totalIncome: 0,
    totalExpense: 0,
    savings: 0,
  };

  // StatCards expects: balance, income, expenses, savings
  const statSummary = {
    balance: summaryData.balance,
    income: summaryData.totalIncome,
    expenses: summaryData.totalExpense,
    savings: summaryData.savings,
  };

  // Last 3 transactions for Recent Transactions widget
  const recentTxns = transactions.slice(0, 3).map(t => ({
    id: t.id,
    name: t.name,
    category: t.category,
    date: t.date,
    amount: t.amount,
    type: t.type,
  }));

  // Budget planner format: { category, spent, limit }
  const budgetItems = budgets.map(b => ({
    category: b.category,
    spent: parseFloat(b.spentAmount) ?? 0,
    limit: parseFloat(b.limitAmount) ?? 0,
  }));

  // Money flow chart: last 7 months (mock months for now,
  // replace with /api/reports/monthly later)
  const FLOW_DATA = [
    { month: 'Jan', income: 28000, expense: 11000 },
    { month: 'Feb', income: 30000, expense: 13500 },
    { month: 'Mar', income: 35000, expense: 16000 },
    { month: 'Apr', income: 29000, expense: 12000 },
    { month: 'May', income: 33000, expense: 14500 },
    { month: 'Jun', income: 31500, expense: 13000 },
    { month: 'Jul', income: summaryData.totalIncome, expense: summaryData.totalExpense },
  ];

  return (
    <div className="dashboard">
      {/* Header with real user name */}
      <DashboardHeader
        userName={user?.name ?? 'User'}
        pictureUrl={user?.pictureUrl}
        hasNotifications={true}
      />

      {/* Summary stat cards */}
      <StatCards summary={statSummary} />

      <div className="dashboard__bottom">
        {/* Money flow chart */}
        <MoneyFlowChart data={FLOW_DATA} />

        <div className="dashboard__right-col">
          {/* Budget progress bars */}
          <BudgetPlanner budgets={budgetItems} />

          {/* Last 3 transactions */}
          <RecentTransactions transactions={recentTxns} />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;