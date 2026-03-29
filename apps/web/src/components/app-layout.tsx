import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { clearAuth } from '../auth/auth-store';

export function AppLayout() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const onLogout = () => {
    clearAuth();
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <button
          type="button"
          className="icon-btn"
          onClick={() => setMenuOpen((value) => !value)}
        >
          Меню
        </button>
        <strong>CRM Workspace</strong>
        <div className="topbar-right">
          <Link to="/kanban">Канбан</Link>
          <button type="button" onClick={onLogout}>
            Выйти
          </button>
        </div>
      </header>

      <aside className={`sidebar ${menuOpen ? 'open' : ''}`}>
        <h1>CRM Ядро</h1>
        <nav>
          <NavLink to="/kanban">Воронка</NavLink>
          <NavLink to="/deals">Сделки</NavLink>
          <NavLink to="/contacts">Контакты</NavLink>
          <NavLink to="/tasks">Задачи</NavLink>
          <NavLink to="/projects">Проекты</NavLink>
        </nav>
        <button type="button" onClick={onLogout}>
          Выйти
        </button>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
