import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/app-layout';
import { readAuth } from './auth/auth-store';
import { ContactsPage } from './pages/contacts-page';
import { DealsPage } from './pages/deals-page';
import { LoginPage } from './pages/login-page';

function Protected() {
  const auth = readAuth();
  if (!auth?.accessToken) {
    return <Navigate to="/login" replace />;
  }
  return <AppLayout />;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<Protected />}>
        <Route index element={<Navigate to="/contacts" replace />} />
        <Route path="contacts" element={<ContactsPage />} />
        <Route path="deals" element={<DealsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
