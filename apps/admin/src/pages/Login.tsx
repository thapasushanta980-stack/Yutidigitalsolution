import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button, FormField, Logo } from '@yukti/ui';
import { useAuth } from '../lib/auth.js';

export function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="admin-center">
      <form onSubmit={onSubmit} className="admin-login">
        <div className="admin-logo">
          <Logo height={26} title="Yukti" />
          <span className="admin-logo__tag admin-logo__tag--ink">Admin</span>
        </div>
        <p className="muted">Sign in to manage content and leads.</p>
        <FormField label="Email" htmlFor="email" required>
          <input
            id="email"
            type="email"
            className="yk-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            required
          />
        </FormField>
        <FormField label="Password" htmlFor="password" required>
          <input
            id="password"
            type="password"
            className="yk-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </FormField>
        {error && (
          <p className="yk-field__error" role="alert">
            {error}
          </p>
        )}
        <Button type="submit" disabled={busy}>
          {busy ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </div>
  );
}
