import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { saveAuth } from '../auth/auth-store';
import type { FormEvent } from 'react';
import type { AuthResponse } from '../types';

export function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const response =
        mode === 'login'
          ? await apiClient.post<AuthResponse>('/auth/login', {
              email,
              password,
            })
          : await apiClient.post<AuthResponse>('/auth/register', {
              email,
              password,
              firstName,
              lastName,
              organizationName,
            });

      saveAuth(response.data);
      navigate('/contacts');
    } catch {
      setError(
        mode === 'login'
          ? 'Login failed. Check email and password.'
          : 'Registration failed. Check all fields and try again.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="card form" onSubmit={onSubmit}>
        <h2>{mode === 'login' ? 'CRM Login' : 'CRM First Setup'}</h2>
        <div className="form inline">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            disabled={mode === 'login'}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
            }}
            disabled={mode === 'register'}
          >
            Register
          </button>
        </div>

        {mode === 'register' ? (
          <>
            <label>
              First name
              <input
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                required
              />
            </label>
            <label>
              Last name
              <input
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                required
              />
            </label>
            <label>
              Organization
              <input
                value={organizationName}
                onChange={(event) => setOrganizationName(event.target.value)}
                required
              />
            </label>
          </>
        ) : null}

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
          {isLoading
            ? mode === 'login'
              ? 'Signing in...'
              : 'Creating account...'
            : mode === 'login'
              ? 'Sign in'
              : 'Create account'}
        </button>
        <p className="hint">After registration, you are logged in automatically.</p>
      </form>
    </div>
  );
}
