import { useState } from 'react';
import { authService } from '../services/api';
import './Login.css';

/**
 * Login Page
 * Supports:
 *   1. Email + Password (local login)
 *   2. Google OAuth2 (redirects to Google)
 *
 * On success → calls onLogin(user) to update App state.
 */
function Login({ onLogin, onNavigateRegister }) {
  const [form, setForm]       = useState({ email: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  /** Local email + password login */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.login(form.email.trim().toLowerCase(), form.password);
      authService.saveSession(response);       // save JWT + user to localStorage
      onLogin(authService.getCurrentUser());   // update App state
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo__icon">F</div>
          <span className="auth-logo__text">FinTrack</span>
        </div>

        <h2 className="auth-title">Welcome back 👋</h2>
        <p className="auth-subtitle">Sign in to your account</p>

        {/* Error message */}
        {error && <div className="auth-error">{error}</div>}

        {/* Local login form */}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="form-input"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <button
            className="btn-primary auth-submit"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Divider */}
        <div className="auth-divider">
          <span>or continue with</span>
        </div>

        {/* Google OAuth2 button */}
        <button
          className="btn-google"
          onClick={() => authService.loginWithGoogle()}
          type="button"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
            <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        {/* Register link */}
        <p className="auth-footer">
          Don't have an account?{' '}
          <span className="auth-link" onClick={onNavigateRegister}>
            Create one
          </span>
        </p>

      </div>
    </div>
  );
}

export default Login;
