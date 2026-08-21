// ============================================================
//  FinTrack — Custom React Hooks
//  Encapsulate API calls and loading/error state for each resource.
//  Used by Dashboard, Transactions, Budget, Goals pages.
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { transactionService, budgetService, goalService } from '../services/api';

// ── useTransactions ──────────────────────────────────────────

/**
 * Hook for fetching and managing transactions.
 * @param {object} filters - Optional: { type: 'income' | 'expense' }
 */
export function useTransactions(filters = {}) {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary]           = useState(null);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch transactions and summary in parallel
      const [txns, sum] = await Promise.all([
        transactionService.getAll(filters),
        transactionService.getSummary(),
      ]);
      setTransactions(txns);
      setSummary(sum);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);  // eslint-disable-line

  useEffect(() => { fetchAll(); }, [fetchAll]);

  /** Add a new transaction to the backend and local state */
  const addTransaction = async (data) => {
    const created = await transactionService.create(data);
    setTransactions(prev => [created, ...prev]);
    // Refresh summary totals
    const sum = await transactionService.getSummary();
    setSummary(sum);
    return created;
  };

  /** Remove a transaction from backend and local state */
  const removeTransaction = async (id) => {
    await transactionService.delete(id);
    setTransactions(prev => prev.filter(t => t.id !== id));
    // Refresh summary
    const sum = await transactionService.getSummary();
    setSummary(sum);
  };

  return {
    transactions,
    summary,
    loading,
    error,
    refetch: fetchAll,
    addTransaction,
    removeTransaction,
  };
}

// ── useBudgets ───────────────────────────────────────────────

/**
 * Hook for fetching and managing budgets for a given month/year.
 * @param {number} month - 1–12
 * @param {number} year  - e.g. 2024
 */
export function useBudgets(month, year) {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const fetchBudgets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await budgetService.getAll(month, year);
      setBudgets(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => { fetchBudgets(); }, [fetchBudgets]);

  /** Create or update a budget limit */
  const saveBudget = async (data) => {
    const saved = await budgetService.set({ ...data, month, year });
    setBudgets(prev => {
      const exists = prev.find(b => b.id === saved.id);
      return exists
        ? prev.map(b => b.id === saved.id ? saved : b)
        : [...prev, saved];
    });
    return saved;
  };

  /** Update limit of existing budget */
  const updateBudget = async (id, data) => {
    const updated = await budgetService.update(id, { ...data, month, year });
    setBudgets(prev => prev.map(b => b.id === id ? updated : b));
    return updated;
  };

  /** Remove a budget */
  const removeBudget = async (id) => {
    await budgetService.delete(id);
    setBudgets(prev => prev.filter(b => b.id !== id));
  };

  return {
    budgets,
    loading,
    error,
    refetch: fetchBudgets,
    saveBudget,
    updateBudget,
    removeBudget,
  };
}

// ── useGoals ─────────────────────────────────────────────────

/**
 * Hook for fetching and managing savings goals.
 */
export function useGoals() {
  const [goals, setGoals]     = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const fetchGoals = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await goalService.getAll();
      setGoals(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchGoals(); }, [fetchGoals]);

  /** Create a new goal */
  const addGoal = async (data) => {
    const created = await goalService.create(data);
    setGoals(prev => [created, ...prev]);
    return created;
  };

  /** Add a contribution amount to a goal */
  const contributeToGoal = async (id, amount) => {
    const updated = await goalService.contribute(id, amount);
    setGoals(prev => prev.map(g => g.id === id ? updated : g));
    return updated;
  };

  /** Remove a goal */
  const removeGoal = async (id) => {
    await goalService.delete(id);
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  return {
    goals,
    loading,
    error,
    refetch: fetchGoals,
    addGoal,
    contributeToGoal,
    removeGoal,
  };
}
