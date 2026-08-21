// ============================================================
//  FinTrack — API Service
//  Connects React frontend to Spring Boot backend (port 8080).
//  JWT token is stored in localStorage after login.
// ============================================================

const BASE_URL = 'http://localhost:8080/api';

// ── Core Request Helper ──────────────────────────────────────

/**
 * Makes an authenticated HTTP request to the backend.
 * Automatically attaches JWT Bearer token from localStorage.
 * Throws on non-2xx responses with the server's error message.
 */
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('fintrack_token');

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      // Attach JWT if available
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });

  const parseJsonSafely = async () => {
    const text = await res.text();
    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch {
      return null;
    }
  };

  if (!res.ok) {
    const err = (await parseJsonSafely()) ?? {};
    throw new Error(err.message ?? `Request failed: ${res.status}`);
  }

  // 204 No Content (DELETE) — no body to parse
  if (res.status === 204) return null;
  return parseJsonSafely();
}

// ── Auth Service ─────────────────────────────────────────────

export const authService = {

  /** Register with email + password. Returns { token, name, email, ... } */
  register: (name, email, password) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),

  /** Login with email + password. Returns { token, name, email, ... } */
  login: (email, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  /** Google OAuth2 login — redirects browser to Google */
  loginWithGoogle: () => {
    window.location.href = `${BASE_URL}/auth/oauth2/authorize/google`;
  },

  /** Fetch logged-in profile from backend */
  getProfile: () => request('/auth/me'),

  /** Save JWT + user info to localStorage after login */
  saveSession: (authResponse) => {
    localStorage.setItem('fintrack_token', authResponse.token);
    localStorage.setItem('fintrack_user', JSON.stringify({
      id: authResponse.id,
      name: authResponse.name,
      email: authResponse.email,
      pictureUrl: authResponse.pictureUrl,
      provider: authResponse.provider,
    }));
  },

  /** Clear session on logout */
  logout: () => {
    localStorage.removeItem('fintrack_token');
    localStorage.removeItem('fintrack_user');
  },

  /** Get current user from localStorage (no API call) */
  getCurrentUser: () => {
    const raw = localStorage.getItem('fintrack_user');
    return raw ? JSON.parse(raw) : null;
  },

  /** Check if user is logged in */
  isLoggedIn: () => !!localStorage.getItem('fintrack_token'),
};

// ── Transaction Service ──────────────────────────────────────

export const transactionService = {

  /** Get all transactions. Optional filter: type = 'income' | 'expense' */
  getAll: (params = {}) =>
    request(`/transactions?${new URLSearchParams(params)}`),

  /** Create a new transaction */
  create: (data) =>
    request('/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /** Update a transaction by ID */
  update: (id, data) =>
    request(`/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  /** Delete a transaction by ID */
  delete: (id) =>
    request(`/transactions/${id}`, { method: 'DELETE' }),

  /** Dashboard summary: { totalIncome, totalExpense, balance, savings } */
  getSummary: () => request('/transactions/summary'),
};

// ── Budget Service ───────────────────────────────────────────

export const budgetService = {

  /** Get all budgets for a month. month: 1–12, year: e.g. 2024 */
  getAll: (month, year) =>
    request(`/budgets?month=${month}&year=${year}`),

  /** Create or update a budget */
  set: (data) =>
    request('/budgets', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /** Update an existing budget's limit */
  update: (id, data) =>
    request(`/budgets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  /** Delete a budget */
  delete: (id) =>
    request(`/budgets/${id}`, { method: 'DELETE' }),
};

// ── Goal Service ─────────────────────────────────────────────

export const goalService = {

  /** Get all savings goals */
  getAll: () => request('/goals'),

  /** Create a new goal */
  create: (data) =>
    request('/goals', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /** Update goal info */
  update: (id, data) =>
    request(`/goals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  /** Add contribution amount to a goal */
  contribute: (id, amount) =>
    request(`/goals/${id}/contribute`, {
      method: 'POST',
      body: JSON.stringify({ amount }),
    }),

  /** Delete a goal */
  delete: (id) =>
    request(`/goals/${id}`, { method: 'DELETE' }),
};
