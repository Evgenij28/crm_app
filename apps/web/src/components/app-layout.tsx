import { Link, Outlet, useNavigate } from 'react-router-dom';
import { clearAuth } from '../auth/auth-store';

export function AppLayout() {
  const navigate = useNavigate();

  const onLogout = () => {
    clearAuth();
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <h1>CRM Core</h1>
        <nav>
          <Link to="/contacts">Contacts</Link>
          <Link to="/deals">Deals</Link>
        </nav>
        <button type="button" onClick={onLogout}>
          Logout
        </button>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
