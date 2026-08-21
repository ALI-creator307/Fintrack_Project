import { useEffect } from 'react';
import { authService } from '../services/api';

/**
 * OAuth2 Callback Page
 * Route: /oauth2/callback
 *
 * After Google login, the backend redirects here with:
 *   /oauth2/callback?token=<JWT>
 *
 * This page:
 *   1. Reads the token from the URL
 *   2. Saves it to localStorage
 *   3. Calls onLogin to update App state
 *   4. Redirects to dashboard
 */
function OAuth2Callback({ onLogin }) {
  useEffect(() => {
    const completeOAuthLogin = async () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');

      if (!token) {
        window.location.href = '/';
        return;
      }

      try {
        localStorage.setItem('fintrack_token', token);
        const profile = await authService.getProfile();
        authService.saveSession({ token, ...profile });
        onLogin(authService.getCurrentUser());
      } catch {
        localStorage.removeItem('fintrack_token');
        localStorage.removeItem('fintrack_user');
        window.location.href = '/';
      }
    };

    completeOAuthLogin();
  }, [onLogin]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--primary-bg)',
      flexDirection: 'column',
      gap: '16px',
    }}>
      <div style={{
        width: 44,
        height: 44,
        background: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
        borderRadius: 12,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontWeight: 800,
        fontSize: 18,
      }}>F</div>
      <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-family)' }}>
        Signing you in...
      </p>
    </div>
  );
}

export default OAuth2Callback;
