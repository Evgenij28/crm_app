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
          ? 'Не удалось войти. Проверьте email и пароль.'
          : 'Не удалось зарегистрироваться. Проверьте все поля и попробуйте снова.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="card form" onSubmit={onSubmit}>
        <h2>{mode === 'login' ? 'Вход в CRM' : 'Первичная настройка CRM'}</h2>
        <div className="form inline">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            disabled={mode === 'login'}
          >
            Вход
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
            }}
            disabled={mode === 'register'}
          >
            Регистрация
          </button>
        </div>

        {mode === 'register' ? (
          <>
            <label>
              Имя
              <input
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                required
              />
            </label>
            <label>
              Фамилия
              <input
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                required
              />
            </label>
            <label>
              Организация
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
          Пароль
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
              ? 'Выполняется вход...'
              : 'Создаем аккаунт...'
            : mode === 'login'
              ? 'Войти'
              : 'Создать аккаунт'}
        </button>
        <p className="hint">После регистрации вы автоматически войдете в систему.</p>
      </form>
    </div>
  );
}
