import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { saveAuth } from '../auth/auth-store';
import type { FormEvent } from 'react';
import type { AuthResponse } from '../types';

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', {
        email,
        password,
      });
      saveAuth(response.data);
      navigate('/contacts');
    } catch {
      setError('Login failed. Check email and password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="card form" onSubmit={onSubmit}>
        <h2>CRM Login</h2>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>
        {error ? <p className="error">{error}</p> : null}
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Signing in...' : 'Sign in'}
        </button>
        <p className="hint">
          New account: call <code>/auth/register</code> from API client or Postman.
        </p>
      </form>
    </div>
  );
}
